import { HCMSShell } from "../HCMSLayout";
import Content from "./ContractingEO";
export default function EOPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/contracting/eo";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
