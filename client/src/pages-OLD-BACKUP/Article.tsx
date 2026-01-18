import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, Share2, BookOpen, Check, Copy, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { articles } from "./Resources";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import coverImage1 from "@assets/stock_images/family_financial_pla_4b0aee36.jpg";
import coverImage2 from "@assets/stock_images/couple_reviewing_fin_24d18d0d.jpg";
import coverImage3 from "@assets/stock_images/senior_couple_signin_3a20251f.jpg";
import coverImage4 from "@assets/stock_images/business_team_meetin_731e1082.jpg";
import coverImage5 from "@assets/stock_images/happy_young_parents__4eee7440.jpg";
import coverImage6 from "@assets/stock_images/financial_growth_cha_bfd95706.jpg";

const coverImages: Record<string, string> = {
  "how-much-life-insurance": coverImage1,
  "term-vs-whole-life": coverImage2,
  "estate-planning-mistakes": coverImage3,
  "key-person-insurance": coverImage4,
  "life-insurance-new-parents": coverImage5,
  "understanding-iul": coverImage6,
  "life-insurance-101-complete-guide": coverImage1,
  "coverage-calculator-guide": coverImage2,
  "term-vs-permanent-comparison": coverImage6,
  "new-parent-financial-checklist": coverImage5
};

const readingTimes: Record<string, string> = {
  "how-much-life-insurance": "5 min read",
  "term-vs-whole-life": "7 min read",
  "estate-planning-mistakes": "6 min read",
  "key-person-insurance": "5 min read",
  "life-insurance-new-parents": "8 min read",
  "understanding-iul": "10 min read",
  "life-insurance-101-complete-guide": "12 min read",
  "coverage-calculator-guide": "10 min read",
  "term-vs-permanent-comparison": "15 min read",
  "new-parent-financial-checklist": "10 min read"
};

export default function Article() {
  const params = useParams<{ slug: string }>();
  const article = articles.find(a => a.slug === params.slug);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;
    const title = article?.title || "Gold Coast Financial Article";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article: ${title}`,
          url: url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Unable to copy",
        description: "Please copy the URL from your browser's address bar.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: article?.title || "Gold Coast Financial Article",
          text: `Save or print this article: ${article?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          window.print();
        }
      }
    } else {
      window.print();
    }
  };

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold font-serif text-primary mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Link href="/resources">
            <Button>Back to Resources</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const coverImage = coverImages[article.slug];
  const readingTime = readingTimes[article.slug];

  return (
    <Layout>
      <article>
        <section className="bg-primary relative overflow-hidden py-12 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-1/4" />
          <motion.div 
            className="container mx-auto px-4 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/resources">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 mb-6 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resources
              </Button>
            </Link>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge className="bg-secondary text-secondary-foreground text-sm px-3 py-1">{article.category}</Badge>
              <span className="text-white/80 flex items-center gap-1.5 text-sm">
                <Calendar className="w-4 h-4" /> {article.date}
              </span>
              <span className="text-white/80 flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4" /> {readingTime}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-white max-w-4xl leading-tight">{article.title}</h1>
            
            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <User className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-white font-medium">Gold Coast Financial Team</p>
                <p className="text-white/80 text-sm">Expert Insurance Advisors</p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative mb-10"
              >
                <div className="aspect-[16/9] max-h-[360px] rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={coverImage} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </motion.div>

              <motion.div 
                className="flex items-center justify-between gap-4 mb-6 print:hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="gap-1.5 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                    data-testid="button-print-article"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print</span>
                    <span className="sm:hidden">Save</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="gap-1.5 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                    data-testid="button-share-top"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    <span>Share</span>
                  </Button>
                </div>
              </motion.div>

              <motion.div 
                className="bg-muted/30 rounded-xl p-5 mb-10 border-l-4 border-secondary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-start gap-4">
                  <BookOpen className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Key Takeaways</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {article.slug === "how-much-life-insurance" && "Learn the DIME method and other strategies to calculate your ideal coverage amount based on your family's unique needs."}
                      {article.slug === "term-vs-whole-life" && "Understand the key differences between term and whole life insurance to make an informed decision for your family's protection."}
                      {article.slug === "estate-planning-mistakes" && "Avoid common pitfalls that can jeopardize your legacy and ensure your assets are distributed according to your wishes."}
                      {article.slug === "key-person-insurance" && "Discover how to protect your business from the financial impact of losing a key employee, owner, or partner."}
                      {article.slug === "life-insurance-new-parents" && "Everything new and expecting parents need to know about protecting their growing family with the right life insurance coverage."}
                      {article.slug === "understanding-iul" && "A comprehensive guide to Indexed Universal Life insurance - how it works, its benefits, and whether it's the right choice for your financial goals."}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="article-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <motion.div 
                className="flex items-center gap-4 mt-10 pt-8 border-t"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <span className="text-muted-foreground text-sm">Share this article:</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-10 w-10 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                    onClick={handleShare}
                    data-testid="button-share"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  </Button>
                </div>
              </motion.div>

              <motion.div 
                className="mt-14"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 md:p-10 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold font-serif text-white mb-4">Ready to Protect Your Family?</h3>
                    <p className="text-white/80 mb-6 max-w-xl mx-auto leading-relaxed">
                      Our team of expert advisors is here to help you find the perfect coverage for your unique situation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/get-quote">
                        <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8">
                          Get a Free Quote
                        </Button>
                      </Link>
                      <Link href="/contact">
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                          Schedule a Consultation
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="mt-14"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <h3 className="text-2xl font-bold font-serif text-primary mb-6">Related Articles</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {articles
                    .filter(a => a.slug !== article.slug)
                    .slice(0, 2)
                    .map((relatedArticle, i) => (
                      <Link key={i} href={`/resources/${relatedArticle.slug}`}>
                        <motion.div 
                          className="group bg-card rounded-xl overflow-hidden border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="aspect-[16/10] overflow-hidden">
                            <img 
                              src={coverImages[relatedArticle.slug]} 
                              alt={relatedArticle.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-4">
                            <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary text-xs">{relatedArticle.category}</Badge>
                            <h4 className="font-serif font-bold text-base group-hover:text-primary transition-colors line-clamp-2">{relatedArticle.title}</h4>
                            <span className="text-secondary font-semibold text-sm mt-2 inline-block group-hover:translate-x-1 transition-transform">Read Article &rarr;</span>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </article>

      <style>{`
        .article-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: hsl(var(--primary));
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        .article-content h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: hsl(var(--primary));
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .article-content h4 {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: hsl(var(--primary));
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .article-content p {
          color: hsl(var(--muted-foreground));
          font-size: 1.0625rem;
          line-height: 1.8;
          margin-bottom: 1.25rem;
        }
        .article-content ul, .article-content ol {
          margin: 1.25rem 0;
          padding-left: 1.5rem;
        }
        .article-content li {
          color: hsl(var(--muted-foreground));
          font-size: 1.0625rem;
          line-height: 1.7;
          margin-bottom: 0.75rem;
          position: relative;
        }
        .article-content li::marker {
          color: hsl(var(--secondary));
        }
        .article-content strong {
          color: hsl(var(--foreground));
          font-weight: 600;
        }
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.9375rem;
        }
        .article-content table thead {
          background: hsl(var(--primary));
          color: white;
        }
        .article-content table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          border: 1px solid hsl(var(--border));
        }
        .article-content table td {
          padding: 0.75rem 1rem;
          border: 1px solid hsl(var(--border));
          color: hsl(var(--muted-foreground));
        }
        .article-content table tbody tr:nth-child(even) {
          background: hsl(var(--muted) / 0.3);
        }
        .article-content table tbody tr:hover {
          background: hsl(var(--muted) / 0.5);
        }
        .article-content em {
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }

        @media print {
          @page {
            margin: 0.75in;
            size: letter;
          }
          
          body {
            font-size: 11pt;
            line-height: 1.5;
            color: #000 !important;
            background: #fff !important;
          }
          
          header, footer, nav, 
          .print\\:hidden,
          [data-testid="button-print-article"],
          [data-testid="button-share-top"],
          [data-testid="button-share"] {
            display: none !important;
          }
          
          .article-content {
            max-width: 100% !important;
          }
          
          .article-content h2 {
            color: #541221 !important;
            font-size: 18pt !important;
            margin-top: 24pt !important;
            margin-bottom: 8pt !important;
            page-break-after: avoid;
          }
          
          .article-content h3 {
            color: #541221 !important;
            font-size: 14pt !important;
            margin-top: 18pt !important;
            margin-bottom: 6pt !important;
            page-break-after: avoid;
          }
          
          .article-content h4 {
            color: #541221 !important;
            font-size: 12pt !important;
            margin-top: 14pt !important;
            margin-bottom: 4pt !important;
            page-break-after: avoid;
          }
          
          .article-content p {
            color: #333 !important;
            font-size: 11pt !important;
            line-height: 1.6 !important;
            margin-bottom: 10pt !important;
            orphans: 3;
            widows: 3;
          }
          
          .article-content ul, .article-content ol {
            margin: 10pt 0 !important;
            padding-left: 20pt !important;
          }
          
          .article-content li {
            color: #333 !important;
            font-size: 11pt !important;
            line-height: 1.5 !important;
            margin-bottom: 4pt !important;
          }
          
          .article-content strong {
            color: #000 !important;
          }
          
          .article-content table {
            font-size: 9pt !important;
            border: 1px solid #000 !important;
            page-break-inside: avoid;
          }
          
          .article-content table thead {
            background: #541221 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .article-content table th {
            color: #fff !important;
            padding: 6pt 8pt !important;
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .article-content table td {
            padding: 6pt 8pt !important;
            border: 1px solid #000 !important;
            color: #333 !important;
          }
          
          .article-content table tbody tr:nth-child(even) {
            background: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          img {
            max-width: 100% !important;
            page-break-inside: avoid;
          }
          
          a {
            color: #541221 !important;
            text-decoration: none !important;
          }
          
          .bg-gradient-to-br,
          .bg-primary,
          .rounded-2xl {
            background: #fff !important;
            color: #000 !important;
          }
        }
      `}</style>
    </Layout>
  );
}
