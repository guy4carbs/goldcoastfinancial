import { ReactNode, useEffect } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useAgentStore } from "@/lib/agentStore";

interface AgentProtectedRouteProps {
  children: ReactNode;
}

// DEV MODE: Set to true to bypass Firebase auth for testing
const DEV_BYPASS_AUTH = true;

export function AgentProtectedRoute({ children }: AgentProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { currentUser, login } = useAgentStore();

  // Dev bypass - auto-login with demo user on first render
  useEffect(() => {
    if (DEV_BYPASS_AUTH && !currentUser) {
      // Login with demo agent credentials
      login('sarah@goldcoastfnl.com', 'agent123');
    }
  }, [currentUser, login]);

  if (DEV_BYPASS_AUTH) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/agents/login" />;
  }

  return <>{children}</>;
}
