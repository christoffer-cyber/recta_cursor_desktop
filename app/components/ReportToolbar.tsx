"use client";
import React, { useState } from "react";

type Props = {
  onPresentationMode?: (enabled: boolean) => void;
};

export default function ReportToolbar({ onPresentationMode }: Props) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const handlePresent = () => {
    // Enter slide-based presentation mode
    document.documentElement.requestFullscreen().catch(() => {
      // Fallback if fullscreen fails
      console.log('Fullscreen not supported');
    });
    document.body.classList.add('presentation-mode');
    onPresentationMode?.(true);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const exportToPDF = () => {
    // Create hidden iframe to load print route
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.src = '/print';
    
    iframe.onload = () => {
      try {
        // Trigger print from iframe
        iframe.contentWindow?.print();
        // Clean up after 2 seconds
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      } catch (error) {
        console.error('Print failed:', error);
        // Fallback: open in new window
        window.open('/print', '_blank');
        document.body.removeChild(iframe);
      }
    };
    
    document.body.appendChild(iframe);
    setShowExportModal(false);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <div className="toolbar-floating">
        <button className="btn-icon" onClick={handlePresent} title="Presentera">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </button>
        <button className="btn-icon" onClick={handleExport} title="Exportera">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        <button className="btn-icon" onClick={handleShare} title="Dela rapport">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </div>
      
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Exportera rapport</h3>
            <div className="export-options">
              <button className="export-option" onClick={exportToPDF}>
                <div className="export-icon">📄</div>
                <div>
                  <div className="export-title">PDF-dokument</div>
                  <div className="export-desc">Högkvalitativ PDF för utskrift och delning</div>
                </div>
              </button>
              <button className="export-option" onClick={() => {
                // Create hidden iframe for print
                const iframe = document.createElement('iframe');
                iframe.style.position = 'absolute';
                iframe.style.left = '-9999px';
                iframe.style.width = '1px';
                iframe.style.height = '1px';
                iframe.src = '/print';
                
                iframe.onload = () => {
                  try {
                    iframe.contentWindow?.print();
                    setTimeout(() => {
                      document.body.removeChild(iframe);
                    }, 2000);
                  } catch (error) {
                    console.error('Print failed:', error);
                    window.open('/print', '_blank');
                    document.body.removeChild(iframe);
                  }
                };
                
                document.body.appendChild(iframe);
                setShowExportModal(false);
              }}>
                <div className="export-icon">🖨️</div>
                <div>
                  <div className="export-title">Skriv ut</div>
                  <div className="export-desc">Öppna webbläsarens utskriftsdialog</div>
                </div>
              </button>
            </div>
            <button className="btn" onClick={() => setShowExportModal(false)}>Avbryt</button>
          </div>
        </div>
      )}
      
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Dela rapport</h3>
            <div className="share-options">
              <button className="share-option" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Länk kopierad!');
                setShowShareModal(false);
              }}>
                📋 Kopiera länk
              </button>
              <button className="share-option" onClick={() => {
                window.open(`mailto:?subject=Recta Rapport&body=Se rapporten: ${window.location.href}`);
                setShowShareModal(false);
              }}>
                ✉️ Skicka via email
              </button>
            </div>
            <button className="btn" onClick={() => setShowShareModal(false)}>Stäng</button>
          </div>
        </div>
      )}
    </>
  );
}


