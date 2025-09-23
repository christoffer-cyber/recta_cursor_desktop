import { NextRequest, NextResponse } from 'next/server';
import { getGlobalRagSystem, isRagSystemInitialized } from '../../../../lib/global-rag';
import { CompanyIntelligenceAgent, detectCompanyName } from '../../../../lib/company-intelligence';
import { ArenaLogicEngine, CLUSTER_PROMPTS, CLUSTER_DEFINITIONS } from '../../../../lib/arena-clusters';
import { ClusterType, ArenaCluster } from '../../../../lib/types';
import { getClaudeClient, ClaudeMessage } from '../../../../lib/claude-client';
import { z } from 'zod';
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
  const sessionStartTime = Date.now();
  
  try {
    const body = await request.json();
    console.log('=== ARENA CHAT SESSION START ===');
    console.log('Session timestamp:', new Date().toISOString());
    console.log('Chat API request received:', { 
      messagesCount: body.messages?.length || 0,
      hasCurrentCluster: !!body.currentCluster,
      hasClusters: !!body.clusters,
      sessionId: body.sessionId
    });
    
    const Schema = z.object({
      messages: z.array(z.object({ role: z.enum(['user','assistant','system']), content: z.string() })).min(1),
      sessionId: z.string().optional(),
      extractedData: z.any().optional(),
      currentCluster: z.string().optional(),
      clusters: z.record(z.string(), z.any()).optional(),
      overallConfidence: z.number().optional(),
    });
    const parseResult = Schema.safeParse(body);
    if (!parseResult.success) {
      console.error('Invalid request data:', parseResult.error.issues);
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: parseResult.error.issues 
      }, { status: 400 });
    }
    
    const { 
      messages, 
      sessionId, 
      extractedData,
      currentCluster,
      clusters,
      overallConfidence 
    } = parseResult.data;

    // Get latest user message for RAG enhancement
    const latestUserMessage = messages[messages.length - 1];
    const ragEnhancement = '';
    const ragSources: string[] = [];

    // 🤖 Company Intelligence Agent - TEMPORARILY DISABLED FOR DEBUGGING
    console.log('Company Intelligence Agent temporarily disabled for debugging');
    
    // Debug logging
    console.log('RAG enhancement check:', {
      hasLatestMessage: !!latestUserMessage,
      isUser: latestUserMessage?.role === 'user',
      hasExtractedData: !!extractedData,
      ragInitialized: isRagSystemInitialized()
    });

    // RAG SYSTEM - TEMPORARILY DISABLED FOR DEBUGGING
    console.log('RAG system temporarily disabled for debugging');

    // CONTRADICTION DETECTION - RE-ENABLED FOR TESTING WITH DETAILED LOGGING
    console.log('Starting contradiction detection...', { 
      messagesCount: messages.length,
      messagesTypes: messages.map(m => m.role),
      latestMessage: messages[messages.length - 1]?.content?.substring(0, 100)
    });
    let contradictions: string[] = [];
    try {
      console.log('Calling ArenaLogicEngine.detectContradictions...');
      contradictions = ArenaLogicEngine.detectContradictions(messages);
      console.log('Contradiction detection completed successfully:', { 
        contradictionsCount: contradictions.length,
        contradictions: contradictions
      });
    } catch (contradictionError) {
      console.error('Contradiction detection failed with error:', contradictionError);
      console.error('Error stack:', contradictionError instanceof Error ? contradictionError.stack : 'No stack');
      contradictions = [];
    }
    
    // CLUSTER LOGIC - RE-ENABLED FOR TESTING WITH DETAILED LOGGING
    console.log('Starting cluster logic...', { 
      currentCluster, 
      hasClusters: !!clusters, 
      hasLatestMessage: !!latestUserMessage,
      latestUserMessageRole: latestUserMessage?.role,
      latestUserMessageContent: latestUserMessage?.content?.substring(0, 100)
    });
    let nextCluster = currentCluster;
    let clusterUpdate: { clusterId: string; updates: { confidence: number; status: string; lastUpdated: string } } | null = null;
    
    if (currentCluster && clusters && latestUserMessage?.role === 'user') {
      try {
        console.log('Calling ArenaLogicEngine.getNextCluster...', {
          currentCluster: currentCluster as ClusterType,
          clustersKeys: Object.keys(clusters),
          messageContent: latestUserMessage.content
        });
        nextCluster = ArenaLogicEngine.getNextCluster(
          currentCluster as ClusterType,
          clusters,
          latestUserMessage.content,
          [] // No triggers for now
        );
        console.log('Cluster logic completed successfully:', { currentCluster, nextCluster });
      } catch (clusterError) {
        console.error('Cluster logic failed with error:', clusterError);
        console.error('Cluster error stack:', clusterError instanceof Error ? clusterError.stack : 'No stack');
        nextCluster = currentCluster;
      }
      
      try {
        console.log('Creating cluster update...', {
          currentCluster,
          currentConfidence: clusters[currentCluster]?.confidence || 0,
          clusterExists: !!clusters[currentCluster]
        });
        // Create cluster update
        clusterUpdate = {
          clusterId: currentCluster,
          updates: {
            confidence: Math.min(100, (clusters[currentCluster]?.confidence || 0) + 10),
            status: 'in-progress' as const,
            lastUpdated: new Date().toISOString()
          }
        };
        console.log('Cluster update created successfully:', clusterUpdate);
      } catch (updateError) {
        console.error('Cluster update failed with error:', updateError);
        console.error('Update error stack:', updateError instanceof Error ? updateError.stack : 'No stack');
        clusterUpdate = null;
      }
    }

    // SYSTEM PROMPT - WITH CLUSTER LOGIC RE-ENABLED
    console.log('Building system prompt with cluster logic...', { currentCluster });
    let clusterPrompt: string;
    try {
      clusterPrompt = currentCluster && CLUSTER_PROMPTS[currentCluster as ClusterType] 
        ? CLUSTER_PROMPTS[currentCluster as ClusterType]
        : SYSTEM_PROMPT;
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

${contradictions.length > 0 ? `
UPPTÄCKTA MOTSÄGELSER:
${contradictions.map(c => `- ${c}`).join('\n')}

ADDRESSERA dessa motsägelser mjukt i din respons med frågor som "Tidigare sa du X, men nu verkar det som Y. Kan du hjälpa mig förstå?"
` : ''}

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
      enhancedSystemPrompt = SYSTEM_PROMPT; // Fallback
    }

    // Initialize Claude client
    const claude = getClaudeClient();
    if (!claude.isConfigured()) {
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    // Convert messages to Claude format
    const claudeMessages: ClaudeMessage[] = messages.map((msg: {role: string, content: string}) => ({
      role: msg.role === 'system' ? 'assistant' : msg.role as 'user' | 'assistant', // Claude doesn't support system role in messages
      content: msg.content
    }));

    let response;
    try {
      response = await claude.chat(
        claudeMessages,
        enhancedSystemPrompt, // System prompt goes separately in Claude
        {
          model: CLAUDE_MODEL,
          maxTokens: Math.min(DEFAULT_MAX_TOKENS, 10000), // INCREASED: Set to 10000 for safety
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
    
    // SIMPLE SESSION LOGGING - NO FETCH CALLS
    const sessionDuration = Date.now() - sessionStartTime;
    console.log('=== SESSION COMPLETION DATA ===');
    console.log('Session duration (ms):', sessionDuration);
    console.log('Total messages in session:', messages.length);
    console.log('AI response length:', finalMessage.length);
    console.log('Is analysis complete:', isComplete);
    console.log('Analysis complete status:', analysisComplete);
    console.log('Cluster update:', clusterUpdate);
    console.log('Next cluster:', nextCluster);
    console.log('Contradictions found:', contradictions.length);
    console.log('Session ID:', sessionId);
    console.log('=== ARENA CHAT SESSION END ===');
    
    return NextResponse.json({
      message: finalMessage,
      isComplete: isComplete || analysisComplete,
      sessionId,
      ragEnhanced: ragEnhancement.length > 0,
      sources: ragSources,
      // Cluster information
      clusterId: currentCluster,
      nextCluster: nextCluster !== currentCluster ? nextCluster : undefined,
      clusterUpdate,
      confidenceImpact: clusterUpdate && currentCluster ? clusterUpdate.updates.confidence - (clusters?.[currentCluster]?.confidence || 0) : 0
    });

  } catch (error) {
    const sessionDuration = Date.now() - sessionStartTime;
    console.error('=== SESSION ERROR ===');
    console.error('Session duration (ms):', sessionDuration);
    console.error('Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.flatten() }, { status: 400 });
    }
    console.error('AI service error:', error);
    return NextResponse.json(
      { error: 'Kunde inte kontakta AI-tjänsten. Försök igen.' },
      { status: 500 }
    );
  }
}
