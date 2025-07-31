
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { type UpdatePrototypeInput, type CreatePrototypeInput } from '../schema';
import { updatePrototype } from '../handlers/update_prototype';
import { eq } from 'drizzle-orm';

// Test input for creating initial prototype
const createTestInput: CreatePrototypeInput = {
  problem_or_goal_answer: 'El problema principal es gestionar tareas de manera eficiente',
  content_elements_answer: 'Necesito mostrar una lista de tareas pendientes',
  call_to_action_answer: 'El usuario debe poder agregar nueva tarea',
  visual_elements_answer: 'Un icono de check para completar tareas',
  atmosphere_answer: 'Interfaz limpia y profesional con colores azules'
};

// Test input for updates
const updateTestInput: UpdatePrototypeInput = {
  id: 1,
  problem_or_goal_answer: 'El problema principal es organizar proyectos complejos',
  call_to_action_answer: 'Crear nuevo proyecto'
};

describe('updatePrototype', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update prototype fields', async () => {
    // Create initial prototype
    const [created] = await db.insert(prototypesTable)
      .values({
        ...createTestInput,
        generated_ui_config: {
          layout: 'single-column',
          theme: 'minimal',
          primary_color: '#007bff',
          components: []
        }
      })
      .returning();

    // Update the prototype
    const result = await updatePrototype({
      id: created.id,
      problem_or_goal_answer: 'Updated problem statement',
      content_elements_answer: 'Updated content elements'
    });

    expect(result).not.toBeNull();
    expect(result!.problem_or_goal_answer).toEqual('Updated problem statement');
    expect(result!.content_elements_answer).toEqual('Updated content elements');
    expect(result!.call_to_action_answer).toEqual(createTestInput.call_to_action_answer); // unchanged
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should regenerate UI config when answers are updated', async () => {
    // Create initial prototype
    const [created] = await db.insert(prototypesTable)
      .values({
        ...createTestInput,
        generated_ui_config: {
          layout: 'single-column',
          theme: 'minimal',
          primary_color: '#007bff',
          components: [
            {
              id: 'old-heading',
              type: 'heading',
              content: 'Old Title'
            }
          ]
        }
      })
      .returning();

    // Update with new problem answer
    const result = await updatePrototype({
      id: created.id,
      problem_or_goal_answer: 'Crear una plataforma de gestión de proyectos'
    });

    expect(result).not.toBeNull();
    expect(result!.generated_ui_config).toBeDefined();
    expect(result!.generated_ui_config.components).toBeDefined();
    
    // Should have regenerated UI with new heading
    const headingComponent = result!.generated_ui_config.components.find(c => c.type === 'heading');
    expect(headingComponent).toBeDefined();
    expect(headingComponent!.content).not.toEqual('Old Title');
  });

  it('should not regenerate UI config when no answers are updated', async () => {
    // Create initial prototype with specific UI config
    const originalUIConfig = {
      layout: 'single-column' as const,
      theme: 'minimal' as const,
      primary_color: '#007bff',
      components: [
        {
          id: 'original-heading',
          type: 'heading' as const,
          content: 'Original Title'
        }
      ]
    };

    const [created] = await db.insert(prototypesTable)
      .values({
        ...createTestInput,
        generated_ui_config: originalUIConfig
      })
      .returning();

    // Update without changing any answers (only updating timestamps internally)
    const result = await updatePrototype({
      id: created.id
    });

    expect(result).not.toBeNull();
    expect(result!.generated_ui_config.components[0].content).toEqual('Original Title');
  });

  it('should return null for non-existent prototype', async () => {
    const result = await updatePrototype({
      id: 99999,
      problem_or_goal_answer: 'Updated answer'
    });

    expect(result).toBeNull();
  });

  it('should save updated prototype to database', async () => {
    // Create initial prototype
    const [created] = await db.insert(prototypesTable)
      .values({
        ...createTestInput,
        generated_ui_config: {
          layout: 'single-column',
          theme: 'minimal',
          primary_color: '#007bff',
          components: []
        }
      })
      .returning();

    // Update the prototype
    await updatePrototype({
      id: created.id,
      visual_elements_answer: 'Nuevos elementos visuales con gráficos'
    });

    // Verify changes in database
    const [updated] = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, created.id))
      .execute();

    expect(updated.visual_elements_answer).toEqual('Nuevos elementos visuales con gráficos');
    expect(updated.problem_or_goal_answer).toEqual(createTestInput.problem_or_goal_answer); // unchanged
    expect(updated.updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
  });

  it('should handle partial updates correctly', async () => {
    // Create initial prototype
    const [created] = await db.insert(prototypesTable)
      .values({
        ...createTestInput,
        generated_ui_config: {
          layout: 'single-column',
          theme: 'minimal',
          primary_color: '#007bff',
          components: []
        }
      })
      .returning();

    // Update only one field
    const result = await updatePrototype({
      id: created.id,
      atmosphere_answer: 'Diseño moderno con colores verdes y elementos naturales'
    });

    expect(result).not.toBeNull();
    expect(result!.atmosphere_answer).toEqual('Diseño moderno con colores verdes y elementos naturales');
    expect(result!.problem_or_goal_answer).toEqual(createTestInput.problem_or_goal_answer);
    expect(result!.content_elements_answer).toEqual(createTestInput.content_elements_answer);
    expect(result!.call_to_action_answer).toEqual(createTestInput.call_to_action_answer);
    expect(result!.visual_elements_answer).toEqual(createTestInput.visual_elements_answer);
    
    // Should regenerate UI config with new primary color
    expect(result!.generated_ui_config.primary_color).toEqual('#28a745'); // green color
  });

  it('should generate appropriate UI components based on updated answers', async () => {
    // Create initial prototype
    const [created] = await db.insert(prototypesTable)
      .values({
        ...createTestInput,
        generated_ui_config: {
          layout: 'single-column',
          theme: 'minimal',
          primary_color: '#007bff',
          components: []
        }
      })
      .returning();

    // Update with answers that should generate specific components
    const result = await updatePrototype({
      id: created.id,
      content_elements_answer: 'Necesito un formulario para capturar datos del usuario y una lista de opciones',
      visual_elements_answer: 'Una imagen destacada para mostrar el producto',
      call_to_action_answer: 'Registrarse ahora'
    });

    expect(result).not.toBeNull();
    
    const components = result!.generated_ui_config.components;
    
    // Should have heading
    expect(components.some(c => c.type === 'heading')).toBe(true);
    
    // Should have input field (from formulario mention)
    expect(components.some(c => c.type === 'input')).toBe(true);
    
    // Should have list (from lista mention)
    expect(components.some(c => c.type === 'list')).toBe(true);
    
    // Should have image (from imagen mention)
    expect(components.some(c => c.type === 'image')).toBe(true);
    
    // Should have button with correct label
    const buttonComponent = components.find(c => c.type === 'button');
    expect(buttonComponent).toBeDefined();
    expect(buttonComponent!.label).toEqual('Registrarse ahora');
  });
});
