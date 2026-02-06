<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

function bad_request($msg) {
  http_response_code(400);
  echo json_encode(["error" => $msg], JSON_UNESCAPED_UNICODE);
  exit;
}

function respond_json($arr) {
  echo json_encode($arr, JSON_UNESCAPED_UNICODE);
  exit;
}

function fetch_raw($url) {
  $opts = [
    "http" => [
      "method" => "GET",
      "header" =>
        "User-Agent: TipMaster/1.0\r\n" .
        "Accept: application/json\r\n" .
        "Connection: close\r\n",
      "timeout" => 15
    ]
  ];
  $ctx = stream_context_create($opts);
  $data = @file_get_contents($url, false, $ctx);
  return $data;
}

function fetch_json_decoded($url) {
  $raw = fetch_raw($url);
  if ($raw === false || $raw === null || $raw === "") return null;
  $decoded = json_decode($raw, true);
  if (!is_array($decoded)) return null;
  return $decoded;
}

/**
 * NHL sezóna pro datum:
 * - sezóna se bere jako YYYY(YYYY+1), např. 20242025
 * - start je typicky podzim, takže pro měsíce 7..12 bereme start=rok, pro 1..6 start=rok-1
 */
function season_for_date($yyyy_mm_dd) {
  $ts = strtotime($yyyy_mm_dd);
  if ($ts === false) return null;
  $y = (int)date("Y", $ts);
  $m = (int)date("n", $ts);
  $start = ($m >= 7) ? $y : ($y - 1);
  $end = $start + 1;
  return (string)$start . (string)$end; // např. "20242025"
}

function ymd($ts) {
  return date("Y-m-d", $ts);
}

/**
 * Vrátí ISO datum (YYYY-MM-DD) z inputu YYYY-MM-DD
 */
function ensure_ymd($s, $label) {
  if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $s)) {
    bad_request("Špatný formát $label, použij RRRR-MM-DD");
  }
  return $s;
}

/**
 * Najde teamAbbrev podle teamId přes standings endpoint (api-web.nhle.com)
 * standings/{date} vrací tabulku, ve které jsou týmy včetně id + abbrev.
 */
function team_abbrev_from_standings($teamId, $date) {
  $url = "https://api-web.nhle.com/v1/standings/" . urlencode($date);
  $j = fetch_json_decoded($url);
  if (!$j) return null;

  // standings bývá v polích jako "standings" nebo "wildCardStandings" podle období,

  $queue = [$j];
  while (!empty($queue)) {
    $cur = array_pop($queue);
    if (!is_array($cur)) continue;

    // typicky objekt týmu mívá teamId a teamAbbrev
    if (isset($cur["teamId"]) && (string)$cur["teamId"] === (string)$teamId) {
      if (isset($cur["teamAbbrev"]["default"])) return $cur["teamAbbrev"]["default"];
      if (isset($cur["teamAbbrev"])) {
        // někdy může být přímo string
        if (is_string($cur["teamAbbrev"])) return $cur["teamAbbrev"];
      }
    }

    foreach ($cur as $v) {
      if (is_array($v)) $queue[] = $v;
    }
  }

  return null;
}

/**
 * Z api-web "club-schedule-season/{abbrev}/{season}" vrátí pole "games"
 */
function fetch_club_schedule_games($abbrev, $season) {
  $url = "https://api-web.nhle.com/v1/club-schedule-season/" . urlencode($abbrev) . "/" . urlencode($season);
  $j = fetch_json_decoded($url);
  if (!$j) return null;
  if (!isset($j["games"]) || !is_array($j["games"])) return null;
  return $j["games"];
}

/**
 * Převod api-web game -> StatsAPI-like game struktura (minimální pro main.js)
 */
function apiweb_game_to_stats_like($g) {
  $gamePk = $g["id"] ?? null;

  // api-web má často startTimeUTC + gameDate
  $gameDate = $g["startTimeUTC"] ?? ($g["gameDate"] ?? null);

  $home = $g["homeTeam"] ?? [];
  $away = $g["awayTeam"] ?? [];

  $homeId = $home["id"] ?? null;
  $awayId = $away["id"] ?? null;

  // jména týmů (api-web často dává placeName/commonName – ale pro detail stačí teamName)
  // když tam nebude, necháme aspoň fallback
  $homeName = null;
  if (isset($home["placeName"]["default"]) || isset($home["commonName"]["default"])) {
    $p = $home["placeName"]["default"] ?? "";
    $c = $home["commonName"]["default"] ?? "";
    $homeName = trim($p . " " . $c);
  }
  if (!$homeName) $homeName = $home["name"]["default"] ?? ($home["teamName"]["default"] ?? ($home["abbrev"] ?? "Home"));

  $awayName = null;
  if (isset($away["placeName"]["default"]) || isset($away["commonName"]["default"])) {
    $p = $away["placeName"]["default"] ?? "";
    $c = $away["commonName"]["default"] ?? "";
    $awayName = trim($p . " " . $c);
  }
  if (!$awayName) $awayName = $away["name"]["default"] ?? ($away["teamName"]["default"] ?? ($away["abbrev"] ?? "Away"));

  $homeScore = isset($home["score"]) && is_numeric($home["score"]) ? (int)$home["score"] : null;
  $awayScore = isset($away["score"]) && is_numeric($away["score"]) ? (int)$away["score"] : null;

  // status – api-web má gameState / gameScheduleState
  $statusText = $g["gameState"] ?? ($g["gameScheduleState"] ?? "");

  return [
    "gamePk" => $gamePk,
    "gameDate" => $gameDate,
    "status" => [
      "detailedState" => $statusText,
      "abstractGameState" => $statusText
    ],
    "teams" => [
      "home" => [
        "team" => ["id" => $homeId, "name" => $homeName],
        "score" => $homeScore
      ],
      "away" => [
        "team" => ["id" => $awayId, "name" => $awayName],
        "score" => $awayScore
      ]
    ]
  ];
}

/**
 * Vyfiltruje games podle rozsahu startDate..endDate (inclusive) podle startTimeUTC/gameDate
 */
function filter_games_by_range($games, $startDate, $endDate) {
  $startTs = strtotime($startDate . " 00:00:00");
  $endTs = strtotime($endDate . " 23:59:59");
  if ($startTs === false || $endTs === false) return [];

  $out = [];
  foreach ($games as $g) {
    $dt = $g["startTimeUTC"] ?? ($g["gameDate"] ?? null);
    if (!$dt) continue;
    $ts = strtotime($dt);
    if ($ts === false) continue;
    if ($ts < $startTs || $ts > $endTs) continue;
    $out[] = $g;
  }
  return $out;
}

/**
 * Seskupí stats-like games 
 */
function group_stats_like_by_date($statsGames) {
  $map = [];
  foreach ($statsGames as $sg) {
    $dt = $sg["gameDate"] ?? null;
    if (!$dt) continue;
    $ts = strtotime($dt);
    if ($ts === false) continue;
    $key = ymd($ts);
    if (!isset($map[$key])) $map[$key] = [];
    $map[$key][] = $sg;
  }

  ksort($map);

  $dates = [];
  foreach ($map as $date => $games) {
    $dates[] = ["date" => $date, "games" => $games];
  }

  return ["dates" => $dates];
}

// Router


$mode = isset($_GET["mode"]) ? $_GET["mode"] : "week";

if ($mode === "week") {
  $date = isset($_GET["date"]) ? $_GET["date"] : "";
  $date = ensure_ymd($date, "date");

  $url = "https://api-web.nhle.com/v1/schedule/" . $date;
  $raw = fetch_raw($url);
  if ($raw === false) {
    http_response_code(502);
    respond_json(["error" => "Proxy fetch failed", "url" => $url]);
  }
  echo $raw;
  exit;
}

if ($mode === "teamSchedule") {
  $teamId = isset($_GET["teamId"]) ? $_GET["teamId"] : "";
  $startDate = isset($_GET["startDate"]) ? $_GET["startDate"] : "";
  $endDate = isset($_GET["endDate"]) ? $_GET["endDate"] : "";

  if (!preg_match('/^\d+$/', $teamId)) bad_request("Chybí nebo je špatné teamId");
  $startDate = ensure_ymd($startDate, "startDate");
  $endDate = ensure_ymd($endDate, "endDate");

  // 1) zjisti teamAbbrev (přes standings k endDate)
  $abbrev = team_abbrev_from_standings($teamId, $endDate);

  // fallback: zkus standings ke startDate
  if (!$abbrev) $abbrev = team_abbrev_from_standings($teamId, $startDate);

  if (!$abbrev) {
    http_response_code(502);
    respond_json([
      "error" => "Nepodařilo se zjistit teamAbbrev z api-web standings.",
      "teamId" => $teamId,
      "hint" => "Zkontroluj, že standings endpoint je dostupný."
    ]);
  }

  // načti sezónu z api-web club schedule season
  $seasonStart = season_for_date($startDate);
  $seasonEnd = season_for_date($endDate);
  if (!$seasonStart || !$seasonEnd) {
    bad_request("Nepodařilo se určit sezónu pro zadané datum.");
  }

  $allGames = [];

  $games1 = fetch_club_schedule_games($abbrev, $seasonStart);
  if (is_array($games1)) $allGames = array_merge($allGames, $games1);

  if ($seasonEnd !== $seasonStart) {
    $games2 = fetch_club_schedule_games($abbrev, $seasonEnd);
    if (is_array($games2)) $allGames = array_merge($allGames, $games2);
  }

  if (empty($allGames)) {
    http_response_code(502);
    respond_json([
      "error" => "Nepodařilo se načíst club schedule season z api-web.",
      "abbrev" => $abbrev,
      "seasonStart" => $seasonStart,
      "seasonEnd" => $seasonEnd
    ]);
  }

  // vyfiltruj na rozsah a převeď do StatsAPI-like tvaru
  $filtered = filter_games_by_range($allGames, $startDate, $endDate);

  $statsLikeGames = [];
  foreach ($filtered as $g) {
    $statsLikeGames[] = apiweb_game_to_stats_like($g);
  }

  // seskup do dates[]
  $payload = group_stats_like_by_date($statsLikeGames);

  // (volitelné debug info, nechávám minimální)
  // $payload["_meta"] = ["teamId" => $teamId, "abbrev" => $abbrev, "seasonStart" => $seasonStart, "seasonEnd" => $seasonEnd];

  respond_json($payload);
}

bad_request("Neznámý mode");
