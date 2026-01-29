/**
 * Solana RPC Client for Real Blockchain Data
 * 
 * This module handles all direct Solana RPC calls for:
 * - SOL balance fetching
 * - SPL token account fetching
 * - Token metadata resolution
 */

import { PublicKey } from '@solana/web3.js';

// ============ Configuration ============
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

// Current SOL price (would be fetched from price feed in production)
const SOL_PRICE_USD = 180; // Placeholder - should use real price feed

// Known token metadata (subset of popular tokens)
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; decimals: number; logoUri?: string }> = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'WSOL',
    name: 'Wrapped SOL',
    decimals: 9,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
  },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    logoUri: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
  },
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': {
    symbol: 'JUP',
    name: 'Jupiter',
    decimals: 6,
    logoUri: 'https://static.jup.ag/jup/icon.png',
  },
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': {
    symbol: 'PYTH',
    name: 'Pyth Network',
    decimals: 6,
  },
  'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk': {
    symbol: 'WEN',
    name: 'Wen',
    decimals: 5,
  },
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof': {
    symbol: 'RENDER',
    name: 'Render Token',
    decimals: 8,
  },
};

// Token prices (would be fetched from price feed in production)
const TOKEN_PRICES: Record<string, number> = {
  'So11111111111111111111111111111111111111112': SOL_PRICE_USD,
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1.0,
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 1.0,
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 0.000025,
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 1.2,
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': 0.45,
  'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk': 0.0001,
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof': 8.5,
};

// ============ Types ============
interface RpcResponse<T> {
  jsonrpc: string;
  id: number;
  result: T;
  error?: { code: number; message: string };
}

interface BalanceResult {
  context: { slot: number };
  value: number;
}

interface TokenAccountInfo {
  pubkey: string;
  account: {
    data: {
      parsed: {
        info: {
          mint: string;
          owner: string;
          tokenAmount: {
            amount: string;
            decimals: number;
            uiAmount: number;
            uiAmountString: string;
          };
        };
        type: string;
      };
      program: string;
      space: number;
    };
    executable: boolean;
    lamports: number;
    owner: string;
    rentEpoch: number;
  };
}

interface TokenAccountsResult {
  context: { slot: number };
  value: TokenAccountInfo[];
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

// ============ RPC Helper ============
async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(SOLANA_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.status} ${response.statusText}`);
  }

  const data: RpcResponse<T> = await response.json();
  
  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`);
  }

  return data.result;
}

// ============ Validation ============
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// ============ SOL Balance ============
export async function getSolBalance(address: string): Promise<number> {
  const result = await rpcCall<BalanceResult>('getBalance', [address]);
  return result.value / 1e9; // Convert lamports to SOL
}

// ============ Token Accounts ============
export async function getTokenAccounts(address: string): Promise<TokenBalance[]> {
  // Fetch from both Token Program and Token-2022 Program
  const [tokenAccounts, token2022Accounts] = await Promise.all([
    rpcCall<TokenAccountsResult>('getTokenAccountsByOwner', [
      address,
      { programId: TOKEN_PROGRAM_ID },
      { encoding: 'jsonParsed' },
    ]),
    rpcCall<TokenAccountsResult>('getTokenAccountsByOwner', [
      address,
      { programId: TOKEN_2022_PROGRAM_ID },
      { encoding: 'jsonParsed' },
    ]).catch(() => ({ value: [] })), // Token-2022 might not be supported
  ]);

  const allAccounts = [...tokenAccounts.value, ...token2022Accounts.value];
  
  const tokens: TokenBalance[] = [];
  
  for (const account of allAccounts) {
    const info = account.account.data.parsed.info;
    const mint = info.mint;
    const balance = info.tokenAmount.uiAmount;
    
    // Skip zero balances
    if (balance === 0 || balance === null) continue;
    
    // Get token metadata
    const metadata = KNOWN_TOKENS[mint];
    const price = TOKEN_PRICES[mint] || 0;
    
    tokens.push({
      symbol: metadata?.symbol || mint.slice(0, 4) + '...',
      name: metadata?.name || 'Unknown Token',
      mint,
      balance,
      usdValue: balance * price,
      decimals: info.tokenAmount.decimals,
      logoUri: metadata?.logoUri,
    });
  }
  
  // Sort by USD value descending
  tokens.sort((a, b) => b.usdValue - a.usdValue);
  
  return tokens;
}

// ============ Full Portfolio ============
export async function getWalletPortfolio(address: string): Promise<WalletPortfolio> {
  const [solBalance, tokens] = await Promise.all([
    getSolBalance(address),
    getTokenAccounts(address),
  ]);
  
  const solUsdValue = solBalance * SOL_PRICE_USD;
  const tokensUsdValue = tokens.reduce((sum, t) => sum + t.usdValue, 0);
  
  return {
    address,
    solBalance,
    solUsdValue,
    tokens,
    totalUsdValue: solUsdValue + tokensUsdValue,
    lastUpdated: new Date().toISOString(),
  };
}

// ============ Markets Data ============
// Note: In production, this would fetch from Deriverse protocol or a DEX aggregator
export function getSupportedMarkets() {
  return [
    {
      symbol: 'SOL-PERP',
      name: 'Solana Perpetual',
      marketType: 'perp' as const,
      price: SOL_PRICE_USD,
      change24h: 0,
      volume24h: 0,
    },
    {
      symbol: 'BTC-PERP',
      name: 'Bitcoin Perpetual',
      marketType: 'perp' as const,
      price: 98500,
      change24h: 0,
      volume24h: 0,
    },
    {
      symbol: 'ETH-PERP',
      name: 'Ethereum Perpetual',
      marketType: 'perp' as const,
      price: 3450,
      change24h: 0,
      volume24h: 0,
    },
    {
      symbol: 'SOL/USDC',
      name: 'Solana',
      marketType: 'spot' as const,
      price: SOL_PRICE_USD,
      change24h: 0,
      volume24h: 0,
    },
    {
      symbol: 'JUP/USDC',
      name: 'Jupiter',
      marketType: 'spot' as const,
      price: 1.2,
      change24h: 0,
      volume24h: 0,
    },
    {
      symbol: 'BONK/USDC',
      name: 'Bonk',
      marketType: 'spot' as const,
      price: 0.000025,
      change24h: 0,
      volume24h: 0,
    },
  ];
}
