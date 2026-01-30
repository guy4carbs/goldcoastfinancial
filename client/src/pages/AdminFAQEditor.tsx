import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Save, Trash2, Eye, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import AdminNav from "@/components/AdminNav";
import RichTextEditor from "@/components/admin/RichTextEditor";

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

interface Faq {
  id?: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  status: "draft" | "published";
  slug: string;
}

export default function AdminFAQEditor() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const isNew = !params.id || params.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [faq, setFaq] = useState<Faq>({
    question: "",
    answer: "",
    category: "basics",
    sortOrder: 0,
    status: "draft",
    slug: "",
  });

  useEffect(() => {
    if (!isNew && params.id) {
      fetchFaq(params.id);
    }
  }, [params.id, isNew]);

  const fetchFaq = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/content/faqs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFaq(data);
      } else {
        toast.error("FAQ not found");
        setLocation("/admin/content");
      }
    } catch (error) {
      console.error("Error fetching FAQ:", error);
      toast.error("Failed to load FAQ");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (question: string) => {
    return question
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 100);
  };

  const handleQuestionChange = (question: string) => {
    setFaq((prev) => ({
      ...prev,
      question,
      slug: prev.slug || generateSlug(question),
    }));
  };

  const handleSave = async (publish = false) => {
    if (!faq.question.trim()) {
      toast.error("Question is required");
      return;
    }
    if (!faq.answer.trim()) {
      toast.error("Answer is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...faq,
        slug: faq.slug || generateSlug(faq.question),
        status: publish ? "published" : faq.status,
        publishedAt: publish ? new Date().toISOString() : undefined,
      };

      const url = isNew
        ? "/api/admin/content/faqs"
        : `/api/admin/content/faqs/${params.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(isNew ? "FAQ created!" : "FAQ saved!");
        if (isNew && data.id) {
          setLocation(`/admin/content/faqs/${data.id}`);
        }
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to save FAQ");
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error("Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const res = await fetch(`/api/admin/content/faqs/${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("FAQ deleted");
        setLocation("/admin/content");
      } else {
        toast.error("Failed to delete FAQ");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("Failed to delete FAQ");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <AdminNav />

      <div className="flex-1 pt-[72px] lg:pt-0">
        {/* Header */}
        <div className="sticky top-0 lg:top-0 z-10 bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocation("/admin/content")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isNew ? "New FAQ" : "Edit FAQ"}
                </h1>
                <p className="text-sm text-gray-500">
                  {faq.status === "published" ? "Published" : "Draft"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isNew && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {faq.status === "published" ? "Update" : "Publish"}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => handleQuestionChange(e.target.value)}
                placeholder="What is life insurance?"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
              />
            </div>

            {/* Answer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer *
              </label>
              <RichTextEditor
                content={faq.answer}
                onChange={(html) => setFaq((prev) => ({ ...prev, answer: html }))}
                placeholder="Provide a clear, helpful answer..."
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={faq.category}
                  onChange={(e) => setFaq((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {FAQ_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={faq.sortOrder}
                  onChange={(e) => setFaq((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              {/* Slug */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={faq.slug}
                  onChange={(e) => setFaq((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="what-is-life-insurance"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
