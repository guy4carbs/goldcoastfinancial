import { useEffect } from "react";
import { Sparkles } from "lucide-react";

/**
 * UpdateAvailableModal — Apple-style "lifeOS X.Y.Z is ready" popup.
 *
 * Shows a tasteful, restrained card centered over a 50% scrim. Two CTAs:
 *   - Update Now (primary, gold) → window.location reload via parent
 *   - Later (text-only) → 24h dismissal recorded server-side
 *
 * Sentence-case copy. No exclamation marks. No marketing-speak. The
 * dismissable popup + persistent badge model mirrors iOS Settings'
 * software-update flow.
 */
export function UpdateAvailableModal({
  release,
  onUpdate,
  onDismiss,
}: {
  release: { version: string; title: string; summary: string; release_type: "major" | "minor" | "patch"; highlight_label: string | null };
  onUpdate: () => void | Promise<void>;
  onDismiss: () => void | Promise<void>;
}) {
  // Esc dismisses.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  const accentLabel =
    release.highlight_label ||
    (release.release_type === "major" ? "Major release"
      : release.release_type === "minor" ? "New features"
      : "Improvements");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lifeos-update-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 460,
          maxWidth: "92vw",
          backgroundColor: "var(--gc-surface)",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-md)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          padding: "var(--gc-space-6)",
          animation: "lifeos-pop-in 240ms cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {/* Hero — small gradient circle with sparkle, never a giant graphic */}
        <div className="flex items-center gap-3" style={{ marginBottom: "var(--gc-space-4)" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--gc-radius-full)",
              background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px color-mix(in srgb, var(--gc-gold) 40%, transparent)",
              flexShrink: 0,
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: "var(--gc-ink)" }} />
          </div>
          <div className="flex flex-col">
            <span
              style={{
                fontSize: "var(--gc-text-xs)",
                letterSpacing: "var(--gc-tracking-wider)",
                textTransform: "uppercase",
                color: "var(--gc-gold)",
                fontWeight: 600,
              }}
            >
              {accentLabel}
            </span>
            <span
              style={{
                fontFamily: "var(--gc-font-mono, monospace)",
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
              }}
            >
              lifeOS {release.version}
            </span>
          </div>
        </div>

        {/* Title — Playfair, sentence case */}
        <h2
          id="lifeos-update-title"
          style={{
            fontFamily: "var(--gc-font-display)",
            fontSize: "var(--gc-text-2xl)",
            color: "var(--gc-text-primary)",
            margin: 0,
            marginBottom: "var(--gc-space-2)",
            lineHeight: 1.2,
          }}
        >
          {release.title}
        </h2>

        {/* Summary — body font, restrained */}
        <p
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-md)",
            color: "var(--gc-text-secondary)",
            lineHeight: 1.5,
            margin: 0,
            marginBottom: "var(--gc-space-5)",
          }}
        >
          {release.summary}
        </p>

        {/* Note about safety — mirrors Apple's "your data won't be lost" assurance */}
        <div
          style={{
            padding: "var(--gc-space-2) var(--gc-space-3)",
            backgroundColor: "var(--gc-surface-2)",
            borderRadius: "var(--gc-radius-sm)",
            border: "1px solid var(--gc-border-subtle)",
            marginBottom: "var(--gc-space-5)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-muted)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Updating is safe — your work, settings, and conversations stay exactly where they are.
            The page will refresh and reopen here.
          </p>
        </div>

        {/* CTAs — Update Now primary, Later text-only */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onDismiss}
            style={{
              padding: "var(--gc-space-2) var(--gc-space-4)",
              backgroundColor: "transparent",
              color: "var(--gc-text-secondary)",
              border: "none",
              borderRadius: "var(--gc-radius-sm)",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-md)",
              cursor: "pointer",
            }}
          >
            Later
          </button>
          <button
            type="button"
            onClick={onUpdate}
            style={{
              padding: "var(--gc-space-2) var(--gc-space-5)",
              background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
              color: "var(--gc-ink)",
              border: "none",
              borderRadius: "var(--gc-radius-sm)",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-md)",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px color-mix(in srgb, var(--gc-gold) 30%, transparent)",
            }}
          >
            Update Now
          </button>
        </div>
      </div>

      {/* Entrance animation */}
      <style>{`
        @keyframes lifeos-pop-in {
          from { opacity: 0; transform: scale(0.96) translateY(14px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
