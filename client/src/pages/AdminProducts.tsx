import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Package } from "lucide-react";
import AdminNav from "@/components/AdminNav";

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
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Products</h1>
              <p className="text-gray-600">Manage life insurance products and personas</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-heritage-primary text-white px-6 py-3 rounded-lg hover:bg-heritage-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{product.productType}</h3>
                      <span className="px-3 py-1 bg-heritage-light text-heritage-primary text-sm font-semibold rounded-full">
                        {product.personaEthnicity}
                      </span>
                    </div>
                    <h4 className="text-xl text-gray-700 mb-3">{product.personaName}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Age Range</p>
                    <p className="text-gray-900">{product.ageRangeMin}–{product.ageRangeMax} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Income Range</p>
                    <p className="text-gray-900">{formatCurrency(product.incomeMin)}–{formatCurrency(product.incomeMax)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Family Status</p>
                    <p className="text-gray-900">{product.familyStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Core Pain</p>
                    <p className="text-gray-900">{product.corePain}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-500 mb-1">Primary Trigger</p>
                  <p className="text-gray-900">{product.primaryTrigger}</p>
                </div>

                {product.description && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700">{product.description}</p>
                  </div>
                )}
              </div>
            ))}

            {products.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No products yet. Click "Add Product" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Product Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Type
                </label>
                <select
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                  required
                >
                  {productTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Persona Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Persona Name
                </label>
                <input
                  type="text"
                  value={formData.personaName}
                  onChange={(e) => setFormData({ ...formData, personaName: e.target.value })}
                  placeholder="e.g., New Father Protector"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Ethnicity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Persona Ethnicity
                </label>
                <select
                  value={formData.personaEthnicity}
                  onChange={(e) => setFormData({ ...formData, personaEthnicity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                  required
                >
                  <option value="">Select ethnicity</option>
                  {ethnicities.map((ethnicity) => (
                    <option key={ethnicity} value={ethnicity}>{ethnicity}</option>
                  ))}
                </select>
              </div>

              {/* Age Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Age
                  </label>
                  <input
                    type="number"
                    value={formData.ageRangeMin}
                    onChange={(e) => setFormData({ ...formData, ageRangeMin: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Age
                  </label>
                  <input
                    type="number"
                    value={formData.ageRangeMax}
                    onChange={(e) => setFormData({ ...formData, ageRangeMax: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Income Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Income
                  </label>
                  <input
                    type="number"
                    value={formData.incomeMin}
                    onChange={(e) => setFormData({ ...formData, incomeMin: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Income
                  </label>
                  <input
                    type="number"
                    value={formData.incomeMax}
                    onChange={(e) => setFormData({ ...formData, incomeMax: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Family Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Family Status
                </label>
                <input
                  type="text"
                  value={formData.familyStatus}
                  onChange={(e) => setFormData({ ...formData, familyStatus: e.target.value })}
                  placeholder="e.g., Married, 1 child"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Core Pain */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Core Pain
                </label>
                <input
                  type="text"
                  value={formData.corePain}
                  onChange={(e) => setFormData({ ...formData, corePain: e.target.value })}
                  placeholder="e.g., Fear of leaving family unprotected"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Primary Trigger */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Primary Trigger
                </label>
                <input
                  type="text"
                  value={formData.primaryTrigger}
                  onChange={(e) => setFormData({ ...formData, primaryTrigger: e.target.value })}
                  placeholder="e.g., Birth of first child"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                  placeholder="Detailed description of this product/persona..."
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Key Features (one per line)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                  placeholder="Income replacement&#10;Affordable premiums&#10;Flexible terms"
                />
              </div>

              {/* Coverage Amounts */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Coverage Amounts (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.coverageAmounts}
                  onChange={(e) => setFormData({ ...formData, coverageAmounts: e.target.value })}
                  placeholder="100000, 250000, 500000, 1000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                />
              </div>

              {/* Term Lengths */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Term Lengths (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.termLengths}
                  onChange={(e) => setFormData({ ...formData, termLengths: e.target.value })}
                  placeholder="10 years, 20 years, 30 years"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-heritage-primary text-white px-6 py-3 rounded-lg hover:bg-heritage-primary/90 transition-colors font-semibold"
                >
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
