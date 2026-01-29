'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileX2, TrendingUp, BarChart3, BookOpen, AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
  type: 'trades' | 'performance' | 'journal' | 'chart' | 'analytics';
  title?: string;
  description?: string;
}

const emptyStateConfig = {
  trades: {
    icon: FileX2,
    title: 'No Trades Found',
    description: 'This wallet has not executed any trades on Deriverse yet.',
  },
  performance: {
    icon: TrendingUp,
    title: 'No Performance Data',
    description: 'Start trading to see your performance metrics and analytics.',
  },
  journal: {
    icon: BookOpen,
    title: 'Trade Journal Empty',
    description: 'Your trade history will appear here once you start trading.',
  },
  chart: {
    icon: BarChart3,
    title: 'No Chart Data',
    description: 'Chart data will populate as you execute trades.',
  },
  analytics: {
    icon: AlertTriangle,
    title: 'No Analytics Available',
    description: 'Analytics require at least one completed trade.',
  },
};

export function EmptyState({ type, title, description }: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <Card className="border-dashed border-border/50 bg-card/50">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-base font-medium text-foreground">
          {title || config.title}
        </p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description || config.description}
        </p>
      </CardContent>
    </Card>
  );
}

export function EmptyChartState({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`flex ${height} flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/30`}>
      <BarChart3 className="mb-2 h-8 w-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">No data to display</p>
    </div>
  );
}
