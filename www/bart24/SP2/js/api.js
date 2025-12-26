const API_KEY = "577981c2af63735c607c23a2c1db4370"; // API-Football klíč

const USE_RAPIDAPI = true;

// PI-Football / API-Sports 
const FOOTBALL_URL = "https://v3.football.api-sports.io/fixtures";
const FOOTBALL_HOST = "v3.football.api-sports.io";

// Premier League ID v API-Football:
const PREMIER_LEAGUE_ID = 39;

// Sezóna pro free plán 
const PL_SEASON = 2023;

// NHL
const NHL_SCHEDULE_URL = "https://statsapi.web.nhl.com/api/v1/schedule";

window.AppAPI = {
 
  // Premier League (API-Football)
  
  getPremierLeague: function (successCallback, errorCallback) {
    $.ajax({
      url: FOOTBALL_URL,
      method: "GET",
      data: {
        league: PREMIER_LEAGUE_ID,
        season: PL_SEASON

       
      },
      headers: USE_RAPIDAPI
        ? {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": FOOTBALL_HOST
          }
        : {
            "x-apisports-key": API_KEY
          },
      success: function (raw) {
        // API-Football vrací data v raw.response (pole)
        console.log("PL OK raw:", raw);

        if (raw && Array.isArray(raw.response)) {
          // max 10 prvních, aby UI nebylo přeplněné
          successCallback(raw.response.slice(0, 10));
        } else {
          errorCallback({
            message: "Neočekávaný formát odpovědi API-Football",
            raw: raw
          });
        }
      },
      error: function (xhr) {
        console.log("PL ERROR", xhr.status, xhr.responseText);
        errorCallback(xhr);
      }
    });
  },

 
  // NHL
  getNHL: function(successCallback, errorCallback) {
 
  const today = new Date();
  const y = today.getFullYear()-3;
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const dateStr = `${y}-${m}-${d}`;

  $.ajax({
    url: `https://api-web.nhle.com/v1/schedule/${dateStr}`,
    method: "GET",
    success: function(resp) {
      
      const games = (resp && resp.gameWeek)
        ? resp.gameWeek.flatMap(w => w.games || [])
        : [];

      successCallback(games);
    },
    error: function(xhr) {
      console.log("NHL ERROR", xhr.status, xhr.responseText);
      errorCallback(xhr);
    }
  });
}
};
