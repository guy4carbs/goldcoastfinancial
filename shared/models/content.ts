import { sql } from "drizzle-orm";
import { boolean, index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// BLOG POSTS
// ============================================

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 500 }).notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(), // HTML from rich text editor
    category: varchar("category", { length: 100 }).notNull(),
    author: varchar("author", { length: 255 }).notNull().default("Heritage Team"),
    featuredImage: text("featured_image"),
    readTimeMinutes: integer("read_time_minutes").default(5),
    isFeatured: boolean("is_featured").default(false),

    // Publishing workflow
    status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, scheduled, published, archived
    publishedAt: timestamp("published_at"),
    scheduledAt: timestamp("scheduled_at"),

    // SEO metadata
    metaTitle: varchar("meta_title", { length: 70 }),
    metaDescription: varchar("meta_description", { length: 160 }),
    metaKeywords: text("meta_keywords"),
    ogImage: text("og_image"),

    // Tracking
    viewCount: integer("view_count").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("idx_blog_posts_status").on(table.status),
    index("idx_blog_posts_category").on(table.category),
    index("idx_blog_posts_published_at").on(table.publishedAt),
  ]
);

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

// ============================================
// FAQS
// ============================================

export const faqs = pgTable(
  "faqs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    question: text("question").notNull(),
    answer: text("answer").notNull(), // HTML content
    category: varchar("category", { length: 100 }).notNull(),
    sortOrder: integer("sort_order").default(0),
    slug: varchar("slug", { length: 255 }).unique(), // For deep linking

    // Publishing
    status: varchar("status", { length: 50 }).notNull().default("draft"),
    publishedAt: timestamp("published_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("idx_faqs_category").on(table.category),
    index("idx_faqs_status").on(table.status),
    index("idx_faqs_sort_order").on(table.sortOrder),
  ]
);

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = z.infer<typeof insertFaqSchema>;

// ============================================
// PAGES (Static Page Content)
// ============================================

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(), // e.g., "about-hero", "contact-intro"
    title: varchar("title", { length: 500 }).notNull(),
    content: text("content").notNull(), // HTML content
    pageType: varchar("page_type", { length: 100 }).notNull(), // hero, section, full-page
    parentPage: varchar("parent_page", { length: 100 }), // e.g., "about", "contact"

    // Publishing
    status: varchar("status", { length: 50 }).notNull().default("draft"),
    publishedAt: timestamp("published_at"),

    // SEO
    metaTitle: varchar("meta_title", { length: 70 }),
    metaDescription: varchar("meta_description", { length: 160 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("idx_pages_slug").on(table.slug),
    index("idx_pages_parent").on(table.parentPage),
    index("idx_pages_status").on(table.status),
  ]
);

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;

// ============================================
// CONTENT REVISIONS (Version History)
// ============================================

export const contentRevisions = pgTable(
  "content_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentType: varchar("content_type", { length: 50 }).notNull(), // blog_post, faq, page
    contentId: uuid("content_id").notNull(),
    revisionNumber: integer("revision_number").notNull(),

    // Snapshot of content at this revision
    title: varchar("title", { length: 500 }),
    content: text("content").notNull(),
    metadata: text("metadata"), // JSON string of other fields

    // Change tracking
    changeDescription: text("change_description"),
    changedBy: uuid("changed_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_revisions_content").on(table.contentType, table.contentId),
    index("idx_revisions_created").on(table.createdAt),
  ]
);

export const insertContentRevisionSchema = createInsertSchema(contentRevisions).omit({
  id: true,
  createdAt: true,
});

export type ContentRevision = typeof contentRevisions.$inferSelect;
export type InsertContentRevision = z.infer<typeof insertContentRevisionSchema>;

// ============================================
// CONTENT STATUS ENUM
// ============================================

export const ContentStatus = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type ContentStatusType = typeof ContentStatus[keyof typeof ContentStatus];

// ============================================
// BLOG CATEGORIES
// ============================================

export const BlogCategories = {
  TERM: "term",
  WHOLE: "whole",
  RETIREMENT: "retirement",
  FAMILY: "family",
  SAVINGS: "savings",
  NEWS: "news",
} as const;

export type BlogCategoryType = typeof BlogCategories[keyof typeof BlogCategories];

// ============================================
// FAQ CATEGORIES
// ============================================

export const FaqCategories = {
  BASICS: "basics",
  TYPES: "types",
  COST: "cost",
  COVERAGE: "coverage",
  HEALTH: "health",
  PROCESS: "process",
  BENEFICIARIES: "beneficiaries",
  CLAIMS: "claims",
} as const;

export type FaqCategoryType = typeof FaqCategories[keyof typeof FaqCategories];
