import { HCMSShell } from "./HCMSLayout";
import Content from "./HCMSAgentDetail";
export default function AgentDetailPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/agents";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
