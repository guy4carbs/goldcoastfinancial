import { GCShell } from "@/components/gc";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { TourProvider, useTour } from "@/lib/tour/TourProvider";
import { TourButton } from "@/components/tour/TourButton";
import { ResumeTourBanner } from "@/components/tour/ResumeTourBanner";
import { TourCompletionCelebration } from "@/components/tour/TourCompletionCelebration";
import { getTourForRoute } from "@/lib/tour/registry";
import * as tourPersistence from "@/lib/tour/persistence";
import type { TourRole } from "@/lib/tour/types";

// Founders sit above Owner — they pass every role gate by design.
// Director (Phase D) gets admin access too: hierarchy_title "Diamond Director"
// or "Platinum Director" maps to users.role='director' via hierarchyRoleMap.
const ADMIN_ROLES = ["founder", "owner", "system_admin", "director", "agency_manager"];

function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--gc-bg)", color: "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)" }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

// Blocks agents from admin pages — redirects to /hcms (their dashboard)
export function AdminOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect to="/login" />;
  if (!ADMIN_ROLES.includes(user.role)) return <Redirect to="/hcms" />;
  return <>{children}</>;
}

// Blocks non-executives from sensitive lounges — only owner, system_admin
export function ExecutiveOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect to="/login" />;
  if (!["founder", "owner", "system_admin"].includes(user.role)) return <Redirect to="/hcms" />;
  return <>{children}</>;
}

// Blocks non-founders from the Founders Lounge — strictly `founder` only.
// Owner, system_admin, manager, etc. all redirect to /hcms regardless of
// their other privileges. The Founders Lounge surfaces founder-only revenue,
// commission, and growth views; no other role should see them.
export function FoundersOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect to="/login" />;
  if (user.role !== "founder") return <Redirect to="/hcms" />;
  return <>{children}</>;
}

// Blocks non-managers from ops pages — only owner, system_admin, manager
export function ManagerOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect to="/login" />;
  if (!ADMIN_ROLES.includes(user.role)) return <Redirect to="/hcms" />;
  return <>{children}</>;
}

// Roles permitted to view the agent self-service surface at /hcms/my/*.
// Every HCMS-tier role can view their OWN profile/docs/licenses here —
// sales_agent uses it as their primary dashboard; director, agency_manager,
// and manager all land here on login (per the auto-granted role matrix);
// founder/owner/system_admin land on /hcms (admin directory) but can
// navigate here manually to inspect their own profile or toggle (founder).
// Niche roles (marketing_staff, client, investor) have their own surfaces
// and don't belong here — they get redirected to /hcms (which then redirects
// them appropriately via HCMSLayout).
const AGENT_VIEW_ROLES = new Set<string>([
  "founder",
  "owner",
  "system_admin",
  "director",
  "agency_manager",
  "manager",
  "sales_agent",
]);

export function AgentOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect to="/login" />;
  if (!AGENT_VIEW_ROLES.has(user.role)) return <Redirect to="/hcms" />;
  return <>{children}</>;
}

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
    // role's entry page. Agent, admin, and finance flags are tracked
    // independently so an owner who views all three lounges gets an
    // auto-start for each.
    if (triedAutoStartRef.current) return;
    if (tourPersistence.hasSeenFirstLogin(role)) return;

    // Role-specific entry page matching:
    //  - agent:   /hcms/my/dashboard  (startsWith — nested agent routes OK)
    //  - admin:   /hcms               (exact match — /hcms/* sub-routes shouldn't trigger)
    //  - finance: /finance            (exact match — /finance/* sub-routes shouldn't trigger)
    //  - founder: /founders           (exact match — /founders/* sub-routes shouldn't trigger)
    const matchesEntry = (() => {
      if (role === "agent") return location.startsWith("/hcms/my/dashboard");
      if (role === "admin") return location === "/hcms";
      if (role === "finance") return location === "/finance";
      if (role === "founder") return location === "/founders";
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

export function HCMSShell({ children, activePath }: { children: ReactNode; activePath: string }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const currentPath = location || activePath;
  const isAgentRoute = currentPath.startsWith("/hcms/my/");
  const isAgent = user?.role === "sales_agent" || isAgentRoute;
  const sidebarVariant = isAgent ? "agent" : "hcms";
  const subtitle = isAgent ? "Agent HCMS" : "Agent Contracting & Carrier Tracking";
  const userName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : undefined;
  const userEmail = user?.email;

  return (
    <AuthGate>
      <TourProvider>
        <GCShell title={isAgent ? "Agent HCMS" : "HCMS"} subtitle={subtitle} sidebarVariant={sidebarVariant} activePath={activePath} userName={userName} userEmail={userEmail}>
          <ResumeTourBanner />
          {children}
        </GCShell>
        <TourButton />
        <TourCompletionCelebration />
        <TourAutoStart role={isAgent ? "agent" : "admin"} />
      </TourProvider>
    </AuthGate>
  );
}

// Default export — renders role-appropriate dashboard
import HCMSDashboard from "./HCMSDashboard";

// Admin tier sees the HCMSDashboard (agent directory + commission overview)
// at /hcms. Every other HCMS-tier role (sales_agent, director,
// agency_manager, manager) gets bounced to /hcms/my/dashboard so they only
// ever see their own profile + docs. Founders can still navigate back to
// /hcms via the ADMIN/AGENT toggle in the topbar.
const ADMIN_DASHBOARD_ROLES = new Set<string>(["founder", "owner", "system_admin"]);

function DashboardContent() {
  const { user } = useAuth();

  if (!user) return null;

  if (!ADMIN_DASHBOARD_ROLES.has(user.role)) {
    return <Redirect to="/hcms/my/dashboard" />;
  }
  return <HCMSDashboard />;
}

export default function HCMSLayout() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms";
  return (
    <HCMSShell activePath={path}>
      <DashboardContent />
    </HCMSShell>
  );
}
