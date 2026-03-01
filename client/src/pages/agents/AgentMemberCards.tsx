/**
 * Agent Member Cards Page
 * Issue and manage Heritage Life Solutions digital insurance cards
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Download,
  Mail,
  Smartphone,
  Users,
  Shield,
  ChevronRight,
  DollarSign,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, AgentPageHero } from "@/components/agent/primitives";
import { toast } from "sonner";
import { RADIUS, SHADOW, GLASS, MOTION, COLORS, fadeInUp, staggerContainer } from '@/lib/heritageDesignSystem';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// =============================================================================
// TYPES
// =============================================================================

interface MemberCard {
  id: string;
  memberCardNumber: string;
  memberId: string;
  agentId: string;
  memberFullName: string;
  memberEmail: string;
  memberPhone?: string;
  insuranceCarrier: string;
  insuranceCarrierOther?: string;
  policyNumber: string;
  policyType: string;
  coverageAmount: string;
  monthlyPremium: string;
  effectiveDate: string;
  termLength?: string;
  expirationDate?: string;
  coverageType: string;
  beneficiaryName: string;
  beneficiaryRelationship?: string;
  status: "active" | "pending" | "revoked" | "expired";
  groupNumber: string;
  issuedAt: string;
  createdAt: string;
}

interface CardStats {
  total: number;
  active: number;
  pending: number;
  revoked: number;
}

interface IssueCardFormData {
  memberFullName: string;
  memberEmail: string;
  memberPhone: string;
  insuranceCarrier: string;
  insuranceCarrierOther: string;
  policyNumber: string;
  policyType: string;
  coverageAmount: string;
  monthlyPremium: string;
  effectiveDate: string;
  termLength: string;
  coverageType: string;
  beneficiaryName: string;
  beneficiaryRelationship: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CARRIERS = [
  { value: "mutual_of_omaha", label: "Mutual of Omaha" },
  { value: "americo", label: "Americo" },
  { value: "north_american", label: "North American" },
  { value: "national_life_group", label: "National Life Group" },
  { value: "foresters", label: "Foresters" },
  { value: "transamerica", label: "Transamerica" },
  { value: "aig", label: "AIG" },
  { value: "protective_life", label: "Protective Life" },
  { value: "lincoln_financial", label: "Lincoln Financial" },
  { value: "prudential", label: "Prudential" },
  { value: "other", label: "Other" },
];

const POLICY_TYPES = [
  { value: "term_life", label: "Term Life" },
  { value: "whole_life", label: "Whole Life" },
  { value: "iul", label: "Indexed Universal Life (IUL)" },
  { value: "final_expense", label: "Final Expense" },
  { value: "annuity", label: "Annuity" },
];

const TERM_LENGTHS = [
  { value: "10", label: "10 Year" },
  { value: "15", label: "15 Year" },
  { value: "20", label: "20 Year" },
  { value: "25", label: "25 Year" },
  { value: "30", label: "30 Year" },
];

const RELATIONSHIPS = [
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "other", label: "Other" },
];

const STATUS_CONFIG = {
  active: { label: "Active", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700 border-0" },
  pending: { label: "Pending", icon: Clock, color: "bg-amber-100 text-amber-700 border-0" },
  revoked: { label: "Revoked", icon: Ban, color: "bg-red-100 text-red-700 border-0" },
  expired: { label: "Expired", icon: XCircle, color: "bg-gray-100 text-gray-600 border-0" },
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "revoked", label: "Revoked" },
  { value: "expired", label: "Expired" },
];

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getCarrierLabel(value: string): string {
  return CARRIERS.find((c) => c.value === value)?.label || value;
}

function getPolicyTypeLabel(value: string): string {
  return POLICY_TYPES.find((p) => p.value === value)?.label || value;
}

// =============================================================================
// API HOOKS
// =============================================================================

function useMemberCards() {
  return useQuery<MemberCard[]>({
    queryKey: ["member-cards"],
    queryFn: async () => {
      const res = await fetch("/api/member-cards", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cards");
      return res.json();
    },
  });
}

function useCardStats() {
  return useQuery<CardStats>({
    queryKey: ["member-cards", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/member-cards/stats/summary", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
}

function useIssueCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IssueCardFormData) => {
      const res = await fetch("/api/member-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          coverageAmount: parseFloat(data.coverageAmount.replace(/[,$]/g, "")),
          monthlyPremium: parseFloat(data.monthlyPremium.replace(/[,$]/g, "")),
          termLength: data.termLength ? `${data.termLength} Year` : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to issue card");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-cards"] });
      toast.success("Member card issued successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

function useRevokeCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cardId: string) => {
      const res = await fetch(`/api/member-cards/${cardId}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: "Revoked by agent" }),
      });
      if (!res.ok) throw new Error("Failed to revoke card");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-cards"] });
      toast.success("Card revoked successfully");
    },
    onError: () => {
      toast.error("Failed to revoke card");
    },
  });
}

// =============================================================================
// COMPONENTS
// =============================================================================

function StatsCards({ stats }: { stats?: CardStats }) {
  const items = [
    { label: "Total Cards", value: stats?.total ?? 0, icon: CreditCard },
    { label: "Active", value: stats?.active ?? 0, icon: CheckCircle2 },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock },
    { label: "Revoked", value: stats?.revoked ?? 0, icon: Ban },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.div
          key={item.label}
          variants={fadeInUp}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
          transition={{ duration: MOTION.duration.hover }}
        >
          <Card
            className="border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.card, boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
            <div style={{ width: 80, height: 80 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
            <div style={{ width: 50, height: 50 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/4" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-white/20 backdrop-blur">
                  <item.icon className="w-5 h-5 text-amber-200" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-xs text-white/70">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

function CardRow({ card, onClick, onRevoke }: { card: MemberCard; onClick: () => void; onRevoke: () => void }) {
  const status = STATUS_CONFIG[card.status];
  const StatusIcon = status.icon;

  return (
    <div
      className="group px-5 py-4 hover:bg-violet-50/40 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 flex items-center justify-center shadow-lg shadow-violet-500/20 bg-gradient-to-br from-violet-500 to-purple-600"
          style={{ borderRadius: RADIUS.button }}
        >
          <CreditCard className="w-5 h-5 text-amber-200" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">{card.memberFullName}</p>
            <Badge
              className={cn("text-[10px]", status.color)}
              style={{ borderRadius: RADIUS.pill }}
            >
              <StatusIcon className="w-3 h-3 mr-1" aria-hidden="true" />
              {status.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {card.memberCardNumber} &middot; {getCarrierLabel(card.insuranceCarrier)}
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <p className="font-semibold text-violet-700">{formatCurrency(card.coverageAmount)}</p>
          <p className="text-xs text-gray-400">{formatCurrency(card.monthlyPremium)}/mo</p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="text-violet-700 hover:bg-violet-50"
            style={{ borderRadius: RADIUS.button }}
            onClick={(e) => {
              e.stopPropagation();
              toast.info("Notification sent to member");
            }}
          >
            <Mail className="w-4 h-4" />
          </Button>
          {card.status === "active" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              style={{ borderRadius: RADIUS.button }}
              onClick={(e) => {
                e.stopPropagation();
                onRevoke();
              }}
            >
              <Ban className="w-4 h-4" />
            </Button>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
    </div>
  );
}

const EMPTY_FORM: IssueCardFormData = {
  memberFullName: "",
  memberEmail: "",
  memberPhone: "",
  insuranceCarrier: "",
  insuranceCarrierOther: "",
  policyNumber: "",
  policyType: "",
  coverageAmount: "",
  monthlyPremium: "",
  effectiveDate: "",
  termLength: "",
  coverageType: "individual",
  beneficiaryName: "",
  beneficiaryRelationship: "",
};

function IssueCardDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: IssueCardFormData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<IssueCardFormData>(EMPTY_FORM);

  const isTermPolicy = formData.policyType === "term_life";

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof IssueCardFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(v); }}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-0 [&>button.absolute]:hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: RADIUS.card,
          boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)',
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <CreditCard className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <span className="text-lg font-semibold text-gray-900">Issue Member Card</span>
                <p className="text-xs text-gray-500 font-normal">
                  Create a new Heritage Life Solutions digital insurance card
                </p>
              </div>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              style={{ borderRadius: RADIUS.button }}
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Member Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              Member Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="memberFullName">Full Name *</Label>
                <Input
                  id="memberFullName"
                  value={formData.memberFullName}
                  onChange={(e) => updateField("memberFullName", e.target.value)}
                  placeholder="John Smith"
                  required
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div>
                <Label htmlFor="memberEmail">Email *</Label>
                <Input
                  id="memberEmail"
                  type="email"
                  value={formData.memberEmail}
                  onChange={(e) => updateField("memberEmail", e.target.value)}
                  placeholder="john@example.com"
                  required
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div>
                <Label htmlFor="memberPhone">Phone</Label>
                <Input
                  id="memberPhone"
                  value={formData.memberPhone}
                  onChange={(e) => updateField("memberPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            </div>
          </div>

          {/* Policy Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-500" />
              Policy Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuranceCarrier">Insurance Carrier *</Label>
                <Select
                  value={formData.insuranceCarrier}
                  onValueChange={(v) => updateField("insuranceCarrier", v)}
                >
                  <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARRIERS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.insuranceCarrier === "other" && (
                <div>
                  <Label htmlFor="insuranceCarrierOther">Carrier Name *</Label>
                  <Input
                    id="insuranceCarrierOther"
                    value={formData.insuranceCarrierOther}
                    onChange={(e) => updateField("insuranceCarrierOther", e.target.value)}
                    placeholder="Enter carrier name"
                    required
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="policyNumber">Policy Number *</Label>
                <Input
                  id="policyNumber"
                  value={formData.policyNumber}
                  onChange={(e) => updateField("policyNumber", e.target.value)}
                  placeholder="POL-123456789"
                  required
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div>
                <Label htmlFor="policyType">Policy Type *</Label>
                <Select
                  value={formData.policyType}
                  onValueChange={(v) => updateField("policyType", v)}
                >
                  <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_TYPES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="coverageAmount">Coverage Amount *</Label>
                <Input
                  id="coverageAmount"
                  value={formData.coverageAmount}
                  onChange={(e) => updateField("coverageAmount", e.target.value)}
                  placeholder="$500,000"
                  required
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div>
                <Label htmlFor="monthlyPremium">Monthly Premium *</Label>
                <Input
                  id="monthlyPremium"
                  value={formData.monthlyPremium}
                  onChange={(e) => updateField("monthlyPremium", e.target.value)}
                  placeholder="$125.00"
                  required
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div>
                <Label htmlFor="effectiveDate">Effective Date *</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => updateField("effectiveDate", e.target.value)}
                  required
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              {isTermPolicy && (
                <div>
                  <Label htmlFor="termLength">Term Length *</Label>
                  <Select
                    value={formData.termLength}
                    onValueChange={(v) => updateField("termLength", v)}
                  >
                    <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {TERM_LENGTHS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="coverageType">Coverage Type</Label>
                <Select
                  value={formData.coverageType}
                  onValueChange={(v) => updateField("coverageType", v)}
                >
                  <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Beneficiary Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              Beneficiary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="beneficiaryName">Beneficiary Name *</Label>
                <Input
                  id="beneficiaryName"
                  value={formData.beneficiaryName}
                  onChange={(e) => updateField("beneficiaryName", e.target.value)}
                  placeholder="Jane Smith"
                  required
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div>
                <Label htmlFor="beneficiaryRelationship">Relationship</Label>
                <Select
                  value={formData.beneficiaryRelationship}
                  onValueChange={(v) => updateField("beneficiaryRelationship", v)}
                >
                  <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="text-violet-700 border-violet-200 hover:bg-violet-50"
              style={{ borderRadius: RADIUS.button }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              style={{ borderRadius: RADIUS.button }}
            >
              {isLoading ? "Issuing..." : "Issue Card"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CardDetailSheet({
  card,
  open,
  onOpenChange,
}: {
  card: MemberCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [walletLoading, setWalletLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  if (!card) return null;

  const status = STATUS_CONFIG[card.status];
  const StatusIcon = status.icon;

  const handleAddToWallet = async () => {
    setWalletLoading(true);
    try {
      const res = await fetch("/api/wallet/pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          memberId: card.memberId,
          memberName: card.memberFullName,
          policyNumber: card.policyNumber,
          insuranceCarrier: getCarrierLabel(card.insuranceCarrier),
          coverageAmount: formatCurrency(card.coverageAmount),
          planType: getPolicyTypeLabel(card.policyType),
          effectiveDate: card.effectiveDate,
          expirationDate: card.expirationDate,
          beneficiaryName: card.beneficiaryName,
          agentName: "Heritage Agent",
          dba: "heritage",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        if (err.setupRequired) {
          toast.info("Apple Wallet signing not configured yet");
          return;
        }
        throw new Error(err.error || "Failed to generate pass");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `heritage-${card.memberId}.pkpass`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Wallet pass downloaded");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate wallet pass");
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/member-cards/${card.id}/pdf`, {
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `heritage-card-${card.memberId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (err: any) {
      toast.error(err.message || "Failed to download PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSendToMember = async () => {
    setSendLoading(true);
    try {
      const res = await fetch(`/api/member-cards/${card.id}/send`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send notification");
      }
      const data = await res.json();
      if (data.method === "mailto") {
        window.location.href = data.mailto;
        toast.info("Opening email client...");
      } else {
        toast.success(`Card details sent to ${card.memberEmail || "member"}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send to member");
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-md overflow-y-auto border-0 p-0"
        style={{
          background: GLASS.backgroundLight,
          backdropFilter: `blur(${GLASS.blur}px)`,
          WebkitBackdropFilter: `blur(${GLASS.blur}px)`,
        }}
      >
        {/* Heritage gradient header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
          <div style={{ width: 100, height: 100 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
          <div style={{ width: 60, height: 60 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/4" />

          <SheetHeader className="relative z-10 p-6 pb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 bg-white/20 backdrop-blur flex items-center justify-center shadow-lg"
                style={{ borderRadius: RADIUS.button }}
              >
                <CreditCard className="w-6 h-6 text-amber-200" />
              </div>
              <div>
                <SheetTitle className="text-left text-white">{card.memberFullName}</SheetTitle>
                <Badge
                  className={cn("mt-1", status.color)}
                  style={{ borderRadius: RADIUS.pill }}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="space-y-5 p-6">
          {/* Card Preview */}
          <div
            className="relative overflow-hidden"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}
          >
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 p-6 text-white">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Shield className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-lg font-bold tracking-wide">HERITAGE</p>
                    <p className="text-xs text-white/80">LIFE SOLUTIONS</p>
                  </div>
                </div>
                <Badge
                  className="bg-white/20 text-white border-0 backdrop-blur"
                  style={{ borderRadius: RADIUS.pill }}
                >
                  {status.label}
                </Badge>
              </div>
              <p className="text-xl font-semibold">{card.memberFullName}</p>
              <p className="text-sm text-white/80 font-mono mt-1">{card.memberCardNumber}</p>
            </div>
            <div className="bg-white p-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Coverage</p>
                  <p className="font-semibold text-violet-700">{formatCurrency(card.coverageAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Effective</p>
                  <p className="font-medium">{formatDate(card.effectiveDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Policy Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Policy Information</h3>

            {/* Premium highlight */}
            <div className="relative overflow-hidden p-3" style={{ borderRadius: RADIUS.button }}>
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
              <div style={{ width: 60, height: 60 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <p className="text-xs text-white/70">Monthly Premium</p>
                  <p className="font-bold text-white text-lg">{formatCurrency(card.monthlyPremium)}/mo</p>
                </div>
              </div>
            </div>

            {/* Coverage highlight */}
            <div className="relative overflow-hidden p-3" style={{ borderRadius: RADIUS.button }}>
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
              <div style={{ width: 60, height: 60 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                  <Shield className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <p className="text-xs text-white/70">Coverage Amount</p>
                  <p className="font-bold text-white text-lg">{formatCurrency(card.coverageAmount)}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-violet-50 space-y-3" style={{ borderRadius: RADIUS.button }}>
              <DetailRow label="Policy Number" value={card.policyNumber} />
              <DetailRow label="Carrier" value={getCarrierLabel(card.insuranceCarrier)} />
              <DetailRow label="Policy Type" value={getPolicyTypeLabel(card.policyType)} />
              {card.termLength && <DetailRow label="Term Length" value={card.termLength} />}
              {card.expirationDate && <DetailRow label="Expiration" value={formatDate(card.expirationDate)} />}
              <DetailRow label="Coverage Type" value={card.coverageType} className="capitalize" />
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Beneficiary */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Beneficiary</h3>
            <div className="p-3 bg-violet-50 space-y-3" style={{ borderRadius: RADIUS.button }}>
              <DetailRow label="Name" value={card.beneficiaryName} />
              {card.beneficiaryRelationship && (
                <DetailRow label="Relationship" value={card.beneficiaryRelationship} className="capitalize" />
              )}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Member Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Member Contact</h3>
            <div className="p-3 bg-violet-50 space-y-3" style={{ borderRadius: RADIUS.button }}>
              <DetailRow label="Email" value={card.memberEmail} />
              {card.memberPhone && <DetailRow label="Phone" value={card.memberPhone} />}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-violet-700 border-violet-200 hover:bg-violet-50"
                style={{ borderRadius: RADIUS.button }}
                onClick={handleSendToMember}
                disabled={sendLoading}
              >
                <Mail className="w-4 h-4" />
                {sendLoading ? "Sending..." : "Send to Member"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-violet-700 border-violet-200 hover:bg-violet-50"
                style={{ borderRadius: RADIUS.button }}
                onClick={handleAddToWallet}
                disabled={walletLoading}
              >
                <Smartphone className="w-4 h-4" />
                {walletLoading ? "Generating..." : "Apple Wallet"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-violet-700 border-violet-200 hover:bg-violet-50"
                style={{ borderRadius: RADIUS.button }}
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
              >
                <Download className="w-4 h-4" />
                {pdfLoading ? "Generating..." : "Download PDF"}
              </Button>
              {card.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  style={{ borderRadius: RADIUS.button }}
                  onClick={() => toast.info("Use the list to revoke cards")}
                >
                  <Ban className="w-4 h-4" />
                  Revoke Card
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={cn("text-sm font-medium text-gray-900", className)}>{value}</span>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AgentMemberCards() {
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<MemberCard | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: cards, isLoading: cardsLoading } = useMemberCards();
  const { data: stats } = useCardStats();
  const issueCard = useIssueCard();
  const revokeCard = useRevokeCard();

  const filteredCards = (cards || []).filter((card) => {
    const matchesSearch =
      searchQuery === "" ||
      card.memberFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.memberCardNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.policyNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || card.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleIssueCard = (data: IssueCardFormData) => {
    issueCard.mutate(data, {
      onSuccess: () => {
        setShowIssueDialog(false);
      },
    });
  };

  return (
    <AgentLoungeLayout>
      <motion.div
        className="space-y-6 pb-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Hero */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={CreditCard}
            title="Member Cards"
            subtitle="Issue and manage Heritage Life Solutions digital insurance cards"
          >
            <Button
              onClick={() => setShowIssueDialog(true)}
              className="gap-2 text-white border-0 backdrop-blur-sm hover:scale-105 transition-transform"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: RADIUS.button,
              }}
            >
              <Plus className="w-4 h-4" />
              Issue New Card
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Search & Filter */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, card number, or policy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
              style={{ borderRadius: RADIUS.input }}
            />
          </div>
          <div
            className="flex gap-1 p-1"
            style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            role="group"
            aria-label="Filter cards by status"
          >
            {STATUS_FILTERS.map((s) => (
              <Button
                key={s.value}
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter(s.value)}
                className={cn(
                  "h-8 px-3 text-xs font-medium transition-all",
                  statusFilter === s.value
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
                style={{ borderRadius: RADIUS.button }}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Cards List */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardContent className="p-0">
              {cardsLoading ? (
                <div className="divide-y divide-gray-100">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="px-5 py-4 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 bg-gray-200"
                          style={{ borderRadius: RADIUS.button }}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                        <div className="hidden sm:block space-y-2 text-right">
                          <div className="h-4 bg-gray-200 rounded w-20 ml-auto" />
                          <div className="h-3 bg-gray-200 rounded w-16 ml-auto" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCards.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    icon={CreditCard}
                    title={searchQuery || statusFilter !== "all" ? "No cards found" : "No cards issued yet"}
                    description={
                      searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Issue your first member card to get started"
                    }
                    action={
                      !searchQuery && statusFilter === "all"
                        ? { label: "Issue First Card", onClick: () => setShowIssueDialog(true), icon: Plus }
                        : undefined
                    }
                  />
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredCards.map((card) => (
                    <CardRow
                      key={card.id}
                      card={card}
                      onClick={() => setSelectedCard(card)}
                      onRevoke={() => revokeCard.mutate(card.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Issue Card Dialog */}
      <IssueCardDialog
        open={showIssueDialog}
        onOpenChange={setShowIssueDialog}
        onSubmit={handleIssueCard}
        isLoading={issueCard.isPending}
      />

      {/* Card Detail Sheet */}
      <CardDetailSheet
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      />
    </AgentLoungeLayout>
  );
}
