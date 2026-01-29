import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Users, Video, 
  Phone, Presentation, GraduationCap, PartyPopper, AlertCircle, Eye, Zap,
  Mail, CheckCircle2, Loader2, Link2, Link2Off
} from "lucide-react";
import { cn } from "@/lib/utils";
import ExecCommandLayout, { useExecCommand } from "@/components/exec/ExecCommandLayout";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
  isToday, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO
} from "date-fns";

type EventType = 'meeting' | 'call' | 'presentation' | 'training' | 'event' | 'deadline' | 'review' | 'demo';
type EventPriority = 'high' | 'medium' | 'low';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  endTime: string;
  type: EventType;
  location: string;
  attendees: string[];
  priority: EventPriority;
  description: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  organizer?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  notes?: string;
}

const allEvents: CalendarEvent[] = [
  { id: 1, title: 'Board of Directors Meeting', date: '2026-01-10', time: '09:00 AM', endTime: '12:00 PM', type: 'meeting', location: 'Conference Room A', attendees: ['CEO', 'CFO', 'COO', 'Board Members'], priority: 'high', description: 'Quarterly performance review and 2026 strategy discussion', organizer: 'James Davidson', status: 'confirmed', notes: 'Prepare Q4 results presentation' },
  { id: 2, title: 'Carrier Review - Mutual of Omaha', date: '2026-01-05', time: '02:00 PM', endTime: '03:30 PM', type: 'call', location: 'Video Call', attendees: ['Regional VP', 'Contract Manager'], priority: 'high', description: 'Contract renewal negotiation', organizer: 'You', status: 'confirmed' },
  { id: 3, title: 'Weekly Leadership Sync', date: '2026-01-06', time: '10:00 AM', endTime: '11:00 AM', type: 'meeting', location: 'Executive Suite', attendees: ['Sales Director', 'Ops Manager', 'HR Lead'], priority: 'medium', description: 'Team performance updates', isRecurring: true, recurringPattern: 'Weekly', organizer: 'You', status: 'confirmed' },
  { id: 4, title: 'Agent Town Hall', date: '2026-01-08', time: '04:00 PM', endTime: '05:00 PM', type: 'presentation', location: 'Main Office + Virtual', attendees: ['All Agents (40+)'], priority: 'medium', description: 'Q1 kickoff and goal announcements', organizer: 'You', status: 'confirmed' },
  { id: 5, title: 'Q1 Revenue Target Review', date: '2026-01-07', time: '11:00 AM', endTime: '12:00 PM', type: 'review', location: 'Finance Office', attendees: ['CFO', 'Controller'], priority: 'high', description: 'Review pipeline against Q1 targets', organizer: 'CFO', status: 'confirmed' },
  { id: 6, title: 'Marketing Strategy Session', date: '2026-01-09', time: '01:00 PM', endTime: '02:30 PM', type: 'meeting', location: 'Marketing Suite', attendees: ['Marketing Director', 'Agency'], priority: 'medium', description: 'Q1 campaign planning', organizer: 'Marketing Director', status: 'confirmed' },
  { id: 7, title: 'New Agent Orientation', date: '2026-01-12', time: '09:00 AM', endTime: '11:00 AM', type: 'training', location: 'Training Room', attendees: ['New Hires (5)', 'HR Lead'], priority: 'low', description: 'Welcome and onboarding', organizer: 'HR Lead', status: 'confirmed' },
  { id: 8, title: 'Industry Conference', date: '2026-01-15', time: '08:00 AM', endTime: '05:00 PM', type: 'event', location: 'Chicago Convention Center', attendees: ['Industry Leaders'], priority: 'medium', description: 'Keynote speaking opportunity', organizer: 'External', status: 'confirmed' },
  { id: 9, title: 'Product Demo - Foresters IUL', date: '2026-01-06', time: '02:00 PM', endTime: '03:00 PM', type: 'demo', location: 'Virtual', attendees: ['Foresters Rep', 'Senior Agents'], priority: 'medium', description: 'New IUL product features', organizer: 'Foresters', status: 'confirmed' },
  { id: 10, title: 'Compliance Deadline', date: '2026-01-08', time: '05:00 PM', endTime: '05:00 PM', type: 'deadline', location: 'N/A', attendees: ['Compliance Officer'], priority: 'high', description: 'Submit Q4 compliance reports', organizer: 'Compliance', status: 'confirmed' },
  { id: 11, title: '1:1 with Sales Director', date: '2026-01-05', time: '09:00 AM', endTime: '09:30 AM', type: 'meeting', location: 'Your Office', attendees: ['Sarah Mitchell'], priority: 'medium', description: 'Weekly check-in', isRecurring: true, recurringPattern: 'Weekly', organizer: 'You', status: 'confirmed' },
  { id: 12, title: 'Executive Committee Meeting', date: '2026-01-13', time: '10:00 AM', endTime: '12:00 PM', type: 'meeting', location: 'Board Room', attendees: ['C-Suite', 'Senior Directors'], priority: 'high', description: 'Strategic planning session', organizer: 'CEO', status: 'confirmed' },
];

const eventTypeConfig: Record<EventType, { icon: any; color: string; bgColor: string }> = {
  meeting: { icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/50' },
  call: { icon: Phone, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/50' },
  presentation: { icon: Presentation, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/50' },
  training: { icon: GraduationCap, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/50' },
  event: { icon: PartyPopper, color: 'text-pink-500', bgColor: 'bg-pink-100 dark:bg-pink-900/50' },
  deadline: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/50' },
  review: { icon: Eye, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50' },
  demo: { icon: Video, color: 'text-cyan-500', bgColor: 'bg-cyan-100 dark:bg-cyan-900/50' },
};

const priorityColors = { high: 'border-l-red-500', medium: 'border-l-yellow-500', low: 'border-l-blue-500' };

interface ApiCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  attendees?: string[];
  meetLink?: string;
  status: string;
  type: 'meeting' | 'call' | 'event' | 'deadline' | 'training' | 'review';
}

function convertApiEventToCalendarEvent(apiEvent: ApiCalendarEvent, index: number): CalendarEvent {
  const startDate = new Date(apiEvent.start);
  const endDate = new Date(apiEvent.end);
  
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return {
    id: index + 1000,
    title: apiEvent.title,
    date: format(startDate, 'yyyy-MM-dd'),
    time: apiEvent.allDay ? 'All Day' : formatTime(startDate),
    endTime: apiEvent.allDay ? 'All Day' : formatTime(endDate),
    type: (apiEvent.type as EventType) || 'meeting',
    location: apiEvent.location || 'Not specified',
    attendees: apiEvent.attendees || [],
    priority: 'medium' as EventPriority,
    description: apiEvent.description || '',
    organizer: 'Calendar',
    status: 'confirmed',
  };
}

function CalendarContent() {
  const { theme } = useExecCommand();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const { data: calendarStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<{ connected: boolean; email: string | null }>({
    queryKey: ['/api/calendar/status'],
    refetchOnWindowFocus: false,
  });

  const visibleStart = useMemo(() => startOfWeek(startOfMonth(currentDate)), [currentDate]);
  const visibleEnd = useMemo(() => endOfWeek(endOfMonth(currentDate)), [currentDate]);

  const { data: apiEvents, isLoading: eventsLoading, refetch: refetchEvents } = useQuery<{ events: ApiCalendarEvent[] }>({
    queryKey: ['/api/calendar/events', visibleStart.toISOString(), visibleEnd.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        start: visibleStart.toISOString(),
        end: visibleEnd.toISOString(),
      });
      const res = await fetch(`/api/calendar/events?${params}`);
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
    enabled: calendarStatus?.connected === true,
    refetchOnWindowFocus: false,
  });

  const isConnected = calendarStatus?.connected === true;
  const connectedEmail = calendarStatus?.email;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const displayEvents = useMemo(() => {
    if (isConnected && apiEvents?.events) {
      return apiEvents.events.map((e, i) => convertApiEventToCalendarEvent(e, i));
    }
    return allEvents;
  }, [isConnected, apiEvents]);

  const filteredEvents = useMemo(() => {
    if (typeFilter === 'all') return displayEvents;
    return displayEvents.filter(e => e.type === typeFilter);
  }, [typeFilter, displayEvents]);

  const getEventsForDate = (date: Date) => filteredEvents.filter(e => isSameDay(parseISO(e.date), date));
  const todaysEvents = getEventsForDate(new Date());
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const upcomingHighPriority = filteredEvents.filter(e => e.priority === 'high' && parseISO(e.date) >= new Date()).slice(0, 5);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const todayMeetingCount = todaysEvents.length;
  const nextEvent = todaysEvents.find(e => {
    const [time, period] = e.time.split(' ');
    const [hours] = time.split(':').map(Number);
    const eventHour = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
    return eventHour >= currentHour;
  });

  const handleRefresh = () => {
    refetchStatus();
    refetchEvents();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-secondary" />
            Executive Calendar
          </h2>
          <p className="text-muted-foreground mt-1">
            {greeting}. You have <span className="text-secondary font-semibold">{todayMeetingCount} events</span> today
            {nextEvent && <span> — next up: <span className="font-medium">{nextEvent.title}</span> at {nextEvent.time}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("text-right p-3 rounded-lg", theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100')}>
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold text-secondary">{filteredEvents.filter(e => {
              const eventDate = parseISO(e.date);
              const today = new Date();
              const weekEnd = new Date(today);
              weekEnd.setDate(today.getDate() + 7);
              return eventDate >= today && eventDate <= weekEnd;
            }).length}</p>
            <p className="text-xs text-muted-foreground">scheduled events</p>
          </div>
        </div>
      </div>

      {/* Calendar Connection Card - Matches Agent Lounge Design */}
      <Card className="border-secondary/30 bg-gradient-to-r from-secondary/5 to-transparent">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Connect Your Calendar</h3>
                  <p className="text-sm text-muted-foreground">Sync your personal calendar to see all your appointments in one place</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Checking connection...</span>
                </div>
              ) : isConnected ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Connected</span>
                    {connectedEmail && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-500">({connectedEmail})</span>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={eventsLoading}
                    className="gap-2"
                    data-testid="button-refresh-calendar"
                  >
                    {eventsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    data-testid="button-connect-google"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google Calendar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    data-testid="button-connect-outlook"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#0078D4" d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12z"/>
                      <path fill="#fff" d="M7 7h4v4H7zm0 6h4v4H7zm6-6h4v4h-4zm0 6h4v4h-4z"/>
                    </svg>
                    Outlook Calendar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    data-testid="button-connect-apple"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Apple Calendar
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
            {isConnected ? (
              <>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Connected</Badge>
                <span>Your calendar events are synced and displayed below</span>
              </>
            ) : (
              <>
                <Badge variant="outline" className="text-[10px]">Not Connected</Badge>
                <span>Connect your calendar to automatically sync appointments and meetings</span>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card className={cn("p-4", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))} data-testid="button-prev-month"><ChevronLeft className="w-4 h-4" /></Button>
            <h2 className="text-lg font-semibold min-w-[150px] text-center">{format(currentDate, 'MMMM yyyy')}</h2>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))} data-testid="button-next-month"><ChevronRight className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }} data-testid="button-today">Today</Button>
          </div>
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-type-filter"><SelectValue placeholder="Event Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.keys(eventTypeConfig).map(type => (<SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              {(['month', 'week', 'agenda'] as const).map((mode) => (
                <Button key={mode} variant={viewMode === mode ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode(mode)} data-testid={`button-view-${mode}`}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          {viewMode === 'month' && (
            <Card className={cn("p-4", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>))}
                {calendarDays.map((day, idx) => {
                  const dayEvents = getEventsForDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <div key={idx} className={cn("min-h-[80px] p-1 border rounded cursor-pointer transition-colors", isCurrentMonth ? '' : 'opacity-40', isToday(day) && 'ring-2 ring-secondary', isSelected && 'bg-violet-50', theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50')} onClick={() => setSelectedDate(day)} data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}>
                      <div className={cn("text-xs font-medium mb-1", isToday(day) && 'text-secondary font-bold')}>{format(day, 'd')}</div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map(event => {
                          const TypeIcon = eventTypeConfig[event.type].icon;
                          return (
                            <div key={event.id} className={cn("text-[10px] px-1 py-0.5 rounded truncate flex items-center gap-1", eventTypeConfig[event.type].bgColor)} onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }} data-testid={`event-${event.id}`}>
                              <TypeIcon className={cn("w-2.5 h-2.5 shrink-0", eventTypeConfig[event.type].color)} />
                              <span className="truncate">{event.title}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && <div className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 2} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {viewMode === 'agenda' && (
            <Card className={cn("p-4", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
              <h3 className="font-semibold mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {filteredEvents.filter(e => parseISO(e.date) >= new Date()).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()).slice(0, 15).map(event => {
                  const TypeIcon = eventTypeConfig[event.type].icon;
                  return (
                    <div key={event.id} className={cn("p-3 rounded-lg border-l-4 cursor-pointer transition-colors", priorityColors[event.priority], theme === 'dark' ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100')} onClick={() => setSelectedEvent(event)} data-testid={`agenda-event-${event.id}`}>
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded", eventTypeConfig[event.type].bgColor)}><TypeIcon className={cn("w-4 h-4", eventTypeConfig[event.type].color)} /></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{format(parseISO(event.date), 'EEE, MMM d')}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                          </div>
                        </div>
                        {event.priority === 'high' && <Badge variant="destructive" className="text-xs">High</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {viewMode === 'week' && (
            <Card className={cn("p-4", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
              <div className="grid grid-cols-7 gap-2">
                {eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) }).map((day, idx) => {
                  const dayEvents = getEventsForDate(day);
                  return (
                    <div key={idx} className="min-h-[300px]">
                      <div className={cn("text-center py-2 mb-2 rounded", isToday(day) && 'bg-secondary text-secondary-foreground', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                        <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                        <div className="text-lg font-bold">{format(day, 'd')}</div>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map(event => {
                          const TypeIcon = eventTypeConfig[event.type].icon;
                          return (
                            <div key={event.id} className={cn("p-2 rounded text-xs cursor-pointer", eventTypeConfig[event.type].bgColor)} onClick={() => setSelectedEvent(event)}>
                              <div className="flex items-center gap-1 mb-1"><TypeIcon className={cn("w-3 h-3", eventTypeConfig[event.type].color)} /><span className="font-medium truncate">{event.title}</span></div>
                              <div className="text-muted-foreground">{event.time}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className={cn("p-4", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-secondary" />Today's Schedule</h3>
            {todaysEvents.length === 0 ? <p className="text-sm text-muted-foreground">No events today</p> : (
              <div className="space-y-2">
                {todaysEvents.map(event => {
                  const TypeIcon = eventTypeConfig[event.type].icon;
                  return (
                    <div key={event.id} className={cn("p-2 rounded cursor-pointer text-sm", eventTypeConfig[event.type].bgColor)} onClick={() => setSelectedEvent(event)}>
                      <div className="flex items-center gap-2"><TypeIcon className={cn("w-3.5 h-3.5", eventTypeConfig[event.type].color)} /><span className="font-medium truncate">{event.title}</span></div>
                      <div className="text-xs text-muted-foreground mt-1">{event.time}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {selectedDate && !isToday(selectedDate) && (
            <Card className={cn("p-4", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
              <h3 className="font-semibold mb-3">{format(selectedDate, 'EEEE, MMM d')}</h3>
              {selectedDateEvents.length === 0 ? <p className="text-sm text-muted-foreground">No events</p> : (
                <div className="space-y-2">
                  {selectedDateEvents.map(event => {
                    const TypeIcon = eventTypeConfig[event.type].icon;
                    return (
                      <div key={event.id} className={cn("p-2 rounded cursor-pointer text-sm", eventTypeConfig[event.type].bgColor)} onClick={() => setSelectedEvent(event)}>
                        <div className="flex items-center gap-2"><TypeIcon className={cn("w-3.5 h-3.5", eventTypeConfig[event.type].color)} /><span className="font-medium truncate">{event.title}</span></div>
                        <div className="text-xs text-muted-foreground mt-1">{event.time}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          <Card className={cn("p-4", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-red-500" />High Priority</h3>
            {upcomingHighPriority.length === 0 ? <p className="text-sm text-muted-foreground">No high priority events</p> : (
              <div className="space-y-2">
                {upcomingHighPriority.map(event => (
                  <div key={event.id} className={cn("p-2 rounded cursor-pointer text-sm border-l-2 border-red-500", theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')} onClick={() => setSelectedEvent(event)}>
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{format(parseISO(event.date), 'EEE, MMM d')} at {event.time}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className={cn("max-w-lg", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => { const TypeIcon = eventTypeConfig[selectedEvent.type].icon; return <TypeIcon className={cn("w-5 h-5", eventTypeConfig[selectedEvent.type].color)} />; })()}
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={eventTypeConfig[selectedEvent.type].bgColor}>{selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}</Badge>
                  {selectedEvent.priority === 'high' && <Badge variant="destructive">High Priority</Badge>}
                  {selectedEvent.isRecurring && <Badge variant="outline">Recurring</Badge>}
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-muted-foreground" /><span>{format(parseISO(selectedEvent.date), 'EEEE, MMMM d, yyyy')}</span></div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><span>{selectedEvent.time} - {selectedEvent.endTime}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{selectedEvent.location}</span></div>
                  {selectedEvent.organizer && <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /><span>Organized by {selectedEvent.organizer}</span></div>}
                </div>
                <div><h4 className="font-medium text-sm mb-1">Description</h4><p className="text-sm text-muted-foreground">{selectedEvent.description}</p></div>
                {selectedEvent.attendees.length > 0 && (<div><h4 className="font-medium text-sm mb-1">Attendees</h4><div className="flex flex-wrap gap-1">{selectedEvent.attendees.map((a, i) => (<Badge key={i} variant="outline" className="text-xs">{a}</Badge>))}</div></div>)}
                {selectedEvent.notes && (<div><h4 className="font-medium text-sm mb-1">Notes</h4><p className="text-sm text-muted-foreground">{selectedEvent.notes}</p></div>)}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ExecCalendar() {
  return (
    <ExecCommandLayout activeNav="calendar" title="Calendar">
      <CalendarContent />
    </ExecCommandLayout>
  );
}
