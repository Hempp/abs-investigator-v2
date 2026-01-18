import { NextRequest, NextResponse } from 'next/server';
import { performEnhancedInvestigation, quickInvestigation } from '@/lib/services';
import { DebtTypeId } from '@/types';

/**
 * POST /api/investigate/enhanced
 *
 * Perform comprehensive multi-source investigation
 * Queries: SEC EDGAR, OpenFIGI, CFPB, FRED, FINRA TRACE
 *
 * Body:
 * - debtType: DebtTypeId - Type of debt
 * - servicerName: string - Current servicer
 * - originalCreditor: string - Original creditor (optional)
 * - accountNumber: string - Account number (optional)
 * - state: string - State (optional)
 * - approximateBalance: number - Approximate balance (optional)
 * - quick: boolean - Quick investigation mode (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      debtType,
      servicerName,
      originalCreditor,
      accountNumber,
      state,
      approximateBalance,
      quick,
    } = body;

    if (!debtType) {
      return NextResponse.json(
        { error: 'debtType is required' },
        { status: 400 }
      );
    }

    // Validate debt type
    const validDebtTypes: DebtTypeId[] = [
      'mortgage', 'auto', 'creditCard', 'studentLoan',
      'medical', 'utility', 'telecom', 'personalLoan'
    ];

    if (!validDebtTypes.includes(debtType)) {
      return NextResponse.json(
        { error: `Invalid debtType. Must be one of: ${validDebtTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!servicerName && !originalCreditor) {
      return NextResponse.json(
        { error: 'Either servicerName or originalCreditor is required' },
        { status: 400 }
      );
    }

    // Quick mode for faster results
    if (quick) {
      const result = await quickInvestigation(
        servicerName || originalCreditor || '',
        debtType as DebtTypeId
      );

      return NextResponse.json({
        mode: 'quick',
        ...result,
        dataSources: ['SEC EDGAR', 'OpenFIGI', 'CFPB'],
      });
    }

    // Full enhanced investigation
    const result = await performEnhancedInvestigation({
      debtType: debtType as DebtTypeId,
      servicerName,
      originalCreditor,
      accountNumber,
      state,
      approximateBalance,
    });

    return NextResponse.json({
      mode: 'enhanced',
      ...result,
    });
  } catch (error) {
    console.error('Enhanced investigation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Investigation failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/investigate/enhanced
 *
 * Quick investigation via query params
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const servicerName = searchParams.get('servicer');
    const debtType = searchParams.get('type') as DebtTypeId || 'mortgage';

    if (!servicerName) {
      return NextResponse.json(
        { error: 'servicer query param is required' },
        { status: 400 }
      );
    }

    const result = await quickInvestigation(servicerName, debtType);

    return NextResponse.json({
      mode: 'quick',
      servicer: servicerName,
      debtType,
      ...result,
      dataSources: ['SEC EDGAR', 'OpenFIGI', 'CFPB'],
    });
  } catch (error) {
    console.error('Quick investigation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Investigation failed' },
      { status: 500 }
    );
  }
}
