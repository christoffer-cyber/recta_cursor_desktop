import { NextRequest, NextResponse } from 'next/server';
import { RectaDataScraper } from '../../../../lib/data-scraper';
import { getGlobalRagSystem, setRagSystemInitialized, isRagSystemInitialized, getRagSystemStats } from '../../../../lib/global-rag';

// Initialize RAG system with scraped knowledge
export async function POST(_request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    console.log('Initializing RAG system...');
    
    // Check if already initialized
    if (isRagSystemInitialized()) {
      const stats = getRagSystemStats();
      return NextResponse.json({
        success: true,
        message: 'RAG system already initialized',
        stats
      });
    }
    
    // Get global RAG system instance
    const ragSystem = getGlobalRagSystem();
    if (!ragSystem) {
      return NextResponse.json({ error: 'Failed to initialize RAG system' }, { status: 500 });
    }
    
    const scraper = new RectaDataScraper();
    
    // Scrape initial knowledge base
    console.log('Scraping initial knowledge base...');
    const knowledgeChunks = await scraper.scrapeInitialKnowledgeBase();
    
    console.log(`Scraped ${knowledgeChunks.length} knowledge chunks`);
    
    // Add knowledge to RAG system
    console.log('Adding knowledge to RAG system...');
    await ragSystem.addKnowledge(knowledgeChunks);
    
    console.log('Knowledge added successfully');
    
    // Mark as initialized
    setRagSystemInitialized(true);
    
    // Get statistics
    const stats = ragSystem.getStats();
    
    console.log('RAG system initialized successfully:', stats);
    
    return NextResponse.json({
      success: true,
      message: 'RAG system initialized successfully',
      stats
    });
    
  } catch (error) {
    console.error('Error initializing RAG system:', error);
    return NextResponse.json({ 
      error: 'Failed to initialize RAG system',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get RAG system statistics
export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    if (isRagSystemInitialized()) {
      const stats = getRagSystemStats();
      return NextResponse.json(stats);
    }

    return NextResponse.json({
      totalChunks: 0,
      domains: {},
      lastUpdated: null,
      message: 'RAG system not yet initialized. Call POST /api/rag/initialize to set up knowledge base.'
    });
    
  } catch (error) {
    console.error('Error getting RAG stats:', error);
    return NextResponse.json({ 
      error: 'Failed to get RAG statistics'
    }, { status: 500 });
  }
}
