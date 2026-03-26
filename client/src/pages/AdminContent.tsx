import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  FileText,
  HelpCircle,
  Layout,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Clock,
  RefreshCw,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminPageHero, AdminGlassCard, AdminStaggerContainer, AdminEmptyState, ADMIN_GRADIENT } from "@/components/admin/AdminHeritagePrimitives";
import { GLASS, RADIUS, SHADOW, MOTION, TYPE, GRID as HGRID, COLORS, fadeInUp, staggerContainer } from "@/lib/heritageDesignSystem";
import { AdminLoungeLayout } from "./admin/AdminLoungeLayout";
import ContentStatusBadge from "@/components/admin/ContentStatusBadge";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  featuredImage: string;
  status: "draft" | "scheduled" | "published" | "archived";
  publishedAt: string | null;
  scheduledAt: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  status: "draft" | "published";
  createdAt: string;
}

interface Page {
  id: string;
  slug: string;
  title: string;
  pageType: string;
  parentPage: string;
  status: "draft" | "published";
  createdAt: string;
}

interface ContentStats {
  blogPosts: { draft: number; scheduled: number; published: number; archived: number; total: number };
  faqs: { draft: number; published: number; total: number };
  pages: { draft: number; published: number; total: number };
}

type ContentTab = "blog" | "faqs" | "pages";

const BLOG_CATEGORIES = [
  { value: "term", label: "Term Life" },
  { value: "whole", label: "Whole Life" },
  { value: "retirement", label: "Retirement" },
  { value: "family", label: "Family" },
  { value: "savings", label: "Savings" },
  { value: "news", label: "News" },
];

const FAQ_CATEGORIES = [
  { value: "basics", label: "Life Insurance Basics" },
  { value: "types", label: "Types of Coverage" },
  { value: "cost", label: "Cost & Pricing" },
  { value: "coverage", label: "Coverage Details" },
  { value: "health", label: "Health Questions" },
  { value: "process", label: "Application Process" },
  { value: "beneficiaries", label: "Beneficiaries" },
  { value: "claims", label: "Claims" },
];

export default function AdminContent() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<ContentTab>("blog");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ContentStats | null>(null);

  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogSearch, setBlogSearch] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState<string>("");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState<string>("");
  const [blogViewMode, setBlogViewMode] = useState<"grid" | "list">("list");

  // FAQ state
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>("");

  // Pages state
  const [pages, setPages] = useState<Page[]>([]);
  const [pageParentFilter, setPageParentFilter] = useState<string>("");

  // Fetch stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch content based on active tab
  useEffect(() => {
    if (activeTab === "blog") {
      fetchBlogPosts();
    } else if (activeTab === "faqs") {
      fetchFaqs();
    } else if (activeTab === "pages") {
      fetchPages();
    }
  }, [activeTab, blogStatusFilter, blogCategoryFilter, faqCategoryFilter, pageParentFilter]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/content/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (blogStatusFilter) params.append("status", blogStatusFilter);
      if (blogCategoryFilter) params.append("category", blogCategoryFilter);
      if (blogSearch) params.append("search", blogSearch);

      const res = await fetch(`/api/admin/content/blog-posts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBlogPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (faqCategoryFilter) params.append("category", faqCategoryFilter);

      const res = await fetch(`/api/admin/content/faqs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pageParentFilter) params.append("parentPage", pageParentFilter);

      const res = await fetch(`/api/admin/content/pages?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (!confirm("Are you sure you want to archive this post?")) return;

    try {
      const res = await fetch(`/api/admin/content/blog-posts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchBlogPosts();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handlePublishBlogPost = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/content/blog-posts/${id}/publish`, {
        method: "POST",
      });
      if (res.ok) {
        fetchBlogPosts();
        fetchStats();
      }
    } catch (error) {
      console.error("Error publishing post:", error);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const res = await fetch(`/api/admin/content/faqs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchFaqs();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "\u2014";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const tabs = [
    { id: "blog" as ContentTab, label: "Blog Posts", icon: FileText, count: stats?.blogPosts.total || 0 },
    { id: "faqs" as ContentTab, label: "FAQs", icon: HelpCircle, count: stats?.faqs.total || 0 },
    { id: "pages" as ContentTab, label: "Pages", icon: Layout, count: stats?.pages.total || 0 },
  ];

  return (
    <AdminLoungeLayout breadcrumbs={[{ label: 'Content' }]}>
      <AdminStaggerContainer>
        {/* Hero Header */}
        <AdminPageHero
          icon={FileText}
          title="Content Management"
          subtitle="Manage your blog posts, FAQs, and page content"
          actions={
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (activeTab === "blog") setLocation("/admin/content/blog/new");
                else if (activeTab === "faqs") setLocation("/admin/content/faqs/new");
                else if (activeTab === "pages") setLocation("/admin/content/pages/new");
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(12px)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: RADIUS.button,
                fontWeight: 600,
                fontSize: TYPE.meta,
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'pointer',
              }}
            >
              <Plus className="w-5 h-5" />
              {activeTab === "blog" ? "New Post" : activeTab === "faqs" ? "New FAQ" : "New Page"}
            </motion.button>
          }
        />

        {/* Stats Cards */}
        {stats && (
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
              style={{
                ...GLASS.css.standard,
                borderRadius: RADIUS.card,
                padding: HGRID.spacing.md,
                boxShadow: SHADOW.card,
              }}
            >
              <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Published</p>
              <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: COLORS.semantic.success }}>
                {activeTab === "blog" ? stats.blogPosts.published :
                 activeTab === "faqs" ? stats.faqs.published : stats.pages.published}
              </p>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
              style={{
                ...GLASS.css.standard,
                borderRadius: RADIUS.card,
                padding: HGRID.spacing.md,
                boxShadow: SHADOW.card,
              }}
            >
              <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Drafts</p>
              <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: COLORS.semantic.warning }}>
                {activeTab === "blog" ? stats.blogPosts.draft :
                 activeTab === "faqs" ? stats.faqs.draft : stats.pages.draft}
              </p>
            </motion.div>
            {activeTab === "blog" && (
              <>
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                  style={{
                    ...GLASS.css.standard,
                    borderRadius: RADIUS.card,
                    padding: HGRID.spacing.md,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Scheduled</p>
                  <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: COLORS.semantic.info }}>
                    {stats.blogPosts.scheduled}
                  </p>
                </motion.div>
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                  style={{
                    ...GLASS.css.standard,
                    borderRadius: RADIUS.card,
                    padding: HGRID.spacing.md,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Archived</p>
                  <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: COLORS.gray[500] }}>
                    {stats.blogPosts.archived}
                  </p>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* Tabs Card */}
        <AdminGlassCard style={{ padding: 0, overflow: 'hidden' }}>
          <div
            className="flex"
            style={{ borderBottom: `1px solid ${GLASS.border}` }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '14px 16px',
                    fontWeight: 600,
                    fontSize: TYPE.meta,
                    color: isActive ? COLORS.lounges.admin.dark : COLORS.gray[500],
                    background: isActive ? 'rgba(71,85,105,0.06)' : 'transparent',
                    borderBottom: isActive ? `2px solid ${COLORS.lounges.admin.dark}` : '2px solid transparent',
                    cursor: 'pointer',
                    transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                    border: 'none',
                    borderBottomWidth: 2,
                    borderBottomStyle: 'solid' as const,
                    borderBottomColor: isActive ? COLORS.lounges.admin.dark : 'transparent',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span
                    style={{
                      fontSize: TYPE.micro,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: RADIUS.pill,
                      background: isActive ? COLORS.lounges.admin.dark : COLORS.gray[200],
                      color: isActive ? 'white' : COLORS.gray[600],
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div style={{ padding: HGRID.spacing.md }}>
            {/* Blog Posts Tab */}
            {activeTab === "blog" && (
              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: COLORS.gray[400] }} />
                    <input
                      type="text"
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchBlogPosts()}
                      placeholder="Search posts..."
                      style={{
                        width: '100%',
                        paddingLeft: 40,
                        paddingRight: 16,
                        paddingTop: 10,
                        paddingBottom: 10,
                        border: `1px solid ${COLORS.gray[200]}`,
                        borderRadius: RADIUS.input,
                        fontSize: TYPE.meta,
                        color: COLORS.gray[900],
                        outline: 'none',
                      }}
                    />
                  </div>
                  <select
                    value={blogStatusFilter}
                    onChange={(e) => setBlogStatusFilter(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      border: `1px solid ${COLORS.gray[200]}`,
                      borderRadius: RADIUS.input,
                      fontSize: TYPE.meta,
                      color: COLORS.gray[700],
                      background: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <select
                    value={blogCategoryFilter}
                    onChange={(e) => setBlogCategoryFilter(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      border: `1px solid ${COLORS.gray[200]}`,
                      borderRadius: RADIUS.input,
                      fontSize: TYPE.meta,
                      color: COLORS.gray[700],
                      background: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">All Categories</option>
                    {BLOG_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setBlogViewMode("list")}
                      style={{
                        padding: 8,
                        borderRadius: RADIUS.input,
                        background: blogViewMode === "list" ? COLORS.gray[100] : 'transparent',
                        color: blogViewMode === "list" ? COLORS.gray[900] : COLORS.gray[400],
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <List className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setBlogViewMode("grid")}
                      style={{
                        padding: 8,
                        borderRadius: RADIUS.input,
                        background: blogViewMode === "grid" ? COLORS.gray[100] : 'transparent',
                        color: blogViewMode === "grid" ? COLORS.gray[900] : COLORS.gray[400],
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Blog Posts List */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin" style={{ color: COLORS.lounges.admin.main }} />
                  </div>
                ) : blogPosts.length === 0 ? (
                  <AdminEmptyState
                    icon={FileText}
                    title="No blog posts found"
                    description="Create your first blog post to get started"
                    action={
                      <button
                        onClick={() => setLocation("/admin/content/blog/new")}
                        style={{
                          color: COLORS.lounges.admin.dark,
                          fontWeight: 600,
                          fontSize: TYPE.meta,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Create your first post
                      </button>
                    }
                  />
                ) : blogViewMode === "list" ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[600] }}>Title</th>
                          <th className="hidden md:table-cell" style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[600] }}>Category</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[600] }}>Status</th>
                          <th className="hidden lg:table-cell" style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[600] }}>Date</th>
                          <th className="hidden lg:table-cell" style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[600] }}>Views</th>
                          <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[600] }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogPosts.map((post) => (
                          <tr
                            key={post.id}
                            className="group"
                            style={{
                              borderBottom: `1px solid ${COLORS.gray[100]}`,
                              transition: `background ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <td style={{ padding: '12px 16px' }}>
                              <div className="flex items-center gap-3">
                                {post.featuredImage && (
                                  <img
                                    src={post.featuredImage}
                                    alt=""
                                    className="hidden sm:block"
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: RADIUS.input,
                                      objectFit: 'cover',
                                    }}
                                  />
                                )}
                                <div>
                                  <p className="line-clamp-1" style={{ fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[900] }}>{post.title}</p>
                                  <p className="line-clamp-1" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{post.excerpt}</p>
                                </div>
                              </div>
                            </td>
                            <td className="hidden md:table-cell" style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: TYPE.caption, color: COLORS.gray[600], textTransform: 'capitalize' }}>{post.category}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <ContentStatusBadge status={post.status} />
                            </td>
                            <td className="hidden lg:table-cell" style={{ padding: '12px 16px', fontSize: TYPE.caption, color: COLORS.gray[600] }}>
                              {formatDate(post.publishedAt || post.createdAt)}
                            </td>
                            <td className="hidden lg:table-cell" style={{ padding: '12px 16px', fontSize: TYPE.caption, color: COLORS.gray[600] }}>
                              {post.viewCount.toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => window.open(`/resources/blog/${post.slug}`, "_blank")}
                                  style={{
                                    padding: 6,
                                    borderRadius: RADIUS.input,
                                    color: COLORS.gray[500],
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: `all ${MOTION.duration.hover}s`,
                                  }}
                                  title="Preview"
                                  onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.gray[700]; e.currentTarget.style.background = COLORS.gray[100]; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.gray[500]; e.currentTarget.style.background = 'none'; }}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setLocation(`/admin/content/blog/${post.id}`)}
                                  style={{
                                    padding: 6,
                                    borderRadius: RADIUS.input,
                                    color: COLORS.gray[500],
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: `all ${MOTION.duration.hover}s`,
                                  }}
                                  title="Edit"
                                  onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.lounges.admin.dark; e.currentTarget.style.background = COLORS.gray[100]; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.gray[500]; e.currentTarget.style.background = 'none'; }}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {post.status === "draft" && (
                                  <button
                                    onClick={() => handlePublishBlogPost(post.id)}
                                    style={{
                                      padding: 6,
                                      borderRadius: RADIUS.input,
                                      color: COLORS.gray[500],
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      transition: `all ${MOTION.duration.hover}s`,
                                    }}
                                    title="Publish"
                                    onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.semantic.success; e.currentTarget.style.background = COLORS.gray[100]; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.gray[500]; e.currentTarget.style.background = 'none'; }}
                                  >
                                    <Calendar className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteBlogPost(post.id)}
                                  style={{
                                    padding: 6,
                                    borderRadius: RADIUS.input,
                                    color: COLORS.gray[500],
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: `all ${MOTION.duration.hover}s`,
                                  }}
                                  title="Archive"
                                  onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.semantic.error; e.currentTarget.style.background = COLORS.gray[100]; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.gray[500]; e.currentTarget.style.background = 'none'; }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {blogPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        variants={fadeInUp}
                        whileHover={{ y: -4, scale: 1.01 }}
                        transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                        style={{
                          ...GLASS.css.standard,
                          borderRadius: RADIUS.card,
                          overflow: 'hidden',
                          boxShadow: SHADOW.card,
                          cursor: 'pointer',
                        }}
                      >
                        {post.featuredImage && (
                          <img
                            src={post.featuredImage}
                            alt=""
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div style={{ padding: HGRID.spacing.md }}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="line-clamp-2" style={{ fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[900] }}>{post.title}</h3>
                            <ContentStatusBadge status={post.status} showIcon={false} />
                          </div>
                          <p className="line-clamp-2 mb-3" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{post.excerpt}</p>
                          <div className="flex items-center justify-between" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                            <span style={{ textTransform: 'capitalize' }}>{post.category}</span>
                            <span>{post.viewCount} views</span>
                          </div>
                          <div
                            className="flex gap-2 mt-3 pt-3"
                            style={{ borderTop: `1px solid ${COLORS.gray[100]}` }}
                          >
                            <button
                              onClick={() => setLocation(`/admin/content/blog/${post.id}`)}
                              style={{
                                flex: 1,
                                textAlign: 'center',
                                padding: '6px 0',
                                color: COLORS.lounges.admin.dark,
                                fontWeight: 600,
                                fontSize: TYPE.caption,
                                borderRadius: RADIUS.input,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: `background ${MOTION.duration.hover}s`,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(71,85,105,0.06)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => window.open(`/resources/blog/${post.slug}`, "_blank")}
                              style={{
                                flex: 1,
                                textAlign: 'center',
                                padding: '6px 0',
                                color: COLORS.gray[600],
                                fontWeight: 600,
                                fontSize: TYPE.caption,
                                borderRadius: RADIUS.input,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: `background ${MOTION.duration.hover}s`,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.gray[100])}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                            >
                              Preview
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* FAQs Tab */}
            {activeTab === "faqs" && (
              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <select
                    value={faqCategoryFilter}
                    onChange={(e) => setFaqCategoryFilter(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      border: `1px solid ${COLORS.gray[200]}`,
                      borderRadius: RADIUS.input,
                      fontSize: TYPE.meta,
                      color: COLORS.gray[700],
                      background: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">All Categories</option>
                    {FAQ_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* FAQs List */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin" style={{ color: COLORS.lounges.admin.main }} />
                  </div>
                ) : faqs.length === 0 ? (
                  <AdminEmptyState
                    icon={HelpCircle}
                    title="No FAQs found"
                    description="Create your first FAQ to help your clients"
                    action={
                      <button
                        onClick={() => setLocation("/admin/content/faqs/new")}
                        style={{
                          color: COLORS.lounges.admin.dark,
                          fontWeight: 600,
                          fontSize: TYPE.meta,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Create your first FAQ
                      </button>
                    }
                  />
                ) : (
                  <div className="space-y-2">
                    {faqs.map((faq) => (
                      <motion.div
                        key={faq.id}
                        variants={fadeInUp}
                        whileHover={{ y: -2, scale: 1.005 }}
                        transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                        className="flex items-start gap-3"
                        style={{
                          padding: HGRID.spacing.md,
                          background: COLORS.gray[50],
                          borderRadius: RADIUS.card,
                          border: `1px solid ${COLORS.gray[100]}`,
                          transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                        }}
                      >
                        <GripVertical className="w-5 h-5 mt-0.5 cursor-grab" style={{ color: COLORS.gray[400] }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p style={{ fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[900] }}>{faq.question}</p>
                              <p className="line-clamp-2 mt-1" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{faq.answer.replace(/<[^>]*>/g, "")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                style={{
                                  fontSize: TYPE.micro,
                                  fontWeight: 600,
                                  padding: '3px 10px',
                                  borderRadius: RADIUS.pill,
                                  background: COLORS.gray[200],
                                  color: COLORS.gray[600],
                                  textTransform: 'capitalize',
                                }}
                              >
                                {faq.category}
                              </span>
                              <ContentStatusBadge status={faq.status} showIcon={false} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setLocation(`/admin/content/faqs/${faq.id}`)}
                            style={{
                              padding: 6,
                              borderRadius: RADIUS.input,
                              color: COLORS.gray[500],
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              transition: `all ${MOTION.duration.hover}s`,
                            }}
                            title="Edit"
                            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.lounges.admin.dark; e.currentTarget.style.background = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.gray[500]; e.currentTarget.style.background = 'none'; }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(faq.id)}
                            style={{
                              padding: 6,
                              borderRadius: RADIUS.input,
                              color: COLORS.gray[500],
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              transition: `all ${MOTION.duration.hover}s`,
                            }}
                            title="Delete"
                            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.semantic.error; e.currentTarget.style.background = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.gray[500]; e.currentTarget.style.background = 'none'; }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Pages Tab */}
            {activeTab === "pages" && (
              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <select
                    value={pageParentFilter}
                    onChange={(e) => setPageParentFilter(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      border: `1px solid ${COLORS.gray[200]}`,
                      borderRadius: RADIUS.input,
                      fontSize: TYPE.meta,
                      color: COLORS.gray[700],
                      background: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">All Pages</option>
                    <option value="about">About</option>
                    <option value="contact">Contact</option>
                    <option value="products">Products</option>
                    <option value="resources">Resources</option>
                  </select>
                </div>

                {/* Pages List */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin" style={{ color: COLORS.lounges.admin.main }} />
                  </div>
                ) : pages.length === 0 ? (
                  <AdminEmptyState
                    icon={Layout}
                    title="No pages found"
                    description="Create your first page to get started"
                    action={
                      <button
                        onClick={() => setLocation("/admin/content/pages/new")}
                        style={{
                          color: COLORS.lounges.admin.dark,
                          fontWeight: 600,
                          fontSize: TYPE.meta,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Create your first page
                      </button>
                    }
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[600] }}>Title</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[600] }}>Slug</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[600] }}>Type</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[600] }}>Parent</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[600] }}>Status</th>
                          <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[600] }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pages.map((page) => (
                          <tr
                            key={page.id}
                            style={{
                              borderBottom: `1px solid ${COLORS.gray[100]}`,
                              transition: `background ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[900] }}>{page.title}</td>
                            <td style={{ padding: '12px 16px', fontSize: TYPE.caption, color: COLORS.gray[500], fontFamily: 'monospace' }}>{page.slug}</td>
                            <td style={{ padding: '12px 16px', fontSize: TYPE.caption, color: COLORS.gray[600], textTransform: 'capitalize' }}>{page.pageType}</td>
                            <td style={{ padding: '12px 16px', fontSize: TYPE.caption, color: COLORS.gray[600], textTransform: 'capitalize' }}>{page.parentPage || "\u2014"}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <ContentStatusBadge status={page.status} />
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setLocation(`/admin/content/pages/${page.id}`)}
                                  style={{
                                    padding: 6,
                                    borderRadius: RADIUS.input,
                                    color: COLORS.gray[500],
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: `all ${MOTION.duration.hover}s`,
                                  }}
                                  title="Edit"
                                  onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.lounges.admin.dark; e.currentTarget.style.background = COLORS.gray[100]; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.gray[500]; e.currentTarget.style.background = 'none'; }}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </AdminGlassCard>
      </AdminStaggerContainer>
    </AdminLoungeLayout>
  );
}
