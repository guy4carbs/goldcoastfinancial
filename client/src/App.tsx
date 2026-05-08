import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, lazy, Suspense } from "react";
import { LindyChat } from "@/components/LindyChat";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
const LLFGPage = lazy(() => import("@/pages/llfg"));
import SecureForm from "@/pages/SecureForm";
import QuoteView from "@/pages/QuoteView";
import ProductGuide from "@/pages/ProductGuide";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminImages from "@/pages/AdminImages";
import AdminVideos from "@/pages/AdminVideos";
import AdminProducts from "@/pages/AdminProducts";
import AdminSubmissions from "@/pages/AdminSubmissions";
import AdminAnalytics from "@/pages/AdminAnalytics";
import AdminContent from "@/pages/AdminContent";
import AdminBlogEditor from "@/pages/AdminBlogEditor";
import AdminFAQEditor from "@/pages/AdminFAQEditor";
import AdminPageEditor from "@/pages/AdminPageEditor";
import AdminLogin from "@/pages/AdminLogin";
import AdminSettings from "@/pages/AdminSettings";
import AdminTestimonials from "@/pages/AdminTestimonials";
import AdminNewsletter from "@/pages/AdminNewsletter";
import Unsubscribe from "@/pages/Unsubscribe";
import RiskStrategy from "@/pages/RiskStrategy";
import Products from "@/pages/Products";
import Quote from "@/pages/Quote";
import AboutUs from "@/pages/AboutUs";
import MeetFounders from "@/pages/MeetFounders";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import TermLife from "@/pages/TermLife";
import WholeLife from "@/pages/WholeLife";
import FinalExpense from "@/pages/FinalExpense";
import MortgageProtection from "@/pages/MortgageProtection";
import IUL from "@/pages/IUL";
// Term Life Sub-pages
import CoverageCalculator from "@/pages/term/CoverageCalculator";
import TermLengths from "@/pages/term/TermLengths";
import NoExam from "@/pages/term/NoExam";
import Conversion from "@/pages/term/Conversion";
import ReturnOfPremium from "@/pages/term/ReturnOfPremium";
// Whole Life Sub-pages
import CashValue from "@/pages/whole/CashValue";
import Dividends from "@/pages/whole/Dividends";
import PolicyLoans from "@/pages/whole/PolicyLoans";
import EstatePlanning from "@/pages/whole/EstatePlanning";
import PaidUpAdditions from "@/pages/whole/PaidUpAdditions";
// Final Expense Sub-pages
import GuaranteedIssue from "@/pages/final-expense/GuaranteedIssue";
import SimplifiedIssue from "@/pages/final-expense/SimplifiedIssue";
import GradedBenefits from "@/pages/final-expense/GradedBenefits";
import PrePlanning from "@/pages/final-expense/PrePlanning";
import Seniors from "@/pages/final-expense/Seniors";
// Mortgage Protection Sub-pages
import DecreasingVsLevel from "@/pages/mortgage-protection/DecreasingVsLevel";
import MortgageROP from "@/pages/mortgage-protection/MortgageROP";
import LivingBenefits from "@/pages/mortgage-protection/LivingBenefits";
import JointCoverage from "@/pages/mortgage-protection/JointCoverage";
import NewHomeowners from "@/pages/mortgage-protection/NewHomeowners";
// IUL Sub-pages
import IndexCrediting from "@/pages/iul/IndexCrediting";
import CapsAndFloors from "@/pages/iul/CapsAndFloors";
import IULRetirementIncome from "@/pages/iul/RetirementIncome";
import MaxFunding from "@/pages/iul/MaxFunding";
import IndexOptions from "@/pages/iul/IndexOptions";
// Carrier Pages
import CarrierPage from "@/pages/CarrierPage";
// Annuity Pages
import FixedAnnuities from "@/pages/annuities/FixedAnnuities";
import IndexedAnnuities from "@/pages/annuities/IndexedAnnuities";
import AnnuityRetirementIncome from "@/pages/annuities/RetirementIncome";
// Resource Pages
import Blog from "@/pages/resources/Blog";
import BlogPost from "@/pages/resources/BlogPost";
import LifeInsurance101 from "@/pages/resources/LifeInsurance101";
import FAQs from "@/pages/resources/FAQs";
import Calculators from "@/pages/resources/Calculators";
// Agent Pages
import BecomeAgent from "@/pages/agents/BecomeAgent";
import AgentResources from "@/pages/agents/AgentResources";
import AgentLogin from "@/pages/agents/AgentLogin";
import ResetPassword from "@/pages/ResetPassword";
import AgentRegister from "@/pages/agents/AgentRegister";
import AgentDashboard from "@/pages/agents/AgentDashboard";
import AgentPerformance from "@/pages/agents/AgentPerformance";
import AgentChat from "@/pages/agents/AgentChat";
import AgentQuotes from "@/pages/agents/AgentQuotes";
import AgentScripts from "@/pages/agents/AgentScripts";
import AgentLeaderboard from "@/pages/agents/AgentLeaderboard";
import AgentDeals from "@/pages/agents/AgentDeals";
import AgentLeadMarketplace from "@/pages/agents/AgentLeadMarketplace";
import AgentBusinessCard from "@/pages/agents/AgentBusinessCard";
import PublicBusinessCard from "@/pages/PublicBusinessCard";
import AgentAchievements from "@/pages/agents/AgentAchievements";
import AgentSettings from "@/pages/agents/AgentSettings";
import AgentCalendar from "@/pages/agents/AgentCalendar";
import AgentHelp from "@/pages/agents/AgentHelp";
import AgentGettingStarted from "@/pages/agents/AgentGettingStarted";
import AgentGuidelines from "@/pages/agents/AgentGuidelines";
import AgentTrainingSessions from "@/pages/agents/AgentTrainingSessions";
import AgentEmail from "@/pages/agents/AgentEmail";
import AgentCommunications from "@/pages/agents/AgentCommunications";
import AgentDialer from "@/pages/agents/AgentDialer";
import AgentHierarchy from "@/pages/agents/AgentHierarchy";
import AgentCommissions from "@/pages/agents/AgentCommissions";
// Study Resources
import AgentStudyFundamentals from "@/pages/agents/study/AgentStudyFundamentals";
import AgentStudyExamPrep from "@/pages/agents/study/AgentStudyExamPrep";
import AgentStudyPracticeExam from "@/pages/agents/study/AgentStudyPracticeExam";
import AgentStudyFlashcards from "@/pages/agents/study/AgentStudyFlashcards";
import AgentAvatarCouncil from "@/pages/agents/AgentAvatarCouncil";
import AgentLeadInbox from "@/pages/agents/AgentLeadInbox";
import AgentDataEncryption from "@/pages/agents/AgentDataEncryption";
import AgentMemberCards from "@/pages/agents/AgentMemberCards";
// Onboarding Lounge Pages
import OnboardingDashboard from "@/pages/onboarding/OnboardingDashboard";
import OnboardingDay1 from "@/pages/onboarding/OnboardingDay1";
import OnboardingDay2 from "@/pages/onboarding/OnboardingDay2";
import OnboardingDays3to7 from "@/pages/onboarding/OnboardingDays3to7";
import OnboardingDays8to30 from "@/pages/onboarding/OnboardingDays8to30";

import OnboardingHelp from "@/pages/onboarding/OnboardingHelp";
import AgentOnboarding from "@/pages/agents/AgentOnboarding";
import AgentWorkflowBuilder from "@/pages/agents/AgentWorkflowBuilder";
import AgentIdeas from "@/pages/agents/AgentIdeas";
import AgentBookOfBusiness from "@/pages/agents/AgentBookOfBusiness";
import AgentRecruiting from "@/pages/agents/AgentRecruiting";
import AgentClaims from "@/pages/agents/AgentClaims";
import AgentClients from "@/pages/agents/AgentClients";
import AgentClientDetail from "@/pages/agents/AgentClientDetail";
// Onboarding Study Resources
import StudyFundamentals from "@/pages/onboarding/StudyFundamentals";
import StudyPracticeExam from "@/pages/onboarding/StudyPracticeExam";
import StudyFlashcards from "@/pages/onboarding/StudyFlashcards";
import StudyCourse from "@/pages/onboarding/StudyCourse";
import BookAppointment from "@/pages/BookAppointment";
import RecruitmentPage from "@/pages/RecruitmentPage";
import AgentSite from "@/pages/AgentSite";
import AgentWebsite from "@/pages/agents/AgentWebsite";
import ReferralLandingPage from "@/pages/ReferralLandingPage";
import { AgentOnboardingIntake } from "@/pages/onboarding-intake";
import AdminAvatarCouncil from "@/pages/admin/AdminAvatarCouncil";
import AgentOps from "@/pages/admin/AgentOps";
import AdminMemberDirectory from "@/pages/admin/AdminMemberDirectory";
import AdminLeadRevenue from "@/pages/admin/AdminLeadRevenue";
// 2FA Pages
import TwoFactorSetup from "@/pages/ai/TwoFactorSetup";
import TwoFactorVerify from "@/pages/ai/TwoFactorVerify";
// Lounge Pages
import { AIDashboard } from "@/pages/ai";
import {
  ManagerDashboard,
  ManagerTeam,
  ManagerPipeline,
  ManagerPerformance,
  ManagerTraining,
  ManagerCoaching,
  ManagerEscalations,
  ManagerReports,
  ManagerCommunications,
  ManagerSettings,
  ManagerAlerts,
  ManagerScorecard,
  ManagerLeaderboard,
  ManagerApprovals,
  ManagerDirectorOverview,
  ManagerForecasting,
  ManagerCommissions,
  ManagerOneOnOnes,
  ManagerGoals,
  ManagerOnboardingTracker,
  ManagerClientHealth,
  ManagerTeamPerformance,
  ManagerMeetingsDev,
  ManagerComplianceHub,
  ManagerGuide,
  ManagerLeadDistribution,
  ManagerHierarchy,
  ManagerActivityMonitor,
} from "@/pages/manager";
import {
  ExecutiveDashboard,
  ExecutiveKPIs,
  ExecutiveRevenue,
  ExecutiveCommissions,
  ExecutiveSales,
  ExecutivePipeline,
  ExecutiveRecruiting,
  ExecutiveRecruitingPipeline,
  ExecutiveTeamPerformance,
  ExecutiveHierarchy,
  ExecutiveGrowthAnalytics,
  ExecutiveReports,
  ExecutiveInvestorView,
  ExecutiveAgentManagement,
  ExecutiveAgencyManagement,
  ExecutiveSettings,
  ExecutiveSupport,
  ExecutiveLoungeAccess,
  ExecutiveBookOfBusiness,
  ExecutiveLeadDistribution,
  ExecutiveCallMonitoring,
  ExecutiveLeadRevenue,
} from "@/pages/executive";
import { LobbyLanding, CRMDashboard, ContactDatabase, PipelineBoard, LeadProfile, ImportExport, ClientManagement, SegmentsTags, ActivityHistory } from "@/pages/crm";
import { MarketingDashboard } from "@/pages/marketing";
import { PortalDashboard } from "@/pages/portal";
import {
  ClientDashboard,
  ClientPolicies,
  ClientPolicyDetail,
  ClientDocuments,
  ClientMessages,
  ClientBilling,
  ClientClaims,
  ClientAppointments,
  ClientBeneficiaries,
  ClientProfile,
  ClientHelp,
  ClientReferral,
  ClientLogin,
  ClientSignup,
  ClientTwoFactor,
  ClientSetupPassword,
} from "@/pages/client";
// Legal Pages
import TermsOfUse from "@/pages/legal/TermsOfUse";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import DataSecurity from "@/pages/legal/DataSecurity";
import Accessibility from "@/pages/legal/Accessibility";
import Licenses from "@/pages/legal/Licenses";
import DoNotSell from "@/pages/legal/DoNotSell";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AgentProtectedRoute } from "@/components/AgentProtectedRoute";
import { RoleProtectedRoute, SuperAdminRoute, AdminRoute, StaffRoute } from "@/components/auth/RoleProtectedRoute";
import { Roles, RoleGroups } from "@/types/permissions";
import { CelebrationProvider } from "@/lib/celebrationContext";
import { ConfirmProvider } from "@/components/agent/primitives/ConfirmDialog";
import { AnalyticsProvider } from "@/hooks/useAnalytics";
import { WebSocketProvider } from "@/providers/WebSocketProvider";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Only scroll to top if there's no hash in the URL
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  // Also scroll to top on initial mount if no hash
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/secure/form/:id" component={SecureForm} />
        <Route path="/quotes/view/:id" component={QuoteView} />
        <Route path="/guides/view/:linkId" component={ProductGuide} />
        <Route path="/book/:agentSlug" component={BookAppointment} />
        <Route path="/recruit/:agentSlug" component={RecruitmentPage} />
        <Route path="/a/:agentSlug" component={AgentSite} />
        <Route path="/card/:agentId" component={PublicBusinessCard} />
        <Route path="/refer/:clientId" component={ReferralLandingPage} />
        <Route path="/refer" component={ReferralLandingPage} />
        <Route path="/llfg">
          <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
            <LLFGPage />
          </Suspense>
        </Route>
        <Route path="/quote" component={Quote} />
        <Route path="/about" component={AboutUs} />
        <Route path="/about/founders" component={MeetFounders} />
        <Route path="/careers" component={Careers} />
        <Route path="/contact" component={Contact} />
        <Route path="/risk-strategy" component={RiskStrategy} />
        <Route path="/products" component={Products} />
        <Route path="/carriers/:slug" component={CarrierPage} />
        <Route path="/life-insurance/term" component={TermLife} />
        <Route path="/life-insurance/term/coverage-calculator" component={CoverageCalculator} />
        <Route path="/life-insurance/term/term-lengths" component={TermLengths} />
        <Route path="/life-insurance/term/no-exam" component={NoExam} />
        <Route path="/life-insurance/term/conversion" component={Conversion} />
        <Route path="/life-insurance/term/return-of-premium" component={ReturnOfPremium} />
        <Route path="/life-insurance/whole" component={WholeLife} />
        <Route path="/life-insurance/whole/cash-value" component={CashValue} />
        <Route path="/life-insurance/whole/dividends" component={Dividends} />
        <Route path="/life-insurance/whole/policy-loans" component={PolicyLoans} />
        <Route path="/life-insurance/whole/estate-planning" component={EstatePlanning} />
        <Route path="/life-insurance/whole/paid-up-additions" component={PaidUpAdditions} />
        <Route path="/life-insurance/final-expense" component={FinalExpense} />
        <Route path="/life-insurance/final-expense/guaranteed-issue" component={GuaranteedIssue} />
        <Route path="/life-insurance/final-expense/simplified-issue" component={SimplifiedIssue} />
        <Route path="/life-insurance/final-expense/graded-benefits" component={GradedBenefits} />
        <Route path="/life-insurance/final-expense/pre-planning" component={PrePlanning} />
        <Route path="/life-insurance/final-expense/seniors" component={Seniors} />
        <Route path="/life-insurance/mortgage-protection" component={MortgageProtection} />
        <Route path="/life-insurance/mortgage-protection/decreasing-vs-level" component={DecreasingVsLevel} />
        <Route path="/life-insurance/mortgage-protection/return-of-premium" component={MortgageROP} />
        <Route path="/life-insurance/mortgage-protection/living-benefits" component={LivingBenefits} />
        <Route path="/life-insurance/mortgage-protection/joint-coverage" component={JointCoverage} />
        <Route path="/life-insurance/mortgage-protection/new-homeowners" component={NewHomeowners} />
        <Route path="/life-insurance/iul" component={IUL} />
        <Route path="/life-insurance/iul/index-crediting" component={IndexCrediting} />
        <Route path="/life-insurance/iul/caps-and-floors" component={CapsAndFloors} />
        <Route path="/life-insurance/iul/retirement-income" component={IULRetirementIncome} />
        <Route path="/life-insurance/iul/max-funding" component={MaxFunding} />
        <Route path="/life-insurance/iul/index-options" component={IndexOptions} />
        <Route path="/annuities/fixed" component={FixedAnnuities} />
        <Route path="/annuities/indexed" component={IndexedAnnuities} />
        <Route path="/annuities/retirement-income" component={AnnuityRetirementIncome} />
        <Route path="/resources/blog" component={Blog} />
        <Route path="/resources/blog/:slug" component={BlogPost} />
        <Route path="/resources/life-insurance-101" component={LifeInsurance101} />
        <Route path="/resources/faqs" component={FAQs} />
        <Route path="/resources/calculators" component={Calculators} />
        <Route path="/agents/become-an-agent" component={BecomeAgent} />
        <Route path="/onboarding-intake" component={AgentOnboardingIntake} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/agents/login" component={AgentLogin} />
        <Route path="/agents/register" component={AgentRegister} />
        <Route path="/agents/dashboard">
          <AgentProtectedRoute>
            <AgentDashboard />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/calendar">
          <AgentProtectedRoute>
            <AgentCalendar />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/performance">
          <AgentProtectedRoute>
            <AgentPerformance />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/chat">
          <AgentProtectedRoute>
            <AgentChat />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/dialer">
          <AgentProtectedRoute>
            <AgentDialer />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/communications">
          <AgentProtectedRoute>
            <AgentCommunications />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/hierarchy">
          <AgentProtectedRoute>
            <AgentHierarchy />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/commissions">
          <AgentProtectedRoute>
            <AgentCommissions />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/quotes">
          <AgentProtectedRoute>
            <AgentQuotes />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/scripts">
          <AgentProtectedRoute>
            <AgentScripts />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/leaderboard">
          <AgentProtectedRoute>
            <AgentLeaderboard />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/deals">
          <AgentProtectedRoute>
            <AgentDeals />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/lead-marketplace">
          <AgentProtectedRoute>
            <AgentLeadMarketplace />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/business-card">
          <AgentProtectedRoute>
            <AgentBusinessCard />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/achievements">
          <AgentProtectedRoute>
            <AgentAchievements />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/website">
          <AgentProtectedRoute>
            <AgentWebsite />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/settings">
          <AgentProtectedRoute>
            <AgentSettings />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/resources">
          <AgentProtectedRoute>
            <AgentResources />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/help">
          <AgentProtectedRoute>
            <AgentHelp />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/getting-started">
          <AgentProtectedRoute>
            <AgentGettingStarted />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/guidelines">
          <AgentProtectedRoute>
            <AgentGuidelines />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/training-sessions">
          <AgentProtectedRoute>
            <AgentTrainingSessions />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/email">
          <AgentProtectedRoute>
            <AgentEmail />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/study/fundamentals">
          <AgentProtectedRoute>
            <AgentStudyFundamentals />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/study/exam-prep">
          <AgentProtectedRoute>
            <AgentStudyExamPrep />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/study/practice-exam">
          <AgentProtectedRoute>
            <AgentStudyPracticeExam />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/study/flashcards">
          <AgentProtectedRoute>
            <AgentStudyFlashcards />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/avatar-council">
          <AgentProtectedRoute>
            <AgentAvatarCouncil />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/inbox">
          <AgentProtectedRoute>
            <AgentLeadInbox />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/data-encryption">
          <AgentProtectedRoute>
            <AgentDataEncryption />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/member-cards">
          <AgentProtectedRoute>
            <AgentMemberCards />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/workflows/new">
          <AgentProtectedRoute>
            <AgentWorkflowBuilder />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/workflows/:workflowId">
          <AgentProtectedRoute>
            <AgentWorkflowBuilder />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/ideas">
          <AgentProtectedRoute>
            <AgentIdeas />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/book-of-business">
          <AgentProtectedRoute>
            <AgentBookOfBusiness />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/claims">
          <AgentProtectedRoute>
            <AgentClaims />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/clients/:clientId">
          <AgentProtectedRoute>
            <AgentClientDetail />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/clients">
          <AgentProtectedRoute>
            <AgentClients />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/recruiting">
          <AgentProtectedRoute>
            <AgentRecruiting />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/onboarding/resources">
          <AgentProtectedRoute>
            <AgentOnboarding />
          </AgentProtectedRoute>
        </Route>

        {/* New Agent Onboarding Lounge Routes */}
        <Route path="/agents/onboarding/lounge">
          <AgentProtectedRoute>
            <OnboardingDashboard />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/onboarding/day-1">
          <AgentProtectedRoute>
            <OnboardingDay1 />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/onboarding/day-2">
          <AgentProtectedRoute>
            <OnboardingDay2 />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/onboarding/days-3-7">
          <AgentProtectedRoute>
            <OnboardingDays3to7 />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/onboarding/days-8-30">
          <AgentProtectedRoute>
            <OnboardingDays8to30 />
          </AgentProtectedRoute>
        </Route>

        {/* Onboarding Study Resources */}
        <Route path="/agents/onboarding/study/fundamentals">
          <AgentProtectedRoute>
            <StudyFundamentals />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/onboarding/study/practice-exam">
          <AgentProtectedRoute>
            <StudyPracticeExam />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/onboarding/study/flashcards">
          <AgentProtectedRoute>
            <StudyFlashcards />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/onboarding/study/course">
          <AgentProtectedRoute>
            <StudyCourse />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/onboarding/help">
          <AgentProtectedRoute>
            <OnboardingHelp />
          </AgentProtectedRoute>
        </Route>

        {/* Two-Factor Authentication Routes */}
        <Route path="/ai/2fa-setup" component={TwoFactorSetup} />
        <Route path="/ai/2fa-verify" component={TwoFactorVerify} />

        {/* ═══════════════════════════════════════════════════════════════════
            LOUNGE ROUTES - Role-protected access to each lounge
        ═══════════════════════════════════════════════════════════════════ */}

        {/* AI Lounge - Super Admin only with 2FA */}
        <Route path="/ai/dashboard">
          <RoleProtectedRoute
            allowedRoles={RoleGroups.ADMINS}
            require2FA={true}
            loungeKey="ai_lounge"
          >
            <AIDashboard />
          </RoleProtectedRoute>
        </Route>
        <Route path="/ai/:rest*">
          <RoleProtectedRoute
            allowedRoles={RoleGroups.ADMINS}
            require2FA={true}
            loungeKey="ai_lounge"
          >
            <AIDashboard />
          </RoleProtectedRoute>
        </Route>

        {/* Manager Lounge - Manager and above */}
        <Route path="/manager/dashboard">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerDashboard />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/team">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerTeam />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/pipeline">
          <Redirect to="/manager/commissions" />
        </Route>
        <Route path="/manager/performance">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerPerformance />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/training">
          <Redirect to="/manager/compliance" />
        </Route>
        <Route path="/manager/coaching">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerCoaching />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/escalations">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerEscalations />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/reports">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerReports />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/communications">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerCommunications />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/lead-distribution">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerLeadDistribution />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/settings">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerSettings />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/guide">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerGuide />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/alerts">
          <Redirect to="/manager/escalations" />
        </Route>
        <Route path="/manager/scorecard/:id?">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerScorecard />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/leaderboard">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerLeaderboard />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/team-performance">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerTeamPerformance />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/development">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerMeetingsDev />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/compliance">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerComplianceHub />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/approvals">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerApprovals />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/director">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerDirectorOverview />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/forecasting">
          <Redirect to="/manager/commissions" />
        </Route>
        <Route path="/manager/activity-monitor">
          <ManagerActivityMonitor />
        </Route>
        <Route path="/manager/commissions">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerCommissions />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/one-on-ones">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerOneOnOnes />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/goals">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerGoals />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/onboarding-tracker">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerOnboardingTracker />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/client-health">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerClientHealth />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/hierarchy">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerHierarchy />
          </RoleProtectedRoute>
        </Route>
        <Route path="/manager/:rest*">
          <RoleProtectedRoute allowedRoles={RoleGroups.MANAGEMENT} loungeKey="manager_lounge">
            <ManagerDashboard />
          </RoleProtectedRoute>
        </Route>

        {/* Executive Lounge - Owner/Admin/Investor */}
        <Route path="/executive/dashboard">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveDashboard />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/kpis">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveKPIs />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/revenue">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveRevenue />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/commissions">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveCommissions />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/sales">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveSales />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/pipeline">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutivePipeline />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/recruiting">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveRecruiting />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/recruiting-pipeline">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveRecruitingPipeline />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/team">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveTeamPerformance />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/hierarchy">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveHierarchy />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/growth">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveGrowthAnalytics />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/reports">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveReports />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/investor">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveInvestorView />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/agent-management">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveAgentManagement />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/agency-management">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveAgencyManagement />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/lounge-access">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS}>
            <ExecutiveLoungeAccess />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/book-of-business">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveBookOfBusiness />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/lead-distribution">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveLeadDistribution />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/settings">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveSettings />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/support">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveSupport />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/call-monitoring">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveCallMonitoring />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/lead-revenue">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveLeadRevenue />
          </RoleProtectedRoute>
        </Route>
        <Route path="/executive/:rest*">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.INVESTOR]} loungeKey="executive_lounge">
            <ExecutiveDashboard />
          </RoleProtectedRoute>
        </Route>

        {/* CRM Lobby - The welcoming entrance (accessible to all authenticated employees) */}
        <Route path="/crm">
          <RoleProtectedRoute allowedRoles={RoleGroups.STAFF}>
            <LobbyLanding />
          </RoleProtectedRoute>
        </Route>
        <Route path="/crm/dashboard">
          <RoleProtectedRoute allowedRoles={RoleGroups.STAFF}>
            <CRMDashboard />
          </RoleProtectedRoute>
        </Route>
        <Route path="/crm/contacts">
          <RoleProtectedRoute allowedRoles={RoleGroups.STAFF}>
            <ContactDatabase />
          </RoleProtectedRoute>
        </Route>
        <Route path="/crm/pipeline">
          <RoleProtectedRoute allowedRoles={RoleGroups.STAFF}>
            <PipelineBoard />
          </RoleProtectedRoute>
        </Route>
        <Route path="/crm/leads/:id">
          <RoleProtectedRoute allowedRoles={RoleGroups.STAFF}>
            <LeadProfile />
          </RoleProtectedRoute>
        </Route>
        <Route path="/crm/clients">
          <RoleProtectedRoute allowedRoles={RoleGroups.STAFF}>
            <ClientManagement />
          </RoleProtectedRoute>
        </Route>
        <Route path="/crm/segments">
          <RoleProtectedRoute allowedRoles={RoleGroups.STAFF}>
            <SegmentsTags />
          </RoleProtectedRoute>
        </Route>
        <Route path="/crm/history">
          <RoleProtectedRoute allowedRoles={RoleGroups.STAFF}>
            <ActivityHistory />
          </RoleProtectedRoute>
        </Route>
        <Route path="/crm/:rest*">
          <RoleProtectedRoute allowedRoles={RoleGroups.STAFF}>
            <LobbyLanding />
          </RoleProtectedRoute>
        </Route>

        {/* Marketing Lounge - Marketing staff and above */}
        <Route path="/marketing/dashboard">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.DIRECTOR, Roles.AGENCY_MANAGER, Roles.MARKETING_STAFF]} loungeKey="marketing_lounge">
            <MarketingDashboard />
          </RoleProtectedRoute>
        </Route>
        <Route path="/marketing/:rest*">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.DIRECTOR, Roles.AGENCY_MANAGER, Roles.MARKETING_STAFF]} loungeKey="marketing_lounge">
            <MarketingDashboard />
          </RoleProtectedRoute>
        </Route>

        {/* Legacy Client Portal - Redirect to new Client Lounge */}
        <Route path="/portal/dashboard">
          <Redirect to="/client/dashboard" />
        </Route>
        <Route path="/portal/:rest*">
          <Redirect to="/client/dashboard" />
        </Route>

        {/* ═══════════════════════════════════════════════════════════════════
            CLIENT LOUNGE ROUTES
        ═══════════════════════════════════════════════════════════════════ */}

        {/* Client Auth - Public */}
        <Route path="/client/login" component={ClientLogin} />
        <Route path="/client/signup" component={ClientSignup} />
        <Route path="/client/setup-password" component={ClientSetupPassword} />
        <Route path="/client/2fa-verify" component={ClientTwoFactor} />
        <Route path="/client/2fa-setup" component={ClientTwoFactor} />

        {/* Client Lounge - Protected */}
        <Route path="/client/dashboard">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientDashboard />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/policies/:id">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientPolicyDetail />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/policies">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientPolicies />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/documents">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientDocuments />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/beneficiaries">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientBeneficiaries />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/billing">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientBilling />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/claims">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientClaims />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/messages">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientMessages />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/appointments">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientAppointments />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/referral">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientReferral />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/profile">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientProfile />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/settings">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientProfile />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/help">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientHelp />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/support">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientHelp />
          </RoleProtectedRoute>
        </Route>
        <Route path="/client/:rest*">
          <RoleProtectedRoute allowedRoles={[Roles.FOUNDER, Roles.CLIENT, Roles.OWNER, Roles.SYSTEM_ADMIN]}>
            <ClientDashboard />
          </RoleProtectedRoute>
        </Route>

        {/* ═══════════════════════════════════════════════════════════════════
            ADMIN ROUTES
        ═══════════════════════════════════════════════════════════════════ */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/submissions">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminSubmissions />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/analytics">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminAnalytics />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/images">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminImages />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/videos">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminVideos />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/products">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminProducts />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/content">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminContent />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/content/blog/new">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminBlogEditor />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/content/blog/:id">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminBlogEditor />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/content/faqs/new">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminFAQEditor />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/content/faqs/:id">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminFAQEditor />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/content/pages/new">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminPageEditor />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/content/pages/:id">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminPageEditor />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/settings">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminSettings />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/testimonials">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminTestimonials />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/newsletter">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminNewsletter />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/avatar-council">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminAvatarCouncil />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/agent-ops">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AgentOps />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/members">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminMemberDirectory />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin/lead-revenue">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminLeadRevenue />
          </RoleProtectedRoute>
        </Route>
        <Route path="/admin">
          <RoleProtectedRoute allowedRoles={RoleGroups.ADMINS} loungeKey="admin_panel">
            <AdminDashboard />
          </RoleProtectedRoute>
        </Route>
        <Route path="/legal/terms" component={TermsOfUse} />
        <Route path="/legal/privacy" component={PrivacyPolicy} />
        <Route path="/legal/data-security" component={DataSecurity} />
        <Route path="/legal/accessibility" component={Accessibility} />
        <Route path="/legal/licenses" component={Licenses} />
        <Route path="/legal/do-not-sell" component={DoNotSell} />
        <Route path="/unsubscribe/:token" component={Unsubscribe} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <SiteSettingsProvider>
            <CelebrationProvider>
              <ConfirmProvider>
                <TooltipProvider>
                  <AnalyticsProvider>
                    <Toaster />
                    <Router />
                    <LindyChat />
                  </AnalyticsProvider>
                </TooltipProvider>
              </ConfirmProvider>
            </CelebrationProvider>
          </SiteSettingsProvider>
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
