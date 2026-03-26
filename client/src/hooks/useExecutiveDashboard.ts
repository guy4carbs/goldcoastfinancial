import { useQuery } from "@tanstack/react-query";

export interface ExecutiveDashboardData {
  orgMetrics: {
    totalRevenue: number;
    revenueGrowth: number;
    pipelineValue: number;
    pipelineGrowth: number;
    activeAgents: number;
    newAgentsThisMonth: number;
    conversionRate: number;
    conversionTarget: number;
    retentionRate: number;
    retentionTarget: number;
    avgDealSize: number;
    quarterlyTarget: number;
    quarterlyActual: number;
    quarterlyProgress: number;
  };
  teams: Array<{
    id: string;
    name: string;
    manager: string;
    agents: number;
    revenue: number;
    pipeline: number;
    conversion: number;
    status: 'on-track' | 'at-risk' | 'behind';
  }>;
  topPerformers: Array<{
    id: string;
    name: string;
    role: string;
    team: string;
    revenue: number;
    deals: number;
    trend: 'up' | 'down';
  }>;
  revenueByProduct: Array<{
    product: string;
    revenue: number;
    percentage: number;
    color: string;
  }>;
  salesVelocity: {
    avgDaysToClose: number;
    winRate: number;
    avgDealSize: number;
    dealsPerDay: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    time: string;
    team: string;
  }>;
  compliance: {
    validLicenses: number;
    expiringSoon: number;
    expired: number;
    totalLicenses: number;
  };
  agentStatuses: Array<{
    id: string;
    name: string;
    status: 'active' | 'idle' | 'offline';
  }>;
  quarterlyGoals: Array<{
    label: string;
    current: number;
    target: number;
    progress: number;
  }>;
}

export function useExecutiveDashboard() {
  return useQuery<ExecutiveDashboardData>({
    queryKey: ['/api/executive/dashboard'],
    staleTime: 60_000,
    retry: 1,
  });
}
