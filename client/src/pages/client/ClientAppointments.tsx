/**
 * Client Appointments — Scheduling & Appointment Management
 * Heritage Design System — Violet-to-Amber theme
 *
 * View upcoming/past appointments, schedule new ones.
 * Wired to real API with 3-channel notification (chat + notification + email).
 * Falls back to demo data when not authenticated.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ClientLoungeLayout } from './ClientLoungeLayout';
import { RADIUS, SHADOW, MOTION, TYPE, fadeInUp, staggerContainer, GRID } from '@/lib/heritageDesignSystem';
import { glassCard } from './clientConstants';
import { usePortalAppointments, useMyAgent } from '@/hooks/usePortalData';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Phone, Video, MapPin, Plus, User, ChevronDown, CheckCircle, XCircle, Loader2, ExternalLink, FileText, X, type LucideIcon } from 'lucide-react';
import { ClientPageHero } from './primitives';
import { toast } from 'sonner';

// ─── Appointment Type Config ───
const APPOINTMENT_TYPE: Record<string, { icon: LucideIcon; label: string; color: string; bg: string }> = {
  phone: { icon: Phone, label: 'Phone Call', color: 'text-blue-600', bg: 'bg-blue-100' },
  video: { icon: Video, label: 'Video Call', color: 'text-violet-600', bg: 'bg-violet-100' },
  in_person: { icon: MapPin, label: 'In Person', color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

// ─── Types ───
interface Appointment {
  id: string;
  agentName: string;
  agentAvatar: string;
  type: 'phone' | 'video' | 'in_person';
  topic: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink?: string;
}

// Topic options
const TOPIC_OPTIONS = [
  'Policy Review',
  'New Policy Inquiry',
  'Claims Question',
  'Billing Inquiry',
  'Coverage Change',
  'Beneficiary Update',
  'General Question',
];

// Time slots
const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

// Meeting type options
const MEETING_TYPES: { value: 'phone' | 'video' | 'in_person'; icon: LucideIcon; label: string }[] = [
  { value: 'phone', icon: Phone, label: 'Phone' },
  { value: 'video', icon: Video, label: 'Video' },
  { value: 'in_person', icon: MapPin, label: 'In Person' },
];

// ─── API Helpers ───

function mapApiAppointment(raw: any): Appointment {
  const scheduledAt = new Date(raw.scheduledAt || raw.scheduled_at);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = `${monthNames[scheduledAt.getMonth()]} ${scheduledAt.getDate()}, ${scheduledAt.getFullYear()}`;
  const hours = scheduledAt.getHours();
  const minutes = scheduledAt.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const time = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  let type: 'phone' | 'video' | 'in_person' = 'video';
  const mt = raw.meetingType || raw.meeting_type || '';
  if (mt === 'follow_up' || raw.location === 'Virtual') type = 'phone';
  else if (mt === 'presentation' || raw.meetingLink || raw.meeting_link) type = 'video';
  else if (mt === 'discovery' && raw.location && raw.location !== 'Virtual') type = 'in_person';

  return {
    id: raw.id,
    agentName: raw.agentName || 'Your Advisor',
    agentAvatar: raw.agentAvatar || 'YA',
    type,
    topic: raw.title || 'Appointment',
    date,
    time,
    duration: raw.duration || 30,
    status: (raw.status === 'confirmed' ? 'scheduled' : raw.status) as Appointment['status'],
    meetingLink: raw.meetingLink || raw.meeting_link || undefined,
  };
}

// ─── Shared Input Styles ───

const inputStyle = {
  fontSize: TYPE.meta,
  padding: `10px 14px`,
  borderRadius: RADIUS.input,
  border: '1.5px solid #e2e8f0',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const inputFocusClass = 'focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100';

export default function ClientAppointments() {
  const { data: apiAppointments = [] } = usePortalAppointments();
  const { data: agent } = useMyAgent();
  const queryClient = useQueryClient();

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedApptId, setExpandedApptId] = useState<string | null>(null);

  // Form state
  const [formTopic, setFormTopic] = useState('');
  const [formType, setFormType] = useState<'phone' | 'video' | 'in_person'>('video');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Map API appointments to component shape, enrich with live agent info
  const agentName = agent ? `${agent.firstName} ${agent.lastName}` : 'Your Advisor';
  const agentInitials = agent ? `${agent.firstName[0]}${agent.lastName[0]}` : 'YA';

  const appointments: Appointment[] = useMemo(() =>
    apiAppointments.map((a: any) => ({
      ...mapApiAppointment(a),
      agentName: a.agentName || agentName,
      agentAvatar: a.agentAvatar || agentInitials,
    })),
    [apiAppointments, agentName, agentInitials]
  );

  // Partition appointments
  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  // Parse date for display
  const parseDateDisplay = (dateStr: string) => {
    const parts = dateStr.split(' ');
    return { month: parts[0], day: parts[1]?.replace(',', ''), year: parts[2] };
  };

  // Get today's date in YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split('T')[0];

  // Handle form submit
  const handleSubmit = async () => {
    if (!formTopic || !formDate || !formTime || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/client-portal/appointment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topic: formTopic,
          meetingType: formType,
          preferredDate: formDate,
          preferredTime: formTime,
          notes: formNotes || undefined,
        }),
      });

      if (res.ok) {
        toast.success('Appointment request submitted! Your advisor will confirm shortly.');
        setFormTopic('');
        setFormType('video');
        setFormDate('');
        setFormTime('');
        setFormNotes('');
        setShowScheduleForm(false);
        queryClient.invalidateQueries({ queryKey: ['/api/client-portal/appointments'] });
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Failed to submit appointment request');
      }
    } catch {
      toast.error('Failed to submit appointment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formTopic && formDate && formTime;

  return (
    <ClientLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-col"
        style={{ gap: GRID.spacing.md }}
      >
        {/* Hero */}
        <ClientPageHero
          icon={Calendar}
          title="Appointments"
          subtitle="Schedule and manage meetings with your advisor"
        >
          <Button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="font-semibold transition-all hover:scale-105"
            style={{
              background: 'white',
              color: '#7c3aed',
              borderRadius: RADIUS.button,
              padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
              boxShadow: SHADOW.level2,
              border: 'none',
              fontSize: TYPE.meta,
            }}
          >
            <Plus style={{ width: 16, height: 16, marginRight: 6 }} />
            Schedule Appointment
          </Button>
        </ClientPageHero>

        {/* Schedule New Form (expandable) */}
        <AnimatePresence>
          {showScheduleForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="bg-white"
                style={{
                  borderRadius: RADIUS.card,
                  padding: GRID.spacing.lg,
                  boxShadow: SHADOW.level2,
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.title, marginBottom: GRID.spacing.lg }}
                >
                  Schedule a New Appointment
                </h3>

                <div className="flex flex-col" style={{ gap: GRID.spacing.lg }}>
                  {/* Topic Dropdown — custom styled */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.meta }}>
                      Topic
                    </label>
                    <div className={cn('relative w-full', inputFocusClass)} style={{ borderRadius: RADIUS.input }}>
                      <select
                        value={formTopic}
                        onChange={(e) => setFormTopic(e.target.value)}
                        className={cn(
                          'w-full outline-none bg-white text-gray-900 appearance-none cursor-pointer pr-10',
                          !formTopic && 'text-gray-400'
                        )}
                        style={{
                          ...inputStyle,
                          paddingRight: 40,
                        }}
                      >
                        <option value="" disabled>Select a topic...</option>
                        {TOPIC_OPTIONS.map(topic => (
                          <option key={topic} value={topic} className="text-gray-900">{topic}</option>
                        ))}
                      </select>
                      <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        style={{ width: 18, height: 18 }}
                      />
                    </div>
                  </div>

                  {/* Meeting Type */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.meta }}>
                      Meeting Type
                    </label>
                    <div className="grid grid-cols-3" style={{ gap: GRID.spacing.sm }}>
                      {MEETING_TYPES.map(mt => {
                        const isSelected = formType === mt.value;
                        return (
                          <motion.button
                            key={mt.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: MOTION.duration.hover }}
                            onClick={() => setFormType(mt.value)}
                            className={cn(
                              'flex items-center justify-center gap-2 font-medium transition-all',
                              isSelected ? 'text-white shadow-lg' : 'text-gray-600 hover:border-violet-300'
                            )}
                            style={{
                              padding: '10px 16px',
                              borderRadius: RADIUS.button,
                              border: isSelected ? '2px solid transparent' : '1.5px solid #e2e8f0',
                              background: isSelected
                                ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                                : 'white',
                              boxShadow: isSelected ? '0 4px 14px rgba(124, 58, 237, 0.35)' : 'none',
                              fontSize: TYPE.meta,
                            }}
                          >
                            <mt.icon style={{ width: 16, height: 16 }} />
                            {mt.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date + Time Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: GRID.spacing.lg }}>
                    {/* Preferred Date */}
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.meta }}>
                        Preferred Date
                      </label>
                      <div className={cn('relative', inputFocusClass)} style={{ borderRadius: RADIUS.input }}>
                        <input
                          type="date"
                          value={formDate}
                          min={today}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full outline-none text-gray-900 bg-white"
                          style={{
                            ...inputStyle,
                            colorScheme: 'light',
                          }}
                        />
                      </div>
                    </div>

                    {/* Preferred Time */}
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.meta }}>
                        Preferred Time
                      </label>
                      <div className="flex flex-wrap" style={{ gap: 8 }}>
                        {TIME_SLOTS.map(slot => {
                          const isSelected = formTime === slot;
                          return (
                            <motion.button
                              key={slot}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ duration: MOTION.duration.hover }}
                              onClick={() => setFormTime(slot)}
                              className={cn(
                                'font-medium transition-all',
                                isSelected ? 'text-white shadow-md' : 'text-gray-600 hover:border-violet-300 hover:text-violet-600'
                              )}
                              style={{
                                padding: '6px 14px',
                                borderRadius: RADIUS.pill,
                                border: isSelected ? '1.5px solid transparent' : '1.5px solid #e2e8f0',
                                background: isSelected
                                  ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                                  : 'white',
                                boxShadow: isSelected ? '0 2px 8px rgba(124, 58, 237, 0.3)' : 'none',
                                fontSize: TYPE.caption,
                              }}
                            >
                              {slot}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.meta }}>
                      Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Any additional details for your advisor..."
                      rows={3}
                      className={cn(
                        'w-full outline-none text-gray-900 bg-white placeholder:text-gray-400 resize-none',
                        inputFocusClass
                      )}
                      style={{
                        ...inputStyle,
                        lineHeight: 1.6,
                      }}
                    />
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: '1px solid #f1f5f9' }} />

                  {/* Actions */}
                  <div className="flex items-center justify-end" style={{ gap: GRID.spacing.sm }}>
                    <Button
                      variant="ghost"
                      onClick={() => setShowScheduleForm(false)}
                      className="text-gray-500 hover:text-gray-700 font-medium"
                      style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta, padding: '10px 20px' }}
                    >
                      Cancel
                    </Button>
                    <motion.button
                      whileHover={isFormValid ? { scale: 1.02, boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)' } : {}}
                      whileTap={isFormValid ? { scale: 0.98 } : {}}
                      transition={{ duration: MOTION.duration.hover }}
                      onClick={handleSubmit}
                      disabled={!isFormValid || isSubmitting}
                      className={cn(
                        'flex items-center gap-2 font-semibold text-white transition-all',
                        (!isFormValid || isSubmitting) ? 'opacity-40 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                      )}
                      style={{
                        padding: '10px 24px',
                        borderRadius: RADIUS.button,
                        background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #6d28d9 100%)',
                        boxShadow: isFormValid ? '0 4px 14px rgba(124, 58, 237, 0.35)' : 'none',
                        border: 'none',
                        fontSize: TYPE.meta,
                      }}
                    >
                      {isSubmitting && <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />}
                      Submit Request
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <motion.div variants={fadeInUp}>
            <h2
              className="font-bold text-gray-900"
              style={{ fontSize: TYPE.section, marginBottom: GRID.spacing.sm }}
            >
              Upcoming Appointments
            </h2>
            <div className="flex flex-col" style={{ gap: GRID.spacing.sm }}>
              {upcomingAppointments.map((appt) => {
                const dateInfo = parseDateDisplay(appt.date);
                const typeConfig = APPOINTMENT_TYPE[appt.type];
                const TypeIcon = typeConfig.icon;
                const isExpanded = expandedApptId === appt.id;

                return (
                  <motion.div
                    key={appt.id}
                    layout
                    whileHover={!isExpanded ? { y: MOTION.hover.y, scale: MOTION.hover.scale } : {}}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className="overflow-hidden"
                    style={{
                      ...glassCard,
                      borderRadius: RADIUS.card,
                      boxShadow: isExpanded ? SHADOW.level3 : SHADOW.level2,
                      border: isExpanded ? '1.5px solid rgba(124, 58, 237, 0.2)' : glassCard.border,
                    }}
                  >
                    <div
                      className="flex items-center"
                      style={{ padding: GRID.spacing.md, gap: GRID.spacing.md }}
                    >
                      {/* Date Block */}
                      <div
                        className="flex flex-col items-center justify-center text-white font-bold flex-shrink-0"
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: RADIUS.button,
                          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                          boxShadow: SHADOW.level2,
                        }}
                      >
                        <span style={{ fontSize: TYPE.micro, textTransform: 'uppercase', opacity: 0.8 }}>
                          {dateInfo.month}
                        </span>
                        <span style={{ fontSize: TYPE.section, lineHeight: 1.1 }}>
                          {dateInfo.day}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.body }}>
                          {appt.topic}
                        </p>
                        <div className="flex items-center flex-wrap mt-1" style={{ gap: GRID.spacing.sm }}>
                          <div className="flex items-center text-gray-500" style={{ gap: 4 }}>
                            <Clock style={{ width: 14, height: 14 }} />
                            <span style={{ fontSize: TYPE.caption }}>
                              {appt.time} ({appt.duration} min)
                            </span>
                          </div>
                          <div className="flex items-center text-gray-500" style={{ gap: 4 }}>
                            <User style={{ width: 14, height: 14 }} />
                            <span style={{ fontSize: TYPE.caption }}>{appt.agentName}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span
                            className={cn('inline-flex items-center font-medium', typeConfig.color, typeConfig.bg)}
                            style={{
                              padding: `2px ${GRID.spacing.xs}px`,
                              borderRadius: RADIUS.pill,
                              fontSize: TYPE.micro,
                              gap: 4,
                            }}
                          >
                            <TypeIcon style={{ width: 12, height: 12 }} />
                            {typeConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center flex-shrink-0" style={{ gap: GRID.spacing.xs }}>
                        {appt.type === 'video' && appt.meetingLink && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: MOTION.duration.hover }}
                            onClick={() => window.open(appt.meetingLink, '_blank', 'noopener,noreferrer')}
                            className="flex items-center gap-1.5 font-medium text-white"
                            style={{
                              padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                              borderRadius: RADIUS.button,
                              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                              boxShadow: SHADOW.level2,
                              border: 'none',
                              fontSize: TYPE.caption,
                            }}
                          >
                            <Video style={{ width: 14, height: 14 }} />
                            Join Meeting
                          </motion.button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => setExpandedApptId(isExpanded ? null : appt.id)}
                          className={cn(
                            'transition-colors',
                            isExpanded ? 'text-violet-600 bg-violet-50' : 'text-gray-400 hover:text-violet-600'
                          )}
                          style={{ borderRadius: RADIUS.button, fontSize: TYPE.caption }}
                        >
                          {isExpanded ? 'Close' : 'Details'}
                          {isExpanded
                            ? <X style={{ width: 14, height: 14, marginLeft: 2 }} />
                            : <ChevronDown style={{ width: 14, height: 14, marginLeft: 2 }} />
                          }
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details Panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            style={{
                              padding: `0 ${GRID.spacing.md}px ${GRID.spacing.md}px`,
                              borderTop: '1px solid #f1f5f9',
                              marginTop: 0,
                            }}
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                              {/* Appointment Info */}
                              <div className="flex flex-col" style={{ gap: GRID.spacing.sm }}>
                                <h4 className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                                  Appointment Details
                                </h4>
                                <div className="flex flex-col" style={{ gap: 8 }}>
                                  <div className="flex items-center gap-2 text-gray-600" style={{ fontSize: TYPE.caption }}>
                                    <Calendar style={{ width: 14, height: 14, color: '#7c3aed', flexShrink: 0 }} />
                                    <span>{appt.date} at {appt.time}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600" style={{ fontSize: TYPE.caption }}>
                                    <Clock style={{ width: 14, height: 14, color: '#7c3aed', flexShrink: 0 }} />
                                    <span>Duration: {appt.duration} minutes</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600" style={{ fontSize: TYPE.caption }}>
                                    <TypeIcon style={{ width: 14, height: 14, color: '#7c3aed', flexShrink: 0 }} />
                                    <span>{typeConfig.label}</span>
                                  </div>
                                  {appt.meetingLink && (
                                    <div className="flex items-center gap-2 text-gray-600" style={{ fontSize: TYPE.caption }}>
                                      <ExternalLink style={{ width: 14, height: 14, color: '#7c3aed', flexShrink: 0 }} />
                                      <a
                                        href={appt.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-violet-600 hover:text-violet-700 underline underline-offset-2"
                                      >
                                        Meeting Link
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Agent Info */}
                              <div className="flex flex-col" style={{ gap: GRID.spacing.sm }}>
                                <h4 className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                                  Your Advisor
                                </h4>
                                <div className="flex items-center gap-3">
                                  <div
                                    className="flex items-center justify-center text-white font-bold flex-shrink-0"
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: RADIUS.pill,
                                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                      fontSize: TYPE.caption,
                                    }}
                                  >
                                    {appt.agentAvatar}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>
                                      {appt.agentName}
                                    </p>
                                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                                      Insurance Advisor
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9', gap: GRID.spacing.sm }}>
                              {appt.type === 'video' && appt.meetingLink && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => window.open(appt.meetingLink, '_blank', 'noopener,noreferrer')}
                                  className="flex items-center gap-2 font-medium text-white"
                                  style={{
                                    padding: '8px 20px',
                                    borderRadius: RADIUS.button,
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                                    border: 'none',
                                    fontSize: TYPE.caption,
                                  }}
                                >
                                  <Video style={{ width: 14, height: 14 }} />
                                  Join Meeting
                                </motion.button>
                              )}
                              {appt.type === 'phone' && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => toast.info(`Your advisor will call you at your scheduled time: ${appt.time}`)}
                                  className="flex items-center gap-2 font-medium text-white"
                                  style={{
                                    padding: '8px 20px',
                                    borderRadius: RADIUS.button,
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                                    border: 'none',
                                    fontSize: TYPE.caption,
                                  }}
                                >
                                  <Phone style={{ width: 14, height: 14 }} />
                                  Phone Call Scheduled
                                </motion.button>
                              )}
                              {appt.type === 'in_person' && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => toast.info('Heritage Life Solutions office — address details will be emailed to you.')}
                                  className="flex items-center gap-2 font-medium text-white"
                                  style={{
                                    padding: '8px 20px',
                                    borderRadius: RADIUS.button,
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                    border: 'none',
                                    fontSize: TYPE.caption,
                                  }}
                                >
                                  <MapPin style={{ width: 14, height: 14 }} />
                                  View Location
                                </motion.button>
                              )}
                              <Button
                                variant="ghost"
                                onClick={() => toast.info('To reschedule, please message your advisor.')}
                                className="text-gray-500 hover:text-gray-700 font-medium"
                                style={{ borderRadius: RADIUS.button, fontSize: TYPE.caption }}
                              >
                                <FileText style={{ width: 14, height: 14, marginRight: 4 }} />
                                Reschedule
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <motion.div variants={fadeInUp}>
            <h2
              className="font-bold text-gray-900"
              style={{ fontSize: TYPE.section, marginBottom: GRID.spacing.sm }}
            >
              Past Appointments
            </h2>
            <div className="flex flex-col" style={{ gap: GRID.spacing.sm }}>
              {pastAppointments.map((appt) => {
                const dateInfo = parseDateDisplay(appt.date);
                const typeConfig = APPOINTMENT_TYPE[appt.type];
                const TypeIcon = typeConfig.icon;
                const isCompleted = appt.status === 'completed';

                return (
                  <motion.div
                    key={appt.id}
                    whileHover={{ y: -2 }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className="flex items-center"
                    style={{
                      ...glassCard,
                      borderRadius: RADIUS.card,
                      padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                      boxShadow: SHADOW.level1,
                      gap: GRID.spacing.md,
                      opacity: 0.85,
                    }}
                  >
                    {/* Date Block (muted) */}
                    <div
                      className="flex flex-col items-center justify-center font-bold flex-shrink-0"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: RADIUS.button,
                        background: '#f3f4f6',
                        color: '#6b7280',
                      }}
                    >
                      <span style={{ fontSize: TYPE.micro, textTransform: 'uppercase', opacity: 0.7 }}>
                        {dateInfo.month}
                      </span>
                      <span style={{ fontSize: TYPE.title, lineHeight: 1.1 }}>
                        {dateInfo.day}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-700 truncate" style={{ fontSize: TYPE.meta }}>
                        {appt.topic}
                      </p>
                      <div className="flex items-center flex-wrap mt-1" style={{ gap: GRID.spacing.sm }}>
                        <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                          {appt.time} ({appt.duration} min)
                        </span>
                        <span
                          className={cn('inline-flex items-center font-medium', typeConfig.color, typeConfig.bg)}
                          style={{
                            padding: `1px ${GRID.spacing.xs - 2}px`,
                            borderRadius: RADIUS.pill,
                            fontSize: TYPE.micro,
                            gap: 3,
                          }}
                        >
                          <TypeIcon style={{ width: 10, height: 10 }} />
                          {typeConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      <span
                        className={cn(
                          'inline-flex items-center font-medium',
                          isCompleted ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'
                        )}
                        style={{
                          padding: `2px ${GRID.spacing.xs}px`,
                          borderRadius: RADIUS.pill,
                          fontSize: TYPE.micro,
                          gap: 4,
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle style={{ width: 12, height: 12 }} />
                        ) : (
                          <XCircle style={{ width: 12, height: 12 }} />
                        )}
                        {isCompleted ? 'Completed' : 'Cancelled'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {appointments.length === 0 && (
          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center justify-center text-center"
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              padding: GRID.spacing.xxxxl,
              boxShadow: SHADOW.level2,
            }}
          >
            <Calendar style={{ width: 48, height: 48, color: '#9ca3af', marginBottom: GRID.spacing.sm }} />
            <p className="font-semibold text-gray-600" style={{ fontSize: TYPE.body }}>
              No appointments yet
            </p>
            <p className="text-gray-400 mt-1" style={{ fontSize: TYPE.meta }}>
              Schedule your first appointment with your advisor.
            </p>
          </motion.div>
        )}
      </motion.div>
    </ClientLoungeLayout>
  );
}
