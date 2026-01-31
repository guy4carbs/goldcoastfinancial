import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import {
  Shield, Lock, Heart, TrendingUp, Clock, CheckCircle,
  DollarSign, Users, BarChart, Zap, Plus, Sliders,
  ArrowLeft, ExternalLink, Star, Award, Building2, Calendar,
  Quote, Check, Phone, ArrowRight
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getCarrierBySlug } from "@/data/carriers";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// Icon mapping
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Shield, Lock, Heart, TrendingUp, Clock, CheckCircle,
  DollarSign, Users, BarChart, Zap, Plus, Sliders
};

export default function CarrierPage() {
  const { slug } = useParams<{ slug: string }>();
  const carrier = getCarrierBySlug(slug || "");

  if (!carrier) {
    return (
      <div className="min-h-screen bg-[#fffaf3] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Carrier Not Found</h1>
            <p className="text-gray-600 mb-8">The insurance carrier you're looking for doesn't exist.</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-primary py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src={carrier.heroImage}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Link href="/" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>

            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10 mb-8">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl p-4 flex items-center justify-center shadow-xl">
                <img
                  src={carrier.logo}
                  alt={carrier.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  {carrier.name}
                </h1>
                <p className="text-xl text-white/80 mb-4">{carrier.tagline}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <Award className="w-5 h-5 text-violet-400" />
                    <span className="text-white font-medium">{carrier.rating} Rated by {carrier.ratingAgency}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <Calendar className="w-5 h-5 text-violet-400" />
                    <span className="text-white font-medium">Est. {carrier.founded}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <Building2 className="w-5 h-5 text-violet-400" />
                    <span className="text-white font-medium">{carrier.headquarters}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Stats Bar */}
      <section className="bg-[#f5f0e8] border-b border-[#e8e0d5]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e8e0d5]">
            {carrier.keyStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="py-8 px-4 text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 md:py-20 bg-[#fffaf3]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About {carrier.name.split(' ')[0]}</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">{carrier.overview}</p>
              <p className="text-gray-600 leading-relaxed">{carrier.history}</p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={carrier.heroImage}
                  alt={`${carrier.name} - Professional Services`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-xs hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Trusted Partner</p>
                    <p className="text-sm text-gray-500">Verified by Heritage Life</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 md:py-20 bg-[#f5f0e8]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose {carrier.name.split(' ')[0]}?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Key reasons families trust {carrier.name.split(' ')[0]} for their life insurance needs
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-4"
          >
            {carrier.whyChoose.map((reason, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <p className="text-gray-700">{reason}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-20 bg-[#fffaf3]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Available Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive coverage options to protect what matters most
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {carrier.products.map((product, i) => {
              const IconComponent = iconMap[product.icon] || Shield;
              return (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group border border-[#e8e0d5]"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                      <IconComponent className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600">{product.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Customers Say
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Real experiences from real policyholders
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {carrier.testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8"
              >
                <Quote className="w-10 h-10 text-violet-400 mb-4" />
                <p className="text-lg text-white leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-white/70 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-[#f5f0e8]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Get Protected with {carrier.name.split(' ')[0]}?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Our team at Heritage Life Solutions can help you find the perfect {carrier.name.split(' ')[0]} policy for your needs. Get a personalized quote in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg w-full sm:w-auto">
                  Get Your Free Quote
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-lg w-full sm:w-auto">
                  <Phone className="w-5 h-5 mr-2" />
                  Talk to an Advisor
                </Button>
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-[#e8e0d5]">
              <p className="text-sm text-gray-500 mb-4">Learn more about {carrier.name}</p>
              <a
                href={carrier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Visit Official Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-12 bg-white border-t border-[#e8e0d5]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#f5f0e8] rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Trusted Partner of Heritage Life Solutions</p>
                <p className="text-gray-600">Working together to protect families nationwide</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600">5-Star Carrier Partner</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
