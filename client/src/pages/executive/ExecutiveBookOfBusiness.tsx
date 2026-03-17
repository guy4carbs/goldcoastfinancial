/**
 * Executive Book of Business
 * Heritage Design System — Orange/Amber executive theme
 *
 * Three-level drill-down: Teams Grid → Agent drawer (dark header + client files) →
 * Client Detail drawer (back to files, personal info / policy cards).
 *
 * Design matches Manager Lounge Book of Business drawer exactly:
 * - Dark gradient header with agent stats (adapted from emerald → executive orange)
 * - Search + filter pills for client list
 * - Client rows with colored left border accent + outlined status badge
 * - Client detail with icon-labeled 2-col grid in white bordered cards
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Users, FileText, DollarSign, RefreshCw, X, ChevronLeft,
  ChevronRight, Mail, Phone, Cake, MapPin,
  Clock, CheckCircle, AlertTriangle, Search, Star,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from './primitives/ExecutiveStatCard';
import {
  GRID, TYPE, RADIUS, SHADOW, COLORS, GLASS, MOTION,
  fadeInUp, staggerContainer, scaleIn,
} from '@/lib/heritageDesignSystem';
import {
  fmtCurrency, EXECUTIVE_GRADIENT_CSS,
  DEMO_BOOK_TEAMS, DEMO_BOOK_AGENTS, DEMO_BOOK_CLIENTS,
} from './executiveConstants';
import type { BookTeam, BookClient } from './executiveConstants';

// ─── STATUS CONFIG ───────────────────────────────────
const CLIENT_STATUS_CFG: Record<string, { label: string; icon: typeof CheckCircle; border: string; dot: string; badge: string; badgeText: string; badgeBorder: string }> = {
  active:   { label: 'Active',   icon: CheckCircle,    border: '#10b981', dot: '#10b981', badge: 'bg-emerald-50',  badgeText: 'text-emerald-600', badgeBorder: 'border-emerald-200' },
  pending:  { label: 'Pending Renewal', icon: Clock,    border: '#3b82f6', dot: '#3b82f6', badge: 'bg-blue-50',     badgeText: 'text-blue-600',    badgeBorder: 'border-blue-200' },
  lapsed:   { label: 'Lapsed',   icon: AlertTriangle,   border: '#f59e0b', dot: '#f59e0b', badge: 'bg-amber-50',    badgeText: 'text-amber-600',   badgeBorder: 'border-amber-200' },
  cancelled:{ label: 'New',      icon: Star,            border: '#ec4899', dot: '#ec4899', badge: 'bg-pink-50',     badgeText: 'text-pink-600',    badgeBorder: 'border-pink-200' },
};

const POLICY_TYPE_COLORS: Record<string, string> = {
  IUL: '#ea580c', 'Whole Life': '#059669', 'Term Life': '#7c3aed', Annuity: '#1d4ed8', 'Final Expense': '#6b7280',
};

const TEAM_PILL: Record<string, { bg: string; text: string }> = {
  'on-track': { bg: '#ecfdf5', text: '#059669' },
  'at-risk':  { bg: '#fffbeb', text: '#d97706' },
  behind:     { bg: '#fef2f2', text: '#dc2626' },
};

const AGENT_DOT: Record<string, string> = { active: '#10b981', 'on-leave': '#3b82f6', probation: '#f59e0b' };
const AGENT_RING: Record<string, string> = { active: 'ring-emerald-300', 'on-leave': 'ring-blue-300', probation: 'ring-amber-300' };

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─── TEAM CARD ───────────────────────────────────────
function TeamCard({ team, onClick }: { team: BookTeam; onClick: () => void }) {
  const pill = TEAM_PILL[team.status] ?? TEAM_PILL['on-track'];
  const label = team.status === 'on-track' ? 'On Track' : team.status === 'at-risk' ? 'At Risk' : 'Behind';
  return (
    <motion.div variants={scaleIn} whileHover={{ y: -2, scale: 1.005 }} transition={{ duration: MOTION.duration.hover }} onClick={onClick} className="cursor-pointer">
      <Card className="border-0 overflow-hidden" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
        <CardContent style={{ padding: GRID.spacing.md }}>
          <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
            <span style={{ fontSize: TYPE.title, fontWeight: 700, color: COLORS.gray[900] }}>{team.name}</span>
            <span className="inline-flex items-center font-medium" style={{ fontSize: TYPE.micro, padding: '2px 10px', borderRadius: RADIUS.pill, backgroundColor: pill.bg, color: pill.text }}>{label}</span>
          </div>
          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginBottom: GRID.spacing.sm }}>Managed by {team.manager}</p>
          <div className="grid grid-cols-2" style={{ gap: 1, backgroundColor: COLORS.gray[200], borderRadius: RADIUS.input, overflow: 'hidden', marginBottom: GRID.spacing.sm }}>
            {[
              { l: 'Agents', v: String(team.agents) }, { l: 'Clients', v: String(team.totalClients) },
              { l: 'Policies', v: String(team.totalPolicies) }, { l: 'Premium', v: fmtCurrency(team.totalPremium) },
            ].map(s => (
              <div key={s.l} className="flex flex-col items-center justify-center" style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, backgroundColor: 'rgba(255,255,255,0.95)' }}>
                <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{s.l}</span>
                <span style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>{s.v}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden" style={{ height: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.gray[200] }}>
              <div style={{ width: `${team.renewalRate}%`, height: '100%', borderRadius: RADIUS.pill, background: EXECUTIVE_GRADIENT_CSS, transition: 'width 0.6s ease-out' }} />
            </div>
            <span style={{ fontSize: TYPE.micro, fontWeight: 600, color: COLORS.gray[600] }}>{team.renewalRate}%</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────
export function ExecutiveBookOfBusiness() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('All');
  const [agentSearch, setAgentSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState('All');
  const drawerRef = useRef<HTMLDivElement>(null);

  const selectedTeam = useMemo(() => DEMO_BOOK_TEAMS.find(t => t.id === selectedTeamId), [selectedTeamId]);
  const allTeamAgents = useMemo(() => DEMO_BOOK_AGENTS.filter(a => a.team.toLowerCase() === selectedTeamId), [selectedTeamId]);
  const teamAgents = useMemo(() => {
    let agents = allTeamAgents;
    if (agentSearch) agents = agents.filter(a => a.name.toLowerCase().includes(agentSearch.toLowerCase()));
    if (agentFilter !== 'All') {
      const filterMap: Record<string, string> = { Active: 'active', 'On Leave': 'on-leave', Probation: 'probation' };
      agents = agents.filter(a => a.status === filterMap[agentFilter]);
    }
    return agents;
  }, [allTeamAgents, agentSearch, agentFilter]);
  const selectedAgent = useMemo(() => DEMO_BOOK_AGENTS.find(a => a.id === selectedAgentId), [selectedAgentId]);
  const agentClients = useMemo(() => {
    let clients = DEMO_BOOK_CLIENTS.filter(c => c.agentId === selectedAgentId);
    if (clientSearch) clients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));
    if (clientFilter !== 'All') {
      const filterMap: Record<string, string> = { Active: 'active', 'Pending Renewal': 'pending', Lapsed: 'lapsed', New: 'cancelled' };
      clients = clients.filter(c => c.status === filterMap[clientFilter]);
    }
    return clients;
  }, [selectedAgentId, clientSearch, clientFilter]);
  const allAgentClients = useMemo(() => DEMO_BOOK_CLIENTS.filter(c => c.agentId === selectedAgentId), [selectedAgentId]);
  const selectedClient = useMemo(() => DEMO_BOOK_CLIENTS.find(c => c.id === selectedClientId), [selectedClientId]);

  const drawerOpen = selectedTeamId !== null;

  useEffect(() => { drawerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }, [selectedAgentId, selectedClientId]);

  function closeDrawer() { setSelectedTeamId(null); setSelectedAgentId(null); setSelectedClientId(null); setClientSearch(''); setClientFilter('All'); setAgentSearch(''); setAgentFilter('All'); }
  function goBackToTeam() { setSelectedAgentId(null); setSelectedClientId(null); setClientSearch(''); setClientFilter('All'); setAgentSearch(''); setAgentFilter('All'); }
  function goBackToAgent() { setSelectedClientId(null); }

  // ── Level 1: Team dark gradient header ──
  function TeamDrawerHeader() {
    if (!selectedTeam) return null;
    const statusLabel = selectedTeam.status === 'on-track' ? 'On Track' : selectedTeam.status === 'at-risk' ? 'At Risk' : 'Behind';
    return (
      <div style={{ background: EXECUTIVE_GRADIENT_CSS, padding: `${GRID.spacing.lg}px ${GRID.spacing.md}px ${GRID.spacing.md}px`, position: 'relative' }}>
        {/* Close button */}
        <button onClick={closeDrawer} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
          <X style={{ width: 20, height: 20, color: 'white' }} />
        </button>
        {/* Team avatar + name */}
        <div className="flex items-center gap-4" style={{ marginBottom: GRID.spacing.md }}>
          <div className="flex-shrink-0 flex items-center justify-center" style={{
            width: 56, height: 56, borderRadius: RADIUS.pill,
            backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}>
            <Users style={{ width: 26, height: 26, color: 'white' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 style={{ fontSize: TYPE.section, fontWeight: 700, color: 'white' }}>{selectedTeam.name}</h3>
              <span className="inline-flex items-center font-medium" style={{
                fontSize: TYPE.micro, padding: '2px 10px', borderRadius: RADIUS.pill,
                backgroundColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}>{statusLabel}</span>
            </div>
            <p style={{ fontSize: TYPE.meta, color: 'rgba(255,255,255,0.75)' }}>Managed by {selectedTeam.manager}</p>
          </div>
        </div>
        {/* 4-column stats */}
        <div className="grid grid-cols-4 text-center" style={{ gap: GRID.spacing.xs }}>
          {[
            { v: String(allTeamAgents.length), l: 'Agents' },
            { v: String(selectedTeam.totalClients), l: 'Clients' },
            { v: fmtCurrency(selectedTeam.totalPremium), l: 'Premium' },
            { v: `${selectedTeam.renewalRate}%`, l: 'Renewal' },
          ].map(s => (
            <div key={s.l}>
              <p style={{ fontSize: TYPE.title, fontWeight: 700, color: 'white' }}>{s.v}</p>
              <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.6)' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Level 1: Team roster content (search + filter + agent rows) ──
  function TeamRosterContent() {
    const agentFilters = ['All', 'Active', 'On Leave', 'Probation'];
    const AGENT_STATUS_CFG: Record<string, { label: string; border: string; dot: string; badge: string; badgeText: string; badgeBorder: string }> = {
      active:    { label: 'Active',    border: '#10b981', dot: '#10b981', badge: 'bg-emerald-50', badgeText: 'text-emerald-600', badgeBorder: 'border-emerald-200' },
      'on-leave': { label: 'On Leave', border: '#3b82f6', dot: '#3b82f6', badge: 'bg-blue-50',    badgeText: 'text-blue-600',    badgeBorder: 'border-blue-200' },
      probation: { label: 'Probation', border: '#f59e0b', dot: '#f59e0b', badge: 'bg-amber-50',   badgeText: 'text-amber-600',   badgeBorder: 'border-amber-200' },
    };

    return (
      <div style={{ padding: GRID.spacing.md }}>
        {/* Search */}
        <div className="relative" style={{ marginBottom: GRID.spacing.sm }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search agents..."
            value={agentSearch} onChange={e => setAgentSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-sm outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200 transition-colors"
            style={{ padding: '10px 12px 10px 36px', borderRadius: RADIUS.input, fontSize: TYPE.meta }}
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: GRID.spacing.md }}>
          {agentFilters.map(f => (
            <button key={f} onClick={() => setAgentFilter(f)}
              className="transition-all font-medium"
              style={{
                fontSize: TYPE.micro, padding: '4px 14px', borderRadius: RADIUS.pill,
                backgroundColor: agentFilter === f ? '#ea580c' : 'transparent',
                color: agentFilter === f ? 'white' : COLORS.gray[500],
                border: `1px solid ${agentFilter === f ? '#ea580c' : COLORS.gray[200]}`,
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Roster header */}
        <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
          <h4 style={{ fontSize: TYPE.body, fontWeight: 700, color: COLORS.gray[900] }}>Team Roster</h4>
          <span style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>{teamAgents.length} of {allTeamAgents.length}</span>
        </div>

        {/* Agent rows — styled like client rows */}
        <div className="space-y-2">
          {teamAgents.map(agent => {
            const cfg = AGENT_STATUS_CFG[agent.status] ?? AGENT_STATUS_CFG.active;
            return (
              <motion.div
                key={agent.id}
                whileHover={{ x: 2 }}
                transition={{ duration: MOTION.duration.hover }}
                onClick={() => setSelectedAgentId(agent.id)}
                className="flex items-center gap-3 cursor-pointer bg-white hover:bg-gray-50 transition-colors overflow-hidden"
                style={{
                  borderRadius: RADIUS.button,
                  border: `1px solid ${COLORS.gray[100]}`,
                  borderLeft: `3px solid ${cfg.border}`,
                  boxShadow: SHADOW.level1,
                }}
              >
                {/* Avatar */}
                <div className="flex-shrink-0" style={{ marginLeft: GRID.spacing.sm }}>
                  <div className="flex items-center justify-center text-white font-semibold"
                    style={{ width: 40, height: 40, borderRadius: RADIUS.pill, background: EXECUTIVE_GRADIENT_CSS, fontSize: TYPE.micro }}>
                    {getInitials(agent.name)}
                  </div>
                </div>

                {/* Name + role */}
                <div className="flex-1 min-w-0" style={{ padding: `${GRID.spacing.sm}px 0` }}>
                  <div className="flex items-center gap-2">
                    <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>{agent.name}</p>
                    <span style={{ width: 7, height: 7, borderRadius: RADIUS.pill, backgroundColor: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
                  </div>
                  <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                    {agent.role} · {agent.clientCount} clients · {fmtCurrency(agent.totalPremium)}
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center gap-1 font-medium border ${cfg.badge} ${cfg.badgeText} ${cfg.badgeBorder}`}
                  style={{ fontSize: TYPE.micro, padding: '2px 10px', borderRadius: RADIUS.pill, flexShrink: 0 }}
                >
                  {cfg.label}
                </span>

                {/* Chevron */}
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" style={{ marginRight: GRID.spacing.sm }} />
              </motion.div>
            );
          })}
          {teamAgents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-400">No agents found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Dark gradient header (matches Manager Lounge) ──
  function AgentDrawerHeader() {
    if (!selectedAgent) return null;
    return (
      <div style={{ background: EXECUTIVE_GRADIENT_CSS, padding: `${GRID.spacing.lg}px ${GRID.spacing.md}px ${GRID.spacing.md}px`, position: 'relative' }}>
        {/* Close button */}
        <button onClick={closeDrawer} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
          <X style={{ width: 20, height: 20, color: 'white' }} />
        </button>
        {/* Back to team link */}
        <button onClick={goBackToTeam} className="flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ fontSize: TYPE.caption, color: 'rgba(255,255,255,0.7)', marginBottom: GRID.spacing.sm }}>
          <ChevronLeft style={{ width: 14, height: 14 }} /> Back to {selectedTeam?.name}
        </button>
        {/* Agent avatar + name */}
        <div className="flex items-center gap-4" style={{ marginBottom: GRID.spacing.md }}>
          <div className="flex-shrink-0 flex items-center justify-center text-white font-bold" style={{
            width: 56, height: 56, borderRadius: RADIUS.pill,
            backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255,255,255,0.3)', fontSize: TYPE.title,
          }}>
            {getInitials(selectedAgent.name)}
          </div>
          <div>
            <h3 style={{ fontSize: TYPE.section, fontWeight: 700, color: 'white' }}>{selectedAgent.name}</h3>
            <p style={{ fontSize: TYPE.meta, color: 'rgba(255,255,255,0.75)' }}>Book of Business</p>
          </div>
        </div>
        {/* 4-column stats */}
        <div className="grid grid-cols-4 text-center" style={{ gap: GRID.spacing.xs }}>
          {[
            { v: String(selectedAgent.clientCount), l: 'Clients' },
            { v: fmtCurrency(selectedAgent.totalPremium), l: 'Premium' },
            { v: `${selectedAgent.renewalRate}%`, l: 'Retention' },
            { v: `${Math.round(selectedAgent.renewalRate * 0.88)}%`, l: 'Satisfaction' },
          ].map(s => (
            <div key={s.l}>
              <p style={{ fontSize: TYPE.title, fontWeight: 700, color: 'white' }}>{s.v}</p>
              <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.6)' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Level 2: Agent's client files ──
  function AgentClientFiles() {
    const filters = ['All', 'Active', 'Pending Renewal', 'Lapsed', 'New'];
    return (
      <div style={{ padding: GRID.spacing.md }}>
        {/* Search */}
        <div className="relative" style={{ marginBottom: GRID.spacing.sm }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search clients..."
            value={clientSearch} onChange={e => setClientSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-sm outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200 transition-colors"
            style={{ padding: '10px 12px 10px 36px', borderRadius: RADIUS.input, fontSize: TYPE.meta }}
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: GRID.spacing.md }}>
          {filters.map(f => (
            <button key={f} onClick={() => setClientFilter(f)}
              className="transition-all font-medium"
              style={{
                fontSize: TYPE.micro, padding: '4px 14px', borderRadius: RADIUS.pill,
                backgroundColor: clientFilter === f ? '#ea580c' : 'transparent',
                color: clientFilter === f ? 'white' : COLORS.gray[500],
                border: `1px solid ${clientFilter === f ? '#ea580c' : COLORS.gray[200]}`,
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Client files header */}
        <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
          <h4 style={{ fontSize: TYPE.body, fontWeight: 700, color: COLORS.gray[900] }}>Client Files</h4>
          <span style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>{agentClients.length} of {allAgentClients.length}</span>
        </div>

        {/* Client rows */}
        <div className="space-y-2">
          {agentClients.map(client => {
            const cfg = CLIENT_STATUS_CFG[client.status] ?? CLIENT_STATUS_CFG.active;
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={client.id}
                whileHover={{ x: 2 }}
                transition={{ duration: MOTION.duration.hover }}
                onClick={() => setSelectedClientId(client.id)}
                className="flex items-center gap-3 cursor-pointer bg-white hover:bg-gray-50 transition-colors overflow-hidden"
                style={{
                  borderRadius: RADIUS.button,
                  border: `1px solid ${COLORS.gray[100]}`,
                  borderLeft: `3px solid ${cfg.border}`,
                  boxShadow: SHADOW.level1,
                }}
              >
                {/* Dot */}
                <div className="flex-shrink-0" style={{ marginLeft: GRID.spacing.sm }}>
                  <span style={{ width: 8, height: 8, borderRadius: RADIUS.pill, backgroundColor: cfg.dot, display: 'block' }} />
                </div>

                {/* Name + policy info */}
                <div className="flex-1 min-w-0" style={{ padding: `${GRID.spacing.sm}px 0` }}>
                  <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>{client.name}</p>
                  <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                    {client.policyType} · {fmtCurrency(client.monthlyPremium)}/mo
                  </p>
                </div>

                {/* Status badge (outlined pill with icon) */}
                <span
                  className={`inline-flex items-center gap-1 font-medium border ${cfg.badge} ${cfg.badgeText} ${cfg.badgeBorder}`}
                  style={{ fontSize: TYPE.micro, padding: '2px 10px', borderRadius: RADIUS.pill, flexShrink: 0 }}
                >
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>

                {/* Chevron */}
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" style={{ marginRight: GRID.spacing.sm }} />
              </motion.div>
            );
          })}
          {agentClients.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-400">No clients found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Level 3: Client detail ──
  function ClientDetailContent() {
    if (!selectedClient) return null;
    const cfg = CLIENT_STATUS_CFG[selectedClient.status] ?? CLIENT_STATUS_CFG.active;
    const StatusIcon = cfg.icon;
    const cityState = selectedClient.address.split(',').slice(-2).join(',').trim();

    return (
      <div style={{ padding: GRID.spacing.md }}>
        {/* Back link */}
        <button onClick={goBackToAgent} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.md }}>
          <ChevronLeft className="w-4 h-4" /> Back to files
        </button>

        {/* Client header */}
        <div className="flex items-center gap-3" style={{ marginBottom: GRID.spacing.lg }}>
          <div className="flex-shrink-0 flex items-center justify-center text-white font-bold" style={{
            width: 52, height: 52, borderRadius: RADIUS.pill,
            background: EXECUTIVE_GRADIENT_CSS, fontSize: TYPE.body,
          }}>
            {getInitials(selectedClient.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.gray[900] }}>{selectedClient.name}</h3>
            <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>{cityState}</p>
          </div>
          <span className={`inline-flex items-center gap-1 font-medium border ${cfg.badge} ${cfg.badgeText} ${cfg.badgeBorder}`}
            style={{ fontSize: TYPE.micro, padding: '3px 12px', borderRadius: RADIUS.pill, flexShrink: 0 }}>
            <StatusIcon className="w-3.5 h-3.5" />
            {cfg.label}
          </span>
        </div>

        {/* Personal Information card */}
        <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
          <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Personal Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <InfoCell icon={<Cake className="w-4 h-4" />} label="Date of Birth" value={selectedClient.dob} />
            <InfoCell icon={<Phone className="w-4 h-4" />} label="Phone" value={selectedClient.phone} />
            <InfoCell icon={<Mail className="w-4 h-4" />} label="Email" value={selectedClient.email} />
            <InfoCell icon={<MapPin className="w-4 h-4" />} label="Address" value={selectedClient.address} />
          </div>
        </div>

        {/* Policy Details card */}
        <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
          <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
            <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900] }}>Policy Details</h4>
            <span style={{ fontSize: TYPE.title, fontWeight: 700, color: '#ea580c' }}>{fmtCurrency(selectedClient.annualPremium)}<span style={{ fontSize: TYPE.caption, fontWeight: 400, color: COLORS.gray[500] }}>/yr</span></span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PolicyCell label="Policy Type" value={selectedClient.policyType} highlight />
            <PolicyCell label="Carrier" value="Heritage Life" />
            <PolicyCell label="Policy Number" value={selectedClient.policyNumber} />
            <PolicyCell label="Coverage Amount" value={fmtCurrency(selectedClient.coverageAmount)} />
            <PolicyCell label="Monthly Premium" value={`${fmtCurrency(selectedClient.monthlyPremium)}/mo`} />
            <PolicyCell label="Annual Premium" value={`${fmtCurrency(selectedClient.annualPremium)}/yr`} />
            <PolicyCell label="Effective Date" value={selectedClient.effectiveDate} />
            <PolicyCell label="Renewal Date" value={selectedClient.renewalDate} />
            <PolicyCell label="Risk Class" value={selectedClient.riskClass.charAt(0).toUpperCase() + selectedClient.riskClass.slice(1)} />
            <PolicyCell label="Status" value={cfg.label} highlight={selectedClient.status === 'active'} />
          </div>
        </div>

        {/* Beneficiary card */}
        <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
          <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Beneficiary</h4>
          <div className="grid grid-cols-2 gap-4">
            <PolicyCell label="Name" value={selectedClient.beneficiaryName} />
            <PolicyCell label="Relationship" value={selectedClient.beneficiaryRelation} />
          </div>
        </div>

        {/* Timeline card */}
        <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
          <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Timeline</h4>
          <div className="grid grid-cols-2 gap-4">
            <InfoCell icon={<Clock className="w-4 h-4" />} label="Last Contact" value={selectedClient.lastContactDate} />
            <InfoCell icon={<CheckCircle className="w-4 h-4" />} label="Policy Effective" value={selectedClient.effectiveDate} />
            <InfoCell icon={<RefreshCw className="w-4 h-4" />} label="Next Renewal" value={selectedClient.renewalDate} />
            <InfoCell icon={<Cake className="w-4 h-4" />} label="Date of Birth" value={selectedClient.dob} />
          </div>
        </div>

        {/* Agent Notes card */}
        {selectedClient.agentNotes && (
          <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md }}>
            <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.xs }}>Agent Notes</h4>
            <p style={{ fontSize: TYPE.caption, color: COLORS.gray[600], lineHeight: 1.5 }}>{selectedClient.agentNotes}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Render ──
  return (
    <ExecutiveLoungeLayout>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <ExecutivePageHero icon={BookOpen} title="Agency Book of Business" subtitle="View team books, agent portfolios, and client policies across the agency" />
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard icon={Users} label="Total Clients" value="297" periodLabel="across all teams" />
            <ExecutiveStatCard icon={FileText} label="Active Policies" value="401" periodLabel="agency-wide" />
            <ExecutiveStatCard icon={DollarSign} label="Total Premium" value="$10.46M" periodLabel="annual book value" />
            <ExecutiveStatCard icon={RefreshCw} label="Renewal Rate" value="90.2%" periodLabel="weighted average" />
          </ExecutiveStatCardGrid>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {DEMO_BOOK_TEAMS.map(team => (
              <TeamCard key={team.id} team={team} onClick={() => setSelectedTeamId(team.id)} />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
              onClick={closeDrawer}
            />
            {/* Panel */}
            <motion.div
              ref={drawerRef}
              initial={{ x: 560 }}
              animate={{ x: 0 }}
              exit={{ x: 560 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto overflow-x-hidden"
              style={{
                width: 560,
                backgroundColor: '#fafafa',
                border: 'none',
                boxShadow: '-12px 0 48px rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* Animated level transitions */}
              <AnimatePresence mode="wait">
                {/* Level 1: Team roster */}
                {selectedTeamId && !selectedAgentId && (
                  <motion.div
                    key="team-roster"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <TeamDrawerHeader />
                    <TeamRosterContent />
                  </motion.div>
                )}

                {/* Level 2: Agent book with dark header + client files */}
                {selectedAgentId && !selectedClientId && (
                  <motion.div
                    key="agent-book"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <AgentDrawerHeader />
                    <AgentClientFiles />
                  </motion.div>
                )}

                {/* Level 3: Client detail with dark header + detail cards */}
                {selectedClientId && (
                  <motion.div
                    key="client-detail"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <AgentDrawerHeader />
                    <ClientDetailContent />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ExecutiveLoungeLayout>
  );
}

// ─── INFO CELL (icon + label + value, for Personal Info) ──
function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{label}</p>
        <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{value}</p>
      </div>
    </div>
  );
}

// ─── POLICY CELL (label + value, for Policy Details grid) ──
function PolicyCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{label}</p>
      <p className="font-medium" style={{ fontSize: TYPE.meta, color: highlight ? '#ea580c' : COLORS.gray[900] }}>{value}</p>
    </div>
  );
}

export default ExecutiveBookOfBusiness;
