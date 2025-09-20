/**
 * Bolagsverket Open Data Integration
 * 
 * This service handles the new "värdefulla datamängder" (valuable datasets) 
 * system from Bolagsverket according to EU open data directive.
 * 
 * Instead of OAuth2 API, this uses the access code system.
 */

interface BolagsverketOpenDataResponse {
  success: boolean;
  data?: {
    organisationsnummer: string;
    namn: string;
    juridiskForm: string;
    registreringsdatum: string;
    status: string;
    adress?: string;
    postort?: string;
    postnummer?: string;
  };
  error?: string;
}

export class BolagsverketOpenData {
  private readonly accessCode: string;
  private readonly baseUrl = 'https://data.bolagsverket.se'; // Hypothetical open data endpoint

  constructor() {
    this.accessCode = process.env.BOLAGSVERKET_CLIENT_ID || ''; // Using CLIENT_ID for the access code
    
    if (!this.accessCode) {
      console.warn('⚠️ Bolagsverket access code not configured');
    } else {
      console.log('✅ Bolagsverket access code configured');
    }
  }

  /**
   * Search for company using the access code system
   */
  async searchCompany(companyName: string): Promise<BolagsverketOpenDataResponse> {
    try {
      console.log(`🔍 Searching Bolagsverket open data for: ${companyName}`);

      if (!this.accessCode) {
        return {
          success: false,
          error: 'Access code not configured'
        };
      }

      // Try different possible endpoints for the open data system
      const possibleEndpoints = [
        `${this.baseUrl}/api/v1/foretagsuppgifter/search`,
        `${this.baseUrl}/opendata/v1/companies/search`,
        `${this.baseUrl}/v1/search`,
        `https://opendata.bolagsverket.se/api/companies/search`
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`📡 Trying endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.accessCode}`,
              'Content-Type': 'application/json',
              'User-Agent': 'Recta-CompanyIntelligence/1.0'
            },
            // Add search parameters
            signal: AbortSignal.timeout(10000)
          });

          console.log(`📊 Response status: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Successfully fetched data from ${endpoint}`);
            
            return {
              success: true,
              data: this.normalizeCompanyData(data, companyName)
            };
          } else {
            console.log(`❌ Endpoint ${endpoint} failed: ${response.status}`);
          }
          
        } catch (endpointError) {
          console.log(`❌ Endpoint ${endpoint} error:`, endpointError instanceof Error ? endpointError.message : 'Unknown error');
        }
      }

      // If all endpoints fail, return structured error
      return {
        success: false,
        error: 'Could not connect to Bolagsverket open data service. This could be due to: 1) Incorrect access code, 2) Service not yet available, or 3) Different authentication method required.'
      };

    } catch (error) {
      console.error('Bolagsverket open data error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Normalize company data from various possible response formats
   */
  private normalizeCompanyData(rawData: unknown, searchTerm: string): BolagsverketOpenDataResponse['data'] {
    // Handle different possible response structures
    const data = rawData as Record<string, unknown>;
    const companies = data?.companies as unknown[];
    const dataArray = data?.data as unknown[];
    const resultArray = data?.result as unknown[];
    const company = companies?.[0] || dataArray?.[0] || resultArray?.[0] || data;
    
    if (!company) {
      return undefined;
    }

    const companyData = company as Record<string, unknown>;
    
    return {
      organisationsnummer: (companyData.organisationsnummer || companyData.orgNumber || companyData.id || 'Unknown') as string,
      namn: (companyData.namn || companyData.name || companyData.companyName || searchTerm) as string,
      juridiskForm: (companyData.juridiskForm || companyData.legalForm || 'Unknown') as string,
      registreringsdatum: (companyData.registreringsdatum || companyData.registrationDate || 'Unknown') as string,
      status: (companyData.status || companyData.companyStatus || 'Unknown') as string,
      adress: companyData.adress as string || companyData.address as string || undefined,
      postort: companyData.postort as string || companyData.city as string || undefined,
      postnummer: companyData.postnummer as string || companyData.zipCode as string || undefined
    };
  }

  /**
   * Check if the service is configured
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
    message: string;
  } {
    return {
      configured: this.isConfigured(),
      accessCode: this.accessCode ? `${this.accessCode.substring(0, 8)}...` : 'Not set',
      message: this.isConfigured() 
        ? 'Bolagsverket access code is configured'
        : 'Bolagsverket access code not configured'
    };
  }
}

// Export singleton
export const bolagsverketOpenData = new BolagsverketOpenData();

/**
 * Helper function to search for company using open data system
 */
export async function searchCompanyOpenData(companyName: string): Promise<{
  organizationNumber: string;
  legalName: string;
  tradingName: string;
  registrationDate: string;
  status: string;
} | null> {
  try {
    const result = await bolagsverketOpenData.searchCompany(companyName);
    
    if (result.success && result.data) {
      return {
        organizationNumber: result.data.organisationsnummer,
        legalName: result.data.namn,
        tradingName: result.data.namn.replace(' AB', '').replace(' Ltd', ''),
        registrationDate: result.data.registreringsdatum,
        status: result.data.status
      };
    }

    console.log(`❌ Open data search failed: ${result.error}`);
    return null;
    
  } catch (error) {
    console.error('Open data search error:', error);
    return null;
  }
}
