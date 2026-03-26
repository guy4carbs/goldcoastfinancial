import { useState } from "react";
import { motion } from "framer-motion";
import {
  Rocket, User, Mail, Phone, Shield, Building2, DollarSign, Loader2, Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RADIUS, SHADOW, fadeInUp } from "@/lib/heritageDesignSystem";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

interface StartClosingFormProps {
  onCreated: (leadId: string) => void;
  compact?: boolean;
}

// Format phone as (xxx) xxx-xxxx
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Format currency as $12,000
function formatCurrency(value: string): string {
  const digits = value.replace(/[^0-9.]/g, '');
  if (!digits) return '';
  const parts = digits.split('.');
  const whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) {
    return `$${whole}.${parts[1].slice(0, 2)}`;
  }
  return `$${whole}`;
}

// Strip formatting to get raw number
function stripCurrency(value: string): string {
  return value.replace(/[$,\s]/g, '');
}

export function StartClosingForm({ onCreated, compact }: StartClosingFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverageType, setCoverageType] = useState("");
  const [carrier, setCarrier] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [monthlyPremium, setMonthlyPremium] = useState("");

  const resetForm = () => {
    setFirstName(""); setLastName(""); setEmail(""); setPhone("");
    setCoverageType(""); setCarrier(""); setCoverageAmount(""); setMonthlyPremium("");
    setExpanded(false);
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/post-close/create", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.replace(/\D/g, '') || undefined,
        coverageType: coverageType.trim() || undefined,
        carrier: carrier.trim() || undefined,
        coverageAmount: stripCurrency(coverageAmount) || undefined,
        monthlyPremium: stripCurrency(monthlyPremium) || undefined,
      });
      const result = await response.json();
      toast.success(`Closing started for ${firstName} ${lastName}`);
      const leadId = result.data?.lead_id;
      resetForm();
      if (leadId) onCreated(leadId);
    } catch (err: any) {
      toast.error(err.message || "Failed to start closing");
    } finally {
      setSubmitting(false);
    }
  };

  // Compact mode — just a button
  if (compact && !expanded) {
    return (
      <motion.div variants={fadeInUp}>
        <Card className="border-0 border-dashed border-2 border-gray-200 bg-gray-50/50" style={{ borderRadius: RADIUS.card }}>
          <CardContent className="py-4 flex items-center justify-center">
            <Button
              variant="ghost"
              className="h-9 text-sm text-violet-600 hover:text-violet-700 gap-2"
              onClick={() => setExpanded(true)}
            >
              <Plus className="w-4 h-4" />
              Start Another Closing
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeInUp}>
      <Card
        className="border-0 overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700"
        style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Start New Closing</h2>
              <p className="text-xs text-white/60">Enter client info to begin the post-close workflow</p>
            </div>
          </div>
        </div>

        {/* Form on glass card */}
        <div className="mx-4 mb-4 p-5 bg-white/95 backdrop-blur" style={{ borderRadius: RADIUS.card }}>
          <div className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <User className="w-3 h-3" /> First Name *
                </Label>
                <Input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="John"
                  className="h-9 text-sm"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <User className="w-3 h-3" /> Last Name *
                </Label>
                <Input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="h-9 text-sm"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Mail className="w-3 h-3" /> Email
                </Label>
                <Input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@email.com"
                  type="email"
                  className="h-9 text-sm"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Phone className="w-3 h-3" /> Phone
                </Label>
                <Input
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  placeholder="(555) 123-4567"
                  className="h-9 text-sm"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            </div>

            {/* Policy */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Shield className="w-3 h-3" /> Coverage Type
                </Label>
                <Input
                  value={coverageType}
                  onChange={e => setCoverageType(e.target.value)}
                  placeholder="Term Life, Whole Life, IUL..."
                  className="h-9 text-sm"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Building2 className="w-3 h-3" /> Carrier
                </Label>
                <Input
                  value={carrier}
                  onChange={e => setCarrier(e.target.value)}
                  placeholder="National Life, Mutual of Omaha..."
                  className="h-9 text-sm"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            </div>

            {/* Financials */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3" /> Coverage Amount
                </Label>
                <Input
                  value={coverageAmount}
                  onChange={e => setCoverageAmount(formatCurrency(e.target.value))}
                  placeholder="$250,000"
                  className="h-9 text-sm"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3" /> Monthly Premium
                </Label>
                <Input
                  value={monthlyPremium}
                  onChange={e => setMonthlyPremium(formatCurrency(e.target.value))}
                  placeholder="$150"
                  className="h-9 text-sm"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            {compact && (
              <Button
                size="sm"
                variant="ghost"
                className="h-9 text-sm text-gray-500"
                onClick={() => { resetForm(); setExpanded(false); }}
              >
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              className="h-9 px-6 text-sm bg-violet-600 hover:bg-violet-700 text-white font-medium"
              style={{ borderRadius: RADIUS.button }}
              onClick={handleSubmit}
              disabled={submitting || !firstName.trim() || !lastName.trim()}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4 mr-2" />
              )}
              Start Closing
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
