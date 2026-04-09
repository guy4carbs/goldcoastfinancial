import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home, BarChart3, Inbox, Calendar, Briefcase, Handshake,
  Users, ClipboardList, CreditCard, Contact, Globe,
  Phone, MessageSquare, BookOpen, UserPlus,
  FileText, Shield, FolderOpen, Bot,
  Trophy, Star, Network, DollarSign, ShoppingBag, GraduationCap,
  ClipboardCheck, Lightbulb,
  Search, Settings, HelpCircle, LogOut,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tab: string) => void;
  onAction: (action: string) => void;
  theme: 'light' | 'dark';
}

export function CommandPalette({ open, onOpenChange, onNavigate, onAction }: CommandPaletteProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const onClose = useCallback(() => {
    onOpenChange(false);
    setSearchQuery("");
    setSearchResults([]);
  }, [onOpenChange]);

  const go = useCallback((path: string) => {
    onClose();
    setLocation(path);
  }, [onClose, setLocation]);

  // Debounced API search for leads + clients
  useEffect(() => {
    if (searchQuery.length < 3) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const results: any[] = [];
        const [leadsRes, clientsRes] = await Promise.all([
          fetch(`/api/lead-distribution/inbox?search=${encodeURIComponent(searchQuery)}&limit=5`, { credentials: 'include' }),
          fetch(`/api/agent-clients?search=${encodeURIComponent(searchQuery)}`, { credentials: 'include' }),
        ]);
        const leadsData = await leadsRes.json();
        const clientsData = await clientsRes.json();

        if (leadsData?.data?.length) {
          for (const l of leadsData.data.slice(0, 3)) {
            results.push({
              id: `lead-${l.id}`,
              label: `${l.first_name || l.firstName || ''} ${l.last_name || l.lastName || ''}`.trim() || l.email,
              sub: l.phone || l.email || 'Lead',
              type: 'Lead',
              path: '/agents/inbox',
            });
          }
        }
        if (Array.isArray(clientsData)) {
          for (const c of clientsData.slice(0, 3)) {
            results.push({
              id: `client-${c.id}`,
              label: `${c.firstName || c.first_name || ''} ${c.lastName || c.last_name || ''}`.trim(),
              sub: c.email || 'Client',
              type: 'Client',
              path: `/agents/clients/${c.id}`,
            });
          }
        }
        setSearchResults(results);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => { if (!open) { setSearchQuery(""); setSearchResults([]); } }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, leads, clients..." onValueChange={setSearchQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {searchResults.length > 0 && (
          <CommandGroup heading="Search Results">
            {searchResults.map(r => (
              <CommandItem key={r.id} value={`${r.label} ${r.sub} ${r.type}`} onSelect={() => go(r.path)}>
                <Search className="mr-2 h-4 w-4 text-violet-500" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{r.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{r.sub}</span>
                </div>
                <span className="ml-auto text-[10px] font-medium text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">{r.type}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {searchResults.length > 0 && <CommandSeparator />}

        <CommandGroup heading="Command Center">
          <CommandItem value="Dashboard home overview" onSelect={() => go('/agents/dashboard')}>
            <Home className="mr-2 h-4 w-4" /><span>Dashboard</span>
          </CommandItem>
          <CommandItem value="Performance metrics stats analytics" onSelect={() => go('/agents/performance')}>
            <BarChart3 className="mr-2 h-4 w-4" /><span>Performance</span>
          </CommandItem>
          <CommandItem value="Lead Inbox leads pipeline prospects" onSelect={() => go('/agents/inbox')}>
            <Inbox className="mr-2 h-4 w-4" /><span>Lead Inbox</span>
          </CommandItem>
          <CommandItem value="Calendar events appointments schedule" onSelect={() => go('/agents/calendar')}>
            <Calendar className="mr-2 h-4 w-4" /><span>Calendar</span>
          </CommandItem>
          <CommandItem value="Book of Business policies clients portfolio" onSelect={() => go('/agents/book-of-business')}>
            <Briefcase className="mr-2 h-4 w-4" /><span>Book of Business</span>
          </CommandItem>
          <CommandItem value="Agency Deals submissions sales AP" onSelect={() => go('/agents/deals')}>
            <Handshake className="mr-2 h-4 w-4" /><span>Agency Deals</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Clients">
          <CommandItem value="My Clients client management" onSelect={() => go('/agents/clients')}>
            <Users className="mr-2 h-4 w-4" /><span>My Clients</span>
          </CommandItem>
          <CommandItem value="Claims benefit filing tracking" onSelect={() => go('/agents/claims')}>
            <ClipboardList className="mr-2 h-4 w-4" /><span>Claims</span>
          </CommandItem>
          <CommandItem value="Member Cards digital insurance card" onSelect={() => go('/agents/member-cards')}>
            <CreditCard className="mr-2 h-4 w-4" /><span>Member Cards</span>
          </CommandItem>
          <CommandItem value="Business Card contact sharing" onSelect={() => go('/agents/business-card')}>
            <Contact className="mr-2 h-4 w-4" /><span>Business Card</span>
          </CommandItem>
          <CommandItem value="Your Website agent landing page" onSelect={() => go('/agents/website')}>
            <Globe className="mr-2 h-4 w-4" /><span>Your Website</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Outreach">
          <CommandItem value="Dialer phone calls power dialer" onSelect={() => go('/agents/dialer')}>
            <Phone className="mr-2 h-4 w-4" /><span>Dialer</span>
          </CommandItem>
          <CommandItem value="Communications email chat messaging" onSelect={() => go('/agents/communications')}>
            <MessageSquare className="mr-2 h-4 w-4" /><span>Communications</span>
          </CommandItem>
          <CommandItem value="Scripts call sales talk tracks" onSelect={() => go('/agents/scripts')}>
            <BookOpen className="mr-2 h-4 w-4" /><span>Scripts</span>
          </CommandItem>
          <CommandItem value="Recruiting agents downline invite" onSelect={() => go('/agents/recruiting')}>
            <UserPlus className="mr-2 h-4 w-4" /><span>Recruiting</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Sales Toolkit">
          <CommandItem value="Quotes policy pricing estimates" onSelect={() => go('/agents/quotes')}>
            <FileText className="mr-2 h-4 w-4" /><span>Quotes</span>
          </CommandItem>
          <CommandItem value="Data Encryption secure forms SSN banking" onSelect={() => go('/agents/data-encryption')}>
            <Shield className="mr-2 h-4 w-4" /><span>Data Encryption</span>
          </CommandItem>
          <CommandItem value="Resources training materials guides" onSelect={() => go('/agents/resources')}>
            <FolderOpen className="mr-2 h-4 w-4" /><span>Resources</span>
          </CommandItem>
          <CommandItem value="AI Avatar Council advisors chat debate" onSelect={() => go('/agents/avatar-council')}>
            <Bot className="mr-2 h-4 w-4" /><span>AI Avatar Council</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Growth">
          <CommandItem value="Leaderboard rankings top agents" onSelect={() => go('/agents/leaderboard')}>
            <Trophy className="mr-2 h-4 w-4" /><span>Leaderboard</span>
          </CommandItem>
          <CommandItem value="Achievements badges XP rewards" onSelect={() => go('/agents/achievements')}>
            <Star className="mr-2 h-4 w-4" /><span>Achievements</span>
          </CommandItem>
          <CommandItem value="My Hierarchy upline downline commission" onSelect={() => go('/agents/hierarchy')}>
            <Network className="mr-2 h-4 w-4" /><span>My Hierarchy</span>
          </CommandItem>
          <CommandItem value="My Commissions earnings statements AP" onSelect={() => go('/agents/commissions')}>
            <DollarSign className="mr-2 h-4 w-4" /><span>My Commissions</span>
          </CommandItem>
          <CommandItem value="Buy Leads marketplace purchase" onSelect={() => go('/agents/lead-marketplace')}>
            <ShoppingBag className="mr-2 h-4 w-4" /><span>Buy Leads</span>
          </CommandItem>
          <CommandItem value="Training Sessions schedule 1:1 coaching" onSelect={() => go('/agents/training-sessions')}>
            <GraduationCap className="mr-2 h-4 w-4" /><span>Training Sessions</span>
          </CommandItem>
          <CommandItem value="Guidelines expectations compliance rules" onSelect={() => go('/agents/guidelines')}>
            <ClipboardCheck className="mr-2 h-4 w-4" /><span>Guidelines</span>
          </CommandItem>
          <CommandItem value="Ideas Feedback suggestions submit" onSelect={() => go('/agents/ideas')}>
            <Lightbulb className="mr-2 h-4 w-4" /><span>Ideas & Feedback</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem value="Settings profile preferences password" onSelect={() => go('/agents/settings')}>
            <Settings className="mr-2 h-4 w-4" /><span>Settings</span>
          </CommandItem>
          <CommandItem value="Help Support FAQ contact" onSelect={() => go('/agents/help')}>
            <HelpCircle className="mr-2 h-4 w-4" /><span>Help & Support</span>
          </CommandItem>
          <CommandItem value="Log Out sign out exit" onSelect={() => { onClose(); onAction('logout'); }}>
            <LogOut className="mr-2 h-4 w-4 text-red-500" /><span>Log Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
