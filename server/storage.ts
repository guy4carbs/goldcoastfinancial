import {
  type QuoteRequest,
  type InsertQuoteRequest,
  type ContactMessage,
  type InsertContactMessage,
  type User,
  type InsertUser,
  type Policy,
  type InsertPolicy,
  type Document,
  type InsertDocument,
  type Message,
  type InsertMessage,
  type Notification,
  type InsertNotification,
  type BillingHistory,
  type InsertBillingHistory,
  type JobApplication,
  type InsertJobApplication,
  type ChatConversation,
  type InsertChatConversation,
  type ChatParticipant,
  type InsertChatParticipant,
  type ChatMessage,
  type InsertChatMessage,
  type AgentTrainingProgress,
  type InsertAgentTrainingProgress,
  type AgentAssessmentResult,
  type InsertAgentAssessmentResult,
  type AgentSimulationResult,
  type InsertAgentSimulationResult,
  type AgentCertificate,
  type InsertAgentCertificate,
  type AgentXpTransaction,
  type InsertAgentXpTransaction,
  type PageView,
  type InsertPageView,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  quoteRequests,
  contactMessages,
  users,
  policies,
  documents,
  messages,
  notifications,
  billingHistory,
  jobApplications,
  chatConversations,
  chatParticipants,
  chatMessages,
  agentTrainingProgress,
  agentAssessmentResults,
  agentSimulationResults,
  agentCertificates,
  agentXpTransactions,
  pageViews,
  analyticsEvents,
} from "@shared/schema";
import { leads, leadActivities, type Lead, type InsertLead, type LeadActivity, type InsertLeadActivity } from "@shared/models/crm";
import { memberCards } from "@shared/models/memberCards";
import {
  agentLicenses,
  agentTerritories,
  type AgentLicense,
  type InsertAgentLicense,
  type AgentTerritory,
  type InsertAgentTerritory,
} from "@shared/models/licenses";
import {
  agentPolicies,
  type AgentPolicy,
  type InsertAgentPolicy,
} from "@shared/models/policies";
import {
  clientConversations,
  clientMessages,
  type ClientConversation,
  type InsertClientConversation,
  type ClientMessage,
  type InsertClientMessage,
} from "@shared/models/clientChat";
import {
  automations,
  automationExecutions,
  type Automation,
  type InsertAutomation,
  type AutomationExecution,
  type InsertAutomationExecution,
} from "@shared/models/automations";
import {
  workflowAutomations,
  type WorkflowAutomation,
  type InsertWorkflowAutomation,
} from "@shared/models/workflow-automations";
import {
  agentProfiles,
  type AgentProfile,
  type InsertAgentProfile,
} from "@shared/models/agentProfiles";
import { db } from "./db";
import { eq, desc, and, inArray, asc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest>;
  getQuoteRequests(): Promise<QuoteRequest[]>;
  
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  getUserByAppleId(appleId: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User | null>;
  
  getPoliciesByUserId(userId: string): Promise<Policy[]>;
  getPolicyById(id: string): Promise<Policy | null>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  
  getDocumentsByUserId(userId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  getMessagesByUserId(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  
  getBillingHistoryByUserId(userId: string): Promise<BillingHistory[]>;
  createBillingHistory(billing: InsertBillingHistory): Promise<BillingHistory>;
  
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getJobApplications(): Promise<JobApplication[]>;
  
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  getChatConversationById(id: string): Promise<ChatConversation | null>;
  getChatConversationsByUserId(userId: string): Promise<ChatConversation[]>;
  getMainTeamChat(): Promise<ChatConversation | null>;
  
  addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant>;
  getChatParticipants(conversationId: string): Promise<ChatParticipant[]>;
  isUserInConversation(userId: string, conversationId: string): Promise<boolean>;
  updateLastReadAt(userId: string, conversationId: string): Promise<void>;
  
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(conversationId: string, limit?: number): Promise<ChatMessage[]>;
  getUnreadChatCount(userId: string): Promise<number>;

  getAllAgentUsers(): Promise<User[]>;

  // Training Progress
  getTrainingProgress(userId: string): Promise<AgentTrainingProgress[]>;
  getModuleProgress(userId: string, moduleId: string): Promise<AgentTrainingProgress | null>;
  upsertTrainingProgress(progress: InsertAgentTrainingProgress): Promise<AgentTrainingProgress>;

  // Assessment Results
  getAssessmentHistory(userId: string): Promise<AgentAssessmentResult[]>;
  getAssessmentAttempts(userId: string, assessmentId: string): Promise<AgentAssessmentResult[]>;
  createAssessmentResult(result: InsertAgentAssessmentResult): Promise<AgentAssessmentResult>;

  // Simulation Results
  getSimulationHistory(userId: string): Promise<AgentSimulationResult[]>;
  createSimulationResult(result: InsertAgentSimulationResult): Promise<AgentSimulationResult>;

  // Certificates
  getCertificates(userId: string): Promise<AgentCertificate[]>;
  createCertificate(certificate: InsertAgentCertificate): Promise<AgentCertificate>;
  getCertificateByNumber(certificateNumber: string): Promise<AgentCertificate | null>;

  // XP Transactions
  getXpHistory(userId: string): Promise<AgentXpTransaction[]>;
  createXpTransaction(transaction: InsertAgentXpTransaction): Promise<AgentXpTransaction>;
  getTotalXp(userId: string): Promise<number>;

  // Leaderboard
  getLeaderboard(limit?: number): Promise<{ userId: string; totalXp: number; user: User }[]>;

  // Analytics
  createPageView(pageView: InsertPageView): Promise<PageView>;
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getPageViews(startDate?: Date, endDate?: Date): Promise<PageView[]>;
  getAnalyticsEvents(startDate?: Date, endDate?: Date): Promise<AnalyticsEvent[]>;
  getPageViewStats(): Promise<{ page: string; count: number }[]>;
  getEventStats(): Promise<{ eventName: string; count: number }[]>;

  // Scalable analytics counts (uses SQL aggregation instead of loading all records)
  getPageViewCounts(): Promise<{ total: number; today: number; thisWeek: number; thisMonth: number }>;
  getQuoteCounts(): Promise<{ total: number; today: number; thisWeek: number; thisMonth: number }>;
  getContactCounts(): Promise<{ total: number; today: number; thisWeek: number; thisMonth: number }>;
  getDailyTrends(days?: number): Promise<{ quotes: { date: string; count: number }[]; pageViews: { date: string; count: number }[] }>;

  // CRM Test Data
  initializeCRMTestData(): Promise<void>;

  // Member Cards
  createMemberCard(card: any): Promise<any>;
  getMemberCardById(id: string): Promise<any | null>;
  getMemberCardByNumber(cardNumber: string): Promise<any | null>;
  getMemberCardsByAgent(agentId: string, filters?: { status?: string; search?: string }): Promise<any[]>;
  getMemberCardsByMember(memberId: string): Promise<any[]>;
  updateMemberCard(id: string, data: any): Promise<any | null>;
  revokeMemberCard(id: string): Promise<boolean>;
  deleteMemberCard(id: string): Promise<boolean>;
  getMemberCardStats(agentId: string): Promise<{ total: number; active: number; pending: number; revoked: number }>;

  // Automations
  createAutomation(automation: InsertAutomation): Promise<Automation>;
  getAutomationById(id: string): Promise<Automation | null>;
  getAutomationsByAgentId(agentId: string): Promise<Automation[]>;
  getEnabledAutomations(): Promise<Automation[]>;
  getAutomationsByTriggerType(triggerType: string): Promise<Automation[]>;
  updateAutomation(id: string, data: Partial<Automation>): Promise<Automation | null>;
  deleteAutomation(id: string): Promise<boolean>;
  toggleAutomation(id: string, enabled: boolean): Promise<Automation | null>;
  incrementAutomationStats(id: string, success: boolean): Promise<void>;

  // Automation Executions
  createAutomationExecution(execution: InsertAutomationExecution): Promise<AutomationExecution>;
  getExecutionById(id: string): Promise<AutomationExecution | null>;
  getExecutionsByAutomationId(automationId: string, limit?: number): Promise<AutomationExecution[]>;
  updateExecution(id: string, data: Partial<AutomationExecution>): Promise<AutomationExecution | null>;
  getRecentExecutions(agentId: string, limit?: number): Promise<AutomationExecution[]>;

  // Workflow Automations (Visual Builder)
  createWorkflowAutomation(workflow: InsertWorkflowAutomation): Promise<WorkflowAutomation>;
  getWorkflowAutomationById(id: string): Promise<WorkflowAutomation | null>;
  getWorkflowAutomationsByAgentId(agentId: string): Promise<WorkflowAutomation[]>;
  updateWorkflowAutomation(id: string, data: Partial<WorkflowAutomation>): Promise<WorkflowAutomation | null>;
  deleteWorkflowAutomation(id: string): Promise<boolean>;
  getEnabledWorkflowAutomations(): Promise<WorkflowAutomation[]>;
  createWorkflowExecution(data: {
    workflowAutomationId: string;
    status: string;
    triggeredBy: Record<string, unknown>;
    startedAt: Date;
  }): Promise<{ id: string }>;
  updateWorkflowExecution(id: string, data: {
    status?: string;
    nodeResults?: unknown;
    errorMessage?: string;
    completedAt?: Date;
    duration?: number;
  }): Promise<void>;
  incrementWorkflowStats(workflowId: string, success: boolean): Promise<void>;
  getWorkflowExecutionsByWorkflowId(workflowId: string, limit?: number): Promise<any[]>;

  // Agent Licenses
  getAgentLicenses(userId: string): Promise<AgentLicense[]>;
  getAgentLicenseById(id: string): Promise<AgentLicense | null>;
  createAgentLicense(license: InsertAgentLicense): Promise<AgentLicense>;
  updateAgentLicense(id: string, data: Partial<AgentLicense>): Promise<AgentLicense | null>;
  deleteAgentLicense(id: string): Promise<boolean>;

  // Agent Territories
  getAgentTerritories(userId: string): Promise<AgentTerritory[]>;
  createAgentTerritory(territory: InsertAgentTerritory): Promise<AgentTerritory>;
  deleteAgentTerritory(id: string): Promise<boolean>;

  // Agent Policies
  getAgentPolicies(userId: string): Promise<AgentPolicy[]>;
  getAgentPolicyById(id: string): Promise<AgentPolicy | null>;
  createAgentPolicy(policy: InsertAgentPolicy): Promise<AgentPolicy>;
  updateAgentPolicy(id: string, data: Partial<AgentPolicy>): Promise<AgentPolicy | null>;
  deleteAgentPolicy(id: string): Promise<boolean>;

  // Agent Profiles (Registration)
  createAgentProfile(profile: InsertAgentProfile): Promise<AgentProfile>;
  getAgentProfileByUserId(userId: string): Promise<AgentProfile | null>;
  getPendingRegistrations(): Promise<AgentProfile[]>;
  updateAgentProfileApproval(profileId: string, status: string, approvedBy?: string, rejectionReason?: string): Promise<AgentProfile | null>;
}

export class DatabaseStorage implements IStorage {
  async createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest> {
    const [quoteRequest] = await db.insert(quoteRequests).values(request).returning();
    return quoteRequest;
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt));
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [contactMessage] = await db.insert(contactMessages).values(message).returning();
    return contactMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByAppleId(appleId: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.appleId, appleId));
    return user || null;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const [updatedUser] = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || null;
  }

  async getPoliciesByUserId(userId: string): Promise<Policy[]> {
    return db.select().from(policies).where(eq(policies.userId, userId)).orderBy(desc(policies.createdAt));
  }

  async getPolicyById(id: string): Promise<Policy | null> {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy || null;
  }

  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    const [newPolicy] = await db.insert(policies).values(policy).returning();
    return newPolicy;
  }

  async getDocumentsByUserId(userId: string): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.uploadedAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async getMessagesByUserId(userId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.userId, userId)).orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const unreadMessages = await db.select().from(messages)
      .where(and(eq(messages.userId, userId), eq(messages.isRead, false)));
    return unreadMessages.length;
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const unreadNotifications = await db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return unreadNotifications.length;
  }

  async getBillingHistoryByUserId(userId: string): Promise<BillingHistory[]> {
    return db.select().from(billingHistory).where(eq(billingHistory.userId, userId)).orderBy(desc(billingHistory.paymentDate));
  }

  async createBillingHistory(billing: InsertBillingHistory): Promise<BillingHistory> {
    const [newBilling] = await db.insert(billingHistory).values(billing).returning();
    return newBilling;
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [newApplication] = await db.insert(jobApplications).values(application).returning();
    return newApplication;
  }

  async getJobApplications(): Promise<JobApplication[]> {
    return db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [newConversation] = await db.insert(chatConversations).values(conversation).returning();
    return newConversation;
  }

  async getChatConversationById(id: string): Promise<ChatConversation | null> {
    const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.id, id));
    return conversation || null;
  }

  async getChatConversationsByUserId(userId: string): Promise<ChatConversation[]> {
    const participations = await db.select().from(chatParticipants).where(eq(chatParticipants.userId, userId));
    if (participations.length === 0) return [];
    
    const conversationIds = participations.map(p => p.conversationId);
    return db.select().from(chatConversations)
      .where(inArray(chatConversations.id, conversationIds))
      .orderBy(desc(chatConversations.updatedAt));
  }

  async getMainTeamChat(): Promise<ChatConversation | null> {
    const [mainChat] = await db.select().from(chatConversations)
      .where(and(eq(chatConversations.type, 'channel'), eq(chatConversations.name, 'Team Chat')));
    return mainChat || null;
  }

  async addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant> {
    const [newParticipant] = await db.insert(chatParticipants).values(participant).returning();
    return newParticipant;
  }

  async getChatParticipants(conversationId: string): Promise<ChatParticipant[]> {
    return db.select().from(chatParticipants).where(eq(chatParticipants.conversationId, conversationId));
  }

  async isUserInConversation(userId: string, conversationId: string): Promise<boolean> {
    const [participant] = await db.select().from(chatParticipants)
      .where(and(eq(chatParticipants.userId, userId), eq(chatParticipants.conversationId, conversationId)));
    return !!participant;
  }

  async updateLastReadAt(userId: string, conversationId: string): Promise<void> {
    await db.update(chatParticipants)
      .set({ lastReadAt: new Date() })
      .where(and(eq(chatParticipants.userId, userId), eq(chatParticipants.conversationId, conversationId)));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    await db.update(chatConversations)
      .set({ updatedAt: new Date() })
      .where(eq(chatConversations.id, message.conversationId));
    return newMessage;
  }

  async getChatMessages(conversationId: string, limit: number = 100): Promise<ChatMessage[]> {
    return db.select().from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit);
  }

  async getUnreadChatCount(userId: string): Promise<number> {
    const participations = await db.select().from(chatParticipants).where(eq(chatParticipants.userId, userId));
    let unreadCount = 0;

    for (const p of participations) {
      const messages = await db.select().from(chatMessages)
        .where(eq(chatMessages.conversationId, p.conversationId));
      const unread = messages.filter(m =>
        m.senderId !== userId &&
        (!p.lastReadAt || new Date(m.createdAt) > new Date(p.lastReadAt))
      );
      unreadCount += unread.length;
    }

    return unreadCount;
  }

  // ============================================
  // CLIENT CHAT METHODS (Agent-Client Messaging)
  // ============================================

  async createClientConversation(conversation: InsertClientConversation): Promise<ClientConversation> {
    const [newConversation] = await db.insert(clientConversations).values(conversation).returning();
    return newConversation;
  }

  async getClientConversationById(id: string): Promise<ClientConversation | null> {
    const [conversation] = await db.select().from(clientConversations).where(eq(clientConversations.id, id));
    return conversation || null;
  }

  async getClientConversationByPair(clientId: string, agentId: string): Promise<ClientConversation | null> {
    const [conversation] = await db.select().from(clientConversations)
      .where(and(
        eq(clientConversations.clientId, clientId),
        eq(clientConversations.agentId, agentId)
      ));
    return conversation || null;
  }

  async getOrCreateClientConversation(
    clientId: string,
    agentId: string,
    clientName: string,
    agentName: string
  ): Promise<ClientConversation> {
    const existing = await this.getClientConversationByPair(clientId, agentId);
    if (existing) return existing;

    return this.createClientConversation({
      clientId,
      agentId,
      clientName,
      agentName,
      unreadCountAgent: 0,
      unreadCountClient: 0,
      isActive: true,
    });
  }

  async getClientConversationsByAgentId(agentId: string): Promise<ClientConversation[]> {
    return db.select().from(clientConversations)
      .where(and(
        eq(clientConversations.agentId, agentId),
        eq(clientConversations.isActive, true)
      ))
      .orderBy(desc(clientConversations.lastMessageAt));
  }

  async getClientConversationsByClientId(clientId: string): Promise<ClientConversation[]> {
    return db.select().from(clientConversations)
      .where(and(
        eq(clientConversations.clientId, clientId),
        eq(clientConversations.isActive, true)
      ))
      .orderBy(desc(clientConversations.lastMessageAt));
  }

  async createClientMessage(message: InsertClientMessage): Promise<ClientMessage> {
    const [newMessage] = await db.insert(clientMessages).values(message).returning();

    // Update conversation with last message info
    const preview = message.content.length > 100
      ? message.content.substring(0, 100) + '...'
      : message.content;

    // Increment unread count for the recipient
    const incrementField = message.senderType === 'client'
      ? { unreadCountAgent: sql`unread_count_agent + 1` }
      : { unreadCountClient: sql`unread_count_client + 1` };

    await db.update(clientConversations)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
        updatedAt: new Date(),
        ...incrementField,
      })
      .where(eq(clientConversations.id, message.conversationId));

    return newMessage;
  }

  async getClientMessages(conversationId: string, limit: number = 100): Promise<ClientMessage[]> {
    return db.select().from(clientMessages)
      .where(eq(clientMessages.conversationId, conversationId))
      .orderBy(asc(clientMessages.createdAt))
      .limit(limit);
  }

  async markClientConversationReadByAgent(conversationId: string): Promise<void> {
    await db.update(clientConversations)
      .set({ unreadCountAgent: 0, updatedAt: new Date() })
      .where(eq(clientConversations.id, conversationId));

    await db.update(clientMessages)
      .set({ isRead: true })
      .where(and(
        eq(clientMessages.conversationId, conversationId),
        eq(clientMessages.senderType, 'client')
      ));
  }

  async markClientConversationReadByClient(conversationId: string): Promise<void> {
    await db.update(clientConversations)
      .set({ unreadCountClient: 0, updatedAt: new Date() })
      .where(eq(clientConversations.id, conversationId));

    await db.update(clientMessages)
      .set({ isRead: true })
      .where(and(
        eq(clientMessages.conversationId, conversationId),
        eq(clientMessages.senderType, 'agent')
      ));
  }

  async getUnreadClientChatCountForAgent(agentId: string): Promise<number> {
    const conversations = await db.select().from(clientConversations)
      .where(eq(clientConversations.agentId, agentId));
    return conversations.reduce((sum, c) => sum + (c.unreadCountAgent || 0), 0);
  }

  async getUnreadClientChatCountForClient(clientId: string): Promise<number> {
    const conversations = await db.select().from(clientConversations)
      .where(eq(clientConversations.clientId, clientId));
    return conversations.reduce((sum, c) => sum + (c.unreadCountClient || 0), 0);
  }

  async getAllAgentUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Training Progress Methods
  async getTrainingProgress(userId: string): Promise<AgentTrainingProgress[]> {
    return db.select().from(agentTrainingProgress)
      .where(eq(agentTrainingProgress.userId, userId))
      .orderBy(desc(agentTrainingProgress.updatedAt));
  }

  async getModuleProgress(userId: string, moduleId: string): Promise<AgentTrainingProgress | null> {
    const [progress] = await db.select().from(agentTrainingProgress)
      .where(and(
        eq(agentTrainingProgress.userId, userId),
        eq(agentTrainingProgress.moduleId, moduleId)
      ));
    return progress || null;
  }

  async upsertTrainingProgress(progress: InsertAgentTrainingProgress): Promise<AgentTrainingProgress> {
    const existing = await this.getModuleProgress(progress.userId, progress.moduleId);

    if (existing) {
      const [updated] = await db.update(agentTrainingProgress)
        .set({ ...progress, updatedAt: new Date() })
        .where(eq(agentTrainingProgress.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(agentTrainingProgress).values(progress).returning();
    return created;
  }

  // Assessment Results Methods
  async getAssessmentHistory(userId: string): Promise<AgentAssessmentResult[]> {
    return db.select().from(agentAssessmentResults)
      .where(eq(agentAssessmentResults.userId, userId))
      .orderBy(desc(agentAssessmentResults.completedAt));
  }

  async getAssessmentAttempts(userId: string, assessmentId: string): Promise<AgentAssessmentResult[]> {
    return db.select().from(agentAssessmentResults)
      .where(and(
        eq(agentAssessmentResults.userId, userId),
        eq(agentAssessmentResults.assessmentId, assessmentId)
      ))
      .orderBy(desc(agentAssessmentResults.completedAt));
  }

  async createAssessmentResult(result: InsertAgentAssessmentResult): Promise<AgentAssessmentResult> {
    // Calculate attempt number
    const previousAttempts = await this.getAssessmentAttempts(result.userId, result.assessmentId);
    const attemptNumber = previousAttempts.length + 1;

    const [created] = await db.insert(agentAssessmentResults)
      .values({ ...result, attemptNumber })
      .returning();
    return created;
  }

  // Simulation Results Methods
  async getSimulationHistory(userId: string): Promise<AgentSimulationResult[]> {
    return db.select().from(agentSimulationResults)
      .where(eq(agentSimulationResults.userId, userId))
      .orderBy(desc(agentSimulationResults.completedAt));
  }

  async createSimulationResult(result: InsertAgentSimulationResult): Promise<AgentSimulationResult> {
    const [created] = await db.insert(agentSimulationResults).values(result).returning();
    return created;
  }

  // Certificate Methods
  async getCertificates(userId: string): Promise<AgentCertificate[]> {
    return db.select().from(agentCertificates)
      .where(eq(agentCertificates.userId, userId))
      .orderBy(desc(agentCertificates.issuedAt));
  }

  async createCertificate(certificate: InsertAgentCertificate): Promise<AgentCertificate> {
    // Generate unique certificate number if not provided
    const certNumber = certificate.certificateNumber ||
      `GCF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const [created] = await db.insert(agentCertificates)
      .values({ ...certificate, certificateNumber: certNumber })
      .returning();
    return created;
  }

  async getCertificateByNumber(certificateNumber: string): Promise<AgentCertificate | null> {
    const [certificate] = await db.select().from(agentCertificates)
      .where(eq(agentCertificates.certificateNumber, certificateNumber));
    return certificate || null;
  }

  // XP Transaction Methods
  async getXpHistory(userId: string): Promise<AgentXpTransaction[]> {
    return db.select().from(agentXpTransactions)
      .where(eq(agentXpTransactions.userId, userId))
      .orderBy(desc(agentXpTransactions.createdAt));
  }

  async createXpTransaction(transaction: InsertAgentXpTransaction): Promise<AgentXpTransaction> {
    const [created] = await db.insert(agentXpTransactions).values(transaction).returning();
    return created;
  }

  async getTotalXp(userId: string): Promise<number> {
    const result = await db.select({
      total: sql<number>`COALESCE(SUM(${agentXpTransactions.amount}), 0)`
    })
      .from(agentXpTransactions)
      .where(eq(agentXpTransactions.userId, userId));
    return Number(result[0]?.total) || 0;
  }

  // Leaderboard
  async getLeaderboard(limit: number = 10): Promise<{ userId: string; totalXp: number; user: User }[]> {
    const xpTotals = await db.select({
      userId: agentXpTransactions.userId,
      totalXp: sql<number>`SUM(${agentXpTransactions.amount})`
    })
      .from(agentXpTransactions)
      .groupBy(agentXpTransactions.userId)
      .orderBy(sql`SUM(${agentXpTransactions.amount}) DESC`)
      .limit(limit);

    const results = await Promise.all(
      xpTotals.map(async (entry) => {
        const user = await this.getUserById(entry.userId);
        return {
          userId: entry.userId,
          totalXp: Number(entry.totalXp) || 0,
          user: user!
        };
      })
    );

    return results.filter(r => r.user !== null);
  }

  async initializeDemoUser(): Promise<void> {
    const demoEmail = "demo@goldcoastfnl.com";
    const existingUser = await this.getUserByEmail(demoEmail);
    
    if (!existingUser) {
      console.log("Creating demo user for client portal...");
      const hashedPassword = await bcrypt.hash("demo1234", 10);
      const demoUser = await this.createUser({
        email: demoEmail,
        password: hashedPassword,
        firstName: "Demo",
        lastName: "Client",
        phone: "(630) 555-0123",
      });
      console.log("Demo user created: demo@goldcoastfnl.com / demo1234");
      
      await this.initializeDemoData(demoUser.id);
    } else {
      const hashedPassword = await bcrypt.hash("demo1234", 10);
      await db.update(users).set({ password: hashedPassword }).where(eq(users.email, demoEmail));
      console.log("Demo user password updated: demo@goldcoastfnl.com / demo1234");
      
      const existingPolicies = await this.getPoliciesByUserId(existingUser.id);
      if (existingPolicies.length === 0) {
        await this.initializeDemoData(existingUser.id);
      }
    }
  }

  private async initializeDemoData(userId: string): Promise<void> {
    console.log("Creating demo data for user...");
    
    const policy1 = await this.createPolicy({
      userId,
      policyNumber: "POL-2024-001",
      type: "Whole Life Insurance",
      status: "active",
      coverageAmount: 500000,
      monthlyPremium: "245.00",
      startDate: new Date("2024-01-15"),
      nextPaymentDate: new Date("2025-02-15"),
      beneficiaryName: "Jane Client",
      beneficiaryRelationship: "Spouse",
    });

    const policy2 = await this.createPolicy({
      userId,
      policyNumber: "POL-2024-002",
      type: "Term Life Insurance (20-Year)",
      status: "active",
      coverageAmount: 1000000,
      monthlyPremium: "89.00",
      startDate: new Date("2024-01-15"),
      nextPaymentDate: new Date("2025-02-01"),
      beneficiaryName: "Jane Client",
      beneficiaryRelationship: "Spouse",
    });

    await this.createDocument({
      userId,
      policyId: policy1.id,
      name: "Whole Life Policy Document",
      type: "PDF",
      category: "policy",
      fileSize: "2.4 MB",
    });

    await this.createDocument({
      userId,
      policyId: policy2.id,
      name: "Term Life Policy Document",
      type: "PDF",
      category: "policy",
      fileSize: "1.8 MB",
    });

    await this.createDocument({
      userId,
      name: "Annual Statement 2024",
      type: "PDF",
      category: "statement",
      fileSize: "456 KB",
    });

    await this.createDocument({
      userId,
      name: "Tax Form 1099",
      type: "PDF",
      category: "tax",
      fileSize: "124 KB",
    });

    await this.createDocument({
      userId,
      name: "Beneficiary Designation Form",
      type: "PDF",
      category: "form",
      fileSize: "89 KB",
    });

    await this.createMessage({
      userId,
      fromName: "Gold Coast Financial Group",
      fromEmail: "welcome@goldcoastfnl.com",
      subject: "Welcome to Your Client Portal",
      content: "Welcome to Gold Coast Financial Group! We're excited to have you as part of our family. Your client portal gives you 24/7 access to your policies, documents, and secure messaging with your advisors. If you have any questions, we're here to help.\n\nWarm regards,\nThe Gold Coast Financial Team",
      isRead: true,
      priority: "normal",
    });

    await this.createMessage({
      userId,
      fromName: "Nick Gallagher",
      fromEmail: "nick@goldcoastfnl.com",
      subject: "Updated Beneficiary Confirmation",
      content: "This confirms that your beneficiary update has been processed successfully. Your records now reflect the changes you requested. If you have any questions or need to make additional changes, please don't hesitate to reach out.\n\nBest regards,\nNick Gallagher",
      isRead: true,
      priority: "normal",
    });

    await this.createMessage({
      userId,
      fromName: "Jack Cook",
      fromEmail: "jack@goldcoastfnl.com",
      subject: "Your Annual Policy Review",
      content: "Hi! I wanted to reach out to schedule your annual policy review. This is a great opportunity to discuss any changes in your coverage needs and ensure your policies are still aligned with your goals. Please let me know your availability for a 30-minute call.\n\nBest regards,\nJack Cook\nLicensed Insurance Advisor",
      isRead: false,
      priority: "normal",
    });

    await this.createNotification({
      userId,
      title: "Payment Reminder",
      message: "Your premium payment of $334.00 is due on February 1, 2025.",
      type: "payment",
      isRead: false,
      actionUrl: "/client-portal?tab=billing",
    });

    await this.createNotification({
      userId,
      title: "New Message",
      message: "You have a new message from Jack Cook regarding your annual review.",
      type: "message",
      isRead: false,
      actionUrl: "/client-portal?tab=messages",
    });

    await this.createBillingHistory({
      userId,
      policyId: policy1.id,
      amount: "245.00",
      status: "paid",
      paymentDate: new Date("2025-01-15"),
      paymentMethod: "Bank Account (****1234)",
      transactionId: "TXN-20250115-001",
    });

    await this.createBillingHistory({
      userId,
      policyId: policy2.id,
      amount: "89.00",
      status: "paid",
      paymentDate: new Date("2025-01-01"),
      paymentMethod: "Bank Account (****1234)",
      transactionId: "TXN-20250101-001",
    });

    console.log("Demo data created successfully.");
  }

  // Analytics Methods
  async createPageView(pageView: InsertPageView): Promise<PageView> {
    const [created] = await db.insert(pageViews).values(pageView).returning();
    return created;
  }

  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [created] = await db.insert(analyticsEvents).values(event).returning();
    return created;
  }

  async getPageViews(startDate?: Date, endDate?: Date): Promise<PageView[]> {
    if (startDate && endDate) {
      return db.select().from(pageViews)
        .where(and(
          sql`${pageViews.createdAt} >= ${startDate}`,
          sql`${pageViews.createdAt} <= ${endDate}`
        ))
        .orderBy(desc(pageViews.createdAt));
    }
    return db.select().from(pageViews).orderBy(desc(pageViews.createdAt)).limit(1000);
  }

  async getAnalyticsEvents(startDate?: Date, endDate?: Date): Promise<AnalyticsEvent[]> {
    if (startDate && endDate) {
      return db.select().from(analyticsEvents)
        .where(and(
          sql`${analyticsEvents.createdAt} >= ${startDate}`,
          sql`${analyticsEvents.createdAt} <= ${endDate}`
        ))
        .orderBy(desc(analyticsEvents.createdAt));
    }
    return db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(1000);
  }

  async getPageViewStats(): Promise<{ page: string; count: number }[]> {
    const results = await db.select({
      page: pageViews.page,
      count: sql<number>`COUNT(*)`
    })
      .from(pageViews)
      .groupBy(pageViews.page)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(20);
    return results.map(r => ({ page: r.page, count: Number(r.count) }));
  }

  async getEventStats(): Promise<{ eventName: string; count: number }[]> {
    const results = await db.select({
      eventName: analyticsEvents.eventName,
      count: sql<number>`COUNT(*)`
    })
      .from(analyticsEvents)
      .groupBy(analyticsEvents.eventName)
      .orderBy(sql`COUNT(*) DESC`);
    return results.map(r => ({ eventName: r.eventName, count: Number(r.count) }));
  }

  // Scalable analytics count methods using SQL aggregation
  async getPageViewCounts(): Promise<{ total: number; today: number; thisWeek: number; thisMonth: number }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(pageViews);

    const [todayResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(pageViews).where(sql`${pageViews.createdAt} >= ${today}`);

    const [weekResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(pageViews).where(sql`${pageViews.createdAt} >= ${weekAgo}`);

    const [monthResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(pageViews).where(sql`${pageViews.createdAt} >= ${monthAgo}`);

    return {
      total: Number(totalResult?.count) || 0,
      today: Number(todayResult?.count) || 0,
      thisWeek: Number(weekResult?.count) || 0,
      thisMonth: Number(monthResult?.count) || 0,
    };
  }

  async getQuoteCounts(): Promise<{ total: number; today: number; thisWeek: number; thisMonth: number }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(quoteRequests);

    const [todayResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(quoteRequests).where(sql`${quoteRequests.createdAt} >= ${today}`);

    const [weekResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(quoteRequests).where(sql`${quoteRequests.createdAt} >= ${weekAgo}`);

    const [monthResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(quoteRequests).where(sql`${quoteRequests.createdAt} >= ${monthAgo}`);

    return {
      total: Number(totalResult?.count) || 0,
      today: Number(todayResult?.count) || 0,
      thisWeek: Number(weekResult?.count) || 0,
      thisMonth: Number(monthResult?.count) || 0,
    };
  }

  async getContactCounts(): Promise<{ total: number; today: number; thisWeek: number; thisMonth: number }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(contactMessages);

    const [todayResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(contactMessages).where(sql`${contactMessages.createdAt} >= ${today}`);

    const [weekResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(contactMessages).where(sql`${contactMessages.createdAt} >= ${weekAgo}`);

    const [monthResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(contactMessages).where(sql`${contactMessages.createdAt} >= ${monthAgo}`);

    return {
      total: Number(totalResult?.count) || 0,
      today: Number(todayResult?.count) || 0,
      thisWeek: Number(weekResult?.count) || 0,
      thisMonth: Number(monthResult?.count) || 0,
    };
  }

  async getDailyTrends(days: number = 30): Promise<{ quotes: { date: string; count: number }[]; pageViews: { date: string; count: number }[] }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    // Get daily quote counts using SQL
    const quoteResults = await db.select({
      date: sql<string>`DATE(${quoteRequests.createdAt})`,
      count: sql<number>`COUNT(*)`
    })
      .from(quoteRequests)
      .where(sql`${quoteRequests.createdAt} >= ${startDate}`)
      .groupBy(sql`DATE(${quoteRequests.createdAt})`)
      .orderBy(sql`DATE(${quoteRequests.createdAt})`);

    // Get daily page view counts using SQL
    const pageViewResults = await db.select({
      date: sql<string>`DATE(${pageViews.createdAt})`,
      count: sql<number>`COUNT(*)`
    })
      .from(pageViews)
      .where(sql`${pageViews.createdAt} >= ${startDate}`)
      .groupBy(sql`DATE(${pageViews.createdAt})`)
      .orderBy(sql`DATE(${pageViews.createdAt})`);

    // Build full date range with zeros for missing days
    const quoteMap = new Map(quoteResults.map(r => [r.date, Number(r.count)]));
    const pageViewMap = new Map(pageViewResults.map(r => [r.date, Number(r.count)]));

    const quotes: { date: string; count: number }[] = [];
    const pageViewTrends: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      quotes.push({ date: dateStr, count: quoteMap.get(dateStr) || 0 });
      pageViewTrends.push({ date: dateStr, count: pageViewMap.get(dateStr) || 0 });
    }

    return { quotes, pageViews: pageViewTrends };
  }

  async initializeCRMTestData(): Promise<void> {
    // Create admin user if not exists
    const adminEmail = "admin@heritagels.org";
    let adminUser = await this.getUserByEmail(adminEmail);

    if (!adminUser) {
      console.log("Creating admin user for CRM testing...");
      const hashedPassword = await bcrypt.hash("admin1234", 10);
      adminUser = await this.createUser({
        email: adminEmail,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        phone: "(630) 778-0888",
        role: "owner",
      });
      console.log("Admin user created: admin@heritagels.org / admin1234");
    } else {
      // Ensure admin role
      await db.update(users).set({ role: "owner" }).where(eq(users.email, adminEmail));
      console.log("Admin user exists: admin@heritagels.org / admin1234");
    }

    // Check if we have leads
    const existingLeads = await db.select({ count: sql<number>`COUNT(*)` }).from(leads);
    if (Number(existingLeads[0].count) > 0) {
      console.log(`Already have ${existingLeads[0].count} leads, skipping seed`);
      return;
    }

    console.log("Seeding CRM test leads...");

    const testLeads = [
      { firstName: "John", lastName: "Smith", email: "john.smith@example.com", phone: "(630) 555-0101", source: "quote_form", status: "new", estimatedValue: 250000, coverageType: "term" },
      { firstName: "Maria", lastName: "Garcia", email: "maria.garcia@example.com", phone: "(630) 555-0102", source: "referral", status: "contacted", estimatedValue: 500000, coverageType: "whole" },
      { firstName: "Robert", lastName: "Johnson", email: "robert.j@example.com", phone: "(630) 555-0103", source: "website", status: "quoted", estimatedValue: 1000000, coverageType: "iul" },
      { firstName: "Susan", lastName: "Williams", email: "susan.w@example.com", phone: "(630) 555-0104", source: "contact_form", status: "follow_up", estimatedValue: 150000, coverageType: "final_expense" },
      { firstName: "Thomas", lastName: "Brown", email: "tom.brown@example.com", phone: "(630) 555-0105", source: "phone", status: "won", estimatedValue: 300000, wonAmount: 285000, coverageType: "term" },
      { firstName: "Lisa", lastName: "Davis", email: "lisa.d@example.com", phone: "(630) 555-0106", source: "social_media", status: "lost", estimatedValue: 200000, lostReason: "Went with competitor", coverageType: "whole" },
      { firstName: "Michael", lastName: "Wilson", email: "mike.wilson@example.com", phone: "(630) 555-0107", source: "referral", status: "new", estimatedValue: 750000, coverageType: "iul" },
      { firstName: "Jennifer", lastName: "Taylor", email: "jen.taylor@example.com", phone: "(630) 555-0108", source: "quote_form", status: "contacted", estimatedValue: 400000, coverageType: "term" },
      { firstName: "David", lastName: "Anderson", email: "david.a@example.com", phone: "(630) 555-0109", source: "website", status: "quoted", estimatedValue: 600000, coverageType: "whole" },
      { firstName: "Emily", lastName: "Martinez", email: "emily.m@example.com", phone: "(630) 555-0110", source: "referral", status: "won", estimatedValue: 350000, wonAmount: 350000, coverageType: "term" },
    ];

    for (const lead of testLeads) {
      const now = new Date();
      const randomDays = Math.floor(Math.random() * 30);
      const createdAt = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);

      await db.insert(leads).values({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        status: lead.status,
        estimatedValue: lead.estimatedValue,
        coverageType: lead.coverageType,
        wonAmount: lead.wonAmount,
        lostReason: lead.lostReason,
        wonDate: lead.status === "won" ? createdAt : null,
        lastContactedAt: ["contacted", "quoted", "follow_up", "won", "lost"].includes(lead.status)
          ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
          : null,
        createdAt,
        updatedAt: createdAt,
      });
    }

    console.log("CRM test data seeded: 10 leads created");
  }

  // ==========================================================================
  // MEMBER CARDS
  // ==========================================================================

  async createMemberCard(card: any): Promise<any> {
    const [newCard] = await db.insert(memberCards).values(card).returning();
    return newCard;
  }

  async getMemberCardById(id: string): Promise<any | null> {
    const [card] = await db.select().from(memberCards).where(eq(memberCards.id, id));
    return card || null;
  }

  async getMemberCardByNumber(cardNumber: string): Promise<any | null> {
    const [card] = await db.select().from(memberCards).where(eq(memberCards.memberCardNumber, cardNumber));
    return card || null;
  }

  async getMemberCardsByAgent(agentId: string, filters?: { status?: string; search?: string }): Promise<any[]> {
    let query = db.select().from(memberCards).where(eq(memberCards.agentId, agentId));

    // Note: Additional filtering would be applied here with proper Drizzle conditions
    // For now, we filter in JS after the query
    const cards = await query.orderBy(desc(memberCards.createdAt));

    let result = cards;

    if (filters?.status) {
      result = result.filter(c => c.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(c =>
        c.memberFullName.toLowerCase().includes(searchLower) ||
        c.memberCardNumber.toLowerCase().includes(searchLower) ||
        c.policyNumber.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }

  async getMemberCardsByMember(memberId: string): Promise<any[]> {
    return db.select().from(memberCards)
      .where(eq(memberCards.memberId, memberId))
      .orderBy(desc(memberCards.createdAt));
  }

  async updateMemberCard(id: string, data: any): Promise<any | null> {
    const [updated] = await db.update(memberCards)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(memberCards.id, id))
      .returning();
    return updated || null;
  }

  async revokeMemberCard(id: string): Promise<boolean> {
    const [revoked] = await db.update(memberCards)
      .set({
        status: "revoked",
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(memberCards.id, id))
      .returning();
    return !!revoked;
  }

  async deleteMemberCard(id: string): Promise<boolean> {
    const result = await db.delete(memberCards).where(eq(memberCards.id, id));
    return true; // Drizzle delete doesn't return count easily, assume success
  }

  async getMemberCardStats(agentId: string): Promise<{ total: number; active: number; pending: number; revoked: number }> {
    const cards = await db.select().from(memberCards).where(eq(memberCards.agentId, agentId));

    return {
      total: cards.length,
      active: cards.filter(c => c.status === "active").length,
      pending: cards.filter(c => c.status === "pending").length,
      revoked: cards.filter(c => c.status === "revoked").length,
    };
  }

  // =============================================================================
  // LEADS
  // =============================================================================

  async getLeadById(id: string): Promise<Lead | null> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || null;
  }

  async getLeadsByAgentId(agentId: string): Promise<Lead[]> {
    return db.select().from(leads)
      .where(eq(leads.assignedTo, agentId))
      .orderBy(desc(leads.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead | null> {
    const [updated] = await db.update(leads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updated || null;
  }

  async createLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity> {
    const [newActivity] = await db.insert(leadActivities).values(activity).returning();
    return newActivity;
  }

  async getLeadActivities(leadId: string, limit: number = 50): Promise<LeadActivity[]> {
    return db.select().from(leadActivities)
      .where(eq(leadActivities.leadId, leadId))
      .orderBy(desc(leadActivities.createdAt))
      .limit(limit);
  }

  // =============================================================================
  // TASKS (Simple in-memory for now, can be moved to database)
  // =============================================================================

  async createTask(task: {
    userId: string;
    title: string;
    description?: string;
    dueDate?: Date;
    priority?: string;
    status?: string;
    leadId?: string;
    category?: string;
  }): Promise<{ id: string; title: string }> {
    // For now, create as a lead activity instead of a separate task table
    // This can be enhanced with a proper tasks table later
    if (task.leadId) {
      const activity = await this.createLeadActivity({
        leadId: task.leadId,
        type: "task",
        title: task.title,
        description: task.description || `Due: ${task.dueDate?.toISOString()} | Priority: ${task.priority}`,
        performedBy: task.userId,
      });
      return { id: activity.id, title: task.title };
    }

    // If no lead, log and return a mock ID
    console.log(`[Storage] Task created: ${task.title} for user ${task.userId}`);
    return { id: `task-${Date.now()}`, title: task.title };
  }

  // =============================================================================
  // AUTOMATIONS
  // =============================================================================

  async createAutomation(automation: InsertAutomation): Promise<Automation> {
    const [newAutomation] = await db.insert(automations).values(automation as any).returning();
    return newAutomation;
  }

  async getAutomationById(id: string): Promise<Automation | null> {
    const [automation] = await db.select().from(automations).where(eq(automations.id, id));
    return automation || null;
  }

  async getAutomationsByAgentId(agentId: string): Promise<Automation[]> {
    return db.select().from(automations)
      .where(eq(automations.agentId, agentId))
      .orderBy(desc(automations.createdAt));
  }

  async getEnabledAutomations(): Promise<Automation[]> {
    return db.select().from(automations)
      .where(eq(automations.enabled, true))
      .orderBy(desc(automations.createdAt));
  }

  async getAutomationsByTriggerType(triggerType: string): Promise<Automation[]> {
    return db.select().from(automations)
      .where(and(
        eq(automations.enabled, true),
        eq(automations.triggerType, triggerType)
      ))
      .orderBy(desc(automations.createdAt));
  }

  async updateAutomation(id: string, data: Partial<Automation>): Promise<Automation | null> {
    const [updated] = await db.update(automations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(automations.id, id))
      .returning();
    return updated || null;
  }

  async deleteAutomation(id: string): Promise<boolean> {
    await db.delete(automations).where(eq(automations.id, id));
    return true;
  }

  async toggleAutomation(id: string, enabled: boolean): Promise<Automation | null> {
    const [updated] = await db.update(automations)
      .set({ enabled, updatedAt: new Date() })
      .where(eq(automations.id, id))
      .returning();
    return updated || null;
  }

  async incrementAutomationStats(id: string, success: boolean): Promise<void> {
    const automation = await this.getAutomationById(id);
    if (!automation) return;

    await db.update(automations)
      .set({
        executedCount: (automation.executedCount || 0) + 1,
        successCount: success ? (automation.successCount || 0) + 1 : automation.successCount,
        failedCount: !success ? (automation.failedCount || 0) + 1 : automation.failedCount,
        lastExecutedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(automations.id, id));
  }

  // =============================================================================
  // AUTOMATION EXECUTIONS
  // =============================================================================

  async createAutomationExecution(execution: InsertAutomationExecution): Promise<AutomationExecution> {
    const [newExecution] = await db.insert(automationExecutions).values(execution as any).returning();
    return newExecution;
  }

  async getExecutionById(id: string): Promise<AutomationExecution | null> {
    const [execution] = await db.select().from(automationExecutions).where(eq(automationExecutions.id, id));
    return execution || null;
  }

  async getExecutionsByAutomationId(automationId: string, limit: number = 50): Promise<AutomationExecution[]> {
    return db.select().from(automationExecutions)
      .where(eq(automationExecutions.automationId, automationId))
      .orderBy(desc(automationExecutions.startedAt))
      .limit(limit);
  }

  async updateExecution(id: string, data: Partial<AutomationExecution>): Promise<AutomationExecution | null> {
    const [updated] = await db.update(automationExecutions)
      .set(data)
      .where(eq(automationExecutions.id, id))
      .returning();
    return updated || null;
  }

  async getRecentExecutions(agentId: string, limit: number = 50): Promise<AutomationExecution[]> {
    // Get all automation IDs for this agent first
    const agentAutomations = await this.getAutomationsByAgentId(agentId);
    const automationIds = agentAutomations.map(a => a.id);

    if (automationIds.length === 0) return [];

    return db.select().from(automationExecutions)
      .where(inArray(automationExecutions.automationId, automationIds))
      .orderBy(desc(automationExecutions.startedAt))
      .limit(limit);
  }

  // =============================================================================
  // WORKFLOW AUTOMATIONS (Visual Builder)
  // =============================================================================

  async createWorkflowAutomation(workflow: InsertWorkflowAutomation): Promise<WorkflowAutomation> {
    const [newWorkflow] = await db.insert(workflowAutomations).values(workflow as any).returning();
    return newWorkflow;
  }

  async getWorkflowAutomationById(id: string): Promise<WorkflowAutomation | null> {
    const [workflow] = await db.select().from(workflowAutomations).where(eq(workflowAutomations.id, id));
    return workflow || null;
  }

  async getWorkflowAutomationsByAgentId(agentId: string): Promise<WorkflowAutomation[]> {
    return db.select().from(workflowAutomations)
      .where(eq(workflowAutomations.agentId, agentId))
      .orderBy(desc(workflowAutomations.createdAt));
  }

  async updateWorkflowAutomation(id: string, data: Partial<WorkflowAutomation>): Promise<WorkflowAutomation | null> {
    const [updated] = await db.update(workflowAutomations)
      .set(data as any)
      .where(eq(workflowAutomations.id, id))
      .returning();
    return updated || null;
  }

  async deleteWorkflowAutomation(id: string): Promise<boolean> {
    await db.delete(workflowAutomations).where(eq(workflowAutomations.id, id));
    return true;
  }

  async getEnabledWorkflowAutomations(): Promise<WorkflowAutomation[]> {
    return db.select().from(workflowAutomations)
      .where(eq(workflowAutomations.enabled, true));
  }

  async createWorkflowExecution(data: {
    workflowAutomationId: string;
    status: string;
    triggeredBy: Record<string, unknown>;
    startedAt: Date;
  }): Promise<{ id: string }> {
    // Store execution in automationExecutions with a special marker
    const [execution] = await db.insert(automationExecutions).values({
      automationId: data.workflowAutomationId,
      status: data.status,
      triggeredBy: data.triggeredBy,
      startedAt: data.startedAt,
    } as any).returning();
    return execution;
  }

  async updateWorkflowExecution(id: string, data: {
    status?: string;
    nodeResults?: unknown;
    errorMessage?: string;
    completedAt?: Date;
    duration?: number;
  }): Promise<void> {
    await db.update(automationExecutions)
      .set({
        status: data.status,
        actionResults: data.nodeResults,
        errorMessage: data.errorMessage,
        completedAt: data.completedAt,
        duration: data.duration,
      } as any)
      .where(eq(automationExecutions.id, id));
  }

  async incrementWorkflowStats(workflowId: string, success: boolean): Promise<void> {
    const workflow = await this.getWorkflowAutomationById(workflowId);
    if (!workflow) return;

    const updates: {
      executedCount: number;
      successCount?: number;
      failedCount?: number;
      lastExecutedAt: Date;
    } = {
      executedCount: (workflow.executedCount || 0) + 1,
      lastExecutedAt: new Date(),
    };

    if (success) {
      updates.successCount = (workflow.successCount || 0) + 1;
    } else {
      updates.failedCount = (workflow.failedCount || 0) + 1;
    }

    await this.updateWorkflowAutomation(workflowId, updates);
  }

  async getWorkflowExecutionsByWorkflowId(workflowId: string, limit = 50): Promise<any[]> {
    return db.select().from(automationExecutions)
      .where(eq(automationExecutions.automationId, workflowId))
      .orderBy(desc(automationExecutions.startedAt))
      .limit(limit);
  }

  // Agent Licenses
  async getAgentLicenses(userId: string): Promise<AgentLicense[]> {
    return db.select().from(agentLicenses)
      .where(eq(agentLicenses.userId, userId))
      .orderBy(asc(agentLicenses.stateCode));
  }

  async getAgentLicenseById(id: string): Promise<AgentLicense | null> {
    const [license] = await db.select().from(agentLicenses)
      .where(eq(agentLicenses.id, id));
    return license || null;
  }

  async createAgentLicense(license: InsertAgentLicense): Promise<AgentLicense> {
    const [created] = await db.insert(agentLicenses).values(license).returning();
    return created;
  }

  async updateAgentLicense(id: string, data: Partial<AgentLicense>): Promise<AgentLicense | null> {
    const [updated] = await db.update(agentLicenses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(agentLicenses.id, id))
      .returning();
    return updated || null;
  }

  async deleteAgentLicense(id: string): Promise<boolean> {
    const result = await db.delete(agentLicenses).where(eq(agentLicenses.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Agent Territories
  async getAgentTerritories(userId: string): Promise<AgentTerritory[]> {
    return db.select().from(agentTerritories)
      .where(eq(agentTerritories.userId, userId))
      .orderBy(asc(agentTerritories.stateCode));
  }

  async createAgentTerritory(territory: InsertAgentTerritory): Promise<AgentTerritory> {
    const [created] = await db.insert(agentTerritories).values(territory).returning();
    return created;
  }

  async deleteAgentTerritory(id: string): Promise<boolean> {
    const result = await db.delete(agentTerritories).where(eq(agentTerritories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Agent Policies
  async getAgentPolicies(userId: string): Promise<AgentPolicy[]> {
    return db.select().from(agentPolicies)
      .where(eq(agentPolicies.userId, userId))
      .orderBy(desc(agentPolicies.createdAt));
  }

  async getAgentPolicyById(id: string): Promise<AgentPolicy | null> {
    const [policy] = await db.select().from(agentPolicies)
      .where(eq(agentPolicies.id, id));
    return policy || null;
  }

  async createAgentPolicy(policy: InsertAgentPolicy): Promise<AgentPolicy> {
    const [created] = await db.insert(agentPolicies).values(policy).returning();
    return created;
  }

  async updateAgentPolicy(id: string, data: Partial<AgentPolicy>): Promise<AgentPolicy | null> {
    const [updated] = await db.update(agentPolicies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(agentPolicies.id, id))
      .returning();
    return updated || null;
  }

  async deleteAgentPolicy(id: string): Promise<boolean> {
    const result = await db.delete(agentPolicies).where(eq(agentPolicies.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ── Agent Profiles (Registration) ──────────────────────────

  async createAgentProfile(profile: InsertAgentProfile): Promise<AgentProfile> {
    const [newProfile] = await db.insert(agentProfiles).values(profile).returning();
    return newProfile;
  }

  async getAgentProfileByUserId(userId: string): Promise<AgentProfile | null> {
    const [profile] = await db.select().from(agentProfiles).where(eq(agentProfiles.userId, userId));
    return profile || null;
  }

  async getPendingRegistrations(): Promise<AgentProfile[]> {
    return db.select().from(agentProfiles)
      .where(eq(agentProfiles.approvalStatus, "pending_review"))
      .orderBy(desc(agentProfiles.createdAt));
  }

  async updateAgentProfileApproval(
    profileId: string,
    status: string,
    approvedBy?: string,
    rejectionReason?: string,
  ): Promise<AgentProfile | null> {
    const [updated] = await db.update(agentProfiles)
      .set({
        approvalStatus: status,
        approvedBy: approvedBy || null,
        approvedAt: status === "approved" ? new Date() : null,
        rejectionReason: rejectionReason || null,
        updatedAt: new Date(),
      })
      .where(eq(agentProfiles.id, profileId))
      .returning();
    return updated || null;
  }
}

export const storage = new DatabaseStorage();
