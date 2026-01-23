import express from "express";
import { fetchVehicleDelayPoints } from "../services/golemio.service.js";
import { fetchPragueWeather } from "../services/weather.service.js";
import { generateAiOverview } from "../services/openai.service.js";

const router = express.Router();

// keep consistent with frontend PRAGUE_BBOX
const PRAGUE_BBOX = {
  minLat: 49.95,
  maxLat: 50.2,
  minLon: 14.2,
  maxLon: 14.7
};

function parseBool(v) {
  const s = (v ?? "").toString().trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

function parseRouteTypes(req) {
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

  return [];
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

function parseBounds(req) {
  const minLat = Number(req.query.minLat);
  const maxLat = Number(req.query.maxLat);
  const minLon = Number(req.query.minLon);
  const maxLon = Number(req.query.maxLon);

  if (
    Number.isFinite(minLat) &&
    Number.isFinite(maxLat) &&
    Number.isFinite(minLon) &&
    Number.isFinite(maxLon)
  ) {
    return { minLat, maxLat, minLon, maxLon };
  }
  return null;
}

function applyBoundsFilter(items, bounds) {
  if (!items || !bounds) return items;
  return items.filter((x) => inBbox(x.lat, x.lon, bounds));
}

/**
 * GET /api/ai-summary
 * Query params (same style as /api/delays/dashboard):
 * - route_types=0,3,1 (optional)
 * - min_delay=...     (optional)
 * - limit=...         (optional, default 1200)
 * - top_n=...         (optional, default 5)
 * - prague_only=1     (optional, default true)
 */
router.get("/", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "AI disabled" });
    }

    const golemioKey = process.env.GOLEMIO_API_KEY;
    if (!golemioKey) {
      return res.status(500).json({ error: "Server error", details: "Missing env var: GOLEMIO_API_KEY" });
    }

    const routeTypes = parseRouteTypes(req);
    const minDelay = Math.max(0, Number(req.query.min_delay ?? 0) || 0);
    const limit = Math.max(50, Math.min(2000, Number(req.query.limit ?? 1200) || 1200));
    const topN = Math.max(1, Math.min(20, Number(req.query.top_n) || 5));

    // default TRUE (same as your delays route)
    const pragueOnly = req.query.prague_only == null ? true : parseBool(req.query.prague_only);

    const results = await Promise.allSettled([
      fetchVehicleDelayPoints({
        apiKey: golemioKey,
        routeTypes,
        minDelay,
        limit
      }),
      fetchPragueWeather()
    ]);

    if (results[0].status !== "fulfilled") {
      throw results[0].reason || new Error("Delays fetch failed");
    }

    const rawItems = results[0].value;
    const weather = results[1].status === "fulfilled" ? results[1].value : null;

    if (results[1].status !== "fulfilled") {
      console.warn("Weather fetch failed:", results[1].reason?.message || results[1].reason);
    }

    const items = applyBoundsFilter(applyPragueFilter(rawItems, pragueOnly), parseBounds(req));

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
        vehicle_type: x.vehicle_type
      }));

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const aiText = await generateAiOverview({
      model,
      input: {
        filters: {
          route_types: routeTypes.length ? routeTypes : null,
          min_delay: minDelay,
          prague_only: pragueOnly,
          top_n: topN
        },
        fetched_at: new Date().toISOString(),
        traffic: { summary, top_delays },
        weather
      }
    });

    res.setHeader("Cache-Control", "no-store");
    return res.json({
      ok: true,
      model,
      generated_at: new Date().toISOString(),
      text: aiText
    });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: "Server error", details: String(err.message || err) });
  }
});

export default router;