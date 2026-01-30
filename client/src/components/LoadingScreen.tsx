import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  minDisplayTime?: number; // Minimum time to show loading screen (ms)
}

export default function LoadingScreen({ minDisplayTime = 1500 }: LoadingScreenProps) {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Check if we've already shown loading for this page in this session
    const sessionKey = `loaded-${window.location.pathname}`;
    const alreadyLoaded = sessionStorage.getItem(sessionKey);

    if (alreadyLoaded) {
      setShowLoading(false);
      return;
    }

    // Show loading screen for minimum time
    const timer = setTimeout(() => {
      setShowLoading(false);
      sessionStorage.setItem(sessionKey, "true");
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  return (
    <AnimatePresence>
      {showLoading && (
        <>
          {/* Left Curtain */}
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            className="fixed inset-y-0 left-0 w-1/2 bg-primary z-[9999]"
          />

          {/* Right Curtain */}
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            className="fixed inset-y-0 right-0 w-1/2 bg-primary z-[9999]"
          />

          {/* Center Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center"
            >
              {/* Pulsing Logo */}
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.img
                  src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b"
                  alt="Heritage Life Solutions"
                  className="h-32 md:h-44 lg:h-52 w-auto object-contain rounded-xl shadow-2xl"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(124, 58, 237, 0)",
                      "0 0 60px 15px rgba(124, 58, 237, 0.5)",
                      "0 0 0 0 rgba(124, 58, 237, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(124, 58, 237, 0.4)",
                      "0 0 0 25px rgba(124, 58, 237, 0)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              </motion.div>

              {/* Loading text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-white/80 text-base md:text-lg font-medium tracking-wide"
              >
                Protecting What Matters
              </motion.p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
