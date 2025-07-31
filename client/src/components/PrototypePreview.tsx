
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { UIConfig, UIComponent } from '../../../server/src/schema';

interface PrototypePreviewProps {
  prototypeId: number;
}

export function PrototypePreview({ prototypeId }: PrototypePreviewProps) {
  const [uiConfig, setUiConfig] = useState<UIConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [interactions, setInteractions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const config = await trpc.generateUIPreview.query({ id: prototypeId });
      setUiConfig(config);
    } catch (err) {
      console.error('Failed to load preview:', err);
      setError('Failed to load preview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prototypeId]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const handleInteraction = (componentId: string, action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setInteractions((prev: string[]) => [
      ...prev,
      `${timestamp}: Clicked "${componentId}" - Action: ${action}`
    ]);
  };

  const renderComponent = (component: UIComponent) => {
    const baseStyles = component.styles || {};
    const themeClass = uiConfig?.theme === 'minimal' ? 'bg-white' : 
                      uiConfig?.theme === 'modern' ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 
                      'bg-gray-50';

    switch (component.type) {
      case 'text':
        return (
          <div
            key={component.id}
            style={baseStyles}
            className={`p-2 ${baseStyles.textAlign === 'center' ? 'text-center' : ''}`}
          >
            <h2 
              className="font-semibold text-gray-900"
              style={{ 
                fontSize: baseStyles.fontSize || '18px',
                fontWeight: baseStyles.fontWeight || 'normal'
              }}
            >
              {component.label}
            </h2>
          </div>
        );

      case 'button':
        return (
          <Button
            key={component.id}
            onClick={() => handleInteraction(component.id, component.action || 'click')}
            className="w-full sm:w-auto"
            style={{ backgroundColor: uiConfig?.primary_color || '#2563eb' }}
          >
            {component.label}
          </Button>
        );

      case 'input':
        return (
          <Input
            key={component.id}
            placeholder={component.placeholder || 'Enter text...'}
            className="w-full"
          />
        );

      case 'form':
        return (
          <form 
            key={component.id}
            className="space-y-4"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              handleInteraction(component.id, 'submit');
            }}
          >
            {component.children?.map(childId => {
              const childComponent = uiConfig?.components.find(c => c.id === childId);
              return childComponent ? renderComponent(childComponent) : null;
            })}
          </form>
        );

      case 'container':
        return (
          <div key={component.id} className={`p-4 rounded-lg ${themeClass}`}>
            {component.children?.map(childId => {
              const childComponent = uiConfig?.components.find(c => c.id === childId);
              return childComponent ? renderComponent(childComponent) : null;
            })}
          </div>
        );

      default:
        return (
          <div key={component.id} className="p-2 border border-gray-200 rounded">
            Unknown component type: {component.type}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin text-2xl mb-2">⚙️</div>
        <p className="text-gray-600">Generating preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error}
          <Button 
            onClick={loadPreview} 
            variant="outline" 
            size="sm" 
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!uiConfig) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No preview configuration available</p>
      </div>
    );
  }

  const layoutClass = uiConfig.layout === 'two-column' ? 'grid md:grid-cols-2 gap-4' : 
                     uiConfig.layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 
                     'space-y-4';

  return (
    <div className="space-y-6">
      {/* Preview Container */}
      <Card className="border-2 border-dashed border-blue-200">
        <CardContent className="p-6">
          <div className="mb-4 text-center">
            <h3 className="font-semibold text-gray-700 mb-1">🎯 Interactive Prototype</h3>
            <p className="text-sm text-gray-500">
              Theme: {uiConfig.theme} • Layout: {uiConfig.layout}
            </p>
          </div>
          
          <div 
            className={`${layoutClass} min-h-[200px] p-4 bg-gray-50 rounded-lg border`}
            style={{ 
              backgroundColor: uiConfig.theme === 'modern' ? '#f8fafc' : '#ffffff',
              borderColor: uiConfig.primary_color + '20'
            }}
          >
            {uiConfig.components.map((component: UIComponent) => renderComponent(component))}
          </div>
        </CardContent>
      </Card>

      {/* Interaction Log */}
      {interactions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">
              📝 User Interactions ({interactions.length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {interactions.slice(-5).map((interaction: string, index: number) => (
                <p key={index} className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
                  {interaction}
                </p>
              ))}
            </div>
            {interactions.length > 5 && (
              <p className="text-xs text-gray-500 mt-2">
                Showing last 5 interactions of {interactions.length} total
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert>
        <AlertDescription>
          💡 <strong>Test Instructions:</strong> Click buttons and interact with elements above. 
          All interactions are logged to help you understand user behavior patterns.
        </AlertDescription>
      </Alert>
    </div>
  );
}
