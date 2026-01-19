import { motion } from "framer-motion";
import { Linkedin, Mail, Quote, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const founders = [
  {
    initials: "JC",
    name: "Jack Cook",
    title: "Founder & Chief Executive Officer",
    location: "Naperville, IL",
    bio: "Jack Cook is the Founder and Chief Executive Officer of Heritage Life Solutions, responsible for defining the firm's long-term vision and stewarding the organization at the ownership level. His leadership encompasses strategic decision-making, carrier and IMO relationships, compensation architecture, and enterprise partnerships that drive sustainable growth.",
    extendedBio: "A former college football quarterback, Jack brings a disciplined leadership mindset forged through high-pressure decision-making and team command. Originally from Naperville, Illinois, he is recognized for combining deep industry knowledge with decisive founder authority to structure organizations for scale, operational leverage, and long-term stability.",
    quote: "Our mission is simple: give every family access to the protection they deserve, without the complexity they've come to expect.",
    linkedin: "#",
    email: "jack@heritagels.com"
  },
  {
    initials: "FC",
    name: "Frank Carbonara",
    title: "Executive Chairman & Risk Strategist",
    location: "Elmwood Park, IL",
    bio: "Frank Carbonara serves as Executive Chairman and Risk Strategist, providing senior governance, strategic oversight, and risk-based decision guidance. He brings extensive business experience across multiple industries and global markets, with a career spanning finance, real estate, insurance, and enterprise operations.",
    extendedBio: "Frank has conducted business internationally, including experience living in Dubai and collaborating with the Dubai Mercantile Exchange (DME). He is a licensed futures and commodities trader, having passed the Series 3 and Series 6 examinations. His background includes serving as a licensed real estate professional, operating as a public adjuster for over 15 years, and holding ownership and partnership positions in large-scale commercial enterprises.",
    quote: "Risk isn't something to fear—it's something to understand, structure, and ultimately master.",
    linkedin: "#",
    email: "frank@heritagels.com"
  },
  {
    initials: "GC",
    name: "Gaetano Carbonara",
    title: "Chief Operating Officer",
    location: "Oak Brook, IL",
    bio: "Gaetano Carbonara serves as Chief Operating Officer and Head of Systems & Culture, overseeing the operational infrastructure that converts executive vision into scalable execution. His responsibilities span organizational design, performance standards, accountability frameworks, leadership development, and systematized operations.",
    extendedBio: "A former college football quarterback from Oak Brook, Illinois, Gaetano is known for building high-performing teams, driving disciplined execution, and demanding excellence across the organization. He brings a strategic negotiating mindset and a culture-first leadership approach, ensuring teams operate with clarity, ownership, and consistently elevated standards as the company scales.",
    quote: "Culture isn't a department—it's the foundation everything else is built on.",
    linkedin: "#",
    email: "gaetano@heritagels.com"
  },
  {
    initials: "NG",
    name: "Nick Gallagher",
    title: "Head of Strategy & Negotiation",
    location: "Naperville, IL",
    bio: "Nick Gallagher leads strategy and negotiation initiatives, supporting expansion efforts, partnerships, and growth-oriented projects. He contributes to deal structuring, strategic evaluation, and stakeholder communication across internal and external channels.",
    extendedBio: "Originally from Naperville, Illinois, Nick developed his leadership foundation through athletics, where preparation, accountability, and performance were non-negotiable. He is recognized as a skilled communicator who supports executive initiatives by aligning strategy, negotiation, and execution in service of long-term organizational objectives.",
    quote: "Every negotiation is an opportunity to create value—for our partners and for the families we serve.",
    linkedin: "#",
    email: "nick@heritagels.com"
  }
];

export default function MeetFounders() {
  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      {/* HERO SECTION */}
      <section className="bg-heritage-primary py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <p className="text-heritage-accent font-semibold mb-4 tracking-wide uppercase text-sm">Leadership</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Meet Our Team
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
              Heritage was built by leaders who believe life insurance should be simple, honest, and accessible. Get to know the team driving our mission forward.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FOUNDERS SECTION */}
      <section className="bg-[#fffaf3] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="space-y-32"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-start ${index % 2 === 1 ? '' : ''}`}
              >
                {/* Photo */}
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="aspect-[4/5] max-w-md mx-auto lg:mx-0 bg-[#e8e0d5] rounded-3xl overflow-hidden relative">
                    {/* Photo placeholder with initials */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-8xl font-bold text-[#d4ccc0]">{founder.initials}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="flex items-center gap-2 text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{founder.location}</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{founder.name}</h3>
                  <p className="text-heritage-accent font-semibold text-lg mb-6">{founder.title}</p>

                  <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
                    <p>{founder.bio}</p>
                    <p>{founder.extendedBio}</p>
                  </div>

                  {/* Quote */}
                  <div className="bg-[#f5f0e8] rounded-2xl p-6 mb-8">
                    <Quote className="w-8 h-8 text-heritage-accent mb-3" />
                    <p className="text-gray-700 italic text-lg leading-relaxed">"{founder.quote}"</p>
                  </div>

                  {/* Contact Links */}
                  <div className="flex gap-4">
                    <a
                      href={founder.linkedin}
                      className="w-12 h-12 bg-heritage-primary/10 hover:bg-heritage-primary hover:text-white rounded-full flex items-center justify-center text-heritage-primary transition-colors"
                      aria-label={`${founder.name}'s LinkedIn`}
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={`mailto:${founder.email}`}
                      className="w-12 h-12 bg-heritage-primary/10 hover:bg-heritage-primary hover:text-white rounded-full flex items-center justify-center text-heritage-primary transition-colors"
                      aria-label={`Email ${founder.name}`}
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* OUR PHILOSOPHY */}
      <section className="bg-heritage-primary py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Our Philosophy</h2>
            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              We believe that everyone deserves access to quality life insurance, regardless of their background or financial situation. That's why we've built a company that prioritizes education over sales tactics, transparency over fine print, and relationships over transactions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CULTURE SECTION */}
      <section className="bg-[#fffaf3] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Life at Heritage</h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                We've built a culture rooted in accountability, excellence, and genuine care for the families we serve. Our team operates with clarity, ownership, and a shared commitment to raising the standard in everything we do.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-heritage-accent rounded-full"></div>
                  <span className="text-gray-700">High-performance, team-first environment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-heritage-accent rounded-full"></div>
                  <span className="text-gray-700">Clear accountability and growth pathways</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-heritage-accent rounded-full"></div>
                  <span className="text-gray-700">Competitive compensation and benefits</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-heritage-accent rounded-full"></div>
                  <span className="text-gray-700">Mission-driven work that matters</span>
                </div>
              </div>
              <a
                href="/careers"
                className="inline-block bg-heritage-primary hover:bg-heritage-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                View Open Positions
              </a>
            </motion.div>

            {/* Right Images Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <div className="h-48 bg-[#e8e0d5] rounded-2xl"></div>
                <div className="h-64 bg-[#e8e0d5] rounded-2xl"></div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 bg-[#e8e0d5] rounded-2xl"></div>
                <div className="h-48 bg-[#e8e0d5] rounded-2xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* GET QUOTE CTA */}
      <section className="bg-[#f5f0e8] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to protect your family?
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Get a personalized quote in minutes. No medical exam required.
            </p>
            <a
              href="/quote"
              className="inline-block bg-heritage-accent hover:bg-heritage-accent/80 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-colors"
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
