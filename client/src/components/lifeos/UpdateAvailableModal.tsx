import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { COLORS, RADIUS, SHADOW } from "@/lib/heritageDesignSystem";

const VIOLET = COLORS.primary.violet;
const AMBER = COLORS.accent.amber;

/**
 * Heritage's "lifeOS X.Y.Z is ready" popup. Same Apple-style restraint
 * as Gold Coast's version, just rendered with the violet/amber gradient
 * we use across hierarchy hero cards + KPI tiles.
 */
export function UpdateAvailableModal({
  release,
  onUpdate,
  onDismiss,
}: {
  release: {
    version: string;
    title: string;
    summary: string;
    release_type: "major" | "minor" | "patch";
    highlight_label: string | null;
  };
  onUpdate: () => void | Promise<void>;
  onDismiss: () => void | Promise<void>;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  const accentLabel =
    release.highlight_label ||
    (release.release_type === "major"
      ? "Major release"
      : release.release_type === "minor"
        ? "New features"
        : "Improvements");

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center"
        style={{
          backgroundColor: "rgba(10, 8, 22, 0.62)",
          backdropFilter: "blur(6px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={() => onDismiss()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lifeos-update-title"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 460,
            maxWidth: "92vw",
            backgroundColor: "#fff",
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.level4,
            overflow: "hidden",
          }}
        >
          {/* Hero stripe — signature violet→purple→amber gradient */}
          <div
            style={{
              padding: "22px 24px 16px",
              background: COLORS.gradients.heroWithAccent,
              color: "#fff",
              position: "relative",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: -32,
                right: -32,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                filter: "blur(28px)",
                pointerEvents: "none",
              }}
            />
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.25)",
                  flexShrink: 0,
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: "#fff" }} />
              </div>
              <div className="flex flex-col">
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: AMBER[200],
                    fontWeight: 600,
                  }}
                >
                  {accentLabel}
                </span>
                <span
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.78)",
                  }}
                >
                  lifeOS {release.version}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 24px 24px" }}>
            <h2
              id="lifeos-update-title"
              style={{
                fontFamily:
                  "'Playfair Display', Georgia, serif",
                fontSize: 22,
                color: COLORS.gray[900],
                margin: 0,
                marginBottom: 8,
                lineHeight: 1.2,
                fontWeight: 600,
              }}
            >
              {release.title}
            </h2>
            <p
              style={{
                fontFamily: "'Inter', -apple-system, sans-serif",
                fontSize: 15,
                color: COLORS.gray[600],
                lineHeight: 1.55,
                margin: 0,
                marginBottom: 18,
              }}
            >
              {release.summary}
            </p>

            <div
              style={{
                padding: "10px 14px",
                backgroundColor: VIOLET[50],
                borderRadius: RADIUS.input,
                border: `1px solid ${VIOLET[100]}`,
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  fontSize: 12,
                  color: COLORS.gray[600],
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                Updating is safe — your work, settings, and data stay exactly where they are.
                The page will refresh and reopen here.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onDismiss()}
                style={{
                  padding: "8px 14px",
                  backgroundColor: "transparent",
                  color: COLORS.gray[600],
                  border: "none",
                  borderRadius: RADIUS.input,
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Later
              </button>
              <button
                type="button"
                onClick={() => onUpdate()}
                style={{
                  padding: "9px 22px",
                  background: COLORS.gradients.heroWithAccent,
                  color: "#fff",
                  border: "none",
                  borderRadius: RADIUS.input,
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: `0 4px 12px ${VIOLET[400]}55`,
                }}
              >
                Update Now
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
