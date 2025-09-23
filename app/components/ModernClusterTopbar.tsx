"use client";
import React from "react";
import { ClusterType } from "../../lib/types";
import { CLUSTER_DEFINITIONS } from "../../lib/arena-clusters";
import { DesignSystem, ComponentTokens, DesignUtils } from "../../lib/design-system";

interface ModernClusterTopbarProps {
  clusters: Record<ClusterType, { confidence: number; status: string }>;
  currentCluster: ClusterType;
  overallConfidence: number;
}

const CLUSTER_NAMES: Record<ClusterType, string> = {
  'pain-point': 'Problem & Pain Point',
  'impact-urgency': 'Påverkan & Prioritering',
  'success-check': 'Framgång & Kriterier',
  'resources': 'Resurser & Budget',
  'org-reality': 'Organisation & Kultur',
  'alternatives': 'Alternativ & Risker'
};

const CLUSTER_ICONS: Record<ClusterType, string> = {
  'pain-point': '🎯',
  'impact-urgency': '⚡',
  'success-check': '✅',
  'resources': '💰',
  'org-reality': '🏢',
  'alternatives': '🔄'
};

export default function ModernClusterTopbar({ 
  clusters, 
  currentCluster, 
  overallConfidence 
}: ModernClusterTopbarProps) {
  
  const getClusterStatus = (clusterId: ClusterType): 'not-started' | 'in-progress' | 'complete' | 'needs-revisit' | 'locked' => {
    const cluster = clusters[clusterId];
    if (!cluster) return 'not-started';
    
    if (cluster.status === 'complete') return 'complete';
    if (cluster.status === 'needs-revisit') return 'needs-revisit';
    if (cluster.status === 'in-progress') return 'in-progress';
    
    // Check if cluster is locked (previous cluster not complete)
    const clusterEntries = Object.entries(CLUSTER_DEFINITIONS);
    const currentIndex = clusterEntries.findIndex(([id]) => id === clusterId);
    
    if (currentIndex > 0) {
      const previousCluster = clusterEntries[currentIndex - 1][0] as ClusterType;
      const previousClusterData = clusters[previousCluster];
      if (!previousClusterData || previousClusterData.confidence < 75) {
        return 'locked';
      }
    }
    
    return 'not-started';
  };

  const getStepStyle = (clusterId: ClusterType) => {
    const status = getClusterStatus(clusterId);
    const isActive = clusterId === currentCluster;
    
    return {
      ...ComponentTokens.clusterStep[status],
      padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[3]}`,
      borderRadius: DesignSystem.borderRadius.full,
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      display: 'flex',
      alignItems: 'center',
      gap: DesignSystem.spacing[2],
      transition: `all ${DesignSystem.transition.normal}`,
      cursor: status === 'locked' ? 'not-allowed' : 'pointer',
      opacity: status === 'locked' ? 0.6 : 1,
      border: isActive ? `2px solid ${DesignSystem.colors.primary[500]}` : undefined,
      boxShadow: isActive ? DesignSystem.boxShadow.md : undefined,
    };
  };

  const getIconStyle = (clusterId: ClusterType) => {
    const status = getClusterStatus(clusterId);
    const isActive = clusterId === currentCluster;
    
    const baseStyle = {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: DesignSystem.typography.fontWeight.bold,
      transition: `all ${DesignSystem.transition.normal}`,
    };

    switch (status) {
      case 'not-started':
        return {
          ...baseStyle,
          background: DesignSystem.colors.neutral[300],
          color: DesignSystem.colors.neutral[600],
        };
      case 'in-progress':
        return {
          ...baseStyle,
          background: isActive ? DesignSystem.colors.primary[500] : DesignSystem.colors.primary[200],
          color: isActive ? DesignSystem.colors.background.primary : DesignSystem.colors.primary[700],
        };
      case 'complete':
        return {
          ...baseStyle,
          background: DesignSystem.colors.accent[500],
          color: DesignSystem.colors.background.primary,
        };
      case 'needs-revisit':
        return {
          ...baseStyle,
          background: DesignSystem.colors.warning[500],
          color: DesignSystem.colors.background.primary,
        };
      case 'locked':
        return {
          ...baseStyle,
          background: DesignSystem.colors.neutral[200],
          color: DesignSystem.colors.neutral[400],
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={{
      background: DesignSystem.gradient('135deg', [
        DesignSystem.colors.primary[900],
        DesignSystem.colors.primary[700],
      ]),
      padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[4]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: DesignSystem.spacing[5],
      overflowX: 'auto',
      minHeight: '64px',
    }}>
      {/* Cluster Steps */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: DesignSystem.spacing[3],
        flex: 1,
        minWidth: 0,
      }}>
        {Object.entries(CLUSTER_DEFINITIONS).map(([clusterId, definition]) => {
          const clusterType = clusterId as ClusterType;
          const status = getClusterStatus(clusterType);
          const cluster = clusters[clusterType];
          const isActive = clusterType === currentCluster;
          
          return (
            <div
              key={clusterId}
              style={getStepStyle(clusterType)}
              title={`${CLUSTER_NAMES[clusterType]} - ${cluster?.confidence || 0}%`}
            >
              <div style={getIconStyle(clusterType)}>
                {status === 'complete' ? '✓' : 
                 status === 'in-progress' ? (isActive ? '●' : '○') :
                 status === 'needs-revisit' ? '⚠' :
                 status === 'locked' ? '🔒' : '○'}
              </div>
              
              <span style={{
                whiteSpace: 'nowrap',
                color: status === 'in-progress' && isActive 
                  ? DesignSystem.colors.primary[900]
                  : status === 'locked' 
                    ? DesignUtils.colorWithOpacity(DesignSystem.colors.background.primary, 0.4)
                    : DesignSystem.colors.background.primary,
              }}>
                {CLUSTER_NAMES[clusterType]}
              </span>
              
              {cluster && cluster.confidence > 0 && (
                <span style={{
                  fontSize: DesignSystem.typography.fontSize.xs,
                  opacity: 0.8,
                  marginLeft: DesignSystem.spacing[1],
                  color: status === 'in-progress' && isActive 
                    ? DesignSystem.colors.primary[700]
                    : DesignUtils.colorWithOpacity(DesignSystem.colors.background.primary, 0.7),
                }}>
                  {Math.round(cluster.confidence)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: DesignSystem.spacing[2],
        padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[3]}`,
        background: DesignSystem.colors.background.primary,
        borderRadius: DesignSystem.borderRadius.md,
        border: `1px solid ${DesignSystem.colors.neutral[200]}`,
        minWidth: '120px',
      }}>
        <span style={{
          fontSize: DesignSystem.typography.fontSize.sm,
          fontWeight: DesignSystem.typography.fontWeight.semibold,
          color: DesignSystem.colors.primary[900],
        }}>
          Framsteg
        </span>
        
        <div style={{
          width: '60px',
          height: '6px',
          background: DesignSystem.colors.neutral[200],
          borderRadius: DesignSystem.borderRadius.sm,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${overallConfidence}%`,
            height: '100%',
            background: DesignSystem.gradient('90deg', [
              DesignSystem.colors.primary[500],
              DesignSystem.colors.accent[500],
            ]),
            transition: `width ${DesignSystem.transition.normal}`,
          }} />
        </div>
        
        <span style={{
          fontSize: DesignSystem.typography.fontSize.sm,
          fontWeight: DesignSystem.typography.fontWeight.bold,
          color: DesignSystem.colors.primary[900],
          minWidth: '35px',
          textAlign: 'right',
        }}>
          {Math.round(overallConfidence)}%
        </span>
      </div>
    </div>
  );
}
