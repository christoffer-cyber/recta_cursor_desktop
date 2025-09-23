import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple file-based session storage
const SESSIONS_DIR = path.join(process.cwd(), 'sessions');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    // Ensure sessions directory exists
    try {
      await fs.mkdir(SESSIONS_DIR, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    if (sessionId) {
      // Get specific session
      try {
        const sessionFile = path.join(SESSIONS_DIR, `${sessionId}.json`);
        const sessionData = await fs.readFile(sessionFile, 'utf8');
        const session = JSON.parse(sessionData);
        
        return NextResponse.json({
          session,
          totalMessages: session.messages?.length || 0
        });
      } catch (error) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
    } else {
      // Get all sessions
      try {
        const files = await fs.readdir(SESSIONS_DIR);
        const sessionFiles = files.filter(file => file.endsWith('.json'));
        
        const sessions = [];
        for (const file of sessionFiles) {
          try {
            const filePath = path.join(SESSIONS_DIR, file);
            const data = await fs.readFile(filePath, 'utf8');
            const session = JSON.parse(data);
            sessions.push(session);
          } catch (error) {
            console.error(`Error reading session file ${file}:`, error);
          }
        }
        
        // Sort by creation time (newest first)
        sessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        return NextResponse.json({
          sessions,
          totalSessions: sessions.length,
          completedSessions: sessions.filter(s => s.is_complete).length,
          averageMessages: Math.round(sessions.reduce((sum, s) => sum + (s.messages?.length || 0), 0) / sessions.length) || 0,
          averageDuration: Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length / 1000) || 0
        });
      } catch (error) {
        return NextResponse.json({ 
          sessions: [],
          totalSessions: 0,
          completedSessions: 0,
          averageMessages: 0,
          averageDuration: 0
        });
      }
    }
  } catch (error) {
    console.error('Failed to get session data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, sessionData } = body;

    if (!sessionId || !sessionData) {
      return NextResponse.json({ error: 'Missing sessionId or sessionData' }, { status: 400 });
    }

    // Ensure sessions directory exists
    try {
      await fs.mkdir(SESSIONS_DIR, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    // Save session data
    const sessionFile = path.join(SESSIONS_DIR, `${sessionId}.json`);
    await fs.writeFile(sessionFile, JSON.stringify(sessionData, null, 2));

    return NextResponse.json({ success: true, message: 'Session data saved' });
  } catch (error) {
    console.error('Failed to save session data:', error);
    return NextResponse.json(
      { error: 'Failed to save session data' },
      { status: 500 }
    );
  }
}
