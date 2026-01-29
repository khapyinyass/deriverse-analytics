'use client';

import { useWallet } from '@/contexts/wallet-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, TrendingUp, Coins, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PortfolioSummary() {
  const { wallet, portfolio, isLoading, refreshPortfolio } = useWallet();

  if (!wallet.connected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Wallet className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Connect wallet to view portfolio</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !portfolio) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!portfolio) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={refreshPortfolio}
          disabled={isLoading}
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          <span className="sr-only">Refresh portfolio</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-bold">
            ${portfolio.totalUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">Total Value</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">SOL Balance</span>
            </div>
            <p className="mt-1 font-mono text-sm font-medium">
              {portfolio.solBalance.toFixed(4)} SOL
            </p>
            <p className="text-xs text-muted-foreground">
              ${portfolio.solUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Tokens</span>
            </div>
            <p className="mt-1 font-mono text-sm font-medium">
              {portfolio.tokens.length} Assets
            </p>
            <p className="text-xs text-muted-foreground">
              ${(portfolio.totalUsdValue - portfolio.solUsdValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {portfolio.tokens.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Token Holdings</p>
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {portfolio.tokens.slice(0, 5).map((token) => (
                <div
                  key={token.mint}
                  className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1.5 text-xs"
                >
                  <span className="font-medium">{token.symbol}</span>
                  <div className="text-right">
                    <span className="font-mono">{token.balance.toFixed(2)}</span>
                    <span className="ml-2 text-muted-foreground">
                      ${token.usdValue.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
