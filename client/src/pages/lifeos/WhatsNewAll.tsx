import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, Loader2, ArrowLeft } from "lucide-react";
import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import {
  type ReleaseRow,
  PublicReleaseModal,
  releaseTypeLabel,
  formatPublishedDate,
} from "./whatsNewShared";

const PAGE_SIZE = 12;

/**
 * /lifeos/whats-new/all — full release archive.
 *
 * Sections releases by month (using `published_at`). "Load more" pages
 * through the rest of the archive via the existing
 * /api/lifeos/releases?limit&offset endpoint. The featured-latest
 * landing at /lifeos/whats-new links here via a CTA.
 */
export default function WhatsNewAll() {
  const [rows, setRows] = useState<ReleaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [openVersion, setOpenVersion] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/lifeos/releases?limit=${PAGE_SIZE}&offset=0`);
        if (r.ok) {
          const data = await r.json();
          const list: ReleaseRow[] = Array.isArray(data.releases) ? data.releases : [];
          setRows(list);
          setHasMore(list.length === PAGE_SIZE);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const r = await fetch(`/api/lifeos/releases?limit=${PAGE_SIZE}&offset=${rows.length}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const next: ReleaseRow[] = Array.isArray(data.releases) ? data.releases : [];
      setRows((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const row of next) if (!seen.has(row.id)) merged.push(row);
        return merged;
      });
      setHasMore(next.length === PAGE_SIZE);
    } catch (e: any) {
      setError(e?.message || "Couldn't load more");
    } finally {
      setLoadingMore(false);
    }
  };

  // Group rows by Year-Month. Releases without published_at get bucketed
  // into "Unscheduled" at the bottom — rare but defensive.
  const sections = useMemo(() => {
    const map = new Map<string, { label: string; sortKey: string; rows: ReleaseRow[] }>();
    for (const row of rows) {
      let key: string;
      let label: string;
      let sortKey: string;
      if (row.published_at) {
        const d = new Date(row.published_at);
        const year = d.getFullYear();
        const month = d.toLocaleString(undefined, { month: "long" });
        key = `${year}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        label = `${month} ${year}`;
        sortKey = key;
      } else {
        key = "zzz-unscheduled";
        label = "Unscheduled";
        sortKey = "0000-00";
      }
      if (!map.has(key)) map.set(key, { label, sortKey, rows: [] });
      map.get(key)!.rows.push(row);
    }
    return Array.from(map.values()).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  }, [rows]);

  return (
    <InstitutionalLayout>
      {/* Hero */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-3xl"
          >
            <a
              href="/lifeos/whats-new"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] mb-6 transition-opacity hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              <ArrowLeft className="h-3 w-3" />
              Back to latest
            </a>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-4">
              lifeOS · Full archive
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-6 leading-tight">
              Every release, every update.
            </h1>
            <p className="text-base md:text-lg text-white/75 max-w-2xl leading-relaxed">
              A running record of what's shipped across the lifeOS platform, grouped by month. Newest first.
            </p>
            <div className="accent-line-animated mt-10" />
          </motion.div>
        </div>
      </section>

      {/* Sectioned archive */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
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
              <Sparkles className="h-5 w-5 mx-auto mb-3 text-secondary" />
              <h4 className="text-lg font-serif text-primary mb-2">No releases yet</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                The first lifeOS release will appear here the moment it's published.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-12">
                {sections.map((section) => (
                  <div key={section.sortKey}>
                    <div
                      className="flex items-center gap-3 mb-5 pb-3 border-b"
                      style={{ borderColor: "hsl(42, 30%, 88%)" }}
                    >
                      <h2
                        className="text-sm font-medium uppercase tracking-[0.18em]"
                        style={{ color: "hsl(348, 25%, 35%)" }}
                      >
                        {section.label}
                      </h2>
                      <span
                        className="text-xs"
                        style={{ color: "hsl(348, 15%, 55%)" }}
                      >
                        {section.rows.length} {section.rows.length === 1 ? "release" : "releases"}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {section.rows.map((r, idx) => (
                        <motion.button
                          key={r.id}
                          type="button"
                          onClick={() => setOpenVersion(r.version)}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ duration: 0.3, delay: Math.min(idx, 4) * 0.03 }}
                          className="group w-full text-left rounded-lg border border-border/40 bg-white p-5 md:p-6 transition-all duration-200 hover:border-secondary/60 hover:shadow-md hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor: "hsl(42, 60%, 95%)",
                                color: "hsl(42, 60%, 25%)",
                                border: "1px solid hsl(42, 60%, 80%)",
                              }}
                            >
                              <Sparkles className="h-3 w-3" />
                              lifeOS {r.version}
                            </span>
                            <span className="text-xs uppercase tracking-[0.14em] font-medium text-secondary">
                              {releaseTypeLabel(r)}
                            </span>
                            {r.published_at && (
                              <span className="ml-auto text-xs text-muted-foreground">
                                {formatPublishedDate(r.published_at)}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg md:text-xl font-serif text-primary mb-1 leading-snug group-hover:text-secondary transition-colors">
                            {r.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {r.summary}
                          </p>
                          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                            Read full notes <ArrowUpRight className="h-3 w-3" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pager */}
              <div className="mt-14 flex flex-col items-center gap-3">
                {error && <p className="text-sm text-destructive">{error}</p>}
                {hasMore ? (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition-all"
                    style={{
                      borderColor: "hsl(42, 60%, 80%)",
                      color: "hsl(348, 65%, 22%)",
                      backgroundColor: "hsl(42, 60%, 98%)",
                      cursor: loadingMore ? "wait" : "pointer",
                      opacity: loadingMore ? 0.7 : 1,
                      letterSpacing: "0.04em",
                      fontFamily: "'Inter', -apple-system, sans-serif",
                    }}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading…
                      </>
                    ) : (
                      <>
                        Load more releases
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    End of archive · {rows.length} {rows.length === 1 ? "release" : "releases"}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {openVersion && (
        <PublicReleaseModal versionString={openVersion} onClose={() => setOpenVersion(null)} />
      )}
    </InstitutionalLayout>
  );
}
