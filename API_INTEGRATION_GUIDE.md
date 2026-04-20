# API Integration Guide — AI Event Platform

## Overview

This platform integrates with **Anthropic's Claude API** for all AI features.
The same API key works for both direct browser calls (hackathon mode) and server-side proxy (production mode).

---

## 1. Getting Your API Key

1. Visit https://console.anthropic.com
2. Sign up / log in
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-`)

---

## 2. Direct Browser Integration (Hackathon Mode)

Used in `frontend/src/utils/apiService.js`:

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "sk-ant-YOUR_KEY",
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",  // ← Required for CORS
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: "You are EventBot...",
    messages: [{ role: "user", content: "Which sessions are AI-related?" }],
  }),
});

const data = await response.json();
const text = data.content[0].text;  // ← AI response here
```

**⚠️ Warning**: Direct browser access exposes your API key. Use only for demos/hackathons. In production, always proxy through your backend.

---

## 3. Server-Side Proxy (Production Mode)

Used in `backend/controllers/aiController.js`:

```javascript
const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1000,
  system: systemPrompt,
  messages: conversationHistory,
});

const text = response.content[0].text;
```

Frontend calls your backend instead of Anthropic directly:
```javascript
// In apiService.js — switch to this for production:
const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages, systemPrompt }),
});
const data = await response.json();
return data.content;
```

---

## 4. Multi-Turn Conversation

Claude has no built-in memory. Send the full history each call:

```javascript
// Good — full history maintained
const history = [
  { role: "user",      content: "What AI sessions are there?" },
  { role: "assistant", content: "There's Build with LLMs at 10am..." },
  { role: "user",      content: "Which of those is least crowded?" },  // ← new message
];

await client.messages.create({ messages: history, ... });
```

---

## 5. Prompt Engineering Patterns Used

### System Prompt Injection
Every call includes the full event context in the system prompt:
- Live crowd levels for all 6 zones
- Complete session schedule with times, speakers, tags, and points
- Behavioral rules (routing logic, tone, response format)

### Structured Output Requests
For the planner, we ask Claude to follow a strict format:
```
📅 YOUR PERSONALIZED ITINERARY
━━━━━━━━━━━━━━━━━━━━━━━━━
[Time] | [Session] | [Zone] (crowd) | [Points] pts
💡 Tip: [practical tip]
```

### Conditional Logic in Prompts
```
- If energy ≤ 2: skip Main Stage, route to Demo Zone or Workshop Hall
- If Food Court crowded: suggest alternatives near Demo Zone
- If session is crowded: always provide one alternative
```

---

## 6. Response Handling

```javascript
const data = await response.json();

// Single text response (most calls)
const text = data.content[0].text;

// With error handling
const text = data.content?.[0]?.text || "Sorry, try again.";

// Check for API errors
if (!response.ok) {
  const err = await response.json();
  throw new Error(err.error?.message || `Error ${response.status}`);
}
```

---

## 7. Rate Limits & Costs

| Model | Input tokens | Output tokens | Context window |
|---|---|---|---|
| claude-sonnet-4-20250514 | ~$3/M | ~$15/M | 200K tokens |

For a full-day event with 100 users:
- Estimated calls: ~300-500
- Estimated cost: ~$2-5
- Each conversation stays well under 10K tokens

---

## 8. Optional: Firebase Integration

```javascript
// Install: npm install firebase
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const app = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // ... other config
});

const db = getFirestore(app);

// Save check-in
await setDoc(doc(db, "checkins", `${userId}_${sessionId}`), {
  userId, sessionId, timestamp: new Date(), points: session.points
});

// Load user stats
const snap = await getDoc(doc(db, "users", userId));
const stats = snap.data();
```

---

## 9. Optional: MongoDB Integration (Backend)

```javascript
// Install: npm install mongoose
const mongoose = require("mongoose");
await mongoose.connect(process.env.MONGODB_URI);

const CheckinSchema = new mongoose.Schema({
  userId: String, sessionId: Number, points: Number, timestamp: Date,
});
const Checkin = mongoose.model("Checkin", CheckinSchema);

// Save
await Checkin.create({ userId, sessionId, points, timestamp: new Date() });

// Load
const checkins = await Checkin.find({ userId });
```
