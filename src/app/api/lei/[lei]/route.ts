import { NextRequest, NextResponse } from 'next/server';
import {
  lookupByLEI,
  getChildEntities,
  validateLEI,
} from '@/lib/services/gleif';
import { searchABSFilings } from '@/lib/services/secEdgar';
import { searchSecurities } from '@/lib/services/openfigi';

interface RouteParams {
  params: Promise<{ lei: string }>;
}

/**
 * GET /api/lei/[lei]
 *
 * Look up entity by LEI (Legal Entity Identifier) or GMEI
 *
 * Returns:
 * - Entity information
 * - Parent/child relationships
 * - Associated securities and debt
 *
 * Query params:
 * - include: 'subsidiaries' | 'securities' | 'all' - Additional data to include
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { lei } = await context.params;
    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include') || 'all';

    // Validate LEI format
    if (!lei || lei.length !== 20) {
      return NextResponse.json(
        { error: 'Invalid LEI. Must be exactly 20 alphanumeric characters.' },
        { status: 400 }
      );
    }

    if (!validateLEI(lei)) {
      return NextResponse.json(
        { error: 'Invalid LEI checksum. Please verify the LEI is correct.' },
        { status: 400 }
      );
    }

    // Lookup entity
    const result = await lookupByLEI(lei);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'LEI not found' },
        { status: 404 }
      );
    }

    const response: any = {
      entity: result.data,
      relationships: result.relationships || [],
    };

    // Get subsidiaries if requested
    if (include === 'subsidiaries' || include === 'all') {
      const subsidiaries = await getChildEntities(lei);
      response.subsidiaries = subsidiaries;
    }

    // Search for associated securities and debt
    if (include === 'securities' || include === 'all') {
      const entityName = result.data.entity.legalName;

      // Search SEC for filings by this entity
      const secFilings = await searchABSFilings(entityName);
      response.secFilings = secFilings.data || [];

      // Search OpenFIGI for securities
      const securities = await searchSecurities(entityName, 20);
      response.securities = securities;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('LEI lookup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lookup failed' },
      { status: 500 }
    );
  }
}
