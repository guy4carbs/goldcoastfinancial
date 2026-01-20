import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "./Blog";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  Calendar,
  User,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ChevronRight,
  Phone,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  // Find the current post
  const post = blogPosts.find(p => p.slug === params.slug);

  // Get related posts (same category, excluding current)
  const relatedPosts = post
    ? blogPosts
        .filter(p => p.category === post.category && p.id !== post.id)
        .slice(0, 3)
    : [];

  // If no related posts in same category, get other recent posts
  const displayPosts = relatedPosts.length > 0
    ? relatedPosts
    : blogPosts.filter(p => p.id !== post?.id).slice(0, 3);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been moved.</p>
          <Link href="/resources/blog">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-heritage-primary text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </motion.button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const getCategoryName = (id: string) => {
    const categories: Record<string, string> = {
      term: "Term Life",
      whole: "Whole Life",
      retirement: "Retirement",
      family: "Family Planning",
      savings: "Savings Tips"
    };
    return categories[id] || id;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(post.title);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed - silently ignore
        if ((err as Error).name !== 'AbortError') {
          toast.error("Failed to share");
        }
      }
    } else {
      // Fallback: copy link if Web Share API not supported
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-heritage-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-heritage-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link href="/resources/blog" className="hover:text-heritage-primary transition-colors">
                Blog
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-heritage-primary">{getCategoryName(post.category)}</span>
            </nav>

            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 bg-heritage-primary/10 text-heritage-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              {getCategoryName(post.category)}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {post.readTime}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="relative -mt-6 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <img
              src={post.image.replace('w=400&h=250', 'w=1200&h=600').replace('w=800&h=400', 'w=1200&h=600')}
              alt={post.title}
              className="w-full h-[300px] md:h-[400px] object-cover rounded-2xl shadow-xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_200px] gap-12">
              {/* Main Content */}
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="article-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              <style>{`
                .article-content {
                  font-size: 1.125rem;
                  line-height: 1.8;
                  color: #374151;
                }
                .article-content p {
                  margin-bottom: 1.5rem;
                  line-height: 1.85;
                }
                .article-content h2 {
                  font-size: 1.75rem;
                  font-weight: 700;
                  color: #1e3a5f;
                  margin-top: 3rem;
                  margin-bottom: 1.25rem;
                  line-height: 1.3;
                  padding-bottom: 0.5rem;
                  border-bottom: 2px solid #f3f4f6;
                }
                .article-content h3 {
                  font-size: 1.35rem;
                  font-weight: 600;
                  color: #1e3a5f;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  line-height: 1.4;
                }
                .article-content ul, .article-content ol {
                  margin: 1.5rem 0;
                  padding-left: 1.5rem;
                }
                .article-content ul {
                  list-style-type: disc;
                }
                .article-content ol {
                  list-style-type: decimal;
                }
                .article-content li {
                  margin-bottom: 0.75rem;
                  line-height: 1.7;
                  padding-left: 0.5rem;
                }
                .article-content li::marker {
                  color: #c9a227;
                }
                .article-content strong {
                  color: #111827;
                  font-weight: 600;
                }
                .article-content a {
                  color: #1e3a5f;
                  font-weight: 500;
                  text-decoration: underline;
                  text-decoration-color: #c9a227;
                  text-underline-offset: 3px;
                  transition: all 0.2s;
                }
                .article-content a:hover {
                  color: #c9a227;
                }
                .article-content p:first-of-type {
                  font-size: 1.25rem;
                  color: #4b5563;
                  line-height: 1.75;
                }
                .article-content h2:first-of-type {
                  margin-top: 2rem;
                }
              `}</style>

              {/* Sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-6">
                  {/* Share */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <button
                      onClick={handleNativeShare}
                      className="font-semibold text-heritage-primary mb-4 flex items-center gap-2 hover:text-heritage-accent transition-colors w-full text-left group"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Article</span>
                      <span className="ml-auto text-xs text-gray-400 group-hover:text-heritage-accent">Click to share</span>
                    </button>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={shareOnTwitter}
                        className="flex items-center gap-3 text-gray-600 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 px-3 py-2 rounded-lg transition-all"
                      >
                        <Twitter className="w-5 h-5" />
                        <span className="text-sm font-medium">Twitter</span>
                      </button>
                      <button
                        onClick={shareOnFacebook}
                        className="flex items-center gap-3 text-gray-600 hover:text-[#1877F2] hover:bg-[#1877F2]/10 px-3 py-2 rounded-lg transition-all"
                      >
                        <Facebook className="w-5 h-5" />
                        <span className="text-sm font-medium">Facebook</span>
                      </button>
                      <button
                        onClick={shareOnLinkedIn}
                        className="flex items-center gap-3 text-gray-600 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 px-3 py-2 rounded-lg transition-all"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span className="text-sm font-medium">LinkedIn</span>
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          copied
                            ? 'text-green-600 bg-green-50'
                            : 'text-gray-600 hover:text-heritage-primary hover:bg-heritage-primary/10'
                        }`}
                      >
                        <LinkIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{copied ? "Copied!" : "Copy Link"}</span>
                      </button>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="bg-gradient-to-br from-heritage-primary to-heritage-primary/90 rounded-xl p-6 shadow-lg">
                    <h4 className="font-bold text-white text-lg mb-2">Need Help?</h4>
                    <p className="text-white/90 text-sm mb-4 leading-relaxed">
                      Our experts are here to answer your questions.
                    </p>
                    <a
                      href="tel:6307780800"
                      className="inline-flex items-center gap-2 bg-white text-heritage-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-heritage-accent hover:text-white transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      (630) 778-0800
                    </a>
                  </div>
                </div>
              </aside>
            </div>

            {/* Mobile Share Bar */}
            <div className="lg:hidden mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={handleNativeShare}
                className="font-semibold text-heritage-primary mb-4 flex items-center gap-2 hover:text-heritage-accent transition-colors w-full text-left"
              >
                <Share2 className="w-4 h-4" />
                <span>Share This Article</span>
              </button>
              <div className="flex gap-3">
                <button
                  onClick={shareOnTwitter}
                  className="flex-1 p-3 bg-gray-50 rounded-lg text-gray-600 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all flex items-center justify-center"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="flex-1 p-3 bg-gray-50 rounded-lg text-gray-600 hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-all flex items-center justify-center"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="flex-1 p-3 bg-gray-50 rounded-lg text-gray-600 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all flex items-center justify-center"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`flex-1 p-3 rounded-lg transition-all flex items-center justify-center ${
                    copied
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-50 text-gray-600 hover:text-heritage-primary hover:bg-heritage-primary/10'
                  }`}
                >
                  <LinkIcon className="w-5 h-5" />
                </button>
              </div>
              {copied && (
                <p className="text-green-600 text-sm text-center mt-3 font-medium">Link copied to clipboard!</p>
              )}
            </div>

            {/* Mobile Need Help CTA */}
            <div className="lg:hidden mt-6 p-6 bg-gradient-to-br from-heritage-primary to-heritage-primary/90 rounded-xl shadow-lg">
              <h4 className="font-bold text-white text-lg mb-2">Need Help?</h4>
              <p className="text-white/90 text-sm mb-4 leading-relaxed">
                Our experts are here to answer your questions.
              </p>
              <a
                href="tel:6307780800"
                className="inline-flex items-center gap-2 bg-white text-heritage-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-heritage-accent hover:text-white transition-all"
              >
                <Phone className="w-4 h-4" />
                (630) 778-0800
              </a>
            </div>

            {/* Back to Blog */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link href="/resources/blog">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 text-heritage-primary font-semibold hover:gap-3 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to All Articles
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {displayPosts.length > 0 && (
        <section className="py-16 bg-[#fffaf3]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {relatedPosts.length > 0 ? "Related Articles" : "More to Read"}
              </h2>
              <p className="text-gray-600">
                Continue learning about life insurance.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {displayPosts.map((relatedPost, index) => (
                <Link key={relatedPost.id} href={`/resources/blog/${relatedPost.slug}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group h-full"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-4 left-4 bg-white/90 text-heritage-primary px-3 py-1 rounded-full text-xs font-medium">
                        {getCategoryName(relatedPost.category)}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-heritage-primary transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {relatedPost.readTime}
                        </span>
                        <span className="text-heritage-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-heritage-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Protect Your Family?
            </h2>
            <p className="text-white/80 mb-8">
              Get a free quote in minutes and see how affordable life insurance can be.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-heritage-primary px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  Get a Free Quote <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/10 text-white border border-white/30 px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Talk to an Expert
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
