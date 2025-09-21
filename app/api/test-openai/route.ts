import { NextResponse } from 'next/server';
import { getClaudeClient } from '../../../lib/claude-client';

export async function GET() {
  try {
    const claude = getClaudeClient();
    const response = await claude.chat(
      [
        { role: "user", content: "Säg hej på svenska." }
      ],
      "Du är en hjälpsam assistent.",
      {
        model: "claude-3-5-sonnet-20241022",
        maxTokens: 100,
        temperature: 0.7
      }
    );
    
    return NextResponse.json({
      success: true,
      message: response.content,
      model: "claude-3-5-sonnet-20241022",
      usage: response.usage
    });

  } catch (error: unknown) {
    console.error('Claude test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
