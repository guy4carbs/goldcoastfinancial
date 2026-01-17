import { HeritageLayout } from "@/components/layout/HeritageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, GraduationCap, ArrowRight, Shield, Users, Calculator, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { HeritageFAQSection } from "@/components/ui/heritage-faq-section";
import { HeritageVideoSection } from "@/components/ui/heritage-video-section";
import { heritageArticles } from "./HeritageArticle";

import coverImage1 from "@assets/stock_images/family_financial_pla_4b0aee36.jpg";
import coverImage2 from "@assets/stock_images/couple_reviewing_fin_24d18d0d.jpg";
import coverImage4 from "@assets/stock_images/business_team_meetin_731e1082.jpg";
import coverImage5 from "@assets/stock_images/happy_young_parents__4eee7440.jpg";
import coverImage6 from "@assets/stock_images/financial_growth_cha_bfd95706.jpg";

// Heritage Life Solutions color palette
const c = {
  background: "#f5f0e8",
  primary: "#4f5a3f",
  primaryHover: "#3d4730",
  secondary: "#d4a05b",
  secondaryHover: "#c49149",
  muted: "#c8b6a6",
  textPrimary: "#333333",
  textSecondary: "#5c5347",
  accent: "#8b5a3c",
  cream: "#fffaf3",
  white: "#ffffff",
};

const coverImages: Record<string, string> = {
  "how-much-life-insurance-do-you-need": coverImage1,
  "term-vs-whole-life-insurance": coverImage2,
  "key-person-insurance-explained": coverImage4,
  "indexed-universal-life-explained": coverImage6,
  "life-insurance-101-complete-guide": coverImage1,
  "coverage-calculator-guide": coverImage2,
  "term-vs-permanent-comparison": coverImage6,
  "life-insurance-for-new-parents": coverImage5
};

const categories = [
  { name: "All", icon: BookOpen },
  { name: "Guide", icon: GraduationCap },
  { name: "Education", icon: BookOpen },
  { name: "Planning", icon: Calendar },
];

const featuredGuides = [
  {
    icon: Shield,
    title: "Life Insurance 101",
    description: "Start here to understand the fundamentals of life insurance protection.",
    link: "/heritage/resources/life-insurance-101-complete-guide"
  },
  {
    icon: Calculator,
    title: "Coverage Calculator",
    description: "Calculate exactly how much coverage your family needs.",
    link: "/heritage/resources/coverage-calculator-guide"
  },
  {
    icon: Users,
    title: "New Parent Guide",
    description: "Essential protection steps for new and expecting parents.",
    link: "/heritage/resources/life-insurance-for-new-parents"
  },
  {
    icon: FileText,
    title: "Term vs. Permanent",
    description: "Compare policy types to find the right fit for your needs.",
    link: "/heritage/resources/term-vs-permanent-comparison"
  }
];

export default function HeritageResources() {
  return (
    <HeritageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ backgroundColor: c.primary }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryHover})` }} />
        <div className="absolute top-0 left-0 w-1/3 h-full bg-white/5 -skew-x-12 transform -translate-x-1/4" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full translate-x-1/3 translate-y-1/3" style={{ backgroundColor: `${c.secondary}10` }} />
        <motion.div
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
            <span className="font-medium tracking-wide uppercase text-sm" style={{ color: c.secondary }}>Learn More</span>
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6">Resources & Insights</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Educating our community on financial security, insurance, and estate planning.
          </p>
        </motion.div>
      </section>

      {/* Life Insurance 101 Section */}
      <section className="py-16" style={{ background: `linear-gradient(to bottom, ${c.white}, ${c.background})` }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
              <span className="font-medium tracking-wide uppercase text-sm" style={{ color: c.secondary }}>Start Here</span>
              <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4" style={{ color: c.primary }}>
              Life Insurance 101
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: c.textSecondary }}>
              New to life insurance? Start here to understand the basics and make informed decisions for your family.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGuides.map((guide, index) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={guide.link}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group" style={{ backgroundColor: c.cream, borderColor: c.muted }}>
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors" style={{ backgroundColor: `${c.primary}15` }}>
                        <guide.icon className="w-7 h-7" style={{ color: c.primary }} />
                      </div>
                      <h3 className="font-serif font-bold text-lg mb-2" style={{ color: c.primary }}>{guide.title}</h3>
                      <p className="text-sm mb-4" style={{ color: c.textSecondary }}>{guide.description}</p>
                      <span className="text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: c.secondary }}>
                        Read Guide <ArrowRight className="w-4 h-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <HeritageVideoSection />

      {/* Articles Grid */}
      <section className="py-16 md:py-24" style={{ backgroundColor: c.background }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="font-medium tracking-wide uppercase text-sm" style={{ color: c.secondary }}>Featured Articles</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mt-2" style={{ color: c.primary }}>Learn & Protect</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {heritageArticles.map((article, index) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/heritage/resources/${article.slug}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group" style={{ backgroundColor: c.cream }}>
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={coverImages[article.slug]}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" style={{ backgroundColor: `${c.secondary}30`, color: c.primary }}>
                          {article.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs" style={{ color: c.textSecondary }}>
                          <Calendar className="w-3 h-3" />
                          {article.date}
                        </div>
                      </div>
                      <CardTitle className="font-serif text-xl leading-tight transition-colors" style={{ color: c.primary }}>
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed" style={{ color: c.textSecondary }}>
                        {article.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-sm font-semibold transition-colors" style={{ color: c.secondary }}>
                        Read Article
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <HeritageFAQSection />

      {/* CTA Section */}
      <section className="py-16" style={{ backgroundColor: c.primary }}>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-4">Have Questions?</h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              Our team is here to help you understand your options and find the right protection for your family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/heritage/get-quote">
                <Button className="px-8 py-3 rounded-md font-semibold transition-colors" style={{ backgroundColor: c.secondary, color: c.textPrimary }}>
                  Get a Free Quote
                </Button>
              </Link>
              <Link href="/heritage/contact">
                <Button variant="outline" className="px-8 py-3 rounded-md font-semibold border-white/30 text-white hover:bg-white/10 transition-colors">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </HeritageLayout>
  );
}
