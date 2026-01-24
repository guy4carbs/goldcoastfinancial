import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import {
  BookOpen,
  Clock,
  ArrowRight,
  Search,
  TrendingUp,
  Shield,
  Heart,
  DollarSign,
  Calendar,
  User,
  ChevronRight,
  Sparkles,
  History,
  Mail,
  Send,
  CheckCircle
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Blog post data with slugs for routing
export const blogPosts = [
  // ==================== TERM LIFE ====================
  {
    id: 1,
    slug: "how-much-life-insurance-do-you-need",
    title: "How Much Life Insurance Do You Actually Need?",
    excerpt: "A simple guide to calculating coverage based on your income, debts, and family situation.",
    category: "term",
    author: "Heritage Team",
    readTime: "5 min read",
    date: "Jan 15, 2024",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
    featured: true,
    content: `
      <p>"How much life insurance do I need?" It's the most common question we hear—and one of the most important to answer correctly.</p>

      <h2>The Quick Method: 10-12x Your Income</h2>
      <p>The simplest approach: multiply your annual income by 10-12.</p>
      <p>If you earn $75,000/year, you'd need $750,000 to $900,000 in coverage. This gives your family about a decade to adjust financially.</p>

      <h2>The Better Method: DIME</h2>
      <p>For a more accurate number, add up these four things:</p>
      <ul>
        <li><strong>D - Debt:</strong> All debts except mortgage (car loans, credit cards, student loans)</li>
        <li><strong>I - Income:</strong> Years of income your family needs (usually 10-15 years)</li>
        <li><strong>M - Mortgage:</strong> Your full mortgage balance</li>
        <li><strong>E - Education:</strong> College costs per child ($100k-$250k each)</li>
      </ul>

      <h2>Real Example</h2>
      <p>Sarah, 35, earns $80,000 with two young kids:</p>
      <ul>
        <li>Income replacement (15 years): $1,200,000</li>
        <li>Mortgage: $250,000</li>
        <li>Other debts: $30,000</li>
        <li>College (2 kids): $300,000</li>
        <li>Final expenses: $15,000</li>
      </ul>
      <p><strong>Total need: $1,795,000</strong></p>
      <p>Minus her 401k ($150,000) and work coverage ($80,000) = <strong>$1,565,000 needed</strong></p>

      <h2>Factors That Change Your Number</h2>
      <ul>
        <li>Spouse's income (more income = less coverage needed)</li>
        <li>Number and ages of children</li>
        <li>Existing savings and investments</li>
        <li>Social Security survivor benefits</li>
        <li>Employer-provided life insurance</li>
      </ul>

      <h2>When to Recalculate</h2>
      <p>Review your coverage after major life changes:</p>
      <ul>
        <li>Marriage or divorce</li>
        <li>New baby</li>
        <li>Buying a home</li>
        <li>Job change or big raise</li>
        <li>Paying off major debt</li>
      </ul>

      <p>Need help with your specific situation? <a href="/resources/calculators">Try our coverage calculator</a> or <a href="/contact">talk to an expert</a>.</p>
    `
  },
  {
    id: 2,
    slug: "term-vs-whole-life-insurance",
    title: "Term vs. Whole Life: Which Is Right for You?",
    excerpt: "Compare the two main types of life insurance and find your best fit.",
    category: "term",
    author: "Heritage Team",
    readTime: "4 min read",
    date: "Jan 12, 2024",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Term or whole life? It's the first big decision when buying life insurance. Here's how to choose.</p>

      <h2>Term Life: Simple Protection</h2>
      <p>Coverage for a set period (10, 20, or 30 years). If you pass away during the term, your family gets the death benefit. If you outlive it, coverage ends.</p>

      <h3>Why Choose Term:</h3>
      <ul>
        <li>5-10x cheaper than whole life</li>
        <li>Simple—no confusing features</li>
        <li>Match coverage to specific needs (mortgage, kids' college)</li>
        <li>Most can convert to permanent later</li>
      </ul>

      <h3>The Downside:</h3>
      <ul>
        <li>No cash value—pure protection only</li>
        <li>Coverage ends when term expires</li>
        <li>Renewal rates are much higher</li>
      </ul>

      <h2>Whole Life: Lifetime Coverage + Savings</h2>
      <p>Covers you forever and builds cash value you can access during your lifetime.</p>

      <h3>Why Choose Whole Life:</h3>
      <ul>
        <li>Coverage never expires</li>
        <li>Cash value grows tax-deferred</li>
        <li>Premiums stay level for life</li>
        <li>Can earn dividends (mutual companies)</li>
        <li>Borrow against cash value tax-free</li>
      </ul>

      <h3>The Downside:</h3>
      <ul>
        <li>5-10x more expensive</li>
        <li>Takes years to build real cash value</li>
        <li>Complex—many moving parts</li>
        <li>Returns often lag other investments</li>
      </ul>

      <h2>Quick Decision Guide</h2>
      <p><strong>Choose term if you:</strong></p>
      <ul>
        <li>Want maximum coverage for minimum cost</li>
        <li>Have temporary needs (mortgage, young kids)</li>
        <li>Prefer to invest separately</li>
        <li>Are on a tight budget</li>
      </ul>

      <p><strong>Choose whole life if you:</strong></p>
      <ul>
        <li>Need permanent coverage (estate planning, special needs child)</li>
        <li>Want forced savings with tax benefits</li>
        <li>Have maxed out 401k and IRA</li>
        <li>Want a guaranteed inheritance for heirs</li>
      </ul>

      <h2>The Smart Combo</h2>
      <p>Many people buy both: a large term policy for temporary needs, plus a smaller whole life policy for permanent needs. Best of both worlds.</p>

      <p><a href="/quote">Get quotes for both</a> and see the actual difference for your situation.</p>
    `
  },
  {
    id: 3,
    slug: "no-exam-life-insurance-pros-cons",
    title: "No-Exam Life Insurance: Pros and Cons",
    excerpt: "Is simplified issue coverage right for your situation?",
    category: "term",
    author: "Heritage Team",
    readTime: "3 min read",
    date: "Dec 28, 2023",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>No needles, no exam, approval in days. No-exam life insurance sounds perfect—but is it right for you?</p>

      <h2>What Is No-Exam Life Insurance?</h2>
      <p>You answer health questions and the company checks databases (prescriptions, medical records, DMV) to approve you—no blood draw or physical required.</p>

      <h2>The Pros</h2>

      <h3>Speed</h3>
      <p>Traditional policies: 4-6 weeks. No-exam: days, sometimes hours.</p>

      <h3>Convenience</h3>
      <p>Apply from your couch at midnight. No scheduling, no fasting, no waiting for a nurse.</p>

      <h3>No Needles</h3>
      <p>If blood draws make you anxious, this removes a real barrier.</p>

      <h2>The Cons</h2>

      <h3>Higher Cost</h3>
      <p>Without exam data, insurers assume more risk. Expect 15-30% higher premiums.</p>

      <h3>Lower Limits</h3>
      <p>Most cap coverage at $500K-$1M. Need more? You'll need an exam.</p>

      <h3>May Miss Better Rates</h3>
      <p>Very healthy? An exam could qualify you for "preferred plus" rates that no-exam can't match.</p>

      <h2>Who Should Skip the Exam?</h2>
      <ul>
        <li>Need coverage immediately</li>
        <li>Average health (won't get preferred rates anyway)</li>
        <li>Too busy to schedule an exam</li>
        <li>Needle-phobic</li>
        <li>Want coverage while waiting for traditional policy</li>
      </ul>

      <h2>Who Should Take the Exam?</h2>
      <ul>
        <li>Excellent health (may qualify for best rates)</li>
        <li>Need more than $1M coverage</li>
        <li>Have time to wait</li>
        <li>Don't mind the process</li>
      </ul>

      <h2>Best of Both Worlds</h2>
      <p>"Accelerated underwriting" lets healthy people skip the exam but get fully underwritten rates. Ask about it when applying.</p>

      <p><a href="/quote">Compare no-exam and traditional quotes</a> to see the difference.</p>
    `
  },
  {
    id: 4,
    slug: "when-to-convert-term-to-permanent",
    title: "When to Convert Term Life to Permanent",
    excerpt: "Your term policy might have a valuable option you're not using.",
    category: "term",
    author: "Heritage Team",
    readTime: "4 min read",
    date: "Dec 15, 2023",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Most term policies have a conversion option that lets you switch to permanent coverage without a medical exam. It could be worth thousands.</p>

      <h2>What Is Conversion?</h2>
      <p>You exchange your term policy for whole or universal life at your original health rating—no new exam, no health questions, guaranteed approval.</p>

      <h2>Why This Matters</h2>
      <p>If your health has declined since you bought term, you'd pay much more (or be declined) for new coverage. Conversion locks in your old rating.</p>

      <h2>When to Consider Converting</h2>

      <h3>Your Health Has Changed</h3>
      <p>Diagnosed with diabetes, heart disease, or cancer? Conversion might be your only path to affordable permanent coverage.</p>

      <h3>Your Term Is Ending</h3>
      <p>If you still need coverage and can't qualify for new term at good rates, conversion beats renewal pricing (which can be 10-20x higher).</p>

      <h3>You Need Permanent Coverage</h3>
      <p>Estate planning, special needs planning, or leaving a guaranteed inheritance? Converting part of your term makes sense.</p>

      <h3>You Want Cash Value</h3>
      <p>Ready to build tax-advantaged savings? Converting lets you start without proving insurability again.</p>

      <h2>When NOT to Convert</h2>
      <ul>
        <li>You're still healthy—new coverage may be cheaper</li>
        <li>You don't need lifetime coverage</li>
        <li>You can't afford the higher permanent premiums</li>
        <li>Your term still has many years left</li>
      </ul>

      <h2>Important Deadlines</h2>
      <p>Most policies only allow conversion until:</p>
      <ul>
        <li>A certain age (often 65 or 70)</li>
        <li>A certain number of years into the term</li>
        <li>A set date before term ends</li>
      </ul>
      <p>Check your policy—this deadline is firm.</p>

      <h2>Partial Conversion</h2>
      <p>You don't have to convert the full amount. Many people convert just enough for permanent needs and keep the rest as term.</p>

      <p>Not sure if conversion makes sense? <a href="/contact">Talk to us</a>—we can review your policy and options.</p>
    `
  },

  // ==================== WHOLE LIFE ====================
  {
    id: 5,
    slug: "understanding-whole-life-dividends",
    title: "Understanding Whole Life Dividends",
    excerpt: "How participating policies share in company profits.",
    category: "whole",
    author: "Heritage Team",
    readTime: "5 min read",
    date: "Jan 3, 2024",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Whole life dividends can significantly boost your policy's value over time. Here's how they work.</p>

      <h2>What Are Dividends?</h2>
      <p>When a mutual insurance company does better than expected—through investments, lower claims, or reduced costs—they share profits with policyholders through dividends.</p>
      <p>Think of it as a refund of excess premium.</p>

      <h2>Important: Not Guaranteed</h2>
      <p>Top companies like Northwestern Mutual and MassMutual have paid dividends for 100+ years straight. But dividends are never guaranteed—they depend on company performance.</p>

      <h2>What Can You Do With Dividends?</h2>

      <h3>1. Buy Paid-Up Additions (Most Popular)</h3>
      <p>Use dividends to buy small chunks of additional coverage. This increases both your death benefit and cash value. Those additions then earn their own dividends—compounding over time.</p>

      <h3>2. Reduce Your Premium</h3>
      <p>Apply dividends to your premium bill, lowering your out-of-pocket cost.</p>

      <h3>3. Take Cash</h3>
      <p>Receive dividends as a check. Note: May be taxable if total dividends exceed premiums paid.</p>

      <h3>4. Leave on Deposit</h3>
      <p>Keep dividends with the company to earn interest. Like a savings account within your policy.</p>

      <h3>5. Pay Your Premium Entirely</h3>
      <p>Eventually, dividends can grow large enough to cover your whole premium—creating a "paid-up" policy.</p>

      <h2>The Power of Compounding</h2>
      <p>Example: $500,000 whole life policy with dividends used for paid-up additions:</p>
      <ul>
        <li><strong>Year 1:</strong> $500,000 death benefit, $8,500 cash value</li>
        <li><strong>Year 10:</strong> $575,000 death benefit, $95,000 cash value</li>
        <li><strong>Year 20:</strong> $720,000 death benefit, $285,000 cash value</li>
      </ul>
      <p>That extra $220,000 in death benefit came entirely from reinvested dividends.</p>

      <h2>Which Option Is Best?</h2>
      <ul>
        <li><strong>Building wealth:</strong> Paid-up additions</li>
        <li><strong>Reducing costs:</strong> Premium reduction</li>
        <li><strong>Need income:</strong> Cash payment</li>
        <li><strong>Want flexibility:</strong> Leave on deposit</li>
      </ul>

      <p>Want to see projected dividends for your situation? <a href="/quote">Request an illustration</a>.</p>
    `
  },
  {
    id: 6,
    slug: "whole-life-cash-value-explained",
    title: "Whole Life Cash Value: What It Is and How to Use It",
    excerpt: "Your policy builds savings you can access while you're alive.",
    category: "whole",
    author: "Heritage Team",
    readTime: "5 min read",
    date: "Dec 20, 2023",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Whole life insurance does more than pay a death benefit—it builds cash value you can use during your lifetime.</p>

      <h2>What Is Cash Value?</h2>
      <p>Part of your premium goes into a savings component that grows over time. This cash value belongs to you and can be accessed while you're alive.</p>

      <h2>How It Grows</h2>
      <ul>
        <li><strong>Guaranteed growth:</strong> Your policy has a minimum guaranteed rate (often 2-4%)</li>
        <li><strong>Dividend additions:</strong> In participating policies, dividends add to cash value</li>
        <li><strong>Tax-deferred:</strong> Growth isn't taxed annually like a brokerage account</li>
      </ul>

      <h2>How to Access Cash Value</h2>

      <h3>Policy Loans</h3>
      <p>Borrow against your cash value at low interest rates. No credit check, no approval process, no required repayment schedule. If you don't repay, the loan plus interest reduces your death benefit.</p>

      <h3>Withdrawals</h3>
      <p>Take money out directly. Withdrawals up to your total premiums paid are tax-free. Beyond that, gains are taxable.</p>

      <h3>Surrender</h3>
      <p>Cancel the policy and take all cash value (minus surrender charges in early years). You'll owe taxes on gains.</p>

      <h2>Smart Uses for Cash Value</h2>
      <ul>
        <li>Emergency fund (borrow, then repay)</li>
        <li>College tuition</li>
        <li>Down payment on a home</li>
        <li>Supplement retirement income</li>
        <li>Start a business</li>
        <li>Pay premiums if you lose your job</li>
      </ul>

      <h2>What to Know</h2>
      <ul>
        <li>Cash value builds slowly in early years</li>
        <li>Loans accrue interest (typically 5-8%)</li>
        <li>Unpaid loans reduce death benefit</li>
        <li>Surrendering ends your coverage</li>
      </ul>

      <h2>Cash Value vs. Death Benefit</h2>
      <p>These are separate. If you have $100,000 cash value and $500,000 death benefit, your beneficiaries get $500,000 (not $600,000). The cash value is essentially "inside" the death benefit.</p>

      <p>Questions about how cash value could work for you? <a href="/contact">Let's talk</a>.</p>
    `
  },
  {
    id: 7,
    slug: "whole-life-for-estate-planning",
    title: "Using Whole Life Insurance for Estate Planning",
    excerpt: "How permanent coverage helps transfer wealth to the next generation.",
    category: "whole",
    author: "Heritage Team",
    readTime: "6 min read",
    date: "Dec 10, 2023",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Life insurance isn't just for replacing income. For many families, it's a cornerstone of estate planning.</p>

      <h2>Why Use Life Insurance in Estate Planning?</h2>

      <h3>Tax-Free Transfer</h3>
      <p>Death benefits pass to beneficiaries income tax-free. One of the few ways to transfer significant wealth without income tax.</p>

      <h3>Immediate Liquidity</h3>
      <p>Estates often take months to settle. Life insurance pays in weeks, giving heirs cash when they need it.</p>

      <h3>Equalize Inheritances</h3>
      <p>Leaving a business to one child? Life insurance can provide equal value to other children.</p>

      <h3>Pay Estate Taxes</h3>
      <p>For large estates, life insurance provides cash to pay estate taxes without forcing sale of assets.</p>

      <h2>The ILIT Strategy</h2>
      <p>An Irrevocable Life Insurance Trust (ILIT) holds your policy outside your estate. Benefits:</p>
      <ul>
        <li>Death benefit excluded from estate tax calculations</li>
        <li>Heirs receive full benefit without reduction</li>
        <li>Can provide for multiple generations</li>
        <li>Protected from creditors</li>
      </ul>

      <h2>Common Estate Planning Uses</h2>

      <h3>Wealth Replacement</h3>
      <p>Donating assets to charity? Life insurance can replace that value for your heirs.</p>

      <h3>Business Succession</h3>
      <p>Fund buy-sell agreements so partners can buy out a deceased owner's share.</p>

      <h3>Special Needs Planning</h3>
      <p>Provide for a special needs family member without affecting government benefits eligibility.</p>

      <h3>Generation Skipping</h3>
      <p>Leave assets directly to grandchildren while minimizing transfer taxes.</p>

      <h2>Why Whole Life for Estate Planning?</h2>
      <ul>
        <li><strong>Permanent:</strong> You don't know when you'll die—whole life guarantees coverage</li>
        <li><strong>Predictable:</strong> Fixed premiums make planning easier</li>
        <li><strong>Cash value:</strong> Provides flexibility if plans change</li>
        <li><strong>Dividends:</strong> Can offset premium costs over time</li>
      </ul>

      <h2>Who Needs This?</h2>
      <ul>
        <li>Estates over $13M (federal estate tax threshold)</li>
        <li>Business owners</li>
        <li>Those with illiquid assets (real estate, art, business interests)</li>
        <li>Anyone wanting to leave a guaranteed inheritance</li>
        <li>Parents of special needs children</li>
      </ul>

      <p>Estate planning is complex. <a href="/contact">Work with us</a> and your attorney to get it right.</p>
    `
  },
  {
    id: 8,
    slug: "is-whole-life-insurance-worth-it",
    title: "Is Whole Life Insurance Worth It?",
    excerpt: "An honest look at when whole life makes sense—and when it doesn't.",
    category: "whole",
    author: "Heritage Team",
    readTime: "5 min read",
    date: "Nov 25, 2023",
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Whole life insurance is controversial. Some advisors love it, others say it's always a bad deal. The truth is more nuanced.</p>

      <h2>The Case Against Whole Life</h2>

      <h3>High Cost</h3>
      <p>For the same death benefit, whole life costs 5-10x more than term. A 35-year-old might pay $50/month for $500K term or $400/month for whole life.</p>

      <h3>Low Returns</h3>
      <p>Cash value often returns 2-4% long-term. The stock market averages 7-10%. "Buy term and invest the difference" often wins.</p>

      <h3>Complexity</h3>
      <p>Surrender charges, loan provisions, dividend options—whole life is complicated. Many people buy policies they don't fully understand.</p>

      <h3>Illiquidity</h3>
      <p>Cash value builds slowly. Need money in the first 5-10 years? You might get back less than you paid.</p>

      <h2>The Case for Whole Life</h2>

      <h3>Permanent Coverage</h3>
      <p>If you need coverage at age 80 or 90, whole life guarantees it. Term doesn't.</p>

      <h3>Tax Advantages</h3>
      <p>Cash value grows tax-deferred. Loans are tax-free. Death benefits are income tax-free. Hard to beat.</p>

      <h3>Forced Savings</h3>
      <p>Not everyone invests the difference. Whole life forces you to build wealth whether you feel like it or not.</p>

      <h3>Guarantees</h3>
      <p>Guaranteed death benefit, guaranteed cash value growth, guaranteed premiums. No market risk.</p>

      <h3>Estate Planning</h3>
      <p>For wealthy families, life insurance in an ILIT can save millions in estate taxes.</p>

      <h2>Whole Life Makes Sense If You:</h2>
      <ul>
        <li>Have maxed out 401k, IRA, and other tax-advantaged accounts</li>
        <li>Need permanent coverage (estate planning, special needs planning)</li>
        <li>Want guarantees over potential market gains</li>
        <li>Value forced savings discipline</li>
        <li>Have a long time horizon (20+ years)</li>
        <li>Are in a high tax bracket</li>
      </ul>

      <h2>Whole Life Doesn't Make Sense If You:</h2>
      <ul>
        <li>Haven't maxed retirement accounts</li>
        <li>Need coverage for temporary obligations</li>
        <li>Can't commit to premiums long-term</li>
        <li>Need maximum death benefit per dollar</li>
        <li>Are comfortable investing on your own</li>
      </ul>

      <h2>The Bottom Line</h2>
      <p>Whole life isn't inherently good or bad—it's a tool. The question is whether it's the right tool for your situation.</p>

      <p>Not sure? <a href="/contact">Let's talk through your specific goals</a>.</p>
    `
  },

  // ==================== RETIREMENT ====================
  {
    id: 9,
    slug: "life-insurance-retirement-income",
    title: "Using Life Insurance for Retirement Income",
    excerpt: "How cash value policies can supplement your retirement.",
    category: "retirement",
    author: "Heritage Team",
    readTime: "6 min read",
    date: "Jan 8, 2024",
    image: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Life insurance for retirement income? It sounds unusual, but certain permanent policies can provide tax-advantaged income when you stop working.</p>

      <h2>How It Works</h2>
      <p>Cash value life insurance (whole life, IUL) builds savings over time. You can access this cash value in retirement through loans—generally tax-free.</p>

      <h2>The Tax Advantage</h2>
      <p>401(k) and IRA withdrawals are taxed as income. Social Security is partially taxed. Life insurance policy loans? Not taxed at all (if done correctly).</p>
      <p>This can keep you in a lower tax bracket and reduce taxes on Social Security.</p>

      <h2>IUL for Retirement: The Basics</h2>
      <p>Indexed Universal Life (IUL) links cash value growth to market indexes like the S&P 500:</p>
      <ul>
        <li>When markets rise, you earn a portion of gains (subject to caps)</li>
        <li>When markets fall, you're protected by a floor (typically 0-1%)</li>
        <li>No direct market exposure—your cash value can't go backward</li>
      </ul>

      <h2>Example Scenario</h2>
      <p>John, age 35, funds an IUL with $1,000/month for 25 years:</p>
      <ul>
        <li>Total premiums: $300,000</li>
        <li>Projected cash value at 60: ~$550,000</li>
        <li>Tax-free retirement income: ~$40,000/year for 20+ years</li>
        <li>Still has death benefit protection along the way</li>
      </ul>

      <h2>Who Should Consider This?</h2>
      <ul>
        <li>Already maxing 401(k) and IRA</li>
        <li>High tax bracket now and in retirement</li>
        <li>Want tax diversification (tax-free bucket)</li>
        <li>Have 15+ years until retirement</li>
        <li>Need life insurance protection anyway</li>
      </ul>

      <h2>Who Should Skip This?</h2>
      <ul>
        <li>Haven't maxed tax-advantaged retirement accounts</li>
        <li>Need liquidity in the short term</li>
        <li>Can't commit to funding for 10+ years</li>
        <li>Don't need life insurance</li>
      </ul>

      <h2>Important Caveats</h2>
      <ul>
        <li><strong>Costs matter:</strong> IUL has higher fees than index funds</li>
        <li><strong>Consistency required:</strong> Works best with steady funding over many years</li>
        <li><strong>Design is critical:</strong> Must be structured properly to maximize cash value</li>
        <li><strong>Supplement, don't replace:</strong> This adds to traditional retirement savings</li>
      </ul>

      <p>Curious if this strategy fits your plan? <a href="/contact">Schedule a consultation</a>.</p>
    `
  },
  {
    id: 10,
    slug: "life-insurance-vs-401k",
    title: "Life Insurance vs. 401(k): Where Should Your Money Go?",
    excerpt: "Understanding when to prioritize each savings vehicle.",
    category: "retirement",
    author: "Heritage Team",
    readTime: "5 min read",
    date: "Dec 18, 2023",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Should you invest in a 401(k) or buy cash value life insurance? The answer depends on where you are financially.</p>

      <h2>The 401(k) First Rule</h2>
      <p>For most people, the 401(k) should come first. Here's why:</p>
      <ul>
        <li><strong>Employer match:</strong> Free money—often 50-100% return instantly</li>
        <li><strong>Tax deduction:</strong> Contributions reduce your taxable income today</li>
        <li><strong>Higher limits:</strong> $23,000/year vs. no real limit on life insurance premiums</li>
        <li><strong>Lower fees:</strong> Index funds cost 0.03-0.20%/year vs. 1-3% for life insurance</li>
      </ul>

      <h2>When Life Insurance Makes Sense</h2>
      <p>Cash value life insurance becomes attractive after you've:</p>
      <ol>
        <li>Captured full 401(k) employer match</li>
        <li>Maxed out IRA contributions ($7,000/year)</li>
        <li>Maxed out 401(k) contributions ($23,000/year)</li>
        <li>Built adequate emergency savings</li>
      </ol>

      <h2>Life Insurance Advantages</h2>
      <ul>
        <li><strong>Tax-free access:</strong> Policy loans aren't taxed (401k withdrawals are)</li>
        <li><strong>No penalties:</strong> Access before 59½ without 10% penalty</li>
        <li><strong>No RMDs:</strong> No required minimum distributions at 73</li>
        <li><strong>Death benefit:</strong> Gets death protection AND savings</li>
        <li><strong>Creditor protection:</strong> Protected from lawsuits in many states</li>
      </ul>

      <h2>The Ideal Order</h2>
      <ol>
        <li>401(k) up to employer match</li>
        <li>Pay off high-interest debt</li>
        <li>Build 3-6 month emergency fund</li>
        <li>Max out Roth IRA</li>
        <li>Max out 401(k)</li>
        <li>Consider cash value life insurance</li>
        <li>Taxable brokerage account</li>
      </ol>

      <h2>Tax Diversification</h2>
      <p>Having money in different "tax buckets" gives retirement flexibility:</p>
      <ul>
        <li><strong>Tax-deferred (401k, traditional IRA):</strong> Taxed on withdrawal</li>
        <li><strong>Tax-free (Roth, life insurance loans):</strong> No tax on withdrawal</li>
        <li><strong>Taxable (brokerage):</strong> Capital gains rates</li>
      </ul>
      <p>Mix and match withdrawals to minimize lifetime taxes.</p>

      <h2>Bottom Line</h2>
      <p>401(k) usually wins for accumulation. Life insurance adds value for high earners who've maxed traditional accounts and want tax-free retirement income plus death protection.</p>

      <p>Not sure where you stand? <a href="/contact">Let's review your situation</a>.</p>
    `
  },
  {
    id: 11,
    slug: "maximize-social-security-life-insurance",
    title: "How Life Insurance Can Maximize Your Social Security",
    excerpt: "Strategic withdrawals can reduce taxes on your Social Security benefits.",
    category: "retirement",
    author: "Heritage Team",
    readTime: "4 min read",
    date: "Nov 30, 2023",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Up to 85% of your Social Security can be taxed. Life insurance policy loans can help reduce that.</p>

      <h2>The Social Security Tax Problem</h2>
      <p>Your Social Security benefits become taxable based on "combined income":</p>
      <ul>
        <li>Adjusted Gross Income (AGI)</li>
        <li>Plus non-taxable interest</li>
        <li>Plus 50% of Social Security benefits</li>
      </ul>

      <p>If combined income exceeds $34,000 (single) or $44,000 (married), up to 85% of Social Security is taxed.</p>

      <h2>How 401(k) Withdrawals Hurt</h2>
      <p>Every dollar you withdraw from a 401(k) or traditional IRA increases your AGI. This can push Social Security into taxable territory.</p>
      <p>Withdraw $30,000 from your 401(k)? That counts toward combined income.</p>

      <h2>Life Insurance Loans Don't Count</h2>
      <p>Policy loans from cash value life insurance aren't income. They don't increase AGI. They don't affect Social Security taxation.</p>
      <p>Take $30,000 as a policy loan? Zero impact on combined income.</p>

      <h2>The Strategy</h2>
      <ol>
        <li>Build cash value in permanent life insurance during working years</li>
        <li>In retirement, take policy loans for income needs</li>
        <li>Keep AGI low to minimize Social Security taxation</li>
        <li>Use 401(k) strategically when additional income is needed</li>
      </ol>

      <h2>Example</h2>
      <p>Mary, 67, receives $24,000/year in Social Security. She needs $40,000 additional income.</p>

      <p><strong>Option A: All from 401(k)</strong></p>
      <ul>
        <li>Combined income: $40,000 + $12,000 (50% SS) = $52,000</li>
        <li>Result: 85% of Social Security taxed</li>
      </ul>

      <p><strong>Option B: $30,000 from life insurance loan, $10,000 from 401(k)</strong></p>
      <ul>
        <li>Combined income: $10,000 + $12,000 = $22,000</li>
        <li>Result: 0% of Social Security taxed</li>
      </ul>

      <p>Option B saves thousands in taxes annually.</p>

      <h2>Planning Ahead</h2>
      <p>This strategy requires building cash value over 15-20+ years before retirement. Starting earlier means more options later.</p>

      <p>Want to see how this could work for you? <a href="/contact">Let's run the numbers</a>.</p>
    `
  },

  // ==================== FAMILY PLANNING ====================
  {
    id: 12,
    slug: "life-insurance-new-parents-checklist",
    title: "Life Insurance for New Parents: A Checklist",
    excerpt: "Essential coverage considerations when starting a family.",
    category: "family",
    author: "Heritage Team",
    readTime: "4 min read",
    date: "Jan 5, 2024",
    image: "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>New baby means new responsibilities—including making sure they're protected financially. Here's your life insurance checklist.</p>

      <h2>Why New Parents Need Coverage</h2>
      <p>Your child depends on you for everything. Life insurance ensures they'll have financial security even if you're not there.</p>

      <h2>The New Parent Checklist</h2>

      <h3>1. Calculate Your Need</h3>
      <p>Your needs just increased significantly:</p>
      <ul>
        <li>Income replacement: 10-15 years of salary</li>
        <li>Childcare: $10,000-$20,000/year until school</li>
        <li>College: $100,000-$250,000 per child</li>
        <li>Mortgage/rent: Full balance or years of payments</li>
        <li>Existing debts: Student loans, car payments</li>
      </ul>

      <h3>2. Cover Both Parents</h3>
      <p>Even a stay-at-home parent provides $150,000+/year in childcare, household management, and caregiving. Both parents need coverage.</p>

      <h3>3. Choose the Right Term</h3>
      <ul>
        <li>New baby: 20-30 year term</li>
        <li>5-year-old: 20-25 year term</li>
        <li>Teenager: 10-15 year term</li>
      </ul>
      <p>Coverage should last until your youngest is financially independent.</p>

      <h3>4. Name Beneficiaries Correctly</h3>
      <p>Don't name minor children directly—they can't legally receive funds.</p>
      <ul>
        <li>Name your spouse as primary beneficiary</li>
        <li>Set up a trust for children as contingent</li>
        <li>Or name a trusted adult to manage funds</li>
      </ul>

      <h3>5. Consider These Riders</h3>
      <ul>
        <li><strong>Waiver of premium:</strong> Keeps policy active if you become disabled</li>
        <li><strong>Child rider:</strong> Small coverage amount for your child</li>
        <li><strong>Accelerated death benefit:</strong> Access funds if terminally ill</li>
      </ul>

      <h3>6. Name a Guardian</h3>
      <p>Life insurance provides money, but children need a caregiver. Work with an attorney to name a guardian in your will.</p>

      <h3>7. Review Existing Coverage</h3>
      <p>Already have coverage? A new baby is the perfect time to review:</p>
      <ul>
        <li>Is the amount still adequate?</li>
        <li>Are beneficiaries up to date?</li>
        <li>Do you need to add coverage?</li>
      </ul>

      <h2>Quick Action Steps</h2>
      <ol>
        <li><a href="/resources/calculators">Calculate coverage needs</a></li>
        <li><a href="/quote">Get quotes for both parents</a></li>
        <li>Apply while you're healthy</li>
        <li>Update beneficiaries</li>
        <li>Create or update your will</li>
      </ol>

      <p>Questions about coverage for your growing family? <a href="/contact">We're here to help</a>.</p>
    `
  },
  {
    id: 13,
    slug: "life-insurance-stay-at-home-parents",
    title: "Why Stay-at-Home Parents Need Life Insurance",
    excerpt: "The economic value of a stay-at-home parent is often underestimated.",
    category: "family",
    author: "Heritage Team",
    readTime: "4 min read",
    date: "Dec 20, 2023",
    image: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>No paycheck doesn't mean no economic value. Stay-at-home parents provide services worth $150,000+ per year.</p>

      <h2>The Economic Value</h2>
      <p>Stay-at-home parents perform dozens of roles:</p>
      <ul>
        <li>Childcare: $35,000-$50,000/year</li>
        <li>Housekeeping: $15,000-$25,000/year</li>
        <li>Cooking/meal planning: $10,000-$15,000/year</li>
        <li>Tutoring: $5,000-$10,000/year</li>
        <li>Transportation: $5,000-$10,000/year</li>
        <li>Event planning, nursing, therapy...</li>
      </ul>
      <p>Total: $150,000-$180,000 in replacement costs.</p>

      <h2>What Happens Without Coverage?</h2>
      <p>If a stay-at-home parent passes away, the surviving spouse faces:</p>
      <ul>
        <li>Full-time childcare: $15,000-$30,000 per child annually</li>
        <li>Household help or reduced work hours</li>
        <li>Before/after school programs</li>
        <li>Summer camps</li>
        <li>Emotional toll affecting work performance</li>
      </ul>

      <h2>How Much Coverage?</h2>
      <p>Consider:</p>
      <ul>
        <li>10 years of childcare costs</li>
        <li>Household services until kids are independent</li>
        <li>Typical recommendation: $250,000-$500,000</li>
      </ul>

      <h2>The Good News: It's Affordable</h2>
      <p>A healthy 35-year-old can get $500,000 in 20-year term coverage for about $25-30/month. Small price for enormous peace of mind.</p>

      <h2>Coverage Options</h2>
      <ul>
        <li><strong>Term life:</strong> Most cost-effective for temporary needs</li>
        <li><strong>Joint policy:</strong> Covers both spouses on one policy (often discounted)</li>
        <li><strong>Rider:</strong> Add coverage to spouse's policy (limited amounts)</li>
      </ul>

      <p>Don't leave your family's caregiver unprotected. <a href="/quote">Get a quote today</a>.</p>
    `
  },
  {
    id: 14,
    slug: "life-insurance-for-single-parents",
    title: "Life Insurance for Single Parents: What You Need to Know",
    excerpt: "When you're the only provider, coverage is even more critical.",
    category: "family",
    author: "Heritage Team",
    readTime: "4 min read",
    date: "Dec 5, 2023",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>As a single parent, you're the sole financial provider. That makes life insurance not just important—it's essential.</p>

      <h2>Why Single Parents Need More Coverage</h2>
      <p>With two-parent households, one income can (partially) replace the other. As a single parent, there's no backup. Your children depend entirely on you.</p>

      <h2>How Much Do You Need?</h2>
      <p>Single parents typically need more coverage than married couples:</p>
      <ul>
        <li>Income replacement: 15-20 years (until youngest is independent)</li>
        <li>Childcare costs: Full-time care if guardian works</li>
        <li>Housing: Mortgage payoff or years of rent</li>
        <li>Education: College for each child</li>
        <li>Guardian transition: Extra funds to help guardian adjust</li>
      </ul>

      <h2>Choosing a Guardian</h2>
      <p>This is critical for single parents. Consider:</p>
      <ul>
        <li>Who would you trust to raise your children?</li>
        <li>Can they afford the additional expense?</li>
        <li>Are they willing and able?</li>
        <li>Where do they live? (Will kids need to relocate?)</li>
      </ul>
      <p>Have this conversation and document it legally in your will.</p>

      <h2>Funding the Guardian</h2>
      <p>Even the most loving guardian may struggle financially. Your life insurance should provide:</p>
      <ul>
        <li>Ongoing support for children's expenses</li>
        <li>Larger home if needed</li>
        <li>Emergency reserves</li>
        <li>Compensation for guardian's time if they reduce work hours</li>
      </ul>

      <h2>Trust vs. Direct Beneficiary</h2>
      <p>Don't name minor children as beneficiaries. Instead:</p>
      <ul>
        <li><strong>Trust:</strong> Best option—controls how and when money is distributed</li>
        <li><strong>UTMA account:</strong> Simpler, but child gets full access at 18-21</li>
        <li><strong>Guardian as beneficiary:</strong> Requires complete trust</li>
      </ul>

      <h2>Don't Forget Disability</h2>
      <p>As a single parent, disability could be even more devastating than death. Consider disability insurance too—it replaces income if you can't work.</p>

      <h2>Affordable Options</h2>
      <p>Yes, single-income households have tight budgets. But term life is affordable:</p>
      <ul>
        <li>$500,000 20-year term: ~$25-35/month for healthy 30-something</li>
        <li>$1,000,000 20-year term: ~$40-60/month</li>
      </ul>
      <p>That's less than most streaming subscriptions combined.</p>

      <p>Questions about protecting your family? <a href="/contact">Let's talk</a>.</p>
    `
  },
  {
    id: 15,
    slug: "life-insurance-blended-families",
    title: "Life Insurance for Blended Families",
    excerpt: "Navigating coverage when stepchildren and ex-spouses are involved.",
    category: "family",
    author: "Heritage Team",
    readTime: "5 min read",
    date: "Nov 15, 2023",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Blended families have unique life insurance needs. Here's how to make sure everyone is protected fairly.</p>

      <h2>The Complexity</h2>
      <p>Blended families often involve:</p>
      <ul>
        <li>Children from previous marriages</li>
        <li>Current spouse and stepchildren</li>
        <li>Ex-spouses with ongoing obligations</li>
        <li>Child support or alimony requirements</li>
        <li>Varying ages and financial needs</li>
      </ul>

      <h2>Common Challenges</h2>

      <h3>Conflicting Obligations</h3>
      <p>You may want to provide for your current spouse AND ensure biological children from a previous marriage are protected.</p>

      <h3>Divorce Decree Requirements</h3>
      <p>Many divorces require maintaining life insurance for child support/alimony. Your ex may need to be named as beneficiary for a specific amount.</p>

      <h3>Fairness Questions</h3>
      <p>Should stepchildren receive the same as biological children? There's no right answer—but you need to decide.</p>

      <h2>Strategies for Blended Families</h2>

      <h3>Multiple Policies</h3>
      <p>Separate policies for separate obligations:</p>
      <ul>
        <li>Policy 1: Fulfills divorce decree requirements (ex-spouse as beneficiary)</li>
        <li>Policy 2: Protects current spouse</li>
        <li>Policy 3: Goes to children directly (via trust)</li>
      </ul>

      <h3>Trust-Based Planning</h3>
      <p>A trust can specify exactly how proceeds are distributed:</p>
      <ul>
        <li>Current spouse gets income for life</li>
        <li>Remaining principal goes to biological children</li>
        <li>Stepchildren receive specific amounts</li>
      </ul>

      <h3>Review Beneficiaries Regularly</h3>
      <p>Blended family situations change. Review beneficiaries:</p>
      <ul>
        <li>After each marriage or divorce</li>
        <li>When children reach adulthood</li>
        <li>When obligations (child support) end</li>
        <li>Annually, at minimum</li>
      </ul>

      <h2>Don't Forget</h2>
      <ul>
        <li><strong>Old policies:</strong> Update beneficiaries on existing coverage</li>
        <li><strong>Work policies:</strong> 401(k) and group life often still list ex-spouses</li>
        <li><strong>Documentation:</strong> Keep copies of divorce decrees and their insurance requirements</li>
      </ul>

      <h2>Communication Matters</h2>
      <p>Have honest conversations with:</p>
      <ul>
        <li>Your current spouse about your obligations and plans</li>
        <li>Adult children about their expectations</li>
        <li>Your attorney about proper legal structures</li>
      </ul>

      <p>Blended family planning is complex. <a href="/contact">Let us help you sort through the options</a>.</p>
    `
  },

  // ==================== SAVINGS TIPS ====================
  {
    id: 16,
    slug: "5-mistakes-buying-life-insurance",
    title: "5 Mistakes to Avoid When Buying Life Insurance",
    excerpt: "Common pitfalls that cost people money and coverage.",
    category: "savings",
    author: "Heritage Team",
    readTime: "3 min read",
    date: "Jan 10, 2024",
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Life insurance protects your family—unless you make these common mistakes.</p>

      <h2>Mistake #1: Only Buying Through Work</h2>
      <p>Employer coverage is convenient but usually insufficient (1-2x salary) and disappears if you leave.</p>
      <p><strong>Fix:</strong> Get your own policy that stays with you regardless of employment.</p>

      <h2>Mistake #2: Waiting Too Long</h2>
      <p>Premiums increase 8-10% per year of age. A policy at 30 costs half what it costs at 40.</p>
      <p><strong>Fix:</strong> Lock in rates while young and healthy. Even if you don't think you need it yet.</p>

      <h2>Mistake #3: Underestimating Needs</h2>
      <p>$250,000 sounds like a lot until you realize it only replaces 5 years of a $50,000 income—before debts and education costs.</p>
      <p><strong>Fix:</strong> Use the DIME method or <a href="/resources/calculators">our calculator</a> for your real number.</p>

      <h2>Mistake #4: Not Disclosing Health Issues</h2>
      <p>Lying on your application is fraud. Companies investigate claims and can deny benefits entirely.</p>
      <p><strong>Fix:</strong> Be completely honest. Many conditions are insurable. Work with an agent who knows which carriers are most favorable for your situation.</p>

      <h2>Mistake #5: Wrong Beneficiaries</h2>
      <p>Naming your estate creates probate delays. Naming minor children creates legal complications.</p>
      <p><strong>Fix:</strong> Name specific adults. For children, use a trust or name an adult custodian. Review after major life events.</p>

      <h2>Bonus: Not Shopping Around</h2>
      <p>Rates vary 30-50% between companies for identical coverage.</p>
      <p><strong>Fix:</strong> Compare quotes from multiple carriers, or work with an independent agent who does it for you.</p>

      <p>Ready to get it right? <a href="/quote">Get quotes from top carriers</a>.</p>
    `
  },
  {
    id: 17,
    slug: "life-insurance-tax-benefits",
    title: "The Tax Benefits of Life Insurance",
    excerpt: "Understanding how life insurance can reduce your tax burden.",
    category: "savings",
    author: "Heritage Team",
    readTime: "5 min read",
    date: "Dec 15, 2023",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Life insurance offers significant tax advantages—during your life and after.</p>

      <h2>Tax-Free Death Benefit</h2>
      <p>Life insurance death benefits are generally income tax-free for beneficiaries. A $1 million policy pays $1 million—not $1 million minus taxes.</p>
      <p>This is one of the few ways to transfer significant wealth without income tax.</p>

      <h2>Tax-Deferred Cash Value Growth</h2>
      <p>In permanent policies, cash value grows without annual taxation. Unlike a brokerage account where you pay taxes on dividends and gains each year, life insurance compounds tax-deferred.</p>

      <h2>Tax-Free Policy Loans</h2>
      <p>Borrow against cash value without triggering taxes. As long as the policy stays active, these loans aren't taxable income. Great for retirement income or emergencies.</p>

      <h2>Estate Tax Benefits</h2>
      <p>With an Irrevocable Life Insurance Trust (ILIT), proceeds can be excluded from your taxable estate. For high-net-worth families, this can save hundreds of thousands in estate taxes.</p>

      <h2>1035 Exchanges</h2>
      <p>Exchange one policy for another without triggering taxes on gains—like a 1031 exchange for real estate. Upgrade policies as needs change.</p>

      <h2>Limitations to Know</h2>
      <ul>
        <li>Premiums are NOT tax-deductible for personal policies</li>
        <li>Cash value withdrawals (not loans) may be taxable if they exceed your basis</li>
        <li>Surrendering a policy triggers taxes on gains</li>
        <li>MEC rules limit benefits for overfunded policies</li>
      </ul>

      <p>Tax laws are complex. <a href="/contact">Talk to us</a> and your tax advisor to maximize benefits.</p>
    `
  },
  {
    id: 18,
    slug: "how-to-lower-life-insurance-premiums",
    title: "10 Ways to Lower Your Life Insurance Premiums",
    excerpt: "Smart strategies to get the coverage you need at a better price.",
    category: "savings",
    author: "Heritage Team",
    readTime: "4 min read",
    date: "Dec 1, 2023",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Life insurance doesn't have to break the bank. Here are proven ways to lower your premiums.</p>

      <h2>1. Buy Young</h2>
      <p>Rates increase 8-10% per year of age. Buy at 30 and you'll pay roughly half what you'd pay at 40.</p>

      <h2>2. Get Healthy First</h2>
      <p>Lose weight, lower cholesterol, control blood pressure before applying. Even small improvements can mean better rate classes.</p>

      <h2>3. Quit Tobacco</h2>
      <p>Smokers pay 2-3x more. Most companies consider you a non-smoker after 12 months tobacco-free. Quit, wait, then apply.</p>

      <h2>4. Choose Term Over Whole</h2>
      <p>Term costs 5-10x less than whole life. Unless you need permanent coverage, term gives you more protection per dollar.</p>

      <h2>5. Right-Size Your Coverage</h2>
      <p>More coverage = higher premiums. Calculate what you actually need—don't buy more than necessary.</p>

      <h2>6. Shorten Your Term</h2>
      <p>20-year term costs less than 30-year. If your kids will be grown in 15 years, you may not need 30.</p>

      <h2>7. Pay Annually</h2>
      <p>Monthly payments include service fees. Annual payments often save 2-5%.</p>

      <h2>8. Bundle Policies</h2>
      <p>Some companies discount if you and your spouse both buy, or if you add life to existing auto/home insurance.</p>

      <h2>9. Shop Multiple Carriers</h2>
      <p>Rates vary widely. The cheapest company for a healthy person might be expensive for someone with diabetes. Compare.</p>

      <h2>10. Work With an Independent Agent</h2>
      <p>Independent agents represent multiple carriers and can find the best rate for your specific health profile. No extra cost to you.</p>

      <h2>What Doesn't Help</h2>
      <ul>
        <li>Lying on applications (fraud can void your policy)</li>
        <li>Buying minimum coverage (leaves family underprotected)</li>
        <li>Skipping coverage entirely (the biggest mistake)</li>
      </ul>

      <p>Ready to find your best rate? <a href="/quote">Compare quotes now</a>.</p>
    `
  },
  {
    id: 19,
    slug: "life-insurance-riders-worth-it",
    title: "Which Life Insurance Riders Are Actually Worth It?",
    excerpt: "Add-ons can enhance your policy—or waste your money. Here's how to choose.",
    category: "savings",
    author: "Heritage Team",
    readTime: "5 min read",
    date: "Nov 20, 2023",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Riders add features to your life insurance—for an extra cost. Some are valuable, others are a waste. Here's how to decide.</p>

      <h2>Riders Worth Considering</h2>

      <h3>Waiver of Premium</h3>
      <p><strong>What it does:</strong> Keeps your policy active if you become disabled and can't work.</p>
      <p><strong>Cost:</strong> 5-10% of base premium</p>
      <p><strong>Worth it?</strong> Usually yes—especially if you don't have disability insurance.</p>

      <h3>Accelerated Death Benefit</h3>
      <p><strong>What it does:</strong> Access part of death benefit if diagnosed with terminal illness.</p>
      <p><strong>Cost:</strong> Often free or very low cost</p>
      <p><strong>Worth it?</strong> Yes—no reason not to have it.</p>

      <h3>Guaranteed Insurability</h3>
      <p><strong>What it does:</strong> Buy more coverage later without proving insurability.</p>
      <p><strong>Cost:</strong> 2-5% of base premium</p>
      <p><strong>Worth it?</strong> Yes for young people expecting life changes (marriage, kids).</p>

      <h3>Term Conversion</h3>
      <p><strong>What it does:</strong> Convert term to permanent without medical exam.</p>
      <p><strong>Cost:</strong> Usually included or minimal</p>
      <p><strong>Worth it?</strong> Yes—keeps options open if health changes.</p>

      <h2>Riders to Think Twice About</h2>

      <h3>Return of Premium</h3>
      <p><strong>What it does:</strong> Refunds premiums if you outlive term.</p>
      <p><strong>Cost:</strong> 30-40% more in premiums</p>
      <p><strong>Worth it?</strong> Rarely. You'd likely earn more investing the difference.</p>

      <h3>Accidental Death</h3>
      <p><strong>What it does:</strong> Pays extra if death is accidental.</p>
      <p><strong>Cost:</strong> $50-100/year</p>
      <p><strong>Worth it?</strong> Usually no. Your family needs the same amount regardless of how you die.</p>

      <h3>Child Term Rider</h3>
      <p><strong>What it does:</strong> Small death benefit for your children.</p>
      <p><strong>Cost:</strong> $50-100/year</p>
      <p><strong>Worth it?</strong> Debatable. Covers funeral costs, but children don't have income to replace.</p>

      <h2>How to Decide</h2>
      <ol>
        <li>Get base policy quote first</li>
        <li>Ask about each rider's cost separately</li>
        <li>Consider: What problem does this solve?</li>
        <li>Could I solve it cheaper another way?</li>
        <li>How likely am I to use it?</li>
      </ol>

      <p>Questions about which riders make sense for you? <a href="/contact">Ask us</a>.</p>
    `
  },
  {
    id: 20,
    slug: "life-insurance-annual-review",
    title: "Your Annual Life Insurance Review Checklist",
    excerpt: "A yearly check-up keeps your coverage aligned with your life.",
    category: "savings",
    author: "Heritage Team",
    readTime: "3 min read",
    date: "Nov 5, 2023",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop",
    featured: false,
    content: `
      <p>Set it and forget it doesn't work for life insurance. An annual review takes 15 minutes and ensures your coverage still fits.</p>

      <h2>The Annual Checklist</h2>

      <h3>1. Check Beneficiaries</h3>
      <ul>
        <li>Are primary beneficiaries still correct?</li>
        <li>Are contingent beneficiaries named?</li>
        <li>Do percentages still make sense?</li>
        <li>Any life changes (marriage, divorce, birth, death)?</li>
      </ul>

      <h3>2. Review Coverage Amount</h3>
      <ul>
        <li>Has your income changed significantly?</li>
        <li>Did you take on new debt (mortgage, loan)?</li>
        <li>Did you pay off major debt?</li>
        <li>Any new dependents?</li>
        <li>Kids closer to independence?</li>
      </ul>

      <h3>3. Check Policy Status</h3>
      <ul>
        <li>Premiums being paid on time?</li>
        <li>Any policy loans outstanding?</li>
        <li>When does term expire?</li>
        <li>Any conversion deadlines approaching?</li>
      </ul>

      <h3>4. Review Health Changes</h3>
      <ul>
        <li>Lost significant weight?</li>
        <li>Quit smoking 12+ months ago?</li>
        <li>Improved cholesterol or blood pressure?</li>
      </ul>
      <p>Health improvements may qualify you for better rates on new coverage.</p>

      <h3>5. Compare Current Rates</h3>
      <ul>
        <li>Rates have dropped over the years</li>
        <li>You might qualify for better coverage at same price</li>
        <li>Don't cancel old policy until new one is approved</li>
      </ul>

      <h2>When to Review More Often</h2>
      <p>Don't wait for annual review after:</p>
      <ul>
        <li>Marriage or divorce</li>
        <li>Birth or adoption</li>
        <li>Home purchase</li>
        <li>Major salary change</li>
        <li>Death of a beneficiary</li>
        <li>Starting a business</li>
      </ul>

      <h2>Document Your Review</h2>
      <p>Keep notes of what you checked and any changes made. Store with your policy documents.</p>

      <p>Due for a review? <a href="/contact">We can help</a>—it's free.</p>
    `
  }
];

// Popular search terms to show when search is focused but empty
const popularSearchTerms = [
  "term life",
  "whole life",
  "how much coverage",
  "retirement income",
  "new parents",
  "save money"
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [
    { id: "all", name: "All Articles", icon: BookOpen },
    { id: "term", name: "Term Life", icon: Clock },
    { id: "whole", name: "Whole Life", icon: Shield },
    { id: "retirement", name: "Retirement", icon: TrendingUp },
    { id: "family", name: "Family Planning", icon: Heart },
    { id: "savings", name: "Savings Tips", icon: DollarSign }
  ];

  // Get featured post (always the first one)
  const featuredPost = blogPosts.find(post => post.featured);

  // Get all posts except featured for the grid
  const regularPosts = blogPosts.filter(post => !post.featured);

  // Filter posts based on category and search
  const filteredPosts = regularPosts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Check if featured post matches current filters
  const showFeatured = featuredPost && (selectedCategory === "all" || featuredPost.category === selectedCategory) &&
    (searchQuery === "" ||
     featuredPost.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     featuredPost.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  // Get search suggestions based on current query
  const getSearchSuggestions = () => {
    if (!searchQuery.trim()) {
      // Return popular terms when search is empty
      return popularSearchTerms.map(term => ({
        type: "term" as const,
        text: term,
        slug: ""
      }));
    }

    // Find matching articles
    const query = searchQuery.toLowerCase();
    const matchingArticles = blogPosts
      .filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(post => ({
        type: "article" as const,
        text: post.title,
        slug: post.slug,
        category: post.category
      }));

    // Also add matching search terms
    const matchingTerms = popularSearchTerms
      .filter(term => term.toLowerCase().includes(query) && term.toLowerCase() !== query)
      .slice(0, 2)
      .map(term => ({
        type: "term" as const,
        text: term,
        slug: ""
      }));

    return [...matchingArticles, ...matchingTerms];
  };

  const searchSuggestions = getSearchSuggestions();

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchFocused || searchSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < searchSuggestions.length) {
          const suggestion = searchSuggestions[highlightedIndex];
          if (suggestion.type === "article") {
            navigate(`/resources/blog/${suggestion.slug}`);
          } else {
            setSearchQuery(suggestion.text);
          }
          setIsSearchFocused(false);
          setHighlightedIndex(-1);
        }
        break;
      case "Escape":
        setIsSearchFocused(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: { type: "article" | "term"; text: string; slug: string }) => {
    if (suggestion.type === "article") {
      navigate(`/resources/blog/${suggestion.slug}`);
    } else {
      setSearchQuery(suggestion.text);
      inputRef.current?.focus();
    }
    setIsSearchFocused(false);
    setHighlightedIndex(-1);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success("Thanks for subscribing! Check your inbox for a confirmation email.");
    setEmail("");
    setIsSubscribing(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] pt-24 pb-24 overflow-visible">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-heritage-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-heritage-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-heritage-primary/10 text-heritage-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Knowledge Center
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6">
              Insurance Insights & Guides
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Expert advice to help you make informed decisions about life insurance.
            </p>

            {/* Search Bar with Suggestions */}
            <div ref={searchRef} className="relative max-w-xl mx-auto z-[100]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-heritage-primary focus:ring-2 focus:ring-heritage-primary/20 outline-none transition-all"
              />

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[200]"
                  >
                    {/* Header label */}
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        {searchQuery.trim() ? (
                          <>
                            <Search className="w-3 h-3" />
                            Suggestions
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Popular Searches
                          </>
                        )}
                      </span>
                    </div>

                    {/* Suggestions list */}
                    <div className="max-h-80 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.type}-${suggestion.text}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                            highlightedIndex === index
                              ? "bg-heritage-primary/5"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {suggestion.type === "article" ? (
                            <>
                              <div className="p-2 bg-heritage-primary/10 rounded-lg flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-heritage-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {suggestion.text}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {getCategoryName((suggestion as any).category)}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </>
                          ) : (
                            <>
                              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                <History className="w-4 h-4 text-gray-500" />
                              </div>
                              <span className="text-sm text-gray-700 flex-1">
                                {suggestion.text}
                              </span>
                              <span className="text-xs text-gray-400">Search term</span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Keyboard hint */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">↑</kbd>
                        <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">↓</kbd>
                        to navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">↵</kbd>
                        to select
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">esc</kbd>
                        to close
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-heritage-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {showFeatured && featuredPost && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <Link href={`/resources/blog/${featuredPost.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.005 }}
                className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
              >
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-heritage-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                    <span className="text-white/80 text-sm">{getCategoryName(featuredPost.category)}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 group-hover:text-heritage-accent transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-white/80 text-lg mb-4 max-w-2xl">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-6">
                    <span className="text-white/60 text-sm flex items-center gap-2">
                      <User className="w-4 h-4" /> {featuredPost.author}
                    </span>
                    <span className="text-white/60 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {featuredPost.date}
                    </span>
                    <span className="text-white/60 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {featuredPost.readTime}
                    </span>
                    <span className="bg-white text-heritage-primary px-6 py-2 rounded-lg font-semibold flex items-center gap-2 group-hover:bg-heritage-accent group-hover:text-white transition-colors">
                      Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>
      )}

      {/* Article Grid */}
      <section className="py-12 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            key={`${selectedCategory}-${searchQuery}`}
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/resources/blog/${post.slug}`}>
                <motion.article
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group h-full"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 bg-white/90 text-heritage-primary px-3 py-1 rounded-full text-xs font-medium">
                      {getCategoryName(post.category)}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-heritage-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" /> {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {post.readTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {post.date}
                      </span>
                      <span className="text-heritage-primary font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                        Read More <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </motion.div>

          {filteredPosts.length === 0 && !showFeatured && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No articles found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-heritage-primary font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-br from-heritage-primary to-heritage-primary/90 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-heritage-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Get Smarter About Insurance
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of families receiving weekly tips, guides, and insights to protect what matters most.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-heritage-accent text-gray-900 placeholder-gray-500"
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubscribing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-heritage-accent text-white px-8 py-4 rounded-xl font-semibold hover:bg-heritage-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubscribing ? "Subscribing..." : (
                  <>
                    Subscribe <Send className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
            <div className="flex items-center justify-center gap-6 mt-6 text-white/60 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Free forever
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> No spam
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Unsubscribe anytime
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
