/**
 * Manager Lounge — Dedicated Zustand Store
 *
 * Manages manager-specific state: tier, team selection, alerts,
 * and approval queue. Separate from agentStore to avoid coupling.
 */

import { create } from 'zustand';

export type ManagerTier = 'manager' | 'director';

export type AlertPriority = 'urgent' | 'high' | 'medium' | 'low';
export type AlertCategory = 'compliance' | 'pipeline' | 'team' | 'escalation';

export interface ManagerAlert {
  id: string;
  title: string;
  description: string;
  agentName: string;
  agentAvatar?: string;
  priority: AlertPriority;
  category: AlertCategory;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
}

export interface ApprovalItem {
  id: string;
  type: 'discount' | 'compliance' | 'time_off' | 'expense' | 'deal_override';
  requestorName: string;
  requestorAvatar?: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  amount?: number;
}

interface ManagerState {
  // Tier
  tier: ManagerTier;
  teamIds: number[];
  selectedTeamId: number | null;

  // Alerts
  alerts: ManagerAlert[];
  unreadAlertCount: number;

  // Approvals
  approvals: ApprovalItem[];
  pendingApprovalCount: number;

  // Actions
  selectTeam: (teamId: number | null) => void;
  dismissAlert: (id: string) => void;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  approveItem: (id: string) => void;
  rejectItem: (id: string) => void;
}

export const useManagerStore = create<ManagerState>((set) => ({
  // Defaults
  tier: 'manager',
  teamIds: [1],
  selectedTeamId: null,

  alerts: [],
  unreadAlertCount: 0,

  approvals: [],
  pendingApprovalCount: 0,

  // Actions
  selectTeam: (teamId) => set({ selectedTeamId: teamId }),

  dismissAlert: (id) =>
    set((state) => {
      const alerts = state.alerts.filter((a) => a.id !== id);
      return { alerts, unreadAlertCount: alerts.filter((a) => !a.read).length };
    }),

  markAlertRead: (id) =>
    set((state) => {
      const alerts = state.alerts.map((a) =>
        a.id === id ? { ...a, read: true } : a,
      );
      return { alerts, unreadAlertCount: alerts.filter((a) => !a.read).length };
    }),

  markAllAlertsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, read: true })),
      unreadAlertCount: 0,
    })),

  approveItem: (id) =>
    set((state) => {
      const approvals = state.approvals.map((a) =>
        a.id === id ? { ...a, status: 'approved' as const } : a,
      );
      return {
        approvals,
        pendingApprovalCount: approvals.filter((a) => a.status === 'pending').length,
      };
    }),

  rejectItem: (id) =>
    set((state) => {
      const approvals = state.approvals.map((a) =>
        a.id === id ? { ...a, status: 'rejected' as const } : a,
      );
      return {
        approvals,
        pendingApprovalCount: approvals.filter((a) => a.status === 'pending').length,
      };
    }),
}));

export default useManagerStore;
