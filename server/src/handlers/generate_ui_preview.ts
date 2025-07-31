
import { type UIPreviewRequest, type UIConfig, uiConfigSchema } from '../schema';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Generates UI preview by fetching the prototype's generated UI config
 * and returning it as a properly parsed UIConfig object for frontend consumption
 */
export const generateUIPreview = async (input: UIPreviewRequest): Promise<UIConfig | null> => {
  try {
    // Fetch the prototype from database
    const results = await db
      .select({ generated_ui_config: prototypesTable.generated_ui_config })
      .from(prototypesTable)
      .where(eq(prototypesTable.id, input.prototype_id))
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    const prototype = results[0];

    // Parse and validate the stored UI config
    const parsedConfig = uiConfigSchema.parse(prototype.generated_ui_config);
    return parsedConfig;
  } catch (error) {
    console.error('UI preview generation failed:', error);
    throw error;
  }
};
