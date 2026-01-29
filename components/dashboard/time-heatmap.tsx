'use client';

import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { HourlyHeatmap } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface TimeHeatmapProps {
  data: HourlyHeatmap[];
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export function TimeHeatmap({ data }: TimeHeatmapProps) {
  const maxPnl = Math.max(...data.map((d) => Math.abs(d.pnl)), 1);

  const getCell = (day: number, hour: number) => {
    return data.find((d) => d.day === day && d.hour === hour);
  };

  const getColor = (pnl: number) => {
    if (pnl === 0) return 'bg-secondary';
    const intensity = Math.min(Math.abs(pnl) / maxPnl, 1);
    if (pnl > 0) {
      if (intensity > 0.6) return 'bg-profit';
      if (intensity > 0.3) return 'bg-profit/60';
      return 'bg-profit/30';
    }
    if (intensity > 0.6) return 'bg-loss';
    if (intensity > 0.3) return 'bg-loss/60';
    return 'bg-loss/30';
  };

  return (
    <Card className="border-border/50 bg-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Time-of-Day Performance
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Profitability by hour and day (UTC)
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hours header */}
          <div className="mb-1 flex">
            <div className="w-10" />
            {hours.filter((_, i) => i % 2 === 0).map((hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-[10px] text-muted-foreground"
              >
                {hour.toString().padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="space-y-1">
            {days.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-1">
                <div className="w-9 text-xs text-muted-foreground">{day}</div>
                <div className="flex flex-1 gap-0.5">
                  <TooltipProvider delayDuration={100}>
                    {hours.map((hour) => {
                      const cell = getCell(dayIndex, hour);
                      const pnl = cell?.pnl || 0;
                      const trades = cell?.trades || 0;

                      return (
                        <Tooltip key={hour}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'h-5 flex-1 cursor-pointer rounded-sm transition-opacity hover:opacity-80',
                                getColor(pnl)
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <p className="font-medium">
                                {day} {hour.toString().padStart(2, '0')}:00
                              </p>
                              <p className={pnl >= 0 ? 'text-profit' : 'text-loss'}>
                                PnL: {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                              </p>
                              <p className="text-muted-foreground">
                                {trades} trade{trades !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-loss" />
              <span>Loss</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-secondary" />
              <span>Neutral</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-profit" />
              <span>Profit</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
