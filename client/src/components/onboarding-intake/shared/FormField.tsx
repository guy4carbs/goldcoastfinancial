/**
 * FormField — Heritage-styled form field wrapper
 * Provides consistent label, required indicator, and error display
 */

import type { ReactNode } from 'react';
import { GRID, TYPE, COLORS } from '@/lib/heritageDesignSystem';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div style={{ marginBottom: GRID.spacing.sm }}>
      <label
        style={{
          display: 'block',
          fontSize: TYPE.meta,
          fontWeight: 600,
          color: COLORS.gray[700],
          marginBottom: 6,
          lineHeight: TYPE.lineHeight,
        }}
      >
        {label}
        {required && (
          <span
            style={{
              color: COLORS.semantic.error,
              marginLeft: 2,
            }}
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p
          role="alert"
          style={{
            fontSize: TYPE.micro,
            color: COLORS.semantic.error,
            marginTop: 4,
            lineHeight: TYPE.lineHeight,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
