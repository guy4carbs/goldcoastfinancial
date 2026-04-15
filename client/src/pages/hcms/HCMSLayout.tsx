import { GCShell } from "@/components/gc";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--gc-bg)", color: "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)" }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

export function HCMSShell({ children, activePath }: { children: ReactNode; activePath: string }) {
  return (
    <AuthGate>
      <GCShell title="HCMS" subtitle="Agent Contracting & Carrier Tracking" sidebarVariant="hcms" activePath={activePath}>
        {children}
      </GCShell>
    </AuthGate>
  );
}

// Keep default export for backward compat with App.tsx — renders dashboard
import HCMSDashboard from "./HCMSDashboard";
export default function HCMSLayout() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms";
  return <HCMSShell activePath={path}><HCMSDashboard /></HCMSShell>;
}
