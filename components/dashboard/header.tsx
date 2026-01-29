'use client';

import React from 'react';
import { useApp } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { WalletButton } from './wallet-button';
import { cn } from '@/lib/utils';
import {
  Download,
  Settings,
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  ShieldAlert,
} from 'lucide-react';

export type DashboardView = 'overview' | 'performance' | 'journal' | 'risk';

const navItems: { id: DashboardView; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'risk', label: 'Risk', icon: ShieldAlert },
];

export function Header() {
  const { activeView, setActiveView, exportTrades } = useApp();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">D</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold tracking-tight">Deriverse</h1>
              <p className="text-xs text-muted-foreground">Analytics</p>
            </div>
          </div>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                active={activeView === item.id}
                onClick={() => setActiveView(item.id)}
                icon={item.icon}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 bg-transparent sm:flex"
            onClick={exportTrades}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <WalletButton />

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            active={activeView === item.id}
            onClick={() => setActiveView(item.id)}
            icon={item.icon}
            compact
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

interface NavLinkProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ElementType;
  compact?: boolean;
}

function NavLink({
  children,
  active = false,
  onClick,
  icon: Icon,
  compact = false,
}: NavLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-md text-sm font-medium transition-colors',
        compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
      )}
    >
      {Icon && <Icon className={cn('h-4 w-4', compact && 'h-3.5 w-3.5')} />}
      {children}
    </button>
  );
}
