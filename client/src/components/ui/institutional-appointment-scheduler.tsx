import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  Loader2,
  Video,
  PhoneCall,
  Building2,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { InstitutionalSecurityBadgesCompact } from "./institutional-security-badges";

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
];

const meetingTypes = [
  { id: "video", label: "Video Conference", icon: Video, description: "Zoom or Google Meet" },
  { id: "phone", label: "Phone Call", icon: PhoneCall, description: "We'll call you" },
  { id: "inperson", label: "In-Person", icon: Building2, description: "Naperville, IL office" }
];

interface FormData {
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  meetingType: string;
  topic: string;
  message: string;
}

export function InstitutionalAppointmentScheduler() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    title: "",
    organization: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    meetingType: "video",
    topic: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const getNextBusinessDays = () => {
    const days = [];
    const today = new Date();
    let count = 1; // Start from tomorrow

    while (days.length < 14) {
      const date = new Date(today);
      date.setDate(today.getDate() + count);
      const dayOfWeek = date.getDay();

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        });
      }
      count++;
    }
    return days;
  };

  const businessDays = getNextBusinessDays();

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ title: "Valid email is required", variant: "destructive" });
      return false;
    }
    if (!formData.date) {
      toast({ title: "Please select a date", variant: "destructive" });
      return false;
    }
    if (!formData.time) {
      toast({ title: "Please select a time", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/institutional/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          title: formData.title || null,
          organization: formData.organization || null,
          email: formData.email,
          phone: formData.phone || null,
          date: formData.date,
          time: formData.time,
          meetingType: formData.meetingType,
          topic: formData.topic || null,
          message: formData.message || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit meeting request");
      }

      setIsComplete(true);
      toast({
        title: "Meeting Request Submitted",
        description: "Our corporate team will confirm your meeting shortly.",
      });
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Please try again or email us directly at corporate@goldcoastfnl.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-border/60 p-8 rounded-sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-[hsl(348,65%,20%)]/5 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-[hsl(348,65%,25%)]" />
          </div>
          <h3 className="text-lg font-medium text-primary mb-2">
            Meeting Request Received
          </h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Your request for <strong>{formData.date}</strong> at <strong>{formData.time}</strong> has been submitted.
            Our corporate team will review and confirm within one business day.
          </p>
          <div className="bg-muted/30 rounded-sm p-4 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Meeting Type</p>
                <p className="text-primary font-medium">
                  {meetingTypes.find(t => t.id === formData.meetingType)?.label}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Confirmation To</p>
                <p className="text-primary font-medium truncate">{formData.email}</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsComplete(false);
              setFormData({
                name: "", title: "", organization: "", email: "", phone: "",
                date: "", time: "", meetingType: "video", topic: "", message: ""
              });
            }}
            className="text-sm"
          >
            Schedule Another Meeting
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-border/60 p-8 rounded-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meeting Type */}
        <div>
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 block">
            Meeting Format
          </Label>
          <RadioGroup
            value={formData.meetingType}
            onValueChange={(val) => updateField('meetingType', val)}
            className="grid grid-cols-3 gap-3"
          >
            {meetingTypes.map(type => (
              <div key={type.id}>
                <RadioGroupItem
                  value={type.id}
                  id={`inst-meeting-${type.id}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`inst-meeting-${type.id}`}
                  className="flex flex-col items-center justify-center rounded-sm border border-border/60 bg-white p-4 hover:bg-muted/30 peer-data-[state=checked]:border-[hsl(348,65%,25%)] peer-data-[state=checked]:bg-[hsl(348,65%,20%)]/5 cursor-pointer transition-all"
                >
                  <type.icon className="w-5 h-5 mb-2 text-primary" strokeWidth={1.5} />
                  <span className="font-medium text-xs text-primary">{type.label}</span>
                  <span className="text-[10px] text-muted-foreground">{type.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Date & Time */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Preferred Date
            </Label>
            <Select value={formData.date} onValueChange={(val) => updateField('date', val)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {businessDays.map(day => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Preferred Time (CT)
            </Label>
            <Select value={formData.time} onValueChange={(val) => updateField('time', val)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(slot => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Full Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="pl-10 bg-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Title
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Your title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Organization
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Company name"
                value={formData.organization}
                onChange={(e) => updateField('organization', e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="pl-10 bg-white"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Discussion Topic
            </Label>
            <Select value={formData.topic} onValueChange={(val) => updateField('topic', val)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                <SelectItem value="acquisition">Acquisition Discussion</SelectItem>
                <SelectItem value="investment">Investment Inquiry</SelectItem>
                <SelectItem value="strategic">Strategic Alliance</SelectItem>
                <SelectItem value="corporate">Corporate Development</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Additional Context
          </Label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Textarea
              placeholder="Please provide any relevant details about your organization and the nature of your inquiry..."
              value={formData.message}
              onChange={(e) => updateField('message', e.target.value)}
              className="pl-10 min-h-[100px] bg-white resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-[hsl(348,65%,20%)] hover:bg-[hsl(348,65%,25%)] text-white"
          disabled={isSubmitting || !formData.date || !formData.time}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting Request...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4 mr-2" />
              Request Meeting
            </>
          )}
        </Button>

        <InstitutionalSecurityBadgesCompact />
      </form>
    </motion.div>
  );
}
