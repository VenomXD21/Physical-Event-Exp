/**
 * components/Dashboard.jsx — Live Event Overview
 * ================================================
 * Shows zone crowd status, quick stats, and upcoming sessions.
 * First screen users see — must be informative at a glance.
 */
import { ZONES, SCHEDULE } from "../data/eventData";

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

  return (
    <div className="page">
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
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── ZONE GRID ─────────────────────────────── */}
      <div className="section-title">Zone Status</div>
      <div className="zone-grid">
        {ZONES.map(zone => {
          const pct = getCrowdPct(zone);
          const color = getCrowdColor(zone.status);
          return (
            <div key={zone.id} className="zone-card">
              <div className="zone-card-accent" style={{ background: zone.color }} />
              <div className="zone-card-top">
                <div>
                  <div className="zone-emoji">{zone.emoji}</div>
                  <div className="zone-name">{zone.name}</div>
                </div>
                <span className="crowd-badge"
                  style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
                  {getCrowdLabel(zone.status)}
                </span>
              </div>
              <div className="crowd-bar-bg">
                <div className="crowd-bar-fill"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}88)` }} />
              </div>
              <div className="crowd-count">{zone.current}/{zone.capacity} · {pct}%</div>
            </div>
          );
        })}
      </div>

      {/* ── UPCOMING ──────────────────────────────── */}
      <div className="section-title">🔥 Up Next</div>
      <div className="upcoming-list">
        {upcomingSessions.map(session => {
          const zone = ZONES.find(z => z.id === session.zone);
          const done = checkedIn.has(session.id);
          return (
            <div key={session.id} className={`upcoming-item ${done ? "done" : ""}`}>
              <div className="session-time">{session.time}</div>
              <div className="session-info">
                <div className="session-title">{session.title}</div>
                <div className="session-meta">
                  {zone?.emoji} {zone?.name} · +{session.points}pts
                </div>
              </div>
              <button
                className={`checkin-btn ${done ? "done" : ""}`}
                onClick={() => onCheckIn(session)}
                disabled={done}
              >
                {done ? "✓ Done" : "Check In"}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── CTA BUTTONS ───────────────────────────── */}
      <div className="cta-row">
        <button className="cta-btn primary" onClick={() => onNavigate("chat")}>
          🤖 Ask AI Assistant
        </button>
        <button className="cta-btn secondary" onClick={() => onNavigate("planner")}>
          📅 Build My Schedule
        </button>
      </div>
    </div>
  );
}
