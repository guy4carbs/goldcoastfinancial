import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import FocusTrap from "focus-trap-react";

/**
 * GCModal — bespoke fixed-overlay dialog matching the HCMS Send Application
 * pattern. Used across the Founders Lounge for invite, confirm, and propose
 * flows so every modal looks identical.
 *
 * Layout — split into 3 zones to keep header + footer pinned while only the
 * body scrolls. This fixes the "long form scrolls the close button out of
 * view" bug AND lets Radix Select dropdowns calculate
 * `--radix-select-content-available-height` against the visible body region
 * instead of the entire modal envelope.
 *
 *   ┌─────────────── modal-shell (90vh max, flex column) ──────────────┐
 *   │ modal-header   (flex-shrink: 0, sticky top, no scroll)           │
 *   │ modal-body     (flex: 1, overflow-y: auto — scrollable)          │
 *   │ modal-footer?  (flex-shrink: 0, sticky bottom, optional)         │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * Existing call sites that put their action buttons at the end of `children`
 * continue to work — the buttons just live inside the scrollable body region.
 * Pass `footer` only when you need the action row pinned regardless of scroll
 * position.
 */
export function GCModal({
  title,
  subtitle,
  icon,
  onClose,
  width = 480,
  children,
  footer,
  titleId,
}: {
  title: string;
  subtitle?: string | null;
  icon?: ReactNode;
  onClose: () => void;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
  titleId?: string;
}) {
  // Lock background scroll while open + close on Esc.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    // HIGH H-11 (audit 2026-05-12): focus-trap-react locks tab navigation
    // inside the modal until it closes. WCAG 2.1.3.1 / 2.4.3 / 4.1.2.
    // `clickOutsideDeactivates` lets click-on-scrim still close the modal
    // (preserves existing behaviour); `escapeDeactivates: false` keeps Esc
    // close in our hands (already wired in useEffect above).
    <FocusTrap
      focusTrapOptions={{
        clickOutsideDeactivates: true,
        escapeDeactivates: false,
        returnFocusOnDeactivate: true,
        allowOutsideClick: true,
      }}
    >
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: "95vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--gc-surface)",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-md)",
          // No padding/overflow on the shell itself — header/body/footer own
          // their own spacing so the body's scroll context stays isolated.
          overflow: "hidden",
        }}
      >
        {/* Header — sticky top (non-scroll). Holds title, subtitle, close. */}
        <div
          style={{
            flexShrink: 0,
            padding: "var(--gc-space-6) var(--gc-space-6) var(--gc-space-3)",
            borderBottom: "1px solid var(--gc-border-subtle, var(--gc-border))",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {icon}
              <div
                id={titleId}
                style={{
                  fontFamily: "var(--gc-font-display)",
                  fontSize: "var(--gc-text-xl)",
                  color: "var(--gc-text-primary)",
                  letterSpacing: "var(--gc-tracking-tight)",
                }}
              >
                {title}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex items-center justify-center"
              style={{
                background: "none",
                border: "none",
                borderRadius: "var(--gc-radius-sm)",
                width: 28,
                height: 28,
                cursor: "pointer",
                color: "var(--gc-text-muted)",
                flexShrink: 0,
                padding: 0,
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {subtitle !== null && subtitle !== undefined && (
            <p
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-secondary)",
                lineHeight: 1.5,
                marginTop: "var(--gc-space-2)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Body — the only scrollable region. Long forms + Radix Select
            dropdowns now constrain themselves to this box. */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "var(--gc-space-4) var(--gc-space-6)",
            // min-height: 0 unblocks flex item shrinking inside the column
            // — without this Safari refuses to scroll children of flex: 1.
            minHeight: 0,
          }}
        >
          {children}
        </div>

        {/* Footer — optional sticky bottom. Existing modals embed their
            actions at the end of children; this slot is for future modals
            that need the action row pinned regardless of scroll. */}
        {footer && (
          <div
            style={{
              flexShrink: 0,
              padding: "var(--gc-space-3) var(--gc-space-6) var(--gc-space-4)",
              borderTop: "1px solid var(--gc-border-subtle, var(--gc-border))",
              backgroundColor: "var(--gc-surface)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
    </FocusTrap>
  );
}

// Shared label / input styles for forms inside GCModal.
export const GC_FORM_LABEL: React.CSSProperties = {
  fontSize: "var(--gc-text-xs)",
  letterSpacing: "var(--gc-tracking-wider)",
  textTransform: "uppercase",
  color: "var(--gc-text-muted)",
  display: "block",
  marginBottom: "var(--gc-space-1)",
  fontFamily: "var(--gc-font-body)",
};

export const GC_FORM_INPUT: React.CSSProperties = {
  width: "100%",
  padding: "var(--gc-space-2) var(--gc-space-3)",
  backgroundColor: "var(--gc-surface-2)",
  border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-sm)",
  color: "var(--gc-text-primary)",
  fontFamily: "var(--gc-font-body)",
  fontSize: "var(--gc-text-md)",
  outline: "none",
};
