// backend/src/routes/weather.route.js
import express from "express";
import { fetchPragueWeather } from "../services/weather.service.js";

const router = express.Router();

/**
 * GET /api/weather
 * Returns Prague current weather (Open-Meteo)
 */
router.get("/", async (req, res) => {
  try {
    const weather = await fetchPragueWeather();
    res.json(weather);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: String(err.message || err) });
  }
});

export default router;