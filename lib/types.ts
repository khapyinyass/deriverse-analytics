// Core types for Deriverse Analytics Dashboard

// ============ Wallet Types ============
export interface WalletState {
  connected: boolean;
  address: string | null;
  shortAddress: string | null;
  connecting: boolean;
  disconnecting: boolean;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  mint: string;
  balance: number;
  usdValue: number;
  decimals: number;
  logoUri?: string;
}

export interface WalletPortfolio {
  address: string;
  solBalance: number;
  solUsdValue: number;
  tokens: TokenBalance[];
  totalUsdValue: number;
  lastUpdated: string;
}

// ============ Market Types ============
export type MarketType = 'spot' | 'perp' | 'options';
export type OrderType = 'market' | 'limit';
export type Direction = 'long' | 'short';
export type StrategyTag = 'scalp' | 'swing' | 'hedge' | 'dca' | 'breakout';
export type TradingSession = 'asia' | 'london' | 'new-york';
export type FeeType = 'taker' | 'maker' | 'funding';

export interface TradableAsset {
  symbol: string;
  name: string;
  marketType: MarketType;
  price: number;
  change24h: number;
  volume24h: number;
  logoUri?: string;
}

// ============ Trade Types ============
export interface Trade {
  id: string;
  walletAddress: string;
  symbol: string;
  marketType: MarketType;
  orderType: OrderType;
  direction: Direction;
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  fees: number;
  feeBreakdown: { type: FeeType; amount: number }[];
  entryTime: string;
  exitTime: string;
  duration: number;
  session: TradingSession;
  strategy?: StrategyTag;
  notes?: string;
  txHash: string;
}

// ============ Performance Types ============
export interface DailyPerformance {
  date: string;
  pnl: number;
  cumulativePnl: number;
  trades: number;
  volume: number;
  fees: number;
  winRate: number;
  drawdown: number;
  equity: number;
}

export interface SessionPerformance {
  session: TradingSession;
  pnl: number;
  trades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
}

export interface SymbolPerformance {
  symbol: string;
  pnl: number;
  trades: number;
  winRate: number;
  volume: number;
  avgHoldTime: number;
}

export interface HourlyHeatmap {
  hour: number;
  day: number;
  pnl: number;
  trades: number;
}

export interface Metrics {
  totalPnl: number;
  totalPnlPercent: number;
  winRate: number;
  totalTrades: number;
  totalVolume: number;
  totalFees: number;
  longShortRatio: number;
  avgDuration: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
  riskRewardRatio: number;
}

// ============ API Response Types ============
export interface PortfolioResponse {
  success: boolean;
  data?: WalletPortfolio;
  error?: string;
}

export interface TradesResponse {
  success: boolean;
  data?: {
    trades: Trade[];
    metrics: Metrics;
  };
  error?: string;
}

export interface MarketsResponse {
  success: boolean;
  data?: TradableAsset[];
  error?: string;
}

// ============ App State Types ============
export type DashboardView = 'overview' | 'performance' | 'journal' | 'risk';

export interface AppState {
  wallet: WalletState;
  selectedSymbol: string | null;
  activeView: DashboardView;
  dateRange: { start: string; end: string } | null;
}
