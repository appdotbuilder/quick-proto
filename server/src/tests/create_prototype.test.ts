
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type CreatePrototypeInput, type UIConfig } from '../schema';
import { createPrototype } from '../handlers/create_prototype';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreatePrototypeInput = {
  title: 'E-commerce Mobile App',
  description: 'A streamlined shopping experience for mobile users',
  target_audience: 'Busy professionals aged 25-45 who value convenience',
  primary_goal: 'Enable quick product discovery and checkout in under 3 minutes',
  key_features: 'One-tap purchasing, personalized recommendations, saved payment methods',
  user_flow: 'Browse → Select → Quick checkout → Confirmation',
  success_metrics: 'Conversion rate >15%, average checkout time <3 minutes'
};

describe('createPrototype', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a prototype with all fields', async () => {
    const result = await createPrototype(testInput);

    // Basic field validation
    expect(result.title).toEqual('E-commerce Mobile App');
    expect(result.description).toEqual('A streamlined shopping experience for mobile users');
    expect(result.target_audience).toEqual(testInput.target_audience);
    expect(result.primary_goal).toEqual(testInput.primary_goal);
    expect(result.key_features).toEqual(testInput.key_features);
    expect(result.user_flow).toEqual(testInput.user_flow);
    expect(result.success_metrics).toEqual(testInput.success_metrics);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should generate valid UI configuration', async () => {
    const result = await createPrototype(testInput);

    // Parse and validate generated UI config
    const uiConfig: UIConfig = JSON.parse(result.generated_ui_config);
    
    expect(uiConfig.layout).toEqual('single-column');
    expect(uiConfig.theme).toEqual('minimal');
    expect(uiConfig.primary_color).toEqual('#2563eb');
    expect(uiConfig.components).toHaveLength(3);
    expect(uiConfig.interactions).toHaveLength(1);

    // Validate header component
    const headerComponent = uiConfig.components.find(c => c.id === 'header');
    expect(headerComponent).toBeDefined();
    expect(headerComponent?.type).toEqual('text');
    expect(headerComponent?.label).toEqual('E-commerce Mobile App');

    // Validate button component
    const buttonComponent = uiConfig.components.find(c => c.id === 'main-button');
    expect(buttonComponent).toBeDefined();
    expect(buttonComponent?.type).toEqual('button');
    expect(buttonComponent?.label).toEqual('Get Started');
  });

  it('should save prototype to database', async () => {
    const result = await createPrototype(testInput);

    // Query using proper drizzle syntax
    const prototypes = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, result.id))
      .execute();

    expect(prototypes).toHaveLength(1);
    expect(prototypes[0].title).toEqual('E-commerce Mobile App');
    expect(prototypes[0].target_audience).toEqual(testInput.target_audience);
    expect(prototypes[0].created_at).toBeInstanceOf(Date);
    expect(prototypes[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null description', async () => {
    const inputWithoutDescription: CreatePrototypeInput = {
      ...testInput,
      description: null
    };

    const result = await createPrototype(inputWithoutDescription);

    expect(result.description).toBeNull();
    
    // UI config should handle null description gracefully
    const uiConfig: UIConfig = JSON.parse(result.generated_ui_config);
    const descriptionComponent = uiConfig.components.find(c => c.id === 'description');
    expect(descriptionComponent?.label).toEqual('Welcome to your prototype');
  });

  it('should create prototype with minimal required fields', async () => {
    const minimalInput: CreatePrototypeInput = {
      title: 'Minimal App',
      target_audience: 'General users',
      primary_goal: 'Test functionality',
      key_features: 'Basic features',
      user_flow: 'Simple flow',
      success_metrics: 'User satisfaction'
    };

    const result = await createPrototype(minimalInput);

    expect(result.title).toEqual('Minimal App');
    expect(result.description).toBeNull();
    expect(result.target_audience).toEqual('General users');
    expect(result.id).toBeDefined();

    // Verify it was saved to database
    const savedPrototype = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, result.id))
      .execute();

    expect(savedPrototype).toHaveLength(1);
    expect(savedPrototype[0].title).toEqual('Minimal App');
  });
});
