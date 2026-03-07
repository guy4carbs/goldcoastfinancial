import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, Clock, Calendar, UserPlus, Search,
  Filter, ChevronDown, Phone, Mail, MessageSquare,
  Users, Inbox, Briefcase, CheckCircle
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives";
import { LeadInboxCard } from "@/components/agent/LeadInboxCard";
import { LeadDetailDrawer } from "@/components/agent/LeadDetailDrawer";
import { AddLeadModal } from "@/components/agent/AddLeadModal";
import { EnhancedActivityModal } from "@/components/agent/EnhancedActivityModal";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

interface InboxSection {
  id: string;
  title: string;
  icon: typeof AlertCircle;
  urgency: 'overdue' | 'today' | 'upcoming' | 'no-followup';
  color: string;
  bgColor: string;
  borderColor: string;
  emptyMessage: string;
}

const SECTIONS: InboxSection[] = [
  {
    id: 'overdue',
    title: 'Overdue',
    icon: AlertCircle,
    urgency: 'overdue',
    color: COLORS.semantic.error,
    bgColor: `${COLORS.semantic.error}10`,
    borderColor: `${COLORS.semantic.error}30`,
    emptyMessage: 'No overdue follow-ups. Great job staying on top of things!',
  },
  {
    id: 'today',
    title: 'Due Today',
    icon: Clock,
    urgency: 'today',
    color: COLORS.semantic.warning,
    bgColor: `${COLORS.semantic.warning}10`,
    borderColor: `${COLORS.semantic.warning}30`,
    emptyMessage: "No follow-ups due today. You're all caught up!",
  },
  {
    id: 'upcoming',
    title: 'Upcoming (Next 7 Days)',
    icon: Calendar,
    urgency: 'upcoming',
    color: COLORS.primary.violet[600],
    bgColor: COLORS.primary.violet[50],
    borderColor: COLORS.primary.violet[200],
    emptyMessage: 'No upcoming follow-ups scheduled.',
  },
  {
    id: 'no-followup',
    title: 'Needs Follow-Up Date',
    icon: AlertCircle,
    urgency: 'no-followup',
    color: COLORS.gray[500],
    bgColor: COLORS.gray[50],
    borderColor: COLORS.gray[300],
    emptyMessage: 'All leads have follow-up dates scheduled.',
  },
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
    getOverdueLeads,
    getLeadsDueToday,
    getLeadsDueThisWeek,
    getLeadsWithNoFollowUp,
  } = useAgentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityLead, setActivityLead] = useState<Lead | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['overdue', 'today', 'upcoming', 'no-followup']);

  // Get user's leads
  const userLeads = useMemo(() =>
    leads.filter(l => l.assignedTo === currentUser?.id),
    [leads, currentUser]
  );

  // Categorize leads by urgency
  const categorizedLeads = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const filterLeads = (leadList: Lead[]) => {
      return leadList.filter(lead => {
        const matchesSearch = !searchQuery ||
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.phone.includes(searchQuery);

        const matchesProduct = productFilter === 'all' || lead.product === productFilter;

        return matchesSearch && matchesProduct;
      });
    };

    return {
      overdue: filterLeads(userLeads.filter(l =>
        l.nextFollowUpDate &&
        l.nextFollowUpDate < today &&
        !['closed', 'lost'].includes(l.status)
      )).sort((a, b) => a.nextFollowUpDate!.localeCompare(b.nextFollowUpDate!)),

      today: filterLeads(userLeads.filter(l =>
        l.nextFollowUpDate === today &&
        !['closed', 'lost'].includes(l.status)
      )),

      upcoming: filterLeads(userLeads.filter(l =>
        l.nextFollowUpDate &&
        l.nextFollowUpDate > today &&
        l.nextFollowUpDate <= weekFromNow &&
        !['closed', 'lost'].includes(l.status)
      )).sort((a, b) => a.nextFollowUpDate!.localeCompare(b.nextFollowUpDate!)),

      'no-followup': filterLeads(userLeads.filter(l =>
        !l.nextFollowUpDate &&
        !['closed', 'lost'].includes(l.status)
      )),
    };
  }, [userLeads, searchQuery, productFilter]);

  // Get unique products for filter
  const uniqueProducts = useMemo(() => {
    const products = new Set(userLeads.map(l => l.product).filter(Boolean));
    return Array.from(products) as string[];
  }, [userLeads]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const handleQuickCall = (lead: Lead) => {
    // Open phone dialer
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

    // Log the activity
    addActivityToLead(activityLead.id, {
      type: data.type,
      disposition: data.disposition,
      notes: data.notes,
    });

    // Update follow-up if provided
    if (data.nextFollowUpDate && data.nextFollowUpType) {
      updateLeadFollowUp(activityLead.id, data.nextFollowUpDate, data.nextFollowUpType);
    }

    setActivityModalOpen(false);
    setActivityLead(null);
  };

  const totalLeadsCount = Object.values(categorizedLeads).reduce((sum, arr) => sum + arr.length, 0);
  const overdueCount = categorizedLeads.overdue.length;
  const todayCount = categorizedLeads.today.length;

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Header - Hero Card */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Inbox}
            title="Lead Inbox"
            subtitle={`${totalLeadsCount} active leads requiring action`}
          >
            <Button
              onClick={() => setAddLeadOpen(true)}
              className="gap-2 text-white border-0 backdrop-blur-sm hover:scale-105 transition-transform"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: RADIUS.button,
              }}
            >
              <UserPlus className="w-4 h-4" />
              Add Lead
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* Stats Bar */}
        <motion.div variants={fadeInUp}>
          <AgentStatCardGrid>
            <AgentStatCard
              icon={AlertCircle}
              value={overdueCount}
              label="Overdue"
              gradient="from-red-500 to-rose-600"
            />
            <AgentStatCard
              icon={Clock}
              value={todayCount}
              label="Due Today"
              gradient="from-amber-500 to-orange-500"
            />
            <AgentStatCard
              icon={Calendar}
              value={categorizedLeads.upcoming.length}
              label="This Week"
              gradient="from-violet-500 to-purple-600"
            />
            <AgentStatCard
              icon={AlertCircle}
              value={categorizedLeads['no-followup'].length}
              label="No Date Set"
              gradient="from-gray-400 to-gray-500"
            />
          </AgentStatCardGrid>
        </motion.div>

        {/* Search & Filter */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search leads by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
              style={{ borderRadius: RADIUS.input }}
            />
          </div>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger
              className="w-full sm:w-48 h-12"
              style={{ borderRadius: RADIUS.input }}
            >
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {uniqueProducts.map((product) => (
                <SelectItem key={product} value={product}>{product}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Lead Sections */}
        <motion.div variants={fadeInUp} className="space-y-4">
        {SECTIONS.map((section) => {
          const sectionLeads = categorizedLeads[section.urgency as keyof typeof categorizedLeads];
          const isExpanded = expandedSections.includes(section.id);
          const Icon = section.icon;

          return (
            <Collapsible
              key={section.id}
              open={isExpanded}
              onOpenChange={() => toggleSection(section.id)}
            >
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                transition={MOTION.spring}
                className="border-2 overflow-hidden"
                style={{
                  borderRadius: RADIUS.card,
                  borderColor: section.borderColor,
                  borderStyle: section.id === 'no-followup' ? 'dashed' : 'solid',
                }}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className="w-full flex items-center justify-between p-4 transition-colors hover:opacity-90"
                    style={{ backgroundColor: section.bgColor }}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="w-5 h-5" style={{ color: section.color }} />
                      <span className="font-semibold" style={{ color: section.color }}>
                        {section.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{ color: sectionLeads.length > 0 ? section.color : COLORS.gray[400] }}
                      >
                        {sectionLeads.length}
                      </Badge>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                      style={{ color: section.color }}
                    />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 bg-white space-y-4">
                    {sectionLeads.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Icon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">{section.emptyMessage}</p>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {sectionLeads.map((lead, index) => (
                          <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <LeadInboxCard
                              lead={lead}
                              urgency={section.urgency}
                              onClick={() => handleLeadClick(lead)}
                              onQuickCall={() => handleQuickCall(lead)}
                              onQuickActivity={() => handleQuickActivity(lead)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </CollapsibleContent>
              </motion.div>
            </Collapsible>
          );
        })}
        </motion.div>

        {/* Closed Leads — Graduate to Book of Business */}
        {userLeads.filter(l => l.status === 'closed').length > 0 && (
          <motion.div variants={fadeInUp} className="border-2 border-dashed border-emerald-200 overflow-hidden" style={{ borderRadius: RADIUS.card }}>
            <div className="flex items-center justify-between p-4" style={{ backgroundColor: `${COLORS.semantic.success}10` }}>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-700">Closed / Issued</span>
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
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{lead.product} · {lead.phone}</p>
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
                    <Briefcase className="w-4 h-4" /> Graduate to Book
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
