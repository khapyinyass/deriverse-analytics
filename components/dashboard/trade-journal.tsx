'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import type { Trade, MarketType, Direction, OrderType } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Filter,
  MessageSquare,
  Search,
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface TradeJournalProps {
  trades: Trade[];
  onUpdateNote: (tradeId: string, note: string) => void;
}

const marketTypeLabels: Record<MarketType, string> = {
  spot: 'Spot',
  perp: 'Perpetual',
  options: 'Options',
};

const strategyLabels: Record<string, string> = {
  scalp: 'Scalp',
  swing: 'Swing',
  hedge: 'Hedge',
  dca: 'DCA',
  breakout: 'Breakout',
};

export function TradeJournal({ trades, onUpdateNote }: TradeJournalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [symbolFilter, setSymbolFilter] = useState<string>('all');
  const [marketTypeFilter, setMarketTypeFilter] = useState<MarketType | 'all'>('all');
  const [directionFilter, setDirectionFilter] = useState<Direction | 'all'>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | 'all'>('all');
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const symbols = useMemo(() => {
    const uniqueSymbols = [...new Set(trades.map((t) => t.symbol))];
    return uniqueSymbols.sort();
  }, [trades]);

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (searchQuery && !trade.symbol.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (symbolFilter !== 'all' && trade.symbol !== symbolFilter) {
        return false;
      }
      if (marketTypeFilter !== 'all' && trade.marketType !== marketTypeFilter) {
        return false;
      }
      if (directionFilter !== 'all' && trade.direction !== directionFilter) {
        return false;
      }
      if (orderTypeFilter !== 'all' && trade.orderType !== orderTypeFilter) {
        return false;
      }
      return true;
    });
  }, [trades, searchQuery, symbolFilter, marketTypeFilter, directionFilter, orderTypeFilter]);

  const handleSaveNote = (tradeId: string) => {
    onUpdateNote(tradeId, noteValue);
    setEditingNote(null);
  };

  const startEditingNote = (trade: Trade) => {
    setEditingNote(trade.id);
    setNoteValue(trade.notes || '');
  };

  return (
    <Card className="border-border/50 bg-card p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Trade Journal</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {filteredTrades.length} of {trades.length} trades
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 bg-secondary pl-8 text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className={cn('gap-2', showFilters && 'bg-secondary')}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-md bg-secondary/50 p-3 sm:grid-cols-4">
          <Select value={symbolFilter} onValueChange={setSymbolFilter}>
            <SelectTrigger className="h-8 bg-background text-xs">
              <SelectValue placeholder="Symbol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Symbols</SelectItem>
              {symbols.map((symbol) => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={marketTypeFilter} onValueChange={(v) => setMarketTypeFilter(v as MarketType | 'all')}>
            <SelectTrigger className="h-8 bg-background text-xs">
              <SelectValue placeholder="Market" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Markets</SelectItem>
              <SelectItem value="spot">Spot</SelectItem>
              <SelectItem value="perp">Perpetual</SelectItem>
              <SelectItem value="options">Options</SelectItem>
            </SelectContent>
          </Select>

          <Select value={directionFilter} onValueChange={(v) => setDirectionFilter(v as Direction | 'all')}>
            <SelectTrigger className="h-8 bg-background text-xs">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Directions</SelectItem>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>

          <Select value={orderTypeFilter} onValueChange={(v) => setOrderTypeFilter(v as OrderType | 'all')}>
            <SelectTrigger className="h-8 bg-background text-xs">
              <SelectValue placeholder="Order Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="market">Market</SelectItem>
              <SelectItem value="limit">Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Trade List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2 pr-4">
          {filteredTrades.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No trades match your filters
            </div>
          ) : (
            filteredTrades.map((trade) => (
              <Collapsible
                key={trade.id}
                open={expandedTrade === trade.id}
                onOpenChange={(open) => setExpandedTrade(open ? trade.id : null)}
              >
                <div className="rounded-md border border-border/50 bg-secondary/30 transition-colors hover:bg-secondary/50">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {expandedTrade === trade.id ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-mono text-sm font-medium">{trade.symbol}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px]',
                          trade.direction === 'long'
                            ? 'border-profit/50 text-profit'
                            : 'border-loss/50 text-loss'
                        )}
                      >
                        {trade.direction.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {marketTypeLabels[trade.marketType]}
                      </Badge>
                      {trade.strategy && (
                        <Badge variant="secondary" className="text-[10px]">
                          {strategyLabels[trade.strategy]}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p
                          className={cn(
                            'font-mono text-sm font-medium',
                            trade.pnl >= 0 ? 'text-profit' : 'text-loss'
                          )}
                        >
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(trade.exitTime).toLocaleDateString()}
                        </p>
                      </div>
                      {trade.notes && (
                        <MessageSquare className="h-3 w-3 text-primary" />
                      )}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t border-border/50 p-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
                        <div>
                          <p className="text-muted-foreground">Entry Price</p>
                          <p className="font-mono font-medium">
                            ${trade.entryPrice.toFixed(trade.entryPrice < 1 ? 8 : 2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Exit Price</p>
                          <p className="font-mono font-medium">
                            ${trade.exitPrice.toFixed(trade.exitPrice < 1 ? 8 : 2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Size</p>
                          <p className="font-mono font-medium">{trade.size.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Leverage</p>
                          <p className="font-mono font-medium">{trade.leverage}x</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-mono font-medium">
                            {trade.duration >= 60
                              ? `${Math.floor(trade.duration / 60)}h ${trade.duration % 60}m`
                              : `${trade.duration}m`}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fees</p>
                          <p className="font-mono font-medium">${trade.fees.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Order Type</p>
                          <p className="font-medium capitalize">{trade.orderType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Session</p>
                          <p className="font-medium capitalize">{trade.session.replace('-', ' ')}</p>
                        </div>
                      </div>

                      {/* Notes Section */}
                      <div className="mt-4">
                        {editingNote === trade.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={noteValue}
                              onChange={(e) => setNoteValue(e.target.value)}
                              placeholder="Add notes about this trade..."
                              className="min-h-[60px] bg-background text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingNote(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveNote(trade.id)}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              {trade.notes ? (
                                <p className="text-xs text-muted-foreground">{trade.notes}</p>
                              ) : (
                                <p className="text-xs italic text-muted-foreground/50">
                                  No notes
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => startEditingNote(trade)}
                            >
                              {trade.notes ? 'Edit' : 'Add Note'}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Transaction Link */}
                      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                        <a
                          href={`https://solscan.io/tx/${trade.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View on Solscan
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {trade.txHash.slice(0, 8)}...{trade.txHash.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
