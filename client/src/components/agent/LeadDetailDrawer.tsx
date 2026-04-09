import { useState, useEffect } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Phone, Mail, MapPin, Calendar, Clock, User,
  MessageSquare, Video, FileText, ChevronRight,
  Sparkles, Target, Trophy, X, Send, Plus, Tag,
  History, Bell, BellRing, Check, Save, Edit2, ArrowRight
} from "lucide-react";
import { cn, formatPhone, formatProductLabel } from "@/lib/utils";
import { useLocation } from "wouter";
import { GRID, TYPE, COLORS, RADIUS } from "@/lib/heritageDesignSystem";
import { useAgentStore } from "@/lib/agentStore";
import type { Lead, ActivityLog, LeadReminder } from "@/lib/agentStore";
import { toast } from "sonner";
import { SmartTemplatePanel } from "./SmartTemplatePanel";
import { CrossSellPrompts } from "./CrossSellPrompts";
import { PolicyTracker } from "./PolicyTracker";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActivity: (leadId: string, activity: Omit<ActivityLog, 'id' | 'date' | 'agentId'>) => void;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
}

const PRESET_TAGS = ['Hot Lead', 'Referral', 'Priority', 'Follow Up', 'Cold', 'VIP', 'Needs Quote', 'Budget Concern'];

const statusConfig = {
  new: { label: 'New', color: 'bg-purple-600 text-white', icon: Sparkles },
  contacted: { label: 'Contacted', color: 'bg-amber-500 text-white', icon: Phone },
  qualified: { label: 'Qualified', color: 'bg-violet-600 text-white', icon: Target },
  proposal: { label: 'Proposal', color: 'bg-emerald-500 text-white', icon: FileText },
  closed: { label: 'Closed', color: 'bg-emerald-600 text-white', icon: Trophy },
  lost: { label: 'Lost', color: 'bg-gray-500 text-white', icon: X },
};

const activityTypeConfig = {
  call: { label: 'Call', icon: Phone, color: 'text-primary' },
  text: { label: 'Text', icon: MessageSquare, color: 'text-violet-600' },
  email: { label: 'Email', icon: Mail, color: 'text-primary' },
  meeting: { label: 'Meeting', icon: Video, color: 'text-violet-600' },
  note: { label: 'Note', icon: FileText, color: 'text-muted-foreground' },
};

export function LeadDetailDrawer({
  lead,
  open,
  onOpenChange,
  onAddActivity,
  onUpdateStatus
}: LeadDetailDrawerProps) {
  const { updateLeadNotes, addTagToLead, removeTagFromLead, addLeadReminder, completeReminder } = useAgentStore();
  const [, navigate] = useLocation();

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityType, setActivityType] = useState<ActivityLog['type']>('call');
  const [activityDisposition, setActivityDisposition] = useState<ActivityLog['disposition']>('interested');
  const [activityNotes, setActivityNotes] = useState('');

  // Notes state
  const [leadNotes, setLeadNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Tags state
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Reminders state
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderMessage, setReminderMessage] = useState('');

  // Sync lead notes when lead changes
  useEffect(() => {
    if (lead) {
      setLeadNotes(lead.leadNotes || '');
    }
  }, [lead?.id, lead?.leadNotes]);

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

  const handleSaveNotes = () => {
    if (!lead) return;
    updateLeadNotes(lead.id, leadNotes);
    setIsEditingNotes(false);
    toast.success('Notes saved');
    // Persist to backend (fire-and-forget)
    if (lead.dbId) {
      fetch(`/api/crm/leads/${lead.dbId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes: leadNotes }),
      }).catch((err) => console.warn('[LeadDetailDrawer] Failed to persist lead notes:', err));
    }
  };

  const handleAddTag = (tag: string) => {
    if (!lead || !tag.trim()) return;
    addTagToLead(lead.id, tag.trim());
    setNewTag('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tag: string) => {
    if (!lead) return;
    removeTagFromLead(lead.id, tag);
  };

  const handleAddReminder = () => {
    if (!lead || !reminderDate || !reminderMessage.trim()) return;
    addLeadReminder(lead.id, {
      date: reminderDate,
      time: reminderTime,
      message: reminderMessage,
    });
    setReminderDate('');
    setReminderTime('09:00');
    setReminderMessage('');
    setShowReminderForm(false);
    toast.success('Reminder set');
  };

  const handleCompleteReminder = (reminderId: string) => {
    if (!lead) return;
    completeReminder(lead.id, reminderId);
    toast.success('Reminder completed');
  };

  if (!lead) return null;

  const StatusIcon = statusConfig[lead.status]?.icon || Sparkles;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[560px] p-0 flex flex-col border-0" style={{ backgroundColor: '#fafafa' }}>
        {/* Dark gradient header */}
        <div className="relative" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 40%, #7c3aed 100%)', padding: `${GRID.spacing.lg}px ${GRID.spacing.md}px ${GRID.spacing.md}px` }}>
          <button onClick={() => onOpenChange(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X style={{ width: 20, height: 20, color: 'white' }} />
          </button>
          <div className="flex items-center gap-4" style={{ marginBottom: GRID.spacing.md }}>
            <div className="flex-shrink-0 flex items-center justify-center text-white font-bold" style={{
              width: 56, height: 56, borderRadius: RADIUS.pill,
              backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              border: '2px solid rgba(255,255,255,0.3)', fontSize: TYPE.body,
            }}>
              {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <SheetTitle style={{ fontSize: TYPE.section, fontWeight: 700, color: 'white' }}>{lead.name}</SheetTitle>
              <SheetDescription style={{ fontSize: TYPE.meta, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
                {lead.state || 'No location'}
              </SheetDescription>
            </div>
          </div>
          {/* Stat grid */}
          <div className="grid grid-cols-4 text-center" style={{ gap: GRID.spacing.xs }}>
            {[
              { v: formatProductLabel(lead.product), l: 'Product' },
              { v: lead.coverageAmount ? `$${(lead.coverageAmount / 1000).toFixed(0)}K` : '—', l: 'Coverage' },
              { v: statusConfig[lead.status]?.label || lead.status, l: 'Status' },
              { v: lead.source || 'Direct', l: 'Source' },
            ].map(s => (
              <div key={s.l}>
                <p style={{ fontSize: TYPE.meta, fontWeight: 700, color: 'white' }}>{s.v}</p>
                <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.6)' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column' as const, gap: GRID.spacing.sm }}>
            {/* Contact Info card */}
            <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md }}>
              <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Contact Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5 flex-shrink-0"><Phone className="w-4 h-4" /></span>
                  <div className="min-w-0">
                    <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Phone</p>
                    <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{formatPhone(lead.phone)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5 flex-shrink-0"><Mail className="w-4 h-4" /></span>
                  <div className="min-w-0">
                    <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Email</p>
                    <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{lead.email}</p>
                  </div>
                </div>
              </div>
              {lead.state && (
                <div style={{ marginTop: GRID.spacing.sm }}>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0"><MapPin className="w-4 h-4" /></span>
                    <div className="min-w-0">
                      <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Address</p>
                      <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{lead.state}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lead Details card */}
            <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md }}>
              <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
                <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900] }}>Lead Details</h4>
                {lead.coverageAmount && (
                  <span style={{ fontSize: TYPE.title, fontWeight: 700, color: '#7c3aed' }}>
                    ${lead.coverageAmount >= 1000 ? `${(lead.coverageAmount / 1000).toFixed(0)}K` : lead.coverageAmount.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Source</p>
                  <p className="font-medium" style={{ fontSize: TYPE.meta, color: COLORS.gray[900] }}>{lead.source || 'Direct'}</p>
                </div>
                <div>
                  <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Product</p>
                  <p className="font-medium" style={{ fontSize: TYPE.meta, color: '#7c3aed' }}>{formatProductLabel(lead.product)}</p>
                </div>
                <div>
                  <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Status</p>
                  <Select value={lead.status} onValueChange={(v) => onUpdateStatus(lead.id, v as Lead['status'])}>
                    <SelectTrigger className="h-7 w-auto gap-1.5 px-2 border-gray-200 text-sm font-medium" style={{ borderRadius: RADIUS.input, marginTop: 2 }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5" />
                              {config.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Created</p>
                  <p className="font-medium" style={{ fontSize: TYPE.meta, color: COLORS.gray[900] }}>{lead.createdDate}</p>
                </div>
              </div>
            </div>

            {/* AI Suggested Template */}
            <SmartTemplatePanel lead={lead} compact />

            {/* Policy Tracker */}
            {lead.policyStatus && <PolicyTracker lead={lead} />}

            {/* Cross-Sell Opportunities */}
            {lead.status === 'closed' && lead.policyStatus === 'issued' && (
              <CrossSellPrompts lead={lead} onConvert={(product) => toast.success(`New lead created for ${product}`)} />
            )}

            {/* Tags card */}
            <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md }}>
              <div className="flex items-center justify-between mb-2">
                <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900] }} className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-violet-600" />
                  Tags
                </h4>
                <Button size="sm" variant="ghost" onClick={() => setShowTagInput(!showTagInput)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(lead.tags || []).map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
                {(lead.tags || []).length === 0 && !showTagInput && (
                  <span className="text-xs text-gray-400">No tags</span>
                )}
              </div>
              {showTagInput && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="Add custom tag..." value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTag(newTag)} className="h-8 text-sm" />
                    <Button size="sm" onClick={() => handleAddTag(newTag)} disabled={!newTag.trim()}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_TAGS.filter(t => !(lead.tags || []).includes(t)).map(tag => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-violet-100 text-xs" onClick={() => handleAddTag(tag)}>+ {tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reminders card */}
            <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md }}>
              <div className="flex items-center justify-between mb-2">
                <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900] }} className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-violet-600" />
                  Follow-up Reminders
                </h4>
                <Button size="sm" variant="ghost" onClick={() => setShowReminderForm(!showReminderForm)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {showReminderForm && (
                <div className="p-3 rounded-lg border bg-gray-50 space-y-3 mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Date</Label>
                      <Input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="h-8 mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Time</Label>
                      <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="h-8 mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Message</Label>
                    <Input placeholder="Follow up about..." value={reminderMessage} onChange={(e) => setReminderMessage(e.target.value)} className="h-8 mt-1" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddReminder} disabled={!reminderDate || !reminderMessage}>Set Reminder</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowReminderForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {(lead.reminders || []).filter(r => !r.completed).map(reminder => (
                  <div key={reminder.id} className="flex items-center gap-4 p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <BellRing className="w-4 h-4 text-amber-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{reminder.message}</p>
                      <p className="text-xs text-amber-600">{reminder.date} at {reminder.time}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleCompleteReminder(reminder.id)}>
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                  </div>
                ))}
                {(lead.reminders || []).filter(r => !r.completed).length === 0 && (
                  <p className="text-xs text-gray-400">No active reminders</p>
                )}
              </div>
            </div>

            {/* Notes card */}
            <div className="border border-gray-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md }}>
              <div className="flex items-center justify-between mb-2">
                <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900] }} className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-600" />
                  Notes
                </h4>
                {!isEditingNotes ? (
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingNotes(true)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={handleSaveNotes}>
                    <Save className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {isEditingNotes ? (
                <Textarea value={leadNotes} onChange={(e) => setLeadNotes(e.target.value)} placeholder="Add notes about this lead..." className="min-h-[100px]" />
              ) : (
                <div className="p-3 rounded-lg bg-gray-50 min-h-[60px]">
                  {leadNotes ? (
                    <p className="text-sm whitespace-pre-wrap">{leadNotes}</p>
                  ) : (
                    <p className="text-sm text-gray-400">No notes yet. Click edit to add.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer: Call, Email, Schedule */}
        <div className="border-t bg-white/80 backdrop-blur-sm flex gap-3" style={{ padding: '16px 20px' }}>
          <button
            className="flex-1 flex items-center justify-center gap-2 transition-all duration-200 hover:bg-gray-100 active:scale-[0.97]"
            style={{
              height: 44, borderRadius: RADIUS.button,
              background: 'white', color: COLORS.gray[700],
              fontSize: TYPE.meta, fontWeight: 600,
              border: `1px solid ${COLORS.gray[200]}`, cursor: 'pointer',
            }}
            onClick={() => window.open(`tel:${lead.phone}`, '_self')}
            data-testid="button-call-lead"
          >
            <Phone style={{ width: 16, height: 16 }} />
            Call
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 transition-all duration-200 hover:bg-gray-100 active:scale-[0.97]"
            style={{
              height: 44, borderRadius: RADIUS.button,
              background: 'white', color: COLORS.gray[700],
              fontSize: TYPE.meta, fontWeight: 600,
              border: `1px solid ${COLORS.gray[200]}`, cursor: 'pointer',
            }}
            onClick={() => window.open(`mailto:${lead.email}?subject=Following up on your life insurance inquiry`, '_blank')}
            data-testid="button-email-lead"
          >
            <Mail style={{ width: 16, height: 16 }} />
            Email
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 transition-all duration-200 hover:bg-gray-100 active:scale-[0.97]"
            style={{
              height: 44, borderRadius: RADIUS.button,
              background: 'white', color: COLORS.gray[700],
              fontSize: TYPE.meta, fontWeight: 600,
              border: `1px solid ${COLORS.gray[200]}`, cursor: 'pointer',
            }}
            onClick={() => {
              const params = new URLSearchParams({
                schedule: 'true',
                name: lead.name,
                phone: lead.phone || '',
                email: lead.email || '',
                product: lead.product || '',
              });
              onOpenChange(false);
              navigate(`/agents/calendar?${params.toString()}`);
            }}
            data-testid="button-schedule-lead"
          >
            <Calendar style={{ width: 16, height: 16 }} />
            Schedule
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
