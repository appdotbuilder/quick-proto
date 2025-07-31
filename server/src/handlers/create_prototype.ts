
import { type CreatePrototypeInput, type Prototype, type UIConfig, type UIComponent } from '../schema';
import { db } from '../db';
import { prototypesTable } from '../db/schema';

/**
 * Creates a new prototype by analyzing the five question answers and generating
 * a dynamic UI configuration based on 37 Signals principles of simplicity and clarity.
 */
export const createPrototype = async (input: CreatePrototypeInput): Promise<Prototype> => {
  try {
    // Generate UI configuration based on the five answers
    const generatedUIConfig = generateUIFromAnswers(input);
    
    // Insert into database
    const [newPrototype] = await db.insert(prototypesTable).values({
      problem_or_goal_answer: input.problem_or_goal_answer,
      content_elements_answer: input.content_elements_answer,
      call_to_action_answer: input.call_to_action_answer,
      visual_elements_answer: input.visual_elements_answer,
      atmosphere_answer: input.atmosphere_answer,
      generated_ui_config: generatedUIConfig,
      updated_at: new Date()
    }).returning();

    return {
      ...newPrototype,
      generated_ui_config: generatedUIConfig,
      created_at: newPrototype.created_at,
      updated_at: newPrototype.updated_at
    };
  } catch (error) {
    console.error('Prototype creation failed:', error);
    throw error;
  }
};

/**
 * Analyzes the five question answers and generates a UI configuration
 * following 37 Signals aesthetic principles: simplicity, clarity, and focus.
 */
function generateUIFromAnswers(input: CreatePrototypeInput): UIConfig {
  const components: UIComponent[] = [];
  
  // 1. Generate main heading from problem/goal answer
  const mainTitle = extractMainTitle(input.problem_or_goal_answer);
  components.push({
    id: 'main-heading',
    type: 'heading',
    content: mainTitle,
    styles: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }
  });

  // 2. Add descriptive text based on content elements
  if (input.content_elements_answer.toLowerCase().includes('descripción') || 
      input.content_elements_answer.toLowerCase().includes('información') ||
      input.content_elements_answer.toLowerCase().includes('texto')) {
    components.push({
      id: 'description',
      type: 'text',
      content: 'Una descripción clara y concisa del producto o servicio.',
      styles: { marginBottom: '1.5rem', color: '#666' }
    });
  }

  // 3. Add input field if data entry is suggested
  if (input.content_elements_answer.toLowerCase().includes('formulario') ||
      input.content_elements_answer.toLowerCase().includes('datos') ||
      input.content_elements_answer.toLowerCase().includes('email') ||
      input.content_elements_answer.toLowerCase().includes('input') ||
      input.content_elements_answer.toLowerCase().includes('registro')) {
    components.push({
      id: 'user-input',
      type: 'input',
      placeholder: 'Ingresa tu información aquí',
      styles: { marginBottom: '1rem', padding: '0.75rem', borderRadius: '4px' }
    });
  }

  // 4. Add image placeholder if visual elements are mentioned
  if (input.visual_elements_answer.toLowerCase().includes('imagen') ||
      input.visual_elements_answer.toLowerCase().includes('foto') ||
      input.visual_elements_answer.toLowerCase().includes('visual') ||
      input.visual_elements_answer.toLowerCase().includes('gráfico') ||
      input.visual_elements_answer.toLowerCase().includes('icono')) {
    components.push({
      id: 'hero-image',
      type: 'image',
      content: 'Imagen representativa',
      styles: { marginBottom: '1.5rem', borderRadius: '8px' }
    });
  }

  // 5. Add list if content suggests multiple items
  if (input.content_elements_answer.toLowerCase().includes('lista') ||
      input.content_elements_answer.toLowerCase().includes('características') ||
      input.content_elements_answer.toLowerCase().includes('beneficios') ||
      input.content_elements_answer.toLowerCase().includes('elementos') ||
      input.content_elements_answer.toLowerCase().includes('puntos')) {
    components.push({
      id: 'feature-list',
      type: 'list',
      items: ['Característica principal', 'Beneficio clave', 'Propuesta de valor'],
      styles: { marginBottom: '1.5rem' }
    });
  }

  // 6. Always add the main call-to-action button
  components.push({
    id: 'main-cta',
    type: 'button',
    label: input.call_to_action_answer,
    action: 'primary-action',
    styles: { 
      backgroundColor: '#2563eb', 
      color: 'white', 
      padding: '0.75rem 1.5rem', 
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: '600'
    }
  });

  // Determine primary color based on atmosphere answer
  const primaryColor = extractPrimaryColor(input.atmosphere_answer);

  return {
    layout: 'single-column',
    theme: 'minimal',
    primary_color: primaryColor,
    components
  };
}

/**
 * Extracts a meaningful title from the problem/goal answer
 */
function extractMainTitle(problemAnswer: string): string {
  // Simple extraction logic - take first sentence or meaningful phrase
  const sentences = problemAnswer.split(/[.!?]/);
  const firstSentence = sentences[0]?.trim();
  
  if (firstSentence && firstSentence.length > 10 && firstSentence.length < 60) {
    return firstSentence;
  }
  
  return 'Solución Simple y Efectiva';
}

/**
 * Determines primary color based on atmosphere description
 */
function extractPrimaryColor(atmosphereAnswer: string): string {
  const answer = atmosphereAnswer.toLowerCase();
  
  if (answer.includes('azul') || answer.includes('confianza') || answer.includes('profesional')) {
    return '#2563eb'; // Blue
  } else if (answer.includes('verde') || answer.includes('natural') || answer.includes('crecimiento')) {
    return '#059669'; // Green
  } else if (answer.includes('rojo') || answer.includes('urgencia') || answer.includes('acción')) {
    return '#dc2626'; // Red
  } else if (answer.includes('naranja') || answer.includes('energía') || answer.includes('creatividad')) {
    return '#ea580c'; // Orange
  }
  
  return '#2563eb'; // Default blue
}
