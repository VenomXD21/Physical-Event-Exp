# ⚡ AI-Powered Physical Event Experience Platform

A hackathon-ready, full-stack event assistant platform powered by Claude (Anthropic AI).

## 🎯 Features
- **AI Chat Assistant** — Conversational bot aware of crowd levels, schedule, and user needs
- **Smart Planner** — Personalized itinerary generator using interests + energy level
- **Zone Navigation** — Real-time crowd-aware routing between event zones
- **Gamification** — Points, badges, and simulated QR check-ins
- **Live Dashboard** — Zone capacity, crowd status, upcoming sessions

## 🏗️ Architecture
```
event-platform/
├── frontend/              # React.js app
│   └── src/
│       ├── components/    # ChatBot, SmartPlanner, Navigation
│       ├── data/          # eventData.js (sample data)
│       ├── prompts/       # AI prompt templates
│       └── utils/         # apiService.js (Anthropic API)
├── backend/               # Node.js + Express API
│   ├── routes/            # /ai, /events, /checkin
│   ├── controllers/       # Business logic
│   └── data/              # sampleData.js
├── .env.example           # Environment variable template
└── README.md
```

## 🚀 Quick Start (5 minutes)

### 1. Clone & Install
```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 2. Set Environment Variables
```bash
# Copy and fill in your Anthropic API key
cp .env.example frontend/.env
cp .env.example backend/.env
# Edit both files and add: ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

Visit: http://localhost:3000

## 🎪 Hackathon Demo Mode
For demos, the app also works as a **single React artifact** (no backend needed) — see `EventPlatform.jsx`. It calls the Anthropic API directly from the browser.

## 🔑 API Key
Get your free Anthropic API key at: https://console.anthropic.com

## 🧠 AI Prompts
All prompts are in `frontend/src/prompts/index.js`:
- `buildSystemPrompt()` — Context + crowd data injected every call
- `buildPlannerPrompt()` — Personalized itinerary generation
- `buildNavigationPrompt()` — Zone-to-zone routing
- `buildAdaptationPrompt()` — Real-time state-based suggestions

## 📊 Sample Data
Event data is in `frontend/src/data/eventData.js`. Modify to match your real event.

## 🔌 API Endpoints (Backend)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/chat | AI chat messages |
| POST | /api/ai/plan | Generate itinerary |
| POST | /api/ai/navigate | Get directions |
| GET | /api/events/schedule | Full schedule |
| GET | /api/events/zones | Zone + crowd data |
| POST | /api/checkin | Check in to session |
| GET | /api/checkin/stats/:userId | User points & badges |
