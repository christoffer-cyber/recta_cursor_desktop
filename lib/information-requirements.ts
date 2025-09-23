// Information Requirements for Arena Clusters
// Each cluster has specific information that needs to be extracted from user responses

// Message type no longer needed in this file

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

// CLUSTER 3: SUCCESS CHECK - Universal för alla roller och branscher
export const SUCCESS_CHECK_REQUIREMENTS: ClusterRequirements = {
  name: "Success Reality Check",
  description: "Definiera konkreta, mätbara framgångskriterier",
  minimumPoints: 3, // Minst 3 av 4 punkter
  progressThreshold: 75, // 75% confidence för att gå vidare
  requiredPoints: [
    {
      key: "measurable_goals",
      description: "Mätbara mål - konkreta siffror, procent eller andra mätbara resultat",
      weight: 4,
      keywords: [
        "procent", "%", "siffror", "antal", "gånger", "dagar", "veckor", "månader",
        "öka", "minska", "förbättra", "reducera", "maximera", "minimera",
        "från", "till", "från X till Y", "under", "över", "mer än", "mindre än",
        "miljoner", "tusen", "kr", "kronor", "SEK", "MSEK", "kunder", "intäkter",
        "buggar", "fel", "förseningar", "kostnader", "tid", "effektivitet"
      ],
      patterns: [
        /\d+.*procent|\d+%/i,
        /från.*\d+.*till.*\d+/i,
        /minska.*från.*\d+.*till.*\d+/i,
        /öka.*från.*\d+.*till.*\d+/i,
        /under.*\d+|över.*\d+/i,
        /mindre.*än.*\d+|mer.*än.*\d+/i,
        /\d+.*dagar|veckor|månader/i,
        /\d+.*miljoner|tusen|kr|kronor/i,
        /buggar.*från.*\d+.*till.*\d+/i,
        /kostnader.*minska.*\d+/i
      ]
    },
    {
      key: "timeframe",
      description: "Tidsram - inom hur lång tid ska framgång synas? (30/90/365 dagar)",
      weight: 4,
      keywords: [
        "dagar", "veckor", "månader", "år", "kvartal", "Q1", "Q2", "Q3", "Q4",
        "inom", "senast", "före", "efter", "deadline", "frist", "målsättning",
        "30", "60", "90", "180", "365", "6 månader", "12 månader", "ett år",
        "tidsram", "tidsperiod", "deadline", "målår", "budgetår"
      ],
      patterns: [
        /inom.*\d+.*dagar|veckor|månader/i,
        /senast.*\d+.*dagar|veckor|månader/i,
        /före.*Q[1-4]|kvartal/i,
        /deadline.*\d+.*dagar|veckor|månader/i,
        /\d+.*dagar|veckor|månader.*senare/i,
        /tidsram.*\d+.*dagar|veckor|månader/i,
        /målsättning.*\d+.*dagar|veckor|månader/i,
        /6.*månader|12.*månader|ett.*år/i,
        /30.*dagar|60.*dagar|90.*dagar|180.*dagar|365.*dagar/i
      ]
    },
    {
      key: "success_definition",
      description: "Definition av framgång vs misslyckande - vad räknas som bra nog vs inte bra nog?",
      weight: 4,
      keywords: [
        "framgång", "lyckas", "misslyckas", "bra nog", "inte bra nog", "acceptabelt",
        "oacceptabelt", "kvalitet", "standard", "krav", "kriterier", "benchmark",
        "jämförelse", "baslinje", "nuläge", "mål", "vision", "förväntningar",
        "räknas som", "definieras som", "betyder", "innebär", "tolkas som"
      ],
      patterns: [
        /framgång.*betyder|innebär|är/i,
        /lyckas.*när|om/i,
        /misslyckas.*när|om/i,
        /bra nog.*är|betyder/i,
        /inte bra nog.*är|betyder/i,
        /acceptabelt.*när|om/i,
        /oacceptabelt.*när|om/i,
        /kvalitet.*krav|standard/i,
        /benchmark.*är|betyder/i,
        /räknas som.*framgång|lyckat/i
      ]
    },
    {
      key: "accountability",
      description: "Ansvarig för måluppfyllelse - vem ska leverera resultatet och rapportera framsteg?",
      weight: 3,
      keywords: [
        "ansvarig", "ansvar", "leverera", "rapportera", "rapportering", "framsteg",
        "chef", "ledare", "manager", "team", "avdelning", "roll", "person",
        "jag", "vi", "han", "hon", "CFO", "VD", "direktör", "projektledare",
        "varje", "vecka", "månad", "dag", "måndag", "fredag", "möte", "status"
      ],
      patterns: [
        /ansvarig.*för.*leverera|rapportera/i,
        /rapporterar.*till.*mig|chef|ledning/i,
        /leverera.*resultat.*till/i,
        /ansvar.*för.*måluppfyllelse/i,
        /rapportering.*varje.*vecka|månad/i,
        /framsteg.*rapporteras.*till/i,
        /CFO|VD|direktör.*rapporterar/i,
        /team.*ansvarar.*för/i,
        /jag.*rapporterar.*till/i,
        /status.*varje.*måndag|fredag/i
      ]
    }
  ]
};

// CLUSTER 4: RESOURCES - Universal för alla roller och branscher
export const RESOURCES_REQUIREMENTS: ClusterRequirements = {
  name: "Resource Boundaries",
  description: "Kartlägga verkliga begränsningar och budget",
  minimumPoints: 3, // Minst 3 av 4 punkter
  progressThreshold: 75, // 75% confidence för att gå vidare
  requiredPoints: [
    {
      key: "total_cost",
      description: "Total kostnad - inte bara lön utan all kostnad (lön + sociala avgifter + utrustning + utbildning)",
      weight: 4,
      keywords: [
        "total", "totalt", "inklusive", "allt", "hela", "komplett", "fullständig",
        "lön", "salary", "sociala avgifter", "arbetsgivaravgifter", "skatt",
        "utrustning", "laptop", "dator", "verktyg", "licens", "programvara",
        "utbildning", "kurser", "certifiering", "coaching", "mentor",
        "kr", "kronor", "SEK", "MSEK", "miljoner", "tusen", "budget",
        "år", "månad", "årlig", "månadsvis"
      ],
      patterns: [
        /total.*budget|kostnad.*inklusive.*allt/i,
        /lön.*plus.*sociala.*avgifter/i,
        /inklusive.*utrustning|verktyg|licens/i,
        /hela.*kostnaden.*år|månad/i,
        /\d+.*kr.*inklusive.*allt/i,
        /total.*\d+.*kr|MSEK|miljoner/i,
        /lön.*sociala.*avgifter.*utrustning/i,
        /komplett.*kostnad.*inklusive/i,
        /fullständig.*budget.*år/i,
        /allt.*inklusive.*\d+.*kr/i
      ]
    },
    {
      key: "onboarding_capacity",
      description: "Onboarding-kapacitet - vem har tid att introducera personen och hur mycket tid per vecka?",
      weight: 4,
      keywords: [
        "onboarding", "introduktion", "introducera", "vägledning", "mentor",
        "tid", "timmar", "vecka", "månad", "dedikera", "ansvara", "hjälpa",
        "chef", "manager", "ledare", "kollega", "team", "avdelning",
        "första", "initial", "inledande", "grundläggande", "start",
        "per", "varje", "veckovis", "månadsvis", "daglig"
      ],
      patterns: [
        /\d+.*timmar.*per.*vecka|månad/i,
        /chef|manager.*dedikera.*\d+.*timmar/i,
        /onboarding.*\d+.*timmar.*första/i,
        /introduktion.*\d+.*veckor|månader/i,
        /mentor.*ansvarar.*\d+.*timmar/i,
        /första.*månad.*\d+.*timmar/i,
        /vägledning.*\d+.*timmar.*vecka/i,
        /team.*hjälper.*\d+.*timmar/i,
        /initial.*period.*\d+.*timmar/i,
        /grundläggande.*introduktion.*\d+.*timmar/i
      ]
    },
    {
      key: "available_tools_systems",
      description: "Tillgängliga verktyg/system - vad finns redan vs vad behöver köpas/implementeras?",
      weight: 3,
      keywords: [
        "verktyg", "system", "programvara", "licens", "plattform", "program",
        "finns", "redan", "befintlig", "har", "tillgänglig", "installerad",
        "behöver", "köpa", "implementera", "installera", "skaffa", "anskaffa",
        "saknar", "brist", "saknas", "inte", "ingen", "utan",
        "Salesforce", "Microsoft", "Google", "Adobe", "Power BI", "Tableau",
        "CRM", "ERP", "HR-system", "laptop", "dator", "utrustning"
      ],
      patterns: [
        /vi har.*men.*behöver.*köpa/i,
        /finns.*redan.*men.*saknar/i,
        /befintlig.*system.*men.*behöver/i,
        /har.*Salesforce|Power BI|Microsoft.*men/i,
        /verktyg.*redan.*men.*köpa.*\d+.*kr/i,
        /system.*finns.*men.*implementera/i,
        /plattform.*tillgänglig.*men.*licens/i,
        /program.*installerat.*men.*saknar/i,
        /utrustning.*har.*men.*behöver/i,
        /befintlig.*men.*anskaffa.*\d+.*kr/i
      ]
    },
    {
      key: "budget_reality",
      description: "Budgetverklighet - vad händer om kostnaden blir 20% högre än planerat?",
      weight: 3,
      keywords: [
        "budget", "kostnad", "dyrare", "högre", "över", "överskrida",
        "vad händer", "om det blir", "faller", "överstiger", "överskrider",
        "planerat", "beräknat", "budgeterat", "förväntat", "initial",
        "20%", "30%", "50%", "dubbelt", "trippelt", "mer än",
        "måste", "behöver", "vänta", "skjuta upp", "Q1", "Q2", "Q3", "Q4",
        "kvartal", "år", "senare", "framtida", "nästa"
      ],
      patterns: [
        /om.*kostnaden.*blir.*högre.*vad händer/i,
        /överstiger.*budget.*\d+%.*måste/i,
        /dyrare.*än.*planerat.*vänta/i,
        /över.*\d+%.*skjuta upp.*Q[1-4]/i,
        /överskrider.*budget.*\d+%.*behöver/i,
        /högre.*kostnad.*måste.*vänta/i,
        /över.*beräknat.*\d+%.*senare/i,
        /dyrare.*än.*förväntat.*Q[1-4]/i,
        /överstiger.*\d+%.*måste.*vänta/i,
        /högre.*än.*planerat.*skjuta upp/i
      ]
    }
  ]
};

// CLUSTER 5: ORGANIZATIONAL REALITY - Universal för alla roller och branscher
export const ORGANIZATIONAL_REALITY_REQUIREMENTS: ClusterRequirements = {
  name: "Organizational Reality",
  description: "Bedöma kulturell beredskap och organisatorisk mognad",
  minimumPoints: 3, // Minst 3 av 4 punkter
  progressThreshold: 75, // 75% confidence för att gå vidare
  requiredPoints: [
    {
      key: "cultural_fit",
      description: "Kulturell passform - vilken typ av person fungerar/fungerar inte i organisationen?",
      weight: 4,
      keywords: [
        "kultur", "passform", "passar", "fungerar", "inte fungerar", "typ av person",
        "personlighet", "karaktär", "attityd", "stil", "approach", "mentalitet",
        "entrepreneurisk", "hierarkisk", "formell", "informell", "snabba", "långsamma",
        "beslut", "beslutsstil", "process", "flexibel", "strukturerad", "kreativ",
        "startup", "corporate", "traditionell", "modern", "agil", "väletablerad"
      ],
      patterns: [
        /typ av person.*fungerar|passar/i,
        /kultur.*passform|passar.*inte/i,
        /personlighet.*fungerar|karaktär.*passar/i,
        /startup.*entrepreneurisk|agil.*mentalitet/i,
        /corporate.*hierarkisk|formell.*struktur/i,
        /snabba.*beslut.*vs.*långsamma/i,
        /flexibel.*approach.*vs.*strukturerad/i,
        /kreativ.*person.*vs.*processfokuserad/i,
        /traditionell.*företag.*vs.*modern/i,
        /väletablerad.*process.*vs.*agil/i
      ]
    },
    {
      key: "previous_recruitment_experience",
      description: "Tidigare rekryteringserfarenheter - vad hände med senaste rekryteringen inom liknande roll?",
      weight: 4,
      keywords: [
        "förra", "senaste", "tidigare", "rekrytering", "anställning", "rekryterade",
        "slutade", "sade upp sig", "sparkade", "misslyckades", "lyckades", "fungerade",
        "inte fungerade", "passade", "passade inte", "eftersom", "därför att",
        "månader", "veckor", "år", "lång tid", "kort tid", "snart",
        "liknande roll", "samma typ", "precis som", "ungefär samma"
      ],
      patterns: [
        /förra.*slutade.*efter.*\d+.*månader/i,
        /senaste.*rekrytering.*inte fungerade/i,
        /tidigare.*anställning.*sparkade.*eftersom/i,
        /förra.*person.*sade upp sig.*därför att/i,
        /senaste.*rekrytering.*liknande roll/i,
        /tidigare.*rekrytering.*passade inte/i,
        /förra.*slutade.*snart.*eftersom/i,
        /senaste.*anställning.*misslyckades/i,
        /tidigare.*rekrytering.*samma typ/i,
        /förra.*person.*inte passade/i
      ]
    },
    {
      key: "decision_styles_processes",
      description: "Beslutsstilar och processer - hur fattas beslut, vem påverkar vem, hur hanteras konflikter?",
      weight: 3,
      keywords: [
        "beslut", "beslutsprocess", "beslutsstil", "fattar beslut", "beslutsfattande",
        "påverkar", "påverkan", "inflytande", "vetorätt", "röstning", "konsensus",
        "konflikter", "konfliktlösning", "hantera", "lösa", "process",
        "möten", "fredagsmöten", "veckomöten", "månadsmöten", "kvartalsmöten",
        "hierarki", "chef", "manager", "ledning", "styrelse", "alla"
      ],
      patterns: [
        /hur.*fattas.*beslut|beslutsprocess/i,
        /vem.*påverkar.*vem|inflytande/i,
        /konflikter.*hanteras|löses/i,
        /fredagsmöten.*beslut|veckomöten/i,
        /vetorätt|röstning.*konsensus/i,
        /chef.*beslutar.*vs.*alla/i,
        /hierarki.*beslut.*vs.*platt/i,
        /ledning.*beslutar.*vs.*team/i,
        /styrelse.*beslut.*vs.*management/i,
        /process.*beslut.*vs.*ad hoc/i
      ]
    },
    {
      key: "organizational_maturity",
      description: "Organisatorisk mognad - är företaget redo för denna typ av roll och ansvar?",
      weight: 3,
      keywords: [
        "redo", "mogen", "mognad", "förberedd", "kan hantera", "klar för",
        "denna typ", "sådan roll", "ansvar", "nivå", "komplexitet",
        "startup", "växande", "etablerad", "mogen organisation", "ung",
        "erfarenhet", "tidigare", "aldrig haft", "ny roll", "barnsjukdomar",
        "struktur", "processer", "system", "verktyg", "resurser"
      ],
      patterns: [
        /redo.*för.*denna.*typ.*roll/i,
        /mogen.*för.*sådan.*ansvar/i,
        /kan hantera.*denna.*komplexitet/i,
        /startup.*växande.*vs.*etablerad/i,
        /aldrig haft.*sådan.*roll/i,
        /ny roll.*barnsjukdomar/i,
        /struktur.*processer.*redo/i,
        /system.*verktyg.*kan hantera/i,
        /resurser.*klar för/i,
        /erfarenhet.*tidigare.*roll/i
      ]
    }
  ]
};

// CLUSTER 6: ALTERNATIVES - Final cluster for comprehensive analysis
export const ALTERNATIVES_REQUIREMENTS: ClusterRequirements = {
  name: "Alternatives",
  description: "Utmana rekrytering som bästa lösning genom alternativanalys",
  minimumPoints: 3, // Minst 3 av 4 punkter
  progressThreshold: 75, // 75% confidence för att avsluta analysen
  requiredPoints: [
    {
      key: "alternatives_evaluated",
      description: "Alternativ utvärderade - har användaren övervägt andra lösningar än rekrytering?",
      weight: 4,
      keywords: [
        "konsult", "konsulter", "konsulting", "freelancer", "frilansare",
        "automation", "automatisering", "automatisk", "system", "verktyg",
        "outsourcing", "utveckling", "externa", "partner", "leverantör",
        "omorganisation", "omstrukturering", "omställning", "förändring",
        "övervägt", "tittat på", "jämfört", "alternativ", "andra lösningar",
        "istället för", "utöver", "utom", "förutom", "förbi"
      ],
      patterns: [
        /konsult|konsulter.*övervägt|tittat på/i,
        /automation|automatisering.*som.*alternativ/i,
        /outsourcing.*vs.*anställning/i,
        /omorganisation.*istället för/i,
        /andra lösningar.*än.*rekrytering/i,
        /alternativ.*som.*konsult/i,
        /jämfört.*med.*externa/i,
        /övervägt.*automation/i,
        /tittat på.*frilansare/i,
        /andra möjligheter.*än/i
      ]
    },
    {
      key: "comparison_made",
      description: "Jämförelse gjord - hur väger alternativen mot varandra i kostnad/tid/kvalitet?",
      weight: 4,
      keywords: [
        "kostnad", "tid", "kvalitet", "jämfört", "väger", "fördelar", "nackdelar",
        "dyrare", "billigare", "snabbare", "långsammare", "bättre", "sämre",
        "analys", "utvärdering", "bedömning", "pros", "cons", "plus", "minus",
        "kronor", "kr", "SEK", "dagar", "veckor", "månader", "år",
        "effektivitet", "produktivitet", "resultat", "prestation"
      ],
      patterns: [
        /kostnad.*jämfört.*med.*konsult|automation/i,
        /tid.*snabbare.*än.*anställning/i,
        /kvalitet.*bättre.*med.*externa/i,
        /analys.*fördelar.*nackdelar/i,
        /\d+.*kr.*dyrare.*billigare/i,
        /dagar.*veckor.*snabbare/i,
        /effektivitet.*produktivitet.*jämfört/i,
        /resultat.*prestation.*analys/i,
        /pros.*cons.*alternativ/i,
        /plus.*minus.*jämförelse/i
      ]
    },
    {
      key: "recruitment_arguments",
      description: "Argument för rekrytering - varför är anställning bättre än alternativen?",
      weight: 4,
      keywords: [
        "anställning", "rekrytering", "fast", "permanent", "intern", "egen",
        "bättre", "fördelar", "därför", "eftersom", "för att", "trots",
        "kontinuitet", "långsikt", "kultur", "team", "passform", "lojalitet",
        "kompetens", "kunskap", "erfarenhet", "specialist", "expertis",
        "kontroll", "styrning", "ansvar", "engagemang", "investering"
      ],
      patterns: [
        /anställning.*bättre.*än.*konsult/i,
        /rekrytering.*fördelar.*kontinuitet/i,
        /fast.*anställning.*kultur.*team/i,
        /därför.*anställa.*istället/i,
        /eftersom.*intern.*kompetens/i,
        /för att.*långsikt.*investering/i,
        /trots.*dyrare.*bättre/i,
        /kontroll.*styrning.*egen/i,
        /passform.*loyalitet.*permanent/i,
        /specialist.*expertis.*intern/i
      ]
    },
    {
      key: "risk_awareness",
      description: "Riskmedvetenhet - förstår användaren riskerna med att rekrytera vs andra lösningar?",
      weight: 4,
      keywords: [
        "risk", "risker", "problematiskt", "svårt", "utmaningar", "ovisshet",
        "fel", "misslyckande", "konsekvenser", "vad händer om", "om det inte",
        "backup", "alternativ", "plan b", "reservplan", "omväg",
        "fel person", "inte passar", "slutar", "säger upp sig",
        "kostnad", "förlust", "tidsförlust", "produktivitetsförlust"
      ],
      patterns: [
        /risk.*rekrytering.*fel person/i,
        /vad händer.*om.*inte.*passar/i,
        /konsekvenser.*om.*misslyckande/i,
        /backup.*plan.*b.*alternativ/i,
        /omväg.*om.*inte.*fungerar/i,
        /kostnad.*förlust.*fel/i,
        /tidsförlust.*produktivitetsförlust/i,
        /ovisshet.*utmaningar.*rekrytering/i,
        /problematiskt.*svårt.*anställning/i,
        /reservplan.*om.*går fel/i
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
      nextQuestion: canProgress ? undefined : this.generateFollowUpQuestion(missingPoints[0] || '', 'pain-point')
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
      nextQuestion: canProgress ? undefined : this.generateFollowUpQuestion(missingPoints[0] || '', 'impact-urgency')
    };
  }

  static analyzeSuccessCheck(userMessage: string): InformationAnalysis {
    const requirements = SUCCESS_CHECK_REQUIREMENTS;
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
      clusterId: 'success-check',
      foundPoints,
      totalScore,
      missingPoints,
      canProgress,
      nextQuestion: canProgress ? undefined : this.generateFollowUpQuestion(missingPoints[0] || '', 'success-check')
    };
  }

  static analyzeResources(userMessage: string): InformationAnalysis {
    const requirements = RESOURCES_REQUIREMENTS;
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
      clusterId: 'resources',
      foundPoints,
      totalScore,
      missingPoints,
      canProgress,
      nextQuestion: canProgress ? undefined : this.generateFollowUpQuestion(missingPoints[0] || '', 'resources')
    };
  }

  static analyzeOrganizationalReality(userMessage: string): InformationAnalysis {
    const requirements = ORGANIZATIONAL_REALITY_REQUIREMENTS;
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
      clusterId: 'org-reality',
      foundPoints,
      totalScore,
      missingPoints,
      canProgress,
      nextQuestion: canProgress ? undefined : this.generateFollowUpQuestion(missingPoints[0] || '', 'org-reality')
    };
  }

  static analyzeAlternatives(userMessage: string): InformationAnalysis {
    const requirements = ALTERNATIVES_REQUIREMENTS;
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
      clusterId: 'alternatives',
      foundPoints,
      totalScore,
      missingPoints,
      canProgress,
      nextQuestion: canProgress ? undefined : this.generateFollowUpQuestion(missingPoints[0] || '', 'alternatives')
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
      },
      'success-check': {
        "Mätbara mål - konkreta siffror, procent eller andra mätbara resultat": [
          "Kan du ge konkreta siffror eller procent på vad framgång skulle innebära?",
          "Vilka mätbara resultat vill ni uppnå?",
          "Hur skulle ni mäta om detta är lyckat eller inte?"
        ],
        "Tidsram - inom hur lång tid ska framgång synas? (30/90/365 dagar)": [
          "Inom hur lång tid vill ni se resultat?",
          "Vilken tidsram har ni för att uppnå dessa mål?",
          "När ska framgången vara synlig - 30, 90 eller 365 dagar?"
        ],
        "Definition av framgång vs misslyckande - vad räknas som bra nog vs inte bra nog?": [
          "Vad räknas som framgång för er?",
          "Vad skulle vara acceptabelt vs oacceptabelt?",
          "Hur definierar ni att något är bra nog?"
        ],
        "Ansvarig för måluppfyllelse - vem ska leverera resultatet och rapportera framsteg?": [
          "Vem är ansvarig för att leverera dessa resultat?",
          "Vem ska rapportera framsteg och till vem?",
          "Vilken roll eller person har ansvaret för måluppfyllelse?"
        ]
      },
      'resources': {
        "Total kostnad - inte bara lön utan all kostnad (lön + sociala avgifter + utrustning + utbildning)": [
          "Kan du ge en total kostnad som inkluderar lön, sociala avgifter, utrustning och utbildning?",
          "Vad blir den totala kostnaden per år inklusive allt?",
          "Hur mycket kostar det totalt med lön, arbetsgivaravgifter och utrustning?"
        ],
        "Onboarding-kapacitet - vem har tid att introducera personen och hur mycket tid per vecka?": [
          "Vem kan dedikera tid för att introducera den nya personen?",
          "Hur många timmar per vecka kan någon ägna åt onboarding?",
          "Vem ansvarar för introduktionen och hur mycket tid har de?"
        ],
        "Tillgängliga verktyg/system - vad finns redan vs vad behöver köpas/implementeras?": [
          "Vilka verktyg och system finns redan vs vad behöver köpas?",
          "Vad har ni redan installerat och vad saknar ni?",
          "Vilka system behöver ni köpa eller implementera för denna roll?"
        ],
        "Budgetverklighet - vad händer om kostnaden blir 20% högre än planerat?": [
          "Vad händer om kostnaden blir 20% högre än ni planerat?",
          "Om budgeten överskrids med 20%, vad gör ni då?",
          "Vad händer om den totala kostnaden blir dyrare än beräknat?"
        ]
      },
      'org-reality': {
        "Kulturell passform - vilken typ av person fungerar/fungerar inte i organisationen?": [
          "Vilken typ av person fungerar bra i er organisation?",
          "Vad kännetecknar personer som inte passat i er kultur?",
          "Hur skulle ni beskriva den ideala personen för er miljö?"
        ],
        "Tidigare rekryteringserfarenheter - vad hände med senaste rekryteringen inom liknande roll?": [
          "Vad hände med er senaste rekrytering till en liknande roll?",
          "Berätta om er förra anställning inom detta område - vad gick bra/dåligt?",
          "Hur länge stannade den förra personen och varför slutade de?"
        ],
        "Beslutsstilar och processer - hur fattas beslut, vem påverkar vem, hur hanteras konflikter?": [
          "Hur fattas beslut i er organisation?",
          "Vem påverkar vem i beslutsprocessen?",
          "Hur hanterar ni konflikter och oenigheter?"
        ],
        "Organisatorisk mognad - är företaget redo för denna typ av roll och ansvar?": [
          "Är er organisation redo för denna typ av roll?",
          "Har ni tidigare erfarenhet av liknande ansvar?",
          "Vad behöver ni för att kunna hantera denna roll effektivt?"
        ]
      },
      'alternatives': {
        "Alternativ utvärderade - har användaren övervägt andra lösningar än rekrytering?": [
          "Har ni övervägt andra lösningar än rekrytering?",
          "Vilka alternativ har ni tittat på - konsulter, automation, outsourcing?",
          "Har ni jämfört olika lösningar för att lösa detta problem?"
        ],
        "Jämförelse gjord - hur väger alternativen mot varandra i kostnad/tid/kvalitet?": [
          "Hur jämför ni alternativen i kostnad, tid och kvalitet?",
          "Vad är fördelarna och nackdelarna med varje alternativ?",
          "Vilken analys har ni gjort av olika lösningar?"
        ],
        "Argument för rekrytering - varför är anställning bättre än alternativen?": [
          "Varför är rekrytering bättre än alternativen?",
          "Vilka fördelar ser ni med fast anställning?",
          "Vad är argumenten för att anställa istället för andra lösningar?"
        ],
        "Riskmedvetenhet - förstår användaren riskerna med att rekrytera vs andra lösningar?": [
          "Vilka risker ser ni med att rekrytera?",
          "Vad händer om rekryteringen inte fungerar som planerat?",
          "Har ni tänkt på vad som kan gå fel och hur ni hanterar det?"
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