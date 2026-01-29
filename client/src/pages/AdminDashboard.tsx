import { useState, useEffect } from "react";
import { Image, Package, BarChart3, Inbox, FileText, Users, Mail, Briefcase } from "lucide-react";
import AdminNav from "@/components/AdminNav";

interface DashboardStats {
  totalImages: number;
  totalProducts: number;
  quoteRequestsThisMonth: number;
  totalQuoteRequests: number;
  totalContactMessages: number;
  totalJobApplications: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalImages: 0,
    totalProducts: 12, // Default product count
    quoteRequestsThisMonth: 0,
    totalQuoteRequests: 0,
    totalContactMessages: 0,
    totalJobApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all data in parallel
        const [quotesRes, contactsRes, applicationsRes] = await Promise.all([
          fetch("/api/quote-requests"),
          fetch("/api/contact-messages"),
          fetch("/api/job-applications"),
        ]);

        const quotes = await quotesRes.json();
        const contacts = await contactsRes.json();
        const applications = await applicationsRes.json();

        // Calculate quotes this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const quotesThisMonth = quotes.filter((q: { createdAt: string }) => {
          const createdAt = new Date(q.createdAt);
          return createdAt >= startOfMonth;
        });

        setStats({
          totalImages: 0, // Would need an API endpoint for images
          totalProducts: 12,
          quoteRequestsThisMonth: quotesThisMonth.length,
          totalQuoteRequests: quotes.length,
          totalContactMessages: contacts.length,
          totalJobApplications: applications.length,
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
      href: "#",
      color: "bg-pink-500",
      disabled: true,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <AdminNav />

      <div className="flex-1 p-4 md:p-6 lg:p-8 pt-[72px] lg:pt-4 md:lg:pt-6 lg:!pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">Manage your Heritage Life Solutions website</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Quote Requests</h3>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? "..." : stats.quoteRequestsThisMonth}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This month ({loading ? "..." : stats.totalQuoteRequests} total)
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Contact Messages</h3>
                <Mail className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? "..." : stats.totalContactMessages}
              </p>
              <p className="text-sm text-gray-500 mt-1">Total messages</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Job Applications</h3>
                <Briefcase className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? "..." : stats.totalJobApplications}
              </p>
              <p className="text-sm text-gray-500 mt-1">Total applications</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Products</h3>
                <Package className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-sm text-gray-500 mt-1">Active personas</p>
            </div>
          </div>

          {/* Admin Tools Grid */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Admin Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {tools.map((tool) => {
                const Icon = tool.icon;

                if (tool.disabled) {
                  return (
                    <div
                      key={tool.title}
                      className="bg-white rounded-lg shadow-sm p-4 md:p-6 opacity-50 cursor-not-allowed"
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
                    className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow group"
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
          <div className="mt-6 md:mt-8 bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <a
                href="/admin/images"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-violet-200/10 transition-colors"
              >
                <Image className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-gray-900">Upload Images</p>
                  <p className="text-sm text-gray-600">Add new images to CDN</p>
                </div>
              </a>

              <a
                href="/admin/products"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-violet-200/10 transition-colors"
              >
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-gray-900">Add Product</p>
                  <p className="text-sm text-gray-600">Create new insurance product</p>
                </div>
              </a>

              <a
                href="/admin/submissions"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-violet-200/10 transition-colors"
              >
                <Inbox className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-gray-900">View Submissions</p>
                  <p className="text-sm text-gray-600">Review quotes, contacts & applications</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
