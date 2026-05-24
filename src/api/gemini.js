export const GEMINI_API_KEY = 'AIzaSyBDR29MOsMhkiElr1feVJ4zQOT-G3G8CKc';
export const GEMINI_MODEL = 'text-bison-001';

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta2/models/${GEMINI_MODEL}:generate?key=${GEMINI_API_KEY}`;

export async function fetchGeminiFocusQuiz(metrics) {
  if (!GEMINI_API_KEY) return null;

  const focus = metrics?.focus ?? 100;
  const attention = metrics?.attention ?? 100;
  const lowFocusDescription = focus < attention ? 'focus' : 'attention';
  const promptText = `You are generating a short post-lesson quiz for a student who was not focused during class. ` +
    `The student showed low ${lowFocusDescription} in the lesson. Return only valid JSON with a single key \"questions\". ` +
    `Each question object must contain \"id\", \"question\", \"options\" (array of 3 strings), and \"answer\". ` +
    `Create 3 multiple choice questions that help the student review focus-related learning strategies and the lesson content they missed.`;

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: { text: promptText },
        temperature: 0.2,
        maxOutputTokens: 250
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const outputText = candidate?.content?.[0]?.text || candidate?.output || '';

    if (!outputText) {
      return null;
    }

    try {
      const parsed = JSON.parse(outputText);
      if (Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
    } catch (err) {
      // Fallback: maybe the model returned text with JSON embedded
      const jsonStart = outputText.indexOf('{');
      const jsonEnd = outputText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonString = outputText.slice(jsonStart, jsonEnd + 1);
        try {
          const parsed = JSON.parse(jsonString);
          if (Array.isArray(parsed.questions)) {
            return parsed.questions;
          }
        } catch (innerErr) {
          return null;
        }
      }
    }
  } catch (err) {
    return null;
  }

  return null;
}
