import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
app.use(express.static("../frontend"));

function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing env var: ${name}. Create backend/.env based on .env.example`);
  }
  return val;
}

// --- Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "prague-heat-backend" });
});

// --- DEBUG: sample raw structure from Golemio
app.get("/api/golemio/sample", async (req, res) => {
  try {
    const GOLEMIO_API_KEY = requireEnv("GOLEMIO_API_KEY");
    const url = "https://api.golemio.cz/v2/vehiclepositions";

    const resp = await fetch(url, {
      method: "GET",
      headers: { "X-Access-Token": GOLEMIO_API_KEY }
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({
        error: "Golemio request failed",
        status: resp.status,
        details: text.slice(0, 500)
      });
    }

    const data = await resp.json();
    const features = Array.isArray(data?.features) ? data.features : [];

    const sample = features.slice(0, 2).map((f) => ({
      geometry: f?.geometry ?? null,
      properties: f?.properties ?? null
    }));

    res.json({
      source: "golemio",
      fetched_at: new Date().toISOString(),
      count: features.length,
      sample
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: String(err?.message || err) });
  }
});

// --- 1) GOLEMIO: vehicle positions + delays (simplified for heatmap)
app.get("/api/golemio/vehiclepositions", async (req, res) => {
  try {
    const GOLEMIO_API_KEY = requireEnv("GOLEMIO_API_KEY");

    // Optional filter by route_type (GTFS):
    // tram=0, metro=1, train=2, bus=3
    // Example: /api/golemio/vehiclepositions?route_type=0
    const routeTypeParam = req.query.route_type;
    const routeTypeFilter =
      routeTypeParam === undefined || routeTypeParam === ""
        ? null
        : Number(routeTypeParam);

    const url = "https://api.golemio.cz/v2/vehiclepositions";

    const resp = await fetch(url, {
      method: "GET",
      headers: { "X-Access-Token": GOLEMIO_API_KEY }
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({
        error: "Golemio request failed",
        status: resp.status,
        details: text.slice(0, 500)
      });
    }

    const data = await resp.json();
    const features = Array.isArray(data?.features) ? data.features : [];

    let simplified = features.map((f) => {
      const coords = f?.geometry?.coordinates; // [lon, lat]
      const lon = Array.isArray(coords) ? coords[0] : null;
      const lat = Array.isArray(coords) ? coords[1] : null;

      const p = f?.properties ?? {};
      const delay = p?.last_position?.delay?.actual ?? null; // seconds

      const gtfs = p?.trip?.gtfs ?? {};
      const routeShort = gtfs?.route_short_name ?? null;
      const headsign = gtfs?.trip_headsign ?? null;
      const routeType = gtfs?.route_type ?? null;

      const vehicleTypeEn = p?.trip?.vehicle_type?.description_en ?? null;
      const vehicleTypeId = p?.trip?.vehicle_type?.id ?? null;

      return {
        lat,
        lon,
        delay,
        route_short_name: routeShort,
        trip_headsign: headsign,
        route_type: routeType,
        vehicle_type: vehicleTypeEn,
        vehicle_type_id: vehicleTypeId
      };
    });

    if (routeTypeFilter !== null && !Number.isNaN(routeTypeFilter)) {
      simplified = simplified.filter((x) => x.route_type === routeTypeFilter);
    }

    // Keep response small for pilot testing
    res.json({
      source: "golemio",
      fetched_at: new Date().toISOString(),
      count: simplified.length,
      items: simplified.slice(0, 500)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: String(err?.message || err) });
  }
});

// --- 2) OPENWEATHER: current weather Prague
app.get("/api/weather/prague", async (req, res) => {
  try {
    const OPENWEATHER_API_KEY = requireEnv("OPENWEATHER_API_KEY");

    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?q=Prague&units=metric&appid=${encodeURIComponent(OPENWEATHER_API_KEY)}`;

    const resp = await fetch(url);

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({
        error: "OpenWeather request failed",
        status: resp.status,
        details: text.slice(0, 500)
      });
    }

    const data = await resp.json();

    res.json({
      source: "openweather",
      fetched_at: new Date().toISOString(),
      description: data?.weather?.[0]?.description ?? null,
      temp_c: data?.main?.temp ?? null,
      wind_speed: data?.wind?.speed ?? null,
      rain_1h: data?.rain?.["1h"] ?? 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: String(err?.message || err) });
  }
});

app.listen(PORT, () => {
  console.log(`Prague HEAT backend running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/api/health`);
});