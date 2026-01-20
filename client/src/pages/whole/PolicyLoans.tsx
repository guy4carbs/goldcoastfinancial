import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Banknote,
  ArrowRight,
  Phone,
  Shield,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  Star,
  Calculator,
  Clock,
  AlertTriangle,
  CreditCard,
  XCircle,
  Percent,
  FileCheck,
  TrendingDown,
  Wallet,
  RefreshCcw,
  Award
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function PolicyLoans() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loanAmount, setLoanAmount] = useState(20000);
  const [cashValue, setCashValue] = useState(50000);

  // Enhanced Loan Calculator State
  const [showLoanCalculator, setShowLoanCalculator] = useState(false);
  const [deathBenefit, setDeathBenefit] = useState(250000);
  const [loanInterestRate, setLoanInterestRate] = useState(6);
  const [loanYears, setLoanYears] = useState(10);

  // Calculate detailed loan impact over time
  const calculateLoanTimeline = () => {
    const timeline = [];
    let outstandingBalance = loanAmount;
    let currentDeathBenefit = deathBenefit;

    for (let year = 1; year <= loanYears; year++) {
      const yearlyInterest = Math.round(outstandingBalance * (loanInterestRate / 100));
      outstandingBalance += yearlyInterest;
      const netDeathBenefit = deathBenefit - outstandingBalance;
      const percentReduction = Math.round((outstandingBalance / deathBenefit) * 100);

      timeline.push({
        year,
        outstandingBalance,
        yearlyInterest,
        netDeathBenefit: Math.max(0, netDeathBenefit),
        percentReduction
      });
    }

    return timeline;
  };

  const loanTimeline = calculateLoanTimeline();

  const trustStats = [
    { value: "5-8%", label: "Typical Rate", sublabel: "Often lower than banks" },
    { value: "$0", label: "Application Fee", sublabel: "No closing costs" },
    { value: "No", label: "Credit Check", sublabel: "Guaranteed approval" },
    { value: "Flexible", label: "Repayment", sublabel: "No fixed schedule" }
  ];

  const loanVsWithdrawal = [
    { feature: "Tax Treatment", loan: "Not taxable", withdrawal: "Gains may be taxed" },
    { feature: "Death Benefit Impact", loan: "Reduced by unpaid balance", withdrawal: "Permanently reduced" },
    { feature: "Repayment Required?", loan: "No, but interest accrues", withdrawal: "N/A - can't repay" },
    { feature: "Credit Check", loan: "No", withdrawal: "No" },
    { feature: "Best For", loan: "Temporary needs, large amounts", withdrawal: "Small amounts, no repayment planned" }
  ];

  const loanProcess = [
    {
      step: 1,
      title: "Request the Loan",
      description: "Call or submit online. No application, no credit check.",
      icon: FileCheck,
      time: "5 minutes"
    },
    {
      step: 2,
      title: "Get Approved Instantly",
      description: "Approval is automatic up to your available cash value.",
      icon: CheckCircle2,
      time: "Immediate"
    },
    {
      step: 3,
      title: "Receive Funds",
      description: "Direct deposit or check, typically within 3-5 business days.",
      icon: DollarSign,
      time: "3-5 days"
    },
    {
      step: 4,
      title: "Repay on Your Terms",
      description: "Pay back whenever you want—or never. Interest simply accrues.",
      icon: RefreshCcw,
      time: "Flexible"
    }
  ];

  const commonUses = [
    {
      icon: CreditCard,
      title: "Emergency Expenses",
      description: "Medical bills, car repairs, unexpected costs."
    },
    {
      icon: Wallet,
      title: "Business Opportunities",
      description: "Fund a venture or cover business cash flow."
    },
    {
      icon: DollarSign,
      title: "Major Purchases",
      description: "Down payment, wedding, education costs."
    },
    {
      icon: TrendingDown,
      title: "Bridge Financing",
      description: "Short-term cash while waiting for funds."
    }
  ];

  const advantages = [
    {
      icon: CheckCircle2,
      title: "No Credit Check",
      description: "Your loan is secured by your cash value."
    },
    {
      icon: Clock,
      title: "No Repayment Schedule",
      description: "Pay back monthly, annually, or never."
    },
    {
      icon: Shield,
      title: "Coverage Stays Intact",
      description: "Death benefit remains in force."
    },
    {
      icon: Percent,
      title: "Competitive Rates",
      description: "Often 5-8%, lower than credit cards."
    },
    {
      icon: DollarSign,
      title: "Tax-Free Access",
      description: "Loans aren't taxable income."
    },
    {
      icon: FileCheck,
      title: "Simple Process",
      description: "No paperwork, no waiting."
    }
  ];

  const risks = [
    {
      icon: AlertTriangle,
      title: "Interest Accrues",
      description: "Unpaid interest compounds over time."
    },
    {
      icon: TrendingDown,
      title: "Reduced Death Benefit",
      description: "Outstanding loan deducted from payout."
    },
    {
      icon: XCircle,
      title: "Policy Lapse Risk",
      description: "If loan exceeds cash value, policy may lapse."
    }
  ];

  const faqs = [
    {
      question: "How much can I borrow?",
      answer: "Typically up to 90-95% of your policy's cash surrender value. If you have $50,000 in cash value, you might borrow up to $45,000-$47,500. The exact percentage depends on your insurer."
    },
    {
      question: "Do I have to repay the loan?",
      answer: "No. Repayment is optional. However, unpaid loans accrue interest that compounds over time. If you never repay, the loan balance (principal + interest) is deducted from your death benefit."
    },
    {
      question: "What's the interest rate?",
      answer: "Policy loan rates typically range from 5-8%, set by the insurer. Some policies have fixed rates; others have variable rates. The rate is usually stated in your policy contract."
    },
    {
      question: "Are policy loans taxable?",
      answer: "No—as long as your policy stays in force. Loans are borrowed money, not income. However, if your policy lapses with an outstanding loan, the loan amount may become taxable."
    },
    {
      question: "How fast can I get the money?",
      answer: "Usually 3-5 business days by direct deposit or check. Some insurers offer faster options. The process is quick since there's no underwriting—your cash value is the collateral."
    },
    {
      question: "What happens to my cash value while I have a loan?",
      answer: "Your full cash value continues to earn interest/dividends—even the portion backing your loan. This is called 'uninterrupted compounding.' However, your net cash value (for withdrawal purposes) is reduced."
    }
  ];

  const calculateLoanImpact = () => {
    const maxLoan = Math.floor(cashValue * 0.9);
    const remainingCashValue = cashValue - loanAmount;
    const interestYear1 = Math.round(loanAmount * 0.06);
    const deathBenefitReduction = loanAmount + interestYear1;
    return { maxLoan, remainingCashValue, interestYear1, deathBenefitReduction };
  };

  const { maxLoan, remainingCashValue, interestYear1, deathBenefitReduction } = calculateLoanImpact();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] py-20 md:py-28 overflow-hidden">
        {/* Decorative blur circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-heritage-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-heritage-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.p variants={fadeInUp} className="text-heritage-primary font-semibold mb-4 tracking-wide uppercase text-sm">
                Whole Life Insurance
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Policy Loans:
                <span className="text-heritage-primary"> Your Built-In Bank</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 leading-relaxed">
                Borrow against your cash value anytime. No credit check, no approval, no fixed repayment schedule.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/quote"
                    className="inline-flex items-center gap-2 bg-heritage-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-heritage-primary/90 transition-colors"
                  >
                    Get Your Free Quote <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <a
                    href="tel:6307780800"
                    className="inline-flex items-center gap-2 bg-white text-heritage-primary border-2 border-heritage-primary px-8 py-4 rounded-lg font-semibold hover:bg-heritage-primary/5 transition-colors"
                  >
                    <Phone className="w-5 h-5" /> Speak to an Advisor
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Loan Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-heritage-primary/10 rounded-xl">
                    <Calculator className="w-8 h-8 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Policy Loan Calculator</h3>
                    <p className="text-gray-500">See your borrowing power</p>
                  </div>
                </div>

                <div className="space-y-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Cash Value: <span className="text-heritage-primary font-bold">${cashValue.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min="10000"
                      max="200000"
                      step="5000"
                      value={cashValue}
                      onChange={(e) => {
                        const newCV = parseInt(e.target.value);
                        setCashValue(newCV);
                        if (loanAmount > newCV * 0.9) {
                          setLoanAmount(Math.floor(newCV * 0.9));
                        }
                      }}
                      className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount: <span className="text-heritage-primary font-bold">${loanAmount.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max={maxLoan}
                      step="1000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max available: ${maxLoan.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-xs mb-1">Remaining Net Cash Value</p>
                    <p className="text-xl font-bold text-heritage-primary">${remainingCashValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-xs mb-1">Year 1 Interest (6%)</p>
                    <p className="text-xl font-bold text-orange-600">${interestYear1.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-4 bg-heritage-primary/5 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> If unpaid, death benefit reduced by ~${deathBenefitReduction.toLocaleString()} after year 1.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="bg-heritage-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-white font-medium">{stat.label}</p>
                <p className="text-white/70 text-sm">{stat.sublabel}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What is a Policy Loan */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                What is a Policy Loan?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed">
                A policy loan lets you borrow money from your life insurance company, using your cash value as collateral. It's not technically a withdrawal—you're borrowing against your own asset.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
                Unlike bank loans, there's no application, no credit check, and no set repayment schedule. Your cash value guarantees the loan, so approval is automatic.
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-4">
                {[
                  "Borrow up to 90-95% of cash value",
                  "No credit check or income verification",
                  "No fixed repayment schedule",
                  "Interest rates typically 5-8%",
                  "Tax-free (as long as policy stays active)",
                  "Coverage remains in force"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-heritage-primary flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=500&fit=crop"
                alt="Financial planning"
                className="rounded-xl shadow-lg w-full h-[500px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Loan Process */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Policy Loans Work
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Four simple steps to access your cash.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {loanProcess.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative"
              >
                <div className="bg-white rounded-xl p-8 border border-gray-200 h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-heritage-primary rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </div>
                    <span className="text-sm font-medium text-heritage-primary">{step.time}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < loanProcess.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-heritage-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Advantages & Risks */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Advantages */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Advantages</h2>
              </motion.div>

              <div className="space-y-4">
                {advantages.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <item.icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Risks */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Risks to Consider</h2>
              </motion.div>

              <div className="space-y-4">
                {risks.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                        <item.icon className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div variants={fadeInUp} className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <p className="text-sm text-orange-800">
                  <strong>Key Point:</strong> Unpaid loans reduce death benefits and can cause policy lapse if they exceed cash value.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Loan vs Withdrawal */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Policy Loan vs. Withdrawal
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Two ways to access cash value—different trade-offs.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto border border-gray-200"
          >
            <div className="grid grid-cols-3 bg-heritage-primary text-white p-4 font-semibold">
              <div>Feature</div>
              <div className="text-center">Policy Loan</div>
              <div className="text-center">Withdrawal</div>
            </div>
            {loanVsWithdrawal.map((row, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 p-4 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className="font-medium text-gray-900">{row.feature}</div>
                <div className="text-center text-heritage-primary font-semibold">{row.loan}</div>
                <div className="text-center text-gray-600">{row.withdrawal}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Common Uses */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Common Uses for Policy Loans
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Your money, your reasons. No questions asked.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {commonUses.map((use, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow"
              >
                <div className="p-4 bg-heritage-primary/10 rounded-full w-fit mx-auto mb-6">
                  <use.icon className="w-8 h-8 text-heritage-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{use.title}</h3>
                <p className="text-gray-600">{use.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-heritage-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                  alt="James M."
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
              <div className="text-center md:text-left">
                <div className="flex justify-center md:justify-start gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-heritage-accent fill-heritage-accent" />
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl text-white mb-6 italic leading-relaxed">
                  "My furnace died in January. Banks wanted to run credit and take weeks. I called my insurer at 9am, and $8,000 was in my account by Friday. No forms, no hassle."
                </blockquote>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Award className="w-6 h-6 text-heritage-accent" />
                  <div>
                    <p className="font-semibold text-white">James M.</p>
                    <p className="text-white/70">Policyholder Since 2015</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Loan Impact Calculator */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loan Impact Calculator
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              See exactly how a policy loan affects your death benefit over time if left unpaid.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLoanCalculator(!showLoanCalculator)}
              className="bg-heritage-primary hover:bg-heritage-primary/90 text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-2 shadow-lg"
            >
              <Calculator className="w-5 h-5" />
              {showLoanCalculator ? 'Hide Calculator' : 'Calculate Loan Impact'}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {showLoanCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                  {/* Input Controls */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Death Benefit
                      </label>
                      <p className="text-2xl font-bold text-heritage-primary mb-2">${deathBenefit.toLocaleString()}</p>
                      <input
                        type="range"
                        min="100000"
                        max="1000000"
                        step="25000"
                        value={deathBenefit}
                        onChange={(e) => setDeathBenefit(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Amount
                      </label>
                      <p className="text-2xl font-bold text-heritage-accent mb-2">${loanAmount.toLocaleString()}</p>
                      <input
                        type="range"
                        min="5000"
                        max={Math.floor(cashValue * 0.9)}
                        step="1000"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interest Rate
                      </label>
                      <p className="text-2xl font-bold text-orange-600 mb-2">{loanInterestRate}%</p>
                      <input
                        type="range"
                        min="4"
                        max="10"
                        step="0.5"
                        value={loanInterestRate}
                        onChange={(e) => setLoanInterestRate(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years Unpaid
                      </label>
                      <p className="text-2xl font-bold text-gray-700 mb-2">{loanYears} years</p>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={loanYears}
                        onChange={(e) => setLoanYears(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
                      />
                    </div>
                  </div>

                  {/* Visual Timeline */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-heritage-primary mb-6">Death Benefit Impact Over Time</h4>
                    <div className="space-y-3">
                      {loanTimeline.map((data, index) => {
                        const benefitWidth = (data.netDeathBenefit / deathBenefit) * 100;
                        const loanWidth = (data.outstandingBalance / deathBenefit) * 100;

                        return (
                          <motion.div
                            key={data.year}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="flex items-center gap-4">
                              <span className="w-16 text-sm font-medium text-gray-700">Year {data.year}</span>
                              <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                                {/* Death Benefit remaining (green) */}
                                <motion.div
                                  className="absolute inset-y-0 left-0 bg-green-500 rounded-l-lg"
                                  initial={{ width: '100%' }}
                                  animate={{ width: `${benefitWidth}%` }}
                                  transition={{ duration: 0.5, delay: index * 0.05 }}
                                />
                                {/* Loan eating into benefit (red) */}
                                <motion.div
                                  className="absolute inset-y-0 right-0 bg-red-400"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(loanWidth, 100)}%` }}
                                  transition={{ duration: 0.5, delay: index * 0.05 + 0.1 }}
                                />
                              </div>
                              <div className="w-32 text-right">
                                <span className="text-sm font-semibold text-gray-700">
                                  ${data.netDeathBenefit.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gray-50 rounded-xl p-5 text-center"
                    >
                      <p className="text-gray-500 text-sm mb-1">Original Loan</p>
                      <p className="text-2xl font-bold text-heritage-primary">${loanAmount.toLocaleString()}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-red-50 rounded-xl p-5 text-center"
                    >
                      <p className="text-gray-500 text-sm mb-1">Balance After {loanYears} Years</p>
                      <p className="text-2xl font-bold text-red-600">
                        ${loanTimeline[loanTimeline.length - 1]?.outstandingBalance.toLocaleString() || 0}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-green-50 rounded-xl p-5 text-center"
                    >
                      <p className="text-gray-500 text-sm mb-1">Net Death Benefit</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${loanTimeline[loanTimeline.length - 1]?.netDeathBenefit.toLocaleString() || 0}
                      </p>
                    </motion.div>
                  </div>

                  {/* Warning if loan gets too high */}
                  {loanTimeline[loanTimeline.length - 1]?.percentReduction > 50 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-orange-800">Significant Death Benefit Reduction</p>
                        <p className="text-sm text-orange-700">
                          After {loanYears} years, the unpaid loan would reduce your death benefit by {loanTimeline[loanTimeline.length - 1]?.percentReduction}%.
                          Consider making periodic payments to prevent compounding.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-8 text-sm mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-600">Net Death Benefit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-400 rounded"></div>
                      <span className="text-gray-600">Outstanding Loan Balance</span>
                    </div>
                  </div>

                  <p className="text-center text-gray-500 text-xs mt-6">
                    *This calculator shows the impact of compound interest on an unpaid loan. Making payments reduces the balance.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600">
              Common questions about policy loans.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-6 h-6 text-heritage-primary flex-shrink-0 transition-transform duration-200 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-6 pb-6 text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#fffaf3] to-[#f5f0e8]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Build Your Financial Safety Net
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Whole life gives you protection and access to cash when you need it.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-heritage-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-heritage-primary/90 transition-colors"
                >
                  Get Your Free Quote <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="tel:6307780800"
                  className="inline-flex items-center gap-2 bg-white text-heritage-primary border-2 border-heritage-primary px-8 py-4 rounded-lg font-semibold hover:bg-heritage-primary/5 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Call (630) 778-0800
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
