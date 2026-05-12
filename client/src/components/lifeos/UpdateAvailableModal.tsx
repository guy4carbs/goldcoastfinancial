import { createPortal } from "react-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { GCModal } from "@/components/gc/GCModal";
import { GCPrimaryButton, GCSecondaryButton } from "@/components/gc/GCButton";

/**
 * UpdateAvailableModal — "lifeOS X.Y.Z is ready" popup, rendered through
 * the canonical GCModal wrapper so it matches every other Founders Lounge
 * dialog (SendApplicationDialog, ManageGoalsModal, AgencyEditModal, etc.).
 *
 * Two CTAs in the pinned footer:
 *   - Update Now (GCPrimaryButton) → window.location reload via parent
 *   - Later (GCSecondaryButton)    → 24h dismissal recorded server-side
 *
 * Sentence-case copy. No exclamation marks. The dismissable popup +
 * persistent badge model mirrors iOS Settings' software-update flow.
 */
export function UpdateAvailableModal({
  release,
  onUpdate,
  onDismiss,
  applying = false,
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
  applying?: boolean;
}) {
  const accentLabel =
    release.highlight_label ||
    (release.release_type === "major"
      ? "Major release"
      : release.release_type === "minor"
        ? "New features"
        : "Improvements");

  const icon = (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "999px",
        background: "var(--gc-btn-primary-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Sparkles className="w-4 h-4" style={{ color: "var(--gc-btn-primary-text)" }} />
    </div>
  );

  // Render in a portal under a self-themed div. The LifeOSUpdateProvider
  // sits above GCShell in App.tsx, so without this wrapper the
  // `var(--gc-surface)` lookup misses (tokens are scoped to [data-theme])
  // and the modal renders with a transparent background.
  if (typeof document === "undefined") return null;

  // While applying, the modal transitions to a non-dismissable "Updating…"
  // view. Esc / scrim click are no-ops so the user can't accidentally close
  // mid-reload. Buttons are disabled. A spinner makes it clear work is in
  // flight before the page swaps to the new bundle.
  const handleClose = applying ? () => {} : () => void onDismiss();
  const handlePrimary = applying ? () => {} : () => void onUpdate();

  return createPortal(
    <div data-theme="gc-dark" style={{ position: "relative", zIndex: 9999 }}>
      <GCModal
        title={applying ? `Updating to lifeOS ${release.version}` : release.title}
        subtitle={applying
          ? "Refreshing the bundle and reopening this page — your work, settings, and conversations stay exactly where they are."
          : release.summary}
        icon={applying ? (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "999px",
              background: "var(--gc-btn-primary-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--gc-btn-primary-text)" }} />
          </div>
        ) : icon}
        onClose={handleClose}
        width={460}
        titleId="lifeos-update-title"
        footer={
        <div className="flex items-center justify-end gap-2">
          <GCSecondaryButton onClick={handleClose} disabled={applying}>Later</GCSecondaryButton>
          <GCPrimaryButton onClick={handlePrimary} disabled={applying} icon={applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}>
            {applying ? "Updating…" : "Update Now"}
          </GCPrimaryButton>
        </div>
      }
    >
      {/* Accent row — release tag + version chip */}
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--gc-space-3)" }}>
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
        <span style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-xs)" }}>·</span>
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

      {/* Safety callout — mirrors Apple's "your data won't be lost" assurance.
          While applying, swap to a step-by-step progress note so the user
          isn't staring at a blank-feeling spinner alone. */}
      {applying ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--gc-space-3)",
            padding: "var(--gc-space-3) var(--gc-space-3)",
            backgroundColor: "var(--gc-surface-2)",
            borderRadius: "var(--gc-radius-sm)",
            border: "1px solid var(--gc-border-subtle, var(--gc-border))",
          }}
        >
          <Loader2
            className="animate-spin"
            style={{ width: 18, height: 18, color: "var(--gc-gold)", flexShrink: 0 }}
          />
          <div>
            <p
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-primary)",
                margin: 0,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              Installing lifeOS {release.version}
            </p>
            <p
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
                margin: 0,
                marginTop: 2,
                lineHeight: 1.5,
              }}
            >
              Wiping the cached bundle and pulling the new one. The page will reopen here in a moment.
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "var(--gc-space-2) var(--gc-space-3)",
            backgroundColor: "var(--gc-surface-2)",
            borderRadius: "var(--gc-radius-sm)",
            border: "1px solid var(--gc-border-subtle, var(--gc-border))",
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
      )}
      </GCModal>
    </div>,
    document.body,
  );
}
