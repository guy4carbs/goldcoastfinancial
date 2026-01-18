import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Bell, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface Announcement {
  id: string;
  message: string;
  link?: string;
  linkText?: string;
  isExternal?: boolean;
  type?: "info" | "update" | "important";
  expiresAt?: Date;
}

// Configure announcements here or fetch from API
const announcements: Announcement[] = [
  {
    id: "2026-q1-update",
    message: "Gold Coast Financial enters second year of operations with continued growth.",
    link: "/goldcoastfinancial2/news",
    linkText: "Read more",
    type: "update",
  },
];

interface AnnouncementBannerProps {
  className?: string;
}

export function InstitutionalAnnouncementBanner({ className = "" }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    // Filter out expired announcements
    const validAnnouncements = announcements.filter(
      (a) => !a.expiresAt || new Date(a.expiresAt) > new Date()
    );

    if (validAnnouncements.length === 0) return;

    // Check if user has dismissed this announcement
    const dismissedIds = JSON.parse(localStorage.getItem("dismissedAnnouncements") || "[]");
    const unDismissed = validAnnouncements.filter((a) => !dismissedIds.includes(a.id));

    if (unDismissed.length > 0) {
      setCurrentAnnouncement(unDismissed[0]);
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    if (currentAnnouncement) {
      const dismissedIds = JSON.parse(localStorage.getItem("dismissedAnnouncements") || "[]");
      dismissedIds.push(currentAnnouncement.id);
      localStorage.setItem("dismissedAnnouncements", JSON.stringify(dismissedIds));
    }
    setIsVisible(false);
  };

  const getTypeStyles = (type?: string) => {
    switch (type) {
      case "important":
        return "bg-[hsl(348,65%,20%)]";
      case "update":
        return "bg-gradient-to-r from-[hsl(348,65%,18%)] to-[hsl(348,65%,22%)]";
      default:
        return "bg-[hsl(348,65%,20%)]";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && currentAnnouncement && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`${getTypeStyles(currentAnnouncement.type)} text-white overflow-hidden ${className}`}
        >
          <div className="container mx-auto px-6 lg:px-12">
            <div className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Bell className="w-4 h-4 text-[hsl(42,60%,55%)] shrink-0" />
                <p className="text-sm text-white/90">
                  {currentAnnouncement.message}
                </p>
                {currentAnnouncement.link && (
                  currentAnnouncement.isExternal ? (
                    <a
                      href={currentAnnouncement.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(42,60%,55%)] hover:text-[hsl(42,60%,65%)] transition-colors shrink-0"
                    >
                      {currentAnnouncement.linkText || "Learn more"}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link
                      href={currentAnnouncement.link}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(42,60%,55%)] hover:text-[hsl(42,60%,65%)] transition-colors shrink-0"
                    >
                      {currentAnnouncement.linkText || "Learn more"}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )
                )}
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/10 rounded-sm transition-colors shrink-0"
                aria-label="Dismiss announcement"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
