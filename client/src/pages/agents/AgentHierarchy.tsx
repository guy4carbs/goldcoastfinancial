/**
 * AgentHierarchy — Visual tree view powered by React Flow
 * Heritage Lounge Design System — Violet Theme
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Network, Users, Crown, TrendingUp, Layers, AlertTriangle, Loader2 } from 'lucide-react';
import { AgentLoungeLayout } from '@/components/agent/AgentLoungeLayout';
import { AgentPageHero } from '@/components/agent/primitives';
import { AgentStatCard, AgentStatCardGrid } from '@/components/agent/primitives';
import { Button } from '@/components/ui/button';
import {
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import { TOUR } from "@/lib/tour/selectors";
import {
  HierarchyFlow,
  buildFlowFromFlatTree,
  getLayoutedElements,
  VIOLET_THEME,
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

export default function AgentHierarchy() {
  // /my-position gives the current user's own row (used as the tree root).
  // /team-tree returns the full recursive subtree (every descendant — direct
  // reports, their reports, and so on). Exec tier gets all agents system-wide.
  const { data: posData, isLoading: posLoading, isError: posError, refetch: refetchPos } =
    useQuery<{ success: boolean; data: MyPosition }>({
      queryKey: ['/api/hierarchy/my-position'],
    });
  const { data: treeData, isLoading: treeLoading, isError: treeError, refetch: refetchTree } =
    useQuery<{ success: boolean; data: HierarchyMember[] }>({
      queryKey: ['/api/hierarchy/team-tree'],
    });

  const isLoading = posLoading || treeLoading;
  const isError = posError || treeError;
  const refetch = () => { refetchPos(); refetchTree(); };

  const myPos = posData?.data;
  const flatMembers = treeData?.data || [];

  const { nodes, edges } = useMemo(() => {
    if (!myPos) return { nodes: [], edges: [] };
    const rootMember: HierarchyMember = {
      id: myPos.id,
      name: myPos.name,
      email: myPos.email,
      phone: myPos.phone,
      role: myPos.role,
      level: myPos.level,
      title: myPos.title,
      contractLevel: myPos.contractLevel,
      ytdCommission: myPos.ytdCommission,
      policiesSold: myPos.policiesSold,
      teamSize: myPos.teamSize,
      conversionRate: myPos.conversionRate,
      avatarUrl: myPos.avatarUrl,
    };
    return buildFlowFromFlatTree(flatMembers, myPos.id, myPos.id, VIOLET_THEME, rootMember);
  }, [myPos, flatMembers]);

  const layouted = useMemo(
    () => getLayoutedElements(nodes, edges, null),
    [nodes, edges],
  );

  // Compute dynamic height based on tree depth
  const nodeCount = layouted.nodes.length;
  const flowHeight = Math.max(400, Math.min(900, nodeCount * 100 + 200));

  // Stats from hierarchy data
  const agent = myPos;
  const downlineCount = flatMembers.length;

  if (isError) {
    return (
      <AgentLoungeLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <p className="text-gray-600">Failed to load hierarchy data.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </AgentLoungeLayout>
    );
  }

  return (
    <AgentLoungeLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-5">
        <div data-tour-id={TOUR.AGENT.HIERARCHY.HEADER}>
        <AgentPageHero
          icon={Network}
          title="My Hierarchy"
          subtitle="Your position in the agency tree — contract levels & override spreads"
        >
          {agent && (
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {downlineCount} in Downline
              </span>
              {agent.contractLevel != null && (
                <span className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  {agent.contractLevel}% Contract
                </span>
              )}
            </div>
          )}
        </AgentPageHero>
        </div>

        {/* Stat Cards */}
        {agent && (
          <motion.section data-tour-id={TOUR.AGENT.HIERARCHY.STATS} variants={fadeInUp}>
            <AgentStatCardGrid>
              <AgentStatCard
                icon={Crown}
                label="Contract Level"
                value={agent.contractLevel != null ? `${agent.contractLevel}%` : 'N/A'}
              />
              <AgentStatCard
                icon={Users}
                label="Total Downline"
                value={downlineCount}
              />
              <AgentStatCard
                icon={Layers}
                label="Direct Reports"
                value={flatMembers.filter(m => m.directUplineId === agent.id).length}
              />
              <AgentStatCard
                icon={TrendingUp}
                label="YTD Commission"
                value={agent.ytdCommission >= 1000 ? `$${Math.round(agent.ytdCommission / 1000)}K` : `$${agent.ytdCommission}`}
              />
            </AgentStatCardGrid>
          </motion.section>
        )}

        {/* Hierarchy Flow */}
        <motion.div data-tour-id={TOUR.AGENT.HIERARCHY.TREE} variants={fadeInUp} className="px-1">
          <HierarchyFlow
            nodes={layouted.nodes}
            edges={layouted.edges}
            theme={VIOLET_THEME}
            isLoading={isLoading && !myPos}
            isEmpty={!myPos}
            emptyTitle="Not in a hierarchy yet"
            emptySubtitle="Your position hasn't been set up by your manager."
            height={flowHeight}
          />
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
