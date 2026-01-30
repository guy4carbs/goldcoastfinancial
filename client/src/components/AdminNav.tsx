import { useState } from "react";
import { Image, Video, Package, LogOut, LayoutDashboard, Inbox, Menu, X, BarChart3, FileText, Settings, Star, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export default function AdminNav() {
  const { signOut } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Submissions",
      path: "/admin/submissions",
      icon: Inbox,
    },
    {
      label: "Content",
      path: "/admin/content",
      icon: FileText,
    },
    {
      label: "Testimonials",
      path: "/admin/testimonials",
      icon: Star,
    },
    {
      label: "Newsletter",
      path: "/admin/newsletter",
      icon: Mail,
    },
    {
      label: "Images",
      path: "/admin/images",
      icon: Image,
    },
    {
      label: "Videos",
      path: "/admin/videos",
      icon: Video,
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      label: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    setLocation("/admin/login");
  };

  const NavContent = () => (
    <>
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">
          HERITAGE
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">Admin Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-4">
        <ul className="space-y-1 md:space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <li key={item.path}>
                <a
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-3 md:p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm md:text-base">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-primary">HERITAGE Admin</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-end p-4 border-b border-gray-200">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <NavContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 min-h-screen flex-col sticky top-0 h-screen">
        <NavContent />
      </div>

      {/* Mobile spacer to account for fixed header */}
      <div className="lg:hidden h-14" />
    </>
  );
}
