import { NextRequest, NextResponse } from 'next/server';
import { getClaudeClient } from '../../../../lib/claude-client';
import { CLAUDE_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '../../../../lib/ai-config';

export async function POST(request: NextRequest) {
  try {
    console.log('=== MINIMAL ARENA CHAT START ===');
    
    const body = await request.json();
    console.log('Request body received:', { 
      messagesCount: body.messages?.length || 0,
      sessionId: body.sessionId
    });
    
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Initialize Claude client
    const claude = getClaudeClient();
    if (!claude.isConfigured()) {
      console.error('Claude not configured');
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    // Simple system prompt
    const systemPrompt = `Du är en expert på strategisk rekrytering. Ställ EN fråga i taget och håll svaren korta (max 2-3 meningar). Börja med att hälsa och fråga om företaget och den tänkta rollen.`;

    // Convert messages to Claude format
    const claudeMessages = messages.map((msg: {role: string, content: string}) => ({
      role: msg.role === 'system' ? 'assistant' : msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    console.log('Calling Claude API...');
    
    let response;
    try {
      response = await claude.chat(
        claudeMessages,
        systemPrompt,
        {
          model: CLAUDE_MODEL,
          maxTokens: Math.min(DEFAULT_MAX_TOKENS, 2000),
          temperature: DEFAULT_TEMPERATURE
        }
      );
    } catch (claudeError) {
      console.error('Claude API error:', claudeError);
      return NextResponse.json({ 
        error: 'AI service temporarily unavailable',
        details: claudeError instanceof Error ? claudeError.message : 'Unknown error'
      }, { status: 500 });
    }

    const aiResponse = response.content || "Jag kunde inte generera ett svar. Försök igen.";
    
    console.log('Claude response received:', { length: aiResponse.length });
    console.log('=== MINIMAL ARENA CHAT END ===');
    
    return NextResponse.json({
      message: aiResponse,
      isComplete: false,
      sessionId: body.sessionId || 'minimal-test'
    });

  } catch (error) {
    console.error('=== MINIMAL ARENA CHAT ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
