import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, ArrowRight, Clock } from "lucide-react";
import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import {
  type ReleaseRow,
  PublicReleaseModal,
  releaseTypeLabel,
  formatPublishedDate,
} from "./whatsNewShared";

/**
 * /lifeos/whats-new — public-facing landing for the release archive.
 *
 * Shows only the most recent release as a featured card so the page
 * stays focused regardless of how many versions have shipped. Links to
 * /lifeos/whats-new/all for the full sectioned archive.
 */
export default function WhatsNewArchive() {
  const [latest, setLatest] = useState<ReleaseRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [openVersion, setOpenVersion] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // No `credentials` — release notes are public marketing content.
        const r = await fetch("/api/lifeos/releases?limit=1&offset=0");
        if (r.ok) {
          const data = await r.json();
          const list: ReleaseRow[] = Array.isArray(data.releases) ? data.releases : [];
          setLatest(list[0] || null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <InstitutionalLayout>
      {/* Hero */}
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
              The latest from lifeOS.
            </h1>
            <p className="text-base md:text-lg text-white/75 max-w-2xl leading-relaxed">
              One release at a time. We ship deliberately and document everything so you always know what changed.
            </p>
            <div className="accent-line-animated mt-10" />
          </motion.div>
        </div>
      </section>

      {/* Featured latest release */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-1">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Latest release
              </h2>
              <h3 className="text-2xl md:text-3xl font-serif text-primary mb-4 leading-tight">
                What's new right now.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Click the card to read the full notes. Looking for something older? Open the full archive below.
              </p>
            </div>

            <div className="lg:col-span-2">
              {loading ? (
                <div
                  className="rounded-lg border border-border/40 bg-muted/30 animate-pulse"
                  style={{ height: 220 }}
                />
              ) : latest ? (
                <motion.button
                  key={latest.id}
                  type="button"
                  onClick={() => setOpenVersion(latest.version)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="group w-full text-left rounded-lg border-2 bg-white p-8 md:p-10 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                  style={{ borderColor: "hsl(42, 60%, 70%)" }}
                >
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: "hsl(42, 60%, 95%)",
                        color: "hsl(42, 60%, 25%)",
                        border: "1px solid hsl(42, 60%, 80%)",
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      lifeOS {latest.version}
                    </span>
                    <span className="text-xs uppercase tracking-[0.15em] font-medium text-secondary">
                      {releaseTypeLabel(latest)}
                    </span>
                    {latest.published_at && (
                      <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatPublishedDate(latest.published_at)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif text-primary mb-3 leading-tight group-hover:text-secondary transition-colors">
                    {latest.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                    {latest.summary}
                  </p>
                  <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-secondary">
                    Read full notes <ArrowUpRight className="h-4 w-4" />
                  </div>
                </motion.button>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Past updates CTA */}
      {!loading && latest && (
        <section
          className="py-16 md:py-20 border-t"
          style={{ borderColor: "hsl(42, 30%, 88%)", backgroundColor: "hsl(42, 30%, 98%)" }}
        >
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Release archive
                </h2>
                <h3 className="text-2xl md:text-3xl font-serif text-primary mb-2 leading-tight">
                  Looking for an older release?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every version we've shipped, grouped by month with the full notes still one click away.
                </p>
              </div>
              <a
                href="/lifeos/whats-new/all"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition-all hover:shadow-md flex-shrink-0"
                style={{
                  backgroundColor: "hsl(348, 65%, 22%)",
                  color: "white",
                  letterSpacing: "0.04em",
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
              >
                Look at past updates
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      {openVersion && (
        <PublicReleaseModal versionString={openVersion} onClose={() => setOpenVersion(null)} />
      )}
    </InstitutionalLayout>
  );
}
