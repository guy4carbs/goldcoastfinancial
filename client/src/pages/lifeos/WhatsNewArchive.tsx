import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { WhatsNewModal } from "@/components/lifeos/WhatsNewModal";

interface ReleaseRow {
  id: string;
  version: string;
  release_type: "major" | "minor" | "patch";
  title: string;
  summary: string;
  highlight_label: string | null;
  published_at: string | null;
}

/**
 * /lifeos/whats-new — chronological archive of every published lifeOS release.
 * Click a card to open the same WhatsNewModal that fires post-update.
 */
export default function WhatsNewArchive() {
  const [rows, setRows] = useState<ReleaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openVersion, setOpenVersion] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/lifeos/releases?limit=50", { credentials: "include" });
        if (r.ok) {
          const data = await r.json();
          setRows(data.releases ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--gc-bg, #0a0a0a)",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--gc-radius-full, 999px)",
              background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: "var(--gc-ink)" }} />
          </div>
          <div>
            <div
              style={{
                fontSize: "var(--gc-text-xs)",
                letterSpacing: "var(--gc-tracking-wider)",
                textTransform: "uppercase",
                color: "var(--gc-gold)",
                fontWeight: 600,
              }}
            >
              lifeOS
            </div>
            <h1
              style={{
                fontFamily: "var(--gc-font-display)",
                fontSize: 32,
                color: "var(--gc-text-primary)",
                margin: 0,
              }}
            >
              What's new
            </h1>
          </div>
        </div>
        <p
          style={{
            color: "var(--gc-text-secondary)",
            fontSize: "var(--gc-text-md)",
            lineHeight: 1.5,
            margin: "0 0 32px",
            maxWidth: 560,
          }}
        >
          Every lifeOS release, with notes on what changed. Click a release to read the full
          breakdown.
        </p>

        {loading ? (
          <p style={{ color: "var(--gc-text-muted)", fontSize: 14 }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "var(--gc-text-muted)", fontSize: 14 }}>
            No releases yet. The first one will appear here when published.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setOpenVersion(r.version)}
                style={{
                  textAlign: "left",
                  padding: "18px 20px",
                  backgroundColor: "var(--gc-surface)",
                  border: "1px solid var(--gc-border)",
                  borderRadius: "var(--gc-radius-md)",
                  cursor: "pointer",
                  transition: "transform 150ms ease, border-color 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--gc-gold)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--gc-border)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                  <span
                    style={{
                      fontFamily: "var(--gc-font-mono, monospace)",
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: "var(--gc-radius-full, 999px)",
                      backgroundColor: "var(--gc-surface-2)",
                      color: "var(--gc-text-muted)",
                      border: "1px solid var(--gc-border-subtle)",
                    }}
                  >
                    lifeOS {r.version}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--gc-gold)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    {r.highlight_label ||
                      (r.release_type === "major" ? "Major release"
                        : r.release_type === "minor" ? "New features"
                        : "Improvements")}
                  </span>
                  {r.published_at && (
                    <span style={{ marginLeft: "auto", color: "var(--gc-text-muted)", fontSize: 12 }}>
                      {new Date(r.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "var(--gc-font-display)",
                    fontSize: 18,
                    color: "var(--gc-text-primary)",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  {r.title}
                </div>
                <div
                  style={{
                    color: "var(--gc-text-secondary)",
                    fontSize: "var(--gc-text-sm, 13px)",
                    lineHeight: 1.5,
                  }}
                >
                  {r.summary}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {openVersion && (
        <WhatsNewModal versionString={openVersion} onClose={() => setOpenVersion(null)} />
      )}
    </div>
  );
}
