
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import type { Prototype } from '../../../server/src/schema';

interface PrototypeListProps {
  prototypes: Prototype[];
  onSelect: (prototype: Prototype) => void;
  onDelete: (id: number) => void;
}

export function PrototypeList({ prototypes, onSelect, onDelete }: PrototypeListProps) {
  if (prototypes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No prototypes yet</h3>
        <p className="text-gray-500 mb-6">
          Create your first prototype to get started with user testing
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {prototypes.map((prototype: Prototype) => (
        <Card key={prototype.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{prototype.title}</CardTitle>
                {prototype.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {prototype.description}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="ml-4">
                {prototype.created_at.toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Target:</span>
                <p className="text-gray-600 mt-1 line-clamp-2">{prototype.target_audience}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Goal:</span>
                <p className="text-gray-600 mt-1 line-clamp-2">{prototype.primary_goal}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex gap-2">
                <Button
                  onClick={() => onSelect(prototype)}
                  variant="default"
                  size="sm"
                >
                  👁️ Preview
                </Button>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    🗑️ Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Prototype</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{prototype.title}"? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(prototype.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
