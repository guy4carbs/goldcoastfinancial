import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    // Check if user has dismissed the banner
    return !sessionStorage.getItem("gcf-newsletter-dismissed");
  });
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("gcf-newsletter-dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call - replace with actual newsletter subscription
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setTimeout(() => {
        handleDismiss();
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-primary text-white overflow-hidden"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left content */}
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary hidden sm:block" />
                <p className="text-sm text-center sm:text-left">
                  <span className="font-medium">Stay informed.</span>{" "}
                  <span className="text-white/80">
                    Subscribe to investor updates and press releases.
                  </span>
                </p>
              </div>

              {/* Form or success message */}
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-secondary"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Subscribed!</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-9 w-48 sm:w-56 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm focus:border-secondary"
                    />
                    {error && (
                      <p className="absolute -bottom-5 left-0 text-xs text-red-300">{error}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-9"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Subscribe
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute right-4 sm:relative sm:right-auto p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Inline newsletter signup for footer/sections
export function NewsletterInline({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className={`flex items-center gap-2 text-secondary ${className}`}>
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm">Thank you for subscribing!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <Input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "..." : "Subscribe"}
      </Button>
    </form>
  );
}
