/**
 * Executive Error Boundary
 * Heritage Design System
 */

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { GRID, TYPE, RADIUS, SHADOW } from '@/lib/heritageDesignSystem';
import { EXECUTIVE_GRADIENT_CSS, glassCard } from '../executiveConstants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ExecutiveErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            ...glassCard,
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.card,
            padding: GRID.spacing.xxxxl,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 64,
              height: 64,
              borderRadius: RADIUS.card,
              background: EXECUTIVE_GRADIENT_CSS,
              boxShadow: SHADOW.level3,
              marginBottom: GRID.spacing.md,
            }}
          >
            <AlertTriangle style={{ width: 28, height: 28, color: 'white' }} />
          </div>
          <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title, marginBottom: GRID.spacing.xs }}>
            Something went wrong
          </h3>
          <p className="text-gray-500" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.md }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 text-white font-medium"
            style={{
              padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
              borderRadius: RADIUS.button,
              background: EXECUTIVE_GRADIENT_CSS,
              boxShadow: SHADOW.level2,
            }}
          >
            <RefreshCw style={{ width: 16, height: 16 }} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
