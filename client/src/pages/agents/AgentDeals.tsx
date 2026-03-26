/**
 * AgentDeals — Agency Deals page in the Agent Lounge
 * Heritage Lounge Design System — Violet Theme
 *
 * Shows a live feed of deals and a Top 20 leaderboard ranked by AP (Annual Premium).
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives";
import { SubmitDealDialog } from "@/components/agent/SubmitDealDialog";
import { RADIUS, SHADOW, fadeInUp, staggerContainer } from "@/lib/heritageDesignSystem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Trophy, TrendingUp, Target, Plus, Clock } from "lucide-react";

// =============================================================================
// HELPERS
// =============================================================================

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMin = Math.round((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function formatAP(value: number): string {
  return (
    "$" +
    value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

// =============================================================================
// PERIOD FILTER CONFIG
// =============================================================================

const PERIOD_OPTIONS = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
] as const;

type Period = (typeof PERIOD_OPTIONS)[number]["value"];

// =============================================================================
// SKELETON LOADERS
// =============================================================================

function StatsSkeleton() {
  return (
    <AgentStatCardGrid className="grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[88px] animate-pulse bg-gradient-to-br from-violet-100 to-purple-50"
          style={{ borderRadius: RADIUS.card }}
        />
      ))}
    </AgentStatCardGrid>
  );
}

function DealFeedSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between py-3">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
            <div className="h-3 w-16 bg-gray-100 rounded animate-pulse ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse flex-1" />
          <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AgentDeals() {
  const [period, setPeriod] = useState<Period>("month");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // ---------------------------------------------------------------------------
  // DATA FETCHING
  // ---------------------------------------------------------------------------

  const { data: statsData, isLoading: statsLoading } = useQuery<{
    success: boolean;
    data: { totalAP: number; totalDeals: number; avgDealSize: number };
  }>({
    queryKey: [`/api/deals/stats?period=${period}`],
  });

  const { data: dealsData, isLoading: dealsLoading } = useQuery<{
    success: boolean;
    data: any[];
  }>({
    queryKey: [`/api/deals?period=${period}`],
  });

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery<{
    success: boolean;
    data: any[];
  }>({
    queryKey: [`/api/deals/leaderboard?period=${period}`],
  });

  const stats = statsData?.data;
  const deals = dealsData?.data ?? [];
  const leaderboard = (leaderboardData?.data ?? []).slice(0, 20);

  // ---------------------------------------------------------------------------
  // CALLBACKS
  // ---------------------------------------------------------------------------

  function handleDealSubmitted() {
    queryClient.invalidateQueries({ queryKey: [`/api/deals/stats?period=${period}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/deals?period=${period}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/deals/leaderboard?period=${period}`] });
  }

  // ---------------------------------------------------------------------------
  // LEADERBOARD RANK DISPLAY
  // ---------------------------------------------------------------------------

  function renderRank(rank: number) {
    if (rank === 1) return <span className="text-lg">🥇</span>;
    if (rank === 2) return <span className="text-lg">🥈</span>;
    if (rank === 3) return <span className="text-lg">🥉</span>;
    return (
      <span
        className={`text-sm tabular-nums ${rank <= 5 ? "font-bold text-gray-800" : "text-gray-500"}`}
        style={{ minWidth: 24, display: "inline-block", textAlign: "center" }}
      >
        {rank}
      </span>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* ----------------------------------------------------------------- */}
        {/* HERO                                                              */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Trophy}
            title="Agency Deals"
            subtitle="Track team performance and celebrate wins"
          >
            <Button
              onClick={() => setSubmitDialogOpen(true)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg gap-2"
              style={{ borderRadius: RADIUS.button }}
            >
              <Plus className="w-4 h-4" />
              Submit Deal
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* STATS ROW                                                         */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={fadeInUp}>
          {statsLoading ? (
            <StatsSkeleton />
          ) : (
            <AgentStatCardGrid className="grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
              <AgentStatCard
                icon={DollarSign}
                value={stats ? formatAP(stats.totalAP) : "$0"}
                label="Team Total AP"
                gradient="from-violet-500 to-purple-600"
              />
              <AgentStatCard
                icon={Target}
                value={stats?.totalDeals ?? 0}
                label="Total Deals"
                gradient="from-emerald-500 to-green-600"
              />
              <AgentStatCard
                icon={TrendingUp}
                value={stats ? formatAP(stats.avgDealSize) : "$0"}
                label="Avg Deal Size"
                gradient="from-amber-500 to-orange-600"
              />
            </AgentStatCardGrid>
          )}
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* TIME PERIOD FILTER                                                */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={fadeInUp} className="flex gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={period === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(opt.value)}
              className={
                period === opt.value
                  ? "bg-violet-600 text-white hover:bg-violet-700"
                  : "text-gray-600 hover:text-violet-600"
              }
              style={{ borderRadius: RADIUS.button }}
            >
              {opt.label}
            </Button>
          ))}
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* TWO-COLUMN GRID: LIVE FEED + LEADERBOARD                          */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ---- LEFT: Live Deal Feed ---- */}
          <Card
            className="border-0"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Deals</h2>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>

              {dealsLoading ? (
                <DealFeedSkeleton />
              ) : deals.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4"
                  >
                    <Target className="w-7 h-7 text-violet-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No deals yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted deals will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-gray-100">
                  {deals.map((deal: any, idx: number) => (
                    <div
                      key={deal.id ?? idx}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {deal.agentName || `${deal.agent_first_name || ''} ${deal.agent_last_name || ''}`.trim() || "Agent"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {deal.carrier && (
                            <span className="text-gray-600">{deal.carrier}</span>
                          )}
                          {deal.carrier && (deal.client_name || deal.clientName) && (
                            <span className="mx-1 text-gray-300">&middot;</span>
                          )}
                          {(deal.client_name || deal.clientName) && (
                            <span className="text-gray-400">{deal.client_name || deal.clientName}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-bold text-violet-600">
                          {formatAP(parseFloat(deal.annual_premium ?? deal.annualPremium ?? deal.ap ?? 0))} AP
                        </p>
                        <p className="text-[10px] text-gray-400">
                          ${parseFloat(deal.monthly_premium ?? deal.monthlyPremium ?? 0).toLocaleString()}/mo
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {(deal.submitted_at || deal.createdAt) ? timeAgo(deal.submitted_at || deal.createdAt) : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ---- RIGHT: Top 20 Leaderboard ---- */}
          <Card
            className="border-0"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
              </div>

              {leaderboardLoading ? (
                <LeaderboardSkeleton />
              ) : leaderboard.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4"
                  >
                    <Trophy className="w-7 h-7 text-amber-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No rankings yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Submit deals to see agents ranked by AP.
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {leaderboard.map((entry: any, idx: number) => {
                    const rank = idx + 1;
                    const isTop3 = rank <= 3;
                    const isTop5 = rank <= 5;

                    return (
                      <div key={entry.agentId ?? entry.id ?? idx}>
                        {/* Divider after rank 5 */}
                        {rank === 6 && (
                          <div className="border-t border-gray-200 my-2" />
                        )}
                        <div
                          className={`flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg transition-colors ${
                            isTop3 ? "bg-violet-50/60" : ""
                          }`}
                        >
                          {/* Rank */}
                          <div className="w-8 flex items-center justify-center flex-shrink-0">
                            {renderRank(rank)}
                          </div>

                          {/* Name */}
                          <p
                            className={`text-sm flex-1 min-w-0 truncate ${
                              isTop5
                                ? "font-bold text-gray-900"
                                : "font-medium text-gray-700"
                            }`}
                          >
                            {entry.agentName ?? entry.name ?? "Agent"}
                          </p>

                          {/* Total AP */}
                          <p className="text-sm font-bold text-violet-600 tabular-nums flex-shrink-0">
                            {formatAP(entry.totalAP ?? entry.ap ?? 0)}
                          </p>

                          {/* Deal count badge */}
                          <Badge
                            variant="secondary"
                            className="text-xs tabular-nums flex-shrink-0"
                            style={{ borderRadius: RADIUS.pill }}
                          >
                            {entry.dealCount ?? entry.deals ?? 0}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Submit Deal Dialog */}
      <SubmitDealDialog
        open={submitDialogOpen}
        onOpenChange={(open) => {
          setSubmitDialogOpen(open);
          if (!open) handleDealSubmitted();
        }}
      />
    </AgentLoungeLayout>
  );
}
