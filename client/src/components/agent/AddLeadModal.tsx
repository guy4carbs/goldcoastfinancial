import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, User, Mail, Phone, MapPin, FileText, Sparkles, Loader2, Calendar, AlertCircle, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/agentStore";
import { useCelebration } from "@/lib/celebrationContext";
import { RADIUS, SHADOW } from "@/lib/heritageDesignSystem";

const FOLLOW_UP_TYPES = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'text', label: 'Text', icon: MessageSquare },
  { value: 'meeting', label: 'Meeting', icon: Users },
];

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLead: (lead: Omit<Lead, 'id' | 'createdDate' | 'notes' | 'assignedTo'>) => void;
  existingLeads?: Lead[];
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const PRODUCTS = ['Term Life', 'Whole Life', 'IUL', 'Final Expense', 'Mortgage Protection'];
const SOURCES = ['Website', 'Referral', 'Facebook Ad', 'Google Ad', 'Cold Call', 'Event', 'Other'];

export function AddLeadModal({ open, onOpenChange, onAddLead, existingLeads = [] }: AddLeadModalProps) {
  const { showXP } = useCelebration();

  // Calculate default follow-up date (tomorrow)
  const getDefaultFollowUpDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    product: '',
    source: 'Website',
    notes: '',
    nextFollowUpDate: getDefaultFollowUpDate(),
    nextFollowUpType: 'call' as Lead['nextFollowUpType'],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Accept various phone formats
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Check for duplicate leads by email or phone
  const checkForDuplicates = () => {
    const normalizedEmail = formData.email.trim().toLowerCase();
    const normalizedPhone = formData.phone.replace(/[\s\-\(\)]/g, '');

    for (const lead of existingLeads) {
      if (lead.email?.toLowerCase() === normalizedEmail) {
        return { field: 'email', lead };
      }
      if (lead.phone?.replace(/[\s\-\(\)]/g, '') === normalizedPhone) {
        return { field: 'phone', lead };
      }
    }
    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Check for duplicates
    const duplicate = checkForDuplicates();
    if (duplicate) {
      if (duplicate.field === 'email') {
        newErrors.email = `Lead already exists: ${duplicate.lead.name}`;
      } else {
        newErrors.phone = `Lead already exists: ${duplicate.lead.name}`;
      }
    }

    // Validate follow-up date (required for AgentOS Stage 1)
    if (!formData.nextFollowUpDate) {
      newErrors.nextFollowUpDate = 'Follow-up date is required';
    } else {
      const followUpDate = new Date(formData.nextFollowUpDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (followUpDate < today) {
        newErrors.nextFollowUpDate = 'Follow-up date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate a brief delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));

    onAddLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      state: formData.state,
      product: formData.product,
      source: formData.source,
      status: 'new',
      nextFollowUpDate: formData.nextFollowUpDate,
      nextFollowUpType: formData.nextFollowUpType,
      ...(formData.notes.trim() && { leadNotes: formData.notes.trim() }),
    });

    // Show XP celebration
    showXP(25);

    setFormData({
      name: '',
      email: '',
      phone: '',
      state: '',
      product: '',
      source: 'Website',
      notes: '',
      nextFollowUpDate: getDefaultFollowUpDate(),
      nextFollowUpType: 'call',
    });
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        style={{ borderRadius: RADIUS.card }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4 font-serif">
            <div
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
              style={{ borderRadius: RADIUS.button }}
            >
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            Add New Lead
          </DialogTitle>
          <DialogDescription>
            Enter the lead's information to add them to your pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="name" className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                <User className="w-3 h-3 text-violet-500" /> Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
                className={cn("h-9", errors.name ? 'border-red-500' : '')}
                style={{ borderRadius: RADIUS.input }}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3 h-3 text-violet-500" /> Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@email.com"
                className={cn("h-9", errors.email ? 'border-red-500' : '')}
                style={{ borderRadius: RADIUS.input }}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3 h-3 text-violet-500" /> Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className={cn("h-9", errors.phone ? 'border-red-500' : '')}
                style={{ borderRadius: RADIUS.input }}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3 h-3 text-violet-500" /> State
              </Label>
              <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
                <SelectTrigger className="h-9" style={{ borderRadius: RADIUS.input }}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3 h-3 text-violet-500" /> Product Interest
              </Label>
              <Select value={formData.product} onValueChange={(v) => setFormData({ ...formData, product: v })}>
                <SelectTrigger className="h-9" style={{ borderRadius: RADIUS.input }}>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map((product) => (
                    <SelectItem key={product} value={product}>{product}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3 h-3 text-violet-500" /> Lead Source
              </Label>
              <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                <SelectTrigger className="h-9" style={{ borderRadius: RADIUS.input }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes" className="text-xs font-medium mb-1.5 block">Initial Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information about this lead..."
                className="min-h-[64px] resize-none"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
          </div>

          {/* Follow-up Section - Required */}
          <div
            className="bg-violet-50 p-3 space-y-2.5 border border-violet-200"
            style={{ borderRadius: RADIUS.input }}
          >
            <div className="flex items-center gap-2 text-violet-700">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">First Follow-Up *</span>
            </div>
            <p className="text-[11px] text-violet-600">Every new lead requires a scheduled follow-up.</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="followUpDate" className="text-xs font-medium mb-1.5 block text-violet-700">Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={formData.nextFollowUpDate}
                  onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className={cn(
                    "bg-white h-9",
                    errors.nextFollowUpDate && "border-red-300"
                  )}
                  style={{ borderRadius: RADIUS.input }}
                />
                {errors.nextFollowUpDate && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.nextFollowUpDate}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block text-violet-700">Type</Label>
                <Select
                  value={formData.nextFollowUpType}
                  onValueChange={(v) => setFormData({ ...formData, nextFollowUpType: v as Lead['nextFollowUpType'] })}
                >
                  <SelectTrigger className="bg-white h-9" style={{ borderRadius: RADIUS.input }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOLLOW_UP_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-3.5 h-3.5" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick date buttons */}
            <div className="flex gap-1.5 flex-wrap">
              {[
                { label: 'Today', days: 0 },
                { label: 'Tomorrow', days: 1 },
                { label: 'In 2 days', days: 2 },
                { label: 'Next week', days: 7 },
              ].map((option) => {
                const date = new Date();
                date.setDate(date.getDate() + option.days);
                const dateStr = date.toISOString().split('T')[0];
                return (
                  <button
                    key={option.days}
                    type="button"
                    onClick={() => setFormData({ ...formData, nextFollowUpDate: dateStr })}
                    className={cn(
                      "text-[11px] px-2.5 py-1 transition-all",
                      formData.nextFollowUpDate === dateStr
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent"
                        : "bg-white text-violet-700 border border-violet-300 hover:bg-violet-100"
                    )}
                    style={{ borderRadius: RADIUS.input }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            style={{ borderRadius: RADIUS.button }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90"
            disabled={isSubmitting}
            style={{ borderRadius: RADIUS.button }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Add Lead
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
