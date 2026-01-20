import { Shield, Award, Clock, Lock, CheckCircle, Star, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

interface TrustIndicatorsProps {
  variant?: "full" | "compact" | "inline" | "badges";
}

// Carrier partner data
const carrierPartners = [
  { name: "Protective Life", rating: "A+" },
  { name: "North American", rating: "A+" },
  { name: "Transamerica", rating: "A" },
  { name: "Lincoln Financial", rating: "A+" },
  { name: "Pacific Life", rating: "A+" },
  { name: "Nationwide", rating: "A+" },
];

// Trust badges
const trustBadges = [
  {
    icon: Shield,
    title: "256-bit SSL Encryption",
    description: "Your data is protected with bank-level security",
  },
  {
    icon: BadgeCheck,
    title: "Licensed in All 50 States",
    description: "Fully compliant with state insurance regulations",
  },
  {
    icon: Award,
    title: "A-Rated Carriers Only",
    description: "We only work with financially strong insurers",
  },
  {
    icon: Clock,
    title: "30-Day Money-Back Guarantee",
    description: "Full refund if you're not satisfied",
  },
];

// Stats
const stats = [
  { value: "50,000+", label: "Families Protected" },
  { value: "4.9/5", label: "Customer Rating" },
  { value: "$2B+", label: "Coverage Issued" },
  { value: "10 min", label: "Avg. Approval Time" },
];

export default function TrustIndicators({ variant = "full" }: TrustIndicatorsProps) {
  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 py-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">SSL Secured</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Award className="w-4 h-4 text-heritage-primary" />
          <span className="text-sm font-medium">A-Rated Carriers</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4 text-heritage-accent" />
          <span className="text-sm font-medium">30-Day Guarantee</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">Licensed in 50 States</span>
        </div>
      </div>
    );
  }

  if (variant === "badges") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trustBadges.map((badge, index) => (
          <motion.div
            key={badge.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
          >
            <div className="w-12 h-12 bg-heritage-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <badge.icon className="w-6 h-6 text-heritage-primary" />
            </div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1">{badge.title}</h4>
            <p className="text-xs text-gray-500">{badge.description}</p>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-heritage-primary">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-4xl font-bold text-heritage-primary mb-2">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
            >
              <div className="w-12 h-12 bg-heritage-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <badge.icon className="w-6 h-6 text-heritage-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{badge.title}</h4>
                <p className="text-sm text-gray-500">{badge.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Carrier Partners */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-6">
            Partnered with A-Rated Insurance Carriers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {carrierPartners.map((carrier, index) => (
              <motion.div
                key={carrier.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-700">{carrier.name}</span>
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                  {carrier.rating}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Money-Back Guarantee Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-heritage-primary/10 to-heritage-accent/10 rounded-2xl p-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
              <Shield className="w-8 h-8 text-heritage-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            30-Day Money-Back Guarantee
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Not satisfied with your coverage? Cancel within 30 days of policy issuance and receive a full refund
            of any premiums paid. No questions asked. We're confident you'll love the peace of mind.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Separate component for carrier logo strip
export function CarrierStrip() {
  return (
    <div className="py-8 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm text-gray-500 mb-4">
          Coverage provided by A-rated insurance carriers
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {carrierPartners.map((carrier) => (
            <div
              key={carrier.name}
              className="flex items-center gap-1.5 text-gray-600"
            >
              <Star className="w-4 h-4 text-heritage-accent" />
              <span className="font-medium text-sm">{carrier.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Rating badge component
export function RatingBadge() {
  return (
    <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-md border border-gray-100">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-yellow-400 fill-yellow-400"}`}
          />
        ))}
      </div>
      <div className="text-sm">
        <span className="font-bold text-gray-900">4.9/5</span>
        <span className="text-gray-500 ml-1">from 2,500+ reviews</span>
      </div>
    </div>
  );
}
