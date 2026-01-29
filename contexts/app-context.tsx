'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useWallet } from './wallet-context';
import type {
  DashboardView,
  Trade,
  Metrics,
  TradableAsset,
  DailyPerformance,
  SessionPerformance,
  SymbolPerformance,
  HourlyHeatmap,
} from '@/lib/types';

// ============ Types ============
interface TradeData {
  trades: Trade[];
  metrics: Metrics;
  dailyPerformance: DailyPerformance[];
  sessionPerformance: SessionPerformance[];
  symbolPerformance: SymbolPerformance[];
  hourlyHeatmap: HourlyHeatmap[];
  feeBreakdown: Array<{ date: string; taker: number; maker: number; funding: number; total: number }>;
  orderTypePerformance: {
    market: { trades: number; pnl: number; winRate: number; avgFee: number };
    limit: { trades: number; pnl: number; winRate: number; avgFee: number };
  };
  directionPerformance: {
    long: { trades: number; pnl: number; winRate: number };
    short: { trades: number; pnl: number; winRate: number };
  };
  strategyPerformance: Array<{ strategy: string; trades: number; pnl: number; winRate: number; avgDuration: number }>;
  insights: string[];
}

interface AppContextType {
  // State
  activeView: DashboardView;
  selectedSymbol: string | null;
  markets: TradableAsset[];
  tradeData: TradeData | null;
  isLoadingTrades: boolean;
  isLoadingMarkets: boolean;
  
  // Actions
  setActiveView: (view: DashboardView) => void;
  setSelectedSymbol: (symbol: string | null) => void;
  refreshTrades: () => Promise<void>;
  updateTradeNote: (tradeId: string, note: string) => void;
  exportTrades: () => void;
}

const defaultMetrics: Metrics = {
  totalPnl: 0,
  totalPnlPercent: 0,
  winRate: 0,
  totalTrades: 0,
  totalVolume: 0,
  totalFees: 0,
  longShortRatio: 1,
  avgDuration: 0,
  avgWin: 0,
  avgLoss: 0,
  largestWin: 0,
  largestLoss: 0,
  profitFactor: 0,
  riskRewardRatio: 0,
};

// ============ Context ============
const AppContext = createContext<AppContextType | null>(null);

// ============ Provider Component ============
export function AppProvider({ children }: { children: ReactNode }) {
  const { wallet } = useWallet();
  
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [markets, setMarkets] = useState<TradableAsset[]>([]);
  const [tradeData, setTradeData] = useState<TradeData | null>(null);
  const [isLoadingTrades, setIsLoadingTrades] = useState(false);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);

  // Fetch markets
  const fetchMarkets = useCallback(async () => {
    setIsLoadingMarkets(true);
    try {
      const response = await fetch('/api/markets');
      const data = await response.json();
      if (data.success && data.data) {
        setMarkets(data.data);
      }
    } catch (err) {
      console.error('[v0] Markets fetch error:', err);
    } finally {
      setIsLoadingMarkets(false);
    }
  }, []);

  // Fetch trades for connected wallet
  const fetchTrades = useCallback(async (address: string, symbol?: string | null) => {
    setIsLoadingTrades(true);
    try {
      const params = new URLSearchParams({ address });
      if (symbol) params.append('symbol', symbol);
      
      const response = await fetch(`/api/trades?${params}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setTradeData(data.data);
      }
    } catch (err) {
      console.error('[v0] Trades fetch error:', err);
    } finally {
      setIsLoadingTrades(false);
    }
  }, []);

  // Refresh trades
  const refreshTrades = useCallback(async () => {
    if (wallet.address) {
      await fetchTrades(wallet.address, selectedSymbol);
    }
  }, [wallet.address, selectedSymbol, fetchTrades]);

  // Update trade note
  const updateTradeNote = useCallback((tradeId: string, note: string) => {
    setTradeData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        trades: prev.trades.map(trade =>
          trade.id === tradeId ? { ...trade, notes: note || undefined } : trade
        ),
      };
    });
  }, []);

  // Export trades to CSV
  const exportTrades = useCallback(() => {
    if (!tradeData?.trades.length) return;
    
    const headers = [
      'ID', 'Symbol', 'Market Type', 'Order Type', 'Direction', 'Entry Price', 'Exit Price',
      'Size', 'Leverage', 'PnL', 'PnL %', 'Fees', 'Entry Time', 'Exit Time', 'Duration (min)',
      'Session', 'Strategy', 'Notes', 'Tx Hash'
    ];
    
    const rows = tradeData.trades.map(t => [
      t.id, t.symbol, t.marketType, t.orderType, t.direction,
      t.entryPrice.toFixed(6), t.exitPrice.toFixed(6), t.size.toString(),
      t.leverage.toString(), t.pnl.toFixed(2), t.pnlPercent.toFixed(2),
      t.fees.toFixed(4), t.entryTime, t.exitTime, t.duration.toString(),
      t.session, t.strategy || '', t.notes || '', t.txHash
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deriverse-trades-${wallet.address?.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [tradeData, wallet.address]);

  // Fetch markets on mount
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  // Fetch trades when wallet connects or changes
  useEffect(() => {
    if (wallet.connected && wallet.address) {
      fetchTrades(wallet.address, selectedSymbol);
    } else {
      setTradeData(null);
    }
  }, [wallet.connected, wallet.address, selectedSymbol, fetchTrades]);

  // Reset selected symbol when wallet disconnects
  useEffect(() => {
    if (!wallet.connected) {
      setSelectedSymbol(null);
    }
  }, [wallet.connected]);

  const value: AppContextType = {
    activeView,
    selectedSymbol,
    markets,
    tradeData,
    isLoadingTrades,
    isLoadingMarkets,
    setActiveView,
    setSelectedSymbol,
    refreshTrades,
    updateTradeNote,
    exportTrades,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// ============ Hook ============
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
