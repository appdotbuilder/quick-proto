
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Prototype, CreatePrototypeInput, UIConfig } from '../../server/src/schema';
import { PrototypeForm } from '@/components/PrototypeForm';
import { PrototypeList } from '@/components/PrototypeList';
import { UIPreview } from '@/components/UIPreview';

function App() {
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [selectedPrototype, setSelectedPrototype] = useState<Prototype | null>(null);
  const [previewConfig, setPreviewConfig] = useState<UIConfig | null>(null);
  const [activeView, setActiveView] = useState<'create' | 'list' | 'preview'>('create');
  const [isLoading, setIsLoading] = useState(false);

  const loadPrototypes = useCallback(async () => {
    try {
      const result = await trpc.getPrototypes.query();
      setPrototypes(result);
    } catch (error) {
      console.error('Failed to load prototypes:', error);
    }
  }, []);

  useEffect(() => {
    if (activeView === 'list') {
      loadPrototypes();
    }
  }, [activeView, loadPrototypes]);

  const handleCreatePrototype = async (formData: CreatePrototypeInput) => {
    setIsLoading(true);
    try {
      const newPrototype = await trpc.createPrototype.mutate(formData);
      setPrototypes((prev: Prototype[]) => [newPrototype, ...prev]);
      setSelectedPrototype(newPrototype);
      setActiveView('preview');
      
      // Load the UI preview
      const preview = await trpc.generateUIPreview.query({ prototype_id: newPrototype.id });
      setPreviewConfig(preview);
    } catch (error) {
      console.error('Failed to create prototype:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewPrototype = async (prototype: Prototype) => {
    setSelectedPrototype(prototype);
    setActiveView('preview');
    
    try {
      const preview = await trpc.generateUIPreview.query({ prototype_id: prototype.id });
      setPreviewConfig(preview);
    } catch (error) {
      console.error('Failed to load preview:', error);
    }
  };

  const handleDeletePrototype = async (id: number) => {
    try {
      await trpc.deletePrototype.mutate({ id });
      setPrototypes((prev: Prototype[]) => prev.filter(p => p.id !== id));
      if (selectedPrototype?.id === id) {
        setSelectedPrototype(null);
        setPreviewConfig(null);
        setActiveView('list');
      }
    } catch (error) {
      console.error('Failed to delete prototype:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">✨</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Simple Prototype</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                37 Signals Inspired
              </Badge>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={activeView === 'create' ? 'default' : 'outline'}
                onClick={() => setActiveView('create')}
                className="text-sm"
              >
                🚀 Crear Nuevo
              </Button>
              <Button
                variant={activeView === 'list' ? 'default' : 'outline'}
                onClick={() => setActiveView('list')}
                className="text-sm"
              >
                📋 Mis Prototipos
              </Button>
              {selectedPrototype && (
                <Button
                  variant={activeView === 'preview' ? 'default' : 'outline'}
                  onClick={() => setActiveView('preview')}
                  className="text-sm"
                >
                  👁️ Vista Previa
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {activeView === 'create' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                5 Preguntas Simples = 1 Prototipo Perfecto ✨
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Inspirado en la filosofía de 37 Signals: claridad, simplicidad y enfoque. 
                Responde estas cinco preguntas para generar automáticamente tu prototipo.
              </p>
            </div>
            
            <PrototypeForm onSubmit={handleCreatePrototype} isLoading={isLoading} />
          </div>
        )}

        {activeView === 'list' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Tus Prototipos 📋
              </h2>
              <p className="text-slate-600">
                Gestiona y visualiza todos tus prototipos generados
              </p>
            </div>
            
            <PrototypeList 
              prototypes={prototypes} 
              onPreview={handlePreviewPrototype}
              onDelete={handleDeletePrototype}
            />
          </div>
        )}

        {activeView === 'preview' && selectedPrototype && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    Vista Previa del Prototipo 👁️
                  </h2>
                  <p className="text-slate-600 mt-2">
                    Generado automáticamente basado en tus respuestas
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700 px-3 py-1">
                  ID: {selectedPrototype.id}
                </Badge>
              </div>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Resumen de Respuestas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">🎯 Problema/Objetivo:</h4>
                    <p className="text-slate-600 text-sm">{selectedPrototype.problem_or_goal_answer}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">📝 Contenido Esencial:</h4>
                    <p className="text-slate-600 text-sm">{selectedPrototype.content_elements_answer}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">⚡ Acción Principal:</h4>
                    <p className="text-slate-600 text-sm">{selectedPrototype.call_to_action_answer}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <UIPreview config={previewConfig} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 mt-16">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-slate-500 text-sm">
            Inspirado en la simplicidad y claridad de 37 Signals • 
            Enfoque en lo esencial, elimina lo superfluo
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
