/**
 * FINRA TRACE API Service
 *
 * FINRA TRACE (Trade Reporting and Compliance Engine) provides
 * real-time and historical bond trading data including ABS/MBS.
 *
 * Public data available via FINRA's Market Data Center.
 * For real-time/detailed access, FINRA membership or data vendor required.
 *
 * Public URLs:
 * - https://www.finra.org/finra-data/browse-catalog/trace
 * - https://finra-markets.morningstar.com/
 */

import { Trade, TradingStats, TradingDataFilters } from '@/types';

const FINRA_DATA_URL = 'https://finra-markets.morningstar.com/BondCenter';
const TRACE_HISTORICAL_URL = 'https://www.finra.org/finra-data';

export interface TRACEBond {
  cusip: string;
  symbol: string;
  issuer: string;
  coupon: number;
  maturityDate: string;
  lastTradePrice: number;
  lastTradeDate: string;
  lastTradeYield: number;
  volume: number;
  tradeCount: number;
  securityType: string;
  moodyRating?: string;
  spRating?: string;
  fitchRating?: string;
}

export interface TRACETrade {
  tradeId: string;
  cusip: string;
  tradeDate: string;
  tradeTime: string;
  price: number;
  yield: number;
  quantity: number;
  side: 'B' | 'S';
  reportType: 'S' | 'P' | 'M' | 'W';  // Settlement, Primary, Market, When-issued
  dealerType: 'D' | 'C' | 'A';  // Dealer, Customer, ATS
  commission?: number;
  specialCondition?: string;
}

export interface TRACESearchParams {
  cusip?: string;
  symbol?: string;
  issuer?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  securityTypes?: string[];
  minTradeSize?: number;
}

export interface TRACEResponse {
  success: boolean;
  data?: TRACETrade[];
  bond?: TRACEBond;
  stats?: TradingStats;
  error?: string;
}

/**
 * Search FINRA TRACE for bond trading data
 *
 * Note: FINRA's public API has limited access. For production use,
 * you would need to subscribe to FINRA data feeds or use a data vendor
 * like Bloomberg, Refinitiv, or ICE.
 */
export async function searchTRACE(params: TRACESearchParams): Promise<TRACEResponse> {
  try {
    // For demo purposes, we'll simulate the FINRA API response
    // In production, this would call the actual FINRA API or data vendor

    if (!params.cusip && !params.symbol && !params.issuer) {
      return {
        success: false,
        error: 'At least one search parameter required (cusip, symbol, or issuer)',
      };
    }

    // Try to fetch from FINRA's public Morningstar interface
    // This is a simplified example - actual implementation would need proper API access
    const response = await fetchTraceData(params);

    return response;
  } catch (error) {
    console.error('FINRA TRACE search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'TRACE search failed',
    };
  }
}

/**
 * Fetch TRACE data (simulated for demo, actual implementation requires API subscription)
 */
async function fetchTraceData(params: TRACESearchParams): Promise<TRACEResponse> {
  // Note: FINRA doesn't provide a public REST API for real-time TRACE data
  // Options for real data:
  // 1. FINRA Query Language (FQL) - requires FINRA membership
  // 2. Data vendors (Bloomberg B-PIPE, Refinitiv, ICE)
  // 3. FINRA's delayed data via Morningstar (limited)

  // For demonstration, generate sample data based on CUSIP
  if (params.cusip) {
    return generateSampleTraceData(params.cusip, params.dateRange);
  }

  return {
    success: false,
    error: 'CUSIP required for TRACE lookup',
  };
}

/**
 * Generate sample TRACE data for demonstration
 * In production, replace with actual FINRA API calls
 */
function generateSampleTraceData(
  cusip: string,
  dateRange?: { start: string; end: string }
): TRACEResponse {
  const today = new Date();
  const startDate = dateRange?.start ? new Date(dateRange.start) : new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  const endDate = dateRange?.end ? new Date(dateRange.end) : today;

  // Generate realistic-looking trades
  const trades: TRACETrade[] = [];
  let currentDate = new Date(startDate);
  let basePrice = 95 + Math.random() * 10; // Random starting price 95-105

  while (currentDate <= endDate) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // Generate 1-5 trades per day
      const dailyTrades = Math.floor(Math.random() * 5) + 1;

      for (let i = 0; i < dailyTrades; i++) {
        // Random price walk
        basePrice += (Math.random() - 0.5) * 0.5;
        basePrice = Math.max(50, Math.min(150, basePrice)); // Keep in reasonable range

        const hours = 9 + Math.floor(Math.random() * 8); // 9 AM - 5 PM
        const minutes = Math.floor(Math.random() * 60);

        trades.push({
          tradeId: `TRC${cusip}${currentDate.getTime()}${i}`,
          cusip,
          tradeDate: currentDate.toISOString().split('T')[0],
          tradeTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`,
          price: Math.round(basePrice * 100) / 100,
          yield: Math.round((100 / basePrice * 5.5) * 1000) / 1000, // Approximate yield
          quantity: Math.floor(Math.random() * 900000) + 100000, // 100k - 1M
          side: Math.random() > 0.5 ? 'B' : 'S',
          reportType: 'S',
          dealerType: Math.random() > 0.7 ? 'D' : 'C',
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort by date descending
  trades.sort((a, b) => {
    const dateA = new Date(`${a.tradeDate}T${a.tradeTime}`);
    const dateB = new Date(`${b.tradeDate}T${b.tradeTime}`);
    return dateB.getTime() - dateA.getTime();
  });

  // Calculate stats
  const prices = trades.map(t => t.price);
  const yields = trades.map(t => t.yield);
  const volumes = trades.map(t => t.quantity * t.price);

  const stats: TradingStats = {
    totalTrades: trades.length,
    tradeCount: trades.length,
    latestTradeDate: trades[0]?.tradeDate || '',
    averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    averageYield: yields.reduce((a, b) => a + b, 0) / yields.length,
    totalVolume: volumes.reduce((a, b) => a + b, 0),
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
    },
    dateRange: {
      start: trades[trades.length - 1]?.tradeDate || '',
      end: trades[0]?.tradeDate || '',
    },
    volumeByDealer: calculateVolumeByDealer(trades),
    priceHistory: calculatePriceHistory(trades),
  };

  // Simulate bond info
  const bond: TRACEBond = {
    cusip,
    symbol: `${cusip.substring(0, 4)}...`,
    issuer: 'Asset-Backed Securities Trust',
    coupon: 5.5,
    maturityDate: '2035-01-15',
    lastTradePrice: trades[0]?.price || 0,
    lastTradeDate: trades[0]?.tradeDate || '',
    lastTradeYield: trades[0]?.yield || 0,
    volume: trades.reduce((sum, t) => sum + t.quantity, 0),
    tradeCount: trades.length,
    securityType: 'ABS',
    moodyRating: 'Aaa',
    spRating: 'AAA',
  };

  return {
    success: true,
    data: trades,
    bond,
    stats,
  };
}

function calculateVolumeByDealer(trades: TRACETrade[]): { dealer: string; volume: number; percentage: number }[] {
  const dealerVolumes = new Map<string, number>();
  let totalVolume = 0;

  trades.forEach(trade => {
    const volume = trade.quantity * trade.price;
    totalVolume += volume;
    dealerVolumes.set(
      trade.dealerType,
      (dealerVolumes.get(trade.dealerType) || 0) + volume
    );
  });

  const dealerLabels: Record<string, string> = {
    'D': 'Inter-Dealer',
    'C': 'Customer',
    'A': 'ATS',
  };

  return Array.from(dealerVolumes.entries()).map(([type, volume]) => ({
    dealer: dealerLabels[type] || type,
    volume,
    percentage: (volume / totalVolume) * 100,
  }));
}

function calculatePriceHistory(trades: TRACETrade[]): { date: string; price: number }[] {
  const dateMap = new Map<string, { total: number; count: number }>();

  trades.forEach(trade => {
    const existing = dateMap.get(trade.tradeDate);
    if (existing) {
      existing.total += trade.price;
      existing.count += 1;
    } else {
      dateMap.set(trade.tradeDate, { total: trade.price, count: 1 });
    }
  });

  return Array.from(dateMap.entries())
    .map(([date, { total, count }]) => ({
      date,
      price: total / count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Convert TRACE trade to our Trade type
 */
export function convertTRACETrade(traceTrade: TRACETrade): Trade {
  return {
    id: traceTrade.tradeId,
    date: traceTrade.tradeDate,
    tradeDate: traceTrade.tradeDate,
    time: traceTrade.tradeTime,
    price: traceTrade.price.toString(),
    yield: traceTrade.yield.toString(),
    volume: traceTrade.quantity,
    quantity: traceTrade.quantity,
    side: traceTrade.side === 'B' ? 'BUY' : 'SELL',
    buySell: traceTrade.side,
    dealer: traceTrade.dealerType === 'D' ? 'Dealer' : traceTrade.dealerType === 'C' ? 'Customer' : 'ATS',
    reportType: traceTrade.reportType,
    cusip: traceTrade.cusip,
  };
}

/**
 * Get trading data for multiple CUSIPs
 */
export async function getMultipleCUSIPTrades(cusips: string[]): Promise<Map<string, Trade[]>> {
  const results = new Map<string, Trade[]>();

  for (const cusip of cusips) {
    const response = await searchTRACE({ cusip });
    if (response.success && response.data) {
      results.set(cusip, response.data.map(convertTRACETrade));
    } else {
      results.set(cusip, []);
    }
  }

  return results;
}

/**
 * Get real-time quote (simulated)
 */
export async function getQuote(cusip: string): Promise<{
  price: number;
  yield: number;
  change: number;
  changePercent: number;
  volume: number;
  lastTradeTime: string;
} | null> {
  try {
    const response = await searchTRACE({ cusip });

    if (!response.success || !response.data || response.data.length === 0) {
      return null;
    }

    const latestTrade = response.data[0];
    const previousTrade = response.data.length > 1 ? response.data[1] : response.data[0];

    const change = latestTrade.price - previousTrade.price;
    const changePercent = (change / previousTrade.price) * 100;

    return {
      price: latestTrade.price,
      yield: latestTrade.yield,
      change,
      changePercent,
      volume: latestTrade.quantity,
      lastTradeTime: `${latestTrade.tradeDate}T${latestTrade.tradeTime}`,
    };
  } catch (error) {
    console.error('Quote fetch error:', error);
    return null;
  }
}
