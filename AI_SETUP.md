# AI Integration Setup Guide

This guide will help you set up AI integration for the HealthAssist application.

## Supported AI Services

The application supports four AI providers:
- **Google Gemini** (Recommended)
- **OpenAI GPT-4**
- **Azure OpenAI**
- **Anthropic Claude**

## Setup Instructions

### 1. Create Environment File

Copy the example environment file:
```bash
cp env.example .env
```

### 2. Choose Your AI Service

Edit the `.env` file and set `VITE_AI_SERVICE` to one of:
- `gemini` (default)
- `openai`
- `azure`
- `anthropic`

### 3. Configure API Keys

#### Option A: Google Gemini (Recommended)
```env
VITE_AI_SERVICE=gemini
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_MODEL=gemini-1.5-flash
```

Get your API key from: https://aistudio.google.com/app/apikey

#### Option B: OpenAI
```env
VITE_AI_SERVICE=openai
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-4
```

Get your API key from: https://platform.openai.com/api-keys

#### Option C: Azure OpenAI
```env
VITE_AI_SERVICE=azure
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
VITE_AZURE_OPENAI_API_KEY=your_azure_api_key_here
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
```

#### Option D: Anthropic Claude
```env
VITE_AI_SERVICE=anthropic
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get your API key from: https://console.anthropic.com/

### 4. Restart the Development Server

After setting up your environment variables:
```bash
npm run dev
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit your `.env` file to version control**
2. **API keys are exposed in the frontend** - for production, consider:
   - Using a backend API to proxy AI requests
   - Implementing server-side API key management
   - Using environment-specific configurations

## Fallback Behavior

If the AI service is not configured or fails:
- The application will automatically fall back to mock data
- Users will see a warning in the browser console
- The app will continue to function normally

## Testing

1. Start the development server: `npm run dev`
2. Open the browser console to see AI service status
3. Try entering symptoms to test the AI integration
4. Check the console for any error messages

## Troubleshooting

### Common Issues:

1. **"API key not found" error**
   - Check that your `.env` file exists and contains the correct API key
   - Restart the development server after adding environment variables

2. **"Invalid AI service" error**
   - Ensure `VITE_AI_SERVICE` is set to one of: `openai`, `azure`, or `anthropic`

3. **API request failures**
   - Check your API key is valid and has sufficient credits
   - Verify the API endpoint URLs are correct
   - Check your internet connection

4. **JSON parsing errors**
   - The AI service might be returning malformed JSON
   - Check the browser console for the raw AI response
   - The app will fall back to mock data automatically

## Production Deployment

For production deployment:

1. Set environment variables in your hosting platform
2. Consider implementing a backend API to hide API keys
3. Add rate limiting and error monitoring
4. Implement proper logging and analytics

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API keys and configuration
3. Test with a simple API call outside the application
4. Check the AI service provider's documentation
