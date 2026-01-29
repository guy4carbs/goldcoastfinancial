import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { overlayVariants, modalVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  isValid?: boolean;
}

interface StepWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  title: string;
  steps: WizardStep[];
  size?: "md" | "lg" | "xl";
}

const sizeClasses = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export function StepWizard({
  isOpen,
  onClose,
  onComplete,
  title,
  steps,
  size = "lg",
}: StepWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = step.isValid !== false;

  const goToNext = () => {
    if (!isLastStep && canProceed) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else if (isLastStep && canProceed) {
      onComplete();
    }
  };

  const goToPrev = () => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setDirection(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Wizard */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden",
              sizeClasses[size]
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-primary">{title}</h2>
                <p className="text-sm text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 -m-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                {steps.map((s, index) => (
                  <div key={s.id} className="flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                        index < currentStep
                          ? "bg-violet-500 text-white"
                          : index === currentStep
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-500"
                      )}
                    >
                      {index < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-12 sm:w-20 h-1 mx-2 rounded-full transition-all",
                          index < currentStep ? "bg-violet-500" : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6 min-h-[300px] overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                >
                  <h3 className="text-lg font-semibold text-primary mb-1">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                  )}
                  <div className="mt-4">{step.content}</div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 pt-4 border-t border-gray-100 bg-gray-50">
              <Button
                variant="outline"
                onClick={goToPrev}
                disabled={isFirstStep}
                className={cn(isFirstStep && "invisible")}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentStep
                        ? "bg-primary w-6"
                        : index < currentStep
                        ? "bg-violet-500"
                        : "bg-gray-300"
                    )}
                  />
                ))}
              </div>

              <Button
                onClick={goToNext}
                disabled={!canProceed}
                className="bg-primary hover:bg-primary/90"
              >
                {isLastStep ? (
                  <>
                    Complete
                    <Check className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default StepWizard;
