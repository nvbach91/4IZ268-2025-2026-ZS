import { getJson } from "../utils/httpClient.js";

const GOLEMIO_URL = "https://api.golemio.cz/v2/vehiclepositions?limit=1000&offset=0";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeRouteTypes(routeTypes) {
  if (!Array.isArray(routeTypes)) return [];
  return routeTypes
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n));
}

/**
 * Vrací zjednodušené body:
 * { lat, lon, delay, route_short_name, trip_headsign, route_type, vehicle_type }
 *
 * opts:
 * - routeTypes: number[]      (např. [0,3,1]; prázdné pole = všechny)
 * - minDelay: number          (v sekundách; použije se na kladné zpoždění)
 * - limit: number            (max počet bodů ve výstupu)
 *
 * (legacy)
 * - routeType: number | null  (pokud někde ještě posíláš routeType, pořád to vezmeme)
 */
export async function fetchVehicleDelayPoints({
  apiKey,
  routeTypes = [],
  routeType = null,
  minDelay = 0,
  limit = 800
} = {}) {
  if (!apiKey) throw new Error("Missing GOLEMIO apiKey");

  const data = await getJson(GOLEMIO_URL, {
    headers: { "X-Access-Token": apiKey }
  });

  const features = Array.isArray(data?.features) ? data.features : [];

  let items = features.map((f) => {
    const coords = f?.geometry?.coordinates; // [lon, lat]
    const lon = Array.isArray(coords) ? coords[0] : null;
    const lat = Array.isArray(coords) ? coords[1] : null;

    const p = f?.properties ?? {};
    const delayRaw = p?.last_position?.delay?.actual ?? null;

    const gtfs = p?.trip?.gtfs ?? {};
    const routeShort = gtfs?.route_short_name ?? null;
    const headsign = gtfs?.trip_headsign ?? null;
    const rType = gtfs?.route_type ?? null;

    const vehicleTypeEn = p?.trip?.vehicle_type?.description_en ?? null;

    return {
      lat,
      lon,
      delay: typeof delayRaw === "number" ? delayRaw : null,
      route_short_name: routeShort,
      trip_headsign: headsign,
      route_type: rType,
      vehicle_type: vehicleTypeEn
    };
  });

  items = items.filter((x) => typeof x.lat === "number" && typeof x.lon === "number");

  // multi route types (preferred)
  const rts = normalizeRouteTypes(routeTypes);

  // legacy single routeType fallback
  let legacy = null;
  if (routeType !== null && !Number.isNaN(Number(routeType))) legacy = Number(routeType);

  if (rts.length) {
    const allowed = new Set(rts);
    items = items.filter((x) => allowed.has(x.route_type));
  } else if (legacy !== null) {
    items = items.filter((x) => x.route_type === legacy);
  }

  // filter by minDelay (only for positive delays)
  const md = Number(minDelay) || 0;
  if (md > 0) {
    items = items.filter((x) => (typeof x.delay === "number" ? x.delay : 0) >= md);
  }

  // safety: cap extreme values (for nicer stats)
  items = items.map((x) => ({
    ...x,
    delay: typeof x.delay === "number" ? clamp(x.delay, -3600, 7200) : null
  }));

  const lim = clamp(Number(limit) || 800, 50, 2000);
  items = items.slice(0, lim);

  return items;
}