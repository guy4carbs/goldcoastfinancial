import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { CARRIER_BRANDING, type CarrierBranding } from "@shared/carrierBranding";
import {
  Shield, Lock, TrendingUp, Heart, DollarSign, FileText,
  CheckCircle, Phone, Mail, Calendar, Building2, Award,
  Printer, ArrowRight, Clock, User
} from "lucide-react";

interface QuoteData {
  quoteId: string;
  quoteRef: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  quoteType: string;
  quoteTypeName: string;
  carrierId: string;
  carrierName: string;
  coverageAmount: string;
  premium: string;
  premiumFrequency: string;
  termLength: string | null;
  healthClass: string | null;
  benefits: string;
  additionalNotes: string | null;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  agentNpn: string | null;
  status: string;
  createdAt: string;
}

const QUOTE_TYPE_CONFIG: Record<string, { icon: typeof Shield; label: string; color: string }> = {
  term_life: { icon: Shield, label: "Term Life Insurance", color: "blue" },
  whole_life: { icon: Lock, label: "Whole Life Insurance", color: "emerald" },
  iul: { icon: TrendingUp, label: "Indexed Universal Life", color: "violet" },
  final_expense: { icon: Heart, label: "Final Expense Insurance", color: "rose" },
  annuity: { icon: DollarSign, label: "Annuity", color: "amber" },
};

const heritageLogoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

export default function QuoteView() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [carrier, setCarrier] = useState<CarrierBranding | null>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const loadQuote = async () => {
      if (!id) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/quotes/${id}`);

        if (response.status === 404) {
          setIsNotFound(true);
          setIsLoading(false);
          return;
        }

        if (response.status === 410) {
          setIsExpired(true);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load quote");
        }

        const data = await response.json();
        setQuote(data.quote);

        const carrierBranding = CARRIER_BRANDING[data.quote.carrierId];
        if (carrierBranding) {
          setCarrier(carrierBranding);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading quote:", error);
        setIsNotFound(true);
        setIsLoading(false);
      }
    };

    loadQuote();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your quote...</p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Quote Expired</h2>
          <p className="text-gray-500 text-sm">
            This quote has expired. Please contact your agent to request an updated quote.
          </p>
        </div>
      </div>
    );
  }

  if (isNotFound || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Quote Not Found</h2>
          <p className="text-gray-500 text-sm">
            This quote may have expired or the link may be incorrect. Please contact your agent for assistance.
          </p>
        </div>
      </div>
    );
  }

  const primaryColor = carrier?.primaryColor || "#1E40AF";
  const gradientFrom = carrier?.gradientFrom || "#1E40AF";
  const gradientTo = carrier?.gradientTo || "#3B82F6";
  const carrierShortName = carrier?.shortName || quote.carrierName;
  const carrierTagline = carrier?.tagline || "";
  const carrierLogoUrl = carrier?.logoUrl || "";
  const carrierDescription = carrier?.description || "";
  const carrierTrustMessage = carrier?.trustMessage || "";

  const typeConfig = QUOTE_TYPE_CONFIG[quote.quoteType] || { icon: FileText, label: quote.quoteTypeName, color: "blue" };
  const TypeIcon = typeConfig.icon;

  const benefitsList = quote.benefits ? quote.benefits.split("\n").filter((b) => b.trim()) : [];

  const createdDate = new Date(quote.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const agentSlug = quote.agentName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  const agentInitials = quote.agentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Print Button */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all text-sm font-medium"
        >
          <Printer className="w-4 h-4" />
          Print Quote
        </button>
      </div>

      <div className="max-w-[680px] mx-auto py-8 px-4 print:py-0 print:px-0 print:max-w-none">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">

          {/* Carrier Header */}
          <div
            className="px-10 py-8 text-center print:py-6"
            style={{ backgroundColor: gradientFrom }}
          >
            {carrierLogoUrl && !logoError ? (
              <div className="inline-block bg-white rounded-xl px-6 py-3.5 mb-3">
                <img
                  src={carrierLogoUrl}
                  alt={carrierShortName}
                  className="block max-w-[180px] max-h-[60px] w-auto"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <h1 className="text-white text-[26px] font-bold mb-3">{carrierShortName}</h1>
            )}
            <p className="text-white/80 text-sm font-medium">in partnership with Heritage Life Solutions</p>
          </div>

          {/* Document Title Bar */}
          <div className="px-10 py-5 bg-gray-50 border-b-2" style={{ borderColor: primaryColor }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold" style={{ color: primaryColor }}>Personal Insurance Quote</h2>
                <p className="text-gray-500 text-xs mt-1">Ref: {quote.quoteRef} &bull; {createdDate}</p>
              </div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">Confidential</span>
            </div>
          </div>

          {/* Prepared For */}
          <div className="px-10 pt-8 pb-0">
            <div className="rounded-r-xl border-l-4 pl-6 pr-6 py-5" style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}08` }}>
              <p className="text-gray-700 text-base">
                Prepared for <strong style={{ color: primaryColor }}>{quote.clientName}</strong>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Thank you for your interest in protecting your family's future. Below is your personalized {typeConfig.label.toLowerCase()} quote from {carrierShortName}, prepared specifically for you.
              </p>
            </div>
          </div>

          {/* Product Summary Card */}
          <div className="px-10 py-6">
            <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: primaryColor }}>
              {/* Card header */}
              <div className="px-6 py-4" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
                <div className="flex items-center gap-3">
                  <TypeIcon className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-white font-bold text-base">{typeConfig.label}</p>
                    <p className="text-white/75 text-xs">{carrierShortName} &bull; {carrierTagline}</p>
                  </div>
                </div>
              </div>
              {/* Card body */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-gray-400 text-[11px] uppercase tracking-wider">Coverage Amount</p>
                    <p className="text-2xl font-extrabold mt-1" style={{ color: primaryColor }}>{quote.coverageAmount}</p>
                  </div>
                  <div className="border-l border-gray-100 pl-6">
                    <p className="text-gray-400 text-[11px] uppercase tracking-wider">
                      {quote.premiumFrequency === "annual" ? "Annual" : "Monthly"} Premium
                    </p>
                    <p className="text-2xl font-extrabold mt-1" style={{ color: primaryColor }}>{quote.premium}</p>
                  </div>
                </div>
                {(quote.termLength || quote.healthClass) && (
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    {quote.termLength && (
                      <div>
                        <p className="text-gray-400 text-[11px] uppercase tracking-wider">Term Length</p>
                        <p className="text-gray-800 text-base font-semibold mt-1">{quote.termLength}</p>
                      </div>
                    )}
                    {quote.healthClass && (
                      <div className={quote.termLength ? "border-l border-gray-100 pl-6" : ""}>
                        <p className="text-gray-400 text-[11px] uppercase tracking-wider">Health Classification</p>
                        <p className="text-gray-800 text-base font-semibold mt-1">{quote.healthClass}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          {benefitsList.length > 0 && (
            <div className="px-10 pb-6">
              <h3 className="text-gray-800 font-bold text-[15px] mb-3">Key Benefits Included</h3>
              <div className="space-y-2.5">
                {benefitsList.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.trim().replace(/^[-•]\s*/, "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {quote.additionalNotes && (
            <div className="px-10 pb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <p className="text-amber-800 text-[13px] font-semibold mb-1.5">Note from Your Agent</p>
                <p className="text-amber-700/80 text-sm leading-relaxed">{quote.additionalNotes}</p>
              </div>
            </div>
          )}

          {/* Carrier Trust Section */}
          {(carrierDescription || carrierTrustMessage) && (
            <div className="px-10 pb-6">
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4" style={{ color: primaryColor }} />
                  <h3 className="text-gray-800 font-semibold text-sm">About {carrierShortName}</h3>
                </div>
                <p className="text-gray-500 text-[13px] leading-relaxed">
                  {carrierTrustMessage || carrierDescription}. Heritage Life Solutions is an authorized {carrierShortName} distribution partner, ensuring you receive competitive rates and personalized service.
                </p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="px-10 pb-6">
            <h3 className="text-gray-800 font-bold text-[15px] mb-3">Next Steps</h3>
            <div className="space-y-3">
              {[
                "Review this quote and the benefits included",
                "Contact your agent with any questions or adjustments",
                "Accept and begin the application process",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-gray-600 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="px-10 pb-8 text-center">
            <a
              href={`/book/agent-${agentSlug}`}
              className="inline-flex items-center gap-2 text-white font-bold text-base px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
            >
              <Calendar className="w-5 h-5" />
              Schedule a Call to Review
            </a>
          </div>

          {/* Agent Credential Block */}
          <div className="px-10 pb-8 border-t-2" style={{ borderColor: primaryColor }}>
            <div className="flex items-start gap-4 pt-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
              >
                {agentInitials}
              </div>
              <div>
                <p className="text-gray-900 font-bold text-[17px]">{quote.agentName}</p>
                <p className="text-[13px] font-semibold mt-0.5" style={{ color: primaryColor }}>
                  Licensed Insurance Agent
                </p>
                <p className="text-gray-500 text-[13px]">Heritage Life Solutions</p>
                {quote.agentNpn && (
                  <p className="text-gray-400 text-xs mt-1">NPN: {quote.agentNpn}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <a href={`mailto:${quote.agentEmail}`} className="flex items-center gap-1.5 text-gray-500 text-[13px] hover:text-gray-700 transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                    {quote.agentEmail}
                  </a>
                  {quote.agentPhone && (
                    <a href={`tel:${quote.agentPhone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-1.5 text-[13px] font-semibold hover:opacity-80 transition-opacity" style={{ color: primaryColor }}>
                      <Phone className="w-3.5 h-3.5" />
                      {quote.agentPhone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Co-branded Footer */}
          <div className="bg-gray-50 px-10 py-5 text-center border-t border-gray-200">
            <div className="flex items-center justify-center gap-3">
              <img src={heritageLogoUrl} alt="Heritage Life Solutions" className="w-8 h-8 rounded-lg" />
              {carrierLogoUrl && !logoError && (
                <>
                  <div className="w-px h-6 bg-gray-200" />
                  <img src={carrierLogoUrl} alt={carrierShortName} className="max-w-[72px] max-h-8" onError={() => setLogoError(true)} />
                </>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-2.5">
              Heritage Life Solutions &mdash; Authorized {carrierShortName} Distribution Partner
            </p>
          </div>

          {/* Legal Footer */}
          <div className="bg-gray-100 px-10 py-5 border-t border-gray-200">
            <p className="text-gray-400 text-[11px] leading-relaxed text-center">
              &copy; 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states.
            </p>
            <p className="text-gray-400 text-[11px] leading-relaxed text-center mt-3">
              This quote is for informational purposes only and does not constitute a binding contract or guarantee of coverage. Final rates, terms, and coverage are subject to underwriting approval by {quote.carrierName}. Premiums may vary based on age, health status, and other factors determined during the underwriting process.
            </p>
            <p className="text-gray-400 text-[11px] leading-relaxed text-center mt-3">
              {quote.carrierName}. All products are issued by the respective carrier. Heritage Life Solutions does not guarantee any specific policy outcomes. Please review all policy documents carefully before making a decision.
            </p>
          </div>
        </div>

        {/* Bottom padding for mobile */}
        <div className="h-8 print:hidden" />
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:py-6 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
