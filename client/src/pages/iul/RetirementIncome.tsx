import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Wallet,
  Shield,
  ChevronRight,
  ChevronDown,
  Award,
  ArrowRight,
  TrendingUp,
  Banknote,
  Receipt,
  Calendar,
  CheckCircle,
  Phone,
  DollarSign,
  Play
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

export default function RetirementIncome() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentAge, setCurrentAge] = useState(40);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualContribution, setAnnualContribution] = useState(20000);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayVideo = () => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsPlaying(true);
    }
  };

  const yearsToRetirement = retirementAge - currentAge;
  const yearsOfIncome = 25;

  const calculateProjection = () => {
    const growthRate = 0.065;
    let accumulation = 0;

    for (let i = 0; i < yearsToRetirement; i++) {
      accumulation = (accumulation + annualContribution) * (1 + growthRate);
    }

    const annualIncome = Math.round(accumulation * 0.045);
    const monthlyIncome = Math.round(annualIncome / 12);
    const totalTaxFreeIncome = annualIncome * yearsOfIncome;
    const taxableEquivalent = Math.round(annualIncome / 0.76);

    return {
      accumulation: Math.round(accumulation),
      annualIncome,
      monthlyIncome,
      totalTaxFreeIncome,
      taxableEquivalent,
      totalContributed: annualContribution * yearsToRetirement
    };
  };

  const projection = calculateProjection();

  const benefits = [
    {
      icon: Receipt,
      title: "Tax-Free Income",
      description: "Access cash value through loans with no taxes or penalties at any age"
    },
    {
      icon: Shield,
      title: "No Market Risk",
      description: "Your retirement fund is protected from stock market downturns"
    },
    {
      icon: Calendar,
      title: "No Age Restrictions",
      description: "Access your money before 59.5 without early withdrawal penalties"
    },
    {
      icon: Banknote,
      title: "Supplement Income",
      description: "Pair with Social Security and 401k for diversified retirement income"
    }
  ];

  const idealFor = [
    "High earners who have maxed out 401k contributions",
    "Business owners seeking tax diversification",
    "Those wanting penalty-free early retirement access",
    "Families planning multi-generational wealth transfer",
    "Anyone concerned about future tax rate increases"
  ];

  const faqs = [
    {
      question: "How does tax-free retirement income work?",
      answer: "Instead of withdrawing money (which could be taxable), you take loans against your cash value. These loans are not considered income by the IRS. The loan balance is paid off by the death benefit when you pass, leaving remaining funds to heirs. Important: If your policy lapses with outstanding loans, the loan amount may become taxable income. Proper policy design and monitoring prevent this."
    },
    {
      question: "Is this better than a 401k?",
      answer: "It's not 'better' - it's different. IUL complements a 401k by adding tax diversification. Having both taxable (401k) and tax-free (IUL) income sources gives you flexibility in retirement to manage your tax bracket."
    },
    {
      question: "What if I need money before retirement?",
      answer: "Unlike 401ks and IRAs, you can access your IUL cash value at any age without penalties. This makes it valuable for emergencies, opportunities, or early retirement."
    },
    {
      question: "How much should I contribute?",
      answer: "Most advisors suggest maxing out employer 401k matches first, then allocating additional savings to IUL. The ideal amount depends on your income, goals, and tax situation."
    },
    {
      question: "What happens if I stop paying premiums?",
      answer: "If your policy has sufficient cash value, it can self-fund premiums. If not, the policy may lapse. Proper design and funding from the start prevents this issue."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-heritage-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-heritage-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start pt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-heritage-primary/10 text-heritage-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Wallet className="w-4 h-4" />
                Tax-Free Retirement Strategy
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Tax-Free
                <span className="block text-heritage-accent">Retirement Income</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Build a supplemental retirement fund with higher contribution flexibility than 401ks/IRAs, penalty-free access at any age, and tax-free income through policy loans.
              </p>

              <div className="space-y-3 mb-8">
                {["Access cash value tax-free through policy loans", "Higher contribution flexibility than 401k/IRA", "No penalties for early access before 59.5"].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-heritage-accent flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    Start Planning
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <a href="tel:+1234567890">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto border-2 border-heritage-primary text-heritage-primary hover:bg-heritage-primary hover:text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Speak to an Advisor
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Retirement Income Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Income Projector</h3>
                <p className="text-gray-600 text-sm">See your potential tax-free retirement income</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Age: <span className="text-heritage-accent font-bold">{currentAge}</span>
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="55"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>25</span>
                    <span>55</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retirement Age: <span className="text-heritage-accent font-bold">{retirementAge}</span>
                  </label>
                  <input
                    type="range"
                    min={currentAge + 10}
                    max="70"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{currentAge + 10}</span>
                    <span>70</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Contribution: <span className="text-heritage-accent font-bold">${annualContribution.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="50000"
                    step="1000"
                    value={annualContribution}
                    onChange={(e) => setAnnualContribution(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$5,000</span>
                    <span>$50,000</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white text-center">
                  <p className="text-sm opacity-90 mb-1">Projected Monthly Tax-Free Income</p>
                  <p className="text-4xl font-bold">${projection.monthlyIncome.toLocaleString()}</p>
                  <p className="text-xs opacity-75 mt-2">Starting at age {retirementAge} for {yearsOfIncome} years</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Tax Advantage</p>
                      <p className="text-xs text-green-700 mt-1">
                        ${projection.monthlyIncome.toLocaleString()}/mo tax-free = ${Math.round(projection.taxableEquivalent / 12).toLocaleString()}/mo pre-tax (24% bracket)
                      </p>
                    </div>
                  </div>
                </div>

                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold"
                  >
                    Get Your Custom Illustration
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="bg-heritage-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "0%", label: "Tax on Income*" },
              { value: "Flexible", label: "Contribution Levels" },
              { value: "Any Age", label: "Penalty-Free Access" },
              { value: "Protected", label: "From Market Loss" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <p className="text-3xl md:text-4xl font-bold text-heritage-accent">{stat.value}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Why IUL for Retirement?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Benefits that traditional retirement accounts simply cannot offer.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-heritage-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-heritage-accent" />
                </div>
                <h3 className="text-lg font-bold text-heritage-primary mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Calculator Section */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              IUL vs Traditional Retirement
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how IUL compares to 401k and Roth IRA for retirement planning.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-4 bg-heritage-primary text-white">
                <div className="p-4 font-semibold">Feature</div>
                <div className="p-4 font-semibold text-center">IUL</div>
                <div className="p-4 font-semibold text-center">401(k)</div>
                <div className="p-4 font-semibold text-center">Roth IRA</div>
              </div>

              {[
                { feature: "Tax on Contributions", iul: "After-tax", k401: "Pre-tax", roth: "After-tax" },
                { feature: "Tax on Withdrawals", iul: "Tax-free (loans)*", k401: "Fully taxed", roth: "Tax-free" },
                { feature: "Contribution Limits", iul: "Higher (MEC limits apply)", k401: "$23,000/yr", roth: "$7,000/yr" },
                { feature: "Early Access Penalty", iul: "None", k401: "10% before 59.5", roth: "10% on gains" },
                { feature: "Required Distributions", iul: "None", k401: "Yes (age 73)", roth: "None" },
                { feature: "Death Benefit", iul: "Yes (tax-free)", k401: "No", roth: "No" }
              ].map((row, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`grid grid-cols-4 ${index % 2 === 0 ? 'bg-white' : 'bg-[#fffaf3]'}`}
                >
                  <div className="p-4 font-medium text-gray-700">{row.feature}</div>
                  <div className="p-4 text-center text-heritage-accent font-semibold">{row.iul}</div>
                  <div className="p-4 text-center text-gray-600">{row.k401}</div>
                  <div className="p-4 text-center text-gray-600">{row.roth}</div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 p-4 bg-green-50 rounded-xl text-center text-green-700"
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              <span className="font-semibold">Pro Tip:</span> Use all three for maximum tax diversification in retirement
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
                Ideal For Those Who...
              </h2>
              <div className="space-y-4">
                {idealFor.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5 text-heritage-accent flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl overflow-hidden shadow-xl bg-gray-900 relative">
                <video
                  ref={videoRef}
                  src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fgeneral%2F1769052699418-IUL%20Video.mp4?alt=media&token=36f881d5-41fb-409d-8f0f-cb23fada786f"
                  controls={isPlaying}
                  playsInline
                  className="w-full h-full object-cover"
                  onEnded={() => setIsPlaying(false)}
                />
                {!isPlaying && (
                  <button
                    onClick={handlePlayVideo}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group"
                  >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-heritage-primary ml-1" fill="currentColor" />
                    </div>
                  </button>
                )}
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-heritage-accent/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-heritage-accent" />
                  </div>
                  <div>
                    <p className="font-bold text-heritage-primary">Tax-Free Growth</p>
                    <p className="text-xs text-gray-500">No taxes on gains</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              How Tax-Free Retirement Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Fund Your Policy", description: "Contribute premium payments that grow tax-deferred", icon: DollarSign },
              { step: "2", title: "Build Cash Value", description: "Watch your money grow with market-linked returns", icon: TrendingUp },
              { step: "3", title: "Take Tax-Free Loans", description: "Access your cash value through policy loans", icon: Banknote },
              { step: "4", title: "Enjoy Retirement", description: "Receive tax-free income for decades", icon: Calendar }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-heritage-accent rounded-full flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-heritage-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-heritage-primary mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                {i < 3 && (
                  <ArrowRight className="w-6 h-6 text-heritage-accent/30 mx-auto mt-4 hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-heritage-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Award key={i} className="w-6 h-6 text-heritage-accent" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl text-white font-light mb-8 leading-relaxed">
              "My 401k withdrawals push me into a higher tax bracket. My IUL income does not count as income at all. Between the two, I control my tax bill perfectly."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Richard M.</p>
                <p className="text-white/70 text-sm">Retired at 62, Phoenix</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Common Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-heritage-primary pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-heritage-accent transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="p-6 pt-0 text-gray-600">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#fffaf3] to-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
              Plan Your Tax-Free Retirement
            </h2>
            <p className="text-gray-600 mb-8">
              Start building tax-free retirement income today. Get a personalized illustration showing your potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Get Your Free Illustration
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a href="tel:+1234567890">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-heritage-primary hover:bg-heritage-primary/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call (555) 123-4567
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
