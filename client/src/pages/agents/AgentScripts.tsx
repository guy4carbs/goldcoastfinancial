import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Copy,
  Star,
  StarOff,
  Phone,
  Mail,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/agent/primitives";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface Script {
  id: string;
  title: string;
  category: ScriptCategory;
  description: string;
  content: string;
  isFavorite: boolean;
  usageCount: number;
  successRate: number;
  lastUsed: string;
}

type ScriptCategory = 'phone' | 'email' | 'sms';

const categoryConfig: Record<ScriptCategory, { label: string; icon: typeof Phone; color: string }> = {
  phone: { label: 'Phone', icon: Phone, color: 'bg-green-500/10 text-green-600' },
  email: { label: 'Email', icon: Mail, color: 'bg-blue-500/10 text-blue-600' },
  sms: { label: 'SMS', icon: MessageSquare, color: 'bg-purple-500/10 text-purple-600' },
};

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
];

// Demo scripts data - replace with API data when available
const DEMO_SCRIPTS: Script[] = [
  {
    id: '1',
    title: 'Initial Call Introduction',
    category: 'phone',
    description: 'Opening script for first contact with new leads',
    content: 'Hi [Name], this is [Your Name] from Heritage Life Solutions. I\'m reaching out because you recently expressed interest in protecting your family\'s financial future...',
    isFavorite: true,
    usageCount: 156,
    successRate: 78,
    lastUsed: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '2',
    title: 'Term Life Explanation',
    category: 'phone',
    description: 'Explaining term life benefits and options',
    content: 'Term life insurance provides coverage for a specific period, usually 10, 20, or 30 years. It\'s the most affordable way to get substantial coverage...',
    isFavorite: true,
    usageCount: 89,
    successRate: 82,
    lastUsed: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Follow-up Email Template',
    category: 'email',
    description: 'Email template for following up after initial call',
    content: 'Subject: Great speaking with you, [Name]!\n\nHi [Name],\n\nThank you for taking the time to speak with me today about your life insurance needs...',
    isFavorite: false,
    usageCount: 67,
    successRate: 45,
    lastUsed: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: '4',
    title: 'Objection Handler - Price',
    category: 'phone',
    description: 'Handling price objections effectively',
    content: 'I completely understand that budget is important. Let me ask you this - if something happened to you tomorrow, how would your family handle the mortgage, bills, and daily expenses?',
    isFavorite: true,
    usageCount: 203,
    successRate: 71,
    lastUsed: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: '5',
    title: 'SMS Check-in Message',
    category: 'sms',
    description: 'Quick text message to check in with prospects',
    content: 'Hi [Name]! Just wanted to follow up on our conversation about life insurance. Do you have any questions I can help answer? - [Your Name], Heritage Life',
    isFavorite: false,
    usageCount: 45,
    successRate: 62,
    lastUsed: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: '6',
    title: 'Closing Script',
    category: 'phone',
    description: 'Final closing script to seal the deal',
    content: 'Based on everything we\'ve discussed, I recommend the [Product] plan with [Coverage] coverage. This gives your family the protection they need at a premium that fits your budget...',
    isFavorite: true,
    usageCount: 124,
    successRate: 89,
    lastUsed: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
];

function formatRelativeLastUsed(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AgentScripts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(DEMO_SCRIPTS.filter(s => s.isFavorite).map(s => s.id))
  );
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleCopy = useCallback((content: string, title: string) => {
    navigator.clipboard.writeText(content);
    toast.success(`"${title}" copied to clipboard`);
  }, []);

  const filteredScripts = useMemo(() => DEMO_SCRIPTS.filter(script => {
    const matchesSearch = script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         script.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         script.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || script.category === filterCategory;
    return matchesSearch && matchesCategory;
  }), [searchQuery, filterCategory]);

  const stats = useMemo(() => ({
    total: filteredScripts.length,
    favorites: filteredScripts.filter(s => favorites.has(s.id)).length,
    avgSuccess: filteredScripts.length > 0
      ? Math.round(filteredScripts.reduce((acc, s) => acc + s.successRate, 0) / filteredScripts.length)
      : 0,
  }), [filteredScripts, favorites]);

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Sales Scripts</h1>
            <p className="text-sm text-gray-600">Proven scripts to help you close more deals</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Scripts', value: stats.total, icon: BookOpen, color: 'text-primary' },
            { label: 'Favorites', value: stats.favorites, icon: Star, color: 'text-yellow-500' },
            { label: 'Avg Success', value: `${stats.avgSuccess}%`, icon: TrendingUp, color: 'text-green-600' },
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
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <Input
              placeholder="Search scripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search scripts by title, description, or content"
            />
          </div>
          <div className="flex gap-2" role="group" aria-label="Filter scripts by category">
            {FILTER_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={filterCategory === opt.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory(opt.value)}
                className={filterCategory === opt.value ? 'bg-primary' : ''}
                aria-pressed={filterCategory === opt.value}
                aria-label={`Filter by ${opt.label}`}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Scripts List */}
        <motion.div variants={fadeInUp} className="space-y-4">
          {filteredScripts.length === 0 ? (
            <Card className="border-gray-100">
              <CardContent className="p-0">
                {searchQuery || filterCategory !== 'all' ? (
                  <div className="text-center py-12">
                    <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600 font-medium">No scripts match your filters</p>
                    <p className="text-sm text-gray-400 mt-1">Try a different search term or category</p>
                    <Button
                      variant="link"
                      className="mt-2 text-violet-600"
                      onClick={() => { setSearchQuery(''); setFilterCategory('all'); }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="No scripts found"
                    description="Scripts will appear here as they are added"
                    variant="card"
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            filteredScripts.map((script) => {
              const category = categoryConfig[script.category];
              const CategoryIcon = category.icon;
              const isFav = favorites.has(script.id);
              return (
                <Card
                  key={script.id}
                  className="border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedScript(script)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", category.color)}>
                        <CategoryIcon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-primary">{script.title}</h3>
                          <Badge className={cn("text-[10px]", category.color)}>
                            {category.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{script.description}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 bg-gray-50 p-2 rounded">
                          {script.content}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" aria-hidden="true" />
                            {script.successRate}% success
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            {script.usageCount} uses
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {formatRelativeLastUsed(script.lastUsed)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(script.id);
                          }}
                          aria-label={isFav ? `Remove ${script.title} from favorites` : `Add ${script.title} to favorites`}
                        >
                          {isFav ? (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(script.content, script.title);
                          }}
                          aria-label={`Copy ${script.title} to clipboard`}
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </motion.div>
      </motion.div>

      {/* Script Detail Modal */}
      <Dialog open={!!selectedScript} onOpenChange={(open) => !open && setSelectedScript(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedScript && (() => {
            const cat = categoryConfig[selectedScript.category];
            const CatIcon = cat.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", cat.color)}>
                      <CatIcon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    {selectedScript.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center gap-3">
                    <Badge className={cn("text-xs", cat.color)}>{cat.label}</Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" aria-hidden="true" />
                      {selectedScript.successRate}% success
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                      {selectedScript.usageCount} uses
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedScript.description}</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedScript.content}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => {
                        handleCopy(selectedScript.content, selectedScript.title);
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" aria-hidden="true" />
                      Copy Script
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        toggleFavorite(selectedScript.id);
                      }}
                      aria-label={favorites.has(selectedScript.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.has(selectedScript.id) ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <StarOff className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AgentLoungeLayout>
  );
}
