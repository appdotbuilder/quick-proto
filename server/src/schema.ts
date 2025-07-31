
import { z } from 'zod';

// UI Component schema for dynamic UI generation
export const uiComponentSchema = z.object({
  id: z.string(),
  type: z.enum(['heading', 'text', 'input', 'button', 'image', 'list']),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  action: z.string().optional(),
  styles: z.record(z.string()).optional(),
  content: z.string().optional(),
  items: z.array(z.string()).optional()
});

export type UIComponent = z.infer<typeof uiComponentSchema>;

// UI Config schema for the generated interface
export const uiConfigSchema = z.object({
  layout: z.enum(['single-column', 'two-column', 'centered']),
  theme: z.enum(['minimal', 'modern', 'classic']),
  primary_color: z.string(),
  components: z.array(uiComponentSchema)
});

export type UIConfig = z.infer<typeof uiConfigSchema>;

// Main prototype schema matching database structure
export const prototypeSchema = z.object({
  id: z.number(),
  problem_or_goal_answer: z.string(),
  content_elements_answer: z.string(),
  call_to_action_answer: z.string(),
  visual_elements_answer: z.string(),
  atmosphere_answer: z.string(),
  generated_ui_config: uiConfigSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Prototype = z.infer<typeof prototypeSchema>;

// Input schema for creating prototypes (based on the five questions)
export const createPrototypeInputSchema = z.object({
  problem_or_goal_answer: z.string().min(1, "Problem or goal answer is required"),
  content_elements_answer: z.string().min(1, "Content elements answer is required"),
  call_to_action_answer: z.string().min(1, "Call to action answer is required"),
  visual_elements_answer: z.string().min(1, "Visual elements answer is required"),
  atmosphere_answer: z.string().min(1, "Atmosphere answer is required")
});

export type CreatePrototypeInput = z.infer<typeof createPrototypeInputSchema>;

// Input schema for updating prototypes
export const updatePrototypeInputSchema = z.object({
  id: z.number(),
  problem_or_goal_answer: z.string().optional(),
  content_elements_answer: z.string().optional(),
  call_to_action_answer: z.string().optional(),
  visual_elements_answer: z.string().optional(),
  atmosphere_answer: z.string().optional()
});

export type UpdatePrototypeInput = z.infer<typeof updatePrototypeInputSchema>;

// Schema for UI preview requests
export const uiPreviewRequestSchema = z.object({
  prototype_id: z.number()
});

export type UIPreviewRequest = z.infer<typeof uiPreviewRequestSchema>;
