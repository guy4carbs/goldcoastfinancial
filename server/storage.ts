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
  type InstitutionalContact,
  type InsertInstitutionalContact,
  type NewsletterSubscription,
  type InsertNewsletter,
  type PartnershipQuizSubmission,
  type InsertPartnershipQuiz,
  type InstitutionalMeeting,
  type InsertInstitutionalMeeting,
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
  institutionalContacts,
  newsletterSubscriptions,
  partnershipQuizSubmissions,
  institutionalMeetings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray, asc } from "drizzle-orm";
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
}

export class DatabaseStorage implements IStorage {
  async createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest> {
    const [quoteRequest] = await db.insert(quoteRequests).values(request).returning();
    return quoteRequest;
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return db.select().from(quoteRequests).orderBy(quoteRequests.createdAt);
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [contactMessage] = await db.insert(contactMessages).values(message).returning();
    return contactMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(contactMessages.createdAt);
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

  // Institutional Contact Methods
  async createInstitutionalContact(contact: InsertInstitutionalContact): Promise<InstitutionalContact> {
    const [newContact] = await db.insert(institutionalContacts).values(contact).returning();
    return newContact;
  }

  async getInstitutionalContacts(): Promise<InstitutionalContact[]> {
    return db.select().from(institutionalContacts).orderBy(desc(institutionalContacts.createdAt));
  }

  // Newsletter Methods
  async createNewsletterSubscription(subscription: InsertNewsletter): Promise<NewsletterSubscription> {
    const [newSubscription] = await db.insert(newsletterSubscriptions).values(subscription).returning();
    return newSubscription;
  }

  async getNewsletterByEmail(email: string): Promise<NewsletterSubscription | null> {
    const [subscription] = await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.email, email));
    return subscription || null;
  }

  async updateNewsletterStatus(id: number, status: string): Promise<void> {
    const updateData: any = { status };
    if (status === 'unsubscribed') {
      updateData.unsubscribedAt = new Date();
    }
    await db.update(newsletterSubscriptions).set(updateData).where(eq(newsletterSubscriptions.id, id));
  }

  // Partnership Quiz Methods
  async createPartnershipQuiz(quiz: InsertPartnershipQuiz & { score: string }): Promise<PartnershipQuizSubmission> {
    const [newQuiz] = await db.insert(partnershipQuizSubmissions).values(quiz).returning();
    return newQuiz;
  }

  async getPartnershipQuizzes(): Promise<PartnershipQuizSubmission[]> {
    return db.select().from(partnershipQuizSubmissions).orderBy(desc(partnershipQuizSubmissions.createdAt));
  }

  // Institutional Meeting Methods
  async createInstitutionalMeeting(meeting: InsertInstitutionalMeeting): Promise<InstitutionalMeeting> {
    const [newMeeting] = await db.insert(institutionalMeetings).values(meeting).returning();
    return newMeeting;
  }

  async getInstitutionalMeetings(): Promise<InstitutionalMeeting[]> {
    return db.select().from(institutionalMeetings).orderBy(desc(institutionalMeetings.createdAt));
  }

  async updateInstitutionalMeetingStatus(id: number, status: string): Promise<void> {
    await db.update(institutionalMeetings).set({ status }).where(eq(institutionalMeetings.id, id));
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
}

export const storage = new DatabaseStorage();
