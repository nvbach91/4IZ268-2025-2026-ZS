// app.js (++AI overview tlačítko + výstup)
(function () {

  const STORAGE_KEY = "pragueHeatStateV1";

  const API_BASE = ""; // <-- OVERWRITE HERE FOR LOCAL MACHINE RUN https://prague-heat.onrender.com
  function api(path) {
    return `${API_BASE}${path}`;
  }

  const els = {
    routeTypesWrap: document.getElementById("routeTypes"),
    rtBtn: document.getElementById("rtBtn"),
    rtMenu: document.getElementById("rtMenu"),
    rtConfirm: document.getElementById("rtConfirm"),
    minDelay: document.getElementById("minDelay"),
    refreshSec: document.getElementById("refreshSec"),
    refreshCountdown: document.getElementById("refreshCountdown"),

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
    tempUnit: document.getElementById("tempUnit"),

    // AI
    aiBtn: document.getElementById("aiBtn"),
    aiStatus: document.getElementById("aiStatus"),
    aiOut: document.getElementById("aiOut")
  };

  const state = {
    map: null,
    heat: null,
    timer: null,
    countdownTimer: null,
    refreshDeadline: 0,
    lastTop: [],
    lastWeather: null
  };

  // reseni problemu rozptylu (videl jsem vozy pid i mimo prahu)
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
      refresh_sec: clamp(Number(els.refreshSec.value) || 30, 1, 3600),
      temp_unit: els.tempUnit ? els.tempUnit.value : "C"
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
    if (s.temp_unit && els.tempUnit) els.tempUnit.value = String(s.temp_unit);

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
    if (s.temp_unit && s.temp_unit !== "C") params.set("temp_unit", s.temp_unit);

    params.set("prague_only", "1");
    params.set("limit", "1200");

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }

  function apiQueryString(s, bounds) {
    const params = new URLSearchParams();

    if (Array.isArray(s.route_types) && s.route_types.length) {
      params.set("route_types", s.route_types.join(","));
    }
    if ((Number(s.min_delay) || 0) > 0) {
      params.set("min_delay", String(Number(s.min_delay) || 0));
    }

    if (bounds) {
      params.set("minLat", bounds.getSouth());
      params.set("maxLat", bounds.getNorth());
      params.set("minLon", bounds.getWest());
      params.set("maxLon", bounds.getEast());
    }

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
    const temp_unit = params.get("temp_unit") || null;

    const hasAny =
      route_types !== null || min_delay !== null || radius !== null || blur !== null || refresh_sec !== null || temp_unit !== null;

    if (!hasAny) return null;

    return {
      route_types: route_types ?? undefined,
      min_delay: min_delay ?? undefined,
      radius: radius ?? undefined,
      blur: blur ?? undefined,
      refresh_sec: refresh_sec ?? undefined,
      temp_unit: temp_unit ?? undefined
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

    if (c >= 200 && c <= 232) return "⛈️Thunderstorm";
    if (c >= 300 && c <= 321) return "🌦️Drizzle";
    if (c >= 500 && c <= 531) return "🌧️Rain";
    if (c >= 600 && c <= 622) return "🌨️Snow";
    if (c >= 701 && c <= 781) return "🌫️Fog";

    if (c === 800) return "☀️Sunny";
    if (c === 801) return "🌤️";
    if (c === 802) return "⛅Partly cloudy";
    if (c === 803 || c === 804) return "☁️Overcast";

    return "🌡️Unknown";
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

    const unit = els.tempUnit ? els.tempUnit.value : "C";
    let tempStr = "-";
    if (typeof weather.temp_c === "number") {
      if (unit === "F") {
        const f = (weather.temp_c * 1.8) + 32;
        tempStr = `${f.toFixed(1)} °F`;
      } else {
        tempStr = `${weather.temp_c.toFixed(1)} °C`;
      }
    }
    els.wxTemp.textContent = tempStr;
    els.wxWind.textContent = typeof weather.wind_ms === "number" ? `${weather.wind_ms.toFixed(1)} m/s` : "-";
    els.wxPrecip.textContent = typeof weather.precip_mm === "number" ? `${weather.precip_mm.toFixed(1)} mm` : "-";

    const code = typeof weather.condition_code === "number" ? weather.condition_code : NaN;
    els.wxCond.textContent = weatherCodeToEmoji(code);

    els.wxAt.textContent = `Local time: ${new Date().toLocaleTimeString()}`;
  }

  function renderTopList(topDelays) {
    els.topList.innerHTML = "";
    state.lastTop = Array.isArray(topDelays) ? topDelays : [];

    // MODIFIED: Create a document fragment to store elements off-DOM
    const fragment = document.createDocumentFragment();

    state.lastTop.forEach((x) => {
      const li = document.createElement("li");

      const line = x.route_short_name ?? "?";
      const icon = vehicleIcon(x);
      const head = x.trip_headsign ?? "";
      const delay = typeof x.delay === "number" ? `${x.delay}s` : "?";

      li.textContent = `${delay} — ${icon} ${line} ${head}`.trim();

      li.addEventListener("click", () => {
        if (typeof x.lat === "number" && typeof x.lon === "number") {
          state.map.setView([x.lat, x.lon], 15);
        }
      });

      // MODIFIED: Append to fragment instead of els.topList directly
      fragment.appendChild(li);
    });

    if (!state.lastTop.length) {
      const li = document.createElement("li");
      li.textContent = "No data";
      fragment.appendChild(li);
    }

    // MODIFIED: Append the entire fragment to DOM in one operation
    els.topList.appendChild(fragment);
  }

  function updateHeat(items) {
    const pts = (Array.isArray(items) ? items : [])
      .filter((x) => typeof x.lat === "number" && typeof x.lon === "number")
      .filter((x) => inPragueBbox(x.lat, x.lon))
      .map((x) => [x.lat, x.lon, delayToWeight(x.delay)]);

    state.heat.setLatLngs(pts);
  }

  async function refreshOnce() {
    const ui = getUiState();

    // Get current map bounds if map exists
    const bounds = state.map ? state.map.getBounds() : null;
    const q = apiQueryString(ui, bounds);

    const url = `${API_BASE}/api/delays/dashboard${q}${q ? "&" : "?"}top_n=5`;

    try {
      setStatus("loading...");

      const dashboardJson = await fetchJson(url);

      updateHeat(dashboardJson?.items || []);
      renderOverview(dashboardJson);
      renderTopList(dashboardJson?.top_delays || []);
      state.lastWeather = dashboardJson?.weather;
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

    const ui = getUiState();
    const bounds = state.map ? state.map.getBounds() : null;
    const q = apiQueryString(ui, bounds);

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

  function updateCountdown() {
    if (!state.refreshDeadline || !els.refreshCountdown) return;

    const now = Date.now();
    const diff = Math.ceil((state.refreshDeadline - now) / 1000);

    if (diff > 0) {
      els.refreshCountdown.textContent = `(${diff}s)`;
    } else {
      els.refreshCountdown.textContent = "";
    }
  }

  function startAutoRefresh() {
    stopAutoRefresh();

    const sec = Number(els.refreshSec.value) || 0;
    if (sec <= 0) {
      if (els.refreshCountdown) els.refreshCountdown.textContent = "";
      return;
    }

    // Set the target time for next refresh
    state.refreshDeadline = Date.now() + (sec * 1000);
    updateCountdown();

    // Main refresh timer
    state.timer = setTimeout(() => {
      refreshOnce();
      // will be restarted by refreshOnce -> or we can call startAutoRefresh recursively
      // But currently refreshOnce is just async. 
      // standard app pattern: interval or recursive timeout. 
      // original was setInterval. Let's keep setInterval but we need to reset deadline.
    }, sec * 1000);

    // Instead of simple setInterval, we use recursive logic or just setInterval with deadline update
    // Let's stick to original setInterval logic but enhance it for countdown
    // Actually, to keep countdown in sync, it's better to reset deadline on every tick.

    // Let's rewrite slightly:
    // 1. Clear old
    clearInterval(state.timer);
    clearInterval(state.countdownTimer);

    // 2. Setup Interval for Action
    state.timer = setInterval(() => {
      state.refreshDeadline = Date.now() + (sec * 1000);
      refreshOnce();
    }, sec * 1000);

    // 3. Setup Interval for UI Countdown (every 1s)
    state.countdownTimer = setInterval(updateCountdown, 1000);
  }

  function stopAutoRefresh() {
    if (state.timer) clearInterval(state.timer);
    if (state.countdownTimer) clearInterval(state.countdownTimer);
    state.timer = null;
    state.countdownTimer = null;
    state.refreshDeadline = 0;
    if (els.refreshCountdown) els.refreshCountdown.textContent = "";
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

    if (els.tempUnit) {
      els.tempUnit.addEventListener("change", () => {
        commitState({ push: false });
        renderWeather(state.lastWeather);
      });
    }

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
      // Only update visual state if needed (optional), but do NOT refresh
      // The user must click Confirm now.
      if (e.target && e.target.classList && e.target.classList.contains("rt")) {
        // visual feedback or logic if we wanted to show "unsaved changes" could go here
      }
    });

    if (els.rtConfirm) {
      els.rtConfirm.addEventListener("click", (e) => {
        // 1. Commit & Refresh
        commitState({ push: false });
        refreshOnce();

        // 2. Close menu
        els.routeTypesWrap.classList.remove("open");
        if (els.rtBtn) els.rtBtn.setAttribute("aria-expanded", "false");
      });

    // optional: debounce could be added here if needed
      const debouncedRefresh = debounce(refreshOnce, 1000);
      state.map.on("moveend", () => {
        debouncedRefresh();
    });


    }

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

    initRtMenu();
  }

  function initRtMenu() {
    if (!els.rtBtn || !els.rtMenu || !els.routeTypesWrap) return;

    function close() {
      els.routeTypesWrap.classList.remove("open");
      els.rtBtn.setAttribute("aria-expanded", "false");
    }

    els.rtBtn.addEventListener("click", () => {
      const open = els.routeTypesWrap.classList.toggle("open");
      els.rtBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      if (!els.routeTypesWrap.contains(e.target)) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function vehicleIcon(x) {
    const vt = (x?.vehicle_type ?? "").toString().toLowerCase();
  
    // Fallback podle vehicle_type textu (pokud někdy přijde)
    if (vt.includes("tram")) return "🚋";
    if (vt.includes("metro") || vt.includes("subway")) return "🚇";
    if (vt.includes("train") || vt.includes("rail")) return "🚆";
    if (vt.includes("bus")) return "🚌";
  
    return "🚍";
  }

  // Debounce function
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
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
})();