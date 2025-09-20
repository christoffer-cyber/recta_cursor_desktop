/**
 * Bolagsverket API Integration
 * 
 * This service handles OAuth2 authentication and data fetching from 
 * the official Swedish Companies Registration Office (Bolagsverket) API.
 * 
 * API Documentation: https://bolagsverket.se/om/oppnadata/api
 * Authentication: OAuth2 Client Credentials Grant
 */

interface BolagsverketCompany {
  organisationsnummer: string;
  namn: string;
  registreringsdatum: string;
  status: string;
  juridiskForm: string;
  adress?: {
    postadress: string;
    postnummer: string;
    postort: string;
  };
  verksamhet?: {
    sniKod: string;
    beskrivning: string;
  };
  aktiekapital?: number;
  styrelse?: Array<{
    namn: string;
    roll: string;
  }>;
}

interface OAuth2Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export class BolagsverketAPI {
  private readonly baseUrl = 'https://api.bolagsverket.se';
  private readonly authUrl = 'https://portal.api.bolagsverket.se/oauth2/token';
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    // These would come from environment variables in production
    this.clientId = process.env.BOLAGSVERKET_CLIENT_ID || '';
    this.clientSecret = process.env.BOLAGSVERKET_CLIENT_SECRET || '';
    
    if (!this.clientId) {
      console.warn('⚠️ Bolagsverket API credentials not configured');
    } else if (!this.clientSecret) {
      console.log('ℹ️ Using Bolagsverket API key mode (no client secret)');
    }
  }

  /**
   * Authenticate with Bolagsverket using OAuth2 Client Credentials Grant
   */
  private async authenticate(): Promise<boolean> {
    try {
      console.log('🔐 Authenticating with Bolagsverket API...');

      if (!this.clientId || !this.clientSecret) {
        console.log('❌ Missing Bolagsverket credentials');
        return false;
      }

      const response = await fetch(this.authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials'
        })
      });

      if (!response.ok) {
        console.error(`❌ Authentication failed: ${response.status} ${response.statusText}`);
        return false;
      }

      const tokenData: OAuth2Token = await response.json();
      this.accessToken = tokenData.access_token;
      this.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000);

      console.log('✅ Successfully authenticated with Bolagsverket API');
      return true;

    } catch (error) {
      console.error('❌ Bolagsverket authentication error:', error);
      return false;
    }
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureValidToken(): Promise<boolean> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return true; // Token is still valid (with 1 minute buffer)
    }

    return await this.authenticate();
  }

  /**
   * Search for companies by name
   */
  async searchCompanies(companyName: string): Promise<BolagsverketCompany[]> {
    try {
      console.log(`🔍 Searching Bolagsverket for: ${companyName}`);

      if (!await this.ensureValidToken()) {
        console.log('❌ Could not authenticate with Bolagsverket');
        return [];
      }

      // Use the correct endpoint for company search
      const searchUrl = `${this.baseUrl}/hamta-arsredovisningsinformation/v1.4/sok?namn=${encodeURIComponent(companyName)}`;
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`❌ Search failed: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      console.log(`✅ Found ${data.length || 0} companies matching "${companyName}"`);
      
      return data.companies || [];

    } catch (error) {
      console.error('❌ Company search error:', error);
      return [];
    }
  }

  /**
   * Get detailed company information by organization number
   */
  async getCompanyByOrgNumber(orgNumber: string): Promise<BolagsverketCompany | null> {
    try {
      console.log(`🏢 Fetching company details for org number: ${orgNumber}`);

      if (!await this.ensureValidToken()) {
        console.log('❌ Could not authenticate with Bolagsverket');
        return null;
      }

      // Clean org number (remove spaces, dashes)
      const cleanOrgNumber = orgNumber.replace(/[\s-]/g, '');
      
      const companyUrl = `${this.baseUrl}/hamta-arsredovisningsinformation/v1.4/grunduppgifter/${cleanOrgNumber}`;
      const response = await fetch(companyUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`❌ Company not found: ${orgNumber}`);
          return null;
        }
        console.error(`❌ API request failed: ${response.status} ${response.statusText}`);
        return null;
      }

      const companyData: BolagsverketCompany = await response.json();
      console.log(`✅ Successfully fetched data for ${companyData.namn}`);
      
      return companyData;

    } catch (error) {
      console.error('❌ Company lookup error:', error);
      return null;
    }
  }

  /**
   * Convert Bolagsverket data to our internal format
   */
  convertToCompanyData(bolagsverketData: BolagsverketCompany): {
    organizationNumber: string;
    legalName: string;
    tradingName: string;
    registrationDate: string;
    status: string;
  } {
    return {
      organizationNumber: bolagsverketData.organisationsnummer,
      legalName: bolagsverketData.namn,
      tradingName: bolagsverketData.namn.replace(' AB', '').replace(' Ltd', ''),
      registrationDate: bolagsverketData.registreringsdatum,
      status: bolagsverketData.status === 'aktiv' ? 'Active' : bolagsverketData.status
    };
  }

  /**
   * Check if API is configured and available
   */
  isConfigured(): boolean {
    return Boolean(this.clientId); // Only require clientId, secret is optional
  }

  /**
   * Get API status for debugging
   */
  getStatus(): {
    configured: boolean;
    authenticated: boolean;
    tokenExpiresIn: number;
  } {
    return {
      configured: this.isConfigured(),
      authenticated: Boolean(this.accessToken && Date.now() < this.tokenExpiresAt),
      tokenExpiresIn: Math.max(0, this.tokenExpiresAt - Date.now())
    };
  }
}

// Export singleton instance
export const bolagsverketAPI = new BolagsverketAPI();

/**
 * Helper function to search for a company and return the best match
 */
export async function findCompanyInBolagsverket(companyName: string): Promise<{
  organizationNumber: string;
  legalName: string;
  tradingName: string;
  registrationDate: string;
  status: string;
} | null> {
  try {
    // First try to search by name
    const companies = await bolagsverketAPI.searchCompanies(companyName);
    
    if (companies.length === 0) {
      console.log(`❌ No companies found for "${companyName}"`);
      return null;
    }

    // Find the best match (exact name match preferred)
    const exactMatch = companies.find(c => 
      c.namn.toLowerCase() === companyName.toLowerCase() ||
      c.namn.toLowerCase().includes(companyName.toLowerCase())
    );

    const bestMatch = exactMatch || companies[0];
    
    // Get detailed information
    const detailedData = await bolagsverketAPI.getCompanyByOrgNumber(bestMatch.organisationsnummer);
    
    if (!detailedData) {
      console.log(`❌ Could not fetch detailed data for ${bestMatch.namn}`);
      return null;
    }

    return bolagsverketAPI.convertToCompanyData(detailedData);

  } catch (error) {
    console.error('❌ Error finding company in Bolagsverket:', error);
    return null;
  }
}
