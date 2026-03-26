/**
 * ApprovalActionButtons — Approve/Reject action buttons with inline review form.
 * Used inside ApprovalRequestCard for manager and executive approval workflows.
 *
 * Domain: Nova (UI) — Heritage Design System tokens
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { COLORS, RADIUS, MOTION, scaleIn } from '@/lib/heritageDesignSystem';

interface ApprovalActionButtonsProps {
  requestId: string;
  role: 'manager' | 'executive';
  requestType: 'placement' | 'commission_change';
  onAction: (action: {
    status: 'approved' | 'rejected';
    notes: string;
    recommendedLevel?: number;
    finalContractLevel?: number;
    finalUplineId?: string;
  }) => Promise<void>;
  isLoading?: boolean;
  currentUplineOptions?: Array<{ id: string; name: string }>;
}

type ActionType = 'approved' | 'rejected' | null;

export function ApprovalActionButtons({
  requestId,
  role,
  requestType,
  onAction,
  isLoading = false,
  currentUplineOptions,
}: ApprovalActionButtonsProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [notes, setNotes] = useState('');
  const [recommendedLevel, setRecommendedLevel] = useState<string>('');
  const [finalContractLevel, setFinalContractLevel] = useState<string>('');
  const [finalUplineId, setFinalUplineId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setValidationError(null);

    // Notes required for rejection
    if (activeAction === 'rejected' && !notes.trim()) {
      setValidationError('Notes are required when rejecting a request.');
      return;
    }

    if (!activeAction) return;

    const payload: Parameters<typeof onAction>[0] = {
      status: activeAction,
      notes: notes.trim(),
    };

    // Manager: recommended level for placement requests
    if (role === 'manager' && recommendedLevel) {
      payload.recommendedLevel = parseInt(recommendedLevel, 10);
    }

    // Executive: final contract level
    if (role === 'executive' && finalContractLevel) {
      payload.finalContractLevel = parseInt(finalContractLevel, 10);
    }

    // Executive: final upline override
    if (role === 'executive' && finalUplineId) {
      payload.finalUplineId = finalUplineId;
    }

    await onAction(payload);

    // Reset form on success
    setActiveAction(null);
    setNotes('');
    setRecommendedLevel('');
    setFinalContractLevel('');
    setFinalUplineId('');
  };

  const handleCancel = () => {
    setActiveAction(null);
    setNotes('');
    setRecommendedLevel('');
    setFinalContractLevel('');
    setFinalUplineId('');
    setValidationError(null);
  };

  return (
    <div>
      {/* Action Buttons */}
      <AnimatePresence mode="wait">
        {activeAction === null ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.duration.fast }}
            className="flex items-center gap-3"
          >
            <Button
              onClick={() => setActiveAction('approved')}
              disabled={isLoading}
              className="flex-1 gap-1.5 text-sm font-medium text-white border-0"
              style={{
                backgroundColor: COLORS.semantic.success,
                borderRadius: RADIUS.button,
              }}
            >
              <Check className="w-4 h-4" />
              Approve
            </Button>
            <Button
              onClick={() => setActiveAction('rejected')}
              disabled={isLoading}
              className="flex-1 gap-1.5 text-sm font-medium text-white border-0"
              style={{
                backgroundColor: COLORS.semantic.error,
                borderRadius: RADIUS.button,
              }}
            >
              <X className="w-4 h-4" />
              Reject
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-3"
          >
            {/* Action label */}
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor:
                    activeAction === 'approved'
                      ? COLORS.semantic.success + '15'
                      : COLORS.semantic.error + '15',
                }}
              >
                {activeAction === 'approved' ? (
                  <Check
                    className="w-3.5 h-3.5"
                    style={{ color: COLORS.semantic.success }}
                  />
                ) : (
                  <X
                    className="w-3.5 h-3.5"
                    style={{ color: COLORS.semantic.error }}
                  />
                )}
              </div>
              <span
                className="text-sm font-semibold"
                style={{
                  color:
                    activeAction === 'approved'
                      ? COLORS.semantic.success
                      : COLORS.semantic.error,
                }}
              >
                {activeAction === 'approved' ? 'Approving Request' : 'Rejecting Request'}
              </span>
            </div>

            {/* Notes textarea */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: COLORS.gray[600] }}
              >
                Notes {activeAction === 'rejected' && (
                  <span style={{ color: COLORS.semantic.error }}>*</span>
                )}
              </label>
              <Textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder={
                  activeAction === 'approved'
                    ? 'Optional notes for this approval...'
                    : 'Reason for rejection (required)...'
                }
                rows={3}
                className="text-sm"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>

            {/* Manager: Recommended Contract Level for placement */}
            {role === 'manager' && requestType === 'placement' && (
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: COLORS.gray[600] }}
                >
                  Recommended Contract Level (%)
                </label>
                <input
                  type="number"
                  value={recommendedLevel}
                  onChange={(e) => setRecommendedLevel(e.target.value)}
                  placeholder="e.g. 80"
                  min={0}
                  max={150}
                  className="w-full px-3 py-2 text-sm border bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                  style={{
                    borderRadius: RADIUS.input,
                    borderColor: COLORS.gray[200],
                  }}
                />
              </div>
            )}

            {/* Executive: Final Contract Level */}
            {role === 'executive' && (
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: COLORS.gray[600] }}
                >
                  Final Contract Level (%)
                </label>
                <input
                  type="number"
                  value={finalContractLevel}
                  onChange={(e) => setFinalContractLevel(e.target.value)}
                  placeholder="e.g. 90"
                  min={0}
                  max={150}
                  className="w-full px-3 py-2 text-sm border bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                  style={{
                    borderRadius: RADIUS.input,
                    borderColor: COLORS.gray[200],
                  }}
                />
              </div>
            )}

            {/* Executive: Final Upline override */}
            {role === 'executive' && currentUplineOptions && currentUplineOptions.length > 0 && (
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: COLORS.gray[600] }}
                >
                  Final Upline Assignment
                </label>
                <div className="relative">
                  <select
                    value={finalUplineId}
                    onChange={(e) => setFinalUplineId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border bg-transparent appearance-none focus:outline-none focus:ring-1 focus:ring-ring pr-8"
                    style={{
                      borderRadius: RADIUS.input,
                      borderColor: COLORS.gray[200],
                    }}
                  >
                    <option value="">Keep requested upline</option>
                    {currentUplineOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: COLORS.gray[400] }}
                  />
                </div>
              </div>
            )}

            {/* Validation error */}
            {validationError && (
              <p className="text-xs font-medium" style={{ color: COLORS.semantic.error }}>
                {validationError}
              </p>
            )}

            {/* Submit / Cancel */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 gap-1.5 text-sm font-medium text-white border-0"
                style={{
                  backgroundColor:
                    activeAction === 'approved'
                      ? COLORS.semantic.success
                      : COLORS.semantic.error,
                  borderRadius: RADIUS.button,
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : activeAction === 'approved' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                {isLoading
                  ? 'Submitting...'
                  : activeAction === 'approved'
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isLoading}
                variant="ghost"
                className="text-sm font-medium"
                style={{
                  color: COLORS.gray[500],
                  borderRadius: RADIUS.button,
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
