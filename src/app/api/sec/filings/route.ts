import { NextRequest, NextResponse } from 'next/server';
import { searchABSFilings, getTrustFilings } from '@/lib/services';

/**
 * GET /api/sec/filings
 *
 * Search SEC EDGAR for ABS/MBS filings
 *
 * Query params:
 * - q: string - Search query (trust name, CUSIP, etc.)
 * - start: string - Start date (YYYY-MM-DD)
 * - end: string - End date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters.' },
        { status: 400 }
      );
    }

    const dateRange = start && end ? { start, end } : undefined;
    const result = await searchABSFilings(query, dateRange);

    return NextResponse.json(result);
  } catch (error) {
    console.error('SEC filings search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Filing search failed' },
      { status: 500 }
    );
  }
}
