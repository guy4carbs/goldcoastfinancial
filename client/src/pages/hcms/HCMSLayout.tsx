import { GCShell } from "@/components/gc";
import { Route, Switch, useLocation } from "wouter";
import HCMSDashboard from "./HCMSDashboard";
import HCMSPipeline from "./HCMSPipeline";
import HCMSAgents from "./HCMSAgents";
import HCMSAgentDetail from "./HCMSAgentDetail";
import HCMSLicensing from "./HCMSLicensing";
import HCMSCarriers from "./HCMSCarriers";
import HCMSDocuments from "./HCMSDocuments";
import HCMSHierarchy from "./HCMSHierarchy";
import HCMSHierarchyRequests from "./HCMSHierarchyRequests";
import HCMSCompensation from "./HCMSCompensation";
import HCMSContracting from "./HCMSContracting";
import HCMSCompliance from "./HCMSCompliance";
import HCMSAlerts from "./HCMSAlerts";

export default function HCMSLayout() {
  const [location] = useLocation();
  return (
    <GCShell title="HCMS" subtitle="Hierarchy & Compensation Management" sidebarVariant="hcms" activePath={location}>
      <Switch>
        <Route path="/hcms/agents/:id" component={HCMSAgentDetail} />
        <Route path="/hcms/hierarchy/requests" component={HCMSHierarchyRequests} />
        <Route path="/hcms" component={HCMSPipeline} />
        <Route path="/hcms/contracting" component={HCMSContracting} />
        <Route path="/hcms/pipeline" component={HCMSPipeline} />
        <Route path="/hcms/agents" component={HCMSAgents} />
        <Route path="/hcms/licensing" component={HCMSLicensing} />
        <Route path="/hcms/carriers" component={HCMSCarriers} />
        <Route path="/hcms/hierarchy" component={HCMSHierarchy} />
        <Route path="/hcms/compensation" component={HCMSCompensation} />
        <Route path="/hcms/documents" component={HCMSDocuments} />
        <Route path="/hcms/compliance" component={HCMSCompliance} />
        <Route path="/hcms/alerts" component={HCMSAlerts} />
        <Route><HCMSDashboard /></Route>
      </Switch>
    </GCShell>
  );
}
