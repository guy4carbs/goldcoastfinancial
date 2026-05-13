import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { LoadingScreen, NewsletterBanner } from "@/components/institutional";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePageTracking, useScrollTracking } from "@/hooks/useAnalytics";
import { useRealtimeHierarchy } from "@/hooks/useRealtimeHierarchy";
import { GlobalViewAsBanner } from "@/components/founders/GlobalViewAsBanner";

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
import HCMSLayout, { AdminOnly, AgentOnly, ManagerOnly, ExecutiveOnly, FoundersOnly } from "@/pages/hcms/HCMSLayout";
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

// Agent Portal
import { AgentDashboardPage, AgentProfilePage, AgentRequestsPage, AgentDocumentsPage, AgentLicensesPage, AgentEOPage, AgentBankPage, AgentTrainingsPage, AgentEmploymentPage, AgentDBAPage, AgentQuestionsPage, AgentCarriersPage, AgentHierarchyPage } from "@/pages/hcms/agent/AgentPages";

// Ops
import OpsLayout from "@/pages/ops/OpsLayout";

// Lounges
import FinanceLayout from "@/pages/finance/FinanceLayout";
import InvestorsLayout from "@/pages/investors/InvestorsLayout";
import MarketingLayout from "@/pages/marketing/MarketingLayout";
import FoundersLoungeLayout from "@/pages/founders/FoundersLoungeLayout";

// lifeOS — system update + release notes
import { LifeOSUpdateProvider } from "@/components/lifeos/LifeOSUpdateProvider";
import { ChunkLoadGuard } from "@/components/lifeos/ChunkLoadGuard";
import WhatsNewArchive from "@/pages/lifeos/WhatsNewArchive";

// Auth / Public
import AgentApplication from "@/pages/apply/AgentApplication";
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import Auth2faEnrollPage from "@/pages/auth/Auth2faEnrollPage";
import Auth2faVerifyPage from "@/pages/auth/Auth2faVerifyPage";

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

/**
 * Phase D Wave 2 (Nova) — mounts useRealtimeHierarchy ONCE at the app root so
 * SSE subscriptions live for the lifetime of the session. Must sit INSIDE
 * <QueryClientProvider> because the hook calls useQueryClient().
 */
function RealtimeBridge({ children }: { children: React.ReactNode }) {
  useRealtimeHierarchy();
  return <>{children}</>;
}

function InstitutionalWrapper() {
  const [location] = useLocation();
  const isPlatform = location.startsWith("/hcms") || location.startsWith("/ops") || location.startsWith("/finance") || location.startsWith("/investors/") || location.startsWith("/marketing") || location.startsWith("/founders") || location.startsWith("/apply") || location.startsWith("/login") || location.startsWith("/forgot-password") || location.startsWith("/reset-password") || location.startsWith("/auth/");
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

        {/* lifeOS public archive — /founders/lifeos lives inside FoundersLoungeLayout */}
        <Route path="/lifeos/whats-new" component={WhatsNewArchive} />

        {/* HCMS — Agent Portal (sales_agent + owner) */}
        <Route path="/hcms/my/dashboard">{() => <AgentOnly><AgentDashboardPage /></AgentOnly>}</Route>
        <Route path="/hcms/my/profile">{() => <AgentOnly><AgentProfilePage /></AgentOnly>}</Route>
        <Route path="/hcms/my/requests">{() => <AgentOnly><AgentRequestsPage /></AgentOnly>}</Route>
        <Route path="/hcms/my/documents">{() => <AgentOnly><AgentDocumentsPage /></AgentOnly>}</Route>
        <Route path="/hcms/my/licenses">{() => <AgentOnly><AgentLicensesPage /></AgentOnly>}</Route>
        <Route path="/hcms/my/eo">{() => <AgentOnly><AgentEOPage /></AgentOnly>}</Route>
        <Route path="/hcms/my/bank">{() => <AgentOnly><AgentBankPage /></AgentOnly>}</Route>
        <Route path="/hcms/my/trainings">{() => <AgentOnly><AgentTrainingsPage /></AgentOnly>}</Route>
        <Route path="/hcms/my/employment">{() => <AgentOnly><AgentEmploymentPage /></AgentOnly>}</Route>
        <Route path="/hcms/my/dba">{() => <AgentOnly><AgentDBAPage /></AgentOnly>}</Route>
        <Route path="/hcms/my/questions">{() => <AgentOnly><AgentQuestionsPage /></AgentOnly>}</Route>
        <Route path="/hcms/my/carriers">{() => <AgentOnly><AgentCarriersPage /></AgentOnly>}</Route>
        <Route path="/hcms/my/hierarchy">{() => <AgentOnly><AgentHierarchyPage /></AgentOnly>}</Route>

        {/* HCMS — Admin contracting sub-pages (owner/admin/manager only) */}
        <Route path="/hcms/contracting/requests">{() => <AdminOnly><RequestsPage /></AdminOnly>}</Route>
        <Route path="/hcms/contracting/bank">{() => <AdminOnly><BankPage /></AdminOnly>}</Route>
        <Route path="/hcms/contracting/licenses">{() => <AdminOnly><LicensesPage /></AdminOnly>}</Route>
        <Route path="/hcms/contracting/eo">{() => <AdminOnly><EOPage /></AdminOnly>}</Route>
        <Route path="/hcms/contracting/trainings">{() => <AdminOnly><TrainingsPage /></AdminOnly>}</Route>
        <Route path="/hcms/contracting/employment">{() => <AdminOnly><EmploymentPage /></AdminOnly>}</Route>
        <Route path="/hcms/contracting/dba">{() => <AdminOnly><DBAPage /></AdminOnly>}</Route>
        <Route path="/hcms/contracting/questions">{() => <AdminOnly><QuestionsPage /></AdminOnly>}</Route>
        <Route path="/hcms/contracting">{() => <AdminOnly><ContractingOverviewPage /></AdminOnly>}</Route>

        {/* HCMS — Admin main pages (owner/admin/manager only) */}
        <Route path="/hcms/agents/:id">{() => <AdminOnly><AgentDetailPage /></AdminOnly>}</Route>
        <Route path="/hcms/agents">{() => <AdminOnly><AgentsPage /></AdminOnly>}</Route>
        <Route path="/hcms/carriers">{() => <AdminOnly><CarriersPage /></AdminOnly>}</Route>
        <Route path="/hcms/hierarchy">{() => <AdminOnly><HierarchyPage /></AdminOnly>}</Route>

        {/* HCMS — Dashboard (role-detected: agent sees agent dashboard, admin sees admin dashboard) */}
        <Route path="/hcms" component={HCMSLayout} />

        {/* Ops */}
        <Route path="/ops">{() => <ManagerOnly><OpsLayout /></ManagerOnly>}</Route>
        <Route path="/ops/:rest*">{() => <ManagerOnly><OpsLayout /></ManagerOnly>}</Route>

        {/* Finance Lounge (owner + system_admin only) */}
        <Route path="/finance">{() => <ExecutiveOnly><FinanceLayout /></ExecutiveOnly>}</Route>
        <Route path="/finance/:rest*">{() => <ExecutiveOnly><FinanceLayout /></ExecutiveOnly>}</Route>

        {/* Founders Lounge (role === "founder" only) */}
        <Route path="/founders">{() => <FoundersOnly><FoundersLoungeLayout /></FoundersOnly>}</Route>
        <Route path="/founders/:rest*">{() => <FoundersOnly><FoundersLoungeLayout /></FoundersOnly>}</Route>

        {/* Investors Lounge (owner + system_admin only) — /investors stays as institutional page */}
        <Route path="/investors/:rest*">{() => <ExecutiveOnly><InvestorsLayout /></ExecutiveOnly>}</Route>

        {/* Marketing Lounge (owner + system_admin + manager) */}
        <Route path="/marketing">{() => <ManagerOnly><MarketingLayout /></ManagerOnly>}</Route>
        <Route path="/marketing/:rest*">{() => <ManagerOnly><MarketingLayout /></ManagerOnly>}</Route>

        {/* Auth / Public */}
        <Route path="/apply" component={AgentApplication} />
        <Route path="/login" component={LoginPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/auth/2fa/enroll" component={Auth2faEnrollPage} />
        <Route path="/auth/2fa" component={Auth2faVerifyPage} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeBridge>
        <TooltipProvider>
          <AnalyticsProvider>
            {/*
              GlobalViewAsBanner mounts at the App root so the founder sees a
              persistent "VIEWING AS X" reminder on EVERY page (HCMS, Ops,
              Finance, Founders, Investors, Marketing, etc.) for the duration
              of an active impersonation session. It self-suppresses to null
              when no session is active. Sits above the GCShell sidebar via
              z-index: 100 and publishes --gc-global-viewas-banner-height for
              layouts that need to offset for it.
            */}
            <GlobalViewAsBanner />
            <InstitutionalWrapper />
            <Toaster />
            {/*
              P0 (audit 2026-05-12): wrap Router in a generic ErrorBoundary
              so a render-time exception in any page component falls back to
              a recoverable screen instead of unmounting the whole tree
              (white-screen-of-death). ChunkLoadGuard inside still handles
              chunk-load failures specifically.
            */}
            <ErrorBoundary>
              <ChunkLoadGuard>
                <LifeOSUpdateProvider>
                  <Router />
                </LifeOSUpdateProvider>
              </ChunkLoadGuard>
            </ErrorBoundary>
          </AnalyticsProvider>
        </TooltipProvider>
      </RealtimeBridge>
    </QueryClientProvider>
  );
}

export default App;
