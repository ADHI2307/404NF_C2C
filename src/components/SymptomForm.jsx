import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Search, Stethoscope } from 'lucide-react';

const COMMON_SYMPTOMS = [
  'Fever',
  'Headache', 
  'Cough',
  'Sore throat',
  'Fatigue',
  'Nausea',
  'Stomach pain',
  'Muscle aches',
  'Runny nose',
  'Shortness of breath',
  'Dizziness',
  'Chest pain'
];

export default function SymptomForm({ onSubmit }) {
  const [freeTextSymptoms, setFreeTextSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allSymptoms = [
      ...selectedSymptoms,
      ...(freeTextSymptoms ? freeTextSymptoms.split(',').map(s => s.trim()).filter(Boolean) : [])
    ];

    if (allSymptoms.length === 0) {
      alert('Please describe your symptoms or select from the list below.');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(allSymptoms);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Stethoscope className="h-5 w-5" />
            Describe Your Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Free text input */}
          <div className="space-y-2">
            <Label htmlFor="symptoms" className="text-sm font-medium">
              Describe your symptoms in your own words
            </Label>
            <Textarea
              id="symptoms"
              placeholder="e.g., I have a headache and feel dizzy, started this morning..."
              value={freeTextSymptoms}
              onChange={(e) => setFreeTextSymptoms(e.target.value)}
              className="min-h-[100px] resize-none"
              aria-describedby="symptoms-help"
            />
            <p id="symptoms-help" className="text-xs text-muted-foreground">
              Separate multiple symptoms with commas if needed
            </p>
          </div>

          {/* Or divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or select common symptoms</span>
            </div>
          </div>

          {/* Common symptoms checkboxes */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Common Symptoms (select all that apply)
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COMMON_SYMPTOMS.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={symptom}
                    checked={selectedSymptoms.includes(symptom)}
                    onCheckedChange={() => handleSymptomToggle(symptom)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={symptom} 
                    className="text-sm cursor-pointer hover:text-primary transition-colors"
                  >
                    {symptom}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center gap-2"
            size="lg"
          >
            <Search className="h-4 w-4" />
            {isLoading ? 'Analyzing...' : 'Get Diagnosis'}
          </Button>

          {/* Selected symptoms summary */}
          {selectedSymptoms.length > 0 && (
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-sm font-medium text-secondary-foreground mb-2">
                Selected symptoms:
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedSymptoms.map((symptom) => (
                  <span 
                    key={symptom} 
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary text-primary-foreground"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}