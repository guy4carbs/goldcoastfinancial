import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  BookOpen,
  Users,
  Trophy,
  Target,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  GraduationCap,
  MessageSquare,
  Calendar,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ONBOARDING_STORAGE_KEY = 'agent-onboarding-completed';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Rocket;
  color: string;
  features: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Agent Lounge',
    description: 'Your command center for success in insurance sales. Let\'s take a quick tour of the features that will help you excel.',
    icon: Rocket,
    color: 'from-violet-500 to-purple-600',
    features: [
      'Track your leads and pipeline',
      'Access training and certifications',
      'Connect with your team',
      'Monitor your performance',
    ],
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Get a quick overview of your daily performance, upcoming tasks, and team activity all in one place.',
    icon: Target,
    color: 'from-blue-500 to-cyan-600',
    features: [
      'Daily challenges to boost your XP',
      'Real-time activity feed',
      'Quick stats and metrics',
      'Calendar integration',
    ],
  },
  {
    id: 'leads',
    title: 'Lead Management',
    description: 'Keep track of all your prospects with our intuitive kanban board. Never lose a lead again.',
    icon: Users,
    color: 'from-green-500 to-emerald-600',
    features: [
      'Drag-and-drop lead organization',
      'Detailed lead profiles',
      'Activity tracking',
      'Pipeline analytics',
    ],
  },
  {
    id: 'training',
    title: 'Training & Certification',
    description: 'Build your expertise with our comprehensive training library. Earn certifications to unlock new opportunities.',
    icon: GraduationCap,
    color: 'from-amber-500 to-orange-600',
    features: [
      'Interactive training modules',
      'Certification pathways',
      'XP rewards for completion',
      'Progress tracking',
    ],
  },
  {
    id: 'community',
    title: 'Team & Community',
    description: 'Connect with fellow agents, share tips, and celebrate wins together.',
    icon: MessageSquare,
    color: 'from-pink-500 to-rose-600',
    features: [
      'Team chat channels',
      'Study groups',
      'Leaderboards',
      'Peer recognition',
    ],
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'You\'re ready to start your journey. Complete your first daily challenge to earn bonus XP!',
    icon: Trophy,
    color: 'from-yellow-500 to-amber-600',
    features: [
      'Complete your profile',
      'Add your first lead',
      'Start a training module',
      'Connect with your team',
    ],
  },
];

interface OnboardingProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export function Onboarding({ forceShow = false, onComplete }: OnboardingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!hasCompleted || forceShow) {
      setIsOpen(true);
    }
  }, [forceShow]);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header with gradient */}
            <div className={cn("p-8 pb-6 bg-gradient-to-br text-white", step.color)}>
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  Step {currentStep + 1} of {onboardingSteps.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white hover:bg-white/10 -mr-2"
                  onClick={handleSkip}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{step.title}</h2>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-6">{step.description}</p>

              <div className="space-y-3">
                {step.features.map((feature, idx) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br", step.color)}>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-8 mb-6">
                {onboardingSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      idx === currentStep
                        ? "w-6 bg-primary"
                        : idx < currentStep
                        ? "bg-primary/50"
                        : "bg-gray-200"
                    )}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="text-gray-500"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                <div className="flex gap-2">
                  {!isLastStep && (
                    <Button variant="ghost" onClick={handleSkip} className="text-gray-500">
                      Skip Tour
                    </Button>
                  )}
                  <Button onClick={nextStep} className="bg-primary">
                    {isLastStep ? (
                      <>
                        Get Started
                        <Sparkles className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check if onboarding is complete
export function useOnboarding() {
  const [isComplete, setIsComplete] = useState(true);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    setIsComplete(!!hasCompleted);
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setIsComplete(false);
  };

  return { isComplete, resetOnboarding };
}

// Feature tooltip for contextual help
interface FeatureTooltipProps {
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export function FeatureTooltip({
  title,
  description,
  position = 'bottom',
  children,
}: FeatureTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "absolute z-50 w-64 p-3 bg-gray-900 text-white rounded-lg shadow-lg",
              positionClasses[position]
            )}
          >
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-gray-300 mt-1">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Onboarding;
