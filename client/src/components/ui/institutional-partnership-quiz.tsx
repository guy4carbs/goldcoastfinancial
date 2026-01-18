import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  User,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Target,
  TrendingUp,
  Clock,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface QuizData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  companyType: string;
  annualRevenue: string;
  employeeCount: string;
  partnershipInterest: string;
  timeline: string;
  additionalInfo: string;
}

const initialData: QuizData = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  companyType: "",
  annualRevenue: "",
  employeeCount: "",
  partnershipInterest: "",
  timeline: "",
  additionalInfo: "",
};

const companyTypes = [
  { value: "insurance_agency", label: "Insurance Agency/Brokerage", icon: Building2 },
  { value: "financial_services", label: "Financial Services Firm", icon: TrendingUp },
  { value: "technology", label: "InsurTech / FinTech", icon: Target },
  { value: "other", label: "Other", icon: Briefcase },
];

const revenueRanges = [
  { value: "under_1m", label: "Under $1M" },
  { value: "1m_5m", label: "$1M - $5M" },
  { value: "5m_10m", label: "$5M - $10M" },
  { value: "10m_plus", label: "$10M+" },
];

const employeeCounts = [
  { value: "1_10", label: "1-10" },
  { value: "11_50", label: "11-50" },
  { value: "51_200", label: "51-200" },
  { value: "200_plus", label: "200+" },
];

const partnershipTypes = [
  { value: "acquisition", label: "Full Acquisition", description: "Complete business sale" },
  { value: "strategic_partnership", label: "Strategic Partnership", description: "Collaboration opportunity" },
  { value: "investment", label: "Capital Investment", description: "Growth funding" },
  { value: "exploring", label: "Just Exploring", description: "Learning about options" },
];

const timelines = [
  { value: "immediate", label: "Immediate (0-3 months)" },
  { value: "3_6_months", label: "Near-term (3-6 months)" },
  { value: "6_12_months", label: "Medium-term (6-12 months)" },
  { value: "12_plus_months", label: "Long-term (12+ months)" },
];

export function InstitutionalPartnershipQuiz() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuizData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; qualification: string } | null>(null);
  const { toast } = useToast();

  const totalSteps = 4;

  const updateData = (field: keyof QuizData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!data.companyName.trim() || !data.contactName.trim()) {
          toast({ title: "Please fill in all required fields", variant: "destructive" });
          return false;
        }
        if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          toast({ title: "Please enter a valid email", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        if (!data.companyType) {
          toast({ title: "Please select your company type", variant: "destructive" });
          return false;
        }
        return true;
      case 3:
        if (!data.partnershipInterest || !data.timeline) {
          toast({ title: "Please complete all selections", variant: "destructive" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/institutional/partnership-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        setResult({
          score: responseData.score,
          qualification: responseData.qualification,
        });
        toast({ title: "Assessment complete!", description: "We'll be in touch soon." });
      } else {
        throw new Error(responseData.error || "Failed to submit");
      }
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-border/60 p-8 rounded-sm text-center"
      >
        <div className="w-20 h-20 bg-[hsl(348,65%,20%)]/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[hsl(348,65%,25%)]" />
        </div>

        <h3 className="text-2xl font-serif text-primary mb-4">Assessment Complete</h3>

        <div className="bg-muted/30 rounded-sm p-6 mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Partnership Fit Score
          </p>
          <p className="text-4xl font-serif font-medium text-primary mb-2">{result.score}/100</p>
          <p className="text-sm text-muted-foreground">
            {result.qualification === "highly_qualified" && (
              <span className="text-[hsl(348,65%,25%)] font-medium">Highly Qualified - Priority Review</span>
            )}
            {result.qualification === "qualified" && (
              <span className="text-primary font-medium">Qualified - Standard Review</span>
            )}
            {result.qualification === "potential" && (
              <span className="text-muted-foreground font-medium">Potential - Exploratory Discussion</span>
            )}
          </p>
        </div>

        <p className="text-muted-foreground mb-6 leading-relaxed">
          Thank you for your interest in partnering with Gold Coast Financial.
          {result.qualification === "highly_qualified"
            ? " Our corporate development team will reach out within 24-48 hours to discuss next steps."
            : " Our team will review your submission and contact you within 3-5 business days."}
        </p>

        <p className="text-sm text-muted-foreground">
          Questions? Contact us at{" "}
          <a href="mailto:corporate@goldcoastfnl.com" className="text-primary hover:underline">
            corporate@goldcoastfnl.com
          </a>
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white border border-border/60 rounded-sm overflow-hidden">
      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <motion.div
          className="h-full bg-[hsl(348,65%,25%)]"
          initial={{ width: 0 }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-8">
        {/* Step Header */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Step {step} of {totalSteps}
          </p>
          <h3 className="text-lg font-medium text-primary">
            {step === 1 && "Contact Information"}
            {step === 2 && "Company Profile"}
            {step === 3 && "Partnership Goals"}
            {step === 4 && "Additional Information"}
          </h3>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Contact Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Company Name *
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Your company"
                      value={data.companyName}
                      onChange={(e) => updateData("companyName", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Contact Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Your name"
                      value={data.contactName}
                      onChange={(e) => updateData("contactName", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Email *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="email@company.com"
                      value={data.email}
                      onChange={(e) => updateData("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={data.phone}
                      onChange={(e) => updateData("phone", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Company Profile */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Company Type *
                </Label>
                <RadioGroup
                  value={data.companyType}
                  onValueChange={(val) => updateData("companyType", val)}
                  className="grid grid-cols-2 gap-3"
                >
                  {companyTypes.map((type) => (
                    <div key={type.value}>
                      <RadioGroupItem value={type.value} id={`type-${type.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`type-${type.value}`}
                        className="flex flex-col items-center p-4 border border-border/60 rounded-sm cursor-pointer hover:bg-muted/30 peer-data-[state=checked]:border-[hsl(348,65%,25%)] peer-data-[state=checked]:bg-[hsl(348,65%,20%)]/5 transition-all"
                      >
                        <type.icon className="w-6 h-6 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium text-center">{type.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Annual Revenue
                  </Label>
                  <RadioGroup
                    value={data.annualRevenue}
                    onValueChange={(val) => updateData("annualRevenue", val)}
                    className="space-y-2"
                  >
                    {revenueRanges.map((range) => (
                      <div key={range.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={range.value} id={`rev-${range.value}`} />
                        <Label htmlFor={`rev-${range.value}`} className="text-sm cursor-pointer">
                          {range.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Employee Count
                  </Label>
                  <RadioGroup
                    value={data.employeeCount}
                    onValueChange={(val) => updateData("employeeCount", val)}
                    className="space-y-2"
                  >
                    {employeeCounts.map((count) => (
                      <div key={count.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={count.value} id={`emp-${count.value}`} />
                        <Label htmlFor={`emp-${count.value}`} className="text-sm cursor-pointer">
                          {count.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Partnership Goals */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Partnership Interest *
                </Label>
                <RadioGroup
                  value={data.partnershipInterest}
                  onValueChange={(val) => updateData("partnershipInterest", val)}
                  className="grid grid-cols-2 gap-3"
                >
                  {partnershipTypes.map((type) => (
                    <div key={type.value}>
                      <RadioGroupItem
                        value={type.value}
                        id={`partner-${type.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`partner-${type.value}`}
                        className="flex flex-col p-4 border border-border/60 rounded-sm cursor-pointer hover:bg-muted/30 peer-data-[state=checked]:border-[hsl(348,65%,25%)] peer-data-[state=checked]:bg-[hsl(348,65%,20%)]/5 transition-all"
                      >
                        <span className="font-medium text-sm">{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timeline *
                </Label>
                <RadioGroup
                  value={data.timeline}
                  onValueChange={(val) => updateData("timeline", val)}
                  className="grid grid-cols-2 gap-3"
                >
                  {timelines.map((timeline) => (
                    <div key={timeline.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={timeline.value} id={`time-${timeline.value}`} />
                      <Label htmlFor={`time-${timeline.value}`} className="text-sm cursor-pointer">
                        {timeline.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </motion.div>
          )}

          {/* Step 4: Additional Info */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Additional Information
                </Label>
                <Textarea
                  placeholder="Tell us more about your company, goals, and why you're interested in partnering with Gold Coast Financial..."
                  value={data.additionalInfo}
                  onChange={(e) => updateData("additionalInfo", e.target.value)}
                  className="min-h-[150px] resize-none"
                />
              </div>

              <div className="bg-muted/30 rounded-sm p-4">
                <h4 className="text-sm font-medium text-primary mb-2">Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-muted-foreground">Company:</p>
                  <p className="text-primary">{data.companyName}</p>
                  <p className="text-muted-foreground">Type:</p>
                  <p className="text-primary">
                    {companyTypes.find((t) => t.value === data.companyType)?.label || "-"}
                  </p>
                  <p className="text-muted-foreground">Interest:</p>
                  <p className="text-primary">
                    {partnershipTypes.find((t) => t.value === data.partnershipInterest)?.label || "-"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border/60">
          <Button variant="ghost" onClick={prevStep} disabled={step === 1} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={nextStep}
              className="gap-2 bg-[hsl(348,65%,20%)] hover:bg-[hsl(348,65%,25%)] text-white"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 bg-[hsl(348,65%,20%)] hover:bg-[hsl(348,65%,25%)] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Assessment
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
