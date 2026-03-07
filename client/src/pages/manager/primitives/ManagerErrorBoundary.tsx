/**
 * ManagerErrorBoundary -- Resilient error boundary for Manager Lounge pages
 *
 * Heritage Design System -- Emerald theme:
 * - Glass card with centered layout
 * - AlertTriangle icon (amber) for visual alert
 * - "Try Again" emerald gradient button to reset state
 * - Optional custom fallback UI via `fallback` prop
 *
 * Must be a class component (React error boundaries require getDerivedStateFromError).
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  RADIUS,
  SHADOW,
  TYPE,
  GRID,
} from '@/lib/heritageDesignSystem';
import { glassCard } from '../managerConstants';

interface ManagerErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ManagerErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ManagerErrorBoundary extends React.Component<
  ManagerErrorBoundaryProps,
  ManagerErrorBoundaryState
> {
  constructor(props: ManagerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ManagerErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging -- could be wired to an external service
    console.error('[ManagerErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback takes priority when provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: GRID.spacing.xxxl,
          }}
        >
          <div
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
              padding: GRID.spacing.xl,
              maxWidth: 480,
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: GRID.spacing.sm,
            }}
          >
            {/* Amber alert icon badge */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: RADIUS.button,
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
              }}
            >
              <AlertTriangle
                style={{ width: 24, height: 24, color: '#ffffff' }}
                aria-hidden="true"
              />
            </div>

            {/* Heading */}
            <h2
              style={{
                fontSize: TYPE.title,
                fontWeight: 700,
                color: '#374151', // gray-700
                lineHeight: TYPE.lineHeight,
                margin: 0,
              }}
            >
              Something went wrong
            </h2>

            {/* Error message */}
            <p
              style={{
                fontSize: TYPE.meta,
                color: '#6b7280', // gray-500
                lineHeight: TYPE.lineHeight,
                margin: 0,
                maxWidth: 360,
              }}
            >
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>

            {/* Try Again button -- emerald gradient */}
            <button
              onClick={this.handleRetry}
              style={{
                marginTop: GRID.spacing.xs,
                padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                borderRadius: RADIUS.button,
                border: 'none',
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                color: '#ffffff',
                fontSize: TYPE.meta,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                transition: 'transform 0.12s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.12s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.35)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(5, 150, 105, 0.25)';
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ManagerErrorBoundary;
