/**
 * Shared primitives for the Admin Sequences feature.
 *
 * Glass modal + drawer shells, status-badge config, and small style helpers —
 * all cloned from the AdminNewsletter chrome conventions (motion + GLASS tokens).
 */

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";
import { GLASS, RADIUS, SHADOW, MOTION, TYPE, COLORS } from "@/lib/heritageDesignSystem";

// =============================================================================
// SHARED STYLES
// =============================================================================

export const modalInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 16px",
  border: `1px solid ${COLORS.gray[300]}`,
  borderRadius: RADIUS.input,
  fontSize: TYPE.meta,
};

export const modalLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: TYPE.meta,
  fontWeight: 500,
  color: COLORS.gray[700],
  marginBottom: 4,
};

export const primaryBtnStyle: React.CSSProperties = {
  borderRadius: RADIUS.button,
  background: COLORS.primary.violet[600],
  color: "white",
  fontSize: TYPE.meta,
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
  padding: "8px 16px",
};

export const ghostBtnStyle: React.CSSProperties = {
  borderRadius: RADIUS.button,
  background: COLORS.gray[100],
  color: COLORS.gray[700],
  fontSize: TYPE.meta,
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
  padding: "8px 16px",
};

// =============================================================================
// STATUS BADGE
// =============================================================================

interface BadgeConfig {
  label: string;
  bg: string;
  text: string;
}

export const ENROLLMENT_STATUS_CONFIG: Record<string, BadgeConfig> = {
  active: { label: "Active", bg: "bg-green-100", text: "text-green-700" },
  paused: { label: "Paused", bg: "bg-amber-100", text: "text-amber-700" },
  completed: { label: "Completed", bg: "bg-blue-100", text: "text-blue-700" },
  unsubscribed: { label: "Unsubscribed", bg: "bg-red-100", text: "text-red-700" },
};

export const EMAIL_STATUS_CONFIG: Record<string, BadgeConfig> = {
  sent: { label: "Sent", bg: "bg-slate-100", text: "text-slate-700" },
  delivered: { label: "Delivered", bg: "bg-cyan-100", text: "text-cyan-700" },
  opened: { label: "Opened", bg: "bg-violet-100", text: "text-violet-700" },
  clicked: { label: "Clicked", bg: "bg-green-100", text: "text-green-700" },
  bounced: { label: "Bounced", bg: "bg-red-100", text: "text-red-700" },
  failed: { label: "Failed", bg: "bg-red-100", text: "text-red-700" },
  skipped: { label: "Skipped", bg: "bg-gray-100", text: "text-gray-600" },
};

export function StatusBadge({ config }: { config: BadgeConfig }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatStepDelay(delayDays: number, delayHours: number): string {
  if (delayDays === 0 && delayHours === 0) return "Immediately";
  const parts: string[] = [];
  if (delayDays > 0) parts.push(`${delayDays}d`);
  if (delayHours > 0) parts.push(`${delayHours}h`);
  return `After ${parts.join(" ")}`;
}

// =============================================================================
// GLASS MODAL (centered dialog)
// =============================================================================

export function GlassModal({
  title,
  onClose,
  children,
  maxWidth = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: MOTION.duration.modal, ease: MOTION.easing }}
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        style={{ ...GLASS.css.light, borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 px-6 py-4 flex items-center justify-between z-10"
          style={{
            background: GLASS.backgroundLight,
            borderBottom: `1px solid ${GLASS.border}`,
            borderRadius: `${RADIUS.hero}px ${RADIUS.hero}px 0 0`,
          }}
        >
          <h2 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900] }}>{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100" style={{ borderRadius: RADIUS.input }}>
            <X className="w-5 h-5" style={{ color: COLORS.gray[500] }} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

// =============================================================================
// GLASS DRAWER (right-side sheet)
// =============================================================================

export function GlassDrawer({
  title,
  onClose,
  onBack,
  children,
  maxWidth = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex justify-end"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: MOTION.duration.modal, ease: MOTION.easing }}
          className={`w-full ${maxWidth} h-full overflow-y-auto`}
          style={{
            ...GLASS.css.light,
            borderRadius: `${RADIUS.hero}px 0 0 ${RADIUS.hero}px`,
            boxShadow: SHADOW.hero,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="sticky top-0 px-6 py-4 flex items-center justify-between z-10"
            style={{ background: GLASS.backgroundLight, borderBottom: `1px solid ${GLASS.border}` }}
          >
            <button
              onClick={onBack || onClose}
              className="p-1 hover:bg-gray-100"
              style={{ borderRadius: RADIUS.input }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: COLORS.gray[500] }} />
            </button>
            <h2 style={{ fontWeight: 600, color: COLORS.gray[900], fontSize: TYPE.body }}>{title}</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100" style={{ borderRadius: RADIUS.input }}>
              <X className="w-5 h-5" style={{ color: COLORS.gray[500] }} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// =============================================================================
// TABLE SKELETON
// =============================================================================

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse"
          style={{ background: COLORS.gray[100], borderRadius: RADIUS.input }}
        />
      ))}
    </div>
  );
}
