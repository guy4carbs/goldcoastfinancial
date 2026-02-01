import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Shield, Lock, Heart, TrendingUp, Clock, CheckCircle,
  DollarSign, Users, BarChart, Zap, Plus, Sliders,
  ArrowLeft, ExternalLink, Star, Award, Building2, Calendar,
  Quote, Check, Phone, ArrowRight, Play, Image, MapPin,
  Briefcase, Target, ThumbsUp, X
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getCarrierBySlug, CarrierPhoto, CarrierVideo } from "@/data/carriers";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// Icon mapping
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Shield, Lock, Heart, TrendingUp, Clock, CheckCircle,
  DollarSign, Users, BarChart, Zap, Plus, Sliders
};

// Helper to extract YouTube video ID
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

// Photo Gallery Component
function PhotoGallery({ photos, carrierName }: { photos: CarrierPhoto[], carrierName: string }) {
  const [selectedPhoto, setSelectedPhoto] = useState<CarrierPhoto | null>(null);
  const validPhotos = photos.filter(p => p.url && p.url.length > 0);

  if (validPhotos.length === 0) return null;

  return (
    <>
      <section className="py-16 md:py-20 bg-[#fffaf3]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Image className="w-4 h-4" />
              Photo Gallery
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See {carrierName} in Action
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {validPhotos.map((photo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <Plus className="w-6 h-6 text-gray-900" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="max-w-4xl max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {selectedPhoto.caption && (
              <p className="text-white text-center mt-4">{selectedPhoto.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Video Section Component
function VideoSection({ videos, carrierName }: { videos: CarrierVideo[], carrierName: string }) {
  const validVideos = videos.filter(v => v.url && v.url.length > 0);

  if (validVideos.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-[#f5f0e8]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Play className="w-4 h-4" />
            Videos
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Learn More About {carrierName}
          </h2>
        </motion.div>

        <div className={`grid gap-6 ${validVideos.length === 1 ? 'max-w-3xl mx-auto' : 'md:grid-cols-2'}`}>
          {validVideos.map((video, i) => {
            const youtubeId = video.type === 'youtube' ? getYouTubeId(video.url) : null;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg"
              >
                {youtubeId ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={video.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                    >
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-primary" />
                      </div>
                      <span>Watch Video</span>
                    </a>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-gray-600">{video.description}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Company Highlights Component
function CompanyHighlights({ carrier }: { carrier: any }) {
  const highlights = [
    { icon: Calendar, label: "Founded", value: carrier.founded },
    { icon: MapPin, label: "Headquarters", value: carrier.headquarters },
    { icon: Award, label: "Rating", value: `${carrier.rating} (${carrier.ratingAgency})` },
    { icon: Target, label: "Specialty", value: carrier.products[0]?.name || "Life Insurance" }
  ];

  return (
    <section className="py-12 bg-white border-y border-[#e8e0d5]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {highlights.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                <p className="font-semibold text-gray-900 text-sm">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CarrierPage() {
  const { slug } = useParams<{ slug: string }>();
  const carrier = getCarrierBySlug(slug || "");

  if (!carrier) {
    return (
      <div className="min-h-screen bg-[#fffaf3] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Carrier Not Found</h1>
            <p className="text-gray-600 mb-8">The insurance carrier you're looking for doesn't exist.</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-primary py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src={carrier.heroImage}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Link href="/" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>

            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10 mb-8">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl p-4 flex items-center justify-center shadow-xl">
                <img
                  src={carrier.logo}
                  alt={carrier.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  {carrier.name}
                </h1>
                <p className="text-xl text-white/80 mb-4">{carrier.tagline}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <Award className="w-5 h-5 text-violet-400" />
                    <span className="text-white font-medium">{carrier.rating} Rated by {carrier.ratingAgency}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <Calendar className="w-5 h-5 text-violet-400" />
                    <span className="text-white font-medium">Est. {carrier.founded}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <Building2 className="w-5 h-5 text-violet-400" />
                    <span className="text-white font-medium">{carrier.headquarters}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Stats Bar */}
      <section className="bg-[#f5f0e8] border-b border-[#e8e0d5]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e8e0d5]">
            {carrier.keyStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="py-8 px-4 text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Highlights */}
      <CompanyHighlights carrier={carrier} />

      {/* Overview Section */}
      <section className="py-16 md:py-20 bg-[#fffaf3]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About {carrier.name.split(' ')[0]}</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">{carrier.overview}</p>
              <p className="text-gray-600 leading-relaxed">{carrier.history}</p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={carrier.heroImage}
                  alt={`${carrier.name} - Professional Services`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-xs hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Trusted Partner</p>
                    <p className="text-sm text-gray-500">Verified by Heritage Life</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      {carrier.videos && carrier.videos.length > 0 && (
        <VideoSection videos={carrier.videos} carrierName={carrier.name.split(' ')[0]} />
      )}

      {/* Why Choose Section */}
      <section className="py-16 md:py-20 bg-[#f5f0e8]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose {carrier.name.split(' ')[0]}?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Key reasons families trust {carrier.name.split(' ')[0]} for their life insurance needs
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-4"
          >
            {carrier.whyChoose.map((reason, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <p className="text-gray-700">{reason}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-20 bg-[#fffaf3]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Available Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive coverage options to protect what matters most
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {carrier.products.map((product, i) => {
              const IconComponent = iconMap[product.icon] || Shield;
              return (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group border border-[#e8e0d5]"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                      <IconComponent className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600">{product.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Photo Gallery */}
      {carrier.photos && carrier.photos.length > 0 && (
        <PhotoGallery photos={carrier.photos} carrierName={carrier.name.split(' ')[0]} />
      )}

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Customers Say
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Real experiences from real policyholders
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {carrier.testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8"
              >
                <Quote className="w-10 h-10 text-violet-400 mb-4" />
                <p className="text-lg text-white leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-white/70 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare Carriers Section */}
      <section className="py-16 md:py-20 bg-[#fffaf3]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#f5f0e8] to-white rounded-3xl p-8 md:p-12 border border-[#e8e0d5]"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Briefcase className="w-4 h-4" />
                  Multiple Options
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Not Sure If {carrier.name.split(' ')[0]} Is Right for You?
                </h2>
                <p className="text-gray-600 mb-6">
                  We partner with 12+ top-rated insurance carriers to find the perfect coverage for your unique needs. Let us compare options and find you the best rates.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    Free comparison
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    No obligation
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    Expert guidance
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Link href="/quote">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg">
                    Compare All Carriers
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-[#f5f0e8] to-primary/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Get Protected with {carrier.name.split(' ')[0]}?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Our team at Heritage Life Solutions can help you find the perfect {carrier.name.split(' ')[0]} policy for your needs. Get a personalized quote in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
                  Get Your Free Quote
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-lg w-full sm:w-auto">
                  <Phone className="w-5 h-5 mr-2" />
                  Talk to an Advisor
                </Button>
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-[#e8e0d5]">
              <p className="text-sm text-gray-500 mb-4">Learn more about {carrier.name}</p>
              <a
                href={carrier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Visit Official Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-12 bg-white border-t border-[#e8e0d5]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#f5f0e8] rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Trusted Partner of Heritage Life Solutions</p>
                <p className="text-gray-600">Working together to protect families nationwide</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600">5-Star Carrier Partner</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
