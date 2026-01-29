'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface StrategyData {
  strategy: string;
  trades: number;
  pnl: number;
  winRate: number;
  avgDuration: number;
}

interface StrategyPerformanceProps {
  data: StrategyData[];
}

const strategyLabels: Record<string, string> = {
  scalp: 'Scalp',
  swing: 'Swing',
  hedge: 'Hedge',
  dca: 'DCA',
  breakout: 'Breakout',
};

const strategyDescriptions: Record<string, string> = {
  scalp: 'Quick in-and-out trades',
  swing: 'Multi-day positions',
  hedge: 'Risk mitigation trades',
  dca: 'Dollar cost averaging',
  breakout: 'Momentum breakouts',
};

export function StrategyPerformance({ data }: StrategyPerformanceProps) {
  const chartData = data.map((d) => ({
    ...d,
    name: strategyLabels[d.strategy] || d.strategy,
    description: strategyDescriptions[d.strategy] || '',
  }));

  const bestStrategy = data.reduce((best, s) => (s.pnl > best.pnl ? s : best), data[0]);

  if (data.length === 0) {
    return (
      <Card className="border-border/50 bg-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Strategy Performance</h3>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          No strategy tags found. Add strategy tags to your trades to see performance breakdown.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Strategy Performance</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Best: <span className="text-foreground">{strategyLabels[bestStrategy.strategy]}</span>
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {data.length} strategies
        </Badge>
      </div>

      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-popover p-2 shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-xs text-muted-foreground">{data.description}</p>
                    <div className="mt-2 space-y-1">
                      <p className={cn('text-sm', data.pnl >= 0 ? 'text-profit' : 'text-loss')}>
                        PnL: {data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {data.trades} trades | {data.winRate.toFixed(0)}% win rate
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Avg duration: {Math.round(data.avgDuration)}min
                      </p>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)'}
                  opacity={entry.strategy === bestStrategy.strategy ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {chartData.map((strategy) => (
          <div
            key={strategy.strategy}
            className="flex items-center gap-2 rounded-md bg-secondary/50 px-2 py-1"
          >
            <span className="text-xs font-medium">{strategy.name}</span>
            <span
              className={cn(
                'text-xs',
                strategy.pnl >= 0 ? 'text-profit' : 'text-loss'
              )}
            >
              {strategy.winRate.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
