// Information Requirements for Arena Clusters
// Each cluster has specific information that needs to be extracted from user responses

export type InformationPoint = {
  key: string;
  description: string;
  keywords: string[];
  patterns: RegExp[];
  weight: number; // 1-4, how important this point is
};

export type ClusterRequirements = {
  name: string;
  description: string;
  requiredPoints: InformationPoint[];
  minimumPoints: number; // How many points needed to progress (e.g., 3 out of 4)
  progressThreshold: number; // Confidence % needed to move to next cluster
};

// CLUSTER 1: PAIN POINT - Universal för alla roller och branscher
export const PAIN_POINT_REQUIREMENTS: ClusterRequirements = {
  name: "Problem Reality Check",
  description: "Identifiera det konkreta problemet och dess påverkan",
  minimumPoints: 3, // Minst 3 av 4 punkter
  progressThreshold: 75, // 75% confidence för att gå vidare
  requiredPoints: [
    {
      key: "current_vs_desired",
      description: "Nuvarande situation vs önskad situation - vad är problemet konkret?",
      weight: 4,
      keywords: [
        "problem", "utmaning", "svårighet", "brist", "saknar", "fungerar inte", 
        "ineffektiv", "dålig", "långsam", "fel", "misslyckanden", "hinder",
        "nuvarande", "idag", "nu", "önskar", "behöver", "vill", "skulle vilja"
      ],
      patterns: [
        /vi har problem med/i,
        /det fungerar inte/i,
        /vi saknar/i,
        /nuvarande.*vs|kontra|jämfört/i,
        /problemet är att/i,
        /utmaningen är/i,
        /vi behöver.*istället för/i,
        /skulle vilja.*men/i
      ]
    },
    {
      key: "concrete_consequences",
      description: "Konkreta konsekvenser - vad händer när problemet uppstår?",
      weight: 4,
      keywords: [
        "kostar", "förlorar", "missar", "försening", "fel", "klagomål", 
        "stress", "övertid", "ineffektivitet", "slöseri", "risk", "konsekvens",
        "resultat", "påverkan", "effekt", "händer när", "leder till"
      ],
      patterns: [
        /kostar.*kr|kronor|miljoner|tusen/i,
        /förlorar.*per|varje/i,
        /leder till.*problem|fel|försening/i,
        /resulterar i/i,
        /konsekvensen är/i,
        /det innebär att/i,
        /påverkar.*negativt/i,
        /när.*händer.*då/i
      ]
    },
    {
      key: "scope_frequency",
      description: "Omfattning - hur ofta/stort är problemet?",
      weight: 3,
      keywords: [
        "varje", "dagligen", "veckovis", "månadsvis", "ofta", "alltid", "ständigt",
        "regelbundet", "återkommande", "kontinuerligt", "procent", "%", "antal",
        "gånger", "timmar", "dagar", "veckor", "månader", "år"
      ],
      patterns: [
        /varje dag|vecka|månad|år/i,
        /\d+.*gånger.*per/i,
        /\d+.*procent|\d+%/i,
        /\d+.*timmar|dagar|veckor/i,
        /ofta|alltid|ständigt|regelbundet/i,
        /återkommande.*problem/i,
        /kontinuerligt/i,
        /flera gånger/i
      ]
    },
    {
      key: "who_affected",
      description: "Vem påverkas - vilka märker av problemet?",
      weight: 3,
      keywords: [
        "team", "avdelning", "kunder", "klienter", "användare", "medarbetare", 
        "personal", "chefer", "ledning", "styrelse", "leverantörer", "partners",
        "jag", "vi", "alla", "hela", "påverkar", "märker", "drabbas"
      ],
      patterns: [
        /hela.*team|avdelning|företag/i,
        /kunder.*märker|påverkas|klagar/i,
        /medarbetare.*frustrerade|stressade/i,
        /ledning.*orolig|bekymrad/i,
        /alla.*drabbas|påverkas/i,
        /både.*och.*märker/i,
        /påverkar.*kunder|team|avdelning/i,
        /vi alla|hela organisationen/i
      ]
    }
  ]
};

// CLUSTER 2: IMPACT & URGENCY - Universal för alla roller och branscher
export const IMPACT_URGENCY_REQUIREMENTS: ClusterRequirements = {
  name: "Impact & Urgency",
  description: "Förstå affärskonsekvenser och tidspress",
  minimumPoints: 3, // Minst 3 av 4 punkter
  progressThreshold: 75, // 75% confidence för att gå vidare
  requiredPoints: [
    {
      key: "time_aspect",
      description: "Tidsaspekt - vad händer om vi väntar 3/6/12 månader?",
      weight: 4,
      keywords: [
        "månader", "veckor", "dagar", "tid", "deadline", "frist", "senast", "innan",
        "Q1", "Q2", "Q3", "Q4", "kvartal", "år", "årsskifte", "budgetår",
        "om vi väntar", "senare", "fördröjning", "försening", "akut", "bråttom"
      ],
      patterns: [
        /om vi väntar.*månader|veckor|dagar/i,
        /innan.*Q[1-4]|kvartal/i,
        /senast.*januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december/i,
        /deadline.*är/i,
        /frist.*för/i,
        /akut.*behov/i,
        /bråttom.*med/i,
        /fördröjning.*kostar/i,
        /försening.*leder/i,
        /\d+.*månader.*senare/i
      ]
    },
    {
      key: "business_consequences",
      description: "Affärskonsekvenser - vilken påverkan får det på verksamheten/resultatet?",
      weight: 4,
      keywords: [
        "kundkontrakt", "försäljning", "intäkter", "resultat", "vinst", "förlust",
        "marknadsandel", "konkurrens", "reputation", "image", "tillväxt",
        "expansion", "nedläggning", "omstrukturering", "redundans", "kris",
        "miljoner", "tusen", "kr", "kronor", "procent", "%", "MSEK", "SEK"
      ],
      patterns: [
        /förlorar.*kundkontrakt|kunder|försäljning/i,
        /kostar.*miljoner|tusen|kr|kronor/i,
        /påverkar.*resultat|vinst|intäkter/i,
        /tappar.*marknadsandel|konkurrens/i,
        /skadar.*reputation|image/i,
        /förhindrar.*tillväxt|expansion/i,
        /riskerar.*nedläggning|kris/i,
        /\d+.*MSEK|\d+.*miljoner/i,
        /påverkar.*verksamheten/i
      ]
    },
    {
      key: "pressure_groups",
      description: "Pressgrupper - vem bryr sig om att detta löses? (chef, kunder, styrelse, team)",
      weight: 3,
      keywords: [
        "chef", "chefer", "ledning", "styrelse", "VD", "direktör", "manager",
        "kunder", "klienter", "användare", "team", "medarbetare", "personal",
        "leverantörer", "partners", "investorer", "aktieägare", "myndigheter",
        "frågar", "kräver", "hotar", "pressar", "orolig", "bekymrad", "frustrerad"
      ],
      patterns: [
        /chef.*frågar|kräver|hotar/i,
        /styrelse.*orolig|bekymrad/i,
        /kunder.*klagar|hotar.*att/i,
        /ledning.*pressar|kräver/i,
        /team.*frustrerat|oroligt/i,
        /investorer.*vill.*se/i,
        /myndigheter.*kräver/i,
        /aktieägare.*oroliga/i,
        /leverantörer.*hotar/i,
        /partners.*vill.*avsluta/i
      ]
    },
    {
      key: "prioritization",
      description: "Prioritering - hur viktigt är detta jämfört med andra saker företaget gör?",
      weight: 3,
      keywords: [
        "prioritet", "viktigast", "högsta", "kritisk", "akut", "bråttom",
        "jämfört med", "istället för", "före", "efter", "rankning", "ordning",
        "andra projekt", "konkurrerar", "resurser", "budget", "tid",
        "nummer ett", "första", "högre", "lägre", "relativt"
      ],
      patterns: [
        /högsta.*prioritet|viktigast/i,
        /kritisk.*för.*företaget/i,
        /jämfört med.*andra.*projekt/i,
        /nummer.*ett|första.*prioritet/i,
        /konkurrerar.*med.*andra/i,
        /resurser.*istället för/i,
        /budget.*prioriteras/i,
        /högre.*än.*andra/i,
        /relativt.*viktigt/i,
        /akuter.*än/i
      ]
    }
  ]
};

// Analysis Result Type
export type InformationAnalysis = {
  clusterId: string;
  foundPoints: {
    key: string;
    found: boolean;
    confidence: number; // 0-100%
    extractedText?: string;
  }[];
  totalScore: number; // 0-100%
  missingPoints: string[];
  canProgress: boolean;
  nextQuestion?: string;
};

// Intelligent Analysis Engine
export class InformationAnalyzer {
  static analyzePainPoint(userMessage: string): InformationAnalysis {
    const requirements = PAIN_POINT_REQUIREMENTS;
    const foundPoints = requirements.requiredPoints.map(point => {
      const found = this.checkForInformationPoint(userMessage, point);
      return {
        key: point.key,
        found: found.found,
        confidence: found.confidence,
        extractedText: found.extractedText
      };
    });

    const foundCount = foundPoints.filter(p => p.found).length;
    const totalScore = Math.round((foundCount / requirements.requiredPoints.length) * 100);
    const canProgress = foundCount >= requirements.minimumPoints && totalScore >= requirements.progressThreshold;
    
    const missingPoints = foundPoints
      .filter(p => !p.found)
      .map(p => requirements.requiredPoints.find(rp => rp.key === p.key)?.description || p.key);

    return {
      clusterId: 'pain-point',
      foundPoints,
      totalScore,
      missingPoints,
      canProgress,
      nextQuestion: canProgress ? undefined : this.generateFollowUpQuestion(missingPoints[0], 'pain-point')
    };
  }

  static analyzeImpactUrgency(userMessage: string): InformationAnalysis {
    const requirements = IMPACT_URGENCY_REQUIREMENTS;
    const foundPoints = requirements.requiredPoints.map(point => {
      const found = this.checkForInformationPoint(userMessage, point);
      return {
        key: point.key,
        found: found.found,
        confidence: found.confidence,
        extractedText: found.extractedText
      };
    });

    const foundCount = foundPoints.filter(p => p.found).length;
    const totalScore = Math.round((foundCount / requirements.requiredPoints.length) * 100);
    const canProgress = foundCount >= requirements.minimumPoints && totalScore >= requirements.progressThreshold;
    
    const missingPoints = foundPoints
      .filter(p => !p.found)
      .map(p => requirements.requiredPoints.find(rp => rp.key === p.key)?.description || p.key);

    return {
      clusterId: 'impact-urgency',
      foundPoints,
      totalScore,
      missingPoints,
      canProgress,
      nextQuestion: canProgress ? undefined : this.generateFollowUpQuestion(missingPoints[0], 'impact-urgency')
    };
  }

  private static checkForInformationPoint(
    message: string, 
    point: InformationPoint
  ): { found: boolean; confidence: number; extractedText?: string } {
    let confidence = 0;
    let extractedText = '';
    let bestMatch = '';

    // Check keywords
    const keywordMatches = point.keywords.filter(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    confidence += keywordMatches.length * 10; // 10 points per keyword

    // Check patterns
    for (const pattern of point.patterns) {
      const match = message.match(pattern);
      if (match) {
        confidence += 25; // 25 points per pattern match
        if (match[0].length > bestMatch.length) {
          bestMatch = match[0];
          extractedText = match[0];
        }
      }
    }

    // Bonus for message length and detail
    if (message.length > 100) confidence += 10;
    if (message.length > 200) confidence += 10;

    const found = confidence >= 30; // Threshold for considering point "found"
    return {
      found,
      confidence: Math.min(100, confidence),
      extractedText: extractedText || (keywordMatches.length > 0 ? keywordMatches.join(', ') : undefined)
    };
  }

  private static generateFollowUpQuestion(missingPoint: string, clusterId: string): string {
    const questions: Record<string, Record<string, string[]>> = {
      'pain-point': {
        "Nuvarande situation vs önskad situation - vad är problemet konkret?": [
          "Kan du beskriva mer konkret vad som inte fungerar idag?",
          "Vad skulle du vilja att situationen såg ut istället?",
          "Vad är skillnaden mellan hur det är nu och hur du vill att det ska vara?"
        ],
        "Konkreta konsekvenser - vad händer när problemet uppstår?": [
          "Vad händer konkret när detta problem uppstår?",
          "Vilka konsekvenser får ni när detta inte fungerar?",
          "Kostar detta er något - tid, pengar, kunder?"
        ],
        "Omfattning - hur ofta/stort är problemet?": [
          "Hur ofta händer detta?",
          "Är det här något som påverkar er dagligen, veckovis eller mer sällan?",
          "Hur stor del av er tid/verksamhet påverkas av detta?"
        ],
        "Vem påverkas - vilka märker av problemet?": [
          "Vem märker av detta problem?",
          "Påverkar det bara dig eller även andra i teamet/företaget?",
          "Vilka andra personer eller grupper drabbas av detta?"
        ]
      },
      'impact-urgency': {
        "Tidsaspekt - vad händer om vi väntar 3/6/12 månader?": [
          "Vad händer om ni väntar 3-6 månader med att lösa detta?",
          "Finns det någon deadline eller frist ni måste hålla?",
          "Hur akut är detta problem - kan ni vänta eller måste det lösas snart?"
        ],
        "Affärskonsekvenser - vilken påverkan får det på verksamheten/resultatet?": [
          "Vilken påverkan får detta på er verksamhet eller resultat?",
          "Kostar detta er pengar, kunder eller andra affärskonsekvenser?",
          "Vad händer med er konkurrensposition om detta inte löses?"
        ],
        "Pressgrupper - vem bryr sig om att detta löses? (chef, kunder, styrelse, team)": [
          "Vem i organisationen bryr sig mest om att detta löses?",
          "Frågar er chef, kunder eller andra regelbundet om detta?",
          "Vilka grupper eller personer pressar på för att få detta löst?"
        ],
        "Prioritering - hur viktigt är detta jämfört med andra saker företaget gör?": [
          "Hur viktigt är detta jämfört med andra projekt eller initiativ?",
          "Är detta en av era högsta prioriteringar just nu?",
          "Konkurrerar detta med andra saker ni arbetar med?"
        ]
      }
    };

    const clusterQuestions = questions[clusterId] || {};
    const questionOptions = clusterQuestions[missingPoint] || [
      "Kan du berätta mer om det?",
      "Vad menar du mer konkret?",
      "Kan du ge ett exempel?"
    ];

    return questionOptions[Math.floor(Math.random() * questionOptions.length)];
  }
}