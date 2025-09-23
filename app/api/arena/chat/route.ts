import { NextRequest, NextResponse } from 'next/server';
import { getClaudeClient } from '../../../../lib/claude-client';
import { CLAUDE_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '../../../../lib/ai-config';
import { InformationAnalyzer } from '../../../../lib/information-requirements';

const SYSTEM_PROMPT = `Du är en expert på strategisk rekrytering och organisationsutveckling. Din uppgift är att hjälpa företag att förbereda sig optimalt innan de påbörjar en rekryteringsprocess.

KRITISKA REGLER FÖR SVAR - FÖLJ DESSA EXAKT:
- Varje svar får MAX innehålla EN fråga
- Börja med en kort bekräftelse på användarens svar: "Jag förstår, det innebär troligtvis... Kan du förklara...?"
- Håll svaren korta och fokuserade (max 2-3 meningar)
- Ställ EN följdfråga som bygger på svaret
- Undvik långa förklaringar eller flera frågor
- ALDRIG ställ två frågor i samma svar
- ALDRIG ge långa förklaringar innan frågan
- EXEMPEL: "Jag förstår, det låter som ett systematiskt problem. Har ni tydliga processer för när ekonomifunktionen ska presentera affärskritiska analyser?"

INTELLIGENT INFORMATIONSINSAMLING:
För varje område samlar systemet in specifik information baserat på kvalitet, inte kvantitet:

STEG 1 - PAIN POINT: Leta efter dessa 4 punkter i användarens svar:
1. Nuvarande vs önskad situation (vad är problemet konkret?)
2. Konkreta konsekvenser (vad händer när problemet uppstår?)
3. Omfattning (hur ofta/stort är problemet?)
4. Vem påverkas (vilka märker av problemet?)

STEG 2 - IMPACT & URGENCY: Leta efter dessa 4 punkter i användarens svar:
1. Tidsaspekt (vad händer om vi väntar 3/6/12 månader?)
2. Affärskonsekvenser (vilken påverkan får det på verksamheten/resultatet?)
3. Pressgrupper (vem bryr sig om att detta löses? chef, kunder, styrelse, team)
4. Prioritering (hur viktigt är detta jämfört med andra saker företaget gör?)

STEG 3 - SUCCESS CHECK: Leta efter dessa 4 punkter i användarens svar:
1. Mätbara mål (konkreta siffror, procent eller andra mätbara resultat)
2. Tidsram (inom hur lång tid ska framgång synas? 30/90/365 dagar)
3. Definition av framgång vs misslyckande (vad räknas som bra nog vs inte bra nog?)
4. Ansvarig för måluppfyllelse (vem ska leverera resultatet och rapportera framsteg?)

STEG 4 - RESOURCES: Leta efter dessa 4 punkter i användarens svar:
1. Total kostnad (inte bara lön utan all kostnad - lön + sociala avgifter + utrustning + utbildning)
2. Onboarding-kapacitet (vem har tid att introducera personen och hur mycket tid per vecka?)
3. Tillgängliga verktyg/system (vad finns redan vs vad behöver köpas/implementeras?)
4. Budgetverklighet (vad händer om kostnaden blir 20% högre än planerat?)

Systemet går vidare till nästa steg först när minst 3 av 4 punkter är identifierade.

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

Börja med att hälsa och fråga om företaget och den tänkta rollen.`;

export async function POST(request: NextRequest) {
  try {
    console.log('=== SAFE ARENA CHAT START ===');
    
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
    
    // SAFE CLUSTER LOGIC - No complex imports
    console.log('Starting safe cluster logic...', { 
      currentCluster, 
      hasClusters: !!clusters, 
      hasLatestMessage: !!latestUserMessage,
      latestUserMessageRole: latestUserMessage?.role
    });
    
    const nextCluster = currentCluster;
    let clusterUpdate: { clusterId: string; updates: { confidence: number; status: string; lastUpdated: string } } | null = null;
    
    // Simple cluster logic without ArenaLogicEngine
    if (currentCluster && clusters && latestUserMessage?.role === 'user') {
      try {
        console.log('Processing cluster update...', {
          currentCluster,
          currentConfidence: clusters[currentCluster]?.confidence || 0,
          clusterExists: !!clusters[currentCluster]
        });
        
        // INTELLIGENT INFORMATION ANALYSIS - Quality over Quantity
        let analysis;
        let newConfidence = clusters[currentCluster]?.confidence || 0;
        
        if (currentCluster === 'pain-point') {
          // Use intelligent analysis for Pain Point cluster
          analysis = InformationAnalyzer.analyzePainPoint(latestUserMessage.content);
          
          console.log('Pain Point Analysis:', {
            foundPoints: analysis.foundPoints.filter(p => p.found).map(p => p.key),
            totalScore: analysis.totalScore,
            canProgress: analysis.canProgress,
            missingPoints: analysis.missingPoints
          });
          
          // Set confidence based on information quality, not message length
          newConfidence = analysis.totalScore;
          
          // Store next question for better follow-up
          if (analysis.nextQuestion) {
            console.log('Suggested next question:', analysis.nextQuestion);
          }
        } else if (currentCluster === 'impact-urgency') {
          // Use intelligent analysis for Impact & Urgency cluster
          analysis = InformationAnalyzer.analyzeImpactUrgency(latestUserMessage.content);
          
          console.log('Impact & Urgency Analysis:', {
            foundPoints: analysis.foundPoints.filter(p => p.found).map(p => p.key),
            totalScore: analysis.totalScore,
            canProgress: analysis.canProgress,
            missingPoints: analysis.missingPoints
          });
          
          // Set confidence based on information quality, not message length
          newConfidence = analysis.totalScore;
          
          // Store next question for better follow-up
          if (analysis.nextQuestion) {
            console.log('Suggested next question:', analysis.nextQuestion);
          }
        } else if (currentCluster === 'success-check') {
          // Use intelligent analysis for Success Check cluster
          analysis = InformationAnalyzer.analyzeSuccessCheck(latestUserMessage.content);
          
          console.log('Success Check Analysis:', {
            foundPoints: analysis.foundPoints.filter(p => p.found).map(p => p.key),
            totalScore: analysis.totalScore,
            canProgress: analysis.canProgress,
            missingPoints: analysis.missingPoints
          });
          
          // Set confidence based on information quality, not message length
          newConfidence = analysis.totalScore;
          
          // Store next question for better follow-up
          if (analysis.nextQuestion) {
            console.log('Suggested next question:', analysis.nextQuestion);
          }
        } else if (currentCluster === 'resources') {
          // Use intelligent analysis for Resources cluster
          analysis = InformationAnalyzer.analyzeResources(latestUserMessage.content);
          
          console.log('Resources Analysis:', {
            foundPoints: analysis.foundPoints.filter(p => p.found).map(p => p.key),
            totalScore: analysis.totalScore,
            canProgress: analysis.canProgress,
            missingPoints: analysis.missingPoints
          });
          
          // Set confidence based on information quality, not message length
          newConfidence = analysis.totalScore;
          
          // Store next question for better follow-up
          if (analysis.nextQuestion) {
            console.log('Suggested next question:', analysis.nextQuestion);
          }
        } else {
          // Fallback for other clusters (will be updated later)
          const messageLength = latestUserMessage.content.length;
          const hasDetails = messageLength > 100;
          const confidenceIncrease = hasDetails ? 25 : 15;
          newConfidence = Math.min(100, (clusters[currentCluster]?.confidence || 0) + confidenceIncrease);
        }
        
        clusterUpdate = {
          clusterId: currentCluster,
          updates: {
            confidence: newConfidence,
            status: newConfidence >= 75 ? 'complete' : 'in-progress',
            lastUpdated: new Date().toISOString()
          }
        };
        
        console.log('Cluster update created:', clusterUpdate);
        
      } catch (clusterError) {
        console.error('Cluster logic failed with error:', clusterError);
        console.error('Cluster error stack:', clusterError instanceof Error ? clusterError.stack : 'No stack');
        clusterUpdate = null;
      }
    }

    // SIMPLE SYSTEM PROMPT WITH CLUSTER CONTEXT
    console.log('Building system prompt with cluster context...', { currentCluster });
    
    let enhancedSystemPrompt: string;
    try {
      const clusterNames = {
        'pain-point': 'Problem & Pain Point',
        'impact-urgency': 'Påverkan & Prioritering', 
        'success-check': 'Framgång & Kriterier',
        'resources': 'Resurser & Budget',
        'org-reality': 'Organisation & Kultur',
        'alternatives': 'Alternativ & Risker'
      };
      
      const currentClusterName = clusterNames[currentCluster as keyof typeof clusterNames] || 'Start';
      
      enhancedSystemPrompt = `${SYSTEM_PROMPT}

AKTUELL SESSION:
- Nuvarande kluster: ${currentClusterName}
- Session ID: ${sessionId || 'Ej tillgängligt'}
- Totala meddelanden: ${messages.length}

${clusterUpdate ? `
KLUSTER UPPDATERING:
- Kluster: ${clusterUpdate.clusterId}
- Förtroende: ${clusterUpdate.updates.confidence}%
- Status: ${clusterUpdate.updates.status}
` : ''}

FOKUSERA på att samla information för nuvarande kluster: ${currentClusterName}.
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
    
    // Simple completion check
    const isComplete = aiResponse.includes("ANALYS_KLAR");
    let finalMessage = aiResponse.replace("ANALYS_KLAR", "").trim();
    
    if (isComplete && finalMessage.length < 10) {
      finalMessage = "Perfekt! Jag har nu tillräcklig information för att skapa en grundlig analys. Låt oss generera rapporten.";
    }
    
    console.log('Claude response processed:', { 
      length: finalMessage.length,
      isComplete,
      nextCluster,
      clusterUpdate: !!clusterUpdate
    });
    console.log('=== SAFE ARENA CHAT END ===');
    
    return NextResponse.json({
      message: finalMessage,
      isComplete: isComplete,
      sessionId,
      // Cluster information
      clusterId: currentCluster,
      nextCluster: nextCluster !== currentCluster ? nextCluster : undefined,
      clusterUpdate,
      confidenceImpact: clusterUpdate && currentCluster ? clusterUpdate.updates.confidence - (clusters?.[currentCluster]?.confidence || 0) : 0
    });

  } catch (error) {
    console.error('=== SAFE ARENA CHAT ERROR ===');
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
