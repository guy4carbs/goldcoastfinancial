import { motion } from "framer-motion";
import { Heart, Shield, Users, Target, Award, TrendingUp } from "lucide-react";
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

const values = [
  {
    icon: Heart,
    title: "People First",
    description: "Every decision we make starts with one question: how does this help our clients and their families?"
  },
  {
    icon: Shield,
    title: "Integrity Always",
    description: "We believe in honest advice, transparent pricing, and doing what's right—even when no one is watching."
  },
  {
    icon: Users,
    title: "Community Focused",
    description: "We're proud to serve families in Illinois and beyond, building lasting relationships one policy at a time."
  },
  {
    icon: Target,
    title: "Simplicity Matters",
    description: "Life insurance shouldn't be complicated. We cut through the jargon to give you clear, actionable guidance."
  }
];

const stats = [
  { number: "15+", label: "Years of Experience" },
  { number: "10,000+", label: "Families Protected" },
  { number: "40+", label: "Carrier Partners" },
  { number: "4.8", label: "Average Rating" }
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      {/* HERO SECTION */}
      <section className="bg-heritage-primary py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <p className="text-heritage-accent font-semibold mb-4 tracking-wide uppercase text-sm">About Heritage</p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                We're reimagining life insurance for modern families.
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                Heritage Life Solutions was founded on a simple belief: protecting your family shouldn't be complicated, expensive, or time-consuming.
              </p>
            </motion.div>

            {/* Right Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="h-[500px] bg-white/10 rounded-3xl overflow-hidden">
                {/* Image placeholder - team or office photo */}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* OUR STORY SECTION */}
      <section className="bg-[#fffaf3] py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Our Story</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed text-left">
              <p>
                Heritage Life Solutions started with a frustration that too many families know all too well: trying to get life insurance felt like navigating a maze blindfolded. Weeks of paperwork. Confusing jargon. Pushy sales tactics. Medical exams that took forever to schedule.
              </p>
              <p>
                Our founders experienced this firsthand when trying to protect their own families. They knew there had to be a better way—a way that respected people's time, offered honest guidance, and made coverage accessible to everyone.
              </p>
              <p>
                So in 2019, Heritage was born in Naperville, Illinois. We partnered with over 40 A-rated insurance carriers to offer real choices, built technology that delivers quotes in minutes instead of weeks, and assembled a team of licensed advisors who genuinely care about finding the right fit for each family.
              </p>
              <p className="font-semibold text-gray-900">
                Today, we've helped over 10,000 families secure their futures. But we're just getting started.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MISSION STATEMENT */}
      <section className="bg-heritage-primary py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="text-heritage-accent font-semibold mb-4 tracking-wide uppercase text-sm">Our Mission</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              To give every family the clarity and protection they deserve—without the hassle.
            </h2>
          </motion.div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section className="bg-[#fffaf3] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What We Stand For</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do.</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-[#f5f0e8] rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-heritage-primary/10 rounded-xl flex items-center justify-center mb-5">
                  <value.icon className="w-7 h-7 text-heritage-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-[#f5f0e8] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-bold text-heritage-primary mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WHY HERITAGE */}
      <section className="bg-[#fffaf3] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="h-[450px] bg-[#e8e0d5] rounded-3xl overflow-hidden">
                {/* Image placeholder - advisor with family */}
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Why families choose Heritage</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-heritage-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-heritage-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Real Savings</h3>
                    <p className="text-gray-600">We shop 40+ carriers to find you the best rate. Our clients save an average of $500/year compared to going direct.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-heritage-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-heritage-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Guidance</h3>
                    <p className="text-gray-600">Our licensed advisors have decades of combined experience. We answer your questions and never pressure you.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-heritage-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-heritage-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Trusted Partners</h3>
                    <p className="text-gray-600">We only work with A-rated carriers with proven track records of paying claims. Your family's security is non-negotiable.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
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
              Meet the people behind Heritage
            </h2>
            <p className="text-xl text-white/80 mb-10">
              Get to know the founders and team members who are dedicated to protecting your family.
            </p>
            <a
              href="/about/founders"
              className="inline-block bg-heritage-accent hover:bg-heritage-accent/80 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Meet Our Founders
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
