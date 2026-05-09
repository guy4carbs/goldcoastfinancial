import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { COLORS, RADIUS, SHADOW } from "@/lib/heritageDesignSystem";
import { WhatsNewModal } from "@/components/lifeos/WhatsNewModal";

const VIOLET = COLORS.primary.violet;
const AMBER = COLORS.accent.amber;

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
 * /lifeos/whats-new — chronological archive on Heritage. Same data the
 * Gold Coast archive shows, just rendered with violet/amber gradients.
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
        background: `linear-gradient(160deg, ${VIOLET[50]}40 0%, #ffffff 35%, ${AMBER[50]}30 100%)`,
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: COLORS.gradients.heroWithAccent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 16px ${VIOLET[400]}55`,
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: "#fff" }} />
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: VIOLET[600],
                fontWeight: 600,
              }}
            >
              lifeOS
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 32,
                color: COLORS.gray[900],
                margin: 0,
                fontWeight: 600,
              }}
            >
              What's new
            </h1>
          </div>
        </div>
        <p
          style={{
            color: COLORS.gray[600],
            fontSize: 15,
            lineHeight: 1.55,
            margin: "0 0 32px",
            maxWidth: 560,
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          Every lifeOS release, with notes on what changed. Click a release to read the full breakdown.
        </p>

        {loading ? (
          <p style={{ color: COLORS.gray[400], fontSize: 14 }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p style={{ color: COLORS.gray[400], fontSize: 14 }}>
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
                  backgroundColor: "#fff",
                  border: `1px solid ${COLORS.gray[100]}`,
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  cursor: "pointer",
                  transition: "transform 150ms ease, box-shadow 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = SHADOW.level3;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = SHADOW.card;
                }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                  <span
                    style={{
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: 11,
                      padding: "2px 9px",
                      borderRadius: 999,
                      backgroundColor: VIOLET[50],
                      color: VIOLET[700],
                      border: `1px solid ${VIOLET[100]}`,
                    }}
                  >
                    lifeOS {r.version}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: AMBER[700],
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    {r.highlight_label ||
                      (r.release_type === "major"
                        ? "Major release"
                        : r.release_type === "minor"
                          ? "New features"
                          : "Improvements")}
                  </span>
                  {r.published_at && (
                    <span
                      style={{
                        marginLeft: "auto",
                        color: COLORS.gray[400],
                        fontSize: 12,
                        fontFamily: "'Inter', -apple-system, sans-serif",
                      }}
                    >
                      {new Date(r.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 18,
                    color: COLORS.gray[900],
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  {r.title}
                </div>
                <div
                  style={{
                    color: COLORS.gray[600],
                    fontSize: 13,
                    lineHeight: 1.5,
                    fontFamily: "'Inter', -apple-system, sans-serif",
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
