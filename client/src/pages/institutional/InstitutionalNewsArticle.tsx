import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Building2, Users, Shield, TrendingUp, Award, Briefcase, ChevronLeft, ChevronRight, MapPin, CheckCircle } from "lucide-react";
import { Link, useParams } from "wouter";
import { InstitutionalSEO } from "@/components/seo/InstitutionalSEO";
import { TrustIndicators } from "@/components/institutional/TrustIndicators";
import { ShareButtons } from "@/components/ui/share-buttons";
import { useAnalytics } from "@/hooks/useAnalytics";

// Category colors and icons
const categoryConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType; gradient: string }> = {
  Corporate: { color: "text-blue-700", bgColor: "bg-blue-50", icon: Building2, gradient: "from-blue-600 via-blue-700 to-blue-800" },
  Governance: { color: "text-purple-700", bgColor: "bg-purple-50", icon: Shield, gradient: "from-purple-600 via-purple-700 to-purple-800" },
  Portfolio: { color: "text-green-700", bgColor: "bg-green-50", icon: Briefcase, gradient: "from-green-600 via-green-700 to-green-800" },
  Milestone: { color: "text-amber-700", bgColor: "bg-amber-50", icon: Award, gradient: "from-amber-600 via-amber-700 to-amber-800" },
  Operations: { color: "text-teal-700", bgColor: "bg-teal-50", icon: TrendingUp, gradient: "from-teal-600 via-teal-700 to-teal-800" },
};

interface NewsArticle {
  slug: string;
  date: string;
  category: string;
  title: string;
  summary: string;
  content: string[];
  highlights?: string[];
  quote?: {
    text: string;
    author: string;
    title: string;
  };
  image: string;
}

const newsArticles: Record<string, NewsArticle> = {
  "gold-coast-financial-enters-second-year": {
    slug: "gold-coast-financial-enters-second-year",
    date: "January 15, 2026",
    category: "Corporate",
    title: "Gold Coast Financial Enters Second Year of Operations",
    summary: "As we enter 2026, Gold Coast Financial continues to focus on operational excellence and measured growth across our portfolio of regulated financial services businesses.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    content: [
      "NAPERVILLE, IL — Gold Coast Financial, a diversified financial services holding company, today announced the beginning of its second year of operations with a focus on continued growth and operational excellence.",

      "Since its founding in January 2025, Gold Coast Financial has established itself as a disciplined acquirer and operator of regulated financial services businesses, with a particular focus on insurance distribution.",

      "## First Year Achievements",

      "During its inaugural year, Gold Coast Financial achieved several significant milestones:",

      "**National Licensing**: Heritage Life Solutions, the company's life insurance brokerage subsidiary, achieved full licensing across all 50 states, enabling nationwide distribution capabilities.",

      "**Carrier Partnerships**: Expanded relationships with over 30 A-rated insurance carriers, providing clients access to a comprehensive range of life insurance products.",

      "**Families Protected**: Through Heritage Life Solutions, provided life insurance coverage to more than 1,000 American families.",

      "**Governance Framework**: Formalized institutional holding company structure with enhanced compliance oversight and governance practices.",

      "## Strategic Focus for 2026",

      "Looking ahead, Gold Coast Financial will continue its measured approach to growth, focusing on three key priorities:",

      "**Operational Excellence**: Investing in technology, processes, and talent to improve efficiency and service quality across portfolio companies.",

      "**Disciplined Expansion**: Evaluating strategic acquisition opportunities in adjacent financial services sectors while maintaining rigorous investment criteria.",

      "**Compliance Leadership**: Strengthening regulatory compliance infrastructure to ensure portfolio companies exceed industry standards.",

      "## Leadership Commentary",

      "The company remains committed to its founding principles of long-term value creation, regulatory excellence, and stakeholder alignment.",

      "## About Gold Coast Financial",

      "Gold Coast Financial is a financial services holding company headquartered in Naperville, Illinois. The company provides governance, capital stewardship, and strategic oversight to a portfolio of regulated insurance and advisory businesses operating across the United States."
    ],
    highlights: [
      "Completed first full year of operations",
      "Achieved licensing in all 50 states",
      "Established 30+ carrier partnerships",
      "Protected over 1,000 families"
    ],
    quote: {
      text: "Our first year validated our thesis that patient capital and principled management create sustainable value in financial services. We enter 2026 with strong foundations and clear priorities.",
      author: "Jack Cook",
      title: "Chief Executive Officer"
    }
  },
  "formalization-holding-company-structure": {
    slug: "formalization-holding-company-structure",
    date: "November 18, 2025",
    category: "Governance",
    title: "Formalization of Holding Company Structure",
    summary: "Gold Coast Financial has completed the formalization of its institutional holding company structure, enhancing governance frameworks and compliance oversight capabilities.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    content: [
      "NAPERVILLE, IL — Gold Coast Financial today announced the completion of its institutional holding company structure formalization, representing a significant milestone in the company's development.",

      "The enhanced governance framework establishes clear organizational boundaries between the holding company and its operating subsidiaries while enabling effective oversight and resource sharing.",

      "## Key Elements of the Structure",

      "**Board Governance**: Established formal board oversight with defined committees for audit, compensation, and governance matters.",

      "**Compliance Infrastructure**: Implemented centralized compliance monitoring and reporting systems across all portfolio companies.",

      "**Risk Management Framework**: Developed enterprise risk management capabilities with regular assessment and reporting protocols.",

      "**Financial Controls**: Standardized financial reporting, internal controls, and audit procedures across the organization.",

      "## Implications for Portfolio Companies",

      "The formalized structure provides portfolio companies with enhanced support while preserving operational independence:",

      "**Shared Services**: Access to centralized compliance, legal, and financial expertise reduces operational burden on operating companies.",

      "**Best Practices**: Systematic sharing of operational best practices across portfolio companies drives continuous improvement.",

      "**Capital Access**: Streamlined capital allocation processes enable efficient funding of growth initiatives.",

      "## Regulatory Benefits",

      "The enhanced governance framework positions Gold Coast Financial favorably with regulatory bodies:",

      "**Clear Accountability**: Defined reporting lines and oversight responsibilities demonstrate commitment to sound governance.",

      "**Proactive Compliance**: Centralized monitoring enables early identification and resolution of compliance matters.",

      "**Stakeholder Confidence**: Institutional-grade governance builds confidence among carriers, regulators, and business partners.",

      "## About Gold Coast Financial",

      "Gold Coast Financial is a financial services holding company headquartered in Naperville, Illinois. The company provides governance, capital stewardship, and strategic oversight to a portfolio of regulated insurance and advisory businesses."
    ],
    highlights: [
      "Established formal board governance structure",
      "Implemented centralized compliance systems",
      "Developed enterprise risk management framework",
      "Standardized financial controls"
    ],
    quote: {
      text: "Strong governance isn't just about compliance—it's the foundation for building sustainable businesses that earn the trust of regulators, partners, and the families we serve.",
      author: "Gaetano Carbonara",
      title: "Chief Operating Officer"
    }
  },
  "heritage-life-solutions-expands-carrier-partnerships": {
    slug: "heritage-life-solutions-expands-carrier-partnerships",
    date: "September 12, 2025",
    category: "Portfolio",
    title: "Heritage Life Solutions Expands Carrier Partnerships",
    summary: "Heritage Life Solutions, our life insurance operating company, has expanded its carrier network to over 30 highly-rated insurance providers.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
    content: [
      "NAPERVILLE, IL — Heritage Life Solutions, a Gold Coast Financial portfolio company, today announced significant expansion of its insurance carrier network, now featuring partnerships with over 30 highly-rated providers.",

      "The expanded carrier relationships enable Heritage Life Solutions to offer clients access to a comprehensive range of life insurance products from leading national and regional carriers.",

      "## Carrier Network Highlights",

      "The expanded network includes carriers across multiple rating categories and product specializations:",

      "**A+ Rated Carriers**: Partnerships with top-tier carriers including Mutual of Omaha, Nationwide, Prudential, Lincoln Financial, and Pacific Life.",

      "**Product Diversity**: Access to term life, whole life, universal life, indexed universal life, and final expense products.",

      "**Underwriting Options**: Carriers offering traditional, simplified issue, and guaranteed issue underwriting to serve diverse client needs.",

      "## Client Benefits",

      "The expanded carrier network delivers tangible benefits to Heritage Life Solutions clients:",

      "**Competitive Pricing**: Multiple carrier options enable identification of the most competitive rates for each client situation.",

      "**Product Selection**: Comprehensive product availability ensures appropriate solutions for diverse coverage needs.",

      "**Underwriting Flexibility**: Various underwriting approaches enable coverage for clients across health categories.",

      "## Carrier Partnership Approach",

      "Heritage Life Solutions takes a selective approach to carrier partnerships, prioritizing:",

      "**Financial Strength**: All carrier partners maintain strong financial ratings from major rating agencies.",

      "**Product Quality**: Focus on carriers with competitive products and strong policy provisions.",

      "**Agent Support**: Preference for carriers providing excellent support for agents and policyholders.",

      "**Claims Reputation**: Emphasis on carriers with demonstrated commitment to prompt, fair claims handling.",

      "## About Heritage Life Solutions",

      "Heritage Life Solutions is an independent life insurance brokerage providing personalized coverage solutions to individuals and families nationwide. Operating under Gold Coast Financial governance, the company maintains full regulatory compliance across all 50 states."
    ],
    highlights: [
      "Carrier network expanded to 30+ providers",
      "Partnerships with leading A+ rated carriers",
      "Access to full range of life insurance products",
      "Nationwide distribution capabilities"
    ],
    quote: {
      text: "Our expanded carrier network ensures we can find the right coverage from the right carrier for every family we serve. Quality partnerships are the foundation of quality client outcomes.",
      author: "Jack Cook",
      title: "Chief Executive Officer"
    }
  },
  "1000-families-protected": {
    slug: "1000-families-protected",
    date: "July 8, 2025",
    category: "Milestone",
    title: "1,000 Families Protected",
    summary: "Through our operating companies, Gold Coast Financial portfolio companies have now provided coverage solutions to over 1,000 American families.",
    image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80",
    content: [
      "NAPERVILLE, IL — Gold Coast Financial today announced that its portfolio companies have collectively provided life insurance coverage to more than 1,000 American families, representing a significant milestone in the company's mission to protect families across the United States.",

      "The milestone reflects the company's commitment to making life insurance accessible and the effectiveness of its client-centered approach to coverage recommendations.",

      "## Impact Overview",

      "The 1,000 families protected milestone encompasses coverage across diverse demographics and needs:",

      "**Geographic Reach**: Families served across 47 states, with the strongest concentration in the Midwest and Northeast regions.",

      "**Coverage Types**: Policies placed include term life, whole life, final expense, and indexed universal life products.",

      "**Coverage Amounts**: Death benefit protection ranging from $10,000 final expense policies to multi-million dollar estate planning solutions.",

      "## Client-Centered Philosophy",

      "Heritage Life Solutions' approach emphasizes understanding each family's unique situation:",

      "**Needs Analysis**: Every client engagement begins with comprehensive analysis of protection needs and financial circumstances.",

      "**Education First**: Focus on helping families understand their options before making coverage decisions.",

      "**Ongoing Service**: Commitment to policy service and periodic coverage reviews as circumstances change.",

      "## Protecting What Matters",

      "Life insurance plays a critical role in family financial security:",

      "**Income Replacement**: Ensuring families can maintain their standard of living after the loss of a breadwinner.",

      "**Debt Protection**: Covering mortgages, loans, and other obligations that could burden surviving family members.",

      "**Legacy Planning**: Enabling wealth transfer and providing for future generations.",

      "**Final Expenses**: Covering funeral costs and end-of-life expenses to reduce family burden during difficult times.",

      "## Looking Forward",

      "Gold Coast Financial remains committed to expanding its impact and protecting more American families through thoughtful, personalized coverage solutions.",

      "## About Gold Coast Financial",

      "Gold Coast Financial is a financial services holding company headquartered in Naperville, Illinois, providing governance and oversight to regulated insurance and advisory businesses serving families nationwide."
    ],
    highlights: [
      "1,000+ families now protected",
      "Coverage in 47 states",
      "Diverse product mix",
      "Client-centered approach"
    ],
    quote: {
      text: "Every policy represents a family that will have financial security during their most difficult moments. This milestone reflects our team's dedication to making that protection accessible.",
      author: "Jack Cook",
      title: "Chief Executive Officer"
    }
  },
  "national-licensing-achievement": {
    slug: "national-licensing-achievement",
    date: "May 15, 2025",
    category: "Operations",
    title: "National Licensing Achievement",
    summary: "Heritage Life Solutions has achieved full licensing across all 50 states, enabling nationwide distribution of life insurance products.",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    content: [
      "NAPERVILLE, IL — Heritage Life Solutions, a Gold Coast Financial portfolio company, today announced achievement of full life insurance licensing across all 50 states, establishing true nationwide distribution capabilities.",

      "The licensing milestone enables Heritage Life Solutions to serve clients regardless of their state of residence, significantly expanding the company's addressable market.",

      "## Licensing Scope",

      "The nationwide licensing achievement encompasses:",

      "**All 50 States**: Full life insurance producer licensing in every U.S. state and the District of Columbia.",

      "**Key Territories**: Licensed in Puerto Rico and other U.S. territories as applicable.",

      "**All Product Lines**: Licensing covers term life, permanent life, annuities, and related insurance products.",

      "## Compliance Infrastructure",

      "Achieving and maintaining nationwide licensing requires robust compliance infrastructure:",

      "**Licensing Management**: Centralized systems track license status, renewal requirements, and continuing education across all jurisdictions.",

      "**Regulatory Monitoring**: Proactive monitoring of regulatory changes in each state ensures ongoing compliance.",

      "**Training Programs**: Comprehensive training ensures all producers understand state-specific requirements.",

      "## Strategic Significance",

      "National licensing is a key enabler of the company's growth strategy:",

      "**Market Access**: Ability to serve clients relocating between states without coverage interruption.",

      "**Carrier Requirements**: Meets licensing requirements for appointment with major national carriers.",

      "**Scalability**: Infrastructure to support growth without licensing constraints.",

      "## Ongoing Commitment",

      "Heritage Life Solutions views licensing compliance as an ongoing commitment, not a one-time achievement:",

      "**Continuous Education**: Producers complete required continuing education across all licensed states.",

      "**License Maintenance**: Proactive renewal processes ensure no lapse in any jurisdiction.",

      "**Regulatory Relationships**: Constructive engagement with state insurance departments.",

      "## About Heritage Life Solutions",

      "Heritage Life Solutions is an independent life insurance brokerage providing personalized coverage solutions to individuals and families. The company operates under Gold Coast Financial governance with a commitment to regulatory excellence."
    ],
    highlights: [
      "Licensed in all 50 states",
      "Full product line authorization",
      "Centralized compliance management",
      "Continuous education commitment"
    ],
    quote: {
      text: "National licensing reflects our commitment to serving families wherever they are. Compliance excellence is the foundation that enables us to fulfill that mission.",
      author: "Gaetano Carbonara",
      title: "Chief Operating Officer"
    }
  },
  "launch-heritage-life-solutions": {
    slug: "launch-heritage-life-solutions",
    date: "March 1, 2025",
    category: "Portfolio",
    title: "Launch of Heritage Life Solutions",
    summary: "Gold Coast Financial announces the launch of Heritage Life Solutions, an independent life insurance brokerage focused on personalized coverage for individuals and families.",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
    content: [
      "NAPERVILLE, IL — Gold Coast Financial today announced the launch of Heritage Life Solutions, an independent life insurance brokerage dedicated to providing personalized coverage solutions to individuals and families throughout the United States.",

      "Heritage Life Solutions represents Gold Coast Financial's first portfolio company and establishes the company's presence in life insurance distribution.",

      "## Company Overview",

      "Heritage Life Solutions operates as an independent brokerage, providing objective guidance on life insurance solutions:",

      "**Independence**: Not captive to any single carrier, enabling truly objective product recommendations.",

      "**Full Service**: Comprehensive support from initial consultation through policy issuance and ongoing service.",

      "**Client Focus**: Emphasis on education and understanding before coverage decisions.",

      "## Product Offerings",

      "Heritage Life Solutions provides access to a complete range of life insurance products:",

      "**Term Life Insurance**: Affordable coverage for specified periods, ideal for temporary needs like mortgage protection or income replacement during working years.",

      "**Whole Life Insurance**: Permanent coverage with guaranteed premiums, death benefit, and cash value accumulation.",

      "**Universal Life Insurance**: Flexible permanent coverage with adjustable premiums and death benefits.",

      "**Final Expense Insurance**: Simplified issue coverage designed to cover end-of-life costs.",

      "## Carrier Relationships",

      "Heritage Life Solutions partners with leading insurance carriers to ensure competitive options for every client situation. Initial carrier relationships include highly-rated national providers with strong product portfolios and excellent service reputations.",

      "## Operating Philosophy",

      "Heritage Life Solutions embodies Gold Coast Financial's commitment to principled business practices:",

      "**Compliance First**: Rigorous adherence to all regulatory requirements and industry best practices.",

      "**Client Advocacy**: Recommendations always based on client needs, not commission considerations.",

      "**Long-Term Relationships**: Focus on ongoing service, not just initial policy placement.",

      "## About Gold Coast Financial",

      "Gold Coast Financial is a financial services holding company headquartered in Naperville, Illinois. The company acquires and develops regulated financial services businesses with a focus on long-term value creation and operational excellence."
    ],
    highlights: [
      "New independent life insurance brokerage",
      "Multi-carrier product access",
      "Full-service client support",
      "Commitment to compliance excellence"
    ],
    quote: {
      text: "Heritage Life Solutions represents our vision for how life insurance should be sold—with genuine care for each family's unique needs and complete transparency about options and costs.",
      author: "Jack Cook",
      title: "Chief Executive Officer"
    }
  },
  "gold-coast-financial-established": {
    slug: "gold-coast-financial-established",
    date: "January 15, 2025",
    category: "Corporate",
    title: "Gold Coast Financial Established",
    summary: "Gold Coast Financial is established in Naperville, Illinois as a diversified financial services holding company.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    content: [
      "NAPERVILLE, IL — Gold Coast Financial today announced its establishment as a diversified financial services holding company, headquartered in Naperville, Illinois.",

      "The new company is founded with the mission of acquiring, developing, and operating regulated financial services businesses with a focus on long-term value creation.",

      "## Founding Vision",

      "Gold Coast Financial is established on the conviction that financial services require patient capital and principled management:",

      "**Long-Term Orientation**: Unlike private equity models with defined hold periods, Gold Coast Financial intends to own businesses indefinitely, enabling truly long-term decision making.",

      "**Regulatory Excellence**: Commitment to exceeding regulatory requirements rather than merely meeting them.",

      "**Stakeholder Alignment**: Decisions evaluated against the interests of policyholders, employees, partners, and communities—not solely shareholders.",

      "## Strategic Focus",

      "The company will focus initially on insurance distribution and related financial services:",

      "**Life Insurance**: Primary focus on life insurance brokerage and distribution.",

      "**Adjacent Opportunities**: Disciplined evaluation of opportunities in property/casualty, advisory services, and insurance technology.",

      "**Geographic Scope**: National operations with initial concentration in the Midwest region.",

      "## Leadership Team",

      "Gold Coast Financial is led by an experienced team with deep expertise in financial services:",

      "**Jack Cook, CEO**: Leads strategic vision, capital allocation, and carrier relationships.",

      "**Frank Carbonara, Executive Chairman**: Provides senior governance oversight and strategic counsel.",

      "**Gaetano Carbonara, COO**: Oversees operations, compliance, and technology initiatives.",

      "**Nick Gallagher, Head of Strategy**: Leads corporate development and partnership evaluation.",

      "## Headquarters",

      "The company is headquartered in Naperville, Illinois, located in the Chicago metropolitan area. The location provides access to major financial and insurance markets while supporting the company's Midwest focus.",

      "## Looking Ahead",

      "Gold Coast Financial enters the market with a clear vision, experienced leadership, and the patient capital necessary to build lasting institutions. The company expects to announce its first portfolio company in the coming months.",

      "## Contact",

      "For more information about Gold Coast Financial, please contact corporate@goldcoastfnl.com."
    ],
    highlights: [
      "New holding company established",
      "Naperville, IL headquarters",
      "Experienced leadership team",
      "Long-term investment orientation"
    ],
    quote: {
      text: "We're building Gold Coast Financial to be a different kind of holding company—one focused on creating lasting institutions rather than executing transactions.",
      author: "Jack Cook",
      title: "Chief Executive Officer"
    }
  }
};

// Get all article slugs for navigation
const allSlugs = Object.keys(newsArticles);

export default function InstitutionalNewsArticle() {
  const { trackCTAClicked } = useAnalytics();
  const params = useParams();
  const slug = params.slug as string;
  const article = newsArticles[slug];

  // Get category config
  const getCategoryConfig = (category: string) => {
    return categoryConfig[category] || categoryConfig["Corporate"];
  };

  if (!article) {
    return (
      <InstitutionalLayout>
        <InstitutionalSEO />
        <section className="hero-gradient py-24 md:py-32">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl font-serif display-text text-white mb-6">
                Article Not Found
              </h1>
              <p className="text-lg text-white/70 mb-8">
                The news article you're looking for doesn't exist or has been moved.
              </p>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All News
              </Link>
            </motion.div>
          </div>
        </section>
      </InstitutionalLayout>
    );
  }

  const currentIndex = allSlugs.indexOf(slug);
  const prevArticle = currentIndex > 0 ? newsArticles[allSlugs[currentIndex - 1]] : null;
  const nextArticle = currentIndex < allSlugs.length - 1 ? newsArticles[allSlugs[currentIndex + 1]] : null;
  const catConfig = getCategoryConfig(article.category);
  const CategoryIcon = catConfig.icon;

  return (
    <InstitutionalLayout>
      <InstitutionalSEO />

      {/* Hero with Featured Image */}
      <section className="hero-gradient py-16 md:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All News
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full mb-4 ${catConfig.bgColor} ${catConfig.color}`}>
                  <CategoryIcon className="w-3.5 h-3.5" />
                  {article.category}
                </span>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif display-text text-white mb-6">
                  {article.title}
                </h1>

                <p className="text-lg text-white/70 leading-relaxed mb-6">
                  {article.summary}
                </p>

                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Naperville, IL
                  </span>
                </div>
              </div>

              {/* Featured Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative aspect-[4/3] rounded-xl overflow-hidden"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 bg-muted/30 border-y border-border/60">
        <div className="container mx-auto px-6 lg:px-12">
          <TrustIndicators variant="light" />
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="prose prose-lg max-w-none">
                {article.content.map((paragraph, index) => {
                  // Check if paragraph is a heading
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-xl md:text-2xl font-serif text-primary mt-10 mb-4 first:mt-0">
                        {paragraph.replace('## ', '')}
                      </h2>
                    );
                  }
                  // Check if paragraph starts with bold text (key point)
                  if (paragraph.startsWith('**')) {
                    const match = paragraph.match(/^\*\*([^*]+)\*\*:?\s*(.*)/);
                    if (match) {
                      return (
                        <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                          <strong className="text-primary">{match[1]}:</strong> {match[2]}
                        </p>
                      );
                    }
                  }
                  return (
                    <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Quote Highlight */}
              {article.quote && (
                <div className="mt-12 p-8 bg-gradient-to-br from-[hsl(348,65%,18%)] to-[hsl(348,65%,25%)] rounded-lg text-white">
                  <blockquote className="text-lg md:text-xl font-serif italic leading-relaxed mb-6">
                    "{article.quote.text}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-sm font-semibold">{article.quote.author.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="font-medium">{article.quote.author}</p>
                      <p className="text-sm text-white/70">{article.quote.title}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="mt-12 pt-8 border-t border-border/60">
                <ShareButtons
                  title={article.title}
                  summary={article.summary}
                />
              </div>

              {/* Article Navigation */}
              <div className="mt-12 pt-8 border-t border-border/60">
                <div className="grid grid-cols-2 gap-4">
                  {prevArticle ? (
                    <Link
                      href={`/news/${prevArticle.slug}`}
                      className="group p-4 rounded-lg border border-border/60 hover:border-primary/30 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </div>
                      <p className="text-sm font-medium text-primary group-hover:text-[hsl(348,65%,25%)] transition-colors line-clamp-2">
                        {prevArticle.title}
                      </p>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {nextArticle ? (
                    <Link
                      href={`/news/${nextArticle.slug}`}
                      className="group p-4 rounded-lg border border-border/60 hover:border-primary/30 hover:bg-muted/30 transition-all text-right"
                    >
                      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-2">
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium text-primary group-hover:text-[hsl(348,65%,25%)] transition-colors line-clamp-2">
                        {nextArticle.title}
                      </p>
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </motion.article>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Highlights */}
              {article.highlights && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white border border-border/60 p-6 rounded-lg"
                >
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Key Highlights
                  </h3>
                  <ul className="space-y-3">
                    {article.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Company Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-muted/30 border border-border/60 p-6 rounded-lg"
              >
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                  Media Contact
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    For press inquiries and additional information:
                  </p>
                  <a
                    href="mailto:media@goldcoastfnl.com"
                    className="text-[hsl(348,65%,25%)] font-medium hover:underline"
                  >
                    media@goldcoastfnl.com
                  </a>
                </div>
              </motion.div>

              {/* Related News */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white border border-border/60 p-6 rounded-lg"
              >
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                  Recent News
                </h3>
                <div className="space-y-4">
                  {Object.values(newsArticles)
                    .filter(a => a.slug !== slug)
                    .slice(0, 3)
                    .map((related) => {
                      const relConfig = getCategoryConfig(related.category);
                      return (
                        <Link
                          key={related.slug}
                          href={`/news/${related.slug}`}
                          className="block group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${relConfig.bgColor} ${relConfig.color}`}>
                              {related.category}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{related.date}</span>
                          </div>
                          <h4 className="text-sm font-medium text-primary group-hover:text-[hsl(348,65%,25%)] transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                        </Link>
                      );
                    })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* CTA */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-serif text-primary mb-4">
              Stay Informed
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              For the latest news and announcements from Gold Coast Financial, visit our news page or contact our media relations team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(348,65%,20%)] text-white rounded-lg font-medium hover:bg-[hsl(348,65%,25%)] transition-colors"
              >
                View All News
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border/60 rounded-lg font-medium hover:bg-muted/50 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
