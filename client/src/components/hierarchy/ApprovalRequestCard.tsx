/**
 * ApprovalRequestCard — Reusable card for displaying a pending approval request.
 * Used in manager and executive lounges for hierarchy approval workflow.
 *
 * Domain: Nova (UI) — Heritage Design System tokens
 */
import { motion } from 'framer-motion';
import { Clock, ArrowRight, User, Mail, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GLASS, RADIUS, SHADOW, COLORS, fadeInUp, MOTION } from '@/lib/heritageDesignSystem';

interface ApprovalRequestCardProps {
  request: {
    id: string;
    requestType: 'placement' | 'commission_change';
    requesterId: string;
    requesterName: string;
    requesterEmail?: string;
    requestedUplineName?: string;
    currentContractLevel?: number;
    requestedContractLevel?: number;
    monthlyApAmount?: number;
    proofDescription?: string;
    proofDocumentUrl?: string;
    managerStatus: string;
    managerNotes?: string;
    managerRecommendedLevel?: number;
    managerReviewerName?: string;
    status: string;
    createdAt: string;
  };
  children?: React.ReactNode;
  showManagerReview?: boolean;
}

const REQUEST_TYPE_CONFIG = {
  placement: {
    label: 'Placement',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  commission_change: {
    label: 'Commission Change',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
} as const;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending_manager: {
    label: 'Pending Manager',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  pending_executive: {
    label: 'Pending Executive',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-50 text-gray-500 border-gray-200',
  },
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ApprovalRequestCard({
  request,
  children,
  showManagerReview = false,
}: ApprovalRequestCardProps) {
  const typeConfig = REQUEST_TYPE_CONFIG[request.requestType];
  const statusConfig = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending_manager;

  const hasManagerReview =
    showManagerReview &&
    request.managerStatus &&
    request.managerStatus !== 'pending_manager' &&
    request.managerStatus !== 'pending';

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <Card
        className="border-0 overflow-hidden"
        style={{
          ...GLASS.css.light,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
      >
        <CardContent className="p-5">
          {/* Header: Badges row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs px-2.5 py-0.5 font-medium ${typeConfig.className}`}
              >
                {typeConfig.label}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs px-2.5 py-0.5 font-medium ${statusConfig.className}`}
              >
                {statusConfig.label}
              </Badge>
            </div>
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: COLORS.gray[400] }}
            >
              <Clock className="w-3 h-3" />
              {formatTimestamp(request.createdAt)}
            </span>
          </div>

          {/* Requester info */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
              style={{
                background: COLORS.primary.violet[100],
                color: COLORS.primary.violet[700],
              }}
            >
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p
                className="font-semibold text-sm truncate"
                style={{ color: COLORS.gray[900] }}
              >
                {request.requesterName}
              </p>
              {request.requesterEmail && (
                <p
                  className="text-xs truncate flex items-center gap-1"
                  style={{ color: COLORS.gray[500] }}
                >
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  {request.requesterEmail}
                </p>
              )}
            </div>
          </div>

          {/* Request-specific details */}
          <div
            className="p-3 mb-4 space-y-2"
            style={{
              backgroundColor: COLORS.gray[50],
              borderRadius: RADIUS.input,
              border: `1px solid ${COLORS.gray[200]}`,
            }}
          >
            {request.requestType === 'placement' && request.requestedUplineName && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: COLORS.gray[500] }}>
                  Requested Upline:
                </span>
                <span className="text-sm font-semibold" style={{ color: COLORS.gray[800] }}>
                  {request.requestedUplineName}
                </span>
              </div>
            )}

            {request.requestType === 'commission_change' && (
              <>
                {(request.currentContractLevel != null || request.requestedContractLevel != null) && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: COLORS.gray[500] }}>
                      Contract Level:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {request.currentContractLevel != null && (
                        <span
                          className="text-sm font-semibold px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: COLORS.gray[200],
                            color: COLORS.gray[700],
                          }}
                        >
                          {request.currentContractLevel}%
                        </span>
                      )}
                      <ArrowRight
                        className="w-3.5 h-3.5"
                        style={{ color: COLORS.gray[400] }}
                      />
                      {request.requestedContractLevel != null && (
                        <span
                          className="text-sm font-semibold px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: COLORS.primary.violet[100],
                            color: COLORS.primary.violet[700],
                          }}
                        >
                          {request.requestedContractLevel}%
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {request.monthlyApAmount != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: COLORS.gray[500] }}>
                      Monthly AP:
                    </span>
                    <span className="text-sm font-semibold" style={{ color: COLORS.gray[800] }}>
                      {formatCurrency(request.monthlyApAmount)}
                    </span>
                  </div>
                )}

                {request.proofDescription && (
                  <div>
                    <span className="text-xs font-medium" style={{ color: COLORS.gray[500] }}>
                      Proof/Justification:
                    </span>
                    <p className="text-sm mt-0.5" style={{ color: COLORS.gray[700] }}>
                      {request.proofDescription}
                    </p>
                  </div>
                )}

                {request.proofDocumentUrl && (
                  <a
                    href={request.proofDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium mt-1 hover:underline"
                    style={{ color: COLORS.primary.violet[600] }}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Proof Document
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </>
            )}
          </div>

          {/* Manager review section (for executive view) */}
          {hasManagerReview && (
            <div
              className="p-3 mb-4"
              style={{
                backgroundColor: COLORS.lounges.manager.light,
                borderRadius: RADIUS.input,
                border: `1px solid ${COLORS.gray[200]}`,
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: COLORS.lounges.manager.dark }}
              >
                Manager Review
              </p>
              <div className="space-y-1.5">
                {request.managerReviewerName && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: COLORS.gray[500] }}>
                      Reviewer:
                    </span>
                    <span className="text-sm font-medium" style={{ color: COLORS.gray[800] }}>
                      {request.managerReviewerName}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: COLORS.gray[500] }}>
                    Decision:
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${
                      request.managerStatus === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : request.managerStatus === 'rejected'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {request.managerStatus === 'approved'
                      ? 'Approved'
                      : request.managerStatus === 'rejected'
                      ? 'Rejected'
                      : 'Reviewed'}
                  </Badge>
                </div>
                {request.managerRecommendedLevel != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: COLORS.gray[500] }}>
                      Recommended Level:
                    </span>
                    <span
                      className="text-sm font-semibold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: COLORS.lounges.manager.main + '15',
                        color: COLORS.lounges.manager.dark,
                      }}
                    >
                      {request.managerRecommendedLevel}%
                    </span>
                  </div>
                )}
                {request.managerNotes && (
                  <div>
                    <span className="text-xs" style={{ color: COLORS.gray[500] }}>
                      Notes:
                    </span>
                    <p
                      className="text-sm mt-0.5 italic"
                      style={{ color: COLORS.gray[700] }}
                    >
                      "{request.managerNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons slot */}
          {children && (
            <div
              className="pt-3"
              style={{ borderTop: `1px solid ${COLORS.gray[200]}` }}
            >
              {children}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
