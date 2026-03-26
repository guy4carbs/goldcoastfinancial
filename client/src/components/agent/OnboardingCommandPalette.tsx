import { useState, useEffect, useCallback } from "react";
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
  LayoutDashboard, Calendar, CalendarDays,
  GraduationCap, BookOpen, Rocket, Target, Users, HelpCircle,
  Layers, Brain, FileText, Search, Moon, Sun
} from "lucide-react";

interface OnboardingCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tab: string) => void;
  theme: 'light' | 'dark';
}

export function OnboardingCommandPalette({
  open,
  onOpenChange,
  onNavigate,
  theme
}: OnboardingCommandPaletteProps) {
  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="Search onboarding pages, courses, resources..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Onboarding Journey">
            <CommandItem onSelect={() => runCommand(() => onNavigate('dashboard'))}>
              <LayoutDashboard className="mr-2 h-4 w-4 text-violet-600" />
              <span>Dashboard</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                D
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('day-1'))}>
              <Rocket className="mr-2 h-4 w-4 text-amber-500" />
              <span>Day 1 - Launch Day</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                1
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('day-2'))}>
              <Target className="mr-2 h-4 w-4 text-purple-600" />
              <span>Day 2 - Script Mastery</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                2
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('days-3-7'))}>
              <Calendar className="mr-2 h-4 w-4 text-violet-600" />
              <span>Days 3-7 - First Week Deep Dive</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('days-8-30'))}>
              <CalendarDays className="mr-2 h-4 w-4 text-violet-600" />
              <span>Days 8-30 - Production Mode</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Study & Training">
            <CommandItem onSelect={() => runCommand(() => onNavigate('course'))}>
              <GraduationCap className="mr-2 h-4 w-4 text-violet-600" />
              <span>Life Insurance Course</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                C
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('fundamentals'))}>
              <BookOpen className="mr-2 h-4 w-4 text-purple-600" />
              <span>Life Insurance Fundamentals</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                F
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('flashcards'))}>
              <Layers className="mr-2 h-4 w-4 text-amber-500" />
              <span>Flashcards</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('practice-exam'))}>
              <Brain className="mr-2 h-4 w-4 text-violet-600" />
              <span>Practice Exam</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                P
              </kbd>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Resources">
            <CommandItem onSelect={() => runCommand(() => onNavigate('resources'))}>
              <FileText className="mr-2 h-4 w-4 text-violet-600" />
              <span>Training Resources</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                R
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => onNavigate('help'))}>
              <HelpCircle className="mr-2 h-4 w-4 text-amber-500" />
              <span>Get Help</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                H
              </kbd>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
