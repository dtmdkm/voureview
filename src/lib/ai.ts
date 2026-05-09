import { Setting } from '@/models';
import { connectToDatabase } from './mongodb';

export async function getAISettings() {
  await connectToDatabase();
  const settings = await Setting.find({
    key: { $in: ['openai_api_key', 'openai_model', 'openai_base_url', 'gemini_api_key', 'gemini_model'] }
  });

  const settingsObj: any = {};
  settings.forEach(s => {
    settingsObj[s.key] = s.value;
  });

  return {
    openaiKey: settingsObj.openai_api_key || process.env.OPENAI_API_KEY,
    openaiModel: settingsObj.openai_model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    openaiBaseUrl: settingsObj.openai_base_url || 'https://api.openai.com/v1',
    geminiKey: settingsObj.gemini_api_key || process.env.GEMINI_API_KEY,
    geminiModel: settingsObj.gemini_model || process.env.GEMINI_MODEL || 'gemini-pro'
  };
}

export async function generateWithAI(prompt: string, options: { maxTokens?: number, temperature?: number } = {}) {
  const settings = await getAISettings();

  // Prefer OpenAI as per original template logic, but easy to switch
  if (settings.openaiKey) {
    const response = await fetch(`${settings.openaiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.openaiKey}`
      },
      body: JSON.stringify({
        model: settings.openaiModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } else if (settings.geminiKey) {
    // Fallback to Gemini implementation if OpenAI key is missing
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.geminiModel}:generateContent?key=${settings.geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error('No AI API keys configured. Please add OPENAI_API_KEY or GEMINI_API_KEY to Settings or .env');
}
