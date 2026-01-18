import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import {
  MapPin, Mail, ArrowRight, Building, Briefcase, Users, Leaf, Phone, Clock,
  User, Building2, MessageSquare, CheckCircle, Loader2, HelpCircle
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InstitutionalSecurityBadges } from "@/components/ui/institutional-security-badges";
import { InstitutionalAppointmentScheduler } from "@/components/ui/institutional-appointment-scheduler";

// Enhanced Institutional FAQs
const institutionalFaqs = [
  {
    question: "How do I contact Gold Coast Financial for a corporate matter?",
    answer: "For corporate development, partnership opportunities, or institutional inquiries, please submit an inquiry through our contact form or email corporate@goldcoastfnl.com. Our corporate team reviews all inquiries and responds within 2-3 business days."
  },
  {
    question: "Does Gold Coast Financial sell insurance directly to consumers?",
    answer: "No. Gold Coast Financial operates as a holding company providing governance and oversight to our operating companies. Consumer insurance inquiries should be directed to Heritage Life Solutions, our life insurance brokerage."
  },
  {
    question: "What types of partnerships does Gold Coast Financial consider?",
    answer: "We evaluate potential partnerships with financial services businesses that demonstrate strong regulatory standing, experienced management teams, sustainable competitive positions, and alignment with our long-term orientation."
  },
  {
    question: "Is Gold Coast Financial a private equity firm?",
    answer: "No. Unlike private equity firms that typically seek exits within a defined timeframe, Gold Coast Financial acquires and develops financial services businesses with the intent to hold them indefinitely."
  },
  {
    question: "How can I apply for a position at Gold Coast Financial?",
    answer: "Executive and corporate-level positions within the holding company can be inquired about by contacting applications@goldcoastfnl.com. For positions within our operating companies, please visit their respective career pages."
  },
];

/**
 * Gold Coast Financial - Corporate Contact Page
 *
 * Enhanced with:
 * - Form icons and validation
 * - Security badges
 * - Appointment scheduler
 * - Better styling
 */

function CorporateInquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    organization: "",
    email: "",
    phone: "",
    inquiryType: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.inquiryType) {
      newErrors.inquiryType = "Please select an inquiry type";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/institutional/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          title: formData.title || null,
          organization: formData.organization || null,
          email: formData.email,
          phone: formData.phone || null,
          inquiryType: formData.inquiryType,
          message: formData.message,
          source: "contact_form",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      setIsSubmitted(true);
      toast({
        title: "Inquiry Submitted",
        description: "Our corporate team will respond within 2-3 business days.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or email us directly at corporate@goldcoastfnl.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-border/60 p-8 rounded-sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-[hsl(348,65%,20%)]/5 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-[hsl(348,65%,25%)]" />
          </div>
          <h3 className="text-lg font-medium text-primary mb-2">Inquiry Received</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Thank you for your inquiry. Our corporate team will review your message and respond within 2-3 business days.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                name: "", title: "", organization: "", email: "",
                phone: "", inquiryType: "", message: ""
              });
            }}
            className="text-sm"
          >
            Submit Another Inquiry
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border/60 p-8 rounded-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 text-sm border rounded-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 ${
                errors.name ? "border-red-300" : "border-border/60"
              }`}
              placeholder="Your name"
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Title
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full pl-10 pr-4 py-3 text-sm border border-border/60 rounded-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              placeholder="Your title"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Organization
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full pl-10 pr-4 py-3 text-sm border border-border/60 rounded-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              placeholder="Company or organization"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 text-sm border rounded-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 ${
                errors.email ? "border-red-300" : "border-border/60"
              }`}
              placeholder="your@email.com"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-3 text-sm border border-border/60 rounded-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Inquiry Type *
          </label>
          <select
            value={formData.inquiryType}
            onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
            className={`w-full px-4 py-3 text-sm border rounded-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 ${
              errors.inquiryType ? "border-red-300" : "border-border/60"
            }`}
          >
            <option value="">Select inquiry type</option>
            <option value="partnership">Partnership Opportunity</option>
            <option value="acquisition">Acquisition Discussion</option>
            <option value="corporate-development">Corporate Development</option>
            <option value="institutional">Institutional Inquiry</option>
            <option value="regulatory">Regulatory Matter</option>
            <option value="careers">Career Opportunity</option>
            <option value="other">Other</option>
          </select>
          {errors.inquiryType && <p className="text-xs text-red-500 mt-1">{errors.inquiryType}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Message *
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <textarea
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className={`w-full pl-10 pr-4 py-3 text-sm border rounded-sm bg-white resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 ${
              errors.message ? "border-red-300" : "border-border/60"
            }`}
            placeholder="Please describe the nature of your inquiry, including any relevant context about your organization and objectives..."
          />
        </div>
        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
      </div>

      <div className="flex items-center justify-between pt-4">
        <p className="text-xs text-muted-foreground">
          * Required fields
        </p>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[hsl(348,65%,20%)] hover:bg-[hsl(348,65%,25%)] text-white px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Inquiry"
          )}
        </Button>
      </div>

      <InstitutionalSecurityBadges />
    </form>
  );
}

export default function InstitutionalContact() {
  return (
    <InstitutionalLayout>
      {/* Hero */}
      <section className="hero-gradient py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent" />
        <div className="container mx-auto px-6 lg:px-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "3rem" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="h-1 bg-secondary mb-8"
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-10">
              Corporate & Partnership Inquiries
            </h1>
            <div className="accent-line-animated" />
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Contact Types - Enhanced Cards */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                title: "Corporate Development",
                description: "Partnership opportunities, acquisition inquiries, and strategic discussions.",
                email: "corporate@goldcoastfnl.com"
              },
              {
                icon: Building,
                title: "Institutional Inquiries",
                description: "Regulatory matters, carrier relationships, and institutional communications.",
                email: "contact@goldcoastfnl.com"
              },
              {
                icon: Users,
                title: "Career Opportunities",
                description: "Executive and corporate-level positions within the holding company.",
                email: "applications@goldcoastfnl.com"
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
                className="p-8 rounded-lg bg-gradient-to-b from-white to-gray-50/50 border border-border/40 hover:border-primary/20 transition-all duration-300 space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-medium text-primary">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
                <a
                  href={`mailto:${item.email}`}
                  className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
                >
                  {item.email}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Consumer Redirect */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  Insurance Inquiries
                </h2>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <p className="text-lg text-primary leading-relaxed mb-6">
                Looking for life insurance coverage?
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Consumer insurance inquiries, policy questions, and coverage requests should be directed to our operating companies. Gold Coast Financial does not sell insurance products directly.
              </p>

              <div className="border border-border/60 p-6 bg-white rounded-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#4f5a3f] p-1.5 rounded-sm">
                    <Leaf className="w-4 h-4 text-[#d4a05b]" />
                  </div>
                  <span className="font-medium text-primary">Heritage Life Solutions</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Life insurance, mortgage protection, whole life, IUL, and final expense coverage.
                </p>
                <a
                  href="/heritage/contact"
                  className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
                >
                  Contact Heritage Life Solutions
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Schedule a Meeting - NEW */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  Schedule a Meeting
                </h2>
              </div>
              <p className="text-2xl md:text-3xl font-serif text-primary mb-6">
                Executive Discussions
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For partnership discussions, acquisition conversations, or strategic meetings with our leadership team.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <InstitutionalAppointmentScheduler />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Headquarters with Google Maps */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  Corporate Headquarters
                </h2>
              </div>
              <div className="space-y-6 mb-8">
                {[
                  {
                    icon: MapPin,
                    title: "Gold Coast Financial",
                    content: "1240 Iroquois Ave, Suite 506\nNaperville, IL 60563\nUnited States"
                  },
                  {
                    icon: Phone,
                    title: "Corporate Office",
                    content: "(630) 555-0123",
                    href: "tel:+16305550123"
                  },
                  {
                    icon: Mail,
                    title: "General Inquiries",
                    content: "contact@goldcoastfnl.com",
                    href: "mailto:contact@goldcoastfnl.com"
                  },
                  {
                    icon: Clock,
                    title: "Business Hours",
                    content: "Monday – Friday: 9:00 AM – 5:00 PM CT\nSaturday – Sunday: Closed"
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-primary font-medium mb-1">{item.title}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-muted-foreground text-sm hover:text-primary transition-colors"
                        >
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm whitespace-pre-line">
                          {item.content}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Google Maps Embed */}
              <div className="rounded-lg overflow-hidden border border-border/60 hover:shadow-lg transition-shadow">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2976.4876!2d-88.1423!3d41.7731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e5761b4d60279%3A0x8c29f6e6f9d8d4e0!2s1240%20Iroquois%20Ave%2C%20Naperville%2C%20IL%2060563!5e0!3m2!1sen!2sus!4v1705000000000!5m2!1sen!2sus"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="map-grayscale hover:filter-none transition-all duration-500"
                  title="Gold Coast Financial Headquarters"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  Submit an Inquiry
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                For corporate development, partnership opportunities, or institutional matters.
              </p>
              <CorporateInquiryForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* FAQ Accordion - Enhanced */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  Common Questions
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Answers to frequently asked questions about Gold Coast Financial and our corporate operations.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Accordion type="single" collapsible className="space-y-3">
                {institutionalFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-white border border-border/40 rounded-lg px-6 data-[state=open]:border-primary/20 data-[state=open]:shadow-sm transition-all"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5 text-sm font-medium text-primary [&[data-state=open]>svg]:text-secondary">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 pl-7 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Media */}
      <section className="py-20 md:py-28 dark-gradient text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/5 to-transparent" />
        <div className="container mx-auto px-6 lg:px-12 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  Media Inquiries
                </h2>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <p className="text-lg leading-relaxed mb-6">
                For press inquiries and media requests, please contact our communications team.
              </p>
              <p className="text-primary-foreground/80 leading-relaxed mb-6">
                Gold Coast Financial responds to legitimate media inquiries from credentialed journalists and publications. Please include your publication name, deadline, and specific questions.
              </p>
              <a
                href="mailto:media@goldcoastfnl.com"
                className="arrow-link text-sm font-medium text-secondary hover:text-secondary/80 transition-colors inline-flex items-center gap-2"
              >
                media@goldcoastfnl.com
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
