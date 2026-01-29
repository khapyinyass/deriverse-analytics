'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MarketSelector() {
  const { markets, selectedSymbol, setSelectedSymbol, isLoadingMarkets } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMarkets = markets.filter(
    (market) =>
      market.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const perpMarkets = filteredMarkets.filter((m) => m.marketType === 'perp');
  const spotMarkets = filteredMarkets.filter((m) => m.marketType === 'spot');

  if (isLoadingMarkets) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Markets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Markets</CardTitle>
          {selectedSymbol && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSymbol(null)}
              className="h-6 gap-1 px-2 text-xs"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-64">
          <div className="space-y-4">
            {perpMarkets.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Perpetuals</p>
                <div className="space-y-1">
                  {perpMarkets.map((market) => (
                    <MarketItem
                      key={market.symbol}
                      symbol={market.symbol}
                      name={market.name}
                      price={market.price}
                      change={market.change24h}
                      isSelected={selectedSymbol === market.symbol}
                      onClick={() => setSelectedSymbol(market.symbol)}
                    />
                  ))}
                </div>
              </div>
            )}

            {spotMarkets.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Spot</p>
                <div className="space-y-1">
                  {spotMarkets.map((market) => (
                    <MarketItem
                      key={market.symbol}
                      symbol={market.symbol}
                      name={market.name}
                      price={market.price}
                      change={market.change24h}
                      isSelected={selectedSymbol === market.symbol}
                      onClick={() => setSelectedSymbol(market.symbol)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface MarketItemProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  isSelected: boolean;
  onClick: () => void;
}

function MarketItem({ symbol, name, price, change, isSelected, onClick }: MarketItemProps) {
  const isPositive = change >= 0;

  const formatPrice = (p: number) => {
    if (p < 0.001) return p.toFixed(8);
    if (p < 1) return p.toFixed(4);
    if (p < 100) return p.toFixed(2);
    return p.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between rounded-md px-2 py-2 text-left transition-colors',
        isSelected
          ? 'bg-primary/10 ring-1 ring-primary/30'
          : 'hover:bg-muted/50'
      )}
    >
      <div className="flex items-center gap-2">
        <div>
          <p className="text-sm font-medium">{symbol}</p>
          <p className="text-xs text-muted-foreground">{name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm">${formatPrice(price)}</p>
        <div
          className={cn(
            'flex items-center justify-end gap-0.5 text-xs',
            isPositive ? 'text-profit' : 'text-loss'
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositive ? '+' : ''}
          {change.toFixed(2)}%
        </div>
      </div>
    </button>
  );
}
