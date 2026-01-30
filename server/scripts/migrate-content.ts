/**
 * Content Migration Script
 * Migrates hardcoded blog posts and FAQs from React components to database
 *
 * Run with: npx tsx server/scripts/migrate-content.ts
 */

import { pool, db } from "../db";
import { blogPosts, faqs } from "../../shared/schema";
import { sql } from "drizzle-orm";

// Blog post data extracted from client/src/pages/resources/Blog.tsx
const hardcodedBlogPosts = [
  // ==================== TERM LIFE ====================
  {
    slug: "how-much-life-insurance-do-you-need",
    title: "How Much Life Insurance Do You Actually Need?",
    excerpt: "A simple guide to calculating coverage based on your income, debts, and family situation.",
    category: "term" as const,
    author: "Heritage Team",
    readTimeMinutes: 5,
    featuredImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
    isFeatured: true,
    content: `<p>"How much life insurance do I need?" It's the most common question we hear—and one of the most important to answer correctly.</p>

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

<p>Need help with your specific situation? <a href="/resources/calculators">Try our coverage calculator</a> or <a href="/contact">talk to an expert</a>.</p>`
  },
  {
    slug: "term-vs-whole-life-insurance",
    title: "Term vs. Whole Life: Which Is Right for You?",
    excerpt: "Compare the two main types of life insurance and find your best fit.",
    category: "term" as const,
    author: "Heritage Team",
    readTimeMinutes: 4,
    featuredImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>Term or whole life? It's the first big decision when buying life insurance. Here's how to choose.</p>

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
  <li>Takes years to build meaningful cash value</li>
  <li>More complex</li>
</ul>

<h2>The Bottom Line</h2>
<p><strong>Choose term if:</strong> You want affordable coverage during your working years</p>
<p><strong>Choose whole life if:</strong> You want lifetime protection plus a savings component</p>
<p><strong>Many people:</strong> Start with term, then add whole life later as income grows</p>`
  },
  {
    slug: "10-20-30-year-term-which-to-choose",
    title: "10, 20, or 30-Year Term: Which Should You Choose?",
    excerpt: "Pick the right term length based on your life stage and goals.",
    category: "term" as const,
    author: "Heritage Team",
    readTimeMinutes: 3,
    featuredImage: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>Choosing the right term length is crucial. Too short and you might need coverage after it expires. Too long and you might pay for protection you don't need.</p>

<h2>10-Year Term</h2>
<p><strong>Best for:</strong> Short-term needs</p>
<ul>
  <li>Small remaining mortgage</li>
  <li>Kids almost through college</li>
  <li>Business loans with 10-year terms</li>
  <li>Bridge coverage until retirement</li>
</ul>
<p><strong>Cost:</strong> Lowest premiums of all term lengths</p>

<h2>20-Year Term</h2>
<p><strong>Best for:</strong> Most families (the sweet spot)</p>
<ul>
  <li>New or growing families</li>
  <li>Recent homebuyers</li>
  <li>Still building retirement savings</li>
</ul>
<p><strong>Cost:</strong> Moderate—roughly 1.5-2x a 10-year term</p>

<h2>30-Year Term</h2>
<p><strong>Best for:</strong> Young families who want maximum protection</p>
<ul>
  <li>Newlyweds starting families</li>
  <li>First-time homebuyers</li>
  <li>Want to lock in today's low rates for decades</li>
</ul>
<p><strong>Cost:</strong> Highest—roughly 2-3x a 10-year term</p>

<h2>The Golden Rule</h2>
<p>Your coverage should last until:</p>
<ul>
  <li>Kids are financially independent</li>
  <li>Mortgage is paid off</li>
  <li>Retirement savings can support your spouse</li>
</ul>

<p>Not sure? <a href="/quote">Get quotes for multiple term lengths</a> and see the price difference.</p>`
  },
  {
    slug: "no-exam-life-insurance-pros-cons",
    title: "No-Exam Life Insurance: Pros, Cons, and Who It's For",
    excerpt: "Get covered quickly without needles, but at what cost?",
    category: "term" as const,
    author: "Heritage Team",
    readTimeMinutes: 4,
    featuredImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>No needles, no nurse visit, coverage in days—sounds perfect, right? Let's look at the real trade-offs.</p>

<h2>What Is No-Exam Life Insurance?</h2>
<p>Life insurance that doesn't require a medical exam. Instead, insurers use:</p>
<ul>
  <li>Health questionnaires</li>
  <li>Prescription drug databases</li>
  <li>Medical records (MIB)</li>
  <li>DMV records</li>
</ul>

<h2>The Pros</h2>
<ul>
  <li><strong>Speed:</strong> Approved in minutes to days (vs. 4-6 weeks)</li>
  <li><strong>Convenience:</strong> 100% online process</li>
  <li><strong>No needles:</strong> Great if you hate blood draws</li>
  <li><strong>Privacy:</strong> No stranger coming to your home</li>
</ul>

<h2>The Cons</h2>
<ul>
  <li><strong>Higher premiums:</strong> 15-30% more expensive</li>
  <li><strong>Lower coverage limits:</strong> Often capped at $500K-$1M</li>
  <li><strong>Stricter health requirements:</strong> May be declined for minor issues</li>
  <li><strong>No health credit:</strong> Can't prove you're in great shape</li>
</ul>

<h2>Who Should Consider It?</h2>
<ul>
  <li>Need coverage ASAP (new baby, closing on a house)</li>
  <li>Hate needles or medical procedures</li>
  <li>Generally healthy, no major conditions</li>
  <li>Need $500K or less coverage</li>
</ul>

<h2>Who Should Take the Exam?</h2>
<ul>
  <li>Want the lowest possible rates</li>
  <li>Need high coverage amounts ($1M+)</li>
  <li>In excellent health and want credit for it</li>
  <li>Have time to wait for underwriting</li>
</ul>

<p><a href="/quote">Compare exam vs. no-exam rates</a> for your situation.</p>`
  },
  // ==================== WHOLE LIFE ====================
  {
    slug: "whole-life-cash-value-explained",
    title: "Whole Life Cash Value: How It Works and When to Use It",
    excerpt: "Understand your policy's savings component and how to access it.",
    category: "whole" as const,
    author: "Heritage Team",
    readTimeMinutes: 5,
    featuredImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>One of whole life's biggest selling points is cash value—but what is it, really?</p>

<h2>What Is Cash Value?</h2>
<p>Cash value is a savings component inside your whole life policy. Part of each premium goes into this account, where it grows tax-deferred over time.</p>

<h2>How It Grows</h2>
<ul>
  <li><strong>Guaranteed minimum rate:</strong> Typically 2-4%</li>
  <li><strong>Dividends:</strong> Mutual companies may pay additional dividends</li>
  <li><strong>Tax-deferred:</strong> No taxes until you withdraw</li>
</ul>

<h2>Ways to Access Your Cash Value</h2>
<h3>1. Policy Loans</h3>
<p>Borrow against your cash value. No credit check, no approval needed. Interest rates are typically 5-8%.</p>

<h3>2. Withdrawals</h3>
<p>Take money out permanently. Tax-free up to your basis (what you paid in premiums).</p>

<h3>3. Surrender</h3>
<p>Cancel the policy and receive the full cash value (minus any surrender charges in early years).</p>

<h2>What People Use It For</h2>
<ul>
  <li>Emergency fund (better than high-interest debt)</li>
  <li>Retirement income supplement</li>
  <li>Down payment on a home</li>
  <li>Child's education</li>
  <li>Business capital</li>
</ul>

<h2>The Reality Check</h2>
<p>It takes 10-15 years to build meaningful cash value. In early years, most of your premium goes to insurance costs and commissions.</p>

<p>Want to see how cash value would grow in your policy? <a href="/contact">Talk to an advisor</a>.</p>`
  },
  {
    slug: "whole-life-dividends-explained",
    title: "Whole Life Dividends: What They Are and How to Use Them",
    excerpt: "Learn how participating policies can boost your coverage over time.",
    category: "whole" as const,
    author: "Heritage Team",
    readTimeMinutes: 4,
    featuredImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>If you have a "participating" whole life policy from a mutual insurance company, you may receive dividends. Here's what that means.</p>

<h2>What Are Dividends?</h2>
<p>Dividends are a return of premium when the insurance company does better than expected. They're not guaranteed, but top mutual companies have paid them for 100+ years straight.</p>

<h2>How Companies Generate Dividends</h2>
<ul>
  <li>Investment returns exceed projections</li>
  <li>Fewer claims than expected</li>
  <li>Lower operating costs</li>
</ul>

<h2>Your Dividend Options</h2>
<h3>1. Paid-Up Additions (PUAs)</h3>
<p>Buy more permanent insurance, increasing your death benefit and cash value. Best for growth.</p>

<h3>2. Reduce Premiums</h3>
<p>Use dividends to lower your out-of-pocket cost. Good if cash flow is tight.</p>

<h3>3. Cash Payment</h3>
<p>Receive a check. Taxable as ordinary income above your basis.</p>

<h3>4. Accumulate at Interest</h3>
<p>Leave dividends with the insurer to earn interest. Simple but interest is taxable.</p>

<h2>Which Option Is Best?</h2>
<p>For most people: <strong>Paid-up additions.</strong> They supercharge your policy's growth and increase your coverage without additional underwriting.</p>

<h2>Current Dividend Rates</h2>
<p>Top mutual companies currently pay dividend rates of 5-6% on whole life policies—better than most savings accounts.</p>`
  },
  // ==================== FINAL EXPENSE ====================
  {
    slug: "final-expense-insurance-guide",
    title: "Final Expense Insurance: A Complete Guide for Seniors",
    excerpt: "Everything you need to know about burial insurance and end-of-life coverage.",
    category: "final-expense" as const,
    author: "Heritage Team",
    readTimeMinutes: 6,
    featuredImage: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=250&fit=crop",
    isFeatured: true,
    content: `<p>Final expense insurance (also called burial insurance) helps your family cover end-of-life costs so they're not left with a financial burden.</p>

<h2>What It Covers</h2>
<ul>
  <li>Funeral and burial costs ($7,000-$15,000 average)</li>
  <li>Cremation expenses ($2,000-$5,000)</li>
  <li>Outstanding medical bills</li>
  <li>Credit card debt</li>
  <li>Legal fees</li>
  <li>Any final expenses you want covered</li>
</ul>

<h2>Coverage Amounts</h2>
<p>Typically $5,000 to $35,000. Enough to cover funeral costs and some leftover for your family.</p>

<h2>Types of Final Expense Policies</h2>
<h3>Simplified Issue</h3>
<ul>
  <li>Answer health questions (no exam)</li>
  <li>Full coverage from day one</li>
  <li>Lower premiums</li>
  <li>Best for those in decent health</li>
</ul>

<h3>Guaranteed Issue</h3>
<ul>
  <li>No health questions at all</li>
  <li>2-3 year waiting period for full benefits</li>
  <li>Higher premiums</li>
  <li>Best for those with serious health issues</li>
</ul>

<h2>Who Should Consider It?</h2>
<ul>
  <li>Seniors 50-85 who want to prepay funeral costs</li>
  <li>Those who don't want to burden family financially</li>
  <li>People who've been declined for traditional life insurance</li>
  <li>Those with small estates who want debt coverage</li>
</ul>

<h2>How Much Does It Cost?</h2>
<p>Premiums vary by age and health, but expect:</p>
<ul>
  <li>60-year-old: $30-$70/month for $10,000</li>
  <li>70-year-old: $50-$100/month for $10,000</li>
  <li>80-year-old: $80-$150/month for $10,000</li>
</ul>

<p><a href="/quote">Get your personalized final expense quote</a>.</p>`
  },
  {
    slug: "guaranteed-vs-simplified-issue",
    title: "Guaranteed vs. Simplified Issue: Which Final Expense Policy Is Right?",
    excerpt: "Compare the two types of final expense insurance and find your best option.",
    category: "final-expense" as const,
    author: "Heritage Team",
    readTimeMinutes: 4,
    featuredImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>When shopping for final expense insurance, you'll encounter two main types: simplified issue and guaranteed issue. Here's how to choose.</p>

<h2>Simplified Issue</h2>
<p>You answer health questions but don't take a medical exam.</p>
<h3>Pros:</h3>
<ul>
  <li>Full coverage starts immediately</li>
  <li>Lower premiums (15-30% less than guaranteed)</li>
  <li>Higher coverage amounts available</li>
</ul>
<h3>Cons:</h3>
<ul>
  <li>Must answer health questions honestly</li>
  <li>May be declined for certain conditions</li>
</ul>

<h2>Guaranteed Issue</h2>
<p>No health questions—anyone who applies gets coverage.</p>
<h3>Pros:</h3>
<ul>
  <li>Cannot be declined for health reasons</li>
  <li>No health questions or exam</li>
  <li>Quick approval</li>
</ul>
<h3>Cons:</h3>
<ul>
  <li>2-3 year waiting period (graded benefits)</li>
  <li>Higher premiums</li>
  <li>Lower coverage limits</li>
</ul>

<h2>Which Should You Choose?</h2>
<p><strong>Start with simplified issue.</strong> It's cheaper and provides immediate coverage. Only consider guaranteed issue if you:</p>
<ul>
  <li>Have been declined for simplified issue</li>
  <li>Have serious health conditions</li>
  <li>Want 100% guaranteed acceptance</li>
</ul>

<p><a href="/contact">Talk to us</a>—we'll help you find the right fit.</p>`
  },
  // ==================== MORTGAGE PROTECTION ====================
  {
    slug: "mortgage-protection-insurance-explained",
    title: "Mortgage Protection Insurance: What Homeowners Need to Know",
    excerpt: "Protect your family's home with the right coverage strategy.",
    category: "mortgage-protection" as const,
    author: "Heritage Team",
    readTimeMinutes: 5,
    featuredImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>Mortgage protection insurance ensures your family can keep the home if something happens to you. But is it the right choice?</p>

<h2>What Is Mortgage Protection Insurance?</h2>
<p>A life insurance policy that pays off your mortgage if you die. Some policies also cover disability or job loss.</p>

<h2>How It Works</h2>
<p>When you pass away, the policy pays your remaining mortgage balance directly to the lender (or to your beneficiary, depending on policy type).</p>

<h2>MPI vs. Regular Life Insurance</h2>
<table>
  <tr><th>Feature</th><th>Mortgage Protection</th><th>Term Life</th></tr>
  <tr><td>Beneficiary</td><td>Usually the lender</td><td>Anyone you choose</td></tr>
  <tr><td>Death benefit</td><td>Decreases with mortgage</td><td>Stays level</td></tr>
  <tr><td>Coverage use</td><td>Mortgage only</td><td>Any purpose</td></tr>
  <tr><td>Cost</td><td>Often higher</td><td>Usually lower</td></tr>
</table>

<h2>The Verdict: Term Life Is Usually Better</h2>
<p>For most homeowners, a level term life policy is smarter:</p>
<ul>
  <li>Same or lower cost</li>
  <li>Death benefit doesn't decrease</li>
  <li>Family controls the money</li>
  <li>Can use for any expense, not just mortgage</li>
</ul>

<h2>When MPI Makes Sense</h2>
<ul>
  <li>You have health issues that make term insurance expensive</li>
  <li>Your lender requires it</li>
  <li>You want the simplicity of direct payout to lender</li>
</ul>

<p><a href="/quote">Compare mortgage protection vs. term life rates</a>.</p>`
  },
  {
    slug: "decreasing-vs-level-term-mortgage",
    title: "Decreasing vs. Level Term: Which Protects Your Mortgage Better?",
    excerpt: "Two approaches to mortgage coverage—and why level term usually wins.",
    category: "mortgage-protection" as const,
    author: "Heritage Team",
    readTimeMinutes: 3,
    featuredImage: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>Should your life insurance decrease along with your mortgage, or stay level? Here's the math.</p>

<h2>Decreasing Term</h2>
<p>Death benefit decreases over time, mirroring your mortgage balance.</p>
<ul>
  <li>Lower initial premiums</li>
  <li>Payout shrinks each year</li>
  <li>Pays less even though premiums stay the same</li>
</ul>

<h2>Level Term</h2>
<p>Death benefit stays the same throughout the policy.</p>
<ul>
  <li>Slightly higher initial premiums</li>
  <li>Full payout regardless of when you die</li>
  <li>Extra money for other expenses as mortgage decreases</li>
</ul>

<h2>The Math Example</h2>
<p>$300,000 mortgage, 30-year term:</p>

<h3>Year 1</h3>
<ul>
  <li>Decreasing: $300,000 payout</li>
  <li>Level: $300,000 payout</li>
</ul>

<h3>Year 15</h3>
<ul>
  <li>Decreasing: ~$175,000 payout</li>
  <li>Level: $300,000 payout</li>
</ul>

<h3>Year 25</h3>
<ul>
  <li>Decreasing: ~$75,000 payout</li>
  <li>Level: $300,000 payout</li>
</ul>

<h2>The Bottom Line</h2>
<p>Level term costs only 10-20% more but gives your family flexibility and extra funds as your mortgage shrinks. The extra payout can cover:</p>
<ul>
  <li>Income replacement</li>
  <li>Kids' education</li>
  <li>Emergency fund</li>
  <li>Spouse's retirement</li>
</ul>

<p><a href="/quote">Compare decreasing vs. level term quotes</a>.</p>`
  },
  // ==================== IUL ====================
  {
    slug: "iul-explained-simply",
    title: "Indexed Universal Life (IUL) Explained Simply",
    excerpt: "Understand how IUL works without the complicated jargon.",
    category: "iul" as const,
    author: "Heritage Team",
    readTimeMinutes: 6,
    featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>IUL is one of the most misunderstood life insurance products. Here's a plain-English explanation.</p>

<h2>What Is IUL?</h2>
<p>Indexed Universal Life is permanent life insurance that ties your cash value growth to a stock market index (like the S&P 500)—without directly investing in the market.</p>

<h2>How Growth Works</h2>
<p>Your cash value earns interest based on index performance, with two key features:</p>
<ul>
  <li><strong>Floor (0%):</strong> When the market drops, you don't lose money</li>
  <li><strong>Cap (8-12%):</strong> When the market soars, your gains are capped</li>
</ul>

<h2>Example</h2>
<p>Policy with 0% floor, 10% cap:</p>
<ul>
  <li>Market returns 25% → You get 10% (capped)</li>
  <li>Market returns 8% → You get 8%</li>
  <li>Market returns -15% → You get 0% (floor protects you)</li>
</ul>

<h2>The Good</h2>
<ul>
  <li>Market-linked growth without market risk</li>
  <li>Tax-free death benefit</li>
  <li>Tax-free policy loans for retirement income</li>
  <li>Flexible premiums</li>
</ul>

<h2>The Not-So-Good</h2>
<ul>
  <li>Caps limit your upside</li>
  <li>Complex—many moving parts</li>
  <li>Higher fees than term insurance</li>
  <li>Must be funded properly to work</li>
</ul>

<h2>Who Should Consider IUL?</h2>
<ul>
  <li>Max out 401(k) and IRAs already</li>
  <li>Want tax-advantaged retirement income</li>
  <li>Have a long time horizon (15+ years)</li>
  <li>Comfortable with complexity</li>
</ul>

<p><a href="/contact">Talk to an advisor</a> about whether IUL fits your situation.</p>`
  },
  {
    slug: "iul-caps-floors-participation-rates",
    title: "IUL Caps, Floors, and Participation Rates Explained",
    excerpt: "Understand the three key factors that determine your IUL returns.",
    category: "iul" as const,
    author: "Heritage Team",
    readTimeMinutes: 4,
    featuredImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>Three numbers control how much your IUL cash value grows: caps, floors, and participation rates. Here's what they mean.</p>

<h2>The Floor</h2>
<p>The minimum interest rate you can earn—usually 0%.</p>
<p>Even if the S&P 500 drops 30%, your cash value won't decrease (though fees still apply).</p>

<h2>The Cap</h2>
<p>The maximum interest rate you can earn—typically 8-12%.</p>
<p>If the index returns 20%, you only get credited up to the cap.</p>

<h2>Participation Rate</h2>
<p>The percentage of index gains you receive—usually 100% but can be lower.</p>
<p>With 80% participation and 10% index return: 10% × 80% = 8% credited</p>

<h2>How They Work Together</h2>
<p>Example: 0% floor, 10% cap, 100% participation</p>
<ul>
  <li>Index returns +15% → You get 10% (capped)</li>
  <li>Index returns +7% → You get 7%</li>
  <li>Index returns -10% → You get 0% (floor)</li>
</ul>

<h2>Watch Out For</h2>
<ul>
  <li><strong>Changing caps:</strong> Insurers can lower caps over time</li>
  <li><strong>Low participation rates:</strong> 50% participation halves your gains</li>
  <li><strong>Spread/margin:</strong> Some policies subtract a spread from gains</li>
</ul>

<h2>What to Look For</h2>
<ul>
  <li>Guaranteed minimum cap (in writing)</li>
  <li>History of stable caps</li>
  <li>100% participation rate</li>
  <li>No spread or margin</li>
</ul>`
  },
  // ==================== GENERAL / PLANNING ====================
  {
    slug: "life-insurance-for-stay-at-home-parents",
    title: "Why Stay-at-Home Parents Need Life Insurance Too",
    excerpt: "Your unpaid work has enormous financial value—here's how to protect it.",
    category: "planning" as const,
    author: "Heritage Team",
    readTimeMinutes: 4,
    featuredImage: "https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>No paycheck doesn't mean no financial value. Stay-at-home parents provide services worth $170,000+ per year.</p>

<h2>What Would You Have to Replace?</h2>
<ul>
  <li>Childcare: $15,000-$40,000/year</li>
  <li>Housekeeping: $5,000-$10,000/year</li>
  <li>Cooking/meal prep: $5,000-$8,000/year</li>
  <li>Transportation: $3,000-$5,000/year</li>
  <li>Tutoring/homework help: $2,000-$5,000/year</li>
  <li>Healthcare coordination: Priceless</li>
</ul>

<h2>How Much Coverage?</h2>
<p>Calculate the cost of outsourcing these services for the years until your youngest is independent. For most families: $250,000-$500,000.</p>

<h2>Real Example</h2>
<p>Stay-at-home parent with three kids (ages 2, 5, 8):</p>
<ul>
  <li>Childcare until youngest is 13: 11 years × $25,000 = $275,000</li>
  <li>Household services: 15 years × $12,000 = $180,000</li>
  <li><strong>Total: $455,000 coverage needed</strong></li>
</ul>

<h2>The Good News</h2>
<p>Stay-at-home parents are often very affordable to insure:</p>
<ul>
  <li>No dangerous commute</li>
  <li>No occupational hazards</li>
  <li>Often younger when applying</li>
</ul>

<p>A healthy 35-year-old can get $500,000 in coverage for $25-$35/month.</p>

<p><a href="/quote">Get a quote for stay-at-home parent coverage</a>.</p>`
  },
  {
    slug: "life-insurance-in-your-30s",
    title: "Life Insurance in Your 30s: The Sweet Spot for Coverage",
    excerpt: "Why your 30s are the ideal time to lock in great rates.",
    category: "planning" as const,
    author: "Heritage Team",
    readTimeMinutes: 4,
    featuredImage: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>Your 30s are the Goldilocks zone for life insurance—you probably need it now, and rates are still incredibly low.</p>

<h2>Why Your 30s Are Ideal</h2>
<ul>
  <li><strong>Health:</strong> Most 30-somethings are still in good health</li>
  <li><strong>Rates:</strong> Still young enough for rock-bottom premiums</li>
  <li><strong>Need:</strong> Major financial obligations (mortgage, kids)</li>
  <li><strong>Time:</strong> Can lock in rates for 20-30 years</li>
</ul>

<h2>Sample Rates (Healthy Non-Smoker)</h2>
<p>$500,000, 20-year term:</p>
<ul>
  <li>Age 30: ~$22/month</li>
  <li>Age 35: ~$25/month</li>
  <li>Age 40: ~$35/month</li>
  <li>Age 45: ~$50/month</li>
</ul>

<h2>Common Triggers in Your 30s</h2>
<p>These life events mean it's time to get (or increase) coverage:</p>
<ul>
  <li>Getting married</li>
  <li>Buying a home</li>
  <li>Having kids</li>
  <li>Starting a business</li>
  <li>Co-signing loans</li>
</ul>

<h2>How Much You Need</h2>
<p>In your 30s, aim for 10-15x your income, plus:</p>
<ul>
  <li>Full mortgage balance</li>
  <li>All other debts</li>
  <li>$150,000-$250,000 per child for education</li>
</ul>

<h2>Don't Wait</h2>
<p>Every year you wait:</p>
<ul>
  <li>Premiums increase 4-8%</li>
  <li>Health conditions become more likely</li>
  <li>Insurability is never guaranteed</li>
</ul>

<p><a href="/quote">Lock in your rate today</a>.</p>`
  },
  {
    slug: "life-insurance-medical-exam-what-to-expect",
    title: "The Life Insurance Medical Exam: What to Expect",
    excerpt: "Everything that happens during the exam and how to prepare.",
    category: "planning" as const,
    author: "Heritage Team",
    readTimeMinutes: 5,
    featuredImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>The medical exam sounds scary, but it's quick, free, and can actually save you money by proving you're healthy.</p>

<h2>What Happens</h2>
<p>A paramedical examiner comes to your home or office (your choice). Takes 20-30 minutes.</p>
<ul>
  <li>Height and weight</li>
  <li>Blood pressure and pulse</li>
  <li>Blood draw (1-2 vials)</li>
  <li>Urine sample</li>
  <li>Medical history questions</li>
</ul>

<h2>What They're Testing For</h2>
<ul>
  <li>Cholesterol levels</li>
  <li>Blood sugar (diabetes indicator)</li>
  <li>Liver and kidney function</li>
  <li>HIV and Hepatitis</li>
  <li>Nicotine/cotinine (smoking)</li>
  <li>Drugs (including marijuana)</li>
</ul>

<h2>How to Prepare</h2>
<h3>48 Hours Before:</h3>
<ul>
  <li>Avoid alcohol</li>
  <li>Avoid strenuous exercise</li>
  <li>Eat healthy meals</li>
</ul>

<h3>24 Hours Before:</h3>
<ul>
  <li>Avoid caffeine</li>
  <li>Avoid salty foods</li>
  <li>Get good sleep</li>
</ul>

<h3>Day Of:</h3>
<ul>
  <li>Fast for 8-12 hours (water is okay)</li>
  <li>Schedule in the morning</li>
  <li>Wear comfortable, loose sleeves</li>
  <li>Have ID and policy info ready</li>
</ul>

<h2>What NOT to Do</h2>
<ul>
  <li>Don't lie about medical history (they will find out)</li>
  <li>Don't use someone else's urine (fraud = denied coverage)</li>
  <li>Don't crash diet right before (it doesn't help)</li>
</ul>

<p>Want to skip the exam? <a href="/life-insurance/term/no-exam">Learn about no-exam options</a>.</p>`
  },
  {
    slug: "life-insurance-for-business-owners",
    title: "Life Insurance for Business Owners: 5 Essential Strategies",
    excerpt: "Protect your business, partners, and family with the right coverage.",
    category: "planning" as const,
    author: "Heritage Team",
    readTimeMinutes: 6,
    featuredImage: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>As a business owner, you have unique insurance needs beyond just protecting your family.</p>

<h2>1. Key Person Insurance</h2>
<p>Protects your business if a crucial employee dies unexpectedly.</p>
<ul>
  <li>Company owns the policy and pays premiums</li>
  <li>Company receives the death benefit</li>
  <li>Use funds to recruit replacement, cover lost revenue</li>
  <li>Coverage: Usually 5-10x the key person's salary</li>
</ul>

<h2>2. Buy-Sell Agreement Funding</h2>
<p>Ensures smooth ownership transition if a partner dies.</p>
<ul>
  <li>Each partner insured for their ownership stake</li>
  <li>Surviving partners use proceeds to buy deceased's share</li>
  <li>Family gets fair value; business continues</li>
</ul>

<h2>3. Business Loan Protection</h2>
<p>Guarantees debts are paid if you die.</p>
<ul>
  <li>Coverage equals outstanding business loans</li>
  <li>Prevents lenders from calling loans due</li>
  <li>Protects personal assets used as collateral</li>
</ul>

<h2>4. Executive Benefits</h2>
<p>Attract and retain top talent with life insurance perks.</p>
<ul>
  <li>Split-dollar arrangements</li>
  <li>Executive bonus plans</li>
  <li>Deferred compensation funding</li>
</ul>

<h2>5. Succession Planning</h2>
<p>Fund the transfer of your business to heirs.</p>
<ul>
  <li>Equalize inheritance among children</li>
  <li>Provide liquidity for estate taxes</li>
  <li>Allow family members to buy business interest</li>
</ul>

<h2>Tax Advantages</h2>
<ul>
  <li>Death benefits are income tax-free</li>
  <li>Key person premiums may be deductible</li>
  <li>Cash value grows tax-deferred</li>
</ul>

<p><a href="/contact">Schedule a business insurance consultation</a>.</p>`
  },
  // ==================== CLAIMS & PROCESS ====================
  {
    slug: "how-to-file-life-insurance-claim",
    title: "How to File a Life Insurance Claim: Step-by-Step Guide",
    excerpt: "What to do when it's time to collect—and how to avoid delays.",
    category: "planning" as const,
    author: "Heritage Team",
    readTimeMinutes: 5,
    featuredImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>Filing a life insurance claim during grief is hard. Here's exactly what to do, step by step.</p>

<h2>Step 1: Gather Documents</h2>
<p>You'll need:</p>
<ul>
  <li>Certified death certificate (order 5-10 copies)</li>
  <li>Policy number and documents</li>
  <li>Beneficiary's ID and Social Security number</li>
  <li>Claimant's contact information</li>
</ul>

<h2>Step 2: Contact the Insurance Company</h2>
<p>Call the insurer's claims department. They'll send claim forms and instructions.</p>
<ul>
  <li>Most have dedicated claims lines (not general customer service)</li>
  <li>Ask about the expected timeline</li>
  <li>Confirm what documents they need</li>
</ul>

<h2>Step 3: Complete the Claim Form</h2>
<p>Fill out accurately and completely:</p>
<ul>
  <li>Policy number</li>
  <li>Insured's information</li>
  <li>Cause and date of death</li>
  <li>Beneficiary information</li>
  <li>Payment preference (lump sum vs. installments)</li>
</ul>

<h2>Step 4: Submit Everything</h2>
<p>Send claim form plus:</p>
<ul>
  <li>Certified death certificate</li>
  <li>Copy of the policy (if available)</li>
  <li>Any additional requested documents</li>
</ul>

<h2>Step 5: Wait (But Not Long)</h2>
<p>Most claims are paid within 30-60 days. If longer:</p>
<ul>
  <li>Call for status updates</li>
  <li>Provide any additional information requested</li>
  <li>Contact your state insurance commissioner if unreasonably delayed</li>
</ul>

<h2>Common Delays to Avoid</h2>
<ul>
  <li>Missing or incomplete information</li>
  <li>Death within contestability period (first 2 years)</li>
  <li>Cause of death investigation</li>
  <li>Multiple beneficiaries with disputes</li>
</ul>

<h2>Payout Options</h2>
<ul>
  <li><strong>Lump sum:</strong> Full amount at once (most common)</li>
  <li><strong>Installments:</strong> Regular payments over time</li>
  <li><strong>Retained assets:</strong> Held by insurer, earns interest</li>
  <li><strong>Annuity:</strong> Convert to guaranteed income stream</li>
</ul>`
  },
  {
    slug: "life-insurance-beneficiary-mistakes",
    title: "5 Life Insurance Beneficiary Mistakes That Cost Families Thousands",
    excerpt: "Avoid these common errors to ensure your loved ones get paid.",
    category: "planning" as const,
    author: "Heritage Team",
    readTimeMinutes: 4,
    featuredImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>Your beneficiary designation is the most important part of your policy. Get it wrong and your wishes may not be honored.</p>

<h2>Mistake #1: Naming Your Estate</h2>
<p><strong>The problem:</strong> Proceeds go through probate, delaying payment and exposing funds to creditors and estate taxes.</p>
<p><strong>The fix:</strong> Name specific people or a trust as beneficiaries.</p>

<h2>Mistake #2: Naming Minor Children</h2>
<p><strong>The problem:</strong> Minors can't legally receive insurance proceeds. A court must appoint a guardian to manage the money.</p>
<p><strong>The fix:</strong> Name a trust for the benefit of your children, or name an adult custodian under UTMA/UGMA.</p>

<h2>Mistake #3: Forgetting to Update After Life Changes</h2>
<p><strong>The problem:</strong> Your ex-spouse may still be the beneficiary after divorce. Your deceased parent may still be listed.</p>
<p><strong>The fix:</strong> Review beneficiaries annually and after every major life event.</p>

<h2>Mistake #4: Not Naming a Contingent Beneficiary</h2>
<p><strong>The problem:</strong> If your primary beneficiary dies first, proceeds may go to your estate (see Mistake #1).</p>
<p><strong>The fix:</strong> Always name a contingent (backup) beneficiary.</p>

<h2>Mistake #5: Using Only First Names</h2>
<p><strong>The problem:</strong> "My children" or "John" may be ambiguous, causing disputes or delays.</p>
<p><strong>The fix:</strong> Use full legal names, dates of birth, and Social Security numbers.</p>

<h2>When to Review Your Beneficiaries</h2>
<ul>
  <li>Marriage or divorce</li>
  <li>Birth or adoption of a child</li>
  <li>Death of a beneficiary</li>
  <li>Major family disagreements</li>
  <li>At least once per year</li>
</ul>`
  },
  {
    slug: "life-insurance-riders-worth-cost",
    title: "Life Insurance Riders: Which Ones Are Worth the Extra Cost?",
    excerpt: "Optional add-ons can enhance your policy—or waste your money. Here's which are which.",
    category: "planning" as const,
    author: "Heritage Team",
    readTimeMinutes: 5,
    featuredImage: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=250&fit=crop",
    isFeatured: false,
    content: `<p>Riders customize your life insurance policy with extra features. Some are valuable; others are just extra premiums.</p>

<h2>Worth It: Waiver of Premium</h2>
<p>Keeps your policy active if you become disabled and can't work.</p>
<ul>
  <li>Cost: $2-$5/month per $100,000 coverage</li>
  <li>Value: High—protects your policy when you need it most</li>
</ul>

<h2>Worth It: Accelerated Death Benefit</h2>
<p>Access a portion of your death benefit if diagnosed with a terminal illness.</p>
<ul>
  <li>Cost: Often free or minimal</li>
  <li>Value: High—provides funds when you need them</li>
</ul>

<h2>Sometimes Worth It: Term Conversion</h2>
<p>Convert your term policy to permanent insurance without a new medical exam.</p>
<ul>
  <li>Cost: Usually free (built into term policies)</li>
  <li>Value: Medium—valuable if health declines</li>
</ul>

<h2>Sometimes Worth It: Child Term Rider</h2>
<p>Small amount of coverage for your children (typically $10,000-$25,000).</p>
<ul>
  <li>Cost: $5-$10/month for all children</li>
  <li>Value: Medium—more for insurability guarantee than coverage</li>
</ul>

<h2>Rarely Worth It: Accidental Death</h2>
<p>Pays extra if death is from an accident.</p>
<ul>
  <li>Cost: $5-$15/month</li>
  <li>Value: Low—accidents are rare; better to increase base coverage</li>
</ul>

<h2>Rarely Worth It: Return of Premium</h2>
<p>Refunds all premiums if you outlive the term.</p>
<ul>
  <li>Cost: 2-3x higher premiums</li>
  <li>Value: Low—you'd do better investing the difference</li>
</ul>

<h2>The Bottom Line</h2>
<p>Start with a solid base policy. Add waiver of premium if offered. Skip most other riders and put the money toward more coverage.</p>`
  }
];

// FAQ data extracted from client/src/pages/resources/FAQs.tsx
const hardcodedFaqs = [
  // ==================== BASICS ====================
  { category: "basics", question: "What is life insurance?", answer: "Life insurance pays a tax-free lump sum to your beneficiaries when you die. It replaces your income, pays off debts, and keeps your family financially secure." },
  { category: "basics", question: "Do I really need life insurance?", answer: "If anyone depends on your income—spouse, children, aging parents—you likely need life insurance. It ensures they can maintain their lifestyle, pay the mortgage, and cover future expenses like college if something happens to you." },
  { category: "basics", question: "How does life insurance work?", answer: "You pay monthly or annual premiums to an insurance company. In exchange, they promise to pay a death benefit (the coverage amount) to your beneficiaries when you pass away. It's a contract—you pay, they pay." },
  { category: "basics", question: "When should I get life insurance?", answer: "The best time is now—you're never younger or healthier than today. Premiums increase with age and any health issues. Most people buy when they get married, have kids, or buy a home." },
  { category: "basics", question: "How long does life insurance last?", answer: "Term life lasts a specific period (10, 20, or 30 years). Permanent life insurance (whole life, universal life) lasts your entire lifetime as long as you pay premiums." },
  { category: "basics", question: "Is life insurance taxable?", answer: "Death benefits are generally income tax-free to beneficiaries. However, if the policy is part of your estate, it may be subject to estate taxes for very large estates (over $12.92 million in 2023)." },

  // ==================== POLICY TYPES ====================
  { category: "types", question: "What's the difference between term and whole life?", answer: "Term life covers you for a set period (10-30 years) and is pure protection. Whole life covers you forever and builds cash value you can borrow against. Term is 5-10x cheaper; whole life offers lifelong coverage plus a savings component." },
  { category: "types", question: "What is universal life insurance?", answer: "Universal life is permanent insurance with flexible premiums and death benefits. You can adjust your coverage and payments over time. It also builds cash value, but with more complexity than whole life." },
  { category: "types", question: "What is indexed universal life (IUL)?", answer: "IUL ties your cash value growth to a stock market index (like the S&P 500) without directly investing in stocks. You get upside potential with downside protection—a floor prevents losses, but a cap limits gains." },
  { category: "types", question: "What is final expense insurance?", answer: "Final expense (burial insurance) is a small whole life policy ($5,000-$35,000) designed to cover funeral costs and small debts. It's easier to qualify for, making it popular with seniors." },
  { category: "types", question: "What is mortgage protection insurance?", answer: "Mortgage protection pays off your home loan if you die. It's designed to ensure your family keeps the house. However, a regular term life policy is usually cheaper and more flexible." },
  { category: "types", question: "Should I get term or permanent insurance?", answer: "Most people should start with term—it's affordable and covers your working years. Consider permanent insurance if you want lifelong coverage, have estate planning needs, or have maxed out other retirement accounts." },

  // ==================== COST & PRICING ====================
  { category: "cost", question: "How much does life insurance cost?", answer: "For a healthy 35-year-old, $500,000 of 20-year term coverage costs about $25-$35/month. Cost depends on your age, health, coverage amount, and term length. Whole life costs 5-10x more than term." },
  { category: "cost", question: "Why do life insurance rates vary so much?", answer: "Rates depend on: age, health, smoking status, coverage amount, term length, occupation, hobbies, and family health history. A healthy non-smoker pays much less than someone with health issues." },
  { category: "cost", question: "Can I lower my life insurance premiums?", answer: "Yes! Get healthier before applying (lose weight, quit smoking), buy when you're young, choose term over permanent, avoid riders you don't need, and compare quotes from multiple insurers." },
  { category: "cost", question: "Are life insurance premiums tax-deductible?", answer: "For personal life insurance, premiums are not tax-deductible. However, business-owned policies (like key person insurance) may offer tax benefits. Consult a tax professional for your specific situation." },
  { category: "cost", question: "Do life insurance rates go up with age?", answer: "For new policies, yes—rates increase 4-8% for each year older you are when you buy. However, once you have a policy, your rate is locked in for the entire term (term life) or life (whole life)." },
  { category: "cost", question: "Is it cheaper to pay annually or monthly?", answer: "Annual payments are usually 2-8% cheaper than monthly. Insurers offer this discount because it reduces their administrative costs and ensures the full year's premium is collected upfront." },

  // ==================== COVERAGE ====================
  { category: "coverage", question: "How much life insurance do I need?", answer: "A common rule: 10-12x your annual income. For a more accurate number, add up: income replacement (10-15 years), mortgage balance, other debts, future education costs, and final expenses. Then subtract existing savings and coverage." },
  { category: "coverage", question: "Can I have multiple life insurance policies?", answer: "Yes! Many people have employer coverage plus personal policies, or combine term and permanent insurance. Just disclose all existing coverage on applications—insurers have limits on total coverage they'll issue." },
  { category: "coverage", question: "What does life insurance not cover?", answer: "Most policies have exclusions for: suicide within the first two years, death while committing a crime, fraud or material misrepresentation on the application, and sometimes certain hazardous activities (if not disclosed)." },
  { category: "coverage", question: "Does life insurance cover suicide?", answer: "After the first 2 years (the contestability period), most policies do cover suicide. During the first 2 years, the insurer typically refunds premiums paid but doesn't pay the death benefit." },
  { category: "coverage", question: "Can I increase my coverage later?", answer: "Sometimes. Some policies offer guaranteed insurability riders that let you increase coverage at certain life events (marriage, birth) without a new medical exam. Otherwise, you'd need to apply for a new policy." },
  { category: "coverage", question: "What happens if I outlive my term policy?", answer: "Coverage ends and you stop paying premiums. You receive nothing back (unless you have a return of premium rider). You can often renew at higher rates or convert to permanent insurance." },

  // ==================== HEALTH & MEDICAL ====================
  { category: "health", question: "Do I need a medical exam for life insurance?", answer: "Not always. No-exam policies approve based on health questions and database checks. However, policies with exams are usually 15-30% cheaper and offer higher coverage limits." },
  { category: "health", question: "What does the life insurance medical exam test for?", answer: "Blood tests check cholesterol, blood sugar (diabetes), liver/kidney function, HIV, hepatitis, and nicotine/drugs. Urine tests confirm blood results. They also measure height, weight, and blood pressure." },
  { category: "health", question: "Can I get life insurance with pre-existing conditions?", answer: "Usually, yes. Common conditions like diabetes, high blood pressure, and depression don't disqualify you—they may mean higher premiums or certain policy types. Some conditions (like recent cancer) may require waiting periods." },
  { category: "health", question: "How does smoking affect life insurance rates?", answer: "Smokers pay 2-3x more than non-smokers. Most insurers classify you as a smoker if you've used any tobacco or nicotine products in the past 12 months. Quit for a year and you can reapply at non-smoker rates." },
  { category: "health", question: "Does marijuana use affect life insurance?", answer: "It depends on the insurer. Some treat occasional marijuana use like non-smoking; others rate it like tobacco. Frequency matters—daily use is rated differently than occasional use. Be honest on applications." },
  { category: "health", question: "Will my medical records be checked?", answer: "Yes. Insurers access the MIB (Medical Information Bureau), prescription drug databases, and may request your medical records. They're verifying what you disclosed—honesty is essential." },

  // ==================== APPLICATION PROCESS ====================
  { category: "process", question: "How long does it take to get life insurance?", answer: "No-exam policies: minutes to days. Traditional policies with exams: 4-6 weeks. Accelerated underwriting (some companies): 1-2 weeks. Complex cases may take longer." },
  { category: "process", question: "What information do I need to apply?", answer: "Basic info: name, address, SSN, date of birth. Health history: conditions, medications, doctors. Financial: income, existing coverage, net worth (for large policies). Lifestyle: occupation, hobbies, travel." },
  { category: "process", question: "Can I be denied life insurance?", answer: "Yes. Common reasons: serious health conditions (recent cancer, severe heart disease), dangerous occupations or hobbies, criminal history, or lying on the application. If denied, you may have options with other insurers." },
  { category: "process", question: "What is underwriting?", answer: "Underwriting is how insurers assess your risk and determine your premium. They review your application, medical records, exam results, and databases to decide whether to approve you and at what rate." },
  { category: "process", question: "How do I prepare for the medical exam?", answer: "Fast 8-12 hours before (water is okay). Avoid alcohol for 48 hours. Skip strenuous exercise 24 hours prior. Get good sleep. Schedule in the morning. Wear loose sleeves for blood draw." },
  { category: "process", question: "Can I apply for life insurance online?", answer: "Yes! Most major insurers now offer fully online applications. No-exam policies can be completed entirely online. Traditional policies start online but require an in-person exam." },

  // ==================== BENEFICIARIES ====================
  { category: "beneficiaries", question: "Who can I name as a beneficiary?", answer: "Anyone: spouse, children, other family members, friends, trusts, charities, even your estate (though that's not recommended). You can name multiple beneficiaries and specify percentage splits." },
  { category: "beneficiaries", question: "What's a contingent beneficiary?", answer: "A backup beneficiary who receives the death benefit if your primary beneficiary dies before you or at the same time. Always name one—it prevents your policy from going to your estate." },
  { category: "beneficiaries", question: "Can I change my beneficiary?", answer: "Yes, anytime (unless your policy has an irrevocable beneficiary, which is rare). Submit a beneficiary change form to your insurer. Keep it updated after major life events." },
  { category: "beneficiaries", question: "Should I name my minor children as beneficiaries?", answer: "Not directly—minors can't legally receive insurance proceeds. Instead, set up a trust naming them as beneficiaries, or name an adult custodian under UTMA/UGMA laws." },
  { category: "beneficiaries", question: "Can my spouse be denied as beneficiary?", answer: "In community property states, your spouse may have automatic rights to be named. In other states, you can name anyone, but a disinherited spouse may have legal recourse." },
  { category: "beneficiaries", question: "What happens if I don't name a beneficiary?", answer: "The death benefit goes to your estate. This triggers probate (delays, legal fees), exposes the money to creditors, and may cause estate taxes. Always name a beneficiary." },

  // ==================== CLAIMS ====================
  { category: "claims", question: "How do I file a life insurance claim?", answer: "Contact the insurer's claims department. Submit: claim form, certified death certificate, policy documents, and beneficiary identification. Most claims are paid within 30-60 days." },
  { category: "claims", question: "Can a life insurance claim be denied?", answer: "Yes. Common reasons: death during contestability period with material misrepresentation, policy lapse due to non-payment, suicide within first 2 years, or death from an excluded cause." },
  { category: "claims", question: "What is the contestability period?", answer: "The first 2 years of a policy when the insurer can investigate and deny claims for material misrepresentation (lies) on the application. After 2 years, only fraud can void a policy." },
  { category: "claims", question: "How long does it take to receive a life insurance payout?", answer: "Most claims are paid within 30-60 days of receiving required documents. Delays occur if: documents are incomplete, death is under investigation, or the claim is during the contestability period." },
  { category: "claims", question: "How are life insurance proceeds paid out?", answer: "Options usually include: lump sum (most common), installment payments, retained asset account (held by insurer, earns interest), or annuity (converted to income stream). Beneficiaries choose." },
  { category: "claims", question: "Can creditors take life insurance proceeds?", answer: "Generally no—life insurance proceeds paid to a named beneficiary are protected from the deceased's creditors. However, if paid to the estate, creditors may have claims." }
];

async function migrateContent() {
  console.log("Starting content migration...\n");

  try {
    // Check if tables exist by trying to query them
    console.log("Checking database tables...");

    // Migrate blog posts
    console.log("\n--- Migrating Blog Posts ---");
    let blogCount = 0;

    for (const post of hardcodedBlogPosts) {
      try {
        // Check if post already exists
        const existing = await db
          .select()
          .from(blogPosts)
          .where(sql`${blogPosts.slug} = ${post.slug}`)
          .limit(1);

        if (existing.length > 0) {
          console.log(`  Skipping (exists): ${post.slug}`);
          continue;
        }

        // Insert the post
        await db.insert(blogPosts).values({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          author: post.author,
          readTimeMinutes: post.readTimeMinutes,
          featuredImage: post.featuredImage,
          isFeatured: post.isFeatured,
          status: "published",
          publishedAt: new Date(),
          metaTitle: post.title,
          metaDescription: post.excerpt,
        });

        blogCount++;
        console.log(`  Migrated: ${post.slug}`);
      } catch (err) {
        console.error(`  Error migrating ${post.slug}:`, err);
      }
    }

    console.log(`\nBlog posts migrated: ${blogCount}/${hardcodedBlogPosts.length}`);

    // Migrate FAQs
    console.log("\n--- Migrating FAQs ---");
    let faqCount = 0;

    for (let i = 0; i < hardcodedFaqs.length; i++) {
      const faq = hardcodedFaqs[i];
      try {
        // Generate a slug from the question
        const slug = faq.question
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .substring(0, 100);

        // Check if FAQ already exists
        const existing = await db
          .select()
          .from(faqs)
          .where(sql`${faqs.slug} = ${slug}`)
          .limit(1);

        if (existing.length > 0) {
          console.log(`  Skipping (exists): ${slug}`);
          continue;
        }

        // Insert the FAQ
        await db.insert(faqs).values({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          slug: slug,
          sortOrder: i + 1,
          status: "published",
          publishedAt: new Date(),
        });

        faqCount++;
        console.log(`  Migrated: ${slug}`);
      } catch (err) {
        console.error(`  Error migrating FAQ ${i}:`, err);
      }
    }

    console.log(`\nFAQs migrated: ${faqCount}/${hardcodedFaqs.length}`);

    console.log("\n✅ Migration complete!");

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
migrateContent();
