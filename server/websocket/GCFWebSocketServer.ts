/**
 * GCF WebSocket Server
 * Real-time event broadcasting with channel-based subscriptions and RBAC
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { Server, IncomingMessage } from 'http';
import type { Socket } from 'net';
import { storage } from '../storage';
import { Role, Roles, isValidRole, hasPermission, Permission } from '../types/permissions';

// =============================================================================
// CHANNELS
// =============================================================================

/**
 * All available WebSocket channels
 */
export const Channels = {
  // Agent System
  AGENTS: 'agents',
  SYSTEM: 'system',
  ALERTS: 'alerts',
  ERRORS: 'errors',

  // Lead Pipeline
  LEADS: 'leads',
  MY_LEADS: 'my-leads',
  PIPELINE: 'pipeline',

  // Appointments & Coaching
  MY_APPOINTMENTS: 'my-appointments',
  COACHING: 'coaching',
  TEAM: 'team',

  // Operations
  ESCALATIONS: 'escalations',
  COMPLIANCE: 'compliance',

  // Financial
  REVENUE: 'revenue',
  KPIS: 'kpis',

  // Marketing
  CONTENT: 'content',
  SOCIAL: 'social',
  CAMPAIGNS: 'campaigns',
  REPUTATION: 'reputation',

  // Client Portal
  MY_POLICIES: 'my-policies',
  MY_CLAIMS: 'my-claims',
  MY_TICKETS: 'my-tickets',

  // Notifications
  NOTIFICATIONS: 'notifications',
} as const;

export type Channel = typeof Channels[keyof typeof Channels];
export const ALL_CHANNELS: Channel[] = Object.values(Channels);

// =============================================================================
// CHANNEL ACCESS CONTROL
// =============================================================================

/**
 * Channels accessible by each role
 */
const ROLE_CHANNEL_ACCESS: Record<Role, Channel[]> = {
  [Roles.OWNER]: ALL_CHANNELS,

  [Roles.SYSTEM_ADMIN]: ALL_CHANNELS,

  [Roles.AGENCY_MANAGER]: [
    Channels.AGENTS, Channels.SYSTEM, Channels.ALERTS, Channels.ERRORS,
    Channels.LEADS, Channels.PIPELINE,
    Channels.MY_APPOINTMENTS, Channels.COACHING, Channels.TEAM,
    Channels.ESCALATIONS, Channels.COMPLIANCE,
    Channels.REVENUE, Channels.KPIS,
    Channels.CONTENT, Channels.SOCIAL, Channels.CAMPAIGNS, Channels.REPUTATION,
    Channels.NOTIFICATIONS,
  ],

  [Roles.SALES_AGENT]: [
    Channels.MY_LEADS, Channels.PIPELINE,
    Channels.MY_APPOINTMENTS, Channels.COACHING,
    Channels.NOTIFICATIONS,
  ],

  [Roles.MARKETING_STAFF]: [
    Channels.CONTENT, Channels.SOCIAL, Channels.CAMPAIGNS, Channels.REPUTATION,
    Channels.NOTIFICATIONS,
  ],

  [Roles.CLIENT]: [
    Channels.MY_POLICIES, Channels.MY_CLAIMS, Channels.MY_TICKETS,
    Channels.NOTIFICATIONS,
  ],

  [Roles.INVESTOR]: [
    Channels.REVENUE, Channels.KPIS,
    Channels.NOTIFICATIONS,
  ],
};

/**
 * Default channels to auto-subscribe based on role
 */
const DEFAULT_CHANNELS: Record<Role, Channel[]> = {
  [Roles.OWNER]: [Channels.AGENTS, Channels.ALERTS, Channels.NOTIFICATIONS],
  [Roles.SYSTEM_ADMIN]: [Channels.AGENTS, Channels.ALERTS, Channels.ERRORS, Channels.NOTIFICATIONS],
  [Roles.AGENCY_MANAGER]: [Channels.LEADS, Channels.TEAM, Channels.ALERTS, Channels.NOTIFICATIONS],
  [Roles.SALES_AGENT]: [Channels.MY_LEADS, Channels.MY_APPOINTMENTS, Channels.NOTIFICATIONS],
  [Roles.MARKETING_STAFF]: [Channels.CONTENT, Channels.NOTIFICATIONS],
  [Roles.CLIENT]: [Channels.MY_POLICIES, Channels.NOTIFICATIONS],
  [Roles.INVESTOR]: [Channels.REVENUE, Channels.KPIS],
};

// =============================================================================
// TYPES
// =============================================================================

export interface AuthenticatedSocket {
  ws: WebSocket;
  userId: string;
  email: string;
  role: Role;
  subscribedChannels: Set<Channel>;
  lastPing: number;
  connectionId: string;
}

export interface WebSocketMessage {
  type: string;
  channel?: Channel;
  data?: any;
  timestamp?: number;
}

// =============================================================================
// WEBSOCKET SERVER
// =============================================================================

export class GCFWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedSocket> = new Map();
  private userConnections: Map<string, Set<string>> = new Map(); // userId -> connectionIds
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(server: Server, path = '/ws/gcf') {
    this.wss = new WebSocketServer({ noServer: true });

    // Handle upgrade requests
    server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
      const url = new URL(request.url || '', `http://${request.headers.host}`);

      if (url.pathname === path) {
        this.handleUpgrade(request, socket, head);
      }
      // Other WebSocket servers handle their own paths
    });

    // Start heartbeat
    this.startHeartbeat();

    console.log(`[WebSocket] GCF WebSocket server initialized on ${path}`);
  }

  /**
   * Handle WebSocket upgrade with authentication
   */
  private async handleUpgrade(request: IncomingMessage, socket: Socket, head: Buffer) {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const userId = url.searchParams.get('userId');
      const sessionId = url.searchParams.get('sessionId');

      // For now, we'll use userId directly (session-based auth)
      // In production, this should validate a session or JWT
      if (!userId) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // Fetch user from database
      const user = await storage.getUserById(userId);
      if (!user || !user.isActive) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // Complete upgrade
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        const role: Role = isValidRole(user.role) ? user.role : Roles.CLIENT;
        this.onConnection(ws, userId, user.email, role);
      });
    } catch (error) {
      console.error('[WebSocket] Upgrade error:', error);
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
      socket.destroy();
    }
  }

  /**
   * Handle new WebSocket connection
   */
  private onConnection(ws: WebSocket, userId: string, email: string, role: Role) {
    const connectionId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const client: AuthenticatedSocket = {
      ws,
      userId,
      email,
      role,
      subscribedChannels: new Set(),
      lastPing: Date.now(),
      connectionId,
    };

    // Store client
    this.clients.set(connectionId, client);

    // Track user connections
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(connectionId);

    // Auto-subscribe to default channels
    const defaultChannels = DEFAULT_CHANNELS[role] || [];
    for (const channel of defaultChannels) {
      client.subscribedChannels.add(channel);
    }

    // Send connected confirmation
    this.send(ws, {
      type: 'connected',
      data: {
        connectionId,
        userId,
        role,
        channels: Array.from(client.subscribedChannels),
        availableChannels: ROLE_CHANNEL_ACCESS[role],
      },
    });

    console.log(`[WebSocket] Client connected: ${email} (${role}) - ${connectionId}`);

    // Handle messages
    ws.on('message', (data) => this.onMessage(client, data));

    // Handle close
    ws.on('close', () => this.onClose(client));

    // Handle pong (heartbeat response)
    ws.on('pong', () => {
      client.lastPing = Date.now();
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`[WebSocket] Client error (${connectionId}):`, error);
    });
  }

  /**
   * Handle incoming message from client
   */
  private onMessage(client: AuthenticatedSocket, data: any) {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(client, message.channel);
          break;

        case 'unsubscribe':
          this.handleUnsubscribe(client, message.channel);
          break;

        case 'ping':
          client.lastPing = Date.now();
          this.send(client.ws, { type: 'pong', timestamp: Date.now() });
          break;

        default:
          console.log(`[WebSocket] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('[WebSocket] Message parse error:', error);
    }
  }

  /**
   * Handle channel subscription
   */
  private handleSubscribe(client: AuthenticatedSocket, channel?: Channel) {
    if (!channel) {
      this.send(client.ws, { type: 'error', data: { message: 'Channel required' } });
      return;
    }

    // Check access
    const allowedChannels = ROLE_CHANNEL_ACCESS[client.role] || [];
    if (!allowedChannels.includes(channel)) {
      this.send(client.ws, {
        type: 'error',
        data: { message: `Access denied to channel: ${channel}` },
      });
      return;
    }

    client.subscribedChannels.add(channel);
    this.send(client.ws, {
      type: 'subscribed',
      channel,
      data: { channels: Array.from(client.subscribedChannels) },
    });

    console.log(`[WebSocket] ${client.email} subscribed to ${channel}`);
  }

  /**
   * Handle channel unsubscription
   */
  private handleUnsubscribe(client: AuthenticatedSocket, channel?: Channel) {
    if (!channel) return;

    client.subscribedChannels.delete(channel);
    this.send(client.ws, {
      type: 'unsubscribed',
      channel,
      data: { channels: Array.from(client.subscribedChannels) },
    });
  }

  /**
   * Handle connection close
   */
  private onClose(client: AuthenticatedSocket) {
    // Remove from clients
    this.clients.delete(client.connectionId);

    // Remove from user connections
    const userConns = this.userConnections.get(client.userId);
    if (userConns) {
      userConns.delete(client.connectionId);
      if (userConns.size === 0) {
        this.userConnections.delete(client.userId);
      }
    }

    console.log(`[WebSocket] Client disconnected: ${client.email} - ${client.connectionId}`);
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Broadcast message to all subscribers of a channel
   */
  broadcast(channel: Channel, data: any, excludeUserId?: string) {
    const message: WebSocketMessage = {
      type: 'broadcast',
      channel,
      data,
      timestamp: Date.now(),
    };

    const messageStr = JSON.stringify(message);
    let count = 0;

    this.clients.forEach((client) => {
      if (
        client.subscribedChannels.has(channel) &&
        client.ws.readyState === WebSocket.OPEN &&
        client.userId !== excludeUserId
      ) {
        client.ws.send(messageStr);
        count++;
      }
    });

    return count;
  }

  /**
   * Send message to a specific user (all their connections)
   */
  sendToUser(userId: string, data: any, channel?: Channel) {
    const connectionIds = this.userConnections.get(userId);
    if (!connectionIds) return 0;

    const message: WebSocketMessage = {
      type: 'direct',
      channel,
      data,
      timestamp: Date.now(),
    };

    const messageStr = JSON.stringify(message);
    let count = 0;

    connectionIds.forEach((connectionId) => {
      const client = this.clients.get(connectionId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
        count++;
      }
    });

    return count;
  }

  /**
   * Send message to users with specific role(s)
   */
  sendToRole(roles: Role | Role[], data: any, channel?: Channel) {
    const roleSet = new Set(Array.isArray(roles) ? roles : [roles]);

    const message: WebSocketMessage = {
      type: 'role-broadcast',
      channel,
      data,
      timestamp: Date.now(),
    };

    const messageStr = JSON.stringify(message);
    let count = 0;

    this.clients.forEach((client) => {
      if (roleSet.has(client.role) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
        count++;
      }
    });

    return count;
  }

  /**
   * Get connected client count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get connected users count
   */
  getUserCount(): number {
    return this.userConnections.size;
  }

  /**
   * Get channel subscriber count
   */
  getChannelSubscribers(channel: Channel): number {
    let count = 0;
    this.clients.forEach((client) => {
      if (client.subscribedChannels.has(channel)) {
        count++;
      }
    });
    return count;
  }

  /**
   * Get all stats
   */
  getStats() {
    const channelStats: Record<string, number> = {};
    for (const channel of ALL_CHANNELS) {
      channelStats[channel] = this.getChannelSubscribers(channel);
    }

    return {
      clients: this.clients.size,
      users: this.userConnections.size,
      channels: channelStats,
    };
  }

  // =============================================================================
  // HEARTBEAT
  // =============================================================================

  private startHeartbeat() {
    const HEARTBEAT_INTERVAL = 30000; // 30 seconds
    const TIMEOUT = 60000; // 60 seconds

    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();

      this.clients.forEach((client, connectionId) => {
        // Check for dead connections
        if (now - client.lastPing > TIMEOUT) {
          console.log(`[WebSocket] Terminating dead connection: ${connectionId}`);
          client.ws.terminate();
          return;
        }

        // Send ping
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.ping();
        }
      });
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Clean up resources
   */
  close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.forEach((client) => {
      client.ws.close(1000, 'Server shutting down');
    });

    this.wss.close();
    console.log('[WebSocket] Server closed');
  }

  // =============================================================================
  // HELPERS
  // =============================================================================

  private send(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

export default GCFWebSocketServer;
