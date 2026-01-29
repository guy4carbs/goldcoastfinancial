import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Standalone error fallback component
interface ErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
  variant?: 'page' | 'card' | 'inline';
  className?: string;
}

export function ErrorFallback({
  error,
  onRetry,
  variant = 'card',
  className,
}: ErrorFallbackProps) {
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-3 p-3 bg-red-50 rounded-lg text-red-600", className)}>
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Something went wrong</p>
          {error?.message && (
            <p className="text-xs text-red-500 mt-0.5">{error.message}</p>
          )}
        </div>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="text-red-600 hover:text-red-700">
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className={cn("min-h-[400px] flex items-center justify-center p-8", className)}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            We encountered an unexpected error. Please try again or contact support if the problem persists.
          </p>
          {error?.message && (
            <p className="text-xs text-red-500 bg-red-50 rounded p-2 mb-4 font-mono">
              {error.message}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button onClick={() => window.location.href = '/agents'}>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <Card className={cn("border-red-200 bg-red-50/50", className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Something went wrong</h3>
            <p className="text-sm text-gray-600 mb-3">
              We couldn't load this content. Please try again.
            </p>
            {error?.message && (
              <p className="text-xs text-red-500 bg-red-100 rounded p-2 mb-3 font-mono">
                {error.message}
              </p>
            )}
            {onRetry && (
              <Button onClick={onRetry} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Toast-based error notification helper
import { toast } from "sonner";

export function showErrorToast(error: Error | string, options?: { title?: string }) {
  const message = typeof error === 'string' ? error : error.message;
  toast.error(options?.title || 'Error', {
    description: message,
    action: {
      label: 'Dismiss',
      onClick: () => {},
    },
  });
}

// Async operation wrapper with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options?: {
    onError?: (error: Error) => void;
    showToast?: boolean;
    toastTitle?: string;
  }
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    if (options?.showToast !== false) {
      showErrorToast(err, { title: options?.toastTitle });
    }

    options?.onError?.(err);
    return null;
  }
}

export default ErrorBoundary;
