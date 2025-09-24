"use client";
import React from "react";
import { ClusterType } from "../../lib/types";
import { DesignSystem, ComponentTokens } from "../../lib/design-system";

interface SimpleClusterTopbarProps {
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

export default function SimpleClusterTopbar({ 
  clusters, 
  currentCluster, 
  overallConfidence 
}: SimpleClusterTopbarProps) {
  
  const getClusterStatus = (clusterId: ClusterType): 'not-started' | 'in-progress' | 'complete' | 'locked' => {
    const cluster = clusters[clusterId];
    if (!cluster) return 'not-started';
    
    if (cluster.status === 'complete') return 'complete';
    if (cluster.status === 'in-progress') return 'in-progress';
    
    // Check if cluster is locked (previous cluster not complete)
    const clusterEntries = Object.keys(CLUSTER_NAMES) as ClusterType[];
    const currentIndex = clusterEntries.indexOf(clusterId);
    
    if (currentIndex > 0) {
      const previousCluster = clusterEntries[currentIndex - 1];
      const previousClusterData = clusters[previousCluster];
      if (!previousClusterData || previousClusterData.confidence < 75) {
        return 'locked';
      }
    }
    
    return 'not-started';
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
        {Object.entries(CLUSTER_NAMES).map(([clusterId, name]) => {
          const clusterType = clusterId as ClusterType;
          const status = getClusterStatus(clusterType);
          const cluster = clusters[clusterType];
          const isActive = clusterType === currentCluster;
          
          const stepStyle = {
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
            background: status === 'complete' 
              ? DesignSystem.colors.accent[500]
              : status === 'in-progress'
                ? DesignSystem.colors.background.primary
                : DesignSystem.colors.neutral[200],
            color: status === 'complete' || status === 'in-progress'
              ? status === 'complete' 
                ? DesignSystem.colors.background.primary
                : DesignSystem.colors.primary[900]
              : DesignSystem.colors.neutral[600],
          };

          return (
            <div
              key={clusterId}
              style={stepStyle}
              title={`${name} - ${cluster?.confidence || 0}%`}
            >
              <span style={{ fontSize: '16px' }}>
                {CLUSTER_ICONS[clusterType]}
              </span>
              
              <span style={{
                whiteSpace: 'nowrap',
              }}>
                {name}
              </span>
              
              {/* mini progress bar per step */}
              {cluster && (
                <div style={{
                  width: 48,
                  height: 4,
                  background: DesignSystem.colors.neutral[200],
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginLeft: DesignSystem.spacing[2]
                }}>
                  <div style={{
                    width: `${Math.max(0, Math.min(100, cluster.confidence))}%`,
                    height: '100%',
                    background: DesignSystem.colors.accent[500]
                  }} />
                </div>
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
