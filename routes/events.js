// routes/events.js
const express = require("express");
const router = express.Router();
const { getSchedule, getZones, updateCrowd } = require("../controllers/eventController");

router.get("/schedule",          getSchedule);  // GET  /api/events/schedule
router.get("/zones",             getZones);     // GET  /api/events/zones
router.patch("/zones/:id/crowd", updateCrowd);  // PATCH /api/events/zones/:id/crowd

module.exports = router;
