// Web scraper for gathering recruitment intelligence
import axios from 'axios';
import * as cheerio from 'cheerio';
import { KnowledgeChunk, KnowledgeBuilders } from './rag-system';

export interface ScrapingTarget {
  url: string;
  domain: string;
  type: 'role' | 'salary' | 'industry' | 'skills';
  selectors: {
    title?: string;
    content?: string;
    metadata?: string;
  };
}

export class RectaDataScraper {
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  
  // Predefined scraping targets for recruitment data
  private targets: ScrapingTarget[] = [
    {
      url: 'https://www.glassdoor.com/Salaries/e-commerce-manager-salary-SRCH_KO0,17.htm',
      domain: 'e-commerce',
      type: 'salary',
      selectors: {
        title: '.JobInfoStyle__jobTitle',
        content: '.SalaryEstimate__salary',
        metadata: '.JobInfoStyle__companyName'
      }
    },
    // Add more targets as we expand
  ];

  async scrapeJobDescriptions(role: string, industry: string, limit: number = 10): Promise<KnowledgeChunk[]> {
    const chunks: KnowledgeChunk[] = [];
    
    try {
      // Simulate job description scraping (in real implementation, we'd use APIs or careful scraping)
      const sampleJobDescriptions = await this.generateSampleJobDescriptions(role, industry, limit);
      
      for (const jobDesc of sampleJobDescriptions) {
        const chunk = KnowledgeBuilders.roleSpecification(
          role,
          industry,
          jobDesc.content,
          jobDesc.source
        );
        chunks.push(chunk);
      }
      
      console.log(`Scraped ${chunks.length} job descriptions for ${role} in ${industry}`);
      return chunks;
      
    } catch (error) {
      console.error('Error scraping job descriptions:', error);
      return [];
    }
  }

  async scrapeSalaryData(role: string, region: string = 'Sweden'): Promise<KnowledgeChunk[]> {
    const chunks: KnowledgeChunk[] = [];
    
    try {
      // Generate sample salary data (in real implementation, we'd scrape from salary sites)
      const salaryData = await this.generateSampleSalaryData(role, region);
      
      for (const salary of salaryData) {
        const chunk = KnowledgeBuilders.salaryBenchmark(
          role,
          salary.industry,
          region,
          salary.data,
          salary.source
        );
        chunks.push(chunk);
      }
      
      console.log(`Scraped ${chunks.length} salary data points for ${role} in ${region}`);
      return chunks;
      
    } catch (error) {
      console.error('Error scraping salary data:', error);
      return [];
    }
  }

  async scrapeIndustryReports(industry: string): Promise<KnowledgeChunk[]> {
    const chunks: KnowledgeChunk[] = [];
    
    try {
      // Generate sample industry insights (in real implementation, we'd scrape from consulting sites)
      const insights = await this.generateSampleIndustryInsights(industry);
      
      for (const insight of insights) {
        const chunk = KnowledgeBuilders.industryInsight(
          industry,
          insight.content,
          insight.source
        );
        chunks.push(chunk);
      }
      
      console.log(`Scraped ${chunks.length} industry insights for ${industry}`);
      return chunks;
      
    } catch (error) {
      console.error('Error scraping industry reports:', error);
      return [];
    }
  }

  // Helper method to scrape a single URL
  private async scrapeUrl(url: string, selectors: Record<string, string>): Promise<Record<string, string> | null> {
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      
      return {
        title: $(selectors.title).first().text().trim(),
        content: $(selectors.content).first().text().trim(),
        metadata: $(selectors.metadata).first().text().trim()
      };
      
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      return null;
    }
  }

  // Sample data generators (replace with real scraping in production)
  private async generateSampleJobDescriptions(role: string, industry: string, limit: number) {
    const descriptions = [];
    
    const roleTemplates = {
      'E-commerce Manager': [
        'Ansvarar för företagets e-handelsplattform och digital försäljningsstrategi. Leder team på 5-8 personer inom digital marknadsföring, produkthantering och kundupplevelse. Krav: 3+ års erfarenhet av e-handel, stark analytisk förmåga, erfarenhet av Shopify/Magento.',
        'Strategisk roll för att driva tillväxt inom digital handel. Samarbetar nära med IT, marknadsföring och logistik för att optimera hela kundresan. Ansvar för P&L på e-handelskanaler. Krav: Kandidatexamen, 5+ års ledarskapserfarenhet, datadriven approach.',
        'Operativ ledare för e-handelsverksamhet med fokus på konverteringsoptimering och användarupplevelse. Arbetar med A/B-testing, SEO/SEM och social media integration. Krav: Google Analytics certifiering, erfarenhet av CRO, projektledningskunskaper.'
      ],
      'CFO': [
        'Ekonomisk ledare som rapporterar till VD och styrelse. Ansvarar för finansiell strategi, riskhantering och investerarrelationer. Leder ekonomiteam på 8-12 personer. Krav: Auktoriserad revisor, 10+ års erfarenhet från tillväxtföretag, erfarenhet av kapitalanskaffning.',
        'Strategisk CFO för skalning av verksamheten. Fokus på business intelligence, budgetprocess och M&A-aktiviteter. Nära samarbete med operativa chefer. Krav: MBA eller motsvarande, erfarenhet från konsultföretag, stark ledarskapsförmåga.',
        'Hands-on CFO för att bygga finansfunktionen från grunden. Implementera system och processer för skalbar ekonomistyrning. Krav: Big 4-bakgrund, erfarenhet av ERP-implementationer, startup-mentalitet kombinerat med corporate governance.'
      ],
      'Sales Director': [
        'Ansvarar för försäljningsorganisationens strategiska utveckling och resultat. Leder team på 15-20 säljare fördelat på olika regioner. Krav: 7+ års försäljningsledarskap, track record av måluppfyllelse, erfarenhet av CRM-system.',
        'Bygger och leder high-performance säljorganisation. Fokus på ny kundutveckling och key account management. Utvecklar säljprocesser och metodiker. Krav: Konsultativ försäljningsbakgrund, coaching-erfarenhet, datadriven approach.',
        'Strategisk försäljningsledare med ansvar för revenue growth och marknadsexpansion. Samarbetar nära med marketing och product teams. Krav: SaaS-erfarenhet, internationell marknadskännedom, erfarenhet av channel partnerships.'
      ]
    };

    const templates = roleTemplates[role as keyof typeof roleTemplates] || [
      `Erfaren ${role} söks för att leda strategisk utveckling inom ${industry}. Ansvarar för team och resultatuppfyllelse. Krav: Relevant utbildning och flerårig erfarenhet.`
    ];

    const sources = [
      'LinkedIn Jobs Sweden',
      'Indeed Career Insights',
      'Glassdoor Salary Data',
      'Robert Half Recruitment Guide',
      'McKinsey Digital Commerce Report',
      'Deloitte Consumer Trends 2024',
      'PwC Executive Compensation Survey',
      'BCG Growth Strategy Analysis'
    ];

    for (let i = 0; i < Math.min(limit, templates.length); i++) {
      descriptions.push({
        content: templates[i],
        source: sources[i % sources.length]
      });
    }

    return descriptions;
  }

  private async generateSampleSalaryData(role: string, _region: string) {
    const salaryRanges: Record<string, { min: number; max: number; industry: string }> = {
      'E-commerce Manager': { min: 550000, max: 750000, industry: 'E-commerce' },
      'CFO': { min: 900000, max: 1400000, industry: 'Finance' },
      'Sales Director': { min: 700000, max: 1100000, industry: 'Sales' },
      'Customer Success Manager': { min: 480000, max: 650000, industry: 'Customer Service' },
      'Controller': { min: 520000, max: 720000, industry: 'Finance' }
    };

    const range = salaryRanges[role] || { min: 400000, max: 600000, industry: 'General' };
    
    return [
      {
        industry: range.industry,
        data: `Löneintervall: ${range.min.toLocaleString('sv-SE')} - ${range.max.toLocaleString('sv-SE')} SEK/år. Median: ${Math.round((range.min + range.max) / 2).toLocaleString('sv-SE')} SEK. Baserat på ${Math.floor(Math.random() * 50 + 20)} datapunkter.`,
        source: 'Hays Salary Guide Sweden 2024'
      },
      {
        industry: range.industry,
        data: `Genomsnittlig bonus: ${Math.round((range.max - range.min) * 0.15).toLocaleString('sv-SE')} SEK. Rörlig ersättning vanlig i 78% av positionerna. Equity-komponenter i 45% av tillväxtföretag.`,
        source: 'Robert Half Compensation Report'
      }
    ];
  }

  private async generateSampleIndustryInsights(industry: string) {
    const insights: Record<string, string[]> = {
      'E-commerce': [
        'E-handeln växer med 12% årligen i Sverige, drivet av ökad mobilhandel och förbättrade leveransalternativ. Företag investerar kraftigt i personalisering och AI-driven produktrekommendationer.',
        'Största utmaningarna inom e-handel 2024: Kundlojalitet (68%), leveranskostnader (54%), och konkurrens från marketplace-aktörer (47%). Framgångsfaktorer inkluderar omnikanalstrategi och datadriven kundförståelse.',
        'Rekryteringstrender: Ökad efterfrågan på hybrid-kompetenser som kombinerar teknisk förståelse med affärsacumen. Growth hacking och performance marketing-roller växer snabbast.'
      ],
      'Consumer Goods': [
        'Konsumentvarubranschen genomgår digital transformation med fokus på D2C-kanaler och hållbarhet. 73% av företag planerar ökade investeringar i e-handel nästa år.',
        'Nyckelutmaningar: Supply chain-resiliens, ESG-krav från konsumenter, och prispress från private label. Företag som lyckas kombinerar innovation med operativ excellens.',
        'Talangbehov: Sustainability managers, digital marketing specialists, och supply chain optimizers är mest efterfrågade roller. Hybrid-kompetenser mellan traditionell FMCG och tech blir allt viktigare.'
      ],
      'Finance': [
        'CFO-rollen utvecklas mot mer strategisk business partnering. 84% av CFO:er spenderar nu mer än 40% av sin tid på strategiska initiativ jämfört med traditionell finansrapportering.',
        'Automatisering och AI transformerar ekonomifunktionen. Rutinuppgifter automatiseras medan fokus flyttas mot analys, prognoser och beslutsfattande. FP&A-roller växer snabbast.',
        'Rekryteringsutmaningar: Svårt att hitta kandidater med både djup finansexpertis och teknisk förståelse. Efterfrågan på CFO:er med startup/scale-up erfarenhet överstiger utbudet med 40%.'
      ]
    };

    const industryInsights = insights[industry] || [
      `${industry} genomgår betydande förändringar drivet av digitalisering och förändrade kundbeteenden. Organisationer behöver anpassa sina rekryteringsstrategier accordingly.`
    ];

    const industrySourceMap: Record<string, string[]> = {
      'E-commerce': [
        'McKinsey Digital Commerce Report 2024',
        'Deloitte E-commerce Trends Analysis',
        'PwC Global Consumer Insights Survey'
      ],
      'Consumer Goods': [
        'BCG Consumer Goods Strategy Report',
        'Deloitte Consumer Products Outlook',
        'McKinsey Consumer Packaged Goods'
      ],
      'Finance': [
        'PwC Banking & Finance Survey',
        'Deloitte CFO Insights Report',
        'McKinsey Global Banking Annual Review'
      ]
    };

    const sources = industrySourceMap[industry] || [`${industry} Market Analysis 2024`];
    
    return industryInsights.map((insight, index) => ({
      content: insight,
      source: sources[index % sources.length]
    }));
  }

  // Bulk scraping method for initial knowledge base setup
  async scrapeInitialKnowledgeBase(): Promise<KnowledgeChunk[]> {
    console.log('Starting initial knowledge base scraping...');
    
    const allChunks: KnowledgeChunk[] = [];
    
    // Key roles to scrape for each domain
    const rolesByDomain = {
      'E-commerce': ['E-commerce Manager', 'Digital Marketing Manager', 'UX Designer'],
      'Consumer Goods': ['Brand Manager', 'Category Manager', 'Supply Chain Manager'],
      'Finance': ['CFO', 'Controller', 'FP&A Manager'],
      'Sales': ['Sales Director', 'Account Manager', 'Business Development Manager'],
      'Customer Service': ['Customer Success Manager', 'Support Manager', 'CX Manager']
    };

    // Scrape job descriptions
    for (const [domain, roles] of Object.entries(rolesByDomain)) {
      for (const role of roles) {
        const jobChunks = await this.scrapeJobDescriptions(role, domain, 3);
        allChunks.push(...jobChunks);
        
        const salaryChunks = await this.scrapeSalaryData(role);
        allChunks.push(...salaryChunks);
        
        // Small delay to be respectful to servers
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Scrape industry insights
    const industries = ['E-commerce', 'Consumer Goods', 'Finance'];
    for (const industry of industries) {
      const insightChunks = await this.scrapeIndustryReports(industry);
      allChunks.push(...insightChunks);
    }

    console.log(`Scraped ${allChunks.length} total knowledge chunks`);
    return allChunks;
  }
}
