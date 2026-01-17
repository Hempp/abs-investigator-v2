/**
 * OpenFIGI API Service
 *
 * OpenFIGI is a free API (owned by Bloomberg) for mapping securities identifiers.
 * Supports CUSIP, ISIN, SEDOL, ticker lookups.
 *
 * API Docs: https://www.openfigi.com/api
 * Rate Limit: 25 requests/minute (free), 250/minute (with API key)
 */

const OPENFIGI_API_URL = 'https://api.openfigi.com/v3/mapping';
const OPENFIGI_SEARCH_URL = 'https://api.openfigi.com/v3/search';

export interface OpenFIGIMapping {
  idType: 'ID_CUSIP' | 'ID_ISIN' | 'ID_SEDOL' | 'TICKER' | 'ID_BB_GLOBAL';
  idValue: string;
  exchCode?: string;
  micCode?: string;
  currency?: string;
  marketSecDes?: string;
}

export interface FIGIResult {
  figi: string;
  name: string;
  ticker: string;
  exchCode: string;
  compositeFIGI: string;
  securityType: string;
  marketSector: string;
  shareClassFIGI?: string;
  securityType2?: string;
  securityDescription?: string;
}

export interface FIGIResponse {
  data?: FIGIResult[];
  error?: string;
  warning?: string;
}

export interface SecurityInfo {
  cusip: string;
  isin?: string;
  figi?: string;
  name: string;
  ticker?: string;
  securityType: string;
  marketSector: string;
  issuer?: string;
  maturityDate?: string;
  couponRate?: number;
  description?: string;
}

export interface CUSIPSearchResult {
  success: boolean;
  data?: SecurityInfo;
  error?: string;
}

export interface CompanyInfo {
  name: string;
  ticker?: string;
  figi?: string;
  securities: SecurityInfo[];
}

/**
 * Look up security information by CUSIP
 */
export async function lookupByCUSIP(cusip: string): Promise<CUSIPSearchResult> {
  try {
    const apiKey = process.env.OPENFIGI_API_KEY;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-OPENFIGI-APIKEY'] = apiKey;
    }

    const mappings: OpenFIGIMapping[] = [
      { idType: 'ID_CUSIP', idValue: cusip }
    ];

    const response = await fetch(OPENFIGI_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(mappings),
    });

    if (!response.ok) {
      throw new Error(`OpenFIGI API error: ${response.status}`);
    }

    const results: FIGIResponse[] = await response.json();

    if (results.length === 0 || !results[0].data || results[0].data.length === 0) {
      return {
        success: false,
        error: 'No security found for this CUSIP',
      };
    }

    const figiData = results[0].data[0];

    return {
      success: true,
      data: {
        cusip,
        figi: figiData.figi,
        name: figiData.name || figiData.securityDescription || 'Unknown',
        ticker: figiData.ticker,
        securityType: figiData.securityType || figiData.securityType2 || 'Unknown',
        marketSector: figiData.marketSector || 'Unknown',
        description: figiData.securityDescription,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to lookup CUSIP',
    };
  }
}

/**
 * Look up multiple CUSIPs in batch
 */
export async function lookupMultipleCUSIPs(cusips: string[]): Promise<Map<string, CUSIPSearchResult>> {
  const results = new Map<string, CUSIPSearchResult>();

  try {
    const apiKey = process.env.OPENFIGI_API_KEY;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-OPENFIGI-APIKEY'] = apiKey;
    }

    const mappings: OpenFIGIMapping[] = cusips.map(cusip => ({
      idType: 'ID_CUSIP' as const,
      idValue: cusip,
    }));

    const response = await fetch(OPENFIGI_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(mappings),
    });

    if (!response.ok) {
      throw new Error(`OpenFIGI API error: ${response.status}`);
    }

    const figiResults: FIGIResponse[] = await response.json();

    cusips.forEach((cusip, index) => {
      const figiResponse = figiResults[index];

      if (figiResponse.error) {
        results.set(cusip, {
          success: false,
          error: figiResponse.error,
        });
      } else if (figiResponse.data && figiResponse.data.length > 0) {
        const figiData = figiResponse.data[0];
        results.set(cusip, {
          success: true,
          data: {
            cusip,
            figi: figiData.figi,
            name: figiData.name || figiData.securityDescription || 'Unknown',
            ticker: figiData.ticker,
            securityType: figiData.securityType || figiData.securityType2 || 'Unknown',
            marketSector: figiData.marketSector || 'Unknown',
            description: figiData.securityDescription,
          },
        });
      } else {
        results.set(cusip, {
          success: false,
          error: 'No security found',
        });
      }
    });
  } catch (error) {
    // On error, mark all as failed
    cusips.forEach(cusip => {
      results.set(cusip, {
        success: false,
        error: error instanceof Error ? error.message : 'Batch lookup failed',
      });
    });
  }

  return results;
}

/**
 * Search for securities by name/query
 */
export async function searchSecurities(query: string, limit: number = 10): Promise<SecurityInfo[]> {
  try {
    const apiKey = process.env.OPENFIGI_API_KEY;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-OPENFIGI-APIKEY'] = apiKey;
    }

    const response = await fetch(OPENFIGI_SEARCH_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        start: 0,
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenFIGI search error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return [];
    }

    return data.data.map((item: FIGIResult) => ({
      cusip: '', // Search doesn't return CUSIP directly
      figi: item.figi,
      name: item.name || item.securityDescription || 'Unknown',
      ticker: item.ticker,
      securityType: item.securityType || item.securityType2 || 'Unknown',
      marketSector: item.marketSector || 'Unknown',
      description: item.securityDescription,
    }));
  } catch (error) {
    console.error('OpenFIGI search error:', error);
    return [];
  }
}

/**
 * Get ABS/MBS specific security information
 */
export async function getABSSecurityInfo(cusip: string): Promise<SecurityInfo | null> {
  const result = await lookupByCUSIP(cusip);

  if (!result.success || !result.data) {
    return null;
  }

  // Check if it's an ABS/MBS security
  const absSectors = ['Mtge', 'Muni', 'Corp', 'Govt'];
  const absTypes = ['MBS', 'ABS', 'CMO', 'CMBS', 'CLO', 'CDO'];

  const isABS = absSectors.includes(result.data.marketSector) ||
    absTypes.some(type =>
      result.data!.securityType.toUpperCase().includes(type) ||
      result.data!.name.toUpperCase().includes(type)
    );

  if (!isABS) {
    console.log(`CUSIP ${cusip} is not an ABS/MBS security`);
  }

  return result.data;
}
