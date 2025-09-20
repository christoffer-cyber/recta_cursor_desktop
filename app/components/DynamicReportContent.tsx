"use client";
import React, { useState } from "react";
import type { ReportData } from "@/lib/types";

type Props = { 
  className?: string;
  reportData: ReportData;
};

export default function DynamicReportContent({ className, reportData }: Props) {
  const [zoom, setZoom] = useState<number>(67);
  const handleZoom = (value: number) => setZoom(value);

  return (
    <div id="report-container" className={`report-pages ${className ?? ""}`} style={{ transform: `scale(${zoom/100})`, transformOrigin: 'top center' }}>
      {/* Discrete zoom controls */}
      <div className="no-print zoom-controls">
        <button
          onClick={() => handleZoom(Math.max(25, zoom - 10))}
          className="zoom-btn"
          aria-label="Zooma ut"
          disabled={zoom <= 25}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <span className="zoom-level">{zoom}%</span>
        <button
          onClick={() => handleZoom(Math.min(150, zoom + 10))}
          className="zoom-btn"
          aria-label="Zooma in"
          disabled={zoom >= 150}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Page 1: Cover */}
      <section id="page-1" className="page page-break flex flex-col" style={{ backgroundColor: '#111827', color: 'white' }}>
        <header className="page-header">
          <div className="recta-logo text-2xl text-white">Recta<span style={{ color: '#4ADE80' }}>.</span></div>
        </header>
        <main className="page-content flex flex-col justify-center text-center flex-grow">
          <h2 className="text-xl font-semibold text-gray-400">Strategisk Rekryteringsanalys</h2>
          <h1 className="text-6xl font-extrabold mt-4 leading-tight">{reportData.roleTitle}</h1>
          <p className="text-lg text-gray-300 mt-8">Förberedd för {reportData.companyName}</p>
        </main>
        <footer className="page-footer border-t border-gray-700 pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 1 av 8</span>
          </div>
        </footer>
      </section>

      {/* Page 2: Executive Summary */}
      <section id="page-2" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Executive Summary</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-8">Executive Summary</h1>
          <div className="space-y-4 text-base leading-relaxed">
            {reportData.executiveSummary.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 2 av 8</span>
          </div>
        </footer>
      </section>

      {/* Page 3: Nulägesanalys */}
      <section id="page-3" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Nulägesanalys</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-8">Nulägesanalys</h1>
          <div className="space-y-4 text-base leading-relaxed">
            {reportData.currentState.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 3 av 8</span>
          </div>
        </footer>
      </section>

      {/* Page 4: Kärninsikter */}
      <section id="page-4" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Kärninsikter</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-8">Kärninsikter</h1>
          <ul className="space-y-3">
            {reportData.coreInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </span>
                <span className="text-base leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 4 av 8</span>
          </div>
        </footer>
      </section>

      {/* Page 5: Strategiska Alternativ */}
      <section id="page-5" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Strategiska Alternativ</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-8">Strategiska Alternativ</h1>
          <div className="space-y-6">
            {reportData.strategicOptions.map((option, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Alternativ {i + 1}</h3>
                <p className="text-base leading-relaxed">{option}</p>
              </div>
            ))}
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 5 av 8</span>
          </div>
        </footer>
      </section>

      {/* Page 6: Riskanalys */}
      <section id="page-6" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Riskanalys</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-8">Riskanalys</h1>
          <div className="space-y-4">
            {reportData.riskAnalysis.map((risk, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  ⚠️
                </span>
                <span className="text-base leading-relaxed">{risk}</span>
              </div>
            ))}
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 6 av 8</span>
          </div>
        </footer>
      </section>

      {/* Page 7: ROI */}
      <section id="page-7" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">ROI-Projektion</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-8">ROI-Projektion</h1>
          <div className="space-y-4 text-base leading-relaxed">
            {reportData.roiProjection.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 7 av 8</span>
          </div>
        </footer>
      </section>

      {/* Page 8: Implementeringsplan */}
      <section id="page-8" className="page">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Implementeringsplan</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-8">Implementeringsplan</h1>
          <ol className="space-y-4">
            {reportData.implementationPlan.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </span>
                <span className="text-base leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 8 av 8</span>
          </div>
        </footer>
      </section>
    </div>
  );
}
