'use client';

import React from "react"

import { useWallet } from '@/contexts/wallet-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, TrendingUp, Shield, BarChart3 } from 'lucide-react';

export function ConnectWalletPrompt() {
  const { connect, wallet, isPhantomInstalled } = useWallet();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Wallet className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Connect your Solana wallet to view your trading analytics, portfolio, and performance
            metrics.
          </p>
        </div>

        <Button
          size="lg"
          onClick={connect}
          disabled={wallet.connecting}
          className="w-full gap-2"
        >
          <Wallet className="h-5 w-5" />
          {wallet.connecting
            ? 'Connecting...'
            : isPhantomInstalled
              ? 'Connect Phantom'
              : 'Install Phantom'}
        </Button>

        <div className="grid grid-cols-3 gap-3 pt-4">
          <FeatureCard
            icon={TrendingUp}
            title="PnL Tracking"
            description="Real-time profit & loss"
          />
          <FeatureCard
            icon={BarChart3}
            title="Analytics"
            description="Detailed trade analysis"
          />
          <FeatureCard
            icon={Shield}
            title="Read-Only"
            description="Safe & secure access"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Deriverse Analytics uses read-only access to your wallet. We never request transaction
          signing permissions.
        </p>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="border-muted/50">
      <CardContent className="p-3 text-center">
        <Icon className="mx-auto h-5 w-5 text-primary" />
        <p className="mt-1 text-xs font-medium">{title}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
