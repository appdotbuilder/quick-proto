
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Deletes a prototype by ID and returns success status
 */
export const deletePrototype = async (id: number): Promise<{ success: boolean }> => {
  try {
    const result = await db
      .delete(prototypesTable)
      .where(eq(prototypesTable.id, id))
      .returning({ id: prototypesTable.id })
      .execute();

    return { success: result.length > 0 };
  } catch (error) {
    console.error('Prototype deletion failed:', error);
    throw error;
  }
};
