import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone, Mail, Clock, Plus, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PipelineLead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  product: string;
  value: number;
  stage: PipelineStage;
  daysInStage: number;
  lastActivity?: string;
  priority?: 'high' | 'medium' | 'low';
  nextAction?: string;
}

export type PipelineStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed';

interface PipelineKanbanProps {
  leads: PipelineLead[];
  onLeadClick?: (lead: PipelineLead) => void;
  onStageChange?: (leadId: string, newStage: PipelineStage) => void;
  onAddLead?: (stage: PipelineStage) => void;
}

const stageConfig: Record<PipelineStage, {
  label: string;
  shortLabel: string;
  headerBg: string;
}> = {
  new: { label: 'New', shortLabel: 'New', headerBg: 'bg-blue-500' },
  contacted: { label: 'Contacted', shortLabel: 'Contact', headerBg: 'bg-yellow-500' },
  qualified: { label: 'Qualified', shortLabel: 'Qual', headerBg: 'bg-purple-500' },
  proposal: { label: 'Proposal', shortLabel: 'Prop', headerBg: 'bg-green-500' },
  closed: { label: 'Closed', shortLabel: 'Won', headerBg: 'bg-emerald-500' },
};

const stages: PipelineStage[] = ['new', 'contacted', 'qualified', 'proposal', 'closed'];

const STALE_DAYS = 7;

function CompactLeadCard({
  lead,
  onClick,
}: {
  lead: PipelineLead;
  onClick?: () => void;
}) {
  const isStale = lead.daysInStage > STALE_DAYS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "bg-white rounded-lg border border-gray-100 p-2.5 cursor-pointer hover:shadow-md transition-all",
        "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1",
        isStale && "border-l-2 border-l-orange-400"
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Lead: ${lead.name}, Value: $${lead.value.toLocaleString()}, ${lead.daysInStage} days in stage${isStale ? ' (stale)' : ''}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
          {lead.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-xs text-primary truncate">{lead.name}</p>
        </div>
        {lead.priority === 'high' && (
          <span
            className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
            title="High Priority"
            aria-label="High priority lead"
            role="img"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-[10px]">
        <span className="font-semibold text-primary">${lead.value.toLocaleString()}</span>
        <span className={cn(
          "flex items-center gap-0.5",
          isStale ? "text-orange-500" : "text-gray-400"
        )}>
          <Clock className="w-2.5 h-2.5" />
          {lead.daysInStage}d
          {isStale && <AlertTriangle className="w-2.5 h-2.5" />}
        </span>
      </div>

      {/* Quick action icons */}
      <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-gray-50">
        {lead.phone && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 hover:bg-gray-100 rounded"
            aria-label={`Call ${lead.name}`}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `tel:${lead.phone}`;
            }}
          >
            <Phone className="w-3 h-3 text-green-600" />
          </Button>
        )}
        {lead.email && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 hover:bg-gray-100 rounded"
            aria-label={`Email ${lead.name}`}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `mailto:${lead.email}?subject=Following up on your life insurance inquiry`;
            }}
          >
            <Mail className="w-3 h-3 text-blue-500" />
          </Button>
        )}
        <span className="text-[9px] text-gray-400 ml-auto truncate">{lead.product}</span>
      </div>
    </motion.div>
  );
}

function StageColumn({
  stage,
  leads,
  onLeadClick,
  onAddLead,
}: {
  stage: PipelineStage;
  leads: PipelineLead[];
  onLeadClick?: (lead: PipelineLead) => void;
  onAddLead?: () => void;
}) {
  const config = stageConfig[stage];
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);

  return (
    <div
      className="flex flex-col min-w-[180px] flex-1 max-w-[220px] bg-gray-50 rounded-lg overflow-hidden"
      role="region"
      aria-label={`${config.label} stage: ${leads.length} leads, $${totalValue.toLocaleString()} total value`}
    >
      {/* Column Header */}
      <div className={cn("px-2 py-2", config.headerBg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-white text-xs">{config.label}</h3>
            <Badge className="bg-white/20 text-white text-[10px] h-4 px-1.5">
              {leads.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded"
            aria-label={`Add new lead to ${config.label} stage`}
            onClick={onAddLead}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="text-white/80 text-[10px] mt-0.5">
          ${totalValue.toLocaleString()}
        </p>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[400px]">
        <AnimatePresence>
          {leads.map((lead) => (
            <CompactLeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick?.(lead)}
            />
          ))}
        </AnimatePresence>

        {leads.length === 0 && (
          <div className="text-center py-4">
            <p className="text-[10px] text-gray-400">No leads</p>
            <Button
              variant="link"
              size="sm"
              className="text-[10px] text-violet-500 h-auto p-0 mt-1"
              aria-label={`Add a new lead to ${config.label} stage`}
              onClick={onAddLead}
            >
              + Add Lead
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PipelineKanban({
  leads,
  onLeadClick,
  onAddLead,
}: PipelineKanbanProps) {
  const leadsByStage = useMemo(() => {
    const grouped: Record<PipelineStage, PipelineLead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      proposal: [],
      closed: [],
    };

    leads.forEach(lead => {
      grouped[lead.stage].push(lead);
    });

    return grouped;
  }, [leads]);

  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);

  return (
    <div className="space-y-3">
      {/* Summary Bar */}
      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-500">Pipeline Value</p>
            <p className="text-lg font-bold text-primary">${totalValue.toLocaleString()}</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-xs text-gray-500">Leads</p>
            <p className="text-lg font-bold text-primary">{leads.length}</p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 h-8"
          onClick={() => onAddLead?.('new')}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Lead
        </Button>
      </div>

      {/* Kanban Board */}
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        role="region"
        aria-label="Pipeline kanban board"
      >
        {stages.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            leads={leadsByStage[stage]}
            onLeadClick={onLeadClick}
            onAddLead={() => onAddLead?.(stage)}
          />
        ))}
      </div>
    </div>
  );
}

export default PipelineKanban;
