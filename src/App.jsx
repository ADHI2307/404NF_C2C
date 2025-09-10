import { useState } from 'react';
import SymptomForm from './components/SymptomForm';
import MapView from './components/MapView';
import AIConfigStatus from './components/AIConfigStatus';
import { diagnose } from './utils/diagnosisMock';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { MapPin, ArrowLeft, ExternalLink, Search, RefreshCw, Plus, Camera } from 'lucide-react';

export default function App() {
  const [results, setResults] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [hasImages, setHasImages] = useState(false);

  const handleSubmitSymptoms = async (symptoms, images = []) => {
    const hasImagesProvided = images && images.length > 0;
    setHasImages(hasImagesProvided);
    const diagnosisResults = await diagnose(symptoms, images);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowMap(false)}
                className="flex items-center gap-2 hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Results
              </Button>
              <h1 className="text-2xl font-bold text-blue-900">Nearby Hospitals</h1>
            </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">HealthAssist</h1>
          <p className="text-blue-700 text-lg">
            AI-powered symptom checker and hospital finder
          </p>
        </header>

        {!results ? (
          <div className="space-y-6">
            <AIConfigStatus />
            <SymptomForm onSubmit={handleSubmitSymptoms} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-blue-900">
                  Diagnosis Results
                </h2>
                {hasImages && (
                  <Badge className="bg-green-500 text-white flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    Visual Analysis
                  </Badge>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setResults(null)}
                  className="flex items-center gap-2 hover:bg-blue-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  New Search
                </Button>
                <Button 
                  onClick={handleShowMap}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <MapPin className="h-4 w-4" />
                  Find Hospitals
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {results.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-blue-900">
                        {result.condition}
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <Badge variant={getUrgencyColor(result.urgency)} className="px-3 py-1">
                          {result.urgency} urgency
                        </Badge>
                        <span className="text-sm font-medium text-blue-600">
                          {Math.round(result.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-medium mb-2 text-blue-800">
                        Recommended Steps:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        {result.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="capitalize">{step}</li>
                        ))}
                      </ul>
                      
                      {/* Visual Analysis Results */}
                      {result.visual_analysis && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            Visual Analysis:
                          </h5>
                          <p className="text-sm text-green-700">{result.visual_analysis}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-100 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
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
