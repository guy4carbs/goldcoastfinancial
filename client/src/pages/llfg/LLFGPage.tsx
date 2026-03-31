import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LLFGNav from "./components/LLFGNav";
import ScrollExpandMedia from "./components/ScrollExpandHero";
import About from "./components/sections/About";
import WhyJoin from "./components/sections/WhyJoin";
import SocialProof from "./components/sections/SocialProof";
import Carriers from "./components/sections/Carriers";
import Products from "./components/sections/Products";
import Agency from "./components/sections/Agency";
import Apply from "./components/sections/Apply";
import Contact from "./components/sections/Contact";
import LLFGFooter from "./components/LLFGFooter";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80";
const VIDEO_SRC =
  "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fgeneral%2F1774986667673-hf_20260331_190329_ce592e5a-362a-47f7-a819-ab2e634a41d9.mp4?alt=media&token=6d52c2cd-3cc6-4c6d-8ffb-03c61da891aa";


export default function LLFGPage() {
  const [heroActive, setHeroActive] = useState(true);

  useEffect(() => {
    document.title = "Legacy Life Financial Group | LLFG";
    window.scrollTo(0, 0);
    return () => {
      document.title =
        "Heritage Life Solutions | Protecting Families Nationwide";
    };
  }, []);

  // Hide overlays once user scrolls into content
  useEffect(() => {
    const onScroll = () => {
      setHeroActive(window.scrollY < 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="bg-[#0A0A0A] text-white min-h-screen"
      style={{ fontFamily: SANS }}
    >
      <LLFGNav />


      {/* Income stats bar — overlaid on hero, hides when scrolling content */}
      <motion.div
        className="fixed z-40 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-6 pointer-events-none bg-black/40 backdrop-blur-sm rounded-xl px-8 py-4"
        style={{ bottom: "100px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: heroActive ? 1 : 0 }}
        transition={{ duration: heroActive ? 0.6 : 0.2, delay: heroActive ? 0.6 : 0 }}
      >
        <StatItem value="$10K–$15K" label="Month 1" />
        <div className="w-px h-10 bg-[#B8963C]/40" />
        <StatItem value="$30K–$50K" label="Months 3–6" />
        <div className="w-px h-10 bg-[#B8963C]/40" />
        <StatItem value="$500K+" label="Top Producers" />
      </motion.div>

      {/* CTA button — overlaid on hero, hides when scrolling content */}
      <motion.div
        className="fixed z-40 left-1/2 -translate-x-1/2"
        style={{ bottom: "36px", pointerEvents: heroActive ? "auto" : "none" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: heroActive ? 1 : 0 }}
        transition={{ duration: heroActive ? 0.8 : 0.2, delay: heroActive ? 0.8 : 0 }}
      >
        <button
          onClick={() => {
            const el = document.querySelector("#apply");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="bg-[#B8963C] text-white font-medium px-8 py-3.5 rounded-md hover:bg-[#E8C96B] hover:text-[#0A0A0A] transition-all duration-200 shadow-lg"
          style={{ fontFamily: SANS }}
        >
          Apply as Agent &rarr;
        </button>
      </motion.div>

      <ScrollExpandMedia
        mediaType="video"
        mediaSrc={VIDEO_SRC}
        bgImageSrc={BG_IMAGE}
        title="Legacy Life"
        date="Est. 2024 · Naperville, IL"
        scrollToExpand="Scroll to expand"
        textBlend={true}
      >
        {/* All page content renders as children — shown after hero expansion */}
        <About />
        <WhyJoin />
        <SocialProof />
        <Carriers />
        <Products />
        <Agency />
        <Apply />
        <Contact />
        <LLFGFooter />
      </ScrollExpandMedia>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-[#E8C96B] text-xl md:text-2xl font-bold"
        style={{ fontFamily: SERIF }}
      >
        {value}
      </span>
      <span
        className="text-white/50 text-xs mt-1"
        style={{ fontFamily: SANS }}
      >
        {label}
      </span>
    </div>
  );
}
