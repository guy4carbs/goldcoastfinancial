import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { CertificationTracker } from "@/components/agent/CertificationTracker";
import { CertificationPathway } from "@/components/agent/CertificationPathway";
import { InstitutionalModuleViewer } from "@/components/agent/InstitutionalModuleViewer";
import { TrainingAssessment, type AssessmentResult } from "@/components/agent/TrainingAssessment";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Shield,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  FileText,
  Target,
  Play,
  FileCheck,
  Sparkles,
  Rocket,
  Package,
  Users,
  AlertTriangle,
  Building2,
  HelpCircle,
  Library,
  Headphones,
  Video,
  Download,
  Flame,
  Zap,
  MessageSquare,
  MapPin,
  RefreshCw,
  XCircle,
} from "lucide-react";

// Import training components
import {
  GlossaryPanel,
  GlossarySearch,
  QuickReferenceList,
  CarrierComparison,
  VideoLibrary,
  // Dashboard Widgets
  CurrentFocusCard,
  ComplianceCountdown,
  // Navigation
  TrainingSidebar,
  TrainingBreadcrumb,
  TrainingSearch,
  FilterSortControls,
  // Celebrations
  CertificationEarnedModal,
  ModuleCompletedCelebration,
  StreakMilestoneCelebration,
  // Mobile
  OfflineIndicator,
  CertificationPathwayVertical,
  // Gamification
  calculateModuleXP,
  getStreakMultiplier,
  XPEarnedPopup,
  LevelUpCelebration,
  DailyChallengeCard,
  QuestionOfTheDayPopup,
  useQuestionOfTheDayPopup,
  // Module completion popups
  ModuleRating,
  RetentionQuiz,
  QuickExportButton,
  // Offline Download
  OfflineDownloadManager,
  useOfflineStorage
} from "@/components/training";
import type { XPEarnedEvent, DailyChallenge, RetentionQuestion } from "@/components/training";

// Import training infrastructure data
import {
  CARRIERS,
  GLOSSARY_TERMS,
  QUICK_REFERENCE_CARDS,
} from "@/lib/trainingInfrastructure";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/lib/agentStore";
import { useAnalytics } from "@/hooks/useAnalytics";
import { toast } from "sonner";
import {
  INSTITUTIONAL_MODULES,
  CERTIFICATION_GATES,
  ASSESSMENTS,
  getModuleById,
  getAssessmentById,
  type TrainingModuleData,
  type CertificationStatus,
  type Assessment
} from "@/lib/trainingData";

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const startValue = count;
    const diff = target - startValue;

    const animate = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startValue + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

// Interfaces for admin assignments and mentor feedback
interface AdminAssignment {
  moduleId: string;
  assignedBy: string;
  assignedDate: string;
  dueDate?: string;
  priority: 'normal' | 'high' | 'urgent';
  notes?: string;
}

interface MentorFeedback {
  id: string;
  assessmentId: string;
  mentorName: string;
  date: string;
  rating: number;
  feedback: string;
  suggestions?: string[];
  status: 'pending' | 'received';
}

interface TrainingProgress {
  completedModules: string[];
  completedSections: Record<string, string[]>;
  passedAssessments: string[];
  certificationStatuses: Record<string, CertificationStatus>;
  assessmentAttempts: Record<string, number>;
  adminAssignments: AdminAssignment[];
  mentorFeedback: MentorFeedback[];
  lastSyncedAt: string;
}

const STORAGE_KEY = 'gcf-training-progress';

// Level thresholds for XP progression
const LEVEL_THRESHOLDS = [
  { threshold: 0, name: 'Newcomer', color: 'gray' },
  { threshold: 500, name: 'Apprentice', color: 'green' },
  { threshold: 1500, name: 'Advisor', color: 'blue' },
  { threshold: 3000, name: 'Senior Advisor', color: 'purple' },
  { threshold: 5000, name: 'Expert', color: 'gold' },
  { threshold: 10000, name: 'Master', color: 'diamond' }
] as const;

const STREAK_MILESTONES = [7, 14, 30, 60, 100] as const;

const OFFLINE_MODULE_LIMIT = 10;
const MODULE_SIZE_MULTIPLIER = 2.5;

const HERO_BG_STYLE = {
  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
  backgroundSize: '32px 32px'
} as const;

// Training state with localStorage persistence for cross-device sync (#74)
const useTrainingState = () => {
  // Initialize state from localStorage
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
      adminAssignments: [
        // Sample admin assignment
        {
          moduleId: 'mod-onboarding-company',
          assignedBy: 'Sarah Mitchell (Training Manager)',
          assignedDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high',
          notes: 'Required for all new agents within first week'
        }
      ],
      mentorFeedback: [],
      lastSyncedAt: new Date().toISOString()
    };
  };

  const [state, setState] = useState<TrainingProgress>(getInitialState);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    const toSave = {
      ...state,
      lastSyncedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state]);

  // Sync with localStorage on focus (for cross-tab/device sync)
  useEffect(() => {
    const handleFocus = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Only update if the stored version is newer
          if (parsed.lastSyncedAt > state.lastSyncedAt) {
            setState(parsed);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch (err) {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [state.lastSyncedAt]);

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

  const addMentorFeedback = (feedback: MentorFeedback) => {
    setState(prev => ({
      ...prev,
      mentorFeedback: [...prev.mentorFeedback, feedback]
    }));
  };

  const requestMentorFeedback = (assessmentId: string) => {
    const newRequest: MentorFeedback = {
      id: `fb-${Date.now()}`,
      assessmentId,
      mentorName: 'Pending Assignment',
      date: new Date().toISOString().split('T')[0],
      rating: 0,
      feedback: '',
      status: 'pending'
    };
    setState(prev => ({
      ...prev,
      mentorFeedback: [...prev.mentorFeedback, newRequest]
    }));
    return newRequest;
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
    adminAssignments: state.adminAssignments,
    mentorFeedback: state.mentorFeedback,
    addMentorFeedback,
    requestMentorFeedback,
    lastSyncedAt: state.lastSyncedAt
  };
};

// Category styling
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

export default function AgentTraining() {
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
    adminAssignments,
    mentorFeedback,
    requestMentorFeedback,
    lastSyncedAt
  } = useTrainingState();

  const [selectedModule, setSelectedModule] = useState<TrainingModuleData | null>(null);
  const [moduleViewerOpen, setModuleViewerOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [failedAssessmentResult, setFailedAssessmentResult] = useState<AssessmentResult | null>(null);
  const [showAssessmentFailDialog, setShowAssessmentFailDialog] = useState(false);
  const [pendingModuleCompletion, setPendingModuleCompletion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('curriculum');

  // Phase 3 State
  const [showModuleCelebration, setShowModuleCelebration] = useState(false);
  const [completedModuleName, setCompletedModuleName] = useState('');
  const [certificationEarned, setCertificationEarned] = useState<{
    name: string;
    level: string;
    date: Date;
  } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastModuleId, setLastModuleId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'not-started' | 'in-progress' | 'completed' | 'locked'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'onboarding' | 'doctrine' | 'compliance' | 'methodology' | 'product' | 'client_facilitation'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'duration-asc' | 'duration-desc' | 'name-asc' | 'name-desc'>('default');

  // Gamification State (celebrations only)
  const [xpEarnedEvent, setXpEarnedEvent] = useState<XPEarnedEvent | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<{ name: string; color: string } | null>(null);
  // Source streak, XP, and user info from agent store
  const { performance, currentUser } = useAgentStore();
  const currentStreak = performance.currentStreak;
  const [totalXP, setTotalXP] = useState(performance.xp);

  // Analytics
  const { trackAgentTrainingStarted } = useAnalytics();

  // Phase 5 State - Module Rating & Review Popups
  const [showModuleRating, setShowModuleRating] = useState(false);
  const [ratingModuleId, setRatingModuleId] = useState<string | null>(null);
  const [ratingModuleTitle, setRatingModuleTitle] = useState('');
  const [showRetentionQuiz, setShowRetentionQuiz] = useState(false);
  const [retentionQuestions, setRetentionQuestions] = useState<RetentionQuestion[]>([]);

  // Offline Storage
  const [downloadedModules, setDownloadedModules] = useState<string[]>([]);
  const offlineStorage = useOfflineStorage({ storeName: 'modules' });

  // Question of the Day popup (shows once per day on login)
  const { shouldShow: showQOTD, markAsShown: dismissQOTD } = useQuestionOfTheDayPopup();

  // State for mentor feedback request modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAssessmentId, setFeedbackAssessmentId] = useState<string | null>(null);

  // Load downloaded modules on mount
  useEffect(() => {
    if (offlineStorage.isReady) {
      offlineStorage.getAllItems().then((items) => {
        setDownloadedModules(items.map(item => item.id));
      });
    }
  }, [offlineStorage.isReady]);

  // #77: Export completion records as CSV
  const exportCompletionRecordsCSV = () => {
    const headers = ['Module Code', 'Module Title', 'Status', 'Completed Date', 'Sections Completed'];
    const rows = INSTITUTIONAL_MODULES.map(module => {
      const isCompleted = completedModules.includes(module.id);
      const sectionCount = completedSections[module.id]?.length || 0;
      return [
        module.code,
        module.title,
        isCompleted ? 'Completed' : sectionCount > 0 ? 'In Progress' : 'Not Started',
        isCompleted ? new Date().toLocaleDateString() : '',
        `${sectionCount}/${module.sections.length}`
      ];
    });

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `training-records-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Training records exported', { description: 'CSV file downloaded successfully' });
  };

  // #77: Export completion records as PDF (simplified text format)
  const exportCompletionRecordsPDF = () => {
    // Create a formatted text document (in production, use a PDF library like jsPDF)
    const completedCount = completedModules.length;
    const certCount = Object.values(certificationStatuses).filter(s => s === 'certified').length;

    let content = `
GOLD COAST FINANCIAL - TRAINING COMPLETION RECORD
================================================
Generated: ${new Date().toLocaleString()}
Agent: ${currentUser?.name || 'Agent'}

SUMMARY
-------
Modules Completed: ${completedCount}/${INSTITUTIONAL_MODULES.length}
Certifications Earned: ${certCount}
Assessments Passed: ${passedAssessments.length}

COMPLETED MODULES
-----------------
`;

    completedModules.forEach(moduleId => {
      const module = getModuleById(moduleId);
      if (module) {
        content += `[✓] ${module.code}: ${module.title}\n`;
      }
    });

    content += `\nCERTIFICATION STATUS
--------------------
`;

    CERTIFICATION_GATES.forEach(cert => {
      const status = certificationStatuses[cert.id];
      const statusLabel = status === 'certified' ? '✓ CERTIFIED' :
                         status === 'in_progress' ? '⋯ In Progress' :
                         status === 'pending_review' ? '⏳ Pending Review' : '○ Not Started';
      content += `${statusLabel}: ${cert.name}\n`;
    });

    content += `\n---
This document certifies the training completion status as of the date above.
Gold Coast Financial | Heritage Life Division
`;

    // TODO: Replace with jsPDF or similar for real PDF generation
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `training-certificate-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Training records exported', { description: 'Text document downloaded (PDF coming soon)' });
  };

  // Check if module has admin assignment (#75)
  const getAdminAssignment = (moduleId: string): AdminAssignment | undefined => {
    return adminAssignments.find(a => a.moduleId === moduleId);
  };

  // Get mentor feedback for assessment (#76)
  const getAssessmentFeedback = (assessmentId: string): MentorFeedback | undefined => {
    return mentorFeedback.find(f => f.assessmentId === assessmentId);
  };

  // Handle requesting mentor feedback
  const handleRequestFeedback = (assessmentId: string) => {
    const existing = getAssessmentFeedback(assessmentId);
    if (!existing) {
      requestMentorFeedback(assessmentId);
      toast.success('Feedback requested', {
        description: 'Your mentor will be notified to review your assessment'
      });
    }
    setShowFeedbackModal(false);
    setFeedbackAssessmentId(null);
  };

  // Handle module download
  const handleDownloadModule = async (moduleId: string) => {
    const module = getModuleById(moduleId);
    if (!module || !offlineStorage.isReady) return;

    await offlineStorage.saveItem(moduleId, module);
    setDownloadedModules(prev => [...prev, moduleId]);
  };

  // Handle module removal
  const handleRemoveModule = async (moduleId: string) => {
    if (!offlineStorage.isReady) return;

    await offlineStorage.removeItem(moduleId);
    setDownloadedModules(prev => prev.filter(id => id !== moduleId));
  };

  // Sample retention questions by module category
  const getRetentionQuestions = useCallback((moduleId: string): RetentionQuestion[] => {
    const module = getModuleById(moduleId);
    if (!module) return [];

    // Return questions based on module category
    const questionsByCategory: Record<string, RetentionQuestion[]> = {
      'onboarding': [
        {
          id: 'rq1',
          question: 'What is the primary mission of Gold Coast Financial?',
          options: ['Maximize sales volume', 'Education-first client approach', 'Compete on price', 'Quick policy turnaround'],
          correctIndex: 1,
          explanation: 'Gold Coast Financial is built on an education-first philosophy, ensuring clients understand their options before making decisions.',
          topic: 'Company Mission',
          moduleId
        }
      ],
      'doctrine': [
        {
          id: 'rq2',
          question: 'What must always come before product recommendation?',
          options: ['Price comparison', 'Needs analysis and education', 'Carrier selection', 'Application completion'],
          correctIndex: 1,
          explanation: 'A thorough needs analysis and client education must precede any product recommendation to ensure suitability.',
          topic: 'Doctrine Principles',
          moduleId
        }
      ],
      'compliance': [
        {
          id: 'rq3',
          question: 'What is the primary purpose of suitability analysis?',
          options: ['Increase commission', 'Document client rejection', 'Ensure product fits client needs', 'Speed up sales process'],
          correctIndex: 2,
          explanation: 'Suitability analysis ensures recommended products match the client\'s financial situation, needs, and objectives.',
          topic: 'Compliance Requirements',
          moduleId
        }
      ],
      'methodology': [
        {
          id: 'rq4',
          question: 'What is the first step in the education-first call framework?',
          options: ['Present product options', 'Establish rapport and understand needs', 'Discuss pricing', 'Complete application'],
          correctIndex: 1,
          explanation: 'The education-first methodology begins with understanding the client\'s situation before presenting any solutions.',
          topic: 'Call Framework',
          moduleId
        }
      ],
      'product': [
        {
          id: 'rq5',
          question: 'What distinguishes IUL from traditional whole life insurance?',
          options: ['Lower premiums', 'Index-linked cash value growth with floor protection', 'No cash value', 'Term-based coverage'],
          correctIndex: 1,
          explanation: 'IUL offers cash value growth linked to market indices with downside protection through a floor (typically 0%).',
          topic: 'Product Knowledge',
          moduleId
        }
      ],
      'client_facilitation': [
        {
          id: 'rq6',
          question: 'When a client says "I need to think about it," what is the recommended approach?',
          options: ['Push for immediate decision', 'Acknowledge and schedule follow-up', 'Lower the price', 'Move to next client'],
          correctIndex: 1,
          explanation: 'Respecting the client\'s decision-making process while scheduling a specific follow-up maintains trust and professionalism.',
          topic: 'Client Handling',
          moduleId
        }
      ]
    };

    return questionsByCategory[module.category] || questionsByCategory['doctrine'];
  }, []);

  // Calculate overall progress
  const totalModules = INSTITUTIONAL_MODULES.length;
  const completedModulesCount = completedModules.length;
  const overallProgress = Math.round((completedModulesCount / totalModules) * 100);

  // Daily challenges (memoized to avoid recreating on every render)
  const dailyChallenges: DailyChallenge[] = useMemo(() => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return [
      {
        id: 'daily-1',
        title: 'Module Marathon',
        description: 'Complete 2 training modules today',
        xpReward: 50,
        type: 'modules',
        target: 2,
        current: Math.min(completedModulesCount, 2),
        expiresAt: endOfDay
      },
      {
        id: 'daily-2',
        title: 'Quiz Champion',
        description: 'Pass an assessment with 90% or higher',
        xpReward: 75,
        type: 'assessment',
        target: 1,
        current: passedAssessments.length > 0 ? 1 : 0,
        expiresAt: endOfDay
      },
      {
        id: 'daily-3',
        title: 'Study Session',
        description: 'Spend 30 minutes on training',
        xpReward: 30,
        type: 'time',
        target: 30,
        current: 0,
        expiresAt: endOfDay
      }
    ];
  }, [completedModulesCount, passedAssessments.length]);

  // Animated counters
  const animatedModules = useAnimatedCounter(completedModulesCount, 1200);
  const animatedAssessments = useAnimatedCounter(passedAssessments.length, 1200);
  const animatedCerts = useAnimatedCounter(
    Object.values(certificationStatuses).filter(s => s === 'certified').length,
    1200
  );

  // Get modules by certification level and category
  const modulesByLevel = useMemo(() => {
    const preAccess = INSTITUTIONAL_MODULES.filter(m => m.certificationLevel === 'pre_access');
    const coreAdvisor = INSTITUTIONAL_MODULES.filter(m => m.certificationLevel === 'core_advisor');
    const liveClient = INSTITUTIONAL_MODULES.filter(m => m.certificationLevel === 'live_client');

    // Separate advanced compliance modules (stress test and suitability defense)
    const advancedComplianceIds = ['mod-compliance-stress', 'mod-suitability-defense'];

    return {
      // Pre-Access split by category
      onboarding: preAccess.filter(m => m.category === 'onboarding'),
      doctrine: preAccess.filter(m => m.category === 'doctrine' || m.category === 'compliance'),
      // Core Advisor split by category
      methodology: coreAdvisor.filter(m => m.category === 'methodology'),
      // Advanced Compliance (hard gate before product knowledge)
      advanced_compliance: coreAdvisor.filter(m => advancedComplianceIds.includes(m.id)),
      product: coreAdvisor.filter(m => m.category === 'product'),
      // Live Client - Client Facilitation (formerly "sales")
      client_facilitation: liveClient.filter(m => m.category === 'client_facilitation'),
      // Legacy groupings
      pre_access: preAccess,
      core_advisor: coreAdvisor,
      live_client: liveClient,
      ongoing: INSTITUTIONAL_MODULES.filter(m => m.certificationLevel === 'ongoing_compliance')
    };
  }, []);

  // Helper: Check if a module is locked (prerequisites + sequential group order + assessment gate)
  const isModuleLocked = (module: TrainingModuleData): boolean => {
    // Enforce certification level order: must complete all modules in prior level first
    const levelOrder: string[] = ['pre_access', 'core_advisor', 'live_client', 'state_expansion', 'ongoing_compliance'];
    const moduleLevelIdx = levelOrder.indexOf(module.certificationLevel);
    if (moduleLevelIdx > 0) {
      // Check all prior levels are fully complete
      for (let li = 0; li < moduleLevelIdx; li++) {
        const priorLevel = levelOrder[li];
        const priorModules = INSTITUTIONAL_MODULES.filter(m => m.certificationLevel === priorLevel);
        for (const pm of priorModules) {
          if (!completedModules.includes(pm.id)) return true;
          if (pm.assessmentRequired && pm.assessmentId && !passedAssessments.includes(pm.assessmentId)) return true;
        }
      }
    }

    // Check explicit prerequisites
    const prereqsMet = module.prerequisiteModules.every(p => completedModules.includes(p));
    if (!prereqsMet) return true;

    // Check that prerequisite module assessments are also passed
    for (const prereqId of module.prerequisiteModules) {
      const prereqModule = getModuleById(prereqId);
      if (prereqModule?.assessmentRequired && prereqModule.assessmentId) {
        if (!passedAssessments.includes(prereqModule.assessmentId)) {
          return true;
        }
      }
    }

    // Enforce sequential order within group
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
  };

  // Filter modules based on current filters
  const filterModules = (modules: TrainingModuleData[]) => {
    return modules.filter(module => {
      // Status filter
      const isCompleted = completedModules.includes(module.id);
      const sectionCount = completedSections[module.id]?.length || 0;
      const isInProgress = sectionCount > 0 && !isCompleted;
      const isLocked = isModuleLocked(module);
      const isNotStarted = !isCompleted && !isInProgress && !isLocked;

      if (filterStatus === 'completed' && !isCompleted) return false;
      if (filterStatus === 'in-progress' && !isInProgress) return false;
      if (filterStatus === 'not-started' && !isNotStarted) return false;
      if (filterStatus === 'locked' && !isLocked) return false;

      // Category filter
      if (filterCategory !== 'all' && module.category !== filterCategory) return false;

      return true;
    }).sort((a, b) => {
      // Sort
      if (sortBy === 'duration-asc') return a.duration - b.duration;
      if (sortBy === 'duration-desc') return b.duration - a.duration;
      if (sortBy === 'name-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'name-desc') return b.title.localeCompare(a.title);
      return 0;
    });
  };

  // Filtered modules by level
  const filteredModulesByLevel = useMemo(() => ({
    onboarding: filterModules(modulesByLevel.onboarding),
    doctrine: filterModules(modulesByLevel.doctrine),
    methodology: filterModules(modulesByLevel.methodology),
    advanced_compliance: filterModules(modulesByLevel.advanced_compliance),
    product: filterModules(modulesByLevel.product),
    client_facilitation: filterModules(modulesByLevel.client_facilitation),
  }), [modulesByLevel, filterStatus, filterCategory, sortBy, completedModules, completedSections, passedAssessments]);

  // Module groups for sidebar
  const moduleGroups = useMemo(() => [
    { id: 'onboarding', name: 'Getting Started', icon: Rocket, level: 'pre_access' as const, modules: modulesByLevel.onboarding },
    { id: 'doctrine', name: 'Doctrine & Compliance', icon: Shield, level: 'pre_access' as const, modules: modulesByLevel.doctrine },
    { id: 'methodology', name: 'Methodology', icon: Target, level: 'core_advisor' as const, modules: modulesByLevel.methodology },
    { id: 'advanced_compliance', name: 'Advanced Compliance', icon: AlertTriangle, level: 'core_advisor' as const, modules: modulesByLevel.advanced_compliance },
    { id: 'product', name: 'Product Knowledge', icon: Package, level: 'core_advisor' as const, modules: modulesByLevel.product },
    { id: 'client_facilitation', name: 'Client Facilitation', icon: Users, level: 'live_client' as const, modules: modulesByLevel.client_facilitation }
  ], [modulesByLevel]);

  // Get current certification in progress
  const currentCertification = useMemo(() => {
    return CERTIFICATION_GATES.find(c => certificationStatuses[c.id] === 'in_progress');
  }, [certificationStatuses]);

  // Get next required module
  const nextRequiredModule = useMemo(() => {
    if (!currentCertification) return null;
    return currentCertification.requiredModules
      .map(id => getModuleById(id))
      .find(m => m && !completedModules.includes(m.id));
  }, [currentCertification, completedModules]);

  // Module progress for current module
  const currentModuleProgress = useMemo(() => {
    if (!nextRequiredModule) return 0;
    const sections = completedSections[nextRequiredModule.id]?.length || 0;
    return Math.round((sections / nextRequiredModule.sections.length) * 100);
  }, [nextRequiredModule, completedSections]);

  // Handlers
  const handleCompleteSection = (moduleId: string, sectionId: string) => {
    setCompletedSections(prev => ({
      ...prev,
      [moduleId]: [...(prev[moduleId] || []), sectionId]
    }));
  };

  const handleCompleteModule = (moduleId: string) => {
    // Gate: if module requires assessment, don't complete until assessment is passed
    const mod = getModuleById(moduleId);
    if (mod?.assessmentRequired && mod.assessmentId && !passedAssessments.includes(mod.assessmentId)) {
      toast.error('Assessment Required', {
        description: 'You must pass the assessment before completing this module.'
      });
      return;
    }

    if (!completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId]);

      // Trigger celebration
      const module = getModuleById(moduleId);
      if (module) {
        setCompletedModuleName(module.title);
        setShowModuleCelebration(true);

        // Phase 4: Calculate and show XP earned
        const xpEvent = calculateModuleXP(module.duration, currentStreak);
        setXpEarnedEvent(xpEvent);

        // Update total XP and check for level up
        const newTotalXP = totalXP + xpEvent.totalXP;
        setTotalXP(newTotalXP);

        // Check level thresholds
        const oldLevel = LEVEL_THRESHOLDS.filter(l => l.threshold <= totalXP).pop();
        const newLevelObj = LEVEL_THRESHOLDS.filter(l => l.threshold <= newTotalXP).pop();

        if (oldLevel && newLevelObj && oldLevel.name !== newLevelObj.name) {
          setTimeout(() => {
            setNewLevel(newLevelObj);
            setShowLevelUp(true);
          }, 2000); // Show after XP popup
        }

        // Phase 5: Show retention quiz after celebrations
        setTimeout(() => {
          const questions = getRetentionQuestions(moduleId);
          if (questions.length > 0) {
            setRetentionQuestions(questions);
            setShowRetentionQuiz(true);
          }
        }, 3000); // Show after XP/level up popups
      }
    }
  };


  // Open module viewer
  const handleOpenModule = (module: TrainingModuleData) => {
    setLastModuleId(module.id);
    setSelectedModule(module);
    setModuleViewerOpen(true);
    trackAgentTrainingStarted(module.title);
  };

  // Complete module after assessment pass (waits for passedAssessments state update)
  useEffect(() => {
    if (pendingModuleCompletion && !completedModules.includes(pendingModuleCompletion)) {
      const mod = getModuleById(pendingModuleCompletion);
      if (mod?.assessmentId && passedAssessments.includes(mod.assessmentId)) {
        // Directly complete — bypass the gate since we know assessment passed
        setCompletedModules(prev => [...prev, pendingModuleCompletion]);

        // Trigger celebration
        setCompletedModuleName(mod.title);
        setShowModuleCelebration(true);

        // Calculate XP
        const xpEvent = calculateModuleXP(mod.duration, currentStreak);
        setXpEarnedEvent(xpEvent);
        setTotalXP(prev => prev + xpEvent.totalXP);

        setPendingModuleCompletion(null);
      }
    }
  }, [passedAssessments, pendingModuleCompletion]);

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

      // Close the module viewer so celebration shows on the main page
      setModuleViewerOpen(false);

      // Track which module needs completing after assessment pass
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
          setCertificationStatuses(prev => ({
            ...prev,
            [cert.id]: newStatus
          }));

          // Trigger certification celebration
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
              setCertificationStatuses(prev => ({
                ...prev,
                [nextCert.id]: 'available'
              }));
            });
        }
      }
    } else {
      // Assessment failed — close viewer and show retry dialog
      setModuleViewerOpen(false);
      setFailedAssessmentResult(result);
      setShowAssessmentFailDialog(true);
    }

    setAssessmentAttempts(prev => ({
      ...prev,
      [result.assessmentId]: (prev[result.assessmentId] || 0) + 1
    }));
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

  const startCertification = (certId: string) => {
    setCertificationStatuses(prev => ({
      ...prev,
      [certId]: 'in_progress'
    }));
  };

  // Module Card Component - Enhanced Design
  const ModuleCard = ({ module, index }: { module: TrainingModuleData; index: number }) => {
    const isCompleted = completedModules.includes(module.id);
    const sectionCount = completedSections[module.id]?.length || 0;
    const progress = Math.round((sectionCount / module.sections.length) * 100);
    const style = categoryStyles[module.category] || categoryStyles.doctrine;
    const Icon = style.icon;

    const isLocked = isModuleLocked(module);
    const isInProgress = progress > 0 && !isCompleted;

    // #75: Check for admin assignment
    const assignment = getAdminAssignment(module.id);
    const isAssigned = !!assignment;
    const isOverdue = assignment?.dueDate && new Date(assignment.dueDate) < new Date();

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={!isLocked ? { y: -6, transition: { duration: 0.25, ease: "easeOut" } } : undefined}
        className="h-full"
      >
        <Card className={cn(
          "group relative h-full overflow-hidden transition-all duration-300 border-0",
          "shadow-sm hover:shadow-xl",
          isCompleted && "bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 ring-1 ring-emerald-200",
          isLocked && "opacity-60 grayscale-[30%]",
          isInProgress && "ring-1 ring-amber-200 bg-gradient-to-br from-amber-50/50 to-white",
          !isLocked && !isCompleted && !isInProgress && "bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-white"
        )}>
          {/* Category accent - gradient bar */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1.5 transition-all duration-300",
            isCompleted
              ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
              : isInProgress
              ? "bg-gradient-to-r from-amber-400 to-orange-400"
              : `bg-gradient-to-r ${style.bg} opacity-80`
          )} />

          <CardContent className="p-4 sm:p-5 pt-4 sm:pt-5 flex flex-col h-full">
            {/* Top row: Icon + Status */}
            <div className="flex items-start justify-between mb-4">
              {/* Icon container with subtle animation */}
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                  isCompleted
                    ? "bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-inner"
                    : isLocked
                    ? "bg-gray-100"
                    : isInProgress
                    ? "bg-gradient-to-br from-amber-100 to-amber-50"
                    : cn(style.bg, "group-hover:shadow-md")
                )}
                whileHover={!isLocked ? { scale: 1.05, rotate: 3 } : undefined}
                transition={{ duration: 0.2 }}
              >
                {isLocked ? (
                  <Lock className="w-5 h-5 text-gray-400" aria-hidden="true" />
                ) : isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" aria-hidden="true" />
                  </motion.div>
                ) : (
                  <Icon className={cn("w-5 h-5", style.text)} aria-hidden="true" />
                )}
              </motion.div>

              {/* Progress indicator or status badge */}
              <div className="flex items-center gap-2">
                {/* #75: Admin assignment badge */}
                {isAssigned && !isCompleted && (
                  <Badge className={cn(
                    "text-[9px] font-medium px-1.5 py-0.5 border-0",
                    isOverdue
                      ? "bg-red-100 text-red-700"
                      : assignment.priority === 'urgent'
                      ? "bg-red-100 text-red-600"
                      : assignment.priority === 'high'
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-600"
                  )}>
                    {isOverdue ? 'Overdue' : 'Assigned'}
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] font-medium px-2 py-0.5">
                    Complete
                  </Badge>
                )}
                {isInProgress && (
                  <div className="relative">
                    <CircularProgress
                      value={progress}
                      size={36}
                      strokeWidth={3}
                      color="warning"
                      showValue={false}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-amber-600">
                      {progress}%
                    </span>
                  </div>
                )}
                {isLocked && (
                  <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-200">
                    Locked
                  </Badge>
                )}
              </div>
            </div>

            {/* #75: Admin assignment info */}
            {isAssigned && !isCompleted && (
              <div className={cn(
                "mb-3 p-2 rounded-lg text-[10px]",
                isOverdue ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"
              )}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="w-3 h-3" aria-hidden="true" />
                  <span className="font-medium">Assigned by {assignment.assignedBy.split(' (')[0]}</span>
                </div>
                {assignment.dueDate && (
                  <div className={cn("flex items-center gap-1", isOverdue && "text-red-600 font-medium")}>
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    Due: <time dateTime={assignment.dueDate}>{new Date(assignment.dueDate).toLocaleDateString()}</time>
                  </div>
                )}
                {assignment.notes && (
                  <p className="text-gray-600 mt-1 italic">{assignment.notes}</p>
                )}
              </div>
            )}

            {/* Module code + category */}
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

            {/* Title and subtitle */}
            <h3 className={cn(
              "font-semibold text-[15px] leading-tight mb-1.5 transition-colors duration-200",
              isLocked ? "text-gray-500" : "text-gray-900 group-hover:text-primary"
            )}>
              {module.title}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{module.subtitle}</p>

            {/* Spacer to push content to bottom */}
            <div className="flex-1" />

            {/* Meta info */}
            <div className="flex items-center gap-4 text-[11px] text-gray-400 mb-4">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{module.sections.length} sections</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{module.duration} min</span>
              </span>
            </div>

            {/* Progress bar for in-progress modules */}
            {isInProgress && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="text-gray-500">{sectionCount} of {module.sections.length} sections</span>
                  <span className="font-medium text-amber-600">{progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Action button */}
            {isLocked ? (
              <div className="flex flex-col gap-1.5 py-2 px-3 rounded-lg bg-gray-50" role="status">
                <div className="flex items-center gap-2 text-gray-400">
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="text-xs">Complete prerequisites first</span>
                </div>
                <div className="text-[10px] text-gray-500 pl-5">
                  Required: {module.prerequisiteModules
                    .filter(prereqId => !completedModules.includes(prereqId))
                    .map(prereqId => {
                      const prereqModule = INSTITUTIONAL_MODULES.find(m => m.id === prereqId);
                      return prereqModule?.code || prereqId;
                    })
                    .join(', ')}
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

  // Assessment Card Component
  const AssessmentCard = ({ assessment, index }: { assessment: Assessment; index: number }) => {
    const passed = passedAssessments.includes(assessment.id);
    const attempts = assessmentAttempts[assessment.id] || 0;
    const module = INSTITUTIONAL_MODULES.find(m => m.assessmentId === assessment.id);
    const moduleCompleted = module ? completedModules.includes(module.id) : false;
    const allSectionsComplete = module ? (completedSections[module.id]?.length || 0) >= module.sections.length : false;
    const canTake = (moduleCompleted || allSectionsComplete) && !passed && attempts < assessment.maxAttempts;
    const isLocked = !moduleCompleted && !allSectionsComplete;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
      >
        <Card className={cn(
          "overflow-hidden transition-all",
          passed && "ring-2 ring-emerald-400 bg-gradient-to-r from-emerald-50 to-white",
          isLocked && "opacity-50"
        )}>
          <CardContent className="p-0">
            <div className="flex items-stretch">
              {/* Status indicator */}
              <div className={cn(
                "w-20 flex flex-col items-center justify-center py-6",
                passed ? "bg-emerald-500" : canTake ? "bg-amber-500" : "bg-gray-200"
              )}>
                {passed ? (
                  <CheckCircle2 className="w-8 h-8 text-white" aria-hidden="true" />
                ) : isLocked ? (
                  <Lock className="w-6 h-6 text-gray-400" aria-hidden="true" />
                ) : (
                  <FileText className="w-8 h-8 text-white" aria-hidden="true" />
                )}
                <span className={cn(
                  "text-[10px] font-semibold mt-1",
                  passed || canTake ? "text-white" : "text-gray-500"
                )}>
                  {passed ? "PASSED" : isLocked ? "LOCKED" : "READY"}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-primary">{assessment.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{assessment.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {assessment.passingScore}% to pass
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" aria-hidden="true" /> {assessment.questions.length} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" /> {assessment.timeLimit} min
                  </span>
                  <span className={cn(
                    "flex items-center gap-1",
                    attempts >= assessment.maxAttempts && !passed && "text-red-500"
                  )}>
                    Attempts: {attempts}/{assessment.maxAttempts}
                  </span>
                </div>

                {isLocked ? (
                  <p className="text-xs text-gray-400">Complete {module?.code || 'module'} first</p>
                ) : passed ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 text-sm">
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      Assessment completed successfully
                    </div>
                    {/* #76: Mentor feedback section */}
                    {(() => {
                      const feedback = getAssessmentFeedback(assessment.id);
                      if (feedback?.status === 'received') {
                        return (
                          <div className="mt-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="flex items-center gap-2 text-xs text-primary font-medium mb-1">
                              <MessageSquare className="w-3 h-3" aria-hidden="true" />
                              Mentor Feedback from {feedback.mentorName}
                            </div>
                            <p className="text-xs text-gray-600">{feedback.feedback}</p>
                            {feedback.suggestions && feedback.suggestions.length > 0 && (
                              <div className="mt-1.5 text-xs text-gray-500">
                                <span className="font-medium">Suggestions:</span>
                                <ul className="list-disc list-inside">
                                  {feedback.suggestions.map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      } else if (feedback?.status === 'pending') {
                        return (
                          <div className="flex items-center gap-2 text-xs text-amber-600">
                            <Clock className="w-3 h-3" />
                            Mentor feedback requested - awaiting response
                          </div>
                        );
                      } else {
                        return (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-primary/20 text-primary hover:bg-primary/5"
                            onClick={() => {
                              setFeedbackAssessmentId(assessment.id);
                              setShowFeedbackModal(true);
                            }}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" aria-hidden="true" />
                            Request Mentor Feedback
                          </Button>
                        );
                      }
                    })()}
                  </div>
                ) : canTake ? (
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600"
                    onClick={() => openAssessment(assessment.id)}
                    aria-label={attempts > 0 ? `Retry ${assessment.title}` : `Start ${assessment.title}`}
                  >
                    {attempts > 0 ? 'Retry Assessment' : 'Start Assessment'}
                    <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-red-500">Maximum attempts reached</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-amber-300 text-amber-600 hover:bg-amber-50"
                      onClick={() => {
                        setAssessmentAttempts(prev => {
                          const { [assessment.id]: _, ...rest } = prev;
                          return rest;
                        });
                        toast.info('Assessment attempts reset', {
                          description: 'You can now retake the assessment'
                        });
                      }}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Reset & Retake
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <AgentLoungeLayout>
      {/* Phase 3: Offline Indicator */}
      <OfflineIndicator />

      {/* Phase 3: Celebration Components */}
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

      {/* Question of the Day - Shows once per day on login */}
      {showQOTD && (
        <QuestionOfTheDayPopup
          question="What is the primary purpose of suitability analysis in insurance sales?"
          options={[
            'To maximize commission potential',
            'To ensure the product meets the client\'s needs and financial situation',
            'To speed up the application process',
            'To compare competing products'
          ]}
          correctIndex={1}
          explanation="Suitability analysis ensures that any recommended product is appropriate for the client's specific needs, financial situation, and objectives. This is both an ethical obligation and regulatory requirement."
          moduleReference="Compliance Training"
          xpReward={25}
          onAnswer={(correct) => {
            if (correct) {
              const xpEvent: XPEarnedEvent = {
                type: 'daily_challenge',
                baseXP: 25,
                multiplier: getStreakMultiplier(currentStreak),
                totalXP: Math.round(25 * getStreakMultiplier(currentStreak)),
                description: 'Question of the Day - Correct!'
              };
              setXpEarnedEvent(xpEvent);
              setTotalXP(prev => prev + xpEvent.totalXP);
            }
          }}
          onDismiss={dismissQOTD}
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

      {/* Phase 5: Retention Quiz Popup */}
      {retentionQuestions.length > 0 && (
        <RetentionQuiz
          open={showRetentionQuiz}
          onOpenChange={(open) => {
            setShowRetentionQuiz(open);
            if (!open) {
              // Show rating after quiz closes
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
          onComplete={(_results) => {
            setShowRetentionQuiz(false);
            // Show rating popup after quiz
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

      {/* Phase 5: Module Rating Popup */}
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
                // TODO: Persist rating to backend
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

      {/* #76: Mentor Feedback Request Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
              Request Mentor Feedback
            </DialogTitle>
            <DialogDescription>
              Request personalized feedback from your assigned mentor on this assessment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-medium text-sm text-primary mb-2">What you'll receive:</h4>
              <ul className="text-xs text-primary/80 space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>Detailed review of your assessment responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>Personalized suggestions for improvement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>Performance rating from your mentor</span>
                </li>
              </ul>
            </div>
            <p className="text-xs text-gray-500">
              Typical response time: 1-2 business days. You'll receive a notification when feedback is available.
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFeedbackModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => feedbackAssessmentId && handleRequestFeedback(feedbackAssessmentId)}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Request Feedback
            </Button>
          </DialogFooter>
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
              <XCircle className="w-5 h-5" aria-hidden="true" />
              Assessment Not Passed
            </DialogTitle>
            <DialogDescription>
              You scored {failedAssessmentResult?.score}%. A passing score of {selectedAssessment?.passingScore ?? 80}% is required to continue to the next module.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-gray-600">
              We recommend reviewing the module material before trying again. You can:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc">
              <li>Go through the module sections again to reinforce key concepts</li>
              <li>Retake the assessment immediately if you feel ready</li>
            </ul>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAssessmentFailDialog(false);
                // Reopen the module viewer to review from beginning
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

      {/* Module Viewer - Full Page (replaces main content when open) */}
      {selectedModule && moduleViewerOpen ? (
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
      ) : (
      <>
      {/* Phase 3: Collapsible Sidebar for Desktop */}
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

      <div className="space-y-6 pb-20 lg:pb-0">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-primary rounded-2xl p-6 lg:p-8"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={HERO_BG_STYLE} />
          </div>

          {/* Animated accent shapes */}
          <motion.div
            className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <div className="relative">
            {/* Top Row: Title + Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
              <div className="flex-1">
                <motion.div
                  className="flex items-center gap-3 mb-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-white/80" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-serif font-bold text-white">
                      Training Center
                    </h1>
                    <p className="text-white/50 text-xs">
                      {currentCertification ? `Working on: ${currentCertification.name}` : 'Complete certifications to begin'}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Quick Stats Row */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Progress */}
                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                  <CircularProgress value={overallProgress} size={44} strokeWidth={4} color="accent">
                    <span className="text-xs font-bold text-white">{overallProgress}%</span>
                  </CircularProgress>
                  <div className="hidden sm:block">
                    <p className="text-white text-sm font-medium">{completedModulesCount}/{totalModules}</p>
                    <p className="text-white/50 text-[10px]">Modules</p>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Flame aria-hidden="true" className={cn(
                      "w-6 h-6",
                      currentStreak >= 7 ? "text-orange-400" : currentStreak >= 3 ? "text-amber-400" : "text-white/60"
                    )} />
                  </motion.div>
                  <div>
                    <p className="text-white text-sm font-bold">{currentStreak}</p>
                    <p className="text-white/50 text-[10px]">Day Streak</p>
                  </div>
                </div>

                {/* XP */}
                <div className="hidden sm:flex items-center gap-2 bg-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
                  <Zap className="w-5 h-5 text-amber-300" aria-hidden="true" />
                  <div>
                    <p className="text-white text-sm font-bold">{totalXP.toLocaleString()}</p>
                    <p className="text-white/50 text-[10px]">Total XP</p>
                  </div>
                </div>

                {/* #74: Sync indicator */}
                <div className="hidden lg:flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
                  <RefreshCw className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <div>
                    <p className="text-white/80 text-[10px]">Synced</p>
                    <time className="text-white/50 text-[9px] block" dateTime={lastSyncedAt || new Date().toISOString()}>
                      {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </time>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Certification Pathway - Desktop */}
            <motion.div
              className="hidden md:block bg-white/10 rounded-xl p-4 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CertificationPathway
                certificationStatuses={certificationStatuses}
                curriculumProgress={overallProgress}
                onNodeClick={(_certId) => {
                  setActiveTab('certifications');
                }}
              />
            </motion.div>

            {/* Certification Pathway - Mobile (Vertical) */}
            <motion.div
              className="md:hidden bg-white/10 rounded-xl p-4 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CertificationPathwayVertical
                stages={[
                  {
                    id: 'curriculum',
                    title: 'Curriculum',
                    description: 'Complete all training modules',
                    status: overallProgress >= 100 ? 'completed' : 'current',
                    modules: totalModules,
                    completedModules: completedModulesCount,
                    estimatedTime: 'Required'
                  },
                  ...CERTIFICATION_GATES.map(cert => ({
                    id: cert.id,
                    title: cert.name,
                    description: cert.description || '',
                    status: overallProgress < 100
                      ? 'locked' as const
                      : certificationStatuses[cert.id] === 'certified'
                        ? 'completed' as const
                        : certificationStatuses[cert.id] === 'in_progress' || certificationStatuses[cert.id] === 'available'
                          ? 'current' as const
                          : 'locked' as const,
                    modules: cert.requiredModules.length,
                    completedModules: cert.requiredModules.filter(m => completedModules.includes(m)).length,
                    estimatedTime: `${cert.requiredModules.reduce((acc, id) => {
                      const mod = getModuleById(id);
                      return acc + (mod?.duration || 0);
                    }, 0)} min`
                  }))
                ]}
                onStageSelect={(stageId: string) => {
                  if (stageId === 'curriculum') {
                    setActiveTab('curriculum');
                  } else {
                    setActiveTab('certifications');
                  }
                }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Current Focus - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <CurrentFocusCard
            currentModule={nextRequiredModule || null}
            currentProgress={currentModuleProgress}
            certificationName={currentCertification?.name || 'Pre-Access Certification'}
            lastModule={lastModuleId ? getModuleById(lastModuleId) : null}
            lastModuleProgress={lastModuleId && completedSections[lastModuleId]?.length
              ? Math.round((completedSections[lastModuleId].length / (getModuleById(lastModuleId)?.sections.length || 1)) * 100)
              : 0}
            onContinue={() => nextRequiredModule && openModule(nextRequiredModule)}
            onResumeLast={() => {
              if (lastModuleId) {
                const module = getModuleById(lastModuleId);
                if (module) openModule(module);
              }
            }}
          />
        </motion.div>

        {/* Daily Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <DailyChallengeCard
            challenges={dailyChallenges}
            onClaimReward={(challengeId) => {
              const challenge = dailyChallenges.find(c => c.id === challengeId);
              if (challenge && challenge.current >= challenge.target) {
                const xpEvent: XPEarnedEvent = {
                  type: 'daily_challenge',
                  baseXP: challenge.xpReward,
                  multiplier: getStreakMultiplier(currentStreak),
                  totalXP: Math.round(challenge.xpReward * getStreakMultiplier(currentStreak)),
                  description: `Daily Challenge: ${challenge.title}`
                };
                setXpEarnedEvent(xpEvent);
                setTotalXP(prev => prev + xpEvent.totalXP);
              }
            }}
          />
        </motion.div>

        {/* Breadcrumb Navigation */}
        <TrainingBreadcrumb
          items={[
            { label: 'Training', onClick: () => setActiveTab('curriculum') },
            { label: activeTab === 'curriculum' ? 'Curriculum' :
                     activeTab === 'certifications' ? 'Certifications' :
                     activeTab === 'assessments' ? 'Assessments' :
                     activeTab === 'simulations' ? 'Simulations' :
                     activeTab === 'videos' ? 'Videos' : 'Resources' }
          ]}
          className="mb-4"
        />

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-gray-100/80 p-1 flex-wrap">
              <TabsTrigger value="curriculum" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Curriculum
              </TabsTrigger>
              <TabsTrigger value="certifications" className="gap-2">
                <Award className="w-4 h-4" />
                Certifications
              </TabsTrigger>
              <TabsTrigger value="assessments" className="gap-2">
                <FileText className="w-4 h-4" />
                Assessments
              </TabsTrigger>
              <TabsTrigger value="simulations" className="gap-2">
                <Headphones className="w-4 h-4" />
                Simulations
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="w-4 h-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-2">
                <Library className="w-4 h-4" />
                Resources
              </TabsTrigger>
            </TabsList>

            {/* Phase 3: Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <TrainingSearch
                  modules={INSTITUTIONAL_MODULES}
                  onSelectModule={(module) => {
                    openModule(module);
                    toast.info(`Opening: ${module.title}`);
                  }}
                />
              </div>
              <FilterSortControls
                sortBy={sortBy}
                filterStatus={filterStatus}
                filterCategory={filterCategory}
                onSortChange={setSortBy}
                onFilterStatusChange={setFilterStatus}
                onFilterCategoryChange={setFilterCategory}
              />
            </div>

            {/* Curriculum Tab */}
            <TabsContent value="curriculum" className="space-y-8">
              {/* Getting Started - Onboarding */}
              <section aria-label="Getting Started">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-cyan-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-primary">Getting Started</h2>
                    <p className="text-xs text-gray-500">Welcome, setup, and portal orientation</p>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {modulesByLevel.onboarding.filter(m => completedModules.includes(m.id)).length}/
                    {modulesByLevel.onboarding.length}
                  </Badge>
                </div>
                {filteredModulesByLevel.onboarding.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No modules match the current filters</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredModulesByLevel.onboarding.map((module, idx) => (
                      <ModuleCard key={module.id} module={module} index={idx} />
                    ))}
                  </div>
                )}
              </section>

              {/* Doctrine & Compliance */}
              <section aria-label="Institutional Doctrine & Compliance">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-primary">Institutional Doctrine & Compliance</h2>
                    <p className="text-xs text-gray-500">Philosophy, professional standards, and regulatory requirements</p>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {modulesByLevel.doctrine.filter(m => completedModules.includes(m.id)).length}/
                    {modulesByLevel.doctrine.length}
                  </Badge>
                </div>
                {filteredModulesByLevel.doctrine.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No modules match the current filters</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredModulesByLevel.doctrine.map((module, idx) => (
                      <ModuleCard key={module.id} module={module} index={idx} />
                    ))}
                  </div>
                )}
              </section>

              {/* Methodology */}
              <section aria-label="Education-First Methodology">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-primary">Education-First Methodology</h2>
                    <p className="text-xs text-gray-500">Call framework, disclosures, and client interactions</p>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {modulesByLevel.methodology.filter(m => completedModules.includes(m.id)).length}/
                    {modulesByLevel.methodology.length}
                  </Badge>
                </div>
                {filteredModulesByLevel.methodology.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No modules match the current filters</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredModulesByLevel.methodology.map((module, idx) => (
                      <ModuleCard key={module.id} module={module} index={idx} />
                    ))}
                  </div>
                )}
              </section>

              {/* Advanced Compliance - Hard Gate */}
              <section aria-label="Advanced Compliance Verification">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-primary">Advanced Compliance Verification</h2>
                    <p className="text-xs text-gray-500">Stress testing and suitability analysis — required before product training</p>
                  </div>
                  <Badge variant="outline" className="font-mono bg-amber-50 border-amber-200 text-amber-700">
                    {modulesByLevel.advanced_compliance.filter(m => completedModules.includes(m.id)).length}/
                    {modulesByLevel.advanced_compliance.length}
                  </Badge>
                </div>
                {filteredModulesByLevel.advanced_compliance.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No modules match the current filters</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredModulesByLevel.advanced_compliance.map((module, idx) => (
                      <ModuleCard key={module.id} module={module} index={idx} />
                    ))}
                  </div>
                )}
              </section>

              {/* Product Knowledge */}
              <section aria-label="Product Knowledge">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-primary">Product Knowledge</h2>
                    <p className="text-xs text-gray-500">Term life, IUL, final expense, and annuities</p>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {modulesByLevel.product.filter(m => completedModules.includes(m.id)).length}/
                    {modulesByLevel.product.length}
                  </Badge>
                </div>
                {filteredModulesByLevel.product.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No modules match the current filters</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredModulesByLevel.product.map((module, idx) => (
                      <ModuleCard key={module.id} module={module} index={idx} />
                    ))}
                  </div>
                )}
              </section>

              {/* Recommendation & Client Decision Facilitation */}
              <section aria-label="Recommendation & Client Decision Facilitation">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-primary">Recommendation & Client Decision Facilitation</h2>
                    <p className="text-xs text-gray-500">Needs analysis, client questions, and decision confirmation</p>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {modulesByLevel.client_facilitation.filter(m => completedModules.includes(m.id)).length}/
                    {modulesByLevel.client_facilitation.length}
                  </Badge>
                </div>
                {filteredModulesByLevel.client_facilitation.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No modules match the current filters</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredModulesByLevel.client_facilitation.map((module, idx) => (
                      <ModuleCard key={module.id} module={module} index={idx} />
                    ))}
                  </div>
                )}
              </section>
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certifications">
              <CertificationTracker
                completedModules={completedModules}
                passedAssessments={passedAssessments}
                certificationStatuses={certificationStatuses}
                onStartCertification={startCertification}
                onContinueCertification={(certId) => {
                  const cert = CERTIFICATION_GATES.find(c => c.id === certId);
                  if (cert) {
                    const nextModule = cert.requiredModules
                      .map(id => getModuleById(id))
                      .find(m => m && !completedModules.includes(m.id));
                    if (nextModule) {
                      openModule(nextModule);
                    }
                  }
                }}
              />
            </TabsContent>

            {/* Assessments Tab */}
            <TabsContent value="assessments" className="space-y-4">
              {ASSESSMENTS.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                    <h3 className="font-medium text-gray-600">No Assessments Available</h3>
                    <p className="text-sm text-gray-500 mt-1">Assessments will appear here as you progress through the curriculum.</p>
                  </CardContent>
                </Card>
              ) : (
                ASSESSMENTS.map((assessment, idx) => (
                  <AssessmentCard key={assessment.id} assessment={assessment} index={idx} />
                ))
              )}
            </TabsContent>

            {/* Mock Calls Tab - Removed, replaced by Simulations */}

            {/* Simulations Tab */}
            <TabsContent value="simulations" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-primary">Interactive Call Simulations</h2>
                  <p className="text-sm text-gray-500">Practice real client scenarios with branching conversations and instant feedback</p>
                </div>
              </div>

              {/* Simulation scenarios placeholder - will be populated with real scenarios */}
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Headphones className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-medium text-gray-600">Call Simulations</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                    Interactive role-play scenarios with branching conversations will be available soon.
                    Practice handling client objections, discovery calls, and compliance scenarios.
                  </p>
                  <Badge variant="secondary" className="mt-4">Coming Soon</Badge>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos" className="space-y-6">
              <VideoLibrary />
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-8">
              {/* Glossary Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-primary">Industry Glossary</h2>
                    <p className="text-xs text-gray-500">Definitions for key insurance and compliance terms</p>
                  </div>
                  <Badge variant="outline">{GLOSSARY_TERMS.length} terms</Badge>
                </div>
                <div className="mb-4">
                  <GlossarySearch className="max-w-md" />
                </div>
                <GlossaryPanel />
              </section>

              {/* Quick Reference Cards */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-primary">Quick Reference Cards</h2>
                    <p className="text-xs text-gray-500">At-a-glance guides for products and processes</p>
                  </div>
                  <Badge variant="outline">{QUICK_REFERENCE_CARDS.length} cards</Badge>
                </div>
                {QUICK_REFERENCE_CARDS.length > 0 ? (
                  <QuickReferenceList />
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center text-gray-500">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Quick reference cards coming soon</p>
                    </CardContent>
                  </Card>
                )}
              </section>

              {/* Offline Download Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Download className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-primary">Offline Access</h2>
                    <p className="text-xs text-gray-500">Download modules to study without internet</p>
                  </div>
                </div>
                <OfflineDownloadManager
                  modules={INSTITUTIONAL_MODULES.slice(0, OFFLINE_MODULE_LIMIT).map(m => ({
                    id: m.id,
                    title: m.title,
                    code: m.code,
                    duration: m.duration,
                    size: Math.round(m.duration * MODULE_SIZE_MULTIPLIER)
                  }))}
                  downloadedModules={downloadedModules}
                  onDownload={handleDownloadModule}
                  onRemove={handleRemoveModule}
                />
              </section>

              {/* Carrier Information */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-primary">Carrier Partners</h2>
                    <p className="text-xs text-gray-500">Compare carriers, products, and features</p>
                  </div>
                  <Badge variant="outline">{CARRIERS.length} carriers</Badge>
                </div>
                {CARRIERS.length > 0 ? (
                  <CarrierComparison maxCarriers={4} />
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center text-gray-500">
                      <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Carrier information coming soon</p>
                    </CardContent>
                  </Card>
                )}
              </section>
            </TabsContent>

          </Tabs>
        </motion.div>

        {/* Compliance Footer with Export */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <FileCheck className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Documentation & Compliance</p>
                    <p className="text-xs text-gray-500 mt-1">
                      All training completion records are maintained for regulatory audit purposes.
                      Certifications are tracked in your personnel file and reported to compliance.
                    </p>
                  </div>
                </div>
                <QuickExportButton
                  onExportPDF={exportCompletionRecordsPDF}
                  onExportCSV={exportCompletionRecordsCSV}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </>
      )}
    </AgentLoungeLayout>
  );
}
