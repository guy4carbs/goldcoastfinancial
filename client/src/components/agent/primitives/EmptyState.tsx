import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

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
    icon: 'w-8 h-8',
    iconWrapper: 'w-14 h-14 mb-3',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    container: 'py-10',
    icon: 'w-10 h-10',
    iconWrapper: 'w-20 h-20 mb-4',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'w-12 h-12',
    iconWrapper: 'w-24 h-24 mb-5',
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
          "rounded-full bg-gray-100 flex items-center justify-center",
          sizeStyle.iconWrapper
        )}
      >
        <Icon className={cn("text-gray-400", sizeStyle.icon)} />
      </div>

      <h3 className={cn("font-semibold text-primary", sizeStyle.title)}>
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
          className="mt-4 gap-2 bg-primary hover:bg-primary/90"
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
