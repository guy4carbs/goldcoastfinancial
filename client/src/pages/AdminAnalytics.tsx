import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Mail,
  Briefcase,
  Eye,
  MousePointer,
  MapPin,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  Play,
  HelpCircle,
  Calculator,
  ExternalLink,
  UserX,
  ScrollText,
  UserCheck,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AdminNav from "@/components/AdminNav";

interface AnalyticsData {
  summary: {
    quotes: { total: number; today: number; thisWeek: number; thisMonth: number };
    contacts: { total: number; today: number; thisWeek: number; thisMonth: number };
    applications: { total: number };
    pageViews: { total: number; today: number; thisWeek: number; thisMonth: number };
  };
  coverageTypes: Record<string, number>;
  stateBreakdown: Record<string, number>;
  topPages: { page: string; count: number }[];
  eventStats: { eventName: string; count: number }[];
  trends: {
    quotes: { date: string; count: number }[];
    pageViews: { date: string; count: number }[];
  };
  recentQuotes: {
    id: number;
    name: string;
    coverageType: string;
    coverageAmount: string;
    state: string;
    createdAt: string;
  }[];
  recentContacts: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
  }[];
}

const COLORS = ["#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#8b5cf6", "#6d28d9", "#4c1d95"];

// Format large numbers with commas (e.g., 1234567 -> "1,234,567")
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

const formatCoverageType = (type: string): string => {
  const typeMap: Record<string, string> = {
    term: "Term Life",
    term_life: "Term Life",
    whole: "Whole Life",
    whole_life: "Whole Life",
    iul: "IUL",
    final_expense: "Final Expense",
    mortgage_protection: "Mortgage Protection",
    unsure: "Unsure",
  };
  return typeMap[type?.toLowerCase()] || type;
};

const formatEventName = (name: string): string => {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Group events by category for better display
const categorizeEvents = (events: { eventName: string; count: number }[]) => {
  const categories: Record<string, { eventName: string; count: number }[]> = {
    engagement: [],
    forms: [],
    products: [],
    content: [],
    agent: [],
    other: [],
  };

  events.forEach((event) => {
    const name = event.eventName.toLowerCase();
    if (name.includes("cta") || name.includes("phone") || name.includes("email") || name.includes("social") || name.includes("directions") || name.includes("external")) {
      categories.engagement.push(event);
    } else if (name.includes("form") || name.includes("quote") || name.includes("contact") || name.includes("application")) {
      categories.forms.push(event);
    } else if (name.includes("product")) {
      categories.products.push(event);
    } else if (name.includes("faq") || name.includes("video") || name.includes("calculator") || name.includes("scroll")) {
      categories.content.push(event);
    } else if (name.includes("agent")) {
      categories.agent.push(event);
    } else {
      categories.other.push(event);
    }
  });

  return categories;
};

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month" | "all">("month");
  const [activeTab, setActiveTab] = useState<"overview" | "engagement" | "conversions" | "content">("overview");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/overview");
      if (!res.ok) throw new Error("Failed to fetch");
      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTimeframeValue = (obj: { today: number; thisWeek: number; thisMonth: number; total: number }) => {
    switch (timeframe) {
      case "today": return obj.today;
      case "week": return obj.thisWeek;
      case "month": return obj.thisMonth;
      default: return obj.total;
    }
  };

  const getEventCount = (eventName: string): number => {
    return data?.eventStats.find((e) => e.eventName === eventName)?.count || 0;
  };

  const coverageTypeData = data?.coverageTypes
    ? Object.entries(data.coverageTypes).map(([name, value]) => ({
        name: formatCoverageType(name),
        value,
      }))
    : [];

  const stateData = data?.stateBreakdown
    ? Object.entries(data.stateBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([state, count]) => ({ state, count }))
    : [];

  const categorizedEvents = data?.eventStats ? categorizeEvents(data.eventStats) : null;

  // Product views data for chart
  const productViewsData = data?.eventStats
    .filter((e) => e.eventName === "product_viewed")
    .length
    ? [
        { name: "Term Life", value: getEventCount("product_viewed") },
      ]
    : [];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <AdminNav />

      <div className="flex-1 p-4 md:p-6 lg:p-8 pt-[72px] lg:pt-4 md:lg:pt-6 lg:!pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive tracking for your website</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={fetchData}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: "overview", label: "Overview" },
              { id: "engagement", label: "User Engagement" },
              { id: "conversions", label: "Conversions" },
              { id: "content", label: "Content & Agent" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading && !data ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : data ? (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <MetricCard
                      title="Page Views"
                      value={getTimeframeValue(data.summary.pageViews)}
                      total={data.summary.pageViews.total}
                      icon={Eye}
                      color="bg-blue-500"
                      trend={data.summary.pageViews.thisWeek > 0 ? "up" : "neutral"}
                    />
                    <MetricCard
                      title="Quote Requests"
                      value={getTimeframeValue(data.summary.quotes)}
                      total={data.summary.quotes.total}
                      icon={FileText}
                      color="bg-purple-500"
                      trend={data.summary.quotes.thisWeek > 0 ? "up" : "neutral"}
                    />
                    <MetricCard
                      title="Contact Messages"
                      value={getTimeframeValue(data.summary.contacts)}
                      total={data.summary.contacts.total}
                      icon={Mail}
                      color="bg-green-500"
                      trend={data.summary.contacts.thisWeek > 0 ? "up" : "neutral"}
                    />
                    <MetricCard
                      title="Job Applications"
                      value={data.summary.applications.total}
                      total={data.summary.applications.total}
                      icon={Briefcase}
                      color="bg-orange-500"
                      trend="neutral"
                    />
                  </div>

                  {/* Charts Row 1 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Quote Trends */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Requests Trend</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.trends.quotes}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 12 }}
                              tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              labelFormatter={(val) => new Date(val).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            />
                            <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Page Views Trend */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Views Trend</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.trends.pageViews}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 12 }}
                              tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              labelFormatter={(val) => new Date(val).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Charts Row 2 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Coverage Type Distribution */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Types</h3>
                      <div className="h-64">
                        {coverageTypeData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={coverageTypeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {coverageTypeData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-500">
                            No data yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top States */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top States</h3>
                      <div className="h-64">
                        {stateData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stateData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis type="number" tick={{ fontSize: 12 }} />
                              <YAxis dataKey="state" type="category" tick={{ fontSize: 12 }} width={40} />
                              <Tooltip />
                              <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-500">
                            No data yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Pages */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
                      <div className="space-y-3 overflow-y-auto max-h-64">
                        {data.topPages.length > 0 ? (
                          data.topPages.map((page, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 truncate max-w-[180px]" title={page.page}>
                                {page.page === "/" ? "Home" : page.page}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{formatNumber(page.count)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="h-32 flex items-center justify-center text-gray-500">
                            No data yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Quotes */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Quote Requests</h3>
                      <div className="space-y-4 max-h-80 overflow-y-auto">
                        {data.recentQuotes.length > 0 ? (
                          data.recentQuotes.map((quote) => (
                            <div key={quote.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{quote.name}</p>
                                <p className="text-sm text-gray-600">
                                  {formatCoverageType(quote.coverageType)} • {quote.coverageAmount}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {quote.state}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(quote.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="h-32 flex items-center justify-center text-gray-500">
                            No quotes yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Contacts */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Contact Messages</h3>
                      <div className="space-y-4 max-h-80 overflow-y-auto">
                        {data.recentContacts.length > 0 ? (
                          data.recentContacts.map((contact) => (
                            <div key={contact.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{contact.name}</p>
                                <p className="text-sm text-gray-600">{contact.email}</p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(contact.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="h-32 flex items-center justify-center text-gray-500">
                            No messages yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ENGAGEMENT TAB */}
              {activeTab === "engagement" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <EventMetricCard
                      title="CTA Clicks"
                      value={getEventCount("cta_clicked")}
                      icon={MousePointer}
                      color="bg-violet-500"
                      description="Button interactions"
                    />
                    <EventMetricCard
                      title="Phone Clicks"
                      value={getEventCount("phone_number_clicked")}
                      icon={Phone}
                      color="bg-green-500"
                      description="Call attempts"
                    />
                    <EventMetricCard
                      title="Email Clicks"
                      value={getEventCount("email_clicked")}
                      icon={Mail}
                      color="bg-blue-500"
                      description="Email link clicks"
                    />
                    <EventMetricCard
                      title="Social Clicks"
                      value={getEventCount("social_link_clicked")}
                      icon={ExternalLink}
                      color="bg-pink-500"
                      description="LinkedIn & social"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Engagement Events */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Breakdown</h3>
                      <div className="space-y-4">
                        {categorizedEvents?.engagement.length ? (
                          categorizedEvents.engagement.map((event, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-700">{formatEventName(event.eventName)}</span>
                              <span className="text-lg font-bold text-primary">{formatNumber(event.count)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="h-32 flex items-center justify-center text-gray-500">
                            No engagement data yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scroll Depth */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Scroll Depth</h3>
                      <div className="space-y-4">
                        {[25, 50, 75, 100].map((depth) => {
                          const scrollEvents = data.eventStats.filter(
                            (e) => e.eventName === "scroll_depth"
                          );
                          const count = scrollEvents.length > 0 ? scrollEvents[0].count : 0;
                          return (
                            <div key={depth} className="flex items-center gap-4">
                              <span className="text-sm text-gray-600 w-12">{depth}%</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-4">
                                <div
                                  className="bg-primary h-4 rounded-full transition-all"
                                  style={{ width: `${Math.min(100, (count / Math.max(1, data.summary.pageViews.total)) * 100 * (depth / 25))}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-16 text-right">
                                {formatNumber(getEventCount("scroll_depth"))}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        Shows how far users scroll down your pages
                      </p>
                    </div>
                  </div>

                  {/* Menu & Navigation */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Tracking</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{formatNumber(getEventCount("menu_opened"))}</p>
                        <p className="text-xs text-gray-600 mt-1">Menu Opens</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{formatNumber(getEventCount("directions_clicked"))}</p>
                        <p className="text-xs text-gray-600 mt-1">Directions Clicked</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{formatNumber(getEventCount("external_link_clicked"))}</p>
                        <p className="text-xs text-gray-600 mt-1">External Links</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{formatNumber(getEventCount("product_cta_clicked"))}</p>
                        <p className="text-xs text-gray-600 mt-1">Product CTAs</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* CONVERSIONS TAB */}
              {activeTab === "conversions" && (
                <>
                  {/* Conversion Funnel */}
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Form Funnel</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <FunnelStep
                        title="Started"
                        value={getEventCount("quote_form_started")}
                        icon={Target}
                        color="bg-blue-500"
                      />
                      <FunnelStep
                        title="Steps Completed"
                        value={getEventCount("quote_form_step_completed")}
                        icon={TrendingUp}
                        color="bg-yellow-500"
                      />
                      <FunnelStep
                        title="Submitted"
                        value={getEventCount("quote_form_submitted")}
                        icon={UserCheck}
                        color="bg-green-500"
                      />
                      <FunnelStep
                        title="Abandoned"
                        value={getEventCount("quote_form_abandoned")}
                        icon={UserX}
                        color="bg-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Contact Form Funnel */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Form</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600">{formatNumber(getEventCount("contact_form_started"))}</p>
                          <p className="text-xs text-gray-600 mt-1">Started</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600">{formatNumber(getEventCount("contact_form_submitted"))}</p>
                          <p className="text-xs text-gray-600 mt-1">Submitted</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-red-600">{formatNumber(getEventCount("contact_form_abandoned"))}</p>
                          <p className="text-xs text-gray-600 mt-1">Abandoned</p>
                        </div>
                      </div>
                    </div>

                    {/* Job Application Funnel */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Applications</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600">{formatNumber(getEventCount("job_application_started"))}</p>
                          <p className="text-xs text-gray-600 mt-1">Started</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600">{formatNumber(getEventCount("job_application_submitted"))}</p>
                          <p className="text-xs text-gray-600 mt-1">Submitted</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-red-600">{formatNumber(getEventCount("job_application_abandoned"))}</p>
                          <p className="text-xs text-gray-600 mt-1">Abandoned</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Interest */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Interest</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-purple-600">{formatNumber(getEventCount("product_viewed"))}</p>
                        <p className="text-xs text-gray-600 mt-1">Product Views</p>
                      </div>
                      <div className="p-4 bg-violet-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-violet-600">{formatNumber(coverageTypeData.find(c => c.name === "Term Life")?.value || 0)}</p>
                        <p className="text-xs text-gray-600 mt-1">Term Life Quotes</p>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-indigo-600">{formatNumber(coverageTypeData.find(c => c.name === "Whole Life")?.value || 0)}</p>
                        <p className="text-xs text-gray-600 mt-1">Whole Life Quotes</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600">{formatNumber(coverageTypeData.find(c => c.name === "IUL")?.value || 0)}</p>
                        <p className="text-xs text-gray-600 mt-1">IUL Quotes</p>
                      </div>
                      <div className="p-4 bg-cyan-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-cyan-600">{formatNumber(coverageTypeData.find(c => c.name === "Final Expense")?.value || 0)}</p>
                        <p className="text-xs text-gray-600 mt-1">Final Expense</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* CONTENT & AGENT TAB */}
              {activeTab === "content" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <EventMetricCard
                      title="FAQ Interactions"
                      value={getEventCount("faq_expanded")}
                      icon={HelpCircle}
                      color="bg-amber-500"
                      description="Questions expanded"
                    />
                    <EventMetricCard
                      title="Video Plays"
                      value={getEventCount("video_played")}
                      icon={Play}
                      color="bg-red-500"
                      description="Videos watched"
                    />
                    <EventMetricCard
                      title="Calculator Usage"
                      value={getEventCount("calculator_used")}
                      icon={Calculator}
                      color="bg-teal-500"
                      description="Calculator interactions"
                    />
                    <EventMetricCard
                      title="Calc Results Viewed"
                      value={getEventCount("calculator_result_viewed")}
                      icon={BarChart3}
                      color="bg-emerald-500"
                      description="Results displayed"
                    />
                  </div>

                  {/* Agent Portal Activity */}
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Portal Activity</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{formatNumber(getEventCount("agent_login"))}</p>
                        <p className="text-xs text-gray-600 mt-1">Agent Logins</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{formatNumber(getEventCount("agent_lead_viewed"))}</p>
                        <p className="text-xs text-gray-600 mt-1">Leads Viewed</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{formatNumber(getEventCount("agent_lead_status_changed"))}</p>
                        <p className="text-xs text-gray-600 mt-1">Status Changes</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{formatNumber(getEventCount("agent_pipeline_updated"))}</p>
                        <p className="text-xs text-gray-600 mt-1">Pipeline Updates</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{formatNumber(getEventCount("agent_training_started"))}</p>
                        <p className="text-xs text-gray-600 mt-1">Training Started</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{formatNumber(getEventCount("agent_training_completed"))}</p>
                        <p className="text-xs text-gray-600 mt-1">Training Completed</p>
                      </div>
                    </div>
                  </div>

                  {/* All Events */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">All Tracked Events</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {data.eventStats.length > 0 ? (
                        data.eventStats.map((event, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-2xl font-bold text-primary">{formatNumber(event.count)}</p>
                            <p className="text-xs text-gray-600 mt-1 truncate" title={formatEventName(event.eventName)}>
                              {formatEventName(event.eventName)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full h-32 flex items-center justify-center text-gray-500">
                          No events tracked yet. Browse the site to generate data.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Failed to load analytics data. Please refresh the page.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  total,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: number;
  total: number;
  icon: React.ElementType;
  color: string;
  trend: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} rounded-lg p-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend === "up" && <ArrowUpRight className="w-5 h-5 text-green-500" />}
        {trend === "down" && <ArrowDownRight className="w-5 h-5 text-red-500" />}
      </div>
      <p className="text-3xl font-bold text-gray-900">{formatNumber(value)}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{formatNumber(total)} total</p>
    </div>
  );
}

function EventMetricCard({
  title,
  value,
  icon: Icon,
  color,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} rounded-lg p-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{formatNumber(value)}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  );
}

function FunnelStep({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="relative">
      <div className="bg-white border-2 border-gray-100 rounded-xl p-4 text-center">
        <div className={`${color} rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
        <p className="text-xs text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  );
}
