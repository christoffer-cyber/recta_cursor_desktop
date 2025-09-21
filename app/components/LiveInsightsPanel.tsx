"use client";

import React from 'react';

export interface Contradiction {
  id: string;
  type: 'bias' | 'assumption' | 'inconsistency' | 'gap';
  description: string;
  confidence: number; // 0-1
  evidence: string;
  timestamp: Date;
}

export interface LiveInsightsPanelProps {
  contradictions: Contradiction[];
  currentCluster: string;
}

export default function LiveInsightsPanel({ 
  contradictions, 
  currentCluster 
}: LiveInsightsPanelProps) {
  // Get the latest 3 contradictions
  const recentContradictions = contradictions
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 3);

  const totalBiasCount = contradictions.filter(c => c.type === 'bias').length;

  const getInsightIcon = (type: Contradiction['type']) => {
    switch (type) {
      case 'bias':
        return '⚠️';
      case 'assumption':
        return '🤔';
      case 'inconsistency':
        return '❗';
      case 'gap':
        return '🔍';
      default:
        return '💡';
    }
  };

  return (
    <div className="live-insights-panel">
      <div className="panel-header">
        <h3>Live Insights</h3>
        <span className="insights-counter">
          {contradictions.length}
        </span>
      </div>

      {recentContradictions.length > 0 ? (
        <div className="insights-list">
          {recentContradictions.map((contradiction) => (
            <div key={contradiction.id} className="insight-item">
              <div className="insight-icon">
                {getInsightIcon(contradiction.type)}
              </div>
              <div className="insight-content">
                <div className="insight-description">
                  {contradiction.description}
                </div>
                <div className="insight-evidence">
                  {contradiction.evidence}
                </div>
                <div 
                  className={`insight-confidence confidence-${Math.round(contradiction.confidence * 10)}`}
                >
                  {Math.round(contradiction.confidence * 100)}% säkerhet
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-insights">
          <p>Inga insights upptäckta än...</p>
          <small>AI:n analyserar dina svar för att identifiera antaganden och bias</small>
        </div>
      )}

      <div className="bias-counter">
        <strong>Bias upptäckta:</strong> {totalBiasCount}
      </div>
    </div>
  );
}
