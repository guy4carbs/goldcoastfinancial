import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Phone, Mail, MapPin, Calendar, Clock, User, 
  MessageSquare, Video, FileText, ChevronRight,
  Sparkles, Target, Trophy, X, Send, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead, ActivityLog } from "@/lib/agentStore";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActivity: (leadId: string, activity: Omit<ActivityLog, 'id' | 'date' | 'agentId'>) => void;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
}

const statusConfig = {
  new: { label: 'New', color: 'bg-[#541221] text-white', icon: Sparkles },
  contacted: { label: 'Contacted', color: 'bg-[#6b2c3d] text-white', icon: Phone },
  qualified: { label: 'Qualified', color: 'bg-[#8b4a5c] text-white', icon: Target },
  proposal: { label: 'Proposal', color: 'bg-[#E1B138] text-white', icon: FileText },
  closed: { label: 'Closed', color: 'bg-[#c49a2f] text-white', icon: Trophy },
  lost: { label: 'Lost', color: 'bg-gray-500 text-white', icon: X },
};

const activityTypeConfig = {
  call: { label: 'Call', icon: Phone, color: 'text-primary' },
  text: { label: 'Text', icon: MessageSquare, color: 'text-secondary' },
  email: { label: 'Email', icon: Mail, color: 'text-primary' },
  meeting: { label: 'Meeting', icon: Video, color: 'text-secondary' },
  note: { label: 'Note', icon: FileText, color: 'text-muted-foreground' },
};

export function LeadDetailDrawer({ 
  lead, 
  open, 
  onOpenChange,
  onAddActivity,
  onUpdateStatus
}: LeadDetailDrawerProps) {
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityType, setActivityType] = useState<ActivityLog['type']>('call');
  const [activityDisposition, setActivityDisposition] = useState<ActivityLog['disposition']>('interested');
  const [activityNotes, setActivityNotes] = useState('');

  const handleSubmitActivity = () => {
    if (!lead || !activityNotes.trim()) return;
    onAddActivity(lead.id, {
      type: activityType,
      disposition: activityDisposition,
      notes: activityNotes,
    });
    setActivityNotes('');
    setShowActivityForm(false);
  };

  if (!lead) return null;

  const StatusIcon = statusConfig[lead.status]?.icon || Sparkles;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg font-bold">
                {lead.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <SheetTitle className="text-xl font-serif">{lead.name}</SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-1">
                  {lead.product && <Badge variant="outline" className="text-xs">{lead.product}</Badge>}
                  {lead.state && <span className="text-xs">{lead.state}</span>}
                </SheetDescription>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Select value={lead.status} onValueChange={(v) => onUpdateStatus(lead.id, v as Lead['status'])}>
              <SelectTrigger className={cn("w-auto gap-2", statusConfig[lead.status].color)}>
                <StatusIcon className="w-4 h-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <div className="grid gap-4">
              <a 
                href={`tel:${lead.phone}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                data-testid="link-phone"
              >
                <Phone className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{lead.phone}</p>
                  <p className="text-xs text-muted-foreground">Tap to call</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              
              <a 
                href={`mailto:${lead.email}?subject=Following up on your life insurance inquiry`}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                data-testid="link-email"
              >
                <Mail className="w-5 h-5 text-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{lead.email}</p>
                  <p className="text-xs text-muted-foreground">Tap to email</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{lead.createdDate}</p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
              </div>

              {lead.lastContactDate && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{lead.lastContactDate}</p>
                    <p className="text-xs text-muted-foreground">Last Contact</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-secondary" />
                  Activity Timeline
                </h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1"
                  onClick={() => setShowActivityForm(!showActivityForm)}
                >
                  <Plus className="w-4 h-4" />
                  Log Activity
                </Button>
              </div>

              <AnimatePresence>
                {showActivityForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Type</Label>
                          <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityLog['type'])}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(activityTypeConfig).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="w-4 h-4" />
                                      {config.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Outcome</Label>
                          <Select value={activityDisposition} onValueChange={(v) => setActivityDisposition(v as ActivityLog['disposition'])}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="interested">Interested</SelectItem>
                              <SelectItem value="callback">Callback</SelectItem>
                              <SelectItem value="appointment_set">Appointment Set</SelectItem>
                              <SelectItem value="not_interested">Not Interested</SelectItem>
                              <SelectItem value="no_answer">No Answer</SelectItem>
                              <SelectItem value="voicemail">Voicemail</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Notes</Label>
                        <Textarea 
                          value={activityNotes}
                          onChange={(e) => setActivityNotes(e.target.value)}
                          placeholder="Add notes about this activity..."
                          className="mt-1 min-h-[80px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="gap-1 bg-secondary hover:bg-secondary/90"
                          onClick={handleSubmitActivity}
                        >
                          <Send className="w-4 h-4" />
                          Save Activity
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowActivityForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {lead.notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No activity logged yet</p>
                  <p className="text-xs mt-1">Log your first interaction above</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
                  <div className="space-y-4">
                    {[...lead.notes].reverse().map((activity, idx) => {
                      const config = activityTypeConfig[activity.type];
                      const Icon = config.icon;
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="relative pl-10"
                        >
                          <div className={cn(
                            "absolute left-2 top-1 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center",
                            activity.type === 'call' && "border-primary",
                            activity.type === 'email' && "border-primary",
                            activity.type === 'meeting' && "border-secondary",
                            activity.type === 'text' && "border-secondary",
                            activity.type === 'note' && "border-muted-foreground"
                          )}>
                            <Icon className={cn("w-3 h-3", config.color)} />
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50 border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium capitalize">{activity.type}</span>
                              <span className="text-[10px] text-muted-foreground">{activity.date}</span>
                            </div>
                            {activity.disposition && (
                              <Badge variant="outline" className="text-[10px] mb-2 capitalize">
                                {activity.disposition.replace('_', ' ')}
                              </Badge>
                            )}
                            <p className="text-sm text-muted-foreground">{activity.notes}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="border-t p-4 bg-muted/30 flex gap-2">
          <Button 
            className="flex-1 gap-2" 
            variant="outline"
            onClick={() => window.open(`tel:${lead.phone}`, '_self')}
            data-testid="button-call-lead"
          >
            <Phone className="w-4 h-4" />
            Call
          </Button>
          <Button 
            className="flex-1 gap-2" 
            variant="outline"
            onClick={() => window.open(`mailto:${lead.email}?subject=Following up on your life insurance inquiry`, '_blank')}
            data-testid="button-email-lead"
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button 
            className="flex-1 gap-2 bg-secondary hover:bg-secondary/90"
            onClick={() => window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Insurance Consultation - ${lead.name}&details=Phone: ${lead.phone}%0AEmail: ${lead.email}%0AProduct Interest: ${lead.product || 'Life Insurance'}`, '_blank')}
            data-testid="button-schedule-lead"
          >
            <Calendar className="w-4 h-4" />
            Schedule
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
