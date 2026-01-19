import { Image, Package, BarChart3, Users, FileText } from "lucide-react";
import AdminNav from "@/components/AdminNav";

export default function AdminDashboard() {
  const tools = [
    {
      title: "Image Manager",
      description: "Upload and manage images for the website",
      icon: Image,
      href: "/admin/images",
      color: "bg-blue-500",
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
      href: "#",
      color: "bg-green-500",
      disabled: true,
    },
    {
      title: "Leads",
      description: "Manage quote requests and contact submissions",
      icon: Users,
      href: "#",
      color: "bg-orange-500",
      disabled: true,
    },
    {
      title: "Content",
      description: "Edit pages, blog posts, and FAQs",
      icon: FileText,
      href: "#",
      color: "bg-pink-500",
      disabled: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your Heritage Life Solutions website</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Images</h3>
                <Image className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">-</p>
              <p className="text-sm text-gray-500 mt-1">Across all folders</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Products</h3>
                <Package className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-500 mt-1">Active personas</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Quote Requests</h3>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">-</p>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </div>
          </div>

          {/* Admin Tools Grid */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => {
                const Icon = tool.icon;

                if (tool.disabled) {
                  return (
                    <div
                      key={tool.title}
                      className="bg-white rounded-lg shadow-sm p-6 opacity-50 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`${tool.color} rounded-lg p-3`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{tool.title}</h3>
                          <span className="text-xs text-gray-400">Coming Soon</span>
                        </div>
                      </div>
                      <p className="text-gray-600">{tool.description}</p>
                    </div>
                  );
                }

                return (
                  <a
                    key={tool.title}
                    href={tool.href}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
                  >
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
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/admin/images"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-heritage-primary hover:bg-heritage-light/10 transition-colors"
              >
                <Image className="w-5 h-5 text-heritage-primary" />
                <div>
                  <p className="font-semibold text-gray-900">Upload Images</p>
                  <p className="text-sm text-gray-600">Add new images to CDN</p>
                </div>
              </a>

              <a
                href="/admin/products"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-heritage-primary hover:bg-heritage-light/10 transition-colors"
              >
                <Package className="w-5 h-5 text-heritage-primary" />
                <div>
                  <p className="font-semibold text-gray-900">Add Product</p>
                  <p className="text-sm text-gray-600">Create new insurance product</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
