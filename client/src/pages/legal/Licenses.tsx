import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapSelector from "@/components/MapSelector";
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
  email: "contact@heritagels.org",
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
      <section className="pt-24 pb-12 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-violet-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
              Licenses & Credentials
            </h1>
            <p className="text-white/80 text-lg text-pretty">
              Heritage Life Solutions is licensed to conduct insurance business in all 50 states
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Information */}
      <section className="py-8 md:py-12 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-2xl p-5 md:p-8"
          >
            <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building className="w-6 h-6 md:w-7 md:h-7 text-violet-500" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-primary mb-1 text-balance">{companyInfo.name}</h2>
                <p className="text-gray-600 text-sm md:text-base">Independent Insurance Agency</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-primary text-sm md:text-base">Business Address</p>
                    <MapSelector>
                      <span className="text-gray-600 text-xs md:text-sm hover:text-primary transition-colors cursor-pointer">
                        {companyInfo.address}
                      </span>
                    </MapSelector>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-primary text-sm md:text-base">Phone</p>
                    <a href={`tel:${companyInfo.phone.replace(/\D/g, '')}`} className="text-gray-600 text-xs md:text-sm hover:text-primary min-h-[44px] inline-flex items-center">
                      {companyInfo.phone}
                    </a>
                  </div>
                </div>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-primary text-sm md:text-base">National Producer Number (NPN)</p>
                    <p className="text-gray-600 text-xs md:text-sm">{companyInfo.nationalProducerNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-primary text-sm md:text-base">Home State</p>
                    <p className="text-gray-600 text-xs md:text-sm">{companyInfo.homeState}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* License Types */}
      <section className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-xl md:text-2xl font-bold text-primary mb-2 text-balance">Lines of Authority</h2>
            <p className="text-sm md:text-base text-gray-600 text-pretty">We are licensed to offer the following insurance products</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {licenseTypes.map((type, index) => (
              <motion.div
                key={type.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 text-center"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <type.icon className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-primary mb-1 md:mb-2 text-sm md:text-base">{type.type}</h3>
                <p className="text-xs md:text-sm text-gray-600">{type.description}</p>
                <div className="mt-3 md:mt-4 flex items-center justify-center gap-1 text-green-600 text-xs md:text-sm font-medium">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                  All 50 States
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* State Licenses */}
      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-xl md:text-2xl font-bold text-primary mb-2 text-balance">State Licenses</h2>
            <p className="text-sm md:text-base text-gray-600 text-pretty">Find our license information for your state</p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 md:mb-6"
          >
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by state name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base min-h-[44px]"
              />
            </div>
          </motion.div>

          {/* License Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3"
          >
            <AnimatePresence>
              {displayedLicenses.map((license) => (
                <motion.div
                  key={license.state}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <p className="font-medium text-primary text-xs md:text-sm">{license.state}</p>
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Active" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 font-mono truncate">{license.license}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Show More Button */}
          {filteredLicenses.length > 12 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-4 md:mt-6"
            >
              <button
                onClick={() => setShowAllStates(!showAllStates)}
                className="inline-flex items-center gap-2 text-primary font-medium hover:text-violet-500 transition-colors text-sm md:text-base min-h-[44px]"
              >
                {showAllStates ? "Show Less" : `Show All ${filteredLicenses.length} States`}
                <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${showAllStates ? "rotate-180" : ""}`} />
              </button>
            </motion.div>
          )}

          {/* No Results */}
          {filteredLicenses.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <p className="text-gray-600 text-sm md:text-base">No states found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>

      {/* Verification */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-[#fffaf3] to-[#f5f0e8]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-gray-100"
          >
            <h2 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4 text-balance">Verify Our Licenses</h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 text-pretty">
              You can independently verify our licensing status through the following resources:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                <p className="font-medium text-primary mb-1 text-sm md:text-base">National Insurance Producer Registry (NIPR)</p>
                <p className="text-xs md:text-sm text-gray-600 mb-2">Search for producer license information nationwide</p>
                <a
                  href="https://nipr.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs md:text-sm text-primary hover:text-violet-500 inline-flex items-center gap-1 min-h-[44px]"
                >
                  Visit NIPR <ChevronRight className="w-4 h-4" />
                </a>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                <p className="font-medium text-primary mb-1 text-sm md:text-base">State Insurance Department</p>
                <p className="text-xs md:text-sm text-gray-600 mb-2">Contact your state's insurance department directly</p>
                <a
                  href="https://content.naic.org/state-insurance-regulators"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs md:text-sm text-primary hover:text-violet-500 inline-flex items-center gap-1 min-h-[44px]"
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
            className="mt-6 md:mt-8 text-center"
          >
            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
              Questions about our licensing? Contact our compliance department:
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <a
                href="tel:6307780800"
                className="inline-flex items-center gap-2 text-primary hover:text-violet-500 text-sm md:text-base min-h-[44px]"
              >
                <Phone className="w-4 h-4" />
                (630) 778-0800
              </a>
              <a
                href="mailto:contact@heritagels.org"
                className="inline-flex items-center gap-2 text-primary hover:text-violet-500 text-sm md:text-base min-h-[44px]"
              >
                <Mail className="w-4 h-4" />
                contact@heritagels.org
              </a>
            </div>
          </motion.div>

          {/* Related Links */}
          <div className="mt-6 md:mt-8 text-center">
            <h3 className="font-semibold text-primary mb-3 md:mb-4 text-sm md:text-base">Related Pages</h3>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              <Link href="/about" className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-primary bg-white px-3 md:px-4 py-2.5 md:py-2 rounded-lg transition-colors shadow-sm min-h-[44px]">
                About Us <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/legal/terms" className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-primary bg-white px-3 md:px-4 py-2.5 md:py-2 rounded-lg transition-colors shadow-sm min-h-[44px]">
                Terms of Use <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-primary bg-white px-3 md:px-4 py-2.5 md:py-2 rounded-lg transition-colors shadow-sm min-h-[44px]">
                Contact Us <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
