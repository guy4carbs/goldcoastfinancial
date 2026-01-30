import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Download,
  Upload,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Tag,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Trash2,
  UserMinus,
  Tags,
  AlertCircle,
  FileText,
  Globe,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import AdminNav from "@/components/AdminNav";

// Types
interface Subscriber {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  status: "active" | "unsubscribed" | "bounced";
  source: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
  landingPage: string | null;
  notes: string | null;
  tags: Tag[];
}

interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  subscriberCount: number;
}

interface Stats {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
  thisMonth: number;
  thisWeek: number;
  unsubscribedThisMonth: number;
  activeRate?: string;
  unsubscribeRate?: string;
}

interface SourceBreakdown {
  source: string;
  count: number;
}

interface GrowthData {
  period: string;
  subscribed: number;
  unsubscribed: number;
  net: number;
  cumulative: number;
}

interface SubscriberActivity {
  id: string;
  type: string;
  description: string;
  metadata: any;
  performedBy: string;
  createdAt: string;
}

// Status config for badges
const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; icon: React.ReactNode }> = {
  active: { label: "Active", bgColor: "bg-green-100", textColor: "text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
  unsubscribed: { label: "Unsubscribed", bgColor: "bg-red-100", textColor: "text-red-700", icon: <XCircle className="w-3 h-3" /> },
  bounced: { label: "Bounced", bgColor: "bg-amber-100", textColor: "text-amber-700", icon: <AlertCircle className="w-3 h-3" /> },
};

// Source config with icons
const SOURCE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  blog: { label: "Blog", icon: <FileText className="w-3 h-3" /> },
  banner: { label: "Banner", icon: <Globe className="w-3 h-3" /> },
  website: { label: "Website", icon: <Globe className="w-3 h-3" /> },
  footer: { label: "Footer", icon: <Globe className="w-3 h-3" /> },
  import: { label: "Import", icon: <Upload className="w-3 h-3" /> },
  admin: { label: "Admin", icon: <UserPlus className="w-3 h-3" /> },
};

export default function AdminNewsletter() {
  const queryClient = useQueryClient();

  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");

  // Fetch subscribers
  const { data: subscribersData, isLoading } = useQuery({
    queryKey: ["/api/admin/newsletter", statusFilter, sourceFilter, search, tagFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      if (search) params.set("search", search);
      if (tagFilter) params.set("tagId", tagFilter);
      params.set("page", page.toString());
      params.set("limit", "25");

      const res = await fetch(`/api/admin/newsletter?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch subscribers");
      return res.json();
    },
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ["/api/admin/newsletter/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/newsletter/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  // Fetch growth data
  const { data: growthData } = useQuery({
    queryKey: ["/api/admin/newsletter/growth", chartPeriod],
    queryFn: async () => {
      const res = await fetch(`/api/admin/newsletter/growth?period=${chartPeriod}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch growth data");
      return res.json();
    },
  });

  // Fetch tags
  const { data: tagsData } = useQuery({
    queryKey: ["/api/admin/newsletter/tags"],
    queryFn: async () => {
      const res = await fetch("/api/admin/newsletter/tags", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tags");
      return res.json();
    },
  });

  const subscribers: Subscriber[] = subscribersData?.subscribers || [];
  const stats: Stats = statsData?.stats || subscribersData?.stats || { total: 0, active: 0, unsubscribed: 0, bounced: 0, thisMonth: 0, thisWeek: 0, unsubscribedThisMonth: 0 };
  const sourceBreakdown: SourceBreakdown[] = statsData?.sourceBreakdown || [];
  const growth: GrowthData[] = growthData?.growth || [];
  const tags: Tag[] = tagsData?.tags || [];
  const pagination = subscribersData?.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 };

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/stats"] });
      toast.success("Subscriber deleted");
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/newsletter/${id}/unsubscribe`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to unsubscribe");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/stats"] });
      toast.success("Subscriber unsubscribed");
    },
  });

  const resubscribeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/newsletter/${id}/resubscribe`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to resubscribe");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/stats"] });
      toast.success("Subscriber reactivated");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/admin/newsletter/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/stats"] });
      toast.success(`${data.deleted} subscribers deleted`);
      setSelectedIds([]);
    },
  });

  const bulkUnsubscribeMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/admin/newsletter/bulk-unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to unsubscribe");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/stats"] });
      toast.success(`${data.unsubscribed} subscribers unsubscribed`);
      setSelectedIds([]);
    },
  });

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === subscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscribers.map((s) => s.id));
    }
  };

  // Handle single select
  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate growth percentage
  const growthPercentage = stats.thisMonth > 0 && stats.total > 0
    ? ((stats.thisMonth / (stats.total - stats.thisMonth)) * 100).toFixed(1)
    : "0";

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <AdminNav />

      <div className="flex-1 pt-[72px] lg:pt-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
              <p className="text-gray-600">{stats.total.toLocaleString()} total subscribers</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTagManager(true)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Tags className="w-4 h-4" />
                <span className="hidden md:inline">Tags</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden md:inline">Import</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden md:inline">Add Subscriber</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Total Subscribers</span>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4" />
                +{stats.thisMonth} this month
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Active Subscribers</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.active.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.activeRate || ((stats.active / Math.max(stats.total, 1)) * 100).toFixed(1)}% of total
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">This Month</span>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">+{stats.thisMonth}</p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4" />
                {growthPercentage}% growth
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Unsubscribe Rate</span>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {stats.unsubscribeRate || ((stats.unsubscribed / Math.max(stats.total, 1)) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.unsubscribedThisMonth} this month
              </p>
            </div>
          </div>

          {/* Growth Chart & Source Breakdown */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Growth Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Subscriber Growth</h3>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  {(["daily", "weekly", "monthly"] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        chartPeriod === period
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#888" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#888" />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="subscribed"
                      stroke="#7c3aed"
                      fill="#7c3aed"
                      fillOpacity={0.2}
                      name="Subscribed"
                    />
                    <Area
                      type="monotone"
                      dataKey="unsubscribed"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.1}
                      name="Unsubscribed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Source Breakdown */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Signup Sources</h3>
              <div className="space-y-3">
                {sourceBreakdown.length > 0 ? (
                  sourceBreakdown.map((item) => {
                    const config = SOURCE_CONFIG[item.source] || { label: item.source, icon: <Globe className="w-3 h-3" /> };
                    const percentage = ((item.count / stats.active) * 100).toFixed(1);
                    return (
                      <div key={item.source} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          {config.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{config.label}</span>
                            <span className="text-sm text-gray-500">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-primary h-1.5 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm">No data yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="bounced">Bounced</option>
              </select>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="blog">Blog</option>
                <option value="banner">Banner</option>
                <option value="website">Website</option>
                <option value="footer">Footer</option>
                <option value="import">Import</option>
                <option value="admin">Admin</option>
              </select>

              {/* Tag Filter */}
              <select
                value={tagFilter}
                onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name} ({tag.subscriberCount})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-primary/10 rounded-xl p-4 flex items-center justify-between">
              <span className="text-primary font-medium">
                {selectedIds.length} subscriber{selectedIds.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => bulkUnsubscribeMutation.mutate(selectedIds)}
                  disabled={bulkUnsubscribeMutation.isPending}
                  className="px-3 py-1.5 text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 flex items-center gap-1 text-sm"
                >
                  <UserMinus className="w-4 h-4" />
                  Unsubscribe
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${selectedIds.length} subscribers? This cannot be undone.`)) {
                      bulkDeleteMutation.mutate(selectedIds);
                    }
                  }}
                  disabled={bulkDeleteMutation.isPending}
                  className="px-3 py-1.5 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 flex items-center gap-1 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-1 text-sm"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Subscribers Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No subscribers found</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-primary hover:underline"
                >
                  Add your first subscriber
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="w-12 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.length === subscribers.length && subscribers.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subscriber
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Source
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          Tags
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Joined
                        </th>
                        <th className="w-12 px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {subscribers.map((subscriber) => {
                        const statusConfig = STATUS_CONFIG[subscriber.status] || STATUS_CONFIG.active;
                        const sourceConfig = SOURCE_CONFIG[subscriber.source] || { label: subscriber.source, icon: <Globe className="w-3 h-3" /> };
                        return (
                          <tr
                            key={subscriber.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedSubscriber(subscriber)}
                          >
                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(subscriber.id)}
                                onChange={() => handleSelect(subscriber.id)}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {subscriber.firstName || subscriber.lastName
                                    ? `${subscriber.firstName || ""} ${subscriber.lastName || ""}`.trim()
                                    : "—"}
                                </p>
                                <p className="text-sm text-gray-500">{subscriber.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4 hidden md:table-cell">
                              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                {sourceConfig.icon}
                                {sourceConfig.label}
                              </span>
                            </td>
                            <td className="px-4 py-4 hidden lg:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {subscriber.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{
                                      backgroundColor: `${tag.color}20`,
                                      color: tag.color,
                                    }}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                                {subscriber.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{subscriber.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                              >
                                {statusConfig.icon}
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell">
                              {formatDate(subscriber.subscribedAt)}
                            </td>
                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSubscriber(subscriber);
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                      disabled={page >= pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <AddSubscriberModal
          tags={tags}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/stats"] });
          }}
        />
      )}

      {/* Subscriber Detail Drawer */}
      {selectedSubscriber && (
        <SubscriberDrawer
          subscriber={selectedSubscriber}
          tags={tags}
          onClose={() => setSelectedSubscriber(null)}
          onDelete={() => {
            deleteMutation.mutate(selectedSubscriber.id);
            setSelectedSubscriber(null);
          }}
          onUnsubscribe={() => {
            unsubscribeMutation.mutate(selectedSubscriber.id);
            setSelectedSubscriber(null);
          }}
          onResubscribe={() => {
            resubscribeMutation.mutate(selectedSubscriber.id);
            setSelectedSubscriber(null);
          }}
        />
      )}

      {/* Tag Manager Modal */}
      {showTagManager && (
        <TagManagerModal
          tags={tags}
          onClose={() => setShowTagManager(false)}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          stats={stats}
          tags={tags}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          tags={tags}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/stats"] });
          }}
        />
      )}
    </div>
  );
}

// =============================================================================
// ADD SUBSCRIBER MODAL
// =============================================================================

function AddSubscriberModal({
  tags,
  onClose,
  onSuccess,
}: {
  tags: Tag[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    source: "admin",
    notes: "",
    tags: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add subscriber");
      }

      toast.success("Subscriber added successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add Subscriber</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="admin">Admin</option>
              <option value="import">Import</option>
              <option value="referral">Referral</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[44px]">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                    formData.tags.includes(tag.id)
                      ? ""
                      : "opacity-50"
                  }`}
                  style={{
                    backgroundColor: formData.tags.includes(tag.id) ? `${tag.color}20` : "#f3f4f6",
                    color: formData.tags.includes(tag.id) ? tag.color : "#6b7280",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, tags: [...formData.tags, tag.id] });
                      } else {
                        setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag.id) });
                      }
                    }}
                    className="sr-only"
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Any notes about this subscriber..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Subscriber"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// SUBSCRIBER DRAWER
// =============================================================================

function SubscriberDrawer({
  subscriber,
  tags,
  onClose,
  onDelete,
  onUnsubscribe,
  onResubscribe,
}: {
  subscriber: Subscriber;
  tags: Tag[];
  onClose: () => void;
  onDelete: () => void;
  onUnsubscribe: () => void;
  onResubscribe: () => void;
}) {
  const queryClient = useQueryClient();
  const [showTagSelector, setShowTagSelector] = useState(false);

  // Fetch subscriber details with activity
  const { data: detailData } = useQuery({
    queryKey: ["/api/admin/newsletter", subscriber.id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/newsletter/${subscriber.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch details");
      return res.json();
    },
  });

  const activity: SubscriberActivity[] = detailData?.activity || [];
  const subscriberTags = detailData?.subscriber?.tags || subscriber.tags;

  const addTagMutation = useMutation({
    mutationFn: async (tagIds: string[]) => {
      const res = await fetch(`/api/admin/newsletter/${subscriber.id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add tag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/tags"] });
      setShowTagSelector(false);
      toast.success("Tag added");
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const res = await fetch(`/api/admin/newsletter/${subscriber.id}/tags/${tagId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove tag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/tags"] });
      toast.success("Tag removed");
    },
  });

  const statusConfig = STATUS_CONFIG[subscriber.status] || STATUS_CONFIG.active;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "subscribed":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case "unsubscribed":
        return <UserMinus className="w-4 h-4 text-red-500" />;
      case "resubscribed":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case "tagged":
        return <Tag className="w-4 h-4 text-purple-500" />;
      case "untagged":
        return <Tag className="w-4 h-4 text-gray-400" />;
      case "updated":
        return <Activity className="w-4 h-4 text-amber-500" />;
      case "imported":
        return <Upload className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white h-full overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="font-semibold text-gray-900">
            {subscriber.firstName || subscriber.lastName
              ? `${subscriber.firstName || ""} ${subscriber.lastName || ""}`.trim()
              : "Subscriber Details"}
          </h2>
          <div className="w-7" />
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{subscriber.email}</span>
            </div>
            {subscriber.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{subscriber.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
              <span className="text-sm text-gray-500">
                since {formatDate(subscriber.subscribedAt)}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Tags</h3>
              <button
                onClick={() => setShowTagSelector(!showTagSelector)}
                className="text-sm text-primary hover:underline"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subscriberTags.length === 0 ? (
                <span className="text-sm text-gray-400">No tags</span>
              ) : (
                subscriberTags.map((tag: Tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                    <button
                      onClick={() => removeTagMutation.mutate(tag.id)}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
            {showTagSelector && (
              <div className="mt-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Select tags to add:</p>
                <div className="flex flex-wrap gap-2">
                  {tags
                    .filter((t) => !subscriberTags.some((st: Tag) => st.id === t.id))
                    .map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => addTagMutation.mutate([tag.id])}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium hover:opacity-80"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                        }}
                      >
                        + {tag.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Source</span>
                <span className="text-gray-900">{subscriber.source}</span>
              </div>
              {subscriber.landingPage && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Landing Page</span>
                  <span className="text-gray-900 truncate max-w-[200px]">{subscriber.landingPage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {subscriber.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{subscriber.notes}</p>
            </div>
          )}

          {/* Activity Timeline */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Activity</h3>
            <div className="space-y-3">
              {activity.length === 0 ? (
                <p className="text-sm text-gray-400">No activity recorded</p>
              ) : (
                activity.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{item.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            {subscriber.status === "active" ? (
              <button
                onClick={() => {
                  if (confirm("Unsubscribe this person?")) {
                    onUnsubscribe();
                  }
                }}
                className="w-full px-4 py-2 text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 flex items-center justify-center gap-2"
              >
                <UserMinus className="w-4 h-4" />
                Unsubscribe
              </button>
            ) : (
              <button
                onClick={onResubscribe}
                className="w-full px-4 py-2 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Resubscribe
              </button>
            )}
            <button
              onClick={() => {
                if (confirm("Delete this subscriber? This cannot be undone.")) {
                  onDelete();
                }
              }}
              className="w-full px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TAG MANAGER MODAL
// =============================================================================

function TagManagerModal({
  tags,
  onClose,
}: {
  tags: Tag[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [newTag, setNewTag] = useState({ name: "", color: "#6366f1", description: "" });
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; description: string }) => {
      const res = await fetch("/api/admin/newsletter/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create tag");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/tags"] });
      setNewTag({ name: "", color: "#6366f1", description: "" });
      toast.success("Tag created");
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; color: string; description?: string }) => {
      const res = await fetch(`/api/admin/newsletter/tags/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update tag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/tags"] });
      setEditingTag(null);
      toast.success("Tag updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/newsletter/tags/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete tag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/tags"] });
      toast.success("Tag deleted");
    },
  });

  const colorOptions = [
    "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#ef4444",
    "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#10b981",
    "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Manage Tags</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Create New Tag */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Create New Tag</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                placeholder="Tag name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewTag({ ...newTag, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newTag.color === color ? "border-gray-900" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button
                onClick={() => createMutation.mutate(newTag)}
                disabled={!newTag.name.trim() || createMutation.isPending}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Create Tag"}
              </button>
            </div>
          </div>

          {/* Existing Tags */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Existing Tags</h3>
            <div className="space-y-2">
              {tags.length === 0 ? (
                <p className="text-sm text-gray-400">No tags created yet</p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="font-medium text-gray-900">{tag.name}</span>
                      <span className="text-sm text-gray-500">
                        {tag.subscriberCount} subscribers
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingTag(tag)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete tag "${tag.name}"? It will be removed from all subscribers.`)) {
                            deleteMutation.mutate(tag.id);
                          }
                        }}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Tag Modal */}
      {editingTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Tag</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={editingTag.name}
                onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setEditingTag({ ...editingTag, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      editingTag.color === color ? "border-gray-900" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingTag(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateMutation.mutate(editingTag)}
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// EXPORT MODAL
// =============================================================================

function ExportModal({
  stats,
  tags,
  onClose,
}: {
  stats: Stats;
  tags: Tag[];
  onClose: () => void;
}) {
  const [status, setStatus] = useState("active");
  const [tagId, setTagId] = useState("");
  const [fields, setFields] = useState(["email", "first_name", "last_name", "status", "source", "subscribed_at"]);

  const allFields = [
    { key: "email", label: "Email" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "phone", label: "Phone" },
    { key: "status", label: "Status" },
    { key: "source", label: "Source" },
    { key: "subscribed_at", label: "Subscribed Date" },
    { key: "notes", label: "Notes" },
  ];

  const handleExport = () => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (tagId) params.set("tagId", tagId);
    params.set("fields", fields.join(","));

    window.open(`/api/admin/newsletter/export?${params}`, "_blank");
    onClose();
  };

  const toggleField = (key: string) => {
    if (key === "email") return; // Email is required
    if (fields.includes(key)) {
      setFields(fields.filter((f) => f !== key));
    } else {
      setFields([...fields, key]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Export Subscribers</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Subscribers</option>
              <option value="active">Active Only</option>
              <option value="unsubscribed">Unsubscribed Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Filter
            </label>
            <select
              value={tagId}
              onChange={(e) => setTagId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include Fields
            </label>
            <div className="grid grid-cols-2 gap-2">
              {allFields.map((field) => (
                <label
                  key={field.key}
                  className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={fields.includes(field.key)}
                    onChange={() => toggleField(field.key)}
                    disabled={field.key === "email"}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Preview: ~{status === "active" ? stats.active : status === "unsubscribed" ? stats.unsubscribed : stats.total} subscribers will be exported
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// IMPORT MODAL
// =============================================================================

function ImportModal({
  tags,
  onClose,
  onSuccess,
}: {
  tags: Tag[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"upload" | "map" | "options" | "result">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [options, setOptions] = useState({
    updateExisting: false,
    tagId: "",
  });
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    errors: number;
    errorDetails: any[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fieldOptions = [
    { key: "email", label: "Email" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "phone", label: "Phone" },
    { key: "", label: "Skip this column" },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").map((line) =>
        line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""))
      );

      if (lines.length > 0) {
        setHeaders(lines[0]);
        setCsvData(lines.slice(1).filter((row) => row.some((cell) => cell)));

        // Auto-map headers
        const autoMapping: Record<string, string> = {};
        lines[0].forEach((header, index) => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes("email")) autoMapping[index] = "email";
          else if (lowerHeader.includes("first") && lowerHeader.includes("name")) autoMapping[index] = "firstName";
          else if (lowerHeader.includes("last") && lowerHeader.includes("name")) autoMapping[index] = "lastName";
          else if (lowerHeader.includes("phone")) autoMapping[index] = "phone";
        });
        setMapping(autoMapping);
        setStep("map");
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    setIsImporting(true);

    // Transform CSV data based on mapping
    const subscribers = csvData.map((row) => {
      const sub: Record<string, string> = {};
      Object.entries(mapping).forEach(([colIndex, field]) => {
        if (field) {
          sub[field] = row[parseInt(colIndex)] || "";
        }
      });
      return sub;
    }).filter((sub) => sub.email); // Only include rows with email

    try {
      const res = await fetch("/api/admin/newsletter/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscribers,
          tagId: options.tagId || null,
          updateExisting: options.updateExisting,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Import failed");

      const data = await res.json();
      setResult(data);
      setStep("result");
    } catch (error) {
      toast.error("Failed to import subscribers");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Import Subscribers</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="text-center py-8">
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary transition-colors cursor-pointer"
                onClick={() => document.getElementById("csv-input")?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag & drop CSV file here</p>
                <p className="text-sm text-gray-400">or click to browse</p>
                <input
                  id="csv-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Supports .csv files with email, first name, last name, phone columns
              </p>
            </div>
          )}

          {/* Step 2: Map Columns */}
          {step === "map" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Map your CSV columns to subscriber fields. Found {csvData.length} rows.
              </p>

              <div className="space-y-3">
                {headers.map((header, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-1/3">
                      <span className="text-sm font-medium text-gray-700">{header}</span>
                      {csvData[0] && (
                        <p className="text-xs text-gray-400 truncate">e.g., {csvData[0][index]}</p>
                      )}
                    </div>
                    <span className="text-gray-400">→</span>
                    <select
                      value={mapping[index] || ""}
                      onChange={(e) => setMapping({ ...mapping, [index]: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    >
                      {fieldOptions.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {!Object.values(mapping).includes("email") && (
                <p className="text-sm text-red-500">
                  Email column is required. Please map a column to Email.
                </p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep("upload")}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("options")}
                  disabled={!Object.values(mapping).includes("email")}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Options */}
          {step === "options" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure import options for {csvData.length} subscribers.
              </p>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={options.updateExisting}
                  onChange={(e) => setOptions({ ...options, updateExisting: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Update existing subscribers</span>
                  <p className="text-xs text-gray-500">If email exists, update their details</p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add tag to imported subscribers
                </label>
                <select
                  value={options.tagId}
                  onChange={(e) => setOptions({ ...options, tagId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">No tag</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep("map")}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import {csvData.length} Subscribers
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Result */}
          {step === "result" && result && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Import Complete!</h3>

              <div className="grid grid-cols-3 gap-4 my-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                  <p className="text-sm text-green-700">Imported</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{result.skipped}</p>
                  <p className="text-sm text-amber-700">Skipped</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{result.errors}</p>
                  <p className="text-sm text-red-700">Errors</p>
                </div>
              </div>

              {result.errorDetails && result.errorDetails.length > 0 && (
                <div className="text-left mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Errors:</h4>
                  <div className="max-h-32 overflow-y-auto text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {result.errorDetails.map((err, i) => (
                      <p key={i}>Row: {err.row?.email || "unknown"} - {err.error}</p>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={onSuccess}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
