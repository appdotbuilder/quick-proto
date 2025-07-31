
import { z } from 'zod';

// Prototype schema
export const prototypeSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  target_audience: z.string(),
  primary_goal: z.string(),
  key_features: z.string(),
  user_flow: z.string(),
  success_metrics: z.string(),
  generated_ui_config: z.string(), // JSON string containing UI configuration
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Prototype = z.infer<typeof prototypeSchema>;

// Input schema for creating prototypes
export const createPrototypeInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  target_audience: z.string().min(1, "Target audience is required"),
  primary_goal: z.string().min(1, "Primary goal is required"),
  key_features: z.string().min(1, "Key features are required"),
  user_flow: z.string().min(1, "User flow is required"),
  success_metrics: z.string().min(1, "Success metrics are required")
});

export type CreatePrototypeInput = z.infer<typeof createPrototypeInputSchema>;

// Input schema for updating prototypes
export const updatePrototypeInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  target_audience: z.string().min(1).optional(),
  primary_goal: z.string().min(1).optional(),
  key_features: z.string().min(1).optional(),
  user_flow: z.string().min(1).optional(),
  success_metrics: z.string().min(1).optional(),
  generated_ui_config: z.string().optional()
});

export type UpdatePrototypeInput = z.infer<typeof updatePrototypeInputSchema>;

// UI Component schema for generated interfaces
export const uiComponentSchema = z.object({
  id: z.string(),
  type: z.enum(['button', 'input', 'text', 'container', 'form']),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  action: z.string().optional(),
  styles: z.record(z.string()).optional(),
  children: z.array(z.string()).optional() // Array of child component IDs
});

export type UIComponent = z.infer<typeof uiComponentSchema>;

// Generated UI Configuration schema
export const uiConfigSchema = z.object({
  layout: z.enum(['single-column', 'two-column', 'grid']),
  theme: z.enum(['minimal', 'modern', 'classic']),
  primary_color: z.string(),
  components: z.array(uiComponentSchema),
  interactions: z.array(z.object({
    trigger: z.string(), // Component ID that triggers the interaction
    action: z.string(), // Type of action (navigate, submit, toggle, etc.)
    target: z.string().optional() // Target component or page
  }))
});

export type UIConfig = z.infer<typeof uiConfigSchema>;

// Get prototype by ID input
export const getPrototypeInputSchema = z.object({
  id: z.number()
});

export type GetPrototypeInput = z.infer<typeof getPrototypeInputSchema>;

// Delete prototype input
export const deletePrototypeInputSchema = z.object({
  id: z.number()
});

export type DeletePrototypeInput = z.infer<typeof deletePrototypeInputSchema>;
