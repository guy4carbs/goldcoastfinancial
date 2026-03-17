/**
 * Executive Command Palette — Cmd+K
 * Full-featured command palette using cmdk package
 * Heritage Design System — Orange/Amber theme
 */

import { useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search,
  LayoutDashboard,
  Users,
  Target,
  TrendingUp,
  LineChart,
  DollarSign,
  FileBarChart,
  Settings,
  BarChart3,
  PieChart,
  Download,
  Send,
  Eye,
  Calendar,
  UserPlus,
  GitBranch,
  ClipboardList,
  UserCog,
  Building,
  Building2,
  HelpCircle,
  ShieldCheck,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  COLORS,
} from '@/lib/heritageDesignSystem';

// ─── TYPES ───
interface ExecutiveCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommandItemDef {
  id: string;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  action: () => void;
}

// ─── COMPONENT ───
export function ExecutiveCommandPalette({ open, onOpenChange }: ExecutiveCommandPaletteProps) {
  const [, setLocation] = useLocation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const nav = (href: string) => () => {
    setLocation(href);
    onOpenChange(false);
  };

  const quickAction = (message: string) => () => {
    toast.success(message);
    onOpenChange(false);
  };

  // ─── NAVIGATION COMMANDS ───
  const navigationItems: CommandItemDef[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', shortcut: 'G D', action: nav('/executive/dashboard') },
    { id: 'kpis', icon: Target, label: 'Key Metrics', shortcut: 'G K', action: nav('/executive/kpis') },
    { id: 'revenue', icon: DollarSign, label: 'Revenue & Forecasting', shortcut: 'G R', action: nav('/executive/revenue') },
    { id: 'commissions', icon: PieChart, label: 'Commissions', action: nav('/executive/commissions') },
    { id: 'sales', icon: TrendingUp, label: 'Sales & Production', shortcut: 'G S', action: nav('/executive/sales') },
    { id: 'pipeline', icon: ClipboardList, label: 'Policy Pipeline', action: nav('/executive/pipeline') },
    { id: 'recruiting', icon: UserPlus, label: 'Recruiting Dashboard', action: nav('/executive/recruiting') },
    { id: 'recruiting-pipeline', icon: GitBranch, label: 'Recruiting Pipeline', action: nav('/executive/recruiting-pipeline') },
    { id: 'team', icon: Users, label: 'Team Performance', shortcut: 'G T', action: nav('/executive/team') },
    { id: 'hierarchy', icon: Building2, label: 'Agency Hierarchy', action: nav('/executive/hierarchy') },
    { id: 'book-of-business', icon: BookOpen, label: 'Book of Business', action: nav('/executive/book-of-business') },
    { id: 'lead-distribution', icon: Send, label: 'Lead Distribution', action: nav('/executive/lead-distribution') },
    { id: 'growth', icon: LineChart, label: 'Growth Analytics', action: nav('/executive/growth') },
    { id: 'reports', icon: FileBarChart, label: 'Custom Reports', action: nav('/executive/reports') },
    { id: 'investor', icon: BarChart3, label: 'Investor View', action: nav('/executive/investor') },
    { id: 'agent-mgmt', icon: UserCog, label: 'Agent Management', action: nav('/executive/agent-management') },
    { id: 'agency-mgmt', icon: Building, label: 'Agency Management', action: nav('/executive/agency-management') },
    { id: 'lounge-access', icon: ShieldCheck, label: 'Lounge Access Control', action: nav('/executive/lounge-access') },
    { id: 'settings', icon: Settings, label: 'Settings', action: nav('/executive/settings') },
    { id: 'support', icon: HelpCircle, label: 'Help & Support', action: nav('/executive/support') },
  ];

  // ─── QUICK ACTION COMMANDS ───
  const quickActionItems: CommandItemDef[] = [
    { id: 'schedule-review', icon: Calendar, label: 'Schedule Quarterly Review', shortcut: 'S R', action: quickAction('Scheduling quarterly review...') },
    { id: 'export-report', icon: Download, label: 'Export Executive Report', shortcut: 'E R', action: quickAction('Generating executive report...') },
    { id: 'send-update', icon: Send, label: 'Send Investor Update', shortcut: 'S U', action: quickAction('Opening investor update composer...') },
    { id: 'view-forecast', icon: LineChart, label: 'View Revenue Forecast', shortcut: 'V F', action: quickAction('Opening forecast view...') },
    { id: 'view-pipeline', icon: Eye, label: 'View Full Pipeline', shortcut: 'V P', action: quickAction('Opening pipeline view...') },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <style>{`
            .executive-command-palette [cmdk-group-heading] {
              font-size: ${TYPE.micro}px;
              color: ${COLORS.gray[400]};
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 600;
              padding: ${GRID.spacing.xs}px ${GRID.spacing.sm}px;
              user-select: none;
            }
            .executive-command-palette [cmdk-item] {
              display: flex;
              align-items: center;
              cursor: pointer;
              padding: ${GRID.spacing.sm}px;
              border-radius: ${RADIUS.button}px;
              gap: ${GRID.spacing.sm}px;
              font-size: ${TYPE.meta}px;
              color: ${COLORS.gray[700]};
              transition: background-color 0.12s ease, color 0.12s ease;
            }
            .executive-command-palette [cmdk-item][data-selected="true"] {
              background-color: #fffbeb;
              color: #b45309;
            }
            .executive-command-palette [cmdk-item][data-selected="true"] .cmd-item-icon {
              color: #d97706;
            }
            .executive-command-palette [cmdk-item][data-selected="true"] .cmd-item-label {
              color: #b45309;
            }
            .executive-command-palette [cmdk-item][data-selected="true"] .cmd-item-shortcut {
              color: #f59e0b;
            }
            .executive-command-palette [cmdk-item]:not([data-selected="true"]):hover {
              background-color: ${COLORS.gray[50]};
            }
            .executive-command-palette [cmdk-input] {
              width: 100%;
              background: transparent;
              outline: none;
              border: none;
              font-size: ${TYPE.body}px;
              height: ${GRID.spacing.xxl + GRID.spacing.xs}px;
              color: ${COLORS.gray[900]};
              font-weight: 500;
            }
            .executive-command-palette [cmdk-input]::placeholder {
              color: ${COLORS.gray[400]};
            }
            .executive-command-palette [cmdk-list] {
              max-height: 360px;
              overflow-y: auto;
              padding: ${GRID.spacing.xs}px;
              overscroll-behavior: contain;
            }
            .executive-command-palette [cmdk-group] + [cmdk-group] {
              margin-top: ${GRID.spacing.xs}px;
            }
          `}</style>

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.duration.fast }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
            className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none"
            style={{ paddingTop: '20vh' }}
          >
            <div
              className="executive-command-palette w-full overflow-hidden pointer-events-auto"
              style={{
                maxWidth: '32rem',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.hero,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              }}
            >
              <Command label="Executive Command Palette" loop>
                {/* Search Input */}
                <div
                  className="flex items-center border-b"
                  style={{ padding: `0 ${GRID.spacing.md}px`, borderColor: COLORS.gray[200] }}
                >
                  <Search
                    className="flex-shrink-0"
                    style={{ width: 18, height: 18, color: COLORS.gray[400], marginRight: GRID.spacing.sm }}
                  />
                  <Command.Input autoFocus placeholder="Type a command or search..." />
                  <kbd
                    className="flex-shrink-0 inline-flex items-center font-medium"
                    style={{
                      padding: '2px 8px',
                      fontSize: TYPE.micro,
                      borderRadius: RADIUS.button / 2,
                      border: `1px solid ${COLORS.gray[200]}`,
                      color: COLORS.gray[400],
                      backgroundColor: COLORS.gray[50],
                    }}
                  >
                    ESC
                  </kbd>
                </div>

                {/* Command List */}
                <Command.List>
                  <Command.Empty
                    className="flex items-center justify-center"
                    style={{ padding: GRID.spacing.xl, fontSize: TYPE.meta, color: COLORS.gray[500] }}
                  >
                    No results found.
                  </Command.Empty>

                  <Command.Group heading="Navigation">
                    {navigationItems.map((item) => (
                      <CommandItemRow key={item.id} item={item} />
                    ))}
                  </Command.Group>

                  <Command.Group heading="Quick Actions">
                    {quickActionItems.map((item) => (
                      <CommandItemRow key={item.id} item={item} />
                    ))}
                  </Command.Group>

                  <Command.Group heading="Teams">
                    {[
                      { id: 'team-alpha', name: 'Team Alpha', manager: 'Marcus Rivera' },
                      { id: 'team-beta', name: 'Team Beta', manager: 'Jennifer Walsh' },
                      { id: 'team-gamma', name: 'Team Gamma', manager: 'Kevin Park' },
                    ].map((team) => (
                      <Command.Item
                        key={team.id}
                        value={`${team.name} ${team.manager}`}
                        onSelect={() => {
                          setLocation('/executive/team');
                          onOpenChange(false);
                        }}
                      >
                        <Users
                          className="cmd-item-icon flex-shrink-0"
                          style={{ width: 18, height: 18, color: COLORS.gray[400] }}
                        />
                        <span className="cmd-item-label flex-1 font-medium">{team.name}</span>
                        <span
                          className="cmd-item-shortcut flex-shrink-0"
                          style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}
                        >
                          {team.manager}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>
              </Command>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── INDIVIDUAL COMMAND ITEM ───
function CommandItemRow({ item }: { item: CommandItemDef }) {
  const Icon = item.icon;

  return (
    <Command.Item value={item.label} onSelect={item.action}>
      <Icon
        className="cmd-item-icon flex-shrink-0"
        style={{ width: 18, height: 18, color: COLORS.gray[400] }}
      />
      <span className="cmd-item-label flex-1 font-medium">{item.label}</span>
      {item.shortcut && (
        <span
          className="cmd-item-shortcut flex-shrink-0"
          style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}
        >
          {item.shortcut}
        </span>
      )}
    </Command.Item>
  );
}

export default ExecutiveCommandPalette;
