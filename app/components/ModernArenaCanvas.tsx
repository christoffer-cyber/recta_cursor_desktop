"use client";
import React from "react";
import { ClusterType, ArenaCluster, Message } from "../../lib/types";
import { CLUSTER_DEFINITIONS } from "../../lib/arena-clusters";
import { DesignSystem, DesignUtils } from "../../lib/design-system";

interface ModernArenaCanvasProps {
  currentStep: string;
  currentCluster: ClusterType;
  clusters: Record<ClusterType, ArenaCluster>;
  overallConfidence: number;
  messages: Message[];
}

const CLUSTER_NAMES: Record<ClusterType, string> = {
  'pain-point': 'Problem & Pain Point',
  'impact-urgency': 'Påverkan & Prioritering',
  'success-check': 'Framgång & Kriterier',
  'resources': 'Resurser & Budget',
  'org-reality': 'Organisation & Kultur',
  'alternatives': 'Alternativ & Risker'
};

const CLUSTER_DESCRIPTIONS: Record<ClusterType, string> = {
  'pain-point': 'Identifiera det verkliga problemet bakom rekryteringsbehovet',
  'impact-urgency': 'Bedöm affärskritikalitet och tidspress',
  'success-check': 'Definiera mätbara framgångskriterier',
  'resources': 'Kartlägg budget och resursbegränsningar',
  'org-reality': 'Utvärdera kulturell beredskap',
  'alternatives': 'Utmana rekrytering som bästa lösning'
};

export default function ModernArenaCanvas({ 
  currentStep, 
  currentCluster, 
  clusters, 
  overallConfidence, 
  messages 
}: ModernArenaCanvasProps) {
  
  const getClusterProgress = () => {
    return Object.entries(clusters).map(([clusterId, cluster]) => ({
      id: clusterId as ClusterType,
      name: CLUSTER_NAMES[clusterId as ClusterType],
      confidence: cluster?.confidence || 0,
      status: cluster?.status || 'not-started',
      isCurrent: clusterId === currentCluster,
    }));
  };

  const getCurrentClusterData = () => {
    return clusters[currentCluster] || { confidence: 0, status: 'not-started' };
  };

  const getInsightsFromMessages = () => {
    // Extract insights from recent messages
    const recentMessages = messages.slice(-5);
    const insights = recentMessages
      .filter(msg => msg.role === 'assistant')
      .map(msg => ({
        content: msg.content,
        timestamp: msg.timestamp,
        clusterId: msg.clusterId,
      }));
    
    return insights;
  };

  const renderSetupCanvas = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: DesignSystem.spacing[8],
      textAlign: 'center',
    }}>
      <div style={{
        background: DesignSystem.gradient('135deg', [
          DesignSystem.colors.primary[50],
          DesignSystem.colors.background.primary,
        ]),
        border: `1px solid ${DesignSystem.colors.primary[200]}`,
        borderRadius: DesignSystem.borderRadius['2xl'],
        padding: DesignSystem.spacing[8],
        maxWidth: '500px',
        boxShadow: DesignSystem.boxShadow.lg,
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: DesignSystem.spacing[4],
        }}>
          🎯
        </div>
        
        <h3 style={{
          fontSize: DesignSystem.typography.fontSize['2xl'],
          fontWeight: DesignSystem.typography.fontWeight.bold,
          color: DesignSystem.colors.primary[900],
          marginBottom: DesignSystem.spacing[3],
        }}>
          Välkommen till Arena
        </h3>
        
        <p style={{
          fontSize: DesignSystem.typography.fontSize.lg,
          color: DesignSystem.colors.neutral[600],
          lineHeight: DesignSystem.typography.lineHeight.relaxed,
          marginBottom: DesignSystem.spacing[6],
        }}>
          Strategisk rekryteringsförberedelse som hjälper dig identifiera dolda behov, risker och möjligheter innan du påbörjar rekryteringsprocessen.
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: DesignSystem.spacing[4],
          marginTop: DesignSystem.spacing[6],
        }}>
          <div style={{
            background: DesignSystem.colors.background.primary,
            border: `1px solid ${DesignSystem.colors.neutral[200]}`,
            borderRadius: DesignSystem.borderRadius.lg,
            padding: DesignSystem.spacing[4],
          }}>
            <div style={{
              fontSize: DesignSystem.typography.fontSize['2xl'],
              marginBottom: DesignSystem.spacing[2],
            }}>
              🧠
            </div>
            <h4 style={{
              fontSize: DesignSystem.typography.fontSize.base,
              fontWeight: DesignSystem.typography.fontWeight.semibold,
              color: DesignSystem.colors.primary[900],
              marginBottom: DesignSystem.spacing[1],
            }}>
              Intelligent Analys
            </h4>
            <p style={{
              fontSize: DesignSystem.typography.fontSize.sm,
              color: DesignSystem.colors.neutral[600],
            }}>
              6 strukturerade kluster för djupgående förståelse
            </p>
          </div>
          
          <div style={{
            background: DesignSystem.colors.background.primary,
            border: `1px solid ${DesignSystem.colors.neutral[200]}`,
            borderRadius: DesignSystem.borderRadius.lg,
            padding: DesignSystem.spacing[4],
          }}>
            <div style={{
              fontSize: DesignSystem.typography.fontSize['2xl'],
              marginBottom: DesignSystem.spacing[2],
            }}>
              📊
            </div>
            <h4 style={{
              fontSize: DesignSystem.typography.fontSize.base,
              fontWeight: DesignSystem.typography.fontWeight.semibold,
              color: DesignSystem.colors.primary[900],
              marginBottom: DesignSystem.spacing[1],
            }}>
              Data-driven
            </h4>
            <p style={{
              fontSize: DesignSystem.typography.fontSize.sm,
              color: DesignSystem.colors.neutral[600],
            }}>
              Kvalitetsbaserad progression, inte bara kvantitet
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConversationCanvas = () => {
    const clusterProgress = getClusterProgress();
    const currentClusterData = getCurrentClusterData();
    const insights = getInsightsFromMessages();
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: DesignSystem.spacing[6],
      }}>
        {/* Header */}
        <div style={{
          marginBottom: DesignSystem.spacing[6],
        }}>
          <h2 style={{
            fontSize: DesignSystem.typography.fontSize['2xl'],
            fontWeight: DesignSystem.typography.fontWeight.bold,
            color: DesignSystem.colors.primary[900],
            marginBottom: DesignSystem.spacing[2],
            display: 'flex',
            alignItems: 'center',
            gap: DesignSystem.spacing[2],
          }}>
            🎯 Analyskanvas
            <span style={{
              fontSize: DesignSystem.typography.fontSize.sm,
              fontWeight: DesignSystem.typography.fontWeight.normal,
              color: DesignSystem.colors.neutral[600],
              background: DesignSystem.colors.neutral[100],
              padding: `${DesignSystem.spacing[1]} ${DesignSystem.spacing[2]}`,
              borderRadius: DesignSystem.borderRadius.md,
            }}>
              Rekryteringsanalys
            </span>
          </h2>
          <p style={{
            fontSize: DesignSystem.typography.fontSize.base,
            color: DesignSystem.colors.neutral[600],
          }}>
            Live analys av din rekryteringsförberedelse
          </p>
        </div>

        {/* Current Cluster Focus */}
        <div style={{
          background: DesignSystem.gradient('135deg', [
            DesignSystem.colors.primary[50],
            DesignSystem.colors.background.primary,
          ]),
          border: `1px solid ${DesignSystem.colors.primary[200]}`,
          borderRadius: DesignSystem.borderRadius.xl,
          padding: DesignSystem.spacing[5],
          marginBottom: DesignSystem.spacing[6],
          borderLeft: `4px solid ${DesignSystem.colors.primary[500]}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: DesignSystem.spacing[3],
          }}>
            <div>
              <h3 style={{
                fontSize: DesignSystem.typography.fontSize.xl,
                fontWeight: DesignSystem.typography.fontWeight.bold,
                color: DesignSystem.colors.primary[900],
                marginBottom: DesignSystem.spacing[1],
              }}>
                {CLUSTER_NAMES[currentCluster]}
              </h3>
              <p style={{
                fontSize: DesignSystem.typography.fontSize.sm,
                color: DesignSystem.colors.neutral[600],
                lineHeight: DesignSystem.typography.lineHeight.normal,
              }}>
                {CLUSTER_DESCRIPTIONS[currentCluster]}
              </p>
            </div>
            
            <div style={{
              background: DesignSystem.colors.primary[500],
              color: DesignSystem.colors.background.primary,
              padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[3]}`,
              borderRadius: DesignSystem.borderRadius.full,
              fontSize: DesignSystem.typography.fontSize.sm,
              fontWeight: DesignSystem.typography.fontWeight.bold,
              minWidth: '60px',
              textAlign: 'center',
            }}>
              {Math.round(currentClusterData.confidence)}%
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '8px',
            background: DesignSystem.colors.neutral[200],
            borderRadius: DesignSystem.borderRadius.sm,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${currentClusterData.confidence}%`,
              height: '100%',
              background: DesignSystem.gradient('90deg', [
                DesignSystem.colors.primary[500],
                DesignSystem.colors.accent[500],
              ]),
              transition: `width ${DesignSystem.transition.normal}`,
            }} />
          </div>
        </div>

        {/* Cluster Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: DesignSystem.spacing[3],
          marginBottom: DesignSystem.spacing[6],
        }}>
          {clusterProgress.map((cluster) => (
            <div
              key={cluster.id}
              style={{
                background: cluster.isCurrent 
                  ? DesignSystem.gradient('135deg', [
                      DesignSystem.colors.primary[50],
                      DesignSystem.colors.background.primary,
                    ])
                  : DesignSystem.colors.background.primary,
                border: `1px solid ${
                  cluster.isCurrent 
                    ? DesignSystem.colors.primary[300]
                    : DesignSystem.colors.neutral[200]
                }`,
                borderRadius: DesignSystem.borderRadius.lg,
                padding: DesignSystem.spacing[4],
                transition: `all ${DesignSystem.transition.normal}`,
                boxShadow: cluster.isCurrent ? DesignSystem.boxShadow.md : DesignSystem.boxShadow.sm,
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: DesignSystem.spacing[2],
              }}>
                <h4 style={{
                  fontSize: DesignSystem.typography.fontSize.sm,
                  fontWeight: DesignSystem.typography.fontWeight.semibold,
                  color: DesignSystem.colors.primary[900],
                  margin: 0,
                }}>
                  {cluster.name}
                </h4>
                
                <span style={{
                  fontSize: DesignSystem.typography.fontSize.sm,
                  fontWeight: DesignSystem.typography.fontWeight.bold,
                  color: cluster.confidence >= 75 
                    ? DesignSystem.colors.accent[600]
                    : DesignSystem.colors.neutral[500],
                }}>
                  {Math.round(cluster.confidence)}%
                </span>
              </div>
              
              <div style={{
                width: '100%',
                height: '4px',
                background: DesignSystem.colors.neutral[200],
                borderRadius: DesignSystem.borderRadius.sm,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${cluster.confidence}%`,
                  height: '100%',
                  background: cluster.confidence >= 75 
                    ? DesignSystem.colors.accent[500]
                    : DesignSystem.colors.primary[500],
                  transition: `width ${DesignSystem.transition.normal}`,
                }} />
              </div>
              
              <div style={{
                fontSize: DesignSystem.typography.fontSize.xs,
                color: DesignSystem.colors.neutral[500],
                marginTop: DesignSystem.spacing[1],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {cluster.status === 'complete' ? 'Slutförd' :
                 cluster.status === 'in-progress' ? 'Pågår' :
                 cluster.status === 'needs-revisit' ? 'Behöver återbesök' :
                 'Väntar'}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Insights */}
        {insights.length > 0 && (
          <div style={{
            background: DesignSystem.colors.background.primary,
            border: `1px solid ${DesignSystem.colors.neutral[200]}`,
            borderRadius: DesignSystem.borderRadius.lg,
            padding: DesignSystem.spacing[5],
          }}>
            <h4 style={{
              fontSize: DesignSystem.typography.fontSize.lg,
              fontWeight: DesignSystem.typography.fontWeight.semibold,
              color: DesignSystem.colors.primary[900],
              marginBottom: DesignSystem.spacing[4],
              display: 'flex',
              alignItems: 'center',
              gap: DesignSystem.spacing[2],
            }}>
              💡 Senaste insikter
            </h4>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: DesignSystem.spacing[3],
            }}>
              {insights.slice(-3).map((insight, index) => (
                <div
                  key={index}
                  style={{
                    padding: DesignSystem.spacing[3],
                    background: DesignSystem.colors.neutral[50],
                    borderLeft: `3px solid ${DesignSystem.colors.primary[500]}`,
                    borderRadius: DesignSystem.borderRadius.md,
                  }}
                >
                  <p style={{
                    fontSize: DesignSystem.typography.fontSize.sm,
                    color: DesignSystem.colors.neutral[800],
                    margin: 0,
                    lineHeight: DesignSystem.typography.lineHeight.normal,
                  }}>
                    {insight.content.length > 120 
                      ? `${insight.content.substring(0, 120)}...`
                      : insight.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: DesignSystem.colors.background.secondary,
      borderLeft: `1px solid ${DesignSystem.colors.neutral[200]}`,
    }}>
      {currentStep === 'setup' && renderSetupCanvas()}
      {currentStep === 'conversation' && renderConversationCanvas()}
    </div>
  );
}
