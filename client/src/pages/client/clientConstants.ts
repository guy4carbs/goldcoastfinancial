/**
 * Client Lounge -Shared Constants & Demo Data
 * Heritage Design System -Violet-to-Amber theme
 */

import { CSSProperties } from 'react';

// Glass card style object -used across all client pages
// Matches GLASS.css.light from heritageDesignSystem with specular edge border
export const glassCard: CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
};

// Violet → Amber gradient constants (matches Agent Lounge heroWithAccent)
export const CLIENT_GRADIENT = 'from-violet-600 via-purple-600 to-amber-500';
export const CLIENT_GRADIENT_CSS = 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)';
export const CLIENT_ICON_GRADIENT = 'from-violet-500 to-violet-700';

// ─── DEMO CLIENT PROFILE ────────────────────────────────

export const DEMO_CLIENT = {
  id: 'client-1',
  firstName: 'John',
  lastName: 'Mitchell',
  email: 'john.mitchell@email.com',
  phone: '(407) 555-0192',
  avatar: 'JM',
  memberSince: 'January 2022',
  agentName: 'Sarah Johnson',
  agentAvatar: 'SJ',
  agentNPN: '12345678',
  agentEmail: 'sarah.johnson@heritagels.org',
  agentPhone: '(407) 555-0134',
} as const;

// ─── DEMO POLICIES ──────────────────────────────────────

export const DEMO_CLIENT_POLICIES = [
  {
    id: 'pol-1',
    policyNumber: 'HLS-2022-10042',
    type: 'Term Life' as const,
    carrier: 'Protective Life',
    status: 'active' as const,
    coverageAmount: 500000,
    monthlyPremium: 89,
    startDate: 'Jan 15, 2022',
    endDate: 'Jan 15, 2042',
    nextPaymentDate: 'Apr 1, 2026',
    beneficiaryName: 'Lisa Mitchell',
    beneficiaryRelationship: 'Spouse',
    autoPayEnabled: true,
  },
  {
    id: 'pol-2',
    policyNumber: 'HLS-2022-10087',
    type: 'Whole Life' as const,
    carrier: 'North American',
    status: 'active' as const,
    coverageAmount: 250000,
    monthlyPremium: 245,
    startDate: 'Mar 1, 2022',
    nextPaymentDate: 'Apr 1, 2026',
    beneficiaryName: 'Lisa Mitchell',
    beneficiaryRelationship: 'Spouse',
    autoPayEnabled: true,
    cashValue: 18400,
  },
  {
    id: 'pol-3',
    policyNumber: 'HLS-2023-20156',
    type: 'IUL' as const,
    carrier: 'Transamerica',
    status: 'active' as const,
    coverageAmount: 500000,
    monthlyPremium: 350,
    startDate: 'Jun 10, 2023',
    nextPaymentDate: 'Apr 10, 2026',
    beneficiaryName: 'Lisa Mitchell',
    beneficiaryRelationship: 'Spouse',
    autoPayEnabled: true,
    cashValue: 42800,
  },
  {
    id: 'pol-4',
    policyNumber: 'HLS-2025-30291',
    type: 'Final Expense' as const,
    carrier: 'Transamerica',
    status: 'pending' as const,
    coverageAmount: 25000,
    monthlyPremium: 45,
    startDate: 'Mar 1, 2026',
    nextPaymentDate: 'Apr 1, 2026',
    beneficiaryName: 'Emily Mitchell',
    beneficiaryRelationship: 'Daughter',
    autoPayEnabled: false,
  },
] as const;

// ─── DEMO DOCUMENTS ─────────────────────────────────────

export const DEMO_CLIENT_DOCUMENTS = [
  { id: 'doc-1', name: 'Term Life Policy Document -Protective Life', category: 'policy' as const, date: 'Jan 15, 2022', fileSize: '2.4 MB', isNew: false, policyId: 'pol-1' },
  { id: 'doc-2', name: 'Whole Life Policy Document -North American', category: 'policy' as const, date: 'Mar 1, 2022', fileSize: '3.1 MB', isNew: false, policyId: 'pol-2' },
  { id: 'doc-3', name: 'IUL Policy Document -Transamerica', category: 'policy' as const, date: 'Jun 10, 2023', fileSize: '4.2 MB', isNew: false, policyId: 'pol-3' },
  { id: 'doc-4', name: '2025 Annual Statement -Whole Life', category: 'statement' as const, date: 'Jan 31, 2026', fileSize: '1.8 MB', isNew: true, policyId: 'pol-2' },
  { id: 'doc-5', name: '2025 Annual Statement -IUL', category: 'statement' as const, date: 'Jan 31, 2026', fileSize: '2.1 MB', isNew: true, policyId: 'pol-3' },
  { id: 'doc-6', name: '1099-R Tax Form -2025', category: 'tax' as const, date: 'Feb 15, 2026', fileSize: '540 KB', isNew: true, policyId: 'pol-3' },
  { id: 'doc-7', name: 'Welcome Letter -Heritage Life Solutions', category: 'correspondence' as const, date: 'Jan 20, 2022', fileSize: '320 KB', isNew: false, policyId: 'pol-1' },
  { id: 'doc-8', name: 'Beneficiary Change Confirmation -IUL', category: 'correspondence' as const, date: 'Sep 5, 2024', fileSize: '280 KB', isNew: false, policyId: 'pol-3' },
] as const;

// ─── DEMO BILLING / PAYMENT HISTORY ─────────────────────

export const DEMO_CLIENT_BILLING = [
  // 2026
  { id: 'bill-1', policyId: 'pol-1', policyNumber: 'HLS-2022-10042', policyType: 'Term Life' as const, amount: 89, date: 'Mar 1, 2026', status: 'paid' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-2', policyId: 'pol-2', policyNumber: 'HLS-2022-10087', policyType: 'Whole Life' as const, amount: 245, date: 'Mar 1, 2026', status: 'paid' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-3', policyId: 'pol-3', policyNumber: 'HLS-2023-20156', policyType: 'IUL' as const, amount: 350, date: 'Mar 10, 2026', status: 'pending' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-4', policyId: 'pol-1', policyNumber: 'HLS-2022-10042', policyType: 'Term Life' as const, amount: 89, date: 'Feb 1, 2026', status: 'paid' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-5', policyId: 'pol-2', policyNumber: 'HLS-2022-10087', policyType: 'Whole Life' as const, amount: 245, date: 'Feb 1, 2026', status: 'paid' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-6', policyId: 'pol-3', policyNumber: 'HLS-2023-20156', policyType: 'IUL' as const, amount: 350, date: 'Feb 10, 2026', status: 'paid' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-7', policyId: 'pol-1', policyNumber: 'HLS-2022-10042', policyType: 'Term Life' as const, amount: 89, date: 'Jan 1, 2026', status: 'paid' as const, paymentMethod: 'ACH - Chase ****3456' },
  { id: 'bill-8', policyId: 'pol-2', policyNumber: 'HLS-2022-10087', policyType: 'Whole Life' as const, amount: 245, date: 'Jan 1, 2026', status: 'paid' as const, paymentMethod: 'ACH - Chase ****3456' },
  { id: 'bill-9', policyId: 'pol-3', policyNumber: 'HLS-2023-20156', policyType: 'IUL' as const, amount: 350, date: 'Jan 10, 2026', status: 'paid' as const, paymentMethod: 'ACH - Chase ****3456' },
  // 2025 Q4
  { id: 'bill-10', policyId: 'pol-1', policyNumber: 'HLS-2022-10042', policyType: 'Term Life' as const, amount: 89, date: 'Dec 1, 2025', status: 'paid' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-11', policyId: 'pol-2', policyNumber: 'HLS-2022-10087', policyType: 'Whole Life' as const, amount: 245, date: 'Dec 1, 2025', status: 'paid' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-12', policyId: 'pol-3', policyNumber: 'HLS-2023-20156', policyType: 'IUL' as const, amount: 350, date: 'Dec 10, 2025', status: 'failed' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-13', policyId: 'pol-1', policyNumber: 'HLS-2022-10042', policyType: 'Term Life' as const, amount: 89, date: 'Nov 1, 2025', status: 'paid' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-14', policyId: 'pol-2', policyNumber: 'HLS-2022-10087', policyType: 'Whole Life' as const, amount: 245, date: 'Nov 1, 2025', status: 'paid' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-15', policyId: 'pol-3', policyNumber: 'HLS-2023-20156', policyType: 'IUL' as const, amount: 350, date: 'Nov 10, 2025', status: 'paid' as const, paymentMethod: 'ACH - Chase ****3456' },
  { id: 'bill-16', policyId: 'pol-1', policyNumber: 'HLS-2022-10042', policyType: 'Term Life' as const, amount: 89, date: 'Oct 1, 2025', status: 'paid' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-17', policyId: 'pol-2', policyNumber: 'HLS-2022-10087', policyType: 'Whole Life' as const, amount: 245, date: 'Oct 1, 2025', status: 'paid' as const, paymentMethod: 'ACH - BofA ****7890' },
  { id: 'bill-18', policyId: 'pol-3', policyNumber: 'HLS-2023-20156', policyType: 'IUL' as const, amount: 350, date: 'Oct 10, 2025', status: 'paid' as const, paymentMethod: 'ACH - Chase ****3456' },
  // 2025 Q3
  { id: 'bill-19', policyId: 'pol-1', policyNumber: 'HLS-2022-10042', policyType: 'Term Life' as const, amount: 89, date: 'Sep 1, 2025', status: 'paid' as const, paymentMethod: 'ACH - Chase ****3456' },
  { id: 'bill-20', policyId: 'pol-2', policyNumber: 'HLS-2022-10087', policyType: 'Whole Life' as const, amount: 245, date: 'Sep 1, 2025', status: 'paid' as const, paymentMethod: 'ACH - Chase ****3456' },
  { id: 'bill-21', policyId: 'pol-3', policyNumber: 'HLS-2023-20156', policyType: 'IUL' as const, amount: 350, date: 'Sep 10, 2025', status: 'paid' as const, paymentMethod: 'ACH - Chase ****3456' },
  { id: 'bill-22', policyId: 'pol-1', policyNumber: 'HLS-2022-10042', policyType: 'Term Life' as const, amount: 89, date: 'Aug 1, 2025', status: 'paid' as const, paymentMethod: 'ACH - Chase ****3456' },
  { id: 'bill-23', policyId: 'pol-2', policyNumber: 'HLS-2022-10087', policyType: 'Whole Life' as const, amount: 245, date: 'Aug 1, 2025', status: 'paid' as const, paymentMethod: 'ACH - Chase ****3456' },
  { id: 'bill-24', policyId: 'pol-3', policyNumber: 'HLS-2023-20156', policyType: 'IUL' as const, amount: 350, date: 'Aug 10, 2025', status: 'paid' as const, paymentMethod: 'ACH - Chase ****3456' },
] as const;

// ─── DEMO CLAIMS ────────────────────────────────────────

export const DEMO_CLIENT_CLAIMS = [
  {
    id: 'claim-1',
    claimNumber: 'CLM-2026-00412',
    policyId: 'pol-3',
    policyNumber: 'HLS-2023-20156',
    type: 'Living Benefits',
    status: 'under_review' as const,
    description: 'Critical illness living benefits claim -diagnosed with qualifying condition per policy rider.',
    amount: 150000,
    filedDate: 'Feb 20, 2026',
    resolvedDate: undefined,
    lastUpdate: 'Mar 8, 2026',
  },
  {
    id: 'claim-2',
    claimNumber: 'CLM-2025-00287',
    policyId: 'pol-2',
    policyNumber: 'HLS-2022-10087',
    type: 'Disability Waiver of Premium',
    status: 'approved' as const,
    description: 'Waiver of premium claim due to qualifying disability. Premium payments suspended for 12 months.',
    amount: 2940,
    filedDate: 'Oct 15, 2025',
    resolvedDate: 'Nov 28, 2025',
    lastUpdate: 'Nov 28, 2025',
  },
  {
    id: 'claim-3',
    claimNumber: 'CLM-2026-00501',
    policyId: 'pol-1',
    policyNumber: 'HLS-2022-10042',
    type: 'Accidental Death Benefit',
    status: 'filed' as const,
    description: 'Accidental death benefit rider claim filed -supporting documentation submitted.',
    amount: 500000,
    filedDate: 'Mar 10, 2026',
    resolvedDate: undefined,
    lastUpdate: 'Mar 10, 2026',
  },
] as const;

// ─── DEMO APPOINTMENTS ──────────────────────────────────

export const DEMO_CLIENT_APPOINTMENTS = [
  {
    id: 'appt-1',
    agentName: 'Sarah Johnson',
    agentAvatar: 'SJ',
    type: 'video' as const,
    topic: 'IUL Policy Annual Review',
    date: 'Mar 18, 2026',
    time: '10:00 AM',
    duration: 30,
    status: 'scheduled' as const,
    meetingLink: 'https://meet.heritagels.org/session/abc123',
  },
  {
    id: 'appt-2',
    agentName: 'Sarah Johnson',
    agentAvatar: 'SJ',
    type: 'phone' as const,
    topic: 'Final Expense Application Follow-up',
    date: 'Mar 25, 2026',
    time: '2:00 PM',
    duration: 15,
    status: 'scheduled' as const,
    meetingLink: undefined,
  },
  {
    id: 'appt-3',
    agentName: 'Sarah Johnson',
    agentAvatar: 'SJ',
    type: 'video' as const,
    topic: 'Claims Status Update & Next Steps',
    date: 'Feb 28, 2026',
    time: '11:00 AM',
    duration: 30,
    status: 'completed' as const,
    meetingLink: undefined,
  },
  {
    id: 'appt-4',
    agentName: 'Sarah Johnson',
    agentAvatar: 'SJ',
    type: 'in_person' as const,
    topic: 'Beneficiary Review & Estate Planning',
    date: 'Jan 15, 2026',
    time: '3:00 PM',
    duration: 45,
    status: 'completed' as const,
    meetingLink: undefined,
  },
] as const;

// ─── DEMO BENEFICIARIES ─────────────────────────────────

export const DEMO_CLIENT_BENEFICIARIES = [
  { id: 'ben-1', policyId: 'pol-1', policyNumber: 'HLS-2022-10042', type: 'primary' as const, firstName: 'Lisa', lastName: 'Mitchell', relationship: 'Spouse', dateOfBirth: '1985-06-12', allocationPercent: 100 },
  { id: 'ben-2', policyId: 'pol-2', policyNumber: 'HLS-2022-10087', type: 'primary' as const, firstName: 'Lisa', lastName: 'Mitchell', relationship: 'Spouse', dateOfBirth: '1985-06-12', allocationPercent: 70 },
  { id: 'ben-3', policyId: 'pol-2', policyNumber: 'HLS-2022-10087', type: 'primary' as const, firstName: 'Emily', lastName: 'Mitchell', relationship: 'Daughter', dateOfBirth: '2008-03-22', allocationPercent: 30 },
  { id: 'ben-4', policyId: 'pol-3', policyNumber: 'HLS-2023-20156', type: 'primary' as const, firstName: 'Lisa', lastName: 'Mitchell', relationship: 'Spouse', dateOfBirth: '1985-06-12', allocationPercent: 100 },
  { id: 'ben-5', policyId: 'pol-3', policyNumber: 'HLS-2023-20156', type: 'contingent' as const, firstName: 'Robert', lastName: 'Mitchell', relationship: 'Father', dateOfBirth: '1958-11-04', allocationPercent: 100 },
] as const;

// ─── DEMO NOTIFICATIONS ─────────────────────────────────

export const DEMO_CLIENT_NOTIFICATIONS = [
  { id: 'notif-1', title: 'Payment Due Soon', message: 'Your IUL premium of $350 is due on Apr 10, 2026.', type: 'payment' as const, date: 'Mar 12, 2026', isRead: false, actionUrl: '/client/billing' },
  { id: 'notif-2', title: 'New Document Available', message: 'Your 2025 Annual Statement for IUL is ready to download.', type: 'document' as const, date: 'Mar 10, 2026', isRead: false, actionUrl: '/client/documents' },
  { id: 'notif-3', title: 'Appointment Confirmed', message: 'Video call with Sarah Johnson on Mar 18 at 10:00 AM.', type: 'appointment' as const, date: 'Mar 8, 2026', isRead: true, actionUrl: '/client/appointments' },
  { id: 'notif-4', title: 'Claim Status Updated', message: 'Your Living Benefits claim is now under review.', type: 'policy' as const, date: 'Mar 8, 2026', isRead: true, actionUrl: '/client/claims' },
  { id: 'notif-5', title: 'Payment Processed', message: 'Your Term Life premium of $89 was successfully processed.', type: 'payment' as const, date: 'Mar 1, 2026', isRead: true, actionUrl: '/client/billing' },
  { id: 'notif-6', title: 'Policy Application Update', message: 'Your Final Expense application is being reviewed by underwriting.', type: 'general' as const, date: 'Feb 28, 2026', isRead: true, actionUrl: '/client/policies' },
] as const;

// ─── DEMO MESSAGES (Agent Conversation) ─────────────────

export const DEMO_CLIENT_MESSAGES = [
  { id: 'msg-1', from: 'agent' as const, fromName: 'Sarah Johnson', message: 'Hi John! Welcome to Heritage Life Solutions. I\'m excited to help you build a comprehensive protection plan for your family.', timestamp: 'Jan 20, 2022 9:00 AM', isRead: true },
  { id: 'msg-2', from: 'client' as const, fromName: 'John Mitchell', message: 'Thanks Sarah! I\'m interested in learning more about the IUL policy we discussed. Can you send me some details?', timestamp: 'Jan 20, 2022 9:15 AM', isRead: true },
  { id: 'msg-3', from: 'agent' as const, fromName: 'Sarah Johnson', message: 'Absolutely! I\'ve attached an IUL illustration based on our conversation. The Transamerica product offers great upside potential with downside protection. Let me know if you have any questions.', timestamp: 'Jan 20, 2022 10:30 AM', isRead: true },
  { id: 'msg-4', from: 'client' as const, fromName: 'John Mitchell', message: 'This looks great. I\'d like to move forward with the application. What do I need to do next?', timestamp: 'Jan 21, 2022 2:00 PM', isRead: true },
  { id: 'msg-5', from: 'agent' as const, fromName: 'Sarah Johnson', message: 'Wonderful! I\'ll send you the application link. You\'ll need your driver\'s license, Social Security number, and your doctor\'s contact info for the medical records request.', timestamp: 'Jan 21, 2022 2:30 PM', isRead: true },
  { id: 'msg-6', from: 'agent' as const, fromName: 'Sarah Johnson', message: 'Hi John -just a heads up, your annual IUL statement is now available in your documents section. Your cash value grew 8.2% this year! Let\'s schedule a review to discuss your options.', timestamp: 'Feb 1, 2026 10:00 AM', isRead: true },
  { id: 'msg-7', from: 'client' as const, fromName: 'John Mitchell', message: 'That\'s great news! Yes, let\'s schedule a call. I also wanted to ask about adding my daughter as a contingent beneficiary on the Whole Life policy.', timestamp: 'Feb 1, 2026 11:45 AM', isRead: true },
  { id: 'msg-8', from: 'agent' as const, fromName: 'Sarah Johnson', message: 'Absolutely, we can handle both in our next call. I\'ve booked us for Mar 18 at 10am via video. I\'ll also prepare a beneficiary change form for your review. See you then!', timestamp: 'Feb 2, 2026 9:00 AM', isRead: true },
] as const;

// ─── DEMO ACTIVITY LOG ──────────────────────────────────

export const DEMO_CLIENT_ACTIVITY = [
  { id: 'act-1', type: 'payment' as const, description: 'Premium payment processed - Term Life ($89)', date: 'Mar 1, 2026', icon: 'Landmark' },
  { id: 'act-2', type: 'payment' as const, description: 'Premium payment processed - Whole Life ($245)', date: 'Mar 1, 2026', icon: 'Landmark' },
  { id: 'act-3', type: 'document' as const, description: '2025 Annual Statement uploaded -IUL', date: 'Jan 31, 2026', icon: 'FileText' },
  { id: 'act-4', type: 'claim' as const, description: 'Living Benefits claim filed -IUL policy', date: 'Feb 20, 2026', icon: 'FileCheck' },
  { id: 'act-5', type: 'appointment' as const, description: 'Video call completed with Sarah Johnson', date: 'Feb 28, 2026', icon: 'Video' },
  { id: 'act-6', type: 'message' as const, description: 'New message from Sarah Johnson', date: 'Feb 2, 2026', icon: 'MessageSquare' },
  { id: 'act-7', type: 'policy' as const, description: 'Final Expense application submitted', date: 'Feb 25, 2026', icon: 'Shield' },
  { id: 'act-8', type: 'document' as const, description: '1099-R Tax Form available for download', date: 'Feb 15, 2026', icon: 'FileText' },
] as const;

// ─── STATUS COLOR MAPS ──────────────────────────────────

export const POLICY_STATUS_COLORS = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  lapsed: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
} as const;

export const CLAIM_STATUS_COLORS = {
  filed: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  documents_needed: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  under_review: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  denied: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
} as const;

export const PAYMENT_STATUS_COLORS = {
  paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
} as const;

// ─── CURRENCY FORMATTER ─────────────────────────────────

export function fmtCurrency(n: number | string): string {
  const v = typeof n === 'string' ? parseFloat(n) || 0 : n;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) {
    const k = v / 1_000;
    if (k >= 1_000) return `$${(k / 1_000).toFixed(1)}M`;
    return `$${k.toFixed(k >= 100 ? 0 : 1)}K`;
  }
  return `$${v.toFixed(0)}`;
}
