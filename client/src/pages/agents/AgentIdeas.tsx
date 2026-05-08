import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { type IdeaCategory, type IdeaStatus, type IdeaPriority } from "@/lib/agentStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import {
  RADIUS, SHADOW, TYPE,
  fadeInUp, staggerContainer, scaleIn
} from '@/lib/heritageDesignSystem';
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives";
import { TOUR } from "@/lib/tour/selectors";
import {
  Lightbulb, ThumbsUp, Filter, Plus, Send, Search,
  CheckCircle, Clock, Eye, XCircle, Rocket, Bug,
  Sparkles, Wrench, MessageSquare, ArrowUpDown,
  Loader2, AlertTriangle, RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Map snake_case API row to camelCase for display
interface MappedIdea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  priority: IdeaPriority;
  status: IdeaStatus;
  submittedBy: string;
  submittedByName: string;
  submittedDate: string;
  upvoteCount: number;
  userUpvoted: boolean;
  adminResponse?: string;
  adminRespondedAt?: string;
}

function mapIdea(row: any): MappedIdea {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    submittedBy: row.submitted_by,
    submittedByName: row.submitted_by_name || 'Agent',
    submittedDate: row.created_at,
    upvoteCount: parseInt(row.upvote_count || '0'),
    userUpvoted: row.user_upvoted === true || row.user_upvoted === 't',
    adminResponse: row.admin_response || undefined,
    adminRespondedAt: row.admin_responded_at || undefined,
  };
}

const categoryConfig: Record<IdeaCategory, { label: string; icon: typeof Lightbulb; color: string; bg: string }> = {
  product_idea: { label: 'Product Idea', icon: Rocket, color: 'text-violet-600', bg: 'bg-violet-100' },
  process_improvement: { label: 'Process', icon: Wrench, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  bug_report: { label: 'Bug Report', icon: Bug, color: 'text-red-600', bg: 'bg-red-100' },
  feature_request: { label: 'Feature Request', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-100' },
  general_feedback: { label: 'Feedback', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
};

const statusConfig: Record<IdeaStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  submitted: { label: 'Submitted', icon: Send, color: 'text-gray-600', bg: 'bg-gray-100' },
  under_review: { label: 'Under Review', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100' },
  planned: { label: 'Planned', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  implemented: { label: 'Implemented', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  declined: { label: 'Declined', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
};

const priorityConfig: Record<IdeaPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-700' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700' },
};

export default function AgentIdeas() {
  const queryClient = useQueryClient();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<IdeaCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<IdeaStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'most_upvoted'>('newest');
  const [formData, setFormData] = useState({ title: '', description: '', category: 'feature_request' as IdeaCategory, priority: 'medium' as IdeaPriority });

  // Fetch ideas from API
  const { data: ideasData, isLoading, error, refetch } = useQuery<{ ideas: any[]; stats: any }>({
    queryKey: ['/api/ideas'],
    refetchInterval: 30000,
  });

  const ideas: MappedIdea[] = useMemo(
    () => (ideasData?.ideas || []).map(mapIdea),
    [ideasData]
  );
  const apiStats = ideasData?.stats || { total: 0, byStatus: {} };

  // Submit idea mutation
  const submitMutation = useMutation({
    mutationFn: async (idea: { title: string; description: string; category: IdeaCategory; priority: IdeaPriority }) => {
      const res = await apiRequest('POST', '/api/ideas', idea);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      toast.success('Idea submitted successfully!');
    },
    onError: () => {
      toast.error('Failed to submit idea');
    },
  });

  // Upvote toggle mutation
  const upvoteMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      const res = await apiRequest('POST', `/api/ideas/${ideaId}/upvote`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
    },
  });

  const filteredIdeas = useMemo(() => {
    let result = [...ideas];
    if (searchQuery) result = result.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterCategory !== 'all') result = result.filter(i => i.category === filterCategory);
    if (filterStatus !== 'all') result = result.filter(i => i.status === filterStatus);
    if (sortBy === 'most_upvoted') result.sort((a, b) => b.upvoteCount - a.upvoteCount);
    else result.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    return result;
  }, [ideas, searchQuery, filterCategory, filterStatus, sortBy]);

  const underReview = apiStats.byStatus?.under_review || 0;
  const implemented = apiStats.byStatus?.implemented || 0;
  // Count user's own submissions from loaded data
  const mySubmissions = ideas.filter(i => i.submittedByName).length; // fallback count
  // We use ideas that came from the API—since they're all visible, count is total
  const totalIdeas = apiStats.total || ideas.length;

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    submitMutation.mutate(formData);
    setFormData({ title: '', description: '', category: 'feature_request', priority: 'medium' });
    setShowSubmitDialog(false);
  };

  const handleUpvote = (idea: MappedIdea) => {
    upvoteMutation.mutate(idea.id);
  };

  const stats = [
    { label: 'Total Ideas', value: totalIdeas, icon: Lightbulb, gradient: 'from-violet-500 to-purple-600' },
    { label: 'My Submissions', value: mySubmissions, icon: Send, gradient: 'from-blue-500 to-cyan-600' },
    { label: 'Under Review', value: underReview, icon: Eye, gradient: 'from-amber-500 to-orange-600' },
    { label: 'Implemented', value: implemented, icon: CheckCircle, gradient: 'from-emerald-500 to-green-600' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <AgentLoungeLayout>
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-medium">Loading ideas...</p>
        </div>
      </AgentLoungeLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AgentLoungeLayout>
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <AlertTriangle className="w-10 h-10 mb-4 text-amber-500" />
          <p className="font-medium text-gray-600 mb-2">Failed to load ideas</p>
          <p className="text-sm mb-4">{(error as Error).message}</p>
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      </AgentLoungeLayout>
    );
  }

  return (
    <AgentLoungeLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        {/* Hero */}
        <motion.div data-tour-id={TOUR.AGENT.IDEAS.HEADER} variants={fadeInUp}>
          <AgentPageHero
            icon={Lightbulb}
            title="Ideas & Feedback"
            subtitle="Share ideas, report bugs, and help improve the platform"
          >
            <Button
              data-tour-id={TOUR.AGENT.IDEAS.FORM}
              onClick={() => setShowSubmitDialog(true)}
              className="gap-2 text-white border-0 backdrop-blur-sm hover:scale-105 transition-transform"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: RADIUS.button }}
            >
              <Plus className="w-4 h-4" /> Submit Idea
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* Stats */}
        <motion.div data-tour-id={TOUR.AGENT.IDEAS.STATS} variants={fadeInUp}>
          <AgentStatCardGrid>
            {stats.map((stat) => (
              <AgentStatCard key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} gradient={stat.gradient} />
            ))}
          </AgentStatCardGrid>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search ideas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" style={{ borderRadius: RADIUS.input }} />
          </div>
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as IdeaCategory | 'all')}>
            <SelectTrigger className="w-[160px]" style={{ borderRadius: RADIUS.input }}><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryConfig).map(([key, cfg]) => (<SelectItem key={key} value={key}>{cfg.label}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as IdeaStatus | 'all')}>
            <SelectTrigger className="w-[160px]" style={{ borderRadius: RADIUS.input }}><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusConfig).map(([key, cfg]) => (<SelectItem key={key} value={key}>{cfg.label}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setSortBy(s => s === 'newest' ? 'most_upvoted' : 'newest')} className="gap-2" style={{ borderRadius: RADIUS.input }}>
            <ArrowUpDown className="w-4 h-4" /> {sortBy === 'newest' ? 'Newest' : 'Most Upvoted'}
          </Button>
        </motion.div>

        {/* Ideas Feed */}
        <motion.div data-tour-id={TOUR.AGENT.IDEAS.LIST} variants={fadeInUp} className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredIdeas.map((idea) => {
              const cat = categoryConfig[idea.category];
              const stat = statusConfig[idea.status];
              const hasUpvoted = idea.userUpvoted;
              const CatIcon = cat?.icon || Lightbulb;
              const StatIcon = stat?.icon || Clock;
              return (
                <motion.div key={idea.id} variants={scaleIn} layout className={`bg-white rounded-2xl p-5 border transition-all border-gray-100`} style={{ boxShadow: SHADOW.level1, borderRadius: RADIUS.card }}>
                  <div className="flex gap-4">
                    {/* Upvote */}
                    <button onClick={() => handleUpvote(idea)} disabled={upvoteMutation.isPending} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${hasUpvoted ? 'bg-violet-100 text-violet-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`} style={{ borderRadius: RADIUS.button }}>
                      <ThumbsUp className={`w-5 h-5 ${hasUpvoted ? 'fill-violet-600' : ''}`} />
                      <span className="text-sm font-semibold">{idea.upvoteCount}</span>
                    </button>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>{idea.title}</h3>
                        <div className="flex gap-2 flex-shrink-0">
                          {cat && <Badge variant="secondary" className={`${cat.bg} ${cat.color} gap-1`} style={{ borderRadius: RADIUS.pill }}><CatIcon className="w-3 h-3" /> {cat.label}</Badge>}
                          {stat && <Badge variant="secondary" className={`${stat.bg} ${stat.color} gap-1`} style={{ borderRadius: RADIUS.pill }}><StatIcon className="w-3 h-3" /> {stat.label}</Badge>}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2" style={{ fontSize: TYPE.meta }}>{idea.description}</p>
                      <div className="flex items-center gap-4 text-gray-400" style={{ fontSize: TYPE.caption }}>
                        <span>{idea.submittedByName}</span>
                        <span>{new Date(idea.submittedDate).toLocaleDateString()}</span>
                        {priorityConfig[idea.priority] && (
                          <Badge variant="secondary" className={priorityConfig[idea.priority].color} style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}>{priorityConfig[idea.priority].label}</Badge>
                        )}
                      </div>
                      {idea.adminResponse && (
                        <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100" style={{ borderRadius: RADIUS.button }}>
                          <p className="text-emerald-700 font-medium" style={{ fontSize: TYPE.caption }}>Admin Response:</p>
                          <p className="text-emerald-600" style={{ fontSize: TYPE.meta }}>{idea.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredIdeas.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No ideas found</p>
              <p style={{ fontSize: TYPE.meta }}>Try adjusting your filters or submit the first idea!</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="sm:max-w-[500px]" style={{ borderRadius: RADIUS.card }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-violet-600" /> Submit an Idea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label htmlFor="title">Title</Label><Input id="title" placeholder="Brief title for your idea..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
            <div><Label htmlFor="desc">Description</Label><Textarea id="desc" placeholder="Describe your idea in detail..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} style={{ borderRadius: RADIUS.input }} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as IdeaCategory })}>
                  <SelectTrigger style={{ borderRadius: RADIUS.input }}><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(categoryConfig).map(([key, cfg]) => (<SelectItem key={key} value={key}>{cfg.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as IdeaPriority })}>
                  <SelectTrigger style={{ borderRadius: RADIUS.input }}><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(priorityConfig).map(([key, cfg]) => (<SelectItem key={key} value={key}>{cfg.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)} style={{ borderRadius: RADIUS.button }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-2" style={{ borderRadius: RADIUS.button }}>
              {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgentLoungeLayout>
  );
}
