/**
 * server.js — Express Backend for Event Platform
 * ================================================
 * Secure API proxy + event data REST endpoints.
 * Run: npm run dev (uses nodemon for hot reload)
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const aiRoutes     = require("./routes/ai");
const eventRoutes  = require("./routes/events");
const checkinRoutes = require("./routes/checkin");

const app = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(helmet());                                      // Security headers
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use("/api/ai",      aiRoutes);      // AI chat, planner, navigation
app.use("/api/events",  eventRoutes);   // Schedule, zones, crowd data
app.use("/api/checkin", checkinRoutes); // Gamification check-ins

// Health check
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// ── ERROR HANDLER ──────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () =>
  console.log(`🚀 Event Platform API → http://localhost:${PORT}`)
);
