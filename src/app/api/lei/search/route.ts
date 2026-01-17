import { NextRequest, NextResponse } from 'next/server';
import {
  searchByName,
  searchByJurisdiction,
} from '@/lib/services/gleif';

/**
 * GET /api/lei/search
 *
 * Search for entities by name or jurisdiction
 *
 * Query params:
 * - q: string - Entity name to search
 * - jurisdiction: string - Country code (e.g., 'US', 'GB', 'DE')
 * - status: string - Entity status filter ('ACTIVE', 'INACTIVE')
 * - limit: number - Max results (default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const jurisdiction = searchParams.get('jurisdiction');
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query && !jurisdiction) {
      return NextResponse.json(
        { error: 'Search query (q) or jurisdiction is required.' },
        { status: 400 }
      );
    }

    let result;

    if (jurisdiction) {
      result = await searchByJurisdiction(jurisdiction, {
        name: query || undefined,
        status,
        limit,
      });
    } else if (query) {
      result = await searchByName(query, limit);
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: result.success,
      total: result.total,
      count: result.records.length,
      entities: result.records,
      error: result.error,
    });
  } catch (error) {
    console.error('LEI search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
