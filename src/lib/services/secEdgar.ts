/**
 * SEC EDGAR API Service
 *
 * Free access to SEC filings including ABS/MBS prospectuses.
 * Useful for finding trust information, deal documents, and company data.
 *
 * API Docs: https://www.sec.gov/search-filings/edgar-application-programming-interfaces
 * Updated: 2025-01-18 - Added CIK extraction
 */

const SEC_EDGAR_API = 'https://efts.sec.gov/LATEST/search-index';
const SEC_FULL_TEXT_SEARCH = 'https://efts.sec.gov/LATEST/search-index';
const SEC_COMPANY_SEARCH = 'https://www.sec.gov/cgi-bin/browse-edgar';
const SEC_SUBMISSIONS_API = 'https://data.sec.gov/submissions';

// ABS-related form types
const ABS_FORM_TYPES = [
  'ABS-15G',      // Asset-Backed Issuer Annual Report
  'ABS-EE',       // ABS Electronic Exhibit
  'SF-1',         // Registration of asset-backed securities
  'SF-3',         // Registration of asset-backed securities (shelf)
  '10-D',         // Asset-Backed Issuer Distribution Report
  '10-K',         // Annual Report (for trusts)
  '8-K',          // Current Report
  '424B5',        // Prospectus supplement
  'FWP',          // Free Writing Prospectus
];

export interface SECFiling {
  accessionNumber: string;
  filingDate: string;
  form: string;
  fileNumber: string;
  filmNumber?: string;
  items?: string;
  size?: number;
  isXBRL?: boolean;
  isInlineXBRL?: boolean;
  primaryDocument: string;
  primaryDocDescription?: string;
  filingUrl: string;
}

export interface SECCompany {
  cik: string;
  ein?: string;
  name: string;
  ticker?: string;
  sic?: string;
  sicDescription?: string;
  stateOfIncorporation?: string;
  businessAddress?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  fiscalYearEnd?: string;
  filings: SECFiling[];
}

export interface TrustDocument {
  trustName: string;
  dealId?: string;
  filingDate: string;
  formType: string;
  documentUrl: string;
  prospectusUrl?: string;
  cusips?: string[];
  issuer?: string;
  underwriter?: string;
  dealSize?: number;
  // Company identification
  cik?: string;
  ein?: string;
  stateOfIncorporation?: string;
}

export interface SECSearchResult {
  success: boolean;
  data?: TrustDocument[];
  error?: string;
}

// Company details cache to avoid redundant API calls
const companyCache = new Map<string, { data: SECCompany | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Clean trust name by removing CIK suffixes in various formats
 */
function cleanTrustName(name: string, cik?: string): string {
  if (!name) return 'Unknown Trust';

  let cleaned = name;

  // Remove various CIK suffix patterns
  // Pattern 1: (CIK 0001234567)
  cleaned = cleaned.replace(/\s*\(CIK\s*\d{1,10}\)/gi, '');

  // Pattern 2: (0001234567) - just the number in parens
  cleaned = cleaned.replace(/\s*\(\d{10}\)$/g, '');

  // Pattern 3: CIK: 0001234567
  cleaned = cleaned.replace(/\s*CIK:\s*\d{1,10}/gi, '');

  // Pattern 4: [CIK 0001234567]
  cleaned = cleaned.replace(/\s*\[CIK\s*\d{1,10}\]/gi, '');

  // If specific CIK provided, also remove that exact value
  if (cik) {
    const paddedCik = cik.padStart(10, '0');
    cleaned = cleaned.replace(new RegExp(`\\s*\\(${paddedCik}\\)`, 'g'), '');
    cleaned = cleaned.replace(new RegExp(`\\s*\\(CIK\\s*${paddedCik}\\)`, 'gi'), '');
  }

  return cleaned.trim() || 'Unknown Trust';
}

/**
 * Search for ABS/MBS trust filings
 */
export async function searchABSFilings(query: string, dateRange?: { start: string; end: string }): Promise<SECSearchResult> {
  try {
    // SEC full-text search
    const params = new URLSearchParams({
      q: query,
      dateRange: 'custom',
      startdt: dateRange?.start || '2000-01-01',
      enddt: dateRange?.end || new Date().toISOString().split('T')[0],
      forms: ABS_FORM_TYPES.join(','),
    });

    // Note: SEC's full-text search API requires specific formatting
    const searchUrl = `${SEC_FULL_TEXT_SEARCH}?${params.toString()}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'ABS Investigator v2 (educational/research purposes)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Fall back to simpler company search
      return await searchByCompany(query);
    }

    const data = await response.json();

    const documents: TrustDocument[] = (data.hits?.hits || []).map((hit: any) => {
      const rawCik = hit._source?.ciks?.[0];
      // Validate CIK - must be 1-10 digits only
      const validCik = rawCik && /^\d{1,10}$/.test(rawCik) ? rawCik.padStart(10, '0') : undefined;

      // Clean trust name - remove CIK suffix in various formats
      let trustName = hit._source?.display_names?.[0] || hit._source?.entity || 'Unknown Trust';
      trustName = cleanTrustName(trustName, rawCik);

      return {
        trustName,
        filingDate: hit._source?.file_date || '',
        formType: hit._source?.form || '',
        documentUrl: validCik
          ? `https://www.sec.gov/Archives/edgar/data/${validCik}/${hit._id.replace(/-/g, '')}`
          : undefined,
        issuer: hit._source?.entity,
        // Company identification
        cik: validCik,
      };
    });

    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error('SEC EDGAR search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SEC search failed',
    };
  }
}

/**
 * Search SEC by company/entity name
 */
async function searchByCompany(companyName: string): Promise<SECSearchResult> {
  try {
    // Use SEC company search API
    const params = new URLSearchParams({
      action: 'getcompany',
      company: companyName,
      type: '',
      dateb: '',
      owner: 'include',
      count: '40',
      output: 'atom',
    });

    const response = await fetch(`${SEC_COMPANY_SEARCH}?${params.toString()}`, {
      headers: {
        'User-Agent': 'ABS Investigator v2 (educational/research purposes)',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `SEC company search failed: ${response.status}`,
      };
    }

    const text = await response.text();

    // Parse Atom feed (simple regex extraction for demo)
    const entries: TrustDocument[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(text)) !== null) {
      const entry = match[1];
      const title = entry.match(/<title[^>]*>([^<]+)<\/title>/)?.[1] || '';
      const link = entry.match(/<link[^>]*href="([^"]+)"/)?.[1] || '';
      const updated = entry.match(/<updated>([^<]+)<\/updated>/)?.[1] || '';
      const formType = entry.match(/<category[^>]*term="([^"]+)"/)?.[1] || '';

      if (title && link) {
        // Extract and validate CIK from SEC link if available
        const cikMatch = link.match(/\/data\/(\d+)\//);
        const rawCik = cikMatch ? cikMatch[1] : undefined;
        const validCik = rawCik && /^\d{1,10}$/.test(rawCik) ? rawCik.padStart(10, '0') : undefined;

        entries.push({
          trustName: cleanTrustName(title, rawCik),
          filingDate: updated.split('T')[0],
          formType,
          documentUrl: link,
          cik: validCik,
        });
      }
    }

    return {
      success: true,
      data: entries,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Company search failed',
    };
  }
}

/**
 * Get company details by CIK (with caching)
 */
export async function getCompanyByCIK(cik: string): Promise<SECCompany | null> {
  try {
    // Validate CIK format
    if (!cik || !/^\d{1,10}$/.test(cik)) {
      console.warn('Invalid CIK format:', cik);
      return null;
    }

    // Pad CIK to 10 digits
    const paddedCIK = cik.padStart(10, '0');

    // Check cache first
    const cached = companyCache.get(paddedCIK);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const response = await fetch(`${SEC_SUBMISSIONS_API}/CIK${paddedCIK}.json`, {
      headers: {
        'User-Agent': 'ABS Investigator v2 (educational/research purposes)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Cache negative result to avoid repeated failed requests
      companyCache.set(paddedCIK, { data: null, timestamp: Date.now() });
      return null;
    }

    const data = await response.json();

    const filings: SECFiling[] = [];
    const recentFilings = data.filings?.recent || {};

    for (let i = 0; i < Math.min(50, recentFilings.accessionNumber?.length || 0); i++) {
      filings.push({
        accessionNumber: recentFilings.accessionNumber[i],
        filingDate: recentFilings.filingDate[i],
        form: recentFilings.form[i],
        fileNumber: recentFilings.fileNumber?.[i] || '',
        primaryDocument: recentFilings.primaryDocument?.[i] || '',
        filingUrl: `https://www.sec.gov/Archives/edgar/data/${paddedCIK}/${recentFilings.accessionNumber[i].replace(/-/g, '')}`,
      });
    }

    const company: SECCompany = {
      cik: data.cik,
      ein: data.ein,
      name: data.name,
      ticker: data.tickers?.[0],
      sic: data.sic,
      sicDescription: data.sicDescription,
      stateOfIncorporation: data.stateOfIncorporation,
      businessAddress: data.addresses?.business ? {
        street1: data.addresses.business.street1,
        street2: data.addresses.business.street2,
        city: data.addresses.business.city,
        state: data.addresses.business.stateOrCountry,
        zip: data.addresses.business.zipCode,
      } : undefined,
      fiscalYearEnd: data.fiscalYearEnd,
      filings,
    };

    // Cache the result
    companyCache.set(paddedCIK, { data: company, timestamp: Date.now() });

    return company;
  } catch (error) {
    console.error('SEC company lookup error:', error);
    return null;
  }
}

/**
 * Search for ABS prospectuses containing specific CUSIP
 */
export async function searchProspectusByCUSIP(cusip: string): Promise<TrustDocument[]> {
  try {
    const result = await searchABSFilings(cusip);

    if (!result.success || !result.data) {
      return [];
    }

    // Filter to prospectus-related forms
    const prospectusTypes = ['424B5', 'SF-1', 'SF-3', 'FWP', 'ABS-EE'];

    return result.data.filter(doc =>
      prospectusTypes.some(type => doc.formType.includes(type))
    );
  } catch (error) {
    console.error('Prospectus search error:', error);
    return [];
  }
}

/**
 * Get ABS issuer information
 */
export async function getABSIssuerInfo(issuerName: string): Promise<{
  issuer: SECCompany | null;
  recentDeals: TrustDocument[];
}> {
  try {
    // Search for the issuer's filings
    const searchResult = await searchABSFilings(issuerName);

    // Try to get company details if we found a CIK
    let issuer: SECCompany | null = null;

    if (searchResult.data && searchResult.data.length > 0) {
      // Use CIK from TrustDocument if available
      const cik = searchResult.data[0].cik;
      if (cik) {
        issuer = await getCompanyByCIK(cik);
      }
    }

    return {
      issuer,
      recentDeals: searchResult.data || [],
    };
  } catch (error) {
    console.error('ABS issuer lookup error:', error);
    return {
      issuer: null,
      recentDeals: [],
    };
  }
}

/**
 * Get trust deal documents
 */
export async function getTrustDocuments(trustName: string): Promise<TrustDocument[]> {
  const result = await searchABSFilings(trustName);
  return result.data || [];
}
