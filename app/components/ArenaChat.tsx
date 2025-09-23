"use client";
import React, { useState, useRef, useEffect } from "react";
import { Message } from "../../lib/types";
import { ClusterType } from "../../lib/types";
import { CLUSTER_DEFINITIONS } from "../../lib/arena-clusters";
import { DesignSystem, ComponentTokens } from "../../lib/design-system";
import StepIntroduction from "./StepIntroduction";
import StepCompletion from "./StepCompletion";
import StepTransition from "./StepTransition";

interface ArenaChatProps {
  sessionId: string;
  onComplete: (messages: Message[]) => void;
}

type FlowStep = 'conversation' | 'extracting' | 'preview' | 'generating' | 'complete';
type StepModalState = 'introduction' | 'completion' | 'transition' | null;

export default function ArenaChat({ sessionId, onComplete }: ArenaChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>('conversation');
  
  // Cluster-based state
  const [currentCluster, setCurrentCluster] = useState<ClusterType>('pain-point');
  const [clusters, setClusters] = useState<Record<ClusterType, { confidence: number; status: string }>>(() => {
    const initialClusters: Record<ClusterType, { confidence: number; status: string }> = {} as Record<ClusterType, { confidence: number; status: string }>;
    Object.keys(CLUSTER_DEFINITIONS).forEach((clusterId) => {
      initialClusters[clusterId as ClusterType] = {
        confidence: 0,
        status: clusterId === 'pain-point' ? 'in-progress' : 'not-started'
      };
    });
    return initialClusters;
  });
  const [overallConfidence, setOverallConfidence] = useState(0);
  
  // Step modal state
  const [stepModalState, setStepModalState] = useState<StepModalState>(null);
  const [previousCluster, setPreviousCluster] = useState<ClusterType | null>(null);
  const [clusterAnalysis, setClusterAnalysis] = useState<{
    foundPoints: string[];
    missingPoints: string[];
    confidence: number;
  } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start conversation immediately
  useEffect(() => {
    if (messages.length === 0) {
      const firstMessage = "Hej! Jag vill förbereda en rekrytering.";
      handleSendMessage(firstMessage);
    }
  }, []);

  // Handle step modal actions
  const handleStepIntroductionContinue = () => {
    setStepModalState(null);
  };

  const handleStepCompletionContinue = () => {
    setStepModalState(null);
  };

  const handleStepCompletionRevisit = () => {
    setStepModalState(null);
  };

  const handleStepTransitionComplete = () => {
    setStepModalState(null);
    setPreviousCluster(null);
  };

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('/api/arena/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          sessionId,
          currentCluster,
          clusters,
          overallConfidence
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        clusterId: data.clusterId,
        confidenceImpact: data.confidenceImpact
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update cluster state
      if (data.clusterUpdate) {
        const clusterId = data.clusterUpdate.clusterId as ClusterType;
        setClusters(prev => ({
          ...prev,
          [clusterId]: {
            ...prev[clusterId],
            ...data.clusterUpdate.updates
          }
        }));
      }

      // Store cluster analysis for completion modal
      if (data.analysis) {
        setClusterAnalysis({
          foundPoints: data.analysis.foundPoints?.map((p: { key: string }) => p.key) || [],
          missingPoints: data.analysis.missingPoints || [],
          confidence: data.analysis.totalScore || 0
        });
      }
      
      // Check if current cluster is complete and show completion modal
      if (clusterAnalysis && clusterAnalysis.confidence >= 75 && !stepModalState) {
        setStepModalState('completion');
      }
      
      // Update overall confidence
      const totalConfidence = Object.values(clusters).reduce((sum, cluster) => sum + cluster.confidence, 0);
      const newOverallConfidence = totalConfidence / Object.keys(clusters).length;
      setOverallConfidence(newOverallConfidence);
      
      // Check if analysis is complete
      const allClustersComplete = Object.values(clusters).every(cluster => cluster.confidence >= 75);
      if (data.isComplete || allClustersComplete) {
        setIsComplete(true);
        onComplete([...messages, userMessage, aiMessage]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      let errorContent = 'Något gick fel. Försök igen.';
      
      if (error instanceof Error && error.name === 'AbortError') {
        errorContent = 'Begäran tog för lång tid. Försök igen med en kortare fråga.';
      } else if (error instanceof Error) {
        errorContent = `Fel: ${error.message}`;
      }
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <div style={ComponentTokens.chatContainer}>
      {/* Step Modals */}
      {stepModalState === 'introduction' && (
        <StepIntroduction
          clusterType={currentCluster}
          isVisible={true}
          onContinue={handleStepIntroductionContinue}
        />
      )}
      
      {stepModalState === 'completion' && clusterAnalysis && (
        <StepCompletion
          clusterType={currentCluster}
          isVisible={true}
          confidence={clusterAnalysis.confidence}
          foundPoints={clusterAnalysis.foundPoints}
          missingPoints={clusterAnalysis.missingPoints}
          onContinue={() => {
            // Show transition then move to next cluster
            setStepModalState('transition');
            // Move to next cluster
            const clusterEntries = Object.entries(CLUSTER_DEFINITIONS);
            const currentIndex = clusterEntries.findIndex(([id]) => id === currentCluster);
            if (currentIndex < clusterEntries.length - 1) {
              const nextCluster = clusterEntries[currentIndex + 1][0] as ClusterType;
              setCurrentCluster(nextCluster);
              setClusters(prev => ({
                ...prev,
                [nextCluster]: {
                  ...prev[nextCluster],
                  status: 'in-progress'
                },
                [currentCluster]: {
                  ...prev[currentCluster],
                  status: prev[currentCluster].confidence >= 75 ? 'complete' : 'needs-revisit'
                }
              }));
            }
          }}
          onRevisit={handleStepCompletionRevisit}
        />
      )}
      
      {stepModalState === 'transition' && previousCluster && (
        <StepTransition
          fromCluster={previousCluster}
          toCluster={currentCluster}
          isVisible={true}
          onComplete={handleStepTransitionComplete}
        />
      )}

      {currentStep === 'conversation' && (
        <>
          <div className="messages-area">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === 'assistant' ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  <div 
                    className="message-text"
                    style={
                      message.role === 'user' 
                        ? ComponentTokens.message.user 
                        : ComponentTokens.message.assistant
                    }
                  >
                    {message.content}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString('sv-SE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="loading-indicator">
                    <div className="loading-spinner"></div>
                    <span className="loading-text">
                      Analyserar ditt svar<span className="loading-dots"></span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {!isComplete ? (
            <div className="input-area">
              <div className="input-container">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Skriv ditt svar här..."
                  style={{
                    ...ComponentTokens.input,
                    resize: 'none',
                    minHeight: '44px',
                    maxHeight: '120px',
                  }}
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  style={{
                    ...ComponentTokens.button.primary,
                    opacity: (!input.trim() || isLoading) ? 0.6 : 1,
                    cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
                    padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[5]}`,
                  }}
                >
                  Skicka
                </button>
              </div>
            </div>
          ) : (
            <div className="completion-area">
              <div className="completion-message">
                Analysen är komplett. Redo för dataextraktion.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
