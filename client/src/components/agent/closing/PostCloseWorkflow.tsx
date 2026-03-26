import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Rocket, BookOpen, ShieldCheck, Check, Loader2,
  ChevronDown, ChevronUp, User, FileText, Building2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RADIUS, SHADOW, fadeInUp } from "@/lib/heritageDesignSystem";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/agent/primitives/ConfirmDialog";
import { WorkflowProgressCard } from "./WorkflowProgressCard";
import { BookOfBusinessDialog } from "./BookOfBusinessDialog";
import { ClientVerificationDialog } from "./ClientVerificationDialog";

interface PostCloseWorkflowProps {
  leadId: string;
  onComplete?: () => void;
}

interface WorkflowData {
  id: string;
  lead_id: string;
  agent_user_id: string;
  client_user_id?: string;
  policy_id?: string;
  status: string;
  workflow_started_at?: string;
  welcome_email_sent_at?: string;
  welcome_sms_sent_at?: string;
  ai_call_scheduled_at?: string;
  ai_call_completed_at?: string;
  ai_call_job_id?: string;
  nps_scheduled_at?: string;
  nps_score?: number;
  nps_received_at?: string;
  referral_asked_at?: string;
  book_of_business_updated_at?: string;
  details_verified_at?: string;
  completed_at?: string;
  verification_notes?: string;
  lead_first_name?: string;
  lead_last_name?: string;
  lead_email?: string;
  lead_phone?: string;
  coverage_type?: string;
  estimated_value?: number;
  policy_number?: string;
  policy_type?: string;
  coverage_amount?: number;
  carrier?: string;
  monthly_premium?: string;
  policy_status?: string;
  client_first_name?: string;
  client_last_name?: string;
  client_email?: string;
  city?: string;
  state?: string;
}

export function PostCloseWorkflow({ leadId, onComplete }: PostCloseWorkflowProps) {
  const [launching, setLaunching] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const queryClient = useQueryClient();

  const { data: workflowResponse, isLoading } = useQuery<{ success: boolean; data: WorkflowData }>({
    queryKey: [`/api/post-close/${leadId}`],
    enabled: !!leadId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return status === 'in_progress' ? 3000 : false;
    },
  });

  const { data: clientStatusResponse } = useQuery<{
    success: boolean;
    data: { passwordSet: boolean; hasLoggedIn: boolean; documentCount: number; policyStatus: string };
  }>({
    queryKey: [`/api/post-close/${leadId}/client-status`],
    enabled: !!leadId,
  });

  const workflow = workflowResponse?.data;
  const clientStatus = clientStatusResponse?.data;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/post-close/${leadId}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/post-close/${leadId}/client-status`] });
    queryClient.invalidateQueries({ queryKey: ['/api/crm/pipeline/closing-stats'] });
    queryClient.invalidateQueries({ queryKey: ['/api/crm/pipeline/recent-closings'] });
    queryClient.invalidateQueries({ queryKey: ['/api/post-close/pending'] });
  };

  const handleLaunch = async () => {
    setShowConfirm(false);
    setLaunching(true);
    try {
      const response = await apiRequest("POST", `/api/post-close/${leadId}/launch`);
      const result = await response.json();
      const actions = result.actions || {};

      const parts: string[] = [];
      if (actions.email) parts.push("email sent");
      if (actions.sms) parts.push("SMS sent");
      if (actions.aiCall) parts.push("AI call scheduled");
      if (actions.followUps) parts.push("follow-ups scheduled");

      toast.success(`Workflow launched! ${parts.join(", ")}`);
      invalidate();
      queryClient.invalidateQueries({ queryKey: [`/api/post-close/${leadId}/follow-ups`] });
    } catch (err: any) {
      toast.error(err.message || "Failed to launch workflow");
    } finally {
      setLaunching(false);
    }
  };

  const handleStepAction = async (stepKey: string) => {
    if (stepKey === "book_of_business") {
      setShowBookDialog(true);
      return;
    }
    if (stepKey === "verify_details") {
      setShowVerifyDialog(true);
      return;
    }
  };

  if (isLoading) {
    return (
      <motion.div variants={fadeInUp}>
        <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
          <CardContent className="p-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500 mr-2" />
            <span className="text-sm text-gray-500">Loading workflow...</span>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!workflow) {
    return (
      <motion.div variants={fadeInUp}>
        <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
          <CardContent className="p-8 text-center text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No post-close workflow found for this client.</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const clientName = `${workflow.lead_first_name || ''} ${workflow.lead_last_name || ''}`.trim() || 'Client';
  const isLaunched = !!workflow.workflow_started_at;
  const automatedDone = !!(
    workflow.welcome_email_sent_at &&
    workflow.welcome_sms_sent_at
  );
  const bookDone = !!workflow.book_of_business_updated_at;
  const verifyDone = !!workflow.details_verified_at;

  return (
    <motion.div variants={fadeInUp}>
      <Card className="border-0 overflow-hidden" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {clientName.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Post-Close Workflow — {clientName}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {workflow.coverage_type && <span>{workflow.coverage_type} • </span>}
                {workflow.policy_number && <span>{workflow.policy_number} • </span>}
                {workflow.carrier && <span>{workflow.carrier}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`text-xs ${
                workflow.status === 'completed'
                  ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                  : isLaunched
                  ? 'text-violet-600 border-violet-200 bg-violet-50'
                  : 'text-gray-500 border-gray-200'
              }`}
            >
              {workflow.status === 'completed' ? 'Complete' : isLaunched ? 'In Progress' : 'Ready to Launch'}
            </Badge>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Client Summary */}
              <div className="px-5 pb-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50" style={{ borderRadius: RADIUS.input }}>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Client</p>
                      <p className="text-xs font-medium text-gray-700">{clientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Policy</p>
                      <p className="text-xs font-medium text-gray-700">{workflow.policy_number || 'Pending'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Coverage</p>
                      <p className="text-xs font-medium text-gray-700">
                        ${(workflow.coverage_amount || workflow.estimated_value || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Carrier</p>
                      <p className="text-xs font-medium text-gray-700">{workflow.carrier || 'Pending'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 space-y-4">
                {/* Phase A: Pre-launch — show launch button */}
                {!isLaunched && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Launch the automated post-close workflow to welcome {clientName} with an email, SMS, and AI call.
                    </p>
                    <Button
                      size="lg"
                      className="h-11 px-8 text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
                      style={{ borderRadius: RADIUS.button }}
                      onClick={() => setShowConfirm(true)}
                      disabled={launching}
                    >
                      {launching ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Rocket className="w-4 h-4 mr-2" />
                      )}
                      Launch Post-Close Workflow
                    </Button>
                  </div>
                )}

                {/* Phase B: Workflow progress */}
                {isLaunched && (
                  <WorkflowProgressCard
                    workflow={workflow}
                    clientStatus={clientStatus || null}
                  />
                )}

                {/* Phase C: Manual steps (show after launch) */}
                {isLaunched && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Book of Business */}
                    <div
                      className={`flex items-center gap-3 p-3 transition-colors ${
                        bookDone ? "bg-emerald-50" : "bg-gray-50"
                      }`}
                      style={{ borderRadius: RADIUS.input }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        bookDone ? "bg-emerald-500 text-white" : "bg-violet-100 text-violet-600"
                      }`}>
                        {bookDone ? <Check className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Book of Business</p>
                        <p className="text-[10px] text-gray-500">
                          {bookDone ? "Updated" : "Update client records, beneficiaries, and documents"}
                        </p>
                      </div>
                      {!bookDone && (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                          style={{ borderRadius: RADIUS.button }}
                          onClick={() => handleStepAction("book_of_business")}
                        >
                          Update
                        </Button>
                      )}
                    </div>

                    {/* Verify Details */}
                    <div
                      className={`flex items-center gap-3 p-3 transition-colors ${
                        verifyDone ? "bg-emerald-50" : "bg-gray-50"
                      }`}
                      style={{ borderRadius: RADIUS.input }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        verifyDone ? "bg-emerald-500 text-white" : "bg-violet-100 text-violet-600"
                      }`}>
                        {verifyDone ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Verify Details</p>
                        <p className="text-[10px] text-gray-500">
                          {verifyDone ? "All details verified" : "Confirm all client data is correct in portal"}
                        </p>
                      </div>
                      {!verifyDone && (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                          style={{ borderRadius: RADIUS.button }}
                          onClick={() => handleStepAction("verify_details")}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleLaunch}
        title="Launch Post-Close Workflow"
        description={`This will send a welcome email, congratulations SMS, and schedule an AI welcome call to ${clientName}. Follow-ups at 30, 60, and 90 days will also be scheduled. Continue?`}
        confirmLabel="Launch Workflow"
        variant="info"
        icon={Rocket}
      />

      {/* Dialogs */}
      <BookOfBusinessDialog
        open={showBookDialog}
        onOpenChange={setShowBookDialog}
        leadId={leadId}
        workflow={workflow}
        onComplete={() => {
          setShowBookDialog(false);
          invalidate();
        }}
      />
      <ClientVerificationDialog
        open={showVerifyDialog}
        onOpenChange={setShowVerifyDialog}
        leadId={leadId}
        workflow={workflow}
        onComplete={() => {
          setShowVerifyDialog(false);
          invalidate();
          onComplete?.();
        }}
        onOpenBoB={() => setShowBookDialog(true)}
      />
    </motion.div>
  );
}
