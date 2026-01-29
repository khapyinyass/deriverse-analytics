// Types for Deriverse Analytics Dashboard
export type MarketType = 'spot' | 'perp' | 'options';
export type OrderType = 'market' | 'limit';
export type Direction = 'long' | 'short';
export type StrategyTag = 'scalp' | 'swing' | 'hedge' | 'dca' | 'breakout';
export type TradingSession = 'asia' | 'london' | 'new-york';
export type FeeType = 'taker' | 'maker' | 'funding';

export interface Trade {
  id: string;
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
  duration: number; // in minutes
  session: TradingSession;
  strategy?: StrategyTag;
  notes?: string;
  txHash: string;
}

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

// Generate realistic Solana trading data
const symbols = ['SOL-PERP', 'BTC-PERP', 'ETH-PERP', 'JTO-PERP', 'BONK-PERP', 'WIF-PERP', 'JUP-PERP', 'PYTH-PERP'];
const spotSymbols = ['SOL/USDC', 'BTC/USDC', 'ETH/USDC', 'JTO/USDC', 'BONK/USDC'];

function generateTxHash(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let hash = '';
  for (let i = 0; i < 88; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

function getSession(hour: number): TradingSession {
  if (hour >= 0 && hour < 8) return 'asia';
  if (hour >= 8 && hour < 16) return 'london';
  return 'new-york';
}

function generateTrades(count: number): Trade[] {
  const trades: Trade[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const isPerp = Math.random() > 0.3;
    const isOptions = !isPerp && Math.random() > 0.7;
    const marketType: MarketType = isPerp ? 'perp' : isOptions ? 'options' : 'spot';
    const symbol = isPerp ? symbols[Math.floor(Math.random() * symbols.length)] : spotSymbols[Math.floor(Math.random() * spotSymbols.length)];
    
    const direction: Direction = Math.random() > 0.45 ? 'long' : 'short';
    const orderType: OrderType = Math.random() > 0.4 ? 'limit' : 'market';
    const leverage = marketType === 'perp' ? Math.floor(Math.random() * 19) + 2 : 1;
    
    // Base price depends on symbol
    let basePrice = 100;
    if (symbol.includes('BTC')) basePrice = 95000 + Math.random() * 5000;
    else if (symbol.includes('ETH')) basePrice = 3200 + Math.random() * 300;
    else if (symbol.includes('SOL')) basePrice = 180 + Math.random() * 40;
    else if (symbol.includes('JTO')) basePrice = 2.5 + Math.random() * 1;
    else if (symbol.includes('BONK')) basePrice = 0.00002 + Math.random() * 0.00001;
    else if (symbol.includes('WIF')) basePrice = 1.8 + Math.random() * 0.5;
    else if (symbol.includes('JUP')) basePrice = 0.8 + Math.random() * 0.3;
    else if (symbol.includes('PYTH')) basePrice = 0.35 + Math.random() * 0.1;
    
    const entryPrice = basePrice;
    const priceMove = (Math.random() - 0.45) * 0.08 * basePrice; // Slight bullish bias
    const exitPrice = direction === 'long' 
      ? entryPrice + priceMove 
      : entryPrice - priceMove;
    
    const size = Math.floor(Math.random() * 10000) + 100;
    const notionalValue = size * entryPrice;
    
    const pnlBase = direction === 'long' 
      ? (exitPrice - entryPrice) * size 
      : (entryPrice - exitPrice) * size;
    const pnl = pnlBase * leverage;
    const pnlPercent = (pnl / notionalValue) * 100;
    
    const takerFee = notionalValue * 0.0005;
    const makerFee = notionalValue * 0.0002;
    const fundingFee = marketType === 'perp' ? notionalValue * 0.0001 * (Math.random() > 0.5 ? 1 : -1) : 0;
    const fees = orderType === 'market' ? takerFee : makerFee + Math.abs(fundingFee);
    
    const daysAgo = Math.floor(Math.random() * 90);
    const entryTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000);
    const duration = Math.floor(Math.random() * 480) + 5; // 5 min to 8 hours
    const exitTime = new Date(entryTime.getTime() + duration * 60 * 1000);
    
    const strategies: StrategyTag[] = ['scalp', 'swing', 'hedge', 'dca', 'breakout'];
    
    trades.push({
      id: `trade-${i + 1}`,
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
      strategy: Math.random() > 0.3 ? strategies[Math.floor(Math.random() * strategies.length)] : undefined,
      notes: Math.random() > 0.7 ? 'Strong momentum entry on breakout' : undefined,
      txHash: generateTxHash()
    });
  }
  
  return trades.sort((a, b) => new Date(b.exitTime).getTime() - new Date(a.exitTime).getTime());
}

export const trades = generateTrades(250);

// Calculate overview metrics
export function calculateMetrics(tradeList: Trade[]) {
  const totalPnl = tradeList.reduce((sum, t) => sum + t.pnl, 0);
  const totalVolume = tradeList.reduce((sum, t) => sum + t.size * t.entryPrice, 0);
  const totalFees = tradeList.reduce((sum, t) => sum + t.fees, 0);
  const winningTrades = tradeList.filter(t => t.pnl > 0);
  const losingTrades = tradeList.filter(t => t.pnl < 0);
  const winRate = (winningTrades.length / tradeList.length) * 100;
  
  const longTrades = tradeList.filter(t => t.direction === 'long');
  const shortTrades = tradeList.filter(t => t.direction === 'short');
  
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length 
    : 0;
  const avgLoss = losingTrades.length > 0 
    ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
    : 0;
  
  const avgDuration = tradeList.reduce((sum, t) => sum + t.duration, 0) / tradeList.length;
  
  const largestWin = Math.max(...winningTrades.map(t => t.pnl), 0);
  const largestLoss = Math.min(...losingTrades.map(t => t.pnl), 0);
  
  return {
    totalPnl,
    totalPnlPercent: (totalPnl / totalVolume) * 100,
    winRate,
    totalTrades: tradeList.length,
    totalVolume,
    totalFees,
    longShortRatio: longTrades.length / (shortTrades.length || 1),
    avgDuration,
    avgWin,
    avgLoss,
    largestWin,
    largestLoss,
    profitFactor: avgLoss > 0 ? avgWin / avgLoss : 0,
    riskRewardRatio: avgLoss > 0 ? avgWin / avgLoss : 0
  };
}

// Generate daily performance data
export function generateDailyPerformance(tradeList: Trade[]): DailyPerformance[] {
  const dailyMap = new Map<string, Trade[]>();
  
  tradeList.forEach(trade => {
    const date = trade.exitTime.split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, []);
    }
    dailyMap.get(date)!.push(trade);
  });
  
  const sortedDates = Array.from(dailyMap.keys()).sort();
  let cumulativePnl = 0;
  let maxEquity = 10000; // Starting equity
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

// Generate session performance
export function generateSessionPerformance(tradeList: Trade[]): SessionPerformance[] {
  const sessions: TradingSession[] = ['asia', 'london', 'new-york'];
  
  return sessions.map(session => {
    const sessionTrades = tradeList.filter(t => t.session === session);
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

// Generate symbol performance
export function generateSymbolPerformance(tradeList: Trade[]): SymbolPerformance[] {
  const symbolMap = new Map<string, Trade[]>();
  
  tradeList.forEach(trade => {
    if (!symbolMap.has(trade.symbol)) {
      symbolMap.set(trade.symbol, []);
    }
    symbolMap.get(trade.symbol)!.push(trade);
  });
  
  return Array.from(symbolMap.entries()).map(([symbol, trades]) => {
    const wins = trades.filter(t => t.pnl > 0);
    return {
      symbol,
      pnl: trades.reduce((sum, t) => sum + t.pnl, 0),
      trades: trades.length,
      winRate: (wins.length / trades.length) * 100,
      volume: trades.reduce((sum, t) => sum + t.size * t.entryPrice, 0),
      avgHoldTime: trades.reduce((sum, t) => sum + t.duration, 0) / trades.length
    };
  }).sort((a, b) => b.pnl - a.pnl);
}

// Generate hourly heatmap data
export function generateHourlyHeatmap(tradeList: Trade[]): HourlyHeatmap[] {
  const heatmap: HourlyHeatmap[] = [];
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const matchingTrades = tradeList.filter(t => {
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

// Generate fee breakdown over time
export function generateFeeBreakdown(tradeList: Trade[]) {
  const feeMap = new Map<string, { taker: number; maker: number; funding: number }>();
  
  tradeList.forEach(trade => {
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

// Order type performance
export function getOrderTypePerformance(tradeList: Trade[]) {
  const marketTrades = tradeList.filter(t => t.orderType === 'market');
  const limitTrades = tradeList.filter(t => t.orderType === 'limit');
  
  return {
    market: {
      trades: marketTrades.length,
      pnl: marketTrades.reduce((sum, t) => sum + t.pnl, 0),
      winRate: (marketTrades.filter(t => t.pnl > 0).length / marketTrades.length) * 100,
      avgFee: marketTrades.reduce((sum, t) => sum + t.fees, 0) / marketTrades.length
    },
    limit: {
      trades: limitTrades.length,
      pnl: limitTrades.reduce((sum, t) => sum + t.pnl, 0),
      winRate: (limitTrades.filter(t => t.pnl > 0).length / limitTrades.length) * 100,
      avgFee: limitTrades.reduce((sum, t) => sum + t.fees, 0) / limitTrades.length
    }
  };
}

// Direction performance
export function getDirectionPerformance(tradeList: Trade[]) {
  const longTrades = tradeList.filter(t => t.direction === 'long');
  const shortTrades = tradeList.filter(t => t.direction === 'short');
  
  return {
    long: {
      trades: longTrades.length,
      pnl: longTrades.reduce((sum, t) => sum + t.pnl, 0),
      winRate: (longTrades.filter(t => t.pnl > 0).length / longTrades.length) * 100
    },
    short: {
      trades: shortTrades.length,
      pnl: shortTrades.reduce((sum, t) => sum + t.pnl, 0),
      winRate: (shortTrades.filter(t => t.pnl > 0).length / shortTrades.length) * 100
    }
  };
}

// Market type breakdown
export function getMarketTypePerformance(tradeList: Trade[]) {
  const types: MarketType[] = ['spot', 'perp', 'options'];
  
  return types.map(type => {
    const typeTrades = tradeList.filter(t => t.marketType === type);
    return {
      type,
      trades: typeTrades.length,
      pnl: typeTrades.reduce((sum, t) => sum + t.pnl, 0),
      volume: typeTrades.reduce((sum, t) => sum + t.size * t.entryPrice, 0),
      winRate: typeTrades.length > 0 
        ? (typeTrades.filter(t => t.pnl > 0).length / typeTrades.length) * 100 
        : 0
    };
  });
}

// Strategy performance
export function getStrategyPerformance(tradeList: Trade[]) {
  const strategies: StrategyTag[] = ['scalp', 'swing', 'hedge', 'dca', 'breakout'];
  
  return strategies.map(strategy => {
    const strategyTrades = tradeList.filter(t => t.strategy === strategy);
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

// Generate insights
export function generateInsights(tradeList: Trade[]) {
  const sessionPerf = generateSessionPerformance(tradeList);
  const bestSession = sessionPerf.reduce((best, s) => s.pnl > best.pnl ? s : best);
  const symbolPerf = generateSymbolPerformance(tradeList);
  const bestSymbol = symbolPerf[0];
  const directionPerf = getDirectionPerformance(tradeList);
  
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
  
  const orderPerf = getOrderTypePerformance(tradeList);
  if (orderPerf.limit.winRate > orderPerf.market.winRate + 3) {
    insights.push('Limit orders are more profitable - patience in entries is paying off');
  }
  
  return insights;
}

// Export helper for CSV
export function exportToCSV(tradeList: Trade[]): string {
  const headers = [
    'ID', 'Symbol', 'Market Type', 'Order Type', 'Direction', 'Entry Price', 'Exit Price',
    'Size', 'Leverage', 'PnL', 'PnL %', 'Fees', 'Entry Time', 'Exit Time', 'Duration (min)',
    'Session', 'Strategy', 'Notes', 'Tx Hash'
  ];
  
  const rows = tradeList.map(t => [
    t.id, t.symbol, t.marketType, t.orderType, t.direction,
    t.entryPrice.toFixed(6), t.exitPrice.toFixed(6), t.size.toString(),
    t.leverage.toString(), t.pnl.toFixed(2), t.pnlPercent.toFixed(2),
    t.fees.toFixed(4), t.entryTime, t.exitTime, t.duration.toString(),
    t.session, t.strategy || '', t.notes || '', t.txHash
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
