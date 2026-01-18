import { useEffect } from "react";
import { useLocation } from "wouter";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalPath?: string;
  noIndex?: boolean;
}

const defaultMeta = {
  siteName: "Gold Coast Financial",
  defaultTitle: "Gold Coast Financial | Institutional Financial Services",
  defaultDescription: "Gold Coast Financial is a diversified financial services holding company providing governance, capital stewardship, and strategic oversight to regulated insurance and advisory businesses across the United States.",
  defaultKeywords: "financial services, holding company, institutional investor, insurance, capital management, Naperville Illinois",
  baseUrl: "https://goldcoastfinancial.co",
};

// Page-specific SEO configurations
export const pageSEO: Record<string, SEOProps> = {
  "/goldcoastfinancial2": {
    title: "Gold Coast Financial | Institutional Financial Services Holding Company",
    description: "Gold Coast Financial is a diversified financial services holding company providing governance, capital stewardship, and strategic oversight to regulated insurance and advisory businesses.",
    keywords: "holding company, financial services, institutional investor, capital stewardship, insurance holdings",
  },
  "/goldcoastfinancial2/about": {
    title: "About Us | Gold Coast Financial",
    description: "Learn about Gold Coast Financial's leadership, mission, and commitment to long-term value creation through disciplined capital allocation and operational excellence.",
    keywords: "about gold coast financial, leadership team, company history, mission values, financial services",
  },
  "/goldcoastfinancial2/portfolio": {
    title: "Portfolio Companies | Gold Coast Financial",
    description: "Explore Gold Coast Financial's portfolio of regulated financial services businesses, including Heritage Life Solutions and planned expansions in insurance and advisory services.",
    keywords: "portfolio companies, Heritage Life Solutions, insurance holdings, financial services portfolio",
  },
  "/goldcoastfinancial2/contact": {
    title: "Contact Us | Gold Coast Financial",
    description: "Connect with Gold Coast Financial for partnership opportunities, corporate inquiries, and institutional discussions. Located in Naperville, Illinois.",
    keywords: "contact gold coast financial, corporate inquiries, partnership opportunities, Naperville Illinois",
  },
  "/goldcoastfinancial2/news": {
    title: "News & Updates | Gold Coast Financial",
    description: "Stay informed with the latest corporate announcements, milestones, and company updates from Gold Coast Financial.",
    keywords: "company news, corporate announcements, press releases, company updates",
  },
  "/goldcoastfinancial2/investors": {
    title: "Investor Relations | Gold Coast Financial",
    description: "Access investor information, capital philosophy, and partnership opportunities with Gold Coast Financial.",
    keywords: "investor relations, capital partners, investment opportunities, financial performance",
  },
  "/goldcoastfinancial2/careers": {
    title: "Careers | Gold Coast Financial",
    description: "Join Gold Coast Financial's team. Explore career opportunities in financial services, insurance, and corporate operations.",
    keywords: "careers, jobs, employment, financial services careers, insurance jobs",
  },
  "/goldcoastfinancial2/blog": {
    title: "Insights & Perspectives | Gold Coast Financial",
    description: "Industry insights, market perspectives, and thought leadership from Gold Coast Financial's leadership team.",
    keywords: "industry insights, thought leadership, financial services blog, market perspectives",
  },
  "/goldcoastfinancial2/media": {
    title: "Media Center | Gold Coast Financial",
    description: "Press resources, executive photos, brand assets, and media contact information for Gold Coast Financial.",
    keywords: "press kit, media resources, brand assets, press contact",
  },
  "/goldcoastfinancial2/privacy": {
    title: "Privacy Policy | Gold Coast Financial",
    description: "Gold Coast Financial's privacy policy detailing how we collect, use, and protect your personal information.",
    keywords: "privacy policy, data protection, personal information",
  },
  "/goldcoastfinancial2/terms": {
    title: "Terms of Use | Gold Coast Financial",
    description: "Terms and conditions governing the use of Gold Coast Financial's website and services.",
    keywords: "terms of use, terms and conditions, legal",
  },
};

export function InstitutionalSEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  canonicalPath,
  noIndex = false,
}: SEOProps) {
  const [location] = useLocation();
  const currentPath = canonicalPath || location;

  // Get page-specific SEO or use defaults
  const pageMeta = pageSEO[currentPath] || {};
  const finalTitle = title || pageMeta.title || defaultMeta.defaultTitle;
  const finalDescription = description || pageMeta.description || defaultMeta.defaultDescription;
  const finalKeywords = keywords || pageMeta.keywords || defaultMeta.defaultKeywords;
  const canonicalUrl = `${defaultMeta.baseUrl}${currentPath}`;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Helper to update or create meta tag
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Update meta tags
    updateMeta("description", finalDescription);
    updateMeta("keywords", finalKeywords);
    updateMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    // Open Graph tags
    updateMeta("og:title", finalTitle, true);
    updateMeta("og:description", finalDescription, true);
    updateMeta("og:type", ogType, true);
    updateMeta("og:url", canonicalUrl, true);
    updateMeta("og:site_name", defaultMeta.siteName, true);
    if (ogImage) {
      updateMeta("og:image", ogImage, true);
    }

    // Twitter Card tags
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", finalTitle);
    updateMeta("twitter:description", finalDescription);
    if (ogImage) {
      updateMeta("twitter:image", ogImage);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Cleanup function
    return () => {
      // Title will be updated by next page
    };
  }, [finalTitle, finalDescription, finalKeywords, canonicalUrl, ogImage, ogType, noIndex]);

  return null;
}

// Schema.org structured data component
export function InstitutionalSchema() {
  useEffect(() => {
    // Remove existing schema scripts with our IDs
    document.querySelectorAll('script[data-schema="institutional"]').forEach(el => el.remove());

    // Organization schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://goldcoastfinancial.co/goldcoastfinancial2#organization",
      "name": "Gold Coast Financial",
      "legalName": "Gold Coast Financial Group",
      "description": "A diversified financial services holding company providing governance, capital stewardship, and strategic oversight to regulated insurance and advisory businesses across the United States.",
      "url": "https://goldcoastfinancial.co/goldcoastfinancial2",
      "logo": "https://goldcoastfinancial.co/logo.png",
      "foundingDate": "2025",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1240 Iroquois Ave Suite 506",
        "addressLocality": "Naperville",
        "addressRegion": "IL",
        "postalCode": "60563",
        "addressCountry": "US"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-630-555-0123",
        "contactType": "Corporate Inquiries",
        "email": "contact@goldcoastfnl.com",
        "availableLanguage": "English"
      },
      "sameAs": [
        "https://linkedin.com/company/goldcoastfinancial",
        "https://twitter.com/goldcoastfnl"
      ],
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "minValue": 10,
        "maxValue": 50
      },
      "areaServed": {
        "@type": "Country",
        "name": "United States"
      }
    };

    // LocalBusiness schema
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "FinancialService",
      "@id": "https://goldcoastfinancial.co/goldcoastfinancial2#localbusiness",
      "name": "Gold Coast Financial",
      "description": "Institutional financial services holding company",
      "url": "https://goldcoastfinancial.co/goldcoastfinancial2",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1240 Iroquois Ave Suite 506",
        "addressLocality": "Naperville",
        "addressRegion": "IL",
        "postalCode": "60563",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "41.7508",
        "longitude": "-88.1535"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "17:00"
        }
      ],
      "telephone": "+1-630-555-0123",
      "email": "contact@goldcoastfnl.com",
      "priceRange": "$$$$"
    };

    // Person schemas for leadership
    const leadershipSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": "https://goldcoastfinancial.co/goldcoastfinancial2/about#jack-cook",
      "name": "Jack Cook",
      "jobTitle": "Chief Executive Officer",
      "worksFor": {
        "@type": "Organization",
        "name": "Gold Coast Financial"
      },
      "description": "CEO of Gold Coast Financial, overseeing strategic direction, capital allocation, and portfolio company oversight."
    };

    // Insert schemas
    const schemas = [organizationSchema, localBusinessSchema, leadershipSchema];
    schemas.forEach((schema, index) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-schema", "institutional");
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll('script[data-schema="institutional"]').forEach(el => el.remove());
    };
  }, []);

  return null;
}

// Breadcrumb schema component
interface BreadcrumbItem {
  name: string;
  path: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  useEffect(() => {
    document.querySelectorAll('script[data-schema="breadcrumb"]').forEach(el => el.remove());

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `https://goldcoastfinancial.co${item.path}`
      }))
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "breadcrumb");
    script.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-schema="breadcrumb"]').forEach(el => el.remove());
    };
  }, [items]);

  return null;
}
