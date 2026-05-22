import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Compass, X } from "lucide-react";
import { useTour } from "@/lib/tour/TourProvider";
import { getTourForRoute } from "@/lib/tour/registry";
import { TOUR, tourAttr } from "@/lib/tour/selectors";
import type { TourRole } from "@/lib/tour/types";

export function TourButton() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { startTour, activeTourId } = useTour();
  const [dismissed, setDismissed] = useState(false);

  if (!user) return null;
  if (activeTourId) return null;
  if (dismissed) return null;

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
    <div
      role="button"
      tabIndex={0}
      onClick={() => startTour(config.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startTour(config.id);
        }
      }}
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
        userSelect: "none",
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
      <span
        aria-hidden="true"
        style={{
          width: 1,
          height: 16,
          background: "rgba(31, 41, 55, 0.25)",
          marginLeft: 2,
        }}
      />
      <button
        type="button"
        aria-label="Dismiss tour button"
        onClick={(e) => {
          e.stopPropagation();
          setDismissed(true);
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
          margin: 0,
          background: "transparent",
          color: "#1f2937",
          border: "none",
          borderRadius: 999,
          cursor: "pointer",
          opacity: 0.7,
          transition: "opacity 120ms ease",
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          e.currentTarget.style.opacity = "0.7";
        }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
