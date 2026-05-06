import { useLocation } from "wouter";
import { HCMSShell } from "../HCMSLayout";
import AgentDashboard from "./AgentDashboard";
import AgentProfile from "./AgentProfile";
import AgentRequests from "./AgentRequests";
import AgentDocuments from "./AgentDocuments";
import AgentLicenses from "./AgentLicenses";
import AgentEO from "./AgentEO";
import AgentBank from "./AgentBank";
import AgentTrainings from "./AgentTrainings";
import AgentEmployment from "./AgentEmployment";
import AgentDBA from "./AgentDBA";
import AgentQuestions from "./AgentQuestions";
import AgentCarriers from "./AgentCarriers";
import AgentHierarchy from "./AgentHierarchy";
import { TOUR } from "@/lib/tour/selectors";

const ROOT_BY_PATH: Record<string, string> = {
  "/hcms/my/profile": TOUR.AGENT.PROFILE.ROOT,
  "/hcms/my/requests": TOUR.AGENT.REQUESTS.ROOT,
  "/hcms/my/documents": TOUR.AGENT.DOCUMENTS.ROOT,
  "/hcms/my/licenses": TOUR.AGENT.LICENSES.ROOT,
  "/hcms/my/eo": TOUR.AGENT.EO.ROOT,
  "/hcms/my/bank": TOUR.AGENT.BANK.ROOT,
  "/hcms/my/trainings": TOUR.AGENT.TRAININGS.ROOT,
  "/hcms/my/employment": TOUR.AGENT.EMPLOYMENT.ROOT,
  "/hcms/my/dba": TOUR.AGENT.DBA.ROOT,
  "/hcms/my/questions": TOUR.AGENT.QUESTIONS.ROOT,
  "/hcms/my/carriers": TOUR.AGENT.CARRIERS.ROOT,
  "/hcms/my/hierarchy": TOUR.AGENT.HIERARCHY.ROOT,
};

function Wrap({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const tourRoot = ROOT_BY_PATH[location];
  return (
    <HCMSShell activePath={location}>
      {tourRoot ? <div data-tour-id={tourRoot}>{children}</div> : children}
    </HCMSShell>
  );
}

export function AgentDashboardPage() { return <Wrap><AgentDashboard /></Wrap>; }
export function AgentProfilePage() { return <Wrap><AgentProfile /></Wrap>; }
export function AgentRequestsPage() { return <Wrap><AgentRequests /></Wrap>; }
export function AgentDocumentsPage() { return <Wrap><AgentDocuments /></Wrap>; }
export function AgentLicensesPage() { return <Wrap><AgentLicenses /></Wrap>; }
export function AgentEOPage() { return <Wrap><AgentEO /></Wrap>; }
export function AgentBankPage() { return <Wrap><AgentBank /></Wrap>; }
export function AgentTrainingsPage() { return <Wrap><AgentTrainings /></Wrap>; }
export function AgentEmploymentPage() { return <Wrap><AgentEmployment /></Wrap>; }
export function AgentDBAPage() { return <Wrap><AgentDBA /></Wrap>; }
export function AgentQuestionsPage() { return <Wrap><AgentQuestions /></Wrap>; }
export function AgentCarriersPage() { return <Wrap><AgentCarriers /></Wrap>; }
export function AgentHierarchyPage() { return <Wrap><AgentHierarchy /></Wrap>; }
