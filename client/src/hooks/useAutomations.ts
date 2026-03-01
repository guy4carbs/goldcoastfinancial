/**
 * React Query hooks for Automations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Automation,
  AutomationExecution,
  AutomationTemplate,
} from "@shared/models/automations";

// =============================================================================
// API Functions
// =============================================================================

async function fetchAutomations(): Promise<Automation[]> {
  const response = await fetch("/api/automations", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch automations");
  return response.json();
}

async function fetchAutomation(id: string): Promise<Automation> {
  const response = await fetch(`/api/automations/${id}`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch automation");
  return response.json();
}

async function fetchTemplates(): Promise<AutomationTemplate[]> {
  const response = await fetch("/api/automations/templates", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch templates");
  return response.json();
}

async function createAutomation(data: Record<string, unknown>): Promise<Automation> {
  const response = await fetch("/api/automations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create automation");
  }
  return response.json();
}

async function createFromTemplate(templateId: string, name?: string, description?: string): Promise<Automation> {
  const response = await fetch("/api/automations/from-template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ templateId, name, description }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create automation from template");
  }
  return response.json();
}

async function updateAutomation(id: string, data: Record<string, unknown>): Promise<Automation> {
  const response = await fetch(`/api/automations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update automation");
  }
  return response.json();
}

async function deleteAutomation(id: string): Promise<void> {
  const response = await fetch(`/api/automations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete automation");
}

async function toggleAutomation(id: string, enabled: boolean): Promise<Automation> {
  const response = await fetch(`/api/automations/${id}/toggle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ enabled }),
  });
  if (!response.ok) throw new Error("Failed to toggle automation");
  return response.json();
}

async function fetchExecutions(automationId: string, limit?: number): Promise<AutomationExecution[]> {
  const url = limit
    ? `/api/automations/${automationId}/executions?limit=${limit}`
    : `/api/automations/${automationId}/executions`;
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch executions");
  return response.json();
}

async function fetchRecentExecutions(limit?: number): Promise<AutomationExecution[]> {
  const url = limit
    ? `/api/automations/executions/recent?limit=${limit}`
    : `/api/automations/executions/recent`;
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch recent executions");
  return response.json();
}

async function testAutomation(id: string, testData?: Record<string, unknown>): Promise<{ success: boolean; execution: AutomationExecution; message: string }> {
  const response = await fetch(`/api/automations/${id}/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ testData }),
  });
  if (!response.ok) throw new Error("Failed to test automation");
  return response.json();
}

async function runAutomation(id: string, triggerData?: Record<string, unknown>): Promise<{ success: boolean; execution: AutomationExecution }> {
  const response = await fetch(`/api/automations/${id}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ triggerData }),
  });
  if (!response.ok) throw new Error("Failed to run automation");
  return response.json();
}

// =============================================================================
// React Query Hooks
// =============================================================================

export function useAutomations() {
  return useQuery({
    queryKey: ["automations"],
    queryFn: fetchAutomations,
    staleTime: 30000, // 30 seconds
  });
}

export function useAutomation(id: string) {
  return useQuery({
    queryKey: ["automations", id],
    queryFn: () => fetchAutomation(id),
    enabled: !!id,
  });
}

export function useAutomationTemplates() {
  return useQuery({
    queryKey: ["automation-templates"],
    queryFn: fetchTemplates,
    staleTime: 60000, // 1 minute - templates don't change often
  });
}

export function useExecutions(automationId: string, limit?: number) {
  return useQuery({
    queryKey: ["automation-executions", automationId, limit],
    queryFn: () => fetchExecutions(automationId, limit),
    enabled: !!automationId,
  });
}

export function useRecentExecutions(limit?: number) {
  return useQuery({
    queryKey: ["automation-executions", "recent", limit],
    queryFn: () => fetchRecentExecutions(limit),
  });
}

export function useCreateAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAutomation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
}

export function useCreateFromTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, name, description }: { templateId: string; name?: string; description?: string }) =>
      createFromTemplate(templateId, name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateAutomation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      queryClient.invalidateQueries({ queryKey: ["automations", id] });
    },
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAutomation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
}

export function useToggleAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => toggleAutomation(id, enabled),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      queryClient.invalidateQueries({ queryKey: ["automations", id] });
    },
  });
}

export function useTestAutomation() {
  return useMutation({
    mutationFn: ({ id, testData }: { id: string; testData?: Record<string, unknown> }) => testAutomation(id, testData),
  });
}

export function useRunAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, triggerData }: { id: string; triggerData?: Record<string, unknown> }) => runAutomation(id, triggerData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["automation-executions", id] });
      queryClient.invalidateQueries({ queryKey: ["automation-executions", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["automations", id] });
    },
  });
}
