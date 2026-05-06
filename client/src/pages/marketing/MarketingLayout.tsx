import { GCShell } from "@/components/gc";
import { Route, Switch, useLocation } from "wouter";
import MarketingDashboard from "./MarketingDashboard";
import MarketingCampaigns from "./MarketingCampaigns";
import MarketingLeads from "./MarketingLeads";
import MarketingRecruitment from "./MarketingRecruitment";
import MarketingAnalytics from "./MarketingAnalytics";

export default function MarketingLayout() {
  const [location] = useLocation();
  return (
    <GCShell title="Marketing & Growth" subtitle="Campaigns, Leads & Agent Recruitment" sidebarVariant="marketing" activePath={location}>
      <Switch>
        <Route path="/marketing" component={MarketingDashboard} />
        <Route path="/marketing/campaigns" component={MarketingCampaigns} />
        <Route path="/marketing/leads" component={MarketingLeads} />
        <Route path="/marketing/recruitment" component={MarketingRecruitment} />
        <Route path="/marketing/analytics" component={MarketingAnalytics} />
        <Route><MarketingDashboard /></Route>
      </Switch>
    </GCShell>
  );
}
