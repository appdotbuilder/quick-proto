
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type CreatePrototypeInput, type Prototype, type UIConfig } from '../schema';

/**
 * Creates a new prototype based on user's answers to five key questions.
 * Generates a simple UI configuration based on the provided information.
 * The generated UI emphasizes clarity, simplicity, and efficiency similar to 37 Signals applications.
 */
export async function createPrototype(input: CreatePrototypeInput): Promise<Prototype> {
  try {
    // Generate basic UI configuration based on input
    const generatedUIConfig: UIConfig = {
      layout: 'single-column',
      theme: 'minimal',
      primary_color: '#2563eb', // Simple blue color
      components: [
        {
          id: 'header',
          type: 'text',
          label: input.title,
          styles: { fontSize: '24px', fontWeight: 'bold' }
        },
        {
          id: 'description',
          type: 'text',
          label: input.description || 'Welcome to your prototype',
          styles: { fontSize: '16px', color: '#666' }
        },
        {
          id: 'main-button',
          type: 'button',
          label: 'Get Started',
          action: 'primary-action'
        }
      ],
      interactions: [
        {
          trigger: 'main-button',
          action: 'submit',
          target: 'main-form'
        }
      ]
    };

    // Insert prototype record
    const result = await db.insert(prototypesTable)
      .values({
        title: input.title,
        description: input.description || null,
        target_audience: input.target_audience,
        primary_goal: input.primary_goal,
        key_features: input.key_features,
        user_flow: input.user_flow,
        success_metrics: input.success_metrics,
        generated_ui_config: JSON.stringify(generatedUIConfig)
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Prototype creation failed:', error);
    throw error;
  }
}
