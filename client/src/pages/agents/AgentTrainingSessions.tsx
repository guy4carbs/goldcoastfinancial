import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  GraduationCap, Calendar, Clock, Phone, Video, MapPin, Monitor,
  Check, X, Loader2, Plus, User, MessageSquare, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import { RADIUS, SHADOW, fadeInUp, staggerContainer } from "@/lib/heritageDesignSystem";
import { apiRequest } from "@/lib/queryClient";
import { useAgentStore } from "@/lib/agentStore";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const MEETING_TYPES = [
  { value: "phone", label: "Phone Call", icon: Phone },
  { value: "video", label: "Video Call", icon: Video },
  { value: "in_person", label: "In-Person", icon: MapPin },
  { value: "screen_share", label: "Screen Share", icon: Monitor },
];

const DURATION_OPTIONS = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending": return <Badge className="bg-amber-100 text-amber-700 border-0 gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
    case "accepted": return <Badge className="bg-emerald-100 text-emerald-700 border-0 gap-1"><CheckCircle2 className="w-3 h-3" />Accepted</Badge>;
    case "declined": return <Badge className="bg-red-100 text-red-700 border-0 gap-1"><XCircle className="w-3 h-3" />Declined</Badge>;
    case "completed": return <Badge className="bg-violet-100 text-violet-700 border-0 gap-1"><Check className="w-3 h-3" />Completed</Badge>;
    case "cancelled": return <Badge className="bg-gray-100 text-gray-600 border-0 gap-1"><X className="w-3 h-3" />Cancelled</Badge>;
    default: return <Badge>{status}</Badge>;
  }
}

function getMeetingIcon(type: string) {
  const found = MEETING_TYPES.find(m => m.value === type);
  return found ? found.icon : Phone;
}

export default function AgentTrainingSessions() {
  const queryClient = useQueryClient();
  const currentUser = useAgentStore(s => s.currentUser);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [meetingType, setMeetingType] = useState("phone");
  const [duration, setDuration] = useState("30");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");

  // Fetch sessions
  const { data: sessionsData, isLoading } = useQuery<any>({
    queryKey: ["/api/training-sessions"],
  });
  const sessions = sessionsData?.sessions || [];

  // Fetch upline for trainer selection
  const { data: uplineData } = useQuery<any>({
    queryKey: ["/api/hierarchy/upline"],
  });
  const uplineMembers = uplineData?.data || uplineData || [];

  // Create session mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      const res = await apiRequest("POST", "/api/training-sessions", {
        trainerId: selectedTrainer,
        scheduledAt,
        duration: parseInt(duration),
        meetingType,
        topic: topic.trim() || undefined,
        notes: notes.trim() || undefined,
        meetingLink: meetingLink.trim() || undefined,
        location: location.trim() || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Training session requested! They'll be notified via email, text, and in-app.");
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
      setShowSchedule(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || "Failed to schedule session"),
  });

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/training-sessions/${id}/accept`, {});
      return res.json();
    },
    onSuccess: () => {
      toast.success("Session accepted!");
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
    },
  });

  // Decline mutation
  const declineMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/training-sessions/${id}/decline`, { reason: "Schedule conflict" });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Session declined");
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/training-sessions/${id}/cancel`, {});
      return res.json();
    },
    onSuccess: () => {
      toast.success("Session cancelled");
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
    },
  });

  const resetForm = () => {
    setSelectedTrainer("");
    setMeetingType("phone");
    setDuration("30");
    setTopic("");
    setNotes("");
    setScheduledDate("");
    setScheduledTime("");
    setMeetingLink("");
    setLocation("");
  };

  const pendingSessions = sessions.filter((s: any) => s.status === "pending" && s.trainerId === currentUser?.id);
  const upcomingSessions = sessions.filter((s: any) => s.status === "accepted" && new Date(s.scheduledAt) > new Date());
  const pastSessions = sessions.filter((s: any) => ["completed", "declined", "cancelled"].includes(s.status));

  return (
    <AgentLoungeLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        <AgentPageHero
          icon={GraduationCap}
          title="Training Sessions"
          subtitle="Schedule 1:1 coaching with your upline"
        >
          <Button
            onClick={() => setShowSchedule(true)}
            className="gap-2 text-white border-0 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: RADIUS.button }}
          >
            <Plus className="w-4 h-4" /> Schedule 1:1
          </Button>
        </AgentPageHero>

        {/* Pending requests (for trainers to accept/decline) */}
        {pendingSessions.length > 0 && (
          <motion.div variants={fadeInUp}>
            <Card className="border-0 border-l-4 border-l-amber-400" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-6">
                <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Pending Requests — Action Required
                </h2>
                <div className="space-y-3">
                  {pendingSessions.map((s: any) => {
                    const MeetIcon = getMeetingIcon(s.meetingType);
                    return (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-amber-50" style={{ borderRadius: RADIUS.input }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <MeetIcon className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{s.requestorName} wants a 1:1</p>
                            <p className="text-xs text-gray-500">{formatDate(s.scheduledAt)} · {s.duration} min{s.topic ? ` · ${s.topic}` : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptMutation.mutate(s.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            style={{ borderRadius: RADIUS.button }}
                            disabled={acceptMutation.isPending}
                          >
                            <Check className="w-3 h-3" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => declineMutation.mutate(s.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50 gap-1"
                            style={{ borderRadius: RADIUS.button }}
                            disabled={declineMutation.isPending}
                          >
                            <X className="w-3 h-3" /> Decline
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upcoming sessions */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardContent className="p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-500" />
                Upcoming Sessions
              </h2>
              {upcomingSessions.length === 0 && sessions.filter((s: any) => s.status === "pending" && s.requestorId === currentUser?.id).length === 0 ? (
                <div className="text-center py-10">
                  <GraduationCap className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No sessions scheduled</p>
                  <p className="text-xs text-gray-400 mt-1">Schedule a 1:1 with your upline to level up</p>
                  <Button
                    onClick={() => setShowSchedule(true)}
                    className="mt-4 gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Plus className="w-4 h-4" /> Schedule 1:1
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Show pending (sent by me) + accepted */}
                  {sessions
                    .filter((s: any) => (s.status === "pending" && s.requestorId === currentUser?.id) || s.status === "accepted")
                    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .map((s: any) => {
                      const MeetIcon = getMeetingIcon(s.meetingType);
                      const isMyRequest = s.requestorId === currentUser?.id;
                      const otherPerson = isMyRequest ? s.trainerName : s.requestorName;
                      return (
                        <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors" style={{ borderRadius: RADIUS.input }}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.status === "accepted" ? "bg-emerald-100" : "bg-violet-100"}`}>
                              <MeetIcon className={`w-5 h-5 ${s.status === "accepted" ? "text-emerald-600" : "text-violet-600"}`} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                1:1 with {otherPerson}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(s.scheduledAt)} · {s.duration} min{s.topic ? ` · ${s.topic}` : ""}
                              </p>
                              {s.meetingLink && (
                                <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-600 hover:underline">
                                  Join Meeting
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(s.status)}
                            {isMyRequest && s.status === "pending" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => cancelMutation.mutate(s.id)}
                                className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
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

        {/* Past sessions */}
        {pastSessions.length > 0 && (
          <motion.div variants={fadeInUp}>
            <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Past Sessions
                </h2>
                <div className="space-y-2">
                  {pastSessions.slice(0, 10).map((s: any) => {
                    const isMyRequest = s.requestorId === currentUser?.id;
                    const otherPerson = isMyRequest ? s.trainerName : s.requestorName;
                    return (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50/50" style={{ borderRadius: RADIUS.input }}>
                        <div>
                          <p className="text-sm text-gray-700">1:1 with {otherPerson}</p>
                          <p className="text-xs text-gray-400">{formatDate(s.scheduledAt)}{s.topic ? ` · ${s.topic}` : ""}</p>
                        </div>
                        {getStatusBadge(s.status)}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Schedule Dialog */}
        <Dialog open={showSchedule} onOpenChange={(o) => { if (!o) resetForm(); setShowSchedule(o); }}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" style={{ borderRadius: RADIUS.card }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <GraduationCap className="w-5 h-5 text-violet-600" />
                Schedule 1:1 Training
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Select Trainer */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  <User className="w-3.5 h-3.5 inline mr-1.5" />
                  Who do you want to meet with?
                </Label>
                <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                  <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                    <SelectValue placeholder="Select from your upline..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(uplineMembers) ? uplineMembers : []).map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} — {m.title || m.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-gray-600 mb-1 block">Date</Label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600 mb-1 block">Time</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
              </div>

              {/* Duration & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-gray-600 mb-1 block">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 mb-1 block">Meeting Type</Label>
                  <Select value={meetingType} onValueChange={setMeetingType}>
                    <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEETING_TYPES.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Meeting link or location */}
              {(meetingType === "video" || meetingType === "screen_share") && (
                <div>
                  <Label className="text-sm text-gray-600 mb-1 block">Meeting Link (optional)</Label>
                  <Input
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://zoom.us/j/... or Google Meet link"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
              )}
              {meetingType === "in_person" && (
                <div>
                  <Label className="text-sm text-gray-600 mb-1 block">Location</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Office address or meeting spot"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
              )}

              <Separator />

              {/* Topic & Notes */}
              <div>
                <Label className="text-sm text-gray-600 mb-1 block">Topic</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., IUL sales techniques, objection handling, CRM walkthrough"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1 block">Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything specific you want to cover..."
                  rows={3}
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowSchedule(false)} style={{ borderRadius: RADIUS.button }}>
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !selectedTrainer || !scheduledDate || !scheduledTime}
                className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                style={{ borderRadius: RADIUS.button }}
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                Request Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AgentLoungeLayout>
  );
}
