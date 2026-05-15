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
import { db, pool } from "./db";
import { eq, desc, and, inArray, asc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { encryptField } from "./services/encryptionService";

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
    // Case-insensitive lookup — emails are written by humans and apps in
    // every casing imaginable (`Gaetanocarbs@iCloud.com` from an invite
    // form, `gaetanocarbs@icloud.com` from a login). Without normalization
    // here, the same person can't sign in or reset their password just
    // because their browser autofilled a different case. Match Postgres'
    // citext behavior without requiring the extension.
    const normalized = (email || "").trim().toLowerCase();
    const [user] = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = ${normalized}`);
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
      // M-4 (audit 2026-05-12): never log credentials, even for the demo
      // account. Log lines flow to centralized aggregators (Railway, Sentry,
      // ELK) and surface in incident reports.
      console.log("Demo user created.");

      await this.initializeDemoData(demoUser.id);
    } else {
      const hashedPassword = await bcrypt.hash("demo1234", 10);
      await db.update(users).set({ password: hashedPassword }).where(eq(users.email, demoEmail));
      console.log("Demo user password rotated.");
      
      const existingPolicies = await this.getPoliciesByUserId(existingUser.id);
      if (existingPolicies.length === 0) {
        await this.initializeDemoData(existingUser.id);
      }
    }
  }

  async initializeOwnerAccount(): Promise<void> {
    const ownerEmail = "guy4carbs@gmail.com";
    const ownerPassword = "S!llyM0nkey1";
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);

    const existing = await this.getUserByEmail(ownerEmail);

    if (!existing) {
      // Create owner account
      const owner = await this.createUser({
        email: ownerEmail,
        password: hashedPassword,
        firstName: "Gold Coast Financial Partners",
        lastName: "LLC",
        phone: "6304781835",
      });
      // Set role to founder (top-tier — Founders Lounge access)
      await db.update(users).set({ role: "founder" }).where(eq(users.email, ownerEmail));
      // Create agent_hierarchy record as Founder at 120%
      await pool.query(
        `INSERT INTO agent_hierarchy (agent_user_id, direct_upline_id, hierarchy_level, hierarchy_title, upline_chain, contract_level, override_eligible, override_percentage, effective_from)
         VALUES ($1, NULL, 0, 'Founder', '[]', 120, true, 0, NOW())
         ON CONFLICT DO NOTHING`,
        [owner.id]
      );
      console.log("Owner account created: guy4carbs@gmail.com");
    } else {
      // Update password and ensure role is founder (top-tier).
      // Set the legal person's name (Gaetano Carbonara) — the COMPANY name lives
      // on agent_profiles.company_name, not on users.first/last_name.
      await db.update(users).set({ password: hashedPassword, role: "founder", firstName: "Gaetano", lastName: "Carbonara" }).where(eq(users.email, ownerEmail));
      // Ensure hierarchy record exists
      const hierarchy = await pool.query(
        `SELECT id FROM agent_hierarchy WHERE agent_user_id = $1 AND (effective_to IS NULL OR effective_to > NOW())`,
        [existing.id]
      );
      if (hierarchy.rows.length === 0) {
        await pool.query(
          `INSERT INTO agent_hierarchy (agent_user_id, direct_upline_id, hierarchy_level, hierarchy_title, upline_chain, contract_level, override_eligible, override_percentage, effective_from)
           VALUES ($1, NULL, 0, 'Founder', '[]', 120, true, 0, NOW())`,
          [existing.id]
        );
        console.log("Owner hierarchy record created: Founder at 120%");
      } else {
        // Ensure contract level is 120
        await pool.query(
          `UPDATE agent_hierarchy SET contract_level = 120, hierarchy_level = 0, hierarchy_title = 'Founder', updated_at = NOW()
           WHERE agent_user_id = $1 AND (effective_to IS NULL OR effective_to > NOW())`,
          [existing.id]
        );
      }
      console.log("Owner account updated: guy4carbs@gmail.com (role=founder, 120%, Founder)");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Promote the seeded root agency to the project's canonical top-level
  // entity (Gold Coast Financial Partners LLC) and persist the three carrier
  // contracts that previously only existed via the demo fallback. After this
  // runs, the agency_carrier_contracts table actually contains rows so:
  //   - Founders → Agency Management → Carriers shows real (not demo) data
  //   - The hierarchy drawer's "Appoint agent" button has real carrier_ids
  //     to write carrier_appointments rows against
  //   - The founder user is linked to the root agency via agency_teams so
  //     resolveAgentAgency() always returns GCF for them
  async initializeRootAgencyAndCarriers(): Promise<void> {
    const ROOT_AGENCY_ID = "00000000-0000-4000-8000-000000000001";
    const CANONICAL_NAME = "Gold Coast Financial Partners LLC";
    try {
      // 1. Make sure the root agency row exists and has the canonical name.
      await pool.query(
        `INSERT INTO agencies (id, name, dba_name, legal_entity_type, status, notes)
         VALUES ($1::uuid, $2, 'Gold Coast Financial', 'LLC', 'active',
                 'Top-level agency for the entire system. Seeded by initializeRootAgencyAndCarriers().')
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           dba_name = EXCLUDED.dba_name,
           legal_entity_type = EXCLUDED.legal_entity_type,
           status = 'active',
           updated_at = NOW()`,
        [ROOT_AGENCY_ID, CANONICAL_NAME],
      );

      // 2. Link the owner (founder) to the root agency so resolveAgentAgency
      //    returns GCF when the drawer is viewed on the founder node, and so
      //    the founder appears as a manager of the root agency.
      const ownerRes = await pool.query(
        `SELECT id FROM users WHERE email = $1 LIMIT 1`,
        ["guy4carbs@gmail.com"],
      );
      if (ownerRes.rows[0]) {
        await pool.query(
          `INSERT INTO agency_teams (agency_id, manager_user_id, assigned_at)
           VALUES ($1::uuid, $2::uuid, NOW())
           ON CONFLICT (manager_user_id) DO UPDATE SET agency_id = EXCLUDED.agency_id`,
          [ROOT_AGENCY_ID, ownerRes.rows[0].id],
        );
      }

      // 3. Persist the three carrier directory entries (deterministic ids so
      //    re-runs are idempotent and the IDs match wherever else they're used).
      const seedCarriers = [
        { id: "carrier-mutual-omaha-001",  name: "Mutual of Omaha",                short: "Mutual of Omaha", code: "MOO" },
        { id: "carrier-foresters-001",     name: "Foresters Financial",            short: "Foresters",       code: "FOR" },
        { id: "carrier-americo-001",       name: "Americo Financial Life",         short: "Americo",         code: "AMR" },
      ];
      for (const c of seedCarriers) {
        await pool.query(
          `INSERT INTO carrier_directory (id, name, short_name, code, is_active)
           VALUES ($1, $2, $3, $4, true)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             short_name = EXCLUDED.short_name,
             code = EXCLUDED.code,
             is_active = true`,
          [c.id, c.name, c.short, c.code],
        );
      }

      // 4. One-time cleanup of the demo Mutual/Foresters/Americo contracts
      //    we previously auto-seeded. Founders want a clean Active Agency
      //    Carrier Contracts list — real contracts get added through the
      //    Add Carrier flow. Idempotent: DELETE matches nothing on subsequent
      //    boots once the rows are gone. Carrier directory entries remain
      //    intact so adding a new contract still autocompletes the carrier.
      await pool.query(
        `DELETE FROM agency_carrier_contracts
          WHERE agency_id = $1::uuid
            AND carrier_id IN (
              'carrier-mutual-omaha-001',
              'carrier-foresters-001',
              'carrier-americo-001'
            )`,
        [ROOT_AGENCY_ID],
      );

      console.log(
        `Root agency seed complete: ${CANONICAL_NAME} + ${seedCarriers.length} carriers persisted.`,
      );

      // 5. Founder DBA profile — Gold Coast Financial Partners LLC is a
      //    business entity, not an individual. Force the DBA fields on the
      //    founder's agent_profiles row so the Agent HCMS DBA page renders the
      //    business-entity flow (LLC, EIN, formation, business address) on
      //    boot, regardless of what was set previously.
      if (ownerRes.rows[0]) {
        const ownerId = ownerRes.rows[0].id;

        // 5. DBA: founder is a business entity. company_name = the LLC, dba_name
        //    = the brand the public sees. Force these so the admin HCMS Profile
        //    + Agency Mgmt + Doing Business As pages all reflect the canonical
        //    setup. Personal address comes from the CNA E&O cert.
        await pool.query(
          `INSERT INTO agent_profiles (
              user_id, dba_type, company_type, dba_name, company_name, state_of_inc,
              street_address, city, state, zip_code,
              business_email, business_phone,
              business_street, business_city, business_state, business_zip
            )
           VALUES (
              $1::uuid, 'business_entity', 'LLC', $2, $3, 'IL',
              '3824 Wilcox Avenue', 'Downers Grove', 'IL', '60515',
              'contact@goldcoastfnl.com', '6304781835',
              '3824 Wilcox Avenue', 'Downers Grove', 'IL', '60515'
            )
           ON CONFLICT (user_id) DO UPDATE SET
             dba_type = 'business_entity',
             company_type = 'LLC',
             dba_name = EXCLUDED.dba_name,
             company_name = EXCLUDED.company_name,
             state_of_inc = COALESCE(agent_profiles.state_of_inc, 'IL'),
             street_address = COALESCE(agent_profiles.street_address, EXCLUDED.street_address),
             city = COALESCE(agent_profiles.city, EXCLUDED.city),
             state = COALESCE(agent_profiles.state, EXCLUDED.state),
             zip_code = COALESCE(agent_profiles.zip_code, EXCLUDED.zip_code),
             business_email = COALESCE(agent_profiles.business_email, EXCLUDED.business_email),
             business_phone = COALESCE(agent_profiles.business_phone, EXCLUDED.business_phone),
             business_street = COALESCE(agent_profiles.business_street, EXCLUDED.business_street),
             business_city = COALESCE(agent_profiles.business_city, EXCLUDED.business_city),
             business_state = COALESCE(agent_profiles.business_state, EXCLUDED.business_state),
             business_zip = COALESCE(agent_profiles.business_zip, EXCLUDED.business_zip)`,
          [ownerId, "Heritage Life Solutions", CANONICAL_NAME],
        );
        console.log(`Founder DBA: ${CANONICAL_NAME} dba "Heritage Life Solutions" (Downers Grove, IL).`);

        // 6. Founder E&O insurance — canonical data from CNA Certificate of
        //    Insurance (NAPA-issued, 2026-03-11). Force-set so the agent profile
        //    matches the uploaded certificate exactly.
        await pool.query(
          `UPDATE agent_profiles
              SET eo_provider = $1,
                  eo_policy_number = $2,
                  eo_effective_date = $3,
                  eo_expiration_date = $4,
                  eo_coverage_amount = $5
            WHERE user_id::text = $6`,
          [
            "CNA (Continental Casualty Company)",
            "596427449",
            "2026-03-01",
            "2027-03-01",
            "$1M / $3M aggregate",
            ownerId,
          ],
        );
        console.log("Founder E&O updated to CNA policy 596427449 (eff 03/01/2026 → 03/01/2027).");

        // 6b. Founder bank details — JPMorgan Chase for Business (account
        //     2908097368, routing 071000013). Encrypted via the same KMS-backed
        //     encryption service every other PII field uses; the masked last-4
        //     is rendered server-side at read time via maskField().
        try {
          const encryptedRouting = encryptField("071000013");
          const encryptedAccount = encryptField("2908097368");
          await pool.query(
            `UPDATE agent_profiles
                SET bank_name = $1,
                    bank_account_type = $2,
                    routing_number_encrypted = $3,
                    account_number_encrypted = $4
              WHERE user_id::text = $5`,
            [
              "JPMorgan Chase",
              "business_checking",
              encryptedRouting,
              encryptedAccount,
              ownerId,
            ],
          );
          console.log("Founder bank details set: JPMorgan Chase (business checking, ****7368).");
        } catch (bankErr: any) {
          console.error("[storage] bank details seed failed:", bankErr?.message);
        }

        // 6c. Founder personal details — DOB + NPN. Force-set so the Overview
        //     page reflects the canonical values (was placeholder 01/01/1985 /
        //     12345678 from earlier defaults).
        await pool.query(
          `UPDATE agent_profiles
              SET date_of_birth = $1::date,
                  npn = $2,
                  is_licensed = COALESCE(is_licensed, 'yes')
            WHERE user_id::text = $3`,
          ["2006-11-19", "22080385", ownerId],
        );
        console.log("Founder personal details set: DOB 11/19/2006, NPN 22080385.");

        // 6d. Founder licensed states — Illinois (resident state). Idempotent
        //     via SELECT-then-INSERT since agent_licenses has no unique
        //     constraint on (user_id, state_code).
        const licCheck = await pool.query(
          `SELECT id FROM agent_licenses WHERE user_id::text = $1 AND state_code = 'IL' LIMIT 1`,
          [ownerId],
        );
        if (licCheck.rows.length === 0) {
          await pool.query(
            `INSERT INTO agent_licenses
                (user_id, state_code, license_type, status, is_resident)
             VALUES ($1, 'IL', 'life', 'active', true)`,
            [ownerId],
          );
        } else {
          await pool.query(
            `UPDATE agent_licenses
                SET status = 'active', is_resident = true, license_type = 'life'
              WHERE user_id::text = $1 AND state_code = 'IL'`,
            [ownerId],
          );
        }
        // Mirror onto agent_profiles.license_type so the DBA + admin views show
        // a consistent "Life Only" label across all license-type surfaces.
        await pool.query(
          `UPDATE agent_profiles SET license_type = 'life' WHERE user_id::text = $1`,
          [ownerId],
        );
        // Mirror onto agent_profiles.licensed_states (text[]) so the Overview
        // and KPI tiles ("Licensed States: N") count it without an extra join.
        await pool.query(
          `UPDATE agent_profiles
              SET licensed_states = CASE
                    WHEN licensed_states IS NULL THEN ARRAY['IL']::text[]
                    WHEN NOT ('IL' = ANY(licensed_states)) THEN array_append(licensed_states, 'IL')
                    ELSE licensed_states
                  END
            WHERE user_id::text = $1`,
          [ownerId],
        );
        console.log("Founder licensed states: Illinois (IL) — resident.");

        // 6e. Founder background questions — answer all 19 SureLC questions
        //     as "No". Stored as a JSON array on agent_profiles.background_answers.
        const allNoAnswers = Array.from({ length: 19 }, (_, i) => ({
          questionIndex: i,
          answer: "No" as const,
          details: "",
        }));
        await pool.query(
          `UPDATE agent_profiles
              SET background_answers = $1::jsonb,
                  has_felony = false,
                  has_misdemeanor = false,
                  has_bankruptcy = false
            WHERE user_id::text = $2`,
          [JSON.stringify(allNoAnswers), ownerId],
        );
        console.log("Founder background questions: 19/19 answered No.");

        // 7. Sign the 3 contracting agreements (NDA, Debt Roll-Up, Compliance &
        //    Ethics) on behalf of Gaetano Carbonara. Stores a small inline SVG
        //    of the cursive signature in the *_document_key column so the View
        //    button can render it without a backing PDF.
        const cursiveSignatureSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80"><text x="10" y="55" font-family="Brush Script MT, Lucida Handwriting, cursive" font-size="48" fill="#2D1810" font-style="italic">Gaetano Carbonara</text></svg>`)}`;
        const checklistRes = await pool.query(
          `SELECT id FROM contracting_checklists WHERE agent_user_id = $1::uuid LIMIT 1`,
          [ownerId],
        );
        if (checklistRes.rows.length === 0) {
          await pool.query(
            `INSERT INTO contracting_checklists
                (agent_user_id, nda_status, nda_signed_at, nda_document_key,
                 debt_rollup_status, debt_rollup_signed_at, debt_rollup_document_key,
                 compliance_status, compliance_signed_at, compliance_document_key,
                 all_completed, completed_at)
             VALUES ($1::uuid, 'signed', NOW(), $2, 'signed', NOW(), $2, 'signed', NOW(), $2, true, NOW())`,
            [ownerId, cursiveSignatureSvg],
          );
        } else {
          await pool.query(
            `UPDATE contracting_checklists
                SET nda_status = 'signed', nda_signed_at = COALESCE(nda_signed_at, NOW()), nda_document_key = COALESCE(nda_document_key, $2),
                    debt_rollup_status = 'signed', debt_rollup_signed_at = COALESCE(debt_rollup_signed_at, NOW()), debt_rollup_document_key = COALESCE(debt_rollup_document_key, $2),
                    compliance_status = 'signed', compliance_signed_at = COALESCE(compliance_signed_at, NOW()), compliance_document_key = COALESCE(compliance_document_key, $2),
                    all_completed = true, completed_at = COALESCE(completed_at, NOW()), updated_at = NOW()
              WHERE agent_user_id = $1::uuid`,
            [ownerId, cursiveSignatureSvg],
          );
        }
        console.log("Founder contracting agreements (NDA / Debt Roll-Up / Compliance) signed.");

        // 8. Storage health-check: NULL any document s3_keys whose underlying
        //    storage object is missing. Otherwise the docs page shows them as
        //    "uploaded" with a perpetual "File not found — please re-upload"
        //    error. After this pass the user sees an honest "Not uploaded"
        //    state and can re-upload via DocumentCard cleanly.
        try {
          const { fileExists, isS3Available } = await import("./services/s3Service");
          if (isS3Available()) {
            const docCols = [
              "eo_certificate_s3_key",
              "drivers_license_s3_key",
              "aml_certificate_s3_key",
              "direct_deposit_form_s3_key",
              "articles_s3_key",
            ];
            const profileRes = await pool.query(
              `SELECT ${docCols.join(", ")} FROM agent_profiles WHERE user_id::text = $1`,
              [ownerId],
            );
            const row = profileRes.rows[0] || {};
            const stale: string[] = [];
            for (const col of docCols) {
              const key = row[col];
              if (!key || key.startsWith("http")) continue;
              try {
                const exists = await fileExists(key);
                if (!exists) stale.push(col);
              } catch {
                stale.push(col);
              }
            }
            if (stale.length > 0) {
              const sets = stale.map((c) => `${c} = NULL`).join(", ");
              await pool.query(
                `UPDATE agent_profiles SET ${sets}, updated_at = NOW() WHERE user_id::text = $1`,
                [ownerId],
              );
              console.log(`Founder document keys cleared (storage missing): ${stale.join(", ")}`);
            }
          }
        } catch (healthErr: any) {
          console.warn("[storage] document health-check skipped:", healthErr?.message);
        }
      }

      // 9. Seed founder_goals for the current quarter (idempotent via the
      //    UNIQUE (agency_id, metric_key, period_start) constraint). Gives
      //    /api/founders/dashboard/quarterly-goals real targets to render
      //    against on a fresh DB so the cockpit isn't stuck on demo numbers.
      try {
        const now = new Date();
        const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const periodStart = `${qStart.getFullYear()}-${String(qStart.getMonth() + 1).padStart(2, "0")}-${String(qStart.getDate()).padStart(2, "0")}`;
        const goals = [
          { metricKey: "revenue_quarterly",     target: 2000000, unit: "usd" },
          { metricKey: "new_agents_quarterly",  target: 10,      unit: "count" },
          { metricKey: "override_growth_pct",   target: 25,      unit: "pct" },
          { metricKey: "retention_pct",         target: 90,      unit: "pct" },
        ];
        for (const g of goals) {
          await pool.query(
            `INSERT INTO founder_goals (agency_id, metric_key, period_type, period_start, target_value, unit)
             VALUES ($1::uuid, $2, 'quarter', $3::date, $4, $5)
             ON CONFLICT (agency_id, metric_key, period_start) DO NOTHING`,
            [ROOT_AGENCY_ID, g.metricKey, periodStart, g.target, g.unit],
          );
        }
        console.log(`Founder goals seeded: ${goals.length} metrics for quarter starting ${periodStart}.`);
      } catch (goalErr: any) {
        console.warn("[storage] founder_goals seed skipped:", goalErr?.message);
      }
    } catch (err: any) {
      console.error("[storage] initializeRootAgencyAndCarriers error:", err?.message);
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
