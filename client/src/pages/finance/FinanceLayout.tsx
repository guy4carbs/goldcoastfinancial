import { GCShell } from "@/components/gc";
import { Route, Switch, useLocation } from "wouter";
import FinanceDashboard from "./FinanceDashboard";
import FinanceRevenue from "./FinanceRevenue";
import FinanceOverrides from "./FinanceOverrides";
import FinanceTransactions from "./FinanceTransactions";
import FinanceCashFlow from "./FinanceCashFlow";
import FinanceChargebacks from "./FinanceChargebacks";
import FinanceReconciliation from "./FinanceReconciliation";
import FinanceStatements from "./FinanceStatements";
import FinanceReports from "./FinanceReports";
import { TourProvider } from "@/lib/tour/TourProvider";
import { TourButton } from "@/components/tour/TourButton";
import { ResumeTourBanner } from "@/components/tour/ResumeTourBanner";
import { TourCompletionCelebration } from "@/components/tour/TourCompletionCelebration";
import { TourAutoStart } from "@/pages/hcms/HCMSLayout";

export default function FinanceLayout() {
  const [location] = useLocation();
  return (
    <TourProvider>
      <GCShell title="Finance" subtitle="Financial Operations & Reporting" sidebarVariant="finance" activePath={location}>
        <ResumeTourBanner />
        <Switch>
          <Route path="/finance" component={FinanceDashboard} />
          <Route path="/finance/revenue" component={FinanceRevenue} />
          <Route path="/finance/overrides" component={FinanceOverrides} />
          <Route path="/finance/transactions" component={FinanceTransactions} />
          <Route path="/finance/cashflow" component={FinanceCashFlow} />
          <Route path="/finance/chargebacks" component={FinanceChargebacks} />
          <Route path="/finance/reconciliation" component={FinanceReconciliation} />
          <Route path="/finance/statements" component={FinanceStatements} />
          <Route path="/finance/reports" component={FinanceReports} />
          <Route><FinanceDashboard /></Route>
        </Switch>
      </GCShell>
      <TourButton />
      <TourCompletionCelebration />
      <TourAutoStart role="finance" />
    </TourProvider>
  );
}
