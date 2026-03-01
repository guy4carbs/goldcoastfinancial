import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { RADIUS } from "@/lib/heritageDesignSystem";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  variant?: 'default' | 'card' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: {
    container: 'py-6',
    icon: 'w-4 h-4',
    iconWrapper: 'w-10 h-10 mb-3',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    container: 'py-10',
    icon: 'w-5 h-5',
    iconWrapper: 'w-12 h-12 mb-4',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'w-6 h-6',
    iconWrapper: 'w-14 h-14 mb-5',
    title: 'text-lg',
    description: 'text-base',
  },
};

const variantClasses = {
  default: 'bg-transparent',
  card: 'bg-white rounded-xl border border-gray-100 shadow-sm',
  minimal: 'bg-transparent',
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  size = 'md',
  className,
}: EmptyStateProps) {
  const sizeStyle = sizeClasses[size];
  const ActionIcon = action?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center text-center px-4",
        sizeStyle.container,
        variantClasses[variant],
        className
      )}
    >
      <div
        className={cn(
          "rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25",
          sizeStyle.iconWrapper
        )}
      >
        <Icon className={cn("text-amber-200", sizeStyle.icon)} />
      </div>

      <h3 className={cn("font-semibold text-gray-900", sizeStyle.title)}>
        {title}
      </h3>

      {description && (
        <p className={cn("text-gray-500 mt-1 max-w-sm", sizeStyle.description)}>
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          className="mt-4 gap-2 bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
          style={{ borderRadius: RADIUS.button }}
          size={size === 'sm' ? 'sm' : 'default'}
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

export default EmptyState;
