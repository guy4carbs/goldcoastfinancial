import { cn } from "@/lib/utils";
import { statusClasses } from "@/lib/designTokens";
import {
  Sparkles,
  Phone,
  Target,
  FileText,
  Trophy,
  X,
} from "lucide-react";

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed' | 'lost';

interface StatusBadgeProps {
  status: LeadStatus;
  variant?: 'solid' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<LeadStatus, { label: string; icon: typeof Sparkles }> = {
  new: { label: 'New', icon: Sparkles },
  contacted: { label: 'Contacted', icon: Phone },
  qualified: { label: 'Qualified', icon: Target },
  proposal: { label: 'Proposal', icon: FileText },
  closed: { label: 'Closed', icon: Trophy },
  lost: { label: 'Lost', icon: X },
};

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export function StatusBadge({
  status,
  variant = 'solid',
  size = 'md',
  showIcon = false,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const classes = statusClasses[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full whitespace-nowrap",
        sizeClasses[size],
        variant === 'solid' ? classes.badge : classes.badgeLight,
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}

export default StatusBadge;
