import { useQuery } from '@tanstack/react-query';

interface LeadRevenueFilters {
  leadType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  period?: string;
}

export function useLeadRevenueAnalytics(filters: LeadRevenueFilters = {}) {
  const params = new URLSearchParams();
  if (filters.leadType && filters.leadType !== 'all') params.set('lead_type', filters.leadType);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.period && filters.period !== 'all') params.set('period', filters.period);

  return useQuery({
    queryKey: ['/api/lead-purchases/analytics', filters],
    queryFn: async () => {
      const res = await fetch(`/api/lead-purchases/analytics?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });
}
