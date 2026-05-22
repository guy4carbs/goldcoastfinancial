/**
 * Executive Lounge — Shared Constants & Demo Data
 * Heritage Design System — Orange/Amber theme
 */

import { CSSProperties } from 'react';

// Glass card style (matches GLASS.css.light from heritageDesignSystem)
export const glassCard: CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
};

// Orange → Blood Orange → Gold gradient constants for Executive
export const EXECUTIVE_GRADIENT = 'from-orange-600 via-red-700 to-amber-400';
export const EXECUTIVE_GRADIENT_CSS = 'linear-gradient(135deg, #ea580c 0%, #b91c1c 50%, #fbbf24 100%)';
export const EXECUTIVE_ICON_GRADIENT = 'from-orange-600 to-amber-400';

// ─── DEMO EXECUTIVE METRICS ─────────────────────────
export const DEMO_ORG_METRICS = {
  totalRevenue: 1875000,
  revenueGrowth: 34,
  pipelineValue: 4800000,
  pipelineGrowth: 28,
  activeAgents: 61,
  newAgentsThisMonth: 8,
  conversionRate: 22.6,
  conversionTarget: 25,
  retentionRate: 96,
  retentionTarget: 97,
  avgDealSize: 18400,
  quarterlyTarget: 2200000,
  quarterlyActual: 1875000,
  quarterlyProgress: 85,
};

// Top performers for executive view
export const DEMO_TOP_PERFORMERS = [
  { id: '1', name: 'Sarah Johnson', role: 'Senior Agent', team: 'Alpha', revenue: 127500, deals: 18, trend: 'up' as const },
  { id: '7', name: 'Rachel Green', role: 'Senior Agent', team: 'Alpha', revenue: 118200, deals: 16, trend: 'up' as const },
  { id: '2', name: 'Mike Chen', role: 'Agent', team: 'Beta', revenue: 104800, deals: 14, trend: 'up' as const },
  { id: '11', name: 'Jessica Lee', role: 'Agent', team: 'Delta', revenue: 98600, deals: 13, trend: 'up' as const },
  { id: '6', name: 'David Brown', role: 'Agent', team: 'Gamma', revenue: 91300, deals: 12, trend: 'up' as const },
];

// Team breakdown for executive view
export const DEMO_TEAMS = [
  { id: 'alpha', name: 'Team Alpha', manager: 'Marcus Rivera', agents: 16, revenue: 542000, pipeline: 1280000, conversion: 24.8, status: 'on-track' as const },
  { id: 'beta', name: 'Team Beta', manager: 'Jennifer Walsh', agents: 14, revenue: 478000, pipeline: 1150000, conversion: 21.3, status: 'on-track' as const },
  { id: 'gamma', name: 'Team Gamma', manager: 'Kevin Park', agents: 12, revenue: 385000, pipeline: 980000, conversion: 22.1, status: 'on-track' as const },
  { id: 'delta', name: 'Team Delta', manager: 'Natasha Romero', agents: 11, revenue: 298000, pipeline: 820000, conversion: 19.4, status: 'at-risk' as const },
  { id: 'echo', name: 'Team Echo', manager: 'Brandon Mills', agents: 8, revenue: 172000, pipeline: 570000, conversion: 16.8, status: 'behind' as const },
];

// Revenue by product line
export const DEMO_REVENUE_BY_PRODUCT = [
  { product: 'IUL', revenue: 618000, percentage: 33, color: '#ea580c' },
  { product: 'Whole Life', revenue: 431000, percentage: 23, color: '#b91c1c' },
  { product: 'Term Life', revenue: 356000, percentage: 19, color: '#f59e0b' },
  { product: 'Annuity', revenue: 263000, percentage: 14, color: '#f97316' },
  { product: 'Final Expense', revenue: 207000, percentage: 11, color: '#dc2626' },
];

// Recent activity for executive feed
export const DEMO_EXECUTIVE_ACTIVITY = [
  { id: '1', type: 'deal' as const, message: 'Sarah Johnson closed $24,600 IUL policy', time: '12 min ago', team: 'Alpha' },
  { id: '2', type: 'hire' as const, message: '3 new agents onboarded to Team Echo', time: '2 hrs ago', team: 'Echo' },
  { id: '3', type: 'milestone' as const, message: 'Team Alpha crossed $500K quarterly revenue', time: '4 hrs ago', team: 'Alpha' },
  { id: '4', type: 'alert' as const, message: 'Team Echo conversion rate dropped below 17%', time: '6 hrs ago', team: 'Echo' },
  { id: '5', type: 'deal' as const, message: 'Mike Chen closed $31,200 Annuity policy', time: '8 hrs ago', team: 'Beta' },
];

// Quarterly goals
export const DEMO_QUARTERLY_GOALS = [
  { label: 'Revenue', current: 1875000, target: 2200000, progress: 85 },
  { label: 'New Policies', current: 412, target: 500, progress: 82 },
  { label: 'Agent Hiring', current: 8, target: 12, progress: 67 },
  { label: 'Retention Rate', current: 96, target: 97, progress: 99 },
];

// Status color mappings
export const TEAM_STATUS_COLORS = {
  'on-track': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'at-risk': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'behind': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
} as const;

// ─── CURRENCY FORMATTER ─────────────────────────────
export function fmtCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(val >= 100_000 ? 0 : 1)}K`;
  return `$${val.toLocaleString()}`;
}

// ─── MONTHLY REVENUE (12 months: Oct 2025 – Sep 2026) ─────────────
export const DEMO_EXEC_REVENUE_MONTHLY = [
  { month: 'Oct 2025', actual: 122000, target: 130000, forecast: 122000 },
  { month: 'Nov 2025', actual: 138000, target: 140000, forecast: 138000 },
  { month: 'Dec 2025', actual: 115000, target: 145000, forecast: 115000 },
  { month: 'Jan 2026', actual: 164000, target: 155000, forecast: 164000 },
  { month: 'Feb 2026', actual: 189000, target: 165000, forecast: 189000 },
  { month: 'Mar 2026', actual: 210000, target: 175000, forecast: 210000 },
  { month: 'Apr 2026', actual: 0, target: 190000, forecast: 228000 },
  { month: 'May 2026', actual: 0, target: 205000, forecast: 248000 },
  { month: 'Jun 2026', actual: 0, target: 220000, forecast: 265000 },
  { month: 'Jul 2026', actual: 0, target: 235000, forecast: 278000 },
  { month: 'Aug 2026', actual: 0, target: 250000, forecast: 295000 },
  { month: 'Sep 2026', actual: 0, target: 265000, forecast: 312000 },
] as const;

// ─── FORECAST SCENARIOS ─────────────────────────────
export const DEMO_EXEC_SCENARIOS = [
  { id: 'best', label: 'Best Case', value: 3500000, probability: 20, color: '#f59e0b' },
  { id: 'likely', label: 'Most Likely', value: 2800000, probability: 60, color: '#ea580c' },
  { id: 'worst', label: 'Worst Case', value: 2200000, probability: 20, color: '#b91c1c' },
] as const;

// ─── COMMISSION WATERFALL HIERARCHY ─────────────────
export const DEMO_EXEC_COMMISSION_TIERS = [
  { level: 'Owner', name: 'Heritage Life Solutions', contractLevel: 120, role: 'owner' as const },
  { level: 'Manager', name: 'Marcus Rivera', contractLevel: 105, team: 'Alpha', role: 'manager' as const },
  { level: 'Manager', name: 'Jennifer Walsh', contractLevel: 100, team: 'Beta', role: 'manager' as const },
  { level: 'Manager', name: 'Kevin Park', contractLevel: 98, team: 'Gamma', role: 'manager' as const },
  { level: 'Manager', name: 'Natasha Romero', contractLevel: 95, team: 'Delta', role: 'manager' as const },
  { level: 'Manager', name: 'Brandon Mills', contractLevel: 95, team: 'Echo', role: 'manager' as const },
] as const;

// ─── COMMISSION SUMMARY ─────────────────────────────
export const DEMO_EXEC_COMMISSION_SUMMARY = {
  totalPending: 184000,
  paidYTD: 1420000,
  overrideEarnings: 312000,
  chargebackRate: 2.1,
  chargebackTotal: 29800,
  avgCommissionRate: 92,
} as const;

// ─── PAYOUTS ────────────────────────────────────────
export const DEMO_EXEC_PAYOUTS = [
  { id: 'pay-001', date: '2026-03-01', amount: 195200, agentCount: 61, status: 'paid' as const },
  { id: 'pay-002', date: '2026-02-01', amount: 187400, agentCount: 61, status: 'paid' as const },
  { id: 'pay-003', date: '2026-01-01', amount: 178600, agentCount: 61, status: 'paid' as const },
  { id: 'pay-004', date: '2026-04-01', amount: 201000, agentCount: 61, status: 'processing' as const },
  { id: 'pay-005', date: '2026-05-01', amount: 210000, agentCount: 61, status: 'upcoming' as const },
  { id: 'pay-006', date: '2026-06-01', amount: 218000, agentCount: 61, status: 'upcoming' as const },
] as const;

// ─── PIPELINE STAGES ────────────────────────────────
export const DEMO_EXEC_PIPELINE_STAGES = [
  { stage: 'New Leads', count: 420, value: 2100000, color: '#fdba74', conversionRate: 67.9 },
  { stage: 'Contacted', count: 285, value: 1600000, color: '#f97316', conversionRate: 63.2 },
  { stage: 'Qualified', count: 180, value: 1200000, color: '#ea580c', conversionRate: 52.8 },
  { stage: 'Proposal', count: 95, value: 840000, color: '#c2410c', conversionRate: 44.2 },
  { stage: 'Negotiation', count: 42, value: 480000, color: '#b91c1c', conversionRate: 61.9 },
  { stage: 'Closed Won', count: 68, value: 1870000, color: '#dc2626', conversionRate: 100 },
] as const;

// ─── SALES VELOCITY ─────────────────────────────────
export const DEMO_EXEC_SALES_VELOCITY = {
  avgDaysToClose: 18,
  winRate: 22.6,
  avgDealSize: 18400,
  dealsPerDay: 3.2,
  revenuePerDay: 19800,
} as const;

// ─── RECRUITING FUNNEL ──────────────────────────────
export const DEMO_EXEC_RECRUITING_FUNNEL = [
  { stage: 'Prospect', count: 120, color: '#fdba74' },
  { stage: 'Contacted', count: 85, color: '#fb923c' },
  { stage: 'Applied', count: 48, color: '#f97316' },
  { stage: 'Interviewing', count: 22, color: '#ea580c' },
  { stage: 'Offer', count: 12, color: '#c2410c' },
  { stage: 'Onboarding', count: 8, color: '#b91c1c' },
] as const;

// ─── CANDIDATES ─────────────────────────────────────
export const DEMO_EXEC_CANDIDATES = [
  { id: 'cand-01', name: 'Anthony Reeves', source: 'referral' as const, stage: 'Onboarding', daysInStage: 3, assignedManager: 'Marcus Rivera', team: 'Alpha' },
  { id: 'cand-02', name: 'Lisa Tran', source: 'job_board' as const, stage: 'Onboarding', daysInStage: 5, assignedManager: 'Jennifer Walsh', team: 'Beta' },
  { id: 'cand-03', name: 'Derek Washington', source: 'referral' as const, stage: 'Offer', daysInStage: 2, assignedManager: 'Kevin Park', team: 'Gamma' },
  { id: 'cand-04', name: 'Maria Santos', source: 'event' as const, stage: 'Offer', daysInStage: 4, assignedManager: 'Natasha Romero', team: 'Delta' },
  { id: 'cand-05', name: 'James Liu', source: 'social' as const, stage: 'Interviewing', daysInStage: 6, assignedManager: 'Brandon Mills', team: 'Echo' },
  { id: 'cand-06', name: 'Priya Patel', source: 'referral' as const, stage: 'Interviewing', daysInStage: 3, assignedManager: 'Marcus Rivera', team: 'Alpha' },
  { id: 'cand-07', name: 'Carlos Mendez', source: 'job_board' as const, stage: 'Applied', daysInStage: 8, assignedManager: 'Jennifer Walsh', team: 'Beta' },
  { id: 'cand-08', name: 'Samantha Brooks', source: 'event' as const, stage: 'Applied', daysInStage: 5, assignedManager: 'Kevin Park', team: 'Gamma' },
  { id: 'cand-09', name: 'Tyler Robinson', source: 'social' as const, stage: 'Contacted', daysInStage: 10, assignedManager: 'Natasha Romero', team: 'Delta' },
  { id: 'cand-10', name: 'Megan Foster', source: 'referral' as const, stage: 'Contacted', daysInStage: 7, assignedManager: 'Brandon Mills', team: 'Echo' },
  { id: 'cand-11', name: 'Ryan O\'Brien', source: 'job_board' as const, stage: 'Prospect', daysInStage: 12, assignedManager: 'Marcus Rivera', team: 'Alpha' },
  { id: 'cand-12', name: 'Aisha Kamara', source: 'event' as const, stage: 'Prospect', daysInStage: 4, assignedManager: 'Jennifer Walsh', team: 'Beta' },
] as const;

// ─── AGENT ROSTER (20 representative agents) ────────
export const DEMO_EXEC_AGENT_ROSTER = [
  { id: 'ag-01', name: 'Sarah Johnson', team: 'Alpha', manager: 'Marcus Rivera', status: 'active' as const, contractLevel: 100, quotaAttainment: 125, revenueMTD: 42800, complianceScore: 98, startDate: '2023-06-15', role: 'Senior Agent' as const },
  { id: 'ag-02', name: 'Rachel Green', team: 'Alpha', manager: 'Marcus Rivera', status: 'active' as const, contractLevel: 95, quotaAttainment: 118, revenueMTD: 39400, complianceScore: 96, startDate: '2023-09-01', role: 'Senior Agent' as const },
  { id: 'ag-03', name: 'Tom Bradley', team: 'Alpha', manager: 'Marcus Rivera', status: 'active' as const, contractLevel: 90, quotaAttainment: 105, revenueMTD: 31200, complianceScore: 94, startDate: '2024-01-10', role: 'Agent' as const },
  { id: 'ag-04', name: 'Mike Chen', team: 'Beta', manager: 'Jennifer Walsh', status: 'active' as const, contractLevel: 100, quotaAttainment: 122, revenueMTD: 38600, complianceScore: 97, startDate: '2023-04-20', role: 'Senior Agent' as const },
  { id: 'ag-05', name: 'Amanda Torres', team: 'Beta', manager: 'Jennifer Walsh', status: 'active' as const, contractLevel: 90, quotaAttainment: 98, revenueMTD: 28400, complianceScore: 95, startDate: '2024-03-15', role: 'Agent' as const },
  { id: 'ag-06', name: 'David Brown', team: 'Gamma', manager: 'Kevin Park', status: 'active' as const, contractLevel: 95, quotaAttainment: 110, revenueMTD: 34200, complianceScore: 92, startDate: '2023-11-01', role: 'Senior Agent' as const },
  { id: 'ag-07', name: 'Karen Mitchell', team: 'Gamma', manager: 'Kevin Park', status: 'on-leave' as const, contractLevel: 85, quotaAttainment: 72, revenueMTD: 8200, complianceScore: 91, startDate: '2024-02-28', role: 'Agent' as const },
  { id: 'ag-08', name: 'Jessica Lee', team: 'Delta', manager: 'Natasha Romero', status: 'active' as const, contractLevel: 90, quotaAttainment: 115, revenueMTD: 35800, complianceScore: 99, startDate: '2023-08-10', role: 'Senior Agent' as const },
  { id: 'ag-09', name: 'Robert Kim', team: 'Delta', manager: 'Natasha Romero', status: 'active' as const, contractLevel: 85, quotaAttainment: 92, revenueMTD: 24600, complianceScore: 88, startDate: '2024-05-01', role: 'Agent' as const },
  { id: 'ag-10', name: 'Chris Taylor', team: 'Echo', manager: 'Brandon Mills', status: 'active' as const, contractLevel: 88, quotaAttainment: 86, revenueMTD: 21500, complianceScore: 93, startDate: '2024-06-15', role: 'Agent' as const },
  { id: 'ag-11', name: 'Denise Watts', team: 'Alpha', manager: 'Marcus Rivera', status: 'active' as const, contractLevel: 85, quotaAttainment: 95, revenueMTD: 26800, complianceScore: 97, startDate: '2024-04-01', role: 'Agent' as const },
  { id: 'ag-12', name: 'Victor Nguyen', team: 'Beta', manager: 'Jennifer Walsh', status: 'active' as const, contractLevel: 80, quotaAttainment: 88, revenueMTD: 22100, complianceScore: 90, startDate: '2024-08-20', role: 'Junior Agent' as const },
  { id: 'ag-13', name: 'Laura Campbell', team: 'Gamma', manager: 'Kevin Park', status: 'probation' as const, contractLevel: 75, quotaAttainment: 54, revenueMTD: 9800, complianceScore: 78, startDate: '2025-01-15', role: 'Junior Agent' as const },
  { id: 'ag-14', name: 'Marcus Hall', team: 'Delta', manager: 'Natasha Romero', status: 'active' as const, contractLevel: 82, quotaAttainment: 76, revenueMTD: 18400, complianceScore: 86, startDate: '2024-09-10', role: 'Agent' as const },
  { id: 'ag-15', name: 'Amy Richardson', team: 'Echo', manager: 'Brandon Mills', status: 'active' as const, contractLevel: 78, quotaAttainment: 68, revenueMTD: 14200, complianceScore: 89, startDate: '2024-11-01', role: 'Junior Agent' as const },
  { id: 'ag-16', name: 'Jason Park', team: 'Alpha', manager: 'Marcus Rivera', status: 'active' as const, contractLevel: 105, quotaAttainment: 112, revenueMTD: 44500, complianceScore: 100, startDate: '2022-12-01', role: 'Senior Agent' as const },
  { id: 'ag-17', name: 'Nicole Harris', team: 'Beta', manager: 'Jennifer Walsh', status: 'active' as const, contractLevel: 92, quotaAttainment: 104, revenueMTD: 30100, complianceScore: 95, startDate: '2023-10-15', role: 'Agent' as const },
  { id: 'ag-18', name: 'Brian Sullivan', team: 'Echo', manager: 'Brandon Mills', status: 'probation' as const, contractLevel: 70, quotaAttainment: 50, revenueMTD: 5200, complianceScore: 75, startDate: '2025-09-01', role: 'Junior Agent' as const },
  { id: 'ag-19', name: 'Stephanie Cruz', team: 'Gamma', manager: 'Kevin Park', status: 'active' as const, contractLevel: 88, quotaAttainment: 99, revenueMTD: 27600, complianceScore: 93, startDate: '2024-01-20', role: 'Agent' as const },
  { id: 'ag-20', name: 'Daniel Foster', team: 'Delta', manager: 'Natasha Romero', status: 'active' as const, contractLevel: 83, quotaAttainment: 81, revenueMTD: 19800, complianceScore: 87, startDate: '2024-07-15', role: 'Agent' as const },
] as const;

// ─── HIERARCHY TREE (nested waterfall structure) ────
export const DEMO_EXEC_HIERARCHY_TREE = {
  name: 'Heritage Life Solutions',
  role: 'Owner' as const,
  contractLevel: 120,
  children: [
    {
      name: 'Marcus Rivera',
      role: 'Manager' as const,
      contractLevel: 105,
      team: 'Alpha',
      agents: 16,
      revenue: 542000,
      children: [
        { name: 'Sarah Johnson', role: 'Senior Agent' as const, contractLevel: 100, revenue: 127500 },
        { name: 'Rachel Green', role: 'Senior Agent' as const, contractLevel: 95, revenue: 118200 },
        { name: 'Jason Park', role: 'Senior Agent' as const, contractLevel: 105, revenue: 108400 },
        { name: 'Tom Bradley', role: 'Agent' as const, contractLevel: 90, revenue: 85600 },
        { name: 'Denise Watts', role: 'Agent' as const, contractLevel: 85, revenue: 72300 },
      ],
    },
    {
      name: 'Jennifer Walsh',
      role: 'Manager' as const,
      contractLevel: 100,
      team: 'Beta',
      agents: 14,
      revenue: 478000,
      children: [
        { name: 'Mike Chen', role: 'Senior Agent' as const, contractLevel: 100, revenue: 104800 },
        { name: 'Nicole Harris', role: 'Agent' as const, contractLevel: 92, revenue: 89200 },
        { name: 'Amanda Torres', role: 'Agent' as const, contractLevel: 90, revenue: 76400 },
        { name: 'Victor Nguyen', role: 'Junior Agent' as const, contractLevel: 80, revenue: 52100 },
      ],
    },
    {
      name: 'Kevin Park',
      role: 'Manager' as const,
      contractLevel: 98,
      team: 'Gamma',
      agents: 12,
      revenue: 385000,
      children: [
        { name: 'David Brown', role: 'Senior Agent' as const, contractLevel: 95, revenue: 91300 },
        { name: 'Stephanie Cruz', role: 'Agent' as const, contractLevel: 88, revenue: 74800 },
        { name: 'Laura Campbell', role: 'Junior Agent' as const, contractLevel: 75, revenue: 32400 },
      ],
    },
    {
      name: 'Natasha Romero',
      role: 'Manager' as const,
      contractLevel: 95,
      team: 'Delta',
      agents: 11,
      revenue: 298000,
      children: [
        { name: 'Jessica Lee', role: 'Senior Agent' as const, contractLevel: 90, revenue: 98600 },
        { name: 'Robert Kim', role: 'Agent' as const, contractLevel: 85, revenue: 68200 },
        { name: 'Marcus Hall', role: 'Agent' as const, contractLevel: 82, revenue: 54800 },
      ],
    },
    {
      name: 'Brandon Mills',
      role: 'Manager' as const,
      contractLevel: 95,
      team: 'Echo',
      agents: 8,
      revenue: 172000,
      children: [
        { name: 'Chris Taylor', role: 'Agent' as const, contractLevel: 88, revenue: 58200 },
        { name: 'Amy Richardson', role: 'Junior Agent' as const, contractLevel: 78, revenue: 38600 },
        { name: 'Brian Sullivan', role: 'Junior Agent' as const, contractLevel: 70, revenue: 18400 },
      ],
    },
  ],
} as const;

// ─── GROWTH METRICS ─────────────────────────────────
export const DEMO_EXEC_GROWTH_METRICS = {
  momRevenue: 8.2,
  qoqRevenue: 34,
  yoyRevenue: 67,
  momAgents: 2.1,
  qoqAgents: 15,
  yoyAgents: 24,
  momPolicies: 5.4,
  qoqPolicies: 28,
} as const;

// ─── MONTHLY TRENDS (12 months: Oct 2025 – Sep 2026) ─────────────
export const DEMO_EXEC_MONTHLY_TRENDS = [
  { month: 'Oct 2025', revenue: 122000, agents: 48, policies: 62, pipeline: 3200000 },
  { month: 'Nov 2025', revenue: 138000, agents: 49, policies: 68, pipeline: 3400000 },
  { month: 'Dec 2025', revenue: 115000, agents: 50, policies: 55, pipeline: 3100000 },
  { month: 'Jan 2026', revenue: 164000, agents: 53, policies: 74, pipeline: 3800000 },
  { month: 'Feb 2026', revenue: 189000, agents: 57, policies: 82, pipeline: 4200000 },
  { month: 'Mar 2026', revenue: 210000, agents: 61, policies: 91, pipeline: 4800000 },
  { month: 'Apr 2026', revenue: 228000, agents: 63, policies: 96, pipeline: 5100000 },
  { month: 'May 2026', revenue: 248000, agents: 65, policies: 104, pipeline: 5400000 },
  { month: 'Jun 2026', revenue: 265000, agents: 67, policies: 110, pipeline: 5700000 },
  { month: 'Jul 2026', revenue: 278000, agents: 68, policies: 115, pipeline: 5900000 },
  { month: 'Aug 2026', revenue: 295000, agents: 70, policies: 122, pipeline: 6200000 },
  { month: 'Sep 2026', revenue: 312000, agents: 72, policies: 128, pipeline: 6500000 },
] as const;

// ─── LICENSING ──────────────────────────────────────
export const DEMO_EXEC_LICENSING = {
  current: 52,
  expiring: 6,
  expired: 3,
  totalStates: 12,
} as const;

// ─── COMPLIANCE BY TEAM ─────────────────────────────
export const DEMO_EXEC_COMPLIANCE = [
  { team: 'Alpha', score: 97, auditStatus: 'passed' as const, eAndO: 'current' as const, lastAudit: '2026-02-15' },
  { team: 'Beta', score: 95, auditStatus: 'passed' as const, eAndO: 'current' as const, lastAudit: '2026-02-10' },
  { team: 'Gamma', score: 91, auditStatus: 'pending' as const, eAndO: 'current' as const, lastAudit: '2025-12-20' },
  { team: 'Delta', score: 88, auditStatus: 'review' as const, eAndO: 'expiring' as const, lastAudit: '2025-11-15' },
  { team: 'Echo', score: 85, auditStatus: 'pending' as const, eAndO: 'current' as const, lastAudit: '2026-01-05' },
] as const;

// ─── CARRIER CONTRACTS ──────────────────────────────
export const DEMO_EXEC_CARRIERS = [
  { name: 'Nationwide', contractType: 'Term / Whole Life', baseRate: 90, overrideRate: 12, renewalDate: '2026-12-15', status: 'active' as const },
  { name: 'Transamerica', contractType: 'Final Expense / Term', baseRate: 85, overrideRate: 11, renewalDate: '2026-08-15', status: 'active' as const },
  { name: 'North American', contractType: 'IUL / Annuity', baseRate: 90, overrideRate: 13, renewalDate: '2027-01-01', status: 'pending' as const },
] as const;

// ─── REPORT TEMPLATES ───────────────────────────────
export const DEMO_EXEC_REPORT_TEMPLATES = [
  { id: 'rpt-01', name: 'Agency Performance Summary', category: 'performance' as const, description: 'High-level overview of agency KPIs, revenue, and agent productivity', icon: 'BarChart3' },
  { id: 'rpt-02', name: 'Team Comparison Report', category: 'performance' as const, description: 'Side-by-side comparison of all team metrics and rankings', icon: 'GitCompare' },
  { id: 'rpt-03', name: 'Commission Statement', category: 'financial' as const, description: 'Detailed commission breakdown by agent, tier, and product line', icon: 'DollarSign' },
  { id: 'rpt-04', name: 'Override Earnings Report', category: 'financial' as const, description: 'Waterfall override calculations across the hierarchy', icon: 'Layers' },
  { id: 'rpt-05', name: 'Chargeback Analysis', category: 'financial' as const, description: 'Chargeback trends, rates, and impact by agent and carrier', icon: 'ArrowDownUp' },
  { id: 'rpt-06', name: 'Pipeline Health Report', category: 'pipeline' as const, description: 'Funnel analysis with conversion rates and velocity metrics', icon: 'Filter' },
  { id: 'rpt-07', name: 'Sales Forecast', category: 'pipeline' as const, description: 'Projected revenue across best/likely/worst scenarios', icon: 'TrendingUp' },
  { id: 'rpt-08', name: 'Compliance Audit Report', category: 'compliance' as const, description: 'Licensing status, E&O coverage, and audit findings by team', icon: 'ShieldCheck' },
  { id: 'rpt-09', name: 'Licensing Expiration Report', category: 'compliance' as const, description: 'Upcoming license expirations and renewal requirements', icon: 'Clock' },
  { id: 'rpt-10', name: 'Executive Dashboard Export', category: 'executive' as const, description: 'Full executive summary with charts and commentary', icon: 'LayoutDashboard' },
  { id: 'rpt-11', name: 'Board Presentation Pack', category: 'executive' as const, description: 'Quarterly board deck with financials, growth, and strategy', icon: 'Presentation' },
  { id: 'rpt-12', name: 'Recruiting Pipeline Report', category: 'recruiting' as const, description: 'Candidate funnel, source effectiveness, and onboarding metrics', icon: 'UserPlus' },
  { id: 'rpt-13', name: 'Agent Retention Analysis', category: 'recruiting' as const, description: 'Cohort retention rates, attrition drivers, and tenure analysis', icon: 'UserCheck' },
  { id: 'rpt-14', name: 'Carrier Contract Summary', category: 'financial' as const, description: 'Active carrier contracts, rates, and renewal calendar', icon: 'FileText' },
] as const;

// ─── COHORT DATA (quarterly) ────────────────────────
export const DEMO_EXEC_COHORT_DATA = [
  { cohort: 'Q1 2025' as const, agentsHired: 14, retained: 12, avgRevenue: 68000, retentionRate: 85.7 },
  { cohort: 'Q2 2025' as const, agentsHired: 10, retained: 9, avgRevenue: 54000, retentionRate: 90.0 },
  { cohort: 'Q3 2025' as const, agentsHired: 12, retained: 11, avgRevenue: 42000, retentionRate: 91.7 },
  { cohort: 'Q4 2025' as const, agentsHired: 16, retained: 15, avgRevenue: 28000, retentionRate: 93.8 },
] as const;

// ─── STATUS / COLOR MAPS (reusable) ─────────────────

export const AGENT_STATUS_COLORS = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'on-leave': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  probation: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
} as const;

export const PIPELINE_STAGE_COLORS: Record<string, string> = {
  'New Leads': '#fdba74',
  'Contacted': '#f97316',
  'Qualified': '#ea580c',
  'Proposal': '#c2410c',
  'Negotiation': '#b91c1c',
  'Closed Won': '#dc2626',
};

export const LICENSE_STATUS_COLORS = {
  current: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  expiring: { bg: 'bg-amber-50', text: 'text-amber-700' },
  expired: { bg: 'bg-red-50', text: 'text-red-700' },
} as const;

// ─── LOUNGE ACCESS CONTROL ────────────────────────────

export const LOUNGES = [
  { key: 'agent_portal', name: 'Agent Portal', description: 'Agent tools, training, and client management', roles: ['sales_agent', 'manager', 'owner', 'system_admin'] },
  { key: 'manager_lounge', name: 'Manager Lounge', description: 'Team management, coaching, and reporting', roles: ['manager', 'owner', 'system_admin'] },
  { key: 'executive_lounge', name: 'Executive Lounge', description: 'Agency oversight, KPIs, and strategic planning', roles: ['owner', 'system_admin', 'investor'] },
  { key: 'crm_lounge', name: 'CRM Lounge', description: 'Contacts, pipeline, and deal management', roles: ['sales_agent', 'manager', 'owner', 'system_admin', 'marketing_staff'] },
  { key: 'ai_lounge', name: 'AI Lounge', description: 'AI assistants, avatar council, and automation', roles: ['owner', 'system_admin'] },
  { key: 'marketing_lounge', name: 'Marketing', description: 'Campaigns, content, and lead generation', roles: ['marketing_staff', 'owner', 'system_admin'] },
  { key: 'admin_panel', name: 'Admin Panel', description: 'System settings and administration', roles: ['owner', 'system_admin'] },
  { key: 'client_lounge', name: 'Client Lounge', description: 'Client portal — policies, documents, billing, and claims', roles: ['client', 'owner', 'system_admin'] },
  { key: 'onboarding_lounge', name: 'Onboarding', description: 'New agent onboarding and license setup', roles: ['sales_agent', 'manager', 'owner', 'system_admin'] },
] as const;

export const ROLE_DISPLAY: Record<string, { label: string; level: number; color: string }> = {
  owner: { label: 'Owner', level: 0, color: '#ea580c' },
  system_admin: { label: 'System Admin', level: 1, color: '#b91c1c' },
  manager: { label: 'Manager', level: 3, color: '#f59e0b' },
  sales_agent: { label: 'Agent', level: 5, color: '#3b82f6' },
  marketing_staff: { label: 'Marketing', level: 4, color: '#8b5cf6' },
  investor: { label: 'Investor', level: 1, color: '#10b981' },
  client: { label: 'Client', level: 7, color: '#94a3b8' },
};

export const ACTION_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  registration_approved: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  registration_rejected: { bg: 'bg-red-50', text: 'text-red-700' },
  promoted: { bg: 'bg-orange-50', text: 'text-orange-700' },
  demoted: { bg: 'bg-amber-50', text: 'text-amber-700' },
  role_changed: { bg: 'bg-blue-50', text: 'text-blue-700' },
  account_activated: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  account_deactivated: { bg: 'bg-stone-50', text: 'text-stone-700' },
  onboarding_completed: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  lounge_access_changed: { bg: 'bg-blue-50', text: 'text-blue-700' },
  onboarding_started: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
};

// ─── AGENCY BOOK OF BUSINESS ──────────────────────────

// Type interfaces
export interface BookTeam {
  id: string;
  name: string;
  manager: string;
  agents: number;
  totalClients: number;
  totalPolicies: number;
  totalPremium: number;
  renewalRate: number;
  avgPolicyValue: number;
  status: 'on-track' | 'at-risk' | 'behind';
}

export interface BookAgent {
  id: string;
  name: string;
  team: string;
  role: 'Senior Agent' | 'Agent' | 'Junior Agent';
  status: 'active' | 'on-leave' | 'probation';
  clientCount: number;
  policyCount: number;
  totalPremium: number;
  renewalRate: number;
  startDate: string;
}

export interface BookClient {
  id: string;
  agentId: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  policyType: 'IUL' | 'Whole Life' | 'Term Life' | 'Annuity' | 'Final Expense';
  policyNumber: string;
  coverageAmount: number;
  annualPremium: number;
  monthlyPremium: number;
  effectiveDate: string;
  renewalDate: string;
  status: 'active' | 'pending' | 'lapsed' | 'cancelled';
  beneficiaryName: string;
  beneficiaryRelation: string;
  agentNotes: string;
  lastContactDate: string;
  riskClass: 'preferred' | 'standard' | 'substandard';
}

// ─── POLICY STATUS COLORS ─────────────────────────────
export const POLICY_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  lapsed: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

// ─── BOOK OF BUSINESS — TEAMS ─────────────────────────
export const DEMO_BOOK_TEAMS: BookTeam[] = [
  { id: 'alpha', name: 'Team Alpha', manager: 'Marcus Rivera', agents: 16, totalClients: 87, totalPolicies: 124, totalPremium: 3420000, renewalRate: 94.2, avgPolicyValue: 27580, status: 'on-track' },
  { id: 'beta', name: 'Team Beta', manager: 'Jennifer Walsh', agents: 14, totalClients: 72, totalPolicies: 98, totalPremium: 2680000, renewalRate: 91.8, avgPolicyValue: 27346, status: 'on-track' },
  { id: 'gamma', name: 'Team Gamma', manager: 'Kevin Park', agents: 12, totalClients: 58, totalPolicies: 76, totalPremium: 1950000, renewalRate: 89.5, avgPolicyValue: 25657, status: 'on-track' },
  { id: 'delta', name: 'Team Delta', manager: 'Natasha Romero', agents: 11, totalClients: 48, totalPolicies: 62, totalPremium: 1520000, renewalRate: 86.3, avgPolicyValue: 24516, status: 'at-risk' },
  { id: 'echo', name: 'Team Echo', manager: 'Brandon Mills', agents: 8, totalClients: 32, totalPolicies: 41, totalPremium: 890000, renewalRate: 82.1, avgPolicyValue: 21707, status: 'behind' },
];

// ─── BOOK OF BUSINESS — AGENTS (20) ──────────────────
export const DEMO_BOOK_AGENTS: BookAgent[] = [
  // Team Alpha (ag-01, ag-02, ag-03, ag-11, ag-16)
  { id: 'ag-01', name: 'Sarah Johnson', team: 'Alpha', role: 'Senior Agent', status: 'active', clientCount: 8, policyCount: 12, totalPremium: 348000, renewalRate: 96.5, startDate: '2023-06-15' },
  { id: 'ag-02', name: 'Rachel Green', team: 'Alpha', role: 'Senior Agent', status: 'active', clientCount: 7, policyCount: 10, totalPremium: 312000, renewalRate: 95.2, startDate: '2023-09-01' },
  { id: 'ag-03', name: 'Tom Bradley', team: 'Alpha', role: 'Agent', status: 'active', clientCount: 5, policyCount: 7, totalPremium: 218000, renewalRate: 93.1, startDate: '2024-01-10' },
  { id: 'ag-11', name: 'Denise Watts', team: 'Alpha', role: 'Agent', status: 'active', clientCount: 4, policyCount: 6, totalPremium: 186000, renewalRate: 92.8, startDate: '2024-04-01' },
  { id: 'ag-16', name: 'Jason Park', team: 'Alpha', role: 'Senior Agent', status: 'active', clientCount: 7, policyCount: 11, totalPremium: 336000, renewalRate: 97.1, startDate: '2022-12-01' },
  // Team Beta (ag-04, ag-05, ag-12, ag-17)
  { id: 'ag-04', name: 'Mike Chen', team: 'Beta', role: 'Senior Agent', status: 'active', clientCount: 7, policyCount: 10, totalPremium: 296000, renewalRate: 94.8, startDate: '2023-04-20' },
  { id: 'ag-05', name: 'Amanda Torres', team: 'Beta', role: 'Agent', status: 'active', clientCount: 5, policyCount: 7, totalPremium: 198000, renewalRate: 91.4, startDate: '2024-03-15' },
  { id: 'ag-12', name: 'Victor Nguyen', team: 'Beta', role: 'Junior Agent', status: 'active', clientCount: 3, policyCount: 4, totalPremium: 124000, renewalRate: 88.6, startDate: '2024-08-20' },
  { id: 'ag-17', name: 'Nicole Harris', team: 'Beta', role: 'Agent', status: 'active', clientCount: 6, policyCount: 8, totalPremium: 242000, renewalRate: 93.2, startDate: '2023-10-15' },
  // Team Gamma (ag-06, ag-07, ag-13, ag-19)
  { id: 'ag-06', name: 'David Brown', team: 'Gamma', role: 'Senior Agent', status: 'active', clientCount: 6, policyCount: 9, totalPremium: 274000, renewalRate: 92.6, startDate: '2023-11-01' },
  { id: 'ag-07', name: 'Karen Mitchell', team: 'Gamma', role: 'Agent', status: 'on-leave', clientCount: 3, policyCount: 4, totalPremium: 108000, renewalRate: 87.3, startDate: '2024-02-28' },
  { id: 'ag-13', name: 'Laura Campbell', team: 'Gamma', role: 'Junior Agent', status: 'probation', clientCount: 2, policyCount: 3, totalPremium: 72000, renewalRate: 81.5, startDate: '2025-01-15' },
  { id: 'ag-19', name: 'Stephanie Cruz', team: 'Gamma', role: 'Agent', status: 'active', clientCount: 5, policyCount: 7, totalPremium: 196000, renewalRate: 91.8, startDate: '2024-01-20' },
  // Team Delta (ag-08, ag-09, ag-14, ag-20)
  { id: 'ag-08', name: 'Jessica Lee', team: 'Delta', role: 'Senior Agent', status: 'active', clientCount: 6, policyCount: 9, totalPremium: 268000, renewalRate: 93.4, startDate: '2023-08-10' },
  { id: 'ag-09', name: 'Robert Kim', team: 'Delta', role: 'Agent', status: 'active', clientCount: 4, policyCount: 6, totalPremium: 164000, renewalRate: 88.2, startDate: '2024-05-01' },
  { id: 'ag-14', name: 'Marcus Hall', team: 'Delta', role: 'Agent', status: 'active', clientCount: 3, policyCount: 5, totalPremium: 138000, renewalRate: 85.6, startDate: '2024-09-10' },
  { id: 'ag-20', name: 'Daniel Foster', team: 'Delta', role: 'Agent', status: 'active', clientCount: 4, policyCount: 5, totalPremium: 148000, renewalRate: 86.9, startDate: '2024-07-15' },
  // Team Echo (ag-10, ag-15, ag-18)
  { id: 'ag-10', name: 'Chris Taylor', team: 'Echo', role: 'Agent', status: 'active', clientCount: 4, policyCount: 5, totalPremium: 142000, renewalRate: 84.8, startDate: '2024-06-15' },
  { id: 'ag-15', name: 'Amy Richardson', team: 'Echo', role: 'Junior Agent', status: 'active', clientCount: 3, policyCount: 4, totalPremium: 96000, renewalRate: 80.4, startDate: '2024-11-01' },
  { id: 'ag-18', name: 'Brian Sullivan', team: 'Echo', role: 'Junior Agent', status: 'probation', clientCount: 2, policyCount: 3, totalPremium: 58000, renewalRate: 76.2, startDate: '2025-09-01' },
];

// ─── BOOK OF BUSINESS — CLIENTS (60) ──────────────────
export const DEMO_BOOK_CLIENTS: BookClient[] = [
  // ── Agent ag-01: Sarah Johnson (Alpha) — 3 clients ──
  {
    id: 'cl-001', agentId: 'ag-01', name: 'William Harrington',
    email: 'william.harrington@gmail.com', phone: '(404) 555-1201', dob: '1968-03-14',
    address: '1842 Peachtree Rd NE, Atlanta, GA 30309',
    policyType: 'IUL', policyNumber: 'HLS-2026-10001', coverageAmount: 1500000,
    annualPremium: 36000, monthlyPremium: 3000,
    effectiveDate: '2025-01-15', renewalDate: '2026-01-15',
    status: 'active', beneficiaryName: 'Linda Harrington', beneficiaryRelation: 'Spouse',
    agentNotes: 'High-net-worth client interested in legacy planning. Reviewing additional coverage for second property.',
    lastContactDate: '2026-03-08', riskClass: 'preferred',
  },
  {
    id: 'cl-002', agentId: 'ag-01', name: 'Priya Ramaswamy',
    email: 'priya.ramaswamy@outlook.com', phone: '(678) 555-3344', dob: '1975-09-22',
    address: '520 Buckhead Ave, Atlanta, GA 30305',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10002', coverageAmount: 750000,
    annualPremium: 18000, monthlyPremium: 1500,
    effectiveDate: '2025-04-01', renewalDate: '2026-04-01',
    status: 'active', beneficiaryName: 'Vikram Ramaswamy', beneficiaryRelation: 'Spouse',
    agentNotes: 'Business owner, uses policy as part of buy-sell agreement. Annual review scheduled for April.',
    lastContactDate: '2026-03-02', riskClass: 'preferred',
  },
  {
    id: 'cl-003', agentId: 'ag-01', name: 'Marcus Ellison',
    email: 'marcus.ellison@yahoo.com', phone: '(770) 555-8871', dob: '1982-11-05',
    address: '3901 Roswell Rd, Marietta, GA 30062',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10003', coverageAmount: 500000,
    annualPremium: 4800, monthlyPremium: 400,
    effectiveDate: '2025-06-10', renewalDate: '2026-06-10',
    status: 'active', beneficiaryName: 'Keisha Ellison', beneficiaryRelation: 'Spouse',
    agentNotes: 'Young family with two kids. Considering conversion to whole life in 2027.',
    lastContactDate: '2026-02-18', riskClass: 'preferred',
  },

  // ── Agent ag-02: Rachel Green (Alpha) — 3 clients ──
  {
    id: 'cl-004', agentId: 'ag-02', name: 'Catherine O\'Malley',
    email: 'catherine.omalley@gmail.com', phone: '(312) 555-6642', dob: '1960-07-19',
    address: '2145 N Lincoln Ave, Chicago, IL 60614',
    policyType: 'IUL', policyNumber: 'HLS-2026-10004', coverageAmount: 1200000,
    annualPremium: 28800, monthlyPremium: 2400,
    effectiveDate: '2024-09-01', renewalDate: '2025-09-01',
    status: 'active', beneficiaryName: 'Sean O\'Malley', beneficiaryRelation: 'Child',
    agentNotes: 'Retired executive. Focused on tax-advantaged growth. Quarterly check-ins requested.',
    lastContactDate: '2026-03-10', riskClass: 'preferred',
  },
  {
    id: 'cl-005', agentId: 'ag-02', name: 'Darnell Washington',
    email: 'darnell.washington@email.com', phone: '(773) 555-2290', dob: '1971-02-28',
    address: '8820 S Cottage Grove Ave, Chicago, IL 60619',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10005', coverageAmount: 600000,
    annualPremium: 14400, monthlyPremium: 1200,
    effectiveDate: '2025-02-15', renewalDate: '2026-02-15',
    status: 'active', beneficiaryName: 'Angela Washington', beneficiaryRelation: 'Spouse',
    agentNotes: 'Pastor and community leader. Interested in final expense policy for his mother as well.',
    lastContactDate: '2026-02-28', riskClass: 'standard',
  },
  {
    id: 'cl-006', agentId: 'ag-02', name: 'Yuki Tanaka',
    email: 'yuki.tanaka@gmail.com', phone: '(847) 555-4418', dob: '1988-12-03',
    address: '1620 Sherman Ave, Evanston, IL 60201',
    policyType: 'IUL', policyNumber: 'HLS-2026-10006', coverageAmount: 800000,
    annualPremium: 19200, monthlyPremium: 1600,
    effectiveDate: '2025-08-20', renewalDate: '2026-08-20',
    status: 'active', beneficiaryName: 'Kenji Tanaka', beneficiaryRelation: 'Spouse',
    agentNotes: 'Tech professional. Maxing out IUL for retirement supplement. Very analytical — prefers data-driven illustrations.',
    lastContactDate: '2026-03-05', riskClass: 'preferred',
  },

  // ── Agent ag-03: Tom Bradley (Alpha) — 3 clients ──
  {
    id: 'cl-007', agentId: 'ag-03', name: 'Robert Fitzgerald',
    email: 'robert.fitzgerald@email.com', phone: '(214) 555-7731', dob: '1955-06-30',
    address: '4502 Swiss Ave, Dallas, TX 75204',
    policyType: 'Annuity', policyNumber: 'HLS-2026-10007', coverageAmount: 400000,
    annualPremium: 48000, monthlyPremium: 4000,
    effectiveDate: '2024-11-01', renewalDate: '2025-11-01',
    status: 'active', beneficiaryName: 'Margaret Fitzgerald', beneficiaryRelation: 'Spouse',
    agentNotes: 'Near retirement. Annuity provides guaranteed income stream starting 2027. Conservative risk profile.',
    lastContactDate: '2026-03-01', riskClass: 'standard',
  },
  {
    id: 'cl-008', agentId: 'ag-03', name: 'Aaliyah Jackson',
    email: 'aaliyah.jackson@yahoo.com', phone: '(972) 555-9913', dob: '1990-04-17',
    address: '7701 Inwood Rd, Dallas, TX 75209',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10008', coverageAmount: 350000,
    annualPremium: 3600, monthlyPremium: 300,
    effectiveDate: '2025-03-01', renewalDate: '2026-03-01',
    status: 'pending', beneficiaryName: 'Jamal Jackson', beneficiaryRelation: 'Spouse',
    agentNotes: 'New mom, first policy. Renewal processing — waiting on updated health questionnaire.',
    lastContactDate: '2026-03-11', riskClass: 'preferred',
  },
  {
    id: 'cl-009', agentId: 'ag-03', name: 'Greg Olsen',
    email: 'greg.olsen@outlook.com', phone: '(469) 555-5508', dob: '1978-08-22',
    address: '1300 Main St Apt 1804, Dallas, TX 75202',
    policyType: 'IUL', policyNumber: 'HLS-2026-10009', coverageAmount: 900000,
    annualPremium: 21600, monthlyPremium: 1800,
    effectiveDate: '2025-07-15', renewalDate: '2026-07-15',
    status: 'active', beneficiaryName: 'Megan Olsen', beneficiaryRelation: 'Spouse',
    agentNotes: 'Small business owner. Uses IUL as supplemental retirement vehicle. Referred two colleagues.',
    lastContactDate: '2026-02-22', riskClass: 'preferred',
  },

  // ── Agent ag-11: Denise Watts (Alpha) — 3 clients ──
  {
    id: 'cl-010', agentId: 'ag-11', name: 'Howard Chen',
    email: 'howard.chen@gmail.com', phone: '(415) 555-3320', dob: '1963-01-09',
    address: '2890 Jackson St, San Francisco, CA 94115',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10010', coverageAmount: 1000000,
    annualPremium: 24000, monthlyPremium: 2000,
    effectiveDate: '2024-08-01', renewalDate: '2025-08-01',
    status: 'active', beneficiaryName: 'Emily Chen', beneficiaryRelation: 'Spouse',
    agentNotes: 'Physician. Policy serves as estate planning tool. Also interested in disability rider.',
    lastContactDate: '2026-03-06', riskClass: 'preferred',
  },
  {
    id: 'cl-011', agentId: 'ag-11', name: 'Tamara Brooks',
    email: 'tamara.brooks@email.com', phone: '(510) 555-1177', dob: '1985-05-28',
    address: '450 Grand Ave, Oakland, CA 94610',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10011', coverageAmount: 250000,
    annualPremium: 2400, monthlyPremium: 200,
    effectiveDate: '2025-11-15', renewalDate: '2026-11-15',
    status: 'active', beneficiaryName: 'Derrick Brooks', beneficiaryRelation: 'Spouse',
    agentNotes: 'Teacher with young family. Budget-conscious — term fits well. May convert in 5 years.',
    lastContactDate: '2026-02-14', riskClass: 'preferred',
  },
  {
    id: 'cl-012', agentId: 'ag-11', name: 'Eduardo Vasquez',
    email: 'eduardo.vasquez@yahoo.com', phone: '(408) 555-8865', dob: '1972-10-11',
    address: '1955 Meridian Ave, San Jose, CA 95125',
    policyType: 'IUL', policyNumber: 'HLS-2026-10012', coverageAmount: 700000,
    annualPremium: 16800, monthlyPremium: 1400,
    effectiveDate: '2025-05-01', renewalDate: '2026-05-01',
    status: 'active', beneficiaryName: 'Maria Vasquez', beneficiaryRelation: 'Spouse',
    agentNotes: 'Engineering manager at tech company. Utilizing IUL for tax-free retirement income strategy.',
    lastContactDate: '2026-03-09', riskClass: 'preferred',
  },

  // ── Agent ag-16: Jason Park (Alpha) — 3 clients ──
  {
    id: 'cl-013', agentId: 'ag-16', name: 'Barbara Steinberg',
    email: 'barbara.steinberg@outlook.com', phone: '(212) 555-4401', dob: '1954-04-02',
    address: '320 E 72nd St, New York, NY 10021',
    policyType: 'Annuity', policyNumber: 'HLS-2026-10013', coverageAmount: 500000,
    annualPremium: 42000, monthlyPremium: 3500,
    effectiveDate: '2024-06-01', renewalDate: '2025-06-01',
    status: 'active', beneficiaryName: 'David Steinberg', beneficiaryRelation: 'Child',
    agentNotes: 'Retired attorney. Annuity provides steady income. Reviewing adding a COLA rider.',
    lastContactDate: '2026-03-12', riskClass: 'standard',
  },
  {
    id: 'cl-014', agentId: 'ag-16', name: 'James Okafor',
    email: 'james.okafor@gmail.com', phone: '(917) 555-8824', dob: '1980-08-15',
    address: '455 FDR Dr Apt 12C, New York, NY 10002',
    policyType: 'IUL', policyNumber: 'HLS-2026-10014', coverageAmount: 1800000,
    annualPremium: 43200, monthlyPremium: 3600,
    effectiveDate: '2024-10-15', renewalDate: '2025-10-15',
    status: 'active', beneficiaryName: 'Chioma Okafor', beneficiaryRelation: 'Spouse',
    agentNotes: 'Finance executive. Maximum-funded IUL for wealth accumulation. Annual review in October.',
    lastContactDate: '2026-02-25', riskClass: 'preferred',
  },
  {
    id: 'cl-015', agentId: 'ag-16', name: 'Sandra Kowalski',
    email: 'sandra.kowalski@email.com', phone: '(718) 555-3319', dob: '1966-12-20',
    address: '8412 Bay Pkwy, Brooklyn, NY 11214',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10015', coverageAmount: 500000,
    annualPremium: 12000, monthlyPremium: 1000,
    effectiveDate: '2025-01-10', renewalDate: '2026-01-10',
    status: 'active', beneficiaryName: 'Michael Kowalski', beneficiaryRelation: 'Child',
    agentNotes: 'Small business owner. Policy doubles as collateral for business loan. Stable client.',
    lastContactDate: '2026-03-03', riskClass: 'standard',
  },

  // ── Agent ag-04: Mike Chen (Beta) — 3 clients ──
  {
    id: 'cl-016', agentId: 'ag-04', name: 'Patricia Morales',
    email: 'patricia.morales@gmail.com', phone: '(305) 555-2247', dob: '1973-06-08',
    address: '1450 Brickell Ave Apt 2201, Miami, FL 33131',
    policyType: 'IUL', policyNumber: 'HLS-2026-10016', coverageAmount: 1100000,
    annualPremium: 26400, monthlyPremium: 2200,
    effectiveDate: '2024-12-01', renewalDate: '2025-12-01',
    status: 'active', beneficiaryName: 'Carlos Morales', beneficiaryRelation: 'Spouse',
    agentNotes: 'Real estate investor. Using IUL cash value as alternative asset class. Sophisticated buyer.',
    lastContactDate: '2026-03-07', riskClass: 'preferred',
  },
  {
    id: 'cl-017', agentId: 'ag-04', name: 'Raymond Dupree',
    email: 'raymond.dupree@yahoo.com', phone: '(786) 555-6680', dob: '1958-11-25',
    address: '3200 Collins Ave, Miami Beach, FL 33140',
    policyType: 'Annuity', policyNumber: 'HLS-2026-10017', coverageAmount: 350000,
    annualPremium: 36000, monthlyPremium: 3000,
    effectiveDate: '2025-03-15', renewalDate: '2026-03-15',
    status: 'active', beneficiaryName: 'Marie Dupree', beneficiaryRelation: 'Spouse',
    agentNotes: 'Semi-retired. Annuity supplements social security. Prefers monthly disbursement schedule.',
    lastContactDate: '2026-03-13', riskClass: 'standard',
  },
  {
    id: 'cl-018', agentId: 'ag-04', name: 'Natalie Kim',
    email: 'natalie.kim@outlook.com', phone: '(954) 555-1193', dob: '1992-02-14',
    address: '601 E Las Olas Blvd, Fort Lauderdale, FL 33301',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10018', coverageAmount: 400000,
    annualPremium: 3600, monthlyPremium: 300,
    effectiveDate: '2025-09-01', renewalDate: '2026-09-01',
    status: 'active', beneficiaryName: 'Daniel Kim', beneficiaryRelation: 'Spouse',
    agentNotes: 'Young professional, newly married. Term policy as starter coverage. Upgrade path discussed.',
    lastContactDate: '2026-02-20', riskClass: 'preferred',
  },

  // ── Agent ag-05: Amanda Torres (Beta) — 3 clients ──
  {
    id: 'cl-019', agentId: 'ag-05', name: 'Franklin Webb',
    email: 'franklin.webb@gmail.com', phone: '(602) 555-4490', dob: '1964-09-03',
    address: '4420 N Scottsdale Rd, Scottsdale, AZ 85251',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10019', coverageAmount: 800000,
    annualPremium: 19200, monthlyPremium: 1600,
    effectiveDate: '2024-07-15', renewalDate: '2025-07-15',
    status: 'active', beneficiaryName: 'Joanne Webb', beneficiaryRelation: 'Spouse',
    agentNotes: 'Dentist with private practice. Uses whole life for estate transfer strategy. Very loyal client.',
    lastContactDate: '2026-03-04', riskClass: 'preferred',
  },
  {
    id: 'cl-020', agentId: 'ag-05', name: 'Rosa Gutierrez',
    email: 'rosa.gutierrez@yahoo.com', phone: '(480) 555-7712', dob: '1987-01-19',
    address: '1200 S Mill Ave, Tempe, AZ 85281',
    policyType: 'IUL', policyNumber: 'HLS-2026-10020', coverageAmount: 600000,
    annualPremium: 14400, monthlyPremium: 1200,
    effectiveDate: '2025-10-01', renewalDate: '2026-10-01',
    status: 'active', beneficiaryName: 'Miguel Gutierrez', beneficiaryRelation: 'Spouse',
    agentNotes: 'HR manager. IUL as supplemental retirement. Referred by Franklin Webb.',
    lastContactDate: '2026-02-15', riskClass: 'preferred',
  },
  {
    id: 'cl-021', agentId: 'ag-05', name: 'Chester Williams',
    email: 'chester.williams@email.com', phone: '(623) 555-3358', dob: '1950-12-07',
    address: '15840 N Bullhead Cir, Surprise, AZ 85374',
    policyType: 'Final Expense', policyNumber: 'HLS-2026-10021', coverageAmount: 50000,
    annualPremium: 3600, monthlyPremium: 300,
    effectiveDate: '2025-05-20', renewalDate: '2026-05-20',
    status: 'active', beneficiaryName: 'Martha Williams', beneficiaryRelation: 'Spouse',
    agentNotes: 'Retired veteran. Final expense covers burial costs. Fixed income — no upsell opportunity.',
    lastContactDate: '2026-01-30', riskClass: 'substandard',
  },

  // ── Agent ag-12: Victor Nguyen (Beta) — 3 clients ──
  {
    id: 'cl-022', agentId: 'ag-12', name: 'Deborah Sinclair',
    email: 'deborah.sinclair@outlook.com', phone: '(206) 555-8841', dob: '1969-03-26',
    address: '1501 4th Ave, Seattle, WA 98101',
    policyType: 'IUL', policyNumber: 'HLS-2026-10022', coverageAmount: 650000,
    annualPremium: 15600, monthlyPremium: 1300,
    effectiveDate: '2025-12-01', renewalDate: '2026-12-01',
    status: 'pending', beneficiaryName: 'Thomas Sinclair', beneficiaryRelation: 'Spouse',
    agentNotes: 'Policy application in underwriting. Medical records pending from provider.',
    lastContactDate: '2026-03-11', riskClass: 'standard',
  },
  {
    id: 'cl-023', agentId: 'ag-12', name: 'Andre Mitchell',
    email: 'andre.mitchell@gmail.com', phone: '(253) 555-2275', dob: '1995-07-14',
    address: '3802 Bridgeport Way W, Tacoma, WA 98466',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10023', coverageAmount: 250000,
    annualPremium: 1800, monthlyPremium: 150,
    effectiveDate: '2026-01-15', renewalDate: '2027-01-15',
    status: 'active', beneficiaryName: 'Karen Mitchell', beneficiaryRelation: 'Parent',
    agentNotes: 'First-time buyer. Single, no dependents yet. Term policy as foundation coverage.',
    lastContactDate: '2026-02-28', riskClass: 'preferred',
  },
  {
    id: 'cl-024', agentId: 'ag-12', name: 'Helen Christopoulos',
    email: 'helen.christopoulos@yahoo.com', phone: '(425) 555-6614', dob: '1976-10-30',
    address: '10220 NE 10th St, Bellevue, WA 98004',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10024', coverageAmount: 450000,
    annualPremium: 10800, monthlyPremium: 900,
    effectiveDate: '2025-06-01', renewalDate: '2026-06-01',
    status: 'active', beneficiaryName: 'George Christopoulos', beneficiaryRelation: 'Spouse',
    agentNotes: 'Restaurant owner. Whole life as forced savings vehicle. Consistent premium payer.',
    lastContactDate: '2026-03-02', riskClass: 'standard',
  },

  // ── Agent ag-17: Nicole Harris (Beta) — 3 clients ──
  {
    id: 'cl-025', agentId: 'ag-17', name: 'Leonard Tate',
    email: 'leonard.tate@email.com', phone: '(713) 555-9947', dob: '1961-05-12',
    address: '2600 Kirby Dr, Houston, TX 77098',
    policyType: 'IUL', policyNumber: 'HLS-2026-10025', coverageAmount: 1300000,
    annualPremium: 31200, monthlyPremium: 2600,
    effectiveDate: '2024-08-15', renewalDate: '2025-08-15',
    status: 'active', beneficiaryName: 'Diane Tate', beneficiaryRelation: 'Spouse',
    agentNotes: 'Oil and gas executive. High premium tolerance. Considering adding a second IUL policy.',
    lastContactDate: '2026-03-10', riskClass: 'preferred',
  },
  {
    id: 'cl-026', agentId: 'ag-17', name: 'Monica Reyes',
    email: 'monica.reyes@gmail.com', phone: '(832) 555-1128', dob: '1984-08-09',
    address: '5400 Westheimer Rd, Houston, TX 77056',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10026', coverageAmount: 550000,
    annualPremium: 13200, monthlyPremium: 1100,
    effectiveDate: '2025-02-01', renewalDate: '2026-02-01',
    status: 'active', beneficiaryName: 'Sofia Reyes', beneficiaryRelation: 'Child',
    agentNotes: 'Single mother, two children. Whole life chosen for guaranteed cash value growth.',
    lastContactDate: '2026-02-19', riskClass: 'preferred',
  },
  {
    id: 'cl-027', agentId: 'ag-17', name: 'Kwame Asante',
    email: 'kwame.asante@outlook.com', phone: '(281) 555-5563', dob: '1970-11-18',
    address: '14200 Memorial Dr, Houston, TX 77079',
    policyType: 'Annuity', policyNumber: 'HLS-2026-10027', coverageAmount: 300000,
    annualPremium: 30000, monthlyPremium: 2500,
    effectiveDate: '2025-07-01', renewalDate: '2026-07-01',
    status: 'active', beneficiaryName: 'Ama Asante', beneficiaryRelation: 'Spouse',
    agentNotes: 'University professor nearing retirement. Annuity as pension supplement. Low risk tolerance.',
    lastContactDate: '2026-03-06', riskClass: 'standard',
  },

  // ── Agent ag-06: David Brown (Gamma) — 3 clients ──
  {
    id: 'cl-028', agentId: 'ag-06', name: 'Thomas Brennan',
    email: 'thomas.brennan@gmail.com', phone: '(303) 555-7789', dob: '1957-02-05',
    address: '1600 Stout St, Denver, CO 80202',
    policyType: 'Annuity', policyNumber: 'HLS-2026-10028', coverageAmount: 450000,
    annualPremium: 40000, monthlyPremium: 3333,
    effectiveDate: '2024-05-01', renewalDate: '2025-05-01',
    status: 'active', beneficiaryName: 'Sharon Brennan', beneficiaryRelation: 'Spouse',
    agentNotes: 'Retired engineer. Annuity provides guaranteed income floor. Conservative allocation preferred.',
    lastContactDate: '2026-03-08', riskClass: 'standard',
  },
  {
    id: 'cl-029', agentId: 'ag-06', name: 'Fatima Al-Rashid',
    email: 'fatima.alrashid@email.com', phone: '(720) 555-4456', dob: '1981-09-17',
    address: '3300 E 1st Ave, Denver, CO 80206',
    policyType: 'IUL', policyNumber: 'HLS-2026-10029', coverageAmount: 950000,
    annualPremium: 22800, monthlyPremium: 1900,
    effectiveDate: '2025-04-15', renewalDate: '2026-04-15',
    status: 'active', beneficiaryName: 'Omar Al-Rashid', beneficiaryRelation: 'Spouse',
    agentNotes: 'Pharmacist. IUL for retirement and college funding for three children. Annual review in April.',
    lastContactDate: '2026-02-24', riskClass: 'preferred',
  },
  {
    id: 'cl-030', agentId: 'ag-06', name: 'Kevin Murphy',
    email: 'kevin.murphy@yahoo.com', phone: '(719) 555-3312', dob: '1990-06-23',
    address: '215 S Tejon St, Colorado Springs, CO 80903',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10030', coverageAmount: 500000,
    annualPremium: 4200, monthlyPremium: 350,
    effectiveDate: '2025-11-01', renewalDate: '2026-11-01',
    status: 'active', beneficiaryName: 'Lisa Murphy', beneficiaryRelation: 'Spouse',
    agentNotes: 'Military veteran, active reservist. Term life as primary family protection. Excellent health.',
    lastContactDate: '2026-03-01', riskClass: 'preferred',
  },

  // ── Agent ag-07: Karen Mitchell (Gamma) — 3 clients ──
  {
    id: 'cl-031', agentId: 'ag-07', name: 'George Papadakis',
    email: 'george.papadakis@gmail.com', phone: '(617) 555-8832', dob: '1967-04-14',
    address: '100 Beacon St, Boston, MA 02116',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10031', coverageAmount: 700000,
    annualPremium: 16800, monthlyPremium: 1400,
    effectiveDate: '2024-10-01', renewalDate: '2025-10-01',
    status: 'active', beneficiaryName: 'Elena Papadakis', beneficiaryRelation: 'Spouse',
    agentNotes: 'Restaurant chain owner. Whole life as key-person policy. Agent on leave — account managed by team lead.',
    lastContactDate: '2026-01-15', riskClass: 'standard',
  },
  {
    id: 'cl-032', agentId: 'ag-07', name: 'Wendy Sato',
    email: 'wendy.sato@outlook.com', phone: '(508) 555-1106', dob: '1983-11-29',
    address: '45 Oak St, Worcester, MA 01609',
    policyType: 'IUL', policyNumber: 'HLS-2026-10032', coverageAmount: 550000,
    annualPremium: 13200, monthlyPremium: 1100,
    effectiveDate: '2025-08-01', renewalDate: '2026-08-01',
    status: 'lapsed', beneficiaryName: 'Ken Sato', beneficiaryRelation: 'Spouse',
    agentNotes: 'Missed two premium payments while agent on leave. Reinstatement process initiated.',
    lastContactDate: '2026-01-20', riskClass: 'preferred',
  },
  {
    id: 'cl-033', agentId: 'ag-07', name: 'Anthony DiMaggio',
    email: 'anthony.dimaggio@yahoo.com', phone: '(781) 555-4470', dob: '1975-07-08',
    address: '220 Hanover St, Boston, MA 02113',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10033', coverageAmount: 300000,
    annualPremium: 3600, monthlyPremium: 300,
    effectiveDate: '2025-01-15', renewalDate: '2026-01-15',
    status: 'active', beneficiaryName: 'Maria DiMaggio', beneficiaryRelation: 'Spouse',
    agentNotes: 'Construction foreman. Term life for mortgage protection. Agent on leave — needs reassignment.',
    lastContactDate: '2026-01-10', riskClass: 'substandard',
  },

  // ── Agent ag-13: Laura Campbell (Gamma) — 3 clients ──
  {
    id: 'cl-034', agentId: 'ag-13', name: 'Rachel Simmons',
    email: 'rachel.simmons@gmail.com', phone: '(503) 555-6621', dob: '1993-03-11',
    address: '2340 NW Westover Rd, Portland, OR 97210',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10034', coverageAmount: 200000,
    annualPremium: 1800, monthlyPremium: 150,
    effectiveDate: '2026-02-01', renewalDate: '2027-02-01',
    status: 'active', beneficiaryName: 'David Simmons', beneficiaryRelation: 'Spouse',
    agentNotes: 'New client, recently married. Basic term coverage. Agent on probation — close supervision.',
    lastContactDate: '2026-03-05', riskClass: 'preferred',
  },
  {
    id: 'cl-035', agentId: 'ag-13', name: 'Harold Jennings',
    email: 'harold.jennings@email.com', phone: '(971) 555-3398', dob: '1952-08-19',
    address: '8900 SW Barbur Blvd, Portland, OR 97219',
    policyType: 'Final Expense', policyNumber: 'HLS-2026-10035', coverageAmount: 35000,
    annualPremium: 2400, monthlyPremium: 200,
    effectiveDate: '2026-01-10', renewalDate: '2027-01-10',
    status: 'active', beneficiaryName: 'Carol Jennings', beneficiaryRelation: 'Spouse',
    agentNotes: 'Retired. Fixed income. Final expense policy to cover funeral costs. Simple needs.',
    lastContactDate: '2026-02-10', riskClass: 'substandard',
  },
  {
    id: 'cl-036', agentId: 'ag-13', name: 'Michelle Tran',
    email: 'michelle.tran@yahoo.com', phone: '(360) 555-8854', dob: '1988-12-24',
    address: '1100 Broadway, Vancouver, WA 98660',
    policyType: 'IUL', policyNumber: 'HLS-2026-10036', coverageAmount: 400000,
    annualPremium: 9600, monthlyPremium: 800,
    effectiveDate: '2025-11-15', renewalDate: '2026-11-15',
    status: 'cancelled', beneficiaryName: 'Hung Tran', beneficiaryRelation: 'Parent',
    agentNotes: 'Cancelled after 3 months — found competing policy with lower premium. Exit interview completed.',
    lastContactDate: '2026-02-05', riskClass: 'preferred',
  },

  // ── Agent ag-19: Stephanie Cruz (Gamma) — 3 clients ──
  {
    id: 'cl-037', agentId: 'ag-19', name: 'Jonathan Reid',
    email: 'jonathan.reid@outlook.com', phone: '(615) 555-2241', dob: '1974-05-16',
    address: '1500 Broadway, Nashville, TN 37203',
    policyType: 'IUL', policyNumber: 'HLS-2026-10037', coverageAmount: 850000,
    annualPremium: 20400, monthlyPremium: 1700,
    effectiveDate: '2025-03-01', renewalDate: '2026-03-01',
    status: 'active', beneficiaryName: 'Catherine Reid', beneficiaryRelation: 'Spouse',
    agentNotes: 'Music industry executive. IUL for retirement planning. High income, moderate savings discipline.',
    lastContactDate: '2026-03-09', riskClass: 'preferred',
  },
  {
    id: 'cl-038', agentId: 'ag-19', name: 'Lorraine Baptiste',
    email: 'lorraine.baptiste@gmail.com', phone: '(629) 555-5578', dob: '1968-10-01',
    address: '4000 Hillsboro Pike, Nashville, TN 37215',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10038', coverageAmount: 600000,
    annualPremium: 14400, monthlyPremium: 1200,
    effectiveDate: '2024-12-15', renewalDate: '2025-12-15',
    status: 'active', beneficiaryName: 'Jean-Pierre Baptiste', beneficiaryRelation: 'Spouse',
    agentNotes: 'Nurse practitioner. Whole life for family protection and cash value accumulation.',
    lastContactDate: '2026-02-27', riskClass: 'preferred',
  },
  {
    id: 'cl-039', agentId: 'ag-19', name: 'Derek Lawson',
    email: 'derek.lawson@email.com', phone: '(615) 555-8810', dob: '1997-02-28',
    address: '900 Division St, Nashville, TN 37203',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10039', coverageAmount: 150000,
    annualPremium: 1200, monthlyPremium: 100,
    effectiveDate: '2026-01-01', renewalDate: '2027-01-01',
    status: 'active', beneficiaryName: 'Sandra Lawson', beneficiaryRelation: 'Parent',
    agentNotes: 'Young professional, first policy. Starter term coverage. Good prospect for future upsell.',
    lastContactDate: '2026-03-01', riskClass: 'preferred',
  },

  // ── Agent ag-08: Jessica Lee (Delta) — 3 clients ──
  {
    id: 'cl-040', agentId: 'ag-08', name: 'Vincent Calabrese',
    email: 'vincent.calabrese@yahoo.com', phone: '(215) 555-6637', dob: '1962-01-22',
    address: '1800 Rittenhouse Sq, Philadelphia, PA 19103',
    policyType: 'IUL', policyNumber: 'HLS-2026-10040', coverageAmount: 1400000,
    annualPremium: 33600, monthlyPremium: 2800,
    effectiveDate: '2024-07-01', renewalDate: '2025-07-01',
    status: 'active', beneficiaryName: 'Gina Calabrese', beneficiaryRelation: 'Spouse',
    agentNotes: 'Surgeon. Maximum-funded IUL for tax-free income in retirement. Very high earner.',
    lastContactDate: '2026-03-12', riskClass: 'preferred',
  },
  {
    id: 'cl-041', agentId: 'ag-08', name: 'Shanice Williams',
    email: 'shanice.williams@gmail.com', phone: '(267) 555-1155', dob: '1986-04-30',
    address: '420 S Broad St, Philadelphia, PA 19146',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10041', coverageAmount: 500000,
    annualPremium: 12000, monthlyPremium: 1000,
    effectiveDate: '2025-05-15', renewalDate: '2026-05-15',
    status: 'active', beneficiaryName: 'Marcus Williams', beneficiaryRelation: 'Spouse',
    agentNotes: 'Accountant. Whole life for guaranteed death benefit and living benefits. Disciplined saver.',
    lastContactDate: '2026-02-22', riskClass: 'preferred',
  },
  {
    id: 'cl-042', agentId: 'ag-08', name: 'Richard Hawthorne',
    email: 'richard.hawthorne@outlook.com', phone: '(484) 555-3390', dob: '1953-09-08',
    address: '255 Lancaster Ave, Wayne, PA 19087',
    policyType: 'Final Expense', policyNumber: 'HLS-2026-10042', coverageAmount: 75000,
    annualPremium: 5400, monthlyPremium: 450,
    effectiveDate: '2025-09-01', renewalDate: '2026-09-01',
    status: 'active', beneficiaryName: 'Hawthorne Family Trust', beneficiaryRelation: 'Trust',
    agentNotes: 'Widower. Final expense to cover end-of-life costs. Estate handled by family trust.',
    lastContactDate: '2026-03-04', riskClass: 'substandard',
  },

  // ── Agent ag-09: Robert Kim (Delta) — 3 clients ──
  {
    id: 'cl-043', agentId: 'ag-09', name: 'Diana Petrov',
    email: 'diana.petrov@gmail.com', phone: '(704) 555-8870', dob: '1979-07-02',
    address: '300 S Tryon St, Charlotte, NC 28202',
    policyType: 'IUL', policyNumber: 'HLS-2026-10043', coverageAmount: 750000,
    annualPremium: 18000, monthlyPremium: 1500,
    effectiveDate: '2025-06-15', renewalDate: '2026-06-15',
    status: 'active', beneficiaryName: 'Nikolai Petrov', beneficiaryRelation: 'Spouse',
    agentNotes: 'Banking VP. IUL for supplemental retirement. Prefers annual premium payments.',
    lastContactDate: '2026-03-07', riskClass: 'preferred',
  },
  {
    id: 'cl-044', agentId: 'ag-09', name: 'Terrence Booker',
    email: 'terrence.booker@email.com', phone: '(980) 555-4423', dob: '1991-12-15',
    address: '1215 Thomas Ave, Charlotte, NC 28205',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10044', coverageAmount: 300000,
    annualPremium: 2400, monthlyPremium: 200,
    effectiveDate: '2025-10-01', renewalDate: '2026-10-01',
    status: 'active', beneficiaryName: 'Jasmine Booker', beneficiaryRelation: 'Spouse',
    agentNotes: 'IT consultant. Term life for young family. Two children under 5. May upgrade in 3 years.',
    lastContactDate: '2026-02-16', riskClass: 'preferred',
  },
  {
    id: 'cl-045', agentId: 'ag-09', name: 'Evelyn Chang',
    email: 'evelyn.chang@yahoo.com', phone: '(336) 555-6698', dob: '1970-03-28',
    address: '400 W 4th St, Winston-Salem, NC 27101',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10045', coverageAmount: 400000,
    annualPremium: 9600, monthlyPremium: 800,
    effectiveDate: '2025-01-20', renewalDate: '2026-01-20',
    status: 'lapsed', beneficiaryName: 'Michael Chang', beneficiaryRelation: 'Child',
    agentNotes: 'Policy lapsed after job transition. Reinstatement options discussed. Awaiting updated financials.',
    lastContactDate: '2026-03-10', riskClass: 'standard',
  },

  // ── Agent ag-14: Marcus Hall (Delta) — 3 clients ──
  {
    id: 'cl-046', agentId: 'ag-14', name: 'Brenda Morrison',
    email: 'brenda.morrison@outlook.com', phone: '(404) 555-2234', dob: '1965-08-11',
    address: '2700 Paces Ferry Rd, Atlanta, GA 30339',
    policyType: 'Annuity', policyNumber: 'HLS-2026-10046', coverageAmount: 275000,
    annualPremium: 24000, monthlyPremium: 2000,
    effectiveDate: '2025-04-01', renewalDate: '2026-04-01',
    status: 'active', beneficiaryName: 'James Morrison', beneficiaryRelation: 'Spouse',
    agentNotes: 'School principal nearing retirement. Annuity for guaranteed income supplement.',
    lastContactDate: '2026-03-03', riskClass: 'standard',
  },
  {
    id: 'cl-047', agentId: 'ag-14', name: 'Stanley Okonkwo',
    email: 'stanley.okonkwo@gmail.com', phone: '(678) 555-9915', dob: '1983-06-24',
    address: '5600 Peachtree Dunwoody Rd, Atlanta, GA 30342',
    policyType: 'IUL', policyNumber: 'HLS-2026-10047', coverageAmount: 600000,
    annualPremium: 14400, monthlyPremium: 1200,
    effectiveDate: '2025-08-15', renewalDate: '2026-08-15',
    status: 'pending', beneficiaryName: 'Chidinma Okonkwo', beneficiaryRelation: 'Spouse',
    agentNotes: 'Software engineer. IUL application pending — waiting on paramedical exam results.',
    lastContactDate: '2026-03-12', riskClass: 'preferred',
  },
  {
    id: 'cl-048', agentId: 'ag-14', name: 'Pamela Ruiz',
    email: 'pamela.ruiz@yahoo.com', phone: '(770) 555-5541', dob: '1977-11-03',
    address: '1000 Holcomb Bridge Rd, Roswell, GA 30076',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10048', coverageAmount: 350000,
    annualPremium: 3600, monthlyPremium: 300,
    effectiveDate: '2025-12-01', renewalDate: '2026-12-01',
    status: 'active', beneficiaryName: 'Eduardo Ruiz', beneficiaryRelation: 'Spouse',
    agentNotes: 'Real estate agent. Term life for mortgage and family protection. Prefers text communication.',
    lastContactDate: '2026-02-20', riskClass: 'standard',
  },

  // ── Agent ag-20: Daniel Foster (Delta) — 3 clients ──
  {
    id: 'cl-049', agentId: 'ag-20', name: 'Irene Kozlov',
    email: 'irene.kozlov@email.com', phone: '(612) 555-7748', dob: '1971-01-17',
    address: '250 Marquette Ave, Minneapolis, MN 55401',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10049', coverageAmount: 550000,
    annualPremium: 13200, monthlyPremium: 1100,
    effectiveDate: '2025-02-15', renewalDate: '2026-02-15',
    status: 'active', beneficiaryName: 'Dmitri Kozlov', beneficiaryRelation: 'Spouse',
    agentNotes: 'University administrator. Whole life for estate planning and forced savings.',
    lastContactDate: '2026-03-05', riskClass: 'preferred',
  },
  {
    id: 'cl-050', agentId: 'ag-20', name: 'Samuel Washington',
    email: 'samuel.washington@gmail.com', phone: '(651) 555-3376', dob: '1959-04-08',
    address: '175 E 5th St, St. Paul, MN 55101',
    policyType: 'Annuity', policyNumber: 'HLS-2026-10050', coverageAmount: 200000,
    annualPremium: 18000, monthlyPremium: 1500,
    effectiveDate: '2025-06-01', renewalDate: '2026-06-01',
    status: 'active', beneficiaryName: 'Gloria Washington', beneficiaryRelation: 'Spouse',
    agentNotes: 'Retired firefighter. Annuity supplements pension. Fixed income, reliable payer.',
    lastContactDate: '2026-02-12', riskClass: 'standard',
  },
  {
    id: 'cl-051', agentId: 'ag-20', name: 'Ashley Brennan',
    email: 'ashley.brennan@yahoo.com', phone: '(952) 555-1184', dob: '1994-09-30',
    address: '7600 France Ave S, Edina, MN 55435',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10051', coverageAmount: 250000,
    annualPremium: 2100, monthlyPremium: 175,
    effectiveDate: '2026-01-15', renewalDate: '2027-01-15',
    status: 'active', beneficiaryName: 'Ryan Brennan', beneficiaryRelation: 'Spouse',
    agentNotes: 'Newlywed. First life insurance policy. Term as starter coverage with conversion option.',
    lastContactDate: '2026-03-08', riskClass: 'preferred',
  },

  // ── Agent ag-10: Chris Taylor (Echo) — 3 clients ──
  {
    id: 'cl-052', agentId: 'ag-10', name: 'Margaret Sullivan',
    email: 'margaret.sullivan@outlook.com', phone: '(702) 555-4467', dob: '1956-06-12',
    address: '3600 Las Vegas Blvd S, Las Vegas, NV 89109',
    policyType: 'Final Expense', policyNumber: 'HLS-2026-10052', coverageAmount: 60000,
    annualPremium: 4200, monthlyPremium: 350,
    effectiveDate: '2025-07-01', renewalDate: '2026-07-01',
    status: 'active', beneficiaryName: 'Patrick Sullivan', beneficiaryRelation: 'Child',
    agentNotes: 'Retired hospitality worker. Final expense for burial and memorial costs. Fixed budget.',
    lastContactDate: '2026-02-28', riskClass: 'substandard',
  },
  {
    id: 'cl-053', agentId: 'ag-10', name: 'Jamal Henderson',
    email: 'jamal.henderson@gmail.com', phone: '(725) 555-8809', dob: '1985-10-21',
    address: '1820 S Eastern Ave, Henderson, NV 89052',
    policyType: 'IUL', policyNumber: 'HLS-2026-10053', coverageAmount: 650000,
    annualPremium: 15600, monthlyPremium: 1300,
    effectiveDate: '2025-09-15', renewalDate: '2026-09-15',
    status: 'active', beneficiaryName: 'Tanya Henderson', beneficiaryRelation: 'Spouse',
    agentNotes: 'Auto dealership manager. IUL for retirement savings and family protection.',
    lastContactDate: '2026-03-11', riskClass: 'preferred',
  },
  {
    id: 'cl-054', agentId: 'ag-10', name: 'Connie Nakamura',
    email: 'connie.nakamura@email.com', phone: '(775) 555-2256', dob: '1978-03-05',
    address: '500 N Virginia St, Reno, NV 89501',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10054', coverageAmount: 400000,
    annualPremium: 9600, monthlyPremium: 800,
    effectiveDate: '2025-04-01', renewalDate: '2026-04-01',
    status: 'cancelled', beneficiaryName: 'Ken Nakamura', beneficiaryRelation: 'Spouse',
    agentNotes: 'Cancelled due to relocation out of state. Offered transfer but client declined.',
    lastContactDate: '2026-01-25', riskClass: 'preferred',
  },

  // ── Agent ag-15: Amy Richardson (Echo) — 3 clients ──
  {
    id: 'cl-055', agentId: 'ag-15', name: 'Reginald Porter',
    email: 'reginald.porter@gmail.com', phone: '(904) 555-3345', dob: '1960-12-09',
    address: '1301 Riverplace Blvd, Jacksonville, FL 32207',
    policyType: 'Whole Life', policyNumber: 'HLS-2026-10055', coverageAmount: 350000,
    annualPremium: 8400, monthlyPremium: 700,
    effectiveDate: '2025-03-15', renewalDate: '2026-03-15',
    status: 'active', beneficiaryName: 'Claudia Porter', beneficiaryRelation: 'Spouse',
    agentNotes: 'Government employee. Whole life as supplement to FEGLI coverage. Steady premiums.',
    lastContactDate: '2026-03-02', riskClass: 'standard',
  },
  {
    id: 'cl-056', agentId: 'ag-15', name: 'Nina Fedorova',
    email: 'nina.fedorova@outlook.com', phone: '(386) 555-6679', dob: '1989-05-18',
    address: '200 N Beach St, Daytona Beach, FL 32114',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10056', coverageAmount: 200000,
    annualPremium: 1800, monthlyPremium: 150,
    effectiveDate: '2026-02-01', renewalDate: '2027-02-01',
    status: 'pending', beneficiaryName: 'Alexei Fedorov', beneficiaryRelation: 'Spouse',
    agentNotes: 'New application in underwriting. Awaiting lab results from recent physical.',
    lastContactDate: '2026-03-09', riskClass: 'preferred',
  },
  {
    id: 'cl-057', agentId: 'ag-15', name: 'Clarence Dubois',
    email: 'clarence.dubois@yahoo.com', phone: '(813) 555-1128', dob: '1948-08-25',
    address: '1700 N Westshore Blvd, Tampa, FL 33607',
    policyType: 'Final Expense', policyNumber: 'HLS-2026-10057', coverageAmount: 40000,
    annualPremium: 3000, monthlyPremium: 250,
    effectiveDate: '2025-10-15', renewalDate: '2026-10-15',
    status: 'active', beneficiaryName: 'Marie Dubois', beneficiaryRelation: 'Sibling',
    agentNotes: 'Widower, no children. Sister is beneficiary. Final expense covers burial costs only.',
    lastContactDate: '2026-02-08', riskClass: 'substandard',
  },

  // ── Agent ag-18: Brian Sullivan (Echo) — 3 clients ──
  {
    id: 'cl-058', agentId: 'ag-18', name: 'Tiffany Nguyen',
    email: 'tiffany.nguyen@gmail.com', phone: '(512) 555-4498', dob: '1996-01-14',
    address: '600 Congress Ave, Austin, TX 78701',
    policyType: 'Term Life', policyNumber: 'HLS-2026-10058', coverageAmount: 150000,
    annualPremium: 1200, monthlyPremium: 100,
    effectiveDate: '2026-02-15', renewalDate: '2027-02-15',
    status: 'active', beneficiaryName: 'Trang Nguyen', beneficiaryRelation: 'Parent',
    agentNotes: 'Recent college grad. Starter term policy. Agent on probation — manager monitoring.',
    lastContactDate: '2026-03-06', riskClass: 'preferred',
  },
  {
    id: 'cl-059', agentId: 'ag-18', name: 'Walter Gibson',
    email: 'walter.gibson@email.com', phone: '(737) 555-7763', dob: '1954-11-20',
    address: '4500 S Lamar Blvd, Austin, TX 78745',
    policyType: 'Final Expense', policyNumber: 'HLS-2026-10059', coverageAmount: 30000,
    annualPremium: 2400, monthlyPremium: 200,
    effectiveDate: '2025-12-01', renewalDate: '2026-12-01',
    status: 'cancelled', beneficiaryName: 'Dorothy Gibson', beneficiaryRelation: 'Spouse',
    agentNotes: 'Cancelled — client found policy through employer benefits. Retention attempt unsuccessful.',
    lastContactDate: '2026-01-18', riskClass: 'substandard',
  },
  {
    id: 'cl-060', agentId: 'ag-18', name: 'Lydia Ramirez',
    email: 'lydia.ramirez@yahoo.com', phone: '(210) 555-3321', dob: '1982-07-06',
    address: '300 E Commerce St, San Antonio, TX 78205',
    policyType: 'IUL', policyNumber: 'HLS-2026-10060', coverageAmount: 500000,
    annualPremium: 12000, monthlyPremium: 1000,
    effectiveDate: '2025-11-01', renewalDate: '2026-11-01',
    status: 'pending', beneficiaryName: 'Marco Ramirez', beneficiaryRelation: 'Spouse',
    agentNotes: 'Application submitted, pending underwriting approval. Agent on probation — senior review required.',
    lastContactDate: '2026-03-13', riskClass: 'standard',
  },
];

// ── LEAD DISTRIBUTION INTERFACES ─────────────────────

export interface DistributionLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  source: 'executive_referral' | 'marketing_campaign' | 'website' | 'partner_referral' | 'csv_import' | 'cold_list';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  product: string;
  coverageType: string;
  estimatedValue: number;
  leadScore: number;
  scoreTier: 'cold' | 'warm' | 'hot' | 'on_fire';
  status: 'pool' | 'distributed' | 'assigned' | 'in_progress' | 'converted' | 'lost';
  distributedTo: string | null;
  assignedTo: string | null;
  distributedAt: string | null;
  assignedAt: string | null;
  pipelineStage: string;
  lastActivity: string;
  nextFollowUp: string;
  notes: string;
  importBatch: string;
  importedAt: string;
  // ── Quoter-specific fields (populated when source === 'website') ──
  streetAddress?: string;
  zipCode?: string;
  birthDate?: string;
  age?: number;
  gender?: 'male' | 'female';
  tobacco?: boolean;
  heightDisplay?: string;
  weightDisplay?: string;
  coverageAmountDisplay?: string;
  medicalBackground?: string;
  quoteRequestId?: number;
}

export interface ExecDistributionRecord {
  id: string;
  date: string;
  leadsDistributed: number;
  managersCount: number;
  distributedBy: string;
  perManager: string;
  method: 'even' | 'weighted' | 'manual';
}

export interface ImportBatch {
  id: string;
  fileName: string;
  importedAt: string;
  totalLeads: number;
  status: 'processing' | 'complete' | 'error';
  importedBy: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'status_change' | 'call' | 'email' | 'note' | 'assignment' | 'distribution' | 'score_update';
  description: string;
  performedBy: string;
  timestamp: string;
}

// ── LEAD STATUS & PRIORITY CONFIG ────────────────────

export const LEAD_STATUS_CFG: Record<string, { label: string; border: string; dot: string; badge: string; badgeText: string; badgeBorder: string }> = {
  pool:        { label: 'In Pool',      border: '#8b5cf6', dot: '#8b5cf6', badge: 'bg-purple-50',  badgeText: 'text-purple-600',  badgeBorder: 'border-purple-200' },
  distributed: { label: 'Distributed',  border: '#3b82f6', dot: '#3b82f6', badge: 'bg-blue-50',    badgeText: 'text-blue-600',    badgeBorder: 'border-blue-200' },
  assigned:    { label: 'Assigned',     border: '#f59e0b', dot: '#f59e0b', badge: 'bg-amber-50',   badgeText: 'text-amber-600',   badgeBorder: 'border-amber-200' },
  in_progress: { label: 'In Progress',  border: '#ea580c', dot: '#ea580c', badge: 'bg-orange-50',  badgeText: 'text-orange-600',  badgeBorder: 'border-orange-200' },
  converted:   { label: 'Converted',   border: '#10b981', dot: '#10b981', badge: 'bg-emerald-50', badgeText: 'text-emerald-600', badgeBorder: 'border-emerald-200' },
  lost:        { label: 'Lost',        border: '#ef4444', dot: '#ef4444', badge: 'bg-red-50',     badgeText: 'text-red-600',     badgeBorder: 'border-red-200' },
};

export const LEAD_PRIORITY_CFG: Record<string, { label: string; color: string; bg: string; text: string; border: string }> = {
  urgent: { label: 'Urgent', color: '#ef4444', bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  high:   { label: 'High',   color: '#f97316', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200' },
  low:    { label: 'Low',    color: '#9ca3af', bg: 'bg-stone-50',   text: 'text-stone-600',   border: 'border-stone-200' },
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  executive_referral: 'Executive Referral',
  marketing_campaign: 'Marketing Campaign',
  website: 'Website',
  partner_referral: 'Partner Referral',
  csv_import: 'CSV Import',
  cold_list: 'Cold List',
};

export const PIPELINE_STAGE_ORDER = [
  'new', 'contacted', 'qualified', 'appointment_set', 'quoted',
  'application', 'underwriting', 'issued', 'placed', 'lost',
] as const;

export const PIPELINE_STAGE_LABELS: Record<string, string> = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified',
  appointment_set: 'Appt Set', quoted: 'Quoted', application: 'Application',
  underwriting: 'Underwriting', issued: 'Issued', placed: 'Placed', lost: 'Lost',
};

// ── DEMO DISTRIBUTION LEADS (40 leads) ──────────────

export const DEMO_DISTRIBUTION_LEADS: DistributionLead[] = [
  // ── POOL (12 leads) — status: 'pool', distributedTo: null, assignedTo: null, pipelineStage: 'new' ──
  {
    id: 'ld-1', firstName: 'Patricia', lastName: 'Harmon', email: 'patricia.harmon@gmail.com', phone: '(404) 555-1201',
    city: 'Atlanta', state: 'GA', source: 'marketing_campaign', priority: 'high', product: 'IUL', coverageType: 'Individual',
    estimatedValue: 350000, leadScore: 72, scoreTier: 'hot', status: 'pool',
    distributedTo: null, assignedTo: null, distributedAt: null, assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Inbound form submitted — requested IUL quote', nextFollowUp: '2026-03-15',
    notes: 'Business owner, interested in IUL for tax-advantaged growth. Requested callback.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-2', firstName: 'Raymond', lastName: 'Okafor', email: 'raymond.okafor@outlook.com', phone: '(713) 555-3344',
    city: 'Houston', state: 'TX', source: 'cold_list', priority: 'medium', product: 'Whole Life', coverageType: 'Individual',
    estimatedValue: 250000, leadScore: 45, scoreTier: 'warm', status: 'pool',
    distributedTo: null, assignedTo: null, distributedAt: null, assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Added from cold list — no contact yet', nextFollowUp: '2026-03-16',
    notes: 'Engineer, age 42, married with 2 children. Potential whole life candidate.', importBatch: 'batch-003', importedAt: '2026-03-10',
  },
  {
    id: 'ld-3', firstName: 'Denise', lastName: 'Caldwell', email: 'denise.caldwell@yahoo.com', phone: '(305) 555-8817',
    city: 'Miami', state: 'FL', source: 'website', priority: 'medium', product: 'Term Life', coverageType: 'Individual',
    estimatedValue: 150000, leadScore: 55, scoreTier: 'warm', status: 'pool',
    distributedTo: null, assignedTo: null, distributedAt: null, assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Website quote request submitted', nextFollowUp: '2026-03-17',
    notes: 'Single mother, 35, seeking affordable term coverage for mortgage protection.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-4', firstName: 'George', lastName: 'Whitfield', email: 'george.whitfield@email.com', phone: '(602) 555-4492',
    city: 'Phoenix', state: 'AZ', source: 'csv_import', priority: 'low', product: 'Final Expense', coverageType: 'Individual',
    estimatedValue: 25000, leadScore: 32, scoreTier: 'cold', status: 'pool',
    distributedTo: null, assignedTo: null, distributedAt: null, assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Imported from purchased list — unverified', nextFollowUp: '2026-03-18',
    notes: 'Retired, age 71. Final expense prospect. Phone number needs verification.', importBatch: 'batch-003', importedAt: '2026-03-10',
  },
  {
    id: 'ld-5', firstName: 'Tamika', lastName: 'Washington', email: 'tamika.washington@gmail.com', phone: '(312) 555-6678',
    city: 'Chicago', state: 'IL', source: 'partner_referral', priority: 'high', product: 'Annuity', coverageType: 'Individual',
    estimatedValue: 500000, leadScore: 85, scoreTier: 'on_fire', status: 'pool',
    distributedTo: null, assignedTo: null, distributedAt: null, assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Referred by First National Bank wealth advisor', nextFollowUp: '2026-03-15',
    notes: 'Nearing retirement, large 401K rollover candidate. High net worth. Urgent follow-up.', importBatch: 'batch-002', importedAt: '2026-03-05',
  },
  {
    id: 'ld-6', firstName: 'Lawrence', lastName: 'Brennan', email: 'l.brennan@protonmail.com', phone: '(503) 555-9902',
    city: 'Portland', state: 'OR', source: 'cold_list', priority: 'low', product: 'Term Life', coverageType: 'Individual',
    estimatedValue: 100000, leadScore: 28, scoreTier: 'cold', status: 'pool',
    distributedTo: null, assignedTo: null, distributedAt: null, assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Added from cold list — no contact yet', nextFollowUp: '2026-03-19',
    notes: 'Freelance developer, age 29. May need basic term coverage.', importBatch: 'batch-003', importedAt: '2026-03-10',
  },
  {
    id: 'ld-7', firstName: 'Sandra', lastName: 'Fujimoto', email: 'sandra.fujimoto@email.com', phone: '(808) 555-2210',
    city: 'Honolulu', state: 'HI', source: 'marketing_campaign', priority: 'medium', product: 'IUL', coverageType: 'Individual',
    estimatedValue: 300000, leadScore: 61, scoreTier: 'hot', status: 'pool',
    distributedTo: null, assignedTo: null, distributedAt: null, assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Clicked IUL webinar ad — registered for event', nextFollowUp: '2026-03-16',
    notes: 'Physician, age 48. High income earner, IUL for supplemental retirement.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-8', firstName: 'Marcus', lastName: 'Tillman', email: 'marcus.tillman@yahoo.com', phone: '(615) 555-3378',
    city: 'Nashville', state: 'TN', source: 'executive_referral', priority: 'urgent', product: 'Whole Life', coverageType: 'Family',
    estimatedValue: 400000, leadScore: 92, scoreTier: 'on_fire', status: 'pool',
    distributedTo: null, assignedTo: null, distributedAt: null, assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Personal referral from Heritage CEO — high priority', nextFollowUp: '2026-03-14',
    notes: 'Music industry executive, expanding family. CEO knows personally — white glove treatment.', importBatch: 'batch-004', importedAt: '2026-03-13',
  },
  {
    id: 'ld-9', firstName: 'Christine', lastName: 'Delacroix', email: 'c.delacroix@gmail.com', phone: '(504) 555-7744',
    city: 'New Orleans', state: 'LA', source: 'website', priority: 'medium', product: 'Final Expense', coverageType: 'Individual',
    estimatedValue: 35000, leadScore: 48, scoreTier: 'warm', status: 'pool',
    distributedTo: null, assignedTo: null, distributedAt: null, assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Website inquiry — final expense pricing page', nextFollowUp: '2026-03-17',
    notes: 'Retired teacher, age 67. Looking for affordable burial coverage.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-10', firstName: 'William', lastName: 'Kowalski', email: 'w.kowalski@outlook.com', phone: '(414) 555-5561',
    city: 'Milwaukee', state: 'WI', source: 'csv_import', priority: 'low', product: 'Term Life', coverageType: 'Individual',
    estimatedValue: 75000, leadScore: 35, scoreTier: 'cold', status: 'pool',
    distributedTo: null, assignedTo: null, distributedAt: null, assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Imported from purchased list — unverified', nextFollowUp: '2026-03-20',
    notes: 'Factory worker, age 38. Basic term life prospect. Needs income verification.', importBatch: 'batch-003', importedAt: '2026-03-10',
  },
  {
    id: 'ld-11', firstName: 'Angela', lastName: 'Moretti', email: 'angela.moretti@gmail.com', phone: '(201) 555-8834',
    city: 'Jersey City', state: 'NJ', source: 'partner_referral', priority: 'high', product: 'IUL', coverageType: 'Individual',
    estimatedValue: 450000, leadScore: 78, scoreTier: 'hot', status: 'pool',
    distributedTo: null, assignedTo: null, distributedAt: null, assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Referred by CPA firm — tax planning discussion', nextFollowUp: '2026-03-15',
    notes: 'Restaurant owner, multiple locations. CPA recommends IUL for tax shelter.', importBatch: 'batch-002', importedAt: '2026-03-05',
  },
  {
    id: 'ld-12', firstName: 'Derek', lastName: 'Saunders', email: 'derek.saunders@email.com', phone: '(704) 555-2290',
    city: 'Charlotte', state: 'NC', source: 'marketing_campaign', priority: 'medium', product: 'Annuity', coverageType: 'Individual',
    estimatedValue: 200000, leadScore: 58, scoreTier: 'warm', status: 'pool',
    distributedTo: null, assignedTo: null, distributedAt: null, assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Downloaded annuity comparison guide from campaign', nextFollowUp: '2026-03-18',
    notes: 'IT director, age 55, pre-retirement planning. Interested in fixed index annuity.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },

  // ── DISTRIBUTED (8 leads) — status: 'distributed', distributedTo: manager, assignedTo: null, pipelineStage: 'new' ──
  {
    id: 'ld-13', firstName: 'Roberto', lastName: 'Espinoza', email: 'roberto.espinoza@gmail.com', phone: '(210) 555-4401',
    city: 'San Antonio', state: 'TX', source: 'marketing_campaign', priority: 'high', product: 'IUL', coverageType: 'Individual',
    estimatedValue: 375000, leadScore: 74, scoreTier: 'hot', status: 'distributed',
    distributedTo: 'Marcus Rivera', assignedTo: null, distributedAt: '2026-03-12', assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Distributed to Team Alpha — awaiting agent assignment', nextFollowUp: '2026-03-15',
    notes: 'Attorney, age 44. Interested in IUL for estate planning. Responded to direct mail.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-14', firstName: 'Vanessa', lastName: 'Reid', email: 'vanessa.reid@outlook.com', phone: '(407) 555-6632',
    city: 'Orlando', state: 'FL', source: 'executive_referral', priority: 'urgent', product: 'Whole Life', coverageType: 'Family',
    estimatedValue: 500000, leadScore: 91, scoreTier: 'on_fire', status: 'distributed',
    distributedTo: 'Jennifer Walsh', assignedTo: null, distributedAt: '2026-03-13', assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Distributed to Team Beta — executive priority flag', nextFollowUp: '2026-03-14',
    notes: 'Orthopedic surgeon, new practice. Heritage director personal referral. High value.', importBatch: 'batch-004', importedAt: '2026-03-13',
  },
  {
    id: 'ld-15', firstName: 'Terrence', lastName: 'Boyd', email: 'terrence.boyd@yahoo.com', phone: '(720) 555-1199',
    city: 'Denver', state: 'CO', source: 'website', priority: 'medium', product: 'Term Life', coverageType: 'Individual',
    estimatedValue: 200000, leadScore: 52, scoreTier: 'warm', status: 'distributed',
    distributedTo: 'Kevin Park', assignedTo: null, distributedAt: '2026-03-11', assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Distributed to Team Gamma — pending assignment', nextFollowUp: '2026-03-16',
    notes: 'Construction manager, age 36. Needs term coverage for new mortgage.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-16', firstName: 'Jasmine', lastName: 'Patel', email: 'jasmine.patel@gmail.com', phone: '(470) 555-8856',
    city: 'Marietta', state: 'GA', source: 'partner_referral', priority: 'high', product: 'Annuity', coverageType: 'Individual',
    estimatedValue: 350000, leadScore: 80, scoreTier: 'on_fire', status: 'distributed',
    distributedTo: 'Natasha Romero', assignedTo: null, distributedAt: '2026-03-12', assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Distributed to Team Delta — partner referral priority', nextFollowUp: '2026-03-15',
    notes: 'Pharmacist, nearing retirement. Edward Jones advisor referred for annuity rollover.', importBatch: 'batch-002', importedAt: '2026-03-05',
  },
  {
    id: 'ld-17', firstName: 'Carl', lastName: 'Henderson', email: 'carl.henderson@email.com', phone: '(919) 555-3347',
    city: 'Raleigh', state: 'NC', source: 'cold_list', priority: 'low', product: 'Final Expense', coverageType: 'Individual',
    estimatedValue: 30000, leadScore: 38, scoreTier: 'cold', status: 'distributed',
    distributedTo: 'Brandon Mills', assignedTo: null, distributedAt: '2026-03-11', assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Distributed to Team Echo — cold lead for training agents', nextFollowUp: '2026-03-18',
    notes: 'Retired postal worker, age 69. Final expense prospect from purchased list.', importBatch: 'batch-003', importedAt: '2026-03-10',
  },
  {
    id: 'ld-18', firstName: 'Monica', lastName: 'Chang', email: 'monica.chang@protonmail.com', phone: '(206) 555-9923',
    city: 'Seattle', state: 'WA', source: 'marketing_campaign', priority: 'medium', product: 'IUL', coverageType: 'Individual',
    estimatedValue: 275000, leadScore: 63, scoreTier: 'hot', status: 'distributed',
    distributedTo: 'Marcus Rivera', assignedTo: null, distributedAt: '2026-03-12', assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Distributed to Team Alpha — marketing qualified lead', nextFollowUp: '2026-03-16',
    notes: 'Software architect at Amazon, age 39. Clicked IUL campaign, downloaded whitepaper.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-19', firstName: 'Frank', lastName: 'Napolitano', email: 'frank.napolitano@gmail.com', phone: '(856) 555-4478',
    city: 'Cherry Hill', state: 'NJ', source: 'csv_import', priority: 'medium', product: 'Whole Life', coverageType: 'Individual',
    estimatedValue: 180000, leadScore: 47, scoreTier: 'warm', status: 'distributed',
    distributedTo: 'Jennifer Walsh', assignedTo: null, distributedAt: '2026-03-11', assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Distributed to Team Beta — awaiting agent assignment', nextFollowUp: '2026-03-17',
    notes: 'Small business owner, plumbing company. Imported from trade association list.', importBatch: 'batch-003', importedAt: '2026-03-10',
  },
  {
    id: 'ld-20', firstName: 'Keisha', lastName: 'Lawson', email: 'keisha.lawson@yahoo.com', phone: '(901) 555-6614',
    city: 'Memphis', state: 'TN', source: 'website', priority: 'medium', product: 'Term Life', coverageType: 'Family',
    estimatedValue: 250000, leadScore: 56, scoreTier: 'warm', status: 'distributed',
    distributedTo: 'Kevin Park', assignedTo: null, distributedAt: '2026-03-12', assignedAt: null,
    pipelineStage: 'new', lastActivity: 'Distributed to Team Gamma — website lead', nextFollowUp: '2026-03-16',
    notes: 'Nurse practitioner, age 33, newlywed. Submitted family term quote request online.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },

  // ── ASSIGNED (8 leads) — status: 'assigned', distributedTo: manager, assignedTo: agent, pipelineStage: 'contacted' or 'qualified' ──
  {
    id: 'ld-21', firstName: 'Victor', lastName: 'Reyes', email: 'victor.reyes@gmail.com', phone: '(213) 555-7789',
    city: 'Los Angeles', state: 'CA', source: 'executive_referral', priority: 'urgent', product: 'IUL', coverageType: 'Individual',
    estimatedValue: 500000, leadScore: 95, scoreTier: 'on_fire', status: 'assigned',
    distributedTo: 'Marcus Rivera', assignedTo: 'Sarah Johnson', distributedAt: '2026-03-08', assignedAt: '2026-03-09',
    pipelineStage: 'qualified', lastActivity: 'Called — qualified, scheduling needs analysis', nextFollowUp: '2026-03-15',
    notes: 'Real estate developer. Heritage CEO referral. Wants IUL for key person insurance.', importBatch: 'batch-004', importedAt: '2026-03-13',
  },
  {
    id: 'ld-22', firstName: 'Catherine', lastName: 'O\'Brien', email: 'c.obrien@outlook.com', phone: '(617) 555-2234',
    city: 'Boston', state: 'MA', source: 'partner_referral', priority: 'high', product: 'Annuity', coverageType: 'Individual',
    estimatedValue: 400000, leadScore: 82, scoreTier: 'on_fire', status: 'assigned',
    distributedTo: 'Jennifer Walsh', assignedTo: 'Mike Chen', distributedAt: '2026-03-07', assignedAt: '2026-03-08',
    pipelineStage: 'qualified', lastActivity: 'Phone consultation complete — gathering financials', nextFollowUp: '2026-03-16',
    notes: 'University professor, age 58. Fidelity advisor referred for retirement annuity.', importBatch: 'batch-002', importedAt: '2026-03-05',
  },
  {
    id: 'ld-23', firstName: 'James', lastName: 'Thornton', email: 'james.thornton@email.com', phone: '(480) 555-9901',
    city: 'Scottsdale', state: 'AZ', source: 'marketing_campaign', priority: 'medium', product: 'Whole Life', coverageType: 'Family',
    estimatedValue: 300000, leadScore: 65, scoreTier: 'hot', status: 'assigned',
    distributedTo: 'Kevin Park', assignedTo: 'David Brown', distributedAt: '2026-03-06', assignedAt: '2026-03-07',
    pipelineStage: 'contacted', lastActivity: 'Called — left voicemail, sent follow-up email', nextFollowUp: '2026-03-15',
    notes: 'Dentist, age 41, 3 kids. Responded to whole life campaign. Initial call — very interested.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-24', firstName: 'Brenda', lastName: 'McAllister', email: 'brenda.mcallister@gmail.com', phone: '(615) 555-1156',
    city: 'Franklin', state: 'TN', source: 'website', priority: 'medium', product: 'Term Life', coverageType: 'Individual',
    estimatedValue: 200000, leadScore: 59, scoreTier: 'warm', status: 'assigned',
    distributedTo: 'Natasha Romero', assignedTo: 'Rachel Green', distributedAt: '2026-03-06', assignedAt: '2026-03-07',
    pipelineStage: 'contacted', lastActivity: 'Email sent — follow up template with term options', nextFollowUp: '2026-03-16',
    notes: 'HR manager, age 37. Submitted website form. Interested in supplemental term coverage.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-25', firstName: 'Philip', lastName: 'Nakamura', email: 'philip.nakamura@yahoo.com', phone: '(415) 555-3367',
    city: 'San Francisco', state: 'CA', source: 'partner_referral', priority: 'high', product: 'IUL', coverageType: 'Individual',
    estimatedValue: 450000, leadScore: 76, scoreTier: 'hot', status: 'assigned',
    distributedTo: 'Brandon Mills', assignedTo: 'Emily Davis', distributedAt: '2026-03-07', assignedAt: '2026-03-08',
    pipelineStage: 'qualified', lastActivity: 'Needs analysis complete — preparing illustration', nextFollowUp: '2026-03-15',
    notes: 'Tech startup founder. Financial planner referral. Wants IUL for wealth accumulation.', importBatch: 'batch-002', importedAt: '2026-03-05',
  },
  {
    id: 'ld-26', firstName: 'Irene', lastName: 'Fitzgerald', email: 'irene.fitzgerald@email.com', phone: '(314) 555-8843',
    city: 'St. Louis', state: 'MO', source: 'cold_list', priority: 'medium', product: 'Final Expense', coverageType: 'Individual',
    estimatedValue: 40000, leadScore: 51, scoreTier: 'warm', status: 'assigned',
    distributedTo: 'Marcus Rivera', assignedTo: 'Amanda Torres', distributedAt: '2026-03-08', assignedAt: '2026-03-09',
    pipelineStage: 'contacted', lastActivity: 'Called — interested, wants brochure mailed', nextFollowUp: '2026-03-17',
    notes: 'Widow, age 72. Lives alone, concerned about burial costs. Wants simple final expense.', importBatch: 'batch-003', importedAt: '2026-03-10',
  },
  {
    id: 'ld-27', firstName: 'Douglas', lastName: 'Kim', email: 'douglas.kim@protonmail.com', phone: '(702) 555-5578',
    city: 'Las Vegas', state: 'NV', source: 'marketing_campaign', priority: 'high', product: 'Annuity', coverageType: 'Individual',
    estimatedValue: 300000, leadScore: 71, scoreTier: 'hot', status: 'assigned',
    distributedTo: 'Jennifer Walsh', assignedTo: 'Victor Nguyen', distributedAt: '2026-03-08', assignedAt: '2026-03-09',
    pipelineStage: 'contacted', lastActivity: 'Called — set callback for Thursday evening', nextFollowUp: '2026-03-15',
    notes: 'Casino floor manager, age 52. Responded to annuity mailer. Wants guaranteed income.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-28', firstName: 'Sharon', lastName: 'Bridges', email: 'sharon.bridges@gmail.com', phone: '(404) 555-4421',
    city: 'Decatur', state: 'GA', source: 'executive_referral', priority: 'high', product: 'Whole Life', coverageType: 'Family',
    estimatedValue: 350000, leadScore: 83, scoreTier: 'on_fire', status: 'assigned',
    distributedTo: 'Natasha Romero', assignedTo: 'Nicole Harris', distributedAt: '2026-03-09', assignedAt: '2026-03-10',
    pipelineStage: 'qualified', lastActivity: 'Qualified — family needs analysis scheduled', nextFollowUp: '2026-03-16',
    notes: 'Pastor, community leader. Heritage director church connection. Whole life for family.', importBatch: 'batch-004', importedAt: '2026-03-13',
  },

  // ── IN PROGRESS (6 leads) — status: 'in_progress', pipelineStage: 'appointment_set' or 'quoted' or 'application' ──
  {
    id: 'ld-29', firstName: 'Richard', lastName: 'Castellano', email: 'r.castellano@outlook.com', phone: '(718) 555-6690',
    city: 'Brooklyn', state: 'NY', source: 'partner_referral', priority: 'urgent', product: 'IUL', coverageType: 'Individual',
    estimatedValue: 500000, leadScore: 94, scoreTier: 'on_fire', status: 'in_progress',
    distributedTo: 'Marcus Rivera', assignedTo: 'Sarah Johnson', distributedAt: '2026-03-01', assignedAt: '2026-03-02',
    pipelineStage: 'application', lastActivity: 'Application submitted — pending paramedical exam', nextFollowUp: '2026-03-17',
    notes: 'Import/export business owner. Morgan Stanley referral. $500K IUL application in underwriting.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-30', firstName: 'Linda', lastName: 'Petersen', email: 'linda.petersen@yahoo.com', phone: '(858) 555-2278',
    city: 'San Diego', state: 'CA', source: 'marketing_campaign', priority: 'high', product: 'Annuity', coverageType: 'Individual',
    estimatedValue: 350000, leadScore: 87, scoreTier: 'on_fire', status: 'in_progress',
    distributedTo: 'Jennifer Walsh', assignedTo: 'Mike Chen', distributedAt: '2026-03-03', assignedAt: '2026-03-04',
    pipelineStage: 'quoted', lastActivity: 'Illustration presented — client reviewing with spouse', nextFollowUp: '2026-03-16',
    notes: 'School principal retiring June 2026. Fixed index annuity quote presented. Comparing carriers.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-31', firstName: 'Howard', lastName: 'Grant', email: 'howard.grant@gmail.com', phone: '(404) 555-8812',
    city: 'Alpharetta', state: 'GA', source: 'executive_referral', priority: 'high', product: 'Whole Life', coverageType: 'Family',
    estimatedValue: 400000, leadScore: 79, scoreTier: 'hot', status: 'in_progress',
    distributedTo: 'Kevin Park', assignedTo: 'David Brown', distributedAt: '2026-03-04', assignedAt: '2026-03-05',
    pipelineStage: 'appointment_set', lastActivity: 'In-home appointment scheduled for March 18', nextFollowUp: '2026-03-18',
    notes: 'Regional VP at Coca-Cola. Heritage owner golf buddy. Whole life for legacy planning.', importBatch: 'batch-002', importedAt: '2026-03-05',
  },
  {
    id: 'ld-32', firstName: 'Evelyn', lastName: 'Tran', email: 'evelyn.tran@email.com', phone: '(972) 555-3390',
    city: 'Plano', state: 'TX', source: 'website', priority: 'medium', product: 'Term Life', coverageType: 'Individual',
    estimatedValue: 250000, leadScore: 68, scoreTier: 'hot', status: 'in_progress',
    distributedTo: 'Natasha Romero', assignedTo: 'Rachel Green', distributedAt: '2026-03-05', assignedAt: '2026-03-06',
    pipelineStage: 'quoted', lastActivity: 'Quote sent via email — 20-year term $250K', nextFollowUp: '2026-03-15',
    notes: 'Software engineer, age 32, first child on the way. 20-year term quote competitive.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-33', firstName: 'Nelson', lastName: 'Alvarez', email: 'nelson.alvarez@outlook.com', phone: '(786) 555-4456',
    city: 'Coral Gables', state: 'FL', source: 'partner_referral', priority: 'high', product: 'IUL', coverageType: 'Individual',
    estimatedValue: 450000, leadScore: 88, scoreTier: 'on_fire', status: 'in_progress',
    distributedTo: 'Brandon Mills', assignedTo: 'Emily Davis', distributedAt: '2026-03-03', assignedAt: '2026-03-04',
    pipelineStage: 'application', lastActivity: 'Application signed — awaiting lab results from Quest', nextFollowUp: '2026-03-20',
    notes: 'Cardiologist in private practice. Merrill Lynch advisor referral. IUL for tax benefits.', importBatch: 'batch-002', importedAt: '2026-03-05',
  },
  {
    id: 'ld-34', firstName: 'Gloria', lastName: 'Chambers', email: 'gloria.chambers@gmail.com', phone: '(901) 555-1167',
    city: 'Germantown', state: 'TN', source: 'cold_list', priority: 'medium', product: 'Final Expense', coverageType: 'Individual',
    estimatedValue: 35000, leadScore: 62, scoreTier: 'hot', status: 'in_progress',
    distributedTo: 'Marcus Rivera', assignedTo: 'Amanda Torres', distributedAt: '2026-03-05', assignedAt: '2026-03-06',
    pipelineStage: 'appointment_set', lastActivity: 'Kitchen table appointment set for March 17', nextFollowUp: '2026-03-17',
    notes: 'Retired nurse, age 68. Very interested in simplified issue final expense. No exam needed.', importBatch: 'batch-003', importedAt: '2026-03-10',
  },

  // ── CONVERTED (4 leads) — status: 'converted', pipelineStage: 'placed' ──
  {
    id: 'ld-35', firstName: 'Arthur', lastName: 'Blackwell', email: 'a.blackwell@yahoo.com', phone: '(678) 555-7723',
    city: 'Roswell', state: 'GA', source: 'executive_referral', priority: 'urgent', product: 'IUL', coverageType: 'Individual',
    estimatedValue: 500000, leadScore: 98, scoreTier: 'on_fire', status: 'converted',
    distributedTo: 'Marcus Rivera', assignedTo: 'Sarah Johnson', distributedAt: '2026-02-20', assignedAt: '2026-02-21',
    pipelineStage: 'placed', lastActivity: 'Policy placed — $500K IUL issued and delivered', nextFollowUp: '2026-04-15',
    notes: 'Hedge fund manager. Heritage CEO direct referral. Policy placed in 18 days — record close.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-36', firstName: 'Dorothy', lastName: 'Simmons', email: 'dorothy.simmons@email.com', phone: '(502) 555-9945',
    city: 'Louisville', state: 'KY', source: 'marketing_campaign', priority: 'high', product: 'Annuity', coverageType: 'Individual',
    estimatedValue: 275000, leadScore: 96, scoreTier: 'on_fire', status: 'converted',
    distributedTo: 'Jennifer Walsh', assignedTo: 'Mike Chen', distributedAt: '2026-02-22', assignedAt: '2026-02-23',
    pipelineStage: 'placed', lastActivity: 'Annuity funded — $275K fixed index annuity', nextFollowUp: '2026-04-20',
    notes: 'Retired school superintendent. Fixed index annuity with 5-year guarantee. Very satisfied.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
  {
    id: 'ld-37', firstName: 'Eugene', lastName: 'Wallace', email: 'eugene.wallace@gmail.com', phone: '(615) 555-5534',
    city: 'Brentwood', state: 'TN', source: 'partner_referral', priority: 'high', product: 'Whole Life', coverageType: 'Family',
    estimatedValue: 350000, leadScore: 97, scoreTier: 'on_fire', status: 'converted',
    distributedTo: 'Kevin Park', assignedTo: 'David Brown', distributedAt: '2026-02-25', assignedAt: '2026-02-26',
    pipelineStage: 'placed', lastActivity: 'Policy delivered — family whole life plan in force', nextFollowUp: '2026-04-25',
    notes: 'Country music producer. Edward Jones referral. $350K whole life — legacy planning.', importBatch: 'batch-002', importedAt: '2026-03-05',
  },
  {
    id: 'ld-38', firstName: 'Margaret', lastName: 'Chen', email: 'margaret.chen@outlook.com', phone: '(916) 555-2201',
    city: 'Sacramento', state: 'CA', source: 'website', priority: 'medium', product: 'Term Life', coverageType: 'Individual',
    estimatedValue: 200000, leadScore: 93, scoreTier: 'on_fire', status: 'converted',
    distributedTo: 'Natasha Romero', assignedTo: 'Nicole Harris', distributedAt: '2026-02-18', assignedAt: '2026-02-19',
    pipelineStage: 'placed', lastActivity: 'Term policy issued — 20yr $200K preferred rates', nextFollowUp: '2026-04-10',
    notes: 'State employee, age 34. Quick close — clean health history. Great candidate for future IUL upsell.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },

  // ── LOST (2 leads) — status: 'lost', pipelineStage: 'lost' ──
  {
    id: 'ld-39', firstName: 'Stanley', lastName: 'Morrison', email: 'stanley.morrison@yahoo.com', phone: '(216) 555-8867',
    city: 'Cleveland', state: 'OH', source: 'cold_list', priority: 'low', product: 'Whole Life', coverageType: 'Individual',
    estimatedValue: 150000, leadScore: 31, scoreTier: 'cold', status: 'lost',
    distributedTo: 'Brandon Mills', assignedTo: 'Emily Davis', distributedAt: '2026-02-15', assignedAt: '2026-02-16',
    pipelineStage: 'lost', lastActivity: 'Marked lost — client purchased through competitor', nextFollowUp: '2026-06-15',
    notes: 'Lost to competitor. Client had existing relationship. Set 90-day follow-up for review.', importBatch: 'batch-003', importedAt: '2026-03-10',
  },
  {
    id: 'ld-40', firstName: 'Betty', lastName: 'Hoffman', email: 'betty.hoffman@email.com', phone: '(412) 555-3312',
    city: 'Pittsburgh', state: 'PA', source: 'marketing_campaign', priority: 'medium', product: 'Final Expense', coverageType: 'Individual',
    estimatedValue: 25000, leadScore: 34, scoreTier: 'cold', status: 'lost',
    distributedTo: 'Natasha Romero', assignedTo: 'Rachel Green', distributedAt: '2026-02-20', assignedAt: '2026-02-21',
    pipelineStage: 'lost', lastActivity: 'Marked lost — client unresponsive after 6 attempts', nextFollowUp: '2026-06-20',
    notes: 'Could not reach after multiple calls, emails, and one mailer. Moved to nurture list.', importBatch: 'batch-001', importedAt: '2026-03-01',
  },
];

// ── EXECUTIVE DISTRIBUTION HISTORY (6 records) ──────

export const DEMO_EXEC_DISTRIBUTION_HISTORY: ExecDistributionRecord[] = [
  { id: 'dist-001', date: '2026-03-01', leadsDistributed: 15, managersCount: 5, distributedBy: 'Heritage Executive', perManager: '3 each', method: 'even' },
  { id: 'dist-002', date: '2026-03-05', leadsDistributed: 10, managersCount: 5, distributedBy: 'Heritage Executive', perManager: '2 each', method: 'even' },
  { id: 'dist-003', date: '2026-03-08', leadsDistributed: 8, managersCount: 4, distributedBy: 'Heritage Executive', perManager: '2 each', method: 'even' },
  { id: 'dist-004', date: '2026-03-10', leadsDistributed: 12, managersCount: 5, distributedBy: 'Heritage Executive', perManager: '2–3 each', method: 'even' },
  { id: 'dist-005', date: '2026-03-12', leadsDistributed: 10, managersCount: 5, distributedBy: 'Heritage Executive', perManager: '2 each', method: 'weighted' },
  { id: 'dist-006', date: '2026-03-13', leadsDistributed: 8, managersCount: 3, distributedBy: 'Heritage Executive', perManager: '2–3 each', method: 'manual' },
];

// ── IMPORT BATCHES (4 records) ───────────────────────

export const DEMO_IMPORT_BATCHES: ImportBatch[] = [
  { id: 'batch-001', fileName: 'Q1_Leads_MarketingCampaign.csv', importedAt: '2026-03-01', totalLeads: 15, status: 'complete', importedBy: 'Heritage Executive' },
  { id: 'batch-002', fileName: 'Partner_Referrals_March.xlsx', importedAt: '2026-03-05', totalLeads: 10, status: 'complete', importedBy: 'Heritage Executive' },
  { id: 'batch-003', fileName: 'Cold_List_Southeast.csv', importedAt: '2026-03-10', totalLeads: 12, status: 'complete', importedBy: 'Heritage Executive' },
  { id: 'batch-004', fileName: 'Executive_Referrals.csv', importedAt: '2026-03-13', totalLeads: 3, status: 'complete', importedBy: 'Heritage Executive' },
];

// ── LEAD ACTIVITIES (~20 entries) ────────────────────

export const DEMO_LEAD_ACTIVITIES: LeadActivity[] = [
  { id: 'la-01', leadId: 'ld-35', type: 'distribution', description: 'Lead distributed to Team Alpha (Marcus Rivera)', performedBy: 'Heritage Executive', timestamp: '2026-02-20T09:00:00' },
  { id: 'la-02', leadId: 'ld-35', type: 'assignment', description: 'Assigned to Sarah Johnson — executive priority', performedBy: 'Marcus Rivera', timestamp: '2026-02-21T08:30:00' },
  { id: 'la-03', leadId: 'ld-35', type: 'call', description: 'Initial call — client very interested, scheduled needs analysis', performedBy: 'Sarah Johnson', timestamp: '2026-02-21T14:15:00' },
  { id: 'la-04', leadId: 'ld-35', type: 'score_update', description: 'Lead score updated: 88 → 98 (qualified, high engagement)', performedBy: 'System', timestamp: '2026-02-22T10:00:00' },
  { id: 'la-05', leadId: 'ld-35', type: 'status_change', description: 'Status changed: in_progress → converted (policy placed)', performedBy: 'Sarah Johnson', timestamp: '2026-03-10T16:45:00' },
  { id: 'la-06', leadId: 'ld-36', type: 'distribution', description: 'Lead distributed to Team Beta (Jennifer Walsh)', performedBy: 'Heritage Executive', timestamp: '2026-02-22T09:15:00' },
  { id: 'la-07', leadId: 'ld-36', type: 'assignment', description: 'Assigned to Mike Chen — annuity specialist', performedBy: 'Jennifer Walsh', timestamp: '2026-02-23T08:00:00' },
  { id: 'la-08', leadId: 'ld-36', type: 'email', description: 'Sent annuity comparison packet with 3 carrier options', performedBy: 'Mike Chen', timestamp: '2026-02-24T11:30:00' },
  { id: 'la-09', leadId: 'ld-29', type: 'call', description: 'Follow-up call — application paperwork review and signature', performedBy: 'Sarah Johnson', timestamp: '2026-03-08T13:00:00' },
  { id: 'la-10', leadId: 'ld-29', type: 'note', description: 'Paramedical exam scheduled for March 19 at client home', performedBy: 'Sarah Johnson', timestamp: '2026-03-09T09:30:00' },
  { id: 'la-11', leadId: 'ld-39', type: 'status_change', description: 'Status changed: in_progress → lost (purchased competitor policy)', performedBy: 'Emily Davis', timestamp: '2026-03-05T17:00:00' },
  { id: 'la-12', leadId: 'ld-39', type: 'note', description: 'Client went with a competitor — had existing advisor relationship. Set 90-day revisit.', performedBy: 'Emily Davis', timestamp: '2026-03-05T17:05:00' },
  { id: 'la-13', leadId: 'ld-21', type: 'assignment', description: 'Assigned to Sarah Johnson — top producer for exec referrals', performedBy: 'Marcus Rivera', timestamp: '2026-03-09T08:15:00' },
  { id: 'la-14', leadId: 'ld-21', type: 'call', description: 'Intro call — client confirmed interest, reviewing current coverage', performedBy: 'Sarah Johnson', timestamp: '2026-03-10T10:45:00' },
  { id: 'la-15', leadId: 'ld-30', type: 'email', description: 'Sent fixed index annuity illustration — 3 scenarios presented', performedBy: 'Mike Chen', timestamp: '2026-03-11T14:00:00' },
  { id: 'la-16', leadId: 'ld-33', type: 'status_change', description: 'Status changed: assigned → in_progress (application started)', performedBy: 'Emily Davis', timestamp: '2026-03-10T11:00:00' },
  { id: 'la-17', leadId: 'ld-40', type: 'call', description: 'Attempt #6 — no answer, voicemail full. Recommending lost status.', performedBy: 'Rachel Green', timestamp: '2026-03-07T16:30:00' },
  { id: 'la-18', leadId: 'ld-40', type: 'status_change', description: 'Status changed: assigned → lost (unresponsive after 6 attempts)', performedBy: 'Rachel Green', timestamp: '2026-03-08T09:00:00' },
  { id: 'la-19', leadId: 'ld-13', type: 'distribution', description: 'Lead distributed to Team Alpha (Marcus Rivera) — marketing qualified', performedBy: 'Heritage Executive', timestamp: '2026-03-12T10:00:00' },
  { id: 'la-20', leadId: 'ld-31', type: 'call', description: 'Confirmed in-home appointment March 18 at 6pm — spouse will attend', performedBy: 'David Brown', timestamp: '2026-03-12T15:30:00' },
];
