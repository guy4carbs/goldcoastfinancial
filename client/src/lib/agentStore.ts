import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AgentUser {
  id: string;
  name: string;
  email: string;
  role: 'agent' | 'executive';
  avatar?: string;
  territories: string[];
  startDate: string;
  certifications: string[];
  badges: string[];
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
}

const DEMO_AGENTS: AgentUser[] = [
  {
    id: 'agent-1',
    name: 'Alex Johnson',
    email: 'agent@goldcoastfnl.com',
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
    notes: [
      { id: 'log-1', type: 'call', disposition: 'interested', notes: 'Interested in 20-year term. Has 2 kids.', date: '2025-12-28', agentId: 'agent-1' }
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
    notes: [
      { id: 'log-2', type: 'meeting', disposition: 'appointment_set', notes: 'Met via Zoom. Sending proposal.', date: '2025-12-30', agentId: 'agent-1' }
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
    notes: []
  },
  {
    id: 'lead-6',
    name: 'Lisa Martinez',
    email: 'lmartinez@email.com',
    phone: '(630) 555-4444',
    status: 'closed',
    source: 'Website',
    assignedTo: 'agent-3',
    createdDate: '2025-12-10',
    lastContactDate: '2025-12-28',
    product: 'Whole Life',
    state: 'Illinois',
    notes: []
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
"Hi [Name], this is [Your Name] with Gold Coast Financial. I'm calling about the life insurance information you requested. Is now a good time to chat for a few minutes?"

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
"Hi [Name], this is [Your Name] with Gold Coast Financial. I'm reaching out because you recently [purchased a home/refinanced your mortgage] and I wanted to make sure you're aware of a program that protects your home if something unexpected happens. Do you have a quick moment?"

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
"Hi [Name], this is [Your Name] with Gold Coast Financial. I'm reaching out because you expressed interest in permanent life insurance - coverage that lasts your entire lifetime and builds cash value. Is this a good time to talk?"

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
"Hi [Name], this is [Your Name] with Gold Coast Financial. I'm calling about the information you requested on burial insurance - the kind that helps your family cover funeral costs without going into debt. Do you have a few minutes?"

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
"Hi [Name]? Great! This is [Your Name] with Gold Coast Financial. I'm not trying to sell you anything right now - I'm just following up on a request you made about life insurance. Does that ring a bell?"

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
"Hi [Name]! This is [Your Name] with Gold Coast Financial. I'm calling about the life insurance quote you just requested online. Did I catch you at a good time?"

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
These are premium leads generated by Gold Coast Financial marketing. They know our brand and have specifically requested information from us. Conversion should be high.

OPENING:
"Hi [Name]! This is [Your Name] calling from Gold Coast Financial - you reached out to us about protecting your family with life insurance. How are you doing today?"

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
"Welcome to the Gold Coast Financial family! Here's what happens next:
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
"Hi [Name], this is [Your Name] with Gold Coast Financial. I'm reaching out because you expressed interest in building tax-advantaged wealth through life insurance. This is one of the most powerful financial tools available, and I'm excited to share how it works. Do you have about 20 minutes?"

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
  xpGain: { amount: number; reason: string; type: string } | null;
  levelUp: number | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
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
      xpGain: null,
      levelUp: null,

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
        localStorage.removeItem('agent-lounge-storage');
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
        set(state => ({
          leads: state.leads.map(lead => 
            lead.id === leadId ? { ...lead, status } : lead
          )
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
      }
    }),
    {
      name: 'agent-lounge-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        theme: state.theme,
        tasks: state.tasks,
        leads: state.leads,
        courses: state.courses,
        performance: state.performance,
        earnings: state.earnings
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AgentStore>;
        return {
          ...currentState,
          ...persisted,
          performance: DEMO_PERFORMANCE,
          courses: DEMO_COURSES
        };
      }
    }
  )
);
