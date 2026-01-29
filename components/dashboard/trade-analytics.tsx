'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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

interface TradeAnalyticsProps {
  metrics: {
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
    profitFactor: number;
  };
  orderTypePerf: {
    market: { trades: number; pnl: number; winRate: number; avgFee: number };
    limit: { trades: number; pnl: number; winRate: number; avgFee: number };
  };
  directionPerf: {
    long: { trades: number; pnl: number; winRate: number };
    short: { trades: number; pnl: number; winRate: number };
  };
}

export function TradeAnalytics({
  metrics,
  orderTypePerf,
  directionPerf,
}: TradeAnalyticsProps) {
  const winLossData = [
    { name: 'Avg Win', value: metrics.avgWin, type: 'win' },
    { name: 'Avg Loss', value: Math.abs(metrics.avgLoss), type: 'loss' },
    { name: 'Max Win', value: metrics.largestWin, type: 'win' },
    { name: 'Max Loss', value: Math.abs(metrics.largestLoss), type: 'loss' },
  ];

  const totalTrades = directionPerf.long.trades + directionPerf.short.trades;
  const longPercent = (directionPerf.long.trades / totalTrades) * 100;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Win/Loss Analysis */}
      <Card className="border-border/50 bg-card p-4">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Win/Loss Analysis
        </h3>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={winLossData}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                width={70}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-popover p-2 shadow-lg">
                      <p className="text-xs text-muted-foreground">{data.name}</p>
                      <p
                        className={cn(
                          'text-sm font-medium',
                          data.type === 'win' ? 'text-profit' : 'text-loss'
                        )}
                      >
                        ${data.value.toFixed(2)}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {winLossData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.type === 'win'
                        ? 'var(--color-profit)'
                        : 'var(--color-loss)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
          <span className="text-xs text-muted-foreground">Profit Factor</span>
          <span
            className={cn(
              'text-sm font-medium',
              metrics.profitFactor >= 1 ? 'text-profit' : 'text-loss'
            )}
          >
            {metrics.profitFactor.toFixed(2)}
          </span>
        </div>
      </Card>

      {/* Order Type & Direction */}
      <Card className="border-border/50 bg-card p-4">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Order Type Performance
        </h3>

        <div className="space-y-4">
          {/* Market vs Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">Market Orders</p>
              <p
                className={cn(
                  'text-lg font-semibold',
                  orderTypePerf.market.pnl >= 0 ? 'text-profit' : 'text-loss'
                )}
              >
                {orderTypePerf.market.pnl >= 0 ? '+' : ''}$
                {orderTypePerf.market.pnl.toFixed(0)}
              </p>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{orderTypePerf.market.trades} trades</span>
                <span>{orderTypePerf.market.winRate.toFixed(0)}% win</span>
              </div>
            </div>
            <div className="rounded-md bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">Limit Orders</p>
              <p
                className={cn(
                  'text-lg font-semibold',
                  orderTypePerf.limit.pnl >= 0 ? 'text-profit' : 'text-loss'
                )}
              >
                {orderTypePerf.limit.pnl >= 0 ? '+' : ''}$
                {orderTypePerf.limit.pnl.toFixed(0)}
              </p>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{orderTypePerf.limit.trades} trades</span>
                <span>{orderTypePerf.limit.winRate.toFixed(0)}% win</span>
              </div>
            </div>
          </div>

          {/* Long vs Short */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Directional Bias</span>
              <span className="text-foreground">
                {longPercent.toFixed(0)}% Long / {(100 - longPercent).toFixed(0)}% Short
              </span>
            </div>
            <Progress value={longPercent} className="h-2" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-md bg-profit/10 px-3 py-2">
                <span className="text-xs text-profit">Long</span>
                <div className="text-right">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      directionPerf.long.pnl >= 0 ? 'text-profit' : 'text-loss'
                    )}
                  >
                    {directionPerf.long.pnl >= 0 ? '+' : ''}$
                    {directionPerf.long.pnl.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {directionPerf.long.winRate.toFixed(0)}% win
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md bg-loss/10 px-3 py-2">
                <span className="text-xs text-loss">Short</span>
                <div className="text-right">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      directionPerf.short.pnl >= 0 ? 'text-profit' : 'text-loss'
                    )}
                  >
                    {directionPerf.short.pnl >= 0 ? '+' : ''}$
                    {directionPerf.short.pnl.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {directionPerf.short.winRate.toFixed(0)}% win
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
