import { useState } from "react";
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

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

export default function AgentCalendar() {
  const confirm = useConfirm();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 26)); // Jan 26, 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 0, 26));
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [events, setEvents] = useState<EventData[]>(initialEvents);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedEventForNotes, setSelectedEventForNotes] = useState<EventData | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

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
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Calendar</h1>
            <p className="text-sm text-gray-600">Manage your schedule and sync with your email calendar</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowAddEvent(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </motion.div>

        {/* Calendar Integrations */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Link2 className="w-4 h-4 text-violet-500" />
                Connected Calendars
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {calendarProviders.map((provider) => {
                  const isConnected = connectedProviders.includes(provider.id);
                  return (
                    <div
                      key={provider.id}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all cursor-pointer",
                        isConnected
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      )}
                      onClick={() => handleConnectProvider(provider.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", provider.color)}>
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
                        <Button size="sm" variant="outline" className="w-full mt-3 h-8">
                          Connect
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <Card>
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
          <motion.div variants={fadeInUp}>
            <Card className="h-full">
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

        {/* Upcoming Events List */}
        <motion.div variants={fadeInUp}>
          <Card>
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
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
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
    </AgentLoungeLayout>
  );
}
