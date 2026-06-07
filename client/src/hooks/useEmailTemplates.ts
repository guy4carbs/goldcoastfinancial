/**
 * React Query hooks for Email Templates
 *
 * Backend contract (server/routes/email-templates.ts — mounted at /api/email-templates):
 *   GET    /api/email-templates                  -> EmailTemplate[]
 *   POST   /api/email-templates                  { name, subject, bodyHtml, bodyText?, category? }
 *   PATCH  /api/email-templates/:id              partial
 *   DELETE /api/email-templates/:id              (soft delete -> isActive=false)
 *   POST   /api/admin/sequences/seed-templates   (admin-only; seeds 5 starter templates)
 *
 * Conventions mirror useAutomations.ts: string-array queryKeys, explicit queryFn
 * with fetch + credentials:"include", invalidateQueries on mutation success.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// =============================================================================
// Types
// =============================================================================

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  category: string | null;
  variables: string[];
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  category?: string;
}

export type UpdateTemplateInput = Partial<CreateTemplateInput> & { isActive?: boolean };

// =============================================================================
// API Functions
// =============================================================================

async function fetchTemplates(): Promise<EmailTemplate[]> {
  const res = await fetch("/api/email-templates", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch templates");
  return res.json();
}

async function createTemplate(data: CreateTemplateInput): Promise<EmailTemplate> {
  const res = await fetch("/api/email-templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create template");
  }
  return res.json();
}

async function updateTemplate(id: string, data: UpdateTemplateInput): Promise<EmailTemplate> {
  const res = await fetch(`/api/email-templates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update template");
  }
  return res.json();
}

async function deleteTemplate(id: string): Promise<void> {
  const res = await fetch(`/api/email-templates/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete template");
}

export interface SeedResult {
  ok: boolean;
  /** 403 means the user is not an admin — caller should hide the action politely. */
  forbidden: boolean;
  created?: number;
}

async function seedTemplates(): Promise<SeedResult> {
  const res = await fetch("/api/admin/sequences/seed-templates", {
    method: "POST",
    credentials: "include",
  });
  if (res.status === 403) {
    return { ok: false, forbidden: true };
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to seed templates");
  }
  const data = await res.json().catch(() => ({}));
  return { ok: true, forbidden: false, created: data?.created };
}

// =============================================================================
// React Query Hooks
// =============================================================================

export function useEmailTemplates() {
  return useQuery({
    queryKey: ["/api/email-templates"],
    queryFn: fetchTemplates,
    staleTime: 30000,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateInput }) => updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
    },
  });
}

export function useSeedTemplates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seedTemplates,
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      }
    },
  });
}
