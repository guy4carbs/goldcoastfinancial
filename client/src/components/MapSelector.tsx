import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";

interface MapSelectorProps {
  children: React.ReactNode;
  address?: string;
  className?: string;
}

const HERITAGE_ADDRESS = "1240 Iroquois Ave, Suite 506, Naperville, IL 60563";
const GOOGLE_MAPS_URL = "https://maps.google.com/?q=1240+Iroquois+Ave,+Suite+506,+Naperville,+IL+60563";
const APPLE_MAPS_URL = "https://maps.apple.com/?address=1240+Iroquois+Ave,+Suite+506,+Naperville,+IL+60563";

export default function MapSelector({ children, address = HERITAGE_ADDRESS, className = "" }: MapSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenMaps = (type: "google" | "apple") => {
    const url = type === "google" ? GOOGLE_MAPS_URL : APPLE_MAPS_URL;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={popupRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-left cursor-pointer hover:text-heritage-primary transition-colors"
      >
        {children}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-4 min-w-[220px]"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-heritage-primary">Open in Maps</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleOpenMaps("apple")}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Apple Maps</p>
                  <p className="text-xs text-gray-500">Open in Apple Maps</p>
                </div>
              </button>

              <button
                onClick={() => handleOpenMaps("google")}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-red-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Google Maps</p>
                  <p className="text-xs text-gray-500">Open in Google Maps</p>
                </div>
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center">{address}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
