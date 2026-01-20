import { motion, AnimatePresence } from "framer-motion";
import { X, User, ExternalLink, Phone, Mail } from "lucide-react";

interface ClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const carrierPortals = [
  { name: "Protective Life", url: "https://www.protective.com/login" },
  { name: "North American", url: "https://www.nacolah.com/login" },
  { name: "Transamerica", url: "https://www.transamerica.com/login" },
  { name: "Lincoln Financial", url: "https://www.lfg.com/login" },
  { name: "Pacific Life", url: "https://www.pacificlife.com/login" },
  { name: "Nationwide", url: "https://www.nationwide.com/login" },
];

export default function ClientPortalModal({ isOpen, onClose }: ClientPortalModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-heritage-primary">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-heritage-accent/20 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-heritage-accent" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Client Portal</h2>
                    <p className="text-white/70 text-sm">Access your policy information</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-6">
                  To access your policy details, please visit your insurance carrier's portal directly.
                  Select your carrier below:
                </p>

                <div className="space-y-2 mb-6">
                  {carrierPortals.map((portal) => (
                    <a
                      key={portal.name}
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                      <span className="font-medium text-gray-900">{portal.name}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-heritage-primary transition-colors" />
                    </a>
                  ))}
                </div>

                <div className="bg-heritage-accent/10 rounded-xl p-4">
                  <p className="text-sm font-medium text-heritage-primary mb-2">Don't see your carrier?</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Contact us and we'll help you access your policy information.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href="tel:6307780800"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-heritage-primary text-white rounded-lg text-sm font-medium hover:bg-heritage-primary/90 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      (630) 778-0800
                    </a>
                    <a
                      href="mailto:support@heritagels.com"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Email Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
