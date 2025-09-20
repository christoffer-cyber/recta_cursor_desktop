import { NextRequest, NextResponse } from 'next/server';
import { findCompanyInBolagsverket } from '@/lib/bolagsverket-api';

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();
    
    if (!companyName) {
      return NextResponse.json({
        success: false,
        error: 'Company name is required'
      }, { status: 400 });
    }

    console.log(`🔍 API: Searching for company: ${companyName}`);
    
    const companyData = await findCompanyInBolagsverket(companyName);
    
    if (companyData) {
      return NextResponse.json({
        success: true,
        data: companyData,
        source: 'Bolagsverket Official API'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Company not found in Bolagsverket',
        message: 'This could be due to: 1) Company name not matching exactly, 2) API not configured, or 3) Company not registered in Sweden'
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error('Bolagsverket search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search company in Bolagsverket'
    }, { status: 500 });
  }
}

