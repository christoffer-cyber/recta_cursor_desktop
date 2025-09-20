// Create ReportContent component based on provided HTML structure
"use client";
import React, { useState } from "react";

type Props = { className?: string };

export default function ReportContent({ className }: Props) {
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
          <h2 className="text-xl font-semibold text-gray-400">Strategisk Beslutsrapport</h2>
          <h1 className="text-6xl font-extrabold mt-4 leading-tight">Framtidens<br />Finansfunktion</h1>
          <p className="text-lg text-gray-300 mt-8">Förberedd för Ledningsgruppen på [Kundföretag]</p>
        </main>
        <footer className="page-footer border-t border-gray-700 pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 1 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 2: Table of Contents */}
      <section id="page-2" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Innehållsförteckning</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-10">Innehållsförteckning</h1>
          <div className="space-y-4 text-lg">
            <p className="text-gray-400 italic">Fyll i innehållsförteckningen här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 2 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 3: Executive Summary */}
      <section id="page-3" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">Executive Summary</div>
            </div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-2">Executive Summary</h1>
          <p className="text-gray-500 mb-8">En sammanfattning av rapportens viktigaste punkter.</p>
          <div className="space-y-6 text-base">
            <p className="text-gray-400 italic">Fyll i sammanfattningen här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 3 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 4: Nulägesanalys & Kärnbehov */}
      <section id="page-4" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Nulägesanalys & Kärnbehov</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-8">Nulägesanalys & Kärnbehov</h1>
          <div className="space-y-6">
            <p className="text-gray-400 italic">Fyll i nulägesanalysen och kärnbehoven här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 4 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 5: Kärninsikter & Diagnos */}
      <section id="page-5" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Kärninsikter & Diagnos</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-2">Analysens Kärninsikter</h1>
          <p className="text-gray-500 mb-8">Beskriv de viktigaste insikterna från analysen.</p>
          <div className="space-y-6">
            <p className="text-gray-400 italic">Fyll i kärninsikterna och diagnosen här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 5 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 6: Strategiska vägar */}
      <section id="page-6" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Utvärdering av Strategiska Vägar</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-8">Utvärdering av Strategiska Vägar</h1>
          <div className="space-y-6">
            <p className="text-gray-400 italic">Fyll i utvärderingen av strategiska vägar här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 6 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 7: Risk- & Möjlighetsanalys */}
      <section id="page-7" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Risk- & Möjlighetsanalys</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-2">Risk- & Möjlighetsanalys</h1>
          <p className="text-gray-500 mb-6">Beskriv analysen av risker och möjligheter.</p>
          <div className="space-y-6">
            <p className="text-gray-400 italic">Fyll i risk- och möjlighetsanalys här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 7 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 8: ROI */}
      <section id="page-8" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Investeringens Värde & ROI</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-2">Investeringens Värde (ROI)</h1>
          <p className="text-gray-500 mb-8">Presentera en analys av den förväntade avkastningen på investeringen.</p>
          <div className="space-y-6">
            <p className="text-gray-400 italic">Fyll i ROI-analysen här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 8 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 9: Implementeringsplan */}
      <section id="page-9" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Implementeringsplan: Översikt</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-8">Implementeringsplan: Översikt</h1>
          <p className="mb-6">Beskriv de övergripande stegen i implementeringsplanen.</p>
          <div className="space-y-6">
            <p className="text-gray-400 italic">Fyll i översikten för implementeringsplanen här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 9 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 10: Processer, Ansvar & Flöden */}
      <section id="page-10" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Processer, Ansvar & Flöden</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-8">Processer, Ansvar & Flöden</h1>
          <div className="space-y-6">
            <p className="text-gray-400 italic">Fyll i processer, ansvarsmatris (RACI) och flöden här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 10 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 11: Tidslinje & Målbild */}
      <section id="page-11" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Tidslinje & Målbild</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-2">Tidslinje & Målbild</h1>
          <p className="text-gray-500 mb-8">Presentera en konkret tidslinje och målbild.</p>
          <div className="space-y-6">
            <p className="text-gray-400 italic">Fyll i tidslinje och målbild här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 11 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 12: Onboardingplan */}
      <section id="page-12" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Onboardingplan (90 Dagar)</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-2">Onboardingplan (90 Dagar)</h1>
          <p className="text-gray-500 mb-8">Beskriv handlingsplanen för de första 90 dagarna.</p>
          <div className="space-y-6">
            <p className="text-gray-400 italic">Fyll i onboardingplanen här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 12 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 13: Kommunikations- & Förändringsplan */}
      <section id="page-13" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Kommunikations- & Förändringsplan</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-2">Kommunikations- & Förändringsplan</h1>
          <p className="text-gray-500 mb-8">Beskriv hur förändringen ska kommuniceras internt och externt.</p>
          <div className="space-y-6">
            <p className="text-gray-400 italic">Fyll i kommunikationsplanen här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 13 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 14: Framtidsutsikter */}
      <section id="page-14" className="page page-break">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Framtidsutsikter</div>
          </div>
        </header>
        <main className="page-content">
          <h1 className="text-3xl font-bold mb-2">Framtidsutsikter</h1>
          <p className="text-gray-500 mb-8">Beskriv en framåtblick för funktionens utveckling.</p>
          <div className="space-y-6">
            <p className="text-gray-400 italic">Fyll i framtidsutsikterna här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 14 av 15</span>
          </div>
        </footer>
      </section>

      {/* Page 15: Nästa steg */}
      <section id="page-15" className="page">
        <header className="page-header border-b pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="recta-logo text-2xl">Recta<span>.</span></div>
            <div className="text-sm text-gray-500">Nästa Steg</div>
          </div>
        </header>
        <main className="page-content flex-grow flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4">Rekommendation & Nästa Steg</h1>
          <p className="text-lg text-gray-600 mb-8">Sammanfatta rekommendationen och de omedelbara nästa stegen.</p>
          <div className="space-y-6">
            <p className="text-gray-400 italic">Fyll i nästa steg här...</p>
          </div>
        </main>
        <footer className="page-footer border-t pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>© 2025 Recta | Konfidentiellt Dokument</span>
            <span>Sida 15 av 15</span>
          </div>
        </footer>
      </section>
    </div>
  );
}
