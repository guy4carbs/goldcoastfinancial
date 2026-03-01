import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail, Calendar, FileText, MessageSquare, Zap,
  BarChart2, Shield, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface QuickAction {
  id: string;
  label: string;
  icon: typeof Mail;
  gradient: string;
  shadowColor: string;
  onClick?: () => void;
  badge?: string;
}

interface QuickActionsProps {
  onSendEmail?: () => void;
  onSchedule?: () => void;
  onCreateQuote?: () => void;
  onOpenChat?: () => void;
  onPersonalMetrics?: () => void;
  onDataEncryption?: () => void;
  className?: string;
  variant?: 'grid' | 'horizontal' | 'compact';
}

export function QuickActions({
  onSendEmail,
  onSchedule,
  onCreateQuote,
  onOpenChat,
  onPersonalMetrics,
  onDataEncryption,
  className,
  variant = 'grid',
}: QuickActionsProps) {
  // Alternating violet/purple and amber/orange for visual balance
  const actions: QuickAction[] = [
    {
      id: 'personal-metrics',
      label: 'Personal Metrics',
      icon: BarChart2,
      gradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/25',
      onClick: onPersonalMetrics,
    },
    {
      id: 'data-encryption',
      label: 'Data Encryption',
      icon: Shield,
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/25',
      onClick: onDataEncryption,
    },
    {
      id: 'send-email',
      label: 'Send Email',
      icon: Mail,
      gradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/25',
      onClick: onSendEmail,
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/25',
      onClick: onSchedule,
    },
    {
      id: 'create-quote',
      label: 'Create Quote',
      icon: FileText,
      gradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/25',
      onClick: onCreateQuote,
    },
    {
      id: 'open-chat',
      label: 'Team Chat',
      icon: MessageSquare,
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/25',
      onClick: onOpenChat,
    },
  ];

  if (variant === 'horizontal') {
    return (
      <div className={cn("grid grid-cols-3 lg:grid-cols-6 gap-4", className)}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className="group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl font-medium text-sm transition-all overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              {/* Hover gradient overlay */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br",
                action.gradient
              )} style={{ opacity: 0 }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br from-white/50 to-transparent" />

              {/* Icon with gradient background */}
              <div className={cn(
                "relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 bg-gradient-to-br",
                action.gradient,
                action.shadowColor,
                "group-hover:scale-110 group-hover:shadow-xl"
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Label */}
              <span className="relative text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors text-center leading-tight">
                {action.label}
              </span>

              {/* Subtle bottom accent line */}
              <div className={cn(
                "absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 group-hover:w-12 transition-all duration-300 rounded-full bg-gradient-to-r",
                action.gradient
              )} />
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {actions.slice(0, 4).map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-all bg-gradient-to-br",
                action.gradient,
                action.shadowColor
              )}
              title={action.label}
            >
              <Icon className="w-5 h-5 text-white" />
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <Card
      className={cn("border-0 overflow-hidden", className)}
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Zap className="w-5 h-5 text-amber-200" />
          </div>
          <span className="font-semibold text-gray-900">Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-4"
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={action.onClick}
                className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all bg-gray-50/80 hover:bg-white hover:shadow-lg"
              >
                {action.badge && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md">
                    {action.badge}
                  </span>
                )}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 bg-gradient-to-br",
                  action.gradient,
                  action.shadowColor
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{action.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
