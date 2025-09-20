import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: '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',
});

const EXTRACTION_PROMPT = `Du är en expert på strategisk rekrytering och organisationsanalys. Extrahera strukturerad data från konversationen och returnera ENDAST giltig JSON.

VIKTIGT: Läs konversationen mycket noggrant och hitta ALL information som nämns, även om den bara nämns en gång.

Analysera konversationen djupt och identifiera:
1. Företagsinformation och kontext (leta efter företagsnamn som slutar på AB, Ltd, Inc, AS, Group)
2. Rollspecifika detaljer och krav (leta efter jobbtitlar som CFO, ekonomichef, sales director, etc.)
3. Branschinformation (leta efter nyckelord som e-handel, tech, fintech, retail, consumer goods, etc.)
4. Organisatorisk kontext och begränsningar
5. Strategiska utmaningar och mål
6. Dolda bias och riskfaktorer
7. Benchmarking- och analysbehov

EXTRAHERINGSREGLER:
- Om företagsnamn nämns (t.ex. "Vi på Redhead AB", "GLAS Scandinavia AB", "Spotify AB"), använd det exakta namnet
- Om bransch kan härledas från kontext (t.ex. "säljer chips", "e-handel", "streaming"), identifiera branschen
- Om roll nämns (t.ex. "ekonomichef", "CFO", "försäljningschef"), använd den exakta titeln
- Om information inte nämns explicit, försök härleda från kontext
- Endast om INGEN information finns, använd "Ej specificerat"

Förväntad JSON-struktur:
{
  "companyInfo": {
    "name": "Företagsnamn eller 'Ej angivet'",
    "size": "startup|scaling|enterprise",
    "industry": "Specifik bransch",
    "growthStage": "Tillväxtfas beskrivning"
  },
  "roleDetails": {
    "title": "Exakt rolltitel",
    "department": "Avdelning/funktion",
    "seniority": "junior|mid|senior|executive", 
    "keyResponsibilities": ["Ansvar 1", "Ansvar 2"],
    "criticalSkills": ["Kompetens 1", "Kompetens 2"]
  },
  "context": {
    "urgency": "low|medium|high",
    "budget": "Budget eller 'Ej specificerat'",
    "timeline": "Tidsram eller 'Ej specificerat'",
    "teamSize": "Antal personer som heltal eller 0",
    "reportingStructure": "Rapporteringsstruktur"
  },
  "challenges": {
    "currentPainPoints": ["Nuvarande problem 1", "Problem 2"],
    "strategicGoals": ["Strategiskt mål 1", "Mål 2"], 
    "riskFactors": ["Risk 1", "Risk 2"],
    "successMetrics": ["Framgångsmått 1", "Mått 2"]
  },
  "insights": {
    "identifiedBiases": ["Identifierad bias 1", "Bias 2"],
    "gapAnalysis": ["Gap 1", "Gap 2"],
    "recommendations": ["Rekommendation 1", "Rekommendation 2"],
    "benchmarkNeeds": ["Benchmark-behov 1", "Behov 2"]
  }
}

KRITISKA EXEMPEL - FÖLJ EXAKT:

EXEMPEL 1: "Vi på GLAS behöver en CFO"
→ name: "GLAS" (INTE "Ej angivet")
→ title: "CFO" (INTE "Ej specificerat")

EXEMPEL 2: "Redhead AB säljer chips"  
→ name: "Redhead AB" (INTE "Ej angivet")
→ industry: "Consumer Goods" (INTE "Ej specificerat")

EXEMPEL 3: "Vi på GLAS Scandinavia AB arbetar med glasögon"
→ name: "GLAS Scandinavia AB" (INTE "Ej angivet") 
→ industry: "Optik & Eyewear" (INTE "Ej specificerat")

OM DU SER FÖRETAGSNAMN I KONVERSATIONEN - ANVÄND DET!

Var noggrann med att:
- Identifiera dolda antaganden och bias
- Analysera organisatoriska utmaningar
- Föreslå konkreta benchmarking-behov
- Bedöma risker och framgångsfaktorer
- Använda exakt de angivna enum-värdena för size, seniority, urgency
- ALLTID leta efter företagsnamn och branschinformation i hela konversationen`;

export async function POST(request: NextRequest) {
  try {
    console.log('Extract API called');
    const { messages } = await request.json();
    console.log('Messages received:', messages?.length);

    if (!messages || messages.length === 0) {
      throw new Error('Inga meddelanden att analysera');
    }

    // Combine all messages into conversation context
    const conversationText = messages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n\n');

    console.log('Conversation text length:', conversationText.length);
    console.log('First 500 chars of conversation:', conversationText.substring(0, 500));

    // PRE-PROCESS: Extract obvious information before sending to AI
    const preProcessedInfo = {
      detectedCompanies: [] as string[],
      detectedIndustries: [] as string[],
      detectedRoles: [] as string[]
    };

    // Company detection patterns
    const companyPatterns = [
      /([A-ZÅÄÖ][a-zåäöA-ZÅÄÖ\s&-]+)\s+AB\b/gi,
      /([A-ZÅÄÖ][a-zåäöA-ZÅÄÖ\s&-]+)\s+Ltd\b/gi,
      /GLAS[^.]*(?:AB|Scandinavia)/gi,
      /\b[A-ZÅÄÖ][a-zåäö]+\s+AB\b/gi
    ];

    companyPatterns.forEach(pattern => {
      const matches = conversationText.match(pattern);
      if (matches) {
        matches.forEach((match: string) => preProcessedInfo.detectedCompanies.push(match.trim()));
      }
    });

    // Industry keywords
    const industryMap: Record<string, string> = {
      'glasögon': 'Optik & Eyewear',
      'optik': 'Optik & Eyewear', 
      'chips': 'Consumer Goods',
      'e-handel': 'E-commerce',
      'streaming': 'Technology',
      'fintech': 'Financial Technology',
      'bank': 'Banking & Finance'
    };

    Object.entries(industryMap).forEach(([keyword, industry]) => {
      if (conversationText.toLowerCase().includes(keyword)) {
        preProcessedInfo.detectedIndustries.push(industry);
      }
    });

    // Role detection
    const roleKeywords = ['CFO', 'ekonomichef', 'finanschef', 'VD', 'CEO', 'CTO', 'försäljningschef'];
    roleKeywords.forEach(role => {
      if (conversationText.toLowerCase().includes(role.toLowerCase())) {
        preProcessedInfo.detectedRoles.push(role);
      }
    });

    console.log('Pre-processed information detected:', preProcessedInfo);

    // Use more of the conversation for better analysis
    const maxConversationLength = 4000;
    const truncatedConversation = conversationText.length > maxConversationLength 
      ? conversationText.slice(-maxConversationLength)
      : conversationText;
      
    console.log('Truncated conversation being sent to AI:', truncatedConversation.substring(0, 200) + '...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { 
          role: "user", 
          content: `Analysera denna rekryteringskonversation mycket noggrant. 

FÖRDETEKTERAD INFORMATION (använd denna om tillgänglig):
${preProcessedInfo.detectedCompanies.length > 0 ? `Företag: ${preProcessedInfo.detectedCompanies[0]}` : 'Inget företag detekterat'}
${preProcessedInfo.detectedIndustries.length > 0 ? `Bransch: ${preProcessedInfo.detectedIndustries[0]}` : 'Ingen bransch detekterad'}
${preProcessedInfo.detectedRoles.length > 0 ? `Roll: ${preProcessedInfo.detectedRoles[0]}` : 'Ingen roll detekterad'}

KONVERSATION:
${truncatedConversation}

INSTRUKTIONER:
- Använd den fördetekterade informationen ovan som grund
- Om fördetekterad information finns, använd den EXAKT som den är
- Komplettera med ytterligare information från konversationen
- Endast om INGEN fördetekterad information finns, leta manuellt i konversationen

Returnera JSON:` 
        }
      ],
      temperature: 0.05, // Lower temperature for more consistent extraction
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    console.log('OpenAI response received');
    const rawContent = completion.choices[0]?.message?.content;
    console.log('Raw AI content:', rawContent);

    if (!rawContent) {
      throw new Error('Inget svar från AI');
    }

    const extractedData = JSON.parse(rawContent);
    console.log('Parsed extracted data:', extractedData);
    
    return NextResponse.json({
      success: true,
      data: extractedData
    });

  } catch (error) {
    console.error('Data extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Okänt fel';
    return NextResponse.json(
      { error: `Dataextraktion misslyckades: ${errorMessage}` },
      { status: 500 }
    );
  }
}
