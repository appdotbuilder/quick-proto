
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type UIPreviewRequest, type UIConfig } from '../schema';
import { generateUIPreview } from '../handlers/generate_ui_preview';

// Test UI config matching the schema structure
const testUIConfig: UIConfig = {
  layout: 'single-column',
  theme: 'minimal',
  primary_color: '#2563eb',
  components: [
    {
      id: 'heading-1',
      type: 'heading',
      content: 'Welcome to Our App'
    },
    {
      id: 'text-1',
      type: 'text',
      content: 'This is a simple landing page'
    },
    {
      id: 'button-1',
      type: 'button',
      label: 'Get Started',
      action: 'navigate'
    }
  ]
};

// Test input for UI preview request
const testInput: UIPreviewRequest = {
  prototype_id: 1
};

describe('generateUIPreview', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return UI config for existing prototype', async () => {
    // Create test prototype with UI config
    await db.insert(prototypesTable)
      .values({
        problem_or_goal_answer: 'Test problem',
        content_elements_answer: 'Test content',
        call_to_action_answer: 'Test action',
        visual_elements_answer: 'Test visuals',
        atmosphere_answer: 'Test atmosphere',
        generated_ui_config: testUIConfig
      })
      .execute();

    const result = await generateUIPreview(testInput);

    expect(result).not.toBeNull();
    expect(result?.layout).toEqual('single-column');
    expect(result?.theme).toEqual('minimal');
    expect(result?.primary_color).toEqual('#2563eb');
    expect(result?.components).toHaveLength(3);
    expect(result?.components[0].type).toEqual('heading');
    expect(result?.components[0].content).toEqual('Welcome to Our App');
    expect(result?.components[2].type).toEqual('button');
    expect(result?.components[2].label).toEqual('Get Started');
  });

  it('should return null for non-existent prototype', async () => {
    const result = await generateUIPreview({ prototype_id: 999 });

    expect(result).toBeNull();
  });

  it('should validate UI config structure', async () => {
    // Create prototype with valid UI config
    await db.insert(prototypesTable)
      .values({
        problem_or_goal_answer: 'Test problem',
        content_elements_answer: 'Test content',
        call_to_action_answer: 'Test action',
        visual_elements_answer: 'Test visuals',
        atmosphere_answer: 'Test atmosphere',
        generated_ui_config: {
          layout: 'two-column',
          theme: 'modern',
          primary_color: '#10b981',
          components: [
            {
              id: 'input-1',
              type: 'input',
              label: 'Email',
              placeholder: 'Enter your email'
            },
            {
              id: 'list-1',
              type: 'list',
              items: ['Item 1', 'Item 2', 'Item 3']
            }
          ]
        }
      })
      .execute();

    const result = await generateUIPreview(testInput);

    expect(result).not.toBeNull();
    expect(result?.layout).toEqual('two-column');
    expect(result?.theme).toEqual('modern');
    expect(result?.primary_color).toEqual('#10b981');
    expect(result?.components).toHaveLength(2);
    expect(result?.components[0].type).toEqual('input');
    expect(result?.components[0].label).toEqual('Email');
    expect(result?.components[0].placeholder).toEqual('Enter your email');
    expect(result?.components[1].type).toEqual('list');
    expect(result?.components[1].items).toEqual(['Item 1', 'Item 2', 'Item 3']);
  });

  it('should handle complex UI configurations', async () => {
    const complexUIConfig: UIConfig = {
      layout: 'centered',
      theme: 'classic',
      primary_color: '#7c3aed',
      components: [
        {
          id: 'heading-main',
          type: 'heading',
          content: 'Complex Interface',
          styles: { fontSize: '2rem', fontWeight: 'bold' }
        },
        {
          id: 'image-hero',
          type: 'image',
          content: 'hero-image.jpg',
          styles: { width: '100%', maxHeight: '400px' }
        },
        {
          id: 'text-description',
          type: 'text',
          content: 'Detailed description of our service'
        },
        {
          id: 'button-primary',
          type: 'button',
          label: 'Start Free Trial',
          action: 'signup',
          styles: { backgroundColor: '#7c3aed', color: 'white' }
        }
      ]
    };

    await db.insert(prototypesTable)
      .values({
        problem_or_goal_answer: 'Complex problem',
        content_elements_answer: 'Rich content',
        call_to_action_answer: 'Start Free Trial',
        visual_elements_answer: 'Hero image and styled elements',
        atmosphere_answer: 'Professional and engaging',
        generated_ui_config: complexUIConfig
      })
      .execute();

    const result = await generateUIPreview(testInput);

    expect(result).not.toBeNull();
    expect(result?.layout).toEqual('centered');
    expect(result?.theme).toEqual('classic');
    expect(result?.components).toHaveLength(4);
    expect(result?.components[1].type).toEqual('image');
    expect(result?.components[1].content).toEqual('hero-image.jpg');
    expect(result?.components[0].styles).toEqual({ fontSize: '2rem', fontWeight: 'bold' });
    expect(result?.components[3].action).toEqual('signup');
  });
});
