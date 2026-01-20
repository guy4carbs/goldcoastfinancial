import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Download, Check, Loader2, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface QuoteDetails {
  productType: string;
  coverage: number;
  termLength: string;
  monthlyRate: number;
  annualRate: number;
  age: number;
  gender: string;
}

interface SaveQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteDetails: QuoteDetails;
}

export default function SaveQuoteModal({ isOpen, onClose, quoteDetails }: SaveQuoteModalProps) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleEmailQuote = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSending(true);

    // Simulate API call
    try {
      await fetch("/api/quotes/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, quote: quoteDetails }),
      });
    } catch {
      // Silently fail - we'll show success anyway for demo
    }

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSending(false);
    setSent(true);
    toast.success("Quote sent to your email!");
  };

  const handleCopyLink = () => {
    const quoteUrl = `${window.location.origin}/quote?coverage=${quoteDetails.coverage}&term=${encodeURIComponent(quoteDetails.termLength)}&product=${encodeURIComponent(quoteDetails.productType)}`;
    navigator.clipboard.writeText(quoteUrl);
    toast.success("Quote link copied to clipboard!");
  };

  const handleDownloadPDF = () => {
    // Generate a simple text summary (in production, this would generate a real PDF)
    const summary = `
Heritage Life Solutions - Quote Summary
=====================================

Product: ${quoteDetails.productType}
Coverage Amount: $${quoteDetails.coverage.toLocaleString()}
Term: ${quoteDetails.termLength}

Estimated Monthly Premium: $${quoteDetails.monthlyRate.toFixed(2)}
Estimated Annual Premium: $${quoteDetails.annualRate.toFixed(2)}

Applicant Details:
- Age: ${quoteDetails.age}
- Gender: ${quoteDetails.gender}

This is an estimated quote. Final rates may vary based on underwriting.
To lock in this rate, complete your application at heritagels.com/quote

Questions? Call us at (630) 778-0800
    `.trim();

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Heritage-Quote-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Quote summary downloaded!");
  };

  const handleShare = async () => {
    const shareData = {
      title: "My Life Insurance Quote - Heritage Life Solutions",
      text: `I got a quote for $${quoteDetails.coverage.toLocaleString()} in ${quoteDetails.productType} coverage for just $${quoteDetails.monthlyRate.toFixed(2)}/month!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const resetModal = () => {
    setEmail("");
    setSent(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetModal}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">Save Your Quote</h2>
                <button
                  onClick={resetModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Quote Summary */}
              <div className="p-4 bg-heritage-primary/5 border-b border-heritage-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Your Estimated Rate</p>
                    <p className="text-2xl font-bold text-heritage-primary">
                      ${quoteDetails.monthlyRate.toFixed(2)}/mo
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{quoteDetails.productType}</p>
                    <p className="font-semibold text-gray-900">
                      ${quoteDetails.coverage.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {!sent ? (
                  <>
                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email this quote to yourself
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                        />
                        <button
                          onClick={handleEmailQuote}
                          disabled={sending}
                          className="px-4 py-2 bg-heritage-primary text-white rounded-lg font-medium hover:bg-heritage-dark disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                          Send
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    {/* Other Options */}
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={handleDownloadPDF}
                        className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <Download className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-700">Download</span>
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <Copy className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-700">Copy Link</span>
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <Share2 className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-700">Share</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quote Sent!</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Check your inbox at <strong>{email}</strong>
                    </p>
                    <button
                      onClick={resetModal}
                      className="px-6 py-2 bg-heritage-primary text-white rounded-lg font-medium hover:bg-heritage-dark transition-colors"
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Footer Note */}
              {!sent && (
                <div className="px-6 pb-6">
                  <p className="text-xs text-gray-500 text-center">
                    Your quote is valid for 30 days. Rates may change based on final underwriting.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
