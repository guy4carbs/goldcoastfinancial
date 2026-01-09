import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  LayoutDashboard, CheckSquare, Users, GraduationCap, FileText, 
  TrendingUp, DollarSign, ScrollText, Phone, UserPlus, Calendar,
  Search, Settings, Moon, Sun, LogOut, Bell, Trophy, Zap,
  Rocket, Play, Building2, BookOpen, ClipboardCheck, MessageSquare
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tab: string) => void;
  onAction: (action: string) => void;
  theme: 'light' | 'dark';
}

export function CommandPalette({ open, onOpenChange, onNavigate, onAction, theme }: CommandPaletteProps) {
  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => onNavigate('dashboard'))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                D
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('getting-started'))}>
              <Rocket className="mr-2 h-4 w-4 text-secondary" />
              <span>Getting Started</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                G
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('tasks'))}>
              <CheckSquare className="mr-2 h-4 w-4" />
              <span>Tasks</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                T
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('crm'))}>
              <Users className="mr-2 h-4 w-4" />
              <span>CRM / Deal Room</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                C
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('chat'))}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Team Chat</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('calendar'))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('training'))}>
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>Training</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('videos'))}>
              <Play className="mr-2 h-4 w-4 text-green-600" />
              <span>Video Library</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                V
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('carriers'))}>
              <Building2 className="mr-2 h-4 w-4 text-blue-600" />
              <span>Carriers</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('resources'))}>
              <BookOpen className="mr-2 h-4 w-4 text-purple-600" />
              <span>Resources</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                R
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('scripts'))}>
              <ScrollText className="mr-2 h-4 w-4" />
              <span>Scripts</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('sops'))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>SOPs</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('guidelines'))}>
              <ClipboardCheck className="mr-2 h-4 w-4 text-orange-600" />
              <span>Guidelines & Expectations</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('performance'))}>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Performance</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                P
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('earnings'))}>
              <DollarSign className="mr-2 h-4 w-4" />
              <span>Earnings</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                E
              </kbd>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => onAction('log-call'))}>
              <Phone className="mr-2 h-4 w-4 text-primary" />
              <span>Log a Call</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onAction('add-lead'))}>
              <UserPlus className="mr-2 h-4 w-4 text-secondary" />
              <span>Add New Lead</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onAction('schedule'))}>
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              <span>Schedule Meeting</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Views">
            <CommandItem onSelect={() => runCommand(() => onAction('leaderboard'))}>
              <Trophy className="mr-2 h-4 w-4 text-secondary" />
              <span>View Full Leaderboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onAction('achievements'))}>
              <Zap className="mr-2 h-4 w-4 text-secondary" />
              <span>View All Achievements</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onAction('notifications'))}>
              <Bell className="mr-2 h-4 w-4" />
              <span>View Notifications</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => onAction('toggle-theme'))}>
              {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              <span>Toggle Theme</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onAction('logout'))}>
              <LogOut className="mr-2 h-4 w-4 text-red-500" />
              <span>Log Out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
