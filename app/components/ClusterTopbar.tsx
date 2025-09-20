'use client';

import { ClusterType, ArenaCluster } from '../../lib/types';
import { CLUSTER_DEFINITIONS } from '../../lib/arena-clusters';

interface ClusterTopbarProps {
  clusters: Record<ClusterType, ArenaCluster>;
  currentCluster: ClusterType;
  overallConfidence: number;
}

export default function ClusterTopbar({ 
  clusters, 
  currentCluster, 
  overallConfidence 
}: ClusterTopbarProps) {
  
  const getStepIcon = (status: string, confidence: number) => {
    if (status === 'complete' || confidence >= 75) return '✓';
    if (status === 'in-progress') return '●';
    if (status === 'needs-revisit') return '!';
    return '○';
  };

  const getStepName = (clusterId: ClusterType) => {
    const names = {
      'pain-point': 'Problem',
      'impact-urgency': 'Påverkan',
      'success-check': 'Framgång',
      'resources': 'Resurser',
      'org-reality': 'Organisation',
      'alternatives': 'Alternativ'
    };
    return names[clusterId] || clusterId;
  };

  return (
    <div className="cluster-topbar">
      <div className="cluster-steps">
        {Object.entries(CLUSTER_DEFINITIONS).map(([clusterId, definition]) => {
          const cluster = clusters[clusterId as ClusterType];
          const isCurrent = clusterId === currentCluster;
          const confidence = cluster?.confidence || 0;
          const status = cluster?.status || 'not-started';
          
          return (
            <div 
              key={clusterId}
              className={`cluster-step ${status} ${isCurrent ? 'current' : ''}`}
            >
              <div className={`step-icon ${status}`}>
                {getStepIcon(status, confidence)}
              </div>
              <span className="step-name">
                {getStepName(clusterId as ClusterType)}
              </span>
              <span className="step-confidence">
                {confidence}%
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="topbar-confidence">
        <div className="topbar-confidence-bar">
          <div 
            className="topbar-confidence-fill" 
            style={{ width: `${overallConfidence}%` }}
          ></div>
        </div>
        <span className="topbar-confidence-text">{overallConfidence}%</span>
      </div>
    </div>
  );
}

