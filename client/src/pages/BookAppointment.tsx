import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  Check,
  Shield,
  Star,
  MapPin,
  Mail,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Heritage brand colors
const gradientFrom = "#7c3aed"; // violet-600
const gradientTo = "#D4AF37"; // heritage gold
const logoUrl = "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface TimeSlot {
  time: string;
  available: boolean;
}

// Generate demo time slots
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const hours = [9, 10, 11, 13, 14, 15, 16];
  for (const hour of hours) {
    slots.push({ time: `${hour}:00`, available: Math.random() > 0.3 });
    slots.push({ time: `${hour}:30`, available: Math.random() > 0.3 });
  }
  return slots;
};

// Common first names for detection
const commonFirstNames = [
  'gaetano', 'john', 'jane', 'michael', 'sarah', 'david', 'jennifer', 'robert', 'maria',
  'james', 'mary', 'william', 'patricia', 'richard', 'linda', 'joseph', 'elizabeth',
  'thomas', 'barbara', 'charles', 'susan', 'christopher', 'jessica', 'daniel', 'karen',
  'matthew', 'nancy', 'anthony', 'betty', 'mark', 'margaret', 'donald', 'sandra',
  'steven', 'ashley', 'paul', 'dorothy', 'andrew', 'kimberly', 'joshua', 'emily',
  'kenneth', 'donna', 'kevin', 'michelle', 'brian', 'carol', 'george', 'amanda',
  'edward', 'melissa', 'ronald', 'deborah', 'timothy', 'stephanie', 'jason', 'rebecca',
  'jeffrey', 'laura', 'ryan', 'sharon', 'jacob', 'cynthia', 'gary', 'kathleen',
  'nicholas', 'amy', 'eric', 'angela', 'jonathan', 'shirley', 'stephen', 'anna',
  'larry', 'brenda', 'justin', 'pamela', 'scott', 'emma', 'brandon', 'nicole',
  'benjamin', 'helen', 'samuel', 'samantha', 'raymond', 'katherine', 'gregory', 'christine',
  'frank', 'debra', 'alexander', 'rachel', 'patrick', 'carolyn', 'raymond', 'janet',
  'jack', 'catherine', 'dennis', 'maria', 'jerry', 'heather', 'tyler', 'diane',
  'aaron', 'ruth', 'jose', 'julie', 'adam', 'olivia', 'nathan', 'joyce', 'henry', 'virginia',
  'douglas', 'victoria', 'zachary', 'kelly', 'peter', 'lauren', 'kyle', 'christina',
  'noah', 'joan', 'ethan', 'evelyn', 'jeremy', 'judith', 'walter', 'megan', 'christian',
  'andrea', 'keith', 'cheryl', 'roger', 'hannah', 'terry', 'jacqueline', 'austin', 'martha',
  'sean', 'gloria', 'gerald', 'teresa', 'carl', 'ann', 'harold', 'sara', 'dylan', 'madison',
  'arthur', 'frances', 'lawrence', 'kathryn', 'jordan', 'janice', 'jesse', 'jean', 'bryan',
  'abigail', 'billy', 'alice', 'bruce', 'judy', 'gabriel', 'sophia', 'joe', 'grace',
  'logan', 'denise', 'albert', 'amber', 'willie', 'doris', 'alan', 'marilyn', 'eugene',
  'danielle', 'vincent', 'beverly', 'russell', 'isabella', 'elijah', 'theresa', 'randy',
  'diana', 'philip', 'natalie', 'harry', 'brittany', 'vincent', 'charlotte', 'bobby', 'marie',
  'johnny', 'kayla', 'bradley', 'alexis', 'roy', 'lori', 'admin', 'test', 'demo'
];

// Parse agent slug to get name
const parseAgentSlug = (slug: string): { name: string; initials: string } => {
  // Remove "agent-" prefix if present
  const namePart = slug.replace(/^agent-/, '').toLowerCase();

  // Try to find a common first name at the beginning
  let firstName = '';
  let lastName = '';

  for (const name of commonFirstNames) {
    if (namePart.startsWith(name) && namePart.length > name.length) {
      firstName = name;
      lastName = namePart.slice(name.length);
      break;
    }
  }

  // If no match found, try to split by camelCase or just take first 5-6 chars as first name
  if (!firstName) {
    // Check for camelCase
    const camelMatch = namePart.match(/^([a-z]+)([A-Z][a-z]+.*)$/);
    if (camelMatch) {
      firstName = camelMatch[1];
      lastName = camelMatch[2].toLowerCase();
    } else if (namePart.length > 6) {
      // Heuristic: assume first 5-7 chars are first name
      firstName = namePart.slice(0, 6);
      lastName = namePart.slice(6);
    } else {
      firstName = namePart;
      lastName = '';
    }
  }

  // Capitalize first letter of each name part
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const fullName = lastName
    ? `${capitalize(firstName)} ${capitalize(lastName)}`
    : capitalize(firstName);

  const initials = lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : firstName.slice(0, 2).toUpperCase();

  return { name: fullName, initials };
};

const meetingTypes = [
  { id: 'video', label: 'Video Call', icon: Video, description: 'Meet via Zoom or Google Meet' },
  { id: 'call', label: 'Phone Call', icon: Phone, description: 'I\'ll call you directly' },
  { id: 'meeting', label: 'In-Person', icon: User, description: 'Meet at the office' },
];

const durations = [
  { value: '15', label: '15 min', description: 'Quick check-in' },
  { value: '30', label: '30 min', description: 'Standard consultation' },
  { value: '45', label: '45 min', description: 'Detailed discussion' },
  { value: '60', label: '1 hour', description: 'Comprehensive review' },
];

export default function BookAppointment() {
  const params = useParams();
  const agentSlug = params.agentSlug || 'agent';
  const { name: agentName, initials: agentInitials } = parseAgentSlug(agentSlug);

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('video');
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 26));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    smsConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots());
    }
  }, [selectedDate]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const isDateAvailable = (day: number) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    // Weekends not available
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    // Past dates not available
    const today = new Date(2026, 0, 26);
    if (date < today) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill in your name and email');
      return;
    }
    if (formData.phone.trim() && !formData.smsConsent) {
      toast.error('Please agree to the SMS consent to provide a phone number.');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentSlug: agentSlug.replace(/^agent-/, ''),
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          duration: selectedDuration,
          meetingType: selectedType,
          notes: formData.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to book appointment');
      }

      setIsBooked(true);
      toast.success('Appointment booked!', {
        description: `You'll receive a confirmation email shortly.`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to book appointment';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${minute} ${ampm}`;
  };

  if (isBooked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="p-8 text-center text-white" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CalendarCheck className="w-10 h-10" />
              </motion.div>
              <h1 className="text-2xl font-bold mb-2">Appointment Confirmed!</h1>
              <p className="text-white/80">You're all set to meet with {agentName}</p>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  <span className="font-medium">
                    {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-violet-600" />
                  <span className="font-medium">{selectedTime && formatTime(selectedTime)} ({selectedDuration} minutes)</span>
                </div>
                <div className="flex items-center gap-3">
                  {selectedType === 'video' && <Video className="w-5 h-5 text-violet-600" />}
                  {selectedType === 'call' && <Phone className="w-5 h-5 text-violet-600" />}
                  {selectedType === 'meeting' && <User className="w-5 h-5 text-violet-600" />}
                  <span className="font-medium">{meetingTypes.find(t => t.id === selectedType)?.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>Confirmation sent to {formData.email}</span>
              </div>
              <Button className="w-full" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }} onClick={() => window.close()}>
                Done
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50">
      {/* Header */}
      <div className="text-white py-8" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <img src={logoUrl} alt="Heritage Life Solutions" className="w-16 h-16 rounded-2xl shadow-lg object-cover" />
            <div>
              <h1 className="text-2xl font-bold">Book with {agentName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-white/90">5.0</span>
                </div>
                <Badge className="bg-white/20 text-white text-xs">Licensed Agent</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  step >= s ? "text-white" : "bg-gray-200 text-gray-500"
                )}
                style={step >= s ? { background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` } : {}}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn("w-12 h-1 mx-2 rounded", step <= s && "bg-gray-200")}
                  style={step > s ? { background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` } : {}}
                />
              )}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* Step 1: Select Date & Time */}
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <motion.div variants={fadeInUp}>
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <h2 className="font-semibold text-lg">{months[month]} {year}</h2>
                      <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {daysOfWeek.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, idx) => {
                        if (day === null) {
                          return <div key={`empty-${idx}`} className="aspect-square" />;
                        }
                        const date = new Date(year, month, day);
                        const available = isDateAvailable(day);
                        const isSelected = selectedDate?.toDateString() === date.toDateString();

                        return (
                          <button
                            key={day}
                            onClick={() => available && setSelectedDate(date)}
                            disabled={!available}
                            className={cn(
                              "aspect-square rounded-lg text-sm font-medium transition-all",
                              available
                                ? "hover:bg-violet-100 cursor-pointer"
                                : "text-gray-300 cursor-not-allowed",
                              isSelected && "text-white"
                            )}
                            style={isSelected ? { background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` } : {}}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Time Slots */}
              <motion.div variants={fadeInUp}>
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h2 className="font-semibold text-lg mb-4">
                      {selectedDate
                        ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                        : 'Select a date'
                      }
                    </h2>

                    {selectedDate ? (
                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={cn(
                              "p-3 rounded-lg text-sm font-medium transition-all border",
                              slot.available
                                ? selectedTime === slot.time
                                  ? "text-white border-transparent"
                                  : "border-gray-200 hover:border-violet-500 hover:bg-violet-50"
                                : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                            )}
                            style={slot.available && selectedTime === slot.time ? { background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` } : {}}
                          >
                            {formatTime(slot.time)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Please select a date to see available times</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedDate && selectedTime && (
                  <Button
                    className="w-full mt-4 text-white"
                    style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </Button>
                )}
              </motion.div>
            </div>
          )}

          {/* Step 2: Meeting Type */}
          {step === 2 && (
            <div className="max-w-xl mx-auto space-y-6">
              <motion.div variants={fadeInUp}>
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h2 className="font-semibold text-lg mb-4">How would you like to meet?</h2>
                    <div className="space-y-3">
                      {meetingTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={cn(
                              "w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left",
                              selectedType === type.id
                                ? "border-violet-500 bg-violet-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <div
                              className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                selectedType !== type.id && "bg-gray-100 text-gray-600"
                              )}
                              style={selectedType === type.id ? { background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`, color: 'white' } : {}}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-medium">{type.label}</p>
                              <p className="text-sm text-gray-500">{type.description}</p>
                            </div>
                            {selectedType === type.id && (
                              <Check className="w-5 h-5 text-violet-500 ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h2 className="font-semibold text-lg mb-4">Meeting Duration</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {durations.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setSelectedDuration(d.value)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-center",
                            selectedDuration === d.value
                              ? "border-violet-500 bg-violet-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <p className="font-semibold text-lg">{d.label}</p>
                          <p className="text-xs text-gray-500">{d.description}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  className="flex-1 text-white"
                  style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Your Details */}
          {step === 3 && (
            <div className="max-w-xl mx-auto space-y-6">
              <motion.div variants={fadeInUp}>
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="font-semibold text-lg mb-2">Your Details</h2>

                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.smsConsent || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, smsConsent: e.target.checked }))}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-xs text-gray-500 leading-relaxed">
                          By checking this box, I agree to receive SMS messages from Gold Coast Financial Partners LLC including appointment reminders, application updates, and verification codes. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out or HELP for help.
                        </span>
                      </label>
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="What would you like to discuss? Any specific questions or topics?"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Summary */}
              <motion.div variants={fadeInUp}>
                <Card className="border-0 shadow-xl bg-gradient-to-r from-violet-50 to-amber-50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      Appointment Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{selectedTime && formatTime(selectedTime)} ({selectedDuration} minutes)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedType === 'video' && <Video className="w-4 h-4 text-gray-500" />}
                        {selectedType === 'call' && <Phone className="w-4 h-4 text-gray-500" />}
                        {selectedType === 'meeting' && <User className="w-4 h-4 text-gray-500" />}
                        <span>{meetingTypes.find(t => t.id === selectedType)?.label}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  className="flex-1 text-white"
                  style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Your information is secure and encrypted</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
