/**
 * WebSocket Provider
 * Manages real-time connection with auto-reconnect and channel subscriptions
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';

// =============================================================================
// TYPES
// =============================================================================

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export type Channel =
  | 'agents' | 'system' | 'alerts' | 'errors'
  | 'leads' | 'my-leads' | 'pipeline'
  | 'my-appointments' | 'coaching' | 'team'
  | 'escalations' | 'compliance'
  | 'revenue' | 'kpis'
  | 'content' | 'social' | 'campaigns' | 'reputation'
  | 'my-policies' | 'my-claims' | 'my-tickets'
  | 'notifications';

export interface WebSocketMessage {
  type: string;
  channel?: Channel;
  data?: any;
  timestamp?: number;
}

type MessageHandler = (data: any, channel?: Channel) => void;

interface WebSocketContextType {
  connectionState: ConnectionState;
  connected: boolean;
  subscribedChannels: Channel[];
  availableChannels: Channel[];
  subscribe: (channel: Channel) => void;
  unsubscribe: (channel: Channel) => void;
  addMessageHandler: (handler: MessageHandler) => () => void;
  reconnect: () => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface WebSocketProviderProps {
  children: ReactNode;
  wsUrl?: string;
}

export function WebSocketProvider({ children, wsUrl }: WebSocketProviderProps) {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<MessageHandler>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [subscribedChannels, setSubscribedChannels] = useState<Channel[]>([]);
  const [availableChannels, setAvailableChannels] = useState<Channel[]>([]);

  // Configuration
  const MAX_RECONNECT_ATTEMPTS = 10;
  const BASE_RECONNECT_DELAY = 1000;
  const MAX_RECONNECT_DELAY = 30000;

  // Build WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    if (wsUrl) return wsUrl;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const userId = user?.id || user?.uid;

    if (!userId) return null;

    return `${protocol}//${host}/ws/gcf?userId=${userId}`;
  }, [wsUrl, user]);

  // Calculate reconnect delay with exponential backoff and jitter
  const getReconnectDelay = useCallback(() => {
    const exponentialDelay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptRef.current);
    const cappedDelay = Math.min(exponentialDelay, MAX_RECONNECT_DELAY);
    const jitter = Math.random() * 1000; // Add up to 1s of jitter
    return cappedDelay + jitter;
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    const url = getWebSocketUrl();
    if (!url) {
      console.log('[WebSocket] No user ID, skipping connection');
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    setConnectionState('connecting');
    console.log('[WebSocket] Connecting...', url);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setConnectionState('connected');
        reconnectAttemptRef.current = 0; // Reset reconnect counter
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Handle connection confirmation
          if (message.type === 'connected') {
            setSubscribedChannels(message.data?.channels || []);
            setAvailableChannels(message.data?.availableChannels || []);
            console.log('[WebSocket] Channels:', message.data?.channels);
          }

          // Handle subscription updates
          if (message.type === 'subscribed' || message.type === 'unsubscribed') {
            setSubscribedChannels(message.data?.channels || []);
          }

          // Notify all handlers
          handlersRef.current.forEach((handler) => {
            try {
              handler(message.data, message.channel);
            } catch (error) {
              console.error('[WebSocket] Handler error:', error);
            }
          });
        } catch (error) {
          console.error('[WebSocket] Parse error:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected', event.code, event.reason);
        setConnectionState('disconnected');
        wsRef.current = null;

        // Attempt reconnect if not intentional close
        if (event.code !== 1000 && reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = getReconnectDelay();
          console.log(`[WebSocket] Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttemptRef.current + 1})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.log('[WebSocket] Max reconnect attempts reached');
          setConnectionState('error');
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setConnectionState('error');
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      setConnectionState('error');
    }
  }, [getWebSocketUrl, getReconnectDelay]);

  // Subscribe to channel
  const subscribe = useCallback((channel: Channel) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  }, []);

  // Unsubscribe from channel
  const unsubscribe = useCallback((channel: Channel) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', channel }));
    }
  }, []);

  // Add message handler
  const addMessageHandler = useCallback((handler: MessageHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectAttemptRef.current = 0;
    connect();
  }, [connect]);

  // Connect when user is available
  useEffect(() => {
    if (user?.id || user?.uid) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [user?.id, user?.uid, connect]);

  // Send ping periodically to keep connection alive
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000); // Every 25 seconds

    return () => clearInterval(pingInterval);
  }, []);

  const value: WebSocketContextType = {
    connectionState,
    connected: connectionState === 'connected',
    subscribedChannels,
    availableChannels,
    subscribe,
    unsubscribe,
    addMessageHandler,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Main WebSocket hook
 */
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    // Return no-op stubs instead of throwing — prevents crash during HMR or missing provider
    return {
      connectionState: 'disconnected' as ConnectionState,
      connected: false,
      subscribedChannels: [] as Channel[],
      availableChannels: [] as Channel[],
      subscribe: () => {},
      unsubscribe: () => {},
      addMessageHandler: () => () => {},
      reconnect: () => {},
    } as WebSocketContextType;
  }
  return context;
}

/**
 * Subscribe to a specific channel and handle messages
 */
export function useChannel(channel: Channel, handler: (data: any) => void) {
  const { subscribe, unsubscribe, addMessageHandler, subscribedChannels } = useWebSocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    // Subscribe to channel
    if (!subscribedChannels.includes(channel)) {
      subscribe(channel);
    }

    // Add message handler filtered by channel
    const cleanup = addMessageHandler((data, msgChannel) => {
      if (msgChannel === channel) {
        handlerRef.current(data);
      }
    });

    return () => {
      cleanup();
      // Note: We don't unsubscribe on unmount to avoid unnecessary traffic
      // The server handles cleanup on disconnect
    };
  }, [channel, subscribe, addMessageHandler, subscribedChannels]);
}

/**
 * Get connection status for UI indicators
 */
export function useConnectionStatus() {
  const { connectionState, connected, reconnect } = useWebSocket();
  return { connectionState, connected, reconnect };
}

export default WebSocketProvider;
