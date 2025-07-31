
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { deletePrototype } from '../handlers/delete_prototype';

// Test data for creating a prototype to delete
const testPrototypeData = {
  problem_or_goal_answer: 'Solve user authentication issues',
  content_elements_answer: 'Login form with email and password fields',
  call_to_action_answer: 'Sign In',
  visual_elements_answer: 'Simple logo at the top',
  atmosphere_answer: 'Clean and professional',
  generated_ui_config: {
    layout: 'single-column' as const,
    theme: 'minimal' as const,
    primary_color: '#007acc',
    components: [
      {
        id: 'title',
        type: 'heading' as const,
        content: 'Sign In'
      }
    ]
  }
};

describe('deletePrototype', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing prototype', async () => {
    // Create a prototype first
    const insertResult = await db.insert(prototypesTable)
      .values(testPrototypeData)
      .returning({ id: prototypesTable.id })
      .execute();
    
    const prototypeId = insertResult[0].id;

    // Delete the prototype
    const result = await deletePrototype(prototypeId);

    // Should return success
    expect(result.success).toBe(true);

    // Verify the prototype no longer exists in the database
    const remainingPrototypes = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, prototypeId))
      .execute();

    expect(remainingPrototypes).toHaveLength(0);
  });

  it('should return false when deleting non-existent prototype', async () => {
    const nonExistentId = 999999;

    const result = await deletePrototype(nonExistentId);

    // Should return failure
    expect(result.success).toBe(false);
  });

  it('should not affect other prototypes when deleting one', async () => {
    // Create two prototypes
    const insertResult1 = await db.insert(prototypesTable)
      .values(testPrototypeData)
      .returning({ id: prototypesTable.id })
      .execute();
    
    const insertResult2 = await db.insert(prototypesTable)
      .values({
        ...testPrototypeData,
        problem_or_goal_answer: 'Different problem'
      })
      .returning({ id: prototypesTable.id })
      .execute();

    const prototypeId1 = insertResult1[0].id;
    const prototypeId2 = insertResult2[0].id;

    // Delete only the first prototype
    const result = await deletePrototype(prototypeId1);

    expect(result.success).toBe(true);

    // Verify first prototype is gone
    const deletedPrototype = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, prototypeId1))
      .execute();

    expect(deletedPrototype).toHaveLength(0);

    // Verify second prototype still exists
    const remainingPrototype = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, prototypeId2))
      .execute();

    expect(remainingPrototype).toHaveLength(1);
    expect(remainingPrototype[0].problem_or_goal_answer).toEqual('Different problem');
  });
});
