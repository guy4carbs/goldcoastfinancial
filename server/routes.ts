import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { insertQuoteRequestSchema, insertContactMessageSchema, insertJobApplicationSchema, loginSchema, registerSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { sendContactNotification, sendQuoteNotification, sendQuoteConfirmationToApplicant, sendPortalMessage, sendMeetingNotification, sendJobApplicationNotification, sendPrivacyRequestNotification } from "./gmail";
import { checkCalendarConnection, getCalendarEvents, getTodaysEvents, getUpcomingEvents, getConnectedEmail } from "./googleCalendar";
import { addLeadToSheet } from "./sheets";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import adminProductsRouter from "./routes/admin-products";
import adminContentRouter from "./routes/admin-content";
import adminCrmRouter from "./routes/admin-crm";
import contentRouter from "./routes/content";
import quotesRouter from "./routes/quotes";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const PgSession = connectPgSimple(session);

export function setupSession(app: Express) {
  app.set("trust proxy", 1);
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "gold-coast-financial-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "none",
      },
    })
  );
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Health check endpoint (doesn't require database)
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  setupSession(app);
  
  // Auth: Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone || null,
      });
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...safeUser } = user;
      res.status(201).json({ user: safeUser });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });
  
  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Check password
      const isValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  });
  
  // Auth: Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // Auth: Get current user
  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.json({ user: null });
    }
    
    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.json({ user: null });
      }
      
      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  
  // Quote request submission
  app.post("/api/quote-requests", async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      const quoteRequest = await storage.createQuoteRequest(validatedData);
      
      // Prepare data with null converted to undefined for optional fields
      const dataWithOptionalFields = {
        ...validatedData,
        addressLine2: validatedData.addressLine2 ?? undefined,
      };
      
      // Send email notification to Heritage team
      try {
        console.log("Attempting to send quote notification email...");
        await sendQuoteNotification(dataWithOptionalFields);
        console.log("Quote notification email sent successfully");
      } catch (emailError: any) {
        console.error("Error sending quote notification email:", emailError?.message || emailError);
      }

      // Send confirmation email to applicant
      try {
        console.log("Attempting to send quote confirmation to applicant...");
        await sendQuoteConfirmationToApplicant({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          coverageType: validatedData.coverageType,
          coverageAmount: validatedData.coverageAmount,
        });
        console.log("Quote confirmation email sent to applicant successfully");
      } catch (emailError: any) {
        console.error("Error sending quote confirmation to applicant:", emailError?.message || emailError);
      }

      // Add lead to Google Sheet
      try {
        await addLeadToSheet(dataWithOptionalFields);
      } catch (sheetError) {
        console.error("Error adding lead to Google Sheet:", sheetError);
      }
      
      res.status(201).json(quoteRequest);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: fromZodError(error).toString() 
        });
      }
      console.error("Error creating quote request:", error);
      res.status(500).json({ error: "Failed to submit quote request" });
    }
  });

  // Get all quote requests (admin endpoint)
  app.get("/api/quote-requests", async (req, res) => {
    try {
      const requests = await storage.getQuoteRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching quote requests:", error);
      res.status(500).json({ error: "Failed to fetch quote requests" });
    }
  });

  // Contact message submission
  app.post("/api/contact-messages", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const contactMessage = await storage.createContactMessage(validatedData);
      
      // Send email notification
      try {
        console.log("Attempting to send contact notification email...");
        await sendContactNotification(validatedData);
        console.log("Contact notification email sent successfully");
      } catch (emailError: any) {
        console.error("Error sending contact notification email:", emailError?.message || emailError);
      }
      
      res.status(201).json(contactMessage);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: fromZodError(error).toString() 
        });
      }
      console.error("Error creating contact message:", error);
      res.status(500).json({ error: "Failed to submit contact message" });
    }
  });

  // Get all contact messages (admin endpoint)
  app.get("/api/contact-messages", async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ error: "Failed to fetch contact messages" });
    }
  });

  // Get all job applications
  app.get("/api/job-applications", async (req, res) => {
    try {
      const applications = await storage.getJobApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ error: "Failed to fetch job applications" });
    }
  });

  // Meeting request submission
  app.post("/api/meeting-requests", async (req, res) => {
    try {
      const { name, email, phone, date, time, meetingType, topic, message } = req.body;
      
      if (!name || !email || !phone || !date || !time || !meetingType) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Send email notification
      try {
        console.log("Attempting to send meeting notification email...");
        await sendMeetingNotification({
          name,
          email,
          phone,
          date,
          time,
          meetingType,
          topic: topic || 'Not specified',
          message: message || undefined
        });
        console.log("Meeting notification email sent successfully");
      } catch (emailError: any) {
        console.error("Error sending meeting notification email:", emailError?.message || emailError);
        return res.status(500).json({ error: "Failed to send meeting request. Please try again." });
      }
      
      res.status(201).json({ success: true, message: "Meeting request sent successfully" });
    } catch (error: any) {
      console.error("Error processing meeting request:", error);
      res.status(500).json({ error: "Failed to submit meeting request" });
    }
  });

  // Job application submission
  app.post("/api/job-applications", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, position, linkedIn, experience, whyJoinUs, hasLicense, resumeFileName } = req.body;
      
      if (!firstName || !lastName || !email || !phone || !position || !experience || !whyJoinUs) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const applicationData = {
        firstName,
        lastName,
        email,
        phone,
        position,
        linkedIn: linkedIn || null,
        experience,
        whyJoinUs,
        hasLicense: hasLicense ? 'yes' : 'no',
        resumeFileName: resumeFileName || null,
      };
      
      const application = await storage.createJobApplication(applicationData);
      
      try {
        console.log("Attempting to send job application notification email...");
        await sendJobApplicationNotification({
          ...applicationData,
          linkedIn: linkedIn || undefined,
          hasLicense: hasLicense ? 'yes' : 'no',
          resumeFileName: resumeFileName || undefined,
        });
        console.log("Job application notification email sent successfully");
      } catch (emailError: any) {
        console.error("Error sending job application notification email:", emailError?.message || emailError);
      }
      
      res.status(201).json(application);
    } catch (error: any) {
      console.error("Error creating job application:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Privacy request submission
  app.post("/api/privacy-requests", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, requestType, message } = req.body;

      if (!firstName || !lastName || !email || !requestType || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Send email notification
      try {
        console.log("Attempting to send privacy request notification email...");
        await sendPrivacyRequestNotification({
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          requestType,
          message
        });
        console.log("Privacy request notification email sent successfully");
      } catch (emailError: any) {
        console.error("Error sending privacy request notification email:", emailError?.message || emailError);
      }

      res.status(201).json({ success: true, message: "Privacy request submitted" });
    } catch (error: any) {
      console.error("Error submitting privacy request:", error);
      res.status(500).json({ error: "Failed to submit privacy request" });
    }
  });

  // Portal: Send message to advisor (requires auth)
  app.post("/api/portal/messages/send", requireAuth, async (req, res) => {
    try {
      const { recipientEmail, recipientName, subject, message, priority } = req.body;
      
      if (!recipientEmail || !recipientName || !subject || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      await storage.createMessage({
        userId: user.id,
        fromName: `${user.firstName} ${user.lastName}`,
        fromEmail: user.email,
        subject,
        content: message,
        isFromClient: true,
        priority: priority || 'normal',
      });
      
      try {
        await sendPortalMessage({
          senderName: `${user.firstName} ${user.lastName}`,
          senderEmail: user.email,
          recipientEmail,
          recipientName,
          subject,
          message,
          priority: priority || 'normal'
        });
      } catch (emailError: any) {
        console.error("Email notification failed:", emailError?.message);
      }
      
      res.status(200).json({ success: true, message: "Message sent successfully" });
    } catch (error: any) {
      console.error("Error sending portal message:", error);
      res.status(500).json({ error: "Failed to send message. Please try again." });
    }
  });

  // Portal: Get user's policies
  app.get("/api/portal/policies", requireAuth, async (req, res) => {
    try {
      const policies = await storage.getPoliciesByUserId(req.session.userId!);
      res.json(policies);
    } catch (error) {
      console.error("Error fetching policies:", error);
      res.status(500).json({ error: "Failed to fetch policies" });
    }
  });

  // Portal: Get policy details
  app.get("/api/portal/policies/:id", requireAuth, async (req, res) => {
    try {
      const policy = await storage.getPolicyById(req.params.id);
      if (!policy || policy.userId !== req.session.userId) {
        return res.status(404).json({ error: "Policy not found" });
      }
      res.json(policy);
    } catch (error) {
      console.error("Error fetching policy:", error);
      res.status(500).json({ error: "Failed to fetch policy" });
    }
  });

  // Portal: Get user's documents
  app.get("/api/portal/documents", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByUserId(req.session.userId!);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Portal: Get user's messages
  app.get("/api/portal/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessagesByUserId(req.session.userId!);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Portal: Mark message as read
  app.patch("/api/portal/messages/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Portal: Get unread message count
  app.get("/api/portal/messages/unread-count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.session.userId!);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  // Portal: Get user's notifications
  app.get("/api/portal/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.session.userId!);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Portal: Mark notification as read
  app.patch("/api/portal/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Portal: Mark all notifications as read
  app.patch("/api/portal/notifications/read-all", requireAuth, async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.session.userId!);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  });

  // Portal: Get unread notification count
  app.get("/api/portal/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.session.userId!);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  // Portal: Get billing history
  app.get("/api/portal/billing", requireAuth, async (req, res) => {
    try {
      const billing = await storage.getBillingHistoryByUserId(req.session.userId!);
      res.json(billing);
    } catch (error) {
      console.error("Error fetching billing history:", error);
      res.status(500).json({ error: "Failed to fetch billing history" });
    }
  });

  // Portal: Update user profile
  app.patch("/api/portal/profile", requireAuth, async (req, res) => {
    try {
      const { firstName, lastName, phone } = req.body;
      const updatedUser = await storage.updateUser(req.session.userId!, {
        firstName,
        lastName,
        phone,
      });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Portal: Change password
  app.post("/api/portal/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters" });
      }
      
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(req.session.userId!, { password: hashedPassword });
      
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Chat: Get user's conversations
  app.get("/api/chat/conversations", requireAuth, async (req, res) => {
    try {
      const conversations = await storage.getChatConversationsByUserId(req.session.userId!);
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          const participants = await storage.getChatParticipants(conv.id);
          const messages = await storage.getChatMessages(conv.id, 1);
          const lastMessage = messages[messages.length - 1] || null;
          return {
            ...conv,
            participantCount: participants.length,
            lastMessage,
          };
        })
      );
      res.json(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Chat: Get or create main team chat
  app.get("/api/chat/main", requireAuth, async (req, res) => {
    try {
      let mainChat = await storage.getMainTeamChat();
      
      if (!mainChat) {
        mainChat = await storage.createChatConversation({
          name: "Team Chat",
          type: "channel",
          createdById: req.session.userId!,
        });
      }
      
      const isParticipant = await storage.isUserInConversation(req.session.userId!, mainChat.id);
      if (!isParticipant) {
        await storage.addChatParticipant({
          conversationId: mainChat.id,
          userId: req.session.userId!,
          role: "member",
        });
      }
      
      res.json(mainChat);
    } catch (error) {
      console.error("Error fetching main chat:", error);
      res.status(500).json({ error: "Failed to fetch main chat" });
    }
  });

  // Chat: Get conversation messages
  app.get("/api/chat/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const isParticipant = await storage.isUserInConversation(req.session.userId!, req.params.id);
      if (!isParticipant) {
        return res.status(403).json({ error: "Not a participant in this conversation" });
      }
      
      const messages = await storage.getChatMessages(req.params.id);
      await storage.updateLastReadAt(req.session.userId!, req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Chat: Send message
  app.post("/api/chat/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Message content is required" });
      }
      
      const isParticipant = await storage.isUserInConversation(req.session.userId!, req.params.id);
      if (!isParticipant) {
        return res.status(403).json({ error: "Not a participant in this conversation" });
      }
      
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      const message = await storage.createChatMessage({
        conversationId: req.params.id,
        senderId: req.session.userId!,
        senderName: `${user.firstName} ${user.lastName}`,
        content: content.trim(),
        type: "text",
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Chat: Create new conversation (DM or group)
  app.post("/api/chat/conversations", requireAuth, async (req, res) => {
    try {
      const { name, type, participantIds } = req.body;
      
      if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ error: "At least one participant is required" });
      }
      
      const conversation = await storage.createChatConversation({
        name: name || null,
        type: type || (participantIds.length > 1 ? "group" : "direct"),
        createdById: req.session.userId!,
      });
      
      await storage.addChatParticipant({
        conversationId: conversation.id,
        userId: req.session.userId!,
        role: "admin",
      });
      
      for (const oderId of participantIds) {
        if (oderId !== req.session.userId) {
          await storage.addChatParticipant({
            conversationId: conversation.id,
            userId: oderId,
            role: "member",
          });
        }
      }
      
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Chat: Get all users for starting new chats
  app.get("/api/chat/users", requireAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllAgentUsers();
      const safeUsers = allUsers
        .filter(u => u.id !== req.session.userId)
        .map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Chat: Get conversation participants
  app.get("/api/chat/conversations/:id/participants", requireAuth, async (req, res) => {
    try {
      const participants = await storage.getChatParticipants(req.params.id);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  // Google Calendar: Check connection status
  app.get("/api/calendar/status", async (req, res) => {
    try {
      const connected = await checkCalendarConnection();
      const email = connected ? await getConnectedEmail() : null;
      res.json({ connected, email });
    } catch (error) {
      res.json({ connected: false, email: null });
    }
  });

  // Google Calendar: Get events
  app.get("/api/calendar/events", async (req, res) => {
    try {
      const { start, end, days } = req.query;
      
      let events;
      if (start && end) {
        events = await getCalendarEvents(new Date(start as string), new Date(end as string));
      } else if (days) {
        events = await getUpcomingEvents(parseInt(days as string));
      } else {
        events = await getCalendarEvents();
      }
      
      res.json({ events });
    } catch (error: any) {
      console.error("Error fetching calendar events:", error);
      if (error.message?.includes('not connected')) {
        res.status(401).json({ error: "Calendar not connected", needsConnection: true });
      } else {
        res.status(500).json({ error: "Failed to fetch calendar events" });
      }
    }
  });

  // Google Calendar: Get today's events
  app.get("/api/calendar/today", async (req, res) => {
    try {
      const events = await getTodaysEvents();
      res.json({ events });
    } catch (error: any) {
      if (error.message?.includes('not connected')) {
        res.status(401).json({ error: "Calendar not connected", needsConnection: true });
      } else {
        console.error("Error fetching today's events:", error);
        res.status(500).json({ error: "Failed to fetch today's events" });
      }
    }
  });

  // Portal: Dashboard summary
  app.get("/api/portal/dashboard", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const [policies, unreadMessages, unreadNotifications, billing] = await Promise.all([
        storage.getPoliciesByUserId(userId),
        storage.getUnreadMessageCount(userId),
        storage.getUnreadNotificationCount(userId),
        storage.getBillingHistoryByUserId(userId),
      ]);

      const totalCoverage = policies.reduce((sum, p) => sum + p.coverageAmount, 0);
      const monthlyPremium = policies.reduce((sum, p) => sum + parseFloat(p.monthlyPremium || "0"), 0);
      const activePolicies = policies.filter(p => p.status === "active").length;

      const nextPayment = policies
        .filter(p => p.nextPaymentDate)
        .sort((a, b) => new Date(a.nextPaymentDate!).getTime() - new Date(b.nextPaymentDate!).getTime())[0];

      res.json({
        totalCoverage,
        monthlyPremium: monthlyPremium.toFixed(2),
        activePolicies,
        nextPaymentDate: nextPayment?.nextPaymentDate,
        unreadMessages,
        unreadNotifications,
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Admin: Products management
  app.use("/api/admin/products", adminProductsRouter);

  // Admin: Content management (CMS)
  app.use("/api/admin/content", adminContentRouter);

  // Admin: CRM (leads, settings, testimonials)
  app.use("/api/admin", adminCrmRouter);

  // Public content (blog, FAQs, pages)
  app.use("/api/content", contentRouter);

  // Quotes and estimates
  app.use("/api/quotes", quotesRouter);

  // ===== Public Newsletter Subscribe =====
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email, firstName, lastName, phone, source, landingPage, referrerUrl } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      // Check if already subscribed
      const existing = await pool.query(
        "SELECT * FROM newsletter_subscribers WHERE email = $1",
        [email.toLowerCase()]
      );

      if (existing.rows.length > 0) {
        const existingRecord = existing.rows[0];

        // Update info if new details provided (fill in missing fields)
        const updatedFirstName = firstName || existingRecord.first_name;
        const updatedLastName = lastName || existingRecord.last_name;
        const updatedPhone = phone || existingRecord.phone;

        if (existingRecord.status === "unsubscribed") {
          await pool.query(
            `UPDATE newsletter_subscribers SET
              status = 'active',
              first_name = COALESCE($2, first_name),
              last_name = COALESCE($3, last_name),
              phone = COALESCE($4, phone),
              unsubscribed_at = NULL,
              updated_at = NOW()
            WHERE email = $1`,
            [email.toLowerCase(), firstName, lastName, phone]
          );

          await pool.query(
            `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, performed_by)
             VALUES ($1, 'resubscribed', 'User resubscribed', 'user')`,
            [existingRecord.id]
          );

          return res.json({ success: true, message: "Welcome back! You've been resubscribed." });
        }

        // Update any missing info for existing active subscribers
        if (firstName || lastName || phone) {
          await pool.query(
            `UPDATE newsletter_subscribers SET
              first_name = COALESCE($2, first_name),
              last_name = COALESCE($3, last_name),
              phone = COALESCE($4, phone),
              updated_at = NOW()
            WHERE email = $1`,
            [email.toLowerCase(), firstName, lastName, phone]
          );
        }

        return res.json({ success: true, message: "You're already subscribed!" });
      }

      // Generate a unique unsubscribe token
      const unsubscribeToken = crypto.randomUUID();

      const result = await pool.query(
        `INSERT INTO newsletter_subscribers
          (email, first_name, last_name, phone, source, landing_page, referrer_url, ip_address, user_agent, created_by, confirm_token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'user', $10)
         RETURNING id`,
        [
          email.toLowerCase(),
          firstName || null,
          lastName || null,
          phone || null,
          source || "website",
          landingPage || null,
          referrerUrl || null,
          ipAddress,
          userAgent,
          unsubscribeToken,
        ]
      );

      await pool.query(
        `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, metadata, performed_by)
         VALUES ($1, 'subscribed', 'Subscribed via website', $2, 'user')`,
        [result.rows[0].id, JSON.stringify({ source: source || "website", landingPage })]
      );

      res.status(201).json({ success: true, message: "Thanks for subscribing!" });
    } catch (error) {
      console.error("Error subscribing:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  // ===== Public Newsletter Unsubscribe =====

  // GET unsubscribe page data (lookup by token)
  app.get("/api/newsletter/unsubscribe/:token", async (req, res) => {
    try {
      const { token } = req.params;

      const result = await pool.query(
        `SELECT id, email, first_name, status FROM newsletter_subscribers WHERE confirm_token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Invalid or expired unsubscribe link" });
      }

      const subscriber = result.rows[0];

      // Mask email for privacy (show first 2 chars and domain)
      const [localPart, domain] = subscriber.email.split("@");
      const maskedEmail = localPart.slice(0, 2) + "***@" + domain;

      res.json({
        email: maskedEmail,
        firstName: subscriber.first_name,
        status: subscriber.status,
        alreadyUnsubscribed: subscriber.status === "unsubscribed"
      });
    } catch (error) {
      console.error("Error fetching unsubscribe info:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // POST to confirm unsubscribe
  app.post("/api/newsletter/unsubscribe/:token", async (req, res) => {
    try {
      const { token } = req.params;

      const result = await pool.query(
        `SELECT id, email, status FROM newsletter_subscribers WHERE confirm_token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Invalid or expired unsubscribe link" });
      }

      const subscriber = result.rows[0];

      if (subscriber.status === "unsubscribed") {
        return res.json({ success: true, message: "You were already unsubscribed" });
      }

      // Update status to unsubscribed
      await pool.query(
        `UPDATE newsletter_subscribers
         SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [subscriber.id]
      );

      // Log activity
      await pool.query(
        `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, performed_by)
         VALUES ($1, 'unsubscribed', 'User unsubscribed via email link', 'user')`,
        [subscriber.id]
      );

      res.json({ success: true, message: "You have been successfully unsubscribed" });
    } catch (error) {
      console.error("Error processing unsubscribe:", error);
      res.status(500).json({ error: "Failed to unsubscribe" });
    }
  });

  // ===== Training API Routes =====

  // Training Progress: Get all progress for current user
  app.get("/api/training/progress", requireAuth, async (req, res) => {
    try {
      const progress = await storage.getTrainingProgress(req.session.userId!);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching training progress:", error);
      res.status(500).json({ error: "Failed to fetch training progress" });
    }
  });

  // Training Progress: Get specific module progress
  app.get("/api/training/progress/:moduleId", requireAuth, async (req, res) => {
    try {
      const progress = await storage.getModuleProgress(req.session.userId!, req.params.moduleId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching module progress:", error);
      res.status(500).json({ error: "Failed to fetch module progress" });
    }
  });

  // Training Progress: Save/update module progress
  app.post("/api/training/progress", requireAuth, async (req, res) => {
    try {
      const { moduleId, status, progressPercent, lastPosition, timeSpentMinutes } = req.body;

      if (!moduleId) {
        return res.status(400).json({ error: "moduleId is required" });
      }

      const progressData: any = {
        userId: req.session.userId!,
        moduleId,
      };

      if (status) progressData.status = status;
      if (progressPercent !== undefined) progressData.progressPercent = progressPercent;
      if (lastPosition) progressData.lastPosition = lastPosition;
      if (timeSpentMinutes !== undefined) progressData.timeSpentMinutes = timeSpentMinutes;

      // Set timestamps based on status
      if (status === "in_progress" && !progressData.startedAt) {
        progressData.startedAt = new Date();
      }
      if (status === "completed") {
        progressData.completedAt = new Date();
        progressData.progressPercent = 100;
      }

      const progress = await storage.upsertTrainingProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error saving training progress:", error);
      res.status(500).json({ error: "Failed to save training progress" });
    }
  });

  // Assessments: Get assessment history
  app.get("/api/training/assessments/history", requireAuth, async (req, res) => {
    try {
      const history = await storage.getAssessmentHistory(req.session.userId!);
      res.json(history);
    } catch (error) {
      console.error("Error fetching assessment history:", error);
      res.status(500).json({ error: "Failed to fetch assessment history" });
    }
  });

  // Assessments: Get attempts for specific assessment
  app.get("/api/training/assessments/:assessmentId/attempts", requireAuth, async (req, res) => {
    try {
      const attempts = await storage.getAssessmentAttempts(req.session.userId!, req.params.assessmentId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching assessment attempts:", error);
      res.status(500).json({ error: "Failed to fetch assessment attempts" });
    }
  });

  // Assessments: Submit assessment result
  app.post("/api/training/assessments/submit", requireAuth, async (req, res) => {
    try {
      const { assessmentId, score, passed, autoFailed, autoFailReason, timeSpentMinutes, answers } = req.body;

      if (!assessmentId || score === undefined || passed === undefined) {
        return res.status(400).json({ error: "assessmentId, score, and passed are required" });
      }

      const result = await storage.createAssessmentResult({
        userId: req.session.userId!,
        assessmentId,
        score,
        passed,
        autoFailed: autoFailed || false,
        autoFailReason: autoFailReason || null,
        timeSpentMinutes: timeSpentMinutes || null,
        answers: answers || null,
      });

      // Award XP for passed assessments
      if (passed && !autoFailed) {
        const xpAmount = score >= 90 ? 100 : score >= 80 ? 75 : 50;
        await storage.createXpTransaction({
          userId: req.session.userId!,
          amount: xpAmount,
          reason: `Passed assessment: ${assessmentId}`,
          sourceType: "assessment",
          sourceId: assessmentId,
        });
      }

      res.status(201).json(result);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      res.status(500).json({ error: "Failed to submit assessment" });
    }
  });

  // Simulations: Get simulation history
  app.get("/api/training/simulations/history", requireAuth, async (req, res) => {
    try {
      const history = await storage.getSimulationHistory(req.session.userId!);
      res.json(history);
    } catch (error) {
      console.error("Error fetching simulation history:", error);
      res.status(500).json({ error: "Failed to fetch simulation history" });
    }
  });

  // Simulations: Submit simulation result
  app.post("/api/training/simulations/submit", requireAuth, async (req, res) => {
    try {
      const { scenarioId, scoreBreakdown, totalScore, passed, pathTaken, feedback, audioUrl } = req.body;

      if (!scenarioId) {
        return res.status(400).json({ error: "scenarioId is required" });
      }

      const result = await storage.createSimulationResult({
        userId: req.session.userId!,
        scenarioId,
        scoreBreakdown: scoreBreakdown || null,
        totalScore: totalScore || null,
        passed: passed || null,
        pathTaken: pathTaken || null,
        feedback: feedback || null,
        audioUrl: audioUrl || null,
      });

      // Award XP for simulations
      if (passed && totalScore) {
        const xpAmount = totalScore >= 90 ? 150 : totalScore >= 70 ? 100 : 50;
        await storage.createXpTransaction({
          userId: req.session.userId!,
          amount: xpAmount,
          reason: `Completed simulation: ${scenarioId}`,
          sourceType: "simulation",
          sourceId: scenarioId,
        });
      }

      res.status(201).json(result);
    } catch (error) {
      console.error("Error submitting simulation:", error);
      res.status(500).json({ error: "Failed to submit simulation" });
    }
  });

  // Certificates: Get user's certificates
  app.get("/api/training/certificates", requireAuth, async (req, res) => {
    try {
      const certificates = await storage.getCertificates(req.session.userId!);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ error: "Failed to fetch certificates" });
    }
  });

  // Certificates: Verify certificate by number (public endpoint)
  app.get("/api/training/certificates/verify/:certificateNumber", async (req, res) => {
    try {
      const certificate = await storage.getCertificateByNumber(req.params.certificateNumber);
      if (!certificate) {
        return res.status(404).json({ valid: false, error: "Certificate not found" });
      }

      const user = await storage.getUserById(certificate.userId);
      res.json({
        valid: true,
        certificate: {
          certificationId: certificate.certificationId,
          issuedAt: certificate.issuedAt,
          expiresAt: certificate.expiresAt,
          holderName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        },
      });
    } catch (error) {
      console.error("Error verifying certificate:", error);
      res.status(500).json({ error: "Failed to verify certificate" });
    }
  });

  // Certificates: Generate certificate (after completing certification requirements)
  app.post("/api/training/certificates/generate", requireAuth, async (req, res) => {
    try {
      const { certificationId, expiresAt } = req.body;

      if (!certificationId) {
        return res.status(400).json({ error: "certificationId is required" });
      }

      // Check if user already has this certificate
      const existingCerts = await storage.getCertificates(req.session.userId!);
      const existing = existingCerts.find(c => c.certificationId === certificationId);
      if (existing) {
        return res.status(400).json({ error: "Certificate already issued for this certification" });
      }

      const certificate = await storage.createCertificate({
        userId: req.session.userId!,
        certificationId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      // Award XP for earning a certificate
      await storage.createXpTransaction({
        userId: req.session.userId!,
        amount: 250,
        reason: `Earned certificate: ${certificationId}`,
        sourceType: "achievement",
        sourceId: certificationId,
      });

      res.status(201).json(certificate);
    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ error: "Failed to generate certificate" });
    }
  });

  // XP: Get user's XP history
  app.get("/api/training/xp/history", requireAuth, async (req, res) => {
    try {
      const history = await storage.getXpHistory(req.session.userId!);
      res.json(history);
    } catch (error) {
      console.error("Error fetching XP history:", error);
      res.status(500).json({ error: "Failed to fetch XP history" });
    }
  });

  // XP: Get user's total XP
  app.get("/api/training/xp/total", requireAuth, async (req, res) => {
    try {
      const totalXp = await storage.getTotalXp(req.session.userId!);
      res.json({ totalXp });
    } catch (error) {
      console.error("Error fetching total XP:", error);
      res.status(500).json({ error: "Failed to fetch total XP" });
    }
  });

  // Leaderboard: Get top agents by XP
  app.get("/api/training/leaderboard", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(limit);

      // Find current user's rank
      const allRankings = await storage.getLeaderboard(1000);
      const userRank = allRankings.findIndex(r => r.userId === req.session.userId!) + 1;
      const userEntry = allRankings.find(r => r.userId === req.session.userId!);

      res.json({
        leaderboard: leaderboard.map((entry, idx) => ({
          rank: idx + 1,
          userId: entry.userId,
          firstName: entry.user.firstName,
          lastName: entry.user.lastName,
          totalXp: entry.totalXp,
          isCurrentUser: entry.userId === req.session.userId!,
        })),
        currentUser: {
          rank: userRank || null,
          totalXp: userEntry?.totalXp || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Training Summary: Get comprehensive training stats
  app.get("/api/training/summary", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const [progress, assessments, simulations, certificates, totalXp] = await Promise.all([
        storage.getTrainingProgress(userId),
        storage.getAssessmentHistory(userId),
        storage.getSimulationHistory(userId),
        storage.getCertificates(userId),
        storage.getTotalXp(userId),
      ]);

      const completedModules = progress.filter(p => p.status === "completed").length;
      const inProgressModules = progress.filter(p => p.status === "in_progress").length;
      const passedAssessments = assessments.filter(a => a.passed && !a.autoFailed).length;
      const passedSimulations = simulations.filter(s => s.passed).length;

      res.json({
        modules: {
          completed: completedModules,
          inProgress: inProgressModules,
          total: progress.length,
        },
        assessments: {
          passed: passedAssessments,
          total: assessments.length,
          averageScore: assessments.length > 0
            ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
            : 0,
        },
        simulations: {
          passed: passedSimulations,
          total: simulations.length,
        },
        certificates: certificates.length,
        totalXp,
      });
    } catch (error) {
      console.error("Error fetching training summary:", error);
      res.status(500).json({ error: "Failed to fetch training summary" });
    }
  });

  // ===== Analytics API Routes =====

  // Track page view (called from client)
  app.post("/api/analytics/pageview", async (req, res) => {
    try {
      const { page, title, referrer, userAgent, screenWidth, screenHeight } = req.body;

      await storage.createPageView({
        page: page || "/",
        title: title || null,
        referrer: referrer || null,
        userAgent: userAgent || null,
        screenWidth: screenWidth?.toString() || null,
        screenHeight: screenHeight?.toString() || null,
        sessionId: req.sessionID || null,
      });

      res.status(201).json({ success: true });
    } catch (error) {
      // Silent fail - don't break the app if analytics fails
      res.status(201).json({ success: true });
    }
  });

  // Track custom event (called from client)
  app.post("/api/analytics/event", async (req, res) => {
    try {
      const { event, params, page, timestamp } = req.body;

      await storage.createAnalyticsEvent({
        eventName: event,
        eventParams: params ? JSON.stringify(params) : null,
        page: page || null,
        sessionId: req.sessionID || null,
      });

      res.status(201).json({ success: true });
    } catch (error) {
      // Silent fail
      res.status(201).json({ success: true });
    }
  });

  // Get analytics overview for admin dashboard
  app.get("/api/analytics/overview", async (req, res) => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get all the data
      const [quotes, contacts, applications, pageViewsAll, eventsAll] = await Promise.all([
        storage.getQuoteRequests(),
        storage.getContactMessages(),
        storage.getJobApplications(),
        storage.getPageViews(),
        storage.getAnalyticsEvents(),
      ]);

      // Calculate stats
      const quotesToday = quotes.filter(q => new Date(q.createdAt) >= today).length;
      const quotesThisWeek = quotes.filter(q => new Date(q.createdAt) >= weekAgo).length;
      const quotesThisMonth = quotes.filter(q => new Date(q.createdAt) >= monthAgo).length;

      const contactsToday = contacts.filter(c => new Date(c.createdAt) >= today).length;
      const contactsThisWeek = contacts.filter(c => new Date(c.createdAt) >= weekAgo).length;
      const contactsThisMonth = contacts.filter(c => new Date(c.createdAt) >= monthAgo).length;

      const pageViewsToday = pageViewsAll.filter(p => new Date(p.createdAt) >= today).length;
      const pageViewsThisWeek = pageViewsAll.filter(p => new Date(p.createdAt) >= weekAgo).length;
      const pageViewsThisMonth = pageViewsAll.filter(p => new Date(p.createdAt) >= monthAgo).length;

      // Coverage type breakdown
      const coverageTypes = quotes.reduce((acc, q) => {
        const type = q.coverageType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // State breakdown
      const stateBreakdown = quotes.reduce((acc, q) => {
        const state = q.state || 'unknown';
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Top pages
      const pageStats = await storage.getPageViewStats();

      // Event breakdown
      const eventStats = await storage.getEventStats();

      // Daily trends (last 30 days)
      const dailyQuotes: Record<string, number> = {};
      const dailyPageViews: Record<string, number> = {};

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        dailyQuotes[dateStr] = 0;
        dailyPageViews[dateStr] = 0;
      }

      quotes.forEach(q => {
        const dateStr = new Date(q.createdAt).toISOString().split('T')[0];
        if (dailyQuotes[dateStr] !== undefined) {
          dailyQuotes[dateStr]++;
        }
      });

      pageViewsAll.forEach(p => {
        const dateStr = new Date(p.createdAt).toISOString().split('T')[0];
        if (dailyPageViews[dateStr] !== undefined) {
          dailyPageViews[dateStr]++;
        }
      });

      res.json({
        summary: {
          quotes: {
            total: quotes.length,
            today: quotesToday,
            thisWeek: quotesThisWeek,
            thisMonth: quotesThisMonth,
          },
          contacts: {
            total: contacts.length,
            today: contactsToday,
            thisWeek: contactsThisWeek,
            thisMonth: contactsThisMonth,
          },
          applications: {
            total: applications.length,
          },
          pageViews: {
            total: pageViewsAll.length,
            today: pageViewsToday,
            thisWeek: pageViewsThisWeek,
            thisMonth: pageViewsThisMonth,
          },
        },
        coverageTypes,
        stateBreakdown,
        topPages: pageStats.slice(0, 10),
        eventStats: eventStats.slice(0, 10),
        trends: {
          quotes: Object.entries(dailyQuotes).map(([date, count]) => ({ date, count })),
          pageViews: Object.entries(dailyPageViews).map(([date, count]) => ({ date, count })),
        },
        recentQuotes: quotes.slice(0, 10).map(q => ({
          id: q.id,
          name: `${q.firstName} ${q.lastName}`,
          coverageType: q.coverageType,
          coverageAmount: q.coverageAmount,
          state: q.state,
          createdAt: q.createdAt,
        })),
        recentContacts: contacts.slice(0, 10).map(c => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          createdAt: c.createdAt,
        })),
      });
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  return httpServer;
}
