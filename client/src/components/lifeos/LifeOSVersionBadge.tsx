import { Sparkles } from "lucide-react";
import { useLifeOS } from "./LifeOSUpdateProvider";

/**
 * LifeOSVersionBadge — small pill in the topbar that shows the user's
 * current lifeOS bundle version. Click → opens the WhatsNewModal for that
 * version. When an update is available, an amber dot is appended.
 *
 * This badge is the user-facing PROOF that an update actually delivered a
 * new bundle: after clicking Update Now the page reloads and the badge
 * transitions from e.g. `1.0.0` → `1.0.1`. Without this indicator, a CDN
 * caching glitch could leave the user on the old bundle and the only signal
 * (the post-update toast) is easy to miss.
 */
export function LifeOSVersionBadge() {
  const { yourVersion, updateAvailable, openWhatsNew } = useLifeOS();

  return (
    <button
      type="button"
      onClick={openWhatsNew}
      title={updateAvailable ? `Update available — current: lifeOS ${yourVersion}` : `lifeOS ${yourVersion} (latest)`}
      data-testid="lifeos-version-badge"
      className="flex items-center gap-1.5"
      style={{
        padding: "4px 10px",
        fontFamily: "var(--gc-font-mono, ui-monospace, monospace)",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.02em",
        color: "var(--gc-text-secondary)",
        backgroundColor: "var(--gc-surface-2)",
        border: "1px solid var(--gc-border-subtle, var(--gc-border))",
        borderRadius: 999,
        cursor: "pointer",
        transition: "all var(--gc-transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--gc-gold)";
        e.currentTarget.style.color = "var(--gc-text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--gc-border-subtle, var(--gc-border))";
        e.currentTarget.style.color = "var(--gc-text-secondary)";
      }}
    >
      <Sparkles className="w-3 h-3" style={{ color: "var(--gc-gold)" }} />
      <span>lifeOS {yourVersion}</span>
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
