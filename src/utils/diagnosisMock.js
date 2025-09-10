// Mock diagnosis function - replace with real AI/backend API call
// TODO: Replace with actual API call to your AI service (OpenAI, Azure, etc.)
//       Store API keys server-side for security

const mockConditions = [
  {
    condition: 'Common Cold',
    keywords: ['runny nose', 'sore throat', 'cough', 'fatigue', 'headache'],
    urgency: 'low',
    steps: ['get plenty of rest', 'drink fluids', 'use throat lozenges', 'consider over-the-counter pain relief']
  },
  {
    condition: 'Seasonal Flu',
    keywords: ['fever', 'muscle aches', 'fatigue', 'headache', 'cough'],
    urgency: 'low',
    steps: ['rest and isolate', 'stay hydrated', 'monitor temperature', 'consult doctor if worsening']
  },
  {
    condition: 'Migraine Headache',
    keywords: ['headache', 'nausea', 'dizziness', 'light sensitivity'],
    urgency: 'medium',
    steps: ['rest in dark quiet room', 'apply cold compress', 'stay hydrated', 'avoid triggers']
  },
  {
    condition: 'Gastroenteritis',
    keywords: ['nausea', 'stomach pain', 'vomiting', 'diarrhea'],
    urgency: 'medium',
    steps: ['stay hydrated', 'eat bland foods', 'avoid dairy and fatty foods', 'seek medical care if severe']
  },
  {
    condition: 'Anxiety/Panic Attack',
    keywords: ['chest pain', 'shortness of breath', 'dizziness', 'rapid heartbeat'],
    urgency: 'medium',
    steps: ['practice deep breathing', 'find calm environment', 'use grounding techniques', 'consult healthcare provider']
  },
  {
    condition: 'Possible Heart Issue',
    keywords: ['chest pain', 'shortness of breath', 'arm pain', 'jaw pain'],
    urgency: 'high',
    steps: ['seek immediate medical attention', 'call emergency services', 'do not drive yourself', 'chew aspirin if not allergic']
  },
  {
    condition: 'Severe Allergic Reaction',
    keywords: ['difficulty breathing', 'swelling', 'hives', 'dizziness'],
    urgency: 'high',
    steps: ['use epinephrine if available', 'call emergency services immediately', 'avoid known allergens', 'seek emergency care']
  },
  {
    condition: 'Dehydration',
    keywords: ['dizziness', 'fatigue', 'dry mouth', 'headache'],
    urgency: 'low',
    steps: ['drink water slowly', 'rest in cool place', 'avoid alcohol and caffeine', 'seek care if severe']
  }
];

// Calculate confidence based on symptom matching
function calculateConfidence(symptoms, condition) {
  const normalizedSymptoms = symptoms.map(s => s.toLowerCase());
  const matchedKeywords = condition.keywords.filter(keyword => 
    normalizedSymptoms.some(symptom => 
      symptom.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(symptom)
    )
  );
  
  const baseConfidence = (matchedKeywords.length / condition.keywords.length) * 0.8;
  const randomFactor = Math.random() * 0.3; // Add some randomness for realism
  
  return Math.min(baseConfidence + randomFactor, 0.95); // Cap at 95%
}

export async function diagnose(symptoms) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log('Diagnosing symptoms:', symptoms);
  
  if (!symptoms || symptoms.length === 0) {
    throw new Error('No symptoms provided');
  }

  // Calculate confidence for each condition
  const results = mockConditions
    .map(condition => ({
      ...condition,
      confidence: calculateConfidence(symptoms, condition)
    }))
    .filter(result => result.confidence > 0.1) // Only include conditions with some confidence
    .sort((a, b) => b.confidence - a.confidence) // Sort by confidence descending
    .slice(0, 4); // Return top 4 matches

  // Ensure at least one result
  if (results.length === 0) {
    results.push({
      condition: 'General Malaise',
      confidence: 0.3,
      urgency: 'low',
      steps: ['monitor symptoms', 'get adequate rest', 'stay hydrated', 'consult healthcare provider if symptoms persist']
    });
  }

  console.log('Diagnosis results:', results);
  return results;
}

/* 
INTEGRATION INSTRUCTIONS:
To replace this mock with a real AI service:

1. Install your preferred AI SDK (e.g., openai, @azure/openai, etc.)
2. Store API keys server-side (never in frontend code)
3. Create a backend endpoint that:
   - Receives symptoms from frontend
   - Calls AI service with proper medical prompting
   - Returns structured diagnosis data
4. Replace the diagnose() function to call your backend:

export async function diagnose(symptoms) {
  const response = await fetch('/api/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms })
  });
  
  if (!response.ok) {
    throw new Error('Diagnosis failed');
  }
  
  return await response.json();
}

Example AI prompt structure:
"You are a medical AI assistant. Based on these symptoms: [symptoms], 
provide a JSON response with probable conditions, confidence scores (0-1), 
urgency levels (low/medium/high), and recommended steps. 
Always include disclaimer about consulting healthcare professionals."
*/