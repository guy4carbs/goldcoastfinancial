import { useState, useEffect } from "react";
import { X, Mail, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewsletterBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    agreedToTerms: false
  });

  useEffect(() => {
    // Temporarily force visible for testing - remove localStorage check
    setIsVisible(true);
    // const dismissed = localStorage.getItem("newsletter-dismissed");
    // const subscribed = localStorage.getItem("newsletter-subscribed");
    // if (!dismissed && !subscribed) {
    //   setIsVisible(true);
    // }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // localStorage.setItem("newsletter-dismissed", "true"); // Disabled for testing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.agreedToTerms) return;

    setIsLoading(true);

    // Simulate API call - replace with actual newsletter signup
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    setIsSubmitted(true);
    localStorage.setItem("newsletter-subscribed", "true");

    // Close modal after showing success
    setTimeout(() => {
      setIsModalOpen(false);
      setIsVisible(false);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Banner */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Left side - Message */}
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <span className="text-white/90 hidden sm:inline">Get weekly tips on life insurance & retirement planning</span>
              <span className="text-white/90 sm:hidden">Get weekly insurance tips</span>
            </div>

            {/* Right side - CTA and Dismiss */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 px-4 py-2 md:py-1.5 text-sm font-medium bg-violet-500 text-primary rounded-lg hover:bg-white transition-colors"
              >
                Subscribe
                <ChevronRight className="w-4 h-4" />
              </button>

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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-2 sm:mx-auto p-4 z-50"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-primary px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-500/20 rounded-lg">
                        <Mail className="w-5 h-5 text-violet-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Stay Informed</h3>
                        <p className="text-white/70 text-sm">Weekly tips & insights</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-1 text-white/60 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <div className="p-6">
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">You're subscribed!</h4>
                      <p className="text-gray-600">Thanks for joining. Check your inbox soon.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder="Smith"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="agreedToTerms"
                          id="agreedToTerms"
                          checked={formData.agreedToTerms}
                          onChange={handleChange}
                          required
                          className="mt-1 w-4 h-4 text-violet-500 border-gray-300 rounded focus:ring-violet-500"
                        />
                        <label htmlFor="agreedToTerms" className="text-sm text-gray-600">
                          I agree to receive emails from Heritage Life Solutions. I understand I can unsubscribe at any time. View our{" "}
                          <a href="/privacy" className="text-violet-500 hover:underline">Privacy Policy</a>
                          {" "}and{" "}
                          <a href="/terms" className="text-violet-500 hover:underline">Terms of Service</a>.
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || !formData.agreedToTerms}
                        className="w-full py-3 bg-violet-500 text-primary font-semibold rounded-lg hover:bg-violet-500/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Subscribing..." : "Subscribe to Newsletter"}
                      </button>

                      <p className="text-xs text-gray-500 text-center">
                        We respect your privacy. No spam, ever.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
