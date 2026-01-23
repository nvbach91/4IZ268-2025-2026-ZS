// backend/src/services/weather.service.js
// OpenWeather (API key required)
// Uses: OPENWEATHER_API_KEY
// Docs: https://openweathermap.org/current

const PRAGUE = {
    lat: 50.0755,
    lon: 14.4378
  };
  
  // simple in-memory cache (avoid spamming OpenWeather)
  const CACHE_MS = 5 * 60 * 1000; // 5 minutes
  let cache = {
    at: 0,
    value: null
  };
  
  function requireEnv(name) {
    const v = process.env[name];
    if (!v) {
      const e = new Error(`Missing env var: ${name}`);
      e.status = 500;
      throw e;
    }
    return v;
  }
  
  /**
   * OpenWeather weather condition id -> short text 
   * OpenWeather's description as condition_text 
   */
  function codeToTextFromId(id) {
    const c = Number(id);
    if (!Number.isFinite(c)) return "Unknown";
  
    if (c >= 200 && c <= 232) return "Thunderstorm";
    if (c >= 300 && c <= 321) return "Drizzle";
    if (c >= 500 && c <= 531) return "Rain";
    if (c >= 600 && c <= 622) return "Snow";
    if (c >= 701 && c <= 781) return "Fog/Mist";
    if (c === 800) return "Clear";
    if (c >= 801 && c <= 804) return "Clouds";
    return "Unknown";
  }
  
  export async function fetchPragueWeather() {
    const now = Date.now();
    if (cache.value && now - cache.at < CACHE_MS) {
      return cache.value;
    }
  
    const apiKey = requireEnv("OPENWEATHER_API_KEY");
  
    // units=metric -> temp in °C, wind in m/s 
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${encodeURIComponent(PRAGUE.lat)}` +
      `&lon=${encodeURIComponent(PRAGUE.lon)}` +
      `&appid=${encodeURIComponent(apiKey)}` +
      `&units=metric`;
  
    const resp = await fetch(url);
  
    if (!resp.ok) {
      let details = "";
      try {
        details = await resp.text();
      } catch {
        details = "";
      }
      const extra = details ? ` | ${details.slice(0, 300)}` : "";
      const e = new Error(`Weather HTTP ${resp.status}${extra}`);
      e.status = resp.status;
      throw e;
    }
  
    const data = await resp.json();
  
    const temp = data?.main?.temp;
    const wind = data?.wind?.speed;
  
    // precip can be in rain/snow object, "1h" and/or "3h"
    const rain1h = data?.rain?.["1h"];
    const snow1h = data?.snow?.["1h"];
    const precip1h =
      typeof rain1h === "number" ? rain1h : typeof snow1h === "number" ? snow1h : null;
  
    const w0 = Array.isArray(data?.weather) ? data.weather[0] : null;
    const condId = w0 && typeof w0.id === "number" ? w0.id : null;
  
    // OpenWeather gives description like "overcast clouds"
    const desc =
      w0 && typeof w0.description === "string" && w0.description.trim()
        ? w0.description.trim()
        : null;
  
    const weather = {
      source: "openweather",
      fetched_at: new Date().toISOString(),
      temp_c: typeof temp === "number" ? temp : null,
      wind_ms: typeof wind === "number" ? wind : null,
      precip_mm: typeof precip1h === "number" ? precip1h : 0, // keep number (0 if missing)
      condition_code: condId,
      condition_text: desc || (condId != null ? codeToTextFromId(condId) : "Unknown")
    };
  
    cache = { at: now, value: weather };
    return weather;
  }