/**
 * EmailContent - Email functionality extracted for Communications hub
 * Provides full email capabilities within a tab interface
 */

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Inbox,
  Send,
  FileText,
  Trash2,
  Star,
  Archive,
  MoreHorizontal,
  Search,
  PenSquare,
  Reply,
  ReplyAll,
  Forward,
  Paperclip,
  RefreshCw,
  MailOpen,
  ArrowLeft,
  Download
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAgentStore } from "@/lib/agentStore";
import { RADIUS, SHADOW, MOTION, TYPE, fadeInUp, spacing } from '@/lib/heritageDesignSystem';
import { type CommColorScheme, getCommTheme } from './commTheme';

// Email folder types
type FolderType = 'inbox' | 'sent' | 'drafts' | 'trash' | 'starred' | 'archive';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Folder configuration
interface FolderConfig {
  id: FolderType;
  label: string;
  icon: LucideIcon;
}

const FOLDERS: FolderConfig[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: FileText },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

interface EmailMessage {
  id: string;
  from: { name: string; email: string };
  to: { name: string; email: string }[];
  subject: string;
  preview: string;
  body: string;
  date: string;
  time: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  folder: FolderType;
  labels?: string[];
}

// Sample emails
const SAMPLE_EMAILS: EmailMessage[] = [
  {
    id: 'email-1',
    from: { name: 'Sarah Mitchell', email: 'sarah.mitchell@heritagels.org' },
    to: [{ name: 'You', email: 'agent@heritagels.org' }],
    subject: 'Great job on the Smith case!',
    preview: 'I wanted to reach out and congratulate you on closing the Smith family policy...',
    body: `Hi there,

I wanted to reach out and congratulate you on closing the Smith family policy. That was a complex case with multiple family members and you handled it beautifully.

The underwriting team was impressed with the thoroughness of your application, and the client has already referred two more leads to us.

Keep up the excellent work!

Best regards,
Sarah Mitchell
Regional Manager`,
    date: 'Today',
    time: '10:32 AM',
    read: false,
    starred: true,
    hasAttachment: false,
    folder: 'inbox',
    labels: ['Important']
  },
  {
    id: 'email-2',
    from: { name: 'Heritage Life Training', email: 'training@heritagels.org' },
    to: [{ name: 'You', email: 'agent@heritagels.org' }],
    subject: 'New Training Module Available: Advanced IUL Strategies',
    preview: 'A new training module has been added to your dashboard. Complete it by...',
    body: `Dear Agent,

A new training module has been added to your dashboard: "Advanced IUL Strategies for High Net Worth Clients"

This module covers:
- Understanding IUL mechanics in depth
- Illustrating IUL benefits effectively
- Overcoming common objections
- Case studies from top producers

Please complete this training by January 31, 2026 to maintain your advanced product certification.

Best,
Heritage Life Training Team`,
    date: 'Today',
    time: '9:15 AM',
    read: false,
    starred: false,
    hasAttachment: true,
    folder: 'inbox',
    labels: ['Training']
  },
  {
    id: 'email-3',
    from: { name: 'John Anderson', email: 'john.anderson@email.com' },
    to: [{ name: 'You', email: 'agent@heritagels.org' }],
    subject: 'Re: Life Insurance Quote Request',
    preview: 'Thank you for sending the quote. I have a few questions about the...',
    body: `Hi,

Thank you for sending the quote. I have a few questions about the term life policy:

1. What happens if I miss a payment?
2. Can I convert to whole life later?
3. Is there a waiting period for the death benefit?

Also, my wife mentioned she might want coverage too. Could you send a quote for her as well? She's 38, non-smoker, excellent health.

Thanks,
John Anderson`,
    date: 'Yesterday',
    time: '2:30 PM',
    read: true,
    starred: true,
    hasAttachment: false,
    folder: 'inbox'
  },
  {
    id: 'email-4',
    from: { name: 'You', email: 'agent@heritagels.org' },
    to: [{ name: 'John Anderson', email: 'john.anderson@email.com' }],
    subject: 'Re: Life Insurance Quote Request',
    preview: 'Hi John, Great questions! Let me address each one...',
    body: `Hi John,

Great questions! Let me address each one:

1. Grace Period: You have a 30-day grace period for missed payments. The policy remains in force during this time.

2. Conversion: Yes! You can convert to whole life at any time during the first 10 years without additional underwriting.

3. Waiting Period: There is no waiting period - the full death benefit is effective from day one.

I'd be happy to prepare a quote for your wife. I'll have that ready by tomorrow.

Would you like to schedule a call to go over everything together?

Best regards,
Your Agent`,
    date: 'Yesterday',
    time: '3:15 PM',
    read: true,
    starred: false,
    hasAttachment: false,
    folder: 'sent'
  },
];

export default function AgentEmailContent({ colorScheme = 'violet' as CommColorScheme }: { colorScheme?: CommColorScheme } = {}) {
  const theme = getCommTheme(colorScheme);
  const { currentUser } = useAgentStore();
  const agentName = currentUser?.name || 'Agent';
  const agentEmail = currentUser?.email || 'agent@heritagels.org';

  const [emails, setEmails] = useState<EmailMessage[]>(SAMPLE_EMAILS);
  const [selectedFolder, setSelectedFolder] = useState<FolderType>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: ''
  });

  const filteredEmails = useMemo(() => {
    let result = emails;
    if (selectedFolder === 'starred') {
      result = result.filter(e => e.starred);
    } else {
      result = result.filter(e => e.folder === selectedFolder);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.subject.toLowerCase().includes(query) ||
        e.from.name.toLowerCase().includes(query) ||
        e.preview.toLowerCase().includes(query)
      );
    }
    return result;
  }, [emails, selectedFolder, searchQuery]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    FOLDERS.forEach(folder => {
      if (folder.id === 'starred') {
        counts[folder.id] = emails.filter(e => e.starred).length;
      } else {
        counts[folder.id] = emails.filter(e => e.folder === folder.id).length;
      }
    });
    return counts;
  }, [emails]);

  const unreadCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    FOLDERS.forEach(folder => {
      if (folder.id === 'starred') {
        counts[folder.id] = emails.filter(e => e.starred && !e.read).length;
      } else {
        counts[folder.id] = emails.filter(e => e.folder === folder.id && !e.read).length;
      }
    });
    return counts;
  }, [emails]);

  const handleSelectEmail = useCallback((email: EmailMessage) => {
    setEmails(prev => prev.map(e =>
      e.id === email.id ? { ...e, read: true } : e
    ));
    setSelectedEmail(email);
  }, []);

  const handleToggleStar = useCallback((emailId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmails(prev => prev.map(email =>
      email.id === emailId ? { ...email, starred: !email.starred } : email
    ));
  }, []);

  const handleToggleSelect = useCallback((emailId: string) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(emailId)) {
        next.delete(emailId);
      } else {
        next.add(emailId);
      }
      return next;
    });
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedEmails.size > 0) {
      setEmails(prev => prev.map(e =>
        selectedEmails.has(e.id) ? { ...e, folder: 'trash' } : e
      ));
      setSelectedEmails(new Set());
      toast.success(`${selectedEmails.size} email(s) moved to trash`);
    } else if (selectedEmail) {
      setEmails(prev => prev.map(e =>
        e.id === selectedEmail.id ? { ...e, folder: 'trash' } : e
      ));
      setSelectedEmail(null);
      toast.success('Email moved to trash');
    }
  }, [selectedEmails, selectedEmail]);

  const handleArchive = useCallback(() => {
    if (selectedEmails.size > 0) {
      setEmails(prev => prev.map(e =>
        selectedEmails.has(e.id) ? { ...e, folder: 'archive' } : e
      ));
      setSelectedEmails(new Set());
      toast.success(`${selectedEmails.size} email(s) archived`);
    } else if (selectedEmail) {
      setEmails(prev => prev.map(e =>
        e.id === selectedEmail.id ? { ...e, folder: 'archive' } : e
      ));
      setSelectedEmail(null);
      toast.success('Email archived');
    }
  }, [selectedEmails, selectedEmail]);

  const handleSendEmail = useCallback(() => {
    if (!composeData.to || !composeData.subject) {
      toast.error('Please fill in recipient and subject');
      return;
    }
    if (!EMAIL_REGEX.test(composeData.to)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const newEmail: EmailMessage = {
      id: `email-${Date.now()}`,
      from: { name: agentName, email: agentEmail },
      to: [{ name: composeData.to.split('@')[0], email: composeData.to }],
      subject: composeData.subject,
      preview: composeData.body.slice(0, 100),
      body: composeData.body,
      date: 'Just now',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      starred: false,
      hasAttachment: false,
      folder: 'sent'
    };

    setEmails(prev => [newEmail, ...prev]);
    setShowCompose(false);
    setComposeData({ to: '', subject: '', body: '' });
    toast.success('Email sent successfully');
  }, [composeData, agentName, agentEmail]);

  const handleRefresh = useCallback(() => {
    toast.info('Checking for new messages...');
  }, []);

  const handleReply = useCallback(() => {
    if (!selectedEmail) return;
    setComposeData({
      to: selectedEmail.from.email,
      subject: selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
      body: `\n\n---\nOn ${selectedEmail.date} at ${selectedEmail.time}, ${selectedEmail.from.name} wrote:\n\n${selectedEmail.body}`
    });
    setShowCompose(true);
  }, [selectedEmail]);

  const handleReplyAll = useCallback(() => {
    if (!selectedEmail) return;
    const allRecipients = [
      selectedEmail.from.email,
      ...selectedEmail.to.filter(t => t.email !== agentEmail).map(t => t.email)
    ].join(', ');
    setComposeData({
      to: allRecipients,
      subject: selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
      body: `\n\n---\nOn ${selectedEmail.date} at ${selectedEmail.time}, ${selectedEmail.from.name} wrote:\n\n${selectedEmail.body}`
    });
    setShowCompose(true);
  }, [selectedEmail, agentEmail]);

  const handleForward = useCallback(() => {
    if (!selectedEmail) return;
    setComposeData({
      to: '',
      subject: selectedEmail.subject.startsWith('Fwd:') ? selectedEmail.subject : `Fwd: ${selectedEmail.subject}`,
      body: `\n\n---\nForwarded message:\nFrom: ${selectedEmail.from.name} <${selectedEmail.from.email}>\nDate: ${selectedEmail.date} at ${selectedEmail.time}\nSubject: ${selectedEmail.subject}\nTo: ${selectedEmail.to.map(t => t.name).join(', ')}\n\n${selectedEmail.body}`
    });
    setShowCompose(true);
  }, [selectedEmail]);

  const [quickReply, setQuickReply] = useState('');

  const handleQuickReply = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmail || !quickReply.trim()) return;

    const replyEmail: EmailMessage = {
      id: `email-${Date.now()}`,
      from: { name: agentName, email: agentEmail },
      to: [{ name: selectedEmail.from.name, email: selectedEmail.from.email }],
      subject: selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
      preview: quickReply.slice(0, 100),
      body: quickReply,
      date: 'Just now',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      starred: false,
      hasAttachment: false,
      folder: 'sent'
    };

    setEmails(prev => [replyEmail, ...prev]);
    setQuickReply('');
    toast.success(`Reply sent to ${selectedEmail.from.name}`);
  }, [selectedEmail, quickReply, agentName, agentEmail]);

  return (
    <motion.div
      variants={fadeInUp}
      className="flex-1 flex overflow-hidden min-h-0 bg-white"
      style={{
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        height: 'calc(100vh - 16rem)',
      }}
    >
      {/* Sidebar - Folders */}
      <nav
        className={cn(
          "w-56 border-r bg-gray-50 flex-col",
          "hidden md:flex"
        )}
        style={{ borderTopLeftRadius: RADIUS.card, borderBottomLeftRadius: RADIUS.card }}
      >
        <div className="p-4 space-y-4">
          <Button
            onClick={() => setShowCompose(true)}
            variant="outline"
            className={cn("w-full gap-2 shadow-sm", theme.composeBtnBg)}
            style={{ borderRadius: RADIUS.button }}
          >
            <PenSquare className={cn("w-4 h-4", theme.composeBtnIcon)} />
            Compose
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <ul className="p-2 space-y-1 list-none">
            {FOLDERS.map(folder => {
              const Icon = folder.icon;
              const isActive = selectedFolder === folder.id;
              const total = folderCounts[folder.id];
              const unread = unreadCounts[folder.id];

              return (
                <li key={folder.id}>
                  <motion.button
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    onClick={() => {
                      setSelectedFolder(folder.id);
                      setSelectedEmail(null);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-2 text-left transition-colors",
                      isActive
                        ? theme.activeBg
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? theme.activeIcon : "text-gray-400")} />
                    <span className="flex-1 text-sm font-medium">{folder.label}</span>
                    {total > 0 && (
                      <Badge
                        className={cn(
                          "text-xs h-5 px-1.5",
                          unread > 0
                            ? theme.unreadBadge
                            : "bg-gray-200 text-gray-600"
                        )}
                      >
                        {total}
                      </Badge>
                    )}
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </nav>

      {/* Email List */}
      <motion.div
        variants={fadeInUp}
        className={cn(
          "w-64 min-w-0 max-w-64 border-r flex flex-col overflow-hidden",
          selectedEmail && "hidden md:flex"
        )}
      >
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="px-4 py-2 border-b flex items-center gap-2">
          <Checkbox
            checked={selectedEmails.size === filteredEmails.length && filteredEmails.length > 0}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedEmails(new Set(filteredEmails.map(e => e.id)));
              } else {
                setSelectedEmails(new Set());
              }
            }}
          />
          {selectedEmails.size > 0 && (
            <>
              <Button variant="ghost" size="icon" onClick={handleArchive}>
                <Archive className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          <span className="text-xs text-gray-500 ml-auto">
            {filteredEmails.length} emails
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRefresh}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 w-full">
          {filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MailOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No emails in this folder</p>
            </div>
          ) : (
            <ul className="list-none py-1 w-full">
              {filteredEmails.map(email => (
                <li key={email.id} className="px-2 py-1 box-border">
                  <div
                    onClick={() => handleSelectEmail(email)}
                    className={cn(
                      "p-3 cursor-pointer transition-all w-full box-border",
                      selectedEmail?.id === email.id
                        ? theme.selectedGradient
                        : !email.read
                          ? `${theme.unreadBg} ${theme.unreadHover}`
                          : "hover:bg-gray-50"
                    )}
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={selectedEmails.has(email.id)}
                        onCheckedChange={() => handleToggleSelect(email.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => handleToggleStar(email.id, e)}
                        className="mt-0.5"
                      >
                        <Star className={cn(
                          "w-4 h-4",
                          email.starred
                            ? "fill-amber-300 text-amber-300"
                            : selectedEmail?.id === email.id
                              ? "text-white/50"
                              : "text-gray-300"
                        )} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            "text-sm truncate",
                            !email.read && "font-semibold"
                          )}>
                            {email.from.name}
                          </span>
                          <time className="text-xs text-gray-500">{email.time}</time>
                        </div>
                        <p className={cn(
                          "text-sm truncate",
                          !email.read ? "font-medium text-gray-900" : "text-gray-700"
                        )}>
                          {email.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {email.preview}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {email.hasAttachment && (
                            <Paperclip className="w-3 h-3 text-gray-400" />
                          )}
                          {email.labels?.map(label => (
                            <Badge
                              key={label}
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1 py-0",
                                selectedEmail?.id === email.id && "border-white/40 text-white bg-white/10"
                              )}
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </motion.div>

      {/* Email Detail */}
      <motion.div
        variants={fadeInUp}
        className={cn(
          "flex-1 flex flex-col",
          !selectedEmail && "hidden md:flex"
        )}
        style={{ borderTopRightRadius: RADIUS.card, borderBottomRightRadius: RADIUS.card }}
      >
        {selectedEmail ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 md:hidden mb-3">
                <Button variant="ghost" size="icon" onClick={() => setSelectedEmail(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-500">Back to inbox</span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className={cn("text-lg font-semibold", theme.heading)}>{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <span className="font-medium">{selectedEmail.from.name}</span>
                    <span className="text-gray-400">&lt;{selectedEmail.from.email}&gt;</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    To: {selectedEmail.to.map(t => t.name).join(', ')} &bull; {selectedEmail.date} at {selectedEmail.time}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={handleReply} title="Reply">
                    <Reply className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleReplyAll} title="Reply All">
                    <ReplyAll className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleForward} title="Forward">
                    <Forward className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleStar(selectedEmail.id)}>
                        <Star className="w-4 h-4 mr-2" />
                        {selectedEmail.starred ? 'Unstar' : 'Star'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleArchive}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <article className="prose prose-sm max-w-none">
                {selectedEmail.body.split('\n').map((line, i) => (
                  <p key={i} className={line === '' ? 'h-4' : ''}>
                    {line}
                  </p>
                ))}
              </article>

              {selectedEmail.hasAttachment && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium mb-3">Attachments</h4>
                  <ul className="flex gap-2 list-none">
                    <li className="flex items-center gap-2 px-4 py-2 bg-gray-100" style={{ borderRadius: RADIUS.button }}>
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Document.pdf</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Download className="w-3 h-3" />
                      </Button>
                    </li>
                  </ul>
                </div>
              )}
            </ScrollArea>

            <form
              className="p-4 border-t bg-gray-50"
              onSubmit={handleQuickReply}
            >
              <div className="flex gap-2">
                <Input
                  placeholder={`Reply to ${selectedEmail.from.name}...`}
                  className="flex-1"
                  value={quickReply}
                  onChange={(e) => setQuickReply(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={!quickReply.trim()}
                  className={cn(theme.sendBtn, "disabled:opacity-50")}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Select an email to read</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Compose Modal */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendEmail();
            }}
            className="space-y-4"
          >
            <div>
              <Input
                type="email"
                placeholder="To: email@example.com"
                value={composeData.to}
                onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                placeholder="Subject"
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="Write your message..."
                value={composeData.body}
                onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                className="min-h-[250px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
                <Button type="submit" className={cn("gap-2", theme.sendBtn)}>
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
