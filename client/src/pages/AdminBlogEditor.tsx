import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Eye,
  Clock,
  Calendar,
  Image as ImageIcon,
  Settings,
  History,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  X,
  FileText,
} from "lucide-react";
import { AdminLoungeLayout } from "./admin/AdminLoungeLayout";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ContentStatusBadge from "@/components/admin/ContentStatusBadge";
import {
  AdminPageHero,
  AdminGlassCard,
  AdminStaggerContainer,
  AdminGlassToolbar,
} from "@/components/admin/AdminHeritagePrimitives";
import { RADIUS, TYPE, COLORS, fadeInUp } from "@/lib/heritageDesignSystem";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  featuredImage: string | null;
  readTimeMinutes: number;
  isFeatured: boolean;
  status: "draft" | "scheduled" | "published" | "archived";
  publishedAt: string | null;
  scheduledAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Revision {
  id: string;
  revisionNumber: number;
  title: string | null;
  content: string;
  changeDescription: string | null;
  createdAt: string;
}

const CATEGORIES = [
  { value: "term", label: "Term Life" },
  { value: "whole", label: "Whole Life" },
  { value: "retirement", label: "Retirement" },
  { value: "family", label: "Family" },
  { value: "savings", label: "Savings" },
  { value: "news", label: "News" },
];

export default function AdminBlogEditor() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const postId = params.id;
  const isNew = postId === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showSEO, setShowSEO] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("term");
  const [author, setAuthor] = useState("Heritage Team");
  const [featuredImage, setFeaturedImage] = useState("");
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">("draft");
  const [scheduledAt, setScheduledAt] = useState("");

  // SEO fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");

  // Fetch post data if editing
  useEffect(() => {
    if (!isNew && postId) {
      fetchPost();
    }
  }, [postId, isNew]);

  // Auto-generate slug from title
  useEffect(() => {
    if (isNew && title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, isNew]);

  // Auto-calculate read time
  useEffect(() => {
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    setReadTimeMinutes(minutes);
  }, [content]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/admin/content/blog-posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        const post: BlogPost = data.post;
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt || "");
        setContent(post.content);
        setCategory(post.category);
        setAuthor(post.author);
        setFeaturedImage(post.featuredImage || "");
        setReadTimeMinutes(post.readTimeMinutes);
        setIsFeatured(post.isFeatured);
        setStatus(post.status === "archived" ? "draft" : post.status);
        setScheduledAt(post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : "");
        setMetaTitle(post.metaTitle || "");
        setMetaDescription(post.metaDescription || "");
        setMetaKeywords(post.metaKeywords || "");
        setOgImage(post.ogImage || "");
        setRevisions(data.revisions || []);
      } else {
        alert("Failed to load post");
        setLocation("/admin/content");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    if (!content.trim()) {
      alert("Content is required");
      return;
    }
    if (!category) {
      alert("Category is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        slug: slug || generateSlug(title),
        excerpt,
        content,
        category,
        author,
        featuredImage: featuredImage || null,
        readTimeMinutes,
        isFeatured,
        status: publish ? "published" : status,
        scheduledAt: status === "scheduled" && scheduledAt ? scheduledAt : null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
        ogImage: ogImage || null,
      };

      const url = isNew
        ? "/api/admin/content/blog-posts"
        : `/api/admin/content/blog-posts/${postId}`;

      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setLastSaved(new Date());
        if (isNew) {
          setLocation(`/admin/content/blog/${data.id}`);
        } else {
          // Refresh revisions
          fetchPost();
        }
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Are you sure you want to publish this post?")) return;
    await handleSave(true);
  };

  const handleSchedule = async () => {
    if (!scheduledAt) {
      alert("Please select a schedule date and time");
      return;
    }
    setStatus("scheduled");
    await handleSave();
  };

  const handleRevert = async (revisionId: string) => {
    if (!confirm("Are you sure you want to revert to this revision?")) return;

    try {
      const res = await fetch(`/api/admin/content/blog-posts/${postId}/revert/${revisionId}`, {
        method: "POST",
      });

      if (res.ok) {
        fetchPost();
      } else {
        alert("Failed to revert");
      }
    } catch (error) {
      console.error("Error reverting:", error);
    }
  };

  if (loading) {
    return (
      <AdminLoungeLayout breadcrumbs={[{ label: 'Content', href: '/admin/content' }, { label: 'Blog Editor' }]}>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLoungeLayout>
    );
  }

  return (
    <AdminLoungeLayout breadcrumbs={[{ label: 'Content', href: '/admin/content' }, { label: 'Blog Editor' }]}>
      <AdminStaggerContainer>
        {/* Hero */}
        <AdminPageHero
          icon={FileText}
          title="Blog Editor"
          subtitle="Create and publish blog content"
        />

        {/* Sticky Toolbar */}
        <AdminGlassToolbar>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocation("/admin/content")}
                className="p-2 hover:bg-white/40 transition-colors"
                style={{ borderRadius: RADIUS.input }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>
                  {isNew ? "New Blog Post" : "Edit Blog Post"}
                </p>
                {lastSaved && (
                  <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                    Last saved {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ContentStatusBadge status={status} />

              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors disabled:opacity-50"
                style={{ borderRadius: RADIUS.button }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>

              {status !== "published" && (
                <button
                  onClick={handlePublish}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium transition-colors disabled:opacity-50"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Check className="w-4 h-4" />
                  Publish
                </button>
              )}

              {!isNew && (
                <button
                  onClick={() => window.open(`/resources/blog/${slug}`, "_blank")}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/40 transition-colors"
                  title="Preview"
                  style={{ borderRadius: RADIUS.input }}
                >
                  <Eye className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </AdminGlassToolbar>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Editor */}
          <div className="flex-1 space-y-6">
            <AdminGlassCard className="space-y-6">
              {/* Title */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title..."
                  className="w-full font-bold border-0 bg-transparent focus:outline-none focus:ring-0 placeholder:text-gray-400"
                  style={{ fontSize: TYPE.section, color: COLORS.gray[900] }}
                />
              </div>

              {/* Excerpt */}
              <div>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Write a short excerpt..."
                  rows={2}
                  className="w-full border-0 bg-transparent focus:outline-none focus:ring-0 placeholder:text-gray-400 resize-none"
                  style={{ fontSize: TYPE.body, color: COLORS.gray[600] }}
                />
              </div>

              {/* Rich Text Editor */}
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Start writing your post..."
              />
            </AdminGlassCard>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            {/* Settings Panel */}
            <AdminGlassCard style={{ padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span style={{ fontSize: TYPE.body, fontWeight: 500 }}>Post Settings</span>
                </div>
                {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showSettings && (
                <div className="p-4 pt-0 space-y-4">
                  {/* Slug */}
                  <div>
                    <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Author */}
                  <div>
                    <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    />
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                      Featured Image URL
                    </label>
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={featuredImage}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                        style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                      />
                      {featuredImage && (
                        <img
                          src={featuredImage}
                          alt="Featured"
                          className="w-full h-32 object-cover"
                          style={{ borderRadius: RADIUS.input }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Read Time */}
                  <div>
                    <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                      Read Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={readTimeMinutes}
                      onChange={(e) => setReadTimeMinutes(parseInt(e.target.value) || 1)}
                      min={1}
                      className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    />
                  </div>

                  {/* Featured Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <span style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>Featured post</span>
                  </label>

                  {/* Schedule */}
                  {status !== "published" && (
                    <div>
                      <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                        Schedule Publication
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="flex-1 px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                          style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                        />
                        {scheduledAt && (
                          <button
                            onClick={handleSchedule}
                            className="px-3 py-2 bg-blue-500 text-white hover:bg-blue-600"
                            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AdminGlassCard>

            {/* SEO Panel */}
            <AdminGlassCard style={{ padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => setShowSEO(!showSEO)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors"
              >
                <span style={{ fontSize: TYPE.body, fontWeight: 500 }}>SEO Settings</span>
                {showSEO ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showSEO && (
                <div className="p-4 pt-0 space-y-4">
                  <div>
                    <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                      Meta Title <span style={{ color: COLORS.gray[400] }}>({metaTitle.length}/70)</span>
                    </label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value.slice(0, 70))}
                      placeholder={title}
                      className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                      Meta Description <span style={{ color: COLORS.gray[400] }}>({metaDescription.length}/160)</span>
                    </label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
                      placeholder={excerpt}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                      Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                      placeholder="life insurance, term life, coverage"
                      className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                      OG Image URL
                    </label>
                    <input
                      type="url"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder={featuredImage || "https://..."}
                      className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    />
                  </div>
                </div>
              )}
            </AdminGlassCard>

            {/* Revisions Panel */}
            {!isNew && revisions.length > 0 && (
              <AdminGlassCard style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => setShowRevisions(!showRevisions)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" />
                    <span style={{ fontSize: TYPE.body, fontWeight: 500 }}>Revisions ({revisions.length})</span>
                  </div>
                  {showRevisions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showRevisions && (
                  <div className="p-4 pt-0 space-y-2 max-h-64 overflow-y-auto">
                    {revisions.map((rev) => (
                      <div
                        key={rev.id}
                        className="flex items-center justify-between p-2 bg-white/40 rounded"
                        style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                      >
                        <div>
                          <p className="font-medium">Revision #{rev.revisionNumber}</p>
                          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                            {new Date(rev.createdAt).toLocaleString()}
                          </p>
                          {rev.changeDescription && (
                            <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 4 }}>{rev.changeDescription}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRevert(rev.id)}
                          className="text-primary hover:underline"
                          style={{ fontSize: TYPE.caption }}
                        >
                          Revert
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </AdminGlassCard>
            )}
          </div>
        </div>
      </AdminStaggerContainer>
    </AdminLoungeLayout>
  );
}
