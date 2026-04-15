import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GCThemeProvider, useGCTheme } from "./GCThemeProvider";
import { GCSidebar } from "./GCSidebar";
import { GCTopbar } from "./GCTopbar";
import { GCContent } from "./GCContent";

export interface GCShellProps {
  children: ReactNode; title?: string; subtitle?: string; actions?: ReactNode;
  sidebarVariant?: "hcms" | "ops"; activePath?: string; className?: string;
}

function GCShellInner({ children, title, subtitle, actions, sidebarVariant = "hcms", activePath = "", className }: GCShellProps) {
  const { theme } = useGCTheme();
  return (
    <div data-theme={theme} className={cn("gc-shell relative min-h-screen flex", className)}
      style={{ backgroundColor: "var(--gc-bg)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)" }}>
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50" style={{ background: "linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright))" }} />
      <GCSidebar variant={sidebarVariant} activePath={activePath} />
      <div className="flex-1 flex flex-col lg:ml-[240px]">
        <GCTopbar title={title} subtitle={subtitle} actions={actions} />
        <GCContent>{children}</GCContent>
      </div>
    </div>
  );
}

export function GCShell(props: GCShellProps) {
  return <GCThemeProvider><GCShellInner {...props} /></GCThemeProvider>;
}
