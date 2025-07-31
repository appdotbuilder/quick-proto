
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type DeletePrototypeInput, type CreatePrototypeInput } from '../schema';
import { deletePrototype } from '../handlers/delete_prototype';
import { eq } from 'drizzle-orm';

// Test input for creating a prototype to delete
const testPrototypeInput: CreatePrototypeInput = {
  title: 'Test Prototype for Deletion',
  description: 'A prototype created for testing deletion',
  target_audience: 'Developers',
  primary_goal: 'Test deletion functionality',
  key_features: 'Delete button, confirmation dialog',
  user_flow: 'User clicks delete, confirms action, prototype is removed',
  success_metrics: 'Prototype successfully deleted from database'
};

describe('deletePrototype', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing prototype', async () => {
    // First create a prototype
    const createResult = await db.insert(prototypesTable)
      .values({
        ...testPrototypeInput,
        generated_ui_config: '{}' // Default empty JSON config
      })
      .returning()
      .execute();

    const createdPrototype = createResult[0];

    // Verify prototype was created
    const beforeDelete = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, createdPrototype.id))
      .execute();
    
    expect(beforeDelete).toHaveLength(1);

    // Delete the prototype
    const deleteInput: DeletePrototypeInput = { id: createdPrototype.id };
    const result = await deletePrototype(deleteInput);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify prototype was actually deleted from database
    const afterDelete = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, createdPrototype.id))
      .execute();

    expect(afterDelete).toHaveLength(0);
  });

  it('should return success even when prototype does not exist', async () => {
    // Try to delete a non-existent prototype
    const deleteInput: DeletePrototypeInput = { id: 999999 };
    const result = await deletePrototype(deleteInput);

    // Should still return success
    expect(result.success).toBe(true);
  });

  it('should not affect other prototypes when deleting one', async () => {
    // Create two prototypes
    const prototype1 = await db.insert(prototypesTable)
      .values({
        ...testPrototypeInput,
        title: 'Prototype 1',
        generated_ui_config: '{}'
      })
      .returning()
      .execute();

    const prototype2 = await db.insert(prototypesTable)
      .values({
        ...testPrototypeInput,
        title: 'Prototype 2',
        generated_ui_config: '{}'
      })
      .returning()
      .execute();

    // Delete only the first prototype
    const deleteInput: DeletePrototypeInput = { id: prototype1[0].id };
    const result = await deletePrototype(deleteInput);

    expect(result.success).toBe(true);

    // Verify first prototype is deleted
    const deletedPrototype = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, prototype1[0].id))
      .execute();

    expect(deletedPrototype).toHaveLength(0);

    // Verify second prototype still exists
    const remainingPrototype = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, prototype2[0].id))
      .execute();

    expect(remainingPrototype).toHaveLength(1);
    expect(remainingPrototype[0].title).toEqual('Prototype 2');
  });
});
