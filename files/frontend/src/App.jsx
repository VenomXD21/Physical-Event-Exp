/**
 * App.js — Main Application Shell
 * =================================
 * Handles tab navigation, global state (points, check-ins),
 * and renders all major views.
 */
import { useState } from "react";
import ChatBot from "./components/ChatBot";
import SmartPlanner from "./components/SmartPlanner";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Schedule from "./components/Schedule";
import Rewards from "./components/Rewards";
import { EVENT_META, SCHEDULE, BADGES } from "./data/eventData";
import { AnimatePresence } from "framer-motion";
import "./index.css";

const TABS = [
  { id: "dashboard", label: "Dashboard",    icon: "🏠" },
  { id: "chat",      label: "AI Assistant", icon: "🤖" },
  { id: "planner",   label: "Smart Planner",icon: "📅" },
  { id: "schedule",  label: "Schedule",     icon: "⏰" },
  { id: "navigate",  label: "Navigation",   icon: "🗺️" },
  { id: "rewards",   label: "Rewards",      icon: "🎮" },
];

export default function App() {
  const [activeTab, setActiveTab]   = useState("dashboard");
  const [points, setPoints]         = useState(0);
  const [checkedIn, setCheckedIn]   = useState(new Set());
  const [mySchedule, setMySchedule] = useState([]);

  // Shared check-in handler passed to Schedule + Dashboard
  function handleCheckIn(session) {
    if (checkedIn.has(session.id)) return;
    setCheckedIn(prev => new Set([...prev, session.id]));
    setPoints(prev => prev + session.points);
    setMySchedule(prev => [...prev, session]);
  }

  const earnedBadges = BADGES.filter(b => checkedIn.size >= b.threshold);

  return (
    <div className="app">
      {/* ── HEADER ─────────────────────────────────── */}
      <header className="header">
        <div className="header-brand">
          <div className="brand-icon">⚡</div>
          <div>
            <div className="brand-name">{EVENT_META.name}</div>
            <div className="brand-sub">{EVENT_META.venue} · {EVENT_META.date}</div>
          </div>
        </div>
        <div className="header-right">
          <div className="points-badge">🏅 {points} pts</div>
          {earnedBadges.length > 0 && (
            <div className="earned-badges">
              {earnedBadges.map(b => (
                <span key={b.id} title={b.name}>{b.icon}</span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── TABS ──────────────────────────────────── */}
      <nav className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── CONTENT ───────────────────────────────── */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <Dashboard
              key="dashboard"
              points={points}
              checkedIn={checkedIn}
              earnedBadges={earnedBadges}
              onCheckIn={handleCheckIn}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === "chat"     && <ChatBot key="chat" />}
          {activeTab === "planner"  && <SmartPlanner key="planner" />}
          {activeTab === "schedule" && (
            <Schedule key="schedule" checkedIn={checkedIn} onCheckIn={handleCheckIn} />
          )}
          {activeTab === "navigate" && <Navigation key="navigate" />}
          {activeTab === "rewards"  && (
            <Rewards key="rewards" points={points} checkedIn={checkedIn} mySchedule={mySchedule} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
