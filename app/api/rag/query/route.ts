import { NextRequest, NextResponse } from 'next/server';
import { RAGQuery } from '../../../../lib/rag-system';
import { getGlobalRagSystem, isRagSystemInitialized } from '../../../../lib/global-rag';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, context } = body as RAGQuery;
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    
    console.log('RAG query received:', { question, context });
    
    // Check if RAG system is initialized
    if (!isRagSystemInitialized()) {
      return NextResponse.json({
        success: false,
        error: 'RAG system not initialized. Please initialize first.'
      }, { status: 400 });
    }
    
    const rag = getGlobalRagSystem();
    if (!rag) {
      return NextResponse.json({
        success: false,
        error: 'RAG system not available'
      }, { status: 500 });
    }
    
    const response = await rag.query({ question, context: context || {} });
    
    console.log('RAG response generated:', {
      answerLength: response.answer.length,
      sourcesCount: response.sources.length,
      confidence: response.confidence
    });
    
    return NextResponse.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('Error processing RAG query:', error);
    return NextResponse.json({ 
      error: 'Failed to process RAG query',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Enhanced Arena chat with RAG integration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, extractedData } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }
    
    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return NextResponse.json({ error: 'Latest message must be from user' }, { status: 400 });
    }
    
    // Build context from extracted data
    const context = {
      industry: extractedData?.industry,
      role: extractedData?.roleTitle,
      companySize: extractedData?.companySize,
      stage: extractedData?.stage
    };
    
    // Use RAG to enhance the response
    const rag = getGlobalRagSystem();
    if (!rag) {
      return NextResponse.json({
        success: true,
        message: "Tack för ditt svar. Kan du berätta mer om de specifika utmaningarna ni står inför?",
        ragEnhanced: false,
        confidence: 0
      });
    }
    const ragResponse = await rag.query({
      question: latestMessage.content,
      context
    });
    
    // If RAG has high confidence, use enhanced response
    if (ragResponse.confidence > 0.3) {
      console.log('Using RAG-enhanced response (confidence:', ragResponse.confidence, ')');
      return NextResponse.json({
        success: true,
        message: ragResponse.answer,
        ragEnhanced: true,
        confidence: ragResponse.confidence,
        sources: ragResponse.sources.map(s => s.metadata.source)
      });
    }
    
    // Otherwise, fall back to standard Arena chat
    console.log('Using standard Arena chat (low RAG confidence:', ragResponse.confidence, ')');
    
    // Call standard Arena chat logic here
    // For now, return a placeholder
    return NextResponse.json({
      success: true,
      message: "Tack för ditt svar. Kan du berätta mer om de specifika utmaningarna ni står inför?",
      ragEnhanced: false,
      confidence: 0
    });
    
  } catch (error) {
    console.error('Error in enhanced Arena chat:', error);
    return NextResponse.json({ 
      error: 'Failed to process enhanced chat',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
