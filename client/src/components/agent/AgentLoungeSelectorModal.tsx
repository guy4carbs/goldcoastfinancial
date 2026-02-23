/**
 * Agent Lounge Selector Modal
 *
 * A selection modal that allows users to choose between:
 * 1. Agent Onboarding Lounge - For new agents in their 365-day training journey
 * 2. Regular Agent Lounge - For established agents with full CRM access
 *
 * Uses Heritage Design System tokens for consistent styling.
 */

import { useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Briefcase, ChevronRight, Sparkles, Target, X } from "lucide-react";
import { useLocation } from "wouter";
import { GLASS, COLORS, RADIUS, SHADOW, MOTION, GRID } from "@/lib/heritageDesignSystem";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";

interface AgentLoungeSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentLoungeSelectorModal({ open, onOpenChange }: AgentLoungeSelectorModalProps) {
  const [, setLocation] = useLocation();
  const { currentDay, completedTasks, totalXp, startDate, isLoaded } = useOnboardingProgress();

  // Calculate onboarding progress
  const onboardingProgress = useMemo(() => {
    const totalExpectedTasks = 150;
    return Math.min(Math.round((completedTasks.length / totalExpectedTasks) * 100), 100);
  }, [completedTasks]);

  // Calculate day streak
  const dayStreak = useMemo(() => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return completedTasks.length > 0 ? Math.min(diffDays, currentDay) : 0;
  }, [startDate, completedTasks, currentDay]);

  // Handle selection
  const handleSelect = useCallback((destination: 'onboarding' | 'agent') => {
    onOpenChange(false);
    if (destination === 'onboarding') {
      setLocation('/agents/onboarding/lounge');
    } else {
      setLocation('/agents/dashboard');
    }
  }, [onOpenChange, setLocation]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      } else if (e.key === '1') {
        handleSelect('onboarding');
      } else if (e.key === '2') {
        handleSelect('agent');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, handleSelect]);

  // Check if user has started onboarding
  const hasOnboardingProgress = completedTasks.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.duration.fast }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal Container */}
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
            onClick={() => onOpenChange(false)}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{
                duration: MOTION.duration.modal,
                ease: MOTION.easing
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
              style={{
                background: GLASS.background,
                backdropFilter: `blur(${GLASS.blur}px)`,
                WebkitBackdropFilter: `blur(${GLASS.blur}px)`,
                borderRadius: RADIUS.hero,
                boxShadow: SHADOW.hero,
                border: `1px solid ${GLASS.border}`,
              }}
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-gray-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Choose Your Destination
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Where would you like to go today?
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="p-6 space-y-4">
                {/* Onboarding Academy Card */}
                <motion.div
                  whileHover={{
                    y: MOTION.hover.y,
                    scale: MOTION.hover.scale,
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    duration: MOTION.duration.hover,
                    ease: MOTION.easing
                  }}
                  onClick={() => handleSelect('onboarding')}
                  className="cursor-pointer"
                  style={{
                    background: hasOnboardingProgress
                      ? `linear-gradient(to right, ${COLORS.accent.amber[50]}, white)`
                      : 'white',
                    borderRadius: RADIUS.card,
                    padding: GRID.spacing.md,
                    boxShadow: SHADOW.card,
                    border: hasOnboardingProgress
                      ? `2px solid ${COLORS.accent.amber[400]}`
                      : `2px solid transparent`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, ${COLORS.primary.purple[600]} 100%)`,
                        borderRadius: RADIUS.input,
                        boxShadow: SHADOW.level2,
                      }}
                    >
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">Onboarding Academy</h3>
                        {hasOnboardingProgress && (
                          <span
                            className="px-2 py-0.5 text-xs font-medium rounded-full"
                            style={{
                              background: COLORS.accent.amber[100],
                              color: COLORS.accent.amber[700],
                            }}
                          >
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Your 365-day journey to becoming an elite agent
                      </p>

                      {/* Progress stats */}
                      {isLoaded && (
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                            <span className="text-xs font-medium text-gray-700">
                              Day {currentDay}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-medium text-gray-700">
                              {onboardingProgress}% Complete
                            </span>
                          </div>
                          {dayStreak > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">🔥</span>
                              <span className="text-xs font-medium text-gray-700">
                                {dayStreak} Day Streak
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>

                  {/* Keyboard hint */}
                  <div className="mt-3 flex justify-end">
                    <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded border border-gray-200">
                      Press 1
                    </kbd>
                  </div>
                </motion.div>

                {/* Agent Command Center Card */}
                <motion.div
                  whileHover={{
                    y: MOTION.hover.y,
                    scale: MOTION.hover.scale,
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    duration: MOTION.duration.hover,
                    ease: MOTION.easing
                  }}
                  onClick={() => handleSelect('agent')}
                  className="cursor-pointer"
                  style={{
                    background: 'white',
                    borderRadius: RADIUS.card,
                    padding: GRID.spacing.md,
                    boxShadow: SHADOW.card,
                    border: `2px solid transparent`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.primary.purple[500]} 0%, ${COLORS.primary.violet[700]} 100%)`,
                        borderRadius: RADIUS.input,
                        boxShadow: SHADOW.level2,
                      }}
                    >
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">Agent Command Center</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Full CRM access for leads, quotes, and pipeline management
                      </p>

                      {/* Quick stats (placeholder) */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: COLORS.semantic.success }}
                          />
                          <span className="text-xs font-medium text-gray-700">
                            12 New Leads
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: COLORS.accent.amber[500] }}
                          />
                          <span className="text-xs font-medium text-gray-700">
                            3 Appointments
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>

                  {/* Keyboard hint */}
                  <div className="mt-3 flex justify-end">
                    <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded border border-gray-200">
                      Press 2
                    </kbd>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <p className="text-xs text-center text-gray-400">
                  Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px]">Esc</kbd> to close
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AgentLoungeSelectorModal;
