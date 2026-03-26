/**
 * RequestDetailDrawer — Slide-out sheet displaying the full timeline of an approval request.
 * Uses shadcn Sheet (Radix Dialog) for the drawer behavior.
 *
 * Domain: Nova (UI) — Heritage Design System tokens
 */
import { motion } from 'framer-motion';
import {
  Clock,
  ArrowRight,
  User,
  FileText,
  ExternalLink,
  Check,
  AlertCircle,
  Send,
  UserCheck,
  Crown,
  RefreshCw,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { COLORS, RADIUS, SHADOW, GLASS, fadeInUp, MOTION } from '@/lib/heritageDesignSystem';

interface RequestDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: {
    id: string;
    requestType: 'placement' | 'commission_change';
    requesterName: string;
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
    managerReviewedAt?: string;
    executiveStatus: string;
    executiveNotes?: string;
    executiveFinalLevel?: number;
    executiveReviewerName?: string;
    executiveReviewedAt?: string;
    carrierUpdated?: boolean;
    carrierUpdateNotes?: string;
    status: string;
    createdAt: string;
  } | null;
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

type StepStatus = 'complete' | 'current' | 'pending';

interface TimelineStep {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  status: StepStatus;
  reviewer?: string;
  notes?: string;
  timestamp?: string;
  extraInfo?: React.ReactNode;
}

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

function getManagerStepStatus(
  managerStatus: string,
  overallStatus: string
): StepStatus {
  if (
    managerStatus === 'approved' ||
    managerStatus === 'rejected'
  ) {
    return 'complete';
  }
  if (overallStatus === 'pending_manager') {
    return 'current';
  }
  return 'pending';
}

function getExecutiveStepStatus(
  executiveStatus: string,
  overallStatus: string
): StepStatus {
  if (
    executiveStatus === 'approved' ||
    executiveStatus === 'rejected'
  ) {
    return 'complete';
  }
  if (overallStatus === 'pending_executive') {
    return 'current';
  }
  return 'pending';
}

export function RequestDetailDrawer({
  open,
  onOpenChange,
  request,
}: RequestDetailDrawerProps) {
  if (!request) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Request Details</SheetTitle>
            <SheetDescription>No request selected.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const typeConfig = REQUEST_TYPE_CONFIG[request.requestType];
  const statusConfig = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending_manager;

  // Build timeline steps
  const managerStepStatus = getManagerStepStatus(
    request.managerStatus,
    request.status
  );
  const executiveStepStatus = getExecutiveStepStatus(
    request.executiveStatus,
    request.status
  );

  const steps: TimelineStep[] = [
    {
      key: 'submitted',
      label: 'Submitted',
      icon: Send,
      status: 'complete',
      reviewer: request.requesterName,
      timestamp: request.createdAt,
    },
    {
      key: 'manager_review',
      label: 'Manager Review',
      icon: UserCheck,
      status: managerStepStatus,
      reviewer: request.managerReviewerName,
      notes: request.managerNotes,
      timestamp: request.managerReviewedAt,
      extraInfo:
        managerStepStatus === 'complete' && request.managerRecommendedLevel != null ? (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs" style={{ color: COLORS.gray[500] }}>
              Recommended Level:
            </span>
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: COLORS.lounges.manager.main + '15',
                color: COLORS.lounges.manager.dark,
              }}
            >
              {request.managerRecommendedLevel}%
            </span>
          </div>
        ) : undefined,
    },
    {
      key: 'executive_review',
      label: 'Executive Review',
      icon: Crown,
      status: executiveStepStatus,
      reviewer: request.executiveReviewerName,
      notes: request.executiveNotes,
      timestamp: request.executiveReviewedAt,
      extraInfo:
        executiveStepStatus === 'complete' && request.executiveFinalLevel != null ? (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs" style={{ color: COLORS.gray[500] }}>
              Final Level:
            </span>
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: COLORS.lounges.executive.main + '15',
                color: COLORS.lounges.executive.dark,
              }}
            >
              {request.executiveFinalLevel}%
            </span>
          </div>
        ) : undefined,
    },
  ];

  // Optional: Carrier Updated step
  if (request.carrierUpdated != null) {
    steps.push({
      key: 'carrier_updated',
      label: 'Carrier Updated',
      icon: RefreshCw,
      status: request.carrierUpdated ? 'complete' : 'pending',
      notes: request.carrierUpdateNotes,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-lg font-bold" style={{ color: COLORS.gray[900] }}>
              Request Details
            </SheetTitle>
            <SheetDescription className="sr-only">
              Full timeline and details for approval request {request.id}
            </SheetDescription>
          </SheetHeader>

          {/* Status + Type Badges */}
          <div className="flex items-center gap-2 mb-5">
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

          {/* Request details section */}
          <div
            className="p-4 mb-6 space-y-3"
            style={{
              ...GLASS.css.light,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: COLORS.gray[500] }}
            >
              Request Information
            </h3>

            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: COLORS.primary.violet[100],
                  color: COLORS.primary.violet[700],
                }}
              >
                <User className="w-4 h-4" />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: COLORS.gray[900] }}
                >
                  {request.requesterName}
                </p>
                <p className="text-xs" style={{ color: COLORS.gray[500] }}>
                  Requester
                </p>
              </div>
            </div>

            {request.requestType === 'placement' && request.requestedUplineName && (
              <div className="flex items-center gap-2 pt-1">
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
                {(request.currentContractLevel != null ||
                  request.requestedContractLevel != null) && (
                  <div className="flex items-center gap-2 pt-1">
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
                    <p className="text-sm mt-1" style={{ color: COLORS.gray[700] }}>
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

          {/* Timeline */}
          <div className="mb-6">
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: COLORS.gray[500] }}
            >
              Approval Timeline
            </h3>

            <div className="space-y-0">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isLast = idx === steps.length - 1;

                return (
                  <div key={step.key} className="flex gap-3">
                    {/* Step indicator + connecting line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          step.status === 'complete'
                            ? 'bg-emerald-500 text-white'
                            : step.status === 'current'
                            ? 'bg-amber-400 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                        style={
                          step.status === 'current'
                            ? { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }
                            : undefined
                        }
                      >
                        {step.status === 'complete' ? (
                          <Check className="w-4 h-4" />
                        ) : step.status === 'current' ? (
                          <Icon className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 flex-1 min-h-[24px] ${
                            step.status === 'complete'
                              ? 'bg-emerald-200'
                              : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>

                    {/* Step content */}
                    <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-5'}`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-sm font-semibold ${
                            step.status === 'pending'
                              ? 'text-gray-400'
                              : 'text-gray-900'
                          }`}
                        >
                          {step.label}
                        </span>
                        {step.timestamp && (
                          <span
                            className="text-[11px] flex items-center gap-1"
                            style={{ color: COLORS.gray[400] }}
                          >
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(step.timestamp)}
                          </span>
                        )}
                      </div>

                      {step.reviewer && (
                        <p className="text-xs" style={{ color: COLORS.gray[500] }}>
                          {step.key === 'submitted' ? 'By' : 'Reviewed by'}{' '}
                          <span className="font-medium" style={{ color: COLORS.gray[700] }}>
                            {step.reviewer}
                          </span>
                        </p>
                      )}

                      {step.status === 'current' && (
                        <p
                          className="text-xs mt-1 italic"
                          style={{ color: COLORS.accent.amber[600] }}
                        >
                          Awaiting review...
                        </p>
                      )}

                      {step.notes && step.status === 'complete' && (
                        <div
                          className="mt-2 p-2.5"
                          style={{
                            backgroundColor: COLORS.gray[50],
                            borderRadius: RADIUS.input,
                            border: `1px solid ${COLORS.gray[200]}`,
                          }}
                        >
                          <p className="text-xs italic" style={{ color: COLORS.gray[600] }}>
                            "{step.notes}"
                          </p>
                        </div>
                      )}

                      {step.extraInfo}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
