import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Phone, Mail, Calendar, UserPlus, FileText,
  Calculator, MessageSquare, Send, Plus, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface QuickAction {
  id: string;
  label: string;
  icon: typeof Phone;
  color: string;
  bgColor: string;
  onClick?: () => void;
  badge?: string;
}

interface QuickActionsProps {
  onAddLead?: () => void;
  onLogCall?: () => void;
  onSendEmail?: () => void;
  onSchedule?: () => void;
  onCreateQuote?: () => void;
  onOpenChat?: () => void;
  className?: string;
  variant?: 'grid' | 'horizontal' | 'compact';
}

export function QuickActions({
  onAddLead,
  onLogCall,
  onSendEmail,
  onSchedule,
  onCreateQuote,
  onOpenChat,
  className,
  variant = 'grid',
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'add-lead',
      label: 'Add Lead',
      icon: UserPlus,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10 hover:bg-violet-500/20',
      onClick: onAddLead,
    },
    {
      id: 'log-call',
      label: 'Log Call',
      icon: Phone,
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20',
      onClick: onLogCall,
      badge: '+15 XP',
    },
    {
      id: 'send-email',
      label: 'Send Email',
      icon: Mail,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      onClick: onSendEmail,
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20',
      onClick: onSchedule,
    },
    {
      id: 'create-quote',
      label: 'Create Quote',
      icon: FileText,
      color: 'text-[#E1B138]',
      bgColor: 'bg-[#E1B138]/10 hover:bg-[#E1B138]/20',
      onClick: onCreateQuote,
    },
    {
      id: 'open-chat',
      label: 'Team Chat',
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      onClick: onOpenChat,
    },
  ];

  if (variant === 'horizontal') {
    return (
      <div className={cn("flex items-center gap-2 overflow-x-auto pb-2", className)}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-colors",
                action.bgColor,
                action.color
              )}
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {actions.slice(0, 4).map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                action.bgColor,
                action.color
              )}
              title={action.label}
            >
              <Icon className="w-5 h-5" />
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <Card className={cn("border-gray-100", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-3"
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                variants={fadeInUp}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={action.onClick}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                  action.bgColor
                )}
              >
                {action.badge && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-500 text-white">
                    {action.badge}
                  </span>
                )}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm",
                  action.color
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-700">{action.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
