'use client';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SymbolPerformance as SymbolPerfType } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface SymbolPerformanceProps {
  data: SymbolPerfType[];
}

export function SymbolPerformance({ data }: SymbolPerformanceProps) {
  const maxPnl = Math.max(...data.map((d) => Math.abs(d.pnl)));

  return (
    <Card className="border-border/50 bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Symbol Breakdown
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            PnL by trading pair
          </p>
        </div>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {data.map((symbol) => {
            const barWidth = (Math.abs(symbol.pnl) / maxPnl) * 100;
            const isPositive = symbol.pnl >= 0;

            return (
              <div
                key={symbol.symbol}
                className="rounded-md bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {symbol.symbol}
                    </span>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-profit" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-loss" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'font-mono text-sm font-medium',
                      isPositive ? 'text-profit' : 'text-loss'
                    )}
                  >
                    {isPositive ? '+' : ''}${symbol.pnl.toFixed(2)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      isPositive ? 'bg-profit' : 'bg-loss'
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{symbol.trades} trades</span>
                  <span>{symbol.winRate.toFixed(0)}% win rate</span>
                  <span>
                    Avg hold: {Math.round(symbol.avgHoldTime)}m
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
