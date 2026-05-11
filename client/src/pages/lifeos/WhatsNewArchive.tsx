import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";

interface ReleaseRow {
  id: string;
  version: string;
  release_type: "major" | "minor" | "patch";
  title: string;
  summary: string;
  highlight_label: string | null;
  published_at: string | null;
}

interface FullRelease extends ReleaseRow {
  body_markdown: string;
}

/**
 * /lifeos/whats-new — public-facing release archive.
 *
 * Rendered inside InstitutionalLayout so it inherits the site header,
 * footer, and announcement banner. Designed to feel like a sibling of the
 * News and Insights pages: light surfaces, serif headlines, the gold
 * accent line, container max-width and section padding rhythm pulled
 * straight from the home / about page patterns.
 */
export default function WhatsNewArchive() {
  const [rows, setRows] = useState<ReleaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openVersion, setOpenVersion] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // No `credentials` — release notes are public marketing content.
        const r = await fetch("/api/lifeos/releases?limit=50");
        if (r.ok) {
          const data = await r.json();
          setRows(Array.isArray(data.releases) ? data.releases : []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <InstitutionalLayout>
      {/* Hero — matches InstitutionalAbout / Insights hero pattern */}
      <section className="hero-gradient py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-3xl"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-4">
              lifeOS · What's new
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-6 leading-tight">
              Every release, every update.
            </h1>
            <p className="text-base md:text-lg text-white/75 max-w-2xl leading-relaxed">
              A running record of what's shipped across the lifeOS platform. The latest version is always live for everyone who's signed in.
            </p>
            <div className="accent-line-animated mt-10" />
          </motion.div>
        </div>
      </section>

      {/* Releases section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Left column — heading + intro */}
            <div className="lg:col-span-1">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Release Archive
              </h2>
              <h3 className="text-2xl md:text-3xl font-serif text-primary mb-4 leading-tight">
                Sharper, safer, and faster — every cycle.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Newest first. Click any release to read the full breakdown of what changed for agents, founders, and operations.
              </p>
            </div>

            {/* Right column — release cards */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="space-y-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border/40 bg-muted/30 animate-pulse"
                      style={{ height: 140 }}
                    />
                  ))}
                </div>
              ) : rows.length === 0 ? (
                <div className="rounded-lg border border-border/60 bg-muted/30 p-12 text-center">
                  <div
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      background: "linear-gradient(135deg, hsl(42, 60%, 55%), hsl(42, 60%, 65%))",
                    }}
                  >
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-serif text-primary mb-2">No releases yet</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    The first lifeOS release will appear here the moment it's published. Check back soon.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rows.map((r, idx) => (
                    <motion.button
                      key={r.id}
                      type="button"
                      onClick={() => setOpenVersion(r.version)}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.04 }}
                      className="group w-full text-left rounded-lg border border-border/40 bg-white p-6 md:p-7 transition-all duration-200 hover:border-secondary/60 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: "hsl(42, 60%, 95%)",
                            color: "hsl(42, 60%, 25%)",
                            border: "1px solid hsl(42, 60%, 80%)",
                          }}
                        >
                          <Sparkles className="h-3 w-3" />
                          lifeOS {r.version}
                        </span>
                        <span className="text-xs uppercase tracking-[0.15em] font-medium text-secondary">
                          {r.highlight_label ||
                            (r.release_type === "major"
                              ? "Major release"
                              : r.release_type === "minor"
                                ? "New features"
                                : "Improvements")}
                        </span>
                        {r.published_at && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {new Date(r.published_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl md:text-2xl font-serif text-primary mb-2 leading-tight group-hover:text-secondary transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{r.summary}</p>
                      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                        Read full notes <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {openVersion && (
        <PublicReleaseModal versionString={openVersion} onClose={() => setOpenVersion(null)} />
      )}
    </InstitutionalLayout>
  );
}

/**
 * Light-themed release-notes modal that matches the institutional site.
 * The Gold Coast WhatsNewModal exists but uses dark Founders-Lounge
 * tokens, so we render a parallel light variant for the public archive.
 */
function PublicReleaseModal({
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="public-whats-new-title"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(20, 8, 14, 0.62)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
        style={{ width: 640, maxWidth: "94vw", maxHeight: "88vh" }}
      >
        {/* Hero strip */}
        <div
          className="relative px-7 py-6"
          style={{
            background:
              "linear-gradient(135deg, hsl(348,65%,18%), hsl(348,65%,28%) 60%, hsl(42, 60%, 35%))",
            color: "white",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 border border-white/25">
              <Sparkles className="h-4 w-4" />
            </div>
            <span
              className="font-mono text-xs px-2.5 py-1 rounded-full bg-white/15 border border-white/25"
            >
              lifeOS {versionString}
            </span>
          </div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-secondary mb-1">
            What's new
          </div>
          <h2 id="public-whats-new-title" className="text-2xl md:text-3xl font-serif leading-tight">
            {release?.title ?? "Release notes"}
          </h2>
          {release?.summary && (
            <p className="mt-3 text-white/85 leading-relaxed text-sm md:text-base">
              {release.summary}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 prose-public">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading release notes…</p>
          ) : release ? (
            <SimpleMarkdownLight source={release.body_markdown} />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Couldn't load these notes. Try again in a moment.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-border/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-md font-medium text-white shadow"
            style={{
              background: "linear-gradient(135deg, hsl(42, 60%, 35%), hsl(42, 60%, 50%))",
            }}
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Light-themed markdown renderer for the public release-notes modal.
 * Mirrors SimpleMarkdown but uses institutional colors (no gc-* tokens).
 * Subset: ## headings, **bold**, *italic*, `code`, [link](url), -/* bullets,
 * 1. ordered. No raw HTML.
 */
function SimpleMarkdownLight({ source }: { source: string }) {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  // http(s) or root-relative single-slash only. Blocks `//evil.com` and
  // `javascript:` outright.
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
