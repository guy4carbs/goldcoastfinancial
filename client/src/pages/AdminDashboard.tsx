import { useState, useEffect } from "react";
import {
  Image,
  Video,
  Package,
  BarChart3,
  Inbox,
  FileText,
  Users,
  Mail,
  Briefcase,
  Settings,
  Star,
  ArrowRight,
} from "lucide-react";
import AdminNav from "@/components/AdminNav";

interface DashboardStats {
  totalImages: number;
  totalProducts: number;
  quoteRequestsThisMonth: number;
  totalQuoteRequests: number;
  totalContactMessages: number;
  totalJobApplications: number;
  // Testimonials stats
  pendingTestimonials: number;
  totalTestimonials: number;
  // Blog stats
  publishedPosts: number;
  draftPosts: number;
  // Newsletter stats
  newsletterTotal: number;
  newsletterActive: number;
  newsletterThisMonth: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalImages: 0,
    totalProducts: 12,
    quoteRequestsThisMonth: 0,
    totalQuoteRequests: 0,
    totalContactMessages: 0,
    totalJobApplications: 0,
    pendingTestimonials: 0,
    totalTestimonials: 0,
    publishedPosts: 0,
    draftPosts: 0,
    newsletterTotal: 0,
    newsletterActive: 0,
    newsletterThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all data in parallel
        const [quotesRes, contactsRes, applicationsRes, dashboardRes, newsletterRes] = await Promise.all([
          fetch("/api/quote-requests"),
          fetch("/api/contact-messages"),
          fetch("/api/job-applications"),
          fetch("/api/admin/dashboard-stats", { credentials: "include" }),
          fetch("/api/admin/newsletter/stats", { credentials: "include" }),
        ]);

        const quotes = await quotesRes.json();
        const contacts = await contactsRes.json();
        const applications = await applicationsRes.json();
        const dashboardStats = dashboardRes.ok ? await dashboardRes.json() : {};
        const newsletterStats = newsletterRes.ok ? await newsletterRes.json() : {};

        // Calculate quotes this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const quotesThisMonth = quotes.filter((q: { createdAt: string }) => {
          const createdAt = new Date(q.createdAt);
          return createdAt >= startOfMonth;
        });

        setStats({
          totalImages: 0,
          totalProducts: 12,
          quoteRequestsThisMonth: quotesThisMonth.length,
          totalQuoteRequests: quotes.length,
          totalContactMessages: contacts.length,
          totalJobApplications: applications.length,
          pendingTestimonials: dashboardStats.testimonials?.pending || 0,
          totalTestimonials: dashboardStats.testimonials?.total || 0,
          publishedPosts: dashboardStats.content?.publishedPosts || 0,
          draftPosts: dashboardStats.content?.draftPosts || 0,
          newsletterTotal: newsletterStats.stats?.total || 0,
          newsletterActive: newsletterStats.stats?.active || 0,
          newsletterThisMonth: newsletterStats.stats?.thisMonth || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const tools = [
    {
      title: "Settings",
      description: "Configure site settings, contact info, and branding",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-slate-500",
    },
    {
      title: "Testimonials",
      description: "Manage customer reviews and testimonials",
      icon: Star,
      href: "/admin/testimonials",
      color: "bg-amber-500",
      badge: stats.pendingTestimonials > 0 ? `${stats.pendingTestimonials} pending` : undefined,
    },
    {
      title: "Image Manager",
      description: "Upload and manage images for the website",
      icon: Image,
      href: "/admin/images",
      color: "bg-blue-500",
    },
    {
      title: "Video Manager",
      description: "Upload and manage videos for the website",
      icon: Video,
      href: "/admin/videos",
      color: "bg-red-500",
    },
    {
      title: "Products",
      description: "Manage life insurance products and personas",
      icon: Package,
      href: "/admin/products",
      color: "bg-purple-500",
    },
    {
      title: "Analytics",
      description: "View website traffic and conversion metrics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "bg-green-500",
    },
    {
      title: "Submissions",
      description: "Manage quote requests, contacts, and applications",
      icon: Inbox,
      href: "/admin/submissions",
      color: "bg-orange-500",
    },
    {
      title: "Content",
      description: "Edit pages, blog posts, and FAQs",
      icon: FileText,
      href: "/admin/content",
      color: "bg-pink-500",
      badge: stats.draftPosts > 0 ? `${stats.draftPosts} drafts` : undefined,
    },
    {
      title: "Newsletter",
      description: "Manage subscribers, tags, and exports",
      icon: Mail,
      href: "/admin/newsletter",
      color: "bg-violet-500",
      badge: stats.newsletterThisMonth > 0 ? `+${stats.newsletterThisMonth} new` : undefined,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <AdminNav />

      <div className="flex-1 p-4 md:p-6 lg:p-8 pt-[72px] lg:pt-4 md:lg:pt-6 lg:!pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">Manage your Heritage Life Solutions website</p>
          </div>

          {/* Alerts / Action Items */}
          {stats.pendingTestimonials > 0 && (
            <div className="mb-6 space-y-3">
              <a
                href="/admin/testimonials"
                className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Star className="w-5 h-5 text-blue-600" />
                <span className="flex-1 text-blue-800">
                  <strong>{stats.pendingTestimonials}</strong> testimonial{stats.pendingTestimonials !== 1 ? "s" : ""} pending review
                </span>
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </a>
            </div>
          )}

          {/* Submissions Stats */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-orange-500" />
              Submissions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Quote Requests</h3>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats.quoteRequestsThisMonth}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This month ({loading ? "..." : stats.totalQuoteRequests} total)
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Contact Messages</h3>
                  <Mail className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalContactMessages}
                </p>
                <p className="text-sm text-gray-500 mt-1">Total messages</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Job Applications</h3>
                  <Briefcase className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalJobApplications}
                </p>
                <p className="text-sm text-gray-500 mt-1">Total applications</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Testimonials</h3>
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalTestimonials}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {loading ? "..." : stats.pendingTestimonials} pending review
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter Stats */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-violet-500" />
              Newsletter
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Subscribers</h3>
                  <Users className="w-5 h-5 text-violet-500" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats.newsletterTotal.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {loading ? "..." : stats.newsletterActive.toLocaleString()} active
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">New This Month</h3>
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {loading ? "..." : `+${stats.newsletterThisMonth}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">Subscribers gained</p>
              </div>

              <a
                href="/admin/newsletter"
                className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg shadow-sm p-4 text-white hover:from-violet-600 hover:to-purple-700 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white/90">Manage</h3>
                  <ArrowRight className="w-5 h-5" />
                </div>
                <p className="text-lg font-semibold">Newsletter Dashboard</p>
                <p className="text-sm text-white/80 mt-1">View all subscribers</p>
              </a>
            </div>
          </div>

          {/* Admin Tools Grid */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Admin Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {tools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <a
                    key={tool.title}
                    href={tool.href}
                    className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow group relative"
                  >
                    {tool.badge && (
                      <span className="absolute top-3 right-3 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        {tool.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`${tool.color} rounded-lg p-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{tool.title}</h3>
                    </div>
                    <p className="text-gray-600">{tool.description}</p>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 md:mt-8 bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <a
                href="/admin/testimonials"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50/50 transition-colors"
              >
                <Star className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-semibold text-gray-900">Add Testimonial</p>
                  <p className="text-sm text-gray-600">New customer review</p>
                </div>
              </a>

              <a
                href="/admin/settings"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-slate-500 hover:bg-slate-50/50 transition-colors"
              >
                <Settings className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="font-semibold text-gray-900">Site Settings</p>
                  <p className="text-sm text-gray-600">Update config</p>
                </div>
              </a>

              <a
                href="/admin/submissions"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50/50 transition-colors"
              >
                <Inbox className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-semibold text-gray-900">View Submissions</p>
                  <p className="text-sm text-gray-600">Quotes & contacts</p>
                </div>
              </a>

              <a
                href="/admin/newsletter"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-violet-500 hover:bg-violet-50/50 transition-colors"
              >
                <Mail className="w-5 h-5 text-violet-500" />
                <div>
                  <p className="font-semibold text-gray-900">Newsletter</p>
                  <p className="text-sm text-gray-600">Manage subscribers</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
