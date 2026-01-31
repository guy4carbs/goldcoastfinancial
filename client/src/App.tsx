import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { LindyChat } from "@/components/LindyChat";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
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
import AgentDashboard from "@/pages/agents/AgentDashboard";
import AgentLeads from "@/pages/agents/AgentLeads";
import AgentPipeline from "@/pages/agents/AgentPipeline";
import AgentEarnings from "@/pages/agents/AgentEarnings";
import AgentTraining from "@/pages/agents/AgentTraining";
import AgentChat from "@/pages/agents/AgentChat";
import AgentQuotes from "@/pages/agents/AgentQuotes";
import AgentScripts from "@/pages/agents/AgentScripts";
import AgentLeaderboard from "@/pages/agents/AgentLeaderboard";
import AgentAchievements from "@/pages/agents/AgentAchievements";
import AgentAnnouncements from "@/pages/agents/AgentAnnouncements";
import AgentSettings from "@/pages/agents/AgentSettings";
import AgentCalendar from "@/pages/agents/AgentCalendar";
import AgentHelp from "@/pages/agents/AgentHelp";
import AgentGettingStarted from "@/pages/agents/AgentGettingStarted";
import AgentGuidelines from "@/pages/agents/AgentGuidelines";
import AgentEmail from "@/pages/agents/AgentEmail";
// Study Resources
import AgentStudyFundamentals from "@/pages/agents/study/AgentStudyFundamentals";
import AgentStudyExamPrep from "@/pages/agents/study/AgentStudyExamPrep";
import AgentStudyPracticeExam from "@/pages/agents/study/AgentStudyPracticeExam";
import AgentStudyFlashcards from "@/pages/agents/study/AgentStudyFlashcards";
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
import { CelebrationProvider } from "@/lib/celebrationContext";
import { ConfirmProvider } from "@/components/agent/primitives/ConfirmDialog";
import { AnalyticsProvider } from "@/hooks/useAnalytics";

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
        <Route path="/agents/login" component={AgentLogin} />
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
        <Route path="/agents/leads">
          <AgentProtectedRoute>
            <AgentLeads />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/pipeline">
          <AgentProtectedRoute>
            <AgentPipeline />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/earnings">
          <AgentProtectedRoute>
            <AgentEarnings />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/training">
          <AgentProtectedRoute>
            <AgentTraining />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/chat">
          <AgentProtectedRoute>
            <AgentChat />
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
        <Route path="/agents/achievements">
          <AgentProtectedRoute>
            <AgentAchievements />
          </AgentProtectedRoute>
        </Route>
        <Route path="/agents/announcements">
          <AgentProtectedRoute>
            <AgentAnnouncements />
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
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/submissions">
          <ProtectedRoute>
            <AdminSubmissions />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/analytics">
          <ProtectedRoute>
            <AdminAnalytics />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/images">
          <ProtectedRoute>
            <AdminImages />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/videos">
          <ProtectedRoute>
            <AdminVideos />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/products">
          <ProtectedRoute>
            <AdminProducts />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/content">
          <ProtectedRoute>
            <AdminContent />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/content/blog/new">
          <ProtectedRoute>
            <AdminBlogEditor />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/content/blog/:id">
          <ProtectedRoute>
            <AdminBlogEditor />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/content/faqs/new">
          <ProtectedRoute>
            <AdminFAQEditor />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/content/faqs/:id">
          <ProtectedRoute>
            <AdminFAQEditor />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/content/pages/new">
          <ProtectedRoute>
            <AdminPageEditor />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/content/pages/:id">
          <ProtectedRoute>
            <AdminPageEditor />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/settings">
          <ProtectedRoute>
            <AdminSettings />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/testimonials">
          <ProtectedRoute>
            <AdminTestimonials />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/newsletter">
          <ProtectedRoute>
            <AdminNewsletter />
          </ProtectedRoute>
        </Route>
        <Route path="/admin">
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
