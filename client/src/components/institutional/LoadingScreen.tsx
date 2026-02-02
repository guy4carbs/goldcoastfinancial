import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Check if we've already shown loading screen this session
    const hasShownLoading = sessionStorage.getItem("gcf-loaded");

    if (hasShownLoading) {
      setIsLoading(false);
      setHasLoaded(true);
      return;
    }

    // Show loading screen for first visit
    const timer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem("gcf-loaded", "true");
    }, 1500);

    // Also listen for page load
    const handleLoad = () => {
      setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem("gcf-loaded", "true");
      }, 500);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  // Don't render anything if already loaded
  if (hasLoaded && !isLoading) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center"
        >
          {/* Logo animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            {/* GCF Monogram */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-6xl font-serif font-bold text-white tracking-tight"
              >
                <span className="text-secondary">G</span>
                <span className="text-white/90">C</span>
                <span className="text-white/80">F</span>
              </motion.div>

              {/* Underline animation */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeInOut" }}
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary via-secondary to-transparent origin-left"
              />
            </div>
          </motion.div>

          {/* Company name */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-6 text-sm uppercase tracking-[0.3em] text-white/50"
          >
            Gold Coast Financial
          </motion.p>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex gap-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-secondary"
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
