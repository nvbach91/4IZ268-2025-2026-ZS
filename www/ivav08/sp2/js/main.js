import { fetchMemes } from './api.js';
import { loadImageForCanvas, drawMeme, downloadMeme, initCanvasDrag, textPositions } from './canvas.js';
import { saveFavorite, getFavorites, removeFavorite, updateFavorite } from './storage.js';
import { showSection, renderGallery, renderFavorites, toggleLoader, showToast } from './ui.js';

let allMemes = [];
let currentMeme = null;
let previousSection = 'page-gallery'; 
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
    renderGallery(allMemes, galleryGrid, (meme) => handleNavigation(() => openEditorWithTemplate(meme, 'page-gallery')));
}

function handleNavigation(nextAction) {
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

function openEditorWithTemplate(meme, fromSection = 'page-gallery') {
    currentMeme = meme;
    previousSection = fromSection;
    hasUnsavedChanges = false;

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
        (meme) => handleNavigation(() => openEditorWithTemplate(meme, 'page-favorites')), 
        () => refreshFavoritesDisplay(searchInput.value)
    );
}
document.getElementById('nav-gallery').addEventListener('click', () => {
    handleNavigation(() => {
        showSection('page-gallery');
        searchInput.value = '';
        renderGallery(allMemes, galleryGrid, (meme) => handleNavigation(() => openEditorWithTemplate(meme, 'page-gallery')));
    });
});

document.getElementById('nav-favorites').addEventListener('click', () => {
    handleNavigation(() => {
        showSection('page-favorites');
        searchInput.value = ''; 
        refreshFavoritesDisplay();
    });
});

backButton.addEventListener('click', () => {
    handleNavigation(() => {
        showSection(previousSection);
        if (previousSection === 'page-favorites') {
            refreshFavoritesDisplay();
        }
    });
});

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    if (!document.getElementById('page-gallery').classList.contains('hidden')) {
        const filtered = allMemes.filter(meme => meme.name.toLowerCase().includes(query));
        renderGallery(filtered, galleryGrid, (meme) => handleNavigation(() => openEditorWithTemplate(meme, 'page-gallery')));
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

    updateEditorButtons();
});

init();