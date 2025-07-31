
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type GetPrototypeInput, type UIConfig } from '../schema';
import { generateUIPreview } from '../handlers/generate_ui_preview';

// Test UI configuration
const testUIConfig: UIConfig = {
  layout: 'single-column',
  theme: 'minimal',
  primary_color: '#2563eb',
  components: [
    {
      id: 'header-1',
      type: 'text',
      label: 'Welcome to Test App',
      styles: { fontSize: '24px', fontWeight: 'bold' }
    },
    {
      id: 'form-1',
      type: 'form',
      children: ['input-1', 'button-1']
    },
    {
      id: 'input-1',
      type: 'input',
      placeholder: 'Enter your email',
      label: 'Email'
    },
    {
      id: 'button-1',
      type: 'button',
      label: 'Submit',
      action: 'submit-form'
    }
  ],
  interactions: [
    {
      trigger: 'button-1',
      action: 'submit',
      target: 'form-1'
    }
  ]
};

// Test prototype data
const testPrototype = {
  title: 'Test Prototype',
  description: 'A prototype for testing UI generation',
  target_audience: 'Web developers',
  primary_goal: 'Test UI configuration parsing',
  key_features: 'Form submission, responsive design',
  user_flow: 'User enters email and submits form',
  success_metrics: 'Form completion rate',
  generated_ui_config: JSON.stringify(testUIConfig)
};

describe('generateUIPreview', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should generate UI preview from stored configuration', async () => {
    // Create test prototype
    const insertResult = await db.insert(prototypesTable)
      .values(testPrototype)
      .returning()
      .execute();

    const prototypeId = insertResult[0].id;
    const input: GetPrototypeInput = { id: prototypeId };

    // Generate UI preview
    const result = await generateUIPreview(input);

    // Verify UI configuration structure
    expect(result.layout).toEqual('single-column');
    expect(result.theme).toEqual('minimal');
    expect(result.primary_color).toEqual('#2563eb');
    expect(result.components).toHaveLength(4);
    expect(result.interactions).toHaveLength(1);

    // Verify component details
    const headerComponent = result.components.find(c => c.id === 'header-1');
    expect(headerComponent).toBeDefined();
    expect(headerComponent?.type).toEqual('text');
    expect(headerComponent?.label).toEqual('Welcome to Test App');

    const formComponent = result.components.find(c => c.id === 'form-1');
    expect(formComponent).toBeDefined();
    expect(formComponent?.type).toEqual('form');
    expect(formComponent?.children).toEqual(['input-1', 'button-1']);

    // Verify interactions
    const interaction = result.interactions[0];
    expect(interaction.trigger).toEqual('button-1');
    expect(interaction.action).toEqual('submit');
    expect(interaction.target).toEqual('form-1');
  });

  it('should throw error for non-existent prototype', async () => {
    const input: GetPrototypeInput = { id: 99999 };

    await expect(generateUIPreview(input)).rejects.toThrow(/Prototype with ID 99999 not found/i);
  });

  it('should throw error for invalid JSON configuration', async () => {
    // Create prototype with invalid JSON
    const invalidPrototype = {
      ...testPrototype,
      generated_ui_config: '{ invalid json }'
    };

    const insertResult = await db.insert(prototypesTable)
      .values(invalidPrototype)
      .returning()
      .execute();

    const prototypeId = insertResult[0].id;
    const input: GetPrototypeInput = { id: prototypeId };

    await expect(generateUIPreview(input)).rejects.toThrow(/Invalid UI configuration format/i);
  });

  it('should handle complex UI configurations with multiple interactions', async () => {
    const complexUIConfig: UIConfig = {
      layout: 'two-column',
      theme: 'modern',
      primary_color: '#10b981',
      components: [
        {
          id: 'nav-1',
          type: 'container',
          children: ['button-nav-1', 'button-nav-2']
        },
        {
          id: 'button-nav-1',
          type: 'button',
          label: 'Home',
          action: 'navigate'
        },
        {
          id: 'button-nav-2',
          type: 'button',
          label: 'About',
          action: 'navigate'
        },
        {
          id: 'main-content',
          type: 'text',
          label: 'Main content area'
        }
      ],
      interactions: [
        {
          trigger: 'button-nav-1',
          action: 'navigate',
          target: 'home-page'
        },
        {
          trigger: 'button-nav-2',
          action: 'navigate',
          target: 'about-page'
        }
      ]
    };

    const complexPrototype = {
      ...testPrototype,
      generated_ui_config: JSON.stringify(complexUIConfig)
    };

    const insertResult = await db.insert(prototypesTable)
      .values(complexPrototype)
      .returning()
      .execute();

    const prototypeId = insertResult[0].id;
    const input: GetPrototypeInput = { id: prototypeId };

    const result = await generateUIPreview(input);

    expect(result.layout).toEqual('two-column');
    expect(result.theme).toEqual('modern');
    expect(result.primary_color).toEqual('#10b981');
    expect(result.components).toHaveLength(4);
    expect(result.interactions).toHaveLength(2);

    // Verify navigation container
    const navContainer = result.components.find(c => c.id === 'nav-1');
    expect(navContainer?.type).toEqual('container');
    expect(navContainer?.children).toEqual(['button-nav-1', 'button-nav-2']);

    // Verify all interactions are preserved
    expect(result.interactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          trigger: 'button-nav-1',
          action: 'navigate',
          target: 'home-page'
        }),
        expect.objectContaining({
          trigger: 'button-nav-2',
          action: 'navigate',
          target: 'about-page'
        })
      ])
    );
  });
});
