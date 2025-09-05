import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const emails = pgTable("emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sender: text("sender").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  sentDate: timestamp("sent_date").notNull(),
  priority: text("priority").notNull(), // 'urgent' | 'normal'
  sentiment: text("sentiment").notNull(), // 'positive' | 'negative' | 'neutral'
  sentimentScore: integer("sentiment_score"), // 1-5 scale
  aiResponse: text("ai_response"),
  responseStatus: text("response_status").default('pending'), // 'pending' | 'generated' | 'sent' | 'failed'
  extractedInfo: text("extracted_info"), // JSON string of extracted information
  processed: timestamp("processed").default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  processed: true,
});

export const updateEmailSchema = createInsertSchema(emails).partial().omit({
  id: true,
  sender: true,
  subject: true,
  body: true,
  sentDate: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type UpdateEmail = z.infer<typeof updateEmailSchema>;

export interface EmailStats {
  totalEmails: number;
  urgentEmails: number;
  resolvedEmails: number;
  pendingEmails: number;
  avgResponseTime: string;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  priorityBreakdown: {
    urgent: number;
    normal: number;
  };
}

export interface ExtractedInfo {
  issueType?: string;
  urgency?: string;
  duration?: string;
  impact?: string;
  contactDetails?: string[];
  keywords?: string[];
}
