'use client';

import { Card } from '@/components/ui/card';
import type { SessionPerformance as SessionPerfType } from '@/lib/mock-data';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SessionPerformanceProps {
  data: SessionPerfType[];
}

const sessionLabels: Record<string, string> = {
  asia: 'Asia',
  london: 'London',
  'new-york': 'New York',
};

const sessionTimes: Record<string, string> = {
  asia: '00:00 - 08:00 UTC',
  london: '08:00 - 16:00 UTC',
  'new-york': '16:00 - 00:00 UTC',
};

export function SessionPerformance({ data }: SessionPerformanceProps) {
  const chartData = data.map((d) => ({
    ...d,
    name: sessionLabels[d.session],
    time: sessionTimes[d.session],
  }));

  const bestSession = data.reduce((best, s) => (s.pnl > best.pnl ? s : best));

  return (
    <Card className="border-border/50 bg-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Session Performance</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Best: <span className="text-foreground">{sessionLabels[bestSession.session]}</span>
        </p>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
              width={60}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                    <p className="font-medium text-foreground">{data.name}</p>
                    <p className="text-xs text-muted-foreground">{data.time}</p>
                    <div className="mt-2 space-y-1">
                      <p className={`text-sm ${data.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        PnL: {data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Win Rate: {data.winRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Trades: {data.trades}
                      </p>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)'}
                  opacity={entry.session === bestSession.session ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {chartData.map((session) => (
          <div key={session.session} className="rounded-md bg-secondary/50 p-2 text-center">
            <p className="text-xs text-muted-foreground">{session.name}</p>
            <p className="text-sm font-medium">{session.winRate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">{session.trades} trades</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
