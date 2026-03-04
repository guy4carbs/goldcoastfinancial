import { motion } from "framer-motion";
import { COLORS, MOTION, TYPE, RADIUS, spacing } from "@/lib/heritageDesignSystem";
import { Check } from "lucide-react";

const STEPS = [
  { label: "Personal", short: "1" },
  { label: "Credentials", short: "2" },
  { label: "Address", short: "3" },
  { label: "Background", short: "4" },
  { label: "Goals", short: "5" },
  { label: "Review", short: "6" },
];

interface ProgressIndicatorProps {
  currentStep: number;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div style={{ marginBottom: spacing(3) }}>
      {/* Step counter */}
      <p className="text-gray-500 font-medium" style={{ fontSize: TYPE.meta, marginBottom: spacing(1.5) }}>
        Step {currentStep} of 6
      </p>

      {/* Progress bar */}
      <div className="flex" style={{ gap: 4, marginBottom: spacing(1.5) }}>
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <div
              key={step.label}
              className="flex-1 overflow-hidden"
              style={{ height: 4, borderRadius: RADIUS.pill, backgroundColor: "rgba(0,0,0,0.06)" }}
            >
              <motion.div
                initial={false}
                animate={{
                  width: isCompleted || isActive ? "100%" : "0%",
                }}
                transition={{ duration: MOTION.duration.transition, ease: MOTION.easing }}
                style={{
                  height: "100%",
                  borderRadius: RADIUS.pill,
                  background: isCompleted
                    ? COLORS.primary.violet[600]
                    : isActive
                    ? `linear-gradient(90deg, ${COLORS.primary.violet[600]}, ${COLORS.primary.purple[500]})`
                    : "transparent",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Step labels */}
      <div className="hidden sm:flex" style={{ gap: 4 }}>
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <div key={step.label} className="flex-1 flex items-center" style={{ gap: 4 }}>
              {isCompleted ? (
                <Check
                  className="flex-shrink-0"
                  style={{ width: 12, height: 12, color: COLORS.primary.violet[600] }}
                />
              ) : null}
              <span
                className="truncate"
                style={{
                  fontSize: TYPE.micro,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? COLORS.primary.violet[600]
                    : isCompleted
                    ? COLORS.primary.violet[500]
                    : "#9ca3af",
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
