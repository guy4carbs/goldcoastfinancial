import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckCircle2,
  CreditCard,
  Building2,
  FileText,
  Eye,
  EyeOff,
  Clock,
  User,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Fingerprint,
  BadgeCheck,
  Building,
  Award,
  Verified,
  Stethoscope,
  Users,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  DollarSign,
  Percent,
  IdCard,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CARRIER_BRANDING, type CarrierBranding } from "@shared/carrierBranding";

type FormType = "ssn" | "banking" | "drivers_license" | "full_application";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
];

const MONTHS = [
  { value: "01", label: "January" }, { value: "02", label: "February" }, { value: "03", label: "March" },
  { value: "04", label: "April" }, { value: "05", label: "May" }, { value: "06", label: "June" },
  { value: "07", label: "July" }, { value: "08", label: "August" }, { value: "09", label: "September" },
  { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" },
];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function DateSelect({
  value,
  onChange,
  error,
  minYear = 1930,
  maxYear,
  size = "default",
}: {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  minYear?: number;
  maxYear?: number;
  size?: "default" | "small";
}) {
  const currentYear = new Date().getFullYear();
  const endYear = maxYear || currentYear + 10;
  const years = Array.from({ length: endYear - minYear + 1 }, (_, i) => endYear - i);

  const parts = value ? value.split("-") : ["", "", ""];
  const [selYear, selMonth, selDay] = parts;

  const numMonth = parseInt(selMonth) || 0;
  const numYear = parseInt(selYear) || currentYear;
  const daysCount = numMonth ? getDaysInMonth(numMonth, numYear) : 31;
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);

  const update = (field: "year" | "month" | "day", val: string) => {
    let y = selYear, m = selMonth, d = selDay;
    if (field === "year") y = val;
    if (field === "month") m = val;
    if (field === "day") d = val;

    // Clamp day if needed
    if (y && m && d) {
      const maxDay = getDaysInMonth(parseInt(m), parseInt(y));
      if (parseInt(d) > maxDay) d = String(maxDay).padStart(2, "0");
    }

    if (y && m && d) {
      onChange(`${y}-${m}-${d}`);
    } else if (y || m || d) {
      onChange(`${y || ""}-${m || ""}-${d || ""}`);
    }
  };

  const h = size === "small" ? "h-10" : "h-12";
  const borderCls = error ? "border-red-300" : "border-gray-200";

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select value={selMonth} onValueChange={(v) => update("month", v)}>
        <SelectTrigger className={cn(h, "border-2 rounded-xl text-sm", borderCls)}>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selDay} onValueChange={(v) => update("day", v)}>
        <SelectTrigger className={cn(h, "border-2 rounded-xl text-sm", borderCls)}>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={String(d).padStart(2, "0")}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selYear} onValueChange={(v) => update("year", v)}>
        <SelectTrigger className={cn(h, "border-2 rounded-xl text-sm", borderCls)}>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  dob: string;
  percentage: number;
}

interface FormData {
  // SSN Form
  ssn?: string;
  confirmSsn?: string;

  // Banking Form
  bankName?: string;
  accountType?: "checking" | "savings";
  routingNumber?: string;
  accountNumber?: string;
  confirmAccountNumber?: string;
  accountHolderName?: string;

  // Driver's License / State ID
  licenseNumber?: string;
  issuingState?: string;
  licenseExpiration?: string;
  licenseType?: "drivers_license" | "state_id";

  // Full Application
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  height?: string;
  heightFeet?: string;
  heightInches?: string;
  weight?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;

  // Coverage Details
  coverageType?: string;
  coverageAmount?: string;
  monthlyPremium?: string;

  // Beneficiaries (kept for backwards compatibility)
  beneficiaryName?: string;
  beneficiaryRelationship?: string;
  beneficiaryDob?: string;

  // Health Questions
  tobaccoUse?: string;
  healthConditions?: string[];
  healthConditionsOther?: string;
  medications?: string[];
  medicationsOther?: string;

  // Carrier-specific additional fields
  [key: string]: string | string[] | boolean | undefined;

  // Consent
  consentToProcess?: boolean;
  consentToContact?: boolean;
}

interface FormMetadata {
  formType: FormType;
  carrierId: string;
  carrierName: string;
  clientName: string;
  agentName: string;
  expiresAt: string;
  status: string;
}

// Fallback carrier logo component - styled initials when logo unavailable
function CarrierInitials({ carrier, size = "lg" }: { carrier: CarrierBranding | null; size?: "sm" | "lg" }) {
  const initials = carrier?.shortName
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "IN";

  const sizeClasses = size === "lg"
    ? "w-20 h-20 text-2xl"
    : "w-10 h-10 text-sm";

  return (
    <div
      className={cn(
        "rounded-2xl flex items-center justify-center font-bold shadow-xl border-4 border-white/20",
        sizeClasses
      )}
      style={{
        background: `linear-gradient(135deg, ${carrier?.gradientFrom || "#1E40AF"} 0%, ${carrier?.gradientTo || "#3B82F6"} 100%)`,
        color: carrier?.textOnPrimary || "#FFFFFF",
      }}
    >
      {initials}
    </div>
  );
}

export default function SecureForm() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSsn, setShowSsn] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showLicense, setShowLicense] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const [formMeta, setFormMeta] = useState<FormMetadata | null>(null);
  const [carrier, setCarrier] = useState<CarrierBranding | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: '1', name: '', relationship: '', dob: '', percentage: 100 }
  ]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    ssn: false,
    banking: false,
    identification: false,
    coverage: false,
    beneficiary: false,
    additional: false,
  });
  const [autoAdvancedSections, setAutoAdvancedSections] = useState<Set<string>>(new Set());
  const [manuallyOpened, setManuallyOpened] = useState<string | null>(null);
  const [showAddBeneficiaryPrompt, setShowAddBeneficiaryPrompt] = useState(false);

  const sectionOrder = ['personal', 'ssn', 'banking', 'identification', 'coverage', 'beneficiary', 'additional'];

  const toggleSection = (section: string) => {
    setManuallyOpened(section);
    // When closing beneficiary section, prompt to add another if at least one is complete
    if (section === 'beneficiary' && expandedSections.beneficiary) {
      const hasCompleteBeneficiary = beneficiaries.some(b => b.name && b.relationship && b.dob && b.percentage > 0);
      if (hasCompleteBeneficiary) {
        setShowAddBeneficiaryPrompt(true);
        return;
      }
    }
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const advanceToNextSection = (currentSection: string) => {
    // When beneficiary section auto-completes, show the add-another prompt
    if (currentSection === 'beneficiary') {
      setAutoAdvancedSections(prev => new Set(prev).add(currentSection));
      setShowAddBeneficiaryPrompt(true);
      return;
    }
    const currentIndex = sectionOrder.indexOf(currentSection);
    if (currentIndex < sectionOrder.length - 1) {
      const nextSection = sectionOrder[currentIndex + 1];
      setAutoAdvancedSections(prev => new Set(prev).add(currentSection));
      setTimeout(() => {
        setExpandedSections(prev => ({
          ...prev,
          [currentSection]: false,
          [nextSection]: true
        }));
        setManuallyOpened(null);
      }, 400);
    }
  };

  // Auto-advance when section is completed (only if not manually opened)
  useEffect(() => {
    if (!formMeta || formMeta.formType !== 'full_application') return;

    for (const section of sectionOrder) {
      // Only auto-advance if section is expanded, complete, not manually opened, and hasn't been auto-advanced before
      if (expandedSections[section] && isSectionComplete(section) && manuallyOpened !== section && !autoAdvancedSections.has(section)) {
        advanceToNextSection(section);
        break;
      }
    }
  }, [formData, beneficiaries, expandedSections, formMeta, manuallyOpened, autoAdvancedSections]);

  const addBeneficiary = () => {
    const remainingPercentage = 100 - beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    setBeneficiaries(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', relationship: '', dob: '', percentage: Math.max(0, remainingPercentage) }
    ]);
  };

  const removeBeneficiary = (id: string) => {
    if (beneficiaries.length > 1) {
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
    }
  };

  const updateBeneficiary = (id: string, field: keyof Beneficiary, value: string | number) => {
    setBeneficiaries(prev => prev.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  const getTotalPercentage = () => beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);

  const isSectionComplete = (section: string): boolean => {
    switch (section) {
      case 'personal': {
        const healthOtherValid = !formData.healthConditions?.includes('Other') || formData.healthConditionsOther?.trim();
        const medsOtherValid = !formData.medications?.includes('Other') || formData.medicationsOther?.trim();
        return !!(formData.fullName && formData.dateOfBirth && formData.gender && formData.heightFeet && formData.heightInches && formData.weight && formData.address && formData.city && formData.state && formData.zipCode && formData.phone && formData.email && formData.tobaccoUse && formData.healthConditions?.length && healthOtherValid && formData.medications?.length && medsOtherValid);
      }
      case 'coverage':
        return !!(formData.coverageType && formData.coverageAmount);
      case 'ssn':
        return !!(formData.ssn && formData.ssn.length === 11);
      case 'banking':
        return !!(formData.accountHolderName && formData.bankName && formData.routingNumber && formData.routingNumber.length === 9 && formData.accountNumber && formData.accountNumber.length >= 4 && formData.accountType);
      case 'identification': {
        const expParts = (formData.licenseExpiration || "").split("-");
        const expComplete = expParts.length === 3 && expParts.every(p => p.length > 0);
        return !!(formData.licenseNumber && formData.issuingState && expComplete && formData.dateOfBirth);
      }
      case 'beneficiary': {
        const isDateComplete = (d: string) => {
          const parts = (d || "").split("-");
          return parts.length === 3 && parts.every(p => p.length > 0);
        };
        return beneficiaries.length > 0 &&
               beneficiaries.every(b => b.name && b.relationship && isDateComplete(b.dob) && b.percentage > 0) &&
               getTotalPercentage() === 100;
      }
      case 'additional':
        if (!carrier?.additionalFields) return true;
        return carrier.additionalFields
          .filter(f => f.required)
          .every(f => formData[f.id as keyof FormData]);
      default:
        return false;
    }
  };

  useEffect(() => {
    const loadFormData = async () => {
      if (!id) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/secure-forms/${id}`);

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
          throw new Error("Failed to load form");
        }

        const data = await response.json();
        setFormMeta(data);

        const carrierBranding = CARRIER_BRANDING[data.carrierId];
        if (carrierBranding) {
          setCarrier(carrierBranding);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading form:", error);
        setIsNotFound(true);
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [id]);

  const handleChange = (field: keyof FormData, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formMeta?.formType === "ssn") {
      if (!formData.ssn || formData.ssn.replace(/\D/g, "").length !== 9) {
        newErrors.ssn = "Please enter a valid 9-digit SSN";
      }
      if (formData.ssn !== formData.confirmSsn) {
        newErrors.confirmSsn = "SSN does not match";
      }
      if (!formData.consentToProcess) {
        newErrors.consentToProcess = "You must consent to proceed";
      }
    }

    if (formMeta?.formType === "banking") {
      if (!formData.accountHolderName?.trim()) {
        newErrors.accountHolderName = "Account holder name is required";
      }
      if (!formData.bankName?.trim()) {
        newErrors.bankName = "Bank name is required";
      }
      if (!formData.accountType) {
        newErrors.accountType = "Please select account type";
      }
      if (!formData.routingNumber || formData.routingNumber.length !== 9) {
        newErrors.routingNumber = "Please enter a valid 9-digit routing number";
      }
      if (!formData.accountNumber || formData.accountNumber.length < 4) {
        newErrors.accountNumber = "Please enter a valid account number";
      }
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        newErrors.confirmAccountNumber = "Account numbers do not match";
      }
      if (!formData.consentToProcess) {
        newErrors.consentToProcess = "You must authorize this payment setup";
      }
    }

    if (formMeta?.formType === "drivers_license") {
      if (!formData.fullName?.trim()) {
        newErrors.fullName = "Full legal name is required";
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required";
      }
      if (!formData.licenseNumber?.trim()) {
        newErrors.licenseNumber = "License / ID number is required";
      }
      if (!formData.issuingState) {
        newErrors.issuingState = "Issuing state is required";
      }
      if (!formData.licenseExpiration) {
        newErrors.licenseExpiration = "Expiration date is required";
      }
      if (!formData.consentToProcess) {
        newErrors.consentToProcess = "You must consent to proceed";
      }
    }

    if (formMeta?.formType === "full_application") {
      // Personal Information - ALL required
      if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.heightFeet) newErrors.heightFeet = "Height (feet) is required";
      if (!formData.heightInches) newErrors.heightInches = "Height (inches) is required";
      if (!formData.weight) newErrors.weight = "Weight is required";

      // Contact Information - ALL required
      if (!formData.address?.trim()) newErrors.address = "Address is required";
      if (!formData.city?.trim()) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.zipCode?.trim()) newErrors.zipCode = "ZIP code is required";
      if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
      if (!formData.email?.trim()) newErrors.email = "Email is required";

      // Health Questions - ALL required
      if (!formData.tobaccoUse) newErrors.tobaccoUse = "Tobacco use is required";
      if (!formData.healthConditions?.length) newErrors.healthConditions = "Health conditions is required";
      if (formData.healthConditions?.includes('Other') && !formData.healthConditionsOther?.trim()) {
        newErrors.healthConditionsOther = "Please specify your health condition";
      }
      if (!formData.medications?.length) newErrors.medications = "Medications is required";
      if (formData.medications?.includes('Other') && !formData.medicationsOther?.trim()) {
        newErrors.medicationsOther = "Please specify your medication";
      }

      // SSN
      if (!formData.ssn || formData.ssn.replace(/\D/g, "").length !== 9) {
        newErrors.ssn = "Please enter a valid 9-digit SSN";
      }

      // Banking - ALL required
      if (!formData.accountHolderName?.trim()) newErrors.accountHolderName = "Account holder name is required";
      if (!formData.bankName?.trim()) newErrors.bankName = "Bank name is required";
      if (!formData.accountType) newErrors.accountType = "Account type is required";
      if (!formData.routingNumber || formData.routingNumber.length !== 9) {
        newErrors.routingNumber = "Please enter a valid 9-digit routing number";
      }
      if (!formData.accountNumber || formData.accountNumber.length < 4) {
        newErrors.accountNumber = "Please enter a valid account number";
      }

      // Identification
      if (!formData.licenseNumber?.trim()) newErrors.licenseNumber = "License / ID number is required";
      if (!formData.issuingState) newErrors.issuingState = "Issuing state is required";
      if (!formData.licenseExpiration) newErrors.licenseExpiration = "Expiration date is required";

      // Coverage Details - ALL required except monthly premium
      if (!formData.coverageType) newErrors.coverageType = "Coverage type is required";
      if (!formData.coverageAmount) newErrors.coverageAmount = "Coverage amount is required";

      // Beneficiary - ALL required
      if (beneficiaries.length === 0) {
        newErrors.beneficiaryName = "At least one beneficiary is required";
      } else {
        const incompleteBeneficiary = beneficiaries.find(b => !b.name || !b.relationship || !b.dob);
        if (incompleteBeneficiary) {
          newErrors.beneficiaryName = "Please complete all beneficiary fields";
        } else if (getTotalPercentage() !== 100) {
          newErrors.beneficiaryName = "Beneficiary percentages must total 100%";
        }
      }

      // Additional carrier-specific fields
      if (carrier?.additionalFields) {
        carrier.additionalFields.forEach(field => {
          if (field.required && !formData[field.id as keyof FormData]) {
            newErrors[field.id] = `${field.label} is required`;
          }
        });
      }

      // Consent
      if (!formData.consentToProcess) {
        newErrors.consentToProcess = "You must consent to proceed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/secure-forms/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          beneficiaries: formMeta?.formType === 'full_application' ? beneficiaries : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit form");
      }

      setIsSubmitted(true);
      toast.success("Information submitted securely!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Secure Form</h2>
              <p className="text-gray-500 text-sm mb-4">Verifying your secure access...</p>
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium bg-green-50 px-4 py-2 rounded-full mx-auto w-fit">
                <Lock className="w-4 h-4" />
                <span>256-bit Encrypted Connection</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Not found state
  if (isNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Form Not Found</h2>
              <p className="text-gray-500 text-sm mb-6">
                This secure form link is invalid or no longer exists. Please contact your insurance agent for assistance.
              </p>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-blue-700 text-sm">
                  <strong>Need help?</strong> Contact Heritage Life Solutions for a new secure form link.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Expired state
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Link Expired</h2>
              <p className="text-gray-500 text-sm mb-6">
                This secure form link has expired for your protection. Please contact your insurance agent for a new link.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800 text-sm">Why do links expire?</p>
                    <p className="text-amber-600 text-xs mt-1">
                      For your security, all secure form links expire after 24 hours to protect your sensitive information.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, ${carrier?.primaryColor || "#10B981"}08 0%, ${carrier?.primaryColor || "#10B981"}15 100%)`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div
              className="p-8 text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${carrier?.gradientFrom || "#10B981"} 0%, ${carrier?.gradientTo || "#059669"} 100%)`,
              }}
            >
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-white/10 rounded-full" />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl relative z-10"
              >
                <CheckCircle2 className="w-14 h-14" style={{ color: carrier?.primaryColor || "#10B981" }} />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-1 relative z-10">Successfully Submitted!</h2>
              <p className="text-white/80 relative z-10">Your information has been securely received</p>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-600">
                  Your information has been securely transmitted to <strong>{formMeta?.agentName}</strong> at Heritage Life Solutions.
                </p>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800 text-sm">Your data is protected</p>
                    <p className="text-green-600 text-xs mt-1">
                      All information was encrypted with 256-bit encryption and securely transmitted.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600">
                  <strong>What happens next?</strong>
                  <br />
                  Your agent will review your information and contact you within 1-2 business days.
                </p>
              </div>

              <p className="text-center text-gray-400 text-xs">You can safely close this window.</p>
            </CardContent>

            <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-center gap-3">
              {!logoError && carrier?.logoUrl ? (
                <img
                  src={carrier.logoUrl}
                  alt={carrier.logoAlt || carrier.shortName}
                  className="h-8 max-w-[120px] object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-sm font-medium" style={{ color: carrier?.primaryColor }}>
                  {carrier?.shortName}
                </span>
              )}
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-400">Heritage Life Solutions</span>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Get form-specific styling
  const getFormStyles = () => {
    switch (formMeta?.formType) {
      case "ssn":
        return { icon: Fingerprint, label: "Identity Verification", description: "Secure SSN verification for your insurance application" };
      case "banking":
        return { icon: CreditCard, label: "Payment Setup", description: "Set up automatic premium payments" };
      case "full_application":
        return { icon: FileText, label: "Insurance Application", description: "Complete your life insurance application" };
      default:
        return { icon: Shield, label: "Secure Form", description: "Secure information submission" };
    }
  };

  const formStyles = getFormStyles();
  const FormIcon = formStyles.icon;
  const clientFirstName = formMeta?.clientName?.split(" ")[0] || "Valued Client";

  // Main form render
  return (
    <div
      className="min-h-screen py-6 px-4"
      style={{
        background: `linear-gradient(180deg, ${carrier?.primaryColor || "#1E40AF"}05 0%, ${carrier?.primaryColor || "#1E40AF"}12 50%, ${carrier?.primaryColor || "#1E40AF"}05 100%)`,
      }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Carrier Header Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-xl border-0 overflow-hidden">
            <div
              className="p-6 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${carrier?.gradientFrom || "#1E40AF"} 0%, ${carrier?.gradientTo || "#3B82F6"} 100%)`,
              }}
            >
              {/* Decorative elements */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

              <div className="flex flex-col items-center text-center relative z-10 py-2">
                {/* Carrier Logo */}
                <div className="mb-4">
                  {!logoError && carrier?.logoUrl ? (
                    <div className="bg-white rounded-2xl flex items-center justify-center shadow-xl p-4 min-w-[100px] max-w-[180px]">
                      <img
                        src={carrier.logoUrl}
                        alt={carrier.logoAlt || carrier.shortName}
                        className="max-h-16 w-auto object-contain"
                        onError={() => setLogoError(true)}
                      />
                    </div>
                  ) : (
                    <CarrierInitials carrier={carrier} size="lg" />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold" style={{ color: carrier?.textOnPrimary || "#FFFFFF" }}>
                      {carrier?.shortName || "Insurance Provider"}
                    </h1>
                    <Verified className="w-6 h-6 text-white/80" />
                  </div>
                  <p className="text-sm opacity-90" style={{ color: carrier?.textOnPrimary || "#FFFFFF" }}>
                    {carrier?.tagline}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Type Banner */}
            <div className="px-6 py-4 bg-white border-b flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${carrier?.primaryColor}10` }}
              >
                <FormIcon className="w-6 h-6" style={{ color: carrier?.primaryColor }} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  {formMeta?.formType === "ssn" && carrier?.ssnFormTitle}
                  {formMeta?.formType === "banking" && carrier?.bankingFormTitle}
                  {formMeta?.formType === "drivers_license" && "Secure ID Verification"}
                  {formMeta?.formType === "full_application" && carrier?.applicationFormTitle}
                </h2>
                <p className="text-sm text-gray-500">{formStyles.description}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Form Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardContent className="p-6 space-y-6">
              {/* Welcome message */}
              <div
                className="rounded-xl p-5"
                style={{
                  backgroundColor: `${carrier?.primaryColor}08`,
                  borderLeft: `4px solid ${carrier?.primaryColor}`,
                }}
              >
                <p className="text-gray-700 font-medium">
                  Hi <span style={{ color: carrier?.primaryColor }}>{clientFirstName}</span>,
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Please complete this secure form requested by <strong>{formMeta?.agentName}</strong> at Heritage Life Solutions. Your information is protected with bank-level encryption.
                </p>
              </div>

              {/* SSN Form */}
              {formMeta?.formType === "ssn" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="ssn" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Fingerprint className="w-4 h-4" style={{ color: carrier?.primaryColor }} />
                      Social Security Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="ssn"
                        type={showSsn ? "text" : "password"}
                        placeholder="XXX-XX-XXXX"
                        value={formData.ssn || ""}
                        onChange={(e) => handleChange("ssn", formatSSN(e.target.value))}
                        className={cn(
                          "h-14 text-lg tracking-widest font-mono pr-12 border-2 transition-colors",
                          errors.ssn ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                        )}
                        maxLength={11}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSsn(!showSsn)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showSsn ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.ssn && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.ssn}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmSsn" className="text-sm font-semibold text-gray-700">
                      Confirm Social Security Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmSsn"
                      type={showSsn ? "text" : "password"}
                      placeholder="XXX-XX-XXXX"
                      value={formData.confirmSsn || ""}
                      onChange={(e) => handleChange("confirmSsn", formatSSN(e.target.value))}
                      className={cn(
                        "h-14 text-lg tracking-widest font-mono border-2 transition-colors",
                        errors.confirmSsn ? "border-red-300" : "border-gray-200 focus:border-blue-500"
                      )}
                      maxLength={11}
                    />
                    {errors.confirmSsn && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.confirmSsn}
                      </p>
                    )}
                  </div>

                </div>
              )}

              {/* Banking Form */}
              {formMeta?.formType === "banking" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="accountHolderName" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <User className="w-4 h-4" style={{ color: carrier?.primaryColor }} />
                      Account Holder Name
                    </Label>
                    <Input
                      id="accountHolderName"
                      placeholder="Full name as it appears on account"
                      value={formData.accountHolderName || ""}
                      onChange={(e) => handleChange("accountHolderName", e.target.value)}
                      className={cn("h-12 border-2", errors.accountHolderName ? "border-red-300" : "border-gray-200")}
                    />
                    {errors.accountHolderName && <p className="text-red-500 text-xs">{errors.accountHolderName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Building2 className="w-4 h-4" style={{ color: carrier?.primaryColor }} />
                      Bank Name
                    </Label>
                    <Input
                      id="bankName"
                      placeholder="e.g., Chase, Bank of America, Wells Fargo"
                      value={formData.bankName || ""}
                      onChange={(e) => handleChange("bankName", e.target.value)}
                      className={cn("h-12 border-2", errors.bankName ? "border-red-300" : "border-gray-200")}
                    />
                    {errors.bankName && <p className="text-red-500 text-xs">{errors.bankName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Account Type <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleChange("accountType", "checking")}
                        className={cn(
                          "h-14 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2",
                          formData.accountType === "checking" ? "shadow-md" : "border-gray-200 hover:border-gray-300 bg-white"
                        )}
                        style={
                          formData.accountType === "checking"
                            ? {
                                borderColor: carrier?.primaryColor,
                                backgroundColor: `${carrier?.primaryColor}10`,
                                color: carrier?.primaryColor,
                              }
                            : {}
                        }
                      >
                        <BadgeCheck className="w-5 h-5" />
                        Checking
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange("accountType", "savings")}
                        className={cn(
                          "h-14 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2",
                          formData.accountType === "savings" ? "shadow-md" : "border-gray-200 hover:border-gray-300 bg-white"
                        )}
                        style={
                          formData.accountType === "savings"
                            ? {
                                borderColor: carrier?.primaryColor,
                                backgroundColor: `${carrier?.primaryColor}10`,
                                color: carrier?.primaryColor,
                              }
                            : {}
                        }
                      >
                        <Award className="w-5 h-5" />
                        Savings
                      </button>
                    </div>
                    {errors.accountType && <p className="text-red-500 text-xs">{errors.accountType}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="routingNumber" className="text-sm font-semibold text-gray-700">
                        Routing Number
                      </Label>
                      <Input
                        id="routingNumber"
                        placeholder="9 digits"
                        value={formData.routingNumber || ""}
                        onChange={(e) => handleChange("routingNumber", e.target.value.replace(/\D/g, "").slice(0, 9))}
                        className={cn("h-12 font-mono border-2", errors.routingNumber ? "border-red-300" : "border-gray-200")}
                        maxLength={9}
                      />
                      {errors.routingNumber && <p className="text-red-500 text-xs">{errors.routingNumber}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="text-sm font-semibold text-gray-700">
                        Account Number
                      </Label>
                      <div className="relative">
                        <Input
                          id="accountNumber"
                          type={showAccount ? "text" : "password"}
                          placeholder="Account number"
                          value={formData.accountNumber || ""}
                          onChange={(e) => handleChange("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 17))}
                          className={cn("h-12 font-mono pr-12 border-2", errors.accountNumber ? "border-red-300" : "border-gray-200")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowAccount(!showAccount)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showAccount ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.accountNumber && <p className="text-red-500 text-xs">{errors.accountNumber}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmAccountNumber" className="text-sm font-semibold text-gray-700">
                      Confirm Account Number
                    </Label>
                    <Input
                      id="confirmAccountNumber"
                      type={showAccount ? "text" : "password"}
                      placeholder="Re-enter account number"
                      value={formData.confirmAccountNumber || ""}
                      onChange={(e) => handleChange("confirmAccountNumber", e.target.value.replace(/\D/g, "").slice(0, 17))}
                      className={cn("h-12 font-mono border-2", errors.confirmAccountNumber ? "border-red-300" : "border-gray-200")}
                    />
                    {errors.confirmAccountNumber && <p className="text-red-500 text-xs">{errors.confirmAccountNumber}</p>}
                  </div>
                </div>
              )}

              {/* Driver's License / State ID Form */}
              {formMeta?.formType === "drivers_license" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                      Full Legal Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="As it appears on your ID"
                      value={formData.fullName || ""}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className={cn("h-12 border-2 rounded-xl", errors.fullName ? "border-red-300" : "border-gray-200")}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <DateSelect
                      value={formData.dateOfBirth || ""}
                      onChange={(val) => handleChange("dateOfBirth", val)}
                      error={!!errors.dateOfBirth}
                      maxYear={new Date().getFullYear()}
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-xs">{errors.dateOfBirth}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      ID Type
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleChange("licenseType", "drivers_license")}
                        className={cn(
                          "h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all",
                          (!formData.licenseType || formData.licenseType === "drivers_license")
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        )}
                        style={
                          (!formData.licenseType || formData.licenseType === "drivers_license") && carrier?.primaryColor
                            ? { borderColor: carrier.primaryColor, backgroundColor: carrier.primaryColor }
                            : {}
                        }
                      >
                        <IdCard className="w-5 h-5" />
                        Driver's License
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange("licenseType", "state_id")}
                        className={cn(
                          "h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all",
                          formData.licenseType === "state_id"
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        )}
                        style={
                          formData.licenseType === "state_id" && carrier?.primaryColor
                            ? { borderColor: carrier.primaryColor, backgroundColor: carrier.primaryColor }
                            : {}
                        }
                      >
                        <BadgeCheck className="w-5 h-5" />
                        State ID
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      {formData.licenseType === "state_id" ? "State ID Number" : "Driver's License Number"} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="licenseNumber"
                        type={showLicense ? "text" : "password"}
                        placeholder="Enter your ID number"
                        value={formData.licenseNumber || ""}
                        onChange={(e) => handleChange("licenseNumber", e.target.value)}
                        className={cn("h-12 font-mono pr-12 border-2 rounded-xl", errors.licenseNumber ? "border-red-300" : "border-gray-200")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLicense(!showLicense)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showLicense ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.licenseNumber && <p className="text-red-500 text-xs">{errors.licenseNumber}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issuingState" className="text-sm font-semibold text-gray-700">
                        Issuing State <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.issuingState || ""}
                        onValueChange={(value) => handleChange("issuingState", value)}
                      >
                        <SelectTrigger className={cn("h-12 border-2 rounded-xl", errors.issuingState ? "border-red-300" : "border-gray-200")}>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((st) => (
                            <SelectItem key={st} value={st}>{st}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.issuingState && <p className="text-red-500 text-xs">{errors.issuingState}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Expiration Date <span className="text-red-500">*</span>
                      </Label>
                      <DateSelect
                        value={formData.licenseExpiration || ""}
                        onChange={(val) => handleChange("licenseExpiration", val)}
                        error={!!errors.licenseExpiration}
                        minYear={new Date().getFullYear()}
                        maxYear={new Date().getFullYear() + 15}
                      />
                      {errors.licenseExpiration && <p className="text-red-500 text-xs">{errors.licenseExpiration}</p>}
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Your data is protected</p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Your ID information is encrypted end-to-end and only accessible by your authorized agent.
                          This data is used solely for identity verification purposes.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Consent */}
                  <div
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border-2 transition-colors",
                      formData.consentToProcess
                        ? "border-emerald-300 bg-emerald-50"
                        : errors.consentToProcess
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200"
                    )}
                  >
                    <Checkbox
                      id="consent"
                      checked={formData.consentToProcess || false}
                      onCheckedChange={(checked) => handleChange("consentToProcess", checked as boolean)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                      I authorize the collection and verification of my identification information for
                      insurance underwriting purposes. I confirm that the information provided is accurate
                      and matches my government-issued ID.
                    </Label>
                  </div>
                  {errors.consentToProcess && <p className="text-red-500 text-xs -mt-3">{errors.consentToProcess}</p>}
                </div>
              )}

              {/* Full Application Form */}
              {formMeta?.formType === "full_application" && (
                <div className="space-y-3">
                  {/* Section 1: Personal Information */}
                  <div
                    className="rounded-2xl border-2 overflow-hidden transition-all"
                    style={{
                      borderColor: expandedSections.personal ? carrier?.primaryColor : '#e5e7eb',
                      backgroundColor: expandedSections.personal ? `${carrier?.primaryColor}05` : 'white'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection('personal')}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isSectionComplete('personal') ? '#10b981' : expandedSections.personal ? carrier?.primaryColor : '#f3f4f6',
                          color: isSectionComplete('personal') || expandedSections.personal ? '#ffffff' : '#9ca3af'
                        }}
                      >
                        {isSectionComplete('personal') ? <Check className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Personal Information</h3>
                        <p className="text-xs text-gray-500">Step 1 of 7 • Basic details & health questions</p>
                      </div>
                      <ChevronDown
                        className={cn("w-5 h-5 text-gray-400 transition-transform", expandedSections.personal && "rotate-180")}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedSections.personal && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 grid gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-700">Full Legal Name <span className="text-red-500">*</span></Label>
                              <Input
                                placeholder="As it appears on your government ID"
                                value={formData.fullName || ""}
                                onChange={(e) => handleChange("fullName", e.target.value)}
                                className={cn("h-12 border-2 rounded-xl", errors.fullName ? "border-red-300" : "border-gray-200")}
                              />
                              {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  Date of Birth <span className="text-red-500">*</span>
                                </Label>
                                <DateSelect
                                  value={formData.dateOfBirth || ""}
                                  onChange={(val) => handleChange("dateOfBirth", val)}
                                  error={!!errors.dateOfBirth}
                                  maxYear={new Date().getFullYear()}
                                />
                                {errors.dateOfBirth && <p className="text-red-500 text-xs">{errors.dateOfBirth}</p>}
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Gender <span className="text-red-500">*</span></Label>
                                <Select
                                  value={formData.gender || ""}
                                  onValueChange={(value) => handleChange("gender", value)}
                                >
                                  <SelectTrigger className={cn("h-12 border-2 rounded-xl", errors.gender ? "border-red-300" : "border-gray-200")}>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Height <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-2 gap-2">
                                  <Select
                                    value={formData.heightFeet || ""}
                                    onValueChange={(value) => handleChange("heightFeet", value)}
                                  >
                                    <SelectTrigger className={cn("h-12 border-2 rounded-xl", errors.heightFeet ? "border-red-300" : "border-gray-200")}>
                                      <SelectValue placeholder="Feet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="4">4 ft</SelectItem>
                                      <SelectItem value="5">5 ft</SelectItem>
                                      <SelectItem value="6">6 ft</SelectItem>
                                      <SelectItem value="7">7 ft</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    value={formData.heightInches || ""}
                                    onValueChange={(value) => handleChange("heightInches", value)}
                                  >
                                    <SelectTrigger className={cn("h-12 border-2 rounded-xl", errors.heightInches ? "border-red-300" : "border-gray-200")}>
                                      <SelectValue placeholder="Inches" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="0">0 in</SelectItem>
                                      <SelectItem value="1">1 in</SelectItem>
                                      <SelectItem value="2">2 in</SelectItem>
                                      <SelectItem value="3">3 in</SelectItem>
                                      <SelectItem value="4">4 in</SelectItem>
                                      <SelectItem value="5">5 in</SelectItem>
                                      <SelectItem value="6">6 in</SelectItem>
                                      <SelectItem value="7">7 in</SelectItem>
                                      <SelectItem value="8">8 in</SelectItem>
                                      <SelectItem value="9">9 in</SelectItem>
                                      <SelectItem value="10">10 in</SelectItem>
                                      <SelectItem value="11">11 in</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                {(errors.heightFeet || errors.heightInches) && <p className="text-red-500 text-xs">Height is required</p>}
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Weight (lbs) <span className="text-red-500">*</span></Label>
                                <Input
                                  type="number"
                                  placeholder="Enter weight"
                                  value={formData.weight || ""}
                                  onChange={(e) => handleChange("weight", e.target.value)}
                                  className={cn("h-12 border-2 rounded-xl", errors.weight ? "border-red-300" : "border-gray-200")}
                                />
                                {errors.weight && <p className="text-red-500 text-xs">{errors.weight}</p>}
                              </div>
                            </div>

                            {/* Contact Information */}
                            <div className="pt-4 mt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2 mb-4">
                                <Building2 className="w-4 h-4" style={{ color: carrier?.primaryColor }} />
                                <span className="text-sm font-semibold text-gray-700">Contact Information</span>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm text-gray-700">
                                    Street Address <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    placeholder="123 Main Street"
                                    value={formData.address || ""}
                                    onChange={(e) => handleChange("address", e.target.value)}
                                    className={cn("h-12 border-2 rounded-xl", errors.address ? "border-red-300" : "border-gray-200")}
                                  />
                                  {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">
                                      City <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      placeholder="City"
                                      value={formData.city || ""}
                                      onChange={(e) => handleChange("city", e.target.value)}
                                      className={cn("h-12 border-2 rounded-xl", errors.city ? "border-red-300" : "border-gray-200")}
                                    />
                                    {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">
                                      State <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                      value={formData.state || ""}
                                      onValueChange={(value) => handleChange("state", value)}
                                    >
                                      <SelectTrigger className={cn("h-12 border-2 rounded-xl", errors.state ? "border-red-300" : "border-gray-200")}>
                                        <SelectValue placeholder="Select state" />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-[300px]">
                                        <SelectItem value="AL">Alabama</SelectItem>
                                        <SelectItem value="AK">Alaska</SelectItem>
                                        <SelectItem value="AZ">Arizona</SelectItem>
                                        <SelectItem value="AR">Arkansas</SelectItem>
                                        <SelectItem value="CA">California</SelectItem>
                                        <SelectItem value="CO">Colorado</SelectItem>
                                        <SelectItem value="CT">Connecticut</SelectItem>
                                        <SelectItem value="DE">Delaware</SelectItem>
                                        <SelectItem value="FL">Florida</SelectItem>
                                        <SelectItem value="GA">Georgia</SelectItem>
                                        <SelectItem value="HI">Hawaii</SelectItem>
                                        <SelectItem value="ID">Idaho</SelectItem>
                                        <SelectItem value="IL">Illinois</SelectItem>
                                        <SelectItem value="IN">Indiana</SelectItem>
                                        <SelectItem value="IA">Iowa</SelectItem>
                                        <SelectItem value="KS">Kansas</SelectItem>
                                        <SelectItem value="KY">Kentucky</SelectItem>
                                        <SelectItem value="LA">Louisiana</SelectItem>
                                        <SelectItem value="ME">Maine</SelectItem>
                                        <SelectItem value="MD">Maryland</SelectItem>
                                        <SelectItem value="MA">Massachusetts</SelectItem>
                                        <SelectItem value="MI">Michigan</SelectItem>
                                        <SelectItem value="MN">Minnesota</SelectItem>
                                        <SelectItem value="MS">Mississippi</SelectItem>
                                        <SelectItem value="MO">Missouri</SelectItem>
                                        <SelectItem value="MT">Montana</SelectItem>
                                        <SelectItem value="NE">Nebraska</SelectItem>
                                        <SelectItem value="NV">Nevada</SelectItem>
                                        <SelectItem value="NH">New Hampshire</SelectItem>
                                        <SelectItem value="NJ">New Jersey</SelectItem>
                                        <SelectItem value="NM">New Mexico</SelectItem>
                                        <SelectItem value="NY">New York</SelectItem>
                                        <SelectItem value="NC">North Carolina</SelectItem>
                                        <SelectItem value="ND">North Dakota</SelectItem>
                                        <SelectItem value="OH">Ohio</SelectItem>
                                        <SelectItem value="OK">Oklahoma</SelectItem>
                                        <SelectItem value="OR">Oregon</SelectItem>
                                        <SelectItem value="PA">Pennsylvania</SelectItem>
                                        <SelectItem value="RI">Rhode Island</SelectItem>
                                        <SelectItem value="SC">South Carolina</SelectItem>
                                        <SelectItem value="SD">South Dakota</SelectItem>
                                        <SelectItem value="TN">Tennessee</SelectItem>
                                        <SelectItem value="TX">Texas</SelectItem>
                                        <SelectItem value="UT">Utah</SelectItem>
                                        <SelectItem value="VT">Vermont</SelectItem>
                                        <SelectItem value="VA">Virginia</SelectItem>
                                        <SelectItem value="WA">Washington</SelectItem>
                                        <SelectItem value="WV">West Virginia</SelectItem>
                                        <SelectItem value="WI">Wisconsin</SelectItem>
                                        <SelectItem value="WY">Wyoming</SelectItem>
                                        <SelectItem value="DC">Washington D.C.</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-gray-700">
                                    ZIP Code <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    placeholder="12345"
                                    value={formData.zipCode || ""}
                                    onChange={(e) => handleChange("zipCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                                    className={cn("h-12 border-2 rounded-xl w-32", errors.zipCode ? "border-red-300" : "border-gray-200")}
                                    maxLength={5}
                                  />
                                  {errors.zipCode && <p className="text-red-500 text-xs">{errors.zipCode}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">
                                      Phone Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      placeholder="(555) 123-4567"
                                      value={formData.phone || ""}
                                      onChange={(e) => handleChange("phone", e.target.value)}
                                      className={cn("h-12 border-2 rounded-xl", errors.phone ? "border-red-300" : "border-gray-200")}
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">
                                      Email Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      type="email"
                                      placeholder="email@example.com"
                                      value={formData.email || ""}
                                      onChange={(e) => handleChange("email", e.target.value)}
                                      className={cn("h-12 border-2 rounded-xl", errors.email ? "border-red-300" : "border-gray-200")}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Health Questions */}
                            <div className="pt-4 mt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2 mb-4">
                                <Stethoscope className="w-4 h-4" style={{ color: carrier?.primaryColor }} />
                                <span className="text-sm font-semibold text-gray-700">Health Questions</span>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm text-gray-700">
                                    Have you used tobacco or nicotine products in the last 12 months? <span className="text-red-500">*</span>
                                  </Label>
                                  <Select
                                    value={formData.tobaccoUse || ""}
                                    onValueChange={(value) => handleChange("tobaccoUse", value)}
                                  >
                                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="no">No</SelectItem>
                                      <SelectItem value="yes">Yes</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-gray-700">
                                    Do you have any diagnosed health conditions? <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="grid grid-cols-2 gap-2 p-3 border-2 border-gray-200 rounded-xl bg-gray-50/50">
                                    {['None', 'Diabetes', 'Heart Disease', 'High Blood Pressure', 'High Cholesterol', 'Cancer', 'Asthma/COPD', 'Mental Health', 'Kidney Disease', 'Liver Disease', 'Stroke', 'Arthritis', 'Sleep Apnea', 'Other'].map((condition) => (
                                      <label key={condition} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors">
                                        <Checkbox
                                          checked={(formData.healthConditions || []).includes(condition)}
                                          onCheckedChange={(checked) => {
                                            const current = formData.healthConditions || [];
                                            if (condition === 'None') {
                                              handleChange("healthConditions", checked ? ['None'] : []);
                                              if (checked) handleChange("healthConditionsOther", "");
                                            } else {
                                              const filtered = current.filter(c => c !== 'None');
                                              handleChange("healthConditions", checked
                                                ? [...filtered, condition]
                                                : filtered.filter(c => c !== condition)
                                              );
                                              if (condition === 'Other' && !checked) handleChange("healthConditionsOther", "");
                                            }
                                          }}
                                          className="border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700">{condition}</span>
                                      </label>
                                    ))}
                                  </div>
                                  {(formData.healthConditions || []).includes('Other') && (
                                    <Input
                                      placeholder="Please specify your health condition(s)"
                                      value={formData.healthConditionsOther || ""}
                                      onChange={(e) => handleChange("healthConditionsOther", e.target.value)}
                                      className="h-10 border-2 border-gray-200 rounded-xl mt-2"
                                    />
                                  )}
                                  {errors.healthConditions && <p className="text-red-500 text-xs">{errors.healthConditions}</p>}
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-gray-700">
                                    Are you currently taking any medications? <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="grid grid-cols-2 gap-2 p-3 border-2 border-gray-200 rounded-xl bg-gray-50/50">
                                    {['None', 'Blood Pressure', 'Cholesterol (Statins)', 'Diabetes (Insulin/Metformin)', 'Heart Medication', 'Blood Thinners', 'Antidepressants/Anxiety', 'Pain Medication', 'Thyroid Medication', 'Asthma/Respiratory', 'Sleep Aids', 'Other'].map((medication) => (
                                      <label key={medication} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors">
                                        <Checkbox
                                          checked={(formData.medications || []).includes(medication)}
                                          onCheckedChange={(checked) => {
                                            const current = formData.medications || [];
                                            if (medication === 'None') {
                                              handleChange("medications", checked ? ['None'] : []);
                                              if (checked) handleChange("medicationsOther", "");
                                            } else {
                                              const filtered = current.filter(m => m !== 'None');
                                              handleChange("medications", checked
                                                ? [...filtered, medication]
                                                : filtered.filter(m => m !== medication)
                                              );
                                              if (medication === 'Other' && !checked) handleChange("medicationsOther", "");
                                            }
                                          }}
                                          className="border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700">{medication}</span>
                                      </label>
                                    ))}
                                  </div>
                                  {(formData.medications || []).includes('Other') && (
                                    <Input
                                      placeholder="Please specify your medication(s)"
                                      value={formData.medicationsOther || ""}
                                      onChange={(e) => handleChange("medicationsOther", e.target.value)}
                                      className="h-10 border-2 border-gray-200 rounded-xl mt-2"
                                    />
                                  )}
                                  {errors.medications && <p className="text-red-500 text-xs">{errors.medications}</p>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 2: Social Security Number */}
                  <div
                    className="rounded-2xl border-2 overflow-hidden transition-all"
                    style={{
                      borderColor: expandedSections.ssn ? carrier?.primaryColor : '#e5e7eb',
                      backgroundColor: expandedSections.ssn ? `${carrier?.primaryColor}05` : 'white'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection('ssn')}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isSectionComplete('ssn') ? '#10b981' : expandedSections.ssn ? carrier?.primaryColor : '#f3f4f6',
                          color: isSectionComplete('ssn') || expandedSections.ssn ? '#ffffff' : '#9ca3af'
                        }}
                      >
                        {isSectionComplete('ssn') ? <Check className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Social Security Number</h3>
                        <p className="text-xs text-gray-500">Step 2 of 7 • Required for identity verification</p>
                      </div>
                      <ChevronDown
                        className={cn("w-5 h-5 text-gray-400 transition-transform", expandedSections.ssn && "rotate-180")}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedSections.ssn && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Fingerprint className="w-4 h-4 text-gray-400" />
                                Social Security Number <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  type={showSsn ? "text" : "password"}
                                  placeholder="XXX-XX-XXXX"
                                  value={formData.ssn || ""}
                                  onChange={(e) => handleChange("ssn", formatSSN(e.target.value))}
                                  className={cn("h-12 font-mono pr-12 border-2 rounded-xl", errors.ssn ? "border-red-300" : "border-gray-200")}
                                  maxLength={11}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSsn(!showSsn)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showSsn ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                              {errors.ssn && <p className="text-red-500 text-xs">{errors.ssn}</p>}
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Your SSN is encrypted with 256-bit security
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 3: Banking Details */}
                  <div
                    className="rounded-2xl border-2 overflow-hidden transition-all"
                    style={{
                      borderColor: expandedSections.banking ? carrier?.primaryColor : '#e5e7eb',
                      backgroundColor: expandedSections.banking ? `${carrier?.primaryColor}05` : 'white'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection('banking')}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isSectionComplete('banking') ? '#10b981' : expandedSections.banking ? carrier?.primaryColor : '#f3f4f6',
                          color: isSectionComplete('banking') || expandedSections.banking ? '#ffffff' : '#9ca3af'
                        }}
                      >
                        {isSectionComplete('banking') ? <Check className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Banking Details</h3>
                        <p className="text-xs text-gray-500">Step 3 of 7 • For premium payments</p>
                      </div>
                      <ChevronDown
                        className={cn("w-5 h-5 text-gray-400 transition-transform", expandedSections.banking && "rotate-180")}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedSections.banking && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Account Holder Name <span className="text-red-500">*</span></Label>
                                <Input
                                  placeholder="Name on the account"
                                  value={formData.accountHolderName || ""}
                                  onChange={(e) => handleChange("accountHolderName", e.target.value)}
                                  className={cn("h-12 border-2 rounded-xl", errors.accountHolderName ? "border-red-300" : "border-gray-200")}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Bank Name <span className="text-red-500">*</span></Label>
                                <Input
                                  placeholder="e.g. Chase, Bank of America"
                                  value={formData.bankName || ""}
                                  onChange={(e) => handleChange("bankName", e.target.value)}
                                  className={cn("h-12 border-2 rounded-xl", errors.bankName ? "border-red-300" : "border-gray-200")}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Routing Number <span className="text-red-500">*</span></Label>
                                <Input
                                  placeholder="9 digits"
                                  value={formData.routingNumber || ""}
                                  onChange={(e) => handleChange("routingNumber", e.target.value.replace(/\D/g, "").slice(0, 9))}
                                  className={cn("h-12 font-mono border-2 rounded-xl", errors.routingNumber ? "border-red-300" : "border-gray-200")}
                                  maxLength={9}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Account Number <span className="text-red-500">*</span></Label>
                                <Input
                                  placeholder="Account number"
                                  value={formData.accountNumber || ""}
                                  onChange={(e) => handleChange("accountNumber", e.target.value.replace(/\D/g, ""))}
                                  className={cn("h-12 font-mono border-2 rounded-xl", errors.accountNumber ? "border-red-300" : "border-gray-200")}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-700">Account Type <span className="text-red-500">*</span></Label>
                              <Select
                                value={formData.accountType || ""}
                                onValueChange={(value) => handleChange("accountType", value as "checking" | "savings")}
                              >
                                <SelectTrigger className={cn("h-12 border-2 rounded-xl", errors.accountType ? "border-red-300" : "border-gray-200")}>
                                  <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="checking">Checking</SelectItem>
                                  <SelectItem value="savings">Savings</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 4: Identification (Driver's License / State ID) */}
                  <div
                    className="rounded-2xl border-2 overflow-hidden transition-all"
                    style={{
                      borderColor: expandedSections.identification ? carrier?.primaryColor : '#e5e7eb',
                      backgroundColor: expandedSections.identification ? `${carrier?.primaryColor}05` : 'white'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection('identification')}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isSectionComplete('identification') ? '#10b981' : expandedSections.identification ? carrier?.primaryColor : '#f3f4f6',
                          color: isSectionComplete('identification') || expandedSections.identification ? '#ffffff' : '#9ca3af'
                        }}
                      >
                        {isSectionComplete('identification') ? <Check className="w-5 h-5" /> : <IdCard className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Driver's License / State ID</h3>
                        <p className="text-xs text-gray-500">Step 4 of 7 • Government-issued identification</p>
                      </div>
                      <ChevronDown
                        className={cn("w-5 h-5 text-gray-400 transition-transform", expandedSections.identification && "rotate-180")}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedSections.identification && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 grid gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-700">ID Type</Label>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleChange("licenseType", "drivers_license")}
                                  className={cn(
                                    "h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all",
                                    (!formData.licenseType || formData.licenseType === "drivers_license")
                                      ? "border-gray-900 bg-gray-900 text-white"
                                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                                  )}
                                  style={
                                    (!formData.licenseType || formData.licenseType === "drivers_license") && carrier?.primaryColor
                                      ? { borderColor: carrier.primaryColor, backgroundColor: carrier.primaryColor }
                                      : {}
                                  }
                                >
                                  <IdCard className="w-5 h-5" />
                                  Driver's License
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleChange("licenseType", "state_id")}
                                  className={cn(
                                    "h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all",
                                    formData.licenseType === "state_id"
                                      ? "border-gray-900 bg-gray-900 text-white"
                                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                                  )}
                                  style={
                                    formData.licenseType === "state_id" && carrier?.primaryColor
                                      ? { borderColor: carrier.primaryColor, backgroundColor: carrier.primaryColor }
                                      : {}
                                  }
                                >
                                  <BadgeCheck className="w-5 h-5" />
                                  State ID
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-400" />
                                {formData.licenseType === "state_id" ? "State ID Number" : "Driver's License Number"} <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  type={showLicense ? "text" : "password"}
                                  placeholder="Enter your ID number"
                                  value={formData.licenseNumber || ""}
                                  onChange={(e) => handleChange("licenseNumber", e.target.value)}
                                  className={cn("h-12 font-mono pr-12 border-2 rounded-xl", errors.licenseNumber ? "border-red-300" : "border-gray-200")}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowLicense(!showLicense)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showLicense ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                              {errors.licenseNumber && <p className="text-red-500 text-xs">{errors.licenseNumber}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Issuing State <span className="text-red-500">*</span></Label>
                                <Select
                                  value={formData.issuingState || ""}
                                  onValueChange={(value) => handleChange("issuingState", value)}
                                >
                                  <SelectTrigger className={cn("h-12 border-2 rounded-xl", errors.issuingState ? "border-red-300" : "border-gray-200")}>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {US_STATES.map((st) => (
                                      <SelectItem key={st} value={st}>{st}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {errors.issuingState && <p className="text-red-500 text-xs">{errors.issuingState}</p>}
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  Expiration Date <span className="text-red-500">*</span>
                                </Label>
                                <DateSelect
                                  value={formData.licenseExpiration || ""}
                                  onChange={(val) => handleChange("licenseExpiration", val)}
                                  error={!!errors.licenseExpiration}
                                  minYear={new Date().getFullYear()}
                                  maxYear={new Date().getFullYear() + 15}
                                />
                                {errors.licenseExpiration && <p className="text-red-500 text-xs">{errors.licenseExpiration}</p>}
                              </div>
                            </div>
                            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-gray-500" />
                                <p className="text-xs text-gray-500">Your ID information is encrypted and used solely for identity verification.</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 5: Coverage Details */}
                  <div
                    className="rounded-2xl border-2 overflow-hidden transition-all"
                    style={{
                      borderColor: expandedSections.coverage ? carrier?.primaryColor : '#e5e7eb',
                      backgroundColor: expandedSections.coverage ? `${carrier?.primaryColor}05` : 'white'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection('coverage')}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isSectionComplete('coverage') ? '#10b981' : expandedSections.coverage ? carrier?.primaryColor : '#f3f4f6',
                          color: isSectionComplete('coverage') || expandedSections.coverage ? '#ffffff' : '#9ca3af'
                        }}
                      >
                        {isSectionComplete('coverage') ? <Check className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Coverage Details</h3>
                        <p className="text-xs text-gray-500">Step 5 of 7 • Type and amount of coverage</p>
                      </div>
                      <ChevronDown
                        className={cn("w-5 h-5 text-gray-400 transition-transform", expandedSections.coverage && "rotate-180")}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedSections.coverage && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 grid gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-700">Type of Coverage <span className="text-red-500">*</span></Label>
                              <Select
                                value={formData.coverageType || ""}
                                onValueChange={(value) => handleChange("coverageType", value)}
                              >
                                <SelectTrigger className={cn("h-12 border-2 rounded-xl", errors.coverageType ? "border-red-300" : "border-gray-200")}>
                                  <SelectValue placeholder="Select coverage type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {carrier?.productTypes && carrier.productTypes.length > 0 ? (
                                    carrier.productTypes.map((productType) => (
                                      <SelectItem key={productType} value={productType}>{productType}</SelectItem>
                                    ))
                                  ) : (
                                    <>
                                      <SelectItem value="term_life">Term Life</SelectItem>
                                      <SelectItem value="whole_life">Whole Life</SelectItem>
                                      <SelectItem value="universal_life">Universal Life</SelectItem>
                                      <SelectItem value="final_expense">Final Expense</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                              {errors.coverageType && <p className="text-red-500 text-xs">{errors.coverageType}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-gray-400" />
                                  Coverage Amount <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={formData.coverageAmount || ""}
                                  onValueChange={(value) => handleChange("coverageAmount", value)}
                                >
                                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
                                    <SelectValue placeholder="Select amount" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="25000">$25,000</SelectItem>
                                    <SelectItem value="50000">$50,000</SelectItem>
                                    <SelectItem value="100000">$100,000</SelectItem>
                                    <SelectItem value="150000">$150,000</SelectItem>
                                    <SelectItem value="200000">$200,000</SelectItem>
                                    <SelectItem value="250000">$250,000</SelectItem>
                                    <SelectItem value="300000">$300,000</SelectItem>
                                    <SelectItem value="400000">$400,000</SelectItem>
                                    <SelectItem value="500000">$500,000</SelectItem>
                                    <SelectItem value="750000">$750,000</SelectItem>
                                    <SelectItem value="1000000">$1,000,000</SelectItem>
                                    <SelectItem value="other">Other Amount</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Monthly Premium (if known)</Label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                  <Input
                                    placeholder="0.00"
                                    value={formData.monthlyPremium || ""}
                                    onChange={(e) => handleChange("monthlyPremium", e.target.value.replace(/[^\d.]/g, ""))}
                                    className="h-12 border-2 border-gray-200 rounded-xl pl-8"
                                  />
                                </div>
                                <p className="text-xs text-gray-500">Optional - leave blank if unknown</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 5: Beneficiary Information */}
                  <div
                    className="rounded-2xl border-2 overflow-hidden transition-all"
                    style={{
                      borderColor: expandedSections.beneficiary ? carrier?.primaryColor : '#e5e7eb',
                      backgroundColor: expandedSections.beneficiary ? `${carrier?.primaryColor}05` : 'white'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection('beneficiary')}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isSectionComplete('beneficiary') ? '#10b981' : expandedSections.beneficiary ? carrier?.primaryColor : '#f3f4f6',
                          color: isSectionComplete('beneficiary') || expandedSections.beneficiary ? '#ffffff' : '#9ca3af'
                        }}
                      >
                        {isSectionComplete('beneficiary') ? <Check className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Beneficiary Information</h3>
                        <p className="text-xs text-gray-500">Step 6 of 7 • Who receives the benefit</p>
                      </div>
                      <ChevronDown
                        className={cn("w-5 h-5 text-gray-400 transition-transform", expandedSections.beneficiary && "rotate-180")}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedSections.beneficiary && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-4">
                            {/* Percentage Summary */}
                            <div
                              className="flex items-center justify-between p-3 rounded-xl"
                              style={{
                                backgroundColor: getTotalPercentage() === 100 ? '#dcfce7' : getTotalPercentage() > 100 ? '#fee2e2' : '#fef3c7',
                                borderColor: getTotalPercentage() === 100 ? '#86efac' : getTotalPercentage() > 100 ? '#fca5a5' : '#fde68a'
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Percent className="w-4 h-4" style={{ color: getTotalPercentage() === 100 ? '#16a34a' : getTotalPercentage() > 100 ? '#dc2626' : '#d97706' }} />
                                <span className="text-sm font-medium" style={{ color: getTotalPercentage() === 100 ? '#16a34a' : getTotalPercentage() > 100 ? '#dc2626' : '#d97706' }}>
                                  Total Allocation: {getTotalPercentage()}%
                                </span>
                              </div>
                              {getTotalPercentage() !== 100 && (
                                <span className="text-xs" style={{ color: getTotalPercentage() > 100 ? '#dc2626' : '#d97706' }}>
                                  {getTotalPercentage() > 100 ? 'Exceeds 100%' : `${100 - getTotalPercentage()}% remaining`}
                                </span>
                              )}
                            </div>

                            {/* Beneficiary List */}
                            {beneficiaries.map((beneficiary, index) => (
                              <div
                                key={beneficiary.id}
                                className="p-4 border-2 border-gray-200 rounded-xl space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-700">
                                    {index === 0 ? 'Primary Beneficiary' : `Beneficiary ${index + 1}`}
                                  </span>
                                  {beneficiaries.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeBeneficiary(beneficiary.id)}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">Full Name <span className="text-red-500">*</span></Label>
                                    <Input
                                      placeholder="Full legal name"
                                      value={beneficiary.name}
                                      onChange={(e) => updateBeneficiary(beneficiary.id, 'name', e.target.value)}
                                      className="h-10 border-2 border-gray-200 rounded-lg text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">Relationship <span className="text-red-500">*</span></Label>
                                    <Select
                                      value={beneficiary.relationship}
                                      onValueChange={(value) => updateBeneficiary(beneficiary.id, 'relationship', value)}
                                    >
                                      <SelectTrigger className="h-10 border-2 border-gray-200 rounded-lg text-sm">
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="spouse">Spouse</SelectItem>
                                        <SelectItem value="child">Child</SelectItem>
                                        <SelectItem value="parent">Parent</SelectItem>
                                        <SelectItem value="sibling">Sibling</SelectItem>
                                        <SelectItem value="trust">Trust</SelectItem>
                                        <SelectItem value="estate">Estate</SelectItem>
                                        <SelectItem value="charity">Charity</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">Date of Birth <span className="text-red-500">*</span></Label>
                                    <DateSelect
                                      value={beneficiary.dob}
                                      onChange={(val) => updateBeneficiary(beneficiary.id, 'dob', val)}
                                      error={false}
                                      maxYear={new Date().getFullYear()}
                                      size="small"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">Percentage <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                      <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        placeholder="100"
                                        value={beneficiary.percentage === 0 ? '' : beneficiary.percentage}
                                        onChange={(e) => {
                                          const val = e.target.value === '' ? 0 : Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                          updateBeneficiary(beneficiary.id, 'percentage', val);
                                        }}
                                        className="h-10 border-2 border-gray-200 rounded-lg text-sm pr-8"
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Add Beneficiary Button */}
                            <button
                              type="button"
                              onClick={addBeneficiary}
                              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-sm font-medium">Add Another Beneficiary</span>
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                              Beneficiary percentages must total exactly 100%
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 5: Carrier-specific fields */}
                  {carrier?.additionalFields && carrier.additionalFields.length > 0 && (
                    <div
                      className="rounded-2xl border-2 overflow-hidden transition-all"
                      style={{
                        borderColor: expandedSections.additional ? carrier?.primaryColor : '#e5e7eb',
                        backgroundColor: expandedSections.additional ? `${carrier?.primaryColor}05` : 'white'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection('additional')}
                        className="w-full flex items-center gap-3 p-4 text-left"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: expandedSections.additional ? carrier?.primaryColor : '#f3f4f6',
                            color: expandedSections.additional ? '#ffffff' : '#9ca3af'
                          }}
                        >
                          <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">Additional Information</h3>
                          <p className="text-xs text-gray-500">Step 7 of 7 • {carrier.shortName} specific questions</p>
                        </div>
                        <ChevronDown
                          className={cn("w-5 h-5 text-gray-400 transition-transform", expandedSections.additional && "rotate-180")}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedSections.additional && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-4">
                              {carrier.additionalFields.map((field) => (
                                <div key={field.id} className="space-y-2">
                                  <Label className="text-sm font-semibold text-gray-700">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </Label>
                                  {field.type === "select" && (
                                    <Select
                                      value={(formData[field.id as keyof FormData] as string) || ""}
                                      onValueChange={(value) => handleChange(field.id as keyof FormData, value)}
                                    >
                                      <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
                                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.options?.map((option) => (
                                          <SelectItem key={option} value={option}>
                                            {option}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                  {field.type === "text" && (
                                    <Input
                                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                      value={(formData[field.id as keyof FormData] as string) || ""}
                                      onChange={(e) => handleChange(field.id as keyof FormData, e.target.value)}
                                      className="h-12 border-2 border-gray-200 rounded-xl"
                                    />
                                  )}
                                  {field.type === "textarea" && (
                                    <textarea
                                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                      value={(formData[field.id as keyof FormData] as string) || ""}
                                      onChange={(e) => handleChange(field.id as keyof FormData, e.target.value)}
                                      className="w-full min-h-[100px] p-3 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-offset-0"
                                      style={{ borderColor: carrier?.primaryColor ? `${carrier.primaryColor}40` : undefined }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              {/* Consent section */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consentToProcess"
                    checked={formData.consentToProcess || false}
                    onCheckedChange={(checked) => handleChange("consentToProcess", checked as boolean)}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor="consentToProcess" className="text-sm cursor-pointer text-gray-700">
                      I authorize <strong>{carrier?.shortName || "the insurance carrier"}</strong> and Heritage Life Solutions to
                      process this information for my insurance application.
                    </Label>
                    {errors.consentToProcess && <p className="text-red-500 text-xs mt-1">{errors.consentToProcess}</p>}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consentToContact"
                    checked={formData.consentToContact || false}
                    onCheckedChange={(checked) => handleChange("consentToContact", checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="consentToContact" className="text-sm cursor-pointer text-gray-700">
                    I consent to be contacted regarding my application status and policy information.
                  </Label>
                </div>
              </div>

              {/* Security assurance */}
              <div
                className="rounded-xl p-5 border"
                style={{
                  backgroundColor: `${carrier?.primaryColor}05`,
                  borderColor: `${carrier?.primaryColor}15`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${carrier?.primaryColor}15` }}
                  >
                    <ShieldCheck className="w-5 h-5" style={{ color: carrier?.primaryColor }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: carrier?.primaryColor }}>
                      Your Information is Protected
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {carrier?.securityMessage || "Your information is protected with bank-level encryption."}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {carrier?.partnerMessage || "Heritage Life Solutions is an authorized distribution partner."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-16 text-lg font-bold gap-3 shadow-xl hover:shadow-2xl transition-all rounded-xl"
                style={{
                  backgroundColor: carrier?.primaryColor || "#1E40AF",
                  color: carrier?.textOnPrimary || "#FFFFFF",
                }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                    />
                    Submitting Securely...
                  </>
                ) : (
                  <>
                    <Lock className="w-6 h-6" />
                    Submit Securely
                  </>
                )}
              </Button>

              {/* Link Expiry Note */}
              {formMeta?.expiresAt && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
                  <Clock className="w-3 h-3" />
                  <span>
                    This secure link expires {new Date(formMeta.expiresAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </CardContent>

            {/* Footer */}
            <div className="px-6 py-5 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!logoError && carrier?.logoUrl ? (
                    <img
                      src={carrier.logoUrl}
                      alt={carrier.logoAlt || carrier.shortName}
                      className="h-8 max-w-[120px] object-contain opacity-80"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-500">{carrier?.shortName}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">Heritage Life Solutions</span>
              </div>
              {carrier?.regulatoryInfo && (
                <p className="text-xs text-gray-400 mt-2 text-center">{carrier.regulatoryInfo}</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Footer trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-6 text-gray-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> SSL Secured
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> SOC 2 Certified
            </span>
          </div>
          <p className="text-gray-400 text-xs max-w-md mx-auto">{carrier?.trustMessage}</p>
        </motion.div>

        {/* Legal Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-gray-200 max-w-2xl mx-auto"
        >
          <p className="text-gray-500 text-xs leading-relaxed text-center mb-3">
            &copy; 2026 Gold Coast Financial Group. Heritage Life Solutions is a DBA of Gold Coast Financial Group. We operate as an independent insurance agency, licensed in all 50 states. IL License #1001234567. Policies are issued by our carrier partners and product availability may vary by state.
          </p>
          <p className="text-gray-400 text-[10px] leading-relaxed text-center mb-2">
            At Heritage, we believe protecting your family shouldn't be complicated. Our streamlined process connects you with coverage options from top-rated carriers, often without the need for medical exams. Most applications take just minutes to complete, and approvals can happen within 24-48 hours.
          </p>
          <p className="text-gray-400 text-[10px] leading-relaxed text-center mb-2">
            Life insurance premiums are based on factors including age, health, and coverage amount. Locking in coverage sooner typically means lower rates. Once your policy is in place, your premium remains fixed for the duration of your term.
          </p>
          <p className="text-gray-400 text-[10px] leading-relaxed text-center">
            Heritage Life Solutions partners with A-rated insurance carriers to provide comprehensive coverage options. All quotes are subject to underwriting approval by the issuing carrier.
          </p>
        </motion.div>
      </div>

      {/* Add Another Beneficiary Prompt */}
      <AlertDialog open={showAddBeneficiaryPrompt} onOpenChange={setShowAddBeneficiaryPrompt}>
        <AlertDialogContent className="p-0 border-0 overflow-hidden" style={{ borderRadius: 24, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
          {/* Gradient Header */}
          <div
            className="px-6 py-5 flex items-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${carrier?.gradientFrom || carrier?.primaryColor || '#7c3aed'} 0%, ${carrier?.gradientTo || '#f59e0b'} 100%)`,
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <AlertDialogTitle className="text-white font-bold text-base">Add Another Beneficiary?</AlertDialogTitle>
              <p className="text-white/70 text-xs mt-0.5">Split your benefit between multiple people</p>
            </div>
          </div>

          <div className="px-6 py-5">
            <AlertDialogDescription className="text-gray-600 text-sm leading-relaxed">
              Would you like to add another beneficiary to your policy? You can designate multiple beneficiaries and split the benefit percentage between them.
            </AlertDialogDescription>

            {/* Current beneficiary summary */}
            <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: `${carrier?.primaryColor || '#7c3aed'}08`, border: `1px solid ${carrier?.primaryColor || '#7c3aed'}15` }}>
              <p className="text-xs font-semibold text-gray-700 mb-1">Current beneficiaries: {beneficiaries.length}</p>
              <p className="text-xs text-gray-500">Total allocation: {getTotalPercentage()}%</p>
            </div>
          </div>

          <div className="px-6 pb-5 flex gap-3">
            <AlertDialogCancel
              onClick={() => {
                setShowAddBeneficiaryPrompt(false);
                const benIndex = sectionOrder.indexOf('beneficiary');
                const nextSection = sectionOrder[benIndex + 1];
                setExpandedSections(prev => ({
                  ...prev,
                  beneficiary: false,
                  ...(nextSection ? { [nextSection]: true } : {})
                }));
              }}
              className="flex-1 h-11 border-2 font-semibold"
              style={{ borderRadius: 16, borderColor: `${carrier?.primaryColor || '#7c3aed'}30`, color: carrier?.primaryColor || '#7c3aed' }}
            >
              No, continue
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowAddBeneficiaryPrompt(false);
                addBeneficiary();
              }}
              className="flex-1 h-11 border-0 font-semibold text-white"
              style={{ borderRadius: 16, background: `linear-gradient(135deg, ${carrier?.gradientFrom || carrier?.primaryColor || '#7c3aed'} 0%, ${carrier?.gradientTo || '#f59e0b'} 100%)` }}
            >
              Yes, add another
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
