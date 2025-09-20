'use client';

import { useState, useEffect } from 'react';

interface BolagsverketStatus {
  configured: boolean;
  authenticated: boolean;
  tokenExpiresIn: number;
  message: string;
}

interface CompanyData {
  organizationNumber: string;
  legalName: string;
  tradingName: string;
  registrationDate: string;
  status: string;
}

export default function BolagsverketAdmin() {
  const [status, setStatus] = useState<BolagsverketStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<CompanyData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/bolagsverket/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch Bolagsverket status');
      console.error('Status fetch error:', err);
    }
  };

  const searchCompany = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    setSearchResult(null);
    
    try {
      const response = await fetch('/api/bolagsverket/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName: searchQuery }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResult(data.data);
      } else {
        setError(data.error || data.message);
      }
    } catch (err) {
      setError('Failed to search company');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchCompany();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Bolagsverket API Administration
          </h1>

          {/* API Status Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">API Status</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              {status ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Configured:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      status.configured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status.configured ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Authenticated:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      status.authenticated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {status.authenticated ? '✅ Yes' : '⏳ Not yet'}
                    </span>
                  </div>
                  {status.authenticated && (
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Token expires in:</span>
                      <span className="text-gray-600">
                        {Math.round(status.tokenExpiresIn / 1000 / 60)} minutes
                      </span>
                    </div>
                  )}
                  <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <p className="text-blue-800">{status.message}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading status...</p>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Instructions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration</h2>
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-400">
              <h3 className="font-semibold text-blue-800 mb-2">Bolagsverket Öppna Data Konfiguration:</h3>
              <div className="space-y-3 text-blue-700">
                <p>✅ Du har nu en &quot;kod för värdefulla datamängder&quot; konfigurerad</p>
                <p>📋 Detta är Bolagsverkets nya system enligt EU:s öppna data-direktiv</p>
                <p>🔍 Systemet kommer att testa olika endpoints för att hitta rätt integration</p>
              </div>
              <div className="mt-3 bg-blue-100 p-3 rounded">
                <strong>Status:</strong> Access code konfigurerad, testar endpoints automatiskt
              </div>
            </div>
          </div>

          {/* Company Search Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Company Search</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter company name (e.g., GLAS Scandinavia AB)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={searchCompany}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Search Result */}
              {searchResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Company Found ✅</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Legal Name:</span>
                      <p className="text-gray-900">{searchResult.legalName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Trading Name:</span>
                      <p className="text-gray-900">{searchResult.tradingName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Org. Number:</span>
                      <p className="text-gray-900 font-mono">{searchResult.organizationNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <p className="text-gray-900">{searchResult.status}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Registration Date:</span>
                      <p className="text-gray-900">{searchResult.registrationDate}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Example Companies */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Examples</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-3">Try searching for these Swedish companies:</p>
              <div className="flex flex-wrap gap-2">
                {['GLAS Scandinavia AB', 'Redhead AB', 'Spotify AB', 'Klarna AB'].map((company) => (
                  <button
                    key={company}
                    onClick={() => setSearchQuery(company)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
