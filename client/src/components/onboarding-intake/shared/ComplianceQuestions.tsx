/**
 * ComplianceQuestions — Three yes/no compliance questions
 * Each question with conditional detail textarea using AnimatePresence
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { GRID, TYPE, RADIUS, COLORS, MOTION } from '@/lib/heritageDesignSystem';

interface ComplianceQuestionsProps {
  hasFelony: boolean | null;
  felonyDetails: string;
  hasBankruptcy: boolean | null;
  bankruptcyDetails: string;
  hasMisdemeanor: boolean | null;
  misdemeanorDetails: string;
  onChange: (field: string, value: boolean | string) => void;
}

interface QuestionBlockProps {
  question: string;
  yesNoValue: boolean | null;
  detailsValue: string;
  yesNoField: string;
  detailsField: string;
  onChange: (field: string, value: boolean | string) => void;
}

function QuestionBlock({
  question,
  yesNoValue,
  detailsValue,
  yesNoField,
  detailsField,
  onChange,
}: QuestionBlockProps) {
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
          onClick={() => onChange(yesNoField, true)}
          className="flex-1 flex items-center justify-center transition-all"
          style={{
            height: 40,
            borderRadius: RADIUS.input,
            border: `2px solid ${
              yesNoValue === true
                ? COLORS.primary.violet[500]
                : COLORS.gray[200]
            }`,
            backgroundColor:
              yesNoValue === true
                ? COLORS.primary.violet[50]
                : 'white',
            color:
              yesNoValue === true
                ? COLORS.primary.violet[700]
                : COLORS.gray[600],
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
          onClick={() => onChange(yesNoField, false)}
          className="flex-1 flex items-center justify-center transition-all"
          style={{
            height: 40,
            borderRadius: RADIUS.input,
            border: `2px solid ${
              yesNoValue === false
                ? COLORS.primary.violet[500]
                : COLORS.gray[200]
            }`,
            backgroundColor:
              yesNoValue === false
                ? COLORS.primary.violet[50]
                : 'white',
            color:
              yesNoValue === false
                ? COLORS.primary.violet[700]
                : COLORS.gray[600],
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
        {yesNoValue === true && (
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
                onChange={(e) => onChange(detailsField, e.target.value)}
                placeholder="Provide a brief explanation..."
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

export function ComplianceQuestions({
  hasFelony,
  felonyDetails,
  hasBankruptcy,
  bankruptcyDetails,
  hasMisdemeanor,
  misdemeanorDetails,
  onChange,
}: ComplianceQuestionsProps) {
  return (
    <div className="flex flex-col" style={{ gap: GRID.spacing.sm }}>
      <QuestionBlock
        question="Have you ever been convicted of a felony?"
        yesNoValue={hasFelony}
        detailsValue={felonyDetails}
        yesNoField="hasFelony"
        detailsField="felonyDetails"
        onChange={onChange}
      />

      <QuestionBlock
        question="Have you ever filed for bankruptcy?"
        yesNoValue={hasBankruptcy}
        detailsValue={bankruptcyDetails}
        yesNoField="hasBankruptcy"
        detailsField="bankruptcyDetails"
        onChange={onChange}
      />

      <QuestionBlock
        question="Have you ever been convicted of a misdemeanor?"
        yesNoValue={hasMisdemeanor}
        detailsValue={misdemeanorDetails}
        yesNoField="hasMisdemeanor"
        detailsField="misdemeanorDetails"
        onChange={onChange}
      />
    </div>
  );
}
