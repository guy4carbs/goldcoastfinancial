/**
 * ClaimTimeline — Visual stepper/timeline for claim status
 *
 * Steps: Filed -> Documents Submitted -> Under Review -> Decision
 * Active/completed steps use violet gradient, future steps are gray.
 * Current step pulses. Denied shows red at the decision step.
 */

import { motion } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TYPE, RADIUS } from '@/lib/heritageDesignSystem';

interface ClaimTimelineProps {
  status: 'filed' | 'documents_needed' | 'under_review' | 'approved' | 'denied';
}

const STEPS = [
  { key: 'filed', label: 'Filed' },
  { key: 'documents_needed', label: 'Documents Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'decision', label: 'Decision' },
] as const;

// Map status to the step index that is currently active (0-based)
function getActiveStepIndex(status: ClaimTimelineProps['status']): number {
  switch (status) {
    case 'filed': return 0;
    case 'documents_needed': return 1;
    case 'under_review': return 2;
    case 'approved': return 3;
    case 'denied': return 3;
  }
}

function getStepState(
  stepIndex: number,
  activeIndex: number,
  status: ClaimTimelineProps['status'],
): 'completed' | 'active' | 'future' | 'denied' {
  if (stepIndex < activeIndex) return 'completed';
  if (stepIndex === activeIndex) {
    if (stepIndex === 3 && status === 'denied') return 'denied';
    if (stepIndex === 3 && status === 'approved') return 'completed';
    return 'active';
  }
  return 'future';
}

export function ClaimTimeline({ status }: ClaimTimelineProps) {
  const activeIndex = getActiveStepIndex(status);

  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, idx) => {
        const state = getStepState(idx, activeIndex, status);
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.key} className={cn('flex items-center', !isLast && 'flex-1')}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Pulse animation for active step */}
                {state === 'active' && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-violet-400"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ borderRadius: RADIUS.pill }}
                  />
                )}

                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center',
                    state === 'completed' && 'bg-gradient-to-br from-violet-600 to-purple-600',
                    state === 'active' && 'bg-gradient-to-br from-violet-600 to-purple-600',
                    state === 'denied' && 'bg-gradient-to-br from-red-500 to-red-700',
                    state === 'future' && 'bg-gray-200',
                  )}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: RADIUS.pill,
                    boxShadow: state === 'future'
                      ? 'none'
                      : state === 'denied'
                        ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                        : '0 4px 12px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  {state === 'completed' && (
                    <Check size={16} className="text-white" />
                  )}
                  {state === 'active' && (
                    <Clock size={16} className="text-white" />
                  )}
                  {state === 'denied' && (
                    <X size={16} className="text-white" />
                  )}
                  {state === 'future' && (
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                  )}
                </div>
              </div>

              {/* Step label */}
              <p
                className={cn(
                  'mt-2 text-center whitespace-nowrap',
                  state === 'completed' && 'text-violet-700 font-medium',
                  state === 'active' && 'text-violet-700 font-semibold',
                  state === 'denied' && 'text-red-600 font-semibold',
                  state === 'future' && 'text-gray-400',
                )}
                style={{ fontSize: TYPE.caption }}
              >
                {step.label}
                {state === 'denied' && (
                  <span className="block text-red-500" style={{ fontSize: TYPE.micro }}>
                    Denied
                  </span>
                )}
                {state === 'active' && status === 'approved' && idx === 3 && (
                  <span className="block text-emerald-600" style={{ fontSize: TYPE.micro }}>
                    Approved
                  </span>
                )}
              </p>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-1 mx-2">
                <div
                  className={cn(
                    'h-0.5 w-full',
                    idx < activeIndex ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-gray-200',
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ClaimTimeline;
