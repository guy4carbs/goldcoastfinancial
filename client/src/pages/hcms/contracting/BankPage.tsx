import { HCMSShell } from "../HCMSLayout";
import Content from "./ContractingBank";
export default function BankPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/contracting/bank";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
