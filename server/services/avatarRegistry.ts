import {
  type AiAvatar,
  type InsertAiAvatar,
  type UpdateAiAvatar,
  type AvatarSession,
  type InsertAvatarSession,
  type AvatarMessage,
  type InsertAvatarMessage,
  type DebateSession,
  type InsertDebateSession,
  type AvatarLog,
  type InsertAvatarLog,
  type AvatarKnowledgeBase,
  type InsertAvatarKnowledgeBase,
  type KnowledgeDocument,
  type InsertKnowledgeDocument,
  type KnowledgeChunk,
  type InsertKnowledgeChunk,
  aiAvatars,
  avatarSessions,
  avatarMessages,
  debateSessions,
  avatarLogs,
  avatarKnowledgeBases,
  knowledgeDocuments,
  knowledgeChunks,
  INITIAL_AVATARS,
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, and, inArray, sql, ilike, or } from "drizzle-orm";

// =============================================================================
// Avatar Registry Service
// =============================================================================

class AvatarRegistryService {
  // ---------------------------------------------------------------------------
  // Avatar CRUD
  // ---------------------------------------------------------------------------

  async getAllAvatars(): Promise<AiAvatar[]> {
    return db.select().from(aiAvatars).orderBy(desc(aiAvatars.responsePriority));
  }

  async getActiveAvatars(): Promise<AiAvatar[]> {
    return db.select().from(aiAvatars)
      .where(eq(aiAvatars.isActive, true))
      .orderBy(desc(aiAvatars.responsePriority));
  }

  async getAvatarById(id: string): Promise<AiAvatar | null> {
    const [avatar] = await db.select().from(aiAvatars).where(eq(aiAvatars.id, id));
    return avatar || null;
  }

  async getAvatarBySlug(slug: string): Promise<AiAvatar | null> {
    const [avatar] = await db.select().from(aiAvatars).where(eq(aiAvatars.slug, slug));
    return avatar || null;
  }

  async getAvatarsByIds(ids: string[]): Promise<AiAvatar[]> {
    if (ids.length === 0) return [];
    return db.select().from(aiAvatars).where(inArray(aiAvatars.id, ids));
  }

  async createAvatar(data: InsertAiAvatar): Promise<AiAvatar> {
    const [avatar] = await db.insert(aiAvatars).values(data).returning();
    return avatar;
  }

  async updateAvatar(id: string, data: UpdateAiAvatar): Promise<AiAvatar | null> {
    const [avatar] = await db.update(aiAvatars)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiAvatars.id, id))
      .returning();
    return avatar || null;
  }

  async deleteAvatar(id: string): Promise<boolean> {
    const result = await db.delete(aiAvatars).where(eq(aiAvatars.id, id));
    return true;
  }

  async toggleAvatarActive(id: string): Promise<AiAvatar | null> {
    const avatar = await this.getAvatarById(id);
    if (!avatar) return null;

    const [updated] = await db.update(aiAvatars)
      .set({ isActive: !avatar.isActive, updatedAt: new Date() })
      .where(eq(aiAvatars.id, id))
      .returning();
    return updated || null;
  }

  // ---------------------------------------------------------------------------
  // Domain Matching - Find best avatar(s) for a topic
  // ---------------------------------------------------------------------------

  async findAvatarsForDomain(domain: string): Promise<AiAvatar[]> {
    const activeAvatars = await this.getActiveAvatars();

    // Score avatars based on domain match
    const scoredAvatars = activeAvatars.map(avatar => {
      const expertise = avatar.domainExpertise || [];
      let score = 0;

      // Check if domain matches any expertise area
      for (const exp of expertise) {
        if (domain.toLowerCase().includes(exp.toLowerCase()) ||
            exp.toLowerCase().includes(domain.toLowerCase())) {
          score += 10;
        }
      }

      // Add priority as tiebreaker
      score += avatar.responsePriority;

      return { avatar, score };
    });

    // Sort by score and return avatars with score > 0
    return scoredAvatars
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(a => a.avatar);
  }

  async findBestAvatarForQuestion(question: string): Promise<AiAvatar | null> {
    const activeAvatars = await this.getActiveAvatars();
    if (activeAvatars.length === 0) return null;

    // Keywords to domain mapping
    const domainKeywords: Record<string, string[]> = {
      insurance: ["insurance", "policy", "coverage", "underwriting", "claim", "premium", "beneficiary", "term life", "whole life", "iul", "final expense"],
      sales: ["close", "closing", "sale", "selling", "prospect", "presentation", "objection", "deal", "client", "customer"],
      mindset: ["motivation", "mindset", "confidence", "fear", "reluctance", "rejection", "goal", "success", "struggle", "burnout"],
      compliance: ["compliance", "regulation", "legal", "license", "documentation", "finra", "sec", "hipaa", "audit"],
      persuasion: ["persuade", "persuasion", "convince", "influence", "tonality", "straight line", "certainty", "rapport"],
      objections: ["objection", "rebuttal", "response", "handle", "overcome", "think about it", "spouse", "expensive"],
    };

    // Score each avatar
    const questionLower = question.toLowerCase();
    const scoredAvatars = activeAvatars.map(avatar => {
      const expertise = avatar.domainExpertise || [];
      let score = 0;

      // Check each expertise area
      for (const exp of expertise) {
        const keywords = domainKeywords[exp] || [exp];
        for (const keyword of keywords) {
          if (questionLower.includes(keyword)) {
            score += 5;
          }
        }
      }

      // Add priority as base score
      score += avatar.responsePriority;

      return { avatar, score };
    });

    // Return highest scoring avatar
    scoredAvatars.sort((a, b) => b.score - a.score);
    return scoredAvatars[0]?.avatar || null;
  }

  // ---------------------------------------------------------------------------
  // Session Management
  // ---------------------------------------------------------------------------

  async createSession(data: InsertAvatarSession): Promise<AvatarSession> {
    const [session] = await db.insert(avatarSessions).values(data).returning();
    return session;
  }

  async getSessionById(id: string): Promise<AvatarSession | null> {
    const [session] = await db.select().from(avatarSessions).where(eq(avatarSessions.id, id));
    return session || null;
  }

  async getSessionsByUserId(userId: string): Promise<AvatarSession[]> {
    return db.select().from(avatarSessions)
      .where(eq(avatarSessions.userId, userId))
      .orderBy(desc(avatarSessions.createdAt));
  }

  async getActiveSessionForUser(userId: string): Promise<AvatarSession | null> {
    const [session] = await db.select().from(avatarSessions)
      .where(and(eq(avatarSessions.userId, userId), eq(avatarSessions.isActive, true)))
      .orderBy(desc(avatarSessions.createdAt));
    return session || null;
  }

  async updateSession(id: string, data: Partial<AvatarSession>): Promise<AvatarSession | null> {
    const [session] = await db.update(avatarSessions)
      .set(data)
      .where(eq(avatarSessions.id, id))
      .returning();
    return session || null;
  }

  async endSession(id: string): Promise<AvatarSession | null> {
    const [session] = await db.update(avatarSessions)
      .set({ isActive: false, endedAt: new Date() })
      .where(eq(avatarSessions.id, id))
      .returning();
    return session || null;
  }

  // ---------------------------------------------------------------------------
  // Message Management
  // ---------------------------------------------------------------------------

  async createMessage(data: InsertAvatarMessage): Promise<AvatarMessage> {
    const [message] = await db.insert(avatarMessages).values(data).returning();
    return message;
  }

  async getMessagesBySessionId(sessionId: string, limit: number = 100): Promise<AvatarMessage[]> {
    return db.select().from(avatarMessages)
      .where(eq(avatarMessages.sessionId, sessionId))
      .orderBy(avatarMessages.createdAt)
      .limit(limit);
  }

  async getRecentMessages(sessionId: string, count: number = 10): Promise<AvatarMessage[]> {
    const messages = await db.select().from(avatarMessages)
      .where(eq(avatarMessages.sessionId, sessionId))
      .orderBy(desc(avatarMessages.createdAt))
      .limit(count);
    return messages.reverse(); // Return in chronological order
  }

  // ---------------------------------------------------------------------------
  // Debate Session Management
  // ---------------------------------------------------------------------------

  async createDebateSession(data: InsertDebateSession): Promise<DebateSession> {
    const [debate] = await db.insert(debateSessions).values(data).returning();
    return debate;
  }

  async getDebateSessionById(id: string): Promise<DebateSession | null> {
    const [debate] = await db.select().from(debateSessions).where(eq(debateSessions.id, id));
    return debate || null;
  }

  async getDebateBySessionId(sessionId: string): Promise<DebateSession | null> {
    const [debate] = await db.select().from(debateSessions)
      .where(eq(debateSessions.sessionId, sessionId));
    return debate || null;
  }

  async updateDebateSession(id: string, data: Partial<DebateSession>): Promise<DebateSession | null> {
    const [debate] = await db.update(debateSessions)
      .set(data)
      .where(eq(debateSessions.id, id))
      .returning();
    return debate || null;
  }

  async advanceDebateTurn(id: string): Promise<DebateSession | null> {
    const debate = await this.getDebateSessionById(id);
    if (!debate) return null;

    const newTurn = debate.currentTurn + 1;
    const status = newTurn > debate.maxTurns ? "completed" : "active";

    const [updated] = await db.update(debateSessions)
      .set({
        currentTurn: newTurn,
        status,
        completedAt: status === "completed" ? new Date() : null
      })
      .where(eq(debateSessions.id, id))
      .returning();
    return updated || null;
  }

  async interruptDebate(id: string): Promise<DebateSession | null> {
    const [debate] = await db.update(debateSessions)
      .set({ status: "interrupted", completedAt: new Date() })
      .where(eq(debateSessions.id, id))
      .returning();
    return debate || null;
  }

  async saveDebateSummary(
    debateId: string,
    summary: {
      executiveSummary: string;
      keyConsensus: string[];
      unresolvedPoints: string[];
      avatar1KeyPoints: string[];
      avatar2KeyPoints: string[];
    }
  ): Promise<DebateSession | null> {
    const [debate] = await db.update(debateSessions)
      .set({
        executiveSummary: summary.executiveSummary,
        keyConsensus: summary.keyConsensus,
        unresolvedPoints: summary.unresolvedPoints,
        avatar1KeyPoints: summary.avatar1KeyPoints,
        avatar2KeyPoints: summary.avatar2KeyPoints,
      })
      .where(eq(debateSessions.id, debateId))
      .returning();
    return debate || null;
  }

  // ---------------------------------------------------------------------------
  // Logging / Observability
  // ---------------------------------------------------------------------------

  async createLog(data: InsertAvatarLog): Promise<AvatarLog> {
    const [log] = await db.insert(avatarLogs).values(data).returning();
    return log;
  }

  async getLogsBySessionId(sessionId: string): Promise<AvatarLog[]> {
    return db.select().from(avatarLogs)
      .where(eq(avatarLogs.sessionId, sessionId))
      .orderBy(avatarLogs.createdAt);
  }

  async getRecentLogs(limit: number = 100): Promise<AvatarLog[]> {
    return db.select().from(avatarLogs)
      .orderBy(desc(avatarLogs.createdAt))
      .limit(limit);
  }

  // ---------------------------------------------------------------------------
  // Knowledge Base Management
  // ---------------------------------------------------------------------------

  async createKnowledgeBase(data: InsertAvatarKnowledgeBase): Promise<AvatarKnowledgeBase> {
    const [kb] = await db.insert(avatarKnowledgeBases).values(data).returning();
    return kb;
  }

  async getKnowledgeBasesByAvatarId(avatarId: string): Promise<AvatarKnowledgeBase[]> {
    try {
      return await db.select().from(avatarKnowledgeBases)
        .where(eq(avatarKnowledgeBases.avatarId, avatarId));
    } catch (error: any) {
      // If the table doesn't exist yet, return empty array
      if (error.message?.includes("does not exist")) {
        return [];
      }
      throw error;
    }
  }

  async createDocument(data: InsertKnowledgeDocument): Promise<KnowledgeDocument> {
    const [doc] = await db.insert(knowledgeDocuments).values(data).returning();
    return doc;
  }

  async getDocumentsByKnowledgeBaseId(kbId: string): Promise<KnowledgeDocument[]> {
    return db.select().from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.knowledgeBaseId, kbId));
  }

  async createChunk(data: InsertKnowledgeChunk): Promise<KnowledgeChunk> {
    const [chunk] = await db.insert(knowledgeChunks).values(data).returning();
    return chunk;
  }

  async getChunksByDocumentId(docId: string): Promise<KnowledgeChunk[]> {
    return db.select().from(knowledgeChunks)
      .where(eq(knowledgeChunks.documentId, docId))
      .orderBy(knowledgeChunks.chunkIndex);
  }

  // Semantic search for relevant chunks (placeholder - real implementation needs vector search)
  async searchKnowledgeBase(avatarId: string, query: string, limit: number = 5): Promise<KnowledgeChunk[]> {
    try {
      // Get all knowledge bases for this avatar
      const kbs = await this.getKnowledgeBasesByAvatarId(avatarId);
      if (kbs.length === 0) return [];

      const kbIds = kbs.map(kb => kb.id);

      // Get all documents from these knowledge bases
      const docs = await db.select().from(knowledgeDocuments)
        .where(inArray(knowledgeDocuments.knowledgeBaseId, kbIds));
      if (docs.length === 0) return [];

      const docIds = docs.map(d => d.id);

      // Simple keyword search (replace with vector search when embeddings are implemented)
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

      const allChunks = await db.select().from(knowledgeChunks)
        .where(inArray(knowledgeChunks.documentId, docIds));

      // Score chunks by keyword matches
      const scoredChunks = allChunks.map(chunk => {
        const contentLower = chunk.content.toLowerCase();
        let score = 0;
        for (const word of queryWords) {
          if (contentLower.includes(word)) {
            score += 1;
          }
        }
        return { chunk, score };
      });

      return scoredChunks
        .filter(c => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(c => c.chunk);
    } catch (error: any) {
      // If the knowledge base tables don't exist yet, return empty array
      if (error.message?.includes("does not exist")) {
        console.log("[AvatarRegistry] Knowledge base tables not yet created, skipping RAG");
        return [];
      }
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Seed Initial Avatars
  // ---------------------------------------------------------------------------

  async seedInitialAvatars(): Promise<void> {
    const existing = await this.getAllAvatars();
    const existingSlugs = new Set(existing.map(a => a.slug));

    if (existing.length === 0) {
      // Full seed
      console.log("[AvatarRegistry] Seeding initial avatars...");
      for (const avatarData of INITIAL_AVATARS) {
        await this.createAvatar(avatarData);
        console.log(`[AvatarRegistry] Created avatar: ${avatarData.name}`);
      }
      console.log("[AvatarRegistry] Seed complete");
    } else {
      // Check for missing avatars and add them
      const missingAvatars = INITIAL_AVATARS.filter(a => !existingSlugs.has(a.slug));
      if (missingAvatars.length > 0) {
        console.log(`[AvatarRegistry] Adding ${missingAvatars.length} missing avatar(s)...`);
        for (const avatarData of missingAvatars) {
          await this.createAvatar(avatarData);
          console.log(`[AvatarRegistry] Created avatar: ${avatarData.name}`);
        }
      } else {
        console.log(`[AvatarRegistry] ${existing.length} avatars already exist, all up to date`);
      }
    }
  }
}

export const avatarRegistry = new AvatarRegistryService();
