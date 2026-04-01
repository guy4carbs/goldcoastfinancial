/**
 * Lead action hooks — wraps Zustand store writes with backend API persistence
 * Use these instead of calling useAgentStore() directly for lead mutations
 */
import { useCallback } from "react";
import { useAgentStore } from "@/lib/agentStore";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Update a lead's status — persists to backend AND updates local store
 */
export function useUpdateLeadStatus() {
  const updateLeadStatus = useAgentStore((s) => s.updateLeadStatus);
  const queryClient = useQueryClient();

  return useCallback(async (leadId: string, status: string) => {
    // Update local store immediately (optimistic)
    updateLeadStatus(leadId, status as any);

    // Persist to backend
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, pipelineStage: status }),
      });
      queryClient.invalidateQueries({ queryKey: ["lead-distribution"] });
    } catch (err) {
      console.error("[useLeadActions] Failed to update lead status:", err);
    }
  }, [updateLeadStatus, queryClient]);
}

/**
 * Add an activity to a lead — persists to backend AND updates local store
 */
export function useAddLeadActivity() {
  const addActivityToLead = useAgentStore((s) => s.addActivityToLead);

  return useCallback(async (leadId: string, activity: string) => {
    // Update local store
    addActivityToLead(leadId, activity as any);

    // Persist to backend
    try {
      await fetch(`/api/crm/pipeline/${leadId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "note",
          description: activity,
        }),
      });
    } catch (err) {
      console.error("[useLeadActions] Failed to add activity:", err);
    }
  }, [addActivityToLead]);
}

/**
 * Update a lead's follow-up date — persists to backend AND updates local store
 */
export function useUpdateLeadFollowUp() {
  const updateLeadFollowUp = useAgentStore((s) => s.updateLeadFollowUp);

  return useCallback(async (leadId: string, date: string, type: string) => {
    // Update local store
    updateLeadFollowUp(leadId, date, type as any);

    // Persist to backend
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nextFollowUp: new Date(date).toISOString() }),
      });
    } catch (err) {
      console.error("[useLeadActions] Failed to update follow-up:", err);
    }
  }, [updateLeadFollowUp]);
}
