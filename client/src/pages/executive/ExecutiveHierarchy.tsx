/**
 * Executive Hierarchy — Full organization tree powered by React Flow
 * Heritage Design System — Orange Theme
 * Includes unplaced agent placement UI + stat cards
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, Layers, DollarSign, Users, Crown,
  AlertTriangle, UserPlus, ChevronDown, Check, Loader2,
  ClipboardCheck, X, Pencil, Save, Search, ChevronLeft, ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from './primitives/ExecutiveStatCard';
import {
  GRID, TYPE, RADIUS, SHADOW, COLORS, GLASS, MOTION, LAYOUT,
  fadeInUp, staggerContainer,
} from '@/lib/heritageDesignSystem';
import { apiRequest } from '@/lib/queryClient';
import {
  HierarchyFlow,
  buildFlowFromFlatTree,
  getLayoutedElements,
  ORANGE_THEME,
} from '@/components/hierarchy';
import type { HierarchyMember } from '@/components/hierarchy';

// =============================================================================
// TYPES
// =============================================================================

const ORANGE = {
  50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
  400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
};

interface MyPosition {
  id: string; name: string; email: string; phone: string | null;
  role: string; level: number; title: string; contractLevel: number | null;
  ytdCommission: number; policiesSold: number; teamSize: number;
  conversionRate: number; avatarUrl: string | null;
}

interface TreeNode {
  id: string; name: string; contractLevel: number | null;
  children: TreeNode[];
}

interface UnplacedAgent {
  id: string; firstName: string; lastName: string; email: string;
  role: string; createdAt: string; preferredUplineId: string | null;
  referringAgentName: string | null; approvedAt: string | null;
}

interface AvailableUpline {
  id: string; firstName: string; lastName: string; title: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function buildTree(flatMembers: HierarchyMember[], rootId: string): TreeNode[] {
  const byParent = new Map<string, HierarchyMember[]>();
  for (const m of flatMembers) {
    if (m.directUplineId) {
      if (!byParent.has(m.directUplineId)) byParent.set(m.directUplineId, []);
      byParent.get(m.directUplineId)!.push(m);
    }
  }
  function recurse(parentId: string): TreeNode[] {
    return (byParent.get(parentId) || []).map((c) => ({
      id: c.id, name: c.name, contractLevel: c.contractLevel, children: recurse(c.id),
    }));
  }
  return recurse(rootId);
}

function countAll(nodes: TreeNode[]): number {
  return nodes.reduce((s, n) => s + 1 + countAll(n.children), 0);
}

function maxDepth(nodes: TreeNode[], d = 0): number {
  if (nodes.length === 0) return d;
  return Math.max(...nodes.map((n) => maxDepth(n.children, d + 1)));
}

// =============================================================================
// UNPLACED AGENT CARD
// =============================================================================

function UnplacedAgentCard({
  agent, uplines, onPlaced,
}: {
  agent: UnplacedAgent; uplines: AvailableUpline[]; onPlaced: () => void;
}) {
  const [selectedUpline, setSelectedUpline] = useState(agent.preferredUplineId || '');
  const [contractLevelInput, setContractLevelInput] = useState('70');
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const handlePlace = async () => {
    if (!selectedUpline) return;
    setPlacing(true);
    try {
      await apiRequest('POST', '/api/hierarchy/setup', {
        agentUserId: agent.id,
        directUplineId: selectedUpline,
        hierarchyLevel: 6,
        hierarchyTitle: 'New Agent',
        contractLevel: parseFloat(contractLevelInput) || null,
      });
      setPlaced(true);
      setTimeout(onPlaced, 600);
    } catch {
      setPlacing(false);
    }
  };

  if (placed) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200"
      >
        <Check className="text-emerald-600" size={16} />
        <span className="text-emerald-700 font-medium text-sm">
          {agent.firstName} {agent.lastName} placed
        </span>
      </motion.div>
    );
  }

  return (
    <div
      className="flex items-center gap-4 p-4 border"
      style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[200], backgroundColor: 'rgba(255,255,255,0.7)' }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center font-bold text-sm"
        style={{ width: 40, height: 40, borderRadius: RADIUS.button, backgroundColor: COLORS.gray[100], color: COLORS.gray[600] }}
      >
        {(agent.firstName?.[0] || '') + (agent.lastName?.[0] || '')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">
          {agent.firstName} {agent.lastName}
        </p>
        <p className="text-gray-500 text-xs truncate">{agent.email}</p>
        {agent.referringAgentName && (
          <p className="text-gray-400 text-xs mt-0.5">Referred by: {agent.referringAgentName}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={selectedUpline}
            onChange={(e) => setSelectedUpline(e.target.value)}
            className="appearance-none text-sm border border-gray-200 bg-white pr-8 pl-3 py-2 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            style={{ minWidth: 200 }}
          >
            <option value="">Select upline...</option>
            {uplines.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName} — {u.title || 'Agent'}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={14} />
        </div>
        <input
          type="number"
          value={contractLevelInput}
          onChange={(e) => setContractLevelInput(e.target.value)}
          placeholder="%"
          className="text-sm border border-gray-200 bg-white px-2 py-2 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-center"
          style={{ width: 60 }}
          min={0} max={200} step={5}
        />
        <Button
          size="sm"
          disabled={!selectedUpline || placing}
          onClick={handlePlace}
          className="rounded-xl text-xs gap-1.5"
          style={{
            backgroundColor: selectedUpline ? ORANGE[600] : COLORS.gray[200],
            color: selectedUpline ? '#fff' : COLORS.gray[500],
          }}
        >
          {placing ? <Loader2 className="animate-spin" size={14} /> : <UserPlus size={14} />}
          Place
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ExecutiveHierarchy() {
  const queryClient = useQueryClient();

  // API data
  const { data: positionData, isLoading: posLoading } = useQuery<{ success: boolean; data: MyPosition }>({
    queryKey: ['/api/hierarchy/my-position'],
  });
  const { data: treeData, isLoading: treeLoading } = useQuery<{ success: boolean; data: HierarchyMember[] }>({
    queryKey: ['/api/hierarchy/team-tree'],
  });
  const { data: unplacedData, refetch: refetchUnplaced } = useQuery<{ success: boolean; data: UnplacedAgent[] }>({
    queryKey: ['/api/hierarchy/unplaced'],
    staleTime: 1000 * 60 * 2,
  });
  const { data: uplinesData } = useQuery<{ agents: AvailableUpline[] }>({
    queryKey: ['/api/agents/available-uplines'],
    staleTime: 1000 * 60 * 5,
  });

  // Pending requests from managers
  const { data: pendingExecData } = useQuery<any[]>({
    queryKey: ['/api/hierarchy-requests/pending-executive'],
  });
  const pendingExecRequests = Array.isArray(pendingExecData) ? pendingExecData : [];

  const [execReviewingId, setExecReviewingId] = useState<string | null>(null);
  const [execAction, setExecAction] = useState<'approved' | 'rejected' | null>(null);
  const [execNotes, setExecNotes] = useState('');
  const [execFinalLevel, setExecFinalLevel] = useState('');

  const execReviewMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: any }) => {
      const res = await apiRequest('PUT', `/api/hierarchy-requests/${id}/executive-review`, body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy-requests/pending-executive'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/team-tree'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/unplaced'] });
      setExecReviewingId(null);
      setExecAction(null);
      setExecNotes('');
      setExecFinalLevel('');
    },
  });

  // Direct edit agent state
  const [editingAgent, setEditingAgent] = useState<HierarchyMember | null>(null);
  const [editUpline, setEditUpline] = useState('');
  const [editContractLevel, setEditContractLevel] = useState('');
  const [editTitle, setEditTitle] = useState('');

  // Search & pagination for Manage Agents
  const [agentSearch, setAgentSearch] = useState('');
  const [agentPage, setAgentPage] = useState(1);
  const AGENTS_PER_PAGE = 12;

  const directEditMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await apiRequest('POST', '/api/hierarchy/setup', body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/team-tree'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/my-position'] });
      setEditingAgent(null);
      setEditUpline('');
      setEditContractLevel('');
      setEditTitle('');
    },
  });

  const myPos = positionData?.data;
  const flatMembers = treeData?.data || [];
  const unplacedAgents = unplacedData?.data || [];
  const availableUplines = uplinesData?.agents || [];
  const isLoading = posLoading || treeLoading;

  // Tree stats
  const tree = myPos ? buildTree(flatMembers, myPos.id) : [];
  const totalDownline = countAll(tree);
  const depth = maxDepth(tree);

  const handleAgentPlaced = () => {
    refetchUnplaced();
    queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/team-tree'] });
    queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/my-position'] });
  };

  // React Flow layout
  const { nodes, edges } = useMemo(() => {
    if (!myPos) return { nodes: [], edges: [] };
    const rootMember: HierarchyMember = {
      id: myPos.id, name: myPos.name, email: myPos.email, phone: myPos.phone,
      role: myPos.role, level: myPos.level, title: myPos.title,
      contractLevel: myPos.contractLevel, ytdCommission: myPos.ytdCommission,
      policiesSold: myPos.policiesSold, teamSize: myPos.teamSize,
      conversionRate: myPos.conversionRate, avatarUrl: myPos.avatarUrl,
    };
    return buildFlowFromFlatTree(flatMembers, myPos.id, myPos.id, ORANGE_THEME, rootMember);
  }, [myPos, flatMembers]);

  const layouted = useMemo(
    () => getLayoutedElements(nodes, edges, null),
    [nodes, edges],
  );

  return (
    <ExecutiveLoungeLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        {/* Hero */}
        <ExecutivePageHero
          icon={Building2}
          title="Agency Hierarchy"
          subtitle="Organization structure and override waterfall"
        >
          <div className="flex items-center gap-3">
            {myPos && (
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {totalDownline} Agents
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  {depth} Levels
                </span>
                {myPos.contractLevel != null && (
                  <span className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4" />
                    {myPos.contractLevel}% Contract
                  </span>
                )}
              </div>
            )}
          </div>
        </ExecutivePageHero>

        {/* Unplaced Agents Alert */}
        <AnimatePresence>
          {unplacedAgents.length > 0 && (
            <motion.section
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, height: 0 }}
            >
              <Card
                className="border-0"
                style={{
                  ...GLASS.css.light,
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  border: '1px solid #fbbf2440',
                }}
              >
                <CardContent style={{ padding: GRID.spacing.md }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 40, height: 40, borderRadius: RADIUS.button,
                        background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(234,88,12,0.15) 100%)',
                      }}
                    >
                      <AlertTriangle style={{ width: 20, height: 20, color: '#f59e0b' }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.section }}>
                        {unplacedAgents.length} Agent{unplacedAgents.length !== 1 ? 's' : ''} Need Placement
                      </h3>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                        These approved agents have not been assigned to the hierarchy yet
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col" style={{ gap: GRID.spacing.xs }}>
                    {unplacedAgents.map((agent) => (
                      <UnplacedAgentCard
                        key={agent.id}
                        agent={agent}
                        uplines={availableUplines}
                        onPlaced={handleAgentPlaced}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Stat Cards */}
        <motion.section variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard icon={Users} label="Total Agents" value={totalDownline} />
            <ExecutiveStatCard icon={Layers} label="Hierarchy Depth" value={depth} />
            <ExecutiveStatCard
              icon={Crown}
              label="Agency Contract"
              value={myPos?.contractLevel != null ? `${myPos.contractLevel}%` : 'N/A'}
            />
            <ExecutiveStatCard
              icon={DollarSign}
              label="Spread Range"
              value={myPos?.contractLevel != null ? `10-${Math.round(myPos.contractLevel * 0.4)}%` : 'N/A'}
            />
          </ExecutiveStatCardGrid>
        </motion.section>

        {/* Pending Requests from Managers */}
        {pendingExecRequests.length > 0 && (
          <motion.section variants={fadeInUp}>
            <Card
              className="border-0 overflow-hidden"
              style={{ ...GLASS.css.light, border: 'none', borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardContent style={{ padding: GRID.spacing.md }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 40, height: 40, borderRadius: RADIUS.button,
                      background: `linear-gradient(135deg, ${ORANGE[500]} 0%, ${ORANGE[700]} 100%)`,
                    }}
                  >
                    <ClipboardCheck style={{ width: 18, height: 18, color: 'white' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-stone-900" style={{ fontSize: TYPE.title }}>
                      Pending from Managers
                    </h2>
                    <p className="text-stone-500" style={{ fontSize: TYPE.caption }}>
                      {pendingExecRequests.length} request{pendingExecRequests.length !== 1 ? 's' : ''} awaiting your approval
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {pendingExecRequests.map((req: any) => (
                    <div
                      key={req.id}
                      style={{
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        border: `1px solid ${COLORS.gray[200]}`,
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                        <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                          <span
                            className="font-medium text-white"
                            style={{
                              fontSize: TYPE.micro, padding: '2px 8px', borderRadius: RADIUS.pill,
                              backgroundColor: req.request_type === 'placement' ? '#3b82f6' : '#f59e0b',
                            }}
                          >
                            {req.request_type === 'placement' ? 'Placement' : 'Commission Change'}
                          </span>
                          <span className="text-stone-400" style={{ fontSize: TYPE.caption }}>
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p className="font-medium text-stone-900" style={{ fontSize: TYPE.meta }}>
                        {req.requester_name || 'Agent'}
                      </p>

                      {/* Manager's recommendation */}
                      {req.manager_reviewer_name && (
                        <div className="flex items-center mt-1" style={{ gap: 4 }}>
                          <span className="text-emerald-600 font-medium" style={{ fontSize: TYPE.caption }}>
                            Manager: {req.manager_reviewer_name}
                          </span>
                          {req.manager_recommended_level && (
                            <span className="text-stone-500" style={{ fontSize: TYPE.caption }}>
                              · Recommended {req.manager_recommended_level}%
                            </span>
                          )}
                        </div>
                      )}
                      {req.manager_notes && (
                        <p className="text-stone-400 mt-1" style={{ fontSize: TYPE.micro }}>
                          "{req.manager_notes}"
                        </p>
                      )}

                      {req.request_type === 'commission_change' && (
                        <p className="text-stone-500 mt-1" style={{ fontSize: TYPE.caption }}>
                          {req.current_contract_level}% → {req.requested_contract_level}% · AP: ${Number(req.monthly_ap_amount || 0).toLocaleString()}
                        </p>
                      )}

                      {/* Executive Review Actions */}
                      {execReviewingId === req.id ? (
                        <div style={{ marginTop: GRID.spacing.sm }}>
                          <textarea
                            className="w-full border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                            style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.input, borderColor: COLORS.gray[200], fontSize: TYPE.caption }}
                            rows={2}
                            placeholder={execAction === 'rejected' ? 'Reason for rejection (required)...' : 'Executive notes...'}
                            value={execNotes}
                            onChange={(e) => setExecNotes(e.target.value)}
                          />
                          {execAction === 'approved' && (
                            <input
                              type="number"
                              className="w-full border rounded-lg text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                              style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.input, borderColor: COLORS.gray[200], fontSize: TYPE.caption }}
                              placeholder={`Final contract level (manager recommended: ${req.manager_recommended_level || 'N/A'})`}
                              value={execFinalLevel}
                              onChange={(e) => setExecFinalLevel(e.target.value)}
                            />
                          )}
                          <div className="flex gap-2" style={{ marginTop: GRID.spacing.xs }}>
                            <Button
                              size="sm"
                              disabled={execReviewMutation.isPending || (execAction === 'rejected' && !execNotes.trim())}
                              onClick={() => execReviewMutation.mutate({
                                id: req.id,
                                body: {
                                  status: execAction,
                                  notes: execNotes,
                                  finalContractLevel: execFinalLevel ? Number(execFinalLevel) : (req.manager_recommended_level || undefined),
                                  finalUplineId: req.requested_upline_id || undefined,
                                },
                              })}
                              className={execAction === 'approved' ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
                              style={{ borderRadius: RADIUS.input, fontSize: TYPE.caption }}
                            >
                              {execReviewMutation.isPending ? 'Processing...' : execAction === 'approved' ? 'Approve & Place' : 'Reject'}
                            </Button>
                            <Button
                              size="sm" variant="ghost"
                              onClick={() => { setExecReviewingId(null); setExecAction(null); setExecNotes(''); setExecFinalLevel(''); }}
                              style={{ borderRadius: RADIUS.input, fontSize: TYPE.caption }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2" style={{ marginTop: GRID.spacing.sm }}>
                          <Button
                            size="sm"
                            onClick={() => { setExecReviewingId(req.id); setExecAction('approved'); }}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            style={{ borderRadius: RADIUS.input, fontSize: TYPE.caption }}
                          >
                            <Check className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            onClick={() => { setExecReviewingId(req.id); setExecAction('rejected'); }}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            style={{ borderRadius: RADIUS.input, fontSize: TYPE.caption }}
                          >
                            <X className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* ─── MANAGE AGENTS — Search + Paginated Grid ─── */}
        {flatMembers.length > 0 && (() => {
          const filtered = flatMembers.filter((m) =>
            m.name?.toLowerCase().includes(agentSearch.toLowerCase()) ||
            m.email?.toLowerCase().includes(agentSearch.toLowerCase()) ||
            m.title?.toLowerCase().includes(agentSearch.toLowerCase())
          );
          const totalPages = Math.max(1, Math.ceil(filtered.length / AGENTS_PER_PAGE));
          const safePage = Math.min(agentPage, totalPages);
          const paginated = filtered.slice((safePage - 1) * AGENTS_PER_PAGE, safePage * AGENTS_PER_PAGE);

          return (
            <motion.section variants={fadeInUp}>
              {/* Header with Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ marginBottom: GRID.spacing.sm, gap: GRID.spacing.xs }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                  <Pencil style={{ width: 18, height: 18, color: ORANGE[600] }} />
                  <h2 className="font-semibold text-stone-900" style={{ fontSize: TYPE.title }}>Manage Agents</h2>
                  <span className="text-stone-400" style={{ fontSize: TYPE.caption }}>
                    {filtered.length} agent{filtered.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" style={{ width: 14, height: 14 }} />
                  <input
                    type="text"
                    className="bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-colors"
                    style={{
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px ${GRID.spacing.xs}px 32px`,
                      borderRadius: RADIUS.button,
                      fontSize: TYPE.caption,
                      width: 220,
                    }}
                    placeholder="Search agents..."
                    value={agentSearch}
                    onChange={(e) => { setAgentSearch(e.target.value); setAgentPage(1); }}
                  />
                </div>
              </div>

              {/* Agent Cards — Compact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: GRID.spacing.xs }}>
                {paginated.map((member) => (
                  <motion.div
                    key={member.id}
                    whileHover={{ y: -2, backgroundColor: ORANGE[50] }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: MOTION.duration.hover }}
                    onClick={() => {
                      setEditingAgent(member);
                      setEditContractLevel(String(member.contractLevel || ''));
                      setEditTitle(member.title || '');
                      setEditUpline('');
                    }}
                    className="cursor-pointer flex items-center"
                    style={{
                      border: `1px solid ${COLORS.gray[200]}`,
                      borderRadius: RADIUS.button,
                      padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`,
                      gap: GRID.spacing.xs,
                      backgroundColor: 'white',
                    }}
                  >
                    <div
                      className="flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{
                        width: 32, height: 32, borderRadius: RADIUS.input,
                        background: `linear-gradient(135deg, ${ORANGE[500]}, ${ORANGE[700]})`,
                        fontSize: TYPE.micro,
                      }}
                    >
                      {member.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 truncate" style={{ fontSize: TYPE.caption }}>{member.name}</p>
                      <p className="text-stone-400 truncate" style={{ fontSize: TYPE.micro }}>{member.title || 'Agent'}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-bold text-stone-900" style={{ fontSize: TYPE.meta }}>
                        {member.contractLevel != null ? `${member.contractLevel}%` : '—'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between" style={{ marginTop: GRID.spacing.sm }}>
                  <p className="text-stone-400" style={{ fontSize: TYPE.caption }}>
                    Showing {(safePage - 1) * AGENTS_PER_PAGE + 1}–{Math.min(safePage * AGENTS_PER_PAGE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                    <button
                      onClick={() => setAgentPage(Math.max(1, safePage - 1))}
                      disabled={safePage <= 1}
                      className="flex items-center justify-center border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      style={{ width: 32, height: 32, borderRadius: RADIUS.input }}
                    >
                      <ChevronLeft className="text-stone-600" style={{ width: 14, height: 14 }} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setAgentPage(p)}
                        className="flex items-center justify-center font-medium transition-colors"
                        style={{
                          width: 32, height: 32, borderRadius: RADIUS.input,
                          fontSize: TYPE.caption,
                          backgroundColor: p === safePage ? ORANGE[600] : 'transparent',
                          color: p === safePage ? 'white' : COLORS.gray[500],
                          border: p === safePage ? 'none' : `1px solid ${COLORS.gray[200]}`,
                        }}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setAgentPage(Math.min(totalPages, safePage + 1))}
                      disabled={safePage >= totalPages}
                      className="flex items-center justify-center border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      style={{ width: 32, height: 32, borderRadius: RADIUS.input }}
                    >
                      <ChevronRightIcon className="text-stone-600" style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              )}

              {/* Empty search state */}
              {filtered.length === 0 && agentSearch && (
                <div className="text-center" style={{ padding: GRID.spacing.xl }}>
                  <Search className="mx-auto text-stone-300" style={{ width: 32, height: 32, marginBottom: GRID.spacing.xs }} />
                  <p className="text-stone-500" style={{ fontSize: TYPE.meta }}>No agents match "{agentSearch}"</p>
                </div>
              )}
            </motion.section>
          );
        })()}

        {/* Edit Agent Modal */}
        {editingAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingAgent(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg overflow-hidden"
              style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero, backgroundColor: 'white' }}
            >
              {/* Header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${ORANGE[500]} 0%, ${ORANGE[700]} 100%)`,
                  padding: `${GRID.spacing.md}px ${GRID.spacing.lg}px`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                <div className="relative z-10 flex items-center" style={{ gap: GRID.spacing.sm }}>
                  <div
                    className="flex items-center justify-center text-white font-bold"
                    style={{
                      width: 48, height: 48, borderRadius: RADIUS.button,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontSize: TYPE.body,
                    }}
                  >
                    {editingAgent.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white" style={{ fontSize: TYPE.title, lineHeight: 1.2 }}>{editingAgent.name}</h3>
                    <p className="text-white/70" style={{ fontSize: TYPE.caption }}>{editingAgent.email} · {editingAgent.title || 'Agent'}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div style={{ padding: GRID.spacing.lg, display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {/* Current Stats */}
                <div className="grid grid-cols-3" style={{ gap: GRID.spacing.sm }}>
                  <div style={{ padding: GRID.spacing.sm, backgroundColor: ORANGE[50], borderRadius: RADIUS.input, textAlign: 'center' }}>
                    <p className="text-stone-400" style={{ fontSize: TYPE.micro }}>Current Level</p>
                    <p className="font-bold text-stone-900" style={{ fontSize: TYPE.section }}>{editingAgent.contractLevel || '—'}%</p>
                  </div>
                  <div style={{ padding: GRID.spacing.sm, backgroundColor: ORANGE[50], borderRadius: RADIUS.input, textAlign: 'center' }}>
                    <p className="text-stone-400" style={{ fontSize: TYPE.micro }}>Policies</p>
                    <p className="font-bold text-stone-900" style={{ fontSize: TYPE.section }}>{editingAgent.policiesSold || 0}</p>
                  </div>
                  <div style={{ padding: GRID.spacing.sm, backgroundColor: ORANGE[50], borderRadius: RADIUS.input, textAlign: 'center' }}>
                    <p className="text-stone-400" style={{ fontSize: TYPE.micro }}>YTD Revenue</p>
                    <p className="font-bold text-stone-900" style={{ fontSize: TYPE.section }}>${(editingAgent.ytdCommission || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Edit Fields */}
                <div>
                  <label className="text-stone-500 font-medium block" style={{ fontSize: TYPE.micro, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contract Level</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                      style={{ padding: `10px ${GRID.spacing.sm}px`, paddingRight: 40, borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                      placeholder={String(editingAgent.contractLevel || '80')}
                      value={editContractLevel}
                      onChange={(e) => setEditContractLevel(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-medium" style={{ fontSize: TYPE.meta }}>%</span>
                  </div>
                </div>

                <div>
                  <label className="text-stone-500 font-medium block" style={{ fontSize: TYPE.micro, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upline</label>
                  <select
                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                    style={{ padding: `10px ${GRID.spacing.sm}px`, borderRadius: RADIUS.input, fontSize: TYPE.meta, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px 16px' }}
                    value={editUpline}
                    onChange={(e) => setEditUpline(e.target.value)}
                  >
                    <option value="">Keep current upline</option>
                    {flatMembers.filter(m => m.id !== editingAgent.id).map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.contractLevel || 0}%)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-stone-500 font-medium block" style={{ fontSize: TYPE.micro, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</label>
                  <input
                    type="text"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                    style={{ padding: `10px ${GRID.spacing.sm}px`, borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    placeholder={editingAgent.title || 'Agent'}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end" style={{ paddingTop: GRID.spacing.xs, borderTop: `1px solid ${COLORS.gray[100]}` }}>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingAgent(null)}
                    className="text-stone-500 hover:text-stone-700"
                    style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta, padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px` }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={directEditMutation.isPending}
                    onClick={() => directEditMutation.mutate({
                      agentUserId: editingAgent.id,
                      directUplineId: editUpline || editingAgent.directUplineId || undefined,
                      contractLevel: editContractLevel ? Number(editContractLevel) : (editingAgent.contractLevel || undefined),
                      hierarchyTitle: editTitle || editingAgent.title || undefined,
                      hierarchyLevel: editingAgent.level,
                    })}
                    className="text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    style={{
                      borderRadius: RADIUS.button,
                      fontSize: TYPE.meta,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.lg}px`,
                      background: `linear-gradient(135deg, ${ORANGE[500]} 0%, ${ORANGE[700]} 100%)`,
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {directEditMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Hierarchy Flow */}
        <motion.div variants={fadeInUp}>
          <HierarchyFlow
            nodes={layouted.nodes}
            edges={layouted.edges}
            theme={ORANGE_THEME}
            isLoading={isLoading}
            isEmpty={!myPos}
            emptyTitle="No hierarchy data"
            emptySubtitle="Use the placement section above to build your organization."
          />
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveHierarchy;
