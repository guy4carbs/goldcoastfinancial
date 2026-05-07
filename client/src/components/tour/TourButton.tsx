import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Compass } from "lucide-react";
import { useTour } from "@/lib/tour/TourProvider";
import { getTourForRoute } from "@/lib/tour/registry";
import { TOUR, tourAttr } from "@/lib/tour/selectors";
import type { TourRole } from "@/lib/tour/types";

const ADMIN_ROLES = new Set(["owner", "system_admin", "director", "agency_manager"]);

export function TourButton() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { startTour, activeTourId } = useTour();

  if (!user) return null;
  if (activeTourId) return null;

  // Only show inside HCMS, Finance, and Founders lounges
  const inHcms = location.startsWith("/hcms");
  const inFinance = location.startsWith("/finance");
  const inFounders = location.startsWith("/founders");
  if (!inHcms && !inFinance && !inFounders) return null;

  let role: TourRole;
  if (inFounders) {
    role = "founder";
  } else if (inFinance) {
    role = "finance";
  } else {
    role = ADMIN_ROLES.has(user.role) && !location.startsWith("/hcms/my/") ? "admin" : "agent";
  }

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

  return (
    <button
      type="button"
      onClick={() => startTour(config.id)}
      {...tourAttr(TOUR.SHELL.TOUR_BUTTON)}
      title={`Take the ${config.label} walkthrough`}
      aria-label={`Take the ${config.label} walkthrough`}
      style={{
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: 9999,
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        background: "var(--gc-btn-primary-bg, #C4975A)",
        color: "var(--gc-btn-primary-text, #2D0A12)",
        border: "1px solid var(--gc-btn-primary-bg, #C4975A)",
        borderRadius: "999px",
        fontFamily: "var(--gc-font-body, Montserrat, system-ui, sans-serif)",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 10px 28px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)",
        transition: "transform 150ms ease, box-shadow 150ms ease, filter 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.filter = "brightness(1.05)";
        e.currentTarget.style.boxShadow = "0 14px 34px rgba(0,0,0,0.28)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.filter = "brightness(1)";
        e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)";
      }}
    >
      <Compass className="w-4 h-4" />
      <span>Take the tour</span>
    </button>
  );
}
