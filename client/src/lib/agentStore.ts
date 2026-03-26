import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AgentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  npn?: string;
  role: 'agent' | 'executive';
  avatar?: string;
  territories: string[];
  startDate: string;
  certifications: string[];
  badges: string[];
}

export interface AgentWebsiteSettings {
  headline?: string;
  bio?: string;
  tagline?: string;
  featuredProducts?: string[];
  accentColor?: string;
  showTestimonials?: boolean;
  showFaq?: boolean;
  showCarriers?: boolean;
  showScheduleCall?: boolean;
}

export interface AgentRecruitingSettings {
  headline?: string;
  subheadline?: string;
  showTestimonials?: boolean;
  showFaq?: boolean;
  showCommissionTable?: boolean;
  showSteps?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'info' | 'success' | 'warning' | 'recognition';
  author?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  category: 'calls' | 'training' | 'admin' | 'followup';
  performanceImpact: number;
  assignedTo: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface StatusChange {
  id: string;
  from: Lead['status'];
  to: Lead['status'];
  date: string;
  agentId: string;
}

export interface LeadReminder {
  id: string;
  date: string;
  time: string;
  message: string;
  completed: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed' | 'lost';
  source: string;
  assignedTo: string;
  createdDate: string;
  lastContactDate?: string;
  notes: ActivityLog[];
  product?: string;
  state?: string;
  tags?: string[];
  leadNotes?: string;
  statusHistory?: StatusChange[];
  reminders?: LeadReminder[];
  // AgentOS Stage 1 - Follow-up enforcement
  nextFollowUpDate: string;
  nextFollowUpType: 'call' | 'email' | 'text' | 'meeting';
  // Policy tracking
  policyStatus?: 'quoted' | 'submitted' | 'pending_underwriting' | 'approved' | 'issued' | 'declined';
  policyNumber?: string;
  carrier?: string;
  policyStatusHistory?: PolicyStatusChange[];
  // AgentOS Stage 3 - Assisted Execution
  policyEffectiveDate?: string;
  policyExpirationDate?: string;
  coverageAmount?: number;
  monthlyPremium?: number;
  appointments?: Appointment[];
  crossSellOpportunities?: CrossSellOpportunity[];
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: 'call' | 'video' | 'in-person';
  title: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reminderSent?: boolean;
}

export interface CrossSellOpportunity {
  id: string;
  product: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  dismissed?: boolean;
  convertedToLead?: boolean;
}

export interface PolicyStatusChange {
  id: string;
  from?: Lead['policyStatus'];
  to: Lead['policyStatus'];
  date: string;
  agentId: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  type: 'call' | 'text' | 'email' | 'meeting' | 'note';
  disposition?: 'interested' | 'callback' | 'not_interested' | 'no_answer' | 'voicemail' | 'appointment_set';
  notes: string;
  date: string;
  agentId: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  modules: TrainingModule[];
  required: boolean;
  category: 'product' | 'sales' | 'compliance' | 'tools';
}

export interface TrainingModule {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
}

export interface SOP {
  id: string;
  title: string;
  category: string;
  content: string;
  version: string;
  lastUpdated: string;
  state?: string;
  product?: string;
}

export interface PerformanceMetrics {
  dailyCalls: number;
  dailyCallsTarget: number;
  dailyCloses: number;
  dailyClosesTarget: number;
  behaviorScore: number;
  conversionRate: number;
  currentStreak: number;
  longestStreak: number;
  xp: number;
  level: number;
  weeklyHistory: { day: string; calls: number; deals: number }[];
  rank: number;
  totalAgents: number;
}

export interface EarningEntry {
  id: string;
  policyNumber: string;
  clientName: string;
  product: string;
  amount: number;
  status: 'pending' | 'paid' | 'clawback';
  date: string;
}

export interface Script {
  id: string;
  product: string;
  state: string;
  channel: 'phone' | 'email' | 'text';
  content: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  closedDeals: number;
  streak: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
  ap: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  color: string;
}

export interface AgentNotification {
  id: string;
  type: 'achievement' | 'message' | 'alert' | 'reminder' | 'earning' | 'training';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'deal' | 'call' | 'lead' | 'achievement' | 'streak' | 'training' | 'earning';
  agentName: string;
  message: string;
  timestamp: string;
  highlight?: boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'calls' | 'leads' | 'training' | 'streak' | 'special';
  target: number;
  current: number;
  xpReward: number;
  bonusXp?: number;
  expiresIn: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  xpReward: number;
  category: 'sales' | 'training' | 'streak' | 'milestone';
}

// ===== IDEAS & FEEDBACK =====
export type IdeaCategory = 'product_idea' | 'process_improvement' | 'bug_report' | 'feature_request' | 'general_feedback';
export type IdeaStatus = 'submitted' | 'under_review' | 'planned' | 'implemented' | 'declined';
export type IdeaPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AgentIdea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  priority: IdeaPriority;
  status: IdeaStatus;
  submittedBy: string;
  submittedByName: string;
  submittedDate: string;
  upvotes: string[];
  adminResponse?: string;
  adminRespondedDate?: string;
}

// ===== BOOK OF BUSINESS =====
export type ClientStatus = 'pending' | 'active' | 'chargeback';

export interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage: number;
}

export interface MedicalInfo {
  tobaccoUse: boolean;
  healthConditions?: string;
  medications?: string;
  height?: string;
  weight?: string;
}

export interface BookOfBusinessClient {
  id: string;
  leadId?: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  ssn?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  idType?: 'drivers_license' | 'state_id';
  idNumber?: string;
  idState?: string;
  idExpiration?: string;
  bankName?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  beneficiaries?: Beneficiary[];
  medicalInfo?: MedicalInfo;
  policyNumber: string;
  policyType: string;
  carrier: string;
  coverageAmount: number;
  monthlyPremium: number;
  draftDate?: string;
  commissionRate?: number;
  policyEffectiveDate: string;
  policyExpirationDate?: string;
  policyDocumentUrl?: string;
  notes?: string;
  clientStatus: ClientStatus;
  chargebackDate?: string;
  chargebackReason?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  activityHistory: ActivityLog[];
  agentId: string;
  addedDate: string;
}

// ===== RECRUITING =====
export type RecruitingStage = 'prospect' | 'contacted' | 'applied' | 'interviewing' | 'onboarding' | 'active';
export type RecruitApproach = 'warm_lead' | 'cold_outreach' | 'referral';

export interface RecruitProspect {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  source: string;
  approach: RecruitApproach;
  stage: RecruitingStage;
  lastContactDate?: string;
  nextStepDate?: string;
  nextStepDescription?: string;
  recruitedBy: string;
  addedDate: string;
  stageHistory: Array<{ id: string; from: RecruitingStage; to: RecruitingStage; date: string; notes?: string }>;
}

export interface ReferralLink {
  code: string;
  url: string;
  clicks: number;
  conversions: number;
}

// ===== RECRUITING EXTENDED =====
export type RecruitingFunnelStage =
  'link_clicked' | 'application_started' | 'application_submitted' |
  'background_check' | 'contract_signed' | 'agent_approved' | 'agent_activated';

export interface FunnelStageData {
  stage: RecruitingFunnelStage;
  count: number;
  conversionRate: number;
}

export interface DownlineAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'probation';
  stateLicensed: string;
  applicationStage: 'approved' | 'activated';
  dateJoined: string;
  productionVolume: number;
  overrideEarnings: number;
  avatar?: string;
}

export type AutomationStepType = 'automated' | 'user_input' | 'manual_review';

export interface RecruitingAutomationStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  type: AutomationStepType;
  estimatedTime: string;
}

export interface RecruitingOverviewStats {
  totalRecruits: number;
  pendingApplications: number;
  approvedAgents: number;
  monthlyOverrideEarnings: number;
  totalDownlineVolume: number;
}

export interface QuoteVersion {
  id: string;
  version: number;
  coverageAmount: number;
  monthlyPremium: number;
  term?: number;
  createdDate: string;
  notes?: string;
}

export interface Quote {
  id: string;
  leadId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  product: 'term' | 'whole' | 'iul' | 'final_expense';
  coverageAmount: number;
  monthlyPremium: number;
  term?: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'expired';
  createdDate: string;
  expiresDate: string;
  agentId: string;
  notes?: string;
  carrier?: string;
  healthClass?: string;
  versions?: QuoteVersion[];
  currentVersion?: number;
  signatureStatus?: 'pending' | 'sent' | 'signed' | 'declined';
  signedDate?: string;
  templateId?: string;
}

const DEMO_AGENTS: AgentUser[] = [
  {
    id: 'agent-1',
    name: 'Alex Johnson',
    email: 'agent@goldcoastfnl.com',
    phone: '(312) 555-0147',
    role: 'agent',
    territories: ['Illinois', 'Indiana'],
    startDate: '2024-06-15',
    certifications: ['Term Life Basics'],
    badges: ['Quick Starter', 'First Sale']
  },
  {
    id: 'exec-1',
    name: 'Jack Cook',
    email: 'jack@goldcoastfnl.com',
    phone: '(630) 778-0888',
    role: 'executive',
    territories: ['All States'],
    startDate: '2023-01-01',
    certifications: ['All'],
    badges: ['Founder', 'Top Producer']
  }
];

const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Welcome to Q1 2026!',
    content: 'New year, new goals. Let\'s make this our best quarter yet!',
    date: '2026-01-02',
    type: 'info',
    author: 'Jack Cook'
  },
  {
    id: 'ann-2',
    title: 'Alex Johnson - First Close!',
    content: 'Congratulations to Alex on closing their first term life policy!',
    date: '2026-01-01',
    type: 'recognition'
  },
  {
    id: 'ann-3',
    title: 'New Training Available',
    content: 'IUL Advanced Strategies course is now live. Complete by Jan 15.',
    date: '2025-12-28',
    type: 'info'
  }
];

const DEMO_TASKS: Task[] = [
  { id: 'task-1', title: 'Make 10 outbound calls', description: 'Complete daily calling quota', dueDate: 'Today', completed: false, category: 'calls', performanceImpact: 10, assignedTo: 'agent-1', priority: 'high' },
  { id: 'task-2', title: 'Follow up with 3 leads', description: 'Contact leads from yesterday', dueDate: 'Today', completed: false, category: 'followup', performanceImpact: 5, assignedTo: 'agent-1', priority: 'high' },
  { id: 'task-3', title: 'Complete Term Life Basics Module 3', description: 'Continue training certification', dueDate: 'Tomorrow', completed: false, category: 'training', performanceImpact: 8, assignedTo: 'agent-1', priority: 'medium' },
  { id: 'task-4', title: 'Update CRM notes', description: 'Log all activities from today', dueDate: 'Today', completed: true, category: 'admin', performanceImpact: 3, assignedTo: 'agent-1', priority: 'low' },
  { id: 'task-5', title: 'Submit weekly report', description: 'Complete end of week summary', dueDate: 'Friday', completed: false, category: 'admin', performanceImpact: 5, assignedTo: 'agent-2', priority: 'medium' },
  { id: 'task-6', title: 'Make 15 outbound calls', description: 'Hit stretch goal for the day', dueDate: 'Today', completed: false, category: 'calls', performanceImpact: 15, assignedTo: 'agent-2', priority: 'high' },
  { id: 'task-7', title: 'Complete compliance training', description: 'Annual compliance review', dueDate: 'Next Week', completed: false, category: 'training', performanceImpact: 10, assignedTo: 'agent-3', priority: 'low' },
];

const DEMO_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '(630) 555-1234',
    status: 'qualified',
    source: 'Website',
    assignedTo: 'agent-1',
    createdDate: '2025-12-20',
    lastContactDate: '2025-12-28',
    product: 'Term Life',
    state: 'Illinois',
    nextFollowUpDate: '2026-02-08',
    nextFollowUpType: 'call',
    appointments: [
      {
        id: 'apt-mc-1',
        date: '2026-02-07',
        time: '11:00 AM',
        type: 'call',
        title: 'Coverage Discussion Call',
        notes: 'Discuss 20-year term options for family protection',
        status: 'scheduled',
        reminderSent: false
      }
    ],
    notes: [
      { id: 'log-1', type: 'call', disposition: 'interested', notes: 'Interested in 20-year term. Has 2 kids. Wants to discuss coverage options.', date: '2025-12-28', agentId: 'agent-1' }
    ]
  },
  {
    id: 'lead-2',
    name: 'Sarah Williams',
    email: 'swilliams@email.com',
    phone: '(312) 555-5678',
    status: 'proposal',
    source: 'Referral',
    assignedTo: 'agent-1',
    createdDate: '2025-12-15',
    lastContactDate: '2025-12-30',
    product: 'Whole Life',
    state: 'Illinois',
    nextFollowUpDate: '2026-02-07',
    nextFollowUpType: 'call',
    policyStatus: 'quoted',
    carrier: 'Mutual of Omaha',
    appointments: [
      {
        id: 'apt-sw-1',
        date: '2026-02-07',
        time: '2:00 PM',
        type: 'video',
        title: 'Proposal Review Meeting',
        notes: 'Review whole life proposal and answer questions',
        status: 'scheduled',
        reminderSent: false
      },
      {
        id: 'apt-sw-2',
        date: '2026-02-10',
        time: '10:30 AM',
        type: 'call',
        title: 'Follow-up Call',
        notes: 'Check if ready to proceed with application',
        status: 'scheduled',
        reminderSent: false
      }
    ],
    notes: [
      { id: 'log-2', type: 'meeting', disposition: 'appointment_set', notes: 'Met via Zoom. Sending proposal. Very interested in whole life for estate planning.', date: '2025-12-30', agentId: 'agent-1' }
    ]
  },
  {
    id: 'lead-3',
    name: 'James Rodriguez',
    email: 'jrod@email.com',
    phone: '(219) 555-9999',
    status: 'new',
    source: 'Website',
    assignedTo: 'agent-1',
    createdDate: '2026-01-01',
    state: 'Indiana',
    nextFollowUpDate: '2026-02-05',
    nextFollowUpType: 'call',
    notes: []
  },
  {
    id: 'lead-4',
    name: 'Emily Thompson',
    email: 'ethompson@email.com',
    phone: '(847) 555-3333',
    status: 'contacted',
    source: 'Facebook Ad',
    assignedTo: 'agent-2',
    createdDate: '2025-12-28',
    lastContactDate: '2025-12-31',
    product: 'Term Life',
    state: 'Illinois',
    nextFollowUpDate: '2026-01-28',
    nextFollowUpType: 'email',
    notes: []
  },
  {
    id: 'lead-5',
    name: 'David Park',
    email: 'dpark@email.com',
    phone: '(312) 555-7777',
    status: 'qualified',
    source: 'Referral',
    assignedTo: 'agent-2',
    createdDate: '2025-12-22',
    lastContactDate: '2025-12-30',
    product: 'IUL',
    state: 'Illinois',
    nextFollowUpDate: '2026-02-01',
    nextFollowUpType: 'meeting',
    notes: []
  },
  {
    id: 'lead-6',
    name: 'Lisa Martinez',
    email: 'lmartinez@email.com',
    phone: '(630) 555-4444',
    status: 'closed',
    source: 'Website',
    assignedTo: 'agent-1',
    createdDate: '2025-12-10',
    lastContactDate: '2025-12-28',
    product: 'Term Life',
    state: 'Illinois',
    nextFollowUpDate: '2025-12-28',
    nextFollowUpType: 'call',
    policyStatus: 'issued',
    policyNumber: 'TL-2025-78432',
    carrier: 'Nationwide',
    policyEffectiveDate: '2025-01-01',
    policyExpirationDate: '2026-02-28',
    coverageAmount: 500000,
    monthlyPremium: 45,
    appointments: [
      {
        id: 'apt-1',
        date: '2026-02-10',
        time: '10:00 AM',
        type: 'call',
        title: 'Annual Policy Review',
        notes: 'Discuss renewal options and cross-sell opportunities',
        status: 'scheduled',
        reminderSent: false
      }
    ],
    notes: [
      { id: 'log-6', type: 'call', disposition: 'interested', notes: 'Policy issued successfully. Client very happy with coverage.', date: '2025-12-28', agentId: 'agent-1' }
    ]
  },
  {
    id: 'lead-9',
    name: 'Jennifer Lee',
    email: 'jlee@email.com',
    phone: '(847) 555-1111',
    status: 'closed',
    source: 'Referral',
    assignedTo: 'agent-1',
    createdDate: '2024-12-01',
    lastContactDate: '2025-01-15',
    product: 'Term Life',
    state: 'Illinois',
    nextFollowUpDate: '2026-02-01',
    nextFollowUpType: 'call',
    policyStatus: 'issued',
    policyNumber: 'TL-2024-56789',
    carrier: 'Protective',
    policyEffectiveDate: '2024-01-15',
    policyExpirationDate: '2026-02-15',
    coverageAmount: 750000,
    monthlyPremium: 62,
    notes: [
      { id: 'log-9', type: 'call', disposition: 'interested', notes: 'Policy renewal coming up. Great client, consider upsell to whole life.', date: '2025-01-15', agentId: 'agent-1' }
    ]
  },
  {
    id: 'lead-10',
    name: 'Kevin Brown',
    email: 'kbrown@email.com',
    phone: '(312) 555-6666',
    status: 'closed',
    source: 'Website',
    assignedTo: 'agent-1',
    createdDate: '2025-06-01',
    lastContactDate: '2025-07-10',
    product: 'Final Expense',
    state: 'Illinois',
    nextFollowUpDate: '2026-03-01',
    nextFollowUpType: 'call',
    policyStatus: 'issued',
    policyNumber: 'FE-2025-11111',
    carrier: 'Mutual of Omaha',
    policyEffectiveDate: '2025-07-01',
    policyExpirationDate: '2030-07-01',
    coverageAmount: 25000,
    monthlyPremium: 85,
    appointments: [
      {
        id: 'apt-2',
        date: '2026-02-07',
        time: '2:30 PM',
        type: 'video',
        title: 'Discuss Additional Coverage',
        notes: 'Client interested in term life for spouse',
        status: 'scheduled',
        reminderSent: false
      }
    ],
    notes: [
      { id: 'log-10', type: 'call', disposition: 'interested', notes: 'Final expense policy issued. Client mentioned spouse needs coverage too.', date: '2025-07-10', agentId: 'agent-1' }
    ]
  },
  {
    id: 'lead-7',
    name: 'Robert Johnson',
    email: 'rjohnson@email.com',
    phone: '(773) 555-2222',
    status: 'proposal',
    source: 'Referral',
    assignedTo: 'agent-1',
    createdDate: '2025-12-05',
    lastContactDate: '2026-01-02',
    product: 'Term Life',
    state: 'Illinois',
    nextFollowUpDate: '2026-02-10',
    nextFollowUpType: 'call',
    policyStatus: 'submitted',
    carrier: 'Protective',
    notes: [
      { id: 'log-7', type: 'call', disposition: 'interested', notes: 'Application submitted, waiting on underwriting. Client prefers morning calls.', date: '2026-01-02', agentId: 'agent-1' }
    ]
  },
  {
    id: 'lead-11',
    name: 'Maria Santos',
    email: 'msantos@email.com',
    phone: '(312) 555-9876',
    status: 'closed',
    source: 'Referral',
    assignedTo: 'agent-1',
    createdDate: '2024-02-01',
    lastContactDate: '2024-02-15',
    product: 'Term Life',
    state: 'Illinois',
    nextFollowUpDate: '2026-02-10',
    nextFollowUpType: 'call',
    policyStatus: 'issued',
    policyNumber: 'TL-2024-33333',
    carrier: 'Prudential',
    policyEffectiveDate: '2024-02-15',
    policyExpirationDate: '2026-02-10',
    coverageAmount: 350000,
    monthlyPremium: 38,
    notes: [
      { id: 'log-11', type: 'call', disposition: 'interested', notes: 'Policy issued. Client very satisfied. Has 3 children.', date: '2024-02-15', agentId: 'agent-1' }
    ]
  },
  {
    id: 'lead-8',
    name: 'Amanda Foster',
    email: 'afoster@email.com',
    phone: '(630) 555-8888',
    status: 'contacted',
    source: 'Website',
    assignedTo: 'agent-1',
    createdDate: '2025-12-18',
    lastContactDate: '2025-12-20',
    product: 'Final Expense',
    state: 'Illinois',
    nextFollowUpDate: '2025-12-27',
    nextFollowUpType: 'call',
    notes: [
      { id: 'log-8', type: 'call', disposition: 'callback', notes: 'Asked for a callback next week. Interested in final expense for mother.', date: '2025-12-20', agentId: 'agent-1' }
    ]
  }
];

const DEMO_COURSES: TrainingCourse[] = [
  {
    id: 'course-1',
    title: 'Term Life Basics',
    description: 'Foundation course for selling term life insurance',
    required: true,
    category: 'product',
    modules: [
      { id: 'mod-1', title: 'What is Term Life?', duration: '15 min', completed: true },
      { id: 'mod-2', title: 'Policy Riders', duration: '20 min', completed: true },
      { id: 'mod-3', title: 'Pricing & Quotes', duration: '25 min', completed: true },
      { id: 'mod-4', title: 'Underwriting Basics', duration: '30 min', completed: false },
    ]
  },
  {
    id: 'course-2',
    title: 'Sales Fundamentals',
    description: 'Core sales techniques for insurance professionals',
    required: true,
    category: 'sales',
    modules: [
      { id: 'mod-5', title: 'Building Rapport', duration: '20 min', completed: false },
      { id: 'mod-6', title: 'Needs Analysis', duration: '25 min', completed: false },
      { id: 'mod-7', title: 'Presentation Skills', duration: '30 min', completed: false },
    ]
  },
  {
    id: 'course-3',
    title: 'IUL Advanced Strategies',
    description: 'Advanced indexed universal life techniques',
    required: false,
    category: 'product',
    modules: [
      { id: 'mod-8', title: 'IUL Overview', duration: '20 min', completed: false },
      { id: 'mod-9', title: 'Illustration Walkthrough', duration: '45 min', completed: false },
      { id: 'mod-10', title: 'Client Presentation', duration: '35 min', completed: false },
    ]
  },
  {
    id: 'course-4',
    title: 'Final Expense Mastery',
    description: 'Complete training for final expense sales',
    required: false,
    category: 'product',
    modules: [
      { id: 'mod-11', title: 'Understanding Final Expense', duration: '15 min', completed: false },
      { id: 'mod-12', title: 'Target Market & Leads', duration: '20 min', completed: false },
      { id: 'mod-13', title: 'Simplified Issue Products', duration: '25 min', completed: false },
      { id: 'mod-14', title: 'Closing Techniques', duration: '30 min', completed: false },
    ]
  },
  {
    id: 'course-5',
    title: 'Mortgage Protection Training',
    description: 'Protect families with mortgage protection insurance',
    required: false,
    category: 'product',
    modules: [
      { id: 'mod-15', title: 'Mortgage Protection Basics', duration: '20 min', completed: false },
      { id: 'mod-16', title: 'Lead Generation Strategies', duration: '25 min', completed: false },
      { id: 'mod-17', title: 'Policy Structuring', duration: '30 min', completed: false },
    ]
  },
  {
    id: 'course-6',
    title: 'Compliance & Ethics',
    description: 'Stay compliant with insurance regulations',
    required: true,
    category: 'compliance',
    modules: [
      { id: 'mod-18', title: 'State Regulations Overview', duration: '25 min', completed: false },
      { id: 'mod-19', title: 'Anti-Money Laundering', duration: '20 min', completed: false },
      { id: 'mod-20', title: 'Suitability Requirements', duration: '30 min', completed: false },
    ]
  },
  {
    id: 'course-7',
    title: 'Objection Handling: "I Need to Think About It"',
    description: 'Master the takeaway close technique',
    required: false,
    category: 'sales',
    modules: [
      { id: 'mod-21', title: 'Understanding the Objection', duration: '10 min', completed: false },
      { id: 'mod-22', title: 'The Takeaway Close', duration: '15 min', completed: false },
      { id: 'mod-23', title: 'Practice Scenarios', duration: '20 min', completed: false },
    ]
  },
  {
    id: 'course-8',
    title: 'Objection Handling: "I Can\'t Afford It"',
    description: 'Learn the coffee money reframe technique',
    required: false,
    category: 'sales',
    modules: [
      { id: 'mod-24', title: 'Addressing Price Concerns', duration: '10 min', completed: false },
      { id: 'mod-25', title: 'Coffee Money Reframe', duration: '15 min', completed: false },
      { id: 'mod-26', title: 'Value-Based Selling', duration: '20 min', completed: false },
    ]
  },
  {
    id: 'course-9',
    title: 'Objection Handling: "Talk to My Spouse"',
    description: 'Partnership approach for couple objections',
    required: false,
    category: 'sales',
    modules: [
      { id: 'mod-27', title: 'The Spouse Objection', duration: '10 min', completed: false },
      { id: 'mod-28', title: 'Partnership Approach', duration: '15 min', completed: false },
      { id: 'mod-29', title: 'Scheduling the Follow-Up', duration: '10 min', completed: false },
    ]
  },
  {
    id: 'course-10',
    title: 'Objection Handling: "I Already Have Coverage"',
    description: 'Coverage gap analysis techniques',
    required: false,
    category: 'sales',
    modules: [
      { id: 'mod-30', title: 'Identifying Coverage Gaps', duration: '15 min', completed: false },
      { id: 'mod-31', title: 'Comparison Strategies', duration: '20 min', completed: false },
      { id: 'mod-32', title: 'Adding Value to Existing Coverage', duration: '15 min', completed: false },
    ]
  },
];

const DEMO_SOPS: SOP[] = [
  {
    id: 'sop-1',
    title: 'Lead Follow-Up Process',
    category: 'Lead Management',
    content: JSON.stringify({
      icon: 'target',
      color: 'green',
      steps: [
        { title: 'Speed to Lead', description: 'Call within 5 minutes of receiving a new lead', critical: true },
        { title: 'First Attempt', description: 'If no answer, leave a voicemail AND send a text message immediately' },
        { title: 'Second Attempt', description: 'Call again within 2-4 hours with a different approach' },
        { title: 'Third Attempt', description: 'Final call of the day, try a different time (morning vs evening)' },
        { title: 'Day 2 Follow-Up', description: 'Continue calling attempts 2-3 times per day for 3 days' },
        { title: 'Email Sequence', description: 'Add to automated email sequence if no contact after 3 days' },
        { title: 'CRM Updates', description: 'Log every attempt with notes, update lead status after each contact', critical: true }
      ]
    }),
    version: '2.0',
    lastUpdated: '2025-12-20'
  },
  {
    id: 'sop-2',
    title: 'Application Submission Checklist',
    category: 'Compliance',
    content: JSON.stringify({
      icon: 'clipboard',
      color: 'blue',
      steps: [
        { title: 'Verify Client Identity', description: 'Confirm full legal name, date of birth, and Social Security number', critical: true },
        { title: 'Beneficiary Information', description: 'Collect primary and contingent beneficiary details (name, relationship, DOB, %)' },
        { title: 'Health Questions', description: 'Review all health questions thoroughly with the client - accuracy is critical', critical: true },
        { title: 'Payment Setup', description: 'Confirm bank account/card details for premium payments' },
        { title: 'Signature Collection', description: 'Obtain all required signatures (paper or e-signature)' },
        { title: 'Submit to Carrier', description: 'Upload application to carrier portal within 24 hours of signing' },
        { title: 'Confirmation Email', description: 'Send client confirmation of submission with expected timeline' },
        { title: 'Set Follow-Up', description: 'Create task to check underwriting status in 48-72 hours' }
      ]
    }),
    version: '3.1',
    lastUpdated: '2025-12-15'
  },
  {
    id: 'sop-3',
    title: 'Policy Delivery Process',
    category: 'Client Service',
    content: JSON.stringify({
      icon: 'gift',
      color: 'purple',
      steps: [
        { title: 'Schedule Delivery Call', description: 'Contact client to schedule a 15-20 minute policy review call' },
        { title: 'Review Policy Details', description: 'Walk through coverage amount, premium, beneficiaries, and riders' },
        { title: 'Explain Key Provisions', description: 'Cover free look period, grace period, and how to make claims' },
        { title: 'Confirm Understanding', description: 'Ask client to confirm they understand their policy', critical: true },
        { title: 'Update Contact Info', description: 'Verify phone, email, and mailing address are current' },
        { title: 'Request Referrals', description: 'Ask for 2-3 referrals of friends/family who need protection' },
        { title: 'Set Annual Review', description: 'Schedule anniversary review call in CRM for policy birthday' },
        { title: 'Send Welcome Packet', description: 'Email digital welcome packet with policy summary and your contact info' }
      ]
    }),
    version: '1.5',
    lastUpdated: '2025-12-10'
  },
  {
    id: 'sop-4',
    title: 'Underwriting Issue Resolution',
    category: 'Underwriting',
    content: JSON.stringify({
      icon: 'alert',
      color: 'orange',
      steps: [
        { title: 'Review UW Request', description: 'Read the underwriting request carefully to understand what is needed' },
        { title: 'Contact Client', description: 'Call client within 24 hours to explain what additional info is required', critical: true },
        { title: 'Collect Documentation', description: 'Help client gather medical records, lab results, or other documents' },
        { title: 'Submit Promptly', description: 'Upload documents to carrier within 48 hours of receipt' },
        { title: 'Follow Up', description: 'Check status 3-5 business days after submission' },
        { title: 'Negotiate If Needed', description: 'If rated or declined, explore options with underwriter or try another carrier' },
        { title: 'Keep Client Informed', description: 'Update client on status at least weekly during underwriting' }
      ]
    }),
    version: '2.2',
    lastUpdated: '2025-12-05'
  },
  {
    id: 'sop-5',
    title: 'Client Complaint Handling',
    category: 'Client Service',
    content: JSON.stringify({
      icon: 'user',
      color: 'red',
      steps: [
        { title: 'Listen Actively', description: 'Let the client fully express their concern without interruption', critical: true },
        { title: 'Acknowledge & Empathize', description: 'Show understanding: "I understand this is frustrating..."' },
        { title: 'Document Everything', description: 'Record the complaint details, date, and client statements in CRM', critical: true },
        { title: 'Investigate', description: 'Review policy, notes, and communications to understand what happened' },
        { title: 'Provide Solution', description: 'Offer a clear resolution or escalate to management if needed' },
        { title: 'Follow Through', description: 'Complete all promised actions within the agreed timeframe' },
        { title: 'Confirm Resolution', description: 'Call client to confirm they are satisfied with the resolution' },
        { title: 'Report to Compliance', description: 'If complaint involves regulatory issues, report to compliance officer' }
      ]
    }),
    version: '1.8',
    lastUpdated: '2025-11-28'
  },
  {
    id: 'sop-6',
    title: 'Daily Agent Routine',
    category: 'Productivity',
    content: JSON.stringify({
      icon: 'clock',
      color: 'secondary',
      steps: [
        { title: 'Morning Planning (8:00 AM)', description: 'Review calendar, prioritize tasks, set 3 daily goals' },
        { title: 'Lead Block 1 (9:00-11:00 AM)', description: 'Make outbound calls - this is prime calling time', critical: true },
        { title: 'Admin Time (11:00-12:00 PM)', description: 'Process applications, update CRM, respond to emails' },
        { title: 'Lunch Break (12:00-1:00 PM)', description: 'Take a real break to recharge' },
        { title: 'Lead Block 2 (1:00-3:00 PM)', description: 'Continue outbound calls and scheduled appointments' },
        { title: 'Follow-Ups (3:00-4:00 PM)', description: 'Check pending apps, follow up on quotes, handle callbacks' },
        { title: 'Lead Block 3 (4:00-6:00 PM)', description: 'Evening calls - great for reaching people after work', critical: true },
        { title: 'End of Day (6:00 PM)', description: 'Log final calls, update CRM, plan tomorrow\'s priorities' }
      ]
    }),
    version: '2.5',
    lastUpdated: '2025-12-18'
  },
  {
    id: 'sop-7',
    title: 'Replacement Policy Guidelines',
    category: 'Compliance',
    content: JSON.stringify({
      icon: 'shield',
      color: 'blue',
      steps: [
        { title: 'Assess Existing Coverage', description: 'Review current policy details, riders, and cash value if applicable' },
        { title: 'Document Comparison', description: 'Create written comparison of old vs new policy benefits', critical: true },
        { title: 'Disclose Implications', description: 'Explain potential surrender charges, new contestability period, health changes' },
        { title: 'Replacement Form', description: 'Complete state-required replacement disclosure form', critical: true },
        { title: 'Client Acknowledgment', description: 'Obtain signed acknowledgment that client understands implications' },
        { title: 'Wait for Approval', description: 'Do not cancel existing policy until new policy is approved and in force' },
        { title: 'Coordinate Transition', description: 'Help client cancel old policy after new policy is active' },
        { title: 'Retain Documentation', description: 'Keep copies of all replacement paperwork for 7+ years' }
      ]
    }),
    version: '3.0',
    lastUpdated: '2025-12-01'
  },
  {
    id: 'sop-8',
    title: 'Claim Filing Assistance',
    category: 'Client Service',
    content: JSON.stringify({
      icon: 'file',
      color: 'purple',
      steps: [
        { title: 'Express Condolences', description: 'Be compassionate - this is a difficult time for the family', critical: true },
        { title: 'Gather Information', description: 'Collect policy number, insured\'s information, and cause of death' },
        { title: 'Obtain Death Certificate', description: 'Request certified copy of death certificate from beneficiary' },
        { title: 'Complete Claim Form', description: 'Help beneficiary complete the carrier\'s claim form accurately' },
        { title: 'Submit to Carrier', description: 'Send claim form and death certificate to carrier claims department' },
        { title: 'Track Progress', description: 'Follow up with carrier every 3-5 days on claim status' },
        { title: 'Update Beneficiary', description: 'Keep beneficiary informed of claim progress weekly' },
        { title: 'Confirm Payment', description: 'Verify beneficiary received payment and offer continued support' }
      ]
    }),
    version: '1.3',
    lastUpdated: '2025-11-15'
  }
];

const DEMO_PERFORMANCE: PerformanceMetrics = {
  dailyCalls: 47,
  dailyCallsTarget: 100,
  dailyCloses: 1,
  dailyClosesTarget: 3,
  behaviorScore: 78,
  conversionRate: 12,
  currentStreak: 5,
  longestStreak: 12,
  xp: 2450,
  level: 4,
  weeklyHistory: [
    { day: 'Mon', calls: 18, deals: 1 },
    { day: 'Tue', calls: 24, deals: 2 },
    { day: 'Wed', calls: 20, deals: 1 },
    { day: 'Thu', calls: 28, deals: 3 },
    { day: 'Fri', calls: 22, deals: 2 },
    { day: 'Sat', calls: 8, deals: 0 },
    { day: 'Sun', calls: 4, deals: 0 }
  ],
  rank: 3,
  totalAgents: 12
};

const DEMO_EARNINGS: EarningEntry[] = [
  { id: 'earn-1', policyNumber: 'POL-2025-1234', clientName: 'Robert Smith', product: 'Term 20', amount: 850, status: 'paid', date: '2025-12-15' },
  { id: 'earn-2', policyNumber: 'POL-2025-1456', clientName: 'Jennifer Lee', product: 'Whole Life', amount: 1200, status: 'pending', date: '2025-12-28' },
  { id: 'earn-3', policyNumber: 'POL-2025-1567', clientName: 'David Brown', product: 'Term 30', amount: 650, status: 'pending', date: '2026-01-01' },
];

const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'agent-top-1', name: 'Sarah Mitchell', xp: 4850, level: 7, closedDeals: 8, streak: 15, rank: 1, trend: 'same', ap: { daily: 4500, weekly: 28500, monthly: 112000, yearly: 1250000 } },
  { id: 'agent-top-2', name: 'Marcus Chen', xp: 4200, level: 6, closedDeals: 6, streak: 12, rank: 2, trend: 'up', ap: { daily: 3200, weekly: 22400, monthly: 89600, yearly: 980000 } },
  { id: 'agent-1', name: 'Alex Johnson', xp: 2450, level: 4, closedDeals: 2, streak: 5, rank: 3, trend: 'up', ap: { daily: 1800, weekly: 12600, monthly: 50400, yearly: 580000 } },
  { id: 'agent-top-4', name: 'Emily Davis', xp: 2100, level: 4, closedDeals: 2, streak: 3, rank: 4, trend: 'down', ap: { daily: 1200, weekly: 8400, monthly: 33600, yearly: 420000 } },
  { id: 'agent-top-5', name: 'Jordan Taylor', xp: 1800, level: 3, closedDeals: 1, streak: 7, rank: 5, trend: 'same', ap: { daily: 900, weekly: 6300, monthly: 25200, yearly: 310000 } },
];

const DEMO_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-1', name: 'First Steps', description: 'Complete your first training module', icon: 'graduation-cap', unlocked: true, unlockedDate: '2024-06-20', xpReward: 50, category: 'training' },
  { id: 'ach-2', name: 'Closer', description: 'Close your first deal', icon: 'handshake', unlocked: true, unlockedDate: '2024-07-15', xpReward: 200, category: 'sales' },
  { id: 'ach-3', name: 'Streak Starter', description: 'Maintain a 3-day activity streak', icon: 'flame', unlocked: true, unlockedDate: '2024-06-25', xpReward: 100, category: 'streak' },
  { id: 'ach-4', name: 'Week Warrior', description: 'Maintain a 7-day activity streak', icon: 'fire', unlocked: false, xpReward: 250, category: 'streak' },
  { id: 'ach-5', name: 'Call Champion', description: 'Make 100 calls in a week', icon: 'phone', unlocked: false, xpReward: 300, category: 'milestone' },
  { id: 'ach-6', name: 'Top Producer', description: 'Close 10 deals in a month', icon: 'trophy', unlocked: false, xpReward: 500, category: 'sales' },
  { id: 'ach-7', name: 'Knowledge Master', description: 'Complete all training courses', icon: 'brain', unlocked: false, xpReward: 400, category: 'training' },
  { id: 'ach-8', name: 'Consistency King', description: 'Maintain a 30-day streak', icon: 'crown', unlocked: false, xpReward: 1000, category: 'streak' },
];

const DEMO_QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa-1', label: 'Log Call', icon: 'phone', action: 'log-call', color: 'blue' },
  { id: 'qa-2', label: 'Add Lead', icon: 'user-plus', action: 'add-lead', color: 'green' },
  { id: 'qa-3', label: 'Schedule', icon: 'calendar', action: 'schedule', color: 'purple' },
];

const DEMO_NOTIFICATIONS: AgentNotification[] = [
  { id: 'notif-1', type: 'achievement', title: 'Achievement Unlocked!', description: 'You earned "Streak Starter" badge', time: '2 hours ago', read: false },
  { id: 'notif-2', type: 'earning', title: 'Commission Paid', description: 'Your $850 commission for POL-2025-1234 has been deposited', time: '1 day ago', read: false },
  { id: 'notif-3', type: 'training', title: 'Training Reminder', description: 'Complete "Term Life Basics" module by Jan 5', time: '1 day ago', read: true },
  { id: 'notif-4', type: 'message', title: 'New Message', description: 'Jack Cook sent you a message about your Q1 goals', time: '2 days ago', read: true },
  { id: 'notif-5', type: 'reminder', title: 'Follow-up Reminder', description: 'Call Michael Chen today - interested in 20-year term', time: '3 hours ago', read: false },
];

const DEMO_ACTIVITIES: ActivityItem[] = [
  { id: 'act-1', type: 'deal', agentName: 'Sarah Mitchell', message: 'closed a $750K Whole Life policy!', timestamp: '5 min ago', highlight: true },
  { id: 'act-2', type: 'achievement', agentName: 'Marcus Chen', message: 'unlocked "Call Champion" badge', timestamp: '15 min ago' },
  { id: 'act-3', type: 'streak', agentName: 'Emily Davis', message: 'reached a 10-day streak!', timestamp: '1 hour ago' },
  { id: 'act-4', type: 'lead', agentName: 'Alex Johnson', message: 'moved Sarah Williams to Proposal stage', timestamp: '2 hours ago' },
  { id: 'act-5', type: 'training', agentName: 'Jordan Taylor', message: 'completed "Sales Fundamentals" course', timestamp: '3 hours ago' },
];

const DEMO_DAILY_CHALLENGES: DailyChallenge[] = [
  { id: 'dc-1', title: 'Call Crusher', description: 'Make 10 outbound calls today', type: 'calls', target: 10, current: 7, xpReward: 50, expiresIn: '6 hours', completed: false },
  { id: 'dc-2', title: 'Lead Machine', description: 'Add 2 new leads to your pipeline', type: 'leads', target: 2, current: 1, xpReward: 30, expiresIn: '6 hours', completed: false },
  { id: 'dc-3', title: 'Knowledge Seeker', description: 'Complete 1 training module', type: 'training', target: 1, current: 0, xpReward: 25, bonusXp: 10, expiresIn: '6 hours', completed: false },
];

const DEMO_SCRIPTS: Script[] = [
  {
    id: 'script-1',
    product: 'Term Life',
    state: 'All States',
    channel: 'phone',
    content: `TERM LIFE INSURANCE SCRIPT

OPENING:
"Hi [Name], this is [Your Name] with Gold Coast Financial Partners. I'm calling about the life insurance information you requested. Is now a good time to chat for a few minutes?"

[If yes, continue. If no, schedule callback.]

BUILD RAPPORT:
"Great! Before we dive in, I'd love to learn a little about you and your family so I can make sure I'm recommending the right coverage."

DISCOVERY QUESTIONS:
1. "What prompted you to look into life insurance right now?"
2. "Tell me about your family - do you have a spouse or children depending on your income?"
3. "Are you the primary breadwinner, or do you both work?"
4. "Do you own your home? What's the remaining balance on your mortgage?"
5. "Do you have any existing life insurance through work or personally?"

TRANSITION TO PRESENTATION:
"Based on what you've shared, it sounds like your family depends on your income for [mortgage/bills/kids' education]. If something happened to you tomorrow, how long would you want your family to be financially secure?"

PRESENT THE SOLUTION:
"I recommend a [10/15/20/30]-year term policy with [$XXX,000] in coverage. This would:
- Pay off your mortgage completely
- Replace your income for [X] years
- Cover your children's education
- Give your family time to adjust without financial stress"

THE COST:
"The great news is this level of protection costs just $[XX] per month - less than a daily coffee. And because you're [healthy/young/non-smoker], you qualify for our best rates."

HANDLE OBJECTIONS:
- "I need to think about it" → "I completely understand. What specifically would you like to think through? I'm happy to clarify anything."
- "It's too expensive" → "I hear you. Let me ask - if something happened to you, would $[XX]/month be too expensive for your family to survive without your income?"
- "I have coverage at work" → "That's great! But did you know employer coverage typically ends if you leave your job? This policy stays with you no matter what."

CLOSE:
"The application takes about 15 minutes and there's no medical exam required for this coverage amount. I can start it right now while we're on the phone together. Does that work for you?"

AFTER APPLICATION:
"Congratulations on taking this important step to protect your family! You should receive your policy documents within [X] days. I'll follow up to make sure everything is in order."`
  },
  {
    id: 'script-2',
    product: 'Mortgage Protection',
    state: 'All States',
    channel: 'phone',
    content: `MORTGAGE PROTECTION SCRIPT

OPENING:
"Hi [Name], this is [Your Name] with Gold Coast Financial Partners. I'm reaching out because you recently [purchased a home/refinanced your mortgage] and I wanted to make sure you're aware of a program that protects your home if something unexpected happens. Do you have a quick moment?"

BUILD URGENCY:
"Congratulations on your home! That's exciting. I'm sure you worked hard to get approved and make that down payment. My job is to make sure your family never loses that home if something happens to you."

DISCOVERY QUESTIONS:
1. "How long have you been in your new home?"
2. "What's your current mortgage balance, roughly?"
3. "Is your spouse/partner also on the mortgage?"
4. "Did the bank offer you mortgage protection insurance? [They usually offer expensive decreasing term]"
5. "If something happened to you tomorrow, would your family be able to keep up with the mortgage payments?"

CREATE URGENCY:
"Here's what most people don't realize - if you pass away, your mortgage doesn't go away. Your family has 3 choices:
1. Keep paying the mortgage on one income
2. Sell the home and move
3. Lose the home to foreclosure

None of those are good options. Mortgage protection gives them a 4th option - the mortgage gets paid off completely, and they stay in the home you worked so hard to provide."

PRESENT THE SOLUTION:
"What I recommend is a level term policy that matches your mortgage term. For your [$XXX,000] mortgage, you're looking at about $[XX] per month. This amount stays level - it never goes up - and if anything happens to you, your mortgage is paid off in full."

KEY DIFFERENTIATOR:
"Unlike the bank's policy that decreases over time while your premium stays the same, our policy pays the full amount no matter when you pass. Plus, your family can use the money however they need - mortgage payoff, bills, education, whatever helps them most."

CLOSE:
"I can get you covered today in about 15 minutes. This locks in your rate at your current age and health. The longer you wait, the more expensive it gets. Should we get started?"

SPOUSE INVOLVEMENT:
"Is your spouse available to join us? Since you're both on the mortgage, it's important we protect both incomes. We can do a joint policy or individual policies - whichever gives you better rates."`
  },
  {
    id: 'script-3',
    product: 'Whole Life',
    state: 'All States',
    channel: 'phone',
    content: `WHOLE LIFE INSURANCE SCRIPT

OPENING:
"Hi [Name], this is [Your Name] with Gold Coast Financial Partners. I'm reaching out because you expressed interest in permanent life insurance - coverage that lasts your entire lifetime and builds cash value. Is this a good time to talk?"

QUALIFY THE PROSPECT:
"Before we go further, let me make sure whole life is the right fit for you. A few quick questions:
1. Are you looking for coverage that lasts your entire life, not just a set number of years?
2. Are you interested in a policy that builds cash value you can access later?
3. Is leaving a guaranteed inheritance for your family important to you?"

EXPLAIN WHOLE LIFE:
"Whole life insurance is different from term insurance in three important ways:

1. LIFETIME COVERAGE: It never expires. As long as you pay your premiums, you're covered until the day you die - whether that's at 65, 85, or 105.

2. CASH VALUE: A portion of every premium goes into a savings component that grows tax-deferred. You can borrow against this money for emergencies, retirement, or any purpose.

3. FIXED PREMIUMS: Your premium never increases. The rate you lock in today is the rate you pay for life."

DISCOVERY QUESTIONS:
1. "What's most important to you - the lifetime coverage or the cash value component?"
2. "Do you have any term policies that will eventually expire?"
3. "Have you thought about what happens when term coverage ends and you're older and possibly less healthy?"
4. "Are you looking to leave a specific amount to your beneficiaries?"

PRESENT THE SOLUTION:
"Based on what you've shared, I recommend a whole life policy with [$XXX,000] in coverage. Your premium would be $[XXX] per month, guaranteed never to increase.

After about [5-7] years, you'll start building significant cash value that you can access. By retirement, you could have [$XX,XXX] available to supplement your income."

HANDLE OBJECTIONS:
- "It's more expensive than term" → "You're right - whole life costs more because you're getting more. Term is renting coverage; whole life is owning it. Plus, you're building equity with every payment."
- "I can invest the difference myself" → "Many people say that, but few actually do it consistently for 30+ years. Whole life forces disciplined savings with guaranteed growth."

CLOSE:
"The best time to lock in whole life is when you're youngest and healthiest. Every year you wait, it costs more. Let's get your application started today and lock in these rates."`
  },
  {
    id: 'script-4',
    product: 'Final Expense',
    state: 'All States',
    channel: 'phone',
    content: `FINAL EXPENSE INSURANCE SCRIPT

OPENING:
"Hi [Name], this is [Your Name] with Gold Coast Financial Partners. I'm calling about the information you requested on burial insurance - the kind that helps your family cover funeral costs without going into debt. Do you have a few minutes?"

BUILD RAPPORT & EMPATHY:
"I know this isn't the most fun topic to discuss, but I really respect you for thinking ahead. Most people wait until it's too late, and their families end up struggling."

SHARE THE PROBLEM:
"Did you know the average funeral today costs between $10,000 and $15,000? And that doesn't include the headstone, flowers, reception, or outstanding medical bills. Most families aren't prepared for that expense, and many end up starting GoFundMe pages or going into debt."

DISCOVERY QUESTIONS:
1. "Have you thought about how your funeral would be paid for?"
2. "Do you have any life insurance currently?"
3. "Have you ever been turned down for life insurance due to health issues?"
4. "Do you have any health conditions I should know about? [diabetes, heart issues, COPD, cancer history]"

EMPATHY STATEMENT:
"I talk to a lot of folks who've had health challenges and thought they couldn't get coverage. The good news is, we specialize in helping people just like you."

PRESENT THE SOLUTION:
"Based on what you've shared, I recommend a final expense policy for [$10,000-25,000]. This is whole life insurance - it never expires and your rate never goes up.

Your premium would be $[XX] per month. This is deducted automatically so you never miss a payment and never lose coverage."

KEY BENEFITS:
- "No medical exam required - just a few health questions"
- "Coverage starts immediately or after [2 years] depending on health"
- "Your rate is locked in for life - it never increases"
- "Benefits paid directly to your beneficiary within 24-48 hours"
- "You can't outlive this policy - it's yours forever"

EMOTIONAL CLOSE:
"[Name], I want you to picture this: When you pass - hopefully many years from now - instead of your family scrambling to find money, crying and stressed, they'll have a check in their hands within days. They can focus on grieving and celebrating your life, not worrying about bills. That's the gift you're giving them."

CLOSE:
"The application takes about 10 minutes and I can tell you right away if you're approved. Let's get you protected today. What's your date of birth?"

GRADED BENEFIT EXPLANATION (if applicable):
"Because of your [health condition], you qualify for our graded benefit plan. This means if something happens in the first two years, your family receives all premiums paid plus 10% interest. After two years, they receive the full benefit amount. This is designed for folks with health challenges who still deserve protection."`
  },
  {
    id: 'script-5',
    product: 'Cold Leads',
    state: 'All States',
    channel: 'phone',
    content: `COLD LEAD SCRIPT (Aged/Purchased Leads)

MINDSET:
Cold leads are people who requested information weeks or months ago. They may not remember filling out the form. Your goal is to re-engage them quickly and find out if they still have the need.

OPENING (Pattern Interrupt):
"Hi [Name]? Great! This is [Your Name] with Gold Coast Financial Partners. I'm not trying to sell you anything right now - I'm just following up on a request you made about life insurance. Does that ring a bell?"

IF THEY DON'T REMEMBER:
"No worries! You may have filled out an online form a while back comparing life insurance rates. A lot of people do that when shopping around. Are you still looking for coverage, or did you already get something in place?"

IF THEY'RE NOT INTERESTED:
"I totally understand. Before I let you go - was there a reason you were looking at that time? Sometimes life gets busy but the need is still there. Any major life changes recently - new baby, new home, new job?"

IF THEY'RE INTERESTED:
"Great! I'm glad I caught you. Let me ask you a few quick questions to see what options make the most sense for you..."

[Transition to standard discovery questions]

RAPID QUALIFICATION:
Since this is a cold lead, qualify quickly:
1. "Are you still in the market for life insurance?"
2. "Has anything changed since you first looked - health, job, family?"
3. "What's your timeline for getting this in place?"
4. "Were you looking for term or permanent coverage?"

HANDLE SKEPTICISM:
"I know you probably get a lot of calls. I'm not here to pressure you. I just want to make sure you get the protection you were looking for and get some real answers to your questions."

URGENCY BUILDER:
"Rates have actually gone up since you first inquired. If you're still thinking about it, it makes sense to lock in today's rates before they increase again. Are you healthy now? Because that can change too."

CLOSE:
"Look, I can get you a no-obligation quote in about 5 minutes. If it doesn't work for you, no hard feelings. But at least you'll know exactly what you qualify for and what it costs. Fair enough?"`
  },
  {
    id: 'script-6',
    product: 'Warm Leads',
    state: 'All States',
    channel: 'phone',
    content: `WARM LEAD SCRIPT (Recent Inquiry - Within 48 Hours)

MINDSET:
This person just requested information. They're actively shopping and likely talking to other agents. Speed and value are critical.

OPENING:
"Hi [Name]! This is [Your Name] with Gold Coast Financial Partners. I'm calling about the life insurance quote you just requested online. Did I catch you at a good time?"

ACKNOWLEDGE THE REQUEST:
"Perfect! I saw you were looking for [$XXX,000] in coverage for [term length]. I've got some great options for you. But first, let me ask a couple questions to make sure I'm showing you the best rates..."

RAPID DISCOVERY:
1. "The form said [age/health info] - is that still accurate?"
2. "Any tobacco use in the last 12 months?"
3. "Any major health conditions - diabetes, heart issues, cancer?"
4. "How soon were you hoping to get this in place?"

BUILD VALUE:
"Here's what makes us different - I work with over 30 top-rated insurance companies. That means I can shop your case to find you the absolute best rate. Most agents only represent one or two companies."

PRESENT OPTIONS:
"Based on what you told me, you qualify for our [Preferred/Standard] rates. For [$XXX,000] in coverage, you're looking at:
- 10-year term: $[XX]/month
- 20-year term: $[XX]/month  
- 30-year term: $[XX]/month

Most people your age go with the 20-year because [reason based on their situation]."

CREATE URGENCY:
"These rates are based on today's age and health. Every day you wait, it technically gets more expensive. Plus, none of us know what tomorrow brings health-wise. The best time to lock this in is right now."

HANDLE COMPARISON SHOPPING:
"Are you getting quotes from anyone else? [If yes] Great - you should compare! Just make sure you're comparing apples to apples. What company did they quote? [Often they've only talked to one company] The nice thing about working with me is I've already done that comparison shopping for you across 30+ companies."

CLOSE:
"I can get you started on the application right now - it takes about 15 minutes. You'll lock in this rate, and if for any reason you change your mind, you can cancel within 30 days for a full refund. Sound good?"`
  },
  {
    id: 'script-7',
    product: 'In-House Leads',
    state: 'All States',
    channel: 'phone',
    content: `IN-HOUSE LEAD SCRIPT (Company-Generated Leads)

MINDSET:
These are premium leads generated by Gold Coast Financial Partners marketing. They know our brand and have specifically requested information from us. Conversion should be high.

OPENING:
"Hi [Name]! This is [Your Name] calling from Gold Coast Financial Partners - you reached out to us about protecting your family with life insurance. How are you doing today?"

BRAND REINFORCEMENT:
"I'm one of our senior agents here at Gold Coast, and I specialize in helping families just like yours find the right coverage at the right price. I've helped hundreds of families in [their state] get protected."

PERSONALIZED APPROACH:
"I see from your request that you're looking for about [$XXX,000] in coverage. Can you tell me a little bit about what's driving this? Is it a new home, growing family, or just realizing it's time to get protected?"

DISCOVERY (Detailed):
Since this is a high-quality lead, take time to build relationship:
1. "Tell me about your family situation..."
2. "What does your current coverage look like?"
3. "What's most important to you in a life insurance policy?"
4. "Have you looked into this before? What held you back?"
5. "Is there a specific budget you're trying to stay within?"

PRESENT TAILORED SOLUTION:
"[Name], based on everything you've shared, here's what I recommend:

For your situation - [married with 2 kids, $300K mortgage, primary income earner] - you need a policy that would:
✓ Pay off your mortgage ($300K)
✓ Replace 5 years of income ($XXX,XXX)
✓ Fund kids' college ($XXX,XXX)

That's about [$XXX,000] in coverage. For someone your age and health, we're looking at $[XX] per month. That's less than your phone bill to make sure your family never struggles financially."

HANDLE OBJECTIONS:
- "Let me talk to my spouse" → "Absolutely! Is [spouse] available now? I'd love to include them. This really is a family decision."
- "I need to shop around" → "I encourage you to compare! Just know that I've already done that comparison for you. I work with 30+ companies to find you the best rate. What would you need to see to move forward today?"

CLOSE:
"I'm going to recommend we get your application started today. Here's why - your rates are locked in at today's age. If you wait even a month, you'll be [age+1] and your rate goes up. Plus, I've got availability right now to guide you through it. It takes about 15-20 minutes. Ready?"

POST-SALE:
"Welcome to the Gold Coast Financial Partners family! Here's what happens next:
1. You'll receive a confirmation email within the hour
2. Underwriting takes [X] days
3. I'll personally call you when your policy is approved
4. And I'm always here if you have questions - here's my direct line..."`
  },
  {
    id: 'script-8',
    product: 'IUL',
    state: 'All States',
    channel: 'phone',
    content: `INDEXED UNIVERSAL LIFE (IUL) SCRIPT

OPENING:
"Hi [Name], this is [Your Name] with Gold Coast Financial Partners. I'm reaching out because you expressed interest in building tax-advantaged wealth through life insurance. This is one of the most powerful financial tools available, and I'm excited to share how it works. Do you have about 20 minutes?"

QUALIFY THE PROSPECT:
IUL is not for everyone. Qualify first:
1. "Are you currently maxing out your 401(k) or IRA contributions?"
2. "Are you in a higher tax bracket - earning over [$150K] annually?"
3. "Are you looking for both protection AND wealth building?"
4. "Do you have at least [$300-500/month] to commit to premiums?"

EXPLAIN THE CONCEPT:
"Let me explain why high-income earners love IUL:

You know how your 401(k) or IRA has contribution limits and you'll pay taxes when you withdraw? IUL has NO contribution limits and the money grows tax-FREE.

Here's how it works:
1. You pay premiums into a permanent life insurance policy
2. Part of that premium goes to life insurance coverage
3. The rest goes into a cash value account
4. That cash value grows based on stock market indexes (like the S&P 500)
5. BUT - and this is the key - you have a 0% floor. When the market drops, you don't lose money."

KEY BENEFITS:
"What makes IUL special:
✓ Tax-free growth (no capital gains taxes)
✓ Tax-free access (borrow against cash value with no taxes)
✓ No contribution limits (unlike 401k/IRA)
✓ Downside protection (0% floor when market crashes)
✓ Permanent death benefit for your family
✓ Asset protection in many states"

DISCOVERY FOR ILLUSTRATION:
1. "What's your monthly budget for this strategy?"
2. "When do you plan to retire?"
3. "How much life insurance coverage do you need?"
4. "Are you comfortable with some market-linked growth?"

PRESENT ILLUSTRATION:
"Based on funding this at [$XXX/month], here's what your policy could look like:

- By age 50: [$XXX,XXX] cash value
- By age 60: [$XXX,XXX] cash value  
- At retirement: [$XX,XXX] per year in tax-free income for 20+ years
- Death benefit: [$X,XXX,XXX] to your family (tax-free)

This is supplemental retirement income that doesn't affect your Social Security or push you into a higher tax bracket."

HANDLE OBJECTIONS:
- "I should just invest in the market" → "You could, but you'd pay capital gains on growth and income tax on withdrawals. Plus, no protection if the market crashes. IUL gives you upside with downside protection."
- "These policies have high fees" → "There are costs, which I'll show you transparently. But when you factor in tax-free growth and withdrawals, most clients come out significantly ahead."

CLOSE:
"The power of IUL is in starting early. Every year you wait is lost compound growth. Let me run a personalized illustration for you - it takes about 10 minutes to gather the info. From there, you can decide if this makes sense for your situation. Fair?"`
  }
];

// ===== IDEAS DEMO DATA =====
const DEMO_IDEAS: AgentIdea[] = [
  { id: 'idea-1', title: 'Mobile app for client check-ins', description: 'A simple mobile app where clients can check their policy status, make payments, and message their agent directly.', category: 'product_idea', priority: 'high', status: 'planned', submittedBy: 'agent-1', submittedByName: 'Sarah Mitchell', submittedDate: '2026-02-15', upvotes: ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'] },
  { id: 'idea-2', title: 'Automated birthday greetings', description: 'Send automated birthday emails/texts to clients with a personal touch. Would help retention and cross-sell opportunities.', category: 'process_improvement', priority: 'medium', status: 'implemented', submittedBy: 'agent-2', submittedByName: 'Marcus Chen', submittedDate: '2026-01-20', upvotes: ['agent-1', 'agent-3', 'agent-6'], adminResponse: 'Great idea! This has been added to the automation engine.', adminRespondedDate: '2026-02-01' },
  { id: 'idea-3', title: 'Quote comparison side-by-side view', description: 'Allow agents to compare quotes from multiple carriers side by side for the same client. Makes it easier to present options.', category: 'feature_request', priority: 'high', status: 'under_review', submittedBy: 'agent-3', submittedByName: 'Emily Davis', submittedDate: '2026-02-28', upvotes: ['agent-1', 'agent-2', 'agent-4', 'agent-5', 'agent-6', 'agent-7'] },
  { id: 'idea-4', title: 'Lead inbox sorting by premium potential', description: 'Add ability to sort leads by estimated premium value so agents can prioritize high-value opportunities.', category: 'feature_request', priority: 'medium', status: 'submitted', submittedBy: 'agent-4', submittedByName: 'Alex Johnson', submittedDate: '2026-03-01', upvotes: ['agent-2', 'agent-5'] },
  { id: 'idea-5', title: 'Weekly team standup template', description: 'Create a standardized template for weekly team standups that tracks wins, blockers, and goals.', category: 'process_improvement', priority: 'low', status: 'submitted', submittedBy: 'agent-5', submittedByName: 'Jordan Taylor', submittedDate: '2026-03-03', upvotes: ['agent-1'] },
  { id: 'idea-6', title: 'Client document upload portal', description: 'Allow clients to upload required documents (ID, medical records) directly through a secure portal instead of email.', category: 'product_idea', priority: 'high', status: 'under_review', submittedBy: 'agent-1', submittedByName: 'Sarah Mitchell', submittedDate: '2026-02-20', upvotes: ['agent-2', 'agent-3', 'agent-4'] },
  { id: 'idea-7', title: 'Fix calendar sync with Google', description: 'Google Calendar sync sometimes duplicates appointments. Need to investigate and fix the integration.', category: 'bug_report', priority: 'critical', status: 'planned', submittedBy: 'agent-6', submittedByName: 'Rachel Kim', submittedDate: '2026-02-25', upvotes: ['agent-1', 'agent-2', 'agent-3'] },
];

// ===== BOOK OF BUSINESS DEMO DATA =====
const DEMO_BOOK_OF_BUSINESS: BookOfBusinessClient[] = [
  { id: 'bob-1', leadId: 'lead-1', name: 'Robert Thompson', email: 'robert.t@email.com', phone: '(555) 123-4567', dateOfBirth: '1985-06-15', ssn: '412-68-4567', state: 'FL', idType: 'drivers_license', idNumber: 'T123-456-85-061', idState: 'FL', idExpiration: '2028-06-15', bankName: 'Chase Bank', bankRoutingNumber: '021000021', bankAccountNumber: '384729104892', beneficiaries: [{ id: 'ben-1', name: 'Sarah Thompson', relationship: 'Spouse', percentage: 70 }, { id: 'ben-2', name: 'Emily Thompson', relationship: 'Daughter', percentage: 30 }], medicalInfo: { tobaccoUse: false, height: '5\'11"', weight: '185 lbs', healthConditions: 'None', medications: 'None' }, policyNumber: 'POL-2026-001', policyType: 'Term Life', carrier: 'Pacific Life', coverageAmount: 500000, monthlyPremium: 89.50, draftDate: '15', commissionRate: 75, policyEffectiveDate: '2026-01-15', policyExpirationDate: '2046-01-15', notes: 'Prefers communication by email. Has 2 dependents.', clientStatus: 'active', lastContactDate: '2026-02-28', activityHistory: [{ id: 'a1', type: 'call', notes: 'Annual review call - client satisfied', date: '2026-02-28', agentId: 'agent-1' }], agentId: 'agent-1', addedDate: '2026-01-15' },
  { id: 'bob-2', name: 'Maria Garcia', email: 'maria.g@email.com', phone: '(555) 234-5678', dateOfBirth: '1978-11-22', ssn: '538-21-5678', state: 'TX', idType: 'drivers_license', idNumber: '28473651', idState: 'TX', idExpiration: '2027-11-22', bankName: 'Bank of America', bankRoutingNumber: '111000025', bankAccountNumber: '629184037231', beneficiaries: [{ id: 'ben-3', name: 'Carlos Garcia', relationship: 'Spouse', percentage: 100 }], medicalInfo: { tobaccoUse: false, height: '5\'4"', weight: '140 lbs', healthConditions: 'Mild asthma', medications: 'Albuterol inhaler (as needed)' }, policyNumber: 'POL-2026-002', policyType: 'Whole Life', carrier: 'MassMutual', coverageAmount: 250000, monthlyPremium: 345.00, draftDate: '1', commissionRate: 105, policyEffectiveDate: '2026-02-01', notes: 'Business owner, interested in cash value growth.', clientStatus: 'active', lastContactDate: '2026-03-01', activityHistory: [{ id: 'a2', type: 'email', notes: 'Sent policy documents', date: '2026-02-01', agentId: 'agent-1' }], agentId: 'agent-1', addedDate: '2026-02-01' },
  { id: 'bob-3', name: 'James Wilson', email: 'j.wilson@email.com', phone: '(555) 345-6789', dateOfBirth: '1990-03-08', ssn: '623-44-6789', state: 'CA', idType: 'drivers_license', idNumber: 'W1234567', idState: 'CA', idExpiration: '2029-03-08', bankName: 'Wells Fargo', bankRoutingNumber: '121000248', bankAccountNumber: '7301948256', beneficiaries: [{ id: 'ben-4', name: 'Linda Wilson', relationship: 'Mother', percentage: 50 }, { id: 'ben-5', name: 'Mark Wilson', relationship: 'Brother', percentage: 50 }], medicalInfo: { tobaccoUse: false, height: '6\'1"', weight: '195 lbs' }, policyNumber: 'POL-2026-003', policyType: 'IUL', carrier: 'Nationwide', coverageAmount: 750000, monthlyPremium: 520.00, draftDate: '20', commissionRate: 90, policyEffectiveDate: '2026-01-20', clientStatus: 'active', lastContactDate: '2026-02-15', activityHistory: [], agentId: 'agent-1', addedDate: '2026-01-20' },
  { id: 'bob-4', name: 'Angela Brown', email: 'a.brown@email.com', phone: '(555) 456-7890', dateOfBirth: '1955-09-30', ssn: '251-73-7890', state: 'GA', idType: 'state_id', idNumber: '045678901', idState: 'GA', idExpiration: '2027-09-30', bankName: 'SunTrust', bankRoutingNumber: '061000104', bankAccountNumber: '501384729', beneficiaries: [{ id: 'ben-6', name: 'Terrence Brown', relationship: 'Son', percentage: 50 }, { id: 'ben-7', name: 'Keisha Brown', relationship: 'Daughter', percentage: 50 }], medicalInfo: { tobaccoUse: false, height: '5\'6"', weight: '165 lbs', healthConditions: 'Type 2 Diabetes, Hypertension', medications: 'Metformin 500mg, Lisinopril 10mg' }, policyNumber: 'POL-2026-004', policyType: 'Final Expense', carrier: 'Mutual of Omaha', coverageAmount: 25000, monthlyPremium: 65.00, draftDate: '10', commissionRate: 110, policyEffectiveDate: '2026-02-10', notes: 'Fixed income, called from mailer campaign.', clientStatus: 'pending', lastContactDate: '2026-03-02', activityHistory: [], agentId: 'agent-1', addedDate: '2026-02-10' },
  { id: 'bob-5', name: 'David Kim', email: 'd.kim@email.com', phone: '(555) 567-8901', dateOfBirth: '1992-01-17', ssn: '078-35-8901', state: 'NY', idType: 'drivers_license', idNumber: '519-284-792', idState: 'NY', idExpiration: '2028-01-17', bankName: 'Citibank', bankRoutingNumber: '021000089', bankAccountNumber: '4829301756', policyNumber: 'POL-2026-005', policyType: 'Mortgage Protection', carrier: 'Transamerica', coverageAmount: 400000, monthlyPremium: 125.00, draftDate: '5', commissionRate: 80, policyEffectiveDate: '2026-01-05', clientStatus: 'chargeback', chargebackDate: '2026-02-20', chargebackReason: 'Client cancelled within free look period', lastContactDate: '2026-02-20', activityHistory: [{ id: 'a3', type: 'call', notes: 'Client decided to cancel - financial hardship', date: '2026-02-20', agentId: 'agent-1' }], agentId: 'agent-1', addedDate: '2026-01-05' },
  { id: 'bob-6', name: 'Lisa Chen', email: 'l.chen@email.com', phone: '(555) 678-9012', dateOfBirth: '1988-07-04', ssn: '614-52-9012', state: 'WA', idType: 'drivers_license', idNumber: 'CHENLA461BQ', idState: 'WA', idExpiration: '2030-07-04', bankName: 'US Bank', bankRoutingNumber: '125000024', bankAccountNumber: '1038295561', beneficiaries: [{ id: 'ben-8', name: 'Wei Chen', relationship: 'Spouse', percentage: 100 }], medicalInfo: { tobaccoUse: false, height: '5\'5"', weight: '125 lbs', healthConditions: 'None', medications: 'None' }, policyNumber: 'POL-2026-006', policyType: 'Term Life', carrier: 'Banner Life', coverageAmount: 1000000, monthlyPremium: 142.00, draftDate: '1', commissionRate: 75, policyEffectiveDate: '2026-03-01', clientStatus: 'pending', lastContactDate: '2026-03-04', activityHistory: [], agentId: 'agent-1', addedDate: '2026-03-01' },
  { id: 'bob-7', name: 'Michael Davis', email: 'm.davis@email.com', phone: '(555) 789-0123', dateOfBirth: '1970-12-25', ssn: '329-86-0123', state: 'IL', idType: 'drivers_license', idNumber: 'D600-1225-7012', idState: 'IL', idExpiration: '2028-12-25', bankName: 'Wells Fargo', bankRoutingNumber: '071000013', bankAccountNumber: '8204613390', beneficiaries: [{ id: 'ben-9', name: 'Patricia Davis', relationship: 'Spouse', percentage: 60 }, { id: 'ben-10', name: 'Michael Davis Jr.', relationship: 'Son', percentage: 40 }], medicalInfo: { tobaccoUse: true, height: '5\'10"', weight: '210 lbs', healthConditions: 'High cholesterol', medications: 'Atorvastatin 20mg' }, policyNumber: 'POL-2026-007', policyType: 'Annuity', carrier: 'Athene', coverageAmount: 100000, monthlyPremium: 833.33, draftDate: '1', commissionRate: 6, policyEffectiveDate: '2025-12-01', notes: 'Retirement planning focus. Rolling over 401k.', clientStatus: 'active', lastContactDate: '2026-02-10', activityHistory: [{ id: 'a4', type: 'meeting', notes: 'Quarterly review meeting', date: '2026-02-10', agentId: 'agent-1' }], agentId: 'agent-1', addedDate: '2025-12-01' },
  { id: 'bob-8', name: 'Jennifer Lopez', email: 'j.lopez@email.com', phone: '(555) 890-1234', dateOfBirth: '1982-04-11', ssn: '457-19-1234', state: 'AZ', idType: 'drivers_license', idNumber: 'D08421234', idState: 'AZ', idExpiration: '2029-04-11', bankName: 'TD Bank', bankRoutingNumber: '031101266', bankAccountNumber: '2749058812', beneficiaries: [{ id: 'ben-11', name: 'Anthony Lopez', relationship: 'Spouse', percentage: 50 }, { id: 'ben-12', name: 'Sofia Lopez', relationship: 'Daughter', percentage: 25 }, { id: 'ben-13', name: 'Diego Lopez', relationship: 'Son', percentage: 25 }], medicalInfo: { tobaccoUse: false, height: '5\'7"', weight: '145 lbs', healthConditions: 'None', medications: 'Birth control' }, policyNumber: 'POL-2026-008', policyType: 'Whole Life', carrier: 'New York Life', coverageAmount: 500000, monthlyPremium: 675.00, draftDate: '15', commissionRate: 105, policyEffectiveDate: '2026-02-15', clientStatus: 'active', lastContactDate: '2026-03-03', activityHistory: [], agentId: 'agent-1', addedDate: '2026-02-15' },
  { id: 'bob-9', name: 'Carlos Martinez', email: 'c.martinez@email.com', phone: '(555) 901-2345', dateOfBirth: '1995-08-20', ssn: '583-40-2345', state: 'NV', idType: 'state_id', idNumber: 'NV-9284710', idState: 'NV', idExpiration: '2029-08-20', bankName: 'Capital One', bankRoutingNumber: '051405515', bankAccountNumber: '3810294756', medicalInfo: { tobaccoUse: false, height: '5\'9"', weight: '170 lbs' }, policyNumber: 'POL-2026-009', policyType: 'Term Life', carrier: 'Protective Life', coverageAmount: 300000, monthlyPremium: 55.00, draftDate: '3', commissionRate: 75, policyEffectiveDate: '2026-03-03', clientStatus: 'pending', lastContactDate: '2026-03-04', activityHistory: [], agentId: 'agent-1', addedDate: '2026-03-03' },
];

// ===== RECRUITING DEMO DATA =====
const DEMO_RECRUIT_PROSPECTS: RecruitProspect[] = [
  { id: 'rec-1', name: 'Tyler Brooks', email: 'tyler.b@email.com', phone: '(555) 111-2222', notes: 'Former real estate agent, interested in insurance career', source: 'LinkedIn', approach: 'warm_lead', stage: 'interviewing', lastContactDate: '2026-03-02', nextStepDate: '2026-03-06', nextStepDescription: 'Final interview with manager', recruitedBy: 'agent-1', addedDate: '2026-02-10', stageHistory: [{ id: 'sh-1', from: 'prospect', to: 'contacted', date: '2026-02-12', notes: 'Initial call' }, { id: 'sh-2', from: 'contacted', to: 'applied', date: '2026-02-18' }, { id: 'sh-3', from: 'applied', to: 'interviewing', date: '2026-02-25' }] },
  { id: 'rec-2', name: 'Amanda Price', email: 'a.price@email.com', phone: '(555) 222-3333', notes: 'Referred by existing agent Marcus Chen', source: 'Agent Referral', approach: 'referral', stage: 'applied', lastContactDate: '2026-03-01', nextStepDate: '2026-03-07', nextStepDescription: 'Schedule phone screen', recruitedBy: 'agent-1', addedDate: '2026-02-20', stageHistory: [{ id: 'sh-4', from: 'prospect', to: 'contacted', date: '2026-02-22' }, { id: 'sh-5', from: 'contacted', to: 'applied', date: '2026-02-28' }] },
  { id: 'rec-3', name: 'Derek Washington', email: 'd.wash@email.com', phone: '(555) 333-4444', source: 'Job Fair', approach: 'cold_outreach', stage: 'contacted', lastContactDate: '2026-02-28', nextStepDate: '2026-03-05', nextStepDescription: 'Follow up call', recruitedBy: 'agent-1', addedDate: '2026-02-25', stageHistory: [{ id: 'sh-6', from: 'prospect', to: 'contacted', date: '2026-02-28' }] },
  { id: 'rec-4', name: 'Samantha Reed', email: 's.reed@email.com', phone: '(555) 444-5555', notes: 'Has Series 6 license, looking to transition', source: 'Indeed', approach: 'cold_outreach', stage: 'prospect', recruitedBy: 'agent-1', addedDate: '2026-03-01', stageHistory: [] },
  { id: 'rec-5', name: 'Kevin Patel', email: 'k.patel@email.com', phone: '(555) 555-6666', notes: 'Successfully onboarded, completing training', source: 'Referral', approach: 'referral', stage: 'onboarding', lastContactDate: '2026-03-03', recruitedBy: 'agent-1', addedDate: '2026-01-15', stageHistory: [{ id: 'sh-7', from: 'prospect', to: 'contacted', date: '2026-01-18' }, { id: 'sh-8', from: 'contacted', to: 'applied', date: '2026-01-22' }, { id: 'sh-9', from: 'applied', to: 'interviewing', date: '2026-01-28' }, { id: 'sh-10', from: 'interviewing', to: 'onboarding', date: '2026-02-10' }] },
  { id: 'rec-6', name: 'Natalie Gomez', email: 'n.gomez@email.com', phone: '(555) 666-7777', source: 'Social Media', approach: 'warm_lead', stage: 'active', lastContactDate: '2026-03-01', recruitedBy: 'agent-1', addedDate: '2025-11-15', stageHistory: [{ id: 'sh-11', from: 'prospect', to: 'contacted', date: '2025-11-18' }, { id: 'sh-12', from: 'contacted', to: 'applied', date: '2025-11-25' }, { id: 'sh-13', from: 'applied', to: 'interviewing', date: '2025-12-02' }, { id: 'sh-14', from: 'interviewing', to: 'onboarding', date: '2025-12-15' }, { id: 'sh-15', from: 'onboarding', to: 'active', date: '2026-01-10' }] },
  { id: 'rec-7', name: 'Brian Foster', email: 'b.foster@email.com', phone: '(555) 777-8888', notes: 'Met at insurance conference', source: 'Conference', approach: 'warm_lead', stage: 'prospect', recruitedBy: 'agent-1', addedDate: '2026-03-04', stageHistory: [] },
];

const DEMO_REFERRAL_LINK: ReferralLink = {
  code: 'HERITAGE-SM2026',
  url: 'https://heritagels.org/agents/register?ref=HERITAGE-SM2026',
  clicks: 47,
  conversions: 3,
};

const DEMO_DOWNLINE_AGENTS: DownlineAgent[] = [
  { id: 'dl-1', name: 'Natalie Gomez', email: 'n.gomez@email.com', phone: '(555) 666-7777', status: 'active', stateLicensed: 'Illinois', applicationStage: 'activated', dateJoined: '2026-01-10', productionVolume: 28400, overrideEarnings: 1136 },
  { id: 'dl-2', name: 'Marcus Chen', email: 'm.chen@heritage.com', phone: '(555) 201-4455', status: 'active', stateLicensed: 'California', applicationStage: 'activated', dateJoined: '2025-09-15', productionVolume: 45200, overrideEarnings: 1808 },
  { id: 'dl-3', name: 'Rachel Kim', email: 'r.kim@heritage.com', phone: '(555) 302-5566', status: 'active', stateLicensed: 'Texas', applicationStage: 'activated', dateJoined: '2025-11-01', productionVolume: 31800, overrideEarnings: 1272 },
  { id: 'dl-4', name: 'James Okafor', email: 'j.okafor@heritage.com', phone: '(555) 403-6677', status: 'active', stateLicensed: 'Florida', applicationStage: 'activated', dateJoined: '2025-12-05', productionVolume: 18600, overrideEarnings: 744 },
  { id: 'dl-5', name: 'Sarah Mitchell', email: 's.mitchell@heritage.com', phone: '(555) 504-7788', status: 'probation', stateLicensed: 'Georgia', applicationStage: 'activated', dateJoined: '2026-02-01', productionVolume: 4200, overrideEarnings: 168 },
  { id: 'dl-6', name: 'David Park', email: 'd.park@heritage.com', phone: '(555) 605-8899', status: 'inactive', stateLicensed: 'New York', applicationStage: 'approved', dateJoined: '2025-08-20', productionVolume: 0, overrideEarnings: 0 },
  { id: 'dl-7', name: 'Lisa Rodriguez', email: 'l.rodriguez@heritage.com', phone: '(555) 706-9900', status: 'active', stateLicensed: 'Arizona', applicationStage: 'activated', dateJoined: '2025-10-10', productionVolume: 22100, overrideEarnings: 884 },
  { id: 'dl-8', name: 'Mike Thompson', email: 'm.thompson@heritage.com', phone: '(555) 807-1122', status: 'active', stateLicensed: 'Ohio', applicationStage: 'activated', dateJoined: '2025-07-15', productionVolume: 38900, overrideEarnings: 1556 },
  { id: 'dl-9', name: 'Priya Sharma', email: 'p.sharma@heritage.com', phone: '(555) 908-2233', status: 'active', stateLicensed: 'Virginia', applicationStage: 'activated', dateJoined: '2026-01-20', productionVolume: 12800, overrideEarnings: 512 },
  { id: 'dl-10', name: 'Chris Walker', email: 'c.walker@heritage.com', phone: '(555) 109-3344', status: 'active', stateLicensed: 'Colorado', applicationStage: 'activated', dateJoined: '2025-06-01', productionVolume: 41500, overrideEarnings: 1660 },
];

const DEMO_FUNNEL_DATA: FunnelStageData[] = [
  { stage: 'link_clicked', count: 145, conversionRate: 100 },
  { stage: 'application_started', count: 89, conversionRate: 61.4 },
  { stage: 'application_submitted', count: 62, conversionRate: 69.7 },
  { stage: 'background_check', count: 48, conversionRate: 77.4 },
  { stage: 'contract_signed', count: 38, conversionRate: 79.2 },
  { stage: 'agent_approved', count: 32, conversionRate: 84.2 },
  { stage: 'agent_activated', count: 24, conversionRate: 75.0 },
];

const DEMO_AUTOMATION_STEPS: RecruitingAutomationStep[] = [
  { id: 'auto-1', stepNumber: 1, title: 'Agent Shares Referral Link', description: 'Your personalized referral link is generated and ready to share across channels.', type: 'automated', estimatedTime: 'Instant' },
  { id: 'auto-2', stepNumber: 2, title: 'Prospect Clicks Link', description: 'Prospect visits your landing page. Click tracked automatically.', type: 'automated', estimatedTime: 'Instant' },
  { id: 'auto-3', stepNumber: 3, title: 'Prospect Fills Application', description: 'Prospect completes the application form with personal details and experience.', type: 'user_input', estimatedTime: '10-15 min' },
  { id: 'auto-4', stepNumber: 4, title: 'Application Auto-Submitted', description: 'Application is validated and submitted to the review queue automatically.', type: 'automated', estimatedTime: 'Instant' },
  { id: 'auto-5', stepNumber: 5, title: 'Background Check Initiated', description: 'Third-party background verification is triggered automatically.', type: 'automated', estimatedTime: '2-3 days' },
  { id: 'auto-6', stepNumber: 6, title: 'Background Check Review', description: 'Compliance team reviews the background check results and flags any issues.', type: 'manual_review', estimatedTime: '1-2 days' },
  { id: 'auto-7', stepNumber: 7, title: 'Contract Generated & Sent', description: 'Agent agreement is generated from template and sent for e-signature.', type: 'automated', estimatedTime: 'Instant' },
  { id: 'auto-8', stepNumber: 8, title: 'Prospect Signs Contract', description: 'Prospect reviews and signs the agent agreement electronically.', type: 'user_input', estimatedTime: '1-3 days' },
  { id: 'auto-9', stepNumber: 9, title: 'Onboarding Materials Sent', description: 'Training portal access, welcome kit, and orientation schedule sent automatically.', type: 'automated', estimatedTime: 'Instant' },
  { id: 'auto-10', stepNumber: 10, title: 'Agent Activated', description: 'Agent is fully onboarded, licensed, and activated in the system.', type: 'automated', estimatedTime: 'Instant' },
];

interface AgentStore {
  currentUser: AgentUser | null;
  theme: 'light' | 'dark';
  announcements: Announcement[];
  tasks: Task[];
  leads: Lead[];
  courses: TrainingCourse[];
  sops: SOP[];
  performance: PerformanceMetrics;
  earnings: EarningEntry[];
  scripts: Script[];
  leaderboard: LeaderboardEntry[];
  achievements: Achievement[];
  quickActions: QuickAction[];
  notifications: AgentNotification[];
  activities: ActivityItem[];
  dailyChallenges: DailyChallenge[];
  quotes: Quote[];
  ideas: AgentIdea[];
  bookOfBusiness: BookOfBusinessClient[];
  recruitProspects: RecruitProspect[];
  referralLink: ReferralLink;
  downlineAgents: DownlineAgent[];
  funnelData: FunnelStageData[];
  automationSteps: RecruitingAutomationStep[];
  xpGain: { amount: number; reason: string; type: string } | null;
  levelUp: number | null;
  websiteSettings: AgentWebsiteSettings;
  websiteStats: { pageViews: number; pageViewsToday: number; pageViewsThisWeek: number; pageViewsThisMonth: number; leadsGenerated: number; conversionRate: number } | null;
  // Website Settings
  updateWebsiteSettings: (updates: Partial<AgentWebsiteSettings>) => void;
  saveWebsiteSettings: (agentSlug: string, settings: Partial<AgentWebsiteSettings>) => Promise<void>;
  fetchWebsiteSettings: (agentSlug: string) => Promise<void>;
  fetchWebsiteStats: (agentSlug: string) => Promise<void>;
  // Recruiting Settings
  recruitingSettings: AgentRecruitingSettings;
  recruitingStats: { pageViews: number; applications: number; conversionRate: number } | null;
  updateRecruitingSettings: (updates: Partial<AgentRecruitingSettings>) => void;
  saveRecruitingSettings: (agentSlug: string, settings: Partial<AgentRecruitingSettings>) => Promise<void>;
  fetchRecruitingSettings: (agentSlug: string) => Promise<void>;
  fetchRecruitingStats: (agentSlug: string) => Promise<void>;
  // Ideas & Feedback
  submitIdea: (idea: Omit<AgentIdea, 'id' | 'submittedBy' | 'submittedByName' | 'submittedDate' | 'upvotes' | 'status'>) => void;
  upvoteIdea: (ideaId: string) => void;
  removeUpvote: (ideaId: string) => void;
  // Book of Business
  getBookOfBusinessStats: () => { totalClients: number; activePolicies: number; totalMonthlyPremium: number; chargebackCount: number };
  addClientToBook: (client: Omit<BookOfBusinessClient, 'id' | 'agentId' | 'addedDate' | 'activityHistory'>) => void;
  updateClientStatus: (clientId: string, status: ClientStatus, reason?: string) => void;
  addClientActivity: (clientId: string, activity: Omit<ActivityLog, 'id' | 'date' | 'agentId'>) => void;
  graduateLeadToBook: (leadId: string) => void;
  // Recruiting
  getRecruitingStats: () => { totalRecruited: number; activeDownlines: number; pendingApplications: number; pipelineCount: number };
  getRecruitingOverviewStats: () => RecruitingOverviewStats;
  getRecruitingFunnelStats: () => { funnelData: FunnelStageData[]; dropOffRate: number; avgTimeToActivation: string; topSource: string };
  getDownlineStats: () => { totalDownlines: number; activeDownlines: number; totalVolume: number; totalOverride: number };
  getAutomationStats: () => { automationRate: number; manualSteps: number; timeSaved: string };
  addRecruitProspect: (prospect: Omit<RecruitProspect, 'id' | 'recruitedBy' | 'addedDate' | 'stageHistory' | 'stage'>) => void;
  updateRecruitStage: (prospectId: string, stage: RecruitingStage, notes?: string) => void;
  deleteRecruitProspect: (prospectId: string) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<AgentUser, 'name' | 'email' | 'phone' | 'npn'>>) => void;
  createOrUpdateProfile: (profile: { name: string; email: string; phone: string; npn?: string }) => void;
  toggleTheme: () => void;
  completeTask: (taskId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'assignedTo' | 'completed'>) => void;
  addActivityToLead: (leadId: string, activity: Omit<ActivityLog, 'id' | 'date' | 'agentId'>) => void;
  updateLeadStatus: (leadId: string, status: Lead['status']) => void;
  addLead: (lead: Omit<Lead, 'id' | 'createdDate' | 'notes' | 'assignedTo'>) => void;
  completeModule: (courseId: string, moduleId: string) => void;
  updatePerformance: (updates: Partial<PerformanceMetrics>) => void;
  incrementStreak: () => void;
  addXP: (amount: number, reason: string, type?: string) => void;
  clearXPGain: () => void;
  clearLevelUp: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;
  logCall: (data: { leadId?: string; duration: number; disposition: string; notes: string }) => void;
  addQuote: (quote: Omit<Quote, 'id' | 'createdDate' | 'expiresDate' | 'agentId' | 'status'>) => void;
  updateQuoteStatus: (quoteId: string, status: Quote['status']) => void;
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  // Lead enhancements
  updateLeadNotes: (leadId: string, notes: string) => void;
  addTagToLead: (leadId: string, tag: string) => void;
  removeTagFromLead: (leadId: string, tag: string) => void;
  addLeadReminder: (leadId: string, reminder: Omit<LeadReminder, 'id' | 'completed'>) => void;
  completeReminder: (leadId: string, reminderId: string) => void;
  bulkUpdateLeadStatus: (leadIds: string[], status: Lead['status']) => void;
  importLeads: (leads: Omit<Lead, 'id' | 'createdDate' | 'notes' | 'assignedTo' | 'statusHistory'>[]) => void;
  fetchWebsiteLeads: (agentSlug: string) => Promise<void>;
  fetchReferralLeads: () => Promise<void>;
  deleteLeads: (leadIds: string[]) => void;
  // Quote enhancements
  createQuoteVersion: (quoteId: string) => void;
  updateQuoteSignature: (quoteId: string, status: Quote['signatureStatus']) => void;
  // AgentOS Stage 1 - Follow-up enforcement & Policy tracking
  getOverdueLeads: () => Lead[];
  getLeadsDueToday: () => Lead[];
  getLeadsDueThisWeek: () => Lead[];
  getLeadsWithNoFollowUp: () => Lead[];
  updateLeadFollowUp: (leadId: string, date: string, type: Lead['nextFollowUpType']) => void;
  updatePolicyStatus: (leadId: string, status: Lead['policyStatus'], notes?: string) => void;
  // AgentOS Stage 2 - Intelligence Assist
  calculateLeadUrgencyScore: (lead: Lead) => { score: number; reasons: string[] };
  getDailyPriorityList: () => Array<{ lead: Lead; score: number; reasons: string[]; callReason: string }>;
  getMissedCallAlerts: () => Array<{ lead: Lead; daysMissed: number; lastContact: string | null }>;
  getAppointmentReadiness: (lead: Lead) => { ready: boolean; missing: string[]; score: number };
  getCloseRateStats: () => {
    overall: number;
    byStage: Record<string, number>;
    trend: 'up' | 'down' | 'stable';
    thisMonth: number;
    lastMonth: number;
    leadsInPipeline: number;
    projectedCloses: number;
  };
  // AgentOS Stage 3 - Assisted Execution
  getSuggestedTemplate: (lead: Lead) => { templateId: string; reason: string } | null;
  generateCallSummary: (lead: Lead, notes: string, disposition: string) => string;
  scheduleAppointment: (leadId: string, appointment: Omit<Appointment, 'id' | 'status' | 'reminderSent'>) => void;
  updateAppointmentStatus: (leadId: string, appointmentId: string, status: Appointment['status']) => void;
  getRenewalAlerts: () => Array<{ lead: Lead; daysUntilExpiration: number; product: string }>;
  getCrossSellOpportunities: (lead: Lead) => CrossSellOpportunity[];
  dismissCrossSell: (leadId: string, opportunityId: string) => void;
  convertCrossSellToLead: (leadId: string, opportunityId: string) => void;
  getUpcomingAppointments: () => Array<{ lead: Lead; appointment: Appointment }>;
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      theme: 'light',
      announcements: DEMO_ANNOUNCEMENTS,
      tasks: DEMO_TASKS,
      leads: DEMO_LEADS,
      courses: DEMO_COURSES,
      sops: DEMO_SOPS,
      performance: DEMO_PERFORMANCE,
      earnings: DEMO_EARNINGS,
      scripts: DEMO_SCRIPTS,
      leaderboard: DEMO_LEADERBOARD,
      achievements: DEMO_ACHIEVEMENTS,
      quickActions: DEMO_QUICK_ACTIONS,
      notifications: DEMO_NOTIFICATIONS,
      activities: DEMO_ACTIVITIES,
      dailyChallenges: DEMO_DAILY_CHALLENGES,
      quotes: [],
      ideas: DEMO_IDEAS,
      bookOfBusiness: DEMO_BOOK_OF_BUSINESS,
      recruitProspects: DEMO_RECRUIT_PROSPECTS,
      referralLink: DEMO_REFERRAL_LINK,
      downlineAgents: DEMO_DOWNLINE_AGENTS,
      funnelData: DEMO_FUNNEL_DATA,
      automationSteps: DEMO_AUTOMATION_STEPS,
      xpGain: null,
      levelUp: null,
      websiteSettings: {
        featuredProducts: ['term_life', 'whole_life', 'iul', 'final_expense', 'annuities'],
        showTestimonials: true,
        showFaq: true,
        showCarriers: true,
        showScheduleCall: true,
      },
      websiteStats: null,
      recruitingSettings: {
        showTestimonials: true,
        showFaq: true,
        showCommissionTable: true,
        showSteps: true,
      },
      recruitingStats: null,

      // ===== WEBSITE SETTINGS ACTIONS =====
      updateWebsiteSettings: (updates) => {
        const { websiteSettings } = get();
        set({ websiteSettings: { ...websiteSettings, ...updates } });
      },

      saveWebsiteSettings: async (agentSlug, settings) => {
        try {
          await fetch(`/api/website-settings/${agentSlug}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
          });
        } catch (err) {
          console.error('[AgentStore] Failed to save website settings:', err);
        }
      },

      fetchWebsiteSettings: async (agentSlug) => {
        try {
          const res = await fetch(`/api/website-settings/${agentSlug}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data) {
            const updates: Partial<AgentWebsiteSettings> = {};
            if (data.headline) updates.headline = data.headline;
            if (data.tagline) updates.tagline = data.tagline;
            if (data.bio) updates.bio = data.bio;
            if (data.featuredProducts) updates.featuredProducts = data.featuredProducts;
            if (data.showTestimonials !== undefined) updates.showTestimonials = data.showTestimonials;
            if (data.showFaq !== undefined) updates.showFaq = data.showFaq;
            if (data.showCarriers !== undefined) updates.showCarriers = data.showCarriers;
            if (data.showScheduleCall !== undefined) updates.showScheduleCall = data.showScheduleCall;
            const { websiteSettings } = get();
            set({ websiteSettings: { ...websiteSettings, ...updates } });
          }
        } catch (err) {
          console.error('[AgentStore] Failed to fetch website settings:', err);
        }
      },

      fetchWebsiteStats: async (agentSlug) => {
        try {
          const res = await fetch(`/api/agent-stats/${agentSlug}`);
          if (!res.ok) return;
          const data = await res.json();
          set({ websiteStats: data });
        } catch (err) {
          console.error('[AgentStore] Failed to fetch website stats:', err);
        }
      },

      // ===== RECRUITING SETTINGS ACTIONS =====
      updateRecruitingSettings: (updates) => {
        const { recruitingSettings } = get();
        set({ recruitingSettings: { ...recruitingSettings, ...updates } });
      },

      saveRecruitingSettings: async (agentSlug, settings) => {
        try {
          await fetch(`/api/recruiting-settings/${agentSlug}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
          });
        } catch (err) {
          console.error('[AgentStore] Failed to save recruiting settings:', err);
        }
      },

      fetchRecruitingSettings: async (agentSlug) => {
        try {
          const res = await fetch(`/api/recruiting-settings/${agentSlug}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data) {
            const updates: Partial<AgentRecruitingSettings> = {};
            if (data.headline) updates.headline = data.headline;
            if (data.subheadline) updates.subheadline = data.subheadline;
            if (data.showTestimonials !== undefined) updates.showTestimonials = data.showTestimonials;
            if (data.showFaq !== undefined) updates.showFaq = data.showFaq;
            if (data.showCommissionTable !== undefined) updates.showCommissionTable = data.showCommissionTable;
            if (data.showSteps !== undefined) updates.showSteps = data.showSteps;
            const { recruitingSettings } = get();
            set({ recruitingSettings: { ...recruitingSettings, ...updates } });
          }
        } catch (err) {
          console.error('[AgentStore] Failed to fetch recruiting settings:', err);
        }
      },

      fetchRecruitingStats: async (agentSlug) => {
        try {
          const res = await fetch(`/api/recruiting-stats/${agentSlug}`);
          if (!res.ok) return;
          const data = await res.json();
          set({ recruitingStats: data });
        } catch (err) {
          console.error('[AgentStore] Failed to fetch recruiting stats:', err);
        }
      },

      // ===== IDEAS & FEEDBACK ACTIONS =====
      submitIdea: (idea) => {
        const state = get();
        const newIdea: AgentIdea = {
          ...idea,
          id: `idea-${Date.now()}`,
          submittedBy: state.currentUser?.id || 'agent-1',
          submittedByName: state.currentUser?.name || 'Agent',
          submittedDate: new Date().toISOString().split('T')[0],
          upvotes: [],
          status: 'submitted',
        };
        set({ ideas: [newIdea, ...state.ideas] });
      },
      upvoteIdea: (ideaId) => {
        const state = get();
        const userId = state.currentUser?.id || 'agent-1';
        set({
          ideas: state.ideas.map(idea =>
            idea.id === ideaId && !idea.upvotes.includes(userId)
              ? { ...idea, upvotes: [...idea.upvotes, userId] }
              : idea
          ),
        });
      },
      removeUpvote: (ideaId) => {
        const state = get();
        const userId = state.currentUser?.id || 'agent-1';
        set({
          ideas: state.ideas.map(idea =>
            idea.id === ideaId
              ? { ...idea, upvotes: idea.upvotes.filter(id => id !== userId) }
              : idea
          ),
        });
      },

      // ===== BOOK OF BUSINESS ACTIONS =====
      getBookOfBusinessStats: () => {
        const state = get();
        const bob = state.bookOfBusiness;
        return {
          totalClients: bob.length,
          activePolicies: bob.filter(c => c.clientStatus === 'active').length,
          totalMonthlyPremium: bob.filter(c => c.clientStatus === 'active').reduce((sum, c) => sum + c.monthlyPremium, 0),
          chargebackCount: bob.filter(c => c.clientStatus === 'chargeback').length,
        };
      },
      addClientToBook: (client) => {
        const state = get();
        const newClient: BookOfBusinessClient = {
          ...client,
          id: `bob-${Date.now()}`,
          agentId: state.currentUser?.id || 'agent-1',
          addedDate: new Date().toISOString().split('T')[0],
          activityHistory: [],
        };
        set({ bookOfBusiness: [newClient, ...state.bookOfBusiness] });
      },
      updateClientStatus: (clientId, status, reason) => {
        const state = get();
        const client = state.bookOfBusiness.find(c => c.id === clientId);
        if (!client) return;

        const updatedBook = state.bookOfBusiness.map(c =>
          c.id === clientId ? {
            ...c,
            clientStatus: status,
            ...(status === 'chargeback' ? { chargebackDate: new Date().toISOString().split('T')[0], chargebackReason: reason } : {}),
          } : c
        );

        const updates: Partial<AgentStore> = { bookOfBusiness: updatedBook };

        // Leaderboard connection: active = official closed deal
        if (status === 'active' && client.clientStatus !== 'active') {
          updates.performance = { ...state.performance, dailyCloses: state.performance.dailyCloses + 1 };
          updates.activities = [{
            id: `act-${Date.now()}`,
            type: 'deal' as const,
            agentName: state.currentUser?.name || 'Agent',
            message: `closed a $${client.coverageAmount.toLocaleString()} ${client.policyType} policy!`,
            timestamp: 'Just now',
            highlight: true,
          }, ...state.activities];
          set(updates);
          state.addXP(100, 'Client activated in Book of Business');
          return;
        }

        // Chargeback: decrement
        if (status === 'chargeback' && client.clientStatus === 'active') {
          updates.performance = { ...state.performance, dailyCloses: Math.max(0, state.performance.dailyCloses - 1) };
        }

        set(updates);
      },
      addClientActivity: (clientId, activity) => {
        const state = get();
        const newActivity: ActivityLog = {
          ...activity,
          id: `act-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          agentId: state.currentUser?.id || 'agent-1',
        };
        set({
          bookOfBusiness: state.bookOfBusiness.map(c =>
            c.id === clientId ? { ...c, activityHistory: [newActivity, ...c.activityHistory], lastContactDate: newActivity.date } : c
          ),
        });
      },
      graduateLeadToBook: (leadId) => {
        const state = get();
        const lead = state.leads.find(l => l.id === leadId);
        if (!lead || lead.status !== 'closed' || lead.policyStatus !== 'issued') return;

        const newClient: BookOfBusinessClient = {
          id: `bob-${Date.now()}`,
          leadId: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          state: lead.state,
          policyNumber: lead.policyNumber || `POL-${Date.now()}`,
          policyType: lead.product || 'Term Life',
          carrier: lead.carrier || 'Unknown',
          coverageAmount: lead.coverageAmount || 0,
          monthlyPremium: lead.monthlyPremium || 0,
          policyEffectiveDate: lead.policyEffectiveDate || new Date().toISOString().split('T')[0],
          policyExpirationDate: lead.policyExpirationDate,
          clientStatus: 'pending',
          lastContactDate: lead.lastContactDate,
          activityHistory: [],
          agentId: state.currentUser?.id || 'agent-1',
          addedDate: new Date().toISOString().split('T')[0],
        };
        set({ bookOfBusiness: [newClient, ...state.bookOfBusiness] });
      },

      // ===== RECRUITING ACTIONS =====
      getRecruitingStats: () => {
        const state = get();
        const prospects = state.recruitProspects;
        return {
          totalRecruited: prospects.filter(p => p.stage === 'active').length,
          activeDownlines: prospects.filter(p => p.stage === 'active').length,
          pendingApplications: prospects.filter(p => p.stage === 'applied' || p.stage === 'interviewing').length,
          pipelineCount: prospects.filter(p => p.stage !== 'active').length,
        };
      },
      addRecruitProspect: (prospect) => {
        const state = get();
        const newProspect: RecruitProspect = {
          ...prospect,
          id: `rec-${Date.now()}`,
          stage: 'prospect',
          recruitedBy: state.currentUser?.id || 'agent-1',
          addedDate: new Date().toISOString().split('T')[0],
          stageHistory: [],
        };
        set({ recruitProspects: [newProspect, ...state.recruitProspects] });
      },
      updateRecruitStage: (prospectId, stage, notes) => {
        const state = get();
        set({
          recruitProspects: state.recruitProspects.map(p => {
            if (p.id !== prospectId) return p;
            const historyEntry = { id: `sh-${Date.now()}`, from: p.stage, to: stage, date: new Date().toISOString().split('T')[0], notes };
            return { ...p, stage, stageHistory: [...p.stageHistory, historyEntry], lastContactDate: new Date().toISOString().split('T')[0] };
          }),
        });
        if (stage === 'active') {
          state.addXP(200, 'New agent recruited!');
        }
      },
      deleteRecruitProspect: (prospectId) => {
        const state = get();
        set({ recruitProspects: state.recruitProspects.filter(p => p.id !== prospectId) });
      },
      getRecruitingOverviewStats: () => {
        const state = get();
        const downlines = state.downlineAgents;
        const activeDownlines = downlines.filter(d => d.status === 'active');
        return {
          totalRecruits: downlines.length,
          pendingApplications: state.recruitProspects.filter(p => p.stage === 'applied' || p.stage === 'interviewing').length,
          approvedAgents: activeDownlines.length,
          monthlyOverrideEarnings: activeDownlines.reduce((sum, d) => sum + d.overrideEarnings, 0),
          totalDownlineVolume: activeDownlines.reduce((sum, d) => sum + d.productionVolume, 0),
        };
      },
      getRecruitingFunnelStats: () => {
        const state = get();
        const funnel = state.funnelData;
        const first = funnel[0]?.count || 1;
        const last = funnel[funnel.length - 1]?.count || 0;
        return {
          funnelData: funnel,
          dropOffRate: Math.round(((first - last) / first) * 100 * 10) / 10,
          avgTimeToActivation: '18 days',
          topSource: 'LinkedIn',
        };
      },
      getDownlineStats: () => {
        const state = get();
        const downlines = state.downlineAgents;
        const active = downlines.filter(d => d.status === 'active');
        return {
          totalDownlines: downlines.length,
          activeDownlines: active.length,
          totalVolume: active.reduce((sum, d) => sum + d.productionVolume, 0),
          totalOverride: active.reduce((sum, d) => sum + d.overrideEarnings, 0),
        };
      },
      getAutomationStats: () => {
        const state = get();
        const steps = state.automationSteps;
        const automated = steps.filter(s => s.type === 'automated').length;
        const manual = steps.filter(s => s.type === 'manual_review').length;
        return {
          automationRate: Math.round((automated / steps.length) * 100),
          manualSteps: manual,
          timeSaved: '12 hrs',
        };
      },

      login: (email: string, password: string) => {
        const user = DEMO_AGENTS.find(a => a.email.toLowerCase() === email.toLowerCase());
        if (user && password === 'agent123') {
          set({ currentUser: user });
          return true;
        }
        if (email.toLowerCase() === 'jack@goldcoastfnl.com' && password === 'exec123') {
          set({ currentUser: DEMO_AGENTS.find(a => a.role === 'executive') || null });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUser: null });
        localStorage.removeItem('agent-lounge-storage-v6');
      },

      updateProfile: (updates) => {
        const { currentUser } = get();
        if (currentUser) {
          // Create a completely new user object to ensure Zustand detects the change
          const updatedUser: AgentUser = {
            id: currentUser.id,
            name: updates.name ?? currentUser.name,
            email: updates.email ?? currentUser.email,
            phone: updates.phone ?? currentUser.phone,
            role: currentUser.role,
            avatar: currentUser.avatar,
            territories: [...currentUser.territories],
            startDate: currentUser.startDate,
            certifications: [...currentUser.certifications],
            badges: [...currentUser.badges],
          };
          set({ currentUser: updatedUser });
        }
      },

      // Creates a new user or updates existing - allows saving without login
      createOrUpdateProfile: (profile) => {
        const { currentUser } = get();
        if (currentUser) {
          // Update existing user
          const updatedUser: AgentUser = {
            ...currentUser,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            npn: profile.npn || currentUser.npn,
          };
          set({ currentUser: updatedUser });
        } else {
          // Create new user with default values
          const newUser: AgentUser = {
            id: `agent-${Date.now()}`,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            npn: profile.npn,
            role: 'agent',
            territories: [],
            startDate: new Date().toISOString().split('T')[0],
            certifications: [],
            badges: [],
          };
          set({ currentUser: newUser });
        }
      },

      toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      completeTask: (taskId: string) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task || task.completed) return;
        
        const xpGain = task.performanceImpact;
        const newXp = state.performance.xp + xpGain;
        const currentLevel = state.performance.level;
        const newLevel = Math.floor(newXp / 1000) + 1;
        
        set({
          tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed: true } : t),
          performance: { 
            ...state.performance, 
            behaviorScore: Math.min(100, state.performance.behaviorScore + task.performanceImpact),
            xp: newXp,
            level: newLevel
          },
          xpGain: { amount: xpGain, reason: 'Task completed', type: 'xp' },
          levelUp: newLevel > currentLevel ? newLevel : null
        });
      },

      addTask: (task: Omit<Task, 'id' | 'assignedTo' | 'completed'>) => {
        const user = get().currentUser;
        set(state => ({
          tasks: [...state.tasks, {
            ...task,
            id: `task-${Date.now()}`,
            assignedTo: user?.id || 'unknown',
            completed: false
          }]
        }));
      },

      addActivityToLead: (leadId: string, activity: Omit<ActivityLog, 'id' | 'date' | 'agentId'>) => {
        const user = get().currentUser;
        set(state => ({
          leads: state.leads.map(lead => 
            lead.id === leadId ? {
              ...lead,
              lastContactDate: new Date().toISOString().split('T')[0],
              notes: [...lead.notes, {
                ...activity,
                id: `log-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                agentId: user?.id || 'unknown'
              }]
            } : lead
          )
        }));
      },

      updateLeadStatus: (leadId: string, status: Lead['status']) => {
        const user = get().currentUser;
        set(state => ({
          leads: state.leads.map(lead => {
            if (lead.id !== leadId) return lead;
            const statusChange: StatusChange = {
              id: `sc-${Date.now()}`,
              from: lead.status,
              to: status,
              date: new Date().toISOString(),
              agentId: user?.id || 'unknown'
            };
            return {
              ...lead,
              status,
              statusHistory: [...(lead.statusHistory || []), statusChange]
            };
          })
        }));
      },

      addLead: (lead: Omit<Lead, 'id' | 'createdDate' | 'notes' | 'assignedTo'>) => {
        const user = get().currentUser;
        const state = get();
        const newXp = state.performance.xp + 15;
        const currentLevel = state.performance.level;
        const newLevel = Math.floor(newXp / 1000) + 1;
        
        set({
          leads: [...state.leads, {
            ...lead,
            id: `lead-${Date.now()}`,
            createdDate: new Date().toISOString().split('T')[0],
            notes: [],
            assignedTo: user?.id || 'unknown'
          }],
          dailyChallenges: state.dailyChallenges.map(dc => 
            dc.type === 'leads' && !dc.completed ? { 
              ...dc, 
              current: dc.current + 1,
              completed: dc.current + 1 >= dc.target 
            } : dc
          ),
          performance: { ...state.performance, xp: newXp, level: newLevel },
          xpGain: { amount: 15, reason: 'Lead added', type: 'xp' },
          levelUp: newLevel > currentLevel ? newLevel : null
        });
      },

      completeModule: (courseId: string, moduleId: string) => {
        set(state => ({
          courses: state.courses.map(course => 
            course.id === courseId ? {
              ...course,
              modules: course.modules.map(mod => 
                mod.id === moduleId ? { ...mod, completed: true } : mod
              )
            } : course
          )
        }));
      },

      updatePerformance: (updates: Partial<PerformanceMetrics>) => {
        set(state => ({
          performance: { ...state.performance, ...updates }
        }));
      },
      
      incrementStreak: () => {
        const state = get();
        const newStreak = state.performance.currentStreak + 1;
        const newXp = state.performance.xp + 25;
        const currentLevel = state.performance.level;
        const newLevel = Math.floor(newXp / 1000) + 1;
        
        set({
          performance: {
            ...state.performance,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, state.performance.longestStreak),
            xp: newXp,
            level: newLevel
          },
          xpGain: { amount: 25, reason: 'Streak continued!', type: 'streak' },
          levelUp: newLevel > currentLevel ? newLevel : null
        });
      },

      addXP: (amount: number, reason: string, type: string = 'xp') => {
        const state = get();
        const newXp = state.performance.xp + amount;
        const currentLevel = state.performance.level;
        const newLevel = Math.floor(newXp / 1000) + 1;
        
        set({
          performance: { ...state.performance, xp: newXp, level: newLevel },
          xpGain: { amount, reason, type },
          levelUp: newLevel > currentLevel ? newLevel : null
        });
      },

      clearXPGain: () => set({ xpGain: null }),
      
      clearLevelUp: () => set({ levelUp: null }),

      markNotificationRead: (id: string) => {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          )
        }));
      },

      markAllNotificationsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        }));
      },

      clearNotification: (id: string) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },

      logCall: (data: { leadId?: string; duration: number; disposition: string; notes: string }) => {
        const state = get();
        const user = state.currentUser;
        const xpAmount = Math.min(data.duration * 2, 20);
        const newXp = state.performance.xp + xpAmount;
        const currentLevel = state.performance.level;
        const newLevel = Math.floor(newXp / 1000) + 1;
        const newCallCount = state.performance.dailyCalls + 1;
        
        let updatedLeads = state.leads;
        if (data.leadId) {
          updatedLeads = state.leads.map(lead => 
            lead.id === data.leadId ? {
              ...lead,
              lastContactDate: new Date().toISOString().split('T')[0],
              notes: [...lead.notes, {
                id: `log-${Date.now()}`,
                type: 'call' as const,
                disposition: data.disposition as ActivityLog['disposition'],
                notes: data.notes,
                date: new Date().toISOString().split('T')[0],
                agentId: user?.id || 'unknown'
              }]
            } : lead
          );
        }
        
        set({
          leads: updatedLeads,
          performance: { 
            ...state.performance, 
            dailyCalls: newCallCount,
            xp: newXp, 
            level: newLevel 
          },
          dailyChallenges: state.dailyChallenges.map(dc => 
            dc.type === 'calls' && !dc.completed ? { 
              ...dc, 
              current: dc.current + 1,
              completed: dc.current + 1 >= dc.target 
            } : dc
          ),
          activities: [
            {
              id: `activity-${Date.now()}`,
              type: 'call',
              agentName: user?.name || 'Unknown',
              message: `logged a ${data.duration}min call`,
              timestamp: new Date().toISOString(),
              highlight: false
            },
            ...state.activities.slice(0, 49)
          ],
          xpGain: { amount: xpAmount, reason: 'Call logged', type: 'xp' },
          levelUp: newLevel > currentLevel ? newLevel : null
        });
      },

      addQuote: (quote: Omit<Quote, 'id' | 'createdDate' | 'expiresDate' | 'agentId' | 'status'>) => {
        const state = get();
        const user = state.currentUser;
        const xpAmount = 25;
        const newXp = state.performance.xp + xpAmount;
        const currentLevel = state.performance.level;
        const newLevel = Math.floor(newXp / 1000) + 1;
        
        const newQuote: Quote = {
          ...quote,
          id: `quote-${Date.now()}`,
          status: 'draft',
          createdDate: new Date().toISOString().split('T')[0],
          expiresDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          agentId: user?.id || 'unknown'
        };
        
        set({
          quotes: [newQuote, ...state.quotes],
          performance: { 
            ...state.performance, 
            xp: newXp, 
            level: newLevel 
          },
          activities: [
            {
              id: `activity-${Date.now()}`,
              type: 'lead',
              agentName: user?.name || 'Unknown',
              message: `created a new quote for ${quote.clientName}`,
              timestamp: new Date().toISOString(),
              highlight: true
            },
            ...state.activities.slice(0, 49)
          ],
          xpGain: { amount: xpAmount, reason: 'Quote created', type: 'xp' },
          levelUp: newLevel > currentLevel ? newLevel : null
        });
      },

      updateQuoteStatus: (quoteId: string, status: Quote['status']) => {
        set(state => ({
          quotes: state.quotes.map(q => 
            q.id === quoteId ? { ...q, status } : q
          )
        }));
      },

      addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
        set(state => ({
          activities: [
            {
              ...activity,
              id: `activity-${Date.now()}`,
              timestamp: new Date().toISOString()
            },
            ...state.activities.slice(0, 49)
          ]
        }));
      },

      // Lead enhancements
      updateLeadNotes: (leadId: string, notes: string) => {
        set(state => ({
          leads: state.leads.map(lead =>
            lead.id === leadId ? { ...lead, leadNotes: notes } : lead
          )
        }));
      },

      addTagToLead: (leadId: string, tag: string) => {
        set(state => ({
          leads: state.leads.map(lead =>
            lead.id === leadId
              ? { ...lead, tags: [...(lead.tags || []), tag].filter((t, i, arr) => arr.indexOf(t) === i) }
              : lead
          )
        }));
      },

      removeTagFromLead: (leadId: string, tag: string) => {
        set(state => ({
          leads: state.leads.map(lead =>
            lead.id === leadId
              ? { ...lead, tags: (lead.tags || []).filter(t => t !== tag) }
              : lead
          )
        }));
      },

      addLeadReminder: (leadId: string, reminder: Omit<LeadReminder, 'id' | 'completed'>) => {
        set(state => ({
          leads: state.leads.map(lead =>
            lead.id === leadId
              ? {
                  ...lead,
                  reminders: [
                    ...(lead.reminders || []),
                    { ...reminder, id: `rem-${Date.now()}`, completed: false }
                  ]
                }
              : lead
          )
        }));
      },

      completeReminder: (leadId: string, reminderId: string) => {
        set(state => ({
          leads: state.leads.map(lead =>
            lead.id === leadId
              ? {
                  ...lead,
                  reminders: (lead.reminders || []).map(r =>
                    r.id === reminderId ? { ...r, completed: true } : r
                  )
                }
              : lead
          )
        }));
      },

      bulkUpdateLeadStatus: (leadIds: string[], status: Lead['status']) => {
        const user = get().currentUser;
        set(state => ({
          leads: state.leads.map(lead => {
            if (!leadIds.includes(lead.id)) return lead;
            const statusChange: StatusChange = {
              id: `sc-${Date.now()}-${lead.id}`,
              from: lead.status,
              to: status,
              date: new Date().toISOString(),
              agentId: user?.id || 'unknown'
            };
            return {
              ...lead,
              status,
              statusHistory: [...(lead.statusHistory || []), statusChange]
            };
          })
        }));
      },

      importLeads: (leads: Omit<Lead, 'id' | 'createdDate' | 'notes' | 'assignedTo' | 'statusHistory'>[]) => {
        const user = get().currentUser;
        set(state => ({
          leads: [
            ...state.leads,
            ...leads.map((lead, idx) => ({
              ...lead,
              id: `lead-import-${Date.now()}-${idx}`,
              createdDate: new Date().toISOString().split('T')[0],
              notes: [],
              assignedTo: user?.id || 'unknown',
              statusHistory: []
            }))
          ]
        }));
      },

      fetchWebsiteLeads: async (agentSlug: string) => {
        try {
          const res = await fetch(`/api/agent-leads/${agentSlug}`);
          if (!res.ok) return;
          const data = await res.json();
          const websiteLeads = data.leads || [];
          const state = get();
          const existingIds = new Set(state.leads.map(l => l.id));
          const today = new Date().toISOString().split('T')[0];

          const newLeads: Lead[] = websiteLeads
            .filter((wl: any) => !existingIds.has(`web-${wl.leadId}`))
            .map((wl: any) => ({
              id: `web-${wl.leadId}`,
              name: `${wl.firstName} ${wl.lastName}`,
              email: wl.email,
              phone: wl.phone || '',
              status: 'new' as const,
              source: wl.source === 'schedule_call' ? 'Schedule Call' : 'Website',
              assignedTo: state.currentUser?.id || 'unknown',
              createdDate: wl.createdAt.split('T')[0],
              notes: wl.message ? [{
                id: `note-${wl.leadId}`,
                type: 'note' as const,
                notes: `Website message: ${wl.message}`,
                date: wl.createdAt.split('T')[0],
                agentId: 'system',
              }] : [],
              product: wl.productInterest || undefined,
              tags: ['Website Lead'],
              nextFollowUpDate: today,
              nextFollowUpType: 'call' as const,
            }));

          if (newLeads.length > 0) {
            set({ leads: [...newLeads, ...state.leads] });
          }
        } catch (err) {
          console.error('[AgentStore] Failed to fetch website leads:', err);
        }
      },

      fetchReferralLeads: async () => {
        try {
          const res = await fetch('/api/referrals/leads', { credentials: 'include' });
          if (!res.ok) return;
          const data = await res.json();
          const referralLeads = data.leads || [];
          const state = get();
          const existingIds = new Set(state.leads.map(l => l.id));
          const today = new Date().toISOString().split('T')[0];

          const newLeads: Lead[] = referralLeads
            .filter((rl: any) => !existingIds.has(`ref-${rl.id}`))
            .map((rl: any) => ({
              id: `ref-${rl.id}`,
              name: `${rl.firstName} ${rl.lastName}`,
              email: rl.email,
              phone: rl.phone || '',
              status: rl.status === 'new' ? 'new' as const : 'contacted' as const,
              source: 'Referral',
              assignedTo: state.currentUser?.id || 'unknown',
              createdDate: rl.createdAt ? rl.createdAt.split('T')[0] : today,
              notes: rl.notes ? [{
                id: `note-ref-${rl.id}`,
                type: 'note' as const,
                notes: rl.notes,
                date: rl.createdAt ? rl.createdAt.split('T')[0] : today,
                agentId: 'system',
              }] : [],
              product: rl.coverageType || undefined,
              tags: [
                'Referral',
                ...(rl.referrerName ? [`From: ${rl.referrerName}`] : []),
                ...(rl.relationship ? [rl.relationship] : []),
              ],
              nextFollowUpDate: today,
              nextFollowUpType: 'call' as const,
            }));

          if (newLeads.length > 0) {
            set({ leads: [...newLeads, ...state.leads] });
          }
        } catch (err) {
          console.error('[AgentStore] Failed to fetch referral leads:', err);
        }
      },

      deleteLeads: (leadIds: string[]) => {
        set(state => ({
          leads: state.leads.filter(lead => !leadIds.includes(lead.id))
        }));
      },

      // Quote enhancements
      createQuoteVersion: (quoteId: string) => {
        set(state => ({
          quotes: state.quotes.map(quote => {
            if (quote.id !== quoteId) return quote;
            const newVersion: QuoteVersion = {
              id: `qv-${Date.now()}`,
              version: (quote.currentVersion || 1) + 1,
              coverageAmount: quote.coverageAmount,
              monthlyPremium: quote.monthlyPremium,
              term: quote.term,
              createdDate: new Date().toISOString(),
              notes: quote.notes
            };
            return {
              ...quote,
              versions: [...(quote.versions || []), newVersion],
              currentVersion: newVersion.version
            };
          })
        }));
      },

      updateQuoteSignature: (quoteId: string, signatureStatus: Quote['signatureStatus']) => {
        set(state => ({
          quotes: state.quotes.map(quote =>
            quote.id === quoteId
              ? {
                  ...quote,
                  signatureStatus,
                  signedDate: signatureStatus === 'signed' ? new Date().toISOString() : quote.signedDate
                }
              : quote
          )
        }));
      },

      // AgentOS Stage 1 - Follow-up enforcement & Policy tracking
      getOverdueLeads: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().leads.filter(lead =>
          lead.nextFollowUpDate &&
          lead.nextFollowUpDate < today &&
          !['closed', 'lost'].includes(lead.status)
        );
      },

      getLeadsDueToday: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().leads.filter(lead =>
          lead.nextFollowUpDate === today &&
          !['closed', 'lost'].includes(lead.status)
        );
      },

      getLeadsDueThisWeek: () => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return get().leads.filter(lead =>
          lead.nextFollowUpDate &&
          lead.nextFollowUpDate > todayStr &&
          lead.nextFollowUpDate <= weekFromNow &&
          !['closed', 'lost'].includes(lead.status)
        );
      },

      getLeadsWithNoFollowUp: () => {
        return get().leads.filter(lead =>
          !lead.nextFollowUpDate &&
          !['closed', 'lost'].includes(lead.status)
        );
      },

      updateLeadFollowUp: (leadId: string, date: string, type: Lead['nextFollowUpType']) => {
        set(state => ({
          leads: state.leads.map(lead =>
            lead.id === leadId
              ? { ...lead, nextFollowUpDate: date, nextFollowUpType: type }
              : lead
          )
        }));
      },

      updatePolicyStatus: (leadId: string, status: Lead['policyStatus'], notes?: string) => {
        const user = get().currentUser;
        set(state => ({
          leads: state.leads.map(lead => {
            if (lead.id !== leadId) return lead;
            const policyChange: PolicyStatusChange = {
              id: `psc-${Date.now()}`,
              from: lead.policyStatus,
              to: status,
              date: new Date().toISOString(),
              agentId: user?.id || 'unknown',
              notes
            };
            return {
              ...lead,
              policyStatus: status,
              policyStatusHistory: [...(lead.policyStatusHistory || []), policyChange]
            };
          })
        }));
      },

      // AgentOS Stage 2 - Intelligence Assist
      calculateLeadUrgencyScore: (lead: Lead) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reasons: string[] = [];
        let score = 50; // Base score

        // Factor 1: Follow-up date urgency (0-30 points)
        if (lead.nextFollowUpDate) {
          const followUp = new Date(lead.nextFollowUpDate);
          followUp.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((followUp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff < 0) {
            score += Math.min(30, Math.abs(daysDiff) * 5);
            reasons.push(`${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? 's' : ''} overdue`);
          } else if (daysDiff === 0) {
            score += 25;
            reasons.push('Follow-up due today');
          } else if (daysDiff === 1) {
            score += 15;
            reasons.push('Follow-up due tomorrow');
          }
        } else if (!['closed', 'lost'].includes(lead.status)) {
          score += 10;
          reasons.push('No follow-up scheduled');
        }

        // Factor 2: Days since last contact (0-20 points)
        if (lead.lastContactDate) {
          const lastContact = new Date(lead.lastContactDate);
          const daysSinceContact = Math.floor((today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceContact > 7) {
            score += Math.min(20, (daysSinceContact - 7) * 2);
            reasons.push(`No contact in ${daysSinceContact} days`);
          }
        } else if (lead.status !== 'new') {
          score += 15;
          reasons.push('Never contacted');
        }

        // Factor 3: Lead stage value (0-15 points)
        const stageScores: Record<string, number> = {
          proposal: 15,
          qualified: 10,
          contacted: 5,
          new: 8,
          closed: 0,
          lost: 0
        };
        score += stageScores[lead.status] || 0;
        if (lead.status === 'proposal') {
          reasons.push('Hot prospect - proposal stage');
        } else if (lead.status === 'qualified') {
          reasons.push('Qualified lead ready to close');
        }

        // Factor 4: Policy in progress (0-10 points)
        if (lead.policyStatus && !['issued', 'declined'].includes(lead.policyStatus)) {
          score += 10;
          reasons.push(`Active policy: ${lead.policyStatus.replace('_', ' ')}`);
        }

        // Factor 5: Recent activity bonus (-10 to 0 points)
        if (lead.notes && lead.notes.length > 0) {
          const lastNote = lead.notes[lead.notes.length - 1];
          const noteDate = new Date(lastNote.date);
          const daysSinceNote = Math.floor((today.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceNote <= 2) {
            score -= 10; // Recently worked, lower priority
          }
        }

        return {
          score: Math.max(0, Math.min(100, score)),
          reasons
        };
      },

      getDailyPriorityList: () => {
        const state = get();
        const user = state.currentUser;
        const userLeads = state.leads.filter(l =>
          l.assignedTo === user?.id &&
          !['closed', 'lost'].includes(l.status)
        );

        const priorityList = userLeads.map(lead => {
          const { score, reasons } = state.calculateLeadUrgencyScore(lead);

          // Generate call reason based on top priority factor
          let callReason = 'Schedule follow-up';
          if (reasons.includes('Follow-up due today')) {
            callReason = `Scheduled ${lead.nextFollowUpType || 'call'} for today`;
          } else if (reasons.some(r => r.includes('overdue'))) {
            callReason = 'Overdue follow-up - re-engage immediately';
          } else if (reasons.includes('Hot prospect - proposal stage')) {
            callReason = 'Close the deal - proposal pending';
          } else if (reasons.some(r => r.includes('Active policy'))) {
            callReason = 'Check on application status';
          } else if (reasons.includes('Qualified lead ready to close')) {
            callReason = 'Move to proposal stage';
          } else if (reasons.some(r => r.includes('No contact in'))) {
            callReason = 'Re-engage cold lead';
          }

          return { lead, score, reasons, callReason };
        });

        // Sort by score descending
        return priorityList.sort((a, b) => b.score - a.score).slice(0, 15);
      },

      getMissedCallAlerts: () => {
        const state = get();
        const user = state.currentUser;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return state.leads
          .filter(lead => {
            if (lead.assignedTo !== user?.id) return false;
            if (['closed', 'lost'].includes(lead.status)) return false;
            if (!lead.nextFollowUpDate) return false;

            const followUp = new Date(lead.nextFollowUpDate);
            followUp.setHours(0, 0, 0, 0);
            return followUp < today;
          })
          .map(lead => {
            const followUp = new Date(lead.nextFollowUpDate!);
            followUp.setHours(0, 0, 0, 0);
            const daysMissed = Math.floor((today.getTime() - followUp.getTime()) / (1000 * 60 * 60 * 24));
            return {
              lead,
              daysMissed,
              lastContact: lead.lastContactDate || null
            };
          })
          .sort((a, b) => b.daysMissed - a.daysMissed);
      },

      getAppointmentReadiness: (lead: Lead) => {
        const missing: string[] = [];
        let score = 100;

        // Check for required information
        if (!lead.phone) {
          missing.push('Phone number');
          score -= 25;
        }
        if (!lead.email) {
          missing.push('Email address');
          score -= 15;
        }
        if (!lead.product) {
          missing.push('Product interest');
          score -= 20;
        }
        if (!lead.state) {
          missing.push('State/Location');
          score -= 10;
        }

        // Check for activity history
        if (!lead.notes || lead.notes.length === 0) {
          missing.push('No prior contact notes');
          score -= 15;
        }

        // Check for quote if in proposal stage
        if (lead.status === 'proposal' && !lead.policyStatus) {
          missing.push('No quote on file');
          score -= 15;
        }

        return {
          ready: missing.length === 0,
          missing,
          score: Math.max(0, score)
        };
      },

      getCloseRateStats: () => {
        const state = get();
        const user = state.currentUser;
        const userLeads = state.leads.filter(l => l.assignedTo === user?.id);

        const today = new Date();
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        // Calculate overall close rate
        const closedLeads = userLeads.filter(l => l.status === 'closed');
        const lostLeads = userLeads.filter(l => l.status === 'lost');
        const totalDecided = closedLeads.length + lostLeads.length;
        const overall = totalDecided > 0 ? Math.round((closedLeads.length / totalDecided) * 100) : 0;

        // Calculate by stage conversion rates
        const byStage: Record<string, number> = {};
        const stages = ['new', 'contacted', 'qualified', 'proposal'];
        stages.forEach((stage, index) => {
          if (index < stages.length - 1) {
            const inStage = userLeads.filter(l => l.status === stage).length;
            const advanced = userLeads.filter(l => {
              const stageIndex = stages.indexOf(l.status);
              return stageIndex > index || l.status === 'closed';
            }).length;
            byStage[`${stage}_to_next`] = inStage > 0 ? Math.round((advanced / (inStage + advanced)) * 100) : 0;
          }
        });

        // This month closes (based on status history or creation date for demo)
        const thisMonthCloses = closedLeads.filter(l => {
          const closeDate = l.statusHistory?.find(h => h.to === 'closed')?.date;
          if (closeDate) {
            return new Date(closeDate) >= thisMonthStart;
          }
          return new Date(l.createdDate) >= thisMonthStart;
        }).length;

        // Last month closes
        const lastMonthCloses = closedLeads.filter(l => {
          const closeDate = l.statusHistory?.find(h => h.to === 'closed')?.date;
          if (closeDate) {
            const d = new Date(closeDate);
            return d >= lastMonthStart && d <= lastMonthEnd;
          }
          const d = new Date(l.createdDate);
          return d >= lastMonthStart && d <= lastMonthEnd;
        }).length;

        // Determine trend
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (thisMonthCloses > lastMonthCloses) trend = 'up';
        else if (thisMonthCloses < lastMonthCloses) trend = 'down';

        // Leads in active pipeline
        const leadsInPipeline = userLeads.filter(l =>
          !['closed', 'lost'].includes(l.status)
        ).length;

        // Projected closes based on current conversion rate and pipeline
        const proposalLeads = userLeads.filter(l => l.status === 'proposal').length;
        const qualifiedLeads = userLeads.filter(l => l.status === 'qualified').length;
        const projectedCloses = Math.round(proposalLeads * 0.6 + qualifiedLeads * 0.3);

        return {
          overall,
          byStage,
          trend,
          thisMonth: thisMonthCloses,
          lastMonth: lastMonthCloses,
          leadsInPipeline,
          projectedCloses
        };
      },

      // AgentOS Stage 3 - Assisted Execution
      getSuggestedTemplate: (lead: Lead) => {
        // Suggest template based on lead context
        const lastActivity = lead.notes?.[lead.notes.length - 1];
        const daysSinceContact = lead.lastContactDate
          ? Math.floor((Date.now() - new Date(lead.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
          : null;

        // No prior contact - initial outreach
        if (!lastActivity || lead.status === 'new') {
          return { templateId: 'template-outreach-1', reason: 'First contact with new lead' };
        }

        // Quote ready - send quote notification
        if (lead.policyStatus === 'quoted') {
          return { templateId: 'template-quote-1', reason: 'Quote is ready to share' };
        }

        // Application submitted
        if (lead.policyStatus === 'submitted') {
          return { templateId: 'template-app-1', reason: 'Confirm application submission' };
        }

        // Policy approved
        if (lead.policyStatus === 'approved') {
          return { templateId: 'template-policy-1', reason: 'Congratulate on approval' };
        }

        // Policy issued
        if (lead.policyStatus === 'issued') {
          return { templateId: 'template-policy-2', reason: 'Welcome new policyholder' };
        }

        // Callback requested
        if (lastActivity?.disposition === 'callback') {
          return { templateId: 'template-followup-1', reason: 'Follow up on callback request' };
        }

        // No answer / voicemail - follow up
        if (lastActivity?.disposition === 'no_answer' || lastActivity?.disposition === 'voicemail') {
          return { templateId: 'template-followup-2', reason: 'Re-attempt after missed call' };
        }

        // Cold lead (>7 days no contact)
        if (daysSinceContact && daysSinceContact > 7) {
          return { templateId: 'template-followup-3', reason: `No contact in ${daysSinceContact} days` };
        }

        return null;
      },

      generateCallSummary: (lead: Lead, notes: string, disposition: string) => {
        const today = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        const dispositionLabels: Record<string, string> = {
          interested: 'Client expressed interest',
          callback: 'Callback requested',
          appointment_set: 'Appointment scheduled',
          not_interested: 'Client not interested',
          no_answer: 'No answer',
          voicemail: 'Left voicemail'
        };

        const summary = `
📞 CALL SUMMARY - ${today}
━━━━━━━━━━━━━━━━━━━━━━━━
Client: ${lead.name}
Product: ${lead.product || 'Not specified'}
Outcome: ${dispositionLabels[disposition] || disposition}

📝 KEY POINTS:
${notes}

📋 NEXT STEPS:
${disposition === 'appointment_set' ? '• Prepare for scheduled appointment' : ''}
${disposition === 'interested' ? '• Send quote/proposal\n• Schedule follow-up call' : ''}
${disposition === 'callback' ? '• Call back at requested time\n• Prepare answers to questions' : ''}
${disposition === 'no_answer' || disposition === 'voicemail' ? '• Try again later today\n• Send follow-up text/email' : ''}
${disposition === 'not_interested' ? '• Note reason in CRM\n• Consider future re-engagement' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━`.trim();

        return summary;
      },

      scheduleAppointment: (leadId: string, appointment: Omit<Appointment, 'id' | 'status' | 'reminderSent'>) => {
        set(state => ({
          leads: state.leads.map(lead => {
            if (lead.id !== leadId) return lead;
            const newAppointment: Appointment = {
              ...appointment,
              id: `apt-${Date.now()}`,
              status: 'scheduled',
              reminderSent: false
            };
            return {
              ...lead,
              appointments: [...(lead.appointments || []), newAppointment]
            };
          })
        }));
      },

      updateAppointmentStatus: (leadId: string, appointmentId: string, status: Appointment['status']) => {
        set(state => ({
          leads: state.leads.map(lead => {
            if (lead.id !== leadId) return lead;
            return {
              ...lead,
              appointments: (lead.appointments || []).map(apt =>
                apt.id === appointmentId ? { ...apt, status } : apt
              )
            };
          })
        }));
      },

      getRenewalAlerts: () => {
        const state = get();
        const user = state.currentUser;

        return state.leads
          .filter(lead => {
            // For demo: show all issued policies with expiration dates
            if (user && lead.assignedTo !== user.id && lead.assignedTo !== 'agent-1') return false;
            if (lead.status !== 'closed' || lead.policyStatus !== 'issued') return false;
            if (!lead.policyExpirationDate) return false;
            return true; // Show all for demo
          })
          .map(lead => {
            const expDate = new Date(lead.policyExpirationDate!);
            const today = new Date();
            const daysUntilExpiration = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
              lead,
              daysUntilExpiration: Math.max(daysUntilExpiration, 3), // At least 3 days for demo visibility
              product: lead.product || 'Life Insurance'
            };
          })
          .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
      },

      getCrossSellOpportunities: (lead: Lead) => {
        const opportunities: CrossSellOpportunity[] = [];

        // Only suggest for closed/issued policies
        if (lead.status !== 'closed' || lead.policyStatus !== 'issued') {
          return opportunities;
        }

        const currentProduct = lead.product?.toLowerCase() || '';

        // Term life -> Suggest whole life or IUL
        if (currentProduct.includes('term')) {
          opportunities.push({
            id: `cs-${lead.id}-whole`,
            product: 'Whole Life',
            reason: 'Build cash value and permanent coverage',
            priority: 'medium'
          });
          opportunities.push({
            id: `cs-${lead.id}-iul`,
            product: 'IUL',
            reason: 'Tax-advantaged retirement supplement',
            priority: 'low'
          });
        }

        // Final expense -> Suggest term for family
        if (currentProduct.includes('final expense')) {
          opportunities.push({
            id: `cs-${lead.id}-term`,
            product: 'Term Life',
            reason: 'Additional coverage for family protection',
            priority: 'medium'
          });
        }

        // Mortgage protection -> Suggest final expense
        if (currentProduct.includes('mortgage')) {
          opportunities.push({
            id: `cs-${lead.id}-fe`,
            product: 'Final Expense',
            reason: 'Cover burial costs separately',
            priority: 'low'
          });
        }

        // Any life product -> Suggest annuity for retirement
        if (currentProduct.includes('life') || currentProduct.includes('iul')) {
          opportunities.push({
            id: `cs-${lead.id}-annuity`,
            product: 'Fixed Annuity',
            reason: 'Guaranteed retirement income',
            priority: 'low'
          });
        }

        // Filter out dismissed opportunities
        return opportunities.filter(opp =>
          !lead.crossSellOpportunities?.find(co => co.id === opp.id && co.dismissed)
        );
      },

      dismissCrossSell: (leadId: string, opportunityId: string) => {
        set(state => ({
          leads: state.leads.map(lead => {
            if (lead.id !== leadId) return lead;
            const existing = lead.crossSellOpportunities || [];
            const updated = existing.find(o => o.id === opportunityId)
              ? existing.map(o => o.id === opportunityId ? { ...o, dismissed: true } : o)
              : [...existing, { id: opportunityId, product: '', reason: '', priority: 'low' as const, dismissed: true }];
            return { ...lead, crossSellOpportunities: updated };
          })
        }));
      },

      convertCrossSellToLead: (leadId: string, opportunityId: string) => {
        const state = get();
        const lead = state.leads.find(l => l.id === leadId);
        const opportunity = state.getCrossSellOpportunities(lead!).find(o => o.id === opportunityId);

        if (!lead || !opportunity) return;

        // Mark as converted
        set(state => ({
          leads: state.leads.map(l => {
            if (l.id !== leadId) return l;
            const existing = l.crossSellOpportunities || [];
            const updated = existing.find(o => o.id === opportunityId)
              ? existing.map(o => o.id === opportunityId ? { ...o, convertedToLead: true } : o)
              : [...existing, { ...opportunity, convertedToLead: true }];
            return { ...l, crossSellOpportunities: updated };
          })
        }));

        // Add new lead for the cross-sell product
        const user = state.currentUser;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        set(state => ({
          leads: [...state.leads, {
            id: `lead-cs-${Date.now()}`,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            status: 'new' as const,
            source: 'Cross-sell',
            assignedTo: user?.id || 'unknown',
            createdDate: new Date().toISOString().split('T')[0],
            notes: [{
              id: `note-cs-${Date.now()}`,
              type: 'note' as const,
              notes: `Cross-sell opportunity from ${lead.product} policy. ${opportunity.reason}`,
              date: new Date().toISOString().split('T')[0],
              agentId: user?.id || 'unknown'
            }],
            product: opportunity.product,
            state: lead.state,
            nextFollowUpDate: tomorrow.toISOString().split('T')[0],
            nextFollowUpType: 'call' as const
          }]
        }));
      },

      getUpcomingAppointments: () => {
        const state = get();
        const user = state.currentUser;

        const appointments: Array<{ lead: Lead; appointment: Appointment }> = [];

        state.leads.forEach(lead => {
          // For demo: show all appointments for agent-1 or current user
          if (user && lead.assignedTo !== user.id && lead.assignedTo !== 'agent-1') return;
          (lead.appointments || []).forEach(apt => {
            if (apt.status !== 'scheduled') return;
            // For demo: show all scheduled appointments regardless of date
            appointments.push({ lead, appointment: apt });
          });
        });

        return appointments.sort((a, b) =>
          new Date(a.appointment.date + ' ' + a.appointment.time).getTime() -
          new Date(b.appointment.date + ' ' + b.appointment.time).getTime()
        );
      }
    }),
    {
      name: 'agent-lounge-storage-v7',
      version: 2,
      partialize: (state) => ({
        currentUser: state.currentUser,
        theme: state.theme,
        tasks: state.tasks,
        leads: state.leads,
        courses: state.courses,
        performance: state.performance,
        earnings: state.earnings,
        ideas: state.ideas,
        bookOfBusiness: state.bookOfBusiness,
        recruitProspects: state.recruitProspects,
        referralLink: state.referralLink,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AgentStore>;
        return {
          ...currentState,
          ...persisted,
          // Reset demo data for courses and performance on each load
          performance: DEMO_PERFORMANCE,
          courses: DEMO_COURSES
        };
      },
      // Ensure storage is correctly initialized
      onRehydrateStorage: () => (state) => {
        // Called when state is rehydrated from storage
        if (state?.currentUser) {
          // Ensure phone field exists for older stored users
          if (!state.currentUser.phone) {
            state.currentUser.phone = '';
          }
        }
      }
    }
  )
);
