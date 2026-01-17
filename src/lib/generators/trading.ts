import { Trade, TradingStats } from '@/types';

const DEALERS = [
  'Goldman Sachs',
  'Morgan Stanley',
  'JP Morgan',
  'Bank of America',
  'Citigroup',
  'Wells Fargo',
  'Credit Suisse',
  'Deutsche Bank',
  'Barclays',
  'UBS',
  'BNP Paribas',
  'RBC Capital',
];

const REPORT_TYPES = [
  'Inter-dealer',
  'Customer Buy',
  'Customer Sell',
  'Customer Trade',
];

/**
 * Generate a random ID for trades
 */
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

/**
 * Generate a random date within a range
 */
const generateRandomDate = (daysBack: number = 90): Date => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  return new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
};

/**
 * Generate a random time in HH:MM:SS format
 */
const generateRandomTime = (): string => {
  const hours = Math.floor(Math.random() * 8) + 8; // 8 AM - 4 PM
  const minutes = Math.floor(Math.random() * 60);
  const seconds = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Generate a single trade record
 */
export const generateTrade = (
  cusip?: string,
  basePrice: number = 100,
  dateRange: number = 90
): Trade => {
  const date = generateRandomDate(dateRange);
  const priceVariation = (Math.random() - 0.5) * 10; // +/- 5%
  const price = basePrice + priceVariation;
  const yieldValue = 4 + Math.random() * 3; // 4% - 7%

  return {
    id: generateId(),
    date: date.toISOString().split('T')[0],
    time: generateRandomTime(),
    price: price.toFixed(4),
    yield: yieldValue.toFixed(4),
    volume: Math.floor(Math.random() * 50 + 1) * 100000, // $100k - $5M
    side: Math.random() > 0.5 ? 'BUY' : 'SELL',
    dealer: DEALERS[Math.floor(Math.random() * DEALERS.length)],
    reportType: REPORT_TYPES[Math.floor(Math.random() * REPORT_TYPES.length)],
    cusip: cusip,
  };
};

/**
 * Generate trading history for a given CUSIP
 */
export const generateTradingHistory = (
  cusip: string,
  count: number = 25,
  basePrice: number = 100
): Trade[] => {
  const trades: Trade[] = [];

  for (let i = 0; i < count; i++) {
    // Vary the base price slightly over time to simulate market movement
    const adjustedBasePrice = basePrice + (Math.random() - 0.5) * 2;
    trades.push(generateTrade(cusip, adjustedBasePrice));
  }

  // Sort by date descending (newest first)
  return trades.sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });
};

/**
 * Calculate trading statistics from trade history
 */
export const calculateTradingStats = (trades: Trade[]): TradingStats => {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      latestTradeDate: '-',
      averagePrice: 0,
      totalVolume: 0,
      priceRange: { min: 0, max: 0 },
      volumeByDealer: [],
      priceHistory: [],
    };
  }

  const prices = trades.map((t) => parseFloat(t.price));
  const totalVolume = trades.reduce((sum, t) => sum + t.volume, 0);

  // Calculate volume by dealer
  const dealerVolumes: Record<string, number> = {};
  trades.forEach((t) => {
    dealerVolumes[t.dealer] = (dealerVolumes[t.dealer] || 0) + t.volume;
  });

  const volumeByDealer = Object.entries(dealerVolumes)
    .map(([dealer, volume]) => ({
      dealer,
      volume,
      percentage: (volume / totalVolume) * 100,
    }))
    .sort((a, b) => b.volume - a.volume);

  // Calculate price history (daily average)
  const pricesByDate: Record<string, number[]> = {};
  trades.forEach((t) => {
    if (!pricesByDate[t.date]) {
      pricesByDate[t.date] = [];
    }
    pricesByDate[t.date].push(parseFloat(t.price));
  });

  const priceHistory = Object.entries(pricesByDate)
    .map(([date, prices]) => ({
      date,
      price: prices.reduce((a, b) => a + b, 0) / prices.length,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    totalTrades: trades.length,
    latestTradeDate: trades[0]?.date || '-',
    averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    totalVolume,
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
    },
    volumeByDealer,
    priceHistory,
  };
};

/**
 * Filter trades based on criteria
 */
export const filterTrades = (
  trades: Trade[],
  filters: {
    dateRange?: { start: string; end: string };
    side?: 'BUY' | 'SELL' | 'ALL';
    minVolume?: number;
    dealer?: string;
  }
): Trade[] => {
  return trades.filter((trade) => {
    if (filters.dateRange) {
      const tradeDate = new Date(trade.date);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      if (tradeDate < startDate || tradeDate > endDate) return false;
    }

    if (filters.side && filters.side !== 'ALL' && trade.side !== filters.side) {
      return false;
    }

    if (filters.minVolume && trade.volume < filters.minVolume) {
      return false;
    }

    if (filters.dealer && trade.dealer !== filters.dealer) {
      return false;
    }

    return true;
  });
};
