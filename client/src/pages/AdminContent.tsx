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
import AdminNav from "@/components/AdminNav";
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
    if (!dateStr) return "—";
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <AdminNav />

      <div className="flex-1 p-4 md:p-6 lg:p-8 pt-[72px] lg:pt-4 md:lg:pt-6 lg:!pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Content Management</h1>
              <p className="text-gray-600">Manage your blog posts, FAQs, and page content</p>
            </div>
            <button
              onClick={() => {
                if (activeTab === "blog") setLocation("/admin/content/blog/new");
                else if (activeTab === "faqs") setLocation("/admin/content/faqs/new");
                else if (activeTab === "pages") setLocation("/admin/content/pages/new");
              }}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              {activeTab === "blog" ? "New Post" : activeTab === "faqs" ? "New FAQ" : "New Page"}
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeTab === "blog" ? stats.blogPosts.published :
                   activeTab === "faqs" ? stats.faqs.published : stats.pages.published}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {activeTab === "blog" ? stats.blogPosts.draft :
                   activeTab === "faqs" ? stats.faqs.draft : stats.pages.draft}
                </p>
              </div>
              {activeTab === "blog" && (
                <>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Scheduled</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.blogPosts.scheduled}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Archived</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.blogPosts.archived}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                      activeTab === tab.id
                        ? "text-primary border-b-2 border-primary bg-primary/5"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {/* Blog Posts Tab */}
              {activeTab === "blog" && (
                <>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={blogSearch}
                        onChange={(e) => setBlogSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchBlogPosts()}
                        placeholder="Search posts..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <select
                      value={blogStatusFilter}
                      onChange={(e) => setBlogStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {BLOG_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setBlogViewMode("list")}
                        className={`p-2 rounded ${blogViewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setBlogViewMode("grid")}
                        className={`p-2 rounded ${blogViewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                      >
                        <Grid className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Blog Posts List */}
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : blogPosts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No blog posts found</p>
                      <button
                        onClick={() => setLocation("/admin/content/blog/new")}
                        className="mt-4 text-primary hover:underline"
                      >
                        Create your first post
                      </button>
                    </div>
                  ) : blogViewMode === "list" ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Title</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">Category</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 hidden lg:table-cell">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 hidden lg:table-cell">Views</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {blogPosts.map((post) => (
                            <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  {post.featuredImage && (
                                    <img
                                      src={post.featuredImage}
                                      alt=""
                                      className="w-10 h-10 rounded object-cover hidden sm:block"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                                    <p className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 hidden md:table-cell">
                                <span className="capitalize text-sm text-gray-600">{post.category}</span>
                              </td>
                              <td className="py-3 px-4">
                                <ContentStatusBadge status={post.status} />
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 hidden lg:table-cell">
                                {formatDate(post.publishedAt || post.createdAt)}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 hidden lg:table-cell">
                                {post.viewCount.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => window.open(`/resources/blog/${post.slug}`, "_blank")}
                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                    title="Preview"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setLocation(`/admin/content/blog/${post.id}`)}
                                    className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  {post.status === "draft" && (
                                    <button
                                      onClick={() => handlePublishBlogPost(post.id)}
                                      className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded"
                                      title="Publish"
                                    >
                                      <Calendar className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteBlogPost(post.id)}
                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                                    title="Archive"
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
                        <div key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          {post.featuredImage && (
                            <img
                              src={post.featuredImage}
                              alt=""
                              className="w-full h-40 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                              <ContentStatusBadge status={post.status} showIcon={false} />
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span className="capitalize">{post.category}</span>
                              <span>{post.viewCount} views</span>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => setLocation(`/admin/content/blog/${post.id}`)}
                                className="flex-1 text-center py-1.5 text-primary hover:bg-primary/5 rounded font-medium text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => window.open(`/resources/blog/${post.slug}`, "_blank")}
                                className="flex-1 text-center py-1.5 text-gray-600 hover:bg-gray-100 rounded font-medium text-sm"
                              >
                                Preview
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* FAQs Tab */}
              {activeTab === "faqs" && (
                <>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <select
                      value={faqCategoryFilter}
                      onChange={(e) => setFaqCategoryFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : faqs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No FAQs found</p>
                      <button
                        onClick={() => setLocation("/admin/content/faqs/new")}
                        className="mt-4 text-primary hover:underline"
                      >
                        Create your first FAQ
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {faqs.map((faq) => (
                        <div
                          key={faq.id}
                          className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <GripVertical className="w-5 h-5 text-gray-400 mt-0.5 cursor-grab" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900">{faq.question}</p>
                                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{faq.answer.replace(/<[^>]*>/g, "")}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded capitalize">
                                  {faq.category}
                                </span>
                                <ContentStatusBadge status={faq.status} showIcon={false} />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setLocation(`/admin/content/faqs/${faq.id}`)}
                              className="p-1.5 text-gray-500 hover:text-primary hover:bg-white rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFaq(faq.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Pages Tab */}
              {activeTab === "pages" && (
                <>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <select
                      value={pageParentFilter}
                      onChange={(e) => setPageParentFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : pages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No pages found</p>
                      <button
                        onClick={() => setLocation("/admin/content/pages/new")}
                        className="mt-4 text-primary hover:underline"
                      >
                        Create your first page
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Title</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Slug</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Parent</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pages.map((page) => (
                            <tr key={page.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">{page.title}</td>
                              <td className="py-3 px-4 text-sm text-gray-500 font-mono">{page.slug}</td>
                              <td className="py-3 px-4 capitalize text-sm text-gray-600">{page.pageType}</td>
                              <td className="py-3 px-4 capitalize text-sm text-gray-600">{page.parentPage || "—"}</td>
                              <td className="py-3 px-4">
                                <ContentStatusBadge status={page.status} />
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setLocation(`/admin/content/pages/${page.id}`)}
                                    className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded"
                                    title="Edit"
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
