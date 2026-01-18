import { HeritageLayout } from "@/components/layout/HeritageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import familyImage from "@assets/generated_images/young_family_playing_indoors.png";
import seniorImage from "@assets/generated_images/active_senior_couple_outdoors.png";
import iulImage from "@assets/generated_images/couple_planning_finances_with_advisor.png";
import finalExpenseImage from "@assets/generated_images/peaceful_elderly_couple_on_porch.png";
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
  accent: "#8b5a3c",
  cream: "#fffaf3",
  white: "#ffffff",
};

export default function HeritageProducts() {
  return (
    <HeritageLayout>
      <section className="relative overflow-hidden py-20 md:py-28" style={{ backgroundColor: c.primary }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryHover})` }} />
        <div className="absolute top-0 left-0 w-1/2 h-full bg-white/5 -skew-x-12 transform -translate-x-1/4" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: `${c.secondary}15` }} />
        <motion.div
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
            <span className="font-medium tracking-wide uppercase text-sm" style={{ color: c.secondary }}>Coverage Options</span>
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6">Life Insurance Solutions</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Whether you're looking for temporary protection or a lifelong legacy, we have the right plan for you.
          </p>
        </motion.div>
      </section>

      <section className="py-16" style={{ backgroundColor: c.background }}>
        <div className="container mx-auto px-4">
          <Tabs defaultValue="term" className="w-full">
            <div className="flex justify-center mb-12 overflow-x-auto pb-2 -mx-4 px-4">
              <TabsList className="p-1 rounded-lg flex-shrink-0" style={{ backgroundColor: c.muted }}>
                <TabsTrigger value="term" className="px-3 md:px-6 py-2 text-xs md:text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap" style={{ color: c.textPrimary }}>Mortgage</TabsTrigger>
                <TabsTrigger value="whole" className="px-3 md:px-6 py-2 text-xs md:text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap" style={{ color: c.textPrimary }}>Whole Life</TabsTrigger>
                <TabsTrigger value="universal" className="px-3 md:px-6 py-2 text-xs md:text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap" style={{ color: c.textPrimary }}>IUL</TabsTrigger>
                <TabsTrigger value="final" className="px-3 md:px-6 py-2 text-xs md:text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap" style={{ color: c.textPrimary }}>Final Expense</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="term" className="mt-0">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold font-serif mb-4" style={{ color: c.primary }}>Mortgage Protection Insurance</h2>
                  <p className="text-lg mb-6" style={{ color: c.textSecondary }}>
                    Affordable protection for a specific period of time (10, 20, or 30 years). It's the simplest and most cost-effective way to protect your family during your peak earning years.
                  </p>
                  <ul className="space-y-4 mb-8">
                    {[
                      "Most affordable premiums",
                      "Fixed rates for the entire term",
                      "Coverage amounts from $100k to $10M+",
                      "Convertible to permanent insurance later"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${c.secondary}30`, color: c.primary }}>
                          <Check className="w-4 h-4" />
                        </div>
                        <span style={{ color: c.textPrimary }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/heritage/get-quote">
                      <Button size="lg" style={{ backgroundColor: c.secondary, color: c.textPrimary }}>
                        Get a Term Quote
                      </Button>
                    </Link>
                    <Link href="/heritage/resources">
                      <Button size="lg" variant="outline" style={{ borderColor: c.primary, color: c.primary }}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden shadow-2xl">
                  <img src={familyImage} alt="Young family" className="w-full h-auto" loading="lazy" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="whole" className="mt-0">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                 <div className="order-2 md:order-1 rounded-xl overflow-hidden shadow-2xl">
                  <img src={seniorImage} alt="Senior couple" className="w-full h-auto" loading="lazy" />
                </div>
                <div className="order-1 md:order-2">
                  <h2 className="text-3xl font-bold font-serif mb-4" style={{ color: c.primary }}>Whole Life Insurance</h2>
                  <p className="text-lg mb-6" style={{ color: c.textSecondary }}>
                    Permanent coverage that lasts your entire life. It builds cash value over time that you can borrow against or use for retirement, providing a guaranteed legacy.
                  </p>
                  <ul className="space-y-4 mb-8">
                    {[
                      "Guaranteed death benefit for life",
                      "Cash value accumulation (tax-deferred)",
                      "Fixed premiums that never increase",
                      "Dividend potential from mutual companies"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${c.secondary}30`, color: c.primary }}>
                          <Check className="w-4 h-4" />
                        </div>
                        <span style={{ color: c.textPrimary }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/heritage/get-quote">
                      <Button size="lg" style={{ backgroundColor: c.secondary, color: c.textPrimary }}>
                        Get a Whole Life Quote
                      </Button>
                    </Link>
                    <Link href="/heritage/resources">
                      <Button size="lg" variant="outline" style={{ borderColor: c.primary, color: c.primary }}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>

             <TabsContent value="universal" className="mt-0">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold font-serif mb-4" style={{ color: c.primary }}>IUL (Indexed Universal Life)</h2>
                  <p className="text-lg mb-6" style={{ color: c.textSecondary }}>
                    The ultimate in flexibility. Adjust your premiums and death benefit as your life changes. IUL offers permanent protection with the ability to build cash value based on market index performance with downside protection.
                  </p>
                  <ul className="space-y-4 mb-8">
                    {[
                      "Index-linked growth potential",
                      "Downside protection from market losses",
                      "Flexible premium payments",
                      "Tax-advantaged cash value accumulation"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${c.secondary}30`, color: c.primary }}>
                          <Check className="w-4 h-4" />
                        </div>
                        <span style={{ color: c.textPrimary }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/heritage/get-quote">
                      <Button size="lg" style={{ backgroundColor: c.secondary, color: c.textPrimary }}>
                        Get an IUL Quote
                      </Button>
                    </Link>
                    <Link href="/heritage/resources">
                      <Button size="lg" variant="outline" style={{ borderColor: c.primary, color: c.primary }}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden shadow-2xl">
                  <img src={iulImage} alt="Couple planning finances with advisor" className="w-full h-auto" loading="lazy" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="final" className="mt-0">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 rounded-xl overflow-hidden shadow-2xl">
                  <img src={finalExpenseImage} alt="Peaceful elderly couple" className="w-full h-auto" loading="lazy" />
                </div>
                <div className="order-1 md:order-2">
                  <h2 className="text-3xl font-bold font-serif mb-4" style={{ color: c.primary }}>Final Expense Insurance</h2>
                  <p className="text-lg mb-6" style={{ color: c.textSecondary }}>
                    Give your family peace of mind with coverage designed to handle end-of-life expenses. Simple, affordable plans that ensure your loved ones aren't burdened with funeral costs and outstanding bills.
                  </p>
                  <ul className="space-y-4 mb-8">
                    {[
                      "No medical exam required",
                      "Coverage from $5,000 to $50,000",
                      "Guaranteed acceptance options",
                      "Fixed premiums that never increase"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${c.secondary}30`, color: c.primary }}>
                          <Check className="w-4 h-4" />
                        </div>
                        <span style={{ color: c.textPrimary }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/heritage/get-quote">
                      <Button size="lg" style={{ backgroundColor: c.secondary, color: c.textPrimary }}>
                        Get a Final Expense Quote
                      </Button>
                    </Link>
                    <Link href="/heritage/resources">
                      <Button size="lg" variant="outline" style={{ borderColor: c.primary, color: c.primary }}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: `${c.muted}50` }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-serif mb-12" style={{ color: c.primary }}>Compare Plans at a Glance</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {[
              {
                title: "Mortgage Protection",
                ideal: "Homeowners, young families, income replacement",
                cost: "$",
                duration: "10-30 Years"
              },
              {
                title: "Whole Life",
                ideal: "Estate planning, legacy building, conservative cash accumulation",
                cost: "$$$",
                duration: "Lifetime"
              },
              {
                title: "IUL",
                ideal: "Flexible needs, business planning, tax-advantaged growth",
                cost: "$$",
                duration: "Lifetime"
              },
              {
                title: "Final Expense",
                ideal: "Seniors, covering funeral costs, leaving no burden",
                cost: "$",
                duration: "Lifetime"
              }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full" style={{ backgroundColor: c.cream, borderTop: `4px solid ${c.secondary}` }}>
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl" style={{ color: c.primary }}>{plan.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: c.textSecondary }}>Ideal For</span>
                      <p className="font-medium" style={{ color: c.textPrimary }}>{plan.ideal}</p>
                    </div>
                     <div>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: c.textSecondary }}>Cost</span>
                      <p className="font-medium" style={{ color: c.primary }}>{plan.cost}</p>
                    </div>
                     <div>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: c.textSecondary }}>Duration</span>
                      <p className="font-medium" style={{ color: c.textPrimary }}>{plan.duration}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/heritage/get-quote" className="w-full">
                      <Button variant="outline" className="w-full group" style={{ borderColor: c.primary, color: c.primary }}>
                        Get Quote <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </HeritageLayout>
  );
}
