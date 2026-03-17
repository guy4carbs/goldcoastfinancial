/**
 * NewAgentStep4Training — Training Schedule
 * Collects in-person and online training commitment with conditional detail fields
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { GRID, TYPE, RADIUS, COLORS, MOTION } from '@/lib/heritageDesignSystem';
import { StepCard } from '../shared/StepCard';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';

interface YesNoQuestionProps {
  question: string;
  value: boolean | null;
  onValueChange: (val: boolean) => void;
  detailsValue: string;
  onDetailsChange: (val: string) => void;
  detailsPlaceholder: string;
}

function YesNoQuestion({
  question,
  value,
  onValueChange,
  detailsValue,
  onDetailsChange,
  detailsPlaceholder,
}: YesNoQuestionProps) {
  return (
    <div
      className="border border-gray-200 bg-white"
      style={{
        borderRadius: RADIUS.button,
        padding: GRID.spacing.md,
      }}
    >
      <p
        style={{
          fontSize: TYPE.meta,
          fontWeight: 600,
          color: COLORS.gray[800],
          marginBottom: GRID.spacing.sm,
          lineHeight: TYPE.lineHeight,
        }}
      >
        {question}
      </p>

      <div className="flex gap-3">
        {/* Yes Button */}
        <button
          type="button"
          onClick={() => onValueChange(true)}
          className="flex-1 flex items-center justify-center transition-all"
          style={{
            height: 40,
            borderRadius: RADIUS.input,
            border: `2px solid ${
              value === true ? '#6366f1' : COLORS.gray[200]
            }`,
            backgroundColor:
              value === true ? 'rgba(99, 102, 241, 0.05)' : 'white',
            color: value === true ? '#4f46e5' : COLORS.gray[600],
            fontSize: TYPE.meta,
            fontWeight: 600,
            cursor: 'pointer',
            transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
          }}
        >
          Yes
        </button>

        {/* No Button */}
        <button
          type="button"
          onClick={() => onValueChange(false)}
          className="flex-1 flex items-center justify-center transition-all"
          style={{
            height: 40,
            borderRadius: RADIUS.input,
            border: `2px solid ${
              value === false ? '#6366f1' : COLORS.gray[200]
            }`,
            backgroundColor:
              value === false ? 'rgba(99, 102, 241, 0.05)' : 'white',
            color: value === false ? '#4f46e5' : COLORS.gray[600],
            fontSize: TYPE.meta,
            fontWeight: 600,
            cursor: 'pointer',
            transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
          }}
        >
          No
        </button>
      </div>

      <AnimatePresence>
        {value === true && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
              transition: {
                duration: MOTION.duration.expand,
                ease: MOTION.easing,
              },
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: {
                duration: MOTION.duration.fast,
                ease: MOTION.easing,
              },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: GRID.spacing.sm }}>
              <label
                style={{
                  display: 'block',
                  fontSize: TYPE.micro,
                  fontWeight: 600,
                  color: COLORS.gray[600],
                  marginBottom: 4,
                }}
              >
                Please provide details
              </label>
              <Textarea
                value={detailsValue}
                onChange={(e) => onDetailsChange(e.target.value)}
                placeholder={detailsPlaceholder}
                rows={3}
                style={{
                  borderRadius: RADIUS.input,
                  fontSize: TYPE.meta,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NewAgentStep4Training() {
  const { newAgent, updateNewAgentField } = useOnboardingIntakeForm();

  return (
    <StepCard
      icon={CalendarDays}
      title="Training Schedule"
    >
      {/* Question 1 — In-Person Training */}
      <YesNoQuestion
        question="Can you commit to in-person training sessions?"
        value={newAgent.canCommitInPerson}
        onValueChange={(val) => updateNewAgentField('canCommitInPerson', val)}
        detailsValue={newAgent.inPersonDetails}
        onDetailsChange={(val) => updateNewAgentField('inPersonDetails', val)}
        detailsPlaceholder="Describe your availability for in-person sessions (days, times, location preferences)..."
      />

      {/* Question 2 — Online Training */}
      <YesNoQuestion
        question="Can you commit to scheduled online training sessions?"
        value={newAgent.canCommitOnline}
        onValueChange={(val) => updateNewAgentField('canCommitOnline', val)}
        detailsValue={newAgent.preferredOnlineTimes}
        onDetailsChange={(val) => updateNewAgentField('preferredOnlineTimes', val)}
        detailsPlaceholder="Share your preferred times and availability for online training sessions..."
      />

      {/* Info Card */}
      <div
        className="flex items-start gap-3"
        style={{
          borderRadius: RADIUS.button,
          backgroundColor: COLORS.primary.violet[50],
          border: `1px solid ${COLORS.primary.violet[200]}`,
          padding: GRID.spacing.md,
        }}
      >
        <Info
          size={18}
          className="flex-shrink-0"
          style={{
            color: COLORS.primary.violet[600],
            marginTop: 2,
          }}
        />
        <div>
          <p
            style={{
              fontSize: TYPE.meta,
              fontWeight: 700,
              color: COLORS.primary.violet[800],
              lineHeight: TYPE.lineHeight,
              marginBottom: 4,
            }}
          >
            What training includes
          </p>
          <p
            style={{
              fontSize: TYPE.micro,
              color: COLORS.primary.violet[700],
              lineHeight: 1.5,
            }}
          >
            Your training plan covers pre-licensing education, exam preparation,
            study materials, one-on-one mentorship, and sales techniques. Sessions
            are scheduled around your availability and learning style preferences.
          </p>
        </div>
      </div>
    </StepCard>
  );
}
