/**
 * EmailContent - Per-agent email system for the Agent Lounge Communications hub.
 *
 * Two modes:
 *   1) Not connected  — shows a "Connect Your Email" prompt with Gmail / Outlook / IMAP options.
 *   2) Connected       — full email client (folder sidebar, message list, detail view, compose).
 *
 * All data flows through the per-agent email API (/api/email/*).
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  Download,
  LogOut,
  Loader2,
  Globe,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAgentStore } from "@/lib/agentStore";
import { RADIUS, SHADOW, MOTION, fadeInUp, spacing } from "@/lib/heritageDesignSystem";
import { type CommColorScheme, getCommTheme } from "./commTheme";

// ─── Types ───────────────────────────────────────────────────────────────────

type FolderType = "inbox" | "sent" | "drafts" | "trash" | "starred" | "archive";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FolderConfig {
  id: FolderType;
  label: string;
  icon: LucideIcon;
}

const FOLDERS: FolderConfig[] = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "starred", label: "Starred", icon: Star },
  { id: "sent", label: "Sent", icon: Send },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "trash", label: "Trash", icon: Trash2 },
];

interface EmailAddress {
  name: string;
  email: string;
}

interface EmailMessage {
  id: string;
  threadId?: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  subject: string;
  snippet?: string;
  body?: string;
  bodyHtml?: string;
  bodyText?: string;
  date: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  folder: FolderType;
  labels?: string[];
}

interface EmailConnection {
  id: string;
  provider: "gmail" | "outlook" | "imap";
  email: string;
  displayName: string;
  status: string;
  lastSyncAt: string | null;
}

// ─── Provider Presets ────────────────────────────────────────────────────────

const GmailIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const OutlookIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
    <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.16.154-.352.232-.578.232h-8.34v-6.11l1.845 1.35a.29.29 0 00.346 0l6.728-4.882a.584.584 0 01.237.356z" fill="#0078D4"/>
    <path d="M24 5.997a.96.96 0 00-.088-.2.81.81 0 00-.594-.36H14.844v5.886l1.845 1.35.19.003.156-.052 6.728-4.884A.96.96 0 0024 6.847v-.85z" fill="#0078D4"/>
    <path d="M13.1 20.61H1.63c-.45 0-.834-.16-1.15-.478A1.57 1.57 0 010 18.978V5.022c0-.452.16-.836.48-1.154.317-.318.7-.478 1.15-.478H13.1c.45 0 .834.16 1.152.478.316.318.475.702.475 1.154v13.956c0 .452-.16.836-.475 1.154a1.57 1.57 0 01-1.152.478z" fill="#0078D4"/>
    <path d="M8.478 7.56c-1.217 0-2.2.39-2.95 1.17-.75.78-1.125 1.8-1.125 3.057s.38 2.276 1.14 3.055c.76.78 1.737 1.17 2.935 1.17s2.175-.39 2.935-1.17c.76-.78 1.14-1.798 1.14-3.055s-.375-2.276-1.125-3.057c-.75-.78-1.733-1.17-2.95-1.17zm0 1.428c.766 0 1.375.27 1.825.81.45.54.675 1.26.675 2.16 0 .9-.225 1.62-.675 2.16-.45.54-1.06.81-1.825.81-.766 0-1.375-.27-1.825-.81-.45-.54-.675-1.26-.675-2.16 0-.9.225-1.62.675-2.16.45-.54 1.06-.81 1.825-.81z" fill="white"/>
  </svg>
);

const ICloudIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 170 170" fill="none">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.28 2.13-9.54 3.25-12.8 3.35-4.93.21-9.84-1.96-14.75-6.52-3.13-2.73-7.04-7.41-11.75-14.04-5.03-7.08-9.17-15.29-12.41-24.65-3.47-10.2-5.21-20.07-5.21-29.59 0-10.95 2.36-20.37 7.1-28.26 3.72-6.33 8.67-11.32 14.88-14.99 6.2-3.66 12.9-5.53 20.12-5.63 3.91 0 9.05 1.21 15.43 3.59 6.36 2.39 10.45 3.6 12.24 3.6 1.34 0 5.87-1.42 13.57-4.22 7.28-2.6 13.42-3.68 18.45-3.24 13.63 1.1 23.87 6.47 30.68 16.15-12.2 7.39-18.22 17.73-18.08 31 .14 10.33 3.86 18.94 11.15 25.77 3.32 3.15 7.02 5.58 11.14 7.32-.89 2.6-1.84 5.08-2.84 7.47zM119.04 7.01c0 8.1-2.96 15.66-8.86 22.67-7.12 8.32-15.73 13.12-25.07 12.36a25.2 25.2 0 01-.19-3.07c0-7.77 3.39-16.09 9.4-22.89 3-3.44 6.82-6.31 11.45-8.6 4.62-2.26 8.99-3.51 13.1-3.74.12 1.1.17 2.2.17 3.27z" fill="#1D1D1F"/>
  </svg>
);

const YahooIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#6001D2"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="serif">Y!</text>
  </svg>
);

interface EmailProviderPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  helpUrl: string;
  helpText: string;
}

const EMAIL_PROVIDERS: EmailProviderPreset[] = [
  {
    id: 'gmail', name: 'Gmail',
    icon: <GmailIcon />,
    color: 'hover:border-red-300 hover:bg-red-50/30',
    imapHost: 'imap.gmail.com', imapPort: 993,
    smtpHost: 'smtp.gmail.com', smtpPort: 587,
    helpUrl: 'https://myaccount.google.com/apppasswords',
    helpText: 'Use a Google App Password (not your regular password)',
  },
  {
    id: 'outlook', name: 'Outlook',
    icon: <OutlookIcon />,
    color: 'hover:border-blue-300 hover:bg-blue-50/30',
    imapHost: 'outlook.office365.com', imapPort: 993,
    smtpHost: 'smtp.office365.com', smtpPort: 587,
    helpUrl: 'https://account.live.com/proofs/AppPassword',
    helpText: 'Use a Microsoft App Password',
  },
  {
    id: 'icloud', name: 'iCloud',
    icon: <ICloudIcon />,
    color: 'hover:border-gray-400 hover:bg-gray-50/50',
    imapHost: 'imap.mail.me.com', imapPort: 993,
    smtpHost: 'smtp.mail.me.com', smtpPort: 587,
    helpUrl: 'https://appleid.apple.com/account/manage',
    helpText: 'Use an App-Specific Password from Apple ID',
  },
  {
    id: 'yahoo', name: 'Yahoo',
    icon: <YahooIcon />,
    color: 'hover:border-purple-300 hover:bg-purple-50/30',
    imapHost: 'imap.mail.yahoo.com', imapPort: 993,
    smtpHost: 'smtp.mail.yahoo.com', smtpPort: 587,
    helpUrl: 'https://login.yahoo.com/account/security',
    helpText: 'Use a Yahoo App Password',
  },
  {
    id: 'other', name: 'Other',
    icon: <Globe className="w-7 h-7 text-gray-500" />,
    color: 'hover:border-gray-300 hover:bg-gray-50/50',
    imapHost: '', imapPort: 993,
    smtpHost: '', smtpPort: 587,
    helpUrl: '',
    helpText: 'Enter your IMAP/SMTP settings manually',
  },
];

// ─── Connect Prompt (Mode 1) ────────────────────────────────────────────────

function ConnectEmailPrompt({
  theme,
  onImapConnect,
  isConnecting,
}: {
  theme: ReturnType<typeof getCommTheme>;
  onImapConnect: (data: any) => void;
  isConnecting?: boolean;
}) {
  const [selectedProvider, setSelectedProvider] = useState<EmailProviderPreset | null>(null);
  const [imapData, setImapData] = useState({
    email: "",
    password: "",
    imapHost: "",
    imapPort: "993",
    smtpHost: "",
    smtpPort: "587",
  });

  const handleSelectProvider = (provider: EmailProviderPreset) => {
    setSelectedProvider(provider);
    setImapData({
      email: "",
      password: "",
      imapHost: provider.imapHost,
      imapPort: String(provider.imapPort),
      smtpHost: provider.smtpHost,
      smtpPort: String(provider.smtpPort),
    });
  };

  const handleBack = () => {
    setSelectedProvider(null);
    setImapData({ email: "", password: "", imapHost: "", imapPort: "993", smtpHost: "", smtpPort: "587" });
  };

  const isKnownProvider = selectedProvider && selectedProvider.id !== 'other';

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="flex-1 flex items-center justify-center bg-white overflow-y-auto"
      style={{
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        height: "calc(100vh - 16rem)",
      }}
    >
      <div className="text-center max-w-xl px-8 py-6 w-full">
        {!selectedProvider && (
          <>
            <div
              className={cn(
                "w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl",
                theme.bg100
              )}
            >
              <Mail className={cn("w-8 h-8", theme.accent600)} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Connect Your Email
            </h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Send and receive messages right from your Agent Lounge.
            </p>
          </>
        )}

        {!selectedProvider ? (
          /* ── Provider Selection Grid ─────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-lg mx-auto"
          >
            {EMAIL_PROVIDERS.map((provider) => (
              <motion.button
                key={provider.id}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectProvider(provider)}
                className={cn(
                  "flex flex-col items-center gap-2.5 p-4 bg-white border-2 border-gray-100 transition-all cursor-pointer",
                  provider.color
                )}
                style={{ borderRadius: RADIUS.card }}
              >
                {provider.icon}
                <span className="text-sm font-semibold text-gray-700">{provider.name}</span>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          /* ── Connect Form ────────────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-left w-full max-w-md mx-auto"
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">{selectedProvider.icon}</div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  Connect {selectedProvider.name}
                </h3>
              </div>
            </div>

            {/* Step-by-step guide for known providers */}
            {isKnownProvider && selectedProvider.helpUrl && (
              <div
                className="mb-4 p-3"
                style={{
                  borderRadius: RADIUS.button,
                  background: '#f8f7ff',
                  border: '1px solid #ede9fe',
                }}
              >
                <p className="font-semibold text-gray-700 mb-1.5 text-xs">How to get your App Password:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-gray-500 text-xs leading-relaxed">
                  {selectedProvider.id === 'gmail' && (
                    <>
                      <li>Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">Google Account Security</a></li>
                      <li>Make sure <strong>2-Step Verification</strong> is turned on</li>
                      <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">App Passwords</a> and create one for "Mail"</li>
                      <li>Copy the 16-character password and paste it below</li>
                    </>
                  )}
                  {selectedProvider.id === 'outlook' && (
                    <>
                      <li>Go to <a href="https://account.live.com/proofs/AppPassword" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">Microsoft App Passwords</a></li>
                      <li>Sign in and click "Create a new app password"</li>
                      <li>Copy the password and paste it below</li>
                    </>
                  )}
                  {selectedProvider.id === 'icloud' && (
                    <>
                      <li>Go to <a href="https://appleid.apple.com/account/manage" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">Apple ID Settings</a></li>
                      <li>Under "Sign-In and Security", click "App-Specific Passwords"</li>
                      <li>Generate a password for "Heritage Mail" and paste it below</li>
                    </>
                  )}
                  {selectedProvider.id === 'yahoo' && (
                    <>
                      <li>Go to <a href="https://login.yahoo.com/account/security" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">Yahoo Account Security</a></li>
                      <li>Click "Generate app password" and select "Other App"</li>
                      <li>Copy the password and paste it below</li>
                    </>
                  )}
                </ol>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Email Address</label>
                <Input
                  type="email"
                  className="h-10"
                  style={{ borderRadius: RADIUS.input }}
                  placeholder={`you@${selectedProvider.id === 'other' ? 'provider.com' : selectedProvider.name.toLowerCase() + '.com'}`}
                  value={imapData.email}
                  onChange={(e) => setImapData({ ...imapData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  App Password
                </label>
                <Input
                  type="password"
                  className="h-10"
                  style={{ borderRadius: RADIUS.input }}
                  placeholder="Paste your app password here"
                  value={imapData.password}
                  onChange={(e) => setImapData({ ...imapData, password: e.target.value })}
                />
              </div>

              {/* Server settings — only shown for "Other" provider */}
              {!isKnownProvider && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">IMAP Server</label>
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        placeholder="imap.provider.com"
                        className="col-span-3"
                        value={imapData.imapHost}
                        onChange={(e) => setImapData({ ...imapData, imapHost: e.target.value })}
                      />
                      <Input
                        placeholder="993"
                        value={imapData.imapPort}
                        onChange={(e) => setImapData({ ...imapData, imapPort: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">SMTP Server</label>
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        placeholder="smtp.provider.com"
                        className="col-span-3"
                        value={imapData.smtpHost}
                        onChange={(e) => setImapData({ ...imapData, smtpHost: e.target.value })}
                      />
                      <Input
                        placeholder="587"
                        value={imapData.smtpPort}
                        onChange={(e) => setImapData({ ...imapData, smtpPort: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-10"
                  style={{ borderRadius: RADIUS.button }}
                  disabled={isConnecting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!imapData.email || !imapData.password) {
                      toast.error("Email and app password are required");
                      return;
                    }
                    if (!imapData.imapHost) {
                      toast.error("IMAP host is required");
                      return;
                    }
                    onImapConnect({
                      email: imapData.email,
                      password: imapData.password,
                      imapHost: imapData.imapHost,
                      imapPort: parseInt(imapData.imapPort) || 993,
                      smtpHost: imapData.smtpHost || undefined,
                      smtpPort: parseInt(imapData.smtpPort) || 587,
                    });
                  }}
                  disabled={isConnecting}
                  className="flex-1 gap-2 h-10 bg-violet-600 hover:bg-violet-700 text-white"
                  style={{ borderRadius: RADIUS.button }}
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {isConnecting ? "Testing connection..." : "Test & Connect"}
                </Button>
              </div>
              <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1 mt-2">
                <Shield className="w-3 h-3" />
                Tested before saving
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AgentEmailContent({
  colorScheme = "violet" as CommColorScheme,
}: { colorScheme?: CommColorScheme } = {}) {
  const theme = getCommTheme(colorScheme);
  const { currentUser } = useAgentStore();
  const agentName = currentUser?.name || "Agent";
  const agentEmail = currentUser?.email || "agent@heritagels.org";

  const queryClient = useQueryClient();

  // ── Connection status ────────────────────────────────────────────────────
  const {
    data: connectionData,
    isLoading: connectionLoading,
  } = useQuery<{ connection: EmailConnection | null }>({
    queryKey: ["/api/email/connection"],
    refetchInterval: 10000, // Check for connection changes (post-OAuth)
  });

  const connection = connectionData?.connection ?? null;
  const isConnected = connection?.status === "active";

  // Detect OAuth redirect params and show toast
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("email_connected")) {
      toast.success(
        `Email connected via ${params.get("email_connected")?.toUpperCase()}`
      );
      queryClient.invalidateQueries({ queryKey: ["/api/email/connection"] });
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("email_error")) {
      const errCode = params.get("email_error");
      const messages: Record<string, string> = {
        missing_params: "OAuth callback missing parameters",
        no_email: "Could not retrieve email from Google",
        oauth_failed: "OAuth authorization failed. Please try again.",
      };
      toast.error(messages[errCode!] || "Email connection failed");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [queryClient]);

  // ── Folders & messages ───────────────────────────────────────────────────
  const [selectedFolder, setSelectedFolder] = useState<FolderType>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [composeData, setComposeData] = useState({
    to: "",
    cc: "",
    subject: "",
    body: "",
  });
  const [quickReply, setQuickReply] = useState("");

  // Fetch messages for selected folder
  const {
    data: messagesData,
    isLoading: messagesLoading,
    isFetching: messagesFetching,
  } = useQuery<{ messages: EmailMessage[]; total: number }>({
    queryKey: ["/api/email/messages", selectedFolder],
    queryFn: async () => {
      const res = await fetch(
        `/api/email/messages?folder=${selectedFolder}&limit=50`,
        { credentials: "include" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch emails");
      }
      return res.json();
    },
    enabled: isConnected,
    refetchInterval: 30000,
  });

  const messages = messagesData?.messages || [];

  // Fetch single message detail when selected
  const {
    data: messageDetail,
    isLoading: detailLoading,
  } = useQuery<{ message: EmailMessage }>({
    queryKey: ["/api/email/messages", selectedEmail?.id],
    queryFn: async () => {
      const res = await fetch(`/api/email/messages/${selectedEmail!.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch email detail");
      return res.json();
    },
    enabled: !!selectedEmail?.id && isConnected,
  });

  // Use detailed message when available, fall back to list item
  const activeEmail = messageDetail?.message || selectedEmail;

  // ── Filtered & counted ───────────────────────────────────────────────────
  const filteredEmails = useMemo(() => {
    let result = messages;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.subject.toLowerCase().includes(query) ||
          e.from.name.toLowerCase().includes(query) ||
          e.from.email.toLowerCase().includes(query) ||
          (e.snippet || "").toLowerCase().includes(query)
      );
    }
    return result;
  }, [messages, searchQuery]);

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.read).length,
    [messages]
  );

  // ── Mutations ────────────────────────────────────────────────────────────

  // Send email
  const sendEmailMutation = useMutation({
    mutationFn: async (data: {
      to: string;
      subject: string;
      body: string;
      cc?: string;
    }) => {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send email");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/email/messages"],
      });
      setShowCompose(false);
      setComposeData({ to: "", cc: "", subject: "", body: "" });
      toast.success("Email sent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send email");
    },
  });

  // Toggle star
  const starMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const res = await fetch(`/api/email/messages/${messageId}/star`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to toggle star");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/email/messages"],
      });
    },
  });

  // Mark as read
  const readMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const res = await fetch(`/api/email/messages/${messageId}/read`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/email/messages"],
      });
    },
  });

  // Delete / trash
  const deleteMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const res = await fetch(`/api/email/messages/${messageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to trash email");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/email/messages"],
      });
      setSelectedEmail(null);
      toast.success("Email moved to trash");
    },
  });

  // Disconnect email
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/email/disconnect", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/email/connection"],
      });
      setSelectedEmail(null);
      toast.success("Email account disconnected");
    },
  });

  // Connect IMAP
  const imapConnectMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/email/connect/imap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to connect IMAP");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/email/connection"],
      });
      toast.success("Email connected successfully! Your inbox is ready.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectEmail = useCallback(
    (email: EmailMessage) => {
      setSelectedEmail(email);
      if (!email.read) {
        readMutation.mutate(email.id);
      }
    },
    [readMutation]
  );

  const handleToggleStar = useCallback(
    (emailId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      starMutation.mutate(emailId);
    },
    [starMutation]
  );

  const handleToggleSelect = useCallback((emailId: string) => {
    setSelectedEmails((prev) => {
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
      selectedEmails.forEach((id) => deleteMutation.mutate(id));
      setSelectedEmails(new Set());
    } else if (selectedEmail) {
      deleteMutation.mutate(selectedEmail.id);
    }
  }, [selectedEmails, selectedEmail, deleteMutation]);

  const handleSendEmail = useCallback(() => {
    if (!composeData.to || !composeData.subject) {
      toast.error("Please fill in recipient and subject");
      return;
    }
    if (!EMAIL_REGEX.test(composeData.to.split(",")[0].trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    sendEmailMutation.mutate({
      to: composeData.to,
      subject: composeData.subject,
      body: composeData.body,
      cc: composeData.cc || undefined,
    });
  }, [composeData, sendEmailMutation]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/email/messages"] });
    toast.info("Refreshing emails...");
  }, [queryClient]);

  const handleReply = useCallback(() => {
    if (!activeEmail) return;
    setComposeData({
      to: activeEmail.from.email,
      cc: "",
      subject: activeEmail.subject.startsWith("Re:")
        ? activeEmail.subject
        : `Re: ${activeEmail.subject}`,
      body: `\n\n---\nOn ${activeEmail.date}, ${activeEmail.from.name} wrote:\n\n${activeEmail.bodyText || activeEmail.body || activeEmail.snippet || ""}`,
    });
    setShowCompose(true);
  }, [activeEmail]);

  const handleReplyAll = useCallback(() => {
    if (!activeEmail) return;
    const allRecipients = [
      activeEmail.from.email,
      ...(activeEmail.to || [])
        .filter((t) => t.email !== (connection?.email || agentEmail))
        .map((t) => t.email),
    ].join(", ");
    setComposeData({
      to: allRecipients,
      cc: (activeEmail.cc || []).map((c) => c.email).join(", "),
      subject: activeEmail.subject.startsWith("Re:")
        ? activeEmail.subject
        : `Re: ${activeEmail.subject}`,
      body: `\n\n---\nOn ${activeEmail.date}, ${activeEmail.from.name} wrote:\n\n${activeEmail.bodyText || activeEmail.body || activeEmail.snippet || ""}`,
    });
    setShowCompose(true);
  }, [activeEmail, connection, agentEmail]);

  const handleForward = useCallback(() => {
    if (!activeEmail) return;
    setComposeData({
      to: "",
      cc: "",
      subject: activeEmail.subject.startsWith("Fwd:")
        ? activeEmail.subject
        : `Fwd: ${activeEmail.subject}`,
      body: `\n\n---\nForwarded message:\nFrom: ${activeEmail.from.name} <${activeEmail.from.email}>\nDate: ${activeEmail.date}\nSubject: ${activeEmail.subject}\nTo: ${(activeEmail.to || []).map((t) => t.name).join(", ")}\n\n${activeEmail.bodyText || activeEmail.body || activeEmail.snippet || ""}`,
    });
    setShowCompose(true);
  }, [activeEmail]);

  const handleQuickReply = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeEmail || !quickReply.trim()) return;
      sendEmailMutation.mutate({
        to: activeEmail.from.email,
        subject: activeEmail.subject.startsWith("Re:")
          ? activeEmail.subject
          : `Re: ${activeEmail.subject}`,
        body: quickReply,
      });
      setQuickReply("");
    },
    [activeEmail, quickReply, sendEmailMutation]
  );

  // ── Loading state ────────────────────────────────────────────────────────

  if (connectionLoading) {
    return (
      <div
        className="flex-1 flex items-center justify-center bg-white"
        style={{
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
          height: "calc(100vh - 16rem)",
        }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ── Mode 1: Not connected ────────────────────────────────────────────────

  if (!isConnected) {
    return (
      <ConnectEmailPrompt
        theme={theme}
        onImapConnect={(data) => imapConnectMutation.mutate(data)}
        isConnecting={imapConnectMutation.isPending}
      />
    );
  }

  // ── Mode 2: Connected — Full email client ────────────────────────────────

  /** Format date for display */
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatFullDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })} at ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      className="flex-1 flex overflow-hidden min-h-0 bg-white"
      style={{
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        height: "calc(100vh - 16rem)",
      }}
    >
      {/* ─── Sidebar — Folders ──────────────────────────────────────────── */}
      <nav
        className={cn("w-56 border-r bg-gray-50 flex-col", "hidden md:flex")}
        style={{
          borderTopLeftRadius: RADIUS.card,
          borderBottomLeftRadius: RADIUS.card,
        }}
      >
        <div className="p-4 space-y-3">
          <Button
            onClick={() => setShowCompose(true)}
            variant="outline"
            className={cn("w-full gap-2 shadow-sm", theme.composeBtnBg)}
            style={{ borderRadius: RADIUS.button }}
          >
            <PenSquare className={cn("w-4 h-4", theme.composeBtnIcon)} />
            Compose
          </Button>

          {/* Connected account indicator */}
          <div className="flex items-center gap-2 px-2 py-1.5 bg-white border rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-700 truncate">
                {connection.displayName}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {connection.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => disconnectMutation.mutate()}
              title="Disconnect email"
            >
              <LogOut className="w-3 h-3 text-gray-400" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <ul className="p-2 space-y-1 list-none">
            {FOLDERS.map((folder) => {
              const Icon = folder.icon;
              const isActive = selectedFolder === folder.id;

              return (
                <li key={folder.id}>
                  <motion.button
                    whileHover={{
                      y: MOTION.hover.y,
                      scale: MOTION.hover.scale,
                    }}
                    transition={{
                      duration: MOTION.duration.hover,
                      ease: MOTION.easing,
                    }}
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
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isActive ? theme.activeIcon : "text-gray-400"
                      )}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {folder.label}
                    </span>
                    {folder.id === "inbox" && unreadCount > 0 && (
                      <Badge className={cn("text-xs h-5 px-1.5", theme.unreadBadge)}>
                        {unreadCount}
                      </Badge>
                    )}
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </nav>

      {/* ─── Email List ─────────────────────────────────────────────────── */}
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
            checked={
              selectedEmails.size === filteredEmails.length &&
              filteredEmails.length > 0
            }
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedEmails(new Set(filteredEmails.map((e) => e.id)));
              } else {
                setSelectedEmails(new Set());
              }
            }}
          />
          {selectedEmails.size > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <span className="text-xs text-gray-500 ml-auto">
            {filteredEmails.length} emails
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRefresh}
          >
            <RefreshCw
              className={cn(
                "w-3.5 h-3.5",
                messagesFetching && "animate-spin"
              )}
            />
          </Button>
        </div>

        <ScrollArea className="flex-1 w-full">
          {messagesLoading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
              <p className="text-sm">Loading emails...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MailOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No emails in this folder</p>
            </div>
          ) : (
            <ul className="list-none py-1 w-full">
              {filteredEmails.map((email) => (
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
                        <Star
                          className={cn(
                            "w-4 h-4",
                            email.starred
                              ? "fill-amber-300 text-amber-300"
                              : selectedEmail?.id === email.id
                              ? "text-white/50"
                              : "text-gray-300"
                          )}
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              "text-sm truncate",
                              !email.read && "font-semibold"
                            )}
                          >
                            {email.from.name}
                          </span>
                          <time className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatDate(email.date)}
                          </time>
                        </div>
                        <p
                          className={cn(
                            "text-sm truncate",
                            !email.read
                              ? "font-medium text-gray-900"
                              : "text-gray-700"
                          )}
                        >
                          {email.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {email.snippet}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {email.hasAttachment && (
                            <Paperclip className="w-3 h-3 text-gray-400" />
                          )}
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

      {/* ─── Email Detail ───────────────────────────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        className={cn(
          "flex-1 flex flex-col",
          !selectedEmail && "hidden md:flex"
        )}
        style={{
          borderTopRightRadius: RADIUS.card,
          borderBottomRightRadius: RADIUS.card,
        }}
      >
        {selectedEmail && activeEmail ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 md:hidden mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedEmail(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-500">Back to list</span>
              </div>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className={cn("text-lg font-semibold", theme.heading)}>
                    {activeEmail.subject}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <span className="font-medium">
                      {activeEmail.from.name}
                    </span>
                    <span className="text-gray-400">
                      &lt;{activeEmail.from.email}&gt;
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    To:{" "}
                    {(activeEmail.to || [])
                      .map((t) => `${t.name} <${t.email}>`)
                      .join(", ")}
                    {activeEmail.cc && activeEmail.cc.length > 0 && (
                      <>
                        {" "}
                        | Cc:{" "}
                        {activeEmail.cc
                          .map((c) => c.email)
                          .join(", ")}
                      </>
                    )}
                    {" "}&bull; {formatFullDate(activeEmail.date)}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReply}
                    title="Reply"
                  >
                    <Reply className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReplyAll}
                    title="Reply All"
                  >
                    <ReplyAll className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleForward}
                    title="Forward"
                  >
                    <Forward className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleToggleStar(activeEmail.id)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {activeEmail.starred ? "Unstar" : "Star"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : activeEmail.bodyHtml ? (
                // P0 (audit 2026-05-12): bodyHtml from external IMAP/Gmail/
                // Outlook providers is attacker-controlled. DOMPurify strips
                // scripts, event handlers, javascript: URLs, and other XSS
                // vectors. SAFE_FOR_TEMPLATES is OFF (we WANT the email's
                // formatting); FORBID_TAGS removes only the dangerous ones.
                <div
                  className="prose prose-sm max-w-none break-words"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(activeEmail.bodyHtml, {
                      FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "button"],
                      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "onsubmit", "formaction"],
                      ALLOW_DATA_ATTR: false,
                    }),
                  }}
                />
              ) : (
                <article className="prose prose-sm max-w-none whitespace-pre-wrap break-words">
                  {activeEmail.body ||
                    activeEmail.bodyText ||
                    activeEmail.snippet ||
                    ""}
                </article>
              )}

              {activeEmail.hasAttachment && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium mb-3">Attachments</h4>
                  <ul className="flex gap-2 list-none">
                    <li
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Attachment</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Download className="w-3 h-3" />
                      </Button>
                    </li>
                  </ul>
                </div>
              )}
            </ScrollArea>

            <form className="p-4 border-t bg-gray-50" onSubmit={handleQuickReply}>
              <div className="flex gap-2">
                <Input
                  placeholder={`Reply to ${activeEmail.from.name}...`}
                  className="flex-1"
                  value={quickReply}
                  onChange={(e) => setQuickReply(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={
                    !quickReply.trim() || sendEmailMutation.isPending
                  }
                  className={cn(theme.sendBtn, "disabled:opacity-50")}
                >
                  {sendEmailMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Select an email to read</p>
              {selectedFolder === "inbox" && messages.length === 0 && !messagesLoading && (
                <p className="text-sm mt-2 text-gray-400">
                  Your inbox is empty
                </p>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── Compose Modal ──────────────────────────────────────────────── */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            {connection && (
              <p className="text-xs text-gray-400 mt-1">
                Sending from {connection.email}
              </p>
            )}
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
                onChange={(e) =>
                  setComposeData({ ...composeData, to: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Cc: (optional)"
                value={composeData.cc}
                onChange={(e) =>
                  setComposeData({ ...composeData, cc: e.target.value })
                }
              />
            </div>
            <div>
              <Input
                placeholder="Subject"
                value={composeData.subject}
                onChange={(e) =>
                  setComposeData({
                    ...composeData,
                    subject: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="Write your message..."
                value={composeData.body}
                onChange={(e) =>
                  setComposeData({ ...composeData, body: e.target.value })
                }
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCompose(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendEmailMutation.isPending}
                  className={cn("gap-2", theme.sendBtn)}
                >
                  {sendEmailMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
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
