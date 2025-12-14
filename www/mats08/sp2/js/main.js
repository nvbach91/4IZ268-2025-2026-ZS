// Konfigurace
const apiKey = "286e502e";
const apiUrl = "https://www.omdbapi.com/";
const storageKey = "sp2_favorites";
const defaultPoster = "https://placehold.co/300x450/222/fff?text=Bez+plakátu";

// Elementy
let inputHledani, formHledani;
let seznamFilmu, seznamOblibene;

// Spuštění po načtení
document.addEventListener('DOMContentLoaded', () => {
    nactiElementy();
    nastavListenery();
    vykresliOblibene();
});

function nactiElementy() {
    formHledani = document.getElementById('search-form');
    inputHledani = document.getElementById('search-input');
    seznamFilmu = document.getElementById('movie-list');
    seznamOblibene = document.getElementById('favorites-list');
}

function nastavListenery() {
    // 1. Odeslání formuláře
    formHledani.addEventListener('submit', (e) => {
        e.preventDefault();
        const dotaz = inputHledani.value.trim();
        if (dotaz) {
            hledatFilmy(dotaz);
        }
    });

    // 2. Kliknutí na seznam filmů (Přidat do oblíbených)
    seznamFilmu.addEventListener('click', (e) => {
        const btn = e.target.closest('.fav-btn');
        if (btn) {
            pridejDoOblibenych({
                id: btn.dataset.id,
                title: btn.dataset.title,
                year: btn.dataset.year,
                poster: btn.dataset.poster
            });
        }
    });

    // 3. Kliknutí na oblíbené (Smazat)
    seznamOblibene.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-btn');
        if (btn) {
            smazZOblibenych(btn.dataset.id);
        }
    });

    // 4. Smazat vše
    document.getElementById('clear-fav-btn').addEventListener('click', () => {
        if(confirm("Opravdu vymazat seznam oblíbených?")) {
            localStorage.removeItem(storageKey);
            vykresliOblibene();
        }
    });
}

// --- API ---

async function hledatFilmy(dotaz) {
    const spinner = document.getElementById('spinner');
    const errorMsg = document.getElementById('error-message');
    
    spinner.classList.remove('hidden');
    errorMsg.classList.add('hidden');
    seznamFilmu.innerHTML = '';

    try {
        const url = `${apiUrl}?apikey=${apiKey}&s=${encodeURIComponent(dotaz)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.Response === "True") {
            vykresliVysledky(data.Search);
        } else {
            errorMsg.textContent = "Žádné filmy nenalezeny.";
            errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        errorMsg.textContent = "Chyba připojení k serveru.";
        errorMsg.classList.remove('hidden');
    } finally {
        spinner.classList.add('hidden');
    }
}

// --- Vykreslování ---

function vykresliVysledky(filmy) {
    filmy.forEach(film => {
        let poster = film.Poster !== "N/A" ? film.Poster : defaultPoster;
        
        const karta = document.createElement('div');
        karta.className = 'movie-card';
        
        karta.innerHTML = `
            <img src="${poster}" alt="${film.Title}" onerror="this.src='${defaultPoster}'">
            <div class="card-content">
                <h3 class="movie-title">${film.Title}</h3>
                <span class="movie-year">${film.Year}</span>
                <button class="fav-btn" data-id="${film.imdbID}" data-title="${film.Title}" data-year="${film.Year}" data-poster="${poster}">
                    <i class="far fa-heart"></i> Přidat
                </button>
            </div>
        `;
        seznamFilmu.appendChild(karta);
    });
}

function vykresliOblibene() {
    const data = JSON.parse(localStorage.getItem(storageKey)) || [];
    seznamOblibene.innerHTML = '';

    if (data.length === 0) {
        seznamOblibene.innerHTML = `<div class="empty-state" style="padding: 20px"><p>Zatím žádné oblíbené.</p></div>`;
        return;
    }

    data.forEach(film => {
        const karta = document.createElement('div');
        karta.className = 'movie-card';
        
        karta.innerHTML = `
            <img src="${film.poster}" alt="${film.title}" onerror="this.src='${defaultPoster}'">
            <div class="card-content">
                <h3 class="movie-title">${film.title}</h3>
                <span class="movie-year">${film.year}</span>
                <button class="remove-btn" data-id="${film.id}">
                    <i class="fas fa-trash"></i> Odebrat
                </button>
            </div>
        `;
        seznamOblibene.appendChild(karta);
    });
}

// --- Data ---

function pridejDoOblibenych(film) {
    let data = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    // Kontrola duplicit
    if (data.some(f => f.id === film.id)) {
        ukazToast("Tento film už máš v oblíbených!");
        return;
    }
    
    data.push(film);
    localStorage.setItem(storageKey, JSON.stringify(data));
    vykresliOblibene();
    ukazToast("Film přidán do oblíbených.");
}

function smazZOblibenych(id) {
    let data = JSON.parse(localStorage.getItem(storageKey)) || [];
    data = data.filter(f => f.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(data));
    vykresliOblibene();
    ukazToast("Film odebrán.");
}

function ukazToast(text) {
    const t = document.getElementById('toast');
    t.textContent = text;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3000);
}