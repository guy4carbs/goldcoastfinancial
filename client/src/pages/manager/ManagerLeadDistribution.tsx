/**
 * Manager Lead Distribution
 * Receive leads from executives, distribute evenly to agents
 * Heritage Design System — Emerald theme
 * Mirrors Agent Lounge patterns (Sheet drawer, glass cards)
 *
 * Wired to real API: GET /api/lead-distribution/pool, POST /api/lead-distribution/distribute, etc.
 * Falls back to demo data when API returns no results (for development/demo).
 */

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero } from './primitives';
import {
  DEMO_LEAD_POOL,
  DEMO_DISTRIBUTION_HISTORY,
  DEMO_TEAM_MEMBERS,
  type PoolLead,
} from './managerConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Send,
  Inbox,
  AlertTriangle,
  CheckCircle,
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Target,
  Sparkles,
  Flame,
  TrendingUp,
  History,
  UserPlus,
  X,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { GRID, TYPE, COLORS, RADIUS, SHADOW, fadeInUp, staggerContainer } from '@/lib/heritageDesignSystem';
import {
  useLeadPool,
  useDistributionStats,
  useDistributionHistory,
  useDistributionRecipients,
  useDistributeLeads,
  useAssignSingleLead,
} from '@/hooks/useLeadDistribution';

/* ── Glass card style ─────────────────────────────────── */

const glassCard = {
  borderRadius: RADIUS.card,
  boxShadow: SHADOW.card,
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
};

/* ── Priority config ──────────────────────────────────── */

const priorityConfig = {
  urgent: { label: 'Urgent', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  high: { label: 'High', color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
  medium: { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
  low: { label: 'Low', color: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50' },
};

const sourceLabels: Record<string, string> = {
  executive_referral: 'Executive Referral',
  marketing_campaign: 'Marketing',
  website: 'Website',
  partner_referral: 'Partner Referral',
  quote_form: 'Quote Form',
  contact_form: 'Contact Form',
  phone: 'Phone',
  referral: 'Referral',
  social_media: 'Social Media',
  other: 'Other',
};

const scoreTierConfig: Record<string, { label: string; icon: typeof Flame; color: string }> = {
  on_fire: { label: 'On Fire', icon: Flame, color: 'text-red-500' },
  hot: { label: 'Hot', icon: TrendingUp, color: 'text-orange-500' },
  warm: { label: 'Warm', icon: Sparkles, color: 'text-amber-500' },
  cold: { label: 'Cold', icon: Target, color: 'text-blue-400' },
};

/* ── Helper to convert API lead to display format ───── */

function apiLeadToPoolLead(lead: any): PoolLead {
  return {
    id: lead.id,
    name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
    email: lead.email || '',
    phone: lead.phone || '',
    city: lead.city || '',
    state: lead.state || '',
    source: lead.source || 'other',
    priority: lead.priority || 'medium',
    product: lead.coverageType || 'Life',
    leadScore: lead.leadScore || 0,
    scoreTier: lead.scoreTier || 'cold',
    receivedFrom: lead.distributedByUser || 'Executive',
    receivedAt: lead.distributedAt
      ? new Date(lead.distributedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : lead.createdAt
        ? new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'Today',
    notes: lead.notes || '',
  };
}

/* ── Component ──────────────────────────────────────────── */

export function ManagerLeadDistribution() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<PoolLead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const LEADS_PER_PAGE = 50;

  // ── API hooks ──
  const poolQuery = useLeadPool({
    page: currentPage,
    limit: LEADS_PER_PAGE,
    search: searchQuery || undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    source: sourceFilter !== 'all' ? sourceFilter : undefined,
  });

  const statsQuery = useDistributionStats();
  const historyQuery = useDistributionHistory({ limit: 5 });
  const recipientsQuery = useDistributionRecipients();
  const distributeMutation = useDistributeLeads();
  const assignMutation = useAssignSingleLead();

  // ── Determine data source (API vs demo fallback) ──
  const isApiConnected = poolQuery.isSuccess && !poolQuery.isError;
  const apiLeads = poolQuery.data?.leads || [];
  const totalLeads = poolQuery.data?.total || 0;
  const totalPages = poolQuery.data?.totalPages || 1;

  // Convert API leads to display format
  const pool: PoolLead[] = useMemo(() => {
    if (isApiConnected && apiLeads.length > 0) {
      return apiLeads.map(apiLeadToPoolLead);
    }
    // Demo fallback
    let result = [...DEMO_LEAD_POOL];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.product.toLowerCase().includes(q)
      );
    }
    if (sourceFilter !== 'all') {
      result = result.filter((l) => l.source === sourceFilter);
    }
    if (priorityFilter !== 'all') {
      result = result.filter((l) => l.priority === priorityFilter);
    }
    return result;
  }, [isApiConnected, apiLeads, searchQuery, sourceFilter, priorityFilter]);

  // ── Stats ──
  const stats = useMemo(() => {
    if (statsQuery.data) {
      return {
        total: statsQuery.data.poolCount,
        highPriority: statsQuery.data.highPriorityCount,
        distributedToday: statsQuery.data.distributedToday,
        agentsAvailable: statsQuery.data.recipientCount,
      };
    }
    // Demo fallback
    return {
      total: pool.length,
      highPriority: pool.filter((l) => l.priority === 'urgent' || l.priority === 'high').length,
      distributedToday: 0,
      agentsAvailable: DEMO_TEAM_MEMBERS.filter((m) => m.status === 'active').length,
    };
  }, [statsQuery.data, pool]);

  // ── Distribution history ──
  const historyRecords = useMemo(() => {
    if (historyQuery.data?.records && historyQuery.data.records.length > 0) {
      return historyQuery.data.records.map((r) => ({
        id: r.id,
        date: new Date(r.createdAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
          hour: 'numeric', minute: '2-digit', hour12: true,
        }),
        leadsDistributed: r.totalLeads,
        agentsCount: r.recipientCount,
        perAgent: r.remainderLeads
          ? `${r.leadsPerRecipient}-${r.leadsPerRecipient + 1} each`
          : `${r.leadsPerRecipient} each`,
      }));
    }
    // Demo fallback
    return [...DEMO_DISTRIBUTION_HISTORY];
  }, [historyQuery.data]);

  // ── Recipients (agents under this manager) ──
  const recipients = recipientsQuery.data || [];

  /* ── Distribution algorithm ─────────────────────────── */
  const handleDistributeEvenly = useCallback(() => {
    if (isApiConnected) {
      distributeMutation.mutate({ all: true }, {
        onSuccess: (data) => {
          setDrawerOpen(false);
          setSelectedLead(null);
          toast.success(`${data.distributed} leads distributed to ${data.recipientCount} agents (${data.perRecipient} each)`, {
            description: 'Agents have been notified in their Lead Inbox.',
          });
        },
        onError: (error) => {
          toast.error('Failed to distribute leads', {
            description: error.message,
          });
        },
      });
    } else {
      // Demo fallback
      const agents = DEMO_TEAM_MEMBERS.filter((m) => m.status === 'active');
      if (pool.length === 0) {
        toast.error('No leads to distribute');
        return;
      }
      if (agents.length === 0) {
        toast.error('No agents available');
        return;
      }
      const perAgent = Math.floor(pool.length / agents.length);
      const remainder = pool.length % agents.length;
      const maxPerAgent = perAgent + (remainder > 0 ? 1 : 0);
      const label = perAgent === maxPerAgent ? `${perAgent} each` : `${perAgent}-${maxPerAgent} each`;
      toast.success(`${pool.length} leads distributed to ${agents.length} agents (${label})`, {
        description: 'Agents have been notified in their Lead Inbox.',
      });
    }
  }, [isApiConnected, pool, distributeMutation]);

  /* ── Single lead assign ─────────────────────────────── */
  const handleAssignLead = useCallback((leadId: string, recipientId: string, recipientName: string) => {
    if (isApiConnected) {
      assignMutation.mutate({ leadId, recipientId }, {
        onSuccess: () => {
          setDrawerOpen(false);
          setSelectedLead(null);
          toast.success(`Lead assigned to ${recipientName}`);
        },
        onError: (error) => {
          toast.error('Failed to assign lead', { description: error.message });
        },
      });
    } else {
      setDrawerOpen(false);
      setSelectedLead(null);
      toast.success(`Lead assigned to ${recipientName}`);
    }
  }, [isApiConnected, assignMutation]);

  /* ── Remove lead from pool ──────────────────────────── */
  const handleRemoveLead = useCallback(() => {
    setDrawerOpen(false);
    setSelectedLead(null);
    toast.info('Lead removed from pool');
  }, []);

  /* ── Stat card data ─────────────────────────────────── */
  const statCards = [
    { icon: Inbox, label: 'In Pool', value: stats.total, color: 'from-emerald-500 to-teal-600' },
    { icon: AlertTriangle, label: 'High Priority', value: stats.highPriority, color: 'from-orange-500 to-red-500' },
    { icon: CheckCircle, label: 'Distributed Today', value: stats.distributedToday, color: 'from-emerald-500 to-emerald-600' },
    { icon: Users, label: 'Agents Available', value: stats.agentsAvailable, color: 'from-teal-500 to-cyan-600' },
  ];

  const isDistributing = distributeMutation.isPending;

  return (
    <ManagerLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* ── Hero ──────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={Send}
            title="Lead Distribution"
            subtitle="Distribute incoming leads to your team"
          >
            <Button
              onClick={handleDistributeEvenly}
              disabled={stats.total === 0 || isDistributing}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur"
              style={{ borderRadius: RADIUS.button }}
            >
              {isDistributing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Distribute Evenly ({stats.total})
            </Button>
          </ManagerPageHero>
        </motion.div>

        {/* ── Stat Cards ────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <Card key={stat.label} className="border-0" style={glassCard}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${stat.color}`}
                        style={{ borderRadius: RADIUS.button }}
                      >
                        <StatIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* ── Filters ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
            <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]" style={{ borderRadius: RADIUS.input }}>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent style={{ borderRadius: RADIUS.input }}>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="executive_referral">Executive Referral</SelectItem>
                <SelectItem value="marketing_campaign">Marketing</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="partner_referral">Partner Referral</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[160px]" style={{ borderRadius: RADIUS.input }}>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent style={{ borderRadius: RADIUS.input }}>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* ── Lead Pool Grid ────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          {poolQuery.isLoading ? (
            <Card className="border-0" style={glassCard}>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-emerald-500" />
                <p className="text-sm text-gray-500">Loading leads...</p>
              </CardContent>
            </Card>
          ) : pool.length === 0 ? (
            <Card className="border-0" style={glassCard}>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                  <Inbox className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {searchQuery || sourceFilter !== 'all' || priorityFilter !== 'all'
                    ? 'No leads match filters'
                    : 'All leads distributed'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery || sourceFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'New leads from executives will appear here.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 overflow-hidden" style={glassCard}>
              <div className="divide-y divide-gray-100">
                {pool.map((lead) => {
                  const pConfig = priorityConfig[lead.priority as keyof typeof priorityConfig] || priorityConfig.medium;
                  const tierConfig = scoreTierConfig[lead.scoreTier] || scoreTierConfig.cold;
                  const TierIcon = tierConfig.icon;
                  return (
                    <motion.div
                      key={lead.id}
                      className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-gray-50/80 transition-colors"
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => { setSelectedLead(lead); setDrawerOpen(true); }}
                    >
                      {/* Priority dot */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${pConfig.color}`} />

                      {/* Initials */}
                      <div
                        className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold text-xs"
                        style={{ borderRadius: 8 }}
                      >
                        {lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>

                      {/* Name + location */}
                      <div className="min-w-[140px]">
                        <p className="font-medium text-sm text-gray-900 truncate">{lead.name}</p>
                        <p className="text-xs text-gray-400">{lead.city}{lead.city && lead.state ? ', ' : ''}{lead.state}</p>
                      </div>

                      {/* Product */}
                      <Badge variant="outline" className="text-xs font-normal hidden sm:inline-flex flex-shrink-0" style={{ borderRadius: RADIUS.pill }}>
                        {lead.product}
                      </Badge>

                      {/* Source */}
                      <span className="text-xs text-gray-500 hidden lg:block flex-shrink-0 min-w-[100px]">
                        {sourceLabels[lead.source] || lead.source}
                      </span>

                      {/* Score */}
                      <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
                        <TierIcon className={`w-3.5 h-3.5 ${tierConfig.color}`} />
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                            style={{ width: `${lead.leadScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 w-6">{lead.leadScore}</span>
                      </div>

                      {/* Time */}
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-auto md:ml-0">
                        {lead.receivedAt}
                      </span>

                      {/* Chevron */}
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {(isApiConnected ? totalPages > 1 : false) && (
                <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50/50">
                  <p className="text-xs text-gray-500">
                    Showing {(currentPage - 1) * LEADS_PER_PAGE + 1}–{Math.min(currentPage * LEADS_PER_PAGE, totalLeads)} of {totalLeads}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600">{currentPage} / {totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </motion.div>

        {/* ── Distribution History ───────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <History className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <span className="text-gray-900">Distribution History</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Recent lead distributions</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-gray-100">
                {historyRecords.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400">No distributions yet</p>
                ) : (
                  historyRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {record.leadsDistributed} leads → {record.agentsCount} agents ({record.perAgent})
                        </p>
                        <p className="text-xs text-gray-500">{record.date}</p>
                      </div>
                      <Badge
                        className="bg-emerald-100 text-emerald-700 border-0"
                        style={{ borderRadius: RADIUS.pill }}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Lead Detail Drawer ─────────────────────────── */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent className="w-full sm:max-w-[560px] p-0 flex flex-col border-0" style={{ backgroundColor: '#fafafa' }}>
            {selectedLead && (
              <>
                {/* Dark emerald gradient header */}
                <div className="relative" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 40%, #059669 100%)', padding: `${GRID.spacing.lg}px ${GRID.spacing.md}px ${GRID.spacing.md}px` }}>
                  <button onClick={() => setDrawerOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                    <X style={{ width: 20, height: 20, color: 'white' }} />
                  </button>
                  <div className="flex items-center gap-4" style={{ marginBottom: GRID.spacing.md }}>
                    <div className="flex-shrink-0 flex items-center justify-center text-white font-bold" style={{
                      width: 56, height: 56, borderRadius: RADIUS.pill,
                      backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                      border: '2px solid rgba(255,255,255,0.3)', fontSize: TYPE.body,
                    }}>
                      {selectedLead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <SheetTitle style={{ fontSize: TYPE.section, fontWeight: 700, color: 'white' }}>{selectedLead.name}</SheetTitle>
                      <SheetDescription style={{ fontSize: TYPE.meta, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
                        {selectedLead.city}{selectedLead.city && selectedLead.state ? ', ' : ''}{selectedLead.state}
                      </SheetDescription>
                    </div>
                  </div>
                  {/* Stat grid */}
                  <div className="grid grid-cols-4 text-center" style={{ gap: GRID.spacing.xs }}>
                    {[
                      { v: selectedLead.product, l: 'Product' },
                      { v: String(selectedLead.leadScore), l: 'Lead Score' },
                      { v: (scoreTierConfig[selectedLead.scoreTier] || scoreTierConfig.cold).label, l: 'Score Tier' },
                      { v: (priorityConfig[selectedLead.priority as keyof typeof priorityConfig] || priorityConfig.medium).label, l: 'Priority' },
                    ].map(s => (
                      <div key={s.l}>
                        <p style={{ fontSize: TYPE.meta, fontWeight: 700, color: 'white' }}>{s.v}</p>
                        <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.6)' }}>{s.l}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                  <div style={{ padding: GRID.spacing.md }}>
                    {/* Contact Info card */}
                    <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
                      <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Contact Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5 flex-shrink-0"><Phone className="w-4 h-4" /></span>
                          <div className="min-w-0">
                            <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Phone</p>
                            <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{selectedLead.phone || 'No phone'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5 flex-shrink-0"><Mail className="w-4 h-4" /></span>
                          <div className="min-w-0">
                            <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Email</p>
                            <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{selectedLead.email}</p>
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: GRID.spacing.sm }}>
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5 flex-shrink-0"><MapPin className="w-4 h-4" /></span>
                          <div className="min-w-0">
                            <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Address</p>
                            <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{selectedLead.city}{selectedLead.city && selectedLead.state ? ', ' : ''}{selectedLead.state}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lead Details card */}
                    <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
                        <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900] }}>Lead Details</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Source</p>
                          <p className="font-medium" style={{ fontSize: TYPE.meta, color: COLORS.gray[900] }}>{sourceLabels[selectedLead.source] || selectedLead.source}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Lead Score</p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium" style={{ fontSize: TYPE.meta, color: COLORS.gray[900] }}>{selectedLead.leadScore}</span>
                            <div className="flex-1" style={{ height: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.gray[200], maxWidth: 80 }}>
                              <div style={{
                                width: `${selectedLead.leadScore}%`, height: '100%', borderRadius: RADIUS.pill,
                                background: selectedLead.leadScore >= 80 ? '#10b981' : selectedLead.leadScore >= 50 ? '#f59e0b' : '#ef4444',
                              }} />
                            </div>
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Product</p>
                          <p className="font-medium" style={{ fontSize: TYPE.meta, color: '#059669' }}>{selectedLead.product}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Score Tier</p>
                          <p className="font-medium" style={{ fontSize: TYPE.meta, color: COLORS.gray[900] }}>{(scoreTierConfig[selectedLead.scoreTier] || scoreTierConfig.cold).label}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Priority</p>
                          <p className="font-medium" style={{ fontSize: TYPE.meta, color: selectedLead.priority === 'urgent' || selectedLead.priority === 'high' ? '#059669' : COLORS.gray[900] }}>{(priorityConfig[selectedLead.priority as keyof typeof priorityConfig] || priorityConfig.medium).label}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Received</p>
                          <p className="font-medium" style={{ fontSize: TYPE.meta, color: COLORS.gray[900] }}>{selectedLead.receivedAt}</p>
                        </div>
                      </div>
                    </div>

                    {/* Referred By card */}
                    <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
                      <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Referred By</h4>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50">
                        <div className="flex-shrink-0 flex items-center justify-center text-white font-bold text-xs" style={{
                          width: 40, height: 40, borderRadius: 9999,
                          background: 'linear-gradient(135deg, #047857, #059669)',
                        }}>
                          {selectedLead.receivedFrom.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{selectedLead.receivedFrom}</p>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Executive Referral</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes card */}
                    {selectedLead.notes && (
                      <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
                        <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Notes</h4>
                        <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500], lineHeight: 1.6 }}>{selectedLead.notes}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="border-t p-4 bg-white/80 flex gap-2">
                  {recipients.length > 0 ? (
                    <Select onValueChange={(recipientId) => {
                      const recipient = recipients.find((r) => r.id === recipientId);
                      const name = recipient ? `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() : 'Agent';
                      handleAssignLead(selectedLead.id, recipientId, name);
                    }}>
                      <SelectTrigger className="flex-1" style={{ borderRadius: RADIUS.button }}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Assign to Agent" />
                      </SelectTrigger>
                      <SelectContent style={{ borderRadius: RADIUS.input }}>
                        {recipients.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.firstName || ''} {agent.lastName || ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select onValueChange={(agentName) => handleAssignLead(selectedLead.id, agentName, agentName)}>
                      <SelectTrigger className="flex-1" style={{ borderRadius: RADIUS.button }}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Assign to Agent" />
                      </SelectTrigger>
                      <SelectContent style={{ borderRadius: RADIUS.input }}>
                        {DEMO_TEAM_MEMBERS.filter((m) => m.status === 'active').map((agent) => (
                          <SelectItem key={agent.id} value={agent.name}>
                            {agent.avatar} {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleRemoveLead}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerLeadDistribution;
