import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  FileText,
  Check,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RADIUS, SHADOW, fadeInUp } from "@/lib/heritageDesignSystem";

interface WorkflowProgressCardProps {
  workflow: {
    welcome_email_sent_at?: string;
    welcome_sms_sent_at?: string;
    ai_call_scheduled_at?: string;
    ai_call_completed_at?: string;
  };
  clientStatus?: {
    hasLoggedIn: boolean;
    documentCount: number;
  } | null;
}

type StepStatus = "complete" | "active" | "pending";

interface StepConfig {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  getStatus: (workflow: WorkflowProgressCardProps["workflow"]) => StepStatus;
  getTimestamp: (workflow: WorkflowProgressCardProps["workflow"]) => string | undefined;
}

const STEPS: StepConfig[] = [
  {
    key: "welcome_email",
    label: "Welcome Email",
    icon: Mail,
    getStatus: (w) => (w.welcome_email_sent_at ? "complete" : "active"),
    getTimestamp: (w) => w.welcome_email_sent_at,
  },
  {
    key: "welcome_sms",
    label: "Welcome SMS",
    icon: MessageSquare,
    getStatus: (w) => {
      if (w.welcome_sms_sent_at) return "complete";
      if (w.welcome_email_sent_at) return "active";
      return "pending";
    },
    getTimestamp: (w) => w.welcome_sms_sent_at,
  },
  {
    key: "ai_call_scheduled",
    label: "AI Call Scheduled",
    icon: Phone,
    getStatus: (w) => {
      if (w.ai_call_scheduled_at) return "complete";
      if (w.welcome_sms_sent_at) return "active";
      return "pending";
    },
    getTimestamp: (w) => w.ai_call_scheduled_at,
  },
  {
    key: "ai_call_completed",
    label: "AI Call Completed",
    icon: PhoneCall,
    getStatus: (w) => {
      if (w.ai_call_completed_at) return "complete";
      if (w.ai_call_scheduled_at) return "active";
      return "pending";
    },
    getTimestamp: (w) => w.ai_call_completed_at,
  },
];

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function WorkflowProgressCard({
  workflow,
  clientStatus,
}: WorkflowProgressCardProps) {
  const allAutomatedDone =
    !!workflow.welcome_email_sent_at &&
    !!workflow.welcome_sms_sent_at &&
    !!workflow.ai_call_scheduled_at &&
    !!workflow.ai_call_completed_at;

  // Determine policy delivery status
  const getPolicyDeliveryStatus = (): StepStatus => {
    if (!allAutomatedDone) return "pending";
    if (clientStatus?.hasLoggedIn && clientStatus.documentCount > 0) return "complete";
    if (clientStatus?.hasLoggedIn) return "active";
    return "pending";
  };

  const getPolicyDeliveryBadge = () => {
    if (clientStatus?.hasLoggedIn && clientStatus.documentCount > 0) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 h-4 text-emerald-600 border-emerald-200 bg-emerald-50"
        >
          Documents accessed
        </Badge>
      );
    }
    if (clientStatus?.hasLoggedIn) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 h-4 text-amber-600 border-amber-200 bg-amber-50"
        >
          Logged in, no documents accessed
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-[10px] px-1.5 py-0 h-4 text-gray-400 border-gray-200"
      >
        Pending client login
      </Badge>
    );
  };

  const policyDeliveryStatus = getPolicyDeliveryStatus();

  // Combine all steps including policy delivery for rendering
  const allSteps = [
    ...STEPS.map((step) => ({
      key: step.key,
      label: step.label,
      icon: step.icon,
      status: step.getStatus(workflow),
      timestamp: step.getTimestamp(workflow),
      isPolicyDelivery: false,
    })),
    {
      key: "policy_delivery",
      label: "Policy Delivery",
      icon: FileText,
      status: policyDeliveryStatus,
      timestamp: undefined as string | undefined,
      isPolicyDelivery: true,
    },
  ];

  return (
    <motion.div variants={fadeInUp}>
      <Card
        className="border-0"
        style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
      >
        <CardContent className="p-5">
          <div className="space-y-0">
            {allSteps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === allSteps.length - 1;
              const prevStepComplete =
                idx > 0 && allSteps[idx - 1].status === "complete";

              return (
                <div key={step.key} className="flex gap-3">
                  {/* Step indicator + connecting line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        step.status === "complete"
                          ? "bg-emerald-500 text-white"
                          : step.status === "active"
                          ? "bg-violet-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step.status === "complete" ? (
                        <Check className="w-4 h-4" />
                      ) : step.status === "active" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 min-h-[20px] ${
                          step.status === "complete"
                            ? "bg-emerald-200"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>

                  {/* Step content */}
                  <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            step.status === "pending"
                              ? "text-gray-400"
                              : "text-gray-900"
                          }`}
                        >
                          {step.label}
                        </span>
                        {step.isPolicyDelivery && getPolicyDeliveryBadge()}
                      </div>
                      <div className="flex items-center gap-2">
                        {step.status === "complete" && !step.isPolicyDelivery && (
                          <Check className="w-4 h-4 text-emerald-500" />
                        )}
                        {step.status === "active" && !step.isPolicyDelivery && (
                          <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                        )}
                        {step.status === "complete" && step.timestamp && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTimestamp(step.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion banner */}
          {allAutomatedDone && (
            <div
              className="mt-3 p-3 bg-emerald-50 flex items-center gap-2"
              style={{ borderRadius: RADIUS.input }}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-700">
                Automated workflow complete
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
