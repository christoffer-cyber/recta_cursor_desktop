"use client";
import React, { useState, useRef, useEffect } from "react";
import ProgressIndicator from "../components/ProgressIndicator";
// ClusterProgressIndicator removed
import ClusterTopbar from "../components/ClusterTopbar";
import DataPreview from "../components/DataPreview";
// LiveInsightsPanel removed
// ChapterProgress removed
import { CompanyIntelligenceAgent, CompanyData } from "../../lib/company-intelligence";
import { ArenaLogicEngine, CLUSTER_DEFINITIONS } from "../../lib/arena-clusters";
import { ClusterType, ArenaCluster, Message } from "../../lib/types";

type FlowStep = 'setup' | 'conversation' | 'extracting' | 'preview' | 'generating' | 'complete';

export default function Arena() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [isComplete, setIsComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>('setup');
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyIntelligence, setCompanyIntelligence] = useState<CompanyData | null>(null);
  
  // New cluster-based state
  const [currentCluster, setCurrentCluster] = useState<ClusterType>('pain-point');
  const [clusters, setClusters] = useState<Record<ClusterType, ArenaCluster>>(() => 
    ArenaLogicEngine.initializeClusters()
  );
  const [overallConfidence, setOverallConfidence] = useState(0);
  
  // Live insights state removed

  // Chapter tracking state removed
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // detectInsights function removed

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if we have stored company data from a previous session
    const storedCompanyName = sessionStorage.getItem('setupCompanyName');
    const storedCompanyData = sessionStorage.getItem('companyIntelligence');
    
    if (storedCompanyName) {
      setCompanyName(storedCompanyName);
    }
    
    if (storedCompanyData) {
      try {
        setCompanyIntelligence(JSON.parse(storedCompanyData));
        setCurrentStep('conversation');
        
        // Auto-start conversation if we have company data
        setTimeout(() => {
          handleSendMessage("Hej! Jag vill förbereda en rekrytering.");
        }, 500);
      } catch (error) {
        console.error('Error parsing stored company data:', error);
      }
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
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('/api/arena/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          sessionId,
          extractedData,
          // Send cluster context for adaptive prompting
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
        ragEnhanced: data.ragEnhanced,
        sources: data.sources,
        clusterId: data.clusterId,
        confidenceImpact: data.confidenceImpact
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update cluster state based on AI response
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
        setCurrentCluster(nextCluster);
        
        // Update cluster status
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
      
      // Update overall confidence
      const newOverallConfidence = ArenaLogicEngine.calculateOverallConfidence(clusters);
      setOverallConfidence(newOverallConfidence);
      
      // Check if analysis is complete
      if (data.isComplete || ArenaLogicEngine.isAnalysisComplete(clusters)) {
        setIsComplete(true);
      }

      // Log cluster progress
      console.log(`Current cluster: ${currentCluster}, Confidence: ${clusters[currentCluster]?.confidence}%`);
      if (data.ragEnhanced) {
        console.log('RAG-enhanced response with sources:', data.sources);
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

  const handleCompanyLookup = async () => {
    if (!companyName.trim()) return;
    
    setIsLoading(true);
    try {
      console.log(`🔍 Looking up company: ${companyName}`);
      
      const agent = new CompanyIntelligenceAgent();
      const data = await agent.gatherCompanyIntelligence(companyName);
      
      if (data) {
        setCompanyIntelligence(data);
        console.log('✅ Company data retrieved:', data);
      } else {
        console.log('❌ No company data found');
      }
    } catch (error) {
      console.error('Company lookup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConversation = () => {
    // Save company data for this session
    if (companyName) {
      sessionStorage.setItem('setupCompanyName', companyName);
    }
    if (companyIntelligence) {
      sessionStorage.setItem('companyIntelligence', JSON.stringify(companyIntelligence));
    }
    
    setCurrentStep('conversation');
    
    // Initialize RAG and start conversation
    const initializeRAG = async () => {
      try {
        console.log('🚀 Initializing RAG system from Arena...');
        const response = await fetch('/api/rag/initialize', { method: 'POST' });
        const data = await response.json();
        console.log('✅ RAG initialization result:', data);
      } catch (error) {
        console.log('❌ RAG initialization failed:', error);
      }
    };
    
    initializeRAG();
    
    // Enhanced first message with company context
    const firstMessage = companyIntelligence?.basicInfo?.legalName
      ? `Hej! Jag representerar ${companyIntelligence.basicInfo.legalName} och vill förbereda en rekrytering.`
      : "Hej! Jag vill förbereda en rekrytering.";
      
    handleSendMessage(firstMessage);
  };

  const handleExtractData = async () => {
    setCurrentStep('extracting');
    setIsLoading(true);
    
    try {
      const extractResponse = await fetch('/api/arena/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      
      const extractData = await extractResponse.json();
      
      if (extractData.error) {
        throw new Error(extractData.error);
      }

      setExtractedData(extractData.data);
      setCurrentStep('preview');
      
    } catch (error) {
      console.error('Data extraction failed:', error);
      alert(`Dataextraktion misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      setCurrentStep('conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setCurrentStep('generating');
    setIsLoading(true);
    
    try {
      const generateResponse = await fetch('/api/arena/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedData,
          sessionId,
          companyIntelligence // Send company intelligence to report generation
        })
      });
      
      const reportData = await generateResponse.json();
      
      if (reportData.error) {
        throw new Error(reportData.error);
      }

      // Store session data in localStorage for report page
      localStorage.setItem(`arena_session_${sessionId}`, JSON.stringify({
        messages,
        extractedData,
        reportData: reportData.reportData
      }));

      setCurrentStep('complete');
      // Navigate to generated report
      setTimeout(() => {
        window.location.href = `/report/${sessionId}`;
      }, 1000);
      
    } catch (error) {
      console.error('Report generation failed:', error);
      alert(`Rapportgenerering misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      setCurrentStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const progressSteps = [
    { id: 'setup', label: 'Företagsregistrering', description: 'Hämta företagsdata', status: currentStep === 'setup' ? 'active' : 'completed' },
    { id: 'conversation', label: 'Konversation', description: 'Diskutera rekryteringsbehov', status: currentStep === 'conversation' ? 'active' : currentStep === 'setup' ? 'pending' : 'completed' },
    { id: 'extracting', label: 'Dataextraktion', description: 'Analyserar konversationen', status: currentStep === 'extracting' ? 'active' : ['setup', 'conversation'].includes(currentStep) ? 'pending' : 'completed' },
    { id: 'preview', label: 'Granska data', description: 'Validera extraherad information', status: currentStep === 'preview' ? 'active' : ['setup', 'conversation', 'extracting'].includes(currentStep) ? 'pending' : 'completed' },
    { id: 'generating', label: 'Genererar rapport', description: 'Skapar strategisk analys', status: currentStep === 'generating' ? 'active' : ['setup', 'conversation', 'extracting', 'preview'].includes(currentStep) ? 'pending' : 'completed' },
  ] as const;

  return (
    <div className="arena-container">
      <div className="arena-header">
        <h1 className="arena-title">Arena</h1>
        <p className="arena-subtitle">Strategisk rekryteringsförberedelse</p>
      </div>

      {/* Cluster Steps Topbar (only during conversation) */}
      {currentStep === 'conversation' && (
        <ClusterTopbar
          clusters={clusters}
          currentCluster={currentCluster}
          overallConfidence={overallConfidence}
        />
      )}

      <div className="arena-main">
        {/* LEFT: Chat Section (30%) */}
        <div className="arena-chat-section">
          {currentStep === 'setup' && (
            <div className="company-setup">
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
                      className="form-input"
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
                      className="btn-lookup"
                    >
                      {isLoading ? 'Hämtar företagsdata...' : 'Hämta företagsdata'}
                    </button>
                    
                    <button
                      onClick={handleStartConversation}
                      className="btn-skip"
                      disabled={isLoading}
                    >
                      Hoppa över
                    </button>
                  </div>

                  {companyIntelligence && (
                    <div className="company-preview">
                      <h3 className="preview-title">📊 Företagsinformation hämtad</h3>
                      
                      <div className="preview-grid">
                        <div className="preview-item">
                          <span className="preview-label">Juridiskt namn:</span>
                          <span className="preview-value">{companyIntelligence?.basicInfo?.legalName}</span>
                        </div>
                        
                        {companyIntelligence?.basicInfo?.organizationNumber !== 'Unknown' && (
                          <div className="preview-item">
                            <span className="preview-label">Org.nummer:</span>
                            <span className="preview-value">{companyIntelligence?.basicInfo?.organizationNumber}</span>
                          </div>
                        )}
                        
                        {companyIntelligence?.basicInfo?.registrationDate !== 'Unknown' && (
                          <div className="preview-item">
                            <span className="preview-label">Registrerat:</span>
                            <span className="preview-value">{companyIntelligence?.basicInfo?.registrationDate}</span>
                          </div>
                        )}

                        {companyIntelligence?.financial?.employees && (
                          <div className="preview-item">
                            <span className="preview-label">Anställda:</span>
                            <span className="preview-value">~{companyIntelligence?.financial?.employees} personer</span>
                          </div>
                        )}

                        {companyIntelligence?.leadership?.ceo && (
                          <div className="preview-item">
                            <span className="preview-label">VD:</span>
                            <span className="preview-value">{companyIntelligence?.leadership?.ceo}</span>
                          </div>
                        )}
                      </div>

                      <div className="preview-sources">
                        <p className="sources-label">Källor:</p>
                        <div className="sources-tags">
                          {(companyIntelligence?.sources || []).map((source: string, index: number) => (
                            <span key={index} className="source-tag">{source}</span>
                          ))}
                        </div>
                      </div>

                      <div className="setup-actions">
                        <button
                          onClick={handleStartConversation}
                          className="btn-start-with-data"
                        >
                          Starta Arena med företagsdata
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'conversation' && (
            <div className="chat-container">
              <div className="messages-area">
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.role} ${message.ragEnhanced ? 'rag-enhanced' : ''}`}>
                    <div className="message-avatar">
                      {message.role === 'assistant' ? 'AI' : 'U'}
                    </div>
                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      {message.ragEnhanced && message.sources && message.sources.length > 0 && (
                        <div className="message-sources">
                          <span className="sources-label">Källor:</span> {message.sources.join(', ')}
                        </div>
                      )}
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
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Skriv ditt svar här..."
                      className="chat-input"
                      rows={2}
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!input.trim() || isLoading}
                      className="send-button"
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
                  <button onClick={handleExtractData} className="generate-report-btn" disabled={isLoading}>
                    {isLoading ? 'Extraherar...' : 'Fortsätt'}
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'extracting' && (
            <div className="processing-view">
              <div className="processing-content">
                <div className="loading-spinner"></div>
                <h2>Extraherar data</h2>
                <p>Analyserar konversationen för nyckelinformation</p>
              </div>
            </div>
          )}

          {currentStep === 'preview' && extractedData && (
            <DataPreview 
              extractedData={extractedData}
              onConfirm={handleGenerateReport}
              onEdit={(data) => {
                setShowEditModal(true);
                console.log('Edit requested for data:', data);
              }}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'generating' && (
            <div className="processing-view">
              <div className="processing-content">
                <div className="loading-spinner"></div>
                <h2>Genererar rapport</h2>
                <p>Skapar strategisk rekryteringsanalys</p>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="processing-view">
              <div className="processing-content">
                <div className="text-4xl mb-4">✓</div>
                <h2>Rapport genererad</h2>
                <p>Omdirigerar till analys...</p>
              </div>
            </div>
          )}

          {/* Chapter Progress in Chat Section removed */}
        </div>

        {/* RIGHT: Canvas Section (70%) */}
        <div className="arena-canvas-section">
          <div className="canvas-header">
            <h2>Analyskanvas</h2>
            <p>Real-time insights och framsteg</p>
          </div>
          
          {/* Setup Phase Canvas */}
          {currentStep === 'setup' && (
            <div className="canvas-setup">
              <ProgressIndicator 
                steps={progressSteps} 
                currentStep={currentStep}
              />
              <div className="setup-stats">
                <div className="stat-card">
                  <div className="stat-number">{companyName.length > 0 ? '1' : '0'}</div>
                  <div className="stat-label">Företag angivet</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{companyIntelligence ? '1' : '0'}</div>
                  <div className="stat-label">Data hämtad</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Conversation Phase Canvas */}
          {currentStep === 'conversation' && (
            <div className="canvas-conversation">
              {/* Current Cluster Focus */}
              <div className="cluster-focus-section">
                <h3 className="section-title">
                  <span>🎯</span>
                  Aktuellt Fokus
                </h3>
                <div className="cluster-focus-card">
                  <div className="focus-header">
                    <span className="focus-name">
                      {CLUSTER_DEFINITIONS[currentCluster]?.name || 'Okänt kluster'}
                    </span>
                    <span className="focus-confidence">
                      {clusters[currentCluster]?.confidence || 0}%
                    </span>
                  </div>
                  <p className="focus-description">
                    {CLUSTER_DEFINITIONS[currentCluster]?.description || 'Ingen beskrivning'}
                  </p>
                </div>
              </div>
              
              {/* Live Insights Panel removed */}
              
              {/* Conversation Stats */}
              <div className="conversation-stats">
                <h3 className="section-title">
                  <span>📊</span>
                  Framsteg
                </h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">{messages.length}</div>
                    <div className="stat-label">Meddelanden</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{Math.floor(messages.length / 2)}</div>
                    <div className="stat-label">Frågor besvarade</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{overallConfidence}%</div>
                    <div className="stat-label">Total säkerhet</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Processing Phase Canvas */}
          {(currentStep === 'extracting' || currentStep === 'preview' || currentStep === 'generating') && (
            <div className="canvas-processing">
              <ProgressIndicator 
                steps={progressSteps} 
                currentStep={currentStep}
              />
              <div className="analysis-summary">
                <h3 className="section-title">
                  <span>📋</span>
                  Analys Sammanfattning
                </h3>
                <div className="confidence-display">
                  <span className="confidence-label">Total säkerhet: {overallConfidence}%</span>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${overallConfidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Company Intelligence Display */}
          {companyIntelligence && (
            <div className="company-intelligence-display">
              <h3 className="section-title">
                <span>🏢</span>
                Företagsdata
              </h3>
              <div className="intelligence-grid">
                <div className="intelligence-item">
                  <span className="item-label">Namn:</span>
                  <span className="item-value">{companyIntelligence?.basicInfo?.legalName || 'Ej tillgängligt'}</span>
                </div>
                <div className="intelligence-item">
                  <span className="item-label">Org.nr:</span>
                  <span className="item-value">{companyIntelligence?.basicInfo?.organizationNumber || 'Ej tillgängligt'}</span>
                </div>
                <div className="intelligence-item">
                  <span className="item-label">Status:</span>
                  <span className="item-value">{companyIntelligence?.basicInfo?.status || 'Ej tillgängligt'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Redigera analysdata</h3>
            <p className="modal-subtitle">
              Avancerad redigering kommer snart. För tillfället kan du gå tillbaka och justera dina svar i konversationen.
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentStep('conversation');
                }}
                className="btn-primary"
              >
                Tillbaka till konversation
              </button>
              <button 
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
              >
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
