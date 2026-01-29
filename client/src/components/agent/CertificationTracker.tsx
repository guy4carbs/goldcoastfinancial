import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CertificationPathway } from "./CertificationPathway";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  Shield,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Award,
  BookOpen,
  FileCheck,
  Users,
  MapPin,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CERTIFICATION_GATES,
  type CertificationGate,
  type CertificationStatus,
  type CertificationLevel
} from "@/lib/trainingData";

interface CertificationTrackerProps {
  completedModules: string[];
  passedAssessments: string[];
  certificationStatuses: Record<string, CertificationStatus>;
  onStartCertification: (certId: string) => void;
  onContinueCertification: (certId: string) => void;
}

const levelConfig: Record<CertificationLevel, {
  icon: typeof Shield;
  color: string;
  bgColor: string;
  borderColor: string;
  gradientFrom: string;
  label: string;
  description: string;
}> = {
  pre_access: {
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    gradientFrom: 'from-blue-50',
    label: 'Level 0',
    description: 'Required before system access'
  },
  core_advisor: {
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    gradientFrom: 'from-purple-50',
    label: 'Level 1',
    description: 'Foundational advisor certification'
  },
  live_client: {
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    gradientFrom: 'from-green-50',
    label: 'Level 2',
    description: 'Client interaction authorization'
  },
  state_expansion: {
    icon: MapPin,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    gradientFrom: 'from-amber-50',
    label: 'Level 3',
    description: 'State-specific authorization'
  },
  ongoing_compliance: {
    icon: FileCheck,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    gradientFrom: 'from-slate-50',
    label: 'Level 4',
    description: 'Continuing compliance requirements'
  }
};

const statusConfig: Record<CertificationStatus, {
  color: string;
  bgColor: string;
  label: string;
  icon: typeof Lock;
}> = {
  locked: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-100',
    label: 'Locked',
    icon: Lock
  },
  available: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Available',
    icon: BookOpen
  },
  in_progress: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'In Progress',
    icon: Clock
  },
  pending_review: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Pending Review',
    icon: Clock
  },
  certified: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Certified',
    icon: CheckCircle2
  },
  expired: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Expired',
    icon: AlertTriangle
  },
  suspended: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Suspended',
    icon: AlertTriangle
  }
};

export function CertificationTracker({
  completedModules,
  passedAssessments,
  certificationStatuses,
  onStartCertification,
  onContinueCertification
}: CertificationTrackerProps) {
  // Calculate progress for each certification
  const certificationProgress = useMemo(() => {
    return CERTIFICATION_GATES.map(cert => {
      const moduleProgress = cert.requiredModules.filter(m => completedModules.includes(m)).length;
      const assessmentProgress = cert.requiredAssessments.filter(a => passedAssessments.includes(a)).length;
      const totalRequired = cert.requiredModules.length + cert.requiredAssessments.length;
      const totalCompleted = moduleProgress + assessmentProgress;
      const percentage = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;

      return {
        ...cert,
        moduleProgress,
        assessmentProgress,
        totalRequired,
        totalCompleted,
        percentage
      };
    });
  }, [completedModules, passedAssessments]);

  // Get status for a certification
  const getStatus = (certId: string): CertificationStatus => {
    return certificationStatuses[certId] || 'locked';
  };

  // Check if prerequisites are met
  const arePrerequisitesMet = (cert: CertificationGate): boolean => {
    return cert.prerequisites.every(prereqId => {
      const status = getStatus(prereqId);
      return status === 'certified';
    });
  };

  // Get overall certification level
  const overallLevel = useMemo(() => {
    const levels: CertificationLevel[] = ['pre_access', 'core_advisor', 'live_client', 'state_expansion', 'ongoing_compliance'];
    let highestCertified = -1;

    for (let i = 0; i < levels.length; i++) {
      const certsAtLevel = CERTIFICATION_GATES.filter(c => c.level === levels[i]);
      const allCertified = certsAtLevel.every(c => getStatus(c.id) === 'certified');
      if (allCertified && certsAtLevel.length > 0) {
        highestCertified = i;
      }
    }

    return highestCertified >= 0 ? levels[highestCertified] : null;
  }, [certificationStatuses]);

  // Count stats
  const certifiedCount = Object.values(certificationStatuses).filter(s => s === 'certified').length;
  const totalCerts = CERTIFICATION_GATES.length;

  return (
    <div className="space-y-4">
      {certificationProgress.map((cert, idx) => {
          const status = getStatus(cert.id);
          const prereqsMet = arePrerequisitesMet(cert);
          const config = levelConfig[cert.level];
          const statusConf = statusConfig[status];
          const StatusIcon = statusConf.icon;
          const LevelIcon = config.icon;

          // Determine if locked due to prerequisites
          const isLocked = status === 'locked' || !prereqsMet;
          const isCertified = status === 'certified';
          const isInProgress = status === 'in_progress' || status === 'available';

          return (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={!isLocked ? { scale: 1.01, transition: { duration: 0.2 } } : undefined}
            >
              <Card className={cn(
                "overflow-hidden transition-all duration-300",
                isLocked && "opacity-50",
                isCertified && `ring-2 ${config.borderColor} bg-gradient-to-r ${config.gradientFrom} to-white`,
                isInProgress && "ring-1 ring-amber-200 bg-gradient-to-r from-amber-50/50 to-white",
                !isLocked && !isCertified && "hover:shadow-lg"
              )}>
                {/* Accent bar */}
                <div className={cn(
                  "h-1",
                  isCertified ? config.bgColor.replace('100', '500') : isInProgress ? "bg-amber-400" : "bg-gray-200"
                )} />

                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon with progress ring */}
                    <div className="relative">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                        isCertified ? config.bgColor : isLocked ? "bg-gray-100" : "bg-white border-2 border-gray-100"
                      )}>
                        {isLocked ? (
                          <Lock className="w-6 h-6 text-gray-400" />
                        ) : isCertified ? (
                          <CheckCircle2 className={cn("w-7 h-7", config.color)} />
                        ) : (
                          <LevelIcon className={cn("w-7 h-7", config.color)} />
                        )}
                      </div>
                      {/* Progress ring overlay for in-progress */}
                      {isInProgress && cert.percentage > 0 && cert.percentage < 100 && (
                        <div className="absolute -inset-1">
                          <CircularProgress
                            value={cert.percentage}
                            size={64}
                            strokeWidth={3}
                            color="warning"
                            showValue={false}
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={cn("text-[10px]", config.borderColor, config.color)}>
                              {config.label}
                            </Badge>
                            <h3 className="font-semibold text-primary">{cert.name}</h3>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">{cert.description}</p>
                        </div>
                        <Badge className={cn(
                          "text-[10px] flex-shrink-0",
                          statusConf.bgColor,
                          statusConf.color
                        )}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConf.label}
                        </Badge>
                      </div>

                      {/* Progress for in-progress */}
                      {!isLocked && !isCertified && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${cert.percentage}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                              </div>
                              <span className="text-gray-600 font-medium w-10 text-right">{cert.percentage}%</span>
                            </div>
                          </div>

                          {/* Requirement breakdown */}
                          <div className="flex items-center gap-4 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {cert.moduleProgress}/{cert.requiredModules.length} modules
                            </span>
                            <span className="flex items-center gap-1">
                              <FileCheck className="w-3 h-3" />
                              {cert.assessmentProgress}/{cert.requiredAssessments.length} assessments
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Locked message */}
                      {isLocked && cert.prerequisites.length > 0 && (
                        <p className="text-xs text-gray-400 mt-2 italic">
                          Requires: {cert.prerequisites.map(p => {
                            const prereq = CERTIFICATION_GATES.find(c => c.id === p);
                            return prereq?.name || p;
                          }).join(', ')}
                        </p>
                      )}

                      {/* Certified info */}
                      {isCertified && (
                        <div className="flex items-center gap-4 mt-3 text-xs">
                          {cert.expirationMonths > 0 && (
                            <span className="flex items-center gap-1 text-gray-500">
                              <Clock className="w-3 h-3" />
                              Renews in {cert.expirationMonths} months
                            </span>
                          )}
                          {cert.managerApprovalRequired && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-3 h-3" />
                              Manager approved
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action button */}
                      {!isLocked && !isCertified && (
                        <div className="mt-4">
                          <Button
                            size="sm"
                            onClick={() =>
                              status === 'in_progress'
                                ? onContinueCertification(cert.id)
                                : onStartCertification(cert.id)
                            }
                            className={cn(
                              "text-xs",
                              status === 'in_progress'
                                ? "bg-amber-500 hover:bg-amber-600"
                                : "bg-primary hover:bg-primary/90"
                            )}
                          >
                            {status === 'in_progress' ? 'Continue' : 'Start Certification'}
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

      {/* Compliance Notice */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-primary">Compliance Notice</p>
              <p className="text-xs text-gray-600 mt-1">
                Certifications are required for client-facing activities. Operating without proper certification
                is a compliance violation. Contact your supervisor if you have questions about certification
                requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
