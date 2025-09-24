import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;
import { getClaudeClient } from '../../../../lib/claude-client';
import { ArenaEngine } from '../../../../lib/arena-engine';
import { ArenaPrompts } from '../../../../lib/arena-prompts';

// Arena chat API using intelligent analysis
export async function POST(request: NextRequest) {
  try {
    console.log('=== ARENA CHAT (INTELLIGENT) START ===');

    const body = await request.json();
    console.log('Request body:', {
      hasMessages: !!body.messages,
      messagesCount: body.messages?.length || 0,
      currentCluster: body.currentCluster
    });

    // Basic validation
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const { messages, currentCluster = 'pain-point', sessionId = 'default', clusters = {} } = body;
    const latestMessage = messages[messages.length - 1];

    if (!latestMessage || latestMessage.role !== 'user') {
      return NextResponse.json({ error: 'Last message must be a user message' }, { status: 400 });
    }

    console.log('Latest message:', {
      role: latestMessage.role,
      contentLength: latestMessage.content?.length,
      preview: (latestMessage.content || '').slice(0, 120)
    });

    // Analyze cluster progress based on information quality
    const analysisResult = ArenaEngine.analyzeClusterProgress({
      currentCluster,
      clusters,
      latestUserMessage: latestMessage,
      sessionId,
      messagesCount: messages.length
    });

    // Derive cluster update
    const newConfidence = analysisResult?.newConfidence ?? (clusters[currentCluster]?.confidence ?? 0);
    const clusterUpdate = analysisResult
      ? ArenaEngine.createClusterUpdate(currentCluster, newConfidence)
      : null;

    // Build system prompt with context
    const systemPrompt = ArenaPrompts.buildSystemPrompt({
      currentCluster,
      sessionId,
      messagesCount: messages.length,
      clusterUpdate
    });

    // Prepare Claude messages
    const claudeMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'system' ? 'assistant' : (m.role as 'user' | 'assistant'),
      content: m.content
    }));

    // Claude MUST be configured – no fallback
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured (env missing at runtime)');
      return NextResponse.json({ error: 'AI service not configured: missing ANTHROPIC_API_KEY' }, { status: 500 });
    }
    const claude = getClaudeClient();

    let baseMessage = '';
    let nextQuestion = analysisResult?.nextQuestion;

    // Get AI response – hard fail if it errors
    try {
      const ai = await claude.chat(claudeMessages, systemPrompt);
      baseMessage = ai.content || '';
    } catch (e) {
      console.error('Claude API error:', e);
      return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 500 });
    }

    // Ensure we always include a targeted follow-up
    nextQuestion = nextQuestion || 'Kan du utveckla lite mer?';
    const finalMessage = nextQuestion ? `${baseMessage}\n\n${nextQuestion}` : baseMessage;

    // Determine completion
    const isComplete = !!(analysisResult?.canProgress && currentCluster === 'alternatives');

    const response = {
      message: finalMessage,
      sessionId,
      clusterUpdate,
      isComplete,
      analysis: analysisResult
        ? {
            foundPoints: analysisResult.analysis?.foundPoints?.filter(p => p.found).map(p => p.key) || [],
            missingPoints: analysisResult.missingPoints || [],
            totalScore: analysisResult.newConfidence,
            canProgress: analysisResult.canProgress,
            nextQuestion: analysisResult.nextQuestion || null
          }
        : null
    };

    console.log('Response summary:', {
      currentCluster,
      newConfidence,
      foundPoints: response.analysis?.foundPoints?.length || 0,
      missingPoints: response.analysis?.missingPoints?.length || 0
    });
    console.log('=== ARENA CHAT (INTELLIGENT) END ===');

    return NextResponse.json(response);

  } catch (error) {
    console.error('=== ARENA CHAT ERROR ===');
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}