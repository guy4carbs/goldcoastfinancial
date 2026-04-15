import { HCMSShell } from "./HCMSLayout";
import Content from "./HCMSContracting";
export default function ContractingOverviewPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/contracting";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
