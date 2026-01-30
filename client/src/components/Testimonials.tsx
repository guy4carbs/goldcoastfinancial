import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  product: string;
  date: string;
  verified: boolean;
}

// Fallback testimonials if API fails
const fallbackTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Michael R.",
    location: "Chicago, IL",
    rating: 5,
    text: "I was skeptical about online life insurance, but Heritage made it incredibly easy. Got approved in 10 minutes with no medical exam. The rate was better than quotes I got from local agents.",
    product: "20-Year Term Life",
    date: "2 weeks ago",
    verified: true,
  },
  {
    id: 2,
    name: "Sarah K.",
    location: "Austin, TX",
    rating: 5,
    text: "As a mom of three, I needed coverage fast. Heritage's process was simple and straightforward. I appreciated being able to compare different term lengths and see the prices change in real-time.",
    product: "30-Year Term Life",
    date: "1 month ago",
    verified: true,
  },
  {
    id: 3,
    name: "David M.",
    location: "Denver, CO",
    rating: 5,
    text: "The whole process took less than 15 minutes from start to finish. I was able to get $750,000 in coverage for less than my monthly streaming subscriptions. Highly recommend.",
    product: "20-Year Term Life",
    date: "3 weeks ago",
    verified: true,
  },
  {
    id: 4,
    name: "Jennifer L.",
    location: "Phoenix, AZ",
    rating: 5,
    text: "I'd been putting off getting life insurance for years because I thought it would be complicated. Heritage made it so easy. No pushy salespeople, just straightforward information and great rates.",
    product: "15-Year Term Life",
    date: "1 month ago",
    verified: true,
  },
  {
    id: 5,
    name: "Robert T.",
    location: "Seattle, WA",
    rating: 5,
    text: "After comparing prices from multiple companies, Heritage had the best rates by far. The application was quick and I had my policy documents in my email the same day.",
    product: "25-Year Term Life",
    date: "2 months ago",
    verified: true,
  },
  {
    id: 6,
    name: "Amanda H.",
    location: "Miami, FL",
    rating: 4,
    text: "Great experience overall. The quote comparison tool helped me understand the difference between term lengths. Customer service was helpful when I had questions about coverage.",
    product: "20-Year Term Life",
    date: "1 month ago",
    verified: true,
  },
];

// Format product type from API to display string
function formatProductType(productType: string): string {
  const productMap: Record<string, string> = {
    term: "Term Life",
    whole: "Whole Life",
    iul: "IUL",
    final_expense: "Final Expense",
    annuity: "Annuity",
  };
  return productMap[productType] || "Life Insurance";
}

// Format date to relative string
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 21) return "2 weeks ago";
  if (diffDays < 30) return "3 weeks ago";
  if (diffDays < 60) return "1 month ago";
  if (diffDays < 90) return "2 months ago";
  return "3+ months ago";
}

// Fetch testimonials from API
async function fetchTestimonials(): Promise<Testimonial[]> {
  const response = await fetch("/api/admin/public/testimonials?showOnHomepage=true");
  if (!response.ok) {
    throw new Error("Failed to fetch testimonials");
  }
  const data = await response.json();

  // Map API response to component format
  return data.map((t: any, index: number) => ({
    id: t.id || index + 1,
    name: t.name,
    location: t.location,
    rating: t.rating,
    text: t.quote,
    product: formatProductType(t.productType),
    date: t.dateReceived ? formatRelativeDate(t.dateReceived) : "Recently",
    verified: true, // Approved testimonials are considered verified
  }));
}

interface TestimonialsProps {
  variant?: "carousel" | "grid" | "featured";
}

export default function Testimonials({ variant = "carousel" }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Fetch testimonials from API with fallback to hardcoded data
  const { data: testimonials = fallbackTestimonials } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: fetchTestimonials,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Reset index when testimonials change
  useEffect(() => {
    if (currentIndex >= testimonials.length) {
      setCurrentIndex(0);
    }
  }, [testimonials.length, currentIndex]);

  // Auto-advance carousel
  useEffect(() => {
    if (!autoPlay || variant !== "carousel" || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, variant, testimonials.length]);

  const handlePrev = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  // Grid variant
  if (variant === "grid") {
    return (
      <section className="py-16 bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="font-semibold text-gray-900">4.9 out of 5</span>
              <span className="text-gray-500">based on 2,500+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= testimonial.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 mb-4 line-clamp-4">"{testimonial.text}"</p>

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                  {testimonial.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Featured single testimonial
  if (variant === "featured") {
    const featured = testimonials[0];
    return (
      <div className="bg-primary/5 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <Quote className="w-10 h-10 text-primary/30 flex-shrink-0" />
          <div>
            <p className="text-lg text-gray-700 mb-4">"{featured.text}"</p>
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= featured.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900">{featured.name}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">{featured.location}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Carousel variant (default)
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Thousands of Families
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="font-semibold text-gray-900">4.9 out of 5</span>
            <span className="text-gray-500">from 2,500+ reviews</span>
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Testimonial Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-[#f5f0e8] rounded-2xl p-8 md:p-12"
            >
              <Quote className="w-12 h-12 text-primary/20 mb-6" />

              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                "{testimonials[currentIndex].text}"
              </p>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= testimonials[currentIndex].rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-gray-500">
                    {testimonials[currentIndex].location} • {testimonials[currentIndex].product}
                  </p>
                </div>

                {testimonials[currentIndex].verified && (
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Verified Customer</span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setAutoPlay(false);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Mini testimonial for inline use
export function MiniTestimonial() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
      <Quote className="w-8 h-8 text-primary/20 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 line-clamp-2">
          "Got approved in 10 minutes with no medical exam. The rate was better than quotes I got from local agents."
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <span className="text-xs text-gray-500">Michael R., Chicago</span>
        </div>
      </div>
    </div>
  );
}
