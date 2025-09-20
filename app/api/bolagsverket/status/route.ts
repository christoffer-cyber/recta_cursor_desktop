import { NextResponse } from 'next/server';
import { bolagsverketAPI } from '@/lib/bolagsverket-api';

export async function GET() {
  try {
    const status = bolagsverketAPI.getStatus();
    
    return NextResponse.json({
      success: true,
      status: {
        configured: status.configured,
        authenticated: status.authenticated,
        tokenExpiresIn: status.tokenExpiresIn,
        message: status.configured 
          ? 'Bolagsverket API is configured and ready'
          : 'Bolagsverket API credentials not configured. Add BOLAGSVERKET_CLIENT_ID and BOLAGSVERKET_CLIENT_SECRET to environment variables.'
      }
    });
  } catch (error) {
    console.error('Bolagsverket status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get Bolagsverket API status'
    }, { status: 500 });
  }
}

