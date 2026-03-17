import { motion } from "framer-motion";
import {
  Phone, FileText, ChevronRight, Globe, PhoneCall, Heart, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatProductLabel } from "@/lib/utils";
import type { Lead } from "@/lib/agentStore";
import { MOTION } from "@/lib/heritageDesignSystem";

interface LeadInboxCardProps {
  lead: Lead;
  onClick: () => void;
  onQuickCall: () => void;
  onQuickActivity: () => void;
  isNew?: boolean;
}

const STATUS_COLORS: Record<Lead['status'], string> = {
  new: 'bg-purple-100 text-purple-700',
  contacted: 'bg-amber-100 text-amber-700',
  qualified: 'bg-violet-100 text-violet-700',
  proposal: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-gray-100 text-gray-500',
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function LeadInboxCard({ lead, onClick, onQuickCall, onQuickActivity, isNew = false }: LeadInboxCardProps) {
  const initials = lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isWebsite = lead.source === 'Website' || lead.source === 'Schedule Call' || (lead.tags || []).includes('Website Lead');
  const isReferral = lead.source === 'Referral' || (lead.tags || []).includes('Referral');
  const isDistributed = lead.source === 'Distributed' || (lead.tags || []).includes('Distributed');
  const referrerTag = (lead.tags || []).find(t => t.startsWith('From: '));
  const referrerName = referrerTag ? referrerTag.replace('From: ', '') : null;

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(139,92,246,0.04)" }}
      whileTap={{ scale: 0.995 }}
      transition={MOTION.spring}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-3",
        isNew ? "border-l-violet-500 bg-violet-50/20" : "border-l-transparent",
      )}
      onClick={onClick}
    >
      {/* Unread dot */}
      <div className="w-2 flex-shrink-0">
        {isNew && <div className="w-2 h-2 rounded-full bg-violet-500" />}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">
        {initials}
      </div>

      {/* Name + contact */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm truncate", isNew ? "font-semibold text-gray-900" : "font-medium text-gray-800")}>
            {lead.name}
          </span>
          {isDistributed && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5 flex-shrink-0 border-blue-200 text-blue-600">
              <Send className="w-2.5 h-2.5" />
              Distributed
            </Badge>
          )}
          {isReferral && !isDistributed && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5 flex-shrink-0 border-pink-200 text-pink-600">
              <Heart className="w-2.5 h-2.5" />
              {referrerName ? `Via ${referrerName.split(' ')[0]}` : 'Referral'}
            </Badge>
          )}
          {isWebsite && !isReferral && !isDistributed && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5 flex-shrink-0 border-violet-200 text-violet-600">
              <Globe className="w-2.5 h-2.5" />
              Web
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span className="truncate">{lead.email}</span>
          {lead.phone && (
            <>
              <span className="text-gray-300">·</span>
              <span className="flex-shrink-0">{lead.phone}</span>
            </>
          )}
        </div>
      </div>

      {/* Product */}
      <div className="hidden md:block text-xs text-muted-foreground w-28 truncate text-right">
        {formatProductLabel(lead.product) || '—'}
      </div>

      {/* Status */}
      <Badge className={cn("text-[10px] px-2 py-0.5 capitalize flex-shrink-0", STATUS_COLORS[lead.status])}>
        {lead.status}
      </Badge>

      {/* Date */}
      <span className="text-xs text-muted-foreground w-16 text-right flex-shrink-0 hidden sm:block">
        {formatRelativeDate(lead.createdDate)}
      </span>

      {/* Quick actions (visible on hover) */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={e => { e.stopPropagation(); onQuickCall(); }}
        >
          <PhoneCall className="w-3.5 h-3.5 text-primary" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={e => { e.stopPropagation(); onQuickActivity(); }}
        >
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
    </motion.div>
  );
}
