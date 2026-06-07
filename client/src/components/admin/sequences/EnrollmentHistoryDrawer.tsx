/**
 * EnrollmentHistoryDrawer — emails sent for a single enrollment, with
 * color-coded delivery status and open/click counts.
 */

import { Mail, MousePointerClick, Eye } from "lucide-react";
import { RADIUS, TYPE, COLORS } from "@/lib/heritageDesignSystem";
import { useEnrollmentHistory, type SequenceEnrollment } from "@/hooks/useSequences";
import { GlassDrawer, StatusBadge, EMAIL_STATUS_CONFIG, formatDateTime } from "./shared";

interface Props {
  enrollment: SequenceEnrollment;
  onClose: () => void;
}

export function EnrollmentHistoryDrawer({ enrollment, onClose }: Props) {
  const { data: emails = [], isLoading } = useEnrollmentHistory(enrollment.id);

  return (
    <GlassDrawer title="Email History" onClose={onClose} maxWidth="max-w-md">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse"
              style={{ background: COLORS.gray[100], borderRadius: RADIUS.input }}
            />
          ))}
        </div>
      ) : emails.length === 0 ? (
        <div className="py-12 text-center">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: COLORS.gray[400] }} />
          <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>No emails sent yet</p>
          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400], marginTop: 4 }}>
            Emails appear here as the sequence sends them.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => {
            const statusConfig = EMAIL_STATUS_CONFIG[email.status] || EMAIL_STATUS_CONFIG.sent;
            return (
              <div
                key={email.id}
                className="p-3"
                style={{ border: `1px solid ${COLORS.gray[200]}`, borderRadius: RADIUS.input }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p
                    style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}
                    className="min-w-0 truncate"
                  >
                    {email.subject}
                  </p>
                  <StatusBadge config={statusConfig} />
                </div>
                <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 2 }}>
                  {formatDateTime(email.sentAt)}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span
                    className="inline-flex items-center gap-1"
                    style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {email.openCount ?? 0} open{(email.openCount ?? 0) === 1 ? "" : "s"}
                  </span>
                  <span
                    className="inline-flex items-center gap-1"
                    style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}
                  >
                    <MousePointerClick className="w-3.5 h-3.5" />
                    {email.clickCount ?? 0} click{(email.clickCount ?? 0) === 1 ? "" : "s"}
                  </span>
                </div>
                {email.bounceReason && (
                  <p style={{ fontSize: TYPE.caption, color: COLORS.semantic.error, marginTop: 6 }}>
                    {email.bounceReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </GlassDrawer>
  );
}
