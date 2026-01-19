## Prague HEAT!
Prague HEAT! je webová aplikace pro vizualizaci aktuálních zpoždění vozidel MHD v Praze pomocí heatmapy. Součástí je přehled statistik, počasí a volitelné AI shrnutí situace.

## Funkce
Aplikace umožňuje zobrazit aktuální dopravní situaci v Praze jako heatmapu na mapovém podkladu.

Hlavní funkce:
- Heatmapa zpoždění vozidel v reálném čase
- Filtr podle typu dopravy (route types)
- Nastavení minimálního zpoždění (min_delay)
- Nastavení radius/blur heatmapy
- Automatické obnovování dat (refresh interval)
- Přehledné statistiky (počet bodů, avg, p95, max)
- Seznam největších zpoždění (Top delays) s možností „kliknout a přiblížit“
- Zobrazení aktuálního počasí
- AI shrnutí situace (pokud je dostupné OpenAI API)

## Technologie
Frontend:
- HTML, CSS, JavaScript (vanilla)
- Leaflet (mapa)
- Leaflet.heat (heatmap layer)

Backend:
- Node.js + Express
- REST API endpoints pro frontend
- dotenv pro načítání konfigurace z `.env`

Externí API:
- Golemio API (data o zpoždění MHD)
- OpenWeather API (aktuální počasí)
- OpenAI Responses API (volitelné AI shrnutí)

## Struktura projektu
Projekt je rozdělen na frontend a backend.

- `index.html` (root)  
  Redirect na `frontend/` (pro hostování na ESO)

- `frontend/`  
  - `index.html` (UI aplikace)
  - `css/style.css` (styly)
  - `js/app.js` (hlavní logika aplikace)

- `backend/`  
  - `server.js` (Express server + routing)
  - `.env` (lokální konfigurace, není součástí repozitáře)
  - `.env.example` (šablona proměnných prostředí)
  - `package.json` (dependencies a scripts)
  - `src/routes/` (Express routery)
    - `health.route.js`
    - `delays.route.js`
    - `weather.route.js`
    - `aiSummary.route.js`
  - `src/services/` (napojení na externí služby)
    - `golemio.service.js`
    - `weather.service.js`
    - `openai.service.js`
  - `src/utils/`
    - `httpClient.js`

## Požadavky
Pro lokální spuštění je potřeba:
- Node.js (doporučeno 18+ kvůli `fetch()` API)
- npm (součást Node.js)
- Golemio API key
- OpenWeather API key
- OpenAI API key (volitelné, pouze pro AI shrnutí)

Poznámka:
- Pokud není nastaven `OPENAI_API_KEY`, aplikace normálně funguje, pouze AI část je vypnutá.

## Lokální spuštění
1) Instalace backend dependencies:

    cd backend
    npm install

2) Vytvoř .env v backend/ podle .env.example.
3) změnit řádek v app.js:

    const API_BASE = "https://prague-heat.onrender.com"
                -----> const API_BASE = "";

3) Spusť backend:

    npm start

4) Otevři frontend:

    otevři http://localhost:3000/

## Frontend API nastavení (API_BASE)
Frontend volá backend přes konstantu `API_BASE` v souboru `frontend/js/app.js`.

Lokální běh (backend běží na stejném originu jako frontend přes Express static):

const API_BASE = "";

## Dostupné endpointy backendu
Backend poskytuje REST API pro frontend.

- `GET /api/health`  
  Základní kontrola, že backend běží (health check).

- `GET /api/weather`  
  Vrací aktuální počasí v Praze.

- `GET /api/delays`  
  Vrací seznam bodů zpoždění vozidel (raw data).  
  Podporuje query parametry jako `route_types`, `min_delay`, `limit`, `prague_only`.

- `GET /api/delays/summary`  
  Vrací agregované statistiky a seznam největších zpoždění (top delays).

- `GET /api/delays/dashboard`  
  Endpoint používaný frontend aplikací jako „jedno volání pro vše“.  
  Vrací:
  - `items` (body do heatmapy)
  - `summary` (avg/p95/max)
  - `top_delays` (Top N zpoždění)
  - `weather` (počasí)

- `GET /api/ai-summary`  
  Generuje AI shrnutí situace dopravy (pouze pokud je nastaven `OPENAI_API_KEY`).

  ## AI shrnutí
AI shrnutí se spouští přes endpoint:

`GET /api/ai-summary`

Backend:
- načte dopravní data z Golemio (summary + top delays)
- načte počasí (OpenWeather)
- sestaví vstupní JSON a pošle ho do OpenAI Responses API
- vrátí výsledek jako text pro frontend

Pokud není nastavená proměnná `OPENAI_API_KEY`, endpoint vrátí:

{ "error": "AI disabled" }

-> Zobrazuje jako - AI disabled

## Deployment / hosting
Aplikace je rozdělena na 2 části:

Frontend (statický hosting):
- běží na ESO
- URL projektu:
  `https://eso.vse.cz/~kohj08/sp2/`
- root `index.html` v `sp2/` přesměrovává do:
  `frontend/`

Backend (Node.js API server):
- běží mimo ESO na externím hostingu (Render)
- poskytuje API endpointy `/api/...`
- frontend volá backend přes `API_BASE` ve `frontend/js/app.js`

Příklad:
- `API_BASE = ""` pro lokální běh (frontend i backend na stejném originu)
- `API_BASE = "https://prague-heat.onrender.com"` pro běh s backendem na Renderu


## Troubleshooting
AI disabled:
- příčina: chybí `OPENAI_API_KEY` v backendu
- řešení: doplnit `OPENAI_API_KEY` do `backend/.env` nebo do Render environment variables

Backend nečte `.env`:
- příčina: `.env` není ve složce `backend/` nebo backend běží z jiné složky
- řešení: zkontrolovat `backend/.env` a spouštět přes:
  `cd backend && npm start`

CORS error (frontend a backend běží na různých doménách):
- příčina: browser blokuje requesty bez CORS
- řešení: povolit CORS v backendu (nebo použít stejný origin při lokálním běhu)

Žádná data v mapě:
- příčina: špatný / chybějící `GOLEMIO_API_KEY`, nebo API vrací prázdná data
- řešení: otevřít endpoint přímo a ověřit odpověď:
  `/api/delays/dashboard`

Render free hosting je pomalý po neaktivitě:
- příčina: free instance se uspává
- řešení: první request může trvat desítky sekund, poté už běží normálně

## Licence / autor / předmět
Autor: Jakub Kohák  
Předmět: 4IZ268  
Odevzdání: SP2 (Prague HEAT!)