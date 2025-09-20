"use client";
import React, { useState, useEffect } from "react";
import ReportLayout from "@/app/components/ReportLayout";
import UniversalToolboxPanel from "@/app/components/UniversalToolboxPanel";
import ReportNavigation from "@/app/components/ReportNavigation";
import DynamicReportContent from "@/app/components/DynamicReportContent";
import ReportToolbar from "@/app/components/ReportToolbar";
import PresentationControls from "@/app/components/PresentationControls";
import type { ReportData } from "@/lib/types";

type Props = {
  params: { sessionId: string };
};

export default function ReportPage({ params }: Props) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const sessionId = params.sessionId;
  
  useEffect(() => {
    // Load session data from localStorage
    const sessionKey = `arena_session_${sessionId}`;
    const sessionData = localStorage.getItem(sessionKey);
    
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        setReportData(parsed.reportData);
      } catch (error) {
        console.error('Failed to load session data:', error);
      }
    }
  }, [sessionId]);

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-4">Rapport ej tillgänglig</h1>
          <p className="text-gray-600 mb-6">
            Rapporten kunde inte laddas. Detta kan bero på att sessionen har gått ut eller att rapport-genereringen misslyckades.
          </p>
          <div className="space-y-3">
            <a href="/arena" className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Starta ny analys
            </a>
            <button 
              onClick={() => window.location.reload()} 
              className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200"
            >
              Försök ladda igen
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">Session ID: {sessionId}</p>
        </div>
      </div>
    );
  }
  
  const toolboxItems = [
    { title: "Rollbeskrivning", subtitle: "Färdig att publicera" },
    { title: "Intervjuguide", subtitle: "Strukturerade frågor" },
    { title: "Kandidatprofil", subtitle: "Målgruppsdefinition" },
    { title: "Onboarding-plan", subtitle: "90-dagars roadmap" },
  ];

  const navItems = [
    { id: "page-1", label: "Förstasida" },
    { id: "page-2", label: "Executive Summary" },
    { id: "page-3", label: "Nulägesanalys" },
    { id: "page-4", label: "Kärninsikter" },
    { id: "page-5", label: "Strategiska Alternativ" },
    { id: "page-6", label: "Riskanalys" },
    { id: "page-7", label: "ROI-Projektion" },
    { id: "page-8", label: "Implementeringsplan" },
  ];

  return (
    <>
      <ReportToolbar onPresentationMode={setIsPresentationMode} />
      <ReportLayout
        left={<UniversalToolboxPanel items={toolboxItems} />}
        right={<ReportNavigation items={navItems} />}
      >
        <div className="px-4 py-8">
          <DynamicReportContent reportData={reportData} />
        </div>
      </ReportLayout>
      {isPresentationMode && (
        <PresentationControls 
          totalSlides={8} 
          onExit={() => setIsPresentationMode(false)} 
        />
      )}
    </>
  );
}
