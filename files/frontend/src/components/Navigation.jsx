/**
 * components/Navigation.jsx — Zone Map + AI Routing
 * ===================================================
 * Visual zone layout with crowd indicators.
 * AI-powered directions between any two zones.
 * Real-time adaptation: warns about crowded zones, suggests alternatives.
 */
import { useState } from "react";
import useLiveCrowd from "../hooks/useLiveCrowd";
import { askAI } from "../utils/apiService";
import { buildNavigationPrompt, buildAdaptationPrompt, buildSystemPrompt } from "../prompts";
import { motion, AnimatePresence } from "framer-motion";

function getCrowdColor(status) {
  return { crowded: "#ef4444", moderate: "#f59e0b", free: "#10b981" }[status] || "#888";
}
function getCrowdPct(zone) {
  return Math.round((zone.current / zone.capacity) * 100);
}

// Quick situation presets for real-time adaptation
const SITUATIONS = [
  { label: "I need food 🍱",        text: "I'm hungry but the Food Court looks crowded" },
  { label: "Taking a break 😮‍💨",  text: "I need a quiet place to sit and rest for 15 minutes" },
  { label: "Lost! 🤷",              text: "I don't know where I am — how do I get to the main area?" },
  { label: "Bored, surprise me 🎲", text: "I'm bored — what's the most exciting thing happening right now?" },
];

export default function Navigation() {
  const [from, setFrom]           = useState("");
  const [to, setTo]               = useState("");
  const [reason, setReason]       = useState("");
  const [directions, setDirections] = useState("");
  const [dirLoading, setDirLoading] = useState(false);

  const [situation, setSituation] = useState("");
  const [currentLoc, setCurrentLoc] = useState("");
  const [adaptation, setAdaptation] = useState("");
  const [adaptLoading, setAdaptLoading] = useState(false);

  const liveZones = useLiveCrowd();

  // Get AI directions between two zones
  async function getDirections() {
    if (!from || !to) return;
    setDirLoading(true);
    setDirections("");
    try {
      const prompt = buildNavigationPrompt(from, to, reason);
      const result = await askAI(prompt, buildSystemPrompt(), 400);
      setDirections(result);
    } catch (err) {
      setDirections(`⚠️ ${err.message}`);
    }
    setDirLoading(false);
  }

  // Get AI adaptation suggestion based on current state
  async function getAdaptation(overrideText) {
    const text = overrideText || situation;
    if (!text) return;
    setAdaptLoading(true);
    setAdaptation("");
    setSituation(text);
    try {
      const prompt = buildAdaptationPrompt(text, currentLoc);
      const result = await askAI(prompt, buildSystemPrompt(), 300);
      setAdaptation(result);
    } catch (err) {
      setAdaptation(`⚠️ ${err.message}`);
    }
    setAdaptLoading(false);
  }

  return (
    <motion.div 
      className="page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h2>Zone Navigation</h2>
        <p>Real-time live map · AI-powered routing</p>
      </div>

      {/* ── ZONE MAP ────────────────────────────── */}
      <div className="zone-map-grid">
        <AnimatePresence>
          {liveZones.map((zone, i) => {
            const pct    = getCrowdPct(zone);
            const color  = getCrowdColor(zone.status);
            return (
              <motion.div 
                key={zone.id} 
                className="map-zone-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                layout
              >
                <div className="map-zone-top-bar" style={{ background: zone.color }} />
                <div className="map-zone-emoji">{zone.emoji}</div>
                <div className="map-zone-name">{zone.name}</div>
                <div className="map-crowd-bar-bg">
                  <div className="map-crowd-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <motion.div className="map-crowd-info" animate={{ color }}>
                  {zone.status} · {pct}%
                </motion.div>
                <div className="map-capacity">{zone.current}/{zone.capacity} people</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="nav-panels">
        {/* ── DIRECTIONS PANEL ──────────────────── */}
        <div className="nav-panel">
          <div className="nav-panel-title">🗺️ Get Directions</div>
          <div className="nav-selects">
            <select
              className="select-input"
              value={from}
              onChange={e => setFrom(e.target.value)}
            >
              <option value="">From zone...</option>
              {liveZones.map(z => (
                <option key={z.id} value={z.name}>{z.emoji} {z.name}</option>
              ))}
            </select>
            <div className="nav-arrow">→</div>
            <select
              className="select-input"
              value={to}
              onChange={e => setTo(e.target.value)}
            >
              <option value="">To zone...</option>
              {liveZones.map(z => (
                <option key={z.id} value={z.name}>{z.emoji} {z.name}</option>
              ))}
            </select>
          </div>
          <input
            className="text-input"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason (optional, e.g. 'attending keynote')"
          />
          <motion.button
            className="nav-btn"
            onClick={getDirections}
            disabled={dirLoading || !from || !to}
            whileTap={{ scale: 0.96 }}
          >
            {dirLoading ? "Finding route..." : "Get AI Directions"}
          </motion.button>
          {directions && (
            <motion.div 
              className="nav-result"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              {directions}
            </motion.div>
          )}
        </div>

        {/* ── REAL-TIME ADAPTATION PANEL ────────── */}
        <div className="nav-panel">
          <div className="nav-panel-title">⚡ Real-Time Help</div>
          <p className="nav-hint">Describe your situation and get instant AI suggestions:</p>

          <div className="situation-chips">
            {SITUATIONS.map(s => (
              <motion.button
                key={s.label}
                className="chip"
                onClick={() => getAdaptation(s.text)}
                disabled={adaptLoading}
                whileTap={{ scale: 0.95 }}
              >
                {s.label}
              </motion.button>
            ))}
          </div>

          <input
            className="text-input"
            value={currentLoc}
            onChange={e => setCurrentLoc(e.target.value)}
            placeholder="Current location (optional, e.g. 'Workshop Hall')"
          />
          <textarea
            className="text-input"
            rows={2}
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder="Or describe your situation... (e.g. 'I'm tired and need a quiet spot')"
          />
          <motion.button
            className="nav-btn"
            onClick={() => getAdaptation()}
            disabled={adaptLoading || !situation}
            whileTap={{ scale: 0.96 }}
          >
            {adaptLoading ? "Thinking..." : "Get Suggestion"}
          </motion.button>
          {adaptation && (
            <motion.div 
              className="nav-result"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              {adaptation}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
