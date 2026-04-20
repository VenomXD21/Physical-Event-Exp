/**
 * controllers/checkinController.js — Gamification Engine
 * ========================================================
 * Handles session check-ins, points calculation, and badge unlocking.
 * In production: replace userStore with Firebase Firestore or MongoDB.
 */
const { SCHEDULE, BADGES } = require("../data/sampleData");

// In-memory user store (replace with DB in production)
const userStore = {};

function getOrCreateUser(userId) {
  if (!userStore[userId]) {
    userStore[userId] = { userId, points: 0, checkedIn: [], badges: [], history: [] };
  }
  return userStore[userId];
}

// POST /api/checkin — Body: { userId, sessionId }
function checkIn(req, res) {
  const { userId, sessionId } = req.body;
  if (!userId || !sessionId) {
    return res.status(400).json({ error: "userId and sessionId are required" });
  }

  const user = getOrCreateUser(userId);

  // Prevent duplicate check-ins
  if (user.checkedIn.includes(sessionId)) {
    return res.status(409).json({ error: "Already checked in to this session" });
  }

  const session = SCHEDULE.find(s => s.id === sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });

  // Award points
  user.checkedIn.push(sessionId);
  user.points += session.points;
  user.history.push({ sessionId, title: session.title, points: session.points, at: new Date().toISOString() });

  // Check badge unlocks
  const newBadges = [];
  BADGES.forEach(badge => {
    if (user.checkedIn.length >= badge.threshold && !user.badges.includes(badge.id)) {
      user.badges.push(badge.id);
      newBadges.push(badge.id);
    }
  });

  res.json({
    success: true,
    pointsEarned: session.points,
    totalPoints: user.points,
    totalCheckins: user.checkedIn.length,
    newBadges,
    allBadges: user.badges,
  });
}

// GET /api/checkin/stats/:userId
function getUserStats(req, res) {
  const user = getOrCreateUser(req.params.userId);
  res.json(user);
}

module.exports = { checkIn, getUserStats };
