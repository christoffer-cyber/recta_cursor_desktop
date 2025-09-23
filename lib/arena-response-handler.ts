import { ArenaPrompts } from './arena-prompts';

export interface ClusterUpdate {
  clusterId: string;
  updates: {
    confidence: number;
    status: string;
    lastUpdated: string;
  };
}

export interface ArenaResponse {
  message: string;
  isComplete: boolean;
  sessionId: string;
  clusterId?: string;
  nextCluster?: string;
  clusterUpdate?: ClusterUpdate | null;
  confidenceImpact: number;
}

export class ArenaResponseHandler {
  /**
   * Processes AI response and determines completion status
   */
  static processAIResponse(
    aiResponse: string,
    context: {
      sessionId: string;
      currentCluster: string;
      clusterUpdate?: ClusterUpdate | null;
      clusters?: Record<string, { confidence: number }>;
    }
  ): ArenaResponse {
    const { sessionId, currentCluster, clusterUpdate, clusters } = context;

    // Check for completion signal
    const isComplete = aiResponse.includes("ANALYS_KLAR");
    let finalMessage = aiResponse.replace("ANALYS_KLAR", "").trim();
    
    // If completion detected but message is too short, use default completion message
    if (isComplete && finalMessage.length < 10) {
      finalMessage = ArenaPrompts.getCompletionMessage();
    }

    // Calculate confidence impact
    const confidenceImpact = clusterUpdate && currentCluster 
      ? clusterUpdate.updates.confidence - (clusters?.[currentCluster]?.confidence || 0) 
      : 0;

    return {
      message: finalMessage,
      isComplete,
      sessionId,
      clusterId: currentCluster,
      nextCluster: undefined, // Will be determined by client based on cluster progression
      clusterUpdate,
      confidenceImpact
    };
  }

  /**
   * Validates request body
   */
  static validateRequest(body: Record<string, unknown>): { isValid: boolean; error?: string } {
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return { isValid: false, error: 'No messages provided' };
    }

    return { isValid: true };
  }

  /**
   * Extracts context from request body
   */
  static extractContext(body: Record<string, unknown>): {
    messages: Array<{ role: string; content: string }>;
    sessionId: string;
    currentCluster: string;
    clusters: Record<string, { confidence: number }>;
    latestUserMessage?: { role: string; content: string };
  } {
    const messages = body.messages as Array<{ role: string; content: string }> || [];
    const sessionId = (body.sessionId as string) || '';
    const currentCluster = (body.currentCluster as string) || '';
    const clusters = (body.clusters as Record<string, { confidence: number }>) || {};
    const latestUserMessage = messages[messages.length - 1];

    return {
      messages,
      sessionId,
      currentCluster,
      clusters,
      latestUserMessage
    };
  }

  /**
   * Logs request information for debugging
   */
  static logRequestInfo(context: {
    messagesCount: number;
    sessionId: string;
    currentCluster: string;
    hasClusters: boolean;
  }): void {
    console.log('Request body received:', { 
      messagesCount: context.messagesCount,
      sessionId: context.sessionId,
      currentCluster: context.currentCluster,
      hasClusters: context.hasClusters
    });
  }

  /**
   * Logs response information for debugging
   */
  static logResponseInfo(response: ArenaResponse): void {
    console.log('Claude response processed:', { 
      messageLength: response.message.length,
      isComplete: response.isComplete,
      clusterId: response.clusterId,
      hasClusterUpdate: !!response.clusterUpdate,
      confidenceImpact: response.confidenceImpact
    });
  }
}
