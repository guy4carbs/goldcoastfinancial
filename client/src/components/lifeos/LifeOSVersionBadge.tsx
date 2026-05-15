import { Sparkles, Download } from "lucide-react";
import { useLifeOS } from "./LifeOSUpdateProvider";
import { COLORS, RADIUS } from "@/lib/heritageDesignSystem";

const VIOLET = COLORS.primary.violet;
const AMBER = COLORS.accent.amber;

/**
 * LifeOSVersionBadge — small pill in the topbar that shows the user's
 * current lifeOS bundle version. Mirrors the Gold Coast badge exactly,
 * just rendered with Heritage's violet/amber palette.
 *
 * Behaviour:
 *   - No update available → click opens the WhatsNewModal for the user's
 *     current version (read-only "what's in this release").
 *   - Update available → click opens the UpdateAvailableModal so the user
 *     gets a confirm step before the SW cache wipes + page reloads. The
 *     label swaps to "Update" with a small download glyph so the
 *     affordance is unambiguous. After the update completes the
 *     WhatsNewModal auto-fires post-reload (see LifeOSUpdateProvider).
 */
export function LifeOSVersionBadge() {
  const { yourVersion, updateAvailable, openWhatsNew, openUpdate } = useLifeOS();

  const handleClick = () => {
    if (updateAvailable) {
      openUpdate();
    } else {
      openWhatsNew();
    }
  };

  const tooltip = updateAvailable
    ? `Click to update from lifeOS ${yourVersion}`
    : `lifeOS ${yourVersion} (latest)`;

  const accent = updateAvailable ? AMBER[500] : VIOLET[600];

  return (
    <button
      type="button"
      onClick={handleClick}
      title={tooltip}
      data-testid="lifeos-version-badge"
      className="flex items-center gap-1.5 transition-all"
      style={{
        padding: "4px 10px",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.02em",
        color: updateAvailable ? AMBER[700] : COLORS.gray[600],
        backgroundColor: updateAvailable ? AMBER[50] : "rgba(0, 0, 0, 0.04)",
        border: `1px solid ${updateAvailable ? AMBER[300] : COLORS.gray[200]}`,
        borderRadius: RADIUS.pill,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.color = updateAvailable ? AMBER[800] : COLORS.gray[900];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = updateAvailable ? AMBER[300] : COLORS.gray[200];
        e.currentTarget.style.color = updateAvailable ? AMBER[700] : COLORS.gray[600];
      }}
    >
      {updateAvailable ? (
        <Download className="w-3 h-3" style={{ color: accent }} />
      ) : (
        <Sparkles className="w-3 h-3" style={{ color: accent }} />
      )}
      <span>{updateAvailable ? `Update · ${yourVersion}` : `lifeOS ${yourVersion}`}</span>
      {updateAvailable && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: AMBER[500],
            marginLeft: 2,
            boxShadow: `0 0 0 2px ${AMBER[50]}`,
          }}
        />
      )}
    </button>
  );
}
