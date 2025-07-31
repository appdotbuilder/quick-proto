
import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const prototypesTable = pgTable('prototypes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'), // Nullable by default
  target_audience: text('target_audience').notNull(),
  primary_goal: text('primary_goal').notNull(),
  key_features: text('key_features').notNull(),
  user_flow: text('user_flow').notNull(),
  success_metrics: text('success_metrics').notNull(),
  generated_ui_config: text('generated_ui_config').notNull(), // JSON string containing UI configuration
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type Prototype = typeof prototypesTable.$inferSelect; // For SELECT operations
export type NewPrototype = typeof prototypesTable.$inferInsert; // For INSERT operations

// Export all tables for proper query building
export const tables = { prototypes: prototypesTable };
