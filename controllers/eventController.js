/**
 * controllers/eventController.js
 * In production: replace in-memory state with Firebase/MongoDB reads.
 */
const { ZONES, SCHEDULE } = require("../data/sampleData");

// In-memory crowd state (simulate real-time updates)
let crowdState = ZONES.map(z => ({ ...z }));

function getSchedule(req, res) {
  let result = [...SCHEDULE];
  if (req.query.tag)  result = result.filter(s => s.tags.includes(req.query.tag));
  if (req.query.zone) result = result.filter(s => s.zone === req.query.zone);
  res.json(result);
}

function getZones(_req, res) {
  res.json(crowdState);
}

// Organizer endpoint: update live crowd count
function updateCrowd(req, res) {
  const zone = crowdState.find(z => z.id === req.params.id);
  if (!zone) return res.status(404).json({ error: "Zone not found" });

  zone.current = Number(req.body.current) || zone.current;
  const ratio = zone.current / zone.capacity;
  zone.status = ratio > 0.8 ? "crowded" : ratio > 0.5 ? "moderate" : "free";

  res.json(zone);
}

module.exports = { getSchedule, getZones, updateCrowd };
