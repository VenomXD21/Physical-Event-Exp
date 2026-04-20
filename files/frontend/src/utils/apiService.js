/**
 * utils/apiService.js — Google Gemini API Integration Layer
 * =========================================================
 * Wraps all Gemini API calls with error handling.
 */

const MODEL = "gemini-1.5-flash";

/**
 * Core multi-turn chat function
 * @param {Array}  messages    - Full conversation history [{role, content}]
 * @param {string} systemPrompt - Event context injected at system level
 * @param {number} maxTokens   - Max response length (default 1000)
 */
export async function callAI(messages, systemPrompt, maxTokens = 1000) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "AIzaSyYOUR_KEY_HERE") {
    throw new Error("Add your Gemini API key to frontend/.env as VITE_GEMINI_API_KEY");
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  // Map roles to Gemini roles (assistant -> model)
  const geminiMessages = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: maxTokens,
      }
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API Error ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
}

/**
 * Single-turn helper — no history needed
 * @param {string} prompt      - User message
 * @param {string} systemPrompt - Context
 */
export async function askAI(prompt, systemPrompt, maxTokens = 800) {
  return callAI([{ role: "user", content: prompt }], systemPrompt, maxTokens);
}
