
import { type Prototype, uiConfigSchema } from '../schema';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Retrieves a single prototype by ID and ensures proper parsing of the UI config
 */
export const getPrototype = async (id: number): Promise<Prototype | null> => {
  try {
    const [prototype] = await db
      .select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, id))
      .limit(1)
      .execute();

    if (!prototype) {
      return null;
    }

    // Parse and validate the UI config from JSONB
    const parsedUIConfig = uiConfigSchema.parse(prototype.generated_ui_config);

    return {
      ...prototype,
      generated_ui_config: parsedUIConfig,
      created_at: prototype.created_at,
      updated_at: prototype.updated_at
    };
  } catch (error) {
    console.error('Failed to retrieve prototype:', error);
    throw error;
  }
};
