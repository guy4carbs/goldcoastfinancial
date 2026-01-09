import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Phone, Clock, User, ThumbsUp, ThumbsDown, 
  Calendar, Voicemail, PhoneOff, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/agentStore";

interface LogCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: Lead[];
  onLogCall: (data: {
    leadId?: string;
    duration: number;
    disposition: string;
    notes: string;
  }) => void;
}

const DISPOSITIONS = [
  { value: 'interested', label: 'Interested', icon: ThumbsUp, color: 'text-secondary' },
  { value: 'callback', label: 'Callback', icon: Calendar, color: 'text-primary' },
  { value: 'appointment_set', label: 'Appointment Set', icon: Calendar, color: 'text-secondary' },
  { value: 'not_interested', label: 'Not Interested', icon: ThumbsDown, color: 'text-muted-foreground' },
  { value: 'no_answer', label: 'No Answer', icon: PhoneOff, color: 'text-muted-foreground' },
  { value: 'voicemail', label: 'Voicemail', icon: Voicemail, color: 'text-muted-foreground' },
];

export function LogCallModal({ open, onOpenChange, leads, onLogCall }: LogCallModalProps) {
  const [formData, setFormData] = useState({
    leadId: '',
    duration: 5,
    disposition: 'interested',
    notes: '',
    newContactName: '',
    newContactPhone: '',
  });

  const [contactType, setContactType] = useState<'existing' | 'new'>('existing');

  const handleSubmit = () => {
    onLogCall({
      leadId: contactType === 'existing' ? formData.leadId : undefined,
      duration: formData.duration,
      disposition: formData.disposition,
      notes: formData.notes,
    });
    
    setFormData({
      leadId: '',
      duration: 5,
      disposition: 'interested',
      notes: '',
      newContactName: '',
      newContactPhone: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            Log a Call
          </DialogTitle>
          <DialogDescription>
            Track your calls to earn XP and maintain your streak.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs font-medium mb-2 block">Contact</Label>
            <RadioGroup 
              value={contactType} 
              onValueChange={(v) => setContactType(v as 'existing' | 'new')}
              className="flex gap-3 mb-3"
            >
              <div className="flex-1">
                <RadioGroupItem value="existing" id="existing" className="peer sr-only" />
                <Label
                  htmlFor="existing"
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    contactType === 'existing'
                      ? "border-secondary bg-secondary/10"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <User className="w-4 h-4" />
                  Existing Lead
                </Label>
              </div>
              <div className="flex-1">
                <RadioGroupItem value="new" id="new" className="peer sr-only" />
                <Label
                  htmlFor="new"
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    contactType === 'new'
                      ? "border-secondary bg-secondary/10"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <Phone className="w-4 h-4" />
                  New Contact
                </Label>
              </div>
            </RadioGroup>

            {contactType === 'existing' ? (
              <Select value={formData.leadId} onValueChange={(v) => setFormData({ ...formData, leadId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      <div className="flex items-center gap-2">
                        <span>{lead.name}</span>
                        <span className="text-xs text-muted-foreground">{lead.phone}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Contact name"
                  value={formData.newContactName}
                  onChange={(e) => setFormData({ ...formData, newContactName: e.target.value })}
                />
                <Input
                  placeholder="Phone number"
                  value={formData.newContactPhone}
                  onChange={(e) => setFormData({ ...formData, newContactPhone: e.target.value })}
                />
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium flex items-center gap-1 mb-2">
              <Clock className="w-3 h-3" /> Call Duration (minutes)
            </Label>
            <div className="flex gap-2">
              {[1, 3, 5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setFormData({ ...formData, duration: mins })}
                  className={cn(
                    "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                    formData.duration === mins
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium mb-2 block">Outcome</Label>
            <div className="grid grid-cols-3 gap-2">
              {DISPOSITIONS.map((disp) => {
                const Icon = disp.icon;
                return (
                  <button
                    key={disp.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, disposition: disp.value })}
                    className={cn(
                      "p-3 rounded-lg border-2 text-center transition-all",
                      formData.disposition === disp.value
                        ? "border-secondary bg-secondary/10"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 mx-auto mb-1", disp.color)} />
                    <span className="text-xs">{disp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-xs font-medium">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Key points from the call..."
              className="min-h-[80px] mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2 mr-auto text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-secondary" />
            +10 XP
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2 bg-primary hover:bg-primary/90">
            <Phone className="w-4 h-4" />
            Log Call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
