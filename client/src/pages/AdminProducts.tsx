import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Package } from "lucide-react";
import { motion } from "framer-motion";
import { AdminLoungeLayout } from "./admin/AdminLoungeLayout";
import { AdminPageHero, AdminGlassCard, AdminStaggerContainer, AdminEmptyState, ADMIN_GRADIENT } from "@/components/admin/AdminHeritagePrimitives";
import { GLASS, RADIUS, SHADOW, MOTION, TYPE, GRID, COLORS, fadeInUp, staggerContainer } from "@/lib/heritageDesignSystem";

interface Product {
  id: number;
  productType: string;
  personaName: string;
  personaEthnicity: string;
  ageRangeMin: number;
  ageRangeMax: number;
  incomeMin: number;
  incomeMax: number;
  familyStatus: string;
  corePain: string;
  primaryTrigger: string;
  description: string;
  features: string[];
  coverageAmounts: number[];
  termLengths: string[];
}

interface PricingTable {
  id: number;
  productId: number;
  ageMin: number;
  ageMax: number;
  gender: string;
  smoker: boolean;
  monthlyRate: number;
  coverageAmount: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    productType: "Term Life",
    personaName: "",
    personaEthnicity: "",
    ageRangeMin: 25,
    ageRangeMax: 35,
    incomeMin: 50000,
    incomeMax: 100000,
    familyStatus: "",
    corePain: "",
    primaryTrigger: "",
    description: "",
    features: "",
    coverageAmounts: "",
    termLengths: "",
  });

  const productTypes = ["Term Life", "Final Expense", "IUL", "Mortgage Protection"];
  const ethnicities = ["White", "Black", "Asian", "Hispanic/Latino", "Indian", "Other"];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      ...formData,
      features: formData.features.split("\n").filter(f => f.trim()),
      coverageAmounts: formData.coverageAmounts.split(",").map(a => parseInt(a.trim())),
      termLengths: formData.termLengths.split(",").filter(t => t.trim()),
    };

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        await loadProducts();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      productType: product.productType,
      personaName: product.personaName,
      personaEthnicity: product.personaEthnicity,
      ageRangeMin: product.ageRangeMin,
      ageRangeMax: product.ageRangeMax,
      incomeMin: product.incomeMin,
      incomeMax: product.incomeMax,
      familyStatus: product.familyStatus,
      corePain: product.corePain,
      primaryTrigger: product.primaryTrigger,
      description: product.description,
      features: product.features.join("\n"),
      coverageAmounts: product.coverageAmounts.join(", "),
      termLengths: product.termLengths.join(", "),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      productType: "Term Life",
      personaName: "",
      personaEthnicity: "",
      ageRangeMin: 25,
      ageRangeMax: 35,
      incomeMin: 50000,
      incomeMax: 100000,
      familyStatus: "",
      corePain: "",
      primaryTrigger: "",
      description: "",
      features: "",
      coverageAmounts: "",
      termLengths: "",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLoungeLayout breadcrumbs={[{ label: 'Products' }]}>
      <AdminStaggerContainer className="max-w-7xl mx-auto">
          {/* Hero */}
          <AdminPageHero
            icon={Package}
            title="Products"
            subtitle="Manage life insurance products and personas"
            actions={
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="flex items-center justify-center gap-2 text-white font-medium transition-all w-full sm:w-auto"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(12px)',
                  padding: '10px 20px',
                  borderRadius: RADIUS.button,
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            }
          />

          {/* Products Grid */}
          <div className="grid gap-4 md:gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                style={{
                  ...GLASS.css.standard,
                  borderRadius: RADIUS.card,
                  padding: GRID.spacing.md,
                  boxShadow: SHADOW.card,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-bold" style={{ fontSize: TYPE.section, color: COLORS.gray[900] }}>{product.productType}</h3>
                      <span
                        className="px-3 py-1 text-sm font-semibold"
                        style={{
                          borderRadius: RADIUS.pill,
                          background: COLORS.primary.violet[100],
                          color: COLORS.primary.violet[700],
                        }}
                      >
                        {product.personaEthnicity}
                      </span>
                    </div>
                    <h4 className="mb-3" style={{ fontSize: TYPE.title, color: COLORS.gray[700] }}>{product.personaName}</h4>
                  </div>
                  <div className="flex gap-2 self-end sm:self-start">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 transition-colors"
                      style={{ color: COLORS.gray[600], borderRadius: RADIUS.input }}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                      style={{ borderRadius: RADIUS.input }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-4">
                  <div>
                    <p className="font-semibold mb-1" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>Age Range</p>
                    <p style={{ fontSize: TYPE.body, color: COLORS.gray[900] }}>{product.ageRangeMin}–{product.ageRangeMax} years</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>Income Range</p>
                    <p style={{ fontSize: TYPE.body, color: COLORS.gray[900] }}>{formatCurrency(product.incomeMin)}–{formatCurrency(product.incomeMax)}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>Family Status</p>
                    <p style={{ fontSize: TYPE.body, color: COLORS.gray[900] }}>{product.familyStatus}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>Core Pain</p>
                    <p style={{ fontSize: TYPE.body, color: COLORS.gray[900] }}>{product.corePain}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-semibold mb-1" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>Primary Trigger</p>
                  <p style={{ fontSize: TYPE.body, color: COLORS.gray[900] }}>{product.primaryTrigger}</p>
                </div>

                {product.description && (
                  <div className="mb-4">
                    <p className="font-semibold mb-1" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>Description</p>
                    <p style={{ fontSize: TYPE.body, color: COLORS.gray[700] }}>{product.description}</p>
                  </div>
                )}
              </motion.div>
            ))}

            {products.length === 0 && (
              <AdminGlassCard>
                <AdminEmptyState
                  icon={Package}
                  title="No products yet"
                  description='Click "Add Product" to get started.'
                  action={
                    <button
                      onClick={() => {
                        resetForm();
                        setShowModal(true);
                      }}
                      className="flex items-center gap-2 mx-auto text-white font-medium"
                      style={{
                        background: ADMIN_GRADIENT,
                        padding: '10px 20px',
                        borderRadius: RADIUS.button,
                        boxShadow: SHADOW.level2,
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>
                  }
                />
              </AdminGlassCard>
            )}
          </div>
        </AdminStaggerContainer>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-2 md:p-4 z-50" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: MOTION.duration.modal, ease: MOTION.easing }}
            className="max-w-3xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(255,255,255,0.98)',
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
            }}
          >
            <div
              className="sticky top-0 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${GLASS.border}`,
                borderRadius: `${RADIUS.hero}px ${RADIUS.hero}px 0 0`,
              }}
            >
              <h2 className="font-bold" style={{ fontSize: TYPE.section, color: COLORS.gray[900] }}>
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 transition-colors"
                style={{ borderRadius: RADIUS.input }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Product Type */}
              <div>
                <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                  Product Type
                </label>
                <select
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                  required
                >
                  {productTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Persona Name */}
              <div>
                <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                  Persona Name
                </label>
                <input
                  type="text"
                  value={formData.personaName}
                  onChange={(e) => setFormData({ ...formData, personaName: e.target.value })}
                  placeholder="e.g., New Father Protector"
                  className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                  required
                />
              </div>

              {/* Ethnicity */}
              <div>
                <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                  Persona Ethnicity
                </label>
                <select
                  value={formData.personaEthnicity}
                  onChange={(e) => setFormData({ ...formData, personaEthnicity: e.target.value })}
                  className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                  required
                >
                  <option value="">Select ethnicity</option>
                  {ethnicities.map((ethnicity) => (
                    <option key={ethnicity} value={ethnicity}>{ethnicity}</option>
                  ))}
                </select>
              </div>

              {/* Age Range */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                    Min Age
                  </label>
                  <input
                    type="number"
                    value={formData.ageRangeMin}
                    onChange={(e) => setFormData({ ...formData, ageRangeMin: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                    Max Age
                  </label>
                  <input
                    type="number"
                    value={formData.ageRangeMax}
                    onChange={(e) => setFormData({ ...formData, ageRangeMax: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                    required
                  />
                </div>
              </div>

              {/* Income Range */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                    Min Income
                  </label>
                  <input
                    type="number"
                    value={formData.incomeMin}
                    onChange={(e) => setFormData({ ...formData, incomeMin: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                    Max Income
                  </label>
                  <input
                    type="number"
                    value={formData.incomeMax}
                    onChange={(e) => setFormData({ ...formData, incomeMax: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                    required
                  />
                </div>
              </div>

              {/* Family Status */}
              <div>
                <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                  Family Status
                </label>
                <input
                  type="text"
                  value={formData.familyStatus}
                  onChange={(e) => setFormData({ ...formData, familyStatus: e.target.value })}
                  placeholder="e.g., Married, 1 child"
                  className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                  required
                />
              </div>

              {/* Core Pain */}
              <div>
                <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                  Core Pain
                </label>
                <input
                  type="text"
                  value={formData.corePain}
                  onChange={(e) => setFormData({ ...formData, corePain: e.target.value })}
                  placeholder="e.g., Fear of leaving family unprotected"
                  className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                  required
                />
              </div>

              {/* Primary Trigger */}
              <div>
                <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                  Primary Trigger
                </label>
                <input
                  type="text"
                  value={formData.primaryTrigger}
                  onChange={(e) => setFormData({ ...formData, primaryTrigger: e.target.value })}
                  placeholder="e.g., Birth of first child"
                  className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                  placeholder="Detailed description of this product/persona..."
                />
              </div>

              {/* Features */}
              <div>
                <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                  Key Features (one per line)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                  placeholder="Income replacement&#10;Affordable premiums&#10;Flexible terms"
                />
              </div>

              {/* Coverage Amounts */}
              <div>
                <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                  Coverage Amounts (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.coverageAmounts}
                  onChange={(e) => setFormData({ ...formData, coverageAmounts: e.target.value })}
                  placeholder="100000, 250000, 500000, 1000000"
                  className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                />
              </div>

              {/* Term Lengths */}
              <div>
                <label className="block font-semibold mb-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
                  Term Lengths (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.termLengths}
                  onChange={(e) => setFormData({ ...formData, termLengths: e.target.value })}
                  placeholder="10 years, 20 years, 30 years"
                  className="w-full px-4 py-2 border focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ borderRadius: RADIUS.input, borderColor: COLORS.gray[300] }}
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 text-white font-semibold transition-all order-1 sm:order-none"
                  style={{
                    background: ADMIN_GRADIENT,
                    padding: '12px 24px',
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.level2,
                  }}
                >
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="font-semibold transition-colors order-2 sm:order-none"
                  style={{
                    padding: '12px 24px',
                    borderRadius: RADIUS.button,
                    border: `1px solid ${COLORS.gray[300]}`,
                    color: COLORS.gray[700],
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AdminLoungeLayout>
  );
}
