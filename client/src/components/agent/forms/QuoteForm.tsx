import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, DollarSign, User, Heart, Shield, Calendar,
  Save, X, Loader2, Calculator, ChevronRight, Info,
  Sparkles, Building, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField, FormSelect } from "./FormField";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export interface QuoteFormData {
  leadId: string;
  leadName: string;
  productType: string;
  carrier: string;
  coverageAmount: string;
  termLength: string;
  monthlyPremium: string;
  annualPremium: string;
  healthClass: string;
  smokerStatus: 'non-smoker' | 'smoker';
  riders: string[];
  notes: string;
  validUntil: string;
}

interface QuoteFormProps {
  initialData?: Partial<QuoteFormData>;
  onSubmit?: (data: QuoteFormData) => void;
  onCancel?: () => void;
  onCalculate?: (data: Partial<QuoteFormData>) => void;
  isLoading?: boolean;
  isCalculating?: boolean;
  className?: string;
}

const productOptions = [
  { value: 'term-10', label: '10-Year Term Life' },
  { value: 'term-20', label: '20-Year Term Life' },
  { value: 'term-30', label: '30-Year Term Life' },
  { value: 'whole-life', label: 'Whole Life Insurance' },
  { value: 'universal-life', label: 'Universal Life' },
  { value: 'final-expense', label: 'Final Expense' },
];

const carrierOptions = [
  { value: 'mutual-omaha', label: 'Mutual of Omaha' },
  { value: 'american-national', label: 'American National' },
  { value: 'transamerica', label: 'Transamerica' },
  { value: 'prudential', label: 'Prudential' },
  { value: 'aig', label: 'AIG' },
  { value: 'lincoln-financial', label: 'Lincoln Financial' },
];

const coverageOptions = [
  { value: '50000', label: '$50,000' },
  { value: '100000', label: '$100,000' },
  { value: '250000', label: '$250,000' },
  { value: '500000', label: '$500,000' },
  { value: '750000', label: '$750,000' },
  { value: '1000000', label: '$1,000,000' },
];

const healthClassOptions = [
  { value: 'preferred-plus', label: 'Preferred Plus' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'standard-plus', label: 'Standard Plus' },
  { value: 'standard', label: 'Standard' },
  { value: 'substandard', label: 'Substandard' },
];

const riderOptions = [
  { value: 'waiver-premium', label: 'Waiver of Premium', price: 5 },
  { value: 'accidental-death', label: 'Accidental Death Benefit', price: 8 },
  { value: 'child-rider', label: 'Child Term Rider', price: 10 },
  { value: 'chronic-illness', label: 'Chronic Illness Rider', price: 12 },
  { value: 'return-premium', label: 'Return of Premium', price: 25 },
];

const initialFormData: QuoteFormData = {
  leadId: '',
  leadName: '',
  productType: '',
  carrier: '',
  coverageAmount: '',
  termLength: '20',
  monthlyPremium: '',
  annualPremium: '',
  healthClass: 'standard',
  smokerStatus: 'non-smoker',
  riders: [],
  notes: '',
  validUntil: '',
};

export function QuoteForm({
  initialData,
  onSubmit,
  onCancel,
  onCalculate,
  isLoading = false,
  isCalculating = false,
  className,
}: QuoteFormProps) {
  const [formData, setFormData] = useState<QuoteFormData>({
    ...initialFormData,
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof QuoteFormData, string>>>({});
  const [showRiders, setShowRiders] = useState(false);

  const updateField = (field: keyof QuoteFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleRider = (riderId: string) => {
    setFormData(prev => ({
      ...prev,
      riders: prev.riders.includes(riderId)
        ? prev.riders.filter(r => r !== riderId)
        : [...prev.riders, riderId]
    }));
  };

  const selectedRidersTotal = useMemo(() => {
    return formData.riders.reduce((total, riderId) => {
      const rider = riderOptions.find(r => r.value === riderId);
      return total + (rider?.price || 0);
    }, 0);
  }, [formData.riders]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof QuoteFormData, string>> = {};

    if (!formData.productType) {
      newErrors.productType = 'Please select a product';
    }

    if (!formData.carrier) {
      newErrors.carrier = 'Please select a carrier';
    }

    if (!formData.coverageAmount) {
      newErrors.coverageAmount = 'Please select coverage amount';
    }

    if (!formData.monthlyPremium) {
      newErrors.monthlyPremium = 'Please calculate or enter premium';
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

  const handleCalculate = () => {
    onCalculate?.(formData);
  };

  return (
    <Card className={cn("border-gray-100 overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-[#E1B138]/10 to-transparent border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E1B138] flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-primary">Create Quote</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Generate a personalized insurance quote
              </p>
            </div>
          </div>
          <Badge className="bg-[#E1B138]/10 text-[#E1B138] text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            +50 XP
          </Badge>
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
            {/* Lead Info */}
            {formData.leadName && (
              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                  {formData.leadName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-primary">{formData.leadName}</p>
                  <p className="text-xs text-gray-500">Quote for this lead</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            )}

            {/* Product Selection */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Product Selection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Product Type"
                  name="productType"
                  options={productOptions}
                  value={formData.productType}
                  onChange={(v) => updateField('productType', v)}
                  error={errors.productType}
                  required
                  placeholder="Select product"
                />
                <FormSelect
                  label="Carrier"
                  name="carrier"
                  options={carrierOptions}
                  value={formData.carrier}
                  onChange={(v) => updateField('carrier', v)}
                  error={errors.carrier}
                  required
                  placeholder="Select carrier"
                />
              </div>
            </motion.div>

            {/* Coverage Details */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Coverage Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Coverage Amount"
                  name="coverageAmount"
                  options={coverageOptions}
                  value={formData.coverageAmount}
                  onChange={(v) => updateField('coverageAmount', v)}
                  error={errors.coverageAmount}
                  required
                  placeholder="Select amount"
                />
                <FormSelect
                  label="Health Classification"
                  name="healthClass"
                  options={healthClassOptions}
                  value={formData.healthClass}
                  onChange={(v) => updateField('healthClass', v)}
                  placeholder="Select class"
                />
              </div>
            </motion.div>

            {/* Health Status */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Health Status
              </h3>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateField('smokerStatus', 'non-smoker')}
                  className={cn(
                    "flex-1 p-4 rounded-xl border-2 transition-all",
                    formData.smokerStatus === 'non-smoker'
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  <div className="text-2xl mb-1">🚭</div>
                  <p className="font-medium">Non-Smoker</p>
                  <p className="text-xs mt-1 opacity-70">Lower premiums</p>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('smokerStatus', 'smoker')}
                  className={cn(
                    "flex-1 p-4 rounded-xl border-2 transition-all",
                    formData.smokerStatus === 'smoker'
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  <div className="text-2xl mb-1">🚬</div>
                  <p className="font-medium">Smoker</p>
                  <p className="text-xs mt-1 opacity-70">Higher premiums</p>
                </button>
              </div>
            </motion.div>

            {/* Optional Riders */}
            <motion.div variants={fadeInUp}>
              <button
                type="button"
                onClick={() => setShowRiders(!showRiders)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-primary">Optional Riders</p>
                    <p className="text-xs text-gray-500">
                      {formData.riders.length > 0
                        ? `${formData.riders.length} selected (+$${selectedRidersTotal}/mo)`
                        : 'Add additional coverage options'}
                    </p>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "w-5 h-5 text-gray-400 transition-transform",
                  showRiders && "rotate-90"
                )} />
              </button>

              <AnimatePresence>
                {showRiders && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-2">
                      {riderOptions.map((rider) => {
                        const isSelected = formData.riders.includes(rider.value);

                        return (
                          <button
                            key={rider.value}
                            type="button"
                            onClick={() => toggleRider(rider.value)}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                              isSelected
                                ? "border-violet-500 bg-violet-500/5"
                                : "border-gray-100 hover:border-gray-200"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                isSelected
                                  ? "border-violet-500 bg-violet-500"
                                  : "border-gray-300"
                              )}>
                                {isSelected && (
                                  <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </motion.svg>
                                )}
                              </div>
                              <span className={cn(
                                "text-sm",
                                isSelected ? "text-primary font-medium" : "text-gray-600"
                              )}>
                                {rider.label}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              +${rider.price}/mo
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Premium Calculation */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Premium
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField
                  label="Monthly Premium"
                  name="monthlyPremium"
                  type="number"
                  placeholder="0.00"
                  value={formData.monthlyPremium}
                  onChange={(v) => updateField('monthlyPremium', v)}
                  error={errors.monthlyPremium}
                  prefix="$"
                  required
                />
                <FormField
                  label="Annual Premium"
                  name="annualPremium"
                  type="number"
                  placeholder="0.00"
                  value={formData.annualPremium}
                  onChange={(v) => updateField('annualPremium', v)}
                  prefix="$"
                />
                <FormField
                  label="Valid Until"
                  name="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(v) => updateField('validUntil', v)}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>

              {onCalculate && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCalculate}
                  disabled={isCalculating || !formData.productType || !formData.coverageAmount}
                  className="w-full gap-2 border-violet-500 text-violet-500 hover:bg-violet-500/10"
                >
                  {isCalculating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calculator className="w-4 h-4" />
                  )}
                  Calculate Premium
                </Button>
              )}
            </motion.div>

            {/* Notes */}
            <motion.div variants={fadeInUp}>
              <FormField
                label="Quote Notes"
                name="notes"
                type="textarea"
                placeholder="Any special considerations or notes..."
                value={formData.notes}
                onChange={(v) => updateField('notes', v)}
                rows={3}
              />
            </motion.div>
          </motion.div>
        </CardContent>

        <CardFooter className="border-t border-gray-100 bg-gray-50/50 flex justify-between items-center p-4">
          <div className="flex items-center gap-2 text-sm">
            {formData.monthlyPremium && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E1B138]/10"
              >
                <DollarSign className="w-4 h-4 text-[#E1B138]" />
                <span className="font-bold text-[#E1B138]">
                  ${Number(formData.monthlyPremium).toFixed(2)}/mo
                </span>
              </motion.div>
            )}
          </div>

          <div className="flex gap-3">
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
              Save Quote
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default QuoteForm;
