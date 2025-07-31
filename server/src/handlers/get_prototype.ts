
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type GetPrototypeInput, type Prototype } from '../schema';
import { eq } from 'drizzle-orm';

/**
 * Retrieves a specific prototype by ID.
 * Returns the prototype with its generated UI configuration for viewing or editing.
 */
export async function getPrototype(input: GetPrototypeInput): Promise<Prototype | null> {
  try {
    const result = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, input.id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    const prototype = result[0];
    return {
      ...prototype,
      // Ensure dates are properly converted
      created_at: new Date(prototype.created_at),
      updated_at: new Date(prototype.updated_at)
    };
  } catch (error) {
    console.error('Failed to retrieve prototype:', error);
    throw error;
  }
}
