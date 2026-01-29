import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User, Phone, Mail, MapPin, Building2, DollarSign,
  Briefcase, CalendarDays, Users, Save, X, Loader2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField, FormSelect } from "./FormField";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  occupation: string;
  employer: string;
  annualIncome: string;
  productInterest: string;
  leadSource: string;
  notes: string;
}

interface LeadFormProps {
  initialData?: Partial<LeadFormData>;
  onSubmit?: (data: LeadFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  className?: string;
}

const productOptions = [
  { value: 'term-life', label: 'Term Life Insurance' },
  { value: 'whole-life', label: 'Whole Life Insurance' },
  { value: 'universal-life', label: 'Universal Life Insurance' },
  { value: 'final-expense', label: 'Final Expense' },
  { value: 'annuity', label: 'Annuity' },
  { value: 'medicare', label: 'Medicare Supplement' },
];

const sourceOptions = [
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'cold-call', label: 'Cold Call' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'event', label: 'Event/Seminar' },
  { value: 'other', label: 'Other' },
];

const stateOptions = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const initialFormData: LeadFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  dateOfBirth: '',
  occupation: '',
  employer: '',
  annualIncome: '',
  productInterest: '',
  leadSource: '',
  notes: '',
};

export function LeadForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  className,
}: LeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    ...initialFormData,
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LeadFormData, boolean>>>({});

  const updateField = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LeadFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.productInterest) {
      newErrors.productInterest = 'Please select a product';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  return (
    <Card className={cn("border-gray-100 overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-violet-500/10 to-transparent border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-primary">
                {mode === 'create' ? 'Add New Lead' : 'Edit Lead'}
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                {mode === 'create' ? 'Capture prospect information' : 'Update lead details'}
              </p>
            </div>
          </div>
          {mode === 'create' && (
            <Badge className="bg-violet-500/10 text-violet-500 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              +25 XP
            </Badge>
          )}
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Personal Information */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(v) => updateField('firstName', v)}
                  error={errors.firstName}
                  success={touched.firstName && !errors.firstName && !!formData.firstName}
                  required
                />
                <FormField
                  label="Last Name"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(v) => updateField('lastName', v)}
                  error={errors.lastName}
                  success={touched.lastName && !errors.lastName && !!formData.lastName}
                  required
                />
                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="john.doe@email.com"
                  value={formData.email}
                  onChange={(v) => updateField('email', v)}
                  error={errors.email}
                  success={touched.email && !errors.email && !!formData.email}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
                <FormField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(v) => updateField('phone', v)}
                  error={errors.phone}
                  success={touched.phone && !errors.phone && !!formData.phone}
                  icon={<Phone className="w-4 h-4" />}
                  required
                />
                <FormField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(v) => updateField('dateOfBirth', v)}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
              </div>
            </motion.div>

            {/* Address */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Street Address"
                  name="address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(v) => updateField('address', v)}
                  className="md:col-span-2"
                />
                <FormField
                  label="City"
                  name="city"
                  placeholder="Anytown"
                  value={formData.city}
                  onChange={(v) => updateField('city', v)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    label="State"
                    name="state"
                    options={stateOptions}
                    value={formData.state}
                    onChange={(v) => updateField('state', v)}
                    placeholder="Select"
                  />
                  <FormField
                    label="ZIP Code"
                    name="zipCode"
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={(v) => updateField('zipCode', v)}
                  />
                </div>
              </div>
            </motion.div>

            {/* Employment */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Employment & Income
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Occupation"
                  name="occupation"
                  placeholder="Software Engineer"
                  value={formData.occupation}
                  onChange={(v) => updateField('occupation', v)}
                />
                <FormField
                  label="Employer"
                  name="employer"
                  placeholder="Company Name"
                  value={formData.employer}
                  onChange={(v) => updateField('employer', v)}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <FormField
                  label="Annual Income"
                  name="annualIncome"
                  type="number"
                  placeholder="75000"
                  value={formData.annualIncome}
                  onChange={(v) => updateField('annualIncome', v)}
                  prefix="$"
                  hint="Approximate annual household income"
                />
              </div>
            </motion.div>

            {/* Lead Details */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Lead Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Product Interest"
                  name="productInterest"
                  options={productOptions}
                  value={formData.productInterest}
                  onChange={(v) => updateField('productInterest', v)}
                  error={errors.productInterest}
                  required
                  placeholder="Select a product"
                />
                <FormSelect
                  label="Lead Source"
                  name="leadSource"
                  options={sourceOptions}
                  value={formData.leadSource}
                  onChange={(v) => updateField('leadSource', v)}
                  placeholder="How did they find us?"
                />
                <FormField
                  label="Notes"
                  name="notes"
                  type="textarea"
                  placeholder="Additional information about this lead..."
                  value={formData.notes}
                  onChange={(v) => updateField('notes', v)}
                  rows={4}
                  className="md:col-span-2"
                />
              </div>
            </motion.div>
          </motion.div>
        </CardContent>

        <CardFooter className="border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 p-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {mode === 'create' ? 'Add Lead' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default LeadForm;
