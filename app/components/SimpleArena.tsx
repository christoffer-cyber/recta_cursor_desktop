"use client";
import React, { useState } from "react";
import { Message } from "../../lib/types";
import { ClusterType } from "../../lib/types";
import { DesignSystem, ComponentTokens } from "../../lib/design-system";
import SimpleArenaChat from "./SimpleArenaChat";
import SimpleClusterTopbar from "./SimpleClusterTopbar";

export default function SimpleArena() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCluster, setCurrentCluster] = useState<ClusterType>('pain-point');
  const [clusters, setClusters] = useState<Record<ClusterType, { confidence: number; status: string }>>({
    'pain-point': { confidence: 0, status: 'in-progress' },
    'impact-urgency': { confidence: 0, status: 'not-started' },
    'success-check': { confidence: 0, status: 'not-started' },
    'resources': { confidence: 0, status: 'not-started' },
    'org-reality': { confidence: 0, status: 'not-started' },
    'alternatives': { confidence: 0, status: 'not-started' }
  });
  const [sessionId] = useState(() => `arena_session_${Date.now()}`);

  // Calculate overall confidence
  const overallConfidence = Object.values(clusters).reduce((sum, cluster) => sum + cluster.confidence, 0) / Object.keys(clusters).length;

  const handleChatComplete = (completedMessages: Message[]) => {
    setMessages(completedMessages);
    console.log('Arena analysis completed!');
  };

  return (
    <div style={{
      ...ComponentTokens.arenaContainer,
      fontFamily: DesignSystem.typography.fontFamily.sans,
    }}>
      {/* Header */}
      <div style={ComponentTokens.arenaHeader}>
        <h1 style={ComponentTokens.arenaTitle}>
          Arena
        </h1>
        <p style={ComponentTokens.arenaSubtitle}>
          Strategisk rekryteringsförberedelse
        </p>
      </div>

      {/* Cluster Progress Topbar */}
      <SimpleClusterTopbar
        clusters={clusters}
        currentCluster={currentCluster}
        overallConfidence={overallConfidence}
      />

      {/* Main Content */}
      <div className="arena-main-grid">
        {/* Left: Chat Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          background: DesignSystem.colors.background.primary,
          borderRight: `1px solid ${DesignSystem.colors.neutral[200]}`,
        }}>
          <SimpleArenaChat
            sessionId={sessionId}
            onComplete={handleChatComplete}
          />
        </div>

        {/* Right: Canvas Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: DesignSystem.colors.background.secondary,
          overflow: 'hidden',
          padding: DesignSystem.spacing[6],
        }}>
          <div style={{
            textAlign: 'center',
            padding: DesignSystem.spacing[8],
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: DesignSystem.spacing[4],
            }}>
              🎯
            </div>
            
            <h2 style={{
              fontSize: DesignSystem.typography.fontSize['2xl'],
              fontWeight: DesignSystem.typography.fontWeight.bold,
              color: DesignSystem.colors.primary[900],
              marginBottom: DesignSystem.spacing[3],
            }}>
              Arena Analys
            </h2>
            
            <p style={{
              fontSize: DesignSystem.typography.fontSize.base,
              color: DesignSystem.colors.neutral[600],
              lineHeight: DesignSystem.typography.lineHeight.relaxed,
              marginBottom: DesignSystem.spacing[6],
            }}>
              Strategisk rekryteringsförberedelse som hjälper dig identifiera dolda behov, risker och möjligheter innan du påbörjar rekryteringsprocessen.
            </p>

            {/* Progress Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: DesignSystem.spacing[4],
              marginTop: DesignSystem.spacing[8],
            }}>
              {Object.entries(clusters).map(([clusterId, cluster]) => {
                const clusterType = clusterId as ClusterType;
                const isActive = clusterType === currentCluster;
                
                return (
                  <div
                    key={clusterId}
                    style={{
                      background: isActive 
                        ? DesignSystem.colors.primary[50]
                        : DesignSystem.colors.background.primary,
                      border: `2px solid ${isActive 
                        ? DesignSystem.colors.primary[500]
                        : DesignSystem.colors.neutral[200]}`,
                      borderRadius: DesignSystem.borderRadius.lg,
                      padding: DesignSystem.spacing[4],
                      textAlign: 'center',
                      transition: `all ${DesignSystem.transition.normal}`,
                    }}
                  >
                    <div style={{
                      fontSize: '1.5rem',
                      marginBottom: DesignSystem.spacing[2],
                    }}>
                      {cluster.confidence >= 75 ? '✅' : 
                       isActive ? '🔄' : '⏳'}
                    </div>
                    
                    <h3 style={{
                      fontSize: DesignSystem.typography.fontSize.sm,
                      fontWeight: DesignSystem.typography.fontWeight.semibold,
                      color: DesignSystem.colors.primary[900],
                      marginBottom: DesignSystem.spacing[1],
                    }}>
                      {clusterType === 'pain-point' && 'Problem & Pain Point'}
                      {clusterType === 'impact-urgency' && 'Påverkan & Prioritering'}
                      {clusterType === 'success-check' && 'Framgång & Kriterier'}
                      {clusterType === 'resources' && 'Resurser & Budget'}
                      {clusterType === 'org-reality' && 'Organisation & Kultur'}
                      {clusterType === 'alternatives' && 'Alternativ & Risker'}
                    </h3>
                    
                    <div style={{
                      fontSize: DesignSystem.typography.fontSize.sm,
                      color: DesignSystem.colors.neutral[600],
                    }}>
                      {Math.round(cluster.confidence)}% komplett
                    </div>
                    
                    <div style={{
                      width: '100%',
                      height: '4px',
                      background: DesignSystem.colors.neutral[200],
                      borderRadius: DesignSystem.borderRadius.sm,
                      marginTop: DesignSystem.spacing[2],
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${cluster.confidence}%`,
                        height: '100%',
                        background: isActive 
                          ? DesignSystem.colors.primary[500]
                          : DesignSystem.colors.accent[500],
                        transition: `width ${DesignSystem.transition.normal}`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
