import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GCThemeProvider, useGCTheme } from "./GCThemeProvider";
import { GCSidebar } from "./GCSidebar";
import type { SidebarVariant } from "./GCSidebar";
import { GCTopbar } from "./GCTopbar";
import { GCContent } from "./GCContent";

export interface GCShellProps {
  children: ReactNode; title?: string; subtitle?: string; actions?: ReactNode;
  sidebarVariant?: SidebarVariant; activePath?: string; className?: string;
  userName?: string; userEmail?: string;
}

function GCShellInner({ children, title, subtitle, actions, sidebarVariant = "hcms", activePath = "", className, userName, userEmail }: GCShellProps) {
  const { theme } = useGCTheme();
  return (
    <div data-theme={theme} className={cn("gc-shell relative min-h-screen flex", className)}
      style={{
        backgroundColor: "var(--gc-bg)",
        color: "var(--gc-text-primary)",
        fontFamily: "var(--gc-font-body)",
        // Offset the entire shell down by the global View-As banner height so
        // its sidebar/topbar don't sit underneath the fixed banner when the
        // founder is impersonating someone. Defaults to 0px when inactive.
        paddingTop: "var(--gc-global-viewas-banner-height, 0px)",
      }}>
      <div className="fixed left-0 right-0 h-[2px] z-50" style={{ top: "var(--gc-global-viewas-banner-height, 0px)", background: "linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright))" }} />
      <GCSidebar variant={sidebarVariant} activePath={activePath} userName={userName} userEmail={userEmail} />
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
