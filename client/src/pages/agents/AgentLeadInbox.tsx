import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, UserPlus, Inbox, ArrowUpDown,
  Sparkles, Clock, Briefcase, CheckCircle, Send, ArrowRight, FileSpreadsheet,
  AlertCircle, RefreshCw, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn, formatProductLabel } from "@/lib/utils";
import { toast } from "sonner";
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { generateAgentSlug } from "@/lib/agentSlugUtils";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives";
import { LeadInboxCard } from "@/components/agent/LeadInboxCard";
import { LeadDetailDrawer } from "@/components/agent/LeadDetailDrawer";
import { AddLeadModal } from "@/components/agent/AddLeadModal";
import { LeadImportDialog } from "@/components/agent/LeadImportDialog";
import { EnhancedActivityModal } from "@/components/agent/EnhancedActivityModal";
import { RADIUS, SHADOW, MOTION, TYPE, fadeInUp, staggerContainer } from '@/lib/heritageDesignSystem';
import { TOUR } from "@/lib/tour/selectors";
import { useLeadInbox } from '@/hooks/useLeadDistribution';
import { useQueryClient } from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// Backend persistence helpers — fire-and-forget with console warnings on failure
// ---------------------------------------------------------------------------

/** Persist a lead status change to the CRM backend (non-blocking). */
async function persistLeadStatus(dbId: string, status: string): Promise<void> {
  try {
    const res = await fetch(`/api/crm/leads/${dbId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      console.warn('[LeadInbox] Failed to persist status change:', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.warn('[LeadInbox] Failed to persist status change:', err);
  }
}

/** Persist a lead activity to the CRM backend (non-blocking). */
async function persistLeadActivity(
  dbId: string,
  activity: { type: string; disposition?: string; notes: string },
): Promise<void> {
  try {
    const res = await fetch(`/api/crm/leads/${dbId}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        type: activity.type,
        title: `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} logged`,
        description: activity.notes,
        metadata: activity.disposition ? { disposition: activity.disposition } : undefined,
      }),
    });
    if (!res.ok) {
      console.warn('[LeadInbox] Failed to persist activity:', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.warn('[LeadInbox] Failed to persist activity:', err);
  }
}

/** Persist lead notes to the CRM backend (non-blocking). */
async function persistLeadNotes(dbId: string, notes: string): Promise<void> {
  try {
    const res = await fetch(`/api/crm/leads/${dbId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) {
      console.warn('[LeadInbox] Failed to persist lead notes:', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.warn('[LeadInbox] Failed to persist lead notes:', err);
  }
}

/** Persist a lead follow-up update to the CRM backend (non-blocking). */
async function persistLeadFollowUp(dbId: string, nextFollowUp: string): Promise<void> {
  try {
    const res = await fetch(`/api/crm/leads/${dbId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ nextFollowUp }),
    });
    if (!res.ok) {
      console.warn('[LeadInbox] Failed to persist follow-up:', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.warn('[LeadInbox] Failed to persist follow-up:', err);
  }
}

type TabId = 'all' | 'new' | 'distributed' | 'referrals' | 'website' | 'in_progress' | 'closed';
type SortBy = 'newest' | 'oldest' | 'name' | 'urgency';

const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'distributed', label: 'Distributed' },
  { id: 'referrals', label: 'Referrals' },
  { id: 'website', label: 'Website' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'closed', label: 'Closed' },
];

export default function AgentLeadInbox() {
  const queryClient = useQueryClient();
  const {
    leads,
    currentUser,
    addLead,
    addActivityToLead,
    updateLeadFollowUp,
    updateLeadStatus,
    graduateLeadToBook,
    getLeadsDueToday,
    fetchWebsiteLeads,
    fetchReferralLeads,
  } = useAgentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const LEADS_PER_PAGE = 25;
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityLead, setActivityLead] = useState<Lead | null>(null);
  const [websiteLeadError, setWebsiteLeadError] = useState(false);
  const [referralLeadError, setReferralLeadError] = useState(false);

  // Fetch distributed leads from real API
  const distributedQuery = useLeadInbox({ limit: 200, enabled: !!currentUser?.id });

  // Merge API-distributed leads into store (cleaned names, deduped, preserving dbId)
  useEffect(() => {
    if (distributedQuery.data?.leads && distributedQuery.data.leads.length > 0) {
      for (const apiLead of distributedQuery.data.leads) {
        let first = (apiLead.firstName || '').trim();
        let last = (apiLead.lastName || '').trim();
        if (first.includes(',')) {
          const parts = first.split(',').map((s: string) => s.trim());
          last = parts[0];
          first = parts[1]?.split(' ')[0] || '';
        }
        first = first ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : '';
        last = last ? last.charAt(0).toUpperCase() + last.slice(1).toLowerCase() : '';
        const name = `${first} ${last}`.trim();
        const email = (apiLead.email || '').toLowerCase().trim();
        const phone = (apiLead.phone || '').trim();

        if (!name) continue;
        const exists = leads.some(l =>
          (email && l.email.toLowerCase() === email) ||
          (phone && l.phone === phone) ||
          l.name === name
        );
        if (!exists) {
          addLead({
            name,
            email,
            phone,
            product: apiLead.coverageType || 'Life Insurance',
            source: 'Distributed',
            status: apiLead.status || 'new',
            tags: ['Distributed'],
            state: apiLead.state || '',
            dbId: apiLead.id ? String(apiLead.id) : undefined,
            nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            nextFollowUpType: 'call',
          });
        }
      }
    }
  }, [distributedQuery.data]);

  // Fetch website leads + referral leads on mount
  useEffect(() => {
    if (currentUser?.name) {
      const slug = generateAgentSlug(currentUser.name);
      fetchWebsiteLeads(slug).catch(() => setWebsiteLeadError(true));
    }
    fetchReferralLeads().catch(() => setReferralLeadError(true));
  }, [currentUser?.name]);

  // Get user's leads
  const userLeads = useMemo(() =>
    leads.filter(l => l.assignedTo === currentUser?.id),
    [leads, currentUser]
  );

  // Compute counts for tabs
  const counts = useMemo(() => {
    const active = userLeads.filter(l => !['closed', 'lost'].includes(l.status));
    return {
      all: active.length,
      new: userLeads.filter(l => l.status === 'new').length,
      distributed: userLeads.filter(l => l.source === 'Distributed' || (l.tags || []).includes('Distributed')).length,
      referrals: userLeads.filter(l => l.source === 'Referral' || (l.tags || []).includes('Referral')).length,
      website: userLeads.filter(l => l.source === 'Website' || l.source === 'Schedule Call' || (l.tags || []).includes('Website Lead')).length,
      in_progress: userLeads.filter(l => ['contacted', 'qualified', 'proposal'].includes(l.status)).length,
      closed: userLeads.filter(l => l.status === 'closed').length,
    };
  }, [userLeads]);

  // Stats
  const todayCount = getLeadsDueToday().length;

  // Filter + sort
  const filteredLeads = useMemo(() => {
    let result = userLeads;

    // Tab filter
    switch (activeTab) {
      case 'all':
        result = result.filter(l => !['closed', 'lost'].includes(l.status));
        break;
      case 'new':
        result = result.filter(l => l.status === 'new');
        break;
      case 'distributed':
        result = result.filter(l => l.source === 'Distributed' || (l.tags || []).includes('Distributed'));
        break;
      case 'referrals':
        result = result.filter(l => l.source === 'Referral' || (l.tags || []).includes('Referral'));
        break;
      case 'website':
        result = result.filter(l => l.source === 'Website' || l.source === 'Schedule Call' || (l.tags || []).includes('Website Lead'));
        break;
      case 'in_progress':
        result = result.filter(l => ['contacted', 'qualified', 'proposal'].includes(l.status));
        break;
      case 'closed':
        result = result.filter(l => l.status === 'closed');
        break;
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result = [...result].sort((a, b) => b.createdDate.localeCompare(a.createdDate));
        break;
      case 'oldest':
        result = [...result].sort((a, b) => a.createdDate.localeCompare(b.createdDate));
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [userLeads, activeTab, searchQuery, sortBy]);

  // Dedup + paginate
  const dedupedLeads = useMemo(() => {
    const seen = new Set<string>();
    return filteredLeads.filter(l => {
      const key = `${(l.email || '').toLowerCase()}|${l.phone || ''}|${l.name || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredLeads]);
  const totalPages = Math.ceil(dedupedLeads.length / LEADS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(totalPages - 1, 0));
  const paginatedLeads = dedupedLeads.slice(safePage * LEADS_PER_PAGE, safePage * LEADS_PER_PAGE + LEADS_PER_PAGE);

  // Reset to page 0 when filters change
  const filterKey = `${activeTab}-${searchQuery}-${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(0);
  }

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const handleQuickCall = (lead: Lead) => {
    window.location.href = `tel:${lead.phone}`;
  };

  const handleQuickActivity = (lead: Lead) => {
    setActivityLead(lead);
    setActivityModalOpen(true);
  };

  // -----------------------------------------------------------------------
  // Persisted wrappers: update Zustand immediately, then fire API calls
  // -----------------------------------------------------------------------

  /** Update status in store + persist to CRM backend. */
  const handleUpdateStatus = useCallback(
    (leadId: string, status: Lead['status']) => {
      // Immediate UI update
      updateLeadStatus(leadId, status);
      // Find the lead's backend ID and persist (non-blocking)
      const lead = leads.find(l => l.id === leadId);
      if (lead?.dbId) {
        persistLeadStatus(lead.dbId, status);
      }
    },
    [leads, updateLeadStatus],
  );

  /** Add activity to store + persist to CRM backend. */
  const handleAddActivity = useCallback(
    (leadId: string, activity: Parameters<typeof addActivityToLead>[1]) => {
      // Immediate UI update
      addActivityToLead(leadId, activity);
      // Persist (non-blocking)
      const lead = leads.find(l => l.id === leadId);
      if (lead?.dbId) {
        persistLeadActivity(lead.dbId, {
          type: activity.type,
          disposition: activity.disposition,
          notes: activity.notes,
        });
      }
    },
    [leads, addActivityToLead],
  );

  /** Add lead to store + persist to CRM backend via POST. */
  const handleAddLead = useCallback(
    async (lead: Parameters<typeof addLead>[0]) => {
      try {
        // Split combined name into first/last for the backend
        const nameParts = (lead.name || '').trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const res = await fetch('/api/crm/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            firstName,
            lastName,
            email: lead.email,
            phone: lead.phone,
            coverageType: lead.product,
            source: lead.source || 'manual',
            notes: lead.leadNotes,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // Add to Zustand with backend ID for future persistence
          addLead({ ...lead, dbId: data.lead?.id ? String(data.lead.id) : undefined });
          toast.success('Lead added successfully');
        } else {
          // Fallback: still add to local store
          addLead(lead);
          toast.success('Lead added locally');
        }
      } catch {
        // Fallback: still add to local store
        addLead(lead);
        toast.success('Lead added locally');
      }
    },
    [addLead],
  );

  const handleLogActivity = (data: {
    type: any;
    disposition?: any;
    notes: string;
    nextFollowUpDate?: string;
    nextFollowUpType?: Lead['nextFollowUpType'];
  }) => {
    if (!activityLead) return;

    // Immediate Zustand update
    addActivityToLead(activityLead.id, {
      type: data.type,
      disposition: data.disposition,
      notes: data.notes,
    });
    if (data.nextFollowUpDate && data.nextFollowUpType) {
      updateLeadFollowUp(activityLead.id, data.nextFollowUpDate, data.nextFollowUpType);
    }

    // Persist to backend (non-blocking)
    if (activityLead.dbId) {
      persistLeadActivity(activityLead.dbId, {
        type: data.type,
        disposition: data.disposition,
        notes: data.notes,
      });
      if (data.nextFollowUpDate) {
        persistLeadFollowUp(activityLead.dbId, data.nextFollowUpDate);
      }
    }

    setActivityModalOpen(false);
    setActivityLead(null);
  };

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Hero */}
        <motion.div data-tour-id={TOUR.AGENT.INBOX.HEADER} variants={fadeInUp}>
          <AgentPageHero
            icon={Inbox}
            title="Lead Inbox"
            subtitle={`${counts.all} active leads · ${counts.new} new`}
          >
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setImportOpen(true)}
                className="gap-2 text-white border-0 backdrop-blur-sm hover:scale-105 transition-transform"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: RADIUS.button }}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Import
              </Button>
              <Button
                onClick={() => setAddLeadOpen(true)}
                className="gap-2 text-white border-0 backdrop-blur-sm hover:scale-105 transition-transform"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: RADIUS.button }}
              >
                <UserPlus className="w-4 h-4" />
                Add Lead
              </Button>
            </div>
          </AgentPageHero>
        </motion.div>

        {/* Stats */}
        <motion.div data-tour-id={TOUR.AGENT.INBOX.STATS} variants={fadeInUp}>
          <AgentStatCardGrid>
            <AgentStatCard icon={Sparkles} value={counts.new} label="New Leads" gradient="from-purple-500 to-violet-600" />
            <AgentStatCard icon={Send} value={counts.distributed} label="Distributed" gradient="from-blue-500 to-indigo-600" />
            <AgentStatCard icon={Clock} value={todayCount} label="Due Today" gradient="from-red-500 to-rose-600" />
            <AgentStatCard icon={ArrowRight} value={counts.in_progress} label="In Progress" gradient="from-amber-500 to-orange-500" />
          </AgentStatCardGrid>
        </motion.div>

        {/* Search + Sort */}
        <motion.div data-tour-id={TOUR.AGENT.INBOX.FILTERS} variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
              style={{ borderRadius: RADIUS.input }}
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-full sm:w-44 h-11" style={{ borderRadius: RADIUS.input }}>
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Lead List Card */}
        <motion.div
          data-tour-id={TOUR.AGENT.INBOX.LIST}
          variants={fadeInUp}
          className="border bg-white overflow-hidden"
          style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
        >
          {/* Tab bar */}
          <div className="flex items-center gap-1 px-4 py-3 border-b bg-muted/30 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-primary text-white font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tab.label}
                <span className={cn(
                  "ml-1.5 text-xs",
                  activeTab === tab.id ? "text-white/70" : "text-muted-foreground/60"
                )}>
                  {counts[tab.id]}
                </span>
              </button>
            ))}
          </div>

          {/* Distributed leads error banner */}
          {distributedQuery.isError && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border-b border-red-100 text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm flex-1">Failed to load distributed leads.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => distributedQuery.refetch()}
                className="gap-1.5 text-red-700 hover:text-red-800 hover:bg-red-100 h-7 px-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </Button>
            </div>
          )}

          {/* Website leads warning */}
          {websiteLeadError && (
            <div className="mx-4 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Website leads may not be up to date.</span>
            </div>
          )}

          {/* Referral leads warning */}
          {referralLeadError && (
            <div className="mx-4 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Referral leads may not be up to date.</span>
            </div>
          )}

          {/* Loading state */}
          {distributedQuery.isLoading && leads.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              <span className="ml-3 text-gray-500">Loading your leads...</span>
            </div>
          )}

          {/* Lead rows */}
          <div className="divide-y">
            <AnimatePresence mode="popLayout">
              {paginatedLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  <LeadInboxCard
                    lead={lead}
                    isNew={lead.status === 'new'}
                    onClick={() => handleLeadClick(lead)}
                    onQuickCall={() => handleQuickCall(lead)}
                    onQuickActivity={() => handleQuickActivity(lead)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (() => {
            const current = safePage + 1;
            const goTo = (page: number) => (e: React.MouseEvent) => {
              e.preventDefault();
              setCurrentPage(Math.max(0, Math.min(totalPages - 1, page - 1)));
            };
            const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              if (current > 3) pages.push('ellipsis-left');
              const start = Math.max(2, current - 1);
              const end = Math.min(totalPages - 1, current + 1);
              for (let i = start; i <= end; i++) pages.push(i);
              if (current < totalPages - 2) pages.push('ellipsis-right');
              pages.push(totalPages);
            }
            const atStart = safePage === 0;
            const atEnd = safePage >= totalPages - 1;
            return (
              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-100"
                style={{ borderBottomLeftRadius: RADIUS.card, borderBottomRightRadius: RADIUS.card }}
              >
                <p className="text-xs text-gray-500">
                  {safePage * LEADS_PER_PAGE + 1}–{Math.min((safePage + 1) * LEADS_PER_PAGE, dedupedLeads.length)} of {dedupedLeads.length} leads
                </p>
                <Pagination className="mx-0 sm:justify-end w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!atStart) setCurrentPage((p) => p - 1);
                        }}
                        aria-disabled={atStart}
                        tabIndex={atStart ? -1 : 0}
                        className={cn(atStart && 'pointer-events-none opacity-50')}
                        style={{ borderRadius: RADIUS.button }}
                      />
                    </PaginationItem>
                    {pages.map((p, idx) =>
                      p === 'ellipsis-left' || p === 'ellipsis-right' ? (
                        <PaginationItem key={`${p}-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === current}
                            onClick={goTo(p)}
                            style={{ borderRadius: RADIUS.button }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!atEnd) setCurrentPage((p) => p + 1);
                        }}
                        aria-disabled={atEnd}
                        tabIndex={atEnd ? -1 : 0}
                        className={cn(atEnd && 'pointer-events-none opacity-50')}
                        style={{ borderRadius: RADIUS.button }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            );
          })()}

          {/* Empty state */}
          {filteredLeads.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No leads found</p>
              <p className="text-xs mt-1">
                {searchQuery
                  ? "Try adjusting your search"
                  : activeTab === 'referrals'
                    ? "Referral leads will appear here when clients share your link"
                    : activeTab === 'distributed'
                      ? "Leads distributed by your manager will appear here"
                      : "Leads from your website, referrals, and manager will appear here"}
              </p>
            </div>
          )}
        </motion.div>

        {/* Closed Leads — Graduate to Book of Business */}
        {activeTab !== 'closed' && userLeads.filter(l => l.status === 'closed').length > 0 && (
          <motion.div variants={fadeInUp} className="border-2 border-dashed border-emerald-200 overflow-hidden" style={{ borderRadius: RADIUS.card }}>
            <div className="flex items-center justify-between p-4 bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-700">Ready to Graduate</span>
                <Badge variant="secondary" className="text-xs text-emerald-600">
                  {userLeads.filter(l => l.status === 'closed').length}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-white space-y-3">
              {userLeads.filter(l => l.status === 'closed').map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100" style={{ borderRadius: RADIUS.button }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>{lead.name}</p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{formatProductLabel(lead.product)} · {lead.phone}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      graduateLeadToBook(lead.id);
                      queryClient.invalidateQueries({ queryKey: ['/api/book-of-business'] });
                      toast.success(`${lead.name} graduated to Book of Business!`);
                    }}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Briefcase className="w-4 h-4" /> Graduate
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Lead Detail Drawer */}
        {selectedLead && (
          <LeadDetailDrawer
            lead={selectedLead}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            onAddActivity={handleAddActivity}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {/* Add Lead Modal */}
        <AddLeadModal
          open={addLeadOpen}
          onOpenChange={setAddLeadOpen}
          onAddLead={handleAddLead}
          existingLeads={leads}
        />

        {/* Lead Import Dialog */}
        <LeadImportDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          onImportSuccess={() => {
            distributedQuery.refetch();
            if (currentUser?.name) {
              const slug = generateAgentSlug(currentUser.name);
              fetchWebsiteLeads(slug).catch(() => {});
            }
            fetchReferralLeads().catch(() => {});
          }}
        />

        {/* Enhanced Activity Modal */}
        {activityLead && (
          <EnhancedActivityModal
            open={activityModalOpen}
            onOpenChange={(open) => {
              setActivityModalOpen(open);
              if (!open) setActivityLead(null);
            }}
            lead={activityLead}
            onLogActivity={handleLogActivity}
          />
        )}
      </motion.div>
    </AgentLoungeLayout>
  );
}
