/**
 * Main Entry Point
 */
import { Router } from './router.js';
import { renderDiscover } from './views/discover.js';
import { renderDashboard } from './views/dashboard.js';
import { renderLibrary } from './views/library.js';
import { renderDetail } from './views/detail.js';

// Setup Routes
const routes = {
    'dashboard': renderDashboard,
    'discover': renderDiscover,
    'library': renderLibrary,
    'game': renderDetail
};

// Initialize Router
const appRouter = new Router(routes);

// Theme Sync (Load Profile Color)
import { appStore } from './store.js';
const profile = appStore.getProfile();
if (profile && profile.color) {
    document.documentElement.style.setProperty('--primary-color', profile.color);
}

// Global Search Listener
const searchInput = document.getElementById('global-search');
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();

            // If we are already on discover, just trigger the change handler in discover.js
            // But main.js doesn't have access to discover.js internals.
            // Simplest robust solution: Just navigate. User accepts clean state for new search usually.
            // BUT: "work together" implies "Lego" + "IOS".
            // If I select IOS, then type Lego, I expect both.
            // So: If on discover, getting the search input value is handled by discover's logic.
            // We just need discover.js to listen to this input's 'change' or 'keypress'.

            // Let's defer to the view logic if we are on the view.
            if (window.location.hash.startsWith('#discover')) {
                // Dispatch event so discover.js catches it?
                searchInput.dispatchEvent(new Event('search-trigger'));
            } else {
                if (query) {
                    window.location.hash = `discover/${encodeURIComponent(query)}`;
                }
            }
        }
    });
}

// Scroll to Top Logic
const scrollBtn = document.getElementById('scroll-top-btn');
if (scrollBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.remove('d-none');
            // Little fade in animation could be added via CSS, but d-none toggle is simple
        } else {
            scrollBtn.classList.add('d-none');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

console.log('GameHub Initialized (refactored).');
