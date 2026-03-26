import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Heart,
  TrendingUp,
  Users,
  Home,
  PiggyBank,
  CheckCircle2,
  ChevronDown,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RADIUS, SHADOW } from "@/lib/heritageDesignSystem";

const SERIF = "'Playfair Display', serif";
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b";

// Icon mapping from string names
const ICON_MAP: Record<string, typeof Shield> = {
  Shield, Heart, TrendingUp, Users, Home, PiggyBank,
};

// Full product guide data (matches AgentResources.tsx)
const productGuides = [
  {
    id: "term",
    title: "Term Life Insurance",
    iconName: "Shield",
    description: "Affordable, straightforward life insurance coverage designed to protect your family during your most critical financial years — when your mortgage is active, your children are growing, and your income matters most.",
    keyPoints: ["10, 15, 20 & 30-year terms available", "Most affordable life insurance option", "Convertible to permanent coverage", "No cash value — pure protection", "Living benefits riders included"],
    detailedContent: {
      targetMarket: "Term life insurance is the most popular choice for families who need reliable, affordable protection. It's ideal for parents with young children, homeowners paying a mortgage, anyone with outstanding debts like student loans or car payments, single-income households where one earner supports the family, and business owners who need key person coverage during growth years.",
      idealClient: "If you're between 25 and 55 years old, have people who depend on your income, and want the maximum amount of coverage for the lowest possible premium — term life is built for you. Most families choose coverage amounts between $250,000 and $1,000,000, which can often be secured for less than $1/day depending on your age and health.",
      keyBenefits: [
        "Lowest cost per dollar of coverage — Term life offers the most death benefit protection for the lowest premium. A healthy 30-year-old can often secure $500,000 in coverage for $20-30/month.",
        "Level premiums guaranteed for the full term — Your monthly payment is locked in from day one and will never increase, whether you choose a 10, 15, 20, or 30-year term. This makes budgeting simple and predictable.",
        "Conversion privilege to permanent insurance — Most term policies allow you to convert to a whole life or universal life policy without taking a new medical exam. This gives you flexibility to upgrade your coverage as your financial situation improves.",
        "Living benefits / accelerated death benefit riders — If you're diagnosed with a chronic, critical, or terminal illness during your policy, you can access a portion of your death benefit while you're still alive to help cover medical expenses, lost income, or any other needs.",
        "Flexible term lengths to match your needs — Choose a 10-year term to cover a short-term obligation, a 20-year term to protect your family while children are growing, or a 30-year term to cover your full mortgage and working years.",
        "Quick and simple application process — Many of our carriers offer accelerated underwriting, which means you can be approved in as little as 24-48 hours without a medical exam, depending on your age and coverage amount.",
        "Immediate financial protection for your family — From the day your policy is active, your beneficiaries receive the full death benefit tax-free if something happens to you. There's no waiting period or reduced benefit in the first years.",
      ],
      commonObjections: [
        { objection: "What if I outlive my term policy?", response: "This is actually the best outcome — it means you and your family were protected during your most financially vulnerable years. When your term ends, you have options: you can renew on a year-to-year basis, convert to a permanent policy without a new medical exam, or simply let the coverage end if your financial obligations (mortgage, kids' education, etc.) have been met. Many clients choose to convert a portion of their coverage to permanent insurance as they approach the end of their term." },
        { objection: "What happens when my term expires?", response: "Your policy includes a guaranteed renewal option, which means you can continue coverage on a year-by-year basis (at a higher premium based on your current age). More importantly, most policies include a conversion privilege that lets you switch to a permanent policy — whole life or universal life — without any medical questions or exams. We recommend reviewing your options 2-3 years before your term ends so we can plan the best transition." },
        { objection: "Term life doesn't build cash value — am I wasting money?", response: "Term insurance is pure protection, and that's exactly what makes it powerful. The significantly lower premiums mean you can afford more coverage when your family needs it most. The money you save compared to a whole life premium can be invested in your 401(k), IRA, or other accounts where it may grow even faster. Think of term life like your homeowner's insurance — you don't expect a return on it, but you'd never go without it." },
        { objection: "How much coverage do I actually need?", response: "A common guideline is 10-12x your annual income, but the right amount depends on your specific situation. Consider your mortgage balance, outstanding debts, how many years until your children are independent, your spouse's income, and future expenses like college tuition. We'll walk through a detailed needs analysis together to find the exact right amount — there's no one-size-fits-all answer." },
        { objection: "I'm young and healthy — do I really need this now?", response: "That's actually the best time to get coverage. Your age and health are the two biggest factors in your premium, and they only go in one direction. Locking in a rate now while you're healthy means you'll pay the lowest possible premium for the entire term. A 30-year-old pays roughly half what a 40-year-old pays for the same coverage. Plus, if a health issue develops later, you may not qualify at all." },
        { objection: "Can I get coverage if I have health issues?", response: "Yes — many of our carriers specialize in covering people with common health conditions like high blood pressure, diabetes, high cholesterol, sleep apnea, and more. While your premium may be higher than someone in perfect health, we work with multiple carriers to find the most competitive rate for your specific situation. Some carriers are more lenient on certain conditions than others, and that's where our expertise adds real value." },
      ],
      carriers: ["Lincoln Financial", "Transamerica", "Americo", "Corebridge", "Ethos", "Ladder"],
    },
  },
  {
    id: "whole",
    title: "Whole Life Insurance",
    iconName: "Heart",
    description: "Permanent life insurance that provides lifelong protection with guaranteed cash value growth. Whole life is the foundation of a comprehensive financial plan — offering a guaranteed death benefit, predictable premiums, and a savings component that grows tax-deferred over time.",
    keyPoints: ["Coverage that lasts your entire lifetime", "Guaranteed cash value accumulation", "Fixed premiums that never increase", "Tax-advantaged policy loans", "Potential annual dividends from mutual carriers"],
    detailedContent: {
      targetMarket: "Whole life insurance is designed for individuals and families who want permanent protection that never expires. It's particularly valuable for parents who want to leave a guaranteed inheritance, business owners needing buy-sell agreement funding or key person coverage, individuals with estate planning needs including estate tax liquidity, families with special needs dependents who will require lifelong financial support, and anyone who wants a conservative, guaranteed savings vehicle alongside their life insurance protection.",
      idealClient: "If you're between 30 and 60 years old with stable income and want coverage that builds equity over time while providing a guaranteed death benefit — whole life is an excellent fit. It's ideal for people who value certainty and guarantees over market-based speculation, and who appreciate knowing exactly what their premium, cash value, and death benefit will be every single year.",
      keyBenefits: [
        "Guaranteed death benefit that never expires — Unlike term insurance, your whole life policy remains in force for your entire life as long as premiums are paid. Your beneficiaries will receive the full, tax-free death benefit whether you pass away at 65 or 95.",
        "Guaranteed cash value growth every year — A portion of every premium payment goes into your policy's cash value account, which grows at a guaranteed rate set by the insurance company. This isn't subject to market fluctuations — your cash value can never decrease.",
        "Level premiums locked in for life — Your premium is set when you purchase the policy and will never increase, regardless of changes in your health, age, or market conditions. This makes long-term financial planning simple and predictable.",
        "Tax-free policy loans for any purpose — You can borrow against your cash value at any time without a credit check, income verification, or tax consequences. Use it for emergencies, opportunities, education expenses, or supplemental retirement income.",
        "Potential participating dividends — Policies from mutual insurance companies may pay annual dividends based on the company's financial performance. Dividends can be taken as cash, used to reduce premiums, left to accumulate interest, or used to purchase additional paid-up coverage that increases your death benefit.",
        "Creditor protection in many states — In numerous states, the cash value of a life insurance policy is protected from creditors and lawsuits, making whole life a valuable asset protection tool for business owners and professionals.",
        "Paid-up insurance option — After enough cash value has accumulated, some policies allow you to stop paying premiums entirely while maintaining a reduced paid-up death benefit. Your coverage continues without any further out-of-pocket cost.",
        "Supplement retirement income — The cash value you've built over decades can be accessed through policy loans during retirement, providing a tax-free income stream that doesn't affect your Social Security benefits or Medicare premiums.",
      ],
      commonObjections: [
        { objection: "Whole life premiums are much higher than term — why pay more?", response: "The premium difference exists because whole life provides permanent coverage plus a guaranteed savings component. When you compare the total cost over 30+ years, term insurance premiums are 'spent' with nothing to show at the end, while whole life builds significant cash value you can access. Many clients use a combination strategy — term for their highest coverage needs and whole life as a permanent foundation that builds wealth over time." },
        { objection: "Can't I just buy term and invest the difference?", response: "This is a popular strategy in theory, but studies show most people don't actually invest the difference — they spend it. Whole life forces disciplined savings with guaranteed growth. Additionally, the cash value grows tax-deferred, policy loans are tax-free, and the death benefit passes income tax-free to beneficiaries. When you factor in taxes on investment gains, the guaranteed nature of whole life, and the additional death benefit, the comparison is much closer than it appears on paper." },
        { objection: "I don't think I need coverage for my whole life", response: "Consider this: final expenses average $10,000-$15,000, outstanding debts don't disappear when you pass, and many families face estate settlement costs. Beyond that, whole life creates a guaranteed legacy for your children or grandchildren and can fund charitable giving goals. The cash value also serves as a financial resource during your lifetime — think of it as coverage that works for you while you're alive AND protects your family after you're gone." },
        { objection: "What if I need to stop paying premiums?", response: "Whole life policies offer several options if your financial situation changes. You can use accumulated dividends to cover premiums, take a reduced paid-up policy that requires no further premiums, borrow against your cash value to pay premiums temporarily, or surrender the policy and receive your full cash value. These built-in guarantees are part of what makes whole life so flexible despite its reputation as a rigid product." },
        { objection: "How long before the cash value becomes meaningful?", response: "Cash value growth is strongest in the later years of the policy due to compounding. In the first 5-10 years, cash value builds steadily but modestly. By years 15-20, the compounding effect accelerates significantly. Many clients see their cash value equal or exceed their total premiums paid around years 15-20, depending on the carrier and dividend performance. The key is to think of whole life as a long-term financial tool — the longer you hold it, the more powerful it becomes." },
      ],
      carriers: ["Ethos", "Baltimore Life", "Royal Neighbors", "Polish Falcons", "Transamerica"],
    },
  },
  {
    id: "iul",
    title: "Indexed Universal Life",
    iconName: "TrendingUp",
    description: "A flexible permanent life insurance policy that combines lifelong death benefit protection with a cash value component linked to stock market index performance — giving you the potential for market-like growth with built-in protection against market losses.",
    keyPoints: ["Cash value linked to S&P 500 and other indices", "0% floor — your cash value never loses to market drops", "Tax-free policy loans for retirement income", "Flexible premium payments", "Adjustable death benefit", "Living benefits riders available"],
    detailedContent: {
      targetMarket: "Indexed Universal Life is designed for financially savvy individuals who want more growth potential than whole life offers while maintaining downside protection. It's ideal for high-income earners who have maxed out their 401(k) and IRA contributions and need additional tax-advantaged retirement savings, business owners looking for tax-efficient executive benefits or supplemental retirement plans, professionals in their peak earning years who want to build significant tax-free retirement income, and families who want permanent coverage with the flexibility to adjust premiums and death benefits as their needs change over time.",
      idealClient: "If you're between 30 and 55 years old, earn $100,000 or more annually, and are looking for a financial vehicle that provides life insurance protection while building tax-advantaged wealth with growth potential — IUL deserves a serious look. It's particularly powerful when used as a supplemental retirement income strategy alongside your existing 401(k) and investment accounts.",
      keyBenefits: [
        "Market-linked growth with downside protection — Your cash value is credited interest based on the performance of one or more market indices (such as the S&P 500, Nasdaq-100, or Russell 2000). When the index goes up, your cash value is credited a return up to the cap rate. When the market goes down, your cash value is protected by a 0% floor — meaning you never lose money due to market declines.",
        "Tax-free retirement income through policy loans — One of the most powerful features of IUL is the ability to access your cash value through tax-free policy loans during retirement. Unlike 401(k) or IRA withdrawals which are taxed as ordinary income, IUL policy loans have no tax consequences and don't increase your taxable income, affect your Social Security taxation thresholds, or impact your Medicare premiums.",
        "Flexible premium payments — Unlike whole life where premiums are fixed, IUL allows you to pay more when you can afford to (accelerating cash value growth) and less during lean years, as long as the policy has sufficient cash value to cover the cost of insurance. This flexibility makes IUL adaptable to changing financial circumstances.",
        "Adjustable death benefit — You can increase or decrease your death benefit as your needs change. Need more coverage when you buy a home or have another child? Increase it. Want to reduce coverage and lower costs as your mortgage is paid off? You can do that too.",
        "Multiple index strategy options — Most IUL policies let you allocate your cash value across multiple index accounts and a fixed account, allowing you to diversify your crediting strategy. Some carriers offer uncapped strategies with participation rates, giving you more exposure to market growth.",
        "Living benefits and accelerated death benefit — If you're diagnosed with a chronic, critical, or terminal illness, you can access a portion of your death benefit while still living. This provides crucial financial support during a health crisis without touching your other assets.",
        "Premium financing potential — For high-net-worth individuals, IUL policies can be funded through premium financing arrangements, allowing you to leverage borrowed funds to build substantial tax-free wealth inside the policy.",
        "Estate planning tool — The death benefit passes income tax-free to your beneficiaries and can be structured inside an irrevocable life insurance trust (ILIT) to also avoid estate taxes, providing maximum wealth transfer to the next generation.",
      ],
      commonObjections: [
        { objection: "The cap limits how much I can earn — isn't that a bad deal?", response: "The cap is the trade-off for having a 0% floor that protects you from market losses. Consider a real-world example: if the S&P 500 returns +22%, -15%, +18%, +10% over four years, a direct market investment would have significant volatility. An IUL with a 10% cap and 0% floor would credit 10%, 0%, 10%, 10% — a smooth, consistent growth pattern with no negative years. Over time, avoiding losses can be just as powerful as capturing gains. The tortoise often beats the hare." },
        { objection: "IUL seems too complicated — I don't understand it", response: "The concept is actually simple: your money grows when the market goes up (up to a cap), and it's protected when the market goes down (0% floor). That's it — heads you win, tails you don't lose. The rest is just details about how much you put in, how the interest is calculated, and how you take money out. We'll walk through an illustration specific to your age, income, and goals so you can see exactly how it works with real numbers." },
        { objection: "I've heard the fees inside IUL policies are really high", response: "IUL policies do have internal costs — primarily the cost of insurance (which covers your death benefit) and administrative charges. These costs are transparent and shown in every illustration. The key question isn't just what the fees are, but what the net result is. When you compare the after-tax net returns of an IUL to the after-tax returns of a taxable investment account, the IUL often comes out ahead because of tax-free growth, tax-free access, and tax-free death benefit. We'll run a side-by-side comparison specific to your tax bracket." },
        { objection: "What happens if the market is flat or down for a long time?", response: "This is where the 0% floor protects you — in flat or down markets, your cash value simply stays level rather than losing money. Your cost of insurance is still deducted, but you're not compounding losses like you would in a direct market investment. Historically, markets have always recovered and continued to grow over long periods. The key is funding the policy adequately in the early years so the cash value has a strong foundation to weather any market conditions." },
        { objection: "I've already maxed out my 401(k) — why do I need this?", response: "That's exactly why IUL is valuable. Once you've maxed your 401(k) ($23,500/year in 2025) and IRA ($7,000/year), there are very few tax-advantaged options left. IUL has no contribution limits from a tax perspective — you can fund it with significantly more per year. The cash value grows tax-deferred, and you access it tax-free through policy loans. For high earners, this creates a 'tax-free bucket' of retirement income that provides tremendous flexibility in managing your tax liability throughout retirement." },
        { objection: "What if I need to stop paying premiums?", response: "IUL is designed with flexibility in mind. If you need to reduce or stop premiums temporarily, the policy can continue as long as there's sufficient cash value to cover the monthly cost of insurance. If you've funded the policy well in the early years, it may be able to sustain itself for years without additional premiums. You can also take partial withdrawals or policy loans from the cash value if you need access to funds." },
      ],
      carriers: ["Lincoln Financial", "Corebridge", "Americo", "Transamerica"],
    },
  },
  {
    id: "final-expense",
    title: "Final Expense Insurance",
    iconName: "Users",
    description: "A simplified whole life insurance policy designed specifically to cover end-of-life costs so your family never has to worry about funeral expenses, medical bills, or outstanding debts. With no medical exams required and simplified health questions, final expense insurance makes it easy to get the coverage you need — regardless of your age or health history.",
    keyPoints: ["No medical exam required", "Simple health questions only", "Coverage from $5,000 to $50,000", "Premiums never increase", "Benefits paid within 24-48 hours", "Permanent coverage that never expires"],
    detailedContent: {
      targetMarket: "Final expense insurance is designed for seniors and older adults who want to make sure their family isn't left with a financial burden when they pass. It's the right choice for adults ages 50-85 who want affordable, permanent life insurance, individuals on a fixed income (Social Security, pension, retirement savings) who need budget-friendly coverage, people with health conditions like diabetes, heart disease, COPD, or cancer history who may not qualify for traditional life insurance, anyone who wants to pre-plan and cover their funeral and burial costs, and families who want to protect loved ones from unexpected end-of-life expenses.",
      idealClient: "If you're between 50 and 85 years old and want a simple, affordable policy that ensures your family won't pay out of pocket for your final expenses — this coverage is built for you. Most clients choose between $10,000 and $25,000 in coverage, which typically costs between $30 and $80 per month depending on your age and health. The application takes about 15-20 minutes and you can be approved the same day.",
      keyBenefits: [
        "No medical exam required — ever — Final expense policies use simplified underwriting, which means no blood tests, no urine samples, no doctor visits. You'll answer a short set of health questions (usually 10-15 yes/no questions), and that's it. This makes coverage accessible to people who might not qualify for traditional life insurance.",
        "Coverage amounts designed for real costs — The average funeral in the United States costs between $8,000 and $12,000, and that doesn't include cemetery plots, headstones, flowers, or other expenses. Final expense coverage typically ranges from $5,000 to $50,000, giving you enough to cover funeral costs plus any remaining medical bills, credit card debt, or other final obligations.",
        "Premiums are locked in and never increase — Your monthly premium is guaranteed from the day your policy starts and will never go up, no matter how old you get or if your health changes. This makes it easy to budget on a fixed income.",
        "Death benefit paid quickly to your beneficiary — Most carriers pay the death benefit within 24-48 hours of receiving the claim. Your beneficiary receives a tax-free lump sum that they can use for any purpose — funeral costs, bills, or anything else they need.",
        "Your beneficiary — not a funeral home — controls the money — Unlike pre-paid funeral plans that lock you into one funeral home and one set of arrangements, final expense insurance pays your named beneficiary directly. They have complete flexibility to use the funds however they see fit.",
        "Permanent coverage that never expires — Final expense is a whole life policy, which means it stays in force for your entire life as long as premiums are paid. You'll never have to worry about your coverage running out or being canceled due to age.",
        "Builds small cash value over time — Like all whole life policies, final expense insurance accumulates cash value that you can borrow against if needed during your lifetime. While the amounts are modest, it provides an additional safety net.",
        "Day-one full coverage available — Many carriers offer immediate, full death benefit coverage from the first day your policy is active. Some policies for higher-risk applicants may have a graded benefit (partial payout in the first 2 years), but we'll match you with the best option for your specific health situation.",
      ],
      commonObjections: [
        { objection: "I don't want to burden my family with expenses when I'm gone — but I also can't afford much", response: "That's exactly why final expense insurance exists. The average funeral costs $8,000-$12,000, and if your family doesn't have those funds readily available, they may have to go into debt, start a GoFundMe, or make difficult compromises on your arrangements. Final expense coverage can start as low as $20-30 per month — less than many people spend on streaming services or a few cups of coffee per week. It's one of the most affordable ways to ensure your family is taken care of." },
        { objection: "I already have a burial policy or pre-paid funeral plan", response: "It's great that you've planned ahead. Let's review what you have to make sure it's still adequate. Pre-paid funeral plans often lock you into one specific funeral home and don't adjust for cost increases over time. Many older policies were written for $3,000-$5,000, which doesn't come close to covering today's costs. A final expense policy can supplement what you already have and gives your family the flexibility to make their own arrangements." },
        { objection: "I have health problems — I probably can't qualify", response: "Final expense insurance is specifically designed for people with health conditions. Our carriers work with clients who have diabetes, heart disease, high blood pressure, COPD, arthritis, depression, and many other conditions. Even if you've been turned down before, we have carriers that specialize in these situations. Some may offer graded benefits (a two-year waiting period for the full death benefit), but many clients qualify for immediate, full coverage. Let's go through the health questions together — you might be surprised at what's available." },
        { objection: "My kids said they'll take care of everything", response: "Your children's willingness to help shows what a wonderful family you have. But end-of-life expenses can put unexpected financial strain on even the most well-intentioned families. Between funeral costs, outstanding medical bills, and time off work to handle arrangements, the total burden can easily exceed $15,000-$20,000. Having a final expense policy means your family can honor you properly without financial stress — it's one of the most loving things you can do for them." },
        { objection: "I'm too old for life insurance", response: "Most of our final expense carriers accept applicants up to age 85, and some go even higher. Your premium will be based on your current age, but it's locked in from there — it will never go up. The longer you wait, the higher the premium will be, so the best time to apply is right now. Many of our clients in their 70s and 80s are approved and grateful they took this step." },
        { objection: "What's the difference between final expense and regular life insurance?", response: "Final expense is a type of whole life insurance designed specifically for smaller coverage amounts ($5,000-$50,000) with simplified underwriting — no medical exam, just health questions. Traditional life insurance typically requires a full medical exam and is designed for larger coverage amounts ($100,000+). Final expense is perfect for covering end-of-life costs, while traditional policies are designed for income replacement and major financial obligations." },
      ],
      carriers: ["Mutual of Omaha", "American Home Life", "Americo", "Baltimore Life", "Royal Neighbors"],
    },
  },
  {
    id: "mortgage",
    title: "Mortgage Protection Insurance",
    iconName: "Home",
    description: "Life insurance specifically designed to ensure your family can keep their home if something happens to you. Mortgage protection pays off or covers your mortgage balance, so your loved ones never have to worry about losing the roof over their heads during the most difficult time of their lives.",
    keyPoints: ["Pays off your mortgage if you pass away", "Living benefits if you become critically ill", "Coverage your family controls — not the bank", "Level or decreasing benefit options", "Portable — stays with you if you move or refinance", "No mortgage clause restrictions"],
    detailedContent: {
      targetMarket: "Mortgage protection insurance is essential for anyone with a home loan who wants to make sure their family can stay in their home no matter what happens. It's especially important for families where one income pays the majority of the mortgage, new homeowners who just took on a 15 or 30-year mortgage commitment, parents with children in school who need stability and continuity, anyone who recently refinanced and has a new or larger mortgage balance, dual-income families where both incomes are needed to cover the mortgage, and self-employed individuals who don't have employer-provided group life insurance.",
      idealClient: "If you're between 25 and 60 years old, own a home with a mortgage, and have family members who depend on that home as their primary residence — mortgage protection gives you peace of mind that your family's home is secure. Most homeowners choose a coverage amount equal to their remaining mortgage balance, typically between $150,000 and $500,000.",
      keyBenefits: [
        "Your mortgage gets paid off if something happens to you — The primary purpose of mortgage protection is simple: if you pass away, the death benefit covers your remaining mortgage balance so your family can stay in their home without the burden of monthly payments. Your family keeps the home free and clear.",
        "Living benefits protect you while you're alive — Unlike basic life insurance, mortgage protection includes living benefits riders that provide financial support if you're diagnosed with a chronic illness (unable to perform daily activities), critical illness (heart attack, stroke, cancer), or terminal illness. You can access a portion of your death benefit to cover your mortgage while you focus on recovery.",
        "Your family controls the money — not the bank — This is a critical difference from bank-offered mortgage insurance. Bank mortgage insurance pays the LENDER, reducing their risk. Mortgage protection insurance pays YOUR BENEFICIARY, who can use the money however they see fit — pay off the mortgage, cover living expenses, pay medical bills, or any combination. Your family has complete control.",
        "Coverage moves with you — If you sell your home and buy a new one, or refinance your mortgage, your policy stays in force. It's tied to YOU, not to a specific property or lender. Bank mortgage insurance, by contrast, typically ends if you refinance.",
        "Level death benefit option — While bank mortgage insurance decreases as your loan balance decreases (meaning you pay the same premium for less coverage over time), mortgage protection can be structured with a LEVEL death benefit. This means your coverage stays the same even as your mortgage balance decreases — giving your family extra financial cushion in later years.",
        "No employer dependency — Group life insurance through your employer typically ends when you leave your job. If you change careers, get laid off, or retire, that coverage disappears. Mortgage protection is a personal policy that stays with you regardless of your employment situation.",
        "Affordable coverage tailored to your mortgage — Premiums are based on your age, health, and coverage amount. Most families can protect their mortgage for significantly less than 1% of their monthly mortgage payment. For a $300,000 mortgage, coverage might cost $40-80/month depending on your age.",
        "Fast approval and easy application — Many of our carriers offer streamlined underwriting for mortgage protection, with approvals in as little as 24-48 hours. No lengthy medical exams or complex paperwork.",
      ],
      commonObjections: [
        { objection: "I already have life insurance through my employer", response: "Employer group life insurance is a great benefit, but it comes with a critical limitation: it's tied to your job. If you're laid off, change careers, retire, or your employer drops the benefit, your coverage disappears — often exactly when you need it most. Additionally, most employer plans only offer 1-2x your salary, which may not cover your full mortgage balance plus your family's other financial needs. Mortgage protection is portable, permanent, and specifically designed to cover your home." },
        { objection: "My bank already offered me mortgage insurance when I closed", response: "Bank-offered mortgage insurance (also called mortgage life insurance or creditor insurance) has several disadvantages compared to individual mortgage protection. First, bank insurance pays the LENDER — not your family. Your family has no say in how the money is used. Second, the coverage decreases as your mortgage balance goes down, but your premium stays the same — you're paying more for less over time. Third, bank insurance typically ends if you refinance. Individual mortgage protection pays your family directly, can maintain a level benefit, and stays with you regardless of your mortgage." },
        { objection: "We'd just sell the house if something happened", response: "Selling a home during a family crisis is one of the most stressful decisions a family can face. Your spouse would need to manage a sale while grieving — dealing with realtors, showings, negotiations, and moving — all while potentially handling child care and funeral arrangements. The housing market may be unfavorable, forcing a sale at a loss. Children would be uprooted from their schools and friends during an already traumatic time. Mortgage protection eliminates this scenario entirely — your family gets to keep their home, their neighborhood, their community, and their stability." },
        { objection: "I can't afford another monthly payment", response: "Consider this: your mortgage is likely your family's largest monthly expense. If your income suddenly disappeared, could your family cover that payment? Mortgage protection for a $300,000 home might cost $40-80/month — roughly the cost of a few meals out. Compare that to the $1,500-$3,000/month your family would need to continue making mortgage payments without your income. It's a small investment that protects your family's largest financial commitment." },
        { objection: "My spouse works too — we'd be fine on one income", response: "Many dual-income families rely on both incomes to maintain their lifestyle and cover the mortgage. Even if your spouse could technically afford the mortgage alone, losing one income often means cutting back on everything else — retirement savings, children's activities, vacations, emergency fund contributions. Mortgage protection ensures your family maintains their standard of living rather than just surviving. It protects their future, not just the immediate crisis." },
        { objection: "What about the living benefits — do I really need those?", response: "Living benefits are one of the most valuable features of mortgage protection that most people don't know about. Consider: if you had a heart attack, stroke, or cancer diagnosis and couldn't work for 6-12 months, who would pay your mortgage? Disability insurance may cover a portion of your income, but the living benefits on your mortgage protection policy let you access your death benefit while you're alive to keep your mortgage current. Over 50% of all mortgage foreclosures are caused by a medical crisis — not death — making living benefits potentially more important than the death benefit itself." },
      ],
      carriers: ["Transamerica", "Mutual of Omaha", "Lincoln Financial", "Americo", "Corebridge"],
    },
  },
  {
    id: "annuities",
    title: "Fixed & Indexed Annuities",
    iconName: "PiggyBank",
    description: "Annuities are financial products designed to help you save for retirement and provide guaranteed income that you can never outlive. Whether you want safe, predictable growth with a fixed annuity or market-linked potential with downside protection through an indexed annuity — these products provide the security and stability that other investments simply can't guarantee.",
    keyPoints: ["Principal protection — your money can never decrease due to market losses", "Tax-deferred growth until you withdraw", "Guaranteed lifetime income options", "No contribution limits like 401(k)s and IRAs", "Avoids probate — passes directly to beneficiaries", "Multiple index strategies available"],
    detailedContent: {
      targetMarket: "Annuities are ideal for individuals who are approaching or in retirement and want to secure guaranteed income, conservative savers who want growth potential without the risk of market losses, anyone who has maxed out their 401(k) and IRA contributions and wants additional tax-deferred savings, retirees concerned about outliving their savings, individuals who want to protect a portion of their portfolio from market volatility, people who have received a lump sum (inheritance, home sale, business sale) and want to grow it safely, and anyone seeking a predictable, guaranteed income stream to cover essential expenses in retirement.",
      idealClient: "If you're between 50 and 75 years old, have savings in qualified accounts (401(k), IRA) or non-qualified funds that you want to protect and grow, and are looking for a guaranteed income stream in retirement — annuities provide the certainty that market-based investments cannot. Most clients allocate a portion of their retirement savings to an annuity to cover essential expenses (housing, food, healthcare, utilities) while keeping other assets invested for growth.",
      keyBenefits: [
        "Principal protection — your money is safe — With a fixed or indexed annuity, your principal is guaranteed by the insurance company. Unlike stocks, mutual funds, or even bonds, your account value can never decrease due to market performance. In a fixed annuity, you earn a guaranteed interest rate. In an indexed annuity, your returns are linked to market index performance with a 0% floor — when the market drops, your value stays the same.",
        "Tax-deferred growth accelerates compounding — Money inside an annuity grows tax-deferred, meaning you don't pay taxes on the gains each year. This allows your money to compound faster than it would in a taxable account where annual gains are reduced by capital gains taxes. You only pay taxes when you make withdrawals, and by then you may be in a lower tax bracket.",
        "Guaranteed lifetime income you can never outlive — One of the biggest risks in retirement is running out of money. A lifetime income rider on an annuity guarantees that you'll receive a monthly or annual payment for as long as you live — even if your account value reaches zero. This creates a personal pension that provides the same security as Social Security but at a level you choose.",
        "Indexed annuities offer market-linked growth without market risk — Indexed annuities credit interest based on the performance of stock market indices like the S&P 500. When the index goes up, you earn interest (up to a cap or based on a participation rate). When the index goes down, you earn 0% — never a negative return. This 'heads I win, tails I don't lose' approach provides growth potential with complete downside protection.",
        "No contribution limits — Unlike 401(k) plans ($23,500/year limit) and IRAs ($7,000/year limit), annuities have no IRS contribution limits. You can deposit $50,000, $250,000, or more into an annuity in a single premium payment. This makes annuities an excellent tool for people with large sums to protect — whether from a home sale, inheritance, business sale, or years of disciplined saving.",
        "Avoids probate — passes directly to named beneficiaries — Annuity proceeds pass directly to your named beneficiaries without going through probate court. This means faster distribution, lower legal costs, and privacy for your estate. Your beneficiaries typically receive the funds within days rather than the months or years that probate can take.",
        "Penalty-free annual withdrawals — Most annuity contracts allow you to withdraw up to 10% of your account value each year without any surrender charges. This provides liquidity and access to your funds while still enjoying the tax-deferred growth benefits on the remaining balance.",
        "Multiple crediting strategies — Indexed annuities offer a variety of crediting strategies, including annual point-to-point (measures index change from one anniversary to the next), monthly averaging, and multi-year strategies. You can also allocate across multiple indices and a fixed account, creating a diversified approach within a single product.",
        "Bonus credits on select products — Some annuity products offer premium bonuses of 5-10% on your initial deposit. For example, a $100,000 deposit with a 10% bonus starts with $110,000 of credited value from day one. While bonus products may have longer surrender periods, the additional growth potential can be significant.",
      ],
      commonObjections: [
        { objection: "I don't want my money locked up — what if I need it?", response: "Annuities are designed as long-term savings vehicles, but they're not as illiquid as many people think. Most contracts allow penalty-free withdrawals of up to 10% of your account value each year. If you add a lifetime income rider, you can begin receiving guaranteed income payments at any time you choose. Surrender periods typically range from 5-10 years, after which you can access 100% of your funds without penalty. The key is to only place money in an annuity that you don't need for immediate short-term expenses — it should be part of a balanced retirement strategy, not your emergency fund." },
        { objection: "What about inflation — won't my purchasing power decrease?", response: "This is an important consideration, and there are several ways annuities address it. Indexed annuities are linked to stock market indices, which historically outpace inflation over time. Many lifetime income riders include annual increase options that grow your income by 3-5% per year. You can also ladder annuities — purchasing new contracts at different times to capture changing interest rates. The guaranteed income from an annuity is designed to cover your essential expenses, while other investments in your portfolio can be positioned for inflation-beating growth." },
        { objection: "Annuity fees are too high and eat into returns", response: "It's important to distinguish between different types of annuities. Fixed and indexed annuities — the type we offer — typically have NO annual management fees. That's right: zero. The insurance company earns its revenue from the spread between what they earn on invested premiums and what they credit to your account. The only potential fees are for optional riders (like a lifetime income guarantee, typically 0.95-1.25%/year) and surrender charges if you withdraw more than the free amount during the surrender period. Compare this to the 1-2% annual fees on many mutual funds and managed accounts, plus capital gains taxes on the growth — annuities are often more cost-efficient than people realize." },
        { objection: "I should just keep my money in the stock market for better returns", response: "The stock market has historically provided strong long-term returns — but with significant volatility. For money you'll need in retirement, sequence-of-returns risk is real: if the market drops 30-40% in the early years of your retirement (as it did in 2008 and 2020), withdrawing from a depleted portfolio can permanently damage your retirement security. An annuity provides a guaranteed foundation. Most financial professionals recommend having guaranteed income sources (Social Security + annuity) cover your essential expenses, while keeping growth investments for discretionary spending. It's not either/or — it's both working together." },
        { objection: "What happens if the insurance company goes bankrupt?", response: "Insurance companies are among the most heavily regulated financial institutions in the country. Each state has a guaranty association that protects policyholders — typically up to $250,000 per policy — similar to how FDIC protects bank deposits. The carriers we work with are all rated A or higher by AM Best, indicating strong financial stability and a track record of meeting obligations for decades. Additionally, insurance companies are required to maintain reserves that exceed their obligations to policyholders, providing an extra layer of security." },
        { objection: "I'm already getting Social Security — why do I need another income stream?", response: "Social Security was designed to replace about 40% of your pre-retirement income — and for many retirees, it covers even less. Consider your essential monthly expenses: housing, healthcare, food, utilities, transportation, and insurance. If Social Security covers $2,000-$3,000/month but your expenses are $4,000-$5,000/month, there's a gap that needs to be filled. An annuity with a lifetime income rider creates a personal pension that, combined with Social Security, can cover all of your essential expenses with guaranteed income. This means you'll never have to worry about running out of money, regardless of what the stock market does or how long you live." },
        { objection: "I'm too old to start an annuity", response: "Many of our annuity carriers accept applications from clients up to age 85 or even older. In fact, annuities can be especially valuable for older clients because the guaranteed income payments are higher (since they're based on a shorter life expectancy), you may want to protect savings from market risk now more than ever, and the probate avoidance benefit simplifies estate transfer for your heirs. Even a short-term fixed annuity (3-5 years) can provide a safe, guaranteed return that outperforms CDs and savings accounts while you plan the next phase of your financial strategy." },
      ],
      carriers: ["Athene", "Corebridge", "Lincoln Financial"],
    },
  },
];

interface GuideMeta {
  guideId: string;
  guideTitle: string;
  guideDescription: string;
  clientName: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  agentNpn: string;
}

export default function ProductGuide() {
  const params = useParams<{ linkId: string }>();
  const { linkId } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [guideMeta, setGuideMeta] = useState<GuideMeta | null>(null);
  const [guide, setGuide] = useState<(typeof productGuides)[0] | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const loadGuide = async () => {
      if (!linkId) { setIsNotFound(true); setIsLoading(false); return; }
      try {
        const response = await fetch(`/api/product-guides/${linkId}`);
        if (response.status === 404) { setIsNotFound(true); setIsLoading(false); return; }
        if (!response.ok) throw new Error("Failed to load guide");
        const data = await response.json();
        setGuideMeta(data);
        const fullGuide = productGuides.find(g => g.id === data.guideId);
        if (fullGuide) setGuide(fullGuide);
        else { setIsNotFound(true); }
        setIsLoading(false);
      } catch {
        setIsNotFound(true);
        setIsLoading(false);
      }
    };
    loadGuide();
  }, [linkId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fffaf3' }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg" style={{ fontFamily: SERIF }}>Loading your guide...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (isNotFound || !guide || !guideMeta) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fffaf3' }}>
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: SERIF }}>Guide Not Found</h2>
          <p className="text-gray-600">This guide link may have expired or is no longer available. Please contact your insurance agent for a new link.</p>
        </div>
      </div>
    );
  }

  const GuideIcon = ICON_MAP[guide.iconName] || BookOpen;
  const agentInitials = guideMeta.agentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const agentFirst = guideMeta.agentName.split(' ')[0];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffaf3' }}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* Heritage Header */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'rgba(255, 250, 243, 0.95)', backdropFilter: 'blur(12px)', borderColor: '#e8e0d5' }}>
        <div className="max-w-[800px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Heritage Life Solutions" className="w-8 h-8" style={{ borderRadius: 8 }} />
            <span className="text-sm font-semibold text-gray-800">Heritage Life Solutions</span>
          </div>
          <Badge className="bg-violet-100 text-violet-700 border-0 text-xs" style={{ borderRadius: RADIUS.pill }}>
            Product Guide
          </Badge>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-6 pb-16">
        {/* Agent Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6 mb-6"
        >
          <div className="flex items-center gap-4 p-4 bg-white border" style={{ borderRadius: RADIUS.card, borderColor: '#e8e0d5', boxShadow: SHADOW.card }}>
            <div
              className="w-14 h-14 flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ borderRadius: RADIUS.button, background: 'linear-gradient(135deg, #7c3aed 0%, #D4AF37 100%)' }}
            >
              {agentInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Prepared for you by</p>
              <p className="font-bold text-gray-900">{guideMeta.agentName}</p>
              <p className="text-sm text-violet-600 font-medium">Licensed Insurance Agent</p>
              {guideMeta.agentNpn && (
                <p className="text-xs text-gray-500">NPN: {guideMeta.agentNpn}</p>
              )}
            </div>
            <div className="hidden sm:flex flex-col gap-1 text-right">
              {guideMeta.agentPhone && (
                <a href={`tel:${guideMeta.agentPhone.replace(/[^0-9+]/g, '')}`} className="text-xs text-gray-600 hover:text-violet-600 flex items-center gap-1 justify-end">
                  <Phone className="w-3 h-3" /> {guideMeta.agentPhone}
                </a>
              )}
              <a href={`mailto:${guideMeta.agentEmail}`} className="text-xs text-gray-600 hover:text-violet-600 flex items-center gap-1 justify-end">
                <Mail className="w-3 h-3" /> {guideMeta.agentEmail}
              </a>
            </div>
          </div>
        </motion.div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 overflow-hidden"
          style={{ borderRadius: RADIUS.card, boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15)' }}
        >
          <div
            className="p-8 sm:p-10 text-center"
            style={{ background: 'linear-gradient(135deg, #292966 0%, #7c3aed 50%, #D4AF37 100%)' }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-white/15 backdrop-blur flex items-center justify-center" style={{ borderRadius: RADIUS.button }}>
              <GuideIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3" style={{ fontFamily: SERIF }}>
              {guide.title}
            </h1>
            <p className="text-white/80 text-lg mb-5">{guide.description}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {guide.keyPoints.map((point, idx) => (
                <Badge key={idx} className="bg-white/20 text-white border-0 backdrop-blur text-sm px-3 py-1" style={{ borderRadius: RADIUS.pill }}>
                  {point}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Product Overview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="bg-white border p-6 sm:p-8" style={{ borderRadius: RADIUS.card, borderColor: '#e8e0d5', boxShadow: SHADOW.card }}>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: SERIF }}>Who Is This For?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4" style={{ borderRadius: RADIUS.button, backgroundColor: '#f5f0e8' }}>
                <p className="text-xs font-semibold text-violet-700 mb-2 uppercase tracking-wide">Target Market</p>
                <p className="text-sm text-gray-700 leading-relaxed">{guide.detailedContent.targetMarket}</p>
              </div>
              <div className="p-4" style={{ borderRadius: RADIUS.button, backgroundColor: '#fef9ee' }}>
                <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">Ideal Candidate</p>
                <p className="text-sm text-gray-700 leading-relaxed">{guide.detailedContent.idealClient}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <div className="bg-white border p-6 sm:p-8" style={{ borderRadius: RADIUS.card, borderColor: '#e8e0d5', boxShadow: SHADOW.card }}>
            <h2 className="text-xl font-bold text-gray-900 mb-5" style={{ fontFamily: SERIF }}>Key Benefits</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {guide.detailedContent.keyBenefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-violet-50/60"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <CheckCircle2 className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Common Questions FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <div className="bg-white border p-6 sm:p-8" style={{ borderRadius: RADIUS.card, borderColor: '#e8e0d5', boxShadow: SHADOW.card }}>
            <h2 className="text-xl font-bold text-gray-900 mb-5" style={{ fontFamily: SERIF }}>Common Questions</h2>
            <div className="space-y-3">
              {guide.detailedContent.commonObjections.map((item, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div key={idx} className="border" style={{ borderRadius: RADIUS.button, borderColor: '#e8e0d5' }}>
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full text-left p-4 flex items-center justify-between cursor-pointer hover:bg-violet-50/50 transition-colors"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <span className="font-medium text-sm text-gray-900 pr-4">"{item.objection}"</span>
                      <ChevronDown className={cn("w-4 h-4 text-gray-400 flex-shrink-0 transition-transform", isOpen && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0">
                            <div className="p-3 bg-violet-50" style={{ borderRadius: RADIUS.input }}>
                              <p className="text-sm text-gray-700 leading-relaxed">{item.response}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Recommended Carriers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white border p-6 sm:p-8" style={{ borderRadius: RADIUS.card, borderColor: '#e8e0d5', boxShadow: SHADOW.card }}>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: SERIF }}>Our Recommended Carriers</h2>
            <p className="text-sm text-gray-600 mb-4">We work with top-rated, A-rated insurance carriers to ensure you get the best coverage and service.</p>
            <div className="flex flex-wrap gap-2">
              {guide.detailedContent.carriers.map((carrier, idx) => (
                <Badge
                  key={idx}
                  className="bg-gray-100 text-gray-700 border-0 text-sm px-3 py-1.5"
                  style={{ borderRadius: RADIUS.pill }}
                >
                  {carrier}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <div
            className="p-8 text-center text-white overflow-hidden"
            style={{ borderRadius: RADIUS.card, background: 'linear-gradient(135deg, #292966 0%, #7c3aed 100%)', boxShadow: '0 8px 32px rgba(41, 41, 102, 0.25)' }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: SERIF, color: '#ffffff' }}>Ready to Learn More?</h2>
            <p className="mb-6" style={{ color: 'rgba(255,255,255,0.8)' }}>I'm here to help you find the right coverage for your needs. Reach out anytime.</p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <div
                className="w-16 h-16 flex items-center justify-center text-white font-bold text-xl"
                style={{ borderRadius: RADIUS.button, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              >
                {agentInitials}
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">{guideMeta.agentName}</p>
                <p className="text-white/70 text-sm">Licensed Insurance Agent{guideMeta.agentNpn ? ` | NPN: ${guideMeta.agentNpn}` : ''}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {guideMeta.agentPhone && (
                <a href={`tel:${guideMeta.agentPhone.replace(/[^0-9+]/g, '')}`}>
                  <Button
                    className="bg-white text-violet-700 hover:bg-white/90 gap-2 font-semibold w-full sm:w-auto"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Phone className="w-4 h-4" />
                    Call {agentFirst}
                  </Button>
                </a>
              )}
              <a href={`mailto:${guideMeta.agentEmail}?subject=Question about ${guide.title}`}>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 gap-2 font-semibold w-full sm:w-auto"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Mail className="w-4 h-4" />
                  Email {agentFirst}
                </Button>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Heritage Footer */}
        <div className="text-center py-6 border-t" style={{ borderColor: '#e8e0d5' }}>
          <img src={LOGO_URL} alt="Heritage Life Solutions" className="w-8 h-8 mx-auto mb-2" style={{ borderRadius: 8 }} />
          <p className="text-xs text-gray-500 mb-1">Heritage Life Solutions</p>
          <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
            &copy; {new Date().getFullYear()} Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.
          </p>
          <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed mt-2">
            This guide is for informational purposes only and does not constitute a binding contract or guarantee of coverage. Final rates, terms, and coverage are subject to underwriting approval. Please review all policy documents carefully before making a decision.
          </p>
        </div>
      </main>
    </div>
  );
}
