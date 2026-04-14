import { GCShell } from "@/components/gc";
import { useLocation, Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import HCMSDashboard from "./HCMSDashboard";
import HCMSAgents from "./HCMSAgents";
import HCMSAgentDetail from "./HCMSAgentDetail";
import HCMSCarriers from "./HCMSCarriers";
import HCMSHierarchy from "./HCMSHierarchy";
import HCMSContracting from "./HCMSContracting";

const ContractingRequests = lazy(() => import("./contracting/ContractingRequests"));
const ContractingBank = lazy(() => import("./contracting/ContractingBank"));
const ContractingLicenses = lazy(() => import("./contracting/ContractingLicenses"));
const ContractingEO = lazy(() => import("./contracting/ContractingEO"));
const ContractingTrainings = lazy(() => import("./contracting/ContractingTrainings"));
const ContractingEmployment = lazy(() => import("./contracting/ContractingEmployment"));
const ContractingDBA = lazy(() => import("./contracting/ContractingDBA"));
const ContractingQuestions = lazy(() => import("./contracting/ContractingQuestions"));

const Loading = () => <div style={{ padding: 40, color: "var(--gc-text-muted)" }}>Loading...</div>;

export default function HCMSLayout() {
  const [location] = useLocation();

  // Render based on full browser path (not Wouter's potentially relative path)
  const path = typeof window !== "undefined" ? window.location.pathname : location;

  let content;
  if (path.startsWith("/hcms/contracting/")) {
    const sub = path.split("/")[3]; // "requests", "bank", etc.
    const map: Record<string, React.LazyExoticComponent<any>> = {
      requests: ContractingRequests, bank: ContractingBank, licenses: ContractingLicenses,
      eo: ContractingEO, trainings: ContractingTrainings, employment: ContractingEmployment,
      dba: ContractingDBA, questions: ContractingQuestions,
    };
    const Page = map[sub];
    content = Page ? <Suspense fallback={<Loading />}><Page /></Suspense> : <HCMSContracting />;
  } else if (path === "/hcms/contracting") {
    content = <HCMSContracting />;
  } else if (path.match(/^\/hcms\/agents\/[^/]+/)) {
    content = <HCMSAgentDetail />;
  } else if (path === "/hcms/agents") {
    content = <HCMSAgents />;
  } else if (path === "/hcms/carriers") {
    content = <HCMSCarriers />;
  } else if (path === "/hcms/hierarchy") {
    content = <HCMSHierarchy />;
  } else {
    content = <HCMSDashboard />;
  }

  return (
    <GCShell title="HCMS" subtitle="Agent Contracting & Carrier Tracking" sidebarVariant="hcms" activePath={path}>
      {content}
    </GCShell>
  );
}
