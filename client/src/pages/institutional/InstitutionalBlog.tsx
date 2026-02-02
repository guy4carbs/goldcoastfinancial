import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, User, Clock, Tag, Search, BookOpen, TrendingUp, Shield, Building2, Scale } from "lucide-react";
import { Link } from "wouter";
import { InstitutionalSEO } from "@/components/seo/InstitutionalSEO";
import { InstitutionalNewsletter } from "@/components/ui/institutional-newsletter";
import { TrustIndicators } from "@/components/institutional/TrustIndicators";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";

// Category configurations with colors and icons
const categoryConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
  "Capital Philosophy": { color: "text-blue-700", bgColor: "bg-blue-50", icon: TrendingUp },
  "Industry Insights": { color: "text-purple-700", bgColor: "bg-purple-50", icon: BookOpen },
  "Operations": { color: "text-green-700", bgColor: "bg-green-50", icon: Building2 },
  "Governance": { color: "text-amber-700", bgColor: "bg-amber-50", icon: Shield },
};

// Author configurations
const authorConfig: Record<string, { initials: string; color: string }> = {
  "Jack Cook": { initials: "JC", color: "bg-[hsl(348,65%,20%)]" },
  "Gaetano Carbonara": { initials: "GC", color: "bg-purple-600" },
  "Gold Coast Financial": { initials: "GCF", color: "bg-secondary" },
};

const blogPosts = [
  {
    slug: "long-term-capital-financial-services",
    title: "The Case for Long-Term Capital in Financial Services",
    excerpt: "Why patient capital and permanent ownership structures create sustainable value in regulated industries, and how our approach differs from traditional private equity.",
    author: "Jack Cook",
    authorTitle: "CEO",
    date: "January 2026",
    readTime: "5 min read",
    category: "Capital Philosophy",
    featured: true,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
  },
  {
    slug: "insurance-industry-outlook-2026",
    title: "Insurance Industry Outlook: Trends Shaping 2026",
    excerpt: "An analysis of key trends impacting the life insurance industry, from demographic shifts to technology adoption and regulatory changes.",
    author: "Gold Coast Financial",
    authorTitle: "Research Team",
    date: "January 2026",
    readTime: "7 min read",
    category: "Industry Insights",
    featured: false,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
  },
  {
    slug: "building-compliance-culture",
    title: "Building a Culture of Compliance in Insurance",
    excerpt: "How we approach regulatory compliance as a competitive advantage and the systems we've implemented across our portfolio companies.",
    author: "Gaetano Carbonara",
    authorTitle: "COO",
    date: "December 2025",
    readTime: "4 min read",
    category: "Operations",
    featured: false,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80"
  },
  {
    slug: "independent-agency-value-proposition",
    title: "The Enduring Value of Independent Insurance Agencies",
    excerpt: "Why independent agencies continue to thrive in an increasingly digital world, and our investment thesis for the distribution channel.",
    author: "Jack Cook",
    authorTitle: "CEO",
    date: "November 2025",
    readTime: "6 min read",
    category: "Industry Insights",
    featured: false,
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80"
  },
  {
    slug: "governance-portfolio-companies",
    title: "Governance Best Practices for Portfolio Companies",
    excerpt: "The governance frameworks we implement across our portfolio to ensure operational excellence, regulatory compliance, and long-term value creation.",
    author: "Gold Coast Financial",
    authorTitle: "Corporate Team",
    date: "October 2025",
    readTime: "5 min read",
    category: "Governance",
    featured: false,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80"
  }
];

const categories = [
  "All",
  "Capital Philosophy",
  "Industry Insights",
  "Operations",
  "Governance"
];

export default function InstitutionalBlog() {
  const { trackCTAClicked } = useAnalytics();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredPost = blogPosts.find(post => post.featured);
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && !post.featured;
  });

  const getAuthorConfig = (author: string) => {
    return authorConfig[author] || { initials: author.split(' ').map(n => n[0]).join(''), color: "bg-gray-500" };
  };

  return (
    <InstitutionalLayout>
      <InstitutionalSEO />

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
              Insights & Perspectives
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-6">
              Thought Leadership
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-10">
              Strategic perspectives from our leadership team.
            </p>
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

      {/* Featured Post with Image */}
      {featuredPost && (
        <>
          <section className="py-20 md:py-28 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Featured Image */}
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden order-2 lg:order-1">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    {(() => {
                      const config = categoryConfig[featuredPost.category];
                      const IconComponent = config?.icon || BookOpen;
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config?.bgColor || 'bg-blue-50'} ${config?.color || 'text-blue-700'}`}>
                          <IconComponent className="w-3 h-3" />
                          {featuredPost.category}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Featured Content */}
                <div className="order-1 lg:order-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-secondary mb-4 block">
                    Featured Article
                  </span>
                  <h2 className="text-2xl md:text-3xl font-serif text-primary mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>

                  {/* Author with avatar */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-full ${getAuthorConfig(featuredPost.author).color} flex items-center justify-center`}>
                      <span className="text-sm font-semibold text-white">{getAuthorConfig(featuredPost.author).initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{featuredPost.author}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{featuredPost.authorTitle}</span>
                        <span>•</span>
                        <span>{featuredPost.date}</span>
                        <span>•</span>
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(348,65%,20%)] text-white rounded-lg font-medium hover:bg-[hsl(348,65%,25%)] transition-colors"
                  >
                    Read Full Article
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

      {/* Search and Filter Bar */}
      <section className="py-8 bg-white sticky top-0 z-10 border-b border-border/60">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => {
                const config = categoryConfig[category];
                const IconComponent = config?.icon || Tag;
                const isActive = activeCategory === category;

                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[hsl(348,65%,20%)] text-white'
                        : config
                          ? `${config.bgColor} ${config.color} hover:opacity-80`
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {category !== "All" && <IconComponent className="w-3.5 h-3.5" />}
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Posts */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  {activeCategory === "All" ? "All Articles" : activeCategory}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {filteredPosts.map((post, index) => {
                  const config = categoryConfig[post.category];
                  const IconComponent = config?.icon || BookOpen;
                  const authorConf = getAuthorConfig(post.author);

                  return (
                    <motion.article
                      key={post.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group bg-white rounded-lg border border-border/60 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all"
                    >
                      {/* Card Image */}
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        {/* Category badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config?.bgColor || 'bg-gray-50'} ${config?.color || 'text-gray-700'}`}>
                            <IconComponent className="w-3 h-3" />
                            {post.category}
                          </span>
                        </div>
                        {/* Read time */}
                        <div className="absolute bottom-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/90 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <h3 className="text-base font-medium text-primary mb-2 group-hover:text-[hsl(348,65%,25%)] transition-colors line-clamp-2">
                          <Link href={`/blog/${post.slug}`} className="cursor-pointer">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>

                        {/* Author */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/60">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full ${authorConf.color} flex items-center justify-center`}>
                              <span className="text-[10px] font-semibold text-white">{authorConf.initials}</span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-primary">{post.author}</p>
                              <p className="text-[10px] text-muted-foreground">{post.date}</p>
                            </div>
                          </div>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="text-sm text-[hsl(348,65%,25%)] font-medium group-hover:underline flex items-center gap-1"
                          >
                            Read
                            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">No Articles Found</h3>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your search or category filter.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Category Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white border border-border/60 p-6 rounded-lg"
              >
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                  Browse by Topic
                </h3>
                <div className="space-y-3">
                  {categories.filter(c => c !== "All").map((category) => {
                    const config = categoryConfig[category];
                    const IconComponent = config?.icon || Tag;
                    const count = blogPosts.filter(p => p.category === category).length;

                    return (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          activeCategory === category
                            ? `${config?.bgColor || 'bg-gray-50'} ${config?.color || 'text-gray-700'}`
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-4 h-4 ${config?.color || 'text-muted-foreground'}`} />
                          <span className="text-sm font-medium">{category}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${config?.bgColor || 'bg-muted'} ${config?.color || 'text-muted-foreground'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Newsletter */}
              <InstitutionalNewsletter variant="card" />

              {/* Popular Articles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gradient-to-br from-[hsl(348,65%,18%)] to-[hsl(348,65%,25%)] p-6 rounded-lg text-white"
              >
                <h3 className="text-xs font-medium uppercase tracking-wider text-white/70 mb-4">
                  From the CEO
                </h3>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  Read Jack Cook's perspectives on building lasting financial institutions.
                </p>
                <Link
                  href="/blog/long-term-capital-financial-services"
                  className="inline-flex items-center gap-2 text-sm text-secondary font-medium hover:underline"
                >
                  Read Latest
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
