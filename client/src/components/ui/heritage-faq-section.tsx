import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { Link } from "wouter";

// Heritage Life Solutions color palette
const c = {
  background: "#f5f0e8",
  primary: "#4f5a3f",
  primaryHover: "#3d4730",
  secondary: "#d4a05b",
  secondaryHover: "#c49149",
  muted: "#c8b6a6",
  textPrimary: "#333333",
  textSecondary: "#5c5347",
  cream: "#fffaf3",
  white: "#ffffff",
};

const faqs = [
  {
    question: "How fast can I get approved for life insurance?",
    answer: "With our streamlined process, you'll know if you're approved within minutes—not days or weeks. We specialize in no medical exam policies that use instant underwriting technology. Simply answer a few health questions, and you'll receive an immediate decision. No needles, no waiting rooms, no lengthy applications. Most of our clients complete the entire process in a single phone call or online session."
  },
  {
    question: "When does my coverage actually start?",
    answer: "Your coverage begins as soon as your policy is issued and your first premium is paid—which can be as early as the next business day. Unlike some policies that make you wait years before full benefits kick in, our policies provide immediate, full coverage from day one. There's no two-year waiting period. If something happens to you tomorrow, your family is protected immediately with the full death benefit you purchased."
  },
  {
    question: "What is the Accidental Death Benefit, and do I get it?",
    answer: "Almost all of our policies include an Accidental Death Benefit at no additional cost to you. This means if you pass away due to an accident (car crash, fall, or other sudden events), your beneficiaries receive DOUBLE the death benefit. So if you have a $500,000 policy, your family would receive $1,000,000 if your death is accidental—with no extra premium. It's built-in protection that provides extra peace of mind."
  },
  {
    question: "Do I need a medical exam to get life insurance?",
    answer: "No! We specialize in no-exam life insurance policies. You won't need to schedule a medical exam, give blood, or visit a doctor's office. Our policies use simplified underwriting—just answer a few straightforward health questions and you're done. This makes the process faster, easier, and more convenient for busy families."
  },
  {
    question: "How much life insurance coverage do I need?",
    answer: "A common rule of thumb is 10-12 times your annual income, but the right amount depends on your specific situation. Consider your debts (mortgage, loans), income replacement needs, future education costs for children, and final expenses. Our advisors can help you calculate the exact coverage amount for your family's needs using our free coverage calculator."
  },
  {
    question: "What's the difference between term and whole life insurance?",
    answer: "Term life insurance provides coverage for a specific period (10, 20, or 30 years) and is the most affordable option—perfect for protecting your family during your working years. Whole life insurance provides permanent coverage that lasts your entire life and builds cash value over time. Many families benefit from a combination of both types. We'll help you determine the right mix for your goals."
  },
  {
    question: "Why should I work with Heritage Life Solutions instead of buying online?",
    answer: "As an independent agency, we're not tied to any single insurance company. This means we shop the market across 20+ top-rated carriers to find you the best coverage at the most competitive rates. We work for you, not the insurance companies. Plus, you get personalized guidance from a licensed advisor who understands your unique situation—something you won't get from a website."
  },
  {
    question: "Can I change my life insurance policy later?",
    answer: "Absolutely! Many term policies include a conversion option that allows you to convert to permanent insurance without a new medical exam—even if your health has changed. You can also adjust coverage amounts, add riders, or purchase additional policies as your life evolves. We're here to help you adapt your coverage as your needs change."
  },
  {
    question: "Is life insurance taxable?",
    answer: "Great news—life insurance death benefits are generally paid to your beneficiaries completely tax-free. The cash value in permanent policies also grows tax-deferred. This makes life insurance one of the most tax-efficient ways to transfer wealth to your loved ones. There can be some exceptions for very large estates, so we recommend consulting with a tax professional for complex situations."
  },
  {
    question: "What happens if I miss a premium payment?",
    answer: "Don't worry—most policies have a grace period (typically 30-31 days) during which you can make a late payment without losing coverage. If you're experiencing financial difficulties, contact us immediately. There are often options like reducing coverage, adjusting payment schedules, or using cash value (for permanent policies) to keep your policy active. We're here to help you maintain your protection."
  }
];

export function HeritageFAQSection() {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: c.white }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
            <span className="font-medium tracking-wide uppercase text-sm" style={{ color: c.secondary }}>Got Questions?</span>
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4" style={{ color: c.primary }}>
            Frequently Asked Questions
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: c.textSecondary }}>
            Find answers to common questions about life insurance. Still have questions? We're here to help.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-xl px-6 transition-all duration-300"
                style={{
                  borderColor: c.muted,
                  backgroundColor: c.cream
                }}
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: c.primary }} />
                    <span className="font-semibold" style={{ color: c.primary }}>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pl-8 leading-relaxed" style={{ color: c.textSecondary }}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="mb-4" style={{ color: c.textSecondary }}>
            Don't see your question? Our advisors are ready to help.
          </p>
          <Link
            href="/heritage/contact"
            className="inline-flex items-center gap-2 font-semibold transition-colors"
            style={{ color: c.primary }}
          >
            Contact Us →
          </Link>
        </motion.div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
