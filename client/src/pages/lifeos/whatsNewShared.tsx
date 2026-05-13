import { useEffect, useState } from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { GCInstitutionalModal } from "@/components/gc/GCInstitutionalModal";

/**
 * Shared types + helpers for the public /lifeos/whats-new surfaces.
 *
 * Two pages consume this module:
 *   - WhatsNewArchive (the featured-latest landing at /lifeos/whats-new)
 *   - WhatsNewAll (the full sectioned archive at /lifeos/whats-new/all)
 *
 * Keeping the modal + markdown renderer here avoids duplication and
 * keeps the visual treatment consistent between the two views.
 */
export interface ReleaseRow {
  id: string;
  version: string;
  release_type: "major" | "minor" | "patch";
  title: string;
  summary: string;
  highlight_label: string | null;
  published_at: string | null;
}

export interface FullRelease extends ReleaseRow {
  body_markdown: string;
}

export function releaseTypeLabel(r: ReleaseRow): string {
  return (
    r.highlight_label ||
    (r.release_type === "major"
      ? "Major release"
      : r.release_type === "minor"
        ? "New features"
        : "Improvements")
  );
}

export function formatPublishedDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Light-themed release-notes modal for the public archive. Uses
 * GCInstitutionalModal so it matches the rest of the institutional shell
 * (cream surface, burgundy text, gold border, 8px radius).
 */
export function PublicReleaseModal({
  versionString,
  onClose,
}: {
  versionString: string;
  onClose: () => void;
}) {
  const [release, setRelease] = useState<FullRelease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/lifeos/releases/${encodeURIComponent(versionString)}`);
        if (r.ok) {
          const data = await r.json();
          if (!cancelled) setRelease(data);
        }
      } finally {
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
        background: "linear-gradient(135deg, hsl(348, 65%, 22%), hsl(348, 65%, 28%))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 1px 3px rgba(20, 8, 14, 0.15)",
      }}
    >
      <Sparkles className="h-4 w-4 text-white" />
    </div>
  );

  return (
    <GCInstitutionalModal
      title={release?.title ?? "Release notes"}
      subtitle={release?.summary ?? null}
      icon={icon}
      onClose={onClose}
      width={560}
      titleId="public-whats-new-title"
      footer={
        <div className="flex items-center justify-between gap-3">
          <a
            href="/lifeos/whats-new/all"
            className="inline-flex items-center gap-1 text-sm"
            style={{
              color: "hsl(348, 25%, 35%)",
              textDecoration: "none",
              fontFamily: "'Inter', -apple-system, sans-serif",
            }}
          >
            Open full archive <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="font-medium text-white"
            style={{
              padding: "8px 22px",
              borderRadius: "var(--gc-radius-sm, 6px)",
              backgroundColor: "hsl(348, 65%, 22%)",
              border: "none",
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Got it
          </button>
        </div>
      }
    >
      <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "hsl(42, 60%, 35%)" }}
        >
          What's new
        </span>
        <span style={{ color: "hsl(348, 15%, 60%)", fontSize: 12 }}>·</span>
        <span
          className="font-mono"
          style={{
            fontSize: 12,
            color: "hsl(348, 25%, 35%)",
          }}
        >
          lifeOS {versionString}
        </span>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading release notes…</p>
      ) : release ? (
        <SimpleMarkdownLight source={release.body_markdown} />
      ) : (
        <p className="text-muted-foreground text-center py-8">
          Couldn't load these notes. Try again in a moment.
        </p>
      )}
    </GCInstitutionalModal>
  );
}

/**
 * Light-themed markdown renderer for the public release-notes modal.
 * Subset: ## headings, **bold**, *italic*, `code`, [link](url), -/* bullets,
 * 1. ordered. No raw HTML.
 */
export function SimpleMarkdownLight({ source }: { source: string }) {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const SAFE_URL = /^(https?:\/\/[^/]|\/[^/])/;
  const inline = (s: string) => {
    let out = escape(s);
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => {
      const safe = SAFE_URL.test(u) ? u : "#";
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer" style="color:hsl(42,60%,40%);text-decoration:underline;">${t}</a>`;
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, "$1<em>$2</em>$3");
    out = out.replace(
      /`([^`]+)`/g,
      `<code style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:hsl(42,30%,95%);padding:1px 6px;border-radius:4px;font-size:0.92em;">$1</code>`,
    );
    return out;
  };

  const lines = source.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      blocks.push(
        <h3
          key={key++}
          className="font-serif mt-6 mb-3 first:mt-0"
          style={{
            fontSize: level === 1 ? 22 : level === 2 ? 19 : 16,
            color: "hsl(348, 65%, 22%)",
            fontWeight: 600,
            lineHeight: 1.3,
          }}
          dangerouslySetInnerHTML={{ __html: inline(h[2]) }}
        />,
      );
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul
          key={key++}
          className="ml-5 list-disc space-y-1 mb-3 text-[15px] leading-relaxed"
          style={{ color: "hsl(348, 20%, 30%)" }}
        >
          {items.map((it, k) => (
            <li key={k} dangerouslySetInnerHTML={{ __html: inline(it) }} />
          ))}
        </ul>,
      );
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol
          key={key++}
          className="ml-5 list-decimal space-y-1 mb-3 text-[15px] leading-relaxed"
          style={{ color: "hsl(348, 20%, 30%)" }}
        >
          {items.map((it, k) => (
            <li key={k} dangerouslySetInnerHTML={{ __html: inline(it) }} />
          ))}
        </ol>,
      );
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,3}\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    if (para.length > 0) {
      blocks.push(
        <p
          key={key++}
          className="mb-3 text-[15px] leading-relaxed"
          style={{ color: "hsl(348, 20%, 30%)" }}
          dangerouslySetInnerHTML={{ __html: inline(para.join(" ")) }}
        />,
      );
    }
  }
  return <>{blocks}</>;
}
