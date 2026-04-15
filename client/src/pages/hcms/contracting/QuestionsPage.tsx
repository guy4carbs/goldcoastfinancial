import { HCMSShell } from "../HCMSLayout";
import Content from "./ContractingQuestions";
export default function QuestionsPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/contracting/questions";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
