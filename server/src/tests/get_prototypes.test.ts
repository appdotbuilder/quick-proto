
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { getPrototypes } from '../handlers/get_prototypes';

describe('getPrototypes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no prototypes exist', async () => {
    const result = await getPrototypes();
    
    expect(result).toEqual([]);
  });

  it('should return all prototypes from database', async () => {
    // Create test prototypes
    await db.insert(prototypesTable).values([
      {
        title: 'E-commerce App',
        description: 'Online shopping platform',
        target_audience: 'Young adults',
        primary_goal: 'Increase sales',
        key_features: 'Product catalog, cart, checkout',
        user_flow: 'Browse -> Add to cart -> Checkout',
        success_metrics: 'Conversion rate > 3%',
        generated_ui_config: '{"layout":"grid","theme":"modern","components":[]}'
      },
      {
        title: 'Task Manager',
        description: null, // Test nullable field
        target_audience: 'Remote workers',
        primary_goal: 'Improve productivity',
        key_features: 'Task lists, reminders, collaboration',
        user_flow: 'Create task -> Assign -> Complete',
        success_metrics: 'Task completion rate > 80%',
        generated_ui_config: '{"layout":"single-column","theme":"minimal","components":[]}'
      }
    ]).execute();

    const result = await getPrototypes();

    expect(result).toHaveLength(2);
    
    // Check first prototype
    expect(result[0].title).toEqual('E-commerce App');
    expect(result[0].description).toEqual('Online shopping platform');
    expect(result[0].target_audience).toEqual('Young adults');
    expect(result[0].primary_goal).toEqual('Increase sales');
    expect(result[0].key_features).toEqual('Product catalog, cart, checkout');
    expect(result[0].user_flow).toEqual('Browse -> Add to cart -> Checkout');
    expect(result[0].success_metrics).toEqual('Conversion rate > 3%');
    expect(result[0].generated_ui_config).toEqual('{"layout":"grid","theme":"modern","components":[]}');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Check second prototype
    expect(result[1].title).toEqual('Task Manager');
    expect(result[1].description).toBeNull();
    expect(result[1].target_audience).toEqual('Remote workers');
    expect(result[1].primary_goal).toEqual('Improve productivity');
    expect(result[1].key_features).toEqual('Task lists, reminders, collaboration');
    expect(result[1].user_flow).toEqual('Create task -> Assign -> Complete');
    expect(result[1].success_metrics).toEqual('Task completion rate > 80%');
    expect(result[1].generated_ui_config).toEqual('{"layout":"single-column","theme":"minimal","components":[]}');
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[1].updated_at).toBeInstanceOf(Date);
  });

  it('should return prototypes in database insertion order', async () => {
    // Create prototypes in specific order
    await db.insert(prototypesTable).values({
      title: 'First Prototype',
      description: 'Created first',
      target_audience: 'Developers',
      primary_goal: 'Test ordering',
      key_features: 'Basic features',
      user_flow: 'Simple flow',
      success_metrics: 'Basic metrics',
      generated_ui_config: '{"layout":"single-column","theme":"minimal","components":[]}'
    }).execute();

    await db.insert(prototypesTable).values({
      title: 'Second Prototype',
      description: 'Created second',
      target_audience: 'Users',
      primary_goal: 'Test ordering',
      key_features: 'Advanced features',
      user_flow: 'Complex flow',
      success_metrics: 'Advanced metrics',
      generated_ui_config: '{"layout":"grid","theme":"modern","components":[]}'
    }).execute();

    const result = await getPrototypes();

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('First Prototype');
    expect(result[1].title).toEqual('Second Prototype');
    
    // Verify timestamps reflect insertion order
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });
});
