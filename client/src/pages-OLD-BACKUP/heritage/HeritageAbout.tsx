import { HeritageLayout } from "@/components/layout/HeritageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, MapPin, Briefcase } from "lucide-react";
import teamImage from "@assets/generated_images/professional_financial_advisor_team.png";
import { motion } from "framer-motion";

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
  accent: "#8b5a3c",
  cream: "#fffaf3",
  white: "#ffffff",
};

const teamMembers = [
  {
    name: "Jack Cook",
    role: "Founder & Chief Executive Officer",
    location: "Naperville, IL",
    shortBio: "Defines the firm's long-term vision and strategic direction.",
    fullBio: "Jack Cook is the Founder and Chief Executive Officer, responsible for defining the firm's long-term vision and protecting the organization at the ownership level. He focuses on strategic decision-making, carrier and IMO relationships, compensation architecture, and enterprise partnerships that drive durable growth.",
    background: "A former college football quarterback, Jack brings a disciplined leadership mindset shaped by high-pressure decision-making and team command. Originally from Naperville, Illinois, he is known for combining industry knowledge with decisive founder authority to structure organizations for scale, leverage, and long-term stability.",
    initials: "JC"
  },
  {
    name: "Frank Carbonara",
    role: "Executive Chairman & Risk Strategist",
    location: "Elmwood Park, IL",
    shortBio: "Provides senior governance and risk-based decision guidance.",
    fullBio: "Frank Carbonara serves as Executive Chairman and Risk Strategist, providing senior governance, strategic oversight, and risk-based decision guidance. He brings extensive business experience across multiple industries and global markets, with a career spanning finance, real estate, insurance, and enterprise operations.",
    background: "Frank has conducted business internationally, including time living in Dubai and working with the Dubai Mercantile Exchange (DME). He is a futures and commodities trader who has passed the Series 3 and Series 6 exams. His background also includes serving as a licensed real estate agent, operating as a public adjuster for over 15 years, and ownership and partnership in a large roofing company.",
    initials: "FC"
  },
  {
    name: "Gaetano Carbonara",
    role: "Chief Operating Officer | Head of Systems & Culture",
    location: "Oak Brook, IL",
    shortBio: "Oversees operational infrastructure and organizational excellence.",
    fullBio: "Gaetano Carbonara serves as Chief Operating Officer and Head of Systems & Culture, overseeing the operational infrastructure that converts executive vision into scalable execution. His responsibilities include organizational design, performance standards, accountability frameworks, leadership development, and systemized operations.",
    background: "A former college football quarterback from Oak Brook, Illinois, Gaetano is known for team building, disciplined execution, and demanding excellence across the organization. He brings a strong negotiating mindset and a culture-first leadership approach, ensuring teams operate with clarity, ownership, and consistently high standards as the company scales.",
    initials: "GC"
  },
  {
    name: "Nick Gallagher",
    role: "Head of Strategy & Negotiation",
    location: "Naperville, IL",
    shortBio: "Leads expansion efforts, partnerships, and growth initiatives.",
    fullBio: "Nick Gallagher leads strategy and negotiation initiatives, supporting expansion efforts, partnerships, and growth-oriented projects. He contributes to deal structuring, strategic evaluation, and communication across internal and external stakeholders.",
    background: "Originally from Naperville, Illinois, Nick played football and developed a leadership foundation rooted in preparation, accountability, and performance. He is recognized as a strong communicator who supports executive initiatives by aligning strategy, negotiation, and execution in service of long-term growth objectives.",
    initials: "NG"
  }
];

export default function HeritageAbout() {
  return (
    <HeritageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ backgroundColor: c.primary }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryHover})` }} />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full -translate-x-1/2 translate-y-1/2" style={{ backgroundColor: `${c.secondary}15` }} />
        <motion.div
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
            <span className="font-medium tracking-wide uppercase text-sm" style={{ color: c.secondary }}>Our Story</span>
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6">About Heritage Life Solutions</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            A division of Gold Coast Financial Group, providing honest, expert, and independent financial protection to families nationwide.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24" style={{ backgroundColor: c.background }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-tl-3xl -z-10" style={{ backgroundColor: `${c.secondary}30` }} />
              <img
                src={teamImage}
                alt="Heritage Life Solutions Team"
                className="rounded-lg shadow-xl w-full"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-br-3xl -z-10" style={{ backgroundColor: `${c.primary}15` }} />
            </div>
            <div>
              <h2 className="text-3xl font-bold font-serif mb-6" style={{ color: c.primary }}>Your Local Independent Agency</h2>
              <p className="mb-4 leading-relaxed" style={{ color: c.textSecondary }}>
                Founded in the Chicagoland area (Naperville, IL), Heritage Life Solutions was built on a simple premise: families deserve unbiased advice when making decisions about their financial future. Unlike captive agents who represent a single insurance company, we represent you—and we proudly serve clients in all 50 states.
              </p>
              <p className="mb-6 leading-relaxed" style={{ color: c.textSecondary }}>
                Our independence allows us to shop the market on your behalf, comparing policies from dozens of top-rated carriers to find the perfect blend of coverage and value. We believe in transparency, education, and long-term relationships.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Fiduciary Standard of Care",
                  "Independent & Unbiased",
                  "20+ Years Experience",
                  "Nationwide Coverage, All 50 States"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${c.secondary}30`, color: c.primary }}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="font-medium text-sm" style={{ color: c.textPrimary }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leadership Section */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <span className="font-medium tracking-wide uppercase text-sm" style={{ color: c.secondary }}>Leadership</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif mt-2 mb-4" style={{ color: c.primary }}>Meet Our Team</h2>
              <p className="max-w-2xl mx-auto" style={{ color: c.textSecondary }}>Experienced professionals with diverse backgrounds united by a commitment to protecting families nationwide.</p>
            </div>

            <div className="space-y-8">
              {teamMembers.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300" style={{ backgroundColor: c.cream }}>
                    <div className="grid md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
                      <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center" style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryHover})` }}>
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 flex items-center justify-center mb-4">
                          <span className="text-3xl md:text-4xl font-serif font-bold" style={{ color: c.secondary }}>{member.initials}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white font-serif">{member.name}</h3>
                        <p className="text-sm font-medium mt-1" style={{ color: c.secondary }}>{member.role}</p>
                        <div className="flex items-center gap-1 text-white/70 text-xs mt-3">
                          <MapPin className="w-3 h-3" />
                          <span>{member.location}</span>
                        </div>
                      </div>
                      <CardContent className="p-6 md:p-8">
                        <p className="leading-relaxed mb-4" style={{ color: c.textPrimary }}>{member.fullBio}</p>
                        <div className="border-t pt-4" style={{ borderColor: c.muted }}>
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-4 h-4 shrink-0 mt-1" style={{ color: c.secondary }} />
                            <p className="text-sm leading-relaxed" style={{ color: c.textSecondary }}>{member.background}</p>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </HeritageLayout>
  );
}
