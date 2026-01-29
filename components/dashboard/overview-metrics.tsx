'use client';

import { MetricCard } from './metric-card';
import {
  Activity,
  BarChart3,
  Clock,
  DollarSign,
  Percent,
  Target,
  TrendingUp,
} from 'lucide-react';

interface OverviewMetricsProps {
  metrics: {
    totalPnl: number;
    totalPnlPercent: number;
    winRate: number;
    totalTrades: number;
    totalVolume: number;
    totalFees: number;
    longShortRatio: number;
    avgDuration: number;
  };
}

export function OverviewMetrics({ metrics }: OverviewMetricsProps) {
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (absValue >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours}h ${mins}m`;
    }
    return `${Math.round(minutes)}m`;
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      <MetricCard
        label="Total PnL"
        value={formatCurrency(metrics.totalPnl)}
        change={metrics.totalPnlPercent}
        tooltip="Total profit and loss across all trades"
        icon={DollarSign}
        variant={metrics.totalPnl >= 0 ? 'profit' : 'loss'}
      />
      <MetricCard
        label="Win Rate"
        value={`${metrics.winRate.toFixed(1)}%`}
        tooltip="Percentage of profitable trades"
        icon={Target}
        variant={metrics.winRate >= 50 ? 'profit' : 'loss'}
      />
      <MetricCard
        label="Total Trades"
        value={metrics.totalTrades.toLocaleString()}
        tooltip="Number of closed positions"
        icon={Activity}
      />
      <MetricCard
        label="Volume"
        value={formatCurrency(metrics.totalVolume)}
        tooltip="Total trading volume (notional)"
        icon={BarChart3}
      />
      <MetricCard
        label="Fees Paid"
        value={formatCurrency(metrics.totalFees)}
        tooltip="Total fees including taker, maker, and funding"
        icon={Percent}
      />
      <MetricCard
        label="Long/Short"
        value={metrics.longShortRatio.toFixed(2)}
        tooltip="Ratio of long to short positions"
        icon={TrendingUp}
      />
      <MetricCard
        label="Avg Duration"
        value={formatDuration(metrics.avgDuration)}
        tooltip="Average time positions are held"
        icon={Clock}
      />
    </div>
  );
}
