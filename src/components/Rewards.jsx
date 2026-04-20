/**
 * components/Rewards.jsx — Gamification Dashboard
 * =================================================
 * Shows total points, progress ring, badge collection,
 * leaderboard teaser, and personal check-in history.
 */
import { BADGES, SCHEDULE } from "../data/eventData";

// Circular progress ring (SVG)
function ProgressRing({ pct, size = 120, stroke = 10, color = "#6366f1" }) {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

// Fake leaderboard data (in production: fetch from DB)
const LEADERBOARD = [
  { name: "Arjun S.",   points: 1020, badge: "🏆" },
  { name: "Meera P.",   points: 920,  badge: "🥈" },
  { name: "Dev K.",     points: 810,  badge: "🥉" },
  { name: "Neha R.",    points: 740,  badge: "" },
  { name: "You",        points: null, badge: "⭐", isUser: true },
];

export default function Rewards({ points, checkedIn, mySchedule }) {
  const totalPossible = SCHEDULE.reduce((sum, s) => sum + s.points, 0);
  const pct           = Math.round((points / totalPossible) * 100);
  const nextBadge     = BADGES.find(b => checkedIn.size < b.threshold);
  const earnedBadges  = BADGES.filter(b => checkedIn.size >= b.threshold);

  const leaderboard = LEADERBOARD.map(entry =>
    entry.isUser ? { ...entry, points } : entry
  ).sort((a, b) => (b.points || 0) - (a.points || 0));

  return (
    <div className="page">
      <div className="page-header">
        <h2>Rewards & Gamification</h2>
        <p>Attend sessions · Earn points · Unlock badges</p>
      </div>

      {/* ── POINTS HERO ─────────────────────────── */}
      <div className="points-hero">
        <div className="ring-wrapper">
          <ProgressRing pct={pct} size={140} stroke={12} />
          <div className="ring-center">
            <div className="ring-points">{points}</div>
            <div className="ring-label">pts</div>
          </div>
        </div>
        <div className="points-info">
          <div className="points-headline">{points} / {totalPossible} points</div>
          <div className="points-sub">{checkedIn.size} of {SCHEDULE.length} sessions attended</div>
          {nextBadge && (
            <div className="next-badge-hint">
              {nextBadge.icon} <strong>{nextBadge.name}</strong> — check into {nextBadge.threshold - checkedIn.size} more session{nextBadge.threshold - checkedIn.size !== 1 ? "s" : ""}
            </div>
          )}
          {!nextBadge && (
            <div className="next-badge-hint">🎉 You've unlocked all badges!</div>
          )}
        </div>
      </div>

      {/* ── BADGES ──────────────────────────────── */}
      <div className="section-title">🏅 Badge Collection</div>
      <div className="badges-grid">
        {BADGES.map(badge => {
          const unlocked = checkedIn.size >= badge.threshold;
          return (
            <div key={badge.id} className={`badge-card ${unlocked ? "unlocked" : "locked"}`}>
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-desc">{badge.description}</div>
              <div className={`badge-status ${unlocked ? "earned" : ""}`}>
                {unlocked ? "✓ Earned!" : `Attend ${badge.threshold} sessions`}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── LEADERBOARD ─────────────────────────── */}
      <div className="section-title">🏆 Leaderboard</div>
      <div className="leaderboard">
        {leaderboard.map((entry, i) => (
          <div key={entry.name} className={`leaderboard-row ${entry.isUser ? "you" : ""}`}>
            <div className="lb-rank">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
            </div>
            <div className="lb-name">{entry.name} {entry.isUser ? "(You)" : ""}</div>
            <div className="lb-points">{entry.points ?? "—"} pts</div>
          </div>
        ))}
      </div>

      {/* ── HISTORY ─────────────────────────────── */}
      {mySchedule.length > 0 && (
        <>
          <div className="section-title">✅ My Check-in History</div>
          <div className="history-list">
            {mySchedule.map(s => (
              <div key={s.id} className="history-row">
                <span className="history-time">{s.time}</span>
                <span className="history-title">{s.title}</span>
                <span className="history-pts">+{s.points}pts</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
