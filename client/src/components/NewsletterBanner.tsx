import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";

export default function NewsletterBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("newsletter-dismissed");
    const subscribed = localStorage.getItem("newsletter-subscribed");
    if (!dismissed && !subscribed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("newsletter-dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Simulate API call - replace with actual newsletter signup
    await new Promise(resolve => setTimeout(resolve, 800));

    setIsLoading(false);
    setIsSubmitted(true);
    localStorage.setItem("newsletter-subscribed", "true");

    // Hide after showing success
    setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-heritage-primary text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Message */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-heritage-accent" />
            <span className="text-white/90">Get weekly tips on life insurance & retirement planning</span>
          </div>

          {/* Mobile message */}
          <div className="sm:hidden flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-heritage-accent" />
            <span className="text-white/90">Get weekly tips</span>
          </div>

          {/* Right side - Form or Success */}
          <div className="flex items-center gap-3">
            {isSubmitted ? (
              <span className="text-heritage-accent text-sm font-medium">Thanks for subscribing!</span>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-36 sm:w-48 px-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-heritage-accent"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 text-sm font-medium bg-heritage-accent text-heritage-primary rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
                  {isLoading ? "..." : "Subscribe"}
                </button>
              </form>
            )}

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="p-1 text-white/60 hover:text-white transition-colors"
              aria-label="Dismiss newsletter banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
