import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Compass } from "lucide-react";
import { useTour } from "@/lib/tour/TourProvider";
import { getTourForRoute } from "@/lib/tour/registry";
import { TOUR, tourAttr } from "@/lib/tour/selectors";
import type { TourRole } from "@/lib/tour/types";

export function TourButton() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { startTour, activeTourId } = useTour();

  if (!user) return null;
  if (activeTourId) return null;

  // Only show inside the Agent Lounge and the CRM
  const inAgents = location.startsWith("/agents");
  const inCrm = location.startsWith("/crm");
  if (!inAgents && !inCrm) return null;

  const role: TourRole = inAgents ? "agent" : "crm";

  // Entry-page fallback per role so the FAB always points at a real tour.
  const fallbackPath = role === "agent" ? "/agents/dashboard" : "/crm/dashboard";
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
        background: "#f59e0b",
        color: "#1f2937",
        border: "1px solid #d97706",
        borderRadius: "999px",
        fontFamily: "Montserrat, system-ui, sans-serif",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 10px 28px rgba(124, 58, 237, 0.28), 0 0 0 1px rgba(0,0,0,0.04)",
        transition: "transform 150ms ease, box-shadow 150ms ease, filter 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.filter = "brightness(1.05)";
        e.currentTarget.style.boxShadow = "0 14px 34px rgba(124, 58, 237, 0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.filter = "brightness(1)";
        e.currentTarget.style.boxShadow = "0 10px 28px rgba(124, 58, 237, 0.28), 0 0 0 1px rgba(0,0,0,0.04)";
      }}
    >
      <Compass className="w-4 h-4" />
      <span>Take the tour</span>
    </button>
  );
}
