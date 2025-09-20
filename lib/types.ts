// Arena Cluster System Types
export type ClusterType = 
  | 'pain-point' 
  | 'impact-urgency' 
  | 'success-check' 
  | 'resources' 
  | 'org-reality' 
  | 'alternatives';

export type ClusterStatus = 
  | 'not-started' 
  | 'in-progress' 
  | 'complete' 
  | 'needs-revisit';

export type ArenaCluster = {
  id: ClusterType;
  name: string;
  description: string;
  status: ClusterStatus;
  confidence: number; // 0-100% how confident we are in the information
  keyInsights: string[];
  contradictions: string[];
  triggers: string[]; // What triggered deeper exploration
  completedAt?: Date;
};

export type ArenaSession = {
  id: string;
  messages: Message[];
  currentCluster: ClusterType;
  clusters: Record<ClusterType, ArenaCluster>;
  extractedData?: ExtractedData;
  sessionInsights: {
    identifiedBiases: string[];
    redFlags: string[];
    hiddenAssumptions: string[];
    contradictions: string[];
  };
  overallConfidence: number;
  createdAt: Date;
  completedAt?: Date;
};

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  clusterId?: ClusterType;
  confidenceImpact?: number; // How much this message affected cluster confidence
  ragEnhanced?: boolean;
  sources?: string[];
};

// Extracted Data Structure
export type ExtractedData = {
  companyInfo: {
    name: string;
    size: 'startup' | 'scaling' | 'enterprise';
    industry: string;
    growthStage: string;
  };
  roleDetails: {
    title: string;
    department: string;
    seniority: 'junior' | 'mid' | 'senior' | 'executive';
    keyResponsibilities: string[];
    criticalSkills: string[];
  };
  context: {
    urgency: 'low' | 'medium' | 'high';
    budget: string;
    timeline: string;
    teamSize: number;
    reportingStructure: string;
  };
  challenges: {
    currentPainPoints: string[];
    strategicGoals: string[];
    riskFactors: string[];
    successMetrics: string[];
  };
  insights: {
    identifiedBiases: string[];
    gapAnalysis: string[];
    recommendations: string[];
    benchmarkNeeds: string[];
  };
};

// Report Generation Types
export type ReportData = {
  sessionId: string;
  companyName: string;
  roleTitle: string;
  executiveSummary: string;
  currentState: string;
  coreInsights: string[];
  strategicOptions: string[];
  riskAnalysis: string[];
  roiProjection: string;
  implementationPlan: string[];
  generatedAt: Date;
};