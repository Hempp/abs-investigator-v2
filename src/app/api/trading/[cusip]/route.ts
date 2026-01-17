import { NextRequest, NextResponse } from 'next/server';
import { getTradingData } from '@/lib/services';

interface RouteParams {
  params: Promise<{ cusip: string }>;
}

/**
 * GET /api/trading/[cusip]
 *
 * Get trading data for a CUSIP from FINRA TRACE
 *
 * Query params:
 * - start: string - Start date (YYYY-MM-DD)
 * - end: string - End date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { cusip } = await context.params;
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!cusip || cusip.length < 6) {
      return NextResponse.json(
        { error: 'Invalid CUSIP. Must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const dateRange = start && end ? { start, end } : undefined;
    const tradingData = await getTradingData(cusip, dateRange);

    return NextResponse.json(tradingData);
  } catch (error) {
    console.error('Trading data error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch trading data' },
      { status: 500 }
    );
  }
}
