/**
 * React Query hooks for Email Sequences (drip campaigns)
 *
 * Backend contract (server/routes/sequences.ts — mounted at /api/sequences,
 * management-tier gated):
 *   GET    /api/sequences                                   -> Sequence[] (+ activeEnrollments/totalEnrollments)
 *   POST   /api/sequences                                   { name, description?, triggerEvent?, steps[], isActive? }
 *   GET    /api/sequences/:id                               -> Sequence
 *   PATCH  /api/sequences/:id                               partial
 *   DELETE /api/sequences/:id                               (soft delete -> isActive=false)
 *   POST   /api/sequences/:id/enroll                        { leadId }
 *   GET    /api/sequences/:id/enrollments                   -> Enrollment[]
 *   POST   /api/sequences/enrollments/:enrollmentId/pause
 *   POST   /api/sequences/enrollments/:enrollmentId/resume
 *   POST   /api/sequences/enrollments/:enrollmentId/unenroll
 *   GET    /api/sequences/enrollments/:enrollmentId/history -> EmailSent[]
 *
 * Conventions mirror useAutomations.ts.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

// =============================================================================
// API Functions
// =============================================================================

async function fetchSequences(): Promise<Sequence[]> {
  const res = await fetch("/api/sequences", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch sequences");
  return res.json();
}

async function createSequence(data: CreateSequenceInput): Promise<Sequence> {
  const res = await fetch("/api/sequences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create sequence");
  }
  return res.json();
}

async function updateSequence(id: string, data: UpdateSequenceInput): Promise<Sequence> {
  const res = await fetch(`/api/sequences/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update sequence");
  }
  return res.json();
}

async function deleteSequence(id: string): Promise<void> {
  const res = await fetch(`/api/sequences/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete sequence");
}

async function enrollLead(sequenceId: string, leadId: string): Promise<SequenceEnrollment> {
  const res = await fetch(`/api/sequences/${sequenceId}/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ leadId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to enroll lead");
  }
  return res.json();
}

async function fetchEnrollments(sequenceId: string): Promise<SequenceEnrollment[]> {
  const res = await fetch(`/api/sequences/${sequenceId}/enrollments`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch enrollments");
  return res.json();
}

async function fetchEnrollmentHistory(enrollmentId: string): Promise<EnrollmentEmail[]> {
  const res = await fetch(`/api/sequences/enrollments/${enrollmentId}/history`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch enrollment history");
  return res.json();
}

async function enrollmentAction(
  enrollmentId: string,
  action: "pause" | "resume" | "unenroll",
): Promise<SequenceEnrollment> {
  const res = await fetch(`/api/sequences/enrollments/${enrollmentId}/${action}`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to ${action} enrollment`);
  }
  return res.json();
}

// =============================================================================
// React Query Hooks
// =============================================================================

export function useSequences() {
  return useQuery({
    queryKey: ["/api/sequences"],
    queryFn: fetchSequences,
    staleTime: 30000,
  });
}

export function useSequenceEnrollments(sequenceId: string | null) {
  return useQuery({
    queryKey: ["/api/sequences", sequenceId, "enrollments"],
    queryFn: () => fetchEnrollments(sequenceId as string),
    enabled: !!sequenceId,
  });
}

export function useEnrollmentHistory(enrollmentId: string | null) {
  return useQuery({
    queryKey: ["/api/sequences/enrollments", enrollmentId, "history"],
    queryFn: () => fetchEnrollmentHistory(enrollmentId as string),
    enabled: !!enrollmentId,
  });
}

export function useCreateSequence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSequence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
    },
  });
}

export function useUpdateSequence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSequenceInput }) => updateSequence(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
    },
  });
}

export function useDeleteSequence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSequence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
    },
  });
}

export function useEnrollLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sequenceId, leadId }: { sequenceId: string; leadId: string }) =>
      enrollLead(sequenceId, leadId),
    onSuccess: (_, { sequenceId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sequences", sequenceId, "enrollments"] });
    },
  });
}

export function useEnrollmentAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      enrollmentId,
      action,
    }: {
      enrollmentId: string;
      action: "pause" | "resume" | "unenroll";
      sequenceId?: string;
    }) => enrollmentAction(enrollmentId, action),
    onSuccess: (_, { sequenceId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
      if (sequenceId) {
        queryClient.invalidateQueries({ queryKey: ["/api/sequences", sequenceId, "enrollments"] });
      }
    },
  });
}
