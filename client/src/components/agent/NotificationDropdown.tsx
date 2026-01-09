import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Check, CheckCheck, Trophy, MessageSquare, 
  AlertTriangle, Calendar, DollarSign, GraduationCap,
  X, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  type: 'achievement' | 'message' | 'alert' | 'reminder' | 'earning' | 'training';
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: (id: string) => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'achievement': return <Trophy className="w-4 h-4 text-secondary" />;
    case 'message': return <MessageSquare className="w-4 h-4 text-primary" />;
    case 'alert': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    case 'reminder': return <Calendar className="w-4 h-4 text-primary" />;
    case 'earning': return <DollarSign className="w-4 h-4 text-secondary" />;
    case 'training': return <GraduationCap className="w-4 h-4 text-primary" />;
    default: return <Bell className="w-4 h-4" />;
  }
};

const getNotificationBg = (type: Notification['type'], read: boolean) => {
  if (read) return 'bg-muted/30';
  switch (type) {
    case 'achievement': return 'bg-secondary/10';
    case 'alert': return 'bg-orange-500/10';
    case 'earning': return 'bg-secondary/10';
    default: return 'bg-primary/5';
  }
};

export function NotificationDropdown({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onClear 
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span 
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 px-2"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="py-1">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification, idx) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "relative px-4 py-3 border-b last:border-0 group cursor-pointer transition-colors",
                      getNotificationBg(notification.type, notification.read),
                      !notification.read && "hover:bg-muted/50"
                    )}
                    onClick={() => !notification.read && onMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        notification.read ? "bg-muted" : "bg-white shadow-sm"
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm line-clamp-1",
                          !notification.read && "font-medium"
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {notification.time}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClear(notification.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    {!notification.read && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-secondary rounded-full" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t px-4 py-2">
            <Button variant="ghost" className="w-full text-xs h-8" size="sm">
              View All Notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
