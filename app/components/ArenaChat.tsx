"use client";
import React, { useState, useRef, useEffect } from "react";
import { Message } from "../../lib/types";
import { ClusterType, ArenaCluster } from "../../lib/types";
import { ArenaLogicEngine, CLUSTER_DEFINITIONS } from "../../lib/arena-clusters";
import { DesignSystem, ComponentTokens } from "../../lib/design-system";

interface ArenaChatProps {
  sessionId: string;
  onComplete: (messages: Message[]) => void;
}

type FlowStep = 'setup' | 'conversation' | 'extracting' | 'preview' | 'generating' | 'complete';

export default function ArenaChat({ sessionId, onComplete }: ArenaChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>('setup');
  const [companyName, setCompanyName] = useState('');
  
  // Cluster-based state
  const [currentCluster, setCurrentCluster] = useState<ClusterType>('pain-point');
  const [clusters, setClusters] = useState<Record<ClusterType, ArenaCluster>>(() => 
    ArenaLogicEngine.initializeClusters()
  );
  const [overallConfidence, setOverallConfidence] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if we have stored company data from a previous session
    const storedCompanyName = sessionStorage.getItem('setupCompanyName');
    if (storedCompanyName) {
      setCompanyName(storedCompanyName);
      setCurrentStep('conversation');
    }
  }, []);

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
      
      // Update current cluster if AI suggests switching
      if (data.nextCluster && data.nextCluster !== currentCluster) {
        const nextCluster = data.nextCluster as ClusterType;
        const clusterEntries = Object.entries(CLUSTER_DEFINITIONS);
        const currentIndex = clusterEntries.findIndex(([id]) => id === currentCluster);
        const nextIndex = clusterEntries.findIndex(([id]) => id === nextCluster);
        
        const isNextUnlocked = nextIndex === 0 || (nextIndex > 0 && clusters[clusterEntries[nextIndex - 1][0] as ClusterType]?.confidence >= 75);
        
        if (isNextUnlocked) {
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
      }
      
      // Update overall confidence
      const newOverallConfidence = ArenaLogicEngine.calculateOverallConfidence(clusters);
      setOverallConfidence(newOverallConfidence);
      
      // Check if analysis is complete
      if (data.isComplete || ArenaLogicEngine.isAnalysisComplete(clusters)) {
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

  const handleStartConversation = () => {
    if (companyName) {
      sessionStorage.setItem('setupCompanyName', companyName);
    }
    setCurrentStep('conversation');
    
    // Start with first message
    const firstMessage = "Hej! Jag vill förbereda en rekrytering.";
    handleSendMessage(firstMessage);
  };

  const handleCompanyLookup = async () => {
    if (!companyName.trim()) return;
    setIsLoading(true);
    try {
      console.log(`🔍 Looking up company: ${companyName}`);
      // Company lookup logic would go here
    } catch (error) {
      console.error('Company lookup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={ComponentTokens.chatContainer}>
      {currentStep === 'setup' && (
        <div className="arena-setup">
          <div className="setup-content">
            <h2 className="setup-title">Företagsregistrering</h2>
            <p className="setup-description">
              Ange ditt företagsnamn så hämtar vi automatiskt relevant branschdata och företagsinformation för en mer personlig analys.
            </p>
            
            <div className="setup-form">
              <div className="form-group">
                <label htmlFor="companyName" className="form-label">
                  Företagsnamn
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="t.ex. GLAS Scandinavia AB"
                  style={ComponentTokens.input}
                  onKeyPress={(e) => e.key === 'Enter' && handleCompanyLookup()}
                  disabled={isLoading}
                />
                <p className="form-help">
                  Ange det fullständiga företagsnamnet inklusive AB, Ltd, Inc, etc.
                </p>
              </div>

              <div className="form-actions">
                <button
                  onClick={handleCompanyLookup}
                  disabled={!companyName.trim() || isLoading}
                  style={{
                    ...ComponentTokens.button.primary,
                    opacity: (!companyName.trim() || isLoading) ? 0.6 : 1,
                    cursor: (!companyName.trim() || isLoading) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isLoading ? 'Hämtar företagsdata...' : 'Hämta företagsdata'}
                </button>
                
                <button
                  onClick={handleStartConversation}
                  style={{
                    ...ComponentTokens.button.secondary,
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isLoading}
                >
                  Hoppa över
                </button>
              </div>
            </div>
          </div>
        </div>
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
