import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAgentStore, type Quote } from "@/lib/agentStore";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Plus, Search, Clock, CheckCircle2, XCircle, Send, Eye,
  ChevronRight, Zap, GitCompare, X, Inbox, Shield, Lock, TrendingUp,
  Heart, DollarSign, Mail, MessageSquare, Smartphone, Monitor, Copy,
  CheckCircle, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, AgentPageHero } from "@/components/agent/primitives";
import { Pagination, usePagination } from "@/components/agent/primitives/Pagination";
import { CreateQuoteModal } from "@/components/agent/CreateQuoteModal";
import { QuoteDetailDrawer } from "@/components/agent/QuoteDetailDrawer";
import { toast } from "sonner";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer } from '@/lib/heritageDesignSystem';
import { TOUR } from "@/lib/tour/selectors";
import { CARRIER_BRANDING } from "@shared/carrierBranding";

// ─── Carrier Helpers ────────────────────────────────────────────────────────

const getCarrierColor = (carrierId: string): string =>
  CARRIER_BRANDING[carrierId]?.primaryColor || "#1E40AF";

const getCarrierGradient = (carrierId: string): { from: string; to: string } => {
  const b = CARRIER_BRANDING[carrierId];
  return { from: b?.gradientFrom || "#1E40AF", to: b?.gradientTo || "#3B82F6" };
};

// ─── Insurance Carriers ─────────────────────────────────────────────────────

const INSURANCE_CARRIERS = [
  { id: "aetna", name: "Aetna" },
  { id: "american-amicable", name: "American Amicable" },
  { id: "americo", name: "Americo Financial" },
  { id: "baltimore-life", name: "Baltimore Life" },
  { id: "banner-life", name: "Banner Life" },
  { id: "chubb", name: "Chubb" },
  { id: "corebridge", name: "Corebridge Financial" },
  { id: "mutual-of-omaha", name: "Mutual of Omaha" },
  { id: "ethos", name: "Ethos Life" },
  { id: "foresters", name: "Foresters" },
  { id: "globe-life", name: "Globe Life" },
  { id: "guarantee-trust", name: "Guarantee Trust" },
  { id: "instabrain", name: "InstaBrain" },
  { id: "lafayette-life", name: "Lafayette Life" },
  { id: "lumico", name: "Lumico" },
  { id: "royal-neighbors", name: "Royal Neighbors" },
  { id: "transamerica", name: "Transamerica" },
  { id: "american-home-life", name: "American Home Life" },
  { id: "polish-falcons", name: "Polish Falcons" },
  { id: "trinity-life", name: "Trinity Life" },
  { id: "united-home-life", name: "United Home Life" },
];

// ─── Quote Document Types ───────────────────────────────────────────────────

interface QuoteDocType {
  id: string;
  name: string;
  description: string;
  icon: typeof Shield;
  color: string;
  fields: string[];
  defaultBenefits: string[];
}

const QUOTE_DOCUMENT_TYPES: QuoteDocType[] = [
  {
    id: "term_life",
    name: "Term Life Insurance",
    description: "Level term coverage with guaranteed premiums",
    icon: Shield,
    color: "blue",
    fields: ["Coverage Amount", "Term Length", "Monthly Premium", "Health Class"],
    defaultBenefits: [
      "Guaranteed level premiums for the entire term",
      "Convertible to permanent insurance without medical exam",
      "Death benefit paid income tax-free to beneficiaries",
      "Accelerated death benefit rider included",
      "Option to add waiver of premium rider",
    ],
  },
  {
    id: "whole_life",
    name: "Whole Life Insurance",
    description: "Permanent coverage with cash value accumulation",
    icon: Lock,
    color: "emerald",
    fields: ["Coverage Amount", "Monthly Premium", "Cash Value Projection", "Dividend Option"],
    defaultBenefits: [
      "Guaranteed cash value accumulation",
      "Fixed premiums that never increase",
      "Tax-deferred cash value growth",
      "Potential annual dividend payments",
      "Loan availability against cash value",
      "Permanent lifetime coverage",
    ],
  },
  {
    id: "iul",
    name: "Indexed Universal Life",
    description: "Flexible premium with market-linked growth potential",
    icon: TrendingUp,
    color: "violet",
    fields: ["Target Premium", "Death Benefit", "Index Strategy", "Cap Rate"],
    defaultBenefits: [
      "Flexible premium payments",
      "Market-linked growth potential with downside protection",
      "Tax-free death benefit and tax-deferred growth",
      "0% floor rate protects against market losses",
      "Multiple index strategy options",
      "Living benefits and accelerated death benefit",
    ],
  },
  {
    id: "final_expense",
    name: "Final Expense",
    description: "Simplified issue whole life for end-of-life costs",
    icon: Heart,
    color: "rose",
    fields: ["Coverage Amount", "Monthly Premium", "Issue Type", "Waiting Period"],
    defaultBenefits: [
      "Simplified issue — no medical exam required",
      "Coverage typically $5,000 to $50,000",
      "Builds cash value over time",
      "Fixed premiums that never increase",
      "Immediate coverage or graded benefit options",
      "Covers funeral, burial, and end-of-life expenses",
    ],
  },
  {
    id: "annuity",
    name: "Annuity",
    description: "Tax-deferred retirement income solutions",
    icon: DollarSign,
    color: "amber",
    fields: ["Premium Amount", "Interest Rate", "Term", "Surrender Schedule"],
    defaultBenefits: [
      "Tax-deferred growth on earnings",
      "Guaranteed minimum interest rate",
      "Flexible payout options — lump sum, lifetime income, period certain",
      "Principal protection from market volatility",
      "Penalty-free withdrawal provisions",
      "Death benefit for beneficiaries",
    ],
  },
];

const HEALTH_CLASSES = [
  "Preferred Plus",
  "Preferred",
  "Standard Plus",
  "Standard",
  "Substandard",
];

// ─── Sent Quote Document Interface ──────────────────────────────────────────

interface SentQuoteDoc {
  id: string;
  quoteRef: string;
  quoteType: string;
  quoteTypeName: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  carrierId: string;
  carrierName: string;
  coverageAmount: string;
  premium: string;
  method: "email" | "sms" | "both";
  sentAt: Date;
  status: "sent" | "opened" | "expired";
  openedAt: string | null;
  expiresAt: string | null;
}

type SendMethod = "email" | "sms" | "both";
type PreviewTab = "email" | "sms" | "document";
type DevicePreview = "phone" | "desktop";

// ─── Existing Quote Management Helpers ──────────────────────────────────────

const MAX_COMPARE = 3;

const QUOTE_TEMPLATES = [
  { id: 't1', name: 'Basic Term 20', product: 'term' as const, term: 20, coverageAmount: 250000, monthlyPremium: 25 },
  { id: 't2', name: 'Family Protection', product: 'term' as const, term: 30, coverageAmount: 500000, monthlyPremium: 45 },
  { id: 't3', name: 'Mortgage Protection', product: 'term' as const, term: 20, coverageAmount: 300000, monthlyPremium: 35 },
  { id: 't4', name: 'Whole Life Starter', product: 'whole' as const, coverageAmount: 100000, monthlyPremium: 85 },
  { id: 't5', name: 'Final Expense Basic', product: 'final_expense' as const, coverageAmount: 15000, monthlyPremium: 30 },
];

type QuoteStatus = Quote['status'];

const statusConfig: Record<QuoteStatus, { label: string; icon: typeof Clock; color: string }> = {
  draft: { label: 'Draft', icon: FileText, color: 'bg-amber-100 text-amber-700' },
  sent: { label: 'Sent', icon: Send, color: 'bg-violet-100 text-violet-700' },
  viewed: { label: 'Viewed', icon: Eye, color: 'bg-purple-100 text-purple-700' },
  accepted: { label: 'Accepted', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
  expired: { label: 'Expired', icon: XCircle, color: 'bg-gray-100 text-gray-600' },
};

const productLabels: Record<Quote['product'], string> = {
  term: 'Term Life',
  whole: 'Whole Life',
  iul: 'IUL',
  final_expense: 'Final Expense',
};

function formatQuoteDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isExpired(expiresDate: string): boolean {
  return new Date(expiresDate) < new Date();
}

const EMPTY_QUOTES: Quote[] = [];

// ─── Currency Formatting ─────────────────────────────────────────────────────

const formatCurrency = (value: string): string => {
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return '$' + Number(digits).toLocaleString('en-US');
};

const handleCurrencyInput = (
  value: string,
  setter: (v: string) => void,
) => {
  setter(formatCurrency(value));
};

// ─── Time Formatting ────────────────────────────────────────────────────────

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════

export default function AgentQuotes() {
  const queryClient = useQueryClient();
  const {
    currentUser,
    quotes: storeQuotes,
    addQuote,
    updateQuoteStatus,
    createQuoteVersion,
    updateQuoteSignature,
  } = useAgentStore();

  // Agent info
  const agentName = currentUser?.name || "Agent";
  const agentEmail = currentUser?.email || "agent@heritagels.org";
  const agentPhone = currentUser?.phone || "(555) 000-0000";
  const agentFirstName = agentName.split(" ")[0];

  // ─── Send Quote Document State ──────────────────────────────────────────
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<QuoteDocType | null>(null);

  const [formClientName, setFormClientName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCarrier, setFormCarrier] = useState("");
  const [formCoverageAmount, setFormCoverageAmount] = useState("");
  const [formPremium, setFormPremium] = useState("");
  const [formPremiumFrequency, setFormPremiumFrequency] = useState<"monthly" | "annual">("monthly");
  const [formTermLength, setFormTermLength] = useState("");
  const [formHealthClass, setFormHealthClass] = useState("");
  const [formBenefits, setFormBenefits] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formSendMethod, setFormSendMethod] = useState<SendMethod>("email");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("email");
  const [devicePreview, setDevicePreview] = useState<DevicePreview>("phone");
  const [isSending, setIsSending] = useState(false);

  // ─── Manage Quotes State ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateQuote, setShowCreateQuote] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showQuoteDetail, setShowQuoteDetail] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [compareQuotes, setCompareQuotes] = useState<Quote[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // ─── Fetch Sent Quote Documents via TanStack Query ──────────────────────
  const { data: sentDocsData, isLoading: isLoadingSentDocs } = useQuery<{ quotes: any[] }>({
    queryKey: ['/api/quotes'],
    refetchInterval: 30000,
  });

  const sentQuoteDocs: SentQuoteDoc[] = useMemo(() => {
    const rawQuotes = sentDocsData?.quotes || [];
    return rawQuotes.map((q: any) => ({
      id: q.quoteId,
      quoteRef: q.quoteRef,
      quoteType: q.quoteType,
      quoteTypeName: q.quoteTypeName || QUOTE_DOCUMENT_TYPES.find(t => t.id === q.quoteType)?.name || q.quoteType,
      clientName: q.clientName,
      clientEmail: q.clientEmail,
      clientPhone: q.clientPhone,
      carrierId: q.carrierId,
      carrierName: q.carrierName,
      coverageAmount: q.coverageAmount,
      premium: q.premium,
      method: (q.smsSent ? 'both' : 'email') as SentQuoteDoc['method'],
      sentAt: new Date(q.createdAt),
      status: q.status as SentQuoteDoc['status'],
      openedAt: q.openedAt || null,
      expiresAt: q.expiresAt || null,
    }));
  }, [sentDocsData]);

  // ─── Send Dialog Helpers ────────────────────────────────────────────────

  const openSendDialog = (docType: QuoteDocType) => {
    setSelectedDocType(docType);
    setFormClientName("");
    setFormEmail("");
    setFormPhone("");
    setFormCarrier("");
    setFormCoverageAmount("");
    setFormPremium("");
    setFormPremiumFrequency("monthly");
    setFormTermLength("");
    setFormHealthClass("");
    setFormBenefits(docType.defaultBenefits.join("\n"));
    setFormNotes("");
    setFormSendMethod("email");
    setPreviewTab("email");
    setDevicePreview("phone");
    setSendDialogOpen(true);
  };

  const getCarrierName = () =>
    INSURANCE_CARRIERS.find(c => c.id === formCarrier)?.name || "Insurance Carrier";

  const handleSendQuoteDoc = async () => {
    if (!selectedDocType) return;
    if (!currentUser) {
      toast.error("You must be logged in to send quotes");
      return;
    }
    if (!formClientName) { toast.error("Client name is required"); return; }
    if (!formCarrier) { toast.error("Please select an insurance carrier"); return; }
    if (!formCoverageAmount) { toast.error("Coverage amount is required"); return; }
    if (!formPremium) { toast.error("Premium is required"); return; }
    if (formSendMethod === "email" && !formEmail) { toast.error("Email is required for email delivery"); return; }
    if (formSendMethod === "sms" && !formPhone) { toast.error("Phone is required for SMS delivery"); return; }
    if (formSendMethod === "both" && (!formEmail || !formPhone)) { toast.error("Both email and phone are required"); return; }

    setIsSending(true);
    try {
      const carrierName = INSURANCE_CARRIERS.find(c => c.id === formCarrier)?.name || formCarrier;
      const result = await sendQuoteMutation.mutateAsync({
        clientName: formClientName,
        clientEmail: formEmail || null,
        clientPhone: formPhone || null,
        quoteType: selectedDocType.id,
        quoteTypeName: selectedDocType.name,
        coverageAmount: formCoverageAmount,
        premium: formPremium,
        premiumFrequency: formPremiumFrequency,
        termLength: formTermLength || null,
        healthClass: formHealthClass || null,
        benefits: formBenefits,
        additionalNotes: formNotes || null,
        carrierId: formCarrier,
        carrierName,
        sendMethod: formSendMethod,
        agent: {
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          npn: currentUser.npn || undefined,
        },
      });

      if (result.emailSent) {
        toast.success(`Quote sent from ${currentUser.email}`, {
          description: `${selectedDocType.name} quote delivered to ${formEmail}`
        });
      }
      if (result.smsSent) {
        toast.success(`SMS sent from ${currentUser.phone}`, {
          description: `Quote link delivered to ${formPhone}`
        });
      }
      setSendDialogOpen(false);
    } catch (error: any) {
      console.error("[QuoteDoc] Error:", error);
      toast.error(error.message || "Failed to send quote document");
    } finally {
      setIsSending(false);
    }
  };

  // ─── Send Quote Mutation ───────────────────────────────────────────────
  const sendQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      const res = await fetch('/api/quotes/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(quoteData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send quote');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    },
  });

  // ─── Resend Quote Mutation ───────────────────────────────────────────��─
  const resendMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await fetch(`/api/quotes/${quoteId}/resend`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to resend');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast.success('Quote resent successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend quote');
    },
  });

  const copyQuoteLink = (docId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/quotes/view/${docId}`);
    toast.success("Quote link copied to clipboard");
  };

  const resendQuoteDoc = (doc: SentQuoteDoc) => {
    resendMutation.mutate(doc.id);
  };

  const formatTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getDocStatusBadge = (doc: SentQuoteDoc) => {
    const styles = {
      sent: "bg-blue-100 text-blue-700 border-0",
      opened: "bg-emerald-100 text-emerald-700 border-0",
      expired: "bg-gray-100 text-gray-600 border-0",
    };
    const labels = { sent: "Delivered", opened: "Opened", expired: "Expired" };
    const timeLeft = doc.status === 'opened' ? formatTimeRemaining(doc.expiresAt) : null;
    return (
      <span className="flex items-center gap-1.5">
        <Badge className={styles[doc.status]} style={{ borderRadius: RADIUS.pill }}>{labels[doc.status]}</Badge>
        {timeLeft && <span className="text-xs text-gray-400">{timeLeft}</span>}
      </span>
    );
  };

  // ─── Manage Quotes Helpers ──────────────────────────────────────────────

  const quotes = storeQuotes.length > 0 ? storeQuotes : EMPTY_QUOTES;

  const filteredQuotes = useMemo(() => quotes.filter(quote => {
    const matchesSearch = quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      productLabels[quote.product].toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;
    return matchesSearch && matchesStatus;
  }), [quotes, searchQuery, filterStatus]);

  // Paginate the quote list at 10 per page. Server already scopes to the
  // requesting agent (agent_user_id = req.user.id), so this is purely a UX
  // wrapper on top of the already-filtered list.
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems: paginatedQuotes,
    totalItems: totalQuotes,
    goToPage,
    changeItemsPerPage,
  } = usePagination(filteredQuotes, 10);

  const stats = useMemo(() => ({
    total: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent' || q.status === 'viewed').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
  }), [quotes]);

  const handleCreateQuote = (quoteData: { clientName: string; product: string; carrier: string; coverageAmount: string; premium: string; healthClass: string; }) => {
    const coverageNum = parseInt(quoteData.coverageAmount.replace(/[^0-9]/g, '')) || 0;
    const premiumNum = parseInt(quoteData.premium.replace(/[^0-9]/g, '')) || 0;
    const productMap: Record<string, Quote['product']> = {
      '10-Year Term': 'term', '20-Year Term': 'term', '30-Year Term': 'term',
      'Whole Life': 'whole', 'IUL': 'iul', 'Final Expense': 'final_expense',
    };
    addQuote({
      clientName: quoteData.clientName, clientEmail: '', clientPhone: '',
      product: productMap[quoteData.product] || 'term',
      coverageAmount: coverageNum, monthlyPremium: premiumNum,
      carrier: quoteData.carrier, healthClass: quoteData.healthClass,
    });
    toast.success('Quote created');
  };

  const handleQuoteClick = (quote: Quote) => { setSelectedQuote(quote); setShowQuoteDetail(true); };
  const handleUpdateStatus = (quoteId: string, newStatus: string) => {
    updateQuoteStatus(quoteId, newStatus as QuoteStatus);
    if (selectedQuote?.id === quoteId) setSelectedQuote(prev => prev ? { ...prev, status: newStatus as QuoteStatus } : null);
  };
  const handleDeleteQuote = () => { setShowQuoteDetail(false); setSelectedQuote(null); toast.success('Quote deleted'); };
  const handleUseTemplate = (template: typeof QUOTE_TEMPLATES[0]) => {
    addQuote({ clientName: 'New Client', clientEmail: '', clientPhone: '', product: template.product, coverageAmount: template.coverageAmount, monthlyPremium: template.monthlyPremium, term: template.term });
    setShowTemplates(false);
    toast.success(`Quote created from "${template.name}" template`);
  };
  const toggleCompareQuote = useCallback((quote: Quote) => {
    setCompareQuotes(prev => {
      if (prev.find(q => q.id === quote.id)) return prev.filter(q => q.id !== quote.id);
      if (prev.length >= MAX_COMPARE) { toast.error(`You can compare up to ${MAX_COMPARE} quotes`); return prev; }
      return [...prev, quote];
    });
  }, []);

  const allStatuses = [
    { value: 'all', label: 'All' }, { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' }, { value: 'viewed', label: 'Viewed' },
    { value: 'accepted', label: 'Accepted' }, { value: 'expired', label: 'Expired' },
  ];

  // ─── Email Preview ──────────────────────────────────────────────────────

  const EmailPreview = ({ isPhone }: { isPhone: boolean }) => {
    const subject = `Your ${selectedDocType?.name || 'Insurance'} Quote from ${CARRIER_BRANDING[formCarrier]?.shortName || getCarrierName()} — Prepared by ${agentFirstName}`;
    const carrierColor = getCarrierColor(formCarrier);
    const carrierGrad = getCarrierGradient(formCarrier);
    const carrierLogo = CARRIER_BRANDING[formCarrier]?.logoUrl;

    // Carrier header with solid bg + white logo container
    const CarrierHeaderPreview = ({ compact }: { compact?: boolean }) => (
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: carrierGrad.from }}>
        <div className={`${compact ? 'p-3' : 'p-4'} text-center`}>
          {carrierLogo ? (
            <div className="inline-block bg-white rounded-lg px-4 py-2 mb-1.5">
              <img src={carrierLogo} alt={getCarrierName()} className={`block ${compact ? 'max-w-[120px] max-h-[36px]' : 'max-w-[140px] max-h-[40px]'}`} />
            </div>
          ) : (
            <p className={`font-bold text-white ${compact ? 'text-sm' : ''}`}>{getCarrierName()}</p>
          )}
          <p className={`text-white/80 ${compact ? 'text-[10px]' : 'text-xs'}`}>in partnership with Heritage Life Solutions</p>
        </div>
      </div>
    );

    if (isPhone) {
      return (
        <div className="bg-[#f2f2f7] min-h-[440px]">
          <div className="bg-[#f2f2f7] px-4 py-2 flex items-center justify-between border-b border-gray-300">
            <div className="flex items-center gap-2 text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span className="text-sm">Inbox</span>
            </div>
            <div className="flex items-center gap-4 text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
          </div>
          <div className="bg-white mx-0">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${carrierGrad.from} 0%, ${carrierGrad.to} 100%)` }}>
                  <span className="text-white font-semibold text-sm">{agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm">{agentName}</p>
                    <span className="text-xs text-gray-400">Now</span>
                  </div>
                  <p className="text-xs text-gray-500">{agentEmail}</p>
                  <p className="text-xs text-gray-400 mt-0.5">to me</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-sm text-gray-900 leading-snug">{subject}</h2>
            </div>
            <div className="px-4 py-4 space-y-3 text-sm">
              <CarrierHeaderPreview compact />
              <p className="text-gray-800 text-xs">
                Hi {formClientName || <span className="font-bold">Client</span>},
              </p>
              <p className="text-gray-600 text-xs">
                {agentName} has prepared a personalized {selectedDocType?.name?.toLowerCase() || 'insurance'} quote for you. Here's a quick summary:
              </p>
              {/* Mini Summary */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Product</div>
                <div className="text-xs font-semibold text-gray-800 mb-2">{selectedDocType?.name || 'Quote'}</div>
                <div className="grid grid-cols-2 gap-1">
                  <div><span className="text-[10px] text-gray-400">Coverage:</span> <span className="text-xs font-bold" style={{ color: carrierColor }}>{formCoverageAmount || '—'}</span></div>
                  <div><span className="text-[10px] text-gray-400">Premium:</span> <span className="text-xs font-bold" style={{ color: carrierColor }}>{formPremium || '—'}/{formPremiumFrequency === 'annual' ? 'yr' : 'mo'}</span></div>
                </div>
              </div>
              {/* CTA */}
              <div className="py-1">
                <div className="text-white rounded-lg text-center font-bold py-2.5 text-xs" style={{ backgroundColor: carrierColor }}>
                  View Your Complete Quote
                </div>
                <p className="text-center text-[9px] text-gray-400 mt-1">Includes full benefits, carrier details, and next steps</p>
              </div>
              {/* Agent sig */}
              <div className="pt-2 border-t border-gray-100 mt-2">
                <p className="text-gray-700 font-medium text-xs">{agentName}</p>
                <p className="text-gray-500 text-[10px]">Licensed Insurance Agent &bull; Heritage Life Solutions</p>
                <p className="text-gray-500 text-[10px]">{agentEmail} {agentPhone ? `• ${agentPhone}` : ''}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Desktop Gmail Style
    return (
      <div className="bg-white min-h-[350px]">
        <div className="flex items-center gap-2 px-2 py-2 border-b border-gray-200">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-500">1 of 24</span>
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <h1 className="text-lg text-gray-900">{subject}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Inbox</span>
          </div>
        </div>
        <div className="px-4 py-3 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${carrierGrad.from} 0%, ${carrierGrad.to} 100%)` }}>
            <span className="text-white font-semibold">{agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">{agentName}</span>
              <span className="text-xs text-gray-400">&lt;{agentEmail}&gt;</span>
            </div>
            <p className="text-xs text-gray-500">to me</p>
          </div>
          <div className="text-xs text-gray-400">2:30 PM (0 minutes ago)</div>
        </div>
        <div className="px-4 py-4 pl-16 space-y-3 text-sm">
          <CarrierHeaderPreview />
          <p className="text-gray-800">Hi {formClientName || <span className="font-bold">Client</span>},</p>
          <p className="text-gray-600">{agentName} has prepared a personalized {selectedDocType?.name?.toLowerCase() || 'insurance'} quote for you from {CARRIER_BRANDING[formCarrier]?.shortName || getCarrierName()}. Here's a quick summary:</p>
          {/* Mini Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 max-w-md">
            <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Product</div>
            <div className="text-sm font-semibold text-gray-800 mb-3">{selectedDocType?.name || 'Quote'}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-400 text-xs">Coverage:</span> <span className="font-bold" style={{ color: carrierColor }}>{formCoverageAmount || '—'}</span></div>
              <div><span className="text-gray-400 text-xs">Premium:</span> <span className="font-bold" style={{ color: carrierColor }}>{formPremium || '—'}/{formPremiumFrequency === 'annual' ? 'yr' : 'mo'}</span></div>
            </div>
          </div>
          <div className="py-2">
            <div className="text-white rounded-xl text-center font-bold py-3 px-6 inline-block cursor-pointer hover:opacity-90" style={{ backgroundColor: carrierColor }}>
              View Your Complete Quote
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Includes full benefits, carrier details, and next steps</p>
          </div>
          <div className="pt-3 border-t border-gray-100 mt-4">
            <p className="text-gray-800 font-medium">{agentName}</p>
            <p className="text-gray-500 text-xs">Licensed Insurance Agent &bull; Heritage Life Solutions</p>
            <p className="text-gray-500 text-xs">{agentEmail} {agentPhone ? `| ${agentPhone}` : ''}</p>
          </div>
        </div>
      </div>
    );
  };

  // ─── SMS Preview ────────────────────────────────────────────────────────

  const SMSPreview = ({ isPhone }: { isPhone: boolean }) => {
    if (isPhone) {
      return (
        <div className="bg-[#f2f2f7] min-h-[440px]">
          <div className="bg-[#f2f2f7] px-3 py-2 flex items-center gap-2 border-b border-gray-300">
            <div className="flex items-center gap-1 text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span className="text-xs">(12)</span>
            </div>
            <div className="flex-1 text-center">
              <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}>
                <span className="text-white text-xs font-semibold">{agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
              <p className="text-xs font-medium text-black mt-0.5">{agentFirstName}</p>
            </div>
            <div className="w-8" />
          </div>
          <div className="p-3 space-y-2 bg-white min-h-[340px]">
            <div className="text-center"><span className="text-[10px] text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-full">Today 2:30 PM</span></div>
            <div className="text-center"><span className="text-[10px] text-gray-400">From: {agentPhone}</span></div>
            <div className="flex justify-start">
              <div className="bg-[#e5e5ea] rounded-2xl rounded-bl-md px-3 py-2 max-w-[85%]">
                <p className="text-black text-xs leading-relaxed">
                  Hi {formClientName || <span className="font-semibold">there</span>}, it's {agentFirstName} from Heritage Life Solutions. I've prepared a personalized {selectedDocType?.name || 'insurance'} quote for you through {getCarrierName()}. Review your quote details here:
                </p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-[#e5e5ea] rounded-2xl rounded-bl-md px-3 py-2 max-w-[85%]">
                <div className="mt-1 bg-white rounded-xl overflow-hidden border border-gray-200">
                  <div className="h-14 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] text-gray-400">heritagels.org</p>
                    <p className="text-xs font-medium text-black truncate">{selectedDocType?.name || 'Insurance'} Quote — {formCoverageAmount || '$—'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-start pl-3">
              <span className="text-[10px] text-gray-400 italic">Delivered</span>
            </div>
          </div>
          <div className="bg-[#f2f2f7] px-3 py-2 border-t border-gray-300">
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 bg-[#007aff] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
              </button>
              <div className="flex-1 bg-white rounded-full border border-gray-300 px-3 py-1.5">
                <span className="text-xs text-gray-400">iMessage</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Desktop Messages Style
    return (
      <div className="bg-white min-h-[350px] flex">
        <div className="w-20 bg-gray-50 border-r border-gray-200 p-2 hidden sm:block">
          <div className="space-y-2">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}>
                <span className="text-white text-xs font-semibold">{agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
              <p className="text-[9px] text-center text-gray-600 mt-1 truncate">{agentFirstName}</p>
            </div>
            <div className="p-2"><div className="w-8 h-8 bg-gray-300 rounded-full mx-auto" /></div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}>
              <span className="text-white font-semibold">{agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{agentName}</p>
              <p className="text-xs text-gray-500">{agentPhone}</p>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-3 bg-[#fafafa]">
            <div className="text-center"><span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">Today</span></div>
            <div className="flex justify-start gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}>
                <span className="text-white text-xs font-semibold">{agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
              <div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm border border-gray-100 max-w-md">
                  <p className="text-sm text-gray-800">
                    Hi {formClientName || <span className="font-semibold">there</span>}! This is {agentFirstName} from Heritage Life Solutions. I've prepared your personalized {selectedDocType?.name?.toLowerCase() || 'insurance'} quote through {formCarrier ? getCarrierName() : 'our carrier partner'}. Check it out:
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 ml-2">2:30 PM</span>
              </div>
            </div>
            <div className="flex justify-start gap-2">
              <div className="w-8 h-8 flex-shrink-0" />
              <div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm border border-gray-100 max-w-md">
                  <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <div className="h-16 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}>
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-400">heritagels.org</p>
                      <p className="text-sm font-medium text-gray-900">{selectedDocType?.name || 'Insurance'} Quote</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formCoverageAmount || '$—'} coverage • {formPremium || '$—'}/{formPremiumFrequency === 'annual' ? 'yr' : 'mo'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 mt-1">
                  <span className="text-[10px] text-gray-400">2:30 PM</span>
                  <CheckCircle className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] text-blue-500">Delivered</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2"><span className="text-sm text-gray-400">Type a message...</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Quote Document Preview ─────────────────────────────────────────────

  const QuoteDocPreview = ({ isPhone }: { isPhone: boolean }) => {
    const carrierBranding = CARRIER_BRANDING[formCarrier];
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    if (isPhone) {
      return (
        <div className="bg-[#f2f2f7] min-h-[440px]">
          <div className="bg-[#f2f2f7] px-3 py-2 flex items-center gap-2 border-b border-gray-300">
            <div className="text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </div>
            <div className="flex-1">
              <div className="bg-white/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-center">
                <Lock className="w-3 h-3 text-gray-500 mx-auto" />
                <span className="text-xs text-gray-600 flex-1">heritagels.org</span>
              </div>
            </div>
          </div>
          <div className="bg-white">
            {/* Carrier Header */}
            <div className="p-4 text-white text-center"
              style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}>
              {carrierBranding?.logoUrl && (
                <img src={carrierBranding.logoUrl} alt={carrierBranding.logoAlt || ''} className="h-6 mx-auto mb-2 object-contain brightness-0 invert" />
              )}
              <h3 className="font-bold text-sm">{getCarrierName()}</h3>
              <p className="text-[10px] opacity-80">in partnership with Heritage Life Solutions</p>
            </div>
            {/* Title Bar */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-center">
              <p className="font-semibold text-xs text-gray-900">Personal Insurance Quote</p>
              <p className="text-[10px] text-gray-400">{today}</p>
            </div>
            {/* Client Greeting */}
            <div className="px-4 pt-3">
              <p className="text-xs text-gray-600">Prepared for: <span className="font-semibold text-gray-900">{formClientName || 'Client'}</span></p>
            </div>
            {/* Product Summary Card */}
            <div className="mx-4 my-3 rounded-lg border overflow-hidden" style={{ borderColor: `${getCarrierColor(formCarrier)}30` }}>
              <div className="px-3 py-2 text-white text-xs font-semibold" style={{ backgroundColor: getCarrierColor(formCarrier) }}>
                {selectedDocType?.name || 'Quote'} Details
              </div>
              <div className="p-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between"><span className="text-gray-500">Coverage Amount</span><span className="font-semibold">{formCoverageAmount || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Premium</span><span className="font-semibold">{formPremium || '—'}/{formPremiumFrequency === 'annual' ? 'yr' : 'mo'}</span></div>
                {formTermLength && <div className="flex justify-between"><span className="text-gray-500">Term Length</span><span className="font-semibold">{formTermLength} Years</span></div>}
                {formHealthClass && <div className="flex justify-between"><span className="text-gray-500">Health Classification</span><span className="font-semibold">{formHealthClass}</span></div>}
              </div>
            </div>
            {/* Benefits */}
            {formBenefits && (
              <div className="px-4 pb-3">
                <p className="font-semibold text-[11px] text-gray-900 mb-1.5">Key Benefits</p>
                <div className="space-y-1">
                  {formBenefits.split('\n').slice(0, 4).map((b, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10px] text-gray-600">
                      <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: getCarrierColor(formCarrier) }} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Agent Block */}
            <div className="mx-4 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="font-semibold text-[11px] text-gray-900">{agentName}</p>
              <p className="text-[10px] text-gray-500">Licensed Insurance Agent</p>
              <p className="text-[10px] text-gray-500">Heritage Life Solutions</p>
              <p className="text-[10px] text-gray-500">{agentPhone} | {agentEmail}</p>
            </div>
            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-[9px] text-gray-400 text-center">
                Heritage Life Solutions — Authorized {getCarrierName()} Distribution Partner
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Desktop View
    return (
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden min-h-[350px]">
        {/* Carrier Header */}
        <div className="p-6 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}>
          {carrierBranding?.logoUrl && (
            <img src={carrierBranding.logoUrl} alt={carrierBranding.logoAlt || ''} className="h-8 mx-auto mb-2 object-contain brightness-0 invert" />
          )}
          <h3 className="font-bold text-lg">{getCarrierName()}</h3>
          <p className="text-sm opacity-80">in partnership with Heritage Life Solutions</p>
        </div>
        {/* Title */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 text-center">
          <h2 className="font-bold text-gray-900">Personal Insurance Quote</h2>
          <p className="text-xs text-gray-400">{today}</p>
        </div>
        <div className="p-6 space-y-4">
          {/* Client */}
          <p className="text-sm text-gray-600">Prepared for: <span className="font-semibold text-gray-900">{formClientName || 'Client'}</span></p>
          {/* Product Summary */}
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: `${getCarrierColor(formCarrier)}30` }}>
            <div className="px-4 py-2.5 text-white font-semibold text-sm" style={{ backgroundColor: getCarrierColor(formCarrier) }}>
              {selectedDocType?.name || 'Quote'} Details
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Coverage Amount</span><span className="font-semibold">{formCoverageAmount || '—'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Premium</span><span className="font-semibold">{formPremium || '—'}/{formPremiumFrequency === 'annual' ? 'yr' : 'mo'}</span></div>
              {formTermLength && <div className="flex justify-between text-sm"><span className="text-gray-500">Term Length</span><span className="font-semibold">{formTermLength} Years</span></div>}
              {formHealthClass && <div className="flex justify-between text-sm"><span className="text-gray-500">Health Classification</span><span className="font-semibold">{formHealthClass}</span></div>}
            </div>
          </div>
          {/* Benefits */}
          {formBenefits && (
            <div>
              <p className="font-semibold text-sm text-gray-900 mb-2">Key Benefits</p>
              <div className="space-y-1.5">
                {formBenefits.split('\n').map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: getCarrierColor(formCarrier) }} />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Agent Credential Block */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 mt-4">
            <p className="font-semibold text-sm text-gray-900">{agentName}</p>
            <p className="text-xs text-gray-500">Licensed Insurance Agent</p>
            <p className="text-xs text-gray-500">Heritage Life Solutions</p>
            <p className="text-xs text-gray-500">{agentPhone} | {agentEmail}</p>
            <p className="text-xs text-gray-400 mt-1">{today}</p>
          </div>
          {/* Footer */}
          <div className="text-center pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Heritage Life Solutions — Authorized {getCarrierName()} Distribution Partner</p>
            <p className="text-[10px] text-gray-300 mt-1">This quote is for informational purposes only and does not constitute a binding contract.</p>
          </div>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <AgentLoungeLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 pb-20 lg:pb-0">
        {/* Hero Card */}
        <motion.div data-tour-id={TOUR.AGENT.QUOTES.HEADER} variants={fadeInUp}>
          <AgentPageHero
            icon={FileText}
            title="Policy Quotes & Proposals"
            subtitle="Send professional, carrier-branded quote documents to your clients"
          >
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                {agentName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="text-left">
                <div className="text-xs text-white/60 font-medium">Sending as</div>
                <div className="text-sm font-semibold text-white leading-tight">{agentName}</div>
                <div className="text-xs text-white/70 mt-0.5">{agentEmail} | {agentPhone}</div>
              </div>
            </div>
          </AgentPageHero>
        </motion.div>

        {/* Main Tabs */}
        <motion.div data-tour-id={TOUR.AGENT.QUOTES.TABS} variants={fadeInUp}>
          <Tabs defaultValue="send" className="space-y-4">
            <TabsList className="bg-gray-100 border-0 p-1 gap-1" style={{ borderRadius: RADIUS.button }}>
              <TabsTrigger value="send" className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm" style={{ borderRadius: RADIUS.button - 2 }}>
                <Send className="w-4 h-4 mr-2" />
                Send Quote Document
              </TabsTrigger>
              <TabsTrigger value="manage" className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm" style={{ borderRadius: RADIUS.button - 2 }}>
                <FileText className="w-4 h-4 mr-2" />
                My Quotes
              </TabsTrigger>
            </TabsList>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* SEND QUOTE DOCUMENT TAB                                    */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <TabsContent value="send" className="space-y-6">
              {/* Quote Type Cards */}
              <div data-tour-id={TOUR.AGENT.QUOTES.CREATE}>
                <h2 className="text-lg font-semibold mb-4">Select Quote Type</h2>
                <div className="grid md:grid-cols-5 gap-4">
                  {QUOTE_DOCUMENT_TYPES.map((docType) => (
                    <motion.div
                      key={docType.id}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    >
                      <Card
                        className="cursor-pointer group relative overflow-hidden border-0 h-full"
                        style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                        onClick={() => openSendDialog(docType)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
                        <div style={{ width: 80, height: 80 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/3 translate-x-1/3" />
                        <div style={{ width: 50, height: 50 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/3 -translate-x-1/4" />
                        <CardContent className="relative z-10 p-5 flex flex-col h-full">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ borderRadius: RADIUS.button }}>
                            <docType.icon className="w-5 h-5 text-amber-200" />
                          </div>
                          <h3 className="font-semibold text-white text-sm mb-1">{docType.name}</h3>
                          <p className="text-xs text-white/70 mb-3 flex-1">{docType.description}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {docType.fields.slice(0, 2).map((field, i) => (
                              <Badge key={i} className="text-[9px] bg-white/15 text-white/90 border-0 backdrop-blur-sm" style={{ borderRadius: RADIUS.pill }}>
                                {field}
                              </Badge>
                            ))}
                            {docType.fields.length > 2 && (
                              <Badge className="text-[9px] bg-white/15 text-white/70 border-0 backdrop-blur-sm" style={{ borderRadius: RADIUS.pill }}>
                                +{docType.fields.length - 2}
                              </Badge>
                            )}
                          </div>
                          <Button className="w-full gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm text-xs" style={{ borderRadius: RADIUS.button }}>
                            <Send className="w-3.5 h-3.5" />
                            Send to Client
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Sent Quote Documents */}
              <div data-tour-id={TOUR.AGENT.QUOTES.STATS}>
                <h2 className="text-lg font-semibold mb-4">Recently Sent Quotes</h2>
                <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)' }}>
                  <CardContent className="p-0">
                    {isLoadingSentDocs ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
                      </div>
                    ) : sentQuoteDocs.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No quote documents sent yet</p>
                        <p className="text-sm">Select a quote type above to send your first quote</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {sentQuoteDocs.map((doc) => (
                          <div key={doc.id} className="px-5 py-4 hover:bg-violet-50/40 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center" style={{ borderRadius: RADIUS.button }}>
                                  {doc.method === "email" ? <Mail className="w-5 h-5 text-amber-200" /> :
                                   doc.method === "both" ? <div className="flex items-center gap-0.5"><Mail className="w-3.5 h-3.5 text-amber-200" /><MessageSquare className="w-3.5 h-3.5 text-amber-200" /></div> :
                                   <MessageSquare className="w-5 h-5 text-amber-200" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{doc.clientName}</span>
                                    {getDocStatusBadge(doc)}
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span>{doc.quoteTypeName}</span>
                                    <span>|</span>
                                    <span>{doc.carrierName}</span>
                                    <span>|</span>
                                    <span>{doc.clientEmail || doc.clientPhone}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                    <Clock className="w-3 h-3" />
                                    Sent {formatTimeAgo(doc.sentAt)}
                                    {doc.quoteRef && <><span>|</span><span>Ref: {doc.quoteRef}</span></>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => copyQuoteLink(doc.id)} className="text-violet-700" style={{ borderRadius: RADIUS.button }}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => resendQuoteDoc(doc)} className="text-violet-700 border-violet-200 hover:bg-violet-50" style={{ borderRadius: RADIUS.button }}>
                                  Resend
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Document Features */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Quote Document Features</h2>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { icon: Shield, title: "Carrier Branded", description: "Professional carrier co-branding" },
                    { icon: FileText, title: "Detailed Quotes", description: "Full product details & benefits" },
                    { icon: Users, title: "Agent Credentials", description: "Name, NPN & contact info" },
                    { icon: Lock, title: "Compliance Ready", description: "Legal disclaimers included" },
                  ].map((feature, index) => (
                    <motion.div key={index} whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }} transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}>
                      <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                        <CardContent className="p-4 text-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/25" style={{ borderRadius: RADIUS.button }}>
                            <feature.icon className="w-5 h-5 text-amber-200" />
                          </div>
                          <h3 className="font-medium text-gray-900 text-sm">{feature.title}</h3>
                          <p className="text-xs text-gray-500">{feature.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* MY QUOTES TAB                                              */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <TabsContent value="manage" className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Quotes', value: stats.total, icon: FileText, gradient: 'from-violet-400 to-purple-500' },
                  { label: 'Draft', value: stats.draft, icon: Clock, gradient: 'from-amber-400 to-orange-500' },
                  { label: 'Sent / Viewed', value: stats.sent, icon: Send, gradient: 'from-blue-400 to-cyan-500' },
                  { label: 'Accepted', value: stats.accepted, icon: CheckCircle2, gradient: 'from-emerald-400 to-green-500' },
                ].map((stat) => (
                  <motion.div key={stat.label} whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }} transition={{ duration: MOTION.duration.hover }}>
                    <Card className="border-0 overflow-hidden relative" style={{ borderRadius: RADIUS.card, boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)' }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
                      <div style={{ width: 80, height: 80 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
                      <CardContent className="p-4 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-white/20 backdrop-blur">
                            <stat.icon className="w-5 h-5 text-amber-200" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-white/70">{stat.label}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowTemplates(true)} className="bg-white" style={{ borderRadius: RADIUS.button }}>
                  <Zap className="w-4 h-4 mr-2" /> Quick Template
                </Button>
                {compareQuotes.length > 0 && (
                  <Button variant="outline" onClick={() => setShowComparison(true)} style={{ borderRadius: RADIUS.button }}>
                    <GitCompare className="w-4 h-4 mr-2" /> Compare ({compareQuotes.length})
                  </Button>
                )}
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white" style={{ borderRadius: RADIUS.button }} onClick={() => setShowCreateQuote(true)}>
                  <Plus className="w-4 h-4 mr-2" /> New Quote
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search quotes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11" style={{ borderRadius: RADIUS.input }} />
                </div>
                <div className="flex gap-1 p-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
                  {allStatuses.map((s) => (
                    <Button key={s.value} variant="ghost" size="sm" onClick={() => setFilterStatus(s.value)}
                      className={cn("h-8 px-3 text-xs font-medium transition-all", filterStatus === s.value ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
                      style={{ borderRadius: RADIUS.button }}>
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quotes List */}
              <Card className="border-0 overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="p-0">
                  {filteredQuotes.length === 0 ? (
                    searchQuery || filterStatus !== 'all' ? (
                      <div className="text-center py-12">
                        <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600 font-medium">No quotes match your filters</p>
                        <Button variant="link" className="mt-2 text-violet-600" onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}>Clear Filters</Button>
                      </div>
                    ) : (
                      <EmptyState icon={FileText} title="No quotes found" description="Create your first quote to get started"
                        action={{ label: "Create Quote", onClick: () => setShowCreateQuote(true), icon: Plus }} variant="card" />
                    )
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {paginatedQuotes.map((quote) => {
                        const status = statusConfig[quote.status];
                        const StatusIcon = status.icon;
                        const expired = isExpired(quote.expiresDate);
                        return (
                          <div key={quote.id} className={cn("px-5 py-4 hover:bg-violet-50/40 transition-colors cursor-pointer", compareQuotes.find(q => q.id === quote.id) && "bg-violet-50/60")}
                            onClick={() => handleQuoteClick(quote)}>
                            <div className="flex items-center gap-4">
                              <div onClick={(e) => { e.stopPropagation(); toggleCompareQuote(quote); }} role="presentation">
                                <Checkbox checked={!!compareQuotes.find(q => q.id === quote.id)} onCheckedChange={() => toggleCompareQuote(quote)} />
                              </div>
                              <div className="w-10 h-10 flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20" style={{ borderRadius: RADIUS.button }}>
                                {quote.clientName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900">{quote.clientName}</p>
                                  <Badge className={cn("text-[10px] border-0", status.color)} style={{ borderRadius: RADIUS.pill }}>
                                    <StatusIcon className="w-3 h-3 mr-1" />{status.label}
                                  </Badge>
                                  {expired && quote.status !== 'expired' && (
                                    <Badge className="text-[10px] bg-red-100 text-red-600 border-0" style={{ borderRadius: RADIUS.pill }}>Expired</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{productLabels[quote.product]}{quote.term ? ` - ${quote.term} Year` : ''}</p>
                              </div>
                              <div className="hidden sm:block text-right">
                                <p className="font-semibold text-violet-700">${quote.monthlyPremium.toLocaleString()}/mo</p>
                                <p className="text-xs text-gray-400">${quote.coverageAmount.toLocaleString()} coverage</p>
                              </div>
                              <div className="hidden md:block text-right">
                                <p className="text-sm text-gray-600">{formatQuoteDate(quote.createdDate)}</p>
                                <p className={cn("text-xs", expired ? "text-red-500" : "text-gray-400")}>Expires {formatQuoteDate(quote.expiresDate)}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-300" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {totalQuotes > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalQuotes}
                        itemsPerPage={itemsPerPage}
                        onPageChange={goToPage}
                        onItemsPerPageChange={changeItemsPerPage}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEND QUOTE DOCUMENT DIALOG                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent
          className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 border-0 [&>button.absolute]:hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: RADIUS.card,
            boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)',
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                {selectedDocType && <selectedDocType.icon className="w-5 h-5 text-amber-200" />}
              </div>
              <div>
                <span className="text-gray-900">Send {selectedDocType?.name || 'Quote'} Document</span>
                <p className="text-sm font-normal text-gray-500 mt-0.5">
                  Your client will receive a professional, carrier-branded quote document.
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* ──── Left Side: Form ──── */}
            <div className="space-y-4">
              {/* Client Name */}
              <div>
                <Label className="flex items-center gap-1">Client Name <span className="text-red-500">*</span></Label>
                <Input placeholder="John Smith" value={formClientName} onChange={(e) => setFormClientName(e.target.value)} className="mt-1" style={{ borderRadius: RADIUS.input }} />
              </div>
              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="john@email.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="mt-1" style={{ borderRadius: RADIUS.input }} />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input type="tel" placeholder="(555) 123-4567" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="mt-1" style={{ borderRadius: RADIUS.input }} />
                </div>
              </div>
              {/* Insurance Carrier */}
              <div>
                <Label className="flex items-center gap-1">Insurance Carrier <span className="text-red-500">*</span></Label>
                <Select value={formCarrier} onValueChange={setFormCarrier}>
                  <SelectTrigger className="mt-1" style={{ borderRadius: RADIUS.input }}><SelectValue placeholder="Select a carrier" /></SelectTrigger>
                  <SelectContent>
                    {INSURANCE_CARRIERS.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Coverage & Premium */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="flex items-center gap-1">Coverage Amount <span className="text-red-500">*</span></Label>
                  <Input placeholder="$500,000" value={formCoverageAmount} onChange={(e) => handleCurrencyInput(e.target.value, setFormCoverageAmount)} className="mt-1" style={{ borderRadius: RADIUS.input }} />
                </div>
                <div>
                  <Label className="flex items-center gap-1">Premium <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="$45" value={formPremium} onChange={(e) => handleCurrencyInput(e.target.value, setFormPremium)} className="flex-1" style={{ borderRadius: RADIUS.input }} />
                    <div className="flex gap-0.5 p-0.5" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
                      {(["monthly", "annual"] as const).map((freq) => (
                        <button key={freq} onClick={() => setFormPremiumFrequency(freq)}
                          className={cn("px-2 py-1 text-xs font-medium transition-all", formPremiumFrequency === freq ? "bg-white shadow-sm text-violet-700" : "text-gray-500")}
                          style={{ borderRadius: RADIUS.button }}>
                          {freq === "monthly" ? "Mo" : "Yr"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Term & Health Class */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Term Length</Label>
                  <Select value={formTermLength} onValueChange={setFormTermLength}>
                    <SelectTrigger className="mt-1" style={{ borderRadius: RADIUS.input }}><SelectValue placeholder="Select term" /></SelectTrigger>
                    <SelectContent>
                      {["10 Years", "15 Years", "20 Years", "25 Years", "30 Years"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Health Classification</Label>
                  <Select value={formHealthClass} onValueChange={setFormHealthClass}>
                    <SelectTrigger className="mt-1" style={{ borderRadius: RADIUS.input }}><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {HEALTH_CLASSES.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Benefits */}
              <div>
                <Label>Key Benefits</Label>
                <Textarea value={formBenefits} onChange={(e) => setFormBenefits(e.target.value)} rows={4} className="mt-1 text-sm" style={{ borderRadius: RADIUS.input }} placeholder="One benefit per line..." />
              </div>
              {/* Additional Notes */}
              <div>
                <Label>Additional Notes (optional)</Label>
                <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2} className="mt-1" style={{ borderRadius: RADIUS.input }} placeholder="Any personalized notes for the client..." />
              </div>
              {/* Send Via */}
              <div>
                <Label className="flex items-center gap-1 mb-2">Send Via <span className="text-red-500">*</span></Label>
                <div className="flex gap-1 p-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
                  {([
                    { id: "email" as const, label: "Email", icon: Mail },
                    { id: "sms" as const, label: "SMS", icon: MessageSquare },
                    { id: "both" as const, label: "Both", icon: null },
                  ]).map((method) => (
                    <button key={method.id} type="button" onClick={() => setFormSendMethod(method.id)}
                      className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-all",
                        formSendMethod === method.id ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      )} style={{ borderRadius: RADIUS.button }}>
                      {method.id === "both" ? (
                        <div className="flex items-center gap-0.5"><Mail className="w-3.5 h-3.5" /><MessageSquare className="w-3.5 h-3.5" /></div>
                      ) : method.icon ? <method.icon className="w-4 h-4" /> : null}
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Sending From */}
              <div className="bg-violet-50 p-3" style={{ borderRadius: RADIUS.button }}>
                <p className="text-xs font-medium text-gray-900 mb-2">Sending From Your Account</p>
                <div className="space-y-1">
                  {(formSendMethod === "email" || formSendMethod === "both") && (
                    <div className="flex items-center gap-2 text-xs text-violet-700"><Mail className="w-3.5 h-3.5" /><span>{agentEmail}</span></div>
                  )}
                  {(formSendMethod === "sms" || formSendMethod === "both") && (
                    <div className="flex items-center gap-2 text-xs text-violet-700"><MessageSquare className="w-3.5 h-3.5" /><span>{agentPhone}</span></div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-violet-700">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{currentUser?.npn ? `NPN: ${currentUser.npn}` : <span className="text-gray-400 italic">NPN not set — <a href="/agents/settings" className="text-violet-600 underline">add in Settings</a></span>}</span>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" onClick={() => setSendDialogOpen(false)} disabled={isSending} className="flex-1 text-violet-700 border-violet-200 hover:bg-violet-50" style={{ borderRadius: RADIUS.button }}>
                  Cancel
                </Button>
                <Button onClick={handleSendQuoteDoc} disabled={isSending}
                  className="flex-1 gap-2 bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  style={{ borderRadius: RADIUS.button }}>
                  {isSending ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" />Send Quote</>
                  )}
                </Button>
              </div>
            </div>

            {/* ──── Right Side: Preview ──── */}
            <div className="space-y-4">
              {/* Device Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="flex gap-1 p-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
                  <button onClick={() => setDevicePreview("phone")}
                    className={cn("px-3 py-1.5 text-sm font-medium transition-all flex items-center gap-1.5", devicePreview === "phone" ? "bg-white shadow-sm text-violet-700" : "text-gray-500 hover:text-gray-700")}
                    style={{ borderRadius: RADIUS.button }}>
                    <Smartphone className="w-4 h-4" />Phone
                  </button>
                  <button onClick={() => setDevicePreview("desktop")}
                    className={cn("px-3 py-1.5 text-sm font-medium transition-all flex items-center gap-1.5", devicePreview === "desktop" ? "bg-white shadow-sm text-violet-700" : "text-gray-500 hover:text-gray-700")}
                    style={{ borderRadius: RADIUS.button }}>
                    <Monitor className="w-4 h-4" />Desktop
                  </button>
                </div>
              </div>

              {/* Preview Tabs */}
              <div className="flex border-b">
                {([
                  { id: "email" as PreviewTab, label: "Email Preview", icon: Mail },
                  { id: "sms" as PreviewTab, label: "SMS Preview", icon: MessageSquare },
                  { id: "document" as PreviewTab, label: "Document Preview", icon: FileText },
                ]).map((tab) => (
                  <button key={tab.id} onClick={() => setPreviewTab(tab.id)}
                    className={cn("flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      previewTab !== tab.id && "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                    style={previewTab === tab.id ? { borderColor: getCarrierColor(formCarrier), color: getCarrierColor(formCarrier) } : {}}>
                    <tab.icon className="w-4 h-4" />{tab.label}
                  </button>
                ))}
              </div>

              {/* Preview Content */}
              <div className={cn("bg-gray-100 rounded-xl p-4 flex items-start justify-center",
                devicePreview === "phone" ? "py-6 min-h-[580px]" : "py-4 min-h-[400px]"
              )}>
                {devicePreview === "phone" ? (
                  <div className="relative">
                    <div className="w-[290px] bg-gradient-to-b from-[#8a8a8f] via-[#6e6e73] to-[#48484a] rounded-[3rem] p-[3px] shadow-2xl">
                      <div className="bg-black rounded-[2.8rem] p-[2px]">
                        <div className="bg-white rounded-[2.7rem] overflow-hidden relative">
                          <div className="bg-white px-6 pt-3 pb-1 flex items-center justify-between relative">
                            <span className="text-sm font-semibold text-black w-12">9:41</span>
                            <div className="absolute left-1/2 -translate-x-1/2 top-2">
                              <div className="bg-black rounded-full w-[90px] h-[28px] flex items-center justify-center gap-2">
                                <div className="w-[10px] h-[10px] rounded-full bg-[#1a1a1a] ring-1 ring-[#2a2a2a] flex items-center justify-center">
                                  <div className="w-[4px] h-[4px] rounded-full bg-[#0a3d62]" />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 w-12 justify-end">
                              <svg className="w-4 h-4" viewBox="0 0 18 12" fill="black"><rect x="0" y="8" width="3" height="4" rx="0.5"/><rect x="4" y="5" width="3" height="7" rx="0.5"/><rect x="8" y="2" width="3" height="10" rx="0.5"/><rect x="12" y="0" width="3" height="12" rx="0.5"/></svg>
                              <svg className="w-4 h-4" viewBox="0 0 16 12" fill="black"><path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3.5 7.5c2.5-2.5 6.5-2.5 9 0l-1 1c-2-2-5-2-7 0l-1-1zM1 5c3.9-3.9 10.1-3.9 14 0l-1 1c-3.3-3.3-8.7-3.3-12 0l-1-1z"/></svg>
                              <div className="flex items-center"><div className="w-6 h-3 border border-black rounded-sm flex items-center p-[1px]"><div className="bg-black h-full w-[85%] rounded-[1px]" /></div><div className="w-[2px] h-[4px] bg-black rounded-r-sm ml-[1px]" /></div>
                            </div>
                          </div>
                          <div className="px-2 pb-2 max-h-[480px] overflow-y-auto">
                            {previewTab === "email" && <EmailPreview isPhone={true} />}
                            {previewTab === "sms" && <SMSPreview isPhone={true} />}
                            {previewTab === "document" && <QuoteDocPreview isPhone={true} />}
                          </div>
                          <div className="h-8 flex items-center justify-center bg-white">
                            <div className="w-32 h-1 bg-black rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-[-2px] top-24 w-[3px] h-12 bg-gradient-to-b from-[#8a8a8f] to-[#6e6e73] rounded-r-sm" />
                    <div className="absolute left-[-2px] top-20 w-[3px] h-7 bg-gradient-to-b from-[#8a8a8f] to-[#6e6e73] rounded-l-sm" />
                    <div className="absolute left-[-2px] top-32 w-[3px] h-12 bg-gradient-to-b from-[#8a8a8f] to-[#6e6e73] rounded-l-sm" />
                  </div>
                ) : (
                  <div className="w-full max-w-lg">
                    <div className="bg-gradient-to-b from-[#e8e8e8] to-[#d8d8d8] rounded-t-xl border border-gray-300 border-b-0 shadow-sm">
                      <div className="flex items-center px-3 py-2.5">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-sm" />
                          <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#dea123] shadow-sm" />
                          <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] shadow-sm" />
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <button className="w-7 h-7 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <button className="w-7 h-7 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </button>
                        </div>
                        <div className="flex-1 mx-3">
                          <div className="bg-white rounded-lg border border-gray-300 px-3 py-1.5 flex items-center gap-2 shadow-inner">
                            <Lock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600 flex-1 truncate">
                              {previewTab === "email" ? "mail.google.com/inbox" : previewTab === "sms" ? "messages.google.com" : "heritagels.org/quotes"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-b-xl border border-gray-300 border-t-0 shadow-xl max-h-[420px] overflow-y-auto">
                      <div className="p-4">
                        {previewTab === "email" && <EmailPreview isPhone={false} />}
                        {previewTab === "sms" && <SMSPreview isPhone={false} />}
                        {previewTab === "document" && <QuoteDocPreview isPhone={false} />}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* EXISTING MODALS                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <CreateQuoteModal open={showCreateQuote} onOpenChange={setShowCreateQuote} onCreateQuote={handleCreateQuote} />
      <QuoteDetailDrawer open={showQuoteDetail} onOpenChange={setShowQuoteDetail} quote={selectedQuote}
        onUpdateStatus={handleUpdateStatus} onDelete={handleDeleteQuote}
        onCreateVersion={(id) => createQuoteVersion(id)} onUpdateSignature={(id, s) => updateQuoteSignature(id, s)} />

      {/* Quick Templates Modal */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="sm:max-w-md p-0 border-0 overflow-hidden"
          style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderRadius: RADIUS.card, boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)' }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Zap className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <span className="text-lg font-semibold text-gray-900">Quick Templates</span>
                <p className="text-xs text-gray-500 font-normal">Start from a pre-built quote</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-2">
            {QUOTE_TEMPLATES.map((template) => (
              <motion.button key={template.id} className="w-full p-4 border border-gray-100 hover:border-violet-200 hover:bg-violet-50/40 cursor-pointer transition-all text-left"
                style={{ borderRadius: RADIUS.button }} onClick={() => handleUseTemplate(template)}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }} transition={{ duration: MOTION.duration.hover }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-sm text-gray-500">{productLabels[template.product]}{template.term ? ` - ${template.term} Year` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-violet-700">${template.monthlyPremium}/mo</p>
                    <p className="text-xs text-gray-400">${template.coverageAmount.toLocaleString()}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quote Comparison Modal */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="sm:max-w-4xl p-0 border-0 overflow-hidden"
          style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderRadius: RADIUS.card, boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)' }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <GitCompare className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <span className="text-lg font-semibold text-gray-900">Compare Quotes</span>
                <p className="text-xs text-gray-500 font-normal">{compareQuotes.length} quotes selected</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            {compareQuotes.length === 0 ? (
              <div className="text-center py-8">
                <GitCompare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">Select quotes to compare by clicking the checkboxes</p>
              </div>
            ) : (
              <div className="overflow-x-auto" style={{ borderRadius: RADIUS.button }}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left p-3 text-sm font-medium text-gray-500">Feature</th>
                      {compareQuotes.map((q) => (
                        <th key={q.id} className="text-center p-3">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold text-gray-900">{q.clientName}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-red-500" onClick={() => toggleCompareQuote(q)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 text-sm text-gray-500">Product</td>
                      {compareQuotes.map((q) => <td key={q.id} className="p-3 text-center font-medium text-gray-900">{productLabels[q.product]}{q.term ? ` - ${q.term}yr` : ''}</td>)}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 text-sm text-gray-500">Coverage</td>
                      {compareQuotes.map((q) => <td key={q.id} className="p-3 text-center font-medium text-gray-900">${q.coverageAmount.toLocaleString()}</td>)}
                    </tr>
                    <tr className="border-b border-gray-100 bg-violet-50/50">
                      <td className="p-3 text-sm text-violet-700 font-medium">Premium</td>
                      {compareQuotes.map((q) => <td key={q.id} className="p-3 text-center font-bold text-violet-700">${q.monthlyPremium.toLocaleString()}/mo</td>)}
                    </tr>
                    {compareQuotes.some(q => q.carrier) && (
                      <tr className="border-b border-gray-100">
                        <td className="p-3 text-sm text-gray-500">Carrier</td>
                        {compareQuotes.map((q) => <td key={q.id} className="p-3 text-center text-sm text-gray-700">{q.carrier || '—'}</td>)}
                      </tr>
                    )}
                    <tr className="border-b border-gray-100">
                      <td className="p-3 text-sm text-gray-500">Status</td>
                      {compareQuotes.map((q) => {
                        const s = statusConfig[q.status];
                        return <td key={q.id} className="p-3 text-center"><Badge className={cn("text-xs border-0", s.color)} style={{ borderRadius: RADIUS.pill }}>{s.label}</Badge></td>;
                      })}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 text-sm text-gray-500">Created</td>
                      {compareQuotes.map((q) => <td key={q.id} className="p-3 text-center text-sm text-gray-700">{formatQuoteDate(q.createdDate)}</td>)}
                    </tr>
                    <tr>
                      <td className="p-3 text-sm text-gray-500">Expires</td>
                      {compareQuotes.map((q) => {
                        const exp = isExpired(q.expiresDate);
                        return <td key={q.id} className={cn("p-3 text-center text-sm", exp ? "text-red-500" : "text-gray-700")}>{formatQuoteDate(q.expiresDate)}{exp && ' (expired)'}</td>;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AgentLoungeLayout>
  );
}
