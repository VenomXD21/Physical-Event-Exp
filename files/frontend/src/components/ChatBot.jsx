/**
 * components/ChatBot.jsx — AI Conversational Assistant
 * ======================================================
 * Full multi-turn chat UI. Maintains conversation history,
 * handles typing indicator, quick-prompt chips, and keyboard shortcuts.
 */
import { useState, useRef, useEffect } from "react";
import { callClaude } from "../utils/apiService";
import { buildSystemPrompt } from "../prompts";

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
    role: "assistant",
    content: "👋 Hey! I'm **EventBot** — your AI guide for today.\n\nI know:\n• 📍 Which zones are crowded (and alternatives)\n• 🗓️ Every session, speaker, and time slot\n• 🏅 How to maximize your points\n\nWhat do you need? Try a quick prompt below, or just ask me anything!",
  }]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const chatEndRef                = useRef(null);
  const inputRef                  = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Send a message (from input or quick chip)
  async function send(overrideText) {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    setError(null);
    const userMsg = { role: "user", content: text };
    const history = [...messages, userMsg];

    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      // Pass full history so Claude maintains context across turns
      const apiMessages = history.map(m => ({ role: m.role, content: m.content }));
      const reply = await callClaude(apiMessages, buildSystemPrompt(), 1000);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, {
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

  return (
    <div className="chat-page">
      {/* ── MESSAGE THREAD ───────────────────────── */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`msg-row ${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="msg-avatar">🤖</div>
            )}
            <div className="msg-bubble">
              {/* Simple markdown-lite: bold and line breaks */}
              {msg.content.split("\n").map((line, j) => (
                <p key={j} style={{ margin: "0 0 4px" }}>
                  {line.split(/\*\*(.*?)\*\*/).map((part, k) =>
                    k % 2 === 1
                      ? <strong key={k}>{part}</strong>
                      : part
                  )}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="msg-row assistant">
            <div className="msg-avatar">🤖</div>
            <div className="msg-bubble typing-bubble">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── QUICK PROMPTS ─────────────────────────── */}
      <div className="quick-chips">
        {QUICK_PROMPTS.map(q => (
          <button
            key={q.label}
            className="chip"
            onClick={() => send(q.text)}
            disabled={loading}
          >
            {q.label}
          </button>
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
        <button
          className={`send-btn ${loading || !input.trim() ? "disabled" : ""}`}
          onClick={() => send()}
          disabled={loading || !input.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
