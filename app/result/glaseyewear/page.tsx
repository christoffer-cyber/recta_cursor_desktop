"use client";
import React, { useState } from "react";
import ReportLayout from "@/app/components/ReportLayout";
import UniversalToolboxPanel from "@/app/components/UniversalToolboxPanel";
import ReportNavigation from "@/app/components/ReportNavigation";
import ReportContent from "@/app/components/ReportContent";
import ReportToolbar from "@/app/components/ReportToolbar";
import PresentationControls from "@/app/components/PresentationControls";

export default function GlaseyewearResultPage() {
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


