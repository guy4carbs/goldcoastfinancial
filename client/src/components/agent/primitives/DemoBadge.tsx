import { cn } from "@/lib/utils";
import { Beaker } from "lucide-react";

interface DemoBadgeProps {
  className?: string;
  message?: string;
}

/**
 * Badge to indicate demo/sample data functionality
 * Shows users that the feature uses simulated data
 */
export function DemoBadge({ className, message = "Demo Mode" }: DemoBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "bg-amber-100 border border-amber-300 text-amber-800",
        "text-xs font-medium",
        className
      )}
      role="status"
      aria-label={`${message} - This feature uses sample data for demonstration`}
    >
      <Beaker className="w-3 h-3" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Floating demo indicator for bottom corner of screen
 */
export function DemoIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("fixed bottom-24 lg:bottom-4 right-4 z-50", className)}>
      <DemoBadge />
    </div>
  );
}
