/**
 * SEC Company Details API Route
 *
 * GET /api/sec/company/[cik]
 *
 * Fetches company details from SEC EDGAR by CIK.
 * Includes EIN, state of incorporation, and recent filings.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyByCIK } from '@/lib/services/secEdgar';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cik: string }> }
) {
  try {
    const { cik } = await params;

    if (!cik) {
      return NextResponse.json(
        { error: 'CIK is required' },
        { status: 400 }
      );
    }

    // Validate CIK format
    if (!/^\d{1,10}$/.test(cik)) {
      return NextResponse.json(
        { error: 'Invalid CIK format. Must be 1-10 digits.' },
        { status: 400 }
      );
    }

    const company = await getCompanyByCIK(cik);

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('SEC company lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company details' },
      { status: 500 }
    );
  }
}
