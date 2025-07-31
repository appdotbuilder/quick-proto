
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import type { CreatePrototypeInput } from '../../../server/src/schema';

interface PrototypeFormProps {
  onSubmit: (data: CreatePrototypeInput) => Promise<void>;
  isLoading?: boolean;
}

const questions = [
  {
    id: 'problem_or_goal_answer',
    title: '🎯 ¿Cuál es el problema principal que resuelves?',
    description: 'Describe de manera clara y concisa el problema específico o el objetivo principal que tu producto aborda.',
    placeholder: 'Ejemplo: "Los usuarios pierden tiempo buscando información dispersa en múltiples plataformas..."',
    icon: '🎯'
  },
  {
    id: 'content_elements_answer',
    title: '📝 ¿Qué información esencial necesita ver el usuario?',
    description: 'Lista los elementos de contenido más importantes que el usuario debe encontrar inmediatamente.',
    placeholder: 'Ejemplo: "Título claro del producto, descripción breve, precio, botón de compra, testimonios..."',
    icon: '📝'
  },
  {
    id: 'call_to_action_answer',
    title: '⚡ ¿Cuál es la acción más importante que debe realizar?',
    description: 'Define la acción principal y más valiosa que quieres que el usuario complete.',
    placeholder: 'Ejemplo: "Registrarse para la prueba gratuita", "Descargar la app", "Solicitar demo"...',
    icon: '⚡'
  },
  {
    id: 'visual_elements_answer',
    title: '🎨 ¿Qué elementos visuales clave necesitas?',
    description: 'Menciona imágenes, gráficos, videos o elementos visuales específicos que fortalezcan tu mensaje.',
    placeholder: 'Ejemplo: "Logo de la empresa, imagen del producto, iconos de características, captura de pantalla..."',
    icon: '🎨'
  },
  {
    id: 'atmosphere_answer',
    title: '✨ ¿Qué sensación debe transmitir tu diseño?',
    description: 'Describe la atmósfera, tono y estilo visual que mejor representa tu marca y mensaje.',
    placeholder: 'Ejemplo: "Profesional y confiable", "Moderno y minimalista", "Cálido y accesible"...',
    icon: '✨'
  }
];

export function PrototypeForm({ onSubmit, isLoading = false }: PrototypeFormProps) {
  const [formData, setFormData] = useState<CreatePrototypeInput>({
    problem_or_goal_answer: '',
    content_elements_answer: '',
    call_to_action_answer: '',
    visual_elements_answer: '',
    atmosphere_answer: ''
  });

  const [currentStep, setCurrentStep] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields are filled
    const allFieldsFilled = Object.values(formData).every(value => value.trim().length > 0);
    if (!allFieldsFilled) {
      alert('Por favor completa todas las preguntas antes de generar el prototipo.');
      return;
    }

    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof CreatePrototypeInput, value: string) => {
    setFormData((prev: CreatePrototypeInput) => ({ ...prev, [field]: value }));
  };

  const goToNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isCurrentStepFilled = formData[questions[currentStep]?.id as keyof CreatePrototypeInput].trim().length > 0;
  const allStepsCompleted = Object.values(formData).every(value => value.trim().length > 0);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-600">
            Pregunta {currentStep + 1} de {questions.length}
          </span>
          <Badge variant="outline" className="text-xs">
            {Math.round(((currentStep + 1) / questions.length) * 100)}% completado
          </Badge>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Question Card */}
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{questions[currentStep]?.icon}</span>
              <CardTitle className="text-xl text-slate-900">
                {questions[currentStep]?.title}
              </CardTitle>
            </div>
            <CardDescription className="text-slate-600 text-base">
              {questions[currentStep]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData[questions[currentStep]?.id as keyof CreatePrototypeInput]}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange(questions[currentStep]?.id as keyof CreatePrototypeInput, e.target.value)
              }
              placeholder={questions[currentStep]?.placeholder}
              className="min-h-[120px] text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrevious}
            disabled={currentStep === 0}
            className="px-6"
          >
            ← Anterior
          </Button>

          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-600'
                    : formData[questions[index]?.id as keyof CreatePrototypeInput].trim().length > 0
                    ? 'bg-green-500'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {currentStep < questions.length - 1 ? (
            <Button
              type="button"
              onClick={goToNext}
              disabled={!isCurrentStepFilled}
              className="px-6"
            >
              Siguiente →
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!allStepsCompleted || isLoading}
              className="px-8 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? '🔄 Generando...' : '🚀 Generar Prototipo'}
            </Button>
          )}
        </div>
      </form>

      {/* All Questions Overview (collapsed) */}
      {allStepsCompleted && (
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-800 flex items-center">
              ✅ Todas las preguntas completadas
            </CardTitle>
            <CardDescription className="text-green-700">
              Tu prototipo está listo para ser generado. Revisa tus respuestas si necesitas hacer cambios.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
