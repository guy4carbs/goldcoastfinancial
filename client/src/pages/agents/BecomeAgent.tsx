import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustIndicators from "@/components/TrustIndicators";
import { carrierLinks } from "@/data/carriers";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import {
  TrendingUp,
  Users,
  GraduationCap,
  Headphones,
  Shield,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Building,
  Award,
  Zap,
  Heart,
  Phone,
  Mail,
  Calendar,
  X
} from "lucide-react";

export default function BecomeAgent() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    experience: "",
    licensed: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/job-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          position: 'Insurance Agent',
          linkedIn: null,
          experience: formData.experience || 'Not specified',
          whyJoinUs: formData.message || 'Agent application from Become an Agent page',
          hasLicense: formData.licensed === 'yes',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setShowSuccessModal(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        experience: "",
        licensed: "",
        message: ""
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please try again or email us directly at careers@heritagels.org');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "Competitive Commissions",
      description: "Industry-leading compensation with uncapped earning potential and performance bonuses"
    },
    {
      icon: GraduationCap,
      title: "Comprehensive Training",
      description: "Ongoing education, product training, and sales coaching to help you succeed"
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      description: "Back-office support, case management, and a responsive team when you need help"
    },
    {
      icon: Zap,
      title: "Modern Technology",
      description: "Digital tools, e-apps, and CRM systems to streamline your workflow"
    },
    {
      icon: Shield,
      title: "Top-Rated Carriers",
      description: "Access to 30+ A-rated carriers with diverse product portfolios"
    },
    {
      icon: TrendingUp,
      title: "Growth Opportunities",
      description: "Clear path to agency building with override commissions and leadership roles"
    }
  ];

  const products = [
    "Term Life Insurance",
    "Whole Life Insurance",
    "Indexed Universal Life (IUL)",
    "Final Expense",
    "Mortgage Protection",
    "Fixed Annuities",
    "Indexed Annuities"
  ];

  const steps = [
    { number: "01", title: "Apply", description: "Complete our simple application form" },
    { number: "02", title: "Connect", description: "Brief call to discuss your goals" },
    { number: "03", title: "Contract", description: "Quick contracting with our carriers" },
    { number: "04", title: "Train", description: "Access training and start selling" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 pt-24 pb-20 overflow-hidden"
        style={{ borderRadius: `0 0 ${RADIUS.hero}px ${RADIUS.hero}px` }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <Users className="w-4 h-4" />
                Join Our Team
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-balance">
                Build Your Career with Heritage
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Partner with a team that invests in your success. Competitive commissions,
                comprehensive training, and the support you need to grow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="#apply"
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-violet-600 hover:bg-white/95 px-8 py-4 font-semibold text-lg flex items-center justify-center gap-2"
                  style={{ borderRadius: RADIUS.button, boxShadow: SHADOW.level3 }}
                >
                  Start Your Application <ArrowRight className="w-5 h-5" />
                </motion.a>
                <motion.a
                  href="tel:6307780800"
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-white/50 text-white hover:bg-white/10 px-8 py-4 font-semibold text-lg flex items-center justify-center gap-2 backdrop-blur-sm"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Phone className="w-5 h-5" /> Talk to Recruiting
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators variant="inline" />

      {/* Why Heritage Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Agents Choose Heritage
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to build a thriving insurance practice
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                className="bg-violet-50 p-8 transition-shadow cursor-pointer"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}
              >
                <div
                  className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mb-4"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-violet-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Products You'll Represent
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Access a comprehensive portfolio of life insurance and annuity products
                  from top-rated carriers. Help clients at every stage of life.
                </p>
                <motion.div
                  className="grid grid-cols-2 gap-3"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0" />
                      <span className="text-gray-700">{product}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-10 text-white"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Building className="w-8 h-8 text-amber-300" />
                  <h3 className="text-2xl font-bold text-white">30+ Carrier Partners</h3>
                </div>
                <p className="text-white/90 mb-8">
                  We've built relationships with the industry's most trusted carriers
                  so you can offer the right solution for every client.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-300" />
                    <span className="text-white/90">All A-rated or better carriers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-300" />
                    <span className="text-white/90">Fast underwriting options</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-amber-300" />
                    <span className="text-white/90">Products for all health classes</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Getting Started is Simple
            </h2>
            <p className="text-lg text-gray-600">
              From application to selling in as little as one week
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              className="grid md:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  className="text-center cursor-pointer"
                >
                  <div className="text-5xl font-bold bg-gradient-to-br from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 bg-violet-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Start Your Application
              </h2>
              <p className="text-lg text-gray-600">
                Tell us about yourself and we'll be in touch within 24 hours
              </p>
            </motion.div>

            <motion.form
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="bg-white p-8 md:p-12"
              style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Experience</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <option value="">Select experience level</option>
                    <option value="none">New to Insurance</option>
                    <option value="1-2">1-2 Years</option>
                    <option value="3-5">3-5 Years</option>
                    <option value="5+">5+ Years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currently Licensed?</label>
                  <select
                    value={formData.licensed}
                    onChange={(e) => setFormData({ ...formData, licensed: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <option value="">Select status</option>
                    <option value="yes">Yes, I'm Licensed</option>
                    <option value="no">No, Not Yet</option>
                    <option value="process">In the Process</option>
                  </select>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tell us about yourself (optional)</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share your background, goals, or any questions you have..."
                  className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white py-4 font-semibold text-lg flex items-center justify-center gap-2"
                style={{ borderRadius: RADIUS.button, boxShadow: SHADOW.level3 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              <p className="text-center text-sm text-gray-500 mt-4">
                We'll contact you within 24 hours to discuss next steps.
              </p>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Carrier Logos */}
      <section className="py-12 bg-violet-50/50 border-y border-violet-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by families nationwide. We partner with 40+ A-rated carriers.</p>
        </div>
        <div className="relative w-full">
          <div className="flex w-max animate-carousel">
            {[...carrierLinks, ...carrierLinks].map((carrier, i) => (
              <Link key={i} href={carrier.href} className="flex-shrink-0 w-[200px] mx-6 h-24 flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer">
                <img
                  src={carrier.logo}
                  alt={carrier.name}
                  className={`object-contain ${carrier.size === 'large' ? 'h-20 max-w-[180px]' : 'h-16 max-w-[160px]'}`}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              Have Questions?
            </h2>
            <p className="text-gray-600 mb-8">
              Our recruiting team is here to help you make the right decision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:6307780800"
                className="flex items-center justify-center gap-2 text-violet-600 font-semibold hover:text-violet-700 transition-colors"
              >
                <Phone className="w-5 h-5" /> (630) 778-0800
              </a>
              <span className="hidden sm:block text-gray-300">|</span>
              <a
                href="mailto:careers@heritagels.org"
                className="flex items-center justify-center gap-2 text-violet-600 font-semibold hover:text-violet-700 transition-colors"
              >
                <Mail className="w-5 h-5" /> careers@heritagels.org
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Success Modal with Calendly */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-white max-w-md w-full p-8"
              style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  style={{ borderRadius: RADIUS.pill }}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="text-center">
                <div
                  className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6"
                  style={{ borderRadius: RADIUS.pill, boxShadow: SHADOW.level3 }}
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Received!</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Thank you for your interest in joining Heritage. Complete your application by scheduling a call with our recruiting team.
                </p>

                <motion.a
                  href="https://calendly.com/careers-heritagels/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white px-8 py-4 font-semibold text-lg transition-colors mb-6"
                  style={{ borderRadius: RADIUS.button, boxShadow: SHADOW.level3 }}
                >
                  <Calendar className="w-5 h-5" />
                  Book Your 30-Minute Call
                </motion.a>

                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">
                    Questions? Email us at{" "}
                    <a href="mailto:careers@heritagels.org" className="text-violet-600 hover:underline">
                      careers@heritagels.org
                    </a>
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
