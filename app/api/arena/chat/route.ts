import { NextRequest, NextResponse } from 'next/server';
import { getClaudeClient } from '../../../../lib/claude-client';
import { ArenaLogicEngine, CLUSTER_PROMPTS, CLUSTER_DEFINITIONS } from '../../../../lib/arena-clusters';
import { ClusterType, ArenaCluster } from '../../../../lib/types';
import { CLAUDE_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '../../../../lib/ai-config';

const SYSTEM_PROMPT = `Du är en expert på strategisk rekrytering och organisationsutveckling. Din uppgift är att hjälpa företag att förbereda sig optimalt innan de påbörjar en rekryteringsprocess.

KRITISKA REGLER FÖR SVAR:
- Varje svar får MAX innehålla EN fråga
- Börja med en kort bekräftelse på användarens svar: "Jag förstår, det innebär troligtvis... Kan du förklara...?"
- Håll svaren korta och fokuserade (max 2-3 meningar)
- Ställ EN följdfråga som bygger på svaret
- Undvik långa förklaringar eller flera frågor

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
    console.log('=== ARENA CHAT WITH CLUSTERS START ===');
    
    const body = await request.json();
    console.log('Request body received:', { 
      messagesCount: body.messages?.length || 0,
      sessionId: body.sessionId,
      currentCluster: body.currentCluster,
      hasClusters: !!body.clusters
    });
    
    const { messages, sessionId, currentCluster, clusters } = body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Get latest user message
    const latestUserMessage = messages[messages.length - 1];
    
    // CLUSTER LOGIC - STEP 1 RESTORATION
    console.log('Starting cluster logic...', { 
      currentCluster, 
      hasClusters: !!clusters, 
      hasLatestMessage: !!latestUserMessage,
      latestUserMessageRole: latestUserMessage?.role
    });
    
    let nextCluster = currentCluster;
    let clusterUpdate: { clusterId: string; updates: { confidence: number; status: string; lastUpdated: string } } | null = null;
    
    if (currentCluster && clusters && latestUserMessage?.role === 'user') {
      try {
        console.log('Calling ArenaLogicEngine.getNextCluster...', {
          currentCluster: currentCluster as ClusterType,
          clustersKeys: Object.keys(clusters),
          messageContent: latestUserMessage.content?.substring(0, 100)
        });
        
        nextCluster = ArenaLogicEngine.getNextCluster(
          currentCluster as ClusterType,
          clusters,
          latestUserMessage.content,
          [] // No triggers for now
        );
        
        console.log('Cluster logic completed successfully:', { currentCluster, nextCluster });
        
        // Create cluster update
        clusterUpdate = {
          clusterId: currentCluster,
          updates: {
            confidence: Math.min(100, (clusters[currentCluster]?.confidence || 0) + 10),
            status: 'in-progress' as const,
            lastUpdated: new Date().toISOString()
          }
        };
        
        console.log('Cluster update created:', clusterUpdate);
        
      } catch (clusterError) {
        console.error('Cluster logic failed with error:', clusterError);
        console.error('Cluster error stack:', clusterError instanceof Error ? clusterError.stack : 'No stack');
        nextCluster = currentCluster;
        clusterUpdate = null;
      }
    }

    // SYSTEM PROMPT WITH CLUSTER LOGIC
    console.log('Building system prompt with cluster logic...', { currentCluster });
    
    let clusterPrompt: string;
    try {
      clusterPrompt = currentCluster && CLUSTER_PROMPTS[currentCluster as ClusterType] 
        ? CLUSTER_PROMPTS[currentCluster as ClusterType]
        : SYSTEM_PROMPT;
      console.log('Cluster prompt retrieved successfully');
    } catch (promptError) {
      console.error('Failed to get cluster prompt:', promptError);
      clusterPrompt = SYSTEM_PROMPT;
    }

    let enhancedSystemPrompt: string;
    try {
      enhancedSystemPrompt = `${clusterPrompt}

AKTUELL SESSION:
- Nuvarande kluster: ${currentCluster || 'Ej startat'}
${nextCluster && nextCluster !== currentCluster ? `- Nästa kluster: ${nextCluster}` : ''}
- Session ID: ${sessionId || 'Ej tillgängligt'}
- Totala meddelanden: ${messages.length}

${clusterUpdate ? `
KLUSTER UPPDATERING:
- Kluster: ${clusterUpdate.clusterId}
- Förtroende: ${clusterUpdate.updates.confidence}%
- Status: ${clusterUpdate.updates.status}
` : ''}

FOKUSERA på att samla information för nuvarande kluster: ${currentCluster || 'start'}.
Använd samma engagerande stil som tidigare - läs mellan raderna, ställ utmanande frågor och hjälp användaren att reflektera.`;
      
      console.log('System prompt built successfully');
    } catch (systemPromptError) {
      console.error('Failed to build system prompt:', systemPromptError);
      enhancedSystemPrompt = SYSTEM_PROMPT;
    }

    // Initialize Claude client
    const claude = getClaudeClient();
    if (!claude.isConfigured()) {
      console.error('Claude not configured');
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

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
    
    console.log('Claude response processed:', { 
      length: finalMessage.length,
      isComplete,
      analysisComplete,
      nextCluster
    });
    console.log('=== ARENA CHAT WITH CLUSTERS END ===');
    
    return NextResponse.json({
      message: finalMessage,
      isComplete: isComplete || analysisComplete,
      sessionId,
      // Cluster information
      clusterId: currentCluster,
      nextCluster: nextCluster !== currentCluster ? nextCluster : undefined,
      clusterUpdate,
      confidenceImpact: clusterUpdate && currentCluster ? clusterUpdate.updates.confidence - (clusters?.[currentCluster]?.confidence || 0) : 0
    });

  } catch (error) {
    console.error('=== ARENA CHAT WITH CLUSTERS ERROR ===');
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
