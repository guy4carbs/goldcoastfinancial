/**
 * ManagerHierarchy — Recursive downline tree powered by React Flow
 * Heritage Lounge Design System — Emerald Theme
 * Includes pending approval requests from downline agents
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Network, Users, ClipboardList, Check, X, ChevronRight } from 'lucide-react';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero } from './primitives/ManagerPageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  GLASS,
  COLORS,
  MOTION,
  LAYOUT,
  fadeInUp,
  staggerContainer,
  scaleIn,
} from '@/lib/heritageDesignSystem';
import {
  HierarchyFlow,
  buildFlowFromFlatTree,
  getLayoutedElements,
  EMERALD_THEME,
} from '@/components/hierarchy';
import type { HierarchyMember } from '@/components/hierarchy';

// =============================================================================
// TYPES
// =============================================================================

interface MyPosition {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  level: number;
  title: string;
  contractLevel: number | null;
  ytdCommission: number;
  policiesSold: number;
  teamSize: number;
  conversionRate: number;
  avatarUrl: string | null;
}

// =============================================================================
// COMPONENT
// =============================================================================

// Emerald theme colors
const EMERALD = { 500: '#10b981', 600: '#059669', 700: '#047857', 50: '#ecfdf5' };
const MANAGER_GRADIENT = `linear-gradient(135deg, ${EMERALD[500]} 0%, ${EMERALD[700]} 100%)`;

export default function ManagerHierarchy() {
  const queryClient = useQueryClient();
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [recommendedLevel, setRecommendedLevel] = useState('');

  const { data: positionData, isLoading: posLoading } = useQuery<{ success: boolean; data: MyPosition }>({
    queryKey: ['/api/hierarchy/my-position'],
  });
  const { data: treeData, isLoading: treeLoading } = useQuery<{ success: boolean; data: HierarchyMember[] }>({
    queryKey: ['/api/hierarchy/team-tree'],
  });
  const { data: pendingData } = useQuery<any[]>({
    queryKey: ['/api/hierarchy-requests/pending-manager'],
  });

  const pendingRequests = Array.isArray(pendingData) ? pendingData : [];

  const reviewMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: any }) => {
      const res = await apiRequest('PUT', `/api/hierarchy-requests/${id}/manager-review`, body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy-requests/pending-manager'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/team-tree'] });
      setReviewingId(null);
      setReviewAction(null);
      setReviewNotes('');
      setRecommendedLevel('');
    },
  });

  // Manager submits request to executive
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAgentId, setRequestAgentId] = useState('');
  const [requestType, setRequestType] = useState<'placement' | 'commission_change'>('commission_change');
  const [requestLevel, setRequestLevel] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [requestUplineId, setRequestUplineId] = useState('');

  const submitRequestMutation = useMutation({
    mutationFn: async (body: any) => {
      const endpoint = body.requestType === 'placement'
        ? '/api/hierarchy-requests/placement'
        : '/api/hierarchy-requests/commission-change';
      const res = await apiRequest('POST', endpoint, body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy-requests/pending-manager'] });
      setShowRequestModal(false);
      setRequestAgentId('');
      setRequestLevel('');
      setRequestNotes('');
      setRequestUplineId('');
    },
  });

  const myPos = positionData?.data;
  const flatMembers = treeData?.data || [];
  const isLoading = posLoading || treeLoading;

  // Count total downline
  const totalDownline = flatMembers.length;

  // Build React Flow nodes/edges from flat data
  const { nodes, edges } = useMemo(() => {
    if (!myPos) return { nodes: [], edges: [] };
    const rootMember: HierarchyMember = {
      id: myPos.id, name: myPos.name, email: myPos.email, phone: myPos.phone,
      role: myPos.role, level: myPos.level, title: myPos.title,
      contractLevel: myPos.contractLevel, ytdCommission: myPos.ytdCommission,
      policiesSold: myPos.policiesSold, teamSize: myPos.teamSize,
      conversionRate: myPos.conversionRate, avatarUrl: myPos.avatarUrl,
    };
    return buildFlowFromFlatTree(flatMembers, myPos.id, myPos.id, EMERALD_THEME, rootMember);
  }, [myPos, flatMembers]);

  const layouted = useMemo(
    () => getLayoutedElements(nodes, edges, null),
    [nodes, edges],
  );

  return (
    <ManagerLoungeLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-5">
        {/* Hero */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={Network}
            title="Team Hierarchy"
            subtitle="Your downline organization and override waterfall"
          >
            <div className="flex items-center gap-3">
              {myPos && (
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {totalDownline} Downline
                  </span>
                  {myPos.contractLevel != null && (
                    <span className="flex items-center gap-1.5">
                      {myPos.contractLevel}% Contract
                    </span>
                  )}
                </div>
              )}
              <Button
                size="sm"
                onClick={() => setShowRequestModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                style={{ borderRadius: RADIUS.input, fontSize: TYPE.caption }}
              >
                <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                Request Change
              </Button>
            </div>
          </ManagerPageHero>
        </motion.div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <motion.div variants={fadeInUp}>
            <Card
              className="border-0 overflow-hidden"
              style={{ ...GLASS.css.light, border: 'none', borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardContent style={{ padding: GRID.spacing.md }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                  <div
                    className="flex items-center justify-center"
                    style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, background: MANAGER_GRADIENT }}
                  >
                    <ClipboardList style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-stone-900" style={{ fontSize: TYPE.title }}>Pending Requests</h2>
                    <p className="text-stone-500" style={{ fontSize: TYPE.caption }}>{pendingRequests.length} awaiting your review</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {pendingRequests.map((req: any) => (
                    <motion.div
                      key={req.id}
                      variants={scaleIn}
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
                              fontSize: TYPE.micro,
                              padding: '2px 8px',
                              borderRadius: RADIUS.pill,
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
                      {req.request_type === 'placement' && req.requested_upline_name && (
                        <p className="text-stone-500" style={{ fontSize: TYPE.caption }}>
                          Requested upline: {req.requested_upline_name}
                        </p>
                      )}
                      {req.request_type === 'commission_change' && (
                        <p className="text-stone-500" style={{ fontSize: TYPE.caption }}>
                          {req.current_contract_level}% → {req.requested_contract_level}% · AP: ${Number(req.monthly_ap_amount || 0).toLocaleString()}
                        </p>
                      )}
                      {req.proof_description && (
                        <p className="text-stone-400 mt-1" style={{ fontSize: TYPE.micro }}>{req.proof_description}</p>
                      )}

                      {/* Review Actions */}
                      {reviewingId === req.id ? (
                        <div style={{ marginTop: GRID.spacing.sm }}>
                          <textarea
                            className="w-full border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.input, borderColor: COLORS.gray[200], fontSize: TYPE.caption }}
                            rows={2}
                            placeholder={reviewAction === 'rejected' ? 'Reason for rejection (required)...' : 'Review notes (optional)...'}
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                          />
                          {reviewAction === 'approved' && req.request_type === 'placement' && (
                            <input
                              type="number"
                              className="w-full border rounded-lg text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                              style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.input, borderColor: COLORS.gray[200], fontSize: TYPE.caption }}
                              placeholder="Recommended contract level (e.g., 80)"
                              value={recommendedLevel}
                              onChange={(e) => setRecommendedLevel(e.target.value)}
                            />
                          )}
                          <div className="flex gap-2" style={{ marginTop: GRID.spacing.xs }}>
                            <Button
                              size="sm"
                              disabled={reviewMutation.isPending || (reviewAction === 'rejected' && !reviewNotes.trim())}
                              onClick={() => reviewMutation.mutate({
                                id: req.id,
                                body: {
                                  status: reviewAction,
                                  notes: reviewNotes,
                                  recommendedLevel: recommendedLevel ? Number(recommendedLevel) : undefined,
                                },
                              })}
                              className={reviewAction === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
                              style={{ borderRadius: RADIUS.input, fontSize: TYPE.caption }}
                            >
                              {reviewMutation.isPending ? 'Submitting...' : reviewAction === 'approved' ? 'Confirm Approve' : 'Confirm Reject'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setReviewingId(null); setReviewAction(null); setReviewNotes(''); setRecommendedLevel(''); }}
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
                            onClick={() => { setReviewingId(req.id); setReviewAction('approved'); }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            style={{ borderRadius: RADIUS.input, fontSize: TYPE.caption }}
                          >
                            <Check className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setReviewingId(req.id); setReviewAction('rejected'); }}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            style={{ borderRadius: RADIUS.input, fontSize: TYPE.caption }}
                          >
                            <X className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Hierarchy Flow */}
        <motion.div variants={fadeInUp} className="px-1">
          <HierarchyFlow
            nodes={layouted.nodes}
            edges={layouted.edges}
            theme={EMERALD_THEME}
            isLoading={isLoading}
            isEmpty={!myPos}
            emptyTitle="Hierarchy not set up"
            emptySubtitle="Your hierarchy hasn't been configured yet."
          />
        </motion.div>
      </motion.div>

      {/* Request Change Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRequestModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.hero,
              backgroundColor: 'white',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: MANAGER_GRADIENT,
                padding: `${GRID.spacing.md}px ${GRID.spacing.lg}px`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
              <div className="relative z-10">
                <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: 4 }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 36, height: 36, borderRadius: RADIUS.button,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <ClipboardList style={{ width: 18, height: 18, color: 'white' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white" style={{ fontSize: TYPE.title, lineHeight: 1.2 }}>Request Change</h3>
                    <p className="text-white/70" style={{ fontSize: TYPE.caption }}>Submit to executive for approval</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ padding: `${GRID.spacing.lg}px`, display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
              {/* Request Type Tabs */}
              <div className="flex" style={{ gap: GRID.spacing.xs, backgroundColor: COLORS.gray[100], padding: 4, borderRadius: RADIUS.button }}>
                <button
                  onClick={() => setRequestType('commission_change')}
                  className="flex-1 font-medium transition-all"
                  style={{
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.input,
                    fontSize: TYPE.caption,
                    backgroundColor: requestType === 'commission_change' ? 'white' : 'transparent',
                    color: requestType === 'commission_change' ? EMERALD[700] : COLORS.gray[500],
                    boxShadow: requestType === 'commission_change' ? SHADOW.level1 : 'none',
                  }}
                >
                  Commission Change
                </button>
                <button
                  onClick={() => setRequestType('placement')}
                  className="flex-1 font-medium transition-all"
                  style={{
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.input,
                    fontSize: TYPE.caption,
                    backgroundColor: requestType === 'placement' ? 'white' : 'transparent',
                    color: requestType === 'placement' ? EMERALD[700] : COLORS.gray[500],
                    boxShadow: requestType === 'placement' ? SHADOW.level1 : 'none',
                  }}
                >
                  Hierarchy Change
                </button>
              </div>

              {/* Agent Select */}
              <div>
                <label className="text-stone-500 font-medium block" style={{ fontSize: TYPE.micro, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agent</label>
                <select
                  className="w-full bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
                  style={{ padding: `10px ${GRID.spacing.sm}px`, borderRadius: RADIUS.input, fontSize: TYPE.meta, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px 16px' }}
                  value={requestAgentId}
                  onChange={(e) => setRequestAgentId(e.target.value)}
                >
                  <option value="">Select agent...</option>
                  {flatMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.contractLevel || 0}%)</option>
                  ))}
                </select>
              </div>

              {/* Commission Change Fields */}
              {requestType === 'commission_change' && (
                <div>
                  <label className="text-stone-500 font-medium block" style={{ fontSize: TYPE.micro, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requested Contract Level</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
                      style={{ padding: `10px ${GRID.spacing.sm}px`, paddingRight: 40, borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                      placeholder="85"
                      value={requestLevel}
                      onChange={(e) => setRequestLevel(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-medium" style={{ fontSize: TYPE.meta }}>%</span>
                  </div>
                </div>
              )}

              {/* Placement Fields */}
              {requestType === 'placement' && (
                <div>
                  <label className="text-stone-500 font-medium block" style={{ fontSize: TYPE.micro, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Upline</label>
                  <select
                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
                    style={{ padding: `10px ${GRID.spacing.sm}px`, borderRadius: RADIUS.input, fontSize: TYPE.meta, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px 16px' }}
                    value={requestUplineId}
                    onChange={(e) => setRequestUplineId(e.target.value)}
                  >
                    <option value="">Select upline...</option>
                    {flatMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-stone-500 font-medium block" style={{ fontSize: TYPE.micro, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Justification</label>
                <textarea
                  className="w-full bg-stone-50 border border-stone-200 text-stone-900 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
                  style={{ padding: `10px ${GRID.spacing.sm}px`, borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                  rows={3}
                  placeholder="Explain why this change is needed..."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end" style={{ paddingTop: GRID.spacing.xs, borderTop: `1px solid ${COLORS.gray[100]}` }}>
                <Button
                  variant="ghost"
                  onClick={() => setShowRequestModal(false)}
                  className="text-stone-500 hover:text-stone-700"
                  style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta, padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px` }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!requestAgentId || submitRequestMutation.isPending}
                  onClick={() => {
                    if (requestType === 'commission_change') {
                      submitRequestMutation.mutate({
                        requestType: 'commission_change',
                        requestedContractLevel: Number(requestLevel),
                        proofDescription: requestNotes,
                        monthlyApAmount: 0,
                      });
                    } else {
                      submitRequestMutation.mutate({
                        requestType: 'placement',
                        requestedUplineId: requestUplineId,
                        notes: requestNotes,
                      });
                    }
                  }}
                  className="text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  style={{
                    borderRadius: RADIUS.button,
                    fontSize: TYPE.meta,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.lg}px`,
                    background: MANAGER_GRADIENT,
                  }}
                >
                  {submitRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </ManagerLoungeLayout>
  );
}
