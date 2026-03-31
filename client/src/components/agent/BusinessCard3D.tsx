"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  Phone, Mail, Globe, Linkedin, Instagram, Facebook, Twitter,
  Shield, MapPin, Award
} from "lucide-react";

const PERSPECTIVE = 1200;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

interface BusinessCardData {
  firstName: string;
  lastName: string;
  title: string;
  companyName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  avatarUrl?: string;
  licenseNumber?: string;
  npn?: string;
  licensedStates?: string[];
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
}

interface BusinessCard3DProps {
  data: BusinessCardData;
  className?: string;
}

export function BusinessCard3D({ data, className }: BusinessCard3DProps) {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-200, 200], [8, -8]);
  const rotateY = useTransform(x, [-200, 200], [-8, 8]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const initials = `${data.firstName?.[0] || ""}${data.lastName?.[0] || ""}`.toUpperCase();
  const fullName = `${data.firstName} ${data.lastName}`.trim();

  const socialLinks = [
    { url: data.linkedinUrl, icon: Linkedin, label: "LinkedIn", color: "#0077B5" },
    { url: data.instagramUrl, icon: Instagram, label: "Instagram", color: "#E4405F" },
    { url: data.facebookUrl, icon: Facebook, label: "Facebook", color: "#1877F2" },
    { url: data.twitterUrl, icon: Twitter, label: "Twitter", color: "#1DA1F2" },
  ].filter((s) => s.url);

  return (
    <div className={className}>
      <motion.div
        className="relative w-[460px] h-[270px] mx-auto"
        style={{ perspective: PERSPECTIVE }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 80, damping: 20 }}
      >
        <motion.div
          className="relative w-full h-full cursor-pointer"
          style={{
            transformStyle: "preserve-3d",
            rotateX,
            rotateY: isFlipped ? 180 : rotateY,
          }}
          animate={{ scale: isClicked ? 0.96 : 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 120, damping: 20 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            setIsClicked(true);
            setTimeout(() => setIsClicked(false), 200);
            setTimeout(() => setIsFlipped(!isFlipped), 100);
          }}
        >
          {/* ═══════════════════════ FRONT ═══════════════════════ */}
          <motion.div
            className="absolute inset-0 rounded-[20px] overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: "linear-gradient(140deg, #0f0a1e 0%, #171335 30%, #1e1b4b 55%, #2e1065 80%, #1a0b2e 100%)",
              boxShadow:
                "0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.06) inset, inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* Metallic noise texture */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 0.5px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            />

            {/* Gold foil accent — top */}
            <div
              className="absolute top-0 left-[8%] right-[8%] h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, #B8973A 15%, #D4AF37 35%, #F4D58D 50%, #D4AF37 65%, #B8973A 85%, transparent 100%)",
              }}
            />

            {/* Shimmer sweep */}
            <div className="absolute inset-0 overflow-hidden rounded-[20px]">
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.07) 44%, rgba(255,255,255,0.03) 50%, transparent 56%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 7, ease: "linear" }}
              />
            </div>

            <div className="relative h-full flex flex-col justify-between p-7 text-white">
              {/* Top: Company brand */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.04))",
                      border: "1px solid rgba(212,175,55,0.2)",
                    }}
                  >
                    <Shield className="w-[18px] h-[18px]" style={{ color: "#D4AF37" }} />
                  </div>
                  <span
                    className="text-[11px] font-semibold tracking-[0.18em] uppercase"
                    style={{ color: "rgba(212,175,55,0.75)" }}
                  >
                    {data.companyName}
                  </span>
                </div>
              </div>

              {/* Center: Avatar + Name + Title */}
              <div className="flex items-center gap-4">
                {data.avatarUrl ? (
                  <img
                    src={data.avatarUrl}
                    alt={fullName}
                    className="w-[64px] h-[64px] rounded-full object-cover shadow-lg"
                    style={{ border: "2.5px solid rgba(212,175,55,0.35)" }}
                  />
                ) : (
                  <div
                    className="w-[64px] h-[64px] rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(99,102,241,0.15))",
                      border: "2.5px solid rgba(212,175,55,0.25)",
                      color: "#D4AF37",
                    }}
                  >
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-[21px] font-bold tracking-wide leading-tight"
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      color: "#F2EDE3",
                    }}
                  >
                    {fullName}
                  </h2>
                  <p
                    className="text-[12px] font-medium mt-1 tracking-wide"
                    style={{ color: "#D4AF37" }}
                  >
                    {data.title}
                  </p>
                </div>
              </div>

              {/* Bottom: Contact row */}
              <div>
                {/* Thin separator */}
                <div
                  className="mb-3 h-[1px]"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.15) 20%, rgba(212,175,55,0.15) 80%, transparent)",
                  }}
                />
                <div className="flex items-center gap-5 text-[11px]" style={{ color: "rgba(242,237,227,0.6)" }}>
                  {data.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" style={{ color: "rgba(212,175,55,0.5)" }} />
                      {formatPhone(data.phone)}
                    </span>
                  )}
                  {data.email && (
                    <span className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3" style={{ color: "rgba(212,175,55,0.5)" }} />
                      {data.email}
                    </span>
                  )}
                  {data.websiteUrl && (
                    <span className="flex items-center gap-1.5 truncate">
                      <Globe className="w-3 h-3" style={{ color: "rgba(212,175,55,0.5)" }} />
                      {data.websiteUrl.replace(/^https?:\/\//, "")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══════════════════════ BACK ═══════════════════════ */}
          <motion.div
            className="absolute inset-0 rounded-[20px] overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(160deg, #0a0a14 0%, #10102a 35%, #0f172a 65%, #0c0c1d 100%)",
              boxShadow:
                "0 30px 60px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.05) inset, inset 0 1px 0 rgba(255,255,255,0.07)",
            }}
          >
            {/* Gold accent line */}
            <div
              className="absolute top-0 left-[8%] right-[8%] h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, #B8973A 15%, #D4AF37 35%, #F4D58D 50%, #D4AF37 65%, #B8973A 85%, transparent 100%)",
              }}
            />

            {/* Subtle pattern */}
            <div
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 0.5px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />

            <div className="relative h-full p-6 text-white flex flex-col justify-between">
              {/* Top: Credentials */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <Award className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.15em]"
                    style={{ color: "#D4AF37" }}
                  >
                    Credentials & Licensing
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p
                      className="text-[9px] uppercase tracking-wider font-semibold mb-0.5"
                      style={{ color: "rgba(212,175,55,0.55)" }}
                    >
                      License #
                    </p>
                    <p className="text-[13px] font-bold" style={{ color: "#F2EDE3" }}>
                      {data.licenseNumber || "—"}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p
                      className="text-[9px] uppercase tracking-wider font-semibold mb-0.5"
                      style={{ color: "rgba(212,175,55,0.55)" }}
                    >
                      NPN
                    </p>
                    <p className="text-[13px] font-bold" style={{ color: "#F2EDE3" }}>
                      {data.npn || "—"}
                    </p>
                  </div>
                </div>

                {/* Licensed states */}
                {data.licensedStates && data.licensedStates.length > 0 && (
                  <div className="mt-3.5">
                    <p
                      className="text-[9px] uppercase tracking-wider font-semibold flex items-center gap-1 mb-2"
                      style={{ color: "rgba(212,175,55,0.55)" }}
                    >
                      <MapPin className="w-2.5 h-2.5" /> Licensed States
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {data.licensedStates.slice(0, 20).map((state) => (
                        <span
                          key={state}
                          className="px-2 py-[3px] text-[8px] font-bold rounded-md"
                          style={{
                            background: "rgba(212,175,55,0.08)",
                            border: "1px solid rgba(212,175,55,0.14)",
                            color: "rgba(212,175,55,0.75)",
                          }}
                        >
                          {state}
                        </span>
                      ))}
                      {data.licensedStates.length > 20 && (
                        <span className="px-2 py-[3px] text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                          +{data.licensedStates.length - 20}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom: Social + Company */}
              <div className="flex items-end justify-between">
                {socialLinks.length > 0 ? (
                  <div className="flex items-center gap-2">
                    {socialLinks.map(({ url, icon: Icon, label, color }) => (
                      <a
                        key={label}
                        href={url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:brightness-125"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                        title={label}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div />
                )}

                <div className="text-right">
                  <p
                    className="text-[9px] font-semibold tracking-[0.12em] uppercase"
                    style={{ color: "rgba(212,175,55,0.2)" }}
                  >
                    {data.companyName}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Ambient glow */}
        <motion.div
          className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(99, 102, 241, 0.1)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(212, 175, 55, 0.06)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.p
        className="text-center text-gray-400 text-[11px] mt-4 tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Click to flip &middot; Hover for 3D effect
      </motion.p>
    </div>
  );
}
