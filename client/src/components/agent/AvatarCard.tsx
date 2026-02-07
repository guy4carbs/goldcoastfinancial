import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Lock, User, Check, MessageCircle } from "lucide-react";
import type { Avatar } from "@/lib/avatarCouncilStore";
import { useState, useCallback, useMemo } from "react";

// =============================================================================
// Types
// =============================================================================

export interface AvatarSignature {
  accent: string;
  primary: string;
  glow: string;
  bg: string;
  ring: string;
  text: string;
  gradient: string;
  legacyTitle: string;
}

interface AvatarCardProps {
  avatar: Avatar;
  signature?: AvatarSignature;
  isSelected: boolean;
  selectionOrder?: number;
  onSelect: () => void;
  onDeselect: () => void;
  onChatClick?: () => void;  // Direct chat with this avatar
  disabled?: boolean;
  isLocked?: boolean;
  isDebateReady?: boolean;
}

// =============================================================================
// Avatar Signatures - The Legends (Light Theme)
// =============================================================================

// Enhanced avatar data with better descriptions
export interface AvatarEnhancement {
  tagline: string;
  skills: string[];
}

export const avatarEnhancements: Record<string, AvatarEnhancement> = {
  // =============================================================================
  // THE 7 LEGENDS
  // =============================================================================
  "warren-buffett": {
    tagline: "Value Investing & Long-Term Wisdom",
    skills: ["Value Investing", "Economic Moats", "Integrity"],
  },
  "patrick-bet-david": {
    tagline: "Entrepreneurship & Strategic Thinking",
    skills: ["5 Moves Ahead", "Team Building", "Capitalism"],
  },
  "ben-feldman": {
    tagline: "$1.8B in Sales - The Soft-Sell Master",
    skills: ["Disturbing Questions", "Problem Solving", "Persistence"],
  },
  "elizur-wright": {
    tagline: "Mathematical Reformer & Consumer Advocate",
    skills: ["Actuarial Science", "Regulation", "Ethics"],
  },
  "jordan-belfort": {
    tagline: "Straight Line Persuasion System",
    skills: ["The Three Tens", "Tonality", "Looping"],
  },
  "andy-elliott": {
    tagline: "High-Intensity Sales Training",
    skills: ["Closing", "No Excuses", "LEVEL UP"],
  },
  "andrew-tate": {
    tagline: "Discipline Over Motivation",
    skills: ["Escape the Matrix", "Speed", "No Excuses"],
  },
  // =============================================================================
  // LEGACY AVATARS
  // =============================================================================
  "insurance-expert": {
    tagline: "Master of Policy & Product Knowledge",
    skills: ["Product Mastery", "Underwriting", "Case Design"],
  },
  "sales-closer": {
    tagline: "High-Performance Closing Techniques",
    skills: ["Trial Closes", "Urgency Building", "Deal Flow"],
  },
  "mindset-coach": {
    tagline: "Peak Performance Psychology",
    skills: ["Confidence", "Resilience", "Goal Setting"],
  },
  "compliance-specialist": {
    tagline: "Regulatory Excellence & Protection",
    skills: ["State Regs", "Documentation", "Risk Prevention"],
  },
  "objection-handler": {
    tagline: "Turn Every No Into Yes",
    skills: ["Rebuttals", "Scripts", "Isolation Technique"],
  },
  "wolf-closer": {
    tagline: "Straight Line Persuasion Expert",
    skills: ["Tonality", "The Three Tens", "Looping"],
  },
  "persuasion-strategist": {
    tagline: "Ethical Influence Psychology",
    skills: ["Rapport", "Persuasion", "Psychology"],
  },
  "underwriting-analyst": {
    tagline: "Risk Assessment Specialist",
    skills: ["Medical UW", "Risk Classes", "Field UW"],
  },
  "intensity-coach": {
    tagline: "No Excuses Performance",
    skills: ["Accountability", "Execution", "Drive"],
  },
};

export const avatarSignatures: Record<string, AvatarSignature> = {
  // =============================================================================
  // THE 7 LEGENDS
  // =============================================================================
  "warren-buffett": {
    accent: "amber",
    primary: "#D97706",
    glow: "shadow-amber-200/50",
    bg: "bg-amber-50",
    ring: "ring-amber-400",
    text: "text-amber-600",
    gradient: "from-amber-500 to-orange-500",
    legacyTitle: "THE ORACLE OF OMAHA",
  },
  "patrick-bet-david": {
    accent: "cyan",
    primary: "#0891B2",
    glow: "shadow-cyan-200/50",
    bg: "bg-cyan-50",
    ring: "ring-cyan-400",
    text: "text-cyan-600",
    gradient: "from-cyan-500 to-blue-500",
    legacyTitle: "THE VALUETAINMENT FOUNDER",
  },
  "ben-feldman": {
    accent: "violet",
    primary: "#7C3AED",
    glow: "shadow-violet-200/50",
    bg: "bg-violet-50",
    ring: "ring-violet-400",
    text: "text-violet-600",
    gradient: "from-violet-500 to-purple-500",
    legacyTitle: "THE BILLION DOLLAR LEGEND",
  },
  "elizur-wright": {
    accent: "emerald",
    primary: "#059669",
    glow: "shadow-emerald-200/50",
    bg: "bg-emerald-50",
    ring: "ring-emerald-400",
    text: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-500",
    legacyTitle: "FATHER OF LIFE INSURANCE",
  },
  "jordan-belfort": {
    accent: "red",
    primary: "#DC2626",
    glow: "shadow-red-200/50",
    bg: "bg-red-50",
    ring: "ring-red-400",
    text: "text-red-600",
    gradient: "from-red-500 to-rose-500",
    legacyTitle: "THE WOLF OF WALL STREET",
  },
  "andy-elliott": {
    accent: "orange",
    primary: "#EA580C",
    glow: "shadow-orange-200/50",
    bg: "bg-orange-50",
    ring: "ring-orange-400",
    text: "text-orange-600",
    gradient: "from-orange-500 to-amber-500",
    legacyTitle: "THE CLOSER'S CLOSER",
  },
  "andrew-tate": {
    accent: "rose",
    primary: "#BE123C",
    glow: "shadow-rose-200/50",
    bg: "bg-rose-50",
    ring: "ring-rose-400",
    text: "text-rose-600",
    gradient: "from-rose-600 to-red-600",
    legacyTitle: "THE TOP G",
  },
  // Current database avatars
  "insurance-expert": {
    accent: "cyan",
    primary: "#0891B2",
    glow: "shadow-cyan-200/50",
    bg: "bg-cyan-50",
    ring: "ring-cyan-400",
    text: "text-cyan-600",
    gradient: "from-cyan-500 to-blue-500",
    legacyTitle: "POLICY & PRODUCT MASTER",
  },
  "sales-closer": {
    accent: "amber",
    primary: "#D97706",
    glow: "shadow-amber-200/50",
    bg: "bg-amber-50",
    ring: "ring-amber-400",
    text: "text-amber-600",
    gradient: "from-amber-500 to-orange-500",
    legacyTitle: "THE DEAL MAKER",
  },
  "mindset-coach": {
    accent: "violet",
    primary: "#7C3AED",
    glow: "shadow-violet-200/50",
    bg: "bg-violet-50",
    ring: "ring-violet-400",
    text: "text-violet-600",
    gradient: "from-violet-500 to-purple-500",
    legacyTitle: "PEAK PERFORMANCE MENTOR",
  },
  "compliance-specialist": {
    accent: "emerald",
    primary: "#059669",
    glow: "shadow-emerald-200/50",
    bg: "bg-emerald-50",
    ring: "ring-emerald-400",
    text: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-500",
    legacyTitle: "THE GUARDIAN",
  },
  "wolf-closer": {
    accent: "red",
    primary: "#DC2626",
    glow: "shadow-red-200/50",
    bg: "bg-red-50",
    ring: "ring-red-400",
    text: "text-red-600",
    gradient: "from-red-500 to-rose-500",
    legacyTitle: "STRAIGHT LINE STRATEGIST",
  },
  "persuasion-strategist": {
    accent: "red",
    primary: "#DC2626",
    glow: "shadow-red-200/50",
    bg: "bg-red-50",
    ring: "ring-red-400",
    text: "text-red-600",
    gradient: "from-red-500 to-rose-500",
    legacyTitle: "THE INFLUENCE EXPERT",
  },
  "objection-handler": {
    accent: "orange",
    primary: "#EA580C",
    glow: "shadow-orange-200/50",
    bg: "bg-orange-50",
    ring: "ring-orange-400",
    text: "text-orange-600",
    gradient: "from-orange-500 to-amber-500",
    legacyTitle: "THE REBUTTAL MASTER",
  },
  "underwriting-analyst": {
    accent: "slate",
    primary: "#475569",
    glow: "shadow-slate-200/50",
    bg: "bg-slate-50",
    ring: "ring-slate-400",
    text: "text-slate-600",
    gradient: "from-slate-500 to-gray-500",
    legacyTitle: "RISK ASSESSMENT PRO",
  },
  "intensity-coach": {
    accent: "rose",
    primary: "#E11D48",
    glow: "shadow-rose-200/50",
    bg: "bg-rose-50",
    ring: "ring-rose-400",
    text: "text-rose-600",
    gradient: "from-rose-500 to-pink-500",
    legacyTitle: "THE FIRE STARTER",
  },
};

const defaultSignature: AvatarSignature = {
  accent: "gray",
  primary: "#6B7280",
  glow: "shadow-gray-200/50",
  bg: "bg-gray-50",
  ring: "ring-gray-400",
  text: "text-gray-600",
  gradient: "from-gray-500 to-slate-500",
  legacyTitle: "ADVISOR",
};

// =============================================================================
// Simple Avatar Card Component
// =============================================================================

export function AvatarCard({
  avatar,
  signature,
  isSelected,
  selectionOrder,
  onSelect,
  onDeselect,
  onChatClick,
  disabled = false,
  isLocked = false,
  isDebateReady = false,
}: AvatarCardProps) {
  const sig = signature || avatarSignatures[avatar.slug] || defaultSignature;
  const enhancement = avatarEnhancements[avatar.slug];
  const reducedMotion = useReducedMotion() ?? false;

  const [isHovered, setIsHovered] = useState(false);

  // Use enhanced skills if available, otherwise fall back to domainExpertise
  const displaySkills = enhancement?.skills || avatar.domainExpertise.slice(0, 3);

  const handleClick = useCallback(() => {
    if (disabled || isLocked) return;
    if (isSelected) {
      onDeselect();
    } else {
      onSelect();
    }
  }, [disabled, isLocked, isSelected, onSelect, onDeselect]);

  const handleChatClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChatClick) {
      onChatClick();
    }
  }, [onChatClick]);

  return (
    <motion.div
      role="button"
      tabIndex={disabled || isLocked ? -1 : 0}
      aria-selected={isSelected}
      aria-disabled={disabled || isLocked}
      onClick={handleClick}
      onMouseEnter={() => !disabled && !isLocked && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isLocked && !isSelected ? 0.5 : 1,
        y: isSelected ? -4 : isHovered ? -6 : 0,
        scale: isSelected ? 1.02 : isHovered ? 1.01 : 1,
      }}
      whileTap={!disabled && !isLocked ? { scale: 0.98 } : undefined}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      className={cn(
        // Base styles
        "relative w-[280px] rounded-2xl overflow-hidden cursor-pointer",
        "outline-none bg-white border-2 transition-shadow",
        // Border and ring
        isSelected
          ? cn("border-transparent ring-2", sig.ring)
          : "border-gray-200 hover:border-gray-300",
        // Shadow
        isSelected
          ? cn("shadow-lg", sig.glow)
          : isHovered
          ? "shadow-lg shadow-gray-200/50"
          : "shadow-md shadow-gray-100/50",
        // Focus visible
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-400",
        // Cursor states
        (isLocked || disabled) && "cursor-not-allowed"
      )}
    >
      {/* ============= AVATAR IMAGE (Top Half) ============= */}
      <div className="relative h-[200px] overflow-hidden bg-gray-100">
        {avatar.avatarImageUrl ? (
          <motion.img
            src={avatar.avatarImageUrl}
            alt={avatar.name}
            className="w-full h-full object-cover object-[center_15%]"
            animate={{
              scale: isHovered || isSelected ? 1.05 : 1,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        ) : (
          <div className={cn("w-full h-full flex items-center justify-center", sig.bg)}>
            <User className={cn("w-24 h-24 opacity-40", sig.text)} />
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Selection Badge */}
        <AnimatePresence>
          {isSelected && selectionOrder && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={cn(
                "absolute top-3 left-3 w-9 h-9 rounded-full",
                "bg-gradient-to-br flex items-center justify-center",
                "text-white text-base font-bold shadow-lg",
                sig.gradient
              )}
            >
              {selectionOrder}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Checkmark */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={cn(
                "absolute top-3 right-3 w-9 h-9 rounded-full",
                "bg-white flex items-center justify-center shadow-lg"
              )}
            >
              <Check className={cn("w-5 h-5", sig.text)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Button - appears on hover */}
        <AnimatePresence>
          {isHovered && onChatClick && !isLocked && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={handleChatClick}
              className={cn(
                "absolute bottom-3 left-1/2 -translate-x-1/2",
                "flex items-center gap-2 px-4 py-2 rounded-full",
                "bg-white/95 backdrop-blur-sm shadow-lg",
                "text-sm font-semibold transition-all",
                "hover:scale-105 active:scale-95",
                sig.text
              )}
            >
              <MessageCircle className="w-4 h-4" />
              Chat Now
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ============= INFO SECTION (Bottom Half) ============= */}
      <div className="p-5">
        {/* Name */}
        <h3 className="text-xl font-bold text-gray-900">
          {avatar.name}
        </h3>

        {/* Tagline / Legacy Title */}
        <p className={cn("text-sm font-medium mt-0.5 mb-3", sig.text)}>
          {enhancement?.tagline || sig.legacyTitle}
        </p>

        {/* Enhanced Skills */}
        <div className="flex flex-wrap gap-2">
          {displaySkills.map((skill) => (
            <span
              key={skill}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-full",
                sig.bg, sig.text
              )}
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Status indicator when selected */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-3 border-t border-gray-100"
            >
              <div className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold",
                isDebateReady
                  ? "bg-gradient-to-r from-cyan-50 to-violet-50 text-violet-600 border border-violet-200"
                  : cn(sig.bg, sig.text)
              )}>
                <motion.span
                  className={cn(
                    "inline-block w-2 h-2 rounded-full mr-2",
                    isDebateReady ? "bg-violet-500" : "bg-current"
                  )}
                  animate={!reducedMotion ? { opacity: [1, 0.4, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {isDebateReady ? "Ready for Debate" : "Selected"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============= LOCKED OVERLAY ============= */}
      <AnimatePresence>
        {isLocked && !isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-[2px] flex items-center justify-center"
          >
            <div className="text-center px-6">
              <motion.div
                animate={!reducedMotion ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200"
              >
                <Lock className="w-5 h-5 text-gray-400" />
              </motion.div>
              <p className="text-xs text-gray-500 font-medium">
                Max 3 selected
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// Avatar Grid Component
// =============================================================================

export function AvatarGrid({
  avatars,
  selectedIds,
  onSelect,
  onDeselect,
  maxSelections = 3,
}: {
  avatars: Avatar[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
  maxSelections?: number;
}) {
  const isMaxSelected = selectedIds.length >= maxSelections;
  const isDebateReady = selectedIds.length >= 2;

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-5"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {avatars.map((avatar) => {
        const selectionIndex = selectedIds.indexOf(avatar.id);
        return (
          <motion.div
            key={avatar.id}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                },
              },
            }}
          >
            <AvatarCard
              avatar={avatar}
              isSelected={selectionIndex !== -1}
              selectionOrder={selectionIndex !== -1 ? selectionIndex + 1 : undefined}
              onSelect={() => onSelect(avatar.id)}
              onDeselect={() => onDeselect(avatar.id)}
              isLocked={isMaxSelected && selectionIndex === -1}
              isDebateReady={isDebateReady && selectionIndex !== -1}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// =============================================================================
// VS Connector Component
// =============================================================================

export function VSConnector({ visible }: { visible: boolean }) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute z-30 flex items-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <motion.div
            className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"
            animate={!reducedMotion ? { opacity: [0.4, 0.7, 0.4] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm shadow-lg"
            animate={!reducedMotion ? {
              boxShadow: [
                "0 4px 15px rgba(0,0,0,0.08)",
                "0 8px 25px rgba(0,0,0,0.12)",
                "0 4px 15px rgba(0,0,0,0.08)",
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            VS
          </motion.div>
          <motion.div
            className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"
            animate={!reducedMotion ? { opacity: [0.4, 0.7, 0.4] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AvatarCard;
