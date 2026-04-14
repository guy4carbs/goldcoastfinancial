import { GCShell } from "@/components/gc";
import { useLocation } from "wouter";
import HCMSDashboard from "./HCMSDashboard";
import HCMSAgents from "./HCMSAgents";
import HCMSAgentDetail from "./HCMSAgentDetail";
import HCMSCarriers from "./HCMSCarriers";
import HCMSHierarchy from "./HCMSHierarchy";
import HCMSContracting from "./HCMSContracting";
import ContractingRequests from "./contracting/ContractingRequests";
import ContractingBank from "./contracting/ContractingBank";
import ContractingLicenses from "./contracting/ContractingLicenses";
import ContractingEO from "./contracting/ContractingEO";
import ContractingTrainings from "./contracting/ContractingTrainings";
import ContractingEmployment from "./contracting/ContractingEmployment";
import ContractingDBA from "./contracting/ContractingDBA";
import ContractingQuestions from "./contracting/ContractingQuestions";

function getPage(path: string) {
  if (path.startsWith("/hcms/contracting/requests")) return <ContractingRequests />;
  if (path.startsWith("/hcms/contracting/bank")) return <ContractingBank />;
  if (path.startsWith("/hcms/contracting/licenses")) return <ContractingLicenses />;
  if (path.startsWith("/hcms/contracting/eo")) return <ContractingEO />;
  if (path.startsWith("/hcms/contracting/trainings")) return <ContractingTrainings />;
  if (path.startsWith("/hcms/contracting/employment")) return <ContractingEmployment />;
  if (path.startsWith("/hcms/contracting/dba")) return <ContractingDBA />;
  if (path.startsWith("/hcms/contracting/questions")) return <ContractingQuestions />;
  if (path === "/hcms/contracting") return <HCMSContracting />;
  if (path.match(/^\/hcms\/agents\/[^/]+/)) return <HCMSAgentDetail />;
  if (path === "/hcms/agents") return <HCMSAgents />;
  if (path === "/hcms/carriers") return <HCMSCarriers />;
  if (path === "/hcms/hierarchy") return <HCMSHierarchy />;
  if (path === "/hcms") return <HCMSDashboard />;
  return <HCMSDashboard />;
}

export default function HCMSLayout() {
  // Use window.location.pathname for full path (Wouter's useLocation may return relative path in nested routes)
  const [wouterLocation] = useLocation();
  const fullPath = typeof window !== "undefined" ? window.location.pathname : wouterLocation;

  return (
    <GCShell title="HCMS" subtitle="Agent Contracting & Carrier Tracking" sidebarVariant="hcms" activePath={fullPath}>
      {getPage(fullPath)}
    </GCShell>
  );
}
