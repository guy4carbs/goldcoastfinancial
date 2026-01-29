import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BookOpen,
  Shield,
  Users,
  MapPin,
  FileCheck,
  CheckCircle2,
  Lock,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CERTIFICATION_GATES,
  type CertificationLevel,
  type CertificationStatus
} from "@/lib/trainingData";

interface CertificationPathwayProps {
  certificationStatuses: Record<string, CertificationStatus>;
  compact?: boolean;
  onNodeClick?: (certId: string) => void;
  curriculumProgress?: number; // 0-100, percentage of all modules completed
}

const levelConfig: Record<CertificationLevel, {
  icon: typeof Shield;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  glowColor: string;
}> = {
  pre_access: {
    icon: BookOpen,
    label: "Pre-Access",
    shortLabel: "L0",
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    glowColor: "shadow-blue-500/50"
  },
  core_advisor: {
    icon: Shield,
    label: "Core Advisor",
    shortLabel: "L1",
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    glowColor: "shadow-purple-500/50"
  },
  live_client: {
    icon: Users,
    label: "Live Client",
    shortLabel: "L2",
    color: "text-green-500",
    bgColor: "bg-green-500",
    glowColor: "shadow-green-500/50"
  },
  state_expansion: {
    icon: MapPin,
    label: "State Expansion",
    shortLabel: "L3",
    color: "text-amber-500",
    bgColor: "bg-amber-500",
    glowColor: "shadow-amber-500/50"
  },
  ongoing_compliance: {
    icon: FileCheck,
    label: "Ongoing",
    shortLabel: "L4",
    color: "text-red-500",
    bgColor: "bg-red-500",
    glowColor: "shadow-red-500/50"
  }
};

const levels: CertificationLevel[] = [
  'pre_access',
  'core_advisor',
  'live_client',
  'state_expansion',
  'ongoing_compliance'
];

export function CertificationPathway({
  certificationStatuses,
  compact = false,
  onNodeClick,
  curriculumProgress = 0
}: CertificationPathwayProps) {
  const curriculumComplete = curriculumProgress >= 100;

  // Calculate status for each level
  const levelStatuses = useMemo(() => {
    const curriculumNode = {
      level: 'curriculum' as CertificationLevel,
      config: {
        icon: GraduationCap,
        label: 'Curriculum',
        shortLabel: 'C',
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500',
        glowColor: 'shadow-cyan-500/50'
      },
      status: curriculumComplete ? 'complete' as const : 'current' as const,
      certId: undefined as string | undefined
    };

    const certNodes = levels.map(level => {
      const certsAtLevel = CERTIFICATION_GATES.filter(c => c.level === level);
      const allCertified = certsAtLevel.length > 0 && certsAtLevel.every(c =>
        certificationStatuses[c.id] === 'certified'
      );
      const anyInProgress = certsAtLevel.some(c =>
        ['in_progress', 'available'].includes(certificationStatuses[c.id])
      );
      const anyPending = certsAtLevel.some(c =>
        certificationStatuses[c.id] === 'pending_review'
      );

      // If curriculum not complete, all cert levels are locked
      const status = !curriculumComplete
        ? 'locked' as const
        : allCertified ? 'complete' as const : anyPending ? 'pending' as const : anyInProgress ? 'current' as const : 'locked' as const;

      return {
        level,
        config: levelConfig[level],
        status,
        certId: certsAtLevel[0]?.id
      };
    });

    return [curriculumNode, ...certNodes];
  }, [certificationStatuses, curriculumComplete]);

  // Find current level index for line fill
  const currentIndex = levelStatuses.findIndex(l => l.status === 'current' || l.status === 'pending');
  const completedUpTo = currentIndex === -1
    ? levelStatuses.filter(l => l.status === 'complete').length - 1
    : currentIndex - 1;

  const nodeSize = compact ? 40 : 56;
  const iconSize = compact ? 18 : 24;

  return (
    <div className={cn(
      "relative flex items-center justify-between w-full",
      compact ? "px-2" : "px-4"
    )}>
      {/* Connecting lines - background */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex">
        <div className={cn(
          "flex-1 mx-auto",
          compact ? "mx-6" : "mx-8"
        )}>
          <div className="h-1 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Connecting lines - progress fill */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex">
        <div className={cn(
          "flex-1 mx-auto overflow-hidden",
          compact ? "mx-6" : "mx-8"
        )}>
          <motion.div
            className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: completedUpTo >= 0
                ? `${((completedUpTo + 1) / (levels.length - 1)) * 100}%`
                : '0%'
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Nodes */}
      {levelStatuses.map((item, idx) => {
        const Icon = item.config.icon;
        const isComplete = item.status === 'complete';
        const isCurrent = item.status === 'current' || item.status === 'pending';
        const isLocked = item.status === 'locked';

        return (
          <Tooltip key={item.level}>
            <TooltipTrigger asChild>
              <motion.button
                onClick={() => item.certId && onNodeClick?.(item.certId)}
                className={cn(
                  "relative z-10 flex flex-col items-center gap-1",
                  onNodeClick && !isLocked && "cursor-pointer",
                  isLocked && "cursor-not-allowed"
                )}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
              >
                {/* Node circle */}
                <motion.div
                  className={cn(
                    "rounded-full flex items-center justify-center transition-all duration-300",
                    isComplete && `${item.config.bgColor} text-white shadow-lg ${item.config.glowColor}`,
                    isCurrent && `bg-white border-4 ${item.config.color} border-current shadow-lg`,
                    isLocked && "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  )}
                  style={{ width: nodeSize, height: nodeSize }}
                  animate={isCurrent ? {
                    boxShadow: [
                      "0 0 0 0 rgba(124, 124, 255, 0)",
                      "0 0 0 8px rgba(124, 124, 255, 0.3)",
                      "0 0 0 0 rgba(124, 124, 255, 0)"
                    ]
                  } : undefined}
                  transition={isCurrent ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  } : undefined}
                >
                  {isComplete ? (
                    <CheckCircle2 style={{ width: iconSize, height: iconSize }} />
                  ) : isLocked ? (
                    <Lock style={{ width: iconSize * 0.8, height: iconSize * 0.8 }} />
                  ) : (
                    <Icon style={{ width: iconSize, height: iconSize }} />
                  )}
                </motion.div>

                {/* Label */}
                {!compact && (
                  <span className={cn(
                    "text-[10px] font-medium text-center whitespace-nowrap",
                    isComplete && item.config.color,
                    isCurrent && "text-primary font-semibold",
                    isLocked && "text-gray-400"
                  )}>
                    {item.config.label}
                  </span>
                )}

                {compact && (
                  <span className={cn(
                    "text-[9px] font-bold",
                    isComplete && item.config.color,
                    isCurrent && "text-primary",
                    isLocked && "text-gray-400"
                  )}>
                    {item.config.shortLabel}
                  </span>
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-center">
              <p className="font-semibold">{item.config.label}</p>
              <p className="text-xs text-gray-400">
                {isComplete && ((item.level as string) === 'curriculum' ? "Complete" : "Certified")}
                {isCurrent && (item.status === 'pending' ? "Pending Review" : "In Progress")}
                {isLocked && "Locked"}
              </p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

// Vertical variant for mobile or sidebar
export function CertificationPathwayVertical({
  certificationStatuses,
  onNodeClick,
  curriculumProgress = 0
}: CertificationPathwayProps) {
  const curriculumComplete = curriculumProgress >= 100;

  const levelStatuses = useMemo(() => {
    const curriculumNode = {
      level: 'curriculum' as CertificationLevel,
      config: {
        icon: GraduationCap,
        label: 'Curriculum',
        shortLabel: 'C',
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500',
        glowColor: 'shadow-cyan-500/50'
      },
      status: curriculumComplete ? 'complete' as const : 'current' as const,
      certId: undefined as string | undefined
    };

    const certNodes = levels.map(level => {
      const certsAtLevel = CERTIFICATION_GATES.filter(c => c.level === level);
      const allCertified = certsAtLevel.length > 0 && certsAtLevel.every(c =>
        certificationStatuses[c.id] === 'certified'
      );
      const anyInProgress = certsAtLevel.some(c =>
        ['in_progress', 'available'].includes(certificationStatuses[c.id])
      );

      const status = !curriculumComplete
        ? 'locked' as const
        : allCertified ? 'complete' as const : anyInProgress ? 'current' as const : 'locked' as const;

      return {
        level,
        config: levelConfig[level],
        status,
        certId: certsAtLevel[0]?.id
      };
    });

    return [curriculumNode, ...certNodes];
  }, [certificationStatuses, curriculumComplete]);

  return (
    <div className="relative flex flex-col items-start gap-4 pl-6">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-gray-200" />

      {levelStatuses.map((item, idx) => {
        const Icon = item.config.icon;
        const isComplete = item.status === 'complete';
        const isCurrent = item.status === 'current';
        const isLocked = item.status === 'locked';

        return (
          <motion.div
            key={item.level}
            className="relative flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            {/* Node */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center z-10",
                isComplete && `${item.config.bgColor} text-white`,
                isCurrent && "bg-white border-2 border-violet-500 text-violet-500",
                isLocked && "bg-gray-100 text-gray-400"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>

            {/* Label */}
            <div>
              <p className={cn(
                "text-sm font-medium",
                isComplete && item.config.color,
                isCurrent && "text-primary",
                isLocked && "text-gray-400"
              )}>
                {item.config.label}
              </p>
              <p className="text-xs text-gray-500">
                {isComplete && ((item.level as string) === 'curriculum' ? "Complete" : "Certified")}
                {isCurrent && "In Progress"}
                {isLocked && "Locked"}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
