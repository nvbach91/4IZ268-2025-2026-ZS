// Hlavní vstupní bod aplikace
function main() {
    
    console.log("MAIN: běží main()");
console.log("MAIN: výchozí league =", $("#league-select").val());

    
    
    
    console.log("TipMaster startuje...");

    // 1. Zjistíme, co je vybráno v select boxu
    const $leagueSelect = $('#league-select');
    
    // 2. Načteme data hned po startu
    loadData($leagueSelect.val());

    // 3. Při změně výběru načteme nová data
    $leagueSelect.on('change', function() {
        const selectedLeague = $(this).val();
        loadData(selectedLeague);
    });
}

// Funkce, která rozhodne, koho zavolat
function loadData(league) {
    const $list = $('#matches-list');
    $list.html('<p>Načítám zápasy...</p>'); // Indikace načítání

    if (league === 'pl') {
        AppAPI.getPremierLeague(
            function(data) { renderMatches(data, 'pl'); },
            function(err) { $list.html('<p>Chyba při načítání PL.</p>'); console.error(err); }
        );
    } else if (league === 'nhl') {
        AppAPI.getNHL(
            function(data) { renderMatches(data, 'nhl'); },
            function(err) { $list.html('<p>Chyba při načítání NHL.</p>'); console.error(err); }
        );
    }
}

// Funkce pro vykreslení HTML seznamu
function renderMatches(matches, type) {
    const $list = $('#matches-list');
    $list.empty(); // Vyčistíme starý seznam

    matches.forEach(function(match) {
        let homeTeam, awayTeam, dateRaw;

        // Každé API má jinou strukturu, musíme to sjednotit
        if (type === 'pl') {
            // Struktura API-Football
            homeTeam = match.teams.home.name;
            awayTeam = match.teams.away.name;
            dateRaw = match.fixture.date; 
        } else {
            // Struktura NHL API
           homeTeam = match.homeTeam?.placeName?.default || match.homeTeam?.name?.default || match.homeTeam?.abbrev || "HOME";
awayTeam = match.awayTeam?.placeName?.default || match.awayTeam?.name?.default || match.awayTeam?.abbrev || "AWAY";
dateRaw  = match.startTimeUTC || match.gameDate || match.startTime || new Date().toISOString();
        }

        // Formátování data (jednoduché)
        const dateObj = new Date(dateRaw);
        const dateStr = dateObj.toLocaleDateString('cs-CZ') + ' ' + dateObj.toLocaleTimeString('cs-CZ', {hour: '2-digit', minute:'2-digit'});

        // Vytvoření HTML prvku
        const html = `
            <div class="match-item">
                <span class="date">${dateStr}</span><br>
                <span class="teams"><strong>${homeTeam}</strong> vs <strong>${awayTeam}</strong></span>
            </div>
        `;
        
        $list.append(html);
    });
}

// Spuštění funkce main, až bude stránka načtená
$(document).ready(main);