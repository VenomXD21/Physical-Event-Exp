// routes/ai.js
const express = require("express");
const router = express.Router();
const { chatHandler, plannerHandler, navigationHandler } = require("../controllers/aiController");

router.post("/chat",     chatHandler);       // POST /api/ai/chat
router.post("/plan",     plannerHandler);    // POST /api/ai/plan
router.post("/navigate", navigationHandler); // POST /api/ai/navigate

module.exports = router;
