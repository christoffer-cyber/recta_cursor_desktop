"use client";
import React, { useState, useEffect } from "react";
import { Message } from "../../lib/types";
import { ClusterType, ArenaCluster } from "../../lib/types";
import { ArenaLogicEngine } from "../../lib/arena-clusters";
import { DesignSystem, ComponentTokens } from "../../lib/design-system";
import ArenaChat from "./ArenaChat";
import ModernClusterTopbar from "./ModernClusterTopbar";
import ModernArenaCanvas from "./ModernArenaCanvas";

type FlowStep = 'conversation' | 'extracting' | 'preview' | 'generating' | 'complete';

export default function ModernArena() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>('conversation');
  const [sessionId] = useState(() => `arena_session_${Date.now()}`);
  
  // Cluster-based state
  const [currentCluster, setCurrentCluster] = useState<ClusterType>('pain-point');
  const [clusters, setClusters] = useState<Record<ClusterType, ArenaCluster>>(() => 
    ArenaLogicEngine.initializeClusters()
  );
  const [overallConfidence, setOverallConfidence] = useState(0);


  const handleChatComplete = (completedMessages: Message[]) => {
    setMessages(completedMessages);
    setIsComplete(true);
    setCurrentStep('extracting');
    
    // Simulate data extraction
    setTimeout(() => {
      setCurrentStep('preview');
    }, 2000);
  };

  const handleGenerateReport = async () => {
    setCurrentStep('generating');
    
    try {
      // Store session data in localStorage for report page
      localStorage.setItem(`arena_session_${sessionId}`, JSON.stringify({
        messages,
        clusters,
        overallConfidence,
        timestamp: new Date().toISOString(),
      }));

      // Simulate report generation
      setTimeout(() => {
        setCurrentStep('complete');
        // Navigate to generated report
        setTimeout(() => {
          window.location.href = `/report/${sessionId}`;
        }, 1000);
      }, 3000);
      
    } catch (error) {
      console.error('Report generation failed:', error);
      alert(`Rapportgenerering misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      setCurrentStep('preview');
    }
  };

  const renderProcessingView = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: DesignSystem.colors.background.primary,
    }}>
      <div style={{
        textAlign: 'center',
        padding: DesignSystem.spacing[8],
        maxWidth: '400px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: `3px solid ${DesignSystem.colors.neutral[200]}`,
          borderTop: `3px solid ${DesignSystem.colors.primary[500]}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 24px auto',
        }} />
        
        <h2 style={{
          fontSize: DesignSystem.typography.fontSize['2xl'],
          fontWeight: DesignSystem.typography.fontWeight.semibold,
          color: DesignSystem.colors.primary[900],
          marginBottom: DesignSystem.spacing[2],
        }}>
          {currentStep === 'extracting' ? 'Extraherar data' :
           currentStep === 'generating' ? 'Genererar rapport' :
           'Bearbetar...'}
        </h2>
        
        <p style={{
          fontSize: DesignSystem.typography.fontSize.base,
          color: DesignSystem.colors.neutral[600],
          lineHeight: DesignSystem.typography.lineHeight.relaxed,
        }}>
          {currentStep === 'extracting' ? 'Analyserar konversationen för nyckelinformation' :
           currentStep === 'generating' ? 'Skapar strategisk rekryteringsanalys' :
           'Bearbetar din data...'}
        </p>
      </div>
    </div>
  );

  const renderCompleteView = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: DesignSystem.colors.background.primary,
    }}>
      <div style={{
        textAlign: 'center',
        padding: DesignSystem.spacing[8],
        maxWidth: '400px',
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: DesignSystem.spacing[4],
        }}>
          ✅
        </div>
        
        <h2 style={{
          fontSize: DesignSystem.typography.fontSize['2xl'],
          fontWeight: DesignSystem.typography.fontWeight.bold,
          color: DesignSystem.colors.primary[900],
          marginBottom: DesignSystem.spacing[2],
        }}>
          Rapport genererad
        </h2>
        
        <p style={{
          fontSize: DesignSystem.typography.fontSize.base,
          color: DesignSystem.colors.neutral[600],
          lineHeight: DesignSystem.typography.lineHeight.relaxed,
        }}>
          Omdirigerar till din strategiska rekryteringsanalys...
        </p>
      </div>
    </div>
  );

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

      {/* Cluster Progress Topbar - Always visible to show 6-step overview */}
      <ModernClusterTopbar
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
          <ArenaChat
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
        }}>
          {(currentStep === 'extracting' || currentStep === 'generating') && renderProcessingView()}
          {currentStep === 'complete' && renderCompleteView()}
          {currentStep === 'conversation' && (
            <ModernArenaCanvas
              currentStep={currentStep}
              currentCluster={currentCluster}
              clusters={clusters}
              overallConfidence={overallConfidence}
              messages={messages}
            />
          )}
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
