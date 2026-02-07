import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, TrendingUp, X, Check, Plus,
  ShieldCheck, Banknote, Heart, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAgentStore, type Lead, type CrossSellOpportunity } from "@/lib/agentStore";

interface CrossSellPromptsProps {
  lead: Lead;
  onConvert?: (product: string) => void;
}

const PRODUCT_ICONS: Record<string, typeof ShieldCheck> = {
  'Whole Life': ShieldCheck,
  'IUL': TrendingUp,
  'Term Life': Heart,
  'Final Expense': Banknote,
  'Fixed Annuity': Banknote,
  'Mortgage Protection': Home,
};

const PRIORITY_STYLES = {
  high: {
    bg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    icon: 'bg-amber-100 text-amber-600'
  },
  medium: {
    bg: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    icon: 'bg-blue-100 text-blue-600'
  },
  low: {
    bg: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    icon: 'bg-gray-100 text-gray-600'
  }
};

export function CrossSellPrompts({ lead, onConvert }: CrossSellPromptsProps) {
  const { getCrossSellOpportunities, dismissCrossSell, convertCrossSellToLead } = useAgentStore();
  const opportunities = getCrossSellOpportunities(lead);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  if (opportunities.length === 0) {
    return null;
  }

  const handleDismiss = (opportunityId: string) => {
    setDismissedIds(prev => new Set(Array.from(prev).concat(opportunityId)));
    dismissCrossSell(lead.id, opportunityId);
  };

  const handleConvert = (opportunity: CrossSellOpportunity) => {
    convertCrossSellToLead(lead.id, opportunity.id);
    onConvert?.(opportunity.product);
  };

  const visibleOpportunities = opportunities.filter(o => !dismissedIds.has(o.id));

  if (visibleOpportunities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h4 className="font-medium text-gray-900">Cross-Sell Opportunities</h4>
        <Badge variant="outline" className="text-xs">
          {visibleOpportunities.length}
        </Badge>
      </div>

      <AnimatePresence mode="popLayout">
        {visibleOpportunities.map((opportunity) => {
          const Icon = PRODUCT_ICONS[opportunity.product] || ShieldCheck;
          const styles = PRIORITY_STYLES[opportunity.priority];

          return (
            <motion.div
              key={opportunity.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className={cn(
                "p-4 rounded-xl border transition-all",
                styles.bg
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  styles.icon
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold text-gray-900">{opportunity.product}</h5>
                    <Badge className={cn("text-[10px] px-1.5 py-0", styles.badge)}>
                      {opportunity.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{opportunity.reason}</p>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                    onClick={() => handleDismiss(opportunity.id)}
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => handleConvert(opportunity)}
                    title="Convert to Lead"
                  >
                    <Plus className="w-3 h-3" />
                    Add Lead
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Compact version for cards/lists
export function CrossSellBadge({ lead, onClick }: { lead: Lead; onClick?: () => void }) {
  const { getCrossSellOpportunities } = useAgentStore();
  const opportunities = getCrossSellOpportunities(lead);

  if (opportunities.length === 0) return null;

  const highPriority = opportunities.filter(o => o.priority === 'high').length;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        highPriority > 0
          ? "bg-amber-100 text-amber-700"
          : "bg-blue-100 text-blue-700"
      )}
    >
      <Sparkles className="w-3 h-3" />
      {opportunities.length} {opportunities.length === 1 ? 'opportunity' : 'opportunities'}
    </motion.button>
  );
}
