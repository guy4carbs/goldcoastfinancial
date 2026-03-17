import { motion } from "framer-motion";
import { Clock, Zap, UserPen, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RADIUS,
  SHADOW,
  TYPE,
  GRID,
  fadeInUp,
  staggerContainer,
} from "@/lib/heritageDesignSystem";
import type { RecruitingAutomationStep, AutomationStepType } from "@/lib/agentStore";

interface AutomationFlowProps {
  steps: RecruitingAutomationStep[];
  stats: {
    automationRate: number;
    manualSteps: number;
    timeSaved: string;
  };
}

const TYPE_CONFIG: Record<
  AutomationStepType,
  { label: string; circleBg: string; borderColor: string; dotBg: string }
> = {
  automated: {
    label: "Automated",
    circleBg: "bg-emerald-500 text-white",
    borderColor: "border-l-emerald-500",
    dotBg: "bg-emerald-500",
  },
  user_input: {
    label: "User Input",
    circleBg: "bg-amber-500 text-white",
    borderColor: "border-l-amber-500",
    dotBg: "bg-amber-500",
  },
  manual_review: {
    label: "Manual Review",
    circleBg: "bg-violet-500 text-white",
    borderColor: "border-l-violet-500",
    dotBg: "bg-violet-500",
  },
};

const STAT_CARDS = [
  {
    key: "automationRate" as const,
    label: "Automation Rate",
    icon: Zap,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    format: (val: number) => `${val}%`,
  },
  {
    key: "manualSteps" as const,
    label: "Manual Steps",
    icon: UserPen,
    color: "text-violet-600",
    bg: "bg-violet-50",
    iconBg: "bg-violet-100",
    format: (val: number) => `${val}`,
  },
  {
    key: "timeSaved" as const,
    label: "Time Saved",
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    format: (val: string) => val,
  },
];

export function AutomationFlow({ steps, stats }: AutomationFlowProps) {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
      <div
        className="bg-white/80 backdrop-blur-xl border border-gray-100 overflow-hidden"
        style={{
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.level2,
          padding: GRID.spacing.md,
        }}
      >
        {/* Legend */}
        <div
          className="flex items-center flex-wrap"
          style={{ gap: GRID.spacing.md, marginBottom: GRID.spacing.lg }}
        >
          {(["automated", "user_input", "manual_review"] as AutomationStepType[]).map((type) => {
            const config = TYPE_CONFIG[type];
            return (
              <div key={type} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${config.dotBg}`} />
                <span
                  className="text-gray-600 font-medium"
                  style={{ fontSize: TYPE.meta }}
                >
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Vertical Timeline */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative"
          style={{ marginBottom: GRID.spacing.lg }}
        >
          {/* Vertical connecting line */}
          <div
            className="absolute left-[19px] top-5 bg-gray-200"
            style={{
              width: 2,
              bottom: 20,
            }}
          />

          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step) => {
              const config = TYPE_CONFIG[step.type];
              return (
                <motion.div
                  key={step.id}
                  variants={fadeInUp}
                  className="relative flex items-start"
                  style={{ gap: GRID.spacing.sm, paddingBottom: GRID.spacing.sm }}
                >
                  {/* Numbered Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 relative z-10 ${config.circleBg}`}
                    style={{ boxShadow: SHADOW.level1 }}
                  >
                    {step.stepNumber}
                  </div>

                  {/* Step Card */}
                  <Card
                    className={`flex-1 border-l-4 ${config.borderColor} bg-white border-gray-100 shadow-none hover:shadow-sm transition-shadow duration-200`}
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <CardContent
                      className="p-0"
                      style={{
                        padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-semibold text-gray-900"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {step.title}
                          </p>
                          <p
                            className="text-gray-400 mt-0.5 leading-relaxed"
                            style={{ fontSize: TYPE.caption }}
                          >
                            {step.description}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 border-gray-200 text-gray-500 bg-gray-50/80"
                          style={{
                            borderRadius: RADIUS.pill,
                            fontSize: TYPE.caption,
                          }}
                        >
                          <Clock className="w-3 h-3 mr-1 text-gray-400" />
                          {step.estimatedTime}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 pt-5 border-t border-gray-100"
          style={{ gap: GRID.spacing.sm }}
        >
          {STAT_CARDS.map((stat) => {
            const Icon = stat.icon;
            const rawValue = stats[stat.key];
            const displayValue =
              stat.key === "timeSaved"
                ? stat.format(rawValue as string)
                : stat.format(rawValue as number);

            return (
              <motion.div key={stat.key} variants={fadeInUp}>
                <div
                  className={`${stat.bg} flex items-center gap-3`}
                  style={{
                    borderRadius: RADIUS.input,
                    padding: GRID.spacing.sm,
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}
                  >
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p
                      className="text-gray-500 font-medium"
                      style={{ fontSize: TYPE.caption }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className={`font-bold ${stat.color}`}
                      style={{ fontSize: TYPE.title }}
                    >
                      {displayValue}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
