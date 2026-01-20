import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Award,
  ChevronRight,
  ChevronDown,
  MapPin,
  Building,
  Shield,
  CheckCircle,
  Search,
  FileText,
  Phone,
  Mail
} from "lucide-react";

const companyInfo = {
  name: "Heritage Life Solutions, LLC",
  address: "1240 Iroquois Ave, Suite 506, Naperville, IL 60563",
  phone: "(630) 778-0800",
  email: "info@heritagels.com",
  nationalProducerNumber: "12345678",
  homeState: "Illinois"
};

const stateLicenses = [
  { state: "Alabama", license: "AL-123456", status: "active" },
  { state: "Alaska", license: "AK-123456", status: "active" },
  { state: "Arizona", license: "AZ-123456", status: "active" },
  { state: "Arkansas", license: "AR-123456", status: "active" },
  { state: "California", license: "CA-0H12345", status: "active" },
  { state: "Colorado", license: "CO-123456", status: "active" },
  { state: "Connecticut", license: "CT-123456", status: "active" },
  { state: "Delaware", license: "DE-123456", status: "active" },
  { state: "Florida", license: "FL-A123456", status: "active" },
  { state: "Georgia", license: "GA-123456", status: "active" },
  { state: "Hawaii", license: "HI-123456", status: "active" },
  { state: "Idaho", license: "ID-123456", status: "active" },
  { state: "Illinois", license: "IL-1001234567", status: "active" },
  { state: "Indiana", license: "IN-123456", status: "active" },
  { state: "Iowa", license: "IA-123456", status: "active" },
  { state: "Kansas", license: "KS-123456", status: "active" },
  { state: "Kentucky", license: "KY-123456", status: "active" },
  { state: "Louisiana", license: "LA-123456", status: "active" },
  { state: "Maine", license: "ME-123456", status: "active" },
  { state: "Maryland", license: "MD-123456", status: "active" },
  { state: "Massachusetts", license: "MA-123456", status: "active" },
  { state: "Michigan", license: "MI-123456", status: "active" },
  { state: "Minnesota", license: "MN-123456", status: "active" },
  { state: "Mississippi", license: "MS-123456", status: "active" },
  { state: "Missouri", license: "MO-123456", status: "active" },
  { state: "Montana", license: "MT-123456", status: "active" },
  { state: "Nebraska", license: "NE-123456", status: "active" },
  { state: "Nevada", license: "NV-123456", status: "active" },
  { state: "New Hampshire", license: "NH-123456", status: "active" },
  { state: "New Jersey", license: "NJ-123456", status: "active" },
  { state: "New Mexico", license: "NM-123456", status: "active" },
  { state: "New York", license: "NY-LA123456", status: "active" },
  { state: "North Carolina", license: "NC-123456", status: "active" },
  { state: "North Dakota", license: "ND-123456", status: "active" },
  { state: "Ohio", license: "OH-123456", status: "active" },
  { state: "Oklahoma", license: "OK-123456", status: "active" },
  { state: "Oregon", license: "OR-123456", status: "active" },
  { state: "Pennsylvania", license: "PA-123456", status: "active" },
  { state: "Rhode Island", license: "RI-123456", status: "active" },
  { state: "South Carolina", license: "SC-123456", status: "active" },
  { state: "South Dakota", license: "SD-123456", status: "active" },
  { state: "Tennessee", license: "TN-123456", status: "active" },
  { state: "Texas", license: "TX-123456", status: "active" },
  { state: "Utah", license: "UT-123456", status: "active" },
  { state: "Vermont", license: "VT-123456", status: "active" },
  { state: "Virginia", license: "VA-123456", status: "active" },
  { state: "Washington", license: "WA-123456", status: "active" },
  { state: "West Virginia", license: "WV-123456", status: "active" },
  { state: "Wisconsin", license: "WI-123456", status: "active" },
  { state: "Wyoming", license: "WY-123456", status: "active" },
  { state: "District of Columbia", license: "DC-123456", status: "active" }
];

const licenseTypes = [
  {
    type: "Life Insurance",
    description: "Authority to sell and service life insurance products",
    icon: Shield
  },
  {
    type: "Health Insurance",
    description: "Authority to sell and service health insurance products",
    icon: Shield
  },
  {
    type: "Annuities",
    description: "Authority to sell fixed and indexed annuity products",
    icon: Shield
  }
];

export default function Licenses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllStates, setShowAllStates] = useState(false);

  const filteredLicenses = stateLicenses.filter(license =>
    license.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedLicenses = showAllStates ? filteredLicenses : filteredLicenses.slice(0, 12);

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
              <Award className="w-8 h-8 text-heritage-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Licenses & Credentials
            </h1>
            <p className="text-white/80 text-lg">
              Heritage Life Solutions is licensed to conduct insurance business in all 50 states
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Information */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-heritage-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Building className="w-7 h-7 text-heritage-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-heritage-primary mb-1">{companyInfo.name}</h2>
                  <p className="text-gray-600">Independent Insurance Agency</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-heritage-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-heritage-primary">Business Address</p>
                      <a
                        href="https://maps.google.com/?q=1240+Iroquois+Ave,+Suite+506,+Naperville,+IL+60563"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 text-sm hover:text-heritage-primary transition-colors"
                      >
                        {companyInfo.address}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-heritage-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-heritage-primary">Phone</p>
                      <a href={`tel:${companyInfo.phone.replace(/\D/g, '')}`} className="text-gray-600 text-sm hover:text-heritage-primary">
                        {companyInfo.phone}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-heritage-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-heritage-primary">National Producer Number (NPN)</p>
                      <p className="text-gray-600 text-sm">{companyInfo.nationalProducerNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-heritage-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-heritage-primary">Home State</p>
                      <p className="text-gray-600 text-sm">{companyInfo.homeState}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* License Types */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-heritage-primary mb-2">Lines of Authority</h2>
              <p className="text-gray-600">We are licensed to offer the following insurance products</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-4">
              {licenseTypes.map((type, index) => (
                <motion.div
                  key={type.type}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <type.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-heritage-primary mb-2">{type.type}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                  <div className="mt-4 flex items-center justify-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    All 50 States
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* State Licenses */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-heritage-primary mb-2">State Licenses</h2>
              <p className="text-gray-600">Find our license information for your state</p>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by state name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                />
              </div>
            </motion.div>

            {/* License Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              <AnimatePresence>
                {displayedLicenses.map((license) => (
                  <motion.div
                    key={license.state}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-heritage-primary">{license.state}</p>
                      <span className="w-2 h-2 bg-green-500 rounded-full" title="Active" />
                    </div>
                    <p className="text-sm text-gray-600 font-mono">{license.license}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Show More Button */}
            {filteredLicenses.length > 12 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-6"
              >
                <button
                  onClick={() => setShowAllStates(!showAllStates)}
                  className="inline-flex items-center gap-2 text-heritage-primary font-medium hover:text-heritage-accent transition-colors"
                >
                  {showAllStates ? "Show Less" : `Show All ${filteredLicenses.length} States`}
                  <ChevronDown className={`w-5 h-5 transition-transform ${showAllStates ? "rotate-180" : ""}`} />
                </button>
              </motion.div>
            )}

            {/* No Results */}
            {filteredLicenses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No states found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Verification */}
      <section className="py-12 bg-gradient-to-br from-[#fffaf3] to-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-heritage-primary mb-4">Verify Our Licenses</h2>
              <p className="text-gray-600 mb-6">
                You can independently verify our licensing status through the following resources:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium text-heritage-primary mb-1">National Insurance Producer Registry (NIPR)</p>
                  <p className="text-sm text-gray-600 mb-2">Search for producer license information nationwide</p>
                  <a
                    href="https://nipr.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-heritage-primary hover:text-heritage-accent inline-flex items-center gap-1"
                  >
                    Visit NIPR <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium text-heritage-primary mb-1">State Insurance Department</p>
                  <p className="text-sm text-gray-600 mb-2">Contact your state's insurance department directly</p>
                  <a
                    href="https://content.naic.org/state-insurance-regulators"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-heritage-primary hover:text-heritage-accent inline-flex items-center gap-1"
                  >
                    Find Your State <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 text-center"
            >
              <p className="text-gray-600 mb-4">
                Questions about our licensing? Contact our compliance department:
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="tel:6307780800"
                  className="inline-flex items-center gap-2 text-heritage-primary hover:text-heritage-accent"
                >
                  <Phone className="w-4 h-4" />
                  (630) 778-0800
                </a>
                <a
                  href="mailto:compliance@heritagels.com"
                  className="inline-flex items-center gap-2 text-heritage-primary hover:text-heritage-accent"
                >
                  <Mail className="w-4 h-4" />
                  compliance@heritagels.com
                </a>
              </div>
            </motion.div>

            {/* Related Links */}
            <div className="mt-8 text-center">
              <h3 className="font-semibold text-heritage-primary mb-4">Related Pages</h3>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/about" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-heritage-primary bg-white px-4 py-2 rounded-lg transition-colors shadow-sm">
                  About Us <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/legal/terms" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-heritage-primary bg-white px-4 py-2 rounded-lg transition-colors shadow-sm">
                  Terms of Use <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-heritage-primary bg-white px-4 py-2 rounded-lg transition-colors shadow-sm">
                  Contact Us <ChevronRight className="w-4 h-4" />
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
