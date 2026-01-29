import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { overlayVariants, modalVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type DialogVariant = "info" | "warning" | "danger" | "success";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  isLoading?: boolean;
  icon?: LucideIcon;
}

const variantConfig: Record<DialogVariant, {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  confirmBg: string;
}> = {
  info: {
    icon: Info,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    confirmBg: "bg-blue-600 hover:bg-blue-700",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    confirmBg: "bg-yellow-600 hover:bg-yellow-700",
  },
  danger: {
    icon: XCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmBg: "bg-red-600 hover:bg-red-700",
  },
  success: {
    icon: CheckCircle,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    confirmBg: "bg-green-600 hover:bg-green-700",
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "info",
  isLoading = false,
  icon: CustomIcon,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
                config.iconBg
              )}>
                <Icon className={cn("w-6 h-6", config.iconColor)} />
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-primary mb-2">
                  {title}
                </h3>
                <p className="text-gray-600">{message}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  className={cn("flex-1 text-white", config.confirmBg)}
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
