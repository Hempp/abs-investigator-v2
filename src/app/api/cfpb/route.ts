import { NextRequest, NextResponse } from 'next/server';
import { searchCFPBComplaints, getCompanyComplaintSummary } from '@/lib/services';

/**
 * GET /api/cfpb
 *
 * Search CFPB Consumer Complaint Database
 *
 * Query params:
 * - company: string - Company name to search
 * - product: string - Product type (optional)
 * - state: string - State filter (optional)
 * - summary: boolean - Return summary stats only (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');
    const product = searchParams.get('product') || undefined;
    const state = searchParams.get('state') || undefined;
    const summaryOnly = searchParams.get('summary') === 'true';

    if (!company || company.length < 2) {
      return NextResponse.json(
        { error: 'Company name must be at least 2 characters.' },
        { status: 400 }
      );
    }

    if (summaryOnly) {
      const summary = await getCompanyComplaintSummary(company);
      return NextResponse.json({
        company,
        ...summary,
      });
    }

    const result = await searchCFPBComplaints(company, {
      product,
      state,
      size: 50,
    });

    return NextResponse.json({
      company,
      ...result,
    });
  } catch (error) {
    console.error('CFPB API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'CFPB search failed' },
      { status: 500 }
    );
  }
}
