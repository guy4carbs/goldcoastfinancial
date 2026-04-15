import { GCShell } from "@/components/gc";
import type { ReactNode } from "react";

export function HCMSShell({ children, activePath }: { children: ReactNode; activePath: string }) {
  return (
    <GCShell title="HCMS" subtitle="Agent Contracting & Carrier Tracking" sidebarVariant="hcms" activePath={activePath}>
      {children}
    </GCShell>
  );
}

// Keep default export for backward compat with App.tsx — renders dashboard
import HCMSDashboard from "./HCMSDashboard";
export default function HCMSLayout() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms";
  return <HCMSShell activePath={path}><HCMSDashboard /></HCMSShell>;
}
