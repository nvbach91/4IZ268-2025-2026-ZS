/**
 * Detail View
 */
import { API } from '../api.js';
import { appStore } from '../store.js';
import { UI } from '../ui.js';

export async function renderDetail(id) {
    const app = document.getElementById('app');
    UI.showLoader('app');

    try {
        const game = await API.getGameDetails(id);
        const isSaved = appStore.has(game.id);
        const isFav = appStore.getLibrary().find(g => g.id === game.id)?.isFavorite;

        // Tooltip Content logic
        const metacriticTooltip = game.metacritic
            ? `Metascore: ${game.metacritic}`
            : 'No Metascore available';

        const playtimeTooltip = game.playtime
            ? `Average time to beat: ${game.playtime} hours`
            : 'No playtime data';

        app.innerHTML = `
            <article class="fade-in">
                <!-- Hero Section -->
                <header class="position-relative mb-5 hero-wrapper">
                    <!-- Blurred Background -->
                    <!-- Blurred Background -->
                    <div id="detail-hero-bg" class="hero-blur-bg"></div>
                    
                    <!-- Main Image -->
                    <div class="position-relative d-flex justify-content-center align-items-center hero-main-wrapper">
                        <img src="${game.background_image}" class="img-fluid shadow-lg rounded hero-main-img" alt="${game.name}">
                        
                        <!-- Title Overlay -->
                        <div class="position-absolute bottom-0 start-0 w-100 p-4 hero-title-overlay">
                            <div class="container-fluid">
                                <h1 class="display-4 fw-bold text-white text-shadow">${game.name}</h1>
                                
                                <!-- Badges -->
                                <div class="d-flex flex-wrap gap-2 mt-2">
                                    <span class="badge bg-primary text-dark p-2" data-bs-toggle="tooltip" title="Release Date">
                                        <i class="bi bi-calendar-event me-1"></i> ${dayjs(game.released).format('MMM D, YYYY')}
                                    </span>
                                    <span class="badge bg-warning text-dark p-2" data-bs-toggle="tooltip" title="${metacriticTooltip} | Rating: ${game.rating}/5">
                                        <i class="bi bi-star-fill me-1"></i> ${game.rating}
                                    </span>
                                    <span class="badge bg-info text-dark p-2" data-bs-toggle="tooltip" title="${playtimeTooltip}">
                                        <i class="bi bi-clock-history me-1"></i> ${game.playtime} hrs
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

            <div class="row g-5">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h3 class="section-title mb-0">About</h3>
                            <div id="lang-buttons" class="d-flex gap-2"></div>
                        </div>
                        
                        <div id="game-description" class="lead text-justify description-text">
                            <!-- Description Injected via JS -->
                        </div>

                        <!-- Interactions Area -->
                        <div class="d-flex gap-3 mt-5">
                             <button id="detail-add-btn" class="btn ${isSaved ? 'btn-success' : 'btn-outline-primary'} btn-lg px-5 rounded-pill">
                                <i class="bi ${isSaved ? 'bi-check-lg' : 'bi-plus-lg'}"></i> 
                                ${isSaved ? 'In Library' : 'Add to Library'}
                            </button>
                            
                            ${isSaved ? `
                                <button id="detail-fav-btn" class="btn ${isFav ? 'btn-danger' : 'btn-outline-danger'} btn-lg rounded-circle fav-fab-btn">
                                    <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>

                <!-- Right: Metadata & Stats -->
                <div class="col-lg-4">
                    <div class="card bg-dark border-secondary p-4 sticky-top sticky-meta-card">
                        <h4 class="text-muted uppercase small spacing-2 mb-4">Game Info</h4>
                        
                        ${renderMetaRow('Genres', game.genres)}
                        ${renderMetaRow('Platforms', game.parent_platforms?.map(p => p.platform))}
                        ${renderMetaRow('Developers', game.developers)}
                        ${renderMetaRow('Publishers', game.publishers)}
                        
                        <hr class="border-secondary my-4">
                        
                        ${game.website ? `
                            <a href="${game.website}" target="_blank" class="btn btn-outline-light w-100 mb-2">
                                <i class="bi bi-globe me-2"></i> Official Website
                            </a>
                        ` : ''}
                        
                        ${game.metacritic_url ? `
                            <a href="${game.metacritic_url}" target="_blank" class="btn btn-outline-secondary w-100">
                                <i class="bi bi-box-arrow-up-right me-2"></i> View on Metacritic
                            </a>
                        ` : ''}
                    </div>
                </div>
            </article>
        `;

        // Set Dynamic Hero Background safely via JS (No inline attribute)
        const heroBgEl = document.getElementById('detail-hero-bg');
        if (heroBgEl) {
            heroBgEl.style.setProperty('--hero-bg', `url('${game.background_image}')`);
        }

        // Parse Description
        const descText = game.description_raw || game.description;
        const languages = parseDescription(descText);

        // Render Default (English/First)
        const descEl = document.getElementById('game-description');
        if (descEl) descEl.innerHTML = languages.English || Object.values(languages)[0];

        // Render Language Buttons if > 1
        const langContainer = document.getElementById('lang-buttons');
        const langKeys = Object.keys(languages);

        if (langKeys.length > 1 && langContainer) {
            langKeys.forEach(lang => {
                const btn = document.createElement('button');
                btn.className = `btn btn-sm ${lang === 'English' ? 'btn-primary' : 'btn-outline-secondary'}`;
                btn.textContent = lang;
                btn.addEventListener('click', () => {
                    descEl.innerHTML = languages[lang];
                    // Update Active State
                    Array.from(langContainer.children).forEach(b => {
                        b.classList.remove('btn-primary');
                        b.classList.add('btn-outline-secondary');
                    });
                    btn.classList.remove('btn-outline-secondary');
                    btn.classList.add('btn-primary');
                });
                langContainer.appendChild(btn);
            });
        }

        // Initialize Tooltips
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(t => new bootstrap.Tooltip(t));

        // Event Listeners
        const addBtn = document.getElementById('detail-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (isSaved) return; // Or handle remove? Library usually handles remove. Detail usually Adds.
                if (appStore.add(game)) {
                    UI.showToast('Added to Library!');
                    renderDetail(id); // Re-render to update UI state
                }
            });
        }

        const favBtn = document.getElementById('detail-fav-btn');
        if (favBtn) {
            favBtn.addEventListener('click', () => {
                const newStatus = appStore.toggleFavorite(game.id);
                UI.showToast(newStatus ? 'Added to Favorites' : 'Removed from Favorites');
                renderDetail(id);
            });
        }

    } catch (error) {
        console.error(error);
        app.innerHTML = '<div class="alert alert-danger">Failed to load game details.</div>';
    }
}

function renderMetaRow(label, items) {
    if (!items || items.length === 0) return '';
    const names = items.map(i => i.name).join(', ');
    return `
        <div class="mb-3">
            <h6 class="text-secondary small uppercase mb-1">${label}</h6>
            <div class="text-white">${names}</div>
        </div>
    `;
}

function parseDescription(text) {
    if (!text) return { English: 'No description available.' };

    const splitters = [
        'Español', 'Français', 'Deutsch', 'Italiano', 'Polski', 'Русский', 'Português', '中文', '日本語'
    ];

    // Create a RegExp to split. We capture the delimiter to know which lang it is.
    // Logic: Look for the language name followed by a newline or colon, usually at start of line
    const result = { English: text }; // Default to whole text being English

    // Simplistic parser: Find first occurrence of another language header
    // This is heuristic because RAWG format isn't standard.
    // We will look for positions of headers.

    let indices = [];
    splitters.forEach(lang => {
        // Look for "Lungauge" or "Es:" or matching common patterns
        const regex = new RegExp(`(?:^|\\n)(${lang})`, 'i');
        const match = regex.exec(text);
        if (match) {
            indices.push({ lang: match[1], index: match.index });
        }
    });

    if (indices.length === 0) return result;

    // Sort by index to slice text in order
    indices.sort((a, b) => a.index - b.index);

    // English is usually 0 to first index
    // Check if the text starts with English (index 0 is a lang header?)
    if (indices[0].index > 10) { // arbitrary buffer for "About" or whitespace
        result.English = text.substring(0, indices[0].index).trim();
    } else {
        delete result.English; // Starts with another language immediately
    }

    // Slice content for each language
    for (let i = 0; i < indices.length; i++) {
        const current = indices[i];
        const next = indices[i + 1];

        // Key logic: Standardize key name (Capitalize)
        const key = current.lang.charAt(0).toUpperCase() + current.lang.slice(1).toLowerCase();

        let content = '';
        if (next) {
            content = text.substring(current.index + current.lang.length, next.index);
        } else {
            content = text.substring(current.index + current.lang.length);
        }

        // Cleanup content (remove leading colons or newlines)
        result[key] = content.replace(/^[:\s-]+/, '').trim();
    }

    // Fallback if extracting failed to leave empty English
    if (result.English && result.English.trim().length === 0) delete result.English;
    if (Object.keys(result).length === 0) return { English: text };

    return result;
}
