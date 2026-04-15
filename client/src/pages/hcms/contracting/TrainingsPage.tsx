import { HCMSShell } from "../HCMSLayout";
import Content from "./ContractingTrainings";
export default function TrainingsPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/contracting/trainings";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
