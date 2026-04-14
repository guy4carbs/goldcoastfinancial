import { GCShell } from "@/components/gc";
import { Route, Switch, useLocation } from "wouter";
import HCMSDashboard from "./HCMSDashboard";
import HCMSAgents from "./HCMSAgents";
import HCMSAgentDetail from "./HCMSAgentDetail";
import HCMSLicensing from "./HCMSLicensing";
import HCMSCarriers from "./HCMSCarriers";
import HCMSHierarchy from "./HCMSHierarchy";
import HCMSContracting from "./HCMSContracting";

export default function HCMSLayout() {
  const [location] = useLocation();
  return (
    <GCShell title="HCMS" subtitle="Agent Contracting & Carrier Tracking" sidebarVariant="hcms" activePath={location}>
      <Switch>
        <Route path="/hcms/agents/:id" component={HCMSAgentDetail} />
        <Route path="/hcms" component={HCMSDashboard} />
        <Route path="/hcms/contracting" component={HCMSContracting} />
        <Route path="/hcms/agents" component={HCMSAgents} />
        <Route path="/hcms/licensing" component={HCMSLicensing} />
        <Route path="/hcms/carriers" component={HCMSCarriers} />
        <Route path="/hcms/hierarchy" component={HCMSHierarchy} />
        <Route><HCMSDashboard /></Route>
      </Switch>
    </GCShell>
  );
}
