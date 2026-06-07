/**
 * EnrollmentsDrawer — lists enrollments for a sequence with lifecycle actions
 * (pause / resume / unenroll) and click-through to per-enrollment history.
 */

import { useState } from "react";
import { toast } from "sonner";
import { Pause, Play, UserMinus, History, Users } from "lucide-react";
import { RADIUS, TYPE, COLORS } from "@/lib/heritageDesignSystem";
import {
  useSequenceEnrollments,
  useEnrollmentAction,
  type Sequence,
  type SequenceEnrollment,
} from "@/hooks/useSequences";
import {
  GlassDrawer,
  StatusBadge,
  ENROLLMENT_STATUS_CONFIG,
  formatDateTime,
} from "./shared";
import { EnrollmentHistoryDrawer } from "./EnrollmentHistoryDrawer";

interface Props {
  sequence: Sequence;
  onClose: () => void;
}

export function EnrollmentsDrawer({ sequence, onClose }: Props) {
  const { data: enrollments = [], isLoading } = useSequenceEnrollments(sequence.id);
  const actionMutation = useEnrollmentAction();
  const [historyEnrollment, setHistoryEnrollment] = useState<SequenceEnrollment | null>(null);

  const totalSteps = sequence.steps?.length ?? 0;

  const runAction = async (
    enrollment: SequenceEnrollment,
    action: "pause" | "resume" | "unenroll",
  ) => {
    try {
      await actionMutation.mutateAsync({
        enrollmentId: enrollment.id,
        action,
        sequenceId: sequence.id,
      });
      toast.success(
        action === "pause" ? "Enrollment paused" : action === "resume" ? "Enrollment resumed" : "Lead unenrolled",
      );
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${action} enrollment`);
    }
  };

  return (
    <>
      <GlassDrawer title={`Enrollments — ${sequence.name}`} onClose={onClose}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse"
                style={{ background: COLORS.gray[100], borderRadius: RADIUS.input }}
              />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: COLORS.gray[400] }} />
            <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>No leads enrolled yet</p>
            <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400], marginTop: 4 }}>
              Use "Enroll lead" on the sequence to add someone.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enr) => {
              const statusConfig = ENROLLMENT_STATUS_CONFIG[enr.status] || ENROLLMENT_STATUS_CONFIG.active;
              const step = (enr.currentStep ?? 0) + 1;
              return (
                <div
                  key={enr.id}
                  className="p-3"
                  style={{ border: `1px solid ${COLORS.gray[200]}`, borderRadius: RADIUS.input }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }} className="truncate">
                        {enr.leadFirstName || enr.leadLastName
                          ? `${enr.leadFirstName ?? ""} ${enr.leadLastName ?? ""}`.trim()
                          : `Lead ${enr.leadId.slice(0, 8)}`}
                      </p>
                      {enr.leadEmail && (
                        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400], marginTop: 1 }} className="truncate">
                          {enr.leadEmail}
                        </p>
                      )}
                      <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 2 }}>
                        Step {Math.min(step, Math.max(totalSteps, 1))} of {totalSteps || "—"}
                      </p>
                    </div>
                    <StatusBadge config={statusConfig} />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>
                      Next: {formatDateTime(enr.nextSendAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-3 flex-wrap">
                    {enr.status === "active" && (
                      <ActionBtn
                        icon={<Pause className="w-3.5 h-3.5" />}
                        label="Pause"
                        onClick={() => runAction(enr, "pause")}
                        disabled={actionMutation.isPending}
                        tone="amber"
                      />
                    )}
                    {enr.status === "paused" && (
                      <ActionBtn
                        icon={<Play className="w-3.5 h-3.5" />}
                        label="Resume"
                        onClick={() => runAction(enr, "resume")}
                        disabled={actionMutation.isPending}
                        tone="green"
                      />
                    )}
                    {(enr.status === "active" || enr.status === "paused") && (
                      <ActionBtn
                        icon={<UserMinus className="w-3.5 h-3.5" />}
                        label="Unenroll"
                        onClick={() => {
                          if (confirm("Unenroll this lead from the sequence?")) runAction(enr, "unenroll");
                        }}
                        disabled={actionMutation.isPending}
                        tone="red"
                      />
                    )}
                    <ActionBtn
                      icon={<History className="w-3.5 h-3.5" />}
                      label="History"
                      onClick={() => setHistoryEnrollment(enr)}
                      tone="gray"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassDrawer>

      {historyEnrollment && (
        <EnrollmentHistoryDrawer
          enrollment={historyEnrollment}
          onClose={() => setHistoryEnrollment(null)}
        />
      )}
    </>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  disabled,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone: "amber" | "green" | "red" | "gray";
}) {
  const tones: Record<string, string> = {
    amber: "text-amber-700 bg-amber-100 hover:bg-amber-200",
    green: "text-green-700 bg-green-100 hover:bg-green-200",
    red: "text-red-700 bg-red-100 hover:bg-red-200",
    gray: "text-gray-700 bg-gray-100 hover:bg-gray-200",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 px-2.5 py-1 disabled:opacity-50 ${tones[tone]}`}
      style={{ borderRadius: RADIUS.button, fontSize: TYPE.caption, fontWeight: 500, border: "none", cursor: "pointer" }}
    >
      {icon}
      {label}
    </button>
  );
}
