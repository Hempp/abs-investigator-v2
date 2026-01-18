import { NextRequest, NextResponse } from 'next/server';
import { getEconomicContext, getDelinquencyTrends, getInterestRateEnvironment } from '@/lib/services';

/**
 * GET /api/economic
 *
 * Get economic context from Federal Reserve FRED
 *
 * Query params:
 * - type: 'context' | 'delinquency' | 'rates' - Type of data (default: context)
 * - debtType: string - For delinquency trends (mortgage, auto, creditCard, consumer)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'context';
    const debtType = searchParams.get('debtType') as 'mortgage' | 'auto' | 'creditCard' | 'consumer' || 'consumer';

    switch (type) {
      case 'delinquency':
        const trends = await getDelinquencyTrends(debtType, 24);
        return NextResponse.json({
          type: 'delinquency',
          debtType,
          trends,
          source: 'Federal Reserve FRED',
        });

      case 'rates':
        const rateEnv = await getInterestRateEnvironment();
        return NextResponse.json({
          type: 'rates',
          ...rateEnv,
          source: 'Federal Reserve FRED',
        });

      case 'context':
      default:
        const context = await getEconomicContext();
        return NextResponse.json({
          type: 'context',
          ...context,
          source: 'Federal Reserve FRED',
        });
    }
  } catch (error) {
    console.error('Economic API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Economic data fetch failed' },
      { status: 500 }
    );
  }
}
