import { HeritageLayout } from "@/components/layout/HeritageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, Share2, BookOpen, Check, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import coverImage1 from "@assets/stock_images/family_financial_pla_4b0aee36.jpg";
import coverImage2 from "@assets/stock_images/couple_reviewing_fin_24d18d0d.jpg";
import coverImage3 from "@assets/stock_images/senior_couple_signin_3a20251f.jpg";
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

// Heritage Life Solutions articles with company branding
export const heritageArticles = [
  {
    slug: "how-much-life-insurance-do-you-need",
    title: "How Much Life Insurance Do You Really Need?",
    excerpt: "Learn the proven methods financial experts use to calculate the right coverage amount for your family.",
    category: "Guide",
    date: "Aug 15, 2025",
    content: `
      <h2>The Million-Dollar Question: How Much Coverage Do You Need?</h2>
      <p>One of the most common mistakes people make when purchasing life insurance is either buying too little coverage or overpaying for more than they need. Getting the right amount requires understanding your family's unique financial situation and future needs.</p>

      <h3>Method 1: The DIME Formula</h3>
      <p>DIME stands for Debt, Income, Mortgage, and Education—the four key factors in calculating your coverage needs:</p>
      <ul>
        <li><strong>D - Debt:</strong> Total all outstanding debts including credit cards, car loans, and personal loans</li>
        <li><strong>I - Income:</strong> Multiply your annual income by the number of years your family would need support (typically 10-15 years)</li>
        <li><strong>M - Mortgage:</strong> Include your remaining mortgage balance</li>
        <li><strong>E - Education:</strong> Estimate future education costs for your children</li>
      </ul>

      <h3>Method 2: The 10-12x Income Rule</h3>
      <p>A simpler approach suggests purchasing coverage equal to 10-12 times your annual income. While this provides a quick estimate, it may not account for your specific circumstances.</p>

      <h3>Factors That Affect Your Coverage Needs</h3>
      <ul>
        <li>Number of dependents and their ages</li>
        <li>Your spouse's income and earning potential</li>
        <li>Current savings and investments</li>
        <li>Existing life insurance through work</li>
        <li>Future financial goals and obligations</li>
      </ul>

      <h3>Why Professional Guidance Matters</h3>
      <p>At Heritage Life Solutions, we take a comprehensive approach to determining your coverage needs. Our advisors consider your complete financial picture—not just a simple formula—to recommend the right protection for your family. Contact us for a free, no-obligation consultation to discuss your specific needs.</p>
    `
  },
  {
    slug: "term-vs-whole-life-insurance",
    title: "Term vs. Whole Life Insurance: Which Is Right for You?",
    excerpt: "Understanding the key differences between term and whole life insurance to make an informed decision.",
    category: "Education",
    date: "Jul 28, 2025",
    content: `
      <h2>Understanding Your Life Insurance Options</h2>
      <p>Choosing between term and whole life insurance is one of the most important decisions you'll make when protecting your family. Each type serves different purposes and offers distinct advantages.</p>

      <h3>Term Life Insurance: Affordable Protection for a Set Period</h3>
      <p>Term life insurance provides coverage for a specific period—typically 10, 20, or 30 years. If you pass away during the term, your beneficiaries receive the death benefit. If you outlive the term, the coverage ends.</p>

      <h4>Advantages of Term Life:</h4>
      <ul>
        <li><strong>Affordability:</strong> Term policies are significantly less expensive than whole life</li>
        <li><strong>Simplicity:</strong> Easy to understand with straightforward coverage</li>
        <li><strong>Flexibility:</strong> Choose the term length that matches your needs</li>
        <li><strong>Higher coverage:</strong> Get more coverage for your premium dollar</li>
      </ul>

      <h4>Best For:</h4>
      <ul>
        <li>Young families on a budget</li>
        <li>Covering specific financial obligations (mortgage, children's education)</li>
        <li>Income replacement during working years</li>
      </ul>

      <h3>Whole Life Insurance: Permanent Coverage with Cash Value</h3>
      <p>Whole life insurance provides lifelong coverage with a guaranteed death benefit and builds cash value over time. Your premiums remain level throughout your life.</p>

      <h4>Advantages of Whole Life:</h4>
      <ul>
        <li><strong>Lifetime coverage:</strong> Protection that never expires</li>
        <li><strong>Cash value growth:</strong> Build tax-deferred savings you can borrow against</li>
        <li><strong>Fixed premiums:</strong> Payments never increase</li>
        <li><strong>Dividends:</strong> Potential to receive dividends from participating policies</li>
      </ul>

      <h4>Best For:</h4>
      <ul>
        <li>Estate planning and wealth transfer</li>
        <li>Business succession planning</li>
        <li>Guaranteed insurability regardless of future health</li>
        <li>Supplementing retirement income</li>
      </ul>

      <h3>Making the Right Choice</h3>
      <p>The best choice depends on your specific situation, goals, and budget. Many people benefit from a combination of both types—using term insurance for temporary high-coverage needs and whole life for permanent protection and cash value growth.</p>

      <p>At Heritage Life Solutions, our independent advisors can help you evaluate your options and design a protection strategy that fits your unique needs. We work with over 40 top-rated carriers to find the best solution for you.</p>
    `
  },
  {
    slug: "key-person-insurance-explained",
    title: "Key Person Insurance: Protecting Your Business's Most Valuable Asset",
    excerpt: "How key person insurance safeguards your company when you can't afford to lose essential team members.",
    category: "Business",
    date: "Jun 10, 2025",
    content: `
      <h2>What Is Key Person Insurance?</h2>
      <p>Key person insurance (also called key man or key employee insurance) is a life insurance policy that a business purchases on the life of an essential employee, owner, or partner. The company pays the premiums and is the beneficiary—providing crucial financial protection if that key individual passes away.</p>

      <h3>Who Qualifies as a "Key Person"?</h3>
      <p>A key person is anyone whose death would significantly impact the business financially. This typically includes:</p>
      <ul>
        <li><strong>Business owners and founders</strong></li>
        <li><strong>C-suite executives</strong> (CEO, CFO, COO)</li>
        <li><strong>Top salespeople</strong> who generate significant revenue</li>
        <li><strong>Technical experts</strong> with specialized knowledge</li>
        <li><strong>Key relationship managers</strong> who maintain crucial client relationships</li>
      </ul>

      <h3>Why Your Business Needs Key Person Insurance</h3>
      <p>The death of a key employee can trigger a cascade of financial challenges:</p>
      <ul>
        <li><strong>Lost revenue:</strong> Especially if the person was responsible for major accounts or sales</li>
        <li><strong>Recruitment costs:</strong> Finding and training a replacement can cost 50-200% of the person's annual salary</li>
        <li><strong>Business disruption:</strong> Projects may stall, affecting client relationships</li>
        <li><strong>Loan repayment:</strong> Banks may call in loans if a key guarantor passes away</li>
        <li><strong>Investor confidence:</strong> Stakeholders may lose faith in the company's future</li>
      </ul>

      <h3>How Much Coverage Do You Need?</h3>
      <p>Calculating the right coverage amount involves several factors:</p>
      <ol>
        <li><strong>Revenue contribution:</strong> How much income does this person generate or protect?</li>
        <li><strong>Replacement costs:</strong> What would it cost to recruit, hire, and train a replacement?</li>
        <li><strong>Debt obligations:</strong> What business loans might become due?</li>
        <li><strong>Transition period:</strong> How long will it take to stabilize operations?</li>
      </ol>

      <h3>Tax Considerations</h3>
      <p>Key person insurance offers favorable tax treatment:</p>
      <ul>
        <li>Premiums are <strong>not tax-deductible</strong> as a business expense</li>
        <li>Death benefits are generally received <strong>income tax-free</strong></li>
        <li>Proceeds can be used for any business purpose</li>
      </ul>

      <h3>Getting Started</h3>
      <p>At Heritage Life Solutions, we specialize in helping businesses protect themselves against the loss of key personnel. Our advisors can help you identify key employees, calculate appropriate coverage amounts, and find the most cost-effective policies from our network of top-rated carriers.</p>
    `
  },
  {
    slug: "indexed-universal-life-explained",
    title: "Indexed Universal Life (IUL): A Complete Guide",
    excerpt: "Explore how IUL policies combine life insurance protection with tax-advantaged growth potential.",
    category: "Education",
    date: "May 5, 2025",
    content: `
      <h2>What Is Indexed Universal Life Insurance?</h2>
      <p>Indexed Universal Life (IUL) is a type of permanent life insurance that offers both a death benefit and a cash value component that can grow based on the performance of a stock market index, such as the S&P 500—but with downside protection.</p>

      <h3>How IUL Works</h3>
      <p>When you pay premiums on an IUL policy, a portion goes toward the cost of insurance and fees, while the remainder is credited to your cash value account. The growth of this cash value is linked to a market index:</p>
      <ul>
        <li><strong>Floor protection:</strong> Your cash value won't decrease due to market losses (typically 0-1% floor)</li>
        <li><strong>Cap rate:</strong> Growth is capped at a maximum rate (often 9-12% annually)</li>
        <li><strong>Participation rate:</strong> You receive a percentage of the index gains (often 50-100%)</li>
      </ul>

      <h3>Key Benefits of IUL</h3>
      <h4>1. Downside Protection</h4>
      <p>Unlike direct market investments, your cash value is protected from market downturns. In years when the index loses value, your account is credited with the floor rate (often 0%), meaning you don't lose money.</p>

      <h4>2. Tax-Advantaged Growth</h4>
      <p>Cash value grows tax-deferred, and you can access it through policy loans that are generally income tax-free when structured properly.</p>

      <h4>3. Flexible Premiums</h4>
      <p>Within certain limits, you can adjust your premium payments based on your financial situation.</p>

      <h4>4. Death Benefit</h4>
      <p>Your beneficiaries receive a tax-free death benefit, providing essential protection for your family.</p>

      <h3>Who Should Consider IUL?</h3>
      <p>IUL may be appropriate for individuals who:</p>
      <ul>
        <li>Have maxed out traditional retirement accounts (401k, IRA)</li>
        <li>Want permanent life insurance with growth potential</li>
        <li>Seek tax-advantaged supplemental retirement income</li>
        <li>Have a long time horizon (15+ years) for cash value growth</li>
        <li>Want downside protection while participating in market gains</li>
      </ul>

      <h3>Important Considerations</h3>
      <ul>
        <li><strong>Complexity:</strong> IUL policies require careful understanding and ongoing management</li>
        <li><strong>Fees:</strong> Higher costs than term insurance; understand all charges before purchasing</li>
        <li><strong>Illustrations:</strong> Be wary of overly optimistic projections; ask to see conservative scenarios</li>
        <li><strong>Commitment:</strong> Best results require adequate funding over many years</li>
      </ul>

      <h3>The Heritage Life Solutions Approach</h3>
      <p>Our advisors take time to thoroughly explain how IUL works, including both the benefits and limitations. We'll help you determine if IUL fits your overall financial strategy and compare options from multiple top-rated carriers to find the best policy structure for your needs.</p>
    `
  },
  {
    slug: "life-insurance-101-complete-guide",
    title: "Life Insurance 101: The Complete Beginner's Guide",
    excerpt: "Everything you need to know about life insurance—from the basics to choosing the right policy for your family.",
    category: "Guide",
    date: "Sep 12, 2025",
    content: `
      <h2>What Is Life Insurance and Why Does It Matter?</h2>
      <p>Life insurance is a contract between you and an insurance company. You pay premiums, and in exchange, the insurer promises to pay a sum of money (the death benefit) to your designated beneficiaries when you pass away.</p>

      <p>But life insurance is more than just a financial product—it's a promise to the people who depend on you. It ensures your mortgage gets paid, your children can attend college, and your family maintains their quality of life even when you're not there to provide.</p>

      <h3>The Protection Gap: Why Most Families Are Underinsured</h3>
      <p>According to LIMRA research:</p>
      <ul>
        <li>Over 100 million American adults have no life insurance</li>
        <li>44% of households would face financial hardship within six months if the primary earner died</li>
        <li>80% of consumers overestimate the cost of life insurance</li>
      </ul>

      <h3>Types of Life Insurance</h3>

      <h4>Term Life Insurance</h4>
      <p>Provides coverage for a specific period (10, 20, or 30 years). It's the most affordable option and ideal for covering temporary needs like mortgages or children's education.</p>

      <h4>Whole Life Insurance</h4>
      <p>Permanent coverage with fixed premiums and guaranteed cash value growth. Best for those wanting lifelong protection and conservative savings accumulation.</p>

      <h4>Universal Life Insurance</h4>
      <p>Flexible permanent coverage with adjustable premiums and death benefits. Cash value earns interest based on current rates.</p>

      <h4>Indexed Universal Life (IUL)</h4>
      <p>Cash value growth linked to market index performance with downside protection. Offers higher growth potential than traditional universal life.</p>

      <h3>How Much Coverage Do You Need?</h3>
      <p>Use the DIME method:</p>
      <ul>
        <li><strong>D - Debt:</strong> All outstanding debts</li>
        <li><strong>I - Income:</strong> Annual income × years of support needed</li>
        <li><strong>M - Mortgage:</strong> Remaining mortgage balance</li>
        <li><strong>E - Education:</strong> Future education costs for children</li>
      </ul>

      <h3>The Application Process</h3>
      <ol>
        <li><strong>Determine your needs:</strong> Calculate how much coverage you require</li>
        <li><strong>Choose a policy type:</strong> Term, whole life, or universal life</li>
        <li><strong>Get quotes:</strong> Compare rates from multiple carriers</li>
        <li><strong>Complete the application:</strong> Provide health and lifestyle information</li>
        <li><strong>Medical exam:</strong> Many policies require a brief health screening</li>
        <li><strong>Underwriting:</strong> The insurer reviews your application</li>
        <li><strong>Policy issuance:</strong> Once approved, your coverage begins</li>
      </ol>

      <h3>Get Expert Guidance</h3>
      <p>At Heritage Life Solutions, we work with over 40 top-rated carriers to find the best coverage at the best price for your unique situation. Our consultations are always free and pressure-free.</p>
    `
  },
  {
    slug: "coverage-calculator-guide",
    title: "Life Insurance Coverage Calculator: How Much Do You Really Need?",
    excerpt: "A step-by-step worksheet to calculate exactly how much life insurance your family needs.",
    category: "Calculator",
    date: "Oct 22, 2025",
    content: `
      <h2>Why Precision Matters</h2>
      <p>The average American family is underinsured by $200,000. Getting your coverage amount right means the difference between your family thriving or struggling after you're gone.</p>

      <h3>Step 1: Calculate Your Debts</h3>
      <p>Add up all debts that would need to be paid:</p>
      <ul>
        <li>Mortgage balance: $________</li>
        <li>Auto loans: $________</li>
        <li>Student loans: $________</li>
        <li>Credit card debt: $________</li>
        <li>Other loans: $________</li>
        <li>Final expenses (funeral, etc.): $15,000 (average)</li>
      </ul>
      <p><strong>Total Debts: $________</strong></p>

      <h3>Step 2: Calculate Income Replacement</h3>
      <p>How much income does your family need, and for how long?</p>
      <ul>
        <li>Your annual income: $________</li>
        <li>Years of support needed: ________ (until youngest child is independent)</li>
        <li>Income replacement needed: $________ × ________ years = $________</li>
      </ul>

      <h3>Step 3: Calculate Education Expenses</h3>
      <p>Estimate future education costs:</p>
      <ul>
        <li>Child 1: $________ (4-year public: ~$100,000; private: ~$200,000)</li>
        <li>Child 2: $________</li>
        <li>Child 3: $________</li>
      </ul>
      <p><strong>Total Education: $________</strong></p>

      <h3>Step 4: Add It Up</h3>
      <table>
        <tr><td>Debts & Final Expenses:</td><td>$________</td></tr>
        <tr><td>Income Replacement:</td><td>$________</td></tr>
        <tr><td>Education:</td><td>$________</td></tr>
        <tr><td><strong>Gross Need:</strong></td><td><strong>$________</strong></td></tr>
      </table>

      <h3>Step 5: Subtract Existing Resources</h3>
      <ul>
        <li>Current life insurance: $________</li>
        <li>Savings & investments: $________</li>
        <li>Spouse's income capacity: $________</li>
      </ul>
      <p><strong>Total Resources: $________</strong></p>

      <h3>Your Coverage Need</h3>
      <p><strong>Gross Need - Existing Resources = Coverage Needed</strong></p>
      <p>$________ - $________ = <strong>$________</strong></p>

      <h3>Get a Personalized Analysis</h3>
      <p>This calculator provides a starting point, but everyone's situation is unique. At Heritage Life Solutions, our advisors provide comprehensive, personalized coverage analyses at no cost. Contact us today for your free consultation.</p>
    `
  },
  {
    slug: "term-vs-permanent-comparison",
    title: "Term vs. Permanent Life Insurance: A Detailed Comparison",
    excerpt: "A comprehensive side-by-side comparison to help you choose the right type of life insurance.",
    category: "Comparison",
    date: "Nov 30, 2025",
    content: `
      <h2>Making the Right Choice for Your Family</h2>
      <p>The term vs. permanent life insurance decision is one of the most important financial choices you'll make. Here's everything you need to know to make an informed decision.</p>

      <h3>Quick Comparison</h3>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Term Life</th>
            <th>Permanent Life</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Coverage Duration</td>
            <td>10-30 years</td>
            <td>Lifetime</td>
          </tr>
          <tr>
            <td>Premiums</td>
            <td>Lower, level for term</td>
            <td>Higher, level for life</td>
          </tr>
          <tr>
            <td>Cash Value</td>
            <td>None</td>
            <td>Yes, grows over time</td>
          </tr>
          <tr>
            <td>Best For</td>
            <td>Temporary needs</td>
            <td>Lifetime needs</td>
          </tr>
        </tbody>
      </table>

      <h3>When to Choose Term Life</h3>
      <ul>
        <li>You need coverage for a specific period (until mortgage is paid, kids graduate)</li>
        <li>You're on a tight budget but need maximum coverage</li>
        <li>You prefer to invest the premium difference yourself</li>
        <li>You're young and healthy (lock in low rates now)</li>
      </ul>

      <h3>When to Choose Permanent Life</h3>
      <ul>
        <li>You want lifelong coverage guaranteed</li>
        <li>Estate planning is a priority</li>
        <li>You've maxed out other tax-advantaged accounts</li>
        <li>You want to leave a legacy for heirs or charity</li>
        <li>You have a special needs dependent</li>
      </ul>

      <h3>The Hybrid Approach</h3>
      <p>Many families benefit from combining both types:</p>
      <ul>
        <li><strong>Large term policy:</strong> Covers major obligations during working years</li>
        <li><strong>Smaller permanent policy:</strong> Provides lifetime coverage and cash value</li>
      </ul>

      <h3>Expert Guidance</h3>
      <p>At Heritage Life Solutions, we help you analyze your specific situation and recommend the optimal mix of coverage. Our independent advisors work with 40+ carriers to find the best solution for your needs.</p>
    `
  },
  {
    slug: "life-insurance-for-new-parents",
    title: "Life Insurance for New Parents: A Complete Checklist",
    excerpt: "Everything expecting and new parents need to know about protecting their growing family.",
    category: "Planning",
    date: "Dec 15, 2025",
    content: `
      <h2>Congratulations—Now Let's Protect Your New Family</h2>
      <p>Becoming a parent is life-changing in every way, including financially. Here's your complete guide to ensuring your child's future is protected.</p>

      <h3>Priority #1: Get Life Insurance Now</h3>
      <p>The best time to get life insurance is before or during pregnancy:</p>
      <ul>
        <li>You're likely at your healthiest right now</li>
        <li>Lock in low rates before any health changes</li>
        <li>Coverage takes 2-6 weeks to approve—start early</li>
      </ul>

      <h4>How Much Coverage for New Parents?</h4>
      <p>Use this formula as a starting point:</p>
      <ul>
        <li><strong>Income replacement:</strong> Annual salary × 20 years</li>
        <li><strong>Mortgage payoff:</strong> Full balance</li>
        <li><strong>Education fund:</strong> $150,000-$250,000 per child</li>
        <li><strong>Final expenses:</strong> $15,000</li>
        <li><strong>Emergency fund:</strong> 6-12 months expenses</li>
      </ul>

      <h4>Don't Forget the Stay-at-Home Parent</h4>
      <p>A stay-at-home parent provides services worth $60,000-$120,000 annually:</p>
      <ul>
        <li>Childcare: $35,000-$70,000</li>
        <li>Housekeeping: $6,000-$12,000</li>
        <li>Cooking: $5,000-$10,000</li>
        <li>Transportation: $3,000-$6,000</li>
      </ul>
      <p>Recommended coverage: $500,000-$1,000,000</p>

      <h3>Priority #2: Create or Update Your Will</h3>
      <p>Your will should include:</p>
      <ul>
        <li><strong>Guardian designation:</strong> Who raises your children if both parents die</li>
        <li><strong>Trustee designation:</strong> Who manages money for your children</li>
        <li><strong>Trust provisions:</strong> How and when children receive assets</li>
      </ul>

      <h3>Priority #3: Update Beneficiaries</h3>
      <p>Review beneficiaries on all accounts:</p>
      <ul>
        <li>Life insurance policies</li>
        <li>401(k) and retirement accounts</li>
        <li>Bank accounts</li>
        <li>Investment accounts</li>
      </ul>
      <p><strong>Important:</strong> Never name minor children directly as beneficiaries. Use a trust instead.</p>

      <h3>Priority #4: Build Your Emergency Fund</h3>
      <p>Aim for 6-9 months of expenses in savings before baby arrives.</p>

      <h3>Priority #5: Start a 529 Plan</h3>
      <p>The power of starting early:</p>
      <ul>
        <li>$100/month from birth = $48,600 by age 18 (7% return)</li>
        <li>$250/month from birth = $121,500 by age 18</li>
        <li>Tax-free growth for education expenses</li>
      </ul>

      <h3>We're Here to Help</h3>
      <p>At Heritage Life Solutions, we specialize in helping new families create comprehensive protection plans. Our advisors understand the unique needs of growing families and can help you prioritize what matters most within your budget.</p>
    `
  }
];

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

const readingTimes: Record<string, string> = {
  "how-much-life-insurance-do-you-need": "5 min read",
  "term-vs-whole-life-insurance": "7 min read",
  "key-person-insurance-explained": "5 min read",
  "indexed-universal-life-explained": "10 min read",
  "life-insurance-101-complete-guide": "12 min read",
  "coverage-calculator-guide": "8 min read",
  "term-vs-permanent-comparison": "10 min read",
  "life-insurance-for-new-parents": "10 min read"
};

export default function HeritageArticle() {
  const params = useParams<{ slug: string }>();
  const article = heritageArticles.find(a => a.slug === params.slug);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;
    const title = article?.title || "Heritage Life Solutions Article";

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
          title: article?.title || "Heritage Life Solutions Article",
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
      <HeritageLayout>
        <div className="container mx-auto px-4 py-20 text-center" style={{ backgroundColor: c.background }}>
          <h1 className="text-4xl font-bold font-serif mb-4" style={{ color: c.primary }}>Article Not Found</h1>
          <p className="mb-8" style={{ color: c.textSecondary }}>The article you're looking for doesn't exist.</p>
          <Link href="/heritage/resources">
            <Button style={{ backgroundColor: c.primary, color: c.white }}>Back to Resources</Button>
          </Link>
        </div>
      </HeritageLayout>
    );
  }

  const coverImage = coverImages[article.slug];
  const readingTime = readingTimes[article.slug];

  return (
    <HeritageLayout>
      <article>
        <section className="relative overflow-hidden py-12 md:py-16" style={{ backgroundColor: c.primary }}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryHover})` }} />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-1/4" />
          <motion.div
            className="container mx-auto px-4 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/heritage/resources">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 mb-6 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resources
              </Button>
            </Link>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge className="text-sm px-3 py-1" style={{ backgroundColor: c.secondary, color: c.textPrimary }}>{article.category}</Badge>
              <span className="text-white/80 flex items-center gap-1.5 text-sm">
                <Calendar className="w-4 h-4" /> {article.date}
              </span>
              <span className="text-white/80 flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4" /> {readingTime}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-white max-w-4xl leading-tight">{article.title}</h1>

            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${c.secondary}30` }}>
                <User className="w-6 h-6" style={{ color: c.secondary }} />
              </div>
              <div>
                <p className="text-white font-medium">Heritage Life Solutions Team</p>
                <p className="text-white/80 text-sm">Expert Insurance Advisors</p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="py-12 md:py-16" style={{ backgroundColor: c.background }}>
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
                    className="gap-1.5 transition-colors"
                    style={{ borderColor: c.primary, color: c.primary }}
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print</span>
                    <span className="sm:hidden">Save</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="gap-1.5 transition-colors"
                    style={{ borderColor: c.primary, color: c.primary }}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    <span>Share</span>
                  </Button>
                </div>
              </motion.div>

              <motion.div
                className="rounded-xl p-5 mb-10 border-l-4"
                style={{ backgroundColor: `${c.muted}30`, borderColor: c.secondary }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-start gap-4">
                  <BookOpen className="w-5 h-5 shrink-0 mt-0.5" style={{ color: c.secondary }} />
                  <div>
                    <p className="font-semibold mb-1" style={{ color: c.textPrimary }}>Key Takeaways</p>
                    <p className="text-sm leading-relaxed" style={{ color: c.textSecondary }}>
                      {article.slug === "how-much-life-insurance-do-you-need" && "Learn the DIME method and other strategies to calculate your ideal coverage amount based on your family's unique needs."}
                      {article.slug === "term-vs-whole-life-insurance" && "Understand the key differences between term and whole life insurance to make an informed decision for your family's protection."}
                      {article.slug === "key-person-insurance-explained" && "Discover how to protect your business from the financial impact of losing a key employee, owner, or partner."}
                      {article.slug === "indexed-universal-life-explained" && "A comprehensive guide to Indexed Universal Life insurance - how it works, its benefits, and whether it's the right choice for your financial goals."}
                      {article.slug === "life-insurance-101-complete-guide" && "Everything you need to know about life insurance, from basic concepts to choosing the right policy type for your needs."}
                      {article.slug === "coverage-calculator-guide" && "A step-by-step guide to calculating exactly how much life insurance coverage your family needs."}
                      {article.slug === "term-vs-permanent-comparison" && "A detailed comparison of term and permanent life insurance to help you make the right choice."}
                      {article.slug === "life-insurance-for-new-parents" && "Essential steps new parents should take to protect their growing family's financial future."}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="heritage-article-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <motion.div
                className="flex items-center gap-4 mt-10 pt-8 border-t"
                style={{ borderColor: c.muted }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <span className="text-sm" style={{ color: c.textSecondary }}>Share this article:</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10 transition-colors"
                    style={{ borderColor: c.primary, color: c.primary }}
                    onClick={handleShare}
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
                <div className="rounded-2xl p-8 md:p-10 text-center relative overflow-hidden" style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryHover})` }}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full translate-y-1/2 -translate-x-1/2" style={{ backgroundColor: `${c.secondary}10` }} />
                  <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold font-serif text-white mb-4">Ready to Protect Your Family?</h3>
                    <p className="text-white/80 mb-6 max-w-xl mx-auto leading-relaxed">
                      Our team of expert advisors is here to help you find the perfect coverage for your unique situation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/heritage/get-quote">
                        <Button size="lg" className="px-8" style={{ backgroundColor: c.secondary, color: c.textPrimary }}>
                          Get a Free Quote
                        </Button>
                      </Link>
                      <Link href="/heritage/contact">
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
                <h3 className="text-2xl font-bold font-serif mb-6" style={{ color: c.primary }}>Related Articles</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {heritageArticles
                    .filter(a => a.slug !== article.slug)
                    .slice(0, 2)
                    .map((relatedArticle, i) => (
                      <Link key={i} href={`/heritage/resources/${relatedArticle.slug}`}>
                        <motion.div
                          className="group rounded-xl overflow-hidden border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                          style={{ backgroundColor: c.cream, borderColor: c.muted }}
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
                            <Badge variant="secondary" className="mb-2 text-xs" style={{ backgroundColor: `${c.primary}15`, color: c.primary }}>{relatedArticle.category}</Badge>
                            <h4 className="font-serif font-bold text-base transition-colors line-clamp-2" style={{ color: c.textPrimary }}>{relatedArticle.title}</h4>
                            <span className="font-semibold text-sm mt-2 inline-block group-hover:translate-x-1 transition-transform" style={{ color: c.secondary }}>Read Article &rarr;</span>
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
        .heritage-article-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: ${c.primary};
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        .heritage-article-content h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: ${c.primary};
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .heritage-article-content h4 {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: ${c.primary};
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .heritage-article-content p {
          color: ${c.textSecondary};
          font-size: 1.0625rem;
          line-height: 1.8;
          margin-bottom: 1.25rem;
        }
        .heritage-article-content ul, .heritage-article-content ol {
          margin: 1.25rem 0;
          padding-left: 1.5rem;
        }
        .heritage-article-content li {
          color: ${c.textSecondary};
          font-size: 1.0625rem;
          line-height: 1.7;
          margin-bottom: 0.75rem;
          position: relative;
        }
        .heritage-article-content li::marker {
          color: ${c.secondary};
        }
        .heritage-article-content strong {
          color: ${c.textPrimary};
          font-weight: 600;
        }
        .heritage-article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.9375rem;
        }
        .heritage-article-content table thead {
          background: ${c.primary};
          color: white;
        }
        .heritage-article-content table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          border: 1px solid ${c.muted};
        }
        .heritage-article-content table td {
          padding: 0.75rem 1rem;
          border: 1px solid ${c.muted};
          color: ${c.textSecondary};
        }
        .heritage-article-content table tbody tr:nth-child(even) {
          background: ${c.cream};
        }
        .heritage-article-content table tbody tr:hover {
          background: ${c.muted}40;
        }
        .heritage-article-content em {
          font-style: italic;
          color: ${c.textSecondary};
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
          .print\\:hidden {
            display: none !important;
          }

          .heritage-article-content {
            max-width: 100% !important;
          }

          .heritage-article-content h2 {
            color: ${c.primary} !important;
            font-size: 18pt !important;
            page-break-after: avoid;
          }

          .heritage-article-content h3 {
            color: ${c.primary} !important;
            font-size: 14pt !important;
            page-break-after: avoid;
          }

          .heritage-article-content p {
            color: #333 !important;
            font-size: 11pt !important;
          }

          img {
            max-width: 100% !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </HeritageLayout>
  );
}
