import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTour } from "./TourProvider";
import { getTourForRoute } from "./registry";
import * as tourPersistence from "./persistence";
import type { TourRole } from "./types";

/**
 * Mounts inside the layout shells (agent lounge, CRM) and:
 *  1. Resumes any in-progress tour pointer (cross-page chain handoff).
 *  2. On a brand-new browser, auto-starts the role's first tour the first time
 *     the user lands on the role's entry page.
 *
 * Auto-start fires at most once per role per browser (tracked in localStorage).
 * Independent flags for "agent" and "crm" so a user who works in both lounges
 * gets one auto-start in each.
 */
export function TourAutoStart({ role }: { role: TourRole }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const { startTour, resumeIfAny, isActive } = useTour();
  const triedAutoStartRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (isActive()) return;

    // 1. Try to resume an in-progress tour (cross-page chain or user left mid-tour)
    if (resumeIfAny()) return;

    // 2. First-login auto-start — only once per browser PER ROLE, only on the
    // role's entry page.
    if (triedAutoStartRef.current) return;
    if (tourPersistence.hasSeenFirstLogin(role)) return;

    // Role-specific entry page matching:
    //  - agent: /agents/dashboard (startsWith — nested agent routes OK)
    //  - crm:   /crm or /crm/dashboard (exact match — sub-routes shouldn't trigger)
    const matchesEntry = (() => {
      if (role === "agent") return location.startsWith("/agents/dashboard");
      if (role === "crm") return location === "/crm" || location === "/crm/dashboard";
      return false;
    })();
    if (!matchesEntry) return;

    const config = getTourForRoute(location, role);
    if (!config) return;
    if (tourPersistence.isComplete(config.id)) {
      tourPersistence.setFirstLoginDismissed(role);
      return;
    }

    triedAutoStartRef.current = true;
    tourPersistence.setFirstLoginDismissed(role);
    // Small delay so the dashboard/list has rendered before driver measures targets
    const handle = window.setTimeout(() => startTour(config.id), 400);
    return () => window.clearTimeout(handle);
  }, [user, location, role, startTour, resumeIfAny, isActive]);

  return null;
}
