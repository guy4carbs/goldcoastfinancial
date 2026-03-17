import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, UserPlus, Inbox, ArrowUpDown,
  Sparkles, Clock, Briefcase, CheckCircle, Send, ArrowRight
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
import { cn, formatProductLabel } from "@/lib/utils";
import { toast } from "sonner";
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { generateAgentSlug } from "@/lib/agentSlugUtils";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives";
import { LeadInboxCard } from "@/components/agent/LeadInboxCard";
import { LeadDetailDrawer } from "@/components/agent/LeadDetailDrawer";
import { AddLeadModal } from "@/components/agent/AddLeadModal";
import { EnhancedActivityModal } from "@/components/agent/EnhancedActivityModal";
import { RADIUS, SHADOW, MOTION, TYPE, fadeInUp, staggerContainer } from '@/lib/heritageDesignSystem';
import { useLeadInbox } from '@/hooks/useLeadDistribution';

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
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityLead, setActivityLead] = useState<Lead | null>(null);

  // Fetch distributed leads from real API
  const distributedQuery = useLeadInbox({ limit: 200, enabled: !!currentUser?.id });

  // Merge API-distributed leads into store on load
  useEffect(() => {
    if (distributedQuery.data?.leads && distributedQuery.data.leads.length > 0) {
      for (const apiLead of distributedQuery.data.leads) {
        const name = `${apiLead.firstName || ''} ${apiLead.lastName || ''}`.trim();
        const email = apiLead.email || '';
        // Only add if not already in store (match by email to avoid duplicates)
        const exists = leads.some(l => l.email === email && l.name === name);
        if (!exists && name) {
          addLead({
            name,
            email,
            phone: apiLead.phone || '',
            product: apiLead.coverageType || 'Life Insurance',
            source: 'Distributed',
            status: 'new',
            tags: ['Distributed'],
            state: apiLead.state || '',
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
      fetchWebsiteLeads(slug);
    }
    fetchReferralLeads();
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

  const handleLogActivity = (data: {
    type: any;
    disposition?: any;
    notes: string;
    nextFollowUpDate?: string;
    nextFollowUpType?: Lead['nextFollowUpType'];
  }) => {
    if (!activityLead) return;
    addActivityToLead(activityLead.id, {
      type: data.type,
      disposition: data.disposition,
      notes: data.notes,
    });
    if (data.nextFollowUpDate && data.nextFollowUpType) {
      updateLeadFollowUp(activityLead.id, data.nextFollowUpDate, data.nextFollowUpType);
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
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Inbox}
            title="Lead Inbox"
            subtitle={`${counts.all} active leads · ${counts.new} new`}
          >
            <Button
              onClick={() => setAddLeadOpen(true)}
              className="gap-2 text-white border-0 backdrop-blur-sm hover:scale-105 transition-transform"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: RADIUS.button }}
            >
              <UserPlus className="w-4 h-4" />
              Add Lead
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeInUp}>
          <AgentStatCardGrid>
            <AgentStatCard icon={Sparkles} value={counts.new} label="New Leads" gradient="from-purple-500 to-violet-600" />
            <AgentStatCard icon={Send} value={counts.distributed} label="Distributed" gradient="from-blue-500 to-indigo-600" />
            <AgentStatCard icon={Clock} value={todayCount} label="Due Today" gradient="from-red-500 to-rose-600" />
            <AgentStatCard icon={ArrowRight} value={counts.in_progress} label="In Progress" gradient="from-amber-500 to-orange-500" />
          </AgentStatCardGrid>
        </motion.div>

        {/* Search + Sort */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
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

          {/* Lead rows */}
          <div className="divide-y">
            <AnimatePresence mode="popLayout">
              {filteredLeads.map((lead) => (
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
            onAddActivity={addActivityToLead}
            onUpdateStatus={updateLeadStatus}
          />
        )}

        {/* Add Lead Modal */}
        <AddLeadModal
          open={addLeadOpen}
          onOpenChange={setAddLeadOpen}
          onAddLead={addLead}
          existingLeads={leads}
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
