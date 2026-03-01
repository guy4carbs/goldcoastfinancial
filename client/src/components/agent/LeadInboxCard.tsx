import { motion } from "framer-motion";
import {
  Phone, Mail, MessageSquare, Calendar, Clock,
  AlertCircle, User, ChevronRight, MapPin, FileText, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { MOTION, RADIUS } from "@/lib/heritageDesignSystem";

interface LeadInboxCardProps {
  lead: Lead;
  urgency: 'overdue' | 'today' | 'upcoming' | 'no-followup';
  onClick: () => void;
  onQuickCall: () => void;
  onQuickActivity: () => void;
  showUrgencyScore?: boolean;
}

const URGENCY_CONFIG = {
  overdue: {
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon: AlertCircle,
    iconColor: 'text-red-500',
  },
  today: {
    bg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    icon: Clock,
    iconColor: 'text-amber-500',
  },
  upcoming: {
    bg: 'bg-violet-50 border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    icon: Calendar,
    iconColor: 'text-violet-500',
  },
  'no-followup': {
    bg: 'bg-gray-50 border-gray-300 border-dashed',
    badge: 'bg-gray-100 text-gray-600',
    icon: AlertCircle,
    iconColor: 'text-gray-400',
  },
};

const STATUS_COLORS: Record<Lead['status'], string> = {
  new: 'bg-purple-100 text-purple-700',
  contacted: 'bg-amber-100 text-amber-700',
  qualified: 'bg-violet-100 text-violet-700',
  proposal: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-gray-100 text-gray-500',
};

const FOLLOW_UP_TYPE_ICONS = {
  call: Phone,
  email: Mail,
  text: MessageSquare,
  meeting: Calendar,
};

export function LeadInboxCard({ lead, urgency, onClick, onQuickCall, onQuickActivity, showUrgencyScore = true }: LeadInboxCardProps) {
  const { calculateLeadUrgencyScore } = useAgentStore();
  const config = URGENCY_CONFIG[urgency];
  const UrgencyIcon = config.icon;
  const FollowUpIcon = lead.nextFollowUpType ? FOLLOW_UP_TYPE_ICONS[lead.nextFollowUpType] : Phone;

  // Calculate urgency score
  const { score: urgencyScore } = calculateLeadUrgencyScore(lead);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

    const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays <= 7) return `In ${diffDays} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOverdueDays = () => {
    if (!lead.nextFollowUpDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUp = new Date(lead.nextFollowUpDate);
    followUp.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - followUp.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const overdueDays = getOverdueDays();

  return (
    <motion.div
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      whileTap={{ scale: 0.99 }}
      transition={MOTION.spring}
      className={cn(
        "p-4 border cursor-pointer transition-all",
        config.bg
      )}
      style={{ borderRadius: RADIUS.input }}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-primary" />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{lead.name}</h3>
            <Badge className={cn("text-[10px] px-1.5 py-0", STATUS_COLORS[lead.status])}>
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </Badge>
            {showUrgencyScore && (
              <Badge className={cn(
                "text-[10px] px-1.5 py-0 flex items-center gap-1",
                urgencyScore >= 80 ? "bg-red-500 text-white" :
                urgencyScore >= 60 ? "bg-orange-500 text-white" :
                urgencyScore >= 40 ? "bg-amber-500 text-white" :
                "bg-emerald-500 text-white"
              )}>
                <Zap className="w-2.5 h-2.5" />
                {urgencyScore}
              </Badge>
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
            {lead.product && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {lead.product}
              </span>
            )}
            {lead.state && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {lead.state}
              </span>
            )}
          </div>

          {/* Follow-up info */}
          <div className="flex items-center gap-2">
            <UrgencyIcon className={cn("w-4 h-4", config.iconColor)} />
            {urgency === 'no-followup' ? (
              <span className="text-sm text-gray-500">No follow-up scheduled</span>
            ) : (
              <span className={cn(
                "text-sm font-medium",
                urgency === 'overdue' ? "text-red-700" :
                urgency === 'today' ? "text-amber-700" :
                urgency === 'upcoming' ? "text-violet-700" : "text-gray-600"
              )}>
                {urgency === 'overdue' && overdueDays > 0
                  ? `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`
                  : formatDate(lead.nextFollowUpDate || '')}
              </span>
            )}
            {lead.nextFollowUpType && urgency !== 'no-followup' && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex items-center gap-1">
                <FollowUpIcon className="w-3 h-3" />
                {lead.nextFollowUpType}
              </Badge>
            )}
          </div>

          {/* Last contact */}
          {lead.lastContactDate && (
            <p className="text-xs text-gray-400 mt-1">
              Last contact: {new Date(lead.lastContactDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onQuickCall();
            }}
          >
            <Phone className="w-4 h-4 text-primary" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onQuickActivity();
            }}
          >
            <FileText className="w-4 h-4 text-gray-500" />
          </Button>
          <ChevronRight className="w-4 h-4 text-gray-300 mx-auto mt-1" />
        </div>
      </div>

      {/* Policy status (if applicable) */}
      {lead.policyStatus && (
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "text-[10px]",
                lead.policyStatus === 'issued' ? 'bg-emerald-100 text-emerald-700' :
                lead.policyStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                lead.policyStatus === 'pending_underwriting' ? 'bg-amber-100 text-amber-700' :
                lead.policyStatus === 'submitted' ? 'bg-purple-100 text-purple-700' :
                lead.policyStatus === 'quoted' ? 'bg-violet-100 text-violet-700' :
                'bg-red-100 text-red-700'
              )}
            >
              {lead.policyStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            {lead.carrier && (
              <span className="text-xs text-gray-500">{lead.carrier}</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
