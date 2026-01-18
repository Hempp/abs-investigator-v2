/**
 * CFPB Consumer Complaint Database API Service
 *
 * Free public API providing consumer complaints against financial companies.
 * Excellent for identifying patterns with debt servicers and collectors.
 *
 * API Docs: https://cfpb.github.io/api/ccdb/
 */

const CFPB_API = 'https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1';

export interface CFPBComplaint {
  complaintId: string;
  dateReceived: string;
  product: string;
  subProduct?: string;
  issue: string;
  subIssue?: string;
  companyName: string;
  state: string;
  zipCode?: string;
  companyResponse: string;
  timelyResponse: boolean;
  consumerDisputed?: boolean;
  submittedVia: string;
}

export interface CFPBSearchResult {
  success: boolean;
  complaints: CFPBComplaint[];
  totalComplaints: number;
  companyStats?: {
    totalComplaints: number;
    disputedPercentage: number;
    avgResponseTime: string;
    topIssues: { issue: string; count: number }[];
  };
  error?: string;
}

/**
 * Search CFPB complaints by company name
 */
export async function searchCFPBComplaints(
  companyName: string,
  options?: {
    product?: string;
    state?: string;
    dateFrom?: string;
    dateTo?: string;
    size?: number;
  }
): Promise<CFPBSearchResult> {
  try {
    const params = new URLSearchParams({
      field: 'all',
      size: String(options?.size || 25),
      sort: 'created_date_desc',
      company: companyName,
    });

    if (options?.product) {
      params.append('product', options.product);
    }
    if (options?.state) {
      params.append('state', options.state);
    }
    if (options?.dateFrom) {
      params.append('date_received_min', options.dateFrom);
    }
    if (options?.dateTo) {
      params.append('date_received_max', options.dateTo);
    }

    const response = await fetch(`${CFPB_API}/?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CFPB API error: ${response.status}`);
    }

    const data = await response.json();

    const complaints: CFPBComplaint[] = (data.hits?.hits || []).map((hit: any) => ({
      complaintId: hit._source?.complaint_id || hit._id,
      dateReceived: hit._source?.date_received,
      product: hit._source?.product,
      subProduct: hit._source?.sub_product,
      issue: hit._source?.issue,
      subIssue: hit._source?.sub_issue,
      companyName: hit._source?.company,
      state: hit._source?.state,
      zipCode: hit._source?.zip_code,
      companyResponse: hit._source?.company_response,
      timelyResponse: hit._source?.timely === 'Yes',
      consumerDisputed: hit._source?.consumer_disputed === 'Yes',
      submittedVia: hit._source?.submitted_via,
    }));

    // Calculate company statistics
    const totalComplaints = data.hits?.total?.value || complaints.length;
    const disputed = complaints.filter(c => c.consumerDisputed).length;

    // Count issues
    const issueCounts: Record<string, number> = {};
    complaints.forEach(c => {
      issueCounts[c.issue] = (issueCounts[c.issue] || 0) + 1;
    });

    const topIssues = Object.entries(issueCounts)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      success: true,
      complaints,
      totalComplaints,
      companyStats: {
        totalComplaints,
        disputedPercentage: complaints.length > 0 ? (disputed / complaints.length) * 100 : 0,
        avgResponseTime: 'N/A',
        topIssues,
      },
    };
  } catch (error) {
    console.error('CFPB search error:', error);
    return {
      success: false,
      complaints: [],
      totalComplaints: 0,
      error: error instanceof Error ? error.message : 'CFPB search failed',
    };
  }
}

/**
 * Get complaints specific to mortgage/debt collection products
 */
export async function getMortgageComplaints(companyName: string, state?: string): Promise<CFPBSearchResult> {
  return searchCFPBComplaints(companyName, {
    product: 'Mortgage',
    state,
    size: 50,
  });
}

/**
 * Get debt collection complaints
 */
export async function getDebtCollectionComplaints(companyName: string, state?: string): Promise<CFPBSearchResult> {
  return searchCFPBComplaints(companyName, {
    product: 'Debt collection',
    state,
    size: 50,
  });
}

/**
 * Get company complaint summary
 */
export async function getCompanyComplaintSummary(companyName: string): Promise<{
  totalComplaints: number;
  productBreakdown: { product: string; count: number }[];
  recentComplaints: CFPBComplaint[];
  riskScore: number;
}> {
  try {
    const result = await searchCFPBComplaints(companyName, { size: 100 });

    // Calculate product breakdown
    const productCounts: Record<string, number> = {};
    result.complaints.forEach(c => {
      productCounts[c.product] = (productCounts[c.product] || 0) + 1;
    });

    const productBreakdown = Object.entries(productCounts)
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate risk score (higher = more problematic)
    // Based on: total complaints, dispute rate, response issues
    let riskScore = 0;

    if (result.totalComplaints > 1000) riskScore += 30;
    else if (result.totalComplaints > 500) riskScore += 20;
    else if (result.totalComplaints > 100) riskScore += 10;

    const disputeRate = result.companyStats?.disputedPercentage || 0;
    if (disputeRate > 50) riskScore += 30;
    else if (disputeRate > 30) riskScore += 20;
    else if (disputeRate > 10) riskScore += 10;

    const timelyRate = result.complaints.filter(c => c.timelyResponse).length / Math.max(result.complaints.length, 1);
    if (timelyRate < 0.8) riskScore += 20;
    else if (timelyRate < 0.9) riskScore += 10;

    return {
      totalComplaints: result.totalComplaints,
      productBreakdown,
      recentComplaints: result.complaints.slice(0, 10),
      riskScore: Math.min(riskScore, 100),
    };
  } catch (error) {
    return {
      totalComplaints: 0,
      productBreakdown: [],
      recentComplaints: [],
      riskScore: 0,
    };
  }
}
