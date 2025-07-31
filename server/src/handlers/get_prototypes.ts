
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type Prototype } from '../schema';

/**
 * Retrieves all prototypes from the database.
 * Returns a list of all created prototype configurations.
 */
export async function getPrototypes(): Promise<Prototype[]> {
  try {
    const results = await db.select()
      .from(prototypesTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to retrieve prototypes:', error);
    throw error;
  }
}
