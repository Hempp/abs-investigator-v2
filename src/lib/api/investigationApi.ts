/**
 * Investigation API Client
 *
 * Client-side API for searching trusts and fetching trading data
 * from SEC EDGAR and FINRA TRACE.
 */

import { Trust, TrustCUSIP, Trade, TradingStats, DebtTypeId, DebtInfo } from '@/types';

export interface SearchResult {
  trusts: Trust[];
  totalResults: number;
  searchTime: number;
  sources: string[];
}

export interface TradingResult {
  trades: Trade[];
  stats: TradingStats | null;
  cusip: string;
}

/**
 * Convert SEC filing data to Trust format
 */
function convertSECFilingToTrust(
  filing: any,
  debtType: DebtTypeId,
  index: number
): Trust {
  // Generate a match score based on relevance factors
  let matchScore = 50;
  const matchReasons: string[] = [];

  // Higher score for ABS-specific form types
  const absFormTypes = ['ABS-15G', 'ABS-EE', 'SF-1', 'SF-3', '424B5'];
  if (absFormTypes.some(type => filing.formType?.includes(type))) {
    matchScore += 20;
    matchReasons.push('ABS-specific SEC filing found');
  }

  // Higher score for recent filings
  const filingYear = new Date(filing.filingDate).getFullYear();
  const currentYear = new Date().getFullYear();
  if (currentYear - filingYear <= 2) {
    matchScore += 15;
    matchReasons.push('Recent filing (within 2 years)');
  }

  // Generate placeholder CUSIPs from filing data
  const cusips: TrustCUSIP[] = (filing.cusips || []).map((cusip: string, i: number) => ({
    cusip,
    tranche: `Class A${i + 1}`,
    rating: 'AAA',
    balance: filing.dealSize ? filing.dealSize / (filing.cusips.length || 1) : 100000000,
  }));

  // If no CUSIPs, create a placeholder
  if (cusips.length === 0) {
    cusips.push({
      cusip: `${filing.trustName?.substring(0, 6).toUpperCase() || 'UNKN'}${index.toString().padStart(3, '0')}`,
      tranche: 'Class A',
      rating: 'NR',
      balance: filing.dealSize || 500000000,
    });
  }

  matchReasons.push('SEC EDGAR filing match');

  return {
    trustId: filing.dealId || `SEC-${Date.now()}-${index}`,
    dealId: filing.dealId,
    name: filing.trustName || 'Unknown Trust',
    trustee: filing.issuer || 'Unknown Trustee',
    type: debtType,
    closingDate: filing.filingDate || new Date().toISOString().split('T')[0],
    issuanceDate: filing.filingDate,
    originalBalance: filing.dealSize || 500000000,
    dealSize: filing.dealSize,
    cusips,
    matchScore: Math.min(matchScore, 100),
    matchReasons,
    secLink: filing.documentUrl,
  };
}

/**
 * Convert OpenFIGI security to Trust format
 */
function convertSecurityToTrust(
  security: any,
  debtType: DebtTypeId,
  index: number
): Trust {
  const matchReasons: string[] = ['OpenFIGI security match'];
  let matchScore = 45;

  if (security.securityType?.toLowerCase().includes('abs')) {
    matchScore += 25;
    matchReasons.push('Asset-backed security type confirmed');
  }

  if (security.marketSector?.toLowerCase().includes('mtge')) {
    matchScore += 15;
    matchReasons.push('Mortgage market sector');
  }

  const cusips: TrustCUSIP[] = [{
    cusip: security.cusip || `FIGI-${index}`,
    tranche: 'Class A',
    rating: 'NR',
    balance: 100000000,
  }];

  return {
    trustId: security.figi || `FIGI-${Date.now()}-${index}`,
    name: security.name || 'Unknown Security',
    trustee: security.issuer || 'Unknown',
    type: debtType,
    closingDate: new Date().toISOString().split('T')[0],
    originalBalance: 500000000,
    cusips,
    matchScore: Math.min(matchScore, 100),
    matchReasons,
  };
}

/**
 * Search for trusts using SEC EDGAR and OpenFIGI
 */
export async function searchTrustsAPI(
  query: string,
  debtType: DebtTypeId
): Promise<SearchResult> {
  const startTime = performance.now();
  const sources: string[] = [];
  const allTrusts: Trust[] = [];

  try {
    // Search SEC EDGAR for ABS filings
    const secResponse = await fetch(`/api/sec/filings?q=${encodeURIComponent(query)}`);

    if (secResponse.ok) {
      const secData = await secResponse.json();
      sources.push('SEC EDGAR');

      if (secData.data && Array.isArray(secData.data)) {
        const secTrusts = secData.data.map((filing: any, i: number) =>
          convertSECFilingToTrust(filing, debtType, i)
        );
        allTrusts.push(...secTrusts);
      }
    }
  } catch (error) {
    console.error('SEC EDGAR search error:', error);
  }

  try {
    // Search OpenFIGI for securities
    const searchResponse = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=trusts`);

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();

      if (searchData.results?.securities && Array.isArray(searchData.results.securities)) {
        sources.push('OpenFIGI');
        const figiTrusts = searchData.results.securities.map((security: any, i: number) =>
          convertSecurityToTrust(security, debtType, i)
        );
        allTrusts.push(...figiTrusts);
      }

      if (searchData.results?.filings && Array.isArray(searchData.results.filings)) {
        const additionalTrusts = searchData.results.filings.map((filing: any, i: number) =>
          convertSECFilingToTrust(filing, debtType, allTrusts.length + i)
        );
        allTrusts.push(...additionalTrusts);
      }
    }
  } catch (error) {
    console.error('OpenFIGI search error:', error);
  }

  // Sort by match score and deduplicate by name
  const uniqueTrusts = allTrusts
    .sort((a, b) => b.matchScore - a.matchScore)
    .filter((trust, index, self) =>
      index === self.findIndex(t => t.name.toLowerCase() === trust.name.toLowerCase())
    );

  const searchTime = performance.now() - startTime;

  return {
    trusts: uniqueTrusts,
    totalResults: uniqueTrusts.length,
    searchTime: Math.round(searchTime),
    sources,
  };
}

/**
 * Search all debt types for a user
 */
export async function searchAllDebtsAPI(
  personalInfo: {
    firstName: string;
    lastName: string;
    state: string;
    zipCode: string;
  }
): Promise<SearchResult> {
  const startTime = performance.now();
  const sources: string[] = [];
  const allTrusts: Trust[] = [];

  const debtTypes: DebtTypeId[] = ['mortgage', 'auto', 'creditCard', 'studentLoan', 'medical', 'utility', 'telecom', 'personalLoan'];

  // Build search queries for each debt type
  const searchQueries = [
    `${personalInfo.state} mortgage ABS`,
    `${personalInfo.state} auto loan securitization`,
    `credit card ABS trust`,
    `student loan SLABS`,
    `consumer ABS`,
  ];

  for (const query of searchQueries) {
    try {
      const response = await fetch(`/api/sec/filings?q=${encodeURIComponent(query)}`);

      if (response.ok) {
        const data = await response.json();
        if (!sources.includes('SEC EDGAR')) sources.push('SEC EDGAR');

        if (data.data && Array.isArray(data.data)) {
          // Assign appropriate debt types based on content
          const trusts = data.data.slice(0, 3).map((filing: any, i: number) => {
            const nameLC = (filing.trustName || '').toLowerCase();
            let type: DebtTypeId = 'mortgage';

            if (nameLC.includes('auto') || nameLC.includes('car') || nameLC.includes('vehicle')) {
              type = 'auto';
            } else if (nameLC.includes('credit') || nameLC.includes('card')) {
              type = 'creditCard';
            } else if (nameLC.includes('student') || nameLC.includes('education')) {
              type = 'studentLoan';
            } else if (nameLC.includes('medical') || nameLC.includes('health')) {
              type = 'medical';
            }

            return convertSECFilingToTrust(filing, type, allTrusts.length + i);
          });

          allTrusts.push(...trusts);
        }
      }
    } catch (error) {
      console.error(`Search error for query "${query}":`, error);
    }
  }

  // Deduplicate and sort
  const uniqueTrusts = allTrusts
    .sort((a, b) => b.matchScore - a.matchScore)
    .filter((trust, index, self) =>
      index === self.findIndex(t => t.name.toLowerCase() === trust.name.toLowerCase())
    );

  const searchTime = performance.now() - startTime;

  return {
    trusts: uniqueTrusts,
    totalResults: uniqueTrusts.length,
    searchTime: Math.round(searchTime),
    sources,
  };
}

/**
 * Search for a specific debt
 */
export async function searchSpecificDebtAPI(
  debtInfo: DebtInfo & {
    debtType: DebtTypeId;
    companyName: string;
    accountNumber: string;
    firstName?: string;
    lastName?: string;
    state?: string;
  }
): Promise<SearchResult> {
  const startTime = performance.now();
  const sources: string[] = [];

  // Build search query from debt info
  const searchTerms = [
    debtInfo.companyName,
    debtInfo.servicerName || debtInfo.servicer,
    debtInfo.originator,
  ].filter(Boolean);

  const query = searchTerms.join(' ');

  if (!query) {
    return {
      trusts: [],
      totalResults: 0,
      searchTime: 0,
      sources: [],
    };
  }

  const result = await searchTrustsAPI(query, debtInfo.debtType);

  return result;
}

/**
 * Get trading data for a CUSIP
 */
export async function getTradingDataAPI(
  cusip: string,
  dateRange?: { start: string; end: string }
): Promise<TradingResult> {
  try {
    let url = `/api/trading/${encodeURIComponent(cusip)}`;

    if (dateRange) {
      const params = new URLSearchParams({
        start: dateRange.start,
        end: dateRange.end,
      });
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Trading data fetch failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      cusip,
      trades: data.trades || [],
      stats: data.stats || null,
    };
  } catch (error) {
    console.error('Trading data fetch error:', error);
    return {
      cusip,
      trades: [],
      stats: null,
    };
  }
}

/**
 * Get comprehensive CUSIP investigation data
 */
export async function investigateCUSIPAPI(cusip: string): Promise<{
  security: any;
  trading: TradingResult;
}> {
  try {
    const [cusipResponse, tradingData] = await Promise.all([
      fetch(`/api/cusip/${encodeURIComponent(cusip)}`),
      getTradingDataAPI(cusip),
    ]);

    let security = null;
    if (cusipResponse.ok) {
      security = await cusipResponse.json();
    }

    return {
      security,
      trading: tradingData,
    };
  } catch (error) {
    console.error('CUSIP investigation error:', error);
    return {
      security: null,
      trading: { cusip, trades: [], stats: null },
    };
  }
}

/**
 * Enhanced investigation parameters
 */
export interface EnhancedInvestigationParams {
  debtType: DebtTypeId;
  servicerName?: string;
  originalCreditor?: string;
  accountNumber?: string;
  state?: string;
  approximateBalance?: number;
  quick?: boolean;
}

/**
 * Enhanced investigation result with multi-source data
 */
export interface EnhancedInvestigationResult {
  mode: 'quick' | 'enhanced';
  trusts: Trust[];
  servicerInfo?: {
    complaints: {
      totalComplaints: number;
      recentComplaints: number;
      topIssues: string[];
      riskScore: number;
    };
    cfpbLink?: string;
  };
  economicContext?: {
    mortgageRate30Year?: number;
    mortgageRate15Year?: number;
    delinquencyRate?: number;
    marketCondition: string;
  };
  dataSources: string[];
  recommendations?: string[];
  searchTime: number;
}

/**
 * Perform enhanced multi-source investigation
 * Queries: SEC EDGAR, OpenFIGI, CFPB, FRED, FINRA TRACE
 */
export async function performEnhancedInvestigationAPI(
  params: EnhancedInvestigationParams
): Promise<EnhancedInvestigationResult> {
  const startTime = performance.now();

  try {
    const response = await fetch('/api/investigate/enhanced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Investigation failed: ${response.status}`);
    }

    const data = await response.json();
    const searchTime = performance.now() - startTime;

    // Convert the API response to Trust format
    const trusts: Trust[] = (data.trusts || []).map((trust: any, index: number) => ({
      trustId: trust.trustId || `ENH-${Date.now()}-${index}`,
      dealId: trust.dealId,
      name: trust.name || 'Unknown Trust',
      trustee: trust.trustee || trust.issuer || 'Unknown Trustee',
      type: params.debtType,
      closingDate: trust.closingDate || trust.filingDate || new Date().toISOString().split('T')[0],
      issuanceDate: trust.issuanceDate || trust.filingDate,
      originalBalance: trust.originalBalance || trust.dealSize || 500000000,
      dealSize: trust.dealSize,
      cusips: trust.cusips || [],
      matchScore: trust.matchScore || 50,
      matchReasons: trust.matchReasons || ['Enhanced investigation match'],
      secLink: trust.secLink || trust.documentUrl,
      // Enhanced fields
      servicerComplaints: data.servicerInfo?.complaints ? {
        totalComplaints: data.servicerInfo.complaints.totalComplaints,
        recentComplaints: data.servicerInfo.complaints.recentComplaints,
        topIssues: data.servicerInfo.complaints.topIssues || [],
        riskScore: data.servicerInfo.complaints.riskScore || 0,
        cfpbLink: data.servicerInfo.cfpbLink,
      } : undefined,
      economicContext: data.economicContext ? {
        mortgageRate30Year: data.economicContext.mortgageRate30Year,
        mortgageRate15Year: data.economicContext.mortgageRate15Year,
        delinquencyRate: data.economicContext.delinquencyRate,
        unemploymentRate: data.economicContext.unemploymentRate,
        inflationRate: data.economicContext.inflationRate,
        marketCondition: data.economicContext.marketCondition || 'neutral',
        fredSource: 'Federal Reserve FRED',
      } : undefined,
      verification: {
        secVerified: (data.dataSources || []).includes('SEC EDGAR'),
        figiVerified: (data.dataSources || []).includes('OpenFIGI'),
        traceVerified: (data.dataSources || []).includes('FINRA TRACE'),
        cfpbChecked: (data.dataSources || []).includes('CFPB'),
        lastVerified: new Date().toISOString(),
        dataSources: data.dataSources || [],
      },
      recommendations: data.recommendations,
    }));

    return {
      mode: data.mode || 'enhanced',
      trusts,
      servicerInfo: data.servicerInfo,
      economicContext: data.economicContext,
      dataSources: data.dataSources || [],
      recommendations: data.recommendations,
      searchTime: Math.round(searchTime),
    };
  } catch (error) {
    console.error('Enhanced investigation error:', error);

    // Fall back to regular search
    const fallbackResult = await searchTrustsAPI(
      params.servicerName || params.originalCreditor || `${params.debtType} ABS`,
      params.debtType
    );

    return {
      mode: 'enhanced',
      trusts: fallbackResult.trusts,
      dataSources: fallbackResult.sources,
      searchTime: fallbackResult.searchTime,
    };
  }
}

/**
 * Quick enhanced investigation (faster, fewer sources)
 */
export async function quickEnhancedInvestigationAPI(
  servicerName: string,
  debtType: DebtTypeId
): Promise<EnhancedInvestigationResult> {
  return performEnhancedInvestigationAPI({
    debtType,
    servicerName,
    quick: true,
  });
}
