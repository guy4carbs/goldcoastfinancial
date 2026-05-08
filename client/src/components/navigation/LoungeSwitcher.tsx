/**
 * LoungeSwitcher - Navigate between 8 lounges based on user role
 * Shows only lounges the current user has access to
 */

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLoungeAccess } from '@/hooks/useLoungeAccess';
import {
  ChevronDown,
  Users,
  Bot,
  LayoutDashboard,
  DollarSign,
  Megaphone,
  HeadphonesIcon,
  Shield,
  BarChart3,
  Crown,
  type LucideIcon,
} from 'lucide-react';
import { goldCoastUrlForRole } from '@/lib/goldCoastUrl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// =============================================================================
// LOUNGE DEFINITIONS
// =============================================================================

export interface LoungeDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  color: string;
  path: string;
  requiredRoles: string[];
  /** When true, opens path in a new tab (cross-app jump). Skipped in
   *  hasAccess() checks since it's not a heritage lounge. */
  external?: boolean;
}

export const LOUNGES: LoungeDefinition[] = [
  {
    id: 'agent',
    name: 'Agent Lounge',
    shortName: 'Agent',
    description: 'Sales tools, leads, quotes, and performance tracking',
    icon: Users,
    color: 'violet',
    path: '/agents/dashboard',
    requiredRoles: ['founder', 'director', 'owner', 'system_admin', 'manager', 'sales_agent'],
  },
  {
    id: 'ai',
    name: 'AI Lounge',
    shortName: 'AI',
    description: 'AI agent control, Avatar Council, and automation',
    icon: Bot,
    color: 'cyan',
    path: '/ai/dashboard',
    requiredRoles: ['founder', 'director', 'owner', 'system_admin'],
  },
  {
    id: 'crm',
    name: 'Lobby',
    shortName: 'Lobby',
    description: 'Welcome center - navigate to your lounges',
    icon: LayoutDashboard,
    color: 'indigo',
    path: '/crm',
    requiredRoles: ['founder', 'director', 'owner', 'system_admin', 'manager', 'sales_agent'],
  },
  {
    id: 'finance',
    name: 'Finance Lounge',
    shortName: 'Finance',
    description: 'Commissions, revenue, and financial reporting',
    icon: DollarSign,
    color: 'emerald',
    path: '/finance/dashboard',
    requiredRoles: ['founder', 'director', 'owner', 'system_admin', 'manager', 'investor'],
  },
  {
    id: 'marketing',
    name: 'Marketing Lounge',
    shortName: 'Marketing',
    description: 'Content, campaigns, and brand management',
    icon: Megaphone,
    color: 'rose',
    path: '/marketing/dashboard',
    requiredRoles: ['founder', 'director', 'owner', 'system_admin', 'manager', 'marketing_staff'],
  },
  {
    id: 'support',
    name: 'Support Lounge',
    shortName: 'Support',
    description: 'Tickets, client service, and help desk',
    icon: HeadphonesIcon,
    color: 'amber',
    path: '/support/dashboard',
    requiredRoles: ['founder', 'director', 'owner', 'system_admin', 'manager'],
  },
  {
    id: 'admin',
    name: 'Admin Lounge',
    shortName: 'Admin',
    description: 'System settings, users, and configuration',
    icon: Shield,
    color: 'slate',
    path: '/admin',
    requiredRoles: ['founder', 'director', 'owner', 'system_admin'],
  },
  {
    id: 'investor',
    name: 'Investor Lounge',
    shortName: 'Investor',
    description: 'KPIs, analytics, and executive dashboards',
    icon: BarChart3,
    color: 'indigo',
    path: '/investor/dashboard',
    requiredRoles: ['founder', 'director', 'owner', 'investor'],
  },
  {
    id: 'goldcoast',
    name: 'Gold Coast',
    shortName: 'Gold Coast',
    description: 'Founders Lounge — agency oversight (opens in new tab)',
    icon: Crown,
    color: 'amber',
    path: '#GOLD_COAST_PLACEHOLDER#',
    external: true,
    requiredRoles: ['founder', 'director', 'owner', 'system_admin', 'manager', 'sales_agent'],
  },
];

// =============================================================================
// HELPERS
// =============================================================================

function canAccessLounge(lounge: LoungeDefinition, userRole?: string): boolean {
  if (!userRole) return false;
  return lounge.requiredRoles.includes(userRole);
}

function getCurrentLounge(pathname: string): LoungeDefinition | undefined {
  // Match by path prefix
  return LOUNGES.find((lounge) => {
    if (pathname.startsWith('/agents')) return lounge.id === 'agent';
    if (pathname.startsWith('/ai')) return lounge.id === 'ai';
    if (pathname.startsWith('/crm')) return lounge.id === 'crm';
    if (pathname.startsWith('/finance')) return lounge.id === 'finance';
    if (pathname.startsWith('/marketing')) return lounge.id === 'marketing';
    if (pathname.startsWith('/support')) return lounge.id === 'support';
    if (pathname.startsWith('/admin')) return lounge.id === 'admin';
    if (pathname.startsWith('/investor')) return lounge.id === 'investor';
    return false;
  });
}

// =============================================================================
// COMPONENT
// =============================================================================

interface LoungeSwitcherProps {
  variant?: 'dropdown' | 'grid' | 'link';
  className?: string;
}

export function LoungeSwitcher({ variant = 'dropdown', className }: LoungeSwitcherProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const currentLounge = getCurrentLounge(location);
  const { hasAccess, isLoading: loungeAccessLoading } = useLoungeAccess();

  // Filter lounges by user role AND DB lounge access, then resolve the
  // Gold Coast placeholder to a role-aware URL.
  const accessibleLounges = LOUNGES
    .filter((lounge) => {
      // Role check first (baseline)
      if (!canAccessLounge(lounge, user?.role)) return false;
      // External lounges (e.g., Gold Coast) aren't in user_lounge_access — role
      // check is the only gate.
      if (lounge.external) return true;
      // If DB access hasn't loaded yet, show role-based defaults
      if (loungeAccessLoading) return true;
      // Check DB-level access
      return hasAccess(lounge.id);
    })
    .map((lounge) => lounge.path === '#GOLD_COAST_PLACEHOLDER#'
      ? { ...lounge, path: goldCoastUrlForRole(user?.role) }
      : lounge
    );

  if (accessibleLounges.length <= 1) {
    // Don't show switcher if user can only access one lounge
    return null;
  }

  // ==========================================================================
  // LINK VARIANT - Simple text link to switch
  // ==========================================================================

  if (variant === 'link') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className={cn('flex items-center gap-1 hover:underline', className)}>
          Switch lounge
          <ChevronDown className="w-3 h-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Switch to...</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accessibleLounges.map((lounge) => {
            const Icon = lounge.icon;
            const isActive = currentLounge?.id === lounge.id;
            const inner = (
              <>
                <Icon className={cn('w-4 h-4', `text-${lounge.color}-500`)} />
                <span>{lounge.name}</span>
                {isActive && (
                  <span className="ml-auto text-xs text-gray-400">(current)</span>
                )}
              </>
            );
            return (
              <DropdownMenuItem key={lounge.id} asChild disabled={isActive}>
                {lounge.external ? (
                  <a href={lounge.path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    {inner}
                  </a>
                ) : (
                  <Link href={lounge.path} className="flex items-center gap-2">
                    {inner}
                  </Link>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // ==========================================================================
  // GRID VARIANT - Full grid of lounges (for sidebar or dedicated switcher page)
  // ==========================================================================

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-2 gap-3', className)}>
        {accessibleLounges.map((lounge) => {
          const Icon = lounge.icon;
          const isActive = currentLounge?.id === lounge.id;
          const tile = (
            <div
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer',
                isActive
                  ? `border-${lounge.color}-500 bg-${lounge.color}-50`
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  isActive ? `bg-${lounge.color}-500` : 'bg-gray-100'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-gray-600')} />
              </div>
              <span className={cn('text-sm font-medium', isActive ? `text-${lounge.color}-700` : 'text-gray-700')}>
                {lounge.shortName}
              </span>
            </div>
          );
          return lounge.external ? (
            <a key={lounge.id} href={lounge.path} target="_blank" rel="noopener noreferrer">
              {tile}
            </a>
          ) : (
            <Link key={lounge.id} href={lounge.path}>
              {tile}
            </Link>
          );
        })}
      </div>
    );
  }

  // ==========================================================================
  // DROPDOWN VARIANT (default) - Header dropdown
  // ==========================================================================

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2', className)}>
          {currentLounge ? (
            <>
              <currentLounge.icon className={cn('w-4 h-4', `text-${currentLounge.color}-500`)} />
              <span className="hidden sm:inline">{currentLounge.shortName}</span>
            </>
          ) : (
            <span>Switch Lounge</span>
          )}
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch Lounge</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accessibleLounges.map((lounge) => {
          const Icon = lounge.icon;
          const isActive = currentLounge?.id === lounge.id;
          const inner = (
            <>
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                  isActive ? `bg-${lounge.color}-500` : 'bg-gray-100'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-gray-600')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', isActive && `text-${lounge.color}-700`)}>
                  {lounge.name}
                  {isActive && <span className="ml-2 text-xs text-gray-400">(current)</span>}
                </p>
                <p className="text-xs text-gray-500 truncate">{lounge.description}</p>
              </div>
            </>
          );
          return (
            <DropdownMenuItem key={lounge.id} asChild disabled={isActive}>
              {lounge.external ? (
                <a href={lounge.path} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 py-2">
                  {inner}
                </a>
              ) : (
                <Link href={lounge.path} className="flex items-start gap-3 py-2">
                  {inner}
                </Link>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LoungeSwitcher;
