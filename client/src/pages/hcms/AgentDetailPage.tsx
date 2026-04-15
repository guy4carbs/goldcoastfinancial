import { HCMSShell } from "./HCMSLayout";
import Content from "./HCMSAgentDetail";
export default function AgentDetailPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/agents";
  const agentId = typeof window !== "undefined" ? window.location.pathname.split("/").pop() || "" : "";
  return <HCMSShell activePath={path}><Content agentId={agentId} /></HCMSShell>;
}
