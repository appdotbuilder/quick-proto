
import { type Prototype, uiConfigSchema } from '../schema';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { desc } from 'drizzle-orm';

/**
 * Retrieves all prototypes ordered by creation date (newest first)
 */
export const getPrototypes = async (): Promise<Prototype[]> => {
  try {
    const prototypes = await db
      .select()
      .from(prototypesTable)
      .orderBy(desc(prototypesTable.created_at))
      .execute();

    // Parse and validate UI configs for all prototypes
    return prototypes.map(prototype => ({
      ...prototype,
      generated_ui_config: uiConfigSchema.parse(prototype.generated_ui_config),
      created_at: prototype.created_at,
      updated_at: prototype.updated_at
    }));
  } catch (error) {
    console.error('Failed to retrieve prototypes:', error);
    throw error;
  }
};
