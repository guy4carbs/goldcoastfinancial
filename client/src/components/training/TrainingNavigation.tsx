/**
 * Training Navigation Components - Phase 3.2
 *
 * Modern LMS-style navigation including:
 * - Collapsible sidebar menu with module tree
 * - Breadcrumb navigation
 * - "Next Up" recommendation
 * - Full-text search across modules
 * - Filtering and sorting
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle2,
  Circle,
  Lock,
  Play,
  Clock,
  Filter,
  SortAsc,
  SortDesc,
  Home,
  Award,
  Rocket,
  Shield,
  Target,
  Package,
  Users,
  X,
  Menu,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrainingModuleData, CertificationLevel } from "@/lib/trainingData";

// ============================================================================
// TRAINING SIDEBAR
// ============================================================================

interface ModuleGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  level: CertificationLevel;
  modules: TrainingModuleData[];
}

interface TrainingSidebarProps {
  moduleGroups: ModuleGroup[];
  completedModules: string[];
  currentModuleId?: string;
  onSelectModule: (module: TrainingModuleData) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function TrainingSidebar({
  moduleGroups,
  completedModules,
  currentModuleId,
  onSelectModule,
  isOpen,
  onToggle,
  className
}: TrainingSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    moduleGroups.map(g => g.id)
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getModuleStatus = (module: TrainingModuleData) => {
    if (completedModules.includes(module.id)) return 'completed';
    const prereqsMet = module.prerequisiteModules.every(p => completedModules.includes(p));
    if (!prereqsMet) return 'locked';
    return 'available';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex-shrink-0 border-r bg-white overflow-hidden",
            className
          )}
        >
          <nav
            className="h-full flex flex-col"
            role="navigation"
            aria-label="Training curriculum"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 id="sidebar-title" className="font-semibold text-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                Curriculum
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                aria-label="Close curriculum sidebar"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>

            {/* Module Tree */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {moduleGroups.map(group => {
                  const completedInGroup = group.modules.filter(m =>
                    completedModules.includes(m.id)
                  ).length;
                  const isExpanded = expandedGroups.includes(group.id);

                  return (
                    <Collapsible
                      key={group.id}
                      open={isExpanded}
                      onOpenChange={() => toggleGroup(group.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-3 py-2 h-auto hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            <group.icon className="w-4 h-4 text-violet-500" />
                            <span className="text-sm font-medium text-left truncate">
                              {group.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] h-5">
                              {completedInGroup}/{group.modules.length}
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </Button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <ul
                          className="ml-4 pl-4 border-l space-y-1 py-1"
                          role="list"
                          aria-label={`Modules in ${group.name}`}
                        >
                          {group.modules.map(module => {
                            const status = getModuleStatus(module);
                            const isCurrent = module.id === currentModuleId;
                            const statusLabel = status === 'completed' ? 'Completed' : status === 'locked' ? 'Locked' : 'Available';

                            return (
                              <li key={module.id} role="listitem">
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start px-3 py-2 h-auto text-left",
                                    isCurrent && "bg-violet-500/10 border-l-2 border-violet-500 -ml-[1px]",
                                    status === 'locked' && "opacity-50"
                                  )}
                                  onClick={() => status !== 'locked' && onSelectModule(module)}
                                  disabled={status === 'locked'}
                                  aria-label={`${module.title}, ${statusLabel}, ${module.duration} minutes${isCurrent ? ', Currently viewing' : ''}`}
                                  aria-current={isCurrent ? 'page' : undefined}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {status === 'completed' ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                                    ) : status === 'locked' ? (
                                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" aria-hidden="true" />
                                    )}
                                    <div className="min-w-0">
                                      <p className={cn(
                                        "text-xs truncate",
                                        isCurrent ? "font-semibold text-primary" : "text-gray-700"
                                      )}>
                                        {module.title}
                                      </p>
                                      <p className="text-[10px] text-gray-400">
                                        {module.code} • {module.duration}m
                                      </p>
                                    </div>
                                  </div>
                                </Button>
                              </li>
                            );
                          })}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// BREADCRUMB NAVIGATION
// ============================================================================

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface TrainingBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function TrainingBreadcrumb({ items, className }: TrainingBreadcrumbProps) {
  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-gray-500 hover:text-primary"
        onClick={items[0]?.onClick}
      >
        <Home className="w-4 h-4" />
      </Button>
      {items.slice(1).map((item, idx) => (
        <div key={idx} className="flex items-center">
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2",
              idx === items.length - 2
                ? "font-medium text-primary"
                : "text-gray-500 hover:text-primary"
            )}
            onClick={item.onClick}
            disabled={!item.onClick}
          >
            {item.label}
          </Button>
        </div>
      ))}
    </nav>
  );
}

// ============================================================================
// NEXT UP RECOMMENDATION
// ============================================================================

interface NextUpRecommendationProps {
  nextModule: TrainingModuleData | null;
  certificationName: string;
  onStart: () => void;
  className?: string;
}

export function NextUpRecommendation({
  nextModule,
  certificationName,
  onStart,
  className
}: NextUpRecommendationProps) {
  if (!nextModule) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700">
                    Next Up
                  </Badge>
                  <span className="text-xs text-gray-500">for {certificationName}</span>
                </div>
                <p className="font-medium text-gray-900 mt-0.5">{nextModule.title}</p>
                <p className="text-xs text-gray-500">{nextModule.duration} min</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={onStart}
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// TRAINING SEARCH
// ============================================================================

interface TrainingSearchProps {
  modules: TrainingModuleData[];
  onSelectModule: (module: TrainingModuleData) => void;
  className?: string;
}

export function TrainingSearch({
  modules,
  onSelectModule,
  className
}: TrainingSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filteredModules = useMemo(() => {
    if (!query) return modules.slice(0, 10);
    const lowerQuery = query.toLowerCase();
    return modules.filter(m =>
      m.title.toLowerCase().includes(lowerQuery) ||
      m.code.toLowerCase().includes(lowerQuery) ||
      m.subtitle.toLowerCase().includes(lowerQuery) ||
      m.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
  }, [modules, query]);

  const handleSelect = (module: TrainingModuleData) => {
    onSelectModule(module);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search modules...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search modules, topics, or codes..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No modules found.</CommandEmpty>
          <CommandGroup heading="Modules">
            {filteredModules.map(module => (
              <CommandItem
                key={module.id}
                onSelect={() => handleSelect(module)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={cn(
                    "w-8 h-8 rounded flex items-center justify-center flex-shrink-0",
                    module.category === 'product' && "bg-emerald-100",
                    module.category === 'compliance' && "bg-red-100",
                    module.category === 'methodology' && "bg-blue-100",
                    module.category === 'doctrine' && "bg-purple-100",
                    module.category === 'onboarding' && "bg-cyan-100",
                    module.category === 'client_facilitation' && "bg-indigo-100"
                  )}>
                    <BookOpen className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{module.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{module.code}</span>
                      <span>•</span>
                      <span>{module.category}</span>
                      <span>•</span>
                      <span>{module.duration}m</span>
                    </p>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

// ============================================================================
// FILTER AND SORT CONTROLS
// ============================================================================

type SortOption = 'default' | 'duration-asc' | 'duration-desc' | 'name-asc' | 'name-desc';
type FilterStatus = 'all' | 'completed' | 'in-progress' | 'not-started' | 'locked';
type FilterCategory = 'all' | 'onboarding' | 'doctrine' | 'compliance' | 'methodology' | 'product' | 'client_facilitation';

interface FilterSortControlsProps {
  sortBy: SortOption;
  filterStatus: FilterStatus;
  filterCategory: FilterCategory;
  onSortChange: (sort: SortOption) => void;
  onFilterStatusChange: (status: FilterStatus) => void;
  onFilterCategoryChange: (category: FilterCategory) => void;
  className?: string;
}

export function FilterSortControls({
  sortBy,
  filterStatus,
  filterCategory,
  onSortChange,
  onFilterStatusChange,
  onFilterCategoryChange,
  className
}: FilterSortControlsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex items-center gap-1.5">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">Filter:</span>
      </div>

      <Select value={filterStatus} onValueChange={(v) => onFilterStatusChange(v as FilterStatus)}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="not-started">Not Started</SelectItem>
          <SelectItem value="locked">Locked</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterCategory} onValueChange={(v) => onFilterCategoryChange(v as FilterCategory)}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="onboarding">Onboarding</SelectItem>
          <SelectItem value="doctrine">Doctrine</SelectItem>
          <SelectItem value="compliance">Compliance</SelectItem>
          <SelectItem value="methodology">Methodology</SelectItem>
          <SelectItem value="product">Products</SelectItem>
          <SelectItem value="client_facilitation">Client Facilitation</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <div className="flex items-center gap-1.5">
        {sortBy.includes('asc') ? (
          <SortAsc className="w-4 h-4 text-gray-400" />
        ) : (
          <SortDesc className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-xs text-gray-500">Sort:</span>
      </div>

      <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default Order</SelectItem>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          <SelectItem value="duration-asc">Duration (Short)</SelectItem>
          <SelectItem value="duration-desc">Duration (Long)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ============================================================================
// QUICK JUMP FLOATING BUTTON
// ============================================================================

interface QuickJumpProps {
  sections: { id: string; title: string; completed: boolean }[];
  currentIndex: number;
  onJump: (index: number) => void;
  className?: string;
}

export function QuickJumpMenu({
  sections,
  currentIndex,
  onJump,
  className
}: QuickJumpProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-64 bg-white rounded-xl shadow-lg border p-2 max-h-80 overflow-y-auto"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-1">
              Jump to Section
            </p>
            {sections.map((section, idx) => (
              <Button
                key={section.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left h-auto py-2 px-2",
                  idx === currentIndex && "bg-violet-500/10"
                )}
                onClick={() => {
                  onJump(idx);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  {section.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : idx === currentIndex ? (
                    <Play className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={cn(
                    "text-sm truncate",
                    idx === currentIndex && "font-medium"
                  )}>
                    {section.title}
                  </span>
                </div>
              </Button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="w-5 h-5" />
      </Button>
    </div>
  );
}
