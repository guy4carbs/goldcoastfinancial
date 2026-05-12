import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { SimpleMarkdown } from "./SimpleMarkdown";
import { GCModal } from "@/components/gc/GCModal";
import { GCPrimaryButton, GCSecondaryButton } from "@/components/gc/GCButton";

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
 * WhatsNewModal — "What's New" notes modal that auto-fires post-update
 * (or opens via the user-menu link). Renders the release's full markdown
 * body via SimpleMarkdown inside the canonical GCModal wrapper so it
 * matches every other Founders Lounge dialog.
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
    return () => {
      cancelled = true;
    };
  }, [versionString]);

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

  // Portal + self-theme so CSS variables resolve (LifeOSUpdateProvider sits
  // above GCShell so we're outside any [data-theme] scope by default).
  if (typeof document === "undefined") return null;
  return createPortal(
    <div data-theme="gc-dark" style={{ position: "relative", zIndex: 9999 }}>
      <GCModal
        title={release?.title ?? "Release notes"}
        subtitle={release?.summary ?? null}
        icon={icon}
        onClose={() => void onClose()}
        width={580}
        titleId="lifeos-whats-new-title"
        footer={
        <div className="flex items-center justify-between gap-3">
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
          <div className="flex items-center gap-2">
            <GCSecondaryButton onClick={() => void onClose()}>Close</GCSecondaryButton>
            <GCPrimaryButton onClick={() => void onClose()}>Got it</GCPrimaryButton>
          </div>
        </div>
      }
    >
      {/* Accent row — what's new + version chip */}
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
          What's new
        </span>
        <span style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-xs)" }}>·</span>
        <span
          style={{
            fontFamily: "var(--gc-font-mono, monospace)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
          }}
        >
          lifeOS {versionString}
        </span>
      </div>

      {loading ? (
        <p
          style={{
            color: "var(--gc-text-muted)",
            fontSize: 14,
            textAlign: "center",
            padding: "24px 0",
          }}
        >
          Loading release notes…
        </p>
      ) : release ? (
        <SimpleMarkdown source={release.body_markdown} />
      ) : (
        <p
          style={{
            color: "var(--gc-text-muted)",
            fontSize: 14,
            padding: "24px 0",
            textAlign: "center",
          }}
        >
          Couldn't load these notes. Try opening the archive instead.
        </p>
      )}
      </GCModal>
    </div>,
    document.body,
  );
}
