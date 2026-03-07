import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS } from "@/lib/heritageDesignSystem";
import { type RecruitApproach } from "@/lib/agentStore";
import {
  User, Mail, Phone, Users, Snowflake, Heart,
  ArrowRight, ArrowLeft, Check, MessageSquare,
  Send, Calendar, CheckCircle, Plus, Eye
} from "lucide-react";

interface RecruitingFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (prospect: { name: string; email: string; phone: string; notes?: string; source: string; approach: RecruitApproach }) => void;
}

const approaches: Array<{ value: RecruitApproach; label: string; description: string; icon: typeof Heart }> = [
  { value: 'warm_lead', label: 'Warm Lead', description: 'Someone you know or have a connection with', icon: Heart },
  { value: 'cold_outreach', label: 'Cold Outreach', description: 'New contact from job boards, events, or social media', icon: Snowflake },
  { value: 'referral', label: 'Referral', description: 'Referred by an existing team member or contact', icon: Users },
];

const TOTAL_STEPS = 5;

export function RecruitingFlowDialog({ open, onOpenChange, onComplete }: RecruitingFlowDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', source: '', notes: '',
    approach: 'warm_lead' as RecruitApproach,
    channel: 'email' as 'email' | 'text',
    message: '',
    followUpDate: '',
    followUpNotes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setStep(1);
    setFormData({ name: '', email: '', phone: '', source: '', notes: '', approach: 'warm_lead', channel: 'email', message: '', followUpDate: '', followUpNotes: '' });
    setErrors({});
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    if (!formData.phone.trim()) e.phone = 'Phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getDefaultMessage = () => {
    const firstName = formData.name.split(' ')[0];
    if (formData.approach === 'warm_lead') {
      return formData.channel === 'email'
        ? `Hi ${firstName},\n\nI wanted to reach out because I think you'd be a great fit for our team at Heritage Life Solutions. We're growing fast and I'd love to tell you about the opportunity.\n\nWould you be open to a quick 15-minute call this week?\n\nBest regards`
        : `Hey ${firstName}! I've been thinking about you — I'm with Heritage Life Solutions and we're looking for driven people. Would you be open to hearing about an opportunity? Let me know!`;
    } else if (formData.approach === 'referral') {
      return formData.channel === 'email'
        ? `Hi ${firstName},\n\nYour name was mentioned to me as someone who would excel in the insurance industry. I'm with Heritage Life Solutions and we're expanding our team.\n\nI'd love to share more about what we offer. Are you available for a brief call?\n\nBest regards`
        : `Hi ${firstName}! Someone I trust recommended you. I'm with Heritage Life Solutions and we have a great opportunity. Can we chat for a few minutes?`;
    }
    return formData.channel === 'email'
      ? `Hi ${firstName},\n\nI came across your profile and was impressed by your background. Heritage Life Solutions is looking for talented individuals to join our growing team.\n\nWe offer comprehensive training, competitive commissions, and a supportive team environment. Would you be interested in learning more?\n\nBest regards`
      : `Hi ${firstName}, I'm reaching out from Heritage Life Solutions. We're looking for talented people and I think you could be a great fit. Would you be interested in hearing about the opportunity?`;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2) setFormData(prev => ({ ...prev, message: getDefaultMessage() }));
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleComplete = () => {
    onComplete({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      source: formData.source || 'Direct',
      approach: formData.approach,
    });
    reset();
    onOpenChange(false);
  };

  const handleAddAnother = () => {
    onComplete({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      source: formData.source || 'Direct',
      approach: formData.approach,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[520px]" style={{ borderRadius: RADIUS.card }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" /> Add Recruit
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                s < step ? 'bg-emerald-100 text-emerald-600' : s === step ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'
              }`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < TOTAL_STEPS && <div className={`w-8 h-0.5 ${s < step ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }} className="min-h-[280px]">
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-gray-500 text-sm font-medium">Step 1: Prospect Information</p>
                <div><Label>Full Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Smith" style={{ borderRadius: RADIUS.input }} />{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@email.com" style={{ borderRadius: RADIUS.input }} />{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}</div>
                  <div><Label>Phone *</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 123-4567" style={{ borderRadius: RADIUS.input }} />{errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}</div>
                </div>
                <div><Label>Source</Label><Input value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} placeholder="LinkedIn, Job Fair, Referral..." style={{ borderRadius: RADIUS.input }} /></div>
                <div><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any relevant background info..." rows={2} style={{ borderRadius: RADIUS.input }} /></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-gray-500 text-sm font-medium">Step 2: Select Approach</p>
                <div className="space-y-3">
                  {approaches.map((a) => {
                    const Icon = a.icon;
                    const isSelected = formData.approach === a.value;
                    return (
                      <button key={a.value} onClick={() => setFormData({ ...formData, approach: a.value })}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected ? 'border-violet-500 bg-violet-50' : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`} style={{ borderRadius: RADIUS.button }}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${isSelected ? 'text-violet-700' : 'text-gray-700'}`}>{a.label}</p>
                          <p className="text-sm text-gray-500">{a.description}</p>
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-violet-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-gray-500 text-sm font-medium">Step 3: Send Personalized Invite</p>
                <div className="flex gap-2">
                  {(['email', 'text'] as const).map(ch => (
                    <Button key={ch} variant={formData.channel === ch ? 'default' : 'outline'} size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, channel: ch, message: '' }))}
                      className={formData.channel === ch ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' : ''}
                      style={{ borderRadius: RADIUS.pill }}>
                      {ch === 'email' ? <Mail className="w-4 h-4 mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                      {ch === 'email' ? 'Email' : 'Text'}
                    </Button>
                  ))}
                </div>
                <Textarea value={formData.message || getDefaultMessage()} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={8} style={{ borderRadius: RADIUS.input }} />
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-2" style={{ borderRadius: RADIUS.button }} onClick={handleNext}>
                    <Send className="w-4 h-4" /> Send Invite
                  </Button>
                  <Button variant="outline" onClick={() => setStep(4)} style={{ borderRadius: RADIUS.button }}>Skip for Now</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-gray-500 text-sm font-medium">Step 4: Set Follow-Up</p>
                <div><Label>Follow-up Date</Label><Input type="date" value={formData.followUpDate} onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                <div><Label>Notes</Label><Textarea value={formData.followUpNotes} onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })} placeholder="What's the next step?" rows={3} style={{ borderRadius: RADIUS.input }} /></div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Prospect Added!</h3>
                <p className="text-gray-500">{formData.name} has been added to your recruiting pipeline.</p>
                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2" style={{ borderRadius: RADIUS.button }}>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Name</span><span className="font-medium">{formData.name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Approach</span><span className="font-medium">{approaches.find(a => a.value === formData.approach)?.label}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Source</span><span className="font-medium">{formData.source || 'Direct'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Stage</span><span className="font-medium text-violet-600">Prospect</span></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => { handleComplete(); }} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-2" style={{ borderRadius: RADIUS.button }}>
                    <Eye className="w-4 h-4" /> View in Pipeline
                  </Button>
                  <Button variant="outline" onClick={handleAddAnother} className="flex-1 gap-2" style={{ borderRadius: RADIUS.button }}>
                    <Plus className="w-4 h-4" /> Add Another
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 5 && step !== 3 && (
          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep(s => Math.max(s - 1, 1))} disabled={step === 1} style={{ borderRadius: RADIUS.button }}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button onClick={handleNext} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-2" style={{ borderRadius: RADIUS.button }}>
              {step === 4 ? 'Complete' : 'Next'} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
