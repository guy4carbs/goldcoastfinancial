import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, Phone, Video, Users,
  Check, X, MapPin, ChevronRight, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatProductLabel } from "@/lib/utils";
import { useAgentStore, type Lead, type Appointment } from "@/lib/agentStore";

interface UpcomingAppointmentsProps {
  onSelectLead?: (lead: Lead) => void;
  limit?: number;
  showEmpty?: boolean;
}

const TYPE_ICONS = {
  call: Phone,
  video: Video,
  'in-person': Users,
};

const TYPE_COLORS = {
  call: 'bg-blue-100 text-blue-600',
  video: 'bg-purple-100 text-purple-600',
  'in-person': 'bg-green-100 text-green-600',
};

const STATUS_STYLES = {
  scheduled: { badge: 'bg-blue-100 text-blue-700', label: 'Scheduled' },
  completed: { badge: 'bg-green-100 text-green-700', label: 'Completed' },
  cancelled: { badge: 'bg-gray-100 text-gray-600', label: 'Cancelled' },
  'no-show': { badge: 'bg-red-100 text-red-700', label: 'No Show' },
};

export function UpcomingAppointments({ onSelectLead, limit, showEmpty = true }: UpcomingAppointmentsProps) {
  const { getUpcomingAppointments, updateAppointmentStatus } = useAgentStore();
  const appointments = getUpcomingAppointments();

  const displayedAppointments = limit ? appointments.slice(0, limit) : appointments;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  if (appointments.length === 0 && showEmpty) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6 text-gray-400" />
        </div>
        <p className="font-medium text-gray-900">No Upcoming Appointments</p>
        <p className="text-sm text-gray-500 mt-1">
          Schedule appointments with your leads to stay organized.
        </p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {displayedAppointments.map(({ lead, appointment }) => {
          const Icon = TYPE_ICONS[appointment.type];
          const typeColor = TYPE_COLORS[appointment.type];
          const isAppointmentToday = isToday(appointment.date);

          return (
            <motion.div
              key={appointment.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all",
                isAppointmentToday
                  ? "bg-primary/5 border-primary/20"
                  : "bg-white border-gray-200 hover:border-gray-300"
              )}
              onClick={() => onSelectLead?.(lead)}
            >
              <div className="flex items-start gap-3">
                {/* Type Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  typeColor
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">{appointment.title}</h4>
                    {isAppointmentToday && (
                      <Badge className="bg-primary text-white text-[10px] animate-pulse">
                        Today
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(appointment.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {appointment.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{lead.name}</span>
                    {lead.product && (
                      <span className="text-xs text-gray-400">• {formatProductLabel(lead.product)}</span>
                    )}
                  </div>

                  {appointment.notes && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                      {appointment.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  {appointment.status === 'scheduled' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 bg-white text-green-600 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateAppointmentStatus(lead.id, appointment.id, 'completed');
                        }}
                        title="Mark Complete"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 bg-white text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateAppointmentStatus(lead.id, appointment.id, 'cancelled');
                        }}
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300 mx-auto mt-1" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {limit && appointments.length > limit && (
        <p className="text-center text-sm text-gray-500 pt-2">
          +{appointments.length - limit} more appointments
        </p>
      )}
    </div>
  );
}

// Compact version for dashboard cards
export function AppointmentCountBadge() {
  const { getUpcomingAppointments } = useAgentStore();
  const appointments = getUpcomingAppointments();
  const todayCount = appointments.filter(({ appointment }) => {
    const date = new Date(appointment.date);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  }).length;

  if (todayCount === 0) return null;

  return (
    <Badge className="bg-primary text-white animate-pulse">
      <Bell className="w-3 h-3 mr-1" />
      {todayCount} today
    </Badge>
  );
}
