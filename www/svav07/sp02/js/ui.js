/**
 * UI Utilities
 */

export const UI = {
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const id = `toast-${Date.now()}`;

        const html = `
            <div id="${id}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        // Append to container (using simple parse)
        container.insertAdjacentHTML('beforeend', html);

        // Init Bootstrap Toast
        const el = document.getElementById(id);
        const toast = new bootstrap.Toast(el, { delay: 3000 });
        toast.show();

        // Cleanup after hidden
        el.addEventListener('hidden.bs.toast', () => {
            el.remove();
        });
    },

    showLoader(elementId = 'app') {
        const el = document.getElementById(elementId);
        if (el) {
            el.innerHTML = `
                <div class="text-center mt-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
        }
    },

    createCard(game, isSaved = false) {
        // Use dayjs via global window object
        const date = game.released ? dayjs(game.released).format('MMM D, YYYY') : 'TBA';
        const image = game.background_image || 'asset/spinning-fish.gif';

        const div = document.createElement('div');
        div.className = 'col';
        div.innerHTML = `
            <div class="card game-card h-100" data-game-id="${game.id}">
                <img src="${image}" class="card-img-top" alt="${game.name}" loading="lazy">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title text-truncate w-75" title="${game.name}">${game.name}</h5>
                        <span class="badge bg-warning text-dark">★ ${game.rating || 0}</span>
                    </div>
                    <p class="card-text small text-muted mb-auto">Released: ${date}</p>
                    <div class="mt-3">
                        ${isSaved
                ? `<span class="badge bg-success w-100 py-2"><i class="bi bi-check"></i> In Library</span>`
                : `<button class="btn btn-sm btn-primary w-100 add-btn">Add to Library</button>`
            }
                    </div>
                </div>
            </div>
        `;
        return div;
    },

    showConfirmModal(title, message, onConfirm) {
        const modalEl = document.getElementById('confirmation-modal');
        const titleEl = document.getElementById('confirm-title');
        const bodyEl = document.getElementById('confirm-body');
        const btn = document.getElementById('confirm-btn');

        if (!modalEl || !titleEl || !bodyEl || !btn) return;

        titleEl.textContent = title;
        bodyEl.textContent = message;

        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        const modal = new bootstrap.Modal(modalEl);

        newBtn.addEventListener('click', () => {
            onConfirm();
            modal.hide();
        });

        modal.show();
    }
};
