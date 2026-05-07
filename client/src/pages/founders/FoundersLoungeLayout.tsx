import { useEffect, useState } from "react";
import { GCShell } from "@/components/gc";
import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import FoundersDashboard from "./FoundersDashboard";
import FoundersRevenue from "./FoundersRevenue";
import FoundersHierarchy from "./FoundersHierarchy";
import FoundersGrowth from "./FoundersGrowth";
import FoundersBookOfBusiness from "./FoundersBookOfBusiness";
import FoundersTeamPerformance from "./FoundersTeamPerformance";
import FoundersLeadDistribution from "./FoundersLeadDistribution";
import FoundersAgencyManagement from "./FoundersAgencyManagement";
import FoundersProfitSplit from "./FoundersProfitSplit";
import FoundersLoungeAccess from "./FoundersLoungeAccess";
import FoundersViewAs from "./FoundersViewAs";
import FoundersSettings from "./FoundersSettings";
import {
  FoundersCommandPalette,
  useFoundersCommandPaletteToggle,
} from "./FoundersCommandPalette";
import { TourProvider } from "@/lib/tour/TourProvider";
import { TourButton } from "@/components/tour/TourButton";
import { ResumeTourBanner } from "@/components/tour/ResumeTourBanner";
import { TourCompletionCelebration } from "@/components/tour/TourCompletionCelebration";
import { TourAutoStart } from "@/pages/hcms/HCMSLayout";

export default function FoundersLoungeLayout() {
  const [location] = useLocation();
  const [paletteOpen, setPaletteOpen] = useFoundersCommandPaletteToggle();
  const { user } = useAuth();
  // For business-entity founders, the sidebar widget should display the
  // company brand, not the legal individual's name (matches how the hierarchy
  // node renders). Pull from agent_profiles via /api/agent-portal/me; fall
  // through to first+last for individual accounts.
  const [companyName, setCompanyName] = useState<string | null>(null);
  useEffect(() => {
    if (!user) { setCompanyName(null); return; }
    let cancelled = false;
    fetch("/api/agent-portal/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        const profile = d?.profile;
        if (profile?.dbaType === "business_entity") {
          setCompanyName(profile.companyName || profile.dbaName || null);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);
  const userName = user
    ? companyName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined
    : undefined;
  const userEmail = user?.email;
  return (
    <TourProvider>
      <GCShell
        title="Founders Lounge"
        subtitle="Ownership Oversight"
        sidebarVariant="founders"
        activePath={location}
        userName={userName}
        userEmail={userEmail}
      >
        <ResumeTourBanner />
        <Switch>
          <Route path="/founders" component={FoundersDashboard} />
          <Route path="/founders/revenue" component={FoundersRevenue} />
          <Route path="/founders/hierarchy" component={FoundersHierarchy} />
          <Route path="/founders/growth" component={FoundersGrowth} />
          <Route path="/founders/book" component={FoundersBookOfBusiness} />
          <Route path="/founders/team-performance" component={FoundersTeamPerformance} />
          <Route path="/founders/lead-distribution" component={FoundersLeadDistribution} />
          <Route path="/founders/agency-management" component={FoundersAgencyManagement} />
          <Route path="/founders/profit-split" component={FoundersProfitSplit} />
          <Route path="/founders/access" component={FoundersLoungeAccess} />
          <Route path="/founders/view-as" component={FoundersViewAs} />
          <Route path="/founders/settings" component={FoundersSettings} />
          <Route><FoundersDashboard /></Route>
        </Switch>
        {/* Must live inside GCShell so it can call useGCTheme() */}
        <FoundersCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </GCShell>
      <TourButton />
      <TourCompletionCelebration />
      <TourAutoStart role="founder" />
    </TourProvider>
  );
}
