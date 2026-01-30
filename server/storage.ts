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
}

export const storage = new DatabaseStorage();
