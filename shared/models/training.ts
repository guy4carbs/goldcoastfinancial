import { pgTable, timestamp, varchar, uuid, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

// Agent training progress - tracks module completion
export const agentTrainingProgress = pgTable("agent_training_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  moduleId: varchar("module_id").notNull(),
  status: varchar("status").notNull().default("not_started"), // not_started, in_progress, completed
  progressPercent: integer("progress_percent").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastPosition: jsonb("last_position"), // { sectionIndex, contentIndex }
  timeSpentMinutes: integer("time_spent_minutes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assessment results - tracks quiz/test attempts
export const agentAssessmentResults = pgTable("agent_assessment_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  assessmentId: varchar("assessment_id").notNull(),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  autoFailed: boolean("auto_failed").default(false),
  autoFailReason: varchar("auto_fail_reason"),
  timeSpentMinutes: integer("time_spent_minutes"),
  attemptNumber: integer("attempt_number").default(1),
  answers: jsonb("answers"), // Full answer data for review
  completedAt: timestamp("completed_at").defaultNow(),
});

// Simulation results - tracks interactive call simulation attempts
export const agentSimulationResults = pgTable("agent_simulation_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  scenarioId: varchar("scenario_id").notNull(),
  scoreBreakdown: jsonb("score_breakdown"), // { category: points }
  totalScore: integer("total_score"),
  passed: boolean("passed"),
  pathTaken: jsonb("path_taken"), // Array of node IDs traversed
  feedback: jsonb("feedback"), // Array of feedback items
  audioUrl: varchar("audio_url"),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Certificates - issued certifications
export const agentCertificates = pgTable("agent_certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  certificationId: varchar("certification_id").notNull(),
  issuedAt: timestamp("issued_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  certificateNumber: varchar("certificate_number").unique(),
  pdfUrl: varchar("pdf_url"),
});

// XP transactions - tracks all XP awards
export const agentXpTransactions = pgTable("agent_xp_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  reason: varchar("reason").notNull(),
  sourceType: varchar("source_type"), // module, assessment, simulation, streak, achievement
  sourceId: varchar("source_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertTrainingProgressSchema = createInsertSchema(agentTrainingProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentResultSchema = createInsertSchema(agentAssessmentResults).omit({
  id: true,
  completedAt: true,
});

export const insertSimulationResultSchema = createInsertSchema(agentSimulationResults).omit({
  id: true,
  completedAt: true,
});

export const insertCertificateSchema = createInsertSchema(agentCertificates).omit({
  id: true,
  issuedAt: true,
});

export const insertXpTransactionSchema = createInsertSchema(agentXpTransactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type AgentTrainingProgress = typeof agentTrainingProgress.$inferSelect;
export type InsertAgentTrainingProgress = z.infer<typeof insertTrainingProgressSchema>;

export type AgentAssessmentResult = typeof agentAssessmentResults.$inferSelect;
export type InsertAgentAssessmentResult = z.infer<typeof insertAssessmentResultSchema>;

export type AgentSimulationResult = typeof agentSimulationResults.$inferSelect;
export type InsertAgentSimulationResult = z.infer<typeof insertSimulationResultSchema>;

export type AgentCertificate = typeof agentCertificates.$inferSelect;
export type InsertAgentCertificate = z.infer<typeof insertCertificateSchema>;

export type AgentXpTransaction = typeof agentXpTransactions.$inferSelect;
export type InsertAgentXpTransaction = z.infer<typeof insertXpTransactionSchema>;
