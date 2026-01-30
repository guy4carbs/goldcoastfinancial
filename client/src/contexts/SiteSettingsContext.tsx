import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface SiteSettings {
  // General
  company_name?: string;
  company_tagline?: string;

  // Contact
  company_phone?: string;
  company_email?: string;
  company_address?: string;
  company_address_line2?: string;
  company_city?: string;
  company_state?: string;
  company_zip?: string;
  business_hours?: string;
  business_hours_weekday?: string;
  business_hours_weekend?: string;

  // Social
  social_facebook?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_instagram?: string;
  social_youtube?: string;

  // SEO
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;

  // Branding
  brand_primary_color?: string;
  brand_secondary_color?: string;

  // Allow any other settings
  [key: string]: string | undefined;
}

interface SiteSettingsContextValue {
  settings: SiteSettings;
  isLoading: boolean;
  error: Error | null;
  getSetting: (key: string, defaultValue?: string) => string;
  getPhone: () => { display: string; href: string };
  getEmail: () => { display: string; href: string };
  getAddress: () => { lines: string[]; full: string };
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

// Default values to use while loading or if settings don't exist
const DEFAULTS: SiteSettings = {
  company_name: "HERITAGE",
  company_tagline: "Life Solutions",
  company_phone: "(630) 778-0800",
  company_email: "contact@heritagels.org",
  company_address: "1240 Iroquois Ave",
  company_address_line2: "Suite 506",
  company_city: "Naperville",
  company_state: "IL",
  company_zip: "60563",
  business_hours: "Monday - Friday, 9:00 AM - 5:00 PM CT",
  business_hours_weekday: "9:00 AM - 5:00 PM CT",
  business_hours_weekend: "Closed",
};

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data: settings = {}, isLoading, error } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/public/settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/public/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  const getSetting = (key: string, defaultValue?: string): string => {
    return settings[key] || DEFAULTS[key] || defaultValue || "";
  };

  const getPhone = () => {
    const phone = getSetting("company_phone", DEFAULTS.company_phone);
    // Convert display format to href format
    const phoneDigits = phone.replace(/\D/g, "");
    return {
      display: phone,
      href: `tel:${phoneDigits}`,
    };
  };

  const getEmail = () => {
    const email = getSetting("company_email", DEFAULTS.company_email);
    return {
      display: email,
      href: `mailto:${email}`,
    };
  };

  const getAddress = () => {
    const line1 = getSetting("company_address", DEFAULTS.company_address);
    const line2 = getSetting("company_address_line2", DEFAULTS.company_address_line2);
    const city = getSetting("company_city", DEFAULTS.company_city);
    const state = getSetting("company_state", DEFAULTS.company_state);
    const zip = getSetting("company_zip", DEFAULTS.company_zip);

    const lines = [line1];
    if (line2) lines.push(line2);
    lines.push(`${city}, ${state} ${zip}`);

    return {
      lines,
      full: lines.join(", "),
    };
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings: { ...DEFAULTS, ...settings },
        isLoading,
        error: error as Error | null,
        getSetting,
        getPhone,
        getEmail,
        getAddress,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
}
