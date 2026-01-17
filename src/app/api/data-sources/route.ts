import { NextResponse } from 'next/server';
import { checkDataSources, BLOOMBERG_SETUP_GUIDE } from '@/lib/services';

/**
 * GET /api/data-sources
 *
 * Get status of all configured data sources
 */
export async function GET() {
  try {
    const sources = await checkDataSources();

    return NextResponse.json({
      sources,
      availableCount: sources.filter(s => s.available).length,
      totalCount: sources.length,
      bloombergGuide: sources.find(s => s.source === 'bloomberg')?.available
        ? undefined
        : BLOOMBERG_SETUP_GUIDE,
    });
  } catch (error) {
    console.error('Data sources check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check data sources' },
      { status: 500 }
    );
  }
}
