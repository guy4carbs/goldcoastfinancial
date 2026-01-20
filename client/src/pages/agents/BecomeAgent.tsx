import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  Mail
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
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
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-heritage-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-heritage-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-heritage-primary/10 text-heritage-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Users className="w-4 h-4" />
                Join Our Team
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-heritage-primary mb-6 leading-tight">
                Build Your Career with Heritage
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Partner with a team that invests in your success. Competitive commissions,
                comprehensive training, and the support you need to grow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="#apply"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
                >
                  Start Your Application <ArrowRight className="w-5 h-5" />
                </motion.a>
                <motion.a
                  href="tel:6307780800"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-heritage-primary text-heritage-primary hover:bg-heritage-primary/5 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" /> Talk to Recruiting
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Heritage Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#fffaf3] rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-heritage-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-heritage-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Products You'll Represent
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Access a comprehensive portfolio of life insurance and annuity products
                  from top-rated carriers. Help clients at every stage of life.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {products.map((product, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5 text-heritage-accent flex-shrink-0" />
                      <span className="text-gray-700">{product}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-heritage-primary rounded-2xl p-10 text-white"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Building className="w-8 h-8 text-heritage-accent" />
                  <h3 className="text-2xl font-bold text-white">30+ Carrier Partners</h3>
                </div>
                <p className="text-white/80 mb-8">
                  We've built relationships with the industry's most trusted carriers
                  so you can offer the right solution for every client.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-heritage-accent" />
                    <span className="text-white/90">All A-rated or better carriers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-heritage-accent" />
                    <span className="text-white/90">Fast underwriting options</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-heritage-accent" />
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
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
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-5xl font-bold text-heritage-accent/30 mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-lg"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Experience</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all resize-none"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
              >
                Submit Application <ArrowRight className="w-5 h-5" />
              </motion.button>

              <p className="text-center text-sm text-gray-500 mt-4">
                We'll contact you within 24 hours to discuss next steps.
              </p>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Have Questions?
            </h2>
            <p className="text-gray-600 mb-8">
              Our recruiting team is here to help you make the right decision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:6307780800"
                className="flex items-center justify-center gap-2 text-heritage-primary font-semibold hover:text-heritage-accent transition-colors"
              >
                <Phone className="w-5 h-5" /> (630) 778-0800
              </a>
              <span className="hidden sm:block text-gray-300">|</span>
              <a
                href="mailto:careers@heritagels.com"
                className="flex items-center justify-center gap-2 text-heritage-primary font-semibold hover:text-heritage-accent transition-colors"
              >
                <Mail className="w-5 h-5" /> careers@heritagels.com
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
