
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type CreatePrototypeInput, type UIConfig } from '../schema';
import { getPrototypes } from '../handlers/get_prototypes';

// Test data
const testUIConfig: UIConfig = {
  layout: 'single-column',
  theme: 'minimal',
  primary_color: '#007bff',
  components: [
    {
      id: 'header',
      type: 'heading',
      content: 'Test Landing Page'
    },
    {
      id: 'description',
      type: 'text',
      content: 'This is a test description'
    },
    {
      id: 'cta',
      type: 'button',
      label: 'Get Started',
      action: 'submit'
    }
  ]
};

const testPrototype1: CreatePrototypeInput = {
  problem_or_goal_answer: 'Need a simple landing page for product launch',
  content_elements_answer: 'Product description, key features, and pricing',
  call_to_action_answer: 'Sign up for early access',
  visual_elements_answer: 'Clean hero image and feature icons',
  atmosphere_answer: 'Professional yet approachable, similar to Basecamp'
};

const testPrototype2: CreatePrototypeInput = {
  problem_or_goal_answer: 'Create a contact form for customer inquiries',
  content_elements_answer: 'Contact information and inquiry form',
  call_to_action_answer: 'Send message',
  visual_elements_answer: 'Simple form layout with minimal graphics',
  atmosphere_answer: 'Clean and trustworthy design'
};

describe('getPrototypes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no prototypes exist', async () => {
    const result = await getPrototypes();
    expect(result).toEqual([]);
  });

  it('should return all prototypes ordered by creation date (newest first)', async () => {
    // Create first prototype
    const firstPrototype = await db.insert(prototypesTable)
      .values({
        ...testPrototype1,
        generated_ui_config: testUIConfig
      })
      .returning()
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second prototype
    const secondPrototype = await db.insert(prototypesTable)
      .values({
        ...testPrototype2,
        generated_ui_config: testUIConfig
      })
      .returning()
      .execute();

    const result = await getPrototypes();

    expect(result).toHaveLength(2);
    
    // Verify ordering (newest first)
    expect(result[0].id).toEqual(secondPrototype[0].id);
    expect(result[1].id).toEqual(firstPrototype[0].id);
    expect(result[0].created_at.getTime()).toBeGreaterThan(result[1].created_at.getTime());
  });

  it('should parse and validate UI configs correctly', async () => {
    await db.insert(prototypesTable)
      .values({
        ...testPrototype1,
        generated_ui_config: testUIConfig
      })
      .execute();

    const result = await getPrototypes();

    expect(result).toHaveLength(1);
    expect(result[0].generated_ui_config).toBeDefined();
    expect(result[0].generated_ui_config.layout).toEqual('single-column');
    expect(result[0].generated_ui_config.theme).toEqual('minimal');
    expect(result[0].generated_ui_config.primary_color).toEqual('#007bff');
    expect(result[0].generated_ui_config.components).toHaveLength(3);
  });

  it('should include all prototype fields', async () => {
    await db.insert(prototypesTable)
      .values({
        ...testPrototype1,
        generated_ui_config: testUIConfig
      })
      .execute();

    const result = await getPrototypes();

    expect(result).toHaveLength(1);
    const prototype = result[0];

    expect(prototype.id).toBeDefined();
    expect(prototype.problem_or_goal_answer).toEqual(testPrototype1.problem_or_goal_answer);
    expect(prototype.content_elements_answer).toEqual(testPrototype1.content_elements_answer);
    expect(prototype.call_to_action_answer).toEqual(testPrototype1.call_to_action_answer);
    expect(prototype.visual_elements_answer).toEqual(testPrototype1.visual_elements_answer);
    expect(prototype.atmosphere_answer).toEqual(testPrototype1.atmosphere_answer);
    expect(prototype.created_at).toBeInstanceOf(Date);
    expect(prototype.updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple prototypes with different UI configs', async () => {
    const customUIConfig: UIConfig = {
      layout: 'two-column',
      theme: 'modern',
      primary_color: '#28a745',
      components: [
        {
          id: 'title',
          type: 'heading',
          content: 'Contact Us'
        },
        {
          id: 'form',
          type: 'input',
          placeholder: 'Enter your message'
        }
      ]
    };

    // Insert prototypes with different UI configs
    await db.insert(prototypesTable)
      .values({
        ...testPrototype1,
        generated_ui_config: testUIConfig
      })
      .execute();

    await db.insert(prototypesTable)
      .values({
        ...testPrototype2,
        generated_ui_config: customUIConfig
      })
      .execute();

    const result = await getPrototypes();

    expect(result).toHaveLength(2);
    
    // Find prototypes by their problem answers
    const landingPagePrototype = result.find(p => 
      p.problem_or_goal_answer === testPrototype1.problem_or_goal_answer
    );
    const contactFormPrototype = result.find(p => 
      p.problem_or_goal_answer === testPrototype2.problem_or_goal_answer
    );

    expect(landingPagePrototype).toBeDefined();
    expect(contactFormPrototype).toBeDefined();

    expect(landingPagePrototype!.generated_ui_config.theme).toEqual('minimal');
    expect(contactFormPrototype!.generated_ui_config.theme).toEqual('modern');
    expect(landingPagePrototype!.generated_ui_config.layout).toEqual('single-column');
    expect(contactFormPrototype!.generated_ui_config.layout).toEqual('two-column');
  });
});
