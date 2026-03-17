/**
 * Manager Lounge — Shared Constants & Demo Data
 * Heritage Design System — Emerald theme
 */

import { CSSProperties } from 'react';

// Agency master contract level — used for override calculations
export const AGENCY_CONTRACT_LEVEL = 115;

// Glass card style object — used across all manager pages
// Matches GLASS.css.light from heritageDesignSystem with specular edge border
export const glassCard: CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
};

// Emerald → Coral gradient constants
export const MANAGER_GRADIENT = 'from-emerald-600 via-teal-600 to-rose-400';
export const MANAGER_GRADIENT_CSS = 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)';
export const MANAGER_GRADIENT_CORAL_CSS = 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)';
export const MANAGER_ICON_GRADIENT = 'from-emerald-500 to-emerald-700';

// ─── SPARKLINE DEMO DATA ─────────────────────────
// 30-point arrays for monthly KPI trends
export const SPARKLINE_REVENUE = [84, 88, 92, 89, 95, 98, 102, 97, 105, 108, 112, 110, 115, 118, 120, 116, 122, 124, 119, 126, 128, 130, 127, 132, 135, 138, 134, 140, 142, 145];
export const SPARKLINE_PIPELINE = [720, 735, 748, 740, 755, 762, 780, 775, 790, 800, 812, 805, 820, 830, 838, 825, 840, 847, 835, 852, 860, 868, 855, 872, 880, 888, 876, 892, 900, 910];
export const SPARKLINE_WIN_RATE = [78, 80, 82, 81, 84, 85, 87, 86, 88, 89, 90, 88, 91, 92, 92, 90, 93, 94, 92, 95, 94, 96, 95, 97, 96, 98, 97, 99, 98, 100];
export const SPARKLINE_TEAM_SIZE = [10, 10, 10, 10, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12];

// Commissions sparklines
export const SPARKLINE_COMMISSIONS_PENDING = [15, 18, 16, 20, 22, 19, 24, 21, 25, 23, 27, 26, 28, 24, 30, 28, 32, 29, 34, 31, 35, 33, 36, 34, 38, 35, 39, 37, 40, 38];
export const SPARKLINE_COMMISSIONS_PAID = [42, 45, 48, 50, 53, 56, 58, 62, 65, 68, 72, 75, 78, 82, 85, 88, 92, 95, 98, 102, 105, 108, 112, 115, 118, 122, 125, 128, 132, 145];
export const SPARKLINE_CHARGEBACK = [5, 4, 6, 3, 5, 4, 3, 5, 2, 4, 3, 5, 2, 3, 4, 2, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 3, 1, 2, 3];
export const SPARKLINE_CONTRACT_LEVEL = [82, 83, 84, 83, 85, 84, 86, 85, 87, 86, 87, 86, 88, 87, 88, 87, 89, 88, 89, 88, 90, 89, 90, 89, 91, 90, 91, 90, 91, 92];

// Forecasting sparklines
export const SPARKLINE_FORECAST_ACCURACY = [82, 84, 85, 83, 86, 87, 85, 88, 86, 89, 87, 90, 88, 91, 89, 92, 90, 91, 89, 92, 91, 93, 90, 92, 91, 93, 92, 94, 93, 95];

// Retention & compliance sparklines
export const SPARKLINE_RETENTION = [88, 89, 88, 90, 89, 91, 90, 92, 91, 93, 92, 93, 92, 94, 93, 94, 93, 95, 94, 95, 94, 96, 95, 96, 95, 97, 96, 97, 96, 97];
export const SPARKLINE_COMPLIANCE = [90, 91, 92, 91, 93, 92, 94, 93, 95, 94, 95, 94, 96, 95, 96, 95, 97, 96, 97, 96, 98, 97, 98, 97, 98, 97, 99, 98, 99, 98];

// Per-agent 7-day sparklines
export const AGENT_SPARKLINES: Record<string, { calls: number[]; revenue: number[]; deals: number[] }> = {
  'agent-1': { calls: [12, 15, 14, 18, 16, 20, 19], revenue: [8, 12, 10, 15, 13, 18, 16], deals: [2, 3, 2, 4, 3, 5, 4] },
  'agent-2': { calls: [8, 10, 9, 12, 11, 14, 13], revenue: [5, 7, 6, 9, 8, 11, 10], deals: [1, 2, 1, 3, 2, 3, 2] },
  'agent-3': { calls: [18, 20, 22, 21, 24, 23, 26], revenue: [14, 16, 18, 17, 20, 19, 22], deals: [4, 5, 4, 6, 5, 7, 6] },
  'agent-4': { calls: [6, 8, 7, 10, 9, 11, 10], revenue: [3, 5, 4, 7, 6, 8, 7], deals: [1, 1, 1, 2, 1, 2, 2] },
  'agent-5': { calls: [14, 16, 15, 18, 17, 20, 19], revenue: [10, 12, 11, 14, 13, 16, 15], deals: [3, 4, 3, 5, 4, 5, 4] },
  'agent-6': { calls: [10, 12, 11, 14, 13, 16, 15], revenue: [6, 8, 7, 10, 9, 12, 11], deals: [2, 2, 2, 3, 2, 3, 3] },
  'agent-7': { calls: [20, 22, 24, 23, 26, 25, 28], revenue: [16, 18, 20, 19, 22, 21, 24], deals: [5, 6, 5, 7, 6, 8, 7] },
  'agent-8': { calls: [4, 5, 4, 6, 5, 7, 6], revenue: [2, 3, 2, 4, 3, 5, 4], deals: [0, 1, 0, 1, 1, 1, 1] },
  'agent-9': { calls: [16, 18, 17, 20, 19, 22, 21], revenue: [12, 14, 13, 16, 15, 18, 17], deals: [3, 4, 3, 5, 4, 6, 5] },
  'agent-10': { calls: [9, 11, 10, 13, 12, 15, 14], revenue: [5, 7, 6, 9, 8, 11, 10], deals: [1, 2, 1, 3, 2, 3, 2] },
  'agent-11': { calls: [22, 24, 26, 25, 28, 27, 30], revenue: [18, 20, 22, 21, 24, 23, 26], deals: [6, 7, 6, 8, 7, 9, 8] },
  'agent-12': { calls: [2, 3, 2, 4, 3, 5, 4], revenue: [1, 2, 1, 3, 2, 3, 2], deals: [0, 0, 0, 1, 0, 1, 0] },
};

// Product sparklines (14-day)
export const SPARKLINE_BY_PRODUCT: Record<string, number[]> = {
  IUL: [12, 14, 13, 16, 15, 18, 17, 20, 19, 22, 21, 24, 23, 26],
  'Whole Life': [8, 9, 10, 9, 11, 10, 12, 11, 13, 12, 14, 13, 15, 14],
  Term: [15, 16, 18, 17, 20, 19, 22, 21, 24, 23, 26, 25, 28, 27],
  Annuity: [5, 6, 5, 7, 6, 8, 7, 9, 8, 10, 9, 11, 10, 12],
  'Final Expense': [20, 22, 21, 24, 23, 26, 25, 28, 27, 30, 29, 32, 31, 34],
  'Universal Life': [4, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 10, 9, 11],
};

// Demo team members (shared across Team, Performance, Coaching, etc.)
// certLevel: 0=None, 1=Basic, 2=Intermediate, 3=Advanced, 4=Expert
// certStatus: current (>30d), expiring (7-30d), overdue (<7d or past)
export const DEMO_TEAM_MEMBERS = [
  { id: '1', name: 'Sarah Johnson', role: 'Senior Agent', status: 'active' as const, quota: 112, calls: 45, closes: 8, revenue: 42500, avatar: 'SJ', streak: 12, lastActive: '2 min ago', certLevel: 4 as const, certStatus: 'current' as const, modulesCompleted: 24, modulesTotal: 24, assessmentAvg: 96 },
  { id: '2', name: 'Mike Chen', role: 'Agent', status: 'active' as const, quota: 95, calls: 38, closes: 6, revenue: 38200, avatar: 'MC', streak: 7, lastActive: '15 min ago', certLevel: 3 as const, certStatus: 'current' as const, modulesCompleted: 20, modulesTotal: 24, assessmentAvg: 91 },
  { id: '3', name: 'Emily Davis', role: 'Agent', status: 'active' as const, quota: 88, calls: 32, closes: 5, revenue: 31800, avatar: 'ED', streak: 5, lastActive: '1 hr ago', certLevel: 3 as const, certStatus: 'expiring' as const, modulesCompleted: 18, modulesTotal: 24, assessmentAvg: 87 },
  { id: '4', name: 'James Wilson', role: 'Agent', status: 'away' as const, quota: 71, calls: 24, closes: 4, revenue: 28400, avatar: 'JW', streak: 3, lastActive: '3 hrs ago', certLevel: 2 as const, certStatus: 'current' as const, modulesCompleted: 14, modulesTotal: 24, assessmentAvg: 82 },
  { id: '5', name: 'Lisa Park', role: 'Junior Agent', status: 'active' as const, quota: 65, calls: 28, closes: 3, revenue: 18900, avatar: 'LP', streak: 2, lastActive: '30 min ago', certLevel: 2 as const, certStatus: 'current' as const, modulesCompleted: 12, modulesTotal: 24, assessmentAvg: 79 },
  { id: '6', name: 'David Brown', role: 'Agent', status: 'active' as const, quota: 82, calls: 35, closes: 5, revenue: 33100, avatar: 'DB', streak: 8, lastActive: '5 min ago', certLevel: 3 as const, certStatus: 'current' as const, modulesCompleted: 19, modulesTotal: 24, assessmentAvg: 89 },
  { id: '7', name: 'Rachel Green', role: 'Senior Agent', status: 'active' as const, quota: 98, calls: 41, closes: 7, revenue: 39700, avatar: 'RG', streak: 10, lastActive: '10 min ago', certLevel: 4 as const, certStatus: 'current' as const, modulesCompleted: 24, modulesTotal: 24, assessmentAvg: 94 },
  { id: '8', name: 'Carlos Martinez', role: 'Agent', status: 'away' as const, quota: 58, calls: 18, closes: 2, revenue: 14200, avatar: 'CM', streak: 0, lastActive: '5 hrs ago', certLevel: 1 as const, certStatus: 'overdue' as const, modulesCompleted: 8, modulesTotal: 24, assessmentAvg: 68 },
  { id: '9', name: 'Anna Kim', role: 'Junior Agent', status: 'offline' as const, quota: 45, calls: 12, closes: 1, revenue: 8500, avatar: 'AK', streak: 1, lastActive: 'Yesterday', certLevel: 1 as const, certStatus: 'expiring' as const, modulesCompleted: 6, modulesTotal: 24, assessmentAvg: 72 },
  { id: '10', name: 'Tom Rodriguez', role: 'Agent', status: 'active' as const, quota: 76, calls: 30, closes: 4, revenue: 25600, avatar: 'TR', streak: 4, lastActive: '20 min ago', certLevel: 2 as const, certStatus: 'current' as const, modulesCompleted: 15, modulesTotal: 24, assessmentAvg: 84 },
  { id: '11', name: 'Jessica Lee', role: 'Agent', status: 'active' as const, quota: 91, calls: 36, closes: 6, revenue: 35400, avatar: 'JL', streak: 6, lastActive: '8 min ago', certLevel: 3 as const, certStatus: 'current' as const, modulesCompleted: 21, modulesTotal: 24, assessmentAvg: 90 },
  { id: '12', name: 'Ryan Taylor', role: 'Junior Agent', status: 'offline' as const, quota: 35, calls: 8, closes: 0, revenue: 0, avatar: 'RT', streak: 0, lastActive: '2 days ago', certLevel: 0 as const, certStatus: 'overdue' as const, modulesCompleted: 2, modulesTotal: 24, assessmentAvg: 45 },
] as const;

// Demo pipeline data
export const DEMO_PIPELINE_STAGES = [
  { stage: 'New Leads', count: 24, value: 187000, color: 'bg-blue-500' },
  { stage: 'Contacted', count: 18, value: 156000, color: 'bg-amber-500' },
  { stage: 'Qualified', count: 12, value: 234000, color: 'bg-violet-500' },
  { stage: 'Proposal', count: 8, value: 168000, color: 'bg-emerald-500' },
  { stage: 'Closed Won', count: 6, value: 102000, color: 'bg-green-600' },
] as const;

// Demo escalations
export const DEMO_ESCALATIONS = [
  { id: '1', type: 'Compliance Review', agent: 'Mike Chen', lead: 'Robert M.', priority: 'high' as const, status: 'open' as const, date: 'Today', description: 'Policy documentation incomplete — requires manager review before submission.' },
  { id: '2', type: 'Discount Approval', agent: 'Emily Davis', lead: 'Susan K.', priority: 'medium' as const, status: 'open' as const, date: 'Today', description: 'Client requesting 15% premium discount on whole life policy.' },
  { id: '3', type: 'Policy Exception', agent: 'James Wilson', lead: 'Thomas L.', priority: 'medium' as const, status: 'in_progress' as const, date: 'Yesterday', description: 'Non-standard underwriting request for pre-existing condition.' },
  { id: '4', type: 'Client Complaint', agent: 'Carlos Martinez', lead: 'Jennifer W.', priority: 'high' as const, status: 'open' as const, date: 'Yesterday', description: 'Client unhappy with claim processing timeline.' },
  { id: '5', type: 'Training Gap', agent: 'Ryan Taylor', lead: 'N/A', priority: 'low' as const, status: 'open' as const, date: '2 days ago', description: 'Agent needs additional IUL product training before client meetings.' },
  { id: '6', type: 'Commission Dispute', agent: 'Lisa Park', lead: 'Mark D.', priority: 'medium' as const, status: 'resolved' as const, date: '3 days ago', description: 'Split commission calculation discrepancy on team sale.' },
] as const;

// Demo coaching sessions
export const DEMO_COACHING_SESSIONS = [
  { id: '1', agent: 'Carlos Martinez', topic: 'Closing Techniques', date: 'Tomorrow', time: '10:00 AM', status: 'scheduled' as const },
  { id: '2', agent: 'Ryan Taylor', topic: 'IUL Product Knowledge', date: 'Tomorrow', time: '2:00 PM', status: 'scheduled' as const },
  { id: '3', agent: 'Anna Kim', topic: 'Lead Follow-up Strategy', date: 'Mar 4', time: '11:00 AM', status: 'scheduled' as const },
  { id: '4', agent: 'Lisa Park', topic: 'Objection Handling', date: 'Mar 5', time: '9:00 AM', status: 'scheduled' as const },
] as const;

// Demo meetings
export const DEMO_MEETINGS = [
  { id: '1', title: 'Weekly Team Standup', date: 'Tomorrow', time: '9:00 AM', attendees: 12, type: 'recurring' as const },
  { id: '2', title: 'Pipeline Review', date: 'Mar 4', time: '2:00 PM', attendees: 8, type: 'scheduled' as const },
  { id: '3', title: 'Q1 Goals Kickoff', date: 'Mar 6', time: '10:00 AM', attendees: 12, type: 'scheduled' as const },
  { id: '4', title: 'Product Training: New IUL', date: 'Mar 10', time: '1:00 PM', attendees: 12, type: 'training' as const },
] as const;

// Status color mappings
export const STATUS_COLORS = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  away: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  offline: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
} as const;

export const PRIORITY_COLORS = {
  high: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
} as const;

// Certification status colors
export const CERT_STATUS_COLORS = {
  current: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  expiring: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  overdue: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
} as const;

export const CERT_LEVEL_LABELS = ['None', 'Basic', 'Intermediate', 'Advanced', 'Expert'] as const;

// ─── Training Demo Data ────────────────────────────────────

// Compliance deadlines (certification expirations)
export const DEMO_COMPLIANCE_DEADLINES = [
  { id: '1', agent: 'Emily Davis', avatar: 'ED', certification: 'Life Insurance License', expiresIn: 18, expiresDate: 'Mar 20, 2026' },
  { id: '2', agent: 'Anna Kim', avatar: 'AK', certification: 'IUL Product Certification', expiresIn: 12, expiresDate: 'Mar 14, 2026' },
  { id: '3', agent: 'Carlos Martinez', avatar: 'CM', certification: 'Anti-Money Laundering', expiresIn: -5, expiresDate: 'Feb 25, 2026' },
  { id: '4', agent: 'Ryan Taylor', avatar: 'RT', certification: 'Basics of Insurance', expiresIn: -14, expiresDate: 'Feb 16, 2026' },
  { id: '5', agent: 'James Wilson', avatar: 'JW', certification: 'Annuity Product Training', expiresIn: 45, expiresDate: 'Apr 16, 2026' },
  { id: '6', agent: 'Lisa Park', avatar: 'LP', certification: 'Ethics & Compliance', expiresIn: 60, expiresDate: 'May 1, 2026' },
] as const;

// Approval queue (certifications awaiting manager sign-off)
export const DEMO_APPROVAL_QUEUE = [
  { id: '1', agent: 'Mike Chen', avatar: 'MC', certification: 'Advanced IUL Strategies', score: 92, submittedDate: 'Feb 28, 2026', status: 'pending' as const },
  { id: '2', agent: 'David Brown', avatar: 'DB', certification: 'Whole Life Product Expert', score: 88, submittedDate: 'Mar 1, 2026', status: 'pending' as const },
  { id: '3', agent: 'Tom Rodriguez', avatar: 'TR', certification: 'Annuity Basics', score: 85, submittedDate: 'Mar 1, 2026', status: 'pending' as const },
] as const;

// Activity log (recent training activity)
export const DEMO_ACTIVITY_LOG = [
  { id: '1', agent: 'Sarah Johnson', avatar: 'SJ', action: 'Completed module: Advanced Underwriting', time: '2h ago', type: 'completion' as const },
  { id: '2', agent: 'Mike Chen', avatar: 'MC', action: 'Passed assessment: IUL Strategies (92%)', time: '3h ago', type: 'assessment' as const },
  { id: '3', agent: 'Jessica Lee', avatar: 'JL', action: 'Started module: Estate Planning Basics', time: '4h ago', type: 'started' as const },
  { id: '4', agent: 'David Brown', avatar: 'DB', action: 'Earned certification: Whole Life Expert', time: '5h ago', type: 'certification' as const },
  { id: '5', agent: 'Emily Davis', avatar: 'ED', action: 'Completed module: Client Needs Analysis', time: '6h ago', type: 'completion' as const },
  { id: '6', agent: 'Tom Rodriguez', avatar: 'TR', action: 'Failed assessment: Annuity Advanced (62%)', time: '1d ago', type: 'assessment' as const },
  { id: '7', agent: 'Lisa Park', avatar: 'LP', action: 'Started learning path: IUL Specialist Track', time: '1d ago', type: 'started' as const },
  { id: '8', agent: 'Rachel Green', avatar: 'RG', action: 'Completed all modules in Expert track', time: '2d ago', type: 'completion' as const },
] as const;

// Learning paths (assignable training tracks)
export const DEMO_LEARNING_PATHS = [
  {
    id: '1',
    name: 'IUL Specialist Track',
    description: 'Comprehensive indexed universal life insurance training',
    modules: 8,
    estimatedHours: 16,
    assignedAgents: ['5', '8', '9'],
    priority: 'high' as const,
  },
  {
    id: '2',
    name: 'Whole Life Basics',
    description: 'Core whole life product knowledge and sales techniques',
    modules: 6,
    estimatedHours: 12,
    assignedAgents: ['9', '12'],
    priority: 'medium' as const,
  },
  {
    id: '3',
    name: 'Advanced Closing Techniques',
    description: 'Master objection handling and closing strategies',
    modules: 5,
    estimatedHours: 10,
    assignedAgents: ['4', '8'],
    priority: 'medium' as const,
  },
  {
    id: '4',
    name: 'Compliance & Ethics',
    description: 'Regulatory compliance, ethics, and best practices',
    modules: 4,
    estimatedHours: 8,
    assignedAgents: ['8', '12'],
    priority: 'high' as const,
  },
  {
    id: '5',
    name: 'Estate Planning Basics',
    description: 'Life insurance in estate planning and wealth transfer',
    modules: 6,
    estimatedHours: 14,
    assignedAgents: ['3', '6'],
    priority: 'low' as const,
  },
] as const;

// Skill gap analysis recommendations
export const DEMO_SKILL_GAPS = [
  { agent: 'Carlos Martinez', avatar: 'CM', weakArea: 'IUL Product Knowledge', assessmentScore: 62, recommendedPath: 'IUL Specialist Track' },
  { agent: 'Ryan Taylor', avatar: 'RT', weakArea: 'Closing Techniques', assessmentScore: 45, recommendedPath: 'Advanced Closing Techniques' },
  { agent: 'Anna Kim', avatar: 'AK', weakArea: 'Compliance Basics', assessmentScore: 68, recommendedPath: 'Compliance & Ethics' },
  { agent: 'Lisa Park', avatar: 'LP', weakArea: 'Estate Planning', assessmentScore: 71, recommendedPath: 'Estate Planning Basics' },
] as const;

// ─── FORECASTING DEMO DATA ────────────────────────────────

export const DEMO_FORECAST_SCENARIOS = [
  { label: 'Best Case', value: 412000, probability: 25, color: 'bg-emerald-500' },
  { label: 'Likely', value: 312000, probability: 50, color: 'bg-teal-500' },
  { label: 'Worst Case', value: 198000, probability: 25, color: 'bg-rose-400' },
] as const;

export const DEMO_FORECAST_DEALS = [
  { id: '1', name: 'Thompson Estate Plan', agent: 'Sarah Johnson', agentAvatar: 'SJ', stage: 'Proposal', value: 48000, probability: 80, risk: 'low' as const },
  { id: '2', name: 'Williams Family IUL', agent: 'Rachel Green', agentAvatar: 'RG', stage: 'Qualified', value: 62000, probability: 55, risk: 'medium' as const },
  { id: '3', name: 'Garcia Whole Life', agent: 'Mike Chen', agentAvatar: 'MC', stage: 'Proposal', value: 35000, probability: 75, risk: 'low' as const },
  { id: '4', name: 'Chen Annuity Package', agent: 'David Brown', agentAvatar: 'DB', stage: 'Contacted', value: 89000, probability: 30, risk: 'high' as const },
  { id: '5', name: 'Patel Term Conversion', agent: 'Jessica Lee', agentAvatar: 'JL', stage: 'Qualified', value: 28000, probability: 65, risk: 'low' as const },
  { id: '6', name: 'Adams Corporate Group', agent: 'Sarah Johnson', agentAvatar: 'SJ', stage: 'Contacted', value: 125000, probability: 20, risk: 'high' as const },
  { id: '7', name: 'Brooks IUL Transfer', agent: 'Tom Rodriguez', agentAvatar: 'TR', stage: 'Proposal', value: 42000, probability: 70, risk: 'medium' as const },
  { id: '8', name: 'Nguyen Family Plan', agent: 'Emily Davis', agentAvatar: 'ED', stage: 'Qualified', value: 54000, probability: 45, risk: 'medium' as const },
  { id: '9', name: 'Martinez Key Person', agent: 'Mike Chen', agentAvatar: 'MC', stage: 'New Lead', value: 76000, probability: 15, risk: 'high' as const },
  { id: '10', name: 'Lee Estate Shield', agent: 'Rachel Green', agentAvatar: 'RG', stage: 'Proposal', value: 38000, probability: 85, risk: 'low' as const },
  { id: '11', name: 'Kim Retirement Plus', agent: 'Lisa Park', agentAvatar: 'LP', stage: 'Contacted', value: 31000, probability: 35, risk: 'medium' as const },
  { id: '12', name: 'Davis Legacy Trust', agent: 'James Wilson', agentAvatar: 'JW', stage: 'New Lead', value: 95000, probability: 10, risk: 'high' as const },
] as const;

export const DEMO_FORECAST_ACCURACY = [
  { month: 'Oct', projected: 280, actual: 265 },
  { month: 'Nov', projected: 310, actual: 298 },
  { month: 'Dec', projected: 295, actual: 312 },
  { month: 'Jan', projected: 340, actual: 328 },
  { month: 'Feb', projected: 365, actual: 352 },
  { month: 'Mar', projected: 312, actual: 0 },
] as const;

// ─── ACTIVITY MONITOR DEMO DATA ───────────────────────────

export type AgentActivityStatus = 'on_call' | 'available' | 'meeting' | 'break' | 'offline';

export const DEMO_AGENT_ACTIVITY: Array<{
  id: string;
  name: string;
  avatar: string;
  status: AgentActivityStatus;
  calls: number;
  emails: number;
  meetings: number;
  lastAction: string;
}> = [
  { id: '1', name: 'Sarah Johnson', avatar: 'SJ', status: 'on_call', calls: 12, emails: 8, meetings: 2, lastAction: 'On call with Thompson' },
  { id: '2', name: 'Mike Chen', avatar: 'MC', status: 'available', calls: 9, emails: 14, meetings: 1, lastAction: 'Sent follow-up email' },
  { id: '3', name: 'Emily Davis', avatar: 'ED', status: 'meeting', calls: 7, emails: 5, meetings: 3, lastAction: 'In pipeline review' },
  { id: '4', name: 'James Wilson', avatar: 'JW', status: 'break', calls: 5, emails: 3, meetings: 1, lastAction: 'Lunch break' },
  { id: '5', name: 'Lisa Park', avatar: 'LP', status: 'on_call', calls: 8, emails: 6, meetings: 0, lastAction: 'On call with Patel' },
  { id: '6', name: 'David Brown', avatar: 'DB', status: 'available', calls: 11, emails: 9, meetings: 2, lastAction: 'Updated CRM notes' },
  { id: '7', name: 'Rachel Green', avatar: 'RG', status: 'on_call', calls: 14, emails: 11, meetings: 1, lastAction: 'On call with Lee' },
  { id: '8', name: 'Carlos Martinez', avatar: 'CM', status: 'offline', calls: 2, emails: 1, meetings: 0, lastAction: 'Offline since 11am' },
  { id: '9', name: 'Anna Kim', avatar: 'AK', status: 'offline', calls: 0, emails: 0, meetings: 0, lastAction: 'Out of office' },
  { id: '10', name: 'Tom Rodriguez', avatar: 'TR', status: 'available', calls: 6, emails: 7, meetings: 1, lastAction: 'Reviewing proposals' },
  { id: '11', name: 'Jessica Lee', avatar: 'JL', status: 'meeting', calls: 10, emails: 8, meetings: 2, lastAction: 'Client presentation' },
  { id: '12', name: 'Ryan Taylor', avatar: 'RT', status: 'offline', calls: 0, emails: 0, meetings: 0, lastAction: 'Not logged in' },
];

export const ACTIVITY_STATUS_COLORS: Record<AgentActivityStatus, { bg: string; text: string; dot: string; label: string }> = {
  on_call: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'On Call' },
  available: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Available' },
  meeting: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500', label: 'In Meeting' },
  break: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'On Break' },
  offline: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Offline' },
};

export const DEMO_LIVE_FEED = [
  { id: '1', agent: 'Sarah Johnson', avatar: 'SJ', action: 'Started call with Thompson Estate', time: '1 min ago', type: 'call' as const },
  { id: '2', agent: 'Rachel Green', avatar: 'RG', action: 'Closed deal: Lee Estate Shield — $38K', time: '3 min ago', type: 'close' as const },
  { id: '3', agent: 'Mike Chen', avatar: 'MC', action: 'Sent proposal to Garcia Whole Life', time: '5 min ago', type: 'email' as const },
  { id: '4', agent: 'David Brown', avatar: 'DB', action: 'Booked appointment with new lead', time: '8 min ago', type: 'appointment' as const },
  { id: '5', agent: 'Jessica Lee', avatar: 'JL', action: 'Completed follow-up call with Kim', time: '12 min ago', type: 'call' as const },
  { id: '6', agent: 'Lisa Park', avatar: 'LP', action: 'Started call with Patel Term', time: '15 min ago', type: 'call' as const },
  { id: '7', agent: 'Tom Rodriguez', avatar: 'TR', action: 'Updated deal stage: Brooks IUL', time: '18 min ago', type: 'update' as const },
  { id: '8', agent: 'Emily Davis', avatar: 'ED', action: 'Added notes to Nguyen pipeline', time: '22 min ago', type: 'update' as const },
];

// Heatmap: 5 days × 10 hours (8am-6pm)
export const DEMO_ACTIVITY_HEATMAP: number[][] = [
  [3, 5, 8, 12, 15, 11, 14, 9, 6, 4],   // Mon
  [4, 7, 11, 14, 12, 13, 16, 10, 7, 3],  // Tue
  [2, 6, 9, 11, 18, 15, 12, 8, 5, 2],    // Wed
  [5, 8, 13, 16, 14, 11, 10, 7, 4, 1],   // Thu
  [3, 4, 7, 10, 12, 9, 8, 5, 3, 1],      // Fri
];

// ─── CONTESTS DEMO DATA ──────────────────────────────────

export const DEMO_CONTESTS = [
  {
    id: '1', name: 'March Madness Blitz', type: 'call_blitz' as const, status: 'active' as const,
    startDate: 'Mar 1', endDate: 'Mar 15', prize: '$500', prizePool: 800,
    progress: 62, participants: 12, description: 'Most outbound calls wins',
    leaderboard: [
      { agentId: '7', name: 'Rachel Green', avatar: 'RG', score: 142, metric: 'calls' },
      { agentId: '1', name: 'Sarah Johnson', avatar: 'SJ', score: 138, metric: 'calls' },
      { agentId: '6', name: 'David Brown', avatar: 'DB', score: 127, metric: 'calls' },
      { agentId: '11', name: 'Jessica Lee', avatar: 'JL', score: 119, metric: 'calls' },
      { agentId: '2', name: 'Mike Chen', avatar: 'MC', score: 112, metric: 'calls' },
    ],
  },
  {
    id: '2', name: 'Revenue Sprint Q1', type: 'revenue' as const, status: 'active' as const,
    startDate: 'Feb 15', endDate: 'Mar 31', prize: '$1,000', prizePool: 1200,
    progress: 48, participants: 12, description: 'Highest total revenue in period',
    leaderboard: [
      { agentId: '1', name: 'Sarah Johnson', avatar: 'SJ', score: 42500, metric: 'revenue' },
      { agentId: '7', name: 'Rachel Green', avatar: 'RG', score: 39700, metric: 'revenue' },
      { agentId: '2', name: 'Mike Chen', avatar: 'MC', score: 38200, metric: 'revenue' },
      { agentId: '11', name: 'Jessica Lee', avatar: 'JL', score: 35400, metric: 'revenue' },
      { agentId: '6', name: 'David Brown', avatar: 'DB', score: 33100, metric: 'revenue' },
    ],
  },
  {
    id: '3', name: 'Cross-Sell Bonus', type: 'cross_sell' as const, status: 'active' as const,
    startDate: 'Mar 1', endDate: 'Mar 31', prize: '$100/sale', prizePool: 400,
    progress: 35, participants: 10, description: '$100 bonus per cross-sell close',
    leaderboard: [
      { agentId: '6', name: 'David Brown', avatar: 'DB', score: 4, metric: 'cross-sells' },
      { agentId: '1', name: 'Sarah Johnson', avatar: 'SJ', score: 3, metric: 'cross-sells' },
      { agentId: '7', name: 'Rachel Green', avatar: 'RG', score: 3, metric: 'cross-sells' },
      { agentId: '2', name: 'Mike Chen', avatar: 'MC', score: 2, metric: 'cross-sells' },
      { agentId: '11', name: 'Jessica Lee', avatar: 'JL', score: 2, metric: 'cross-sells' },
    ],
  },
  {
    id: '4', name: 'April Pipeline Push', type: 'revenue' as const, status: 'upcoming' as const,
    startDate: 'Apr 1', endDate: 'Apr 15', prize: '$750', prizePool: 750,
    progress: 0, participants: 0, description: 'Most new pipeline added',
    leaderboard: [],
  },
  {
    id: '5', name: 'Team Challenge: May', type: 'team' as const, status: 'upcoming' as const,
    startDate: 'May 1', endDate: 'May 31', prize: 'Team Dinner', prizePool: 0,
    progress: 0, participants: 0, description: 'Team vs team aggregate metrics',
    leaderboard: [],
  },
  {
    id: '6', name: 'February Closer', type: 'revenue' as const, status: 'completed' as const,
    startDate: 'Feb 1', endDate: 'Feb 28', prize: '$500', prizePool: 500,
    progress: 100, participants: 12, description: 'Most closes in February',
    leaderboard: [
      { agentId: '1', name: 'Sarah Johnson', avatar: 'SJ', score: 8, metric: 'closes' },
      { agentId: '7', name: 'Rachel Green', avatar: 'RG', score: 7, metric: 'closes' },
      { agentId: '2', name: 'Mike Chen', avatar: 'MC', score: 6, metric: 'closes' },
    ],
  },
  {
    id: '7', name: 'New Year Kickoff', type: 'call_blitz' as const, status: 'completed' as const,
    startDate: 'Jan 6', endDate: 'Jan 17', prize: '$300', prizePool: 300,
    progress: 100, participants: 11, description: 'New year call blitz',
    leaderboard: [
      { agentId: '7', name: 'Rachel Green', avatar: 'RG', score: 186, metric: 'calls' },
      { agentId: '1', name: 'Sarah Johnson', avatar: 'SJ', score: 174, metric: 'calls' },
      { agentId: '6', name: 'David Brown', avatar: 'DB', score: 165, metric: 'calls' },
    ],
  },
] as const;

export const CONTEST_TEMPLATES = [
  { id: '1', name: 'Call Blitz', description: 'Most outbound calls in period', icon: 'Phone', duration: '2 weeks', metric: 'calls' },
  { id: '2', name: 'Revenue Sprint', description: 'Highest total revenue closed', icon: 'DollarSign', duration: '1 month', metric: 'revenue' },
  { id: '3', name: 'Team Challenge', description: 'Team vs team aggregate competition', icon: 'Users', duration: '1 month', metric: 'mixed' },
  { id: '4', name: 'Cross-Sell Bonus', description: 'Per-unit bonus for cross-sell closes', icon: 'Zap', duration: 'Ongoing', metric: 'cross-sells' },
] as const;

// ─── COMMISSIONS DEMO DATA ────────────────────────────────

export const DEMO_AGENT_COMMISSIONS = [
  { agentId: '1', name: 'Sarah Johnson', avatar: 'SJ', pending: 4200, paidYTD: 28400, chargebackRisk: 0, avgRate: 105, contractLevel: 105, apTier: '$150K',
    products: [
      { product: 'IUL', premium: 4500, rate: 105, commission: 4725 },
      { product: 'Whole Life', premium: 3200, rate: 105, commission: 3360 },
      { product: 'Term', premium: 2100, rate: 105, commission: 2205 },
      { product: 'Annuity', premium: 1800, rate: 105, commission: 1890 },
    ],
  },
  { agentId: '7', name: 'Rachel Green', avatar: 'RG', pending: 3800, paidYTD: 24600, chargebackRisk: 0, avgRate: 100, contractLevel: 100, apTier: '$100K',
    products: [
      { product: 'IUL', premium: 4200, rate: 100, commission: 4200 },
      { product: 'Whole Life', premium: 3000, rate: 100, commission: 3000 },
      { product: 'Term', premium: 1800, rate: 100, commission: 1800 },
      { product: 'Annuity', premium: 1600, rate: 100, commission: 1600 },
    ],
  },
  { agentId: '2', name: 'Mike Chen', avatar: 'MC', pending: 2900, paidYTD: 21200, chargebackRisk: 800, avgRate: 95, contractLevel: 95, apTier: '$75K',
    products: [
      { product: 'IUL', premium: 3800, rate: 95, commission: 3610 },
      { product: 'Whole Life', premium: 2600, rate: 95, commission: 2470 },
      { product: 'Term', premium: 2200, rate: 95, commission: 2090 },
      { product: 'Annuity', premium: 1400, rate: 95, commission: 1330 },
    ],
  },
  { agentId: '11', name: 'Jessica Lee', avatar: 'JL', pending: 2600, paidYTD: 19800, chargebackRisk: 0, avgRate: 90, contractLevel: 90, apTier: '$50K',
    products: [
      { product: 'IUL', premium: 3500, rate: 90, commission: 3150 },
      { product: 'Whole Life', premium: 2800, rate: 90, commission: 2520 },
      { product: 'Term', premium: 1600, rate: 90, commission: 1440 },
      { product: 'Annuity', premium: 1200, rate: 90, commission: 1080 },
    ],
  },
  { agentId: '6', name: 'David Brown', avatar: 'DB', pending: 2100, paidYTD: 17500, chargebackRisk: 0, avgRate: 85, contractLevel: 85, apTier: '$25K',
    products: [
      { product: 'IUL', premium: 3200, rate: 85, commission: 2720 },
      { product: 'Whole Life', premium: 2400, rate: 85, commission: 2040 },
      { product: 'Term', premium: 1500, rate: 85, commission: 1275 },
      { product: 'Annuity', premium: 1100, rate: 85, commission: 935 },
    ],
  },
  { agentId: '3', name: 'Emily Davis', avatar: 'ED', pending: 1400, paidYTD: 14200, chargebackRisk: 1200, avgRate: 80, contractLevel: 80, apTier: '$15K',
    products: [
      { product: 'IUL', premium: 2800, rate: 80, commission: 2240 },
      { product: 'Whole Life', premium: 2000, rate: 80, commission: 1600 },
      { product: 'Term', premium: 1400, rate: 80, commission: 1120 },
      { product: 'Annuity', premium: 900, rate: 80, commission: 720 },
    ],
  },
  { agentId: '10', name: 'Tom Rodriguez', avatar: 'TR', pending: 1100, paidYTD: 11600, chargebackRisk: 0, avgRate: 75, contractLevel: 75, apTier: '$10K',
    products: [
      { product: 'IUL', premium: 2400, rate: 75, commission: 1800 },
      { product: 'Whole Life', premium: 1800, rate: 75, commission: 1350 },
      { product: 'Term', premium: 1200, rate: 75, commission: 900 },
      { product: 'Annuity', premium: 800, rate: 75, commission: 600 },
    ],
  },
  { agentId: '4', name: 'James Wilson', avatar: 'JW', pending: 800, paidYTD: 8400, chargebackRisk: 1200, avgRate: 70, contractLevel: 70, apTier: '$5K',
    products: [
      { product: 'IUL', premium: 1800, rate: 70, commission: 1260 },
      { product: 'Whole Life', premium: 1400, rate: 70, commission: 980 },
      { product: 'Term', premium: 1000, rate: 70, commission: 700 },
      { product: 'Annuity', premium: 600, rate: 70, commission: 420 },
    ],
  },
] as const;

export const DEMO_PAYOUT_TIMELINE = [
  { id: '1', date: 'Mar 15', amount: 8400, agents: 8, status: 'upcoming' as const, label: 'Mid-Month Payout' },
  { id: '2', date: 'Mar 31', amount: 10300, agents: 8, status: 'upcoming' as const, label: 'End of Month' },
  { id: '3', date: 'Feb 28', amount: 9200, agents: 8, status: 'paid' as const, label: 'February Close' },
  { id: '4', date: 'Feb 15', amount: 7800, agents: 7, status: 'paid' as const, label: 'Mid-Feb Payout' },
  { id: '5', date: 'Jan 31', amount: 11500, agents: 8, status: 'paid' as const, label: 'January Close' },
] as const;

// ─── COMMISSION VELOCITY DEMO DATA ──────────────────────

export const DEMO_COMMISSION_VELOCITY = {
  thisMonth: { earned: 18740, target: 25000, daysElapsed: 9, daysTotal: 31 },
  lastMonth: { earned: 22800, target: 25000, daysElapsed: 28, daysTotal: 28 },
  threeMonthAvg: { earned: 21500, target: 25000, daysElapsed: 30, daysTotal: 30 },
  weeklyTrend: [3200, 4100, 3800, 4600, 5100, 4900, 5400, 5800, 4200, 5100, 6200, 5600],
} as const;

// ─── ONE-ON-ONES DEMO DATA ───────────────────────────────

export const DEMO_ONE_ON_ONES = [
  {
    id: '1', agentId: '8', agent: 'Carlos Martinez', avatar: 'CM',
    date: 'Mar 4', time: '10:00 AM', duration: 30,
    agendaItems: 3, actionItems: 4, carryForward: 2,
    briefing: {
      kpis: [
        { label: 'Quota', value: '58%', trend: 'down' as const },
        { label: 'Calls/Week', value: '18', trend: 'down' as const },
        { label: 'Close Rate', value: '11%', trend: 'flat' as const },
      ],
      recentActivity: ['Missed 3 follow-up deadlines', 'IUL cert overdue by 5 days', 'No closes in 2 weeks'],
      riskFlags: ['Performance Improvement Plan eligible', 'Certification overdue'],
      carryForwardItems: ['Complete IUL certification', 'Set 3 appointments per day'],
    },
  },
  {
    id: '2', agentId: '9', agent: 'Anna Kim', avatar: 'AK',
    date: 'Mar 4', time: '2:00 PM', duration: 30,
    agendaItems: 2, actionItems: 3, carryForward: 1,
    briefing: {
      kpis: [
        { label: 'Quota', value: '45%', trend: 'up' as const },
        { label: 'Calls/Week', value: '12', trend: 'up' as const },
        { label: 'Close Rate', value: '8%', trend: 'up' as const },
      ],
      recentActivity: ['Completed 2 training modules', 'First close last week', 'Improving call volume'],
      riskFlags: ['IUL cert expiring in 12 days'],
      carryForwardItems: ['Shadow senior agent on 2 calls'],
    },
  },
  {
    id: '3', agentId: '5', agent: 'Lisa Park', avatar: 'LP',
    date: 'Mar 5', time: '11:00 AM', duration: 30,
    agendaItems: 3, actionItems: 2, carryForward: 0,
    briefing: {
      kpis: [
        { label: 'Quota', value: '65%', trend: 'up' as const },
        { label: 'Calls/Week', value: '28', trend: 'up' as const },
        { label: 'Close Rate', value: '11%', trend: 'flat' as const },
      ],
      recentActivity: ['Started IUL Specialist Track', 'Consistent call volume', 'Good lead follow-up'],
      riskFlags: [],
      carryForwardItems: [],
    },
  },
  {
    id: '4', agentId: '12', agent: 'Ryan Taylor', avatar: 'RT',
    date: 'Mar 6', time: '9:00 AM', duration: 30,
    agendaItems: 4, actionItems: 5, carryForward: 3,
    briefing: {
      kpis: [
        { label: 'Quota', value: '35%', trend: 'down' as const },
        { label: 'Calls/Week', value: '8', trend: 'down' as const },
        { label: 'Close Rate', value: '0%', trend: 'flat' as const },
      ],
      recentActivity: ['Only 2 training modules completed', 'Missed 2 days last week', 'No pipeline activity'],
      riskFlags: ['Performance Improvement Plan active', 'Basic cert overdue 14 days', 'Attendance concern'],
      carryForwardItems: ['Complete Basics of Insurance cert', 'Attend daily standup', 'Partner with mentor'],
    },
  },
];

export const DEMO_ACTION_ITEMS = [
  { id: '1', description: 'Complete IUL certification', owner: 'agent' as const, agent: 'Carlos Martinez', agentAvatar: 'CM', dueDate: 'Mar 7', status: 'overdue' as const },
  { id: '2', description: 'Set 3 appointments per day target', owner: 'agent' as const, agent: 'Carlos Martinez', agentAvatar: 'CM', dueDate: 'Mar 10', status: 'due_this_week' as const },
  { id: '3', description: 'Review call recordings with Carlos', owner: 'manager' as const, agent: 'Carlos Martinez', agentAvatar: 'CM', dueDate: 'Mar 5', status: 'overdue' as const },
  { id: '4', description: 'Shadow senior agent on 2 calls', owner: 'agent' as const, agent: 'Anna Kim', agentAvatar: 'AK', dueDate: 'Mar 7', status: 'due_this_week' as const },
  { id: '5', description: 'Complete Basics of Insurance cert', owner: 'agent' as const, agent: 'Ryan Taylor', agentAvatar: 'RT', dueDate: 'Mar 1', status: 'overdue' as const },
  { id: '6', description: 'Attend daily standup consistently', owner: 'agent' as const, agent: 'Ryan Taylor', agentAvatar: 'RT', dueDate: 'Mar 14', status: 'due_this_week' as const },
  { id: '7', description: 'Assign mentor for Ryan', owner: 'manager' as const, agent: 'Ryan Taylor', agentAvatar: 'RT', dueDate: 'Mar 4', status: 'overdue' as const },
  { id: '8', description: 'Schedule pipeline review with Lisa', owner: 'manager' as const, agent: 'Lisa Park', agentAvatar: 'LP', dueDate: 'Mar 10', status: 'upcoming' as const },
  { id: '9', description: 'Partner with mentor on 3 client calls', owner: 'agent' as const, agent: 'Ryan Taylor', agentAvatar: 'RT', dueDate: 'Mar 14', status: 'due_this_week' as const },
  { id: '10', description: 'Review close technique with Emily', owner: 'manager' as const, agent: 'Emily Davis', agentAvatar: 'ED', dueDate: 'Mar 12', status: 'upcoming' as const },
  { id: '11', description: 'Prepare Q1 performance summary', owner: 'manager' as const, agent: 'All', agentAvatar: '', dueDate: 'Mar 15', status: 'upcoming' as const },
  { id: '12', description: 'Complete estate planning module', owner: 'agent' as const, agent: 'Anna Kim', agentAvatar: 'AK', dueDate: 'Mar 14', status: 'upcoming' as const },
];

/* ── Lead Distribution ─────────────────────────────────── */

export interface PoolLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  source: 'executive_referral' | 'marketing_campaign' | 'website' | 'partner_referral';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  product: string;
  leadScore: number;
  scoreTier: 'cold' | 'warm' | 'hot' | 'on_fire';
  receivedFrom: string;
  receivedAt: string;
  notes: string;
}

export const DEMO_LEAD_POOL: PoolLead[] = [
  { id: 'ld-1', name: 'Marcus Thompson', email: 'marcus.t@email.com', phone: '(312) 555-0198', city: 'Chicago', state: 'IL', source: 'executive_referral', priority: 'urgent', product: 'Whole Life', leadScore: 92, scoreTier: 'on_fire', receivedFrom: 'David Chen (VP Sales)', receivedAt: '2 hours ago', notes: 'Business owner, high net worth. Looking for estate planning coverage.' },
  { id: 'ld-2', name: 'Sarah Williams', email: 'sarah.w@email.com', phone: '(630) 555-0234', city: 'Naperville', state: 'IL', source: 'marketing_campaign', priority: 'high', product: 'Term Life', leadScore: 85, scoreTier: 'hot', receivedFrom: 'Rachel Torres (CMO)', receivedAt: '3 hours ago', notes: 'Responded to Q1 digital campaign. Young family, two kids.' },
  { id: 'ld-3', name: 'James Rodriguez', email: 'j.rodriguez@email.com', phone: '(708) 555-0156', city: 'Oak Park', state: 'IL', source: 'partner_referral', priority: 'high', product: 'Universal Life', leadScore: 78, scoreTier: 'hot', receivedFrom: 'David Chen (VP Sales)', receivedAt: '5 hours ago', notes: 'Referred by partnered CPA firm. Looking to shelter assets.' },
  { id: 'ld-4', name: 'Patricia Nguyen', email: 'p.nguyen@email.com', phone: '(847) 555-0312', city: 'Evanston', state: 'IL', source: 'website', priority: 'medium', product: 'Health Insurance', leadScore: 71, scoreTier: 'warm', receivedFrom: 'System (Website)', receivedAt: '6 hours ago', notes: 'Filled out quote form. Self-employed consultant.' },
  { id: 'ld-5', name: 'Robert Kim', email: 'rkim@email.com', phone: '(312) 555-0478', city: 'Chicago', state: 'IL', source: 'executive_referral', priority: 'urgent', product: 'Business Insurance', leadScore: 95, scoreTier: 'on_fire', receivedFrom: 'Michael Harris (CEO)', receivedAt: '1 hour ago', notes: 'CEO of mid-size tech company. Needs full commercial package.' },
  { id: 'ld-6', name: 'Linda Martinez', email: 'linda.m@email.com', phone: '(773) 555-0567', city: 'Chicago', state: 'IL', source: 'marketing_campaign', priority: 'medium', product: 'Term Life', leadScore: 65, scoreTier: 'warm', receivedFrom: 'Rachel Torres (CMO)', receivedAt: '8 hours ago', notes: 'Clicked email CTA. Homeowner, age 42.' },
  { id: 'ld-7', name: 'David Park', email: 'd.park@email.com', phone: '(630) 555-0689', city: 'Downers Grove', state: 'IL', source: 'partner_referral', priority: 'high', product: 'Annuity', leadScore: 82, scoreTier: 'hot', receivedFrom: 'David Chen (VP Sales)', receivedAt: '4 hours ago', notes: 'Referred by financial advisor. Retiring in 2 years.' },
  { id: 'ld-8', name: 'Jennifer Adams', email: 'j.adams@email.com', phone: '(847) 555-0745', city: 'Schaumburg', state: 'IL', source: 'website', priority: 'low', product: 'Auto Insurance', leadScore: 45, scoreTier: 'cold', receivedFrom: 'System (Website)', receivedAt: '1 day ago', notes: 'Basic quote request. Currently with competitor.' },
  { id: 'ld-9', name: 'Michael Brown', email: 'mbrown@email.com', phone: '(312) 555-0823', city: 'Chicago', state: 'IL', source: 'executive_referral', priority: 'high', product: 'Whole Life', leadScore: 88, scoreTier: 'hot', receivedFrom: 'Michael Harris (CEO)', receivedAt: '3 hours ago', notes: 'Personal friend of CEO. Doctor, looking for cash value policy.' },
  { id: 'ld-10', name: 'Angela Foster', email: 'a.foster@email.com', phone: '(708) 555-0901', city: 'Berwyn', state: 'IL', source: 'marketing_campaign', priority: 'medium', product: 'Health Insurance', leadScore: 58, scoreTier: 'warm', receivedFrom: 'Rachel Torres (CMO)', receivedAt: '12 hours ago', notes: 'Webinar attendee. Small business owner, 8 employees.' },
  { id: 'ld-11', name: 'Thomas Wilson', email: 't.wilson@email.com', phone: '(630) 555-1045', city: 'Aurora', state: 'IL', source: 'partner_referral', priority: 'medium', product: 'Term Life', leadScore: 62, scoreTier: 'warm', receivedFrom: 'David Chen (VP Sales)', receivedAt: '10 hours ago', notes: 'Mortgage lender referral. Just purchased home.' },
  { id: 'ld-12', name: 'Karen Liu', email: 'k.liu@email.com', phone: '(773) 555-1123', city: 'Chicago', state: 'IL', source: 'website', priority: 'high', product: 'Universal Life', leadScore: 76, scoreTier: 'hot', receivedFrom: 'System (Website)', receivedAt: '7 hours ago', notes: 'Detailed form submission. Engineer, high income bracket.' },
  { id: 'ld-13', name: 'Steven Clark', email: 's.clark@email.com', phone: '(847) 555-1267', city: 'Arlington Heights', state: 'IL', source: 'executive_referral', priority: 'medium', product: 'Home Insurance', leadScore: 55, scoreTier: 'warm', receivedFrom: 'David Chen (VP Sales)', receivedAt: '1 day ago', notes: 'Relocating from out of state. Needs home + auto bundle.' },
  { id: 'ld-14', name: 'Maria Gonzalez', email: 'm.gonzalez@email.com', phone: '(312) 555-1389', city: 'Chicago', state: 'IL', source: 'marketing_campaign', priority: 'urgent', product: 'Business Insurance', leadScore: 90, scoreTier: 'on_fire', receivedFrom: 'Rachel Torres (CMO)', receivedAt: '2 hours ago', notes: 'Restaurant chain owner. 3 locations. Urgent coverage gap.' },
  { id: 'ld-15', name: 'Christopher Lee', email: 'c.lee@email.com', phone: '(630) 555-1456', city: 'Wheaton', state: 'IL', source: 'partner_referral', priority: 'low', product: 'Term Life', leadScore: 42, scoreTier: 'cold', receivedFrom: 'David Chen (VP Sales)', receivedAt: '2 days ago', notes: 'Early stage inquiry. Just comparing rates.' },
  { id: 'ld-16', name: 'Nancy Taylor', email: 'n.taylor@email.com', phone: '(708) 555-1534', city: 'Cicero', state: 'IL', source: 'website', priority: 'medium', product: 'Annuity', leadScore: 68, scoreTier: 'warm', receivedFrom: 'System (Website)', receivedAt: '9 hours ago', notes: 'Age 55, looking for retirement income options.' },
  { id: 'ld-17', name: 'Daniel Wright', email: 'd.wright@email.com', phone: '(847) 555-1678', city: 'Skokie', state: 'IL', source: 'executive_referral', priority: 'high', product: 'Whole Life', leadScore: 84, scoreTier: 'hot', receivedFrom: 'Michael Harris (CEO)', receivedAt: '5 hours ago', notes: 'Attorney. Interested in wealth transfer strategies.' },
  { id: 'ld-18', name: 'Ashley Rivera', email: 'a.rivera@email.com', phone: '(312) 555-1790', city: 'Chicago', state: 'IL', source: 'marketing_campaign', priority: 'medium', product: 'Health Insurance', leadScore: 60, scoreTier: 'warm', receivedFrom: 'Rachel Torres (CMO)', receivedAt: '11 hours ago', notes: 'Freelancer looking for individual health plan.' },
];

export interface DistributionRecord {
  id: string;
  date: string;
  leadsDistributed: number;
  agentsCount: number;
  distributedBy: string;
  perAgent: string;
}

export const DEMO_DISTRIBUTION_HISTORY: DistributionRecord[] = [
  { id: 'dh-1', date: 'Mar 13, 2026 · 4:30 PM', leadsDistributed: 22, agentsCount: 11, distributedBy: 'Jordan Mitchell', perAgent: '2 each' },
  { id: 'dh-2', date: 'Mar 12, 2026 · 9:15 AM', leadsDistributed: 15, agentsCount: 10, distributedBy: 'Jordan Mitchell', perAgent: '1-2 each' },
  { id: 'dh-3', date: 'Mar 11, 2026 · 2:00 PM', leadsDistributed: 8, agentsCount: 8, distributedBy: 'Jordan Mitchell', perAgent: '1 each' },
  { id: 'dh-4', date: 'Mar 10, 2026 · 11:45 AM', leadsDistributed: 18, agentsCount: 12, distributedBy: 'Jordan Mitchell', perAgent: '1-2 each' },
  { id: 'dh-5', date: 'Mar 7, 2026 · 3:20 PM', leadsDistributed: 24, agentsCount: 12, distributedBy: 'Jordan Mitchell', perAgent: '2 each' },
];

export const ONE_ON_ONE_TEMPLATES = [
  { id: '1', name: 'Performance Check-In', description: 'Review KPIs, pipeline health, and weekly targets', items: ['KPI review', 'Pipeline status', 'Weekly goals', 'Blockers'] },
  { id: '2', name: 'Coaching Focus', description: 'Skill development, call reviews, and technique improvement', items: ['Call review', 'Skill assessment', 'Practice scenarios', 'Next steps'] },
  { id: '3', name: 'Development Planning', description: 'Career growth, certification progress, and long-term goals', items: ['Career goals', 'Certification status', 'Learning path', 'Promotion criteria'] },
] as const;
