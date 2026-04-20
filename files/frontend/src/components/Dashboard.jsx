/**
 * components/Dashboard.jsx — Live Event Overview
 * ================================================
 * Shows zone crowd status, quick stats, and upcoming sessions.
 * First screen users see — must be informative at a glance.
 */
import { SCHEDULE } from "../data/eventData";
import useLiveCrowd from "../hooks/useLiveCrowd";
import { motion, AnimatePresence } from "framer-motion";

function getCrowdColor(status) {
  return { crowded: "#ef4444", moderate: "#f59e0b", free: "#10b981" }[status] || "#888";
}
function getCrowdLabel(status) {
  return { crowded: "Packed", moderate: "Busy", free: "Open" }[status] || status;
}
function getCrowdPct(zone) {
  return Math.round((zone.current / zone.capacity) * 100);
}

export default function Dashboard({ points, checkedIn, earnedBadges, onCheckIn, onNavigate }) {
  const upcomingSessions = SCHEDULE.slice(0, 4);
  const liveZones = useLiveCrowd();

  return (
    <motion.div 
      className="page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h2>Live Event Overview</h2>
        <p>Real-time crowd status across all zones</p>
      </div>

      {/* ── STATS ROW ─────────────────────────────── */}
      <div className="stats-grid">
        {[
          { label: "Sessions Today", value: SCHEDULE.length,    icon: "🎯" },
          { label: "Your Points",    value: points,             icon: "⭐" },
          { label: "Checked In",     value: checkedIn.size,     icon: "✅" },
          { label: "Badges Earned",  value: earnedBadges.length, icon: "🏅" },
        ].map((s, i) => (
          <motion.div 
            key={s.label} 
            className="stat-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── ZONE GRID ─────────────────────────────── */}
      <div className="section-title">Zone Status (Live)</div>
      <div className="zone-grid">
        <AnimatePresence>
          {liveZones.map((zone, i) => {
            const pct = getCrowdPct(zone);
            const color = getCrowdColor(zone.status);
            return (
              <motion.div 
                key={zone.id} 
                className="zone-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                layout
              >
                <div className="zone-card-accent" style={{ background: zone.color }} />
                <div className="zone-card-top">
                  <div>
                    <div className="zone-emoji">{zone.emoji}</div>
                    <div className="zone-name">{zone.name}</div>
                  </div>
                  <motion.span 
                    className="crowd-badge"
                    animate={{ background: `${color}22`, color, borderColor: `${color}44` }}
                    style={{ border: "1px solid" }}
                  >
                    {getCrowdLabel(zone.status)}
                  </motion.span>
                </div>
                <div className="crowd-bar-bg">
                  <div className="crowd-bar-fill"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}88)` }} />
                </div>
                <div className="crowd-count">{zone.current}/{zone.capacity} · {pct}%</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── UPCOMING ──────────────────────────────── */}
      <div className="section-title">🔥 Up Next</div>
      <div className="upcoming-list">
        {upcomingSessions.map((session, i) => {
          const zone = liveZones.find(z => z.id === session.zone);
          const done = checkedIn.has(session.id);
          return (
            <motion.div 
              key={session.id} 
              className={`upcoming-item ${done ? "done" : ""}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="session-time">{session.time}</div>
              <div className="session-info">
                <div className="session-title">{session.title}</div>
                <div className="session-meta">
                  {zone?.emoji} {zone?.name} · +{session.points}pts
                </div>
              </div>
              <motion.button
                className={`checkin-btn ${done ? "done" : ""}`}
                onClick={() => onCheckIn(session)}
                disabled={done}
                whileTap={{ scale: 0.95 }}
              >
                {done ? "✓ Done" : "Check In"}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* ── CTA BUTTONS ───────────────────────────── */}
      <div className="cta-row">
        <motion.button className="cta-btn primary" onClick={() => onNavigate("chat")} whileTap={{ scale: 0.97 }}>
          🤖 Ask AI Assistant
        </motion.button>
        <motion.button className="cta-btn secondary" onClick={() => onNavigate("planner")} whileTap={{ scale: 0.97 }}>
          📅 Build My Schedule
        </motion.button>
      </div>
    </motion.div>
  );
}
