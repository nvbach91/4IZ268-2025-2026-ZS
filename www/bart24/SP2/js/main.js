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

    // převedeme uložené week-responses na normalized a nacpeme do state.nhlWeekCache
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

  // PL: normálně podle finálního skóre
  if (match.league === "pl") {
    return getOutcomeFromScore(h, a);
  }

  // NHL: 60 minut (sázkovkově)
  const lastPeriodType = match.raw?.gameOutcome?.lastPeriodType || ""; // "REG" | "OT" | "SO" ...
  if (lastPeriodType && lastPeriodType !== "REG") {
    // šlo se do OT/SO => po 60 minutách to byla remíza
    return "X";
  }

  // REG => po 60 min = finální skóre
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

  // ---------------- PL ----------------

  if (league === "pl") {
    AppAPI.getPremierLeague(
      (res) => {
        const fixtures = res?.response || [];

        // Když API vrátí 200, ale response je prázdná (typicky limit/plan/error),
        // zobraz aspoň info z payloadu:
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
      (xhr) => {
        state.matches = [];
        state.allMatches = [];
        $list.html(`<div class="muted">Zápasy se nepodařilo načíst.</div>`);
      }
    );

    return; 
  }

  // ---------------- NHL ----------------
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

  const html = state.matches
    .map((m) => {
      const when = fmtDateTime(m.date);
      const active = state.selectedMatch && state.selectedMatch.id === m.id ? " match-item--active" : "";
      return `
        <div class="match-item${active}" data-id="${m.id}">
          <div class="match-date">${when}</div>
          <div class="match-teams"><strong>${safeText(m.home.name)}</strong> vs <strong>${safeText(m.away.name)}</strong></div>
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
  const match = state.matches.find((m) => String(m.id) === String(id));
  if (!match) return;

  state.selectedMatch = match;
  state.selectedTip = null;

  const url = new URL(window.location.href);
  url.searchParams.set("league", state.league);
  url.searchParams.set("match", match.id);
  window.history.pushState({}, "", url.toString());

  renderMatchesList();
  renderMatchDetail(match);     // tady se u NHL případně ještě dotáhne historie
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
  if (match.league === "pl") {
    return String(match[side].id) === String(team.id);
  }
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
    .reverse(); // chronologicky

  let gf = 0, ga = 0, pts = 0;
  let w = 0, dr = 0, l = 0; 

  const rows = played.map((m) => {
    const dte = fmtDateTime(m.date);
    const opp = getOpponentName(m, team);
    const line = getTeamScoreLine(m, team);

    gf += line.tg;
    ga += line.og;

    // NHL dovětek OT/SO do skóre (PL bez dovětku)
    let decSuffix = "";
    if (match.league === "nhl") {
      const lastPeriodType = String(m.raw?.gameOutcome?.lastPeriodType || "").toUpperCase(); // "REG" | "OT" | "SO" ...
      if (lastPeriodType && lastPeriodType !== "REG") decSuffix = ` ${lastPeriodType}`;
    }

    // výsledek pro řádek (V/R/P)
    
    let resLetter = "R";
    if (line.tg > line.og) resLetter = "V";
    else if (line.tg < line.og) resLetter = "P";
    else resLetter = "R";

    // body podle ligy
    if (match.league === "pl") {
      // 3 / 1 / 0
      if (line.tg > line.og) { w++; pts += 3; }
      else if (line.tg < line.og) { l++; pts += 0; }
      else { dr++; pts += 1; }
    } else {
      // NHL: 2 za výhru, 1 za prohru v OT/SO, 0 za prohru v REG
      const lastPeriodType = String(m.raw?.gameOutcome?.lastPeriodType || "").toUpperCase(); // "REG" | "OT" | "SO" ...
      const isOTorSO = lastPeriodType && lastPeriodType !== "REG";

      if (line.tg > line.og) {
        w++; pts += 2;
      } else if (line.tg < line.og) {
        l++; pts += isOTorSO ? 1 : 0;
      } else {
        // fallback (kdyby API vrátilo nerozhodně)
        dr++; pts += 1;
      }
    }

    const ha = line.teamIsHome ? "D" : "V"; // D=domácí, V=venku

    return {
      date: dte,
      opponent: opp,
      ha,
      score: `${line.tg}:${line.og}${decSuffix}`, // OT/SO dovětek
      res: resLetter,
    };
  });

  return {
    playedCount: played.length,
    gf, ga, pts,
    w, d: dr, l,
    rows,
  };
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
    const base = {
      date: fmtDateTime(m.date),
      home: m.home.name,
      away: m.away.name,
    };

    const h = m.goals?.home;
    const a = m.goals?.away;

    // fallback (nemělo by nastat, protože isPlayed)
    if (typeof h !== "number" || typeof a !== "number") {
      return { ...base, score: "—", outcome: null };
    }

    // PL = beze změny (outcome je finální 1/X/2)
    if (match.league === "pl") {
      return {
        ...base,
        score: `${h}:${a}`,
        outcome: getOutcomeFromScore(h, a),
      };
    }

    // NHL:
    const finalOutcome = getOutcomeFromScore(h, a); // 1/X/2 podle finálního skóre 
    const lastPeriodType = String(m.raw?.gameOutcome?.lastPeriodType || "REG").toUpperCase(); // REG | OT | SO
    const isExtraTime = lastPeriodType !== "REG";

    // sázkovkově 60 minut:
    const outcome60 = isExtraTime ? "X" : finalOutcome;

    // výpis skóre:
    // 3:4 OT (2, základní hrací doba X)
    let scoreText = `${h}:${a}`;
    if (isExtraTime) {
      scoreText = `${h}:${a} ${lastPeriodType} (${finalOutcome}, základní hrací doba X)`;
    }

    // outcome vracíme jako 60min (aby seděl s tipy 1/X/2 u NHL = 60 minut)
    return {
      ...base,
      score: scoreText,
      outcome: outcome60,
      finalOutcome,              
      decision: lastPeriodType,  // OT/SO/REG
    };
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

  // sigmoid => vždy 0..1
  const k = 0.55;
  const homeWin = 1 / (1 + Math.exp(-k * diff));

  // draw vyšší když jsou si blízko
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

  const MAX_WEEKS_BACK_BASE = 14;  // rychlý cíl: 5+5
  const MAX_WEEKS_BACK_H2H  = 20;  // extra týdny jen kvůli H2H (aspoň 2)

  function finish() {
    state.allMatches = mergeUniqueMatches(collected)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    done();
  }

  function wantStop(step) {
    const c = countNeededBeforeMatch(collected, match);

    const haveTeams = (c.homePlayed >= 5 && c.awayPlayed >= 5);
    const haveH2H = (c.h2hPlayed >= 2);

    // do 14 týdnů: jen 5+5 
    if (step <= MAX_WEEKS_BACK_BASE) return haveTeams && haveH2H;

    // po 14 týdnech: už 5+5 typicky máme, tak jen “H2H”,
    // ale pořád bezpečně limitované
    return haveTeams && haveH2H;
  }

  function canContinue(step) {
    // do base limitu vždy, potom už jen do H2H limitu
    return step <= MAX_WEEKS_BACK_H2H;
  }

  function fetchWeek(dateStr, step) {
    if (state.nhlDetailReqToken !== myToken) return;

    if (!canContinue(step)) {
      finish();
      return;
    }

    // cache hit
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

    const t = $(this).data("tip"); // "1" | "X" | "2"
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

      savedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) tips[existingIndex] = record;
    else tips.push(record);

    saveTipsStore(tips);

    $(".tip-btn").removeClass("tip-btn--active");
    $(`.tip-btn[data-tip="${state.selectedTip}"]`).addClass("tip-btn--active");

    $("#tip-status").removeClass("hidden").text(`Tip uložen: ${state.selectedTip} ✓`);
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

    // OT / SO / REG z NHL dat
    const lastPeriodType = (m.raw?.gameOutcome?.lastPeriodType || "").toUpperCase(); // "REG" | "OT" | "SO"...
    const isExtraTime = lastPeriodType && lastPeriodType !== "REG";

    // 60 minut (sázkovkově):
    // pokud se šlo do OT/SO, po 60 min to bylo vždy "X"
    const outcome60 = isExtraTime ? "X" : finalOutcome;

    // Výpis skóre do historie tipů
    let scoreText = `${h}:${a}`;
    if (isExtraTime) {
      // 3:4 OT (2, základní hrací doba X)
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

  // u NHL chceme "upgrade" starých záznamů:
  
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

    const $hist = $("#history-list");
    if (!tips.length) {
      $hist.html(`<li class="muted">Zatím nemáš uložený žádný tip.</li>`);
    } else {
      const sorted = [...tips].sort((a, b) => new Date(a.date) - new Date(b.date));
      $hist.html(
        sorted
          .map((t) => {
            const when = fmtDateTime(t.date);
            let scoreTxt = ` • výsledek: <span class="muted">neznámý</span>`;

if (t.score && t.outcome) {
  if (t.league === "nhl" && String(t.score).includes("základní hrací doba")) {
    scoreTxt = ` • výsledek: <strong>${t.score}</strong>`;
  } else {
    scoreTxt = ` • výsledek: <strong>${t.score}</strong> (${t.outcome})`;
  }
}




            
            const hitTxt =
              t.outcome
                ? (isTipHit(t.tip, t.outcome) ? ` <strong class="ok">✅ trefa</strong>` : ` <strong class="bad">❌ netrefa</strong>`)
                : "";

            return `<li>
              ${when} • ${safeText(t.home)} vs ${safeText(t.away)} • tip: <strong>${safeText(t.tip)}</strong>
              ${scoreTxt}
              ${hitTxt}
            </li>`;
          })
          .join("")
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
