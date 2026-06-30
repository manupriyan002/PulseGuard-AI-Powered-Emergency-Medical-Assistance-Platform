/**
 * PulseGuard AI — Multi-Provider Abstraction Layer
 *
 * Routes AI triage calls to the configured provider based on the
 * AI_PROVIDER environment variable: "gemini" | "openai"
 *
 * Each provider receives the system prompt, user message, and
 * optional conversation history, then returns the raw AI text response.
 */

// ─── Provider: Google Gemini ──────────────────────────────────────────

async function callGemini(systemPrompt, userMessage, conversationHistory = []) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });

  // Build contents array from conversation history
  const contents = [];

  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  }

  // Add the current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const result = await model.generateContent({ contents });
  const response = result.response;
  return response.text();
}

// ─── Provider: OpenAI ─────────────────────────────────────────────────

async function callOpenAI(systemPrompt, userMessage, conversationHistory = []) {
  const OpenAI = require('openai');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Build messages array
  const messages = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    });
  }

  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    temperature: 0.3,
    max_tokens: 2000,
  });

  return completion.choices[0]?.message?.content || '';
}

// ─── Main Dispatcher ──────────────────────────────────────────────────

/**
 * Call the configured AI provider.
 *
 * @param {string} systemPrompt         - The full PulseGuard system prompt
 * @param {string} userMessage          - Assembled user message with context
 * @param {Array}  conversationHistory  - Previous messages [{role, text}, ...]
 * @returns {Promise<string>} Raw text response from the AI
 * @throws {Error} If the provider is unknown or the API call fails
 */
async function callAI(systemPrompt, userMessage, conversationHistory = []) {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();

  console.log(`[Triage AI] Using provider: ${provider}`);

  switch (provider) {
    case 'gemini':
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in environment variables.');
      }
      return callGemini(systemPrompt, userMessage, conversationHistory);

    case 'openai':
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set in environment variables.');
      }
      return callOpenAI(systemPrompt, userMessage, conversationHistory);

    default:
      throw new Error(`Unknown AI_PROVIDER: "${provider}". Supported: gemini, openai`);
  }
}

module.exports = { callAI };
