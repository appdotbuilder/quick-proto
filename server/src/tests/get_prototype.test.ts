
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type GetPrototypeInput } from '../schema';
import { getPrototype } from '../handlers/get_prototype';

// Test input
const testInput: GetPrototypeInput = {
  id: 1
};

// Sample prototype data for testing
const samplePrototype = {
  title: 'Test Prototype',
  description: 'A prototype for testing retrieval',
  target_audience: 'Software developers',
  primary_goal: 'Test database operations',
  key_features: 'CRUD operations, validation',
  user_flow: 'Create -> Read -> Update -> Delete',
  success_metrics: 'All operations complete successfully',
  generated_ui_config: JSON.stringify({
    layout: 'single-column',
    theme: 'minimal',
    primary_color: '#007bff',
    components: [],
    interactions: []
  })
};

describe('getPrototype', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should retrieve an existing prototype', async () => {
    // Create a prototype first
    const insertResult = await db.insert(prototypesTable)
      .values(samplePrototype)
      .returning()
      .execute();

    const createdPrototype = insertResult[0];

    // Retrieve the prototype
    const result = await getPrototype({ id: createdPrototype.id });

    expect(result).not.toBeNull();
    expect(result!.id).toBe(createdPrototype.id);
    expect(result!.title).toBe('Test Prototype');
    expect(result!.description).toBe('A prototype for testing retrieval');
    expect(result!.target_audience).toBe('Software developers');
    expect(result!.primary_goal).toBe('Test database operations');
    expect(result!.key_features).toBe('CRUD operations, validation');
    expect(result!.user_flow).toBe('Create -> Read -> Update -> Delete');
    expect(result!.success_metrics).toBe('All operations complete successfully');
    expect(result!.generated_ui_config).toBe(samplePrototype.generated_ui_config);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent prototype', async () => {
    const result = await getPrototype({ id: 999 });

    expect(result).toBeNull();
  });

  it('should handle prototype with null description', async () => {
    // Create a prototype with null description
    const prototypeWithNullDesc = {
      ...samplePrototype,
      description: null
    };

    const insertResult = await db.insert(prototypesTable)
      .values(prototypeWithNullDesc)
      .returning()
      .execute();

    const createdPrototype = insertResult[0];

    // Retrieve the prototype
    const result = await getPrototype({ id: createdPrototype.id });

    expect(result).not.toBeNull();
    expect(result!.description).toBeNull();
    expect(result!.title).toBe('Test Prototype');
  });

  it('should retrieve prototype with valid JSON config', async () => {
    const insertResult = await db.insert(prototypesTable)
      .values(samplePrototype)
      .returning()
      .execute();

    const createdPrototype = insertResult[0];
    const result = await getPrototype({ id: createdPrototype.id });

    expect(result).not.toBeNull();
    
    // Verify the JSON config can be parsed
    const parsedConfig = JSON.parse(result!.generated_ui_config);
    expect(parsedConfig.layout).toBe('single-column');
    expect(parsedConfig.theme).toBe('minimal');
    expect(parsedConfig.primary_color).toBe('#007bff');
    expect(Array.isArray(parsedConfig.components)).toBe(true);
    expect(Array.isArray(parsedConfig.interactions)).toBe(true);
  });
});
