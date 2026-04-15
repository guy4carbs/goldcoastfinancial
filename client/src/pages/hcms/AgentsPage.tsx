import { HCMSShell } from "./HCMSLayout";
import Content from "./HCMSAgents";
export default function AgentsPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/agents";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
