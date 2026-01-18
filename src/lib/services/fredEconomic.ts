/**
 * Federal Reserve Economic Data (FRED) API Service
 *
 * Free public API for economic data. Useful for understanding
 * market conditions affecting ABS/MBS valuations.
 *
 * Also includes fallback to Freddie Mac PMMS for mortgage rates.
 *
 * API Docs: https://fred.stlouisfed.org/docs/api/fred/
 */

const FRED_API = 'https://api.stlouisfed.org/fred';
const FRED_API_KEY = process.env.FRED_API_KEY;

// Freddie Mac Primary Mortgage Market Survey (no API key required)
// Using their JSON API endpoint instead of CSV for easier parsing
const FREDDIE_MAC_PMMS_JSON = 'https://www.freddiemac.com/pmms/pmms_archives.json';

// Alternative: Treasury rates from Treasury.gov (no API key required)
const TREASURY_RATES_API = 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/2024/all?type=daily_treasury_yield_curve&field_tdr_date_value=2024&page&_format=csv';

interface FreddieMacPMMSRate {
  date: string;
  rate30Year: number;
  rate15Year: number;
  points30Year: number;
  points15Year: number;
}

/**
 * Fetch mortgage rates from Freddie Mac PMMS (no API key required)
 * This is the official source for primary mortgage market survey data
 */
async function getFreddieMacMortgageRates(): Promise<FreddieMacPMMSRate | null> {
  try {
    // Use a simpler approach - fetch the current rates page
    const response = await fetch('https://www.freddiemac.com/pmms', {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'ABS-Investigator/1.0',
      },
    });

    if (!response.ok) {
      console.warn('Freddie Mac PMMS fetch failed:', response.status);
      return null;
    }

    const html = await response.text();

    // Parse the current 30-year and 15-year rates from the page
    // The rates are in a consistent format on their page
    const rate30Match = html.match(/30-Year Fixed Rate[^0-9]*(\d+\.?\d*)/i);
    const rate15Match = html.match(/15-Year Fixed Rate[^0-9]*(\d+\.?\d*)/i);

    if (rate30Match) {
      return {
        date: new Date().toISOString().split('T')[0],
        rate30Year: parseFloat(rate30Match[1]),
        rate15Year: rate15Match ? parseFloat(rate15Match[1]) : 0,
        points30Year: 0,
        points15Year: 0,
      };
    }

    // Alternative: Try to get from their weekly archive
    return await getFreddieMacArchiveRates();
  } catch (error) {
    console.error('Freddie Mac PMMS error:', error);
    return null;
  }
}

/**
 * Fetch historical rates from Freddie Mac archive
 */
async function getFreddieMacArchiveRates(): Promise<FreddieMacPMMSRate | null> {
  try {
    const response = await fetch(FREDDIE_MAC_PMMS_JSON, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ABS-Investigator/1.0',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Get the most recent entry
    if (Array.isArray(data) && data.length > 0) {
      const latest = data[0];
      return {
        date: latest.date || new Date().toISOString().split('T')[0],
        rate30Year: parseFloat(latest['30yr_frm'] || latest.rate30 || '0'),
        rate15Year: parseFloat(latest['15yr_frm'] || latest.rate15 || '0'),
        points30Year: parseFloat(latest['30yr_pts'] || '0'),
        points15Year: parseFloat(latest['15yr_pts'] || '0'),
      };
    }

    return null;
  } catch (error) {
    console.error('Freddie Mac archive error:', error);
    return null;
  }
}

/**
 * Get current Fed Funds rate estimate based on news/public data
 * Uses a reasonable estimate when FRED API is unavailable
 */
function getEstimatedFedFundsRate(): number {
  // As of late 2024/early 2025, Fed Funds rate is in the 4.25-4.50% range
  // This is a reasonable fallback when live data isn't available
  return 4.33;
}

/**
 * Get estimated high yield spread
 */
function getEstimatedHighYieldSpread(): number {
  // Historical average is around 300-400 bps in normal conditions
  return 350;
}

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
  // Check if FRED API key is available
  if (!FRED_API_KEY) {
    console.warn('FRED_API_KEY not set, using fallback data sources');
    return null;
  }

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
 * Uses FRED API if key is available, falls back to Freddie Mac and estimates
 */
export async function getEconomicContext(): Promise<EconomicContext> {
  const today = new Date().toISOString().split('T')[0];

  // Try FRED first if API key is available
  if (FRED_API_KEY) {
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

    // If FRED returned data, use it
    if (mortgageRate?.lastValue) {
      return buildEconomicContext({
        mortgageRate30Y: mortgageRate.lastValue,
        mortgageDelinquencyRate: mortgageDelinquency?.lastValue || null,
        consumerCreditTotal: consumerCredit?.lastValue || null,
        housingPriceIndex: housingPrice?.lastValue || null,
        fedFundsRate: fedFunds?.lastValue || null,
        highYieldSpread: highYield?.lastValue || null,
        assessmentDate: today,
      });
    }
  }

  // Fallback: Use Freddie Mac for mortgage rates (no API key required)
  console.log('Using Freddie Mac PMMS fallback for economic data');
  const freddieMacRates = await getFreddieMacMortgageRates();

  return buildEconomicContext({
    mortgageRate30Y: freddieMacRates?.rate30Year || 6.85, // Current typical rate as last fallback
    mortgageDelinquencyRate: 3.5, // Approximate current delinquency rate
    consumerCreditTotal: 5000, // Approximate in billions
    housingPriceIndex: 315, // Approximate Case-Shiller index
    fedFundsRate: getEstimatedFedFundsRate(),
    highYieldSpread: getEstimatedHighYieldSpread(),
    assessmentDate: today,
  });
}

/**
 * Build economic context with market condition assessment
 */
function buildEconomicContext(data: {
  mortgageRate30Y: number | null;
  mortgageDelinquencyRate: number | null;
  consumerCreditTotal: number | null;
  housingPriceIndex: number | null;
  fedFundsRate: number | null;
  highYieldSpread: number | null;
  assessmentDate: string;
}): EconomicContext {
  // Assess market conditions
  let stressScore = 0;

  // High mortgage rates = stress
  if (data.mortgageRate30Y && data.mortgageRate30Y > 7) stressScore += 2;
  else if (data.mortgageRate30Y && data.mortgageRate30Y > 6) stressScore += 1;

  // High delinquency = stress
  if (data.mortgageDelinquencyRate && data.mortgageDelinquencyRate > 5) stressScore += 2;
  else if (data.mortgageDelinquencyRate && data.mortgageDelinquencyRate > 3) stressScore += 1;

  // High yield spread = stress
  if (data.highYieldSpread && data.highYieldSpread > 500) stressScore += 2;
  else if (data.highYieldSpread && data.highYieldSpread > 400) stressScore += 1;

  let marketConditions: 'favorable' | 'neutral' | 'stressed' = 'neutral';
  if (stressScore >= 4) marketConditions = 'stressed';
  else if (stressScore <= 1) marketConditions = 'favorable';

  return {
    ...data,
    marketConditions,
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
