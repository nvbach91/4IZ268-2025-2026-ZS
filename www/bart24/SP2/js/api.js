// js/api.js
// API vrstva: Premier League (API-Football), NHL (přes nhl.php proxy)
// minimum requestů + cache, aby jsme nedosáhli rate-limit.


const AppAPI = (() => {
  // === API-Fotbal  ===
  const FOOTBALL_BASE = "https://v3.football.api-sports.io";
  const API_KEY = "30dae4a968b229d5af48d35f96975d9a"; // můj klíč
  const PL_LEAGUE_ID = 39;

  // 2023 a 2022 kvůli historii
  const PL_SEASONS = [2023, 2022];

  // === NHL přes PHP proxy ===
  const NHL_PROXY = "nhl.php";

  // Cache pro PL fixtures (abychom nedosáhli limit 10 req/min)
  const CACHE_KEY = "tipmaster_pl_fixtures_cache_v1";
  const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hodin

  function ajaxJson(opts) {
    return $.ajax({
      url: opts.url,
      method: opts.method || "GET",
      data: opts.data || undefined,
      headers: opts.headers || undefined,
      dataType: "json",
    });
  }

  function plFixturesRequest(season) {
    return ajaxJson({
      url: `${FOOTBALL_BASE}/fixtures`,
      headers: { "x-apisports-key": API_KEY },
      data: {
        league: PL_LEAGUE_ID,
        season: season,
      },
    });
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.ts || !Array.isArray(obj.response)) return null;
      if (Date.now() - obj.ts > CACHE_TTL_MS) return null;

      if (obj.response.length === 0) return null;

      return obj;
    } catch {
      return null;
    }
  }

  function writeCache(payload) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {}
  }

  // Premier League: pro sezóny 2023 a 2022 (kvůli historii)
  
  function getPremierLeague(success, error) {
    const cached = readCache();
    if (cached) {
      success(cached);
      return;
    }

    const reqs = PL_SEASONS.map((s) => plFixturesRequest(s));

    $.when(...reqs)
      .done(function () {
        const allResponses = [];
        for (let i = 0; i < arguments.length; i++) {
          const res = arguments[i][0];
          const arr = res?.response || [];
          allResponses.push(...arr);
        }

        const seen = new Set();
        const merged = [];
        for (const f of allResponses) {
          const id = f?.fixture?.id;
          if (!id) continue;
          if (seen.has(id)) continue;
          seen.add(id);
          merged.push(f);
        }

        merged.sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));

        const payload = {
          response: merged,
          seasons: [...PL_SEASONS],
          results: merged.length,
          errors: [],
          ts: Date.now(),
        };

        writeCache(payload);
        success(payload);
      })
      .fail(function (xhr) {
        error(xhr);
      });
  }


  // NHL: week schedule by date (přes nhl.php) - levý seznam
  // nhl.php očekává: ?date=YYYY-MM-DD  
 

const NHL_WEEK_CACHE_KEY = "tipmaster_nhl_week_cache_v1";
const NHL_WEEK_TTL_MS = 12 * 60 * 60 * 1000; // 12 hodin

function readNhlWeekCache() {
  try {
    const raw = localStorage.getItem(NHL_WEEK_CACHE_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return {};
    return obj;
  } catch {
    return {};
  }
}

function writeNhlWeekCache(cacheObj) {
  try {
    localStorage.setItem(NHL_WEEK_CACHE_KEY, JSON.stringify(cacheObj));
  } catch {}
}







  function getNHL(date, success, error) {
  const all = readNhlWeekCache();
  const hit = all[date];

  if (hit && hit.ts && (Date.now() - hit.ts) < NHL_WEEK_TTL_MS && hit.data) {
    success(hit.data);
    return;
  }

  ajaxJson({
    url: NHL_PROXY,
    data: { date },
  })
    .done((res) => {
      all[date] = { ts: Date.now(), data: res };
      writeNhlWeekCache(all);
      success(res);
    })
    .fail((xhr) => error(xhr));
}


  // NHL: range schedule history (přes nhl.php) - detail/historie
  // nhl.php očekává: ?start=YYYY-MM-DD&end=YYYY-MM-DD
 
  function getNHLRange(start, end, success, error) {
    ajaxJson({
      url: NHL_PROXY,
      data: { start, end },
    })
      .done((res) => success(res))
      .fail((xhr) => error(xhr));
  }

  function getNHLTeamSchedule(teamId, startDate, endDate, success, error) {
    // teamId se ignoruje – historie se stáhne jako range a vyfiltruje se v main.js
    getNHLRange(startDate, endDate, success, error);
  }

  return {
    getPremierLeague, 
    getNHL,          
    getNHLRange,      
    getNHLTeamSchedule,
    PL_SEASONS,
  };
})();
