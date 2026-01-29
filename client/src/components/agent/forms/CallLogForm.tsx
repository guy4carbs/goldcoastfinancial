import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone, Clock, User, Calendar, MessageSquare, Save, X,
  Loader2, CheckCircle, XCircle, PhoneMissed, PhoneOff,
  Timer, Zap, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField, FormSelect } from "./FormField";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export interface CallLogFormData {
  leadId: string;
  leadName: string;
  callType: 'outbound' | 'inbound';
  outcome: 'connected' | 'voicemail' | 'no-answer' | 'busy' | 'wrong-number';
  duration: string;
  date: string;
  time: string;
  notes: string;
  followUpDate: string;
  followUpAction: string;
}

interface CallLogFormProps {
  initialData?: Partial<CallLogFormData>;
  onSubmit?: (data: CallLogFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

const outcomeOptions = [
  { value: 'connected', label: 'Connected - Spoke with Lead' },
  { value: 'voicemail', label: 'Left Voicemail' },
  { value: 'no-answer', label: 'No Answer' },
  { value: 'busy', label: 'Busy Signal' },
  { value: 'wrong-number', label: 'Wrong Number' },
];

const followUpOptions = [
  { value: 'call-back', label: 'Call Back' },
  { value: 'send-email', label: 'Send Email' },
  { value: 'send-quote', label: 'Send Quote' },
  { value: 'schedule-meeting', label: 'Schedule Meeting' },
  { value: 'no-follow-up', label: 'No Follow-up Needed' },
];

const outcomeIcons = {
  'connected': { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  'voicemail': { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  'no-answer': { icon: PhoneMissed, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  'busy': { icon: PhoneOff, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  'wrong-number': { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

const now = new Date();
const defaultDate = now.toISOString().split('T')[0];
const defaultTime = now.toTimeString().slice(0, 5);

const initialFormData: CallLogFormData = {
  leadId: '',
  leadName: '',
  callType: 'outbound',
  outcome: 'connected',
  duration: '',
  date: defaultDate,
  time: defaultTime,
  notes: '',
  followUpDate: '',
  followUpAction: '',
};

export function CallLogForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: CallLogFormProps) {
  const [formData, setFormData] = useState<CallLogFormData>({
    ...initialFormData,
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CallLogFormData, string>>>({});

  const updateField = (field: keyof CallLogFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CallLogFormData, string>> = {};

    if (!formData.outcome) {
      newErrors.outcome = 'Please select an outcome';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.outcome === 'connected' && !formData.duration) {
      newErrors.duration = 'Please enter call duration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const OutcomeIcon = formData.outcome ? outcomeIcons[formData.outcome] : null;

  return (
    <Card className={cn("border-gray-100 overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-primary">Log Call</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Record your call activity
              </p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary text-xs">
            <Zap className="w-3 h-3 mr-1" />
            +15 XP
          </Badge>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Lead Info */}
            {formData.leadName && (
              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                  {formData.leadName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-primary">{formData.leadName}</p>
                  <p className="text-xs text-gray-500">Lead Contact</p>
                </div>
              </motion.div>
            )}

            {/* Call Type Toggle */}
            <motion.div variants={fadeInUp}>
              <label className="text-sm font-medium text-primary mb-3 block">
                Call Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateField('callType', 'outbound')}
                  className={cn(
                    "flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2",
                    formData.callType === 'outbound'
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">Outbound</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('callType', 'inbound')}
                  className={cn(
                    "flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2",
                    formData.callType === 'inbound'
                      ? "border-violet-500 bg-violet-500/5 text-violet-500"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  <Phone className="w-5 h-5 rotate-[135deg]" />
                  <span className="font-medium">Inbound</span>
                </button>
              </div>
            </motion.div>

            {/* Outcome Selection */}
            <motion.div variants={fadeInUp}>
              <label className="text-sm font-medium text-primary mb-3 block">
                Call Outcome
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {outcomeOptions.map((option) => {
                  const config = outcomeIcons[option.value as keyof typeof outcomeIcons];
                  const Icon = config.icon;
                  const isSelected = formData.outcome === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('outcome', option.value)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all text-left",
                        isSelected
                          ? `border-current ${config.color} ${config.bg}`
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 mb-1", isSelected && config.color)} />
                      <p className={cn(
                        "text-xs font-medium",
                        isSelected ? "text-gray-800" : "text-gray-600"
                      )}>
                        {option.label.split(' - ')[0]}
                      </p>
                    </button>
                  );
                })}
              </div>
              {errors.outcome && (
                <p className="text-xs text-red-500 mt-2">{errors.outcome}</p>
              )}
            </motion.div>

            {/* Date, Time & Duration */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Call Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(v) => updateField('date', v)}
                  error={errors.date}
                  required
                />
                <FormField
                  label="Time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={(v) => updateField('time', v)}
                />
                <FormField
                  label="Duration"
                  name="duration"
                  type="number"
                  placeholder="5"
                  value={formData.duration}
                  onChange={(v) => updateField('duration', v)}
                  error={errors.duration}
                  suffix="min"
                  icon={<Timer className="w-4 h-4" />}
                />
              </div>
            </motion.div>

            {/* Notes */}
            <motion.div variants={fadeInUp}>
              <FormField
                label="Call Notes"
                name="notes"
                type="textarea"
                placeholder="What was discussed? Any important details..."
                value={formData.notes}
                onChange={(v) => updateField('notes', v)}
                rows={3}
              />
            </motion.div>

            {/* Follow-up */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Follow-up Action
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Next Action"
                  name="followUpAction"
                  options={followUpOptions}
                  value={formData.followUpAction}
                  onChange={(v) => updateField('followUpAction', v)}
                  placeholder="Select next step"
                />
                <FormField
                  label="Follow-up Date"
                  name="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(v) => updateField('followUpDate', v)}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>
            </motion.div>
          </motion.div>
        </CardContent>

        <CardFooter className="border-t border-gray-100 bg-gray-50/50 flex justify-between items-center p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {OutcomeIcon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn("w-6 h-6 rounded-full flex items-center justify-center", OutcomeIcon.bg)}
              >
                <OutcomeIcon.icon className={cn("w-3.5 h-3.5", OutcomeIcon.color)} />
              </motion.div>
            )}
            <span>{outcomeOptions.find(o => o.value === formData.outcome)?.label}</span>
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Log Call
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default CallLogForm;
