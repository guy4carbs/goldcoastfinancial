/**
 * UnifiedNotificationSystem
 * Complete notification UI: toast popups, bell icon, and dropdown panel
 * Subscribes to WebSocket notifications channel for real-time updates
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNotificationStore, type Notification, type NotificationType } from '@/stores/notificationStore';
import { useChannel } from '@/providers/WebSocketProvider';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_VISIBLE_TOASTS = 5;

const NOTIFICATION_ICONS: Record<NotificationType, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  agent: Bot,
};

const NOTIFICATION_COLORS: Record<NotificationType, { bg: string; border: string; icon: string }> = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' },
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500' },
  error: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500' },
  agent: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-500' },
};

// =============================================================================
// TOAST COMPONENT
// =============================================================================

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

function Toast({ notification, onDismiss }: ToastProps) {
  const colors = NOTIFICATION_COLORS[notification.type];
  const Icon = NOTIFICATION_ICONS[notification.type];

  // Auto-dismiss after duration
  useEffect(() => {
    if (notification.autoHide && notification.autoHideDuration) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, notification.autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm max-w-sm w-full',
        colors.bg,
        colors.border
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', colors.icon)} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900">{notification.title}</p>
        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
        {notification.actionUrl && (
          <a
            href={notification.actionUrl}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
          >
            {notification.actionLabel || 'View'}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      {notification.dismissible && (
        <button
          onClick={() => onDismiss(notification.id)}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </motion.div>
  );
}

// =============================================================================
// TOAST CONTAINER
// =============================================================================

function ToastContainer() {
  const notifications = useNotificationStore((s) => s.notifications);
  const remove = useNotificationStore((s) => s.remove);
  const markRead = useNotificationStore((s) => s.markRead);

  // Track which toasts have been shown
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());

  // Get unread notifications that haven't been shown yet
  const toasts = notifications
    .filter((n) => !n.read && !shownIds.has(n.id))
    .slice(0, MAX_VISIBLE_TOASTS);

  // Mark as shown when toast appears
  useEffect(() => {
    const newIds = toasts.map((t) => t.id);
    if (newIds.length > 0) {
      setShownIds((prev) => new Set([...Array.from(prev), ...newIds]));
    }
  }, [toasts]);

  const handleDismiss = useCallback((id: string) => {
    markRead(id);
    setShownIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [markRead]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((notification) => (
          <Toast key={notification.id} notification={notification} onDismiss={handleDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// NOTIFICATION ITEM (for dropdown)
// =============================================================================

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
}

function NotificationItem({ notification, onMarkRead, onRemove }: NotificationItemProps) {
  const colors = NOTIFICATION_COLORS[notification.type];
  const Icon = NOTIFICATION_ICONS[notification.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 border-b border-gray-100 last:border-0 transition-colors',
        notification.read ? 'bg-white' : 'bg-blue-50/50'
      )}
    >
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', colors.bg)}>
        <Icon className={cn('w-4 h-4', colors.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-sm font-medium text-gray-900', !notification.read && 'font-semibold')}>
            {notification.title}
          </p>
          <span className="text-[10px] text-gray-400 flex-shrink-0">
            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
        {notification.actionUrl && (
          <a
            href={notification.actionUrl}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
          >
            {notification.actionLabel || 'View details'}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {!notification.read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title="Mark as read"
          >
            <CheckCheck className="w-3 h-3 text-gray-400" />
          </button>
        )}
        <button
          onClick={() => onRemove(notification.id)}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="Remove"
        >
          <Trash2 className="w-3 h-3 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface UnifiedNotificationSystemProps {
  className?: string;
}

export function UnifiedNotificationSystem({ className }: UnifiedNotificationSystemProps) {
  const { notifications, unreadCount, add, markRead, markAllRead, remove, clear } = useNotificationStore();

  // Subscribe to WebSocket notifications channel
  useChannel('notifications', (data) => {
    if (data && typeof data === 'object') {
      add({
        type: data.type || 'info',
        title: data.title || 'Notification',
        message: data.message || '',
        priority: data.priority || 'normal',
        channel: 'notifications',
        source: data.source,
        data: data.data,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
      });
    }
  });

  const recentNotifications = notifications.slice(0, 20);

  return (
    <>
      {/* Toast Container */}
      <ToastContainer />

      {/* Bell Icon with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={cn('relative', className)}>
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                  className="h-7 text-xs text-gray-500 hover:text-gray-700"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="h-7 text-xs text-gray-500 hover:text-gray-700"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Notification List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <ScrollArea className="h-80">
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markRead}
                  onRemove={remove}
                />
              ))}
            </ScrollArea>
          )}

          {/* Footer */}
          {notifications.length > 20 && (
            <div className="p-2 border-t border-gray-100 text-center">
              <span className="text-xs text-gray-400">
                Showing 20 of {notifications.length} notifications
              </span>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default UnifiedNotificationSystem;
