import { InformationAnalyzer } from './information-requirements';
import { InformationAnalysis } from './information-requirements';

export interface ClusterUpdate {
  clusterId: string;
  updates: {
    confidence: number;
    status: string;
    lastUpdated: string;
  };
}

export interface ArenaAnalysis {
  analysis: InformationAnalysis | null;
  newConfidence: number;
  canProgress: boolean;
  missingPoints: string[];
  nextQuestion?: string;
}

export interface ClusterData {
  confidence: number;
  status: string;
  lastUpdated: string;
}

export interface ArenaContext {
  currentCluster: string;
  clusters: Record<string, { confidence: number }>;
  latestUserMessage: { role: string; content: string };
  sessionId: string;
  messagesCount: number;
}

export class ArenaEngine {
  private static readonly CLUSTER_NAMES: Record<string, string> = {
    'pain-point': 'Problem & Pain Point',
    'impact-urgency': 'Påverkan & Prioritering', 
    'success-check': 'Framgång & Kriterier',
    'resources': 'Resurser & Budget',
    'org-reality': 'Organisation & Kultur',
    'alternatives': 'Alternativ & Risker'
  };

  /**
   * Analyzes user message and updates cluster confidence based on intelligent information analysis
   */
  static analyzeClusterProgress(context: ArenaContext): ArenaAnalysis | null {
    const { currentCluster, clusters, latestUserMessage } = context;
    
    if (!currentCluster || !clusters || latestUserMessage?.role !== 'user') {
      return null;
    }

    console.log('Processing cluster update...', {
      currentCluster,
      currentConfidence: clusters[currentCluster]?.confidence || 0,
      clusterExists: !!clusters[currentCluster]
    });

    let analysis: InformationAnalysis;
    let newConfidence = clusters[currentCluster]?.confidence || 0;

    try {
      // Route to appropriate analysis method based on cluster
      switch (currentCluster) {
        case 'pain-point':
          analysis = InformationAnalyzer.analyzePainPoint(latestUserMessage.content);
          break;
        case 'impact-urgency':
          analysis = InformationAnalyzer.analyzeImpactUrgency(latestUserMessage.content);
          break;
        case 'success-check':
          analysis = InformationAnalyzer.analyzeSuccessCheck(latestUserMessage.content);
          break;
        case 'resources':
          analysis = InformationAnalyzer.analyzeResources(latestUserMessage.content);
          break;
        case 'org-reality':
          analysis = InformationAnalyzer.analyzeOrganizationalReality(latestUserMessage.content);
          break;
        default:
          // Fallback for other clusters (will be updated later)
          const messageLength = latestUserMessage.content.length;
          const hasDetails = messageLength > 100;
          const confidenceIncrease = hasDetails ? 25 : 15;
          newConfidence = Math.min(100, (clusters[currentCluster]?.confidence || 0) + confidenceIncrease);
          return {
            analysis: null,
            newConfidence,
            canProgress: newConfidence >= 75,
            missingPoints: [],
            nextQuestion: undefined
          };
      }

      // Set confidence based on information quality, not message length
      newConfidence = analysis.totalScore;

      // Log analysis results
      console.log(`${this.CLUSTER_NAMES[currentCluster]} Analysis:`, {
        foundPoints: analysis.foundPoints.filter(p => p.found).map(p => p.key),
        totalScore: analysis.totalScore,
        canProgress: analysis.canProgress,
        missingPoints: analysis.missingPoints
      });

      // Store next question for better follow-up
      if (analysis.nextQuestion) {
        console.log('Suggested next question:', analysis.nextQuestion);
      }

      return {
        analysis,
        newConfidence,
        canProgress: analysis.canProgress,
        missingPoints: analysis.missingPoints,
        nextQuestion: analysis.nextQuestion
      };

    } catch (error) {
      console.error('Cluster analysis failed:', error);
      return null;
    }
  }

  /**
   * Creates cluster update object
   */
  static createClusterUpdate(currentCluster: string, newConfidence: number): ClusterUpdate {
    return {
      clusterId: currentCluster,
      updates: {
        confidence: newConfidence,
        status: newConfidence >= 75 ? 'complete' : 'in-progress',
        lastUpdated: new Date().toISOString()
      }
    };
  }

  /**
   * Gets cluster display name
   */
  static getClusterName(clusterId: string): string {
    return this.CLUSTER_NAMES[clusterId] || 'Start';
  }

  /**
   * Determines next cluster in sequence
   */
  static getNextCluster(currentCluster: string): string | null {
    const clusterSequence = [
      'pain-point',
      'impact-urgency', 
      'success-check',
      'resources',
      'org-reality',
      'alternatives'
    ];

    const currentIndex = clusterSequence.indexOf(currentCluster);
    if (currentIndex === -1 || currentIndex >= clusterSequence.length - 1) {
      return null;
    }

    return clusterSequence[currentIndex + 1];
  }

  /**
   * Checks if analysis is complete (all clusters done)
   */
  static isAnalysisComplete(currentCluster: string): boolean {
    return currentCluster === 'alternatives';
  }
}
