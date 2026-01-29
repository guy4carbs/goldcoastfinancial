/**
 * Agent Lounge Primitive Components
 *
 * These are the foundational building blocks for the Agent Lounge UI.
 * Use these components to ensure consistent styling and behavior across the application.
 */

export { StatusBadge } from './StatusBadge';
export { StatCard } from './StatCard';
export { EmptyState } from './EmptyState';
export { LoadingSkeleton } from './LoadingSkeleton';
export { Avatar } from './Avatar';
export { IconButton } from './IconButton';
export { ProgressRing } from './ProgressRing';
export { FormField } from './FormField';

// UX Enhancement Components
export { ConfirmDialog, ConfirmProvider, useConfirm } from './ConfirmDialog';
export { LoadingOverlay, LoadingButtonContent, Spinner } from './LoadingOverlay';
export { Pagination, usePagination } from './Pagination';
export { ErrorBoundary, ErrorFallback, showErrorToast, withErrorHandling } from './ErrorBoundary';
