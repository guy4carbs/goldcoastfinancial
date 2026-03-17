/**
 * Token Validation Hook
 * Validates the onboarding intake token via API
 */
import { useQuery } from '@tanstack/react-query';

export function useTokenValidation(token: string) {
  return useQuery({
    queryKey: ['/api/onboarding/validate-token', token],
    queryFn: async () => {
      const res = await fetch('/api/onboarding/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error('Invalid or expired link');
      return res.json();
    },
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });
}
