import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminImages from "@/pages/AdminImages";
import AdminProducts from "@/pages/AdminProducts";
import AdminLogin from "@/pages/AdminLogin";
import RiskStrategy from "@/pages/RiskStrategy";
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
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
        <Route path="/life-insurance/term" component={TermLife} />
        <Route path="/life-insurance/term/coverage-calculator" component={CoverageCalculator} />
        <Route path="/life-insurance/term/term-lengths" component={TermLengths} />
        <Route path="/life-insurance/term/no-exam" component={NoExam} />
        <Route path="/life-insurance/term/conversion" component={Conversion} />
        <Route path="/life-insurance/term/return-of-premium" component={ReturnOfPremium} />
        <Route path="/life-insurance/whole" component={WholeLife} />
        <Route path="/life-insurance/final-expense" component={FinalExpense} />
        <Route path="/life-insurance/mortgage-protection" component={MortgageProtection} />
        <Route path="/life-insurance/iul" component={IUL} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin">
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/images">
          <ProtectedRoute>
            <AdminImages />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/products">
          <ProtectedRoute>
            <AdminProducts />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
