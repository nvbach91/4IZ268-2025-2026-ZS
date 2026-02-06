// js/main.js
// ----------------------------------------------------
// seznam zápasů, detail, tipování, statistiky
// statistiky z historie (posledních 5 zápasů + posledních 5 vzájemných)
// přehledný výpis zápasů v detailu (soupeř, skóre, datum)
// moje statistiky: skutečný výsledek, trefa/netrefa a úspěšnost

let state = {
  league: "pl",          // "pl" | "nhl"
  matches: [],           // zápasy do levého seznamu
  allMatches: [],        // historie pro výpočty (PL: 2022+2023)
  selectedMatch: null,
  selectedTip: null,
  chart: null,

  // cache pro vyhodnocení tipů v "Moje statistiky"
  plAllFixturesNormalized: null,

  // NHL: cache týdnů
  nhlWeekCache: {},      // { "YYYY-MM-DD": normalizedGames[] }
  nhlDetailReqToken: 0,  // ochrana proti doběhnutí starých requestů

  // UI filtry 
  matchFilterText: "",
  onlyUntipped: false,
  historyLeagueFilter: "all",
};

// ------------------------------
// pomocné funkce

function fmtDateTime(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return (
    d.toLocaleDateString("cs-CZ") +
    " " +
    d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })
  );
}

function safeText(s) {
  return String(s ?? "");
}

function leagueLabel(league) {
  return league === "pl" ? "Premier League" : "NHL";
}

function toISODate(d) {
  // YYYY-MM-DD
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(dateStr, deltaDays) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + deltaDays);
  return toISODate(d);
}

// porovnání tipu / výsledku (číslo vs string, mezery)
function normalizeTipValue(v) {
  const s = String(v ?? "").trim().toUpperCase();
  if (s === "0") return "X";       // kompatibilita
  if (s === "REMIZA") return "X";
  return s; // "1" | "X" | "2" | ""...
}

function isTipHit(tip, outcome) {
  const a = normalizeTipValue(tip);
  const b = normalizeTipValue(outcome);
  if (!a || !b) return false;
  return a === b;
}

function loadNhlWeekCacheFromStorage() {
  try {
    const raw = localStorage.getItem("tipmaster_nhl_week_cache_v1");
    if (!raw) return;
    const all = JSON.parse(raw);
    if (!all || typeof all !== "object") return;

    for (const dateStr of Object.keys(all)) {
      const item = all[dateStr];
      const res = item?.data;
      if (!res) continue;

      const week = res?.gameWeek || [];
      const games = week.flatMap((d) => d.games || []);
      const normalized = games.map(normalizeNHL);

      state.nhlWeekCache[dateStr] = normalized;
    }
  } catch {}
}

// ------------------------------
// Normalizace dat

function normalizePL(fixt) {
  return {
    league: "pl",
    id: fixt.fixture.id,
    date: fixt.fixture.date,
    home: { id: fixt.teams.home.id, name: fixt.teams.home.name },
    away: { id: fixt.teams.away.id, name: fixt.teams.away.name },
    status: fixt.fixture.status?.short || "",
    goals: { home: fixt.goals?.home, away: fixt.goals?.away },
    raw: fixt,
  };
}

function normalizeNHL(game) {
  const homeName = game.homeTeam?.placeName?.default
    ? `${game.homeTeam.placeName.default} ${game.homeTeam.commonName?.default || ""}`.trim()
    : (game.homeTeam?.name?.default || game.homeTeam?.teamName?.default || game.homeTeam?.abbrev || "Home");

  const awayName = game.awayTeam?.placeName?.default
    ? `${game.awayTeam.placeName.default} ${game.awayTeam.commonName?.default || ""}`.trim()
    : (game.awayTeam?.name?.default || game.awayTeam?.teamName?.default || game.awayTeam?.abbrev || "Away");

  return {
    league: "nhl",
    id: game.id,
    date: game.startTimeUTC || game.gameDate || "",
    home: {
      id: game.homeTeam?.id || null,
      name: homeName,
      abbrev: game.homeTeam?.abbrev || "",
      score: game.homeTeam?.score,
    },
    away: {
      id: game.awayTeam?.id || null,
      name: awayName,
      abbrev: game.awayTeam?.abbrev || "",
      score: game.awayTeam?.score,
    },
    status: game.gameState || game.gameScheduleState || "",
    goals: { home: game.homeTeam?.score, away: game.awayTeam?.score },
    raw: game,
  };
}

// ------------------------------
// storage tipů

function getTipsStore() {
  try {
    const raw = localStorage.getItem("tipmaster_tips");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTipsStore(arr) {
  localStorage.setItem("tipmaster_tips", JSON.stringify(arr));
}

function tipKey(match) {
  return `${match.league}:${match.id}`;
}

function getSavedTip(match) {
  const tips = getTipsStore();
  return tips.find((t) => t.key === tipKey(match)) || null;
}

function buildTippedKeySet() {
  const tips = getTipsStore();
  return new Set(tips.map((t) => t.key));
}

// výstup
function getOutcomeFromScore(h, a) {
  if (typeof h !== "number" || typeof a !== "number") return null;
  if (h > a) return "1";
  if (h < a) return "2";
  return "X";
}

function getOutcomeFromMatch(match) {
  const h = match.goals?.home;
  const a = match.goals?.away;
  if (typeof h !== "number" || typeof a !== "number") return null;

  if (match.league === "pl") return getOutcomeFromScore(h, a);

  const lastPeriodType = match.raw?.gameOutcome?.lastPeriodType || ""; // "REG" | "OT" | "SO" ...
  if (lastPeriodType && lastPeriodType !== "REG") return "X";
  return getOutcomeFromScore(h, a);
}

// ------------------------------
// pohledy

function showMainView() {
  $("#view-main").removeClass("hidden");
  $("#view-stats").addClass("hidden");
  $("#nav-matches").addClass("nav-link--active");
  $("#nav-stats").removeClass("nav-link--active");
}

function showStatsView() {
  $("#view-main").addClass("hidden");
  $("#view-stats").removeClass("hidden");
  $("#nav-matches").removeClass("nav-link--active");
  $("#nav-stats").addClass("nav-link--active");
  renderStats();
}

// ------------------------------
// upload zápasů (levý seznam)

function loadMatches() {
  const $list = $("#matches-list");
  $list.html(`<div class="muted">Načítám…</div>`);

  state.selectedMatch = null;
  state.selectedTip = null;
  renderDetailEmpty();
  setTipControlsEnabled(false);

  const league = String(state.league || "").toLowerCase();

  if (league === "pl") {
    AppAPI.getPremierLeague(
      (res) => {
        const fixtures = res?.response || [];

        if (!fixtures.length) {
          const msg =
            (res?.errors && Object.keys(res.errors).length
              ? `API errors: ${JSON.stringify(res.errors)}`
              : (res?.message ? String(res.message) : "Žádné zápasy z API."));

          state.matches = [];
          state.allMatches = [];
          $list.html(`<div class="muted">${msg}</div>`);
          renderDetailEmpty();
          setTipControlsEnabled(false);
          return;
        }

        const normalizedAll = fixtures.map(normalizePL);
        state.allMatches = normalizedAll;

        const sortedDesc = [...normalizedAll].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        state.matches = sortedDesc.slice(0, 80);

        renderMatchesList();
        restoreFromUrl();
      },
      () => {
        state.matches = [];
        state.allMatches = [];
        $list.html(`<div class="muted">Zápasy se nepodařilo načíst.</div>`);
      }
    );
    return;
  }

  // NHL – levý seznam: týden kolem konkrétního data
  const NHL_LIST_DATE = "2024-12-13";

  AppAPI.getNHL(
    NHL_LIST_DATE,
    (res) => {
      const week = res?.gameWeek || [];
      const games = week.flatMap((d) => d.games || []);
      const normalized = games.map(normalizeNHL);

      state.matches = normalized;
      state.allMatches = normalized;

      state.nhlWeekCache[NHL_LIST_DATE] = normalized;

      renderMatchesList();
      restoreFromUrl();
    },
    () => {
      state.matches = [];
      state.allMatches = [];
      $list.html(`<div class="muted">Zápasy se nepodařilo načíst.</div>`);
    }
  );
}

function renderMatchesList() {
  const $list = $("#matches-list");
  if (!state.matches.length) {
    $list.html(`<div class="muted">Žádné zápasy.</div>`);
    return;
  }

  const tippedKeys = buildTippedKeySet();
  const q = String(state.matchFilterText || "").trim().toLowerCase();

  const filtered = state.matches.filter((m) => {
    const key = tipKey(m);
    const isTipped = tippedKeys.has(key);

    if (state.onlyUntipped && isTipped) return false; // 2. oprava checkbox 

    if (q) {
      const hay = `${m.home.name} ${m.away.name}`.toLowerCase(); // 1. oprava
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (!filtered.length) {
    $list.html(`<div class="muted">Žádné zápasy neodpovídají filtru.</div>`);
    return;
  }

  const html = filtered
    .map((m) => {
      const when = fmtDateTime(m.date);
      const active = state.selectedMatch && state.selectedMatch.id === m.id ? " match-item--active" : "";
      const isTipped = tippedKeys.has(tipKey(m));
      const tippedClass = isTipped ? " match-item--tipped" : "";
      const badge = isTipped ? `<span class="match-badge">tip ✓</span>` : ""; // 2. oprava

      return `
        <div class="match-item${active}${tippedClass}" data-id="${m.id}">
          <div class="match-date">${when}</div>
          <div class="match-teams"><strong>${safeText(m.home.name)}</strong> vs <strong>${safeText(m.away.name)}</strong>${badge}</div>
        </div>
      `;
    })
    .join("");

  $list.html(html);
}

// Detail, stats (z allMatches = historie)

function renderDetailEmpty() {
  $("#match-detail").html(`<div class="muted">Vyber zápas ze seznamu.</div>`);
  $("#tip-status").addClass("hidden");
}

function setTipControlsEnabled(enabled) {
  $(".tip-btn").prop("disabled", !enabled);
  $("#save-tip").prop("disabled", !enabled);
}

function selectMatchById(id) {
  //  nevybírat opakovaně ten samý prvek
  if (state.selectedMatch && String(state.selectedMatch.id) === String(id)) return; // 6. oprava - nevybírat opakovaně ten samý prvek

  const match = state.matches.find((m) => String(m.id) === String(id)); // 7. oprava hledat pomocí ID
  if (!match) return;

  state.selectedMatch = match;
  state.selectedTip = null;

  const url = new URL(window.location.href);
  url.searchParams.set("league", state.league);
  url.searchParams.set("match", match.id);
  window.history.pushState({}, "", url.toString());

  renderMatchesList();
  renderMatchDetail(match);
  setTipControlsEnabled(true);
  loadSavedTipToUI(match);
}

function loadSavedTipToUI(match) {
  const saved = getSavedTip(match);

  $(".tip-btn").removeClass("tip-btn--active");
  $("#tip-status").addClass("hidden");

  if (saved?.tip) {
    state.selectedTip = saved.tip;
    $(`.tip-btn[data-tip="${saved.tip}"]`).addClass("tip-btn--active");
    $("#tip-status").removeClass("hidden").text(`Uložený tip: ${saved.tip} ✓`);
  }
}

// ------------------------------
// Společné pomocné funkce pro PL i NHL výpočty

function isSameTeam(match, team, side) {
  if (match.league === "pl") return String(match[side].id) === String(team.id);
  return (match[side].abbrev || "") === (team.abbrev || "");
}

function isTeamInMatch(m, team) {
  return isSameTeam(m, team, "home") || isSameTeam(m, team, "away");
}

function isPlayed(m) {
  const h = m.goals?.home;
  const a = m.goals?.away;
  return typeof h === "number" && typeof a === "number";
}

function getOpponentName(m, team) {
  const teamIsHome = isSameTeam(m, team, "home");
  return teamIsHome ? m.away.name : m.home.name;
}

function getTeamScoreLine(m, team) {
  const teamIsHome = isSameTeam(m, team, "home");
  const h = m.goals.home;
  const a = m.goals.away;
  const tg = teamIsHome ? h : a;
  const og = teamIsHome ? a : h;
  return { tg, og, teamIsHome };
}

function computeLast5Team(match, teamSide) {
  const team = match[teamSide];
  const matchDate = new Date(match.date);

  const played = state.allMatches
    .filter((m) => {
      if (m.league !== match.league) return false;
      const d = new Date(m.date);
      if (Number.isNaN(d.getTime())) return false;
      if (d >= matchDate) return false;
      if (!isTeamInMatch(m, team)) return false;
      return isPlayed(m);
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .reverse();

  let gf = 0, ga = 0, pts = 0;
  let w = 0, dr = 0, l = 0;

  const rows = played.map((m) => {
    const dte = fmtDateTime(m.date);
    const opp = getOpponentName(m, team);
    const line = getTeamScoreLine(m, team);

    gf += line.tg;
    ga += line.og;

    let decSuffix = "";
    if (match.league === "nhl") {
      const lastPeriodType = String(m.raw?.gameOutcome?.lastPeriodType || "").toUpperCase();
      if (lastPeriodType && lastPeriodType !== "REG") decSuffix = ` ${lastPeriodType}`;
    }

    let resLetter = "R";
    if (line.tg > line.og) resLetter = "V";
    else if (line.tg < line.og) resLetter = "P";

    if (match.league === "pl") {
      if (line.tg > line.og) { w++; pts += 3; }
      else if (line.tg < line.og) { l++; pts += 0; }
      else { dr++; pts += 1; }
    } else {
      const lastPeriodType = String(m.raw?.gameOutcome?.lastPeriodType || "").toUpperCase();
      const isOTorSO = lastPeriodType && lastPeriodType !== "REG";

      if (line.tg > line.og) {
        w++; pts += 2;
      } else if (line.tg < line.og) {
        l++; pts += isOTorSO ? 1 : 0;
      } else {
        dr++; pts += 1;
      }
    }

    const ha = line.teamIsHome ? "D" : "V";

    return {
      date: dte,
      opponent: opp,
      ha,
      score: `${line.tg}:${line.og}${decSuffix}`,
      res: resLetter,
    };
  });

  return { playedCount: played.length, gf, ga, pts, w, d: dr, l, rows };
}

function computeLast5H2H(match) {
  const matchDate = new Date(match.date);

  const h2h = state.allMatches
    .filter((m) => {
      if (m.league !== match.league) return false;

      const d = new Date(m.date);
      if (Number.isNaN(d.getTime())) return false;
      if (d >= matchDate) return false;
      if (!isPlayed(m)) return false;

      const hasHomeTeam = isTeamInMatch(m, match.home);
      const hasAwayTeam = isTeamInMatch(m, match.away);
      return hasHomeTeam && hasAwayTeam;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .reverse();

  return h2h.map((m) => {
    const base = { date: fmtDateTime(m.date), home: m.home.name, away: m.away.name };

    const h = m.goals?.home;
    const a = m.goals?.away;

    if (typeof h !== "number" || typeof a !== "number") return { ...base, score: "—", outcome: null };

    if (match.league === "pl") {
      return { ...base, score: `${h}:${a}`, outcome: getOutcomeFromScore(h, a) };
    }

    const finalOutcome = getOutcomeFromScore(h, a);
    const lastPeriodType = String(m.raw?.gameOutcome?.lastPeriodType || "REG").toUpperCase();
    const isExtraTime = lastPeriodType !== "REG";
    const outcome60 = isExtraTime ? "X" : finalOutcome;

    let scoreText = `${h}:${a}`;
    if (isExtraTime) scoreText = `${h}:${a} ${lastPeriodType} (${finalOutcome}, základní hrací doba X)`;

    return { ...base, score: scoreText, outcome: outcome60, finalOutcome, decision: lastPeriodType };
  });
}

// pravděpodobnosti (žádná záporná / >100 %)
function clamp01(x) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function computePrediction(homeStats, awayStats) {
  const homeGD = (homeStats.gf - homeStats.ga);
  const awayGD = (awayStats.gf - awayStats.ga);

  const homeStrength = (homeStats.pts ?? 0) + homeGD * 0.3;
  const awayStrength = (awayStats.pts ?? 0) + awayGD * 0.3;

  const diff = homeStrength - awayStrength;

  const k = 0.55;
  const homeWin = 1 / (1 + Math.exp(-k * diff));

  let draw = 0.22;
  const ad = Math.abs(diff);
  if (ad < 0.8) draw = 0.30;
  else if (ad < 1.6) draw = 0.26;
  draw = clamp01(draw);

  const rest = clamp01(1 - draw);
  let p1 = rest * homeWin;
  let p2 = rest * (1 - homeWin);
  let pX = draw;

  p1 = clamp01(p1);
  p2 = clamp01(p2);
  pX = clamp01(pX);

  const sum = p1 + p2 + pX;
  if (sum <= 0) {
    p1 = 0.39; pX = 0.22; p2 = 0.39;
  } else {
    p1 /= sum; pX /= sum; p2 /= sum;
  }

  const toPct = (x) => Math.round(x * 1000) / 10;

  let comment = "Vyrovnaný zápas.";
  if (p1 > 0.55) comment = "Domácí mají lepší aktuální formu.";
  else if (p2 > 0.55) comment = "Hosté mají lepší aktuální formu.";
  else if (pX > 0.28) comment = "Vysoká šance na remízu (týmy jsou si blízko).";

  return { p1: toPct(p1), pX: toPct(pX), p2: toPct(p2), comment };
}

// ------------------------------
// NHL: historie z více týdnů (mode=week) pro detail

function extractNormalizedFromWeekResponse(res) {
  const week = res?.gameWeek || [];
  const games = week.flatMap((d) => d.games || []);
  return games.map(normalizeNHL);
}

function mergeUniqueMatches(arr) {
  const seen = new Set();
  const out = [];
  for (const m of arr) {
    const k = String(m.id);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(m);
  }
  return out;
}

function countNeededBeforeMatch(all, match) {
  const matchDate = new Date(match.date);

  const homePlayed = all.filter((m) =>
    m.league === "nhl" &&
    isPlayed(m) &&
    new Date(m.date) < matchDate &&
    isTeamInMatch(m, match.home)
  ).length;

  const awayPlayed = all.filter((m) =>
    m.league === "nhl" &&
    isPlayed(m) &&
    new Date(m.date) < matchDate &&
    isTeamInMatch(m, match.away)
  ).length;

  const h2hPlayed = all.filter((m) =>
    m.league === "nhl" &&
    isPlayed(m) &&
    new Date(m.date) < matchDate &&
    isTeamInMatch(m, match.home) &&
    isTeamInMatch(m, match.away)
  ).length;

  return { homePlayed, awayPlayed, h2hPlayed };
}

function ensureNHLHistoryForDetail(match, done) {
  if (match.league !== "nhl") { done(); return; }

  const myToken = ++state.nhlDetailReqToken;
  const startDate = toISODate(match.date) || "2024-12-14";

  let collected = [...(state.allMatches || [])];

  const MAX_WEEKS_BACK_BASE = 14;  // 5+5
  const MAX_WEEKS_BACK_H2H  = 20;  // aspoň 2 H2H

  function finish() {
    state.allMatches = mergeUniqueMatches(collected)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    done();
  }

  function wantStop(step) {
    const c = countNeededBeforeMatch(collected, match);
    const haveTeams = (c.homePlayed >= 5 && c.awayPlayed >= 5);
    const haveH2H = (c.h2hPlayed >= 2);
    if (step <= MAX_WEEKS_BACK_BASE) return haveTeams && haveH2H;
    return haveTeams && haveH2H;
  }

  function canContinue(step) {
    return step <= MAX_WEEKS_BACK_H2H;
  }

  function fetchWeek(dateStr, step) {
    if (state.nhlDetailReqToken !== myToken) return;

    if (!canContinue(step)) { finish(); return; }

    if (state.nhlWeekCache[dateStr]) {
      collected = mergeUniqueMatches(collected.concat(state.nhlWeekCache[dateStr]));
      if (wantStop(step)) { finish(); return; }
      fetchWeek(addDays(dateStr, -7), step + 1);
      return;
    }

    AppAPI.getNHL(
      dateStr,
      (res) => {
        if (state.nhlDetailReqToken !== myToken) return;

        const normalized = extractNormalizedFromWeekResponse(res);
        state.nhlWeekCache[dateStr] = normalized;

        collected = mergeUniqueMatches(collected.concat(normalized));
        if (wantStop(step)) { finish(); return; }

        fetchWeek(addDays(dateStr, -7), step + 1);
      },
      () => {
        if (state.nhlDetailReqToken !== myToken) return;
        fetchWeek(addDays(dateStr, -7), step + 1);
      }
    );
  }

  fetchWeek(startDate, 0);
}

// ------------------------------
// Render detail

function renderLastMatchesTable(title, stats) {
  if (!stats.playedCount) {
    return `
      <div class="detail-block">
        <h3>${safeText(title)}</h3>
        <div class="muted">V historii před tímto datem jsem nenašel odehrané zápasy (v rámci stažených dat).</div>
      </div>
    `;
  }

  const rowsHtml = stats.rows
    .map((r) => `
      <tr>
        <td class="muted">${safeText(r.date)}</td>
        <td>${safeText(r.ha)}</td>
        <td>${safeText(r.opponent)}</td>
        <td><strong>${safeText(r.score)}</strong></td>
        <td>${safeText(r.res)}</td>
      </tr>
    `)
    .join("");

  return `
    <div class="detail-block">
      <h3>${safeText(title)}</h3>
      <div class="muted">Souhrn: <strong>${stats.w}-${stats.d}-${stats.l}</strong> • Góly: <strong>${stats.gf}:${stats.ga}</strong> • Body: <strong>${stats.pts}</strong></div>
      <table class="detail-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>D/V</th>
            <th>Soupeř</th>
            <th>Skóre</th>
            <th>V/R/P</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="muted">Legenda: D = doma, V = venku • V/R/P = výhra/remíza/prohra</div>
    </div>
  `;
}

function renderH2HTable(h2hRows) {
  if (!h2hRows.length) {
    return `
      <div class="detail-block">
        <h3>Posledních 5 vzájemných zápasů</h3>
        <div class="muted">V historii před tímto datem nebyly nalezeny odehrané vzájemné zápasy.</div>
      </div>
    `;
  }

  const rowsHtml = h2hRows
    .map((r) => `
      <tr>
        <td class="muted">${safeText(r.date)}</td>
        <td>${safeText(r.home)} vs ${safeText(r.away)}</td>
        <td><strong>${safeText(r.score)}</strong></td>
      </tr>
    `)
    .join("");

  return `
    <div class="detail-block">
      <h3>Posledních ${h2hRows.length} vzájemných zápasů</h3>
      <table class="detail-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Zápas</th>
            <th>Výsledek</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

function renderMatchDetailSync(match) {
  const when = fmtDateTime(match.date);

  const homeStats = computeLast5Team(match, "home");
  const awayStats = computeLast5Team(match, "away");
  const h2h = computeLast5H2H(match);
  const pred = computePrediction(homeStats, awayStats);

  const html = `
    <div class="detail-head">
      <div class="detail-title">${safeText(match.home.name)} - ${safeText(match.away.name)}</div>
      <div class="detail-sub">${when} • ${leagueLabel(match.league)}</div>
    </div>

    ${renderLastMatchesTable("Domácí - posledních 5 zápasů", homeStats)}
    ${renderLastMatchesTable("Hosté - posledních 5 zápasů", awayStats)}
    ${renderH2HTable(h2h)}

    <div class="detail-block">
      <h3>Predikce výsledku (1 / X / 2)</h3>
      <div class="pred-row">
        <div class="pred-box"><div class="pred-label">1</div><div class="pred-val">${pred.p1} %</div></div>
        <div class="pred-box"><div class="pred-label">X</div><div class="pred-val">${pred.pX} %</div></div>
        <div class="pred-box"><div class="pred-label">2</div><div class="pred-val">${pred.p2} %</div></div>
      </div>
      <div class="pred-comment">${safeText(pred.comment)}</div>
    </div>
  `;

  $("#match-detail").html(html);
  $("#tip-status").addClass("hidden");
}

function renderMatchDetail(match) {
  if (match.league === "pl") {
    renderMatchDetailSync(match);
    return;
  }

  const when = fmtDateTime(match.date);
  $("#match-detail").html(`
    <div class="detail-head">
      <div class="detail-title">${safeText(match.home.name)} - ${safeText(match.away.name)}</div>
      <div class="detail-sub">${when} • ${leagueLabel(match.league)}</div>
    </div>
    <div class="muted">Načítám historii týmů pro detail…</div>
  `);

  const selectedId = String(match.id);
  ensureNHLHistoryForDetail(match, () => {
    if (!state.selectedMatch || String(state.selectedMatch.id) !== selectedId) return;
    renderMatchDetailSync(match);
    loadSavedTipToUI(match);
  });
}

// ------------------------------
// Tipování

function bindTipEvents() {
  $(".tip-btn").on("click", function () {
    if (!state.selectedMatch) return;

    const t = $(this).data("tip");
    state.selectedTip = t;

    $(".tip-btn").removeClass("tip-btn--active");
    $(this).addClass("tip-btn--active");

    $("#tip-status").addClass("hidden");
  });

  $("#save-tip").on("click", function () {
    if (!state.selectedMatch || !state.selectedTip) return;

    const match = state.selectedMatch;
    const tips = getTipsStore();
    const key = tipKey(match);

    const existingIndex = tips.findIndex((x) => x.key === key);

    const record = {
      key,
      league: match.league,
      matchId: match.id,
      date: match.date,
      home: match.home.name,
      away: match.away.name,
      tip: state.selectedTip,

      outcome: getOutcomeFromMatch(match),
      score:
        (typeof match.goals?.home === "number" && typeof match.goals?.away === "number")
          ? `${match.goals.home}:${match.goals.away}`
          : null,

      savedAt: new Date().toISOString(), // čas uložení
    };

    if (existingIndex >= 0) tips[existingIndex] = record;
    else tips.push(record);

    saveTipsStore(tips);

    $(".tip-btn").removeClass("tip-btn--active");
    $(`.tip-btn[data-tip="${state.selectedTip}"]`).addClass("tip-btn--active");

    $("#tip-status").removeClass("hidden").text(`Tip uložen: ${state.selectedTip} ✓`);

    // po uložení tipů hned aktualizuj seznam (badge + filtr netipovaných)
    renderMatchesList();
  });
}

// ------------------------------
// Moje statistiky, PL výsledky dohledat z cache

function ensurePLFixturesForStats(cb) {
  if (state.plAllFixturesNormalized) { cb(); return; }

  AppAPI.getPremierLeague(
    (res) => {
      const fixtures = res?.response || [];
      state.plAllFixturesNormalized = fixtures.map(normalizePL);
      cb();
    },
    () => {
      state.plAllFixturesNormalized = [];
      cb();
    }
  );
}

function resolveRealResultForTip(tip) {
  if (tip.league === "pl") {
    const arr = state.plAllFixturesNormalized || [];
    const m = arr.find((x) => String(x.id) === String(tip.matchId));
    if (!m) return null;

    const h = m.goals?.home;
    const a = m.goals?.away;
    const outcome = getOutcomeFromScore(h, a);
    if (!outcome) return null;

    return { outcome, score: `${h}:${a}` };
  }

  if (tip.league === "nhl") {
    const m = (state.allMatches || []).find(
      (x) => x.league === "nhl" && String(x.id) === String(tip.matchId)
    );
    if (!m) return null;

    const h = m.goals?.home;
    const a = m.goals?.away;
    const finalOutcome = getOutcomeFromScore(h, a);
    if (!finalOutcome) return null;

    const lastPeriodType = (m.raw?.gameOutcome?.lastPeriodType || "").toUpperCase();
    const isExtraTime = lastPeriodType && lastPeriodType !== "REG";

    const outcome60 = isExtraTime ? "X" : finalOutcome;

    let scoreText = `${h}:${a}`;
    if (isExtraTime) {
      scoreText = `${h}:${a} ${lastPeriodType} (${finalOutcome}, základní hrací doba X)`;
    }

    return { outcome: outcome60, score: scoreText };
  }

  return null;
}

// ------------------------------
// Statistiky pohled

function renderStats() {
  ensurePLFixturesForStats(() => {
    let tips = getTipsStore();

    let changed = false;
    tips = tips.map((t) => {
      const isNhl = t.league === "nhl";
      const hasScore = !!t.score;
      const hasOutcome = !!t.outcome;

      const needsNhlUpgrade =
        isNhl &&
        hasScore &&
        !String(t.score).includes("základní hrací doba");

      if (hasOutcome && hasScore && !needsNhlUpgrade) return t;

      const real = resolveRealResultForTip(t);
      if (!real) return t;

      changed = true;
      return { ...t, outcome: real.outcome, score: real.score };
    });

    if (changed) saveTipsStore(tips);

    //  filtr historie ligy 
    const leagueFilter = String(state.historyLeagueFilter || "all");
    const filteredTips = tips.filter((t) => leagueFilter === "all" ? true : t.league === leagueFilter); //4. oprava filtr lig 

    //  tabulka historie
    const $hist = $("#history-list");
    if (!filteredTips.length) {
      $hist.html(`<tr><td class="muted" colspan="6">Zatím nemáš uložený žádný tip.</td></tr>`);
    } else {
      // NOVÉ (řadí podle času uložení tipu - nejnovější nahoře):
const sorted = [...filteredTips].sort((a, b) => { //2.3 oprava
    // Použijeme savedAt (čas uložení), pokud neexistuje (stará data), dáme 0
    const timeA = new Date(a.savedAt || 0); 
    const timeB = new Date(b.savedAt || 0);
    return timeB - timeA; // B - A znamená sestupně (nejnovější první)
});

      $hist.html(
        sorted.map((t) => {
          const when = fmtDateTime(t.date);
          const matchTxt = `${safeText(t.home)} vs ${safeText(t.away)}`;

          let resultTxt = `<span class="muted">neznámý</span>`;
          if (t.score && t.outcome) {
            if (t.league === "nhl" && String(t.score).includes("základní hrací doba")) {
              resultTxt = `<strong>${t.score}</strong>`;
            } else {
              resultTxt = `<strong>${t.score}</strong> (${t.outcome})`;
            }
          }

          const savedAtTxt = t.savedAt ? fmtDateTime(t.savedAt) : "—"; // 3. oprava

          let stateTxt = "—";
          if (t.outcome) {
            if (isTipHit(t.tip, t.outcome)) {
              //  zelená fajfka bez čtverečku + trefa černě
              stateTxt = `<span class="hit-icon">✔</span> <span class="hit-text">trefa</span>`;
            } else {
              stateTxt = `<span class="miss-icon">✖</span> <span class="miss-text">netrefa</span>`;
            }
          }

          return `
            <tr>
              <td class="muted">${when}</td>
              <td>${matchTxt}</td>
              <td><strong>${safeText(t.tip)}</strong></td>
              <td>${resultTxt}</td>
              <td class="muted">${savedAtTxt}</td>
              <td>${stateTxt}</td>
            </tr>
          `;
        }).join("")
      );
    }

    function calcFor(league) {
      const items = tips.filter((t) => (league ? t.league === league : true));
      const finished = items.filter((t) => !!t.outcome);
      const correct = finished.filter((t) => isTipHit(t.tip, t.outcome));

      return {
        total: items.length,
        finished: finished.length,
        correct: correct.length,
        pct: finished.length ? Math.round((correct.length / finished.length) * 1000) / 10 : null,
      };
    }

    const all = calcFor(null);
    const pl = calcFor("pl");
    const nhl = calcFor("nhl");

    $("#stats-lines").html(`
      <div>Celkový počet tipů: <strong>${all.total}</strong> (vyhodnoceno: ${all.finished})</div>
      <div>Celková úspěšnost: <strong>${all.pct === null ? "—" : all.pct + " %"}</strong> (${all.correct}/${all.finished})</div>
      <div>Premier League: <strong>${pl.pct === null ? "—" : pl.pct + " %"}</strong> (${pl.correct}/${pl.finished})</div>
      <div>NHL: <strong>${nhl.pct === null ? "—" : nhl.pct + " %"}</strong> (${nhl.correct}/${nhl.finished})</div>
    `);

    const finishedSorted = tips
      .filter((t) => !!t.outcome)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = [];
    const data = [];
    let ok = 0;

    finishedSorted.forEach((t, i) => {
      labels.push(new Date(t.date).toLocaleDateString("cs-CZ"));
      if (isTipHit(t.tip, t.outcome)) ok++;
      data.push(Math.round((ok / (i + 1)) * 1000) / 10);
    });

    const ctx = document.getElementById("stats-chart");
    if (!ctx) return;

    if (state.chart) {
      state.chart.destroy();
      state.chart = null;
    }

    state.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{ label: "Úspěšnost (%)", data, tension: 0.25 }],
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true, suggestedMax: 100 } },
      },
    });
  });
}

// ------------------------------
// URL

function restoreFromUrl() {
  const url = new URL(window.location.href);
  const league = url.searchParams.get("league");
  const match = url.searchParams.get("match");

  if (league && (league === "pl" || league === "nhl")) {
    state.league = league;
    $("#league-select").val(league);
  }

  if (match) selectMatchById(match);
}

// ------------------------------
// Initializace

function bindUiExtras() { // 2.1 oprava
let filterTimeout; // Proměnná pro časovač
$("#match-filter").on("input", function () {
  const val = $(this).val();
  
  // Pokud uživatel píše dál, zrušíme předchozí čekání
  clearTimeout(filterTimeout);
  
  // Nastavíme nové čekání na 300ms
  filterTimeout = setTimeout(() => {
    state.matchFilterText = val;
    renderMatchesList();
  }, 300);
});

 // --- SEM VLOŽIT NOVÝ KÓD ---

// 1. Hned při startu načteme stav z paměti
const savedUntipped = localStorage.getItem("tipmaster_only_untipped"); // 2.2 oprava
if (savedUntipped === "true") {
  state.onlyUntipped = true;
  $("#only-untipped").prop("checked", true);
  // Pokud chcete hned filtrovat, zavoláme i renderMatchesList(), 
  // ale obvykle stačí nastavit state, protože loadMatches() se volá až na konci.
}

// 2. Při změně checkboxu stav uložíme
$("#only-untipped").on("change", function () {
  state.onlyUntipped = $(this).is(":checked");
  localStorage.setItem("tipmaster_only_untipped", state.onlyUntipped);
  renderMatchesList();
});

  $("#history-league").on("change", function () {
    state.historyLeagueFilter = $(this).val();
    renderStats();
  });

/* --- VLOŽIT NOVÉ (Logika pro <dialog>) --- */
  
  const deleteDialog = document.getElementById("delete-dialog");
  const confirmBtn = document.getElementById("btn-confirm-delete");

  // A) Kliknutí na tlačítko "Reset dat" jen OTEVŘE okno
  $("#reset-data").on("click", function () {
    if (deleteDialog) {
      deleteDialog.showModal();
    }
  });

  // B) Kliknutí na "Ano, smazat" uvnitř okna PROVEDE výmaz
  if (confirmBtn) {
    // Používáme .onclick místo addEventListener, aby se událost nepřidávala 
    // vícekrát, pokud by se funkce bindUiExtras volala opakovaně.
    confirmBtn.onclick = function() {
      // 1. Reset úložiště
      localStorage.removeItem("tipmaster_tips");
      localStorage.removeItem("tipmaster_pl_fixtures_cache_v1");
      localStorage.removeItem("tipmaster_nhl_week_cache_v1");
      localStorage.removeItem("tipmaster_only_untipped");

      // 2. Reset paměti
      state.plAllFixturesNormalized = null;
      state.nhlWeekCache = {};
      
      // 3. Reset UI
      state.matchFilterText = "";
      state.onlyUntipped = false;
      $("#match-filter").val("");
      $("#only-untipped").prop("checked", false);

      // 4. Aktualizace aplikace
      loadMatches();
      renderStats();
      
      // 5. Zavření okna (formulář ho zavře sám, ale pro jistotu)
      if (deleteDialog) deleteDialog.close();
    };
  }
}

function main() {
  loadNhlWeekCacheFromStorage();

  $("#nav-matches").on("click", (e) => {
    e.preventDefault();
    showMainView();
  });

  $("#nav-stats").on("click", (e) => {
    e.preventDefault();
    showStatsView();
  });

  $("#league-select").on("change", function () {
    state.league = $(this).val();

    const url = new URL(window.location.href);
    url.searchParams.set("league", state.league);
    url.searchParams.delete("match");
    window.history.pushState({}, "", url.toString());

    loadMatches();
  });

  $("#matches-list").on("click", ".match-item", function () {
    const id = $(this).data("id");
    selectMatchById(id);
  });

  bindTipEvents();
  bindUiExtras();

  showMainView();
  loadMatches();

  window.addEventListener("popstate", () => {
    const url = new URL(window.location.href);
    const match = url.searchParams.get("match");
    if (match) selectMatchById(match);
    else {
      state.selectedMatch = null;
      renderMatchesList();
      renderDetailEmpty();
      setTipControlsEnabled(false);
    }
  });
}

$(document).ready(main);
