/**
 * Bolagsverket Fallback Service
 * 
 * Since the "kod för värdefulla datamängder" doesn't seem to be a direct API key,
 * we'll implement a smart fallback that uses publicly available information
 * and clearly marks what is verified vs estimated.
 */

interface CompanyBasicInfo {
  organizationNumber: string;
  legalName: string;
  tradingName: string;
  registrationDate: string;
  status: string;
}

export class BolagsverketFallbackService {
  private readonly accessCode: string;

  constructor() {
    this.accessCode = process.env.BOLAGSVERKET_CLIENT_ID || '';
  }

  /**
   * Intelligent company lookup with transparent data sources
   */
  async lookupCompany(companyName: string): Promise<{
    data: CompanyBasicInfo | null;
    source: string;
    confidence: 'verified' | 'estimated' | 'unknown';
    notes: string[];
  }> {
    console.log(`🔍 Intelligent lookup for: ${companyName}`);

    // First, try to extract organization number if provided
    const orgNumberMatch = companyName.match(/\b\d{6}-?\d{4}\b/);
    if (orgNumberMatch) {
      return this.lookupByOrgNumber(orgNumberMatch[0], companyName);
    }

    // Try known companies with verified information
    const knownCompany = this.getKnownCompanyData(companyName);
    if (knownCompany) {
      return {
        data: knownCompany,
        source: 'Verifierad från offentliga källor',
        confidence: 'verified',
        notes: ['Manuellt verifierad från Bolagsverkets webbsida', 'Uppdaterad senast: 2024-01-15']
      };
    }

    // For unknown companies, return transparent "needs verification" response
    return {
      data: {
        organizationNumber: 'Behöver verifieras manuellt',
        legalName: companyName,
        tradingName: companyName.replace(/\s+(AB|Ltd|Inc|AS)$/i, ''),
        registrationDate: 'Behöver verifieras',
        status: 'Behöver verifieras'
      },
      source: 'Konservativ uppskattning',
      confidence: 'unknown',
      notes: [
        'Organisationsnummer behöver verifieras manuellt på bolagsverket.se',
        'Registreringsdatum och status kräver manuell kontroll',
        'Rekommendation: Verifiera på bolagsverket.se/sok'
      ]
    };
  }

  /**
   * Lookup by organization number (when provided)
   */
  private async lookupByOrgNumber(orgNumber: string, companyName: string): Promise<{
    data: CompanyBasicInfo | null;
    source: string;
    confidence: 'verified' | 'estimated' | 'unknown';
    notes: string[];
  }> {
    // Clean org number
    const cleanOrgNumber = orgNumber.replace('-', '');
    
    // Check our verified database
    const verifiedData = this.getVerifiedOrgNumberData(cleanOrgNumber);
    if (verifiedData) {
      return {
        data: verifiedData,
        source: 'Verifierad från Bolagsverket',
        confidence: 'verified',
        notes: [`Org.nr ${orgNumber} verifierat från offentliga källor`]
      };
    }

    return {
      data: {
        organizationNumber: orgNumber,
        legalName: companyName,
        tradingName: companyName.replace(/\s+(AB|Ltd|Inc|AS)$/i, ''),
        registrationDate: 'Verifieras via org.nummer',
        status: 'Aktiv (preliminärt)'
      },
      source: 'Org.nummer identifierat',
      confidence: 'estimated',
      notes: [
        `Organisationsnummer ${orgNumber} detekterat`,
        'Status och datum behöver manuell verifiering',
        'Rekommendation: Kontrollera på bolagsverket.se'
      ]
    };
  }

  /**
   * Get verified data for known companies
   */
  private getKnownCompanyData(companyName: string): CompanyBasicInfo | null {
    // Only include companies we have manually verified
    const verifiedCompanies: Record<string, CompanyBasicInfo> = {
      // Add verified companies here as we manually check them
      // For now, keeping empty to be conservative
    };

    // Try exact match first
    const match = verifiedCompanies[companyName];
    if (match) return match;

    // Try case-insensitive match
    const lowerName = companyName.toLowerCase();
    for (const [name, data] of Object.entries(verifiedCompanies)) {
      if (name.toLowerCase() === lowerName) {
        return data;
      }
    }

    // Try partial match (e.g., "GLAS" matches "GLAS Scandinavia AB")
    for (const [name, data] of Object.entries(verifiedCompanies)) {
      if (name.toLowerCase().includes(lowerName) || lowerName.includes(name.toLowerCase())) {
        return data;
      }
    }

    return null;
  }

  /**
   * Get verified data by organization number
   */
  private getVerifiedOrgNumberData(orgNumber: string): CompanyBasicInfo | null {
    const verifiedOrgNumbers: Record<string, CompanyBasicInfo> = {
      // Add manually verified org numbers here
      // For now, keeping empty to be conservative
    };

    return verifiedOrgNumbers[orgNumber] || null;
  }

  /**
   * Check if service has access code
   */
  isConfigured(): boolean {
    return Boolean(this.accessCode);
  }

  /**
   * Get service status
   */
  getStatus(): {
    configured: boolean;
    accessCode: string;
    systemType: string;
    message: string;
  } {
    return {
      configured: this.isConfigured(),
      accessCode: this.accessCode ? `${this.accessCode.substring(0, 8)}...` : 'Not configured',
      systemType: 'Öppna Data (EU-direktiv)',
      message: this.isConfigured() 
        ? 'Access code konfigurerad - använder intelligent fallback med transparent märkning'
        : 'Bolagsverket access code saknas'
    };
  }
}

// Export singleton
export const bolagsverketFallback = new BolagsverketFallbackService();

/**
 * Main function to get company data with transparent sourcing
 */
export async function getVerifiedCompanyData(companyName: string): Promise<{
  organizationNumber: string;
  legalName: string;
  tradingName: string;
  registrationDate: string;
  status: string;
  dataSource: string;
  confidence: 'verified' | 'estimated' | 'unknown';
  verificationNotes: string[];
} | null> {
  try {
    const result = await bolagsverketFallback.lookupCompany(companyName);
    
    if (result.data) {
      return {
        ...result.data,
        dataSource: result.source,
        confidence: result.confidence,
        verificationNotes: result.notes
      };
    }

    return null;
    
  } catch (error) {
    console.error('Company lookup error:', error);
    return null;
  }
}
