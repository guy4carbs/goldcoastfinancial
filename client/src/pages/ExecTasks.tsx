import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo, Search, Clock, CheckCircle2, AlertCircle, User, MessageSquare, 
  Paperclip, ChevronDown, Flag, Target, Briefcase, FileText, DollarSign, 
  Users, Shield, Settings, BarChart3, Play, Timer, Star, StarOff, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import ExecCommandLayout, { useExecCommand } from "@/components/exec/ExecCommandLayout";
import { format, isToday, isTomorrow, isPast, differenceInDays } from "date-fns";

type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked' | 'deferred';
type TaskCategory = 'Finance' | 'Leadership' | 'Contracts' | 'Marketing' | 'HR' | 'Compliance' | 'Operations' | 'Strategy';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  assigneeAvatar?: string;
  dueDate: string;
  createdDate: string;
  category: TaskCategory;
  progress: number;
  comments: number;
  attachments: number;
  starred: boolean;
  subtasks?: { id: number; title: string; completed: boolean }[];
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

const allTasks: Task[] = [
  { id: 1, title: 'Review Q1 financial projections', description: 'Analyze revenue forecasts, adjust budget allocations, and prepare variance explanations for leadership review.', priority: 'high', status: 'in_progress', assignee: 'You', dueDate: '2026-01-06', createdDate: '2026-01-02', category: 'Finance', progress: 65, comments: 3, attachments: 2, starred: true, subtasks: [{ id: 1, title: 'Gather Q4 actuals from accounting', completed: true }, { id: 2, title: 'Build projection model', completed: true }, { id: 3, title: 'Review with CFO', completed: false }, { id: 4, title: 'Finalize and distribute', completed: false }], tags: ['Q1', 'Budget', 'Priority'], estimatedHours: 8, actualHours: 5.5 },
  { id: 2, title: 'Approve agent promotion recommendations', description: 'Review 5 agents for Senior Agent promotion based on Q4 performance metrics.', priority: 'high', status: 'pending', assignee: 'You', dueDate: '2026-01-07', createdDate: '2026-01-03', category: 'Leadership', progress: 0, comments: 8, attachments: 5, starred: false, subtasks: [{ id: 1, title: 'Review Sarah Mitchell file', completed: false }, { id: 2, title: 'Review Marcus Chen file', completed: false }, { id: 3, title: 'Review performance metrics', completed: false }], tags: ['Promotions', 'HR'], estimatedHours: 4 },
  { id: 3, title: 'Sign carrier renewal contract - Mutual of Omaha', description: 'Review and execute renewal with improved commission structure.', priority: 'urgent', status: 'pending', assignee: 'You', dueDate: '2026-01-05', createdDate: '2025-12-28', category: 'Contracts', progress: 0, comments: 12, attachments: 3, starred: true, tags: ['Contract', 'Urgent'], estimatedHours: 1 },
  { id: 4, title: 'Review marketing spend efficiency report', description: 'Analyze ROI on Q4 marketing campaigns.', priority: 'medium', status: 'completed', assignee: 'Sarah Mitchell', assigneeAvatar: 'SM', dueDate: '2026-01-04', createdDate: '2026-01-01', category: 'Marketing', progress: 100, comments: 5, attachments: 1, starred: false, tags: ['Marketing', 'ROI'], estimatedHours: 3, actualHours: 2.5 },
  { id: 5, title: 'Prepare board presentation', description: 'Create executive summary for Q1 board meeting.', priority: 'high', status: 'in_progress', assignee: 'You', dueDate: '2026-01-10', createdDate: '2026-01-02', category: 'Leadership', progress: 35, comments: 2, attachments: 4, starred: true, subtasks: [{ id: 1, title: 'Financial summary section', completed: true }, { id: 2, title: 'Growth metrics dashboard', completed: false }, { id: 3, title: 'Risk assessment', completed: false }], tags: ['Board', 'Presentation'], estimatedHours: 12, actualHours: 4 },
  { id: 6, title: 'Finalize 2026 hiring plan', description: 'Set agent recruitment targets and budget for new year.', priority: 'medium', status: 'pending', assignee: 'Michael Chen', assigneeAvatar: 'MC', dueDate: '2026-01-08', createdDate: '2026-01-03', category: 'HR', progress: 0, comments: 6, attachments: 2, starred: false, tags: ['Hiring', '2026'], estimatedHours: 6 },
  { id: 7, title: 'Review compliance audit findings', description: 'Address 3 minor findings from Q4 compliance review.', priority: 'medium', status: 'in_progress', assignee: 'You', dueDate: '2026-01-09', createdDate: '2026-01-04', category: 'Compliance', progress: 50, comments: 4, attachments: 3, starred: false, subtasks: [{ id: 1, title: 'Document review finding #1', completed: true }, { id: 2, title: 'Process update finding #2', completed: true }, { id: 3, title: 'Training gap finding #3', completed: false }], tags: ['Compliance', 'Audit'], estimatedHours: 5, actualHours: 2.5 },
  { id: 8, title: 'Update override compensation structure', description: 'Implement new tiered override system for team leaders.', priority: 'low', status: 'pending', assignee: 'David Park', assigneeAvatar: 'DP', dueDate: '2026-01-15', createdDate: '2026-01-05', category: 'Finance', progress: 0, comments: 1, attachments: 1, starred: false, tags: ['Compensation', 'Override'], estimatedHours: 8 },
];

const priorityConfig = {
  urgent: { color: 'bg-red-500', text: 'text-red-500', label: 'Urgent', icon: Zap },
  high: { color: 'bg-orange-500', text: 'text-orange-500', label: 'High', icon: Flag },
  medium: { color: 'bg-yellow-500', text: 'text-yellow-500', label: 'Medium', icon: Target },
  low: { color: 'bg-blue-500', text: 'text-blue-500', label: 'Low', icon: BarChart3 },
};

const statusConfig = {
  pending: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', label: 'Pending' },
  in_progress: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', label: 'In Progress' },
  review: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300', label: 'In Review' },
  completed: { color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', label: 'Completed' },
  blocked: { color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', label: 'Blocked' },
  deferred: { color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', label: 'Deferred' },
};

const categoryConfig: Record<TaskCategory, { icon: any; color: string }> = {
  Finance: { icon: DollarSign, color: 'text-green-500' },
  Leadership: { icon: Users, color: 'text-blue-500' },
  Contracts: { icon: FileText, color: 'text-purple-500' },
  Marketing: { icon: Target, color: 'text-pink-500' },
  HR: { icon: User, color: 'text-orange-500' },
  Compliance: { icon: Shield, color: 'text-red-500' },
  Operations: { icon: Settings, color: 'text-gray-500' },
  Strategy: { icon: Briefcase, color: 'text-indigo-500' },
};

function TasksContent() {
  const { theme } = useExecCommand();
  const [tasks, setTasks] = useState<Task[]>(allTasks);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));
    }
    if (statusFilter !== 'all') filtered = filtered.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all') filtered = filtered.filter(t => t.priority === priorityFilter);
    if (categoryFilter !== 'all') filtered = filtered.filter(t => t.category === categoryFilter);
    return filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: tasks.length,
    myTasks: tasks.filter(t => t.assignee === 'You').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isPast(new Date(t.dueDate)) && t.status !== 'completed').length,
    dueToday: tasks.filter(t => isToday(new Date(t.dueDate))).length,
    urgent: tasks.filter(t => t.priority === 'urgent').length,
  }), [tasks]);

  const toggleTaskStar = (taskId: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, starred: !t.starred } : t));
  };

  const toggleSubtask = (taskId: number, subtaskId: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.subtasks) {
        const updated = t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
        const completedCount = updated.filter(st => st.completed).length;
        const progress = Math.round((completedCount / updated.length) * 100);
        return { ...t, subtasks: updated, progress };
      }
      return t;
    }));
  };

  const getDueDateDisplay = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isToday(date)) return { text: 'Today', color: 'text-orange-500' };
    if (isTomorrow(date)) return { text: 'Tomorrow', color: 'text-yellow-500' };
    if (isPast(date)) return { text: `${differenceInDays(new Date(), date)} days overdue`, color: 'text-red-500' };
    const days = differenceInDays(date, new Date());
    if (days <= 7) return { text: `${days} days`, color: 'text-blue-500' };
    return { text: format(date, 'MMM d'), color: 'text-gray-500' };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
            <ListTodo className="w-7 h-7 text-secondary" />
            Executive Task Command
          </h2>
          <p className="text-muted-foreground mt-1">{greeting}. You have <span className="text-secondary font-semibold">{stats.myTasks} tasks</span> assigned, <span className="text-red-500 font-semibold">{stats.overdue} overdue</span>.</p>
        </div>
        <div className={cn("text-right p-3 rounded-lg", theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100')}>
          <p className="text-xs text-muted-foreground">Productivity Score</p>
          <p className="text-2xl font-bold text-secondary">87%</p>
          <p className="text-xs text-emerald-500">+5% this week</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: ListTodo, color: 'text-gray-500' },
          { label: 'My Tasks', value: stats.myTasks, icon: User, color: 'text-blue-500' },
          { label: 'In Progress', value: stats.inProgress, icon: Play, color: 'text-yellow-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-500' },
          { label: 'Due Today', value: stats.dueToday, icon: Clock, color: 'text-orange-500' },
          { label: 'Urgent', value: stats.urgent, icon: Zap, color: 'text-red-600' },
        ].map((stat) => (
          <Card key={stat.label} className={cn("p-3", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <div className="flex items-center gap-2">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className={cn("p-4", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" data-testid="input-search-tasks" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-priority-filter"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-category-filter"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.keys(categoryConfig).map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')} data-testid="button-view-list"><ListTodo className="w-4 h-4" /></Button>
            <Button variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')} data-testid="button-view-kanban"><BarChart3 className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>

      {/* Task List */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const dueDisplay = getDueDateDisplay(task.dueDate);
            const CategoryIcon = categoryConfig[task.category]?.icon || Briefcase;
            const PriorityIcon = priorityConfig[task.priority].icon;
            const isExpanded = expandedTask === task.id;
            
            return (
              <Card key={task.id} className={cn("p-4 transition-all cursor-pointer", theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'hover:bg-gray-50', task.starred && 'ring-1 ring-yellow-500/50')} onClick={() => setExpandedTask(isExpanded ? null : task.id)} data-testid={`task-card-${task.id}`}>
                <div className="flex items-start gap-3">
                  <button onClick={(e) => { e.stopPropagation(); toggleTaskStar(task.id); }} className="mt-1" data-testid={`button-star-task-${task.id}`}>
                    {task.starred ? <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> : <StarOff className="w-4 h-4 text-gray-400" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <PriorityIcon className={cn("w-3.5 h-3.5", priorityConfig[task.priority].text)} />
                          <h3 className="font-medium text-sm">{task.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={statusConfig[task.status].color}>{statusConfig[task.status].label}</Badge>
                        <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CategoryIcon className={cn("w-3.5 h-3.5", categoryConfig[task.category].color)} />{task.category}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{task.assignee}</span>
                      <span className={cn("flex items-center gap-1", dueDisplay.color)}><Clock className="w-3.5 h-3.5" />{dueDisplay.text}</span>
                      {task.comments > 0 && <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{task.comments}</span>}
                      {task.attachments > 0 && <span className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" />{task.attachments}</span>}
                    </div>
                    
                    {task.progress > 0 && task.progress < 100 && <div className="mt-2"><Progress value={task.progress} className="h-1.5" /></div>}
                  </div>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase">Subtasks</h4>
                            {task.subtasks.map((st) => (
                              <div key={st.id} className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Checkbox checked={st.completed} onCheckedChange={() => toggleSubtask(task.id, st.id)} data-testid={`checkbox-subtask-${task.id}-${st.id}`} />
                                <span className={cn("text-sm", st.completed && "line-through text-muted-foreground")}>{st.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {task.estimatedHours && (
                          <div className="mt-3 flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" />Est: {task.estimatedHours}h</span>
                            {task.actualHours && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Actual: {task.actualHours}h</span>}
                          </div>
                        )}
                        
                        {task.tags && task.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {task.tags.map((tag) => (<Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(['pending', 'in_progress', 'review', 'completed', 'blocked'] as TaskStatus[]).map((status) => {
            const statusTasks = filteredTasks.filter(t => t.status === status);
            return (
              <div key={status} className={cn("rounded-lg p-3", theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100')}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm">{statusConfig[status].label}</h3>
                  <Badge variant="secondary">{statusTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {statusTasks.map((task) => {
                    const PriorityIcon = priorityConfig[task.priority].icon;
                    return (
                      <Card key={task.id} className={cn("p-3", theme === 'dark' ? 'bg-gray-700 border-gray-600' : '')}>
                        <div className="flex items-start gap-2">
                          <PriorityIcon className={cn("w-3.5 h-3.5 mt-0.5", priorityConfig[task.priority].text)} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium line-clamp-2">{task.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{task.assignee}</p>
                          </div>
                        </div>
                        {task.progress > 0 && <Progress value={task.progress} className="h-1 mt-2" />}
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ExecTasks() {
  return (
    <ExecCommandLayout activeNav="tasks" title="Tasks">
      <TasksContent />
    </ExecCommandLayout>
  );
}
