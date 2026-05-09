import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUpRight, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { COLORS, RADIUS, SHADOW } from "@/lib/heritageDesignSystem";

const VIOLET = COLORS.primary.violet;
const AMBER = COLORS.accent.amber;

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
 * Heritage's "What's New" modal. Hero gradient header (signature
 * violet→purple→amber), Inter body, react-markdown for rich content.
 * Auto-fires post-update; re-openable from /lifeos/whats-new.
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
        const r = await fetch(
          `/api/lifeos/releases/${encodeURIComponent(versionString)}`,
          { credentials: "include" },
        );
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
    return () => {
      cancelled = true;
    };
  }, [versionString]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

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
        onClick={() => onClose()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lifeos-whats-new-title"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 580,
            maxWidth: "94vw",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.level4,
            overflow: "hidden",
          }}
        >
          {/* Hero — signature gradient with overlay */}
          <div
            style={{
              position: "relative",
              padding: "26px 28px 22px",
              background: COLORS.gradients.heroWithAccent,
              color: "#fff",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: -50,
                right: -40,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.16)",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />
            <button
              type="button"
              onClick={() => onClose()}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                padding: 6,
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: RADIUS.input,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles className="w-5 h-5" style={{ color: "#fff" }} />
              </div>
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.22)",
                  letterSpacing: "0.03em",
                }}
              >
                lifeOS {versionString}
              </span>
            </div>

            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: AMBER[200],
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              What's new
            </div>
            <h2
              id="lifeos-whats-new-title"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 24,
                color: "#fff",
                margin: 0,
                lineHeight: 1.2,
                fontWeight: 600,
              }}
            >
              {release?.title ?? "Release notes"}
            </h2>
            {release?.summary && (
              <p
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  color: "rgba(255,255,255,0.86)",
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
              >
                {release.summary}
              </p>
            )}
          </div>

          {/* Body */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 28px 8px",
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: 14,
              lineHeight: 1.6,
              color: COLORS.gray[700],
            }}
          >
            {loading ? (
              <p style={{ color: COLORS.gray[400], textAlign: "center", padding: "24px 0" }}>
                Loading release notes…
              </p>
            ) : release ? (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, color: COLORS.gray[900], margin: "20px 0 10px", fontWeight: 600 }}>{children}</h3>
                  ),
                  h2: ({ children }) => (
                    <h4 style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 16, color: COLORS.gray[900], margin: "18px 0 8px", fontWeight: 600 }}>{children}</h4>
                  ),
                  h3: ({ children }) => (
                    <h5 style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 14, color: COLORS.gray[900], margin: "14px 0 6px", fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase" }}>{children}</h5>
                  ),
                  ul: ({ children }) => <ul style={{ margin: "8px 0 12px", paddingLeft: 22 }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: "8px 0 12px", paddingLeft: 22 }}>{children}</ol>,
                  li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                  p: ({ children }) => <p style={{ margin: "0 0 12px" }}>{children}</p>,
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: VIOLET[600], textDecoration: "underline" }}
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => <strong style={{ color: COLORS.gray[900] }}>{children}</strong>,
                  code: ({ children }) => (
                    <code
                      style={{
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        background: COLORS.gray[100],
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontSize: "0.92em",
                      }}
                    >
                      {children}
                    </code>
                  ),
                }}
              >
                {release.body_markdown}
              </ReactMarkdown>
            ) : (
              <p style={{ color: COLORS.gray[400], textAlign: "center", padding: "24px 0" }}>
                Couldn't load these notes. Try opening the archive instead.
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "14px 28px",
              borderTop: `1px solid ${COLORS.gray[100]}`,
              backgroundColor: "#fff",
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
                color: COLORS.gray[600],
                fontSize: 13,
                textDecoration: "none",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
            >
              Open archive <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => onClose()}
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
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
