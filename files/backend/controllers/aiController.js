/**
 * controllers/aiController.js — Secure server-side AI calls
 * ==========================================================
 * API key stays on server — never exposed to browser bundle.
 * Handles chat, planner, and navigation requests.
 */
const Anthropic = require("@anthropic-ai/sdk");

// Initialized once — reused for all requests
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-20250514";

// ── CHAT HANDLER ──────────────────────────────────────────────────────────────
// POST /api/ai/chat
// Body: { messages: [{role, content}], systemPrompt: string }
async function chatHandler(req, res, next) {
  try {
    const { messages, systemPrompt } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: systemPrompt || "You are a helpful event assistant.",
      messages,
    });

    res.json({ content: response.content[0].text });
  } catch (err) {
    next(err);
  }
}

// ── PLANNER HANDLER ───────────────────────────────────────────────────────────
// POST /api/ai/plan
// Body: { interests, hoursAvailable, energyLevel }
async function plannerHandler(req, res, next) {
  try {
    const { interests, hoursAvailable, energyLevel, systemPrompt } = req.body;

    if (!interests) return res.status(400).json({ error: "interests field required" });

    // Planner-specific user prompt
    const userPrompt = `Create a ${hoursAvailable}h event plan for someone interested in: ${interests}. Energy: ${energyLevel}/5.`;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: systemPrompt || "You are an event planning assistant.",
      messages: [{ role: "user", content: userPrompt }],
    });

    res.json({ plan: response.content[0].text });
  } catch (err) {
    next(err);
  }
}

// ── NAVIGATION HANDLER ────────────────────────────────────────────────────────
// POST /api/ai/navigate
// Body: { from, to, reason, systemPrompt }
async function navigationHandler(req, res, next) {
  try {
    const { from, to, reason, systemPrompt } = req.body;

    if (!from || !to) return res.status(400).json({ error: "from and to zones required" });

    const userPrompt = `How do I get from ${from} to ${to}? Reason: ${reason || "attending a session"}`;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: systemPrompt || "You are an event navigation assistant.",
      messages: [{ role: "user", content: userPrompt }],
    });

    res.json({ directions: response.content[0].text });
  } catch (err) {
    next(err);
  }
}

module.exports = { chatHandler, plannerHandler, navigationHandler };
