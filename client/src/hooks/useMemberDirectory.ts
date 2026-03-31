import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Filters interface
interface MemberFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Hook: useMembers - paginated member list
export function useMembers(filters: MemberFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.role && filters.role !== 'all') params.set('role', filters.role);
  if (filters.status === 'active') params.set('status', 'active');
  if (filters.status === 'inactive') params.set('status', 'inactive');
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  return useQuery({
    queryKey: ['/api/lounge-access/members', filters],
    queryFn: async () => {
      const res = await fetch(`/api/lounge-access/members?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
  });
}

// Hook: useMemberProfile - full member profile (onboarding data)
export function useMemberProfile(userId: string | null) {
  return useQuery({
    queryKey: ['/api/lounge-access/member', userId, 'onboarding'],
    queryFn: async () => {
      const res = await fetch(`/api/lounge-access/member/${userId}/onboarding`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
    enabled: !!userId,
  });
}

// Hook: useMemberDocuments - combined documents (NEW endpoint)
export function useMemberDocuments(userId: string | null) {
  return useQuery({
    queryKey: ['/api/lounge-access/member', userId, 'documents'],
    queryFn: async () => {
      const res = await fetch(`/api/lounge-access/member/${userId}/documents`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch documents');
      return res.json();
    },
    enabled: !!userId,
  });
}

// Hook: useMemberLoungeAccess
export function useMemberLoungeAccess(userId: string | null) {
  return useQuery({
    queryKey: ['/api/lounge-access/lounge-access', userId],
    queryFn: async () => {
      const res = await fetch(`/api/lounge-access/lounge-access/${userId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch lounge access');
      return res.json();
    },
    enabled: !!userId,
  });
}

// Mutation: promote member
export function usePromoteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; newRole: string; reason?: string }) => {
      const res = await fetch('/api/lounge-access/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to promote');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/lounge-access/members'] });
    },
  });
}

// Mutation: deactivate member
export function useDeactivateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; reason?: string }) => {
      const res = await fetch('/api/lounge-access/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to deactivate');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/lounge-access/members'] });
    },
  });
}

// Mutation: toggle lounge access
export function useToggleLoungeAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; loungeKey: string; granted: boolean }) => {
      const res = await fetch('/api/lounge-access/lounge-access/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to toggle access');
      return res.json();
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['/api/lounge-access/lounge-access', vars.userId] });
    },
  });
}
