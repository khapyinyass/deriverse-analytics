'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface FeeData {
  date: string;
  taker: number;
  maker: number;
  funding: number;
  total: number;
}

interface FeeAnalysisProps {
  data: FeeData[];
  totalFees: number;
}

type ViewMode = 'chart' | 'breakdown';

export function FeeAnalysis({ data, totalFees }: FeeAnalysisProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('chart');

  const cumulativeData = useMemo(() => {
    let cumulative = 0;
    return data.map((d) => {
      cumulative += d.total;
      return {
        ...d,
        cumulative,
      };
    });
  }, [data]);

  const feeBreakdown = useMemo(() => {
    const totals = data.reduce(
      (acc, d) => ({
        taker: acc.taker + d.taker,
        maker: acc.maker + d.maker,
        funding: acc.funding + d.funding,
      }),
      { taker: 0, maker: 0, funding: 0 }
    );

    return [
      { name: 'Taker Fees', value: totals.taker, color: 'var(--color-chart-1)' },
      { name: 'Maker Fees', value: totals.maker, color: 'var(--color-chart-2)' },
      { name: 'Funding Fees', value: totals.funding, color: 'var(--color-chart-4)' },
    ];
  }, [data]);

  return (
    <Card className="border-border/50 bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Fee Analysis</h3>
          <p className="mt-1 text-lg font-semibold text-loss">
            -${totalFees.toFixed(2)}
          </p>
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList className="h-8 bg-secondary">
            <TabsTrigger value="chart" className="h-6 px-2 text-xs">
              Over Time
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="h-6 px-2 text-xs">
              Breakdown
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === 'chart' ? (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={cumulativeData.slice(-30)}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-5)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-chart-5)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
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
                      <p className="text-xs text-muted-foreground">
                        {new Date(data.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium text-loss">
                        Cumulative: ${data.cumulative.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Daily: ${data.total.toFixed(2)}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="var(--color-chart-5)"
                fill="url(#feeGradient)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[200px] items-center gap-4">
          <div className="h-full w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {feeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-popover p-2 shadow-lg">
                        <p className="text-xs font-medium">{data.name}</p>
                        <p className="text-sm text-loss">${data.value.toFixed(2)}</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {feeBreakdown.map((fee) => (
              <div key={fee.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: fee.color }}
                  />
                  <span className="text-xs text-muted-foreground">{fee.name}</span>
                </div>
                <span className="text-xs font-medium">${fee.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
