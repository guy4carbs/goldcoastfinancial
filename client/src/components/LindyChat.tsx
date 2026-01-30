import { useEffect } from "react";
import { useLocation } from "wouter";

export function LindyChat() {
  const [location] = useLocation();

  // Don't show on admin or agent pages
  const isAdminOrAgent = location.startsWith("/admin") || location.startsWith("/agents");

  useEffect(() => {
    if (isAdminOrAgent) {
      // Remove Lindy widget if it exists
      const lindyWidget = document.querySelector('[data-lindy-widget]') ||
                          document.getElementById('lindy-embed-root') ||
                          document.querySelector('iframe[src*="lindy"]');
      if (lindyWidget) {
        lindyWidget.remove();
      }
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="lindy"]');
    if (existingScript) return;

    // Load Lindy script
    const script = document.createElement("script");
    script.src = "https://api.lindy.ai/api/lindyEmbed/lindyEmbed.js?a=0b81f07b-c8a5-426a-b112-c3af7418b04d";
    script.async = true;
    script.crossOrigin = "use-credentials";
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      const widget = document.querySelector('[data-lindy-widget]') ||
                     document.getElementById('lindy-embed-root') ||
                     document.querySelector('iframe[src*="lindy"]');
      if (widget) {
        widget.remove();
      }
    };
  }, [isAdminOrAgent]);

  return null;
}
