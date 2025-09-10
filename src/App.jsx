import { useState } from 'react';
import SymptomForm from './components/SymptomForm';
import MapView from './components/MapView';
import { diagnose } from './utils/diagnosisMock';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { MapPin, ArrowLeft, ExternalLink } from 'lucide-react';

export default function App() {
  const [results, setResults] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const handleSubmitSymptoms = async (symptoms) => {
    const diagnosisResults = await diagnose(symptoms);
    setResults(diagnosisResults);
  };

  const handleShowMap = () => {
    setShowMap(true);
    // Request geolocation permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation denied or unavailable:', error);
          // User will need to enter city manually in MapView
        }
      );
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const openInGoogleMaps = (lat, lon) => {
    window.open(`https://maps.google.com?q=${lat},${lon}`, '_blank');
  };

  if (showMap) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowMap(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Results
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Nearby Hospitals</h1>
          </div>
          <MapView 
            userLocation={userLocation} 
            onLocationUpdate={setUserLocation}
            openInGoogleMaps={openInGoogleMaps}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">HealthAssist</h1>
          <p className="text-muted-foreground text-lg">
            AI-powered symptom checker and hospital finder
          </p>
        </header>

        {!results ? (
          <SymptomForm onSubmit={handleSubmitSymptoms} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">
                Diagnosis Results
              </h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setResults(null)}
                >
                  New Search
                </Button>
                <Button 
                  onClick={handleShowMap}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Find Hospitals
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {results.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        {result.condition}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={getUrgencyColor(result.urgency)}>
                          {result.urgency} urgency
                        </Badge>
                        <span className="text-sm font-medium text-muted-foreground">
                          {Math.round(result.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-medium mb-2 text-foreground">
                        Recommended Steps:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {result.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="capitalize">{step}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-4 bg-secondary rounded-lg">
              <p className="text-sm text-secondary-foreground">
                <strong>Disclaimer:</strong> This tool provides general health information only and should not replace professional medical advice. 
                Always consult with a healthcare professional for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}