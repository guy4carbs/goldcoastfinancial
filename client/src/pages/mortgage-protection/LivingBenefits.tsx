import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Heart,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Phone,
  Shield,
  Activity,
  Brain,
  Stethoscope,
  Award,
  AlertCircle,
  DollarSign,
  Clock,
  FileText
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

export default function LivingBenefits() {
  const [selectedBenefit, setSelectedBenefit] = useState<string>('critical');
  const [coverage, setCoverage] = useState(300000);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const livingBenefits = [
    {
      id: 'critical',
      icon: Heart,
      title: "Critical Illness",
      shortDesc: "Heart attack, stroke, cancer",
      payout: "Up to 100%",
      conditions: ["Heart Attack", "Stroke", "Cancer", "Kidney Failure", "Major Organ Transplant"],
      example: `If diagnosed with cancer, access up to $${(coverage * 0.75).toLocaleString()} immediately for treatment, bills, or anything you need.`
    },
    {
      id: 'chronic',
      icon: Activity,
      title: "Chronic Illness",
      shortDesc: "Can't perform daily activities",
      payout: "Up to 100%",
      conditions: ["Can't perform 2+ ADLs", "Bathing", "Dressing", "Eating", "Continence", "Transferring"],
      example: `If you can't bathe or dress yourself, access up to $${(coverage * 0.5).toLocaleString()} to pay for care or modify your home.`
    },
    {
      id: 'terminal',
      icon: Clock,
      title: "Terminal Illness",
      shortDesc: "12-24 months to live",
      payout: "Up to 100%",
      conditions: ["Doctor certifies 12-24 months life expectancy", "Most policies included at no extra cost"],
      example: `If diagnosed terminally ill, access up to $${coverage.toLocaleString()} to spend time with family, travel, or handle affairs.`
    }
  ];

  const selectedBenefitData = livingBenefits.find(b => b.id === selectedBenefit);

  const howItWorks = [
    { step: "1", title: "Diagnosis", description: "You're diagnosed with a qualifying condition", icon: Stethoscope },
    { step: "2", title: "File Claim", description: "Submit medical documentation to insurer", icon: FileText },
    { step: "3", title: "Approval", description: "Claim reviewed and approved (usually 2-4 weeks)", icon: CheckCircle },
    { step: "4", title: "Access Funds", description: "Receive lump sum—use it for anything", icon: DollarSign }
  ];

  const commonUses = [
    "Medical bills and treatment costs",
    "Mortgage payments while unable to work",
    "Home modifications for accessibility",
    "Hiring caregivers or nursing help",
    "Travel to see specialists",
    "Time off work to recover",
    "Pay off debts for peace of mind",
    "Bucket list experiences"
  ];

  const faqs = [
    {
      question: "Are living benefits included free?",
      answer: "Terminal illness riders are usually free. Critical and chronic illness riders may add 5-15% to your premium, or be included at no extra cost depending on the carrier. We'll show you options with and without."
    },
    {
      question: "Does using living benefits reduce my death benefit?",
      answer: "Yes. The amount you access is deducted from your death benefit. If you access $100K of a $300K policy and later pass away, your beneficiaries receive $200K (minus any fees)."
    },
    {
      question: "Can I use the money for anything?",
      answer: "Absolutely. Unlike health insurance, there are no restrictions. Pay medical bills, take a trip, pay off your mortgage, hire help, or just reduce financial stress. It's your money."
    },
    {
      question: "What qualifies as a critical illness?",
      answer: "Common covered conditions include heart attack, stroke, cancer (excluding minor skin cancers), kidney failure, major organ transplant, and sometimes ALS, MS, or paralysis. Exact conditions vary by policy."
    },
    {
      question: "How quickly can I get the money?",
      answer: "Most claims are processed in 2-4 weeks after submitting medical documentation. Some carriers offer expedited processing. Terminal illness claims are often faster."
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-heritage-primary/10 text-heritage-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                Living Benefits
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Access Your Benefits
                <span className="block text-heritage-accent">While You're Alive</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Life insurance isn't just for after you're gone. Access your death benefit early if you face a serious illness—when you need it most.
              </p>

              <div className="space-y-3 mb-8">
                {["Critical illness: heart attack, stroke, cancer", "Chronic illness: can't perform daily activities", "Terminal illness: 12-24 months prognosis"].map((item, i) => (
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
                    Get Coverage with Living Benefits
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
                    Speak to an Agent
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Interactive Benefit Selector */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Living Benefits Explorer</h3>
                <p className="text-gray-600 text-sm">Click each benefit to learn more</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Amount: <span className="text-heritage-accent font-bold">${coverage.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="750000"
                    step="25000"
                    value={coverage}
                    onChange={(e) => setCoverage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                </div>

                {/* Benefit Type Selector */}
                <div className="grid grid-cols-3 gap-2">
                  {livingBenefits.map((benefit) => (
                    <motion.button
                      key={benefit.id}
                      onClick={() => setSelectedBenefit(benefit.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        selectedBenefit === benefit.id
                          ? 'border-heritage-accent bg-heritage-accent/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <benefit.icon className={`w-6 h-6 mx-auto mb-1 ${selectedBenefit === benefit.id ? 'text-heritage-accent' : 'text-gray-400'}`} />
                      <p className="text-xs font-medium text-heritage-primary">{benefit.title}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Selected Benefit Details */}
                <AnimatePresence mode="wait">
                  {selectedBenefitData && (
                    <motion.div
                      key={selectedBenefit}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <selectedBenefitData.icon className="w-8 h-8 text-heritage-accent" />
                        <div>
                          <h4 className="font-bold text-lg">{selectedBenefitData.title}</h4>
                          <p className="text-white/70 text-sm">{selectedBenefitData.shortDesc}</p>
                        </div>
                      </div>
                      <div className="text-sm mb-3">
                        <span className="text-heritage-accent font-semibold">Potential Payout: </span>
                        {selectedBenefitData.payout} of death benefit
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedBenefitData.conditions.slice(0, 4).map((condition, i) => (
                          <span key={i} className="bg-white/20 px-2 py-1 rounded text-xs">
                            {condition}
                          </span>
                        ))}
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-sm">
                        <p className="text-white/90">{selectedBenefitData.example}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold"
                  >
                    Get Quote with Living Benefits
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
              { value: "Up to 100%", label: "Early Access" },
              { value: "2-4 Weeks", label: "Claim Processing" },
              { value: "No Restrictions", label: "On Use of Funds" },
              { value: "Often Free", label: "Terminal Rider" }
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

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              How Living Benefits Work
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {howItWorks.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center relative"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-heritage-accent rounded-full flex items-center justify-center mx-auto">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-heritage-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-heritage-primary mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefit Details */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Three Types of Living Benefits
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {livingBenefits.map((benefit, i) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-heritage-accent/10 rounded-full flex items-center justify-center mb-4">
                  <benefit.icon className="w-7 h-7 text-heritage-accent" />
                </div>
                <h3 className="text-xl font-bold text-heritage-primary mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{benefit.shortDesc}</p>
                <div className="space-y-2">
                  {benefit.conditions.map((condition, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{condition}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Uses */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
                Use the Money for Anything
              </h2>
              <p className="text-gray-600 mb-6">
                Unlike health insurance claims, living benefit payouts come directly to you with no restrictions on use.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {commonUses.map((use, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-heritage-accent flex-shrink-0" />
                    <span className="text-sm text-gray-700">{use}</span>
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
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
                  alt="Family receiving care"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-heritage-primary text-sm">No Restrictions</p>
                    <p className="text-xs text-gray-500">Your money, your choice</p>
                  </div>
                </div>
              </div>
            </motion.div>
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
              "When I was diagnosed with cancer, I accessed $150,000 from my policy. It paid for treatment, kept up with the mortgage, and let me focus on recovery instead of money."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Sandra M.</p>
                <p className="text-white/70 text-sm">Cancer Survivor, Phoenix AZ</p>
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
              Get Coverage That Works While You Live
            </h2>
            <p className="text-gray-600 mb-8">
              Protect your family and yourself with living benefits included.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Get Your Free Quote
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
