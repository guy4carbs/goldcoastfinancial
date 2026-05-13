import { Sparkles, Download } from "lucide-react";
import { useLifeOS } from "./LifeOSUpdateProvider";

/**
 * LifeOSVersionBadge — small pill in the topbar that shows the user's
 * current lifeOS bundle version.
 *
 * Behaviour:
 *   - No update available → click opens the WhatsNewModal for the user's
 *     current version (read-only "what's in this release").
 *   - Update available → click directly calls `applyUpdate()` which wipes
 *     the SW cache and reloads the page onto the fresh bundle. The label
 *     swaps to "Update" with a small download glyph so the affordance is
 *     unambiguous. This is the recovery path when a user has dismissed the
 *     auto-popup and the SW is still pinning a stale bundle — no DevTools
 *     spelunking required.
 */
export function LifeOSVersionBadge() {
  const { yourVersion, updateAvailable, openWhatsNew, applyUpdate } = useLifeOS();

  const handleClick = () => {
    if (updateAvailable) {
      void applyUpdate();
    } else {
      openWhatsNew();
    }
  };

  const tooltip = updateAvailable
    ? `Click to update from lifeOS ${yourVersion}`
    : `lifeOS ${yourVersion} (latest)`;

  return (
    <button
      type="button"
      onClick={handleClick}
      title={tooltip}
      data-testid="lifeos-version-badge"
      className="flex items-center gap-1.5"
      style={{
        padding: "4px 10px",
        fontFamily: "var(--gc-font-mono, ui-monospace, monospace)",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.02em",
        color: updateAvailable ? "var(--gc-gold)" : "var(--gc-text-secondary)",
        backgroundColor: updateAvailable
          ? "color-mix(in srgb, var(--gc-gold) 10%, var(--gc-surface-2))"
          : "var(--gc-surface-2)",
        border: `1px solid ${updateAvailable ? "var(--gc-gold)" : "var(--gc-border-subtle, var(--gc-border))"}`,
        borderRadius: 999,
        cursor: "pointer",
        transition: "all var(--gc-transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--gc-gold)";
        e.currentTarget.style.color = "var(--gc-text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = updateAvailable
          ? "var(--gc-gold)"
          : "var(--gc-border-subtle, var(--gc-border))";
        e.currentTarget.style.color = updateAvailable
          ? "var(--gc-gold)"
          : "var(--gc-text-secondary)";
      }}
    >
      {updateAvailable ? (
        <Download className="w-3 h-3" style={{ color: "var(--gc-gold)" }} />
      ) : (
        <Sparkles className="w-3 h-3" style={{ color: "var(--gc-gold)" }} />
      )}
      <span>{updateAvailable ? `Update · ${yourVersion}` : `lifeOS ${yourVersion}`}</span>
      {updateAvailable && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "var(--gc-status-warning, #E07060)",
            marginLeft: 2,
            boxShadow: "0 0 0 2px var(--gc-surface-2)",
          }}
        />
      )}
    </button>
  );
}
