import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2, Eye, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { AdminLoungeLayout } from "./admin/AdminLoungeLayout";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  AdminPageHero,
  AdminGlassCard,
  AdminStaggerContainer,
  AdminGlassToolbar,
} from "@/components/admin/AdminHeritagePrimitives";
import { RADIUS, TYPE, COLORS, fadeInUp } from "@/lib/heritageDesignSystem";

const PAGE_TYPES = [
  { value: "landing", label: "Landing Page" },
  { value: "content", label: "Content Page" },
  { value: "section", label: "Page Section" },
];

const PARENT_PAGES = [
  { value: "", label: "None (Top Level)" },
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
  { value: "products", label: "Products" },
  { value: "resources", label: "Resources" },
  { value: "legal", label: "Legal" },
];

interface Page {
  id?: string;
  slug: string;
  title: string;
  content: string;
  pageType: string;
  parentPage: string;
  status: "draft" | "published";
  metaTitle: string;
  metaDescription: string;
}

export default function AdminPageEditor() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const isNew = !params.id || params.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState<Page>({
    slug: "",
    title: "",
    content: "",
    pageType: "content",
    parentPage: "",
    status: "draft",
    metaTitle: "",
    metaDescription: "",
  });

  useEffect(() => {
    if (!isNew && params.id) {
      fetchPage(params.id);
    }
  }, [params.id, isNew]);

  const fetchPage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/content/pages/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPage(data);
      } else {
        toast.error("Page not found");
        setLocation("/admin/content");
      }
    } catch (error) {
      console.error("Error fetching page:", error);
      toast.error("Failed to load page");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 100);
  };

  const handleTitleChange = (title: string) => {
    setPage((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      metaTitle: prev.metaTitle || title,
    }));
  };

  const handleSave = async (publish = false) => {
    if (!page.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!page.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...page,
        status: publish ? "published" : page.status,
        publishedAt: publish ? new Date().toISOString() : undefined,
      };

      const url = isNew
        ? "/api/admin/content/pages"
        : `/api/admin/content/pages/${params.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(isNew ? "Page created!" : "Page saved!");
        if (isNew && data.id) {
          setLocation(`/admin/content/pages/${data.id}`);
        }
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to save page");
      }
    } catch (error) {
      console.error("Error saving page:", error);
      toast.error("Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const res = await fetch(`/api/admin/content/pages/${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Page deleted");
        setLocation("/admin/content");
      } else {
        toast.error("Failed to delete page");
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("Failed to delete page");
    }
  };

  if (loading) {
    return (
      <AdminLoungeLayout breadcrumbs={[{ label: 'Content', href: '/admin/content' }, { label: 'Page Editor' }]}>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLoungeLayout>
    );
  }

  return (
    <AdminLoungeLayout breadcrumbs={[{ label: 'Content', href: '/admin/content' }, { label: 'Page Editor' }]}>
      <AdminStaggerContainer className="max-w-5xl mx-auto">
        {/* Hero */}
        <AdminPageHero
          icon={FileText}
          title="Page Editor"
          subtitle="Create and manage custom pages"
        />

        {/* Sticky Toolbar */}
        <AdminGlassToolbar>
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocation("/admin/content")}
                className="p-2 hover:bg-white/40 rounded-lg transition-colors"
                style={{ borderRadius: RADIUS.input }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>
                {isNew ? "New Page" : page.status === "published" ? "Published" : "Draft"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isNew && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                  style={{ borderRadius: RADIUS.input }}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                style={{ borderRadius: RADIUS.button }}
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                style={{ borderRadius: RADIUS.button }}
              >
                <CheckCircle className="w-4 h-4" />
                {page.status === "published" ? "Update" : "Publish"}
              </button>
            </div>
          </div>
        </AdminGlassToolbar>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AdminGlassCard className="space-y-6">
              {/* Title */}
              <div>
                <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  value={page.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Page Title"
                  className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent font-semibold"
                  style={{ borderRadius: RADIUS.input, fontSize: TYPE.title }}
                />
              </div>

              {/* Content */}
              <div>
                <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-2">
                  Content
                </label>
                <RichTextEditor
                  content={page.content}
                  onChange={(html) => setPage((prev) => ({ ...prev, content: html }))}
                  placeholder="Start writing your page content..."
                />
              </div>
            </AdminGlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Page Settings */}
            <AdminGlassCard>
              <h3 style={{ fontSize: TYPE.body, fontWeight: 600, color: COLORS.gray[900], marginBottom: 16 }}>Page Settings</h3>
              <div className="space-y-4">
                {/* Slug */}
                <div>
                  <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={page.slug}
                    onChange={(e) => setPage((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="page-url"
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                    style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                  />
                </div>

                {/* Page Type */}
                <div>
                  <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                    Page Type
                  </label>
                  <select
                    value={page.pageType}
                    onChange={(e) => setPage((prev) => ({ ...prev, pageType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ borderRadius: RADIUS.input }}
                  >
                    {PAGE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Parent Page */}
                <div>
                  <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                    Parent Section
                  </label>
                  <select
                    value={page.parentPage}
                    onChange={(e) => setPage((prev) => ({ ...prev, parentPage: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ borderRadius: RADIUS.input }}
                  >
                    {PARENT_PAGES.map((parent) => (
                      <option key={parent.value} value={parent.value}>
                        {parent.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </AdminGlassCard>

            {/* SEO Settings */}
            <AdminGlassCard>
              <h3 style={{ fontSize: TYPE.body, fontWeight: 600, color: COLORS.gray[900], marginBottom: 16 }}>SEO</h3>
              <div className="space-y-4">
                {/* Meta Title */}
                <div>
                  <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={page.metaTitle}
                    onChange={(e) => setPage((prev) => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Page title for search engines"
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    maxLength={60}
                  />
                  <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 4 }}>
                    {page.metaTitle.length}/60 characters
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <label style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }} className="block mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={page.metaDescription}
                    onChange={(e) => setPage((prev) => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Brief description for search results"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    maxLength={160}
                  />
                  <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 4 }}>
                    {page.metaDescription.length}/160 characters
                  </p>
                </div>
              </div>
            </AdminGlassCard>
          </div>
        </div>
      </AdminStaggerContainer>
    </AdminLoungeLayout>
  );
}
