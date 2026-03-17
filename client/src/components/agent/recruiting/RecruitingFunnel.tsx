import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  MousePointerClick,
  FileEdit,
  FileCheck,
  Shield,
  PenTool,
  CheckCircle,
  Zap,
  ChevronRight,
  TrendingDown,
  Clock,
  Globe,
} from "lucide-react";
import {
  RADIUS,
  SHADOW,
  GRID,
  TYPE,
  staggerContainer,
  scaleIn,
} from "@/lib/heritageDesignSystem";
import type { RecruitingFunnelStage, FunnelStageData } from "@/lib/agentStore";

interface RecruitingFunnelProps {
  funnelData: FunnelStageData[];
  stats: {
    dropOffRate: number;
    avgTimeToActivation: string;
    topSource: string;
  };
}

const STAGE_CONFIG: Record<
  RecruitingFunnelStage,
  {
    label: string;
    icon: typeof MousePointerClick;
    color: string;
    bgColor: string;
    textColor: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  link_clicked: {
    label: "Link Clicked",
    icon: MousePointerClick,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  application_started: {
    label: "App Started",
    icon: FileEdit,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    badgeBg: "bg-cyan-100",
    badgeText: "text-cyan-700",
  },
  application_submitted: {
    label: "App Submitted",
    icon: FileCheck,
    color: "text-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
  },
  background_check: {
    label: "Background Check",
    icon: Shield,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
  },
  contract_signed: {
    label: "Contract Signed",
    icon: PenTool,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
  },
  agent_approved: {
    label: "Agent Approved",
    icon: CheckCircle,
    color: "text-violet-500",
    bgColor: "bg-violet-50",
    textColor: "text-violet-700",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
  },
  agent_activated: {
    label: "Agent Activated",
    icon: Zap,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },
};

function formatStageName(stage: RecruitingFunnelStage): string {
  return STAGE_CONFIG[stage]?.label ?? stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RecruitingFunnel({ funnelData, stats }: RecruitingFunnelProps) {
  return (
    <div className="space-y-6">
      {/* Funnel Stages */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap items-center gap-2"
        style={{ gap: GRID.spacing.xs }}
      >
        {funnelData.map((stageData, index) => {
          const config = STAGE_CONFIG[stageData.stage];
          const StageIcon = config.icon;
          const isLast = index === funnelData.length - 1;

          return (
            <div key={stageData.stage} className="flex items-center">
              <motion.div variants={scaleIn}>
                <Card
                  className="bg-white/80 backdrop-blur-xl border border-gray-100 hover:shadow-lg transition-shadow duration-200 min-w-[140px]"
                  style={{
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.level1,
                  }}
                >
                  <CardContent
                    className="p-0 flex flex-col items-center text-center"
                    style={{ padding: GRID.spacing.sm }}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center mb-2`}
                    >
                      <StageIcon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* Stage Name */}
                    <p
                      className="font-medium text-gray-700 leading-tight mb-1"
                      style={{ fontSize: TYPE.caption }}
                    >
                      {formatStageName(stageData.stage)}
                    </p>

                    {/* Count */}
                    <p
                      className="font-bold text-gray-900 mb-2"
                      style={{ fontSize: TYPE.section }}
                    >
                      {stageData.count.toLocaleString()}
                    </p>

                    {/* Conversion Rate Badge */}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 font-semibold ${config.badgeBg} ${config.badgeText}`}
                      style={{
                        borderRadius: RADIUS.pill,
                        fontSize: TYPE.micro,
                      }}
                    >
                      {stageData.conversionRate.toFixed(1)}%
                    </span>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Connecting Arrow */}
              {!isLast && (
                <div className="hidden md:flex items-center px-1">
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        style={{ gap: GRID.spacing.sm }}
      >
        {/* Drop-off Rate */}
        <motion.div variants={scaleIn}>
          <Card
            className="bg-white/80 backdrop-blur-xl border border-gray-100"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.level1,
            }}
          >
            <CardContent
              className="p-0 flex items-center gap-3"
              style={{ padding: GRID.spacing.sm }}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p
                  className="text-gray-500 font-medium"
                  style={{ fontSize: TYPE.meta }}
                >
                  Drop-off Rate
                </p>
                <p
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.title }}
                >
                  {stats.dropOffRate.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Avg Time to Activation */}
        <motion.div variants={scaleIn}>
          <Card
            className="bg-white/80 backdrop-blur-xl border border-gray-100"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.level1,
            }}
          >
            <CardContent
              className="p-0 flex items-center gap-3"
              style={{ padding: GRID.spacing.sm }}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p
                  className="text-gray-500 font-medium"
                  style={{ fontSize: TYPE.meta }}
                >
                  Avg Time to Activation
                </p>
                <p
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.title }}
                >
                  {stats.avgTimeToActivation}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Source */}
        <motion.div variants={scaleIn}>
          <Card
            className="bg-white/80 backdrop-blur-xl border border-gray-100"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.level1,
            }}
          >
            <CardContent
              className="p-0 flex items-center gap-3"
              style={{ padding: GRID.spacing.sm }}
            >
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p
                  className="text-gray-500 font-medium"
                  style={{ fontSize: TYPE.meta }}
                >
                  Top Source
                </p>
                <p
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.title }}
                >
                  {stats.topSource}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
