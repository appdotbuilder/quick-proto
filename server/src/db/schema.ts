
import { serial, text, pgTable, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const prototypesTable = pgTable('prototypes', {
  id: serial('id').primaryKey(),
  problem_or_goal_answer: text('problem_or_goal_answer').notNull(),
  content_elements_answer: text('content_elements_answer').notNull(),
  call_to_action_answer: text('call_to_action_answer').notNull(),
  visual_elements_answer: text('visual_elements_answer').notNull(),
  atmosphere_answer: text('atmosphere_answer').notNull(),
  generated_ui_config: jsonb('generated_ui_config').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schema
export type Prototype = typeof prototypesTable.$inferSelect;
export type NewPrototype = typeof prototypesTable.$inferInsert;

// Export all tables for proper query building
export const tables = { prototypes: prototypesTable };
