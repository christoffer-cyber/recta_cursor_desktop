import { NextRequest, NextResponse } from 'next/server';
import { getGlobalRagSystem, isRagSystemInitialized } from '../../../../lib/global-rag';
import { CompanyIntelligenceAgent, detectCompanyName } from '../../../../lib/company-intelligence';
import { ArenaLogicEngine, CLUSTER_PROMPTS, CLUSTER_DEFINITIONS } from '../../../../lib/arena-clusters';
import { ClusterType, ArenaCluster } from '../../../../lib/types';
import { getClaudeClient, ClaudeMessage } from '../../../../lib/claude-client';
import { z } from 'zod';
import { CLAUDE_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '../../../../lib/ai-config';

const SYSTEM_PROMPT = `Du är en expert på strategisk rekrytering och organisationsutveckling. Din uppgift är att hjälpa företag att förbereda sig optimalt innan de påbörjar en rekryteringsprocess.

Din mission:
1. Extrahera kritisk information om företaget, rollen och kontexten
2. Utmana användarens antaganden och bias på ett konstruktivt sätt
3. Hjälpa dem identifiera dolda behov och risker
4. Säkerställa att de har gjort grundarbetet innan rekrytering

Du pratar svenska och är professionell men vänlig. Ställ en fråga i taget och bygg på svaren progressivt. 

KRITISKT: Säg ALDRIG "ANALYS_KLAR" förrän du har utforskat ALLA dessa områden grundligt:
1. Business Pain Point (verkligt problem bakom behovet)
2. Impact & Urgency (affärskritikalitet och prioritering)
3. Success Reality Check (konkreta, mätbara framgångskriterier)
4. Resource Boundaries (realistisk budget och resurser)
5. Organizational Reality (kulturell beredskap och tidigare erfarenheter)
6. Alternative Validation (utmana rekrytering som bästa lösning)

Endast när alla 6 områden har täckts djupt kan du säga "ANALYS_KLAR".

Viktiga områden att täcka:
- Företagets tillväxtfas och strategiska mål
- Specifika utmaningar som rollen ska lösa
- Team-dynamik och kulturella aspekter
- Budget och tidslinje
- Tidigare rekryteringsframgångar/misslyckanden
- Konkreta prestationsmål för rollen

Börja med att hälsa och fråga om företaget och den tänkta rollen.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const Schema = z.object({
      messages: z.array(z.object({ role: z.enum(['user','assistant','system']), content: z.string() })).min(1),
      sessionId: z.string().optional(),
      extractedData: z.any().optional(),
      currentCluster: z.string().optional(),
      clusters: z.record(z.any()).optional(),
      overallConfidence: z.number().optional(),
    });
    const { 
      messages, 
      sessionId, 
      extractedData,
      currentCluster,
      clusters,
      overallConfidence 
    } = Schema.parse(body);

    // Get latest user message for RAG enhancement
    const latestUserMessage = messages[messages.length - 1];
    let ragEnhancement = '';
    let ragSources: string[] = [];

    // 🤖 Company Intelligence Agent - detect company names and trigger background processing
    if (latestUserMessage && latestUserMessage.role === 'user') {
      const detectedCompany = detectCompanyName(latestUserMessage.content);
      if (detectedCompany) {
        console.log(`🏢 Company detected: ${detectedCompany} - triggering background intelligence gathering`);
        
        // Trigger background company intelligence (don't await - let it run in background)
        const companyAgent = new CompanyIntelligenceAgent();
        companyAgent.gatherCompanyIntelligence(detectedCompany)
          .then(companyData => {
            if (companyData) {
              console.log(`✅ Company intelligence completed for ${detectedCompany}:`, {
                revenue: companyData.financial.revenue,
                employees: companyData.financial.employees,
                industry: companyData.industry.industry
              });
              // TODO: Store this data for later use in report generation
            }
          })
          .catch(error => {
            console.error(`❌ Company intelligence failed for ${detectedCompany}:`, error);
          });
      }
    }

    // Debug logging
    console.log('RAG enhancement check:', {
      hasLatestMessage: !!latestUserMessage,
      isUser: latestUserMessage?.role === 'user',
      hasExtractedData: !!extractedData,
      ragInitialized: isRagSystemInitialized()
    });

    // Optimize RAG: Only try if already initialized, don't wait for initialization
    if (latestUserMessage && latestUserMessage.role === 'user' && isRagSystemInitialized()) {
      try {
        const rag = getGlobalRagSystem();
        if (rag) {
          // Set timeout for RAG query to avoid blocking
          const ragPromise = rag.query({
            question: latestUserMessage.content,
            context: {
              industry: extractedData?.industry,
              role: extractedData?.roleTitle,
              companySize: extractedData?.companySize,
              stage: extractedData?.stage
            }
          });

          // Race between RAG response and timeout
          const ragResponse = await Promise.race([
            ragPromise,
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('RAG timeout')), 3000)
            )
          ]);

          if (ragResponse.confidence > 0.3) {
            ragEnhancement = ragResponse.answer;
            ragSources = ragResponse.sources.map(s => s.metadata.source);
            console.log('RAG enhancement applied with confidence:', ragResponse.confidence);
          }
        }
      } catch (ragError) {
        console.log('RAG enhancement skipped (timeout/error):', ragError instanceof Error ? ragError.message : 'Unknown error');
      }
    }

    // Determine next cluster based on adaptive logic
    let nextCluster = currentCluster;
    let clusterUpdate = null;
    
    if (currentCluster && clusters && latestUserMessage?.role === 'user') {
      nextCluster = ArenaLogicEngine.getNextCluster(
        currentCluster as ClusterType,
        clusters,
        latestUserMessage.content,
        []
      );
      
      // Simulate confidence update based on message quality
      const confidenceIncrease = latestUserMessage.content.length > 50 ? 15 : 5;
      const currentClusterData = clusters[currentCluster as ClusterType];
      const newConfidence = Math.min(100, (currentClusterData?.confidence || 0) + confidenceIncrease);
      
      clusterUpdate = {
        clusterId: currentCluster,
        updates: {
          confidence: newConfidence,
          keyInsights: [...(currentClusterData?.keyInsights || []), `User insight: ${latestUserMessage.content.substring(0, 100)}...`],
          status: newConfidence >= 75 ? 'complete' : 'in-progress'
        }
      };
    }

    // Get cluster-specific prompt
    const clusterPrompt = currentCluster && CLUSTER_PROMPTS[currentCluster as ClusterType] 
      ? CLUSTER_PROMPTS[currentCluster as ClusterType]
      : SYSTEM_PROMPT;

    // Enhanced system prompt with cluster focus and RAG knowledge
    const enhancedSystemPrompt = `${clusterPrompt}

    ${ragEnhancement ? `
    BRANSCHEXPERTIS (använd denna kunskap för att ge mer precisa svar):
    ${ragEnhancement}
    
    Källor: ${ragSources.join(', ')}
    ` : ''}

    ${extractedData ? `
    KONVERSATIONSKONTEXT:
    - Företag: ${extractedData.companyName || 'Ej angivet'}
    - Bransch: ${extractedData.industry || 'Ej angivet'}  
    - Roll: ${extractedData.roleTitle || 'Ej angivet'}
    - Företagsstorlek: ${extractedData.companySize || 'Ej angivet'}
    ` : ''}

    ${currentCluster ? `
    AKTUELLT FOKUS: ${currentCluster.toUpperCase().replace('-', ' ')}
    Confidence: ${clusters?.[currentCluster as ClusterType]?.confidence || 0}%
    
    ${nextCluster !== currentCluster ? `
    NÄSTA STEG: Övergå till ${nextCluster.toUpperCase().replace('-', ' ')} efter denna fråga.
    ` : ''}
    ` : ''}`;

    // Initialize Claude client
    const claude = getClaudeClient();
    if (!claude.isConfigured()) {
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    // Convert messages to Claude format
    const claudeMessages: ClaudeMessage[] = messages.map((msg: {role: string, content: string}) => ({
      role: msg.role === 'system' ? 'assistant' : msg.role as 'user' | 'assistant', // Claude doesn't support system role in messages
      content: msg.content
    }));

    const response = await claude.chat(
      claudeMessages,
      enhancedSystemPrompt, // System prompt goes separately in Claude
      {
        model: CLAUDE_MODEL,
        maxTokens: Math.min(DEFAULT_MAX_TOKENS, 400),
        temperature: DEFAULT_TEMPERATURE
      }
    );

    const aiResponse = response.content || "Jag kunde inte generera ett svar. Försök igen.";
    
    // Check if analysis is complete using cluster logic
    const analysisComplete = clusters && ArenaLogicEngine.isAnalysisComplete(clusters);
    const isComplete = aiResponse.includes("ANALYS_KLAR") && analysisComplete;
    
    let finalMessage = aiResponse.replace("ANALYS_KLAR", "").trim();
    
    // If AI tries to complete but clusters aren't ready, redirect
    if (aiResponse.includes("ANALYS_KLAR") && !analysisComplete) {
      const incompleteClusters = Object.entries(clusters || {})
        .filter(([, cluster]) => (cluster as ArenaCluster).confidence < 70)
        .map(([id]) => CLUSTER_DEFINITIONS[id as ClusterType]?.name)
        .filter(Boolean);
      
      finalMessage = `Jag märker att vi har gjort bra framsteg, men för att ge dig den bästa möjliga analysen behöver vi utforska några områden djupare. Låt oss fortsätta med ${incompleteClusters[0] || 'nästa viktiga område'}.`;
      
      // Force continue the analysis
      const nextIncompleteCluster = Object.entries(clusters || {})
        .find(([, cluster]) => (cluster as ArenaCluster).confidence < 70)?.[0] as ClusterType;
      
      if (nextIncompleteCluster) {
        nextCluster = nextIncompleteCluster;
      }
    } else if (isComplete && finalMessage.length < 10) {
      finalMessage = "Perfekt! Jag har nu tillräcklig information för att skapa en grundlig analys. Låt oss generera rapporten.";
    }
    
    return NextResponse.json({
      message: finalMessage,
      isComplete: isComplete || analysisComplete,
      sessionId,
      ragEnhanced: ragEnhancement.length > 0,
      sources: ragSources,
      // Cluster information
      clusterId: currentCluster,
      nextCluster: nextCluster !== currentCluster ? nextCluster : undefined,
      clusterUpdate,
      confidenceImpact: clusterUpdate?.updates?.confidence ? 
        clusterUpdate.updates.confidence - (clusters?.[currentCluster as ClusterType]?.confidence || 0) : 0
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.flatten() }, { status: 400 });
    }
    console.error('AI service error:', error);
    return NextResponse.json(
      { error: 'Kunde inte kontakta AI-tjänsten. Försök igen.' },
      { status: 500 }
    );
  }
}
