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
