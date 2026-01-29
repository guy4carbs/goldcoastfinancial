import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ShieldCheck, HeartHandshake, Star, MapPin, Quote, Calculator } from "lucide-react";
import heroImage from "@assets/generated_images/happy_multi-generational_family_in_a_park.png";
import { motion } from "framer-motion";
import { AnimatedStats } from "@/components/ui/animated-stats";
import { CarrierPartners } from "@/components/ui/carrier-partners";
import { BeforeAfterScenarios } from "@/components/ui/before-after-scenarios";
import { IndependentAgencyCTA } from "@/components/ui/independent-agency-cta";
import { FAQSection } from "@/components/ui/faq-section";

const testimonials = [
  {
    name: "Maria S.",
    location: "Naperville, IL",
    text: "Jack Cook made the entire process so easy. He took the time to explain every option and found us a policy that fit our budget perfectly. Highly recommend!",
    agent: "Jack Cook",
    rating: 5
  },
  {
    name: "Robert T.",
    location: "Phoenix, AZ",
    text: "Gaetano Carbonara went above and beyond for our family. His knowledge of mortgage protection insurance saved us thousands. A true professional.",
    agent: "Gaetano Carbonara",
    rating: 5
  },
  {
    name: "Jennifer M.",
    location: "Dallas, TX",
    text: "Nick Gallagher helped us understand our whole life options in a way that finally made sense. His patience and expertise are unmatched.",
    agent: "Nick Gallagher",
    rating: 5
  },
  {
    name: "David & Lisa K.",
    location: "Naperville, IL",
    text: "Frank Carbonara set up our mortgage protection plan and gave us complete peace of mind. He's responsive, knowledgeable, and genuinely cares.",
    agent: "Frank Carbonara",
    rating: 5
  },
  {
    name: "Thomas H.",
    location: "Denver, CO",
    text: "Gold Coast Financial is the real deal. Marcus Williams found me a term policy at half the price I was quoted elsewhere. Can't thank them enough!",
    agent: "Marcus Williams",
    rating: 5
  },
  {
    name: "Angela P.",
    location: "Atlanta, GA",
    text: "After my husband passed, Gaetano helped our family navigate the claims process with compassion and care. Forever grateful.",
    agent: "Gaetano Carbonara",
    rating: 5
  },
  {
    name: "Michael R.",
    location: "San Diego, CA",
    text: "Sarah Mitchell took the time to review all our options. No pressure, just honest advice. That's rare in this industry.",
    agent: "Sarah Mitchell",
    rating: 5
  },
  {
    name: "Susan & Mark D.",
    location: "Nashville, TN",
    text: "We've been with Gold Coast for 5 years now. Frank Carbonara always makes sure our coverage keeps up with our growing family.",
    agent: "Frank Carbonara",
    rating: 5
  },
  {
    name: "Patricia W.",
    location: "Seattle, WA",
    text: "As a single mom, I was overwhelmed by insurance options. Jack Cook simplified everything and found affordable coverage for me and my kids.",
    agent: "Jack Cook",
    rating: 5
  },
  {
    name: "James & Carol B.",
    location: "Chicago, IL",
    text: "The team at Gold Coast Financial treats you like family. Gaetano has been our advisor for years and we wouldn't go anywhere else.",
    agent: "Gaetano Carbonara",
    rating: 5
  },
  {
    name: "Kevin L.",
    location: "Miami, FL",
    text: "Anthony Romano helped me secure coverage for my growing business. Professional, knowledgeable, and always available when I have questions.",
    agent: "Anthony Romano",
    rating: 5
  },
  {
    name: "Rachel & Tim P.",
    location: "Austin, TX",
    text: "We worked with Nick Gallagher remotely and the process was seamless. Got our whole life policy set up in under a week!",
    agent: "Nick Gallagher",
    rating: 5
  },
  {
    name: "Linda M.",
    location: "Boston, MA",
    text: "Christina Reyes made getting life insurance so simple. She explained everything clearly and found the perfect policy for our budget.",
    agent: "Christina Reyes",
    rating: 5
  },
  {
    name: "George & Martha H.",
    location: "Portland, OR",
    text: "We're retired and needed final expense coverage. David Chen was patient, thorough, and got us exactly what we needed.",
    agent: "David Chen",
    rating: 5
  },
  {
    name: "Stephanie K.",
    location: "Minneapolis, MN",
    text: "Jack Cook went the extra mile for our family. His follow-up service after the sale has been exceptional. Truly cares about his clients.",
    agent: "Jack Cook",
    rating: 5
  },
  {
    name: "Brandon & Amy T.",
    location: "Charlotte, NC",
    text: "Frank Carbonara helped us with mortgage protection when we bought our first home. Couldn't be happier with the coverage and rates.",
    agent: "Frank Carbonara",
    rating: 5
  }
];

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="flex-shrink-0 w-[280px] md:w-[320px] mx-3">
      <Card className="h-full bg-white border shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex gap-1 mb-3">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
            ))}
          </div>
          <Quote className="w-8 h-8 text-secondary/30 mb-2" />
          <p className="text-foreground/80 text-sm leading-relaxed mb-4">
            "{testimonial.text}"
          </p>
          <div className="border-t pt-4">
            <p className="font-bold text-primary">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">{testimonial.location}</p>
            <p className="text-xs text-secondary font-medium mt-1">Worked with {testimonial.agent}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Happy multigenerational family in Naperville park" 
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-secondary rounded-full" />
              <span className="text-secondary font-medium tracking-wide uppercase text-sm">Chicagoland's Trusted Agency - Serving All 50 States</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight mb-6">
              Protect What Matters Most
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 font-light leading-relaxed">
              Personalized life insurance solutions for families nationwide. Peace of mind starts with a conversation, not a sales pitch.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/get-quote">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 h-14 rounded-md">
                  Get a Free Quote
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10 text-lg px-8 h-14 rounded-md">
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Stats */}
      <AnimatedStats />

      {/* Carrier Partners */}
      <CarrierPartners />

      {/* Why Choose Us */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-primary">Why Choose Gold Coast Financial?</h2>
            <p className="text-muted-foreground text-lg">
              We're not just selling policies; we're building relationships. As independent agents, we work for you, not the insurance companies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Independent & Unbiased",
                desc: "We shop dozens of top-rated carriers to find the best coverage at the most competitive rates for your specific situation."
              },
              {
                icon: HeartHandshake,
                title: "Personalized Guidance",
                desc: "No cookie-cutter plans. We take the time to understand your family's unique needs, budget, and future goals."
              },
              {
                icon: MapPin,
                title: "Nationwide Service",
                desc: "Based in Chicagoland, serving all 50 states. We're always available for a call, video chat, or in-person meeting."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                viewport={{ once: true }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <CardContent className="pt-8 px-8 pb-8 text-center">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-primary">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Calculator CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-primary via-primary/95 to-primary rounded-2xl p-8 md:p-10"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
                  <Calculator className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-white">Not sure how much coverage you need?</h3>
                  <p className="text-white/80 text-sm">Use our free calculator to get a personalized recommendation.</p>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2">
                <Link href="/calculator">
                  <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold whitespace-nowrap" data-testid="button-calculator-cta">
                    Try Coverage Calculator
                  </Button>
                </Link>
                <span className="text-white/70 text-xs font-medium">Takes only 2 minutes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4 mb-12">
          <div className="text-center">
            <span className="text-secondary font-bold uppercase tracking-wide text-sm mb-2 block">What Our Clients Say</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary">Real Stories from Real Families</h2>
          </div>
        </div>
        
        {/* Infinite scrolling testimonials - Row 1 */}
        <div className="marquee-container">
          <div className="animate-marquee">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={`a-${idx}`} testimonial={testimonial} />
            ))}
          </div>
          <div className="animate-marquee" aria-hidden="true">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={`b-${idx}`} testimonial={testimonial} />
            ))}
          </div>
        </div>
        
        {/* Second row scrolling opposite direction */}
        <div className="marquee-container mt-8">
          <div className="animate-marquee-reverse">
            {[...testimonials].reverse().map((testimonial, idx) => (
              <TestimonialCard key={`c-${idx}`} testimonial={testimonial} />
            ))}
          </div>
          <div className="animate-marquee-reverse" aria-hidden="true">
            {[...testimonials].reverse().map((testimonial, idx) => (
              <TestimonialCard key={`d-${idx}`} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Products Overview */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <span className="text-secondary font-bold uppercase tracking-wide text-sm mb-2 block">Our Solutions</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary">Comprehensive Coverage Options</h2>
            </div>
            <Link href="/products">
              <Button variant="link" className="text-primary font-semibold group p-0 mt-4 md:mt-0">
                View All Products <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Mortgage Protection", desc: "Protect your home and family if something happens to you." },
              { title: "Whole Life", desc: "Permanent coverage with cash value growth potential for lifelong security." },
              { title: "IUL", desc: "Flexible premiums and death benefits with index-linked growth potential." },
              { title: "Final Expense", desc: "Simple plans to cover funeral costs and relieve burden on loved ones." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href="/products">
                  <div className="group p-6 border rounded-lg bg-white hover:border-secondary/50 hover:bg-primary/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{item.desc}</p>
                    <div className="flex items-center text-secondary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      Learn More <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Why Work with an Independent Agency */}
          <div className="mt-12">
            <IndependentAgencyCTA />
          </div>
        </div>
      </section>

      {/* Before/After Scenarios */}
      <BeforeAfterScenarios />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-1/4" />
        <motion.div 
          className="container mx-auto px-4 relative z-10 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-6">Ready to Secure Your Family's Future?</h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
            Get a personalized quote in minutes or schedule a consultation with one of our expert advisors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-quote">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-lg px-10 hover:scale-105 transition-transform">
                Get Your Free Quote
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-10 hover:scale-105 transition-transform">
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}
