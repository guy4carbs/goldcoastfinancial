import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, TrendingUp, Users, Heart, MapPin, Clock, DollarSign, ChevronRight, X, CheckCircle, Calendar, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Compensation",
    description: "Industry-leading base salary plus uncapped commission structure"
  },
  {
    icon: TrendingUp,
    title: "Growth Opportunities",
    description: "Clear advancement pathways with mentorship from senior leadership"
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive health, dental, and vision coverage for you and your family"
  },
  {
    icon: Users,
    title: "Team Culture",
    description: "Collaborative environment with high-performers who push each other to excel"
  }
];

const openPositions = [
  {
    id: "licensed-insurance-agent",
    title: "Licensed Insurance Agent",
    department: "Sales",
    location: "Naperville, IL / Remote",
    type: "Full-time",
    description: "Join our sales team to help families find the right life insurance coverage. You'll work directly with clients, understand their needs, and provide personalized solutions."
  },
  {
    id: "senior-account-executive",
    title: "Senior Account Executive",
    department: "Business Development",
    location: "Naperville, IL",
    type: "Full-time",
    description: "Drive strategic partnerships and enterprise relationships. You'll work with carriers, IMOs, and key stakeholders to expand Heritage's market presence."
  },
  {
    id: "client-success-manager",
    title: "Client Success Manager",
    department: "Operations",
    location: "Naperville, IL / Hybrid",
    type: "Full-time",
    description: "Ensure every Heritage client receives exceptional support throughout their journey. You'll manage client relationships and drive retention and satisfaction."
  },
  {
    id: "marketing-coordinator",
    title: "Marketing Coordinator",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Support our marketing initiatives across digital channels. You'll help create compelling content, manage campaigns, and analyze performance metrics."
  }
];

const values = [
  {
    title: "Excellence is Non-Negotiable",
    description: "We hold ourselves to the highest standards in everything we do—from client interactions to internal processes."
  },
  {
    title: "Ownership Mentality",
    description: "Every team member takes responsibility for outcomes. We don't make excuses; we find solutions."
  },
  {
    title: "Growth Through Accountability",
    description: "We believe in honest feedback, clear expectations, and the discipline required to continuously improve."
  },
  {
    title: "Families First",
    description: "Everything we build serves one purpose: helping families protect what matters most."
  }
];

const processSteps = [
  {
    number: "1",
    title: "Apply & Book",
    description: "Fill out the application form and schedule a 30-minute intro call with our team."
  },
  {
    number: "2",
    title: "Intro Call",
    description: "Connect with us to discuss the opportunity, learn about our culture, and see if we're a good fit for each other."
  },
  {
    number: "3",
    title: "Final Interview",
    description: "If there's mutual interest and you're in the Chicagoland area, visit our Naperville office to meet the team in person."
  }
];

export default function Careers() {
  const [selectedPosition, setSelectedPosition] = useState<typeof openPositions[0] | null>(null);
  const [modalStep, setModalStep] = useState<"form" | "book">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedin: "",
    message: ""
  });

  const handleOpenModal = (position: typeof openPositions[0]) => {
    setSelectedPosition(position);
    setModalStep("form");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      linkedin: "",
      message: ""
    });
  };

  const handleCloseModal = () => {
    setSelectedPosition(null);
    setModalStep("form");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setModalStep("book");
  };

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      {/* HERO SECTION */}
      <section className="bg-heritage-primary py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <p className="text-heritage-accent font-semibold mb-4 tracking-wide uppercase text-sm">Careers</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Build your career protecting families
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto mb-10">
              Join a team of high-performers dedicated to making life insurance simple, accessible, and trustworthy. We're growing fast and looking for exceptional people.
            </p>
            <a
              href="#positions"
              className="inline-block bg-heritage-accent hover:bg-heritage-accent/80 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              View Open Positions
            </a>
          </motion.div>
        </div>
      </section>

      {/* WHY HERITAGE */}
      <section className="bg-[#fffaf3] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Heritage?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built a company where talented people can do meaningful work while advancing their careers.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-[#f5f0e8] rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-heritage-primary/10 rounded-xl flex items-center justify-center mb-5 mx-auto">
                  <benefit.icon className="w-7 h-7 text-heritage-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section className="bg-[#f5f0e8] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">What We Stand For</h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Our culture isn't just words on a wall—it's how we operate every day. We're looking for people who align with these principles.
              </p>
              <div className="space-y-6">
                {values.map((value, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-2 h-2 bg-heritage-accent rounded-full mt-3 flex-shrink-0"></div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <div className="h-48 rounded-2xl overflow-hidden">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1769123483407-diverse-professional-group-stockcake.webp?alt=media&token=671e517e-235b-41dd-a0e3-f3a5afd12a5e"
                    alt="Diverse professional team"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 rounded-2xl overflow-hidden">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1769123487684-professional-team-portrait-stockcake.webp?alt=media&token=0969c578-7e21-4d1e-9d1d-853359851c2e"
                    alt="Professional team portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 rounded-2xl overflow-hidden">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1769123491729-istockphoto-171303489-612x612.jpg?alt=media&token=244f2892-560f-4676-9185-fcb7adc77224"
                    alt="Team collaboration"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-48 rounded-2xl overflow-hidden">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1769123495841-corporate-team-march-stockcake.webp?alt=media&token=aa088542-af93-4491-8ca1-d86e7ec0385b"
                    alt="Corporate team"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* APPLICATION PROCESS */}
      <section className="bg-[#fffaf3] py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Application Process</h2>
            <p className="text-xl text-gray-600">What to Expect</p>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              We value your time. Our process is quick, transparent, and respectful.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-16 h-16 bg-heritage-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* OPEN POSITIONS */}
      <section id="positions" className="bg-[#f5f0e8] py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-xl text-gray-600">
              Find the role that's right for you.
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {openPositions.map((position, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                onClick={() => handleOpenModal(position)}
                className="bg-white rounded-2xl p-6 border border-[#e8e0d5] hover:shadow-lg hover:border-heritage-primary/30 transition-all group cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-semibold text-heritage-accent bg-heritage-accent/10 px-3 py-1 rounded-full">
                        {position.department}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-heritage-primary transition-colors">
                      {position.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{position.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {position.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-heritage-primary/10 group-hover:bg-heritage-primary rounded-full flex items-center justify-center transition-colors">
                      <ChevronRight className="w-5 h-5 text-heritage-primary group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DON'T SEE YOUR ROLE */}
      <section className="bg-[#fffaf3] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Briefcase className="w-12 h-12 text-heritage-accent mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Don't see the right role?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We're always looking for talented people. Send us your resume and tell us how you can contribute to our mission.
            </p>
            <a
              href="mailto:careers@heritagels.org"
              className="inline-block bg-heritage-primary hover:bg-heritage-dark text-white px-10 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Send Your Resume
            </a>
          </motion.div>
        </div>
      </section>

      {/* MEET THE TEAM CTA */}
      <section className="bg-heritage-primary py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Meet the team you'd be joining
            </h2>
            <p className="text-xl text-white/80 mb-10">
              Get to know the leaders driving Heritage forward.
            </p>
            <a
              href="/about/founders"
              className="inline-block bg-heritage-accent hover:bg-heritage-accent/80 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Meet Our Team
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* APPLICATION MODAL */}
      <AnimatePresence>
        {selectedPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {modalStep === "form" ? (
                <>
                  {/* Form Header */}
                  <div className="p-6 border-b border-[#e8e0d5]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-heritage-accent font-semibold text-sm mb-1">Step 1</p>
                        <h3 className="text-2xl font-bold text-gray-900">Apply for this position</h3>
                        <p className="text-gray-600 mt-1">{selectedPosition.title}</p>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Form Body */}
                  <form onSubmit={handleSubmitApplication} className="p-6 space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-[#e8e0d5] rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-[#e8e0d5] rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all"
                          placeholder="Smith"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-[#e8e0d5] rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-[#e8e0d5] rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[#e8e0d5] rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Why do you want to join Heritage? *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 border border-[#e8e0d5] rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent transition-all resize-none"
                        placeholder="Tell us about yourself and why you'd be a great fit..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-heritage-primary hover:bg-heritage-dark disabled:bg-heritage-primary/50 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* Book Call Header */}
                  <div className="p-6 border-b border-[#e8e0d5]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-heritage-accent font-semibold text-sm mb-1">Step 2</p>
                        <h3 className="text-2xl font-bold text-gray-900">Now Book Your Call</h3>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Book Call Body */}
                  <div className="p-6 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Your application has been received! Complete your application by scheduling a 30-minute intro call with our team.
                    </p>

                    <a
                      href="https://calendly.com/heritagels"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-3 w-full bg-heritage-primary hover:bg-heritage-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors mb-6"
                    >
                      <Calendar className="w-5 h-5" />
                      Book Your 30-Minute Call
                    </a>

                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">
                        Questions? Email us at{" "}
                        <a href="mailto:applications@heritagels.com" className="text-heritage-primary hover:underline">
                          applications@heritagels.com
                        </a>
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
