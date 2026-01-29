'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DailyPerformance } from '@/lib/mock-data';
import { useState, useMemo } from 'react';
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

interface PnLChartProps {
  data: DailyPerformance[];
}

type TimeFrame = 'daily' | 'weekly' | 'monthly';

export function PnLChart({ data }: PnLChartProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>('daily');

  const chartData = useMemo(() => {
    if (timeframe === 'daily') {
      return data.slice(-30).map((d) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pnl: d.cumulativePnl,
        dailyPnl: d.pnl,
        drawdown: -d.drawdown,
      }));
    }

    if (timeframe === 'weekly') {
      const weekly: { date: string; pnl: number; dailyPnl: number; drawdown: number }[] = [];
      let weekPnl = 0;
      let weekStart = '';

      data.forEach((d, i) => {
        const date = new Date(d.date);
        if (date.getDay() === 0 || i === 0) {
          if (weekStart) {
            weekly.push({
              date: weekStart,
              pnl: d.cumulativePnl,
              dailyPnl: weekPnl,
              drawdown: -d.drawdown,
            });
          }
          weekStart = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          weekPnl = d.pnl;
        } else {
          weekPnl += d.pnl;
        }
      });

      if (weekStart) {
        const lastDay = data[data.length - 1];
        weekly.push({
          date: weekStart,
          pnl: lastDay.cumulativePnl,
          dailyPnl: weekPnl,
          drawdown: -lastDay.drawdown,
        });
      }

      return weekly.slice(-12);
    }

    // Monthly
    const monthly = new Map<string, { pnl: number; dailyPnl: number; drawdown: number }>();
    data.forEach((d) => {
      const monthKey = new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!monthly.has(monthKey)) {
        monthly.set(monthKey, { pnl: d.cumulativePnl, dailyPnl: 0, drawdown: -d.drawdown });
      }
      const entry = monthly.get(monthKey)!;
      entry.dailyPnl += d.pnl;
      entry.pnl = d.cumulativePnl;
      entry.drawdown = -d.drawdown;
    });

    return Array.from(monthly.entries()).map(([date, values]) => ({
      date,
      ...values,
    }));
  }, [data, timeframe]);

  const lastValue = chartData[chartData.length - 1]?.pnl || 0;
  const isPositive = lastValue >= 0;

  return (
    <Card className="border-border/50 bg-card p-4">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Cumulative PnL</h3>
          <p className={`text-2xl font-semibold ${isPositive ? 'text-profit' : 'text-loss'}`}>
            {isPositive ? '+' : ''}${lastValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as TimeFrame)}>
          <TabsList className="h-8 bg-secondary">
            <TabsTrigger value="daily" className="h-6 px-2 text-xs">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="h-6 px-2 text-xs">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="h-6 px-2 text-xs">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-5)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-chart-5)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              dx={-10}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                    <p className="text-xs text-muted-foreground">{data.date}</p>
                    <p className="text-sm font-medium text-profit">
                      Cumulative: ${data.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs ${data.dailyPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      Period: {data.dailyPnl >= 0 ? '+' : ''}${data.dailyPnl.toFixed(2)}
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
            <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="var(--color-chart-5)"
              fill="url(#drawdownGradient)"
              strokeWidth={1}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="var(--color-chart-1)"
              fill="url(#pnlGradient)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
