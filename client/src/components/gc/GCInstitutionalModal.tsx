import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import FocusTrap from "focus-trap-react";

/**
 * GCInstitutionalModal — light-themed sibling of GCModal for the public
 * institutional site (cream surface + burgundy text + gold border). Shares
 * GCModal's 3-zone layout (sticky header / scrollable body / pinned footer)
 * so behavior is identical; only the palette differs.
 *
 *   ┌─────────────── modal-shell (88vh max, flex column) ──────────────┐
 *   │ modal-header   (flex-shrink: 0, sticky top, no scroll)           │
 *   │ modal-body     (flex: 1, overflow-y: auto — scrollable)          │
 *   │ modal-footer?  (flex-shrink: 0, sticky bottom, optional)         │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * Used by /lifeos/whats-new (the public release archive) so the modal
 * matches the institutional shell rather than the Founders dark theme.
 */
export function GCInstitutionalModal({
  title,
  subtitle,
  icon,
  onClose,
  width = 560,
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

  if (typeof document === "undefined") return null;
  return createPortal(
    // HIGH H-11 (audit 2026-05-12): focus trap for WCAG 2.1.3.1.
    <FocusTrap
      focusTrapOptions={{
        clickOutsideDeactivates: true,
        escapeDeactivates: false,
        returnFocusOnDeactivate: true,
        allowOutsideClick: true,
      }}
    >
    <div
      data-theme="gc-light"
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(20, 8, 14, 0.45)", zIndex: 9999 }}
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
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FBF7F0",
          border: "1px solid hsl(348, 30%, 82%)",
          borderRadius: "var(--gc-radius-md, 8px)",
          boxShadow: "0 20px 50px rgba(20, 8, 14, 0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header — pinned, no scroll */}
        <div
          style={{
            flexShrink: 0,
            padding: "24px 28px 12px",
            borderBottom: "1px solid hsl(348, 30%, 88%)",
            backgroundColor: "#FBF7F0",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {icon}
              <div
                id={titleId}
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 22,
                  color: "hsl(348, 65%, 22%)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              type="button"
              style={{
                background: "none",
                border: "none",
                borderRadius: "var(--gc-radius-sm, 6px)",
                width: 28,
                height: 28,
                cursor: "pointer",
                color: "hsl(348, 25%, 35%)",
                flexShrink: 0,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {subtitle !== null && subtitle !== undefined && (
            <p
              style={{
                fontFamily: "'Inter', -apple-system, sans-serif",
                fontSize: 14,
                color: "hsl(348, 20%, 30%)",
                lineHeight: 1.5,
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Body — scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 28px",
            minHeight: 0,
            backgroundColor: "#ffffff",
          }}
        >
          {children}
        </div>

        {/* Footer — pinned, optional */}
        {footer && (
          <div
            style={{
              flexShrink: 0,
              padding: "14px 28px",
              borderTop: "1px solid hsl(348, 30%, 88%)",
              backgroundColor: "#FBF7F0",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
    </FocusTrap>,
    document.body,
  );
}
