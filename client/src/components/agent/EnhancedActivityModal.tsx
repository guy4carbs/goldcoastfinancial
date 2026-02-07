import { useState, useEffect } from "react";
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
import {
  Phone, Clock, ThumbsUp, ThumbsDown, Calendar,
  Voicemail, PhoneOff, Zap, AlertCircle, Mail,
  MessageSquare, Users, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead, ActivityLog } from "@/lib/agentStore";
import { useCelebration } from "@/lib/celebrationContext";

interface EnhancedActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  onLogActivity: (data: {
    type: ActivityLog['type'];
    disposition?: ActivityLog['disposition'];
    notes: string;
    nextFollowUpDate?: string;
    nextFollowUpType?: Lead['nextFollowUpType'];
  }) => void;
}

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'text', label: 'Text', icon: MessageSquare },
  { value: 'meeting', label: 'Meeting', icon: Users },
];

const DISPOSITIONS = [
  { value: 'interested', label: 'Interested', icon: ThumbsUp, color: 'text-emerald-600', requiresFollowUp: true },
  { value: 'callback', label: 'Callback Requested', icon: Calendar, color: 'text-primary', requiresFollowUp: true },
  { value: 'appointment_set', label: 'Appointment Set', icon: Calendar, color: 'text-violet-600', requiresFollowUp: true },
  { value: 'not_interested', label: 'Not Interested', icon: ThumbsDown, color: 'text-gray-500', requiresFollowUp: false },
  { value: 'no_answer', label: 'No Answer', icon: PhoneOff, color: 'text-amber-600', requiresFollowUp: true },
  { value: 'voicemail', label: 'Left Voicemail', icon: Voicemail, color: 'text-blue-600', requiresFollowUp: true },
];

const FOLLOW_UP_TYPES = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'text', label: 'Text', icon: MessageSquare },
  { value: 'meeting', label: 'Meeting', icon: Users },
];

const MIN_NOTES_LENGTH = 20;

export function EnhancedActivityModal({ open, onOpenChange, lead, onLogActivity }: EnhancedActivityModalProps) {
  const { showXP } = useCelebration();
  const [formData, setFormData] = useState({
    activityType: 'call' as ActivityLog['type'],
    duration: 5,
    disposition: '' as string,
    notes: '',
    nextFollowUpDate: '',
    nextFollowUpType: 'call' as Lead['nextFollowUpType'],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      // Set default follow-up to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      setFormData({
        activityType: 'call',
        duration: 5,
        disposition: '',
        notes: '',
        nextFollowUpDate: tomorrowStr,
        nextFollowUpType: 'call',
      });
      setErrors({});
      setTouched({});
    }
  }, [open]);

  const selectedDisposition = DISPOSITIONS.find(d => d.value === formData.disposition);
  const requiresFollowUp = selectedDisposition?.requiresFollowUp !== false;
  const isLeadClosed = ['closed', 'lost'].includes(lead.status);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.disposition) {
      newErrors.disposition = 'Select an outcome';
    }

    if (formData.notes.length < MIN_NOTES_LENGTH) {
      newErrors.notes = `Notes must be at least ${MIN_NOTES_LENGTH} characters (${formData.notes.length}/${MIN_NOTES_LENGTH})`;
    }

    if (requiresFollowUp && !isLeadClosed && !formData.nextFollowUpDate) {
      newErrors.nextFollowUpDate = 'Follow-up date is required';
    }

    if (formData.nextFollowUpDate) {
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

  const handleSubmit = () => {
    setTouched({ disposition: true, notes: true, nextFollowUpDate: true });

    if (!validate()) {
      return;
    }

    onLogActivity({
      type: formData.activityType,
      disposition: formData.disposition as ActivityLog['disposition'],
      notes: formData.notes,
      nextFollowUpDate: requiresFollowUp && !isLeadClosed ? formData.nextFollowUpDate : undefined,
      nextFollowUpType: requiresFollowUp && !isLeadClosed ? formData.nextFollowUpType : undefined,
    });

    // Show XP celebration - bonus for appointment set
    const xpAmount = formData.disposition === 'appointment_set' ? 30 : 20;
    showXP(xpAmount);

    onOpenChange(false);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            Log Activity for {lead.name}
          </DialogTitle>
          <DialogDescription>
            All fields marked with * are required. Detailed notes help track progress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto">
          {/* Activity Type */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Activity Type *</Label>
            <div className="flex gap-2">
              {ACTIVITY_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, activityType: type.value as ActivityLog['type'] })}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                      formData.activityType === type.value
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", formData.activityType === type.value ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration (for calls and meetings) */}
          {(formData.activityType === 'call' || formData.activityType === 'meeting') && (
            <div>
              <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                <Clock className="w-3 h-3" /> Duration (minutes)
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
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Outcome / Disposition */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Outcome *</Label>
            <div className="grid grid-cols-3 gap-2">
              {DISPOSITIONS.map((disp) => {
                const Icon = disp.icon;
                return (
                  <button
                    key={disp.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, disposition: disp.value });
                      setTouched(prev => ({ ...prev, disposition: true }));
                    }}
                    className={cn(
                      "p-3 rounded-lg border-2 text-center transition-all",
                      formData.disposition === disp.value
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 mx-auto mb-1", disp.color)} />
                    <span className="text-xs">{disp.label}</span>
                  </button>
                );
              })}
            </div>
            {touched.disposition && errors.disposition && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.disposition}
              </p>
            )}
          </div>

          {/* Notes - Required with minimum length */}
          <div>
            <Label htmlFor="notes" className="text-xs font-medium flex items-center gap-2">
              Notes *
              <span className={cn(
                "text-xs",
                formData.notes.length >= MIN_NOTES_LENGTH ? "text-emerald-600" : "text-muted-foreground"
              )}>
                ({formData.notes.length}/{MIN_NOTES_LENGTH} min)
              </span>
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              onBlur={() => handleBlur('notes')}
              placeholder="Describe what was discussed, client's concerns, next steps needed..."
              className={cn(
                "min-h-[100px] mt-1",
                touched.notes && errors.notes && "border-red-300 focus-visible:ring-red-500"
              )}
            />
            {touched.notes && errors.notes && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.notes}
              </p>
            )}
            {formData.notes.length >= MIN_NOTES_LENGTH && (
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Good notes help you and your team track progress
              </p>
            )}
          </div>

          {/* Follow-up section - Required for most dispositions */}
          {requiresFollowUp && !isLeadClosed && (
            <div className="bg-amber-50 rounded-lg p-4 space-y-3 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Schedule Next Follow-Up *</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="followUpDate" className="text-xs font-medium mb-1 block text-amber-800">Date</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={formData.nextFollowUpDate}
                    onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                    onBlur={() => handleBlur('nextFollowUpDate')}
                    min={new Date().toISOString().split('T')[0]}
                    className={cn(
                      "bg-white",
                      touched.nextFollowUpDate && errors.nextFollowUpDate && "border-red-300"
                    )}
                  />
                  {touched.nextFollowUpDate && errors.nextFollowUpDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.nextFollowUpDate}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-medium mb-1 block text-amber-800">Type</Label>
                  <Select
                    value={formData.nextFollowUpType}
                    onValueChange={(v) => setFormData({ ...formData, nextFollowUpType: v as Lead['nextFollowUpType'] })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOLLOW_UP_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick date buttons */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Tomorrow', days: 1 },
                  { label: 'In 2 days', days: 2 },
                  { label: 'Next week', days: 7 },
                  { label: 'In 2 weeks', days: 14 },
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
                        "text-xs px-2 py-1 rounded border transition-all",
                        formData.nextFollowUpDate === dateStr
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-amber-800 border-amber-300 hover:bg-amber-100"
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info for closed leads */}
          {isLeadClosed && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              This lead is marked as {lead.status}. No follow-up scheduling required.
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2 mr-auto text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-violet-600" />
            +{formData.disposition === 'appointment_set' ? 30 : 20} XP
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="gap-2 bg-primary hover:bg-primary/90"
            disabled={!formData.disposition || formData.notes.length < MIN_NOTES_LENGTH}
          >
            <CheckCircle2 className="w-4 h-4" />
            Log Activity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
