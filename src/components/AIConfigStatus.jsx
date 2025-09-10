import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, XCircle, AlertTriangle, Settings, ExternalLink } from 'lucide-react';

export default function AIConfigStatus() {
  const [configStatus, setConfigStatus] = useState({
    service: null,
    hasApiKey: false,
    isConfigured: false,
    error: null
  });

  useEffect(() => {
    checkAIConfiguration();
  }, []);

  const checkAIConfiguration = () => {
    const service = import.meta.env.VITE_AI_SERVICE || 'gemini';
    let hasApiKey = false;
    let error = null;

    try {
      switch (service) {
        case 'gemini':
          hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY && 
                     import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here';
          break;
        case 'openai':
          hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY && 
                     import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here';
          break;
        case 'azure':
          hasApiKey = !!(
            import.meta.env.VITE_AZURE_OPENAI_API_KEY && 
            import.meta.env.VITE_AZURE_OPENAI_ENDPOINT &&
            import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME &&
            import.meta.env.VITE_AZURE_OPENAI_API_KEY !== 'your_azure_api_key_here'
          );
          break;
        case 'anthropic':
          hasApiKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY && 
                     import.meta.env.VITE_ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';
          break;
        default:
          error = `Unknown AI service: ${service}`;
      }
    } catch (err) {
      error = err.message;
    }

    setConfigStatus({
      service,
      hasApiKey,
      isConfigured: hasApiKey && !error,
      error
    });
  };

  const getStatusIcon = () => {
    if (configStatus.error) return <XCircle className="h-5 w-5 text-red-500" />;
    if (configStatus.isConfigured) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusBadge = () => {
    if (configStatus.error) return <Badge variant="destructive">Error</Badge>;
    if (configStatus.isConfigured) return <Badge className="bg-green-500">Configured</Badge>;
    return <Badge variant="warning">Not Configured</Badge>;
  };

  const getStatusMessage = () => {
    if (configStatus.error) {
      return `Configuration error: ${configStatus.error}`;
    }
    if (configStatus.isConfigured) {
      return `AI service (${configStatus.service}) is properly configured and ready to use.`;
    }
    return `AI service (${configStatus.service}) is not configured. The app will use mock data.`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Settings className="h-5 w-5" />
          AI Configuration Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">Status:</span>
            {getStatusBadge()}
          </div>
        </div>
        
        <p className="text-sm text-blue-700">
          {getStatusMessage()}
        </p>

        {!configStatus.isConfigured && (
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                To enable AI-powered diagnosis:
              </p>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Copy <code className="bg-yellow-100 px-1 rounded">env.example</code> to <code className="bg-yellow-100 px-1 rounded">.env</code></li>
                <li>Add your API key to the <code className="bg-yellow-100 px-1 rounded">.env</code> file</li>
                <li>Restart the development server</li>
              </ol>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkAIConfiguration}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Check Again
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/AI_SETUP.md', '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Setup Guide
              </Button>
            </div>
          </div>
        )}

        {configStatus.isConfigured && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ AI service is ready! You'll get real AI-powered medical insights.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
