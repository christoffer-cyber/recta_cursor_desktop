import { NextRequest, NextResponse } from 'next/server';
import type { ExtractedData, ReportData } from '@/lib/types';
import { SCBDataProvider } from '../../../../lib/scb-integration';
import { getClaudeClient } from '../../../../lib/claude-client';

const REPORT_GENERATION_PROMPT = `Du är en senior strategisk konsult från McKinsey/BCG som ska skapa en djupgående, professionell rekryteringsrapport. Rapporten ska vara på management consulting-nivå med konkreta insights, siffror och actionable recommendations.

RAPPORTSTRUKTUR OCH KRAV:

1. EXECUTIVE SUMMARY (4-5 stycken, 300+ ord)
- Sammanfatta företagets situation med specifika detaljer
- Kvantifiera utmaningarna (kostnader, tidsramar, risker)
- Ge tydliga rekommendationer med förväntad ROI
- Inkludera branschkontext och marknadsläge

2. NULÄGESANALYS (5-6 stycken, 400+ ord)
- Djupanalys av företagets nuvarande situation
- Specifika organisatoriska utmaningar och flaskhalsar  
- Teamdynamik och kulturella faktorer
- Finansiell kontext och tillväxtutmaningar
- Konkurrensläge och marknadspositioning

3. KÄRNINSIKTER (8-10 punkter med förklaringar)
- Djupa upptäckter från analysen med konkreta exempel
- Identifierade bias och blinda fläckar med affärsimpact
- Dolda risker och möjligheter med kvantifiering
- Branschspecifika insights och benchmarks

4. STRATEGISKA ALTERNATIV (3 detaljerade alternativ)
- Konkreta approaches med tidsramar och resurskrav
- Detaljerade trade-offs och konsekvenser
- Kostnad-nytta analys för varje alternativ
- Tydlig rekommendation med motivering

5. RISKANALYS (6-8 risker med mitigering)
- Specifika risker med sannolikhet (hög/medium/låg) och impact (SEK)
- Konkreta åtgärder för att minska varje risk
- Contingency plans och fallback-strategier
- Tidslinje för riskmitigering

6. ROI-PROJEKTION (detaljerad finansiell analys)
- Kvantifierad affärsimpact av rätt rekrytering (SEK/år)
- Kostnad av fel rekrytering (replacement cost, productivity loss)
- Break-even analys och payback period
- 12-månaders värdeskapande tidslinje

7. IMPLEMENTERINGSPLAN (8-10 konkreta steg)
- Detaljerade nästa steg med exakta tidsramar
- Specifika ansvariga och resurskrav
- Konkreta milestones med mätbara resultat
- Budget och resource allocation

KVALITETSKRAV:
- Använd konkreta siffror och data från branschbenchmarks
- Referera till specifik företagsinformation när tillgänglig
- Var extremt konkret och actionable - inga vaga råd
- Inkludera branschspecifika insights och jämförelser
- Skriv som en senior konsult - auktoritativt men tillgängligt
- Varje sektion ska vara substantiell och värdeskapande

Använd svenska. Var professionell men engagerande. Skapa en rapport som motiverar Recta's premium-positionering.`;

export async function POST(request: NextRequest) {
  try {
    console.log('Generate API called');
    const { extractedData, sessionId, companyIntelligence } = await request.json();
    console.log('Received extracted data:', extractedData);
    console.log('Received company intelligence:', companyIntelligence);
    console.log('Session ID:', sessionId);
    
    // Handle both old and new data structures
    const isAdvancedData = extractedData.companyInfo && extractedData.roleDetails;
    
    let dataContext = '';
    
    if (isAdvancedData) {
      // New advanced structure
      dataContext = `
FÖRETAGSINFORMATION:
- Namn: ${extractedData.companyInfo.name}
- Storlek: ${extractedData.companyInfo.size}
- Bransch: ${extractedData.companyInfo.industry}
- Tillväxtfas: ${extractedData.companyInfo.growthStage}

ROLLDETALJER:
- Titel: ${extractedData.roleDetails.title}
- Avdelning: ${extractedData.roleDetails.department}
- Senioritet: ${extractedData.roleDetails.seniority}
- Nyckelansvar: ${extractedData.roleDetails.keyResponsibilities.join(', ')}
- Kritiska kompetenser: ${extractedData.roleDetails.criticalSkills.join(', ')}

KONTEXT:
- Prioritet: ${extractedData.context.urgency}
- Budget: ${extractedData.context.budget}
- Tidslinje: ${extractedData.context.timeline}
- Teamstorlek: ${extractedData.context.teamSize}
- Rapportering: ${extractedData.context.reportingStructure}

UTMANINGAR & MÅL:
- Nuvarande problem: ${extractedData.challenges.currentPainPoints.join(', ')}
- Strategiska mål: ${extractedData.challenges.strategicGoals.join(', ')}
- Riskfaktorer: ${extractedData.challenges.riskFactors.join(', ')}
- Framgångsmått: ${extractedData.challenges.successMetrics.join(', ')}

STRATEGISKA INSIKTER:
- Identifierade bias: ${extractedData.insights.identifiedBiases.join(', ')}
- Gap-analys: ${extractedData.insights.gapAnalysis.join(', ')}
- Rekommendationer: ${extractedData.insights.recommendations.join(', ')}
- Benchmark-behov: ${extractedData.insights.benchmarkNeeds.join(', ')}
      `;
    } else {
      // Legacy simple structure
      dataContext = `
Företag: ${extractedData.companyName || 'Ej specificerat'}
Roll: ${extractedData.roleTitle || 'Ej specificerat'}
Bransch: ${extractedData.industry || 'Ej specificerat'}
Utmaningar: ${Array.isArray(extractedData.challenges) ? extractedData.challenges.join(', ') : 'Ej specificerat'}
Mål: ${Array.isArray(extractedData.goals) ? extractedData.goals.join(', ') : 'Ej specificerat'}
Insights: ${Array.isArray(extractedData.insights) ? extractedData.insights.join(', ') : 'Ej specificerat'}
      `;
    }

    console.log('Data context prepared:', dataContext);

    // Add SCB industry benchmarks for context
    let industryBenchmarks = '';
    if (isAdvancedData) {
      try {
        const scbProvider = new SCBDataProvider();
        const companySize = extractedData.companyInfo.size === 'startup' ? 'small' :
                           extractedData.companyInfo.size === 'scaling' ? 'medium' : 'large';
        
        industryBenchmarks = await scbProvider.getIndustryBenchmark(
          extractedData.roleDetails.title,
          companySize
        );
        console.log('SCB benchmarks added:', industryBenchmarks);
      } catch (error) {
        console.log('SCB benchmark fetch failed:', error);
      }
    }

    // Add Company Intelligence data if available
    let companyIntelligenceContext = '';
    if (companyIntelligence) {
      companyIntelligenceContext = `
FÖRETAGSINTELLIGENS:
- Juridiskt namn: ${companyIntelligence.basicInfo?.legalName}
- Org.nummer: ${companyIntelligence.basicInfo?.organizationNumber}
- Registrerat: ${companyIntelligence.basicInfo?.registrationDate}
- VD: ${companyIntelligence.leadership?.ceo || 'Ej tillgängligt'}
- Anställda: ${companyIntelligence.financial?.employees || 'Ej tillgängligt'}
- Omsättning: ${companyIntelligence.financial?.revenue ? `${Math.round(companyIntelligence.financial.revenue / 1000000)}M SEK` : 'Ej tillgängligt'}
- Tillväxt: ${companyIntelligence.financial?.growthRate ? `${companyIntelligence.financial.growthRate}%` : 'Ej tillgängligt'}
- Kreditbetyg: ${companyIntelligence.financial?.creditRating || 'Ej tillgängligt'}
      `;
      console.log('Company intelligence context added');
    }

    const enhancedDataContext = dataContext + 
      (industryBenchmarks ? `\n\nBRANSCHBENCHMARKS:\n${industryBenchmarks}` : '') +
      (companyIntelligenceContext ? `\n\n${companyIntelligenceContext}` : '');

    const claude = getClaudeClient();
    const response = await claude.chat(
      [
        { role: "user", content: `Generera rapport baserat på denna data:\n\n${enhancedDataContext}` }
      ],
      REPORT_GENERATION_PROMPT,
      {
        model: "claude-3-5-sonnet-20241022",
        maxTokens: 4000, // Increased for detailed consulting-level reports
        temperature: 0.3
      }
    );

    console.log('Report generation completed');
    const reportContent = response.content || '';
    console.log('Generated content length:', reportContent.length);
    
    // Create report structure based on data type
    const reportData: ReportData = {
      sessionId,
      companyName: isAdvancedData ? extractedData.companyInfo.name : (extractedData.companyName || 'Företag'),
      roleTitle: isAdvancedData ? extractedData.roleDetails.title : (extractedData.roleTitle || 'Roll'),
      executiveSummary: reportContent.substring(0, 500) + '...',
      currentState: reportContent.substring(500, 1000) + '...',
      coreInsights: isAdvancedData ? 
        [...extractedData.insights.identifiedBiases, ...extractedData.insights.gapAnalysis] :
        (Array.isArray(extractedData.insights) ? extractedData.insights : ['Insikt 1', 'Insikt 2']),
      strategicOptions: isAdvancedData ?
        extractedData.insights.recommendations :
        ['Alternativ 1', 'Alternativ 2', 'Alternativ 3'],
      riskAnalysis: isAdvancedData ?
        extractedData.challenges.riskFactors :
        ['Risk 1', 'Risk 2'],
      roiProjection: 'ROI-analys baserad på konversationsdata.',
      implementationPlan: ['Steg 1', 'Steg 2', 'Steg 3'],
      generatedAt: new Date()
    };

    console.log('Report data structured:', reportData);

    return NextResponse.json({
      success: true,
      reportData
    });

  } catch (error) {
    console.error('Report generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Okänt fel';
    return NextResponse.json(
      { error: `Rapportgenerering misslyckades: ${errorMessage}` },
      { status: 500 }
    );
  }
}
