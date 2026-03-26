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
import { motion } from "framer-motion";
import { AdminPageHero, AdminGlassCard, AdminStaggerContainer, ADMIN_GRADIENT } from "@/components/admin/AdminHeritagePrimitives";
import { GLASS, RADIUS, SHADOW, MOTION, TYPE, GRID, COLORS, fadeInUp, staggerContainer } from "@/lib/heritageDesignSystem";
import { AdminLoungeLayout } from "./admin/AdminLoungeLayout";

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

const CHART_COLORS = ["#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#8b5cf6", "#6d28d9", "#4c1d95"];

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
    <AdminLoungeLayout breadcrumbs={[{ label: 'Analytics' }]}>
      <AdminStaggerContainer>
        {/* Hero Header */}
        <AdminPageHero
          icon={BarChart3}
          title="Analytics Dashboard"
          subtitle="Comprehensive tracking for your website"
          actions={
            <>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: RADIUS.input,
                  border: '1px solid rgba(255,255,255,0.25)',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontSize: TYPE.meta,
                  backdropFilter: 'blur(12px)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="today" style={{ color: COLORS.gray[900] }}>Today</option>
                <option value="week" style={{ color: COLORS.gray[900] }}>This Week</option>
                <option value="month" style={{ color: COLORS.gray[900] }}>This Month</option>
                <option value="all" style={{ color: COLORS.gray[900] }}>All Time</option>
              </select>
              <button
                onClick={fetchData}
                style={{
                  padding: 10,
                  borderRadius: RADIUS.input,
                  border: '1px solid rgba(255,255,255,0.25)',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RefreshCw className={`w-5 h-5 text-white ${loading ? "animate-spin" : ""}`} />
              </button>
            </>
          }
        />

        {/* Tab Bar */}
        <motion.div
          variants={fadeInUp}
          style={{
            ...GLASS.css.standard,
            borderRadius: RADIUS.pill,
            padding: 6,
            display: 'flex',
            gap: 4,
            overflowX: 'auto',
          }}
        >
          {[
            { id: "overview", label: "Overview" },
            { id: "engagement", label: "User Engagement" },
            { id: "conversions", label: "Conversions" },
            { id: "content", label: "Content & Agent" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 20px',
                borderRadius: RADIUS.pill,
                fontWeight: 600,
                fontSize: TYPE.meta,
                whiteSpace: 'nowrap',
                border: 'none',
                cursor: 'pointer',
                transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                background: activeTab === tab.id ? ADMIN_GRADIENT : 'transparent',
                color: activeTab === tab.id ? 'white' : COLORS.gray[600],
                boxShadow: activeTab === tab.id ? SHADOW.level2 : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {loading && !data ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: COLORS.primary.violet[600] }} />
          </div>
        ) : data ? (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <>
                {/* Key Metrics */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
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
                </motion.div>

                {/* Charts Row 1 */}
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Quote Trends */}
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Quote Requests Trend</h3>
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
                  </AdminGlassCard>

                  {/* Page Views Trend */}
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Page Views Trend</h3>
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
                  </AdminGlassCard>
                </motion.div>

                {/* Charts Row 2 */}
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Coverage Type Distribution */}
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Coverage Types</h3>
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
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center" style={{ color: COLORS.gray[500], fontSize: TYPE.meta }}>
                          No data yet
                        </div>
                      )}
                    </div>
                  </AdminGlassCard>

                  {/* Top States */}
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Top States</h3>
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
                        <div className="h-full flex items-center justify-center" style={{ color: COLORS.gray[500], fontSize: TYPE.meta }}>
                          No data yet
                        </div>
                      )}
                    </div>
                  </AdminGlassCard>

                  {/* Top Pages */}
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Top Pages</h3>
                    <div className="space-y-3 overflow-y-auto max-h-64">
                      {data.topPages.length > 0 ? (
                        data.topPages.map((page, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span style={{ fontSize: TYPE.meta, color: COLORS.gray[600] }} className="truncate max-w-[180px]" title={page.page}>
                              {page.page === "/" ? "Home" : page.page}
                            </span>
                            <span style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>{formatNumber(page.count)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="h-32 flex items-center justify-center" style={{ color: COLORS.gray[500], fontSize: TYPE.meta }}>
                          No data yet
                        </div>
                      )}
                    </div>
                  </AdminGlassCard>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Recent Quotes */}
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Recent Quote Requests</h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {data.recentQuotes.length > 0 ? (
                        data.recentQuotes.map((quote) => (
                          <div
                            key={quote.id}
                            className="flex items-start justify-between p-3"
                            style={{
                              background: COLORS.gray[50],
                              borderRadius: RADIUS.input,
                            }}
                          >
                            <div>
                              <p style={{ fontWeight: 600, color: COLORS.gray[900], fontSize: TYPE.body }}>{quote.name}</p>
                              <p style={{ fontSize: TYPE.meta, color: COLORS.gray[600] }}>
                                {formatCoverageType(quote.coverageType)} • {quote.coverageAmount}
                              </p>
                              <p className="flex items-center gap-1 mt-1" style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>
                                <MapPin className="w-3 h-3" />
                                {quote.state}
                              </p>
                            </div>
                            <span style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>
                              {new Date(quote.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="h-32 flex items-center justify-center" style={{ color: COLORS.gray[500], fontSize: TYPE.meta }}>
                          No quotes yet
                        </div>
                      )}
                    </div>
                  </AdminGlassCard>

                  {/* Recent Contacts */}
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Recent Contact Messages</h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {data.recentContacts.length > 0 ? (
                        data.recentContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-start justify-between p-3"
                            style={{
                              background: COLORS.gray[50],
                              borderRadius: RADIUS.input,
                            }}
                          >
                            <div>
                              <p style={{ fontWeight: 600, color: COLORS.gray[900], fontSize: TYPE.body }}>{contact.name}</p>
                              <p style={{ fontSize: TYPE.meta, color: COLORS.gray[600] }}>{contact.email}</p>
                            </div>
                            <span style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="h-32 flex items-center justify-center" style={{ color: COLORS.gray[500], fontSize: TYPE.meta }}>
                          No messages yet
                        </div>
                      )}
                    </div>
                  </AdminGlassCard>
                </motion.div>
              </>
            )}

            {/* ENGAGEMENT TAB */}
            {activeTab === "engagement" && (
              <>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
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
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Engagement Events */}
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Engagement Breakdown</h3>
                    <div className="space-y-4">
                      {categorizedEvents?.engagement.length ? (
                        categorizedEvents.engagement.map((event, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3"
                            style={{
                              background: COLORS.gray[50],
                              borderRadius: RADIUS.input,
                            }}
                          >
                            <span style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>{formatEventName(event.eventName)}</span>
                            <span style={{ fontSize: TYPE.title, fontWeight: 700, color: COLORS.primary.violet[600] }}>{formatNumber(event.count)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="h-32 flex items-center justify-center" style={{ color: COLORS.gray[500], fontSize: TYPE.meta }}>
                          No engagement data yet
                        </div>
                      )}
                    </div>
                  </AdminGlassCard>

                  {/* Scroll Depth */}
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Scroll Depth</h3>
                    <div className="space-y-4">
                      {[25, 50, 75, 100].map((depth) => {
                        const scrollEvents = data.eventStats.filter(
                          (e) => e.eventName === "scroll_depth"
                        );
                        const count = scrollEvents.length > 0 ? scrollEvents[0].count : 0;
                        return (
                          <div key={depth} className="flex items-center gap-4">
                            <span style={{ fontSize: TYPE.meta, color: COLORS.gray[600], width: 48 }}>{depth}%</span>
                            <div className="flex-1 h-4" style={{ background: COLORS.gray[200], borderRadius: RADIUS.pill }}>
                              <div
                                style={{
                                  width: `${Math.min(100, (count / Math.max(1, data.summary.pageViews.total)) * 100 * (depth / 25))}%`,
                                  height: '100%',
                                  borderRadius: RADIUS.pill,
                                  background: COLORS.primary.violet[600],
                                  transition: `width ${MOTION.duration.transition}s ${MOTION.easingCSS}`,
                                }}
                              />
                            </div>
                            <span style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900], width: 64, textAlign: 'right' }}>
                              {formatNumber(getEventCount("scroll_depth"))}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500], marginTop: GRID.spacing.sm }}>
                      Shows how far users scroll down your pages
                    </p>
                  </AdminGlassCard>
                </motion.div>

                {/* Menu & Navigation */}
                <AdminGlassCard>
                  <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Navigation Tracking</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Menu Opens", event: "menu_opened" },
                      { label: "Directions Clicked", event: "directions_clicked" },
                      { label: "External Links", event: "external_link_clicked" },
                      { label: "Product CTAs", event: "product_cta_clicked" },
                    ].map((item) => (
                      <div
                        key={item.event}
                        className="p-4 text-center"
                        style={{
                          background: COLORS.gray[50],
                          borderRadius: RADIUS.input,
                        }}
                      >
                        <p style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.primary.violet[600] }}>{formatNumber(getEventCount(item.event))}</p>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[600], marginTop: 4 }}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                </AdminGlassCard>
              </>
            )}

            {/* CONVERSIONS TAB */}
            {activeTab === "conversions" && (
              <>
                {/* Conversion Funnel */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Quote Form Funnel</h3>
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
                  </AdminGlassCard>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Contact Form Funnel */}
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Contact Form</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 text-center" style={{ background: '#eff6ff', borderRadius: RADIUS.input }}>
                        <p style={{ fontSize: TYPE.section, fontWeight: 700, color: '#2563eb' }}>{formatNumber(getEventCount("contact_form_started"))}</p>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[600], marginTop: 4 }}>Started</p>
                      </div>
                      <div className="p-4 text-center" style={{ background: '#ecfdf5', borderRadius: RADIUS.input }}>
                        <p style={{ fontSize: TYPE.section, fontWeight: 700, color: '#16a34a' }}>{formatNumber(getEventCount("contact_form_submitted"))}</p>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[600], marginTop: 4 }}>Submitted</p>
                      </div>
                      <div className="p-4 text-center" style={{ background: '#fef2f2', borderRadius: RADIUS.input }}>
                        <p style={{ fontSize: TYPE.section, fontWeight: 700, color: '#dc2626' }}>{formatNumber(getEventCount("contact_form_abandoned"))}</p>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[600], marginTop: 4 }}>Abandoned</p>
                      </div>
                    </div>
                  </AdminGlassCard>

                  {/* Job Application Funnel */}
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Job Applications</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 text-center" style={{ background: '#eff6ff', borderRadius: RADIUS.input }}>
                        <p style={{ fontSize: TYPE.section, fontWeight: 700, color: '#2563eb' }}>{formatNumber(getEventCount("job_application_started"))}</p>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[600], marginTop: 4 }}>Started</p>
                      </div>
                      <div className="p-4 text-center" style={{ background: '#ecfdf5', borderRadius: RADIUS.input }}>
                        <p style={{ fontSize: TYPE.section, fontWeight: 700, color: '#16a34a' }}>{formatNumber(getEventCount("job_application_submitted"))}</p>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[600], marginTop: 4 }}>Submitted</p>
                      </div>
                      <div className="p-4 text-center" style={{ background: '#fef2f2', borderRadius: RADIUS.input }}>
                        <p style={{ fontSize: TYPE.section, fontWeight: 700, color: '#dc2626' }}>{formatNumber(getEventCount("job_application_abandoned"))}</p>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[600], marginTop: 4 }}>Abandoned</p>
                      </div>
                    </div>
                  </AdminGlassCard>
                </motion.div>

                {/* Product Interest */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Product Interest</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {[
                        { label: "Product Views", value: getEventCount("product_viewed"), bg: '#faf5ff', color: '#9333ea' },
                        { label: "Term Life Quotes", value: coverageTypeData.find(c => c.name === "Term Life")?.value || 0, bg: '#f5f3ff', color: '#7c3aed' },
                        { label: "Whole Life Quotes", value: coverageTypeData.find(c => c.name === "Whole Life")?.value || 0, bg: '#eef2ff', color: '#4f46e5' },
                        { label: "IUL Quotes", value: coverageTypeData.find(c => c.name === "IUL")?.value || 0, bg: '#eff6ff', color: '#2563eb' },
                        { label: "Final Expense", value: coverageTypeData.find(c => c.name === "Final Expense")?.value || 0, bg: '#ecfeff', color: '#0891b2' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="p-4 text-center"
                          style={{
                            background: item.bg,
                            borderRadius: RADIUS.input,
                          }}
                        >
                          <p style={{ fontSize: TYPE.section, fontWeight: 700, color: item.color }}>{formatNumber(item.value)}</p>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[600], marginTop: 4 }}>{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </AdminGlassCard>
                </motion.div>
              </>
            )}

            {/* CONTENT & AGENT TAB */}
            {activeTab === "content" && (
              <>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
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
                </motion.div>

                {/* Agent Portal Activity */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Agent Portal Activity</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {[
                        { label: "Agent Logins", event: "agent_login" },
                        { label: "Leads Viewed", event: "agent_lead_viewed" },
                        { label: "Status Changes", event: "agent_lead_status_changed" },
                        { label: "Pipeline Updates", event: "agent_pipeline_updated" },
                        { label: "Training Started", event: "agent_training_started" },
                        { label: "Training Completed", event: "agent_training_completed" },
                      ].map((item) => (
                        <div
                          key={item.event}
                          className="p-4 text-center"
                          style={{
                            background: COLORS.gray[50],
                            borderRadius: RADIUS.input,
                          }}
                        >
                          <p style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.primary.violet[600] }}>{formatNumber(getEventCount(item.event))}</p>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[600], marginTop: 4 }}>{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </AdminGlassCard>
                </motion.div>

                {/* All Events */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                  <AdminGlassCard>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>All Tracked Events</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {data.eventStats.length > 0 ? (
                        data.eventStats.map((event, idx) => (
                          <div
                            key={idx}
                            className="p-4 text-center"
                            style={{
                              background: COLORS.gray[50],
                              borderRadius: RADIUS.input,
                            }}
                          >
                            <p style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.primary.violet[600] }}>{formatNumber(event.count)}</p>
                            <p className="truncate" title={formatEventName(event.eventName)} style={{ fontSize: TYPE.micro, color: COLORS.gray[600], marginTop: 4 }}>
                              {formatEventName(event.eventName)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full h-32 flex items-center justify-center" style={{ color: COLORS.gray[500], fontSize: TYPE.meta }}>
                          No events tracked yet. Browse the site to generate data.
                        </div>
                      )}
                    </div>
                  </AdminGlassCard>
                </motion.div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-12" style={{ color: COLORS.gray[500], fontSize: TYPE.body }}>
            Failed to load analytics data. Please refresh the page.
          </div>
        )}
      </AdminStaggerContainer>
    </AdminLoungeLayout>
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
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
      style={{
        ...GLASS.css.standard,
        borderRadius: RADIUS.card,
        padding: GRID.spacing.md,
        boxShadow: SHADOW.card,
        cursor: 'default',
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
        <div className={`${color} p-3`} style={{ borderRadius: RADIUS.input }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend === "up" && <ArrowUpRight className="w-5 h-5" style={{ color: COLORS.semantic.success }} />}
        {trend === "down" && <ArrowDownRight className="w-5 h-5" style={{ color: COLORS.semantic.error }} />}
      </div>
      <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: COLORS.gray[900] }}>{formatNumber(value)}</p>
      <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500], marginTop: 4 }}>{title}</p>
      <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400], marginTop: 4 }}>{formatNumber(total)} total</p>
    </motion.div>
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
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
      style={{
        ...GLASS.css.standard,
        borderRadius: RADIUS.card,
        padding: GRID.spacing.md,
        boxShadow: SHADOW.card,
        cursor: 'default',
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
        <div className={`${color} p-3`} style={{ borderRadius: RADIUS.input }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: COLORS.gray[900] }}>{formatNumber(value)}</p>
      <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500], marginTop: 4 }}>{title}</p>
      <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400], marginTop: 4 }}>{description}</p>
    </motion.div>
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
      <div
        className="p-4 text-center"
        style={{
          ...GLASS.css.standard,
          borderRadius: RADIUS.card,
          border: `2px solid ${COLORS.gray[100]}`,
        }}
      >
        <div className={`${color} rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.gray[900] }}>{formatNumber(value)}</p>
        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[600], marginTop: 4 }}>{title}</p>
      </div>
    </div>
  );
}
