/**
 * Mobile Training Components - Phase 3.5
 *
 * Mobile-first redesign with:
 * - Vertical certification pathway for mobile
 * - Icon-only tabs with tooltips
 * - Touch-optimized components (44x44px minimum)
 * - Swipe navigation gestures
 * - Pull-to-refresh functionality
 * - Offline storage with IndexedDB
 */

import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  BookOpen,
  Award,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronDown,
  Check,
  Lock,
  Play,
  Clock,
  WifiOff,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Circle,
  Loader2,
  Download,
  Cloud,
  Trash
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// CERTIFICATION PATHWAY VERTICAL (Mobile)
// ============================================================================

interface CertificationStage {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  modules: number;
  completedModules: number;
  estimatedTime: string;
}

interface CertificationPathwayVerticalProps {
  stages: CertificationStage[];
  onStageSelect: (stageId: string) => void;
  className?: string;
}

export function CertificationPathwayVertical({
  stages,
  onStageSelect,
  className
}: CertificationPathwayVerticalProps) {
  return (
    <div className={cn("relative py-4", className)}>
      {/* Vertical line connector */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isCompleted = stage.status === 'completed';
          const isCurrent = stage.status === 'current';
          const isLocked = stage.status === 'locked';

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-14"
            >
              {/* Status indicator */}
              <div
                className={cn(
                  "absolute left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10",
                  isCompleted && "bg-green-500 border-green-500",
                  isCurrent && "bg-violet-500 border-violet-500 animate-pulse",
                  isLocked && "bg-gray-100 border-gray-300"
                )}
              >
                {isCompleted && <Check className="w-3 h-3 text-white" />}
                {isCurrent && <Play className="w-2.5 h-2.5 text-primary" />}
                {isLocked && <Lock className="w-2.5 h-2.5 text-gray-400" />}
              </div>

              {/* Stage card */}
              <TouchTarget
                onPress={() => !isLocked && onStageSelect(stage.id)}
                disabled={isLocked}
              >
                <Card
                  className={cn(
                    "transition-all",
                    isCompleted && "bg-green-50 border-green-200",
                    isCurrent && "bg-violet-500/10 border-violet-500 shadow-md",
                    isLocked && "bg-gray-50 border-gray-200 opacity-60"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-semibold text-sm",
                          isLocked && "text-gray-400"
                        )}>
                          {stage.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {stage.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {stage.completedModules}/{stage.modules}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {stage.estimatedTime}
                          </span>
                        </div>
                      </div>
                      {!isLocked && (
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>

                    {/* Progress bar */}
                    {stage.modules > 0 && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(stage.completedModules / stage.modules) * 100}%` }}
                            className={cn(
                              "h-full rounded-full",
                              isCompleted && "bg-green-500",
                              isCurrent && "bg-violet-500",
                              isLocked && "bg-gray-300"
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TouchTarget>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MOBILE TAB NAVIGATION (Icon-only with tooltips)
// ============================================================================

interface MobileTab {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

interface MobileTabNavigationProps {
  tabs: MobileTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MobileTabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className
}: MobileTabNavigationProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom",
        className
      )}>
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map(tab => {
            const isActive = tab.id === activeTab;
            const Icon = tab.icon;

            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <TouchTarget
                    onPress={() => onTabChange(tab.id)}
                    className="flex-1"
                  >
                    <div className={cn(
                      "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors",
                      isActive && "bg-violet-500/10"
                    )}>
                      <div className="relative">
                        <Icon className={cn(
                          "w-6 h-6 transition-colors",
                          isActive ? "text-primary" : "text-gray-500"
                        )} />
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {tab.badge > 9 ? '9+' : tab.badge}
                          </span>
                        )}
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium",
                        isActive ? "text-primary" : "text-gray-500"
                      )}>
                        {tab.label}
                      </span>
                    </div>
                  </TouchTarget>
                </TooltipTrigger>
                <TooltipContent side="top" className="md:hidden">
                  {tab.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
}

// Default training tabs
export const DEFAULT_TRAINING_TABS: MobileTab[] = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'modules', icon: BookOpen, label: 'Learn' },
  { id: 'certifications', icon: Award, label: 'Certs' },
  { id: 'progress', icon: BarChart3, label: 'Progress' },
  { id: 'settings', icon: Settings, label: 'Settings' }
];

// ============================================================================
// TOUCH TARGET WRAPPER (44x44px minimum)
// ============================================================================

interface TouchTargetProps {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  minSize?: number;
}

export function TouchTarget({
  children,
  onPress,
  disabled = false,
  className,
  minSize = 44
}: TouchTargetProps) {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={cn(
        "relative touch-manipulation select-none",
        disabled && "cursor-not-allowed",
        className
      )}
      style={{ minWidth: minSize, minHeight: minSize }}
    >
      {children}
    </button>
  );
}

// ============================================================================
// SWIPE NAVIGATOR
// ============================================================================

interface SwipeNavigatorProps {
  children: ReactNode[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
  enableSwipe?: boolean;
}

export function SwipeNavigator({
  children,
  currentIndex,
  onIndexChange,
  className,
  enableSwipe = true
}: SwipeNavigatorProps) {
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!enableSwipe) return;

    const threshold = 100;
    const velocity = 0.5;

    if (info.offset.x > threshold || info.velocity.x > velocity) {
      // Swiped right - go to previous
      if (currentIndex > 0) {
        setDirection(-1);
        onIndexChange(currentIndex - 1);
      }
    } else if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      // Swiped left - go to next
      if (currentIndex < children.length - 1) {
        setDirection(1);
        onIndexChange(currentIndex + 1);
      }
    }
  }, [currentIndex, children.length, onIndexChange, enableSwipe]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag={enableSwipe ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="w-full"
        >
          {children[currentIndex]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {children.map((_, index) => (
          <TouchTarget
            key={index}
            onPress={() => {
              setDirection(index > currentIndex ? 1 : -1);
              onIndexChange(index);
            }}
            minSize={32}
          >
            <Circle
              className={cn(
                "w-2 h-2 transition-colors",
                index === currentIndex
                  ? "fill-primary text-primary"
                  : "fill-gray-300 text-gray-300"
              )}
            />
          </TouchTarget>
        ))}
      </div>

      {/* Arrow navigation for larger screens */}
      <div className="hidden sm:flex absolute inset-y-0 left-0 right-0 items-center justify-between pointer-events-none px-2">
        <TouchTarget
          onPress={() => {
            if (currentIndex > 0) {
              setDirection(-1);
              onIndexChange(currentIndex - 1);
            }
          }}
          disabled={currentIndex === 0}
          className={cn(
            "pointer-events-auto p-2 rounded-full bg-white/80 shadow-md",
            currentIndex === 0 && "opacity-50"
          )}
        >
          <ArrowLeft className="w-5 h-5" />
        </TouchTarget>
        <TouchTarget
          onPress={() => {
            if (currentIndex < children.length - 1) {
              setDirection(1);
              onIndexChange(currentIndex + 1);
            }
          }}
          disabled={currentIndex === children.length - 1}
          className={cn(
            "pointer-events-auto p-2 rounded-full bg-white/80 shadow-md",
            currentIndex === children.length - 1 && "opacity-50"
          )}
        >
          <ArrowRight className="w-5 h-5" />
        </TouchTarget>
      </div>
    </div>
  );
}

// ============================================================================
// PULL TO REFRESH
// ============================================================================

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number;
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
  threshold = 80
}: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply resistance as user pulls further
      const resistance = Math.min(diff * 0.4, threshold * 1.5);
      setPullDistance(resistance);
    }
  }, [pulling, refreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;

    setPulling(false);

    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pulling, pullDistance, threshold, refreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute left-0 right-0 flex items-center justify-center z-10 overflow-hidden"
        style={{ top: 0 }}
        animate={{
          height: pullDistance,
          opacity: progress
        }}
      >
        <motion.div
          animate={{
            rotate: refreshing ? 360 : progress * 180
          }}
          transition={refreshing ? {
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          } : {
            duration: 0
          }}
        >
          {refreshing ? (
            <Loader2 className="w-6 h-6 text-primary" />
          ) : (
            <RefreshCw
              className={cn(
                "w-6 h-6 transition-colors",
                shouldTrigger ? "text-primary" : "text-gray-400"
              )}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        animate={{
          y: pullDistance
        }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================================================
// OFFLINE INDICATOR
// ============================================================================

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show reconnected message briefly
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    setIsOnline(navigator.onLine);
    setShowBanner(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-50 safe-area-top",
            className
          )}
        >
          <div className={cn(
            "px-4 py-2 text-center text-sm font-medium",
            isOnline
              ? "bg-green-500 text-white"
              : "bg-amber-500 text-white"
          )}>
            <div className="flex items-center justify-center gap-2">
              {isOnline ? (
                <>
                  <Check className="w-4 h-4" />
                  Back online
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  You're offline. Some features may be limited.
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// OFFLINE STORAGE HOOK (IndexedDB)
// ============================================================================

interface OfflineStorageOptions {
  dbName?: string;
  storeName?: string;
  version?: number;
}

export function useOfflineStorage<T>({
  dbName = 'gcf-training',
  storeName = 'progress',
  version = 1
}: OfflineStorageOptions = {}) {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const request = indexedDB.open(dbName, version);

    request.onerror = () => {
      console.error('Failed to open IndexedDB');
    };

    request.onsuccess = () => {
      setDb(request.result);
      setIsReady(true);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, { keyPath: 'id' });
      }

      // Create additional stores for offline data
      if (!database.objectStoreNames.contains('modules')) {
        database.createObjectStore('modules', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('notes')) {
        database.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('bookmarks')) {
        database.createObjectStore('bookmarks', { keyPath: 'id' });
      }
    };

    return () => {
      db?.close();
    };
  }, [dbName, storeName, version]);

  const saveItem = useCallback(async (key: string, data: T): Promise<void> => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ id: key, data, updatedAt: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db, storeName]);

  const getItem = useCallback(async (key: string): Promise<T | null> => {
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.data || null);
      };
      request.onerror = () => reject(request.error);
    });
  }, [db, storeName]);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db, storeName]);

  const getAllItems = useCallback(async (): Promise<Array<{ id: string; data: T }>> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  }, [db, storeName]);

  return {
    isReady,
    saveItem,
    getItem,
    removeItem,
    getAllItems
  };
}

// ============================================================================
// MOBILE MODULE CARD (Single-column stacked)
// ============================================================================

interface MobileModuleCardProps {
  module: {
    id: string;
    code: string;
    title: string;
    description?: string;
    duration: number;
    status: 'completed' | 'in_progress' | 'not_started' | 'locked';
    progress?: number;
  };
  onSelect: (moduleId: string) => void;
}

export function MobileModuleCard({ module, onSelect }: MobileModuleCardProps) {
  const statusConfig = {
    completed: {
      badge: 'Completed',
      badgeClass: 'bg-green-100 text-green-800',
      iconClass: 'bg-green-500',
      icon: Check
    },
    in_progress: {
      badge: 'In Progress',
      badgeClass: 'bg-blue-100 text-blue-800',
      iconClass: 'bg-blue-500',
      icon: Play
    },
    not_started: {
      badge: 'Not Started',
      badgeClass: 'bg-gray-100 text-gray-600',
      iconClass: 'bg-gray-400',
      icon: Circle
    },
    locked: {
      badge: 'Locked',
      badgeClass: 'bg-gray-100 text-gray-400',
      iconClass: 'bg-gray-300',
      icon: Lock
    }
  };

  const config = statusConfig[module.status];
  const StatusIcon = config.icon;
  const isLocked = module.status === 'locked';

  return (
    <TouchTarget
      onPress={() => !isLocked && onSelect(module.id)}
      disabled={isLocked}
      className="w-full"
    >
      <Card className={cn(
        "transition-all active:scale-[0.98]",
        isLocked && "opacity-60"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              config.iconClass
            )}>
              <StatusIcon className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{module.code}</p>
                  <h3 className="font-semibold text-sm leading-tight mt-0.5">
                    {module.title}
                  </h3>
                </div>
                <Badge className={cn("text-[10px] flex-shrink-0", config.badgeClass)}>
                  {config.badge}
                </Badge>
              </div>

              {module.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {module.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {module.duration} min
                </span>
                {module.progress !== undefined && module.progress > 0 && (
                  <span className="text-xs text-gray-500">
                    {module.progress}% complete
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {module.status === 'in_progress' && module.progress !== undefined && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {!isLocked && (
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
            )}
          </div>
        </CardContent>
      </Card>
    </TouchTarget>
  );
}

// ============================================================================
// RESPONSIVE CONTAINER
// ============================================================================

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export function ResponsiveContainer({
  children,
  className,
  mobileClassName = "px-4 pb-20",
  desktopClassName = "px-6 lg:px-8"
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      "w-full",
      // Mobile styles
      mobileClassName,
      // Desktop overrides
      `md:${desktopClassName}`,
      className
    )}>
      {children}
    </div>
  );
}

// ============================================================================
// MOBILE HEADER
// ============================================================================

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
  className?: string;
}

export function MobileHeader({
  title,
  subtitle,
  onBack,
  action,
  className
}: MobileHeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-30 bg-white border-b border-gray-200 safe-area-top",
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <TouchTarget onPress={onBack}>
              <ArrowLeft className="w-6 h-6" />
            </TouchTarget>
          )}
          <div>
            <h1 className="font-semibold text-base leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
    </header>
  );
}

// ============================================================================
// OFFLINE DOWNLOAD MANAGER
// ============================================================================

interface DownloadableModule {
  id: string;
  title: string;
  code: string;
  duration: number;
  size?: number; // Estimated size in KB
}

interface OfflineDownloadManagerProps {
  modules: DownloadableModule[];
  downloadedModules: string[];
  onDownload: (moduleId: string) => Promise<void>;
  onRemove: (moduleId: string) => Promise<void>;
  className?: string;
}

export function OfflineDownloadManager({
  modules,
  downloadedModules,
  onDownload,
  onRemove,
  className
}: OfflineDownloadManagerProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleDownload = async (moduleId: string) => {
    setDownloadingId(moduleId);
    try {
      await onDownload(moduleId);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRemove = async (moduleId: string) => {
    setRemovingId(moduleId);
    try {
      await onRemove(moduleId);
    } finally {
      setRemovingId(null);
    }
  };

  const totalDownloaded = downloadedModules.length;
  const totalAvailable = modules.length;
  const estimatedSize = modules
    .filter(m => downloadedModules.includes(m.id))
    .reduce((acc, m) => acc + (m.size || 50), 0);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="w-4 h-4 text-violet-500" />
            Offline Access
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalDownloaded}/{totalAvailable} saved
          </Badge>
        </div>
        {totalDownloaded > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            ~{(estimatedSize / 1024).toFixed(1)} MB stored on device
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="max-h-64">
          <div className="space-y-2">
            {modules.map((module) => {
              const isDownloaded = downloadedModules.includes(module.id);
              const isDownloading = downloadingId === module.id;
              const isRemoving = removingId === module.id;

              return (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      isDownloaded ? "bg-green-100" : "bg-gray-200"
                    )}>
                      {isDownloaded ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Cloud className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{module.title}</p>
                      <p className="text-xs text-gray-500">
                        {module.code} • {module.duration} min
                        {module.size && ` • ~${module.size}KB`}
                      </p>
                    </div>
                  </div>

                  {isDownloaded ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(module.id)}
                      disabled={isRemoving}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Remove ${module.title} from offline storage`}
                    >
                      {isRemoving ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Trash className="w-4 h-4" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(module.id)}
                      disabled={isDownloading}
                      className="text-primary hover:bg-primary/10"
                      aria-label={`Download ${module.title} for offline access`}
                    >
                      {isDownloading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {totalDownloaded === 0 && (
          <div className="text-center py-4">
            <Cloud className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Download modules to access them offline
            </p>
          </div>
        )}

        {totalDownloaded > 0 && totalDownloaded < totalAvailable && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={async () => {
              for (const module of modules) {
                if (!downloadedModules.includes(module.id)) {
                  await handleDownload(module.id);
                }
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download All Remaining
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Download button for individual modules
interface ModuleDownloadButtonProps {
  moduleId: string;
  isDownloaded: boolean;
  onDownload: () => Promise<void>;
  onRemove: () => Promise<void>;
  size?: 'sm' | 'default';
}

export function ModuleDownloadButton({
  moduleId,
  isDownloaded,
  onDownload,
  onRemove,
  size = 'default'
}: ModuleDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (isDownloaded) {
        await onRemove();
      } else {
        await onDownload();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <Button
      variant={isDownloaded ? "outline" : "ghost"}
      size={size === 'sm' ? 'sm' : 'default'}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        isDownloaded
          ? "text-green-600 border-green-200 hover:bg-green-50"
          : "text-gray-500 hover:text-primary"
      )}
      aria-label={isDownloaded ? "Remove from offline storage" : "Download for offline access"}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className={iconSize} />
        </motion.div>
      ) : isDownloaded ? (
        <>
          <Check className={cn(iconSize, "mr-1")} />
          {size !== 'sm' && 'Saved'}
        </>
      ) : (
        <>
          <Download className={cn(iconSize, size !== 'sm' && "mr-1")} />
          {size !== 'sm' && 'Download'}
        </>
      )}
    </Button>
  );
}
