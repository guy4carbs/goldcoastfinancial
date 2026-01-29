import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string; // Required for accessibility
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses = {
  default: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary',
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-[#E1B138] text-primary hover:bg-[#c49a2f]',
  ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-primary',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon: Icon,
      label,
      variant = 'default',
      size = 'md',
      loading = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-all",
          "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <svg
            className={cn("animate-spin", iconSizeClasses[size])}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <Icon className={iconSizeClasses[size]} />
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
