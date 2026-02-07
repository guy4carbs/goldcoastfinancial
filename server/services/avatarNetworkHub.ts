/**
 * Avatar Network Hub - Real-time communication between avatar agents
 *
 * This service manages:
 * - Avatar online/offline status
 * - Direct messaging between avatars
 * - Broadcast messages to all avatars
 * - Activity tracking for network visualization
 */

import {
  type AvatarNetworkMessage,
  type AvatarNetworkStatus,
  type NetworkActivityEvent,
  type AvatarNetworkState,
  type NetworkMessageTypeValue,
  NetworkMessageType
} from "@shared/models/avatarCouncil";

// =============================================================================
// Types
// =============================================================================

type NetworkEventCallback = (event: NetworkActivityEvent) => void;
type MessageCallback = (message: AvatarNetworkMessage) => void;
type StatusCallback = (status: AvatarNetworkStatus) => void;

interface NetworkSubscriber {
  id: string;
  onActivity?: NetworkEventCallback;
  onMessage?: MessageCallback;
  onStatusChange?: StatusCallback;
}

// =============================================================================
// Avatar Network Hub Class
// =============================================================================

class AvatarNetworkHub {
  private avatarStatus: Map<string, AvatarNetworkStatus> = new Map();
  private recentActivity: NetworkActivityEvent[] = [];
  private messageHistory: AvatarNetworkMessage[] = [];
  private subscribers: Map<string, NetworkSubscriber> = new Map();
  private stats = {
    totalMessages: 0,
    messagesLastMinute: 0,
    activeConnections: 0,
  };
  private messageCountWindow: number[] = []; // Timestamps of recent messages

  constructor() {
    // Clean up old activity every 30 seconds
    setInterval(() => this.cleanupOldActivity(), 30000);
    // Update messages per minute every 5 seconds
    setInterval(() => this.updateMessageRate(), 5000);
  }

  // ---------------------------------------------------------------------------
  // Avatar Status Management
  // ---------------------------------------------------------------------------

  /**
   * Register an avatar as online in the network
   */
  registerAvatar(avatarId: string, avatarName: string, avatarSlug: string): void {
    const status: AvatarNetworkStatus = {
      avatarId,
      avatarName,
      avatarSlug,
      isOnline: true,
      lastActivity: new Date().toISOString(),
      activeConnections: [],
      messagesSent: 0,
      messagesReceived: 0,
    };

    this.avatarStatus.set(avatarId, status);
    this.stats.activeConnections++;

    // Emit connection event
    this.emitActivity({
      id: crypto.randomUUID(),
      type: "connection",
      fromAvatarId: avatarId,
      toAvatarId: null,
      timestamp: new Date().toISOString(),
      intensity: 1,
    });

    // Notify subscribers
    this.notifyStatusChange(status);

    console.log(`[NetworkHub] Avatar registered: ${avatarName} (${avatarId})`);
  }

  /**
   * Mark an avatar as offline
   */
  unregisterAvatar(avatarId: string): void {
    const status = this.avatarStatus.get(avatarId);
    if (status) {
      status.isOnline = false;
      status.lastActivity = new Date().toISOString();
      this.stats.activeConnections = Math.max(0, this.stats.activeConnections - 1);

      // Emit disconnection event
      this.emitActivity({
        id: crypto.randomUUID(),
        type: "disconnection",
        fromAvatarId: avatarId,
        toAvatarId: null,
        timestamp: new Date().toISOString(),
        intensity: 0.5,
      });

      this.notifyStatusChange(status);
      console.log(`[NetworkHub] Avatar unregistered: ${status.avatarName}`);
    }
  }

  /**
   * Update avatar's last activity timestamp
   */
  touchAvatar(avatarId: string): void {
    const status = this.avatarStatus.get(avatarId);
    if (status) {
      status.lastActivity = new Date().toISOString();
    }
  }

  /**
   * Get status of a specific avatar
   */
  getAvatarStatus(avatarId: string): AvatarNetworkStatus | undefined {
    return this.avatarStatus.get(avatarId);
  }

  /**
   * Get all avatar statuses
   */
  getAllAvatarStatuses(): AvatarNetworkStatus[] {
    return Array.from(this.avatarStatus.values());
  }

  // ---------------------------------------------------------------------------
  // Messaging
  // ---------------------------------------------------------------------------

  /**
   * Send a direct message from one avatar to another
   */
  sendMessage(
    fromAvatarId: string,
    toAvatarId: string,
    content: string,
    type: NetworkMessageTypeValue = NetworkMessageType.DIRECT,
    metadata?: Record<string, unknown>
  ): AvatarNetworkMessage | null {
    const fromStatus = this.avatarStatus.get(fromAvatarId);
    const toStatus = this.avatarStatus.get(toAvatarId);

    if (!fromStatus) {
      console.warn(`[NetworkHub] Sender avatar not found: ${fromAvatarId}`);
      return null;
    }

    const message: AvatarNetworkMessage = {
      id: crypto.randomUUID(),
      type,
      fromAvatarId,
      fromAvatarName: fromStatus.avatarName,
      fromAvatarSlug: fromStatus.avatarSlug,
      toAvatarId,
      toAvatarName: toStatus?.avatarName || null,
      content,
      metadata,
      timestamp: new Date().toISOString(),
    };

    // Update stats
    this.stats.totalMessages++;
    this.messageCountWindow.push(Date.now());
    fromStatus.messagesSent++;
    if (toStatus) {
      toStatus.messagesReceived++;
    }

    // Store message
    this.messageHistory.push(message);
    if (this.messageHistory.length > 100) {
      this.messageHistory.shift();
    }

    // Emit activity event
    this.emitActivity({
      id: crypto.randomUUID(),
      type: "message",
      fromAvatarId,
      toAvatarId,
      timestamp: message.timestamp,
      duration: 1000,
      intensity: 0.8,
    });

    // Notify subscribers
    this.notifyMessage(message);

    console.log(`[NetworkHub] Message: ${fromStatus.avatarName} -> ${toStatus?.avatarName || 'unknown'}`);
    return message;
  }

  /**
   * Broadcast a message from one avatar to all others
   */
  broadcastMessage(
    fromAvatarId: string,
    content: string,
    type: NetworkMessageTypeValue = NetworkMessageType.BROADCAST,
    metadata?: Record<string, unknown>
  ): AvatarNetworkMessage | null {
    const fromStatus = this.avatarStatus.get(fromAvatarId);

    if (!fromStatus) {
      console.warn(`[NetworkHub] Sender avatar not found: ${fromAvatarId}`);
      return null;
    }

    const message: AvatarNetworkMessage = {
      id: crypto.randomUUID(),
      type,
      fromAvatarId,
      fromAvatarName: fromStatus.avatarName,
      fromAvatarSlug: fromStatus.avatarSlug,
      toAvatarId: null,
      toAvatarName: null,
      content,
      metadata,
      timestamp: new Date().toISOString(),
    };

    // Update stats
    this.stats.totalMessages++;
    this.messageCountWindow.push(Date.now());
    fromStatus.messagesSent++;

    // Update all other avatars' received count
    this.avatarStatus.forEach((status, id) => {
      if (id !== fromAvatarId && status.isOnline) {
        status.messagesReceived++;
      }
    });

    // Store message
    this.messageHistory.push(message);
    if (this.messageHistory.length > 100) {
      this.messageHistory.shift();
    }

    // Emit activity event for broadcast (to all online avatars)
    this.avatarStatus.forEach((status, id) => {
      if (id !== fromAvatarId && status.isOnline) {
        this.emitActivity({
          id: crypto.randomUUID(),
          type: "broadcast",
          fromAvatarId,
          toAvatarId: id,
          timestamp: message.timestamp,
          duration: 1500,
          intensity: 0.6,
        });
      }
    });

    // Notify subscribers
    this.notifyMessage(message);

    console.log(`[NetworkHub] Broadcast from ${fromStatus.avatarName} to all avatars`);
    return message;
  }

  /**
   * Signal that an avatar is "thinking" (processing)
   */
  emitThinking(avatarId: string, targetAvatarId?: string): void {
    this.emitActivity({
      id: crypto.randomUUID(),
      type: "thinking",
      fromAvatarId: avatarId,
      toAvatarId: targetAvatarId || null,
      timestamp: new Date().toISOString(),
      duration: 2000,
      intensity: 0.4,
    });
  }

  // ---------------------------------------------------------------------------
  // Activity & State
  // ---------------------------------------------------------------------------

  /**
   * Get recent activity events
   */
  getRecentActivity(limit: number = 50): NetworkActivityEvent[] {
    return this.recentActivity.slice(-limit);
  }

  /**
   * Get full network state
   */
  getNetworkState(): AvatarNetworkState {
    return {
      avatars: this.getAllAvatarStatuses(),
      recentActivity: this.getRecentActivity(20),
      activeConversations: [], // TODO: Track active conversations
      stats: {
        ...this.stats,
        messagesLastMinute: this.calculateMessagesPerMinute(),
      },
    };
  }

  /**
   * Get message history
   */
  getMessageHistory(limit: number = 50): AvatarNetworkMessage[] {
    return this.messageHistory.slice(-limit);
  }

  // ---------------------------------------------------------------------------
  // Subscriptions
  // ---------------------------------------------------------------------------

  /**
   * Subscribe to network events
   */
  subscribe(subscriber: NetworkSubscriber): () => void {
    this.subscribers.set(subscriber.id, subscriber);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriber.id);
    };
  }

  /**
   * Get subscriber count
   */
  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private emitActivity(event: NetworkActivityEvent): void {
    this.recentActivity.push(event);

    // Keep only last 100 events
    if (this.recentActivity.length > 100) {
      this.recentActivity.shift();
    }

    // Notify all subscribers
    this.subscribers.forEach((subscriber) => {
      if (subscriber.onActivity) {
        try {
          subscriber.onActivity(event);
        } catch (error) {
          console.error(`[NetworkHub] Error notifying subscriber ${subscriber.id}:`, error);
        }
      }
    });
  }

  private notifyMessage(message: AvatarNetworkMessage): void {
    this.subscribers.forEach((subscriber) => {
      if (subscriber.onMessage) {
        try {
          subscriber.onMessage(message);
        } catch (error) {
          console.error(`[NetworkHub] Error notifying subscriber ${subscriber.id}:`, error);
        }
      }
    });
  }

  private notifyStatusChange(status: AvatarNetworkStatus): void {
    this.subscribers.forEach((subscriber) => {
      if (subscriber.onStatusChange) {
        try {
          subscriber.onStatusChange(status);
        } catch (error) {
          console.error(`[NetworkHub] Error notifying subscriber ${subscriber.id}:`, error);
        }
      }
    });
  }

  private cleanupOldActivity(): void {
    const cutoff = Date.now() - 60000; // 1 minute ago
    this.recentActivity = this.recentActivity.filter(
      (event) => new Date(event.timestamp).getTime() > cutoff
    );
  }

  private updateMessageRate(): void {
    const oneMinuteAgo = Date.now() - 60000;
    this.messageCountWindow = this.messageCountWindow.filter((ts) => ts > oneMinuteAgo);
    this.stats.messagesLastMinute = this.messageCountWindow.length;
  }

  private calculateMessagesPerMinute(): number {
    const oneMinuteAgo = Date.now() - 60000;
    return this.messageCountWindow.filter((ts) => ts > oneMinuteAgo).length;
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const avatarNetworkHub = new AvatarNetworkHub();
