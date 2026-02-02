import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Building2, Users, Shield, TrendingUp, Award, Briefcase, Filter } from "lucide-react";
import { Link } from "wouter";
import { TrustIndicators } from "@/components/institutional/TrustIndicators";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";

/**
 * Gold Coast Financial - News & Announcements Page
 *
 * Design Philosophy:
 * - Corporate announcements, not marketing content
 * - Visual card-based layout with category filtering
 * - Timeline visualization for company history
 */

// Category colors and icons
const categoryConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
  Corporate: { color: "text-blue-700", bgColor: "bg-blue-50", icon: Building2 },
  Governance: { color: "text-purple-700", bgColor: "bg-purple-50", icon: Shield },
  Portfolio: { color: "text-green-700", bgColor: "bg-green-50", icon: Briefcase },
  Milestone: { color: "text-amber-700", bgColor: "bg-amber-50", icon: Award },
  Operations: { color: "text-teal-700", bgColor: "bg-teal-50", icon: TrendingUp },
};

const newsItems = [
  {
    slug: "gold-coast-financial-enters-second-year",
    date: "January 2026",
    category: "Corporate",
    title: "Gold Coast Financial Enters Second Year of Operations",
    summary: "As we enter 2026, Gold Coast Financial continues to focus on operational excellence and measured growth across our portfolio of regulated financial services businesses.",
    featured: true,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
  },
  {
    slug: "formalization-holding-company-structure",
    date: "November 2025",
    category: "Governance",
    title: "Formalization of Holding Company Structure",
    summary: "Gold Coast Financial has completed the formalization of its institutional holding company structure, enhancing governance frameworks and compliance oversight capabilities.",
    featured: false,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"
  },
  {
    slug: "heritage-life-solutions-expands-carrier-partnerships",
    date: "September 2025",
    category: "Portfolio",
    title: "Heritage Life Solutions Expands Carrier Partnerships",
    summary: "Heritage Life Solutions, our life insurance operating company, has expanded its carrier network to over 30 highly-rated insurance providers.",
    featured: false,
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80"
  },
  {
    slug: "1000-families-protected",
    date: "July 2025",
    category: "Milestone",
    title: "1,000 Families Protected",
    summary: "Through our operating companies, Gold Coast Financial portfolio companies have now provided coverage solutions to over 1,000 American families.",
    featured: false,
    image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80"
  },
  {
    slug: "national-licensing-achievement",
    date: "May 2025",
    category: "Operations",
    title: "National Licensing Achievement",
    summary: "Heritage Life Solutions has achieved full licensing across all 50 states, enabling nationwide distribution of life insurance products.",
    featured: false,
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80"
  },
  {
    slug: "launch-heritage-life-solutions",
    date: "March 2025",
    category: "Portfolio",
    title: "Launch of Heritage Life Solutions",
    summary: "Gold Coast Financial announces the launch of Heritage Life Solutions, an independent life insurance brokerage focused on personalized coverage for individuals and families.",
    featured: false,
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80"
  },
  {
    slug: "gold-coast-financial-established",
    date: "January 2025",
    category: "Corporate",
    title: "Gold Coast Financial Established",
    summary: "Gold Coast Financial is established in Naperville, Illinois as a diversified financial services holding company.",
    featured: false,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
  }
];

const categories = ["All", "Corporate", "Governance", "Portfolio", "Milestone", "Operations"];

export default function InstitutionalNews() {
  const { trackCTAClicked } = useAnalytics();
  const [activeCategory, setActiveCategory] = useState("All");

  const featuredNews = newsItems.find(item => item.featured);
  const filteredNews = newsItems.filter(item =>
    activeCategory === "All" || item.category === activeCategory
  );

  // Get category icon component
  const getCategoryIcon = (category: string) => {
    const config = categoryConfig[category];
    return config ? config.icon : Building2;
  };

  return (
    <InstitutionalLayout>
      {/* Hero */}
      <section className="hero-gradient py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-3xl"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-4">
              News & Updates
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-10">
              Corporate announcements and company milestones.
            </h1>
            <div className="accent-line-animated" />
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-muted/30 border-y border-border/60">
        <div className="container mx-auto px-6 lg:px-12">
          <TrustIndicators variant="light" />
        </div>
      </section>

      {/* Featured News with Image */}
      {featuredNews && (
        <>
          <section className="py-20 md:py-28 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                {/* Featured Image */}
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden">
                  <img
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${categoryConfig[featuredNews.category]?.bgColor || 'bg-blue-50'} ${categoryConfig[featuredNews.category]?.color || 'text-blue-700'}`}>
                      {(() => {
                        const IconComponent = getCategoryIcon(featuredNews.category);
                        return <IconComponent className="w-3 h-3" />;
                      })()}
                      {featuredNews.category}
                    </span>
                  </div>
                </div>

                {/* Featured Content */}
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-secondary mb-4 block">
                    Latest Update
                  </span>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {featuredNews.date}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif text-primary mb-6">
                    {featuredNews.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {featuredNews.summary}
                  </p>
                  <Link
                    href={`/news/${featuredNews.slug}`}
                    className="inline-flex items-center gap-2 text-[hsl(348,65%,25%)] font-medium hover:underline"
                  >
                    Read Full Announcement
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-border/60" />
        </>
      )}

      {/* Category Filter */}
      <section className="py-8 bg-white sticky top-0 z-10 border-b border-border/60">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-[hsl(348,65%,20%)] text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* News Cards Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              All Announcements
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              {activeCategory === "All" ? "All company news and updates." : `${activeCategory} announcements.`}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item, index) => {
              const IconComponent = getCategoryIcon(item.category);
              const config = categoryConfig[item.category] || categoryConfig.Corporate;

              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group bg-white rounded-lg border border-border/60 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  {/* Card Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                        <IconComponent className="w-3 h-3" />
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <h3 className="text-base font-medium text-primary mb-2 group-hover:text-[hsl(348,65%,25%)] transition-colors line-clamp-2">
                      <Link href={`/news/${item.slug}`} className="cursor-pointer">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                      {item.summary}
                    </p>
                    <Link
                      href={`/news/${item.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm text-[hsl(348,65%,25%)] font-medium group-hover:underline"
                    >
                      Read More
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visual Timeline */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Company Timeline
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary">
              Our journey since 2025.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-secondary via-primary/30 to-transparent hidden md:block" />

            <div className="space-y-8 md:space-y-0">
              {newsItems.slice().reverse().map((item, index) => {
                const IconComponent = getCategoryIcon(item.category);
                const config = categoryConfig[item.category] || categoryConfig.Corporate;
                const isLeft = index % 2 === 0;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative md:flex items-center ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}
                  >
                    {/* Timeline node */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center justify-center">
                      <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center border-4 border-white shadow-md z-10`}>
                        <IconComponent className={`w-4 h-4 ${config.color}`} />
                      </div>
                    </div>

                    {/* Content card */}
                    <div className={`md:w-[calc(50%-3rem)] ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                      <Link href={`/news/${item.slug}`} className="block">
                        <div className="bg-white p-5 rounded-lg border border-border/60 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
                              {item.category}
                            </span>
                            <span className="text-xs text-muted-foreground">{item.date}</span>
                          </div>
                          <h3 className="text-sm font-medium text-primary mb-1 group-hover:text-[hsl(348,65%,25%)] transition-colors">{item.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Media Contact */}
      <section className="py-20 md:py-28 dark-gradient text-primary-foreground relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-4">
                Media Contact
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <p className="text-lg leading-relaxed mb-6">
                For press and media requests, contact our communications team.
              </p>
              <a
                href="mailto:media@goldcoastfnl.com"
                onClick={() => trackCTAClicked('media_email', 'news_media_contact')}
                className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
              >
                media@goldcoastfnl.com
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Contact
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary mb-6">
              Questions about our announcements?
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              For questions about company announcements.
            </p>
            <Link
              href="/contact"
              className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Contact us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
