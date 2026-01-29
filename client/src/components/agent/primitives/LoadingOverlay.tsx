import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  variant?: 'overlay' | 'inline' | 'fullscreen';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { spinner: 'w-4 h-4', text: 'text-xs' },
  md: { spinner: 'w-6 h-6', text: 'text-sm' },
  lg: { spinner: 'w-8 h-8', text: 'text-base' },
};

export function LoadingOverlay({
  isLoading,
  message,
  variant = 'overlay',
  size = 'md',
  className,
}: LoadingOverlayProps) {
  const config = sizeConfig[size];

  if (variant === 'inline') {
    return (
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("flex items-center gap-2", className)}
          >
            <Loader2 className={cn("animate-spin text-primary", config.spinner)} />
            {message && <span className={cn("text-gray-600", config.text)}>{message}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm",
              className
            )}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <Loader2 className="w-12 h-12 animate-spin text-primary relative" />
              </div>
              {message && (
                <p className="text-gray-600 font-medium">{message}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Default: overlay variant
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] rounded-inherit",
            className
          )}
        >
          <Loader2 className={cn("animate-spin text-primary", config.spinner)} />
          {message && (
            <p className={cn("mt-2 text-gray-600", config.text)}>{message}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Loading Button variant
interface LoadingButtonContentProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButtonContent({
  isLoading,
  loadingText = 'Loading...',
  children,
}: LoadingButtonContentProps) {
  return isLoading ? (
    <span className="flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      {loadingText}
    </span>
  ) : (
    <>{children}</>
  );
}

// Spinner only
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const config = sizeConfig[size];
  return <Loader2 className={cn("animate-spin text-primary", config.spinner, className)} />;
}

export default LoadingOverlay;
