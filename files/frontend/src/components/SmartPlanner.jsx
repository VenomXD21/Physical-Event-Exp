/**
 * components/SmartPlanner.jsx — AI-Powered Itinerary Generator
 * =============================================================
 * Collects user preferences via a rich form, then calls Claude
 * to generate a personalized event plan.
 */
import { useState, useEffect } from "react";
import { askAI } from "../utils/apiService";
import { buildPlannerPrompt, buildSystemPrompt } from "../prompts";
import { motion, AnimatePresence } from "framer-motion";

const INTEREST_TAGS = [
  { tag: "AI",           emoji: "🤖" },
  { tag: "Startup",      emoji: "🚀" },
  { tag: "Cloud",        emoji: "☁️" },
  { tag: "Blockchain",   emoji: "⛓️" },
  { tag: "Networking",   emoji: "🤝" },
  { tag: "Technical",    emoji: "⚙️" },
  { tag: "Leadership",   emoji: "👔" },
  { tag: "Hackathon",    emoji: "💻" },
];

const ENERGY_LABELS = ["", "😴 Dead tired", "🥱 Low energy", "😐 Moderate", "😊 Energized", "🔥 Let's go!"];

export default function SmartPlanner() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [customInterest, setCustomInterest] = useState("");
  const [hours, setHours]           = useState("4");
  const [energy, setEnergy]         = useState(3);
  const [result, setResult]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  function toggleTag(tag) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function getInterests() {
    const tags = [...selectedTags];
    if (customInterest.trim()) tags.push(customInterest.trim());
    return tags.join(", ");
  }

  async function generatePlan() {
    const interests = getInterests();
    if (!interests) {
      alert("Please select at least one interest or type your own.");
      return;
    }
    setLoading(true);
    setResult("");
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    try {
      const prompt = buildPlannerPrompt({
        interests,
        hoursAvailable: hours,
        energyLevel: energy,
      });
      const plan = await askAI(prompt, buildSystemPrompt(), 900);
      setResult(plan);
    } catch (err) {
      setResult(`⚠️ Error: ${err.message}`);
    }
    setLoading(false);
  }

  function toggleSpeech() {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (result) {
      const utterance = new SpeechSynthesisUtterance(result);
      utterance.rate = 1.1; // Slightly faster to sound natural
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
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
        <h2>Smart Event Planner</h2>
        <p>Tell us about yourself — we'll build your perfect day</p>
      </div>

      <div className="planner-form">
        {/* ── INTERESTS ──────────────────────────── */}
        <div className="form-field">
          <label className="form-label">🎯 Your Interests</label>
          <div className="tag-grid">
            {INTEREST_TAGS.map(({ tag, emoji }) => (
              <motion.button
                key={tag}
                className={`interest-tag ${selectedTags.includes(tag) ? "selected" : ""}`}
                onClick={() => toggleTag(tag)}
                whileTap={{ scale: 0.95 }}
              >
                {emoji} {tag}
              </motion.button>
            ))}
          </div>
          <input
            className="text-input"
            value={customInterest}
            onChange={e => setCustomInterest(e.target.value)}
            placeholder="Or type your own interest (e.g. DevOps, Design)..."
          />
        </div>

        {/* ── TIME + ENERGY ──────────────────────── */}
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">⏱ Time Available</label>
            <select
              className="select-input"
              value={hours}
              onChange={e => setHours(e.target.value)}
            >
              {["2", "3", "4", "5", "6", "8"].map(h => (
                <option key={h} value={h}>{h} hours</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">
              ⚡ Energy Level — <span className="energy-label">{ENERGY_LABELS[energy]}</span>
            </label>
            <input
              type="range" min="1" max="5" step="1"
              value={energy}
              onChange={e => setEnergy(Number(e.target.value))}
              className="range-input"
            />
            <div className="range-endpoints">
              <span>😴 Tired</span>
              <span>🔥 Pumped</span>
            </div>
          </div>
        </div>

        {/* ── GENERATE BUTTON ────────────────────── */}
        <motion.button
          className={`generate-btn ${loading ? "loading" : ""}`}
          onClick={generatePlan}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? "✨ Building your perfect day..." : "✨ Generate My Personalized Plan"}
        </motion.button>
      </div>

      {/* ── RESULT ─────────────────────────────── */}
      <AnimatePresence>
        {result && (
          <motion.div 
            className="plan-result"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <div className="plan-result-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              📋 Your Personalized Itinerary
              <button 
                className="regenerate-btn" 
                onClick={toggleSpeech}
                style={{ padding: "4px 10px", fontSize: "16px", border: "none", background: "none" }}
                title="Read aloud"
              >
                {isSpeaking ? "⏹️" : "🔊"}
              </button>
            </div>
            <pre className="plan-text">{result}</pre>
            <button
              className="regenerate-btn"
              onClick={generatePlan}
              disabled={loading}
            >
              🔄 Regenerate
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
