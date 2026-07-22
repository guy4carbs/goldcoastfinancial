import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives";
import { Pagination, usePagination } from "@/components/agent/primitives/Pagination";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, GLASS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import { TOUR } from "@/lib/tour/selectors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Lock,
  Key,
  FileCheck,
  Send,
  Mail,
  MessageSquare,
  FileText,
  User,
  Building,
  Building2,
  Copy,
  Clock,
  Eye,
  Smartphone,
  Monitor,
  CreditCard,
  Heart,
  Stethoscope,
  Users,
  DollarSign,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  IdCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAgentStore } from "@/lib/agentStore";
import { CARRIER_BRANDING } from "@shared/carrierBranding";

// Get carrier color from branding
const getCarrierColor = (carrierId: string): string => {
  return CARRIER_BRANDING[carrierId]?.primaryColor || "#1E40AF";
};

const getCarrierGradient = (carrierId: string): { from: string; to: string } => {
  const branding = CARRIER_BRANDING[carrierId];
  return {
    from: branding?.gradientFrom || "#1E40AF",
    to: branding?.gradientTo || "#3B82F6"
  };
};

// Insurance Carriers
const INSURANCE_CARRIERS = [
  { id: "aetna", name: "Aetna" },
  { id: "american-amicable", name: "American Amicable" },
  { id: "americo", name: "Americo Financial" },
  { id: "baltimore-life", name: "Baltimore Life" },
  { id: "banner-life", name: "Banner Life" },
  { id: "chubb", name: "Chubb" },
  { id: "corebridge", name: "Corebridge Financial" },
  { id: "mutual-of-omaha", name: "Mutual of Omaha" },
  { id: "ethos", name: "Ethos Life" },
  { id: "foresters", name: "Foresters" },
  { id: "globe-life", name: "Globe Life" },
  { id: "guarantee-trust", name: "Guarantee Trust" },
  { id: "instabrain", name: "InstaBrain" },
  { id: "lafayette-life", name: "Lafayette Life" },
  { id: "lumico", name: "Lumico" },
  { id: "royal-neighbors", name: "Royal Neighbors" },
  { id: "transamerica", name: "Transamerica" },
  { id: "american-home-life", name: "American Home Life" },
  { id: "polish-falcons", name: "Polish Falcons" },
  { id: "trinity-life", name: "Trinity Life" },
  { id: "united-home-life", name: "United Home Life" },
];

interface SecureFormType {
  id: string;
  name: string;
  description: string;
  icon: typeof Shield;
  color: string;
  fields: string[];
}

const SECURE_FORM_TYPES: SecureFormType[] = [
  {
    id: "ssn",
    name: "Social Security Number",
    description: "Collect SSN securely for application processing",
    icon: User,
    color: "blue",
    fields: ["Full Legal Name", "Date of Birth", "Social Security Number"]
  },
  {
    id: "banking",
    name: "Banking Information",
    description: "Collect routing and account numbers for premium payments",
    icon: Building,
    color: "emerald",
    fields: ["Bank Name", "Routing Number", "Account Number", "Account Type"]
  },
  {
    id: "drivers_license",
    name: "Driver's License / State ID",
    description: "Collect ID details for identity verification",
    icon: IdCard,
    color: "violet",
    fields: ["Full Legal Name", "License Number", "State", "Expiration Date", "Date of Birth"]
  },
  {
    id: "full_application",
    name: "Full Application",
    description: "Complete application with all sensitive information",
    icon: FileText,
    color: "violet",
    fields: ["Personal Info", "SSN", "Banking Details", "Beneficiary Info", "Health Questions"]
  }
];

interface SentLink {
  id: string;
  type: string;
  clientName: string;
  clientContact: string;
  method: "email" | "text" | "both";
  sentAt: Date;
  expiresAt: Date;
  status: "pending" | "opened" | "completed" | "expired";
  carrier?: string;
  carrierId?: string;
  // Agent who sent the form
  agentId: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  // Submitted data
  hasSubmittedData?: boolean;
}

interface SubmittedFormData {
  linkId: string;
  formType: string;
  carrierId: string;
  carrierName: string;
  clientName: string;
  agentName: string;
  status: string;
  submittedData: Record<string, any>;
  submittedAt: string;
}

type SendMethod = "email" | "sms" | "both";
type PreviewTab = "email" | "sms" | "form";
type DevicePreview = "phone" | "desktop";

export default function AgentDataEncryption() {
  // Get current agent from store
  const currentUser = useAgentStore((state) => state.currentUser);

  // Agent info with fallbacks
  const agentName = currentUser?.name || "Agent";
  const agentEmail = currentUser?.email || "agent@heritagels.org";
  const agentPhone = currentUser?.phone || "(555) 000-0000";
  const agentFirstName = agentName.split(" ")[0];

  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState<SecureFormType | null>(null);

  // View Data Dialog State
  const [viewDataDialogOpen, setViewDataDialogOpen] = useState(false);
  const [viewingFormData, setViewingFormData] = useState<SubmittedFormData | null>(null);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);

  // Shared Form State
  const [formClientName, setFormClientName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCarrier, setFormCarrier] = useState("");
  const [formSendMethod, setFormSendMethod] = useState<SendMethod>("email");
  const [formCustomMessage, setFormCustomMessage] = useState("");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("email");
  const [devicePreview, setDevicePreview] = useState<DevicePreview>("phone");
  const [isSending, setIsSending] = useState(false);

  const [sentLinks, setSentLinks] = useState<SentLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);

  // Paginate the secure-link history at 10 rows per page (server already
  // scopes the response to the requesting agent only).
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems: paginatedLinks,
    totalItems: totalLinks,
    goToPage,
    changeItemsPerPage,
  } = usePagination(sentLinks, 10);

  // Fetch sent forms from server on mount
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch('/api/secure-forms', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          // Map server response to SentLink format
          const links: SentLink[] = data.forms.map((form: any) => ({
            id: form.linkId,
            type: form.formType === 'ssn' ? 'Social Security Number'
                : form.formType === 'banking' ? 'Banking Information'
                : form.formType === 'drivers_license' ? "Driver's License / State ID"
                : form.formType === 'full_application' ? 'Full Application'
                : form.formType,
            clientName: form.clientName,
            clientContact: form.clientEmail || form.clientPhone || '',
            method: 'email' as const,
            sentAt: new Date(form.createdAt),
            expiresAt: new Date(form.expiresAt),
            status: form.status === 'completed' ? 'completed'
                  : new Date(form.expiresAt) < new Date() ? 'expired'
                  : 'pending' as SentLink['status'],
            carrier: form.carrierName,
            carrierId: form.carrierId,
            agentId: 'agent-1',
            agentName: form.agentName,
            agentEmail: form.agentEmail || '',
            agentPhone: '',
            hasSubmittedData: form.hasSubmittedData
          }));
          setSentLinks(links);
        }
      } catch (error) {
        console.error('Failed to fetch forms:', error);
      } finally {
        setIsLoadingLinks(false);
      }
    };
    fetchForms();
  }, []);

  const openSendDialog = (formType: SecureFormType) => {
    setSelectedFormType(formType);
    // Reset form state
    setFormClientName("");
    setFormEmail("");
    setFormPhone("");
    setFormCarrier("");
    setFormSendMethod("email");
    setFormCustomMessage("");
    setPreviewTab("email");
    setDevicePreview("phone");
    setSendDialogOpen(true);
  };

  const handleSendForm = async () => {
    if (!selectedFormType) return;
    if (!currentUser) {
      toast.error("You must be logged in to send secure forms");
      return;
    }

    if (!formClientName) {
      toast.error("Client name is required");
      return;
    }
    if (!formCarrier) {
      toast.error("Please select an insurance carrier");
      return;
    }
    if (formSendMethod === "email" && !formEmail) {
      toast.error("Email address is required for email delivery");
      return;
    }
    if (formSendMethod === "sms" && !formPhone) {
      toast.error("Phone number is required for SMS delivery");
      return;
    }
    if (formSendMethod === "both" && (!formEmail || !formPhone)) {
      toast.error("Both email and phone are required for dual delivery");
      return;
    }

    setIsSending(true);

    try {
      const contact = formSendMethod === "sms" ? formPhone : formEmail;
      const carrierName = INSURANCE_CARRIERS.find(c => c.id === formCarrier)?.name || formCarrier;

      // Prepare the secure form request payload
      const formPayload = {
        formType: selectedFormType.id,
        clientName: formClientName,
        clientEmail: formEmail || null,
        clientPhone: formPhone || null,
        carrier: carrierName,
        carrierId: formCarrier,
        sendMethod: formSendMethod,
        customMessage: formCustomMessage || null,
        // Agent information - this is who the form is sent FROM
        agent: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
        }
      };

      // Call the API to send the secure form. credentials:'include' so the
      // session cookie reaches the server (POST is now requireAuth-gated).
      const response = await fetch('/api/secure-forms/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPayload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send secure form');
      }

      // Create the sent link record using API response
      const newLink: SentLink = {
        id: result.linkId || `link-${Date.now()}`,
        type: selectedFormType.name,
        clientName: formClientName,
        clientContact: formSendMethod === "both" ? `${formEmail} / ${formPhone}` : contact,
        method: formSendMethod === "sms" ? "text" : formSendMethod === "both" ? "both" : "email",
        sentAt: new Date(),
        expiresAt: new Date(result.expiresAt || Date.now() + 24 * 60 * 60 * 1000),
        status: "pending",
        carrier: carrierName,
        agentId: currentUser.id,
        agentName: currentUser.name,
        agentEmail: currentUser.email,
        agentPhone: currentUser.phone,
      };

      setSentLinks(prev => [newLink, ...prev]);

      // Show success messages based on what was actually sent
      if (result.emailSent) {
        toast.success(`Email sent from ${currentUser.email}`, {
          description: `Secure link delivered to ${formEmail}`
        });
      }
      if (result.smsSent) {
        toast.success(`SMS sent from ${currentUser.phone}`, {
          description: `Secure link delivered to ${formPhone}`
        });
      }
      if (formSendMethod === "sms" && !result.smsSent) {
        toast.info("SMS feature coming soon", {
          description: "Email was sent as fallback if email was provided"
        });
      }

      setSendDialogOpen(false);
    } catch (error: any) {
      console.error("[SecureForm] Error:", error);
      toast.error(error.message || "Failed to send secure form", {
        description: "Please check your connection and try again"
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyLink = (linkId: string) => {
    const baseUrl = window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/secure/form/${linkId}`);
    toast.success("Secure link copied to clipboard");
  };

  const resendLink = async (link: SentLink) => {
    try {
      const res = await fetch(`/api/secure-forms/${link.id}/resend`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to resend');
      }
      const data = await res.json();
      // Update local state with new expiry
      setSentLinks(prev => prev.map(l =>
        l.id === link.id
          ? { ...l, expiresAt: new Date(data.expiresAt), status: 'pending' as const }
          : l
      ));
      toast.success(`Secure form link resent to ${link.clientName}`, {
        description: `Email sent to ${link.clientContact}`
      });
    } catch (err: any) {
      toast.error('Failed to resend: ' + (err.message || 'Unknown error'));
    }
  };

  const viewFormData = async (linkId: string) => {
    setIsLoadingFormData(true);
    setViewDataDialogOpen(true);
    try {
      const response = await fetch(`/api/secure-forms/${linkId}/data`);
      if (!response.ok) {
        throw new Error("Failed to load form data");
      }
      const data = await response.json();
      setViewingFormData(data);
    } catch (error) {
      console.error("Error loading form data:", error);
      toast.error("Failed to load form data");
      setViewDataDialogOpen(false);
    } finally {
      setIsLoadingFormData(false);
    }
  };

  const formatFieldLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  const getStatusBadge = (status: SentLink["status"]) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border-0",
      opened: "bg-violet-100 text-violet-700 border-0",
      completed: "bg-emerald-100 text-emerald-700 border-0",
      expired: "bg-gray-100 text-gray-600 border-0",
    };
    const labels = { pending: "Pending", opened: "Opened", completed: "Completed", expired: "Expired" };
    return <Badge className={styles[status]} style={{ borderRadius: RADIUS.pill }}>{labels[status]}</Badge>;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Get carrier name for preview
  const getCarrierName = () => {
    return INSURANCE_CARRIERS.find(c => c.id === formCarrier)?.name || "Insurance Carrier";
  };

  // Get form title based on type
  const getFormTitle = () => {
    switch (selectedFormType?.id) {
      case "ssn":
        return "Social Security Number";
      case "banking":
        return "Banking Information";
      case "drivers_license":
        return "Driver's License / State ID";
      case "full_application":
        return "Full Application";
      default:
        return "Secure Form";
    }
  };

  // Get form description for email
  const getFormDescription = () => {
    switch (selectedFormType?.id) {
      case "ssn":
        return "Your insurance agent has requested your Social Security Number to process your application";
      case "banking":
        return "Your insurance agent has requested your banking information to set up premium payments";
      case "drivers_license":
        return "Your insurance agent has requested your driver's license or state ID details for identity verification";
      case "full_application":
        return "Your insurance agent has requested you complete a full application";
      default:
        return "Your insurance agent has requested some information";
    }
  };

  // Get form-specific message content
  const getFormSpecificMessage = () => {
    const carrierDisplayName = getCarrierName();
    switch (selectedFormType?.id) {
      case "ssn":
        return {
          line1: `To finalize and submit your application with ${carrierDisplayName}, we'll need your Social Security number for identity verification and underwriting purposes.`,
          line2: `For security, please provide this through our secure submission link below (or feel free to call me directly if you prefer).`,
          line3: `Let me know once it's sent so I can confirm receipt and move your application forward immediately.`
        };
      case "banking":
        return {
          line1: `To complete your policy setup with ${carrierDisplayName}, we'll need your banking information for the initial premium draft and ongoing billing authorization.`,
          line2: `You can submit this securely using the link below, or we can complete it together over the phone — whichever you prefer.`,
          line3: `Once received, I'll confirm and finalize your submission right away.`
        };
      case "drivers_license":
        return {
          line1: `To verify your identity for your ${carrierDisplayName} application, we'll need your driver's license or state-issued ID information.`,
          line2: `Please submit this through the secure link below — your data is encrypted and protected.`,
          line3: `Once received, I'll confirm and continue processing your application.`
        };
      case "full_application":
        return {
          line1: `To move forward with your policy submission to ${carrierDisplayName}, I'll need your completed application on file.`,
          line2: `Please send it over at your earliest convenience so we can keep everything on track for underwriting.`,
          line3: `If you have any questions while completing it, let me know — happy to help.`
        };
      default:
        return {
          line1: `I need your ${getFormTitle().toLowerCase()} to process your application with ${carrierDisplayName}.`,
          line2: `Please submit this through the secure link below.`,
          line3: ``
        };
    }
  };

  // Email Preview Component
  const EmailPreview = ({ isPhone }: { isPhone: boolean }) => {
    if (isPhone) {
      // iOS Mail App Style
      return (
        <div className="bg-[#f2f2f7] min-h-[440px]">
          {/* Mail App Header */}
          <div className="bg-[#f2f2f7] px-4 py-2 flex items-center justify-between border-b border-gray-300">
            <div className="flex items-center gap-2 text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Inbox</span>
            </div>
            <div className="flex items-center gap-4 text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>

          {/* Email Content */}
          <div className="bg-white mx-0">
            {/* From Section */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
                >
                  <span className="text-white font-semibold text-sm">{agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm">{agentName}</p>
                    <span className="text-xs text-gray-400">Now</span>
                  </div>
                  <p className="text-xs text-gray-500">{agentEmail}</p>
                  <p className="text-xs text-gray-400 mt-0.5">to me</p>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-base text-gray-900">
                Secure {getFormTitle()} Request from {agentFirstName}
              </h2>
            </div>

            {/* Body */}
            <div className="px-4 py-4 space-y-3 text-sm">
              <p className="text-gray-800">Hi {formClientName ? <span>{formClientName}</span> : <span className="font-bold">Client</span>},</p>
              {formCustomMessage ? (
                <p className="text-gray-600">{formCustomMessage}</p>
              ) : (
                <>
                  <p className="text-gray-600">{getFormSpecificMessage().line1}</p>
                  <p className="text-gray-600">{getFormSpecificMessage().line2}</p>
                  <p className="text-gray-600">{getFormSpecificMessage().line3}</p>
                </>
              )}
              <div className="py-2">
                <div
                  className="text-white rounded-lg text-center font-medium py-3 text-sm"
                  style={{ backgroundColor: getCarrierColor(formCarrier) }}
                >
                  Submit {getFormTitle()} Securely
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-700 text-xs">
                    This link expires in 24 hours. Your data is protected with bank-level encryption.
                  </p>
                </div>
              </div>
              {/* Agent Signature */}
              <div className="pt-2 border-t border-gray-100 mt-3">
                <p className="text-gray-700 font-medium">{agentName}</p>
                <p className="text-gray-500 text-xs">Licensed Insurance Agent</p>
                <p className="text-gray-500 text-xs">{agentPhone}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Desktop Gmail Style
    return (
      <div className="bg-white min-h-[350px]">
        {/* Gmail Toolbar */}
        <div className="flex items-center gap-2 px-2 py-2 border-b border-gray-200">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-500">1 of 24</span>
        </div>

        {/* Subject Line */}
        <div className="px-4 py-3 border-b border-gray-100">
          <h1 className="text-xl text-gray-900">
            Secure {getFormTitle()} Request from {agentFirstName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Inbox</span>
          </div>
        </div>

        {/* Sender Info */}
        <div className="px-4 py-3 flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
          >
            <span className="text-white font-semibold">{agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">{agentName}</span>
              <span className="text-xs text-gray-400">&lt;{agentEmail}&gt;</span>
            </div>
            <p className="text-xs text-gray-500">to me</p>
          </div>
          <div className="text-xs text-gray-400">2:30 PM (0 minutes ago)</div>
        </div>

        {/* Email Body */}
        <div className="px-4 py-4 pl-16 space-y-3 text-sm">
          <p className="text-gray-800">Hi {formClientName ? <span>{formClientName}</span> : <span className="font-bold">Client</span>},</p>
          {formCustomMessage ? (
            <p className="text-gray-600">{formCustomMessage}</p>
          ) : (
            <>
              <p className="text-gray-600">{getFormSpecificMessage().line1}</p>
              <p className="text-gray-600">{getFormSpecificMessage().line2}</p>
              <p className="text-gray-600">{getFormSpecificMessage().line3}</p>
            </>
          )}
          <div className="py-2">
            <div
              className="text-white rounded text-center font-medium py-3 px-6 inline-block cursor-pointer hover:opacity-90"
              style={{ backgroundColor: getCarrierColor(formCarrier) }}
            >
              Submit {getFormTitle()} Securely
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-md">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-amber-700 text-xs">
                This link expires in 24 hours. Your data is protected with bank-level encryption.
              </p>
            </div>
          </div>
          {/* Agent Signature */}
          <div className="pt-3 border-t border-gray-100 mt-4">
            <p className="text-gray-800 font-medium">{agentName}</p>
            <p className="text-gray-500">Licensed Insurance Agent</p>
            <p className="text-gray-500">{agentPhone}</p>
            <p className="text-gray-500">{agentEmail}</p>
          </div>
        </div>
      </div>
    );
  };

  // SMS Preview Component
  const SMSPreview = ({ isPhone }: { isPhone: boolean }) => {
    if (isPhone) {
      // iMessage App Style
      return (
        <div className="bg-[#f2f2f7] min-h-[440px]">
          {/* iMessage Header */}
          <div className="bg-[#f2f2f7] px-3 py-2 flex items-center gap-2 border-b border-gray-300">
            <div className="flex items-center gap-1 text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-xs">(12)</span>
            </div>
            <div className="flex-1 text-center">
              <div
                className="w-8 h-8 rounded-full mx-auto flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
              >
                <span className="text-white text-xs font-semibold">{agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
              <p className="text-xs font-medium text-black mt-0.5">{agentFirstName}</p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#007aff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Message Thread */}
          <div className="p-3 space-y-2 bg-white min-h-[340px]">
            {/* Date Stamp */}
            <div className="text-center">
              <span className="text-[10px] text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-full">Today 2:30 PM</span>
            </div>

            {/* Sender Phone Number */}
            <div className="text-center">
              <span className="text-[10px] text-gray-400">From: {agentPhone}</span>
            </div>

            {/* First Message Bubble */}
            <div className="flex justify-start">
              <div className="bg-[#e5e5ea] rounded-2xl rounded-bl-md px-3 py-2 max-w-[85%]">
                <p className="text-black text-xs leading-relaxed">
                  Hi {formClientName ? <span>{formClientName}</span> : <span className="font-semibold">there</span>}, it's {agentFirstName}. To finalize your {getCarrierName()} application, I need your {getFormTitle().toLowerCase()}. Please use the secure link below.
                  {formCustomMessage && (
                    <span className="block mt-1">"{formCustomMessage.slice(0, 40)}{formCustomMessage.length > 40 ? '...' : ''}"</span>
                  )}
                </p>
              </div>
            </div>

            {/* Second Message Bubble with Link */}
            <div className="flex justify-start">
              <div className="bg-[#e5e5ea] rounded-2xl rounded-bl-md px-3 py-2 max-w-[85%]">
                <p className="text-black text-xs">Click the secure link below (expires in 24hrs):</p>
                {/* Link Preview Card */}
                <div className="mt-2 bg-white rounded-xl overflow-hidden border border-gray-200">
                  <div
                    className="h-16 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
                  >
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] text-gray-400">secure.heritagels.org</p>
                    <p className="text-xs font-medium text-black truncate">Submit {getFormTitle()} Securely</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivered Status */}
            <div className="flex justify-start pl-3">
              <span className="text-[10px] text-gray-400 italic">Delivered</span>
            </div>
          </div>

          {/* Message Input Bar */}
          <div className="bg-[#f2f2f7] px-3 py-2 border-t border-gray-300">
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 bg-[#007aff] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="flex-1 bg-white rounded-full border border-gray-300 px-3 py-1.5">
                <span className="text-xs text-gray-400">iMessage</span>
              </div>
              <button className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V21h-2v-4.07z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Desktop Messages / Google Messages Style
    return (
      <div className="bg-white min-h-[350px] flex">
        {/* Sidebar Preview */}
        <div className="w-20 bg-gray-50 border-r border-gray-200 p-2 hidden sm:block">
          <div className="space-y-2">
            {/* Active Conversation */}
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <div
                className="w-8 h-8 rounded-full mx-auto flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
              >
                <span className="text-white text-xs font-semibold">{agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
              <p className="text-[9px] text-center text-gray-600 mt-1 truncate">{agentFirstName}</p>
            </div>
            {/* Other chats placeholder */}
            <div className="p-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto" />
            </div>
            <div className="p-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto" />
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
            >
              <span className="text-white font-semibold">{agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{agentName}</p>
              <p className="text-xs text-gray-500">{agentPhone} • Secure Messaging</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 bg-[#fafafa]">
            {/* Date Divider */}
            <div className="text-center">
              <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">Today</span>
            </div>

            {/* First Message */}
            <div className="flex justify-start gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
              >
                <span className="text-white text-xs font-semibold">{agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
              <div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm border border-gray-100 max-w-md">
                  <p className="text-sm text-gray-800">
                    Hi {formClientName ? <span>{formClientName}</span> : <span className="font-semibold">there</span>}! This is {agentFirstName}, your insurance agent. I need your {getFormTitle().toLowerCase()} for your {formCarrier ? <span>{getCarrierName()}</span> : <span className="font-semibold">{getCarrierName()}</span>} application.
                    {formCustomMessage && (
                      <span className="block mt-1 italic">"{formCustomMessage.slice(0, 50)}{formCustomMessage.length > 50 ? '...' : ''}"</span>
                    )}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 ml-2">2:30 PM</span>
              </div>
            </div>

            {/* Second Message with Link */}
            <div className="flex justify-start gap-2">
              <div className="w-8 h-8 flex-shrink-0" /> {/* Spacer for alignment */}
              <div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm border border-gray-100 max-w-md">
                  <p className="text-sm text-gray-800 mb-2">Click to submit securely (expires in 24hrs):</p>
                  {/* Link Preview */}
                  <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <div
                      className="h-20 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
                    >
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-400">secure.heritagels.org</p>
                      <p className="text-sm font-medium text-gray-900">Submit {getFormTitle()} Securely</p>
                      <p className="text-xs text-gray-500 mt-1">Your data is protected with bank-level encryption</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 mt-1">
                  <span className="text-[10px] text-gray-400">2:30 PM</span>
                  <CheckCircle className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] text-blue-500">Delivered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
                <span className="text-sm text-gray-400">Type a message...</span>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full text-blue-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // SSN Form Preview Component
  const SSNFormPreview = ({ isPhone }: { isPhone: boolean }) => {
    if (isPhone) {
      return (
        <div className="bg-[#f2f2f7] min-h-[440px]">
          {/* Safari Browser Header */}
          <div className="bg-[#f2f2f7] px-3 py-2 flex items-center gap-2 border-b border-gray-300">
            <div className="text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="bg-white/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-center">
                <Lock className="w-3 h-3 text-gray-500 mx-auto" />
                <span className="text-xs text-gray-600 flex-1">secure.heritagels.org</span>
              </div>
            </div>
            <div className="text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white">
            {/* Form Header */}
            <div
              className="p-4 text-white text-center"
              style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
            >
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-bold text-base">Secure SSN Submission</h3>
              <p className="text-xs mt-1 opacity-90">{getCarrierName()}</p>
            </div>

            {/* Form Body */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-gray-600 mb-1.5 text-xs font-medium">Full Legal Name</label>
                <div className={cn(
                  "border rounded-xl p-3 bg-gray-50 text-sm",
                  formClientName ? "text-gray-900" : "text-gray-400"
                )}>
                  {formClientName || "Enter your full name"}
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5 text-xs font-medium">Date of Birth</label>
                <div className="border rounded-xl p-3 bg-gray-50 text-gray-400 text-sm">MM/DD/YYYY</div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5 text-xs font-medium">Social Security Number</label>
                <div className="border rounded-xl p-3 bg-gray-50 text-gray-400 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  XXX-XX-XXXX
                </div>
              </div>
              <div className="pt-3">
                <div
                  className="text-white rounded-xl text-center font-semibold py-3.5 text-sm"
                  style={{ backgroundColor: getCarrierColor(formCarrier) }}
                >
                  Submit Securely
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400 pt-2">
                <Lock className="w-3 h-3" />
                <span className="text-xs">256-bit encryption</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Desktop View
    return (
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden min-h-[350px]">
        {/* Form Header */}
        <div
          className="p-6 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
        >
          <Shield className="w-10 h-10 mx-auto mb-3" />
          <h3 className="font-bold text-xl">Secure SSN Submission</h3>
          <p className="text-sm mt-1 opacity-90">{getCarrierName()}</p>
        </div>
        {/* Form Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-gray-600 mb-2 font-medium">Full Legal Name</label>
            <div className={cn(
              "border rounded-lg p-3 bg-gray-50",
              formClientName ? "text-gray-900" : "text-gray-400"
            )}>
              {formClientName || "Enter your full name"}
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-2 font-medium">Date of Birth</label>
            <div className="border rounded-lg p-3 bg-gray-50 text-gray-400">MM/DD/YYYY</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-2 font-medium">Social Security Number</label>
            <div className="border rounded-lg p-3 bg-gray-50 text-gray-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              XXX-XX-XXXX
            </div>
          </div>
          <div className="pt-3">
            <div
              className="text-white rounded-lg text-center font-semibold py-4 text-base cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: getCarrierColor(formCarrier) }}
            >
              Submit Securely
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Lock className="w-4 h-4" />
            <span className="text-sm">256-bit encryption</span>
          </div>
        </div>
      </div>
    );
  };

  // Driver's License Form Preview Component
  const DriverLicenseFormPreview = ({ isPhone }: { isPhone: boolean }) => {
    if (isPhone) {
      return (
        <div className="bg-[#f2f2f7] min-h-[440px]">
          <div className="bg-[#f2f2f7] px-3 py-2 flex items-center gap-2 border-b border-gray-300">
            <div className="text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="bg-white/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-center">
                <Lock className="w-3 h-3 text-gray-500 mx-auto" />
                <span className="text-xs text-gray-600 flex-1">secure.heritagels.org</span>
              </div>
            </div>
            <div className="text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </div>
          <div className="bg-white">
            <div
              className="p-4 text-white text-center"
              style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
            >
              <IdCard className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-bold text-base">Secure ID Submission</h3>
              <p className="text-xs mt-1 opacity-90">{getCarrierName()}</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-gray-600 mb-1.5 text-xs font-medium">Full Legal Name</label>
                <div className={cn("border rounded-xl p-3 bg-gray-50 text-sm", formClientName ? "text-gray-900" : "text-gray-400")}>
                  {formClientName || "Enter your full name"}
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5 text-xs font-medium">Date of Birth</label>
                <div className="border rounded-xl p-3 bg-gray-50 text-gray-400 text-sm">MM/DD/YYYY</div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5 text-xs font-medium">Driver's License / State ID Number</label>
                <div className="border rounded-xl p-3 bg-gray-50 text-gray-400 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Enter license number
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1.5 text-xs font-medium">Issuing State</label>
                  <div className="border rounded-xl p-3 bg-gray-50 text-gray-400 text-sm">Select state</div>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5 text-xs font-medium">Expiration Date</label>
                  <div className="border rounded-xl p-3 bg-gray-50 text-gray-400 text-sm">MM/DD/YYYY</div>
                </div>
              </div>
              <div className="pt-3">
                <div className="text-white rounded-xl text-center font-semibold py-3.5 text-sm" style={{ backgroundColor: getCarrierColor(formCarrier) }}>
                  Submit Securely
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400 pt-2">
                <Lock className="w-3 h-3" />
                <span className="text-xs">256-bit encryption</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden min-h-[350px]">
        <div
          className="p-6 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
        >
          <IdCard className="w-10 h-10 mx-auto mb-3" />
          <h3 className="font-bold text-xl">Secure ID Submission</h3>
          <p className="text-sm mt-1 opacity-90">{getCarrierName()}</p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-gray-600 mb-2 font-medium">Full Legal Name</label>
            <div className={cn("border rounded-lg p-3 bg-gray-50", formClientName ? "text-gray-900" : "text-gray-400")}>
              {formClientName || "Enter your full name"}
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-2 font-medium">Date of Birth</label>
            <div className="border rounded-lg p-3 bg-gray-50 text-gray-400">MM/DD/YYYY</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-2 font-medium">Driver's License / State ID Number</label>
            <div className="border rounded-lg p-3 bg-gray-50 text-gray-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Enter license number
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-2 font-medium">Issuing State</label>
              <div className="border rounded-lg p-3 bg-gray-50 text-gray-400">Select state</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-2 font-medium">Expiration Date</label>
              <div className="border rounded-lg p-3 bg-gray-50 text-gray-400">MM/DD/YYYY</div>
            </div>
          </div>
          <div className="pt-3">
            <div className="text-white rounded-lg text-center font-semibold py-4 text-base cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: getCarrierColor(formCarrier) }}>
              Submit Securely
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Lock className="w-4 h-4" />
            <span className="text-sm">256-bit encryption</span>
          </div>
        </div>
      </div>
    );
  };

  // Banking Form Preview Component
  const BankingFormPreview = ({ isPhone }: { isPhone: boolean }) => {
    if (isPhone) {
      return (
        <div className="bg-[#f2f2f7] min-h-[440px]">
          {/* Safari Browser Header */}
          <div className="bg-[#f2f2f7] px-3 py-2 flex items-center gap-2 border-b border-gray-300">
            <div className="text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="bg-white/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-center">
                <Lock className="w-3 h-3 text-gray-500 mx-auto" />
                <span className="text-xs text-gray-600 flex-1">secure.heritagels.org</span>
              </div>
            </div>
            <div className="text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white">
            {/* Form Header */}
            <div
              className="p-4 text-white text-center"
              style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
            >
              <Building className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-bold text-base">Secure Banking Information</h3>
              <p className="text-xs mt-1 opacity-90">{getCarrierName()}</p>
            </div>

            {/* Form Body */}
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-gray-600 mb-1.5 text-xs font-medium">Account Holder Name</label>
                <div className={cn(
                  "border rounded-xl p-3 bg-gray-50 text-sm",
                  formClientName ? "text-gray-900" : "text-gray-400"
                )}>
                  {formClientName || "Enter account holder name"}
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5 text-xs font-medium">Bank Name</label>
                <div className="border rounded-xl p-3 bg-gray-50 text-gray-400 text-sm">Enter bank name</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1.5 text-xs font-medium">Routing Number</label>
                  <div className="border rounded-xl p-2.5 bg-gray-50 text-gray-400 text-xs flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    XXXXXXXXX
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5 text-xs font-medium">Account Number</label>
                  <div className="border rounded-xl p-2.5 bg-gray-50 text-gray-400 text-xs flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    XXXXXXXXXX
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5 text-xs font-medium">Account Type</label>
                <div className="border rounded-xl p-3 bg-gray-50 text-gray-400 text-sm">Checking / Savings</div>
              </div>
              <div className="pt-2">
                <div
                  className="text-white rounded-xl text-center font-semibold py-3.5 text-sm"
                  style={{ backgroundColor: getCarrierColor(formCarrier) }}
                >
                  Submit Securely
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400 pt-1">
                <Lock className="w-3 h-3" />
                <span className="text-xs">Bank-level encryption</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Desktop View
    return (
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden min-h-[350px]">
        {/* Form Header */}
        <div
          className="p-6 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
        >
          <Building className="w-10 h-10 mx-auto mb-3" />
          <h3 className="font-bold text-xl">Secure Banking Information</h3>
          <p className="text-sm mt-1 opacity-90">{getCarrierName()}</p>
        </div>
        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-gray-600 mb-2 font-medium">Account Holder Name</label>
            <div className={cn(
              "border rounded-lg p-3 bg-gray-50",
              formClientName ? "text-gray-900" : "text-gray-400"
            )}>
              {formClientName || "Enter account holder name"}
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-2 font-medium">Bank Name</label>
            <div className="border rounded-lg p-3 bg-gray-50 text-gray-400">Enter bank name</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-2 font-medium">Routing Number</label>
              <div className="border rounded-lg p-3 bg-gray-50 text-gray-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                XXXXXXXXX
              </div>
            </div>
            <div>
              <label className="block text-gray-600 mb-2 font-medium">Account Number</label>
              <div className="border rounded-lg p-3 bg-gray-50 text-gray-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                XXXXXXXXXXXX
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-2 font-medium">Account Type</label>
            <div className="border rounded-lg p-3 bg-gray-50 text-gray-400">Checking / Savings</div>
          </div>
          <div className="pt-3">
            <div
              className="text-white rounded-lg text-center font-semibold py-4 text-base cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: getCarrierColor(formCarrier) }}
            >
              Submit Securely
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Bank-level encryption</span>
          </div>
        </div>
      </div>
    );
  };

  // Full Application Form Preview Component
  const FullApplicationFormPreview = ({ isPhone }: { isPhone: boolean }) => {
    const sections = [
      { icon: User, label: "Personal Information", status: "current" },
      { icon: Shield, label: "Social Security Number", status: "pending" },
      { icon: Building, label: "Banking Details", status: "pending" },
      { icon: IdCard, label: "Driver's License / State ID", status: "pending" },
      { icon: DollarSign, label: "Coverage Details", status: "pending" },
      { icon: Users, label: "Beneficiary Information", status: "pending" },
    ];

    if (isPhone) {
      return (
        <div className="bg-[#f2f2f7] min-h-[440px]">
          {/* Safari Browser Header */}
          <div className="bg-[#f2f2f7] px-3 py-2 flex items-center gap-2 border-b border-gray-300">
            <div className="text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="bg-white/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-center">
                <Lock className="w-3 h-3 text-gray-500 mx-auto" />
                <span className="text-xs text-gray-600 flex-1">secure.heritagels.org</span>
              </div>
            </div>
            <div className="text-[#007aff]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white">
            {/* Form Header */}
            <div
              className="p-4 text-white text-center"
              style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
            >
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-bold text-base">Complete Application</h3>
              <p className="text-xs mt-1 opacity-90">{getCarrierName()}</p>
            </div>

            {/* Progress Steps */}
            <div className="p-3 space-y-2">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border"
                  style={{
                    borderColor: section.status === "current" ? `${getCarrierColor(formCarrier)}40` : "#e5e7eb",
                    backgroundColor: section.status === "current" ? `${getCarrierColor(formCarrier)}08` : "transparent"
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: section.status === "current" ? getCarrierColor(formCarrier) : "#f3f4f6",
                      color: section.status === "current" ? "#ffffff" : "#9ca3af"
                    }}
                  >
                    {section.status === "current" ? (
                      <section.icon className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <p
                    className="text-xs font-medium flex-1"
                    style={{ color: section.status === "current" ? getCarrierColor(formCarrier) : "#6b7280" }}
                  >
                    {section.label}
                  </p>
                  {section.status === "current" && (
                    <span className="text-[10px] font-medium" style={{ color: getCarrierColor(formCarrier) }}>Current</span>
                  )}
                </div>
              ))}
            </div>

            {/* Current Section Preview */}
            <div className="px-3 pb-3">
              <div className="border-t pt-3">
                <p className="text-gray-600 mb-2.5 text-xs font-semibold">Personal Information</p>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-gray-500 mb-1 text-[10px] font-medium">Full Legal Name</label>
                    <div className={cn(
                      "border rounded-xl p-2.5 bg-gray-50 text-xs",
                      formClientName ? "text-gray-900" : "text-gray-400"
                    )}>
                      {formClientName || "Enter your full name"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-500 mb-1 text-[10px] font-medium">Date of Birth</label>
                      <div className="border rounded-xl p-2.5 bg-gray-50 text-gray-400 text-xs">MM/DD/YYYY</div>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1 text-[10px] font-medium">Gender</label>
                      <div className="border rounded-xl p-2.5 bg-gray-50 text-gray-400 text-xs">Select</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <div
                  className="text-white rounded-xl text-center font-semibold py-3 text-sm"
                  style={{ backgroundColor: getCarrierColor(formCarrier) }}
                >
                  Continue to Next Section
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400 pt-2">
                <Lock className="w-3 h-3" />
                <span className="text-[10px]">Your progress is auto-saved</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Desktop View
    return (
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden min-h-[350px]">
        {/* Form Header */}
        <div
          className="p-6 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${getCarrierGradient(formCarrier).from} 0%, ${getCarrierGradient(formCarrier).to} 100%)` }}
        >
          <FileText className="w-10 h-10 mx-auto mb-3" />
          <h3 className="font-bold text-xl">Complete Application</h3>
          <p className="text-sm mt-1 opacity-90">{getCarrierName()}</p>
        </div>
        {/* Form Body - Sections Preview */}
        <div className="p-5 space-y-3">
          {/* Section indicators */}
          {sections.map((section, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border"
              style={{
                borderColor: section.status === "current" ? `${getCarrierColor(formCarrier)}40` : "#e5e7eb",
                backgroundColor: section.status === "current" ? `${getCarrierColor(formCarrier)}08` : "transparent"
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: section.status === "current" ? getCarrierColor(formCarrier) : "#f3f4f6",
                  color: section.status === "current" ? "#ffffff" : "#9ca3af"
                }}
              >
                {section.status === "current" ? (
                  <section.icon className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p
                  className="font-medium"
                  style={{ color: section.status === "current" ? getCarrierColor(formCarrier) : "#6b7280" }}
                >
                  {section.label}
                </p>
              </div>
              {section.status === "current" && (
                <div
                  className="text-xs font-medium"
                  style={{ color: getCarrierColor(formCarrier) }}
                >
                  In Progress
                </div>
              )}
            </div>
          ))}

          {/* Current Section Preview */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-gray-600 mb-3 font-semibold">Personal Information</p>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-500 mb-1.5 text-sm font-medium">Full Legal Name</label>
                <div className={cn(
                  "border rounded-lg p-3 bg-gray-50",
                  formClientName ? "text-gray-900" : "text-gray-400 font-semibold"
                )}>
                  {formClientName || "Enter your full name"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1.5 text-sm font-medium">Date of Birth</label>
                  <div className="border rounded-lg p-3 bg-gray-50 text-gray-400">MM/DD/YYYY</div>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1.5 text-sm font-medium">Gender</label>
                  <div className="border rounded-lg p-3 bg-gray-50 text-gray-400">Select</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <div
              className="text-white rounded-lg text-center font-semibold py-4 text-base cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: getCarrierColor(formCarrier) }}
            >
              Continue to Next Section
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Your progress is auto-saved</span>
          </div>
        </div>
      </div>
    );
  };

  // Get the appropriate form preview based on type
  const getFormPreview = (isPhone: boolean) => {
    switch (selectedFormType?.id) {
      case "ssn":
        return <SSNFormPreview isPhone={isPhone} />;
      case "banking":
        return <BankingFormPreview isPhone={isPhone} />;
      case "drivers_license":
        return <DriverLicenseFormPreview isPhone={isPhone} />;
      case "full_application":
        return <FullApplicationFormPreview isPhone={isPhone} />;
      default:
        return <SSNFormPreview isPhone={isPhone} />;
    }
  };

  // Get form-specific styling
  const getFormColor = () => {
    switch (selectedFormType?.id) {
      case "ssn":
        return "primary";
      case "banking":
        return "emerald";
      case "drivers_license":
        return "violet";
      case "full_application":
        return "violet";
      default:
        return "primary";
    }
  };

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Hero Card */}
        <motion.div data-tour-id={TOUR.AGENT.DATA_ENCRYPTION.HEADER} variants={fadeInUp}>
          <AgentPageHero
            icon={Shield}
            title="Secure Data Collection"
            subtitle="Send encrypted forms to collect sensitive client information"
          >
            {/* Agent Account Indicator */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                {agentName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="text-left">
                <div className="text-xs text-white/60 font-medium">Sending as</div>
                <div className="text-sm font-semibold text-white leading-tight">{agentName}</div>
                <div className="text-xs text-white/70 mt-0.5">{agentEmail} • {agentPhone}</div>
              </div>
            </div>
          </AgentPageHero>
        </motion.div>


        {/* Send Secure Form Cards */}
        <motion.div data-tour-id={TOUR.AGENT.DATA_ENCRYPTION.SECURE_FIELDS} variants={fadeInUp}>
          <h2 className="text-lg font-semibold mb-4">Send Secure Form</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {SECURE_FORM_TYPES.map((formType) => (
              <motion.div
                key={formType.id}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
              >
                <Card
                  className="cursor-pointer group relative overflow-hidden border-0 h-full"
                  style={{
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                  onClick={() => openSendDialog(formType)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
                  <div style={{ width: 80, height: 80 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/3 translate-x-1/3" />
                  <div style={{ width: 50, height: 50 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/3 -translate-x-1/4" />
                  <CardContent className="relative z-10 p-5 flex flex-col h-full">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ borderRadius: RADIUS.button }}>
                      <formType.icon className="w-5 h-5 text-amber-200" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{formType.name}</h3>
                    <p className="text-sm text-white/70 mb-4">{formType.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {formType.fields.slice(0, 3).map((field, i) => (
                        <Badge key={i} className="text-[10px] bg-white/15 text-white/90 border-0 backdrop-blur-sm" style={{ borderRadius: RADIUS.pill }}>
                          {field}
                        </Badge>
                      ))}
                      {formType.fields.length > 3 && (
                        <Badge className="text-[10px] bg-white/15 text-white/70 border-0 backdrop-blur-sm" style={{ borderRadius: RADIUS.pill }}>
                          +{formType.fields.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <Button
                      className="w-full gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm mt-auto"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Send className="w-4 h-4" />
                      Send to Client
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Sent Links */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-lg font-semibold mb-4">Recent Secure Links</h2>
          <Card
            className="border-0"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <CardContent className="p-0">
              {isLoadingLinks ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
              ) : sentLinks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No secure links sent yet</p>
                  <p className="text-sm">Send your first secure form to get started</p>
                </div>
              ) : (
              <div className="divide-y divide-gray-100">
                {paginatedLinks.map((link) => (
                  <div key={link.id} className="px-5 py-4 hover:bg-violet-50/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          {link.method === "email" ? (
                            <Mail className="w-5 h-5 text-amber-200" />
                          ) : link.method === "both" ? (
                            <div className="flex items-center gap-0.5">
                              <Mail className="w-3.5 h-3.5 text-amber-200" />
                              <MessageSquare className="w-3.5 h-3.5 text-amber-200" />
                            </div>
                          ) : (
                            <MessageSquare className="w-5 h-5 text-amber-200" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{link.clientName}</span>
                            {getStatusBadge(link.status)}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{link.type}</span>
                            {link.carrier && (
                              <>
                                <span>•</span>
                                <span>{link.carrier}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{link.clientContact}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <Clock className="w-3 h-3" />
                            Sent {formatTimeAgo(link.sentAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {link.status !== "expired" && link.status !== "completed" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyLink(link.id)}
                              className="text-violet-700"
                              style={{ borderRadius: RADIUS.button }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resendLink(link)}
                              className="text-violet-700 border-violet-200 hover:bg-violet-50"
                              style={{ borderRadius: RADIUS.button }}
                            >
                              Resend
                            </Button>
                          </>
                        )}
                        {link.status === "expired" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const formType = SECURE_FORM_TYPES.find(f => f.name === link.type);
                              if (formType) {
                                openSendDialog(formType);
                              }
                            }}
                            className="text-violet-700 border-violet-200 hover:bg-violet-50"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            Send New Link
                          </Button>
                        )}
                        {link.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-violet-700"
                            onClick={() => viewFormData(link.id)}
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Data
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
              {totalLinks > 0 && (
                <div className="px-5 py-3 border-t border-gray-100">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalLinks}
                    itemsPerPage={itemsPerPage}
                    onPageChange={goToPage}
                    onItemsPerPageChange={changeItemsPerPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Features */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-lg font-semibold mb-4">Security Features</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: Lock, title: "AES-256 Encryption", description: "Military-grade encryption" },
              { icon: Clock, title: "24-Hour Expiry", description: "Links auto-expire for safety" },
              { icon: Key, title: "One-Time Use", description: "Each link works once" },
              { icon: FileCheck, title: "HIPAA Compliant", description: "Meets all regulations" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
              >
                <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardContent className="p-4 text-center">
                    <div
                      className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/25"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <feature.icon className="w-5 h-5 text-amber-200" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-500">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Two-Column Dialog for All Form Types */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent
          className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 border-0 [&>button.absolute]:hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: RADIUS.card,
            boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)',
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                {selectedFormType?.id === "ssn" && <User className="w-5 h-5 text-amber-200" />}
                {selectedFormType?.id === "banking" && <Building className="w-5 h-5 text-amber-200" />}
                {selectedFormType?.id === "drivers_license" && <IdCard className="w-5 h-5 text-amber-200" />}
                {selectedFormType?.id === "full_application" && <FileText className="w-5 h-5 text-amber-200" />}
              </div>
              <div>
                <span className="text-gray-900">Send Secure {getFormTitle()} Form</span>
                <p className="text-sm font-normal text-gray-500 mt-0.5">
                  Your client will receive a secure, encrypted link to submit their information.
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Side - Form */}
            <div className="space-y-4">
              {/* Client Name */}
              <div>
                <Label htmlFor="formClientName" className="flex items-center gap-1">
                  Client Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="formClientName"
                  placeholder="John Smith"
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  className="mt-1"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* Email Address */}
              <div>
                <Label htmlFor="formEmail">Email Address</Label>
                <Input
                  id="formEmail"
                  type="email"
                  placeholder="john.smith@email.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="mt-1"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="formPhone">Phone Number</Label>
                <Input
                  id="formPhone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="mt-1"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* Insurance Carrier */}
              <div>
                <Label className="flex items-center gap-1">
                  Insurance Carrier <span className="text-red-500">*</span>
                </Label>
                <Select value={formCarrier} onValueChange={setFormCarrier}>
                  <SelectTrigger className="mt-1" style={{ borderRadius: RADIUS.input }}>
                    <SelectValue placeholder="Select a carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSURANCE_CARRIERS.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id}>
                        {carrier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Send Via */}
              <div>
                <Label className="flex items-center gap-1 mb-2">
                  Send Via <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-1 p-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
                  {([
                    { id: "email" as const, label: "Email", icon: Mail },
                    { id: "sms" as const, label: "SMS", icon: MessageSquare },
                    { id: "both" as const, label: "Both", icon: null },
                  ]).map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormSendMethod(method.id)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-all",
                        formSendMethod === method.id
                          ? "bg-white text-violet-700 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                      style={{ borderRadius: RADIUS.button }}
                    >
                      {method.id === "both" ? (
                        <div className="flex items-center gap-0.5">
                          <Mail className="w-3.5 h-3.5" />
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                      ) : method.icon ? (
                        <method.icon className="w-4 h-4" />
                      ) : null}
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <Label htmlFor="formCustomMessage">Custom Message (optional)</Label>
                <Textarea
                  id="formCustomMessage"
                  placeholder={
                    selectedFormType?.id === "ssn"
                      ? "Hi John, I need your SSN to complete your life insurance application..."
                      : selectedFormType?.id === "banking"
                      ? "Hi John, please provide your banking information to set up automatic premium payments..."
                      : selectedFormType?.id === "drivers_license"
                      ? "Hi John, I need your driver's license details for identity verification..."
                      : "Hi John, please complete this application for your life insurance policy..."
                  }
                  value={formCustomMessage}
                  onChange={(e) => setFormCustomMessage(e.target.value)}
                  rows={3}
                  className="mt-1"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* Sending From Info */}
              <div className="bg-violet-50 p-3" style={{ borderRadius: RADIUS.button }}>
                <p className="text-xs font-medium text-gray-900 mb-2">Sending From Your Account</p>
                <div className="space-y-1">
                  {(formSendMethod === "email" || formSendMethod === "both") && (
                    <div className="flex items-center gap-2 text-xs text-violet-700">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{agentEmail}</span>
                    </div>
                  )}
                  {(formSendMethod === "sms" || formSendMethod === "both") && (
                    <div className="flex items-center gap-2 text-xs text-violet-700">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{agentPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setSendDialogOpen(false)}
                  className="flex-1 text-violet-700 border-violet-200 hover:bg-violet-50"
                  disabled={isSending}
                  style={{ borderRadius: RADIUS.button }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendForm}
                  disabled={isSending}
                  className="flex-1 gap-2 bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  style={{ borderRadius: RADIUS.button }}
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Side - Preview */}
            <div className="space-y-4">
              {/* Device Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="flex gap-1 p-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
                  <button
                    onClick={() => setDevicePreview("phone")}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium transition-all flex items-center gap-1.5",
                      devicePreview === "phone"
                        ? "bg-white shadow-sm text-violet-700"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Smartphone className="w-4 h-4" />
                    Phone
                  </button>
                  <button
                    onClick={() => setDevicePreview("desktop")}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium transition-all flex items-center gap-1.5",
                      devicePreview === "desktop"
                        ? "bg-white shadow-sm text-violet-700"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </button>
                </div>
              </div>

              {/* Preview Tabs */}
              <div className="flex border-b">
                {[
                  { id: "email" as PreviewTab, label: "Email Preview", icon: Mail },
                  { id: "sms" as PreviewTab, label: "SMS Preview", icon: MessageSquare },
                  { id: "form" as PreviewTab, label: "Form Preview", icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      previewTab !== tab.id && "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                    style={previewTab === tab.id ? {
                      borderColor: getCarrierColor(formCarrier),
                      color: getCarrierColor(formCarrier)
                    } : {}}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Preview Content */}
              <div className={cn(
                "bg-gray-100 rounded-xl p-4 flex items-start justify-center",
                devicePreview === "phone" ? "py-6 min-h-[580px]" : "py-4 min-h-[400px]"
              )}>
                {devicePreview === "phone" ? (
                  // iPhone 17 Style Frame
                  <div className="relative">
                    {/* Titanium Frame */}
                    <div className="w-[290px] bg-gradient-to-b from-[#8a8a8f] via-[#6e6e73] to-[#48484a] rounded-[3rem] p-[3px] shadow-2xl">
                      {/* Inner black bezel */}
                      <div className="bg-black rounded-[2.8rem] p-[2px]">
                        {/* Screen */}
                        <div className="bg-white rounded-[2.7rem] overflow-hidden relative">
                          {/* Status Bar with Dynamic Island */}
                          <div className="bg-white px-6 pt-3 pb-1 flex items-center justify-between relative">
                            {/* Time */}
                            <span className="text-sm font-semibold text-black w-12">9:41</span>

                            {/* Dynamic Island */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-2">
                              <div className="bg-black rounded-full w-[90px] h-[28px] flex items-center justify-center gap-2">
                                {/* Camera */}
                                <div className="w-[10px] h-[10px] rounded-full bg-[#1a1a1a] ring-1 ring-[#2a2a2a] flex items-center justify-center">
                                  <div className="w-[4px] h-[4px] rounded-full bg-[#0a3d62]" />
                                </div>
                              </div>
                            </div>

                            {/* Status Icons */}
                            <div className="flex items-center gap-1 w-12 justify-end">
                              {/* Signal */}
                              <svg className="w-4 h-4" viewBox="0 0 18 12" fill="black">
                                <rect x="0" y="8" width="3" height="4" rx="0.5"/>
                                <rect x="4" y="5" width="3" height="7" rx="0.5"/>
                                <rect x="8" y="2" width="3" height="10" rx="0.5"/>
                                <rect x="12" y="0" width="3" height="12" rx="0.5"/>
                              </svg>
                              {/* WiFi */}
                              <svg className="w-4 h-4" viewBox="0 0 16 12" fill="black">
                                <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3.5 7.5c2.5-2.5 6.5-2.5 9 0l-1 1c-2-2-5-2-7 0l-1-1zM1 5c3.9-3.9 10.1-3.9 14 0l-1 1c-3.3-3.3-8.7-3.3-12 0l-1-1z"/>
                              </svg>
                              {/* Battery */}
                              <div className="flex items-center">
                                <div className="w-6 h-3 border border-black rounded-sm flex items-center p-[1px]">
                                  <div className="bg-black h-full w-[85%] rounded-[1px]" />
                                </div>
                                <div className="w-[2px] h-[4px] bg-black rounded-r-sm ml-[1px]" />
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="px-2 pb-2 max-h-[480px] overflow-y-auto">
                            {previewTab === "email" && <EmailPreview isPhone={true} />}
                            {previewTab === "sms" && <SMSPreview isPhone={true} />}
                            {previewTab === "form" && getFormPreview(true)}
                          </div>

                          {/* Home Indicator */}
                          <div className="h-8 flex items-center justify-center bg-white">
                            <div className="w-32 h-1 bg-black rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Side Button (Power) */}
                    <div className="absolute right-[-2px] top-24 w-[3px] h-12 bg-gradient-to-b from-[#8a8a8f] to-[#6e6e73] rounded-r-sm" />

                    {/* Volume Buttons */}
                    <div className="absolute left-[-2px] top-20 w-[3px] h-7 bg-gradient-to-b from-[#8a8a8f] to-[#6e6e73] rounded-l-sm" />
                    <div className="absolute left-[-2px] top-32 w-[3px] h-12 bg-gradient-to-b from-[#8a8a8f] to-[#6e6e73] rounded-l-sm" />
                  </div>
                ) : (
                  // Modern macOS Browser Frame
                  <div className="w-full max-w-lg">
                    {/* Window Chrome */}
                    <div className="bg-gradient-to-b from-[#e8e8e8] to-[#d8d8d8] rounded-t-xl border border-gray-300 border-b-0 shadow-sm">
                      {/* Title Bar */}
                      <div className="flex items-center px-3 py-2.5">
                        {/* Traffic Lights */}
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-sm" />
                          <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#dea123] shadow-sm" />
                          <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] shadow-sm" />
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center gap-1 ml-4">
                          <button className="w-7 h-7 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button className="w-7 h-7 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>

                        {/* URL Bar */}
                        <div className="flex-1 mx-3">
                          <div className="bg-white rounded-lg border border-gray-300 px-3 py-1.5 flex items-center gap-2 shadow-inner">
                            {/* Lock Icon */}
                            <Lock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600 flex-1 truncate">
                              {previewTab === "email"
                                ? "mail.google.com/inbox"
                                : previewTab === "sms"
                                ? "messages.google.com"
                                : "secure.heritagels.org/form"
                              }
                            </span>
                            {/* Refresh Icon */}
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                        </div>

                        {/* Share Button */}
                        <button className="w-7 h-7 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Browser Content */}
                    <div className="bg-white rounded-b-xl border border-gray-300 border-t-0 shadow-xl max-h-[420px] overflow-y-auto">
                      <div className="p-4">
                        {previewTab === "email" && <EmailPreview isPhone={false} />}
                        {previewTab === "sms" && <SMSPreview isPhone={false} />}
                        {previewTab === "form" && getFormPreview(false)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Submitted Data Dialog */}
      <Dialog open={viewDataDialogOpen} onOpenChange={setViewDataDialogOpen}>
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-y-auto p-0 border-0"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: RADIUS.card,
            boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)',
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <FileCheck className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <span className="text-gray-900">Submitted Form Data</span>
                {viewingFormData && (
                  <p className="text-sm font-normal text-gray-500 mt-0.5">
                    {viewingFormData.clientName} • {viewingFormData.carrierName} • {viewingFormData.formType}
                  </p>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {isLoadingFormData ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : viewingFormData?.submittedData ? (
            <div className="space-y-6 p-6">
              {/* Personal Information */}
              {(viewingFormData.submittedData.fullName || viewingFormData.submittedData.dateOfBirth) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-violet-500" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm bg-violet-50 p-3" style={{ borderRadius: RADIUS.button }}>
                    {viewingFormData.submittedData.fullName && (
                      <div><span className="text-gray-500">Full Name:</span> <span className="font-medium">{viewingFormData.submittedData.fullName}</span></div>
                    )}
                    {viewingFormData.submittedData.dateOfBirth && (
                      <div><span className="text-gray-500">Date of Birth:</span> <span className="font-medium">{viewingFormData.submittedData.dateOfBirth}</span></div>
                    )}
                    {viewingFormData.submittedData.gender && (
                      <div><span className="text-gray-500">Gender:</span> <span className="font-medium">{viewingFormData.submittedData.gender}</span></div>
                    )}
                    {(viewingFormData.submittedData.heightFeet || viewingFormData.submittedData.heightInches) && (
                      <div><span className="text-gray-500">Height:</span> <span className="font-medium">{viewingFormData.submittedData.heightFeet}'{viewingFormData.submittedData.heightInches}"</span></div>
                    )}
                    {viewingFormData.submittedData.weight && (
                      <div><span className="text-gray-500">Weight:</span> <span className="font-medium">{viewingFormData.submittedData.weight} lbs</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(viewingFormData.submittedData.address || viewingFormData.submittedData.phone || viewingFormData.submittedData.email) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-violet-500" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm bg-violet-50 p-3" style={{ borderRadius: RADIUS.button }}>
                    {viewingFormData.submittedData.address && (
                      <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{viewingFormData.submittedData.address}, {viewingFormData.submittedData.city}, {viewingFormData.submittedData.state} {viewingFormData.submittedData.zipCode}</span></div>
                    )}
                    {viewingFormData.submittedData.phone && (
                      <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{viewingFormData.submittedData.phone}</span></div>
                    )}
                    {viewingFormData.submittedData.email && (
                      <div><span className="text-gray-500">Email:</span> <span className="font-medium">{viewingFormData.submittedData.email}</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* SSN */}
              {viewingFormData.submittedData.ssn && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-violet-500" />
                    Social Security Number
                  </h3>
                  <div className="text-sm bg-violet-50 p-3" style={{ borderRadius: RADIUS.button }}>
                    <span className="text-gray-500">SSN:</span> <span className="font-medium font-mono">{viewingFormData.submittedData.ssn}</span>
                  </div>
                </div>
              )}

              {/* Driver's License / State ID */}
              {(viewingFormData.submittedData.licenseNumber || viewingFormData.submittedData.issuingState) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-violet-500" />
                    Driver's License / State ID
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm bg-violet-50 p-3" style={{ borderRadius: RADIUS.button }}>
                    {viewingFormData.submittedData.licenseNumber && (
                      <div><span className="text-gray-500">License Number:</span> <span className="font-medium font-mono">{viewingFormData.submittedData.licenseNumber}</span></div>
                    )}
                    {viewingFormData.submittedData.issuingState && (
                      <div><span className="text-gray-500">Issuing State:</span> <span className="font-medium">{viewingFormData.submittedData.issuingState}</span></div>
                    )}
                    {viewingFormData.submittedData.licenseExpiration && (
                      <div><span className="text-gray-500">Expiration:</span> <span className="font-medium">{viewingFormData.submittedData.licenseExpiration}</span></div>
                    )}
                    {viewingFormData.submittedData.licenseType && (
                      <div><span className="text-gray-500">ID Type:</span> <span className="font-medium">{viewingFormData.submittedData.licenseType === 'state_id' ? 'State ID' : "Driver's License"}</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Banking Information */}
              {(viewingFormData.submittedData.bankName || viewingFormData.submittedData.routingNumber) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-violet-500" />
                    Banking Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm bg-violet-50 p-3" style={{ borderRadius: RADIUS.button }}>
                    {viewingFormData.submittedData.accountHolderName && (
                      <div><span className="text-gray-500">Account Holder:</span> <span className="font-medium">{viewingFormData.submittedData.accountHolderName}</span></div>
                    )}
                    {viewingFormData.submittedData.bankName && (
                      <div><span className="text-gray-500">Bank Name:</span> <span className="font-medium">{viewingFormData.submittedData.bankName}</span></div>
                    )}
                    {viewingFormData.submittedData.routingNumber && (
                      <div><span className="text-gray-500">Routing Number:</span> <span className="font-medium font-mono">{viewingFormData.submittedData.routingNumber}</span></div>
                    )}
                    {viewingFormData.submittedData.accountNumber && (
                      <div><span className="text-gray-500">Account Number:</span> <span className="font-medium font-mono">{viewingFormData.submittedData.accountNumber}</span></div>
                    )}
                    {viewingFormData.submittedData.accountType && (
                      <div><span className="text-gray-500">Account Type:</span> <span className="font-medium capitalize">{viewingFormData.submittedData.accountType}</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Coverage Details */}
              {(viewingFormData.submittedData.coverageType || viewingFormData.submittedData.coverageAmount) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-500" />
                    Coverage Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm bg-violet-50 p-3" style={{ borderRadius: RADIUS.button }}>
                    {viewingFormData.submittedData.coverageType && (
                      <div><span className="text-gray-500">Coverage Type:</span> <span className="font-medium">{viewingFormData.submittedData.coverageType}</span></div>
                    )}
                    {viewingFormData.submittedData.coverageAmount && (
                      <div><span className="text-gray-500">Coverage Amount:</span> <span className="font-medium">${Number(viewingFormData.submittedData.coverageAmount).toLocaleString()}</span></div>
                    )}
                    {viewingFormData.submittedData.monthlyPremium && (
                      <div><span className="text-gray-500">Monthly Premium:</span> <span className="font-medium">${Number(viewingFormData.submittedData.monthlyPremium).toLocaleString()}/mo</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Health Questions */}
              {(viewingFormData.submittedData.tobaccoUse || viewingFormData.submittedData.healthConditions) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-violet-500" />
                    Health Information
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-sm bg-violet-50 p-3" style={{ borderRadius: RADIUS.button }}>
                    {viewingFormData.submittedData.tobaccoUse && (
                      <div><span className="text-gray-500">Tobacco Use:</span> <span className="font-medium capitalize">{viewingFormData.submittedData.tobaccoUse}</span></div>
                    )}
                    {viewingFormData.submittedData.healthConditions && (
                      <div><span className="text-gray-500">Health Conditions:</span> <span className="font-medium">{Array.isArray(viewingFormData.submittedData.healthConditions) ? viewingFormData.submittedData.healthConditions.join(", ") : viewingFormData.submittedData.healthConditions}</span></div>
                    )}
                    {viewingFormData.submittedData.healthConditionsOther && (
                      <div><span className="text-gray-500">Other Conditions:</span> <span className="font-medium">{viewingFormData.submittedData.healthConditionsOther}</span></div>
                    )}
                    {viewingFormData.submittedData.medications && (
                      <div><span className="text-gray-500">Medications:</span> <span className="font-medium">{Array.isArray(viewingFormData.submittedData.medications) ? viewingFormData.submittedData.medications.join(", ") : viewingFormData.submittedData.medications}</span></div>
                    )}
                    {viewingFormData.submittedData.medicationsOther && (
                      <div><span className="text-gray-500">Other Medications:</span> <span className="font-medium">{viewingFormData.submittedData.medicationsOther}</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Beneficiaries */}
              {viewingFormData.submittedData.beneficiaries && viewingFormData.submittedData.beneficiaries.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-500" />
                    Beneficiaries
                  </h3>
                  <div className="space-y-2">
                    {viewingFormData.submittedData.beneficiaries.map((b: any, i: number) => (
                      <div key={i} className="text-sm p-2 bg-violet-50" style={{ borderRadius: RADIUS.button }}>
                        <span className="font-medium">{b.name}</span> • {b.relationship} • DOB: {b.dob} • <span className="text-violet-700 font-medium">{b.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consent */}
              {(viewingFormData.submittedData.consentToProcess || viewingFormData.submittedData.consentToContact) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-500" />
                    Consent & Authorization
                  </h3>
                  <div className="grid grid-cols-1 gap-2 text-sm bg-violet-50 p-3" style={{ borderRadius: RADIUS.button }}>
                    {viewingFormData.submittedData.consentToProcess && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="text-gray-700">Authorized processing of information</span>
                      </div>
                    )}
                    {viewingFormData.submittedData.consentToContact && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="text-gray-700">Consented to contact regarding application</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submission Info */}
              <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
                Submitted on {new Date(viewingFormData.submittedAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 px-6 text-gray-500">
              No data available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AgentLoungeLayout>
  );
}
