/**
 * Unified Data Service
 *
 * Combines data from multiple sources:
 * - OpenFIGI (CUSIP/security lookups)
 * - SEC EDGAR (company/filing data)
 * - FINRA TRACE (trading data)
 * - Bloomberg (when configured)
 *
 * Provides a single interface for the application to fetch market data.
 */

import {
  lookupByCUSIP,
  lookupMultipleCUSIPs,
  searchSecurities as searchOpenFIGI,
  getABSSecurityInfo,
  SecurityInfo,
} from './openfigi';

import {
  searchABSFilings,
  getCompanyByCIK,
  searchProspectusByCUSIP,
  getABSIssuerInfo,
  getTrustDocuments,
  SECCompany,
  TrustDocument,
} from './secEdgar';

import {
  searchTRACE,
  convertTRACETrade,
  getMultipleCUSIPTrades,
  getQuote as getTRACEQuote,
  TRACEBond,
} from './finraTrace';

import {
  isBloombergConfigured,
  getSecurityData as getBloombergSecurityData,
  BloombergSecurityData,
} from './bloomberg';

import { Trade, TradingStats } from '@/types';

export type DataSource = 'openfigi' | 'sec' | 'finra' | 'bloomberg';

export interface DataSourceStatus {
  source: DataSource;
  available: boolean;
  configured: boolean;
  lastChecked: string;
  error?: string;
}

export interface UnifiedSecurityData {
  cusip: string;
  isin?: string;
  figi?: string;
  name: string;
  ticker?: string;
  securityType: string;
  issuer?: string;
  marketSector?: string;
  // ABS-specific
  dealName?: string;
  tranche?: string;
  trustee?: string;
  collateralType?: string;
  // Ratings
  moodyRating?: string;
  spRating?: string;
  // Source tracking
  sources: DataSource[];
  figiData?: SecurityInfo;
  secFilings?: TrustDocument[];
  bloombergData?: BloombergSecurityData;
}

export interface UnifiedCompanyData {
  name: string;
  cik?: string;
  ticker?: string;
  industry?: string;
  address?: string;
  filings: TrustDocument[];
  secCompany?: SECCompany;
  sources: DataSource[];
}

export interface UnifiedTradingData {
  cusip: string;
  trades: Trade[];
  stats?: TradingStats;
  bond?: TRACEBond;
  quote?: {
    price: number;
    yield: number;
    change: number;
    changePercent: number;
    volume: number;
    lastTradeTime: string;
  };
  sources: DataSource[];
}

/**
 * Check availability of all data sources
 */
export async function checkDataSources(): Promise<DataSourceStatus[]> {
  const now = new Date().toISOString();

  const statuses: DataSourceStatus[] = [
    {
      source: 'openfigi',
      available: true, // Always available (free API)
      configured: true,
      lastChecked: now,
    },
    {
      source: 'sec',
      available: true, // Always available (public API)
      configured: true,
      lastChecked: now,
    },
    {
      source: 'finra',
      available: true, // Simulated for demo
      configured: true,
      lastChecked: now,
    },
    {
      source: 'bloomberg',
      available: isBloombergConfigured(),
      configured: isBloombergConfigured(),
      lastChecked: now,
      error: isBloombergConfigured() ? undefined : 'Bloomberg API not configured',
    },
  ];

  return statuses;
}

/**
 * Look up comprehensive security data by CUSIP
 */
export async function lookupSecurity(cusip: string): Promise<UnifiedSecurityData> {
  const sources: DataSource[] = [];
  let figiData: SecurityInfo | undefined;
  let secFilings: TrustDocument[] | undefined;
  let bloombergData: BloombergSecurityData | undefined;

  // 1. Try OpenFIGI first (fast, free)
  try {
    const figiResult = await lookupByCUSIP(cusip);
    if (figiResult.success && figiResult.data) {
      figiData = figiResult.data;
      sources.push('openfigi');
    }
  } catch (error) {
    console.error('OpenFIGI lookup failed:', error);
  }

  // 2. Search SEC for prospectus/filings
  try {
    secFilings = await searchProspectusByCUSIP(cusip);
    if (secFilings.length > 0) {
      sources.push('sec');
    }
  } catch (error) {
    console.error('SEC search failed:', error);
  }

  // 3. Try Bloomberg if configured
  if (isBloombergConfigured()) {
    try {
      const bbgResults = await getBloombergSecurityData([cusip], 'cusip');
      if (bbgResults.length > 0) {
        bloombergData = bbgResults[0];
        sources.push('bloomberg');
      }
    } catch (error) {
      // Bloomberg not available
    }
  }

  // Merge data from all sources
  return {
    cusip,
    isin: bloombergData?.isin,
    figi: figiData?.figi || bloombergData?.figi,
    name: bloombergData?.name || figiData?.name || secFilings?.[0]?.trustName || 'Unknown',
    ticker: figiData?.ticker || bloombergData?.ticker,
    securityType: bloombergData?.securityType || figiData?.securityType || 'ABS',
    issuer: bloombergData?.issuer || secFilings?.[0]?.issuer,
    marketSector: figiData?.marketSector || bloombergData?.marketSector,
    dealName: bloombergData?.dealName || secFilings?.[0]?.trustName,
    tranche: bloombergData?.tranche,
    collateralType: bloombergData?.collateralType,
    moodyRating: bloombergData?.moodyRating,
    spRating: bloombergData?.spRating,
    sources,
    figiData,
    secFilings,
    bloombergData,
  };
}

/**
 * Look up multiple securities
 */
export async function lookupMultipleSecurities(cusips: string[]): Promise<Map<string, UnifiedSecurityData>> {
  const results = new Map<string, UnifiedSecurityData>();

  // Batch lookup via OpenFIGI
  const figiResults = await lookupMultipleCUSIPs(cusips);

  // Individual SEC lookups (could be parallelized)
  const secPromises = cusips.map(async cusip => {
    const filings = await searchProspectusByCUSIP(cusip);
    return { cusip, filings };
  });
  const secResults = await Promise.all(secPromises);
  const secMap = new Map(secResults.map(r => [r.cusip, r.filings]));

  // Merge results
  for (const cusip of cusips) {
    const sources: DataSource[] = [];
    const figiResult = figiResults.get(cusip);
    const secFilings = secMap.get(cusip);

    if (figiResult?.success) sources.push('openfigi');
    if (secFilings && secFilings.length > 0) sources.push('sec');

    results.set(cusip, {
      cusip,
      figi: figiResult?.data?.figi,
      name: figiResult?.data?.name || secFilings?.[0]?.trustName || 'Unknown',
      ticker: figiResult?.data?.ticker,
      securityType: figiResult?.data?.securityType || 'ABS',
      marketSector: figiResult?.data?.marketSector,
      sources,
      figiData: figiResult?.data,
      secFilings,
    });
  }

  return results;
}

/**
 * Get trading data for a CUSIP
 */
export async function getTradingData(
  cusip: string,
  dateRange?: { start: string; end: string }
): Promise<UnifiedTradingData> {
  const sources: DataSource[] = [];

  // Fetch from FINRA TRACE
  const traceResult = await searchTRACE({ cusip, dateRange });

  if (traceResult.success && traceResult.data) {
    sources.push('finra');

    const trades = traceResult.data.map(convertTRACETrade);
    const quote = await getTRACEQuote(cusip);

    return {
      cusip,
      trades,
      stats: traceResult.stats,
      bond: traceResult.bond,
      quote: quote || undefined,
      sources,
    };
  }

  return {
    cusip,
    trades: [],
    sources,
  };
}

/**
 * Search for ABS/MBS trusts
 */
export async function searchTrusts(query: string): Promise<{
  securities: SecurityInfo[];
  filings: TrustDocument[];
  sources: DataSource[];
}> {
  const sources: DataSource[] = [];
  let securities: SecurityInfo[] = [];
  let filings: TrustDocument[] = [];

  // Search OpenFIGI
  try {
    securities = await searchOpenFIGI(query);
    if (securities.length > 0) sources.push('openfigi');
  } catch (error) {
    console.error('OpenFIGI search error:', error);
  }

  // Search SEC EDGAR
  try {
    const secResult = await searchABSFilings(query);
    if (secResult.success && secResult.data) {
      filings = secResult.data;
      sources.push('sec');
    }
  } catch (error) {
    console.error('SEC search error:', error);
  }

  return { securities, filings, sources };
}

/**
 * Get issuer/company information
 */
export async function getIssuerInfo(issuerName: string): Promise<UnifiedCompanyData> {
  const sources: DataSource[] = [];

  // Get from SEC EDGAR
  const { issuer, recentDeals } = await getABSIssuerInfo(issuerName);

  if (issuer || recentDeals.length > 0) {
    sources.push('sec');
  }

  return {
    name: issuer?.name || issuerName,
    cik: issuer?.cik,
    ticker: issuer?.ticker,
    industry: issuer?.sicDescription,
    filings: recentDeals,
    secCompany: issuer || undefined,
    sources,
  };
}

/**
 * Get trust documents from SEC
 */
export async function getTrustFilings(trustName: string): Promise<TrustDocument[]> {
  return getTrustDocuments(trustName);
}

/**
 * Full investigation lookup - combines all sources
 */
export async function investigateCUSIP(cusip: string): Promise<{
  security: UnifiedSecurityData;
  trading: UnifiedTradingData;
  issuer?: UnifiedCompanyData;
}> {
  // Get security data
  const security = await lookupSecurity(cusip);

  // Get trading data
  const trading = await getTradingData(cusip);

  // Get issuer info if we have an issuer name
  let issuer: UnifiedCompanyData | undefined;
  if (security.issuer) {
    issuer = await getIssuerInfo(security.issuer);
  }

  return { security, trading, issuer };
}
