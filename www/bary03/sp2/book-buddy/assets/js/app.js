document.addEventListener('DOMContentLoaded', () => {

    /* =====================
       DOM ELEMENTS
    ====================== */
    const searchInput = document.querySelector('#search-input');
    const searchBtn = document.querySelector('#search-btn');
    const libraryBtnWrapper = document.querySelector('#library-btn-wrapper');
    const libraryBtn = document.querySelector('#library-btn');
    const libraryPanel = document.querySelector('#library-panel');
    const searchPanel = document.querySelector('#search-panel');
    const results = document.querySelector('#results');

    const sortSelects = document.querySelectorAll('.sort-select');
    const moveButtonsContainer = document.querySelector('#move-buttons');
    const oldPagination = document.querySelector('.pagination');



    const modal = document.querySelector('#book-modal');
    const modalThumb = document.querySelector('#modal-thumb');
    const modalTitle = document.querySelector('#modal-title');
    const modalAuthor = document.querySelector('#modal-author');
    const modalLang = document.querySelector('#modal-lang');
    const modalDate = document.querySelector('#modal-date');
    const modalDesc = document.querySelector('#modal-desc');
    const closeBtn = document.querySelector('.close-btn');
    const addToWantBtn = document.querySelector('#add-to-want');

    const libModal = document.querySelector('#library-modal');
    const libThumb = document.querySelector('#lib-modal-thumb');
    const libTitle = document.querySelector('#lib-modal-title');
    const libAuthor = document.querySelector('#lib-modal-author');
    const libLang = document.querySelector('#lib-modal-lang');
    const libDate = document.querySelector('#lib-modal-date');
    const libDesc = document.querySelector('#lib-modal-desc');
    const libLink = document.querySelector('#lib-modal-link');
    const removeBtn = document.querySelector('#remove-btn');
    const libCloseBtn = libModal.querySelector('.close-btn');

    const countToRead = document.querySelector('#count-to-read');
    const countReading = document.querySelector('#count-reading');
    const countFinished = document.querySelector('#count-finished');
    const toRead = document.querySelector('#to-read');
    const reading = document.querySelector('#reading');
    const finished = document.querySelector('#finished');

    /* =====================
       APPLICATION STATE
    ====================== */
    let currentSearchResults = [];
    let currentQuery = '';
    let currentPage = 1;
    let totalPages = 1;
    let currentBook = null;
    let selectedBook = null;
    let selectedCategory = null;

    const DEFAULT_LIBRARY = {
        wantToRead: [],
        reading: [],
        finished: []
    };

    /* =====================
       PANEL NAVIGATION
    ====================== */
    function showLibrary() {
        updateLibraryPanel();
        searchPanel.classList.add('hidden');
        libraryPanel.classList.remove('hidden');
        libraryBtnWrapper.classList.add('invisible');
        searchInput.value = '';
    }

    function showSearch() {
        libraryPanel.classList.add('hidden');
        searchPanel.classList.remove('hidden');
        libraryBtnWrapper.classList.remove('invisible');
    }

    libraryBtn.addEventListener('click', showLibrary);

    /* =====================
       SEARCH
    ====================== */
    async function handleSearch(page = 1) {
        const query = searchInput.value.trim();
        if (query.length < 3) {
            createToast('Please enter at least 3 characters to search.');
            return;
        }

        showSearch();
        results.innerHTML = `<div class="loading-container"><div class="spinner"></div></div>`;

        const maxResults = 10;
        const startIndex = (page - 1) * maxResults;
        const { items: books, totalItems } = await BookBuddyAPI.searchBooks(query, startIndex, maxResults);

        if (!books.length) {
            results.innerHTML = `<div class="message-container"><p>No results found.<br>Try a different title or author.</p></div>`;
            return;
        }

        currentSearchResults = books;
        currentQuery = query;
        currentPage = page;
        totalPages = Math.ceil(Math.min(totalItems, 250) / maxResults);

        renderSearchResults(books);
        renderPagination(totalPages, currentPage, currentQuery);
    }

    searchBtn.addEventListener('click', () => handleSearch(1));
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(1); });

    function renderSearchResults(books) {
        results.innerHTML = `
            <div class="book-list">
                ${books.map((book, index) => {
            const alreadyInLibrary = isBookInLibrary(book.id);
            return `
                    <div class="book-card ${alreadyInLibrary ? 'in-library' : ''}" data-index="${index}">
                        <img src="${book.thumbnail}" alt="${book.title}">
                        <div class="book-info">
                            <h3>${book.title}</h3>
                            <p>${book.authors}</p>
                            <p>Language: ${book.language}</p>
                            ${alreadyInLibrary ? `<span class="already-in-library">Already in library</span>` : ``}
                            ${book.categories.length ? `
                                <div class="categories">
                                    ${book.categories.map(cat => `<span class="category-badge">${cat}</span>`).join('')}
                                </div>` : ''}
                        </div>
                    </div>`;
        }).join('')}
            </div>
        `;
        attachBookCardListeners();
    }


    function renderPagination(totalPages, currentPage, query) {
        if (oldPagination) oldPagination.remove();

        const pagination = document.createElement('div');
        pagination.classList.add('pagination');

        const createButton = (text, page, disabled = false, isActive = false) => {
            const btn = document.createElement('button');
            btn.classList.add('page-btn');
            if (isActive) btn.classList.add('active');
            if (disabled) btn.disabled = true;
            btn.textContent = text;
            btn.addEventListener('click', () => handleSearch(page));
            return btn;
        };

        pagination.appendChild(createButton('‹', currentPage - 1, currentPage === 1));

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pagination.appendChild(createButton(i, i, false, i === currentPage));
        } else {
            pagination.appendChild(createButton(1, 1, false, currentPage === 1));
            if (currentPage > 4) pagination.appendChild(createDots());
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pagination.appendChild(createButton(i, i, false, i === currentPage));
            if (currentPage < totalPages - 3) pagination.appendChild(createDots());
            pagination.appendChild(createButton(totalPages, totalPages, false, currentPage === totalPages));
        }

        pagination.appendChild(createButton('›', currentPage + 1, currentPage === totalPages));
        results.appendChild(pagination);

        function createDots() {
            const span = document.createElement('span');
            span.classList.add('dots');
            span.textContent = '...';
            return span;
        }
    }

    /* =====================
       MODAL (SEARCH BOOK)
    ====================== */
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    addToWantBtn.addEventListener('click', () => {
        if (!currentBook) return;
        saveToLocalStorage(currentBook);
        if (!searchPanel.classList.contains('hidden')) renderSearchResults(currentSearchResults);
        closeModal();
    });

    function openModal(book) {
        currentBook = book;
        modalThumb.src = book.thumbnail;
        modalTitle.textContent = book.title;
        modalAuthor.textContent = book.authors;
        modalLang.textContent = book.language;
        modalDate.textContent = book.publishedDate;
        modalDesc.textContent = book.description;
        addToWantBtn.style.display = isBookInLibrary(book.id) ? 'none' : 'inline-block';
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        addToWantBtn.style.display = 'inline-block';
        currentBook = null;
    }

    function attachBookCardListeners() {
        const AllBookCard = document.querySelectorAll('.book-card')
        AllBookCard.forEach(card => {
            card.addEventListener('click', () => {
                const index = card.dataset.index;
                openModal(currentSearchResults[index]);
            });
        });
    }

    /* =====================
       LIBRARY
    ====================== */
    function isBookInLibrary(bookId) {
        const library = JSON.parse(localStorage.getItem('library')) || DEFAULT_LIBRARY;
        return Object.values(library).some(category => category.some(book => book.id === bookId));
    }

    function saveToLocalStorage(book) {
        const library = JSON.parse(localStorage.getItem('library')) || DEFAULT_LIBRARY;
        const exists = Object.values(library).some(category => category.some(b => b.id === book.id));
        if (!exists) {
            book.addedAt = new Date().toISOString();
            library.wantToRead.push(book);
            localStorage.setItem('library', JSON.stringify(library));
            createToast(`"${book.title}" added to "Want to Read"`);
            updateLibraryPanel();
        } else {
            createToast(`This book is already in your library.`);
        }
    }

    function updateLibraryPanel() {
        const library = JSON.parse(localStorage.getItem('library')) || DEFAULT_LIBRARY;

        countToRead.textContent = `(${library.wantToRead.length})`;
        countReading.textContent = `(${library.reading.length})`;
        countFinished.textContent = `(${library.finished.length})`;

        const sortSettings = JSON.parse(localStorage.getItem('sortSettings')) || {
            wantToRead: 'title',
            reading: 'title',
            finished: 'title'
        };

        const categories = [
            { key: 'wantToRead', container: toRead },
            { key: 'reading', container: reading },
            { key: 'finished', container: finished }
        ];

        categories.forEach(({ key, container }) => {
            const books = [...library[key]];
            const sortBy = sortSettings[key];
            if (sortBy === 'title') books.sort((a, b) => a.title.localeCompare(b.title));
            else if (sortBy === 'date') books.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));

            container.innerHTML = books.length
                ? books.map(book => `
                    <div class="book-card" draggable="true" data-id="${book.id}" data-category="${key}">
                        <img src="${book.thumbnail}" alt="${book.title}">
                        <div class="book-info">
                            <h4>${book.title}</h4>
                            <p>${book.authors}</p>
                            <p class="added-date">Added: ${formatDate(book.addedAt)}</p>
                            ${book.categories.length ? `
                                <div class="categories">
                                    ${book.categories.map(cat => `<span class="category-badge">${cat}</span>`).join('')}
                                </div>` : ''}
                        </div>
                    </div>`).join('')
                : `<div class="empty-shelf" data-category="${key}">
                        <img src="./assets/images/add.svg" alt="Add Book">
                        <p>Drag the book here</p>
                   </div>`;
        });

        if (!('ontouchstart' in window)) enableDragAndDrop();
        attachLibraryCardListeners();

        sortSelects.forEach(select => {
            select.value = sortSettings[select.dataset.category] || 'title';
        });
    }

    function attachLibraryCardListeners() {
        const AllBookCard = document.querySelectorAll('.book-card')
        AllBookCard.forEach(card => {
            card.addEventListener('click', () => {
                const bookId = card.dataset.id;
                const category = card.dataset.category;
                const library = JSON.parse(localStorage.getItem('library')) || {};
                if (!library[category]) return;
                const book = library[category].find(b => b.id === bookId);
                if (book) openLibraryModal(book, category);
            });
        });
    }

    /* =====================
       DRAG & DROP
    ====================== */
    function enableDragAndDrop() {
        const bookCards = document.querySelectorAll('.book-card');
        const shelves = document.querySelectorAll('.shelf');

        bookCards.forEach(card => {
            card.removeEventListener('dragstart', handleDragStart);
            card.removeEventListener('dragend', handleDragEnd);
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });

        shelves.forEach(shelf => {
            shelf.removeEventListener('dragover', handleDragOver);
            shelf.removeEventListener('dragleave', handleDragLeave);
            shelf.removeEventListener('drop', handleDrop);
            shelf.addEventListener('dragover', handleDragOver);
            shelf.addEventListener('dragleave', handleDragLeave);
            shelf.addEventListener('drop', handleDrop);
        });
    }

    function handleDragStart(e) {
        e.dataTransfer.setData('bookId', this.dataset.id);
        e.dataTransfer.setData('fromCategory', this.dataset.category);
        setTimeout(() => this.classList.add('dragging'), 0);
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        const bookId = e.dataTransfer.getData('bookId');
        const fromCategory = e.dataTransfer.getData('fromCategory');

        let toCategory = null;
        const bookList = this.querySelector('.book-list');
        const emptyZone = this.querySelector('.empty-shelf');

        if (bookList) toCategory = bookList.id;
        else if (emptyZone) toCategory = emptyZone.dataset.category;
        if (!toCategory) return;

        moveBookBetweenCategories(bookId, fromCategory, toCategory);
    }

    function moveBookBetweenCategories(bookId, fromCategory, toCategory) {
        if (!bookId || !toCategory || fromCategory === toCategory) return;

        const keyMap = { 'to-read': 'wantToRead', 'wantToRead': 'wantToRead', 'reading': 'reading', 'finished': 'finished' };
        const fromKey = keyMap[fromCategory] || fromCategory;
        const toKey = keyMap[toCategory] || toCategory;

        const library = JSON.parse(localStorage.getItem('library')) || DEFAULT_LIBRARY;
        let book = null;
        for (const key in library) {
            const found = library[key].find(b => b.id === bookId);
            if (found) {
                book = found;
                library[key] = library[key].filter(b => b.id !== bookId);
            }
        }
        if (!book) return;
        library[toKey].push(book);

        localStorage.setItem('library', JSON.stringify(library));
        updateLibraryPanel();
    }

    /* =====================
       LIBRARY MODAL
    ====================== */
    libCloseBtn.addEventListener('click', closeLibraryModal);
    libModal.addEventListener('click', e => { if (e.target === libModal) closeLibraryModal(); });

    removeBtn.addEventListener('click', () => {
        if (!selectedBook || !selectedCategory) return;
        createConfirm(`Are you sure you want to delete "${selectedBook.title}"?`, () => {
            const library = JSON.parse(localStorage.getItem('library'));
            library[selectedCategory] = library[selectedCategory].filter(b => b.id !== selectedBook.id);
            localStorage.setItem('library', JSON.stringify(library));
            updateLibraryPanel();
            closeLibraryModal();
        });
    });

    function openLibraryModal(book, category) {
        selectedBook = book;
        selectedCategory = category;

        libThumb.src = book.thumbnail;
        libTitle.textContent = book.title;
        libAuthor.textContent = book.authors;
        libLang.textContent = book.language;
        libDate.textContent = book.publishedDate;
        libDesc.textContent = book.description || 'No description available.';
        libLink.href = book.infoLink || '#';
        libLink.style.display = book.infoLink ? 'inline-block' : 'none';

        moveButtonsContainer.innerHTML = getMoveButtonsHTML(category);
        moveButtonsContainer.querySelectorAll('.move-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                moveBookBetweenCategories(book.id, category, btn.dataset.to);
                closeLibraryModal();
            });
        });

        libModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }

    function closeLibraryModal() {
        libModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        selectedBook = null;
        selectedCategory = null;
    }

    function getMoveButtonsHTML(currentCategory) {
        const options = {
            wantToRead: [{ to: 'reading', label: 'Move to "Reading"' }],
            reading: [
                { to: 'wantToRead', label: 'Move to "Want to read"' },
                { to: 'finished', label: 'Move to "Finished"' }
            ],
            finished: [{ to: 'reading', label: 'Move to "Reading"' }]
        };
        if (!options[currentCategory]) return '';
        return options[currentCategory].map(opt => `<button class="move-btn" data-to="${opt.to}">${opt.label}</button>`).join('');
    }

    /* =====================
       HELPERS
    ====================== */
    function formatDate(isoString) {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('cs-CZ');
    }

    function createToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function createConfirm(message, onConfirm) {
        const box = document.createElement('div');
        box.className = 'confirm-box';
        box.innerHTML = `
            <div class="confirm-content">
                <p>${message}</p>
                <div class="confirm-actions">
                    <button id="confirm-yes">Yes</button>
                    <button id="confirm-no">No</button>
                </div>
            </div>`;
        document.body.appendChild(box);

        const confirmYesBtn = box.querySelector('.confirm-yes');
        const confirmNoBtn = box.querySelector('.confirm-no');
        confirmYesBtn.addEventListener('click', () => {
            onConfirm();
            box.remove();
        });

        confirmNoBtn.addEventListener('click', () => {
            box.remove();
        });
    }

    /* =====================
       SORT SELECT LISTENERS (add only once)
    ====================== */
    sortSelects.forEach(select => {
        select.addEventListener('change', e => {
            const sortSettings = JSON.parse(localStorage.getItem('sortSettings')) || {
                wantToRead: 'title',
                reading: 'title',
                finished: 'title'
            };
            sortSettings[e.target.dataset.category] = e.target.value;
            localStorage.setItem('sortSettings', JSON.stringify(sortSettings));
            updateLibraryPanel();
        });
    });

    /* =====================
       TOUCH DEVICE SUPPORT
    ====================== */
    if ('ontouchstart' in window) {
        document.body.classList.add('is-touch');
    }

    /* =====================
       INITIAL LOAD
    ====================== */
    showLibrary();
});
