import { GCShell } from "@/components/gc";
import { Route, Switch, useLocation } from "wouter";
import OpsDashboard from "./OpsDashboard";
import OpsProduction from "./OpsProduction";
import OpsDeals from "./OpsDeals";
import OpsCRM from "./OpsCRM";
import OpsCommissions from "./OpsCommissions";
import OpsCompliance from "./OpsCompliance";
import OpsAnalytics from "./OpsAnalytics";
import OpsReporting from "./OpsReporting";
import OpsMarketing from "./OpsMarketing";
import OpsInvestors from "./OpsInvestors";
import OpsFinance from "./OpsFinance";
import OpsSettings from "./OpsSettings";

export default function OpsLayout() {
  const [location] = useLocation();
  return (
    <GCShell title="Ops Hub" subtitle="Back-office Command Center" sidebarVariant="ops" activePath={location}>
      <Switch>
        <Route path="/ops" component={OpsDashboard} />
        <Route path="/ops/production" component={OpsProduction} />
        <Route path="/ops/deals" component={OpsDeals} />
        <Route path="/ops/pipeline" component={OpsCRM} />
        <Route path="/ops/finance" component={OpsFinance} />
        <Route path="/ops/commissions" component={OpsCommissions} />
        <Route path="/ops/analytics" component={OpsAnalytics} />
        <Route path="/ops/reporting" component={OpsReporting} />
        <Route path="/ops/marketing" component={OpsMarketing} />
        <Route path="/ops/investors" component={OpsInvestors} />
        <Route path="/ops/compliance" component={OpsCompliance} />
        <Route path="/ops/settings" component={OpsSettings} />
        <Route><OpsDashboard /></Route>
      </Switch>
    </GCShell>
  );
}
