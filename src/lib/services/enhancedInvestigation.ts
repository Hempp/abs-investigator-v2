/**
 * Enhanced Investigation Service
 *
 * Cross-references multiple authoritative data sources for maximum accuracy:
 * - SEC EDGAR (filings, prospectuses, ABS-EE data)
 * - OpenFIGI (CUSIP/security identification)
 * - CFPB (servicer complaint data)
 * - FRED (economic context)
 * - FINRA TRACE (trading data)
 *
 * This service is the "guru-level" investigation engine.
 */

import { Trust, DebtTypeId, TrustCUSIP, Trade, TradingStats, EconomicContext, VerificationData, ServicerComplaintData } from '@/types';
import { searchABSFilings, getCompanyByCIK, searchProspectusByCUSIP } from './secEdgar';
import { lookupByCUSIP, searchSecurities, getABSSecurityInfo } from './openfigi';
import { searchCFPBComplaints, getCompanyComplaintSummary } from './cfpbComplaints';
import { getEconomicContext, getDelinquencyTrends, getInterestRateEnvironment } from './fredEconomic';
import { getTradingData } from './dataService';

export interface EnhancedTrust extends Trust {
  // Additional verification data - enhanced from Trust's verification
  verification: VerificationData & {
    confidenceScore: number;
  };
  // Servicer analysis - uses Trust's servicerComplaints
  servicerInfo?: {
    name: string;
    cfpbComplaints: number;
    riskScore: number;
    topIssues: string[];
  };
  // Related filings
  relatedFilings?: {
    formType: string;
    filingDate: string;
    documentUrl: string;
  }[];
}

export interface InvestigationReport {
  trusts: EnhancedTrust[];
  summary: {
    totalMatches: number;
    highConfidenceMatches: number;
    dataSourcesQueried: string[];
    searchTime: number;
    economicContext: any;
  };
  servicerAnalysis: {
    servicerName: string;
    complaintCount: number;
    riskLevel: 'low' | 'medium' | 'high';
    recentIssues: string[];
  }[];
  recommendations: string[];
}

/**
 * Perform comprehensive debt investigation
 */
export async function performEnhancedInvestigation(params: {
  debtType: DebtTypeId;
  servicerName?: string;
  originalCreditor?: string;
  accountNumber?: string;
  state?: string;
  approximateBalance?: number;
}): Promise<InvestigationReport> {
  const startTime = performance.now();
  const dataSourcesQueried: string[] = [];
  const trusts: EnhancedTrust[] = [];
  const servicerAnalysis: InvestigationReport['servicerAnalysis'] = [];
  const recommendations: string[] = [];

  // Build search queries based on debt type
  const searchQueries = buildSearchQueries(params);

  // 1. Search SEC EDGAR for matching trusts
  console.log('Searching SEC EDGAR...');
  dataSourcesQueried.push('SEC EDGAR');

  for (const query of searchQueries) {
    try {
      const secResult = await searchABSFilings(query);
      if (secResult.success && secResult.data) {
        for (const filing of secResult.data.slice(0, 5)) {
          const trust = await enhanceTrustWithMultipleSources(filing, params.debtType);
          if (trust && trust.verification.confidenceScore > 30) {
            trusts.push(trust);
          }
        }
      }
    } catch (error) {
      console.error(`SEC search error for "${query}":`, error);
    }
  }

  // 2. Search OpenFIGI for securities
  console.log('Searching OpenFIGI...');
  dataSourcesQueried.push('OpenFIGI');

  try {
    const figiQuery = params.servicerName || params.originalCreditor || getDebtTypeKeywords(params.debtType);
    const figiResult = await searchSecurities(figiQuery);

    if (figiResult.length > 0) {
      for (const security of figiResult.slice(0, 5)) {
        // Check if we already have this trust
        const existingIndex = trusts.findIndex(t =>
          t.cusips.some(c => c.cusip === security.cusip)
        );

        if (existingIndex === -1 && security.cusip) {
          const figiTrust = convertFigiToTrust(security, params.debtType);
          const enhanced = await enhanceTrustWithMultipleSources(
            { trustName: figiTrust.name, formType: 'FIGI', filingDate: '', documentUrl: '' },
            params.debtType,
            [security.cusip]
          );
          if (enhanced) {
            trusts.push(enhanced);
          }
        } else if (existingIndex >= 0) {
          // Enhance existing trust with FIGI data
          trusts[existingIndex].verification.figiVerified = true;
          trusts[existingIndex].verification.confidenceScore += 15;
          trusts[existingIndex].verification.dataSources.push('OpenFIGI');
        }
      }
    }
  } catch (error) {
    console.error('OpenFIGI search error:', error);
  }

  // 3. Analyze servicer via CFPB
  console.log('Analyzing servicer via CFPB...');
  dataSourcesQueried.push('CFPB');

  if (params.servicerName) {
    try {
      const cfpbResult = await getCompanyComplaintSummary(params.servicerName);

      const riskLevel: 'low' | 'medium' | 'high' =
        cfpbResult.riskScore > 60 ? 'high' :
        cfpbResult.riskScore > 30 ? 'medium' : 'low';

      servicerAnalysis.push({
        servicerName: params.servicerName,
        complaintCount: cfpbResult.totalComplaints,
        riskLevel,
        recentIssues: cfpbResult.recentComplaints.slice(0, 5).map(c => c.issue),
      });

      // Add servicer info to trusts
      trusts.forEach(trust => {
        trust.servicerInfo = {
          name: params.servicerName!,
          cfpbComplaints: cfpbResult.totalComplaints,
          riskScore: cfpbResult.riskScore,
          topIssues: cfpbResult.recentComplaints.slice(0, 3).map(c => c.issue),
        };
      });

      // Generate recommendations based on CFPB data
      if (cfpbResult.riskScore > 50) {
        recommendations.push(
          `Servicer "${params.servicerName}" has ${cfpbResult.totalComplaints} CFPB complaints. Consider requesting complete chain of title documentation.`
        );
      }
    } catch (error) {
      console.error('CFPB analysis error:', error);
    }
  }

  // 4. Get economic context
  console.log('Fetching economic context...');
  dataSourcesQueried.push('FRED');

  let economicContext: any = null;
  try {
    economicContext = await getEconomicContext();

    // Add context to trusts
    const delinquencyType = getDelinquencyTypeForDebt(params.debtType);
    const trends = await getDelinquencyTrends(delinquencyType, 12);
    const rateEnv = await getInterestRateEnvironment();

    const delinquencyTrend = calculateTrend(trends);

    trusts.forEach(trust => {
      // Convert raw economic data to EconomicContext format
      const marketCondition: 'favorable' | 'neutral' | 'unfavorable' =
        economicContext.marketConditions === 'stable' ? 'favorable' :
        economicContext.marketConditions === 'stressed' ? 'unfavorable' : 'neutral';

      trust.economicContext = {
        mortgageRate30Year: economicContext.mortgageRate30Year,
        mortgageRate15Year: economicContext.mortgageRate15Year,
        delinquencyRate: trends?.[0]?.value ?? undefined,
        unemploymentRate: economicContext.unemploymentRate,
        inflationRate: economicContext.inflationRate,
        marketCondition,
        fredSource: 'Federal Reserve FRED',
      };
    });

    // Add economic recommendations
    if (economicContext.marketConditions === 'stressed' || economicContext.marketConditions === 'unfavorable') {
      recommendations.push(
        'Current market conditions are stressed. ABS valuations may be volatile - consider this in negotiations.'
      );
    }
  } catch (error) {
    console.error('Economic context error:', error);
  }

  // 5. Get trading data for top trusts
  console.log('Fetching trading data...');
  dataSourcesQueried.push('FINRA TRACE');

  for (const trust of trusts.slice(0, 5)) {
    if (trust.cusips.length > 0) {
      try {
        const tradingResult = await getTradingData(trust.cusips[0].cusip);
        if (tradingResult.trades.length > 0) {
          trust.verification.traceVerified = true;
          trust.verification.confidenceScore += 20;
          trust.verification.dataSources.push('FINRA TRACE');
        }
      } catch (error) {
        console.error('Trading data error:', error);
      }
    }
  }

  // Sort by confidence score
  trusts.sort((a, b) => b.verification.confidenceScore - a.verification.confidenceScore);

  // Generate final recommendations
  if (trusts.length === 0) {
    recommendations.push(
      'No matching securitization trusts found. The debt may not have been securitized, or may be held in a private placement.'
    );
  } else if (trusts[0].verification.confidenceScore > 80) {
    recommendations.push(
      `High-confidence match found: "${trusts[0].name}". Request Qualified Written Request to verify ownership chain.`
    );
  }

  const searchTime = performance.now() - startTime;

  return {
    trusts: trusts.slice(0, 10),
    summary: {
      totalMatches: trusts.length,
      highConfidenceMatches: trusts.filter(t => t.verification.confidenceScore > 70).length,
      dataSourcesQueried,
      searchTime: Math.round(searchTime),
      economicContext,
    },
    servicerAnalysis,
    recommendations,
  };
}

/**
 * Build search queries based on debt type and parameters
 */
function buildSearchQueries(params: {
  debtType: DebtTypeId;
  servicerName?: string;
  originalCreditor?: string;
}): string[] {
  const queries: string[] = [];

  // Add servicer/creditor specific queries
  if (params.servicerName) {
    queries.push(`${params.servicerName} trust`);
    queries.push(`${params.servicerName} ABS`);
  }

  if (params.originalCreditor) {
    queries.push(`${params.originalCreditor} securitization`);
  }

  // Add debt-type specific queries
  const typeKeywords = getDebtTypeKeywords(params.debtType);
  queries.push(typeKeywords);

  // Add common ABS issuer queries for each type
  const commonIssuers = getCommonIssuersForType(params.debtType);
  commonIssuers.forEach(issuer => queries.push(`${issuer} ${typeKeywords}`));

  return Array.from(new Set(queries)); // Remove duplicates
}

/**
 * Get keywords for debt type
 */
function getDebtTypeKeywords(debtType: DebtTypeId): string {
  const keywords: Record<DebtTypeId, string> = {
    mortgage: 'RMBS residential mortgage backed',
    auto: 'auto loan ABS securitization',
    creditCard: 'credit card ABS receivables',
    studentLoan: 'SLABS student loan',
    medical: 'medical receivables ABS',
    utility: 'utility receivables securitization',
    telecom: 'telecom receivables ABS',
    personalLoan: 'consumer loan ABS unsecured',
  };
  return keywords[debtType] || 'ABS trust';
}

/**
 * Get common issuers for debt type
 */
function getCommonIssuersForType(debtType: DebtTypeId): string[] {
  const issuers: Record<DebtTypeId, string[]> = {
    mortgage: ['Fannie Mae', 'Freddie Mac', 'Ginnie Mae', 'JPMorgan', 'Wells Fargo', 'Bank of America'],
    auto: ['Ally', 'Capital One', 'Santander', 'Ford Credit', 'Toyota Financial', 'GM Financial'],
    creditCard: ['American Express', 'Capital One', 'Discover', 'Synchrony', 'Citi'],
    studentLoan: ['Navient', 'Nelnet', 'SoFi', 'Sallie Mae'],
    medical: ['Synchrony Health', 'CareCredit'],
    utility: ['Pacific Gas', 'Southern California Edison'],
    telecom: ['Verizon', 'AT&T'],
    personalLoan: ['LendingClub', 'Prosper', 'SoFi', 'Upstart'],
  };
  return issuers[debtType] || [];
}

/**
 * Get delinquency type for FRED queries
 */
function getDelinquencyTypeForDebt(debtType: DebtTypeId): 'mortgage' | 'auto' | 'creditCard' | 'consumer' {
  const mapping: Record<DebtTypeId, 'mortgage' | 'auto' | 'creditCard' | 'consumer'> = {
    mortgage: 'mortgage',
    auto: 'auto',
    creditCard: 'creditCard',
    studentLoan: 'consumer',
    medical: 'consumer',
    utility: 'consumer',
    telecom: 'consumer',
    personalLoan: 'consumer',
  };
  return mapping[debtType] || 'consumer';
}

/**
 * Calculate trend from observations
 */
function calculateTrend(observations: { value: number | null }[]): 'improving' | 'stable' | 'worsening' {
  if (observations.length < 2) return 'stable';

  const recent = observations.slice(0, 3).filter(o => o.value !== null);
  const older = observations.slice(-3).filter(o => o.value !== null);

  if (recent.length === 0 || older.length === 0) return 'stable';

  const recentAvg = recent.reduce((sum, o) => sum + (o.value || 0), 0) / recent.length;
  const olderAvg = older.reduce((sum, o) => sum + (o.value || 0), 0) / older.length;

  const change = recentAvg - olderAvg;

  if (change > 0.5) return 'worsening';
  if (change < -0.5) return 'improving';
  return 'stable';
}

/**
 * Enhance a trust with data from multiple sources
 */
async function enhanceTrustWithMultipleSources(
  filing: any,
  debtType: DebtTypeId,
  knownCusips?: string[]
): Promise<EnhancedTrust | null> {
  try {
    const cusips: TrustCUSIP[] = [];
    const dataSources: string[] = ['SEC EDGAR'];
    let confidenceScore = 40; // Base score for SEC match

    // Company identification fields
    let cik: string | undefined;
    let ein: string | undefined;
    let stateOfIncorporation: string | undefined;
    let businessAddress: { street1?: string; street2?: string; city?: string; state?: string; zip?: string } | undefined;

    // Extract CIK from filing URL and fetch company details
    if (filing.documentUrl) {
      const cikMatch = filing.documentUrl.match(/\/data\/(\d+)\//);
      if (cikMatch && cikMatch[1]) {
        const extractedCik = cikMatch[1];
        cik = extractedCik;
        try {
          const companyData = await getCompanyByCIK(extractedCik);
          if (companyData) {
            ein = companyData.ein;
            stateOfIncorporation = companyData.stateOfIncorporation;
            businessAddress = companyData.businessAddress;
            confidenceScore += 15; // Boost for having company details
          }
        } catch (error) {
          console.error('Company lookup error:', error);
        }
      }
    }

    // Add known CUSIPs
    if (knownCusips) {
      knownCusips.forEach((cusip, i) => {
        cusips.push({
          cusip,
          tranche: `Class A${i + 1}`,
          rating: 'NR',
          balance: 0,
        });
      });
    }

    // Try to find CUSIPs from OpenFIGI
    if (filing.trustName) {
      try {
        const figiResults = await searchSecurities(filing.trustName);
        figiResults.slice(0, 3).forEach((result, i) => {
          if (result.cusip && !cusips.find(c => c.cusip === result.cusip)) {
            cusips.push({
              cusip: result.cusip,
              tranche: `Class ${String.fromCharCode(65 + i)}`,
              rating: 'NR',
              balance: 0,
            });
            confidenceScore += 10;
          }
        });

        if (figiResults.length > 0) {
          dataSources.push('OpenFIGI');
        }
      } catch (error) {
        console.error('FIGI lookup error:', error);
      }
    }

    // Generate placeholder CUSIP if none found
    if (cusips.length === 0) {
      cusips.push({
        cusip: `PLACEHOLDER-${Date.now()}`,
        tranche: 'Class A',
        rating: 'NR',
        balance: 0,
      });
    }

    // Boost confidence for ABS-specific forms
    const absFormTypes = ['ABS-15G', 'ABS-EE', 'SF-1', 'SF-3'];
    if (absFormTypes.some(type => filing.formType?.includes(type))) {
      confidenceScore += 20;
    }

    // Boost for recent filings
    if (filing.filingDate) {
      const filingYear = new Date(filing.filingDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - filingYear <= 2) {
        confidenceScore += 10;
      }
    }

    return {
      trustId: `ENH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: filing.trustName || 'Unknown Trust',
      trustee: filing.issuer || 'Unknown',
      type: debtType,
      closingDate: filing.filingDate || new Date().toISOString().split('T')[0],
      originalBalance: filing.dealSize || 0,
      cusips,
      matchScore: Math.min(confidenceScore, 100),
      matchReasons: dataSources.map(s => `Verified via ${s}`),
      secLink: filing.documentUrl,
      // Company identification
      cik,
      ein,
      stateOfIncorporation,
      businessAddress,
      verification: {
        secVerified: true,
        figiVerified: dataSources.includes('OpenFIGI'),
        traceVerified: false,
        cfpbChecked: dataSources.includes('CFPB'),
        lastVerified: new Date().toISOString(),
        confidenceScore: Math.min(confidenceScore, 100),
        dataSources,
      },
      relatedFilings: filing.documentUrl ? [{
        formType: filing.formType,
        filingDate: filing.filingDate,
        documentUrl: filing.documentUrl,
      }] : undefined,
    };
  } catch (error) {
    console.error('Trust enhancement error:', error);
    return null;
  }
}

/**
 * Convert OpenFIGI security to Trust format
 */
function convertFigiToTrust(security: any, debtType: DebtTypeId): Trust {
  return {
    trustId: security.figi || `FIGI-${Date.now()}`,
    name: security.name || 'Unknown Security',
    trustee: security.issuer || 'Unknown',
    type: debtType,
    closingDate: new Date().toISOString().split('T')[0],
    originalBalance: 0,
    cusips: security.cusip ? [{
      cusip: security.cusip,
      tranche: 'Class A',
      rating: 'NR',
      balance: 0,
    }] : [],
    matchScore: 50,
    matchReasons: ['OpenFIGI security match'],
  };
}

/**
 * Quick investigation for real-time results
 */
export async function quickInvestigation(
  servicerName: string,
  debtType: DebtTypeId
): Promise<{ trusts: EnhancedTrust[]; servicerRisk: string }> {
  const result = await performEnhancedInvestigation({
    debtType,
    servicerName,
  });

  const servicerRisk = result.servicerAnalysis[0]?.riskLevel || 'unknown';

  return {
    trusts: result.trusts.slice(0, 5),
    servicerRisk,
  };
}
