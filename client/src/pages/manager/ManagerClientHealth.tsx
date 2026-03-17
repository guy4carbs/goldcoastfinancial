/**
 * Manager Client Retention
 * Monitor retention, satisfaction, and book of business metrics
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  glassCard,
  MANAGER_ICON_GRADIENT,
  MANAGER_GRADIENT_CSS,
  SPARKLINE_RETENTION,
} from './managerConstants';
import { toast } from 'sonner';
import {
  RADIUS,
  TYPE,
  GRID,
  LAYOUT,
  MOTION,
  COLORS,
  SHADOW,
  fadeInUp,
  staggerContainer,
  staggerCards,
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Briefcase,
  Users,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Shield,
  Calendar,
  Phone,
  FileSearch,
  ArrowUpRight,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  BookOpen,
  Search,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Mail,
  Heart,
} from 'lucide-react';

/* ── Types ───────────────────────────────────────────────── */
type Tab = 'overview' | 'at-risk';
type SortKey = 'name' | 'clients' | 'premium' | 'retention' | 'nps';
type SortDir = 'asc' | 'desc';
type RiskFilter = 'all' | 'high' | 'medium';

/* ── Demo Data: Agent Client Base ───────────────────── */
const AGENT_BOOK = [
  { id: '1', name: 'Sarah Johnson', avatar: 'SJ', totalClients: 142, totalPremium: 486000, retention: 97.1, nps: 84 },
  { id: '2', name: 'Mike Chen', avatar: 'MC', totalClients: 118, totalPremium: 392000, retention: 95.3, nps: 78 },
  { id: '3', name: 'Emily Davis', avatar: 'ED', totalClients: 104, totalPremium: 338000, retention: 92.8, nps: 71 },
  { id: '4', name: 'James Wilson', avatar: 'JW', totalClients: 89, totalPremium: 274000, retention: 88.4, nps: 64 },
  { id: '5', name: 'Lisa Park', avatar: 'LP', totalClients: 76, totalPremium: 218000, retention: 94.6, nps: 73 },
  { id: '6', name: 'David Brown', avatar: 'DB', totalClients: 112, totalPremium: 365000, retention: 96.2, nps: 80 },
  { id: '7', name: 'Rachel Green', avatar: 'RG', totalClients: 131, totalPremium: 448000, retention: 97.8, nps: 86 },
  { id: '8', name: 'Carlos Martinez', avatar: 'CM', totalClients: 75, totalPremium: 198000, retention: 85.2, nps: 58 },
] as const;

/* ── Demo Data: Policy Distribution ──────────────────────── */
const POLICY_DISTRIBUTION = [
  { type: 'Term Life', percentage: 35, count: 296, color: '#059669' },
  { type: 'Whole Life', percentage: 28, count: 237, color: '#0d9488' },
  { type: 'IUL', percentage: 22, count: 186, color: '#6366f1' },
  { type: 'Final Expense', percentage: 10, count: 85, color: '#f59e0b' },
  { type: 'Annuity', percentage: 5, count: 43, color: '#ec4899' },
] as const;

/* ── Demo Data: Retention Trend (6 months) ───────────────── */
const RETENTION_TREND = [
  { month: 'Sep', value: 92.4 },
  { month: 'Oct', value: 92.8 },
  { month: 'Nov', value: 93.1 },
  { month: 'Dec', value: 93.6 },
  { month: 'Jan', value: 94.0 },
  { month: 'Feb', value: 94.2 },
] as const;

/* ── Demo Data: Upcoming Renewals ────────────────────────── */
const UPCOMING_RENEWALS = [
  { client: 'Margaret Thompson', policyType: 'Whole Life', premium: 4200, renewalDate: 'Mar 12', agentId: '1', agentName: 'Sarah Johnson', agentAvatar: 'SJ' },
  { client: 'Robert Chen', policyType: 'IUL', premium: 6800, renewalDate: 'Mar 15', agentId: '2', agentName: 'Mike Chen', agentAvatar: 'MC' },
  { client: 'Patricia Williams', policyType: 'Term Life', premium: 1850, renewalDate: 'Mar 18', agentId: '7', agentName: 'Rachel Green', agentAvatar: 'RG' },
  { client: 'David Garcia', policyType: 'Annuity', premium: 12500, renewalDate: 'Mar 22', agentId: '6', agentName: 'David Brown', agentAvatar: 'DB' },
  { client: 'Susan Martinez', policyType: 'Whole Life', premium: 3600, renewalDate: 'Mar 25', agentId: '3', agentName: 'Emily Davis', agentAvatar: 'ED' },
] as const;

/* ── Demo Data: At-Risk Clients ──────────────────────────── */
type RiskReason = 'Lapse Warning' | 'Complaint Filed' | 'Payment Missed' | 'No Contact 60d' | 'Rate Increase Pending';
type RiskLevel = 'high' | 'medium';
type ActionLabel = 'Contact' | 'Review' | 'Escalate';

const AT_RISK_CLIENTS: Array<{
  id: string;
  client: string;
  policyType: string;
  premium: number;
  agentName: string;
  agentAvatar: string;
  riskReason: RiskReason;
  riskLevel: RiskLevel;
  action: ActionLabel;
}> = [
  { id: '1', client: 'Harold Peters', policyType: 'Whole Life', premium: 5200, agentName: 'Carlos Martinez', agentAvatar: 'CM', riskReason: 'Lapse Warning', riskLevel: 'high', action: 'Escalate' },
  { id: '2', client: 'Dorothy Mitchell', policyType: 'IUL', premium: 8400, agentName: 'James Wilson', agentAvatar: 'JW', riskReason: 'Complaint Filed', riskLevel: 'high', action: 'Escalate' },
  { id: '3', client: 'Frank Anderson', policyType: 'Term Life', premium: 1200, agentName: 'Emily Davis', agentAvatar: 'ED', riskReason: 'Payment Missed', riskLevel: 'medium', action: 'Contact' },
  { id: '4', client: 'Barbara Clark', policyType: 'Whole Life', premium: 3800, agentName: 'Carlos Martinez', agentAvatar: 'CM', riskReason: 'No Contact 60d', riskLevel: 'medium', action: 'Contact' },
  { id: '5', client: 'George Turner', policyType: 'Annuity', premium: 15000, agentName: 'Lisa Park', agentAvatar: 'LP', riskReason: 'Rate Increase Pending', riskLevel: 'high', action: 'Review' },
  { id: '6', client: 'Nancy Walker', policyType: 'IUL', premium: 6200, agentName: 'James Wilson', agentAvatar: 'JW', riskReason: 'Lapse Warning', riskLevel: 'high', action: 'Escalate' },
  { id: '7', client: 'Richard Lewis', policyType: 'Term Life', premium: 980, agentName: 'Emily Davis', agentAvatar: 'ED', riskReason: 'Payment Missed', riskLevel: 'medium', action: 'Contact' },
  { id: '8', client: 'Helen Young', policyType: 'Whole Life', premium: 4100, agentName: 'Mike Chen', agentAvatar: 'MC', riskReason: 'No Contact 60d', riskLevel: 'medium', action: 'Review' },
];

/* ── Demo Data: Agent Client Policies (Book of Business) ─── */
type PolicyStatus = 'Active' | 'Pending Renewal' | 'Lapsed' | 'New';

type Beneficiary = { name: string; relationship: string; percentage: number };

type ClientProfile = {
  client: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  city: string;
  state: string;
  // Policy
  policyType: string;
  policyNumber: string;
  carrier: string;
  coverageAmount: number;
  premium: number;           // monthly
  annualPremium: number;
  status: PolicyStatus;
  effectiveDate: string;
  expirationDate?: string;
  draftDate: string;         // day of month
  // Commission
  commissionRate: number;    // percent
  // Medical
  tobacco: boolean;
  height: string;
  weight: string;
  conditions?: string;
  medications?: string;
  // Beneficiaries
  beneficiaries: Beneficiary[];
  // Activity
  lastContact: string;
  nextFollowUp?: string;
  notes?: string;
};

const POLICY_STATUS_COLORS: Record<PolicyStatus, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  Active: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
  'Pending Renewal': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  Lapsed: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  New: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle2 },
};

/* eslint-disable @typescript-eslint/no-unused-vars */
const _clientData = null; // anchor for data section

const AGENT_CLIENTS: Record<string, ClientProfile[]> = {
  '1': [
    { client: 'Margaret Thompson', phone: '(555) 234-8901', email: 'margaret.thompson@email.com', dateOfBirth: '04/12/1968', city: 'Tampa', state: 'FL', policyType: 'Whole Life', policyNumber: 'WL-2024-0891', carrier: 'MassMutual', coverageAmount: 500000, premium: 350, annualPremium: 4200, status: 'Active', effectiveDate: 'Jan 15, 2022', expirationDate: 'Jan 15, 2052', draftDate: '15th', commissionRate: 85, tobacco: false, height: '5\'6"', weight: '145 lbs', beneficiaries: [{ name: 'Robert Thompson', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 5, 2026', nextFollowUp: 'Mar 20, 2026', notes: 'Considering adding spouse coverage' },
    { client: 'William Harris', phone: '(555) 345-6712', email: 'w.harris@gmail.com', dateOfBirth: '11/03/1975', city: 'Orlando', state: 'FL', policyType: 'Term Life', policyNumber: 'TL-2023-1204', carrier: 'Pacific Life', coverageAmount: 250000, premium: 150, annualPremium: 1800, status: 'Active', effectiveDate: 'Mar 1, 2023', expirationDate: 'Mar 1, 2043', draftDate: '1st', commissionRate: 90, tobacco: false, height: '5\'10"', weight: '180 lbs', beneficiaries: [{ name: 'Maria Harris', relationship: 'Spouse', percentage: 70 }, { name: 'Jake Harris', relationship: 'Son', percentage: 30 }], lastContact: 'Feb 28, 2026' },
    { client: 'Linda Foster', phone: '(555) 456-2389', email: 'linda.foster@outlook.com', dateOfBirth: '07/22/1970', city: 'Jacksonville', state: 'FL', policyType: 'IUL', policyNumber: 'IU-2024-0567', carrier: 'Nationwide', coverageAmount: 750000, premium: 600, annualPremium: 7200, status: 'Pending Renewal', effectiveDate: 'Apr 10, 2024', draftDate: '10th', commissionRate: 80, tobacco: false, height: '5\'4"', weight: '135 lbs', conditions: 'Managed hypertension', medications: 'Lisinopril 10mg', beneficiaries: [{ name: 'David Foster', relationship: 'Spouse', percentage: 60 }, { name: 'Amy Foster', relationship: 'Daughter', percentage: 40 }], lastContact: 'Mar 1, 2026', nextFollowUp: 'Mar 15, 2026', notes: 'Renewal discussion scheduled for Mar 15' },
    { client: 'Thomas Reed', phone: '(555) 567-3401', email: 'treed@yahoo.com', dateOfBirth: '02/14/1955', city: 'Miami', state: 'FL', policyType: 'Final Expense', policyNumber: 'FE-2023-0934', carrier: 'Mutual of Omaha', coverageAmount: 25000, premium: 100, annualPremium: 1200, status: 'Active', effectiveDate: 'Jun 1, 2023', draftDate: '1st', commissionRate: 95, tobacco: true, height: '5\'9"', weight: '170 lbs', conditions: 'Type 2 Diabetes', medications: 'Metformin 500mg', beneficiaries: [{ name: 'Sandra Reed', relationship: 'Spouse', percentage: 100 }], lastContact: 'Feb 20, 2026' },
    { client: 'Karen Phillips', phone: '(555) 678-9012', email: 'karen.p@email.com', dateOfBirth: '09/30/1963', city: 'St. Petersburg', state: 'FL', policyType: 'Annuity', policyNumber: 'AN-2024-0312', carrier: 'Pacific Life', coverageAmount: 200000, premium: 1250, annualPremium: 15000, status: 'New', effectiveDate: 'Feb 1, 2025', draftDate: '1st', commissionRate: 75, tobacco: false, height: '5\'5"', weight: '140 lbs', beneficiaries: [{ name: 'Mark Phillips', relationship: 'Son', percentage: 50 }, { name: 'Laura Phillips', relationship: 'Daughter', percentage: 50 }], lastContact: 'Mar 8, 2026', nextFollowUp: 'Apr 1, 2026' },
    { client: 'Steven Wright', phone: '(555) 789-1234', email: 'swright@gmail.com', dateOfBirth: '06/18/1980', city: 'Clearwater', state: 'FL', policyType: 'Term Life', policyNumber: 'TL-2024-1567', carrier: 'Prudential', coverageAmount: 500000, premium: 200, annualPremium: 2400, status: 'Active', effectiveDate: 'Sep 1, 2024', expirationDate: 'Sep 1, 2054', draftDate: '1st', commissionRate: 88, tobacco: false, height: '6\'1"', weight: '195 lbs', beneficiaries: [{ name: 'Jessica Wright', relationship: 'Spouse', percentage: 100 }], lastContact: 'Feb 25, 2026' },
  ],
  '2': [
    { client: 'Robert Chen', phone: '(555) 321-4567', email: 'robert.chen@email.com', dateOfBirth: '03/25/1972', city: 'Atlanta', state: 'GA', policyType: 'IUL', policyNumber: 'IU-2023-0821', carrier: 'Nationwide', coverageAmount: 600000, premium: 567, annualPremium: 6800, status: 'Pending Renewal', effectiveDate: 'Mar 1, 2023', draftDate: '1st', commissionRate: 82, tobacco: false, height: '5\'8"', weight: '165 lbs', beneficiaries: [{ name: 'Wei Chen', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 3, 2026', nextFollowUp: 'Mar 18, 2026', notes: 'Wants to increase coverage amount' },
    { client: 'Helen Young', phone: '(555) 432-5678', email: 'helen.y@outlook.com', dateOfBirth: '12/08/1965', city: 'Savannah', state: 'GA', policyType: 'Whole Life', policyNumber: 'WL-2024-0445', carrier: 'MassMutual', coverageAmount: 350000, premium: 342, annualPremium: 4100, status: 'Active', effectiveDate: 'Jul 1, 2024', draftDate: '1st', commissionRate: 85, tobacco: false, height: '5\'3"', weight: '130 lbs', beneficiaries: [{ name: 'James Young', relationship: 'Son', percentage: 100 }], lastContact: 'Feb 26, 2026' },
    { client: 'Jennifer Liu', phone: '(555) 543-6789', email: 'jliu@gmail.com', dateOfBirth: '05/14/1985', city: 'Marietta', state: 'GA', policyType: 'Term Life', policyNumber: 'TL-2023-0998', carrier: 'Pacific Life', coverageAmount: 300000, premium: 121, annualPremium: 1450, status: 'Active', effectiveDate: 'Nov 1, 2023', expirationDate: 'Nov 1, 2043', draftDate: '1st', commissionRate: 90, tobacco: false, height: '5\'5"', weight: '125 lbs', beneficiaries: [{ name: 'Kevin Liu', relationship: 'Spouse', percentage: 60 }, { name: 'Emily Liu', relationship: 'Daughter', percentage: 40 }], lastContact: 'Mar 7, 2026' },
    { client: 'Daniel Park', phone: '(555) 654-7890', email: 'dpark@email.com', dateOfBirth: '08/20/1960', city: 'Decatur', state: 'GA', policyType: 'Annuity', policyNumber: 'AN-2024-0189', carrier: 'Prudential', coverageAmount: 400000, premium: 1833, annualPremium: 22000, status: 'Active', effectiveDate: 'Jan 15, 2024', draftDate: '15th', commissionRate: 70, tobacco: false, height: '5\'11"', weight: '185 lbs', beneficiaries: [{ name: 'Susan Park', relationship: 'Spouse', percentage: 50 }, { name: 'Michael Park', relationship: 'Son', percentage: 50 }], lastContact: 'Feb 18, 2026' },
    { client: 'Grace Kim', phone: '(555) 765-8901', email: 'grace.kim@yahoo.com', dateOfBirth: '01/05/1958', city: 'Alpharetta', state: 'GA', policyType: 'Final Expense', policyNumber: 'FE-2024-0672', carrier: 'Mutual of Omaha', coverageAmount: 15000, premium: 82, annualPremium: 980, status: 'New', effectiveDate: 'Jan 1, 2025', draftDate: '1st', commissionRate: 95, tobacco: false, height: '5\'2"', weight: '120 lbs', conditions: 'Osteoarthritis', medications: 'Celebrex 200mg', beneficiaries: [{ name: 'David Kim', relationship: 'Son', percentage: 100 }], lastContact: 'Mar 9, 2026' },
  ],
  '3': [
    { client: 'Susan Martinez', phone: '(555) 876-9012', email: 'smartinez@email.com', dateOfBirth: '10/17/1971', city: 'Houston', state: 'TX', policyType: 'Whole Life', policyNumber: 'WL-2023-0734', carrier: 'MassMutual', coverageAmount: 300000, premium: 300, annualPremium: 3600, status: 'Pending Renewal', effectiveDate: 'Mar 1, 2023', draftDate: '1st', commissionRate: 85, tobacco: false, height: '5\'6"', weight: '150 lbs', beneficiaries: [{ name: 'Carlos Martinez', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 2, 2026', nextFollowUp: 'Mar 12, 2026' },
    { client: 'Frank Anderson', phone: '(555) 987-0123', email: 'fanderson@gmail.com', dateOfBirth: '04/28/1978', city: 'Dallas', state: 'TX', policyType: 'Term Life', policyNumber: 'TL-2022-1456', carrier: 'Prudential', coverageAmount: 200000, premium: 100, annualPremium: 1200, status: 'Active', effectiveDate: 'Aug 1, 2022', expirationDate: 'Aug 1, 2042', draftDate: '1st', commissionRate: 90, tobacco: false, height: '6\'0"', weight: '190 lbs', beneficiaries: [{ name: 'Lisa Anderson', relationship: 'Spouse', percentage: 100 }], lastContact: 'Feb 22, 2026' },
    { client: 'Richard Lewis', phone: '(555) 098-1234', email: 'rlewis@outlook.com', dateOfBirth: '09/03/1982', city: 'Austin', state: 'TX', policyType: 'Term Life', policyNumber: 'TL-2023-0887', carrier: 'Pacific Life', coverageAmount: 150000, premium: 82, annualPremium: 980, status: 'Active', effectiveDate: 'May 1, 2023', expirationDate: 'May 1, 2043', draftDate: '1st', commissionRate: 88, tobacco: false, height: '5\'9"', weight: '175 lbs', beneficiaries: [{ name: 'Diana Lewis', relationship: 'Spouse', percentage: 100 }], lastContact: 'Feb 15, 2026' },
    { client: 'Angela Cooper', phone: '(555) 109-2345', email: 'acooper@email.com', dateOfBirth: '06/11/1969', city: 'San Antonio', state: 'TX', policyType: 'IUL', policyNumber: 'IU-2024-0391', carrier: 'Nationwide', coverageAmount: 500000, premium: 467, annualPremium: 5600, status: 'Active', effectiveDate: 'Jun 1, 2024', draftDate: '1st', commissionRate: 80, tobacco: false, height: '5\'7"', weight: '155 lbs', beneficiaries: [{ name: 'Jason Cooper', relationship: 'Son', percentage: 50 }, { name: 'Sara Cooper', relationship: 'Daughter', percentage: 50 }], lastContact: 'Mar 6, 2026' },
    { client: 'Betty Howard', phone: '(555) 210-3456', email: 'bhoward@yahoo.com', dateOfBirth: '03/22/1952', city: 'Fort Worth', state: 'TX', policyType: 'Final Expense', policyNumber: 'FE-2023-0445', carrier: 'Mutual of Omaha', coverageAmount: 10000, premium: 71, annualPremium: 850, status: 'Lapsed', effectiveDate: 'Feb 1, 2023', draftDate: '1st', commissionRate: 95, tobacco: true, height: '5\'3"', weight: '160 lbs', conditions: 'COPD, Hypertension', medications: 'Albuterol, Amlodipine 5mg', beneficiaries: [{ name: 'Carol Howard', relationship: 'Daughter', percentage: 100 }], lastContact: 'Jan 10, 2026', notes: 'Missed 3 payments — follow up needed' },
  ],
  '4': [
    { client: 'Dorothy Mitchell', phone: '(555) 321-7890', email: 'dmitchell@email.com', dateOfBirth: '11/29/1966', city: 'Charlotte', state: 'NC', policyType: 'IUL', policyNumber: 'IU-2023-0654', carrier: 'Nationwide', coverageAmount: 800000, premium: 700, annualPremium: 8400, status: 'Active', effectiveDate: 'Sep 1, 2023', draftDate: '1st', commissionRate: 80, tobacco: false, height: '5\'5"', weight: '140 lbs', beneficiaries: [{ name: 'Gregory Mitchell', relationship: 'Spouse', percentage: 70 }, { name: 'Tina Mitchell', relationship: 'Daughter', percentage: 30 }], lastContact: 'Mar 4, 2026' },
    { client: 'Nancy Walker', phone: '(555) 432-8901', email: 'nwalker@gmail.com', dateOfBirth: '02/08/1974', city: 'Raleigh', state: 'NC', policyType: 'IUL', policyNumber: 'IU-2024-0213', carrier: 'Pacific Life', coverageAmount: 500000, premium: 517, annualPremium: 6200, status: 'Active', effectiveDate: 'Feb 1, 2024', draftDate: '1st', commissionRate: 82, tobacco: false, height: '5\'6"', weight: '145 lbs', beneficiaries: [{ name: 'Thomas Walker', relationship: 'Spouse', percentage: 100 }], lastContact: 'Feb 27, 2026', notes: 'Filed complaint — needs resolution' },
    { client: 'Roy Bennett', phone: '(555) 543-9012', email: 'rbennett@outlook.com', dateOfBirth: '07/16/1979', city: 'Durham', state: 'NC', policyType: 'Term Life', policyNumber: 'TL-2023-1102', carrier: 'Prudential', coverageAmount: 350000, premium: 175, annualPremium: 2100, status: 'Pending Renewal', effectiveDate: 'Mar 1, 2023', expirationDate: 'Mar 1, 2043', draftDate: '1st', commissionRate: 90, tobacco: false, height: '5\'11"', weight: '200 lbs', conditions: 'High cholesterol', medications: 'Atorvastatin 20mg', beneficiaries: [{ name: 'Marie Bennett', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 1, 2026', nextFollowUp: 'Mar 14, 2026' },
    { client: 'Jean Sanders', phone: '(555) 654-0123', email: 'jsanders@email.com', dateOfBirth: '12/01/1983', city: 'Greensboro', state: 'NC', policyType: 'Whole Life', policyNumber: 'WL-2024-0567', carrier: 'MassMutual', coverageAmount: 250000, premium: 267, annualPremium: 3200, status: 'New', effectiveDate: 'Dec 1, 2024', draftDate: '1st', commissionRate: 85, tobacco: false, height: '5\'4"', weight: '130 lbs', beneficiaries: [{ name: 'Paul Sanders', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 8, 2026', nextFollowUp: 'Apr 1, 2026' },
  ],
  '5': [
    { client: 'George Turner', phone: '(555) 765-1234', email: 'gturner@email.com', dateOfBirth: '05/09/1958', city: 'Phoenix', state: 'AZ', policyType: 'Annuity', policyNumber: 'AN-2023-0478', carrier: 'Pacific Life', coverageAmount: 300000, premium: 1250, annualPremium: 15000, status: 'Active', effectiveDate: 'Apr 1, 2023', draftDate: '1st', commissionRate: 70, tobacco: false, height: '5\'10"', weight: '175 lbs', conditions: 'Pre-diabetic', beneficiaries: [{ name: 'Martha Turner', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 3, 2026', nextFollowUp: 'Mar 20, 2026', notes: 'Rate increase pending — review with client' },
    { client: 'Marie Collins', phone: '(555) 876-2345', email: 'mcollins@gmail.com', dateOfBirth: '08/14/1973', city: 'Scottsdale', state: 'AZ', policyType: 'Whole Life', policyNumber: 'WL-2023-0912', carrier: 'MassMutual', coverageAmount: 400000, premium: 317, annualPremium: 3800, status: 'Active', effectiveDate: 'Jul 1, 2023', draftDate: '1st', commissionRate: 85, tobacco: false, height: '5\'5"', weight: '138 lbs', beneficiaries: [{ name: 'Brian Collins', relationship: 'Spouse', percentage: 60 }, { name: 'Emma Collins', relationship: 'Daughter', percentage: 40 }], lastContact: 'Feb 24, 2026' },
    { client: 'Peter Edwards', phone: '(555) 987-3456', email: 'pedwards@outlook.com', dateOfBirth: '01/30/1981', city: 'Mesa', state: 'AZ', policyType: 'Term Life', policyNumber: 'TL-2024-0889', carrier: 'Prudential', coverageAmount: 300000, premium: 138, annualPremium: 1650, status: 'Active', effectiveDate: 'Aug 1, 2024', expirationDate: 'Aug 1, 2054', draftDate: '1st', commissionRate: 88, tobacco: false, height: '6\'0"', weight: '185 lbs', beneficiaries: [{ name: 'Sarah Edwards', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 7, 2026' },
    { client: 'Sandra Bell', phone: '(555) 098-4567', email: 'sbell@email.com', dateOfBirth: '10/22/1967', city: 'Tempe', state: 'AZ', policyType: 'IUL', policyNumber: 'IU-2024-0556', carrier: 'Nationwide', coverageAmount: 450000, premium: 433, annualPremium: 5200, status: 'Pending Renewal', effectiveDate: 'Mar 1, 2024', draftDate: '1st', commissionRate: 80, tobacco: false, height: '5\'7"', weight: '150 lbs', beneficiaries: [{ name: 'Richard Bell', relationship: 'Spouse', percentage: 100 }], lastContact: 'Feb 19, 2026', nextFollowUp: 'Mar 12, 2026' },
  ],
  '6': [
    { client: 'David Garcia', phone: '(555) 109-5678', email: 'dgarcia@email.com', dateOfBirth: '04/03/1962', city: 'Denver', state: 'CO', policyType: 'Annuity', policyNumber: 'AN-2024-0234', carrier: 'Pacific Life', coverageAmount: 250000, premium: 1042, annualPremium: 12500, status: 'Pending Renewal', effectiveDate: 'Mar 1, 2024', draftDate: '1st', commissionRate: 72, tobacco: false, height: '5\'9"', weight: '170 lbs', beneficiaries: [{ name: 'Elena Garcia', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 6, 2026', nextFollowUp: 'Mar 15, 2026' },
    { client: 'Carol Robinson', phone: '(555) 210-6789', email: 'crobinson@gmail.com', dateOfBirth: '07/19/1970', city: 'Boulder', state: 'CO', policyType: 'Whole Life', policyNumber: 'WL-2023-0678', carrier: 'MassMutual', coverageAmount: 500000, premium: 400, annualPremium: 4800, status: 'Active', effectiveDate: 'May 1, 2023', draftDate: '1st', commissionRate: 85, tobacco: false, height: '5\'6"', weight: '142 lbs', beneficiaries: [{ name: 'Daniel Robinson', relationship: 'Spouse', percentage: 70 }, { name: 'Amy Robinson', relationship: 'Daughter', percentage: 30 }], lastContact: 'Feb 28, 2026' },
    { client: 'Mark Taylor', phone: '(555) 321-7891', email: 'mtaylor@outlook.com', dateOfBirth: '02/11/1976', city: 'Aurora', state: 'CO', policyType: 'IUL', policyNumber: 'IU-2023-0923', carrier: 'Nationwide', coverageAmount: 700000, premium: 633, annualPremium: 7600, status: 'Active', effectiveDate: 'Oct 1, 2023', draftDate: '1st', commissionRate: 80, tobacco: false, height: '6\'2"', weight: '205 lbs', beneficiaries: [{ name: 'Jennifer Taylor', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 4, 2026' },
    { client: 'Diane Scott', phone: '(555) 432-8902', email: 'dscott@email.com', dateOfBirth: '09/25/1984', city: 'Lakewood', state: 'CO', policyType: 'Term Life', policyNumber: 'TL-2024-1234', carrier: 'Prudential', coverageAmount: 350000, premium: 158, annualPremium: 1900, status: 'Active', effectiveDate: 'Jun 1, 2024', expirationDate: 'Jun 1, 2054', draftDate: '1st', commissionRate: 88, tobacco: false, height: '5\'4"', weight: '128 lbs', beneficiaries: [{ name: 'Kevin Scott', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 9, 2026' },
    { client: 'Larry Adams', phone: '(555) 543-9013', email: 'ladams@yahoo.com', dateOfBirth: '11/15/1950', city: 'Fort Collins', state: 'CO', policyType: 'Final Expense', policyNumber: 'FE-2024-0334', carrier: 'Mutual of Omaha', coverageAmount: 20000, premium: 92, annualPremium: 1100, status: 'New', effectiveDate: 'Jan 1, 2025', draftDate: '1st', commissionRate: 95, tobacco: true, height: '5\'8"', weight: '165 lbs', conditions: 'Emphysema', medications: 'Spiriva', beneficiaries: [{ name: 'Dorothy Adams', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 10, 2026' },
  ],
  '7': [
    { client: 'Patricia Williams', phone: '(555) 654-0124', email: 'pwilliams@email.com', dateOfBirth: '06/07/1977', city: 'Nashville', state: 'TN', policyType: 'Term Life', policyNumber: 'TL-2022-0987', carrier: 'Pacific Life', coverageAmount: 300000, premium: 154, annualPremium: 1850, status: 'Pending Renewal', effectiveDate: 'Mar 1, 2022', expirationDate: 'Mar 1, 2042', draftDate: '1st', commissionRate: 90, tobacco: false, height: '5\'5"', weight: '135 lbs', beneficiaries: [{ name: 'Mark Williams', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 2, 2026', nextFollowUp: 'Mar 10, 2026' },
    { client: 'Alice Morgan', phone: '(555) 765-1235', email: 'amorgan@gmail.com', dateOfBirth: '03/12/1968', city: 'Memphis', state: 'TN', policyType: 'Whole Life', policyNumber: 'WL-2023-0445', carrier: 'MassMutual', coverageAmount: 500000, premium: 433, annualPremium: 5200, status: 'Active', effectiveDate: 'Apr 1, 2023', draftDate: '1st', commissionRate: 85, tobacco: false, height: '5\'7"', weight: '148 lbs', beneficiaries: [{ name: 'Tom Morgan', relationship: 'Spouse', percentage: 60 }, { name: 'Lucy Morgan', relationship: 'Daughter', percentage: 40 }], lastContact: 'Feb 26, 2026' },
    { client: 'Brian Kelly', phone: '(555) 876-2346', email: 'bkelly@outlook.com', dateOfBirth: '12/21/1965', city: 'Knoxville', state: 'TN', policyType: 'IUL', policyNumber: 'IU-2024-0178', carrier: 'Nationwide', coverageAmount: 1000000, premium: 742, annualPremium: 8900, status: 'Active', effectiveDate: 'Jan 1, 2024', draftDate: '1st', commissionRate: 78, tobacco: false, height: '6\'0"', weight: '190 lbs', beneficiaries: [{ name: 'Donna Kelly', relationship: 'Spouse', percentage: 50 }, { name: 'Sean Kelly', relationship: 'Son', percentage: 25 }, { name: 'Megan Kelly', relationship: 'Daughter', percentage: 25 }], lastContact: 'Mar 5, 2026', notes: 'High-value client — VIP treatment' },
    { client: 'Christine Lee', phone: '(555) 987-3457', email: 'clee@email.com', dateOfBirth: '08/04/1961', city: 'Chattanooga', state: 'TN', policyType: 'Annuity', policyNumber: 'AN-2024-0567', carrier: 'Prudential', coverageAmount: 350000, premium: 1500, annualPremium: 18000, status: 'Active', effectiveDate: 'May 1, 2024', draftDate: '1st', commissionRate: 70, tobacco: false, height: '5\'3"', weight: '125 lbs', beneficiaries: [{ name: 'Henry Lee', relationship: 'Spouse', percentage: 100 }], lastContact: 'Mar 8, 2026' },
    { client: 'Paul Nelson', phone: '(555) 098-4568', email: 'pnelson@gmail.com', dateOfBirth: '05/28/1986', city: 'Clarksville', state: 'TN', policyType: 'Term Life', policyNumber: 'TL-2024-0654', carrier: 'Pacific Life', coverageAmount: 400000, premium: 183, annualPremium: 2200, status: 'Active', effectiveDate: 'Jul 1, 2024', expirationDate: 'Jul 1, 2054', draftDate: '1st', commissionRate: 88, tobacco: false, height: '5\'10"', weight: '178 lbs', beneficiaries: [{ name: 'Rebecca Nelson', relationship: 'Spouse', percentage: 100 }], lastContact: 'Feb 22, 2026' },
    { client: 'Ruth Campbell', phone: '(555) 109-5679', email: 'rcampbell@yahoo.com', dateOfBirth: '01/19/1953', city: 'Franklin', state: 'TN', policyType: 'Final Expense', policyNumber: 'FE-2023-0789', carrier: 'Mutual of Omaha', coverageAmount: 15000, premium: 79, annualPremium: 950, status: 'Active', effectiveDate: 'Sep 1, 2023', draftDate: '1st', commissionRate: 95, tobacco: false, height: '5\'2"', weight: '118 lbs', conditions: 'Mild arthritis', medications: 'Ibuprofen PRN', beneficiaries: [{ name: 'John Campbell', relationship: 'Son', percentage: 100 }], lastContact: 'Mar 1, 2026' },
  ],
  '8': [
    { client: 'Harold Peters', phone: '(555) 210-6790', email: 'hpeters@email.com', dateOfBirth: '10/06/1964', city: 'Chicago', state: 'IL', policyType: 'Whole Life', policyNumber: 'WL-2023-0321', carrier: 'MassMutual', coverageAmount: 500000, premium: 433, annualPremium: 5200, status: 'Active', effectiveDate: 'Mar 1, 2023', draftDate: '1st', commissionRate: 85, tobacco: false, height: '5\'11"', weight: '195 lbs', conditions: 'Controlled hypertension', medications: 'Losartan 50mg', beneficiaries: [{ name: 'Dorothy Peters', relationship: 'Spouse', percentage: 100 }], lastContact: 'Feb 20, 2026', notes: 'Lapse warning issued — priority contact' },
    { client: 'Barbara Clark', phone: '(555) 321-7892', email: 'bclark@gmail.com', dateOfBirth: '04/17/1971', city: 'Naperville', state: 'IL', policyType: 'Whole Life', policyNumber: 'WL-2024-0112', carrier: 'Prudential', coverageAmount: 300000, premium: 317, annualPremium: 3800, status: 'Active', effectiveDate: 'Feb 1, 2024', draftDate: '1st', commissionRate: 85, tobacco: false, height: '5\'4"', weight: '140 lbs', beneficiaries: [{ name: 'Raymond Clark', relationship: 'Spouse', percentage: 100 }], lastContact: 'Jan 30, 2026', notes: 'No contact in 60 days' },
    { client: 'Edward Rivera', phone: '(555) 432-8903', email: 'erivera@outlook.com', dateOfBirth: '07/23/1980', city: 'Evanston', state: 'IL', policyType: 'Term Life', policyNumber: 'TL-2023-0776', carrier: 'Pacific Life', coverageAmount: 200000, premium: 117, annualPremium: 1400, status: 'Lapsed', effectiveDate: 'Jun 1, 2023', expirationDate: 'Jun 1, 2043', draftDate: '1st', commissionRate: 90, tobacco: true, height: '5\'8"', weight: '172 lbs', beneficiaries: [{ name: 'Maria Rivera', relationship: 'Spouse', percentage: 100 }], lastContact: 'Dec 15, 2025', notes: 'Policy lapsed — reinstatement attempt needed' },
    { client: 'Gloria Flores', phone: '(555) 543-9014', email: 'gflores@email.com', dateOfBirth: '09/10/1976', city: 'Schaumburg', state: 'IL', policyType: 'IUL', policyNumber: 'IU-2024-0445', carrier: 'Nationwide', coverageAmount: 400000, premium: 375, annualPremium: 4500, status: 'Active', effectiveDate: 'Aug 1, 2024', draftDate: '1st', commissionRate: 80, tobacco: false, height: '5\'5"', weight: '135 lbs', beneficiaries: [{ name: 'Miguel Flores', relationship: 'Spouse', percentage: 60 }, { name: 'Isabella Flores', relationship: 'Daughter', percentage: 40 }], lastContact: 'Mar 7, 2026' },
  ],
};

/* ── Policy Type Colors ────────────────────────────────────── */
const POLICY_TYPE_COLORS: Record<string, string> = {
  'Term Life': '#059669',
  'Whole Life': '#0d9488',
  IUL: '#6366f1',
  'Final Expense': '#f59e0b',
  Annuity: '#ec4899',
};

/* ── Risk Reason Badge Colors ────────────────────────────── */
const RISK_REASON_COLORS: Record<RiskReason, { bg: string; text: string }> = {
  'Lapse Warning': { bg: 'bg-red-100', text: 'text-red-700' },
  'Complaint Filed': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'Payment Missed': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'No Contact 60d': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Rate Increase Pending': { bg: 'bg-violet-100', text: 'text-violet-700' },
};

const RISK_LEVEL_COLORS: Record<RiskLevel, { bg: string; text: string }> = {
  high: { bg: 'bg-red-100', text: 'text-red-700' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700' },
};

/* ── Helpers ─────────────────────────────────────────────── */
function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function healthDotColor(retention: number): string {
  if (retention >= 90) return '#059669'; // emerald-600
  if (retention >= 80) return '#d97706'; // amber-600
  return '#dc2626'; // red-600
}

/* ── SVG Retention Line Chart ────────────────────────────── */
function RetentionChart() {
  const chartWidth = 280;
  const chartHeight = 140;
  const padX = 36;
  const padY = 16;
  const padBottom = 24;
  const innerW = chartWidth - padX * 2;
  const innerH = chartHeight - padY - padBottom;

  const minVal = 91.5;
  const maxVal = 95;
  const range = maxVal - minVal;

  const points = RETENTION_TREND.map((d, i) => {
    const x = padX + (i / (RETENTION_TREND.length - 1)) * innerW;
    const y = padY + innerH - ((d.value - minVal) / range) * innerH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + innerH} L ${points[0].x} ${padY + innerH} Z`;

  // Y-axis labels
  const yLabels = [92, 93, 94, 95];

  return (
    <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
      {/* Grid lines */}
      {yLabels.map((v) => {
        const y = padY + innerH - ((v - minVal) / range) * innerH;
        return (
          <g key={v}>
            <line x1={padX} y1={y} x2={chartWidth - padX} y2={y} stroke={COLORS.gray[200]} strokeWidth={0.5} />
            <text x={padX - 6} y={y + 3} textAnchor="end" fill={COLORS.gray[400]} fontSize={9}>
              {v}%
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <defs>
        <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#059669" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#retentionGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#059669" stroke="white" strokeWidth={2} />
      ))}

      {/* X-axis labels */}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={chartHeight - 4} textAnchor="middle" fill={COLORS.gray[400]} fontSize={9}>
          {p.month}
        </text>
      ))}
    </svg>
  );
}

/* ── At-Risk Client Profile Lookup ────────────────────────── */
const ALL_CLIENT_PROFILES: ClientProfile[] = Object.values(AGENT_CLIENTS).flat();
const CLIENT_PROFILE_MAP: Record<string, ClientProfile> = {};
ALL_CLIENT_PROFILES.forEach((c) => { CLIENT_PROFILE_MAP[c.client] = c; });

/* ── Main Component ──────────────────────────────────────── */
export function ManagerClientHealth() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sortKey, setSortKey] = useState<SortKey>('clients');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENT_BOOK[number] | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [bookSearch, setBookSearch] = useState('');
  const [bookStatusFilter, setBookStatusFilter] = useState<PolicyStatus | 'All'>('All');
  const [riskDrawerClient, setRiskDrawerClient] = useState<ClientProfile | null>(null);

  const closeDrawer = () => {
    setSelectedAgent(null);
    setSelectedClient(null);
    setBookSearch('');
    setBookStatusFilter('All');
  };

  /* Sorting logic */
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedAgents = [...AGENT_BOOK].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    switch (sortKey) {
      case 'name': return mul * a.name.localeCompare(b.name);
      case 'clients': return mul * (a.totalClients - b.totalClients);
      case 'premium': return mul * (a.totalPremium - b.totalPremium);
      case 'retention': return mul * (a.retention - b.retention);
      case 'nps': return mul * (a.nps - b.nps);
      default: return 0;
    }
  });

  /* Risk filter */
  const filteredRiskClients = AT_RISK_CLIENTS.filter((c) => {
    if (riskFilter === 'all') return true;
    return c.riskLevel === riskFilter;
  });

  /* Sort indicator */
  const SortIndicator = ({ column }: { column: SortKey }) => (
    <span className="ml-1 text-gray-400" style={{ fontSize: 10 }}>
      {sortKey === column ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
    </span>
  );

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ── Hero ─────────────────────────────────────────── */}
        <ManagerPageHero
          icon={Briefcase}
          title="Book of Business"
          subtitle="Client retention, satisfaction, and portfolio health"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={Users}
              value={847}
              label="Total Clients"
              delta={12}
              periodLabel="vs last month"
            />
            <ManagerStatCard
              icon={Shield}
              value="94.2%"
              label="Retention Rate"
              sparklineData={[...SPARKLINE_RETENTION]}
              delta={1.2}
              deltaFormat="percent"
              periodLabel="vs last month"
              northStar
            />
            <ManagerStatCard
              icon={AlertTriangle}
              value={23}
              label="At-Risk Clients"
              delta={-3}
              periodLabel="vs last month"
            />
            <ManagerStatCard
              icon={TrendingUp}
              value="72%"
              label="Client Satisfaction"
              delta={4}
              periodLabel="vs last quarter"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Tab Switcher ─────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center p-1 gap-1 w-fit" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
            {[
              { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
              { id: 'at-risk' as Tab, label: 'At Risk', icon: AlertTriangle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 font-medium border-0 transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'bg-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  borderRadius: RADIUS.button,
                  padding: '4px 12px',
                  fontSize: TYPE.meta,
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                }}
              >
                <tab.icon size={LAYOUT.icon.md} />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── TAB: Overview ──────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            {/* Golden ratio grid */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
              style={{ gap: GRID.spacing.md }}
            >
              {/* ── Left Column (1.618fr) ──────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {/* Client Base */}
                <Card
                  className="overflow-hidden"
                  style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
                >
                  <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                    <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <Briefcase className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Client Base</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                          <tr>
                            {[
                              { key: 'name' as SortKey, label: 'Agent' },
                              { key: 'clients' as SortKey, label: 'Clients' },
                              { key: 'premium' as SortKey, label: 'Premium' },
                              { key: 'retention' as SortKey, label: 'Retention' },
                              { key: 'nps' as SortKey, label: 'Satisfaction' },
                            ].map((col) => (
                              <th
                                key={col.key}
                                className="text-left text-gray-500 font-medium cursor-pointer select-none"
                                style={{
                                  fontSize: TYPE.micro,
                                  padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`,
                                  borderBottom: `1px solid ${COLORS.gray[200]}`,
                                  whiteSpace: 'nowrap',
                                }}
                                onClick={() => handleSort(col.key)}
                              >
                                {col.label}
                                <SortIndicator column={col.key} />
                              </th>
                            ))}
                            <th
                              className="text-left text-gray-500 font-medium"
                              style={{
                                fontSize: TYPE.micro,
                                padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`,
                                borderBottom: `1px solid ${COLORS.gray[200]}`,
                                width: 100,
                              }}
                            />
                          </tr>
                        </thead>
                        <tbody>
                          {sortedAgents.map((agent) => (
                            <motion.tr
                              key={agent.id}
                              whileHover={{
                                backgroundColor: COLORS.gray[50],
                                transition: { duration: MOTION.duration.hover },
                              }}
                            >
                              <td style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px` }}>
                                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                  <div
                                    className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: RADIUS.button,
                                      fontSize: TYPE.micro,
                                    }}
                                  >
                                    {agent.avatar}
                                  </div>
                                  <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{agent.name}</span>
                                </div>
                              </td>
                              <td className="text-gray-700" style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`, fontSize: TYPE.meta }}>
                                {agent.totalClients}
                              </td>
                              <td className="text-gray-700" style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`, fontSize: TYPE.meta }}>
                                ${agent.totalPremium.toLocaleString()}
                              </td>
                              <td className="font-medium" style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`, color: healthDotColor(agent.retention), fontSize: TYPE.meta }}>
                                {agent.retention}%
                              </td>
                              <td className="text-gray-700" style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`, fontSize: TYPE.meta }}>
                                {agent.nps}%
                              </td>
                              <td style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px` }}>
                                <motion.button
                                  onClick={() => setSelectedAgent(agent)}
                                  className="flex items-center font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-white"
                                  style={{
                                    fontSize: TYPE.caption,
                                    padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                                    borderRadius: RADIUS.button,
                                    gap: 4,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <BookOpen size={LAYOUT.icon.xs} />
                                  Open Book
                                </motion.button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Policy Distribution */}
                <Card
                  className="overflow-hidden"
                  style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
                >
                  <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                    <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <BarChart3 className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Policy Distribution</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    {/* Stacked bar */}
                    <div
                      className="flex overflow-hidden"
                      style={{ height: 32, borderRadius: RADIUS.button, marginBottom: GRID.spacing.sm }}
                    >
                      {POLICY_DISTRIBUTION.map((p) => (
                        <motion.div
                          key={p.type}
                          initial={{ width: 0 }}
                          animate={{ width: `${p.percentage}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                          style={{ backgroundColor: p.color, height: '100%' }}
                          className="relative group"
                        />
                      ))}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                      {POLICY_DISTRIBUTION.map((p) => (
                        <div key={p.type} className="flex items-center justify-between">
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 3,
                                backgroundColor: p.color,
                                flexShrink: 0,
                              }}
                            />
                            <span className="text-gray-700" style={{ fontSize: TYPE.meta }}>{p.type}</span>
                          </div>
                          <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                            <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{p.count} policies</span>
                            <span className="text-gray-900 font-semibold" style={{ minWidth: 36, textAlign: 'right', fontSize: TYPE.meta }}>
                              {p.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── Right Column (1fr) ─────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {/* Retention Trend */}
                <Card
                  className="overflow-hidden"
                  style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
                >
                  <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                    <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <TrendingUp className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Retention Trend</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    <RetentionChart />
                  </CardContent>
                </Card>

                {/* Top Renewal Opportunities */}
                <Card
                  className="overflow-hidden"
                  style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
                >
                  <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                    <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <Calendar className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Top Renewal Opportunities</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                      {UPCOMING_RENEWALS.map((renewal, idx) => (
                        <motion.div
                          key={idx}
                          className="flex items-center"
                          style={{
                            padding: 12,
                            borderRadius: RADIUS.button,
                            gap: 12,
                          }}
                          whileHover={{
                            backgroundColor: COLORS.gray[50],
                            transition: { duration: MOTION.duration.hover },
                          }}
                        >
                          {/* Agent avatar */}
                          <div
                            className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: RADIUS.button,
                              fontSize: TYPE.micro,
                            }}
                          >
                            {renewal.agentAvatar}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{renewal.client}</p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              {renewal.policyType} · ${renewal.premium.toLocaleString()}/yr
                            </p>
                          </div>

                          {/* Renewal date */}
                          <span className="text-gray-400 flex-shrink-0" style={{ fontSize: TYPE.caption }}>
                            {renewal.renewalDate}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}

        {/* ── TAB: At Risk ───────────────────────────────────── */}
        {activeTab === 'at-risk' && (
          <>
            <motion.div variants={fadeInUp}>
              <Card
                className="overflow-hidden"
                style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
              >
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <AlertTriangle className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">At-Risk Clients</span>
                    </CardTitle>

                    {/* Filter pills */}
                    <div className="flex items-center p-1 gap-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
                      {[
                        { id: 'all' as RiskFilter, label: 'All' },
                        { id: 'high' as RiskFilter, label: 'High Risk' },
                        { id: 'medium' as RiskFilter, label: 'Medium Risk' },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setRiskFilter(filter.id)}
                          className={`font-medium border-0 transition-all ${
                            riskFilter === filter.id
                              ? 'bg-white text-emerald-700 shadow-sm'
                              : 'bg-transparent text-gray-500 hover:text-gray-700'
                          }`}
                          style={{
                            borderRadius: RADIUS.button,
                            padding: '4px 12px',
                            fontSize: TYPE.meta,
                            cursor: 'pointer',
                            fontWeight: riskFilter === filter.id ? 600 : 500,
                          }}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    {filteredRiskClients.map((client) => {
                      const reasonColor = RISK_REASON_COLORS[client.riskReason];
                      const levelColor = RISK_LEVEL_COLORS[client.riskLevel];

                      const ActionIcon = client.action === 'Contact' ? Phone : client.action === 'Review' ? FileSearch : ArrowUpRight;

                      return (
                        <motion.div
                          key={client.id}
                          className="flex items-center cursor-pointer"
                          style={{
                            padding: 12,
                            borderRadius: RADIUS.button,
                            gap: 12,
                          }}
                          whileHover={{
                            backgroundColor: COLORS.gray[50],
                            transition: { duration: MOTION.duration.hover },
                          }}
                          onClick={() => {
                            const profile = CLIENT_PROFILE_MAP[client.client];
                            if (profile) setRiskDrawerClient(profile);
                          }}
                        >
                          {/* Client info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{client.client}</p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              {client.policyType} · ${client.premium.toLocaleString()}/yr
                            </p>
                          </div>

                          {/* Agent avatar + name */}
                          <div className="flex items-center flex-shrink-0" style={{ gap: 6 }}>
                            <div
                              className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600"
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: RADIUS.button,
                                fontSize: 9,
                              }}
                            >
                              {client.agentAvatar}
                            </div>
                            <span className="text-gray-500 hidden sm:inline" style={{ fontSize: TYPE.caption }}>{client.agentName}</span>
                          </div>

                          {/* Risk reason badge */}
                          <span
                            className={`inline-flex items-center font-medium flex-shrink-0 ${reasonColor.bg} ${reasonColor.text}`}
                            style={{
                              borderRadius: RADIUS.pill,
                              padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                              fontSize: TYPE.micro,
                            }}
                          >
                            {client.riskReason}
                          </span>

                          {/* Risk level */}
                          <span
                            className={`inline-flex items-center font-semibold flex-shrink-0 ${levelColor.bg} ${levelColor.text}`}
                            style={{
                              borderRadius: RADIUS.pill,
                              padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                              fontSize: TYPE.micro,
                              minWidth: 56,
                              justifyContent: 'center',
                            }}
                          >
                            {client.riskLevel === 'high' ? 'High' : 'Medium'}
                          </span>

                          {/* Action button */}
                          <motion.button
                            onClick={() => toast.success(`${client.action} initiated for ${client.client}`)}
                            className="flex items-center font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-transparent flex-shrink-0"
                            style={{
                              fontSize: TYPE.caption,
                              padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                              borderRadius: RADIUS.button,
                              gap: 4,
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ActionIcon size={LAYOUT.icon.xs} />
                            {client.action}
                          </motion.button>
                        </motion.div>
                      );
                    })}

                    {filteredRiskClients.length === 0 && (
                      <div className="text-center text-gray-400 py-8" style={{ fontSize: TYPE.meta }}>
                        No clients match the selected filter.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* ── Agent Book of Business Drawer ─────────────────── */}
      <AnimatePresence>
        {selectedAgent && (() => {
          const agentClients = AGENT_CLIENTS[selectedAgent.id] || [];
          const filteredBookClients = agentClients.filter((c) => {
            const matchesSearch = bookSearch === '' ||
              c.client.toLowerCase().includes(bookSearch.toLowerCase()) ||
              c.policyNumber.toLowerCase().includes(bookSearch.toLowerCase()) ||
              c.email.toLowerCase().includes(bookSearch.toLowerCase());
            const matchesStatus = bookStatusFilter === 'All' || c.status === bookStatusFilter;
            return matchesSearch && matchesStatus;
          });

          return (
            <>
              {/* Overlay */}
              <motion.div
                key="drawer-overlay"
                className="fixed inset-0 z-50"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeDrawer}
              />

              {/* Panel */}
              <motion.div
                key="drawer-panel"
                initial={{ x: 560 }}
                animate={{ x: 0 }}
                exit={{ x: 560 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                style={{
                  width: 560,
                  maxWidth: '100vw',
                  backgroundColor: '#ffffff',
                  boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
                }}
              >
                {/* Gradient Header with Inline KPIs */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    background: MANAGER_GRADIENT_CSS,
                    padding: GRID.spacing.md,
                  }}
                >
                  <div style={{ width: 120, height: 120, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm" />
                  <div style={{ width: 80, height: 80, borderRadius: RADIUS.pill }} className="absolute bottom-0 left-0 bg-amber-400/15 translate-y-1/2 -translate-x-1/4 blur-md" />

                  <motion.button
                    onClick={closeDrawer}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute flex items-center justify-center text-white/80 hover:text-white bg-white/15 hover:bg-white/25"
                    style={{
                      top: GRID.spacing.sm,
                      right: GRID.spacing.sm,
                      width: LAYOUT.icon.xl,
                      height: LAYOUT.icon.xl,
                      borderRadius: RADIUS.button,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <X style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                  </motion.button>

                  <div className="relative z-10 flex items-center" style={{ gap: GRID.spacing.md }}>
                    <div
                      className="flex items-center justify-center text-white font-bold bg-white/20 backdrop-blur flex-shrink-0"
                      style={{
                        width: GRID.spacing.xxxl,
                        height: GRID.spacing.xxxl,
                        borderRadius: RADIUS.card,
                        fontSize: TYPE.title,
                        border: '1px solid rgba(255,255,255,0.25)',
                      }}
                    >
                      {selectedAgent.avatar}
                    </div>
                    <div>
                      <h2 className="font-bold text-white" style={{ fontSize: TYPE.section }}>
                        {selectedAgent.name}
                      </h2>
                      <p className="text-white/80" style={{ fontSize: TYPE.meta }}>
                        Book of Business
                      </p>
                    </div>
                  </div>

                  {/* Inline KPI Row */}
                  <div className="relative z-10 grid grid-cols-4" style={{ marginTop: GRID.spacing.sm, gap: GRID.spacing.xs }}>
                    {[
                      { label: 'Clients', value: String(selectedAgent.totalClients) },
                      { label: 'Premium', value: formatCurrency(selectedAgent.totalPremium) },
                      { label: 'Retention', value: `${selectedAgent.retention}%` },
                      { label: 'Satisfaction', value: `${selectedAgent.nps}%` },
                    ].map((kpi) => (
                      <div key={kpi.label} className="text-center">
                        <p className="text-white font-bold" style={{ fontSize: TYPE.body }}>{kpi.value}</p>
                        <p className="text-white/60" style={{ fontSize: TYPE.micro }}>{kpi.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Drawer Content — File List or Client Detail */}
                <AnimatePresence mode="wait">
                  {!selectedClient ? (
                    <motion.div
                      key="file-list"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Search & Filter */}
                      <div style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px 0` }}>
                        <div className="relative" style={{ marginBottom: GRID.spacing.sm }}>
                          <Search
                            className="absolute text-gray-400"
                            style={{ left: 12, top: '50%', transform: 'translateY(-50%)', width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }}
                          />
                          <input
                            type="text"
                            placeholder="Search clients..."
                            value={bookSearch}
                            onChange={(e) => setBookSearch(e.target.value)}
                            className="w-full text-gray-900 border border-gray-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
                            style={{ fontSize: TYPE.meta, padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px ${GRID.spacing.xs}px 36px`, borderRadius: RADIUS.input, backgroundColor: COLORS.gray[50] }}
                          />
                        </div>
                        <div className="flex items-center p-1 gap-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
                          {(['All', 'Active', 'Pending Renewal', 'Lapsed', 'New'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => setBookStatusFilter(status)}
                              className={`font-medium border-0 transition-all ${bookStatusFilter === status ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                              style={{ borderRadius: RADIUS.button, padding: '4px 10px', fontSize: TYPE.micro, cursor: 'pointer', fontWeight: bookStatusFilter === status ? 600 : 500 }}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* File List */}
                      <div style={{ padding: GRID.spacing.md }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
                          <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>
                            Client Files
                          </p>
                          <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                            {filteredBookClients.length} of {agentClients.length}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                          {filteredBookClients.map((client, i) => {
                            const statusStyle = POLICY_STATUS_COLORS[client.status];
                            const StatusIcon = statusStyle.icon;
                            const typeColor = POLICY_TYPE_COLORS[client.policyType] || COLORS.gray[300];
                            return (
                              <motion.button
                                key={`${client.policyNumber}-${i}`}
                                onClick={() => setSelectedClient(client)}
                                className="flex items-center w-full text-left"
                                style={{
                                  padding: GRID.spacing.sm,
                                  borderRadius: RADIUS.input,
                                  cursor: 'pointer',
                                  border: `1px solid ${COLORS.gray[200]}`,
                                  borderLeft: `3px solid ${typeColor}`,
                                  backgroundColor: '#ffffff',
                                  gap: GRID.spacing.sm,
                                  boxShadow: SHADOW.level1,
                                }}
                                whileHover={{ backgroundColor: COLORS.gray[50], boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                                transition={{ duration: MOTION.duration.hover }}
                              >
                                {/* Status dot */}
                                <div style={{ width: 8, height: 8, borderRadius: RADIUS.pill, backgroundColor: typeColor, flexShrink: 0 }} />

                                {/* Client info */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{client.client}</p>
                                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                                    {client.policyType} · ${client.premium.toLocaleString()}/mo
                                  </p>
                                </div>

                                {/* Status badge */}
                                <span
                                  className={`inline-flex items-center font-medium flex-shrink-0 ${statusStyle.bg} ${statusStyle.text}`}
                                  style={{ borderRadius: RADIUS.pill, padding: `2px ${GRID.spacing.xs}px`, fontSize: TYPE.micro, gap: 3 }}
                                >
                                  <StatusIcon style={{ width: 10, height: 10 }} />
                                  {client.status}
                                </span>

                                {/* Chevron */}
                                <ChevronRight className="text-gray-300 flex-shrink-0" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                              </motion.button>
                            );
                          })}

                          {filteredBookClients.length === 0 && (
                            <div className="text-center text-gray-400 py-8" style={{ fontSize: TYPE.meta }}>
                              No clients match your search or filter.
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── Client Detail View ─────────────────────── */
                    <motion.div
                      key="client-detail"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                    >
                      {/* Back button */}
                      <div style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`, borderBottom: `1px solid ${COLORS.gray[100]}` }}>
                        <motion.button
                          onClick={() => setSelectedClient(null)}
                          className="flex items-center font-medium text-gray-500 hover:text-gray-900 border-0 bg-transparent"
                          style={{ gap: 4, cursor: 'pointer', fontSize: TYPE.meta, padding: 0 }}
                          whileHover={{ x: -2 }}
                        >
                          <ArrowLeft style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                          Back to files
                        </motion.button>
                      </div>

                      <div style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                        {/* Client Header */}
                        <div className="flex items-center" style={{ gap: GRID.spacing.md }}>
                          <div
                            className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                            style={{ width: 56, height: 56, borderRadius: RADIUS.card, fontSize: TYPE.title }}
                          >
                            {selectedClient.client.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.section }}>
                              {selectedClient.client}
                            </h3>
                            <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                              {selectedClient.city}, {selectedClient.state}
                            </p>
                          </div>
                          {(() => {
                            const ss = POLICY_STATUS_COLORS[selectedClient.status];
                            const SI = ss.icon;
                            return (
                              <span
                                className={`inline-flex items-center font-semibold flex-shrink-0 ${ss.bg} ${ss.text}`}
                                style={{ borderRadius: RADIUS.pill, padding: `4px ${GRID.spacing.sm}px`, fontSize: TYPE.caption, gap: 4 }}
                              >
                                <SI style={{ width: 14, height: 14 }} />
                                {selectedClient.status}
                              </span>
                            );
                          })()}
                        </div>

                        {/* Personal Information */}
                        <div
                          style={{
                            padding: GRID.spacing.sm,
                            borderRadius: RADIUS.card,
                            backgroundColor: COLORS.gray[50],
                            border: `1px solid ${COLORS.gray[200]}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: GRID.spacing.sm,
                          }}
                        >
                          <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>Personal Information</p>
                          <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                            <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                              <Calendar className="text-emerald-600 flex-shrink-0" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                              <div>
                                <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Date of Birth</p>
                                <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>{selectedClient.dateOfBirth}</p>
                              </div>
                            </div>
                            <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                              <Phone className="text-emerald-600 flex-shrink-0" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                              <div>
                                <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Phone</p>
                                <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>{selectedClient.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                              <Mail className="text-emerald-600 flex-shrink-0" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                              <div>
                                <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Email</p>
                                <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>{selectedClient.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                              <MapPin className="text-emerald-600 flex-shrink-0" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                              <div>
                                <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Location</p>
                                <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>{selectedClient.city}, {selectedClient.state}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Policy Details */}
                        {(() => {
                          const typeColor = POLICY_TYPE_COLORS[selectedClient.policyType] || COLORS.gray[300];
                          return (
                            <div
                              style={{
                                padding: GRID.spacing.sm,
                                borderRadius: RADIUS.card,
                                border: `1px solid ${COLORS.gray[200]}`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: GRID.spacing.sm,
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>Policy Details</p>
                                <span className="font-bold" style={{ fontSize: TYPE.body, color: typeColor }}>
                                  ${selectedClient.annualPremium.toLocaleString()}<span className="font-normal text-gray-400" style={{ fontSize: TYPE.caption }}>/yr</span>
                                </span>
                              </div>
                              <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                                <div>
                                  <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Policy Type</p>
                                  <p className="font-semibold" style={{ fontSize: TYPE.meta, color: typeColor }}>{selectedClient.policyType}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Carrier</p>
                                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{selectedClient.carrier}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Policy Number</p>
                                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{selectedClient.policyNumber}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Coverage Amount</p>
                                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>${selectedClient.coverageAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Monthly Premium</p>
                                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>${selectedClient.premium.toLocaleString()}/mo</p>
                                </div>
                                <div>
                                  <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Annual Premium</p>
                                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>${selectedClient.annualPremium.toLocaleString()}/yr</p>
                                </div>
                                <div>
                                  <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Effective Date</p>
                                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{selectedClient.effectiveDate}</p>
                                </div>
                                {selectedClient.expirationDate && (
                                  <div>
                                    <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Expiration Date</p>
                                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{selectedClient.expirationDate}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Draft Date</p>
                                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{selectedClient.draftDate} of month</p>
                                </div>
                                <div>
                                  <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Status</p>
                                  <p className="font-semibold" style={{ fontSize: TYPE.meta, color: typeColor }}>{selectedClient.status}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Commission Summary */}
                        <div
                          style={{
                            padding: GRID.spacing.sm,
                            borderRadius: RADIUS.card,
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: GRID.spacing.xs,
                          }}
                        >
                          <p className="font-semibold text-emerald-800" style={{ fontSize: TYPE.meta }}>Commission Summary</p>
                          <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                            <div>
                              <p className="text-emerald-600" style={{ fontSize: TYPE.micro }}>Commission Rate</p>
                              <p className="font-bold text-emerald-800" style={{ fontSize: TYPE.body }}>{selectedClient.commissionRate}%</p>
                            </div>
                            <div>
                              <p className="text-emerald-600" style={{ fontSize: TYPE.micro }}>Est. Annual Commission</p>
                              <p className="font-bold text-emerald-800" style={{ fontSize: TYPE.body }}>${Math.round(selectedClient.annualPremium * selectedClient.commissionRate / 100).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Medical Information */}
                        <div
                          style={{
                            padding: GRID.spacing.sm,
                            borderRadius: RADIUS.card,
                            border: `1px solid ${COLORS.gray[200]}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: GRID.spacing.sm,
                          }}
                        >
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <Heart className="text-rose-500" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                            <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>Medical Information</p>
                          </div>
                          <div className="grid grid-cols-3" style={{ gap: GRID.spacing.sm }}>
                            <div>
                              <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Tobacco</p>
                              <p className={`font-semibold ${selectedClient.tobacco ? 'text-red-600' : 'text-emerald-600'}`} style={{ fontSize: TYPE.meta }}>
                                {selectedClient.tobacco ? 'Yes' : 'No'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Height</p>
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{selectedClient.height}</p>
                            </div>
                            <div>
                              <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Weight</p>
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{selectedClient.weight}</p>
                            </div>
                          </div>
                          {selectedClient.conditions && (
                            <div>
                              <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Conditions</p>
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{selectedClient.conditions}</p>
                            </div>
                          )}
                          {selectedClient.medications && (
                            <div>
                              <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Medications</p>
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{selectedClient.medications}</p>
                            </div>
                          )}
                        </div>

                        {/* Beneficiaries */}
                        <div
                          style={{
                            padding: GRID.spacing.sm,
                            borderRadius: RADIUS.card,
                            border: `1px solid ${COLORS.gray[200]}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: GRID.spacing.sm,
                          }}
                        >
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <Users className="text-indigo-500" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                            <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>Beneficiaries</p>
                          </div>
                          {selectedClient.beneficiaries.map((ben, i) => (
                            <div key={i} className="flex items-center justify-between" style={{ padding: GRID.spacing.xs, backgroundColor: COLORS.gray[50], borderRadius: RADIUS.input }}>
                              <div>
                                <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{ben.name}</p>
                                <p className="text-gray-500" style={{ fontSize: TYPE.micro }}>{ben.relationship}</p>
                              </div>
                              <span className="font-bold text-indigo-600" style={{ fontSize: TYPE.meta }}>{ben.percentage}%</span>
                            </div>
                          ))}
                        </div>

                        {/* Activity */}
                        <div
                          style={{
                            padding: GRID.spacing.sm,
                            borderRadius: RADIUS.card,
                            backgroundColor: COLORS.gray[50],
                            border: `1px solid ${COLORS.gray[200]}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: GRID.spacing.xs,
                          }}
                        >
                          <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>Activity</p>
                          <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                            <div>
                              <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Last Contact</p>
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{selectedClient.lastContact}</p>
                            </div>
                            {selectedClient.nextFollowUp && (
                              <div>
                                <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Next Follow-Up</p>
                                <p className="font-semibold text-emerald-700" style={{ fontSize: TYPE.meta }}>{selectedClient.nextFollowUp}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Notes */}
                        {selectedClient.notes && (
                          <div
                            style={{
                              padding: GRID.spacing.sm,
                              borderRadius: RADIUS.card,
                              backgroundColor: '#fffbeb',
                              border: '1px solid #fde68a',
                            }}
                          >
                            <p className="font-semibold text-amber-800" style={{ fontSize: TYPE.meta, marginBottom: 4 }}>Notes</p>
                            <p className="text-amber-700" style={{ fontSize: TYPE.meta }}>{selectedClient.notes}</p>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex flex-col" style={{ gap: GRID.spacing.xs }}>
                          <motion.button
                            onClick={() => toast.success(`Call initiated to ${selectedClient.client}`)}
                            className="flex items-center justify-center font-semibold text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 w-full"
                            style={{ fontSize: TYPE.meta, gap: GRID.spacing.xs, padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, cursor: 'pointer' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Phone style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                            Call Client
                          </motion.button>
                          <motion.button
                            onClick={() => toast.success(`Email drafted for ${selectedClient.client}`)}
                            className="flex items-center justify-center font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-white w-full"
                            style={{ fontSize: TYPE.meta, gap: GRID.spacing.xs, padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, cursor: 'pointer' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Mail style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                            Send Email
                          </motion.button>
                          <motion.button
                            onClick={() => toast.info(`Scheduling review for ${selectedClient.client}`)}
                            className="flex items-center justify-center font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-white w-full"
                            style={{ fontSize: TYPE.meta, gap: GRID.spacing.xs, padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, cursor: 'pointer' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Calendar style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                            Schedule Review
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
      {/* ── At-Risk Client File Drawer ──────────────────────── */}
      <AnimatePresence>
        {riskDrawerClient && (() => {
          const c = riskDrawerClient;
          const typeColor = POLICY_TYPE_COLORS[c.policyType] || COLORS.gray[300];
          const ss = POLICY_STATUS_COLORS[c.status];
          const SI = ss.icon;

          return (
            <>
              <motion.div
                key="risk-drawer-overlay"
                className="fixed inset-0 z-50"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setRiskDrawerClient(null)}
              />
              <motion.div
                key="risk-drawer-panel"
                initial={{ x: 560 }}
                animate={{ x: 0 }}
                exit={{ x: 560 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                style={{ width: 560, maxWidth: '100vw', backgroundColor: '#ffffff', boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)' }}
              >
                {/* Gradient Header */}
                <div className="relative overflow-hidden" style={{ background: MANAGER_GRADIENT_CSS, padding: GRID.spacing.md }}>
                  <div style={{ width: 120, height: 120, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm" />
                  <div style={{ width: 80, height: 80, borderRadius: RADIUS.pill }} className="absolute bottom-0 left-0 bg-amber-400/15 translate-y-1/2 -translate-x-1/4 blur-md" />

                  <motion.button
                    onClick={() => setRiskDrawerClient(null)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute flex items-center justify-center text-white/80 hover:text-white bg-white/15 hover:bg-white/25"
                    style={{ top: GRID.spacing.sm, right: GRID.spacing.sm, width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, border: 'none', cursor: 'pointer' }}
                  >
                    <X style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                  </motion.button>

                  <div className="relative z-10 flex items-center" style={{ gap: GRID.spacing.md }}>
                    <div
                      className="flex items-center justify-center text-white font-bold bg-white/20 backdrop-blur flex-shrink-0"
                      style={{ width: GRID.spacing.xxxl, height: GRID.spacing.xxxl, borderRadius: RADIUS.card, fontSize: TYPE.title, border: '1px solid rgba(255,255,255,0.25)' }}
                    >
                      {c.client.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="font-bold text-white" style={{ fontSize: TYPE.section }}>{c.client}</h2>
                      <p className="text-white/70" style={{ fontSize: TYPE.meta }}>{c.city}, {c.state}</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center mt-3" style={{ gap: GRID.spacing.sm }}>
                    <span className={`inline-flex items-center font-semibold ${ss.bg} ${ss.text}`} style={{ borderRadius: RADIUS.pill, padding: `4px ${GRID.spacing.sm}px`, fontSize: TYPE.caption, gap: 4 }}>
                      <SI style={{ width: 14, height: 14 }} />
                      {c.status}
                    </span>
                  </div>
                </div>

                {/* Client Detail Sections */}
                <div style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

                  {/* Personal Information */}
                  <div style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.card, backgroundColor: COLORS.gray[50], border: `1px solid ${COLORS.gray[200]}`, display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                    <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>Personal Information</p>
                    <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                      <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                        <Calendar className="text-emerald-600 flex-shrink-0" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                        <div>
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Date of Birth</p>
                          <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>{c.dateOfBirth}</p>
                        </div>
                      </div>
                      <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                        <Phone className="text-emerald-600 flex-shrink-0" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                        <div>
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Phone</p>
                          <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>{c.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                        <Mail className="text-emerald-600 flex-shrink-0" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                        <div>
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Email</p>
                          <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>{c.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                        <MapPin className="text-emerald-600 flex-shrink-0" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                        <div>
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Location</p>
                          <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>{c.city}, {c.state}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Policy Details */}
                  <div style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.card, border: `1px solid ${COLORS.gray[200]}`, display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>Policy Details</p>
                      <span className="font-bold" style={{ fontSize: TYPE.body, color: typeColor }}>${c.annualPremium.toLocaleString()}<span className="font-normal text-gray-400" style={{ fontSize: TYPE.caption }}>/yr</span></span>
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Policy Type</p><p className="font-semibold" style={{ fontSize: TYPE.meta, color: typeColor }}>{c.policyType}</p></div>
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Carrier</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{c.carrier}</p></div>
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Policy Number</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{c.policyNumber}</p></div>
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Coverage Amount</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>${c.coverageAmount.toLocaleString()}</p></div>
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Monthly Premium</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>${c.premium.toLocaleString()}/mo</p></div>
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Annual Premium</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>${c.annualPremium.toLocaleString()}/yr</p></div>
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Effective Date</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{c.effectiveDate}</p></div>
                      {c.expirationDate && <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Expiration Date</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{c.expirationDate}</p></div>}
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Draft Date</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{c.draftDate} of month</p></div>
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Status</p><p className="font-semibold" style={{ fontSize: TYPE.meta, color: typeColor }}>{c.status}</p></div>
                    </div>
                  </div>

                  {/* Commission Summary */}
                  <div style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.card, backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    <p className="font-semibold text-emerald-800" style={{ fontSize: TYPE.meta }}>Commission Summary</p>
                    <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                      <div><p className="text-emerald-600" style={{ fontSize: TYPE.micro }}>Commission Rate</p><p className="font-bold text-emerald-800" style={{ fontSize: TYPE.body }}>{c.commissionRate}%</p></div>
                      <div><p className="text-emerald-600" style={{ fontSize: TYPE.micro }}>Est. Annual Commission</p><p className="font-bold text-emerald-800" style={{ fontSize: TYPE.body }}>${Math.round(c.annualPremium * c.commissionRate / 100).toLocaleString()}</p></div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.card, border: `1px solid ${COLORS.gray[200]}`, display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                      <Heart className="text-rose-500" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                      <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>Medical Information</p>
                    </div>
                    <div className="grid grid-cols-3" style={{ gap: GRID.spacing.sm }}>
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Tobacco</p><p className={`font-semibold ${c.tobacco ? 'text-red-600' : 'text-emerald-600'}`} style={{ fontSize: TYPE.meta }}>{c.tobacco ? 'Yes' : 'No'}</p></div>
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Height</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{c.height}</p></div>
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Weight</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{c.weight}</p></div>
                    </div>
                    {c.conditions && <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Conditions</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{c.conditions}</p></div>}
                    {c.medications && <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Medications</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{c.medications}</p></div>}
                  </div>

                  {/* Beneficiaries */}
                  <div style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.card, border: `1px solid ${COLORS.gray[200]}`, display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                      <Users className="text-indigo-500" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                      <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>Beneficiaries</p>
                    </div>
                    {c.beneficiaries.map((ben, i) => (
                      <div key={i} className="flex items-center justify-between" style={{ padding: GRID.spacing.xs, backgroundColor: COLORS.gray[50], borderRadius: RADIUS.input }}>
                        <div>
                          <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{ben.name}</p>
                          <p className="text-gray-500" style={{ fontSize: TYPE.micro }}>{ben.relationship}</p>
                        </div>
                        <span className="font-bold text-indigo-600" style={{ fontSize: TYPE.meta }}>{ben.percentage}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Activity */}
                  <div style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.card, backgroundColor: COLORS.gray[50], border: `1px solid ${COLORS.gray[200]}`, display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>Activity</p>
                    <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                      <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Last Contact</p><p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{c.lastContact}</p></div>
                      {c.nextFollowUp && <div><p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Next Follow-Up</p><p className="font-semibold text-emerald-700" style={{ fontSize: TYPE.meta }}>{c.nextFollowUp}</p></div>}
                    </div>
                  </div>

                  {/* Notes */}
                  {c.notes && (
                    <div style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.card, backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                      <p className="font-semibold text-amber-800" style={{ fontSize: TYPE.meta, marginBottom: 4 }}>Notes</p>
                      <p className="text-amber-700" style={{ fontSize: TYPE.meta }}>{c.notes}</p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex flex-col" style={{ gap: GRID.spacing.xs }}>
                    <motion.button
                      onClick={() => toast.success(`Call initiated to ${c.client}`)}
                      className="flex items-center justify-center font-semibold text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 w-full"
                      style={{ fontSize: TYPE.meta, gap: GRID.spacing.xs, padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, cursor: 'pointer' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Phone style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                      Call Client
                    </motion.button>
                    <motion.button
                      onClick={() => toast.success(`Email drafted for ${c.client}`)}
                      className="flex items-center justify-center font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-white w-full"
                      style={{ fontSize: TYPE.meta, gap: GRID.spacing.xs, padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, cursor: 'pointer' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Mail style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                      Send Email
                    </motion.button>
                    <motion.button
                      onClick={() => toast.info(`Scheduling review for ${c.client}`)}
                      className="flex items-center justify-center font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-white w-full"
                      style={{ fontSize: TYPE.meta, gap: GRID.spacing.xs, padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, cursor: 'pointer' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Calendar style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                      Schedule Review
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </ManagerLoungeLayout>
  );
}

export default ManagerClientHealth;
