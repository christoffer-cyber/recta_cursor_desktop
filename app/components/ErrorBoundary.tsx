"use client";
import React from "react";
import { DesignSystem, ComponentTokens } from "../../lib/design-system";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: DesignSystem.spacing[6],
          background: DesignSystem.colors.background.primary,
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            padding: DesignSystem.spacing[8],
            background: DesignSystem.colors.background.primary,
            borderRadius: DesignSystem.borderRadius.lg,
            border: `1px solid ${DesignSystem.colors.neutral[200]}`,
            boxShadow: DesignSystem.boxShadow.md,
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: DesignSystem.spacing[4],
            }}>
              ⚠️
            </div>
            
            <h2 style={{
              fontSize: DesignSystem.typography.fontSize['2xl'],
              fontWeight: DesignSystem.typography.fontWeight.bold,
              color: DesignSystem.colors.error[600],
              marginBottom: DesignSystem.spacing[3],
            }}>
              Något gick fel
            </h2>
            
            <p style={{
              fontSize: DesignSystem.typography.fontSize.base,
              color: DesignSystem.colors.neutral[600],
              lineHeight: DesignSystem.typography.lineHeight.relaxed,
              marginBottom: DesignSystem.spacing[6],
            }}>
              Arena stötte på ett oväntat fel. Prova att ladda om sidan eller kontakta support om problemet kvarstår.
            </p>

            {this.state.error && (
              <details style={{
                background: DesignSystem.colors.neutral[50],
                padding: DesignSystem.spacing[3],
                borderRadius: DesignSystem.borderRadius.md,
                marginBottom: DesignSystem.spacing[4],
                textAlign: 'left',
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: DesignSystem.typography.fontWeight.semibold,
                  color: DesignSystem.colors.neutral[700],
                }}>
                  Teknisk information
                </summary>
                <pre style={{
                  fontSize: DesignSystem.typography.fontSize.sm,
                  color: DesignSystem.colors.neutral[600],
                  marginTop: DesignSystem.spacing[2],
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div style={{
              display: 'flex',
              gap: DesignSystem.spacing[3],
              justifyContent: 'center',
            }}>
              <button
                onClick={this.resetError}
                style={{
                  ...ComponentTokens.button.primary,
                  padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[6]}`,
                }}
              >
                Försök igen
              </button>
              
              <button
                onClick={() => window.location.reload()}
                style={{
                  ...ComponentTokens.button.secondary,
                  padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[6]}`,
                }}
              >
                Ladda om sidan
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional error fallback component
export function ArenaErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: DesignSystem.spacing[6],
      background: DesignSystem.colors.background.primary,
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        padding: DesignSystem.spacing[8],
        background: DesignSystem.colors.background.primary,
        borderRadius: DesignSystem.borderRadius.lg,
        border: `1px solid ${DesignSystem.colors.neutral[200]}`,
        boxShadow: DesignSystem.boxShadow.lg,
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: DesignSystem.spacing[4],
        }}>
          🎯
        </div>
        
        <h1 style={{
          fontSize: DesignSystem.typography.fontSize['3xl'],
          fontWeight: DesignSystem.typography.fontWeight.bold,
          color: DesignSystem.colors.primary[900],
          marginBottom: DesignSystem.spacing[2],
        }}>
          Arena
        </h1>
        
        <h2 style={{
          fontSize: DesignSystem.typography.fontSize.xl,
          fontWeight: DesignSystem.typography.fontWeight.semibold,
          color: DesignSystem.colors.error[600],
          marginBottom: DesignSystem.spacing[4],
        }}>
          Systemfel upptäckt
        </h2>
        
        <p style={{
          fontSize: DesignSystem.typography.fontSize.base,
          color: DesignSystem.colors.neutral[600],
          lineHeight: DesignSystem.typography.lineHeight.relaxed,
          marginBottom: DesignSystem.spacing[6],
        }}>
          Arena kunde inte starta på grund av ett tekniskt fel. Vårt team har blivit notifierat och arbetar med en lösning.
        </p>

        <div style={{
          display: 'flex',
          gap: DesignSystem.spacing[3],
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={resetError}
            style={{
              ...ComponentTokens.button.primary,
              padding: `${DesignSystem.spacing[4]} ${DesignSystem.spacing[8]}`,
              fontSize: DesignSystem.typography.fontSize.base,
            }}
          >
            Starta om Arena
          </button>
          
          <button
            onClick={() => window.location.reload()}
            style={{
              ...ComponentTokens.button.secondary,
              padding: `${DesignSystem.spacing[4]} ${DesignSystem.spacing[8]}`,
              fontSize: DesignSystem.typography.fontSize.base,
            }}
          >
            Ladda om sidan
          </button>
        </div>
      </div>
    </div>
  );
}
