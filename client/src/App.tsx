
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Prototype, CreatePrototypeInput } from '../../server/src/schema';
import { PrototypeForm } from '@/components/PrototypeForm';
import { PrototypeList } from '@/components/PrototypeList';
import { PrototypePreview } from '@/components/PrototypePreview';

function App() {
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [selectedPrototype, setSelectedPrototype] = useState<Prototype | null>(null);
  const [activeTab, setActiveTab] = useState('create');
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
    loadPrototypes();
  }, [loadPrototypes]);

  const handleCreatePrototype = async (formData: CreatePrototypeInput) => {
    setIsLoading(true);
    try {
      const newPrototype = await trpc.createPrototype.mutate(formData);
      setPrototypes((prev: Prototype[]) => [...prev, newPrototype]);
      setSelectedPrototype(newPrototype);
      setActiveTab('preview');
    } catch (error) {
      console.error('Failed to create prototype:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrototype = async (id: number) => {
    try {
      await trpc.deletePrototype.mutate({ id });
      setPrototypes((prev: Prototype[]) => prev.filter(p => p.id !== id));
      if (selectedPrototype?.id === id) {
        setSelectedPrototype(null);
        setActiveTab('create');
      }
    } catch (error) {
      console.error('Failed to delete prototype:', error);
    }
  };

  const handleSelectPrototype = (prototype: Prototype) => {
    setSelectedPrototype(prototype);
    setActiveTab('preview');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">🎯 Prototype Generator</h1>
          <p className="text-gray-600 mt-2">
            Create simple, interactive UI prototypes for user testing
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">✨ Create Prototype</TabsTrigger>
            <TabsTrigger value="manage">📋 My Prototypes</TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedPrototype}>
              👁️ Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Answer Five Key Questions</CardTitle>
                <p className="text-sm text-gray-600">
                  Help us understand your prototype needs to generate a simple, 
                  effective user interface for testing.
                </p>
              </CardHeader>
              <CardContent>
                <PrototypeForm 
                  onSubmit={handleCreatePrototype}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Prototypes</CardTitle>
                <p className="text-sm text-gray-600">
                  Manage and preview your created prototypes
                </p>
              </CardHeader>
              <CardContent>
                <PrototypeList
                  prototypes={prototypes}
                  onSelect={handleSelectPrototype}
                  onDelete={handleDeletePrototype}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            {selectedPrototype ? (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Prototype Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedPrototype.title}</CardTitle>
                    {selectedPrototype.description && (
                      <p className="text-sm text-gray-600">
                        {selectedPrototype.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700">Target Audience</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedPrototype.target_audience}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700">Primary Goal</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedPrototype.primary_goal}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700">Key Features</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedPrototype.key_features}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700">User Flow</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedPrototype.user_flow}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700">Success Metrics</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedPrototype.success_metrics}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <p className="text-sm text-gray-600">
                      Interactive preview of your prototype
                    </p>
                  </CardHeader>
                  <CardContent>
                    <PrototypePreview prototypeId={selectedPrototype.id} />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">Select a prototype to preview</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
