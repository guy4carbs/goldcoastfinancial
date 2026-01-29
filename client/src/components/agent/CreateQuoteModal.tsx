import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, DollarSign, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateQuote?: (quote: QuoteData) => void;
}

interface QuoteData {
  clientName: string;
  product: string;
  carrier: string;
  coverageAmount: string;
  premium: string;
  healthClass: string;
}

const productOptions = [
  { value: 'term-10', label: '10-Year Term' },
  { value: 'term-20', label: '20-Year Term' },
  { value: 'term-30', label: '30-Year Term' },
  { value: 'whole-life', label: 'Whole Life' },
  { value: 'iul', label: 'IUL' },
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
  { value: '50000', label: '$50K' },
  { value: '100000', label: '$100K' },
  { value: '250000', label: '$250K' },
  { value: '500000', label: '$500K' },
  { value: '1000000', label: '$1M' },
];

const healthClassOptions = [
  { value: 'preferred-plus', label: 'Preferred+' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'standard-plus', label: 'Standard+' },
  { value: 'standard', label: 'Standard' },
];

export function CreateQuoteModal({ open, onOpenChange, onCreateQuote }: CreateQuoteModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    birthday: '',
    product: '',
    carrier: '',
    coverageAmount: '',
    healthClass: 'standard',
    heightFeet: '',
    heightInches: '',
    weight: '',
  });

  const [calculatedPremium, setCalculatedPremium] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculatePremium = () => {
    const coverage = parseInt(formData.coverageAmount) || 0;
    const baseRate = 0.0001;

    let multiplier = 1;
    if (formData.product.includes('whole')) multiplier = 2.5;
    else if (formData.product.includes('iul')) multiplier = 2;
    else if (formData.product === 'final-expense') multiplier = 3;

    if (formData.healthClass === 'preferred-plus') multiplier *= 0.8;
    else if (formData.healthClass === 'preferred') multiplier *= 0.9;
    else if (formData.healthClass === 'standard-plus') multiplier *= 0.95;

    const monthly = Math.round(coverage * baseRate * multiplier);
    setCalculatedPremium(`$${monthly}/mo`);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientName.trim()) newErrors.clientName = 'Required';
    if (!formData.product) newErrors.product = 'Required';
    if (!formData.carrier) newErrors.carrier = 'Required';
    if (!formData.coverageAmount) newErrors.coverageAmount = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const premium = calculatedPremium || '$0/mo';
    const coverageLabel = coverageOptions.find(c => c.value === formData.coverageAmount)?.label
      || `$${parseInt(formData.coverageAmount).toLocaleString()}`;

    onCreateQuote?.({
      clientName: formData.clientName,
      product: productOptions.find(p => p.value === formData.product)?.label || formData.product,
      carrier: carrierOptions.find(c => c.value === formData.carrier)?.label || formData.carrier,
      coverageAmount: coverageLabel,
      premium,
      healthClass: formData.healthClass,
    });

    setFormData({
      clientName: '',
      birthday: '',
      product: '',
      carrier: '',
      coverageAmount: '',
      healthClass: 'standard',
      heightFeet: '',
      heightInches: '',
      weight: '',
    });
    setCalculatedPremium(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            New Quote
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Client Name & Birthday Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Client Name *</Label>
              <Input
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="John Smith"
                className={cn("h-9", errors.clientName && 'border-red-500')}
              />
            </div>
            <div>
              <Label className="text-xs">Date of Birth</Label>
              <Input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="h-9"
              />
            </div>
          </div>

          {/* Product & Carrier Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Product *</Label>
              <Select
                value={formData.product}
                onValueChange={(v) => {
                  setFormData({ ...formData, product: v });
                  setCalculatedPremium(null);
                }}
              >
                <SelectTrigger className={cn("h-9", errors.product && 'border-red-500')}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {productOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Carrier *</Label>
              <Select
                value={formData.carrier}
                onValueChange={(v) => setFormData({ ...formData, carrier: v })}
              >
                <SelectTrigger className={cn("h-9", errors.carrier && 'border-red-500')}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {carrierOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Height & Weight Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Height (ft)</Label>
              <Input
                type="number"
                min="3"
                max="8"
                value={formData.heightFeet}
                onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })}
                placeholder="5"
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Height (in)</Label>
              <Input
                type="number"
                min="0"
                max="11"
                value={formData.heightInches}
                onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })}
                placeholder="10"
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Weight (lbs)</Label>
              <Input
                type="number"
                min="50"
                max="500"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="175"
                className="h-9"
              />
            </div>
          </div>

          {/* Coverage Amount */}
          <div>
            <Label className="text-xs">Coverage Amount *</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {coverageOptions.map((c) => (
                <Button
                  key={c.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({ ...formData, coverageAmount: c.value });
                    setCalculatedPremium(null);
                  }}
                  className={cn(
                    "h-7 px-2 text-xs",
                    formData.coverageAmount === c.value && "bg-primary text-white border-primary hover:bg-primary/90 hover:text-white"
                  )}
                >
                  {c.label}
                </Button>
              ))}
            </div>
            <div className="relative mt-1.5">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                type="text"
                placeholder="Custom amount"
                value={formData.coverageAmount && !coverageOptions.find(co => co.value === formData.coverageAmount) ? formData.coverageAmount : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, coverageAmount: value });
                  setCalculatedPremium(null);
                }}
                className={cn("h-9 pl-7 text-sm", errors.coverageAmount && 'border-red-500')}
              />
            </div>
          </div>

          {/* Health Class */}
          <div>
            <Label className="text-xs">Health Class</Label>
            <div className="flex gap-1.5 mt-1">
              {healthClassOptions.map((hc) => (
                <Button
                  key={hc.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({ ...formData, healthClass: hc.value });
                    setCalculatedPremium(null);
                  }}
                  className={cn(
                    "h-7 px-2 text-xs flex-1",
                    formData.healthClass === hc.value && "bg-primary text-white border-primary hover:bg-primary/90 hover:text-white"
                  )}
                >
                  {hc.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Calculate & Result */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={calculatePremium}
              disabled={!formData.product || !formData.coverageAmount}
              className="h-8 gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              Calculate
            </Button>
            {calculatedPremium && (
              <Badge className="bg-emerald-600 text-white px-3 py-1">
                {calculatedPremium}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t mt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-9">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 h-9 bg-primary hover:bg-primary/90">
            Create Quote
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
