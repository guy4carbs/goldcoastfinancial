import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AdminLoungeLayout } from "./admin/AdminLoungeLayout";
import { AdminPageHero, AdminGlassCard, AdminStaggerContainer, AdminStatCard, AdminStatCardGrid, AdminEmptyState, ADMIN_GRADIENT } from "@/components/admin/AdminHeritagePrimitives";
import { GLASS, RADIUS, SHADOW, MOTION, TYPE, GRID, COLORS, fadeInUp, staggerContainer } from "@/lib/heritageDesignSystem";
import {
  Plus,
  Search,
  Star,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  X,
  User,
  Quote,
  MapPin,
  MessageSquare
} from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  location: string | null;
  photoUrl: string | null;
  quote: string;
  rating: number;
  category: string | null;
  productType: string | null;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
  showOnHomepage: boolean;
  showOnProductPages: boolean;
  dateReceived: string;
  createdAt: string;
  updatedAt: string;
}

interface TestimonialFormData {
  name: string;
  title: string;
  company: string;
  location: string;
  photoUrl: string;
  quote: string;
  rating: number;
  category: string;
  productType: string;
  status: string;
  isFeatured: boolean;
  showOnHomepage: boolean;
  showOnProductPages: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; icon: React.ReactNode }> = {
  pending: { label: "Pending Review", bgColor: "bg-amber-100", textColor: "text-amber-700", icon: <Clock className="w-4 h-4" /> },
  approved: { label: "Approved", bgColor: "bg-green-100", textColor: "text-green-700", icon: <CheckCircle className="w-4 h-4" /> },
  rejected: { label: "Rejected", bgColor: "bg-red-100", textColor: "text-red-700", icon: <XCircle className="w-4 h-4" /> }
};

const PRODUCT_TYPES = [
  { value: "", label: "All Products" },
  { value: "term", label: "Term Life" },
  { value: "whole", label: "Whole Life" },
  { value: "iul", label: "IUL" },
  { value: "final-expense", label: "Final Expense" },
  { value: "annuities", label: "Annuities" },
  { value: "mortgage-protection", label: "Mortgage Protection" }
];

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "service", label: "Customer Service" },
  { value: "claims", label: "Claims Experience" },
  { value: "value", label: "Value & Pricing" },
  { value: "process", label: "Application Process" },
  { value: "general", label: "General" }
];

const emptyFormData: TestimonialFormData = {
  name: "",
  title: "",
  company: "",
  location: "",
  photoUrl: "",
  quote: "",
  rating: 5,
  category: "general",
  productType: "",
  status: "pending",
  isFeatured: false,
  showOnHomepage: false,
  showOnProductPages: true
};

export default function AdminTestimonials() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch testimonials
  const { data: testimonials = [], isLoading, error } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials", statusFilter, productFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (productFilter) params.set("productType", productFilter);
      const response = await fetch(`/api/admin/testimonials?${params}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch testimonials");
      const data = await response.json();
      // API returns { testimonials: [...], stats: {...} }
      // Map snake_case from DB to camelCase for frontend
      return (data.testimonials || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        title: t.title,
        company: t.company,
        location: t.location,
        photoUrl: t.photo_url,
        quote: t.quote,
        rating: t.rating,
        category: t.category,
        productType: t.product_type,
        status: t.status,
        isFeatured: t.is_featured,
        sortOrder: t.sort_order,
        showOnHomepage: t.show_on_homepage,
        showOnProductPages: t.show_on_product_pages,
        dateReceived: t.date_received,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create testimonial");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      closeModal();
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TestimonialFormData> }) => {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update testimonial");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      closeModal();
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to delete testimonial");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      setDeleteConfirm(null);
    }
  });

  const openAddModal = () => {
    setEditingTestimonial(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      title: testimonial.title || "",
      company: testimonial.company || "",
      location: testimonial.location || "",
      photoUrl: testimonial.photoUrl || "",
      quote: testimonial.quote,
      rating: testimonial.rating,
      category: testimonial.category || "general",
      productType: testimonial.productType || "",
      status: testimonial.status,
      isFeatured: testimonial.isFeatured,
      showOnHomepage: testimonial.showOnHomepage,
      showOnProductPages: testimonial.showOnProductPages
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTestimonial) {
      updateMutation.mutate({ id: editingTestimonial.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleFeatured = (testimonial: Testimonial) => {
    updateMutation.mutate({
      id: testimonial.id,
      data: { isFeatured: !testimonial.isFeatured }
    });
  };

  const toggleHomepage = (testimonial: Testimonial) => {
    updateMutation.mutate({
      id: testimonial.id,
      data: { showOnHomepage: !testimonial.showOnHomepage }
    });
  };

  const quickApprove = (testimonial: Testimonial) => {
    updateMutation.mutate({
      id: testimonial.id,
      data: { status: "approved" }
    });
  };

  const quickReject = (testimonial: Testimonial) => {
    updateMutation.mutate({
      id: testimonial.id,
      data: { status: "rejected" }
    });
  };

  // Filter testimonials by search
  const filteredTestimonials = testimonials.filter(t => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.quote.toLowerCase().includes(query) ||
      (t.company && t.company.toLowerCase().includes(query)) ||
      (t.location && t.location.toLowerCase().includes(query))
    );
  });

  // Stats
  const stats = {
    total: testimonials.length,
    pending: testimonials.filter(t => t.status === "pending").length,
    approved: testimonials.filter(t => t.status === "approved").length,
    featured: testimonials.filter(t => t.isFeatured).length
  };

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLoungeLayout breadcrumbs={[{ label: 'Testimonials' }]}>
        <div className="flex-1 flex items-center justify-center">
          <AdminGlassCard className="flex items-center justify-center" style={{ padding: GRID.spacing.xl, minWidth: 200 }}>
            <RefreshCw className="w-8 h-8 animate-spin text-slate-500" />
          </AdminGlassCard>
        </div>
      </AdminLoungeLayout>
    );
  }

  if (error) {
    return (
      <AdminLoungeLayout breadcrumbs={[{ label: 'Testimonials' }]}>
        <div className="flex-1 p-8 flex items-center justify-center">
          <AdminGlassCard className="text-center max-w-md w-full" style={{ padding: GRID.spacing.xl }}>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: 8 }}>Failed to Load Testimonials</h3>
            <p style={{ fontSize: TYPE.body, color: COLORS.gray[600] }}>Please try refreshing the page</p>
          </AdminGlassCard>
        </div>
      </AdminLoungeLayout>
    );
  }

  return (
    <AdminLoungeLayout breadcrumbs={[{ label: 'Testimonials' }]}>
      <div className="flex-1">
        <AdminStaggerContainer className="p-4 md:p-6">
          {/* Hero Header */}
          <AdminPageHero
            icon={Star}
            title="Testimonials"
            subtitle="Manage customer reviews and testimonials"
            actions={
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white transition-colors"
                style={{ borderRadius: RADIUS.button, backdropFilter: 'blur(12px)' }}
              >
                <Plus className="w-4 h-4" />
                Add Testimonial
              </button>
            }
          />

          {/* Stats */}
          <AdminStatCardGrid cols={4}>
            <AdminStatCard icon={MessageSquare} iconColor="text-slate-500" value={stats.total} label="Total" />
            <AdminStatCard icon={Clock} iconColor="text-amber-500" value={stats.pending} label="Pending Review" />
            <AdminStatCard icon={CheckCircle} iconColor="text-green-500" value={stats.approved} label="Approved" />
            <AdminStatCard icon={Star} iconColor="text-purple-500" value={stats.featured} label="Featured" />
          </AdminStatCardGrid>

          {/* Filters */}
          <AdminGlassCard>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search testimonials..."
                  style={{ borderRadius: RADIUS.input }}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ borderRadius: RADIUS.input }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                style={{ borderRadius: RADIUS.input }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                {PRODUCT_TYPES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </AdminGlassCard>

          {/* Testimonials Grid */}
          {filteredTestimonials.length === 0 ? (
            <AdminGlassCard>
              <AdminEmptyState
                icon={Quote}
                title="No testimonials found"
                description={
                  searchQuery || statusFilter || productFilter
                    ? "Try adjusting your filters"
                    : "Add your first customer testimonial"
                }
                action={
                  !searchQuery && !statusFilter && !productFilter ? (
                    <button
                      onClick={openAddModal}
                      className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors hover:opacity-90"
                      style={{
                        borderRadius: RADIUS.button,
                        background: ADMIN_GRADIENT,
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Testimonial
                    </button>
                  ) : undefined
                }
              />
            </AdminGlassCard>
          ) : (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {filteredTestimonials.map((testimonial) => {
                const statusConfig = STATUS_CONFIG[testimonial.status];
                return (
                  <motion.div
                    key={testimonial.id}
                    variants={fadeInUp}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    style={{
                      ...GLASS.css.standard,
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Card Header */}
                    <div className="p-4" style={{ borderBottom: `1px solid ${GLASS.border}` }}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {testimonial.photoUrl ? (
                            <img
                              src={testimonial.photoUrl}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ background: COLORS.lounges.admin.light }}
                            >
                              <User className="w-6 h-6 text-slate-500" />
                            </div>
                          )}
                          <div>
                            <h3 style={{ fontWeight: 600, color: COLORS.gray[900] }}>{testimonial.name}</h3>
                            {(testimonial.title || testimonial.company) && (
                              <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>
                                {testimonial.title}
                                {testimonial.title && testimonial.company && " at "}
                                {testimonial.company}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                          style={{ borderRadius: RADIUS.pill }}
                        >
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <div className="mb-3">{renderStars(testimonial.rating)}</div>
                      <p className="line-clamp-3 mb-3" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                        "{testimonial.quote}"
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {testimonial.location && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs"
                            style={{ borderRadius: RADIUS.pill, background: COLORS.gray[100], color: COLORS.gray[600] }}
                          >
                            <MapPin className="w-3 h-3" />
                            {testimonial.location}
                          </span>
                        )}
                        {testimonial.productType && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs"
                            style={{ borderRadius: RADIUS.pill, background: COLORS.gray[100], color: COLORS.gray[600] }}
                          >
                            <ShoppingBag className="w-3 h-3" />
                            {PRODUCT_TYPES.find(p => p.value === testimonial.productType)?.label || testimonial.productType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFeatured(testimonial)}
                          className={`p-2 rounded transition-colors ${
                            testimonial.isFeatured
                              ? "bg-amber-100 text-amber-600"
                              : "bg-gray-100 text-gray-500 hover:text-amber-600"
                          }`}
                          style={{ borderRadius: RADIUS.input }}
                          title={testimonial.isFeatured ? "Remove from featured" : "Mark as featured"}
                        >
                          <Star className={`w-4 h-4 ${testimonial.isFeatured ? "fill-current" : ""}`} />
                        </button>
                        <button
                          onClick={() => toggleHomepage(testimonial)}
                          className={`p-2 rounded transition-colors ${
                            testimonial.showOnHomepage
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-500 hover:text-blue-600"
                          }`}
                          style={{ borderRadius: RADIUS.input }}
                          title={testimonial.showOnHomepage ? "Hide from homepage" : "Show on homepage"}
                        >
                          <Home className="w-4 h-4" />
                        </button>
                        <div className="flex-1" />
                        {testimonial.status === "pending" && (
                          <>
                            <button
                              onClick={() => quickApprove(testimonial)}
                              className="p-2 bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                              style={{ borderRadius: RADIUS.input }}
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => quickReject(testimonial)}
                              className="p-2 bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              style={{ borderRadius: RADIUS.input }}
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEditModal(testimonial)}
                          className="p-2 bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                          style={{ borderRadius: RADIUS.input }}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(testimonial.id)}
                          className="p-2 bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
                          style={{ borderRadius: RADIUS.input }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AdminStaggerContainer>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: MOTION.duration.modal, ease: MOTION.easing }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{
              ...GLASS.css.light,
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
            }}
          >
            <div
              className="sticky top-0 px-6 py-4 flex items-center justify-between z-10"
              style={{
                ...GLASS.css.light,
                borderBottom: `1px solid ${GLASS.border}`,
                borderRadius: `${RADIUS.hero}px ${RADIUS.hero}px 0 0`,
              }}
            >
              <h2 style={{ fontSize: TYPE.section, fontWeight: 600, color: COLORS.gray[900] }}>
                {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
                style={{ borderRadius: RADIUS.input }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Person Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{ borderRadius: RADIUS.input }}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block mb-1" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>
                    Title/Position
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Business Owner"
                    style={{ borderRadius: RADIUS.input }}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block mb-1" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    style={{ borderRadius: RADIUS.input }}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block mb-1" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Chicago, IL"
                    style={{ borderRadius: RADIUS.input }}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block mb-1" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>
                  Photo URL
                </label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="https://..."
                  style={{ borderRadius: RADIUS.input }}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              {/* Quote */}
              <div>
                <label className="block mb-1" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>
                  Testimonial Quote *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.quote}
                  onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
                  placeholder="What did the customer say about your service?"
                  style={{ borderRadius: RADIUS.input }}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block mb-2" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>
                  Rating
                </label>
                {renderStars(formData.rating, true, (r) => setFormData(prev => ({ ...prev, rating: r })))}
              </div>

              {/* Category & Product */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    style={{ borderRadius: RADIUS.input }}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    {CATEGORIES.filter(c => c.value).map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>
                    Related Product
                  </label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
                    style={{ borderRadius: RADIUS.input }}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    {PRODUCT_TYPES.map(p => (
                      <option key={p.value} value={p.value}>{p.label || "None"}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block mb-1" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  style={{ borderRadius: RADIUS.input }}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Visibility Toggles */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                  />
                  <span style={{ color: COLORS.gray[900] }}>Featured testimonial</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnHomepage}
                    onChange={(e) => setFormData(prev => ({ ...prev, showOnHomepage: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                  />
                  <span style={{ color: COLORS.gray[900] }}>Show on homepage</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnProductPages}
                    onChange={(e) => setFormData(prev => ({ ...prev, showOnProductPages: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                  />
                  <span style={{ color: COLORS.gray[900] }}>Show on product pages</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4" style={{ borderTop: `1px solid ${GLASS.border}` }}>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{
                    borderRadius: RADIUS.button,
                    background: ADMIN_GRADIENT,
                  }}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                  {editingTestimonial ? "Update" : "Add"} Testimonial
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: MOTION.duration.modal, ease: MOTION.easing }}
            className="w-full max-w-md"
            style={{
              ...GLASS.css.light,
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
              padding: GRID.spacing.md,
            }}
          >
            <h3 style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900], marginBottom: 8 }}>Delete Testimonial?</h3>
            <p style={{ fontSize: TYPE.body, color: COLORS.gray[600], marginBottom: GRID.spacing.md }}>
              This action cannot be undone. The testimonial will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                style={{ borderRadius: RADIUS.button }}
              >
                {deleteMutation.isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLoungeLayout>
  );
}
