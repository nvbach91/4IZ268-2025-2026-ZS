import { fetchMemes } from './api.js';
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

// --- ROUTING LOGIC ---

function updateURL(params) {
    const url = new URL(window.location);
    url.search = '';
    for (const key in params) {
        url.searchParams.set(key, params[key]);
    }
    window.history.pushState({}, '', url);
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
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, discard changes',
            cancelButtonText: 'No, stay here'
        }).then((result) => {
            if (result.isConfirmed) {
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
    const query = filterText.toLowerCase();

    const filtered = favorites.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.topText.toLowerCase().includes(query) ||
        m.bottomText.toLowerCase().includes(query)
    );

    renderFavorites(filtered, favoritesGrid,
        (meme) => handleSafeNavigation(() => openEditorWithTemplate(meme, 'page-favorites')),
        () => refreshFavoritesDisplay(searchInput.value)
    );
}

// --- EVENT LISTENERS ---

document.getElementById('nav-gallery').addEventListener('click', () => {
    handleSafeNavigation(() => navigateToGallery());
});

document.getElementById('nav-favorites').addEventListener('click', () => {
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

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    if (!document.getElementById('page-gallery').classList.contains('hidden')) {
        const filtered = allMemes.filter(meme => meme.name.toLowerCase().includes(query));
        renderGallery(filtered, galleryGrid, (meme) => handleSafeNavigation(() => openEditorWithTemplate(meme, 'page-gallery')));
    }
    else if (!document.getElementById('page-favorites').classList.contains('hidden')) {
        refreshFavoritesDisplay(query);
    }
});

[textTopInput, textBottomInput].forEach(input => {
    input.addEventListener('input', () => {
        hasUnsavedChanges = true;
        drawMeme(canvas, ctx, textTopInput.value.toUpperCase(), textBottomInput.value.toUpperCase());
    });
});

document.getElementById('download-btn').addEventListener('click', () => {
    if (currentMeme) {
        const filename = `meme-${currentMeme.name.replace(/\s+/g, '-')}-${Date.now()}.png`;
        downloadMeme(canvas, filename);
        showToast('Meme downloaded!');
    }
});

favoriteBtn.addEventListener('click', () => {
    if (!currentMeme) return;

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
        text2_y: textPositions.bottom.y
    };

    if (currentMeme.uniqueId) {
        updateFavorite(memeData);
        showToast('Meme updated successfully!');
    } else {
        saveFavorite(memeData);
        showToast('Saved to collection!');
        currentMeme = memeData;

        updateURL({ page: 'editor', id: memeData.uniqueId });
        updateEditorButtons();
    }

    hasUnsavedChanges = false;
});

deleteBtn.addEventListener('click', () => {
    if (!currentMeme || !currentMeme.uniqueId) return;

    removeFavorite(currentMeme.uniqueId);
    showToast('Removed from collection');

    delete currentMeme.uniqueId;
    hasUnsavedChanges = true;

    updateURL({ page: 'editor', id: currentMeme.id });
    updateEditorButtons();
});

init();