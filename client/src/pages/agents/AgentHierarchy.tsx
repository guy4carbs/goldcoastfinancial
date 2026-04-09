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
import {
  HierarchyFlow,
  buildFlowFromAgentData,
  getLayoutedElements,
  VIOLET_THEME,
} from '@/components/hierarchy';
import type { HierarchyMember } from '@/components/hierarchy';

// =============================================================================
// TYPES
// =============================================================================

interface HierarchyData {
  agent: HierarchyMember;
  upline: HierarchyMember[];
  downline: HierarchyMember[];
}

// =============================================================================
// API
// =============================================================================

async function fetchHierarchy(): Promise<HierarchyData | null> {
  const response = await fetch('/api/hierarchy/full', { credentials: 'include' });
  if (!response.ok) return null;
  const data = await response.json();
  return data.success ? data.data : null;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function AgentHierarchy() {
  const { data: apiData, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/hierarchy/full'],
    queryFn: fetchHierarchy,
  });

  const hierarchy = apiData;

  const { nodes, edges } = useMemo(() => {
    if (!hierarchy || !hierarchy.agent || !hierarchy.agent.id) return { nodes: [], edges: [] };
    return buildFlowFromAgentData(
      hierarchy.agent,
      hierarchy.upline,
      hierarchy.downline,
      VIOLET_THEME,
    );
  }, [hierarchy]);

  const layouted = useMemo(
    () => getLayoutedElements(nodes, edges, null),
    [nodes, edges],
  );

  // Compute dynamic height based on tree depth
  const nodeCount = layouted.nodes.length;
  const flowHeight = Math.max(400, Math.min(700, nodeCount * 160 + 100));

  // Stats from hierarchy data
  const agent = hierarchy?.agent;
  const uplineCount = hierarchy?.upline?.length || 0;
  const downlineCount = hierarchy?.downline?.length || 0;

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
        <AgentPageHero
          icon={Network}
          title="My Hierarchy"
          subtitle="Your position in the agency tree — contract levels & override spreads"
        >
          {agent && (
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {uplineCount + downlineCount} Connected
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

        {/* Stat Cards */}
        {agent && (
          <motion.section variants={fadeInUp}>
            <AgentStatCardGrid>
              <AgentStatCard
                icon={Crown}
                label="Contract Level"
                value={agent.contractLevel != null ? `${agent.contractLevel}%` : 'N/A'}
              />
              <AgentStatCard
                icon={Layers}
                label="Upline Chain"
                value={uplineCount}
              />
              <AgentStatCard
                icon={Users}
                label="Downline"
                value={downlineCount}
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
        <motion.div variants={fadeInUp} className="px-1">
          <HierarchyFlow
            nodes={layouted.nodes}
            edges={layouted.edges}
            theme={VIOLET_THEME}
            isLoading={isLoading && !apiData}
            isEmpty={!hierarchy}
            emptyTitle="Not in a hierarchy yet"
            emptySubtitle="Your position hasn't been set up by your manager."
            height={flowHeight}
          />
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
