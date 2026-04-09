/**
 * Public Business Card Page
 * Apple-style popup card view for sharing — no auth required
 * Route: /card/:agentId
 */
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "wouter";
import { BusinessCard3D } from "@/components/agent/BusinessCard3D";
import {
  Phone, Mail, Globe, Linkedin, Instagram, Facebook, Twitter,
  Shield, MapPin, Award, ExternalLink, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function PublicBusinessCard() {
  const params = useParams<{ agentId: string }>();
  const agentId = params.agentId;

  const { data: cardResponse, isLoading } = useQuery<{ success: boolean; data: any }>({
    queryKey: [`/api/card/${agentId}`],
    enabled: !!agentId,
  });

  const card = cardResponse?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-violet-400 mx-auto mb-4 opacity-50" />
          <h1 className="text-xl font-semibold text-white">Card Not Found</h1>
          <p className="text-sm text-gray-400 mt-2">This business card doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const fullName = `${card.firstName} ${card.lastName}`.trim();
  const socialLinks = [
    { url: card.linkedinUrl, icon: Linkedin, label: 'LinkedIn', color: '#0077B5' },
    { url: card.instagramUrl, icon: Instagram, label: 'Instagram', color: '#E4405F' },
    { url: card.facebookUrl, icon: Facebook, label: 'Facebook', color: '#1877F2' },
    { url: card.twitterUrl, icon: Twitter, label: 'Twitter', color: '#1DA1F2' },
  ].filter(s => s.url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* 3D Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <BusinessCard3D data={card} />
        </motion.div>

        {/* Apple-style info popup below card */}
        <motion.div
          className="mt-10 w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            {/* Name + Title */}
            <div className="text-center mb-5">
              {card.avatarUrl ? (
                <img src={card.avatarUrl} alt={fullName} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-3 border-white/30" />
              ) : (
                <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-3 border-white/30">
                  {card.firstName?.[0]}{card.lastName?.[0]}
                </div>
              )}
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
                {fullName}
              </h1>
              <p className="text-sm text-white/60 mt-1">{card.title}</p>
              <p className="text-xs text-amber-400/80 font-medium mt-0.5">{card.companyName}</p>
            </div>

            {/* Contact buttons */}
            <div className="space-y-2 mb-5">
              {card.phone && (
                <a href={`tel:${card.phone}`} className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/15 rounded-xl transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Phone</p>
                    <p className="text-sm font-medium text-white">{formatPhone(card.phone)}</p>
                  </div>
                </a>
              )}
              {card.email && (
                <a href={`mailto:${card.email}`} className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/15 rounded-xl transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Email</p>
                    <p className="text-sm font-medium text-white">{card.email}</p>
                  </div>
                </a>
              )}
              {card.websiteUrl && (
                <a href={card.websiteUrl?.startsWith("http") ? card.websiteUrl : `https://${card.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/15 rounded-xl transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Website</p>
                    <p className="text-sm font-medium text-white">{card.websiteUrl.replace(/^https?:\/\//, '')}</p>
                  </div>
                </a>
              )}
            </div>

            {/* Credentials */}
            {(card.licenseNumber || card.npn) && (
              <div className="border-t border-white/10 pt-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Credentials</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {card.licenseNumber && (
                    <div>
                      <p className="text-[9px] text-white/40 uppercase">License #</p>
                      <p className="text-xs text-white/80 font-medium">{card.licenseNumber}</p>
                    </div>
                  )}
                  {card.npn && (
                    <div>
                      <p className="text-[9px] text-white/40 uppercase">NPN</p>
                      <p className="text-xs text-white/80 font-medium">{card.npn}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Licensed states */}
            {card.licensedStates?.length > 0 && (
              <div className="border-t border-white/10 pt-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Licensed States</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {card.licensedStates.map((state: string) => (
                    <span key={state} className="px-2 py-1 text-[10px] font-medium bg-white/10 rounded-lg text-white/70">
                      {state}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-center gap-3">
                  {socialLinks.map(({ url, icon: Icon, label, color }) => (
                    <a
                      key={label}
                      href={url!.startsWith('http') ? url! : `https://${url!}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      title={label}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Heritage branding */}
          <motion.p
            className="text-center text-white/20 text-[10px] mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Powered by Heritage Life Solutions
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
