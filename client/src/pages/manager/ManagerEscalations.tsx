/**
 * Manager Escalations
 * Full escalation management — review, filter, assign, resolve, and track team escalations
 * Heritage Design System — Emerald theme
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid, ManagerEmptyState } from './primitives';
import { glassCard, DEMO_TEAM_MEMBERS } from './managerConstants';
import { AlertsTabContent } from './ManagerAlerts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  RADIUS,
  TYPE,
  GRID,
  LAYOUT,
  MOTION,
  COLORS,
  SHADOW,
  GLASS,
  fadeInUp,
  staggerContainer,
  staggerCards,
} from '@/lib/heritageDesignSystem';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ChevronDown,
  UserCheck,
  Search,
  X,
  ArrowUpDown,
  Pin,
  Phone,
  Mail,
  Eye,
  Send,
  MessageSquare,
  Square,
  CheckSquare,
  Trash2,
  AlarmClock,
  ArrowUp,
  Users,
  FileText,
  CircleCheck,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── TYPES ──────────────────────────────────────────────────
type EscalationPriority = 'high' | 'medium' | 'low';
type EscalationStatus = 'open' | 'in_progress' | 'resolved';
type EscalationType = 'compliance' | 'client_complaint' | 'discount' | 'policy_exception' | 'training' | 'commission';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved';
type SortKey = 'newest' | 'priority' | 'oldest' | 'type';

interface Escalation {
  id: string;
  type: EscalationType;
  typeLabel: string;
  agent: string;
  agentAvatar: string;
  lead: string;
  priority: EscalationPriority;
  status: EscalationStatus;
  date: string;
  hoursOpen: number;
  description: string;
  assignedTo?: string;
  resolved?: boolean;
  resolutionNote?: string;
  pinned?: boolean;
  note?: string;
}

// ─── TYPE BADGE STYLES ──────────────────────────────────────
const TYPE_STYLES: Record<EscalationType, { bg: string; text: string; label: string }> = {
  compliance: { bg: 'rgba(239, 68, 68, 0.10)', text: '#dc2626', label: 'Compliance' },
  client_complaint: { bg: 'rgba(245, 158, 11, 0.10)', text: '#d97706', label: 'Client Complaint' },
  discount: { bg: 'rgba(139, 92, 246, 0.10)', text: '#7c3aed', label: 'Discount' },
  policy_exception: { bg: 'rgba(59, 130, 246, 0.10)', text: '#2563eb', label: 'Policy Exception' },
  training: { bg: 'rgba(16, 185, 129, 0.10)', text: '#059669', label: 'Training' },
  commission: { bg: 'rgba(236, 72, 153, 0.10)', text: '#db2777', label: 'Commission' },
};

// ─── PRIORITY CONFIG ────────────────────────────────────────
const PRIORITY_DOT: Record<EscalationPriority, string> = { high: '#ef4444', medium: '#f59e0b', low: '#9ca3af' };
const PRIORITY_ORDER: Record<EscalationPriority, number> = { high: 0, medium: 1, low: 2 };
const PRIORITY_ESCALATE: Record<EscalationPriority, EscalationPriority> = { low: 'medium', medium: 'high', high: 'high' };

// ─── STATUS CONFIG ──────────────────────────────────────────
const STATUS_BADGE: Record<EscalationStatus, { bg: string; text: string; label: string }> = {
  open: { bg: 'rgba(239, 68, 68, 0.10)', text: '#dc2626', label: 'Open' },
  in_progress: { bg: 'rgba(245, 158, 11, 0.10)', text: '#d97706', label: 'In Progress' },
  resolved: { bg: 'rgba(16, 185, 129, 0.10)', text: '#059669', label: 'Resolved' },
};

// ─── SLA CONFIG ─────────────────────────────────────────────
function getSlaColor(hours: number): string {
  if (hours <= 4) return '#10b981';
  if (hours <= 12) return '#f59e0b';
  return '#ef4444';
}

function getSlaLabel(hours: number): string {
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h open`;
  const days = Math.floor(hours / 24);
  return `${days}d open`;
}

// ─── DEMO DATA ──────────────────────────────────────────────
const DEMO_ESCALATIONS: Escalation[] = [
  { id: '1', type: 'compliance', typeLabel: 'Compliance Review', agent: 'Mike Chen', agentAvatar: 'MC', lead: 'Robert Morrison', priority: 'high', status: 'open', date: 'Today 9:15 AM', hoursOpen: 6, description: 'Policy documentation incomplete for Morrison whole life application ($85K). Missing beneficiary designation form and medical questionnaire. Underwriting deadline is tomorrow — submission cannot proceed without manager sign-off on the waiver request.' },
  { id: '2', type: 'discount', typeLabel: 'Discount Approval', agent: 'Emily Davis', agentAvatar: 'ED', lead: 'Susan Kim', priority: 'medium', status: 'open', date: 'Today 10:30 AM', hoursOpen: 5, description: 'Client requesting 15% premium discount on $42K whole life policy. Emily has documented competitive quotes from two competing carriers. Standard threshold is 10% — this requires manager override. Client has existing term policy converting, which may justify retention pricing.' },
  { id: '3', type: 'policy_exception', typeLabel: 'Policy Exception', agent: 'James Wilson', agentAvatar: 'JW', lead: 'Thomas Lee', priority: 'medium', status: 'in_progress', date: 'Yesterday 2:00 PM', hoursOpen: 22, description: 'Non-standard underwriting request for pre-existing Type 2 diabetes. Client is well-controlled (A1C 6.2) with 10-year stable history. Standard table rating would price the client out. James is requesting preferred-plus consideration with medical records attached. Carrier underwriting team has been contacted for preliminary review.' },
  { id: '4', type: 'client_complaint', typeLabel: 'Client Complaint', agent: 'Carlos Martinez', agentAvatar: 'CM', lead: 'Jennifer Walsh', priority: 'high', status: 'open', date: 'Yesterday 11:00 AM', hoursOpen: 28, description: 'Mrs. Walsh called in upset about her claim processing timeline on policy #WL-2024-3392. Claim filed 3 weeks ago for husband\'s hospitalization ($12K). She was told 5-7 business days but it has been 15. Carlos escalated after his second call with the client today — she is threatening to cancel all policies ($180K portfolio).' },
  { id: '5', type: 'training', typeLabel: 'Training Gap', agent: 'Ryan Taylor', agentAvatar: 'RT', lead: 'N/A', priority: 'low', status: 'open', date: '2 days ago', hoursOpen: 52, description: 'Ryan failed the IUL product certification exam twice (scores: 62%, 58%). He has 3 client meetings scheduled next week that require IUL product knowledge. He needs to be reassigned from IUL-focused leads until certification is complete, or paired with a senior agent for those meetings.' },
  { id: '6', type: 'commission', typeLabel: 'Commission Dispute', agent: 'Lisa Park', agentAvatar: 'LP', lead: 'Mark Davidson', priority: 'medium', status: 'resolved', date: '3 days ago', hoursOpen: 0, description: 'Split commission calculation discrepancy on Davidson team sale. Lisa originated the lead but David Brown ran the close. System calculated 50/50 split but agreement was 60/40 originator-weighted. Finance confirmed the correction — Lisa\'s commission adjusted by +$480.', resolutionNote: 'Commission recalculated per originator-weighted agreement. Lisa received $480 adjustment. Updated split template for future team sales.' },
  { id: '7', type: 'client_complaint', typeLabel: 'Client Complaint', agent: 'Sarah Johnson', agentAvatar: 'SJ', lead: 'Dr. Harold Chen', priority: 'high', status: 'in_progress', date: 'Today 8:00 AM', hoursOpen: 7, description: 'Dr. Chen (8-year client, $420K total portfolio) received incorrect policy documents for his new estate planning trust. Documents listed wrong beneficiaries and incorrect coverage amounts. Sarah caught the error before client signature but Dr. Chen is concerned about data integrity across his other policies.' },
  { id: '8', type: 'compliance', typeLabel: 'Compliance Review', agent: 'David Brown', agentAvatar: 'DB', lead: 'Patricia Moore', priority: 'medium', status: 'open', date: 'Today 1:00 PM', hoursOpen: 2, description: 'Patricia Moore replacement application needs suitability review. She\'s replacing a 15-year-old term policy with a new IUL. State requires 1035 exchange comparison form and replacement notice. David has completed the forms but needs manager certification before filing with the state.' },
];

// ─── EXPANDED DETAILS ───────────────────────────────────────
const ESCALATION_DETAILS: Record<string, { context: string; timeline: { time: string; event: string }[]; suggestedActions: string[] }> = {
  '1': {
    context: 'Robert Morrison is a high-net-worth referral from Dr. Chen. The $85K whole life application has been in progress for 2 weeks. Mike has completed all sections except the beneficiary designation (client requested time to finalize trust details) and medical questionnaire (scheduled for tomorrow morning).',
    timeline: [
      { time: 'Today 9:15 AM', event: 'Mike escalated — underwriting deadline tomorrow' },
      { time: 'Yesterday', event: 'Client confirmed medical exam appointment' },
      { time: '5 days ago', event: 'Application started — initial documentation submitted' },
    ],
    suggestedActions: ['Call Mike to review missing documents', 'Contact Morrison about beneficiary form', 'Request 48-hour underwriting extension'],
  },
  '2': {
    context: 'Susan Kim is a new client referred by her employer (group plan participant). She has competitive quotes showing 12-14% lower premiums from two carriers. Emily believes matching at 15% discount secures a long-term relationship — Susan also has 3 adult children who may become clients.',
    timeline: [
      { time: 'Today 10:30 AM', event: 'Emily submitted discount request' },
      { time: 'Today 9:00 AM', event: 'Susan provided competitor quotes' },
      { time: '3 days ago', event: 'Initial policy presentation completed' },
    ],
    suggestedActions: ['Review competitor quotes', 'Consider 12% counter-offer with loyalty benefits', 'Approve if retention value justifies'],
  },
  '3': {
    context: 'Thomas Lee is a 52-year-old business owner applying for $500K coverage. His Type 2 diabetes has been well-managed for 10 years with metformin only. A1C consistently under 6.5. Standard table rating would add 75% to premium, making coverage unaffordable. James has gathered 10 years of medical records.',
    timeline: [
      { time: 'Yesterday 2:00 PM', event: 'James escalated for exception review' },
      { time: 'Yesterday 10:00 AM', event: 'Carrier underwriting contacted' },
      { time: '1 week ago', event: 'Application submitted with medical records' },
    ],
    suggestedActions: ['Review medical records summary', 'Support preferred-plus request to carrier', 'Prepare fallback pricing at Table B'],
  },
  '4': {
    context: 'Jennifer Walsh has been a client for 6 years with $180K in policies (2 whole life, 1 term). Her husband was hospitalized in February and the claim was filed Feb 10. Standard SLA is 5-7 days. It\'s now been 15 business days with no resolution. The claims department cited "additional documentation needed" but never notified the client.',
    timeline: [
      { time: 'Yesterday 11:00 AM', event: 'Carlos escalated after 2nd client call' },
      { time: 'Yesterday 9:30 AM', event: 'Mrs. Walsh called — threatened cancellation' },
      { time: '5 days ago', event: 'Carlos first contacted claims dept' },
      { time: '15 days ago', event: 'Claim filed — #CLM-2025-0891' },
    ],
    suggestedActions: ['Call Mrs. Walsh directly — acknowledge delay', 'Escalate to claims supervisor immediately', 'Offer expedited processing + goodwill gesture'],
  },
  '5': {
    context: 'Ryan joined the team 6 weeks ago. He has strong sales instincts but lacks product knowledge depth. His IUL exam scores (62%, 58%) show he doesn\'t understand the indexing mechanics or cap rate structures. He has 3 IUL-focused client meetings next week.',
    timeline: [
      { time: '2 days ago', event: 'Ryan failed IUL exam — 2nd attempt (58%)' },
      { time: '1 week ago', event: 'Ryan failed IUL exam — 1st attempt (62%)' },
      { time: '2 weeks ago', event: 'Ryan assigned to IUL lead pool' },
    ],
    suggestedActions: ['Pair Ryan with Sarah Johnson for next week\'s meetings', 'Schedule focused IUL training sessions', 'Reassign IUL leads temporarily'],
  },
  '6': {
    context: 'The Davidson sale was a $34K annual premium whole life policy. Lisa sourced the lead at a networking event and did discovery. David ran the presentation and close because Lisa was on PTO. The standard 50/50 system default was applied instead of the agreed originator-weighted split.',
    timeline: [
      { time: 'Resolved', event: 'Finance applied $480 correction to Lisa\'s commission' },
      { time: '3 days ago', event: 'Lisa escalated commission discrepancy' },
      { time: '1 week ago', event: 'Davidson policy issued' },
    ],
    suggestedActions: ['Verify correction applied', 'Update team split template', 'Communicate resolution to both agents'],
  },
  '7': {
    context: 'Dr. Chen is one of the agency\'s top 5 clients by portfolio value ($420K). The estate planning trust documents were generated with the previous version of his beneficiary list (before his daughter\'s marriage and name change). Sarah caught this before signature but Dr. Chen is now requesting a full audit of all his policies.',
    timeline: [
      { time: 'Today 8:00 AM', event: 'Sarah escalated — client requesting full audit' },
      { time: 'Yesterday 4:00 PM', event: 'Sarah identified document errors' },
      { time: '3 days ago', event: 'Estate planning documents generated' },
    ],
    suggestedActions: ['Call Dr. Chen — reassure about data integrity', 'Run full portfolio audit immediately', 'Offer complimentary annual review going forward'],
  },
  '8': {
    context: 'Patricia Moore\'s 1035 exchange from term to IUL requires state replacement disclosure. David has completed the comparison forms showing the new IUL provides better long-term value despite higher initial premium. The state filing deadline is Friday.',
    timeline: [
      { time: 'Today 1:00 PM', event: 'David submitted for manager certification' },
      { time: 'Today 10:00 AM', event: 'Comparison forms completed' },
      { time: '1 week ago', event: 'Patricia requested policy replacement' },
    ],
    suggestedActions: ['Review 1035 exchange comparison', 'Certify and sign replacement notice', 'File with state before Friday deadline'],
  },
};

// ─── INCOMING ESCALATION POOL ───────────────────────────────
const INCOMING_ESCALATIONS: Escalation[] = [
  { id: 'new-1', type: 'client_complaint', typeLabel: 'Client Complaint', agent: 'Anna Kim', agentAvatar: 'AK', lead: 'Margaret Foster', priority: 'high', status: 'open', date: 'Just now', hoursOpen: 0, description: 'Margaret Foster called regarding unauthorized policy loan of $15K on her whole life policy #WL-2023-5567. She did not request this loan and suspects her ex-husband may have accessed her account. Anna verified the loan was processed last week via phone authorization.' },
  { id: 'new-2', type: 'compliance', typeLabel: 'Compliance Review', agent: 'Tom Rodriguez', agentAvatar: 'TR', lead: 'Kevin Park', priority: 'medium', status: 'open', date: 'Just now', hoursOpen: 0, description: 'Kevin Park\'s application flagged by compliance AI for potential churning. He\'s replacing a 3-year-old whole life policy with a new one at the same carrier. Tom says the client wants to restructure for estate planning purposes but the pattern matches churning indicators.' },
  { id: 'new-3', type: 'policy_exception', typeLabel: 'Policy Exception', agent: 'Jessica Lee', agentAvatar: 'JL', lead: 'William Torres', priority: 'low', status: 'open', date: 'Just now', hoursOpen: 0, description: 'William Torres requesting backdated policy effective date by 2 weeks to align with his company\'s fiscal year for group benefit coordination. Standard policy prohibits backdating beyond 30 days. Jessica needs approval for the 14-day backdate.' },
];

const INCOMING_DETAILS: Record<string, { context: string; timeline: { time: string; event: string }[]; suggestedActions: string[] }> = {
  'new-1': {
    context: 'Margaret Foster (12-year client, $280K portfolio) discovered a $15K policy loan on her whole life statement. The loan was processed via phone last Tuesday with voice authorization. Margaret was out of the country at the time. Her ex-husband is listed as a secondary contact but not an authorized signer.',
    timeline: [
      { time: 'Just now', event: 'Anna escalated — potential unauthorized access' },
      { time: 'Today', event: 'Margaret called after reviewing monthly statement' },
      { time: 'Last Tuesday', event: 'Policy loan processed via phone authorization' },
    ],
    suggestedActions: ['Freeze account immediately', 'File fraud investigation report', 'Call Margaret — reassure and document', 'Review call recording from last Tuesday'],
  },
  'new-2': {
    context: 'Kevin Park is replacing a 3-year-old $50K whole life policy with a new $75K policy at the same carrier. AI flagged because surrender charges apply ($3,200) and new commission is generated. Tom says Kevin\'s estate attorney recommended restructuring. Compliance requires manager sign-off on churning waiver.',
    timeline: [
      { time: 'Just now', event: 'Tom escalated for churning review' },
      { time: 'Yesterday', event: 'Compliance AI flagged application' },
      { time: '1 week ago', event: 'Kevin met with estate attorney' },
    ],
    suggestedActions: ['Request estate attorney letter', 'Review surrender charge impact with client', 'Sign churning waiver if justified'],
  },
  'new-3': {
    context: 'William Torres is CFO of a mid-size company. He wants his personal IUL effective date aligned with the company\'s benefit enrollment period (2 weeks ago) for tax and HR coordination. The backdate is within the 30-day carrier limit and all premiums would be paid from the original date.',
    timeline: [
      { time: 'Just now', event: 'Jessica submitted backdate request' },
      { time: 'Yesterday', event: 'William confirmed alignment need with HR' },
    ],
    suggestedActions: ['Approve — within 30-day carrier limit', 'Verify premium payment from effective date', 'Document business justification'],
  },
};

// ─── FILTER OPTIONS ─────────────────────────────────────────
const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'priority', label: 'Priority' },
  { value: 'type', label: 'Type' },
];

// ─── TEAM AGENTS for assignment picker ──────────────────────
const ASSIGNABLE_AGENTS = DEMO_TEAM_MEMBERS.filter((m) => m.status === 'active').map((m) => ({
  id: m.id,
  name: m.name,
  avatar: m.avatar,
  role: m.role,
}));

// ─── COMPONENT ──────────────────────────────────────────────
export function ManagerEscalations() {
  const [, navigate] = useLocation();
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [escalations, setEscalations] = useState<Escalation[]>(DEMO_ESCALATIONS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [assignPickerFor, setAssignPickerFor] = useState<string | null>(null);
  const [agentPopup, setAgentPopup] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [resolveInputs, setResolveInputs] = useState<Record<string, string>>({});
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const incomingIdx = useRef(0);

  // Simulated incoming escalation every ~45s
  useEffect(() => {
    const interval = setInterval(() => {
      if (incomingIdx.current >= INCOMING_ESCALATIONS.length) return;
      const src = INCOMING_ESCALATIONS[incomingIdx.current];
      const newEsc = { ...src, id: `${src.id}-${Date.now()}` };
      incomingIdx.current += 1;
      setEscalations((prev) => [newEsc, ...prev]);
      toast('New escalation received', { description: newEsc.typeLabel + ' — ' + newEsc.agent, icon: '🚨' });
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // ─── Computed stats ─────────────────────────────────────
  const openCount = escalations.filter((e) => e.status === 'open').length;
  const highCount = escalations.filter((e) => e.priority === 'high' && e.status !== 'resolved').length;
  const resolvedCount = escalations.filter((e) => e.status === 'resolved').length;
  const inProgressCount = escalations.filter((e) => e.status === 'in_progress').length;

  // ─── Filtered + sorted ─────────────────────────────────
  const filtered = useMemo(() => {
    let result = escalations.filter((e) => {
      if (priorityFilter !== 'all' && e.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      return true;
    });
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) =>
        e.agent.toLowerCase().includes(q) ||
        e.lead.toLowerCase().includes(q) ||
        e.typeLabel.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q),
      );
    }
    // Sort
    result = [...result];
    const pinSort = (a: Escalation, b: Escalation) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    switch (sortBy) {
      case 'priority':
        result.sort((a, b) => pinSort(a, b) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
        break;
      case 'oldest':
        result.sort((a, b) => pinSort(a, b) || b.hoursOpen - a.hoursOpen);
        break;
      case 'type':
        result.sort((a, b) => pinSort(a, b) || a.type.localeCompare(b.type));
        break;
      default:
        result.sort((a, b) => pinSort(a, b) || a.hoursOpen - b.hoursOpen);
    }
    return result;
  }, [escalations, priorityFilter, statusFilter, searchQuery, sortBy]);

  // ─── Filter badge counts ────────────────────────────────
  const priorityCounts = useMemo(() => {
    const c: Record<PriorityFilter, number> = { all: escalations.length, high: 0, medium: 0, low: 0 };
    escalations.forEach((e) => c[e.priority]++);
    return c;
  }, [escalations]);

  const statusCounts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: escalations.length, open: 0, in_progress: 0, resolved: 0 };
    escalations.forEach((e) => c[e.status]++);
    return c;
  }, [escalations]);

  // ─── Handlers ───────────────────────────────────────────
  const handleResolve = (id: string) => {
    const note = resolveInputs[id]?.trim();
    setEscalations((prev) => prev.map((e) => e.id === id ? { ...e, status: 'resolved' as const, resolved: true, resolutionNote: note || 'Resolved by manager', hoursOpen: 0 } : e));
    setResolveInputs((prev) => ({ ...prev, [id]: '' }));
    setResolvingId(null);
    toast.success('Escalation resolved');
  };

  const handleAssign = (escId: string, agent: { name: string; avatar: string }) => {
    setEscalations((prev) => prev.map((e) => e.id === escId ? { ...e, assignedTo: agent.name, status: 'in_progress' as const } : e));
    setAssignPickerFor(null);
    toast.success(`Assigned to ${agent.name}`);
  };

  const handleDismiss = (id: string) => {
    setEscalations((prev) => prev.filter((e) => e.id !== id));
    if (expandedId === id) setExpandedId(null);
    toast.success('Escalation dismissed');
  };

  const handlePin = (id: string) => {
    setEscalations((prev) => prev.map((e) => e.id === id ? { ...e, pinned: !e.pinned } : e));
  };

  const handleEscalate = (id: string) => {
    const esc = escalations.find((e) => e.id === id);
    if (!esc || esc.priority === 'high') { toast('Already at highest priority'); return; }
    setEscalations((prev) => prev.map((e) => e.id === id ? { ...e, priority: PRIORITY_ESCALATE[e.priority] } : e));
    toast.success(`Escalated to ${PRIORITY_ESCALATE[esc.priority]}`);
  };

  const handleSaveNote = (id: string) => {
    const note = noteInputs[id]?.trim();
    if (!note) return;
    setEscalations((prev) => prev.map((e) => e.id === id ? { ...e, note } : e));
    setNoteInputs((prev) => ({ ...prev, [id]: '' }));
    toast.success('Note saved');
  };

  // Bulk
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkResolve = () => {
    setEscalations((prev) => prev.map((e) => selectedIds.has(e.id) ? { ...e, status: 'resolved' as const, resolved: true, resolutionNote: 'Bulk resolved by manager', hoursOpen: 0 } : e));
    toast.success(`${selectedIds.size} escalations resolved`);
    setSelectedIds(new Set());
  };

  const handleBulkDismiss = () => {
    setEscalations((prev) => prev.filter((e) => !selectedIds.has(e.id)));
    toast.success(`${selectedIds.size} escalations dismissed`);
    setSelectedIds(new Set());
    setExpandedId(null);
  };

  // Detail lookup
  const getDetails = (id: string) => {
    const key = id.replace(/-\d{13,}$/, '');
    return ESCALATION_DETAILS[key] || INCOMING_DETAILS[key] || ESCALATION_DETAILS[id];
  };

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
      >
        {/* ── Hero ─────────────────────────────────────────── */}
        <ManagerPageHero
          icon={AlertTriangle}
          title="Escalations"
          subtitle="Review, assign, and resolve team escalations"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard icon={AlertTriangle} value={openCount} label="Open" delta={-1} periodLabel="vs yesterday" />
            <ManagerStatCard icon={ShieldAlert} value={highCount} label="High Priority" delta={0} periodLabel="This week" />
            <ManagerStatCard icon={Clock} value={inProgressCount} label="In Progress" delta={2} periodLabel="vs yesterday" />
            <ManagerStatCard icon={CheckCircle2} value={resolvedCount} label="Resolved" delta={4} periodLabel="This week" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Tabs ────────────────────────────────────────── */}
        <Tabs defaultValue="escalations" className="w-full">
          <TabsList className="w-fit border-0 p-1 gap-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
            <TabsTrigger
              value="escalations"
              className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
              style={{ borderRadius: RADIUS.button }}
            >
              <AlertTriangle style={{ width: 14, height: 14 }} />
              Escalations
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
              style={{ borderRadius: RADIUS.button }}
            >
              <Bell style={{ width: 14, height: 14 }} />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="escalations" style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md, marginTop: GRID.spacing.md }}>

        {/* ── Search Bar ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div className="relative">
            <Search className="absolute text-gray-400" style={{ width: 16, height: 16, left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by agent, lead, type, or keyword..."
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

        {/* ── Filters: Priority + Status ────────────────────── */}
        <motion.div variants={fadeInUp} className="flex flex-wrap items-center" style={{ gap: GRID.spacing.md }}>
          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
            <span className="text-gray-400 font-medium" style={{ fontSize: TYPE.caption }}>Priority</span>
            <div className="flex items-center p-1 gap-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
              {PRIORITY_OPTIONS.map((opt) => {
                const isActive = priorityFilter === opt.value;
                const count = priorityCounts[opt.value];
                return (
                  <button
                    key={opt.value}
                    onClick={() => setPriorityFilter(opt.value)}
                    className={`flex items-center gap-1.5 font-medium border-0 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                    style={{ borderRadius: RADIUS.button, padding: '6px 14px', fontSize: TYPE.meta, cursor: 'pointer', fontWeight: isActive ? 600 : 500 }}
                  >
                    {opt.label}
                    {count > 0 && (
                      <span className={`h-5 px-1.5 text-[10px] inline-flex items-center justify-center ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-black/5 text-gray-500'}`} style={{ borderRadius: RADIUS.pill, fontWeight: 700, minWidth: 16 }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
            <span className="text-gray-400 font-medium" style={{ fontSize: TYPE.caption }}>Status</span>
            <div className="flex items-center p-1 gap-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
              {STATUS_OPTIONS.map((opt) => {
                const isActive = statusFilter === opt.value;
                const count = statusCounts[opt.value];
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`flex items-center gap-1.5 font-medium border-0 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                    style={{ borderRadius: RADIUS.button, padding: '6px 14px', fontSize: TYPE.meta, cursor: 'pointer', fontWeight: isActive ? 600 : 500 }}
                  >
                    {opt.label}
                    {count > 0 && (
                      <span className={`h-5 px-1.5 text-[10px] inline-flex items-center justify-center ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-black/5 text-gray-500'}`} style={{ borderRadius: RADIUS.pill, fontWeight: 700, minWidth: 16 }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Sort ─────────────────────────────────────────── */}
        <motion.div variants={fadeInUp} className="flex items-center" style={{ gap: GRID.spacing.xs }}>
          <ArrowUpDown className="text-gray-400" style={{ width: 14, height: 14 }} />
          <div className="flex items-center p-1 gap-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
            {SORT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSortBy(value)}
                className={`font-medium border-0 transition-all ${sortBy === value ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                style={{ fontSize: TYPE.meta, padding: '6px 14px', borderRadius: RADIUS.button, cursor: 'pointer', fontWeight: sortBy === value ? 600 : 500 }}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Escalation Queue Card ────────────────────────── */}
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
                width: 40, height: 40, borderRadius: RADIUS.button,
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
              }}
            >
              <AlertTriangle className="text-amber-200 drop-shadow-sm" style={{ width: 20, height: 20 }} />
            </div>
            <div style={{ flex: 1 }}>
              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>Escalation Queue</p>
              <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                {filtered.length} escalation{filtered.length !== 1 ? 's' : ''} showing
              </p>
            </div>
          </div>

          {/* Bulk selection bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
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
                  <span className="font-semibold text-emerald-700" style={{ fontSize: TYPE.caption }}>{selectedIds.size} selected</span>
                  <div className="flex-1" />
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleBulkResolve}
                    className="flex items-center font-medium text-gray-600 hover:text-emerald-600"
                    style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                  >
                    <CircleCheck style={{ width: 13, height: 13 }} /> Resolve All
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleBulkDismiss}
                    className="flex items-center font-medium text-gray-400 hover:text-rose-500"
                    style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                  >
                    <Trash2 style={{ width: 13, height: 13 }} /> Dismiss
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setSelectedIds(new Set())}
                    className="flex items-center font-medium text-gray-400 hover:text-gray-600"
                    style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                  >
                    <X style={{ width: 13, height: 13 }} /> Cancel
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Escalation rows */}
          <div style={{ padding: GRID.spacing.sm, display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 700, overflowY: 'auto' }}>
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ManagerEmptyState
                    icon={AlertTriangle}
                    title="No escalations found"
                    description="Great work! No escalations match this filter."
                  />
                </motion.div>
              )}

              {filtered.map((esc) => {
                const dotColor = PRIORITY_DOT[esc.priority];
                const typeStyle = TYPE_STYLES[esc.type];
                const statusStyle = STATUS_BADGE[esc.status];
                const slaColor = getSlaColor(esc.hoursOpen);
                const slaLabel = esc.status === 'resolved' ? 'Resolved' : getSlaLabel(esc.hoursOpen);
                const isExpanded = expandedId === esc.id;
                const details = getDetails(esc.id);

                return (
                  <motion.div
                    key={esc.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, transition: { duration: MOTION.duration.fast } }}
                    transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
                    style={{
                      borderRadius: RADIUS.button,
                      backgroundColor: isExpanded ? COLORS.gray[50] : 'transparent',
                      transition: `background-color ${MOTION.duration.hover}s`,
                      marginBottom: 2,
                    }}
                  >
                    {/* Main row */}
                    <div
                      className="flex items-center cursor-pointer"
                      style={{ padding: GRID.spacing.sm, gap: GRID.spacing.sm, opacity: esc.status === 'resolved' ? 0.55 : 1 }}
                      onClick={() => { setExpandedId(isExpanded ? null : esc.id); }}
                    >
                      {/* Checkbox */}
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); toggleSelect(esc.id); }}
                        className="flex-shrink-0"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        {selectedIds.has(esc.id)
                          ? <CheckSquare className="text-emerald-500" style={{ width: 15, height: 15 }} />
                          : <Square className="text-gray-300" style={{ width: 15, height: 15 }} />
                        }
                      </motion.button>

                      {/* Priority dot */}
                      <div style={{
                        width: 10, height: 10, borderRadius: RADIUS.pill,
                        backgroundColor: dotColor, flexShrink: 0,
                        boxShadow: esc.priority === 'high' ? `0 0 8px ${dotColor}80` : undefined,
                      }} />

                      {/* Agent avatar — clickable */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        onClick={(e) => { e.stopPropagation(); setAgentPopup(agentPopup?.id === esc.id ? null : { id: esc.id, name: esc.agent, avatar: esc.agentAvatar }); }}
                        className="flex items-center justify-center font-bold text-white flex-shrink-0 cursor-pointer"
                        style={{
                          width: GRID.spacing.xl, height: GRID.spacing.xl,
                          borderRadius: RADIUS.button,
                          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                          fontSize: TYPE.caption, boxShadow: SHADOW.level2,
                        }}
                      >
                        {esc.agentAvatar}
                      </motion.div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs, marginBottom: 2 }}>
                          <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body, lineHeight: 1.3 }}>
                            {esc.typeLabel}
                          </p>
                          <span className="font-medium" style={{ fontSize: TYPE.micro, padding: `2px ${GRID.spacing.xs}px`, borderRadius: RADIUS.pill, backgroundColor: typeStyle.bg, color: typeStyle.text, lineHeight: 1.5 }}>
                            {typeStyle.label}
                          </span>
                          <span className="font-medium" style={{ fontSize: TYPE.micro, padding: `2px ${GRID.spacing.xs}px`, borderRadius: RADIUS.pill, backgroundColor: statusStyle.bg, color: statusStyle.text, lineHeight: 1.5 }}>
                            {statusStyle.label}
                          </span>
                          {esc.pinned && (
                            <Pin className="text-emerald-500" style={{ width: 12, height: 12 }} />
                          )}
                        </div>
                        <p className="text-gray-500" style={{ fontSize: TYPE.meta, lineHeight: 1.4 }}>
                          {esc.agent} &middot; Lead: {esc.lead}
                          {esc.assignedTo && <span className="text-emerald-600 font-medium"> &middot; Assigned: {esc.assignedTo}</span>}
                        </p>
                      </div>

                      {/* SLA indicator */}
                      <div className="hidden sm:flex items-center flex-shrink-0" style={{ gap: 4 }}>
                        <div style={{ width: 7, height: 7, borderRadius: RADIUS.pill, backgroundColor: esc.status === 'resolved' ? '#10b981' : slaColor }} />
                        <span className="font-medium" style={{ fontSize: TYPE.caption, color: esc.status === 'resolved' ? '#10b981' : slaColor }}>
                          {slaLabel}
                        </span>
                      </div>

                      {/* Pin */}
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); handlePin(esc.id); }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex-shrink-0"
                        style={{ width: 24, height: 24, borderRadius: RADIUS.pill, border: 'none', background: esc.pinned ? 'rgba(16, 185, 129, 0.12)' : 'transparent', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title={esc.pinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin style={{ width: 13, height: 13, color: esc.pinned ? '#059669' : COLORS.gray[300], transform: esc.pinned ? 'rotate(0deg)' : 'rotate(45deg)', transition: 'all 0.2s' }} />
                      </motion.button>

                      {/* Expand indicator */}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-300 flex-shrink-0"
                      >
                        <ChevronDown style={{ width: 16, height: 16 }} />
                      </motion.div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: MOTION.easing }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: `0 ${GRID.spacing.sm}px ${GRID.spacing.md}px`, paddingLeft: GRID.spacing.sm + 15 + GRID.spacing.sm + 10 + GRID.spacing.sm + GRID.spacing.xl + GRID.spacing.sm }}>
                            {/* Description */}
                            <div style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: 'white', border: `1px solid ${COLORS.gray[200]}`, marginBottom: GRID.spacing.sm }}>
                              <p className="font-medium text-gray-700" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Description</p>
                              <p className="text-gray-600" style={{ fontSize: TYPE.meta, lineHeight: 1.6 }}>{esc.description}</p>
                            </div>

                            {/* Context (from details) */}
                            {details && (
                              <>
                                <div style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: 'white', border: `1px solid ${COLORS.gray[200]}`, marginBottom: GRID.spacing.sm }}>
                                  <p className="font-medium text-gray-700" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Context</p>
                                  <p className="text-gray-600" style={{ fontSize: TYPE.meta, lineHeight: 1.6 }}>{details.context}</p>
                                </div>

                                {/* Timeline */}
                                <div style={{ marginBottom: GRID.spacing.sm }}>
                                  <p className="font-medium text-gray-700" style={{ fontSize: TYPE.caption, marginBottom: GRID.spacing.xs }}>Timeline</p>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 8, borderLeft: `2px solid ${COLORS.gray[200]}` }}>
                                    {details.timeline.map((t, i) => (
                                      <div key={i} className="flex items-start" style={{ gap: GRID.spacing.xs }}>
                                        <div style={{ width: 8, height: 8, borderRadius: RADIUS.pill, backgroundColor: i === 0 ? '#10b981' : COLORS.gray[300], flexShrink: 0, marginTop: 4, marginLeft: -5 }} />
                                        <div>
                                          <span className="font-medium text-gray-500" style={{ fontSize: TYPE.micro }}>{t.time}</span>
                                          <p className="text-gray-600" style={{ fontSize: TYPE.meta }}>{t.event}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
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
                              </>
                            )}

                            {/* Resolution note (if resolved) */}
                            {esc.resolutionNote && (
                              <div className="flex items-start" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, backgroundColor: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                                <CircleCheck className="text-emerald-500 flex-shrink-0" style={{ width: 14, height: 14, marginTop: 2 }} />
                                <div>
                                  <p className="font-medium text-emerald-700" style={{ fontSize: TYPE.micro, marginBottom: 2 }}>Resolution</p>
                                  <p className="text-gray-600" style={{ fontSize: TYPE.meta, lineHeight: 1.5 }}>{esc.resolutionNote}</p>
                                </div>
                              </div>
                            )}

                            {/* Manager Note */}
                            <div style={{ marginBottom: GRID.spacing.md }}>
                              {esc.note && (
                                <div className="flex items-start" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, backgroundColor: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                                  <MessageSquare className="text-emerald-500 flex-shrink-0" style={{ width: 13, height: 13, marginTop: 2 }} />
                                  <div>
                                    <p className="font-medium text-emerald-700" style={{ fontSize: TYPE.micro, marginBottom: 2 }}>Your Note</p>
                                    <p className="text-gray-600" style={{ fontSize: TYPE.meta, lineHeight: 1.5 }}>{esc.note}</p>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                <input
                                  type="text"
                                  placeholder="Add a note..."
                                  value={noteInputs[esc.id] || ''}
                                  onChange={(e) => setNoteInputs((prev) => ({ ...prev, [esc.id]: e.target.value }))}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNote(esc.id); }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-gray-700 placeholder:text-gray-300"
                                  style={{ flex: 1, fontSize: TYPE.meta, padding: '6px 10px', borderRadius: RADIUS.button, border: `1px solid ${COLORS.gray[200]}`, outline: 'none', background: 'white' }}
                                />
                                <motion.button
                                  whileHover={{ scale: 1.06 }}
                                  whileTap={{ scale: 0.94 }}
                                  onClick={(e) => { e.stopPropagation(); handleSaveNote(esc.id); }}
                                  className="flex items-center font-medium text-emerald-600"
                                  style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                                >
                                  <Send style={{ width: 12, height: 12 }} />
                                  Save
                                </motion.button>
                              </div>
                            </div>

                            {/* Resolve with note (inline form) */}
                            {esc.status !== 'resolved' && resolvingId === esc.id && (
                              <div style={{ marginBottom: GRID.spacing.md, padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                                <p className="font-medium text-emerald-700" style={{ fontSize: TYPE.caption, marginBottom: GRID.spacing.xs }}>Resolution Note</p>
                                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                  <input
                                    type="text"
                                    placeholder="How was this resolved?"
                                    value={resolveInputs[esc.id] || ''}
                                    onChange={(e) => setResolveInputs((prev) => ({ ...prev, [esc.id]: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleResolve(esc.id); }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-gray-700 placeholder:text-gray-400"
                                    style={{ flex: 1, fontSize: TYPE.meta, padding: '6px 10px', borderRadius: RADIUS.button, border: `1px solid rgba(16, 185, 129, 0.25)`, outline: 'none', background: 'white' }}
                                    autoFocus
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.06 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={(e) => { e.stopPropagation(); handleResolve(esc.id); }}
                                    className="flex items-center font-semibold text-white border-0"
                                    style={{ gap: 4, fontSize: TYPE.caption, padding: '6px 12px', borderRadius: RADIUS.pill, cursor: 'pointer', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)' }}
                                  >
                                    <CircleCheck style={{ width: 12, height: 12 }} />
                                    Resolve
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={(e) => { e.stopPropagation(); setResolvingId(null); }}
                                    className="text-gray-400 hover:text-gray-600"
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                                  >
                                    <X style={{ width: 14, height: 14 }} />
                                  </motion.button>
                                </div>
                              </div>
                            )}

                            {/* Action row */}
                            <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs }}>
                              {/* Assign */}
                              {esc.status !== 'resolved' && (
                                <div className="relative">
                                  <motion.button
                                    onClick={(e) => { e.stopPropagation(); setAssignPickerFor(assignPickerFor === esc.id ? null : esc.id); }}
                                    className="flex items-center font-medium text-gray-600"
                                    style={{ gap: 4, fontSize: TYPE.caption, border: `1px solid ${COLORS.gray[200]}`, background: 'white', borderRadius: RADIUS.pill, padding: '5px 12px', cursor: 'pointer' }}
                                    whileHover={{ scale: 1.04, borderColor: '#10b981' }}
                                    whileTap={{ scale: 0.96 }}
                                  >
                                    <UserCheck style={{ width: 13, height: 13 }} />
                                    {esc.assignedTo ? 'Reassign' : 'Assign'}
                                  </motion.button>

                                  {/* Assignment picker dropdown */}
                                  <AnimatePresence>
                                    {assignPickerFor === esc.id && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute z-50"
                                        style={{
                                          top: '100%', left: 0, marginTop: 4,
                                          width: 240, maxHeight: 220, overflowY: 'auto',
                                          backgroundColor: 'white', borderRadius: RADIUS.card,
                                          boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
                                          border: `1px solid ${COLORS.gray[200]}`,
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderBottom: `1px solid ${COLORS.gray[100]}` }}>
                                          <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.caption }}>Assign to agent</p>
                                        </div>
                                        {ASSIGNABLE_AGENTS.map((a) => (
                                          <motion.button
                                            key={a.id}
                                            whileHover={{ backgroundColor: COLORS.gray[50] }}
                                            onClick={() => handleAssign(esc.id, a)}
                                            className="flex items-center w-full text-left"
                                            style={{ gap: GRID.spacing.xs, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, border: 'none', background: 'none', cursor: 'pointer', fontSize: TYPE.meta }}
                                          >
                                            <div className="flex items-center justify-center font-bold text-white flex-shrink-0" style={{ width: 28, height: 28, borderRadius: RADIUS.button, background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', fontSize: 10 }}>
                                              {a.avatar}
                                            </div>
                                            <div>
                                              <p className="font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>{a.name}</p>
                                              <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>{a.role}</p>
                                            </div>
                                          </motion.button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}

                              {/* Resolve */}
                              {esc.status !== 'resolved' && (
                                <motion.button
                                  onClick={(e) => { e.stopPropagation(); setResolvingId(resolvingId === esc.id ? null : esc.id); }}
                                  className="flex items-center font-semibold text-white border-0"
                                  style={{ gap: 4, fontSize: TYPE.caption, padding: '5px 12px', borderRadius: RADIUS.pill, cursor: 'pointer', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)' }}
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                >
                                  <CheckCircle2 style={{ width: 13, height: 13 }} />
                                  Resolve
                                </motion.button>
                              )}

                              {/* Escalate priority */}
                              {esc.priority !== 'high' && esc.status !== 'resolved' && (
                                <motion.button
                                  onClick={(e) => { e.stopPropagation(); handleEscalate(esc.id); }}
                                  className="flex items-center font-medium text-gray-500 hover:text-rose-600"
                                  style={{ gap: 4, fontSize: TYPE.caption, border: `1px solid ${COLORS.gray[200]}`, background: 'white', borderRadius: RADIUS.pill, padding: '4px 10px', cursor: 'pointer' }}
                                  whileHover={{ scale: 1.04, borderColor: '#f43f5e' }}
                                  whileTap={{ scale: 0.96 }}
                                >
                                  <ArrowUp style={{ width: 12, height: 12 }} />
                                  Escalate
                                </motion.button>
                              )}

                              {/* Dismiss */}
                              <motion.button
                                onClick={(e) => { e.stopPropagation(); handleDismiss(esc.id); }}
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
            </AnimatePresence>
          </div>
        </motion.div>

          </TabsContent>

          <TabsContent value="alerts">
            <AlertsTabContent />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ── Agent Quick Popup ──────────────────────────────── */}
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
                width: 320, height: 'fit-content', maxHeight: 280,
                borderRadius: RADIUS.card, backgroundColor: '#ffffff',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.18)', overflow: 'hidden',
              }}
            >
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
              <div style={{ padding: GRID.spacing.sm, display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setAgentPopup(null); toast.success(`Calling ${agentPopup.name}...`); }}
                  className="flex items-center font-medium text-gray-700 w-full hover:bg-gray-50"
                  style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, border: 'none', background: 'none', cursor: 'pointer', padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                >
                  <Phone className="text-emerald-500" style={{ width: 16, height: 16 }} /> Call Agent
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setAgentPopup(null); toast.success(`Message sent to ${agentPopup.name}`); }}
                  className="flex items-center font-medium text-gray-700 w-full hover:bg-gray-50"
                  style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, border: 'none', background: 'none', cursor: 'pointer', padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                >
                  <Mail className="text-blue-500" style={{ width: 16, height: 16 }} /> Send Message
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setAgentPopup(null); toast('Opening scorecard...'); }}
                  className="flex items-center font-medium text-gray-700 w-full hover:bg-gray-50"
                  style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, border: 'none', background: 'none', cursor: 'pointer', padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                >
                  <Eye className="text-violet-500" style={{ width: 16, height: 16 }} /> View Scorecard
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Close assign picker when clicking outside */}
      {assignPickerFor && (
        <div className="fixed inset-0 z-40" onClick={() => setAssignPickerFor(null)} />
      )}
    </ManagerLoungeLayout>
  );
}

export default ManagerEscalations;
