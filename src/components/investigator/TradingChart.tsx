'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, LineChartIcon, AreaChartIcon, TrendingUp } from 'lucide-react';
import { Trade, TradingStats } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card, Button, Badge } from '@/components/ui';

interface TradingChartProps {
  trades: Trade[];
  stats: TradingStats | null;
}

type ChartType = 'line' | 'bar' | 'area';
type MetricType = 'price' | 'volume' | 'yield';

export function TradingChart({ trades, stats }: TradingChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [metric, setMetric] = useState<MetricType>('price');

  // Aggregate trades by date for charting
  const chartData = useMemo(() => {
    const dateMap = new Map<string, { date: string; price: number; volume: number; yield: number; count: number }>();

    trades.forEach((trade) => {
      const dateKey = trade.date;
      const existing = dateMap.get(dateKey);
      const tradePrice = parseFloat(trade.price) || 0;
      const tradeYield = parseFloat(trade.yield) || 0;

      if (existing) {
        existing.price = (existing.price * existing.count + tradePrice) / (existing.count + 1);
        existing.volume += trade.volume * tradePrice;
        existing.yield = (existing.yield * existing.count + tradeYield) / (existing.count + 1);
        existing.count += 1;
      } else {
        dateMap.set(dateKey, {
          date: dateKey,
          price: tradePrice,
          volume: trade.volume * tradePrice,
          yield: tradeYield,
          count: 1,
        });
      }
    });

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [trades]);

  const metricConfig = {
    price: {
      key: 'price',
      label: 'Price',
      color: 'hsl(var(--primary))',
      format: (v: number) => formatCurrency(v),
    },
    volume: {
      key: 'volume',
      label: 'Volume',
      color: 'hsl(142, 76%, 36%)',
      format: (v: number) => formatCurrency(v),
    },
    yield: {
      key: 'yield',
      label: 'Yield',
      color: 'hsl(38, 92%, 50%)',
      format: (v: number) => `${v.toFixed(2)}%`,
    },
  };

  const currentMetric = metricConfig[metric];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium mb-2">{formatDate(label)}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{currentMetric.format(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 10, bottom: 0 },
    };

    const axisProps = {
      xAxis: (
        <XAxis
          dataKey="date"
          tickFormatter={(date) => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
      ),
      yAxis: (
        <YAxis
          tickFormatter={(v) => {
            if (metric === 'volume') return `$${(v / 1000).toFixed(0)}k`;
            if (metric === 'yield') return `${v.toFixed(1)}%`;
            return `$${v.toFixed(0)}`;
          }}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
      ),
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            {axisProps.xAxis}
            {axisProps.yAxis}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {stats && (
              <ReferenceLine
                y={stats.averagePrice}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                label={{ value: 'Avg', position: 'right', fill: 'hsl(var(--muted-foreground))' }}
              />
            )}
            <Line
              type="monotone"
              dataKey={currentMetric.key}
              name={currentMetric.label}
              stroke={currentMetric.color}
              strokeWidth={2}
              dot={{ fill: currentMetric.color, r: 3 }}
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            {axisProps.xAxis}
            {axisProps.yAxis}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey={currentMetric.key}
              name={currentMetric.label}
              fill={currentMetric.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            {axisProps.xAxis}
            {axisProps.yAxis}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey={currentMetric.key}
              name={currentMetric.label}
              stroke={currentMetric.color}
              strokeWidth={2}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        );
    }
  };

  if (trades.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No Trading Data</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Trading data will appear once you select a trust.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Chart Type:</span>
          <div className="flex gap-1">
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              <AreaChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Metric:</span>
          <div className="flex gap-1">
            <Button
              variant={metric === 'price' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetric('price')}
            >
              Price
            </Button>
            <Button
              variant={metric === 'volume' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetric('volume')}
            >
              Volume
            </Button>
            <Button
              variant={metric === 'yield' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetric('yield')}
            >
              Yield
            </Button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <motion.div
        key={`${chartType}-${metric}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4"
      >
        <ResponsiveContainer width="100%" height={350}>
          {renderChart()}
        </ResponsiveContainer>
      </motion.div>

      {/* Summary Footer */}
      {stats && (
        <div className="flex flex-wrap items-center justify-center gap-4 p-4 border-t bg-muted/30">
          <Badge variant="outline" className="text-xs">
            {chartData.length} data points
          </Badge>
          {stats.dateRange && (
            <Badge variant="outline" className="text-xs">
              Period: {stats.dateRange.start} to {stats.dateRange.end}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            Total Volume: {formatCurrency(stats.totalVolume)}
          </Badge>
        </div>
      )}
    </Card>
  );
}
