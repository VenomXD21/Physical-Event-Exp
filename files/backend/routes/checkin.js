// routes/checkin.js
const express = require("express");
const router = express.Router();
const { checkIn, getUserStats } = require("../controllers/checkinController");

router.post("/",              checkIn);      // POST /api/checkin
router.get("/stats/:userId",  getUserStats); // GET  /api/checkin/stats/:userId

module.exports = router;
