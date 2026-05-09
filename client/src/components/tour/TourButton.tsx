import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Compass, X } from "lucide-react";
import { useTour } from "@/lib/tour/TourProvider";
import { getTourForRoute } from "@/lib/tour/registry";
import { TOUR, tourAttr } from "@/lib/tour/selectors";
import type { TourRole } from "@/lib/tour/types";

const ADMIN_ROLES = new Set(["owner", "system_admin", "director", "agency_manager"]);

// Per-lounge dismissal key. Once dismissed for a lounge, the FAB stays
// hidden for the rest of the session within that lounge segment. Changing
// to a different lounge segment, opening a new tab, or logging in as a
// different user all reset the dismissal.
const dismissKey = (role: TourRole | "") => `gc.tour.dismissed.${role}`;

function resolveRole(location: string, userRole: string | undefined): TourRole | null {
  if (location.startsWith("/founders")) return "founder";
  if (location.startsWith("/finance")) return "finance";
  if (location.startsWith("/hcms")) {
    return ADMIN_ROLES.has(userRole || "") && !location.startsWith("/hcms/my/")
      ? "admin"
      : "agent";
  }
  return null;
}

export function TourButton() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { startTour, activeTourId } = useTour();
  const [dismissed, setDismissed] = useState(false);
  const lastUserIdRef = useRef<string | null>(null);

  // Compute the role for the current route + user. Hooks below depend on
  // role, so it must be derived before any conditional return.
  const role = resolveRole(location, user?.role);

  // Clear all per-lounge dismissals when the logged-in user changes (login,
  // logout-then-login, or impersonation). First-login should always show.
  useEffect(() => {
    const currentId = user?.id ?? null;
    if (lastUserIdRef.current !== null && currentId !== lastUserIdRef.current) {
      try {
        Object.keys(sessionStorage)
          .filter((k) => k.startsWith("gc.tour.dismissed."))
          .forEach((k) => sessionStorage.removeItem(k));
      } catch {
        /* sessionStorage may be blocked */
      }
    }
    lastUserIdRef.current = currentId;
  }, [user?.id]);

  // Re-read the dismissal flag when role (lounge) changes so the FAB
  // reappears in a new lounge even if the prior one was dismissed.
  useEffect(() => {
    if (!role) {
      setDismissed(false);
      return;
    }
    try {
      setDismissed(sessionStorage.getItem(dismissKey(role)) === "1");
    } catch {
      setDismissed(false);
    }
  }, [role]);

  // ─── Conditional renders (after all hooks) ───
  if (!user) return null;
  if (activeTourId) return null;
  if (!role) return null;
  if (dismissed) return null;

  // Entry-page fallback per role so the FAB always points at a real tour.
  const fallbackPath =
    role === "agent"
      ? "/hcms/my/dashboard"
      : role === "admin"
      ? "/hcms/agents"
      : role === "finance"
      ? "/finance"
      : "/founders";
  const config = getTourForRoute(location, role) || getTourForRoute(fallbackPath, role);

  if (!config) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      sessionStorage.setItem(dismissKey(role), "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: 9999,
        display: "inline-flex",
        alignItems: "center",
        background: "var(--gc-btn-primary-bg, #C4975A)",
        color: "var(--gc-btn-primary-text, #2D0A12)",
        border: "1px solid var(--gc-btn-primary-bg, #C4975A)",
        borderRadius: "999px",
        boxShadow: "0 10px 28px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => startTour(config.id)}
        {...tourAttr(TOUR.SHELL.TOUR_BUTTON)}
        title={`Take the ${config.label} walkthrough`}
        aria-label={`Take the ${config.label} walkthrough`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          background: "transparent",
          color: "inherit",
          border: "none",
          fontFamily: "var(--gc-font-body, Montserrat, system-ui, sans-serif)",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "filter 150ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "brightness(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "brightness(1)";
        }}
      >
        <Compass className="w-4 h-4" aria-hidden="true" />
        <span>Take the tour</span>
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        title="Dismiss tour prompt for this lounge"
        aria-label="Dismiss tour prompt"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          background: "transparent",
          color: "inherit",
          border: "none",
          borderLeft: "1px solid rgba(45, 10, 18, 0.18)",
          cursor: "pointer",
          opacity: 0.75,
          transition: "opacity 150ms ease, background 150ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.background = "rgba(45, 10, 18, 0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.75";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
