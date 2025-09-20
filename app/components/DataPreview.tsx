"use client";
import React from "react";
import { ExtractedData } from "../../lib/types";

type Props = {
  extractedData: ExtractedData | Record<string, unknown>;
  onConfirm: () => void;
  onEdit: (data: ExtractedData | Record<string, unknown>) => void;
  isLoading?: boolean;
};

// Type guard to check if data has the new structure
function isAdvancedExtractedData(data: unknown): data is ExtractedData {
  return Boolean(data && typeof data === 'object' && data !== null && 'companyInfo' in data && 'roleDetails' in data);
}

export default function DataPreview({ extractedData, onConfirm, onEdit, isLoading }: Props) {
  const isAdvanced = isAdvancedExtractedData(extractedData);

  if (isAdvanced) {
    return (
      <div className="data-preview">
        <div className="preview-header">
          <h2 className="preview-title">Avancerad dataanalys slutförd</h2>
          <p className="preview-subtitle">
            Djupgående organisationsanalys med bias-identifiering och strategiska insikter.
          </p>
        </div>

        <div className="preview-content advanced-preview">
          {/* Company Information */}
          <div className="data-section">
            <h3 className="section-title">🏢 Företagsinformation</h3>
            <div className="data-grid">
              <div className="data-item">
                <label>Företag:</label>
                <span>{extractedData.companyInfo.name}</span>
              </div>
              <div className="data-item">
                <label>Storlek:</label>
                <span className={`size-badge ${extractedData.companyInfo.size}`}>
                  {extractedData.companyInfo.size === 'startup' ? 'Startup' :
                   extractedData.companyInfo.size === 'scaling' ? 'Skalning' : 'Etablerat'}
                </span>
              </div>
              <div className="data-item">
                <label>Bransch:</label>
                <span>{extractedData.companyInfo.industry}</span>
              </div>
              <div className="data-item">
                <label>Tillväxtfas:</label>
                <span>{extractedData.companyInfo.growthStage}</span>
              </div>
            </div>
          </div>

          {/* Role Details */}
          <div className="data-section">
            <h3 className="section-title">👤 Rolldetaljer</h3>
            <div className="data-grid">
              <div className="data-item">
                <label>Titel:</label>
                <span>{extractedData.roleDetails.title}</span>
              </div>
              <div className="data-item">
                <label>Avdelning:</label>
                <span>{extractedData.roleDetails.department}</span>
              </div>
              <div className="data-item">
                <label>Senioritet:</label>
                <span className={`seniority-badge ${extractedData.roleDetails.seniority}`}>
                  {extractedData.roleDetails.seniority === 'junior' ? 'Junior' :
                   extractedData.roleDetails.seniority === 'mid' ? 'Mellannivå' :
                   extractedData.roleDetails.seniority === 'senior' ? 'Senior' : 'Ledning'}
                </span>
              </div>
            </div>
            
            <div className="subsection">
              <h4>Nyckelansvar:</h4>
              <ul className="data-list">
                {extractedData.roleDetails.keyResponsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>

            <div className="subsection">
              <h4>Kritiska kompetenser:</h4>
              <ul className="data-list">
                {extractedData.roleDetails.criticalSkills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Context */}
          <div className="data-section">
            <h3 className="section-title">⚡ Kontext & Begränsningar</h3>
            <div className="data-grid">
              <div className="data-item">
                <label>Prioritet:</label>
                <span className={`urgency-badge ${extractedData.context.urgency}`}>
                  {extractedData.context.urgency === 'low' ? 'Låg' :
                   extractedData.context.urgency === 'medium' ? 'Medium' : 'Hög'}
                </span>
              </div>
              <div className="data-item">
                <label>Budget:</label>
                <span>{extractedData.context.budget}</span>
              </div>
              <div className="data-item">
                <label>Tidslinje:</label>
                <span>{extractedData.context.timeline}</span>
              </div>
              <div className="data-item">
                <label>Teamstorlek:</label>
                <span>{extractedData.context.teamSize} personer</span>
              </div>
            </div>
          </div>

          {/* Strategic Insights */}
          <div className="data-section">
            <h3 className="section-title">🎯 Strategiska Insikter</h3>
            
            <div className="insight-grid">
              <div className="insight-column">
                <h4>🔍 Identifierade Bias:</h4>
                <ul className="data-list bias-list">
                  {extractedData.insights.identifiedBiases.map((bias, i) => (
                    <li key={i} className="bias-item">{bias}</li>
                  ))}
                </ul>
              </div>

              <div className="insight-column">
                <h4>📊 Benchmark-behov:</h4>
                <ul className="data-list benchmark-list">
                  {extractedData.insights.benchmarkNeeds.map((need, i) => (
                    <li key={i} className="benchmark-item">{need}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="subsection">
              <h4>💡 Rekommendationer:</h4>
              <ul className="data-list recommendation-list">
                {extractedData.insights.recommendations.map((rec, i) => (
                  <li key={i} className="recommendation-item">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="preview-actions">
          <button 
            onClick={() => onEdit(extractedData)} 
            className="btn-secondary"
            disabled={isLoading}
          >
            Redigera analys
          </button>
          <button 
            onClick={onConfirm} 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Genererar strategisk rapport...' : 'Generera strategisk rapport'}
          </button>
        </div>
      </div>
    );
  }

  // Fallback to simple preview for legacy data
  return (
    <div className="data-preview">
      <div className="preview-header">
        <h2 className="preview-title">Granska extraherad data</h2>
        <p className="preview-subtitle">
          Kontrollera att informationen är korrekt innan rapporten genereras.
        </p>
      </div>

      <div className="preview-content">
        <div className="data-section">
          <h3 className="section-title">Företagsinformation</h3>
          <div className="data-grid">
            <div className="data-item">
              <label>Företag:</label>
              <span>{String((extractedData as Record<string, unknown>).companyName || 'Ej specificerat')}</span>
            </div>
            <div className="data-item">
              <label>Roll:</label>
              <span>{String((extractedData as Record<string, unknown>).roleTitle || 'Ej specificerat')}</span>
            </div>
            <div className="data-item">
              <label>Bransch:</label>
              <span>{String((extractedData as Record<string, unknown>).industry || 'Ej specificerat')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="preview-actions">
        <button 
          onClick={() => onEdit(extractedData)} 
          className="btn-secondary"
          disabled={isLoading}
        >
          Redigera data
        </button>
        <button 
          onClick={onConfirm} 
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Genererar rapport...' : 'Generera rapport'}
        </button>
      </div>
    </div>
  );
}
