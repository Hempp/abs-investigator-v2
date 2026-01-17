import { NextRequest, NextResponse } from 'next/server';
import { getIssuerInfo, getCompanyByCIK } from '@/lib/services';

interface RouteParams {
  params: Promise<{ identifier: string }>;
}

/**
 * GET /api/company/[identifier]
 *
 * Get company/issuer information
 *
 * The identifier can be:
 * - CIK number (e.g., "0001234567")
 * - Company name
 *
 * Query params:
 * - type: 'cik' | 'name' - Type of identifier (default: auto-detect)
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { identifier } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!identifier || identifier.length < 2) {
      return NextResponse.json(
        { error: 'Invalid identifier. Must be at least 2 characters.' },
        { status: 400 }
      );
    }

    // Auto-detect if it's a CIK (all digits)
    const isCIK = type === 'cik' || /^\d+$/.test(identifier);

    if (isCIK) {
      const company = await getCompanyByCIK(identifier);
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ company, source: 'sec' });
    } else {
      const issuerInfo = await getIssuerInfo(identifier);
      return NextResponse.json(issuerInfo);
    }
  } catch (error) {
    console.error('Company lookup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lookup failed' },
      { status: 500 }
    );
  }
}
