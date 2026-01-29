import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentStore } from "@/lib/agentStore";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  Hash,
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Smile,
  Paperclip,
  Phone,
  Video,
  Circle,
  CheckCheck,
  BookOpen,
  Star,
  Trophy,
  Menu,
  X,
  Reply,
  AtSign,
  File,
  ImageIcon,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Import Social Learning Components
import {
  DiscussionThread
} from "@/components/training";

// Constants extracted outside component
const QUICK_EMOJIS: readonly string[] = ['😀', '😂', '❤️', '👍', '👏', '🎉', '🔥', '💪', '🙏', '✨'] as const;
const REACTION_EMOJIS: readonly string[] = ['👍', '❤️', '🎉', '🔥'] as const;
const MENTION_REGEX = /@(\w+\s?\w*)/g;

interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'direct';
  unread: number;
  online?: number;
  lastMessage?: string;
  avatar?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  url?: string;
}

interface Message {
  id: string;
  sender: string;
  senderInitials: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  reactions?: { emoji: string; count: number }[];
  replyTo?: { id: string; sender: string; content: string };
  attachments?: Attachment[];
  mentions?: string[];
}

const CHANNELS: Channel[] = [
  { id: 'general', name: 'general', type: 'channel', unread: 0, online: 12 },
  { id: 'sales-tips', name: 'sales-tips', type: 'channel', unread: 3, online: 8 },
  { id: 'training', name: 'training', type: 'channel', unread: 0, online: 5 },
  { id: 'announcements', name: 'announcements', type: 'channel', unread: 1, online: 15 },
];

const DIRECT_MESSAGES: Channel[] = [
  { id: 'dm-1', name: 'Jack Cook', type: 'direct', unread: 0, lastMessage: 'Great job this week!' },
  { id: 'dm-2', name: 'Sarah Mitchell', type: 'direct', unread: 2, lastMessage: 'Did you see the new IUL rates?' },
  { id: 'dm-3', name: 'Marcus Chen', type: 'direct', unread: 0, lastMessage: 'Thanks for the tip!' },
];

const AVAILABLE_USERS: readonly string[] = ['Jack Cook', 'Sarah Mitchell', 'Marcus Chen', 'Emily Davis', 'James Wilson', 'Lisa Anderson'] as const;

// Study Groups data
const STUDY_GROUPS_DATA = [
  {
    id: 'sg1',
    name: 'January 2026 Cohort',
    description: 'Study group for new agents starting in January',
    members: [
      { id: '1', name: 'Sarah Johnson' },
      { id: '2', name: 'Mike Chen' },
      { id: '3', name: 'Emily Davis' }
    ],
    maxMembers: 10,
    topic: 'Pre-Access Certification',
    nextSession: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    isJoined: true
  },
  {
    id: 'sg2',
    name: 'IUL Masters',
    description: 'Deep dive into Indexed Universal Life products',
    members: [
      { id: '4', name: 'James Wilson' },
      { id: '5', name: 'Lisa Anderson' }
    ],
    maxMembers: 8,
    topic: 'Product Knowledge',
    nextSession: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    isJoined: false
  },
  {
    id: 'sg3',
    name: 'Compliance Champions',
    description: 'Master compliance requirements together',
    members: [
      { id: '6', name: 'Robert Brown' },
      { id: '7', name: 'Maria Garcia' },
      { id: '8', name: 'David Lee' },
      { id: '9', name: 'Jennifer Martinez' }
    ],
    maxMembers: 6,
    topic: 'Advanced Compliance',
    isJoined: false
  }
];

// Training Discussion data (for #training channel)
const TRAINING_DISCUSSIONS = [
  {
    id: 'c1',
    author: { name: 'Sarah Johnson', role: 'Senior Agent' },
    content: 'The section on suitability analysis was really helpful. Make sure to take notes on the documentation requirements!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: 'c1r1',
        author: { name: 'Mike Chen' },
        content: 'Agreed! I also found the checklist at the end very useful.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: 2,
        isLiked: true
      }
    ]
  },
  {
    id: 'c2',
    author: { name: 'Emily Davis' },
    content: 'Can someone explain the difference between the different annuity crediting methods? I got a bit confused.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    likes: 3,
    isLiked: false
  },
  {
    id: 'c3',
    author: { name: 'James Wilson', role: 'Product Specialist' },
    content: 'Great question Emily! There are 3 main types: Fixed, Point-to-Point, and Monthly Average. Fixed gives a set rate, Point-to-Point measures index growth between two dates, and Monthly Average uses... well, the monthly average. Each has pros/cons depending on market conditions.',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
    likes: 8,
    isLiked: true
  }
];

// Peer Recognition data
const RECENT_RECOGNITIONS = [
  {
    id: 'r1',
    from: { name: 'Jack Cook', role: 'Team Lead' },
    to: { name: 'Sarah Mitchell' },
    badge: 'Top Closer',
    message: 'Incredible Q4 performance! 3 policies in one week!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 12
  },
  {
    id: 'r2',
    from: { name: 'Marcus Chen' },
    to: { name: 'Emily Davis' },
    badge: 'Helpful Hero',
    message: 'Thanks for helping me understand the annuity products!',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    likes: 8
  },
  {
    id: 'r3',
    from: { name: 'Sarah Mitchell' },
    to: { name: 'James Wilson' },
    badge: 'Rising Star',
    message: 'Amazing progress on your certifications this month!',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    likes: 15
  }
];

const DEMO_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Jack Cook',
    senderInitials: 'JC',
    content: 'Great job everyone on hitting our Q4 goals! Let\'s keep the momentum going into Q1! ',
    timestamp: '10:30 AM',
    isOwn: false,
    reactions: [{ emoji: '🎉', count: 5 }, { emoji: '💪', count: 3 }]
  },
  {
    id: '2',
    sender: 'Sarah Mitchell',
    senderInitials: 'SM',
    content: 'Just closed a $750K whole life! 🏆 Client was initially hesitant but the comparison approach really worked.',
    timestamp: '10:45 AM',
    isOwn: false,
    reactions: [{ emoji: '👏', count: 8 }, { emoji: '🎉', count: 4 }]
  },
  {
    id: '3',
    sender: 'Marcus Chen',
    senderInitials: 'MC',
    content: '@Sarah congrats! What was the main objection you had to overcome?',
    timestamp: '11:00 AM',
    isOwn: false,
  },
  {
    id: '4',
    sender: 'Sarah Mitchell',
    senderInitials: 'SM',
    content: '"I need to think about it" - used the takeaway close from the training. Works every time! ',
    timestamp: '11:02 AM',
    isOwn: false,
    reactions: [{ emoji: '🔥', count: 3 }]
  },
  {
    id: '5',
    sender: 'You',
    senderInitials: 'AJ',
    content: 'That\'s awesome Sarah! I\'ve been practicing that technique too. Any tips for handling the "I already have coverage" objection?',
    timestamp: '11:15 AM',
    isOwn: true,
  },
  {
    id: '6',
    sender: 'Sarah Mitchell',
    senderInitials: 'SM',
    content: 'Great question! I always ask them to pull up their policy and do a quick coverage gap analysis. Usually they\'re underinsured by 50% or more. The training module on that is really helpful.',
    timestamp: '11:18 AM',
    isOwn: false,
    reactions: [{ emoji: '👍', count: 2 }]
  },
];

export default function AgentChat() {
  const { currentUser } = useAgentStore();
  const agentName = currentUser?.name || 'Agent';
  const agentInitials = currentUser?.name?.split(' ').map(n => n[0]).join('') || 'AG';

  const [selectedChannel, setSelectedChannel] = useState<Channel>(CHANNELS[0]);
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'groups' | 'recognition'>('chat');
  const [studyGroups, setStudyGroups] = useState(STUDY_GROUPS_DATA);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

  // Filter messages based on search
  const filteredMessages = useMemo(() =>
    messageSearchQuery
      ? messages.filter(m => m.content.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
          m.sender.toLowerCase().includes(messageSearchQuery.toLowerCase()))
      : messages,
    [messages, messageSearchQuery]
  );

  // Detect @ mention in input
  useEffect(() => {
    const lastWord = newMessage.split(' ').pop() || '';
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  }, [newMessage]);

  // Parse mentions in message content for highlighting
  const parseMessageContent = useCallback((content: string) => {
    const parts = content.split(MENTION_REGEX);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <span key={i} className="bg-primary/10 text-primary px-1 rounded font-medium">@{part}</span>;
      }
      return part;
    });
  }, []);

  // Handle mention selection
  const handleSelectMention = useCallback((userName: string) => {
    const words = newMessage.split(' ');
    words[words.length - 1] = `@${userName} `;
    setNewMessage(words.join(' '));
    setShowMentions(false);
  }, [newMessage]);

  // Get total unread count for notification badge
  const totalUnread = useMemo(() =>
    [...CHANNELS, ...DIRECT_MESSAGES].reduce((acc, ch) => acc + ch.unread, 0),
    []
  );

  // Handle phone call
  const handlePhoneCall = useCallback(() => {
    if (selectedChannel.type === 'direct') {
      toast.success(`Starting voice call with ${selectedChannel.name}...`);
    } else {
      toast.info('Voice calls are only available for direct messages');
    }
  }, [selectedChannel]);

  // Handle video call
  const handleVideoCall = useCallback(() => {
    if (selectedChannel.type === 'direct') {
      toast.success(`Starting video call with ${selectedChannel.name}...`);
    } else {
      toast.info('Video calls are only available for direct messages');
    }
  }, [selectedChannel]);

  // Handle file attachment
  const handleAttachment = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const attachment: Attachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        size: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`,
      };
      setPendingAttachments(prev => [...prev, attachment]);
      toast.success(`File "${file.name}" attached`);
    }
    e.target.value = ''; // Reset input
  }, []);

  const removePendingAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== attachmentId));
  }, []);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  }, []);

  // Handle create group
  const handleCreateGroup = useCallback(() => {
    toast.info('Create Study Group', {
      description: 'Study group creation coming soon! Contact your team lead to request a new group.',
    });
  }, []);

  // Handle give kudos
  const handleGiveKudos = useCallback(() => {
    toast.info('Give Kudos', {
      description: 'Kudos feature coming soon! Recognize your teammates for their achievements.',
    });
  }, []);

  // Handle joining/leaving study groups with persistence
  const handleJoinGroup = useCallback((groupId: string) => {
    setStudyGroups(prev => {
      const updated = prev.map(g =>
        g.id === groupId ? { ...g, isJoined: true } : g
      );
      // Persist to localStorage
      const joinedIds = updated.filter(g => g.isJoined).map(g => g.id);
      localStorage.setItem('chat-joined-groups', JSON.stringify(joinedIds));
      return updated;
    });
    toast.success('Joined study group!');
  }, []);

  const handleLeaveGroup = useCallback((groupId: string) => {
    setStudyGroups(prev => {
      const updated = prev.map(g =>
        g.id === groupId ? { ...g, isJoined: false } : g
      );
      const joinedIds = updated.filter(g => g.isJoined).map(g => g.id);
      localStorage.setItem('chat-joined-groups', JSON.stringify(joinedIds));
      return updated;
    });
    toast.info('Left study group');
  }, []);

  // Load persisted study group membership
  useEffect(() => {
    const savedJoinedIds = localStorage.getItem('chat-joined-groups');
    if (savedJoinedIds) {
      const joinedIds = JSON.parse(savedJoinedIds) as string[];
      setStudyGroups(prev => prev.map(g => ({
        ...g,
        isJoined: joinedIds.includes(g.id)
      })));
    }
  }, []);

  // Handle adding reaction to a message
  const handleAddReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;
      const existingReactions = msg.reactions || [];
      const existingReaction = existingReactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        return {
          ...msg,
          reactions: existingReactions.map(r =>
            r.emoji === emoji ? { ...r, count: r.count + 1 } : r
          )
        };
      } else {
        return {
          ...msg,
          reactions: [...existingReactions, { emoji, count: 1 }]
        };
      }
    }));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() && pendingAttachments.length === 0) return;

    // Extract mentions from message
    const mentions: string[] = [];
    let match;
    const regex = new RegExp(MENTION_REGEX.source, 'g');
    while ((match = regex.exec(newMessage)) !== null) {
      mentions.push(match[1]);
    }

    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      senderInitials: currentUser?.name?.split(' ').map(n => n[0]).join('') || 'AJ',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isOwn: true,
      replyTo: replyingTo ? { id: replyingTo.id, sender: replyingTo.sender, content: replyingTo.content } : undefined,
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
      mentions: mentions.length > 0 ? mentions : undefined,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setReplyingTo(null);
    setPendingAttachments([]);

    // Play notification sound for mentions (simulated)
    if (mentions.length > 0) {
      toast.info(`Mentioned: ${mentions.join(', ')}`);
    }
  }, [newMessage, pendingAttachments, currentUser, replyingTo]);

  const handleReply = useCallback((message: Message) => {
    setReplyingTo(message);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const ChannelList = ({ items, title }: { items: Channel[]; title: string }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        <Button variant="ghost" size="icon" className="h-5 w-5" aria-label={`Add ${title.toLowerCase()}`}>
          <Plus className="w-3 h-3" aria-hidden="true" />
        </Button>
      </div>
      {/* #101: Keyboard navigable channel list */}
      <div className="space-y-0.5" role="listbox" aria-label={`${items[0]?.type === 'channel' ? 'Channels' : 'Direct Messages'}`}>
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setSelectedChannel(item)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = e.currentTarget.nextElementSibling as HTMLElement;
                next?.focus();
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = e.currentTarget.previousElementSibling as HTMLElement;
                prev?.focus();
              }
            }}
            role="option"
            aria-selected={selectedChannel.id === item.id}
            aria-label={`${item.type === 'channel' ? 'Channel' : 'Direct message with'} ${item.name}${item.unread > 0 ? `, ${item.unread} unread messages` : ''}${item.online ? `, ${item.online} members online` : ''}`}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
              selectedChannel.id === item.id
                ? "bg-primary/10 text-primary"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {item.type === 'channel' ? (
              <Hash className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            ) : (
              <div className="relative">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-[10px] bg-primary/10">
                    {item.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {/* #103: Online indicator with screen reader text */}
                <Circle className="w-2 h-2 absolute -bottom-0.5 -right-0.5 fill-emerald-500 text-emerald-500" aria-hidden="true" />
                <span className="sr-only">Online</span>
              </div>
            )}
            <span className="flex-1 truncate text-sm font-medium">{item.name}</span>
            {item.unread > 0 && (
              <Badge className="bg-primary text-white text-[10px] h-5 px-1.5 min-w-[20px]" aria-label={`${item.unread} unread`}>
                {item.unread}
              </Badge>
            )}
            {item.type === 'channel' && item.online && (
              <span className="text-[10px] text-gray-400" aria-label={`${item.online} online`}>{item.online}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // Sidebar content component (reused for both desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* Sidebar Tabs */}
      <div className="p-2 border-b border-gray-100">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSidebarTab('chat')}
            aria-pressed={sidebarTab === 'chat'}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors",
              sidebarTab === 'chat'
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            Chat
          </button>
          <button
            onClick={() => setSidebarTab('groups')}
            aria-pressed={sidebarTab === 'groups'}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors",
              sidebarTab === 'groups'
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Groups
          </button>
          <button
            onClick={() => setSidebarTab('recognition')}
            aria-pressed={sidebarTab === 'recognition'}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors",
              sidebarTab === 'recognition'
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
            Kudos
          </button>
        </div>
      </div>

      {/* Search - only for chat tab */}
      {sidebarTab === 'chat' && (
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      )}

      {/* Sidebar Content */}
      <ScrollArea className="flex-1">
        {/* Chat Tab - Channels & DMs */}
        {sidebarTab === 'chat' && (
          <div className="p-2">
            <ChannelList items={CHANNELS} title="Channels" />
            <ChannelList items={DIRECT_MESSAGES} title="Direct Messages" />
          </div>
        )}

        {/* Study Groups Tab */}
        {sidebarTab === 'groups' && (
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Study Groups
              </h3>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleCreateGroup} aria-label="Create new study group">
                <Plus className="w-3 h-3 mr-1" aria-hidden="true" />
                Create
              </Button>
            </div>
            {studyGroups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-3 rounded-lg border transition-colors cursor-pointer",
                  group.isJoined
                    ? "border-primary/30 bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-sm text-gray-900">{group.name}</h4>
                  {group.isJoined && (
                    <Badge className="bg-primary/20 text-primary text-[10px] h-5">
                      Joined
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{group.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {group.members.length}/{group.maxMembers} members
                  </span>
                  {!group.isJoined ? (
                    <Button
                      size="sm"
                      className="h-6 text-xs bg-primary hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group.id);
                      }}
                    >
                      Join
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeaveGroup(group.id);
                      }}
                    >
                      Leave
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recognition Tab */}
        {sidebarTab === 'recognition' && (
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Peer Recognition
              </h3>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleGiveKudos} aria-label="Give kudos to a teammate">
                <Star className="w-3 h-3 mr-1" aria-hidden="true" />
                Give Kudos
              </Button>
            </div>
            {/* Recognition list placeholder */}
            <div className="text-center py-4 text-gray-500 text-xs">
              Give kudos to your teammates for their achievements!
            </div>
          </div>
        )}
      </ScrollArea>
    </>
  );

  return (
    <AgentLoungeLayout>
      <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex gap-0 -m-4 lg:-m-6">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
              {/* Sidebar */}
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 flex flex-col lg:hidden shadow-xl"
              >
                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-semibold text-primary">Chat</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setMobileSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        {/* #89: Responsive sidebar width - narrower on tablets */}
        <div className="hidden lg:flex lg:w-64 xl:w-72 flex-col bg-white border-r border-gray-200">
          <SidebarContent />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </Button>
              {selectedChannel.type === 'channel' ? (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
              ) : (
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedChannel.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h2 className="font-semibold text-primary">
                  {selectedChannel.type === 'channel' ? `#${selectedChannel.name}` : selectedChannel.name}
                </h2>
                {selectedChannel.type === 'channel' && selectedChannel.online && (
                  <p className="text-xs text-gray-500">
                    {/* #103: Online indicator accessible */}
                    <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-1" aria-hidden="true" />
                    {selectedChannel.online} online
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showMessageSearch ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setShowMessageSearch(!showMessageSearch)}
                aria-label={showMessageSearch ? "Close message search" : "Search messages"}
                aria-pressed={showMessageSearch}
              >
                <Search className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePhoneCall} aria-label="Start voice call">
                <Phone className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleVideoCall} aria-label="Start video call">
                <Video className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => toast.info('Channel members panel coming soon')} aria-label="View channel members">
                <Users className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => toast.info('More options coming soon')} aria-label="More options">
                <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <AnimatePresence>
            {showMessageSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-2 border-b overflow-hidden"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <Input
                    placeholder="Search messages..."
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                  {messageSearchQuery && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      {filteredMessages.length} results
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages or Discussion Thread */}
          <ScrollArea className="flex-1 p-4">
            {/* Show Discussion Thread for #training channel */}
            {selectedChannel.id === 'training' ? (
              <DiscussionThread
                moduleId="training-channel"
                moduleTitle="Training Discussion"
                comments={TRAINING_DISCUSSIONS}
                onPostComment={(content, parentId) => {
                  console.log('Post comment:', content, parentId);
                }}
                onLikeComment={(id) => {
                  console.log('Like comment:', id);
                }}
              />
            ) : (
            <div className="space-y-4">
              {filteredMessages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "group flex gap-3",
                    message.isOwn && "flex-row-reverse"
                  )}
                >
                  {!message.isOwn && (
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {message.senderInitials}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    "max-w-[70%]",
                    message.isOwn && "text-right"
                  )}>
                    {!message.isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {message.sender}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {message.timestamp}
                        </span>
                      </div>
                    )}

                    {/* Reply indicator */}
                    {message.replyTo && (
                      <div className={cn(
                        "flex items-center gap-1 mb-1 text-xs text-gray-500",
                        message.isOwn && "justify-end"
                      )}>
                        <Reply className="w-3 h-3" aria-hidden="true" />
                        <span>Replying to {message.replyTo.sender}</span>
                      </div>
                    )}

                    <div className={cn(
                      "rounded-2xl px-4 py-2.5 inline-block text-left",
                      message.isOwn
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                    )}>
                      {/* Show quoted reply */}
                      {message.replyTo && (
                        <div className={cn(
                          "text-xs mb-2 pb-2 border-b",
                          message.isOwn ? "border-white/20 text-white/70" : "border-gray-200 text-gray-500"
                        )}>
                          <p className="truncate max-w-[200px]">{message.replyTo.content}</p>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{parseMessageContent(message.content)}</p>

                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map(att => (
                            <div key={att.id} className={cn(
                              "flex items-center gap-2 p-2 rounded",
                              message.isOwn ? "bg-white/10" : "bg-gray-200"
                            )}>
                              {att.type === 'image' ? <ImageIcon className="w-4 h-4" aria-hidden="true" /> : <File className="w-4 h-4" aria-hidden="true" />}
                              <span className="text-xs">{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.isOwn && (
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-gray-400">{message.timestamp}</span>
                        <CheckCheck className="w-3 h-3 text-primary" aria-hidden="true" />
                      </div>
                    )}
                    {/* Reactions and Add Reaction */}
                    <div className={cn(
                      "flex gap-1 mt-1 flex-wrap items-center",
                      message.isOwn && "justify-end"
                    )}>
                      {message.reactions && message.reactions.map((reaction, ridx) => (
                        <button
                          key={ridx}
                          onClick={() => handleAddReaction(message.id, reaction.emoji)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors cursor-pointer"
                          title="Click to add this reaction"
                        >
                          {reaction.emoji} {reaction.count}
                        </button>
                      ))}
                      {/* Quick reaction and reply buttons */}
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleReply(message)}
                          className="p-1 hover:bg-gray-100 rounded text-xs transition-colors"
                          aria-label={`Reply to ${message.sender}`}
                        >
                          <Reply className="w-3 h-3" aria-hidden="true" />
                        </button>
                        {REACTION_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(message.id, emoji)}
                            className="p-1 hover:bg-gray-100 rounded text-xs transition-colors"
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            />

            {/* Emoji Picker Popup */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-20 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50"
                >
                  <div className="flex gap-2 flex-wrap max-w-[200px]">
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-xl hover:bg-gray-100 rounded p-1 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reply indicator */}
            {replyingTo && (
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg mb-2">
                <Reply className="w-4 h-4 text-primary" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary font-medium">Replying to {replyingTo.sender}</p>
                  <p className="text-xs text-gray-500 truncate">{replyingTo.content}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelReply} aria-label="Cancel reply">
                  <X className="w-3 h-3" aria-hidden="true" />
                </Button>
              </div>
            )}

            {/* Pending attachments */}
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {pendingAttachments.map(att => (
                  <div key={att.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                    {att.type === 'image' ? <ImageIcon className="w-4 h-4 text-gray-500" aria-hidden="true" /> : <File className="w-4 h-4 text-gray-500" aria-hidden="true" />}
                    <span className="text-xs text-gray-700">{att.name}</span>
                    <span className="text-xs text-gray-400">({att.size})</span>
                    <button onClick={() => removePendingAttachment(att.id)} className="hover:text-red-500">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Mentions dropdown */}
            <AnimatePresence>
              {showMentions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-20 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 max-h-40 overflow-y-auto"
                >
                  <p className="text-xs text-gray-500 px-2 mb-1">Mention someone</p>
                  {AVAILABLE_USERS.filter(u =>
                    u.toLowerCase().includes((newMessage.split(' ').pop() || '').slice(1).toLowerCase())
                  ).map(user => (
                    <button
                      key={user}
                      onClick={() => handleSelectMention(user)}
                      className="flex items-center gap-2 w-full px-2 py-1 hover:bg-primary/5 rounded text-sm"
                    >
                      <AtSign className="w-3 h-3 text-primary" aria-hidden="true" />
                      {user}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={handleAttachment} aria-label="Attach file">
                <Paperclip className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  placeholder={`Message ${selectedChannel.type === 'channel' ? '#' + selectedChannel.name : selectedChannel.name}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  aria-label={showEmojiPicker ? "Close emoji picker" : "Add emoji"}
                  aria-expanded={showEmojiPicker}
                >
                  <Smile className="w-5 h-5 text-gray-400" aria-hidden="true" />
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() && pendingAttachments.length === 0}
                className="bg-primary hover:bg-primary/90 flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AgentLoungeLayout>
  );
}
