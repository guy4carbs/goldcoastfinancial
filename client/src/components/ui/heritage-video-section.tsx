import { motion } from "framer-motion";
import { Play, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  cream: "#fffaf3",
  white: "#ffffff",
};

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  externalUrl: string;
  source: string;
}

const videos: Video[] = [
  {
    id: "life-insurance-101",
    title: "Life Insurance 101",
    description: "A comprehensive introduction to life insurance basics - what it is, why you need it, and how it protects your family.",
    duration: "1 min",
    category: "Beginner",
    externalUrl: "https://lifehappens.org/videos/life-insurance-101/",
    source: "Life Happens",
  },
  {
    id: "term-life-basics",
    title: "Understanding Term Life Insurance",
    description: "Learn how term life insurance works, coverage periods, and why it's the most affordable option for most families.",
    duration: "5 min",
    category: "Term Life",
    externalUrl: "https://www.khanacademy.org/college-careers-more/financial-literacy/xa6995ea67a8e9fdd:insurance/xa6995ea67a8e9fdd:life-insurance/v/group-term-and-whole-life-insurance",
    source: "Khan Academy",
  },
  {
    id: "whole-life-explained",
    title: "Whole Life Insurance Explained",
    description: "Discover how whole life insurance provides lifetime coverage and builds cash value over time.",
    duration: "7 min",
    category: "Whole Life",
    externalUrl: "https://www.khanacademy.org/college-careers-more/financial-literacy/xa6995ea67a8e9fdd:insurance/xa6995ea67a8e9fdd:life-insurance/v/introduction-to-life-insurance",
    source: "Khan Academy",
  },
  {
    id: "coverage-calculator",
    title: "How Much Life Insurance Do You Need?",
    description: "Use this interactive calculator to determine the right amount of coverage for your family's needs.",
    duration: "5 min",
    category: "Calculator",
    externalUrl: "https://lifehappens.org/life-insurance-needs-calculator/",
    source: "Life Happens",
  },
];

export function HeritageVideoSection() {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: c.cream }}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
            <span className="font-medium tracking-wide uppercase text-sm" style={{ color: c.secondary }}>Learn By Watching</span>
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4" style={{ color: c.primary }}>
            Educational Resources
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: c.textSecondary }}>
            Explore these trusted educational resources to better understand life insurance concepts and make informed decisions.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden group h-full flex flex-col" style={{ backgroundColor: c.white, borderColor: c.muted }}>
                <div
                  className="relative aspect-video flex items-center justify-center"
                  style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryHover})` }}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-10" style={{ backgroundColor: `${c.white}e6` }}>
                    <Play className="w-6 h-6 ml-1" style={{ color: c.primary }} fill="currentColor" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </div>
                  <div
                    className="absolute top-2 left-2 text-xs px-2 py-1 rounded font-medium"
                    style={{ backgroundColor: `${c.secondary}e6`, color: c.textPrimary }}
                  >
                    {video.source}
                  </div>
                </div>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <Badge
                    variant="secondary"
                    className="mb-2 text-xs w-fit"
                    style={{ backgroundColor: `${c.primary}15`, color: c.primary }}
                  >
                    {video.category}
                  </Badge>
                  <h3 className="font-semibold mb-2 line-clamp-2" style={{ color: c.primary }}>
                    {video.title}
                  </h3>
                  <p className="text-sm line-clamp-2 mb-4 flex-grow" style={{ color: c.textSecondary }}>
                    {video.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-auto"
                    style={{ borderColor: c.primary, color: c.primary }}
                    asChild
                  >
                    <a
                      href={video.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Watch Now
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <p className="text-sm" style={{ color: c.textSecondary }}>
            These resources are provided by trusted nonprofit organizations dedicated to insurance education.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
