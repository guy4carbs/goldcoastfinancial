import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, Clock, Calendar, UserPlus, Search,
  Filter, ChevronDown, Phone, Mail, MessageSquare,
  Users, Inbox, CheckCircle2
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
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
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
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    emptyMessage: 'No overdue follow-ups. Great job staying on top of things!',
  },
  {
    id: 'today',
    title: 'Due Today',
    icon: Clock,
    urgency: 'today',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    emptyMessage: "No follow-ups due today. You're all caught up!",
  },
  {
    id: 'upcoming',
    title: 'Upcoming (Next 7 Days)',
    icon: Calendar,
    urgency: 'upcoming',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    emptyMessage: 'No upcoming follow-ups scheduled.',
  },
  {
    id: 'no-followup',
    title: 'Needs Follow-Up Date',
    icon: AlertCircle,
    urgency: 'no-followup',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300 border-dashed',
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
      <div className="space-y-6">
        {/* Header - Hero Card */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="p-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${COLORS.lounges.agent.main} 0%, ${COLORS.primary.purple[600]} 50%, ${COLORS.lounges.agent.dark} 100%)`,
            borderRadius: RADIUS.hero,
            boxShadow: SHADOW.hero,
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Inbox className="w-5 h-5 text-white" />
                </div>
                Lead Inbox
              </h1>
              <p className="text-sm text-white/80 mt-1">
                {totalLeadsCount} active leads requiring action
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setAddLeadOpen(true)}
                className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                style={{ borderRadius: RADIUS.button }}
              >
                <UserPlus className="w-4 h-4" />
                Add Lead
              </Button>
            </div>
          </div>
        </motion.div>

      {/* Stats Bar */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={fadeInUp}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          className={`p-4 rounded-[${RADIUS.card}px] bg-white hover:shadow-xl transition-all`}
          style={{ boxShadow: SHADOW.card, borderRadius: RADIUS.card }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-md", overdueCount > 0 ? "bg-gradient-to-br from-red-400 to-rose-500" : "bg-gradient-to-br from-green-400 to-emerald-500")}>
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">Overdue</span>
          </div>
          <p className={cn("text-2xl font-bold", overdueCount > 0 ? "bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent" : "bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent")}>
            {overdueCount}
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          className="p-4 bg-white hover:shadow-xl transition-all"
          style={{ boxShadow: SHADOW.card, borderRadius: RADIUS.card }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">Due Today</span>
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{todayCount}</p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          className="p-4 bg-white hover:shadow-xl transition-all"
          style={{ boxShadow: SHADOW.card, borderRadius: RADIUS.card }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">This Week</span>
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">{categorizedLeads.upcoming.length}</p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          className="p-4 bg-white hover:shadow-xl transition-all"
          style={{ boxShadow: SHADOW.card, borderRadius: RADIUS.card }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-md", categorizedLeads['no-followup'].length > 0 ? "bg-gradient-to-br from-gray-400 to-slate-500" : "bg-gradient-to-br from-green-400 to-emerald-500")}>
              {categorizedLeads['no-followup'].length > 0 ? (
                <AlertCircle className="w-5 h-5 text-white" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-white" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-600">No Date Set</span>
          </div>
          <p className={cn(
            "text-2xl font-bold",
            categorizedLeads['no-followup'].length > 0 ? "bg-gradient-to-r from-gray-500 to-slate-500 bg-clip-text text-transparent" : "bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent"
          )}>
            {categorizedLeads['no-followup'].length}
          </p>
        </motion.div>
      </motion.div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-full sm:w-48">
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
      </div>

      {/* Lead Sections */}
      <div className="space-y-4">
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
                transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                className={cn(
                  "border-2 overflow-hidden",
                  section.borderColor
                )}
                style={{ borderRadius: RADIUS.card }}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center justify-between p-4 transition-colors",
                      section.bgColor,
                      "hover:opacity-90"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-5 h-5", section.color)} />
                      <span className={cn("font-semibold", section.color)}>
                        {section.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          sectionLeads.length > 0 ? section.color : "text-gray-400"
                        )}
                      >
                        {sectionLeads.length}
                      </Badge>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 transition-transform",
                        section.color,
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 bg-white space-y-3">
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
      </div>

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
      </div>
    </AgentLoungeLayout>
  );
}
