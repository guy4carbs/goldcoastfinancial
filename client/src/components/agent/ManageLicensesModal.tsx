/**
 * ManageLicensesModal — CRUD modal for agent state licenses
 *
 * List view: shows all licenses with status, expiration warnings, edit/delete
 * Form view: add or edit a license with state picker, dates, status
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
  Shield,
  MapPin,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { US_STATES, ABBREV_TO_NAME } from "@/components/maps/usStatesPaths";
import { RADIUS, COLORS } from "@/lib/heritageDesignSystem";
import { cn } from "@/lib/utils";
import type { AgentLicense } from "@shared/models/licenses";

interface ManageLicensesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalView = "list" | "form";

const LICENSE_TYPES = [
  { value: "life_health", label: "Life & Health" },
  { value: "life_only", label: "Life Only" },
  { value: "health_only", label: "Health Only" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "expired", label: "Expired" },
  { value: "suspended", label: "Suspended" },
];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  expired: "bg-red-100 text-red-700",
  suspended: "bg-gray-100 text-gray-600",
};

interface FormData {
  stateCode: string;
  licenseNumber: string;
  licenseType: string;
  status: string;
  effectiveDate: string;
  expirationDate: string;
  notes: string;
}

const EMPTY_FORM: FormData = {
  stateCode: "",
  licenseNumber: "",
  licenseType: "life_health",
  status: "active",
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

export function ManageLicensesModal({ open, onOpenChange }: ManageLicensesModalProps) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<ModalView>("list");
  const [editingLicense, setEditingLicense] = useState<AgentLicense | null>(null);
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
      setEditingLicense(null);
      setFormData(EMPTY_FORM);
      setErrors({});
      setDeletingId(null);
      setOpenDateField(null);
    }
  }, [open]);

  // Fetch licenses
  const { data: licenses = [], isLoading } = useQuery<AgentLicense[]>({
    queryKey: ["/api/licenses"],
    queryFn: async () => {
      const res = await fetch("/api/licenses", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch licenses");
      return res.json();
    },
    enabled: open,
  });

  // Sorted licenses: active first, then pending, then by state
  const sortedLicenses = useMemo(() => {
    const order: Record<string, number> = { active: 0, pending: 1, expired: 2, suspended: 3 };
    return [...licenses].sort((a, b) => {
      const statusDiff = (order[a.status] ?? 4) - (order[b.status] ?? 4);
      if (statusDiff !== 0) return statusDiff;
      return a.stateCode.localeCompare(b.stateCode);
    });
  }, [licenses]);

  // States already licensed (to prevent duplicates)
  const licensedStates = useMemo(
    () => new Set(licenses.map((l) => l.stateCode)),
    [licenses]
  );

  // Mutations
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
    queryClient.invalidateQueries({ queryKey: ["/api/licenses/summary"] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          stateCode: data.stateCode,
          licenseNumber: data.licenseNumber || null,
          licenseType: data.licenseType,
          status: data.status,
          effectiveDate: data.effectiveDate || null,
          expirationDate: data.expirationDate || null,
          notes: data.notes || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create license");
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
      const res = await fetch(`/api/licenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          stateCode: data.stateCode,
          licenseNumber: data.licenseNumber || null,
          licenseType: data.licenseType,
          status: data.status,
          effectiveDate: data.effectiveDate || null,
          expirationDate: data.expirationDate || null,
          notes: data.notes || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update license");
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
      setView("list");
      setEditingLicense(null);
      setFormData(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/licenses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete license");
    },
    onSuccess: () => {
      invalidateAll();
      setDeletingId(null);
    },
  });

  // Form helpers
  const openAddForm = () => {
    setEditingLicense(null);
    setFormData(EMPTY_FORM);
    setErrors({});
    setView("form");
  };

  const openEditForm = (license: AgentLicense) => {
    setEditingLicense(license);
    setFormData({
      stateCode: license.stateCode,
      licenseNumber: license.licenseNumber || "",
      licenseType: license.licenseType || "life_health",
      status: license.status,
      effectiveDate: license.effectiveDate || "",
      expirationDate: license.expirationDate || "",
      notes: license.notes || "",
    });
    setErrors({});
    setView("form");
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.stateCode) newErrors.stateCode = "Select a state";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editingLicense) {
      updateMutation.mutate({ id: editingLicense.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Available states for the dropdown (exclude already-licensed states in add mode)
  const availableStates = useMemo(() => {
    return US_STATES.filter(
      (s) => editingLicense || !licensedStates.has(s.abbreviation)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [editingLicense, licensedStates]);

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
          <DialogTitle>Manage Licenses</DialogTitle>
          <DialogDescription>Add, edit, and manage your state licenses</DialogDescription>
        </DialogHeader>

        {/* Custom header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            {view === "form" && (
              <button
                onClick={() => { setView("list"); setEditingLicense(null); setFormData(EMPTY_FORM); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Shield className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {view === "list"
                  ? "Manage Licenses"
                  : editingLicense
                    ? `Edit License — ${ABBREV_TO_NAME[editingLicense.stateCode] || editingLicense.stateCode}`
                    : "Add License"
                }
              </h2>
              <p className="text-xs text-gray-500">
                {view === "list"
                  ? `${licenses.length} license${licenses.length !== 1 ? "s" : ""} on file`
                  : editingLicense
                    ? "Update license details below"
                    : "Enter your state license information"
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
            ) : licenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div
                  className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4"
                >
                  <MapPin className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No licenses yet</h3>
                <p className="text-sm text-gray-500 text-center mb-6 max-w-xs">
                  Add your state licenses to track your territory coverage and keep expiration dates in check.
                </p>
                <Button
                  onClick={openAddForm}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First License
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 px-6">
                  <div className="py-4 space-y-2">
                    {sortedLicenses.map((license) => (
                      <div
                        key={license.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                            style={{
                              backgroundColor: license.status === "active"
                                ? COLORS.primary.violet[100]
                                : license.status === "pending"
                                  ? COLORS.accent.amber[100]
                                  : COLORS.gray[100],
                              color: license.status === "active"
                                ? COLORS.primary.violet[700]
                                : license.status === "pending"
                                  ? COLORS.accent.amber[700]
                                  : COLORS.gray[500],
                            }}
                          >
                            {license.stateCode}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 text-sm">
                                {ABBREV_TO_NAME[license.stateCode] || license.stateCode}
                              </span>
                              <Badge
                                className={cn("border-0 text-xs capitalize", STATUS_STYLES[license.status] || STATUS_STYLES.suspended)}
                                style={{ borderRadius: RADIUS.pill }}
                              >
                                {license.status}
                              </Badge>
                              <ExpirationBadge expirationDate={license.expirationDate} />
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {license.licenseNumber && (
                                <span className="text-xs text-gray-500">#{license.licenseNumber}</span>
                              )}
                              {license.licenseType && (
                                <span className="text-xs text-gray-400">
                                  {LICENSE_TYPES.find((t) => t.value === license.licenseType)?.label || license.licenseType}
                                </span>
                              )}
                              {license.effectiveDate && (
                                <span className="text-xs text-gray-400">
                                  {license.effectiveDate}
                                  {license.expirationDate ? ` → ${license.expirationDate}` : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                          {deletingId === license.id ? (
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
                                onClick={() => deleteMutation.mutate(license.id)}
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
                                onClick={() => openEditForm(license)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                                style={{ borderRadius: 10 }}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeletingId(license.id)}
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
                    {licenses.filter((l) => l.status === "active").length} active
                    {licenses.some((l) => getDaysUntilExpiration(l.expirationDate) !== null && getDaysUntilExpiration(l.expirationDate)! <= 30)
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
                    Add License
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
                {/* State */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.stateCode}
                    onValueChange={(v) => {
                      setFormData({ ...formData, stateCode: v });
                      setErrors({ ...errors, stateCode: "" });
                    }}
                    disabled={!!editingLicense}
                  >
                    <SelectTrigger
                      className={cn("h-11", errors.stateCode && "border-red-300")}
                      style={{ borderRadius: RADIUS.input }}
                    >
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[240px]">
                      {availableStates.map((state) => (
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

                {/* License Number + Type (side by side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">License Number</label>
                    <Input
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="e.g. 12345678"
                      className="h-11"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">License Type</label>
                    <Select
                      value={formData.licenseType}
                      onValueChange={(v) => setFormData({ ...formData, licenseType: v })}
                    >
                      <SelectTrigger className="h-11" style={{ borderRadius: RADIUS.input }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LICENSE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status + License Type row */}
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
                          if (!iso) {
                            setFormData({ ...formData, effectiveDate: "" });
                          } else {
                            const expiry = new Date(iso + "T00:00:00");
                            expiry.setFullYear(expiry.getFullYear() + 2);
                            setFormData({
                              ...formData,
                              effectiveDate: iso,
                              expirationDate: formData.expirationDate || toISODate(expiry),
                            });
                          }
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
                    placeholder="Optional notes about this license..."
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
                onClick={() => { setView("list"); setEditingLicense(null); setFormData(EMPTY_FORM); }}
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
                ) : editingLicense ? (
                  "Update License"
                ) : (
                  "Add License"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ManageLicensesModal;
