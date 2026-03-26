import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ID_TO_LOUNGE_KEY } from '@shared/loungeKeys';

interface LoungeAccessResponse {
  access: Record<string, boolean>;
}

export function useLoungeAccess() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<LoungeAccessResponse>({
    queryKey: ['/api/my-lounge-access'],
    queryFn: async () => {
      const res = await fetch('/api/my-lounge-access', { credentials: 'include' });
      if (!res.ok) return { access: {} };
      return res.json();
    },
    staleTime: 30_000,
    retry: false,
  });

  const accessMap = data?.access || {};

  // Listen for WebSocket lounge_access_changed events to invalidate cache
  useEffect(() => {
    function handleWsMessage(event: MessageEvent) {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'lounge_access_changed') {
          queryClient.invalidateQueries({ queryKey: ['/api/my-lounge-access'] });
        }
      } catch { /* ignore non-JSON */ }
    }

    // Find existing GCF WebSocket connections and listen
    // The WS URL pattern is /ws/gcf
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/gcf`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      ws.addEventListener('message', handleWsMessage);
    } catch { /* WS not available */ }

    return () => {
      if (ws) {
        ws.removeEventListener('message', handleWsMessage);
        ws.close();
      }
    };
  }, [queryClient]);

  /** Check if user has access to a lounge by its frontend ID (e.g., 'manager') */
  function hasAccess(frontendId: string): boolean {
    const dbKey = ID_TO_LOUNGE_KEY[frontendId];
    if (!dbKey) return false;
    return accessMap[dbKey] === true;
  }

  /** Check if user has access by DB key directly (e.g., 'manager_lounge') */
  function hasAccessByKey(dbKey: string): boolean {
    return accessMap[dbKey] === true;
  }

  return { accessMap, hasAccess, hasAccessByKey, isLoading };
}
