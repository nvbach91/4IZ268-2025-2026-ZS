import { removeFavorite, getFavorites } from './storage.js';

const navGallery = document.getElementById('nav-gallery');
const navFavorites = document.getElementById('nav-favorites');
const appLoader = document.getElementById('app-loader');
const msgElement = document.getElementById('no-favorites-msg')
const countElement = document.getElementById('fav-count');

export function toggleLoader(show) {
    if (show) appLoader.classList.remove('hidden');
    else appLoader.classList.add('hidden');
}

export function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: type === 'error' ? "#e74c3c" : "#2ecc71",
        }
    }).showToast();
}

export function showSection(sectionId) {
    document.querySelectorAll('main section').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(sectionId).classList.remove('hidden');

    if (sectionId === 'page-gallery') {
        navGallery.classList.add('active');
    } else if (sectionId === 'page-favorites') {
        navFavorites.classList.add('active');
    }
}

export function renderGallery(memes, container, onMemeClick) {
    container.innerHTML = '';

    const fragment = document.createDocumentFragment();

    memes.forEach(meme => {
        const card = document.createElement('div');
        card.className = 'meme-item';
        card.innerHTML = `
            <img src="${meme.url}" alt="${meme.name}" loading="lazy">
            <p>${meme.name}</p>
        `;
        card.addEventListener('click', () => onMemeClick(meme));
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
}

export function renderFavorites(favorites, container, onMemeClick, onUpdateCallback) {
    container.innerHTML = '';

    if (countElement) {
        countElement.textContent = getFavorites().length;
    }
    if (favorites.length === 0) {
        msgElement.classList.remove('hidden');
        return;
    } else {
        msgElement.classList.add('hidden');
    }

    const fragment = document.createDocumentFragment();

    favorites.slice().reverse().forEach(savedMeme => {
        const card = document.createElement('div');
        card.className = 'meme-card';
        card.innerHTML = `
            <img src="${savedMeme.url}" alt="${savedMeme.name}">
            <div class="meme-overlay-text text-top">${savedMeme.topText.replace(/\n/g, '<br>')}</div>
            <div class="meme-overlay-text text-bottom">${savedMeme.bottomText.replace(/\n/g, '<br>')}</div>
            <p class="favorite-title">${savedMeme.name}</p>
            <button class="delete-btn" title="Delete">&times;</button>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) return;
            onMemeClick(savedMeme);
        });

        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to delete this meme from favorites?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#e74c3c',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    removeFavorite(savedMeme.uniqueId);
                    onUpdateCallback();
                    showToast('Meme removed from favorites');
                }
            });
        });
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
}