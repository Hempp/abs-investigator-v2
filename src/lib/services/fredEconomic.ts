/**
 * Federal Reserve Economic Data (FRED) API Service
 *
 * Free public API for economic data. Useful for understanding
 * market conditions affecting ABS/MBS valuations.
 *
 * API Docs: https://fred.stlouisfed.org/docs/api/fred/
 */

const FRED_API = 'https://api.stlouisfed.org/fred';
const FRED_API_KEY = process.env.FRED_API_KEY || 'DEMO'; // Free key available at fred.stlouisfed.org

// Key economic series for ABS analysis
export const FRED_SERIES = {
  // Mortgage rates
  MORTGAGE30US: 'MORTGAGE30US',  // 30-Year Fixed Rate Mortgage Average
  MORTGAGE15US: 'MORTGAGE15US',  // 15-Year Fixed Rate Mortgage Average

  // Delinquency rates
  DRSFRMACBS: 'DRSFRMACBS',     // Delinquency Rate on Single-Family Mortgages
  DRALACBS: 'DRALACBS',         // Delinquency Rate on All Loans, All Commercial Banks
  DRCLACBS: 'DRCLACBS',         // Delinquency Rate on Consumer Loans
  DRCCLACBS: 'DRCCLACBS',       // Delinquency Rate on Credit Card Loans

  // Auto loan data
  TERMCBAUTO48NS: 'TERMCBAUTO48NS',  // Finance Rate on Consumer Installment Loans at Commercial Banks, New Autos 48 Month Loan
  DTCTLVEACBS: 'DTCTLVEACBS',        // Charge-Off Rate on Consumer Loans, Motor Vehicle Loans

  // Consumer credit
  TOTALSL: 'TOTALSL',           // Total Consumer Credit Owned and Securitized
  REVOLSL: 'REVOLSL',           // Revolving Consumer Credit Outstanding
  NONREVSL: 'NONREVSL',         // Nonrevolving Consumer Credit Outstanding

  // Housing market
  MSPUS: 'MSPUS',               // Median Sales Price of Houses Sold
  HOUST: 'HOUST',               // Housing Starts
  CSUSHPISA: 'CSUSHPISA',       // S&P/Case-Shiller U.S. National Home Price Index

  // Interest rates
  FEDFUNDS: 'FEDFUNDS',         // Federal Funds Rate
  DGS10: 'DGS10',               // 10-Year Treasury Constant Maturity Rate
  BAMLH0A0HYM2: 'BAMLH0A0HYM2', // ICE BofA US High Yield Index Option-Adjusted Spread
};

export interface FREDObservation {
  date: string;
  value: number | null;
}

export interface FREDSeries {
  seriesId: string;
  title: string;
  frequency: string;
  units: string;
  observations: FREDObservation[];
  lastValue?: number;
  lastDate?: string;
}

export interface EconomicContext {
  mortgageRate30Y: number | null;
  mortgageDelinquencyRate: number | null;
  consumerCreditTotal: number | null;
  housingPriceIndex: number | null;
  fedFundsRate: number | null;
  highYieldSpread: number | null;
  marketConditions: 'favorable' | 'neutral' | 'stressed';
  assessmentDate: string;
}

/**
 * Get FRED series data
 */
export async function getFREDSeries(
  seriesId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<FREDSeries | null> {
  try {
    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: FRED_API_KEY,
      file_type: 'json',
      sort_order: 'desc',
      limit: String(options?.limit || 10),
    });

    if (options?.startDate) {
      params.append('observation_start', options.startDate);
    }
    if (options?.endDate) {
      params.append('observation_end', options.endDate);
    }

    // Get series info
    const infoResponse = await fetch(`${FRED_API}/series?${new URLSearchParams({
      series_id: seriesId,
      api_key: FRED_API_KEY,
      file_type: 'json',
    })}`);

    // Get observations
    const obsResponse = await fetch(`${FRED_API}/series/observations?${params.toString()}`);

    if (!obsResponse.ok) {
      console.warn(`FRED API returned ${obsResponse.status} for series ${seriesId}`);
      return null;
    }

    const obsData = await obsResponse.json();
    let seriesInfo: any = { seriess: [{}] };

    if (infoResponse.ok) {
      seriesInfo = await infoResponse.json();
    }

    const observations: FREDObservation[] = (obsData.observations || [])
      .map((obs: any) => ({
        date: obs.date,
        value: obs.value === '.' ? null : parseFloat(obs.value),
      }))
      .filter((obs: FREDObservation) => obs.value !== null);

    const series = seriesInfo.seriess?.[0] || {};

    return {
      seriesId,
      title: series.title || seriesId,
      frequency: series.frequency || 'Unknown',
      units: series.units || 'Unknown',
      observations,
      lastValue: observations[0]?.value ?? undefined,
      lastDate: observations[0]?.date,
    };
  } catch (error) {
    console.error(`FRED series fetch error for ${seriesId}:`, error);
    return null;
  }
}

/**
 * Get current economic context for ABS analysis
 */
export async function getEconomicContext(): Promise<EconomicContext> {
  const today = new Date().toISOString().split('T')[0];

  // Fetch key indicators in parallel
  const [
    mortgageRate,
    mortgageDelinquency,
    consumerCredit,
    housingPrice,
    fedFunds,
    highYield,
  ] = await Promise.all([
    getFREDSeries(FRED_SERIES.MORTGAGE30US, { limit: 1 }),
    getFREDSeries(FRED_SERIES.DRSFRMACBS, { limit: 1 }),
    getFREDSeries(FRED_SERIES.TOTALSL, { limit: 1 }),
    getFREDSeries(FRED_SERIES.CSUSHPISA, { limit: 1 }),
    getFREDSeries(FRED_SERIES.FEDFUNDS, { limit: 1 }),
    getFREDSeries(FRED_SERIES.BAMLH0A0HYM2, { limit: 1 }),
  ]);

  // Assess market conditions
  let stressScore = 0;

  // High mortgage rates = stress
  if (mortgageRate?.lastValue && mortgageRate.lastValue > 7) stressScore += 2;
  else if (mortgageRate?.lastValue && mortgageRate.lastValue > 6) stressScore += 1;

  // High delinquency = stress
  if (mortgageDelinquency?.lastValue && mortgageDelinquency.lastValue > 5) stressScore += 2;
  else if (mortgageDelinquency?.lastValue && mortgageDelinquency.lastValue > 3) stressScore += 1;

  // High yield spread = stress
  if (highYield?.lastValue && highYield.lastValue > 500) stressScore += 2;
  else if (highYield?.lastValue && highYield.lastValue > 400) stressScore += 1;

  let marketConditions: 'favorable' | 'neutral' | 'stressed' = 'neutral';
  if (stressScore >= 4) marketConditions = 'stressed';
  else if (stressScore <= 1) marketConditions = 'favorable';

  return {
    mortgageRate30Y: mortgageRate?.lastValue || null,
    mortgageDelinquencyRate: mortgageDelinquency?.lastValue || null,
    consumerCreditTotal: consumerCredit?.lastValue || null,
    housingPriceIndex: housingPrice?.lastValue || null,
    fedFundsRate: fedFunds?.lastValue || null,
    highYieldSpread: highYield?.lastValue || null,
    marketConditions,
    assessmentDate: today,
  };
}

/**
 * Get delinquency trends for a specific debt type
 */
export async function getDelinquencyTrends(
  debtType: 'mortgage' | 'auto' | 'creditCard' | 'consumer',
  months: number = 24
): Promise<FREDObservation[]> {
  const seriesMap: Record<string, string> = {
    mortgage: FRED_SERIES.DRSFRMACBS,
    auto: FRED_SERIES.DTCTLVEACBS,
    creditCard: FRED_SERIES.DRCCLACBS,
    consumer: FRED_SERIES.DRCLACBS,
  };

  const seriesId = seriesMap[debtType] || FRED_SERIES.DRALACBS;
  const series = await getFREDSeries(seriesId, { limit: months });

  return series?.observations || [];
}

/**
 * Get interest rate environment
 */
export async function getInterestRateEnvironment(): Promise<{
  currentRates: Record<string, number | null>;
  trend: 'rising' | 'falling' | 'stable';
  impactOnABS: string;
}> {
  const [mortgage30, fed, treasury10] = await Promise.all([
    getFREDSeries(FRED_SERIES.MORTGAGE30US, { limit: 12 }),
    getFREDSeries(FRED_SERIES.FEDFUNDS, { limit: 12 }),
    getFREDSeries(FRED_SERIES.DGS10, { limit: 12 }),
  ]);

  // Determine trend from recent changes
  let trend: 'rising' | 'falling' | 'stable' = 'stable';

  if (fed?.observations && fed.observations.length >= 6) {
    const recent = fed.observations[0]?.value || 0;
    const sixMonthsAgo = fed.observations[5]?.value || 0;
    const change = recent - sixMonthsAgo;

    if (change > 0.5) trend = 'rising';
    else if (change < -0.5) trend = 'falling';
  }

  // Impact assessment
  let impactOnABS = '';
  if (trend === 'rising') {
    impactOnABS = 'Rising rates typically decrease ABS valuations and increase prepayment uncertainty for MBS.';
  } else if (trend === 'falling') {
    impactOnABS = 'Falling rates may increase prepayment speeds on mortgages, affecting MBS cash flows.';
  } else {
    impactOnABS = 'Stable rate environment generally supports predictable ABS cash flows.';
  }

  return {
    currentRates: {
      mortgage30Year: mortgage30?.lastValue || null,
      fedFunds: fed?.lastValue || null,
      treasury10Year: treasury10?.lastValue || null,
    },
    trend,
    impactOnABS,
  };
}
