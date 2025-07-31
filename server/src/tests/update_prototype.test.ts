
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type UpdatePrototypeInput, type CreatePrototypeInput } from '../schema';
import { updatePrototype } from '../handlers/update_prototype';
import { eq } from 'drizzle-orm';

// Helper function to create a test prototype
const createTestPrototype = async () => {
  const testData = {
    title: 'Original Title',
    description: 'Original description',
    target_audience: 'Original audience',
    primary_goal: 'Original goal',
    key_features: 'Original features',
    user_flow: 'Original flow',
    success_metrics: 'Original metrics',
    generated_ui_config: '{"layout":"single-column","theme":"minimal"}'
  };

  const result = await db.insert(prototypesTable)
    .values(testData)
    .returning()
    .execute();

  return result[0];
};

describe('updatePrototype', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of a prototype', async () => {
    const existingPrototype = await createTestPrototype();

    const updateInput: UpdatePrototypeInput = {
      id: existingPrototype.id,
      title: 'Updated Title',
      description: 'Updated description',
      target_audience: 'Updated audience',
      primary_goal: 'Updated goal',
      key_features: 'Updated features',
      user_flow: 'Updated flow',
      success_metrics: 'Updated metrics',
      generated_ui_config: '{"layout":"two-column","theme":"modern"}'
    };

    const result = await updatePrototype(updateInput);

    expect(result.id).toEqual(existingPrototype.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.description).toEqual('Updated description');
    expect(result.target_audience).toEqual('Updated audience');
    expect(result.primary_goal).toEqual('Updated goal');
    expect(result.key_features).toEqual('Updated features');
    expect(result.user_flow).toEqual('Updated flow');
    expect(result.success_metrics).toEqual('Updated metrics');
    expect(result.generated_ui_config).toEqual('{"layout":"two-column","theme":"modern"}');
    expect(result.created_at).toEqual(existingPrototype.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(existingPrototype.updated_at.getTime());
  });

  it('should update only specified fields', async () => {
    const existingPrototype = await createTestPrototype();

    const updateInput: UpdatePrototypeInput = {
      id: existingPrototype.id,
      title: 'Partially Updated Title',
      target_audience: 'Partially Updated Audience'
    };

    const result = await updatePrototype(updateInput);

    expect(result.id).toEqual(existingPrototype.id);
    expect(result.title).toEqual('Partially Updated Title');
    expect(result.target_audience).toEqual('Partially Updated Audience');
    // Other fields should remain unchanged
    expect(result.description).toEqual(existingPrototype.description);
    expect(result.primary_goal).toEqual(existingPrototype.primary_goal);
    expect(result.key_features).toEqual(existingPrototype.key_features);
    expect(result.user_flow).toEqual(existingPrototype.user_flow);
    expect(result.success_metrics).toEqual(existingPrototype.success_metrics);
    expect(result.generated_ui_config).toEqual(existingPrototype.generated_ui_config);
    expect(result.created_at).toEqual(existingPrototype.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(existingPrototype.updated_at.getTime());
  });

  it('should handle nullable description field', async () => {
    const existingPrototype = await createTestPrototype();

    const updateInput: UpdatePrototypeInput = {
      id: existingPrototype.id,
      description: null
    };

    const result = await updatePrototype(updateInput);

    expect(result.description).toBeNull();
    expect(result.title).toEqual(existingPrototype.title); // Other fields unchanged
  });

  it('should save updated prototype to database', async () => {
    const existingPrototype = await createTestPrototype();

    const updateInput: UpdatePrototypeInput = {
      id: existingPrototype.id,
      title: 'Database Updated Title',
      primary_goal: 'Database Updated Goal'
    };

    await updatePrototype(updateInput);

    const prototypes = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, existingPrototype.id))
      .execute();

    expect(prototypes).toHaveLength(1);
    expect(prototypes[0].title).toEqual('Database Updated Title');
    expect(prototypes[0].primary_goal).toEqual('Database Updated Goal');
    expect(prototypes[0].updated_at).toBeInstanceOf(Date);
    expect(prototypes[0].updated_at.getTime()).toBeGreaterThan(existingPrototype.updated_at.getTime());
  });

  it('should throw error for non-existent prototype', async () => {
    const updateInput: UpdatePrototypeInput = {
      id: 999,
      title: 'Non-existent Update'
    };

    await expect(updatePrototype(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should always update the updated_at timestamp', async () => {
    const existingPrototype = await createTestPrototype();

    // Update with minimal change
    const updateInput: UpdatePrototypeInput = {
      id: existingPrototype.id
    };

    const result = await updatePrototype(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(existingPrototype.updated_at.getTime());
  });
});
