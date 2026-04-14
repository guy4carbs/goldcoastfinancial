import { GCShell } from "@/components/gc";
import { useLocation } from "wouter";
import HCMSDashboard from "./HCMSDashboard";
import HCMSAgents from "./HCMSAgents";
import HCMSAgentDetail from "./HCMSAgentDetail";
import HCMSCarriers from "./HCMSCarriers";
import HCMSHierarchy from "./HCMSHierarchy";
import HCMSContracting from "./HCMSContracting";
import { lazy, Suspense } from "react";

// Lazy load contracting sub-pages to prevent import crashes from breaking the entire layout
const ContractingRequests = lazy(() => import("./contracting/ContractingRequests"));
const ContractingBank = lazy(() => import("./contracting/ContractingBank"));
const ContractingLicenses = lazy(() => import("./contracting/ContractingLicenses"));
const ContractingEO = lazy(() => import("./contracting/ContractingEO"));
const ContractingTrainings = lazy(() => import("./contracting/ContractingTrainings"));
const ContractingEmployment = lazy(() => import("./contracting/ContractingEmployment"));
const ContractingDBA = lazy(() => import("./contracting/ContractingDBA"));
const ContractingQuestions = lazy(() => import("./contracting/ContractingQuestions"));

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

const Loading = () => (
  <div style={{ padding: 40, color: "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)" }}>Loading...</div>
);

export default function HCMSLayout() {
  const fullPath = typeof window !== "undefined" ? window.location.pathname : "/hcms";

  return (
    <GCShell title="HCMS" subtitle="Agent Contracting & Carrier Tracking" sidebarVariant="hcms" activePath={fullPath}>
      <Suspense fallback={<Loading />}>
        {getPage(fullPath)}
      </Suspense>
    </GCShell>
  );
}
