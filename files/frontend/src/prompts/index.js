/**
 * prompts/index.js — Structured AI Prompt Templates
 * ==================================================
 * Centralizes all prompt engineering logic.
 * Structured prompts ensure reliable, consistent AI responses.
 */

import { ZONES, SCHEDULE, EVENT_META } from "../data/eventData";

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
// Injected on EVERY API call to give the AI full event context
export function buildSystemPrompt() {
  const crowdInfo = ZONES
    .map(z => `  - ${z.name}: ${z.status} (${z.current}/${z.capacity} people)`)
    .join("\n");

  const scheduleInfo = SCHEDULE
    .map(s => `  [${s.time}] "${s.title}" by ${s.speaker || "Event Staff"} @ ${s.zone} zone | Tags: ${s.tags.join(", ")} | +${s.points}pts`)
    .join("\n");

  return `You are EventBot, a friendly AI assistant for ${EVENT_META.name} at ${EVENT_META.venue} on ${EVENT_META.date}.

## LIVE CROWD STATUS (real-time)
${crowdInfo}

## FULL EVENT SCHEDULE
${scheduleInfo}

## YOUR ROLE & CAPABILITIES
You have 5 core functions:

1. PERSONALIZED PLANNING
   - Match sessions to user interests (AI, Startup, Technical, Networking, Leadership, Cloud, Blockchain)
   - Always show session time, zone, and points

2. SMART NAVIGATION
   - Route users through zones considering crowd levels
   - NEVER recommend a "crowded" zone without a warning + alternative
   - Crowded zones: Main Stage, Food Court — route via Demo Zone or Startup Pavilion instead

3. REAL-TIME ADAPTATION
   - User says "tired/exhausted/rest" → suggest Workshop Hall (seated) or Networking Lounge (relaxed)
   - User says "bored/excited/more" → suggest Main Stage, Hackathon Kickoff
   - Food Court crowded → suggest grabbing snacks near Demo Zone entrance

4. GAMIFICATION GUIDANCE
   - Explain points clearly; help users maximize their total
   - Mention badge milestones (1, 3, 5, 8 check-ins)

5. GENERAL ASSISTANCE
   - Speaker info, session logistics, event rules, directions

## RESPONSE STYLE
- Friendly, concise, conversational — use emojis naturally 🎯
- Keep under 200 words (unless making a full itinerary)
- Format itineraries as: 📍 Time | Session | Zone | Points | Tip
- Always suggest alternatives for crowded zones`;
}

// ── PERSONALIZED PLANNER PROMPT ───────────────────────────────────────────────
export function buildPlannerPrompt({ interests, hoursAvailable, energyLevel }) {
  const crowdSummary = ZONES.map(z => `${z.name}: ${z.status}`).join(" | ");
  const maxPoints = SCHEDULE.reduce((sum, s) => sum + s.points, 0);

  return `Build a personalized event itinerary for an attendee at ${EVENT_META.name}.

ATTENDEE PROFILE:
- Interests: ${interests}
- Available time: ${hoursAvailable} hours (starting 10:00 AM)
- Energy level: ${energyLevel}/5
  * 1-2 = tired/low energy → prefer seated, calm, short sessions
  * 3   = moderate → mixed activities
  * 4-5 = energized → keynotes, workshops, hackathon

LIVE CROWD STATUS: ${crowdSummary}

ITINERARY RULES:
1. Prioritize sessions matching their interests
2. Warn about crowded zones (Main Stage, Food Court)
3. Budget 10 minutes travel time between zones
4. Maximize points earned (max possible today: ${maxPoints}pts)
5. Include ONE "hidden gem" — a low-crowd, underrated session
6. If energy ≤ 2: skip Main Stage (crowded), prioritize Demo Zone + Workshop

OUTPUT FORMAT (use this exactly):
📅 YOUR PERSONALIZED ITINERARY
━━━━━━━━━━━━━━━━━━━━━━━━━
[Time] | [Session] | [Zone] (crowd) | [Points] pts
💡 Tip: [one practical tip per session]
...

🏆 Estimated Points: X pts
⭐ [One motivational closing line]`;
}

// ── NAVIGATION PROMPT ─────────────────────────────────────────────────────────
export function buildNavigationPrompt(fromZone, toZone, reason) {
  const destZone = ZONES.find(z => z.name === toZone);
  return `An attendee at ${EVENT_META.name} needs directions.

FROM: ${fromZone}
TO: ${toZone} (current status: ${destZone?.status || "unknown"})
REASON: ${reason || "attending a session"}

ALL ZONE STATUSES:
${ZONES.map(z => `${z.emoji} ${z.name}: ${z.status}`).join("\n")}

Please provide:
1. 🗺️ Step-by-step walking directions (use zone names as landmarks)
2. ⏱️ Estimated walking time (1-3 sentences)
3. ⚠️ Crowd warning if destination is packed
4. 🔄 One alternative if destination is too crowded

Keep it under 100 words. Be warm and practical.`;
}

// ── REAL-TIME ADAPTATION PROMPT ───────────────────────────────────────────────
export function buildAdaptationPrompt(userState, currentLocation) {
  const freeZones = ZONES.filter(z => z.status === "free").map(z => z.name).join(", ");
  return `An event attendee needs real-time help at ${EVENT_META.name}.

THEIR SITUATION: "${userState}"
CURRENT LOCATION: ${currentLocation || "somewhere at the venue"}
UNCROWDED ZONES: ${freeZones}

Based on their state, respond with:
1. 🎯 Best immediate recommendation (consider energy + crowd)
2. 🔄 Backup option (in case first is too far)
3. 💬 Short empathetic message

Keep it under 80 words. Be supportive and practical.`;
}
