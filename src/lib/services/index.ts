/**
 * Data Services Index
 *
 * Exports all data service modules for:
 * - OpenFIGI (CUSIP/security lookups)
 * - SEC EDGAR (company/filing data)
 * - FINRA TRACE (trading data)
 * - Bloomberg (enterprise, requires license)
 * - Unified Data Service (combines all sources)
 */

// OpenFIGI - Free CUSIP/security lookups
export {
  lookupByCUSIP,
  lookupMultipleCUSIPs,
  searchSecurities as searchSecuritiesOpenFIGI,
  getABSSecurityInfo,
  type SecurityInfo,
  type CUSIPSearchResult,
} from './openfigi';

// SEC EDGAR - Company and filing data
export {
  searchABSFilings,
  getCompanyByCIK,
  searchProspectusByCUSIP,
  getABSIssuerInfo,
  getTrustDocuments,
  type SECFiling,
  type SECCompany,
  type TrustDocument,
} from './secEdgar';

// FINRA TRACE - Bond trading data
export {
  searchTRACE,
  convertTRACETrade,
  getMultipleCUSIPTrades,
  getQuote,
  type TRACEBond,
  type TRACETrade,
  type TRACESearchParams,
} from './finraTrace';

// Bloomberg - Enterprise data (requires license)
export {
  isBloombergConfigured,
  getBloombergConfig,
  BloombergNotConfiguredError,
  BLOOMBERG_SETUP_GUIDE,
  type BloombergConfig,
  type BloombergSecurityData,
  type BloombergQuote,
  type BloombergTrade,
  type BloombergCompany,
} from './bloomberg';

// GLEIF - LEI/GMEI Entity Lookups (Free)
export {
  lookupByLEI,
  searchByName as searchEntitiesByName,
  searchByJurisdiction,
  getEntityRelationships,
  getChildEntities,
  getEntitySecurities,
  validateLEI,
  formatLEI,
  type LEIRecord,
  type LEIRelationship,
  type LEISearchResult,
  type LEISearchResponse,
  type EntitySecurities,
} from './gleif';

// Unified Data Service - Combines all sources
export {
  checkDataSources,
  lookupSecurity,
  lookupMultipleSecurities,
  getTradingData,
  searchTrusts as searchTrustsOnline,
  getIssuerInfo,
  getTrustFilings,
  investigateCUSIP,
  type DataSource,
  type DataSourceStatus,
  type UnifiedSecurityData,
  type UnifiedCompanyData,
  type UnifiedTradingData,
} from './dataService';
