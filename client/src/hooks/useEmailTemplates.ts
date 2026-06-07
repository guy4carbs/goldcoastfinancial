/**
 * React Query hooks for Email Templates (ported from heritage-app, adapted to
 * main's queryClient conventions — string-array queryKeys + `apiRequest` for
 * CSRF-protected mutations).
 *
 * Backend contract (Forge — mounted at /api/email-templates):
 *   GET    /api/email-templates                  -> EmailTemplate[]
 *   POST   /api/email-templates                  { name, subject, bodyHtml, bodyText?, category? }
 *   PATCH  /api/email-templates/:id              partial
 *   DELETE /api/email-templates/:id              (soft delete -> isActive=false)
 *   POST   /api/admin/sequences/seed-templates   (admin-only; seeds starter templates)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

export interface SeedResult {
  ok: boolean;
  /** 403 means the user is not an admin — caller should hide the action politely. */
  forbidden: boolean;
  created?: number;
}

// =============================================================================
// React Query Hooks
// =============================================================================

export function useEmailTemplates() {
  // Default fetcher uses queryKey[0] as the URL verbatim.
  return useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
    staleTime: 30_000,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTemplateInput): Promise<EmailTemplate> => {
      const res = await apiRequest("POST", "/api/email-templates", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTemplateInput }): Promise<EmailTemplate> => {
      const res = await apiRequest("PATCH", `/api/email-templates/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiRequest("DELETE", `/api/email-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
    },
  });
}

export function useSeedTemplates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<SeedResult> => {
      try {
        const res = await apiRequest("POST", "/api/admin/sequences/seed-templates");
        const data = await res.json().catch(() => ({}));
        return { ok: true, forbidden: false, created: data?.created };
      } catch (err: any) {
        // apiRequest throws "403: ..." for forbidden, or "404: ..." when the
        // seed endpoint isn't mounted (Gold Coast doesn't run the seed route —
        // Heritage owns it; templates are shared via the same DB). Treat both
        // as a soft, silent signal so the seed action simply hides.
        if (
          typeof err?.message === "string" &&
          (err.message.startsWith("403") || err.message.startsWith("404"))
        ) {
          return { ok: false, forbidden: true };
        }
        throw err;
      }
    },
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      }
    },
  });
}
