'use client';

import { useState } from 'react';

interface RAGStats {
  totalChunks: number;
  domains: Record<string, number>;
  lastUpdated: number | null;
  message?: string;
}

interface RAGResponse {
  answer: string;
  sources: Array<{
    metadata: {
      source: string;
      domain: string;
      role?: string;
      industry?: string;
    };
  }>;
  confidence: number;
}

export default function RAGAdminPage() {
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [query, setQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState<RAGResponse | null>(null);
  const [context, setContext] = useState({
    industry: '',
    role: '',
    companySize: '',
    stage: ''
  });

  const loadStats = async () => {
    try {
      const response = await fetch('/api/rag/initialize');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const initializeRAG = async () => {
    setIsInitializing(true);
    try {
      const response = await fetch('/api/rag/initialize', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        alert('RAG system initialized successfully!');
      } else {
        alert('Failed to initialize RAG system: ' + data.error);
      }
    } catch (error) {
      console.error('Error initializing RAG:', error);
      alert('Error initializing RAG system');
    } finally {
      setIsInitializing(false);
    }
  };

  const testQuery = async () => {
    if (!query.trim()) return;
    
    setIsQuerying(true);
    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: query,
          context: Object.fromEntries(
            Object.entries(context).filter(([, value]) => value.trim() !== '')
          )
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQueryResponse(data.data);
      } else {
        alert('Query failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error querying RAG:', error);
      alert('Error querying RAG system');
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">RAG System Administration</h1>
        
        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">System Status</h2>
            <button
              onClick={loadStats}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Stats
            </button>
          </div>
          
          {stats ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Knowledge Chunks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalChunks}</p>
              </div>
              
              {stats.totalChunks > 0 ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Knowledge Domains</p>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(stats.domains).map(([domain, count]) => (
                        <div key={domain} className="bg-gray-50 p-3 rounded">
                          <p className="font-medium capitalize">{domain.replace('-', ' ')}</p>
                          <p className="text-lg font-semibold text-blue-600">{count} chunks</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {stats.lastUpdated && (
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-gray-900">
                        {new Date(stats.lastUpdated).toLocaleString('sv-SE')}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">{stats.message || 'RAG system not initialized'}</p>
                  <button
                    onClick={initializeRAG}
                    disabled={isInitializing}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isInitializing ? 'Initializing...' : 'Initialize RAG System'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Click &quot;Refresh Stats&quot; to load system status</p>
            </div>
          )}
        </div>

        {/* Query Testing Section */}
        {stats && stats.totalChunks > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test RAG Queries</h2>
            
            {/* Context Inputs */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={context.industry}
                  onChange={(e) => setContext({...context, industry: e.target.value})}
                  placeholder="e.g., E-commerce"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={context.role}
                  onChange={(e) => setContext({...context, role: e.target.value})}
                  placeholder="e.g., CFO"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                <input
                  type="text"
                  value={context.companySize}
                  onChange={(e) => setContext({...context, companySize: e.target.value})}
                  placeholder="e.g., 50-100 employees"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Growth Stage</label>
                <input
                  type="text"
                  value={context.stage}
                  onChange={(e) => setContext({...context, stage: e.target.value})}
                  placeholder="e.g., Scale-up"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Query Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about recruitment, roles, or industry insights..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={testQuery}
              disabled={isQuerying || !query.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isQuerying ? 'Querying...' : 'Test Query'}
            </button>
            
            {/* Response Display */}
            {queryResponse && (
              <div className="mt-6 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-blue-900">RAG Response</h3>
                    <span className="text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      Confidence: {Math.round(queryResponse.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-blue-800 whitespace-pre-wrap">{queryResponse.answer}</p>
                </div>
                
                {queryResponse.sources.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Sources ({queryResponse.sources.length})</h3>
                    <div className="space-y-2">
                      {queryResponse.sources.map((source, index) => (
                        <div key={index} className="text-sm bg-white p-2 rounded border">
                          <p className="font-medium">{source.metadata.source}</p>
                          <p className="text-gray-600">
                            Domain: {source.metadata.domain}
                            {source.metadata.role && ` • Role: ${source.metadata.role}`}
                            {source.metadata.industry && ` • Industry: ${source.metadata.industry}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
