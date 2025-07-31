
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type DeletePrototypeInput } from '../schema';
import { eq } from 'drizzle-orm';

/**
 * Deletes a prototype from the database.
 * Removes the prototype and all its associated configuration data.
 */
export async function deletePrototype(input: DeletePrototypeInput): Promise<{ success: boolean }> {
  try {
    // Delete the prototype record from the database
    const result = await db.delete(prototypesTable)
      .where(eq(prototypesTable.id, input.id))
      .execute();

    // Return success status - even if no rows were affected (prototype doesn't exist)
    return { success: true };
  } catch (error) {
    console.error('Prototype deletion failed:', error);
    throw error;
  }
}
