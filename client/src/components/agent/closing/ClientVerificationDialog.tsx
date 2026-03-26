import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck, Check, X, Loader2, KeyRound, LogIn, FileText, Shield,
  DollarSign, AlertTriangle, BookOpen
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RADIUS } from "@/lib/heritageDesignSystem";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

interface ClientVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  workflow: any;
  onComplete: () => void;
  onOpenBoB?: () => void;
}

interface ClientStatus {
  passwordSet: boolean;
  hasLoggedIn: boolean;
  documentCount: number;
  policyStatus: string;
  onboardingStatus: string;
  policyComplete: boolean;
  hasBeneficiaries: boolean;
  hasBilling: boolean;
  missingFields: string[];
}

const VERIFICATION_ITEMS = [
  {
    key: "policy",
    label: "Policy details complete",
    description: "Carrier, premium, effective date, and status set to active",
    icon: FileText,
    check: (s: ClientStatus) => s.policyComplete ?? false,
    actionLabel: "Edit in Book of Business",
    actionKey: "bob",
  },
  {
    key: "beneficiary",
    label: "Beneficiary information on file",
    description: "At least one beneficiary with name, relationship, and allocation",
    icon: Shield,
    check: (s: ClientStatus) => s.hasBeneficiaries ?? false,
    actionLabel: "Edit in Book of Business",
    actionKey: "bob",
  },
  {
    key: "documents",
    label: "Documents uploaded to portal",
    description: "Policy documents accessible to the client",
    icon: FileText,
    check: (s: ClientStatus) => s.documentCount > 0,
    detail: (s: ClientStatus) => `${s.documentCount} doc${s.documentCount !== 1 ? 's' : ''}`,
    actionLabel: "Edit in Book of Business",
    actionKey: "bob",
  },
  {
    key: "billing",
    label: "Billing initialized",
    description: "First payment date and premium amount set",
    icon: DollarSign,
    check: (s: ClientStatus) => s.hasBilling ?? false,
    actionLabel: "Edit in Book of Business",
    actionKey: "bob",
  },
  {
    key: "portal",
    label: "Portal access configured",
    description: "Client account created with login credentials",
    icon: KeyRound,
    check: (s: ClientStatus) => s.passwordSet || s.onboardingStatus !== 'pending',
  },
];

export function ClientVerificationDialog({ open, onOpenChange, leadId, workflow, onComplete, onOpenBoB }: ClientVerificationDialogProps) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showOverride, setShowOverride] = useState(false);

  const { data: statusResponse, isLoading: statusLoading, refetch } = useQuery<{ success: boolean; data: ClientStatus }>({
    queryKey: [`/api/post-close/${leadId}/client-status`],
    enabled: open && !!leadId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const clientStatus = statusResponse?.data;
  const allPassed = clientStatus ? VERIFICATION_ITEMS.every(item => item.check(clientStatus)) : false;
  const failedItems = clientStatus ? VERIFICATION_ITEMS.filter(item => !item.check(clientStatus)) : [];

  const handleConfirm = async () => {
    if (!allPassed && !showOverride) {
      setShowOverride(true);
      return;
    }

    if (!allPassed && !notes.trim()) {
      toast.error("Please add a note explaining why you're proceeding with incomplete items");
      return;
    }

    setSaving(true);
    try {
      await apiRequest("PATCH", `/api/post-close/${leadId}/step`, {
        step: "details_verified",
        notes: notes || undefined,
      });
      toast.success("Client details verified!");
      onComplete();
    } catch (err: any) {
      toast.error(err.message || "Failed to verify details");
    } finally {
      setSaving(false);
    }
  };

  const handleAction = (actionKey: string) => {
    if (actionKey === "bob" && onOpenBoB) {
      onOpenChange(false);
      onOpenBoB();
    }
  };

  const clientName = `${workflow?.lead_first_name || ''} ${workflow?.lead_last_name || ''}`.trim() || 'Client';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto" style={{ borderRadius: RADIUS.card }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            Verify Client Portal — {clientName}
          </DialogTitle>
        </DialogHeader>

        {/* Verification Checks */}
        <div className="mt-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Portal Setup Verification
          </h4>
          {statusLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-violet-500 mr-2" />
              <span className="text-xs text-gray-400">Checking portal data...</span>
            </div>
          ) : clientStatus ? (
            <div className="space-y-2">
              {VERIFICATION_ITEMS.map(item => {
                const passed = item.check(clientStatus);
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    className={`flex items-center gap-3 p-3 transition-colors ${
                      passed ? "bg-emerald-50" : "bg-red-50"
                    }`}
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      passed ? "bg-emerald-500" : "bg-red-400"
                    }`}>
                      {passed ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <X className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${passed ? "text-emerald-700" : "text-red-700"}`}>
                          {item.label}
                        </span>
                        {item.detail && (
                          <Badge variant="outline" className={`text-[9px] px-1 py-0 h-3.5 ${
                            passed ? "text-emerald-600 border-emerald-200" : "text-red-500 border-red-200"
                          }`}>
                            {item.detail(clientStatus)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                    {!passed && item.actionLabel && item.actionKey && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] text-violet-600 hover:text-violet-700 shrink-0"
                        onClick={() => handleAction(item.actionKey!)}
                      >
                        {item.actionLabel}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No data available</p>
          )}
        </div>

        {/* Onboarding Status */}
        {clientStatus && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Client Login Status
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2.5 bg-gray-50" style={{ borderRadius: RADIUS.input }}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  clientStatus.passwordSet ? "bg-emerald-100" : "bg-red-50"
                }`}>
                  {clientStatus.passwordSet ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-red-400" />}
                </div>
                <p className="text-xs font-medium text-gray-700">Password Set</p>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-gray-50" style={{ borderRadius: RADIUS.input }}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  clientStatus.hasLoggedIn ? "bg-emerald-100" : "bg-red-50"
                }`}>
                  {clientStatus.hasLoggedIn ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-red-400" />}
                </div>
                <p className="text-xs font-medium text-gray-700">Has Logged In</p>
              </div>
            </div>
          </div>
        )}

        {/* Warning for incomplete items */}
        {!allPassed && clientStatus && failedItems.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 flex items-start gap-2" style={{ borderRadius: RADIUS.input }}>
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-800">
                {failedItems.length} item{failedItems.length !== 1 ? 's' : ''} need{failedItems.length === 1 ? 's' : ''} attention
              </p>
              <p className="text-[10px] text-amber-700 mt-1">
                Missing: {(clientStatus.missingFields || []).join(', ') || 'unknown'}
              </p>
            </div>
          </div>
        )}

        {/* Override notes (shown when proceeding with failures) */}
        {showOverride && !allPassed && (
          <div className="mt-4">
            <Label className="text-xs text-gray-500">Why are you proceeding without completing all items? *</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., Documents will be sent from carrier within 5 business days..."
              className="mt-1 text-sm h-16 resize-none"
              style={{ borderRadius: RADIUS.input }}
            />
          </div>
        )}

        {/* Notes (when all pass) */}
        {allPassed && (
          <div className="mt-4">
            <Label className="text-xs text-gray-500">Verification Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any notes about the verification..."
              className="mt-1 text-sm h-16 resize-none"
              style={{ borderRadius: RADIUS.input }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
          <Button size="sm" variant="outline" className="h-8 text-xs" style={{ borderRadius: RADIUS.button }} onClick={() => { onOpenChange(false); setShowOverride(false); }}>
            Cancel
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs text-violet-600" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button
            size="sm"
            className={`h-8 text-xs text-white ${
              allPassed
                ? "bg-emerald-600 hover:bg-emerald-700"
                : showOverride
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
            style={{ borderRadius: RADIUS.button }}
            onClick={handleConfirm}
            disabled={saving || (!allPassed && !showOverride)}
          >
            {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            <ShieldCheck className="w-3 h-3 mr-1" />
            {allPassed ? "Confirm All Verified" : showOverride ? "Proceed Anyway" : "Verify All Items First"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
