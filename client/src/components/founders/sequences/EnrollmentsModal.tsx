/**
 * EnrollmentsModal — lists enrollments for a sequence with lifecycle actions
 * (pause / resume / unenroll) and click-through to per-enrollment email
 * history. Restyled to the Gold Coast design language. Ported from heritage
 * EnrollmentsDrawer + EnrollmentHistoryDrawer.
 */

import { useState } from "react";
import {
  Pause,
  Play,
  UserMinus,
  History,
  Users,
  Mail,
  MousePointerClick,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GCModal, GCStatusBadge } from "@/components/gc";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSequenceEnrollments,
  useEnrollmentAction,
  useEnrollmentHistory,
  type Sequence,
  type SequenceEnrollment,
} from "@/hooks/useSequences";
import {
  ENROLLMENT_STATUS_TO_BADGE,
  EMAIL_STATUS_TO_BADGE,
  formatDateTime,
} from "./shared";

interface Props {
  sequence: Sequence;
  onClose: () => void;
}

export function EnrollmentsModal({ sequence, onClose }: Props) {
  const { toast } = useToast();
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
      toast({
        title:
          action === "pause"
            ? "Enrollment paused"
            : action === "resume"
            ? "Enrollment resumed"
            : "Lead unenrolled",
      });
    } catch (err: any) {
      toast({ title: err?.message || `Failed to ${action} enrollment`, variant: "destructive" });
    }
  };

  return (
    <>
      <GCModal
        title={`Enrollments — ${sequence.name}`}
        subtitle="Pause, resume, or unenroll leads and review their email history."
        icon={<Users className="w-5 h-5" style={{ color: "var(--gc-gold)" }} />}
        onClose={onClose}
        width={560}
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--gc-text-muted)" }} />
            <p style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)" }}>
              No leads enrolled yet
            </p>
            <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", marginTop: 4 }}>
              Use "Enroll lead" on the sequence to add someone.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enr) => {
              const step = (enr.currentStep ?? 0) + 1;
              const name =
                enr.leadFirstName || enr.leadLastName
                  ? `${enr.leadFirstName ?? ""} ${enr.leadLastName ?? ""}`.trim()
                  : `Lead ${enr.leadId.slice(0, 8)}`;
              return (
                <div
                  key={enr.id}
                  className="p-3"
                  style={{ border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className="truncate"
                        style={{ fontSize: "var(--gc-text-base)", fontWeight: 600, color: "var(--gc-text-primary)" }}
                      >
                        {name}
                      </p>
                      {enr.leadEmail && (
                        <p
                          className="truncate"
                          style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", marginTop: 1 }}
                        >
                          {enr.leadEmail}
                        </p>
                      )}
                      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginTop: 2 }}>
                        Step {Math.min(step, Math.max(totalSteps, 1))} of {totalSteps || "—"}
                      </p>
                    </div>
                    <GCStatusBadge status={ENROLLMENT_STATUS_TO_BADGE[enr.status] || enr.status} />
                  </div>

                  <div className="mt-2" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                    Next: {formatDateTime(enr.nextSendAt)}
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {enr.status === "active" && (
                      <ActionBtn
                        icon={<Pause className="w-3.5 h-3.5" />}
                        label="Pause"
                        onClick={() => runAction(enr, "pause")}
                        disabled={actionMutation.isPending}
                      />
                    )}
                    {enr.status === "paused" && (
                      <ActionBtn
                        icon={<Play className="w-3.5 h-3.5" />}
                        label="Resume"
                        onClick={() => runAction(enr, "resume")}
                        disabled={actionMutation.isPending}
                      />
                    )}
                    {(enr.status === "active" || enr.status === "paused") && (
                      <ActionBtn
                        icon={<UserMinus className="w-3.5 h-3.5" />}
                        label="Unenroll"
                        danger
                        onClick={() => {
                          if (confirm("Unenroll this lead from the sequence?")) runAction(enr, "unenroll");
                        }}
                        disabled={actionMutation.isPending}
                      />
                    )}
                    <ActionBtn
                      icon={<History className="w-3.5 h-3.5" />}
                      label="History"
                      onClick={() => setHistoryEnrollment(enr)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GCModal>

      {historyEnrollment && (
        <EnrollmentHistoryModal
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
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  const color = danger ? "var(--gc-status-terminated)" : "var(--gc-text-secondary)";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 px-2.5 py-1"
      style={{
        borderRadius: "var(--gc-radius-sm)",
        fontSize: "var(--gc-text-sm)",
        fontWeight: 500,
        border: "1px solid var(--gc-border)",
        backgroundColor: "var(--gc-surface-2)",
        color,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function EnrollmentHistoryModal({
  enrollment,
  onClose,
}: {
  enrollment: SequenceEnrollment;
  onClose: () => void;
}) {
  const { data: emails = [], isLoading } = useEnrollmentHistory(enrollment.id);

  return (
    <GCModal
      title="Email History"
      subtitle="Delivery status and engagement for this enrollment."
      icon={<Mail className="w-5 h-5" style={{ color: "var(--gc-gold)" }} />}
      onClose={onClose}
      width={460}
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : emails.length === 0 ? (
        <div className="py-12 text-center">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--gc-text-muted)" }} />
          <p style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)" }}>
            No emails sent yet
          </p>
          <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", marginTop: 4 }}>
            Emails appear here as the sequence sends them.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <div
              key={email.id}
              className="p-3"
              style={{ border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className="min-w-0 truncate"
                  style={{ fontSize: "var(--gc-text-base)", fontWeight: 600, color: "var(--gc-text-primary)" }}
                >
                  {email.subject}
                </p>
                <GCStatusBadge status={EMAIL_STATUS_TO_BADGE[email.status] || email.status} />
              </div>
              <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", marginTop: 2 }}>
                {formatDateTime(email.sentAt)}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span
                  className="inline-flex items-center gap-1"
                  style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {email.openCount ?? 0} open{(email.openCount ?? 0) === 1 ? "" : "s"}
                </span>
                <span
                  className="inline-flex items-center gap-1"
                  style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                  {email.clickCount ?? 0} click{(email.clickCount ?? 0) === 1 ? "" : "s"}
                </span>
              </div>
              {email.bounceReason && (
                <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)", marginTop: 6 }}>
                  {email.bounceReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </GCModal>
  );
}
