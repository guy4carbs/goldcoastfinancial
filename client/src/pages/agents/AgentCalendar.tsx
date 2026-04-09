import { useState, useEffect, useMemo, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, addDays, subDays, format, isSameDay } from 'date-fns';
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
  X,
  Loader2,
  KeyRound,
  Unlink,
  Cloud,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { AddEventModal, EventData, type EventPrefillData } from "@/components/agent/AddEventModal";
import { useLocation } from "wouter";
import { useConfirm } from "@/components/agent/primitives/ConfirmDialog";
import { toast } from "sonner";
import { AgentPageHero } from "@/components/agent/primitives";
import { useAgentStore } from "@/lib/agentStore";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

// Calendar provider configs
const calendarProviders = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: '/icons/google-calendar.svg',
    color: 'bg-gradient-to-br from-violet-500 to-purple-600',
    description: 'Connect your Google Calendar to sync events',
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    icon: '/icons/apple-calendar.svg',
    color: 'bg-gradient-to-br from-violet-500 to-purple-600',
    description: 'Connect your iCloud Calendar',
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    icon: '/icons/outlook.svg',
    color: 'bg-gradient-to-br from-violet-500 to-purple-600',
    description: 'Sync with Outlook Calendar and Microsoft 365',
    comingSoon: true,
  },
];

// App password instructions per provider (same credentials as email connections)
const calendarProviderInstructions: Record<string, { hint: string; steps: string[] }> = {
  google: {
    hint: 'Use the same Google App Password as your Gmail connection',
    steps: [
      'Go to myaccount.google.com/apppasswords',
      'Sign in with your Google account',
      'Select "Mail" as the app, then "Other" for device name',
      'Copy the 16-character app password (remove spaces)',
      'If you already connected your Gmail, use that same app password',
    ],
  },
  apple: {
    hint: 'Use your Apple ID app-specific password',
    steps: [
      'Go to appleid.apple.com and sign in',
      'Under Security, click "Generate Password"',
      'Enter a label like "Heritage Calendar"',
      'Copy the generated app-specific password',
      'Use your Apple ID email as the username',
    ],
  },
  outlook: {
    hint: 'Sign in with your Microsoft account to connect',
    steps: [
      'Sign in with your Microsoft account',
      'Grant calendar access when prompted',
      'Works with personal and Microsoft 365 accounts',
    ],
  },
};

// Demo events data removed — now fetched from /api/calendar/events

const eventTypeConfig: Record<string, { icon: any; color: string; dot: string; gradient: string }> = {
  call: { icon: Phone, color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', gradient: 'from-amber-500 to-orange-500' },
  meeting: { icon: User, color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', gradient: 'from-purple-500 to-violet-600' },
  video: { icon: Video, color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', gradient: 'from-violet-500 to-indigo-600' },
  event: { icon: CalendarIcon, color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-500' },
  training: { icon: Monitor, color: 'bg-green-100 text-green-700', dot: 'bg-green-500', gradient: 'from-green-500 to-emerald-600' },
  deadline: { icon: CalendarIcon, color: 'bg-red-100 text-red-700', dot: 'bg-red-500', gradient: 'from-red-500 to-rose-600' },
  review: { icon: CalendarIcon, color: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500', gradient: 'from-teal-500 to-cyan-600' },
};

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const daysOfWeekMobile = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type PreviewTab = "email" | "sms" | "form";
type DevicePreview = "phone" | "desktop";

export default function AgentCalendar() {
  const confirm = useConfirm();
  const currentUser = useAgentStore((state) => state.currentUser);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  // Google Calendar connection status from real API
  const { data: calendarStatus } = useQuery<{ connected: boolean; email: string | null }>({
    queryKey: ['/api/calendar/status'],
  });

  // Per-agent calendar connections (multiple providers)
  const { data: calConnectionData } = useQuery<{ connections: any[]; connection: any }>({
    queryKey: ['/api/calendar/connection'],
  });
  const calConnections: any[] = calConnectionData?.connections || [];
  const getConnectionForProvider = (provider: string) => calConnections.find((c: any) => c.provider === provider);
  // Only show as connected if agent has a personal connection — not the company fallback
  const connectedProviders = calConnections.map((c: any) => c.provider);

  // Calendar connect form state
  const [showCalendarConnect, setShowCalendarConnect] = useState(false);
  const [selectedCalProvider, setSelectedCalProvider] = useState<string | null>(null);
  const [calConnectForm, setCalConnectForm] = useState({ email: '', password: '' });
  const [showInstructions, setShowInstructions] = useState(false);

  // Connect calendar mutation
  const connectCalendar = useMutation({
    mutationFn: async (data: { provider: string; username: string; password: string }) => {
      const res = await fetch('/api/calendar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Connection failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/connection'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      toast.success('Calendar connected successfully!');
      setShowCalendarConnect(false);
      setCalConnectForm({ email: '', password: '' });
      setSelectedCalProvider(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Disconnect calendar mutation
  const disconnectCalendar = useMutation({
    mutationFn: async (provider?: string) => {
      const url = provider ? `/api/calendar/connection/${provider}` : '/api/calendar/connection';
      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to disconnect');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/connection'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      toast.success('Calendar disconnected');
    },
    onError: () => {
      toast.error('Failed to disconnect calendar');
    },
  });
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [prefillData, setPrefillData] = useState<EventPrefillData | null>(null);
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch events from the consolidated calendar API
  const { data: calendarData } = useQuery<{ events: EventData[]; warnings?: string[] }>({
    queryKey: ['/api/calendar/events'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  const events: EventData[] = calendarData?.events || [];
  const calendarWarnings: string[] = calendarData?.warnings || [];

  // Display sync warnings from backend (e.g., CalDAV/Outlook fetch failures)
  useEffect(() => {
    if (calendarWarnings.length > 0) {
      calendarWarnings.forEach((warning) => {
        toast.warning('Calendar sync issue', {
          description: warning,
          duration: 8000,
        });
      });
    }
  }, [calendarWarnings.join(',')]);

  // Create event mutation
  const createEvent = useMutation({
    mutationFn: async (data: Omit<EventData, 'id' | 'status'>) => {
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create event');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      toast.success('Event created');
    },
    onError: () => {
      toast.error('Failed to create event');
    },
  });

  // Update event mutation
  const updateEvent = useMutation({
    mutationFn: async ({ id, ...data }: Partial<EventData> & { id: string }) => {
      const res = await fetch(`/api/calendar/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update event');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
    },
    onError: () => {
      toast.error('Failed to update event');
    },
  });

  // Delete event mutation
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/calendar/events/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete event');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
    },
    onError: () => {
      toast.error('Failed to delete event');
    },
  });

  // Auto-open modal with pre-filled data from URL params (e.g., from Lead Drawer Schedule button)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('schedule') === 'true') {
      const data: EventPrefillData = {};
      if (params.get('name')) data.clientName = params.get('name')!;
      if (params.get('phone')) data.clientPhone = params.get('phone')!;
      if (params.get('email')) data.clientEmail = params.get('email')!;
      if (params.get('product')) data.product = params.get('product')!;
      setPrefillData(data);
      setSelectedDate(new Date());
      setShowAddEvent(true);
      // Clean the URL without reloading
      window.history.replaceState({}, '', '/agents/calendar');
    }
  }, []);
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
        // SMS sending - currently simulated (would need Telnyx SMS integration)
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

  const navigatePrev = () => {
    if (view === 'month') setCurrentDate(new Date(year, month - 1, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };
  const navigateNext = () => {
    if (view === 'month') setCurrentDate(new Date(year, month + 1, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  // Detect OAuth return params (?cal_connected=google|outlook or ?cal_error=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectedProvider = params.get('cal_connected');
    if (connectedProvider) {
      const providerNames: Record<string, string> = {
        google: 'Google Calendar',
        outlook: 'Outlook Calendar',
      };
      toast.success(`${providerNames[connectedProvider] || 'Calendar'} connected!`);
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/connection'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('cal_error')) {
      const errorCode = params.get('cal_error');
      const errorMessages: Record<string, string> = {
        missing_params: 'Missing OAuth parameters',
        no_email: 'Could not get email from Google',
        oauth_failed: 'OAuth failed — please try again',
        outlook_oauth_failed: 'Microsoft OAuth failed — please try again',
      };
      toast.error(errorMessages[errorCode || ''] || 'Failed to connect calendar');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleConnectProvider = async (providerId: string) => {
    const isConnected = connectedProviders.includes(providerId);
    const existingConn = getConnectionForProvider(providerId);

    if (isConnected && existingConn) {
      // Already connected — show info
      toast.info(`${calendarProviders.find(p => p.id === providerId)?.name} is connected`, {
        description: `Syncing with ${existingConn.username}`,
      });
      return;
    }

    // Google uses OAuth, not CalDAV
    if (providerId === 'google') {
      window.location.href = '/api/calendar/connect/google';
      return;
    }

    // Outlook uses OAuth, not CalDAV
    if (providerId === 'outlook') {
      window.location.href = '/api/calendar/connect/outlook';
      return;
    }

    // Apple (and other CalDAV providers): show CalDAV form
    setSelectedCalProvider(providerId);
    setCalConnectForm({ email: '', password: '' });
    setShowInstructions(false);
    setShowCalendarConnect(true);
  };

  const handleCalConnectSubmit = () => {
    if (!selectedCalProvider || !calConnectForm.email || !calConnectForm.password) {
      toast.error('Please fill in both email and app password');
      return;
    }
    connectCalendar.mutate({
      provider: selectedCalProvider,
      username: calConnectForm.email,
      password: calConnectForm.password,
    });
  };

  const handleDisconnectCalendar = async (provider?: string) => {
    const providerName = provider === 'google' ? 'Google Calendar' : provider === 'apple' ? 'iCloud Calendar' : provider === 'outlook' ? 'Outlook Calendar' : 'calendar';
    const confirmed = await confirm({
      title: `Disconnect ${providerName}`,
      description: `Are you sure you want to disconnect ${providerName}? Events from this calendar will no longer appear here.`,
      confirmLabel: 'Disconnect',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      disconnectCalendar.mutate(provider);
    }
  };

  const handleEditEvent = (event: EventData) => {
    // Open the add event modal pre-filled with this event's data for editing
    setPrefillData({
      clientName: event.clientName,
      clientPhone: event.clientPhone,
      clientEmail: event.clientEmail,
    });
    setSelectedDate(new Date(event.date + 'T12:00:00'));
    setShowAddEvent(true);
    toast.info('Edit Event', {
      description: `Editing "${event.title}" — save to update`
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const eventSource = (event as any).source as string | undefined;
    const isExternal = eventSource === 'google' || eventSource === 'caldav' || eventSource === 'outlook';
    const sourceLabel = eventSource === 'google' ? 'Google Calendar' : eventSource === 'caldav' ? 'iCloud Calendar' : eventSource === 'outlook' ? 'Outlook Calendar' : '';

    const confirmed = await confirm({
      title: 'Delete Event',
      description: isExternal
        ? `Delete "${event.title}" from your ${sourceLabel}? This will remove it from ${sourceLabel} too.`
        : `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      deleteEvent.mutate(eventId);
      toast.success('Event deleted', {
        description: `"${event.title}" has been removed from your calendar`
      });
    }
  };

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    setView(newView);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Upcoming events — sorted by date, paginated
  const UPCOMING_PER_PAGE = 10;
  const [upcomingPage, setUpcomingPage] = useState(0);
  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return [...events]
      .filter(e => e.date >= today && e.status !== 'cancelled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [events]);
  const upcomingTotalPages = Math.ceil(upcomingEvents.length / UPCOMING_PER_PAGE);
  const paginatedUpcoming = upcomingEvents.slice(
    upcomingPage * UPCOMING_PER_PAGE,
    (upcomingPage + 1) * UPCOMING_PER_PAGE
  );

  const handleAddEvent = (newEvent: EventData) => {
    createEvent.mutate(newEvent);
  };

  const handleUpdateEventNotes = (eventId: string, notes: string) => {
    updateEvent.mutate({ id: eventId, meetingNotes: notes });
    toast.success('Meeting notes saved');
  };

  const handleCompleteEvent = (eventId: string) => {
    updateEvent.mutate({ id: eventId, status: 'completed' });
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
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={CalendarIcon}
            title="Calendar"
            subtitle="Manage your schedule and sync with your email calendar"
          >
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              style={{ borderRadius: RADIUS.button }}
              onClick={() => setShowAddEvent(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* Calendar Integrations */}
        <motion.div
          variants={fadeInUp}
          transition={MOTION.spring}
        >
          <Card
            className="border-0"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Link2 className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Connected Calendars</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {calendarProviders.map((provider) => {
                  const isComingSoon = (provider as any).comingSoon;
                  const isConnected = !isComingSoon && connectedProviders.includes(provider.id);
                  const personalConn = !isComingSoon ? getConnectionForProvider(provider.id) : null;
                  const isPersonalConnection = !!personalConn;
                  return (
                    <motion.div
                      key={provider.id}
                      whileHover={!isComingSoon ? { y: MOTION.hover.y, scale: MOTION.hover.scale } : {}}
                      transition={MOTION.spring}
                      className={cn(
                        "p-4 border-0 transition-all overflow-hidden relative",
                        isComingSoon
                          ? "bg-gray-100 opacity-75 cursor-default"
                          : isConnected
                            ? "bg-emerald-50 ring-2 ring-emerald-400 cursor-pointer"
                            : "bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 cursor-pointer"
                      )}
                      style={{ borderRadius: RADIUS.card }}
                      onClick={() => !isConnected && !isComingSoon && handleConnectProvider(provider.id)}
                    >
                      {!isConnected && !isComingSoon && (
                        <>
                          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                          <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-amber-400/15 rounded-full blur-lg" />
                        </>
                      )}
                      <div className="flex items-center gap-3 relative z-10">
                        <div
                          className={cn(
                            "w-10 h-10 flex items-center justify-center",
                            isComingSoon
                              ? "bg-gray-200 text-gray-400"
                              : isConnected
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-white/20 backdrop-blur"
                          )}
                          style={{ borderRadius: RADIUS.button }}
                        >
                          <CalendarIcon className={cn("w-5 h-5", isComingSoon ? "text-gray-400" : isConnected ? "text-emerald-600" : "text-amber-200")} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={cn("font-medium text-sm", isComingSoon ? "text-gray-500" : isConnected ? "text-gray-900" : "text-white")}>{provider.name}</p>
                            {isComingSoon && (
                              <Badge
                                className="bg-gray-200 text-gray-500 border-0 text-[10px] h-5"
                                style={{ borderRadius: RADIUS.pill }}
                              >
                                Coming Soon
                              </Badge>
                            )}
                            {isConnected && (
                              <Badge
                                className="bg-emerald-100 text-emerald-700 border-0 text-[10px] h-5"
                                style={{ borderRadius: RADIUS.pill }}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                          </div>
                          {isPersonalConnection ? (
                            <p className="text-xs text-gray-500 truncate">{personalConn!.username}</p>
                          ) : (
                            <p className={cn("text-xs", isComingSoon ? "text-gray-400" : isConnected ? "text-gray-500" : "text-white/70")}>{provider.description}</p>
                          )}
                        </div>
                      </div>
                      {isComingSoon ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3 h-8 bg-gray-200 text-gray-400 border-gray-200 cursor-default"
                          style={{ borderRadius: RADIUS.button }}
                          disabled
                        >
                          Coming Soon
                        </Button>
                      ) : isPersonalConnection ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3 h-8 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          style={{ borderRadius: RADIUS.button }}
                          onClick={(e) => { e.stopPropagation(); handleDisconnectCalendar(provider.id); }}
                        >
                          <Unlink className="w-3.5 h-3.5 mr-1.5" />
                          Disconnect
                        </Button>
                      ) : !isConnected ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3 h-8 bg-white/20 backdrop-blur text-white border-white/30 hover:bg-white/30"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          Connect
                        </Button>
                      ) : null}
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
            transition={MOTION.spring}
            className="lg:col-span-2"
          >
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={navigatePrev} className="hover:bg-violet-50">
                      <ChevronLeft className="w-4 h-4 text-violet-600" />
                    </Button>
                    <h2 className="text-lg font-serif font-semibold text-gray-900 min-w-[200px] text-center">
                      {view === 'month' && `${months[month]} ${year}`}
                      {view === 'week' && (() => {
                        const ws = startOfWeek(currentDate);
                        const we = endOfWeek(currentDate);
                        return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`;
                      })()}
                      {view === 'day' && format(currentDate, 'EEEE, MMMM d')}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={navigateNext} className="hover:bg-violet-50">
                      <ChevronRight className="w-4 h-4 text-violet-600" />
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    {(['month', 'week', 'day'] as const).map((v) => (
                      <Button
                        key={v}
                        variant={view === v ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleViewChange(v)}
                        className={cn(
                          "h-8 text-xs capitalize",
                          view === v && "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90"
                        )}
                        style={{ borderRadius: RADIUS.button }}
                      >
                        {v}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {view === 'month' && (
                  <>
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 mb-4">
                      {daysOfWeek.map((day, idx) => (
                        <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                          <span className="hidden sm:inline">{day}</span>
                          <span className="sm:hidden">{daysOfWeekMobile[idx]}</span>
                        </div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {calendarDays.map((day, idx) => {
                        if (day === null) {
                          return <div key={`empty-${idx}`} className="aspect-square" />;
                        }

                        const date = new Date(year, month, day);
                        const events = getEventsForDate(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = selectedDate?.toDateString() === date.toDateString();

                        return (
                          <div
                            key={day}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                              "aspect-square p-1 sm:p-2 cursor-pointer transition-all",
                              "hover:bg-violet-50 active:scale-95 touch-manipulation",
                              "min-h-[40px] sm:min-h-0",
                              isToday && "bg-violet-100",
                              isSelected && "ring-2 ring-violet-500 bg-violet-50"
                            )}
                            style={{ borderRadius: RADIUS.input }}
                          >
                            <div className={cn(
                              "text-xs sm:text-sm font-medium text-center",
                              isToday ? "text-violet-600 font-semibold" : "text-gray-700"
                            )}>
                              {day}
                            </div>
                            {events.length > 0 && (
                              <div className="flex justify-center gap-1 mt-1 sm:mt-2">
                                {events.slice(0, 3).map((evt, i) => {
                                  const cfg = eventTypeConfig[evt.type] || eventTypeConfig.event;
                                  return (
                                    <div key={i} className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", cfg.dot)} />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Week View */}
                {view === 'week' && (() => {
                  const weekStart = startOfWeek(currentDate);
                  const weekEnd = endOfWeek(currentDate);
                  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
                  const HOUR_HEIGHT = 60;
                  const START_HOUR = 0;
                  const END_HOUR = 24;
                  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
                  const totalHeight = hours.length * HOUR_HEIGHT;

                  const dotToColor: Record<string, string> = {
                    'bg-amber-500': '#f59e0b',
                    'bg-purple-500': '#a855f7',
                    'bg-violet-500': '#8b5cf6',
                    'bg-blue-500': '#3b82f6',
                    'bg-green-500': '#22c55e',
                    'bg-red-500': '#ef4444',
                    'bg-teal-500': '#14b8a6',
                  };

                  // Pre-compute timed events per day
                  const eventsPerDay = weekDays.map(day =>
                    getEventsForDate(day).filter(e => e.time !== 'All Day').map(evt => {
                      const cfg = eventTypeConfig[evt.type] || eventTypeConfig.event;
                      const timeParts = evt.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
                      if (!timeParts) return null;
                      let h = parseInt(timeParts[1]);
                      const m = parseInt(timeParts[2]);
                      const ampm = timeParts[3].toUpperCase();
                      if (ampm === 'PM' && h !== 12) h += 12;
                      if (ampm === 'AM' && h === 12) h = 0;

                      const durMatch = evt.duration.match(/(\d+\.?\d*)\s*(min|hour|hours)/i);
                      let durMin = 30;
                      if (durMatch) {
                        durMin = durMatch[2].startsWith('hour') ? parseFloat(durMatch[1]) * 60 : parseFloat(durMatch[1]);
                      }

                      const top = (h - START_HOUR) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT;
                      const height = Math.max((durMin / 60) * HOUR_HEIGHT, 20);
                      if (top < 0) return null;

                      const borderColor = dotToColor[cfg.dot] || '#8b5cf6';
                      return { evt, cfg, top, height, borderColor };
                    }).filter(Boolean) as { evt: any; cfg: any; top: number; height: number; borderColor: string }[]
                  );

                  return (
                    <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                      {/* Day headers */}
                      <div className="grid grid-cols-[60px_repeat(7,1fr)] sticky top-0 bg-white z-20 border-b">
                        <div />
                        {weekDays.map((day, i) => (
                          <div
                            key={day.toISOString()}
                            className={cn(
                              "text-center py-2 text-xs font-medium cursor-pointer border-l border-gray-100",
                              isSameDay(day, new Date()) && "text-violet-600 font-bold",
                              selectedDate && isSameDay(day, selectedDate) && "bg-violet-50"
                            )}
                            onClick={() => { setSelectedDate(day); setView('day'); setCurrentDate(day); }}
                          >
                            <div className="text-gray-400">{format(day, 'EEE')}</div>
                            <div className={cn(
                              "w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm",
                              isSameDay(day, new Date()) && "bg-violet-600 text-white"
                            )}>
                              {format(day, 'd')}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* All-day events row */}
                      {(() => {
                        const allDayByDay = weekDays.map(day => ({
                          day,
                          events: getEventsForDate(day).filter(e => e.time === 'All Day')
                        }));
                        const hasAllDay = allDayByDay.some(d => d.events.length > 0);
                        if (!hasAllDay) return null;
                        return (
                          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-gray-50/50">
                            <div className="text-[10px] text-gray-400 p-1 text-right pr-2">all day</div>
                            {allDayByDay.map(({ day, events: adEvents }) => (
                              <div key={day.toISOString()} className="p-1 min-h-[28px] border-l border-gray-100">
                                {adEvents.map(evt => {
                                  const cfg = eventTypeConfig[evt.type] || eventTypeConfig.event;
                                  return (
                                    <div
                                      key={evt.id}
                                      className={cn("text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer mb-0.5", cfg.color)}
                                      onClick={() => setSelectedDate(day)}
                                    >
                                      {evt.title}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Time grid — each day column is a relative container holding its own events */}
                      <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                        {/* Time labels column */}
                        <div className="relative" style={{ height: totalHeight }}>
                          {hours.map((hour, i) => (
                            <div
                              key={hour}
                              className="absolute right-0 pr-2 text-[10px] text-gray-400 text-right w-full"
                              style={{ top: i * HOUR_HEIGHT - 6 }}
                            >
                              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                            </div>
                          ))}
                        </div>

                        {/* Day columns */}
                        {weekDays.map((day, dayIdx) => (
                          <div
                            key={day.toISOString()}
                            className="relative border-l border-gray-100 overflow-hidden"
                            style={{ height: totalHeight }}
                          >
                            {/* Hour row lines and click targets */}
                            {hours.map((hour, i) => (
                              <div
                                key={hour}
                                className="absolute w-full border-t border-gray-100 cursor-pointer hover:bg-violet-50/30"
                                style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                                onClick={() => setSelectedDate(day)}
                              />
                            ))}

                            {/* Events positioned inside this day column */}
                            {eventsPerDay[dayIdx].map(({ evt, cfg, top, height, borderColor }) => (
                              <div
                                key={evt.id}
                                className={cn("absolute left-0.5 right-0.5 overflow-hidden cursor-pointer z-10", cfg.color)}
                                style={{
                                  top: `${top}px`,
                                  height: `${height}px`,
                                  borderLeft: `3px solid ${borderColor}`,
                                  borderRadius: 4,
                                }}
                                onClick={() => setSelectedDate(day)}
                              >
                                <div className="px-1.5 py-0.5 flex items-center gap-1 h-full">
                                  <p className="text-[10px] font-medium truncate">{evt.title}</p>
                                  <span className="text-[9px] opacity-60 shrink-0">{evt.time}</span>
                                </div>
                              </div>
                            ))}

                            {/* Current time indicator for this column */}
                            {isSameDay(day, new Date()) && (() => {
                              const now = new Date();
                              const ch = now.getHours();
                              const cm = now.getMinutes();
                              if (ch < START_HOUR || ch >= END_HOUR) return null;
                              const lineTop = (ch - START_HOUR) * HOUR_HEIGHT + (cm / 60) * HOUR_HEIGHT;
                              return (
                                <div
                                  className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                                  style={{ top: `${lineTop}px` }}
                                >
                                  <div className="w-2 h-2 rounded-full bg-red-500 -mt-[3px] -ml-1" />
                                </div>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Day View */}
                {view === 'day' && (() => {
                  const dayDate = currentDate;
                  const HOUR_HEIGHT = 64;
                  const START_HOUR = 0;
                  const END_HOUR = 24;
                  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
                  const totalHeight = hours.length * HOUR_HEIGHT;
                  const dayEventsAll = getEventsForDate(dayDate);
                  const allDayEvents = dayEventsAll.filter(e => e.time === 'All Day');
                  const timedEvents = dayEventsAll.filter(e => e.time !== 'All Day');

                  const dotToColor: Record<string, string> = {
                    'bg-amber-500': '#f59e0b',
                    'bg-purple-500': '#a855f7',
                    'bg-violet-500': '#8b5cf6',
                    'bg-blue-500': '#3b82f6',
                    'bg-green-500': '#22c55e',
                    'bg-red-500': '#ef4444',
                    'bg-teal-500': '#14b8a6',
                  };

                  // Pre-compute timed event positions
                  const computedEvents = timedEvents.map(evt => {
                    const cfg = eventTypeConfig[evt.type] || eventTypeConfig.event;
                    const timeParts = evt.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (!timeParts) return null;
                    let h = parseInt(timeParts[1]);
                    const m = parseInt(timeParts[2]);
                    const ampm = timeParts[3].toUpperCase();
                    if (ampm === 'PM' && h !== 12) h += 12;
                    if (ampm === 'AM' && h === 12) h = 0;

                    const durMatch = evt.duration.match(/(\d+\.?\d*)\s*(min|hour|hours)/i);
                    let durMin = 30;
                    if (durMatch) {
                      durMin = durMatch[2].startsWith('hour') ? parseFloat(durMatch[1]) * 60 : parseFloat(durMatch[1]);
                    }

                    const top = (h - START_HOUR) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT;
                    const height = Math.max((durMin / 60) * HOUR_HEIGHT, 24);
                    if (top < 0) return null;

                    const borderColor = dotToColor[cfg.dot] || '#8b5cf6';
                    return { evt, cfg, top, height, borderColor };
                  }).filter(Boolean) as { evt: any; cfg: any; top: number; height: number; borderColor: string }[];

                  return (
                    <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                      {/* All-day events */}
                      {allDayEvents.length > 0 && (
                        <div className="p-2 bg-gray-50/50 border-b space-y-1">
                          <span className="text-[10px] text-gray-400 font-medium">ALL DAY</span>
                          {allDayEvents.map(evt => {
                            const cfg = eventTypeConfig[evt.type] || eventTypeConfig.event;
                            return (
                              <div key={evt.id} className={cn("text-xs px-2 py-1 rounded", cfg.color)}>
                                {evt.title}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Time grid — label column + content column as relative container */}
                      <div className="flex">
                        {/* Time labels column */}
                        <div className="shrink-0 w-16 relative" style={{ height: totalHeight }}>
                          {hours.map((hour, i) => (
                            <div
                              key={hour}
                              className="absolute right-0 pr-3 text-[11px] text-gray-400 text-right w-full"
                              style={{ top: i * HOUR_HEIGHT - 6 }}
                            >
                              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                            </div>
                          ))}
                        </div>

                        {/* Events column — single relative container */}
                        <div className="flex-1 relative" style={{ height: totalHeight }}>
                          {/* Hour grid lines and click targets */}
                          {hours.map((hour, i) => (
                            <div
                              key={hour}
                              className="absolute w-full border-t border-gray-100 cursor-pointer hover:bg-violet-50/30"
                              style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                              onClick={() => setSelectedDate(dayDate)}
                            />
                          ))}

                          {/* Timed event blocks */}
                          {computedEvents.map(({ evt, cfg, top, height, borderColor }) => (
                            <div
                              key={evt.id}
                              className={cn("absolute left-0 right-2 cursor-pointer overflow-hidden z-10", cfg.color)}
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                borderLeft: `4px solid ${borderColor}`,
                                borderRadius: 6,
                              }}
                              onClick={() => setSelectedDate(dayDate)}
                            >
                              <div className="px-3 py-1.5 flex items-center gap-2 h-full">
                                <p className="text-sm font-medium truncate">{evt.title}</p>
                                <span className="text-xs opacity-60 shrink-0">{evt.time} · {evt.duration}</span>
                                {evt.clientName && (
                                  <span className="text-xs opacity-50 shrink-0 hidden sm:inline">· {evt.clientName}</span>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Current time indicator */}
                          {isSameDay(dayDate, new Date()) && (() => {
                            const now = new Date();
                            const ch = now.getHours();
                            const cm = now.getMinutes();
                            if (ch < START_HOUR || ch >= END_HOUR) return null;
                            const lineTop = (ch - START_HOUR) * HOUR_HEIGHT + (cm / 60) * HOUR_HEIGHT;
                            return (
                              <div className="absolute left-0 right-0 h-0.5 bg-red-500 z-20" style={{ top: `${lineTop}px` }}>
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 -mt-1 -ml-1.5" />
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>

          {/* Selected Day Events */}
          <motion.div
            variants={fadeInUp}
            transition={MOTION.spring}
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
                  <div className="text-center py-10">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-50 flex items-center justify-center">
                      <CalendarIcon className="w-7 h-7 text-violet-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">No events scheduled</p>
                    <p className="text-xs text-gray-400 mt-1">Add an event to get started</p>
                    <Button
                      size="sm"
                      className="mt-4 gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90"
                      style={{ borderRadius: RADIUS.button }}
                      onClick={() => setShowAddEvent(true)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateEvents.map((event) => {
                      const typeConfig = eventTypeConfig[event.type as keyof typeof eventTypeConfig];
                      const TypeIcon = typeConfig.icon;
                      return (
                        <div
                          key={event.id}
                          className="p-4 border border-gray-100 group"
                          style={{ borderRadius: RADIUS.input }}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={cn("w-10 h-10 flex items-center justify-center bg-gradient-to-br shadow-md", typeConfig.gradient)}
                              style={{ borderRadius: RADIUS.input }}
                            >
                              <TypeIcon className="w-5 h-5 text-white" />
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
                              <DropdownMenuContent align="end" className="w-48 p-1" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                                <DropdownMenuItem onClick={() => openNotesModal(event)} className="gap-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg cursor-pointer">
                                  <FileText className="w-4 h-4 text-violet-500" />
                                  Meeting Notes
                                </DropdownMenuItem>
                                {event.status !== 'completed' && (
                                  <DropdownMenuItem onClick={() => handleCompleteEvent(event.id)} className="gap-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg cursor-pointer">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    Mark Complete
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleEditEvent(event)} className="gap-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg cursor-pointer">
                                  <Pencil className="w-4 h-4 text-violet-500" />
                                  Edit Event
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="gap-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer">
                                  <Trash2 className="w-4 h-4" />
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
                            {(event as any).source === 'google' && (
                              <Badge variant="outline" className="text-[10px] gap-1 text-gray-600 border-gray-200">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Google
                              </Badge>
                            )}
                            {(event as any).source === 'caldav' && (
                              <Badge variant="outline" className="text-[10px] gap-1 text-gray-600 border-gray-200">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                                iCloud
                              </Badge>
                            )}
                            {(event as any).source === 'outlook' && (
                              <Badge variant="outline" className="text-[10px] gap-1 text-gray-600 border-gray-200">
                                <Cloud className="w-3 h-3" />
                                Outlook
                              </Badge>
                            )}
                            {event.status === 'completed' && (
                              <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Completed</Badge>
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
          transition={MOTION.spring}
        >
          <Card
            className="border-0 bg-gradient-to-r from-violet-50 to-amber-50"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center`}
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
                    className={`gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90`}
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

        {/* Upcoming Events List — paginated, 10 per page */}
        <motion.div
          variants={fadeInUp}
          transition={MOTION.spring}
        >
          <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-500" />
                  Upcoming Events
                  {upcomingEvents.length > 0 && (
                    <Badge variant="secondary" className="text-[10px]">{upcomingEvents.length}</Badge>
                  )}
                </CardTitle>
                {upcomingTotalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline" size="icon"
                      className="h-7 w-7"
                      disabled={upcomingPage === 0}
                      onClick={() => setUpcomingPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <span className="text-xs text-gray-500 tabular-nums">{upcomingPage + 1}/{upcomingTotalPages}</span>
                    <Button
                      variant="outline" size="icon"
                      className="h-7 w-7"
                      disabled={upcomingPage >= upcomingTotalPages - 1}
                      onClick={() => setUpcomingPage(p => p + 1)}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {paginatedUpcoming.map((event: EventData) => {
                  const typeConfig = eventTypeConfig[event.type as keyof typeof eventTypeConfig] || eventTypeConfig.event;
                  const TypeIcon = typeConfig.icon;
                  const eventDate = new Date(event.date);
                  const eventSource = (event as any).source as string | undefined;
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-colors group"
                      style={{ borderRadius: RADIUS.input }}
                    >
                      <div className="text-center min-w-[44px]">
                        <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">
                          {eventDate.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="font-bold text-gray-800 text-lg leading-tight">
                          {eventDate.getDate()}
                        </p>
                      </div>
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-sm", typeConfig.gradient)}>
                        <TypeIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{event.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{event.time} · {event.duration}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={cn("text-[10px] border-0", typeConfig.color)} style={{ borderRadius: RADIUS.pill }}>
                          {event.type}
                        </Badge>
                        {eventSource === 'google' && (
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        )}
                        {eventSource === 'caldav' && (
                          <svg className="w-3.5 h-3.5 shrink-0 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                        )}
                        {eventSource === 'outlook' && (
                          <Cloud className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                          <DropdownMenuItem onClick={() => openNotesModal(event)} className="gap-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg cursor-pointer">
                            <FileText className="w-4 h-4 text-violet-500" />
                            Meeting Notes
                          </DropdownMenuItem>
                          {event.status !== 'completed' && (
                            <DropdownMenuItem onClick={() => handleCompleteEvent(event.id)} className="gap-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg cursor-pointer">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEditEvent(event)} className="gap-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg cursor-pointer">
                            <Pencil className="w-4 h-4 text-violet-500" />
                            Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="gap-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                            Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <AddEventModal
        open={showAddEvent}
        onOpenChange={(open) => { setShowAddEvent(open); if (!open) setPrefillData(null); }}
        onAddEvent={handleAddEvent}
        selectedDate={selectedDate}
        existingEvents={events}
        prefillData={prefillData}
      />

      {/* Calendar Connect Modal */}
      <Dialog open={showCalendarConnect} onOpenChange={(open) => { setShowCalendarConnect(open); if (!open) { setSelectedCalProvider(null); setCalConnectForm({ email: '', password: '' }); } }}>
        <DialogContent className="sm:max-w-md" style={{ borderRadius: RADIUS.card }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
                style={{ borderRadius: RADIUS.button }}
              >
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              Connect {calendarProviders.find(p => p.id === selectedCalProvider)?.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 ml-[52px]">
              Enter your email and app password to sync your calendar via CalDAV.
            </DialogDescription>
          </DialogHeader>

          {selectedCalProvider && (
            <div className="space-y-4 pt-2">
              {/* Hint banner */}
              <div className="bg-violet-50 border border-violet-200 p-3 flex items-start gap-2.5" style={{ borderRadius: RADIUS.input }}>
                <KeyRound className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-violet-700">
                  {calendarProviderInstructions[selectedCalProvider]?.hint}
                </p>
              </div>

              {/* Email field */}
              <div>
                <Label htmlFor="cal-email" className="text-xs font-medium flex items-center gap-1 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cal-email"
                  type="email"
                  placeholder={selectedCalProvider === 'apple' ? 'yourname@icloud.com' : selectedCalProvider === 'outlook' ? 'yourname@outlook.com' : 'yourname@gmail.com'}
                  value={calConnectForm.email}
                  onChange={(e) => setCalConnectForm(prev => ({ ...prev, email: e.target.value }))}
                  className="h-10"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* App Password field */}
              <div>
                <Label htmlFor="cal-password" className="text-xs font-medium flex items-center gap-1 mb-1.5">
                  App Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cal-password"
                  type="password"
                  placeholder="Enter your app password"
                  value={calConnectForm.password}
                  onChange={(e) => setCalConnectForm(prev => ({ ...prev, password: e.target.value }))}
                  className="h-10"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* Instructions toggle */}
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                {showInstructions ? 'Hide' : 'How to get'} an app password
              </button>

              {showInstructions && (
                <div className="bg-gray-50 border p-3 space-y-2" style={{ borderRadius: RADIUS.input }}>
                  <ol className="list-decimal list-inside space-y-1.5">
                    {calendarProviderInstructions[selectedCalProvider]?.steps.map((step, i) => (
                      <li key={i} className="text-xs text-gray-600">{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowCalendarConnect(false)}
                  className="flex-1 h-10"
                  disabled={connectCalendar.isPending}
                  style={{ borderRadius: RADIUS.button }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCalConnectSubmit}
                  disabled={!calConnectForm.email || !calConnectForm.password || connectCalendar.isPending}
                  className="flex-1 h-10 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 gap-2"
                  style={{ borderRadius: RADIUS.button }}
                >
                  {connectCalendar.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Test & Connect
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

      {/* Send Booking Link Modal - Heritage Design System */}
      <Dialog open={showBookingLinkModal} onOpenChange={setShowBookingLinkModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" style={{ borderRadius: RADIUS.card }}>
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-4 text-lg font-serif">
              <div
                className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
                style={{ borderRadius: RADIUS.button }}
              >
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              Send Booking Link
            </DialogTitle>
            <p className="text-sm text-gray-500 ml-14">
              Your customer will receive a link to schedule an appointment with you.
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
            {/* Left Side - Form */}
            <div className="space-y-4">
              {/* Customer Name */}
              <div>
                <Label htmlFor="customerName" className="text-xs font-medium flex items-center gap-1 mb-1.5">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  placeholder="John Smith"
                  value={bookingLinkData.customerName}
                  onChange={(e) => setBookingLinkData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="h-9"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* Email Address */}
              <div>
                <Label htmlFor="customerEmail" className="text-xs font-medium mb-1.5 block">Email Address</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="john.smith@email.com"
                  value={bookingLinkData.customerEmail}
                  onChange={(e) => setBookingLinkData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="h-9"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="customerPhone" className="text-xs font-medium mb-1.5 block">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={bookingLinkData.customerPhone}
                  onChange={(e) => setBookingLinkData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="h-9"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* Meeting Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meetingDuration" className="text-xs font-medium mb-1.5 block">Duration</Label>
                  <select
                    id="meetingDuration"
                    className="w-full h-9 px-3 border border-input bg-background text-sm"
                    style={{ borderRadius: RADIUS.input }}
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
                  <Label htmlFor="meetingType" className="text-xs font-medium mb-1.5 block">Meeting Type</Label>
                  <select
                    id="meetingType"
                    className="w-full h-9 px-3 border border-input bg-background text-sm"
                    style={{ borderRadius: RADIUS.input }}
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
                <Label htmlFor="message" className="text-xs font-medium mb-1.5 block">Custom Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Hi John, I'd love to schedule a time to discuss your insurance needs..."
                  value={bookingLinkData.message}
                  onChange={(e) => setBookingLinkData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="min-h-[64px] resize-none text-sm"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* Sending From Info */}
              <div className="bg-violet-50 border border-violet-200 p-3" style={{ borderRadius: RADIUS.input }}>
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
              <div className="p-3 bg-gray-50 border flex items-center gap-2" style={{ borderRadius: RADIUS.input }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Your Booking Link</p>
                  <code className="text-sm text-violet-600 truncate block">{agentBookingLink}</code>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleSendBookingLink('copy')} className="h-8 px-2" style={{ borderRadius: RADIUS.input }}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t mt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingLinkModal(false)}
                  className="flex-1 h-9"
                  disabled={isSending}
                  style={{ borderRadius: RADIUS.button }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSendBookingLink('sms')}
                  disabled={!bookingLinkData.customerName || !bookingLinkData.customerPhone || isSending}
                  className="flex-1 h-9 gap-2"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Send SMS
                </Button>
                <Button
                  onClick={() => handleSendBookingLink('email')}
                  disabled={!bookingLinkData.customerName || !bookingLinkData.customerEmail || isSending}
                  className="flex-1 h-9 gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90"
                  style={{ borderRadius: RADIUS.button }}
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
                <Label className="text-xs font-medium">Preview</Label>
                <div className="flex bg-gray-100 p-1" style={{ borderRadius: RADIUS.input }}>
                  <button
                    onClick={() => setDevicePreview("phone")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                      devicePreview === "phone"
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <Smartphone className="w-4 h-4" />
                    Phone
                  </button>
                  <button
                    onClick={() => setDevicePreview("desktop")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                      devicePreview === "desktop"
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </button>
                </div>
              </div>

              {/* Preview Tabs */}
              <div className="flex border-b">
                {[
                  { id: "email" as PreviewTab, label: "Email", icon: Mail },
                  { id: "sms" as PreviewTab, label: "SMS", icon: MessageSquare },
                  { id: "form" as PreviewTab, label: "Form", icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                      previewTab === tab.id
                        ? "border-violet-600 text-violet-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Preview Content */}
              <div
                className={cn(
                  "bg-gray-100 p-4 flex items-start justify-center",
                  devicePreview === "phone" ? "py-6 min-h-[580px]" : "py-4 min-h-[400px]"
                )}
                style={{ borderRadius: RADIUS.input }}
              >
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
                                        <CheckCircle2 className="w-3 h-3 text-violet-500" />
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
