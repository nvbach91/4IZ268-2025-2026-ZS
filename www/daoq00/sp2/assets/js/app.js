const TMDb_API_KEY = "326b98640ed09907466734c1beb26b86"; 
const TMDb_BASE_URL = "https://api.themoviedb.org/3";

$(document).ready(function() {
    console.log("Movie Explorer aplikace byla inicializována.");

    loadFoldersFromLocalStorage();
    $("#search-form").on("submit", handleSearchSubmit);
});

function handleSearchSubmit(event) {
    event.preventDefault(); 
    
    const query = $("#search-input").val().trim();
    
    if (query.length > 0) {
        console.log(`Hledám: ${query}`);
        fetchMovies(query); 
    } else {
        alert("Prosím zadejte hledaný výraz.");
    }
}

function fetchMovies(query) {
    const searchUrl = `${TMDb_BASE_URL}/search/movie?api_key=${TMDb_API_KEY}&query=${query}&language=cs`;
    
    $.ajax({
        url: searchUrl,
        method: 'GET',
        success: function(data) {
            console.log("Data z API přijata:", data.results);
            displayResults(data.results);
        },
        error: function(error) {
            console.error("Chyba při volání TMDb API:", error);
            $("#results-container").html("<h2>Chyba</h2><p>Při načítání dat došlo k chybě.</p>");
        }
    });
}

function displayResults(movies) {
    const $container = $("#results-container");
    $container.empty(); 

    if (movies.length === 0) {
        $container.append("<p>Nebyly nalezeny žádné filmy odpovídající dotazu.</p>");
        return;
    }

    movies.forEach(movie => {

        const releaseDate = movie.release_date 
            ? moment(movie.release_date).format('LL') 
            : 'Neznámé datum';

        const posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : ''; 
            

        const movieCardHtml = `
            <div class="movie-card" data-movie-id="${movie.id}">
                <img src="${posterUrl}" alt="${movie.title} poster">
                <h3>${movie.title}</h3>
                <p><strong>Hodnocení:</strong> ${movie.vote_average.toFixed(1)}</p>
                <p><strong>Vydáno:</strong> ${releaseDate}</p>
                <button class="detail-btn">Zobrazit detail</button>
                <button class="add-to-folder-btn">Přidat do složky</button>
            </div>
        `;
        
        $container.append(movieCardHtml);
    });

    // zde se přidají event listenery na tlačítka .detail-btn a .add-to-folder-btn
}

// --- Funkce pro načítání/ukládání složek (placeholder pro localStorage) ---
function loadFoldersFromLocalStorage() {
    const savedFolders = localStorage.getItem('movieExplorerFolders');
    // ... Implementace logiky ...
}