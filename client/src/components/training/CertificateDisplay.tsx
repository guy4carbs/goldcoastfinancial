/**
 * CertificateDisplay - Certificate viewer and download component
 *
 * Shows certificate preview and provides download functionality.
 * Certificates are generated server-side as PDFs.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  Download,
  ExternalLink,
  Calendar,
  User,
  Shield,
  CheckCircle,
  Sparkles,
  Share2,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Certificate {
  id: string;
  userId: string;
  certificationId: string;
  issuedAt: string;
  expiresAt: string | null;
  certificateNumber: string;
  pdfUrl: string | null;
}

interface CertificateInfo {
  id: string;
  name: string;
  description: string;
  level: "pre_access" | "core_advisor" | "live_client" | "specialist";
  color: string;
  requirements: string[];
}

// Certificate metadata
const certificateInfo: Record<string, CertificateInfo> = {
  "cert-pre-access": {
    id: "cert-pre-access",
    name: "Pre-Access Certification",
    description: "Authorized for system access and basic operations",
    level: "pre_access",
    color: "blue",
    requirements: ["Complete onboarding modules", "Pass doctrine assessment"]
  },
  "cert-core-advisor": {
    id: "cert-core-advisor",
    name: "Core Advisor Certification",
    description: "Certified Gold Coast Financial Advisor",
    level: "core_advisor",
    color: "purple",
    requirements: [
      "Complete all product modules",
      "Pass compliance stress test",
      "Complete sales training"
    ]
  },
  "cert-live-client": {
    id: "cert-live-client",
    name: "Live Client Authorization",
    description: "Authorized for live client interactions",
    level: "live_client",
    color: "green",
    requirements: [
      "Core Advisor certification",
      "Pass simulation exercises",
      "Manager approval"
    ]
  }
};

const levelColors: Record<string, string> = {
  pre_access: "bg-blue-100 text-blue-700 border-blue-300",
  core_advisor: "bg-purple-100 text-purple-700 border-purple-300",
  live_client: "bg-green-100 text-green-700 border-green-300",
  specialist: "bg-amber-100 text-amber-700 border-amber-300"
};

interface CertificateListProps {
  className?: string;
}

export function CertificateList({ className }: CertificateListProps) {
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);

  const { data: certificates, isLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/training/certificates"],
    queryFn: async () => {
      const res = await fetch("/api/training/certificates", {
        credentials: "include"
      });
      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error("Failed to fetch certificates");
      }
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="py-12 text-center">
          <Award className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="font-medium text-gray-600">No Certificates Yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Complete training milestones to earn certificates
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {certificates.map((cert) => {
        const info = certificateInfo[cert.certificationId];
        return (
          <CertificateCard
            key={cert.id}
            certificate={cert}
            info={info}
            onClick={() => setSelectedCertificate(cert)}
          />
        );
      })}

      {/* Certificate detail dialog */}
      <Dialog
        open={!!selectedCertificate}
        onOpenChange={() => setSelectedCertificate(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedCertificate && (
            <CertificateDetail
              certificate={selectedCertificate}
              info={certificateInfo[selectedCertificate.certificationId]}
              onClose={() => setSelectedCertificate(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CertificateCardProps {
  certificate: Certificate;
  info?: CertificateInfo;
  onClick?: () => void;
  compact?: boolean;
}

export function CertificateCard({
  certificate,
  info,
  onClick,
  compact = false
}: CertificateCardProps) {
  const name = info?.name || certificate.certificationId;
  const level = info?.level || "pre_access";

  if (compact) {
    return (
      <div
        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-violet-500/50 transition-colors"
        onClick={onClick}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            levelColors[level]
          )}
        >
          <Award className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{name}</p>
          <p className="text-xs text-gray-500">
            Issued {new Date(certificate.issuedAt).toLocaleDateString()}
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {certificate.certificateNumber}
        </Badge>
      </div>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:border-violet-500/50 transition-colors overflow-hidden"
      onClick={onClick}
    >
      {/* Decorative header */}
      <div
        className={cn(
          "h-2",
          level === "pre_access" && "bg-gradient-to-r from-blue-400 to-blue-600",
          level === "core_advisor" &&
            "bg-gradient-to-r from-purple-400 to-purple-600",
          level === "live_client" &&
            "bg-gradient-to-r from-green-400 to-green-600",
          level === "specialist" &&
            "bg-gradient-to-r from-amber-400 to-amber-600"
        )}
      />
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
              levelColors[level]
            )}
          >
            <Award className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-primary">{name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{info?.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>
                  Issued {new Date(certificate.issuedAt).toLocaleDateString()}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                #{certificate.certificateNumber}
              </Badge>
            </div>
          </div>
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

interface CertificateDetailProps {
  certificate: Certificate;
  info?: CertificateInfo;
  onClose: () => void;
}

function CertificateDetail({
  certificate,
  info,
  onClose
}: CertificateDetailProps) {
  const [copied, setCopied] = useState(false);
  const name = info?.name || certificate.certificationId;
  const level = info?.level || "pre_access";

  const handleCopyLink = () => {
    const verifyUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    // For now, just show a message - PDF generation would be implemented server-side
    alert(
      "PDF download will be available soon. Certificate number: " +
        certificate.certificateNumber
    );
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              levelColors[level]
            )}
          >
            <Award className="w-6 h-6" />
          </motion.div>
          <div>
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>{info?.description}</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6 mt-4">
        {/* Certificate Preview */}
        <div className="relative bg-gradient-to-br from-primary/5 to-violet-500/10 rounded-xl p-6 border-2 border-violet-500/20">
          {/* Decorative elements */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-violet-500/30 rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-violet-500/30 rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-violet-500/30 rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-violet-500/30 rounded-br-lg" />

          <div className="text-center">
            <Sparkles className="w-6 h-6 mx-auto text-violet-500 mb-2" />
            <p className="text-xs text-violet-500 font-medium uppercase tracking-wider">
              Certificate of Completion
            </p>
            <h3 className="text-xl font-bold text-primary mt-2">
              {name}
            </h3>
            <div className="mt-4 pt-4 border-t border-violet-500/20">
              <p className="text-sm text-gray-600">Certificate Number</p>
              <p className="font-mono text-lg font-bold text-primary">
                {certificate.certificateNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Certificate details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Issue Date</span>
            </div>
            <p className="font-medium">
              {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Status</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-700">Valid</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </>
            )}
          </Button>
          <Button className="flex-1" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Verification info */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Verify this certificate at{" "}
            <span className="text-violet-500">
              goldcoastfnl.com/verify/{certificate.certificateNumber}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * CertificateEarned - Celebration dialog when earning a new certificate
 */
interface CertificateEarnedProps {
  certificate: Certificate;
  info?: CertificateInfo;
  isOpen: boolean;
  onClose: () => void;
}

export function CertificateEarned({
  certificate,
  info,
  isOpen,
  onClose
}: CertificateEarnedProps) {
  const name = info?.name || certificate.certificationId;
  const level = info?.level || "pre_access";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center py-6"
        >
          {/* Celebration effects */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
              className={cn(
                "w-24 h-24 mx-auto rounded-2xl flex items-center justify-center shadow-lg",
                levelColors[level]
              )}
            >
              <Award className="w-12 h-12" />
            </motion.div>

            {/* Sparkle effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2"
                style={{
                  left: `${50 + Math.cos(i * 60 * (Math.PI / 180)) * 60}%`,
                  top: `${50 + Math.sin(i * 60 * (Math.PI / 180)) * 60}%`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
              >
                <Sparkles className="w-4 h-4 text-violet-500" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-violet-500 font-medium uppercase tracking-wider text-sm mt-6">
              Certification Earned
            </p>
            <h2 className="text-2xl font-bold text-primary mt-2">
              {name}
            </h2>
            <p className="text-gray-600 mt-2">{info?.description}</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-gray-50 rounded-lg"
          >
            <p className="text-xs text-gray-500">Certificate Number</p>
            <p className="font-mono font-bold text-primary">
              {certificate.certificateNumber}
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button onClick={onClose} className="mt-6 w-full">
              <CheckCircle className="w-4 h-4 mr-2" />
              View Certificate
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
