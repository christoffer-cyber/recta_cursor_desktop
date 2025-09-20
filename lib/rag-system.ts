// RAG System for Recta - Knowledge-driven recruitment analysis
import { OpenAI } from 'openai';

export interface KnowledgeChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    domain: string; // e-commerce, consumer-goods, finance, sales, customer-service
    role?: string;
    industry?: string;
    lastUpdated: Date;
    relevanceScore?: number;
  };
  embedding?: number[];
}

export interface RAGQuery {
  question: string;
  context: {
    industry?: string;
    role?: string;
    companySize?: string;
    stage?: string;
  };
}

export interface RAGResponse {
  answer: string;
  sources: KnowledgeChunk[];
  confidence: number;
}

export class RectaRAGSystem {
  private openai: OpenAI;
  private knowledgeBase: KnowledgeChunk[] = [];

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  // Add knowledge to the system
  async addKnowledge(chunks: KnowledgeChunk[]): Promise<void> {
    // Generate embeddings for new chunks
    for (const chunk of chunks) {
      chunk.embedding = await this.generateEmbedding(chunk.content);
    }
    
    this.knowledgeBase.push(...chunks);
    console.log(`Added ${chunks.length} knowledge chunks to RAG system`);
  }

  // Generate embeddings for text
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return [];
    }
  }

  // Find relevant knowledge chunks
  private async findRelevantChunks(query: RAGQuery, topK: number = 5): Promise<(KnowledgeChunk & { similarity: number })[]> {
    const queryEmbedding = await this.generateEmbedding(query.question);
    
    // Calculate similarity scores
    const scoredChunks = this.knowledgeBase
      .filter(chunk => {
        // Filter by context if provided
        if (query.context.industry && chunk.metadata.industry && 
            !chunk.metadata.industry.toLowerCase().includes(query.context.industry.toLowerCase())) {
          return false;
        }
        if (query.context.role && chunk.metadata.role && 
            !chunk.metadata.role.toLowerCase().includes(query.context.role.toLowerCase())) {
          return false;
        }
        return true;
      })
      .map(chunk => ({
        ...chunk,
        similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding || [])
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return scoredChunks;
  }

  // Calculate cosine similarity between vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Main RAG query method
  async query(ragQuery: RAGQuery): Promise<RAGResponse> {
    try {
      // Find relevant knowledge chunks
      const relevantChunks = await this.findRelevantChunks(ragQuery);
      
      if (relevantChunks.length === 0) {
        return {
          answer: "Jag har inte tillräcklig kunskap inom det området för att ge en grundlig analys.",
          sources: [],
          confidence: 0
        };
      }

      // Build context from relevant chunks
      const context = relevantChunks
        .map(chunk => `Source: ${chunk.metadata.source}\n${chunk.content}`)
        .join('\n\n---\n\n');

      // Generate response using RAG
      const systemPrompt = `Du är en expert på strategisk rekrytering och organisationsutveckling. 
      Använd den tillhandahållna kunskapen för att ge djupgående, actionable insights.
      
      Fokusområden:
      - E-handel och consumer goods
      - Ekonomifunktioner (CFO, Controller, etc.)
      - Försäljning och customer service
      
      Svara alltid på svenska och vara konkret och praktisk.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Baserat på följande kunskap, besvara frågan: "${ragQuery.question}"
            
            Kontext: ${JSON.stringify(ragQuery.context)}
            
            Tillgänglig kunskap:
            ${context}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const answer = response.choices[0].message.content || "Kunde inte generera svar.";
      
      // Calculate confidence based on relevance and amount of sources
      const avgSimilarity = relevantChunks.reduce((sum, chunk) => sum + (chunk.similarity || 0), 0) / relevantChunks.length;
      const confidence = Math.min(avgSimilarity * relevantChunks.length / 3, 1);

      // Remove similarity and deduplicate sources before returning
      const cleanSources = relevantChunks.map(({ similarity, ...chunk }) => chunk);
      
      // Deduplicate sources by source name
      const uniqueSources = cleanSources.filter((source, index, array) => 
        array.findIndex(s => s.metadata.source === source.metadata.source) === index
      );

      return {
        answer,
        sources: uniqueSources,
        confidence
      };

    } catch (error) {
      console.error('RAG query error:', error);
      return {
        answer: "Ett fel uppstod vid kunskapssökning.",
        sources: [],
        confidence: 0
      };
    }
  }

  // Get knowledge base statistics
  getStats() {
    const domains = this.knowledgeBase.reduce((acc, chunk) => {
      acc[chunk.metadata.domain] = (acc[chunk.metadata.domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalChunks: this.knowledgeBase.length,
      domains,
      lastUpdated: Math.max(...this.knowledgeBase.map(c => c.metadata.lastUpdated.getTime()))
    };
  }
}

// Knowledge chunk builders for different domains
export const KnowledgeBuilders = {
  roleSpecification: (role: string, industry: string, content: string, source: string): KnowledgeChunk => ({
    id: `role-${role.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    content,
    metadata: {
      source,
      domain: industry.toLowerCase().includes('e-commerce') ? 'e-commerce' : 
              industry.toLowerCase().includes('consumer') ? 'consumer-goods' :
              industry.toLowerCase().includes('finance') ? 'finance' : 'general',
      role,
      industry,
      lastUpdated: new Date()
    }
  }),

  salaryBenchmark: (role: string, industry: string, region: string, data: string, source: string): KnowledgeChunk => ({
    id: `salary-${role.toLowerCase().replace(/\s+/g, '-')}-${region}-${Date.now()}`,
    content: `Lönedata för ${role} inom ${industry} i ${region}: ${data}`,
    metadata: {
      source,
      domain: 'salary-benchmarks',
      role,
      industry,
      lastUpdated: new Date()
    }
  }),

  industryInsight: (industry: string, insight: string, source: string): KnowledgeChunk => ({
    id: `insight-${industry.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    content: insight,
    metadata: {
      source,
      domain: industry.toLowerCase().includes('e-commerce') ? 'e-commerce' : 
              industry.toLowerCase().includes('consumer') ? 'consumer-goods' : 'general',
      industry,
      lastUpdated: new Date()
    }
  })
};
