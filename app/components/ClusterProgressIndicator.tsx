'use client';

import { ClusterType, ArenaCluster } from '../../lib/types';
import { CLUSTER_DEFINITIONS } from '../../lib/arena-clusters';

interface ClusterProgressIndicatorProps {
  clusters: Record<ClusterType, ArenaCluster>;
  currentCluster: ClusterType;
  overallConfidence: number;
}

export default function ClusterProgressIndicator({ 
  clusters, 
  currentCluster, 
  overallConfidence 
}: ClusterProgressIndicatorProps) {
  
  const getStatusColor = (status: string, confidence: number) => {
    if (status === 'complete' || confidence >= 75) return 'bg-green-500';
    if (status === 'in-progress') return 'bg-blue-500';
    if (status === 'needs-revisit') return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getStatusIcon = (status: string, confidence: number) => {
    if (status === 'complete' || confidence >= 75) return '✓';
    if (status === 'in-progress') return '●';
    if (status === 'needs-revisit') return '!';
    return '○';
  };

  return (
    <div className="arena-progress-section">
      <div className="progress-header">
        <h3 className="progress-title">Analysens Framsteg</h3>
        <div className="overall-confidence">
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ width: `${overallConfidence}%` }}
            ></div>
          </div>
          <span className="confidence-text">{overallConfidence}%</span>
        </div>
      </div>

      <div className="cluster-progress">
        {Object.entries(CLUSTER_DEFINITIONS).map(([clusterId, definition]) => {
          const cluster = clusters[clusterId as ClusterType];
          const isCurrent = clusterId === currentCluster;
          const confidence = cluster?.confidence || 0;
          
          return (
            <div 
              key={clusterId}
              className={`cluster-item ${isCurrent ? 'current' : ''} ${cluster?.status || 'not-started'}`}
            >
              <div className="cluster-header">
                <div 
                  className={`cluster-icon ${getStatusColor(cluster?.status || 'not-started', confidence)}`}
                >
                  {getStatusIcon(cluster?.status || 'not-started', confidence)}
                </div>
                <div className="cluster-info">
                  <h4 className="cluster-name">{definition.name}</h4>
                  <p className="cluster-description">{definition.description}</p>
                </div>
                <div className="cluster-confidence">
                  {confidence}%
                </div>
              </div>
              
              {isCurrent && (
                <div className="current-focus">
                  <div className="focus-indicator">
                    <span className="focus-pulse"></span>
                    Pågår nu
                  </div>
                </div>
              )}
              
              {cluster?.keyInsights && cluster.keyInsights.length > 0 && (
                <div className="cluster-insights">
                  <h5>Nyckelinsikter:</h5>
                  <ul>
                    {cluster.keyInsights.slice(0, 2).map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {cluster?.contradictions && cluster.contradictions.length > 0 && (
                <div className="cluster-contradictions">
                  <h5>⚠️ Motsägelser att utforska:</h5>
                  <ul>
                    {cluster.contradictions.map((contradiction, index) => (
                      <li key={index}>{contradiction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="analysis-status">
        {overallConfidence >= 80 ? (
          <div className="status-ready">
            <span className="status-icon">🎯</span>
            <span>Redo för rapportgenerering</span>
          </div>
        ) : (
          <div className="status-progress">
            <span className="status-icon">🔍</span>
            <span>Analyserar... {Math.round((overallConfidence / 80) * 100)}% klart</span>
          </div>
        )}
      </div>
    </div>
  );
}

