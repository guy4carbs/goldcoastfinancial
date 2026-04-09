import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
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
import { AgentPageHero } from "@/components/agent/primitives";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

// Email folder types
type FolderType = 'inbox' | 'sent' | 'drafts' | 'trash' | 'starred' | 'archive';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Folder configuration - extracted as constant
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
const SAMPLE_EMAILS: EmailMessage[] = [];


export default function AgentEmail() {
  // Get user data from store
  const { currentUser } = useAgentStore();
  const agentName = currentUser?.name || 'Agent';
  const agentEmail = currentUser?.email || 'agent@heritagels.org';

  const [emails, setEmails] = useState<EmailMessage[]>(SAMPLE_EMAILS);
  const [selectedFolder, setSelectedFolder] = useState<FolderType>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // Compose form state
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    subject: '',
    body: ''
  });
  const [quickReplyText, setQuickReplyText] = useState('');

  // Filter emails based on folder and search
  const filteredEmails = useMemo(() => {
    let result = emails;

    // Filter by folder
    if (selectedFolder === 'starred') {
      result = result.filter(e => e.starred);
    } else {
      result = result.filter(e => e.folder === selectedFolder);
    }

    // Filter by search
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

  // Count total emails per folder
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

  // Count unread emails per folder (for visual indicator)
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
    // Mark as read
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

    // Validate email format
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
    setComposeData({ to: '', cc: '', subject: '', body: '' });
    toast.success('Email sent successfully');
  }, [composeData, agentName, agentEmail]);

  const handleRefresh = useCallback(() => {
    // TODO: Implement actual email refresh from server
    toast.info('Checking for new messages...');
  }, []);

  const handleSaveDraft = useCallback(() => {
    if (!composeData.to && !composeData.cc && !composeData.subject && !composeData.body) {
      toast.error('Nothing to save');
      return;
    }

    const draftEmail: EmailMessage = {
      id: `draft-${Date.now()}`,
      from: { name: agentName, email: agentEmail },
      to: composeData.to ? [{ name: composeData.to.split('@')[0], email: composeData.to }] : [],
      subject: composeData.subject || '(No subject)',
      preview: composeData.body.slice(0, 100) || '(No content)',
      body: composeData.body,
      date: 'Just now',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      starred: false,
      hasAttachment: false,
      folder: 'drafts'
    };

    setEmails(prev => [draftEmail, ...prev]);
    setShowCompose(false);
    setComposeData({ to: '', cc: '', subject: '', body: '' });
    toast.success('Draft saved');
  }, [composeData, agentName, agentEmail]);

  const handleReply = useCallback(() => {
    if (!selectedEmail) return;
    const quotedBody = selectedEmail.body || '';
    setComposeData({
      to: selectedEmail.from.email,
      cc: '',
      subject: selectedEmail.subject.startsWith('Re:')
        ? selectedEmail.subject
        : `Re: ${selectedEmail.subject}`,
      body: `\n\n---\nOn ${selectedEmail.date}, ${selectedEmail.from.name} wrote:\n> ${quotedBody.split('\n').join('\n> ')}`,
    });
    setShowCompose(true);
  }, [selectedEmail]);

  const handleReplyAll = useCallback(() => {
    if (!selectedEmail) return;
    const quotedBody = selectedEmail.body || '';
    const allRecipients = [
      selectedEmail.from.email,
      ...(selectedEmail.to || [])
        .filter((t) => t.email !== agentEmail)
        .map((t) => t.email),
    ].join(', ');
    setComposeData({
      to: allRecipients,
      cc: '',
      subject: selectedEmail.subject.startsWith('Re:')
        ? selectedEmail.subject
        : `Re: ${selectedEmail.subject}`,
      body: `\n\n---\nOn ${selectedEmail.date}, ${selectedEmail.from.name} wrote:\n> ${quotedBody.split('\n').join('\n> ')}`,
    });
    setShowCompose(true);
  }, [selectedEmail, agentEmail]);

  const handleForward = useCallback(() => {
    if (!selectedEmail) return;
    const fwdBody = selectedEmail.body || '';
    setComposeData({
      to: '',
      cc: '',
      subject: selectedEmail.subject.startsWith('Fwd:')
        ? selectedEmail.subject
        : `Fwd: ${selectedEmail.subject}`,
      body: `\n\n---\nForwarded message:\nFrom: ${selectedEmail.from.name} <${selectedEmail.from.email}>\nDate: ${selectedEmail.date}\nSubject: ${selectedEmail.subject}\nTo: ${(selectedEmail.to || []).map((t) => `${t.name} <${t.email}>`).join(', ')}\n\n${fwdBody}`,
    });
    setShowCompose(true);
  }, [selectedEmail]);

  const handleQuickReply = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmail || !quickReplyText.trim()) return;
    const quotedBody = selectedEmail.body || '';
    const replyEmail: EmailMessage = {
      id: `email-${Date.now()}`,
      from: { name: agentName, email: agentEmail },
      to: [{ name: selectedEmail.from.name, email: selectedEmail.from.email }],
      subject: selectedEmail.subject.startsWith('Re:')
        ? selectedEmail.subject
        : `Re: ${selectedEmail.subject}`,
      preview: quickReplyText.slice(0, 100),
      body: `${quickReplyText}\n\n---\nOn ${selectedEmail.date}, ${selectedEmail.from.name} wrote:\n> ${quotedBody.split('\n').join('\n> ')}`,
      date: 'Just now',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      starred: false,
      hasAttachment: false,
      folder: 'sent',
    };
    setEmails(prev => [replyEmail, ...prev]);
    setQuickReplyText('');
    toast.success('Reply sent');
  }, [selectedEmail, quickReplyText, agentName, agentEmail]);

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-col"
        style={{ height: 'calc(100vh - 4rem)', gap: spacing(2) }}
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Mail}
            title="Agent Email"
            subtitle="Manage your communications"

          >
            <Button
              onClick={() => setShowCompose(true)}
              className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              <PenSquare className="w-4 h-4" />
              Compose
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* Main Email Interface */}
        <motion.div
          variants={fadeInUp}
          className="flex-1 flex overflow-hidden min-h-0 bg-white"
          style={{
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.card,
          }}
        >
          {/* Sidebar - Folders */}
          <nav
            className={cn(
              "w-56 border-r bg-gray-50 flex-col",
              "hidden md:flex"
            )}
            style={{ borderTopLeftRadius: RADIUS.card, borderBottomLeftRadius: RADIUS.card }}
            aria-label="Email folders"
          >
            <div className="p-3 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Mail className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <span className="font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent text-sm">Email</span>
              </div>
              <Button
                onClick={() => setShowCompose(true)}
                className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md"
                aria-label="Compose new email"
              >
                <PenSquare className="w-4 h-4" aria-hidden="true" />
                Compose
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <ul className="p-2 space-y-1 list-none" role="list">
                {FOLDERS.map(folder => {
                  const Icon = folder.icon;
                  const isActive = selectedFolder === folder.id;
                  const total = folderCounts[folder.id];
                  const unread = unreadCounts[folder.id];

                  return (
                    <li key={folder.id}>
                      <motion.button
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        transition={{ duration: MOTION.duration.hover }}
                        onClick={() => {
                          setSelectedFolder(folder.id);
                          setSelectedEmail(null);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          isActive
                            ? "bg-violet-100 text-violet-700"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={`${folder.label}, ${total} email${total !== 1 ? 's' : ''}${unread > 0 ? `, ${unread} unread` : ''}`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        <span className="flex-1 text-sm font-medium">{folder.label}</span>
                        {total > 0 && (
                          <Badge
                            className={cn(
                              "text-xs h-5 px-1.5",
                              unread > 0
                                ? "bg-violet-600 text-white"
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
              "w-80 border-r flex flex-col",
              selectedEmail && "hidden md:flex"
            )}>
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  aria-label="Search emails"
                />
              </div>
            </div>

            {/* Toolbar */}
            <div className="px-3 py-2 border-b flex items-center gap-2" role="toolbar" aria-label="Email actions">
              <Checkbox
                checked={selectedEmails.size === filteredEmails.length && filteredEmails.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedEmails(new Set(filteredEmails.map(e => e.id)));
                  } else {
                    setSelectedEmails(new Set());
                  }
                }}
                aria-label="Select all emails"
              />
              {selectedEmails.size > 0 && (
                <>
                  <Button variant="ghost" size="icon" onClick={handleArchive} aria-label="Archive selected emails">
                    <Archive className="w-4 h-4" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDelete} aria-label="Delete selected emails">
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </>
              )}
              <span className="text-xs text-gray-500 ml-auto" aria-live="polite">
                {filteredEmails.length} emails
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRefresh} aria-label="Refresh emails">
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </div>

            {/* Email List */}
            <ScrollArea className="flex-1">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MailOpen className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
                  <p>No emails in this folder</p>
                </div>
              ) : (
                <ul className="divide-y list-none" role="list" aria-label="Email list">
                  {filteredEmails.map(email => (
                    <li key={email.id}>
                      <div
                        onClick={() => handleSelectEmail(email)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectEmail(email);
                          }
                        }}
                        className={cn(
                          "p-3 cursor-pointer transition-colors",
                          selectedEmail?.id === email.id && "bg-primary/5",
                          !email.read && "bg-emerald-50/50",
                          "hover:bg-gray-50"
                        )}
                        role="button"
                        tabIndex={0}
                        aria-label={`Email from ${email.from.name}: ${email.subject}${!email.read ? ' (unread)' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={selectedEmails.has(email.id)}
                            onCheckedChange={() => handleToggleSelect(email.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select email from ${email.from.name}`}
                          />
                          <button
                            onClick={(e) => handleToggleStar(email.id, e)}
                            className="mt-0.5"
                            aria-label={email.starred ? 'Unstar email' : 'Star email'}
                            aria-pressed={email.starred}
                          >
                            <Star className={cn(
                              "w-4 h-4",
                              email.starred ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            )} aria-hidden="true" />
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
                                <Paperclip className="w-3 h-3 text-gray-400" aria-hidden="true" />
                              )}
                              {email.labels?.map(label => (
                                <Badge key={label} variant="outline" className="text-[10px] px-1 py-0">
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
            style={{ borderTopRightRadius: RADIUS.card, borderBottomRightRadius: RADIUS.card }}>
            {selectedEmail ? (
              <>
                {/* Detail Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2 md:hidden mb-3">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedEmail(null)} aria-label="Back to inbox">
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    </Button>
                    <span className="text-sm text-gray-500">Back to inbox</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-violet-700">{selectedEmail.subject}</h2>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <span className="font-medium">{selectedEmail.from.name}</span>
                        <span className="text-gray-400">&lt;{selectedEmail.from.email}&gt;</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        To: {selectedEmail.to.map(t => t.name).join(', ')} &bull;{' '}
                        <time dateTime={selectedEmail.date}>{selectedEmail.date}</time> at{' '}
                        <time>{selectedEmail.time}</time>
                      </p>
                    </div>
                    <div className="flex items-center gap-1" role="toolbar" aria-label="Email actions">
                      <Button variant="ghost" size="icon" onClick={handleReply} aria-label="Reply to email">
                        <Reply className="w-4 h-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleReplyAll} aria-label="Reply to all recipients">
                        <ReplyAll className="w-4 h-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleForward} aria-label="Forward email">
                        <Forward className="w-4 h-4" aria-hidden="true" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="More actions">
                            <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleStar(selectedEmail.id)}>
                            <Star className="w-4 h-4 mr-2" aria-hidden="true" />
                            {selectedEmail.starred ? 'Unstar' : 'Star'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleArchive}>
                            <Archive className="w-4 h-4 mr-2" aria-hidden="true" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
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
                        <li className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                          <FileText className="w-4 h-4 text-gray-500" aria-hidden="true" />
                          <span className="text-sm">Document.pdf</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Download Document.pdf">
                            <Download className="w-3 h-3" aria-hidden="true" />
                          </Button>
                        </li>
                      </ul>
                    </div>
                  )}
                </ScrollArea>

                {/* Quick Reply */}
                <form
                  className="p-4 border-t bg-gray-50"
                  onSubmit={handleQuickReply}
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Reply to ${selectedEmail.from.name}...`}
                      className="flex-1"
                      value={quickReplyText}
                      onChange={(e) => setQuickReplyText(e.target.value)}
                      aria-label="Quick reply message"
                    />
                    <Button type="submit" disabled={!quickReplyText.trim()} aria-label="Send quick reply">
                      <Send className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" aria-hidden="true" />
                  <p>Select an email to read</p>
                </div>
              </div>
            )}
          </motion.div>
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
                  type="text"
                  placeholder="To: email@example.com"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  aria-label="Recipient email address"
                  required
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Cc: (optional)"
                  value={composeData.cc}
                  onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                  aria-label="CC recipients"
                />
              </div>
              <div>
                <Input
                  placeholder="Subject"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  aria-label="Email subject"
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Write your message..."
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  className="min-h-[250px]"
                  aria-label="Email message body"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="icon" aria-label="Attach file">
                    <Paperclip className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                  <Button type="button" variant="outline" onClick={handleSaveDraft}>
                    <FileText className="w-4 h-4 mr-1" aria-hidden="true" />
                    Save Draft
                  </Button>
                  <Button type="submit" className="gap-2">
                    <Send className="w-4 h-4" aria-hidden="true" />
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AgentLoungeLayout>
  );
}
