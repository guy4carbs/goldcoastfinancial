import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  LayoutDashboard,
} from "lucide-react";
import { AdminLoungeLayout } from "./admin/AdminLoungeLayout";
import {
  GLASS,
  RADIUS,
  SHADOW,
  MOTION,
  TYPE,
  GRID,
  COLORS,
  fadeInUp,
  staggerContainer,
} from "@/lib/heritageDesignSystem";

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
    <AdminLoungeLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <motion.div
        className="max-w-7xl mx-auto space-y-6 md:space-y-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div
          variants={fadeInUp}
          style={{
            background: 'linear-gradient(135deg, #475569 0%, #334155 50%, #64748b 100%)',
            borderRadius: RADIUS.hero,
            padding: `${GRID.spacing.xl}px`,
            boxShadow: SHADOW.hero,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative elements */}
          <div
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -20,
              left: '40%',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
            }}
          />
          <div className="relative z-10 flex items-center gap-4">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: RADIUS.button,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 style={{ fontSize: TYPE.hero, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                Admin Dashboard
              </h1>
              <p style={{ fontSize: TYPE.body, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
                Manage your Heritage Life Solutions website
              </p>
            </div>
          </div>
        </motion.div>

        {/* Alerts / Action Items */}
        {stats.pendingTestimonials > 0 && (
          <motion.div variants={fadeInUp}>
            <a
              href="/admin/testimonials"
              className="flex items-center gap-3 p-4 hover:opacity-90 transition-opacity"
              style={{
                ...GLASS.css.standard,
                borderRadius: RADIUS.card,
                borderLeft: '4px solid #64748b',
              }}
            >
              <Star className="w-5 h-5 text-slate-600" />
              <span className="flex-1 text-gray-800">
                <strong>{stats.pendingTestimonials}</strong> testimonial{stats.pendingTestimonials !== 1 ? "s" : ""} pending review
              </span>
              <ArrowRight className="w-5 h-5 text-slate-500" />
            </a>
          </motion.div>
        )}

        {/* Submissions Stats */}
        <motion.div variants={fadeInUp}>
          <h2 className="flex items-center gap-2 mb-4" style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900] }}>
            <Inbox className="w-5 h-5 text-slate-500" />
            Submissions
          </h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { label: 'Quote Requests', value: loading ? '...' : stats.quoteRequestsThisMonth, sub: `This month (${loading ? '...' : stats.totalQuoteRequests} total)`, icon: Users, iconColor: 'text-blue-500' },
              { label: 'Contact Messages', value: loading ? '...' : stats.totalContactMessages, sub: 'Total messages', icon: Mail, iconColor: 'text-emerald-500' },
              { label: 'Job Applications', value: loading ? '...' : stats.totalJobApplications, sub: 'Total applications', icon: Briefcase, iconColor: 'text-purple-500' },
              { label: 'Testimonials', value: loading ? '...' : stats.totalTestimonials, sub: `${loading ? '...' : stats.pendingTestimonials} pending review`, icon: Star, iconColor: 'text-amber-500' },
            ].map((card) => {
              const CardIcon = card.icon;
              return (
                <motion.div
                  key={card.label}
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
                  <div className="flex items-center justify-between mb-2">
                    <h3 style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>{card.label}</h3>
                    <CardIcon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: COLORS.gray[900] }}>
                    {card.value}
                  </p>
                  <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 4 }}>
                    {card.sub}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Newsletter Stats */}
        <motion.div variants={fadeInUp}>
          <h2 className="flex items-center gap-2 mb-4" style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900] }}>
            <Mail className="w-5 h-5 text-violet-500" />
            Newsletter
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
              style={{
                ...GLASS.css.standard,
                borderRadius: RADIUS.card,
                padding: GRID.spacing.md,
                boxShadow: SHADOW.card,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Total Subscribers</h3>
                <Users className="w-5 h-5 text-violet-500" />
              </div>
              <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: COLORS.gray[900] }}>
                {loading ? "..." : stats.newsletterTotal.toLocaleString()}
              </p>
              <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 4 }}>
                {loading ? "..." : stats.newsletterActive.toLocaleString()} active
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
              style={{
                ...GLASS.css.standard,
                borderRadius: RADIUS.card,
                padding: GRID.spacing.md,
                boxShadow: SHADOW.card,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>New This Month</h3>
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: COLORS.gray[900] }}>
                {loading ? "..." : `+${stats.newsletterThisMonth}`}
              </p>
              <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 4 }}>Subscribers gained</p>
            </motion.div>

            <motion.a
              href="/admin/newsletter"
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
              style={{
                background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                borderRadius: RADIUS.card,
                padding: GRID.spacing.md,
                boxShadow: SHADOW.card,
                color: 'white',
                display: 'block',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 style={{ fontSize: TYPE.meta, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>Manage</h3>
                <ArrowRight className="w-5 h-5" />
              </div>
              <p style={{ fontSize: TYPE.title, fontWeight: 600 }}>Newsletter Dashboard</p>
              <p style={{ fontSize: TYPE.caption, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>View all subscribers</p>
            </motion.a>
          </div>
        </motion.div>

        {/* Admin Tools Grid */}
        <motion.div variants={fadeInUp}>
          <h2 className="mb-4 md:mb-6" style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.gray[900] }}>
            Admin Tools
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.a
                  key={tool.title}
                  href={tool.href}
                  variants={fadeInUp}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                  className="relative group"
                  style={{
                    ...GLASS.css.standard,
                    borderRadius: RADIUS.card,
                    padding: GRID.spacing.md,
                    boxShadow: SHADOW.card,
                    display: 'block',
                  }}
                >
                  {tool.badge && (
                    <span
                      className="absolute top-3 right-3 px-2 py-1 text-xs font-medium"
                      style={{
                        background: COLORS.lounges.admin.light,
                        color: COLORS.lounges.admin.dark,
                        borderRadius: RADIUS.pill,
                      }}
                    >
                      {tool.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`${tool.color} group-hover:scale-110 transition-transform`}
                      style={{
                        borderRadius: RADIUS.button,
                        padding: 12,
                      }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900] }}>{tool.title}</h3>
                  </div>
                  <p style={{ fontSize: TYPE.body, color: COLORS.gray[600] }}>{tool.description}</p>
                </motion.a>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={fadeInUp}
          style={{
            ...GLASS.css.standard,
            borderRadius: RADIUS.card,
            padding: GRID.spacing.md,
            boxShadow: SHADOW.card,
          }}
        >
          <h2 className="mb-4" style={{ fontSize: TYPE.title, fontWeight: 700, color: COLORS.gray[900] }}>Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { href: '/admin/testimonials', icon: Star, iconColor: 'text-amber-500', borderColor: '#f59e0b', title: 'Add Testimonial', sub: 'New customer review' },
              { href: '/admin/settings', icon: Settings, iconColor: 'text-slate-500', borderColor: '#64748b', title: 'Site Settings', sub: 'Update config' },
              { href: '/admin/submissions', icon: Inbox, iconColor: 'text-orange-500', borderColor: '#f97316', title: 'View Submissions', sub: 'Quotes & contacts' },
              { href: '/admin/newsletter', icon: Mail, iconColor: 'text-violet-500', borderColor: '#8b5cf6', title: 'Newsletter', sub: 'Manage subscribers' },
            ].map((action) => {
              const ActionIcon = action.icon;
              return (
                <a
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-3 p-4 transition-all hover:opacity-80"
                  style={{
                    border: `1px solid ${COLORS.gray[200]}`,
                    borderRadius: RADIUS.button,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = action.borderColor;
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.gray[200];
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <ActionIcon className={`w-5 h-5 ${action.iconColor}`} />
                  <div>
                    <p style={{ fontWeight: 600, color: COLORS.gray[900], fontSize: TYPE.body }}>
                      {action.title}
                    </p>
                    <p style={{ fontSize: TYPE.caption, color: COLORS.gray[600] }}>{action.sub}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AdminLoungeLayout>
  );
}
