import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

interface AgentProtectedRouteProps {
  children: ReactNode;
}

export function AgentProtectedRoute({ children }: AgentProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-heritage-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
