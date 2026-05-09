import { useEffect, useState } from "react";
import { Sparkles, ArrowUpRight, X } from "lucide-react";
import { SimpleMarkdown } from "./SimpleMarkdown";

interface FullRelease {
  id: string;
  version: string;
  release_type: "major" | "minor" | "patch";
  title: string;
  summary: string;
  body_markdown: string;
  highlight_label: string | null;
  published_at: string | null;
}

/**
 * WhatsNewModal — Apple-style "What's New" modal that auto-fires post-update
 * (or opens via the user-menu link). Renders the release's full markdown
 * body via SimpleMarkdown, with a hero gradient header + version chip.
 *
 * Two CTAs: "Got it" (primary, marks notes_viewed via parent), "Open
 * archive" (secondary, opens /lifeos/whats-new in a new tab so the user
 * can browse older releases without losing their place).
 */
export function WhatsNewModal({
  versionString,
  onClose,
}: {
  versionString: string;
  onClose: () => void | Promise<void>;
}) {
  const [release, setRelease] = useState<FullRelease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/lifeos/releases/${encodeURIComponent(versionString)}`, {
          credentials: "include",
        });
        if (!r.ok) {
          if (!cancelled) setLoading(false);
          return;
        }
        const data = await r.json();
        if (!cancelled) {
          setRelease(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [versionString]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lifeos-whats-new-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 580,
          maxWidth: "94vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--gc-surface)",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-md)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
          animation: "lifeos-pop-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {/* Hero strip — gradient bar, NOT a giant image */}
        <div
          style={{
            position: "relative",
            padding: "28px 28px 20px",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--gc-gold) 18%, transparent), color-mix(in srgb, var(--gc-gold-bright) 6%, transparent))",
            borderBottom: "1px solid var(--gc-border-subtle)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              padding: 6,
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "var(--gc-radius-sm)",
              color: "var(--gc-text-secondary)",
              cursor: "pointer",
            }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--gc-radius-full)",
                background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px color-mix(in srgb, var(--gc-gold) 40%, transparent)",
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: "var(--gc-ink)" }} />
            </div>
            <span
              style={{
                fontFamily: "var(--gc-font-mono, monospace)",
                fontSize: 12,
                padding: "3px 10px",
                borderRadius: "var(--gc-radius-full, 999px)",
                backgroundColor: "var(--gc-surface-2)",
                color: "var(--gc-text-muted)",
                border: "1px solid var(--gc-border-subtle)",
                letterSpacing: "0.03em",
              }}
            >
              lifeOS {versionString}
            </span>
          </div>

          <div
            style={{
              fontSize: "var(--gc-text-xs)",
              letterSpacing: "var(--gc-tracking-wider)",
              textTransform: "uppercase",
              color: "var(--gc-gold)",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            What's new
          </div>
          <h2
            id="lifeos-whats-new-title"
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: 26,
              color: "var(--gc-text-primary)",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {release?.title ?? "Release notes"}
          </h2>
          {release?.summary && (
            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: "var(--gc-text-secondary)",
                fontSize: "var(--gc-text-md, 15px)",
                lineHeight: 1.5,
              }}
            >
              {release.summary}
            </p>
          )}
        </div>

        {/* Body — scrollable markdown */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 28px 8px",
          }}
        >
          {loading ? (
            <p style={{ color: "var(--gc-text-muted)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
              Loading release notes…
            </p>
          ) : release ? (
            <SimpleMarkdown source={release.body_markdown} />
          ) : (
            <p style={{ color: "var(--gc-text-muted)", fontSize: 14, padding: "24px 0", textAlign: "center" }}>
              Couldn't load these notes. Try opening the archive instead.
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid var(--gc-border-subtle)",
            backgroundColor: "var(--gc-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a
            href="/lifeos/whats-new"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              color: "var(--gc-text-secondary)",
              fontSize: "var(--gc-text-sm, 13px)",
              textDecoration: "none",
            }}
          >
            Open archive <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 22px",
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
            Got it
          </button>
        </div>
      </div>

      <style>{`
        @keyframes lifeos-pop-in {
          from { opacity: 0; transform: scale(0.96) translateY(14px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
