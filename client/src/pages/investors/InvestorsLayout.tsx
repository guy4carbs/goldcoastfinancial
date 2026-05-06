import { GCShell } from "@/components/gc";
import { Route, Switch, useLocation } from "wouter";
import InvestorsDashboard from "./InvestorsDashboard";
import InvestorsPortfolio from "./InvestorsPortfolio";
import InvestorsCarriers from "./InvestorsCarriers";
import InvestorsPerformance from "./InvestorsPerformance";
import InvestorsReports from "./InvestorsReports";

export default function InvestorsLayout() {
  const [location] = useLocation();
  return (
    <GCShell title="Investor Relations" subtitle="Portfolio Metrics & Growth Reporting" sidebarVariant="investors" activePath={location}>
      <Switch>
        <Route path="/investors/dashboard" component={InvestorsDashboard} />
        <Route path="/investors/portfolio" component={InvestorsPortfolio} />
        <Route path="/investors/carriers" component={InvestorsCarriers} />
        <Route path="/investors/performance" component={InvestorsPerformance} />
        <Route path="/investors/reports" component={InvestorsReports} />
        <Route><InvestorsDashboard /></Route>
      </Switch>
    </GCShell>
  );
}
