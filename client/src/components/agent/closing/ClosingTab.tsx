import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { staggerContainer, fadeInUp, RADIUS, SHADOW } from "@/lib/heritageDesignSystem";
import { RecentClosings } from "./RecentClosings";
import { PostCloseWorkflow } from "./PostCloseWorkflow";
import { CommissionPreviewCard } from "./CommissionPreviewCard";
import { CrossSellIndicatorCard } from "./CrossSellIndicatorCard";
import { FollowUpSchedulerCard } from "./FollowUpSchedulerCard";
import { ReferralAskCard } from "./ReferralAskCard";
import { NpsStatusIndicator } from "./NpsStatusIndicator";
import { StartClosingForm } from "./StartClosingForm";

interface PendingWorkflow {
  id: string;
  lead_id: string;
  status: string;
  lead_first_name?: string;
  lead_last_name?: string;
  workflow_started_at?: string;
  nps_scheduled_at?: string;
  nps_score?: number;
  nps_received_at?: string;
  referral_asked_at?: string;
}

export function ClosingTab() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Pending workflows — always fresh on mount
  const { data: pendingResponse } = useQuery<{ success: boolean; data: PendingWorkflow[] }>({
    queryKey: ['/api/post-close/pending'],
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Recent closings (completed ones for the bottom list)
  const { data: recentClosings } = useQuery<any[]>({
    queryKey: ['/api/crm/pipeline/recent-closings'],
  });

  const pendingWorkflows = pendingResponse?.data || [];

  // Auto-select first pending workflow
  useEffect(() => {
    if (!selectedLeadId && pendingWorkflows.length > 0) {
      setSelectedLeadId(pendingWorkflows[0].lead_id);
    }
  }, [pendingWorkflows, selectedLeadId]);

  // Workflow data for the selected lead
  const { data: workflowResponse } = useQuery<{ success: boolean; data: any }>({
    queryKey: [`/api/post-close/${selectedLeadId}`],
    enabled: !!selectedLeadId,
  });

  const workflow = workflowResponse?.data;

  const handleWorkflowComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/post-close/pending'] });
    queryClient.invalidateQueries({ queryKey: ['/api/crm/pipeline/recent-closings'] });
    // Clear selection — completed deal collapses, shows in Recently Closed
    setSelectedLeadId(null);
  };

  const handleClosingCreated = (leadId: string) => {
    setSelectedLeadId(leadId);
    queryClient.invalidateQueries({ queryKey: ['/api/post-close/pending'] });
  };

  const clientName = workflow
    ? `${workflow.lead_first_name || ''} ${workflow.lead_last_name || ''}`.trim() || 'Client'
    : 'Client';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Section 1: Start a new closing OR active workflow */}
      {selectedLeadId ? (
        <>
          {/* Active workflow */}
          <PostCloseWorkflow
            leadId={selectedLeadId}
            onComplete={handleWorkflowComplete}
          />

          {/* Commission + Cross-sell */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CommissionPreviewCard workflow={workflow || {}} />
            <CrossSellIndicatorCard leadId={selectedLeadId} />
          </div>

          {/* Follow-ups */}
          <FollowUpSchedulerCard leadId={selectedLeadId} />

          {/* Referral */}
          <ReferralAskCard
            leadId={selectedLeadId}
            clientName={clientName}
            referralAsked={!!workflow?.referral_asked_at}
          />

          {/* NPS */}
          <NpsStatusIndicator
            npsScheduledAt={workflow?.nps_scheduled_at}
            npsScore={workflow?.nps_score}
            npsReceivedAt={workflow?.nps_received_at}
          />

          {/* Start another closing link */}
          <StartClosingForm
            onCreated={handleClosingCreated}
            compact
          />
        </>
      ) : (
        /* No active workflow — show the intake form as the hero */
        <StartClosingForm onCreated={handleClosingCreated} />
      )}

      {/* Section 2: Recently Closed Clients (always at the bottom) */}
      <RecentClosings
        closings={recentClosings}
        selectedLeadId={selectedLeadId}
        onSelectLead={(id) => setSelectedLeadId(id || null)}
      />
    </motion.div>
  );
}
