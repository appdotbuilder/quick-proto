
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Prototype } from '../../../server/src/schema';

interface PrototypeListProps {
  prototypes: Prototype[];
  onPreview: (prototype: Prototype) => void;
  onDelete: (id: number) => void;
}

export function PrototypeList({ prototypes, onPreview, onDelete }: PrototypeListProps) {
  if (prototypes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          No tienes prototipos aún
        </h3>
        <p className="text-slate-500 mb-6">
          Crea tu primer prototipo respondiendo las 5 preguntas simples
        </p>
        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
          🚀 Crear Mi Primer Prototipo
        </Button>
      </div>
    );
  }

  const truncateText = (text: string, maxLength: number = 100): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'minimal':
        return 'bg-slate-100 text-slate-700';
      case 'modern':
        return 'bg-blue-100 text-blue-700';
      case 'classic':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {prototypes.map((prototype: Prototype) => (
          <Card key={prototype.id} className="hover:shadow-lg transition-shadow border border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  ID: {prototype.id}
                </Badge>
                <Badge 
                  className={`text-xs ${getThemeColor(prototype.generated_ui_config.theme)}`}
                >
                  {prototype.generated_ui_config.theme}
                </Badge>
              </div>
              <CardTitle className="text-lg">
                🎯 {truncateText(prototype.problem_or_goal_answer, 60)}
              </CardTitle>
              <CardDescription className="text-sm">
                Creado: {prototype.created_at.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-slate-600">📝 Contenido:</span>
                  <p className="text-slate-500 text-xs mt-1">
                    {truncateText(prototype.content_elements_answer, 80)}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-slate-600">⚡ Acción:</span>
                  <p className="text-slate-500 text-xs mt-1">
                    {truncateText(prototype.call_to_action_answer, 60)}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>Layout: {prototype.generated_ui_config.layout}</span>
                  <span>{prototype.generated_ui_config.components.length} componentes</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onPreview(prototype)}
                    className="flex-1 text-sm bg-blue-600 hover:bg-blue-700"
                  >
                    👁️ Ver Prototipo
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        🗑️
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar prototipo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. El prototipo será eliminado permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(prototype.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
