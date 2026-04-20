/**
 * components/Schedule.jsx — Full Session Schedule + Check-ins
 * ============================================================
 * Filterable list of all sessions. Each shows crowd status,
 * tags, duration, points value, and a check-in button.
 */
import { useState } from "react";
import { ZONES, SCHEDULE } from "../data/eventData";

function getCrowdColor(status) {
  return { crowded: "#ef4444", moderate: "#f59e0b", free: "#10b981" }[status] || "#888";
}
function getCrowdLabel(status) {
  return { crowded: "Packed", moderate: "Busy", free: "Open" }[status] || status;
}

// Collect all unique tags from schedule
const ALL_TAGS = ["All", ...new Set(SCHEDULE.flatMap(s => s.tags))];

export default function Schedule({ checkedIn, onCheckIn }) {
  const [activeTag, setActiveTag] = useState("All");
  const [searchText, setSearchText] = useState("");

  const filtered = SCHEDULE.filter(s => {
    const matchTag  = activeTag === "All" || s.tags.includes(activeTag);
    const matchText = !searchText ||
      s.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (s.speaker && s.speaker.toLowerCase().includes(searchText.toLowerCase()));
    return matchTag && matchText;
  });

  return (
    <div className="page">
      <div className="page-header">
        <h2>Full Schedule</h2>
        <p>Check in to sessions to earn points · Crowd status live</p>
      </div>

      {/* ── FILTERS ─────────────────────────────── */}
      <div className="schedule-filters">
        <input
          className="text-input search-input"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="🔍 Search sessions or speakers..."
        />
        <div className="tag-filter-row">
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              className={`filter-chip ${activeTag === tag ? "active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── SESSION LIST ───────────────────────── */}
      <div className="session-list">
        {filtered.length === 0 && (
          <div className="empty-state">No sessions match your filter.</div>
        )}
        {filtered.map(session => {
          const zone = ZONES.find(z => z.id === session.zone);
          const done = checkedIn.has(session.id);
          const crowdColor = getCrowdColor(zone?.status);

          return (
            <div key={session.id} className={`session-card ${done ? "checked" : ""}`}>
              {/* Left accent bar: green when checked in */}
              <div className="session-accent" style={{
                background: done ? "#10b981" : zone?.color || "#6366f1"
              }} />

              <div className="session-time-col">
                <div className="session-time-badge">{session.time}</div>
                <div className="session-duration">{session.duration}min</div>
              </div>

              <div className="session-body">
                <div className="session-title">{session.title}</div>
                {session.speaker && (
                  <div className="session-speaker">👤 {session.speaker}</div>
                )}
                <div className="session-tags-row">
                  {zone && (
                    <span className="zone-tag">
                      {zone.emoji} {zone.name}
                    </span>
                  )}
                  <span className="crowd-tag"
                    style={{ background: `${crowdColor}22`, color: crowdColor, border: `1px solid ${crowdColor}44` }}>
                    {getCrowdLabel(zone?.status)}
                  </span>
                  {session.tags.map(t => (
                    <span key={t} className="session-tag">{t}</span>
                  ))}
                </div>
              </div>

              <div className="session-right">
                <div className="session-points">+{session.points}pts</div>
                <button
                  className={`checkin-btn ${done ? "done" : ""}`}
                  onClick={() => onCheckIn(session)}
                  disabled={done}
                >
                  {done ? "✓ In" : "Check In"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SUMMARY ─────────────────────────────── */}
      <div className="schedule-summary">
        {checkedIn.size} of {SCHEDULE.length} sessions attended ·{" "}
        {SCHEDULE.filter(s => checkedIn.has(s.id)).reduce((sum, s) => sum + s.points, 0)} pts earned
      </div>
    </div>
  );
}
