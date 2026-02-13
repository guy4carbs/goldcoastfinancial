import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
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
  Clock,
  BookOpen,
  Video,
  ExternalLink,
  ChevronRight,
  Award,
  MapPin,
  Lightbulb,
  Target,
  Shield,
  HelpCircle,
  Play,
  Star,
  ChevronsUpDown,
  Check,
  X,
  Leaf,
  ArrowLeft,
  LogIn,
  Rocket,
  ChevronDown,
  Lock,
  Users,
  Package,
  AlertTriangle,
  FileCheck,
  MessageSquare,
  Sparkles,
  Flame,
  Zap,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Training components
import { InstitutionalModuleViewer } from "@/components/agent/InstitutionalModuleViewer";
import { TrainingAssessment, type AssessmentResult } from "@/components/agent/TrainingAssessment";
import { CertificationPathway } from "@/components/agent/CertificationPathway";
import {
  TrainingSidebar,
  CertificationEarnedModal,
  ModuleCompletedCelebration,
  StreakMilestoneCelebration,
  OfflineIndicator,
  CertificationPathwayVertical,
  calculateModuleXP,
  getStreakMultiplier,
  XPEarnedPopup,
  LevelUpCelebration,
  DailyChallengeCard,
  ModuleRating,
  RetentionQuiz,
  useOfflineStorage,
} from "@/components/training";
import type { XPEarnedEvent, RetentionQuestion } from "@/components/training";

import {
  INSTITUTIONAL_MODULES,
  CERTIFICATION_GATES,
  ASSESSMENTS,
  getModuleById,
  getAssessmentById,
  type TrainingModuleData,
  type CertificationStatus,
  type Assessment,
} from "@/lib/trainingData";
import { useAgentStore } from "@/lib/agentStore";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Training state management
interface TrainingProgress {
  completedModules: string[];
  completedSections: Record<string, string[]>;
  passedAssessments: string[];
  certificationStatuses: Record<string, CertificationStatus>;
  assessmentAttempts: Record<string, number>;
  lastSyncedAt: string;
}

const STORAGE_KEY = 'gcf-training-progress';

const LEVEL_THRESHOLDS = [
  { threshold: 0, name: 'Newcomer', color: 'gray' },
  { threshold: 500, name: 'Apprentice', color: 'green' },
  { threshold: 1500, name: 'Advisor', color: 'blue' },
  { threshold: 3000, name: 'Senior Advisor', color: 'purple' },
  { threshold: 5000, name: 'Expert', color: 'gold' },
  { threshold: 10000, name: 'Master', color: 'diamond' }
] as const;

const STREAK_MILESTONES = [7, 14, 30, 60, 100] as const;

const useTrainingState = () => {
  const getInitialState = (): TrainingProgress => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastSyncedAt: new Date().toISOString()
        };
      }
    } catch (e) {
      console.error('Failed to load training progress:', e);
    }
    return {
      completedModules: [],
      completedSections: {},
      passedAssessments: [],
      certificationStatuses: {
        'cert-pre-access': 'in_progress',
        'cert-core-advisor': 'locked',
        'cert-live-client': 'locked',
        'cert-state-il': 'locked',
        'cert-annual-compliance': 'locked'
      },
      assessmentAttempts: {},
      lastSyncedAt: new Date().toISOString()
    };
  };

  const [state, setState] = useState<TrainingProgress>(getInitialState);

  useEffect(() => {
    const toSave = {
      ...state,
      lastSyncedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch (err) {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setCompletedModules = (fn: (prev: string[]) => string[]) => {
    setState(prev => ({ ...prev, completedModules: fn(prev.completedModules) }));
  };

  const setCompletedSections = (fn: (prev: Record<string, string[]>) => Record<string, string[]>) => {
    setState(prev => ({ ...prev, completedSections: fn(prev.completedSections) }));
  };

  const setPassedAssessments = (fn: (prev: string[]) => string[]) => {
    setState(prev => ({ ...prev, passedAssessments: fn(prev.passedAssessments) }));
  };

  const setCertificationStatuses = (fn: (prev: Record<string, CertificationStatus>) => Record<string, CertificationStatus>) => {
    setState(prev => ({ ...prev, certificationStatuses: fn(prev.certificationStatuses) }));
  };

  const setAssessmentAttempts = (fn: (prev: Record<string, number>) => Record<string, number>) => {
    setState(prev => ({ ...prev, assessmentAttempts: fn(prev.assessmentAttempts) }));
  };

  return {
    completedModules: state.completedModules,
    setCompletedModules,
    completedSections: state.completedSections,
    setCompletedSections,
    passedAssessments: state.passedAssessments,
    setPassedAssessments,
    certificationStatuses: state.certificationStatuses,
    setCertificationStatuses,
    assessmentAttempts: state.assessmentAttempts,
    setAssessmentAttempts,
    lastSyncedAt: state.lastSyncedAt
  };
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

// State requirements
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

// Category styling for training modules
const categoryStyles: Record<string, { bg: string; text: string; border: string; icon: typeof Shield }> = {
  onboarding: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200', icon: Rocket },
  doctrine: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', icon: Shield },
  compliance: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: FileCheck },
  methodology: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', icon: Target },
  product: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200', icon: Package },
  sales: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', icon: Target },
  objection_handling: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', icon: MessageSquare },
  client_scenarios: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200', icon: Users },
  client_facilitation: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200', icon: Users },
  state_specific: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200', icon: MapPin },
  ongoing_compliance: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: FileCheck }
};

export default function AgentOnboarding() {
  const [, setLocation] = useLocation();
  const [completedSteps, setCompletedSteps] = useState<string[]>(['step-1']);
  const [selectedState, setSelectedState] = useState('Illinois');
  const [stateOpen, setStateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('licensing');
  const [expandedCertification, setExpandedCertification] = useState<string | null>('cert-pre-access');

  // Training state from hook
  const {
    completedModules,
    setCompletedModules,
    completedSections,
    setCompletedSections,
    passedAssessments,
    setPassedAssessments,
    certificationStatuses,
    setCertificationStatuses,
    assessmentAttempts,
    setAssessmentAttempts,
    lastSyncedAt
  } = useTrainingState();

  // Training UI state
  const [selectedModule, setSelectedModule] = useState<TrainingModuleData | null>(null);
  const [moduleViewerOpen, setModuleViewerOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [failedAssessmentResult, setFailedAssessmentResult] = useState<AssessmentResult | null>(null);
  const [showAssessmentFailDialog, setShowAssessmentFailDialog] = useState(false);
  const [pendingModuleCompletion, setPendingModuleCompletion] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'not-started' | 'in-progress' | 'completed' | 'locked'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'onboarding' | 'doctrine' | 'compliance' | 'methodology' | 'product' | 'client_facilitation'>('all');

  // Celebration state
  const [showModuleCelebration, setShowModuleCelebration] = useState(false);
  const [completedModuleName, setCompletedModuleName] = useState('');
  const [certificationEarned, setCertificationEarned] = useState<{
    name: string;
    level: string;
    date: Date;
  } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  // Gamification state
  const [xpEarnedEvent, setXpEarnedEvent] = useState<XPEarnedEvent | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<{ name: string; color: string } | null>(null);
  const { performance } = useAgentStore();
  const currentStreak = performance.currentStreak;
  const [totalXP, setTotalXP] = useState(performance.xp);

  // Module rating & retention quiz
  const [showModuleRating, setShowModuleRating] = useState(false);
  const [ratingModuleId, setRatingModuleId] = useState<string | null>(null);
  const [ratingModuleTitle, setRatingModuleTitle] = useState('');
  const [showRetentionQuiz, setShowRetentionQuiz] = useState(false);
  const [retentionQuestions, setRetentionQuestions] = useState<RetentionQuestion[]>([]);

  // Offline storage
  const [downloadedModules, setDownloadedModules] = useState<string[]>([]);
  const offlineStorage = useOfflineStorage({ storeName: 'modules' });

  useEffect(() => {
    if (offlineStorage.isReady) {
      offlineStorage.getAllItems().then((items) => {
        setDownloadedModules(items.map(item => item.id));
      });
    }
  }, [offlineStorage.isReady]);

  const progress = Math.round((completedSteps.length / LICENSING_STEPS.length) * 100);
  const stateReqs = STATE_REQUIREMENTS[selectedState];

  // Calculate overall training progress
  const totalModules = INSTITUTIONAL_MODULES.length;
  const completedModulesCount = completedModules.length;
  const overallProgress = Math.round((completedModulesCount / totalModules) * 100);

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

  // Get modules by certification level
  const advancedComplianceIds = ['mod-compliance-stress', 'mod-suitability-defense'];
  const modulesByLevel = useMemo(() => {
    const preAccess = INSTITUTIONAL_MODULES.filter(m => m.certificationLevel === 'pre_access');
    const coreAdvisor = INSTITUTIONAL_MODULES.filter(m => m.certificationLevel === 'core_advisor');
    const liveClient = INSTITUTIONAL_MODULES.filter(m => m.certificationLevel === 'live_client');
    const ongoing = INSTITUTIONAL_MODULES.filter(m => m.certificationLevel === 'ongoing_compliance');

    return {
      onboarding: preAccess.filter(m => m.category === 'onboarding'),
      doctrine: preAccess.filter(m => m.category === 'doctrine' || m.category === 'compliance'),
      methodology: coreAdvisor.filter(m => m.category === 'methodology'),
      advanced_compliance: coreAdvisor.filter(m => advancedComplianceIds.includes(m.id)),
      product: coreAdvisor.filter(m => m.category === 'product'),
      client_facilitation: liveClient.filter(m => m.category === 'client_facilitation'),
      pre_access: preAccess,
      core_advisor: coreAdvisor,
      live_client: liveClient,
      ongoing
    };
  }, []);

  // Module groups for sidebar
  const moduleGroups = useMemo(() => [
    { id: 'onboarding', name: 'Getting Started', icon: Rocket, level: 'pre_access' as const, modules: modulesByLevel.onboarding },
    { id: 'doctrine', name: 'Doctrine & Compliance', icon: Shield, level: 'pre_access' as const, modules: modulesByLevel.doctrine },
    { id: 'methodology', name: 'Methodology', icon: Target, level: 'core_advisor' as const, modules: modulesByLevel.methodology },
    { id: 'advanced_compliance', name: 'Advanced Compliance', icon: AlertTriangle, level: 'core_advisor' as const, modules: modulesByLevel.advanced_compliance },
    { id: 'product', name: 'Product Knowledge', icon: Package, level: 'core_advisor' as const, modules: modulesByLevel.product },
    { id: 'client_facilitation', name: 'Client Facilitation', icon: Users, level: 'live_client' as const, modules: modulesByLevel.client_facilitation }
  ], [modulesByLevel]);

  // Current certification in progress
  const currentCertification = useMemo(() => {
    return CERTIFICATION_GATES.find(c => certificationStatuses[c.id] === 'in_progress');
  }, [certificationStatuses]);

  // Next required module
  const nextRequiredModule = useMemo(() => {
    if (!currentCertification) return null;
    return currentCertification.requiredModules
      .map(id => getModuleById(id))
      .find(m => m && !completedModules.includes(m.id));
  }, [currentCertification, completedModules]);

  // Check if a module is locked
  const isModuleLocked = useCallback((module: TrainingModuleData): boolean => {
    const levelOrder: string[] = ['pre_access', 'core_advisor', 'live_client', 'state_expansion', 'ongoing_compliance'];
    const moduleLevelIdx = levelOrder.indexOf(module.certificationLevel);
    if (moduleLevelIdx > 0) {
      for (let li = 0; li < moduleLevelIdx; li++) {
        const priorLevel = levelOrder[li];
        const priorModules = INSTITUTIONAL_MODULES.filter(m => m.certificationLevel === priorLevel);
        for (const pm of priorModules) {
          if (!completedModules.includes(pm.id)) return true;
          if (pm.assessmentRequired && pm.assessmentId && !passedAssessments.includes(pm.assessmentId)) return true;
        }
      }
    }

    const prereqsMet = module.prerequisiteModules.every(p => completedModules.includes(p));
    if (!prereqsMet) return true;

    for (const prereqId of module.prerequisiteModules) {
      const prereqModule = getModuleById(prereqId);
      if (prereqModule?.assessmentRequired && prereqModule.assessmentId) {
        if (!passedAssessments.includes(prereqModule.assessmentId)) {
          return true;
        }
      }
    }

    const groups = [
      modulesByLevel.onboarding,
      modulesByLevel.doctrine,
      modulesByLevel.methodology,
      modulesByLevel.advanced_compliance,
      modulesByLevel.product,
      modulesByLevel.client_facilitation,
    ];
    for (const group of groups) {
      const idx = group.findIndex(m => m.id === module.id);
      if (idx > 0) {
        for (let i = 0; i < idx; i++) {
          if (!completedModules.includes(group[i].id)) return true;
          const prev = group[i];
          if (prev.assessmentRequired && prev.assessmentId && !passedAssessments.includes(prev.assessmentId)) {
            return true;
          }
        }
      }
    }

    return false;
  }, [completedModules, passedAssessments, modulesByLevel]);

  // Retention questions by module
  const getRetentionQuestions = useCallback((moduleId: string): RetentionQuestion[] => {
    const module = getModuleById(moduleId);
    if (!module) return [];

    const questionsByCategory: Record<string, RetentionQuestion[]> = {
      'onboarding': [{
        id: 'rq1',
        question: 'What is the primary mission of Gold Coast Financial?',
        options: ['Maximize sales volume', 'Education-first client approach', 'Compete on price', 'Quick policy turnaround'],
        correctIndex: 1,
        explanation: 'Gold Coast Financial is built on an education-first philosophy.',
        topic: 'Company Mission',
        moduleId
      }],
      'doctrine': [{
        id: 'rq2',
        question: 'What must always come before product recommendation?',
        options: ['Price comparison', 'Needs analysis and education', 'Carrier selection', 'Application completion'],
        correctIndex: 1,
        explanation: 'A thorough needs analysis and client education must precede any product recommendation.',
        topic: 'Doctrine Principles',
        moduleId
      }],
      'compliance': [{
        id: 'rq3',
        question: 'What is the primary purpose of suitability analysis?',
        options: ['Increase commission', 'Document client rejection', 'Ensure product fits client needs', 'Speed up sales process'],
        correctIndex: 2,
        explanation: 'Suitability analysis ensures recommended products match the client\'s needs.',
        topic: 'Compliance Requirements',
        moduleId
      }]
    };

    return questionsByCategory[module.category] || questionsByCategory['doctrine'];
  }, []);

  // Training handlers
  const handleCompleteSection = (moduleId: string, sectionId: string) => {
    setCompletedSections(prev => ({
      ...prev,
      [moduleId]: [...(prev[moduleId] || []), sectionId]
    }));
  };

  const handleCompleteModule = (moduleId: string) => {
    const mod = getModuleById(moduleId);
    if (mod?.assessmentRequired && mod.assessmentId && !passedAssessments.includes(mod.assessmentId)) {
      toast.error('Assessment Required', {
        description: 'You must pass the assessment before completing this module.'
      });
      return;
    }

    if (!completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId]);

      const module = getModuleById(moduleId);
      if (module) {
        setCompletedModuleName(module.title);
        setShowModuleCelebration(true);

        const xpEvent = calculateModuleXP(module.duration, currentStreak);
        setXpEarnedEvent(xpEvent);
        const newTotalXP = totalXP + xpEvent.totalXP;
        setTotalXP(newTotalXP);

        const oldLevel = LEVEL_THRESHOLDS.filter(l => l.threshold <= totalXP).pop();
        const newLevelObj = LEVEL_THRESHOLDS.filter(l => l.threshold <= newTotalXP).pop();

        if (oldLevel && newLevelObj && oldLevel.name !== newLevelObj.name) {
          setTimeout(() => {
            setNewLevel(newLevelObj);
            setShowLevelUp(true);
          }, 2000);
        }

        setTimeout(() => {
          const questions = getRetentionQuestions(moduleId);
          if (questions.length > 0) {
            setRetentionQuestions(questions);
            setShowRetentionQuiz(true);
          }
        }, 3000);
      }
    }
  };

  const handleOpenModule = (module: TrainingModuleData) => {
    setSelectedModule(module);
    setModuleViewerOpen(true);
  };

  const openModule = (module: TrainingModuleData) => {
    if (isModuleLocked(module)) {
      toast.error('Module Locked', {
        description: 'Complete the previous module first to unlock this one.'
      });
      return;
    }
    handleOpenModule(module);
  };

  const openAssessment = (assessmentId: string) => {
    const assessment = getAssessmentById(assessmentId);
    if (assessment) {
      setSelectedAssessment(assessment);
      setAssessmentOpen(true);
    }
  };

  // Effect to complete module after assessment pass
  useEffect(() => {
    if (pendingModuleCompletion && !completedModules.includes(pendingModuleCompletion)) {
      const mod = getModuleById(pendingModuleCompletion);
      if (mod?.assessmentId && passedAssessments.includes(mod.assessmentId)) {
        setCompletedModules(prev => [...prev, pendingModuleCompletion]);
        setCompletedModuleName(mod.title);
        setShowModuleCelebration(true);
        const xpEvent = calculateModuleXP(mod.duration, currentStreak);
        setXpEarnedEvent(xpEvent);
        setTotalXP(prev => prev + xpEvent.totalXP);
        setPendingModuleCompletion(null);
      }
    }
  }, [passedAssessments, pendingModuleCompletion, completedModules, currentStreak]);

  // Check for streak milestones
  useEffect(() => {
    if ((STREAK_MILESTONES as readonly number[]).includes(currentStreak)) {
      setShowStreakMilestone(true);
    }
  }, [currentStreak]);

  const handleAssessmentComplete = (result: AssessmentResult) => {
    if (result.passed) {
      setPassedAssessments(prev => [...prev, result.assessmentId]);
      toast.success('Assessment Passed!', {
        description: `You scored ${result.score}% - Great job!`
      });

      setModuleViewerOpen(false);

      const assessedModule = INSTITUTIONAL_MODULES.find(m => m.assessmentId === result.assessmentId);
      if (assessedModule && !completedModules.includes(assessedModule.id)) {
        const allSectionIds = assessedModule.sections.map(s => s.id);
        setCompletedSections(prev => ({
          ...prev,
          [assessedModule.id]: allSectionIds
        }));
        setPendingModuleCompletion(assessedModule.id);
      }

      const cert = CERTIFICATION_GATES.find(c =>
        c.requiredAssessments.includes(result.assessmentId)
      );
      if (cert) {
        const allModulesComplete = cert.requiredModules.every(m => completedModules.includes(m));
        const allAssessmentsComplete = cert.requiredAssessments.every(a =>
          passedAssessments.includes(a) || a === result.assessmentId
        );

        if (allModulesComplete && allAssessmentsComplete) {
          const newStatus = cert.managerApprovalRequired ? 'pending_review' : 'certified';
          setCertificationStatuses(prev => ({ ...prev, [cert.id]: newStatus }));

          if (newStatus === 'certified') {
            setCertificationEarned({
              name: cert.name,
              level: cert.id.replace('cert-', '').replace(/-/g, ' '),
              date: new Date()
            });
          }

          CERTIFICATION_GATES
            .filter(c => c.prerequisites.includes(cert.id))
            .forEach(nextCert => {
              setCertificationStatuses(prev => ({ ...prev, [nextCert.id]: 'available' }));
            });
        }
      }
    } else {
      setModuleViewerOpen(false);
      setFailedAssessmentResult(result);
      setShowAssessmentFailDialog(true);
    }

    setAssessmentAttempts(prev => ({
      ...prev,
      [result.assessmentId]: (prev[result.assessmentId] || 0) + 1
    }));
  };

  // Full Module Card with progress tracking
  const ModuleCard = ({ module, index }: { module: TrainingModuleData; index: number }) => {
    const isCompleted = completedModules.includes(module.id);
    const sectionCount = completedSections[module.id]?.length || 0;
    const moduleProgress = Math.round((sectionCount / module.sections.length) * 100);
    const style = categoryStyles[module.category] || categoryStyles.doctrine;
    const Icon = style.icon;
    const locked = isModuleLocked(module);
    const isInProgress = moduleProgress > 0 && !isCompleted;

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={!locked ? { y: -6, transition: { duration: 0.25, ease: "easeOut" } } : undefined}
        className="h-full"
      >
        <Card className={cn(
          "group relative h-full overflow-hidden transition-all duration-300 border-0",
          "shadow-sm hover:shadow-xl",
          isCompleted && "bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 ring-1 ring-emerald-200",
          locked && "opacity-60 grayscale-[30%]",
          isInProgress && "ring-1 ring-amber-200 bg-gradient-to-br from-amber-50/50 to-white",
          !locked && !isCompleted && !isInProgress && "bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-white"
        )}>
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1.5 transition-all duration-300",
            isCompleted
              ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
              : isInProgress
              ? "bg-gradient-to-r from-amber-400 to-orange-400"
              : `bg-gradient-to-r ${style.bg} opacity-80`
          )} />

          <CardContent className="p-4 sm:p-5 pt-4 sm:pt-5 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                  isCompleted
                    ? "bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-inner"
                    : locked
                    ? "bg-gray-100"
                    : isInProgress
                    ? "bg-gradient-to-br from-amber-100 to-amber-50"
                    : cn(style.bg, "group-hover:shadow-md")
                )}
                whileHover={!locked ? { scale: 1.05, rotate: 3 } : undefined}
                transition={{ duration: 0.2 }}
              >
                {locked ? (
                  <Lock className="w-5 h-5 text-gray-400" />
                ) : isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </motion.div>
                ) : (
                  <Icon className={cn("w-5 h-5", style.text)} />
                )}
              </motion.div>

              <div className="flex items-center gap-2">
                {isCompleted && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] font-medium px-2 py-0.5">
                    Complete
                  </Badge>
                )}
                {isInProgress && (
                  <div className="relative">
                    <CircularProgress
                      value={moduleProgress}
                      size={36}
                      strokeWidth={3}
                      color="warning"
                      showValue={false}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-amber-600">
                      {moduleProgress}%
                    </span>
                  </div>
                )}
                {locked && (
                  <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-200">
                    Locked
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 rounded",
                style.bg, style.text
              )}>
                {module.code}
              </span>
              {module.assessmentRequired && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                  Assessment
                </span>
              )}
            </div>

            <h3 className={cn(
              "font-semibold text-[15px] leading-tight mb-1.5 transition-colors duration-200",
              locked ? "text-gray-500" : "text-gray-900 group-hover:text-primary"
            )}>
              {module.title}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{module.subtitle}</p>

            <div className="flex-1" />

            <div className="flex items-center gap-4 text-[11px] text-gray-400 mb-4">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{module.sections.length} sections</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{module.duration} min</span>
              </span>
            </div>

            {isInProgress && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="text-gray-500">{sectionCount} of {module.sections.length} sections</span>
                  <span className="font-medium text-amber-600">{moduleProgress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${moduleProgress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {locked ? (
              <div className="flex flex-col gap-1.5 py-2 px-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 text-gray-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-xs">Complete prerequisites first</span>
                </div>
              </div>
            ) : (
              <Button
                className={cn(
                  "w-full transition-all duration-200 font-medium",
                  isCompleted
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border-0"
                    : isInProgress
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-200/50"
                    : "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                )}
                size="sm"
                onClick={() => openModule(module)}
              >
                {isCompleted ? (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Review Module
                  </span>
                ) : isInProgress ? (
                  <span className="flex items-center gap-1.5">
                    Continue Learning
                    <ChevronRight className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Start Module
                    <Play className="w-3.5 h-3.5" />
                  </span>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Certification pathway card
  const CertificationCard = ({ cert, index }: { cert: typeof CERTIFICATION_GATES[0]; index: number }) => {
    const isExpanded = expandedCertification === cert.id;
    const certModules = INSTITUTIONAL_MODULES.filter(m => cert.requiredModules.includes(m.id));
    const isFirst = index === 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className={cn(
          "overflow-hidden transition-all",
          isFirst ? "ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-white" : ""
        )}>
          <CardContent className="p-0">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedCertification(isExpanded ? null : cert.id)}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  isFirst ? "bg-primary text-white" : "bg-gray-100"
                )}>
                  {isFirst ? (
                    <Sparkles className="w-6 h-6" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                    {isFirst && (
                      <Badge className="bg-primary/10 text-primary text-[10px] border-0">Start Here</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{cert.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {certModules.length} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {cert.requiredAssessments.length} assessments
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {cert.passingThreshold}% required
                    </span>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "w-5 h-5 text-gray-400 transition-transform",
                  isExpanded && "rotate-180"
                )} />
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t bg-gray-50"
                >
                  <div className="p-4">
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Required Modules
                    </h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {certModules.slice(0, 6).map((module, idx) => (
                        <ModuleCard
                          key={module.id}
                          module={module}
                          index={idx}
                        />
                      ))}
                    </div>
                    {certModules.length > 6 && (
                      <p className="text-sm text-gray-500 mt-3 text-center">
                        + {certModules.length - 6} more modules
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Celebration Components */}
      <ModuleCompletedCelebration
        show={showModuleCelebration}
        moduleName={completedModuleName}
        onDismiss={() => setShowModuleCelebration(false)}
        onNextModule={() => {
          setShowModuleCelebration(false);
          if (nextRequiredModule) {
            openModule(nextRequiredModule);
          }
        }}
        hasNextModule={!!nextRequiredModule}
      />

      <StreakMilestoneCelebration
        show={showStreakMilestone}
        streakDays={currentStreak}
        onDismiss={() => setShowStreakMilestone(false)}
      />

      {certificationEarned && (
        <CertificationEarnedModal
          open={!!certificationEarned}
          onOpenChange={(open) => !open && setCertificationEarned(null)}
          certificationName={certificationEarned.name}
          certificationLevel={certificationEarned.level}
          earnedDate={certificationEarned.date}
          onContinue={() => {
            setCertificationEarned(null);
            if (nextRequiredModule) {
              openModule(nextRequiredModule);
            }
          }}
        />
      )}

      {/* XP Earned Popup */}
      {xpEarnedEvent && (
        <XPEarnedPopup
          event={xpEarnedEvent}
          onDismiss={() => setXpEarnedEvent(null)}
        />
      )}

      {/* Level Up Celebration */}
      {showLevelUp && newLevel && (
        <LevelUpCelebration
          show={showLevelUp}
          levelName={newLevel.name}
          levelColor={newLevel.color}
          onDismiss={() => {
            setShowLevelUp(false);
            setNewLevel(null);
          }}
        />
      )}

      {/* Retention Quiz Popup */}
      {retentionQuestions.length > 0 && (
        <RetentionQuiz
          open={showRetentionQuiz}
          onOpenChange={(open) => {
            setShowRetentionQuiz(open);
            if (!open) {
              setTimeout(() => {
                const moduleId = retentionQuestions[0]?.moduleId;
                const module = moduleId ? getModuleById(moduleId) : null;
                if (module) {
                  setRatingModuleId(module.id);
                  setRatingModuleTitle(module.title);
                  setShowModuleRating(true);
                }
              }, 300);
            }
          }}
          questions={retentionQuestions}
          moduleTitle={ratingModuleTitle || 'Training Module'}
          onComplete={() => {
            setShowRetentionQuiz(false);
            setTimeout(() => {
              const moduleId = retentionQuestions[0]?.moduleId;
              const module = moduleId ? getModuleById(moduleId) : null;
              if (module) {
                setRatingModuleId(module.id);
                setRatingModuleTitle(module.title);
                setShowModuleRating(true);
              }
            }, 500);
          }}
        />
      )}

      {/* Module Rating Popup */}
      <Dialog open={showModuleRating} onOpenChange={setShowModuleRating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How was this module?</DialogTitle>
            <DialogDescription>
              Your feedback helps us improve training content
            </DialogDescription>
          </DialogHeader>
          {ratingModuleId && (
            <ModuleRating
              moduleId={ratingModuleId}
              moduleTitle={ratingModuleTitle}
              averageRating={4.2}
              totalRatings={47}
              onRate={(rating, review) => {
                toast.success(`Thanks for rating "${ratingModuleTitle}"!`, {
                  description: `You gave it ${rating} star${rating !== 1 ? 's' : ''}${review ? ' with feedback' : ''}`
                });
                setShowModuleRating(false);
                setRatingModuleId(null);
                setRatingModuleTitle('');
              }}
              className="border-0 shadow-none"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Assessment */}
      {selectedAssessment && (
        <TrainingAssessment
          open={assessmentOpen}
          onOpenChange={setAssessmentOpen}
          assessment={selectedAssessment}
          attemptNumber={(assessmentAttempts[selectedAssessment.id] || 0) + 1}
          onComplete={handleAssessmentComplete}
        />
      )}

      {/* Assessment Failed Dialog */}
      <Dialog open={showAssessmentFailDialog} onOpenChange={setShowAssessmentFailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Assessment Not Passed
            </DialogTitle>
            <DialogDescription>
              You scored {failedAssessmentResult?.score}%. A passing score of {selectedAssessment?.passingScore ?? 80}% is required.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-gray-600">
              We recommend reviewing the module material before trying again.
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAssessmentFailDialog(false);
                if (selectedModule) {
                  setModuleViewerOpen(true);
                }
              }}
            >
              Review Module
            </Button>
            <Button
              onClick={() => {
                setShowAssessmentFailDialog(false);
                if (selectedModule?.assessmentId) {
                  openAssessment(selectedModule.assessmentId);
                }
              }}
            >
              Retake Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Viewer */}
      {selectedModule && moduleViewerOpen && (
        <InstitutionalModuleViewer
          open={moduleViewerOpen}
          onOpenChange={setModuleViewerOpen}
          module={selectedModule}
          completedSections={completedSections[selectedModule.id] || []}
          onCompleteSection={(sectionId) => handleCompleteSection(selectedModule.id, sectionId)}
          onCompleteModule={() => handleCompleteModule(selectedModule.id)}
          onStartAssessment={
            selectedModule.assessmentId
              ? () => {
                  const assessmentId = selectedModule.assessmentId;
                  if (assessmentId) {
                    setModuleViewerOpen(false);
                    openAssessment(assessmentId);
                  }
                }
              : undefined
          }
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent text-sm">Heritage Life</p>
                    <p className="text-[10px] text-gray-500">Agent Onboarding</p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/agents/become-an-agent">
                <Button variant="ghost" size="sm" className="gap-2 hover:shadow-md transition-all">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <Link href="/agents/dashboard">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-md">
                  <GraduationCap className="w-4 h-4" />
                  Agent Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-6"
        >
          {/* Hero Section */}
          <motion.div variants={fadeInUp}>
            <div className="bg-gradient-to-r from-primary to-violet-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '32px 32px'
                }}
              />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        Become a Licensed Agent
                      </h1>
                      <p className="text-white/80">
                        Your complete roadmap to success with Heritage Life
                      </p>
                    </div>
                  </div>
                  <p className="text-white/90 max-w-xl">
                    Follow our step-by-step guide to get licensed, complete your training,
                    and start building your career in life insurance sales.
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white">{INSTITUTIONAL_MODULES.length}</p>
                    <p className="text-sm text-white/70">Training Modules</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white">{CERTIFICATION_GATES.length}</p>
                    <p className="text-sm text-white/70">Certifications</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div variants={fadeInUp}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-white border rounded-xl p-1 h-auto flex-wrap">
                <TabsTrigger value="licensing" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <CheckCircle2 className="w-4 h-4" />
                  Licensing Roadmap
                </TabsTrigger>
                <TabsTrigger value="training" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <GraduationCap className="w-4 h-4" />
                  Training Center
                </TabsTrigger>
                <TabsTrigger value="study" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <BookOpen className="w-4 h-4" />
                  Study Resources
                </TabsTrigger>
                <TabsTrigger value="videos" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Video className="w-4 h-4" />
                  Video Tutorials
                </TabsTrigger>
                <TabsTrigger value="tips" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Lightbulb className="w-4 h-4" />
                  Exam Tips
                </TabsTrigger>
              </TabsList>

              {/* Licensing Tab */}
              <TabsContent value="licensing" className="space-y-6 mt-6">
                {/* State Selector */}
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
                      <div className="text-center p-3 bg-white rounded-xl shadow-md">
                        <p className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">{stateReqs.hours}</p>
                        <p className="text-xs text-gray-500">Pre-License Hours</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-xl shadow-md">
                        <p className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">${stateReqs.examFee}</p>
                        <p className="text-xs text-gray-500">Exam Fee</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-xl shadow-md">
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{stateReqs.renewalYears}</p>
                        <p className="text-xs text-gray-500">Years to Renew</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-xl shadow-md">
                        <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{stateReqs.ce}</p>
                        <p className="text-xs text-gray-500">CE Hours/Cycle</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Licensing Roadmap */}
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
                            <div
                              role="button"
                              tabIndex={0}
                              className={cn(
                                "absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center -translate-x-1/2 cursor-pointer transition-all",
                                isComplete
                                  ? "bg-green-500 text-white"
                                  : isPrevComplete
                                    ? "bg-violet-500 text-white animate-pulse"
                                    : "bg-gray-200 text-gray-400"
                              )}
                              onClick={() => toggleStep(step.id)}
                            >
                              {isComplete ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <span className="font-bold text-sm">{index + 1}</span>
                              )}
                            </div>

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

              {/* Training Center Tab - Full Access */}
              <TabsContent value="training" className="space-y-6 mt-6">
                {/* Training Hero with Progress Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden bg-primary rounded-2xl p-6"
                >
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '32px 32px'
                    }} />
                  </div>

                  <div className="relative">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Award className="w-5 h-5 text-white/80" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white">Training Center</h2>
                            <p className="text-white/50 text-xs">
                              {currentCertification ? `Working on: ${currentCertification.name}` : 'Complete certifications to advance'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                          <CircularProgress value={overallProgress} size={44} strokeWidth={4} color="accent">
                            <span className="text-xs font-bold text-white">{overallProgress}%</span>
                          </CircularProgress>
                          <div className="hidden sm:block">
                            <p className="text-white text-sm font-medium">{completedModulesCount}/{totalModules}</p>
                            <p className="text-white/50 text-[10px]">Modules</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                            <Flame className={cn(
                              "w-6 h-6",
                              currentStreak >= 7 ? "text-orange-400" : currentStreak >= 3 ? "text-amber-400" : "text-white/60"
                            )} />
                          </motion.div>
                          <div>
                            <p className="text-white text-sm font-bold">{currentStreak}</p>
                            <p className="text-white/50 text-[10px]">Day Streak</p>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 bg-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
                          <Zap className="w-5 h-5 text-amber-300" />
                          <div>
                            <p className="text-white text-sm font-bold">{totalXP.toLocaleString()}</p>
                            <p className="text-white/50 text-[10px]">Total XP</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certification Pathway */}
                    <div className="hidden md:block bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <CertificationPathway
                        certificationStatuses={certificationStatuses}
                        curriculumProgress={overallProgress}
                        onNodeClick={() => {}}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Training Sidebar for Navigation */}
                <TrainingSidebar
                  moduleGroups={moduleGroups}
                  completedModules={completedModules}
                  currentModuleId={selectedModule?.id}
                  onSelectModule={(module) => {
                    openModule(module);
                    setSidebarOpen(false);
                  }}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)}
                />

                {/* Certification Cards with Expandable Modules */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Certification Pathway
                  </h3>
                  <div className="space-y-4">
                    {CERTIFICATION_GATES.slice(0, 4).map((cert, index) => (
                      <CertificationCard key={cert.id} cert={cert} index={index} />
                    ))}
                  </div>
                </div>

                {/* All Modules Grid */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    All Training Modules
                  </h3>

                  {/* Getting Started */}
                  {modulesByLevel.onboarding.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-md font-medium mb-3 text-cyan-600 flex items-center gap-2">
                        <Rocket className="w-4 h-4" />
                        Getting Started
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modulesByLevel.onboarding.map((module, idx) => (
                          <ModuleCard key={module.id} module={module} index={idx} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctrine & Compliance */}
                  {modulesByLevel.doctrine.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-md font-medium mb-3 text-purple-600 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Doctrine & Compliance
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modulesByLevel.doctrine.map((module, idx) => (
                          <ModuleCard key={module.id} module={module} index={idx} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Methodology */}
                  {modulesByLevel.methodology.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-md font-medium mb-3 text-blue-600 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Methodology
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modulesByLevel.methodology.map((module, idx) => (
                          <ModuleCard key={module.id} module={module} index={idx} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Knowledge */}
                  {modulesByLevel.product.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-md font-medium mb-3 text-emerald-600 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Product Knowledge
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modulesByLevel.product.map((module, idx) => (
                          <ModuleCard key={module.id} module={module} index={idx} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Client Facilitation */}
                  {modulesByLevel.client_facilitation.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-md font-medium mb-3 text-indigo-600 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Client Facilitation
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modulesByLevel.client_facilitation.map((module, idx) => (
                          <ModuleCard key={module.id} module={module} index={idx} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Study Resources Tab */}
              <TabsContent value="study" className="space-y-4 mt-6">
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
              <TabsContent value="videos" className="space-y-4 mt-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {VIDEO_TUTORIALS.map(video => (
                    <Card
                      key={video.id}
                      className="cursor-pointer hover:shadow-md transition-shadow group"
                      onClick={() => handleWatchVideo(video.title)}
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
              <TabsContent value="tips" className="space-y-4 mt-6">
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

          {/* CTA Section */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-gradient-to-r from-primary/5 to-violet-500/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary">Your Progress: {overallProgress}% Complete</h3>
                    <p className="text-gray-600 mt-1">
                      {completedModulesCount} of {totalModules} modules completed • {passedAssessments.length} assessments passed
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setActiveTab('training')}
                    >
                      View Training
                    </Button>
                    <Link href="/agents/dashboard">
                      <Button size="lg" className="gap-2">
                        <ChevronRight className="w-4 h-4" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-primary">Heritage Life</span>
            </div>
            <p className="text-sm text-gray-500">
              Questions? Contact our recruiting team at{' '}
              <a href="mailto:recruiting@heritagelife.com" className="text-primary hover:underline">
                recruiting@heritagelife.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
