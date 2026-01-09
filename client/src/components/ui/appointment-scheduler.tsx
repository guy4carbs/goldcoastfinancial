import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  CheckCircle,
  Loader2,
  Video,
  PhoneCall,
  Coffee
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
];

const meetingTypes = [
  { id: "video", label: "Video Call", icon: Video, description: "Google Meet or Zoom" },
  { id: "phone", label: "Phone Call", icon: PhoneCall, description: "We'll call you" },
  { id: "inperson", label: "In-Person", icon: Coffee, description: "At our Naperville office" }
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  meetingType: string;
  topic: string;
  message: string;
}

export function AppointmentScheduler() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
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
    let count = 0;
    
    while (days.length < 10) {
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
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      toast({ title: "Valid phone number is required", variant: "destructive" });
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
      const response = await fetch('/api/meeting-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit meeting request');
      }

      setIsComplete(true);
      toast({
        title: "Meeting Confirmed!",
        description: "We've sent a confirmation to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again or call us directly.",
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
      <section className="py-16 md:py-24 bg-white" id="schedule">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-primary mb-4">
              Meeting Confirmed!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your meeting is scheduled for <strong>{formData.date}</strong> at <strong>{formData.time}</strong>.
              We've sent the details to <strong>{formData.email}</strong>.
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                {formData.meetingType === "video" && <Video className="w-4 h-4" />}
                {formData.meetingType === "phone" && <PhoneCall className="w-4 h-4" />}
                {formData.meetingType === "inperson" && <Coffee className="w-4 h-4" />}
                <span>
                  {formData.meetingType === "video" && "Video call link included in confirmation email"}
                  {formData.meetingType === "phone" && `We'll call you at ${formData.phone}`}
                  {formData.meetingType === "inperson" && "Visit us at 123 Main Street, Naperville, IL"}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsComplete(false);
                setFormData({
                  name: "", email: "", phone: "", date: "", time: "",
                  meetingType: "video", topic: "", message: ""
                });
              }}
              data-testid="button-schedule-another"
            >
              Schedule Another Meeting
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white" id="schedule">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-12 bg-secondary rounded-full" />
            <span className="text-secondary font-medium tracking-wide uppercase text-sm">Let's Connect</span>
            <div className="h-1 w-12 bg-secondary rounded-full" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary mb-4">
            Set Up a Meeting
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Insurance, partnerships, or new opportunities — pick a time and let's talk.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="max-w-3xl mx-auto shadow-xl">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">How would you like to meet?</Label>
                  <RadioGroup
                    value={formData.meetingType}
                    onValueChange={(val) => updateField('meetingType', val)}
                    className="grid grid-cols-3 gap-3"
                  >
                    {meetingTypes.map(type => (
                      <div key={type.id}>
                        <RadioGroupItem
                          value={type.id}
                          id={`meeting-${type.id}`}
                          className="peer sr-only"
                          data-testid={`radio-meeting-${type.id}`}
                        />
                        <Label
                          htmlFor={`meeting-${type.id}`}
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                          data-testid={`label-meeting-${type.id}`}
                        >
                          <type.icon className="w-6 h-6 mb-2 text-primary" />
                          <span className="font-medium text-sm">{type.label}</span>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appt-date">Preferred Date</Label>
                    <Select value={formData.date} onValueChange={(val) => updateField('date', val)}>
                      <SelectTrigger data-testid="select-appointment-date">
                        <SelectValue placeholder="Select a date" />
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
                    <Label htmlFor="appt-time">Preferred Time</Label>
                    <Select value={formData.time} onValueChange={(val) => updateField('time', val)}>
                      <SelectTrigger data-testid="select-appointment-time">
                        <SelectValue placeholder="Select a time" />
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appt-name">Your Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="appt-name"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="pl-10"
                        required
                        data-testid="input-appointment-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appt-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="appt-email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="pl-10"
                        required
                        data-testid="input-appointment-email"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appt-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="appt-phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="pl-10"
                        required
                        data-testid="input-appointment-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appt-topic">What would you like to discuss?</Label>
                    <Select value={formData.topic} onValueChange={(val) => updateField('topic', val)}>
                      <SelectTrigger data-testid="select-appointment-topic">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new-policy">Start a new policy</SelectItem>
                        <SelectItem value="review-coverage">Review my current coverage</SelectItem>
                        <SelectItem value="policy-changes">Make changes to my policy</SelectItem>
                        <SelectItem value="claims">Claims or beneficiary updates</SelectItem>
                        <SelectItem value="billing">Billing or payment questions</SelectItem>
                        <SelectItem value="term-life">Term life insurance</SelectItem>
                        <SelectItem value="whole-life">Whole life insurance</SelectItem>
                        <SelectItem value="iul">Indexed Universal Life (IUL)</SelectItem>
                        <SelectItem value="final-expense">Final expense insurance</SelectItem>
                        <SelectItem value="business-insurance">Business insurance needs</SelectItem>
                        <SelectItem value="partnership">Partnership or business opportunity</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appt-message">Tell us more about what you need</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="appt-message"
                      placeholder="Share any details that will help us prepare for your meeting - your goals, questions, or specific situations you'd like to discuss..."
                      value={formData.message}
                      onChange={(e) => updateField('message', e.target.value)}
                      className="pl-10 min-h-[100px]"
                      data-testid="input-appointment-message"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-secondary text-black hover:bg-secondary/90"
                  size="lg"
                  disabled={isSubmitting || !formData.date || !formData.time}
                  data-testid="button-schedule-appointment"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Confirm Meeting
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll send you a confirmation with all the details.
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
