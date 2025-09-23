'use client';

import { useState, useEffect } from 'react';

interface ArenaSession {
  session_id: string;
  created_at: string;
  updated_at: string;
  current_cluster: string | null;
  clusters_data: Record<string, unknown>;
  messages: Array<{ role: string; content: string }>;
  messages_count: number;
  is_complete: boolean;
  duration: number;
  last_message: string;
  contradictions_found: string[];
  overall_confidence: number;
}

export default function SessionsAdminPage() {
  const [sessions, setSessions] = useState<ArenaSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ArenaSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalSessions: number;
    completedSessions: number;
    averageMessages: number;
    averageDuration: number;
  } | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
      setStats({
        totalSessions: data.totalSessions || 0,
        completedSessions: data.completedSessions || 0,
        averageMessages: data.averageMessages || 0,
        averageDuration: data.averageDuration || 0
      });
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const copySessionData = (session: ArenaSession) => {
    const sessionData = {
      session,
      exportTimestamp: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(sessionData, null, 2));
    alert('Session data copied to clipboard!');
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('sv-SE');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Arena Sessions Admin</h1>
          <div className="text-center">Loading sessions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Arena Sessions Admin</h1>
        
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Sessions</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalSessions}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completedSessions}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Avg Messages</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.averageMessages}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Avg Duration</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.averageDuration}s</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sessions List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Recent Sessions</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No sessions found. Start a conversation in Arena to see session data.
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.session_id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedSession?.session_id === session.session_id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {session.session_id.substring(0, 8)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(session.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          session.is_complete 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {session.is_complete ? 'Complete' : 'In Progress'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {session.messages_count} msgs • {formatDuration(session.duration)}
                        </p>
                      </div>
                    </div>
                    {session.current_cluster && (
                      <p className="text-xs text-gray-600 mt-1">
                        Cluster: {session.current_cluster} ({session.overall_confidence}%)
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Session Details */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Session Details</h2>
            </div>
            <div className="p-6">
              {selectedSession ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Session Info</h3>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p><strong>ID:</strong> {selectedSession.session_id}</p>
                      <p><strong>Created:</strong> {formatDate(selectedSession.created_at)}</p>
                      <p><strong>Duration:</strong> {formatDuration(selectedSession.duration)}</p>
                      <p><strong>Messages:</strong> {selectedSession.messages_count}</p>
                      <p><strong>Status:</strong> {selectedSession.is_complete ? 'Complete' : 'In Progress'}</p>
                      <p><strong>Current Cluster:</strong> {selectedSession.current_cluster || 'None'}</p>
                      <p><strong>Overall Confidence:</strong> {selectedSession.overall_confidence}%</p>
                    </div>
                  </div>

                  {selectedSession.contradictions_found.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900">Contradictions Found</h3>
                      <ul className="mt-2 text-sm text-red-600">
                        {selectedSession.contradictions_found.map((contradiction, index) => (
                          <li key={index}>• {contradiction}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium text-gray-900">Clusters Data</h3>
                    <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedSession.clusters_data, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">Messages ({selectedSession.messages?.length || 0})</h3>
                    <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
                      {selectedSession.messages?.map((message, index) => (
                        <div key={index} className="text-xs border rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`font-medium ${
                              message.role === 'user' ? 'text-blue-600' : 'text-green-600'
                            }`}>
                              {message.role.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-700">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => copySessionData(selectedSession)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                  >
                    Copy Session Data to Clipboard
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">Select a session to view details</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
