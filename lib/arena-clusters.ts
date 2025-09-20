/**
 * Arena Cluster System - Adaptive Logic Engine
 * 
 * This system manages the 6 core information clusters that guide
 * strategic questioning and analysis in the Arena.
 */

import { ClusterType, ArenaCluster, ClusterStatus } from './types';

// Cluster Definitions
export const CLUSTER_DEFINITIONS: Record<ClusterType, Omit<ArenaCluster, 'status' | 'confidence' | 'keyInsights' | 'contradictions' | 'triggers'>> = {
  'pain-point': {
    id: 'pain-point',
    name: 'Business Pain Point',
    description: 'Identifiera det verkliga problemet bakom rekryteringsbehovet'
  },
  'impact-urgency': {
    id: 'impact-urgency', 
    name: 'Impact & Urgency',
    description: 'Förstå affärskritikalitet och verklig prioritering'
  },
  'success-check': {
    id: 'success-check',
    name: 'Success Reality Check', 
    description: 'Definiera konkret och mätbar framgång'
  },
  'resources': {
    id: 'resources',
    name: 'Resource Boundaries',
    description: 'Kartlägga verkliga begränsningar och budget'
  },
  'org-reality': {
    id: 'org-reality',
    name: 'Organizational Reality',
    description: 'Bedöma kulturell beredskap och organisatorisk mognad'
  },
  'alternatives': {
    id: 'alternatives', 
    name: 'Alternative Validation',
    description: 'Utmana rekrytering som lösning och utforska alternativ'
  }
};

// Cluster Prompts
export const CLUSTER_PROMPTS: Record<ClusterType, string> = {
  'pain-point': `Du är en erfaren managementkonsult som specialiserar dig på att hitta verkliga rotorsaker.

DITT MÅL: Identifiera det VERKLIGA problemet bakom rekryteringsbehovet.

METOD: Använd "5 Varför"-tekniken och utmana ytliga svar.

TRIGGERS som kräver djupare utforskning:
- "Vi behöver hjälp med..." → Vad händer konkret när ni inte får hjälp?
- "Vi är överbelastade..." → Vilka specifika arbetsuppgifter blir inte gjorda?
- "Vi förlorar kunder..." → Berätta om senaste gången detta hände
- "Vi har inte kompetensen..." → Vilka beslut fattas inte pga detta?

UTMANANDE FRÅGOR att ställa:
- "Kan du ge mig ett konkret exempel från förra veckan när detta problem uppstod?"
- "Om ni inte rekryterar på 6 månader, vad är det värsta som händer?"
- "Vad gör ni idag istället för att lösa detta?"
- "Hur mäter ni kostnaden av att inte ha denna person?"

Ställ EN fokuserad fråga i taget. Bygg på svaret innan du går vidare.`,

  'impact-urgency': `Du är en erfaren strategikonsult som bedömer affärsprioriteringar och resursallokering.

DITT MÅL: Förstå den VERKLIGA prioriteringen och affärspåverkan.

METOD: Utmana påstådd urgency med konkreta affärskonsekvenser.

TRIGGERS som kräver djupare utforskning:
- "Vi måste ha det nu" → Vad händer specifikt om ni vänter 3 månader?
- "Styrelsen frågar" → Vad har styrelsen sagt exakt?
- "Vi förlorar pengar" → Hur mycket och hur beräknar ni det?
- "Konkurrenterna..." → Vilka konkreta fördelar får de?

UTMANANDE FRÅGOR att ställa:
- "Om ni fick välja mellan denna rekrytering och [annat viktigt projekt], vad skulle ni välja?"
- "Vilken konkret intäkt eller kostnadsbesparing ger denna person första året?"
- "Vem i ledningsgruppen skulle vara mest besviken om detta skjuts upp 6 månader?"

Fokusera på att kvantifiera påverkan och prioritering.`,

  'success-check': `Du är en erfaren konsult som specialiserar dig på att definiera mätbar framgång.

DITT MÅL: Få KONKRETA, MÄTBARA framgångskriterier - inte vaga önskemål.

METOD: Utmana vaga svar och kräv specifika metrics.

TRIGGERS som kräver djupare utforskning:
- "Förbättra processerna" → Vilken process, mätt hur?
- "Öka försäljningen" → Med hur mycket, över vilken tid?
- "Bättre kvalitet" → Definierat hur, mätt med vad?
- "Mer effektivitet" → I vilka specifika områden?

UTMANANDE FRÅGOR att ställa:
- "Om vi träffas om 12 månader, vilka konkreta siffror visar att detta var en framgång?"
- "Vad är det första målet denna person MÅSTE leverera inom 90 dagar?"
- "Om denna person levererar allt ni säger, men [specifik KPI] inte förbättras, är det då en framgång?"

Kräv specifika, mätbara mål med tidsramar.`,

  'resources': `Du är en erfaren konsult som specialiserar dig på resursplanering och realistisk budgetering.

DITT MÅL: Kartlägga VERKLIGA resursgränser, inte bara önskade budget.

METOD: Utmana optimistiska antaganden om resurser och tid.

TRIGGERS som kräver djupare utforskning:
- "Vad budgeten tillåter" → Vad är den konkreta siffran?
- "Vi hittar tid" → Vem konkret, hur många timmar per vecka?
- "Standard onboarding" → Beskriv vad det innebär för denna roll
- "Befintliga system" → Fungerar de för vad denna person ska göra?

UTMANANDE FRÅGOR att ställa:
- "Om den perfekta kandidaten kostar 15% mer än budget, vad händer då?"
- "Vem i teamet kan dedikera 10 timmar/vecka första månaden för onboarding?"
- "Vilka system/verktyg behöver personen som ni inte har idag?"

Fokusera på total kostnad och realistiska resurser.`,

  'org-reality': `Du är en erfaren organisationskonsult som specialiserar dig på kulturell matchning.

DITT MÅL: Bedöma om organisationen är REDO för denna roll och identifiera kulturella risker.

METOD: Utforska tidigare erfarenheter och outtalade kulturella normer.

TRIGGERS som kräver djupare utforskning:
- "Förra personen slutade" → Varför exakt slutade de?
- "Vi har aldrig haft denna roll" → Hur fattas beslut inom detta område idag?
- "Teamwork är viktigt" → Ge exempel på hur ni löser konflikter
- "Entreprenöriell miljö" → Vad händer när någon misslyckas?

UTMANANDE FRÅGOR att ställa:
- "Berätta om senaste gången ni rekryterade till en liknande roll - vad gick bra/dåligt?"
- "Om denna person vill ändra en process som fungerat i 5 år, hur reagerar organisationen?"
- "Vilka outtalade regler har ni som en ny person måste lära sig?"

Fokusera på kulturell beredskap och organisatorisk mognad.`,

  'alternatives': `Du är en strategisk rådgivare som specialiserar dig på att hitta optimala lösningar.

DITT MÅL: UTMANA rekrytering som lösning och utforska potentiellt bättre alternativ.

METOD: Spela djävulens advokat och tvinga fram genomtänkt jämförelse av alternativ.

TRIGGERS som kräver djupare utforskning:
- "Vi har alltid rekryterat" → Vad händer om ni provar något annat?
- "Vi behöver någon heltid" → Varför kan det inte lösas deltid/konsult?
- "Vi vill ha kontrollen" → Vilken typ av kontroll, över vad?
- "Det är billigare att anställa" → Har ni räknat på alla kostnader?

ALTERNATIV att utforska:
1. Konsult/Freelancer - Snabbare, expertis, flexibel
2. Outsourcing - Låg kostnad, skalbart
3. Automation/AI - Engångskostnad, skalbart
4. Omorganisation - Befintlig personal
5. Partnership - Dela kostnad/risk

UTMANANDE FRÅGOR att ställa:
- "Om ni kunde få samma resultat med en konsult på 6 månader vs anställd på 18 månader, vad skulle ni välja?"
- "Vad är det VÄRSTA som händer om ni provar [alternativ] först och det misslyckas?"

Utmana rekrytering som automatisk lösning.`
};

// Adaptive Logic Engine
export class ArenaLogicEngine {
  
  /**
   * Determines the next cluster to focus on based on current state and triggers
   */
  static getNextCluster(
    currentCluster: ClusterType,
    clusters: Record<ClusterType, ArenaCluster>,
    lastUserMessage: string,
    triggers: string[] = []
  ): ClusterType {
    
    // Analyze triggers from last message
    const messageTriggers = this.analyzeTriggers(lastUserMessage);
    const allTriggers = [...triggers, ...messageTriggers];
    
    // Check if current cluster needs more exploration
    const currentClusterData = clusters[currentCluster];
    if (currentClusterData.confidence < 70 && !this.hasContradictions(currentClusterData)) {
      return currentCluster; // Stay in current cluster
    }
    
    // Determine next cluster based on triggers and logic
    return this.determineNextCluster(currentCluster, allTriggers, clusters);
  }
  
  /**
   * Analyzes user message for triggers that indicate which cluster to explore next
   */
  private static analyzeTriggers(message: string): string[] {
    const triggers: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Pain Point triggers
    if (lowerMessage.includes('problem') || lowerMessage.includes('förlorar') || lowerMessage.includes('överbelastad')) {
      triggers.push('pain-point-detected');
    }
    
    // Impact/Urgency triggers  
    if (lowerMessage.includes('måste') || lowerMessage.includes('brådskar') || lowerMessage.includes('styrelsen')) {
      triggers.push('urgency-detected');
    }
    
    // Resource triggers
    if (lowerMessage.includes('budget') || lowerMessage.includes('kostar') || lowerMessage.includes('tid')) {
      triggers.push('resource-constraint');
    }
    
    // Success triggers
    if (lowerMessage.includes('mål') || lowerMessage.includes('resultat') || lowerMessage.includes('framgång')) {
      triggers.push('success-criteria');
    }
    
    // Org reality triggers
    if (lowerMessage.includes('förra') || lowerMessage.includes('kultur') || lowerMessage.includes('team')) {
      triggers.push('org-context');
    }
    
    // Alternative triggers
    if (lowerMessage.includes('konsult') || lowerMessage.includes('outsourc') || lowerMessage.includes('alternativ')) {
      triggers.push('alternative-mentioned');
    }
    
    return triggers;
  }
  
  /**
   * Determines next cluster based on current cluster and triggers
   */
  private static determineNextCluster(
    currentCluster: ClusterType,
    triggers: string[],
    clusters: Record<ClusterType, ArenaCluster>
  ): ClusterType {
    
    // If we haven't started, always start with pain-point
    if (currentCluster === 'pain-point' && clusters['pain-point'].status === 'not-started') {
      return 'pain-point';
    }
    
    // Dynamic flow based on triggers and cluster completion
    if (triggers.includes('urgency-detected') && clusters['impact-urgency'].confidence < 80) {
      return 'impact-urgency';
    }
    
    if (triggers.includes('resource-constraint') && clusters['resources'].confidence < 80) {
      return 'resources';
    }
    
    if (triggers.includes('success-criteria') && clusters['success-check'].confidence < 80) {
      return 'success-check';
    }
    
    if (triggers.includes('org-context') && clusters['org-reality'].confidence < 80) {
      return 'org-reality';
    }
    
    if (triggers.includes('alternative-mentioned') && clusters['alternatives'].confidence < 80) {
      return 'alternatives';
    }
    
    // Default progression if no specific triggers
    return this.getDefaultNextCluster(currentCluster, clusters);
  }
  
  /**
   * Default cluster progression when no specific triggers are present
   */
  private static getDefaultNextCluster(
    currentCluster: ClusterType,
    clusters: Record<ClusterType, ArenaCluster>
  ): ClusterType {
    
    const progression: ClusterType[] = [
      'pain-point',
      'impact-urgency', 
      'success-check',
      'resources',
      'org-reality',
      'alternatives'
    ];
    
    const currentIndex = progression.indexOf(currentCluster);
    
    // Find next incomplete cluster
    for (let i = currentIndex + 1; i < progression.length; i++) {
      if (clusters[progression[i]].confidence < 80) {
        return progression[i];
      }
    }
    
    // If all clusters are complete, go to alternatives for final validation
    return 'alternatives';
  }
  
  /**
   * Checks if cluster has contradictions that need resolution
   */
  private static hasContradictions(cluster: ArenaCluster): boolean {
    return cluster.contradictions.length > 0;
  }
  
  /**
   * Calculates overall session confidence based on all clusters
   */
  static calculateOverallConfidence(clusters: Record<ClusterType, ArenaCluster>): number {
    const clusterConfidences = Object.values(clusters).map(c => c.confidence);
    const average = clusterConfidences.reduce((sum, conf) => sum + conf, 0) / clusterConfidences.length;
    return Math.round(average);
  }
  
  /**
   * Determines if analysis is complete and ready for report generation
   */
  static isAnalysisComplete(clusters: Record<ClusterType, ArenaCluster>): boolean {
    // ALL clusters must have at least 70% confidence
    const allClustersComplete = Object.values(clusters).every(cluster => 
      cluster.confidence >= 70
    );
    
    // Critical clusters need higher confidence (80%+)
    const criticalClusters = ['pain-point', 'impact-urgency', 'success-check', 'resources'];
    const criticalComplete = criticalClusters.every(id => 
      clusters[id as ClusterType].confidence >= 80
    );
    
    // Overall confidence must be high
    const overallConfidence = this.calculateOverallConfidence(clusters);
    
    console.log('Analysis completion check:', {
      allClustersComplete,
      criticalComplete,
      overallConfidence,
      clusterDetails: Object.fromEntries(
        Object.entries(clusters).map(([id, cluster]) => [id, cluster.confidence])
      )
    });
    
    return allClustersComplete && criticalComplete && overallConfidence >= 85;
  }
  
  /**
   * Initializes a new set of clusters for a session
   */
  static initializeClusters(): Record<ClusterType, ArenaCluster> {
    const clusters = {} as Record<ClusterType, ArenaCluster>;
    
    Object.entries(CLUSTER_DEFINITIONS).forEach(([id, definition]) => {
      clusters[id as ClusterType] = {
        ...definition,
        status: id === 'pain-point' ? 'in-progress' : 'not-started',
        confidence: 0,
        keyInsights: [],
        contradictions: [],
        triggers: []
      };
    });
    
    return clusters;
  }
}
