import { Phone } from "lucide-react";
import { motion } from "framer-motion";

export function MobileCallButton() {
  return (
    <motion.a
      href="tel:+16305550123"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      className="fixed bottom-4 left-4 md:hidden z-50 flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-full shadow-lg hover:bg-secondary/90 transition-colors"
      data-testid="mobile-call-button"
    >
      <Phone className="w-5 h-5" />
      <span className="font-semibold text-sm">Call Now</span>
    </motion.a>
  );
}
