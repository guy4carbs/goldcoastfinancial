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

// Emerald gradient constants
export const MANAGER_GRADIENT = 'from-emerald-500 via-emerald-600 to-teal-700';
export const MANAGER_GRADIENT_CSS = 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)';
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
