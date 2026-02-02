import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { LoadingScreen, NewsletterBanner } from "@/components/institutional";
import { usePageTracking, useScrollTracking } from "@/hooks/useAnalytics";
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

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top immediately when route changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Also reset scroll on the document element for better compatibility
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

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Main institutional pages */}
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
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnalyticsProvider>
          <LoadingScreen />
          <NewsletterBanner />
          <Toaster />
          <Router />
        </AnalyticsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
