import { HCMSShell } from "../HCMSLayout";
import Content from "./ContractingDBA";
export default function DBAPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/contracting/dba";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
