"use client";
import React, { useState, useRef, useEffect } from "react";
import { Message } from "../../lib/types";
import { ClusterType } from "../../lib/types";
import { DesignSystem, ComponentTokens } from "../../lib/design-system";

interface SimpleArenaChatProps {
  sessionId: string;
  onComplete: (messages: Message[]) => void;
}

export default function SimpleArenaChat({ sessionId, onComplete }: SimpleArenaChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentCluster, setCurrentCluster] = useState<ClusterType>('pain-point');
  const [clusters, setClusters] = useState<Record<ClusterType, { confidence: number; status: string }>>({
    'pain-point': { confidence: 0, status: 'in-progress' },
    'impact-urgency': { confidence: 0, status: 'not-started' },
    'success-check': { confidence: 0, status: 'not-started' },
    'resources': { confidence: 0, status: 'not-started' },
    'org-reality': { confidence: 0, status: 'not-started' },
    'alternatives': { confidence: 0, status: 'not-started' }
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start conversation immediately
  useEffect(() => {
    if (messages.length === 0) {
      const firstMessage: Message = {
        role: 'user',
        content: "Hej! Jag vill förbereda en rekrytering.",
        timestamp: new Date()
      };
      setMessages([firstMessage]);
      handleSendMessage(firstMessage.content);
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
          clusters
        })
      });

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
        timestamp: new Date()
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

        // Auto-progress to next cluster if current is complete
        if (data.clusterUpdate.updates.status === 'complete') {
          const clusterOrder: ClusterType[] = [
            'pain-point', 'impact-urgency', 'success-check', 
            'resources', 'org-reality', 'alternatives'
          ];
          const currentIndex = clusterOrder.indexOf(currentCluster);
          if (currentIndex < clusterOrder.length - 1) {
            const nextCluster = clusterOrder[currentIndex + 1];
            setCurrentCluster(nextCluster);
            setClusters(prev => ({
              ...prev,
              [nextCluster]: {
                ...prev[nextCluster],
                status: 'in-progress'
              }
            }));
          } else {
            // All clusters complete
            onComplete([...messages, userMessage, aiMessage]);
          }
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Fel: ${error instanceof Error ? error.message : 'Okänt fel'}`,
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
    <div style={{ ...ComponentTokens.chatContainer, height: '100%', minHeight: 0 }}>
      <div className="messages-area" style={{ overflowY: 'auto' }}>
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

      <div className="input-area" style={{ flexShrink: 0 }}>
        <div className="input-container">
          <textarea
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
    </div>
  );
}
