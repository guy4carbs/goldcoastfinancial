/**
 * React Query hooks for Email Sequences / drip campaigns (ported from
 * heritage-app, adapted to main's queryClient conventions — string-array
 * queryKeys with queryKey[0] as the fetch URL, and `apiRequest` for the
 * CSRF-protected mutations main enforces on /api).
 *
 * Backend contract (Forge — mounted at /api/sequences, founders-tier gated):
 *   GET    /api/sequences                                   -> Sequence[] (+ activeEnrollments/totalEnrollments)
 *   POST   /api/sequences                                   { name, description?, triggerEvent?, steps[], isActive? }
 *   GET    /api/sequences/:id                               -> Sequence
 *   PATCH  /api/sequences/:id                               partial
 *   DELETE /api/sequences/:id                               (soft delete -> isActive=false)
 *   POST   /api/sequences/:id/enroll                        { leadId }
 *   GET    /api/sequences/:id/enrollments                   -> Enrollment[] (+ leadFirstName/leadLastName/leadEmail)
 *   POST   /api/sequences/enrollments/:enrollmentId/{pause,resume,unenroll}
 *   GET    /api/sequences/enrollments/:enrollmentId/history -> EmailSent[]
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// =============================================================================
// Types
// =============================================================================

export interface SequenceStep {
  templateId: string;
  delayDays: number;
  delayHours: number;
  condition?: string;
}

export interface Sequence {
  id: string;
  name: string;
  description: string | null;
  triggerEvent: string | null;
  steps: SequenceStep[];
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  // Added by GET /api/sequences list endpoint:
  activeEnrollments?: number;
  totalEnrollments?: number;
}

export interface SequenceEnrollment {
  id: string;
  sequenceId: string;
  leadId: string;
  currentStep: number | null;
  status: "active" | "paused" | "completed" | "unsubscribed";
  nextSendAt: string | null;
  enrolledAt: string;
  completedAt: string | null;
  unsubscribedAt: string | null;
  // Joined from leads (left join — null if the lead was deleted)
  leadFirstName: string | null;
  leadLastName: string | null;
  leadEmail: string | null;
}

export interface EnrollmentEmail {
  id: string;
  leadId: string | null;
  templateId: string | null;
  sequenceId: string | null;
  enrollmentId: string | null;
  toEmail: string;
  subject: string;
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed" | "skipped";
  sentAt: string;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  bouncedAt: string | null;
  bounceReason: string | null;
  openCount: number | null;
  clickCount: number | null;
}

export interface CreateSequenceInput {
  name: string;
  description?: string;
  triggerEvent?: string;
  steps: SequenceStep[];
  isActive?: boolean;
}

export type UpdateSequenceInput = Partial<CreateSequenceInput>;

export type EnrollmentActionType = "pause" | "resume" | "unenroll";

// =============================================================================
// React Query Hooks — Queries (default fetcher uses queryKey[0] as the URL)
// =============================================================================

export function useSequences() {
  return useQuery<Sequence[]>({
    queryKey: ["/api/sequences"],
    staleTime: 30_000,
  });
}

export function useSequenceEnrollments(sequenceId: string | null) {
  return useQuery<SequenceEnrollment[]>({
    // URL embedded in queryKey[0]; second entry is a cache discriminator only.
    queryKey: [`/api/sequences/${sequenceId}/enrollments`, sequenceId],
    enabled: !!sequenceId,
  });
}

export function useEnrollmentHistory(enrollmentId: string | null) {
  return useQuery<EnrollmentEmail[]>({
    queryKey: [`/api/sequences/enrollments/${enrollmentId}/history`, enrollmentId],
    enabled: !!enrollmentId,
  });
}

// =============================================================================
// React Query Hooks — Mutations
// =============================================================================

export function useCreateSequence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSequenceInput): Promise<Sequence> => {
      const res = await apiRequest("POST", "/api/sequences", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
    },
  });
}

export function useUpdateSequence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSequenceInput }): Promise<Sequence> => {
      const res = await apiRequest("PATCH", `/api/sequences/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
    },
  });
}

export function useDeleteSequence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiRequest("DELETE", `/api/sequences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
    },
  });
}

export function useEnrollLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sequenceId, leadId }: { sequenceId: string; leadId: string }): Promise<SequenceEnrollment> => {
      const res = await apiRequest("POST", `/api/sequences/${sequenceId}/enroll`, { leadId });
      return res.json();
    },
    onSuccess: (_data, { sequenceId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
      queryClient.invalidateQueries({ queryKey: [`/api/sequences/${sequenceId}/enrollments`, sequenceId] });
    },
  });
}

export function useEnrollmentAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      enrollmentId,
      action,
    }: {
      enrollmentId: string;
      action: EnrollmentActionType;
      sequenceId?: string;
    }): Promise<SequenceEnrollment> => {
      const res = await apiRequest("POST", `/api/sequences/enrollments/${enrollmentId}/${action}`);
      return res.json();
    },
    onSuccess: (_data, { sequenceId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
      if (sequenceId) {
        queryClient.invalidateQueries({ queryKey: [`/api/sequences/${sequenceId}/enrollments`, sequenceId] });
      }
    },
  });
}
