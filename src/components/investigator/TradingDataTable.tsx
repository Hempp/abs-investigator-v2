'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { Trade, TradingStats } from '@/types';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Card,
  Button,
  Badge,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui';

interface TradingDataTableProps {
  trades: Trade[];
  stats: TradingStats | null;
  onExportCSV?: () => void;
}

type SortField = 'date' | 'price' | 'yield' | 'volume' | 'side';
type SortOrder = 'asc' | 'desc';

const PAGE_SIZES = [10, 25, 50, 100];

export function TradingDataTable({ trades, stats, onExportCSV }: TradingDataTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filterBuySell, setFilterBuySell] = useState<string>('all');

  // Filter trades
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (filterBuySell === 'all') return true;
      return trade.side.toLowerCase() === filterBuySell.toLowerCase();
    });
  }, [trades, filterBuySell]);

  // Sort trades
  const sortedTrades = useMemo(() => {
    return [...filteredTrades].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'price':
          aValue = parseFloat(a.price) || 0;
          bValue = parseFloat(b.price) || 0;
          break;
        case 'yield':
          aValue = parseFloat(a.yield) || 0;
          bValue = parseFloat(b.yield) || 0;
          break;
        case 'volume':
          aValue = a.volume;
          bValue = b.volume;
          break;
        case 'side':
          aValue = a.side;
          bValue = b.side;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTrades, sortField, sortOrder]);

  // Paginate
  const paginatedTrades = useMemo(() => {
    const start = page * pageSize;
    return sortedTrades.slice(start, start + pageSize);
  }, [sortedTrades, page, pageSize]);

  const totalPages = Math.ceil(sortedTrades.length / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(0);
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Total Volume</p>
            <p className="text-lg font-bold">{formatCurrency(stats.totalVolume)}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Avg Price</p>
            <p className="text-lg font-bold">{formatCurrency(stats.averagePrice)}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Avg Yield</p>
            <p className="text-lg font-bold">{formatPercentage(stats.averageYield ?? 0)}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Total Trades</p>
            <p className="text-lg font-bold">{stats.tradeCount ?? stats.totalTrades}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Period</p>
            <p className="text-sm font-bold">
              {stats.dateRange ? `${stats.dateRange.start} - ${stats.dateRange.end}` : stats.latestTradeDate}
            </p>
          </Card>
        </div>
      )}

      {/* Table Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filterBuySell}
              onValueChange={(val) => {
                setFilterBuySell(val);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Trades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                <SelectItem value="buy">Buys Only</SelectItem>
                <SelectItem value="sell">Sells Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setPage(0);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {onExportCSV && (
              <Button variant="outline" size="sm" onClick={onExportCSV}>
                <Download className="mr-1 h-3 w-3" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">
                  <button
                    className="flex items-center hover:text-primary"
                    onClick={() => handleSort('date')}
                  >
                    Date
                    <SortIndicator field="date" />
                  </button>
                </th>
                <th className="p-3 text-left font-medium">CUSIP</th>
                <th className="p-3 text-left font-medium">
                  <button
                    className="flex items-center hover:text-primary"
                    onClick={() => handleSort('side')}
                  >
                    Side
                    <SortIndicator field="side" />
                  </button>
                </th>
                <th className="p-3 text-right font-medium">
                  <button
                    className="flex items-center justify-end hover:text-primary"
                    onClick={() => handleSort('volume')}
                  >
                    Volume
                    <SortIndicator field="volume" />
                  </button>
                </th>
                <th className="p-3 text-right font-medium">
                  <button
                    className="flex items-center justify-end hover:text-primary"
                    onClick={() => handleSort('price')}
                  >
                    Price
                    <SortIndicator field="price" />
                  </button>
                </th>
                <th className="p-3 text-right font-medium">
                  <button
                    className="flex items-center justify-end hover:text-primary"
                    onClick={() => handleSort('yield')}
                  >
                    Yield
                    <SortIndicator field="yield" />
                  </button>
                </th>
                <th className="p-3 text-center font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginatedTrades.map((trade, index) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.02 }}
                    className={cn(
                      'border-b transition-colors hover:bg-muted/50',
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    )}
                  >
                    <td className="p-3 whitespace-nowrap">
                      {formatDate(trade.date)}
                    </td>
                    <td className="p-3 font-mono text-xs">{trade.cusip}</td>
                    <td className="p-3">
                      <Badge
                        variant={trade.side === 'BUY' ? 'success' : 'destructive'}
                        className="text-xs"
                      >
                        {trade.side}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono">
                      {trade.volume.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {formatCurrency(parseFloat(trade.price))}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {formatPercentage(parseFloat(trade.yield))}
                    </td>
                    <td className="p-3 text-center">
                      <a
                        href="https://www.finra.org/finra-data/fixed-income/trace"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline text-xs"
                      >
                        FINRA
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t bg-muted/30">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Showing {page * pageSize + 1} to{' '}
            {Math.min((page + 1) * pageSize, sortedTrades.length)} of{' '}
            {sortedTrades.length} trades
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm">
              Page {page + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
