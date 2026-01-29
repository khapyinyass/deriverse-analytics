import { NextResponse } from 'next/server';
import { getWalletPortfolio, isValidSolanaAddress } from '@/lib/solana';
import type { PortfolioResponse } from '@/lib/types';

/**
 * GET /api/portfolio?address=<wallet_address>
 * 
 * Fetches REAL portfolio data for a Solana wallet from the blockchain.
 * - SOL balance from Solana RPC
 * - SPL token balances from token accounts
 * - USD values calculated from prices
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  
  // Validate address parameter
  if (!address) {
    return NextResponse.json<PortfolioResponse>(
      { success: false, error: 'Wallet address is required' },
      { status: 400 }
    );
  }
  
  // Validate address format using PublicKey validation
  if (!isValidSolanaAddress(address)) {
    return NextResponse.json<PortfolioResponse>(
      { success: false, error: 'Invalid Solana wallet address' },
      { status: 400 }
    );
  }
  
  try {
    // Fetch REAL data from Solana blockchain
    const portfolio = await getWalletPortfolio(address);
    
    return NextResponse.json<PortfolioResponse>({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error('[API] Portfolio fetch error:', error);
    
    // Provide specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for rate limiting
    if (errorMessage.includes('429') || errorMessage.includes('rate')) {
      return NextResponse.json<PortfolioResponse>(
        { success: false, error: 'Rate limited by Solana RPC. Please try again in a moment.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json<PortfolioResponse>(
      { success: false, error: 'Failed to fetch portfolio from blockchain' },
      { status: 500 }
    );
  }
}
