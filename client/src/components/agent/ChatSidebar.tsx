import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import {
  useAvatarCouncilStore,
  useChatThreadActions,
  type ChatThread,
  type Avatar,
} from "@/lib/avatarCouncilStore";

// =============================================================================
// Types
// =============================================================================

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  avatars: Avatar[];
  selectedAvatarIds: string[];
  onNewChat: () => void;
}

// =============================================================================
// Thread Item Component
// =============================================================================

interface ThreadItemProps {
  thread: ChatThread;
  isActive: boolean;
  avatars: Avatar[];
  onSelect: () => void;
  onDelete: () => void;
}

function ThreadItem({ thread, isActive, avatars, onSelect, onDelete }: ThreadItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Get avatar images for this thread
  const threadAvatars = thread.avatarIds
    .map(id => avatars.find(a => a.id === id))
    .filter(Boolean) as Avatar[];

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "group relative px-3 py-3 rounded-xl cursor-pointer transition-all",
        isActive
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted/50 border border-transparent"
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar stack */}
        <div className="flex -space-x-2 flex-shrink-0">
          {threadAvatars.slice(0, 2).map((avatar, i) => (
            <div
              key={avatar.id}
              className={cn(
                "w-8 h-8 rounded-lg overflow-hidden border-2 border-background",
                i === 1 && "relative z-0"
              )}
            >
              {avatar.avatarImageUrl ? (
                <img
                  src={avatar.avatarImageUrl}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-bold">
                  {avatar.name.charAt(0)}
                </div>
              )}
            </div>
          ))}
          {threadAvatars.length > 2 && (
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
              +{threadAvatars.length - 2}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={cn(
              "text-sm font-medium truncate",
              isActive ? "text-foreground" : "text-foreground/80"
            )}>
              {thread.title}
            </h4>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {formatDate(thread.updatedAt)}
            </span>
          </div>
          {thread.preview && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {thread.preview}
            </p>
          )}
          <div className="flex items-center gap-1 mt-1">
            <MessageSquare className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {thread.messages.length} messages
            </span>
          </div>
        </div>
      </div>

      {/* Delete button */}
      <AnimatePresence>
        {showMenu && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// Main Sidebar Component
// =============================================================================

export function ChatSidebar({
  isOpen,
  onToggle,
  avatars,
  selectedAvatarIds,
  onNewChat,
}: ChatSidebarProps) {
  const {
    chatThreads,
    currentThreadId,
    switchThread,
    deleteThread,
  } = useChatThreadActions();

  // Group threads by date
  const groupedThreads = chatThreads.reduce((acc, thread) => {
    const date = new Date(thread.updatedAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    let group: string;
    if (diffDays === 0) {
      group = 'Today';
    } else if (diffDays === 1) {
      group = 'Yesterday';
    } else if (diffDays < 7) {
      group = 'This Week';
    } else if (diffDays < 30) {
      group = 'This Month';
    } else {
      group = 'Older';
    }

    if (!acc[group]) acc[group] = [];
    acc[group].push(thread);
    return acc;
  }, {} as Record<string, ChatThread[]>);

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

  return (
    <>
      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-r border-border bg-card/50 overflow-hidden"
          >
            <div className="w-[280px] h-full flex flex-col">
              {/* Header */}
              <div className="flex-shrink-0 p-4 border-b border-border">
                <button
                  onClick={onNewChat}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 transition-colors",
                    "font-medium text-sm"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </button>
              </div>

              {/* Thread List */}
              <div className="flex-1 overflow-auto p-3 space-y-4">
                {chatThreads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                      <MessageSquare className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start a new chat to begin
                    </p>
                  </div>
                ) : (
                  groupOrder.map(group => {
                    const threads = groupedThreads[group];
                    if (!threads || threads.length === 0) return null;

                    return (
                      <div key={group}>
                        <div className="flex items-center gap-2 px-2 mb-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {group}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {threads.map(thread => (
                            <ThreadItem
                              key={thread.id}
                              thread={thread}
                              isActive={thread.id === currentThreadId}
                              avatars={avatars}
                              onSelect={() => switchThread(thread.id)}
                              onDelete={() => deleteThread(thread.id)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-20",
          "w-6 h-12 flex items-center justify-center",
          "bg-card border border-border rounded-r-lg",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          "transition-all",
          isOpen && "left-[280px]"
        )}
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </>
  );
}

export default ChatSidebar;
