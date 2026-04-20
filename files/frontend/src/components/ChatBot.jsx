/**
 * components/ChatBot.jsx — AI Conversational Assistant
 * ======================================================
 * Full multi-turn chat UI. Maintains conversation history,
 * handles typing indicator, quick-prompt chips, and keyboard shortcuts.
 */
import { useState, useRef, useEffect } from "react";
import { callAI } from "../utils/apiService";
import { buildSystemPrompt } from "../prompts";
import { motion, AnimatePresence } from "framer-motion";

// Quick-start prompts shown as chips below the input
const QUICK_PROMPTS = [
  { label: "AI sessions 🤖",        text: "What AI-related sessions are happening today?" },
  { label: "Low crowd zones 🗺️",    text: "Which zones are not crowded right now?" },
  { label: "I'm tired 😴",          text: "I'm exhausted — what low-effort activities do you suggest?" },
  { label: "Max points 🏅",         text: "How do I earn the most points today?" },
  { label: "Food options 🍱",       text: "Where should I eat — the Food Court seems packed?" },
  { label: "Make my schedule 📅",   text: "I have 4 hours and love AI and networking. Build my plan!" },
];

export default function ChatBot() {
  const [messages, setMessages]   = useState([{
    id: "init",
    role: "assistant",
    content: "👋 Hey! I'm **EventBot** — your AI guide for today.\n\nI know:\n• 📍 Which zones are crowded (and alternatives)\n• 🗓️ Every session, speaker, and time slot\n• 🏅 How to maximize your points\n\nWhat do you need? Try a quick prompt below, or just ask me anything!",
  }]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  
  const chatEndRef                = useRef(null);
  const inputRef                  = useRef(null);

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Send a message (from input or quick chip)
  async function send(overrideText) {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    setError(null);
    const userMsg = { id: Date.now().toString(), role: "user", content: text };
    const history = [...messages, userMsg];

    setMessages(history);
    setInput("");
    setLoading(true);
    window.speechSynthesis.cancel();
    setSpeakingId(null);

    try {
      // Pass full history so the AI maintains context across turns
      const apiMessages = history.map(m => ({ role: m.role, content: m.content }));
      const reply = await callAI(apiMessages, buildSystemPrompt(), 1000);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: `⚠️ Oops! ${err.message}\n\nCheck your API key in the \`.env\` file.`,
      }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function toggleSpeech(msgId, content) {
    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 1.1;
      utterance.onend = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(msgId);
    }
  }

  return (
    <motion.div 
      className="chat-page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── MESSAGE THREAD ───────────────────────── */}
      <div className="chat-messages">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              className={`msg-row ${msg.role}`}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {msg.role === "assistant" && (
                <div className="msg-avatar">🤖</div>
              )}
              <div className="msg-bubble" style={{ position: "relative" }}>
                {msg.role === "assistant" && (
                  <button 
                    onClick={() => toggleSpeech(msg.id, msg.content)}
                    style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", cursor: "pointer", opacity: 0.7 }}
                    title="Read aloud"
                  >
                    {speakingId === msg.id ? "⏹️" : "🔊"}
                  </button>
                )}
                {/* Simple markdown-lite: bold and line breaks */}
                {msg.content.split("\n").map((line, j) => (
                  <p key={j} style={{ margin: "0 0 4px", paddingRight: msg.role === "assistant" ? "20px" : "0" }}>
                    {line.split(/\*\*(.*?)\*\*/).map((part, k) =>
                      k % 2 === 1
                        ? <strong key={k}>{part}</strong>
                        : part
                    )}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <motion.div 
              className="msg-row assistant"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="msg-avatar">🤖</div>
              <div className="msg-bubble typing-bubble">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* ── QUICK PROMPTS ─────────────────────────── */}
      <div className="quick-chips">
        {QUICK_PROMPTS.map(q => (
          <motion.button
            key={q.label}
            className="chip"
            onClick={() => send(q.text)}
            disabled={loading}
            whileTap={{ scale: 0.95 }}
          >
            {q.label}
          </motion.button>
        ))}
      </div>

      {/* ── INPUT BAR ─────────────────────────────── */}
      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask EventBot anything... (Enter to send)"
          rows={1}
        />
        <motion.button
          className={`send-btn ${loading || !input.trim() ? "disabled" : ""}`}
          onClick={() => send()}
          disabled={loading || !input.trim()}
          whileTap={{ scale: 0.95 }}
        >
          ➤
        </motion.button>
      </div>
    </motion.div>
  );
}
