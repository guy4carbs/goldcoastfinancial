import { HCMSShell } from "../HCMSLayout";
import Content from "./ContractingEmployment";
export default function EmploymentPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/contracting/employment";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
