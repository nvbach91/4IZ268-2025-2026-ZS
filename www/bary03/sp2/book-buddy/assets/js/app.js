document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#search-input');
    const searchBtn = document.querySelector('#search-btn');
    const libraryBtnWrapper = document.querySelector('#library-btn-wrapper');
    const libraryBtn = document.querySelector('#library-btn');
    const libraryPanel = document.querySelector('#library-panel');
    const searchPanel = document.querySelector('#search-panel');
    const results = document.querySelector('#results');

    // Funkce pro přepínání mezi panely
    function showLibrary() {
        searchPanel.classList.add('hidden');
        libraryPanel.classList.remove('hidden');
        libraryBtnWrapper.classList.add('invisible');
        searchInput.value = '';
        updateLibraryPanel();
    }
    
    function showSearch() {
        libraryPanel.classList.add('hidden');
        searchPanel.classList.remove('hidden');
        libraryBtnWrapper.classList.remove('invisible');
    }

    // Obslužná rutina kliknutí na tlačítko „Moje knihovna“
    libraryBtn.addEventListener('click', showLibrary);

    // Základní funkce pro vyhledávání knih
    async function handleSearch(page = 1) {
        const query = searchInput.value.trim();
        if (query.length < 3) {
            createToast('Please enter at least 3 characters to search.');
            return;
        }

        showSearch();
        results.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
            </div>
        `;

        const maxResults = 10;
        const startIndex = (page - 1) * maxResults;
        const { items: books, totalItems } = await BookBuddyAPI.searchBooks(query, startIndex, maxResults);

        
        if (!books.length) {
            results.innerHTML = `
            <div class="message-container">
                <p>No results found.<br>Try a different title or author.</p>
            </div>
            `;
            return;
        }
        
        window.currentSearchResults = books;
        window.currentQuery = query;
        window.currentPage = page;
        window.totalPages = Math.ceil(Math.min(totalItems, 250) / maxResults);

        
        results.innerHTML = `
            <div class="book-list">
                ${books.map((book, index) => `
                <div class="book-card" data-index="${index}">
                    <img src="${book.thumbnail}" alt="${book.title}">
                    <div class="book-info">
                        <h3>${book.title}</h3>
                        <p>${book.authors}</p>
                        <p>Language: ${book.language}</p>
                    </div>
                </div>
                `).join('')}
            </div>
            `;
        
        attachBookCardListeners();
        renderPagination(window.totalPages, window.currentPage, window.currentQuery);
    }



    // Paginace
    function renderPagination(totalPages, currentPage, query) {
        const oldPagination = document.querySelector('.pagination');
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

        // Tlačítko „Zpět“
        pagination.appendChild(
            createButton('‹', currentPage - 1, currentPage === 1)
        );

        // Čísla stránek
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
            pagination.appendChild(createButton(i, i, false, i === currentPage));
            }
        } else {
            pagination.appendChild(createButton(1, 1, false, currentPage === 1));
            if (currentPage > 4) pagination.appendChild(createDots());

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
            pagination.appendChild(createButton(i, i, false, i === currentPage));
            }

            if (currentPage < totalPages - 3) pagination.appendChild(createDots());
            pagination.appendChild(createButton(totalPages, totalPages, false, currentPage === totalPages));
        }

        // Tlačítko „Vpřed“
        pagination.appendChild(
            createButton('›', currentPage + 1, currentPage === totalPages)
        );

        document.querySelector('#results').appendChild(pagination);

        // Dodatečná funkce pro "..."
        function createDots() {
            const span = document.createElement('span');
            span.classList.add('dots');
            span.textContent = '...';
            return span;
        }
    }



    // Spuštění vyhledávání stisknutím tlačítka nebo klávesy Enter
    searchBtn.addEventListener('click', () => handleSearch(1));
    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleSearch(1);
    });



    // Modální okno knihy
    const modal = document.querySelector('#book-modal');
    const modalThumb = document.querySelector('#modal-thumb');
    const modalTitle = document.querySelector('#modal-title');
    const modalAuthor = document.querySelector('#modal-author');
    const modalLang = document.querySelector('#modal-lang');
    const modalDate = document.querySelector('#modal-date');
    const modalDesc = document.querySelector('#modal-desc');
    const closeBtn = document.querySelector('.close-btn');
    const addToWantBtn = document.querySelector('#add-to-want');

    let currentBook = null;

    function openModal(book) {
        currentBook = book;
        modalThumb.src = book.thumbnail;
        modalTitle.textContent = book.title;
        modalAuthor.textContent = book.authors;
        modalLang.textContent = book.language;
        modalDate.textContent = book.publishedDate;
        modalDesc.textContent = book.description;
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        currentBook = null;
    }

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    addToWantBtn.addEventListener('click', () => {
        if (currentBook) {
        saveToLocalStorage(currentBook);
        closeModal();
        }
    });



    // Přidání knihy do lokálního úložiště
    function saveToLocalStorage(book) {
        const library = JSON.parse(localStorage.getItem('library')) || {
            wantToRead: [],
            reading: [],
            finished: []
        };

        const exists = Object.values(library).some(category =>
            category.some(b => b.id === book.id));
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



    // Aktualizace knihovny
    function updateLibraryPanel() {
        const library = JSON.parse(localStorage.getItem('library')) || {
            wantToRead: [],
            reading: [],
            finished: []
        };

        document.querySelector('#count-to-read').textContent = `(${library.wantToRead.length})`;
        document.querySelector('#count-reading').textContent = `(${library.reading.length})`;
        document.querySelector('#count-finished').textContent = `(${library.finished.length})`;

        const sortSettings = JSON.parse(localStorage.getItem('sortSettings')) || {
            wantToRead: 'title',
            reading: 'title',
            finished: 'title'
        };
        
        const categories = [
            { key: 'wantToRead', container: document.querySelector('#to-read') },
            { key: 'reading', container: document.querySelector('#reading') },
            { key: 'finished', container: document.querySelector('#finished') }
        ];
        

        categories.forEach(({ key, container }) => {
            const books = [...library[key]];
            
            const sortBy = sortSettings[key];
            if (sortBy === 'title') {
                books.sort((a, b) => a.title.localeCompare(b.title));
            } else if (sortBy === 'date') {
                books.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
            }
            
            container.innerHTML = books.length
            ? books.map(book => `
                <div class="book-card" draggable="true" data-id="${book.id}" data-category="${key}">
                    <img src="${book.thumbnail}" alt="${book.title}">
                    <div class="book-info">
                        <h4>${book.title}</h4>
                        <p>${book.authors}</p>
                    </div>
                </div>
                `).join('')
            :  `
                <div class="empty-shelf" data-category="${key}">
                    <img src="./assets/images/add.svg" alt="Add Book">
                    <p>Drag the book here</p>
                </div>`;
             });

        if (!('ontouchstart' in window)) {
            enableDragAndDrop();
        }
        attachLibraryCardListeners();

        document.querySelectorAll('.sort-select').forEach(select => {
            select.value = sortSettings[select.dataset.category];
            select.addEventListener('change', e => {
                sortSettings[e.target.dataset.category] = e.target.value;
                localStorage.setItem('sortSettings', JSON.stringify(sortSettings));
                updateLibraryPanel();
            });
        });
    }



    // Kliknutím na knihu v knihovně → se otevře modální okno
    function attachLibraryCardListeners() {
        document.querySelectorAll('.book-card').forEach(card => {
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



    // Přidávání kliknutí do výsledků vyhledávání
    function attachBookCardListeners() {
        document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = card.dataset.index;
            openModal(window.currentSearchResults[index]);
        });
        });
    }



    // Drag & Drop (přetahování knih)
    function enableDragAndDrop() {
        const bookCards = document.querySelectorAll('.book-card');
        const shelves = document.querySelectorAll('.shelf');

        bookCards.forEach(card => {
            card.addEventListener('dragstart', e => {
                e.dataTransfer.setData('bookId', card.dataset.id);
                e.dataTransfer.setData('fromCategory', card.dataset.category);
                setTimeout(() => card.classList.add('dragging'), 0);
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        shelves.forEach(shelf => {
            shelf.addEventListener('dragover', e => {
                e.preventDefault();
                shelf.classList.add('drag-over');
            });

            shelf.addEventListener('dragleave', () => {
                shelf.classList.remove('drag-over');
            });

            shelf.addEventListener('drop', e => {
                e.preventDefault();
                shelf.classList.remove('drag-over');

                const bookId = e.dataTransfer.getData('bookId');
                const fromCategory = e.dataTransfer.getData('fromCategory');
                const bookList = shelf.querySelector('.book-list');
                const emptyZone = shelf.querySelector('.empty-shelf');

                let toCategory = null;
                if (bookList) {
                    toCategory = bookList.id;
                } else if (emptyZone) {
                    toCategory = emptyZone.dataset.category; 
                }

                if (!toCategory) return;

                moveBookBetweenCategories(bookId, fromCategory, toCategory);
            });
        });
    }

    
    
    // Přechod mezi kategoriemi
    function moveBookBetweenCategories(bookId, fromCategory, toCategory) {
        if (!bookId || !toCategory) return;
        if (fromCategory === toCategory) return;

        const keyMap = {
            'to-read': 'wantToRead',
            'wantToRead': 'wantToRead',
            'reading': 'reading',
            'finished': 'finished'
        };

        const fromKey = keyMap[fromCategory] || fromCategory;
        const toKey = keyMap[toCategory] || toCategory;

        const library = JSON.parse(localStorage.getItem('library')) || {
            wantToRead: [],
            reading: [],
            finished: []
        };

        let book = null;
        for (const key in library) {
            const found = library[key].find(b => b.id === bookId);
            if (found) {
                book = found;
                library[key] = library[key].filter(b => b.id !== bookId);
            }
        }

        if (!book) {
            console.warn('Book not found in library:', bookId);
            return;
        }

        if (!library[toKey]) {
            console.error('Invalid target category:', toKey);
            return;
        }

        library[toKey].push(book);

        localStorage.setItem('library', JSON.stringify(library));
        updateLibraryPanel();
        }


    // Modální okno knihy
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

    let selectedBook = null;
    let selectedCategory = null;

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

        const moveButtonsContainer = document.querySelector('#move-buttons');
        moveButtonsContainer.innerHTML = getMoveButtonsHTML(category);

        moveButtonsContainer.querySelectorAll('.move-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const toCategory = btn.dataset.to;
                moveBookBetweenCategories(book.id, category, toCategory);
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

    libCloseBtn.addEventListener('click', closeLibraryModal);

    libModal.addEventListener('click', e => {
    if (e.target === libModal) closeLibraryModal();
    });

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

    function getMoveButtonsHTML(currentCategory) {
        const options = {
            wantToRead: [
                { to: 'reading', label: 'Move to "Reading"' }
            ],
            reading: [
                { to: 'wantToRead', label: 'Move to "Want to read"' },
                { to: 'finished', label: 'Move to "Finished"' }
            ],
            finished: [
                { to: 'reading', label: 'Move to "Reading"' }
            ]
        };

        if (!options[currentCategory]) return '';
        return options[currentCategory]
            .map(opt => `<button class="move-btn" data-to="${opt.to}">${opt.label}</button>`)
            .join('');
    }
    


    // Custom upozornění (nahrazuje alert)
    function createToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // potvrzovací okno místo alert()
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
        </div>
        `;
        document.body.appendChild(box);
        document.getElementById('confirm-yes').onclick = () => {
            onConfirm();
            box.remove();
        };
        document.getElementById('confirm-no').onclick = () => box.remove();
    }
    


    // Pokud se jedná o dotykové zařízení, přidejte třídu pro mobilní zařízení
    if ('ontouchstart' in window) {
        document.body.classList.add('is-touch');
    }
        

    
    // Obnovení knihovny při načítání stránky
    updateLibraryPanel();

    // Zobrazit knihovnu jako spouštěcí panel
    showLibrary();

});