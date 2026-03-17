/**
 * Lead Distribution API Hooks
 * Shared hooks for Executive, Manager, and Agent lead distribution pages
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// ── Types ──

export interface DistributionAssignment {
  recipientId: string;
  recipientName: string;
  leadCount: number;
  leadIds: string[];
}

export interface DistributionRecord {
  id: string;
  distributedBy: string;
  distributedByRole: string;
  totalLeads: number;
  recipientCount: number;
  leadsPerRecipient: number;
  remainderLeads: number;
  distributionLevel: string;
  assignments: DistributionAssignment[];
  createdAt: string;
}

export interface DistributionStats {
  poolCount: number;
  highPriorityCount: number;
  distributedToday: number;
  recipientCount: number;
  inboxCount: number;
}

export interface DistributionRecipient {
  id: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export interface PaginatedLeads {
  leads: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedHistory {
  records: DistributionRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Hooks ──

/**
 * Fetch the user's lead pool (leads assigned to them but not yet distributed down)
 */
export function useLeadPool(options: {
  page?: number;
  limit?: number;
  search?: string;
  priority?: string;
  source?: string;
  sortBy?: string;
  enabled?: boolean;
} = {}) {
  const { page = 1, limit = 50, search, priority, source, sortBy, enabled = true } = options;

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (search) params.set('search', search);
  if (priority && priority !== 'all') params.set('priority', priority);
  if (source && source !== 'all') params.set('source', source);
  if (sortBy) params.set('sortBy', sortBy);

  return useQuery<PaginatedLeads>({
    queryKey: ['lead-distribution', 'pool', page, limit, search, priority, source, sortBy],
    queryFn: async () => {
      const res = await fetch(`/api/lead-distribution/pool?${params.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch lead pool');
      return res.json();
    },
    enabled,
  });
}

/**
 * Fetch leads distributed to the user (their inbox)
 */
export function useLeadInbox(options: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  enabled?: boolean;
} = {}) {
  const { page = 1, limit = 50, status, search, sortBy, enabled = true } = options;

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  if (sortBy) params.set('sortBy', sortBy);

  return useQuery<PaginatedLeads>({
    queryKey: ['lead-distribution', 'inbox', page, limit, status, search, sortBy],
    queryFn: async () => {
      const res = await fetch(`/api/lead-distribution/inbox?${params.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch inbox');
      return res.json();
    },
    enabled,
  });
}

/**
 * Fetch distribution statistics
 */
export function useDistributionStats(enabled = true) {
  return useQuery<DistributionStats>({
    queryKey: ['lead-distribution', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/lead-distribution/stats', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    enabled,
  });
}

/**
 * Fetch available recipients (direct reports)
 */
export function useDistributionRecipients(enabled = true) {
  return useQuery<DistributionRecipient[]>({
    queryKey: ['lead-distribution', 'recipients'],
    queryFn: async () => {
      const res = await fetch('/api/lead-distribution/recipients', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch recipients');
      return res.json();
    },
    enabled,
  });
}

/**
 * Fetch distribution history
 */
export function useDistributionHistory(options: {
  page?: number;
  limit?: number;
  enabled?: boolean;
} = {}) {
  const { page = 1, limit = 20, enabled = true } = options;

  return useQuery<PaginatedHistory>({
    queryKey: ['lead-distribution', 'history', page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/lead-distribution/history?page=${page}&limit=${limit}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch history');
      return res.json();
    },
    enabled,
  });
}

/**
 * Distribute leads evenly to direct reports
 */
export function useDistributeLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { leadIds?: string[]; all?: boolean }) => {
      const res = await apiRequest('POST', '/api/lead-distribution/distribute', data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all distribution queries
      queryClient.invalidateQueries({ queryKey: ['lead-distribution'] });
    },
  });
}

/**
 * Assign a single lead to a specific recipient
 */
export function useAssignSingleLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { leadId: string; recipientId: string }) => {
      const res = await apiRequest('POST', '/api/lead-distribution/assign-single', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-distribution'] });
    },
  });
}
