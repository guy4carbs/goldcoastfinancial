import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapSelector from "@/components/MapSelector";
import TrustIndicators from "@/components/TrustIndicators";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const contactMethods = [
  {
    icon: Phone,
    title: "Call Us",
    description: "Speak with a licensed advisor",
    value: "(630) 778-0800",
    link: "tel:6307780800"
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "We'll respond within 24 hours",
    value: "contact@heritagels.org",
    link: "mailto:contact@heritagels.org"
  },
  {
    icon: Clock,
    title: "Business Hours",
    description: "Monday - Friday",
    value: "9:00 AM - 5:00 PM CT",
    link: null
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Include subject in message for the API
      const messageWithSubject = formData.subject
        ? `[${formData.subject.toUpperCase()}]\n\n${formData.message}`
        : formData.message;

      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || '',
          message: messageWithSubject,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('There was an error sending your message. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      {/* HERO SECTION */}
      <section className="bg-primary py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <p className="text-violet-500 font-semibold mb-4 tracking-wide uppercase text-sm">Contact</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-balance">
              Let's talk
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto text-pretty">
              Have questions about life insurance? Ready to get a quote? We're here to help—reach out anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONTACT METHODS */}
      <section className="bg-[#fffaf3] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 border border-[#e8e0d5] text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 mx-auto">
                  <method.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{method.title}</h3>
                <p className="text-gray-500 text-sm mb-3">{method.description}</p>
                {method.link ? (
                  <a
                    href={method.link}
                    className="text-primary font-semibold hover:text-violet-500 transition-colors"
                  >
                    {method.value}
                  </a>
                ) : (
                  <p className="text-primary font-semibold">{method.value}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators variant="inline" />

      {/* CONTACT FORM & MAP */}
      <section className="bg-[#fffaf3] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-balance">Send us a message</h2>
              <p className="text-gray-600 mb-8 text-pretty">
                Fill out the form below and one of our team members will get back to you within 24 hours.
              </p>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-balance">Message Sent!</h3>
                  <p className="text-gray-600 text-pretty">
                    Thank you for reaching out. We'll be in touch within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#e8e0d5] rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#e8e0d5] rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#e8e0d5] rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-[#e8e0d5] rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-[#e8e0d5] rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select a topic</option>
                      <option value="quote">Get a Quote</option>
                      <option value="policy">Existing Policy Question</option>
                      <option value="claims">Claims Inquiry</option>
                      <option value="careers">Careers</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-[#e8e0d5] rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-heritage-dark disabled:bg-primary/50 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Office Info & Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-balance">Visit our office</h2>
              <p className="text-gray-600 mb-8 text-pretty">
                Stop by our headquarters in Naperville. We'd love to meet you in person.
              </p>

              {/* Google Map Embed */}
              <div className="h-48 md:h-64 rounded-2xl mb-8 overflow-hidden shadow-lg">
                <iframe
                  src="https://maps.google.com/maps?q=1240+Iroquois+Ave,+Suite+506,+Naperville,+IL+60563&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Heritage Life Solutions Office Location"
                />
              </div>

              {/* Address Card */}
              <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 border border-[#e8e0d5]">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Heritage Life Solutions</h3>
                <MapSelector className="block">
                  <span className="text-gray-600 leading-relaxed hover:text-primary transition-colors cursor-pointer block">
                    1240 Iroquois Ave<br />
                    Suite 506<br />
                    Naperville, IL 60563
                  </span>
                  <span className="text-primary font-semibold hover:text-violet-500 transition-colors cursor-pointer inline-block mt-4">
                    Get Directions →
                  </span>
                </MapSelector>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-primary py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-balance">
              Ready to get covered?
            </h2>
            <p className="text-xl text-white/80 mb-10 text-pretty">
              Get a personalized quote in minutes. No medical exam required.
            </p>
            <a
              href="/quote"
              className="inline-block bg-violet-500 hover:bg-violet-500/80 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Check My Price
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
