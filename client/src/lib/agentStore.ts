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

const DEMO_AGENTS: AgentUser[] = [];

const DEMO_ANNOUNCEMENTS: Announcement[] = [];

const DEMO_TASKS: Task[] = [];

const DEMO_LEADS: Lead[] = [];

const DEMO_COURSES: TrainingCourse[] = [];

const DEMO_SOPS: SOP[] = [];

const DEMO_PERFORMANCE: PerformanceMetrics = {
  dailyCalls: 0,
  dailyCallsTarget: 100,
  dailyCloses: 0,
  dailyClosesTarget: 3,
  behaviorScore: 0,
  conversionRate: 0,
  currentStreak: 0,
  longestStreak: 0,
  xp: 0,
  level: 1,
  weeklyHistory: [
    { day: 'Mon', calls: 0, deals: 0 },
    { day: 'Tue', calls: 0, deals: 0 },
    { day: 'Wed', calls: 0, deals: 0 },
    { day: 'Thu', calls: 0, deals: 0 },
    { day: 'Fri', calls: 0, deals: 0 },
    { day: 'Sat', calls: 0, deals: 0 },
    { day: 'Sun', calls: 0, deals: 0 }
  ],
  rank: 0,
  totalAgents: 0
};

const DEMO_EARNINGS: EarningEntry[] = [];

const DEMO_LEADERBOARD: LeaderboardEntry[] = [];

const DEMO_ACHIEVEMENTS: Achievement[] = [];

const DEMO_QUICK_ACTIONS: QuickAction[] = [];

const DEMO_NOTIFICATIONS: AgentNotification[] = [];

const DEMO_ACTIVITIES: ActivityItem[] = [];

const DEMO_DAILY_CHALLENGES: DailyChallenge[] = [];

const DEMO_SCRIPTS: Script[] = [];

// ===== IDEAS DEMO DATA =====
const DEMO_IDEAS: AgentIdea[] = [];

// ===== BOOK OF BUSINESS DEMO DATA =====
const DEMO_BOOK_OF_BUSINESS: BookOfBusinessClient[] = [];

// ===== RECRUITING DEMO DATA =====
const DEMO_RECRUIT_PROSPECTS: RecruitProspect[] = [];

const DEMO_REFERRAL_LINK: ReferralLink = {
  code: '',
  url: '',
  clicks: 0,
  conversions: 0,
};

const DEMO_DOWNLINE_AGENTS: DownlineAgent[] = [];

const DEMO_FUNNEL_DATA: FunnelStageData[] = [];

const DEMO_AUTOMATION_STEPS: RecruitingAutomationStep[] = [];

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
  hydrateFromUser: (authUser: { id: string; firstName?: string; lastName?: string; email: string; phone?: string; role?: string; avatarUrl?: string }) => void;
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

      login: (_email: string, _password: string) => {
        // Real login is handled by AuthContext (POST /api/auth/login)
        // This method is kept for interface compatibility but should not be called directly
        return false;
      },

      logout: () => {
        const { currentUser } = get();
        // Clear the user-scoped storage key
        if (currentUser?.id) {
          localStorage.removeItem(`agent-lounge-${currentUser.id}-v1`);
        }
        // Also clear legacy keys
        localStorage.removeItem('agent-lounge-storage-v6');
        localStorage.removeItem('agent-lounge-storage-v7');
        // Reset all state
        set({
          currentUser: null,
          leads: [],
          tasks: [],
          earnings: [],
          ideas: [],
          bookOfBusiness: [],
          recruitProspects: [],
          performance: DEMO_PERFORMANCE,
          announcements: [],
          activities: [],
          notifications: [],
        });
      },

      // Hydrate store from real auth user (called by AuthContext on login)
      hydrateFromUser: (authUser: { id: string; firstName?: string; lastName?: string; email: string; phone?: string; role?: string; avatarUrl?: string }) => {
        set({
          currentUser: {
            id: authUser.id,
            name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || authUser.email,
            email: authUser.email,
            phone: authUser.phone || '',
            role: (authUser.role === 'owner' || authUser.role === 'system_admin') ? 'executive' : 'agent',
            avatar: authUser.avatarUrl,
            territories: [],
            startDate: new Date().toISOString().split('T')[0],
            certifications: [],
            badges: [],
          },
        });
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
            avatar: (updates as any).avatar ?? currentUser.avatar,
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
            avatar: (profile as any).avatar ?? currentUser.avatar,
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
      name: 'agent-lounge-storage-v8',
      version: 1,
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
