/**
 * Manager Alerts
 * Heritage Design System — Emerald theme with amber accents
 *
 * Shows live team activity alerts with priority filtering, category badges,
 * and one-click remediation buttons. Includes deal risk and predictive AI
 * categories with context-specific action buttons per category.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid, ManagerEmptyState } from './primitives';
import { glassCard } from './managerConstants';
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
  staggerCards,
} from '@/lib/heritageDesignSystem';
import {
  Bell,
  AlertTriangle,
  Shield,
  TrendingUp,
  Clock,
  Users,
  X,
  ChevronRight,
  ChevronDown,
  Sparkles,
  GraduationCap,
  Calendar,
  Volume2,
  VolumeX,
  ArrowDownWideNarrow,
  AlarmClock,
  CheckCheck,
  Trash2,
  Phone,
  Mail,
  Eye,
  Pin,
  MessageSquare,
  Send,
  Search,
  CircleCheck,
  ArrowUp,
  Square,
  CheckSquare,
} from 'lucide-react';

// ─── TYPES ──────────────────────────────────────────────────
type AlertPriority = 'urgent' | 'high' | 'medium' | 'low';
type AlertCategory =
  | 'compliance'
  | 'pipeline'
  | 'escalation'
  | 'team'
  | 'deal_risk'
  | 'predictive';
type FilterKey =
  | 'all'
  | 'urgent'
  | 'compliance'
  | 'pipeline'
  | 'team'
  | 'deal_risk'
  | 'predictive';

interface Alert {
  id: string;
  title: string;
  description: string;
  agentName: string;
  agentAvatar: string;
  priority: AlertPriority;
  category: AlertCategory;
  timestamp: string;
  read: boolean;
  resolved?: boolean;
  pinned?: boolean;
  note?: string;
}

// ─── DEMO DATA ──────────────────────────────────────────────
const DEMO_ALERTS: Alert[] = [
  { id: '1', title: 'Missed Follow-Up', description: 'Carlos Martinez has 3 overdue follow-ups from last week', agentName: 'Carlos Martinez', agentAvatar: 'CM', priority: 'urgent', category: 'compliance', timestamp: '5 min ago', read: false },
  { id: '2', title: 'Deal Stage Change', description: 'Sarah Johnson moved Anderson Group to Proposal stage ($45K)', agentName: 'Sarah Johnson', agentAvatar: 'SJ', priority: 'medium', category: 'pipeline', timestamp: '12 min ago', read: false },
  { id: '3', title: 'Certification Expiring', description: 'Emily Davis Life Insurance cert expires in 7 days', agentName: 'Emily Davis', agentAvatar: 'ED', priority: 'high', category: 'compliance', timestamp: '1 hr ago', read: false },
  { id: '4', title: 'Escalation Received', description: 'Client complaint from Ryan Taylor — billing dispute', agentName: 'Ryan Taylor', agentAvatar: 'RT', priority: 'urgent', category: 'escalation', timestamp: '2 hrs ago', read: true },
  { id: '5', title: 'New Agent Active', description: 'Lisa Park completed onboarding and is now active', agentName: 'Lisa Park', agentAvatar: 'LP', priority: 'low', category: 'team', timestamp: '3 hrs ago', read: true },
  { id: '6', title: 'Quota Warning', description: 'James Wilson is at 35% of monthly quota with 8 days remaining', agentName: 'James Wilson', agentAvatar: 'JW', priority: 'high', category: 'pipeline', timestamp: '4 hrs ago', read: false },
  { id: '7', title: 'Compliance Override Needed', description: 'Anna Kim submitted a discount request exceeding 15% threshold', agentName: 'Anna Kim', agentAvatar: 'AK', priority: 'high', category: 'compliance', timestamp: '5 hrs ago', read: true },
  { id: '8', title: 'Team Achievement', description: 'Team closed 5 deals this week — exceeding weekly target by 25%', agentName: 'Team', agentAvatar: 'TM', priority: 'low', category: 'team', timestamp: 'Yesterday', read: true },
  { id: '9', title: 'Stale Deal Alert', description: 'Chen Annuity Package has been idle for 21 days in Contacted stage ($89K)', agentName: 'David Brown', agentAvatar: 'DB', priority: 'high', category: 'deal_risk', timestamp: '30 min ago', read: false },
  { id: '10', title: 'At-Risk Deal', description: 'Williams Family IUL — no client contact in 14 days, proposal expires soon ($62K)', agentName: 'Rachel Green', agentAvatar: 'RG', priority: 'urgent', category: 'deal_risk', timestamp: '1 hr ago', read: false },
  { id: '11', title: 'Predicted Churn Risk', description: 'AI model: Carlos Martinez has 78% probability of missing quota this month based on activity trends', agentName: 'Carlos Martinez', agentAvatar: 'CM', priority: 'high', category: 'predictive', timestamp: '2 hrs ago', read: false },
  { id: '12', title: 'Coaching Opportunity Detected', description: 'AI detected: Anna Kim has improved call-to-close ratio by 40% — consider advancement discussion', agentName: 'Anna Kim', agentAvatar: 'AK', priority: 'medium', category: 'predictive', timestamp: '3 hrs ago', read: false },
];

// ─── FILTER OPTIONS ─────────────────────────────────────────
const FILTER_OPTIONS: { value: FilterKey; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'team', label: 'Team' },
  { value: 'deal_risk', label: 'Deal Risk' },
  { value: 'predictive', label: 'Predictive' },
];

// ─── PRIORITY DOT COLORS ────────────────────────────────────
const PRIORITY_DOT_COLORS: Record<AlertPriority, string> = {
  urgent: '#ef4444',
  high: '#f59e0b',
  medium: '#10b981',
  low: '#9ca3af',
};

// ─── CATEGORY BADGE STYLES ──────────────────────────────────
const CATEGORY_BADGE_STYLES: Record<AlertCategory, { bg: string; text: string }> = {
  compliance: { bg: 'rgba(239, 68, 68, 0.10)', text: '#dc2626' },
  pipeline: { bg: 'rgba(16, 185, 129, 0.10)', text: '#059669' },
  escalation: { bg: 'rgba(245, 158, 11, 0.10)', text: '#d97706' },
  team: { bg: 'rgba(59, 130, 246, 0.10)', text: '#2563eb' },
  deal_risk: { bg: 'rgba(239, 68, 68, 0.10)', text: '#dc2626' },
  predictive: { bg: 'rgba(139, 92, 246, 0.10)', text: '#7c3aed' },
};

// ─── CATEGORY LABELS ────────────────────────────────────────
const CATEGORY_LABELS: Record<AlertCategory, string> = {
  compliance: 'Compliance',
  pipeline: 'Pipeline',
  escalation: 'Escalation',
  team: 'Team',
  deal_risk: 'Deal Risk',
  predictive: 'Predictive',
};

// ─── CATEGORY ACTION CONFIG ─────────────────────────────────
const CATEGORY_ACTIONS: Record<
  AlertCategory,
  {
    label: string;
    icon: typeof Shield;
    gradient: string;
    shadow: string;
    route: string;
  }
> = {
  compliance: {
    label: 'Review Compliance',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    shadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
    route: '/manager/compliance',
  },
  pipeline: {
    label: 'View Pipeline',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    shadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
    route: '/manager/commissions',
  },
  escalation: {
    label: 'Handle Escalation',
    icon: AlertTriangle,
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    shadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
    route: '/manager/escalations',
  },
  team: {
    label: 'View Team',
    icon: Users,
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    shadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
    route: '/manager/team',
  },
  deal_risk: {
    label: 'Coach Agent',
    icon: GraduationCap,
    gradient: 'linear-gradient(135deg, #ef4444 0%, #e11d48 100%)',
    shadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
    route: '/manager/development',
  },
  predictive: {
    label: 'Schedule 1:1',
    icon: Calendar,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    shadow: '0 2px 8px rgba(139, 92, 246, 0.25)',
    route: '/manager/one-on-ones',
  },
};

// ─── INCOMING ALERT POOL (for simulated real-time) ──────────
const INCOMING_ALERTS: Alert[] = [
  { id: 'new-1', title: 'Missed Client Callback', description: 'Sarah Johnson missed a scheduled 3:00 PM callback with the Williams Family — they called in asking for her and were transferred to voicemail', agentName: 'Sarah Johnson', agentAvatar: 'SJ', priority: 'high', category: 'compliance', timestamp: 'Just now', read: false },
  { id: 'new-2', title: 'Deal Closed — Park Family', description: 'Rachel Green closed the Park Family Whole Life policy — $18K annual premium, 20-year term. Commission: $2,340. Client signed digitally at 2:47 PM.', agentName: 'Rachel Green', agentAvatar: 'RG', priority: 'low', category: 'pipeline', timestamp: 'Just now', read: false },
  { id: 'new-3', title: 'High-Value Lead Requires Contact', description: '$120K estate planning lead (Morrison Trust) assigned to David Brown via round-robin. Lead source: referral from existing client. Contact within 1 hour required per SLA.', agentName: 'David Brown', agentAvatar: 'DB', priority: 'high', category: 'pipeline', timestamp: 'Just now', read: false },
  { id: 'new-4', title: 'Client Escalation — Policy Change Dispute', description: 'Priority client Margaret Thompson called in upset about unauthorized beneficiary changes on policy #UL-2025-7734. Requesting immediate manager callback. Client tenure: 8 years.', agentName: 'Lisa Park', agentAvatar: 'LP', priority: 'urgent', category: 'escalation', timestamp: 'Just now', read: false },
  { id: 'new-5', title: 'AI: Agent Burnout Risk', description: 'Emily Davis has logged 52 hours this week (team avg: 40hrs). Call volume up 45% but close rate dropped 20%. Pattern matches pre-burnout indicators with 82% confidence.', agentName: 'Emily Davis', agentAvatar: 'ED', priority: 'medium', category: 'predictive', timestamp: 'Just now', read: false },
];

// ─── PRIORITY SORT ORDER ────────────────────────────────────
const PRIORITY_ORDER: Record<AlertPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_ESCALATE: Record<AlertPriority, AlertPriority> = { low: 'medium', medium: 'high', high: 'urgent', urgent: 'urgent' };

// ─── TIME GROUP HELPER ──────────────────────────────────────
function getTimeGroup(timestamp: string): 'Today' | 'Yesterday' | 'Earlier' {
  const t = timestamp.toLowerCase();
  if (t.includes('yesterday')) return 'Yesterday';
  if (t.includes('just now') || t.includes('min ago') || t.includes('hr ago') || t.includes('hrs ago')) return 'Today';
  return 'Earlier';
}

// ─── CONTEXTUAL EMPTY STATES ────────────────────────────────
const EMPTY_STATES: Record<FilterKey, { title: string; description: string }> = {
  all: { title: 'All clear!', description: 'No alerts right now. Your team is running smoothly.' },
  urgent: { title: 'No urgent alerts', description: 'Great job — nothing needs immediate attention.' },
  compliance: { title: 'Compliance is clean', description: 'All agents are up to date on certifications and follow-ups.' },
  pipeline: { title: 'Pipeline looks healthy', description: 'No pipeline warnings at this time.' },
  team: { title: 'Team is on track', description: 'No team-related alerts to review.' },
  deal_risk: { title: 'No at-risk deals', description: 'All active deals are progressing on schedule.' },
  predictive: { title: 'No AI insights yet', description: 'Check back later — the AI model updates throughout the day.' },
};

// ─── EXPANDED ALERT DETAILS ─────────────────────────────────
const ALERT_DETAILS: Record<string, { context: string; suggestedActions: string[] }> = {
  '1': { context: 'Carlos has 3 follow-ups from last Tuesday that remain unactioned. Clients: Thompson, Williams, Park. Average response SLA is 48hrs — these are now 5 days overdue.', suggestedActions: ['Call Carlos to discuss', 'Reassign leads if unresponsive', 'Add to next coaching session'] },
  '2': { context: 'Anderson Group moved from Discovery to Proposal. Deal value: $45K annual premium. Sarah sent the proposal deck yesterday. Next step: client review meeting scheduled for Friday.', suggestedActions: ['Review proposal terms', 'Offer deal support', 'Check pricing approval'] },
  '3': { context: 'Emily\'s Life Insurance certification (License #LI-2024-8891) expires March 12, 2026. She needs to complete 8 CE credits and pass the renewal exam. Processing takes 3-5 business days.', suggestedActions: ['Notify Emily immediately', 'Block new policy assignments', 'Schedule study time'] },
  '4': { context: 'Client Ryan Taylor called about a $340 billing discrepancy on policy #WL-2025-4421. He was charged twice for February premium. Client tone was frustrated but professional. Case opened in CRM.', suggestedActions: ['Review billing history', 'Issue refund if confirmed', 'Follow up with client'] },
  '5': { context: 'Lisa completed all 12 onboarding modules, passed the product knowledge quiz (92%), and has been assigned to your team. She\'s ready to start taking calls.', suggestedActions: ['Welcome message', 'Assign mentor', 'Set first-week goals'] },
  '6': { context: 'James has closed $14K of his $40K monthly target. He has 8 business days remaining. His call volume is 40% below team average this month. Pipeline has $18K in late-stage deals.', suggestedActions: ['Schedule 1:1 coaching', 'Review his pipeline together', 'Pair with top performer'] },
  '7': { context: 'Anna submitted a 22% discount for Chen Corp group policy. Company threshold is 15%. Deal value: $28K. Anna\'s discount track record is conservative — this may be justified.', suggestedActions: ['Review discount justification', 'Approve or counter-offer', 'Check competitor pricing'] },
  '8': { context: 'Team exceeded the weekly target of 4 deals by closing 5. Total weekly premium: $127K. Top contributors: Sarah (2 deals), Rachel (2 deals), David (1 deal).', suggestedActions: ['Congratulate the team', 'Share in team channel', 'Consider team reward'] },
  '9': { context: 'David\'s Chen Annuity deal ($89K) has been in Contacted stage for 21 days with no progression. Last activity was an email sent March 1st with no response. Client may have gone cold.', suggestedActions: ['Coach David on re-engagement', 'Suggest phone call approach', 'Review if deal is still viable'] },
  '10': { context: 'Rachel\'s Williams Family IUL deal ($62K) — last client contact was 14 days ago. The proposal sent on Feb 19 expires March 8. Client was initially very interested (responded within 2 hours).', suggestedActions: ['Urgent: contact client today', 'Offer revised terms if needed', 'Extend proposal deadline'] },
  '11': { context: 'AI model analyzed Carlos\'s activity over the past 30 days: call volume down 35%, email response time up 2x, no new leads added in 10 days. Historical pattern matches agents who missed quota 78% of the time.', suggestedActions: ['Schedule coaching session', 'Review personal circumstances', 'Set daily activity targets'] },
  '12': { context: 'Anna\'s call-to-close ratio improved from 12% to 17% over the past 60 days. She\'s now in the top 25% of the team. Her client satisfaction scores are also trending up (+15%).', suggestedActions: ['Discuss advancement path', 'Consider for team lead role', 'Recognize in team meeting'] },
  'new-1': { context: 'Sarah had a scheduled callback with the Williams Family at 3:00 PM today. She was on another call at the time (Thompson review, ran 22 min over). Williams called the main line at 3:12 PM and was sent to voicemail. No return call logged yet. The Williams Family are in the proposal stage for a $55K IUL.', suggestedActions: ['Have Sarah call Williams immediately', 'Check if client left a voicemail', 'Review Sarah\'s calendar for overbooking'] },
  'new-2': { context: 'Rachel closed the Park Family Whole Life policy after 3 meetings over 2 weeks. Original lead came from a seminar on Feb 18. Policy details: $18K annual premium, 20-year pay, $500K death benefit. Client paid first premium via ACH. Rachel\'s month-to-date: $47K (118% of quota).', suggestedActions: ['Congratulate Rachel', 'Share win in team channel', 'Request client testimonial'] },
  'new-3': { context: 'Morrison Trust lead ($120K estate planning) was referred by existing client Dr. Harold Chen. Lead assigned to David via round-robin at 2:30 PM. Per SLA, first contact must happen within 60 minutes for referral leads. David is currently showing as "available" in the system. Lead notes indicate the trust attorney wants to schedule a joint call.', suggestedActions: ['Confirm David has seen the assignment', 'Call David if no contact logged in 30 min', 'Prepare estate planning case materials'] },
  'new-4': { context: 'Margaret Thompson (8-year client, $340K total portfolio) called at 2:55 PM regarding policy #UL-2025-7734. She says her beneficiary was changed from her daughter to her ex-husband without authorization. Lisa Park was the last agent to service the account on Feb 28. The change shows as an e-signature but Mrs. Thompson denies making it. Compliance may need to investigate.', suggestedActions: ['Call Mrs. Thompson within the hour', 'Pull audit log for policy changes', 'Loop in compliance if signature is disputed', 'Reassure client — do not admit fault'] },
  'new-5': { context: 'Emily has worked 52 hours Mon–Thu this week (team average: 32 hours through Thursday). Her call volume is 45% above average but her close rate dropped from 18% to 14.4%. She cancelled her Friday PTO that was approved last month. Last burnout case on the team (James, Oct 2025) resulted in a 3-week leave. Early intervention recommended.', suggestedActions: ['Schedule a check-in with Emily', 'Review her workload and redistribute if needed', 'Remind her about approved PTO', 'Monitor for another week before formal action'] },
};

// ─── COMPONENT ──────────────────────────────────────────────
export function ManagerAlerts() {
  const [, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'priority'>('newest');
  const [agentPopup, setAgentPopup] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [escalationReply, setEscalationReply] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const incomingIdx = useRef(0);

  // Simulated new alert every ~30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (incomingIdx.current >= INCOMING_ALERTS.length) return;
      const src = INCOMING_ALERTS[incomingIdx.current];
      const newAlert = { ...src, id: `${src.id}-${Date.now()}` };
      incomingIdx.current += 1;
      setAlerts((prev) => [newAlert, ...prev]);
      if (soundEnabled) {
        toast('New alert received', { description: newAlert.title, icon: '🔔' });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Computed counts
  const unreadCount = alerts.filter((a) => !a.read).length;
  const urgentCount = alerts.filter((a) => a.priority === 'urgent').length;
  const resolvedCount = alerts.filter((a) => a.resolved).length;
  const predictiveCount = alerts.filter((a) => a.category === 'predictive').length;

  // Filtered + sorted alerts
  const filteredAlerts = useMemo(() => {
    let result = alerts.filter((alert) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'urgent') return alert.priority === 'urgent';
      return alert.category === activeFilter;
    });
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) =>
        a.agentName.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
      );
    }
    if (sortBy === 'priority') {
      result = [...result].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    }
    return result;
  }, [alerts, activeFilter, sortBy, searchQuery]);

  // Badge counts per filter
  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = { all: alerts.length, urgent: 0, compliance: 0, pipeline: 0, team: 0, deal_risk: 0, predictive: 0 };
    for (const a of alerts) {
      if (a.priority === 'urgent') counts.urgent++;
      counts[a.category as FilterKey]++;
    }
    return counts;
  }, [alerts]);

  // Group alerts by time
  const groupedAlerts = useMemo(() => {
    const groups: { label: string; alerts: Alert[] }[] = [];
    const today: Alert[] = [];
    const yesterday: Alert[] = [];
    const earlier: Alert[] = [];
    for (const alert of filteredAlerts) {
      const group = getTimeGroup(alert.timestamp);
      if (group === 'Today') today.push(alert);
      else if (group === 'Yesterday') yesterday.push(alert);
      else earlier.push(alert);
    }
    const pinSort = (a: Alert, b: Alert) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    if (today.length) groups.push({ label: 'Today', alerts: today.sort(pinSort) });
    if (yesterday.length) groups.push({ label: 'Yesterday', alerts: yesterday.sort(pinSort) });
    if (earlier.length) groups.push({ label: 'Earlier', alerts: earlier.sort(pinSort) });
    return groups;
  }, [filteredAlerts]);

  // Dismiss handler
  const handleDismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (expandedAlert === id) setExpandedAlert(null);
  };

  // Mark as read handler
  const handleReview = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a)),
    );
  };

  // Mark all read
  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    toast.success('All alerts marked as read');
  };

  // Clear all dismissed
  const handleClearAll = () => {
    const readAlerts = alerts.filter((a) => a.read);
    if (readAlerts.length === 0) {
      toast('Nothing to clear', { description: 'No read alerts to remove.' });
      return;
    }
    setAlerts((prev) => prev.filter((a) => !a.read));
    setExpandedAlert(null);
    toast.success(`Cleared ${readAlerts.length} read alerts`);
  };

  // Snooze handler
  const handleSnooze = (id: string, duration: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (expandedAlert === id) setExpandedAlert(null);
    toast(`Alert snoozed for ${duration}`, { description: 'It will reappear later.' });
  };

  // Pin toggle
  const handlePin = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  // Save note
  const handleSaveNote = (id: string) => {
    const note = noteInputs[id]?.trim();
    if (!note) return;
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, note } : a));
    setNoteInputs((prev) => ({ ...prev, [id]: '' }));
    toast.success('Note saved');
  };

  // Resolve toggle
  const handleResolve = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, resolved: !a.resolved, read: true } : a));
    const alert = alerts.find((a) => a.id === id);
    toast.success(alert?.resolved ? 'Marked as unresolved' : 'Marked as resolved');
  };

  // Escalate priority
  const handleEscalate = (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (!alert || alert.priority === 'urgent') {
      toast('Already at highest priority');
      return;
    }
    const newPriority = PRIORITY_ESCALATE[alert.priority];
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, priority: newPriority } : a));
    toast.success(`Escalated to ${newPriority}`);
  };

  // Bulk select toggle
  const toggleSelect = (id: string) => {
    setSelectedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const ids = filteredAlerts.map((a) => a.id);
    setSelectedAlerts((prev) => prev.size === ids.length ? new Set() : new Set(ids));
  };

  // Bulk operations
  const handleBulkMarkRead = () => {
    setAlerts((prev) => prev.map((a) => selectedAlerts.has(a.id) ? { ...a, read: true } : a));
    toast.success(`${selectedAlerts.size} alerts marked as read`);
    setSelectedAlerts(new Set());
  };

  const handleBulkResolve = () => {
    setAlerts((prev) => prev.map((a) => selectedAlerts.has(a.id) ? { ...a, resolved: true, read: true } : a));
    toast.success(`${selectedAlerts.size} alerts resolved`);
    setSelectedAlerts(new Set());
  };

  const handleBulkDismiss = () => {
    setAlerts((prev) => prev.filter((a) => !selectedAlerts.has(a.id)));
    toast.success(`${selectedAlerts.size} alerts dismissed`);
    setSelectedAlerts(new Set());
    setExpandedAlert(null);
  };

  const handleBulkSnooze = (duration: string) => {
    setAlerts((prev) => prev.filter((a) => !selectedAlerts.has(a.id)));
    toast(`${selectedAlerts.size} alerts snoozed for ${duration}`);
    setSelectedAlerts(new Set());
    setExpandedAlert(null);
  };

  // Send escalation reply
  const handleEscalationReply = (id: string, agentName: string) => {
    const reply = escalationReply[id]?.trim();
    if (!reply) return;
    setEscalationReply((prev) => ({ ...prev, [id]: '' }));
    toast.success(`Reply sent to ${agentName}`, { description: reply.slice(0, 60) + (reply.length > 60 ? '...' : '') });
  };

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
      >
        {/* ── Hero ─────────────────────────────────────────────── */}
        <ManagerPageHero
          icon={Bell}
          title="Alerts"
          subtitle="Team events that need your attention"
          badge={
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setSoundEnabled(!soundEnabled); toast(soundEnabled ? 'Notifications muted' : 'Notifications unmuted'); }}
              className="flex items-center font-semibold text-white"
              style={{
                gap: 5,
                padding: '4px 12px',
                borderRadius: RADIUS.pill,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                border: 'none',
                cursor: 'pointer',
                fontSize: TYPE.caption,
              }}
            >
              {soundEnabled ? <Volume2 style={{ width: 13, height: 13 }} /> : <VolumeX style={{ width: 13, height: 13 }} />}
              {soundEnabled ? 'Sound On' : 'Muted'}
            </motion.button>
          }
        />

        {/* ── Stat Cards ───────────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={Bell}
              value={unreadCount}
              label="Unread Alerts"
              delta={-2}
              periodLabel="vs yesterday"
            />
            <ManagerStatCard
              icon={AlertTriangle}
              value={urgentCount}
              label="Urgent"
              delta={1}
              periodLabel="vs yesterday"
            />
            <ManagerStatCard
              icon={CircleCheck}
              value={resolvedCount}
              label="Resolved"
              delta={5}
              periodLabel="This week"
            />
            <ManagerStatCard
              icon={Sparkles}
              value={predictiveCount}
              label="AI Insights"
              delta={2}
              periodLabel="New today"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Search Bar ─────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div className="relative">
            <Search className="absolute text-gray-400" style={{ width: 16, height: 16, left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search alerts by agent, title, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-gray-700 placeholder:text-gray-400"
              style={{
                ...glassCard,
                padding: `${GRID.spacing.sm}px ${GRID.spacing.sm}px ${GRID.spacing.sm}px 36px`,
                borderRadius: RADIUS.card,
                fontSize: TYPE.meta,
                border: `1px solid ${COLORS.gray[200]}`,
                outline: 'none',
              }}
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearchQuery('')}
                className="absolute text-gray-400 hover:text-gray-600"
                style={{ right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}
              >
                <X style={{ width: 14, height: 14 }} />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ── Filter Bar + Sort Toggle ────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center justify-between"
          style={{ gap: GRID.spacing.xs }}
        >
          <div className="flex flex-wrap items-center" style={{ gap: GRID.spacing.xs }}>
            {FILTER_OPTIONS.map((opt) => {
              const isActive = activeFilter === opt.value;
              const count = filterCounts[opt.value];
              return (
                <motion.button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className="font-medium border-0"
                  style={{
                    ...(isActive
                      ? {
                          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        }
                      : {
                          ...glassCard,
                          color: COLORS.gray[600],
                        }),
                    borderRadius: RADIUS.pill,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm + 4}px`,
                    fontSize: TYPE.meta,
                    cursor: 'pointer',
                    gap: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {opt.label}
                  {count > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        minWidth: 18,
                        height: 18,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: RADIUS.pill,
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(16, 185, 129, 0.12)',
                        color: isActive ? 'white' : '#059669',
                        padding: '0 5px',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
          {/* Sort toggle */}
          <div className="flex items-center" style={{ gap: 4 }}>
            {([['newest', 'Newest'], ['priority', 'Priority']] as const).map(([key, label]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSortBy(key)}
                className="font-medium"
                style={{
                  fontSize: TYPE.micro,
                  padding: '4px 10px',
                  borderRadius: RADIUS.pill,
                  border: 'none',
                  background: sortBy === key ? 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' : 'transparent',
                  color: sortBy === key ? 'white' : COLORS.gray[500],
                  cursor: 'pointer',
                }}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Alert List ───────────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          style={{
            ...glassCard,
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.card,
            overflow: 'hidden',
          }}
        >
          {/* Section header */}
          <div
            className="flex items-center"
            style={{
              padding: GRID.spacing.md,
              paddingBottom: GRID.spacing.sm,
              gap: GRID.spacing.sm,
              borderBottom: `1px solid ${GLASS.border}`,
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                borderRadius: RADIUS.button,
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
              }}
            >
              <Bell
                className="text-amber-200 drop-shadow-sm"
                style={{ width: 20, height: 20 }}
                aria-hidden="true"
              />
            </div>
            <div style={{ flex: 1 }}>
              <p
                className="font-semibold text-gray-900"
                style={{ fontSize: TYPE.title }}
              >
                Alert Feed
              </p>
              <p
                className="text-gray-500"
                style={{ fontSize: TYPE.caption }}
              >
                {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} showing
              </p>
            </div>
            {/* Bulk actions */}
            <div className="flex items-center flex-shrink-0" style={{ gap: GRID.spacing.xs }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleMarkAllRead}
                className="flex items-center font-medium text-gray-500 hover:text-emerald-600"
                style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
              >
                <CheckCheck style={{ width: 14, height: 14 }} />
                Mark All Read
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleClearAll}
                className="flex items-center font-medium text-gray-400 hover:text-rose-500"
                style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
              >
                <Trash2 style={{ width: 13, height: 13 }} />
                Clear Read
              </motion.button>
            </div>
          </div>

          {/* Bulk selection bar */}
          <AnimatePresence>
            {selectedAlerts.size > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  className="flex items-center flex-wrap"
                  style={{
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                    gap: GRID.spacing.xs,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(4, 120, 87, 0.06) 100%)',
                    borderBottom: `1px solid ${GLASS.border}`,
                  }}
                >
                  <span className="font-semibold text-emerald-700" style={{ fontSize: TYPE.caption }}>{selectedAlerts.size} selected</span>
                  <div className="flex-1" />
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleBulkMarkRead}
                    className="flex items-center font-medium text-gray-600 hover:text-emerald-600"
                    style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                  >
                    <CheckCheck style={{ width: 13, height: 13 }} /> Mark Read
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleBulkResolve}
                    className="flex items-center font-medium text-gray-600 hover:text-emerald-600"
                    style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                  >
                    <CircleCheck style={{ width: 13, height: 13 }} /> Resolve
                  </motion.button>
                  {(['1 hour', '4 hours'] as const).map((dur) => (
                    <motion.button key={dur} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => handleBulkSnooze(dur)}
                      className="flex items-center font-medium text-gray-500 hover:text-amber-600"
                      style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                    >
                      <AlarmClock style={{ width: 12, height: 12 }} /> {dur}
                    </motion.button>
                  ))}
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleBulkDismiss}
                    className="flex items-center font-medium text-gray-400 hover:text-rose-500"
                    style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                  >
                    <Trash2 style={{ width: 13, height: 13 }} /> Dismiss
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setSelectedAlerts(new Set())}
                    className="flex items-center font-medium text-gray-400 hover:text-gray-600"
                    style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                  >
                    <X style={{ width: 13, height: 13 }} /> Cancel
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alert rows — grouped by time */}
          <div
            style={{
              padding: GRID.spacing.sm,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              maxHeight: 700,
              overflowY: 'auto',
            }}
          >
            <AnimatePresence mode="popLayout">
              {filteredAlerts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ManagerEmptyState
                    icon={Bell}
                    title={EMPTY_STATES[activeFilter].title}
                    description={EMPTY_STATES[activeFilter].description}
                  />
                </motion.div>
              )}

              {groupedAlerts.map((group) => (
                <div key={group.label}>
                  {/* Time group divider */}
                  <div className="flex items-center" style={{ gap: GRID.spacing.sm, padding: `${GRID.spacing.sm}px ${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        const ids = group.alerts.map((a) => a.id);
                        const allSelected = ids.every((id) => selectedAlerts.has(id));
                        setSelectedAlerts((prev) => {
                          const next = new Set(prev);
                          ids.forEach((id) => allSelected ? next.delete(id) : next.add(id));
                          return next;
                        });
                      }}
                      className="flex-shrink-0"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      title={`Select all ${group.label}`}
                    >
                      {group.alerts.every((a) => selectedAlerts.has(a.id))
                        ? <CheckSquare className="text-emerald-500" style={{ width: 14, height: 14 }} />
                        : <Square className="text-gray-300" style={{ width: 14, height: 14 }} />
                      }
                    </motion.button>
                    <span className="font-semibold text-gray-400" style={{ fontSize: TYPE.micro, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{group.label}</span>
                    <div className="flex-1" style={{ height: 1, backgroundColor: COLORS.gray[100] }} />
                  </div>

                  {group.alerts.map((alert) => {
                    const dotColor = PRIORITY_DOT_COLORS[alert.priority];
                    const badgeStyle = CATEGORY_BADGE_STYLES[alert.category];
                    const categoryLabel = CATEGORY_LABELS[alert.category];
                    const action = CATEGORY_ACTIONS[alert.category];
                    const ActionIcon = action.icon;
                    const isExpanded = expandedAlert === alert.id;
                    const detailKey = alert.id.replace(/-\d{13,}$/, '');
                    const details = ALERT_DETAILS[detailKey] || ALERT_DETAILS[alert.id];

                    return (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -40, transition: { duration: MOTION.duration.fast } }}
                        transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
                        style={{
                          borderRadius: RADIUS.button,
                          backgroundColor: isExpanded ? COLORS.gray[50] : alert.read ? 'transparent' : 'rgba(16, 185, 129, 0.04)',
                          transition: `background-color ${MOTION.duration.hover}s`,
                          marginBottom: 2,
                        }}
                      >
                        {/* Main row — clickable to expand */}
                        <div
                          className="flex items-start cursor-pointer"
                          style={{ padding: GRID.spacing.sm, gap: GRID.spacing.sm, opacity: alert.resolved ? 0.55 : 1 }}
                          onClick={() => { setExpandedAlert(isExpanded ? null : alert.id); if (!alert.read) handleReview(alert.id); }}
                        >
                          {/* Checkbox */}
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); toggleSelect(alert.id); }}
                            className="flex-shrink-0"
                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}
                          >
                            {selectedAlerts.has(alert.id)
                              ? <CheckSquare className="text-emerald-500" style={{ width: 15, height: 15 }} />
                              : <Square className="text-gray-300" style={{ width: 15, height: 15 }} />
                            }
                          </motion.button>

                          {/* Priority dot */}
                          <div style={{
                            width: 10, height: 10, borderRadius: RADIUS.pill,
                            backgroundColor: dotColor, flexShrink: 0, marginTop: 6,
                            boxShadow: alert.priority === 'urgent' ? `0 0 8px ${dotColor}80` : undefined,
                          }} />

                          {/* Agent avatar — clickable */}
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            onClick={(e) => { e.stopPropagation(); setAgentPopup(agentPopup?.id === alert.id ? null : { id: alert.id, name: alert.agentName, avatar: alert.agentAvatar }); }}
                            className="flex items-center justify-center font-bold text-white flex-shrink-0 cursor-pointer relative"
                            style={{
                              width: GRID.spacing.xl, height: GRID.spacing.xl,
                              borderRadius: RADIUS.button,
                              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                              fontSize: TYPE.caption, boxShadow: SHADOW.level2,
                            }}
                          >
                            {alert.agentAvatar}
                          </motion.div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs, marginBottom: 2 }}>
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body, lineHeight: 1.3, opacity: alert.read ? 0.7 : 1 }}>
                                {alert.title}
                              </p>
                              <span className="font-medium" style={{ fontSize: TYPE.micro, padding: `2px ${GRID.spacing.xs}px`, borderRadius: RADIUS.pill, backgroundColor: badgeStyle.bg, color: badgeStyle.text, lineHeight: 1.5 }}>
                                {categoryLabel}
                              </span>
                              {alert.resolved && (
                                <span className="flex items-center font-medium" style={{ fontSize: TYPE.micro, gap: 2, padding: `2px ${GRID.spacing.xs}px`, borderRadius: RADIUS.pill, backgroundColor: 'rgba(16, 185, 129, 0.10)', color: '#059669', lineHeight: 1.5 }}>
                                  <CircleCheck style={{ width: 10, height: 10 }} />
                                  Resolved
                                </span>
                              )}
                              {!alert.read && !alert.resolved && (
                                <span style={{ width: 7, height: 7, borderRadius: RADIUS.pill, backgroundColor: '#10b981', display: 'inline-block', flexShrink: 0 }} />
                              )}
                            </div>
                            <p className="text-gray-500" style={{ fontSize: TYPE.meta, lineHeight: 1.5, opacity: alert.read ? 0.65 : 0.85 }}>
                              {alert.description}
                            </p>
                          </div>

                          {/* Pin + Timestamp */}
                          <div className="flex items-center flex-shrink-0" style={{ gap: 6, marginTop: 2 }}>
                            <motion.button
                              onClick={(e) => { e.stopPropagation(); handlePin(alert.id); }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="flex items-center justify-center"
                              style={{
                                width: 24, height: 24, borderRadius: RADIUS.pill, border: 'none',
                                background: alert.pinned ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                                cursor: 'pointer', padding: 0,
                              }}
                              title={alert.pinned ? 'Unpin alert' : 'Pin alert'}
                            >
                              <Pin style={{ width: 13, height: 13, color: alert.pinned ? '#059669' : COLORS.gray[300], transform: alert.pinned ? 'rotate(0deg)' : 'rotate(45deg)', transition: 'all 0.2s' }} />
                            </motion.button>
                            <div className="hidden sm:flex items-center text-gray-400" style={{ gap: 4, fontSize: TYPE.caption, minWidth: 80, justifyContent: 'flex-end' }}>
                              <Clock style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                              <span>{alert.timestamp}</span>
                            </div>
                          </div>

                          {/* Expand indicator */}
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-gray-300 flex-shrink-0"
                            style={{ marginTop: 4 }}
                          >
                            <ChevronDown style={{ width: 16, height: 16 }} />
                          </motion.div>
                        </div>

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {isExpanded && details && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: MOTION.easing }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ padding: `0 ${GRID.spacing.sm}px ${GRID.spacing.md}px`, paddingLeft: GRID.spacing.sm + 10 + GRID.spacing.sm + GRID.spacing.xl + GRID.spacing.sm }}>
                                {/* Context */}
                                <div style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: 'white', border: `1px solid ${COLORS.gray[200]}`, marginBottom: GRID.spacing.sm }}>
                                  <p className="font-medium text-gray-700" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Context</p>
                                  <p className="text-gray-600" style={{ fontSize: TYPE.meta, lineHeight: 1.6 }}>{details.context}</p>
                                </div>

                                {/* Suggested actions */}
                                <p className="font-medium text-gray-700" style={{ fontSize: TYPE.caption, marginBottom: GRID.spacing.xs }}>Suggested Actions</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: GRID.spacing.md }}>
                                  {details.suggestedActions.map((sa, i) => (
                                    <div key={i} className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                      <div className="bg-emerald-500 flex-shrink-0" style={{ width: 5, height: 5, borderRadius: RADIUS.pill }} />
                                      <span className="text-gray-600" style={{ fontSize: TYPE.meta }}>{sa}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Manager Note */}
                                <div style={{ marginBottom: GRID.spacing.md }}>
                                  {alert.note && (
                                    <div className="flex items-start" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, backgroundColor: 'rgba(16, 185, 129, 0.06)', border: `1px solid rgba(16, 185, 129, 0.15)` }}>
                                      <MessageSquare className="text-emerald-500 flex-shrink-0" style={{ width: 13, height: 13, marginTop: 2 }} />
                                      <div>
                                        <p className="font-medium text-emerald-700" style={{ fontSize: TYPE.micro, marginBottom: 2 }}>Your Note</p>
                                        <p className="text-gray-600" style={{ fontSize: TYPE.meta, lineHeight: 1.5 }}>{alert.note}</p>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                    <input
                                      type="text"
                                      placeholder="Add a note..."
                                      value={noteInputs[alert.id] || ''}
                                      onChange={(e) => setNoteInputs((prev) => ({ ...prev, [alert.id]: e.target.value }))}
                                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNote(alert.id); }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-gray-700 placeholder:text-gray-300"
                                      style={{
                                        flex: 1, fontSize: TYPE.meta, padding: '6px 10px',
                                        borderRadius: RADIUS.button, border: `1px solid ${COLORS.gray[200]}`,
                                        outline: 'none', background: 'white',
                                      }}
                                    />
                                    <motion.button
                                      whileHover={{ scale: 1.06 }}
                                      whileTap={{ scale: 0.94 }}
                                      onClick={(e) => { e.stopPropagation(); handleSaveNote(alert.id); }}
                                      className="flex items-center font-medium text-emerald-600"
                                      style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                                    >
                                      <Send style={{ width: 12, height: 12 }} />
                                      Save
                                    </motion.button>
                                  </div>
                                </div>

                                {/* Escalation Quick Reply */}
                                {alert.category === 'escalation' && (
                                  <div style={{ marginBottom: GRID.spacing.md, padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: 'rgba(245, 158, 11, 0.06)', border: `1px solid rgba(245, 158, 11, 0.15)` }}>
                                    <p className="font-medium text-amber-700" style={{ fontSize: TYPE.caption, marginBottom: GRID.spacing.xs }}>Quick Reply to {alert.agentName}</p>
                                    <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                      <input
                                        type="text"
                                        placeholder="Type your response..."
                                        value={escalationReply[alert.id] || ''}
                                        onChange={(e) => setEscalationReply((prev) => ({ ...prev, [alert.id]: e.target.value }))}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleEscalationReply(alert.id, alert.agentName); }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-gray-700 placeholder:text-gray-400"
                                        style={{
                                          flex: 1, fontSize: TYPE.meta, padding: '6px 10px',
                                          borderRadius: RADIUS.button, border: `1px solid rgba(245, 158, 11, 0.25)`,
                                          outline: 'none', background: 'white',
                                        }}
                                      />
                                      <motion.button
                                        whileHover={{ scale: 1.06 }}
                                        whileTap={{ scale: 0.94 }}
                                        onClick={(e) => { e.stopPropagation(); handleEscalationReply(alert.id, alert.agentName); }}
                                        className="flex items-center font-semibold text-white border-0"
                                        style={{
                                          gap: 4, fontSize: TYPE.caption, padding: '6px 12px',
                                          borderRadius: RADIUS.pill, cursor: 'pointer',
                                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
                                        }}
                                      >
                                        <Send style={{ width: 12, height: 12 }} />
                                        Send
                                      </motion.button>
                                    </div>
                                  </div>
                                )}

                                {/* Action row */}
                                <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs }}>
                                  {/* Primary action — navigates to relevant page */}
                                  <motion.button
                                    onClick={() => { handleReview(alert.id); navigate(action.route); }}
                                    className="flex items-center font-semibold text-white border-0"
                                    style={{ background: action.gradient, borderRadius: RADIUS.pill, padding: '6px 14px', fontSize: TYPE.caption, gap: 5, cursor: 'pointer', boxShadow: action.shadow }}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                  >
                                    <ActionIcon style={{ width: 13, height: 13 }} />
                                    {action.label}
                                  </motion.button>

                                  {/* Resolve */}
                                  <motion.button
                                    onClick={() => handleResolve(alert.id)}
                                    className="flex items-center font-medium"
                                    style={{
                                      gap: 4, fontSize: TYPE.caption, borderRadius: RADIUS.pill, padding: '4px 10px', cursor: 'pointer',
                                      border: `1px solid ${alert.resolved ? '#10b981' : COLORS.gray[200]}`,
                                      background: alert.resolved ? 'rgba(16, 185, 129, 0.08)' : 'white',
                                      color: alert.resolved ? '#059669' : COLORS.gray[500],
                                    }}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                  >
                                    <CircleCheck style={{ width: 13, height: 13 }} />
                                    {alert.resolved ? 'Resolved' : 'Resolve'}
                                  </motion.button>

                                  {/* Escalate priority */}
                                  {alert.priority !== 'urgent' && (
                                    <motion.button
                                      onClick={() => handleEscalate(alert.id)}
                                      className="flex items-center font-medium text-gray-500 hover:text-rose-600"
                                      style={{ gap: 4, fontSize: TYPE.caption, border: `1px solid ${COLORS.gray[200]}`, background: 'white', borderRadius: RADIUS.pill, padding: '4px 10px', cursor: 'pointer' }}
                                      whileHover={{ scale: 1.04, borderColor: '#f43f5e' }}
                                      whileTap={{ scale: 0.96 }}
                                    >
                                      <ArrowUp style={{ width: 12, height: 12 }} />
                                      Escalate
                                    </motion.button>
                                  )}

                                  {/* Snooze options */}
                                  {(['1 hour', '4 hours', 'Tomorrow'] as const).map((dur) => (
                                    <motion.button
                                      key={dur}
                                      onClick={() => handleSnooze(alert.id, dur)}
                                      className="flex items-center font-medium text-gray-500 hover:text-amber-600"
                                      style={{ gap: 4, fontSize: TYPE.caption, border: `1px solid ${COLORS.gray[200]}`, background: 'white', borderRadius: RADIUS.pill, padding: '4px 10px', cursor: 'pointer' }}
                                      whileHover={{ scale: 1.04, borderColor: '#f59e0b' }}
                                      whileTap={{ scale: 0.96 }}
                                    >
                                      <AlarmClock style={{ width: 12, height: 12 }} />
                                      {dur}
                                    </motion.button>
                                  ))}

                                  {/* Dismiss */}
                                  <motion.button
                                    onClick={() => handleDismiss(alert.id)}
                                    className="flex items-center font-medium text-gray-400 hover:text-rose-500"
                                    style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px', marginLeft: 'auto' }}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                  >
                                    <X style={{ width: 13, height: 13 }} />
                                    Dismiss
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
      {/* ── Agent Quick Popup ──────────────────────────────────── */}
      <AnimatePresence>
        {agentPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setAgentPopup(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="fixed z-50 inset-0 m-auto"
              style={{
                width: 320,
                height: 'fit-content',
                maxHeight: 280,
                borderRadius: RADIUS.card,
                backgroundColor: '#ffffff',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.18)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)', padding: GRID.spacing.md }}>
                <div className="absolute bg-white/10 blur-sm" style={{ width: 80, height: 80, borderRadius: RADIUS.pill, top: -20, right: -10 }} />
                <motion.button
                  onClick={() => setAgentPopup(null)}
                  whileHover={{ scale: 1.1 }}
                  className="absolute flex items-center justify-center text-white/80 hover:text-white bg-white/15"
                  style={{ top: 8, right: 8, width: 24, height: 24, borderRadius: RADIUS.button, border: 'none', cursor: 'pointer' }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </motion.button>
                <div className="relative z-10 flex items-center" style={{ gap: GRID.spacing.sm }}>
                  <div className="flex items-center justify-center text-white font-bold bg-white/20 backdrop-blur" style={{ width: 48, height: 48, borderRadius: RADIUS.card, fontSize: TYPE.body, border: '1px solid rgba(255,255,255,0.25)' }}>
                    {agentPopup.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white" style={{ fontSize: TYPE.body }}>{agentPopup.name}</p>
                    <p className="text-white/70" style={{ fontSize: TYPE.caption }}>Team Member</p>
                  </div>
                </div>
              </div>
              {/* Quick actions */}
              <div style={{ padding: GRID.spacing.sm, display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setAgentPopup(null); toast.success(`Calling ${agentPopup.name}...`); }}
                  className="flex items-center font-medium text-gray-700 w-full hover:bg-gray-50"
                  style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, border: 'none', background: 'none', cursor: 'pointer', padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                >
                  <Phone className="text-emerald-500" style={{ width: 16, height: 16 }} />
                  Call Agent
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setAgentPopup(null); toast.success(`Message sent to ${agentPopup.name}`); }}
                  className="flex items-center font-medium text-gray-700 w-full hover:bg-gray-50"
                  style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, border: 'none', background: 'none', cursor: 'pointer', padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                >
                  <Mail className="text-blue-500" style={{ width: 16, height: 16 }} />
                  Send Message
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setAgentPopup(null); toast('Opening scorecard...'); }}
                  className="flex items-center font-medium text-gray-700 w-full hover:bg-gray-50"
                  style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, border: 'none', background: 'none', cursor: 'pointer', padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                >
                  <Eye className="text-violet-500" style={{ width: 16, height: 16 }} />
                  View Scorecard
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ManagerLoungeLayout>
  );
}

// ─── TAB CONTENT (for embedding in ManagerEscalations) ──────
export function AlertsTabContent() {
  const [, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'priority'>('newest');
  const [agentPopup, setAgentPopup] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [escalationReply, setEscalationReply] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());

  // Computed counts
  const filteredAlerts = useMemo(() => {
    let result = alerts.filter((alert) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'urgent') return alert.priority === 'urgent';
      return alert.category === activeFilter;
    });
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) =>
        a.agentName.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
      );
    }
    if (sortBy === 'priority') {
      result = [...result].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    }
    return result;
  }, [alerts, activeFilter, sortBy, searchQuery]);

  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = { all: alerts.length, urgent: 0, compliance: 0, pipeline: 0, team: 0, deal_risk: 0, predictive: 0 };
    for (const a of alerts) {
      if (a.priority === 'urgent') counts.urgent++;
      counts[a.category as FilterKey]++;
    }
    return counts;
  }, [alerts]);

  const groupedAlerts = useMemo(() => {
    const groups: { label: string; alerts: Alert[] }[] = [];
    const today: Alert[] = [];
    const yesterday: Alert[] = [];
    const earlier: Alert[] = [];
    for (const alert of filteredAlerts) {
      const group = getTimeGroup(alert.timestamp);
      if (group === 'Today') today.push(alert);
      else if (group === 'Yesterday') yesterday.push(alert);
      else earlier.push(alert);
    }
    const pinSort = (a: Alert, b: Alert) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    if (today.length) groups.push({ label: 'Today', alerts: today.sort(pinSort) });
    if (yesterday.length) groups.push({ label: 'Yesterday', alerts: yesterday.sort(pinSort) });
    if (earlier.length) groups.push({ label: 'Earlier', alerts: earlier.sort(pinSort) });
    return groups;
  }, [filteredAlerts]);

  // Handlers
  const handleDismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (expandedAlert === id) setExpandedAlert(null);
  };

  const handleReview = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a)),
    );
  };

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    toast.success('All alerts marked as read');
  };

  const handleClearAll = () => {
    const readAlerts = alerts.filter((a) => a.read);
    if (readAlerts.length === 0) {
      toast('Nothing to clear', { description: 'No read alerts to remove.' });
      return;
    }
    setAlerts((prev) => prev.filter((a) => !a.read));
    setExpandedAlert(null);
    toast.success(`Cleared ${readAlerts.length} read alerts`);
  };

  const handleSnooze = (id: string, duration: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (expandedAlert === id) setExpandedAlert(null);
    toast(`Alert snoozed for ${duration}`, { description: 'It will reappear later.' });
  };

  const handlePin = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  const handleSaveNote = (id: string) => {
    const note = noteInputs[id]?.trim();
    if (!note) return;
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, note } : a));
    setNoteInputs((prev) => ({ ...prev, [id]: '' }));
    toast.success('Note saved');
  };

  const handleResolve = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, resolved: !a.resolved, read: true } : a));
    const alert = alerts.find((a) => a.id === id);
    toast.success(alert?.resolved ? 'Marked as unresolved' : 'Marked as resolved');
  };

  const handleEscalate = (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (!alert || alert.priority === 'urgent') {
      toast('Already at highest priority');
      return;
    }
    const newPriority = PRIORITY_ESCALATE[alert.priority];
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, priority: newPriority } : a));
    toast.success(`Escalated to ${newPriority}`);
  };

  const toggleSelect = (id: string) => {
    setSelectedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const ids = filteredAlerts.map((a) => a.id);
    setSelectedAlerts((prev) => prev.size === ids.length ? new Set() : new Set(ids));
  };

  const handleBulkMarkRead = () => {
    setAlerts((prev) => prev.map((a) => selectedAlerts.has(a.id) ? { ...a, read: true } : a));
    toast.success(`${selectedAlerts.size} alerts marked as read`);
    setSelectedAlerts(new Set());
  };

  const handleBulkResolve = () => {
    setAlerts((prev) => prev.map((a) => selectedAlerts.has(a.id) ? { ...a, resolved: true, read: true } : a));
    toast.success(`${selectedAlerts.size} alerts resolved`);
    setSelectedAlerts(new Set());
  };

  const handleBulkDismiss = () => {
    setAlerts((prev) => prev.filter((a) => !selectedAlerts.has(a.id)));
    toast.success(`${selectedAlerts.size} alerts dismissed`);
    setSelectedAlerts(new Set());
    setExpandedAlert(null);
  };

  const handleBulkSnooze = (duration: string) => {
    setAlerts((prev) => prev.filter((a) => !selectedAlerts.has(a.id)));
    toast(`${selectedAlerts.size} alerts snoozed for ${duration}`);
    setSelectedAlerts(new Set());
    setExpandedAlert(null);
  };

  const handleEscalationReply = (id: string, agentName: string) => {
    const reply = escalationReply[id]?.trim();
    if (!reply) return;
    setEscalationReply((prev) => ({ ...prev, [id]: '' }));
    toast.success(`Reply sent to ${agentName}`, { description: reply.slice(0, 60) + (reply.length > 60 ? '...' : '') });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}>
      {/* ── Search Bar ─────────────────────────────────────── */}
      <motion.div variants={fadeInUp}>
        <div className="relative">
          <Search className="absolute text-gray-400" style={{ width: 16, height: 16, left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search alerts by agent, title, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-gray-700 placeholder:text-gray-400"
            style={{
              ...glassCard,
              padding: `${GRID.spacing.sm}px ${GRID.spacing.sm}px ${GRID.spacing.sm}px 36px`,
              borderRadius: RADIUS.card,
              fontSize: TYPE.meta,
              border: `1px solid ${COLORS.gray[200]}`,
              outline: 'none',
            }}
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchQuery('')}
              className="absolute text-gray-400 hover:text-gray-600"
              style={{ right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}
            >
              <X style={{ width: 14, height: 14 }} />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── Filter Bar + Sort Toggle ────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-wrap items-center justify-between"
        style={{ gap: GRID.spacing.xs }}
      >
        <div className="flex flex-wrap items-center" style={{ gap: GRID.spacing.xs }}>
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.value;
            const count = filterCounts[opt.value];
            return (
              <motion.button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className="font-medium border-0"
                style={{
                  ...(isActive
                    ? {
                        background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }
                    : {
                        ...glassCard,
                        color: COLORS.gray[600],
                      }),
                  borderRadius: RADIUS.pill,
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.sm + 4}px`,
                  fontSize: TYPE.meta,
                  cursor: 'pointer',
                  gap: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {opt.label}
                {count > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: RADIUS.pill,
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(16, 185, 129, 0.12)',
                      color: isActive ? 'white' : '#059669',
                      padding: '0 5px',
                    }}
                  >
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
        {/* Sort toggle */}
        <div className="flex items-center" style={{ gap: 4 }}>
          {([['newest', 'Newest'], ['priority', 'Priority']] as const).map(([key, label]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSortBy(key)}
              className="font-medium"
              style={{
                fontSize: TYPE.micro,
                padding: '4px 10px',
                borderRadius: RADIUS.pill,
                border: 'none',
                background: sortBy === key ? 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' : 'transparent',
                color: sortBy === key ? 'white' : COLORS.gray[500],
                cursor: 'pointer',
              }}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Alert List ───────────────────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        style={{
          ...glassCard,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
          overflow: 'hidden',
        }}
      >
        {/* Section header */}
        <div
          className="flex items-center"
          style={{
            padding: GRID.spacing.md,
            paddingBottom: GRID.spacing.sm,
            gap: GRID.spacing.sm,
            borderBottom: `1px solid ${GLASS.border}`,
          }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 40,
              height: 40,
              borderRadius: RADIUS.button,
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            }}
          >
            <Bell
              className="text-amber-200 drop-shadow-sm"
              style={{ width: 20, height: 20 }}
              aria-hidden="true"
            />
          </div>
          <div style={{ flex: 1 }}>
            <p
              className="font-semibold text-gray-900"
              style={{ fontSize: TYPE.title }}
            >
              Alert Feed
            </p>
            <p
              className="text-gray-500"
              style={{ fontSize: TYPE.caption }}
            >
              {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} showing
            </p>
          </div>
          {/* Bulk actions */}
          <div className="flex items-center flex-shrink-0" style={{ gap: GRID.spacing.xs }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleMarkAllRead}
              className="flex items-center font-medium text-gray-500 hover:text-emerald-600"
              style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
            >
              <CheckCheck style={{ width: 14, height: 14 }} />
              Mark All Read
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleClearAll}
              className="flex items-center font-medium text-gray-400 hover:text-rose-500"
              style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
            >
              <Trash2 style={{ width: 13, height: 13 }} />
              Clear Read
            </motion.button>
          </div>
        </div>

        {/* Bulk selection bar */}
        <AnimatePresence>
          {selectedAlerts.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="flex items-center flex-wrap"
                style={{
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                  gap: GRID.spacing.xs,
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(4, 120, 87, 0.06) 100%)',
                  borderBottom: `1px solid ${GLASS.border}`,
                }}
              >
                <span className="font-semibold text-emerald-700" style={{ fontSize: TYPE.caption }}>{selectedAlerts.size} selected</span>
                <div className="flex-1" />
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleBulkMarkRead}
                  className="flex items-center font-medium text-gray-600 hover:text-emerald-600"
                  style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                >
                  <CheckCheck style={{ width: 13, height: 13 }} /> Mark Read
                </motion.button>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleBulkResolve}
                  className="flex items-center font-medium text-gray-600 hover:text-emerald-600"
                  style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                >
                  <CircleCheck style={{ width: 13, height: 13 }} /> Resolve
                </motion.button>
                {(['1 hour', '4 hours'] as const).map((dur) => (
                  <motion.button key={dur} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => handleBulkSnooze(dur)}
                    className="flex items-center font-medium text-gray-500 hover:text-amber-600"
                    style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                  >
                    <AlarmClock style={{ width: 12, height: 12 }} /> {dur}
                  </motion.button>
                ))}
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleBulkDismiss}
                  className="flex items-center font-medium text-gray-400 hover:text-rose-500"
                  style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                >
                  <Trash2 style={{ width: 13, height: 13 }} /> Dismiss
                </motion.button>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setSelectedAlerts(new Set())}
                  className="flex items-center font-medium text-gray-400 hover:text-gray-600"
                  style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                >
                  <X style={{ width: 13, height: 13 }} /> Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alert rows — grouped by time */}
        <div
          style={{
            padding: GRID.spacing.sm,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            maxHeight: 700,
            overflowY: 'auto',
          }}
        >
          <AnimatePresence mode="popLayout">
            {filteredAlerts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ManagerEmptyState
                  icon={Bell}
                  title={EMPTY_STATES[activeFilter].title}
                  description={EMPTY_STATES[activeFilter].description}
                />
              </motion.div>
            )}

            {groupedAlerts.map((group) => (
              <div key={group.label}>
                {/* Time group divider */}
                <div className="flex items-center" style={{ gap: GRID.spacing.sm, padding: `${GRID.spacing.sm}px ${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const ids = group.alerts.map((a) => a.id);
                      const allSelected = ids.every((id) => selectedAlerts.has(id));
                      setSelectedAlerts((prev) => {
                        const next = new Set(prev);
                        ids.forEach((id) => allSelected ? next.delete(id) : next.add(id));
                        return next;
                      });
                    }}
                    className="flex-shrink-0"
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                    title={`Select all ${group.label}`}
                  >
                    {group.alerts.every((a) => selectedAlerts.has(a.id))
                      ? <CheckSquare className="text-emerald-500" style={{ width: 14, height: 14 }} />
                      : <Square className="text-gray-300" style={{ width: 14, height: 14 }} />
                    }
                  </motion.button>
                  <span className="font-semibold text-gray-400" style={{ fontSize: TYPE.micro, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{group.label}</span>
                  <div className="flex-1" style={{ height: 1, backgroundColor: COLORS.gray[100] }} />
                </div>

                {group.alerts.map((alert) => {
                  const dotColor = PRIORITY_DOT_COLORS[alert.priority];
                  const badgeStyle = CATEGORY_BADGE_STYLES[alert.category];
                  const categoryLabel = CATEGORY_LABELS[alert.category];
                  const action = CATEGORY_ACTIONS[alert.category];
                  const ActionIcon = action.icon;
                  const isExpanded = expandedAlert === alert.id;
                  const detailKey = alert.id.replace(/-\d{13,}$/, '');
                  const details = ALERT_DETAILS[detailKey] || ALERT_DETAILS[alert.id];

                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -40, transition: { duration: MOTION.duration.fast } }}
                      transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
                      style={{
                        borderRadius: RADIUS.button,
                        backgroundColor: isExpanded ? COLORS.gray[50] : alert.read ? 'transparent' : 'rgba(16, 185, 129, 0.04)',
                        transition: `background-color ${MOTION.duration.hover}s`,
                        marginBottom: 2,
                      }}
                    >
                      {/* Main row — clickable to expand */}
                      <div
                        className="flex items-start cursor-pointer"
                        style={{ padding: GRID.spacing.sm, gap: GRID.spacing.sm, opacity: alert.resolved ? 0.55 : 1 }}
                        onClick={() => { setExpandedAlert(isExpanded ? null : alert.id); if (!alert.read) handleReview(alert.id); }}
                      >
                        {/* Checkbox */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); toggleSelect(alert.id); }}
                          className="flex-shrink-0"
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}
                        >
                          {selectedAlerts.has(alert.id)
                            ? <CheckSquare className="text-emerald-500" style={{ width: 15, height: 15 }} />
                            : <Square className="text-gray-300" style={{ width: 15, height: 15 }} />
                          }
                        </motion.button>

                        {/* Priority dot */}
                        <div style={{
                          width: 10, height: 10, borderRadius: RADIUS.pill,
                          backgroundColor: dotColor, flexShrink: 0, marginTop: 6,
                          boxShadow: alert.priority === 'urgent' ? `0 0 8px ${dotColor}80` : undefined,
                        }} />

                        {/* Agent avatar — clickable */}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          onClick={(e) => { e.stopPropagation(); setAgentPopup(agentPopup?.id === alert.id ? null : { id: alert.id, name: alert.agentName, avatar: alert.agentAvatar }); }}
                          className="flex items-center justify-center font-bold text-white flex-shrink-0 cursor-pointer relative"
                          style={{
                            width: GRID.spacing.xl, height: GRID.spacing.xl,
                            borderRadius: RADIUS.button,
                            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                            fontSize: TYPE.caption, boxShadow: SHADOW.level2,
                          }}
                        >
                          {alert.agentAvatar}
                        </motion.div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs, marginBottom: 2 }}>
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body, lineHeight: 1.3, opacity: alert.read ? 0.7 : 1 }}>
                              {alert.title}
                            </p>
                            <span className="font-medium" style={{ fontSize: TYPE.micro, padding: `2px ${GRID.spacing.xs}px`, borderRadius: RADIUS.pill, backgroundColor: badgeStyle.bg, color: badgeStyle.text, lineHeight: 1.5 }}>
                              {categoryLabel}
                            </span>
                            {alert.resolved && (
                              <span className="flex items-center font-medium" style={{ fontSize: TYPE.micro, gap: 2, padding: `2px ${GRID.spacing.xs}px`, borderRadius: RADIUS.pill, backgroundColor: 'rgba(16, 185, 129, 0.10)', color: '#059669', lineHeight: 1.5 }}>
                                <CircleCheck style={{ width: 10, height: 10 }} />
                                Resolved
                              </span>
                            )}
                            {!alert.read && !alert.resolved && (
                              <span style={{ width: 7, height: 7, borderRadius: RADIUS.pill, backgroundColor: '#10b981', display: 'inline-block', flexShrink: 0 }} />
                            )}
                          </div>
                          <p className="text-gray-500" style={{ fontSize: TYPE.meta, lineHeight: 1.5, opacity: alert.read ? 0.65 : 0.85 }}>
                            {alert.description}
                          </p>
                        </div>

                        {/* Pin + Timestamp */}
                        <div className="flex items-center flex-shrink-0" style={{ gap: 6, marginTop: 2 }}>
                          <motion.button
                            onClick={(e) => { e.stopPropagation(); handlePin(alert.id); }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center justify-center"
                            style={{
                              width: 24, height: 24, borderRadius: RADIUS.pill, border: 'none',
                              background: alert.pinned ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                              cursor: 'pointer', padding: 0,
                            }}
                            title={alert.pinned ? 'Unpin alert' : 'Pin alert'}
                          >
                            <Pin style={{ width: 13, height: 13, color: alert.pinned ? '#059669' : COLORS.gray[300], transform: alert.pinned ? 'rotate(0deg)' : 'rotate(45deg)', transition: 'all 0.2s' }} />
                          </motion.button>
                          <div className="hidden sm:flex items-center text-gray-400" style={{ gap: 4, fontSize: TYPE.caption, minWidth: 80, justifyContent: 'flex-end' }}>
                            <Clock style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                            <span>{alert.timestamp}</span>
                          </div>
                        </div>

                        {/* Expand indicator */}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-gray-300 flex-shrink-0"
                          style={{ marginTop: 4 }}
                        >
                          <ChevronDown style={{ width: 16, height: 16 }} />
                        </motion.div>
                      </div>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {isExpanded && details && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: MOTION.easing }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: `0 ${GRID.spacing.sm}px ${GRID.spacing.md}px`, paddingLeft: GRID.spacing.sm + 10 + GRID.spacing.sm + GRID.spacing.xl + GRID.spacing.sm }}>
                              {/* Context */}
                              <div style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: 'white', border: `1px solid ${COLORS.gray[200]}`, marginBottom: GRID.spacing.sm }}>
                                <p className="font-medium text-gray-700" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Context</p>
                                <p className="text-gray-600" style={{ fontSize: TYPE.meta, lineHeight: 1.6 }}>{details.context}</p>
                              </div>

                              {/* Suggested actions */}
                              <p className="font-medium text-gray-700" style={{ fontSize: TYPE.caption, marginBottom: GRID.spacing.xs }}>Suggested Actions</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: GRID.spacing.md }}>
                                {details.suggestedActions.map((sa, i) => (
                                  <div key={i} className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                    <div className="bg-emerald-500 flex-shrink-0" style={{ width: 5, height: 5, borderRadius: RADIUS.pill }} />
                                    <span className="text-gray-600" style={{ fontSize: TYPE.meta }}>{sa}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Manager Note */}
                              <div style={{ marginBottom: GRID.spacing.md }}>
                                {alert.note && (
                                  <div className="flex items-start" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, backgroundColor: 'rgba(16, 185, 129, 0.06)', border: `1px solid rgba(16, 185, 129, 0.15)` }}>
                                    <MessageSquare className="text-emerald-500 flex-shrink-0" style={{ width: 13, height: 13, marginTop: 2 }} />
                                    <div>
                                      <p className="font-medium text-emerald-700" style={{ fontSize: TYPE.micro, marginBottom: 2 }}>Your Note</p>
                                      <p className="text-gray-600" style={{ fontSize: TYPE.meta, lineHeight: 1.5 }}>{alert.note}</p>
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                  <input
                                    type="text"
                                    placeholder="Add a note..."
                                    value={noteInputs[alert.id] || ''}
                                    onChange={(e) => setNoteInputs((prev) => ({ ...prev, [alert.id]: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNote(alert.id); }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-gray-700 placeholder:text-gray-300"
                                    style={{
                                      flex: 1, fontSize: TYPE.meta, padding: '6px 10px',
                                      borderRadius: RADIUS.button, border: `1px solid ${COLORS.gray[200]}`,
                                      outline: 'none', background: 'white',
                                    }}
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.06 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={(e) => { e.stopPropagation(); handleSaveNote(alert.id); }}
                                    className="flex items-center font-medium text-emerald-600"
                                    style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                                  >
                                    <Send style={{ width: 12, height: 12 }} />
                                    Save
                                  </motion.button>
                                </div>
                              </div>

                              {/* Escalation Quick Reply */}
                              {alert.category === 'escalation' && (
                                <div style={{ marginBottom: GRID.spacing.md, padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: 'rgba(245, 158, 11, 0.06)', border: `1px solid rgba(245, 158, 11, 0.15)` }}>
                                  <p className="font-medium text-amber-700" style={{ fontSize: TYPE.caption, marginBottom: GRID.spacing.xs }}>Quick Reply to {alert.agentName}</p>
                                  <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                    <input
                                      type="text"
                                      placeholder="Type your response..."
                                      value={escalationReply[alert.id] || ''}
                                      onChange={(e) => setEscalationReply((prev) => ({ ...prev, [alert.id]: e.target.value }))}
                                      onKeyDown={(e) => { if (e.key === 'Enter') handleEscalationReply(alert.id, alert.agentName); }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-gray-700 placeholder:text-gray-400"
                                      style={{
                                        flex: 1, fontSize: TYPE.meta, padding: '6px 10px',
                                        borderRadius: RADIUS.button, border: `1px solid rgba(245, 158, 11, 0.25)`,
                                        outline: 'none', background: 'white',
                                      }}
                                    />
                                    <motion.button
                                      whileHover={{ scale: 1.06 }}
                                      whileTap={{ scale: 0.94 }}
                                      onClick={(e) => { e.stopPropagation(); handleEscalationReply(alert.id, alert.agentName); }}
                                      className="flex items-center font-semibold text-white border-0"
                                      style={{
                                        gap: 4, fontSize: TYPE.caption, padding: '6px 12px',
                                        borderRadius: RADIUS.pill, cursor: 'pointer',
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
                                      }}
                                    >
                                      <Send style={{ width: 12, height: 12 }} />
                                      Send
                                    </motion.button>
                                  </div>
                                </div>
                              )}

                              {/* Action row */}
                              <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs }}>
                                {/* Primary action — navigates to relevant page */}
                                <motion.button
                                  onClick={() => { handleReview(alert.id); navigate(action.route); }}
                                  className="flex items-center font-semibold text-white border-0"
                                  style={{ background: action.gradient, borderRadius: RADIUS.pill, padding: '6px 14px', fontSize: TYPE.caption, gap: 5, cursor: 'pointer', boxShadow: action.shadow }}
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                >
                                  <ActionIcon style={{ width: 13, height: 13 }} />
                                  {action.label}
                                </motion.button>

                                {/* Resolve */}
                                <motion.button
                                  onClick={() => handleResolve(alert.id)}
                                  className="flex items-center font-medium"
                                  style={{
                                    gap: 4, fontSize: TYPE.caption, borderRadius: RADIUS.pill, padding: '4px 10px', cursor: 'pointer',
                                    border: `1px solid ${alert.resolved ? '#10b981' : COLORS.gray[200]}`,
                                    background: alert.resolved ? 'rgba(16, 185, 129, 0.08)' : 'white',
                                    color: alert.resolved ? '#059669' : COLORS.gray[500],
                                  }}
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                >
                                  <CircleCheck style={{ width: 13, height: 13 }} />
                                  {alert.resolved ? 'Resolved' : 'Resolve'}
                                </motion.button>

                                {/* Escalate priority */}
                                {alert.priority !== 'urgent' && (
                                  <motion.button
                                    onClick={() => handleEscalate(alert.id)}
                                    className="flex items-center font-medium text-gray-500 hover:text-rose-600"
                                    style={{ gap: 4, fontSize: TYPE.caption, border: `1px solid ${COLORS.gray[200]}`, background: 'white', borderRadius: RADIUS.pill, padding: '4px 10px', cursor: 'pointer' }}
                                    whileHover={{ scale: 1.04, borderColor: '#f43f5e' }}
                                    whileTap={{ scale: 0.96 }}
                                  >
                                    <ArrowUp style={{ width: 12, height: 12 }} />
                                    Escalate
                                  </motion.button>
                                )}

                                {/* Snooze options */}
                                {(['1 hour', '4 hours', 'Tomorrow'] as const).map((dur) => (
                                  <motion.button
                                    key={dur}
                                    onClick={() => handleSnooze(alert.id, dur)}
                                    className="flex items-center font-medium text-gray-500 hover:text-amber-600"
                                    style={{ gap: 4, fontSize: TYPE.caption, border: `1px solid ${COLORS.gray[200]}`, background: 'white', borderRadius: RADIUS.pill, padding: '4px 10px', cursor: 'pointer' }}
                                    whileHover={{ scale: 1.04, borderColor: '#f59e0b' }}
                                    whileTap={{ scale: 0.96 }}
                                  >
                                    <AlarmClock style={{ width: 12, height: 12 }} />
                                    {dur}
                                  </motion.button>
                                ))}

                                {/* Dismiss */}
                                <motion.button
                                  onClick={() => handleDismiss(alert.id)}
                                  className="flex items-center font-medium text-gray-400 hover:text-rose-500"
                                  style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px', marginLeft: 'auto' }}
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                >
                                  <X style={{ width: 13, height: 13 }} />
                                  Dismiss
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Agent Quick Popup ──────────────────────────────────── */}
      <AnimatePresence>
        {agentPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setAgentPopup(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="fixed z-50 inset-0 m-auto"
              style={{
                width: 320,
                height: 'fit-content',
                maxHeight: 280,
                borderRadius: RADIUS.card,
                backgroundColor: '#ffffff',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.18)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)', padding: GRID.spacing.md }}>
                <div className="absolute bg-white/10 blur-sm" style={{ width: 80, height: 80, borderRadius: RADIUS.pill, top: -20, right: -10 }} />
                <motion.button
                  onClick={() => setAgentPopup(null)}
                  whileHover={{ scale: 1.1 }}
                  className="absolute flex items-center justify-center text-white/80 hover:text-white bg-white/15"
                  style={{ top: 8, right: 8, width: 24, height: 24, borderRadius: RADIUS.button, border: 'none', cursor: 'pointer' }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </motion.button>
                <div className="relative z-10 flex items-center" style={{ gap: GRID.spacing.sm }}>
                  <div className="flex items-center justify-center text-white font-bold bg-white/20 backdrop-blur" style={{ width: 48, height: 48, borderRadius: RADIUS.card, fontSize: TYPE.body, border: '1px solid rgba(255,255,255,0.25)' }}>
                    {agentPopup.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white" style={{ fontSize: TYPE.body }}>{agentPopup.name}</p>
                    <p className="text-white/70" style={{ fontSize: TYPE.caption }}>Team Member</p>
                  </div>
                </div>
              </div>
              {/* Quick actions */}
              <div style={{ padding: GRID.spacing.sm, display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setAgentPopup(null); toast.success(`Calling ${agentPopup.name}...`); }}
                  className="flex items-center font-medium text-gray-700 w-full hover:bg-gray-50"
                  style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, border: 'none', background: 'none', cursor: 'pointer', padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                >
                  <Phone className="text-emerald-500" style={{ width: 16, height: 16 }} />
                  Call Agent
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setAgentPopup(null); toast.success(`Message sent to ${agentPopup.name}`); }}
                  className="flex items-center font-medium text-gray-700 w-full hover:bg-gray-50"
                  style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, border: 'none', background: 'none', cursor: 'pointer', padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                >
                  <Mail className="text-blue-500" style={{ width: 16, height: 16 }} />
                  Send Message
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setAgentPopup(null); toast('Opening scorecard...'); }}
                  className="flex items-center font-medium text-gray-700 w-full hover:bg-gray-50"
                  style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, border: 'none', background: 'none', cursor: 'pointer', padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                >
                  <Eye className="text-violet-500" style={{ width: 16, height: 16 }} />
                  View Scorecard
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManagerAlerts;
