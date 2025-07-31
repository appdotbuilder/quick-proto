
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type CreatePrototypeInput } from '../schema';
import { createPrototype } from '../handlers/create_prototype';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreatePrototypeInput = {
  problem_or_goal_answer: 'Necesitamos una aplicación simple para gestionar tareas diarias y aumentar la productividad.',
  content_elements_answer: 'Lista de tareas, descripción del proyecto y formulario para agregar nuevas tareas.',
  call_to_action_answer: 'Comenzar ahora',
  visual_elements_answer: 'Imagen del dashboard principal y iconos para cada categoría de tarea.',
  atmosphere_answer: 'Un ambiente profesional y confiable con colores azules que inspiren tranquilidad.'
};

describe('createPrototype', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a prototype with all required fields', async () => {
    const result = await createPrototype(testInput);

    // Validate basic fields
    expect(result.problem_or_goal_answer).toEqual(testInput.problem_or_goal_answer);
    expect(result.content_elements_answer).toEqual(testInput.content_elements_answer);
    expect(result.call_to_action_answer).toEqual(testInput.call_to_action_answer);
    expect(result.visual_elements_answer).toEqual(testInput.visual_elements_answer);
    expect(result.atmosphere_answer).toEqual(testInput.atmosphere_answer);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should generate UI config based on answers', async () => {
    const result = await createPrototype(testInput);

    // Validate generated UI config structure
    expect(result.generated_ui_config).toBeDefined();
    expect(result.generated_ui_config.layout).toEqual('single-column');
    expect(result.generated_ui_config.theme).toEqual('minimal');
    expect(result.generated_ui_config.primary_color).toBeDefined();
    expect(result.generated_ui_config.components).toBeInstanceOf(Array);
  });

  it('should generate appropriate UI components from content elements', async () => {
    const result = await createPrototype(testInput);
    const components = result.generated_ui_config.components;

    // Should always have a heading
    const heading = components.find(c => c.type === 'heading');
    expect(heading).toBeDefined();
    expect(heading?.content).toBeDefined();

    // Should have a list component because content mentions "lista de tareas"
    const list = components.find(c => c.type === 'list');
    expect(list).toBeDefined();
    expect(list?.items).toBeInstanceOf(Array);

    // Should have an input field because content mentions "formulario"
    const input = components.find(c => c.type === 'input');
    expect(input).toBeDefined();
    expect(input?.placeholder).toBeDefined();

    // Should have an image because visual elements mentions "imagen"
    const image = components.find(c => c.type === 'image');
    expect(image).toBeDefined();

    // Should always have a CTA button
    const button = components.find(c => c.type === 'button');
    expect(button).toBeDefined();
    expect(button?.label).toEqual('Comenzar ahora');
    expect(button?.action).toEqual('primary-action');
  });

  it('should extract primary color from atmosphere answer', async () => {
    const result = await createPrototype(testInput);

    // Should detect blue color from "azules" in atmosphere answer
    expect(result.generated_ui_config.primary_color).toEqual('#2563eb');
  });

  it('should save prototype to database', async () => {
    const result = await createPrototype(testInput);

    // Query database to verify prototype was saved
    const prototypes = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, result.id))
      .execute();

    expect(prototypes).toHaveLength(1);
    const savedPrototype = prototypes[0];
    
    expect(savedPrototype.problem_or_goal_answer).toEqual(testInput.problem_or_goal_answer);
    expect(savedPrototype.content_elements_answer).toEqual(testInput.content_elements_answer);
    expect(savedPrototype.call_to_action_answer).toEqual(testInput.call_to_action_answer);
    expect(savedPrototype.visual_elements_answer).toEqual(testInput.visual_elements_answer);
    expect(savedPrototype.atmosphere_answer).toEqual(testInput.atmosphere_answer);
    expect(savedPrototype.generated_ui_config).toBeDefined();
    expect(savedPrototype.created_at).toBeInstanceOf(Date);
    expect(savedPrototype.updated_at).toBeInstanceOf(Date);
  });

  it('should handle different atmosphere colors correctly', async () => {
    const greenInput: CreatePrototypeInput = {
      ...testInput,
      atmosphere_answer: 'Un ambiente natural y de crecimiento con tonos verdes.'
    };

    const result = await createPrototype(greenInput);
    expect(result.generated_ui_config.primary_color).toEqual('#059669');
  });

  it('should generate meaningful title from problem answer', async () => {
    const shortInput: CreatePrototypeInput = {
      ...testInput,
      problem_or_goal_answer: 'Crear una herramienta de gestión eficiente.'
    };

    const result = await createPrototype(shortInput);
    const headingComponent = result.generated_ui_config.components.find(c => c.type === 'heading');
    
    expect(headingComponent?.content).toEqual('Crear una herramienta de gestión eficiente');
  });

  it('should use default title for very short problem answers', async () => {
    const veryShortInput: CreatePrototypeInput = {
      ...testInput,
      problem_or_goal_answer: 'App'
    };

    const result = await createPrototype(veryShortInput);
    const headingComponent = result.generated_ui_config.components.find(c => c.type === 'heading');
    
    expect(headingComponent?.content).toEqual('Solución Simple y Efectiva');
  });
});
