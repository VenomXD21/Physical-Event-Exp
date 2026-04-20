/**
 * utils/apiService.js — Anthropic API Integration Layer
 * ======================================================
 * Wraps all Claude API calls with error handling.
 *
 * IMPORTANT: For production, proxy through your backend (backend/routes/ai.js)
 * so the API key is never exposed in the browser bundle.
 * For hackathon demos, direct browser calls work fine.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

/**
 * Core multi-turn chat function
 * @param {Array}  messages    - Full conversation history [{role, content}]
 * @param {string} systemPrompt - Event context injected at system level
 * @param {number} maxTokens   - Max response length (default 1000)
 */
export async function callClaude(messages, systemPrompt, maxTokens = 1000) {
  // API key: set VITE_ANTHROPIC_API_KEY in your .env file
  // OR replace this line with your backend URL: fetch(`${import.meta.env.VITE_API_URL}/ai/chat`, ...)
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "sk-ant-YOUR_KEY_HERE") {
    throw new Error("Add your Anthropic API key to frontend/.env as VITE_ANTHROPIC_API_KEY");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true", // Required for browser calls
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API Error ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "Sorry, I couldn't generate a response.";
}

/**
 * Single-turn helper — no history needed
 * @param {string} prompt      - User message
 * @param {string} systemPrompt - Context
 */
export async function askClaude(prompt, systemPrompt, maxTokens = 800) {
  return callClaude([{ role: "user", content: prompt }], systemPrompt, maxTokens);
}
