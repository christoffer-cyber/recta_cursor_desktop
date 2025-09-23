"use client";
import React from "react";
import { ClusterType } from "../../lib/types";
import { DesignSystem, ComponentTokens, DesignUtils } from "../../lib/design-system";

interface StepCompletionProps {
  clusterType: ClusterType;
  isVisible: boolean;
  confidence: number;
  foundPoints: string[];
  missingPoints: string[];
  onContinue: () => void;
  onRevisit: () => void;
}

const STEP_COMPLETION_DEFINITIONS = {
  'pain-point': {
    title: 'Steg 1: Problem & Pain Point',
    icon: '🎯',
    successMessage: 'Utmärkt! Vi har en tydlig bild av problemet.',
    nextStepTitle: 'Påverkan & Prioritering',
    nextStepIcon: '⚡',
    nextStepDescription: 'Nu ska vi förstå hur viktigt detta problem är för verksamheten.',
  },
  'impact-urgency': {
    title: 'Steg 2: Påverkan & Prioritering',
    icon: '⚡',
    successMessage: 'Perfekt! Vi förstår affärskonsekvenserna.',
    nextStepTitle: 'Framgång & Kriterier',
    nextStepIcon: '✅',
    nextStepDescription: 'Nu definierar vi vad framgång betyder för denna rekrytering.',
  },
  'success-check': {
    title: 'Steg 3: Framgång & Kriterier',
    icon: '✅',
    successMessage: 'Bra! Vi har tydliga mål att arbeta mot.',
    nextStepTitle: 'Resurser & Budget',
    nextStepIcon: '💰',
    nextStepDescription: 'Nu säkerställer vi att vi har kapacitet och budget för rekryteringen.',
  },
  'resources': {
    title: 'Steg 4: Resurser & Budget',
    icon: '💰',
    successMessage: 'Utmärkt! Vi har en realistisk bild av resurserna.',
    nextStepTitle: 'Organisation & Kultur',
    nextStepIcon: '🏢',
    nextStepDescription: 'Nu förstår vi vilken typ av person som skulle passa in i organisationen.',
  },
  'org-reality': {
    title: 'Steg 5: Organisation & Kultur',
    icon: '🏢',
    successMessage: 'Perfekt! Vi förstår organisationskulturen.',
    nextStepTitle: 'Alternativ & Risker',
    nextStepIcon: '🔄',
    nextStepDescription: 'Sista steget - vi validerar att rekrytering verkligen är rätt lösning.',
  },
  'alternatives': {
    title: 'Steg 6: Alternativ & Risker',
    icon: '🔄',
    successMessage: 'Fantastiskt! Analysen är komplett.',
    nextStepTitle: 'Rapportgenerering',
    nextStepIcon: '📊',
    nextStepDescription: 'Nu genererar vi en komplett analysrapport baserat på all information.',
  }
};

export default function StepCompletion({ 
  clusterType, 
  isVisible, 
  confidence, 
  foundPoints, 
  missingPoints, 
  onContinue, 
  onRevisit 
}: StepCompletionProps) {
  const step = STEP_COMPLETION_DEFINITIONS[clusterType];
  const isComplete = confidence >= 75;
  const isLastStep = clusterType === 'alternatives';

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: DesignUtils.colorWithOpacity(DesignSystem.colors.neutral[900], 0.8),
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: DesignSystem.spacing[6],
    }}>
      <div style={{
        background: DesignSystem.colors.background.primary,
        borderRadius: DesignSystem.borderRadius['2xl'],
        padding: DesignSystem.spacing[8],
        maxWidth: '600px',
        width: '100%',
        boxShadow: DesignSystem.boxShadow.xl,
        border: `1px solid ${DesignSystem.colors.neutral[200]}`,
        animation: 'slideInUp 0.4s ease-out',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: DesignSystem.spacing[6],
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: DesignSystem.spacing[3],
          }}>
            {isComplete ? '🎉' : '📋'}
          </div>
          
          <h2 style={{
            fontSize: DesignSystem.typography.fontSize['2xl'],
            fontWeight: DesignSystem.typography.fontWeight.bold,
            color: DesignSystem.colors.primary[900],
            marginBottom: DesignSystem.spacing[2],
          }}>
            {step.title} - {isComplete ? 'Komplett!' : 'Sammanfattning'}
          </h2>
          
          <p style={{
            fontSize: DesignSystem.typography.fontSize.lg,
            color: isComplete ? DesignSystem.colors.success[600] : DesignSystem.colors.warning[600],
            fontWeight: DesignSystem.typography.fontWeight.semibold,
            marginBottom: DesignSystem.spacing[4],
          }}>
            {isComplete ? step.successMessage : `Vi har ${Math.round(confidence)}% av informationen vi behöver.`}
          </p>
        </div>

        {/* Progress */}
        <div style={{
          marginBottom: DesignSystem.spacing[6],
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: DesignSystem.spacing[2],
          }}>
            <span style={{
              fontSize: DesignSystem.typography.fontSize.sm,
              fontWeight: DesignSystem.typography.fontWeight.semibold,
              color: DesignSystem.colors.neutral[700],
            }}>
              Framsteg
            </span>
            <span style={{
              fontSize: DesignSystem.typography.fontSize.sm,
              fontWeight: DesignSystem.typography.fontWeight.bold,
              color: DesignSystem.colors.primary[600],
            }}>
              {Math.round(confidence)}%
            </span>
          </div>
          
          <div style={{
            width: '100%',
            height: '8px',
            background: DesignSystem.colors.neutral[200],
            borderRadius: DesignSystem.borderRadius.full,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${confidence}%`,
              height: '100%',
              background: isComplete 
                ? DesignSystem.gradient('90deg', [
                    DesignSystem.colors.success[500],
                    DesignSystem.colors.accent[500]
                  ])
                : DesignSystem.gradient('90deg', [
                    DesignSystem.colors.warning[500],
                    DesignSystem.colors.warning[300]
                  ]),
              transition: 'width 0.5s ease-out',
            }} />
          </div>
        </div>

        {/* Found Points */}
        {foundPoints.length > 0 && (
          <div style={{
            marginBottom: DesignSystem.spacing[4],
          }}>
            <h3 style={{
              fontSize: DesignSystem.typography.fontSize.sm,
              fontWeight: DesignSystem.typography.fontWeight.semibold,
              color: DesignSystem.colors.success[600],
              marginBottom: DesignSystem.spacing[2],
              display: 'flex',
              alignItems: 'center',
              gap: DesignSystem.spacing[2],
            }}>
              ✅ Identifierat ({foundPoints.length})
            </h3>
            
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}>
              {foundPoints.map((point, index) => (
                <li key={index} style={{
                  fontSize: DesignSystem.typography.fontSize.sm,
                  color: DesignSystem.colors.success[700],
                  padding: `${DesignSystem.spacing[1]} 0`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: DesignSystem.spacing[2],
                }}>
                  <span style={{ fontSize: '12px' }}>✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Points */}
        {missingPoints.length > 0 && (
          <div style={{
            marginBottom: DesignSystem.spacing[6],
          }}>
            <h3 style={{
              fontSize: DesignSystem.typography.fontSize.sm,
              fontWeight: DesignSystem.typography.fontWeight.semibold,
              color: DesignSystem.colors.warning[600],
              marginBottom: DesignSystem.spacing[2],
              display: 'flex',
              alignItems: 'center',
              gap: DesignSystem.spacing[2],
            }}>
              ⚠️ Saknas ({missingPoints.length})
            </h3>
            
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}>
              {missingPoints.map((point, index) => (
                <li key={index} style={{
                  fontSize: DesignSystem.typography.fontSize.sm,
                  color: DesignSystem.colors.warning[700],
                  padding: `${DesignSystem.spacing[1]} 0`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: DesignSystem.spacing[2],
                }}>
                  <span style={{ fontSize: '12px' }}>○</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Step Preview */}
        {isComplete && !isLastStep && (
          <div style={{
            background: DesignSystem.colors.primary[50],
            border: `1px solid ${DesignSystem.colors.primary[200]}`,
            borderRadius: DesignSystem.borderRadius.lg,
            padding: DesignSystem.spacing[4],
            marginBottom: DesignSystem.spacing[6],
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: DesignSystem.spacing[3],
              marginBottom: DesignSystem.spacing[2],
            }}>
              <span style={{ fontSize: '1.5rem' }}>{step.nextStepIcon}</span>
              <h4 style={{
                fontSize: DesignSystem.typography.fontSize.base,
                fontWeight: DesignSystem.typography.fontWeight.semibold,
                color: DesignSystem.colors.primary[800],
                margin: 0,
              }}>
                Nästa: {step.nextStepTitle}
              </h4>
            </div>
            <p style={{
              fontSize: DesignSystem.typography.fontSize.sm,
              color: DesignSystem.colors.primary[700],
              margin: 0,
              lineHeight: DesignSystem.typography.lineHeight.relaxed,
            }}>
              {step.nextStepDescription}
            </p>
          </div>
        )}

        {/* Final Step */}
        {isComplete && isLastStep && (
          <div style={{
            background: DesignSystem.colors.accent[50],
            border: `1px solid ${DesignSystem.colors.accent[200]}`,
            borderRadius: DesignSystem.borderRadius.lg,
            padding: DesignSystem.spacing[4],
            marginBottom: DesignSystem.spacing[6],
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: DesignSystem.spacing[2],
            }}>
              🎯
            </div>
            <h4 style={{
              fontSize: DesignSystem.typography.fontSize.lg,
              fontWeight: DesignSystem.typography.fontWeight.bold,
              color: DesignSystem.colors.accent[800],
              marginBottom: DesignSystem.spacing[2],
            }}>
              Analysen är komplett!
            </h4>
            <p style={{
              fontSize: DesignSystem.typography.fontSize.sm,
              color: DesignSystem.colors.accent[700],
              margin: 0,
              lineHeight: DesignSystem.typography.lineHeight.relaxed,
            }}>
              Vi har nu all information som behövs för att generera en omfattande rekryteringsanalys.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: DesignSystem.spacing[3],
          justifyContent: isComplete ? 'center' : 'space-between',
        }}>
          {!isComplete && (
            <button
              onClick={onRevisit}
              style={{
                ...ComponentTokens.button.secondary,
                padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[6]}`,
                fontSize: DesignSystem.typography.fontSize.base,
                fontWeight: DesignSystem.typography.fontWeight.medium,
              }}
            >
              Fortsätt samla information
            </button>
          )}
          
          <button
            onClick={onContinue}
            style={{
              ...ComponentTokens.button.primary,
              padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[6]}`,
              fontSize: DesignSystem.typography.fontSize.base,
              fontWeight: DesignSystem.typography.fontWeight.semibold,
            }}
          >
            {isComplete 
              ? (isLastStep ? 'Generera rapport →' : 'Gå till nästa steg →')
              : 'Fortsätt →'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
