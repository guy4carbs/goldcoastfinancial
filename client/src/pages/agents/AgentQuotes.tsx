import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useAgentStore, type Quote } from "@/lib/agentStore";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Eye,
  ChevronRight,
  Zap,
  GitCompare,
  X,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, AgentPageHero } from "@/components/agent/primitives";
import { CreateQuoteModal } from "@/components/agent/CreateQuoteModal";
import { QuoteDetailDrawer } from "@/components/agent/QuoteDetailDrawer";
import { toast } from "sonner";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

// Maximum quotes that can be compared at once
const MAX_COMPARE = 3;

// Quick Quote Templates with numeric values matching store schema
const QUOTE_TEMPLATES = [
  { id: 't1', name: 'Basic Term 20', product: 'term' as const, term: 20, coverageAmount: 250000, monthlyPremium: 25 },
  { id: 't2', name: 'Family Protection', product: 'term' as const, term: 30, coverageAmount: 500000, monthlyPremium: 45 },
  { id: 't3', name: 'Mortgage Protection', product: 'term' as const, term: 20, coverageAmount: 300000, monthlyPremium: 35 },
  { id: 't4', name: 'Whole Life Starter', product: 'whole' as const, coverageAmount: 100000, monthlyPremium: 85 },
  { id: 't5', name: 'Final Expense Basic', product: 'final_expense' as const, coverageAmount: 15000, monthlyPremium: 30 },
];

// Using fadeInUp from heritageDesignSystem

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
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isExpired(expiresDate: string): boolean {
  return new Date(expiresDate) < new Date();
}

// Demo quotes matching store schema
const DEMO_QUOTES: Quote[] = [
  {
    id: 'demo-q1',
    clientName: 'John Smith',
    clientEmail: 'john@example.com',
    clientPhone: '555-0101',
    product: 'term',
    coverageAmount: 500000,
    monthlyPremium: 45,
    term: 20,
    status: 'draft',
    createdDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    expiresDate: new Date(Date.now() + 23 * 86400000).toISOString().split('T')[0],
    agentId: 'agent-1',
  },
  {
    id: 'demo-q2',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@example.com',
    clientPhone: '555-0102',
    product: 'whole',
    coverageAmount: 250000,
    monthlyPremium: 125,
    status: 'sent',
    createdDate: new Date(Date.now() - 9 * 86400000).toISOString().split('T')[0],
    expiresDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
    agentId: 'agent-1',
  },
  {
    id: 'demo-q3',
    clientName: 'Michael Brown',
    clientEmail: 'michael@example.com',
    clientPhone: '555-0103',
    product: 'iul',
    coverageAmount: 300000,
    monthlyPremium: 200,
    status: 'accepted',
    createdDate: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
    expiresDate: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
    agentId: 'agent-1',
  },
  {
    id: 'demo-q4',
    clientName: 'Emily Davis',
    clientEmail: 'emily@example.com',
    clientPhone: '555-0104',
    product: 'final_expense',
    coverageAmount: 25000,
    monthlyPremium: 35,
    status: 'expired',
    createdDate: new Date(Date.now() - 38 * 86400000).toISOString().split('T')[0],
    expiresDate: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
    agentId: 'agent-1',
  },
];

export default function AgentQuotes() {
  const { quotes: storeQuotes, addQuote, updateQuoteStatus, createQuoteVersion, updateQuoteSignature } = useAgentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateQuote, setShowCreateQuote] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showQuoteDetail, setShowQuoteDetail] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [compareQuotes, setCompareQuotes] = useState<Quote[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Use store quotes, falling back to demo data
  const quotes = storeQuotes.length > 0 ? storeQuotes : DEMO_QUOTES;

  const filteredQuotes = useMemo(() => quotes.filter(quote => {
    const matchesSearch = quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         productLabels[quote.product].toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;
    return matchesSearch && matchesStatus;
  }), [quotes, searchQuery, filterStatus]);

  const stats = useMemo(() => ({
    total: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent' || q.status === 'viewed').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
  }), [quotes]);

  const handleCreateQuote = (quoteData: {
    clientName: string;
    product: string;
    carrier: string;
    coverageAmount: string;
    premium: string;
    healthClass: string;
  }) => {
    const coverageNum = parseInt(quoteData.coverageAmount.replace(/[^0-9]/g, '')) || 0;
    const premiumNum = parseInt(quoteData.premium.replace(/[^0-9]/g, '')) || 0;

    // Map product label back to store enum
    const productMap: Record<string, Quote['product']> = {
      '10-Year Term': 'term',
      '20-Year Term': 'term',
      '30-Year Term': 'term',
      'Whole Life': 'whole',
      'IUL': 'iul',
      'Final Expense': 'final_expense',
    };

    addQuote({
      clientName: quoteData.clientName,
      clientEmail: '',
      clientPhone: '',
      product: productMap[quoteData.product] || 'term',
      coverageAmount: coverageNum,
      monthlyPremium: premiumNum,
      carrier: quoteData.carrier,
      healthClass: quoteData.healthClass,
    });
    toast.success('Quote created');
  };

  const handleQuoteClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowQuoteDetail(true);
  };

  const handleUpdateStatus = (quoteId: string, newStatus: string) => {
    updateQuoteStatus(quoteId, newStatus as QuoteStatus);
    if (selectedQuote?.id === quoteId) {
      setSelectedQuote(prev => prev ? { ...prev, status: newStatus as QuoteStatus } : null);
    }
  };

  const handleDeleteQuote = (quoteId: string) => {
    // For demo quotes, just close the drawer
    setShowQuoteDetail(false);
    setSelectedQuote(null);
    toast.success('Quote deleted');
  };

  const handleUseTemplate = (template: typeof QUOTE_TEMPLATES[0]) => {
    addQuote({
      clientName: 'New Client',
      clientEmail: '',
      clientPhone: '',
      product: template.product,
      coverageAmount: template.coverageAmount,
      monthlyPremium: template.monthlyPremium,
      term: template.term,
    });
    setShowTemplates(false);
    toast.success(`Quote created from "${template.name}" template`);
  };

  const toggleCompareQuote = useCallback((quote: Quote) => {
    setCompareQuotes(prev => {
      if (prev.find(q => q.id === quote.id)) {
        return prev.filter(q => q.id !== quote.id);
      }
      if (prev.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} quotes`);
        return prev;
      }
      return [...prev, quote];
    });
  }, []);

  const handleCreateVersion = (quoteId: string) => {
    createQuoteVersion(quoteId);
  };

  const handleUpdateSignature = (quoteId: string, status: 'pending' | 'sent' | 'signed' | 'declined') => {
    updateQuoteSignature(quoteId, status);
  };

  const allStatuses: { value: string; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'expired', label: 'Expired' },
  ];

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={FileText}
            title="Quotes"
            subtitle="Create and manage insurance quotes for your clients"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplates(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                style={{ borderRadius: RADIUS.button }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Quick Template
              </Button>
              {compareQuotes.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare ({compareQuotes.length})
                </Button>
              )}
              <Button
                className="bg-white text-violet-600 hover:bg-white/90 shadow-lg font-semibold"
                style={{ borderRadius: RADIUS.button }}
                onClick={() => setShowCreateQuote(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Quote
              </Button>
            </div>
          </AgentPageHero>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Quotes', value: stats.total, icon: FileText, gradient: 'from-violet-400 to-purple-500' },
            { label: 'Draft', value: stats.draft, icon: Clock, gradient: 'from-amber-400 to-orange-500' },
            { label: 'Sent / Viewed', value: stats.sent, icon: Send, gradient: 'from-blue-400 to-cyan-500' },
            { label: 'Accepted', value: stats.accepted, icon: CheckCircle2, gradient: 'from-emerald-400 to-green-500' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover }}
            >
              <Card className="border-0 overflow-hidden relative" style={{ borderRadius: RADIUS.card, boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
                <div style={{ width: 80, height: 80 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
                <div style={{ width: 50, height: 50 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/4" />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-white/20 backdrop-blur">
                      <stat.icon className="w-5 h-5 text-amber-200" aria-hidden="true" />
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
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <Input
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
              style={{ borderRadius: RADIUS.input }}
              aria-label="Search quotes by client name or product"
            />
          </div>
          <div
            className="flex gap-1 p-1"
            style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            role="group"
            aria-label="Filter quotes by status"
          >
            {allStatuses.map((s) => (
              <Button
                key={s.value}
                variant="ghost"
                size="sm"
                onClick={() => setFilterStatus(s.value)}
                className={cn(
                  "h-8 px-3 text-xs font-medium transition-all",
                  filterStatus === s.value
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
                style={{ borderRadius: RADIUS.button }}
                aria-pressed={filterStatus === s.value}
                aria-label={`Filter by ${s.label}`}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Quotes List */}
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
              {filteredQuotes.length === 0 ? (
                searchQuery || filterStatus !== 'all' ? (
                  <div className="text-center py-12">
                    <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600 font-medium">No quotes match your filters</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
                    <Button
                      variant="link"
                      className="mt-2 text-violet-600"
                      onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="No quotes found"
                    description="Create your first quote to get started"
                    action={{
                      label: "Create Quote",
                      onClick: () => setShowCreateQuote(true),
                      icon: Plus,
                    }}
                    variant="card"
                  />
                )
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredQuotes.map((quote) => {
                    const status = statusConfig[quote.status];
                    const StatusIcon = status.icon;
                    const expired = isExpired(quote.expiresDate);
                    return (
                      <div
                        key={quote.id}
                        className={cn(
                          "px-5 py-4 hover:bg-violet-50/40 transition-colors cursor-pointer",
                          compareQuotes.find(q => q.id === quote.id) && "bg-violet-50/60"
                        )}
                        onClick={() => handleQuoteClick(quote)}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            onClick={(e) => { e.stopPropagation(); toggleCompareQuote(quote); }}
                            role="presentation"
                          >
                            <Checkbox
                              checked={!!compareQuotes.find(q => q.id === quote.id)}
                              onCheckedChange={() => toggleCompareQuote(quote)}
                              aria-label={`Select ${quote.clientName} for comparison`}
                            />
                          </div>
                          <div
                            className="w-10 h-10 flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            {quote.clientName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{quote.clientName}</p>
                              <Badge
                                className={cn("text-[10px] border-0", status.color)}
                                style={{ borderRadius: RADIUS.pill }}
                                aria-label={`Status: ${status.label}`}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" aria-hidden="true" />
                                {status.label}
                              </Badge>
                              {expired && quote.status !== 'expired' && (
                                <Badge
                                  className="text-[10px] bg-red-100 text-red-600 border-0"
                                  style={{ borderRadius: RADIUS.pill }}
                                  aria-label="Quote has expired"
                                >
                                  Expired
                                </Badge>
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
                            <p className={cn("text-xs", expired ? "text-red-500" : "text-gray-400")}>
                              Expires {formatQuoteDate(quote.expiresDate)}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <CreateQuoteModal
        open={showCreateQuote}
        onOpenChange={setShowCreateQuote}
        onCreateQuote={handleCreateQuote}
      />

      <QuoteDetailDrawer
        open={showQuoteDetail}
        onOpenChange={setShowQuoteDetail}
        quote={selectedQuote}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeleteQuote}
        onCreateVersion={handleCreateVersion}
        onUpdateSignature={handleUpdateSignature}
      />

      {/* Quick Templates Modal */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent
          className="sm:max-w-md p-0 border-0 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: RADIUS.card,
            boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)',
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25"
              >
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
              <motion.button
                key={template.id}
                className="w-full p-4 border border-gray-100 hover:border-violet-200 hover:bg-violet-50/40 cursor-pointer transition-all text-left"
                style={{ borderRadius: RADIUS.button }}
                onClick={() => handleUseTemplate(template)}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                transition={{ duration: MOTION.duration.hover }}
                aria-label={`Use ${template.name} template: $${template.monthlyPremium}/mo, $${template.coverageAmount.toLocaleString()} coverage`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-sm text-gray-500">
                      {productLabels[template.product]}{template.term ? ` - ${template.term} Year` : ''}
                    </p>
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
        <DialogContent
          className="sm:max-w-4xl p-0 border-0 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: RADIUS.card,
            boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)',
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25"
              >
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
                  <caption className="sr-only">Side-by-side comparison of selected quotes</caption>
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left p-3 text-sm font-medium text-gray-500">Feature</th>
                      {compareQuotes.map((q) => (
                        <th key={q.id} className="text-center p-3">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold text-gray-900">{q.clientName}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                              onClick={() => toggleCompareQuote(q)}
                              aria-label={`Remove ${q.clientName} from comparison`}
                            >
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
                      {compareQuotes.map((q) => (
                        <td key={q.id} className="p-3 text-center font-medium text-gray-900">
                          {productLabels[q.product]}{q.term ? ` - ${q.term}yr` : ''}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 text-sm text-gray-500">Coverage</td>
                      {compareQuotes.map((q) => (
                        <td key={q.id} className="p-3 text-center font-medium text-gray-900">
                          ${q.coverageAmount.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100 bg-violet-50/50">
                      <td className="p-3 text-sm text-violet-700 font-medium">Premium</td>
                      {compareQuotes.map((q) => (
                        <td key={q.id} className="p-3 text-center font-bold text-violet-700">
                          ${q.monthlyPremium.toLocaleString()}/mo
                        </td>
                      ))}
                    </tr>
                    {compareQuotes.some(q => q.carrier) && (
                      <tr className="border-b border-gray-100">
                        <td className="p-3 text-sm text-gray-500">Carrier</td>
                        {compareQuotes.map((q) => (
                          <td key={q.id} className="p-3 text-center text-sm text-gray-700">{q.carrier || '—'}</td>
                        ))}
                      </tr>
                    )}
                    <tr className="border-b border-gray-100">
                      <td className="p-3 text-sm text-gray-500">Status</td>
                      {compareQuotes.map((q) => {
                        const s = statusConfig[q.status];
                        return (
                          <td key={q.id} className="p-3 text-center">
                            <Badge className={cn("text-xs border-0", s.color)} style={{ borderRadius: RADIUS.pill }}>{s.label}</Badge>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 text-sm text-gray-500">Created</td>
                      {compareQuotes.map((q) => (
                        <td key={q.id} className="p-3 text-center text-sm text-gray-700">{formatQuoteDate(q.createdDate)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-sm text-gray-500">Expires</td>
                      {compareQuotes.map((q) => {
                        const expired = isExpired(q.expiresDate);
                        return (
                          <td key={q.id} className={cn("p-3 text-center text-sm", expired ? "text-red-500" : "text-gray-700")}>
                            {formatQuoteDate(q.expiresDate)}
                            {expired && ' (expired)'}
                          </td>
                        );
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
