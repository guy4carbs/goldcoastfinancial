import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
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
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

// Training components
import { InstitutionalModuleViewer } from "@/components/agent/InstitutionalModuleViewer";
import { TrainingAssessment, type AssessmentResult } from "@/components/agent/TrainingAssessment";
import { CertificationPathway } from "@/components/agent/CertificationPathway";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
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
    href: '/agents/onboarding/study/course'
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
    href: '/agents/onboarding/study/practice-exam'
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
    href: '/agents/onboarding/study/flashcards'
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

// Category styling for training modules - Heritage brand colors (violet/purple primary)
const categoryStyles: Record<string, { bg: string; text: string; border: string; icon: typeof Shield }> = {
  onboarding: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200', icon: Rocket },
  doctrine: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', icon: Shield },
  compliance: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200', icon: FileCheck },
  methodology: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', icon: Target },
  product: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200', icon: Package },
  sales: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', icon: Target },
  objection_handling: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', icon: MessageSquare },
  client_scenarios: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200', icon: Users },
  client_facilitation: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', icon: Users },
  state_specific: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200', icon: MapPin },
  ongoing_compliance: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200', icon: FileCheck }
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
      <div className={cn("h-full transition-transform duration-200", !locked && "hover:-translate-y-1 hover:scale-[1.01]")}>
        <Card
          className={cn(
            "group relative h-full overflow-hidden transition-all duration-300 border-0",
            "shadow-sm hover:shadow-xl",
            isCompleted && "bg-gradient-to-br from-violet-50 via-white to-violet-50/30 ring-1 ring-violet-200",
            locked && "opacity-60 grayscale-[30%]",
            isInProgress && "ring-1 ring-amber-200 bg-gradient-to-br from-amber-50/50 to-white",
            !locked && !isCompleted && !isInProgress && "bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-white"
          )}
          style={{ borderRadius: RADIUS.card }}
        >
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1.5 transition-all duration-300",
            isCompleted
              ? "bg-gradient-to-r from-violet-500 to-amber-500"
              : isInProgress
              ? "bg-gradient-to-r from-violet-400 to-purple-400"
              : `bg-gradient-to-r ${style.bg} opacity-80`
          )} />

          <CardContent className="p-4 sm:p-5 pt-4 sm:pt-5 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                  isCompleted
                    ? "bg-gradient-to-br from-violet-100 to-violet-50 shadow-inner"
                    : locked
                    ? "bg-gray-100"
                    : isInProgress
                    ? "bg-gradient-to-br from-amber-100 to-amber-50"
                    : cn(style.bg, "group-hover:shadow-md"),
                  !locked && "hover:scale-105"
                )}
              >
                {locked ? (
                  <Lock className="w-5 h-5 text-gray-400" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-amber-500" />
                ) : (
                  <Icon className={cn("w-5 h-5", style.text)} />
                )}
              </div>

              <div className="flex items-center gap-2">
                {isCompleted && (
                  <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px] font-medium px-2 py-0.5">
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
                  <div
                    className="h-full bg-gradient-to-r from-violet-400 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${moduleProgress}%` }}
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
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-md shadow-violet-200/50"
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
      </div>
    );
  };

  // Certification pathway card
  const CertificationCard = ({ cert, index }: { cert: typeof CERTIFICATION_GATES[0]; index: number }) => {
    const isExpanded = expandedCertification === cert.id;
    const certModules = INSTITUTIONAL_MODULES.filter(m => cert.requiredModules.includes(m.id));
    const isFirst = index === 0;

    return (
      <div className="transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.01]">
        <Card
          className={cn(
            "overflow-hidden transition-all",
            isFirst ? "ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-white" : ""
          )}
          style={{ borderRadius: RADIUS.card }}
        >
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

            {isExpanded && (
              <div className="border-t bg-gray-50">
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <OnboardingLoungeLayout>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        <div className="space-y-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card
              className="bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white border-0 overflow-hidden relative"
              style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
            >
              {/* Decorative pattern overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />
              {/* Floating decorative circles */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-md" />
              <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-purple-300/15 rounded-full blur-sm" />

              <CardContent className="relative" style={{ padding: spacing(4) }}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                      className="bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: RADIUS.card,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <BookOpen className="w-8 h-8 text-amber-200" />
                    </motion.div>
                    <div className="flex-1">
                      <Badge
                        className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium mb-2"
                        style={{ padding: '4px 12px' }}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Agent Resources
                      </Badge>
                      <h1
                        className="font-bold tracking-tight text-white"
                        style={{ fontSize: TYPE.display, marginBottom: 8, lineHeight: 1.1 }}
                      >
                        Resources
                      </h1>
                      <p style={{ fontSize: TYPE.body, lineHeight: 1.5 }} className="text-white/90 max-w-xl">
                        Everything you need to get licensed, complete your training, and succeed in your insurance career.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
                    >
                      <p className="text-3xl font-bold text-white">{LICENSING_STEPS.length}</p>
                      <p className="text-sm text-white/70" style={{ fontSize: TYPE.meta }}>License Steps</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
                    >
                      <p className="text-3xl font-bold text-white">{STUDY_RESOURCES.length}</p>
                      <p className="text-sm text-white/70" style={{ fontSize: TYPE.meta }}>Study Resources</p>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList
                className="w-full justify-start bg-white/80 backdrop-blur-sm border border-violet-100 p-1.5 h-auto flex-wrap gap-1"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level1 }}
              >
                <TabsTrigger
                  value="licensing"
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:via-purple-600 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-200/50 transition-all duration-200"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Licensing Roadmap
                </TabsTrigger>
                <TabsTrigger
                  value="study"
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:via-purple-600 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-200/50 transition-all duration-200"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <BookOpen className="w-4 h-4" />
                  Study Resources
                </TabsTrigger>
                <TabsTrigger
                  value="videos"
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:via-purple-600 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-200/50 transition-all duration-200"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Video className="w-4 h-4" />
                  Video Tutorials
                </TabsTrigger>
                <TabsTrigger
                  value="tips"
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:via-purple-600 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-200/50 transition-all duration-200"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Lightbulb className="w-4 h-4" />
                  Exam Tips
                </TabsTrigger>
              </TabsList>

              {/* Licensing Tab */}
              <TabsContent value="licensing" className="mt-8">
                <div className="space-y-8">
                  {/* State Selector */}
                  <div>
                    <Card
                      className="border-0 overflow-hidden"
                      style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                    >
                      <CardContent className="p-0">
                        {/* State Selector Header */}
                        <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-amber-50 p-6 border-b border-violet-100">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div
                                className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50 hover:scale-105 transition-transform"
                                style={{ borderRadius: RADIUS.button }}
                              >
                                <MapPin className="w-6 h-6 text-amber-200" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>Select Your State</p>
                                <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>Licensing requirements vary by state</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Popover open={stateOpen} onOpenChange={setStateOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={stateOpen}
                                    className="w-[240px] justify-between border-violet-200 hover:border-violet-400 hover:bg-violet-50/50"
                                    style={{ borderRadius: RADIUS.button }}
                                  >
                                    {selectedState}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[240px] p-0" style={{ borderRadius: RADIUS.button }}>
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
                                  className="h-10 w-10 text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                                  onClick={() => setSelectedState('Illinois')}
                                  aria-label="Reset to default state"
                                  style={{ borderRadius: RADIUS.button }}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* State Requirements Grid - Balanced 4-column layout */}
                        <div className="p-6">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                              { value: stateReqs.hours, label: 'Pre-License Hours', gradient: 'from-violet-500 to-purple-500', icon: Clock },
                              { value: `$${stateReqs.examFee}`, label: 'Exam Fee', gradient: 'from-violet-600 to-purple-600', icon: FileText },
                              { value: stateReqs.renewalYears, label: 'Years to Renew', gradient: 'from-purple-500 to-violet-500', icon: RefreshCw },
                              { value: stateReqs.ce, label: 'CE Hours/Cycle', gradient: 'from-violet-500 to-amber-500', icon: Award },
                            ].map((stat, idx) => (
                              <div
                                key={stat.label}
                                className="relative overflow-hidden bg-white border border-gray-100 p-5 text-center group hover:-translate-y-1 hover:scale-[1.02] transition-transform"
                                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level1 }}
                              >
                                <div className={cn(
                                  "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br",
                                  stat.gradient
                                )} />
                                <div
                                  className={cn("w-10 h-10 mx-auto mb-3 flex items-center justify-center bg-gradient-to-br", stat.gradient)}
                                  style={{ borderRadius: RADIUS.button }}
                                >
                                  <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <p className={cn("text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent", stat.gradient)}>
                                  {stat.value}
                                </p>
                                <p className="text-gray-500 mt-1" style={{ fontSize: TYPE.caption }}>{stat.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Licensing Roadmap - Enhanced Design */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Card
                      className="border-0 overflow-hidden relative"
                      style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
                    >
                      {/* Decorative background elements */}
                      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-100/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full translate-y-1/2 -translate-x-1/4" />

                      {/* Hero Header */}
                      <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white overflow-hidden">
                        {/* Pattern overlay */}
                        <div
                          className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                            backgroundSize: '24px 24px',
                          }}
                        />
                        {/* Floating circles */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-sm" />
                        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-amber-400/15 rounded-full translate-y-1/2 blur-md" />

                        <div className="relative p-6 md:p-8">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-start gap-4">
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                                className="bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0"
                                style={{
                                  width: 64,
                                  height: 64,
                                  borderRadius: RADIUS.card,
                                  boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                }}
                              >
                                <Target className="w-8 h-8 text-amber-200" />
                              </motion.div>
                              <div>
                                <Badge
                                  className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium mb-2"
                                  style={{ padding: '4px 12px' }}
                                >
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Licensing Journey
                                </Badge>
                                <h2
                                  className="font-bold tracking-tight text-white"
                                  style={{ fontSize: TYPE.section, lineHeight: 1.2 }}
                                >
                                  Licensing Roadmap
                                </h2>
                                <p className="text-white/80 mt-1" style={{ fontSize: TYPE.meta }}>
                                  Complete each step to become a fully licensed agent
                                </p>
                              </div>
                            </div>

                            {/* Progress Stats */}
                            <div className="flex items-center gap-3">
                              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                                <p className="text-3xl font-bold text-white">{completedSteps.length}</p>
                                <p className="text-white/70 text-xs">of {LICENSING_STEPS.length} Steps</p>
                              </div>
                              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                                <p className="text-3xl font-bold text-white">{progress}%</p>
                                <p className="text-white/70 text-xs">Complete</p>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar with Shimmer */}
                          <div className="mt-6">
                            <div className="h-3 bg-white/20 rounded-full overflow-hidden relative">
                              <div
                                className="absolute inset-0 opacity-30"
                                style={{
                                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                                  animation: 'shimmer 2s infinite',
                                }}
                              />
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 rounded-full relative"
                              >
                                <div
                                  className="absolute inset-0 rounded-full"
                                  style={{
                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
                                  }}
                                />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Steps Content */}
                      <CardContent className="p-6 md:p-8 relative">
                        <div className="space-y-4">
                          {LICENSING_STEPS.map((step, index) => {
                            const isComplete = completedSteps.includes(step.id);
                            const isPrevComplete = index === 0 || completedSteps.includes(LICENSING_STEPS[index - 1].id);
                            const isCurrent = !isComplete && isPrevComplete;

                            return (
                              <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className={cn(
                                  "relative",
                                  index !== LICENSING_STEPS.length - 1 && "pb-4"
                                )}
                              >
                                {/* Connector Line */}
                                {index !== LICENSING_STEPS.length - 1 && (
                                  <div
                                    className={cn(
                                      "absolute left-5 top-12 w-0.5 h-[calc(100%-24px)]",
                                      isComplete ? "bg-gradient-to-b from-violet-400 to-purple-300" : "bg-gray-200"
                                    )}
                                  />
                                )}

                                <div
                                  className={cn(
                                    "flex gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                                    isComplete
                                      ? "bg-gradient-to-r from-violet-50 to-purple-50/50 border-violet-200 hover:border-violet-300"
                                      : isCurrent
                                        ? "bg-gradient-to-r from-violet-50 to-purple-50/50 border-violet-300 shadow-lg shadow-violet-100/50"
                                        : "bg-gray-50/50 border-gray-200 hover:border-gray-300"
                                  )}
                                  style={{ borderRadius: RADIUS.card }}
                                  onClick={() => toggleStep(step.id)}
                                >
                                  {/* Step Number/Check */}
                                  <div
                                    className={cn(
                                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                                      isComplete
                                        ? "bg-gradient-to-br from-violet-500 to-amber-500 text-white shadow-lg shadow-violet-200/50"
                                        : isCurrent
                                          ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200/50 animate-pulse"
                                          : "bg-gray-200 text-gray-500"
                                    )}
                                  >
                                    {isComplete ? (
                                      <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                      <span>{index + 1}</span>
                                    )}
                                  </div>

                                  {/* Step Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <h4
                                          className={cn(
                                            "font-semibold transition-colors",
                                            isComplete ? "text-violet-700" : isCurrent ? "text-violet-700" : "text-gray-600"
                                          )}
                                          style={{ fontSize: TYPE.body }}
                                        >
                                          {step.title}
                                        </h4>
                                        <p className="text-gray-600 mt-1" style={{ fontSize: TYPE.meta }}>
                                          {step.description}
                                        </p>

                                        {/* Duration Badge */}
                                        <div className="flex items-center gap-2 mt-3">
                                          <Badge
                                            variant="outline"
                                            className={cn(
                                              "text-xs font-medium",
                                              isComplete
                                                ? "border-violet-200 text-violet-600 bg-violet-50"
                                                : isCurrent
                                                  ? "border-violet-200 text-violet-600 bg-violet-50"
                                                  : "border-gray-200 text-gray-500"
                                            )}
                                          >
                                            <Clock className="w-3 h-3 mr-1" />
                                            {step.hours}
                                          </Badge>
                                          {isCurrent && (
                                            <Badge className="bg-violet-600 text-white text-xs">
                                              Current Step
                                            </Badge>
                                          )}
                                          {isComplete && (
                                            <Badge className="bg-violet-600 text-white text-xs">
                                              Completed
                                            </Badge>
                                          )}
                                        </div>

                                        {/* Resources */}
                                        {step.resources.length > 0 && (
                                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-dashed border-gray-200">
                                            {step.resources.map((resource, idx) => (
                                              isExternalLink(resource.url) ? (
                                                <a
                                                  key={resource.label}
                                                  href={resource.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn(
                                                      "h-8 text-xs gap-1.5 transition-all",
                                                      idx === 0 && isCurrent
                                                        ? "bg-violet-600 text-white border-violet-600 hover:bg-violet-700"
                                                        : "hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700"
                                                    )}
                                                    style={{ borderRadius: RADIUS.button }}
                                                  >
                                                    {idx === 0 && isCurrent && <Sparkles className="w-3 h-3" />}
                                                    {resource.label}
                                                    <ExternalLink className="w-3 h-3" />
                                                  </Button>
                                                </a>
                                              ) : (
                                                <Link
                                                  key={resource.label}
                                                  href={resource.url}
                                                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                                >
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs gap-1.5 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-all"
                                                    style={{ borderRadius: RADIUS.button }}
                                                  >
                                                    {resource.label}
                                                    <ChevronRight className="w-3 h-3" />
                                                  </Button>
                                                </Link>
                                              )
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Checkbox */}
                                      <div className="flex-shrink-0">
                                        <Checkbox
                                          checked={isComplete}
                                          onCheckedChange={() => toggleStep(step.id)}
                                          className={cn(
                                            "w-6 h-6 rounded-lg transition-all",
                                            isComplete && "bg-violet-500 border-violet-500"
                                          )}
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Study Resources Tab */}
              <TabsContent value="study" className="mt-8">
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="flex items-center gap-4 mb-2">
                    <div
                      className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50 hover:scale-105 transition-transform"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <BookOpen className="w-6 h-6 text-amber-200" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900" style={{ fontSize: TYPE.section }}>Study Resources</h2>
                      <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>Courses, practice exams, and flashcards to prepare you for success</p>
                    </div>
                  </div>

                  {/* Resources Grid - Balanced 2x2 layout */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {STUDY_RESOURCES.map((resource, idx) => (
                      <div
                        key={resource.id}
                        className="hover:-translate-y-1 hover:scale-[1.01] transition-transform"
                      >
                        <Card
                          className="h-full border-0 overflow-hidden group"
                          style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <Badge
                                className={cn(
                                  "font-medium",
                                  resource.type === 'course' && "bg-violet-100 text-violet-700 border-violet-200",
                                  resource.type === 'practice' && "bg-purple-100 text-purple-700 border-purple-200",
                                  resource.type === 'flashcards' && "bg-amber-100 text-amber-700 border-amber-200"
                                )}
                                style={{ borderRadius: RADIUS.pill, fontSize: TYPE.caption }}
                              >
                                {resource.type}
                              </Badge>
                              {resource.free ? (
                                <Badge
                                  className="bg-gradient-to-r from-violet-500 to-amber-500 text-white border-0 shadow-sm"
                                  style={{ borderRadius: RADIUS.pill }}
                                >
                                  Free
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-violet-600 font-mono border-violet-200 bg-violet-50"
                                  style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}
                                >
                                  Code: {resource.discountCode}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors" style={{ fontSize: TYPE.title }}>
                              {resource.title}
                            </h3>
                            <p className="text-gray-500 mb-4" style={{ fontSize: TYPE.meta }}>{resource.provider}</p>
                            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                                  <Star className="w-4 h-4 fill-current" />
                                  {resource.rating}
                                </span>
                                <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                                  {resource.enrolled.toLocaleString()} enrolled
                                </span>
                              </div>
                              <span className="text-gray-500 font-medium" style={{ fontSize: TYPE.meta }}>{resource.duration}</span>
                            </div>
                            {isExternalLink(resource.href) ? (
                              <a href={resource.href} target="_blank" rel="noopener noreferrer">
                                <Button
                                  className="w-full gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 hover:from-violet-700 hover:via-purple-700 hover:to-amber-600 shadow-lg shadow-violet-200/50"
                                  style={{ borderRadius: RADIUS.button }}
                                >
                                  {resource.type === 'course' ? 'Start Course' : resource.type === 'practice' ? 'Start Practice' : 'Open Flashcards'}
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </a>
                            ) : (
                              <Link href={resource.href}>
                                <Button
                                  className="w-full gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 hover:from-violet-700 hover:via-purple-700 hover:to-amber-600 shadow-lg shadow-violet-200/50"
                                  style={{ borderRadius: RADIUS.button }}
                                >
                                  {resource.type === 'course' ? 'Start Course' : resource.type === 'practice' ? 'Start Practice' : 'Open Flashcards'}
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Video Tutorials Tab */}
              <TabsContent value="videos" className="mt-8">
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="flex items-center gap-4 mb-2">
                    <div
                      className="w-12 h-12 bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center shadow-lg shadow-violet-200/50 hover:scale-105 transition-transform"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Video className="w-6 h-6 text-amber-200" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900" style={{ fontSize: TYPE.section }}>Video Tutorials</h2>
                      <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>Watch expert-led training videos at your own pace</p>
                    </div>
                  </div>

                  {/* Videos Grid - Balanced 4-column layout */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {VIDEO_TUTORIALS.map((video, idx) => (
                      <div
                        key={video.id}
                        className="hover:-translate-y-1 hover:scale-[1.01] transition-transform"
                      >
                        <Card
                          className="cursor-pointer border-0 overflow-hidden group h-full"
                          style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                          onClick={() => handleWatchVideo(video.title)}
                        >
                          <CardContent className="p-0">
                            <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 h-36 flex items-center justify-center overflow-hidden">
                              {/* Decorative pattern */}
                              <div className="absolute inset-0 opacity-10" style={{
                                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                backgroundSize: '20px 20px'
                              }} />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300" />
                              <div
                                className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform"
                                style={{ borderRadius: RADIUS.hero }}
                              >
                                <Play className="w-8 h-8 text-white ml-1" />
                              </div>
                              <Badge
                                className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white border-0"
                                style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}
                              >
                                {video.duration}
                              </Badge>
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-violet-600 transition-colors" style={{ fontSize: TYPE.meta }}>
                                {video.title}
                              </h4>
                              <p className="text-gray-400 mt-2 flex items-center gap-1" style={{ fontSize: TYPE.caption }}>
                                <Users className="w-3.5 h-3.5" />
                                {video.views.toLocaleString()} views
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Exam Tips Tab */}
              <TabsContent value="tips" className="mt-8">
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="flex items-center gap-4 mb-2">
                    <div
                      className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50 hover:scale-105 transition-transform"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Lightbulb className="w-6 h-6 text-amber-200" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900" style={{ fontSize: TYPE.section }}>Exam Tips & FAQ</h2>
                      <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>Expert advice to help you succeed on exam day</p>
                    </div>
                  </div>

                  {/* Tips Grid - Balanced 2-column layout */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="hover:-translate-y-1 hover:scale-[1.01] transition-transform">
                      <Card className="h-full border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center"
                              style={{ borderRadius: RADIUS.button }}
                            >
                              <Lightbulb className="w-5 h-5 text-amber-600" />
                            </div>
                            <CardTitle style={{ fontSize: TYPE.title }}>Study Strategies</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {[
                            'Study in short 30-45 minute sessions',
                            'Focus on understanding concepts, not memorization',
                            'Take practice exams under timed conditions',
                            'Review incorrect answers thoroughly',
                            'Study state-specific regulations last'
                          ].map((tip, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 p-3 bg-amber-50/50 border border-amber-100"
                              style={{ borderRadius: RADIUS.button }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span style={{ fontSize: TYPE.meta }}>{tip}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="hover:-translate-y-1 hover:scale-[1.01] transition-transform">
                      <Card className="h-full border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center"
                              style={{ borderRadius: RADIUS.button }}
                            >
                              <Shield className="w-5 h-5 text-blue-600" />
                            </div>
                            <CardTitle style={{ fontSize: TYPE.title }}>Exam Day Tips</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {[
                            'Arrive 30 minutes early to the testing center',
                            'Bring two forms of valid ID',
                            'Read each question completely before answering',
                            'Eliminate obviously wrong answers first',
                            'Don\'t change answers unless you\'re certain'
                          ].map((tip, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100"
                              style={{ borderRadius: RADIUS.button }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span style={{ fontSize: TYPE.meta }}>{tip}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* FAQ Section - Full width */}
                  <div className="hover:-translate-y-0.5 transition-transform">
                    <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <HelpCircle className="w-5 h-5 text-violet-600" />
                          </div>
                          <CardTitle style={{ fontSize: TYPE.title }}>Frequently Asked Questions</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {[
                            { q: 'How long does the licensing process take?', a: 'Typically 2-4 weeks from start to finish, depending on your state and how quickly you complete the coursework.' },
                            { q: 'What is the pass rate for the state exam?', a: 'The national average is around 60-70% on the first attempt. With proper preparation, you can significantly increase your chances.' },
                            { q: 'Can I take the exam online?', a: 'Some states offer online proctored exams. Check with your state\'s Department of Insurance for current options.' },
                            { q: 'What if I fail the exam?', a: 'You can retake the exam after a waiting period (usually 24-48 hours). Most states allow unlimited attempts.' }
                          ].map((faq, i) => (
                            <div
                              key={i}
                              className="p-4 bg-gradient-to-br from-violet-50/50 to-white border border-violet-100 hover:scale-[1.01] transition-transform"
                              style={{ borderRadius: RADIUS.button }}
                            >
                              <h4 className="font-semibold text-violet-700 mb-2" style={{ fontSize: TYPE.meta }}>{faq.q}</h4>
                              <p className="text-gray-600" style={{ fontSize: TYPE.caption }}>{faq.a}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card
              className="border-0 overflow-hidden relative"
              style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500" />
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }} />
              <CardContent className="relative p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div
                      className="hidden sm:flex w-20 h-20 bg-white/20 backdrop-blur-sm items-center justify-center hover:scale-105 transition-transform"
                      style={{ borderRadius: RADIUS.card }}
                    >
                      <div className="relative">
                        <CircularProgress value={overallProgress} size={64} strokeWidth={5} color="accent">
                          <span className="text-lg font-bold text-white">{overallProgress}%</span>
                        </CircularProgress>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white" style={{ fontSize: TYPE.section }}>
                        Your Progress: {overallProgress}% Complete
                      </h3>
                      <p className="text-white/80 mt-2" style={{ fontSize: TYPE.body }}>
                        {completedModulesCount} of {totalModules} modules completed • {passedAssessments.length} assessments passed
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="hover:-translate-y-1 hover:scale-[1.02] transition-transform">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setActiveTab('study')}
                        className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                        style={{ borderRadius: RADIUS.button }}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Study Resources
                      </Button>
                    </div>
                    <Link href="/agents/onboarding/lounge">
                      <div className="hover:-translate-y-1 hover:scale-[1.02] transition-transform">
                        <Button
                          size="lg"
                          className="bg-white text-violet-600 hover:bg-white/90 shadow-lg gap-2"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          Onboarding Dashboard
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </OnboardingLoungeLayout>
  );
}
