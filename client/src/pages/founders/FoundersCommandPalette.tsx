import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  DollarSign,
  Network,
  Workflow,
  TrendingUp,
  PieChart,
  Coins,
  Shield,
  Eye,
  Settings as SettingsIcon,
  ArrowRight,
  Users,
  Briefcase,
  Megaphone,
  Cog,
  Building2,
  Lightbulb,
  Crown,
  FileDown,
  LogOut,
  Sun,
  Moon,
  Gem,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useGCTheme } from "@/components/gc";
import { useToast } from "@/hooks/use-toast";
import { TOUR } from "@/lib/tour/selectors";

interface CommandAction {
  label: string;
  description?: string;
  icon: LucideIcon;
  shortcut?: string;
  run: () => void;
  keywords?: string[];
}

interface FoundersCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── NAV COMMANDS (13 founders pages) ───
const FOUNDERS_NAV: Array<{ label: string; path: string; icon: LucideIcon; keywords?: string[] }> = [
  { label: "Dashboard", path: "/founders", icon: LayoutDashboard, keywords: ["home", "overview"] },
  { label: "Revenue", path: "/founders/revenue", icon: DollarSign, keywords: ["commissions", "money"] },
  { label: "Hierarchy", path: "/founders/hierarchy", icon: Network, keywords: ["org", "tree"] },
  { label: "Growth", path: "/founders/growth", icon: TrendingUp, keywords: ["recruiting", "funnel"] },
  { label: "Book of Business", path: "/founders/book", icon: PieChart, keywords: ["clients", "policies", "drilldown"] },
  { label: "Team Performance", path: "/founders/team-performance", icon: Network, keywords: ["teams", "rankings", "trends"] },
  { label: "Lead Distribution", path: "/founders/lead-distribution", icon: Workflow, keywords: ["leads", "csv", "import", "distribute"] },
  { label: "Profit Split", path: "/founders/profit-split", icon: Coins, keywords: ["distribution", "founders", "owners", "split", "chase", "deposit"] },
  { label: "Lounge Access", path: "/founders/access", icon: Shield, keywords: ["members", "roles", "admin"] },
  { label: "View As", path: "/founders/view-as", icon: Eye, keywords: ["impersonate", "session"] },
  { label: "Settings", path: "/founders/settings", icon: SettingsIcon, keywords: ["prefs", "notifications"] },
];

// ─── CROSS-LOUNGE JUMPS (6) ───
const CROSS_LOUNGE: Array<{ label: string; path: string; icon: LucideIcon; keywords?: string[] }> = [
  { label: "HCMS Lounge", path: "/hcms", icon: Users, keywords: ["agents", "human"] },
  { label: "Finance Lounge", path: "/finance", icon: Briefcase, keywords: ["money", "commissions"] },
  { label: "Ops Lounge", path: "/ops", icon: Cog, keywords: ["operations"] },
  { label: "Investors Lounge", path: "/investors", icon: Building2, keywords: ["equity"] },
  { label: "Marketing Lounge", path: "/marketing", icon: Megaphone, keywords: ["campaigns", "leads"] },
  { label: "Executive Lounge", path: "/executive", icon: Lightbulb, keywords: ["exec", "heritage"] },
];

// ─── COMMAND PALETTE ───
export function FoundersCommandPalette({ open, onOpenChange }: FoundersCommandPaletteProps) {
  const [, navigate] = useLocation();
  const { theme, setTheme, themes } = useGCTheme();
  const { toast } = useToast();

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const cycleTheme = () => {
    const idx = themes.findIndex((t) => t.id === theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next.id);
    toast({ title: "Theme", description: `Switched to ${next.label}` });
    onOpenChange(false);
  };

  const doLogout = async () => {
    onOpenChange(false);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    window.location.href = "/login";
  };

  // ─── QUICK ACTIONS (5) ───
  const quickActions: CommandAction[] = [
    {
      label: "Start View-As Session",
      description: "Impersonate another user (read-only)",
      icon: PlayCircle,
      run: () => go("/founders/view-as"),
      keywords: ["impersonate", "session"],
    },
    {
      label: "Export Audit Log",
      description: "Download the founder audit log",
      icon: FileDown,
      run: () => go("/founders/settings#export"),
      keywords: ["audit", "export", "download"],
    },
    {
      label: `Toggle Theme (now: ${themes.find((t) => t.id === theme)?.label ?? theme})`,
      description: "Cycle Dark → Light → Maroon",
      icon: theme === "gc-light" ? Sun : theme === "gc-maroon" ? Gem : Moon,
      run: cycleTheme,
      keywords: ["theme", "dark", "light", "maroon"],
    },
    {
      label: "Log Out",
      description: "End this session",
      icon: LogOut,
      run: doLogout,
      keywords: ["logout", "signout"],
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search commands, pages, quick actions…" />
      <CommandList data-tour-id={TOUR.FOUNDERS.COMMAND_PALETTE.ROOT}>
        <CommandEmpty>No results.</CommandEmpty>

        <CommandGroup heading="Quick Actions" data-tour-id={TOUR.FOUNDERS.COMMAND_PALETTE.ACTIONS_GROUP}>
          {quickActions.map((qa) => (
            <CommandItem
              key={qa.label}
              value={`${qa.label} ${qa.description ?? ""} ${(qa.keywords ?? []).join(" ")}`}
              onSelect={qa.run}
            >
              <qa.icon className="mr-2" />
              <div className="flex flex-col">
                <span>{qa.label}</span>
                {qa.description && (
                  <span className="text-xs text-muted-foreground">{qa.description}</span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Founders Navigation" data-tour-id={TOUR.FOUNDERS.COMMAND_PALETTE.NAV_GROUP}>
          {FOUNDERS_NAV.map((item) => (
            <CommandItem
              key={item.path}
              value={`${item.label} ${(item.keywords ?? []).join(" ")} ${item.path}`}
              onSelect={() => go(item.path)}
            >
              <item.icon className="mr-2" />
              <span>{item.label}</span>
              <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                {item.path}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Cross-Lounge" data-tour-id={TOUR.FOUNDERS.COMMAND_PALETTE.CROSS_LOUNGE_GROUP}>
          {CROSS_LOUNGE.map((item) => (
            <CommandItem
              key={item.path}
              value={`${item.label} ${(item.keywords ?? []).join(" ")} ${item.path}`}
              onSelect={() => go(item.path)}
            >
              <item.icon className="mr-2" />
              <span>{item.label}</span>
              <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                <Crown className="w-3 h-3" style={{ color: "var(--gc-gold)" }} />
                {item.path}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// ─── HOOK: global Cmd+K listener ───
export function useFoundersCommandPaletteToggle(): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return [open, setOpen];
}
