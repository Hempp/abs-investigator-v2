export interface Trade {
  id: string;
  date: string;
  tradeDate?: string;
  time: string;
  price: string;
  yield: string;
  volume: number;
  quantity?: number;
  side: 'BUY' | 'SELL';
  buySell?: 'B' | 'S';
  dealer: string;
  reportType: string;
  cusip?: string;
}

export interface TradingStats {
  totalTrades: number;
  tradeCount?: number;
  latestTradeDate: string;
  averagePrice: number;
  averageYield?: number;
  totalVolume: number;
  priceRange: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  volumeByDealer: {
    dealer: string;
    volume: number;
    percentage: number;
  }[];
  priceHistory: {
    date: string;
    price: number;
  }[];
}

export interface TradingDataFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  side?: 'BUY' | 'SELL' | 'ALL';
  minVolume?: number;
  dealer?: string;
}

export type TradingChartView = 'price' | 'volume' | 'activity';
export type TradingTimeframe = '1M' | '3M' | '6M' | '1Y' | 'ALL';
