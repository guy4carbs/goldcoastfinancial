import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Products from "@/pages/Products";
import GetQuote from "@/pages/GetQuote";
import Resources from "@/pages/Resources";
import Article from "@/pages/Article";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import ClientLogin from "@/pages/ClientLogin";
import ClientPortal from "@/pages/ClientPortal";
import Calculator from "@/pages/Calculator";
import Careers from "@/pages/Careers";
import AgentLogin from "@/pages/AgentLogin";
import AgentPortal from "@/pages/AgentPortal";
import ExecLogin from "@/pages/ExecLogin";
import ExecPortal from "@/pages/ExecPortal";
import ExecTasks from "@/pages/ExecTasks";
import ExecCalendar from "@/pages/ExecCalendar";
import Heritage from "@/pages/Heritage";
import HeritageAbout from "@/pages/heritage/HeritageAbout";
import HeritageProducts from "@/pages/heritage/HeritageProducts";
import HeritageResources from "@/pages/heritage/HeritageResources";
import HeritageContact from "@/pages/heritage/HeritageContact";
import HeritageCalculator from "@/pages/heritage/HeritageCalculator";
import HeritageGetQuote from "@/pages/heritage/HeritageGetQuote";
import HeritageArticle from "@/pages/heritage/HeritageArticle";
import HeritagePrivacy from "@/pages/heritage/HeritagePrivacy";
import HeritageCareers from "@/pages/heritage/HeritageCareers";
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
import InstitutionalMedia from "@/pages/institutional/InstitutionalMedia";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/products" component={Products} />
        <Route path="/get-quote" component={GetQuote} />
        <Route path="/resources" component={Resources} />
        <Route path="/resources/:slug" component={Article} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/client-login" component={ClientLogin} />
        <Route path="/client-portal" component={ClientPortal} />
        <Route path="/calculator" component={Calculator} />
        <Route path="/careers" component={Careers} />
        <Route path="/agent-login" component={AgentLogin} />
        <Route path="/agent" component={AgentPortal} />
        <Route path="/exec-login" component={ExecLogin} />
        <Route path="/exec" component={ExecPortal} />
        <Route path="/exec/tasks" component={ExecTasks} />
        <Route path="/exec/calendar" component={ExecCalendar} />
        <Route path="/heritage" component={Heritage} />
        <Route path="/heritage/about" component={HeritageAbout} />
        <Route path="/heritage/products" component={HeritageProducts} />
        <Route path="/heritage/resources" component={HeritageResources} />
        <Route path="/heritage/resources/:slug" component={HeritageArticle} />
        <Route path="/heritage/calculator" component={HeritageCalculator} />
        <Route path="/heritage/contact" component={HeritageContact} />
        <Route path="/heritage/get-quote" component={HeritageGetQuote} />
        <Route path="/heritage/privacy" component={HeritagePrivacy} />
        <Route path="/heritage/careers" component={HeritageCareers} />
        <Route path="/goldcoastfinancial2" component={InstitutionalHome} />
        <Route path="/goldcoastfinancial2/about" component={InstitutionalAbout} />
        <Route path="/goldcoastfinancial2/portfolio" component={InstitutionalPortfolio} />
        <Route path="/goldcoastfinancial2/contact" component={InstitutionalContact} />
        <Route path="/goldcoastfinancial2/news" component={InstitutionalNews} />
        <Route path="/goldcoastfinancial2/terms" component={InstitutionalTerms} />
        <Route path="/goldcoastfinancial2/privacy" component={InstitutionalPrivacy} />
        <Route path="/goldcoastfinancial2/investors" component={InstitutionalInvestors} />
        <Route path="/goldcoastfinancial2/careers" component={InstitutionalCareers} />
        <Route path="/goldcoastfinancial2/blog" component={InstitutionalBlog} />
        <Route path="/goldcoastfinancial2/blog/:slug" component={InstitutionalBlogArticle} />
        <Route path="/goldcoastfinancial2/media" component={InstitutionalMedia} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
