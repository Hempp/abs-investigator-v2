import { NextRequest, NextResponse } from 'next/server';
import { lookupSecurity, investigateCUSIP } from '@/lib/services';

interface RouteParams {
  params: Promise<{ cusip: string }>;
}

/**
 * GET /api/cusip/[cusip]
 *
 * Look up security information by CUSIP
 *
 * Query params:
 * - full: boolean - Include trading data and issuer info
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { cusip } = await context.params;
    const { searchParams } = new URL(request.url);
    const fullInvestigation = searchParams.get('full') === 'true';

    if (!cusip || cusip.length < 6) {
      return NextResponse.json(
        { error: 'Invalid CUSIP. Must be at least 6 characters.' },
        { status: 400 }
      );
    }

    if (fullInvestigation) {
      // Full investigation includes trading data and issuer info
      const result = await investigateCUSIP(cusip);
      return NextResponse.json(result);
    } else {
      // Just security lookup
      const security = await lookupSecurity(cusip);
      return NextResponse.json({ security });
    }
  } catch (error) {
    console.error('CUSIP lookup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lookup failed' },
      { status: 500 }
    );
  }
}
