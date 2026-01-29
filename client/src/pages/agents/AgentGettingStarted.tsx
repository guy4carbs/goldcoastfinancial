import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  GraduationCap,
  FileText,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Video,
  ExternalLink,
  ChevronRight,
  Award,
  MapPin,
  Calendar,
  Lightbulb,
  Target,
  Shield,
  HelpCircle,
  Play,
  Star,
  ChevronsUpDown,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Licensing steps checklist with real links
interface LicensingStep {
  id: string;
  title: string;
  description: string;
  hours: string;
  resources: { label: string; url: string }[];
  required: boolean;
}

const LICENSING_STEPS: LicensingStep[] = [
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
    title: 'Submit License Application',
    description: 'Apply through your state\'s Department of Insurance via NIPR',
    hours: '1-2 hours',
    resources: [
      { label: 'NIPR (National Insurance Producer Registry)', url: 'https://nipr.com/' },
    ],
    required: true
  },
  {
    id: 'step-3',
    title: 'Complete Background Check',
    description: 'Fingerprinting and background verification',
    hours: 'Varies by state',
    resources: [
      { label: 'IdentoGO', url: 'https://www.identogo.com/' },
    ],
    required: true
  },
  {
    id: 'step-4',
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
    resources: [
      { label: 'Carrier Partners & Portals', url: '/agents/resources' },
    ],
    required: true
  },
  {
    id: 'step-7',
    title: 'Complete Heritage Life Onboarding',
    description: 'Complete compliance training, product certification modules, and agent portal setup',
    hours: '4-8 hours',
    resources: [
      { label: 'Heritage Life Training Portal', url: '/agents/training' },
    ],
    required: true
  }
];

// Study resources
const STUDY_RESOURCES = [
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

// Video tutorials
const VIDEO_TUTORIALS = [
  { id: 'vid-1', title: 'Understanding Life Insurance Types', duration: '12:34', thumbnail: 'Term vs Whole Life', views: 4500 },
  { id: 'vid-2', title: 'How to Pass Your State Exam', duration: '18:22', thumbnail: 'Exam Tips', views: 8200 },
  { id: 'vid-3', title: 'Navigating the Licensing Process', duration: '15:45', thumbnail: 'Step by Step', views: 3100 },
  { id: 'vid-4', title: 'Common Exam Questions Explained', duration: '24:18', thumbnail: 'Q&A Review', views: 6700 },
];

// All 50 states + DC with real pre-licensing requirements
// hours: pre-license education hours required for Life line
// examFee: state exam fee
// renewalYears: license renewal cycle in years
// ce: continuing education hours per renewal cycle
const STATE_REQUIREMENTS: Record<string, { hours: number; examFee: number; renewalYears: number; ce: number }> = {
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

const ALL_STATES = Object.keys(STATE_REQUIREMENTS).sort();

export default function AgentGettingStarted() {
  const [completedSteps, setCompletedSteps] = useState<string[]>(['step-1']);
  const [selectedState, setSelectedState] = useState('Illinois');
  const [stateOpen, setStateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('checklist');

  const progress = Math.round((completedSteps.length / LICENSING_STEPS.length) * 100);
  const stateReqs = STATE_REQUIREMENTS[selectedState];

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const handleWatchVideo = (videoTitle: string) => {
    toast.info('Video player opening', { description: videoTitle });
  };

  const isExternalLink = (url: string) => url.startsWith('http');

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <div className="bg-gradient-to-r from-primary to-violet-600 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <GraduationCap className="w-7 h-7 text-white" />
                  Getting Started
                </h1>
                <p className="text-gray-100">
                  Your roadmap to becoming a licensed insurance agent with Heritage Life
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{progress}%</p>
                  <p className="text-xs text-gray-200">Complete</p>
                </div>
                <div className="w-24 h-24 relative">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                    <circle
                      cx="48" cy="48" r="40" fill="none" stroke="white" strokeWidth="8"
                      strokeDasharray={`${progress * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <Award className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* State Selector */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-violet-500" />
                  <div>
                    <p className="font-medium">Your State</p>
                    <p className="text-sm text-gray-500">Requirements vary by state</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Popover open={stateOpen} onOpenChange={setStateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={stateOpen}
                        className="w-[240px] justify-between"
                      >
                        {selectedState}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-0">
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
                                setSelectedState(state);
                                setStateOpen(false);
                              }}
                            >
                              <Check className={cn(
                                "mr-2 h-4 w-4",
                                selectedState === state ? "opacity-100" : "opacity-0"
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
                      className="h-8 w-8 text-gray-400 hover:text-gray-600"
                      onClick={() => setSelectedState('Illinois')}
                      aria-label="Reset to default state"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{stateReqs.hours}</p>
                  <p className="text-xs text-gray-500">Pre-License Hours</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">${stateReqs.examFee}</p>
                  <p className="text-xs text-gray-500">Exam Fee</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{stateReqs.renewalYears}</p>
                  <p className="text-xs text-gray-500">Years to Renew</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{stateReqs.ce}</p>
                  <p className="text-xs text-gray-500">CE Hours/Cycle</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="checklist" className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Licensing Checklist
              </TabsTrigger>
              <TabsTrigger value="study" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Study Resources
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="w-4 h-4" />
                Video Tutorials
              </TabsTrigger>
              <TabsTrigger value="tips" className="gap-2">
                <Lightbulb className="w-4 h-4" />
                Exam Tips
              </TabsTrigger>
            </TabsList>

            {/* Checklist Tab */}
            <TabsContent value="checklist" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-violet-500" />
                    Licensing Roadmap
                  </CardTitle>
                  <CardDescription>
                    Complete each step to become a fully licensed agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-gray-500">{completedSteps.length} of {LICENSING_STEPS.length} complete</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  <div className="space-y-4">
                    {LICENSING_STEPS.map((step, index) => {
                      const isComplete = completedSteps.includes(step.id);
                      const isPrevComplete = index === 0 || completedSteps.includes(LICENSING_STEPS[index - 1].id);

                      return (
                        <div
                          key={step.id}
                          className={cn(
                            "relative pl-10 pb-4",
                            index !== LICENSING_STEPS.length - 1 && "border-l-2 border-gray-200 ml-4"
                          )}
                        >
                          {/* Step indicator */}
                          <div
                            role="button"
                            tabIndex={0}
                            aria-label={`${isComplete ? 'Completed' : 'Mark complete'}: Step ${index + 1} - ${step.title}`}
                            className={cn(
                              "absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center -translate-x-1/2 cursor-pointer transition-all",
                              isComplete
                                ? "bg-green-500 text-white"
                                : isPrevComplete
                                  ? "bg-violet-500 text-white animate-pulse"
                                  : "bg-gray-200 text-gray-400"
                            )}
                            onClick={() => toggleStep(step.id)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStep(step.id); } }}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <span className="font-bold text-sm">{index + 1}</span>
                            )}
                          </div>

                          {/* Step content */}
                          <div className={cn(
                            "p-4 rounded-lg border transition-all",
                            isComplete
                              ? "bg-green-50 border-green-200"
                              : isPrevComplete
                                ? "bg-violet-50 border-violet-200"
                                : "bg-gray-50 border-gray-200"
                          )}>
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className={cn(
                                  "font-medium",
                                  isComplete ? "text-green-700" : isPrevComplete ? "text-violet-700" : "text-gray-500"
                                )}>
                                  {step.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {step.hours}
                                  </span>
                                </div>
                              </div>
                              <Checkbox
                                checked={isComplete}
                                onCheckedChange={() => toggleStep(step.id)}
                              />
                            </div>
                            {step.resources.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-dashed flex flex-wrap gap-2">
                                {step.resources.map(resource => (
                                  isExternalLink(resource.url) ? (
                                    <a
                                      key={resource.label}
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-violet-50 hover:border-violet-300">
                                        {resource.label}
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </Badge>
                                    </a>
                                  ) : (
                                    <Link key={resource.label} href={resource.url}>
                                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-violet-50 hover:border-violet-300">
                                        {resource.label}
                                        <ChevronRight className="w-3 h-3 ml-1" />
                                      </Badge>
                                    </Link>
                                  )
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Study Resources Tab */}
            <TabsContent value="study" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {STUDY_RESOURCES.map(resource => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={cn(
                          "text-xs",
                          resource.type === 'course' && "bg-blue-100 text-blue-700",
                          resource.type === 'practice' && "bg-green-100 text-green-700",
                          resource.type === 'flashcards' && "bg-amber-100 text-amber-700"
                        )}>
                          {resource.type}
                        </Badge>
                        {resource.free ? (
                          <Badge className="bg-green-500 text-white">Free</Badge>
                        ) : (
                          <Badge variant="outline" className="text-violet-600 font-mono">
                            Code: {resource.discountCode}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-primary mb-1">{resource.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{resource.provider}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            {resource.rating}
                          </span>
                          <span className="text-gray-400">{resource.enrolled.toLocaleString()} enrolled</span>
                        </div>
                        <span className="text-gray-500">{resource.duration}</span>
                      </div>
                      {isExternalLink(resource.href) ? (
                        <a href={resource.href} target="_blank" rel="noopener noreferrer">
                          <Button className="w-full mt-4 gap-1">
                            {resource.type === 'course' ? 'Start Course' : resource.type === 'practice' ? 'Start Practice' : 'Open Flashcards'}
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      ) : (
                        <Link href={resource.href}>
                          <Button className="w-full mt-4">
                            {resource.type === 'course' ? 'Start Course' : resource.type === 'practice' ? 'Start Practice' : 'Open Flashcards'}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Video Tutorials Tab */}
            <TabsContent value="videos" className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {VIDEO_TUTORIALS.map(video => (
                  <Card
                    key={video.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Watch: ${video.title} (${video.duration})`}
                    className="cursor-pointer hover:shadow-md transition-shadow group"
                    onClick={() => handleWatchVideo(video.title)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleWatchVideo(video.title); } }}
                  >
                    <CardContent className="p-0">
                      <div className="relative bg-gradient-to-br from-primary to-violet-600 h-32 rounded-t-lg flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-t-lg" />
                        <Play className="w-12 h-12 text-white relative z-10 group-hover:scale-110 transition-transform" />
                        <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
                          {video.duration}
                        </Badge>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{video.views.toLocaleString()} views</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Exam Tips Tab */}
            <TabsContent value="tips" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Study Strategies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      'Study in short 30-45 minute sessions',
                      'Focus on understanding concepts, not memorization',
                      'Take practice exams under timed conditions',
                      'Review incorrect answers thoroughly',
                      'Study state-specific regulations last'
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      Exam Day Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      'Arrive 30 minutes early to the testing center',
                      'Bring two forms of valid ID',
                      'Read each question completely before answering',
                      'Eliminate obviously wrong answers first',
                      'Don\'t change answers unless you\'re certain'
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-violet-500" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { q: 'How long does the licensing process take?', a: 'Typically 2-4 weeks from start to finish, depending on your state and how quickly you complete the coursework.' },
                      { q: 'What is the pass rate for the state exam?', a: 'The national average is around 60-70% on the first attempt. With proper preparation, you can significantly increase your chances.' },
                      { q: 'Can I take the exam online?', a: 'Some states offer online proctored exams. Check with your state\'s Department of Insurance for current options.' },
                      { q: 'What if I fail the exam?', a: 'You can retake the exam after a waiting period (usually 24-48 hours). Most states allow unlimited attempts.' }
                    ].map((faq, i) => (
                      <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                        <h4 className="font-medium text-primary mb-1">{faq.q}</h4>
                        <p className="text-sm text-gray-600">{faq.a}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
