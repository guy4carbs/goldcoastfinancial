/**
 * AgentHierarchy — Visual tree view powered by React Flow
 * Heritage Lounge Design System — Violet Theme
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Network, Users, Crown, TrendingUp, Layers } from 'lucide-react';
import { AgentLoungeLayout } from '@/components/agent/AgentLoungeLayout';
import { AgentPageHero } from '@/components/agent/primitives';
import { AgentStatCard, AgentStatCardGrid } from '@/components/agent/primitives';
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
// DEMO DATA
// =============================================================================

const DEMO_HIERARCHY: HierarchyData = {
  agent: {
    id: 'you-001', name: 'John Smith', email: 'john.smith@heritagels.org',
    phone: '(555) 123-4567', role: 'sales_agent', level: 4, title: 'Senior Agent',
    contractLevel: 90, ytdCommission: 85000, policiesSold: 47, teamSize: 3,
    conversionRate: 24, avatarUrl: null,
  },
  upline: [
    {
      id: 'upline-1', name: 'Marcus Johnson', email: 'marcus.johnson@heritagels.org',
      phone: '(555) 234-5678', role: 'manager', level: 3, title: 'Team Lead',
      contractLevel: 100, ytdCommission: 180000, policiesSold: 89, teamSize: 12,
      conversionRate: 28, avatarUrl: null,
    },
    {
      id: 'upline-2', name: 'Sarah Williams', email: 'sarah.williams@heritagels.org',
      phone: '(555) 345-6789', role: 'manager', level: 2, title: 'Regional Director',
      contractLevel: 110, ytdCommission: 450000, policiesSold: 234, teamSize: 48,
      conversionRate: 26, avatarUrl: null,
    },
    {
      id: 'upline-3', name: 'Jack Thompson', email: 'jack.thompson@heritagels.org',
      phone: '(555) 456-7890', role: 'owner', level: 0, title: 'Agency Owner',
      contractLevel: 120, ytdCommission: 1200000, policiesSold: 567, teamSize: 150,
      conversionRate: 25, avatarUrl: null,
    },
  ],
  downline: [
    {
      id: 'downline-1', name: 'Emily Chen', email: 'emily.chen@heritagels.org',
      phone: '(555) 567-8901', role: 'sales_agent', level: 5, title: 'Agent',
      contractLevel: 80, ytdCommission: 42000, policiesSold: 23, teamSize: 0,
      conversionRate: 22, avatarUrl: null,
    },
    {
      id: 'downline-2', name: 'Michael Brown', email: 'michael.brown@heritagels.org',
      phone: '(555) 678-9012', role: 'sales_agent', level: 5, title: 'Agent',
      contractLevel: 80, ytdCommission: 38000, policiesSold: 19, teamSize: 0,
      conversionRate: 20, avatarUrl: null,
    },
    {
      id: 'downline-3', name: 'Jessica Davis', email: 'jessica.davis@heritagels.org',
      phone: '(555) 789-0123', role: 'sales_agent', level: 6, title: 'New Agent',
      contractLevel: 70, ytdCommission: 12000, policiesSold: 8, teamSize: 0,
      conversionRate: 18, avatarUrl: null,
    },
  ],
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function AgentHierarchy() {
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['/api/hierarchy/full'],
    queryFn: fetchHierarchy,
  });

  const hierarchy = apiData || DEMO_HIERARCHY;

  const { nodes, edges } = useMemo(() => {
    if (!hierarchy) return { nodes: [], edges: [] };
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
