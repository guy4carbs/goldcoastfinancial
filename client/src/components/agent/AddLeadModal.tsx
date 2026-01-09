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
import { UserPlus, User, Mail, Phone, MapPin, FileText, Sparkles } from "lucide-react";
import type { Lead } from "@/lib/agentStore";

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLead: (lead: Omit<Lead, 'id' | 'createdDate' | 'notes' | 'assignedTo'>) => void;
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

export function AddLeadModal({ open, onOpenChange, onAddLead }: AddLeadModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    product: '',
    source: 'Website',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    onAddLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      state: formData.state,
      product: formData.product,
      source: formData.source,
      status: 'new',
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      state: '',
      product: '',
      source: 'Website',
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-secondary" />
            </div>
            Add New Lead
          </DialogTitle>
          <DialogDescription>
            Enter the lead's information to add them to your pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name" className="text-xs font-medium flex items-center gap-1">
                <User className="w-3 h-3" /> Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label className="text-xs font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" /> State
              </Label>
              <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
                <SelectTrigger>
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
              <Label className="text-xs font-medium flex items-center gap-1">
                <FileText className="w-3 h-3" /> Product Interest
              </Label>
              <Select value={formData.product} onValueChange={(v) => setFormData({ ...formData, product: v })}>
                <SelectTrigger>
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
              <Label className="text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Lead Source
              </Label>
              <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                <SelectTrigger>
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
              <Label htmlFor="notes" className="text-xs font-medium">Initial Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information about this lead..."
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2 bg-secondary hover:bg-secondary/90">
            <UserPlus className="w-4 h-4" />
            Add Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
