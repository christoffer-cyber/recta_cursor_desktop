"use client";
import React from "react";
import { ClusterType } from "../../lib/types";
import { DesignSystem, ComponentTokens, DesignUtils } from "../../lib/design-system";

interface StepIntroductionProps {
  clusterType: ClusterType;
  isVisible: boolean;
  onContinue: () => void;
}

const STEP_DEFINITIONS = {
  'pain-point': {
    title: 'Steg 1: Problem & Pain Point',
    icon: '🎯',
    purpose: 'Identifiera det verkliga problemet',
    description: 'Vi behöver förstå vad som egentligen är problemet som rekryteringen ska lösa. Detta är grunden för allt som kommer efter.',
    goals: [
      'Konkret beskrivning av nuvarande situation',
      'Tydlig bild av önskad situation',
      'Förståelse för vem som påverkas',
      'Insikt i problemets omfattning'
    ],
    example: 'T.ex: "Vi har för många buggar i vårt system som tar för lång tid att fixa, vilket frustrerar både utvecklare och kunder."',
    estimatedTime: '2-3 minuter'
  },
  'impact-urgency': {
    title: 'Steg 2: Påverkan & Prioritering',
    icon: '⚡',
    purpose: 'Förstå affärskonsekvenserna',
    description: 'Nu ska vi förstå hur viktigt detta problem är för verksamheten och vad som händer om vi väntar.',
    goals: [
      'Tidsaspekt - vad händer om vi väntar?',
      'Affärskonsekvenser - påverkan på resultat',
      'Pressgrupper - vem bryr sig om detta?',
      'Prioritering jämfört med andra saker'
    ],
    example: 'T.ex: "Om vi inte löser detta innan Q2 förlorar vi vårt största kundkontrakt värt 2M, och styrelsen har redan frågat varför vi inte agerat."',
    estimatedTime: '2-3 minuter'
  },
  'success-check': {
    title: 'Steg 3: Framgång & Kriterier',
    icon: '✅',
    purpose: 'Definiera vad framgång betyder',
    description: 'Vi behöver mätbara mål för att veta när rekryteringen har varit framgångsrik.',
    goals: [
      'Mätbara mål med konkreta siffror',
      'Tidsram för när framgång ska synas',
      'Definition av framgång vs misslyckande',
      'Tydligt ansvar för måluppfyllelse'
    ],
    example: 'T.ex: "Inom 90 dagar ska månadsrapporten levereras dag 3 istället för dag 15, och kostnadsavvikelser ska minska från 20% till under 5%."',
    estimatedTime: '2-3 minuter'
  },
  'resources': {
    title: 'Steg 4: Resurser & Budget',
    icon: '💰',
    purpose: 'Säkerställa att vi har kapacitet',
    description: 'Vi behöver förstå den totala kostnaden och säkerställa att organisationen har kapacitet att ta emot en ny person.',
    goals: [
      'Total kostnad inklusive allt (lön, avgifter, utrustning)',
      'Onboarding-kapacitet - vem har tid att introducera?',
      'Tillgängliga verktyg vs vad som behöver köpas',
      'Budgetverklighet - vad händer om det blir dyrare?'
    ],
    example: 'T.ex: "Total budget 800k/år inklusive allt. Min CFO kan dedikera 5 timmar första månaden för introduktion. Vi har Salesforce men behöver köpa Power BI för 50k."',
    estimatedTime: '2-3 minuter'
  },
  'org-reality': {
    title: 'Steg 5: Organisation & Kultur',
    icon: '🏢',
    purpose: 'Säkerställa kulturell passform',
    description: 'Vi behöver förstå hur organisationen fungerar och vilken typ av person som skulle passa in.',
    goals: [
      'Kulturell passform - vilken typ av person fungerar?',
      'Tidigare rekryteringserfarenheter - vad lärde vi oss?',
      'Beslutsstilar och processer - hur fattas beslut?',
      'Organisatorisk mognad - är vi redo för denna roll?'
    ],
    example: 'T.ex: "Vår förra ekonomichef slutade efter 8 månader eftersom hen inte passade vår snabba beslutsstil. Vi fattar beslut på fredagsmöten där alla managers har vetorätt."',
    estimatedTime: '2-3 minuter'
  },
  'alternatives': {
    title: 'Steg 6: Alternativ & Risker',
    icon: '🔄',
    purpose: 'Validera att rekrytering är rätt lösning',
    description: 'Sista steget - vi behöver säkerställa att rekrytering verkligen är den bästa lösningen jämfört med andra alternativ.',
    goals: [
      'Utvärderade alternativ (konsult, automation, omorganisation)',
      'Kostnadsanalys per alternativ',
      'Argument för varför rekrytering är bättre',
      'Riskmedvetenhet - vad är det värsta som kan hända?'
    ],
    example: 'T.ex: "Vi kollade på konsulter men de kostar 2000kr/dag vilket blir 500k per år, plus att de inte lär sig vår kultur. Därför tror vi fast anställning är bäst."',
    estimatedTime: '2-3 minuter'
  }
};

export default function StepIntroduction({ clusterType, isVisible, onContinue }: StepIntroductionProps) {
  const step = STEP_DEFINITIONS[clusterType];

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
            {step.icon}
          </div>
          
          <h2 style={{
            fontSize: DesignSystem.typography.fontSize['2xl'],
            fontWeight: DesignSystem.typography.fontWeight.bold,
            color: DesignSystem.colors.primary[900],
            marginBottom: DesignSystem.spacing[2],
          }}>
            {step.title}
          </h2>
          
          <p style={{
            fontSize: DesignSystem.typography.fontSize.lg,
            color: DesignSystem.colors.primary[600],
            fontWeight: DesignSystem.typography.fontWeight.semibold,
            marginBottom: DesignSystem.spacing[4],
          }}>
            {step.purpose}
          </p>
          
          <p style={{
            fontSize: DesignSystem.typography.fontSize.base,
            color: DesignSystem.colors.neutral[600],
            lineHeight: DesignSystem.typography.lineHeight.relaxed,
          }}>
            {step.description}
          </p>
        </div>

        {/* Goals */}
        <div style={{
          marginBottom: DesignSystem.spacing[6],
        }}>
          <h3 style={{
            fontSize: DesignSystem.typography.fontSize.lg,
            fontWeight: DesignSystem.typography.fontWeight.semibold,
            color: DesignSystem.colors.neutral[800],
            marginBottom: DesignSystem.spacing[3],
          }}>
            Vad vi letar efter:
          </h3>
          
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}>
            {step.goals.map((goal, index) => (
              <li key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: DesignSystem.spacing[2],
                padding: DesignSystem.spacing[2],
                background: DesignSystem.colors.primary[50],
                borderRadius: DesignSystem.borderRadius.md,
                border: `1px solid ${DesignSystem.colors.primary[100]}`,
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  background: DesignSystem.colors.primary[500],
                  color: DesignSystem.colors.background.primary,
                  borderRadius: '50%',
                  fontSize: DesignSystem.typography.fontSize.sm,
                  fontWeight: DesignSystem.typography.fontWeight.bold,
                  marginRight: DesignSystem.spacing[3],
                  flexShrink: 0,
                }}>
                  {index + 1}
                </span>
                <span style={{
                  fontSize: DesignSystem.typography.fontSize.sm,
                  color: DesignSystem.colors.neutral[700],
                  lineHeight: DesignSystem.typography.lineHeight.normal,
                }}>
                  {goal}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Example */}
        <div style={{
          background: DesignSystem.colors.accent[50],
          border: `1px solid ${DesignSystem.colors.accent[200]}`,
          borderRadius: DesignSystem.borderRadius.lg,
          padding: DesignSystem.spacing[4],
          marginBottom: DesignSystem.spacing[6],
        }}>
          <h4 style={{
            fontSize: DesignSystem.typography.fontSize.sm,
            fontWeight: DesignSystem.typography.fontWeight.semibold,
            color: DesignSystem.colors.accent[800],
            marginBottom: DesignSystem.spacing[2],
          }}>
            💡 Exempel på komplett svar:
          </h4>
          <p style={{
            fontSize: DesignSystem.typography.fontSize.sm,
            color: DesignSystem.colors.accent[700],
            fontStyle: 'italic',
            lineHeight: DesignSystem.typography.lineHeight.relaxed,
            margin: 0,
          }}>
            {step.example}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: DesignSystem.spacing[4],
          borderTop: `1px solid ${DesignSystem.colors.neutral[200]}`,
        }}>
          <div style={{
            fontSize: DesignSystem.typography.fontSize.sm,
            color: DesignSystem.colors.neutral[500],
          }}>
            ⏱️ Uppskattad tid: {step.estimatedTime}
          </div>
          
          <button
            onClick={onContinue}
            style={{
              ...ComponentTokens.button.primary,
              padding: `${DesignSystem.spacing[4]} ${DesignSystem.spacing[8]}`,
              fontSize: DesignSystem.typography.fontSize.lg,
              fontWeight: DesignSystem.typography.fontWeight.bold,
              background: DesignSystem.colors.primary[500],
              boxShadow: DesignSystem.boxShadow.lg,
            }}
          >
            🚀 Starta {step.title.toLowerCase()} →
          </button>
        </div>
      </div>
    </div>
  );
}
