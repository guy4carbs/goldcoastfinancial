import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  FileText, 
  CreditCard, 
  Shield, 
  MessageSquare, 
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "payment" | "policy" | "message" | "document" | "alert";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationsPopoverProps {
  children: React.ReactNode;
  onOpenPreferences?: () => void;
  onViewAllNotifications?: () => void;
}

export function NotificationsPopover({ children, onOpenPreferences, onViewAllNotifications }: NotificationsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "payment",
      title: "Payment Reminder",
      description: "Your monthly premium of $334 is due on Feb 1, 2025",
      time: "2 hours ago",
      read: false
    },
    {
      id: "2",
      type: "message",
      title: "New Message from Jack Cook",
      description: "Hi! I wanted to reach out about your annual policy review...",
      time: "2 days ago",
      read: false
    },
    {
      id: "3",
      type: "document",
      title: "Document Available",
      description: "Your 2024 Annual Statement is now available for download",
      time: "1 week ago",
      read: true
    },
    {
      id: "4",
      type: "policy",
      title: "Policy Update Confirmed",
      description: "Your beneficiary update has been successfully processed",
      time: "2 weeks ago",
      read: true
    },
    {
      id: "5",
      type: "alert",
      title: "Action Required",
      description: "Please update your contact information to ensure timely communications",
      time: "3 weeks ago",
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "payment":
        return <CreditCard className="w-4 h-4" />;
      case "policy":
        return <Shield className="w-4 h-4" />;
      case "message":
        return <MessageSquare className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      case "alert":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getIconBg = (type: Notification["type"]) => {
    switch (type) {
      case "payment":
        return "bg-green-100 text-green-600";
      case "policy":
        return "bg-primary/10 text-primary";
      case "message":
        return "bg-blue-100 text-blue-600";
      case "document":
        return "bg-orange-100 text-orange-600";
      case "alert":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    switch (notification.type) {
      case "payment":
        toast.info("Navigating to payment details...");
        break;
      case "message":
        toast.info("Opening message...");
        break;
      case "document":
        toast.success("Opening document center...");
        break;
      case "policy":
        toast.info("Opening policy details...");
        break;
      case "alert":
        toast.info("Opening settings to update your information...");
        break;
    }
    setIsOpen(false);
  };

  const handleViewAll = () => {
    if (onViewAllNotifications) {
      onViewAllNotifications();
    } else {
      toast.info("Viewing all notifications...");
    }
    setIsOpen(false);
  };

  const handleOpenSettings = () => {
    if (onOpenPreferences) {
      onOpenPreferences();
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Badge className="bg-secondary text-secondary-foreground text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={handleOpenSettings}
                data-testid="button-notification-settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification, i) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.read ? "bg-secondary/5" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${getIconBg(notification.type)}`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium line-clamp-1 ${!notification.read ? "text-primary" : ""}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        <Separator />
        <div className="p-3">
          <Button 
            variant="ghost" 
            className="w-full justify-center text-sm text-primary hover:text-primary"
            onClick={handleViewAll}
            data-testid="button-view-all-notifications"
          >
            View All Notifications
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
