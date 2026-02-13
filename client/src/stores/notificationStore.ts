/**
 * Notification Store
 * Zustand store for managing notifications across the application
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// TYPES
// =============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'agent';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: NotificationPriority;
  channel?: string;
  source?: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDuration?: number;
}

export interface NotificationStore {
  // State
  notifications: Notification[];
  unreadCount: number;
  maxNotifications: number;

  // Actions
  add: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
  clearRead: () => void;

  // Computed
  getByType: (type: NotificationType) => Notification[];
  getByPriority: (priority: NotificationPriority) => Notification[];
  getUnread: () => Notification[];
  getRecent: (count: number) => Notification[];
}

// =============================================================================
// STORE
// =============================================================================

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      maxNotifications: 100,

      // Add notification
      add: (notification) => {
        const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
          read: false,
          dismissible: notification.dismissible ?? true,
          autoHide: notification.autoHide ?? notification.type !== 'error',
          autoHideDuration: notification.autoHideDuration ?? 5000,
        };

        set((state) => {
          // Add new notification and keep only maxNotifications
          const notifications = [newNotification, ...state.notifications].slice(0, state.maxNotifications);
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        });

        // Request browser notification permission and show if granted
        if (notification.priority === 'high' || notification.priority === 'critical') {
          requestBrowserNotification(newNotification);
        }

        return id;
      },

      // Mark single notification as read
      markRead: (id) => {
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        });
      },

      // Mark all notifications as read
      markAllRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      // Remove single notification
      remove: (id) => {
        set((state) => {
          const notifications = state.notifications.filter((n) => n.id !== id);
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        });
      },

      // Clear all notifications
      clear: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      // Clear only read notifications
      clearRead: () => {
        set((state) => ({
          notifications: state.notifications.filter((n) => !n.read),
        }));
      },

      // Get notifications by type
      getByType: (type) => {
        return get().notifications.filter((n) => n.type === type);
      },

      // Get notifications by priority
      getByPriority: (priority) => {
        return get().notifications.filter((n) => n.priority === priority);
      },

      // Get unread notifications
      getUnread: () => {
        return get().notifications.filter((n) => !n.read);
      },

      // Get most recent notifications
      getRecent: (count) => {
        return get().notifications.slice(0, count);
      },
    }),
    {
      name: 'gcf-notifications',
      // Only persist id, read status, and minimal data to avoid bloat
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50).map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: n.timestamp,
          read: n.read,
          priority: n.priority,
        })),
        unreadCount: state.unreadCount,
      }),
    }
  )
);

// =============================================================================
// BROWSER NOTIFICATIONS
// =============================================================================

async function requestBrowserNotification(notification: Notification) {
  // Check if notifications are supported
  if (!('Notification' in window)) return;

  // Request permission if not granted
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  // Show notification if permitted
  if (Notification.permission === 'granted') {
    try {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical',
      });

      // Handle click to focus tab and navigate
      browserNotif.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotif.close();
      };
    } catch (error) {
      // Silent fail - browser notifications are optional
      console.debug('Browser notification failed:', error);
    }
  }
}

// =============================================================================
// HELPER HOOKS
// =============================================================================

/**
 * Convenience hook for adding notifications with simplified API
 */
export function useNotify() {
  const add = useNotificationStore((s) => s.add);

  return {
    info: (title: string, message: string, options?: Partial<Notification>) =>
      add({ type: 'info', title, message, priority: 'normal', ...options }),

    success: (title: string, message: string, options?: Partial<Notification>) =>
      add({ type: 'success', title, message, priority: 'normal', ...options }),

    warning: (title: string, message: string, options?: Partial<Notification>) =>
      add({ type: 'warning', title, message, priority: 'high', ...options }),

    error: (title: string, message: string, options?: Partial<Notification>) =>
      add({ type: 'error', title, message, priority: 'high', autoHide: false, ...options }),

    agent: (title: string, message: string, options?: Partial<Notification>) =>
      add({ type: 'agent', title, message, priority: 'normal', ...options }),
  };
}

export default useNotificationStore;
