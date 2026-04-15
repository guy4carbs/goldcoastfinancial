import { HCMSShell } from "../HCMSLayout";
import Content from "./ContractingLicenses";
export default function LicensesPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/contracting/licenses";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
