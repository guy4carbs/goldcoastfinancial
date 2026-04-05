/**
 * AgentCommissions — Agent's commission view page in the Agent Lounge
 * Heritage Lounge Design System — Violet Theme
 *
 * Shows earnings, contract level, AP progress, and commission increase requests.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  FileText,
  Crown,
  Target,
  BarChart3,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  X,
  Layers,
} from 'lucide-react';
import { AgentLoungeLayout } from '@/components/agent/AgentLoungeLayout';
import { AgentPageHero } from '@/components/agent/primitives';
import { AgentStatCard, AgentStatCardGrid } from '@/components/agent/primitives';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useAgentStore } from '@/lib/agentStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  GLASS,
  MOTION,
  COLORS,
  LAYOUT,
  fadeInUp,
  staggerContainer,
  scaleIn,
} from '@/lib/heritageDesignSystem';
import { getNextTier } from '@/lib/commissionTiers';

interface HierarchyRequest {
  id: number;
  requestType: string;
  status: string;
  createdAt: string;
  notes?: string;
  requestedLevel?: number;
  monthlyAp?: number;
  proofDescription?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AgentCommissions() {
  const currentUser = useAgentStore((state) => state.currentUser);
  const queryClient = useQueryClient();

  // Modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestedLevel, setRequestedLevel] = useState<number>(0);
  const [monthlyApAmount, setMonthlyApAmount] = useState<number>(0);
  const [proofDescription, setProofDescription] = useState('');

  // =========================================================================
  // DATA FETCHING
  // =========================================================================

  const { data: myPosition } = useQuery<any>({
    queryKey: ['/api/hierarchy/my-position'],
  });

  const { data: myTargets } = useQuery<any>({
    queryKey: [`/api/commission-targets/agent/${currentUser?.id}`],
    enabled: !!currentUser?.id,
  });

  const { data: myRequests } = useQuery<any>({
    queryKey: ['/api/hierarchy-requests/my-requests'],
  });

  const { data: myCommissions } = useQuery<any>({
    queryKey: ['/api/commissions/my-earnings'],
  });

  const { data: myDealStats } = useQuery<any>({
    queryKey: ['/api/deals/my-stats?period=month'],
  });

  // =========================================================================
  // MUTATIONS
  // =========================================================================

  const submitRequest = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/hierarchy-requests/commission-change', {
        requestedContractLevel: requestedLevel,
        monthlyApAmount,
        proofDescription,
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Commission increase request submitted', {
        description: 'Your manager will review your request shortly.',
      });
      setShowRequestModal(false);
      setRequestedLevel(0);
      setMonthlyApAmount(0);
      setProofDescription('');
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy-requests/my-requests'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to submit request', {
        description: error.message || 'Please try again.',
      });
    },
  });

  // =========================================================================
  // DERIVED DATA
  // =========================================================================

  const positionData = myPosition?.data ?? myPosition;
  const contractLevel = positionData?.contractLevel ?? myTargets?.currentLevel ?? 0;
  const tierInfo = getNextTier(contractLevel);
  const nextLevel = myTargets?.nextLevel || tierInfo?.rate || 0;
  const monthlyAp = myCommissions?.monthlyAp ?? 0;
  const nextThreshold = myTargets?.nextThreshold || tierInfo?.apThreshold || 0;
  const ytdEarnings = positionData?.ytdCommission ?? myCommissions?.ytdEarnings ?? 0;
  const policiesSold = myDealStats?.data?.totalDeals ?? positionData?.policiesSold ?? myCommissions?.policiesSold ?? 0;
  const overrideEarnings = myCommissions?.overrideEarnings ?? 0;
  const overrideAp = myCommissions?.overrideAp ?? 0;
  const totalAp = monthlyAp + overrideAp;
  const monthlyApData = myCommissions?.monthlyApData ?? [];

  const requests: HierarchyRequest[] = Array.isArray(myRequests?.requests)
    ? myRequests.requests
    : Array.isArray(myRequests)
      ? myRequests
      : [];

  const personalApProgress = nextThreshold > 0 ? Math.min((monthlyAp / nextThreshold) * 100, 100) : 0;
  const overrideApProgress = nextThreshold > 0 ? Math.min((overrideAp / nextThreshold) * 100, 100) : 0;
  const totalApProgress = nextThreshold > 0 ? Math.min((totalAp / nextThreshold) * 100, 100) : 0;
  const maxBarValue = Math.max(...monthlyApData.map((d: any) => d.ap), nextThreshold);

  // =========================================================================
  // HELPERS
  // =========================================================================

  function formatCurrency(amount: number): string {
    if (amount >= 1000) {
      return `$${amount.toLocaleString()}`;
    }
    return `$${amount}`;
  }

  function getStatusBadge(status: string) {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-0 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </Badge>
        );
      case 'denied':
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 border-0 gap-1">
            <XCircle className="w-3 h-3" />
            Denied
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 border-0 gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
    }
  }

  function getRequestTypeBadge(type: string) {
    switch (type?.toLowerCase()) {
      case 'commission-change':
      case 'commission_change':
        return <Badge className="bg-violet-100 text-violet-700 border-0">Commission Increase</Badge>;
      case 'level-change':
      case 'level_change':
        return <Badge className="bg-blue-100 text-blue-700 border-0">Level Change</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600 border-0">{type || 'Request'}</Badge>;
    }
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <AgentLoungeLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-5">

        {/* ================================================================= */}
        {/* HERO SECTION */}
        {/* ================================================================= */}
        <AgentPageHero
          icon={DollarSign}
          title="My Commissions"
          subtitle="Track your earnings and contract level"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <Crown className="w-5 h-5 text-amber-200" />
              <span className="text-white font-bold text-lg">{contractLevel}%</span>
              <span className="text-white/70 text-sm">Contract</span>
            </div>
          </div>
        </AgentPageHero>

        {/* ================================================================= */}
        {/* EARNINGS OVERVIEW STAT CARDS */}
        {/* ================================================================= */}
        <motion.section variants={fadeInUp}>
          <AgentStatCardGrid>
            <AgentStatCard
              icon={DollarSign}
              label="YTD Earnings"
              value={formatCurrency(ytdEarnings)}
            />
            <AgentStatCard
              icon={FileText}
              label="Policies Sold"
              value={policiesSold}
            />
            <AgentStatCard
              icon={TrendingUp}
              label="This Month AP"
              value={formatCurrency(monthlyAp)}
            />
            <AgentStatCard
              icon={Layers}
              label="Override Earnings"
              value={formatCurrency(overrideEarnings)}
            />
          </AgentStatCardGrid>
        </motion.section>

        {/* ================================================================= */}
        {/* CONTRACT LEVEL & AP PROGRESS */}
        {/* ================================================================= */}
        <motion.section variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
              ...GLASS.css.standard,
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    className="font-bold text-gray-900"
                    style={{ fontSize: TYPE.section }}
                  >
                    Contract Level & AP Progress
                  </h2>
                  <p className="text-gray-500 mt-1" style={{ fontSize: TYPE.meta }}>
                    Your path to the next commission tier
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setRequestedLevel(nextLevel);
                    setShowRequestModal(true);
                  }}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow"
                  style={{ borderRadius: RADIUS.button, height: LAYOUT.buttonHeight }}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Request Commission Increase
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Level */}
                <div
                  className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-violet-50 to-purple-50"
                  style={{ borderRadius: RADIUS.card }}
                >
                  <div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg"
                    style={{ boxShadow: SHADOW.glow.violet }}
                  >
                    <span className="text-3xl font-bold text-white">{contractLevel}%</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Current Level</p>
                  <p className="text-xs text-gray-400 mt-1">Commission Rate</p>
                </div>

                {/* Next Level Target */}
                <div
                  className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-50"
                  style={{ borderRadius: RADIUS.card }}
                >
                  <div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3 shadow-lg"
                    style={{ boxShadow: SHADOW.glow.amber }}
                  >
                    <span className="text-3xl font-bold text-white">{nextLevel}%</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Next Level</p>
                  <p className="text-xs text-gray-400 mt-1">Target Commission</p>
                </div>

                {/* AP Progress — 3 bars */}
                <div
                  className="flex flex-col justify-center p-6 bg-gradient-to-br from-gray-50 to-slate-50 gap-5"
                  style={{ borderRadius: RADIUS.card }}
                >
                  {/* Personal AP */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-700">My AP</span>
                      <span className="text-xs text-gray-400">
                        {formatCurrency(monthlyAp)} / {formatCurrency(nextThreshold)}
                      </span>
                    </div>
                    <Progress value={personalApProgress} className="h-2.5 mb-1" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{Math.round(personalApProgress)}%</span>
                      <span className="text-[10px] font-semibold text-violet-600">
                        {monthlyAp >= nextThreshold ? 'Threshold met' : `${formatCurrency(nextThreshold - monthlyAp)} remaining`}
                      </span>
                    </div>
                  </div>

                  {/* Override AP */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-700">Override AP</span>
                      <span className="text-xs text-gray-400">
                        {formatCurrency(overrideAp)}
                      </span>
                    </div>
                    <Progress value={overrideApProgress} className="h-2.5 mb-1 [&>div]:bg-amber-500" />
                    <span className="text-[10px] text-gray-400">{Math.round(overrideApProgress)}% of threshold</span>
                  </div>

                  {/* Total AP */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-gray-900">Total AP</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {formatCurrency(totalAp)} / {formatCurrency(nextThreshold)}
                      </span>
                    </div>
                    <Progress value={totalApProgress} className="h-3 mb-1 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-emerald-500" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-500">{Math.round(totalApProgress)}%</span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {totalAp >= nextThreshold ? 'Threshold met!' : `${formatCurrency(nextThreshold - totalAp)} remaining`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly AP Bar Chart */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Monthly AP Trend</h3>
                {monthlyApData.length > 0 ? (
                  <div className="flex items-end gap-3 h-32">
                    {monthlyApData.map((item: any, i: number) => {
                      const barHeight = maxBarValue > 0 ? (item.ap / maxBarValue) * 100 : 0;
                      const isCurrentMonth = i === monthlyApData.length - 1;
                      return (
                        <motion.div
                          key={item.month}
                          className="flex-1 flex flex-col items-center gap-1"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{
                            delay: i * 0.08,
                            duration: MOTION.duration.normal,
                            ease: MOTION.easing,
                          }}
                          style={{ originY: 1 }}
                        >
                          <span className="text-xs font-semibold text-gray-600">
                            {formatCurrency(item.ap)}
                          </span>
                          <div
                            className={cn(
                              'w-full rounded-t-lg transition-all',
                              isCurrentMonth
                                ? 'bg-gradient-to-t from-violet-600 to-purple-500'
                                : 'bg-gradient-to-t from-violet-200 to-purple-200'
                            )}
                            style={{
                              height: `${barHeight}%`,
                              minHeight: 4,
                              borderRadius: `${RADIUS.input}px ${RADIUS.input}px 0 0`,
                            }}
                          />
                          <span className={cn(
                            'text-xs',
                            isCurrentMonth ? 'font-bold text-violet-700' : 'text-gray-400'
                          )}>
                            {item.month}
                          </span>
                        </motion.div>
                      );
                    })}
                    {/* Threshold line reference */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-amber-600">
                        {formatCurrency(nextThreshold)}
                      </span>
                      <div
                        className="w-full border-2 border-dashed border-amber-400 rounded"
                        style={{
                          height: `${maxBarValue > 0 ? (nextThreshold / maxBarValue) * 100 : 0}%`,
                          minHeight: 4,
                        }}
                      />
                      <span className="text-xs text-amber-500 font-medium">Goal</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <BarChart3 className="w-8 h-8 text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">No AP data yet</p>
                    <p className="text-xs text-gray-300">Submit deals to see your monthly trend</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ================================================================= */}
        {/* MY REQUESTS */}
        {/* ================================================================= */}
        <motion.section variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
              ...GLASS.css.standard,
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2
                    className="font-bold text-gray-900"
                    style={{ fontSize: TYPE.section }}
                  >
                    My Requests
                  </h2>
                  <p className="text-gray-500 mt-1" style={{ fontSize: TYPE.meta }}>
                    Commission increase and level change requests
                  </p>
                </div>
                <Badge className="bg-violet-100 text-violet-700 border-0">
                  {requests.length} total
                </Badge>
              </div>

              {requests.length === 0 ? (
                <motion.div
                  variants={scaleIn}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4"
                  >
                    <AlertCircle className="w-8 h-8 text-violet-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">No commission requests yet</p>
                  <p className="text-gray-400 text-sm max-w-sm">
                    When you're ready for a commission increase, submit a request and your manager will review it.
                  </p>
                  <Button
                    onClick={() => {
                      setRequestedLevel(nextLevel);
                      setShowRequestModal(true);
                    }}
                    className="mt-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    Submit Your First Request
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req, i) => (
                    <motion.div
                      key={req.id || i}
                      variants={fadeInUp}
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      style={{ borderRadius: RADIUS.input }}
                    >
                      <div className="flex items-center gap-3">
                        {getRequestTypeBadge(req.requestType)}
                        {getStatusBadge(req.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        {req.requestedLevel && (
                          <span className="text-gray-600">
                            Requested: <span className="font-semibold text-violet-600">{req.requestedLevel}%</span>
                          </span>
                        )}
                        {req.notes && (
                          <span className="text-gray-400 max-w-[200px] truncate" title={req.notes}>
                            {req.notes}
                          </span>
                        )}
                        <span className="text-gray-400 text-xs">
                          {req.createdAt
                            ? new Date(req.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : ''}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

      </motion.div>

      {/* =================================================================== */}
      {/* COMMISSION INCREASE REQUEST MODAL */}
      {/* =================================================================== */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.duration.fast }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowRequestModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-lg mx-4 bg-white overflow-hidden"
              style={{
                borderRadius: RADIUS.hero,
                boxShadow: SHADOW.hero,
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: 'spring',
                damping: MOTION.spring.damping,
                stiffness: MOTION.spring.stiffness,
              }}
            >
              {/* Modal Header */}
              <div
                className="p-6 text-white"
                style={{ background: COLORS.gradients.hero }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-amber-200" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Request Commission Increase</h2>
                      <p className="text-white/70 text-sm">Submit proof of performance to your manager</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Requested Contract Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Requested Contract Level
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={contractLevel + 1}
                      max={150}
                      value={requestedLevel || ''}
                      onChange={(e) => setRequestedLevel(Number(e.target.value))}
                      placeholder={`e.g., ${nextLevel}`}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      style={{ borderRadius: RADIUS.input }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Current level: {contractLevel}% — Next tier: {nextLevel}%
                  </p>
                </div>

                {/* Monthly AP Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly AP Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input
                      type="number"
                      min={0}
                      value={monthlyApAmount || ''}
                      onChange={(e) => setMonthlyApAmount(Number(e.target.value))}
                      placeholder="e.g., 25000"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Your current monthly AP: {formatCurrency(monthlyAp)}
                  </p>
                </div>

                {/* Proof Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Proof Description
                  </label>
                  <textarea
                    value={proofDescription}
                    onChange={(e) => setProofDescription(e.target.value)}
                    placeholder="Describe your performance, consistency, and why you qualify for this increase..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>

                {/* Upload Proof (Disabled — Coming Soon) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Proof
                  </label>
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border border-dashed border-gray-300 text-gray-400 cursor-not-allowed"
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Upload documents — Coming soon</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 pb-6 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRequestModal(false)}
                  style={{ borderRadius: RADIUS.button, height: LAYOUT.buttonHeight }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => submitRequest.mutate()}
                  disabled={!requestedLevel || !proofDescription || submitRequest.isPending}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                  style={{ borderRadius: RADIUS.button, height: LAYOUT.buttonHeight }}
                >
                  {submitRequest.isPending ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AgentLoungeLayout>
  );
}

export default AgentCommissions;
