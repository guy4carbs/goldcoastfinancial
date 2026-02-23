import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  Video,
  Phone,
  Check,
  Link2,
  Mail,
  Pencil,
  Trash2,
  MoreVertical,
  FileText,
  Bell,
  CheckCircle2,
  Send,
  Copy,
  MessageSquare,
  ExternalLink,
  Lock,
  Smartphone,
  Monitor,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AddEventModal, EventData } from "@/components/agent/AddEventModal";
import { useConfirm } from "@/components/agent/primitives/ConfirmDialog";
import { toast } from "sonner";
import { DemoBadge } from "@/components/agent/primitives";
import { useAgentStore } from "@/lib/agentStore";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

// Agent lounge gradient (violet-purple-indigo)
const HERO_GRADIENT = 'from-violet-600 via-purple-600 to-indigo-600';

// Calendar provider configs
const calendarProviders = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: '/icons/google-calendar.svg',
    color: 'bg-blue-500',
    description: 'Connect your Google Calendar to sync events',
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    icon: '/icons/outlook.svg',
    color: 'bg-[#0078d4]',
    description: 'Sync with Outlook Calendar and Microsoft 365',
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    icon: '/icons/apple-calendar.svg',
    color: 'bg-gray-800',
    description: 'Connect your iCloud Calendar',
  },
];

// Demo events data
const initialEvents: EventData[] = [
  {
    id: '1',
    title: 'Client Call - John Smith',
    date: '2026-01-26',
    time: '10:00 AM',
    duration: '30 min',
    type: 'call',
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Policy Review - Sarah Johnson',
    date: '2026-01-26',
    time: '2:00 PM',
    duration: '1 hour',
    type: 'meeting',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Team Training Webinar',
    date: '2026-01-27',
    time: '11:00 AM',
    duration: '2 hours',
    type: 'video',
    status: 'upcoming',
  },
  {
    id: '4',
    title: 'Follow-up: Michael Brown',
    date: '2026-01-28',
    time: '9:00 AM',
    duration: '15 min',
    type: 'call',
    status: 'upcoming',
  },
  {
    id: '5',
    title: 'New Lead Consultation',
    date: '2026-01-28',
    time: '3:30 PM',
    duration: '45 min',
    type: 'video',
    status: 'upcoming',
  },
];

const eventTypeConfig = {
  call: { icon: Phone, color: 'bg-green-500/10 text-green-600' },
  meeting: { icon: User, color: 'bg-blue-500/10 text-blue-600' },
  video: { icon: Video, color: 'bg-violet-500/10 text-violet-600' },
};

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const daysOfWeekMobile = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type PreviewTab = "email" | "sms" | "form";
type DevicePreview = "phone" | "desktop";

export default function AgentCalendar() {
  const confirm = useConfirm();
  const currentUser = useAgentStore((state) => state.currentUser);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 26)); // Jan 26, 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 0, 26));
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [events, setEvents] = useState<EventData[]>(initialEvents);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedEventForNotes, setSelectedEventForNotes] = useState<EventData | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [showBookingLinkModal, setShowBookingLinkModal] = useState(false);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("email");
  const [devicePreview, setDevicePreview] = useState<DevicePreview>("phone");
  const [isSending, setIsSending] = useState(false);
  const [bookingLinkData, setBookingLinkData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    meetingDuration: '30',
    meetingType: 'video' as 'call' | 'video' | 'meeting',
    message: '',
  });

  // Agent info
  const agentName = currentUser?.name || "Agent";
  const agentEmail = currentUser?.email || "agent@heritagels.org";
  const agentPhone = currentUser?.phone || "(555) 000-0000";
  const agentFirstName = agentName.split(" ")[0];
  const agentInitials = agentName.split(' ').map(n => n[0]).join('').slice(0, 2);

  // Generate a unique booking link for the agent based on their name
  const agentSlug = agentName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  const agentBookingLink = `${window.location.origin}/book/agent-${agentSlug}`;

  // Fetch booked appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`/api/appointments?agentSlug=${agentSlug}`);
        if (response.ok) {
          const data = await response.json();
          // Convert booked appointments to event format
          const bookedEvents: EventData[] = data.appointments.map((apt: any) => {
            // Format time from 24h to 12h AM/PM
            const [hour, minute] = apt.time.split(':');
            const h = parseInt(hour);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
            const formattedTime = `${displayHour}:${minute} ${ampm}`;

            // Format duration
            const durationMap: Record<string, string> = {
              '15': '15 min',
              '30': '30 min',
              '45': '45 min',
              '60': '1 hour'
            };

            return {
              id: apt.id,
              title: `Booking: ${apt.customerName}`,
              date: apt.date,
              time: formattedTime,
              duration: durationMap[apt.duration] || `${apt.duration} min`,
              type: apt.meetingType as 'call' | 'video' | 'meeting',
              status: 'upcoming' as const,
              clientName: apt.customerName,
              clientEmail: apt.customerEmail,
              clientPhone: apt.customerPhone || undefined,
              meetingNotes: apt.notes || undefined,
            };
          });

          // Merge with existing events, avoiding duplicates
          setEvents(prev => {
            const existingIds = new Set(prev.map(e => e.id));
            const newEvents = bookedEvents.filter(e => !existingIds.has(e.id));
            return [...prev, ...newEvents].sort((a, b) => {
              if (a.date !== b.date) return a.date.localeCompare(b.date);
              return a.time.localeCompare(b.time);
            });
          });
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };

    if (agentSlug) {
      fetchAppointments();
    }
  }, [agentSlug]);

  // Heritage brand colors - Purple and Gold
  const gradientFrom = "#7c3aed"; // violet-600
  const gradientTo = "#D4AF37"; // heritage gold
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b";

  const handleSendBookingLink = async (method: 'email' | 'sms' | 'copy') => {
    if (method === 'copy') {
      await navigator.clipboard.writeText(agentBookingLink);
      toast.success('Booking link copied!', {
        description: 'Share this link with your customer'
      });
      return;
    }

    if (!bookingLinkData.customerName) {
      toast.error('Please enter customer name');
      return;
    }

    if (method === 'email' && !bookingLinkData.customerEmail) {
      toast.error('Please enter customer email');
      return;
    }

    if (method === 'sms' && !bookingLinkData.customerPhone) {
      toast.error('Please enter customer phone number');
      return;
    }

    setIsSending(true);

    try {
      if (method === 'email') {
        // Send actual email via API
        const response = await fetch('/api/booking-links/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerName: bookingLinkData.customerName,
            customerEmail: bookingLinkData.customerEmail,
            meetingDuration: bookingLinkData.meetingDuration,
            meetingType: bookingLinkData.meetingType,
            customMessage: bookingLinkData.message || undefined,
            agent: {
              name: agentName,
              email: agentEmail,
              phone: agentPhone,
            },
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to send email');
        }

        toast.success('Booking link sent via Email!', {
          description: `Sent from ${agentEmail} to ${bookingLinkData.customerEmail}`
        });
      } else if (method === 'sms') {
        // SMS sending - currently simulated (would need Twilio/SMS provider integration)
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Booking link sent via SMS!', {
          description: `Sent from ${agentPhone} to ${bookingLinkData.customerPhone}`
        });
      }

      setShowBookingLinkModal(false);
      setBookingLinkData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        meetingDuration: '30',
        meetingType: 'video',
        message: '',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send booking link';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const getMeetingTypeLabel = () => {
    switch (bookingLinkData.meetingType) {
      case 'video': return 'Video Call';
      case 'call': return 'Phone Call';
      case 'meeting': return 'In-Person Meeting';
      default: return 'Appointment';
    }
  };

  const getDurationLabel = () => {
    switch (bookingLinkData.meetingDuration) {
      case '15': return '15-minute';
      case '30': return '30-minute';
      case '45': return '45-minute';
      case '60': return '1-hour';
      default: return '';
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get calendar days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleConnectProvider = async (providerId: string) => {
    const provider = calendarProviders.find(p => p.id === providerId);
    if (connectedProviders.includes(providerId)) {
      const confirmed = await confirm({
        title: 'Disconnect Calendar',
        description: `Are you sure you want to disconnect ${provider?.name}? Your synced events will remain, but new events won't sync.`,
        confirmLabel: 'Disconnect',
        cancelLabel: 'Cancel',
        variant: 'warning',
      });
      if (confirmed) {
        setConnectedProviders(connectedProviders.filter(p => p !== providerId));
        toast.success(`${provider?.name} disconnected`);
      }
    } else {
      // In production, this would trigger OAuth flow
      toast.info(`Connecting to ${provider?.name}...`, {
        description: 'OAuth authentication would open here in production'
      });
      setTimeout(() => {
        setConnectedProviders([...connectedProviders, providerId]);
        toast.success(`${provider?.name} connected successfully!`);
      }, 1000);
    }
  };

  const handleEditEvent = (event: EventData) => {
    toast.info('Edit Event', {
      description: `Editing "${event.title}" - Event editing coming soon!`
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const confirmed = await confirm({
      title: 'Delete Event',
      description: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Event deleted', {
        description: `"${event.title}" has been removed from your calendar`
      });
    }
  };

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    setView(newView);
    if (newView === 'week') {
      toast.info('Week View', {
        description: 'Week view layout coming soon - showing month view for now'
      });
    } else if (newView === 'day') {
      toast.info('Day View', {
        description: 'Day view layout coming soon - showing month view for now'
      });
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const handleAddEvent = (newEvent: EventData) => {
    setEvents(prev => [...prev, newEvent].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    }));
  };

  const handleUpdateEventNotes = (eventId: string, notes: string) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, meetingNotes: notes } : e
    ));
    toast.success('Meeting notes saved');
  };

  const handleCompleteEvent = (eventId: string) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, status: 'completed' as const } : e
    ));
    toast.success('Event marked as completed');
  };

  const openNotesModal = (event: EventData) => {
    setSelectedEventForNotes(event);
    setEditingNotes(event.meetingNotes || '');
    setShowNotesModal(true);
  };

  const saveEventNotes = () => {
    if (selectedEventForNotes) {
      handleUpdateEventNotes(selectedEventForNotes.id, editingNotes);
      setShowNotesModal(false);
    }
  };

  // Generate calendar grid
  const calendarDays = [];
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Hero Card */}
        <motion.div
          variants={fadeInUp}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
          className={`bg-gradient-to-r ${HERO_GRADIENT} p-6 text-white relative overflow-hidden`}
          style={{
            borderRadius: RADIUS.hero,
            boxShadow: SHADOW.hero,
          }}
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 bg-white/20 backdrop-blur-sm flex items-center justify-center"
                style={{ borderRadius: RADIUS.card }}
              >
                <CalendarIcon className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">Calendar</h1>
                  <DemoBadge />
                </div>
                <p className="text-sm text-white/80">Manage your schedule and sync with your email calendar</p>
              </div>
            </div>
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              style={{ borderRadius: RADIUS.button }}
              onClick={() => setShowAddEvent(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        </motion.div>

        {/* Calendar Integrations */}
        <motion.div
          variants={fadeInUp}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
        >
          <Card
            className="border-0"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div
                  className={`w-8 h-8 bg-gradient-to-br ${HERO_GRADIENT} flex items-center justify-center shadow-sm`}
                  style={{ borderRadius: RADIUS.input }}
                >
                  <Link2 className="w-4 h-4 text-white" />
                </div>
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Connected Calendars</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {calendarProviders.map((provider) => {
                  const isConnected = connectedProviders.includes(provider.id);
                  return (
                    <motion.div
                      key={provider.id}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className={cn(
                        "p-4 border-2 transition-all cursor-pointer",
                        isConnected
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      )}
                      style={{ borderRadius: RADIUS.card }}
                      onClick={() => handleConnectProvider(provider.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn("w-10 h-10 flex items-center justify-center text-white", provider.color)}
                          style={{ borderRadius: RADIUS.input }}
                        >
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-primary">{provider.name}</p>
                            {isConnected && (
                              <Badge className="bg-green-500 text-white text-[10px] h-5">
                                <Check className="w-3 h-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{provider.description}</p>
                        </div>
                      </div>
                      {!isConnected && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3 h-8"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          Connect
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            className="lg:col-span-2"
          >
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-lg font-semibold text-primary">
                      {months[month]} {year}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    {(['month', 'week', 'day'] as const).map((v) => (
                      <Button
                        key={v}
                        variant={view === v ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleViewChange(v)}
                        className={cn("h-8 text-xs capitalize", view === v && "bg-primary")}
                        style={{ borderRadius: RADIUS.button }}
                      >
                        {v}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Days of week header */}
                <div className="grid grid-cols-7 mb-2">
                  {daysOfWeek.map((day, idx) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{daysOfWeekMobile[idx]}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {calendarDays.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="aspect-square" />;
                    }

                    const date = new Date(year, month, day);
                    const events = getEventsForDate(date);
                    const isToday = date.toDateString() === new Date(2026, 0, 26).toDateString();
                    const isSelected = selectedDate?.toDateString() === date.toDateString();

                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "aspect-square p-0.5 sm:p-1 rounded-md sm:rounded-lg cursor-pointer transition-all",
                          "hover:bg-gray-100 active:scale-95 touch-manipulation",
                          "min-h-[40px] sm:min-h-0",
                          isToday && "bg-violet-100",
                          isSelected && "ring-2 ring-violet-500 bg-violet-50"
                        )}
                      >
                        <div className={cn(
                          "text-xs sm:text-sm font-medium text-center",
                          isToday ? "text-violet-600" : "text-primary"
                        )}>
                          {day}
                        </div>
                        {events.length > 0 && (
                          <div className="flex justify-center gap-0.5 mt-0.5 sm:mt-1">
                            {events.slice(0, 3).map((_, i) => (
                              <div key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-violet-500" />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Selected Day Events */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
          >
            <Card className="h-full" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-violet-500" />
                  {selectedDate ? (
                    <span>
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  ) : (
                    'Select a Date'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No events scheduled</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowAddEvent(true)}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => {
                      const typeConfig = eventTypeConfig[event.type as keyof typeof eventTypeConfig];
                      const TypeIcon = typeConfig.icon;
                      return (
                        <div
                          key={event.id}
                          className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group"
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", typeConfig.color)}>
                              <TypeIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-primary truncate">{event.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{event.time}</span>
                                <span className="text-xs text-gray-400">({event.duration})</span>
                              </div>
                              {/* Show client info for booked appointments */}
                              {event.clientName && (
                                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <User className="w-3 h-3 text-violet-500" />
                                    <span className="text-xs text-gray-700 font-medium">{event.clientName}</span>
                                  </div>
                                  {event.clientEmail && (
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">{event.clientEmail}</span>
                                    </div>
                                  )}
                                  {event.clientPhone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">{event.clientPhone}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openNotesModal(event)}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Meeting Notes
                                </DropdownMenuItem>
                                {event.status !== 'completed' && (
                                  <DropdownMenuItem onClick={() => handleCompleteEvent(event.id)}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Mark Complete
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit Event
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Event
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {/* Show reminder and notes indicators */}
                          <div className="flex items-center gap-2 mt-2 ml-11">
                            {(event.reminders || []).length > 0 && (
                              <Badge variant="outline" className="text-[10px] gap-1">
                                <Bell className="w-3 h-3" />
                                Reminder set
                              </Badge>
                            )}
                            {event.meetingNotes && (
                              <Badge variant="outline" className="text-[10px] gap-1">
                                <FileText className="w-3 h-3" />
                                Has notes
                              </Badge>
                            )}
                            {event.status === 'completed' && (
                              <Badge className="bg-green-100 text-green-700 text-[10px]">Completed</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Send Booking Link Section */}
        <motion.div
          variants={fadeInUp}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
        >
          <Card
            className="border-0 bg-gradient-to-r from-violet-50 to-amber-50"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${HERO_GRADIENT} flex items-center justify-center`}
                    style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level3 }}
                  >
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Send Booking Link</h3>
                    <p className="text-sm text-gray-600">Let customers book appointments directly on your calendar</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendBookingLink('copy')}
                    className="gap-2"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowBookingLinkModal(true)}
                    className={`gap-2 bg-gradient-to-r ${HERO_GRADIENT} hover:opacity-90`}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Send className="w-4 h-4" />
                    Send to Customer
                  </Button>
                </div>
              </div>
              {/* Quick preview of booking link */}
              <div
                className="mt-4 p-3 bg-white border border-gray-200 flex items-center justify-between"
                style={{ borderRadius: RADIUS.input }}
              >
                <code className="text-sm text-gray-600 truncate flex-1">{agentBookingLink}</code>
                <Button variant="ghost" size="sm" onClick={() => window.open(agentBookingLink, '_blank')}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events List */}
        <motion.div
          variants={fadeInUp}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
        >
          <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-500" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events.map((event) => {
                  const typeConfig = eventTypeConfig[event.type as keyof typeof eventTypeConfig];
                  const TypeIcon = typeConfig.icon;
                  const eventDate = new Date(event.date);
                  return (
                    <motion.div
                      key={event.id}
                      whileHover={{ x: 4, backgroundColor: COLORS.gray[50] }}
                      className="flex items-center gap-4 p-3 transition-colors group"
                      style={{ borderRadius: RADIUS.input }}
                    >
                      <div className="text-center min-w-[50px]">
                        <p className="text-[10px] text-gray-500 uppercase">
                          {eventDate.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="font-bold text-primary text-lg">
                          {eventDate.getDate()}
                        </p>
                      </div>
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", typeConfig.color)}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-primary">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.time} - {event.duration}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openNotesModal(event)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Meeting Notes
                          </DropdownMenuItem>
                          {event.status !== 'completed' && (
                            <DropdownMenuItem onClick={() => handleCompleteEvent(event.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <AddEventModal
        open={showAddEvent}
        onOpenChange={setShowAddEvent}
        onAddEvent={handleAddEvent}
        selectedDate={selectedDate}
        existingEvents={events}
      />

      {/* Meeting Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-500" />
              Meeting Notes
            </DialogTitle>
          </DialogHeader>
          {selectedEventForNotes && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-primary">{selectedEventForNotes.title}</p>
                <p className="text-sm text-gray-500">{selectedEventForNotes.date} at {selectedEventForNotes.time}</p>
                {selectedEventForNotes.clientName && (
                  <p className="text-sm text-gray-500 mt-1">Client: {selectedEventForNotes.clientName}</p>
                )}
              </div>
              <div>
                <Textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Add meeting notes, action items, or key takeaways..."
                  className="min-h-[150px]"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowNotesModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={saveEventNotes} className="flex-1 bg-primary hover:bg-primary/90">
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Booking Link Modal - Matching SSN/Banking Style */}
      <Dialog open={showBookingLinkModal} onOpenChange={setShowBookingLinkModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="w-6 h-6" style={{ color: gradientFrom }} />
              Send Booking Link
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Your customer will receive a link to schedule an appointment with you.
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
            {/* Left Side - Form */}
            <div className="space-y-4">
              {/* Customer Name */}
              <div>
                <Label htmlFor="customerName" className="flex items-center gap-1">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  placeholder="John Smith"
                  value={bookingLinkData.customerName}
                  onChange={(e) => setBookingLinkData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Email Address */}
              <div>
                <Label htmlFor="customerEmail">Email Address</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="john.smith@email.com"
                  value={bookingLinkData.customerEmail}
                  onChange={(e) => setBookingLinkData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={bookingLinkData.customerPhone}
                  onChange={(e) => setBookingLinkData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Meeting Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meetingDuration">Duration</Label>
                  <select
                    id="meetingDuration"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-1"
                    value={bookingLinkData.meetingDuration}
                    onChange={(e) => setBookingLinkData(prev => ({ ...prev, meetingDuration: e.target.value }))}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="meetingType">Meeting Type</Label>
                  <select
                    id="meetingType"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-1"
                    value={bookingLinkData.meetingType}
                    onChange={(e) => setBookingLinkData(prev => ({ ...prev, meetingType: e.target.value as 'call' | 'video' | 'meeting' }))}
                  >
                    <option value="video">Video Call</option>
                    <option value="call">Phone Call</option>
                    <option value="meeting">In-Person</option>
                  </select>
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <Label htmlFor="message">Custom Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Hi John, I'd love to schedule a time to discuss your insurance needs..."
                  value={bookingLinkData.message}
                  onChange={(e) => setBookingLinkData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Sending From Info */}
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                <p className="text-xs font-medium text-violet-800 mb-2">Sending From Your Account</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-violet-700">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{agentEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-violet-700">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{agentPhone}</span>
                  </div>
                </div>
              </div>

              {/* Booking Link */}
              <div className="p-3 bg-gray-50 rounded-lg border flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Your Booking Link</p>
                  <code className="text-sm text-violet-600 truncate block">{agentBookingLink}</code>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleSendBookingLink('copy')} className="h-8 px-2">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingLinkModal(false)}
                  className="flex-1"
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSendBookingLink('sms')}
                  disabled={!bookingLinkData.customerName || !bookingLinkData.customerPhone || isSending}
                  className="flex-1 gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send SMS
                </Button>
                <Button
                  onClick={() => handleSendBookingLink('email')}
                  disabled={!bookingLinkData.customerName || !bookingLinkData.customerEmail || isSending}
                  className="flex-1 gap-2"
                  style={{ backgroundColor: gradientFrom }}
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Side - Preview */}
            <div className="space-y-4">
              {/* Device Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setDevicePreview("phone")}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                      devicePreview === "phone"
                        ? "bg-white shadow text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <Smartphone className="w-4 h-4" />
                    Phone
                  </button>
                  <button
                    onClick={() => setDevicePreview("desktop")}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                      devicePreview === "desktop"
                        ? "bg-white shadow text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </button>
                </div>
              </div>

              {/* Preview Tabs */}
              <div className="flex border-b">
                {[
                  { id: "email" as PreviewTab, label: "Email Preview", icon: Mail },
                  { id: "sms" as PreviewTab, label: "SMS Preview", icon: MessageSquare },
                  { id: "form" as PreviewTab, label: "Form Preview", icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      previewTab !== tab.id && "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                    style={previewTab === tab.id ? {
                      borderColor: gradientFrom,
                      color: gradientFrom
                    } : {}}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Preview Content */}
              <div className={cn(
                "bg-gray-100 rounded-xl p-4 flex items-start justify-center",
                devicePreview === "phone" ? "py-6 min-h-[580px]" : "py-4 min-h-[400px]"
              )}>
                {devicePreview === "phone" ? (
                  // iPhone 17 Style Frame
                  <div className="relative">
                    {/* Titanium Frame */}
                    <div className="w-[290px] bg-gradient-to-b from-[#8a8a8f] via-[#6e6e73] to-[#48484a] rounded-[3rem] p-[3px] shadow-2xl">
                      {/* Inner black bezel */}
                      <div className="bg-black rounded-[2.8rem] p-[2px]">
                        {/* Screen */}
                        <div className="bg-white rounded-[2.7rem] overflow-hidden relative">
                          {/* Status Bar with Dynamic Island */}
                          <div className="bg-white px-6 pt-3 pb-1 flex items-center justify-between relative">
                            {/* Time */}
                            <span className="text-sm font-semibold text-black w-12">9:41</span>
                            {/* Dynamic Island */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-2">
                              <div className="bg-black rounded-full w-[90px] h-[28px] flex items-center justify-center gap-2">
                                <div className="w-[10px] h-[10px] rounded-full bg-[#1a1a1a] ring-1 ring-[#2a2a2a] flex items-center justify-center">
                                  <div className="w-[4px] h-[4px] rounded-full bg-[#0a3d62]" />
                                </div>
                              </div>
                            </div>
                            {/* Status Icons */}
                            <div className="flex items-center gap-1 w-12 justify-end">
                              <svg className="w-4 h-4" viewBox="0 0 18 12" fill="black">
                                <rect x="0" y="8" width="3" height="4" rx="0.5"/>
                                <rect x="4" y="5" width="3" height="7" rx="0.5"/>
                                <rect x="8" y="2" width="3" height="10" rx="0.5"/>
                                <rect x="12" y="0" width="3" height="12" rx="0.5"/>
                              </svg>
                              <svg className="w-4 h-4" viewBox="0 0 16 12" fill="black">
                                <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3.5 7.5c2.5-2.5 6.5-2.5 9 0l-1 1c-2-2-5-2-7 0l-1-1zM1 5c3.9-3.9 10.1-3.9 14 0l-1 1c-3.3-3.3-8.7-3.3-12 0l-1-1z"/>
                              </svg>
                              <div className="flex items-center">
                                <div className="w-6 h-3 border border-black rounded-sm flex items-center p-[1px]">
                                  <div className="bg-black h-full w-[85%] rounded-[1px]" />
                                </div>
                                <div className="w-[2px] h-[4px] bg-black rounded-r-sm ml-[1px]" />
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="px-2 pb-2 max-h-[480px] overflow-y-auto">
                            {/* Email Preview Phone */}
                            {previewTab === "email" && (
                              <div className="bg-[#f2f2f7] min-h-[440px]">
                                <div className="bg-[#f2f2f7] px-4 py-2 flex items-center justify-between border-b border-gray-300">
                                  <div className="flex items-center gap-2 text-[#007aff]">
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="text-sm">Inbox</span>
                                  </div>
                                  <Trash2 className="w-4 h-4 text-[#007aff]" />
                                </div>
                                <div className="bg-white">
                                  <div className="px-4 py-3 border-b border-gray-200">
                                    <div className="flex items-start gap-3">
                                      <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
                                      >
                                        <span className="text-white font-semibold text-sm">{agentInitials}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <p className="font-semibold text-gray-900 text-sm">{agentName}</p>
                                          <span className="text-xs text-gray-400">Now</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{agentEmail}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="px-4 py-3 border-b border-gray-200">
                                    <h2 className="font-semibold text-base text-gray-900">
                                      Book Your {getDurationLabel()} {getMeetingTypeLabel()} with {agentFirstName}
                                    </h2>
                                  </div>
                                  {/* Email Header with Logo */}
                                  <div className="p-4 text-white text-center" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
                                    <img src={logoUrl} alt="Heritage" className="w-12 h-12 rounded-lg mx-auto mb-2 shadow-lg" />
                                    <h3 className="font-bold text-sm">Schedule Your Appointment</h3>
                                    <p className="text-xs mt-0.5 opacity-90">{getDurationLabel()} {getMeetingTypeLabel()}</p>
                                  </div>
                                  <div className="px-4 py-4 space-y-3 text-sm">
                                    <p className="text-gray-800">Hi {bookingLinkData.customerName || 'there'},</p>
                                    {bookingLinkData.message ? (
                                      <p className="text-gray-600">{bookingLinkData.message}</p>
                                    ) : (
                                      <>
                                        <p className="text-gray-600">I'd love to schedule a time to connect with you!</p>
                                        <p className="text-gray-600">Use the link below to pick a time that works best for your schedule.</p>
                                      </>
                                    )}
                                    <div className="py-2">
                                      <div className="text-white rounded-lg text-center font-medium py-3 text-sm" style={{ backgroundColor: gradientFrom }}>
                                        Book Your Appointment
                                      </div>
                                    </div>
                                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                                      <div className="flex items-start gap-2">
                                        <CalendarIcon className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-violet-700 text-xs">
                                          {getDurationLabel()} {getMeetingTypeLabel()} • Choose a time that works for you
                                        </p>
                                      </div>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100 mt-3">
                                      <p className="text-gray-700 font-medium">{agentName}</p>
                                      <p className="text-gray-500 text-xs">Licensed Insurance Agent</p>
                                      <p className="text-gray-500 text-xs">{agentPhone}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SMS Preview Phone */}
                            {previewTab === "sms" && (
                              <div className="bg-[#f2f2f7] min-h-[440px]">
                                <div className="bg-[#f2f2f7] px-3 py-2 flex items-center gap-2 border-b border-gray-300">
                                  <ChevronLeft className="w-5 h-5 text-[#007aff]" />
                                  <div className="flex-1 text-center">
                                    <div
                                      className="w-8 h-8 rounded-full mx-auto flex items-center justify-center"
                                      style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
                                    >
                                      <span className="text-white text-xs font-semibold">{agentInitials}</span>
                                    </div>
                                    <p className="text-xs font-medium text-black mt-0.5">{agentFirstName}</p>
                                  </div>
                                  <div className="w-5" />
                                </div>
                                <div className="p-4 space-y-3 pb-20">
                                  <div className="flex justify-start">
                                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm border border-gray-100 max-w-[200px]">
                                      <p className="text-sm text-gray-800">
                                        Hi {bookingLinkData.customerName || 'there'}! This is {agentFirstName}. I'd love to schedule a {getDurationLabel().toLowerCase()} {getMeetingTypeLabel().toLowerCase()} with you.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex justify-start">
                                    <div>
                                      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm border border-gray-100 max-w-[200px]">
                                        <p className="text-sm text-gray-800 mb-2">Book a time that works for you:</p>
                                        <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                          <div className="h-16 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
                                            <CalendarIcon className="w-6 h-6 text-white" />
                                          </div>
                                          <div className="p-2">
                                            <p className="text-[10px] text-gray-400">heritagels.org</p>
                                            <p className="text-xs font-medium text-gray-900">Book with {agentFirstName}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 ml-2 mt-1">
                                        <span className="text-[10px] text-gray-400">Now</span>
                                        <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Form Preview Phone */}
                            {previewTab === "form" && (
                              <div className="bg-[#f2f2f7] min-h-[440px]">
                                <div className="bg-[#f2f2f7] px-3 py-2 flex items-center gap-2 border-b border-gray-300">
                                  <ChevronLeft className="w-5 h-5 text-[#007aff]" />
                                  <div className="flex-1">
                                    <div className="bg-white/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-center">
                                      <Lock className="w-3 h-3 text-gray-500 mx-auto" />
                                      <span className="text-xs text-gray-600 flex-1">heritagels.org</span>
                                    </div>
                                  </div>
                                  <div className="w-5" />
                                </div>
                                <div className="bg-white">
                                  <div className="p-4 text-white text-center" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
                                    <CalendarIcon className="w-8 h-8 mx-auto mb-2" />
                                    <h3 className="font-bold text-base">Book with {agentFirstName}</h3>
                                    <p className="text-xs mt-1 opacity-90">{getDurationLabel()} {getMeetingTypeLabel()}</p>
                                  </div>
                                  <div className="p-4 space-y-3">
                                    <div>
                                      <label className="block text-gray-600 mb-1.5 text-xs font-medium">Select Date</label>
                                      <div className="border rounded-xl p-3 bg-gray-50 text-gray-400 text-sm">Choose a date...</div>
                                    </div>
                                    <div>
                                      <label className="block text-gray-600 mb-1.5 text-xs font-medium">Select Time</label>
                                      <div className="border rounded-xl p-3 bg-gray-50 text-gray-400 text-sm">Choose a time...</div>
                                    </div>
                                    <div>
                                      <label className="block text-gray-600 mb-1.5 text-xs font-medium">Your Name</label>
                                      <div className={cn("border rounded-xl p-3 bg-gray-50 text-sm", bookingLinkData.customerName ? "text-gray-900" : "text-gray-400")}>
                                        {bookingLinkData.customerName || 'Enter your name'}
                                      </div>
                                    </div>
                                    <div className="pt-2">
                                      <div className="text-white rounded-xl text-center font-semibold py-3.5 text-sm" style={{ backgroundColor: gradientFrom }}>
                                        Confirm Booking
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-gray-400 pt-1">
                                      <Lock className="w-3 h-3" />
                                      <span className="text-[10px]">Secure booking</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Home Indicator */}
                          <div className="h-8 flex items-center justify-center bg-white">
                            <div className="w-32 h-1 bg-black rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Side Button (Power) */}
                    <div className="absolute right-[-2px] top-24 w-[3px] h-12 bg-gradient-to-b from-[#8a8a8f] to-[#6e6e73] rounded-r-sm" />
                    {/* Volume Buttons */}
                    <div className="absolute left-[-2px] top-20 w-[3px] h-7 bg-gradient-to-b from-[#8a8a8f] to-[#6e6e73] rounded-l-sm" />
                    <div className="absolute left-[-2px] top-32 w-[3px] h-12 bg-gradient-to-b from-[#8a8a8f] to-[#6e6e73] rounded-l-sm" />
                  </div>
                ) : (
                  // Modern macOS Browser Frame
                  <div className="w-full max-w-lg">
                    {/* Window Chrome */}
                    <div className="bg-gradient-to-b from-[#e8e8e8] to-[#d8d8d8] rounded-t-xl border border-gray-300 border-b-0 shadow-sm">
                      {/* Title Bar */}
                      <div className="flex items-center px-3 py-2.5">
                        {/* Traffic Lights */}
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-sm" />
                          <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#dea123] shadow-sm" />
                          <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] shadow-sm" />
                        </div>
                        {/* Navigation */}
                        <div className="flex items-center gap-1 ml-4">
                          <button className="w-7 h-7 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-400">
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button className="w-7 h-7 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-400">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        {/* URL Bar */}
                        <div className="flex-1 mx-3">
                          <div className="bg-white rounded-lg border border-gray-300 px-3 py-1.5 flex items-center gap-2 shadow-inner">
                            <Lock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600 flex-1 truncate">
                              {previewTab === "email" ? "mail.google.com/inbox" : previewTab === "sms" ? "messages.google.com" : "heritagels.org/book"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Browser Content */}
                    <div className="bg-white rounded-b-xl border border-gray-300 border-t-0 shadow-xl max-h-[420px] overflow-y-auto">
                      <div className="p-4">
                        {/* Email Preview Desktop */}
                        {previewTab === "email" && (
                          <div className="min-h-[350px]">
                            <div className="px-4 py-3 border-b border-gray-100">
                              <h1 className="text-xl text-gray-900">
                                Book Your {getDurationLabel()} {getMeetingTypeLabel()} with {agentFirstName}
                              </h1>
                            </div>
                            <div className="px-4 py-3 flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
                                <span className="text-white font-semibold">{agentInitials}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-gray-900">{agentName}</span>
                                  <span className="text-xs text-gray-400">&lt;{agentEmail}&gt;</span>
                                </div>
                                <p className="text-xs text-gray-500">to {bookingLinkData.customerEmail || 'customer@example.com'}</p>
                              </div>
                            </div>
                            {/* Email Header with Logo */}
                            <div className="mx-4 p-4 rounded-t-xl text-white text-center" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
                              <img src={logoUrl} alt="Heritage" className="w-14 h-14 rounded-xl mx-auto mb-2 shadow-lg" />
                              <h3 className="font-bold text-base">Schedule Your Appointment</h3>
                              <p className="text-sm mt-1 opacity-90">{getDurationLabel()} {getMeetingTypeLabel()} with {agentName}</p>
                            </div>
                            <div className="px-4 py-4 pl-8 space-y-3 text-sm">
                              <p className="text-gray-800">Hi {bookingLinkData.customerName || 'there'},</p>
                              {bookingLinkData.message ? (
                                <p className="text-gray-600">{bookingLinkData.message}</p>
                              ) : (
                                <>
                                  <p className="text-gray-600">I'd love to schedule a time to connect with you!</p>
                                  <p className="text-gray-600">Use the link below to pick a time that works best for your schedule.</p>
                                </>
                              )}
                              <div className="py-2">
                                <div className="text-white rounded text-center font-medium py-3 px-6 inline-block cursor-pointer" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
                                  Book Your Appointment
                                </div>
                              </div>
                              <div className="pt-3 border-t border-gray-100 mt-4">
                                <p className="text-gray-800 font-medium">{agentName}</p>
                                <p className="text-gray-500">Licensed Insurance Agent</p>
                                <p className="text-gray-500">{agentPhone}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SMS Preview Desktop */}
                        {previewTab === "sms" && (
                          <div className="bg-gray-100 min-h-[350px] p-4 -m-4">
                            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                              <div className="p-4 border-b flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
                                  <span className="text-white font-semibold">{agentInitials}</span>
                                </div>
                                <div>
                                  <p className="font-semibold">{agentName}</p>
                                  <p className="text-xs text-gray-500">{agentPhone}</p>
                                </div>
                              </div>
                              <div className="p-4 space-y-3">
                                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                                  <p className="text-sm">Hi {bookingLinkData.customerName || 'there'}! This is {agentFirstName}. I'd love to schedule a {getDurationLabel().toLowerCase()} {getMeetingTypeLabel().toLowerCase()} with you.</p>
                                </div>
                                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                                  <p className="text-sm mb-2">Book a time: {agentBookingLink}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Form Preview Desktop */}
                        {previewTab === "form" && (
                          <div className="bg-gradient-to-br from-violet-50 to-amber-50 min-h-[350px] p-4 -m-4">
                            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                              <div className="p-6 text-white text-center" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
                                <CalendarIcon className="w-10 h-10 mx-auto mb-3" />
                                <h3 className="font-bold text-xl">Book with {agentFirstName}</h3>
                                <p className="text-sm mt-1 opacity-90">{getDurationLabel()} {getMeetingTypeLabel()}</p>
                              </div>
                              <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-gray-600 mb-2 text-sm font-medium">Date</label>
                                    <div className="border rounded-lg p-3 bg-gray-50 text-gray-400 text-sm">Select...</div>
                                  </div>
                                  <div>
                                    <label className="block text-gray-600 mb-2 text-sm font-medium">Time</label>
                                    <div className="border rounded-lg p-3 bg-gray-50 text-gray-400 text-sm">Select...</div>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-gray-600 mb-2 text-sm font-medium">Your Name</label>
                                  <div className={cn("border rounded-lg p-3 bg-gray-50", bookingLinkData.customerName ? "text-gray-900" : "text-gray-400")}>
                                    {bookingLinkData.customerName || 'Enter your name'}
                                  </div>
                                </div>
                                <div className="pt-2">
                                  <div className="text-white rounded-lg text-center font-semibold py-4 text-base cursor-pointer" style={{ backgroundColor: gradientFrom }}>
                                    Confirm Booking
                                  </div>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-gray-400">
                                  <Lock className="w-4 h-4" />
                                  <span className="text-sm">Secure booking</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AgentLoungeLayout>
  );
}
