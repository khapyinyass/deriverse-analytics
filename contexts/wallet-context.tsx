'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { WalletState, WalletPortfolio, TokenBalance } from '@/lib/types';

// ============ Types ============
interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: { toString: () => string };
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
}

interface WalletContextType {
  // State
  wallet: WalletState;
  portfolio: WalletPortfolio | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  
  // Helpers
  isPhantomInstalled: boolean;
}

// ============ Context ============
const WalletContext = createContext<WalletContextType | null>(null);

// ============ Helper Functions ============
function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === 'undefined') return null;
  const phantom = (window as unknown as { phantom?: { solana?: PhantomProvider } }).phantom;
  return phantom?.solana?.isPhantom ? phantom.solana : null;
}

// ============ Provider Component ============
export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    shortAddress: null,
    connecting: false,
    disconnecting: false,
  });
  
  const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);

  // Check if Phantom is installed
  useEffect(() => {
    const checkPhantom = () => {
      const provider = getPhantomProvider();
      setIsPhantomInstalled(!!provider);
      
      // Check if already connected
      if (provider?.publicKey) {
        const address = provider.publicKey.toString();
        setWallet({
          connected: true,
          address,
          shortAddress: shortenAddress(address),
          connecting: false,
          disconnecting: false,
        });
      }
    };
    
    // Small delay to ensure window.phantom is available
    const timer = setTimeout(checkPhantom, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch portfolio data from API
  const fetchPortfolio = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/portfolio?address=${address}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setPortfolio(data.data);
      } else {
        setError(data.error || 'Failed to fetch portfolio');
      }
    } catch (err) {
      setError('Network error fetching portfolio');
      console.error('[v0] Portfolio fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle wallet connection
  const connect = useCallback(async () => {
    const provider = getPhantomProvider();
    
    if (!provider) {
      window.open('https://phantom.app/', '_blank');
      return;
    }
    
    setWallet(prev => ({ ...prev, connecting: true }));
    setError(null);
    
    try {
      const { publicKey } = await provider.connect();
      const address = publicKey.toString();
      
      setWallet({
        connected: true,
        address,
        shortAddress: shortenAddress(address),
        connecting: false,
        disconnecting: false,
      });
      
      // Fetch portfolio for connected wallet
      await fetchPortfolio(address);
    } catch (err) {
      setError('Failed to connect wallet');
      setWallet(prev => ({ ...prev, connecting: false }));
      console.error('[v0] Wallet connect error:', err);
    }
  }, [fetchPortfolio]);

  // Handle wallet disconnection
  const disconnect = useCallback(async () => {
    const provider = getPhantomProvider();
    
    setWallet(prev => ({ ...prev, disconnecting: true }));
    
    try {
      await provider?.disconnect();
    } catch (err) {
      console.error('[v0] Wallet disconnect error:', err);
    }
    
    setWallet({
      connected: false,
      address: null,
      shortAddress: null,
      connecting: false,
      disconnecting: false,
    });
    setPortfolio(null);
  }, []);

  // Refresh portfolio
  const refreshPortfolio = useCallback(async () => {
    if (wallet.address) {
      await fetchPortfolio(wallet.address);
    }
  }, [wallet.address, fetchPortfolio]);

  // Listen for account changes
  useEffect(() => {
    const provider = getPhantomProvider();
    if (!provider) return;
    
    const handleAccountChange = (publicKey: { toString: () => string } | null) => {
      if (publicKey) {
        const address = publicKey.toString();
        setWallet({
          connected: true,
          address,
          shortAddress: shortenAddress(address),
          connecting: false,
          disconnecting: false,
        });
        fetchPortfolio(address);
      } else {
        setWallet({
          connected: false,
          address: null,
          shortAddress: null,
          connecting: false,
          disconnecting: false,
        });
        setPortfolio(null);
      }
    };
    
    const handleDisconnect = () => {
      setWallet({
        connected: false,
        address: null,
        shortAddress: null,
        connecting: false,
        disconnecting: false,
      });
      setPortfolio(null);
    };
    
    provider.on('accountChanged', handleAccountChange as (...args: unknown[]) => void);
    provider.on('disconnect', handleDisconnect);
    
    return () => {
      provider.off('accountChanged', handleAccountChange as (...args: unknown[]) => void);
      provider.off('disconnect', handleDisconnect);
    };
  }, [fetchPortfolio]);

  const value: WalletContextType = {
    wallet,
    portfolio,
    isLoading,
    error,
    connect,
    disconnect,
    refreshPortfolio,
    isPhantomInstalled,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// ============ Hook ============
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
