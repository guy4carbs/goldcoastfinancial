import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, 
  FileText, 
  MessageSquare, 
  Settings, 
  Bell, 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  User,
  Mail,
  Phone,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PolicyDetailsDrawer } from "@/components/portal/PolicyDetailsDrawer";
import { NotificationsPopover } from "@/components/portal/NotificationsPopover";
import { MessageComposerDrawer } from "@/components/portal/MessageComposerDrawer";
import { EditProfileModal } from "@/components/portal/EditProfileModal";
import { PreferencesDrawer } from "@/components/portal/PreferencesDrawer";
import { MessageDetailDrawer } from "@/components/portal/MessageDetailDrawer";
import { toast as sonnerToast } from "sonner";
import { format } from "date-fns";

interface PolicyData {
  id: string;
  userId: string;
  policyNumber: string;
  type: string;
  status: string;
  coverageAmount: number;
  monthlyPremium: string;
  startDate: string;
  nextPaymentDate: string | null;
  beneficiaryName: string | null;
  beneficiaryRelationship: string | null;
}

interface DocumentData {
  id: string;
  userId: string;
  policyId: string | null;
  name: string;
  type: string;
  category: string;
  fileSize: string | null;
  uploadedAt: string;
}

interface MessageData {
  id: string;
  userId: string;
  fromName: string;
  fromEmail: string | null;
  subject: string;
  content: string;
  isRead: boolean;
  isFromClient: boolean;
  priority: string | null;
  createdAt: string;
}

interface DashboardData {
  totalCoverage: number;
  monthlyPremium: string;
  activePolicies: number;
  nextPaymentDate: string | null;
  unreadMessages: number;
  unreadNotifications: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'MMM d, yyyy');
};

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return formatDate(dateString);
};

export default function ClientPortal() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: dashboard } = useQuery<DashboardData>({
    queryKey: ['/api/portal/dashboard'],
    enabled: isAuthenticated,
  });

  const { data: policies = [] } = useQuery<PolicyData[]>({
    queryKey: ['/api/portal/policies'],
    enabled: isAuthenticated,
  });

  const { data: documents = [] } = useQuery<DocumentData[]>({
    queryKey: ['/api/portal/documents'],
    enabled: isAuthenticated,
  });

  const { data: messages = [] } = useQuery<MessageData[]>({
    queryKey: ['/api/portal/messages'],
    enabled: isAuthenticated,
  });
  
  const [selectedPolicy, setSelectedPolicy] = useState<{
    id: string;
    type: string;
    status: string;
    coverage: string;
    premium: string;
    nextPayment: string;
  } | null>(null);
  const [policyDrawerOpen, setPolicyDrawerOpen] = useState(false);
  const [messageDrawerOpen, setMessageDrawerOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [messageDetailOpen, setMessageDetailOpen] = useState(false);
  const [messageInitialSubject, setMessageInitialSubject] = useState<string | undefined>();
  const [messageInitialContent, setMessageInitialContent] = useState<string | undefined>();
  const [selectedMessage, setSelectedMessage] = useState<{
    id: string;
    from: string;
    subject: string;
    preview: string;
    date: string;
    unread: boolean;
  } | null>(null);

  const handleViewMessage = async (msg: MessageData) => {
    setSelectedMessage({
      id: msg.id,
      from: msg.fromName,
      subject: msg.subject,
      preview: msg.content,
      date: getRelativeTime(msg.createdAt),
      unread: !msg.isRead,
    });
    setMessageDetailOpen(true);
    
    if (!msg.isRead) {
      try {
        await fetch(`/api/portal/messages/${msg.id}/read`, { method: 'PATCH', credentials: 'include' });
        queryClient.invalidateQueries({ queryKey: ['/api/portal/messages'] });
        queryClient.invalidateQueries({ queryKey: ['/api/portal/dashboard'] });
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  const generateDocumentContent = (docName: string, category: string) => {
    const date = new Date().toLocaleDateString();
    return `
================================================================================
                          GOLD COAST FINANCIAL GROUP
                         Life Insurance Documentation
================================================================================

Document: ${docName}
Category: ${category}
Generated: ${date}

--------------------------------------------------------------------------------

This document is a placeholder representing your ${docName.toLowerCase()}.

For the official document, please contact your advisor:
  Jack Cook, Principal Agent
  Phone: (630) 555-0123
  Email: jack.cook@goldcoastfnl.com

Gold Coast Financial Group
123 Main Street
Naperville, IL 60540

================================================================================
                    Thank you for choosing Gold Coast Financial
================================================================================
`;
  };

  const handleDownloadDocument = (docName: string, category?: string) => {
    const content = generateDocumentContent(docName, category || 'document');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    sonnerToast.success(`Downloading ${docName}...`, {
      description: "Your document is being downloaded."
    });
  };

  const handleDownloadAllDocuments = () => {
    if (documents.length === 0) {
      sonnerToast.error("No documents to download");
      return;
    }
    
    let combinedContent = `
================================================================================
                          GOLD COAST FINANCIAL GROUP
                      Complete Document Package
================================================================================

Generated: ${new Date().toLocaleDateString()}

This package contains the following documents:
${documents.map((doc, i) => `  ${i + 1}. ${doc.name} (${doc.category})`).join('\n')}

================================================================================

`;

    documents.forEach((doc, index) => {
      combinedContent += `
--------------------------------------------------------------------------------
DOCUMENT ${index + 1}: ${doc.name}
Category: ${doc.category}
Date: ${formatDate(doc.uploadedAt)}
--------------------------------------------------------------------------------

This section represents your ${doc.name.toLowerCase()}.

[Document content would appear here in the official version]

`;
    });

    combinedContent += `
================================================================================
                         END OF DOCUMENT PACKAGE
================================================================================

For official copies of these documents, please contact:
  Gold Coast Financial Group
  Jack Cook, Principal Agent
  Phone: (630) 555-0123
  Email: jack.cook@goldcoastfnl.com

================================================================================
`;

    const blob = new Blob([combinedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `All_Documents_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    sonnerToast.success("Downloading all documents...", {
      description: "Your documents are being downloaded."
    });
  };

  const handleRequestPolicyChanges = (policyId: string, policyType: string) => {
    setMessageInitialSubject("Policy Change Request");
    setMessageInitialContent(`Dear Jack,

I would like to request changes to my policy:

Policy Number: ${policyId}
Policy Type: ${policyType}

Changes Requested:
[Please describe the changes you would like to make]

Thank you for your assistance.

Best regards`);
    setMessageDrawerOpen(true);
  };

  const handleContactAdvisor = () => {
    window.location.href = "tel:6305550123";
  };

  const handleViewPolicy = (policy: PolicyData) => {
    setSelectedPolicy({
      id: policy.policyNumber,
      type: policy.type,
      status: policy.status,
      coverage: formatCurrency(policy.coverageAmount),
      premium: `$${policy.monthlyPremium}/month`,
      nextPayment: formatDate(policy.nextPaymentDate),
    });
    setPolicyDrawerOpen(true);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Expired",
        description: "Please log in to access your portal.",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/client-login"), 500);
    }
  }, [isLoading, isAuthenticated, setLocation, toast]);


  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your portal...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getInitials = () => {
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
  };

  const unreadMessageCount = messages.filter(m => !m.isRead).length;

  return (
    <Layout>
      <section className="bg-primary relative overflow-hidden py-8 md:py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-1/4" />
        <motion.div 
          className="container mx-auto px-4 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-secondary">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-serif text-white">
                  Welcome back, {user.firstName || 'Client'}!
                </h1>
                <p className="text-white/70">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationsPopover 
                onOpenPreferences={() => setPreferencesOpen(true)}
              >
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 relative" data-testid="button-notifications">
                  <Bell className="w-5 h-5" />
                  {(dashboard?.unreadNotifications || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full text-[10px] font-bold flex items-center justify-center text-secondary-foreground">
                      {dashboard?.unreadNotifications}
                    </span>
                  )}
                </Button>
              </NotificationsPopover>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  logout();
                  setLocation("/client-login");
                }}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-10 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <Card className="bg-gradient-to-br from-primary to-primary/90 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Shield className="w-8 h-8 text-secondary" />
                    <Badge className="bg-white/20 text-white hover:bg-white/30">Active</Badge>
                  </div>
                  <p className="text-white/70 text-sm mb-1">Total Coverage</p>
                  <p className="text-3xl font-bold">{formatCurrency(dashboard?.totalCoverage || 0)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-bold text-primary">{dashboard?.activePolicies || 0}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">Active Policies</p>
                  <p className="text-sm text-secondary font-medium">All in good standing</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-primary" />
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">Monthly Premium</p>
                  <p className="text-3xl font-bold text-foreground">${dashboard?.monthlyPremium || '0'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 text-primary" />
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">Next Payment</p>
                  <p className="text-lg font-bold text-foreground">{formatDate(dashboard?.nextPaymentDate || null)}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="policies" className="space-y-8">
              <TabsList className="bg-white shadow-sm border p-2 h-auto flex-wrap gap-2 rounded-xl">
                <TabsTrigger value="policies" className="py-3 px-5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
                  <Shield className="w-4 h-4 mr-2" />
                  Policies
                </TabsTrigger>
                <TabsTrigger value="documents" className="py-3 px-5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
                  <FileText className="w-4 h-4 mr-2" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="messages" className="py-3 px-5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                  {unreadMessageCount > 0 && (
                    <Badge className="ml-2 bg-secondary text-secondary-foreground">{unreadMessageCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings" className="py-3 px-5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="policies" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-serif text-primary">Your Policies</h2>
                </div>
                {policies.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No policies found.</p>
                    </CardContent>
                  </Card>
                ) : (
                  policies.map((policy, i) => (
                    <motion.div
                      key={policy.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <Shield className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{policy.type}</h3>
                                  <Badge className={policy.status === 'active' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-700"}>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">Policy #{policy.policyNumber}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6 text-center md:text-right">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Coverage</p>
                                <p className="font-bold text-primary">{formatCurrency(policy.coverageAmount)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Premium</p>
                                <p className="font-bold">${policy.monthlyPremium}/month</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Next Payment</p>
                                <p className="font-medium">{formatDate(policy.nextPaymentDate)}</p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="shrink-0"
                              onClick={() => handleViewPolicy(policy)}
                              data-testid={`button-view-policy-${policy.policyNumber}`}
                            >
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-serif text-primary">Your Documents</h2>
                  {documents.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadAllDocuments}
                      data-testid="button-download-all-docs"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All
                    </Button>
                  )}
                </div>
                {documents.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No documents found.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {documents.map((doc, i) => (
                          <motion.div
                            key={doc.id}
                            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(doc.uploadedAt)} • {doc.fileSize || 'N/A'}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadDocument(doc.name, doc.category)}
                              data-testid={`button-download-doc-${i}`}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="messages" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-serif text-primary">Messages</h2>
                  <Button 
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    onClick={() => setMessageDrawerOpen(true)}
                    data-testid="button-new-message"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    New Message
                  </Button>
                </div>
                {messages.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No messages yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {messages.map((msg, i) => (
                          <motion.div
                            key={msg.id}
                            className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!msg.isRead ? 'bg-secondary/5' : ''}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            onClick={() => handleViewMessage(msg)}
                            data-testid={`message-thread-${i}`}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {msg.fromName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className={`font-medium ${!msg.isRead ? 'text-primary' : ''}`}>{msg.fromName}</p>
                                <span className="text-xs text-muted-foreground">{getRelativeTime(msg.createdAt)}</span>
                              </div>
                              <p className={`text-sm ${!msg.isRead ? 'font-medium' : 'text-muted-foreground'}`}>{msg.subject}</p>
                              <p className="text-sm text-muted-foreground truncate">{msg.content.substring(0, 80)}...</p>
                            </div>
                            {!msg.isRead && (
                              <div className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-2" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-8">
                <h2 className="text-2xl font-bold font-serif text-primary">Account Settings</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{user.email}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Member Since</span>
                        <span className="font-medium">January 2024</span>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => setEditProfileOpen(true)}
                        data-testid="button-edit-profile"
                      >
                        Edit Profile
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>Manage how we contact you</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b">
                        <span>Email notifications</span>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span>Payment reminders</span>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span>Newsletter</span>
                        <Badge variant="secondary">Disabled</Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => setPreferencesOpen(true)}
                        data-testid="button-update-preferences"
                      >
                        Update Preferences
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">Need to make changes to your policies?</h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          For policy updates, beneficiary changes, or coverage adjustments, please contact your advisor directly.
                        </p>
                        <Button 
                          size="sm" 
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          onClick={handleContactAdvisor}
                          data-testid="button-contact-advisor"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Contact Advisor
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      <PolicyDetailsDrawer 
        open={policyDrawerOpen} 
        onOpenChange={(open) => {
          setPolicyDrawerOpen(open);
          if (!open) {
            setTimeout(() => setSelectedPolicy(null), 300);
          }
        }} 
        policy={selectedPolicy}
        onRequestChanges={handleRequestPolicyChanges}
      />
      <MessageComposerDrawer 
        open={messageDrawerOpen} 
        onOpenChange={(open) => {
          setMessageDrawerOpen(open);
          if (!open) {
            setMessageInitialSubject(undefined);
            setMessageInitialContent(undefined);
          }
        }}
        initialSubject={messageInitialSubject}
        initialMessage={messageInitialContent}
      />
      <EditProfileModal 
        open={editProfileOpen} 
        onOpenChange={setEditProfileOpen}
        user={user}
      />
      <PreferencesDrawer 
        open={preferencesOpen} 
        onOpenChange={setPreferencesOpen}
      />
      <MessageDetailDrawer
        open={messageDetailOpen}
        onOpenChange={(open) => {
          setMessageDetailOpen(open);
          if (!open) {
            setTimeout(() => setSelectedMessage(null), 300);
          }
        }}
        message={selectedMessage}
      />
    </Layout>
  );
}
