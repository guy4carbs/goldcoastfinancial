import { GCShell } from "@/components/gc";
import { Route, Switch, useLocation } from "wouter";
import HCMSDashboard from "./HCMSDashboard";
import HCMSAgents from "./HCMSAgents";
import HCMSAgentDetail from "./HCMSAgentDetail";
import HCMSCarriers from "./HCMSCarriers";
import HCMSHierarchy from "./HCMSHierarchy";
import HCMSContracting from "./HCMSContracting";
import ContractingRequests from "./contracting/ContractingRequests";
import ContractingBank from "./contracting/ContractingBank";
import ContractingLicenses from "./contracting/ContractingLicenses";
import ContractingEO from "./contracting/ContractingEO";
import ContractingTrainings from "./contracting/ContractingTrainings";
import ContractingEmployment from "./contracting/ContractingEmployment";
import ContractingDBA from "./contracting/ContractingDBA";
import ContractingQuestions from "./contracting/ContractingQuestions";

export default function HCMSLayout() {
  const [location] = useLocation();
  return (
    <GCShell title="HCMS" subtitle="Agent Contracting & Carrier Tracking" sidebarVariant="hcms" activePath={location}>
      <Switch>
        <Route path="/hcms/agents/:id" component={HCMSAgentDetail} />
        <Route path="/hcms" component={HCMSDashboard} />
        <Route path="/hcms/contracting" component={HCMSContracting} />
        <Route path="/hcms/contracting/requests" component={ContractingRequests} />
        <Route path="/hcms/contracting/bank" component={ContractingBank} />
        <Route path="/hcms/contracting/licenses" component={ContractingLicenses} />
        <Route path="/hcms/contracting/eo" component={ContractingEO} />
        <Route path="/hcms/contracting/trainings" component={ContractingTrainings} />
        <Route path="/hcms/contracting/employment" component={ContractingEmployment} />
        <Route path="/hcms/contracting/dba" component={ContractingDBA} />
        <Route path="/hcms/contracting/questions" component={ContractingQuestions} />
        <Route path="/hcms/agents" component={HCMSAgents} />
        <Route path="/hcms/carriers" component={HCMSCarriers} />
        <Route path="/hcms/hierarchy" component={HCMSHierarchy} />
        <Route><HCMSDashboard /></Route>
      </Switch>
    </GCShell>
  );
}
