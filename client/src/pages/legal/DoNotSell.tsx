import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapSelector from "@/components/MapSelector";
import {
  ShieldOff,
  ChevronRight,
  CheckCircle,
  Info,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Send,
  Shield
} from "lucide-react";

export default function DoNotSell() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    requestType: "do-not-sell",
    additionalInfo: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestTypeLabels: Record<string, string> = {
        'do-not-sell': 'Do Not Sell My Personal Information',
        'delete': 'Delete My Personal Information',
        'access': 'Access My Personal Information',
        'correct': 'Correct My Personal Information'
      };

      const message = `PRIVACY REQUEST: ${requestTypeLabels[formData.requestType]}

Reference: DNR-${Date.now().toString().slice(-8)}

REQUESTOR INFORMATION:
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}

Address: ${formData.address || 'Not provided'}
${formData.city ? `${formData.city}, ` : ''}${formData.state || ''} ${formData.zip || ''}

State of Residence: ${formData.state}

Additional Information:
${formData.additionalInfo || 'None provided'}`;

      const response = await fetch('/api/privacy-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          requestType: formData.requestType,
          message: message
        }),
      });

      if (!response.ok) throw new Error('Failed to submit request');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting privacy request:', error);
      alert('There was an error submitting your request. Please try again or email privacy@heritagels.org directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8]">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-heritage-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="w-16 h-16 bg-heritage-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldOff className="w-8 h-8 text-heritage-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Do Not Sell My Personal Information
            </h1>
            <p className="text-white/80 text-lg">
              Exercise your privacy rights under California and other state privacy laws
            </p>
          </motion.div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Important Notice */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 mb-2">Heritage Life Solutions Does Not Sell Your Data</h3>
                    <p className="text-green-700 text-sm">
                      We want you to know that Heritage Life Solutions does not sell your personal information
                      to third parties for monetary consideration. However, we respect your right to make this
                      request and will document your preference.
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-heritage-primary mb-4">Your Privacy Rights</h2>
                <p className="text-gray-600 mb-6">
                  Under the California Consumer Privacy Act (CCPA), California Privacy Rights Act (CPRA),
                  and similar state privacy laws, you have the right to:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: "Know", description: "Request disclosure of what personal information we collect" },
                    { title: "Delete", description: "Request deletion of your personal information" },
                    { title: "Opt-Out", description: "Opt out of the sale or sharing of your personal information" },
                    { title: "Non-Discrimination", description: "Not be discriminated against for exercising your rights" }
                  ].map((right) => (
                    <div key={right.title} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-heritage-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-heritage-primary">Right to {right.title}</p>
                          <p className="text-sm text-gray-600">{right.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What We Share */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-blue-800 mb-2">Information We May Share</h3>
                    <p className="text-blue-700 text-sm mb-4">
                      While we do not sell your data, we may share information with:
                    </p>
                    <ul className="space-y-2 text-blue-700 text-sm">
                      <li>• <strong>Insurance carriers</strong> to process your applications and quotes</li>
                      <li>• <strong>Service providers</strong> who help us operate our business</li>
                      <li>• <strong>As required by law</strong> or to protect our legal rights</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Request Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-heritage-primary mb-2">Submit Your Request</h2>
              <p className="text-gray-600">
                Complete this form to exercise your privacy rights
              </p>
            </motion.div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-heritage-primary mb-2">Request Submitted</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for your submission. We will process your request within 45 days as required
                  by law. You will receive a confirmation email shortly.
                </p>
                <p className="text-sm text-gray-500">
                  Reference Number: DNR-{Date.now().toString().slice(-8)}
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
              >
                {/* Request Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type *
                  </label>
                  <select
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                  >
                    <option value="do-not-sell">Do Not Sell My Personal Information</option>
                    <option value="delete">Delete My Personal Information</option>
                    <option value="access">Access My Personal Information</option>
                    <option value="correct">Correct My Personal Information</option>
                  </select>
                </div>

                {/* Name */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                      placeholder="123 Main St"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="CA">California</option>
                      <option value="CO">Colorado</option>
                      <option value="CT">Connecticut</option>
                      <option value="VA">Virginia</option>
                      <option value="OTHER">Other State</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                      placeholder="12345"
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent resize-none"
                    placeholder="Any additional details about your request..."
                  />
                </div>

                {/* Verification Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">
                      <strong>Identity Verification:</strong> To protect your privacy, we may need to verify
                      your identity before processing your request. We may contact you for additional information.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full bg-heritage-primary hover:bg-heritage-primary/90 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request <Send className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  We will respond to your request within 45 days as required by law.
                </p>
              </motion.form>
            )}
          </div>
        </div>
      </section>

      {/* Alternative Methods */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-heritage-primary mb-2">Other Ways to Submit</h2>
              <p className="text-gray-600">
                You can also submit your request through these channels
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-heritage-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-heritage-primary" />
                </div>
                <h3 className="font-bold text-heritage-primary mb-2">By Phone</h3>
                <p className="text-gray-600 text-sm mb-3">Call our privacy hotline</p>
                <a href="tel:6307780800" className="text-heritage-primary font-medium hover:text-heritage-accent">
                  (630) 778-0800
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gray-50 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-heritage-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-heritage-primary" />
                </div>
                <h3 className="font-bold text-heritage-primary mb-2">By Email</h3>
                <p className="text-gray-600 text-sm mb-3">Email our privacy team</p>
                <a href="mailto:privacy@heritagels.org" className="text-heritage-primary font-medium hover:text-heritage-accent">
                  privacy@heritagels.org
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-heritage-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-heritage-primary" />
                </div>
                <h3 className="font-bold text-heritage-primary mb-2">By Mail</h3>
                <p className="text-gray-600 text-sm mb-3">Send written request to:</p>
                <MapSelector>
                  <span className="text-sm text-gray-600 hover:text-heritage-primary transition-colors block cursor-pointer">
                    1240 Iroquois Ave, Suite 506<br />
                    Naperville, IL 60563
                  </span>
                </MapSelector>
              </motion.div>
            </div>

            {/* Related Links */}
            <div className="mt-12 text-center">
              <h3 className="font-semibold text-heritage-primary mb-4">Related Policies</h3>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/legal/privacy" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-heritage-primary bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                  Privacy Policy <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/legal/terms" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-heritage-primary bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                  Terms of Use <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/legal/data-security" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-heritage-primary bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                  Data Security <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
