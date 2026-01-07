/**
 * Dashboard View
 */
import { appStore } from '../store.js';
import { Router } from '../router.js';
import { UI } from '../ui.js';

export function renderDashboard() {
    const app = document.getElementById('app');
    const library = appStore.getLibrary();
    const favorites = library.filter(g => g.isFavorite);
    const recent = library[0];
    const profile = appStore.getProfile();

    // Icons available for selection
    const icons = ['bi-controller', 'bi-joystick', 'bi-person-circle', 'bi-robot', 'bi-stars', 'bi-trophy-fill'];
    // Colors available
    const colors = ['#00e676', '#bb86fc', '#03dac6', '#ff4081', '#536dfe', '#ffea00'];

    // Recent 3 added games (First 3 in library array)
    const recentAdded = library.slice(0, 3);

    app.innerHTML = `
        <div class="row g-4 mb-5">
            <!-- Profile Section -->
            <div class="col-lg-12">
                <div class="card bg-dark border-secondary p-4 d-flex flex-row align-items-center gap-4 shadow-lg profile-card profile-card-bg">
                    <!-- Avatar -->
                    <div class="position-relative">
                        <div class="avatar-circle shadow profile-avatar-bg">
                            <i class="bi ${profile.icon} text-dark fs-1"></i>
                        </div>
                        <button class="btn btn-dark border position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center p-0 edit-btn-pos" id="edit-profile-btn" title="Edit Profile">
                            <i class="bi bi-pencil-fill small text-white fs-tiny"></i>
                        </button>
                    </div>
                    
                    <!-- Welcome Text -->
                    <div class="flex-grow-1">
                        <h4 class="text-muted mb-0 uppercase small spacing-2">Welcome Back</h4>
                        <h1 class="display-5 fw-bold text-white mb-0" id="profile-name-display">${profile.name}</h1>
                        <p class="text-muted mt-2 mb-0"><i class="bi bi-clock-history"></i> Last added: ${recent ? recent.name : 'No games yet'}</p>
                    </div>

                    <!-- Quick Stats (Desktop) -->
                    <div class="d-none d-md-flex gap-4 text-end">
                        <div class="border-end border-secondary pe-4">
                            <div class="fs-2 fw-bold text-white">${library.length}</div>
                            <div class="text-muted small uppercase">My Games</div>
                        </div>
                        <div>
                            <div class="fs-2 fw-bold text-white">${favorites.length}</div>
                            <div class="text-muted small uppercase">Favorites</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Profile Editor Modal -->
        <div class="modal fade" id="profileModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content bg-dark border-secondary">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title">Edit Profile</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Username</label>
                            <input type="text" id="edit-name" class="form-control bg-black text-white border-secondary">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Avatar Color (Themes)</label>
                            <div class="d-flex gap-2 flex-wrap">
                                ${colors.map((c, index) => `
                                    <div class="color-swatch rounded-circle pointer border color-swatch-select theme-bg-${index}" 
                                         data-color="${c}"></div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Avatar Icon</label>
                            <div class="d-flex gap-2 flex-wrap text-white fs-4">
                                ${icons.map(i => `
                                    <i class="bi ${i} p-2 rounded pointer hover-bg icon-select-item" 
                                       data-icon="${i}"></i>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-primary w-100" id="save-profile-btn">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Favorites Showcase -->
        <section class="mb-5">
            <h3 class="section-title mb-3">Your Last Favorites</h3>
            <div class="row row-cols-1 row-cols-md-3 g-4" id="fav-grid">
                ${favorites.length > 0
            ? favorites.slice(0, 3).map((g) => `
                        <div class="col animate-fade-up">
                            <div class="card bg-dark border-secondary h-100 game-card-hover cursor-pointer overflow-hidden game-card-link" data-id="${g.id}">
                                <img src="${g.background_image}" class="card-img-top opacity-75 discover-card-img">
                                <div class="card-img-overlay d-flex flex-column justify-content-end gradient-overlay p-4">
                                    <h5 class="card-title text-white text-shadow fw-bold mb-1">${g.name}</h5>
                                    <div class="d-flex gap-2">
                                        <span class="badge bg-danger text-white small">★ Favorite</span>
                                        <span class="badge bg-primary text-dark small">${g.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>`).join('')
            : '<div class="col-12 text-muted">No favorites yet.</div>'
        }
            </div>
        </section>

        <!-- Recently Added Section -->
        <section>
            <div class="d-flex justify-content-between align-items-end mb-3">
                 <h3 class="section-title mb-0">Recently Added</h3>
                 <a href="#library" class="btn btn-outline-secondary btn-sm">View Full Library <i class="bi bi-arrow-right"></i></a>
            </div>
            <div class="row row-cols-1 row-cols-md-3 g-4" id="recent-grid">
                 ${recentAdded.length > 0
            ? recentAdded.map((g) => `
                        <div class="col animate-fade-up">
                            <div class="card bg-dark border-secondary h-100 game-card-hover cursor-pointer overflow-hidden game-card-link" data-id="${g.id}">
                                <img src="${g.background_image}" class="card-img-top opacity-75 discover-card-img-small">
                                <div class="card-body">
                                    <h6 class="card-title text-white text-truncate">${g.name}</h6>
                                    <small class="text-muted">Added: ${dayjs(g.addedAt).format('MMM D')}</small>
                                </div>
                            </div>
                        </div>`).join('')
            : '<div class="col-12 text-muted">Library is empty.</div>'
        }
            </div>
        </section>
    `;

    // Add Event Listeners for Game Cards (Event Delegation)
    app.querySelectorAll('.game-card-link').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            if (id) Router.navigate(`game/${id}`);
        });
    });

    // Initialize Modal
    const modalEl = document.getElementById('profileModal');
    const modal = new bootstrap.Modal(modalEl);

    // Profile State for Editing
    let editState = { ...profile };

    // Listeners
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
        // Reset state on open
        editState = { ...appStore.getProfile() };

        // Reset UI Selection
        document.getElementById('edit-name').value = editState.name;

        // Reset Color Selection UI
        modalEl.querySelectorAll('.color-swatch').forEach(el => {
            el.classList.remove('border-white', 'border-2');
            if (el.dataset.color === editState.color) {
                el.classList.add('border-white', 'border-2');
            }
        });

        // Reset Icon Selection UI
        modalEl.querySelectorAll('[data-icon]').forEach(el => {
            el.classList.remove('text-primary', 'border', 'border-primary');
            if (el.dataset.icon === editState.icon) {
                el.classList.add('text-primary', 'border', 'border-primary');
            }
        });

        modal.show();
    });

    // Color Pickers
    modalEl.querySelectorAll('.color-swatch').forEach(el => {
        el.addEventListener('click', () => {
            editState.color = el.dataset.color;
            // Update UI selection
            modalEl.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('border-white', 'border-2'));
            el.classList.add('border-white', 'border-2'); // Add white border to selected
        });
    });

    // Icon Pickers
    modalEl.querySelectorAll('[data-icon]').forEach(el => {
        el.addEventListener('click', () => {
            editState.icon = el.dataset.icon;
            // Update UI selection
            modalEl.querySelectorAll('[data-icon]').forEach(i => i.classList.remove('text-primary', 'border', 'border-primary'));
            el.classList.add('text-primary', 'border', 'border-primary');
        });
    });

    document.getElementById('save-profile-btn').addEventListener('click', () => {
        const newName = document.getElementById('edit-name').value.trim();
        if (newName) editState.name = newName;

        appStore.saveProfile(editState);

        // Apply Global Theme
        document.documentElement.style.setProperty('--primary-color', editState.color);

        modal.hide();
        renderDashboard(); // Re-render
        UI.showToast('Profile Updated!');
    });
}
