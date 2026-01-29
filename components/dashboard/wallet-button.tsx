'use client';

import { useWallet } from '@/contexts/wallet-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WalletButton() {
  const {
    wallet,
    portfolio,
    connect,
    disconnect,
    refreshPortfolio,
    isLoading,
    isPhantomInstalled,
  } = useWallet();

  const handleCopyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
    }
  };

  const handleViewOnSolscan = () => {
    if (wallet.address) {
      window.open(`https://solscan.io/account/${wallet.address}`, '_blank');
    }
  };

  if (!wallet.connected) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={connect}
        disabled={wallet.connecting}
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        {wallet.connecting ? 'Connecting...' : isPhantomInstalled ? 'Connect Wallet' : 'Install Phantom'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
          disabled={isLoading}
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
            <Wallet className="h-3 w-3 text-primary" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-mono text-xs">{wallet.shortAddress}</span>
            {portfolio && (
              <span className="text-[10px] text-muted-foreground">
                {portfolio.solBalance.toFixed(2)} SOL
              </span>
            )}
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {portfolio && (
          <>
            <div className="px-2 py-1.5">
              <p className="text-xs text-muted-foreground">Portfolio Value</p>
              <p className="text-lg font-semibold">
                ${portfolio.totalUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleCopyAddress} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewOnSolscan} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          View on Solscan
        </DropdownMenuItem>
        <DropdownMenuItem onClick={refreshPortfolio} disabled={isLoading} className="gap-2">
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          Refresh Portfolio
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={disconnect}
          disabled={wallet.disconnecting}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {wallet.disconnecting ? 'Disconnecting...' : 'Disconnect'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
