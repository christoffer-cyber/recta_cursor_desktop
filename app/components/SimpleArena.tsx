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
    <div className="arena-container" style={{ fontFamily: DesignSystem.typography.fontFamily.sans }}>
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
      <div className="arena-main-grid" style={{ overflow: 'hidden' }}>
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
          {/* Reserved canvas space for future insights; remove redundant cluster list */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: 420 }}>
              <div style={{ fontSize: '3rem', marginBottom: DesignSystem.spacing[4] }}>📊</div>
              <h2 style={{
                fontSize: DesignSystem.typography.fontSize['2xl'],
                fontWeight: DesignSystem.typography.fontWeight.bold,
                color: DesignSystem.colors.primary[900],
                marginBottom: DesignSystem.spacing[3],
              }}>
                Canvas reserverad för kommande insikter
              </h2>
              <p style={{ color: DesignSystem.colors.neutral[600] }}>
                Här visar vi snart värdefulla sammanställningar. Klusterprogress visas i topbaren.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
