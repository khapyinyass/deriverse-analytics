'use client';

import { Card } from '@/components/ui/card';
import { Lightbulb, TrendingUp, Clock, Target, Zap } from 'lucide-react';

interface InsightsPanelProps {
  insights: string[];
}

const icons = [TrendingUp, Clock, Target, Zap, Lightbulb];

export function InsightsPanel({ insights }: InsightsPanelProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">Trading Insights</h3>
      </div>
      <div className="space-y-2">
        {insights.map((insight, index) => {
          const Icon = icons[index % icons.length];
          return (
            <div
              key={index}
              className="flex items-start gap-2 rounded-md bg-background/50 p-2"
            >
              <Icon className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground">{insight}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
