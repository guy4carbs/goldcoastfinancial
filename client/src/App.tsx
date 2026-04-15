import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { LoadingScreen, NewsletterBanner } from "@/components/institutional";
import { usePageTracking, useScrollTracking } from "@/hooks/useAnalytics";

// Institutional
import InstitutionalHome from "@/pages/institutional/InstitutionalHome";
import InstitutionalAbout from "@/pages/institutional/InstitutionalAbout";
import InstitutionalPortfolio from "@/pages/institutional/InstitutionalPortfolio";
import InstitutionalContact from "@/pages/institutional/InstitutionalContact";
import InstitutionalNews from "@/pages/institutional/InstitutionalNews";
import InstitutionalTerms from "@/pages/institutional/InstitutionalTerms";
import InstitutionalPrivacy from "@/pages/institutional/InstitutionalPrivacy";
import InstitutionalInvestors from "@/pages/institutional/InstitutionalInvestors";
import InstitutionalCareers from "@/pages/institutional/InstitutionalCareers";
import InstitutionalBlog from "@/pages/institutional/InstitutionalBlog";
import InstitutionalBlogArticle from "@/pages/institutional/InstitutionalBlogArticle";
import InstitutionalNewsArticle from "@/pages/institutional/InstitutionalNewsArticle";
import InstitutionalMedia from "@/pages/institutional/InstitutionalMedia";

// HCMS - each page is self-contained with its own shell wrapper
import HCMSLayout from "@/pages/hcms/HCMSLayout";
import AgentsPage from "@/pages/hcms/AgentsPage";
import AgentDetailPage from "@/pages/hcms/AgentDetailPage";
import CarriersPage from "@/pages/hcms/CarriersPage";
import HierarchyPage from "@/pages/hcms/HierarchyPage";
import ContractingOverviewPage from "@/pages/hcms/ContractingOverviewPage";
import RequestsPage from "@/pages/hcms/contracting/RequestsPage";
import BankPage from "@/pages/hcms/contracting/BankPage";
import LicensesPage from "@/pages/hcms/contracting/LicensesPage";
import EOPage from "@/pages/hcms/contracting/EOPage";
import TrainingsPage from "@/pages/hcms/contracting/TrainingsPage";
import EmploymentPage from "@/pages/hcms/contracting/EmploymentPage";
import DBAPage from "@/pages/hcms/contracting/DBAPage";
import QuestionsPage from "@/pages/hcms/contracting/QuestionsPage";

// Ops
import OpsLayout from "@/pages/ops/OpsLayout";

// Auth / Public
import AgentPortal from "@/pages/apply/AgentPortal";
import LoginPage from "@/pages/auth/LoginPage";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);
  return null;
}

function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  usePageTracking();
  useScrollTracking();
  return <>{children}</>;
}

function InstitutionalWrapper() {
  const [location] = useLocation();
  const isPlatform = location.startsWith("/hcms") || location.startsWith("/ops") || location.startsWith("/apply") || location.startsWith("/login");
  if (isPlatform) return null;
  return (
    <>
      <LoadingScreen />
      <NewsletterBanner />
    </>
  );
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Institutional */}
        <Route path="/" component={InstitutionalHome} />
        <Route path="/about" component={InstitutionalAbout} />
        <Route path="/portfolio" component={InstitutionalPortfolio} />
        <Route path="/contact" component={InstitutionalContact} />
        <Route path="/news" component={InstitutionalNews} />
        <Route path="/news/:slug" component={InstitutionalNewsArticle} />
        <Route path="/terms" component={InstitutionalTerms} />
        <Route path="/privacy" component={InstitutionalPrivacy} />
        <Route path="/investors" component={InstitutionalInvestors} />
        <Route path="/careers" component={InstitutionalCareers} />
        <Route path="/blog" component={InstitutionalBlog} />
        <Route path="/blog/:slug" component={InstitutionalBlogArticle} />
        <Route path="/media" component={InstitutionalMedia} />

        {/* HCMS — contracting sub-pages (most specific first) */}
        <Route path="/hcms/contracting/requests" component={RequestsPage} />
        <Route path="/hcms/contracting/bank" component={BankPage} />
        <Route path="/hcms/contracting/licenses" component={LicensesPage} />
        <Route path="/hcms/contracting/eo" component={EOPage} />
        <Route path="/hcms/contracting/trainings" component={TrainingsPage} />
        <Route path="/hcms/contracting/employment" component={EmploymentPage} />
        <Route path="/hcms/contracting/dba" component={DBAPage} />
        <Route path="/hcms/contracting/questions" component={QuestionsPage} />
        <Route path="/hcms/contracting" component={ContractingOverviewPage} />

        {/* HCMS — main pages */}
        <Route path="/hcms/agents/:id" component={AgentDetailPage} />
        <Route path="/hcms/agents" component={AgentsPage} />
        <Route path="/hcms/carriers" component={CarriersPage} />
        <Route path="/hcms/hierarchy" component={HierarchyPage} />
        <Route path="/hcms" component={HCMSLayout} />

        {/* Ops */}
        <Route path="/ops" component={OpsLayout} />
        <Route path="/ops/:rest*" component={OpsLayout} />

        {/* Auth / Public */}
        <Route path="/apply" component={AgentPortal} />
        <Route path="/login" component={LoginPage} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnalyticsProvider>
          <InstitutionalWrapper />
          <Toaster />
          <Router />
        </AnalyticsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
