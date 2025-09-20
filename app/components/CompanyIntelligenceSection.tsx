'use client';

import React from 'react';

interface CompanyIntelligenceProps {
  companyName: string;
  companyData?: {
    basicInfo: {
      organizationNumber: string;
      legalName: string;
      tradingName?: string;
      registrationDate: string;
      status: string;
    };
    financial: {
      revenue?: number;
      employees?: number;
      creditRating?: string;
      growthRate?: number;
    };
    leadership: {
      ceo?: string;
      boardMembers?: string[];
    };
    sources: string[];
    lastUpdated: Date;
  };
  scbBenchmarks?: string;
}

export default function CompanyIntelligenceSection({ companyName, companyData, scbBenchmarks }: CompanyIntelligenceProps) {
  if (!companyData && !scbBenchmarks) {
    return null;
  }

  return (
    <div className="company-intelligence-section">
      <div className="intelligence-header">
        <h3 className="intelligence-title">📊 Företagsanalys & Branschkontext</h3>
        <p className="intelligence-subtitle">
          Automatiskt insamlad data för strategisk kontext
        </p>
      </div>

      <div className="intelligence-content">
        {companyData && (
          <div className="company-data-grid">
            {/* Basic Company Info */}
            <div className="data-card">
              <h4>🏢 Grundläggande Information</h4>
              <div className="data-items">
                <div className="data-row">
                  <span className="label">Juridiskt namn:</span>
                  <span className="value">{companyData.basicInfo.legalName}</span>
                </div>
                {companyData.basicInfo.organizationNumber !== 'Unknown' && (
                  <div className="data-row">
                    <span className="label">Org.nummer:</span>
                    <span className="value">{companyData.basicInfo.organizationNumber}</span>
                  </div>
                )}
                {companyData.basicInfo.registrationDate !== 'Unknown' && (
                  <div className="data-row">
                    <span className="label">Registrerat:</span>
                    <span className="value">{companyData.basicInfo.registrationDate}</span>
                  </div>
                )}
                <div className="data-row">
                  <span className="label">Status:</span>
                  <span className={`value status ${companyData.basicInfo.status.toLowerCase()}`}>
                    {companyData.basicInfo.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Leadership Info */}
            {companyData.leadership.ceo && (
              <div className="data-card">
                <h4>👤 Ledning</h4>
                <div className="data-items">
                  <div className="data-row">
                    <span className="label">VD:</span>
                    <span className="value">{companyData.leadership.ceo}</span>
                  </div>
                  {companyData.leadership.boardMembers && companyData.leadership.boardMembers.length > 0 && (
                    <div className="data-row">
                      <span className="label">Styrelse:</span>
                      <span className="value">{companyData.leadership.boardMembers.length} ledamöter</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Financial Info (if available) */}
            {(companyData.financial.revenue || companyData.financial.employees) && (
              <div className="data-card">
                <h4>💰 Finansiell Information</h4>
                <div className="data-items">
                  {companyData.financial.employees && (
                    <div className="data-row">
                      <span className="label">Anställda:</span>
                      <span className="value">~{companyData.financial.employees} personer</span>
                    </div>
                  )}
                  {companyData.financial.revenue && (
                    <div className="data-row">
                      <span className="label">Omsättning:</span>
                      <span className="value">~{(companyData.financial.revenue / 1000000).toFixed(1)}M SEK</span>
                    </div>
                  )}
                  {companyData.financial.growthRate && (
                    <div className="data-row">
                      <span className="label">Tillväxt:</span>
                      <span className={`value growth ${companyData.financial.growthRate > 0 ? 'positive' : 'negative'}`}>
                        {companyData.financial.growthRate > 0 ? '+' : ''}{companyData.financial.growthRate}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCB Benchmarks */}
        {scbBenchmarks && (
          <div className="scb-benchmarks">
            <h4>📈 SCB Branschanalys</h4>
            <div className="benchmark-content">
              <pre className="benchmark-text">{scbBenchmarks}</pre>
            </div>
          </div>
        )}

        {/* Data Sources */}
        {companyData && (
          <div className="data-sources">
            <h5>Källor:</h5>
            <div className="sources-list">
              {companyData.sources.map((source, index) => (
                <span key={index} className="source-tag">{source}</span>
              ))}
            </div>
            <div className="last-updated">
              Senast uppdaterad: {companyData.lastUpdated.toLocaleString('sv-SE')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
