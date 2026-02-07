/**
 * ExpertSummonPanel - Summon external experts during debates
 *
 * Provides UI for:
 * - Finding qualified experts based on domain
 * - Summoning experts to contribute to ongoing debates
 * - Displaying expert contributions with streaming support
 * - Expert status (consultant vs participant)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Users,
  Sparkles,
  UserPlus,
  Loader2,
  AlertCircle,
  Zap,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useExpertSummoning,
  type Avatar,
} from "@/lib/avatarCouncilStore";
import type { SummonedExpert, ExpertContribution } from "@shared/models/avatarCouncil";

// =============================================================================
// TYPES
// =============================================================================

interface ExpertSummonPanelProps {
  debateId: string;
  participantIds: string[];  // Current debate participants (first one is used as requestor)
  className?: string;
}


// =============================================================================
// AVATAR COLORS (matches DebateView)
// =============================================================================

const avatarColors: Record<string, { bg: string; icon: string; glow: string; gradient: string }> = {
  "insurance-expert": { bg: "bg-cyan-500/10", icon: "text-cyan-400", glow: "shadow-cyan-500/30", gradient: "from-cyan-600 to-blue-600" },
  "sales-closer": { bg: "bg-amber-500/10", icon: "text-amber-400", glow: "shadow-amber-500/30", gradient: "from-amber-500 to-orange-600" },
  "mindset-coach": { bg: "bg-violet-500/10", icon: "text-violet-400", glow: "shadow-violet-500/30", gradient: "from-violet-600 to-purple-600" },
  "compliance-specialist": { bg: "bg-emerald-500/10", icon: "text-emerald-400", glow: "shadow-emerald-500/30", gradient: "from-emerald-500 to-teal-600" },
  "wolf-closer": { bg: "bg-red-500/10", icon: "text-red-400", glow: "shadow-red-500/30", gradient: "from-red-600 to-rose-600" },
  "objection-handler": { bg: "bg-orange-500/10", icon: "text-orange-400", glow: "shadow-orange-500/30", gradient: "from-orange-500 to-amber-600" },
  "warren-buffett": { bg: "bg-amber-500/10", icon: "text-amber-400", glow: "shadow-amber-500/30", gradient: "from-amber-500 to-orange-600" },
  "patrick-bet-david": { bg: "bg-cyan-500/10", icon: "text-cyan-400", glow: "shadow-cyan-500/30", gradient: "from-cyan-500 to-blue-600" },
  "ben-feldman": { bg: "bg-violet-500/10", icon: "text-violet-400", glow: "shadow-violet-500/30", gradient: "from-violet-500 to-purple-600" },
  "jordan-belfort": { bg: "bg-red-500/10", icon: "text-red-400", glow: "shadow-red-500/30", gradient: "from-red-500 to-rose-600" },
  "andrew-tate": { bg: "bg-rose-500/10", icon: "text-rose-400", glow: "shadow-rose-500/30", gradient: "from-rose-600 to-red-700" },
  "andy-elliott": { bg: "bg-orange-500/10", icon: "text-orange-400", glow: "shadow-orange-500/30", gradient: "from-orange-500 to-amber-600" },
  "elizur-wright": { bg: "bg-emerald-500/10", icon: "text-emerald-400", glow: "shadow-emerald-500/30", gradient: "from-emerald-500 to-teal-600" },
};

const getAvatarColors = (slug: string) => {
  return avatarColors[slug] || { bg: "bg-gray-500/10", icon: "text-gray-400", glow: "shadow-gray-500/30", gradient: "from-gray-500 to-gray-600" };
};

// =============================================================================
// CONTRIBUTION DISPLAY
// =============================================================================

interface ContributionDisplayProps {
  contribution: ExpertContribution | null;
  streamingContent: string;
  expertName: string;
  expertSlug: string;
}

function ContributionDisplay({ contribution, streamingContent, expertName, expertSlug }: ContributionDisplayProps) {
  const colors = getAvatarColors(expertSlug);
  const content = contribution?.contribution || streamingContent;

  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-4 rounded-xl border",
        "bg-gradient-to-br from-[#12121a] to-[#0d0d14]",
        "border-cyan-500/20"
      )}
    >
      {/* Expert badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          "px-2 py-1 rounded-lg text-[10px] font-mono tracking-wider",
          "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
        )}>
          SUMMONED EXPERT
        </div>
        <span className="text-sm text-white font-medium">{expertName}</span>
        {!contribution && streamingContent && (
          <Loader2 className="w-3 h-3 animate-spin text-cyan-400 ml-auto" />
        )}
      </div>

      {/* Content */}
      <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
        {content}
        {!contribution && streamingContent && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-2 h-4 ml-1 bg-cyan-500"
          />
        )}
      </div>

      {/* Tokens used */}
      {contribution && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-4 text-xs text-gray-500">
          <span>{contribution.tokensUsed} tokens</span>
          <span>{contribution.stayInDebate ? "Joined as participant" : "One-time consultation"}</span>
        </div>
      )}
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ExpertSummonPanel({ debateId, participantIds, className }: ExpertSummonPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [reason, setReason] = useState("");

  const {
    summonState,
    summonExpert,
    findExpertForDomain,
    clearSummonState,
    avatars,
  } = useExpertSummoning();

  // Filter out current participants to show available experts
  const availableExperts = avatars.filter(a => !participantIds.includes(a.id));

  // Use the first participant as the "requestor"
  const requestingAvatarId = participantIds[0] || "";

  const handleSummon = async () => {
    if (!domain || !requestingAvatarId) return;

    // Summon expert - system will auto-match based on domain
    summonExpert(
      debateId,
      requestingAvatarId,
      domain,
      reason || `Expert consultation needed on ${domain}`
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    setDomain("");
    setReason("");
    clearSummonState();
  };

  return (
    <>
      {/* Trigger Button */}
      <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : handleClose()}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 bg-[#12121a] border-cyan-500/20 hover:border-cyan-500/40",
              "text-cyan-400 hover:text-cyan-300",
              className
            )}
          >
            <UserPlus className="w-4 h-4" />
            Summon Expert
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-[#0d0d14] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Summon Expert
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Bring in a specialist to provide expert insight on a specific topic during the debate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Domain Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Domain / Topic
              </label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g., Compliance regulations, Sales psychology..."
                className="bg-[#12121a] border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Reason Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Reason (Optional)
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this expert needed? What question should they address?"
                className="bg-[#12121a] border-white/10 text-white placeholder:text-gray-500 min-h-[80px]"
              />
            </div>

            {/* Available Experts Preview */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Available Experts ({availableExperts.length})
              </label>
              <div className="text-xs text-gray-500 mb-2">
                The system will automatically select the best-matched expert based on domain expertise.
              </div>
              <div className="flex flex-wrap gap-2">
                {availableExperts.slice(0, 6).map((avatar) => {
                  const colors = getAvatarColors(avatar.slug);
                  return (
                    <div
                      key={avatar.id}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-lg",
                        "bg-[#12121a] border border-white/5"
                      )}
                    >
                      <div className={cn("w-6 h-6 rounded overflow-hidden", colors.bg)}>
                        {avatar.avatarImageUrl ? (
                          <img src={avatar.avatarImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Brain className={cn("w-3 h-3", colors.icon)} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-300">{avatar.name}</span>
                    </div>
                  );
                })}
                {availableExperts.length === 0 && (
                  <div className="w-full text-center py-4 text-gray-500">
                    <Users className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">All experts are in the debate</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {summonState.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">{summonState.error}</span>
              </motion.div>
            )}

            {/* Contribution Display */}
            {(summonState.contribution || summonState.streamingContribution) && (
              <ContributionDisplay
                contribution={summonState.contribution}
                streamingContent={summonState.streamingContribution}
                expertName={summonState.summonedExpert?.avatarName || "Expert"}
                expertSlug={summonState.summonedExpert?.avatarSlug || ""}
              />
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-gray-400"
            >
              {summonState.contribution ? "Done" : "Cancel"}
            </Button>
            {!summonState.contribution && (
              <Button
                onClick={handleSummon}
                disabled={!domain || summonState.isLoading || availableExperts.length === 0}
                className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
              >
                {summonState.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Summoning...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Summon Expert
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =============================================================================
// COMPACT SUMMON BUTTON (for inline use in debate view)
// =============================================================================

interface CompactSummonButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  hasPendingSummon?: boolean;
  className?: string;
}

export function CompactSummonButton({ onClick, isLoading, hasPendingSummon, className }: CompactSummonButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading || hasPendingSummon}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-gradient-to-r from-cyan-500/10 to-blue-500/10",
        "border border-cyan-500/20 hover:border-cyan-500/40",
        "text-cyan-400 text-sm font-medium",
        "transition-all duration-200",
        (isLoading || hasPendingSummon) && "opacity-50 cursor-not-allowed",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Summoning...</span>
        </>
      ) : hasPendingSummon ? (
        <>
          <Sparkles className="w-4 h-4" />
          <span>Expert Summoned</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Summon Expert</span>
        </>
      )}

      {/* Pulse animation when active */}
      {(isLoading || hasPendingSummon) && (
        <motion.div
          className="absolute inset-0 rounded-lg border border-cyan-500/50"
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

export default ExpertSummonPanel;
