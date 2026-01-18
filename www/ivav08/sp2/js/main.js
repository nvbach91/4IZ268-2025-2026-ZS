import { fetchMemes, searchMemes } from './api.js';
import { loadImageForCanvas, drawMeme, downloadMeme, initCanvasDrag, textPositions } from './canvas.js';
import { saveFavorite, getFavorites, removeFavorite, updateFavorite } from './storage.js';
import { showSection, renderGallery, renderFavorites, toggleLoader, showToast } from './ui.js';

let allMemes = [];
let currentMeme = null;
let hasUnsavedChanges = false;

const galleryGrid = document.getElementById('gallery-grid');
const favoritesGrid = document.getElementById('favorites-grid');
const canvas = document.getElementById('meme-canvas');
const ctx = canvas.getContext('2d');

const searchInput = document.getElementById('search-input');
const textTopInput = document.getElementById('text-top');
const textBottomInput = document.getElementById('text-bottom');
const backButton = document.getElementById('back-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const deleteBtn = document.getElementById('editor-delete-btn');
const navGallery = document.getElementById('nav-gallery');
const navFavorites = document.getElementById('nav-favorites');
const downloadBtn = document.getElementById('download-btn');
const pageGallery = document.getElementById('page-gallery');
const pageFavorites = document.getElementById('page-favorites');
const lastSavedDateContainer = document.getElementById('last-saved-date');
const lastSavedDateValue = document.getElementById('date-value');
const countElement = document.getElementById('fav-count');

// --- ROUTING LOGIC ---

function updateURL(params) {
    const url = new URL(window.location);
    url.search = '';
    for (const key in params) {
        url.searchParams.set(key, params[key]);
    }
    window.history.pushState({}, '', url);
}

function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => { fn(...args) }, delay);
    };
}

function saveCurrentMeme() {
    if (!currentMeme) return;

    const now = new Date().toISOString();

    const memeData = {
        uniqueId: currentMeme.uniqueId || Date.now(),
        id: currentMeme.id,
        name: currentMeme.name,
        url: currentMeme.url,
        topText: textTopInput.value.toUpperCase(),
        bottomText: textBottomInput.value.toUpperCase(),
        text1_x: textPositions.top.x,
        text1_y: textPositions.top.y,
        text2_x: textPositions.bottom.x,
        text2_y: textPositions.bottom.y,
        createdAt: currentMeme.createdAt || now,
        updatedAt: now
    };

    if (currentMeme.uniqueId) {
        updateFavorite(memeData);
        showToast('Meme updated!');
    } else {
        saveFavorite(memeData);
        showToast('Saved to collection!');

        if (countElement) countElement.textContent = getFavorites().length;

        currentMeme = memeData;

        const url = new URL(window.location);
        url.searchParams.set('page', 'editor');
        url.searchParams.set('id', memeData.uniqueId);
        window.history.pushState({}, '', url);

        updateEditorButtons();
    }

    lastSavedDateValue.textContent = new Date(now).toLocaleString();
    lastSavedDateContainer.classList.remove('hidden');

    hasUnsavedChanges = false;
}

function handleInitialRoute() {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const memeId = params.get('id');

    if (page === 'favorites') {
        navigateToFavorites(false);
    } else if (page === 'editor' && memeId) {
        let meme = getFavorites().find(m => m.uniqueId == memeId);

        if (!meme) {
            meme = allMemes.find(m => m.id == memeId);
        }

        if (meme) {
            openEditorWithTemplate(meme, 'page-gallery', false);
        } else {
            navigateToGallery(false);
        }
    } else {
        navigateToGallery(false);
    }
}

window.addEventListener('popstate', () => {
    handleInitialRoute();
});

// --- NAVIGATION FUNCTIONS ---
function navigateToGallery(pushHistory = true) {
    if (pushHistory) updateURL({ page: 'gallery' });

    showSection('page-gallery');
    searchInput.value = '';
    renderGallery(allMemes, galleryGrid, (meme) => handleSafeNavigation(() => {
        openEditorWithTemplate(meme, 'page-gallery');
    }));
}

function navigateToFavorites(pushHistory = true) {
    if (pushHistory) updateURL({ page: 'favorites' });

    showSection('page-favorites');
    searchInput.value = '';
    refreshFavoritesDisplay();
}

function handleSafeNavigation(nextAction) {
    if (hasUnsavedChanges) {
        Swal.fire({
            title: 'Unsaved Changes!',
            text: "You have unsaved edits. Are you sure you want to leave?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#48b62dff',
            cancelButtonColor: '#e74c3c',
            confirmButtonText: 'Save & Leave',
            cancelButtonText: 'Discard Changes'
        }).then((result) => {
            if (result.isConfirmed) {
                saveCurrentMeme();
                nextAction();
            } else if (result.isCanceled) {
                hasUnsavedChanges = false;
                nextAction();
            }
        });
    } else {
        nextAction();
    }
}

// --- APP INIT ---

async function init() {
    toggleLoader(true);

    initCanvasDrag(
        canvas,
        ctx,
        () => ({ topText: textTopInput.value.toUpperCase(), bottomText: textBottomInput.value.toUpperCase() }),
        () => {
            drawMeme(canvas, ctx, textTopInput.value.toUpperCase(), textBottomInput.value.toUpperCase());
        }
    );

    canvas.addEventListener('mouseup', () => {
        hasUnsavedChanges = true;
    });

    try {
        allMemes = await fetchMemes();
    } catch (e) {
        console.error(e);
        showToast('Error loading memes', 'error');
    }

    toggleLoader(false);

    handleInitialRoute();
}

function openEditorWithTemplate(meme, fromSection, pushHistory = true) {
    currentMeme = meme;
    hasUnsavedChanges = false;

    if (pushHistory) {
        const id = meme.uniqueId || meme.id;
        updateURL({ page: 'editor', id: id });
    }

    textTopInput.value = meme.topText || '';
    textBottomInput.value = meme.bottomText || '';

    showSection('page-editor');
    updateEditorButtons();

    if (meme.updatedAt) {
        const dateObj = new Date(meme.updatedAt);
        lastSavedDateValue.textContent = dateObj.toLocaleString(); // Покаже дату і час
        lastSavedDateContainer.classList.remove('hidden');
    } else if (meme.createdAt) {
        const dateObj = new Date(meme.createdAt);
        lastSavedDateValue.textContent = dateObj.toLocaleString();
        lastSavedDateContainer.classList.remove('hidden');
    } else {
        lastSavedDateContainer.classList.add('hidden');
    }

    let savedPositions = null;
    if (meme.text1_x !== undefined) {
        savedPositions = {
            top: { x: meme.text1_x, y: meme.text1_y },
            bottom: { x: meme.text2_x, y: meme.text2_y }
        };
    }

    loadImageForCanvas(meme.url, canvas, () => {
        drawMeme(canvas, ctx, textTopInput.value.toUpperCase(), textBottomInput.value.toUpperCase(), savedPositions);
    });
}

function updateEditorButtons() {
    if (!currentMeme) return;

    if (currentMeme.uniqueId) {
        favoriteBtn.textContent = '💾 Update Changes';
        favoriteBtn.classList.add('is-update');
        deleteBtn.classList.remove('hidden');
    } else {
        favoriteBtn.textContent = '♥ Save to Collection';
        favoriteBtn.classList.remove('is-update');
        deleteBtn.classList.add('hidden');
    }
}

function refreshFavoritesDisplay(filterText = '') {
    const favorites = getFavorites();
    const filtered = searchMemes(favorites, filterText);

    renderFavorites(filtered, favoritesGrid,
        (meme) => handleSafeNavigation(() => openEditorWithTemplate(meme, 'page-favorites')),
        () => refreshFavoritesDisplay(searchInput.value)
    );
}

// --- EVENT LISTENERS ---

navGallery.addEventListener('click', () => {
    handleSafeNavigation(() => navigateToGallery());
});

navFavorites.addEventListener('click', () => {
    handleSafeNavigation(() => navigateToFavorites());
});

backButton.addEventListener('click', () => {
    handleSafeNavigation(() => {
        window.history.back();
        setTimeout(() => {
            if (window.location.search.includes('editor')) {
                navigateToGallery();
            }
        }, 100);
    });
});

searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value;

    if (!pageGallery.classList.contains('hidden')) {
        const filtered = searchMemes(allMemes, query);
        renderGallery(filtered, galleryGrid, (meme) =>
            handleSafeNavigation(() => openEditorWithTemplate(meme, 'page-gallery'))
        );
    } else if (!pageFavorites.classList.contains('hidden')) {
        refreshFavoritesDisplay(query);
    }
}, 400)
);

favoriteBtn.addEventListener('click', saveCurrentMeme);

[textTopInput, textBottomInput].forEach(input => {
    input.addEventListener('input', () => {
        hasUnsavedChanges = true;
        drawMeme(canvas, ctx, textTopInput.value.toUpperCase(), textBottomInput.value.toUpperCase());
    });
});

downloadBtn.addEventListener('click', () => {
    if (currentMeme) {
        const filename = `meme-${currentMeme.name.replace(/\s+/g, '-')}-${Date.now()}.png`;
        downloadMeme(canvas, filename);
        showToast('Meme downloaded!');
    }
});

deleteBtn.addEventListener('click', () => {
    if (!currentMeme || !currentMeme.uniqueId) return;

    removeFavorite(currentMeme.uniqueId);
    showToast('Removed from collection');

    if (countElement) countElement.textContent = getFavorites().length;

    delete currentMeme.uniqueId;
    hasUnsavedChanges = true;

    updateURL({ page: 'editor', id: currentMeme.id });
    updateEditorButtons();
});

init();