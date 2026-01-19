import express from "express";
import { fetchVehicleDelayPoints } from "../services/golemio.service.js";
import { fetchPragueWeather } from "../services/weather.service.js";

const router = express.Router();

// keep consistent with frontend PRAGUE_BBOX - prevents showing top values from around the republic
const PRAGUE_BBOX = {
  minLat: 49.95,
  maxLat: 50.2,
  minLon: 14.2,
  maxLon: 14.7
};

function requireEnv(req, name) {
  const val = process.env[name];
  if (!val) {
    const msg = `Missing env var: ${name}. Create backend/.env based on .env.example`;
    const err = new Error(msg);
    err.status = 500;
    throw err;
  }
  return val;
}

function avg(nums) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function percentile(nums, p) {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}

function inBbox(lat, lon, bbox) {
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    lat >= bbox.minLat &&
    lat <= bbox.maxLat &&
    lon >= bbox.minLon &&
    lon <= bbox.maxLon
  );
}

function applyPragueFilter(items, pragueOnly) {
  if (!pragueOnly) return items;
  return (Array.isArray(items) ? items : []).filter((x) => inBbox(x.lat, x.lon, PRAGUE_BBOX));
}

function parseBool(v) {
  const s = (v ?? "").toString().trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

function parseRouteTypes(req) {
  // supports:
  // - route_types=0,3,1
  // - route_type=0 (legacy)
  const rawMulti = (req.query.route_types ?? "").toString().trim();
  if (rawMulti) {
    return rawMulti
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n));
  }

  const single = (req.query.route_type ?? "").toString().trim();
  if (single !== "") {
    const n = Number(single);
    return Number.isFinite(n) ? [n] : [];
  }

  return []; // empty = all
}

/**
 * GET /api/delays
 */
router.get("/", async (req, res) => {
  try {
    const apiKey = requireEnv(req, "GOLEMIO_API_KEY");

    const routeTypes = parseRouteTypes(req); // [] => all
    const minDelay = Math.max(0, Number(req.query.min_delay ?? 0) || 0);
    const limit = Math.max(50, Math.min(2000, Number(req.query.limit ?? 800) || 800));

    // default TRUE to match what user sees on the map
    const pragueOnly = req.query.prague_only == null ? true : parseBool(req.query.prague_only);

    let items = await fetchVehicleDelayPoints({
      apiKey,
      routeTypes,
      minDelay,
      limit
    });

    items = applyPragueFilter(items, pragueOnly);

    res.json({
      source: "golemio",
      fetched_at: new Date().toISOString(),
      filters: {
        route_types: routeTypes.length ? routeTypes : null,
        min_delay: minDelay,
        prague_only: pragueOnly
      },
      count: items.length,
      items
    });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: "Server error", details: String(err.message || err) });
  }
});

/**
 * GET /api/delays/summary
 */
router.get("/summary", async (req, res) => {
  try {
    const apiKey = requireEnv(req, "GOLEMIO_API_KEY");

    const routeTypes = parseRouteTypes(req);
    const minDelay = Math.max(0, Number(req.query.min_delay ?? 0) || 0);
    const limit = Math.max(50, Math.min(2000, Number(req.query.limit ?? 1200) || 1200));
    const topN = Math.max(1, Math.min(20, Number(req.query.top_n) || 5));

    const pragueOnly = req.query.prague_only == null ? true : parseBool(req.query.prague_only);

    let items = await fetchVehicleDelayPoints({
      apiKey,
      routeTypes,
      minDelay,
      limit
    });

    items = applyPragueFilter(items, pragueOnly);

    const delaysAll = items.map((x) => x.delay).filter((d) => typeof d === "number");
    const delaysPositive = delaysAll.filter((d) => d > 0);

    const summary = {
      count: items.length,
      avg_delay_s: Math.round(avg(delaysPositive)),
      p95_delay_s: Math.round(percentile(delaysPositive, 95)),
      max_delay_s: delaysPositive.length ? Math.round(Math.max(...delaysPositive)) : 0
    };

    const top_delays = [...items]
      .filter((x) => typeof x.delay === "number")
      .sort((a, b) => (b.delay ?? 0) - (a.delay ?? 0))
      .slice(0, topN)
      .map((x) => ({
        delay: x.delay,
        route_short_name: x.route_short_name,
        trip_headsign: x.trip_headsign,
        route_type: x.route_type,
        vehicle_type: x.vehicle_type,
        lat: x.lat,
        lon: x.lon
      }));

    res.json({
      source: "golemio",
      fetched_at: new Date().toISOString(),
      filters: {
        route_types: routeTypes.length ? routeTypes : null,
        min_delay: minDelay,
        prague_only: pragueOnly
      },
      summary,
      top_delays
    });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: "Server error", details: String(err.message || err) });
  }
});

/**
 * GET /api/delays/dashboard
 * Single snapshot: items + summary + top_delays + weather (one request for frontend).
 */
router.get("/dashboard", async (req, res) => {
  try {
    const apiKey = requireEnv(req, "GOLEMIO_API_KEY");

    const routeTypes = parseRouteTypes(req);
    const minDelay = Math.max(0, Number(req.query.min_delay ?? 0) || 0);
    const limit = Math.max(50, Math.min(2000, Number(req.query.limit ?? 1200) || 1200));
    const topN = Math.max(1, Math.min(20, Number(req.query.top_n) || 5));

    const pragueOnly = req.query.prague_only == null ? true : parseBool(req.query.prague_only);

    const results = await Promise.allSettled([
      fetchVehicleDelayPoints({
        apiKey,
        routeTypes,
        minDelay,
        limit
      }),
      fetchPragueWeather()
    ]);

    // delays are required
    if (results[0].status !== "fulfilled") {
      throw results[0].reason || new Error("Delays fetch failed");
    }

    const rawItems = results[0].value;
    const weather = results[1].status === "fulfilled" ? results[1].value : null;

    if (results[1].status !== "fulfilled") {
      console.warn("Weather fetch failed:", results[1].reason?.message || results[1].reason);
    }

    const items = applyPragueFilter(rawItems, pragueOnly);

    const delaysAll = items.map((x) => x.delay).filter((d) => typeof d === "number");
    const delaysPositive = delaysAll.filter((d) => d > 0);

    const summary = {
      count: items.length,
      avg_delay_s: Math.round(avg(delaysPositive)),
      p95_delay_s: Math.round(percentile(delaysPositive, 95)),
      max_delay_s: delaysPositive.length ? Math.round(Math.max(...delaysPositive)) : 0
    };

    const top_delays = [...items]
      .filter((x) => typeof x.delay === "number")
      .sort((a, b) => (b.delay ?? 0) - (a.delay ?? 0))
      .slice(0, topN)
      .map((x) => ({
        delay: x.delay,
        route_short_name: x.route_short_name,
        trip_headsign: x.trip_headsign,
        route_type: x.route_type,
        vehicle_type: x.vehicle_type,
        lat: x.lat,
        lon: x.lon
      }));

    res.json({
      source: "golemio",
      fetched_at: new Date().toISOString(),
      filters: {
        route_types: routeTypes.length ? routeTypes : null,
        min_delay: minDelay,
        prague_only: pragueOnly
      },
      count: items.length,
      items,
      summary,
      top_delays,
      weather
    });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: "Server error", details: String(err.message || err) });
  }
});

export default router;