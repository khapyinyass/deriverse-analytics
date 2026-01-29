'use client';

import { useWallet } from '@/contexts/wallet-context';
import { useApp } from '@/contexts/app-context';

// Dashboard components
import { Header } from '@/components/dashboard/header';
import { ConnectWalletPrompt } from '@/components/dashboard/connect-wallet-prompt';
import { OverviewMetrics } from '@/components/dashboard/overview-metrics';
import { PnLChart } from '@/components/dashboard/pnl-chart';
import { SessionPerformance } from '@/components/dashboard/session-performance';
import { TimeHeatmap } from '@/components/dashboard/time-heatmap';
import { TradeAnalytics } from '@/components/dashboard/trade-analytics';
import { SymbolPerformance } from '@/components/dashboard/symbol-performance';
import { TradeJournal } from '@/components/dashboard/trade-journal';
import { FeeAnalysis } from '@/components/dashboard/fee-analysis';
import { RiskMetrics } from '@/components/dashboard/risk-metrics';
import { InsightsPanel } from '@/components/dashboard/insights-panel';
import { StrategyPerformance } from '@/components/dashboard/strategy-performance';
import { PortfolioSummary } from '@/components/dashboard/portfolio-summary';
import { MarketSelector } from '@/components/dashboard/market-selector';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { wallet, error: walletError, refreshPortfolio, isLoading: isLoadingPortfolio } = useWallet();
  const {
    activeView,
    tradeData,
    selectedSymbol,
    isLoadingTrades,
    updateTradeNote,
    refreshTrades,
  } = useApp();

  // Show connect wallet prompt when not connected
  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <ConnectWalletPrompt />
      </div>
    );
  }

  // Check if wallet has any trades (real data check)
  const hasTrades = tradeData && tradeData.trades.length > 0;
  const hasMetrics = tradeData && tradeData.metrics.totalTrades > 0;

  // Use real metrics or zeros (no fake data)
  const metrics = tradeData?.metrics || {
    totalPnl: 0,
    totalPnlPercent: 0,
    winRate: 0,
    totalTrades: 0,
    totalVolume: 0,
    totalFees: 0,
    longShortRatio: 0,
    avgDuration: 0,
    avgWin: 0,
    avgLoss: 0,
    largestWin: 0,
    largestLoss: 0,
    profitFactor: 0,
    riskRewardRatio: 0,
  };

  const trades = tradeData?.trades || [];
  const dailyPerformance = tradeData?.dailyPerformance || [];
  const sessionPerformance = tradeData?.sessionPerformance || [];
  const symbolPerformance = tradeData?.symbolPerformance || [];
  const hourlyHeatmap = tradeData?.hourlyHeatmap || [];
  const feeBreakdown = tradeData?.feeBreakdown || [];
  const orderTypePerformance = tradeData?.orderTypePerformance || {
    market: { trades: 0, pnl: 0, winRate: 0, avgFee: 0 },
    limit: { trades: 0, pnl: 0, winRate: 0, avgFee: 0 },
  };
  const directionPerformance = tradeData?.directionPerformance || {
    long: { trades: 0, pnl: 0, winRate: 0 },
    short: { trades: 0, pnl: 0, winRate: 0 },
  };
  const strategyPerformance = tradeData?.strategyPerformance || [];
  const insights = tradeData?.insights || [];

  const isLoading = isLoadingTrades || isLoadingPortfolio;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-[1800px] px-4 py-6 md:px-6">
        {/* Error Banner */}
        {walletError && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="flex-1 text-sm text-destructive">{walletError}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshPortfolio}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {/* Sidebar + Main Content Layout */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left Sidebar - Portfolio & Markets */}
          <aside className="w-full shrink-0 space-y-4 lg:w-72">
            <PortfolioSummary />
            <MarketSelector />
          </aside>

          {/* Main Content Area */}
          <div className="min-w-0 flex-1">
            {/* Symbol Filter Indicator */}
            {selectedSymbol && (
              <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
                <p className="text-sm">
                  Filtering by{' '}
                  <span className="font-semibold text-primary">{selectedSymbol}</span>
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && !tradeData && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
                <Skeleton className="h-80" />
              </div>
            )}

            {/* Overview View */}
            {activeView === 'overview' && !isLoading && (
              <>
                <section className="mb-6">
                  <OverviewMetrics metrics={metrics} />
                </section>

                {hasMetrics ? (
                  <>
                    <section className="mb-6 grid gap-4 lg:grid-cols-3">
                      <div className="lg:col-span-2">
                        <PnLChart data={dailyPerformance} />
                      </div>
                      <div>
                        <SessionPerformance data={sessionPerformance} />
                      </div>
                    </section>

                    {insights.length > 0 && (
                      <section className="mb-6">
                        <InsightsPanel insights={insights} />
                      </section>
                    )}

                    <section className="mb-6 grid gap-4 lg:grid-cols-2">
                      <SymbolPerformance data={symbolPerformance} />
                      <TimeHeatmap data={hourlyHeatmap} />
                    </section>
                  </>
                ) : (
                  <section className="mb-6">
                    <EmptyState
                      type="trades"
                      title="No Trading Activity"
                      description="Connect a wallet with Deriverse trading history to see your analytics. All metrics will remain at zero until trades are recorded."
                    />
                  </section>
                )}
              </>
            )}

            {/* Performance View */}
            {activeView === 'performance' && !isLoading && (
              <>
                <section className="mb-6">
                  <OverviewMetrics metrics={metrics} />
                </section>

                {hasMetrics ? (
                  <>
                    <section className="mb-6 grid gap-4 lg:grid-cols-3">
                      <div className="lg:col-span-2">
                        <PnLChart data={dailyPerformance} />
                      </div>
                      <div>
                        <SessionPerformance data={sessionPerformance} />
                      </div>
                    </section>

                    <section className="mb-6">
                      <TradeAnalytics
                        metrics={{
                          avgWin: metrics.avgWin,
                          avgLoss: metrics.avgLoss,
                          largestWin: metrics.largestWin,
                          largestLoss: metrics.largestLoss,
                          profitFactor: metrics.profitFactor,
                        }}
                        orderTypePerf={orderTypePerformance}
                        directionPerf={directionPerformance}
                      />
                    </section>

                    <section className="mb-6 grid gap-4 lg:grid-cols-2">
                      <SymbolPerformance data={symbolPerformance} />
                      <StrategyPerformance data={strategyPerformance} />
                    </section>

                    <section className="mb-6">
                      <TimeHeatmap data={hourlyHeatmap} />
                    </section>
                  </>
                ) : (
                  <section className="mb-6">
                    <EmptyState
                      type="performance"
                      title="No Performance Data"
                      description="Performance metrics require completed trades. Start trading on Deriverse to see detailed analytics."
                    />
                  </section>
                )}
              </>
            )}

            {/* Journal View */}
            {activeView === 'journal' && !isLoading && (
              <>
                <section className="mb-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Trade Journal</CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {hasTrades
                              ? `${trades.length} trades recorded`
                              : 'No trades recorded for this wallet'}
                          </p>
                        </div>
                        {wallet.address && (
                          <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                            {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {hasTrades ? (
                        <TradeJournal trades={trades} onUpdateNote={updateTradeNote} />
                      ) : (
                        <EmptyState
                          type="journal"
                          title="No Trade History"
                          description="Your completed trades will appear here with full details including entry/exit prices, PnL, and notes."
                        />
                      )}
                    </CardContent>
                  </Card>
                </section>
              </>
            )}

            {/* Risk View */}
            {activeView === 'risk' && !isLoading && (
              <>
                <section className="mb-6">
                  <OverviewMetrics metrics={metrics} />
                </section>

                {hasMetrics ? (
                  <>
                    <section className="mb-6 grid gap-4 lg:grid-cols-2">
                      <RiskMetrics
                        data={dailyPerformance}
                        riskRewardRatio={metrics.riskRewardRatio}
                        profitFactor={metrics.profitFactor}
                      />
                      <FeeAnalysis data={feeBreakdown} totalFees={metrics.totalFees} />
                    </section>

                    <section className="mb-6">
                      <TradeAnalytics
                        metrics={{
                          avgWin: metrics.avgWin,
                          avgLoss: metrics.avgLoss,
                          largestWin: metrics.largestWin,
                          largestLoss: metrics.largestLoss,
                          profitFactor: metrics.profitFactor,
                        }}
                        orderTypePerf={orderTypePerformance}
                        directionPerf={directionPerformance}
                      />
                    </section>

                    <section className="mb-6">
                      <StrategyPerformance data={strategyPerformance} />
                    </section>
                  </>
                ) : (
                  <section className="mb-6">
                    <EmptyState
                      type="analytics"
                      title="No Risk Data Available"
                      description="Risk metrics and fee analysis require trading activity. All values will show as zero until trades are executed."
                    />
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
