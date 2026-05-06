// Vector (Data Architect) — Agency Management schema
// Mirrors migrations/0011_agency_management.sql verbatim. Re-run that SQL
// any time you change column types here.
//
// Why no Drizzle FK to carrier_directory: carrier_directory is defined as a
// raw CREATE TABLE in server/db.ts (no Drizzle model). The DB-level foreign
// key is enforced in the migration; we just type carrier_id as varchar here.

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  jsonb,
  numeric,
  index,
  uniqueIndex,
  check,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { users } from "./auth";

// ============================================
// 1. agencies — recursive (parent_agency_id)
// ============================================

export const agencies = pgTable(
  "agencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentAgencyId: uuid("parent_agency_id").references(
      (): AnyPgColumn => agencies.id,
      { onDelete: "restrict" },
    ),
    name: varchar("name", { length: 255 }).notNull(),
    dbaName: varchar("dba_name", { length: 255 }),
    legalEntityType: varchar("legal_entity_type", { length: 50 }),
    ein: varchar("ein", { length: 20 }),
    stateOfFormation: varchar("state_of_formation", { length: 2 }),
    formationDate: date("formation_date"),
    primaryContactUserId: uuid("primary_contact_user_id").references(() => users.id),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),
    streetAddress: varchar("street_address", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zip_code", { length: 10 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
  },
  (t) => [
    index("idx_agencies_parent").on(t.parentAgencyId),
    index("idx_agencies_status").on(t.status),
    check("no_self_parent", sql`${t.id} <> ${t.parentAgencyId}`),
  ],
);

export const insertAgencySchema = createInsertSchema(agencies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type Agency = typeof agencies.$inferSelect;

export const AGENCY_STATUSES = ["active", "suspended", "terminated"] as const;
export type AgencyStatus = (typeof AGENCY_STATUSES)[number];

// ============================================
// 2. agency_teams — manager_user_id is the PK (one team per agency at a time)
// ============================================

export const agencyTeams = pgTable(
  "agency_teams",
  {
    agencyId: uuid("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    managerUserId: uuid("manager_user_id")
      .primaryKey()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
    assignedByUserId: uuid("assigned_by_user_id").references(() => users.id),
  },
  (t) => [index("idx_agency_teams_agency").on(t.agencyId)],
);

export const insertAgencyTeamSchema = createInsertSchema(agencyTeams).omit({
  assignedAt: true,
});
export type AgencyTeam = typeof agencyTeams.$inferSelect;

// ============================================
// 3. agency_carrier_contracts — MPA tracking per agency × carrier
// ============================================

export const agencyCarrierContracts = pgTable(
  "agency_carrier_contracts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    agencyId: uuid("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    // carrier_directory.id is varchar (raw table in server/db.ts) — FK enforced
    // at the DB layer in the migration; do not change to uuid here.
    carrierId: varchar("carrier_id").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    mpaEffectiveDate: date("mpa_effective_date"),
    mpaExpirationDate: date("mpa_expiration_date"),
    mpaDocumentS3Key: varchar("mpa_document_s3_key", { length: 500 }),
    primaryContactName: varchar("primary_contact_name", { length: 255 }),
    primaryContactEmail: varchar("primary_contact_email", { length: 255 }),
    primaryContactPhone: varchar("primary_contact_phone", { length: 50 }),
    statesAuthorized: jsonb("states_authorized"),
    // Wave 4 — agency-level writing/producer number assigned by the carrier
    // (e.g. Gold Coast's number with Mutual of Omaha). Migration 0012.
    writingNumber: varchar("writing_number", { length: 50 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
  },
  (t) => [
    index("idx_acc_agency").on(t.agencyId),
    index("idx_acc_carrier").on(t.carrierId),
    index("idx_acc_status").on(t.status),
    uniqueIndex("agency_carrier_contracts_agency_carrier_unique").on(
      t.agencyId,
      t.carrierId,
    ),
  ],
);

export const insertAgencyCarrierContractSchema = createInsertSchema(
  agencyCarrierContracts,
).omit({ id: true, createdAt: true, updatedAt: true });
export type AgencyCarrierContract = typeof agencyCarrierContracts.$inferSelect;

export const AGENCY_CARRIER_CONTRACT_STATUSES = [
  "active",
  "pending",
  "suspended",
  "terminated",
] as const;
export type AgencyCarrierContractStatus =
  (typeof AGENCY_CARRIER_CONTRACT_STATUSES)[number];

// ============================================
// 4. agency_carrier_commission_overrides — % deltas per agency × carrier × product
// ============================================

export const agencyCarrierCommissionOverrides = pgTable(
  "agency_carrier_commission_overrides",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    agencyId: uuid("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    carrierId: varchar("carrier_id").notNull(),
    productType: varchar("product_type", { length: 50 }),
    commissionPctDelta: numeric("commission_pct_delta", {
      precision: 5,
      scale: 2,
    }).notNull(),
    effectiveFrom: date("effective_from").notNull().defaultNow(),
    effectiveTo: date("effective_to"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
  },
  (t) => [
    index("idx_acco_active").on(t.agencyId, t.carrierId, t.effectiveTo),
    uniqueIndex("agency_carrier_overrides_unique").on(
      t.agencyId,
      t.carrierId,
      t.productType,
      t.effectiveFrom,
    ),
  ],
);

export const insertAgencyCarrierCommissionOverrideSchema = createInsertSchema(
  agencyCarrierCommissionOverrides,
).omit({ id: true, createdAt: true });
export type AgencyCarrierCommissionOverride =
  typeof agencyCarrierCommissionOverrides.$inferSelect;

// ============================================
// 5. carrier_compliance_requirements — AML, E&O minimum, state restrictions, etc.
// ============================================

export const carrierComplianceRequirements = pgTable(
  "carrier_compliance_requirements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    carrierId: varchar("carrier_id").notNull(),
    requirementType: varchar("requirement_type", { length: 40 }).notNull(),
    requiredValue: varchar("required_value", { length: 255 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_ccr_carrier").on(t.carrierId),
    uniqueIndex("ccr_carrier_type_value_unique").on(
      t.carrierId,
      t.requirementType,
      t.requiredValue,
    ),
  ],
);

export const insertCarrierComplianceRequirementSchema = createInsertSchema(
  carrierComplianceRequirements,
).omit({ id: true, createdAt: true });
export type CarrierComplianceRequirement =
  typeof carrierComplianceRequirements.$inferSelect;

export const CARRIER_COMPLIANCE_REQUIREMENT_TYPES = [
  "aml_training",
  "eo_minimum",
  "state_excluded",
  "background_check",
  "training_module",
] as const;
export type CarrierComplianceRequirementType =
  (typeof CARRIER_COMPLIANCE_REQUIREMENT_TYPES)[number];
