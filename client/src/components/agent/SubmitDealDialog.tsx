import { useState } from "react";
import { DollarSign, Loader2, Trophy, Building2, FileText, MapPin } from "lucide-react";
import { US_STATES } from "@/data/usStates";

const PRODUCT_TYPES = ['IUL', 'Whole Life', 'Term Life', 'Final Expense', 'Annuity'];
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RADIUS } from "@/lib/heritageDesignSystem";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CARRIERS = [
  'Pacific Life', 'MassMutual', 'Nationwide', 'Mutual of Omaha',
  'Transamerica', 'Banner Life', 'Athene', 'New York Life',
  'Protective Life', 'Prudential', 'MetLife', 'Lincoln Financial',
  'AIG', 'Foresters Financial', 'National Life Group', 'Americo',
  'North American', 'Global Atlantic', 'Corebridge Financial',
  'John Hancock', 'Securian Financial',
];

function formatCurrency(value: string | number): string {
  const raw = String(value).replace(/[^0-9.]/g, '');
  if (!raw) return '';
  const dotIdx = raw.indexOf('.');
  let cleaned = raw;
  if (dotIdx !== -1) {
    cleaned = raw.slice(0, dotIdx + 1) + raw.slice(dotIdx + 1).replace(/\./g, '');
  }
  const parts = cleaned.split('.');
  const whole = (parts[0] || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (cleaned.endsWith('.')) return `$${whole}.`;
  if (parts.length > 1) return `$${whole}.${parts[1].slice(0, 2)}`;
  return `$${whole}`;
}

function parseCurrency(value: string): number {
  const num = parseFloat(String(value).replace(/[$,\s]/g, ''));
  return isNaN(num) ? 0 : num;
}

interface SubmitDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmitDealDialog({ open, onOpenChange }: SubmitDealDialogProps) {
  const [premium, setPremium] = useState('');
  const [carrier, setCarrier] = useState('');
  const [productType, setProductType] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const monthlyVal = parseCurrency(premium);
  const annualPremium = monthlyVal * 12;

  const handleSubmit = async () => {
    if (!carrier) { toast.error('Select a carrier'); return; }
    if (!productType) { toast.error('Select a product type'); return; }
    if (!stateCode) { toast.error('Select a state'); return; }
    if (monthlyVal <= 0) { toast.error('Enter the monthly premium'); return; }

    setSubmitting(true);
    const savedClientName = clientName.trim();
    try {
      const res = await apiRequest("POST", "/api/deals", {
        carrier,
        productType,
        stateCode,
        monthlyPremium: monthlyVal,
        clientName: savedClientName || undefined,
      });
      const data = await res.json();

      toast.success(`Deal submitted! $${annualPremium.toLocaleString()} AP on ${carrier}`);

      // If client not in Book of Business, prompt to complete profile
      if (data.bobMatch === false && savedClientName) {
        setTimeout(() => {
          toast('New client — complete their profile', {
            description: `${savedClientName} needs a full profile in your Book of Business`,
            action: {
              label: 'Go to Book',
              onClick: () => { window.location.href = '/agents/book-of-business'; },
            },
            duration: 10000,
          });
        }, 1200);
      }

      // Refresh all data across the app
      queryClient.invalidateQueries();
      queryClient.refetchQueries();

      // Reset form
      setPremium('');
      setCarrier('');
      setProductType('');
      setStateCode('');
      setClientName('');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit deal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]" style={{ borderRadius: RADIUS.card }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-violet-600" />
            </div>
            Submit Deal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Monthly Premium */}
          <div>
            <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3" /> Monthly Premium *
            </Label>
            <Input
              value={premium}
              onChange={(e) => setPremium(formatCurrency(e.target.value))}
              placeholder="$150.00"
              className="h-10 text-base font-medium"
              style={{ borderRadius: RADIUS.input }}
            />
          </div>

          {/* AP Display */}
          {monthlyVal > 0 && (
            <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 text-center" style={{ borderRadius: RADIUS.button }}>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Annual Premium (AP)</p>
              <p className="text-white text-3xl font-bold mt-1">
                ${annualPremium.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
            </div>
          )}

          {/* Carrier */}
          <div>
            <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Building2 className="w-3 h-3" /> Carrier *
            </Label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                <SelectValue placeholder="Select carrier..." />
              </SelectTrigger>
              <SelectContent>
                {CARRIERS.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Type */}
          <div>
            <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <FileText className="w-3 h-3" /> Product Type *
            </Label>
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                <SelectValue placeholder="Select product type..." />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State */}
          <div>
            <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3" /> State *
            </Label>
            <Select value={stateCode} onValueChange={setStateCode}>
              <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                <SelectValue placeholder="Select state..." />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(s => (
                  <SelectItem key={s.code} value={s.code}>{s.code} — {s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Name (optional) */}
          <div>
            <Label className="text-xs text-gray-500 mb-1">Client Name (optional)</Label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="John Doe"
              className="h-9 text-sm"
              style={{ borderRadius: RADIUS.input }}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} style={{ borderRadius: RADIUS.button }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || monthlyVal <= 0 || !carrier || !productType || !stateCode}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-2"
            style={{ borderRadius: RADIUS.button }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
            {submitting ? 'Submitting...' : 'Submit Deal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
