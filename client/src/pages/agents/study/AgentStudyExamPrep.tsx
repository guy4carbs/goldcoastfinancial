import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle2,
  Circle,
  Star,
  BookOpen,
  Target,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc,
  Columns,
  Eye,
  EyeOff,
  Printer,
  FileSpreadsheet,
  GraduationCap,
  AlertTriangle,
  Lightbulb,
  ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface StudyTopic {
  id: string;
  category: string;
  topic: string;
  subtopic: string;
  importance: 'High' | 'Medium' | 'Low';
  examWeight: number;
  status: 'Not Started' | 'In Progress' | 'Review' | 'Mastered';
  notes: string;
  lastStudied: string | null;
  confidence: number;
  starred: boolean;
}

const STUDY_TOPICS: StudyTopic[] = [
  // General Insurance Concepts
  { id: '1', category: 'General Concepts', topic: 'Insurance Principles', subtopic: 'Insurable Interest', importance: 'High', examWeight: 3, status: 'Mastered', notes: 'Must exist at time of application', lastStudied: '2026-01-25', confidence: 95, starred: true },
  { id: '2', category: 'General Concepts', topic: 'Insurance Principles', subtopic: 'Utmost Good Faith', importance: 'High', examWeight: 2, status: 'Review', notes: 'Both parties must act honestly', lastStudied: '2026-01-24', confidence: 80, starred: false },
  { id: '3', category: 'General Concepts', topic: 'Insurance Principles', subtopic: 'Indemnity', importance: 'Medium', examWeight: 2, status: 'In Progress', notes: 'Restore to pre-loss condition', lastStudied: '2026-01-23', confidence: 60, starred: false },
  { id: '4', category: 'General Concepts', topic: 'Risk Management', subtopic: 'Risk Avoidance', importance: 'Medium', examWeight: 1, status: 'Not Started', notes: '', lastStudied: null, confidence: 0, starred: false },
  { id: '5', category: 'General Concepts', topic: 'Risk Management', subtopic: 'Risk Reduction', importance: 'Medium', examWeight: 1, status: 'Not Started', notes: '', lastStudied: null, confidence: 0, starred: false },
  { id: '6', category: 'General Concepts', topic: 'Risk Management', subtopic: 'Risk Transfer', importance: 'High', examWeight: 2, status: 'Not Started', notes: '', lastStudied: null, confidence: 0, starred: true },

  // Life Insurance Types
  { id: '7', category: 'Life Insurance Types', topic: 'Term Life', subtopic: 'Level Term', importance: 'High', examWeight: 4, status: 'In Progress', notes: 'Death benefit stays constant', lastStudied: '2026-01-22', confidence: 70, starred: true },
  { id: '8', category: 'Life Insurance Types', topic: 'Term Life', subtopic: 'Decreasing Term', importance: 'High', examWeight: 3, status: 'Review', notes: 'Common for mortgage protection', lastStudied: '2026-01-21', confidence: 85, starred: false },
  { id: '9', category: 'Life Insurance Types', topic: 'Term Life', subtopic: 'Annual Renewable Term', importance: 'Medium', examWeight: 2, status: 'Not Started', notes: '', lastStudied: null, confidence: 0, starred: false },
  { id: '10', category: 'Life Insurance Types', topic: 'Whole Life', subtopic: 'Ordinary Life', importance: 'High', examWeight: 4, status: 'Mastered', notes: 'Premiums paid for life', lastStudied: '2026-01-25', confidence: 90, starred: true },
  { id: '11', category: 'Life Insurance Types', topic: 'Whole Life', subtopic: 'Limited Pay', importance: 'High', examWeight: 3, status: 'In Progress', notes: '10-pay, 20-pay, Paid at 65', lastStudied: '2026-01-20', confidence: 55, starred: false },
  { id: '12', category: 'Life Insurance Types', topic: 'Whole Life', subtopic: 'Single Premium', importance: 'Medium', examWeight: 2, status: 'Not Started', notes: 'MEC considerations', lastStudied: null, confidence: 0, starred: false },
  { id: '13', category: 'Life Insurance Types', topic: 'Universal Life', subtopic: 'Flexible Premium UL', importance: 'High', examWeight: 4, status: 'Review', notes: 'Flexible premiums and death benefit', lastStudied: '2026-01-19', confidence: 75, starred: true },
  { id: '14', category: 'Life Insurance Types', topic: 'Universal Life', subtopic: 'Indexed UL', importance: 'High', examWeight: 3, status: 'Not Started', notes: 'Returns tied to index performance', lastStudied: null, confidence: 0, starred: true },
  { id: '15', category: 'Life Insurance Types', topic: 'Universal Life', subtopic: 'Variable UL', importance: 'Medium', examWeight: 2, status: 'Not Started', notes: 'Separate account investments', lastStudied: null, confidence: 0, starred: false },

  // Policy Provisions
  { id: '16', category: 'Policy Provisions', topic: 'Standard Provisions', subtopic: 'Grace Period', importance: 'High', examWeight: 3, status: 'Mastered', notes: '30-31 days typically', lastStudied: '2026-01-24', confidence: 100, starred: false },
  { id: '17', category: 'Policy Provisions', topic: 'Standard Provisions', subtopic: 'Incontestability', importance: 'High', examWeight: 3, status: 'Review', notes: '2 years from issue date', lastStudied: '2026-01-23', confidence: 85, starred: true },
  { id: '18', category: 'Policy Provisions', topic: 'Standard Provisions', subtopic: 'Suicide Clause', importance: 'High', examWeight: 2, status: 'In Progress', notes: '1-2 years exclusion period', lastStudied: '2026-01-22', confidence: 65, starred: false },
  { id: '19', category: 'Policy Provisions', topic: 'Standard Provisions', subtopic: 'Misstatement of Age', importance: 'Medium', examWeight: 2, status: 'Not Started', notes: 'Benefits adjusted to correct premium', lastStudied: null, confidence: 0, starred: false },
  { id: '20', category: 'Policy Provisions', topic: 'Policy Options', subtopic: 'Nonforfeiture Options', importance: 'High', examWeight: 4, status: 'In Progress', notes: 'Cash value, RPU, ETI', lastStudied: '2026-01-21', confidence: 50, starred: true },
  { id: '21', category: 'Policy Provisions', topic: 'Policy Options', subtopic: 'Dividend Options', importance: 'High', examWeight: 3, status: 'Not Started', notes: 'Cash, reduce premium, PUA, accumulate', lastStudied: null, confidence: 0, starred: false },
  { id: '22', category: 'Policy Provisions', topic: 'Policy Options', subtopic: 'Settlement Options', importance: 'High', examWeight: 3, status: 'Not Started', notes: 'Lump sum, interest only, fixed period, life income', lastStudied: null, confidence: 0, starred: true },

  // Riders
  { id: '23', category: 'Riders', topic: 'Death Benefit Riders', subtopic: 'Accidental Death', importance: 'Medium', examWeight: 2, status: 'Review', notes: 'Double or triple indemnity', lastStudied: '2026-01-20', confidence: 80, starred: false },
  { id: '24', category: 'Riders', topic: 'Death Benefit Riders', subtopic: 'Term Rider', importance: 'Medium', examWeight: 1, status: 'Not Started', notes: 'Additional term coverage on base policy', lastStudied: null, confidence: 0, starred: false },
  { id: '25', category: 'Riders', topic: 'Living Benefit Riders', subtopic: 'Waiver of Premium', importance: 'High', examWeight: 3, status: 'Mastered', notes: 'Disability waives premium payments', lastStudied: '2026-01-25', confidence: 95, starred: true },
  { id: '26', category: 'Riders', topic: 'Living Benefit Riders', subtopic: 'Accelerated Death Benefit', importance: 'High', examWeight: 3, status: 'In Progress', notes: 'Terminal illness early payout', lastStudied: '2026-01-19', confidence: 60, starred: true },
  { id: '27', category: 'Riders', topic: 'Living Benefit Riders', subtopic: 'Long-Term Care Rider', importance: 'Medium', examWeight: 2, status: 'Not Started', notes: 'Access death benefit for LTC needs', lastStudied: null, confidence: 0, starred: false },

  // Underwriting
  { id: '28', category: 'Underwriting', topic: 'Risk Classification', subtopic: 'Standard Risk', importance: 'High', examWeight: 2, status: 'Review', notes: 'Normal mortality rate', lastStudied: '2026-01-18', confidence: 75, starred: false },
  { id: '29', category: 'Underwriting', topic: 'Risk Classification', subtopic: 'Substandard Risk', importance: 'High', examWeight: 2, status: 'In Progress', notes: 'Higher premium or limited coverage', lastStudied: '2026-01-17', confidence: 55, starred: false },
  { id: '30', category: 'Underwriting', topic: 'Risk Classification', subtopic: 'Preferred Risk', importance: 'Medium', examWeight: 1, status: 'Not Started', notes: 'Better than average health', lastStudied: null, confidence: 0, starred: false },
  { id: '31', category: 'Underwriting', topic: 'Application Process', subtopic: 'Medical Information Bureau', importance: 'High', examWeight: 2, status: 'Not Started', notes: 'MIB codes and records', lastStudied: null, confidence: 0, starred: true },
  { id: '32', category: 'Underwriting', topic: 'Application Process', subtopic: 'Attending Physician Statement', importance: 'Medium', examWeight: 1, status: 'Not Started', notes: 'APS from doctor', lastStudied: null, confidence: 0, starred: false },

  // Ethics & Regulations
  { id: '33', category: 'Ethics & Regulations', topic: 'Agent Responsibilities', subtopic: 'Fiduciary Duty', importance: 'High', examWeight: 3, status: 'In Progress', notes: 'Act in client best interest', lastStudied: '2026-01-16', confidence: 70, starred: true },
  { id: '34', category: 'Ethics & Regulations', topic: 'Agent Responsibilities', subtopic: 'Suitability', importance: 'High', examWeight: 3, status: 'Review', notes: 'Recommend appropriate products', lastStudied: '2026-01-15', confidence: 80, starred: true },
  { id: '35', category: 'Ethics & Regulations', topic: 'Prohibited Practices', subtopic: 'Twisting', importance: 'High', examWeight: 3, status: 'Mastered', notes: 'Misrepresentation to induce replacement', lastStudied: '2026-01-25', confidence: 100, starred: false },
  { id: '36', category: 'Ethics & Regulations', topic: 'Prohibited Practices', subtopic: 'Churning', importance: 'High', examWeight: 2, status: 'Review', notes: 'Excessive policy replacement', lastStudied: '2026-01-14', confidence: 85, starred: false },
  { id: '37', category: 'Ethics & Regulations', topic: 'Prohibited Practices', subtopic: 'Rebating', importance: 'High', examWeight: 3, status: 'In Progress', notes: 'Returning premium to induce sale', lastStudied: '2026-01-13', confidence: 65, starred: true },
  { id: '38', category: 'Ethics & Regulations', topic: 'Disclosure Requirements', subtopic: 'Replacement Forms', importance: 'High', examWeight: 2, status: 'Not Started', notes: 'Must disclose when replacing policy', lastStudied: null, confidence: 0, starred: false },
];

const CATEGORIES = ['All', 'General Concepts', 'Life Insurance Types', 'Policy Provisions', 'Riders', 'Underwriting', 'Ethics & Regulations'];
const STATUSES = ['All', 'Not Started', 'In Progress', 'Review', 'Mastered'];
const IMPORTANCE_LEVELS = ['All', 'High', 'Medium', 'Low'];

type SortField = 'category' | 'topic' | 'importance' | 'examWeight' | 'status' | 'confidence';
type SortDirection = 'asc' | 'desc';

export default function AgentStudyExamPrep() {
  const [topics, setTopics] = useState(STUDY_TOPICS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [importanceFilter, setImportanceFilter] = useState('All');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('examWeight');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingNote, setEditingNote] = useState<string | null>(null);

  // Filter and sort topics
  const filteredTopics = useMemo(() => {
    let result = [...topics];

    // Apply filters
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.topic.toLowerCase().includes(query) ||
        t.subtopic.toLowerCase().includes(query) ||
        t.notes.toLowerCase().includes(query)
      );
    }
    if (categoryFilter !== 'All') {
      result = result.filter(t => t.category === categoryFilter);
    }
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }
    if (importanceFilter !== 'All') {
      result = result.filter(t => t.importance === importanceFilter);
    }
    if (showStarredOnly) {
      result = result.filter(t => t.starred);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (sortField === 'importance') {
        const order = { 'High': 3, 'Medium': 2, 'Low': 1 };
        aVal = order[a.importance];
        bVal = order[b.importance];
      } else if (sortField === 'status') {
        const order = { 'Not Started': 1, 'In Progress': 2, 'Review': 3, 'Mastered': 4 };
        aVal = order[a.status];
        bVal = order[b.status];
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return result;
  }, [topics, searchQuery, categoryFilter, statusFilter, importanceFilter, showStarredOnly, sortField, sortDirection]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = topics.length;
    const mastered = topics.filter(t => t.status === 'Mastered').length;
    const review = topics.filter(t => t.status === 'Review').length;
    const inProgress = topics.filter(t => t.status === 'In Progress').length;
    const notStarted = topics.filter(t => t.status === 'Not Started').length;
    const avgConfidence = Math.round(topics.reduce((acc, t) => acc + t.confidence, 0) / total);
    const highPriority = topics.filter(t => t.importance === 'High' && t.status !== 'Mastered').length;

    return { total, mastered, review, inProgress, notStarted, avgConfidence, highPriority };
  }, [topics]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleToggleStar = (id: string) => {
    setTopics(prev => prev.map(t =>
      t.id === id ? { ...t, starred: !t.starred } : t
    ));
  };

  const handleStatusChange = (id: string, status: StudyTopic['status']) => {
    setTopics(prev => prev.map(t =>
      t.id === id ? { ...t, status, lastStudied: new Date().toISOString().split('T')[0] } : t
    ));
    toast.success(`Status updated to "${status}"`);
  };

  const handleConfidenceChange = (id: string, confidence: number) => {
    setTopics(prev => prev.map(t =>
      t.id === id ? { ...t, confidence: Math.min(100, Math.max(0, confidence)) } : t
    ));
  };

  const handleNoteChange = (id: string, notes: string) => {
    setTopics(prev => prev.map(t =>
      t.id === id ? { ...t, notes } : t
    ));
  };

  const handleExport = () => {
    toast.success('Exporting study data...', { description: 'Download will start shortly' });
  };

  const getStatusColor = (status: StudyTopic['status']) => {
    switch (status) {
      case 'Mastered': return 'bg-green-100 text-green-700';
      case 'Review': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-amber-100 text-amber-700';
      case 'Not Started': return 'bg-gray-100 text-gray-600';
    }
  };

  const getImportanceColor = (importance: StudyTopic['importance']) => {
    switch (importance) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Low': return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center gap-4 mb-4">
            <Link href="/agents/getting-started">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Xcel Partner Course</span>
                <Badge variant="outline" className="text-violet-600">Code: fflapex-hrojsf</Badge>
              </div>
              <h1 className="text-2xl font-bold text-primary">State Exam Prep Course</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={fadeInUp}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-xs text-white/80">Total Topics</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{stats.mastered}</p>
                <p className="text-xs text-gray-500">Mastered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.review}</p>
                <p className="text-xs text-gray-500">Review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-amber-600">{stats.inProgress}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-gray-600">{stats.notStarted}</p>
                <p className="text-xs text-gray-500">Not Started</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{stats.avgConfidence}%</p>
                <p className="text-xs text-gray-500">Avg Confidence</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{stats.highPriority}</p>
                <p className="text-xs text-gray-500">High Priority</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search topics, subtopics, notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={importanceFilter} onValueChange={setImportanceFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Importance" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPORTANCE_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={showStarredOnly ? "default" : "outline"}
                  size="icon"
                  onClick={() => setShowStarredOnly(!showStarredOnly)}
                >
                  <Star className={cn("w-4 h-4", showStarredOnly && "fill-current")} />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Showing {filteredTopics.length} of {topics.length} topics
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Excel-style Table */}
        <motion.div variants={fadeInUp}>
          <Card>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('category')}>
                      <div className="flex items-center gap-1">
                        Category
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('topic')}>
                      <div className="flex items-center gap-1">
                        Topic / Subtopic
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-24 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('importance')}>
                      <div className="flex items-center gap-1">
                        Priority
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-20 cursor-pointer hover:bg-gray-100 text-center" onClick={() => handleSort('examWeight')}>
                      <div className="flex items-center justify-center gap-1">
                        Weight
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-32 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-32 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('confidence')}>
                      <div className="flex items-center gap-1">
                        Confidence
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[200px]">Notes</TableHead>
                    <TableHead className="w-24">Last Studied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTopics.map((topic) => (
                    <TableRow
                      key={topic.id}
                      className={cn(
                        "hover:bg-gray-50",
                        topic.importance === 'High' && topic.status !== 'Mastered' && "bg-red-50/30"
                      )}
                    >
                      <TableCell>
                        <button onClick={() => handleToggleStar(topic.id)}>
                          <Star className={cn(
                            "w-4 h-4",
                            topic.starred ? "fill-amber-400 text-amber-400" : "text-gray-300"
                          )} />
                        </button>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {topic.category}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{topic.topic}</p>
                          <p className="text-xs text-gray-500">{topic.subtopic}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getImportanceColor(topic.importance))}>
                          {topic.importance}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          {[...Array(topic.examWeight)].map((_, i) => (
                            <Target key={i} className="w-3 h-3 text-violet-500" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={topic.status}
                          onValueChange={(value: StudyTopic['status']) => handleStatusChange(topic.id, value)}
                        >
                          <SelectTrigger className={cn("h-7 text-xs", getStatusColor(topic.status))}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Review">Review</SelectItem>
                            <SelectItem value="Mastered">Mastered</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={topic.confidence} className="h-2 w-16" />
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={topic.confidence}
                            onChange={(e) => handleConfidenceChange(topic.id, parseInt(e.target.value) || 0)}
                            className="w-14 h-7 text-xs text-center"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingNote === topic.id ? (
                          <Input
                            value={topic.notes}
                            onChange={(e) => handleNoteChange(topic.id, e.target.value)}
                            onBlur={() => setEditingNote(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingNote(null)}
                            autoFocus
                            className="h-7 text-xs"
                          />
                        ) : (
                          <p
                            className="text-xs text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[28px]"
                            onClick={() => setEditingNote(topic.id)}
                          >
                            {topic.notes || <span className="text-gray-400 italic">Add note...</span>}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {topic.lastStudied || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </motion.div>

        {/* Legend */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-500" />
                  <span className="text-gray-600">Weight = Exam frequency (more = more common on exam)</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600">Red highlight = High priority, not mastered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-gray-600">Click cells to edit notes & confidence</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
