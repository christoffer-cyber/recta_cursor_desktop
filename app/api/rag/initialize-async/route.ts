import { NextResponse } from 'next/server';
import { ensureRagInitialized } from '@/lib/global-rag';

export async function POST() {
  try {
    console.log('🚀 Starting async RAG initialization...');
    
    // Run initialization in background
    ensureRagInitialized()
      .then(() => {
        console.log('✅ Async RAG initialization completed successfully');
      })
      .catch((error) => {
        console.error('❌ Async RAG initialization failed:', error);
      });

    // Return immediately - don't wait for initialization
    return NextResponse.json({
      success: true,
      message: 'RAG initialization started in background'
    });

  } catch (error) {
    console.error('Failed to start RAG initialization:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to start RAG initialization'
    }, { status: 500 });
  }
}

