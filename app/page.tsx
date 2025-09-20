"use client";
import React, { useState } from "react";
import ReportContent from "./components/ReportContent";
import ReportLayout from "./components/ReportLayout";
import UniversalToolboxPanel from "./components/UniversalToolboxPanel";
import ReportNavigation from "./components/ReportNavigation";
import ReportToolbar from "./components/ReportToolbar";
import PresentationControls from "./components/PresentationControls";

export default function Home() {
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  
  const toolboxItems = [
    { title: "Intervjuguide", subtitle: "Strukturerade frågor" },
    { title: "Ledningssummering", subtitle: "Strategisk översikt" },
    { title: "Implementeringspaket", subtitle: "90-dagars plan" },
  ];

  const navItems = Array.from({ length: 15 }).map((_, i) => ({ id: `page-${i+1}`, label: `Sida ${i+1}` }));

  return (
    <>
      <ReportToolbar onPresentationMode={setIsPresentationMode} />
      <ReportLayout
        left={<UniversalToolboxPanel items={toolboxItems} />}
        right={<ReportNavigation items={navItems} />}
      >
        <div className="px-4 py-8">
          <ReportContent />
        </div>
      </ReportLayout>
      {isPresentationMode && (
        <PresentationControls 
          totalSlides={15} 
          onExit={() => setIsPresentationMode(false)} 
        />
      )}
    </>
  );
}
