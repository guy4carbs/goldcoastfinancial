import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, User, Clock, Tag } from "lucide-react";
import { Link } from "wouter";
import { InstitutionalSEO } from "@/components/seo/InstitutionalSEO";
import { InstitutionalNewsletter } from "@/components/ui/institutional-newsletter";

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
    featured: true
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
    featured: false
  },
  {
    slug: "building-compliance-culture",
    title: "Building a Culture of Compliance in Insurance",
    excerpt: "How we approach regulatory compliance as a competitive advantage and the systems we've implemented across our portfolio companies.",
    author: "Guy Carbonara",
    authorTitle: "COO",
    date: "December 2025",
    readTime: "4 min read",
    category: "Operations",
    featured: false
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
    featured: false
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
    featured: false
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
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

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
              Industry insights, market perspectives, and strategic thinking from our leadership team.
            </p>
            <div className="accent-line-animated" />
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Featured Post */}
      {featuredPost && (
        <>
          <section className="py-20 md:py-28 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid lg:grid-cols-3 gap-16"
              >
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-secondary">
                    Featured Article
                  </span>
                </div>
                <div className="lg:col-span-2">
                  <span className="inline-block px-3 py-1 text-xs uppercase tracking-wider text-[hsl(348,65%,25%)] bg-[hsl(348,65%,20%)]/10 rounded-sm mb-4">
                    {featuredPost.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-serif text-primary mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {featuredPost.author}, {featuredPost.authorTitle}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {featuredPost.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <Link
                    href={`/goldcoastfinancial2/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 text-[hsl(348,65%,25%)] font-medium hover:underline"
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

      {/* Blog Posts Grid */}
      <section className="py-20 md:py-28">
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
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Recent Articles
                </h2>
              </motion.div>

              <div className="space-y-8">
                {regularPosts.map((post, index) => (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border-b border-border/60 pb-8 last:border-0"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted rounded-sm">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                    <h3 className="text-lg font-medium text-primary mb-2 hover:text-[hsl(348,65%,25%)] transition-colors">
                      <Link href={`/goldcoastfinancial2/blog/${post.slug}`} className="cursor-pointer">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{post.author}</span>
                        <span>{post.readTime}</span>
                      </div>
                      <Link
                        href={`/goldcoastfinancial2/blog/${post.slug}`}
                        className="text-sm text-[hsl(348,65%,25%)] font-medium hover:underline flex items-center gap-1"
                      >
                        Read
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white border border-border/60 p-6 rounded-sm"
              >
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                  Categories
                </h3>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category}>
                      <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                        <Tag className="w-3 h-3" />
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Newsletter */}
              <InstitutionalNewsletter variant="card" />
            </div>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
