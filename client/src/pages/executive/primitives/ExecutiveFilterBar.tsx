/**
 * Executive Filter Bar — Period selector + team filter + export button
 * Heritage Design System — Orange/Amber theme
 */

import { Button } from '@/components/ui/button';
import { Download, Calendar } from 'lucide-react';
import { GRID, TYPE, RADIUS, COLORS, GLASS } from '@/lib/heritageDesignSystem';
import { EXECUTIVE_GRADIENT_CSS } from '../executiveConstants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DEFAULT_PERIODS = ['This Month', 'This Quarter', 'YTD', 'All Time'];
const DEFAULT_TEAMS = ['All Teams', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Echo'];

interface ExecutiveFilterBarProps {
  periods?: string[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  periodLabels?: Record<string, string>;
  teams?: string[];
  activeTeam?: string;
  onTeamChange?: (team: string) => void;
  onExport?: () => void;
  className?: string;
}

export function ExecutiveFilterBar({
  periods = DEFAULT_PERIODS,
  activePeriod,
  onPeriodChange,
  periodLabels,
  teams = DEFAULT_TEAMS,
  activeTeam,
  onTeamChange,
  onExport,
  className,
}: ExecutiveFilterBarProps) {
  const currentPeriod = activePeriod || periods[0];
  const currentTeam = activeTeam || teams[0];

  return (
    <div
      className={cn('flex flex-wrap items-center', className)}
      style={{ gap: GRID.spacing.sm }}
    >
      {/* ─── PERIOD PILLS ─── */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Calendar
          className="text-stone-400 mr-1"
          style={{ width: 16, height: 16 }}
          aria-hidden="true"
        />
        {periods.map((period) => {
          const isActive = period === currentPeriod;
          return (
            <button
              key={period}
              onClick={() => onPeriodChange?.(period)}
              className={cn(
                'font-medium transition-all duration-150',
                isActive ? 'text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100',
              )}
              style={{
                fontSize: TYPE.caption,
                padding: '6px 12px',
                borderRadius: RADIUS.button,
                border: 'none',
                cursor: 'pointer',
                ...(isActive
                  ? { background: EXECUTIVE_GRADIENT_CSS }
                  : {
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }),
              }}
            >
              {periodLabels?.[period] ?? period}
            </button>
          );
        })}
      </div>

      {/* ─── TEAM PILLS ─── */}
      <div
        className="flex flex-wrap items-center gap-1.5"
        style={{ marginLeft: GRID.spacing.xs }}
      >
        {teams.map((team) => {
          const isActive = team === currentTeam;
          return (
            <button
              key={team}
              onClick={() => onTeamChange?.(team)}
              className={cn(
                'font-medium transition-all duration-150',
                isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100',
              )}
              style={{
                fontSize: TYPE.caption,
                padding: '6px 12px',
                borderRadius: RADIUS.button,
                border: 'none',
                cursor: 'pointer',
                ...(!isActive
                  ? {
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }
                  : {}),
              }}
            >
              {team}
            </button>
          );
        })}
      </div>

      {/* ─── EXPORT BUTTON ─── */}
      <div className="ml-auto">
        <Button
          variant="ghost"
          size="sm"
          className="text-stone-500 hover:text-stone-700"
          onClick={onExport || (() => toast.success('Exporting data...'))}
        >
          <Download style={{ width: 16, height: 16, marginRight: 6 }} />
          Export
        </Button>
      </div>
    </div>
  );
}

export default ExecutiveFilterBar;
