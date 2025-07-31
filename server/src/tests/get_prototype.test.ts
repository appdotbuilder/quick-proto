
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { getPrototype } from '../handlers/get_prototype';
import { type UIConfig } from '../schema';

// Test data matching the five questions approach
const testUIConfig: UIConfig = {
  layout: 'single-column',
  theme: 'minimal',
  primary_color: '#2563eb',
  components: [
    {
      id: 'heading-1',
      type: 'heading',
      content: 'Simple Task Manager'
    },
    {
      id: 'text-1',
      type: 'text',
      content: 'Organize your daily tasks with clarity and focus.'
    },
    {
      id: 'button-1',
      type: 'button',
      label: 'Start Managing Tasks',
      action: 'navigate_to_dashboard'
    }
  ]
};

const testPrototypeData = {
  problem_or_goal_answer: 'Need a simple way to track daily tasks without complexity',
  content_elements_answer: 'Task names, due dates, and completion status',
  call_to_action_answer: 'Start Managing Tasks',
  visual_elements_answer: 'Clean checkboxes and simple progress indicators',
  atmosphere_answer: 'Clean, focused, and distraction-free like 37signals products',
  generated_ui_config: testUIConfig
};

describe('getPrototype', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should retrieve a prototype by id', async () => {
    // Create test prototype
    const [insertedPrototype] = await db
      .insert(prototypesTable)
      .values(testPrototypeData)
      .returning()
      .execute();

    const result = await getPrototype(insertedPrototype.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(insertedPrototype.id);
    expect(result!.problem_or_goal_answer).toEqual(testPrototypeData.problem_or_goal_answer);
    expect(result!.content_elements_answer).toEqual(testPrototypeData.content_elements_answer);
    expect(result!.call_to_action_answer).toEqual(testPrototypeData.call_to_action_answer);
    expect(result!.visual_elements_answer).toEqual(testPrototypeData.visual_elements_answer);
    expect(result!.atmosphere_answer).toEqual(testPrototypeData.atmosphere_answer);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should parse UI config correctly', async () => {
    // Create test prototype
    const [insertedPrototype] = await db
      .insert(prototypesTable)
      .values(testPrototypeData)
      .returning()
      .execute();

    const result = await getPrototype(insertedPrototype.id);

    expect(result).not.toBeNull();
    expect(result!.generated_ui_config).toEqual(testUIConfig);
    expect(result!.generated_ui_config.layout).toEqual('single-column');
    expect(result!.generated_ui_config.theme).toEqual('minimal');
    expect(result!.generated_ui_config.primary_color).toEqual('#2563eb');
    expect(result!.generated_ui_config.components).toHaveLength(3);
    
    // Verify component structure
    const heading = result!.generated_ui_config.components[0];
    expect(heading.type).toEqual('heading');
    expect(heading.content).toEqual('Simple Task Manager');
    
    const button = result!.generated_ui_config.components[2];
    expect(button.type).toEqual('button');
    expect(button.label).toEqual('Start Managing Tasks');
    expect(button.action).toEqual('navigate_to_dashboard');
  });

  it('should return null for non-existent prototype', async () => {
    const result = await getPrototype(999);
    expect(result).toBeNull();
  });

  it('should handle invalid UI config gracefully', async () => {
    // Insert prototype with invalid UI config
    const invalidUIConfig = {
      layout: 'invalid-layout', // Invalid enum value
      theme: 'minimal',
      primary_color: '#2563eb',
      components: []
    };

    const [insertedPrototype] = await db
      .insert(prototypesTable)
      .values({
        ...testPrototypeData,
        generated_ui_config: invalidUIConfig
      })
      .returning()
      .execute();

    // Should throw validation error due to invalid UI config
    expect(async () => {
      await getPrototype(insertedPrototype.id);
    }).toThrow();
  });

  it('should handle complex UI config with all component types', async () => {
    const complexUIConfig: UIConfig = {
      layout: 'two-column',
      theme: 'modern',
      primary_color: '#10b981',
      components: [
        {
          id: 'heading-1',
          type: 'heading',
          content: 'Complex App'
        },
        {
          id: 'input-1',
          type: 'input',
          label: 'Email Address',
          placeholder: 'Enter your email'
        },
        {
          id: 'image-1',
          type: 'image',
          content: 'hero-image.jpg',
          styles: { width: '100%', height: '300px' }
        },
        {
          id: 'list-1',
          type: 'list',
          items: ['Feature 1', 'Feature 2', 'Feature 3']
        }
      ]
    };

    const [insertedPrototype] = await db
      .insert(prototypesTable)
      .values({
        ...testPrototypeData,
        generated_ui_config: complexUIConfig
      })
      .returning()
      .execute();

    const result = await getPrototype(insertedPrototype.id);

    expect(result).not.toBeNull();
    expect(result!.generated_ui_config).toEqual(complexUIConfig);
    expect(result!.generated_ui_config.components).toHaveLength(4);
    
    // Verify input component
    const input = result!.generated_ui_config.components[1];
    expect(input.type).toEqual('input');
    expect(input.label).toEqual('Email Address');
    expect(input.placeholder).toEqual('Enter your email');
    
    // Verify list component
    const list = result!.generated_ui_config.components[3];
    expect(list.type).toEqual('list');
    expect(list.items).toEqual(['Feature 1', 'Feature 2', 'Feature 3']);
  });
});
