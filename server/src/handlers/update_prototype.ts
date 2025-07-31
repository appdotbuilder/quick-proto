
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type UpdatePrototypeInput, type Prototype } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePrototype = async (input: UpdatePrototypeInput): Promise<Prototype> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof prototypesTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.target_audience !== undefined) {
      updateData.target_audience = input.target_audience;
    }
    if (input.primary_goal !== undefined) {
      updateData.primary_goal = input.primary_goal;
    }
    if (input.key_features !== undefined) {
      updateData.key_features = input.key_features;
    }
    if (input.user_flow !== undefined) {
      updateData.user_flow = input.user_flow;
    }
    if (input.success_metrics !== undefined) {
      updateData.success_metrics = input.success_metrics;
    }
    if (input.generated_ui_config !== undefined) {
      updateData.generated_ui_config = input.generated_ui_config;
    }

    // Update the prototype record
    const result = await db.update(prototypesTable)
      .set(updateData)
      .where(eq(prototypesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Prototype with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Prototype update failed:', error);
    throw error;
  }
};
