import { useLifeOS } from "./LifeOSUpdateProvider";

/**
 * UpdateBadge — small persistent dot that sits on the user-menu / notification
 * chrome. Stays visible whenever an update is available, even after the popup
 * is dismissed. Mirrors iOS's red badge on the Settings app icon — quietly
 * insistent without ever blocking work.
 *
 * Usage: drop next to the user-avatar trigger or the NotificationBell:
 *   <UpdateBadge />
 *
 * Variants:
 *   - "dot" (default) — 8px gold pill, anchored top-right, absolute-positioned
 *     when the parent has position: relative
 *   - "inline" — small "Update available" pill rendered inline (e.g., in a
 *     dropdown row)
 */
export function UpdateBadge({
  variant = "dot",
  className,
  onClick,
}: {
  variant?: "dot" | "inline";
  className?: string;
  onClick?: () => void;
}) {
  const { updateAvailable, latestRelease } = useLifeOS();
  if (!updateAvailable || !latestRelease) return null;

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "2px 10px",
          borderRadius: "var(--gc-radius-full, 999px)",
          background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
          color: "var(--gc-ink, #0a0a0a)",
          border: "none",
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-xs)",
          fontWeight: 600,
          letterSpacing: "0.02em",
          cursor: onClick ? "pointer" : "default",
        }}
        title={`lifeOS ${latestRelease.version} is ready`}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "var(--gc-ink, #0a0a0a)",
            opacity: 0.6,
          }}
        />
        Update available
      </button>
    );
  }

  return (
    <span
      role="status"
      aria-label={`lifeOS ${latestRelease.version} is ready`}
      className={className}
      style={{
        position: "absolute",
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
        boxShadow: "0 0 0 2px var(--gc-surface, #fff), 0 0 6px color-mix(in srgb, var(--gc-gold) 60%, transparent)",
        animation: "lifeos-badge-pulse 2.4s ease-in-out infinite",
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes lifeos-badge-pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.18); }
        }
      `}</style>
    </span>
  );
}
