/**
 * Manager Command Palette — Cmd+K
 * Full-featured command palette using cmdk package
 * Heritage Design System — Emerald theme
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
  GraduationCap,
  Calendar,
  UserCheck,
  Trophy,
  Award,
  DollarSign,
  FileBarChart,
  Bell,
  Settings,
  Activity,
  Zap,
  Briefcase,
  AlertTriangle,
  CheckSquare,
  BookOpen,
  MessageSquare,
  Building2,
  ClipboardList,
  Send,
  PlusCircle,
  Eye,
  Download,
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
interface ManagerCommandPaletteProps {
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
export function ManagerCommandPalette({ open, onOpenChange }: ManagerCommandPaletteProps) {
  const [, setLocation] = useLocation();

  // Close on escape
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

  // Navigation helper
  const nav = (href: string) => () => {
    setLocation(href);
    onOpenChange(false);
  };

  // Quick action helper
  const quickAction = (message: string) => () => {
    toast.success(message);
    onOpenChange(false);
  };

  // ─── NAVIGATION COMMANDS ───
  const navigationItems: CommandItemDef[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', shortcut: 'G D', action: nav('/manager/dashboard') },
    { id: 'team', icon: Users, label: 'Roster', shortcut: 'G T', action: nav('/manager/team') },
    { id: 'pipeline', icon: Target, label: 'Pipeline', shortcut: 'G P', action: nav('/manager/pipeline') },
    { id: 'team-performance', icon: Trophy, label: 'Performance', action: nav('/manager/team-performance') },
    { id: 'forecasting', icon: LineChart, label: 'Forecasting', action: nav('/manager/forecasting') },
    { id: 'development', icon: GraduationCap, label: 'Coaching', action: nav('/manager/development') },
    { id: 'compliance', icon: CheckSquare, label: 'Compliance', action: nav('/manager/compliance') },
    { id: 'training', icon: BookOpen, label: 'Training', action: nav('/manager/training') },
    { id: 'goals', icon: Target, label: 'Goals', action: nav('/manager/goals') },
    { id: 'contests', icon: Award, label: 'Contests', action: nav('/manager/team-performance') },
    { id: 'commissions', icon: DollarSign, label: 'Commissions', action: nav('/manager/commissions') },
    { id: 'reports', icon: FileBarChart, label: 'Reports', shortcut: 'G R', action: nav('/manager/reports') },
    { id: 'alerts', icon: Bell, label: 'Alerts', action: nav('/manager/alerts') },
    { id: 'settings', icon: Settings, label: 'Settings', action: nav('/manager/settings') },
    { id: 'activity-monitor', icon: Activity, label: 'Live Activity', action: nav('/manager/activity-monitor') },
    { id: 'onboarding', icon: Zap, label: 'Onboarding', action: nav('/manager/onboarding-tracker') },
    { id: 'client-health', icon: Briefcase, label: 'Retention', action: nav('/manager/client-health') },
    { id: 'escalations', icon: AlertTriangle, label: 'Escalations', action: nav('/manager/escalations') },
    { id: 'communications', icon: MessageSquare, label: 'Communications', action: nav('/manager/communications') },
    { id: 'scorecard', icon: UserCheck, label: 'Scorecard', action: nav('/manager/scorecard') },
    { id: 'promotions', icon: ClipboardList, label: 'Promotions', action: nav('/manager/team-performance') },
    { id: 'director', icon: Building2, label: 'Director View', action: nav('/manager/director') },
  ];

  // ─── QUICK ACTION COMMANDS ───
  const quickActionItems: CommandItemDef[] = [
    { id: 'schedule-1on1', icon: Send, label: 'Schedule 1:1', shortcut: 'S 1', action: quickAction('1:1 meeting scheduler opened') },
    { id: 'add-coaching-note', icon: PlusCircle, label: 'Add Coaching Note', shortcut: 'A N', action: quickAction('Coaching note created') },
    { id: 'escalate-issue', icon: AlertTriangle, label: 'Escalate Issue', shortcut: 'E I', action: quickAction('Escalation form opened') },
    { id: 'send-announcement', icon: MessageSquare, label: 'Send Team Announcement', shortcut: 'S A', action: quickAction('Announcement composer opened') },
    { id: 'view-pipeline', icon: Eye, label: 'View Pipeline', shortcut: 'V P', action: quickAction('Opening pipeline view...') },
    { id: 'export-reports', icon: Download, label: 'Export Reports', shortcut: 'E R', action: quickAction('Report export started') },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scoped styles for cmdk data-attribute selectors */}
          <style>{`
            .manager-command-palette [cmdk-group-heading] {
              font-size: ${TYPE.micro}px;
              color: ${COLORS.gray[400]};
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 600;
              padding: ${GRID.spacing.xs}px ${GRID.spacing.sm}px;
              user-select: none;
            }
            .manager-command-palette [cmdk-item] {
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
            .manager-command-palette [cmdk-item][data-selected="true"] {
              background-color: #ecfdf5;
              color: #047857;
            }
            .manager-command-palette [cmdk-item][data-selected="true"] .cmd-item-icon {
              color: #059669;
            }
            .manager-command-palette [cmdk-item][data-selected="true"] .cmd-item-label {
              color: #047857;
            }
            .manager-command-palette [cmdk-item][data-selected="true"] .cmd-item-shortcut {
              color: #10b981;
            }
            .manager-command-palette [cmdk-item]:not([data-selected="true"]):hover {
              background-color: ${COLORS.gray[50]};
            }
            .manager-command-palette [cmdk-input] {
              width: 100%;
              background: transparent;
              outline: none;
              border: none;
              font-size: ${TYPE.body}px;
              height: ${GRID.spacing.xxl + GRID.spacing.xs}px;
              color: ${COLORS.gray[900]};
              font-weight: 500;
            }
            .manager-command-palette [cmdk-input]::placeholder {
              color: ${COLORS.gray[400]};
            }
            .manager-command-palette [cmdk-list] {
              max-height: 360px;
              overflow-y: auto;
              padding: ${GRID.spacing.xs}px;
              overscroll-behavior: contain;
            }
            .manager-command-palette [cmdk-group] + [cmdk-group] {
              margin-top: ${GRID.spacing.xs}px;
            }
          `}</style>

          {/* Backdrop overlay */}
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
            transition={{
              duration: MOTION.duration.normal,
              ease: MOTION.easing,
            }}
            className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none"
            style={{ paddingTop: '20vh' }}
          >
            <div
              className="manager-command-palette w-full overflow-hidden pointer-events-auto"
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
              <Command
                label="Manager Command Palette"
                loop
              >
                {/* Search Input */}
                <div
                  className="flex items-center border-b"
                  style={{
                    padding: `0 ${GRID.spacing.md}px`,
                    borderColor: COLORS.gray[200],
                  }}
                >
                  <Search
                    className="flex-shrink-0"
                    style={{
                      width: 18,
                      height: 18,
                      color: COLORS.gray[400],
                      marginRight: GRID.spacing.sm,
                    }}
                  />
                  <Command.Input
                    autoFocus
                    placeholder="Type a command or search..."
                  />
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
                    style={{
                      padding: GRID.spacing.xl,
                      fontSize: TYPE.meta,
                      color: COLORS.gray[500],
                    }}
                  >
                    No results found.
                  </Command.Empty>

                  {/* Navigation Group */}
                  <Command.Group heading="Navigation">
                    {navigationItems.map((item) => (
                      <CommandItemRow key={item.id} item={item} />
                    ))}
                  </Command.Group>

                  {/* Quick Actions Group */}
                  <Command.Group heading="Quick Actions">
                    {quickActionItems.map((item) => (
                      <CommandItemRow key={item.id} item={item} />
                    ))}
                  </Command.Group>

                  {/* Team Members Group */}
                  <Command.Group heading="Team Members">
                    {[
                      { id: 'agent-sj', name: 'Sarah Johnson', role: 'Senior Agent' },
                      { id: 'agent-mc', name: 'Mike Chen', role: 'Agent' },
                      { id: 'agent-ed', name: 'Emily Davis', role: 'Agent' },
                      { id: 'agent-jw', name: 'James Wilson', role: 'Agent' },
                      { id: 'agent-lp', name: 'Lisa Park', role: 'Junior Agent' },
                      { id: 'agent-cm', name: 'Carlos Martinez', role: 'Agent' },
                      { id: 'agent-ak', name: 'Anna Kim', role: 'Senior Agent' },
                      { id: 'agent-rt', name: 'Ryan Taylor', role: 'Junior Agent' },
                    ].map((agent) => (
                      <Command.Item
                        key={agent.id}
                        value={`${agent.name} ${agent.role}`}
                        onSelect={() => {
                          setLocation('/manager/scorecard');
                          onOpenChange(false);
                        }}
                      >
                        <Users
                          className="cmd-item-icon flex-shrink-0"
                          style={{ width: 18, height: 18, color: COLORS.gray[400] }}
                        />
                        <span className="cmd-item-label flex-1 font-medium">
                          {agent.name}
                        </span>
                        <span
                          className="cmd-item-shortcut flex-shrink-0"
                          style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}
                        >
                          {agent.role}
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
    <Command.Item
      value={item.label}
      onSelect={item.action}
    >
      <Icon
        className="cmd-item-icon flex-shrink-0"
        style={{ width: 18, height: 18, color: COLORS.gray[400] }}
      />
      <span className="cmd-item-label flex-1 font-medium">
        {item.label}
      </span>
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

export default ManagerCommandPalette;
