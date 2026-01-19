// app.js (++AI overview tlačítko + výstup)

const STORAGE_KEY = "pragueHeatStateV1";

const API_BASE = "https://prague-heat.onrender.com"; // <-- overwrite here
function api(path) {
  return `${API_BASE}${path}`;
}

const els = {
  routeTypesWrap: document.getElementById("routeTypes"),
  minDelay: document.getElementById("minDelay"),
  refreshSec: document.getElementById("refreshSec"),

  radius: document.getElementById("radius"),
  blur: document.getElementById("blur"),
  radiusVal: document.getElementById("radiusVal"),
  blurVal: document.getElementById("blurVal"),

  btnApply: document.getElementById("btnApply"),
  btnRefresh: document.getElementById("btnRefresh"),
  status: document.getElementById("status"),

  ovCount: document.getElementById("ovCount"),
  ovAvg: document.getElementById("ovAvg"),
  ovP95: document.getElementById("ovP95"),
  ovMax: document.getElementById("ovMax"),

  topList: document.getElementById("topList"),

  // weather
  wxTemp: document.getElementById("wxTemp"),
  wxWind: document.getElementById("wxWind"),
  wxPrecip: document.getElementById("wxPrecip"),
  wxCond: document.getElementById("wxCond"),
  wxAt: document.getElementById("wxAt"),

  // AI
  aiBtn: document.getElementById("aiBtn"),
  aiStatus: document.getElementById("aiStatus"),
  aiOut: document.getElementById("aiOut")
};

const state = {
  map: null,
  heat: null,
  timer: null,
  lastTop: []
};

const PRAGUE_BBOX = {
  minLat: 49.95,
  maxLat: 50.2,
  minLon: 14.2,
  maxLon: 14.7
};

function setStatus(msg) {
  els.status.textContent = msg;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function inPragueBbox(lat, lon) {
  return (
    lat >= PRAGUE_BBOX.minLat &&
    lat <= PRAGUE_BBOX.maxLat &&
    lon >= PRAGUE_BBOX.minLon &&
    lon <= PRAGUE_BBOX.maxLon
  );
}

function selectedRouteTypes() {
  const checks = els.routeTypesWrap.querySelectorAll("input.rt[type='checkbox']");
  const vals = [];
  checks.forEach((c) => {
    if (c.checked) vals.push(String(c.value));
  });
  return vals;
}

function getUiState() {
  return {
    route_types: selectedRouteTypes(),
    min_delay: Math.max(0, Number(els.minDelay.value) || 0),
    radius: clamp(Number(els.radius.value) || 45, 10, 60),
    blur: clamp(Number(els.blur.value) || 1, 1, 50),
    refresh_sec: clamp(Number(els.refreshSec.value) || 30, 1, 3600)
  };
}

function applyUiState(s = {}) {
  const rt = Array.isArray(s.route_types) ? s.route_types.map(String) : null;

  if (rt && rt.length) {
    const checks = els.routeTypesWrap.querySelectorAll("input.rt[type='checkbox']");
    checks.forEach((c) => {
      c.checked = rt.includes(String(c.value));
    });
  }

  if (typeof s.min_delay === "number") els.minDelay.value = String(Math.max(0, s.min_delay));
  if (typeof s.radius === "number") els.radius.value = String(clamp(s.radius, 10, 60));
  if (typeof s.blur === "number") els.blur.value = String(clamp(s.blur, 1, 50));
  if (typeof s.refresh_sec === "number") els.refreshSec.value = String(clamp(s.refresh_sec, 1, 3600));

  els.radiusVal.textContent = String(els.radius.value);
  els.blurVal.textContent = String(els.blur.value);
}

function stateToQueryString(s) {
  const params = new URLSearchParams();

  if (Array.isArray(s.route_types) && s.route_types.length) params.set("route_types", s.route_types.join(","));
  if ((Number(s.min_delay) || 0) > 0) params.set("min_delay", String(Number(s.min_delay) || 0));

  params.set("radius", String(Number(s.radius) || 45));
  params.set("blur", String(Number(s.blur) || 1));
  params.set("refresh", String(Number(s.refresh_sec) || 30));

  params.set("prague_only", "1");
  params.set("limit", "1200");

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function parseStateFromUrl() {
  const params = new URLSearchParams(window.location.search);

  const rtRaw = (params.get("route_types") || "").trim();
  const route_types = rtRaw
    ? rtRaw
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : null;

  const min_delay = params.has("min_delay") ? Math.max(0, Number(params.get("min_delay")) || 0) : null;
  const radius = params.has("radius") ? clamp(Number(params.get("radius")) || 45, 10, 60) : null;
  const blur = params.has("blur") ? clamp(Number(params.get("blur")) || 1, 1, 50) : null;
  const refresh_sec = params.has("refresh") ? clamp(Number(params.get("refresh")) || 30, 1, 3600) : null;

  const hasAny =
    route_types !== null || min_delay !== null || radius !== null || blur !== null || refresh_sec !== null;

  if (!hasAny) return null;

  return {
    route_types: route_types ?? undefined,
    min_delay: min_delay ?? undefined,
    radius: radius ?? undefined,
    blur: blur ?? undefined,
    refresh_sec: refresh_sec ?? undefined
  };
}

function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveStateToStorage(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

function commitState({ push } = {}) {
  const ui = getUiState();
  const qs = stateToQueryString(ui);

  const url = `${window.location.pathname}${qs}${window.location.hash || ""}`;
  if (push) history.pushState(ui, "", url);
  else history.replaceState(ui, "", url);

  saveStateToStorage(ui);
  return ui;
}

function buildQuery() {
  const ui = getUiState();
  return stateToQueryString(ui);
}

function delayToWeight(delaySec) {
  const d = Math.max(0, Number(delaySec) || 0);
  const w = d / 120;
  return clamp(w, 0, 1);
}

async function fetchJson(url) {
  const resp = await fetch(url);
  if (!resp.ok) {
    const err = new Error(`HTTP ${resp.status}`);
    err.httpStatus = resp.status;
    throw err;
  }
  return await resp.json();
}

function initMap() {
  const prague = [50.0755, 14.4378];

  state.map = L.map("map", { zoomControl: true }).setView(prague, 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(state.map);

  rebuildHeatLayer();
}

function rebuildHeatLayer() {
  const radius = Number(els.radius.value) || 45;
  const blur = Number(els.blur.value) || 1;

  if (state.heat) {
    state.map.removeLayer(state.heat);
    state.heat = null;
  }

  state.heat = L.heatLayer([], {
    radius,
    blur,
    maxZoom: 17
  }).addTo(state.map);

  els.radiusVal.textContent = String(radius);
  els.blurVal.textContent = String(blur);
}

function renderOverview(dashboardJson) {
  const s = dashboardJson?.summary || {};

  els.ovCount.textContent = s.count ?? "-";
  els.ovAvg.textContent = typeof s.avg_delay_s === "number" ? `${s.avg_delay_s}s` : "-";
  els.ovP95.textContent = typeof s.p95_delay_s === "number" ? `${s.p95_delay_s}s` : "-";
  els.ovMax.textContent = typeof s.max_delay_s === "number" ? `${s.max_delay_s}s` : "-";
}

/**
 * OpenWeather "weather.id" -> emoji
 * 2xx thunderstorm, 3xx drizzle, 5xx rain, 6xx snow, 7xx atmosphere, 800 clear, 801-804 clouds
 */
function weatherCodeToEmoji(code) {
  const c = Number(code);
  if (!Number.isFinite(c)) return "❓";

  if (c >= 200 && c <= 232) return "⛈️";
  if (c >= 300 && c <= 321) return "🌦️";
  if (c >= 500 && c <= 531) return "🌧️";
  if (c >= 600 && c <= 622) return "🌨️";
  if (c >= 701 && c <= 781) return "🌫️";

  if (c === 800) return "☀️";
  if (c === 801) return "🌤️";
  if (c === 802) return "⛅";
  if (c === 803 || c === 804) return "☁️";

  return "🌡️";
}

function renderWeather(weather) {
  if (!els.wxTemp || !els.wxWind || !els.wxPrecip || !els.wxCond || !els.wxAt) return;

  if (!weather || typeof weather !== "object") {
    els.wxTemp.textContent = "-";
    els.wxWind.textContent = "-";
    els.wxPrecip.textContent = "-";
    els.wxCond.textContent = "-";
    els.wxAt.textContent = "-";
    return;
  }

  els.wxTemp.textContent = typeof weather.temp_c === "number" ? `${weather.temp_c.toFixed(1)} °C` : "-";
  els.wxWind.textContent = typeof weather.wind_ms === "number" ? `${weather.wind_ms.toFixed(1)} m/s` : "-";
  els.wxPrecip.textContent = typeof weather.precip_mm === "number" ? `${weather.precip_mm.toFixed(1)} mm` : "-";

  const code = typeof weather.condition_code === "number" ? weather.condition_code : NaN;
  els.wxCond.textContent = weatherCodeToEmoji(code);

  els.wxAt.textContent = weather.fetched_at ? `Updated: ${weather.fetched_at}` : "-";
}

function renderTopList(topDelays) {
  els.topList.innerHTML = "";
  state.lastTop = Array.isArray(topDelays) ? topDelays : [];

  state.lastTop.forEach((x) => {
    const li = document.createElement("li");

    const line = x.route_short_name ?? "?";
    const head = x.trip_headsign ?? "";
    const delay = typeof x.delay === "number" ? `${x.delay}s` : "?";

    li.textContent = `${delay} — ${line} ${head}`.trim();

    li.addEventListener("click", () => {
      if (typeof x.lat === "number" && typeof x.lon === "number") {
        state.map.setView([x.lat, x.lon], 15);
      }
    });

    els.topList.appendChild(li);
  });

  if (!state.lastTop.length) {
    const li = document.createElement("li");
    li.textContent = "No data";
    els.topList.appendChild(li);
  }
}

function updateHeat(items) {
  const pts = (Array.isArray(items) ? items : [])
    .filter((x) => typeof x.lat === "number" && typeof x.lon === "number")
    .filter((x) => inPragueBbox(x.lat, x.lon))
    .map((x) => [x.lat, x.lon, delayToWeight(x.delay)]);

  state.heat.setLatLngs(pts);
}

async function refreshOnce() {
  const q = buildQuery();
  const url = `${API_BASE}/api/delays/dashboard${q}${q ? "&" : "?"}top_n=5`;

  try {
    setStatus("loading...");

    const dashboardJson = await fetchJson(url);

    updateHeat(dashboardJson?.items || []);
    renderOverview(dashboardJson);
    renderTopList(dashboardJson?.top_delays || []);
    renderWeather(dashboardJson?.weather);

    setStatus(`ok (${dashboardJson?.count ?? 0})`);
  } catch (e) {
    console.error(e);
    setStatus(`error (${e.message || e})`);
  }
}

/* ---------- AI ---------- */

function setAiUi({ status, text, loading }) {
  if (!els.aiBtn || !els.aiStatus || !els.aiOut) return;
  if (typeof status === "string") els.aiStatus.textContent = status;
  if (typeof text === "string") els.aiOut.textContent = text;
  els.aiBtn.disabled = Boolean(loading);
}

async function generateAiSummary() {
  if (!els.aiBtn || !els.aiStatus || !els.aiOut) return;

  const q = buildQuery();
  const url = `${API_BASE}/api/ai-summary${q}${q ? "&" : "?"}top_n=5`;

  try {
    setAiUi({ status: "loading...", text: "Generating…", loading: true });
    const json = await fetchJson(url);
    setAiUi({ status: "ok", text: json?.text || "-", loading: false });
  } catch (e) {
    if (e && e.httpStatus === 503) {
      setAiUi({ status: "disabled", text: "AI disabled", loading: false });
      return;
    }
    console.error(e);
    setAiUi({ status: "error", text: `AI error: ${e.message || e}`, loading: false });
  }
}

/* ---------- refresh timer ---------- */

function startAutoRefresh() {
  stopAutoRefresh();

  const sec = Number(els.refreshSec.value) || 0;
  if (sec <= 0) return;

  state.timer = setInterval(refreshOnce, sec * 1000);
}

function stopAutoRefresh() {
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
}

function wireEvents() {
  els.btnRefresh.addEventListener("click", refreshOnce);

  els.btnApply.addEventListener("click", async () => {
    commitState({ push: true });
    await refreshOnce();
    startAutoRefresh();
  });

  els.refreshSec.addEventListener("change", () => {
    commitState({ push: false });
    startAutoRefresh();
  });

  els.minDelay.addEventListener("change", () => {
    commitState({ push: false });
    refreshOnce();
  });

  els.radius.addEventListener("input", () => {
    els.radiusVal.textContent = String(els.radius.value);
  });

  els.blur.addEventListener("input", () => {
    els.blurVal.textContent = String(els.blur.value);
  });

  els.radius.addEventListener("change", () => {
    commitState({ push: false });
    rebuildHeatLayer();
    refreshOnce();
  });

  els.blur.addEventListener("change", () => {
    commitState({ push: false });
    rebuildHeatLayer();
    refreshOnce();
  });

  els.routeTypesWrap.addEventListener("change", (e) => {
    if (e.target && e.target.classList && e.target.classList.contains("rt")) {
      commitState({ push: false });
      refreshOnce();
    }
  });

  window.addEventListener("popstate", (e) => {
    const s = (e && e.state) || parseStateFromUrl();
    if (!s) return;

    applyUiState(s);
    rebuildHeatLayer();
    stopAutoRefresh();
    refreshOnce();
    startAutoRefresh();
  });

  if (els.aiBtn) {
    els.aiBtn.addEventListener("click", generateAiSummary);
  }
}

function boot() {
  const fromUrl = parseStateFromUrl();
  const fromLs = loadStateFromStorage();

  if (fromUrl) applyUiState(fromUrl);
  else if (fromLs) applyUiState(fromLs);

  initMap();
  wireEvents();

  commitState({ push: false });

  refreshOnce();
  startAutoRefresh();

  setAiUi({ status: "idle", text: "-", loading: false });
}

boot();