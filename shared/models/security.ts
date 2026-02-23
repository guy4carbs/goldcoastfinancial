import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, uuid, boolean, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

// =============================================================================
// LOGIN ATTEMPTS - For account lockout
// =============================================================================

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }).notNull(),
    success: boolean("success").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_login_attempts_email").on(table.email),
    index("idx_login_attempts_ip").on(table.ipAddress),
    index("idx_login_attempts_created").on(table.createdAt),
  ]
);

export const insertLoginAttemptSchema = createInsertSchema(loginAttempts).omit({
  id: true,
  createdAt: true,
});

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = z.infer<typeof insertLoginAttemptSchema>;

// =============================================================================
// PASSWORD RESET TOKENS
// =============================================================================

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_password_reset_user").on(table.userId),
    index("idx_password_reset_token").on(table.tokenHash),
  ]
);

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

// =============================================================================
// USER DEVICES - For push notifications
// =============================================================================

export const userDevices = pgTable(
  "user_devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    deviceToken: varchar("device_token", { length: 255 }).notNull(),
    platform: varchar("platform", { length: 10 }).notNull(), // 'ios' or 'android'
    deviceName: varchar("device_name", { length: 100 }),
    appVersion: varchar("app_version", { length: 20 }),
    osVersion: varchar("os_version", { length: 20 }),
    isActive: boolean("is_active").notNull().default(true),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_user_devices_user").on(table.userId),
    index("idx_user_devices_token").on(table.deviceToken),
  ]
);

export const insertUserDeviceSchema = createInsertSchema(userDevices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsedAt: true,
  isActive: true,
});

export type UserDevice = typeof userDevices.$inferSelect;
export type InsertUserDevice = z.infer<typeof insertUserDeviceSchema>;

// =============================================================================
// AUDIT LOGS
// =============================================================================

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id),
    action: varchar("action", { length: 100 }).notNull(),
    resource: varchar("resource", { length: 100 }).notNull(),
    resourceId: varchar("resource_id", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull(), // 'success', 'failure', 'blocked'
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_audit_logs_user").on(table.userId),
    index("idx_audit_logs_action").on(table.action),
    index("idx_audit_logs_resource").on(table.resource),
    index("idx_audit_logs_created").on(table.createdAt),
  ]
);

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Audit action types for type safety
export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'account_locked'
  | 'password_change'
  | 'password_reset_request'
  | 'password_reset_complete'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_verified'
  | 'policy_view'
  | 'policy_create'
  | 'policy_update'
  | 'document_view'
  | 'document_download'
  | 'document_upload'
  | 'payment_initiated'
  | 'payment_completed'
  | 'data_export'
  | 'admin_action'
  | 'user_create'
  | 'user_update'
  | 'user_delete'
  | 'device_registered'
  | 'device_unregistered';

// =============================================================================
// APP CONFIG - For iOS app versioning and feature flags
// =============================================================================

export const appConfig = pgTable("app_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAppConfigSchema = createInsertSchema(appConfig).omit({
  id: true,
  updatedAt: true,
});

export type AppConfig = typeof appConfig.$inferSelect;
export type InsertAppConfig = z.infer<typeof insertAppConfigSchema>;
