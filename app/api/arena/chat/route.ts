import { NextRequest, NextResponse } from 'next/server';
import { getGlobalRagSystem, isRagSystemInitialized } from '../../../../lib/global-rag';
import { CompanyIntelligenceAgent, detectCompanyName } from '../../../../lib/company-intelligence';
import { ArenaLogicEngine, CLUSTER_PROMPTS, CLUSTER_DEFINITIONS } from '../../../../lib/arena-clusters';
import { ClusterType, ArenaCluster } from '../../../../lib/types';
import { getClaudeClient, ClaudeMessage } from '../../../../lib/claude-client';
import { z } from 'zod';
import { CLAUDE_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '../../../../lib/ai-config';

const SYSTEM_PROMPT = `Du är en expert på strategisk rekrytering och organisationsutveckling. Din uppgift är att hjälpa företag att förbereda sig optimalt innan de påbörjar en rekryteringsprocess.

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
    const body = await request.json();
    console.log('Chat API request received:', { 
      messagesCount: body.messages?.length || 0,
      hasCurrentCluster: !!body.currentCluster,
      hasClusters: !!body.clusters
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
    
    // if (latestUserMessage && latestUserMessage.role === 'user') {
    //   try {
    //     const detectedCompany = detectCompanyName(latestUserMessage.content);
    //     if (detectedCompany) {
    //       console.log(`🏢 Company detected: ${detectedCompany} - triggering background intelligence gathering`);
    //       
    //       // Trigger background company intelligence (don't await - let it run in background)
    //       try {
    //         const companyAgent = new CompanyIntelligenceAgent();
    //         companyAgent.gatherCompanyIntelligence(detectedCompany)
    //           .then(companyData => {
    //             if (companyData) {
    //               console.log(`✅ Company intelligence completed for ${detectedCompany}:`, {
    //                 revenue: companyData.financial.revenue,
    //                 employees: companyData.financial.employees,
    //                 industry: companyData.industry
    //               });
    //               // TODO: Store this data for later use in report generation
    //             }
    //           })
    //           .catch(error => {
    //             console.error(`❌ Company intelligence failed for ${detectedCompany}:`, error);
    //           });
    //       } catch (agentError) {
    //         console.error('❌ Failed to create CompanyIntelligenceAgent:', agentError);
    //       }
    //     }
    //   } catch (detectionError) {
    //     console.error('❌ Company name detection failed:', detectionError);
    //   }
    // }

    // Debug logging
    console.log('RAG enhancement check:', {
      hasLatestMessage: !!latestUserMessage,
      isUser: latestUserMessage?.role === 'user',
      hasExtractedData: !!extractedData,
      ragInitialized: isRagSystemInitialized()
    });

    // RAG SYSTEM - TEMPORARILY DISABLED FOR DEBUGGING
    console.log('RAG system temporarily disabled for debugging');
    
    // // Optimize RAG: Only try if already initialized, don't wait for initialization
    // if (latestUserMessage && latestUserMessage.role === 'user' && isRagSystemInitialized()) {
    //   try {
    //     const rag = getGlobalRagSystem();
    //     if (rag) {
    //       // Set timeout for RAG query to avoid blocking
    //       const ragPromise = rag.query({
    //         question: latestUserMessage.content,
    //         context: {
    //           industry: extractedData?.industry,
    //           role: extractedData?.roleTitle,
    //           companySize: extractedData?.companySize,
    //           stage: extractedData?.stage
    //         }
    //       });

    //       // Race between RAG response and timeout
    //       const ragResponse = await Promise.race([
    //         ragPromise,
    //         new Promise<never>((_, reject) => 
    //           setTimeout(() => reject(new Error('RAG timeout')), 3000)
    //         )
    //       ]);

    //       if (ragResponse.confidence > 0.3) {
    //         ragEnhancement = ragResponse.answer;
    //         ragSources = ragResponse.sources.map(s => s.metadata.source);
    //         console.log('RAG enhancement applied with confidence:', ragResponse.confidence);
    //       }
    //     }
    //   } catch (ragError) {
    //     console.log('RAG enhancement skipped (timeout/error):', ragError instanceof Error ? ragError.message : 'Unknown error');
    //   }
    // }

    // CONTRADICTION DETECTION - RE-ENABLED FOR TESTING
    console.log('Starting contradiction detection...');
    let contradictions: string[] = [];
    try {
      contradictions = ArenaLogicEngine.detectContradictions(messages);
      console.log('Contradiction detection completed:', contradictions);
    } catch (contradictionError) {
      console.error('Contradiction detection failed:', contradictionError);
      contradictions = [];
    }
    
    // CLUSTER LOGIC - RE-ENABLED FOR TESTING
    console.log('Starting cluster logic...', { currentCluster, hasClusters: !!clusters, hasLatestMessage: !!latestUserMessage });
    let nextCluster = currentCluster;
    let clusterUpdate: { clusterId: string; updates: { confidence: number; status: string; lastUpdated: string } } | null = null;
    
    if (currentCluster && clusters && latestUserMessage?.role === 'user') {
      try {
        nextCluster = ArenaLogicEngine.getNextCluster(
          currentCluster as ClusterType,
          clusters,
          latestUserMessage.content,
          [] // No triggers for now
        );
        console.log('Cluster logic completed:', { currentCluster, nextCluster });
      } catch (clusterError) {
        console.error('Cluster logic failed:', clusterError);
        nextCluster = currentCluster;
      }
      
      try {
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
      } catch (updateError) {
        console.error('Cluster update failed:', updateError);
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
          maxTokens: Math.min(DEFAULT_MAX_TOKENS, 400),
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
