import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for express-session
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Role enum for RBAC
export const userRoleEnum = ["owner", "system_admin", "manager", "sales_agent", "client"] as const;
export type UserRole = typeof userRoleEnum[number];

// User storage table for custom authentication
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  phone: varchar("phone"),

  // Role & Status
  role: varchar("role", { length: 50 }).notNull().default("sales_agent"),
  isActive: boolean("is_active").notNull().default(true),

  // Two-Factor Authentication
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),

  // OAuth / Social Login
  appleId: varchar("apple_id", { length: 255 }),
  googleId: varchar("google_id", { length: 255 }),

  // Profile & Preferences
  avatarUrl: varchar("avatar_url", { length: 500 }),
  timezone: varchar("timezone", { length: 100 }).default("America/Chicago"),

  // Tracking
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

export const agentRegisterSchema = z.object({
  // Step 1: Credentials
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),

  // Step 2: Personal
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),

  // Step 3: Address
  streetAddress: z.string().min(1, "Street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State is required"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Valid ZIP code required"),

  // Step 4: Professional
  isLicensed: z.enum(["yes", "no", "in_progress"]),
  licenseNumber: z.string().optional(),
  licensedStates: z.array(z.string()).optional(),
  yearsExperience: z.string().min(1, "Experience level is required"),
  previousAgency: z.string().optional(),
  npn: z.string().optional(),

  // Step 5: Motivation
  interestedProducts: z.array(z.string()).optional().default([]),
  whyJoinHeritage: z.string().min(50, "Please write at least 50 characters"),
  referralSource: z.string().min(1, "Please tell us how you heard about us"),
  referringAgentName: z.string().optional(),

  // Step 6: Consent
  agreedToTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to the Terms of Service" }) }),
  agreedToPrivacy: z.literal(true, { errorMap: () => ({ message: "You must agree to the Privacy Policy" }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type AgentRegisterInput = z.infer<typeof agentRegisterSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
