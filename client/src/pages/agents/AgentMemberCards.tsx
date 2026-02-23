/**
 * Agent Member Cards Page
 * Issue and manage Heritage Life Solutions digital insurance cards
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
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
  Eye,
  Ban,
  Download,
  Mail,
  Smartphone,
  Filter,
  MoreVertical,
  Users,
  TrendingUp,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/agent/primitives";
import { toast } from "sonner";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
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
  active: { label: "Active", icon: CheckCircle2, color: "bg-green-500/10 text-green-600 border-green-200" },
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
  revoked: { label: "Revoked", icon: Ban, color: "bg-red-500/10 text-red-600 border-red-200" },
  expired: { label: "Expired", icon: XCircle, color: "bg-gray-500/10 text-gray-600 border-gray-200" },
};


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
    { label: "Total Cards", value: stats?.total ?? 0, icon: CreditCard, color: "text-indigo-600" },
    { label: "Active", value: stats?.active ?? 0, icon: CheckCircle2, color: "text-green-600" },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock, color: "text-yellow-600" },
    { label: "Revoked", value: stats?.revoked ?? 0, icon: Ban, color: "text-red-600" },
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
            className="border-0 bg-white/80 backdrop-blur cursor-pointer"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-gray-50", item.color)}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
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
    <motion.div
      variants={fadeInUp}
      className="group"
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover }}
    >
      <Card
        className="border-0 hover:shadow-lg transition-all cursor-pointer bg-white/90 backdrop-blur"
        style={{
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Card Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>

              {/* Card Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{card.memberFullName}</h3>
                  <Badge variant="outline" className={cn("text-xs", status.color)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>{card.memberCardNumber}</span>
                  <span className="text-gray-300">|</span>
                  <span>{getCarrierLabel(card.insuranceCarrier)}</span>
                  <span className="text-gray-300">|</span>
                  <span>{formatCurrency(card.coverageAmount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Send to member
                  toast.info("Notification sent to member");
                }}
              >
                <Mail className="w-4 h-4" />
              </Button>
              {card.status === "active" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevoke();
                  }}
                >
                  <Ban className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

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
  const [formData, setFormData] = useState<IssueCardFormData>({
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
  });

  const isTermPolicy = formData.policyType === "term_life";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof IssueCardFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Issue Member Card
          </DialogTitle>
          <DialogDescription>
            Create a new Heritage Life Solutions digital insurance card for a member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
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
                />
              </div>
              <div>
                <Label htmlFor="memberPhone">Phone</Label>
                <Input
                  id="memberPhone"
                  value={formData.memberPhone}
                  onChange={(e) => updateField("memberPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Policy Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Policy Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuranceCarrier">Insurance Carrier *</Label>
                <Select
                  value={formData.insuranceCarrier}
                  onValueChange={(v) => updateField("insuranceCarrier", v)}
                >
                  <SelectTrigger>
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
                />
              </div>
              <div>
                <Label htmlFor="policyType">Policy Type *</Label>
                <Select
                  value={formData.policyType}
                  onValueChange={(v) => updateField("policyType", v)}
                >
                  <SelectTrigger>
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
                />
              </div>
              {isTermPolicy && (
                <div>
                  <Label htmlFor="termLength">Term Length *</Label>
                  <Select
                    value={formData.termLength}
                    onValueChange={(v) => updateField("termLength", v)}
                  >
                    <SelectTrigger>
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
                  <SelectTrigger>
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
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
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
                />
              </div>
              <div>
                <Label htmlFor="beneficiaryRelationship">Relationship</Label>
                <Select
                  value={formData.beneficiaryRelationship}
                  onValueChange={(v) => updateField("beneficiaryRelationship", v)}
                >
                  <SelectTrigger>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            >
              {isLoading ? "Issuing..." : "Issue Card"}
            </Button>
          </DialogFooter>
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
  if (!card) return null;

  const status = STATUS_CONFIG[card.status];
  const StatusIcon = status.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Card Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Card Preview */}
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.hero,
            }}
          >
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Shield className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-lg font-bold tracking-wide">HERITAGE</p>
                    <p className="text-xs opacity-80">LIFE SOLUTIONS</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn("border-white/30 text-white", status.color.replace('text-', 'text-white'))}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-xl font-semibold">{card.memberFullName}</p>
              <p className="text-sm opacity-80 font-mono mt-1">{card.memberCardNumber}</p>
            </div>
            <div className="bg-white p-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Coverage</p>
                  <p className="font-semibold text-indigo-600">{formatCurrency(card.coverageAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Effective</p>
                  <p className="font-medium">{formatDate(card.effectiveDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Policy Information</h3>
            <div className="space-y-3">
              <DetailRow label="Policy Number" value={card.policyNumber} />
              <DetailRow label="Carrier" value={getCarrierLabel(card.insuranceCarrier)} />
              <DetailRow label="Policy Type" value={getPolicyTypeLabel(card.policyType)} />
              <DetailRow label="Monthly Premium" value={formatCurrency(card.monthlyPremium)} />
              {card.termLength && <DetailRow label="Term Length" value={card.termLength} />}
              {card.expirationDate && <DetailRow label="Expiration" value={formatDate(card.expirationDate)} />}
              <DetailRow label="Coverage Type" value={card.coverageType} className="capitalize" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Beneficiary</h3>
            <div className="space-y-3">
              <DetailRow label="Name" value={card.beneficiaryName} />
              {card.beneficiaryRelationship && (
                <DetailRow label="Relationship" value={card.beneficiaryRelationship} className="capitalize" />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Member Contact</h3>
            <div className="space-y-3">
              <DetailRow label="Email" value={card.memberEmail} />
              {card.memberPhone && <DetailRow label="Phone" value={card.memberPhone} />}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => toast.info("Sending notification...")}>
              <Mail className="w-4 h-4 mr-2" />
              Send to Member
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => toast.info("Downloading PDF...")}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
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

  // Filter cards
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
        {/* Hero Card */}
        <motion.div
          variants={fadeInUp}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
          transition={{ duration: MOTION.duration.hover }}
        >
          <Card
            className="border-0 overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white"
            style={{
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
            }}
          >
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-white/20 backdrop-blur">
                    <CreditCard className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Member Cards</h1>
                    <p className="text-white/80 mt-1">
                      Issue and manage Heritage Life Solutions digital insurance cards
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowIssueDialog(true)}
                  className="bg-white text-violet-600 hover:bg-white/90 shadow-lg font-semibold"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Issue New Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Filters */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 bg-white/80 backdrop-blur"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, card number, or policy..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cards List */}
        <motion.div variants={fadeInUp} className="space-y-3">
          {cardsLoading ? (
            // Loading skeleton
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="border-0 animate-pulse"
                  style={{
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCards.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title={searchQuery || statusFilter !== "all" ? "No cards found" : "No cards issued yet"}
              description={
                searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Issue your first member card to get started"
              }
              action={
                !searchQuery && statusFilter === "all" ? (
                  <Button onClick={() => setShowIssueDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Issue First Card
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                className="space-y-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredCards.map((card) => (
                  <CardRow
                    key={card.id}
                    card={card}
                    onClick={() => setSelectedCard(card)}
                    onRevoke={() => revokeCard.mutate(card.id)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
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
