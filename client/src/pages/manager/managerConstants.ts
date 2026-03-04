/**
 * Manager Lounge — Shared Constants & Demo Data
 * Heritage Design System — Emerald theme
 */

import { CSSProperties } from 'react';

// Glass card style object — used across all manager pages
// Matches GLASS.css.light from heritageDesignSystem with specular edge border
export const glassCard: CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
};

// Emerald → Rose gradient constants
export const MANAGER_GRADIENT = 'from-emerald-600 via-teal-600 to-rose-400';
export const MANAGER_GRADIENT_CSS = 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)';
export const MANAGER_ICON_GRADIENT = 'from-emerald-500 to-emerald-700';

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
  { id: '3', agent: 'Tom Rodriguez', avatar: 'TR', certification: 'Annuity Fundamentals', score: 85, submittedDate: 'Mar 1, 2026', status: 'pending' as const },
] as const;

// Audit trail (recent training activity)
export const DEMO_AUDIT_TRAIL = [
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
    name: 'Whole Life Fundamentals',
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
    name: 'Estate Planning Essentials',
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
  { agent: 'Lisa Park', avatar: 'LP', weakArea: 'Estate Planning', assessmentScore: 71, recommendedPath: 'Estate Planning Essentials' },
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
    id: '3', name: 'Cross-Sell SPIFF', type: 'cross_sell' as const, status: 'active' as const,
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
  { id: '4', name: 'Cross-Sell SPIFF', description: 'Per-unit bonus for cross-sell closes', icon: 'Zap', duration: 'Ongoing', metric: 'cross-sells' },
] as const;

// ─── COMMISSIONS DEMO DATA ────────────────────────────────

export const DEMO_AGENT_COMMISSIONS = [
  { agentId: '1', name: 'Sarah Johnson', avatar: 'SJ', pending: 4200, paidYTD: 28400, clawbackRisk: 0, avgRate: 16.2,
    products: [
      { product: 'IUL', premium: 18000, rate: 18, commission: 3240 },
      { product: 'Whole Life', premium: 12000, rate: 15, commission: 1800 },
      { product: 'Term', premium: 8500, rate: 10, commission: 850 },
      { product: 'Annuity', premium: 4000, rate: 12, commission: 480 },
    ],
  },
  { agentId: '7', name: 'Rachel Green', avatar: 'RG', pending: 3800, paidYTD: 24600, clawbackRisk: 0, avgRate: 15.8,
    products: [
      { product: 'IUL', premium: 16000, rate: 18, commission: 2880 },
      { product: 'Whole Life', premium: 14000, rate: 15, commission: 2100 },
      { product: 'Term', premium: 6000, rate: 10, commission: 600 },
      { product: 'Annuity', premium: 3700, rate: 12, commission: 444 },
    ],
  },
  { agentId: '2', name: 'Mike Chen', avatar: 'MC', pending: 2900, paidYTD: 21200, clawbackRisk: 800, avgRate: 14.5,
    products: [
      { product: 'IUL', premium: 12000, rate: 18, commission: 2160 },
      { product: 'Whole Life', premium: 8000, rate: 15, commission: 1200 },
      { product: 'Term', premium: 10000, rate: 10, commission: 1000 },
      { product: 'Annuity', premium: 8200, rate: 12, commission: 984 },
    ],
  },
  { agentId: '11', name: 'Jessica Lee', avatar: 'JL', pending: 2600, paidYTD: 19800, clawbackRisk: 0, avgRate: 14.8,
    products: [
      { product: 'IUL', premium: 10000, rate: 18, commission: 1800 },
      { product: 'Whole Life', premium: 11000, rate: 15, commission: 1650 },
      { product: 'Term', premium: 9000, rate: 10, commission: 900 },
      { product: 'Annuity', premium: 5400, rate: 12, commission: 648 },
    ],
  },
  { agentId: '6', name: 'David Brown', avatar: 'DB', pending: 2100, paidYTD: 17500, clawbackRisk: 0, avgRate: 14.2,
    products: [
      { product: 'IUL', premium: 9000, rate: 18, commission: 1620 },
      { product: 'Whole Life', premium: 10000, rate: 15, commission: 1500 },
      { product: 'Term', premium: 7000, rate: 10, commission: 700 },
      { product: 'Annuity', premium: 7100, rate: 12, commission: 852 },
    ],
  },
  { agentId: '3', name: 'Emily Davis', avatar: 'ED', pending: 1400, paidYTD: 14200, clawbackRisk: 1200, avgRate: 13.6,
    products: [
      { product: 'IUL', premium: 7000, rate: 18, commission: 1260 },
      { product: 'Whole Life', premium: 8000, rate: 15, commission: 1200 },
      { product: 'Term', premium: 11000, rate: 10, commission: 1100 },
      { product: 'Annuity', premium: 5800, rate: 12, commission: 696 },
    ],
  },
  { agentId: '10', name: 'Tom Rodriguez', avatar: 'TR', pending: 1100, paidYTD: 11600, clawbackRisk: 0, avgRate: 13.1,
    products: [
      { product: 'IUL', premium: 6000, rate: 18, commission: 1080 },
      { product: 'Whole Life', premium: 7000, rate: 15, commission: 1050 },
      { product: 'Term', premium: 8000, rate: 10, commission: 800 },
      { product: 'Annuity', premium: 4600, rate: 12, commission: 552 },
    ],
  },
  { agentId: '4', name: 'James Wilson', avatar: 'JW', pending: 800, paidYTD: 8400, clawbackRisk: 1200, avgRate: 12.4,
    products: [
      { product: 'IUL', premium: 4000, rate: 18, commission: 720 },
      { product: 'Whole Life', premium: 5000, rate: 15, commission: 750 },
      { product: 'Term', premium: 12000, rate: 10, commission: 1200 },
      { product: 'Annuity', premium: 7400, rate: 12, commission: 888 },
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

export const ONE_ON_ONE_TEMPLATES = [
  { id: '1', name: 'Performance Check-In', description: 'Review KPIs, pipeline health, and weekly targets', items: ['KPI review', 'Pipeline status', 'Weekly goals', 'Blockers'] },
  { id: '2', name: 'Coaching Focus', description: 'Skill development, call reviews, and technique improvement', items: ['Call review', 'Skill assessment', 'Practice scenarios', 'Next steps'] },
  { id: '3', name: 'Development Planning', description: 'Career growth, certification progress, and long-term goals', items: ['Career goals', 'Certification status', 'Learning path', 'Promotion criteria'] },
] as const;
