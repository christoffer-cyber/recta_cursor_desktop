"use client";
import React, { useState, useEffect } from "react";
import { ClusterType } from "../../lib/types";
import { DesignSystem, ComponentTokens, DesignUtils } from "../../lib/design-system";

interface StepTransitionProps {
  fromCluster: ClusterType;
  toCluster: ClusterType;
  isVisible: boolean;
  onComplete: () => void;
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

export default function StepTransition({ fromCluster, toCluster, isVisible, onComplete }: StepTransitionProps) {
  const [animationPhase, setAnimationPhase] = useState<'slide-out' | 'transition' | 'slide-in' | 'complete'>('slide-out');

  useEffect(() => {
    if (!isVisible) return;

    const timeline = setTimeout(() => {
      setAnimationPhase('transition');
    }, 800);

    const slideInTimeout = setTimeout(() => {
      setAnimationPhase('slide-in');
    }, 1600);

    const completeTimeout = setTimeout(() => {
      setAnimationPhase('complete');
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(timeline);
      clearTimeout(slideInTimeout);
      clearTimeout(completeTimeout);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: DesignUtils.colorWithOpacity(DesignSystem.colors.primary[900], 0.95),
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: DesignSystem.spacing[6],
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* From Step */}
        <div style={{
          transform: animationPhase === 'slide-out' || animationPhase === 'transition' 
            ? 'translateY(0)' 
            : 'translateY(-100px)',
          opacity: animationPhase === 'slide-out' || animationPhase === 'transition' ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          marginBottom: DesignSystem.spacing[8],
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: DesignSystem.spacing[4],
            filter: 'grayscale(100%)',
          }}>
            {CLUSTER_ICONS[fromCluster]}
          </div>
          
          <h2 style={{
            fontSize: DesignSystem.typography.fontSize['2xl'],
            fontWeight: DesignSystem.typography.fontWeight.bold,
            color: DesignSystem.colors.neutral[300],
            marginBottom: DesignSystem.spacing[2],
            textDecoration: 'line-through',
          }}>
            {CLUSTER_NAMES[fromCluster]}
          </h2>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: DesignSystem.spacing[2],
            background: DesignSystem.colors.success[500],
            color: DesignSystem.colors.background.primary,
            padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[4]}`,
            borderRadius: DesignSystem.borderRadius.full,
            fontSize: DesignSystem.typography.fontSize.sm,
            fontWeight: DesignSystem.typography.fontWeight.semibold,
          }}>
            ✓ Komplett
          </div>
        </div>

        {/* Transition Arrow */}
        <div style={{
          transform: animationPhase === 'transition' ? 'scale(1.2)' : 'scale(1)',
          opacity: animationPhase === 'transition' ? 1 : 0.6,
          transition: 'all 0.4s ease-in-out',
          margin: `${DesignSystem.spacing[6]} 0`,
        }}>
          <div style={{
            fontSize: '2rem',
            color: DesignSystem.colors.accent[500],
            animation: animationPhase === 'transition' ? 'bounce 0.6s ease-in-out' : 'none',
          }}>
            ⬇️
          </div>
        </div>

        {/* To Step */}
        <div style={{
          transform: animationPhase === 'slide-in' || animationPhase === 'complete' 
            ? 'translateY(0)' 
            : 'translateY(100px)',
          opacity: animationPhase === 'slide-in' || animationPhase === 'complete' ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: DesignSystem.spacing[4],
            filter: 'none',
            animation: animationPhase === 'slide-in' || animationPhase === 'complete' ? 'pulse 2s infinite' : 'none',
          }}>
            {CLUSTER_ICONS[toCluster]}
          </div>
          
          <h2 style={{
            fontSize: DesignSystem.typography.fontSize['2xl'],
            fontWeight: DesignSystem.typography.fontWeight.bold,
            color: DesignSystem.colors.background.primary,
            marginBottom: DesignSystem.spacing[2],
          }}>
            {CLUSTER_NAMES[toCluster]}
          </h2>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: DesignSystem.spacing[2],
            background: DesignSystem.colors.primary[500],
            color: DesignSystem.colors.background.primary,
            padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[4]}`,
            borderRadius: DesignSystem.borderRadius.full,
            fontSize: DesignSystem.typography.fontSize.sm,
            fontWeight: DesignSystem.typography.fontWeight.semibold,
            animation: animationPhase === 'slide-in' || animationPhase === 'complete' ? 'glow 2s infinite' : 'none',
          }}>
            🔄 Påbörjad
          </div>
        </div>

        {/* Progress Indicator */}
        <div style={{
          marginTop: DesignSystem.spacing[8],
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: DesignSystem.spacing[2],
        }}>
          {Object.keys(CLUSTER_NAMES).map((clusterId, index) => {
            const cluster = clusterId as ClusterType;
            const isCompleted = cluster === fromCluster;
            const isCurrent = cluster === toCluster;
            const isUpcoming = Object.keys(CLUSTER_NAMES).indexOf(cluster) > Object.keys(CLUSTER_NAMES).indexOf(toCluster);
            
            return (
              <div
                key={clusterId}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: isCompleted 
                    ? DesignSystem.colors.success[500]
                    : isCurrent 
                      ? DesignSystem.colors.primary[500]
                      : DesignSystem.colors.neutral[400],
                  opacity: isUpcoming ? 0.3 : 1,
                  transition: 'all 0.3s ease',
                  animation: isCurrent && animationPhase === 'complete' ? 'pulse 1s infinite' : 'none',
                }}
                title={CLUSTER_NAMES[cluster]}
              />
            );
          })}
        </div>

        {/* Loading Message */}
        <div style={{
          marginTop: DesignSystem.spacing[6],
          fontSize: DesignSystem.typography.fontSize.sm,
          color: DesignSystem.colors.neutral[300],
          opacity: animationPhase === 'transition' ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}>
          Förbereder nästa steg...
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
          }
        }
      `}</style>
    </div>
  );
}
