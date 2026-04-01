import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Globe } from "lucide-react";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" ref={ref} className="py-16 bg-[#0A0A0A]" style={{ fontFamily: SANS }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto px-6 text-center"
      >
        <h2
          className="text-3xl text-white font-bold"
          style={{ fontFamily: SERIF }}
        >
          Get in <em className="italic text-[#E8C96B]">Touch</em>
        </h2>
        <p className="text-white/50 mt-3 text-base">
          Questions? Our team responds within one business day.
        </p>

        <div className="flex justify-center gap-10 mt-8">
          <a
            href="mailto:support@llfg.us"
            className="flex items-center gap-2 text-[#E8C96B] text-base font-medium hover:text-white transition-colors whitespace-nowrap"
          >
            <Mail size={16} className="text-[#B8963C]" />
            support@llfg.us
          </a>
          <a
            href="https://llfg.us"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#E8C96B] text-base font-medium hover:text-white transition-colors whitespace-nowrap"
          >
            <Globe size={16} className="text-[#B8963C]" />
            llfg.us
          </a>
        </div>
      </motion.div>
    </section>
  );
}
