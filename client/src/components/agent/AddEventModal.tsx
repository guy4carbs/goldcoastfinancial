import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Calendar, Phone, Video, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RADIUS } from "@/lib/heritageDesignSystem";

export interface EventPrefillData {
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  product?: string;
}

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent?: (event: EventData) => void;
  selectedDate?: Date | null;
  existingEvents?: EventData[];
  prefillData?: EventPrefillData | null;
}

export interface EventReminder {
  id: string;
  minutesBefore: number;
  notified: boolean;
}

export interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  type: 'call' | 'meeting' | 'video' | 'event' | 'training';
  description?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  reminders?: EventReminder[];
  meetingNotes?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  location?: string;
  meetingLink?: string;
  googleEventId?: string;
  caldavEventUid?: string;
  outlookEventId?: string;
  source?: 'local' | 'google' | 'caldav' | 'outlook';
}

const eventTypes = [
  { value: 'call', label: 'Phone', icon: Phone },
  { value: 'meeting', label: 'In-Person', icon: User },
  { value: 'video', label: 'Video', icon: Video },
];

const durationOptions = [
  { value: '15 min', label: '15 minutes' },
  { value: '30 min', label: '30 minutes' },
  { value: '45 min', label: '45 minutes' },
  { value: '1 hour', label: '1 hour' },
  { value: '1.5 hours', label: '1.5 hours' },
  { value: '2 hours', label: '2 hours' },
];

export function AddEventModal({ open, onOpenChange, onAddEvent, selectedDate, existingEvents = [], prefillData }: AddEventModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : today,
    time: '09:00',
    duration: '30 min',
    type: 'call' as 'call' | 'meeting' | 'video',
    description: '',
    clientName: '',
    clientPhone: '',
    reminderMinutes: 15,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update date when selectedDate changes
  useState(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0]
      }));
    }
  });

  // Pre-fill form when prefillData is provided and modal opens
  useEffect(() => {
    if (open && prefillData) {
      setFormData(prev => ({
        ...prev,
        title: prefillData.clientName ? `Call with ${prefillData.clientName}` : prev.title,
        clientName: prefillData.clientName || prev.clientName,
        clientPhone: prefillData.clientPhone || prev.clientPhone,
        description: [
          prefillData.clientEmail ? `Email: ${prefillData.clientEmail}` : '',
          prefillData.product ? `Product: ${prefillData.product}` : '',
        ].filter(Boolean).join('\n'),
        date: new Date().toISOString().split('T')[0],
      }));
    }
  }, [open, prefillData]);

  // Convert duration string to minutes
  const durationToMinutes = (duration: string): number => {
    if (duration.includes('hour')) {
      const hours = parseFloat(duration);
      return hours * 60;
    }
    return parseInt(duration);
  };

  // Parse time string to minutes from midnight
  const timeToMinutes = (timeStr: string): number => {
    // Handle both 24h (HH:MM) and 12h (H:MM AM/PM) formats
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hour = hours;
      if (period === 'PM' && hours !== 12) hour += 12;
      if (period === 'AM' && hours === 12) hour = 0;
      return hour * 60 + minutes;
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check for overlapping events
  const checkForOverlap = (): EventData | null => {
    const newStart = timeToMinutes(formData.time);
    const newDuration = durationToMinutes(formData.duration);
    const newEnd = newStart + newDuration;

    for (const event of existingEvents) {
      if (event.date !== formData.date) continue;

      const eventStart = timeToMinutes(event.time);
      const eventDuration = durationToMinutes(event.duration);
      const eventEnd = eventStart + eventDuration;

      // Check if times overlap
      if (newStart < eventEnd && newEnd > eventStart) {
        return event;
      }
    }
    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Required';
    if (!formData.date) newErrors.date = 'Required';
    if (!formData.time) newErrors.time = 'Required';

    // Check for overlapping events
    const overlappingEvent = checkForOverlap();
    if (overlappingEvent) {
      newErrors.time = `Conflicts with "${overlappingEvent.title}" at ${overlappingEvent.time}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate a brief delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));

    // Format time to 12-hour format
    const [hours, minutes] = formData.time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const formattedTime = `${hour12}:${minutes} ${ampm}`;

    const newEvent: EventData = {
      id: `event-${Date.now()}`,
      title: formData.title,
      date: formData.date,
      time: formattedTime,
      duration: formData.duration,
      type: formData.type,
      description: formData.description,
      status: 'upcoming',
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      reminders: formData.reminderMinutes > 0 ? [{
        id: `rem-${Date.now()}`,
        minutesBefore: formData.reminderMinutes,
        notified: false,
      }] : [],
    };

    onAddEvent?.(newEvent);

    // Reset form
    setFormData({
      title: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      time: '09:00',
      duration: '30 min',
      type: 'call',
      description: '',
      clientName: '',
      clientPhone: '',
      reminderMinutes: 15,
    });
    setErrors({});
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" style={{ borderRadius: RADIUS.card }}>
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-4 text-lg font-serif">
            <div
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
              style={{ borderRadius: RADIUS.button }}
            >
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Add Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2">
          {/* Event Title */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Event Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Client call with John Smith"
              className={cn("h-9", errors.title && 'border-red-500')}
              style={{ borderRadius: RADIUS.input }}
            />
          </div>

          {/* Event Type */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Event Type</Label>
            <div className="flex gap-2">
              {eventTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as 'call' | 'meeting' | 'video' })}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1.5 p-3 border-2 transition-all",
                      isSelected
                        ? "bg-violet-50 text-violet-700 border-violet-500"
                        : "border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-violet-50/50"
                    )}
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <Icon className={cn("w-5 h-5", isSelected && "text-violet-600")} />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={cn("h-9", errors.date && 'border-red-500')}
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Time *</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={cn("h-9", errors.time && 'border-red-500')}
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
          </div>

          {/* Duration & Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(v) => setFormData({ ...formData, duration: v })}
              >
                <SelectTrigger className="h-9" style={{ borderRadius: RADIUS.input }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Reminder</Label>
              <Select
                value={formData.reminderMinutes.toString()}
                onValueChange={(v) => setFormData({ ...formData, reminderMinutes: parseInt(v) })}
              >
                <SelectTrigger className="h-9" style={{ borderRadius: RADIUS.input }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No reminder</SelectItem>
                  <SelectItem value="5">5 min before</SelectItem>
                  <SelectItem value="15">15 min before</SelectItem>
                  <SelectItem value="30">30 min before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Info (optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Client Name (optional)</Label>
              <Input
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="John Smith"
                className="h-9"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Client Phone (optional)</Label>
              <Input
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="(555) 123-4567"
                className="h-9"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Notes (optional)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any notes or details..."
              className="min-h-[64px] resize-none text-sm"
              style={{ borderRadius: RADIUS.input }}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-9"
            disabled={isSubmitting}
            style={{ borderRadius: RADIUS.button }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 h-9 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90"
            disabled={isSubmitting}
            style={{ borderRadius: RADIUS.button }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Event'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
