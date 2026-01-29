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

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent?: (event: EventData) => void;
  selectedDate?: Date | null;
  existingEvents?: EventData[];
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
  type: 'call' | 'meeting' | 'video';
  description?: string;
  status: 'upcoming' | 'completed';
  reminders?: EventReminder[];
  meetingNotes?: string;
  clientName?: string;
  clientPhone?: string;
}

const eventTypes = [
  { value: 'call', label: 'Phone Call', icon: Phone, color: 'bg-green-500/10 text-green-600 border-green-200' },
  { value: 'meeting', label: 'In-Person Meeting', icon: User, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { value: 'video', label: 'Video Call', icon: Video, color: 'bg-violet-500/10 text-violet-600 border-violet-200' },
];

const durationOptions = [
  { value: '15 min', label: '15 minutes' },
  { value: '30 min', label: '30 minutes' },
  { value: '45 min', label: '45 minutes' },
  { value: '1 hour', label: '1 hour' },
  { value: '1.5 hours', label: '1.5 hours' },
  { value: '2 hours', label: '2 hours' },
];

export function AddEventModal({ open, onOpenChange, onAddEvent, selectedDate, existingEvents = [] }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            Add Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Event Title */}
          <div>
            <Label className="text-xs">Event Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Client call with John Smith"
              className={cn("h-9", errors.title && 'border-red-500')}
            />
          </div>

          {/* Event Type */}
          <div>
            <Label className="text-xs">Event Type</Label>
            <div className="flex gap-2 mt-1">
              {eventTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as 'call' | 'meeting' | 'video' })}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all",
                      isSelected ? type.color + " border-current" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-medium">{type.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={cn("h-9", errors.date && 'border-red-500')}
              />
            </div>
            <div>
              <Label className="text-xs">Time *</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={cn("h-9", errors.time && 'border-red-500')}
              />
            </div>
          </div>

          {/* Duration & Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(v) => setFormData({ ...formData, duration: v })}
              >
                <SelectTrigger className="h-9">
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
              <Label className="text-xs">Reminder</Label>
              <Select
                value={formData.reminderMinutes.toString()}
                onValueChange={(v) => setFormData({ ...formData, reminderMinutes: parseInt(v) })}
              >
                <SelectTrigger className="h-9">
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
              <Label className="text-xs">Client Name (optional)</Label>
              <Input
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="John Smith"
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Client Phone (optional)</Label>
              <Input
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="(555) 123-4567"
                className="h-9"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any notes or details..."
              className="h-20 resize-none text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t mt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-9" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 h-9 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
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
