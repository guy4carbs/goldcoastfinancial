import { COLORS } from "@/lib/heritageDesignSystem";
import { useLifeOS } from "./LifeOSUpdateProvider";

const VIOLET = COLORS.primary.violet;
const AMBER = COLORS.accent.amber;

/**
 * Heritage's UpdateBadge — small persistent dot. Drops in next to the
 * NotificationBell or user-menu trigger. Stays visible until the user
 * either reloads (apply update) or marks notes_viewed.
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
          padding: "3px 10px",
          borderRadius: 999,
          background: COLORS.gradients.heroWithAccent,
          color: "#fff",
          border: "none",
          fontFamily: "'Inter', -apple-system, sans-serif",
          fontSize: 11,
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
            backgroundColor: "#fff",
            opacity: 0.85,
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
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${VIOLET[500]}, ${AMBER[400]})`,
        boxShadow: `0 0 0 2px #fff, 0 0 6px ${VIOLET[400]}aa`,
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
