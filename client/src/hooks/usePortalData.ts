/**
 * Client Portal Data Hooks
 *
 * TanStack Query hooks for all Client Lounge data fetching.
 * These replace the DEMO_* constants in clientConstants.ts once
 * the backend endpoints are live.
 *
 * The project's queryClient has a default queryFn (getQueryFn)
 * that auto-fetches from queryKey.join("/") with credentials,
 * so most hooks only need queryKey + optional config.
 *
 * Endpoint map:
 *   GET /api/portal/policies          — all client policies
 *   GET /api/portal/policies/:id      — single policy by ID
 *   GET /api/portal/documents         — all documents
 *   GET /api/portal/billing           — billing / payment history
 *   GET /api/portal/notifications     — notifications
 *   GET /api/portal/messages          — messages
 *   GET /api/portal/dashboard         — aggregated dashboard summary
 *   GET /api/client-portal/claims     — claims
 *   GET /api/client-portal/appointments — appointments
 */

import { useQuery } from '@tanstack/react-query';

// ─── Types (derived from DEMO data shapes in clientConstants.ts) ────────────

export interface PortalPolicy {
  id: string;
  policyNumber: string;
  type: string;
  carrier: string;
  status: 'active' | 'pending' | 'lapsed' | 'expired';
  coverageAmount: number;
  monthlyPremium: number;
  startDate: string;
  endDate?: string;
  nextPaymentDate?: string;
  beneficiaryName?: string;
  beneficiaryRelationship?: string;
  beneficiaries?: Array<{name: string; relationship: string; percentage: number}>;
  autoPayEnabled?: boolean;
  cashValue?: number;
}

export interface PortalDocument {
  id: string;
  name: string;
  category: 'policy' | 'statement' | 'tax' | 'correspondence';
  date: string;
  fileSize: string;
  isNew: boolean;
  policyId?: string;
}

export interface PortalBillingRecord {
  id: string;
  policyId: string;
  policyNumber: string;
  policyType: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
}

export interface PortalClaim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber: string;
  type: string;
  status: 'filed' | 'documents_needed' | 'under_review' | 'approved' | 'denied';
  description: string;
  amount?: number;
  filedDate: string;
  resolvedDate?: string;
  lastUpdate: string;
}

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'document' | 'appointment' | 'policy' | 'general';
  date: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface PortalAppointment {
  id: string;
  agentName: string;
  agentAvatar?: string;
  type: 'video' | 'phone' | 'in_person';
  topic: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink?: string;
}

export interface PortalDashboard {
  totalCoverage: number;
  monthlyPremium: number;
  activePolicies: number;
  unreadMessages: number;
  unreadNotifications: number;
  nextPayment?: { date: string; amount: number; policyNumber: string };
}

export interface OnboardingStatus {
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: string;
    label: string;
    completed: boolean;
  }>;
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Fetch all policies for the authenticated client.
 * Endpoint: GET /api/portal/policies
 */
export function usePortalPolicies() {
  return useQuery<PortalPolicy[]>({
    queryKey: ['/api/portal/policies'],
  });
}

/**
 * Fetch a single policy by ID.
 * Endpoint: GET /api/portal/policies/:id
 * Only fires when `id` is defined.
 */
export function usePortalPolicy(id: string | undefined) {
  return useQuery<PortalPolicy>({
    queryKey: ['/api/portal/policies', id],
    enabled: !!id,
  });
}

/**
 * Fetch all documents for the authenticated client.
 * Endpoint: GET /api/portal/documents
 */
export function usePortalDocuments() {
  return useQuery<PortalDocument[]>({
    queryKey: ['/api/portal/documents'],
  });
}

/**
 * Fetch billing / payment history.
 * Endpoint: GET /api/portal/billing
 */
export function usePortalBilling() {
  return useQuery<PortalBillingRecord[]>({
    queryKey: ['/api/portal/billing'],
  });
}

/**
 * Fetch claims for the authenticated client.
 * Endpoint: GET /api/client-portal/claims
 * (lives on the client-portal router, not the main portal routes)
 */
export function usePortalClaims() {
  return useQuery<PortalClaim[]>({
    queryKey: ['/api/client-portal/claims'],
  });
}

/**
 * Fetch notifications for the authenticated client.
 * Endpoint: GET /api/portal/notifications
 */
export function usePortalNotifications() {
  return useQuery<PortalNotification[]>({
    queryKey: ['/api/portal/notifications'],
  });
}

/**
 * Fetch appointments for the authenticated client.
 * Endpoint: GET /api/client-portal/appointments
 */
export function usePortalAppointments() {
  return useQuery<PortalAppointment[]>({
    queryKey: ['/api/client-portal/appointments'],
  });
}

/**
 * Fetch the aggregated dashboard summary.
 * Endpoint: GET /api/portal/dashboard
 */
export function usePortalDashboard() {
  return useQuery<PortalDashboard>({
    queryKey: ['/api/portal/dashboard'],
  });
}

/**
 * Fetch onboarding status for newly converted clients.
 * Endpoint: GET /api/portal/onboarding-status (not yet implemented on backend)
 */
export function useOnboardingStatus() {
  return useQuery<OnboardingStatus>({
    queryKey: ['/api/portal/onboarding-status'],
    // Backend endpoint not yet created — disable to avoid 404 errors.
    // Remove this line once the endpoint is live.
    enabled: false,
  });
}
