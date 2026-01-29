// Server-side data generator for wallet-specific mock data
// This simulates what a real indexer/database would return

import type {
  Trade,
  MarketType,
  OrderType,
  Direction,
  FeeType,
  StrategyTag,
  TradingSession,
  WalletPortfolio,
  TokenBalance,
  TradableAsset,
  DailyPerformance,
  SessionPerformance,
  SymbolPerformance,
  HourlyHeatmap,
  Metrics,
} from './types';

// ============ Constants ============
const PERP_SYMBOLS = ['SOL-PERP', 'BTC-PERP', 'ETH-PERP', 'JTO-PERP', 'BONK-PERP', 'WIF-PERP', 'JUP-PERP', 'PYTH-PERP'];
const SPOT_SYMBOLS = ['SOL/USDC', 'BTC/USDC', 'ETH/USDC', 'JTO/USDC', 'BONK/USDC'];
const STRATEGIES: StrategyTag[] = ['scalp', 'swing', 'hedge', 'dca', 'breakout'];

// Token definitions for portfolio
const TOKENS: Omit<TokenBalance, 'balance' | 'usdValue'>[] = [
  { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', decimals: 9, logoUri: '/tokens/sol.png' },
  { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, logoUri: '/tokens/usdc.png' },
  { symbol: 'USDT', name: 'Tether USD', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, logoUri: '/tokens/usdt.png' },
  { symbol: 'JTO', name: 'Jito', mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL', decimals: 9, logoUri: '/tokens/jto.png' },
  { symbol: 'JUP', name: 'Jupiter', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6, logoUri: '/tokens/jup.png' },
  { symbol: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, logoUri: '/tokens/bonk.png' },
  { symbol: 'WIF', name: 'dogwifhat', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6, logoUri: '/tokens/wif.png' },
  { symbol: 'PYTH', name: 'Pyth Network', mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', decimals: 6, logoUri: '/tokens/pyth.png' },
];

// Market definitions
const MARKETS: Omit<TradableAsset, 'price' | 'change24h' | 'volume24h'>[] = [
  { symbol: 'SOL-PERP', name: 'Solana Perpetual', marketType: 'perp', logoUri: '/tokens/sol.png' },
  { symbol: 'BTC-PERP', name: 'Bitcoin Perpetual', marketType: 'perp', logoUri: '/tokens/btc.png' },
  { symbol: 'ETH-PERP', name: 'Ethereum Perpetual', marketType: 'perp', logoUri: '/tokens/eth.png' },
  { symbol: 'JTO-PERP', name: 'Jito Perpetual', marketType: 'perp', logoUri: '/tokens/jto.png' },
  { symbol: 'BONK-PERP', name: 'Bonk Perpetual', marketType: 'perp', logoUri: '/tokens/bonk.png' },
  { symbol: 'WIF-PERP', name: 'dogwifhat Perpetual', marketType: 'perp', logoUri: '/tokens/wif.png' },
  { symbol: 'JUP-PERP', name: 'Jupiter Perpetual', marketType: 'perp', logoUri: '/tokens/jup.png' },
  { symbol: 'PYTH-PERP', name: 'Pyth Perpetual', marketType: 'perp', logoUri: '/tokens/pyth.png' },
  { symbol: 'SOL/USDC', name: 'Solana Spot', marketType: 'spot', logoUri: '/tokens/sol.png' },
  { symbol: 'BTC/USDC', name: 'Bitcoin Spot', marketType: 'spot', logoUri: '/tokens/btc.png' },
  { symbol: 'ETH/USDC', name: 'Ethereum Spot', marketType: 'spot', logoUri: '/tokens/eth.png' },
  { symbol: 'JTO/USDC', name: 'Jito Spot', marketType: 'spot', logoUri: '/tokens/jto.png' },
  { symbol: 'BONK/USDC', name: 'Bonk Spot', marketType: 'spot', logoUri: '/tokens/bonk.png' },
];

// ============ Utility Functions ============
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return function() {
    hash = Math.sin(hash) * 10000;
    return hash - Math.floor(hash);
  };
}

function generateTxHash(rand: () => number): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let hash = '';
  for (let i = 0; i < 88; i++) {
    hash += chars.charAt(Math.floor(rand() * chars.length));
  }
  return hash;
}

function getSession(hour: number): TradingSession {
  if (hour >= 0 && hour < 8) return 'asia';
  if (hour >= 8 && hour < 16) return 'london';
  return 'new-york';
}

function getBasePrice(symbol: string): number {
  if (symbol.includes('BTC')) return 97000;
  if (symbol.includes('ETH')) return 3300;
  if (symbol.includes('SOL')) return 195;
  if (symbol.includes('JTO')) return 2.8;
  if (symbol.includes('BONK')) return 0.000023;
  if (symbol.includes('WIF')) return 1.95;
  if (symbol.includes('JUP')) return 0.85;
  if (symbol.includes('PYTH')) return 0.38;
  return 100;
}

// ============ Data Generators ============

/**
 * Generate wallet portfolio based on address
 * Uses address as seed for deterministic but varied data per wallet
 */
export function generatePortfolio(address: string): WalletPortfolio {
  const rand = seededRandom(address);
  
  // Generate SOL balance (1-500 SOL)
  const solBalance = rand() * 500 + 1;
  const solPrice = 195;
  const solUsdValue = solBalance * solPrice;
  
  // Generate token balances (random subset of tokens)
  const tokenCount = Math.floor(rand() * 5) + 2;
  const shuffledTokens = [...TOKENS].sort(() => rand() - 0.5);
  
  const tokens: TokenBalance[] = shuffledTokens.slice(0, tokenCount).map(token => {
    const balance = rand() * 10000 + 10;
    let price = 1;
    
    if (token.symbol === 'SOL') price = solPrice;
    else if (token.symbol === 'USDC' || token.symbol === 'USDT') price = 1;
    else if (token.symbol === 'JTO') price = 2.8;
    else if (token.symbol === 'JUP') price = 0.85;
    else if (token.symbol === 'BONK') price = 0.000023;
    else if (token.symbol === 'WIF') price = 1.95;
    else if (token.symbol === 'PYTH') price = 0.38;
    
    return {
      ...token,
      balance,
      usdValue: balance * price,
    };
  });
  
  const totalUsdValue = solUsdValue + tokens.reduce((sum, t) => sum + t.usdValue, 0);
  
  return {
    address,
    solBalance,
    solUsdValue,
    tokens,
    totalUsdValue,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Generate trades for a specific wallet address
 * Uses address as seed for deterministic but unique trade history per wallet
 */
export function generateTradesForWallet(
  address: string,
  symbolFilter?: string,
  count: number = 250
): Trade[] {
  const rand = seededRandom(address + 'trades');
  const trades: Trade[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const isPerp = rand() > 0.3;
    const isOptions = !isPerp && rand() > 0.7;
    const marketType: MarketType = isPerp ? 'perp' : isOptions ? 'options' : 'spot';
    const symbol = isPerp 
      ? PERP_SYMBOLS[Math.floor(rand() * PERP_SYMBOLS.length)]
      : SPOT_SYMBOLS[Math.floor(rand() * SPOT_SYMBOLS.length)];
    
    // Skip if filtering by symbol and doesn't match
    if (symbolFilter && !symbol.includes(symbolFilter.replace('-PERP', '').replace('/USDC', ''))) {
      continue;
    }
    
    const direction: Direction = rand() > 0.45 ? 'long' : 'short';
    const orderType: OrderType = rand() > 0.4 ? 'limit' : 'market';
    const leverage = marketType === 'perp' ? Math.floor(rand() * 19) + 2 : 1;
    
    const basePrice = getBasePrice(symbol);
    const entryPrice = basePrice * (1 + (rand() - 0.5) * 0.1);
    const priceMove = (rand() - 0.45) * 0.08 * basePrice;
    const exitPrice = direction === 'long' 
      ? entryPrice + priceMove 
      : entryPrice - priceMove;
    
    const size = Math.floor(rand() * 10000) + 100;
    const notionalValue = size * entryPrice;
    
    const pnlBase = direction === 'long' 
      ? (exitPrice - entryPrice) * size 
      : (entryPrice - exitPrice) * size;
    const pnl = pnlBase * leverage;
    const pnlPercent = (pnl / notionalValue) * 100;
    
    const takerFee = notionalValue * 0.0005;
    const makerFee = notionalValue * 0.0002;
    const fundingFee = marketType === 'perp' ? notionalValue * 0.0001 * (rand() > 0.5 ? 1 : -1) : 0;
    const fees = orderType === 'market' ? takerFee : makerFee + Math.abs(fundingFee);
    
    const daysAgo = Math.floor(rand() * 90);
    const entryTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - rand() * 24 * 60 * 60 * 1000);
    const duration = Math.floor(rand() * 480) + 5;
    const exitTime = new Date(entryTime.getTime() + duration * 60 * 1000);
    
    trades.push({
      id: `${address.slice(0, 8)}-trade-${i + 1}`,
      walletAddress: address,
      symbol,
      marketType,
      orderType,
      direction,
      entryPrice,
      exitPrice,
      size,
      leverage,
      pnl,
      pnlPercent,
      fees,
      feeBreakdown: [
        { type: orderType === 'market' ? 'taker' : 'maker', amount: orderType === 'market' ? takerFee : makerFee },
        ...(fundingFee !== 0 ? [{ type: 'funding' as FeeType, amount: fundingFee }] : [])
      ],
      entryTime: entryTime.toISOString(),
      exitTime: exitTime.toISOString(),
      duration,
      session: getSession(entryTime.getHours()),
      strategy: rand() > 0.3 ? STRATEGIES[Math.floor(rand() * STRATEGIES.length)] : undefined,
      notes: rand() > 0.7 ? 'Strategy execution note' : undefined,
      txHash: generateTxHash(rand)
    });
  }
  
  return trades.sort((a, b) => new Date(b.exitTime).getTime() - new Date(a.exitTime).getTime());
}

/**
 * Get tradable markets with current prices
 */
export function getMarkets(): TradableAsset[] {
  return MARKETS.map(market => {
    const basePrice = getBasePrice(market.symbol);
    const change = (Math.random() - 0.5) * 10;
    const volume = Math.random() * 100000000 + 1000000;
    
    return {
      ...market,
      price: basePrice * (1 + change / 100),
      change24h: change,
      volume24h: volume,
    };
  });
}

// ============ Analytics Calculators ============

export function calculateMetrics(trades: Trade[]): Metrics {
  if (trades.length === 0) {
    return {
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
  }
  
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const totalVolume = trades.reduce((sum, t) => sum + t.size * t.entryPrice, 0);
  const totalFees = trades.reduce((sum, t) => sum + t.fees, 0);
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  const winRate = (winningTrades.length / trades.length) * 100;
  
  const longTrades = trades.filter(t => t.direction === 'long');
  const shortTrades = trades.filter(t => t.direction === 'short');
  
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length 
    : 0;
  const avgLoss = losingTrades.length > 0 
    ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
    : 0;
  
  const avgDuration = trades.reduce((sum, t) => sum + t.duration, 0) / trades.length;
  
  const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0;
  const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0;
  
  return {
    totalPnl,
    totalPnlPercent: totalVolume > 0 ? (totalPnl / totalVolume) * 100 : 0,
    winRate,
    totalTrades: trades.length,
    totalVolume,
    totalFees,
    longShortRatio: shortTrades.length > 0 ? longTrades.length / shortTrades.length : longTrades.length,
    avgDuration,
    avgWin,
    avgLoss,
    largestWin,
    largestLoss,
    profitFactor: avgLoss > 0 ? avgWin / avgLoss : 0,
    riskRewardRatio: avgLoss > 0 ? avgWin / avgLoss : 0
  };
}

export function generateDailyPerformance(trades: Trade[]): DailyPerformance[] {
  const dailyMap = new Map<string, Trade[]>();
  
  trades.forEach(trade => {
    const date = trade.exitTime.split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, []);
    }
    dailyMap.get(date)!.push(trade);
  });
  
  const sortedDates = Array.from(dailyMap.keys()).sort();
  let cumulativePnl = 0;
  let maxEquity = 10000;
  let equity = 10000;
  
  return sortedDates.map(date => {
    const dayTrades = dailyMap.get(date)!;
    const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    cumulativePnl += pnl;
    equity += pnl;
    maxEquity = Math.max(maxEquity, equity);
    const drawdown = ((maxEquity - equity) / maxEquity) * 100;
    const wins = dayTrades.filter(t => t.pnl > 0).length;
    
    return {
      date,
      pnl,
      cumulativePnl,
      trades: dayTrades.length,
      volume: dayTrades.reduce((sum, t) => sum + t.size * t.entryPrice, 0),
      fees: dayTrades.reduce((sum, t) => sum + t.fees, 0),
      winRate: (wins / dayTrades.length) * 100,
      drawdown,
      equity
    };
  });
}

export function generateSessionPerformance(trades: Trade[]): SessionPerformance[] {
  const sessions: TradingSession[] = ['asia', 'london', 'new-york'];
  
  return sessions.map(session => {
    const sessionTrades = trades.filter(t => t.session === session);
    const wins = sessionTrades.filter(t => t.pnl > 0);
    const losses = sessionTrades.filter(t => t.pnl < 0);
    
    return {
      session,
      pnl: sessionTrades.reduce((sum, t) => sum + t.pnl, 0),
      trades: sessionTrades.length,
      winRate: sessionTrades.length > 0 ? (wins.length / sessionTrades.length) * 100 : 0,
      avgWin: wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0,
      avgLoss: losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) : 0
    };
  });
}

export function generateSymbolPerformance(trades: Trade[]): SymbolPerformance[] {
  const symbolMap = new Map<string, Trade[]>();
  
  trades.forEach(trade => {
    if (!symbolMap.has(trade.symbol)) {
      symbolMap.set(trade.symbol, []);
    }
    symbolMap.get(trade.symbol)!.push(trade);
  });
  
  return Array.from(symbolMap.entries()).map(([symbol, symbolTrades]) => {
    const wins = symbolTrades.filter(t => t.pnl > 0);
    return {
      symbol,
      pnl: symbolTrades.reduce((sum, t) => sum + t.pnl, 0),
      trades: symbolTrades.length,
      winRate: (wins.length / symbolTrades.length) * 100,
      volume: symbolTrades.reduce((sum, t) => sum + t.size * t.entryPrice, 0),
      avgHoldTime: symbolTrades.reduce((sum, t) => sum + t.duration, 0) / symbolTrades.length
    };
  }).sort((a, b) => b.pnl - a.pnl);
}

export function generateHourlyHeatmap(trades: Trade[]): HourlyHeatmap[] {
  const heatmap: HourlyHeatmap[] = [];
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const matchingTrades = trades.filter(t => {
        const d = new Date(t.entryTime);
        return d.getDay() === day && d.getHours() === hour;
      });
      
      heatmap.push({
        hour,
        day,
        pnl: matchingTrades.reduce((sum, t) => sum + t.pnl, 0),
        trades: matchingTrades.length
      });
    }
  }
  
  return heatmap;
}

export function generateFeeBreakdown(trades: Trade[]) {
  const feeMap = new Map<string, { taker: number; maker: number; funding: number }>();
  
  trades.forEach(trade => {
    const date = trade.exitTime.split('T')[0];
    if (!feeMap.has(date)) {
      feeMap.set(date, { taker: 0, maker: 0, funding: 0 });
    }
    const entry = feeMap.get(date)!;
    trade.feeBreakdown.forEach(fee => {
      entry[fee.type] += Math.abs(fee.amount);
    });
  });
  
  return Array.from(feeMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, fees]) => ({
      date,
      ...fees,
      total: fees.taker + fees.maker + fees.funding
    }));
}

export function getOrderTypePerformance(trades: Trade[]) {
  const marketTrades = trades.filter(t => t.orderType === 'market');
  const limitTrades = trades.filter(t => t.orderType === 'limit');
  
  return {
    market: {
      trades: marketTrades.length,
      pnl: marketTrades.reduce((sum, t) => sum + t.pnl, 0),
      winRate: marketTrades.length > 0 ? (marketTrades.filter(t => t.pnl > 0).length / marketTrades.length) * 100 : 0,
      avgFee: marketTrades.length > 0 ? marketTrades.reduce((sum, t) => sum + t.fees, 0) / marketTrades.length : 0
    },
    limit: {
      trades: limitTrades.length,
      pnl: limitTrades.reduce((sum, t) => sum + t.pnl, 0),
      winRate: limitTrades.length > 0 ? (limitTrades.filter(t => t.pnl > 0).length / limitTrades.length) * 100 : 0,
      avgFee: limitTrades.length > 0 ? limitTrades.reduce((sum, t) => sum + t.fees, 0) / limitTrades.length : 0
    }
  };
}

export function getDirectionPerformance(trades: Trade[]) {
  const longTrades = trades.filter(t => t.direction === 'long');
  const shortTrades = trades.filter(t => t.direction === 'short');
  
  return {
    long: {
      trades: longTrades.length,
      pnl: longTrades.reduce((sum, t) => sum + t.pnl, 0),
      winRate: longTrades.length > 0 ? (longTrades.filter(t => t.pnl > 0).length / longTrades.length) * 100 : 0
    },
    short: {
      trades: shortTrades.length,
      pnl: shortTrades.reduce((sum, t) => sum + t.pnl, 0),
      winRate: shortTrades.length > 0 ? (shortTrades.filter(t => t.pnl > 0).length / shortTrades.length) * 100 : 0
    }
  };
}

export function getStrategyPerformance(trades: Trade[]) {
  const strategies: StrategyTag[] = ['scalp', 'swing', 'hedge', 'dca', 'breakout'];
  
  return strategies.map(strategy => {
    const strategyTrades = trades.filter(t => t.strategy === strategy);
    return {
      strategy,
      trades: strategyTrades.length,
      pnl: strategyTrades.reduce((sum, t) => sum + t.pnl, 0),
      winRate: strategyTrades.length > 0 
        ? (strategyTrades.filter(t => t.pnl > 0).length / strategyTrades.length) * 100 
        : 0,
      avgDuration: strategyTrades.length > 0
        ? strategyTrades.reduce((sum, t) => sum + t.duration, 0) / strategyTrades.length
        : 0
    };
  }).filter(s => s.trades > 0);
}

export function generateInsights(trades: Trade[]) {
  const sessionPerf = generateSessionPerformance(trades);
  const bestSession = sessionPerf.reduce((best, s) => s.pnl > best.pnl ? s : best);
  const symbolPerf = generateSymbolPerformance(trades);
  const bestSymbol = symbolPerf[0];
  const directionPerf = getDirectionPerformance(trades);
  
  const insights: string[] = [];
  
  if (bestSession.pnl > 0) {
    insights.push(`You perform best during the ${bestSession.session.replace('-', ' ')} session with ${bestSession.winRate.toFixed(1)}% win rate`);
  }
  
  if (bestSymbol && bestSymbol.pnl > 0) {
    insights.push(`${bestSymbol.symbol} is your most profitable asset with $${bestSymbol.pnl.toFixed(2)} total PnL`);
  }
  
  if (directionPerf.long.winRate > directionPerf.short.winRate + 5) {
    insights.push('Your long trades outperform shorts - consider focusing on bullish setups');
  } else if (directionPerf.short.winRate > directionPerf.long.winRate + 5) {
    insights.push('Your short trades outperform longs - you have good timing on reversals');
  }
  
  const orderPerf = getOrderTypePerformance(trades);
  if (orderPerf.limit.winRate > orderPerf.market.winRate + 3) {
    insights.push('Limit orders are more profitable - patience in entries is paying off');
  }
  
  return insights;
}
