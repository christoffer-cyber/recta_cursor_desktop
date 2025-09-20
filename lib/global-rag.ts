// Global RAG system instance for persistence across requests
import { RectaRAGSystem } from './rag-system';

// Global RAG instance
let globalRagSystem: RectaRAGSystem | null = null;
let isInitialized = false;

export function getGlobalRagSystem(): RectaRAGSystem | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key not configured');
    return null;
  }
  
  if (!globalRagSystem) {
    globalRagSystem = new RectaRAGSystem(apiKey);
    console.log('🚀 Global RAG system created');
  }
  
  return globalRagSystem;
}

// Auto-initialize RAG system with basic knowledge if not already done
export async function ensureRagInitialized(): Promise<boolean> {
  try {
    if (isInitialized) {
      return true;
    }

    const ragSystem = getGlobalRagSystem();
    if (!ragSystem) {
      return false;
    }

    console.log('🔄 Auto-initializing RAG system...');
    
    // Import and use the scraper
    const { RectaDataScraper } = await import('./data-scraper');
    const scraper = new RectaDataScraper();
    const knowledgeChunks = await scraper.scrapeInitialKnowledgeBase();
    
    await ragSystem.addKnowledge(knowledgeChunks);
    setRagSystemInitialized(true);
    
    console.log('✅ RAG system auto-initialized successfully');
    return true;
    
  } catch (error) {
    console.error('❌ RAG auto-initialization failed:', error);
    return false;
  }
}

export function setRagSystemInitialized(initialized: boolean) {
  isInitialized = initialized;
}

export function isRagSystemInitialized(): boolean {
  return isInitialized && globalRagSystem !== null;
}

export function getRagSystemStats() {
  if (!globalRagSystem) return null;
  return globalRagSystem.getStats();
}
