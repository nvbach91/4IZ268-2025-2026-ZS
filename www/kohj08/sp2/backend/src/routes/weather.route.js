import express from "express";
import { fetchPragueWeather } from "../services/weather.service.js";

const router = express.Router();

/**
 * GET /api/weather
 * returns prague current weather 
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