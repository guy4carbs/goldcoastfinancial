/**
 * Manager Team — Team Roster Page
 * Full team roster with search, status, hover actions, detail drawer,
 * and bulk action functionality (select multiple agents for batch operations)
 * Heritage Design System — Emerald theme
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid, ManagerEmptyState } from './primitives';
import { MANAGER_ICON_GRADIENT, DEMO_TEAM_MEMBERS, STATUS_COLORS, CERT_STATUS_COLORS, CERT_LEVEL_LABELS, glassCard, SPARKLINE_TEAM_SIZE, SPARKLINE_WIN_RATE } from './managerConstants';
import { ScheduleCoachingModal } from './ScheduleCoachingModal';
import { ScheduleOneOnOneModal } from './ScheduleOneOnOneModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  RADIUS,
  TYPE,
  GRID,
  LAYOUT,
  MOTION,
  COLORS,
  SHADOW,
  fadeInUp,
  staggerContainer,
  staggerCards,
} from '@/lib/heritageDesignSystem';
import { ActivityMonitorContent, type TimeRange } from './ManagerActivityMonitor';
import {
  Users,
  UserCheck,
  Percent,
  UserPlus,
  Search,
  Lightbulb,
  Trophy,
  AlertCircle,
  Flame,
  ShieldAlert,
  GraduationCap,
  Calendar,
  Eye,
  X,
  Phone,
  Target,
  DollarSign,
  Zap,
  ChevronRight,
  CheckCircle2,
  Circle,
  MessageSquare,
  Download,
  Star,
  ArrowUpDown,
  FileText,
  Table2,
  Sheet,
  ChevronDown,
  Activity,
  Clock,
  Check,
} from 'lucide-react';

// ─── SORT & FILTER CONFIG ────────────────────────────────────
type StatusFilter = 'all' | 'active' | 'away' | 'offline';
type CertFilter = 'all' | 'current' | 'expiring' | 'overdue';
type SortKey = 'name' | 'quota' | 'status' | 'certLevel' | 'calls';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'away', label: 'Away' },
  { value: 'offline', label: 'Offline' },
];

const CERT_FILTERS: { value: CertFilter; label: string }[] = [
  { value: 'all', label: 'All Certs' },
  { value: 'current', label: 'Current' },
  { value: 'expiring', label: 'Expiring' },
  { value: 'overdue', label: 'Overdue' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'quota', label: 'Quota %' },
  { value: 'calls', label: 'Calls' },
  { value: 'certLevel', label: 'Cert Level' },
  { value: 'status', label: 'Status' },
];

const STATUS_ORDER: Record<string, number> = { active: 0, away: 1, offline: 2 };

const EXPORT_FORMATS = [
  { label: 'PDF', icon: FileText },
  { label: 'CSV', icon: Table2 },
  { label: 'XLSX', icon: Sheet },
] as const;

// ─── SPARKLINE DATA ─────────────────────────────────────────
// 7-day call trends per agent (seeded from agent data for consistency)
const SPARKLINE_DATA: Record<string, number[]> = {
  '1': [8, 10, 9, 12, 11, 14, 12],   // Sarah — trending up
  '2': [6, 7, 8, 7, 9, 8, 9],         // Mike — stable up
  '3': [5, 6, 4, 7, 5, 6, 6],         // Emily — flat
  '4': [7, 6, 5, 4, 4, 3, 5],         // James — trending down
  '5': [3, 4, 5, 5, 6, 7, 7],         // Lisa — trending up
  '6': [7, 8, 9, 8, 10, 9, 11],       // David — trending up
  '7': [9, 10, 11, 12, 11, 13, 14],   // Rachel — trending up
  '8': [4, 3, 2, 3, 2, 1, 2],         // Carlos — trending down
  '9': [2, 2, 3, 2, 1, 0, 0],         // Anna — offline
  '10': [5, 6, 5, 7, 6, 6, 6],        // Tom — stable
  '11': [7, 8, 9, 8, 10, 9, 10],      // Jessica — trending up
  '12': [1, 1, 0, 0, 0, 0, 0],        // Ryan — offline
};

// ─── DRAWER DEMO DATA ───────────────────────────────────────
// Per-agent pipeline deals (demo)
const AGENT_DEALS: Record<string, Array<{ name: string; stage: string; value: number }>> = {
  '1': [
    { name: 'Thompson Estate', stage: 'Proposal', value: 48000 },
    { name: 'Adams Corporate', stage: 'Contacted', value: 125000 },
  ],
  '2': [
    { name: 'Garcia Whole Life', stage: 'Proposal', value: 35000 },
    { name: 'Martinez Key Person', stage: 'New Lead', value: 76000 },
  ],
  '7': [
    { name: 'Williams Family IUL', stage: 'Qualified', value: 62000 },
    { name: 'Lee Estate Shield', stage: 'Proposal', value: 38000 },
  ],
};

// Recent activity per agent
const AGENT_ACTIVITY: Record<string, string[]> = {
  '1': ['Closed Thompson Estate ($48K)', 'Updated 3 pipeline deals', 'Completed advanced training module'],
  '2': ['Sent proposal to Garcia', 'Made 38 calls this week', 'Passed IUL assessment (92%)'],
  '3': ['Completed client needs module', 'Moved Nguyen to qualified', 'IUL cert expiring soon'],
  '4': ['On break — lunch', 'Made 24 calls this week', 'Annuity cert current'],
  '5': ['Started IUL Specialist Track', 'Consistent call volume improving', 'On call with Patel'],
  '6': ['Updated CRM notes for Brooks', 'Made 35 calls this week', 'Earned Whole Life Expert cert'],
  '7': ['Closed Lee Estate ($38K)', 'On call with new lead', 'Expert certification current'],
  '8': ['Offline since 11am', 'IUL cert overdue 5 days', 'Only 2 closes this month'],
  '9': ['Out of office today', 'IUL cert expiring in 12 days', 'Completed 2 modules last week'],
  '10': ['Reviewing proposals', 'Made 30 calls this week', 'Annuity cert in progress'],
  '11': ['In client presentation', 'Made 36 calls this week', 'Advanced certification current'],
  '12': ['Not logged in — 2 days', 'Basic cert overdue 14 days', 'No pipeline activity'],
};

type TeamMember = (typeof DEMO_TEAM_MEMBERS)[number];

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export function ManagerTeam() {
  const [viewMode, setViewMode] = useState<'roster' | 'activity'>('roster');
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<TeamMember | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [certFilter, setCertFilter] = useState<CertFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [showOneOnOneModal, setShowOneOnOneModal] = useState(false);
  const [modalAgent, setModalAgent] = useState<TeamMember | null>(null);

  const filteredMembers = useMemo(() => {
    let result = DEMO_TEAM_MEMBERS.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()),
    );
    if (statusFilter !== 'all') result = result.filter((m) => m.status === statusFilter);
    if (certFilter !== 'all') result = result.filter((m) => m.certStatus === certFilter);
    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'quota': return b.quota - a.quota;
        case 'calls': return b.calls - a.calls;
        case 'certLevel': return b.certLevel - a.certLevel;
        case 'status': return (STATUS_ORDER[a.status] ?? 2) - (STATUS_ORDER[b.status] ?? 2);
        default: return a.name.localeCompare(b.name);
      }
    });
    // Pinned to top
    return [...result].sort((a, b) => (pinnedIds.has(b.id) ? 1 : 0) - (pinnedIds.has(a.id) ? 1 : 0));
  }, [search, statusFilter, certFilter, sortBy, pinnedIds]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: DEMO_TEAM_MEMBERS.length };
    DEMO_TEAM_MEMBERS.forEach((m) => { c[m.status] = (c[m.status] || 0) + 1; });
    return c;
  }, []);

  const certCounts = useMemo(() => {
    const c: Record<string, number> = { all: DEMO_TEAM_MEMBERS.length };
    DEMO_TEAM_MEMBERS.forEach((m) => { c[m.certStatus] = (c[m.certStatus] || 0) + 1; });
    return c;
  }, []);

  // ─── BULK SELECTION HELPERS ─────────────────────────────────
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMembers.length) {
      // All currently visible are selected — deselect all
      setSelectedIds(new Set());
    } else {
      // Select all currently visible
      setSelectedIds(new Set(filteredMembers.map((m) => m.id)));
    }
  };

  const allSelected = filteredMembers.length > 0 && selectedIds.size === filteredMembers.length;

  // Close dropdowns on outside click
  useEffect(() => {
    if (!sortDropdownOpen && !exportDropdownOpen) return;
    const handler = () => { setSortDropdownOpen(false); setExportDropdownOpen(false); };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [sortDropdownOpen, exportDropdownOpen]);

  // Close time range dropdown on outside click
  useEffect(() => {
    if (!timeDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target as Node)) {
        setTimeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [timeDropdownOpen]);

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleExport = (format: string) => {
    setExportDropdownOpen(false);
    const agents = selectedIds.size > 0
      ? DEMO_TEAM_MEMBERS.filter((m) => selectedIds.has(m.id))
      : filteredMembers;
    const header = 'Name,Role,Status,Quota,Calls,Revenue,Cert Level,Cert Status,Last Active';
    const rows = agents.map((m) =>
      `${m.name},${m.role},${m.status},${m.quota}%,${m.calls},$${m.revenue},L${m.certLevel},${m.certStatus},${m.lastActive}`
    );
    const content = [header, ...rows].join('\n');
    const ext = format === 'CSV' ? 'csv' : format === 'XLSX' ? 'xls' : 'txt';
    const mime = format === 'CSV' ? 'text/csv' : format === 'XLSX' ? 'application/vnd.ms-excel' : 'text/plain';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Heritage_Team_Roster.${ext}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${agents.length} agents as ${format}`);
    if (selectedIds.size > 0) setSelectedIds(new Set());
  };

  // Quick insight calculations
  const topPerformer = [...DEMO_TEAM_MEMBERS].sort((a, b) => b.quota - a.quota)[0];
  const needsCoaching = [...DEMO_TEAM_MEMBERS].sort((a, b) => a.quota - b.quota)[0];
  const avgStreak = Math.round(
    DEMO_TEAM_MEMBERS.reduce((sum, m) => sum + m.streak, 0) / DEMO_TEAM_MEMBERS.length,
  );

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* Hero */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={viewMode === 'activity' ? Activity : Users}
            title={viewMode === 'activity' ? 'Live Activity' : 'Team Roster'}
            subtitle={viewMode === 'activity' ? 'See what your team is doing right now' : 'View and manage your team'}
            className="!overflow-visible"
          >
            {viewMode === 'activity' && (
              <div ref={timeDropdownRef} className="relative">
                <button
                  onClick={() => setTimeDropdownOpen((v) => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: RADIUS.pill,
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: TYPE.meta,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                >
                  <Clock size={16} />
                  {TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)?.label}
                  <ChevronDown
                    size={14}
                    style={{
                      transition: 'transform 0.2s',
                      transform: timeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>
                <AnimatePresence>
                  {timeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 8,
                        minWidth: 180,
                        background: '#ffffff',
                        borderRadius: RADIUS.input,
                        boxShadow: '0 12px 32px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        padding: 6,
                        zIndex: 50,
                      }}
                    >
                      {TIME_RANGE_OPTIONS.map((option) => {
                        const isSelected = timeRange === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => { setTimeRange(option.value); setTimeDropdownOpen(false); }}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left' as const,
                              padding: '10px 14px',
                              borderRadius: RADIUS.button,
                              fontSize: TYPE.meta,
                              fontWeight: isSelected ? 600 : 400,
                              color: isSelected ? COLORS.lounges.manager.dark : COLORS.gray[700],
                              background: isSelected ? 'rgba(16,185,129,0.08)' : 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = isSelected ? 'rgba(16,185,129,0.08)' : 'transparent';
                            }}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </ManagerPageHero>
        </motion.div>

        {/* ─── VIEW TOGGLE ─── */}
        <motion.div variants={fadeInUp}>
          <div
            className="flex items-center p-1 gap-1 w-fit"
            style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
          >
            {([
              { key: 'roster' as const, label: 'Roster', Icon: Users },
              { key: 'activity' as const, label: 'Live Activity', Icon: Activity },
            ]).map(({ key, label, Icon }) => {
              const isActive = viewMode === key;
              return (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={`flex items-center font-medium border-0 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                  style={{
                    fontSize: TYPE.meta,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.button,
                    cursor: 'pointer',
                    fontWeight: isActive ? 600 : 500,
                    gap: GRID.spacing.xs,
                  }}
                >
                  <Icon style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                  {label}
                  {key === 'activity' && (
                    <span
                      className="relative flex"
                      style={{ width: 8, height: 8 }}
                    >
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full bg-emerald-500" style={{ width: 8, height: 8 }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {viewMode === 'roster' ? (
        <>
        {/* Stat Cards */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard icon={Users} value="12" label="Total Agents" sparklineData={[...SPARKLINE_TEAM_SIZE]} delta={0} periodLabel="Last 30 days" />
            <ManagerStatCard
              icon={UserCheck}
              value="8"
              label="Active Today"
              delta={2}
              periodLabel="vs yesterday"
            />
            <ManagerStatCard icon={Percent} value="76%" label="Avg Quota" sparklineData={[...SPARKLINE_WIN_RATE]} delta={4.2} deltaFormat="percent" periodLabel="vs last month" northStar />
            <ManagerStatCard icon={UserPlus} value="2" label="New This Month" delta={1} periodLabel="vs last month" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={fadeInUp}>
          <div className="relative">
            <Search className="absolute text-gray-400" style={{ width: 16, height: 16, left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-gray-700 placeholder:text-gray-400"
              style={{ ...glassCard, padding: `${GRID.spacing.sm}px ${GRID.spacing.sm}px ${GRID.spacing.sm}px 36px`, borderRadius: RADIUS.card, fontSize: TYPE.meta, border: `1px solid ${COLORS.gray[200]}`, outline: 'none' }}
            />
            {search && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setSearch('')} className="absolute text-gray-400 hover:text-gray-600" style={{ right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}>
                <X style={{ width: 14, height: 14 }} />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Filter Pills + Sort */}
        <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between" style={{ gap: GRID.spacing.sm }}>
          <div className="flex flex-wrap items-center" style={{ gap: GRID.spacing.sm }}>
            {/* Status filters */}
            <div className="flex items-center p-1 gap-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
              {STATUS_FILTERS.map((f) => {
                const isActive = statusFilter === f.value;
                const count = statusCounts[f.value] || 0;
                return (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`flex items-center gap-2 font-medium border-0 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                    style={{
                      borderRadius: RADIUS.button, padding: '4px 12px', fontSize: TYPE.meta, cursor: 'pointer',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {f.label}
                    {count > 0 && (
                      <span className="h-5 px-1.5 text-[10px] bg-emerald-100 text-emerald-700 inline-flex items-center justify-center" style={{ borderRadius: RADIUS.pill, fontWeight: 700, minWidth: 18 }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Cert filters */}
            <div className="flex items-center p-1 gap-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
              {CERT_FILTERS.map((f) => {
                const isActive = certFilter === f.value;
                const count = certCounts[f.value] || 0;
                return (
                  <button
                    key={f.value}
                    onClick={() => setCertFilter(f.value)}
                    className={`flex items-center gap-2 font-medium border-0 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                    style={{
                      borderRadius: RADIUS.button, padding: '4px 12px', fontSize: TYPE.meta, cursor: 'pointer',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {f.label}
                    {count > 0 && f.value !== 'all' && (
                      <span className={`h-5 px-1.5 text-[10px] inline-flex items-center justify-center ${f.value === 'overdue' ? 'bg-red-100 text-red-700' : f.value === 'expiring' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`} style={{ borderRadius: RADIUS.pill, fontWeight: 700, minWidth: 18 }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center font-medium"
              style={{ gap: 4, fontSize: TYPE.meta, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm + 4}px`, borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer', ...glassCard, color: COLORS.gray[600] }}
            >
              <ArrowUpDown style={{ width: 13, height: 13 }} />
              {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
              <ChevronDown style={{ width: 11, height: 11, transition: 'transform 0.15s', transform: sortDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </motion.button>
            <AnimatePresence>
              {sortDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  className="absolute z-50"
                  style={{ top: '100%', right: 0, marginTop: 4, minWidth: 140, backgroundColor: 'white', borderRadius: RADIUS.card, boxShadow: '0 12px 36px rgba(0,0,0,0.15)', border: `1px solid ${COLORS.gray[200]}`, overflow: 'hidden' }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setSortDropdownOpen(false); }} className="flex items-center w-full hover:bg-gray-50" style={{ gap: GRID.spacing.xs, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, fontSize: TYPE.meta, color: sortBy === opt.value ? '#059669' : COLORS.gray[700], fontWeight: sortBy === opt.value ? 600 : 400, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Content — 2-col grid: roster + insights */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* Agent Roster — spans 2 cols on desktop */}
          <Card
            className="overflow-hidden border-0 lg:col-span-2"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                  style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                >
                  <Users className="text-amber-200" size={LAYOUT.icon.md} />
                </div>
                <span className="text-gray-900">Agent Roster</span>
              </CardTitle>
            </CardHeader>

            {/* ─── BULK ACTION BAR ─── */}
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: MOTION.duration.transition, ease: 'easeOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    className="flex items-center flex-wrap bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700"
                    style={{
                      padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                      gap: GRID.spacing.sm,
                      borderRadius: RADIUS.button,
                      boxShadow: SHADOW.card,
                      margin: `0 ${GRID.spacing.md}px`,
                    }}
                  >
                    {/* Selection count */}
                    <span
                      className="text-white font-semibold flex-shrink-0"
                      style={{ fontSize: TYPE.meta }}
                    >
                      {selectedIds.size} agent{selectedIds.size !== 1 ? 's' : ''} selected
                    </span>

                    <span className="flex-1" />

                    {/* Action Buttons */}
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center text-white"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: RADIUS.pill,
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        gap: GRID.spacing.xs / 2,
                        fontSize: TYPE.caption,
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        toast.success(`Coaching scheduled for ${selectedIds.size} agent${selectedIds.size !== 1 ? 's' : ''}`);
                        setSelectedIds(new Set());
                      }}
                    >
                      <GraduationCap style={{ width: 14, height: 14 }} />
                      Schedule Coaching
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center text-white"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: RADIUS.pill,
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        gap: GRID.spacing.xs / 2,
                        fontSize: TYPE.caption,
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        toast.success(`Message sent to ${selectedIds.size} agent${selectedIds.size !== 1 ? 's' : ''}`);
                        setSelectedIds(new Set());
                      }}
                    >
                      <MessageSquare style={{ width: 14, height: 14 }} />
                      Send Message
                    </motion.button>

                    {/* Export with format picker */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center text-white"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          borderRadius: RADIUS.pill,
                          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                          gap: GRID.spacing.xs / 2,
                          fontSize: TYPE.caption,
                          fontWeight: 500,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => { e.stopPropagation(); setExportDropdownOpen(!exportDropdownOpen); }}
                      >
                        <Download style={{ width: 14, height: 14 }} />
                        Export
                        <ChevronDown style={{ width: 11, height: 11 }} />
                      </motion.button>
                      <AnimatePresence>
                        {exportDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            className="absolute z-50"
                            style={{ bottom: '100%', left: 0, marginBottom: 4, minWidth: 120, backgroundColor: 'white', borderRadius: RADIUS.card, boxShadow: '0 12px 24px rgba(0,0,0,0.15)', border: `1px solid ${COLORS.gray[200]}`, overflow: 'hidden' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {EXPORT_FORMATS.map(({ label, icon: FmtIcon }) => (
                              <button key={label} onClick={() => handleExport(label)} className="flex items-center w-full hover:bg-gray-50" style={{ gap: GRID.spacing.xs, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, fontSize: TYPE.meta, color: COLORS.gray[700], background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                <FmtIcon style={{ width: 14, height: 14, color: '#059669' }} />
                                {label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center text-white"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: RADIUS.pill,
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        gap: GRID.spacing.xs / 2,
                        fontSize: TYPE.caption,
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedIds(new Set())}
                    >
                      <X style={{ width: 14, height: 14 }} />
                      Clear Selection
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {/* Table header */}
              <div
                className="flex items-center text-gray-400 font-medium hidden sm:flex"
                style={{
                  padding: `${GRID.spacing.xs}px 12px`,
                  fontSize: TYPE.caption,
                  marginBottom: GRID.spacing.xs,
                  borderBottom: `1px solid ${COLORS.gray[100]}`,
                  paddingBottom: GRID.spacing.xs,
                  marginTop: selectedIds.size > 0 ? GRID.spacing.sm : 0,
                }}
              >
                {/* Select-all checkbox */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: RADIUS.pill,
                    marginRight: GRID.spacing.xs,
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none',
                    padding: 0,
                  }}
                  onClick={toggleSelectAll}
                >
                  {allSelected ? (
                    <CheckCircle2 className="text-emerald-500" style={{ width: 20, height: 20 }} />
                  ) : (
                    <Circle className="text-gray-300" style={{ width: 20, height: 20 }} />
                  )}
                </motion.button>
                <span style={{ width: 14, flexShrink: 0 }} />
                <span style={{ width: LAYOUT.icon.xxl + 12 + 100, flexShrink: 0 }}>Agent</span>
                <span className="flex-1" />
                <span style={{ width: 80, textAlign: 'center' }}>Status</span>
                <span style={{ width: 48, textAlign: 'right' }}>Quota</span>
                <span className="hidden sm:block" style={{ width: 80, textAlign: 'right' }}>Active</span>
                <span className="hidden lg:block" style={{ width: 100 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {filteredMembers.map((member) => {
                  const statusColor = STATUS_COLORS[member.status];
                  const quotaColor =
                    member.quota >= 100
                      ? 'text-emerald-600'
                      : member.quota >= 70
                        ? 'text-gray-700'
                        : 'text-red-600';
                  const isSelected = selectedIds.has(member.id);

                  return (
                    <motion.div
                      key={member.id}
                      className="flex items-center group cursor-pointer"
                      style={{
                        padding: 12,
                        borderRadius: RADIUS.button,
                        gap: 12,
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                      }}
                      whileHover={{
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.1)' : COLORS.gray[50],
                        transition: { duration: MOTION.duration.hover },
                      }}
                      onClick={() => setSelectedAgent(member)}
                    >
                      {/* Selection Checkbox */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: RADIUS.pill,
                          cursor: 'pointer',
                          border: 'none',
                          background: 'none',
                          padding: 0,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(member.id);
                        }}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="text-emerald-500" style={{ width: 20, height: 20 }} />
                        ) : (
                          <Circle className="text-gray-300" style={{ width: 20, height: 20 }} />
                        )}
                      </motion.button>

                      {/* Pin star */}
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); togglePin(member.id); }}
                        className="flex-shrink-0"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Star style={{ width: 14, height: 14, color: pinnedIds.has(member.id) ? '#f59e0b' : COLORS.gray[300], fill: pinnedIds.has(member.id) ? '#f59e0b' : 'none', transition: 'all 0.2s' }} />
                      </motion.button>

                      {/* Avatar */}
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`}
                        style={{
                          width: LAYOUT.icon.xxl,
                          height: LAYOUT.icon.xxl,
                          borderRadius: RADIUS.button,
                          fontSize: TYPE.meta,
                        }}
                      >
                        {member.avatar}
                      </div>

                      {/* Name & Role */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                          {member.name}
                        </p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                          {member.role}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`flex items-center ${statusColor.bg} ${statusColor.text} border-0`}
                        style={{
                          borderRadius: RADIUS.pill,
                          padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`,
                          gap: GRID.spacing.xs / 2,
                          fontSize: TYPE.caption,
                          fontWeight: 500,
                        }}
                      >
                        <div
                          className={statusColor.dot}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: RADIUS.pill,
                          }}
                        />
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </div>

                      {/* Quota */}
                      <div className="text-right" style={{ minWidth: 48 }}>
                        <p className={`font-semibold ${quotaColor}`} style={{ fontSize: TYPE.meta }}>
                          {member.quota}%
                        </p>
                      </div>

                      {/* Last Active */}
                      <div className="text-right hidden sm:block" style={{ minWidth: 80 }}>
                        <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                          {member.lastActive}
                        </p>
                      </div>

                      {/* Hover Quick-Action Buttons */}
                      <div
                        className="hidden lg:flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ gap: GRID.spacing.xs / 2 }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: COLORS.gray[100] }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center text-gray-500 hover:text-emerald-600"
                          style={{
                            width: LAYOUT.icon.xl,
                            height: LAYOUT.icon.xl,
                            borderRadius: RADIUS.button,
                          }}
                          title="Coach"
                          onClick={(e) => { e.stopPropagation(); setModalAgent(member); setShowCoachingModal(true); }}
                        >
                          <GraduationCap style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: COLORS.gray[100] }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center text-gray-500 hover:text-emerald-600"
                          style={{
                            width: LAYOUT.icon.xl,
                            height: LAYOUT.icon.xl,
                            borderRadius: RADIUS.button,
                          }}
                          title="Schedule 1:1"
                          onClick={(e) => { e.stopPropagation(); setModalAgent(member); setShowOneOnOneModal(true); }}
                        >
                          <Calendar style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                        </motion.button>
                        <Link href={`/manager/scorecard/${member.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: COLORS.gray[100] }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center text-gray-500 hover:text-emerald-600"
                            style={{
                              width: LAYOUT.icon.xl,
                              height: LAYOUT.icon.xl,
                              borderRadius: RADIUS.button,
                            }}
                            title="View Scorecard"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <ManagerEmptyState icon={Users} title="No agents found" description="Try adjusting your search or filters." />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights Panel */}
          <Card
            className="overflow-hidden border-0"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                  style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                >
                  <Lightbulb className="text-amber-200" size={LAYOUT.icon.md} />
                </div>
                <span className="text-gray-900">Quick Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {/* Top Performer */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: RADIUS.button,
                    backgroundColor: COLORS.gray[50],
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <Trophy
                      className="text-amber-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    <p className="font-medium text-gray-500" style={{ fontSize: TYPE.caption }}>
                      Top Performer
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                    {topPerformer.name}
                  </p>
                  <p className="text-emerald-600 font-semibold" style={{ fontSize: TYPE.meta }}>
                    {topPerformer.quota}% quota
                  </p>
                </div>

                {/* Needs Coaching */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: RADIUS.button,
                    backgroundColor: COLORS.gray[50],
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <AlertCircle
                      className="text-red-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    <p className="font-medium text-gray-500" style={{ fontSize: TYPE.caption }}>
                      Needs Coaching
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                    {needsCoaching.name}
                  </p>
                  <p className="text-red-600 font-semibold" style={{ fontSize: TYPE.meta }}>
                    {needsCoaching.quota}% quota
                  </p>
                </div>

                {/* Team Avg Streak */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: RADIUS.button,
                    backgroundColor: COLORS.gray[50],
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <Flame
                      className="text-orange-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    <p className="font-medium text-gray-500" style={{ fontSize: TYPE.caption }}>
                      Avg Streak
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                    {avgStreak} days
                  </p>
                  <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                    Team average activity streak
                  </p>
                </div>

                {/* Compliance Alert */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: RADIUS.button,
                    backgroundColor: 'rgba(254,202,202,0.15)',
                    border: '1px solid rgba(254,202,202,0.3)',
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <ShieldAlert
                      className="text-red-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    <p className="font-medium text-gray-500" style={{ fontSize: TYPE.caption }}>
                      Compliance Alert
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                    {DEMO_TEAM_MEMBERS.filter((m) => m.certStatus === 'overdue').length} overdue, {DEMO_TEAM_MEMBERS.filter((m) => m.certStatus === 'expiring').length} expiring
                  </p>
                  <p className="text-red-600 font-medium" style={{ fontSize: TYPE.meta }}>
                    Certifications need attention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </>
        ) : (
          <ActivityMonitorContent timeRange={timeRange} />
        )}
      </motion.div>

      {/* ─── AGENT DETAIL DRAWER ─── */}
      <AnimatePresence>
        {selectedAgent && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION.duration.transition }}
              className="fixed inset-0 z-50"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
              onClick={() => setSelectedAgent(null)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
              style={{
                width: 480,
                maxWidth: '100vw',
                backgroundColor: '#ffffff',
                boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* Drawer Header — Gradient */}
              <div
                className="relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)',
                  padding: GRID.spacing.md,
                }}
              >
                {/* Blobs */}
                <div style={{ width: 120, height: 120, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm" />
                <div style={{ width: 80, height: 80, borderRadius: RADIUS.pill }} className="absolute bottom-0 left-0 bg-amber-400/15 translate-y-1/2 -translate-x-1/4 blur-md" />

                {/* Close button */}
                <motion.button
                  onClick={() => setSelectedAgent(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute flex items-center justify-center text-white/80 hover:text-white bg-white/15 hover:bg-white/25"
                  style={{
                    top: GRID.spacing.sm,
                    right: GRID.spacing.sm,
                    width: LAYOUT.icon.xl,
                    height: LAYOUT.icon.xl,
                    borderRadius: RADIUS.button,
                  }}
                >
                  <X style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                </motion.button>

                {/* Agent header */}
                <div className="relative z-10 flex items-center" style={{ gap: GRID.spacing.md }}>
                  <div
                    className="flex items-center justify-center text-white font-bold bg-white/20 backdrop-blur flex-shrink-0"
                    style={{
                      width: GRID.spacing.xxxl,
                      height: GRID.spacing.xxxl,
                      borderRadius: RADIUS.card,
                      fontSize: TYPE.title,
                      border: '1px solid rgba(255,255,255,0.25)',
                    }}
                  >
                    {selectedAgent.avatar}
                  </div>
                  <div>
                    <h2 className="font-bold text-white" style={{ fontSize: TYPE.section }}>
                      {selectedAgent.name}
                    </h2>
                    <p className="text-white/80" style={{ fontSize: TYPE.meta }}>
                      {selectedAgent.role}
                    </p>
                    <div className="flex items-center mt-1" style={{ gap: GRID.spacing.xs }}>
                      <div
                        className={STATUS_COLORS[selectedAgent.status].dot}
                        style={{ width: 8, height: 8, borderRadius: RADIUS.pill }}
                      />
                      <span className="text-white/70" style={{ fontSize: TYPE.caption }}>
                        {selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1)} · {selectedAgent.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Content */}
              <div style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

                {/* KPI Mini-Cards */}
                <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                  {[
                    { icon: Target, label: 'Quota', value: `${selectedAgent.quota}%` },
                    { icon: Phone, label: 'Calls/Week', value: String(selectedAgent.calls) },
                    { icon: DollarSign, label: 'Revenue', value: `$${(selectedAgent.revenue / 1000).toFixed(1)}K` },
                    { icon: Flame, label: 'Streak', value: `${selectedAgent.streak} days` },
                  ].map((kpi) => {
                    const KpiIcon = kpi.icon;
                    return (
                      <div
                        key={kpi.label}
                        style={{
                          padding: GRID.spacing.sm,
                          borderRadius: RADIUS.button,
                          background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Decorative blob */}
                        <div style={{ position: 'absolute', top: -10, right: -10, width: 50, height: 50, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,0.1)', filter: 'blur(4px)' }} />
                        <div className="relative z-10">
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2, marginBottom: 4 }}>
                            <KpiIcon className="text-white/70" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                            <span className="text-white/80 font-medium" style={{ fontSize: TYPE.caption }}>{kpi.label}</span>
                          </div>
                          <p className="font-bold text-white" style={{ fontSize: TYPE.title }}>{kpi.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Call Trend Sparkline (larger) */}
                <div>
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700"
                      style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}
                    >
                      <Phone className="text-amber-200" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                    </div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>7-Day Call Trend</p>
                  </div>
                <div
                  style={{
                    padding: GRID.spacing.sm,
                    borderRadius: RADIUS.button,
                    backgroundColor: COLORS.gray[50],
                  }}
                >
                  <svg width="100%" height={40} viewBox="0 0 400 40" preserveAspectRatio="none">
                    {(() => {
                      const data = SPARKLINE_DATA[selectedAgent.id] || [0, 0, 0, 0, 0, 0, 0];
                      const max = Math.max(...data, 1);
                      const min = Math.min(...data);
                      const range = max - min || 1;
                      const trending = data[data.length - 1] >= data[0];
                      const color = trending ? '#10b981' : '#f43f5e';

                      const points = data.map((v, i) => {
                        const x = (i / (data.length - 1)) * 400;
                        const y = 40 - ((v - min) / range) * 32 - 4;
                        return `${x},${y}`;
                      }).join(' ');

                      const areaPoints = `0,40 ${points} 400,40`;

                      return (
                        <>
                          <defs>
                            <linearGradient id={`sparkGrad-${selectedAgent.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                              <stop offset="100%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <polygon points={areaPoints} fill={`url(#sparkGrad-${selectedAgent.id})`} />
                          <polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        </>
                      );
                    })()}
                  </svg>
                  <div className="flex justify-between" style={{ marginTop: 4 }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                      <span key={d} className="text-gray-400" style={{ fontSize: TYPE.micro }}>{d}</span>
                    ))}
                  </div>
                </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700"
                      style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}
                    >
                      <Zap className="text-amber-200" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                    </div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>Recent Activity</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    {(AGENT_ACTIVITY[selectedAgent.id] || ['No recent activity']).map((activity, i) => (
                      <div
                        key={i}
                        className="flex items-start"
                        style={{ gap: GRID.spacing.xs, padding: `${GRID.spacing.xs}px 0` }}
                      >
                        <div
                          className="bg-emerald-500 flex-shrink-0"
                          style={{ width: 6, height: 6, borderRadius: RADIUS.pill, marginTop: 6 }}
                        />
                        <p className="text-gray-700" style={{ fontSize: TYPE.meta }}>{activity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pipeline Deals */}
                {AGENT_DEALS[selectedAgent.id] && (
                  <div>
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                      <div
                        className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700"
                        style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}
                      >
                        <Target className="text-amber-200" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                      </div>
                      <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>Active Deals</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                      {AGENT_DEALS[selectedAgent.id].map((deal, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                          style={{
                            padding: GRID.spacing.sm,
                            borderRadius: RADIUS.button,
                            backgroundColor: COLORS.gray[50],
                          }}
                        >
                          <div>
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{deal.name}</p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{deal.stage}</p>
                          </div>
                          <p className="font-bold text-gray-900" style={{ fontSize: TYPE.meta }}>
                            ${(deal.value / 1000).toFixed(0)}K
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certification & Training */}
                <div>
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700"
                      style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}
                    >
                      <GraduationCap className="text-amber-200" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                    </div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>Certification & Training</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                      <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>Cert Level</span>
                      <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                        {CERT_LEVEL_LABELS[selectedAgent.certLevel]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                      <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>Status</span>
                      <span
                        className={`font-semibold ${CERT_STATUS_COLORS[selectedAgent.certStatus].text}`}
                        style={{ fontSize: TYPE.meta }}
                      >
                        {selectedAgent.certStatus.charAt(0).toUpperCase() + selectedAgent.certStatus.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                      <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>Modules</span>
                      <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                        {selectedAgent.modulesCompleted} / {selectedAgent.modulesTotal}
                      </span>
                    </div>
                    <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                      <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>Avg Assessment</span>
                      <span
                        className={`font-semibold ${selectedAgent.assessmentAvg >= 80 ? 'text-emerald-600' : selectedAgent.assessmentAvg >= 60 ? 'text-amber-600' : 'text-red-600'}`}
                        style={{ fontSize: TYPE.meta }}
                      >
                        {selectedAgent.assessmentAvg}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-col" style={{ gap: GRID.spacing.xs }}>
                  <motion.button
                    onClick={() => { setModalAgent(selectedAgent); setShowCoachingModal(true); }}
                    className="flex items-center justify-center font-semibold text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 w-full"
                    style={{
                      fontSize: TYPE.meta,
                      gap: GRID.spacing.xs,
                      padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.button,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <GraduationCap style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                    Schedule Coaching Session
                  </motion.button>
                  <motion.button
                    onClick={() => { setModalAgent(selectedAgent); setShowOneOnOneModal(true); }}
                    className="flex items-center justify-center font-semibold text-emerald-700 border w-full"
                    style={{
                      fontSize: TYPE.meta,
                      gap: GRID.spacing.xs,
                      padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.button,
                      borderColor: COLORS.gray[200],
                      backgroundColor: 'white',
                    }}
                    whileHover={{ scale: 1.02, backgroundColor: COLORS.gray[50] }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Calendar style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                    Schedule 1:1 Meeting
                  </motion.button>
                  <Link href={`/manager/scorecard/${selectedAgent.id}`}>
                    <motion.button
                      className="flex items-center justify-center font-semibold text-gray-700 border w-full"
                      style={{
                        fontSize: TYPE.meta,
                        gap: GRID.spacing.xs,
                        padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        borderColor: COLORS.gray[200],
                        backgroundColor: 'white',
                      }}
                      whileHover={{ scale: 1.02, backgroundColor: COLORS.gray[50] }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                      View Full Scorecard
                      <ChevronRight style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ScheduleCoachingModal agent={modalAgent} open={showCoachingModal} onClose={() => setShowCoachingModal(false)} />
      <ScheduleOneOnOneModal agent={modalAgent} open={showOneOnOneModal} onClose={() => setShowOneOnOneModal(false)} />

    </ManagerLoungeLayout>
  );
}

export default ManagerTeam;
