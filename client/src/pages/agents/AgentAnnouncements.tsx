import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination, usePagination } from "@/components/agent/primitives/Pagination";
import {
  Bell,
  Megaphone,
  Star,
  Gift,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Pin,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/agent/primitives";

// Type definitions
interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  date: string;
  time: string;
  isPinned: boolean;
  isRead: boolean;
  author: string;
}

type AnnouncementCategory = 'important' | 'celebration' | 'training' | 'system' | 'product' | 'promotion';

interface CategoryConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Animation constant
const FADE_IN_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Demo announcements data
const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'New Commission Structure Effective February 1st',
    content: 'We\'re excited to announce our enhanced commission structure! Starting February 1st, all agents will benefit from increased base commissions and new bonus tiers. Check your dashboard for personalized projections based on your current performance.',
    category: 'important',
    date: 'Jan 24, 2026',
    time: '10:30 AM',
    isPinned: true,
    isRead: false,
    author: 'Management Team',
  },
  {
    id: '2',
    title: 'January Sales Contest Winners',
    content: 'Congratulations to our January sales contest winners! First place: Marcus Johnson with 47 policies. Second place: Sarah Williams with 43 policies. Third place: David Chen with 38 policies. Prizes will be distributed by end of week.',
    category: 'celebration',
    date: 'Jan 23, 2026',
    time: '4:00 PM',
    isPinned: true,
    isRead: true,
    author: 'Sales Leadership',
  },
  {
    id: '3',
    title: 'New Training Module: Advanced Objection Handling',
    content: 'A new training module is now available in your Training section. "Advanced Objection Handling" covers techniques for overcoming the most common client objections. Complete it to earn 200 XP!',
    category: 'training',
    date: 'Jan 22, 2026',
    time: '9:00 AM',
    isPinned: false,
    isRead: true,
    author: 'Training Department',
  },
  {
    id: '4',
    title: 'System Maintenance: Saturday 2-4 AM EST',
    content: 'Scheduled system maintenance will occur this Saturday from 2:00 AM to 4:00 AM EST. The Agent Lounge and CRM features may be temporarily unavailable. Plan your weekend activities accordingly.',
    category: 'system',
    date: 'Jan 21, 2026',
    time: '2:00 PM',
    isPinned: false,
    isRead: true,
    author: 'IT Department',
  },
  {
    id: '5',
    title: 'February Product Launch: Enhanced IUL Options',
    content: 'Get ready for our February product launch! We\'re introducing three new IUL options with improved cap rates and lower floors. Training sessions will be held next week - sign up in the Training section.',
    category: 'product',
    date: 'Jan 20, 2026',
    time: '11:00 AM',
    isPinned: false,
    isRead: false,
    author: 'Product Team',
  },
  {
    id: '6',
    title: 'Valentine\'s Day Promotion: Double XP Weekend',
    content: 'Love is in the air! This Valentine\'s Day weekend (Feb 14-16), earn DOUBLE XP on all activities. Perfect time to climb the leaderboard and unlock new achievements!',
    category: 'promotion',
    date: 'Jan 19, 2026',
    time: '3:30 PM',
    isPinned: false,
    isRead: true,
    author: 'Engagement Team',
  },
];

const CATEGORY_CONFIG: Record<AnnouncementCategory, CategoryConfig> = {
  important: { label: 'Important', icon: AlertTriangle, color: 'bg-red-500/10 text-red-600 border-red-200' },
  celebration: { label: 'Celebration', icon: Star, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  training: { label: 'Training', icon: Info, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  system: { label: 'System', icon: Bell, color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
  product: { label: 'Product', icon: Gift, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  promotion: { label: 'Promotion', icon: Megaphone, color: 'bg-primary/10 text-primary border-primary/20' },
};

const STORAGE_KEY = 'announcements-read-status';

export default function AgentAnnouncements() {
  const [filter, setFilter] = useState<string>('all');
  const [readStatus, setReadStatus] = useState<Set<string>>(() => {
    // Initialize from localStorage or use defaults from demo data
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return new Set<string>(JSON.parse(saved));
    }
    return new Set(DEMO_ANNOUNCEMENTS.filter(a => a.isRead).map(a => a.id));
  });

  // Persist read status to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(readStatus)));
  }, [readStatus]);

  const markAsRead = useCallback((id: string) => {
    setReadStatus(prev => {
      const newSet = new Set<string>(Array.from(prev));
      newSet.add(id);
      return newSet;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadStatus(new Set<string>(DEMO_ANNOUNCEMENTS.map(a => a.id)));
  }, []);

  const filteredAnnouncements = useMemo(() =>
    DEMO_ANNOUNCEMENTS.filter(announcement => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !readStatus.has(announcement.id);
      if (filter === 'pinned') return announcement.isPinned;
      return announcement.category === filter;
    }),
    [filter, readStatus]
  );

  // Pagination
  const pagination = usePagination(filteredAnnouncements, 5);

  const unreadCount = useMemo(() =>
    DEMO_ANNOUNCEMENTS.filter(a => !readStatus.has(a.id)).length,
    [readStatus]
  );

  const pinnedCount = useMemo(() =>
    DEMO_ANNOUNCEMENTS.filter(a => a.isPinned).length,
    []
  );

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={FADE_IN_UP} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Announcements</h1>
            <p className="text-sm text-gray-600">Stay updated with the latest news and updates</p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              aria-label={`Mark all ${unreadCount} announcements as read`}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
              Mark all as read
            </Button>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div variants={FADE_IN_UP} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Total', value: DEMO_ANNOUNCEMENTS.length, icon: Megaphone, color: 'text-primary' },
            { label: 'Unread', value: unreadCount, icon: Bell, color: 'text-red-600' },
            { label: 'Pinned', value: pinnedCount, icon: Pin, color: 'text-yellow-600' },
          ].map((stat) => (
            <Card key={stat.label} className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={FADE_IN_UP} className="flex flex-wrap gap-2" role="group" aria-label="Filter announcements">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'pinned', label: 'Pinned' },
            { key: 'important', label: 'Important' },
            { key: 'celebration', label: 'Celebrations' },
            { key: 'training', label: 'Training' },
          ].map((option) => (
            <Button
              key={option.key}
              variant={filter === option.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.key)}
              className={filter === option.key ? 'bg-primary' : ''}
              aria-pressed={filter === option.key}
            >
              {option.label}
            </Button>
          ))}
        </motion.div>

        {/* Announcements List */}
        <motion.div variants={FADE_IN_UP} className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <Card className="border-gray-100">
              <CardContent className="p-0">
                <EmptyState
                  icon={Megaphone}
                  title="No announcements"
                  description="Check back later for updates"
                  variant="card"
                />
              </CardContent>
            </Card>
          ) : (
            pagination.paginatedItems.map((announcement) => {
              const category = CATEGORY_CONFIG[announcement.category as keyof typeof CATEGORY_CONFIG];
              const CategoryIcon = category.icon;
              const isUnread = !readStatus.has(announcement.id);

              return (
                <Card
                  key={announcement.id}
                  className={cn(
                    "border-gray-100 transition-all cursor-pointer hover:shadow-md",
                    isUnread && "border-l-4 border-l-primary bg-primary/5",
                    announcement.isPinned && "ring-1 ring-yellow-300"
                  )}
                  onClick={() => markAsRead(announcement.id)}
                  role="article"
                  aria-label={`${isUnread ? 'Unread: ' : ''}${announcement.isPinned ? 'Pinned: ' : ''}${announcement.title}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        category.color
                      )}>
                        <CategoryIcon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {announcement.isPinned && (
                            <Pin className="w-3 h-3 text-yellow-500" aria-hidden="true" />
                          )}
                          <h3 className={cn(
                            "font-semibold text-primary",
                            isUnread && "font-bold"
                          )}>
                            {announcement.title}
                          </h3>
                          <Badge className={cn("text-[10px]", category.color)}>
                            {category.label}
                          </Badge>
                          {isUnread && (
                            <Badge className="text-[10px] bg-primary text-white">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" aria-hidden="true" />
                            <time>{announcement.date}</time>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <time>{announcement.time}</time>
                          </span>
                          <span>By {announcement.author}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="flex-shrink-0" aria-label={`View details for ${announcement.title}`}>
                        <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}

          {/* Pagination */}
          {pagination.totalItems > pagination.itemsPerPage && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.goToPage}
                itemsPerPage={pagination.itemsPerPage}
                onItemsPerPageChange={pagination.changeItemsPerPage}
                totalItems={pagination.totalItems}
                itemsPerPageOptions={[5, 10, 20]}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
