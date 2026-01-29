import { NextResponse } from 'next/server';
import { getSupportedMarkets } from '@/lib/solana';
import type { MarketsResponse } from '@/lib/types';

/**
 * GET /api/markets
 * 
 * Returns the list of supported markets on Deriverse.
 * In production, this would fetch real market data from:
 * - Deriverse protocol
 * - Jupiter aggregator
 * - Pyth price feeds
 */
export async function GET() {
  try {
    const markets = getSupportedMarkets();
    
    return NextResponse.json<MarketsResponse>({
      success: true,
      data: markets,
    });
  } catch (error) {
    console.error('[API] Markets fetch error:', error);
    return NextResponse.json<MarketsResponse>(
      { success: false, error: 'Failed to fetch markets data' },
      { status: 500 }
    );
  }
}
