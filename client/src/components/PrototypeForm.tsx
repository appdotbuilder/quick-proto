
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import type { CreatePrototypeInput } from '../../../server/src/schema';

interface PrototypeFormProps {
  onSubmit: (data: CreatePrototypeInput) => Promise<void>;
  isLoading?: boolean;
}

export function PrototypeForm({ onSubmit, isLoading = false }: PrototypeFormProps) {
  const [formData, setFormData] = useState<CreatePrototypeInput>({
    title: '',
    description: null,
    target_audience: '',
    primary_goal: '',
    key_features: '',
    user_flow: '',
    success_metrics: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    // Reset form after successful submission
    setFormData({
      title: '',
      description: null,
      target_audience: '',
      primary_goal: '',
      key_features: '',
      user_flow: '',
      success_metrics: ''
    });
  };

  const questions = [
    {
      key: 'title' as keyof CreatePrototypeInput,
      label: '1. What is your prototype title?',
      placeholder: 'e.g., "Task Management App", "E-commerce Checkout Flow"',
      required: true
    },
    {
      key: 'target_audience' as keyof CreatePrototypeInput,
      label: '2. Who is your target audience?',
      placeholder: 'e.g., "Busy professionals aged 25-40", "First-time online shoppers"',
      required: true
    },
    {
      key: 'primary_goal' as keyof CreatePrototypeInput,
      label: '3. What is the primary goal users should accomplish?',
      placeholder: 'e.g., "Complete a purchase in under 3 clicks", "Create and organize daily tasks"',
      required: true
    },
    {
      key: 'key_features' as keyof CreatePrototypeInput,
      label: '4. What are the 2-3 most important features?',
      placeholder: 'e.g., "Quick add task, drag-and-drop prioritization, progress tracking"',
      required: true
    },
    {
      key: 'user_flow' as keyof CreatePrototypeInput,
      label: '5. Describe the ideal user journey in 2-3 steps',
      placeholder: 'e.g., "1. Land on homepage 2. Click primary CTA 3. Complete main action"',
      required: true
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question) => (
        <Card key={question.key} className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Label htmlFor={question.key} className="text-base font-medium">
                {question.label}
              </Label>
              <Textarea
                id={question.key}
                value={formData[question.key] as string || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev: CreatePrototypeInput) => ({
                    ...prev,
                    [question.key]: e.target.value || (question.key === 'description' ? null : '')
                  }))
                }
                placeholder={question.placeholder}
                required={question.required}
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Optional fields */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-medium">
              Additional Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreatePrototypeInput) => ({
                  ...prev,
                  description: e.target.value || null
                }))
              }
              placeholder="Any additional context or requirements for your prototype..."
              rows={2}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Label htmlFor="success_metrics" className="text-base font-medium">
              How will you measure success with users?
            </Label>
            <Textarea
              id="success_metrics"
              value={formData.success_metrics}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreatePrototypeInput) => ({
                  ...prev,
                  success_metrics: e.target.value
                }))
              }
              placeholder="e.g., 'Users complete the main action within 30 seconds', 'Zero confusion about next steps'"
              required
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          size="lg"
          className="px-8"
        >
          {isLoading ? '🔄 Generating...' : '✨ Generate Prototype'}
        </Button>
      </div>
    </form>
  );
}
