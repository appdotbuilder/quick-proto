
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type GetPrototypeInput, type UIConfig, uiConfigSchema } from '../schema';
import { eq } from 'drizzle-orm';

/**
 * Generates a live preview of the prototype UI based on the stored configuration.
 * Returns structured data that can be rendered on the frontend.
 */
export async function generateUIPreview(input: GetPrototypeInput): Promise<UIConfig> {
  try {
    // Fetch the prototype by ID
    const results = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, input.id))
      .execute();

    if (results.length === 0) {
      throw new Error(`Prototype with ID ${input.id} not found`);
    }

    const prototype = results[0];

    // Parse the generated_ui_config JSON
    let uiConfig: UIConfig;
    try {
      const parsedConfig = JSON.parse(prototype.generated_ui_config);
      uiConfig = uiConfigSchema.parse(parsedConfig);
    } catch (parseError) {
      console.error('Failed to parse UI config:', parseError);
      throw new Error('Invalid UI configuration format');
    }

    return uiConfig;
  } catch (error) {
    console.error('UI preview generation failed:', error);
    throw error;
  }
}
