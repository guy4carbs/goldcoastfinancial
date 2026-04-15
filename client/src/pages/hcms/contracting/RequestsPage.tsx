import { HCMSShell } from "../HCMSLayout";
import Content from "./ContractingRequests";
export default function RequestsPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/contracting/requests";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
