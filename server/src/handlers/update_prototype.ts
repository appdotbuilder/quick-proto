
import { type UpdatePrototypeInput, type Prototype, uiConfigSchema } from '../schema';
import { db } from '../db';
import { prototypesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Updates an existing prototype and regenerates UI config if answers change
 */
export const updatePrototype = async (input: UpdatePrototypeInput): Promise<Prototype | null> => {
  try {
    // Check if prototype exists first
    const existingPrototype = await db.select()
      .from(prototypesTable)
      .where(eq(prototypesTable.id, input.id))
      .execute();

    if (existingPrototype.length === 0) {
      return null;
    }

    const updateData: Partial<typeof prototypesTable.$inferInsert> = {
      updated_at: new Date()
    };

    // Only update provided fields
    if (input.problem_or_goal_answer !== undefined) {
      updateData.problem_or_goal_answer = input.problem_or_goal_answer;
    }
    if (input.content_elements_answer !== undefined) {
      updateData.content_elements_answer = input.content_elements_answer;
    }
    if (input.call_to_action_answer !== undefined) {
      updateData.call_to_action_answer = input.call_to_action_answer;
    }
    if (input.visual_elements_answer !== undefined) {
      updateData.visual_elements_answer = input.visual_elements_answer;
    }
    if (input.atmosphere_answer !== undefined) {
      updateData.atmosphere_answer = input.atmosphere_answer;
    }

    // If any answers were updated, regenerate UI config
    const answersUpdated = 
      input.problem_or_goal_answer !== undefined ||
      input.content_elements_answer !== undefined ||
      input.call_to_action_answer !== undefined ||
      input.visual_elements_answer !== undefined ||
      input.atmosphere_answer !== undefined;

    if (answersUpdated) {
      // Get the current prototype data to merge with updates
      const current = existingPrototype[0];
      const finalAnswers = {
        problem_or_goal_answer: input.problem_or_goal_answer ?? current.problem_or_goal_answer,
        content_elements_answer: input.content_elements_answer ?? current.content_elements_answer,
        call_to_action_answer: input.call_to_action_answer ?? current.call_to_action_answer,
        visual_elements_answer: input.visual_elements_answer ?? current.visual_elements_answer,
        atmosphere_answer: input.atmosphere_answer ?? current.atmosphere_answer
      };

      // Generate new UI config based on updated answers
      updateData.generated_ui_config = generateUIConfig(finalAnswers);
    }

    const [updatedPrototype] = await db
      .update(prototypesTable)
      .set(updateData)
      .where(eq(prototypesTable.id, input.id))
      .returning();

    if (!updatedPrototype) {
      return null;
    }

    // Parse and validate the UI config
    const parsedUIConfig = uiConfigSchema.parse(updatedPrototype.generated_ui_config);

    return {
      ...updatedPrototype,
      generated_ui_config: parsedUIConfig,
      created_at: updatedPrototype.created_at,
      updated_at: updatedPrototype.updated_at
    };
  } catch (error) {
    console.error('Prototype update failed:', error);
    throw error;
  }
};

/**
 * Generates UI configuration based on the five question answers
 */
function generateUIConfig(answers: {
  problem_or_goal_answer: string;
  content_elements_answer: string;
  call_to_action_answer: string;
  visual_elements_answer: string;
  atmosphere_answer: string;
}) {
  const components = [];

  // Generate main heading from problem/goal answer
  const mainTitle = extractMainTitle(answers.problem_or_goal_answer);
  components.push({
    id: 'main-heading',
    type: 'heading' as const,
    content: mainTitle,
    styles: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }
  });

  // Generate content elements based on content answer
  const contentElements = generateContentElements(answers.content_elements_answer);
  components.push(...contentElements);

  // Generate visual elements if mentioned
  if (needsVisualElement(answers.visual_elements_answer)) {
    components.push({
      id: 'visual-element',
      type: 'image' as const,
      content: 'Placeholder for visual element',
      styles: { width: '100%', height: '200px', backgroundColor: '#f5f5f5', marginBottom: '1rem' }
    });
  }

  // Generate call-to-action button
  const ctaText = extractCallToAction(answers.call_to_action_answer);
  components.push({
    id: 'cta-button',
    type: 'button' as const,
    label: ctaText,
    action: 'primary-action',
    styles: { 
      backgroundColor: '#007bff',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      cursor: 'pointer'
    }
  });

  // Determine primary color from atmosphere answer
  const primaryColor = extractPrimaryColor(answers.atmosphere_answer);

  return {
    layout: 'single-column' as const,
    theme: 'minimal' as const,
    primary_color: primaryColor,
    components
  };
}

function extractMainTitle(problemAnswer: string): string {
  // Extract a concise title from the problem/goal answer
  const sentences = problemAnswer.split('.').filter(s => s.trim().length > 0);
  if (sentences.length > 0) {
    // Take first sentence and clean it up as a title
    let title = sentences[0].trim();
    // Remove question words and make it more title-like
    title = title.replace(/^(el problema|la necesidad|necesito|quiero|busco)/i, '');
    title = title.trim();
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
    return title || 'Tu Solución';
  }
  return 'Tu Solución';
}

function generateContentElements(contentAnswer: string): any[] {
  const elements = [];
  const lowerContent = contentAnswer.toLowerCase();

  // Check for different content types mentioned
  if (lowerContent.includes('formulario') || lowerContent.includes('datos') || lowerContent.includes('información del usuario')) {
    elements.push({
      id: 'input-field',
      type: 'input' as const,
      placeholder: 'Ingresa tu información',
      styles: { 
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '1rem'
      }
    });
  }

  if (lowerContent.includes('lista') || lowerContent.includes('opciones') || lowerContent.includes('elementos')) {
    elements.push({
      id: 'content-list',
      type: 'list' as const,
      items: ['Opción 1', 'Opción 2', 'Opción 3'],
      styles: { marginBottom: '1rem' }
    });
  }

  // Always include some descriptive text
  elements.push({
    id: 'description-text',
    type: 'text' as const,
    content: 'Información relevante para tu objetivo.',
    styles: { marginBottom: '1rem', lineHeight: '1.5' }
  });

  return elements;
}

function needsVisualElement(visualAnswer: string): boolean {
  const lowerVisual = visualAnswer.toLowerCase();
  return lowerVisual.includes('imagen') || 
         lowerVisual.includes('gráfico') || 
         lowerVisual.includes('foto') || 
         lowerVisual.includes('visual') ||
         lowerVisual.includes('icono');
}

function extractCallToAction(ctaAnswer: string): string {
  // Clean up the CTA answer to make it button-appropriate
  let cta = ctaAnswer.trim();
  
  // Remove common prefixes
  cta = cta.replace(/^(la acción|quiero que|el usuario debe|necesito que)/i, '');
  cta = cta.trim();
  
  // Capitalize first letter
  if (cta.length > 0) {
    cta = cta.charAt(0).toUpperCase() + cta.slice(1);
  }
  
  // Default if empty or too long
  if (cta.length === 0 || cta.length > 50) {
    return 'Comenzar';
  }
  
  return cta;
}

function extractPrimaryColor(atmosphereAnswer: string): string {
  const lowerAtmosphere = atmosphereAnswer.toLowerCase();
  
  // Look for color mentions
  if (lowerAtmosphere.includes('azul')) return '#007bff';
  if (lowerAtmosphere.includes('verde') || lowerAtmosphere.includes('natural')) return '#28a745';
  if (lowerAtmosphere.includes('rojo')) return '#dc3545';
  if (lowerAtmosphere.includes('naranja')) return '#fd7e14';
  if (lowerAtmosphere.includes('púrpura') || lowerAtmosphere.includes('morado')) return '#6f42c1';
  
  // Look for mood descriptors
  if (lowerAtmosphere.includes('profesional') || lowerAtmosphere.includes('corporativo')) return '#0056b3';
  if (lowerAtmosphere.includes('cálido') || lowerAtmosphere.includes('acogedor')) return '#e67e22';
  if (lowerAtmosphere.includes('elegante') || lowerAtmosphere.includes('sofisticado')) return '#2c3e50';
  
  // Default to clean blue (37signals style)
  return '#007bff';
}
