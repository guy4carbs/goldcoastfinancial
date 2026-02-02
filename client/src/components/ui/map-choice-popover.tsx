import { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MapChoicePopoverProps {
  address: string;
  addressLine2?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

const ENCODED_ADDRESS = "1240+Iroquois+Ave+Suite+506+Naperville+IL+60563";
const APPLE_MAPS_URL = `https://maps.apple.com/?address=1240+Iroquois+Ave,+Suite+506,+Naperville,+IL+60563`;
const GOOGLE_MAPS_URL = `https://maps.google.com/?q=${ENCODED_ADDRESS}`;

export function MapChoicePopover({
  address,
  addressLine2,
  className = "",
  iconClassName = "w-4 h-4 text-[hsl(42,60%,55%)] mt-0.5 shrink-0",
  textClassName = "text-white/60 hover:text-white"
}: MapChoicePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`${textClassName} transition-colors flex items-start gap-2 group text-left`}
      >
        <MapPin className={`${iconClassName} group-hover:scale-110 transition-transform`} />
        <span className="leading-relaxed">
          {address}
          {addressLine2 && (
            <>
              <br />
              {addressLine2}
            </>
          )}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 bottom-full mb-2 z-50 bg-white rounded-lg shadow-xl border border-border/60 overflow-hidden min-w-[200px]"
          >
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-3 py-2 font-medium">Open in Maps</p>
              <a
                href={APPLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 rounded-md transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-primary">Apple Maps</span>
              </a>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 rounded-md transition-colors"
              >
                <div className="w-8 h-8 bg-white border border-border/60 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M12 11.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
                    <path fill="#EA4335" d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13l1.62-1.89A37.17 37.17 0 0019 9a7 7 0 00-7-7z"/>
                    <path fill="#34A853" d="M5 9c0 5.25 7 13 7 13l1.62-1.89A37.17 37.17 0 0019 9H5z" opacity="0.5"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-primary">Google Maps</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
