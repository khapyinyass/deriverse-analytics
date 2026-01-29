'use client';

import { Card } from '@/components/ui/card';
import type { DailyPerformance } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';

interface RiskMetricsProps {
  data: DailyPerformance[];
  riskRewardRatio: number;
  profitFactor: number;
}

export function RiskMetrics({ data, riskRewardRatio, profitFactor }: RiskMetricsProps) {
  const maxDrawdown = Math.max(...data.map((d) => d.drawdown));
  const currentDrawdown = data[data.length - 1]?.drawdown || 0;

  const equityData = data.slice(-60).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    equity: d.equity,
    drawdown: -d.drawdown,
  }));

  const startingEquity = 10000;
  const currentEquity = data[data.length - 1]?.equity || startingEquity;
  const returnPercent = ((currentEquity - startingEquity) / startingEquity) * 100;

  return (
    <Card className="border-border/50 bg-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Equity Curve & Risk</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-semibold">
            ${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className={cn('text-sm', returnPercent >= 0 ? 'text-profit' : 'text-loss')}>
            {returnPercent >= 0 ? '+' : ''}
            {returnPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              domain={['dataMin - 500', 'dataMax + 500']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-popover p-2 shadow-lg">
                    <p className="text-xs text-muted-foreground">{data.date}</p>
                    <p className="text-sm font-medium text-profit">
                      Equity: ${data.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    {data.drawdown < 0 && (
                      <p className="text-xs text-loss">
                        Drawdown: {data.drawdown.toFixed(2)}%
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <ReferenceLine
              y={startingEquity}
              stroke="var(--color-muted-foreground)"
              strokeDasharray="3 3"
              opacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="var(--color-chart-1)"
              fill="url(#equityGradient)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Metrics Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md bg-secondary/50 p-2 text-center">
          <p className="text-xs text-muted-foreground">Max Drawdown</p>
          <p className="text-sm font-semibold text-loss">-{maxDrawdown.toFixed(2)}%</p>
        </div>
        <div className="rounded-md bg-secondary/50 p-2 text-center">
          <p className="text-xs text-muted-foreground">Current DD</p>
          <p className={cn('text-sm font-semibold', currentDrawdown > 0 ? 'text-loss' : 'text-foreground')}>
            {currentDrawdown > 0 ? `-${currentDrawdown.toFixed(2)}%` : '0%'}
          </p>
        </div>
        <div className="rounded-md bg-secondary/50 p-2 text-center">
          <p className="text-xs text-muted-foreground">Risk/Reward</p>
          <p className={cn('text-sm font-semibold', riskRewardRatio >= 1 ? 'text-profit' : 'text-loss')}>
            {riskRewardRatio.toFixed(2)}
          </p>
        </div>
        <div className="rounded-md bg-secondary/50 p-2 text-center">
          <p className="text-xs text-muted-foreground">Profit Factor</p>
          <p className={cn('text-sm font-semibold', profitFactor >= 1 ? 'text-profit' : 'text-loss')}>
            {profitFactor.toFixed(2)}
          </p>
        </div>
      </div>
    </Card>
  );
}
