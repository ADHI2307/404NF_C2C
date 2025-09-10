#!/usr/bin/env node

/**
 * Quick setup script for Google Gemini AI integration
 * Run with: node setup-gemini.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 HealthAssist - Google Gemini Setup');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!\n');
  } else {
    console.log('❌ Error: env.example file not found');
    process.exit(1);
  }
}

// Read current .env content
let envContent = fs.readFileSync(envPath, 'utf8');

// Check if already configured for Gemini
if (envContent.includes('VITE_AI_SERVICE=gemini') && 
    envContent.includes('VITE_GEMINI_API_KEY=your_gemini_api_key_here')) {
  console.log('🔧 Gemini configuration detected but not yet configured.');
} else if (envContent.includes('VITE_AI_SERVICE=gemini') && 
           !envContent.includes('VITE_GEMINI_API_KEY=your_gemini_api_key_here')) {
  console.log('✅ Gemini appears to be already configured!');
  process.exit(0);
}

console.log('📝 Please provide your Google Gemini API key:');
console.log('   Get it from: https://aistudio.google.com/app/apikey\n');

rl.question('Enter your Gemini API key: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.log('❌ No API key provided. Setup cancelled.');
    rl.close();
    return;
  }

  // Update .env file
  let updatedContent = envContent
    .replace('VITE_AI_SERVICE=openai', 'VITE_AI_SERVICE=gemini')
    .replace('VITE_GEMINI_API_KEY=your_gemini_api_key_here', `VITE_GEMINI_API_KEY=${apiKey.trim()}`)
    .replace('VITE_GEMINI_MODEL=gemini-1.5-flash', 'VITE_GEMINI_MODEL=gemini-1.5-flash');

  // Ensure Gemini is set as the default service
  if (!updatedContent.includes('VITE_AI_SERVICE=gemini')) {
    updatedContent = updatedContent.replace(
      /VITE_AI_SERVICE=.*/,
      'VITE_AI_SERVICE=gemini'
    );
  }

  fs.writeFileSync(envPath, updatedContent);

  console.log('\n✅ Configuration updated successfully!');
  console.log('\n📋 Summary:');
  console.log('   • AI Service: Google Gemini');
  console.log('   • Model: gemini-1.5-flash');
  console.log('   • API Key: Configured');
  console.log('\n🚀 Next steps:');
  console.log('   1. Restart your development server: npm run dev');
  console.log('   2. Open http://localhost:5173');
  console.log('   3. Check the AI Configuration Status in the app');
  console.log('\n🎉 Setup complete! Your app is ready to use Google Gemini AI.');

  rl.close();
});

rl.on('close', () => {
  process.exit(0);
});
