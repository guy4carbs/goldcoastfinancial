import { useState, useEffect } from "react";
import {
  Inbox,
  FileText,
  Users,
  Briefcase,
  Search,
  Eye,
  Phone,
  Mail,
  Calendar,
  MapPin,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminPageHero, AdminGlassCard, AdminStaggerContainer, AdminStatCard, AdminStatCardGrid, AdminEmptyState, ADMIN_GRADIENT } from "@/components/admin/AdminHeritagePrimitives";
import { GLASS, RADIUS, SHADOW, MOTION, TYPE, GRID, COLORS, fadeInUp, staggerContainer } from "@/lib/heritageDesignSystem";
import { safeGet, safeKeys, safeSet, safeRemove } from "@/lib/safeStorage";
import { AdminLoungeLayout } from "./admin/AdminLoungeLayout";

type TabType = "quotes" | "contacts" | "applications";

interface QuoteRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  coverageType: string;
  coverageAmount: string;
  height: string;
  weight: string;
  birthDate: string;
  medicalBackground: string;
  createdAt: string;
  status?: string;
}

interface ContactMessage {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
  status?: string;
}

interface JobApplication {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  linkedIn: string | null;
  experience: string;
  whyJoinUs: string;
  hasLicense: string;
  resumeFileName: string | null;
  createdAt: string;
  status?: string;
}

const statusColors: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
  new: { bg: "bg-blue-100", text: "text-blue-700", icon: AlertCircle },
  viewed: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Eye },
  contacted: { bg: "bg-green-100", text: "text-green-700", icon: Phone },
  closed: { bg: "bg-gray-100", text: "text-gray-700", icon: CheckCircle },
};

// Format coverage type for proper display
const formatCoverageType = (type: string): string => {
  if (!type) return "Not Specified";

  const normalizedType = type.toLowerCase().trim();

  // Check for IUL first (most specific)
  if (normalizedType === "iul" || normalizedType.includes("indexed universal")) {
    return "IUL";
  }

  // Term Life
  if (normalizedType === "term" || normalizedType.includes("term life") || normalizedType === "term_life") {
    return "Term Life";
  }

  // Whole Life
  if (normalizedType === "whole" || normalizedType.includes("whole life") || normalizedType === "whole_life") {
    return "Whole Life";
  }

  // Final Expense
  if (normalizedType === "final" || normalizedType.includes("final expense") || normalizedType === "final_expense") {
    return "Final Expense";
  }

  // Mortgage Protection
  if (normalizedType === "mortgage" || normalizedType.includes("mortgage protection") || normalizedType === "mortgage_protection") {
    return "Mortgage Protection";
  }

  // Unsure
  if (normalizedType === "unsure" || normalizedType.includes("not sure")) {
    return "Not Sure";
  }

  // Return original with first letter capitalized if no match
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Helper to generate storage key for read status
const getReadStorageKey = (type: string, id: number) => `submission_read_${type}_${id}`;

export default function AdminSubmissions() {
  const [activeTab, setActiveTab] = useState<TabType>("quotes");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // Detail drawer state
  const [selectedItem, setSelectedItem] = useState<QuoteRequest | ContactMessage | JobApplication | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Read status tracking (persisted in localStorage)
  const [readItems, setReadItems] = useState<Set<string>>(new Set());

  // Load read status from localStorage on mount. Uses safeStorage so the
  // page doesn't crash in Safari private browsing (where localStorage access
  // throws SecurityError).
  useEffect(() => {
    const readSet = new Set<string>();
    for (const key of safeKeys("local")) {
      if (key.startsWith("submission_read_") && safeGet(key) === "true") {
        readSet.add(key);
      }
    }
    setReadItems(readSet);
  }, []);

  const isItemRead = (type: "quote" | "contact" | "application", id: number): boolean => {
    return readItems.has(getReadStorageKey(type, id));
  };

  const markAsRead = (type: "quote" | "contact" | "application", id: number) => {
    const key = getReadStorageKey(type, id);
    if (!readItems.has(key)) {
      safeSet(key, "true");
      setReadItems((prev) => new Set([...Array.from(prev), key]));
    }
  };

  const markAsUnread = (type: "quote" | "contact" | "application", id: number) => {
    const key = getReadStorageKey(type, id);
    safeRemove(key);
    setReadItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  };

  const toggleReadStatus = (type: "quote" | "contact" | "application", id: number) => {
    if (isItemRead(type, id)) {
      markAsUnread(type, id);
    } else {
      markAsRead(type, id);
    }
  };

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [quotesRes, contactsRes, applicationsRes] = await Promise.all([
        fetch("/api/quote-requests"),
        fetch("/api/contact-messages"),
        fetch("/api/job-applications"),
      ]);

      if (quotesRes.ok) {
        const data = await quotesRes.json();
        setQuotes(data.map((q: QuoteRequest) => ({ ...q, status: q.status || "new" })));
      }
      if (contactsRes.ok) {
        const data = await contactsRes.json();
        setContacts(data.map((c: ContactMessage) => ({ ...c, status: c.status || "new" })));
      }
      if (applicationsRes.ok) {
        const data = await applicationsRes.json();
        setApplications(data.map((a: JobApplication) => ({ ...a, status: a.status || "new" })));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUnreadCount = (type: "quote" | "contact" | "application") => {
    switch (type) {
      case "quote":
        return quotes.filter((q) => !isItemRead("quote", q.id)).length;
      case "contact":
        return contacts.filter((c) => !isItemRead("contact", c.id)).length;
      case "application":
        return applications.filter((a) => !isItemRead("application", a.id)).length;
    }
  };

  const tabs = [
    { id: "quotes" as TabType, label: "Quote Requests", icon: FileText, count: quotes.length, unreadCount: getUnreadCount("quote") },
    { id: "contacts" as TabType, label: "Contact Messages", icon: Mail, count: contacts.length, unreadCount: getUnreadCount("contact") },
    { id: "applications" as TabType, label: "Job Applications", icon: Briefcase, count: applications.length, unreadCount: getUnreadCount("application") },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const openDrawer = (item: QuoteRequest | ContactMessage | JobApplication) => {
    setSelectedItem(item);
    setDrawerOpen(true);

    // Automatically mark as read when opening
    if ("coverageType" in item) {
      markAsRead("quote", item.id);
    } else if ("position" in item && "experience" in item) {
      markAsRead("application", item.id);
    } else {
      markAsRead("contact", item.id);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  // Filter function
  const filterItems = <T extends { firstName: string; lastName: string; email: string; status?: string }>(
    items: T[]
  ): T[] => {
    return items.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusColors[status] || statusColors.new;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}
        style={{ borderRadius: RADIUS.pill }}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderQuotesTable = () => {
    const filteredQuotes = filterItems(quotes);

    if (filteredQuotes.length === 0) {
      return (
        <AdminEmptyState icon={FileText} title="No quote requests found" />
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Name</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Contact</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Coverage</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Location</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Status</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Date</th>
              <th className="text-right py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map((quote) => {
              const isRead = isItemRead("quote", quote.id);
              return (
                <tr
                  key={quote.id}
                  className={`transition-colors cursor-pointer ${!isRead ? "bg-blue-50/50" : ""}`}
                  style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                  onMouseEnter={(e) => { if (isRead) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = !isRead ? '' : 'transparent'; }}
                  onClick={() => openDrawer(quote)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {!isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                      <div>
                        <div className={`${!isRead ? "font-bold" : "font-medium"} text-gray-900`}>
                          {quote.firstName} {quote.lastName}
                        </div>
                        <div className="text-sm text-gray-500">DOB: {quote.birthDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`text-sm ${!isRead ? "font-semibold" : ""} text-gray-900`}>{quote.email}</div>
                    <div className="text-sm text-gray-500">{quote.phone}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`${!isRead ? "font-bold" : "font-medium"} text-gray-900`}>{formatCoverageType(quote.coverageType)}</div>
                    <div className="text-sm text-primary font-semibold">{quote.coverageAmount}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{quote.city}, {quote.state}</div>
                    <div className="text-sm text-gray-500">{quote.zipCode}</div>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={quote.status || "new"} />
                  </td>
                  <td className="py-4 px-4">
                    <div className={`text-sm ${!isRead ? "font-semibold text-gray-700" : "text-gray-500"}`}>
                      {formatDateShort(quote.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReadStatus("quote", quote.id);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors mr-1"
                      title={isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {isRead ? <Mail className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDrawer(quote);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContactsTable = () => {
    const filteredContacts = filterItems(contacts);

    if (filteredContacts.length === 0) {
      return (
        <AdminEmptyState icon={Mail} title="No contact messages found" />
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Name</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Contact</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Message Preview</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Status</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Date</th>
              <th className="text-right py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact) => {
              const isRead = isItemRead("contact", contact.id);
              return (
                <tr
                  key={contact.id}
                  className={`transition-colors cursor-pointer ${!isRead ? "bg-blue-50/50" : ""}`}
                  style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                  onMouseEnter={(e) => { if (isRead) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = !isRead ? '' : 'transparent'; }}
                  onClick={() => openDrawer(contact)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {!isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                      <div className={`${!isRead ? "font-bold" : "font-medium"} text-gray-900`}>
                        {contact.firstName} {contact.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`text-sm ${!isRead ? "font-semibold" : ""} text-gray-900`}>{contact.email}</div>
                    <div className="text-sm text-gray-500">{contact.phone || "No phone"}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`text-sm ${!isRead ? "font-semibold text-gray-800" : "text-gray-600"} max-w-xs truncate`}>
                      {contact.message}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={contact.status || "new"} />
                  </td>
                  <td className="py-4 px-4">
                    <div className={`text-sm ${!isRead ? "font-semibold text-gray-700" : "text-gray-500"}`}>
                      {formatDateShort(contact.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReadStatus("contact", contact.id);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors mr-1"
                      title={isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {isRead ? <Mail className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDrawer(contact);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderApplicationsTable = () => {
    const filteredApplications = filterItems(applications);

    if (filteredApplications.length === 0) {
      return (
        <AdminEmptyState icon={Briefcase} title="No job applications found" />
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Applicant</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Contact</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Position</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Licensed</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Status</th>
              <th className="text-left py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Date</th>
              <th className="text-right py-3 px-4" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => {
              const isRead = isItemRead("application", app.id);
              return (
                <tr
                  key={app.id}
                  className={`transition-colors cursor-pointer ${!isRead ? "bg-blue-50/50" : ""}`}
                  style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                  onMouseEnter={(e) => { if (isRead) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = !isRead ? '' : 'transparent'; }}
                  onClick={() => openDrawer(app)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {!isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                      <div>
                        <div className={`${!isRead ? "font-bold" : "font-medium"} text-gray-900`}>
                          {app.firstName} {app.lastName}
                        </div>
                        {app.linkedIn && (
                          <a
                            href={app.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`text-sm ${!isRead ? "font-semibold" : ""} text-gray-900`}>{app.email}</div>
                    <div className="text-sm text-gray-500">{app.phone}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`${!isRead ? "font-bold" : "font-medium"} text-gray-900`}>{app.position}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium ${
                        app.hasLicense === "yes" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                      style={{ borderRadius: RADIUS.pill }}
                    >
                      {app.hasLicense === "yes" ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={app.status || "new"} />
                  </td>
                  <td className="py-4 px-4">
                    <div className={`text-sm ${!isRead ? "font-semibold text-gray-700" : "text-gray-500"}`}>
                      {formatDateShort(app.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReadStatus("application", app.id);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors mr-1"
                      title={isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {isRead ? <Mail className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDrawer(app);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDetailDrawer = () => {
    if (!selectedItem) return null;

    const isQuote = "coverageType" in selectedItem;
    const isApplication = "position" in selectedItem && "experience" in selectedItem;

    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
            drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeDrawer}
        />

        {/* Drawer */}
        <div
          className={`fixed right-0 top-0 h-full w-full max-w-lg z-50 transform transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            ...GLASS.css.light,
            borderRadius: `${RADIUS.hero}px 0 0 ${RADIUS.hero}px`,
            boxShadow: SHADOW.hero,
          }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div
              className="flex items-center justify-between p-6"
              style={{ borderBottom: `1px solid ${GLASS.border}` }}
            >
              <div>
                <h2 style={{ fontSize: TYPE.title, fontWeight: 700, color: COLORS.gray[900] }}>
                  {selectedItem.firstName} {selectedItem.lastName}
                </h2>
                <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500], marginTop: 2 }}>
                  {isQuote ? "Quote Request" : isApplication ? "Job Application" : "Contact Message"}
                </p>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 hover:bg-gray-100 transition-colors"
                style={{ borderRadius: RADIUS.input }}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${selectedItem.email}`} className="text-primary hover:underline">
                      {selectedItem.email}
                    </a>
                  </div>
                  {"phone" in selectedItem && selectedItem.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a href={`tel:${selectedItem.phone}`} className="text-primary hover:underline">
                        {selectedItem.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{formatDate(selectedItem.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Quote-specific details */}
              {isQuote && (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Coverage Request</h3>
                    <div className="bg-primary/5 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="font-semibold text-gray-900">{formatCoverageType((selectedItem as QuoteRequest).coverageType)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-semibold text-primary">{(selectedItem as QuoteRequest).coverageAmount}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Address</h3>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="text-gray-600">
                        <p>{(selectedItem as QuoteRequest).streetAddress}</p>
                        {(selectedItem as QuoteRequest).addressLine2 && (
                          <p>{(selectedItem as QuoteRequest).addressLine2}</p>
                        )}
                        <p>{(selectedItem as QuoteRequest).city}, {(selectedItem as QuoteRequest).state} {(selectedItem as QuoteRequest).zipCode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Client Profile</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Birth Date</p>
                        <p className="font-medium text-gray-900">{(selectedItem as QuoteRequest).birthDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Age/Info</p>
                        <p className="font-medium text-gray-900">{(selectedItem as QuoteRequest).height}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gender/Info</p>
                        <p className="font-medium text-gray-900">{(selectedItem as QuoteRequest).weight}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Full Application Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-gray-700 whitespace-pre-wrap text-sm font-sans">{(selectedItem as QuoteRequest).medicalBackground}</pre>
                    </div>
                  </div>
                </>
              )}

              {/* Application-specific details */}
              {isApplication && (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Position Details</h3>
                    <div className="bg-primary/5 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Position</p>
                          <p className="font-semibold text-gray-900">{(selectedItem as JobApplication).position}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Licensed</p>
                          <p className="font-semibold text-gray-900">
                            {(selectedItem as JobApplication).hasLicense === "yes" ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                      {(selectedItem as JobApplication).linkedIn && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <a
                            href={(selectedItem as JobApplication).linkedIn!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Experience</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{(selectedItem as JobApplication).experience}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Why Heritage?</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{(selectedItem as JobApplication).whyJoinUs}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Contact message */}
              {!isQuote && !isApplication && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Message</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{(selectedItem as ContactMessage).message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div
              className="p-6"
              style={{
                borderTop: `1px solid ${GLASS.border}`,
                ...GLASS.css.standard,
                borderRadius: 0,
              }}
            >
              <div className="flex gap-3">
                <a
                  href={`mailto:${selectedItem.email}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </a>
                {"phone" in selectedItem && selectedItem.phone && (
                  <a
                    href={`tel:${selectedItem.phone}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <AdminLoungeLayout breadcrumbs={[{ label: 'Submissions' }]}>
        <AdminStaggerContainer>
          {/* Hero Header */}
          <AdminPageHero
            icon={Inbox}
            title="Submissions"
            subtitle="Manage quote requests, contact messages, and job applications"
            actions={
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: RADIUS.button,
                  border: '1px solid rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            }
          />

          {/* Stats Cards */}
          <AdminStatCardGrid cols={3}>
            <AdminStatCard
              icon={FileText}
              iconColor="text-blue-500"
              value={quotes.length}
              label="Quote Requests"
              sub={(() => {
                const unreadCount = quotes.filter((q) => !isItemRead("quote", q.id)).length;
                return unreadCount > 0 ? `${unreadCount} unread` : "All read";
              })()}
            />
            <AdminStatCard
              icon={Mail}
              iconColor="text-green-500"
              value={contacts.length}
              label="Contact Messages"
              sub={(() => {
                const unreadCount = contacts.filter((c) => !isItemRead("contact", c.id)).length;
                return unreadCount > 0 ? `${unreadCount} unread` : "All read";
              })()}
            />
            <AdminStatCard
              icon={Briefcase}
              iconColor="text-purple-500"
              value={applications.length}
              label="Job Applications"
              sub={(() => {
                const unreadCount = applications.filter((a) => !isItemRead("application", a.id)).length;
                return unreadCount > 0 ? `${unreadCount} unread` : "All read";
              })()}
            />
          </AdminStatCardGrid>

          {/* Main Content Card */}
          <AdminGlassCard style={{ padding: 0, overflow: 'hidden' }}>
            {/* Tabs */}
            <div className="overflow-x-auto" style={{ borderBottom: `1px solid ${GLASS.border}` }}>
              <div className="flex min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex items-center gap-2 px-3 md:px-6 py-3 md:py-4 font-medium transition-all relative whitespace-nowrap"
                      style={{
                        color: isActive ? '#fff' : COLORS.gray[500],
                        background: isActive ? ADMIN_GRADIENT : 'transparent',
                        borderRadius: isActive ? `${RADIUS.input}px ${RADIUS.input}px 0 0` : undefined,
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = COLORS.gray[700]; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = COLORS.gray[500]; }}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-sm md:text-base">{tab.label}</span>
                      {tab.unreadCount > 0 ? (
                        <span
                          className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white font-semibold"
                          style={{ borderRadius: RADIUS.pill }}
                        >
                          {tab.unreadCount}
                        </span>
                      ) : (
                        <span
                          className="ml-2 px-2 py-0.5 text-xs"
                          style={{
                            borderRadius: RADIUS.pill,
                            background: isActive ? 'rgba(255,255,255,0.2)' : COLORS.gray[100],
                            color: isActive ? 'rgba(255,255,255,0.9)' : COLORS.gray[600],
                          }}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search and Filters */}
            <div
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
              style={{
                padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                borderBottom: `1px solid ${GLASS.border}`,
              }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 md:py-2 border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm md:text-base"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 md:py-2 border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white text-sm md:text-base"
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="viewed">Viewed</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <button
                  onClick={() => {
                    const type = activeTab === "quotes" ? "quote" : activeTab === "contacts" ? "contact" : "application";
                    const items = activeTab === "quotes" ? quotes : activeTab === "contacts" ? contacts : applications;
                    items.forEach((item) => markAsRead(type, item.id));
                  }}
                  className="inline-flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
                  style={{ borderRadius: RADIUS.input }}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark all as read</span>
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              ) : (
                <>
                  {activeTab === "quotes" && renderQuotesTable()}
                  {activeTab === "contacts" && renderContactsTable()}
                  {activeTab === "applications" && renderApplicationsTable()}
                </>
              )}
            </div>
          </AdminGlassCard>
        </AdminStaggerContainer>

      {/* Detail Drawer */}
      {renderDetailDrawer()}
    </AdminLoungeLayout>
  );
}
