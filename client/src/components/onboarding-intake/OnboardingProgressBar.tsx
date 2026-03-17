/**
 * Onboarding Progress Bar
 * Horizontal step indicator with numbered circles and connecting lines
 */
import { Check } from 'lucide-react';
import { TYPE } from '@/lib/heritageDesignSystem';
import { cn } from '@/lib/utils';
import type { StepDefinition } from './onboardingIntakeTypes';

interface OnboardingProgressBarProps {
  steps: StepDefinition[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function OnboardingProgressBar({
  steps,
  currentStep,
  onStepClick,
}: OnboardingProgressBarProps) {
  return (
    <div className="w-full px-2">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isFuture = index > currentStep;
          const isClickable = isCompleted;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
                    isCompleted &&
                      'bg-violet-500 text-white cursor-pointer hover:bg-violet-600',
                    isCurrent &&
                      'border-2 border-violet-500 bg-violet-500 text-white',
                    isFuture &&
                      'bg-gray-200 text-gray-400 cursor-default'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </button>

                {/* Step label — hidden on mobile */}
                <span
                  className={cn(
                    'hidden sm:block mt-1.5 text-center whitespace-nowrap',
                    isCompleted && 'text-violet-600 font-medium',
                    isCurrent && 'text-violet-700 font-semibold',
                    isFuture && 'text-gray-400'
                  )}
                  style={{ fontSize: TYPE.micro }}
                >
                  {step.shortTitle}
                </span>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 rounded-full transition-all duration-300',
                    index < currentStep ? 'bg-violet-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
