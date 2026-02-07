import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Check,
  Plus,
  ArrowLeftRight,
  Brain,
  Target,
  Shield,
  Flame,
  Heart,
  MessageSquare,
  User,
} from "lucide-react";
import type { Avatar } from "@/lib/avatarCouncilStore";

// Map avatar slugs to icons
const avatarIcons: Record<string, React.ElementType> = {
  "insurance-expert": Brain,
  "sales-closer": Target,
  "mindset-coach": Heart,
  "compliance-specialist": Shield,
  "wolf-closer": Flame,
  "objection-handler": MessageSquare,
};

// Avatar titles
const avatarTitles: Record<string, string> = {
  "insurance-expert": "Policy & Underwriting Authority",
  "sales-closer": "The Revenue Accelerator",
  "mindset-coach": "Performance Architect",
  "compliance-specialist": "The Compliance Sentinel",
  "wolf-closer": "The Ethical Predator",
  "objection-handler": "The Objection Surgeon",
};

// Avatar gradients
const avatarGradients: Record<string, string> = {
  "insurance-expert": "from-blue-600 to-blue-800",
  "sales-closer": "from-orange-600 to-orange-800",
  "mindset-coach": "from-purple-600 to-purple-800",
  "compliance-specialist": "from-emerald-600 to-emerald-800",
  "wolf-closer": "from-red-600 to-red-800",
  "objection-handler": "from-amber-600 to-amber-800",
};

interface AvatarRevealProps {
  avatar: Avatar;
  rationale: string;
  onContinue: () => void;
  onAddAdvisor: () => void;
  onSwitch: () => void;
}

export function AvatarReveal({
  avatar,
  rationale,
  onContinue,
  onAddAdvisor,
  onSwitch,
}: AvatarRevealProps) {
  const Icon = avatarIcons[avatar.slug] || User;
  const title = avatarTitles[avatar.slug] || "Specialist";
  const gradient = avatarGradients[avatar.slug] || "from-gray-600 to-gray-800";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
        {/* Avatar Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br flex-shrink-0",
              gradient
            )}
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {avatar.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          </motion.div>
        </div>

        {/* Rationale */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50"
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 italic">
            "{rationale}"
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="p-4 flex gap-2"
        >
          <Button
            onClick={onContinue}
            className="flex-1 gap-2"
            autoFocus
          >
            <Check className="w-4 h-4" />
            Continue
          </Button>

          <Button
            onClick={onAddAdvisor}
            variant="outline"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Advisor</span>
          </Button>

          <Button
            onClick={onSwitch}
            variant="ghost"
            size="icon"
            className="text-gray-500"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Routing indicator component
export function RoutingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-2"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <span>Routing to best advisor...</span>
    </motion.div>
  );
}

// Compact avatar selector for switching/adding
interface CompactAvatarSelectorProps {
  avatars: Avatar[];
  selectedId?: string;
  excludeIds?: string[];
  onSelect: (avatar: Avatar) => void;
  onClose: () => void;
}

export function CompactAvatarSelector({
  avatars,
  selectedId,
  excludeIds = [],
  onSelect,
  onClose,
}: CompactAvatarSelectorProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const availableAvatars = avatars.filter((a) => !excludeIds.includes(a.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-4 w-full max-w-md mx-auto"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Choose an advisor:
        </p>
        <button
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Cancel
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {availableAvatars.map((avatar) => {
          const Icon = avatarIcons[avatar.slug] || User;
          const gradient = avatarGradients[avatar.slug] || "from-gray-600 to-gray-800";
          const isSelected = avatar.id === selectedId;
          const isHovered = avatar.id === hoveredId;

          return (
            <button
              key={avatar.id}
              onClick={() => onSelect(avatar)}
              onMouseEnter={() => setHoveredId(avatar.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "relative w-12 h-12 rounded-lg flex items-center justify-center transition-all",
                "bg-gradient-to-br",
                gradient,
                isSelected && "ring-2 ring-offset-2 ring-primary",
                !isSelected && "hover:scale-105 hover:shadow-md"
              )}
            >
              <Icon className="w-6 h-6 text-white" />
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Show hovered/selected avatar name */}
      <p className="text-xs text-gray-500 dark:text-gray-400 h-4">
        {hoveredId
          ? availableAvatars.find((a) => a.id === hoveredId)?.name
          : selectedId
          ? `${availableAvatars.find((a) => a.id === selectedId)?.name} (current)`
          : ""}
      </p>
    </motion.div>
  );
}

export default AvatarReveal;
