'use client';

import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { HelpCircle, TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  tooltip?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'profit' | 'loss';
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  tooltip,
  icon: Icon,
  variant = 'default',
  className,
}: MetricCardProps) {
  const isPositive = change !== undefined ? change >= 0 : undefined;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-border/50 bg-card p-4 transition-colors hover:border-border',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 cursor-help text-muted-foreground/60" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {Icon && (
          <div className="rounded-md bg-secondary p-1.5">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="mt-2">
        <p
          className={cn(
            'text-2xl font-semibold tracking-tight',
            variant === 'profit' && 'text-profit',
            variant === 'loss' && 'text-loss'
          )}
        >
          {value}
        </p>

        {change !== undefined && (
          <div className="mt-1 flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-profit" />
            ) : (
              <TrendingDown className="h-3 w-3 text-loss" />
            )}
            <span
              className={cn(
                'text-xs font-medium',
                isPositive ? 'text-profit' : 'text-loss'
              )}
            >
              {isPositive ? '+' : ''}
              {change.toFixed(2)}%
            </span>
            {changeLabel && (
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
