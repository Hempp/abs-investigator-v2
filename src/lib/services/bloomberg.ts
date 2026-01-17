/**
 * Bloomberg API Service
 *
 * Bloomberg offers several API products for market data:
 *
 * 1. Bloomberg Terminal API (BLPAPI)
 *    - Requires Bloomberg Terminal license ($24k+/year)
 *    - Desktop API for Excel, Python, etc.
 *    - Full access to real-time and historical data
 *
 * 2. Bloomberg B-PIPE
 *    - Enterprise real-time data feed
 *    - Direct connection to Bloomberg network
 *    - Requires enterprise agreement ($$$)
 *
 * 3. Bloomberg Data License
 *    - Bulk historical/reference data
 *    - Used for building databases
 *    - Enterprise pricing
 *
 * 4. Bloomberg Enterprise Access Point (BEAP)
 *    - Cloud-hosted API access
 *    - REST/WebSocket APIs
 *    - Enterprise pricing
 *
 * This module provides the interface types and placeholder functions
 * that would be used with actual Bloomberg API access.
 *
 * For free alternatives, see:
 * - OpenFIGI (owned by Bloomberg, free)
 * - SEC EDGAR
 * - FINRA TRACE
 */

export interface BloombergConfig {
  apiType: 'desktop' | 'bpipe' | 'datalicense' | 'beap';
  host?: string;
  port?: number;
  authToken?: string;
  applicationName?: string;
}

export interface BloombergSecurityData {
  ticker: string;
  cusip?: string;
  isin?: string;
  figi?: string;
  name: string;
  securityType: string;
  issuer: string;
  issuerCountry?: string;
  currency: string;
  exchange?: string;
  marketSector: string;
  industryGroup?: string;
  industrySector?: string;
  // Bond-specific
  coupon?: number;
  maturityDate?: string;
  issueDate?: string;
  dayCountConvention?: string;
  callSchedule?: Array<{ date: string; price: number }>;
  // ABS-specific
  dealName?: string;
  tranche?: string;
  originalFaceAmount?: number;
  currentFaceAmount?: number;
  factor?: number;
  poolNumber?: string;
  collateralType?: string;
  wac?: number; // Weighted average coupon
  wam?: number; // Weighted average maturity
  // Ratings
  moodyRating?: string;
  spRating?: string;
  fitchRating?: string;
}

export interface BloombergQuote {
  ticker: string;
  lastPrice: number;
  lastPriceTime: string;
  bidPrice: number;
  askPrice: number;
  bidSize: number;
  askSize: number;
  volume: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  // Bond-specific
  yield?: number;
  yieldToMaturity?: number;
  yieldToWorst?: number;
  duration?: number;
  modifiedDuration?: number;
  spread?: number;
  zSpread?: number;
  oas?: number; // Option-adjusted spread
}

export interface BloombergHistoricalData {
  ticker: string;
  field: string;
  periodicity: 'daily' | 'weekly' | 'monthly';
  data: Array<{
    date: string;
    value: number;
  }>;
}

export interface BloombergTrade {
  ticker: string;
  cusip?: string;
  tradeDate: string;
  tradeTime: string;
  price: number;
  yield: number;
  size: number;
  side: 'B' | 'S';
  tradeType: string;
  source: string;
  conditionCodes?: string[];
}

export interface BloombergCompany {
  ticker: string;
  name: string;
  legalName: string;
  country: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  phone: string;
  website?: string;
  lei?: string; // Legal Entity Identifier
  cik?: string; // SEC CIK
  industrySector: string;
  industryGroup: string;
  industrySubGroup?: string;
  employees?: number;
  founded?: string;
  exchange: string;
  marketCap?: number;
  enterpriseValue?: number;
}

export interface BloombergAPIError {
  code: string;
  message: string;
  category: 'auth' | 'data' | 'network' | 'limit';
}

/**
 * Bloomberg API Status
 */
export type BloombergConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'authenticated'
  | 'error';

/**
 * Check if Bloomberg API is configured
 */
export function isBloombergConfigured(): boolean {
  return !!(
    process.env.BLOOMBERG_API_TYPE &&
    (process.env.BLOOMBERG_AUTH_TOKEN || process.env.BLOOMBERG_HOST)
  );
}

/**
 * Get Bloomberg configuration from environment
 */
export function getBloombergConfig(): BloombergConfig | null {
  if (!isBloombergConfigured()) {
    return null;
  }

  return {
    apiType: (process.env.BLOOMBERG_API_TYPE as BloombergConfig['apiType']) || 'desktop',
    host: process.env.BLOOMBERG_HOST,
    port: process.env.BLOOMBERG_PORT ? parseInt(process.env.BLOOMBERG_PORT) : undefined,
    authToken: process.env.BLOOMBERG_AUTH_TOKEN,
    applicationName: process.env.BLOOMBERG_APP_NAME || 'ABS-Investigator',
  };
}

/**
 * Placeholder: Get security data from Bloomberg
 *
 * In production, this would use BLPAPI or BEAP to fetch security reference data.
 */
export async function getSecurityData(
  identifiers: string[],
  identifierType: 'cusip' | 'isin' | 'ticker' | 'figi' = 'cusip'
): Promise<BloombergSecurityData[]> {
  if (!isBloombergConfigured()) {
    throw new BloombergNotConfiguredError();
  }

  // This would be replaced with actual Bloomberg API call
  // Example BLPAPI request:
  // session.openService("//blp/refdata");
  // request = service.createRequest("ReferenceDataRequest");
  // request.getElement("securities").appendValue("CUSIP identifier");
  // request.getElement("fields").appendValue("NAME");
  // request.getElement("fields").appendValue("SECURITY_TYP");
  // etc.

  throw new Error('Bloomberg API not implemented. Please configure Bloomberg access or use OpenFIGI for free CUSIP lookups.');
}

/**
 * Placeholder: Get real-time quotes from Bloomberg
 */
export async function getQuotes(tickers: string[]): Promise<BloombergQuote[]> {
  if (!isBloombergConfigured()) {
    throw new BloombergNotConfiguredError();
  }

  throw new Error('Bloomberg API not implemented. Please configure Bloomberg access.');
}

/**
 * Placeholder: Get historical data from Bloomberg
 */
export async function getHistoricalData(
  ticker: string,
  field: string,
  startDate: string,
  endDate: string,
  periodicity: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<BloombergHistoricalData> {
  if (!isBloombergConfigured()) {
    throw new BloombergNotConfiguredError();
  }

  throw new Error('Bloomberg API not implemented. Please configure Bloomberg access.');
}

/**
 * Placeholder: Get trade data from Bloomberg
 */
export async function getTrades(
  cusip: string,
  startDate: string,
  endDate: string
): Promise<BloombergTrade[]> {
  if (!isBloombergConfigured()) {
    throw new BloombergNotConfiguredError();
  }

  throw new Error('Bloomberg API not implemented. Use FINRA TRACE for ABS trading data.');
}

/**
 * Placeholder: Get company data from Bloomberg
 */
export async function getCompanyData(ticker: string): Promise<BloombergCompany> {
  if (!isBloombergConfigured()) {
    throw new BloombergNotConfiguredError();
  }

  throw new Error('Bloomberg API not implemented. Use SEC EDGAR for company data.');
}

/**
 * Placeholder: Search securities in Bloomberg
 */
export async function searchSecurities(
  query: string,
  filters?: {
    securityType?: string;
    marketSector?: string;
    country?: string;
  }
): Promise<BloombergSecurityData[]> {
  if (!isBloombergConfigured()) {
    throw new BloombergNotConfiguredError();
  }

  throw new Error('Bloomberg API not implemented. Use OpenFIGI for security search.');
}

/**
 * Custom error for Bloomberg not configured
 */
export class BloombergNotConfiguredError extends Error {
  constructor() {
    super(
      'Bloomberg API is not configured. To use Bloomberg data:\n' +
      '1. Obtain Bloomberg Terminal license ($24k+/year) for Desktop API, or\n' +
      '2. Contact Bloomberg for B-PIPE/Enterprise pricing, or\n' +
      '3. Use free alternatives:\n' +
      '   - OpenFIGI (free, Bloomberg-owned): CUSIP/ISIN lookups\n' +
      '   - SEC EDGAR: Company filings and ABS prospectuses\n' +
      '   - FINRA TRACE: Bond trading data'
    );
    this.name = 'BloombergNotConfiguredError';
  }
}

/**
 * Bloomberg API setup instructions
 */
export const BLOOMBERG_SETUP_GUIDE = `
## Bloomberg Terminal API Setup

### Prerequisites
- Active Bloomberg Terminal subscription ($24,000+/year)
- Bloomberg Professional license
- Desktop API entitlement

### Installation

1. **Install Bloomberg Desktop API**
   - Open Bloomberg Terminal
   - Type: WAPI <GO>
   - Download API SDK for your platform

2. **Python Integration**
   \`\`\`bash
   pip install blpapi
   \`\`\`

3. **Environment Variables**
   \`\`\`bash
   BLOOMBERG_API_TYPE=desktop
   BLOOMBERG_HOST=localhost
   BLOOMBERG_PORT=8194
   \`\`\`

### For Cloud/Server Deployment
Contact Bloomberg for B-PIPE or Enterprise Access Point (BEAP) options.

---

## Free Alternatives (Recommended for Most Users)

### OpenFIGI (Bloomberg-owned, Free)
- URL: https://www.openfigi.com/
- API Key: Free registration
- Use: CUSIP/ISIN/FIGI lookups

### SEC EDGAR (Free)
- URL: https://www.sec.gov/search-filings
- No API key needed
- Use: Company filings, ABS prospectuses

### FINRA TRACE (Free delayed data)
- URL: https://finra-markets.morningstar.com/
- Use: Bond trading data
`;
