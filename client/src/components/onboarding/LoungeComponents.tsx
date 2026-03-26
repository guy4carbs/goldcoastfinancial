/**
 * Onboarding Lounge Shared Components
 * Reusable components for the onboarding lounge pages
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Clock,
  MapPin,
  FileText,
  RefreshCw,
  Award,
  Check,
  ChevronsUpDown,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Video,
  Play,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  GLASS,
  scaleIn,
  staggerContainer,
} from "@/lib/heritageDesignSystem";

// ============================================================================
// STATE DATA
// ============================================================================

export const STATE_REQUIREMENTS: Record<string, { hours: number; examFee: number; renewalYears: number; ce: number }> = {
  'Alabama': { hours: 20, examFee: 72, renewalYears: 2, ce: 24 },
  'Alaska': { hours: 20, examFee: 90, renewalYears: 2, ce: 24 },
  'Arizona': { hours: 20, examFee: 55, renewalYears: 2, ce: 24 },
  'Arkansas': { hours: 20, examFee: 60, renewalYears: 2, ce: 24 },
  'California': { hours: 52, examFee: 55, renewalYears: 2, ce: 24 },
  'Colorado': { hours: 0, examFee: 57, renewalYears: 2, ce: 24 },
  'Connecticut': { hours: 20, examFee: 65, renewalYears: 2, ce: 24 },
  'Delaware': { hours: 40, examFee: 75, renewalYears: 2, ce: 24 },
  'District of Columbia': { hours: 40, examFee: 65, renewalYears: 2, ce: 24 },
  'Florida': { hours: 40, examFee: 45, renewalYears: 2, ce: 24 },
  'Georgia': { hours: 40, examFee: 62, renewalYears: 2, ce: 24 },
  'Hawaii': { hours: 20, examFee: 60, renewalYears: 2, ce: 24 },
  'Idaho': { hours: 0, examFee: 60, renewalYears: 2, ce: 24 },
  'Illinois': { hours: 20, examFee: 63, renewalYears: 2, ce: 30 },
  'Indiana': { hours: 20, examFee: 52, renewalYears: 2, ce: 24 },
  'Iowa': { hours: 20, examFee: 50, renewalYears: 2, ce: 36 },
  'Kansas': { hours: 20, examFee: 55, renewalYears: 2, ce: 24 },
  'Kentucky': { hours: 20, examFee: 62, renewalYears: 2, ce: 24 },
  'Louisiana': { hours: 20, examFee: 70, renewalYears: 2, ce: 24 },
  'Maine': { hours: 40, examFee: 65, renewalYears: 2, ce: 24 },
  'Maryland': { hours: 40, examFee: 49, renewalYears: 2, ce: 24 },
  'Massachusetts': { hours: 40, examFee: 54, renewalYears: 2, ce: 30 },
  'Michigan': { hours: 40, examFee: 40, renewalYears: 1, ce: 24 },
  'Minnesota': { hours: 20, examFee: 42, renewalYears: 2, ce: 24 },
  'Mississippi': { hours: 20, examFee: 60, renewalYears: 2, ce: 24 },
  'Missouri': { hours: 20, examFee: 52, renewalYears: 2, ce: 24 },
  'Montana': { hours: 20, examFee: 58, renewalYears: 2, ce: 24 },
  'Nebraska': { hours: 20, examFee: 58, renewalYears: 2, ce: 24 },
  'Nevada': { hours: 20, examFee: 60, renewalYears: 2, ce: 24 },
  'New Hampshire': { hours: 20, examFee: 55, renewalYears: 2, ce: 24 },
  'New Jersey': { hours: 20, examFee: 55, renewalYears: 2, ce: 24 },
  'New Mexico': { hours: 20, examFee: 56, renewalYears: 2, ce: 24 },
  'New York': { hours: 40, examFee: 15, renewalYears: 2, ce: 15 },
  'North Carolina': { hours: 20, examFee: 48, renewalYears: 2, ce: 24 },
  'North Dakota': { hours: 20, examFee: 50, renewalYears: 2, ce: 24 },
  'Ohio': { hours: 20, examFee: 42, renewalYears: 2, ce: 24 },
  'Oklahoma': { hours: 20, examFee: 52, renewalYears: 2, ce: 24 },
  'Oregon': { hours: 20, examFee: 60, renewalYears: 2, ce: 24 },
  'Pennsylvania': { hours: 24, examFee: 45, renewalYears: 2, ce: 24 },
  'Rhode Island': { hours: 20, examFee: 65, renewalYears: 2, ce: 24 },
  'South Carolina': { hours: 20, examFee: 52, renewalYears: 2, ce: 24 },
  'South Dakota': { hours: 20, examFee: 50, renewalYears: 2, ce: 24 },
  'Tennessee': { hours: 20, examFee: 52, renewalYears: 2, ce: 24 },
  'Texas': { hours: 40, examFee: 43, renewalYears: 2, ce: 24 },
  'Utah': { hours: 20, examFee: 55, renewalYears: 2, ce: 24 },
  'Vermont': { hours: 20, examFee: 65, renewalYears: 2, ce: 24 },
  'Virginia': { hours: 20, examFee: 58, renewalYears: 2, ce: 24 },
  'Washington': { hours: 20, examFee: 65, renewalYears: 2, ce: 24 },
  'West Virginia': { hours: 20, examFee: 52, renewalYears: 2, ce: 24 },
  'Wisconsin': { hours: 20, examFee: 55, renewalYears: 2, ce: 24 },
  'Wyoming': { hours: 20, examFee: 60, renewalYears: 2, ce: 24 },
};

export const ALL_STATES = Object.keys(STATE_REQUIREMENTS).sort();

// ============================================================================
// LICENSING STEPS DATA
// ============================================================================

export interface LicensingStep {
  id: string;
  title: string;
  description: string;
  hours: string;
  resources: { label: string; url: string }[];
  required: boolean;
}

export const LICENSING_STEPS: LicensingStep[] = [
  {
    id: 'step-1',
    title: 'Complete Pre-Licensing Education',
    description: 'Complete state-required pre-licensing course hours',
    hours: '20-40 hours depending on state',
    resources: [
      { label: 'Xcel (Recommended)', url: 'https://www.xceltesting.com/' },
      { label: 'Kaplan', url: 'https://www.kaplanfinancial.com/insurance' },
    ],
    required: true
  },
  {
    id: 'step-2',
    title: 'Schedule & Pass State Exam',
    description: 'Pass the Life Insurance licensing exam',
    hours: '2-3 hour exam',
    resources: [
      { label: 'Pearson VUE', url: 'https://home.pearsonvue.com/insurance' },
      { label: 'PSI Exams', url: 'https://candidate.psiexams.com/' },
    ],
    required: true
  },
  {
    id: 'step-3',
    title: 'Submit License Application',
    description: "Apply through your state's Department of Insurance via NIPR",
    hours: '1-2 hours',
    resources: [
      { label: 'NIPR (National Insurance Producer Registry)', url: 'https://nipr.com/' },
    ],
    required: true
  },
  {
    id: 'step-4',
    title: 'Complete Background Check',
    description: 'Fingerprinting and background verification',
    hours: 'Varies by state',
    resources: [
      { label: 'IdentoGO', url: 'https://www.identogo.com/' },
    ],
    required: true
  },
  {
    id: 'step-5',
    title: 'Receive License Number',
    description: 'Get your official license from the state',
    hours: '1-4 weeks processing',
    resources: [
      { label: 'NIPR License Lookup', url: 'https://nipr.com/' },
    ],
    required: true
  },
  {
    id: 'step-6',
    title: 'Complete Carrier Appointments',
    description: 'Submit contracting paperwork to get appointed with our carrier partners',
    hours: '1-2 weeks',
    resources: [],
    required: true
  },
  {
    id: 'step-7',
    title: 'Complete Heritage Life Onboarding',
    description: 'Complete compliance training, product certification modules, and agent portal setup',
    hours: '4-8 hours',
    resources: [],
    required: true
  }
];

// ============================================================================
// STUDY RESOURCES DATA
// ============================================================================

export interface StudyResource {
  id: string;
  title: string;
  type: 'course' | 'practice' | 'flashcards' | 'guide';
  provider: string;
  duration: string;
  rating: number;
  enrolled: number;
  free: boolean;
  discountCode?: string;
  href: string;
}

export const STUDY_RESOURCES: StudyResource[] = [
  {
    id: 'res-1',
    title: 'Life Insurance Fundamentals',
    type: 'course',
    provider: 'Heritage Life Academy',
    duration: '6 hours',
    rating: 4.8,
    enrolled: 1240,
    free: true,
    href: '/agents/study/fundamentals'
  },
  {
    id: 'res-2',
    title: 'State Exam Prep Course',
    type: 'course',
    provider: 'Xcel',
    duration: '20 hours',
    rating: 4.6,
    enrolled: 3500,
    free: false,
    discountCode: 'fflapex-hrojsf',
    href: 'https://www.xceltesting.com/'
  },
  {
    id: 'res-3',
    title: 'Practice Exam Simulator',
    type: 'practice',
    provider: 'Heritage Life',
    duration: 'Unlimited',
    rating: 4.9,
    enrolled: 890,
    free: true,
    href: '/agents/study/practice-exam'
  },
  {
    id: 'res-4',
    title: 'Insurance Terminology Flashcards',
    type: 'flashcards',
    provider: 'Heritage Life',
    duration: '30 cards',
    rating: 4.7,
    enrolled: 2100,
    free: true,
    href: '/agents/study/flashcards'
  }
];

// ============================================================================
// VIDEO TUTORIALS DATA
// ============================================================================

export interface VideoTutorial {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  views: number;
  category: 'basics' | 'exam' | 'licensing' | 'advanced';
}

export const VIDEO_TUTORIALS: VideoTutorial[] = [
  { id: 'vid-1', title: 'Understanding Life Insurance Types', duration: '12:34', thumbnail: 'Term vs Whole Life', views: 4500, category: 'basics' },
  { id: 'vid-2', title: 'How to Pass Your State Exam', duration: '18:22', thumbnail: 'Exam Tips', views: 8200, category: 'exam' },
  { id: 'vid-3', title: 'Navigating the Licensing Process', duration: '15:45', thumbnail: 'Step by Step', views: 3100, category: 'licensing' },
  { id: 'vid-4', title: 'Common Exam Questions Explained', duration: '24:18', thumbnail: 'Q&A Review', views: 6700, category: 'exam' },
];

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * State Selector Dropdown
 */
interface StateSelectorProps {
  selectedState: string;
  onStateChange: (state: string) => void;
  className?: string;
}

export function StateSelector({ selectedState, onStateChange, className }: StateSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[220px] justify-between border-violet-200 hover:border-violet-400 hover:bg-violet-50/50 bg-white/80 backdrop-blur-sm"
            style={{ borderRadius: RADIUS.button }}
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-500" />
              {selectedState}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0" style={{ borderRadius: RADIUS.button }}>
          <Command>
            <CommandInput placeholder="Search state..." />
            <CommandList>
              <CommandEmpty>No state found.</CommandEmpty>
              <CommandGroup>
                {ALL_STATES.map(state => (
                  <CommandItem
                    key={state}
                    value={state}
                    onSelect={() => {
                      onStateChange(state);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn(
                      "mr-2 h-4 w-4",
                      selectedState === state ? "opacity-100 text-violet-600" : "opacity-0"
                    )} />
                    {state}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedState !== 'Illinois' && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-400 hover:text-violet-600 hover:bg-violet-50"
          onClick={() => onStateChange('Illinois')}
          aria-label="Reset to default state"
          style={{ borderRadius: RADIUS.button }}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * State Requirements Grid (4-stat display)
 */
interface StateRequirementsGridProps {
  state: string;
  className?: string;
}

export function StateRequirementsGrid({ state, className }: StateRequirementsGridProps) {
  const reqs = STATE_REQUIREMENTS[state] || STATE_REQUIREMENTS['Illinois'];

  const stats = [
    { value: reqs.hours, label: 'Pre-License Hours', gradient: 'from-violet-500 to-purple-500', icon: Clock },
    { value: `$${reqs.examFee}`, label: 'Exam Fee', gradient: 'from-violet-600 to-purple-600', icon: FileText },
    { value: reqs.renewalYears, label: 'Years to Renew', gradient: 'from-purple-500 to-violet-500', icon: RefreshCw },
    { value: reqs.ce, label: 'CE Hours/Cycle', gradient: 'from-violet-500 to-amber-500', icon: Award },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={scaleIn}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
          transition={{ duration: MOTION.duration.hover }}
          className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100/50 p-4 text-center group"
          style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level1 }}
        >
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br",
            stat.gradient
          )} />
          <motion.div
            className={cn("w-9 h-9 mx-auto mb-2 flex items-center justify-center bg-gradient-to-br", stat.gradient)}
            style={{ borderRadius: RADIUS.button }}
            whileHover={{ rotate: 5 }}
          >
            <stat.icon className="w-4 h-4 text-white" />
          </motion.div>
          <p className={cn("text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent", stat.gradient)}>
            {stat.value}
          </p>
          <p className="text-gray-500 mt-1" style={{ fontSize: TYPE.caption }}>{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Licensing Steps Checklist
 */
interface LicensingChecklistProps {
  steps?: LicensingStep[];
  completedSteps: string[];
  onToggleStep: (stepId: string) => void;
  className?: string;
}

export function LicensingChecklist({
  steps = LICENSING_STEPS,
  completedSteps,
  onToggleStep,
  className
}: LicensingChecklistProps) {
  const progress = Math.round((completedSteps.length / steps.length) * 100);
  const isExternalLink = (url: string) => url.startsWith('http');

  return (
    <Card
      className={cn("border-0 overflow-hidden", className)}
      style={{ ...GLASS.css.standard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
    >
      <CardHeader className="bg-gradient-to-r from-violet-50/80 via-white/80 to-purple-50/80 border-b border-violet-100/50 backdrop-blur-sm" style={{ padding: GRID.spacing.md }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50"
              style={{ borderRadius: RADIUS.button }}
              whileHover={{ scale: 1.05, rotate: -3 }}
            >
              <CheckCircle2 className="w-5 h-5 text-amber-200" />
            </motion.div>
            <div className="min-w-0">
              <CardTitle style={{ fontSize: TYPE.title }} className="truncate">Licensing Checklist</CardTitle>
              <CardDescription style={{ fontSize: TYPE.meta }} className="truncate">
                Track your progress to becoming licensed
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 border border-violet-100/50 self-start sm:self-auto flex-shrink-0" style={{ borderRadius: RADIUS.button }}>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
              {completedSteps.length}/{steps.length}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {/* Progress Bar */}
        <div className="mb-6 p-3 bg-gradient-to-r from-violet-50/50 to-purple-50/50 border border-violet-100/30" style={{ borderRadius: RADIUS.button }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700" style={{ fontSize: TYPE.caption }}>Progress</span>
            <span className="font-bold text-violet-600" style={{ fontSize: TYPE.meta }}>{progress}%</span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-amber-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </motion.div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isComplete = completedSteps.includes(step.id);
            const isPrevComplete = index === 0 || completedSteps.includes(steps[index - 1].id);

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "border transition-all",
                  isComplete
                    ? "bg-violet-50/80 border-violet-200/50"
                    : isPrevComplete
                      ? "bg-purple-50/80 border-purple-200/50"
                      : "bg-gray-50/80 border-gray-200/50"
                )}
                style={{ borderRadius: RADIUS.button }}
              >
                {/* Step Header Row */}
                <div className="flex items-center gap-3 p-4 pb-2">
                  {/* Step Number/Check */}
                  <div
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105",
                      isComplete
                        ? "bg-gradient-to-r from-violet-500 to-amber-500 text-white shadow-md shadow-violet-200"
                        : isPrevComplete
                          ? "bg-violet-500 text-white shadow-md shadow-violet-200"
                          : "bg-gray-200 text-gray-400"
                    )}
                    onClick={() => onToggleStep(step.id)}
                  >
                    {isComplete ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-semibold text-sm leading-tight",
                      isComplete ? "text-violet-700" : isPrevComplete ? "text-purple-700" : "text-gray-500"
                    )}>
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  </div>

                  {/* Checkbox */}
                  <Checkbox
                    checked={isComplete}
                    onCheckedChange={() => onToggleStep(step.id)}
                    className="flex-shrink-0"
                  />
                </div>

                {/* Step Details Row */}
                <div className="px-4 pb-3 pt-1 ml-11">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    {/* Time estimate */}
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/60 px-2.5 py-1 rounded-full border border-gray-100 w-fit">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {step.hours}
                    </span>

                    {/* Resources */}
                    {step.resources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {step.resources.map(resource => (
                          isExternalLink(resource.url) ? (
                            <a
                              key={resource.label}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-violet-100/80 text-violet-700 rounded-full border border-violet-200/50 hover:bg-violet-200 hover:border-violet-300 transition-colors"
                            >
                              {resource.label}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span
                              key={resource.label}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-violet-100/80 text-violet-700 rounded-full border border-violet-200/50 cursor-pointer hover:bg-violet-200 hover:border-violet-300 transition-colors"
                            >
                              {resource.label}
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Study Resource Card
 */
interface StudyResourceCardProps {
  resource: StudyResource;
  index?: number;
  className?: string;
}

export function StudyResourceCard({ resource, index = 0, className }: StudyResourceCardProps) {
  const isExternal = resource.href.startsWith('http');
  const typeColors = {
    course: 'from-violet-500 to-purple-500',
    practice: 'from-purple-500 to-violet-500',
    flashcards: 'from-violet-600 to-purple-600',
    guide: 'from-purple-600 to-violet-600',
  };
  const typeIcons = {
    course: BookOpen,
    practice: FileText,
    flashcards: FileText,
    guide: BookOpen,
  };
  const Icon = typeIcons[resource.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      className={className}
    >
      <Card
        className="h-full border-0 overflow-hidden bg-white/80 backdrop-blur-sm group"
        style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.div
              className={cn("w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gradient-to-br", typeColors[resource.type])}
              style={{ borderRadius: RADIUS.button }}
              whileHover={{ rotate: 5 }}
            >
              <Icon className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-gray-900 truncate group-hover:text-violet-600 transition-colors">
                  {resource.title}
                </h4>
                {resource.free ? (
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">Free</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">Premium</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500">{resource.provider}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Clock className="w-3 h-3" />
                  {resource.duration}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-amber-500">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {resource.rating}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Users className="w-3 h-3" />
                  {resource.enrolled.toLocaleString()}
                </span>
              </div>
              {resource.discountCode && (
                <div className="mt-2 p-1.5 bg-violet-50 border border-violet-100 text-[10px]" style={{ borderRadius: RADIUS.button }}>
                  <span className="text-gray-500">Code: </span>
                  <span className="font-mono font-medium text-violet-600">{resource.discountCode}</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 text-xs border-violet-200 hover:bg-violet-50 hover:border-violet-300"
            style={{ borderRadius: RADIUS.button }}
            asChild={isExternal}
          >
            {isExternal ? (
              <a href={resource.href} target="_blank" rel="noopener noreferrer">
                Start Learning
                <ExternalLink className="w-3 h-3 ml-1.5" />
              </a>
            ) : (
              <span>
                Start Learning
                <ChevronRight className="w-3 h-3 ml-1.5" />
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Video Tutorial Card
 */
interface VideoTutorialCardProps {
  video: VideoTutorial;
  index?: number;
  onWatch?: (video: VideoTutorial) => void;
  className?: string;
}

export function VideoTutorialCard({ video, index = 0, onWatch, className }: VideoTutorialCardProps) {
  const categoryColors = {
    basics: 'from-violet-500 to-purple-500',
    exam: 'from-purple-500 to-violet-500',
    licensing: 'from-violet-600 to-purple-600',
    advanced: 'from-purple-600 to-amber-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      className={className}
    >
      <Card
        className="h-full border-0 overflow-hidden bg-white/80 backdrop-blur-sm group cursor-pointer"
        style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
        onClick={() => onWatch?.(video)}
      >
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className={cn(
            "relative h-28 bg-gradient-to-br flex items-center justify-center",
            categoryColors[video.category]
          )}>
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '16px 16px'
              }}
            />
            <motion.div
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <Play className="w-6 h-6 text-white fill-white" />
            </motion.div>
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
              {video.duration}
            </div>
            <div className="absolute top-2 left-2">
              <Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm">
                {video.thumbnail}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-violet-600 transition-colors">
              {video.title}
            </h4>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                {video.views.toLocaleString()} views
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Study Resources Grid
 */
interface StudyResourcesGridProps {
  resources?: StudyResource[];
  className?: string;
}

export function StudyResourcesGrid({ resources = STUDY_RESOURCES, className }: StudyResourcesGridProps) {
  return (
    <div className={cn("grid sm:grid-cols-2 gap-4", className)}>
      {resources.map((resource, idx) => (
        <StudyResourceCard key={resource.id} resource={resource} index={idx} />
      ))}
    </div>
  );
}

/**
 * Video Tutorials Grid
 */
interface VideoTutorialsGridProps {
  videos?: VideoTutorial[];
  onWatch?: (video: VideoTutorial) => void;
  className?: string;
}

export function VideoTutorialsGrid({ videos = VIDEO_TUTORIALS, onWatch, className }: VideoTutorialsGridProps) {
  return (
    <div className={cn("grid sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {videos.map((video, idx) => (
        <VideoTutorialCard key={video.id} video={video} index={idx} onWatch={onWatch} />
      ))}
    </div>
  );
}

// ============================================================================
// LIFE INSURANCE FUNDAMENTALS COURSE DATA
// ============================================================================

export interface FundamentalsLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'interactive';
  xp: number;
}

export interface FundamentalsModule {
  id: string;
  title: string;
  description: string;
  icon: 'shield' | 'heart' | 'dollar' | 'users' | 'file' | 'award';
  lessons: FundamentalsLesson[];
  xpTotal: number;
}

export const FUNDAMENTALS_MODULES: FundamentalsModule[] = [
  {
    id: 'mod-1',
    title: 'What is Life Insurance?',
    description: 'Understanding the purpose and importance of life insurance protection',
    icon: 'shield',
    lessons: [
      { id: 'l1-1', title: 'The Purpose of Life Insurance', duration: '8 min', type: 'video', xp: 25 },
      { id: 'l1-2', title: 'How Life Insurance Works', duration: '10 min', type: 'reading', xp: 20 },
      { id: 'l1-3', title: 'Who Needs Life Insurance?', duration: '6 min', type: 'video', xp: 25 },
      { id: 'l1-4', title: 'Knowledge Check', duration: '5 min', type: 'quiz', xp: 50 },
    ],
    xpTotal: 120,
  },
  {
    id: 'mod-2',
    title: 'Types of Life Insurance',
    description: 'Term, whole life, universal, and specialized policies explained',
    icon: 'file',
    lessons: [
      { id: 'l2-1', title: 'Term Life Insurance', duration: '12 min', type: 'video', xp: 30 },
      { id: 'l2-2', title: 'Whole Life Insurance', duration: '15 min', type: 'video', xp: 35 },
      { id: 'l2-3', title: 'Universal Life Insurance', duration: '12 min', type: 'video', xp: 30 },
      { id: 'l2-4', title: 'Comparing Policy Types', duration: '10 min', type: 'interactive', xp: 40 },
      { id: 'l2-5', title: 'Module Quiz', duration: '8 min', type: 'quiz', xp: 60 },
    ],
    xpTotal: 195,
  },
  {
    id: 'mod-3',
    title: 'Understanding Premiums & Coverage',
    description: 'How premiums are calculated and coverage amounts determined',
    icon: 'dollar',
    lessons: [
      { id: 'l3-1', title: 'Premium Factors Explained', duration: '10 min', type: 'video', xp: 25 },
      { id: 'l3-2', title: 'Coverage Amount Calculations', duration: '12 min', type: 'reading', xp: 25 },
      { id: 'l3-3', title: 'The Underwriting Process', duration: '15 min', type: 'video', xp: 35 },
      { id: 'l3-4', title: 'Rate Comparison Exercise', duration: '10 min', type: 'interactive', xp: 45 },
    ],
    xpTotal: 130,
  },
  {
    id: 'mod-4',
    title: 'Policy Beneficiaries & Claims',
    description: 'Naming beneficiaries and understanding the claims process',
    icon: 'users',
    lessons: [
      { id: 'l4-1', title: 'Naming Beneficiaries', duration: '8 min', type: 'video', xp: 20 },
      { id: 'l4-2', title: 'Primary vs Contingent', duration: '6 min', type: 'reading', xp: 15 },
      { id: 'l4-3', title: 'The Claims Process', duration: '12 min', type: 'video', xp: 30 },
      { id: 'l4-4', title: 'Common Claim Scenarios', duration: '10 min', type: 'interactive', xp: 35 },
    ],
    xpTotal: 100,
  },
  {
    id: 'mod-5',
    title: 'Riders & Policy Options',
    description: 'Additional coverage options and policy customization',
    icon: 'heart',
    lessons: [
      { id: 'l5-1', title: 'Common Life Insurance Riders', duration: '15 min', type: 'video', xp: 35 },
      { id: 'l5-2', title: 'Accelerated Death Benefits', duration: '8 min', type: 'reading', xp: 20 },
      { id: 'l5-3', title: 'Waiver of Premium', duration: '6 min', type: 'video', xp: 20 },
      { id: 'l5-4', title: 'Customizing Coverage', duration: '10 min', type: 'interactive', xp: 40 },
    ],
    xpTotal: 115,
  },
  {
    id: 'mod-6',
    title: 'Final Assessment',
    description: 'Comprehensive test covering all fundamentals topics',
    icon: 'award',
    lessons: [
      { id: 'l6-1', title: 'Course Review', duration: '15 min', type: 'reading', xp: 30 },
      { id: 'l6-2', title: 'Final Exam', duration: '25 min', type: 'quiz', xp: 150 },
    ],
    xpTotal: 180,
  },
];

export const FUNDAMENTALS_OBJECTIVES = [
  'Explain the purpose and importance of life insurance',
  'Differentiate between term, whole, and universal life policies',
  'Understand how premiums and coverage amounts are determined',
  'Know how to properly designate beneficiaries',
  'Identify common riders and policy options',
  'Guide clients through the application process',
];

// ============================================================================
// LIFE INSURANCE FUNDAMENTALS COURSE COMPONENT
// ============================================================================

interface FundamentalsCourseProps {
  completedLessons: string[];
  onToggleLesson: (lessonId: string) => void;
  onStartLesson?: (lesson: FundamentalsLesson, moduleId: string) => void;
  className?: string;
}

export function FundamentalsCourse({
  completedLessons,
  onToggleLesson,
  onStartLesson,
  className
}: FundamentalsCourseProps) {
  const totalLessons = FUNDAMENTALS_MODULES.reduce((sum, mod) => sum + mod.lessons.length, 0);
  const completedCount = completedLessons.length;
  const progress = Math.round((completedCount / totalLessons) * 100);
  const totalXP = FUNDAMENTALS_MODULES.reduce((sum, mod) => sum + mod.xpTotal, 0);
  const earnedXP = FUNDAMENTALS_MODULES.reduce((sum, mod) => {
    return sum + mod.lessons
      .filter(l => completedLessons.includes(l.id))
      .reduce((lSum, l) => lSum + l.xp, 0);
  }, 0);

  const iconMap: Record<string, React.ElementType> = {
    shield: CheckCircle2,
    heart: Star,
    dollar: Award,
    users: Users,
    file: FileText,
    award: Award,
  };

  const lessonTypeIcons: Record<string, React.ElementType> = {
    video: Play,
    reading: BookOpen,
    quiz: Award,
    interactive: Star,
  };

  const lessonTypeColors: Record<string, string> = {
    video: 'bg-violet-100 text-violet-600',
    reading: 'bg-blue-100 text-blue-600',
    quiz: 'bg-amber-100 text-amber-600',
    interactive: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Course Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.duration.normal }}
      >
        <Card
          className="border-0 overflow-hidden relative"
          style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />

          {/* Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full translate-y-1/2 -translate-x-1/4" />

          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left Side - Course Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <BookOpen className="w-7 h-7 text-amber-200" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-amber-400/20 text-amber-100 border-0 text-xs">Free Course</Badge>
                      <Badge className="bg-white/20 text-white border-0 text-xs">6 Modules</Badge>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      Life Insurance Fundamentals
                    </h2>
                  </div>
                </div>
                <p className="text-white/80 text-sm sm:text-base max-w-xl mb-4">
                  Master the essential knowledge of life insurance products, coverage types,
                  and industry practices. This comprehensive course prepares you for client conversations
                  and state licensing exams.
                </p>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    6 hours
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {totalLessons} lessons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    4.8 rating
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    1,240 enrolled
                  </span>
                </div>
              </div>

              {/* Right Side - Progress Stats */}
              <div className="flex flex-col gap-4 lg:items-end">
                {/* Progress Circle */}
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="relative">
                    <svg className="w-20 h-20 -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="url(#progressGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 214" }}
                        animate={{ strokeDasharray: `${(progress / 100) * 214} 214` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{progress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{completedCount}/{totalLessons}</p>
                    <p className="text-white/60 text-sm">Lessons Complete</p>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="flex items-center gap-3 bg-amber-400/20 backdrop-blur-sm rounded-xl px-4 py-3">
                  <Award className="w-6 h-6 text-amber-300" />
                  <div>
                    <p className="text-amber-100 font-bold">{earnedXP.toLocaleString()} / {totalXP.toLocaleString()} XP</p>
                    <p className="text-amber-200/60 text-xs">Experience Points</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Learning Objectives */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: MOTION.duration.normal }}
      >
        <Card
          className="border-0 overflow-hidden"
          style={{ ...GLASS.css.standard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
        >
          <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
                style={{ borderRadius: RADIUS.button }}
              >
                <CheckCircle2 className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <CardTitle style={{ fontSize: TYPE.title }}>What You'll Learn</CardTitle>
                <CardDescription style={{ fontSize: TYPE.meta }}>
                  Key skills and knowledge you'll gain from this course
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
            <div className="grid sm:grid-cols-2 gap-3">
              {FUNDAMENTALS_OBJECTIVES.map((objective, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-gradient-to-r from-violet-50/80 to-purple-50/50 border border-violet-100/50"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <div className="w-5 h-5 flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{objective}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Course Modules */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {FUNDAMENTALS_MODULES.map((module, moduleIdx) => {
          const ModuleIcon = iconMap[module.icon] || BookOpen;
          const moduleCompletedLessons = module.lessons.filter(l => completedLessons.includes(l.id));
          const moduleProgress = Math.round((moduleCompletedLessons.length / module.lessons.length) * 100);
          const isModuleComplete = moduleCompletedLessons.length === module.lessons.length;
          const moduleEarnedXP = moduleCompletedLessons.reduce((sum, l) => sum + l.xp, 0);

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + moduleIdx * 0.05 }}
            >
              <Card
                className={cn(
                  "border-0 overflow-hidden transition-all",
                  isModuleComplete && "ring-2 ring-amber-200"
                )}
                style={{ ...GLASS.css.standard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                {/* Module Header */}
                <div
                  className={cn(
                    "p-4 border-b",
                    isModuleComplete
                      ? "bg-gradient-to-r from-violet-50 to-amber-50 border-amber-100"
                      : "bg-gradient-to-r from-violet-50/50 to-purple-50/30 border-violet-100/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={cn(
                          "w-12 h-12 flex items-center justify-center",
                          isModuleComplete
                            ? "bg-gradient-to-br from-violet-500 to-amber-500"
                            : "bg-gradient-to-br from-violet-500 to-purple-600"
                        )}
                        style={{ borderRadius: RADIUS.button }}
                        whileHover={{ scale: 1.05, rotate: 3 }}
                      >
                        {isModuleComplete ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <ModuleIcon className="w-6 h-6 text-white" />
                        )}
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>
                            Module {moduleIdx + 1}: {module.title}
                          </h3>
                          {isModuleComplete && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">
                              Complete
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm">{module.description}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className={cn(
                          "font-bold",
                          isModuleComplete ? "text-emerald-600" : "text-violet-600"
                        )}>
                          {moduleCompletedLessons.length}/{module.lessons.length}
                        </p>
                        <p className="text-gray-400 text-xs">Lessons</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-amber-600">{moduleEarnedXP}/{module.xpTotal}</p>
                        <p className="text-gray-400 text-xs">XP</p>
                      </div>
                    </div>
                  </div>

                  {/* Module Progress Bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-white/80 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          isModuleComplete
                            ? "bg-gradient-to-r from-violet-500 via-purple-500 to-amber-500"
                            : "bg-gradient-to-r from-violet-500 to-purple-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${moduleProgress}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Lessons List */}
                <CardContent className="p-4 space-y-2">
                  {module.lessons.map((lesson, lessonIdx) => {
                    const LessonIcon = lessonTypeIcons[lesson.type];
                    const isComplete = completedLessons.includes(lesson.id);
                    const prevComplete = lessonIdx === 0 || completedLessons.includes(module.lessons[lessonIdx - 1].id);

                    return (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + lessonIdx * 0.03 }}
                        whileHover={{ x: 4 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                          isComplete
                            ? "bg-violet-50/80 border-amber-200/50"
                            : prevComplete
                              ? "bg-white border-violet-200/50 hover:border-violet-300 hover:shadow-sm"
                              : "bg-gray-50/80 border-gray-200/50 opacity-60"
                        )}
                        onClick={() => {
                          if (prevComplete || isComplete) {
                            onToggleLesson(lesson.id);
                            onStartLesson?.(lesson, module.id);
                          }
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                            isComplete
                              ? "bg-amber-500 text-white"
                              : prevComplete
                                ? "border-2 border-violet-300 text-violet-400"
                                : "border-2 border-gray-300 text-gray-400"
                          )}
                        >
                          {isComplete ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <span className="text-xs font-medium">{lessonIdx + 1}</span>
                          )}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={cn(
                              "font-medium text-sm",
                              isComplete ? "text-violet-700" : "text-gray-900"
                            )}>
                              {lesson.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={cn(
                              "flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full",
                              lessonTypeColors[lesson.type]
                            )}>
                              <LessonIcon className="w-3 h-3" />
                              {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                              <Clock className="w-3 h-3" />
                              {lesson.duration}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                              <Award className="w-3 h-3" />
                              +{lesson.xp} XP
                            </span>
                          </div>
                        </div>

                        {/* Action */}
                        {!isComplete && prevComplete && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs"
                            style={{ borderRadius: RADIUS.button }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartLesson?.(lesson, module.id);
                            }}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {isComplete && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">
                            Done
                          </Badge>
                        )}
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Course Complete Celebration */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="border-0 overflow-hidden relative bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 text-white"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            />
            <CardContent className="relative p-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Award className="w-10 h-10 text-amber-300" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Course Complete!</h3>
              <p className="text-white/80 mb-4">
                Congratulations! You've earned {totalXP.toLocaleString()} XP and completed all {totalLessons} lessons.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Badge className="bg-white/20 text-white border-0 px-4 py-2 text-sm">
                  <Award className="w-4 h-4 mr-2" />
                  Certificate Earned
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// HERITAGE PRODUCTS TRAINING DATA & COMPONENT
// ============================================================================

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: 'shield' | 'heart' | 'dollar' | 'clock' | 'users' | 'star';
  gradient: string;
  products: {
    id: string;
    name: string;
    tagline: string;
    features: string[];
    bestFor: string;
    xp: number;
  }[];
}

export const HERITAGE_PRODUCTS: ProductCategory[] = [
  {
    id: 'term',
    name: 'Term Life Insurance',
    description: 'Affordable protection for a specific period',
    icon: 'clock',
    gradient: 'from-violet-500 to-purple-500',
    products: [
      {
        id: 'term-10',
        name: '10-Year Term',
        tagline: 'Short-term coverage at the lowest rates',
        features: ['Level premiums for 10 years', 'Convertible to permanent', 'No medical exam options'],
        bestFor: 'Young families, temporary needs',
        xp: 25,
      },
      {
        id: 'term-20',
        name: '20-Year Term',
        tagline: 'Our most popular term product',
        features: ['Level premiums for 20 years', 'Living benefits rider', 'Accelerated underwriting'],
        bestFor: 'Mortgage protection, income replacement',
        xp: 25,
      },
      {
        id: 'term-30',
        name: '30-Year Term',
        tagline: 'Extended protection through major life stages',
        features: ['Level premiums for 30 years', 'Child rider available', 'Premium return option'],
        bestFor: 'Long-term family protection',
        xp: 25,
      },
    ],
  },
  {
    id: 'whole',
    name: 'Whole Life Insurance',
    description: 'Lifetime protection with cash value growth',
    icon: 'shield',
    gradient: 'from-violet-500 to-purple-500',
    products: [
      {
        id: 'whole-traditional',
        name: 'Traditional Whole Life',
        tagline: 'Guaranteed protection for life',
        features: ['Guaranteed death benefit', 'Cash value accumulation', 'Dividend eligible'],
        bestFor: 'Estate planning, wealth transfer',
        xp: 30,
      },
      {
        id: 'whole-limited',
        name: 'Limited Pay Whole Life',
        tagline: 'Pay off your policy faster',
        features: ['10, 15, or 20 year pay options', 'Fully paid up policy', 'Higher cash values'],
        bestFor: 'High earners, retirement planning',
        xp: 30,
      },
    ],
  },
  {
    id: 'iul',
    name: 'Indexed Universal Life',
    description: 'Flexible coverage with market-linked growth',
    icon: 'dollar',
    gradient: 'from-purple-500 to-violet-500',
    products: [
      {
        id: 'iul-growth',
        name: 'Growth IUL',
        tagline: 'Maximize cash value potential',
        features: ['S&P 500 index options', 'Floor protection (0%)', 'Tax-advantaged growth'],
        bestFor: 'Supplemental retirement, accumulation',
        xp: 35,
      },
      {
        id: 'iul-protection',
        name: 'Protection IUL',
        tagline: 'Balance of protection and growth',
        features: ['Lower premiums', 'Guaranteed death benefit', 'Flexible premiums'],
        bestFor: 'Business owners, key person coverage',
        xp: 35,
      },
    ],
  },
  {
    id: 'final-expense',
    name: 'Final Expense',
    description: 'Simplified coverage for end-of-life costs',
    icon: 'heart',
    gradient: 'from-violet-500 to-amber-500',
    products: [
      {
        id: 'fe-simplified',
        name: 'Simplified Issue',
        tagline: 'No medical exam required',
        features: ['Health questions only', 'Quick approval', '$5K-$25K coverage'],
        bestFor: 'Seniors 50-85, funeral costs',
        xp: 25,
      },
      {
        id: 'fe-guaranteed',
        name: 'Guaranteed Issue',
        tagline: 'Coverage for everyone',
        features: ['No health questions', 'Graded benefits', '2-year waiting period'],
        bestFor: 'Those with health issues',
        xp: 25,
      },
    ],
  },
];

interface HeritageProductsTrainingProps {
  completedProducts: string[];
  onToggleProduct: (productId: string) => void;
  className?: string;
}

export function HeritageProductsTraining({
  completedProducts,
  onToggleProduct,
  className
}: HeritageProductsTrainingProps) {
  const totalProducts = HERITAGE_PRODUCTS.reduce((sum, cat) => sum + cat.products.length, 0);
  const completedCount = completedProducts.length;
  const progress = Math.round((completedCount / totalProducts) * 100);
  const totalXP = HERITAGE_PRODUCTS.reduce((sum, cat) =>
    sum + cat.products.reduce((pSum, p) => pSum + p.xp, 0), 0);
  const earnedXP = HERITAGE_PRODUCTS.reduce((sum, cat) =>
    sum + cat.products.filter(p => completedProducts.includes(p.id)).reduce((pSum, p) => pSum + p.xp, 0), 0);

  const iconMap: Record<string, React.ElementType> = {
    shield: CheckCircle2,
    heart: Star,
    dollar: Award,
    clock: Clock,
    users: Users,
    star: Star,
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.duration.normal }}
      >
        <Card
          className="border-0 overflow-hidden relative"
          style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />

          {/* Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full translate-y-1/2 -translate-x-1/4" />

          <CardContent className="relative p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left Side - Info */}
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <BookOpen className="w-7 h-7 text-amber-200" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-amber-400/20 text-amber-100 border-0 text-xs">Product Training</Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Heritage Product Suite
                  </h2>
                  <p className="text-white/70 text-sm mt-1">
                    Master our complete product lineup
                  </p>
                </div>
              </div>

              {/* Right Side - Progress */}
              <div className="flex items-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                  <p className="text-white font-bold text-lg">{completedCount}/{totalProducts}</p>
                  <p className="text-white/60 text-xs">Products</p>
                </div>
                <div className="bg-amber-400/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                  <p className="text-amber-100 font-bold text-lg">{earnedXP}</p>
                  <p className="text-amber-200/60 text-xs">XP Earned</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Product Categories */}
      <div className="grid gap-4">
        {HERITAGE_PRODUCTS.map((category, catIdx) => {
          const CategoryIcon = iconMap[category.icon] || BookOpen;
          const categoryCompleted = category.products.filter(p => completedProducts.includes(p.id));
          const categoryProgress = Math.round((categoryCompleted.length / category.products.length) * 100);

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + catIdx * 0.05 }}
            >
              <Card
                className="border-0 overflow-hidden"
                style={{ ...GLASS.css.standard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                {/* Category Header */}
                <div className="p-4 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={cn("w-10 h-10 flex items-center justify-center bg-gradient-to-br", category.gradient)}
                        style={{ borderRadius: RADIUS.button }}
                        whileHover={{ scale: 1.05, rotate: 3 }}
                      >
                        <CategoryIcon className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>
                          {category.name}
                        </h3>
                        <p className="text-gray-500 text-xs">{category.description}</p>
                      </div>
                    </div>
                    <Badge className={cn("border-0 text-white text-xs bg-gradient-to-r", category.gradient)}>
                      {categoryCompleted.length}/{category.products.length}
                    </Badge>
                  </div>

                  {/* Category Progress */}
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full bg-gradient-to-r", category.gradient)}
                      initial={{ width: 0 }}
                      animate={{ width: `${categoryProgress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Products Grid */}
                <CardContent className="p-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.products.map((product, prodIdx) => {
                      const isComplete = completedProducts.includes(product.id);

                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 + prodIdx * 0.03 }}
                          whileHover={{ y: -2, scale: 1.01 }}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-all",
                            isComplete
                              ? "bg-emerald-50/80 border-emerald-200/50"
                              : "bg-white border-gray-200/50 hover:border-violet-200 hover:shadow-md"
                          )}
                          onClick={() => onToggleProduct(product.id)}
                        >
                          {/* Product Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className={cn(
                                "font-semibold text-sm",
                                isComplete ? "text-violet-700" : "text-gray-900"
                              )}>
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5">{product.tagline}</p>
                            </div>
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-2",
                              isComplete ? "bg-emerald-500 text-white" : "border-2 border-gray-300"
                            )}>
                              {isComplete && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>

                          {/* Features */}
                          <div className="space-y-1 mb-3">
                            {product.features.slice(0, 2).map((feature, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                                <div className={cn("w-1 h-1 rounded-full bg-gradient-to-r", category.gradient)} />
                                {feature}
                              </div>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                              {product.bestFor}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                              <Award className="w-3 h-3" />
                              +{product.xp} XP
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Completion */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="border-0 overflow-hidden relative bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 text-white"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardContent className="relative p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <Award className="w-8 h-8 text-amber-300" />
              </motion.div>
              <h3 className="text-xl font-bold mb-1">Product Training Complete!</h3>
              <p className="text-white/80 text-sm">
                You've mastered all {totalProducts} Heritage products and earned {totalXP} XP.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
