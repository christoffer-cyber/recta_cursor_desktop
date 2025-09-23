import { NextRequest, NextResponse } from 'next/server';
import { getClaudeClient } from '../../../../lib/claude-client';
import { CLAUDE_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '../../../../lib/ai-config';
import { ArenaEngine, ArenaContext } from '../../../../lib/arena-engine';
import { ArenaPrompts } from '../../../../lib/arena-prompts';
import { ArenaResponseHandler } from '../../../../lib/arena-response-handler';

// System prompt moved to ArenaPrompts class for better organization

export async function POST(request: NextRequest) {
  try {
    console.log('=== REFACTORED ARENA CHAT START ===');
    
    const body = await request.json();
    
    // Validate request using response handler
    const validation = ArenaResponseHandler.validateRequest(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Extract context using response handler
    const context = ArenaResponseHandler.extractContext(body);
    
    // Log request info using response handler
    ArenaResponseHandler.logRequestInfo({
      messagesCount: context.messages.length,
      sessionId: context.sessionId,
      currentCluster: context.currentCluster,
      hasClusters: !!context.clusters
    });
    
    // Process cluster analysis using ArenaEngine
    let clusterUpdate = null;
    if (context.currentCluster && context.clusters && context.latestUserMessage?.role === 'user') {
      console.log('Starting cluster analysis...', { 
        currentCluster: context.currentCluster, 
        hasClusters: !!context.clusters, 
        hasLatestMessage: !!context.latestUserMessage,
        latestUserMessageRole: context.latestUserMessage?.role
      });

      const arenaContext: ArenaContext = {
        currentCluster: context.currentCluster,
        clusters: context.clusters,
        latestUserMessage: context.latestUserMessage,
        sessionId: context.sessionId,
        messagesCount: context.messages.length
      };

      const analysis = ArenaEngine.analyzeClusterProgress(arenaContext);
      
      if (analysis) {
        clusterUpdate = ArenaEngine.createClusterUpdate(context.currentCluster, analysis.newConfidence);
        console.log('Cluster update created:', clusterUpdate);
      }
    }

    // Build system prompt using ArenaPrompts
    console.log('Building system prompt with cluster context...', { currentCluster: context.currentCluster });
    
    const enhancedSystemPrompt = ArenaPrompts.buildSystemPrompt({
      currentCluster: context.currentCluster,
      sessionId: context.sessionId,
      messagesCount: context.messages.length,
      clusterUpdate
    });

    // Initialize Claude client
    const claude = getClaudeClient();
    if (!claude.isConfigured()) {
      console.error('Claude not configured');
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    // Convert messages to Claude format
    const claudeMessages = context.messages.map((msg: {role: string, content: string}) => ({
      role: msg.role === 'system' ? 'assistant' : msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    console.log('Calling Claude API...');
    
    let response;
    try {
      response = await claude.chat(
        claudeMessages,
        enhancedSystemPrompt,
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
    
    // Process response using ArenaResponseHandler
    const arenaResponse = ArenaResponseHandler.processAIResponse(aiResponse, {
      sessionId: context.sessionId,
      currentCluster: context.currentCluster,
      clusterUpdate,
      clusters: context.clusters
    });

    // Log response info
    ArenaResponseHandler.logResponseInfo(arenaResponse);
    console.log('=== REFACTORED ARENA CHAT END ===');
    
    return NextResponse.json(arenaResponse);

  } catch (error) {
    console.error('=== REFACTORED ARENA CHAT ERROR ===');
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
