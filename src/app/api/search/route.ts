import { NextRequest, NextResponse } from 'next/server';
import { searchTrustsOnline, lookupMultipleSecurities } from '@/lib/services';

/**
 * GET /api/search
 *
 * Search for ABS/MBS securities and trusts
 *
 * Query params:
 * - q: string - Search query
 * - type: 'trusts' | 'securities' - Type of search
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'trusts';

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters.' },
        { status: 400 }
      );
    }

    const results = await searchTrustsOnline(query);

    return NextResponse.json({
      query,
      type,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/search
 *
 * Batch lookup multiple CUSIPs
 *
 * Body:
 * - cusips: string[] - Array of CUSIPs to lookup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cusips } = body;

    if (!cusips || !Array.isArray(cusips) || cusips.length === 0) {
      return NextResponse.json(
        { error: 'cusips array is required' },
        { status: 400 }
      );
    }

    if (cusips.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 CUSIPs per request' },
        { status: 400 }
      );
    }

    const results = await lookupMultipleSecurities(cusips);

    return NextResponse.json({
      count: results.size,
      results: Object.fromEntries(results),
    });
  } catch (error) {
    console.error('Batch lookup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch lookup failed' },
      { status: 500 }
    );
  }
}
