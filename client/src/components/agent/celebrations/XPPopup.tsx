import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { xpPopVariants } from "@/lib/animations";

interface XPPopupProps {
  amount: number;
  isVisible: boolean;
  onComplete?: () => void;
  position?: { x: number; y: number };
}

export function XPPopup({ amount, isVisible, onComplete, position }: XPPopupProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          variants={xpPopVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed z-50 pointer-events-none"
          style={{
            left: position?.x ?? "50%",
            top: position?.y ?? "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-200 rounded-full shadow-lg">
            <Zap className="w-5 h-5 text-white fill-white" />
            <span className="text-white font-bold text-lg">+{amount} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default XPPopup;
