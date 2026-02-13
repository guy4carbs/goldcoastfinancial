/**
 * AI Concierge for the CRM Lobby
 * A luxury hotel-style AI assistant that provides personalized guidance
 */

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  User,
  ArrowRight,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Bot,
  Zap,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Shield,
  Briefcase,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface Message {
  id: string;
  role: 'user' | 'concierge';
  content: string;
  timestamp: Date;
  suggestions?: QuickAction[];
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
}

// =============================================================================
// ROLE-BASED SUGGESTIONS
// =============================================================================

const ROLE_GREETINGS: Record<string, string> = {
  owner: "Welcome back! Ready to review your empire's performance?",
  system_admin: "Good to see you! Need help configuring anything?",
  manager: "Welcome! Your team's metrics are looking strong today.",
  sales_agent: "Hey there! Ready to close some deals today?",
  investor: "Welcome! Let me show you the latest growth metrics.",
  marketing_staff: "Hello! Your campaigns are generating great engagement.",
  default: "Welcome to Heritage Insurance! How can I assist you today?",
};

const ROLE_SUGGESTIONS: Record<string, QuickAction[]> = {
  owner: [
    { id: '1', label: 'View Executive Dashboard', description: 'Strategic overview', href: '/executive/dashboard', icon: BarChart3, color: 'text-indigo-600 bg-indigo-100' },
    { id: '2', label: 'Check Revenue', description: 'Financial performance', href: '/finance/dashboard', icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
    { id: '3', label: 'Team Performance', description: 'Manager insights', href: '/manager/dashboard', icon: Users, color: 'text-blue-600 bg-blue-100' },
  ],
  system_admin: [
    { id: '1', label: 'Admin Settings', description: 'System configuration', href: '/admin', icon: Shield, color: 'text-slate-600 bg-slate-100' },
    { id: '2', label: 'AI Agents', description: 'Manage automation', href: '/ai/dashboard', icon: Bot, color: 'text-cyan-600 bg-cyan-100' },
    { id: '3', label: 'Import Data', description: 'Bulk import leads', href: '/crm/import', icon: Zap, color: 'text-amber-600 bg-amber-100' },
  ],
  manager: [
    { id: '1', label: 'Team Dashboard', description: 'Monitor performance', href: '/manager/dashboard', icon: Briefcase, color: 'text-blue-600 bg-blue-100' },
    { id: '2', label: 'Pipeline Overview', description: 'Active opportunities', href: '/agents/dashboard', icon: TrendingUp, color: 'text-violet-600 bg-violet-100' },
    { id: '3', label: 'Support Tickets', description: 'Client assistance', href: '/support/dashboard', icon: Phone, color: 'text-amber-600 bg-amber-100' },
  ],
  sales_agent: [
    { id: '1', label: 'My Leads', description: 'View active prospects', href: '/agents/dashboard', icon: Users, color: 'text-violet-600 bg-violet-100' },
    { id: '2', label: 'Commission Status', description: 'Track your earnings', href: '/finance/dashboard', icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
    { id: '3', label: 'Schedule Calls', description: 'Upcoming appointments', href: '/agents/calendar', icon: Calendar, color: 'text-blue-600 bg-blue-100' },
  ],
  investor: [
    { id: '1', label: 'Growth Metrics', description: 'Company performance', href: '/executive/dashboard', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-100' },
    { id: '2', label: 'Financial Reports', description: 'Revenue & projections', href: '/finance/dashboard', icon: BarChart3, color: 'text-emerald-600 bg-emerald-100' },
  ],
  marketing_staff: [
    { id: '1', label: 'Campaigns', description: 'Marketing dashboard', href: '/marketing/dashboard', icon: Mail, color: 'text-rose-600 bg-rose-100' },
    { id: '2', label: 'Lead Sources', description: 'Acquisition channels', href: '/agents/dashboard', icon: Users, color: 'text-violet-600 bg-violet-100' },
  ],
  default: [
    { id: '1', label: 'Get Started', description: 'Explore the platform', href: '/agents/dashboard', icon: Zap, color: 'text-amber-600 bg-amber-100' },
  ],
};

// =============================================================================
// CONCIERGE RESPONSES
// =============================================================================

const CONCIERGE_RESPONSES: Record<string, { response: string; suggestions?: QuickAction[] }> = {
  'help': {
    response: "I'd be happy to help! Here are some things I can assist you with:\n\n• Navigate to any lounge or dashboard\n• Explain features and metrics\n• Guide you through common workflows\n• Provide quick access to key actions\n\nWhat would you like to know more about?",
  },
  'leads': {
    response: "Your leads are managed in the **Agent Lounge**. There you can:\n\n• View and filter your active leads\n• Track lead stages in the pipeline\n• See contact history and notes\n• Score and prioritize opportunities\n\nWould you like me to take you there?",
    suggestions: [
      { id: 'leads-1', label: 'Go to Agent Lounge', description: 'Manage your leads', href: '/agents/dashboard', icon: Users, color: 'text-violet-600 bg-violet-100' },
    ],
  },
  'commission': {
    response: "Your commission information is in the **Finance Lounge**. You can track:\n\n• Current month earnings\n• Pending commissions\n• Historical payouts\n• Commission breakdowns by policy\n\nLet me show you the way.",
    suggestions: [
      { id: 'comm-1', label: 'View Commissions', description: 'Track your earnings', href: '/finance/dashboard', icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
    ],
  },
  'report': {
    response: "Reports and analytics are available in the **Executive Lounge**. You'll find:\n\n• Performance dashboards\n• Sales metrics and trends\n• Team productivity reports\n• Revenue forecasts\n\nShall I navigate you there?",
    suggestions: [
      { id: 'report-1', label: 'View Reports', description: 'Analytics dashboard', href: '/executive/dashboard', icon: BarChart3, color: 'text-indigo-600 bg-indigo-100' },
    ],
  },
  'import': {
    response: "You can import leads and data through the **Import Center**. It supports:\n\n• CSV and Excel files\n• Column mapping\n• Duplicate detection\n• Validation checks\n\nReady to import some data?",
    suggestions: [
      { id: 'import-1', label: 'Import Data', description: 'Upload leads & contacts', href: '/crm/import', icon: Zap, color: 'text-amber-600 bg-amber-100' },
    ],
  },
  'default': {
    response: "I'm here to help you navigate Heritage Insurance. You can ask me about:\n\n• Finding specific features\n• Understanding your metrics\n• Getting to the right lounge\n• Any questions about the platform\n\nWhat would you like to explore?",
  },
};

function getResponse(input: string): { response: string; suggestions?: QuickAction[] } {
  const lower = input.toLowerCase();

  if (lower.includes('help') || lower.includes('assist') || lower.includes('what can you')) {
    return CONCIERGE_RESPONSES['help'];
  }
  if (lower.includes('lead') || lower.includes('prospect') || lower.includes('pipeline')) {
    return CONCIERGE_RESPONSES['leads'];
  }
  if (lower.includes('commission') || lower.includes('earning') || lower.includes('money') || lower.includes('pay')) {
    return CONCIERGE_RESPONSES['commission'];
  }
  if (lower.includes('report') || lower.includes('analytics') || lower.includes('metric') || lower.includes('dashboard')) {
    return CONCIERGE_RESPONSES['report'];
  }
  if (lower.includes('import') || lower.includes('upload') || lower.includes('csv') || lower.includes('excel')) {
    return CONCIERGE_RESPONSES['import'];
  }

  return CONCIERGE_RESPONSES['default'];
}

// =============================================================================
// COMPONENTS
// =============================================================================

function QuickActionCard({ action }: { action: QuickAction }) {
  const Icon = action.icon;

  return (
    <Link href={action.href}>
      <motion.div
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-white/80 hover:bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer"
      >
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', action.color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{action.label}</p>
          <p className="text-xs text-gray-500">{action.description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </motion.div>
    </Link>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3 mb-4', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-gradient-to-br from-indigo-500 to-violet-600' : 'bg-gradient-to-br from-amber-400 to-orange-500'
      )}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
      </div>

      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3',
        isUser
          ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm'
          : 'bg-white border border-gray-100 shadow-sm rounded-tl-sm'
      )}>
        <p className={cn(
          'text-sm whitespace-pre-wrap',
          isUser ? 'text-white' : 'text-gray-700'
        )}>
          {message.content}
        </p>

        {/* Inline Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.suggestions.map((action) => (
              <QuickActionCard key={action.id} action={action} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function LobbyConcierge() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userRole = user?.role || 'default';
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Guest';
  const greeting = ROLE_GREETINGS[userRole] || ROLE_GREETINGS.default;
  const suggestions = ROLE_SUGGESTIONS[userRole] || ROLE_SUGGESTIONS.default;

  // Initialize with welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'concierge',
        content: `Hello, ${userName}! ${greeting}\n\nI'm your personal concierge. How can I assist you today?`,
        timestamp: new Date(),
        suggestions,
      }]);
    }
  }, [isOpen, messages.length, userName, greeting, suggestions]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

    const { response, suggestions: respSuggestions } = getResponse(userMessage.content);

    const conciergeMessage: Message = {
      id: `concierge-${Date.now()}`,
      role: 'concierge',
      content: response,
      timestamp: new Date(),
      suggestions: respSuggestions,
    };

    setMessages((prev) => [...prev, conciergeMessage]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center group"
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />

            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 animate-ping opacity-30" />

            {/* Tooltip */}
            <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              AI Concierge
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] bg-gradient-to-b from-slate-50 to-white rounded-3xl shadow-2xl shadow-black/10 border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Concierge</h3>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online & ready to help
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Time-based greeting badge */}
              <div className="mt-3 flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                  <Clock className="w-3 h-3 mr-1" />
                  {timeGreeting}, {userName}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  disabled={isTyping}
                  className="min-h-[44px] max-h-[120px] resize-none rounded-xl border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                  rows={1}
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="h-11 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-orange-500/20"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Quick prompts */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {['Show my leads', 'Check commissions', 'View reports'].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInputValue(prompt)}
                    className="px-3 py-1.5 text-xs rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default LobbyConcierge;
