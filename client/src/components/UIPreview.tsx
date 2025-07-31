
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { UIConfig, UIComponent } from '../../../server/src/schema';

interface UIPreviewProps {
  config: UIConfig | null;
}

export function UIPreview({ config }: UIPreviewProps) {
  if (!config) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-slate-600">Cargando vista previa...</p>
      </div>
    );
  }

  const renderUIComponent = (component: UIComponent) => {
    const baseStyles = component.styles || {};

    switch (component.type) {
      case 'heading':
        return (
          <h1
            key={component.id}
            style={baseStyles}
            className="text-3xl font-bold text-slate-900 mb-4"
          >
            {component.content}
          </h1>
        );

      case 'text':
        return (
          <p
            key={component.id}
            style={baseStyles}
            className="text-slate-600 leading-relaxed mb-4"
          >
            {component.content}
          </p>
        );

      case 'input':
        return (
          <Input
            key={component.id}
            placeholder={component.placeholder}
            style={baseStyles}
            className="mb-4"
          />
        );

      case 'button':
        return (
          <Button
            key={component.id}
            style={{
              backgroundColor: config.primary_color,
              ...baseStyles
            }}
            className="text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity mb-4"
          >
            {component.label}
          </Button>
        );

      case 'image':
        return (
          <div
            key={component.id}
            style={baseStyles}
            className="w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-slate-300"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🖼️</div>
              <p className="text-slate-500 text-sm">{component.content}</p>
            </div>
          </div>
        );

      case 'list':
        return (
          <ul
            key={component.id}
            style={baseStyles}
            className="space-y-2 mb-4"
          >
            {component.items?.map((item: string, index: number) => (
              <li key={index} className="flex items-center text-slate-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                {item}
              </li>
            ))}
          </ul>
        );

      default:
        return null;
    }
  };

  const getLayoutClasses = () => {
    switch (config.layout) {
      case 'single-column':
        return 'max-w-2xl mx-auto';
      case 'two-column':
        return 'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto';
      case 'centered':
        return 'max-w-xl mx-auto text-center';
      default:
        return 'max-w-2xl mx-auto';
    }
  };

  const getThemeClasses = () => {
    switch (config.theme) {
      case 'minimal':
        return 'bg-white';
      case 'modern':
        return 'bg-gradient-to-br from-slate-50 to-blue-50';
      case 'classic':
        return 'bg-gradient-to-br from-amber-50 to-orange-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Info */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-700">
                Layout: {config.layout}
              </Badge>
              <Badge className="bg-green-100 text-green-700">
                Tema: {config.theme}
              </Badge>
              <Badge className="bg-purple-100 text-purple-700">
                {config.components.length} componentes
              </Badge>
            </div>
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: config.primary_color }}
              title={`Color primario: ${config.primary_color}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="border-2 border-slate-200 shadow-lg">
        <CardContent className="p-0">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              preview.ejemplo.com
            </span>
          </div>
          
          <div className={`p-8 min-h-[400px] ${getThemeClasses()}`}>
            <div className={getLayoutClasses()}>
              {config.components.map((component: UIComponent) => 
                renderUIComponent(component)
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Breakdown */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            📋 Componentes Generados
          </h3>
          <div className="space-y-3">
            {config.components.map((component: UIComponent, index: number) => (
              <div key={component.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="text-xs">
                    {index + 1}
                  </Badge>
                  <span className="font-medium text-slate-700">
                    {component.type}
                  </span>
                  {component.label && (
                    <span className="text-sm text-slate-500">
                      "{component.label}"
                    </span>
                  )}
                  {component.content && !component.label && (
                    <span className="text-sm text-slate-500">
                      "{component.content.substring(0, 30)}{component.content.length > 30 ? '...' : ''}"
                    </span>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {component.id}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
