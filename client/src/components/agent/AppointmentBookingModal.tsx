import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, Video, Phone, Users,
  X, Check, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAgentStore, type Lead, type Appointment } from "@/lib/agentStore";

interface AppointmentBookingModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
}

const APPOINTMENT_TYPES: { value: Appointment['type']; label: string; icon: typeof Phone; description: string }[] = [
  { value: 'call', label: 'Phone Call', icon: Phone, description: 'Quick phone consultation' },
  { value: 'video', label: 'Video Meeting', icon: Video, description: 'Face-to-face video call' },
  { value: 'in-person', label: 'In Person', icon: Users, description: 'Meet at office or client location' },
];

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
];

export function AppointmentBookingModal({ lead, isOpen, onClose }: AppointmentBookingModalProps) {
  const { scheduleAppointment } = useAgentStore();

  const [step, setStep] = useState<'type' | 'datetime' | 'details'>('type');
  const [appointmentType, setAppointmentType] = useState<Appointment['type']>('call');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [title, setTitle] = useState(`Appointment with ${lead.name}`);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) return;

    scheduleAppointment(lead.id, {
      date: selectedDate,
      time: selectedTime,
      type: appointmentType,
      title,
      notes: notes || undefined,
    });

    // Reset and close
    setStep('type');
    setAppointmentType('call');
    setSelectedDate('');
    setSelectedTime('');
    setTitle(`Appointment with ${lead.name}`);
    setNotes('');
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-md w-full shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Book Appointment</h2>
              <p className="text-sm text-gray-500">{lead.name} • {lead.product || 'Life Insurance'}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress */}
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              {['type', 'datetime', 'details'].map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                    step === s ? "bg-primary text-white" :
                    ['type', 'datetime', 'details'].indexOf(step) > i ? "bg-green-500 text-white" :
                    "bg-gray-200 text-gray-500"
                  )}>
                    {['type', 'datetime', 'details'].indexOf(step) > i ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  {i < 2 && <div className={cn(
                    "flex-1 h-0.5",
                    ['type', 'datetime', 'details'].indexOf(step) > i ? "bg-green-500" : "bg-gray-200"
                  )} />}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {step === 'type' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">Select appointment type:</p>
                {APPOINTMENT_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <motion.button
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setAppointmentType(type.value);
                        setStep('datetime');
                      }}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all",
                        appointmentType === type.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        appointmentType === type.value ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {step === 'datetime' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Select Date
                  </label>
                  <Input
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {TIME_SLOTS.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                          selectedTime === time
                            ? "bg-primary text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setStep('type')} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep('details')}
                    disabled={!selectedDate || !selectedTime}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {appointmentType === 'call' && <Phone className="w-5 h-5 text-primary" />}
                    {appointmentType === 'video' && <Video className="w-5 h-5 text-primary" />}
                    {appointmentType === 'in-person' && <MapPin className="w-5 h-5 text-primary" />}
                    <div>
                      <p className="font-medium text-sm">{APPOINTMENT_TYPES.find(t => t.value === appointmentType)?.label}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {selectedTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Title
                  </label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g., Policy Review Call"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add any preparation notes or agenda items..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setStep('datetime')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1">
                    <Check className="w-4 h-4 mr-1" />
                    Book Appointment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
