/**
 * ManagePoliciesModal — CRUD modal for agent policies
 *
 * List view: shows all policies with status, client info, premium/coverage, edit/delete
 * Form view: add or edit a policy with client details, carrier, dates, amounts
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  FileCheck,
  MapPin,
  Calendar as CalendarIcon,
  X,
  DollarSign,
} from "lucide-react";
import { US_STATES, ABBREV_TO_NAME } from "@/components/maps/usStatesPaths";
import { RADIUS, COLORS } from "@/lib/heritageDesignSystem";
import { cn } from "@/lib/utils";
import type { AgentPolicy } from "@shared/models/policies";

interface ManagePoliciesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalView = "list" | "form";

const COVERAGE_TYPES = [
  { value: "term_life", label: "Term Life" },
  { value: "whole_life", label: "Whole Life" },
  { value: "universal_life", label: "Universal Life" },
  { value: "iul", label: "IUL" },
  { value: "final_expense", label: "Final Expense" },
  { value: "health", label: "Health" },
  { value: "medicare", label: "Medicare" },
  { value: "annuity", label: "Annuity" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "lapsed", label: "Lapsed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  lapsed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  expired: "bg-red-100 text-red-700",
};

interface FormData {
  clientName: string;
  stateCode: string;
  policyNumber: string;
  carrier: string;
  coverageType: string;
  status: string;
  premiumAmount: string;
  coverageAmount: string;
  effectiveDate: string;
  expirationDate: string;
  notes: string;
}

const EMPTY_FORM: FormData = {
  clientName: "",
  stateCode: "",
  policyNumber: "",
  carrier: "",
  coverageType: "term_life",
  status: "active",
  premiumAmount: "",
  coverageAmount: "",
  effectiveDate: "",
  expirationDate: "",
  notes: "",
};

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDollars(dollars: number): string {
  return `$${dollars.toLocaleString("en-US")}`;
}

function getDaysUntilExpiration(expirationDate: string | null | undefined): number | null {
  if (!expirationDate) return null;
  const exp = new Date(expirationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function ExpirationBadge({ expirationDate }: { expirationDate: string | null | undefined }) {
  const days = getDaysUntilExpiration(expirationDate);
  if (days === null) return null;

  if (days <= 0) {
    return (
      <Badge className="bg-red-100 text-red-700 border-0 text-xs gap-1" style={{ borderRadius: RADIUS.pill }}>
        <AlertTriangle className="w-3 h-3" />
        Expired
      </Badge>
    );
  }
  if (days <= 7) {
    return (
      <Badge className="bg-red-100 text-red-700 border-0 text-xs gap-1" style={{ borderRadius: RADIUS.pill }}>
        <AlertTriangle className="w-3 h-3" />
        {days}d left
      </Badge>
    );
  }
  if (days <= 30) {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-0 text-xs gap-1" style={{ borderRadius: RADIUS.pill }}>
        <AlertTriangle className="w-3 h-3" />
        {days}d left
      </Badge>
    );
  }
  return null;
}

/** Date trigger button — just the input, no calendar. */
function DateTrigger({
  label,
  value,
  active,
  onToggle,
  onClear,
}: {
  label: string;
  value: string;
  active: boolean;
  onToggle: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "h-11 w-full flex items-center gap-2 px-3 border border-input bg-background text-sm text-left transition-colors hover:bg-gray-50",
          !value && "text-muted-foreground",
          active && "ring-1 ring-violet-400 border-violet-400"
        )}
        style={{ borderRadius: RADIUS.input }}
      >
        <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="flex-1">{value ? formatDisplayDate(value) : "Pick a date"}</span>
        {value && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>
    </div>
  );
}

const CALENDAR_CLASS_NAMES = {
  root: "w-full",
  months: "relative flex flex-col gap-4 w-full",
  month: "flex w-full flex-col gap-4",
  nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
  month_caption: "flex h-10 w-full items-center justify-center px-10",
  dropdowns: "flex h-10 w-full items-center justify-center gap-2 text-sm font-semibold",
  dropdown_root: "has-focus:border-violet-400 border-gray-200 shadow-sm has-focus:ring-violet-400/30 has-focus:ring-[3px] relative border px-1 rounded-xl",
  caption_label: "select-none font-semibold [&>svg]:text-gray-400 flex h-9 items-center gap-1 pl-3 pr-1.5 text-sm [&>svg]:size-3.5 rounded-xl",
  table: "w-full border-collapse",
  weekdays: "flex w-full mb-1",
  weekday: "flex-1 text-center text-xs font-medium text-gray-400 h-8 leading-8",
  week: "flex w-full",
  day: "group/day relative flex-1 h-10 select-none p-0 text-center text-sm flex items-center justify-center",
  button_previous: "h-9 w-9 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-xl border border-gray-200",
  button_next: "h-9 w-9 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-xl border border-gray-200",
  today: "[&_button]:bg-violet-100 [&_button]:text-violet-700 [&_button]:font-semibold [&_button]:rounded-full [&_button]:px-5 [&_button]:h-8",
};

export function ManagePoliciesModal({ open, onOpenChange }: ManagePoliciesModalProps) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<ModalView>("list");
  const [editingPolicy, setEditingPolicy] = useState<AgentPolicy | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openDateField, setOpenDateField] = useState<"effective" | "expiration" | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    if (!openDateField) return;
    function handleClick(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setOpenDateField(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDateField]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (open) {
      setView("list");
      setEditingPolicy(null);
      setFormData(EMPTY_FORM);
      setErrors({});
      setDeletingId(null);
      setOpenDateField(null);
    }
  }, [open]);

  // Fetch policies
  const { data: policies = [], isLoading } = useQuery<AgentPolicy[]>({
    queryKey: ["/api/policies"],
    queryFn: async () => {
      const res = await fetch("/api/policies", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch policies");
      return res.json();
    },
    enabled: open,
  });

  // Sorted policies: active first, then pending, then by client name
  const sortedPolicies = useMemo(() => {
    const order: Record<string, number> = { active: 0, pending: 1, lapsed: 2, expired: 3, cancelled: 4 };
    return [...policies].sort((a, b) => {
      const statusDiff = (order[a.status] ?? 5) - (order[b.status] ?? 5);
      if (statusDiff !== 0) return statusDiff;
      return (a.clientName || "").localeCompare(b.clientName || "");
    });
  }, [policies]);

  // Mutations
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
    queryClient.invalidateQueries({ queryKey: ["/api/policies/summary"] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clientName: data.clientName || null,
          stateCode: data.stateCode,
          policyNumber: data.policyNumber || null,
          carrier: data.carrier || null,
          coverageType: data.coverageType,
          status: data.status,
          premiumAmount: data.premiumAmount ? Math.round(parseFloat(data.premiumAmount) * 100) : null,
          coverageAmount: data.coverageAmount ? parseInt(data.coverageAmount, 10) : null,
          effectiveDate: data.effectiveDate || null,
          expirationDate: data.expirationDate || null,
          notes: data.notes || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create policy");
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
      setView("list");
      setFormData(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const res = await fetch(`/api/policies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clientName: data.clientName || null,
          stateCode: data.stateCode,
          policyNumber: data.policyNumber || null,
          carrier: data.carrier || null,
          coverageType: data.coverageType,
          status: data.status,
          premiumAmount: data.premiumAmount ? Math.round(parseFloat(data.premiumAmount) * 100) : null,
          coverageAmount: data.coverageAmount ? parseInt(data.coverageAmount, 10) : null,
          effectiveDate: data.effectiveDate || null,
          expirationDate: data.expirationDate || null,
          notes: data.notes || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update policy");
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
      setView("list");
      setEditingPolicy(null);
      setFormData(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/policies/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete policy");
    },
    onSuccess: () => {
      invalidateAll();
      setDeletingId(null);
    },
  });

  // Form helpers
  const openAddForm = () => {
    setEditingPolicy(null);
    setFormData(EMPTY_FORM);
    setErrors({});
    setOpenDateField(null);
    setView("form");
  };

  const openEditForm = (policy: AgentPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      clientName: policy.clientName || "",
      stateCode: policy.stateCode,
      policyNumber: policy.policyNumber || "",
      carrier: policy.carrier || "",
      coverageType: policy.coverageType || "term_life",
      status: policy.status,
      premiumAmount: policy.premiumAmount ? (policy.premiumAmount / 100).toString() : "",
      coverageAmount: policy.coverageAmount ? policy.coverageAmount.toString() : "",
      effectiveDate: policy.effectiveDate || "",
      expirationDate: policy.expirationDate || "",
      notes: policy.notes || "",
    });
    setErrors({});
    setOpenDateField(null);
    setView("form");
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientName.trim()) newErrors.clientName = "Client name is required";
    if (!formData.stateCode) newErrors.stateCode = "Select a state";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editingPolicy) {
      updateMutation.mutate({ id: editingPolicy.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // All states sorted alphabetically
  const sortedStates = useMemo(() => {
    return [...US_STATES].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl p-0 border-0 overflow-hidden [&>button.absolute]:hidden"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 24,
          boxShadow: "0 16px 24px rgba(0, 0, 0, 0.08)",
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Manage Policies</DialogTitle>
          <DialogDescription>Add, edit, and manage your insurance policies</DialogDescription>
        </DialogHeader>

        {/* Custom header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            {view === "form" && (
              <button
                onClick={() => { setView("list"); setEditingPolicy(null); setFormData(EMPTY_FORM); setOpenDateField(null); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <FileCheck className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {view === "list"
                  ? "Manage Policies"
                  : editingPolicy
                    ? `Edit Policy — ${editingPolicy.clientName || ABBREV_TO_NAME[editingPolicy.stateCode] || editingPolicy.stateCode}`
                    : "Add Policy"
                }
              </h2>
              <p className="text-xs text-gray-500">
                {view === "list"
                  ? `${policies.length} polic${policies.length !== 1 ? "ies" : "y"} on file`
                  : editingPolicy
                    ? "Update policy details below"
                    : "Enter your policy information"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        {view === "list" ? (
          <div className="flex flex-col" style={{ maxHeight: "60vh" }}>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
              </div>
            ) : policies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div
                  className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4"
                >
                  <FileCheck className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No policies yet</h3>
                <p className="text-sm text-gray-500 text-center mb-6 max-w-xs">
                  Add your insurance policies to track coverage across states and monitor premiums.
                </p>
                <Button
                  onClick={openAddForm}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Policy
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 px-6">
                  <div className="py-4 space-y-2">
                    {sortedPolicies.map((policy) => (
                      <div
                        key={policy.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                            style={{
                              backgroundColor: policy.status === "active"
                                ? COLORS.primary.violet[100]
                                : policy.status === "pending"
                                  ? COLORS.accent.amber[100]
                                  : COLORS.gray[100],
                              color: policy.status === "active"
                                ? COLORS.primary.violet[700]
                                : policy.status === "pending"
                                  ? COLORS.accent.amber[700]
                                  : COLORS.gray[500],
                            }}
                          >
                            {policy.stateCode}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-900 text-sm">
                                {policy.clientName || "Unnamed Client"}
                              </span>
                              <Badge
                                className={cn("border-0 text-xs capitalize", STATUS_STYLES[policy.status] || STATUS_STYLES.cancelled)}
                                style={{ borderRadius: RADIUS.pill }}
                              >
                                {policy.status}
                              </Badge>
                              <ExpirationBadge expirationDate={policy.expirationDate} />
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <span className="text-xs text-gray-400">
                                {ABBREV_TO_NAME[policy.stateCode] || policy.stateCode}
                              </span>
                              {policy.carrier && (
                                <span className="text-xs text-gray-500">{policy.carrier}</span>
                              )}
                              {policy.policyNumber && (
                                <span className="text-xs text-gray-400">#{policy.policyNumber}</span>
                              )}
                              {policy.coverageType && (
                                <span className="text-xs text-gray-400">
                                  {COVERAGE_TYPES.find((t) => t.value === policy.coverageType)?.label || policy.coverageType}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {policy.premiumAmount != null && policy.premiumAmount > 0 && (
                                <span className="text-xs text-violet-600 font-medium">
                                  {formatCurrency(policy.premiumAmount)}/mo
                                </span>
                              )}
                              {policy.coverageAmount != null && policy.coverageAmount > 0 && (
                                <span className="text-xs text-gray-500">
                                  {formatDollars(policy.coverageAmount)} coverage
                                </span>
                              )}
                              {policy.effectiveDate && (
                                <span className="text-xs text-gray-400">
                                  {policy.effectiveDate}
                                  {policy.expirationDate ? ` → ${policy.expirationDate}` : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                          {deletingId === policy.id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-red-600 mr-1">Delete?</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeletingId(null)}
                                className="h-7 px-2 text-xs text-gray-500"
                              >
                                No
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteMutation.mutate(policy.id)}
                                className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Yes"
                                )}
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditForm(policy)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                                style={{ borderRadius: 10 }}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeletingId(policy.id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                style={{ borderRadius: 10 }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Footer with Add button */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {policies.filter((p) => p.status === "active").length} active
                    {policies.some((p) => getDaysUntilExpiration(p.expirationDate) !== null && getDaysUntilExpiration(p.expirationDate)! <= 30)
                      ? " · some expiring soon"
                      : ""}
                  </p>
                  <Button
                    onClick={openAddForm}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                    style={{ borderRadius: RADIUS.button }}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Policy
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Form view */
          <div className="flex flex-col" style={{ maxHeight: "75vh" }}>
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5 space-y-4">
                {/* Client Name + State (side by side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.clientName}
                      onChange={(e) => {
                        setFormData({ ...formData, clientName: e.target.value });
                        if (errors.clientName) setErrors({ ...errors, clientName: "" });
                      }}
                      placeholder="e.g. John Doe"
                      className={cn("h-11", errors.clientName && "border-red-300")}
                      style={{ borderRadius: RADIUS.input }}
                    />
                    {errors.clientName && (
                      <p className="text-xs text-red-500">{errors.clientName}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.stateCode}
                      onValueChange={(v) => {
                        setFormData({ ...formData, stateCode: v });
                        if (errors.stateCode) setErrors({ ...errors, stateCode: "" });
                      }}
                    >
                      <SelectTrigger
                        className={cn("h-11", errors.stateCode && "border-red-300")}
                        style={{ borderRadius: RADIUS.input }}
                      >
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[240px]">
                        {sortedStates.map((state) => (
                          <SelectItem key={state.abbreviation} value={state.abbreviation}>
                            {state.name} ({state.abbreviation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.stateCode && (
                      <p className="text-xs text-red-500">{errors.stateCode}</p>
                    )}
                  </div>
                </div>

                {/* Policy Number + Carrier (side by side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Policy Number</label>
                    <Input
                      value={formData.policyNumber}
                      onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                      placeholder="e.g. POL-123456"
                      className="h-11"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Carrier</label>
                    <Input
                      value={formData.carrier}
                      onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                      placeholder="e.g. Mutual of Omaha"
                      className="h-11"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                </div>

                {/* Coverage Type + Status (side by side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Coverage Type</label>
                    <Select
                      value={formData.coverageType}
                      onValueChange={(v) => setFormData({ ...formData, coverageType: v })}
                    >
                      <SelectTrigger className="h-11" style={{ borderRadius: RADIUS.input }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COVERAGE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger className="h-11" style={{ borderRadius: RADIUS.input }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    opt.value === "active" ? "#10b981"
                                      : opt.value === "pending" ? "#f59e0b"
                                        : opt.value === "lapsed" ? "#ef4444"
                                          : opt.value === "expired" ? "#ef4444"
                                            : "#9ca3af",
                                }}
                              />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Premium + Coverage Amount (side by side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Monthly Premium ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        value={formData.premiumAmount}
                        onChange={(e) => setFormData({ ...formData, premiumAmount: e.target.value })}
                        placeholder="0.00"
                        className="h-11 pl-9"
                        style={{ borderRadius: RADIUS.input }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Coverage Amount ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        value={formData.coverageAmount}
                        onChange={(e) => setFormData({ ...formData, coverageAmount: e.target.value })}
                        placeholder="0"
                        className="h-11 pl-9"
                        style={{ borderRadius: RADIUS.input }}
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Date triggers side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <DateTrigger
                    label="Effective Date"
                    value={formData.effectiveDate}
                    active={openDateField === "effective"}
                    onToggle={() => setOpenDateField(openDateField === "effective" ? null : "effective")}
                    onClear={() => setFormData({ ...formData, effectiveDate: "" })}
                  />
                  <DateTrigger
                    label="Expiration Date"
                    value={formData.expirationDate}
                    active={openDateField === "expiration"}
                    onToggle={() => setOpenDateField(openDateField === "expiration" ? null : "expiration")}
                    onClear={() => setFormData({ ...formData, expirationDate: "" })}
                  />
                </div>

                {/* Calendar panel — full width, renders below triggers */}
                {openDateField && (
                  <div
                    ref={calendarRef}
                    className="border border-gray-200 bg-white shadow-lg flex flex-col items-center"
                    style={{ borderRadius: RADIUS.card }}
                  >
                    {/* Expiration presets */}
                    {openDateField === "expiration" && formData.effectiveDate && (
                      <div className="flex items-center justify-center gap-2 w-full px-4 pt-4 pb-0">
                        {(() => {
                          const base = new Date(formData.effectiveDate + "T00:00:00");
                          const y1 = new Date(base); y1.setFullYear(y1.getFullYear() + 1);
                          const y2 = new Date(base); y2.setFullYear(y2.getFullYear() + 2);
                          const y3 = new Date(base); y3.setFullYear(y3.getFullYear() + 3);
                          return [
                            { label: "+1 yr", date: y1 },
                            { label: "+2 yr", date: y2 },
                            { label: "+3 yr", date: y3 },
                          ];
                        })().map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, expirationDate: toISODate(p.date) });
                              setOpenDateField(null);
                            }}
                            className="text-xs px-3 py-1.5 bg-violet-50 text-violet-600 hover:bg-violet-100 font-medium transition-colors flex-1 text-center"
                            style={{ borderRadius: RADIUS.input }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={
                        openDateField === "effective"
                          ? (formData.effectiveDate ? new Date(formData.effectiveDate + "T00:00:00") : undefined)
                          : (formData.expirationDate ? new Date(formData.expirationDate + "T00:00:00") : undefined)
                      }
                      defaultMonth={
                        openDateField === "effective"
                          ? (formData.effectiveDate ? new Date(formData.effectiveDate + "T00:00:00") : new Date())
                          : (formData.expirationDate ? new Date(formData.expirationDate + "T00:00:00") : new Date())
                      }
                      startMonth={new Date(2020, 0)}
                      endMonth={new Date(2035, 11)}
                      onSelect={(date) => {
                        const iso = date ? toISODate(date) : "";
                        if (openDateField === "effective") {
                          setFormData({ ...formData, effectiveDate: iso });
                        } else {
                          setFormData({ ...formData, expirationDate: iso });
                        }
                        setOpenDateField(null);
                      }}
                      className="!p-4 !pb-6 !w-full [--cell-size:2.75rem]"
                      classNames={CALENDAR_CLASS_NAMES}
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes about this policy..."
                    rows={3}
                    className="resize-none"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
              </div>
            </div>

            {/* Form footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => { setView("list"); setEditingPolicy(null); setFormData(EMPTY_FORM); setOpenDateField(null); }}
                style={{ borderRadius: RADIUS.button }}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                style={{ borderRadius: RADIUS.button }}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : editingPolicy ? (
                  "Update Policy"
                ) : (
                  "Add Policy"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ManagePoliciesModal;
